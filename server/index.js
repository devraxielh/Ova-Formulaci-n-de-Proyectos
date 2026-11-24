// API de PROJECTSIA: cuentas, proyectos, administración y proxy de IA.
// La clave de Groq vive solo aquí (variable de entorno), nunca en el navegador.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
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

const SESSION_COOKIE = 'psia_session';
const SESSION_DAYS = 30;
const ACTIVATION_HOURS = 48;
const MAX_PROJECTS = 20;
const MAX_PROJECT_BYTES = 512 * 1024;

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

const publicUser = (user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    mustChangePassword: Boolean(user.must_change_password),
});

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
        return false;
    }
};

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
app.use(express.json({ limit: '1mb' }));

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
            SELECT users.id, users.email, users.name, users.role, users.status, users.must_change_password, sessions.expires_at
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

const requireAdmin = (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Inicia sesión para continuar.' });
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'No tienes permiso para esta sección.' });
    if (req.user.must_change_password) return res.status(403).json({ error: 'Cambia tu contraseña antes de entrar a la administración.', code: 'must_change_password' });
    return next();
};

app.get('/api/health', (_req, res) => res.json({ ok: true, ai: Boolean(GROQ_API_KEY), mail: Boolean(mailer) }));

/* ---------- Cuentas ---------- */

const authLimit = rateLimit({ name: 'auth', limit: 15, windowMs: 15 * 60 * 1000 });
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

app.post('/api/auth/register', authLimit, async (req, res) => {
    const name = String(req.body?.name || '').trim().slice(0, 80);
    const email = String(req.body?.email || '').trim().toLowerCase().slice(0, 160);
    const password = String(req.body?.password || '');

    if (!name) return res.status(400).json({ error: 'Escribe tu nombre.' });
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Escribe un correo válido.' });
    if (password.length < 8) return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
    if (password.length > 200) return res.status(400).json({ error: 'La contraseña es demasiado larga.' });

    if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email)) {
        return res.status(409).json({ error: 'Ya existe una cuenta con ese correo. Inicia sesión o pide un nuevo enlace de activación.' });
    }

    const info = db.prepare("INSERT INTO users (email, name, password_hash, status) VALUES (?, ?, ?, 'pending')").run(email, name, hashPassword(password));
    const emailSent = await sendActivation({ id: Number(info.lastInsertRowid), email, name });
    return res.status(201).json({ pending: true, email, emailSent });
});

app.post('/api/auth/verify', authLimit, (req, res) => {
    const token = String(req.body?.token || '');
    const row = token && db.prepare(`
        SELECT users.* FROM email_tokens JOIN users ON users.id = email_tokens.user_id
        WHERE email_tokens.token_hash = ? AND email_tokens.purpose = 'activate' AND email_tokens.expires_at > ?`).get(sha256(token), Date.now());
    if (!row) return res.status(400).json({ error: 'El enlace de activación no es válido o ya venció. Inicia sesión para pedir uno nuevo.' });
    if (row.status === 'blocked') return res.status(403).json({ error: 'Tu cuenta está bloqueada. Comunícate con el administrador.', code: 'blocked' });

    db.prepare("UPDATE users SET status = 'active' WHERE id = ?").run(row.id);
    db.prepare("DELETE FROM email_tokens WHERE user_id = ? AND purpose = 'activate'").run(row.id);
    createSession(res, row.id);
    return res.json({ user: publicUser({ ...row, status: 'active' }) });
});

app.post('/api/auth/resend', authLimit, async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND status = 'pending'").get(email);
    if (user) await sendActivation(user);
    // Misma respuesta exista o no la cuenta, para no revelar qué correos están registrados.
    return res.json({ ok: true });
});

app.post('/api/auth/login', authLimit, (req, res) => {
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
    return res.json({ user: publicUser(user) });
});

