// Pruebas de integración del servidor: lo arrancan en un puerto y una base de datos temporales.
import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'psia-test-'));
const PORT = 18000 + Math.floor(Math.random() * 1000);
const BASE = `http://127.0.0.1:${PORT}/api`;
let server;
let log = '';
let adminApi; // sesión del administrador, lista después de la prueba de administración

// Cliente mínimo con su propia cookie de sesión (un «navegador» por usuario).
const cliente = () => {
    let cookie = '';
    return async (ruta, method = 'GET', body) => {
        const res = await fetch(BASE + ruta, {
            method,
            headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
            body: method === 'GET' ? undefined : JSON.stringify(body || {}),
        });
        const set = res.headers.get('set-cookie');
        if (set) cookie = set.split(';')[0];
        const type = res.headers.get('content-type') || '';
        return { status: res.status, body: type.includes('json') ? await res.json() : await res.arrayBuffer() };
    };
};
const enlace = (tipo, correo) => {
    const lineas = log.split('\n').filter((l) => l.includes(correo) && l.includes(`${tipo}=`));
    return lineas.at(-1)?.match(new RegExp(`${tipo}=([a-f0-9]+)`))?.[1];
};
const clave = () => `Clave-${Math.random().toString(36).slice(2)}-9A`;

// Sesión del administrador (entra una sola vez y cambia la contraseña inicial).
const entrarAdmin = async () => {
    if (adminApi) return adminApi;
    const admin = cliente();
    assert.equal((await admin('/auth/login', 'POST', { email: 'admin', password: 'inicial-de-prueba' })).status, 200);
    assert.equal((await admin('/admin/estado')).status, 403); // primero debe cambiar la contraseña inicial
    assert.equal((await admin('/auth/password', 'POST', { current: 'inicial-de-prueba', next: clave() })).status, 200);
    adminApi = admin;
    return admin;
};

// Entra con la contraseña temporal y la cambia: deja la cuenta lista para trabajar.
const estrenar = async (email, temporal) => {
    const api = cliente();
    const password = clave();
    const entra = await api('/auth/login', 'POST', { email, password: temporal });
    assert.equal(entra.status, 200);
    assert.equal(entra.body.user.mustChangePassword, true);
    assert.equal((await api('/auth/password', 'POST', { current: temporal, next: password })).status, 200);
    return { api, email, password };
};

// Nadie se registra solo: la cuenta la crea el administrador. Por defecto, investigador (puede crear proyectos).
const cuenta = async (nombre, role = 'researcher') => {
    const admin = await entrarAdmin();
    const email = `${nombre}.${Date.now()}@example.test`;
    const creada = await admin('/admin/users', 'POST', { name: nombre, email, role });
    assert.equal(creada.status, 201);
    return { ...(await estrenar(email, creada.body.clave)), id: creada.body.user.id };
};

before(async () => {
    server = spawn(process.execPath, ['index.js'], {
        cwd: path.join(root, 'server'),
        env: { ...process.env, PORT: String(PORT), DB_PATH: path.join(tmp, 'test.db'), BACKUP_DIR: path.join(tmp, 'copias'), NODE_ENV: 'test', DEFAULT_PROJECT_LIMIT: '5', OPENALEX_API_KEY: '', SEMANTIC_SCHOLAR_API_KEY: '', SMTP_HOST: '', GROQ_API_KEY: '', ADMIN_INITIAL_PASSWORD: 'inicial-de-prueba' },
    });
    server.stdout.on('data', (d) => { log += d; });
    server.stderr.on('data', (d) => { log += d; });
    for (let i = 0; i < 50; i += 1) {
        try { if ((await fetch(`${BASE}/health`)).ok) return; } catch { /* aún arrancando */ }
        await new Promise((r) => setTimeout(r, 100));
    }
    throw new Error(`El servidor de pruebas no arrancó:\n${log}`);
});

after(() => {
    server?.kill();
    fs.rmSync(tmp, { recursive: true, force: true });
});

test('sin sesión no se puede leer ni escribir proyectos', async () => {
    const anon = cliente();
    assert.equal((await anon('/projects')).status, 401);
    assert.equal((await anon('/projects/1/versions')).status, 401);
    assert.equal((await anon('/projects/1/files/1')).status, 401);
    assert.equal((await anon('/admin/estado')).status, 401);
});

test('equipo: el invitado edita, no borra ni invita, y cada uno guarda su sección', async () => {
    const ana = await cuenta('ana');
    const luis = await cuenta('luis');
    const otro = await cuenta('otro');
    const p = (await ana.api('/projects', 'POST', { name: 'Equipo', data: { titulo: 'T' } })).body.project;

    assert.equal((await luis.api(`/projects/${p.id}`)).status, 404); // todavía no está invitado
    assert.equal((await ana.api(`/projects/${p.id}/members`, 'POST', { email: luis.email })).status, 201);
    assert.equal((await ana.api(`/projects/${p.id}/members`, 'POST', { email: 'no-es-correo' })).status, 400);

    const lista = (await luis.api('/projects')).body.projects.find((x) => x.id === p.id);
    assert.equal(lista.shared, true);
    assert.equal((await luis.api(`/projects/${p.id}`, 'PUT', { patch: { justificacion: 'J de Luis' }, base: 1 })).status, 200);
    assert.equal((await ana.api(`/projects/${p.id}`, 'PUT', { patch: { introduccion: 'I de Ana' }, base: 1 })).body.conflicts.length, 0);
    const data = (await ana.api(`/projects/${p.id}`)).body.project.data;
    assert.deepEqual(Object.keys(data).sort(), ['introduccion', 'justificacion', 'titulo']);

    assert.equal((await luis.api(`/projects/${p.id}`, 'DELETE')).status, 403);
    assert.equal((await luis.api(`/projects/${p.id}/members`, 'POST', { email: otro.email })).status, 403);
    assert.equal((await otro.api(`/projects/${p.id}`, 'PUT', { patch: { titulo: 'X' } })).status, 404);

    // Luis se sale y deja de verlo.
    assert.equal((await luis.api(`/projects/${p.id}/members/${encodeURIComponent(luis.email)}`, 'DELETE')).status, 200);
    assert.equal((await luis.api(`/projects/${p.id}`)).status, 404);
});

test('choque: si otro guardó el mismo campo, el servidor no lo pisa y avisa quién fue', async () => {
    const ana = await cuenta('ana2');
    const luis = await cuenta('luis2');
    const p = (await ana.api('/projects', 'POST', { name: 'Choque', data: { introduccion: 'Original' } })).body.project;
    await ana.api(`/projects/${p.id}/members`, 'POST', { email: luis.email });

    // Los dos parten de la versión 1; Ana guarda primero.
    const v2 = (await ana.api(`/projects/${p.id}`, 'PUT', { patch: { introduccion: 'De Ana' }, base: 1 })).body.project.version;
    const r = (await luis.api(`/projects/${p.id}`, 'PUT', { patch: { introduccion: 'De Luis', marcoLegal: 'Ley' }, base: 1 })).body;
    assert.deepEqual(r.conflicts, [{ key: 'introduccion', by: 'ana2' }]);
    let data = (await ana.api(`/projects/${p.id}`)).body.project.data;
    assert.equal(data.introduccion, 'De Ana'); // no se pisó
    assert.equal(data.marcoLegal, 'Ley'); // el campo sin choque sí se guardó
    assert.ok(r.project.version > v2);

    // Luis decide conservar la suya.
    assert.equal((await luis.api(`/projects/${p.id}`, 'PUT', { patch: { introduccion: 'De Luis' }, force: true })).body.conflicts.length, 0);
    data = (await ana.api(`/projects/${p.id}`)).body.project.data;
    assert.equal(data.introduccion, 'De Luis');

    // Guardar otra vez su propio campo no es choque.
    assert.equal((await luis.api(`/projects/${p.id}`, 'PUT', { patch: { introduccion: 'De Luis 2' }, base: 1 })).body.conflicts.length, 0);

    // Presencia: cada uno ve en qué sección está el otro.
    await ana.api(`/projects/${p.id}/version?tab=marco`);
    const pres = (await luis.api(`/projects/${p.id}/version?tab=resultados`)).body;
    assert.deepEqual(pres.others, [{ name: 'ana2', tab: 'marco' }]);
});

