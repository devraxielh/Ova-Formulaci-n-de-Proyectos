import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../services/api';

/*
 * Proyecto activo compartido por todas las herramientas.
 * - Sin sesión: el borrador vive en este navegador (localStorage).
 * - Con sesión: se guarda en el servidor con autoguardado.
 * Cada herramienta lee y escribe campos con useProjectField('clave', valorInicial).
 */

const DRAFT_KEY = 'projectsia:borrador';
const ACTIVE_KEY = 'projectsia:proyecto-activo';
const NAME_KEY = 'projectsia:borrador-nombre';
const LEGACY_IDEA_KEY = 'projectsia:ideacion:cuaderno';
const SAVE_DELAY = 1200;
const PENDING_KEY = 'projectsia:pendiente:'; // cambios sin subir por falta de conexión, por proyecto
const RETRY_EVERY = 10000;
const SYNC_EVERY = 15000; // cada cuánto se revisa si un compañero guardó cambios

// Campos que cambiaron entre lo último sincronizado y lo actual (null = campo borrado).
const diffData = (synced, current) => {
    const patch = {};
    Object.keys(current).forEach((key) => { if (current[key] !== synced[key]) patch[key] = current[key] === undefined ? null : current[key]; });
    Object.keys(synced).forEach((key) => { if (!(key in current)) patch[key] = null; });
    return patch;
};

const readJson = (key) => {
    try {
        const value = JSON.parse(window.localStorage.getItem(key) || 'null');
        return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
    } catch {
        return null;
    }
};

const writeJson = (key, value) => {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
        /* sin almacenamiento local: el borrador queda solo en memoria */
    }
};

// Nombre del proyecto mientras no hay cuenta: vive en este navegador.
const readDraftName = () => {
    try {
        return (window.localStorage.getItem(NAME_KEY) || '').trim() || 'Mi proyecto';
    } catch {
        return 'Mi proyecto';
    }
};

const readDraft = () => {
    const draft = readJson(DRAFT_KEY);
    if (draft) return draft;
    const legacyIdea = readJson(LEGACY_IDEA_KEY);
    return legacyIdea ? { idea: legacyIdea } : {};
};

const hasContent = (data) => Object.values(data || {}).some((value) => {
    if (typeof value === 'string') return value.trim() !== '';
    if (Array.isArray(value)) return value.length > 0;
    if (value && typeof value === 'object') return hasContent(value);
    return false;
});

