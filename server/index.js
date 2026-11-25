// API de PROJECTSIA: cuentas, proyectos, administración y proxy de IA.
// La clave de Groq vive solo aquí (variable de entorno), nunca en el navegador.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import express from 'express';
import Database from 'better-sqlite3';
import nodemailer from 'nodemailer';
import { evaluarCoherencia } from '../src/services/coherencia.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const envFile = path.join(here, '.env');
if (fs.existsSync(envFile) && typeof process.loadEnvFile === 'function') process.loadEnvFile(envFile);

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || '127.0.0.1';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
const GROQ_URL = process.env.GROQ_URL || 'https://api.groq.com/openai/v1/chat/completions';
// Los modelos gpt-oss razonan antes de responder; con esfuerzo bajo gastan menos tokens y no cortan la respuesta.
// Clave de OpenAlex para la búsqueda de artículos (cupo propio en vez del compartido por red). Vive solo aquí.
const OPENALEX_API_KEY = process.env.OPENALEX_API_KEY || '';
// Clave opcional de Semantic Scholar (sin ella comparte un cupo público que casi siempre está agotado).
const SEMANTIC_SCHOLAR_API_KEY = process.env.SEMANTIC_SCHOLAR_API_KEY || '';
// Rulex Data: normas y jurisprudencia de Colombia para el Marco legal (https://rulex.org/docs/api).
const RULEX_API_KEY = process.env.RULEX_API_KEY || '';
const GROQ_REASONING_EFFORT = process.env.GROQ_REASONING_EFFORT || 'low';
const DB_PATH = process.env.DB_PATH || path.join(here, 'data', 'projectsia.db');
const IS_PROD = process.env.NODE_ENV === 'production';
const APP_URL = (process.env.APP_URL || 'http://localhost:5199').replace(/\/$/, '');

// Cuenta de administrador inicial. Debe cambiar la contraseña en su primer ingreso.
const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
const ADMIN_INITIAL_PASSWORD = process.env.ADMIN_INITIAL_PASSWORD || 'admin';

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER;
// A dónde llegan las alertas (por defecto, el mismo buzón de la app). «off» desactiva el envío.
const ALERT_EMAIL = process.env.ALERT_EMAIL || MAIL_FROM;
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(path.dirname(DB_PATH), 'backups');
const BACKUP_KEEP = 30;
const RESET_MINUTES = 60;

const SESSION_COOKIE = 'psia_session';
const SESSION_DAYS = 30;
const ACTIVATION_HOURS = 48;
const MAX_PROJECTS = 20;
// Cuántos proyectos puede crear una cuenta recién activada. 0 = ninguno hasta que el administrador lo autorice.
const DEFAULT_PROJECT_LIMIT = Math.min(MAX_PROJECTS, Math.max(0, parseInt(process.env.DEFAULT_PROJECT_LIMIT ?? '0', 10) || 0));
const MAX_PROJECT_BYTES = 512 * 1024;
const MAX_MEMBERS = 6;
const VERSION_EVERY_MS = 10 * 60 * 1000; // una copia por cada 10 minutos de trabajo
const MAX_VERSIONS = 40;
const MAX_FILE_BYTES = 1500 * 1024;
const MAX_FILES = 30;
const MAX_RESPONSES = 2000;

/* ---------- Base de datos ---------- */

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    data TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS email_tokens (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    purpose TEXT NOT NULL,
    expires_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id, updated_at);
  CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_email_tokens_user ON email_tokens(user_id);
`);

// Migraciones: columnas añadidas después de la primera versión.
const addColumn = (table, column, definition) => {
    const exists = db.prepare(`PRAGMA table_info(${table})`).all().some((col) => col.name === column);
    if (!exists) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
};
addColumn('users', 'role', "TEXT NOT NULL DEFAULT 'student'");
addColumn('users', 'status', "TEXT NOT NULL DEFAULT 'active'"); // pending | active | blocked
addColumn('users', 'must_change_password', 'INTEGER NOT NULL DEFAULT 0');
addColumn('users', 'last_login_at', 'TEXT');
// Roles: admin | teacher (profesor) | student (estudiante) | researcher (investigador). Los asigna el administrador.
// `teacher_id`: el profesor que tiene a cargo a un estudiante.
addColumn('users', 'teacher_id', 'INTEGER');
addColumn('users', 'grupo', "TEXT NOT NULL DEFAULT ''"); // curso o grupo al que pertenece la cuenta (lo pone el administrador)
// Registro de lo que hacen el administrador y los profesores con las cuentas: quién, qué y cuándo.
db.exec(`CREATE TABLE IF NOT EXISTS admin_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at INTEGER NOT NULL,
    actor_id INTEGER,
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    detail TEXT NOT NULL DEFAULT ''
)`);
// Cupo de proyectos que el administrador le autoriza a cada cuenta.
if (!db.prepare('PRAGMA table_info(users)').all().some((col) => col.name === 'project_limit')) {
    db.exec('ALTER TABLE users ADD COLUMN project_limit INTEGER NOT NULL DEFAULT 0');
    // Quienes ya tenían proyectos antes de esta regla conservan su cupo (al menos lo que ya crearon).
    db.exec('UPDATE users SET project_limit = MAX(1, (SELECT COUNT(*) FROM projects WHERE projects.user_id = users.id)) WHERE id IN (SELECT user_id FROM projects)');
}
addColumn('projects', 'version', 'INTEGER NOT NULL DEFAULT 1');
// Quién guardó por última vez cada campo y en qué versión: { campo: [version, userId] }. Sirve para detectar choques.
addColumn('projects', 'key_meta', "TEXT NOT NULL DEFAULT '{}'");
db.exec(`
  -- Encuestas en línea: un instrumento del proyecto publicado con un enlace, y sus respuestas anónimas.
  CREATE TABLE IF NOT EXISTS surveys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    instrument_id TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    token TEXT NOT NULL,
    definition TEXT NOT NULL,
    open INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (project_id, instrument_id)
  );
  CREATE TABLE IF NOT EXISTS survey_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    survey_id INTEGER NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    answers TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_responses_survey ON survey_responses(survey_id);
  CREATE TABLE IF NOT EXISTS error_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kind TEXT NOT NULL,
    user_id INTEGER,
    message TEXT NOT NULL,
    detail TEXT,
    created_at INTEGER NOT NULL
  );
`);
db.exec(`
  -- Equipo: compañeros invitados por correo (pueden editar; solo el dueño invita o elimina el proyecto).
  CREATE TABLE IF NOT EXISTS project_members (
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    added_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (project_id, email)
  );
  CREATE INDEX IF NOT EXISTS idx_members_email ON project_members(email);
  -- Historial: copias automáticas del contenido antes de cada tanda de cambios.
  CREATE TABLE IF NOT EXISTS project_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER,
    data TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_versions_project ON project_versions(project_id, created_at);
  -- Figuras subidas por los estudiantes (fuera del JSON del proyecto para no inflarlo).
  CREATE TABLE IF NOT EXISTS project_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    mime TEXT NOT NULL,
    data BLOB NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_files_project ON project_files(project_id);
