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
    const [saveState, setSaveState] = useState('local'); // local | saved | saving | error
    const [saveError, setSaveError] = useState('');

    const dataRef = useRef(data);
    const projectRef = useRef(project);
    const timerRef = useRef(null);
    const dirtyRef = useRef(false);
    const loadedRef = useRef(data); // último contenido cargado (no editado): no dispara guardado
    dataRef.current = data;
    projectRef.current = project;

    const flush = useCallback(async () => {
        window.clearTimeout(timerRef.current);
        const id = projectRef.current.id;
        if (!id || !dirtyRef.current) return;
        dirtyRef.current = false;
        setSaveState('saving');
        try {
            await api.updateProject(id, { data: dataRef.current });
            if (!dirtyRef.current) setSaveState('saved');
            setSaveError('');
        } catch (error) {
            dirtyRef.current = true;
            setSaveState('error');
            setSaveError(error.message);
        }
    }, []);

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
        dataRef.current = next;
        setData(next);
    }, []);

    const openProject = useCallback(async (id) => {
        await flush();
        const { project: loaded } = await api.getProject(id);
        setProject({ id: loaded.id, name: loaded.name });
        replaceData(loaded.data || {});
        setSaveState('saved');
        try { window.localStorage.setItem(ACTIVE_KEY, String(loaded.id)); } catch { /* noop */ }
        return loaded.data || {};
    }, [flush, replaceData]);

    // Al iniciar sesión: abre el último proyecto o sube el borrador local como primer proyecto.
    const loadForUser = useCallback(async () => {
        const localDraft = readDraft();
        const { projects: list } = await api.listProjects();
        if (list.length === 0) {
            const draft = hasContent(dataRef.current) ? dataRef.current : localDraft;
            const { project: created } = await api.createProject({ name: readDraftName(), data: draft });
            setProjects([{ id: created.id, name: created.name, updatedAt: created.updatedAt }]);
            loadedRef.current = draft;
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

    // El registro deja la cuenta pendiente: se activa con el enlace del correo.
    const register = useCallback((payload) => api.register(payload), []);

    const verify = useCallback(async (token) => {
        const { user: current } = await api.verify(token);
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
        setSaveState('local');
    }, [flush, replaceData]);

    const createProject = useCallback(async (name) => {
        await flush();
        const { project: created } = await api.createProject({ name, data: {} });
        setProjects((prev) => [{ id: created.id, name: created.name, updatedAt: created.updatedAt }, ...prev]);
        setProject({ id: created.id, name: created.name });
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
        await api.updateProject(id, { name: clean });
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
            await createProject('Mi proyecto');
        }
    }, [projects, openProject, createProject]);

    const clearDraft = useCallback(() => setData({}), []);

    const value = useMemo(() => ({
        user, authReady, projects, project, data, saveState, saveError,
        setField, login, register, verify, changePassword, logout, openProject, createProject, renameProject, deleteProject, clearDraft,
        retrySave: flush,
        hasContent: hasContent(data),
    }), [user, authReady, projects, project, data, saveState, saveError, setField, login, register, verify, changePassword, logout, openProject, createProject, renameProject, deleteProject, clearDraft, flush]);

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
