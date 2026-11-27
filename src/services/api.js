import { aplicarEstilo, aplicarEstiloEnJson, estiloVacio, textoEstilo } from './estilo.js';
// Cliente del API propio (/api). La sesión viaja en una cookie httpOnly.

export class ApiError extends Error {
    constructor(message, status, code) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
    }
}

async function request(path, { method = 'GET', body } = {}) {
    let response;
    try {
        response = await fetch(`/api${path}`, {
            method,
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: method === 'GET' ? undefined : JSON.stringify(body ?? {}),
        });
    } catch {
        throw new ApiError('No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.', 0);
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new ApiError(data.error || 'El servidor no pudo completar la solicitud.', response.status, data.code);
    }
    return data;
}

export const api = {
    me: () => request('/auth/me'),
    login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
    guest: () => request('/auth/guest', { method: 'POST' }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    // Sale de la cuenta ajena a la que entró el administrador y vuelve a la suya.
    volver: () => request('/auth/volver', { method: 'POST' }),
    verify: (token) => request('/auth/verify', { method: 'POST', body: { token } }),
    resend: (email) => request('/auth/resend', { method: 'POST', body: { email } }),
    changePassword: (payload) => request('/auth/password', { method: 'POST', body: payload }),
    listProjects: () => request('/projects'),
    getProject: (id) => request(`/projects/${id}`),
    createProject: (payload) => request('/projects', { method: 'POST', body: payload }),
    updateProject: (id, payload) => request(`/projects/${id}`, { method: 'PUT', body: payload }),
    deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),
    projectVersion: (id, tab = '') => request(`/projects/${id}/version?tab=${encodeURIComponent(tab)}`),
    forgot: (email) => request('/auth/forgot', { method: 'POST', body: { email } }),
    reset: (payload) => request('/auth/reset', { method: 'POST', body: payload }),
    buscarTeorias: (teorias, tipo = 'teoria') => request('/buscar/teorias', { method: 'POST', body: { teorias, tipo } }),
    buscarNormas:({ texto, fuente = 'normas' }) => request(`/buscar/normas?fuente=${fuente}&q=${encodeURIComponent(texto)}`),
    buscarArticulos: ({ texto, desde, idioma, fuente = 'openalex' }) => request(`/buscar/articulos?fuente=${fuente}&q=${encodeURIComponent(texto)}&desde=${desde}&idioma=${idioma}`),
    log: (payload) => request('/log', { method: 'POST', body: payload }),
    members: (id) => request(`/projects/${id}/members`),
    addMember: (id, email) => request(`/projects/${id}/members`, { method: 'POST', body: { email } }),
    removeMember: (id, email) => request(`/projects/${id}/members/${encodeURIComponent(email)}`, { method: 'DELETE' }),
    versions: (id) => request(`/projects/${id}/versions`),
    saveVersion: (id) => request(`/projects/${id}/versions`, { method: 'POST' }),
    version: (id, vid) => request(`/projects/${id}/versions/${vid}`),
    surveys: (id) => request(`/projects/${id}/surveys`),
    publishSurvey: (id, iid, payload) => request(`/projects/${id}/surveys/${iid}`, { method: 'PUT', body: payload }),
    surveyResponses: (id, iid) => request(`/projects/${id}/surveys/${iid}/responses`),
    clearSurveyResponses: (id, iid) => request(`/projects/${id}/surveys/${iid}/responses`, { method: 'DELETE' }),
    publicSurvey: (token) => request(`/encuestas/${encodeURIComponent(token)}`),
    answerSurvey: (token, answers) => request(`/encuestas/${encodeURIComponent(token)}`, { method: 'POST', body: { answers } }),
    uploadFile: (id, payload) => request(`/projects/${id}/files`, { method: 'POST', body: payload }),
    deleteFile: (id, fid) => request(`/projects/${id}/files/${fid}`, { method: 'DELETE' }),
    fileUrl: (id, fid) => `/api/projects/${id}/files/${fid}`,
    // Si la cuenta agotó su cuota de IA, se avisa siempre (cada módulo muestra su propio mensaje genérico de fallo).
    chat: (payload) => request('/ai/chat', { method: 'POST', body: payload }).catch((error) => {
        if (error?.code === 'cuota_ia' && typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('psia:aviso', { detail: { texto: error.message, tipo: 'error' } }));
        throw error;
    }),
    admin: {
        users: () => request('/admin/users'),
        estado: () => request('/admin/estado'),
        backupNow: () => request('/admin/backups', { method: 'POST' }),
        backupUrl: (name) => `/api/admin/backups/${encodeURIComponent(name)}`,
        clearErrors: () => request('/admin/errors', { method: 'DELETE' }),
        user: (id) => request(`/admin/users/${id}`),
        project: (id) => request(`/admin/projects/${id}`),
        projects: () => request('/admin/projects'),
        setLimit: (id, limit) => request(`/admin/users/${id}/limit`, { method: 'POST', body: { limit } }),
        setStatus: (id, status) => request(`/admin/users/${id}/status`, { method: 'POST', body: { status } }),
        resend: (id) => request(`/admin/users/${id}/resend`, { method: 'POST' }),
        // Entra a la cuenta de otra persona (queda en la bitácora). Después hay que recargar la página.
        entrarComo: (id) => request(`/admin/users/${id}/entrar`, { method: 'POST' }),
        // Cuentas: solo el administrador las crea (una a una o por lotes), asigna el rol y renueva el acceso.
        createUser: (payload) => request('/admin/users', { method: 'POST', body: payload }),
        createBatch: (users, opciones = {}) => request('/admin/users/batch', { method: 'POST', body: { users, ...opciones } }),
        setRole: (id, role, teacherId) => request(`/admin/users/${id}/role`, { method: 'POST', body: { role, teacherId } }),
        newAccess: (id) => request(`/admin/users/${id}/access`, { method: 'POST' }),
        updateUser: (id, payload) => request(`/admin/users/${id}`, { method: 'PUT', body: payload }),
        deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
        // El mismo cambio a muchas cuentas en una sola llamada, y el registro de lo que se ha hecho.
        bulk: (ids, action, value) => request('/admin/users/bulk', { method: 'POST', body: { ids, action, value } }),
        log: (q = '') => (q ? request('/admin/log', { method: 'POST', body: { q } }) : request('/admin/log')),
        // Papelera: cuentas eliminadas que todavía se pueden restaurar.
        trash: () => request('/admin/trash'),
        // Copias: restaurar una (pide escribir RESTAURAR y la contraseña del administrador).
        restoreBackup: (name, password) => request(`/admin/backups/${encodeURIComponent(name)}/restore`, { method: 'POST', body: { confirm: 'RESTAURAR', password } }),
        // Proyectos: cambiar de dueño o duplicar como plantilla.
        transferProject: (id, userId, keepAccess) => request(`/admin/projects/${id}/transfer`, { method: 'POST', body: { userId, keepAccess } }),
        // Crea en la cuenta del administrador un proyecto de ejemplo completo (con encuesta y respuestas simuladas).
        crearEjemplo: (clave) => request(`/admin/ejemplos/${clave}`, { method: 'POST' }),
        duplicateProject: (id, userId, name) => request(`/admin/projects/${id}/duplicate`, { method: 'POST', body: { userId, name } }),
        usage: (days = 30) => request(`/admin/usage?days=${days}`),
        restore: (id) => request(`/admin/trash/${id}/restore`, { method: 'POST' }),
        purge: (id) => request(id ? `/admin/trash/${id}` : '/admin/trash', { method: 'DELETE' }),
        renameGroup: (from, to) => request('/admin/groups/rename', { method: 'POST', body: { from, to } }),
        // Grupos: profesor a cargo y cuota de IA. Cuota de IA por cuenta. Estado de los servicios externos.
        groups: () => request('/admin/groups'),
        groupTeacher: (grupo, teacherId) => request('/admin/groups/teacher', { method: 'POST', body: { grupo, teacherId } }),
        groupAiLimit: (grupo, limit) => request('/admin/groups/ai-limit', { method: 'POST', body: { grupo, limit } }),
        aiQuota: () => request('/admin/ia-cuota'),
        aiQuotaGeneral: (limit) => request('/admin/ia-cuota/general', { method: 'POST', body: { limit } }),
        userAi: (id, cambios) => request(`/admin/users/${id}/ia`, { method: 'POST', body: cambios }),
        services: () => request('/admin/servicios'),
        testService: (id) => request(`/admin/servicios/${encodeURIComponent(id)}/probar`, { method: 'POST' }),
    },
    // Profesor: los estudiantes a su cargo y sus proyectos (solo lectura).
    teacher: {
        students: () => request('/teacher/students'),
        createStudent: (payload) => request('/teacher/students', { method: 'POST', body: payload }),
        createBatch: (users, opciones = {}) => request('/teacher/students/batch', { method: 'POST', body: { users, ...opciones } }),
        bulk: (ids, action, value) => request('/teacher/students/bulk', { method: 'POST', body: { ids, action, value } }),
        setLimit: (id, limit) => request(`/teacher/students/${id}/limit`, { method: 'POST', body: { limit } }),
        newAccess: (id) => request(`/teacher/students/${id}/access`, { method: 'POST' }),
        project: (id) => request(`/teacher/projects/${id}`),
        // Secciones que cada grupo puede construir (null = todas).
        secciones: () => request('/teacher/secciones'),
        crearGrupo: (name) => request('/teacher/grupos', { method: 'POST', body: { name } }),
        eliminarGrupo: (name, sacar = false) => request('/teacher/grupos/eliminar', { method: 'POST', body: { name, sacar } }),
        guardarSecciones: (grupo, secciones) => request('/teacher/secciones', { method: 'PUT', body: { grupo, secciones } }),
    },
};