`);

/* ---------- Utilidades ---------- */

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

const hashPassword = (password) => {
    const salt = crypto.randomBytes(16);
    const hash = crypto.scryptSync(password, salt, 64);
    return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
};

const verifyPassword = (password, stored) => {
    const [scheme, saltHex, hashHex] = String(stored).split('$');
    if (scheme !== 'scrypt' || !saltHex || !hashHex) return false;
    const expected = Buffer.from(hashHex, 'hex');
    const actual = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
    return crypto.timingSafeEqual(expected, actual);
};

// Hash de relleno para que un usuario inexistente tarde lo mismo que una contraseña errada.
const DUMMY_HASH = hashPassword(crypto.randomBytes(16).toString('hex'));

if (!db.prepare("SELECT 1 FROM users WHERE role = 'admin'").get()) {
    db.prepare(`INSERT INTO users (email, name, password_hash, role, status, must_change_password)
                VALUES (?, 'Administrador', ?, 'admin', 'active', 1)`).run(ADMIN_USERNAME, hashPassword(ADMIN_INITIAL_PASSWORD));
    console.log(`Administrador creado con el usuario «${ADMIN_USERNAME}». Debe cambiar la contraseña en su primer ingreso.`);
}

const readCookie = (req, name) => {
    const header = req.headers.cookie || '';
    for (const part of header.split(';')) {
        const [key, ...rest] = part.trim().split('=');
        if (key === name) return decodeURIComponent(rest.join('='));
    }
    return '';
};

const setSessionCookie = (res, token, maxAgeSeconds) => {
    const parts = [`${SESSION_COOKIE}=${token}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAgeSeconds}`];
    if (IS_PROD) parts.push('Secure');
    res.setHeader('Set-Cookie', parts.join('; '));
};

const createSession = (res, userId) => {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + SESSION_DAYS * 86400 * 1000;
    db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(sha256(token), userId, expiresAt);
    db.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").run(userId);
    setSessionCookie(res, token, SESSION_DAYS * 86400);
};

// «Entrar como invitado» (sin cuenta propia): todas esas visitas usan esta cuenta compartida, con rol de invitado.
// No tiene contraseña utilizable y no se puede modificar; para cerrar esa puerta, el administrador la bloquea.
const INVITADO_COMUN = 'invitado';
const esInvitadoComun = (u) => u?.email === INVITADO_COMUN;

const publicUser = (user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    mustChangePassword: Boolean(user.must_change_password),
    projectLimit: user.role === 'admin' ? MAX_PROJECTS : Number(user.project_limit) || 0,
    ...(user.email === INVITADO_COMUN ? { comun: true } : {}), // la cuenta compartida del botón «Entrar como invitado»
});

const ROLES = ['admin', 'teacher', 'student', 'researcher', 'guest'];
const ROL_NOMBRE = { admin: 'administrador', teacher: 'profesor', student: 'estudiante', researcher: 'investigador', guest: 'invitado' };
// Cupo con que queda una cuenta al tomar un rol: el invitado nunca crea proyectos; el estudiante espera a su profesor.
const cupoAlCambiar = (rol, actual) => (rol === 'guest' ? 0 : rol !== 'student' && !Number(actual) ? CUPO_AUTONOMO : Number(actual) || 0);
// Cupo de proyectos con que nace una cuenta de profesor o investigador (el administrador lo puede cambiar).
const CUPO_AUTONOMO = 10;
// Cuántos proyectos puede permitirle un profesor a un estudiante.
const CUPO_MAX_ESTUDIANTE = 5;

/* ---------- Correo ---------- */

// Sin usuario SMTP no hay correo: el panel lo avisa y las cuentas se activan a mano.
const mailer = SMTP_HOST && SMTP_USER
    ? nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    })
    : null;

const escapeHtml = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Crea un enlace de activación nuevo (invalida los anteriores) y lo envía. Devuelve true si se envió.
const sendActivation = async (user) => {
    const token = crypto.randomBytes(32).toString('hex');
    db.prepare("DELETE FROM email_tokens WHERE user_id = ? AND purpose = 'activate'").run(user.id);
    db.prepare("INSERT INTO email_tokens (token_hash, user_id, purpose, expires_at) VALUES (?, ?, 'activate', ?)")
        .run(sha256(token), user.id, Date.now() + ACTIVATION_HOURS * 3600 * 1000);
    const link = `${APP_URL}/?activar=${token}`;

    if (!mailer) {
        if (IS_PROD) console.warn(`Correo sin configurar: no se envió la activación de la cuenta ${user.id}. Actívala desde el panel de administración.`);
        else console.log(`[desarrollo] Enlace de activación para ${user.email}: ${link}`);
        return false;
    }

    try {
        await mailer.sendMail({
            from: MAIL_FROM,
            to: user.email,
            subject: 'Activa tu cuenta de PROJECTSIA',
            text: `Hola ${user.name}:\n\nPara activar tu cuenta de PROJECTSIA abre este enlace:\n${link}\n\nEl enlace vence en ${ACTIVATION_HOURS} horas. Si no creaste esta cuenta, ignora este mensaje.`,
            html: `<p>Hola ${escapeHtml(user.name)}:</p><p>Para activar tu cuenta de PROJECTSIA haz clic en el siguiente enlace:</p><p><a href="${link}">Activar mi cuenta</a></p><p>El enlace vence en ${ACTIVATION_HOURS} horas. Si no creaste esta cuenta, ignora este mensaje.</p>`,
        });
        return true;
    } catch (error) {
        console.error('No se pudo enviar el correo de activación', error?.message);
        logError('correo', 'No se pudo enviar el correo de activación', error?.message, user.id);
        return false;
    }
};

const sendReset = async (user) => {
    if (!String(user.email).includes('@')) return false; // el usuario «admin» no tiene buzón
    const token = crypto.randomBytes(32).toString('hex');
    db.prepare("DELETE FROM email_tokens WHERE user_id = ? AND purpose = 'reset'").run(user.id);
    db.prepare("INSERT INTO email_tokens (token_hash, user_id, purpose, expires_at) VALUES (?, ?, 'reset', ?)")
        .run(sha256(token), user.id, Date.now() + RESET_MINUTES * 60 * 1000);
    const link = `${APP_URL}/?restablecer=${token}`;
    if (!mailer) {
        if (!IS_PROD) console.log(`[desarrollo] Enlace para restablecer la contraseña de ${user.email}: ${link}`);
        return false;
    }
    try {
        await mailer.sendMail({
            from: MAIL_FROM,
            to: user.email,
            subject: 'Restablece tu contraseña de PROJECTSIA',
            text: `Hola ${user.name}:\n\nPara crear una contraseña nueva abre este enlace:\n${link}\n\nEl enlace vence en ${RESET_MINUTES} minutos y solo sirve una vez. Si no lo pediste, ignora este mensaje: tu contraseña no cambia.`,
            html: `<p>Hola ${escapeHtml(user.name)}:</p><p>Para crear una contraseña nueva haz clic en el siguiente enlace:</p><p><a href="${link}">Restablecer mi contraseña</a></p><p>El enlace vence en ${RESET_MINUTES} minutos y solo sirve una vez. Si no lo pediste, ignora este mensaje: tu contraseña no cambia.</p>`,
        });
        return true;
    } catch (error) {
        console.error('No se pudo enviar el correo de restablecimiento', error?.message);
        logError('correo', 'No se pudo enviar el correo para restablecer la contraseña', error?.message, user.id);
        return false;
    }
};

/* ---------- Registro de errores y alertas ---------- */

// Papelera: al eliminar una cuenta se guarda aquí todo lo suyo (cuenta, proyectos, versiones, figuras, encuestas
// e invitaciones) durante 30 días, para poder restaurarla tal como estaba.
db.exec(`CREATE TABLE IF NOT EXISTS deleted_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deleted_at INTEGER NOT NULL,
    deleted_by TEXT NOT NULL DEFAULT '',
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL,
    grupo TEXT NOT NULL DEFAULT '',
    projects INTEGER NOT NULL DEFAULT 0,
    data TEXT NOT NULL
)`);
const PAPELERA_DIAS = 30;
const vaciarPapeleraVieja = () => { try { db.prepare('DELETE FROM deleted_users WHERE deleted_at < ?').run(Date.now() - PAPELERA_DIAS * 86400000); } catch { /* se reintenta en la próxima hora */ } };
vaciarPapeleraVieja();
setInterval(vaciarPapeleraVieja, 60 * 60 * 1000).unref();

// Filas ↔ JSON (los binarios, como las figuras, van en base64).
const aTexto = (filas) => filas.map((f) => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, Buffer.isBuffer(v) ? { __b64: v.toString('base64') } : v])));
const columnasDe = (tabla) => db.prepare(`PRAGMA table_info(${tabla})`).all().map((c) => c.name);
const reinsertar = (tabla, filas) => {
    const cols = columnasDe(tabla);
    (filas || []).forEach((f) => {
        const usar = cols.filter((c) => f[c] !== undefined);
        db.prepare(`INSERT INTO ${tabla} (${usar.join(', ')}) VALUES (${usar.map(() => '?').join(', ')})`)
            .run(...usar.map((c) => (f[c] && typeof f[c] === 'object' && f[c].__b64 !== undefined ? Buffer.from(f[c].__b64, 'base64') : f[c])));
    });
};
const archivarCuenta = (target, actor) => {
    const proyectos = db.prepare('SELECT * FROM projects WHERE user_id = ?').all(target.id);
    const ids = proyectos.map((p) => p.id);
    const en = (tabla, col, lista) => (lista.length ? db.prepare(`SELECT * FROM ${tabla} WHERE ${col} IN (${lista.map(() => '?').join(',')})`).all(...lista) : []);
    const encuestas = en('surveys', 'project_id', ids);
    const copia = {
        user: aTexto([target])[0],
        projects: aTexto(proyectos),
        project_versions: aTexto(en('project_versions', 'project_id', ids)),
        project_files: aTexto(en('project_files', 'project_id', ids)),
        surveys: aTexto(encuestas),
        survey_responses: aTexto(en('survey_responses', 'survey_id', encuestas.map((e) => e.id))),
        project_members: aTexto(en('project_members', 'project_id', ids)),
        invitaciones: aTexto(db.prepare('SELECT * FROM project_members WHERE email = ?').all(target.email)),
        estudiantes: db.prepare('SELECT id FROM users WHERE teacher_id = ?').all(target.id).map((u) => u.id),
    };
    db.prepare('INSERT INTO deleted_users (deleted_at, deleted_by, user_id, name, email, role, grupo, projects, data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(Date.now(), String(actor || '').slice(0, 80), target.id, target.name, target.email, target.role, target.grupo || '', proyectos.length, JSON.stringify(copia));
};

// Uso por día: cuántas veces cada cuenta entró, guardó, usó la IA o buscó. Un contador por (día, cuenta, tipo),
// sin guardar qué se escribió. Sirve para la pestaña «Uso» de la administración.
db.exec(`CREATE TABLE IF NOT EXISTS usage_daily (
    day TEXT NOT NULL,
    user_id INTEGER NOT NULL DEFAULT 0,
    kind TEXT NOT NULL,
    n INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (day, user_id, kind)
)`);
const diaDe = (ms = Date.now()) => new Date(ms - 5 * 3600000).toISOString().slice(0, 10); // día en hora de Colombia
const sumarUso = db.prepare('INSERT INTO usage_daily (day, user_id, kind, n) VALUES (?, ?, ?, 1) ON CONFLICT(day, user_id, kind) DO UPDATE SET n = n + 1');
const contarUso = (kind, userId) => { try { sumarUso.run(diaDe(), Number(userId) || 0, kind); } catch { /* contar nunca debe tumbar la solicitud */ } };
try { db.prepare('DELETE FROM usage_daily WHERE day < ?').run(diaDe(Date.now() - 400 * 86400000)); } catch { /* se limpia en el próximo arranque */ }

const bitacora = (req, action, detail = '') => {
    try {
        db.prepare('INSERT INTO admin_log (created_at, actor_id, actor, action, detail) VALUES (?, ?, ?, ?, ?)')
            .run(Date.now(), req.user?.id ?? null, String(req.user?.name || 'Sistema').slice(0, 80), String(action).slice(0, 60), String(detail || '').slice(0, 400));
        db.prepare('DELETE FROM admin_log WHERE id NOT IN (SELECT id FROM admin_log ORDER BY id DESC LIMIT 3000)').run();
    } catch { /* el registro nunca debe tumbar la solicitud */ }
};
const grupoLimpio = (texto) => String(texto || '').trim().replace(/\s+/g, ' ').slice(0, 60);

const logError = (kind, message, detail = '', userId = null) => {
    try {
        db.prepare('INSERT INTO error_log (kind, user_id, message, detail, created_at) VALUES (?, ?, ?, ?, ?)')
            .run(kind, userId, String(message).slice(0, 300), String(detail || '').slice(0, 2000), Date.now());
        db.prepare('DELETE FROM error_log WHERE id NOT IN (SELECT id FROM error_log ORDER BY id DESC LIMIT 500)').run();
    } catch { /* el registro nunca debe tumbar la solicitud */ }
};

// Correo de alerta al administrador; como mucho uno por hora de cada tipo.
const lastAlert = new Map();
const alertar = async (tipo, asunto, texto) => {
    const now = Date.now();
    if (now - (lastAlert.get(tipo) || 0) < 60 * 60 * 1000) return;
    lastAlert.set(tipo, now);
    if (!mailer || !ALERT_EMAIL || ALERT_EMAIL === 'off') return;
    try {
        await mailer.sendMail({ from: MAIL_FROM, to: ALERT_EMAIL, subject: `[PROJECTSIA] ${asunto}`, text: texto });
    } catch (error) {
        console.error('No se pudo enviar la alerta', error?.message);
    }
};

/* ---------- Copias de seguridad ---------- */

// Copias «de antes de restaurar»: se crean justo antes de restaurar otra, por si hay que deshacerlo. Se guardan 5.
const PREVIA_RE = /^projectsia-antes-de-restaurar-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.db\.gz$/;
const listSafety = () => {
    try {
        return fs.readdirSync(BACKUP_DIR).filter((f) => PREVIA_RE.test(f)).sort().reverse()
            .map((name) => ({ name, size: fs.statSync(path.join(BACKUP_DIR, name)).size }));
    } catch { return []; }
};
const backupName = (date = new Date()) => `projectsia-${date.toISOString().slice(0, 10)}.db.gz`;

const listBackups = () => {
    try {
        return fs.readdirSync(BACKUP_DIR).filter((f) => /^projectsia-\d{4}-\d{2}-\d{2}\.db\.gz$/.test(f)).sort().reverse()
            .map((name) => ({ name, size: fs.statSync(path.join(BACKUP_DIR, name)).size }));
    } catch {
        return [];
    }
};

// Copia consistente de toda la base (incluye lo que aún está en el WAL), comprimida. Se conservan las últimas 30.
let backupRunning = false;
const runBackup = async () => {
    if (backupRunning) return null;
    backupRunning = true;
    const tmp = path.join(BACKUP_DIR, 'en-curso.db');
    try {
        fs.mkdirSync(BACKUP_DIR, { recursive: true, mode: 0o700 });
        await db.backup(tmp);
        const name = backupName();
        const file = path.join(BACKUP_DIR, name);
        fs.writeFileSync(file, zlib.gzipSync(fs.readFileSync(tmp)), { mode: 0o600 });
        fs.rmSync(tmp, { force: true });
        listBackups().slice(BACKUP_KEEP).forEach((old) => fs.rmSync(path.join(BACKUP_DIR, old.name), { force: true }));
        const size = fs.statSync(file).size;
        // La copia se queda en el servidor: no se envía por correo. Para tenerla fuera, el administrador la descarga.
        return { name, size };
    } catch (error) {
        logError('backup', 'Falló la copia de seguridad', error?.message);
        alertar('backup', 'Falló la copia de seguridad', `No se pudo crear la copia diaria: ${error?.message}`);
        return null;
    } finally {
        fs.rmSync(tmp, { force: true });
        backupRunning = false;
    }
};

// Una copia al día: se revisa cada hora si ya existe la de hoy.
const backupIfDue = () => { if (!listBackups().some((b) => b.name === backupName())) runBackup(); };
setTimeout(backupIfDue, 60 * 1000).unref();
setInterval(backupIfDue, 60 * 60 * 1000).unref();

/* ---------- Límite de solicitudes ---------- */

const buckets = new Map();
const rateLimit = ({ name, limit, windowMs, key = (req) => req.ip }) => (req, res, next) => {
    const id = `${name}:${key(req)}`;
    const now = Date.now();
    const bucket = buckets.get(id);
    if (!bucket || bucket.reset < now) {
        buckets.set(id, { count: 1, reset: now + windowMs });
        return next();
    }
    if (bucket.count >= limit) {
        res.setHeader('Retry-After', Math.ceil((bucket.reset - now) / 1000));
        return res.status(429).json({ error: 'Demasiadas solicitudes. Espera unos minutos e inténtalo de nuevo.' });
    }
    bucket.count += 1;
    return next();
};
setInterval(() => {
    const now = Date.now();
    for (const [id, bucket] of buckets) if (bucket.reset < now) buckets.delete(id);
    db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(now);
    db.prepare('DELETE FROM email_tokens WHERE expires_at < ?').run(now);
}, 10 * 60 * 1000).unref();

/* ---------- App ---------- */

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
const jsonSmall = express.json({ limit: '1mb' });
const jsonFiles = express.json({ limit: '3mb' });
app.use((req, res, next) => (/^\/api\/projects\/\d+\/files$/.test(req.path) ? jsonFiles : jsonSmall)(req, res, next));

// Protección CSRF: las peticiones que modifican datos deben venir del mismo origen.
app.use((req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    const origin = req.headers.origin;
    if (origin) {
        let originHost = '';
        try { originHost = new URL(origin).host; } catch { /* origen inválido */ }
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        if (originHost !== host) return res.status(403).json({ error: 'Origen no permitido.' });
    }
    if (req.method !== 'DELETE' && !req.is('application/json')) return res.status(415).json({ error: 'Se esperaba JSON.' });
    return next();
});

// Solo las cuentas activas conservan su sesión: bloquear a alguien lo saca de inmediato.
app.use((req, _res, next) => {
    const token = readCookie(req, SESSION_COOKIE);
    if (token) {
        const row = db.prepare(`
            SELECT users.id, users.email, users.name, users.role, users.status, users.must_change_password, users.project_limit, sessions.expires_at
            FROM sessions JOIN users ON users.id = sessions.user_id
            WHERE sessions.token_hash = ?`).get(sha256(token));
        if (row && row.expires_at > Date.now() && row.status === 'active') {
            req.user = row;
            req.sessionHash = sha256(token);
        }
    }
    next();
});

const requireUser = (req, res, next) => (req.user ? next() : res.status(401).json({ error: 'Inicia sesión para continuar.' }));

// Invitado: solo ve las presentaciones de cada módulo. No tiene proyectos (ni propios ni compartidos), IA ni búsquedas.
app.use(['/api/projects', '/api/ai', '/api/buscar'], (req, res, next) => {
    if (req.user?.role !== 'guest') return next();
    if (req.method === 'GET' && req.baseUrl === '/api/projects' && req.path === '/') return res.json({ projects: [] });
    return res.status(403).json({ error: 'Tu cuenta es de invitado: solo puedes ver las presentaciones.', code: 'guest' });
});

const requireAdmin = (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Inicia sesión para continuar.' });
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'No tienes permiso para esta sección.' });
    if (req.user.must_change_password) return res.status(403).json({ error: 'Cambia tu contraseña antes de entrar a la administración.', code: 'must_change_password' });
    return next();
};

app.get('/api/health', (_req, res) => res.json({ ok: true, ai: Boolean(GROQ_API_KEY), mail: Boolean(mailer), articulos: Boolean(OPENALEX_API_KEY), normas: Boolean(RULEX_API_KEY) }));

/* ---------- Cuentas ---------- */

// Un curso entero suele entrar desde la misma red (una sola IP): el tope por IP es amplio
// y el freno contra adivinar contraseñas va por cuenta (IP + correo).
const authLimit = rateLimit({ name: 'auth', limit: 400, windowMs: 15 * 60 * 1000 });
const perAccount = (req) => `${req.ip}|${String(req.body?.email || '').trim().toLowerCase().slice(0, 160)}`;
const loginLimit = rateLimit({ name: 'login', limit: 10, windowMs: 15 * 60 * 1000, key: perAccount });
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Entrar como invitado, sin cuenta: abre una sesión de la cuenta compartida (solo presentaciones).
const cuentaInvitada = () => {
    let u = db.prepare('SELECT * FROM users WHERE email = ?').get(INVITADO_COMUN);
    if (!u) {
        db.prepare(`INSERT INTO users (email, name, password_hash, role, status, must_change_password, project_limit)
                    VALUES (?, 'Invitado', ?, 'guest', 'active', 0, 0)`).run(INVITADO_COMUN, hashPassword(crypto.randomBytes(24).toString('hex')));
        u = db.prepare('SELECT * FROM users WHERE email = ?').get(INVITADO_COMUN);
    }
    return u;
};
app.post('/api/auth/guest', authLimit, rateLimit({ name: 'invitado', limit: 40, windowMs: 10 * 60 * 1000 }), (_req, res) => {
    const u = cuentaInvitada();
    if (u.status !== 'active' || u.role !== 'guest') return res.status(403).json({ error: 'La entrada como invitado está desactivada. Pide una cuenta al administrador.', code: 'guest_off' });
    createSession(res, u.id);
    contarUso('ingreso', u.id);
    db.prepare('DELETE FROM sessions WHERE user_id = ? AND expires_at < ?').run(u.id, Date.now());
    return res.json({ user: publicUser(u) });
});

// El registro por cuenta propia está cerrado: las cuentas las crea el administrador (o el profesor, las de sus estudiantes).
app.post('/api/auth/register', authLimit, (_req, res) => res.status(403).json({
    error: 'El registro está cerrado. Pide tu cuenta al administrador o a tu profesor.', code: 'registro_cerrado',
}));

app.post('/api/auth/verify', authLimit, (req, res) => {
    const token = String(req.body?.token || '');
    const row = token && db.prepare(`
        SELECT users.* FROM email_tokens JOIN users ON users.id = email_tokens.user_id
        WHERE email_tokens.token_hash = ? AND email_tokens.purpose = 'activate' AND email_tokens.expires_at > ?`).get(sha256(token), Date.now());
    if (!row) return res.status(400).json({ error: 'El enlace de activación no es válido o ya venció. Inicia sesión para pedir uno nuevo.' });
    if (row.status === 'blocked') return res.status(403).json({ error: 'Tu cuenta está bloqueada. Comunícate con el administrador.', code: 'blocked' });

    db.prepare("UPDATE users SET status = 'active' WHERE id = ?").run(row.id);
    db.prepare("DELETE FROM email_tokens WHERE user_id = ? AND purpose = 'activate'").run(row.id);
    // Aviso al administrador: la cuenta ya está activa y espera que le autorice crear proyectos.
    if (!Number(row.project_limit) && mailer && ALERT_EMAIL && ALERT_EMAIL !== 'off') {
        mailer.sendMail({
            from: MAIL_FROM,
            to: ALERT_EMAIL,
            subject: `[PROJECTSIA] ${row.name} espera autorización para crear su proyecto`,
            text: `${row.name} (${row.email}) activó su cuenta.\n\nPara que pueda crear proyectos, entra a ${APP_URL} › Administración y asígnale cuántos proyectos puede tener.`,
        }).catch((error) => { console.error('No se pudo avisar al administrador', error?.message); logError('correo', 'No se pudo avisar al administrador de una cuenta nueva', error?.message, row.id); });
    }
    createSession(res, row.id);
    return res.json({ user: publicUser({ ...row, status: 'active' }) });
});

app.post('/api/auth/resend', authLimit, rateLimit({ name: 'resend', limit: 3, windowMs: 30 * 60 * 1000, key: perAccount }), async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND status = 'pending'").get(email);
    if (user) await sendActivation(user);
    // Misma respuesta exista o no la cuenta, para no revelar qué correos están registrados.
    return res.json({ ok: true });
});

app.post('/api/auth/login', authLimit, loginLimit, (req, res) => {
    const login = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(login);
    const ok = verifyPassword(password, user ? user.password_hash : DUMMY_HASH);
    if (!user || !ok) return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    if (user.status === 'pending') {
        return res.status(403).json({ error: 'Tu cuenta aún no está activada. Abre el enlace que enviamos a tu correo.', code: 'pending' });
    }
    if (user.status === 'blocked') {
        return res.status(403).json({ error: 'Tu cuenta está bloqueada. Comunícate con el administrador.', code: 'blocked' });
    }
    createSession(res, user.id);
    contarUso('ingreso', user.id);
    return res.json({ user: publicUser(user) });
});

// Recuperar contraseña: siempre responde igual, exista o no la cuenta.
const forgotLimit = rateLimit({ name: 'forgot', limit: 3, windowMs: 30 * 60 * 1000, key: perAccount });
app.post('/api/auth/forgot', authLimit, forgotLimit, async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND status != 'blocked'").get(email);
    if (user) await sendReset(user);
    return res.json({ ok: true, mail: Boolean(mailer) });
});

app.post('/api/auth/reset', authLimit, (req, res) => {
    const token = String(req.body?.token || '');
    const password = String(req.body?.password || '');
    const row = token && db.prepare(`
        SELECT users.* FROM email_tokens JOIN users ON users.id = email_tokens.user_id
        WHERE email_tokens.token_hash = ? AND email_tokens.purpose = 'reset' AND email_tokens.expires_at > ?`).get(sha256(token), Date.now());
    if (!row) return res.status(400).json({ error: 'El enlace no es válido o ya venció. Pide uno nuevo desde «¿Olvidaste tu contraseña?».' });
    if (row.status === 'blocked') return res.status(403).json({ error: 'Tu cuenta está bloqueada. Comunícate con el administrador.', code: 'blocked' });
    if (password.length < 8 || password.length > 200) return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
    if (password.toLowerCase() === row.email) return res.status(400).json({ error: 'La contraseña no puede ser igual a tu correo.' });
    // Abrir el enlace prueba que el correo es suyo: también activa una cuenta que seguía pendiente.
    db.prepare("UPDATE users SET password_hash = ?, must_change_password = 0, status = 'active' WHERE id = ?").run(hashPassword(password), row.id);
    db.prepare('DELETE FROM email_tokens WHERE user_id = ?').run(row.id);
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(row.id);
    createSession(res, row.id);
    return res.json({ user: publicUser({ ...row, status: 'active', must_change_password: 0 }) });
});

app.post('/api/auth/logout', (req, res) => {
    if (req.sessionHash) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(req.sessionHash);
    setSessionCookie(res, '', 0);
    res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => res.json({ user: req.user ? publicUser(req.user) : null }));

app.post('/api/auth/password', requireUser, authLimit, (req, res) => {
    if (esInvitadoComun(req.user)) return res.status(400).json({ error: 'La cuenta de invitado es compartida: no tiene contraseña.' });
    const current = String(req.body?.current || '');
    const next = String(req.body?.next || '');
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!verifyPassword(current, user.password_hash)) return res.status(401).json({ error: 'La contraseña actual no coincide.' });
    if (next.length < 8 || next.length > 200) return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres.' });
    if (next === current) return res.status(400).json({ error: 'La nueva contraseña debe ser distinta de la actual.' });
    if (next.toLowerCase() === user.email) return res.status(400).json({ error: 'La contraseña no puede ser igual a tu usuario.' });
    db.prepare('UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?').run(hashPassword(next), user.id);
    db.prepare('DELETE FROM sessions WHERE user_id = ? AND token_hash != ?').run(user.id, req.sessionHash);
    return res.json({ user: publicUser({ ...user, must_change_password: 0 }) });
});

/* ---------- Proyectos ---------- */

const cleanName = (value) => String(value || '').trim().slice(0, 120) || 'Mi proyecto';

const serializeData = (data) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
    const text = JSON.stringify(data);
    return Buffer.byteLength(text) > MAX_PROJECT_BYTES ? null : text;
};

// Resumen para las tarjetas de «Mi proyecto»: el título y un avance aproximado (secciones que ya tienen algo).
const SECCIONES_AVANCE = ['idea', 'titulo', 'pregunta', 'arbol', 'planteamiento', 'arbolObjetivos', 'objetivos', 'introduccion', 'justificacion', 'alcances', 'marcoAntecedentes', 'metodologia', 'fases', 'resultados', 'conclusiones', 'resumen', 'referencias'];
const conContenido = (v) => (typeof v === 'string' ? v.trim().length > 0 : Array.isArray(v) ? v.length > 0 : Boolean(v) && typeof v === 'object' && Object.values(v).some(conContenido));
const resumenProyecto = (raw) => {
    try {
        const d = JSON.parse(raw) || {};
        const hechas = SECCIONES_AVANCE.filter((k) => conContenido(d[k])).length;
        return { titulo: String(d.titulo || '').slice(0, 220), avance: Math.round((hechas / SECCIONES_AVANCE.length) * 100) };
    } catch { return { titulo: '', avance: 0 }; }
};

const projectRow = (row, withData = true) => ({
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    version: row.version,
    ...(row.owner_name !== undefined ? { shared: Boolean(row.shared), ownerName: row.owner_name } : {}),
    ...(withData ? { data: JSON.parse(row.data) } : {}),
});

const emailOf = (user) => String(user.email || '').trim().toLowerCase();

app.get('/api/projects', requireUser, (req, res) => {
    // Propios y compartidos conmigo (por el correo de mi cuenta).
    const rows = db.prepare(`
        SELECT p.id, p.name, p.data, p.created_at, p.updated_at, p.version, u.name AS owner_name, (p.user_id <> @me) AS shared
        FROM projects p JOIN users u ON u.id = p.user_id
        WHERE p.user_id = @me OR p.id IN (SELECT project_id FROM project_members WHERE email = @email)
        ORDER BY p.updated_at DESC, p.id DESC`).all({ me: req.user.id, email: emailOf(req.user) });
    res.json({ projects: rows.map((row) => ({ ...projectRow(row, false), ...resumenProyecto(row.data) })) });
});

app.post('/api/projects', requireUser, (req, res) => {
    const count = db.prepare('SELECT COUNT(*) AS n FROM projects WHERE user_id = ?').get(req.user.id).n;
    const limit = req.user.role === 'admin' ? MAX_PROJECTS : Number(req.user.project_limit) || 0;
    const quien = req.user.role === 'student' ? 'tu profesor' : 'el administrador';
    if (limit === 0) return res.status(403).json({ error: `Tu cuenta todavía no tiene permiso para crear proyectos: ${quien} debe permitirlo.`, code: 'no_quota' });
    if (count >= limit) return res.status(403).json({ error: `Tu cuenta puede tener hasta ${limit} ${limit === 1 ? 'proyecto' : 'proyectos'}. Pide a ${quien} que amplíe tu cupo o elimina uno.`, code: 'quota_full' });
    const data = serializeData(req.body?.data ?? {});
    if (data === null) return res.status(400).json({ error: 'El contenido del proyecto no es válido o es demasiado grande.' });
    const info = db.prepare('INSERT INTO projects (user_id, name, data) VALUES (?, ?, ?)').run(req.user.id, cleanName(req.body?.name), data);
    const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(info.lastInsertRowid);
    return res.status(201).json({ project: projectRow(row) });
});

// Acceso al proyecto: dueño, integrante invitado o (solo lectura de archivos) administrador.
const loadProject = (req) => {
    const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(Number(req.params.id));
    if (!row) return null;
    const owner = row.user_id === req.user.id;
    const member = !owner && Boolean(db.prepare('SELECT 1 FROM project_members WHERE project_id = ? AND email = ?').get(row.id, emailOf(req.user)));
    return owner || member ? { row, owner } : null;
};

const memberProject = (req, res, next) => {
    const found = loadProject(req);
    if (!found) return res.status(404).json({ error: 'No se encontró el proyecto.' });
    req.project = found.row;
    req.isOwner = found.owner;
    return next();
};

const ownProject = (req, res, next) => memberProject(req, res, () => (
    req.isOwner ? next() : res.status(403).json({ error: 'Solo quien creó el proyecto puede hacer esto.' })
));

const projectFull = (row, req) => {
    const owner = db.prepare('SELECT name FROM users WHERE id = ?').get(row.user_id);
    return { ...projectRow(row), shared: row.user_id !== req.user.id, ownerName: owner?.name || '' };
};

app.get('/api/projects/:id', requireUser, memberProject, (req, res) => res.json({ project: projectFull(req.project, req) }));

// Consulta ligera para saber si un compañero guardó cambios.
// Presencia en memoria: quién tiene abierto el proyecto y en qué sección (se olvida a los 40 s sin señal).
const presence = new Map();
const PRESENCE_MS = 40 * 1000;
app.get('/api/projects/:id/version', requireUser, memberProject, (req, res) => {
    const now = Date.now();
    const room = presence.get(req.project.id) || new Map();
    presence.set(req.project.id, room);
    room.set(req.user.id, { name: req.user.name, tab: String(req.query.tab || '').slice(0, 30), at: now });
    for (const [id, p] of room) if (now - p.at > PRESENCE_MS) room.delete(id);
    const others = [...room].filter(([id]) => id !== req.user.id).map(([, p]) => ({ name: p.name, tab: p.tab }));
    res.json({ version: req.project.version, others });
});

const saveVersion = (project, userId, force = false) => {
    const last = db.prepare('SELECT created_at, data FROM project_versions WHERE project_id = ? ORDER BY created_at DESC LIMIT 1').get(project.id);
    if (last && (last.data === project.data || (!force && Date.now() - last.created_at < VERSION_EVERY_MS))) return;
    if (project.data === '{}') return;
    db.prepare('INSERT INTO project_versions (project_id, user_id, data, created_at) VALUES (?, ?, ?, ?)').run(project.id, userId, project.data, Date.now());
    db.prepare(`DELETE FROM project_versions WHERE project_id = ? AND id NOT IN (
        SELECT id FROM project_versions WHERE project_id = ? ORDER BY created_at DESC LIMIT ?)`).run(project.id, project.id, MAX_VERSIONS);
};

app.put('/api/projects/:id', requireUser, memberProject, (req, res) => {
    const name = req.body?.name === undefined ? req.project.name : cleanName(req.body.name);
    let data = req.project.data;
    let meta = req.project.key_meta || '{}';
    const conflicts = [];
    const nextVersion = req.project.version + 1;
    if (req.body?.patch !== undefined) {
        // Cambios por campo: lo que edita un integrante no pisa lo que otro guardó en otra sección. null borra el campo.
        const patch = req.body.patch;
        if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return res.status(400).json({ error: 'El contenido del proyecto no es válido.' });
        const merged = JSON.parse(req.project.data);
        const keyMeta = JSON.parse(meta);
        const base = Number(req.body.base);
        const force = req.body.force === true;
        for (const [key, value] of Object.entries(patch)) {
            // Choque: otro integrante guardó este mismo campo después de la última vez que este navegador se sincronizó.
            const last = keyMeta[key];
            const same = JSON.stringify(merged[key] ?? null) === JSON.stringify(value);
            if (!force && Number.isFinite(base) && last && last[0] > base && last[1] !== req.user.id && !same) {
                const who = db.prepare('SELECT name FROM users WHERE id = ?').get(last[1]);
                conflicts.push({ key, by: who?.name || 'otro integrante' });
                continue;
            }
            if (value === null) delete merged[key];
            else merged[key] = value;
            keyMeta[key] = [nextVersion, req.user.id];
        }
        data = serializeData(merged);
        meta = JSON.stringify(keyMeta);
    } else if (req.body?.data !== undefined) {
        data = serializeData(req.body.data);
    }
    if (data === null) return res.status(400).json({ error: 'El contenido del proyecto no es válido o es demasiado grande.' });
    if (data !== req.project.data || name !== req.project.name) {
        if (data !== req.project.data) { saveVersion(req.project, req.user.id); contarUso('guardado', req.user.id); }
        db.prepare("UPDATE projects SET name = ?, data = ?, key_meta = ?, version = version + 1, updated_at = datetime('now') WHERE id = ?").run(name, data, meta, req.project.id);
    }
    const row = db.prepare('SELECT id, name, created_at, updated_at, version FROM projects WHERE id = ?').get(req.project.id);
    return res.json({ project: projectRow(row, false), conflicts });
});

app.delete('/api/projects/:id', requireUser, ownProject, (req, res) => {
    db.prepare('DELETE FROM projects WHERE id = ?').run(req.project.id);
    res.json({ ok: true });
});

/* ---------- Equipo ---------- */

const membersOf = (project) => {
    const owner = db.prepare('SELECT name, email FROM users WHERE id = ?').get(project.user_id);
    const rows = db.prepare(`
        SELECT m.email, u.name, u.status FROM project_members m LEFT JOIN users u ON lower(u.email) = m.email
        WHERE m.project_id = ? ORDER BY m.added_at`).all(project.id);
    return [
        { email: owner.email, name: owner.name, owner: true, registered: true },
        ...rows.map((r) => ({ email: r.email, name: r.name || '', owner: false, registered: Boolean(r.name) && r.status === 'active' })),
    ];
};

app.get('/api/projects/:id/members', requireUser, memberProject, (req, res) => res.json({ members: membersOf(req.project), isOwner: req.isOwner }));

const inviteLimit = rateLimit({ name: 'invite', limit: 20, windowMs: 60 * 60 * 1000, key: (req) => String(req.user?.id || req.ip) });

app.post('/api/projects/:id/members', requireUser, ownProject, inviteLimit, async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) return res.status(400).json({ error: 'Escribe un correo válido.' });
    if (email === emailOf(req.user)) return res.status(400).json({ error: 'Ese es tu propio correo.' });
    const count = db.prepare('SELECT COUNT(*) AS n FROM project_members WHERE project_id = ?').get(req.project.id).n;
    if (count >= MAX_MEMBERS) return res.status(400).json({ error: `Un proyecto puede tener hasta ${MAX_MEMBERS} invitados.` });
    const info = db.prepare('INSERT OR IGNORE INTO project_members (project_id, email) VALUES (?, ?)').run(req.project.id, email);
    let mailed = false;
    if (info.changes && mailer) {
        try {
            await mailer.sendMail({
                from: MAIL_FROM,
                to: email,
                subject: `${req.user.name} te invitó a un proyecto en PROJECTSIA`,
                text: `Hola:\n\n${req.user.name} te invitó a trabajar en el proyecto «${req.project.name}» en PROJECTSIA.\n\nEntra a ${APP_URL} e inicia sesión (o crea tu cuenta) con este correo: ${email}. El proyecto aparecerá en «Mi proyecto», en la lista «Tus proyectos».`,
                html: `<p>Hola:</p><p><strong>${escapeHtml(req.user.name)}</strong> te invitó a trabajar en el proyecto «${escapeHtml(req.project.name)}» en PROJECTSIA.</p><p>Entra a <a href="${APP_URL}">${APP_URL}</a> e inicia sesión (o crea tu cuenta) con este correo: <strong>${escapeHtml(email)}</strong>. El proyecto aparecerá en «Mi proyecto», en la lista «Tus proyectos».</p>`,
            });
            mailed = true;
        } catch (error) {
            console.error('No se pudo enviar la invitación', error?.message);
            logError('correo', 'No se pudo enviar la invitación al proyecto', error?.message, req.user.id);
        }
    }
    return res.status(201).json({ members: membersOf(req.project), mailed });
});

// El dueño quita a cualquiera; un invitado solo puede salirse él mismo.
app.delete('/api/projects/:id/members/:email', requireUser, memberProject, (req, res) => {
    const email = String(req.params.email || '').trim().toLowerCase();
    if (!req.isOwner && email !== emailOf(req.user)) return res.status(403).json({ error: 'Solo quien creó el proyecto puede quitar integrantes.' });
    db.prepare('DELETE FROM project_members WHERE project_id = ? AND email = ?').run(req.project.id, email);
    return res.json({ members: req.isOwner ? membersOf(req.project) : [] });
});

/* ---------- Historial de versiones ---------- */

app.get('/api/projects/:id/versions', requireUser, memberProject, (req, res) => {
    const rows = db.prepare(`
        SELECT v.id, v.created_at, length(v.data) AS size, u.name AS author
        FROM project_versions v LEFT JOIN users u ON u.id = v.user_id
        WHERE v.project_id = ? ORDER BY v.created_at DESC`).all(req.project.id);
    res.json({ versions: rows.map((r) => ({ id: r.id, createdAt: r.created_at, size: r.size, author: r.author || '' })) });
});

// Copia manual (y la que se hace justo antes de restaurar, para poder deshacer).
app.post('/api/projects/:id/versions', requireUser, memberProject, (req, res) => {
    saveVersion(req.project, req.user.id, true);
    res.status(201).json({ ok: true });
});

app.get('/api/projects/:id/versions/:vid', requireUser, memberProject, (req, res) => {
    const row = db.prepare('SELECT id, data, created_at FROM project_versions WHERE id = ? AND project_id = ?').get(Number(req.params.vid), req.project.id);
    if (!row) return res.status(404).json({ error: 'No se encontró esa versión.' });
    return res.json({ version: { id: row.id, createdAt: row.created_at, data: JSON.parse(row.data) } });
});

/* ---------- Figuras ---------- */

const FILE_MIMES = new Set(['image/png', 'image/jpeg']);

app.post('/api/projects/:id/files', requireUser, memberProject, (req, res) => {
    const mime = String(req.body?.mime || '');
    if (!FILE_MIMES.has(mime)) return res.status(400).json({ error: 'Solo se aceptan imágenes PNG o JPG.' });
    const buffer = Buffer.from(String(req.body?.data || ''), 'base64');
    // Firma del archivo: PNG o JPEG reales, no solo el nombre.
    const isPng = buffer.length > 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const isJpg = buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    if ((mime === 'image/png' && !isPng) || (mime === 'image/jpeg' && !isJpg)) return res.status(400).json({ error: 'El archivo no es una imagen válida.' });
    if (buffer.length > MAX_FILE_BYTES) return res.status(413).json({ error: 'La imagen es demasiado grande.' });
    const count = db.prepare('SELECT COUNT(*) AS n FROM project_files WHERE project_id = ?').get(req.project.id).n;
    if (count >= MAX_FILES) return res.status(400).json({ error: `Un proyecto puede tener hasta ${MAX_FILES} figuras.` });
    const info = db.prepare('INSERT INTO project_files (project_id, mime, data) VALUES (?, ?, ?)').run(req.project.id, mime, buffer);
    return res.status(201).json({ file: { id: Number(info.lastInsertRowid) } });
});

const sendFile = (res, projectId, fileId) => {
    const row = db.prepare('SELECT mime, data FROM project_files WHERE id = ? AND project_id = ?').get(Number(fileId), projectId);
    if (!row) return res.status(404).json({ error: 'No se encontró la figura.' });
    res.setHeader('Content-Type', row.mime);
    res.setHeader('Cache-Control', 'private, max-age=86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.end(row.data);
};

app.get('/api/projects/:id/files/:fid', requireUser, (req, res) => {
    // El administrador puede ver las figuras de cualquier proyecto (solo lectura).
    if (req.user.role === 'admin') return sendFile(res, Number(req.params.id), req.params.fid);
    // El profesor ve las figuras de los proyectos de los estudiantes a su cargo (los supervisa en solo lectura).
    if (req.user.role === 'teacher') {
        const suyo = db.prepare("SELECT 1 FROM projects p JOIN users u ON u.id = p.user_id WHERE p.id = ? AND u.role = 'student' AND u.teacher_id = ?").get(Number(req.params.id), req.user.id);
        if (suyo) return sendFile(res, Number(req.params.id), req.params.fid);
    }
    const found = loadProject(req);
    if (!found) return res.status(404).json({ error: 'No se encontró el proyecto.' });
    return sendFile(res, found.row.id, req.params.fid);
});

app.delete('/api/projects/:id/files/:fid', requireUser, memberProject, (req, res) => {
    db.prepare('DELETE FROM project_files WHERE id = ? AND project_id = ?').run(Number(req.params.fid), req.project.id);
    res.json({ ok: true });
});

/* ---------- Encuestas en línea ---------- */

const TIPOS_PREGUNTA = new Set(['likert', 'opcion', 'multiple', 'sino', 'numero', 'abierta']);
const corto = (value, max) => String(value ?? '').trim().slice(0, max);

// Deja solo lo necesario para mostrar el formulario y validar las respuestas.
const cleanSurvey = (raw) => {
    if (!raw || typeof raw !== 'object') return null;
    const preguntas = (Array.isArray(raw.preguntas) ? raw.preguntas : []).slice(0, 60).map((q) => ({
        id: corto(q?.id, 20),
        texto: corto(q?.texto, 500),
        tipo: TIPOS_PREGUNTA.has(q?.tipo) ? q.tipo : 'abierta',
        opciones: (Array.isArray(q?.opciones) ? q.opciones : []).map((o) => corto(o, 120)).filter(Boolean).slice(0, 12),
        obligatoria: q?.obligatoria !== false,
    })).filter((q) => q.id && q.texto);
    if (!preguntas.length) return null;
    return { titulo: corto(raw.titulo, 200) || 'Encuesta', intro: corto(raw.intro, 2000), preguntas };
};

const surveyRow = (row) => ({
    instrumentId: row.instrument_id,
    token: row.token,
    open: Boolean(row.open),
    count: db.prepare('SELECT COUNT(*) AS n FROM survey_responses WHERE survey_id = ?').get(row.id).n,
});

app.get('/api/projects/:id/surveys', requireUser, memberProject, (req, res) => {
    const rows = db.prepare('SELECT * FROM surveys WHERE project_id = ?').all(req.project.id);
    res.json({ surveys: rows.map(surveyRow) });
});

// Publica o actualiza la versión en línea de un instrumento (y la abre o la cierra).
app.put('/api/projects/:id/surveys/:iid', requireUser, memberProject, (req, res) => {
    const instrumentId = corto(req.params.iid, 20);
    const definition = cleanSurvey(req.body?.definition);
    if (!instrumentId || !definition) return res.status(400).json({ error: 'El instrumento necesita al menos una pregunta.' });
    const open = req.body?.open === false ? 0 : 1;
    const existing = db.prepare('SELECT * FROM surveys WHERE project_id = ? AND instrument_id = ?').get(req.project.id, instrumentId);
    if (existing) {
        db.prepare('UPDATE surveys SET definition = ?, open = ? WHERE id = ?').run(JSON.stringify(definition), open, existing.id);
    } else {
        const token = crypto.randomBytes(12).toString('hex');
        db.prepare('INSERT INTO surveys (project_id, instrument_id, token_hash, token, definition, open) VALUES (?, ?, ?, ?, ?, ?)')
            .run(req.project.id, instrumentId, sha256(token), token, JSON.stringify(definition), open);
    }
    const row = db.prepare('SELECT * FROM surveys WHERE project_id = ? AND instrument_id = ?').get(req.project.id, instrumentId);
    return res.json({ survey: surveyRow(row) });
});

const ownSurvey = (req) => db.prepare('SELECT * FROM surveys WHERE project_id = ? AND instrument_id = ?').get(req.project.id, corto(req.params.iid, 20));

app.get('/api/projects/:id/surveys/:iid/responses', requireUser, memberProject, (req, res) => {
    const survey = ownSurvey(req);
    if (!survey) return res.status(404).json({ error: 'Ese instrumento no está publicado.' });
    const rows = db.prepare('SELECT answers, created_at FROM survey_responses WHERE survey_id = ? ORDER BY id').all(survey.id);
    return res.json({ definition: JSON.parse(survey.definition), responses: rows.map((r) => ({ at: r.created_at, answers: JSON.parse(r.answers) })) });
});

app.delete('/api/projects/:id/surveys/:iid/responses', requireUser, memberProject, (req, res) => {
    const survey = ownSurvey(req);
    if (survey) db.prepare('DELETE FROM survey_responses WHERE survey_id = ?').run(survey.id);
    res.json({ ok: true });
});

// Formulario público: cualquiera con el enlace puede verlo y responder, sin cuenta. No se guarda quién responde.
const publicSurvey = (token) => db.prepare('SELECT * FROM surveys WHERE token_hash = ?').get(sha256(String(token || '')));

app.get('/api/encuestas/:token', rateLimit({ name: 'enc-ver', limit: 300, windowMs: 10 * 60 * 1000 }), (req, res) => {
    const survey = publicSurvey(req.params.token);
    if (!survey) return res.status(404).json({ error: 'Esta encuesta no existe o el enlace está incompleto.' });
    const count = db.prepare('SELECT COUNT(*) AS n FROM survey_responses WHERE survey_id = ?').get(survey.id).n;
    return res.json({ survey: JSON.parse(survey.definition), open: Boolean(survey.open) && count < MAX_RESPONSES });
});

app.post('/api/encuestas/:token', rateLimit({ name: 'enc-resp', limit: 120, windowMs: 60 * 60 * 1000 }), (req, res) => {
    const survey = publicSurvey(req.params.token);
    if (!survey) return res.status(404).json({ error: 'Esta encuesta no existe.' });
    const count = db.prepare('SELECT COUNT(*) AS n FROM survey_responses WHERE survey_id = ?').get(survey.id).n;
    if (!survey.open || count >= MAX_RESPONSES) return res.status(403).json({ error: 'Esta encuesta ya no recibe respuestas.' });
    const definition = JSON.parse(survey.definition);
    const raw = req.body?.answers && typeof req.body.answers === 'object' ? req.body.answers : {};
    const answers = {};
    for (const q of definition.preguntas) {
        const value = raw[q.id];
        let clean = '';
        if (q.tipo === 'multiple') clean = (Array.isArray(value) ? value : []).map((v) => corto(v, 120)).filter((v) => q.opciones.includes(v));
        else if (q.tipo === 'opcion' || q.tipo === 'likert') clean = q.opciones.includes(String(value)) ? String(value) : '';
        else if (q.tipo === 'sino') clean = ['Sí', 'No'].includes(String(value)) ? String(value) : '';
        else if (q.tipo === 'numero') clean = value === '' || value === null || value === undefined || !Number.isFinite(Number(value)) ? '' : Number(value);
        else clean = corto(value, 2000);
        const empty = Array.isArray(clean) ? clean.length === 0 : clean === '';
        if (empty && q.obligatoria) return res.status(400).json({ error: `Falta responder: «${q.texto.slice(0, 80)}».` });
        answers[q.id] = clean;
    }
    db.prepare('INSERT INTO survey_responses (survey_id, answers, created_at) VALUES (?, ?, ?)').run(survey.id, JSON.stringify(answers), Date.now());
    return res.status(201).json({ ok: true });
});

/* ---------- Administración ---------- */

const adminUserRow = (row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    projectLimit: row.role === 'admin' ? MAX_PROJECTS : Number(row.project_limit) || 0,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
    projectCount: row.project_count ?? 0,
    lastActivity: row.last_activity,
    teacherId: row.teacher_id || null,
    grupo: row.grupo || '',
    ...(row.email === INVITADO_COMUN ? { comun: true } : {}),
    teacherName: row.teacher_id ? (db.prepare('SELECT name FROM users WHERE id = ?').get(row.teacher_id)?.name || '') : '',
    mustChangePassword: Boolean(row.must_change_password),
});

// Coherencia entre secciones de un proyecto (misma evaluación que ve el estudiante en Mi proyecto).
const coherenciaDe = (rawData) => {
    try {
        const { score, nivel, evaluados } = evaluarCoherencia(JSON.parse(rawData || '{}'));
        return score === null ? null : { score, nivel, evaluados };
    } catch {
        return null;
    }
};

const ADMIN_USERS_SQL = `
    SELECT users.*, COUNT(projects.id) AS project_count, MAX(projects.updated_at) AS last_activity
    FROM users LEFT JOIN projects ON projects.user_id = users.id`;

app.get('/api/admin/users', requireAdmin, (_req, res) => {
    const rows = db.prepare(`${ADMIN_USERS_SQL} GROUP BY users.id ORDER BY users.created_at DESC, users.id DESC`).all();
    const counts = { total: rows.length, active: 0, pending: 0, blocked: 0 };
    rows.forEach((row) => { if (counts[row.status] !== undefined) counts[row.status] += 1; });
    // Coherencia del proyecto más reciente de cada usuario.
    const latest = db.prepare(`
        SELECT p.user_id, p.data FROM projects p
        WHERE p.id = (SELECT id FROM projects WHERE user_id = p.user_id ORDER BY updated_at DESC, id DESC LIMIT 1)`).all();
    const byUser = new Map(latest.map((row) => [row.user_id, coherenciaDe(row.data)]));
    res.json({ users: rows.map((row) => ({ ...adminUserRow(row), coherencia: byUser.get(row.id) || null })), counts, mail: Boolean(mailer) });
});

app.get('/api/admin/users/:id', requireAdmin, (req, res) => {
    const row = db.prepare(`${ADMIN_USERS_SQL} WHERE users.id = ? GROUP BY users.id`).get(Number(req.params.id));
    if (!row) return res.status(404).json({ error: 'No se encontró el usuario.' });
    const projects = db.prepare('SELECT id, name, data, created_at, updated_at FROM projects WHERE user_id = ? ORDER BY updated_at DESC, id DESC').all(row.id);
    return res.json({
        user: adminUserRow(row),
        projects: projects.map((project) => ({ ...projectRow(project, false), ...resumenProyecto(project.data), coherencia: coherenciaDe(project.data) })),
    });
});

// Todos los proyectos de la plataforma, con su dueño, avance y coherencia (para la pestaña «Proyectos»).
app.get('/api/admin/projects', requireAdmin, (_req, res) => {
    const rows = db.prepare(`
        SELECT p.id, p.name, p.data, p.created_at, p.updated_at, u.id AS owner_id, u.name AS owner, u.email AS owner_email, u.role AS owner_role, u.grupo AS owner_grupo, u.teacher_id AS owner_teacher,
               (SELECT COUNT(*) FROM project_members m WHERE m.project_id = p.id) AS miembros
        FROM projects p JOIN users u ON u.id = p.user_id ORDER BY p.updated_at DESC, p.id DESC LIMIT 2000`).all();
    res.json({
        projects: rows.map((r) => ({
            id: r.id, name: r.name, createdAt: r.created_at, updatedAt: r.updated_at,
            ownerId: r.owner_id, owner: r.owner, ownerEmail: r.owner_email, ownerRole: r.owner_role, ownerGrupo: r.owner_grupo || '', ownerTeacherId: r.owner_teacher || null, miembros: r.miembros,
            ...resumenProyecto(r.data), coherencia: coherenciaDe(r.data),
        })),
    });
});

app.get('/api/admin/projects/:id', requireAdmin, (req, res) => {
    const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(Number(req.params.id));
    if (!row) return res.status(404).json({ error: 'No se encontró el proyecto.' });
    const owner = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(row.user_id);
    return res.json({ project: projectRow(row), owner });
});

// Corregir el nombre o el correo (usuario) de una cuenta. Si cambia el correo, se cierran sus sesiones
// y sus invitaciones a proyectos de compañeros pasan al correo nuevo.
app.put('/api/admin/users/:id', requireAdmin, (req, res) => {
    const target = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(req.params.id));
    if (!target) return res.status(404).json({ error: 'No se encontró el usuario.' });
    if (target.role === 'admin') return res.status(400).json({ error: 'El administrador cambia sus datos desde su cuenta.' });
    if (esInvitadoComun(target)) return res.status(400).json({ error: 'Es la cuenta compartida de «Entrar como invitado»: no se modifica. Para cerrar esa entrada, bloquéala.' });
    const name = String(req.body?.name ?? target.name).trim().replace(/\s+/g, ' ').slice(0, 80);
    const email = String(req.body?.email ?? target.email).trim().toLowerCase().slice(0, 160);
    const grupo = req.body?.grupo === undefined ? (target.grupo || '') : grupoLimpio(req.body.grupo);
    if (!name) return res.status(400).json({ error: 'Falta el nombre.' });
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'El correo no es válido.' });
    if (email !== target.email && db.prepare('SELECT 1 FROM users WHERE email = ? AND id != ?').get(email, target.id)) return res.status(400).json({ error: 'Ya existe una cuenta con ese correo.' });
    db.transaction(() => {
        db.prepare('UPDATE users SET name = ?, email = ?, grupo = ? WHERE id = ?').run(name, email, grupo, target.id);
        if (email !== target.email) {
            db.prepare('UPDATE OR IGNORE project_members SET email = ? WHERE email = ?').run(email, target.email);
            db.prepare('DELETE FROM project_members WHERE email = ?').run(target.email);
            db.prepare('DELETE FROM sessions WHERE user_id = ?').run(target.id);
            db.prepare('DELETE FROM email_tokens WHERE user_id = ?').run(target.id);
        }
    })();
    bitacora(req, 'Modificó una cuenta', `${target.name} (${target.email})${email !== target.email ? ` → ${email}` : ''}${name !== target.name ? ` → ${name}` : ''}${grupo !== (target.grupo || '') ? ` → grupo «${grupo || 'ninguno'}»` : ''}`);
    const row = db.prepare(`${ADMIN_USERS_SQL} WHERE users.id = ? GROUP BY users.id`).get(target.id);
    return res.json({ user: adminUserRow(row) });
});

// Borra la cuenta y lo que cuelga de ella: sus estudiantes quedan sin profesor, salen sus invitaciones,
// y sesiones, enlaces y proyectos caen en cascada.
const borrarCuenta = (target, actor = '') => db.transaction(() => {
    archivarCuenta(target, actor);
    db.prepare('UPDATE users SET teacher_id = NULL WHERE teacher_id = ?').run(target.id);
    db.prepare('DELETE FROM project_members WHERE email = ?').run(target.email);
    db.prepare('DELETE FROM users WHERE id = ?').run(target.id);
})();

// Eliminar una cuenta para siempre, con sus proyectos (y sus versiones, figuras y encuestas).
// Antes se guarda una copia de seguridad, por si hubiera que recuperar algo.
app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
    const target = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(req.params.id));
    if (!target) return res.status(404).json({ error: 'No se encontró el usuario.' });
    if (target.role === 'admin') return res.status(400).json({ error: 'No se puede eliminar a un administrador.' });
    if (esInvitadoComun(target)) return res.status(400).json({ error: 'Es la cuenta compartida de «Entrar como invitado»: no se modifica. Para cerrar esa entrada, bloquéala.' });
    const proyectos = db.prepare('SELECT COUNT(*) AS n FROM projects WHERE user_id = ?').get(target.id).n;
    if (proyectos > 0 && !(await runBackup())) return res.status(500).json({ error: 'No se pudo crear la copia de seguridad previa, así que la cuenta no se eliminó. Inténtalo de nuevo.' });
    borrarCuenta(target, req.user.name);
    bitacora(req, 'Eliminó una cuenta', `${target.name} (${target.email}), ${ROL_NOMBRE[target.role] || target.role}, ${proyectos} ${proyectos === 1 ? 'proyecto' : 'proyectos'}`);
    return res.json({ ok: true, proyectos });
});

// El mismo cambio a muchas cuentas de una vez (hasta 1000): con cientos de usuarios no se puede ir de una en una.
//   action: 'teacher' | 'group' | 'limit' | 'status' | 'role' | 'access' | 'delete'
// Los administradores nunca entran en el lote. No se envían correos uno por uno, salvo al dar contraseñas nuevas.
const LOTE_MAX = 1000;
app.post('/api/admin/users/bulk', requireAdmin, async (req, res) => {
    const ids = [...new Set((Array.isArray(req.body?.ids) ? req.body.ids : []).map(Number).filter(Number.isInteger))].slice(0, LOTE_MAX);
    const action = String(req.body?.action || '');
    const value = req.body?.value;
    if (!ids.length) return res.status(400).json({ error: 'No hay cuentas seleccionadas.' });
    const marcas = ids.map(() => '?').join(',');
    // La cuenta compartida de invitados solo entra en el lote para bloquearla o activarla.
    const cuentas = db.prepare(`SELECT * FROM users WHERE id IN (${marcas}) AND role != 'admin'`).all(...ids).filter((u) => !esInvitadoComun(u) || action === 'status');
    let aplica = cuentas;
    let hacer;
    let texto;
    const credenciales = [];

    if (action === 'teacher') {
        const prof = value ? db.prepare("SELECT id, name FROM users WHERE id = ? AND role = 'teacher'").get(Number(value)) : null;
        if (value && !prof) return res.status(400).json({ error: 'El profesor indicado no existe.' });
        aplica = cuentas.filter((u) => u.role === 'student');
        const upd = db.prepare('UPDATE users SET teacher_id = ? WHERE id = ?');
        hacer = (u) => upd.run(prof ? prof.id : null, u.id);
        texto = prof ? `Asignó profesor (${prof.name})` : 'Quitó el profesor a cargo';
    } else if (action === 'group') {
        const grupo = grupoLimpio(value);
        const upd = db.prepare('UPDATE users SET grupo = ? WHERE id = ?');
        hacer = (u) => upd.run(grupo, u.id);
        texto = grupo ? `Puso en el grupo «${grupo}»` : 'Sacó del grupo';
    } else if (action === 'limit') {
        const limit = parseInt(value, 10);
        if (!Number.isInteger(limit) || limit < 0 || limit > MAX_PROJECTS) return res.status(400).json({ error: `El cupo debe estar entre 0 y ${MAX_PROJECTS}.` });
        aplica = cuentas.filter((u) => u.role !== 'guest'); // un invitado no crea proyectos
        const upd = db.prepare('UPDATE users SET project_limit = ? WHERE id = ?');
        hacer = (u) => upd.run(limit, u.id);
        texto = `Puso el cupo en ${limit}`;
    } else if (action === 'status') {
        if (!['active', 'blocked'].includes(value)) return res.status(400).json({ error: 'Estado no válido.' });
        aplica = cuentas.filter((u) => u.status !== value);
        const upd = db.prepare('UPDATE users SET status = ? WHERE id = ?');
        const cerrar = db.prepare('DELETE FROM sessions WHERE user_id = ?');
        const activar = db.prepare("DELETE FROM email_tokens WHERE user_id = ? AND purpose = 'activate'");
        hacer = (u) => { upd.run(value, u.id); if (value === 'blocked') cerrar.run(u.id); else activar.run(u.id); };
        texto = value === 'blocked' ? 'Bloqueó' : 'Activó';
    } else if (action === 'role') {
        if (!ROLES.includes(value) || value === 'admin') return res.status(400).json({ error: 'Rol no válido.' });
        aplica = cuentas.filter((u) => u.role !== value);
        const upd = db.prepare('UPDATE users SET role = ?, teacher_id = ?, project_limit = ? WHERE id = ?');
        const soltar = db.prepare('UPDATE users SET teacher_id = NULL WHERE teacher_id = ?');
        hacer = (u) => {
            const cupo = cupoAlCambiar(value, u.project_limit);
            upd.run(value, value === 'student' ? u.teacher_id : null, cupo, u.id);
            if (u.role === 'teacher') soltar.run(u.id);
        };
        texto = `Cambió el rol a ${ROL_NOMBRE[value] || value}`;
    } else if (action === 'access') {
        if (cuentas.length > 300) return res.status(400).json({ error: 'Las contraseñas nuevas se dan a 300 cuentas como máximo cada vez.' });
        for (const u of cuentas) {
            // eslint-disable-next-line no-await-in-loop
            const r = await renovarAcceso(u, 'El administrador');
            credenciales.push({ name: u.name, email: u.email, ok: true, clave: r.clave, emailSent: r.emailSent });
        }
        texto = 'Dio contraseñas nuevas';
    } else if (action === 'delete') {
        const conProyectos = db.prepare(`SELECT COUNT(*) AS n FROM projects WHERE user_id IN (${cuentas.map(() => '?').join(',') || 'NULL'})`).get(...cuentas.map((u) => u.id)).n;
        if (conProyectos > 0 && !(await runBackup())) return res.status(500).json({ error: 'No se pudo crear la copia de seguridad previa, así que no se eliminó nada. Inténtalo de nuevo.' });
        hacer = (u) => borrarCuenta(u, req.user.name);
        texto = `Eliminó (con ${conProyectos} ${conProyectos === 1 ? 'proyecto' : 'proyectos'})`;
    } else {
        return res.status(400).json({ error: 'Acción no válida.' });
    }

    if (hacer) db.transaction(() => aplica.forEach(hacer))();
    if (aplica.length) bitacora(req, `${texto}: ${aplica.length} ${aplica.length === 1 ? 'cuenta' : 'cuentas'}`, aplica.slice(0, 12).map((u) => u.email).join(', ') + (aplica.length > 12 ? '…' : ''));
    return res.json({ hechas: aplica.length, omitidas: ids.length - aplica.length, ...(action === 'access' ? { cuentas: credenciales, mail: Boolean(mailer) } : {}) });
});

// Cambiar el nombre de un grupo (a todas sus cuentas), unirlo con otro que ya exista o quitarlo (to vacío).
app.post('/api/admin/groups/rename', requireAdmin, (req, res) => {
    const from = grupoLimpio(req.body?.from);
    const to = grupoLimpio(req.body?.to);
    if (!from) return res.status(400).json({ error: 'Falta el grupo que se va a cambiar.' });
    if (from === to) return res.status(400).json({ error: 'El nombre nuevo es igual al actual.' });
    const n = db.prepare('SELECT COUNT(*) AS n FROM users WHERE grupo = ?').get(from).n;
    if (!n) return res.status(404).json({ error: 'No hay cuentas en ese grupo.' });
    const unido = to ? db.prepare('SELECT COUNT(*) AS n FROM users WHERE grupo = ?').get(to).n > 0 : false;
    db.prepare('UPDATE users SET grupo = ? WHERE grupo = ?').run(to, from);
    bitacora(req, !to ? 'Quitó un grupo' : unido ? 'Unió dos grupos' : 'Cambió el nombre de un grupo', `«${from}»${to ? ` → «${to}»` : ''}, ${n} ${n === 1 ? 'cuenta' : 'cuentas'}`);
    return res.json({ cuentas: n, unido, grupo: to });
});

// Traspasar un proyecto a otra cuenta (cambia el dueño; no se copia nada). El dueño anterior puede quedar invitado.
app.post('/api/admin/projects/:id/transfer', requireAdmin, (req, res) => {
    const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(Number(req.params.id));
    if (!row) return res.status(404).json({ error: 'No se encontró el proyecto.' });
    const nuevo = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(Number(req.body?.userId));
    if (!nuevo) return res.status(400).json({ error: 'La cuenta de destino no existe.' });
    if (nuevo.id === row.user_id) return res.status(400).json({ error: 'El proyecto ya es de esa cuenta.' });
    const anterior = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(row.user_id);
    db.transaction(() => {
        db.prepare('UPDATE projects SET user_id = ? WHERE id = ?').run(nuevo.id, row.id);
        db.prepare('DELETE FROM project_members WHERE project_id = ? AND email = ?').run(row.id, nuevo.email); // el dueño no figura como invitado
        if (req.body?.keepAccess && anterior && String(anterior.email).includes('@')) db.prepare('INSERT OR IGNORE INTO project_members (project_id, email) VALUES (?, ?)').run(row.id, anterior.email);
    })();
    bitacora(req, 'Traspasó un proyecto', `«${row.name}» (#${row.id}): de ${anterior?.email || 'cuenta eliminada'} a ${nuevo.email}${req.body?.keepAccess ? '; el anterior queda invitado' : ''}`);
    return res.json({ project: projectRow(db.prepare('SELECT * FROM projects WHERE id = ?').get(row.id)), owner: nuevo });
});