app.post('/api/auth/logout', (req, res) => {
    if (req.sessionHash) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(req.sessionHash);
    setSessionCookie(res, '', 0);
    res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => res.json({ user: req.user ? publicUser(req.user) : null }));

app.post('/api/auth/password', requireUser, authLimit, (req, res) => {
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

const projectRow = (row, withData = true) => ({
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...(withData ? { data: JSON.parse(row.data) } : {}),
});

app.get('/api/projects', requireUser, (req, res) => {
    const rows = db.prepare('SELECT id, name, created_at, updated_at FROM projects WHERE user_id = ? ORDER BY updated_at DESC, id DESC').all(req.user.id);
    res.json({ projects: rows.map((row) => projectRow(row, false)) });
});

app.post('/api/projects', requireUser, (req, res) => {
    const count = db.prepare('SELECT COUNT(*) AS n FROM projects WHERE user_id = ?').get(req.user.id).n;
    if (count >= MAX_PROJECTS) return res.status(400).json({ error: `Puedes tener hasta ${MAX_PROJECTS} proyectos. Elimina uno para crear otro.` });
    const data = serializeData(req.body?.data ?? {});
    if (data === null) return res.status(400).json({ error: 'El contenido del proyecto no es válido o es demasiado grande.' });
    const info = db.prepare('INSERT INTO projects (user_id, name, data) VALUES (?, ?, ?)').run(req.user.id, cleanName(req.body?.name), data);
    const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(info.lastInsertRowid);
    return res.status(201).json({ project: projectRow(row) });
});

const ownProject = (req, res, next) => {
    const row = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(Number(req.params.id), req.user.id);
    if (!row) return res.status(404).json({ error: 'No se encontró el proyecto.' });
    req.project = row;
    return next();
};

app.get('/api/projects/:id', requireUser, ownProject, (req, res) => res.json({ project: projectRow(req.project) }));

app.put('/api/projects/:id', requireUser, ownProject, (req, res) => {
    const name = req.body?.name === undefined ? req.project.name : cleanName(req.body.name);
    let data = req.project.data;
    if (req.body?.data !== undefined) {
        data = serializeData(req.body.data);
        if (data === null) return res.status(400).json({ error: 'El contenido del proyecto no es válido o es demasiado grande.' });
    }
    db.prepare("UPDATE projects SET name = ?, data = ?, updated_at = datetime('now') WHERE id = ?").run(name, data, req.project.id);
    const row = db.prepare('SELECT id, name, created_at, updated_at FROM projects WHERE id = ?').get(req.project.id);
    return res.json({ project: projectRow(row, false) });
});

app.delete('/api/projects/:id', requireUser, ownProject, (req, res) => {
    db.prepare('DELETE FROM projects WHERE id = ?').run(req.project.id);
    res.json({ ok: true });
});

/* ---------- Administración ---------- */

const adminUserRow = (row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
    projectCount: row.project_count ?? 0,
    lastActivity: row.last_activity,
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
        projects: projects.map((project) => ({ ...projectRow(project, false), coherencia: coherenciaDe(project.data) })),
    });
});

app.get('/api/admin/projects/:id', requireAdmin, (req, res) => {
    const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(Number(req.params.id));
    if (!row) return res.status(404).json({ error: 'No se encontró el proyecto.' });
    const owner = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(row.user_id);
    return res.json({ project: projectRow(row), owner });
});

app.post('/api/admin/users/:id/status', requireAdmin, async (req, res) => {
    const status = String(req.body?.status || '');
    if (!['active', 'blocked'].includes(status)) return res.status(400).json({ error: 'Estado no válido.' });
    const target = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(req.params.id));
    if (!target) return res.status(404).json({ error: 'No se encontró el usuario.' });
    if (target.role === 'admin') return res.status(400).json({ error: 'No se puede cambiar el estado de un administrador.' });

    db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, target.id);
    if (status === 'blocked') db.prepare('DELETE FROM sessions WHERE user_id = ?').run(target.id);
    if (status === 'active') db.prepare("DELETE FROM email_tokens WHERE user_id = ? AND purpose = 'activate'").run(target.id);

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
            const status = upstream.status === 429 ? 429 : 502;
            const error = status === 429
                ? 'El servicio de IA está saturado. Inténtalo de nuevo en un minuto.'
                : 'El servicio de IA no respondió correctamente. Inténtalo de nuevo.';
            return res.status(status).json({ error });
        }
        return res.json({ choices: (body.choices || []).map((choice) => ({ message: { role: 'assistant', content: choice?.message?.content || '' } })) });
    } catch (error) {
        console.error('Groq request failed', error?.name, error?.message);
        return res.status(504).json({ error: 'El servicio de IA tardó demasiado en responder. Inténtalo de nuevo.' });
    }
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));

app.use((error, _req, res, _next) => {
    if (error?.type === 'entity.too.large') return res.status(413).json({ error: 'El contenido es demasiado grande.' });
    if (error?.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON no válido.' });
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
});

app.listen(PORT, HOST, () => {
    console.log(`PROJECTSIA API en http://${HOST}:${PORT} (IA ${GROQ_API_KEY ? 'configurada' : 'sin clave'}, correo ${mailer ? 'configurado' : 'sin configurar'})`);
});