test('historial: guarda copia antes de los cambios y se puede leer', async () => {
    const ana = await cuenta('ana3');
    const p = (await ana.api('/projects', 'POST', { name: 'Historial', data: { titulo: 'Versión 1' } })).body.project;
    await ana.api(`/projects/${p.id}`, 'PUT', { patch: { titulo: 'Versión 2' } });
    const lista = (await ana.api(`/projects/${p.id}/versions`)).body.versions;
    assert.equal(lista.length, 1);
    const v = (await ana.api(`/projects/${p.id}/versions/${lista[0].id}`)).body.version;
    assert.equal(v.data.titulo, 'Versión 1');
});

test('figuras: solo imágenes reales y solo para integrantes', async () => {
    const ana = await cuenta('ana4');
    const otro = await cuenta('otro4');
    const p = (await ana.api('/projects', 'POST', { name: 'Figuras', data: {} })).body.project;
    assert.equal((await ana.api(`/projects/${p.id}/files`, 'POST', { mime: 'image/png', data: Buffer.from('no soy una imagen').toString('base64') })).status, 400);
    assert.equal((await ana.api(`/projects/${p.id}/files`, 'POST', { mime: 'text/html', data: 'PGI+' })).status, 400);
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    const f = await ana.api(`/projects/${p.id}/files`, 'POST', { mime: 'image/png', data: png.toString('base64') });
    assert.equal(f.status, 201);
    assert.equal((await ana.api(`/projects/${p.id}/files/${f.body.file.id}`)).status, 200);
    assert.equal((await otro.api(`/projects/${p.id}/files/${f.body.file.id}`)).status, 404);
});

test('recuperar contraseña: el enlace sirve una vez, cambia la clave y cierra las otras sesiones', async () => {
    const ana = await cuenta('ana5');
    assert.equal((await cliente()('/auth/forgot', 'POST', { email: 'nadie@example.test' })).body.ok, true); // no revela si existe
    assert.equal((await cliente()('/auth/forgot', 'POST', { email: ana.email })).status, 200);
    const token = enlace('restablecer', ana.email);
    assert.ok(token);

    const nuevo = cliente();
    assert.equal((await nuevo('/auth/reset', 'POST', { token, password: 'corta' })).status, 400);
    const nueva = clave();
    assert.equal((await nuevo('/auth/reset', 'POST', { token, password: nueva })).status, 200);
    assert.equal((await nuevo('/auth/me')).body.user.email, ana.email); // queda con sesión
    assert.equal((await ana.api('/auth/me')).body.user, null); // la sesión anterior se cerró
    assert.equal((await cliente()('/auth/reset', 'POST', { token, password: clave() })).status, 400); // ya se usó
    assert.equal((await cliente()('/auth/login', 'POST', { email: ana.email, password: ana.password })).status, 401);
    assert.equal((await cliente()('/auth/login', 'POST', { email: ana.email, password: nueva })).status, 200);
});

test('administrador: copia de seguridad descargable y registro de errores', async () => {
    const admin = await entrarAdmin();

    const copia = await admin('/admin/backups', 'POST');
    assert.equal(copia.status, 201);
    assert.match(copia.body.backup.name, /^projectsia-\d{4}-\d{2}-\d{2}\.db\.gz$/);
    const archivo = await admin(`/admin/backups/${copia.body.backup.name}`);
    assert.equal(archivo.status, 200);
    assert.deepEqual([...new Uint8Array(archivo.body).slice(0, 2)], [0x1f, 0x8b]); // gzip
    assert.equal((await admin('/admin/backups/..%2F..%2Ftest.db')).status, 404);

    const ana = await cuenta('ana6');
    await ana.api('/log', 'POST', { message: 'TypeError de prueba', stack: 'en Resultados.jsx' });
    const estado = (await admin('/admin/estado')).body;
    assert.equal(estado.errors[0].message, 'TypeError de prueba');
    assert.equal(estado.errors[0].user, 'ana6');
    assert.equal(estado.backups.length, 1);
    assert.equal((await ana.api('/admin/estado')).status, 403);
});

test('ingreso: muchos estudiantes desde la misma red no se bloquean, pero adivinar una clave sí', async () => {
    const ana = await cuenta('ana7');
    // 25 ingresos correctos de cuentas distintas desde la misma IP (simulados con la misma cuenta y correos distintos).
    for (let i = 0; i < 12; i += 1) assert.equal((await cliente()('/auth/login', 'POST', { email: `est${i}@example.test`, password: 'x' })).status, 401);
    // Diez intentos fallidos contra una cuenta la frenan a ella sola.
    let ultimo = 0;
    for (let i = 0; i < 11; i += 1) ultimo = (await cliente()('/auth/login', 'POST', { email: ana.email, password: 'mala' })).status;
    assert.equal(ultimo, 429);
    assert.equal((await cliente()('/auth/login', 'POST', { email: 'otra@example.test', password: 'x' })).status, 401); // los demás siguen entrando
});

test('encuesta en línea: se publica, cualquiera responde sin cuenta y solo el equipo ve las respuestas', async () => {
    const ana = await cuenta('ana8');
    const otro = await cuenta('otro8');
    const p = (await ana.api('/projects', 'POST', { name: 'Encuesta', data: {} })).body.project;
    const definition = { titulo: 'Asistencia', intro: 'Anónima', preguntas: [
        { id: 'q1', texto: '¿Por qué faltó?', tipo: 'opcion', opciones: ['Olvido', 'Transporte'] },
        { id: 'q2', texto: 'Edad', tipo: 'numero' },
        { id: 'q3', texto: 'Asisto siempre', tipo: 'likert', opciones: ['Nunca', 'A veces', 'Siempre'] },
        { id: 'q4', texto: 'Comentario', tipo: 'abierta', obligatoria: false },
        { id: 'q5', texto: 'Medios', tipo: 'multiple', opciones: ['Bus', 'Moto', 'A pie'], obligatoria: false },
    ] };
    assert.equal((await ana.api(`/projects/${p.id}/surveys/ins1`, 'PUT', { definition: { titulo: 'x', preguntas: [] } })).status, 400);
    assert.equal((await otro.api(`/projects/${p.id}/surveys/ins1`, 'PUT', { definition })).status, 404);
    const pub = (await ana.api(`/projects/${p.id}/surveys/ins1`, 'PUT', { definition })).body.survey;
    assert.match(pub.token, /^[a-f0-9]{24}$/);

    const anon = cliente();
    const ver = (await anon(`/encuestas/${pub.token}`)).body;
    assert.equal(ver.open, true);
    assert.equal(ver.survey.preguntas.length, 5);
    assert.equal((await anon('/encuestas/noexiste')).status, 404);

    // Falta una obligatoria; opciones inventadas se descartan.
    assert.equal((await anon(`/encuestas/${pub.token}`, 'POST', { answers: { q1: 'Olvido' } })).status, 400);
    assert.equal((await anon(`/encuestas/${pub.token}`, 'POST', { answers: { q1: 'Inventada', q2: 30, q3: 'Siempre' } })).status, 400);
    assert.equal((await anon(`/encuestas/${pub.token}`, 'POST', { answers: { q1: 'Olvido', q2: '30', q3: 'Siempre', q4: 'x'.repeat(5000), q5: ['Bus', 'Avión'], extra: 'no' } })).status, 201);
    assert.equal((await anon(`/encuestas/${pub.token}`, 'POST', { answers: { q1: 'Transporte', q2: 41, q3: 'Nunca' } })).status, 201);

    assert.equal((await anon(`/projects/${p.id}/surveys/ins1/responses`)).status, 401);
    assert.equal((await otro.api(`/projects/${p.id}/surveys/ins1/responses`)).status, 404);
    const r = (await ana.api(`/projects/${p.id}/surveys/ins1/responses`)).body.responses;
    assert.equal(r.length, 2);
    assert.deepEqual(r[0].answers.q5, ['Bus']);
    assert.equal(r[0].answers.q2, 30);
    assert.equal(r[0].answers.q4.length, 2000);
    assert.equal(r[0].answers.extra, undefined);

    // Cerrada: se ve, pero no recibe más. El enlace no cambia al actualizar.
    const cerrada = (await ana.api(`/projects/${p.id}/surveys/ins1`, 'PUT', { definition, open: false })).body.survey;
    assert.equal(cerrada.token, pub.token);
    assert.equal(cerrada.count, 2);
    assert.equal((await anon(`/encuestas/${pub.token}`, 'POST', { answers: { q1: 'Olvido', q2: 1, q3: 'Nunca' } })).status, 403);
    assert.equal((await ana.api(`/projects/${p.id}/surveys/ins1/responses`, 'DELETE')).status, 200);
    assert.equal((await ana.api(`/projects/${p.id}/surveys`)).body.surveys[0].count, 0);
});