const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authReady, setAuthReady] = useState(false);
    const [projects, setProjects] = useState([]);
    const [project, setProject] = useState(() => ({ id: null, name: readDraftName() }));
    const [data, setData] = useState(readDraft);
    const [saveState, setSaveState] = useState('local'); // local | saved | saving | offline | error
    const [sinCupo, setSinCupo] = useState(false); // cuenta activa, pero el administrador aún no le autoriza crear proyectos
    const [conflict, setConflict] = useState(null); // { keys: [{ key, by }] } campos que otro integrante guardó a la vez
    const [others, setOthers] = useState([]); // integrantes conectados: [{ name, tab }]
    const sectionRef = useRef(''); // sección que este navegador tiene abierta
    const [section, setSectionState] = useState('');
    const conflictRef = useRef(new Set());
    const retryRef = useRef(null);
    const [saveError, setSaveError] = useState('');

    const dataRef = useRef(data);
    const projectRef = useRef(project);
    const timerRef = useRef(null);
    const dirtyRef = useRef(false);
    const loadedRef = useRef(data); // último contenido cargado (no editado): no dispara guardado
    const syncedRef = useRef(data); // lo que el servidor tiene, según este navegador
    const versionRef = useRef(0);
    dataRef.current = data;
    projectRef.current = project;

    const flush = useCallback(async () => {
        window.clearTimeout(timerRef.current);
        const id = projectRef.current.id;
        if (!id || !dirtyRef.current) return;
        dirtyRef.current = false;
        setSaveState('saving');
        const snapshot = dataRef.current;
        const patch = diffData(syncedRef.current, snapshot);
        // Los campos en choque esperan la decisión del estudiante: no se reenvían solos.
        conflictRef.current.forEach((key) => { delete patch[key]; });
        try {
            if (Object.keys(patch).length > 0) {
                // Solo viajan los campos editados: así dos integrantes pueden trabajar en secciones distintas a la vez.
                const { project: saved, conflicts = [] } = await api.updateProject(id, { patch, base: versionRef.current });
                if (projectRef.current.id === id) {
                    const rejected = new Set(conflicts.map((c) => c.key));
                    const synced = { ...syncedRef.current };
                    Object.keys(patch).forEach((key) => {
                        if (rejected.has(key)) return;
                        if (patch[key] === null) delete synced[key]; else synced[key] = snapshot[key];
                    });
                    syncedRef.current = synced;
                    // Si la versión saltó más de uno, alguien más guardó en medio: se traen sus cambios.
                    const expected = versionRef.current + 1;
                    const applied = rejected.size < Object.keys(patch).length;
                    versionRef.current = saved.version;
                    if (conflicts.length > 0) {
                        conflicts.forEach((c) => conflictRef.current.add(c.key));
                        setConflict((prev) => ({ keys: [...(prev?.keys || []).filter((k) => !rejected.has(k.key)), ...conflicts] }));
                    }
                    if (applied && saved.version !== expected) pullRef.current?.();
                }
            }
            try { window.localStorage.removeItem(PENDING_KEY + id); } catch { /* noop */ }
            window.clearTimeout(retryRef.current);
            if (!dirtyRef.current) setSaveState('saved');
            setSaveError('');
        } catch (error) {
            dirtyRef.current = true;
            if (error.status === 0) {
                // Sin conexión: los cambios quedan guardados en este navegador y se suben solos al volver el internet.
                writeJson(PENDING_KEY + id, { patch: diffData(syncedRef.current, dataRef.current), at: Date.now() });
                setSaveState('offline');
                setSaveError('');
                window.clearTimeout(retryRef.current);
                retryRef.current = window.setTimeout(() => flushRef.current?.(), RETRY_EVERY);
            } else {
                setSaveState('error');
                setSaveError(error.message);
            }
        }
    }, []);
    const flushRef = useRef(null);
    flushRef.current = flush;

    const scheduleSave = useCallback(() => {
        if (!projectRef.current.id) {
            writeJson(DRAFT_KEY, dataRef.current);
            return;
        }
        dirtyRef.current = true;
        setSaveState('saving');
        window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(flush, SAVE_DELAY);
    }, [flush]);

    const setField = useCallback((key, value) => {
        setData((prev) => {
            const nextValue = typeof value === 'function' ? value(prev[key]) : value;
            if (Object.is(prev[key], nextValue)) return prev;
            return { ...prev, [key]: nextValue };
        });
    }, []);

    // Cada edición programa un guardado; cargar un proyecto no.
    useEffect(() => {
        if (data === loadedRef.current) return;
        scheduleSave();
    }, [data, scheduleSave]);

    const replaceData = useCallback((next) => {
        loadedRef.current = next;
        syncedRef.current = next;
        dataRef.current = next;
        setData(next);
    }, []);

    // Trae lo que guardaron los compañeros y conserva los campos que este navegador aún no ha guardado.
    const pullRef = useRef(null);
    const checkRef = useRef(null);
    const pull = useCallback(async () => {
        const id = projectRef.current.id;
        if (!id) return;
        try {
            const { project: remote } = await api.getProject(id);
            if (projectRef.current.id !== id) return;
            const server = remote.data || {};
            const synced = syncedRef.current;
            const local = dataRef.current;
            const merged = { ...server };
            Object.keys(local).forEach((key) => { if (local[key] !== synced[key]) merged[key] = local[key]; });
            Object.keys(synced).forEach((key) => { if (!(key in local)) delete merged[key]; });
            const pending = Object.keys(diffData(server, merged)).length > 0;
            versionRef.current = remote.version;
            syncedRef.current = server;
            if (!pending) loadedRef.current = merged;
            dataRef.current = merged;
            setData(merged);
            setProject((prev) => (prev.id === id ? { ...prev, name: remote.name } : prev));
        } catch { /* sin conexión: se reintenta en la siguiente revisión */ }
    }, []);
    pullRef.current = pull;

    const openProject = useCallback(async (id) => {
        await flush();
        const { project: loaded } = await api.getProject(id);
        setProject({ id: loaded.id, name: loaded.name, shared: Boolean(loaded.shared), ownerName: loaded.ownerName || '' });
        versionRef.current = loaded.version || 0;
        conflictRef.current = new Set();
        setConflict(null);
        setOthers([]);
        replaceData(loaded.data || {});
        setSaveState('saved');
        // Cambios que quedaron sin subir (se cerró la pestaña sin internet): se aplican encima y se guardan.
        const pending = readJson(PENDING_KEY + loaded.id);
        if (pending?.patch && Object.keys(pending.patch).length > 0) {
            setData((prev) => {
                const next = { ...prev };
                Object.entries(pending.patch).forEach(([key, value]) => { if (value === null) delete next[key]; else next[key] = value; });
                return next;
            });
        }
        try { window.localStorage.setItem(ACTIVE_KEY, String(loaded.id)); } catch { /* noop */ }
        return loaded.data || {};
    }, [flush, replaceData]);

    // Al iniciar sesión: abre el último proyecto o sube el borrador local como primer proyecto.
    const loadForUser = useCallback(async () => {
        const localDraft = readDraft();
        const { projects: list } = await api.listProjects();
        setSinCupo(false);
        if (list.length === 0) {
            const draft = hasContent(dataRef.current) ? dataRef.current : localDraft;
            let created;
            try {
                ({ project: created } = await api.createProject({ name: readDraftName(), data: draft }));
            } catch (error) {
                // Sin permiso todavía: la app muestra la pantalla de espera (el borrador de este navegador se conserva).
                if (error.code !== 'no_quota') throw error;
                setProjects([]);
                setProject({ id: null, name: readDraftName() });
                setSinCupo(true);
                return;
            }
            setProjects([{ id: created.id, name: created.name, updatedAt: created.updatedAt }]);
            loadedRef.current = draft;
            syncedRef.current = draft;
            versionRef.current = created.version || 1;
            setProject({ id: created.id, name: created.name });
            setSaveState('saved');
            try {
                window.localStorage.removeItem(DRAFT_KEY);
                window.localStorage.removeItem(NAME_KEY);
            } catch { /* noop */ }
            return;
        }
        setProjects(list);
        let preferred = null;
        try { preferred = Number(window.localStorage.getItem(ACTIVE_KEY)); } catch { /* noop */ }
        const target = list.find((item) => item.id === preferred) || list[0];
        const loaded = await openProject(target.id);
        // Si la cuenta se activó en otro equipo, su primer proyecto quedó vacío: se le pasa el borrador de este navegador.
        if (list.length === 1 && !hasContent(loaded) && hasContent(localDraft)) {
            setData(localDraft);
            try { window.localStorage.removeItem(DRAFT_KEY); } catch { /* noop */ }
        }
    }, [openProject]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const { user: current } = await api.me();
                if (cancelled) return;
                if (current) {
                    setUser(current);
                    await loadForUser();
                }
            } catch {
                /* sin servidor: se trabaja con el borrador local */
            } finally {
                if (!cancelled) setAuthReady(true);
            }
        })();
        return () => { cancelled = true; };
    }, [loadForUser]);

    // Revisión periódica: si la versión del servidor cambió (un compañero guardó), se traen sus cambios.
    useEffect(() => {
        if (!user || !project.id) return undefined;
        const check = async () => {
            if (document.visibilityState === 'hidden') return;
            try {
                const { version, others: now = [] } = await api.projectVersion(project.id, sectionRef.current);
                if (projectRef.current.id !== project.id) return;
                setOthers((prev) => (JSON.stringify(prev) === JSON.stringify(now) ? prev : now));
                if (version !== versionRef.current) await pull();
            } catch { /* noop */ }
        };
        const timer = window.setInterval(check, SYNC_EVERY);
        checkRef.current = check;
        check();
        const onShow = () => { if (document.visibilityState === 'visible') check(); };
        document.addEventListener('visibilitychange', onShow);
        return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', onShow); };
    }, [user, project.id, pull]);

    // Al volver la conexión se suben de inmediato los cambios pendientes.
    useEffect(() => {
        const onOnline = () => flush();
        window.addEventListener('online', onOnline);
        return () => window.removeEventListener('online', onOnline);
    }, [flush]);

    // La app avisa qué sección está abierta para que los compañeros lo vean.
    const setSection = useCallback((tab) => {
        if (sectionRef.current === tab) return;
        sectionRef.current = tab;
        setSectionState(tab);
        checkRef.current?.();
    }, []);

    // Choque resuelto: «mine» guarda lo de este navegador encima; «theirs» se queda con lo que guardó el compañero.
    const resolveConflict = useCallback(async (choice) => {
        const id = projectRef.current.id;
        const keys = [...conflictRef.current];
        if (!id || keys.length === 0) { setConflict(null); return; }
        if (choice === 'mine') {
            const patch = {};
            keys.forEach((key) => { patch[key] = dataRef.current[key] === undefined ? null : dataRef.current[key]; });
            // Antes de escribir encima se guarda una copia de lo que dejó el compañero.
            await api.saveVersion(id);
            const { project: saved } = await api.updateProject(id, { patch, force: true });
            const synced = { ...syncedRef.current };
            keys.forEach((key) => { if (patch[key] === null) delete synced[key]; else synced[key] = dataRef.current[key]; });
            syncedRef.current = synced;
            versionRef.current = saved.version;
        } else {
            const { project: remote } = await api.getProject(id);
            const server = remote.data || {};
            const next = { ...dataRef.current };
            const synced = { ...syncedRef.current };
            keys.forEach((key) => {
                if (key in server) { next[key] = server[key]; synced[key] = server[key]; } else { delete next[key]; delete synced[key]; }
            });
            syncedRef.current = synced;
            dataRef.current = next;
            setData(next);
        }
        conflictRef.current = new Set();
        setConflict(null);
    }, []);

    useEffect(() => {
        const onHide = () => { if (document.visibilityState === 'hidden') flush(); };
        document.addEventListener('visibilitychange', onHide);
        return () => document.removeEventListener('visibilitychange', onHide);
    }, [flush]);

    const login = useCallback(async (credentials) => {
        const { user: current } = await api.login(credentials);
        setUser(current);
        await loadForUser();
    }, [loadForUser]);

    // «Entrar como invitado»: sin cuenta propia; solo verá las presentaciones.
    const entrarInvitado = useCallback(async () => {
        const { user: current } = await api.guest();
        setUser(current);
        await loadForUser();
    }, [loadForUser]);

    // El registro deja la cuenta pendiente: se activa con el enlace del correo.
    const register = useCallback((payload) => api.register(payload), []);

    const verify = useCallback(async (token) => {
        const { user: current } = await api.verify(token);
        setUser(current);
        await loadForUser();
    }, [loadForUser]);

    // Enlace «restablecer contraseña» del correo: crea la contraseña nueva y deja la sesión iniciada.
    const resetPassword = useCallback(async (payload) => {
        const { user: current } = await api.reset(payload);
        setUser(current);
        await loadForUser();
    }, [loadForUser]);

    // Vuelve a consultar la cuenta: sirve para saber si el administrador ya autorizó crear proyectos.
    const recheck = useCallback(async () => {
        const { user: current } = await api.me();
        if (!current) return;
        setUser(current);
        await loadForUser();
    }, [loadForUser]);

    const changePassword = useCallback(async (payload) => {
        const { user: current } = await api.changePassword(payload);
        setUser(current);
    }, []);

    const logout = useCallback(async () => {
        await flush();
        await api.logout();
        setUser(null);
        setProjects([]);
        setProject({ id: null, name: readDraftName() });
        replaceData(readDraft());
        setSinCupo(false);
        setSaveState('local');
    }, [flush, replaceData]);

    const createProject = useCallback(async (name) => {
        await flush();
        const { project: created } = await api.createProject({ name, data: {} });
        setProjects((prev) => [{ id: created.id, name: created.name, updatedAt: created.updatedAt }, ...prev]);
        setProject({ id: created.id, name: created.name });
        versionRef.current = created.version || 1;
        replaceData({});
        setSaveState('saved');
        try { window.localStorage.setItem(ACTIVE_KEY, String(created.id)); } catch { /* noop */ }
    }, [flush, replaceData]);

    const renameProject = useCallback(async (name) => {
        const clean = name.trim() || 'Mi proyecto';
        setProject((prev) => ({ ...prev, name: clean }));
        const id = projectRef.current.id;
        if (!id) {
            try { window.localStorage.setItem(NAME_KEY, clean); } catch { /* noop */ }
            return;
        }
        const { project: saved } = await api.updateProject(id, { name: clean });
        versionRef.current = saved.version;
        setProjects((prev) => prev.map((item) => (item.id === id ? { ...item, name: clean } : item)));
    }, []);

    const deleteProject = useCallback(async (id) => {
        await api.deleteProject(id);
        const remaining = projects.filter((item) => item.id !== id);
        setProjects(remaining);
        if (projectRef.current.id !== id) return;
        dirtyRef.current = false;
        if (remaining.length > 0) {
            await openProject(remaining[0].id);
        } else {
            projectRef.current = { id: null, name: 'Mi proyecto' };
            dataRef.current = {};
            try {
                await createProject('Mi proyecto');
            } catch (error) {
                // Sin cupo para crear otro: queda en la pantalla de espera.
                if (!['no_quota', 'quota_full'].includes(error.code)) throw error;
                setProject({ id: null, name: 'Mi proyecto' });
                replaceData({});
                setSinCupo(true);
            }
        }
    }, [projects, openProject, createProject, replaceData]);

    const clearDraft = useCallback(() => setData({}), []);

    const value = useMemo(() => ({
        user, authReady, projects, project, data, saveState, saveError, conflict, others, section, setSection, resolveConflict, sinCupo, recheck,
        setField, login, entrarInvitado, register, verify, resetPassword, changePassword, logout, openProject, createProject, renameProject, deleteProject, clearDraft,
        retrySave: flush,
        flush,
        refreshProjects: async () => { const { projects: list } = await api.listProjects(); setProjects(list); return list; },
        hasContent: hasContent(data),
    }), [user, authReady, projects, project, data, saveState, saveError, conflict, others, section, setSection, resolveConflict, sinCupo, recheck, setField, login, entrarInvitado, register, verify, resetPassword, changePassword, logout, openProject, createProject, renameProject, deleteProject, clearDraft, flush]);

    return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProject = () => {
    const context = useContext(ProjectContext);
    if (!context) throw new Error('useProject debe usarse dentro de <ProjectProvider>');
    return context;
};

// Igual que useState, pero el valor pertenece al proyecto activo y se guarda solo.
export const useProjectField = (key, initialValue) => {
    const { data, setField } = useProject();
    const value = data[key] === undefined ? initialValue : data[key];
    const initialRef = useRef(initialValue);
    const setValue = useCallback((next) => {
        setField(key, typeof next === 'function'
            ? (prev) => next(prev === undefined ? initialRef.current : prev)
            : next);
    }, [key, setField]);
    return [value, setValue];
};