// Duplicar un proyecto en otra cuenta (o en la misma), como plantilla: copia el contenido y las figuras;
// no copia el historial de versiones, los invitados ni las encuestas con sus respuestas.
app.post('/api/admin/projects/:id/duplicate', requireAdmin, (req, res) => {
    const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(Number(req.params.id));
    if (!row) return res.status(404).json({ error: 'No se encontró el proyecto.' });
    const destino = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(Number(req.body?.userId) || row.user_id);
    if (!destino) return res.status(400).json({ error: 'La cuenta de destino no existe.' });
    const nombre = cleanName(req.body?.name || `${row.name} (copia)`);
    let nuevoId;
    db.transaction(() => {
        nuevoId = Number(db.prepare('INSERT INTO projects (user_id, name, data, key_meta) VALUES (?, ?, ?, ?)').run(destino.id, nombre, row.data, '{}').lastInsertRowid);
        // Las figuras se copian con otro número: se corrige ese número donde el contenido las menciona.
        const mapa = new Map();
        const copiar = db.prepare('INSERT INTO project_files (project_id, mime, data) VALUES (?, ?, ?)');
        db.prepare('SELECT id, mime, data FROM project_files WHERE project_id = ?').all(row.id).forEach((f) => mapa.set(f.id, Number(copiar.run(nuevoId, f.mime, f.data).lastInsertRowid)));
        if (mapa.size) {
            const cambiar = (v) => {
                if (Array.isArray(v)) return v.map(cambiar);
                if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, k === 'fileId' && mapa.has(Number(x)) ? mapa.get(Number(x)) : cambiar(x)]));
                return v;
            };
            let datos = null;
            try { datos = JSON.stringify(cambiar(JSON.parse(row.data))); } catch { /* contenido ilegible: se deja igual */ }
            if (datos) db.prepare('UPDATE projects SET data = ? WHERE id = ?').run(datos, nuevoId);
        }
    })();
    bitacora(req, 'Duplicó un proyecto', `«${row.name}» (#${row.id}) → «${nombre}» (#${nuevoId}) para ${destino.email}`);
    return res.status(201).json({ project: projectRow(db.prepare('SELECT * FROM projects WHERE id = ?').get(nuevoId), false), owner: destino });
});