test('cupo: sin autorización del administrador no se crean proyectos; con cupo, solo hasta el número autorizado', async () => {
    const ana = await cuenta('ana9');
    const yo = (await ana.api('/auth/me')).body.user;
    const fila = async () => (await adminApi('/admin/users')).body.users.find((u) => u.id === yo.id);

    // El administrador le quita el cupo (así nace una cuenta en producción: en 0).
    assert.equal((await adminApi(`/admin/users/${yo.id}/limit`, 'POST', { limit: 0 })).body.user.projectLimit, 0);
    const sin = await ana.api('/projects', 'POST', { name: 'Uno', data: {} });
    assert.equal(sin.status, 403);
    assert.equal(sin.body.code, 'no_quota');
    assert.equal((await ana.api('/auth/me')).body.user.projectLimit, 0);

    // Le autoriza dos.
    assert.equal((await adminApi(`/admin/users/${yo.id}/limit`, 'POST', { limit: 2 })).status, 200);
    assert.equal((await ana.api('/projects', 'POST', { name: 'Uno', data: {} })).status, 201);
    const dos = (await ana.api('/projects', 'POST', { name: 'Dos', data: {} })).body.project;
    const tres = await ana.api('/projects', 'POST', { name: 'Tres', data: {} });
    assert.equal(tres.status, 403);
    assert.equal(tres.body.code, 'quota_full');
    assert.equal((await fila()).projectCount, 2);

    // Bajar el cupo no borra lo que ya existe; al eliminar uno sigue sin poder crear otro.
    assert.equal((await adminApi(`/admin/users/${yo.id}/limit`, 'POST', { limit: 1 })).status, 200);
    assert.equal((await ana.api('/projects')).body.projects.length, 2);
    assert.equal((await ana.api(`/projects/${dos.id}`, 'DELETE')).status, 200);
    assert.equal((await ana.api('/projects', 'POST', { name: 'Otro', data: {} })).status, 403);

    // Un invitado sin cupo sí puede trabajar en el proyecto de un compañero.
    const luis = await cuenta('luis9');
    const idLuis = (await luis.api('/auth/me')).body.user.id;
    await adminApi(`/admin/users/${idLuis}/limit`, 'POST', { limit: 0 });
    const uno = (await ana.api('/projects')).body.projects[0];
    await ana.api(`/projects/${uno.id}/members`, 'POST', { email: luis.email });
    assert.equal((await luis.api(`/projects/${uno.id}`, 'PUT', { patch: { titulo: 'De Luis' } })).status, 200);

    // Solo el administrador cambia cupos, y dentro del rango.
    assert.equal((await ana.api(`/admin/users/${yo.id}/limit`, 'POST', { limit: 9 })).status, 403);
    assert.equal((await adminApi(`/admin/users/${yo.id}/limit`, 'POST', { limit: 99 })).status, 400);
    assert.equal((await adminApi(`/admin/users/${yo.id}/limit`, 'POST', { limit: -1 })).status, 400);
});

test('registro cerrado: nadie crea su propia cuenta', async () => {
    const anon = cliente();
    const r = await anon('/auth/register', 'POST', { name: 'Nueva', email: `nueva.${Date.now()}@example.test`, password: clave() });
    assert.equal(r.status, 403);
    assert.equal(r.body.code, 'registro_cerrado');
    assert.equal((await anon('/auth/me')).body.user, null);
});

test('roles: el administrador crea y asigna; el profesor crea a sus estudiantes, les permite crear y los supervisa', async () => {
    const admin = await entrarAdmin();
    const profe = await cuenta('profe11', 'teacher');
    const otroProfe = await cuenta('profe11b', 'teacher');
    const invest = await cuenta('invest11');

    // Solo el administrador crea cuentas con rol; no se crean administradores ni correos repetidos.
    assert.equal((await profe.api('/admin/users', 'POST', { name: 'X', email: 'x11@example.test', role: 'teacher' })).status, 403);
    assert.equal((await admin('/admin/users', 'POST', { name: 'X', email: 'x11@example.test', role: 'admin' })).status, 400);
    assert.equal((await admin('/admin/users', 'POST', { name: 'X', email: profe.email, role: 'student' })).status, 400);

    // Investigador y profesor crean proyectos; el investigador no entra a la sección del profesor.
    assert.equal((await invest.api('/projects', 'POST', { name: 'Del investigador', data: {} })).status, 201);
    assert.equal((await profe.api('/projects', 'POST', { name: 'Del profesor', data: {} })).status, 201);
    assert.equal((await invest.api('/teacher/students')).status, 403);
    assert.equal((await invest.api('/teacher/students', 'POST', { name: 'E', email: 'e11@example.test' })).status, 403);

    // El profesor crea a su estudiante SIN permiso: entra con la temporal, la cambia y no puede crear.
    const correo = `est11.${Date.now()}@example.test`;
    const creado = await profe.api('/teacher/students', 'POST', { name: 'Estudiante Once', email: correo, permitir: false });
    assert.equal(creado.status, 201);
    assert.equal(creado.body.student.projectLimit, 0);
    const est = await estrenar(correo, creado.body.clave);
    const idEst = creado.body.student.id;
    assert.equal((await est.api('/auth/me')).body.user.role, 'student');
    const sin = await est.api('/projects', 'POST', { name: 'Mío', data: {} });
    assert.equal(sin.status, 403);
    assert.equal(sin.body.code, 'no_quota');
    assert.match(sin.body.error, /profesor/);

    // El profesor lo permite (hasta el tope) y entonces sí crea; otro profesor no puede tocarlo ni verlo.
    assert.equal((await otroProfe.api(`/teacher/students/${idEst}/limit`, 'POST', { limit: 1 })).status, 404);
    assert.equal((await profe.api(`/teacher/students/${idEst}/limit`, 'POST', { limit: 99 })).status, 400);
    assert.equal((await profe.api(`/teacher/students/${idEst}/limit`, 'POST', { limit: 1 })).body.student.projectLimit, 1);
    const p = (await est.api('/projects', 'POST', { name: 'Mío', data: { titulo: 'Título del estudiante' } })).body.project;
    assert.ok(p.id);
    assert.equal((await est.api('/projects', 'POST', { name: 'Otro', data: {} })).body.code, 'quota_full');

    // Supervisión: el profesor ve a su estudiante con el proyecto y lo abre; el otro profesor y el investigador, no.
    const lista = (await profe.api('/teacher/students')).body.students;
    assert.equal(lista.length, 1);
    assert.equal(lista[0].projects[0].id, p.id);
    assert.equal((await profe.api(`/teacher/projects/${p.id}`)).body.project.data.titulo, 'Título del estudiante');
    assert.equal((await otroProfe.api(`/teacher/projects/${p.id}`)).status, 404);
    assert.equal((await otroProfe.api('/teacher/students')).body.students.length, 0);
    // El administrador ve todos los proyectos con su dueño; nadie más entra a esa lista.
    const todos = (await admin('/admin/projects')).body.projects;
    const fila = todos.find((x) => x.id === p.id);
    assert.equal(fila.titulo, 'Título del estudiante');
    assert.equal(fila.ownerRole, 'student');
    assert.equal(fila.ownerEmail, correo);
    assert.equal((await profe.api('/admin/projects')).status, 403);
    // Supervisar es leer: el profesor no puede escribir en el proyecto del estudiante.
    assert.equal((await profe.api(`/projects/${p.id}`, 'PUT', { patch: { titulo: 'Del profesor' } })).status, 404);

    // Contraseña nueva: la anterior deja de servir y la sesión del estudiante se cierra.
    const nueva = await profe.api(`/teacher/students/${idEst}/access`, 'POST');
    assert.equal(nueva.status, 200);
    assert.equal((await est.api('/auth/me')).body.user, null);
    assert.equal((await cliente()('/auth/login', 'POST', { email: correo, password: est.password })).status, 401);
    await estrenar(correo, nueva.body.clave);

    // El administrador asigna roles: pasa al estudiante a otro profesor, y a un investigador lo vuelve profesor.
    assert.equal((await profe.api(`/admin/users/${idEst}/role`, 'POST', { role: 'teacher' })).status, 403);
    const movido = await admin(`/admin/users/${idEst}/role`, 'POST', { role: 'student', teacherId: otroProfe.id });
    assert.equal(movido.body.user.teacherId, otroProfe.id);
    assert.equal((await profe.api('/teacher/students')).body.students.length, 0);
    assert.equal((await otroProfe.api('/teacher/students')).body.students.length, 1);
    assert.equal((await admin(`/admin/users/${invest.id}/role`, 'POST', { role: 'teacher' })).body.user.role, 'teacher');
    assert.equal((await invest.api('/teacher/students')).status, 200);
    assert.equal((await admin(`/admin/users/${invest.id}/role`, 'POST', { role: 'admin' })).status, 400);
    // Si el profesor deja de serlo, sus estudiantes quedan sin profesor a cargo.
    assert.equal((await admin(`/admin/users/${otroProfe.id}/role`, 'POST', { role: 'researcher' })).status, 200);
    assert.equal((await admin('/admin/users')).body.users.find((u) => u.id === idEst).teacherId, null);
});

