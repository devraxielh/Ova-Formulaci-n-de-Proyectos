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
    chat: (payload) => request('/ai/chat', { method: 'POST', body: payload }),
    admin: {
        users: () => request('/admin/users'),
        user: (id) => request(`/admin/users/${id}`),
        project: (id) => request(`/admin/projects/${id}`),
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