// Uso de la plataforma en los últimos días: actividad por día, por tipo, por grupo y las cuentas que más la usan.
const TIPOS_USO = ['ingreso', 'guardado', 'ia', 'articulos', 'teorias', 'normas'];
app.get('/api/admin/usage', requireAdmin, (req, res) => {
    const dias = Math.min(90, Math.max(7, parseInt(req.query.days, 10) || 30));
    const desde = diaDe(Date.now() - (dias - 1) * 86400000);
    const porDia = new Map();
    for (let i = dias - 1; i >= 0; i -= 1) porDia.set(diaDe(Date.now() - i * 86400000), { day: diaDe(Date.now() - i * 86400000), activos: 0, ...Object.fromEntries(TIPOS_USO.map((t) => [t, 0])) });
    db.prepare('SELECT day, kind, SUM(n) AS n FROM usage_daily WHERE day >= ? GROUP BY day, kind').all(desde).forEach((r) => { const d = porDia.get(r.day); if (d && TIPOS_USO.includes(r.kind)) d[r.kind] = r.n; });
    db.prepare('SELECT day, COUNT(DISTINCT user_id) AS n FROM usage_daily WHERE day >= ? AND user_id > 0 GROUP BY day').all(desde).forEach((r) => { const d = porDia.get(r.day); if (d) d.activos = r.n; });
    const grupos = new Map();
    db.prepare(`SELECT u.grupo AS grupo, d.kind AS kind, SUM(d.n) AS n, COUNT(DISTINCT d.user_id) AS cuentas
                FROM usage_daily d JOIN users u ON u.id = d.user_id WHERE d.day >= ? GROUP BY u.grupo, d.kind`).all(desde).forEach((r) => {
        const g = grupos.get(r.grupo || '') || { grupo: r.grupo || '', cuentas: 0, ...Object.fromEntries(TIPOS_USO.map((t) => [t, 0])) };
        if (TIPOS_USO.includes(r.kind)) g[r.kind] = r.n;
        g.cuentas = Math.max(g.cuentas, r.cuentas);
        grupos.set(r.grupo || '', g);
    });
    const top = db.prepare(`SELECT u.id, u.name, u.email, u.grupo, SUM(d.n) AS total, SUM(CASE WHEN d.kind = 'ia' THEN d.n ELSE 0 END) AS ia,
                                   SUM(CASE WHEN d.kind = 'guardado' THEN d.n ELSE 0 END) AS guardado, COUNT(DISTINCT d.day) AS dias
                            FROM usage_daily d JOIN users u ON u.id = d.user_id WHERE d.day >= ? GROUP BY u.id ORDER BY total DESC LIMIT 10`).all(desde);
    const hoy = diaDe();
    res.json({
        dias,
        desde: db.prepare('SELECT MIN(day) AS d FROM usage_daily').get().d || null,
        serie: [...porDia.values()],
        grupos: [...grupos.values()].sort((a, b) => (b.ia + b.guardado) - (a.ia + a.guardado)),
        top,
        activosPeriodo: db.prepare('SELECT COUNT(DISTINCT user_id) AS n FROM usage_daily WHERE day >= ? AND user_id > 0').get(desde).n,
        cuentas: db.prepare("SELECT COUNT(*) AS n FROM users WHERE role != 'admin'").get().n,
        normas: {
            configurada: Boolean(RULEX_API_KEY),
            consultasHoy: db.prepare("SELECT COALESCE(SUM(n), 0) AS n FROM usage_daily WHERE day = ? AND kind = 'normas_consulta'").get(hoy).n,
            restantes: normasRestantes,
            limite: 150,
        },
    });
});