test('modificar y eliminar usuarios: solo el administrador; al eliminar se van sus proyectos y queda una copia', async () => {
    const admin = await entrarAdmin();
    const profe = await cuenta('profe12', 'teacher');
    const otro = await cuenta('otro12');
    const creado = await profe.api('/teacher/students', 'POST', { name: 'Estudiante Doce', email: `est12.${Date.now()}@example.test`, permitir: true });
    const est = await estrenar(creado.body.student.email, creado.body.clave);
    const idEst = creado.body.student.id;
    const propio = (await est.api('/projects', 'POST', { name: 'Del estudiante', data: {} })).body.project;
    // El estudiante además está invitado al proyecto de otro.
    const ajeno = (await otro.api('/projects', 'POST', { name: 'Compartido', data: {} })).body.project;
    assert.equal((await otro.api(`/projects/${ajeno.id}/members`, 'POST', { email: est.email })).status, 201);

    // Modificar: valida, no deja repetir correo, y solo el administrador.
    assert.equal((await profe.api(`/admin/users/${idEst}`, 'PUT', { name: 'X' })).status, 403);
    assert.equal((await admin(`/admin/users/${idEst}`, 'PUT', { name: '  ' })).status, 400);
    assert.equal((await admin(`/admin/users/${idEst}`, 'PUT', { email: 'sin-arroba' })).status, 400);
    assert.equal((await admin(`/admin/users/${idEst}`, 'PUT', { email: otro.email })).status, 400);
    assert.equal((await admin('/admin/users/1', 'PUT', { name: 'Otro admin' })).status, 400);
    const soloNombre = await admin(`/admin/users/${idEst}`, 'PUT', { name: 'Estudiante  Corregido' });
    assert.equal(soloNombre.body.user.name, 'Estudiante Corregido');
    assert.equal((await est.api('/auth/me')).body.user.name, 'Estudiante Corregido'); // cambiar el nombre no cierra la sesión

    // Cambiar el correo: cierra la sesión, entra con el nuevo y la misma contraseña, y conserva la invitación.
    const nuevoCorreo = `est12b.${Date.now()}@example.test`;
    assert.equal((await admin(`/admin/users/${idEst}`, 'PUT', { email: nuevoCorreo.toUpperCase() })).body.user.email, nuevoCorreo);
    assert.equal((await est.api('/auth/me')).body.user, null);
    assert.equal((await cliente()('/auth/login', 'POST', { email: est.email, password: est.password })).status, 401);
    const denuevo = cliente();
    assert.equal((await denuevo('/auth/login', 'POST', { email: nuevoCorreo, password: est.password })).status, 200);
    assert.equal((await denuevo(`/projects/${ajeno.id}`)).status, 200);

    // Eliminar: solo el administrador, nunca a un administrador.
    assert.equal((await profe.api(`/admin/users/${idEst}`, 'DELETE')).status, 403);
    assert.equal((await admin('/admin/users/1', 'DELETE')).status, 400);
    assert.equal((await admin('/admin/users/999999', 'DELETE')).status, 404);
    const borrado = await admin(`/admin/users/${idEst}`, 'DELETE');
    assert.equal(borrado.status, 200);
    assert.equal(borrado.body.proyectos, 1);
    assert.equal((await denuevo('/auth/me')).body.user, null);
    assert.equal((await cliente()('/auth/login', 'POST', { email: nuevoCorreo, password: est.password })).status, 401);
    assert.equal((await admin(`/admin/projects/${propio.id}`)).status, 404);
    assert.ok(!(await otro.api(`/projects/${ajeno.id}/members`)).body.members.some((m) => m.email === nuevoCorreo));
    assert.equal((await profe.api('/teacher/students')).body.students.length, 0);
    assert.ok((await admin('/admin/estado')).body.backups.length >= 1); // quedó copia antes de borrar

    // Al eliminar a un profesor, sus estudiantes quedan sin profesor (no se borran).
    const hijo = await profe.api('/teacher/students', 'POST', { name: 'Queda', email: `queda12.${Date.now()}@example.test` });
    assert.equal((await admin(`/admin/users/${profe.id}`, 'DELETE')).status, 200);
    const queda = (await admin('/admin/users')).body.users.find((u) => u.id === hijo.body.student.id);
    assert.equal(queda.teacherId, null);
});

