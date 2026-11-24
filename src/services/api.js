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
    register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
    login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
    logout: () => request('/auth/logout', { method: 'POST' }),
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
    buscarNormas: ({ texto, fuente = 'normas' }) => request(`/buscar/normas?fuente=${fuente}&q=${encodeURIComponent(texto)}`),
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
    chat: (payload) => request('/ai/chat', { method: 'POST', body: payload }),
    admin: {
        users: () => request('/admin/users'),
        estado: () => request('/admin/estado'),
        backupNow: () => request('/admin/backups', { method: 'POST' }),
        backupUrl: (name) => `/api/admin/backups/${encodeURIComponent(name)}`,
        clearErrors: () => request('/admin/errors', { method: 'DELETE' }),
        user: (id) => request(`/admin/users/${id}`),
        project: (id) => request(`/admin/projects/${id}`),
        setLimit: (id, limit) => request(`/admin/users/${id}/limit`, { method: 'POST', body: { limit } }),
        setStatus: (id, status) => request(`/admin/users/${id}/status`, { method: 'POST', body: { status } }),
        resend: (id) => request(`/admin/users/${id}/resend`, { method: 'POST' }),
    },
};

// Misma forma que el SDK de Groq (groq.chat.completions.create), pero la llamada
// pasa por nuestro servidor, que es el único que conoce la clave.
export const groq = {
    chat: {
        completions: {
            create: ({ messages, temperature, max_tokens, response_format }) =>
                api.chat({ messages, temperature, max_tokens, response_format }),
        },
    },
};