// Papelera: cuentas eliminadas en los últimos 30 días.
const filaPapelera = (r) => ({ id: r.id, deletedAt: r.deleted_at, deletedBy: r.deleted_by, name: r.name, email: r.email, role: r.role, grupo: r.grupo, projects: r.projects, venceEn: Math.max(0, Math.ceil((r.deleted_at + PAPELERA_DIAS * 86400000 - Date.now()) / 86400000)) });
app.get('/api/admin/trash', requireAdmin, (_req, res) => {
    vaciarPapeleraVieja();
    const rows = db.prepare('SELECT id, deleted_at, deleted_by, name, email, role, grupo, projects FROM deleted_users ORDER BY id DESC').all();
    res.json({ trash: rows.map(filaPapelera), dias: PAPELERA_DIAS });
});

// Restaurar: vuelve la cuenta con el mismo usuario y contraseña, y sus proyectos como estaban.
app.post('/api/admin/trash/:id/restore', requireAdmin, (req, res) => {
    const row = db.prepare('SELECT * FROM deleted_users WHERE id = ?').get(Number(req.params.id));
    if (!row) return res.status(404).json({ error: 'Esa cuenta ya no está en la papelera.' });
    if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(row.email)) return res.status(400).json({ error: `Ya existe otra cuenta con el correo ${row.email}. Cámbiale el correo a esa cuenta o elimínala antes de restaurar.` });
    let copia;
    try { copia = JSON.parse(row.data); } catch { return res.status(500).json({ error: 'La copia de esta cuenta está dañada y no se puede restaurar.' }); }
    try {
        db.transaction(() => {
            const user = { ...copia.user };
            if (user.teacher_id && !db.prepare("SELECT 1 FROM users WHERE id = ? AND role = 'teacher'").get(user.teacher_id)) user.teacher_id = null;
            reinsertar('users', [user]);
            reinsertar('projects', copia.projects);
            reinsertar('project_versions', copia.project_versions);
            reinsertar('project_files', copia.project_files);
            reinsertar('surveys', copia.surveys);
            reinsertar('survey_responses', copia.survey_responses);
            reinsertar('project_members', copia.project_members);
            // Invitaciones a proyectos de otros: solo las de proyectos que siguen existiendo.
            const hay = db.prepare('SELECT 1 FROM projects WHERE id = ?');
            const invitar = db.prepare('INSERT OR IGNORE INTO project_members (project_id, email, added_at) VALUES (?, ?, ?)');
            (copia.invitaciones || []).forEach((m) => { if (hay.get(m.project_id)) invitar.run(m.project_id, m.email, m.added_at); });
            // Si era profesor, vuelven a su cargo los estudiantes que siguen sin profesor.
            const volver = db.prepare("UPDATE users SET teacher_id = ? WHERE id = ? AND role = 'student' AND teacher_id IS NULL");
            if (user.role === 'teacher') (copia.estudiantes || []).forEach((id) => volver.run(user.id, id));
            db.prepare('DELETE FROM deleted_users WHERE id = ?').run(row.id);
        })();
    } catch (error) {
        logError('servidor', 'No se pudo restaurar una cuenta de la papelera', error?.message);
        return res.status(500).json({ error: 'No se pudo restaurar la cuenta; quedó en la papelera sin cambios.' });
    }
    bitacora(req, 'Restauró una cuenta', `${row.name} (${row.email}), ${row.projects} ${row.projects === 1 ? 'proyecto' : 'proyectos'}`);
    const fila = db.prepare(`${ADMIN_USERS_SQL} WHERE users.id = ? GROUP BY users.id`).get(row.user_id);
    return res.json({ user: adminUserRow(fila) });
});

// Borrar definitivamente de la papelera (una, o todas con /api/admin/trash).
app.delete('/api/admin/trash/:id', requireAdmin, (req, res) => {
    const row = db.prepare('SELECT name, email FROM deleted_users WHERE id = ?').get(Number(req.params.id));
    if (!row) return res.status(404).json({ error: 'Esa cuenta ya no está en la papelera.' });
    db.prepare('DELETE FROM deleted_users WHERE id = ?').run(Number(req.params.id));
    bitacora(req, 'Borró definitivamente de la papelera', `${row.name} (${row.email})`);
    return res.json({ ok: true });
});
app.delete('/api/admin/trash', requireAdmin, (req, res) => {
    const n = db.prepare('DELETE FROM deleted_users').run().changes;
    if (n) bitacora(req, 'Vació la papelera', `${n} ${n === 1 ? 'cuenta' : 'cuentas'}`);
    return res.json({ ok: true, borradas: n });
});

// Últimos cambios hechos a las cuentas (para la pestaña «Sistema»).
// La búsqueda va en el cuerpo (POST) para que un correo no quede escrito en la dirección ni en los registros del servidor web.
const verRegistro = (req, res) => {
    const q = String(req.body?.q || '').trim().toLowerCase().slice(0, 160).replace(/[%_\\]/g, (c) => `\\${c}`);
    const rows = q
        ? db.prepare("SELECT id, created_at, actor, action, detail FROM admin_log WHERE lower(detail) LIKE ? ESCAPE '\\' OR lower(action) LIKE ? ESCAPE '\\' OR lower(actor) LIKE ? ESCAPE '\\' ORDER BY id DESC LIMIT 300").all(`%${q}%`, `%${q}%`, `%${q}%`)
        : db.prepare('SELECT id, created_at, actor, action, detail FROM admin_log ORDER BY id DESC LIMIT 300').all();
    res.json({ log: rows.map((r) => ({ id: r.id, createdAt: r.created_at, actor: r.actor, action: r.action, detail: r.detail })) });
};
app.get('/api/admin/log', requireAdmin, verRegistro);
app.post('/api/admin/log', requireAdmin, verRegistro);