test('muchas cuentas: grupos, cambios masivos en una llamada y registro de lo que se hizo', async () => {
    const admin = await entrarAdmin();
    const t = Date.now();
    const profe = await cuenta('profe13', 'teacher');
    // 40 estudiantes en un lote, con grupo para todo el lote salvo los que traen el suyo.
    const lote = Array.from({ length: 40 }, (_, i) => ({ name: `Alumno ${i}`, email: `a${i}.${t}@example.test`, role: 'student', ...(i < 5 ? { group: 'Grupo B' } : {}) }));
    const cargado = (await admin('/admin/users/batch', 'POST', { users: lote, group: '  Grupo   A ' })).body;
    assert.equal(cargado.creadas, 40);
    const lista = async () => (await admin('/admin/users')).body.users.filter((u) => /^a\d+\./.test(u.email) && u.email.endsWith(`.${t}@example.test`));
    let cuentas = await lista();
    assert.equal(cuentas.filter((u) => u.grupo === 'Grupo A').length, 35);
    assert.equal(cuentas.filter((u) => u.grupo === 'Grupo B').length, 5);
    const ids = cuentas.map((u) => u.id);

    // Solo el administrador; valida la acción y los valores; nunca toca a un administrador.
    assert.equal((await profe.api('/admin/users/bulk', 'POST', { ids, action: 'limit', value: 1 })).status, 403);
    assert.equal((await admin('/admin/users/bulk', 'POST', { ids: [], action: 'limit', value: 1 })).status, 400);
    assert.equal((await admin('/admin/users/bulk', 'POST', { ids, action: 'inventada' })).status, 400);
    assert.equal((await admin('/admin/users/bulk', 'POST', { ids, action: 'limit', value: 99 })).status, 400);
    assert.equal((await admin('/admin/users/bulk', 'POST', { ids, action: 'role', value: 'admin' })).status, 400);
    assert.equal((await admin('/admin/users/bulk', 'POST', { ids, action: 'teacher', value: 999999 })).status, 400);
    assert.deepEqual((await admin('/admin/users/bulk', 'POST', { ids: [1], action: 'delete' })).body, { hechas: 0, omitidas: 1 });
    assert.equal((await admin('/auth/me')).body.user.role, 'admin');

    // Profesor, cupo y grupo para las 40 de una vez.
    assert.equal((await admin('/admin/users/bulk', 'POST', { ids, action: 'teacher', value: profe.id })).body.hechas, 40);
    assert.equal((await admin('/admin/users/bulk', 'POST', { ids, action: 'limit', value: 1 })).body.hechas, 40);
    assert.equal((await admin('/admin/users/bulk', 'POST', { ids: ids.slice(0, 10), action: 'group', value: 'Grupo C' })).body.hechas, 10);
    cuentas = await lista();
    assert.ok(cuentas.every((u) => u.teacherId === profe.id && u.projectLimit === 1));
    assert.equal(cuentas.filter((u) => u.grupo === 'Grupo C').length, 10);
    assert.equal((await profe.api('/teacher/students')).body.students.length, 40);

    // Bloquear solo cuenta las que cambian; contraseñas nuevas devuelve la lista y sirven para entrar.
    assert.equal((await admin('/admin/users/bulk', 'POST', { ids: ids.slice(0, 3), action: 'status', value: 'blocked' })).body.hechas, 3);
    assert.deepEqual((await admin('/admin/users/bulk', 'POST', { ids: ids.slice(0, 5), action: 'status', value: 'blocked' })).body, { hechas: 2, omitidas: 3 });
    assert.equal((await admin('/admin/users/bulk', 'POST', { ids: ids.slice(0, 5), action: 'status', value: 'active' })).body.hechas, 5);
    const claves = (await admin('/admin/users/bulk', 'POST', { ids: ids.slice(0, 2), action: 'access' })).body;
    assert.equal(claves.cuentas.length, 2);
    await estrenar(claves.cuentas[0].email, claves.cuentas[0].clave);

    // Cambiar el rol a investigador les da cupo propio y los suelta del profesor.
    assert.equal((await admin('/admin/users/bulk', 'POST', { ids: ids.slice(30), action: 'role', value: 'researcher' })).body.hechas, 10);
    cuentas = await lista();
    assert.ok(cuentas.filter((u) => u.role === 'researcher').every((u) => u.teacherId === null));
    assert.equal((await profe.api('/teacher/students')).body.students.length, 30);

    // Corregir el grupo de una cuenta desde su ficha; eliminar varias de una vez.
    assert.equal((await admin(`/admin/users/${ids[0]}`, 'PUT', { grupo: ' Grupo  Z ' })).body.user.grupo, 'Grupo Z');
    assert.equal((await admin(`/admin/users/${ids[0]}`, 'PUT', { name: 'Solo nombre' })).body.user.grupo, 'Grupo Z');
    assert.equal((await admin('/admin/users/bulk', 'POST', { ids: ids.slice(20), action: 'delete' })).body.hechas, 20);
    assert.equal((await lista()).length, 20);

    // Grupos: cambiar el nombre, unir con otro que ya existe y quitar (las cuentas se conservan).
    const enGrupo = async (g) => (await lista()).filter((u) => u.grupo === g).length;
    const antesA = await enGrupo('Grupo A');
    const antesC = await enGrupo('Grupo C');
    assert.ok(antesA > 0 && antesC > 0);
    assert.equal((await profe.api('/admin/groups/rename', 'POST', { from: 'Grupo A', to: 'X' })).status, 403);
    assert.equal((await admin('/admin/groups/rename', 'POST', { from: '', to: 'X' })).status, 400);
    assert.equal((await admin('/admin/groups/rename', 'POST', { from: 'Grupo A', to: ' Grupo  A ' })).status, 400);
    assert.equal((await admin('/admin/groups/rename', 'POST', { from: 'No existe', to: 'X' })).status, 404);
    assert.deepEqual((await admin('/admin/groups/rename', 'POST', { from: 'Grupo A', to: ' Cohorte  2026 ' })).body, { cuentas: antesA, unido: false, grupo: 'Cohorte 2026' });
    assert.equal(await enGrupo('Grupo A'), 0);
    assert.equal((await admin('/admin/groups/rename', 'POST', { from: 'Grupo C', to: 'Cohorte 2026' })).body.unido, true);
    assert.equal(await enGrupo('Cohorte 2026'), antesA + antesC);
    const total = (await lista()).length;
    assert.equal((await admin('/admin/groups/rename', 'POST', { from: 'Cohorte 2026', to: '' })).body.cuentas, antesA + antesC);
    assert.equal(await enGrupo('Cohorte 2026'), 0);
    assert.equal((await lista()).length, total);

    // Todo quedó en el registro, con quién lo hizo; solo el administrador lo lee.
    const log = (await admin('/admin/log')).body.log;
    assert.ok(log.some((l) => l.action.startsWith('Eliminó') && l.action.includes('20 cuentas') && l.actor === 'Administrador'));
    assert.ok(log.some((l) => l.action === 'Cargó un lote de cuentas'));
    assert.ok(log.some((l) => l.action === 'Modificó una cuenta' && l.detail.includes('Grupo Z')));
    assert.ok(!log.some((l) => l.detail.includes(claves.cuentas[0].clave)));
    assert.equal((await profe.api('/admin/log')).status, 403);
});

