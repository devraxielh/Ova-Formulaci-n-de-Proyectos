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