app.post('/api/admin/users/:id/status', requireAdmin, async (req, res) => {
    const status = String(req.body?.status || '');
    if (!['active', 'blocked'].includes(status)) return res.status(400).json({ error: 'Estado no válido.' });
    const target = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(req.params.id));
    if (!target) return res.status(404).json({ error: 'No se encontró el usuario.' });
    if (target.role === 'admin') return res.status(400).json({ error: 'No se puede cambiar el estado de un administrador.' });

    db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, target.id);
    if (status === 'blocked') db.prepare('DELETE FROM sessions WHERE user_id = ?').run(target.id);
    if (status === 'active') db.prepare("DELETE FROM email_tokens WHERE user_id = ? AND purpose = 'activate'").run(target.id);
    bitacora(req, status === 'blocked' ? 'Bloqueó una cuenta' : 'Activó una cuenta', `${target.name} (${target.email})`);

    const row = db.prepare(`${ADMIN_USERS_SQL} WHERE users.id = ? GROUP BY users.id`).get(target.id);
    return res.json({ user: adminUserRow(row) });
});

// Cuántos proyectos puede crear una cuenta (0 = ninguno). No borra proyectos que ya existan.
app.post('/api/admin/users/:id/limit', requireAdmin, async (req, res) => {
    const limit = parseInt(req.body?.limit, 10);
    if (!Number.isInteger(limit) || limit < 0 || limit > MAX_PROJECTS) return res.status(400).json({ error: `El cupo debe estar entre 0 y ${MAX_PROJECTS}.` });
    const target = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(req.params.id));
    if (!target) return res.status(404).json({ error: 'No se encontró el usuario.' });
    if (target.role === 'admin') return res.status(400).json({ error: 'El administrador no tiene cupo.' });
    if (target.role === 'guest') return res.status(400).json({ error: 'Un invitado solo ve las presentaciones: no crea proyectos. Cámbiale el rol primero.' });
    db.prepare('UPDATE users SET project_limit = ? WHERE id = ?').run(limit, target.id);
    bitacora(req, 'Cambió un cupo', `${target.name} (${target.email}): ${limit}`);
    // Primera autorización: se le avisa al estudiante que ya puede empezar.
    if (!Number(target.project_limit) && limit > 0 && mailer && String(target.email).includes('@')) {
        mailer.sendMail({
            from: MAIL_FROM,
            to: target.email,
            subject: 'Ya puedes crear tu proyecto en PROJECTSIA',
            text: `Hola ${target.name}:\n\nEl administrador autorizó tu cuenta para crear ${limit === 1 ? 'un proyecto' : `hasta ${limit} proyectos`}. Entra a ${APP_URL} para empezar.`,
        }).catch((error) => { console.error('No se pudo avisar al estudiante', error?.message); logError('correo', 'No se pudo avisar al estudiante de su cupo', error?.message, target.id); });
    }
    const row = db.prepare(`${ADMIN_USERS_SQL} WHERE users.id = ? GROUP BY users.id`).get(target.id);
    return res.json({ user: adminUserRow(row) });
});

app.post('/api/admin/users/:id/resend', requireAdmin, async (req, res) => {
    const target = db.prepare("SELECT * FROM users WHERE id = ? AND status = 'pending'").get(Number(req.params.id));
    if (!target) return res.status(400).json({ error: 'Ese usuario no tiene una activación pendiente.' });
    const emailSent = await sendActivation(target);
    if (!emailSent) return res.status(503).json({ error: 'No se pudo enviar el correo. Revisa la configuración de correo o activa la cuenta manualmente.' });
    return res.json({ ok: true });
});

/* ---------- Cuentas: las crea el administrador (y el profesor, las de sus estudiantes) ---------- */

// Contraseña temporal legible (sin 0/O ni 1/l): se muestra una sola vez a quien crea la cuenta.
const claveTemporal = () => {
    const letras = 'abcdefghjkmnpqrstuvwxyz23456789';
    return Array.from(crypto.randomBytes(10), (b) => letras[b % letras.length]).join('');
};

// Correo de bienvenida con un enlace para que la persona cree su propia contraseña (vale 72 horas).
const sendInvite = async (user, creador) => {
    if (!mailer || !String(user.email).includes('@')) return false;
    const token = crypto.randomBytes(32).toString('hex');
    db.prepare("DELETE FROM email_tokens WHERE user_id = ? AND purpose = 'reset'").run(user.id);
    db.prepare("INSERT INTO email_tokens (token_hash, user_id, purpose, expires_at) VALUES (?, ?, 'reset', ?)").run(sha256(token), user.id, Date.now() + 72 * 3600 * 1000);
    const link = `${APP_URL}/?restablecer=${token}`;
    const rol = ROL_NOMBRE[user.role] || 'usuario';
    try {
        await mailer.sendMail({
            from: MAIL_FROM,
            to: user.email,
            subject: 'Tu cuenta de PROJECTSIA',
            text: `Hola ${user.name}:\n\n${creador} te creó una cuenta de ${rol} en PROJECTSIA. Para entrar, crea tu contraseña en este enlace:\n${link}\n\nEl enlace vence en 72 horas. Tu usuario es este correo: ${user.email}`,
            html: `<p>Hola ${escapeHtml(user.name)}:</p><p>${escapeHtml(creador)} te creó una cuenta de ${rol} en PROJECTSIA. Para entrar, crea tu contraseña:</p><p><a href="${link}">Crear mi contraseña</a></p><p>El enlace vence en 72 horas. Tu usuario es este correo: ${escapeHtml(user.email)}</p>`,
        });
        return true;
    } catch (error) {
        logError('correo', 'No se pudo enviar la invitación de la cuenta', error?.message, user.id);
        return false;
    }
};

// Crea una cuenta activa con contraseña temporal (que debe cambiar al entrar). Devuelve { user, clave, emailSent } o { error }.
const crearCuenta = async ({ name, email, role, teacherId = null, projectLimit = null, grupo = '' }, creador) => {
    const nombre = String(name || '').trim().replace(/\s+/g, ' ').slice(0, 80);
    const correo = String(email || '').trim().toLowerCase().slice(0, 160);
    if (!nombre) return { error: 'Falta el nombre.' };
    if (!EMAIL_RE.test(correo)) return { error: 'El correo no es válido.' };
    if (!ROLES.includes(role) || role === 'admin') return { error: 'El rol no es válido.' };
    if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(correo)) return { error: 'Ya existe una cuenta con ese correo.' };
    if (role === 'student' && teacherId) {
        const prof = db.prepare("SELECT role FROM users WHERE id = ?").get(teacherId);
        if (!prof || prof.role !== 'teacher') return { error: 'El profesor indicado no existe.' };
    }
    const clave = claveTemporal();
    const cupo = role === 'guest' ? 0 : projectLimit ?? (role === 'student' ? 0 : CUPO_AUTONOMO);
    const info = db.prepare(`INSERT INTO users (email, name, password_hash, role, status, must_change_password, project_limit, teacher_id, grupo)
                             VALUES (?, ?, ?, ?, 'active', 1, ?, ?, ?)`).run(correo, nombre, hashPassword(clave), role, Math.min(MAX_PROJECTS, Math.max(0, cupo)), role === 'student' ? teacherId : null, grupoLimpio(grupo));
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(info.lastInsertRowid));
    const emailSent = await sendInvite(user, creador);
    return { user, clave, emailSent };
};

// Acceso nuevo para una cuenta: otra contraseña temporal (cierra sus sesiones) y, si hay correo, otro enlace.
const renovarAcceso = async (target, creador) => {
    const clave = claveTemporal();
    db.prepare("UPDATE users SET password_hash = ?, must_change_password = 1, status = CASE WHEN status = 'pending' THEN 'active' ELSE status END WHERE id = ?").run(hashPassword(clave), target.id);
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(target.id);
    const emailSent = await sendInvite(target, creador);
    return { clave, emailSent };
};

const crearLimit = rateLimit({ name: 'crear-cuenta', limit: 400, windowMs: 60 * 60 * 1000, key: (req) => String(req.user?.id || req.ip) });

app.post('/api/admin/users', requireAdmin, crearLimit, async (req, res) => {
    const r = await crearCuenta({ name: req.body?.name, email: req.body?.email, role: String(req.body?.role || 'student'), teacherId: Number(req.body?.teacherId) || null, grupo: req.body?.grupo }, 'El administrador');
    if (r.error) return res.status(400).json({ error: r.error });
    bitacora(req, 'Creó una cuenta', `${r.user.name} (${r.user.email}), ${ROL_NOMBRE[r.user.role] || r.user.role}`);
    const row = db.prepare(`${ADMIN_USERS_SQL} WHERE users.id = ? GROUP BY users.id`).get(r.user.id);
    return res.status(201).json({ user: adminUserRow(row), clave: r.clave, emailSent: r.emailSent });
});

// Carga por lotes: hasta 300 cuentas. Cada fila se crea por separado y se informa cómo quedó.
// `teacher` (opcional, para estudiantes) es el correo de su profesor, que puede venir en el mismo lote antes que él.
app.post('/api/admin/users/batch', requireAdmin, crearLimit, async (req, res) => {
    const filas = Array.isArray(req.body?.users) ? req.body.users.slice(0, 300) : [];
    if (!filas.length) return res.status(400).json({ error: 'No hay filas para cargar.' });
    const resultados = [];
    for (const fila of filas) {
        const email = String(fila?.email || '').trim().toLowerCase();
        const role = String(fila?.role || 'student');
        let teacherId = null;
        const correoProfesor = String(fila?.teacher || '').trim().toLowerCase();
        // Con «actualizar»: si la cuenta ya existe, se le cambia lo que la fila traiga (rol, profesor, grupo); lo vacío no se toca.
        const existente = req.body?.update ? db.prepare('SELECT * FROM users WHERE email = ?').get(email) : null;
        if (existente) {
            const base = { email, name: existente.name };
            if (existente.role === 'admin' || esInvitadoComun(existente)) { resultados.push({ ...base, ok: false, error: 'Esa cuenta no se cambia por lote.' }); continue; }
            const rolNuevo = fila?.role && ROLES.includes(String(fila.role)) && fila.role !== 'admin' ? String(fila.role) : existente.role;
            const cambios = [];
            let profesorId = rolNuevo === 'student' ? existente.teacher_id : null;
            if (rolNuevo === 'student' && correoProfesor) {
                const quitar = ['ninguno', 'sin profesor', '-'].includes(correoProfesor);
                const prof = quitar ? null : db.prepare("SELECT id FROM users WHERE email = ? AND role = 'teacher'").get(correoProfesor);
                if (!quitar && !prof) { resultados.push({ ...base, ok: false, error: `No existe un profesor con el correo ${correoProfesor}.` }); continue; }
                if ((prof ? prof.id : null) !== (existente.teacher_id || null)) cambios.push(prof ? 'profesor' : 'sin profesor');
                profesorId = prof ? prof.id : null;
            }
            const grupoDado = fila?.group ?? req.body?.group;
            const grupo = grupoDado === undefined || String(grupoDado).trim() === '' ? (existente.grupo || '') : grupoLimpio(grupoDado);
            if (grupo !== (existente.grupo || '')) cambios.push('grupo');
            if (rolNuevo !== existente.role) cambios.push('rol');
            if (cambios.length) {
                const cupo = cupoAlCambiar(rolNuevo, existente.project_limit);
                db.prepare('UPDATE users SET role = ?, teacher_id = ?, grupo = ?, project_limit = ? WHERE id = ?').run(rolNuevo, profesorId, grupo, cupo, existente.id);
                if (existente.role === 'teacher' && rolNuevo !== 'teacher') db.prepare('UPDATE users SET teacher_id = NULL WHERE teacher_id = ?').run(existente.id);
            }
            resultados.push({ ...base, role: rolNuevo, ok: true, actualizada: true, cambios });
            continue;
        }
        if (role === 'student' && correoProfesor) {
            const prof = db.prepare("SELECT id FROM users WHERE email = ? AND role = 'teacher'").get(correoProfesor);
            if (!prof) { resultados.push({ email, name: String(fila?.name || ''), ok: false, error: `No existe un profesor con el correo ${correoProfesor}.` }); continue; }
            teacherId = prof.id;
        }
        // eslint-disable-next-line no-await-in-loop
        const r = await crearCuenta({ name: fila?.name, email, role, teacherId, grupo: fila?.group ?? req.body?.group }, 'El administrador');
        resultados.push(r.error ? { email, name: String(fila?.name || ''), ok: false, error: r.error } : { email: r.user.email, name: r.user.name, role, ok: true, clave: r.clave, emailSent: r.emailSent });
    }
    const creadas = resultados.filter((x) => x.ok && !x.actualizada).length;
    const actualizadas = resultados.filter((x) => x.actualizada && x.cambios.length).length;
    if (creadas || actualizadas) bitacora(req, 'Cargó un lote de cuentas', `${creadas} creadas y ${actualizadas} actualizadas de ${filas.length} filas`);
    return res.json({ resultados, creadas, actualizadas, mail: Boolean(mailer) });
});

// Cambiar el rol (y el profesor a cargo, si es estudiante). Solo el administrador.
app.post('/api/admin/users/:id/role', requireAdmin, (req, res) => {
    const role = String(req.body?.role || '');
    if (!ROLES.includes(role) || role === 'admin') return res.status(400).json({ error: 'Rol no válido.' });
    const target = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(req.params.id));
    if (!target) return res.status(404).json({ error: 'No se encontró el usuario.' });
    if (target.role === 'admin') return res.status(400).json({ error: 'No se puede cambiar el rol de un administrador.' });
    if (esInvitadoComun(target)) return res.status(400).json({ error: 'Es la cuenta compartida de «Entrar como invitado»: no se modifica. Para cerrar esa entrada, bloquéala.' });
    let teacherId = null;
    if (role === 'student' && req.body?.teacherId) {
        const prof = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'teacher'").get(Number(req.body.teacherId));
        if (!prof) return res.status(400).json({ error: 'El profesor indicado no existe.' });
        teacherId = prof.id;
    }
    // Quien pasa a profesor o investigador recibe el cupo propio de ese rol si no tenía ninguno.
    const cupo = cupoAlCambiar(role, target.project_limit);
    db.prepare('UPDATE users SET role = ?, teacher_id = ?, project_limit = ? WHERE id = ?').run(role, teacherId, cupo, target.id);
    bitacora(req, role !== target.role ? 'Cambió un rol' : 'Cambió el profesor a cargo', `${target.name} (${target.email}): ${ROL_NOMBRE[role] || role}${teacherId ? `, profesor #${teacherId}` : ''}`);
    // Si deja de ser profesor, sus estudiantes quedan sin profesor a cargo (el administrador los reasigna).
    if (target.role === 'teacher' && role !== 'teacher') db.prepare('UPDATE users SET teacher_id = NULL WHERE teacher_id = ?').run(target.id);
    const row = db.prepare(`${ADMIN_USERS_SQL} WHERE users.id = ? GROUP BY users.id`).get(target.id);
    return res.json({ user: adminUserRow(row) });
});

app.post('/api/admin/users/:id/access', requireAdmin, crearLimit, async (req, res) => {
    const target = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(req.params.id));
    if (!target) return res.status(404).json({ error: 'No se encontró el usuario.' });
    if (target.role === 'admin') return res.status(400).json({ error: 'El administrador cambia su contraseña desde su cuenta.' });
    if (esInvitadoComun(target)) return res.status(400).json({ error: 'Es la cuenta compartida de «Entrar como invitado»: no se modifica. Para cerrar esa entrada, bloquéala.' });
    bitacora(req, 'Dio una contraseña nueva', `${target.name} (${target.email})`);
    return res.json(await renovarAcceso(target, 'El administrador'));
});

/* ---------- Profesor: sus estudiantes y los proyectos que supervisa ---------- */

const requireTeacher = (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Inicia sesión para continuar.' });
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Esta sección es de los profesores.' });
    if (req.user.must_change_password) return res.status(403).json({ error: 'Cambia tu contraseña antes de continuar.', code: 'must_change_password' });
    return next();
};
// El estudiante de la ruta, solo si está a cargo de este profesor.
const miEstudiante = (req) => db.prepare("SELECT * FROM users WHERE id = ? AND role = 'student' AND teacher_id = ?").get(Number(req.params.id), req.user.id);
const filaEstudiante = (row) => {
    const projects = db.prepare('SELECT id, name, data, created_at, updated_at FROM projects WHERE user_id = ? ORDER BY updated_at DESC, id DESC').all(row.id);
    return {
        id: row.id, name: row.name, email: row.email, status: row.status, grupo: row.grupo || '',
        projectLimit: Number(row.project_limit) || 0,
        lastLoginAt: row.last_login_at, mustChangePassword: Boolean(row.must_change_password),
        projects: projects.map((p) => ({ ...projectRow(p, false), ...resumenProyecto(p.data), coherencia: coherenciaDe(p.data) })),
    };
};