test('papelera: una cuenta eliminada se restaura con su contraseña, proyectos, versiones, figuras e invitaciones', async () => {
    const admin = await entrarAdmin();
    const profe = await cuenta('profe14', 'teacher');
    const otro = await cuenta('otro14');
    const creado = await profe.api('/teacher/students', 'POST', { name: 'Estudiante Catorce', email: `est14.${Date.now()}@example.test`, permitir: true });
    const est = await estrenar(creado.body.student.email, creado.body.clave);
    const idEst = creado.body.student.id;
    const p = (await est.api('/projects', 'POST', { name: 'Tesis', data: { titulo: 'Versión 1' } })).body.project;
    await est.api(`/projects/${p.id}`, 'PUT', { patch: { titulo: 'Versión 2' } });
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    const figura = (await est.api(`/projects/${p.id}/files`, 'POST', { mime: 'image/png', data: png.toString('base64') })).body.file;
    const ajeno = (await otro.api('/projects', 'POST', { name: 'Compartido', data: {} })).body.project;
    await otro.api(`/projects/${ajeno.id}/members`, 'POST', { email: est.email });

    // Eliminar la manda a la papelera; solo el administrador la ve.
    assert.equal((await admin(`/admin/users/${idEst}`, 'DELETE')).status, 200);
    assert.equal((await profe.api('/admin/trash')).status, 403);
    const enPapelera = (await admin('/admin/trash')).body.trash.find((c) => c.email === est.email);
    assert.equal(enPapelera.projects, 1);
    assert.equal(enPapelera.deletedBy, 'Administrador');
    assert.ok(enPapelera.venceEn >= 29);
    assert.equal(enPapelera.data, undefined); // la lista no arrastra el contenido
    assert.equal((await cliente()('/auth/login', 'POST', { email: est.email, password: est.password })).status, 401);

    // Si alguien ocupa ese correo, no se restaura hasta liberarlo.
    const intruso = await admin('/admin/users', 'POST', { name: 'Intruso', email: est.email, role: 'researcher' });
    assert.equal((await admin(`/admin/trash/${enPapelera.id}/restore`, 'POST')).status, 400);
    assert.equal((await admin(`/admin/users/${intruso.body.user.id}`, 'PUT', { email: `libre14.${Date.now()}@example.test` })).status, 200);

    // Restaurar: mismo id, misma contraseña, vuelve con su profesor, su proyecto, su versión, su figura y su invitación.
    assert.equal((await profe.api(`/admin/trash/${enPapelera.id}/restore`, 'POST')).status, 403);
    const vuelto = await admin(`/admin/trash/${enPapelera.id}/restore`, 'POST');
    assert.equal(vuelto.status, 200);
    assert.equal(vuelto.body.user.id, idEst);
    assert.equal(vuelto.body.user.teacherId, profe.id);
    assert.equal((await admin(`/admin/trash/${enPapelera.id}/restore`, 'POST')).status, 404);
    const denuevo = cliente();
    assert.equal((await denuevo('/auth/login', 'POST', { email: est.email, password: est.password })).status, 200);
    assert.equal((await denuevo(`/projects/${p.id}`)).body.project.data.titulo, 'Versión 2');
    const versiones = (await denuevo(`/projects/${p.id}/versions`)).body.versions;
    assert.equal((await denuevo(`/projects/${p.id}/versions/${versiones[0].id}`)).body.version.data.titulo, 'Versión 1');
    const imagen = await denuevo(`/projects/${p.id}/files/${figura.id}`);
    assert.equal(imagen.status, 200);
    assert.deepEqual([...new Uint8Array(imagen.body)], [...png]);
    assert.equal((await denuevo(`/projects/${ajeno.id}`)).status, 200);
    assert.equal((await profe.api('/teacher/students')).body.students.length, 1);

    // Un profesor eliminado y restaurado recupera a los estudiantes que seguían sin profesor.
    assert.equal((await admin(`/admin/users/${profe.id}`, 'DELETE')).status, 200);
    assert.equal((await admin('/admin/users')).body.users.find((u) => u.id === idEst).teacherId, null);
    const profeEnPapelera = (await admin('/admin/trash')).body.trash.find((c) => c.email === profe.email);
    assert.equal((await admin(`/admin/trash/${profeEnPapelera.id}/restore`, 'POST')).status, 200);
    assert.equal((await admin('/admin/users')).body.users.find((u) => u.id === idEst).teacherId, profe.id);

    // Borrar definitivamente: una, y vaciar todo.
    assert.equal((await admin(`/admin/users/${otro.id}`, 'DELETE')).status, 200);
    const deOtro = (await admin('/admin/trash')).body.trash.find((c) => c.email === otro.email);
    assert.equal((await profe.api('/auth/me')).body.user, null); // al restaurar no vuelven las sesiones: el profesor entra de nuevo
    assert.equal((await denuevo(`/admin/trash/${deOtro.id}`, 'DELETE')).status, 403);
    assert.equal((await admin(`/admin/trash/${deOtro.id}`, 'DELETE')).status, 200);
    assert.equal((await admin(`/admin/trash/${deOtro.id}`, 'DELETE')).status, 404);
    assert.equal((await admin('/admin/trash', 'DELETE')).status, 200);
    assert.equal((await admin('/admin/trash')).body.trash.length, 0);

    // El registro se puede buscar por correo (el historial de una cuenta) y deja constancia de la restauración.
    const suyo = (await admin('/admin/log', 'POST', { q: est.email })).body.log;
    assert.ok(suyo.length >= 2 && suyo.every((l) => l.detail.toLowerCase().includes(est.email)));
    assert.ok(suyo.some((l) => l.action === 'Restauró una cuenta'));
    assert.equal((await admin('/admin/log', 'POST', { q: '%' })).body.log.length, 0); // los comodines no se interpretan
    // Los proyectos traen el grupo y el profesor de su dueño.
    const fila = (await admin('/admin/projects')).body.projects.find((x) => x.id === p.id);
    assert.equal(fila.ownerTeacherId, profe.id);
    assert.equal(fila.ownerGrupo, '');
});

test('lote que actualiza: cambia grupo, profesor y rol de cuentas que ya existen, sin tocar lo que la fila deja vacío', async () => {
    const admin = await entrarAdmin();
    const t = Date.now();
    const profeA = await cuenta('profeA15', 'teacher');
    const profeB = await cuenta('profeB15', 'teacher');
    const correos = [0, 1, 2].map((i) => `l${i}.${t}@example.test`);
    await admin('/admin/users/batch', 'POST', { users: correos.map((email, i) => ({ name: `Lote ${i}`, email, role: 'student', teacher: profeA.email, group: 'Viejo' })) });
    const ver = async (email) => (await admin('/admin/users')).body.users.find((u) => u.email === email);
    const antes = await ver(correos[0]);

    // Sin «actualizar», las que ya existen siguen dando error (no se cambia nada por accidente).
    const sin = (await admin('/admin/users/batch', 'POST', { users: [{ name: 'x', email: correos[0], role: 'student', group: 'Nuevo' }] })).body;
    assert.equal(sin.resultados[0].ok, false);
    assert.equal((await ver(correos[0])).grupo, 'Viejo');

    const r = (await admin('/admin/users/batch', 'POST', { update: true, users: [
        { name: 'No importa', email: correos[0], role: '', teacher: '', group: 'Nuevo' },            // solo grupo
        { name: '', email: correos[1].toUpperCase(), role: '', teacher: profeB.email, group: '' },   // solo profesor
        { name: '', email: correos[2], role: 'researcher', teacher: '', group: '' },                // solo rol
        { name: '', email: correos[0], role: '', teacher: 'nadie@example.test', group: '' },         // profesor inexistente
        { name: '', email: 'admin', role: 'student', teacher: '', group: 'X' },                      // administrador: intocable
        { name: 'Recién llegada', email: `nueva.${t}@example.test`, role: 'student', teacher: profeB.email, group: 'Nuevo' }, // no existe: se crea
    ] })).body;
    assert.deepEqual(r.resultados.map((x) => [x.ok, Boolean(x.actualizada)]), [[true, true], [true, true], [true, true], [false, false], [false, false], [true, false]]);
    assert.equal(r.creadas, 1);
    assert.equal(r.actualizadas, 3);
    assert.deepEqual(r.resultados[0].cambios, ['grupo']);
    assert.ok(r.resultados.slice(0, 5).every((x) => !x.clave) && r.resultados[5].clave); // solo la nueva trae contraseña

    const a = await ver(correos[0]);
    assert.deepEqual([a.grupo, a.teacherId, a.role, a.name], ['Nuevo', profeA.id, 'student', antes.name]);
    const b = await ver(correos[1]);
    assert.deepEqual([b.grupo, b.teacherId], ['Viejo', profeB.id]);
    const c = await ver(correos[2]);
    assert.deepEqual([c.role, c.teacherId, c.grupo, c.projectLimit], ['researcher', null, 'Viejo', 10]);
    assert.equal((await admin('/auth/me')).body.user.role, 'admin');
    // «ninguno» quita el profesor; repetir la misma fila ya no cambia nada.
    const q = (await admin('/admin/users/batch', 'POST', { update: true, users: [{ email: correos[1], role: '', teacher: 'ninguno', group: '' }, { email: correos[0], role: '', teacher: '', group: 'Nuevo' }] })).body;
    assert.equal((await ver(correos[1])).teacherId, null);
    assert.deepEqual(q.resultados[1].cambios, []);
    assert.equal(q.actualizadas, 1);
});