// Misma forma que el SDK de Groq (groq.chat.completions.create), pero la llamada
// pasa por nuestro servidor, que es el único que conoce la clave.
// Además aplica el vocabulario y estilo del proyecto abierto (fijarEstiloIA lo actualiza el contexto del proyecto):
// va como instrucción en el mensaje de sistema y los términos pedidos se corrigen en la respuesta.
let estiloIA = null;
export const fijarEstiloIA = (estilo) => { estiloIA = estilo && !estiloVacio(estilo) ? estilo : null; };
const conEstilo = (messages) => {
    const regla = estiloIA ? textoEstilo(estiloIA) : '';
    if (!regla || !Array.isArray(messages)) return messages;
    const i = messages.findIndex((m) => m?.role === 'system');
    return i >= 0
        ? messages.map((m, k) => (k === i ? { ...m, content: `${m.content}\n\n${regla}` } : m))
        : [{ role: 'system', content: regla }, ...messages];
};
export const groq = {
    chat: {
        completions: {
            create: async ({ messages, temperature, max_tokens, response_format }) => {
                const r = await api.chat({ messages: conEstilo(messages), temperature, max_tokens, response_format });
                const content = r?.choices?.[0]?.message?.content;
                if (estiloIA && typeof content === 'string') r.choices[0].message.content = response_format?.type === 'json_object' ? aplicarEstiloEnJson(content, estiloIA) : aplicarEstilo(content, estiloIA);
                return r;
            },
        },
    },
};