app.get('/api/teacher/students', requireTeacher, (req, res) => {
    const rows = db.prepare("SELECT * FROM users WHERE role = 'student' AND teacher_id = ? ORDER BY name COLLATE NOCASE").all(req.user.id);
    res.json({ students: rows.map(filaEstudiante), mail: Boolean(mailer), cupoMaximo: CUPO_MAX_ESTUDIANTE });
});

app.post('/api/teacher/students', requireTeacher, crearLimit, async (req, res) => {
    const total = db.prepare("SELECT COUNT(*) AS n FROM users WHERE teacher_id = ?").get(req.user.id).n;
    if (total >= 300) return res.status(400).json({ error: 'Llegaste al máximo de 300 estudiantes a tu cargo.' });
    const r = await crearCuenta({ name: req.body?.name, email: req.body?.email, role: 'student', teacherId: req.user.id, projectLimit: req.body?.permitir ? 1 : 0, grupo: req.body?.grupo }, `Tu profesor, ${req.user.name},`);
    if (r.error) return res.status(400).json({ error: r.error });
    bitacora(req, 'Creó a un estudiante', `${r.user.name} (${r.user.email})${r.user.grupo ? `, grupo «${r.user.grupo}»` : ''}`);
    return res.status(201).json({ student: filaEstudiante(r.user), clave: r.clave, emailSent: r.emailSent });
});

// El profesor carga su propia lista: nombre, correo y grupo. Hasta 150 filas por vez y 300 estudiantes en total.
app.post('/api/teacher/students/batch', requireTeacher, crearLimit, async (req, res) => {
    const filas = Array.isArray(req.body?.users) ? req.body.users.slice(0, 150) : [];
    if (!filas.length) return res.status(400).json({ error: 'No hay filas para cargar.' });
    let total = db.prepare('SELECT COUNT(*) AS n FROM users WHERE teacher_id = ?').get(req.user.id).n;
    const resultados = [];
    for (const fila of filas) {
        const base = { email: String(fila?.email || '').trim().toLowerCase(), name: String(fila?.name || '') };
        if (total >= 300) { resultados.push({ ...base, ok: false, error: 'Llegaste al máximo de 300 estudiantes a tu cargo.' }); continue; }
        // eslint-disable-next-line no-await-in-loop
        const r = await crearCuenta({ name: fila?.name, email: fila?.email, role: 'student', teacherId: req.user.id, projectLimit: req.body?.permitir ? 1 : 0, grupo: fila?.group || req.body?.group }, `Tu profesor, ${req.user.name},`);
        if (r.error) { resultados.push({ ...base, ok: false, error: r.error }); continue; }
        total += 1;
        resultados.push({ email: r.user.email, name: r.user.name, ok: true, clave: r.clave, emailSent: r.emailSent });
    }
    const creadas = resultados.filter((x) => x.ok).length;
    if (creadas) bitacora(req, 'Cargó una lista de estudiantes', `${creadas} creadas de ${filas.length} filas`);
    const rows = db.prepare("SELECT * FROM users WHERE role = 'student' AND teacher_id = ? ORDER BY name COLLATE NOCASE").all(req.user.id);
    return res.json({ resultados, creadas, mail: Boolean(mailer), students: rows.map(filaEstudiante) });
});

// El mismo cambio a varios de sus estudiantes: el grupo, o el permiso de crear proyectos.
app.post('/api/teacher/students/bulk', requireTeacher, (req, res) => {
    const ids = [...new Set((Array.isArray(req.body?.ids) ? req.body.ids : []).map(Number).filter(Number.isInteger))].slice(0, 300);
    if (!ids.length) return res.status(400).json({ error: 'No hay estudiantes seleccionados.' });
    const mios = db.prepare(`SELECT * FROM users WHERE id IN (${ids.map(() => '?').join(',')}) AND role = 'student' AND teacher_id = ?`).all(...ids, req.user.id);
    const action = String(req.body?.action || '');
    let texto;
    if (action === 'group') {
        const grupo = grupoLimpio(req.body?.value);
        const upd = db.prepare('UPDATE users SET grupo = ? WHERE id = ?');
        db.transaction(() => mios.forEach((u) => upd.run(grupo, u.id)))();
        texto = grupo ? `Puso en el grupo «${grupo}»` : 'Sacó del grupo';
    } else if (action === 'limit') {
        const limit = parseInt(req.body?.value, 10);
        if (!Number.isInteger(limit) || limit < 0 || limit > CUPO_MAX_ESTUDIANTE) return res.status(400).json({ error: `El cupo debe estar entre 0 y ${CUPO_MAX_ESTUDIANTE}.` });
        const upd = db.prepare('UPDATE users SET project_limit = ? WHERE id = ?');
        db.transaction(() => mios.forEach((u) => upd.run(limit, u.id)))();
        texto = `Puso el permiso en ${limit}`;
    } else {
        return res.status(400).json({ error: 'Acción no válida.' });
    }
    if (mios.length) bitacora(req, `${texto}: ${mios.length} ${mios.length === 1 ? 'estudiante' : 'estudiantes'}`, mios.slice(0, 12).map((u) => u.email).join(', ') + (mios.length > 12 ? '…' : ''));
    const rows = db.prepare("SELECT * FROM users WHERE role = 'student' AND teacher_id = ? ORDER BY name COLLATE NOCASE").all(req.user.id);
    return res.json({ hechas: mios.length, omitidas: ids.length - mios.length, students: rows.map(filaEstudiante) });
});

// Permitir (o no) que el estudiante cree proyectos: 0 = no puede; hasta CUPO_MAX_ESTUDIANTE.
app.post('/api/teacher/students/:id/limit', requireTeacher, (req, res) => {
    const limit = parseInt(req.body?.limit, 10);
    if (!Number.isInteger(limit) || limit < 0 || limit > CUPO_MAX_ESTUDIANTE) return res.status(400).json({ error: `El cupo debe estar entre 0 y ${CUPO_MAX_ESTUDIANTE}.` });
    const target = miEstudiante(req);
    if (!target) return res.status(404).json({ error: 'Ese estudiante no está a tu cargo.' });
    db.prepare('UPDATE users SET project_limit = ? WHERE id = ?').run(limit, target.id);
    bitacora(req, 'Cambió el permiso de un estudiante', `${target.name} (${target.email}): ${limit}`);
    return res.json({ student: filaEstudiante({ ...target, project_limit: limit }) });
});

app.post('/api/teacher/students/:id/access', requireTeacher, crearLimit, async (req, res) => {
    const target = miEstudiante(req);
    if (!target) return res.status(404).json({ error: 'Ese estudiante no está a tu cargo.' });
    return res.json(await renovarAcceso(target, `Tu profesor, ${req.user.name},`));
});

// Proyecto de un estudiante a cargo, solo para leerlo.
app.get('/api/teacher/projects/:id', requireTeacher, (req, res) => {
    const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(Number(req.params.id));
    const owner = row ? db.prepare("SELECT id, name, email FROM users WHERE id = ? AND role = 'student' AND teacher_id = ?").get(row.user_id, req.user.id) : null;
    if (!row || !owner) return res.status(404).json({ error: 'Ese proyecto no es de un estudiante a tu cargo.' });
    return res.json({ project: projectRow(row), owner });
});

/* ---------- Estado del sistema ---------- */

const STARTED_AT = Date.now();
const aiState = { fails: 0, lastOk: 0, lastError: '' };

app.get('/api/admin/estado', requireAdmin, (_req, res) => {
    const errors = db.prepare(`
        SELECT e.id, e.kind, e.message, e.detail, e.created_at, u.name AS user
        FROM error_log e LEFT JOIN users u ON u.id = e.user_id ORDER BY e.id DESC LIMIT 60`).all();
    res.json({
        startedAt: STARTED_AT,
        mail: Boolean(mailer),
        ai: { configured: Boolean(GROQ_API_KEY), fails: aiState.fails, lastOk: aiState.lastOk, lastError: aiState.lastError },
        backups: listBackups(),
        safety: listSafety(),
        errors: errors.map((e) => ({ id: e.id, kind: e.kind, message: e.message, detail: e.detail, createdAt: e.created_at, user: e.user || '' })),
    });
});

app.post('/api/admin/backups', requireAdmin, async (_req, res) => {
    const result = await runBackup();
    if (!result) return res.status(500).json({ error: 'No se pudo crear la copia. Revisa el registro de errores.' });
    return res.status(201).json({ backup: result, backups: listBackups() });
});

// Restaurar una copia: deja usuarios, proyectos, versiones, figuras y encuestas como estaban ese día.
// Exige escribir RESTAURAR y la contraseña del administrador; antes guarda una copia del estado actual.
// No se reinicia el servidor: los datos se cambian dentro de una sola transacción (si algo falla, no cambia nada).
const TABLAS_RESTAURAR = ['users', 'projects', 'project_members', 'project_versions', 'project_files', 'surveys', 'survey_responses', 'deleted_users'];
let restaurando = false;
app.post('/api/admin/backups/:name/restore', requireAdmin, rateLimit({ name: 'restaurar', limit: 6, windowMs: 60 * 60 * 1000 }), async (req, res) => {
    const found = [...listBackups(), ...listSafety()].find((b) => b.name === req.params.name);
    if (!found) return res.status(404).json({ error: 'No se encontró esa copia.' });
    if (String(req.body?.confirm || '') !== 'RESTAURAR') return res.status(400).json({ error: 'Escribe RESTAURAR para confirmar.' });
    const yo = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
    if (!verifyPassword(String(req.body?.password || ''), yo.password_hash)) return res.status(401).json({ error: 'La contraseña no coincide.' });
    if (restaurando || backupRunning) return res.status(409).json({ error: 'Hay una copia o una restauración en curso. Inténtalo en un momento.' });
    restaurando = true;
    const tmp = path.join(BACKUP_DIR, 'restaurar.db');
    const previaTmp = path.join(BACKUP_DIR, 'previa.db');
    try {
        fs.writeFileSync(tmp, zlib.gunzipSync(fs.readFileSync(path.join(BACKUP_DIR, found.name))), { mode: 0o600 });
        // 1. La copia debe ser una base de PROJECTSIA sana, con al menos un administrador.
        let sana = false;
        let tablas = [];
        const origen = new Database(tmp, { readonly: true });
        try {
            tablas = origen.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map((t) => t.name);
            sana = origen.pragma('integrity_check', { simple: true }) === 'ok' && tablas.includes('users') && tablas.includes('projects')
                && origen.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'admin'").get().n > 0;
        } catch { sana = false; } finally { origen.close(); }
        if (!sana) return res.status(400).json({ error: 'Esa copia está dañada o no es de esta aplicación. No se cambió nada.' });

        // 2. Copia del estado actual, por si hay que volver atrás.
        await db.backup(previaTmp);
        // El nombre lleva la hora al segundo; si ya existe uno igual (dos restauraciones seguidas), se usa el segundo siguiente.
        const nombrePrevia = (ms) => `projectsia-antes-de-restaurar-${new Date(ms).toISOString().slice(0, 19).replace(/:/g, '-')}.db.gz`;
        let cuando = Date.now();
        while (fs.existsSync(path.join(BACKUP_DIR, nombrePrevia(cuando)))) cuando += 1000;
        const previa = nombrePrevia(cuando);
        fs.writeFileSync(path.join(BACKUP_DIR, previa), zlib.gzipSync(fs.readFileSync(previaTmp)), { mode: 0o600 });
        fs.rmSync(previaTmp, { force: true });
        listSafety().slice(5).forEach((old) => fs.rmSync(path.join(BACKUP_DIR, old.name), { force: true }));

        // 3. Cambio de los datos, todo o nada.
        const actor = { id: req.user.id, name: req.user.name };
        db.pragma('foreign_keys = OFF');
        db.exec(`ATTACH DATABASE '${tmp.replace(/'/g, "''")}' AS copia`);
        try {
            db.transaction(() => {
                TABLAS_RESTAURAR.filter((t) => tablas.includes(t)).forEach((t) => {
                    const enCopia = db.prepare(`PRAGMA copia.table_info(${t})`).all().map((c) => c.name);
                    const cols = columnasDe(t).filter((c) => enCopia.includes(c)).join(', ');
                    db.exec(`DELETE FROM main.${t}`);
                    db.exec(`INSERT INTO main.${t} (${cols}) SELECT ${cols} FROM copia.${t}`);
                });
                // Las sesiones y enlaces de cuentas que ya no existen se van; las demás siguen abiertas.
                db.exec('DELETE FROM sessions WHERE user_id NOT IN (SELECT id FROM users)');
                db.exec('DELETE FROM email_tokens WHERE user_id NOT IN (SELECT id FROM users)');
                if (db.pragma('foreign_key_check').length) throw new Error('La copia tiene datos que no encajan entre sí.');
            })();
        } finally {
            db.exec('DETACH DATABASE copia');
            db.pragma('foreign_keys = ON');
        }
        bitacora({ user: actor }, 'Restauró una copia de seguridad', `${found.name}; el estado anterior quedó en ${previa}`);
        const cuenta = (t) => db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get().n;
        return res.json({ ok: true, usuarios: cuenta('users'), proyectos: cuenta('projects'), previa, backups: listBackups(), safety: listSafety() });
    } catch (error) {
        logError('backup', 'No se pudo restaurar la copia de seguridad', error?.message);
        return res.status(500).json({ error: 'No se pudo restaurar la copia. Los datos quedaron como estaban.' });
    } finally {
        restaurando = false;
        fs.rmSync(tmp, { force: true });
        fs.rmSync(previaTmp, { force: true });
    }
});

app.get('/api/admin/backups/:name', requireAdmin, (req, res) => {
    const found = [...listBackups(), ...listSafety()].find((b) => b.name === req.params.name);
    if (!found) return res.status(404).json({ error: 'No se encontró esa copia.' });
    res.setHeader('Content-Type', 'application/gzip');
    res.setHeader('Content-Disposition', `attachment; filename="${found.name}"`);
    return fs.createReadStream(path.join(BACKUP_DIR, found.name)).pipe(res);
});

app.delete('/api/admin/errors', requireAdmin, (_req, res) => {
    db.prepare('DELETE FROM error_log').run();
    res.json({ ok: true });
});

// Errores del navegador (pantalla en blanco, fallos de una página) para verlos en Administración.
const logLimit = rateLimit({ name: 'log', limit: 15, windowMs: 10 * 60 * 1000 });
app.post('/api/log', logLimit, (req, res) => {
    const message = String(req.body?.message || '').trim();
    if (message) logError('navegador', message, `${String(req.body?.where || '')}\n${String(req.body?.stack || '')}\n${String(req.headers['user-agent'] || '')}`, req.user?.id || null);
    res.json({ ok: true });
});

/* ---------- Búsqueda de artículos (OpenAlex) ---------- */

const searchLimit = rateLimit({ name: 'buscar', limit: 40, windowMs: 10 * 60 * 1000, key: (req) => `u${req.user?.id || req.ip}` });