test('proyectos: traspasar a otra cuenta y duplicar como plantilla, con sus figuras', async () => {
    const admin = await entrarAdmin();
    const ana = await cuenta('ana16');
    const luis = await cuenta('luis16');
    const p = (await ana.api('/projects', 'POST', { name: 'Original', data: { titulo: 'Con figura' } })).body.project;
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    const f = (await ana.api(`/projects/${p.id}/files`, 'POST', { mime: 'image/png', data: png.toString('base64') })).body.file;
    await ana.api(`/projects/${p.id}`, 'PUT', { patch: { elementos: [{ id: 'e1', tipo: 'figura', titulo: 'Mapa', fileId: f.id }, { id: 'e2', tipo: 'tabla', filas: [[String(f.id)]] }] } });

    // Duplicar: solo el administrador; otro proyecto, otro número de figura, y el contenido apunta a la figura nueva.
    assert.equal((await ana.api(`/admin/projects/${p.id}/duplicate`, 'POST', { userId: luis.id })).status, 403);
    assert.equal((await admin('/admin/projects/999999/duplicate', 'POST', { userId: luis.id })).status, 404);
    assert.equal((await admin(`/admin/projects/${p.id}/duplicate`, 'POST', { userId: 999999 })).status, 400);
    const copia = await admin(`/admin/projects/${p.id}/duplicate`, 'POST', { userId: luis.id, name: 'Plantilla del curso' });
    assert.equal(copia.status, 201);
    const delCopia = (await luis.api(`/projects/${copia.body.project.id}`)).body.project;
    assert.equal(delCopia.name, 'Plantilla del curso');
    assert.equal(delCopia.data.titulo, 'Con figura');
    const nuevaFigura = delCopia.data.elementos[0].fileId;
    assert.notEqual(nuevaFigura, f.id);
    assert.equal(delCopia.data.elementos[1].filas[0][0], String(f.id)); // un número igual en una tabla no se toca
    assert.deepEqual([...new Uint8Array((await luis.api(`/projects/${delCopia.id}/files/${nuevaFigura}`)).body)], [...png]);
    assert.equal((await luis.api(`/projects/${delCopia.id}/files/${f.id}`)).status, 404); // la figura original no es suya
    assert.equal((await luis.api(`/projects/${delCopia.id}/versions`)).body.versions.length, 0);
    // Cambiar la copia no cambia el original.
    await luis.api(`/projects/${delCopia.id}`, 'PUT', { patch: { titulo: 'Otro' } });
    assert.equal((await ana.api(`/projects/${p.id}`)).body.project.data.titulo, 'Con figura');
    // Sin cuenta de destino, la copia queda en la del mismo dueño.
    const misma = await admin(`/admin/projects/${p.id}/duplicate`, 'POST', {});
    assert.equal(misma.body.owner.id, ana.id);
    assert.equal(misma.body.project.name, 'Original (copia)');

    // Traspasar: el dueño pasa a ser Luis; Ana queda invitada solo si se pide.
    assert.equal((await luis.api(`/admin/projects/${p.id}/transfer`, 'POST', { userId: luis.id })).status, 403);
    assert.equal((await admin(`/admin/projects/${p.id}/transfer`, 'POST', { userId: ana.id })).status, 400);
    assert.equal((await admin(`/admin/projects/${p.id}/transfer`, 'POST', { userId: 999999 })).status, 400);
    await ana.api(`/projects/${p.id}/members`, 'POST', { email: luis.email }); // Luis era invitado
    const tr = await admin(`/admin/projects/${p.id}/transfer`, 'POST', { userId: luis.id, keepAccess: true });
    assert.equal(tr.body.owner.id, luis.id);
    assert.equal((await ana.api(`/projects/${p.id}`)).status, 200); // sigue como invitada
    assert.equal((await ana.api(`/projects/${p.id}`, 'DELETE')).status, 403); // pero ya no es la dueña
    const miembros = (await luis.api(`/projects/${p.id}/members`)).body.members;
    assert.ok(miembros.find((m) => m.email === luis.email).owner);
    assert.equal(miembros.filter((m) => m.email === luis.email).length, 1);
    assert.equal((await luis.api(`/projects/${p.id}/files/${f.id}`)).status, 200);
    // Sin conservar acceso, el dueño anterior ya no lo ve.
    await admin(`/admin/projects/${p.id}/transfer`, 'POST', { userId: ana.id });
    assert.equal((await luis.api(`/projects/${p.id}`)).status, 404);
    assert.ok((await admin('/admin/log', 'POST', { q: 'Traspasó' })).body.log.length >= 2);
});

test('uso: se cuentan ingresos, guardados y búsquedas por día y por grupo, solo para el administrador', async () => {
    const admin = await entrarAdmin();
    const antes = (await admin('/admin/usage?days=7')).body;
    const hoyAntes = antes.serie.at(-1);
    const ana = await cuenta('ana17');
    await admin(`/admin/users/${ana.id}`, 'PUT', { grupo: 'Grupo Uso' });
    const p = (await ana.api('/projects', 'POST', { name: 'Uso', data: {} })).body.project;
    await ana.api(`/projects/${p.id}`, 'PUT', { patch: { titulo: 'Uno' } });
    await ana.api(`/projects/${p.id}`, 'PUT', { patch: { titulo: 'Dos' } });
    await ana.api(`/projects/${p.id}`, 'PUT', { patch: { titulo: 'Dos' } }); // sin cambios: no cuenta
    await ana.api('/buscar/articulos?q=citas%20medicas');
    assert.equal((await ana.api('/admin/usage')).status, 403);
    const u = (await admin('/admin/usage?days=7')).body;
    assert.equal(u.serie.length, 7);
    const hoy = u.serie.at(-1);
    assert.equal(hoy.guardado - hoyAntes.guardado, 2);
    assert.equal(hoy.ingreso - hoyAntes.ingreso, 1);
    assert.equal(hoy.articulos - hoyAntes.articulos, 1);
    assert.equal(hoy.activos - hoyAntes.activos, 1);
    const g = u.grupos.find((x) => x.grupo === 'Grupo Uso');
    assert.deepEqual([g.cuentas, g.guardado, g.ingreso], [1, 2, 1]);
    assert.ok(u.top.some((x) => x.email === ana.email && x.guardado === 2));
    assert.equal(u.normas.limite, 150);
    assert.equal((await admin('/admin/usage?days=9999')).body.serie.length, 90);
});

test('restaurar una copia de seguridad: pide RESTAURAR y la contraseña, guarda el estado actual y devuelve los datos de ese día', async () => {
    // Servidor aparte, para no devolver en el tiempo a las demás pruebas.
    const puerto = PORT + 2;
    const dir = path.join(tmp, 'restaurar');
    const hijo = spawn(process.execPath, ['index.js'], { cwd: path.join(root, 'server'), env: { ...process.env, PORT: String(puerto), DB_PATH: path.join(dir, 'r.db'), BACKUP_DIR: path.join(dir, 'copias'), NODE_ENV: 'test', OPENALEX_API_KEY: '', SEMANTIC_SCHOLAR_API_KEY: '', SMTP_HOST: '', GROQ_API_KEY: '', RULEX_API_KEY: '', ADMIN_INITIAL_PASSWORD: 'inicial-de-prueba' } });
    try {
        const base = `http://127.0.0.1:${puerto}/api`;
        for (let i = 0; i < 50; i += 1) { try { if ((await fetch(`${base}/health`)).ok) break; } catch { /* arrancando */ } await new Promise((r) => setTimeout(r, 100)); }
        const nav = () => { let cookie = ''; return async (ruta, method = 'GET', body) => { const res = await fetch(base + ruta, { method, headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, body: method === 'GET' ? undefined : JSON.stringify(body || {}) }); const set = res.headers.get('set-cookie'); if (set) cookie = set.split(';')[0]; return { status: res.status, body: await res.json().catch(() => ({})) }; }; };
        const admin = nav();
        const claveAdmin = clave();
        await admin('/auth/login', 'POST', { email: 'admin', password: 'inicial-de-prueba' });
        await admin('/auth/password', 'POST', { current: 'inicial-de-prueba', next: claveAdmin });
        const crear = async (nombre) => { const r = await admin('/admin/users', 'POST', { name: nombre, email: `${nombre}@example.test`, role: 'researcher' }); const api = nav(); await api('/auth/login', 'POST', { email: `${nombre}@example.test`, password: r.body.clave }); const mia = clave(); await api('/auth/password', 'POST', { current: r.body.clave, next: mia }); return { api, id: r.body.user.id, password: mia }; };

        // Estado del «día de la copia»: una cuenta con un proyecto.
        const ana = await crear('ana');
        const p = (await ana.api('/projects', 'POST', { name: 'Tesis', data: { titulo: 'Como estaba' } })).body.project;
        const copia = (await admin('/admin/backups', 'POST')).body.backup.name;

        // Después de la copia: se daña el proyecto y se crea otra cuenta.
        await ana.api(`/projects/${p.id}`, 'PUT', { patch: { titulo: 'Dañado' } });
        const luis = await crear('luis');
        assert.equal((await admin('/admin/users')).body.users.length, 3); // admin + ana + luis

        // No se restaura sin la palabra, sin la contraseña, sin ser administrador, ni una copia que no existe.
        assert.equal((await luis.api(`/admin/backups/${copia}/restore`, 'POST', { confirm: 'RESTAURAR', password: luis.password })).status, 403);
        assert.equal((await admin(`/admin/backups/${copia}/restore`, 'POST', { confirm: 'restaurar', password: claveAdmin })).status, 400);
        assert.equal((await admin(`/admin/backups/${copia}/restore`, 'POST', { confirm: 'RESTAURAR', password: 'no-es' })).status, 401);
        assert.equal((await admin('/admin/backups/projectsia-1999-01-01.db.gz/restore', 'POST', { confirm: 'RESTAURAR', password: claveAdmin })).status, 404);
        assert.equal((await admin('/admin/users')).body.users.length, 3);
        assert.equal((await ana.api(`/projects/${p.id}`)).body.project.data.titulo, 'Dañado');

        const r = await admin(`/admin/backups/${copia}/restore`, 'POST', { confirm: 'RESTAURAR', password: claveAdmin });
        assert.equal(r.status, 200);
        assert.equal(r.body.usuarios, 2); // admin + ana, como el día de la copia
        assert.match(r.body.previa, /^projectsia-antes-de-restaurar-/);
        assert.equal(r.body.safety.length, 1);

        // El administrador sigue dentro; Ana volvió con su proyecto como estaba y entra con su contraseña; Luis ya no existe.
        const usuarios = (await admin('/admin/users')).body.users;
        assert.deepEqual(usuarios.map((u) => u.email).sort(), ['admin', 'ana@example.test']);
        const anaOtraVez = ana.api; // su sesión sigue abierta: su cuenta existe en la copia
        assert.equal((await nav()('/auth/login', 'POST', { email: 'ana@example.test', password: ana.password })).status, 200);
        assert.equal((await anaOtraVez(`/projects/${p.id}`)).body.project.data.titulo, 'Como estaba');
        assert.equal((await luis.api('/auth/me')).body.user, null);
        assert.ok((await admin('/admin/log')).body.log.some((l) => l.action === 'Restauró una copia de seguridad'));
        // Se puede seguir trabajando (la base no quedó bloqueada) y deshacer: restaurar la copia «de antes».
        assert.equal((await anaOtraVez(`/projects/${p.id}`, 'PUT', { patch: { titulo: 'Sigue viva' } })).status, 200);
        const vuelta = await admin(`/admin/backups/${r.body.previa}/restore`, 'POST', { confirm: 'RESTAURAR', password: claveAdmin });
        assert.equal(vuelta.status, 200);
        assert.deepEqual((await admin('/admin/users')).body.users.map((u) => u.email).sort(), ['admin', 'ana@example.test', 'luis@example.test']);
        assert.equal((await anaOtraVez(`/projects/${p.id}`)).body.project.data.titulo, 'Dañado');
        assert.equal(vuelta.body.safety.length, 2);
    } finally {
        hijo.kill();
    }
});

test('carga por lotes: crea las filas buenas, explica las malas y enlaza cada estudiante con su profesor', async () => {
    const admin = await entrarAdmin();
    const t = Date.now();
    const lote = [
        { name: 'Profe Lote', email: `plote.${t}@example.test`, role: 'teacher' },
        { name: 'Est Uno', email: `e1.${t}@example.test`, role: 'student', teacher: `PLOTE.${t}@example.test` },
        { name: 'Inv Lote', email: `inv.${t}@example.test`, role: 'researcher' },
        { name: 'Repetido', email: `e1.${t}@example.test`, role: 'student' },
        { name: 'Mal correo', email: 'sin-arroba', role: 'student' },
        { name: 'Sin profe', email: `e2.${t}@example.test`, role: 'student', teacher: 'nadie@example.test' },
        { name: 'Quiere mandar', email: `adm.${t}@example.test`, role: 'admin' },
    ];
    assert.equal((await cliente()('/admin/users/batch', 'POST', { users: lote })).status, 401);
    assert.equal((await admin('/admin/users/batch', 'POST', { users: [] })).status, 400);
    const r = (await admin('/admin/users/batch', 'POST', { users: lote })).body;
    assert.equal(r.creadas, 3);
    assert.deepEqual(r.resultados.map((x) => x.ok), [true, true, true, false, false, false, false]);
    assert.ok(r.resultados.slice(3).every((x) => x.error && !x.clave));
    const usuarios = (await admin('/admin/users')).body.users;
    const profe = usuarios.find((u) => u.email === lote[0].email);
    const est = usuarios.find((u) => u.email === lote[1].email);
    assert.equal(est.teacherId, profe.id);
    assert.equal(est.projectLimit, 0);
    assert.equal(est.mustChangePassword, true);
    assert.ok(!usuarios.some((u) => u.email === lote[6].email));
    // La contraseña temporal del lote sirve para entrar; no queda escrita en el registro del servidor.
    await estrenar(lote[1].email, r.resultados[1].clave);
    assert.ok(!log.includes(r.resultados[1].clave));
});

test('búsqueda de artículos: exige sesión y, sin clave en el servidor, avisa para que el navegador busque directo', async () => {
    assert.equal((await cliente()('/buscar/articulos?q=citas')).status, 401);
    const ana = await cuenta('ana10');
    const r = await ana.api('/buscar/articulos?q=citas%20medicas&desde=2020&idioma=es');
    assert.equal(r.status, 503);
    assert.equal(r.body.code, 'no_key');
    // Una base desconocida se trata como la principal; la consulta vacía se rechaza.
    assert.equal((await ana.api('/buscar/articulos?fuente=otra&q=citas%20medicas')).body.code, 'no_key');
    assert.equal((await ana.api('/buscar/articulos?fuente=arxiv&q=a')).status, 400);
});