// Texto de una etiqueta XML sencilla (para el Atom de arXiv).
const xmlText = (xml, tag) => (xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`)) || [])[1]?.replace(/\s+/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim() || '';

// Semantic Scholar permite 1 solicitud por segundo en total: las consultas de todos los estudiantes pasan por una
// sola fila con 1,1 s de separación, y si responde 429 se reintenta con espera creciente (1 s, 2 s, 4 s).
let semanticTurno = Promise.resolve();
let semanticUltima = 0;
const esperar = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });
const semanticFetch = (url) => {
    const tarea = semanticTurno.then(async () => {
        let res = null;
        for (let intento = 0; intento < 4; intento += 1) {
            const falta = semanticUltima + 1100 - Date.now();
            if (falta > 0) await esperar(falta);
            semanticUltima = Date.now();
            res = await fetch(url, { headers: SEMANTIC_SCHOLAR_API_KEY ? { 'x-api-key': SEMANTIC_SCHOLAR_API_KEY } : {}, signal: AbortSignal.timeout(20000) });
            if (res.status !== 429 || intento === 3) break;
            await esperar(1000 * 2 ** intento);
        }
        return res;
    });
    // La fila sigue aunque una consulta falle.
    semanticTurno = tarea.catch(() => {});
    return tarea;
};

// Cada base devuelve los artículos en la misma forma: { clave, nombres[], resumen, citas, idioma, enlace, abierto, ref }.
const FUENTES_ARTICULOS = {
    // OpenAlex: se devuelve tal cual; el navegador ya sabe leerlo.
    openalex: async ({ q, desde, idioma }) => {
        if (!OPENALEX_API_KEY) return { status: 503, code: 'no_key' };
        const filtros = [`from_publication_date:${desde}-01-01`, 'type:article', idioma ? `language:${idioma}` : ''].filter(Boolean).join(',');
        const res = await fetch(`https://api.openalex.org/works?search=${encodeURIComponent(q)}&per-page=12&filter=${filtros}`
            + '&select=id,display_name,publication_year,authorships,primary_location,biblio,doi,cited_by_count,open_access,language,abstract_inverted_index'
            + `&api_key=${encodeURIComponent(OPENALEX_API_KEY)}`, { signal: AbortSignal.timeout(20000) });
        if (!res.ok) return { status: res.status };
        const body = await res.json();
        return { total: body.meta?.count || 0, results: body.results || [] };
    },
    semantic: async ({ q, desde }) => {
        const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(q)}&limit=12&year=${desde}-`
            + '&fields=title,authors,year,venue,journal,externalIds,abstract,citationCount,openAccessPdf,url';
        const res = await semanticFetch(url);
        if (!res.ok) return { status: res.status };
        const body = await res.json();
        return {
            total: body.total || 0,
            items: (body.data || []).filter((p) => p.title).map((p) => ({
                clave: `ss:${p.paperId}`,
                nombres: (p.authors || []).map((a) => a.name).filter(Boolean).slice(0, 20),
                resumen: p.abstract || '',
                citas: p.citationCount || 0,
                idioma: '',
                enlace: p.openAccessPdf?.url || (p.externalIds?.DOI ? `https://doi.org/${p.externalIds.DOI}` : p.url || ''),
                abierto: Boolean(p.openAccessPdf?.url),
                ref: { tipo: 'articulo', anio: String(p.year || ''), titulo: p.title, revista: p.journal?.name || p.venue || '', volumen: p.journal?.volume || '', paginas: String(p.journal?.pages || '').trim(), doi: p.externalIds?.DOI || '' },
            })),
        };
    },
    // arXiv: prepublicaciones de ingeniería, computación, matemáticas y física (aún sin revisión por pares).
    arxiv: async ({ q, desde }) => {
        const terminos = q.split(/\s+/).filter((w) => w.length > 1).slice(0, 8).map((w) => `all:${w.replace(/[^\p{L}\p{N}-]/gu, '')}`).filter((w) => w.length > 4).join('+AND+');
        const rango = `submittedDate:[${desde}01010000+TO+209912312359]`;
        const res = await fetch(`https://export.arxiv.org/api/query?search_query=${terminos}+AND+${rango}&max_results=12&sortBy=relevance`, { signal: AbortSignal.timeout(25000) });
        if (!res.ok) return { status: res.status };
        const xml = await res.text();
        const entradas = xml.split('<entry>').slice(1).map((e) => e.split('</entry>')[0]);
        return {
            total: Number(xmlText(xml, 'opensearch:totalResults')) || entradas.length,
            items: entradas.map((e) => {
                const id = xmlText(e, 'id').replace(/^https?:\/\/arxiv\.org\/abs\//, '').replace(/v\d+$/, '');
                return {
                    clave: `arxiv:${id}`,
                    nombres: [...e.matchAll(/<name>([^<]*)<\/name>/g)].map((m) => m[1].trim()).slice(0, 20),
                    resumen: xmlText(e, 'summary'),
                    citas: 0,
                    idioma: 'en',
                    enlace: `https://arxiv.org/abs/${id}`,
                    abierto: true,
                    preprint: true,
                    ref: { tipo: 'articulo', anio: xmlText(e, 'published').slice(0, 4), titulo: xmlText(e, 'title'), revista: 'arXiv', doi: xmlText(e, 'arxiv:doi') || `10.48550/arXiv.${id}` },
                };
            }).filter((x) => x.ref.titulo),
        };
    },
};

// El servidor consulta la base elegida (con sus claves); al navegador solo le llegan los resultados.
app.get('/api/buscar/articulos', requireUser, searchLimit, async (req, res) => {
    const fuente = FUENTES_ARTICULOS[String(req.query.fuente || 'openalex')] ? String(req.query.fuente || 'openalex') : 'openalex';
    const q = String(req.query.q || '').trim().slice(0, 200);
    const desde = /^(19|20)\d{2}$/.test(String(req.query.desde)) ? String(req.query.desde) : '1950';
    const idioma = /^[a-z]{2}$/.test(String(req.query.idioma || '')) ? String(req.query.idioma) : '';
    if (q.length < 3) return res.status(400).json({ error: 'Escribe al menos una palabra para buscar.' });
    contarUso('articulos', req.user.id);
    try {
        const r = await FUENTES_ARTICULOS[fuente]({ q, desde, idioma });
        if (r.code === 'no_key') return res.status(503).json({ error: 'La búsqueda por el servidor no está configurada.', code: 'no_key' });
        if (r.status) {
            if (r.status !== 429) logError('buscar', `${fuente} respondió ${r.status}`, '', req.user.id);
            return res.status(r.status === 429 ? 429 : 502).json({
                error: r.status === 429 ? 'Esa base de artículos está saturada en este momento. Prueba con otra base o inténtalo en unos minutos.' : 'La base de artículos no respondió.',
                code: r.status === 429 ? 'saturada' : 'upstream',
            });
        }
        return res.json(r);
    } catch (error) {
        logError('buscar', `${fuente} no respondió`, `${error?.name || ''} ${error?.message || ''}`, req.user.id);
        return res.status(504).json({ error: 'La base de artículos tardó demasiado.', code: 'upstream' });
    }
});

/* ---------- Obras de una teoría (OpenAlex) ---------- */

// Para cada teoría se buscan las obras más citadas que la nombran en el título: suele ser la obra que la propuso.
// Si se conoce el apellido del autor original, sus obras van primero. El autor y el año salen siempre del registro
// de la publicación, nunca de la IA. Cada consulta se guarda una semana (el cupo diario de OpenAlex es limitado).
const OBRAS_CACHE = new Map(); // clave → { hasta, obras }
const OBRAS_TTL = 7 * 24 * 60 * 60 * 1000;
const OBRAS_CAMPOS = 'id,display_name,publication_year,authorships,primary_location,biblio,doi,cited_by_count,open_access,language,type,abstract_inverted_index';
// En un filtro de OpenAlex la coma y la barra separan condiciones: se quitan del texto buscado.
const paraFiltro = (texto) => String(texto || '').replace(/[^\p{L}\p{N}\s'-]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, 100);

// Teorías: las más citadas (la obra fundacional). Conceptos: las más pertinentes al término y que traigan resumen,
// porque la definición se saca de él; ordenar por citas traería estudios famosos de otros temas.
const obrasDeTitulo = async (titulo, autor, concepto = false) => {
    const filtro = [`title.search:${titulo}`, autor ? `raw_author_name.search:${autor}` : '', concepto ? 'has_abstract:true' : ''].filter(Boolean).join(',');
    const res = await fetch(`https://api.openalex.org/works?filter=${encodeURIComponent(filtro)}${concepto ? '' : '&sort=cited_by_count:desc'}&per-page=3&select=${OBRAS_CAMPOS}`
        + `&api_key=${encodeURIComponent(OPENALEX_API_KEY)}`, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw Object.assign(new Error(`openalex ${res.status}`), { status: res.status });
    return ((await res.json()).results || []).filter((w) => w.display_name);
};

const obrasDeTeoria = async ({ ingles, nombre, autor }, concepto) => {
    const clave = `${concepto ? 'c' : 't'}|${ingles}|${nombre}|${autor}`.toLowerCase();
    const guardada = OBRAS_CACHE.get(clave);
    if (guardada && guardada.hasta > Date.now()) return guardada.obras;
    let delAutor = [];
    let otras = [];
    for (const titulo of [ingles, nombre].filter(Boolean)) {
        [delAutor, otras] = await Promise.all([autor && !concepto ? obrasDeTitulo(titulo, autor) : [], obrasDeTitulo(titulo, '', concepto)]);
        if (delAutor.length || otras.length) break; // con el nombre en inglés basta; el español es el respaldo
    }
    const vistas = new Set();
    const obras = [...delAutor.slice(0, 2).map((w) => ({ ...w, del_autor: true })), ...otras]
        .filter((w) => (vistas.has(w.id) ? false : vistas.add(w.id)))
        .slice(0, 3);
    OBRAS_CACHE.set(clave, { hasta: Date.now() + OBRAS_TTL, obras });
    if (OBRAS_CACHE.size > 600) OBRAS_CACHE.delete(OBRAS_CACHE.keys().next().value);
    return obras;
};

app.post('/api/buscar/teorias', requireUser, searchLimit, async (req, res) => {
    if (!OPENALEX_API_KEY) return res.status(503).json({ error: 'La búsqueda de teorías no está configurada.', code: 'no_key' });
    contarUso('teorias', req.user.id);
    const teorias = (Array.isArray(req.body?.teorias) ? req.body.teorias : []).slice(0, 6)
        .map((t) => ({ ingles: paraFiltro(t?.ingles), nombre: paraFiltro(t?.nombre), autor: paraFiltro(t?.autor).split(' ').at(-1) || '' }))
        .filter((t) => (t.ingles || t.nombre).length >= 3);
    const concepto = req.body?.tipo === 'concepto';
    if (!teorias.length) return res.status(400).json({ error: 'Falta el nombre de la teoría.' });
    try {
        const items = await Promise.all(teorias.map((t) => obrasDeTeoria(t, concepto).then((obras) => ({ obras }), (error) => {
            if (error?.status === 429) throw error;
            return { obras: [], fallo: true }; // una teoría que falla no tumba a las demás
        })));
        return res.json({ items });
    } catch (error) {
        if (error?.status !== 429) logError('buscar', 'openalex (teorías) no respondió', `${error?.name || ''} ${error?.message || ''}`, req.user.id);
        return res.status(error?.status === 429 ? 429 : 504).json({
            error: error?.status === 429 ? 'La base de artículos está saturada en este momento. Inténtalo en unos minutos.' : 'La base de artículos tardó demasiado.',
            code: error?.status === 429 ? 'saturada' : 'upstream',
        });
    }
});

/* ---------- Normas y jurisprudencia (Rulex Data) ---------- */

// La cuota de Rulex es diaria y compartida por toda la plataforma: cada búsqueda se guarda un día,
// así una misma consulta de varios estudiantes cuenta una sola vez.
const NORMAS_CACHE = new Map(); // clave → { hasta, datos }
const NORMAS_TTL = 24 * 60 * 60 * 1000;
let normasRestantes = null; // lo que Rulex dice que queda hoy; null = aún no se sabe

app.get('/api/buscar/normas', requireUser, searchLimit, async (req, res) => {
    const q = String(req.query.q || '').trim().replace(/\s+/g, ' ').slice(0, 200);
    const fuente = String(req.query.fuente) === 'todas' ? 'todas' : 'normas';
    if (q.length < 3) return res.status(400).json({ error: 'Escribe al menos una palabra para buscar.' });
    if (!RULEX_API_KEY) return res.status(503).json({ error: 'La búsqueda de normas no está configurada.', code: 'no_key' });
    const clave = `${fuente}|${q.toLowerCase()}`;
    const guardada = NORMAS_CACHE.get(clave);
    contarUso('normas', req.user.id);
    if (guardada && guardada.hasta > Date.now()) return res.json({ ...guardada.datos, restantes: normasRestantes });
    contarUso('normas_consulta', 0); // consulta real al proveedor: es la que gasta el cupo diario
    try {
        const r = await fetch('https://rulex.org/api/data/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RULEX_API_KEY}` },
            body: JSON.stringify({ tool: 'rulex_rag_juridico', args: { query: q, limit: 8, ...(fuente === 'normas' ? { fuente: 'normas' } : {}) } }),
            signal: AbortSignal.timeout(25000),
        });
        if (r.status === 429) { normasRestantes = 0; return res.status(429).json({ error: 'Se agotaron las búsquedas de normas de hoy. Vuelve mañana o agrega la norma a mano.', code: 'cuota' }); }
        if (!r.ok) {
            logError('buscar', `rulex respondió ${r.status}`, '', req.user.id);
            return res.status(502).json({ error: r.status === 401 ? 'La clave de la búsqueda de normas no es válida.' : 'La base de normas no respondió.', code: 'upstream' });
        }
        const json = await r.json();
        if (Number.isFinite(json?.usage?.remainingToday)) normasRestantes = json.usage.remainingToday;
        const datos = {
            total: Number(json?.data?.total_encontrados) || 0,
            items: (Array.isArray(json?.data?.providencias) ? json.data.providencias : []).map((p) => ({
                clave: String(p.documentKey || p.citation || ''),
                cita: String(p.citation || p.title || '').slice(0, 200),
                titulo: String(p.title || '').slice(0, 300),
                fuente: String(p.source || '').slice(0, 120),
                clase: String(p.authorityKind || ''),
                anio: Number(p.year) || '',
                extracto: String(p.extracto || '').slice(0, 2500),
                enlace: /^https:\/\//.test(String(p.officialUrl || '')) ? String(p.officialUrl) : '',
            })).filter((x) => x.cita),
        };
        NORMAS_CACHE.set(clave, { hasta: Date.now() + NORMAS_TTL, datos });
        if (NORMAS_CACHE.size > 400) NORMAS_CACHE.delete(NORMAS_CACHE.keys().next().value);
        return res.json({ ...datos, restantes: normasRestantes });
    } catch (error) {
        logError('buscar', 'rulex no respondió', `${error?.name || ''} ${error?.message || ''}`, req.user.id);
        return res.status(504).json({ error: 'La base de normas tardó demasiado.', code: 'upstream' });
    }
});

/* ---------- Proxy de IA ---------- */

const aiLimit = rateLimit({
    name: 'ai',
    limit: 60,
    windowMs: 10 * 60 * 1000,
    key: (req) => (req.user ? `u${req.user.id}` : req.ip),
});

app.post('/api/ai/chat', aiLimit, async (req, res) => {
    if (!GROQ_API_KEY) return res.status(503).json({ error: 'El asistente de IA no está configurado en el servidor.' });

    const messages = Array.isArray(req.body?.messages) ? req.body.messages : null;
    if (!messages || messages.length === 0 || messages.length > 12) return res.status(400).json({ error: 'Solicitud de IA no válida.' });
    contarUso('ia', req.user?.id);

    let total = 0;
    const clean = [];
    for (const message of messages) {
        const role = message?.role;
        const content = message?.content;
        if (!['system', 'user', 'assistant'].includes(role) || typeof content !== 'string') {
            return res.status(400).json({ error: 'Solicitud de IA no válida.' });
        }
        total += content.length;
        clean.push({ role, content });
    }
    if (total > 40000) return res.status(413).json({ error: 'El texto enviado a la IA es demasiado largo.' });

    const payload = {
        model: GROQ_MODEL,
        messages: clean,
        temperature: Math.min(Math.max(Number(req.body.temperature ?? 0.7) || 0, 0), 1.5),
        max_tokens: Math.min(Math.max(parseInt(req.body.max_tokens ?? 1024, 10) || 1024, 1), 8192),
    };
    if (req.body.response_format?.type === 'json_object') payload.response_format = { type: 'json_object' };
    if (GROQ_MODEL.startsWith('openai/gpt-oss') && GROQ_REASONING_EFFORT) payload.reasoning_effort = GROQ_REASONING_EFFORT;

    try {
        const upstream = await fetch(GROQ_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(90000),
        });
        const body = await upstream.json().catch(() => ({}));
        if (!upstream.ok) {
            console.error('Groq error', upstream.status, body?.error?.message);
            aiState.fails += 1;
            aiState.lastError = `${upstream.status} ${body?.error?.message || ''}`.slice(0, 200);
            logError('ia', `La IA respondió ${upstream.status}`, body?.error?.message, req.user?.id || null);
            if (aiState.fails >= 3) alertar('ia', 'La IA está fallando', `Van ${aiState.fails} solicitudes seguidas con error. Último: ${aiState.lastError}`);
            const status = upstream.status === 429 ? 429 : 502;
            const error = status === 429
                ? 'El servicio de IA está saturado. Inténtalo de nuevo en un minuto.'
                : 'El servicio de IA no respondió correctamente. Inténtalo de nuevo.';
            return res.status(status).json({ error });
        }
        aiState.fails = 0;
        aiState.lastOk = Date.now();
        return res.json({ choices: (body.choices || []).map((choice) => ({ message: { role: 'assistant', content: choice?.message?.content || '' } })) });
    } catch (error) {
        console.error('Groq request failed', error?.name, error?.message);
        aiState.fails += 1;
        aiState.lastError = `${error?.name || ''} ${error?.message || ''}`.slice(0, 200);
        logError('ia', 'La IA no respondió', aiState.lastError, req.user?.id || null);
        if (aiState.fails >= 3) alertar('ia', 'La IA está fallando', `Van ${aiState.fails} solicitudes seguidas sin respuesta. Último: ${aiState.lastError}`);
        return res.status(504).json({ error: 'El servicio de IA tardó demasiado en responder. Inténtalo de nuevo.' });
    }
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));

app.use((error, _req, res, _next) => {
    if (error?.type === 'entity.too.large') return res.status(413).json({ error: 'El contenido es demasiado grande.' });
    if (error?.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON no válido.' });
    console.error(error);
    logError('servidor', error?.message || 'Error interno', `${_req.method} ${_req.path}\n${error?.stack || ''}`, _req.user?.id || null);
    alertar('servidor', 'Error interno en la API', `${_req.method} ${_req.path}\n${error?.stack || error?.message || ''}`);
    return res.status(500).json({ error: 'Error interno del servidor.' });
});

app.listen(PORT, HOST, () => {
    console.log(`PROJECTSIA API en http://${HOST}:${PORT} (IA ${GROQ_API_KEY ? 'configurada' : 'sin clave'}, correo ${mailer ? 'configurado' : 'sin configurar'})`);
});
