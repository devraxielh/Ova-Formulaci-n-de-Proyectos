import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowUp, Ban, CheckCircle2, ChevronLeft, ChevronRight, Download, FileText, KeyRound, Mail, Pencil, RefreshCw, Search, UserCheck, ArrowRightLeft, Copy, RotateCcw, Trash2, UserPlus, Users, X } from 'lucide-react';
import { api } from '../services/api';
import { buildDocument } from '../services/projectDoc';
import { DocumentPaper } from './ProjectDocument';
import Coherencia from './Coherencia';
import AdminEstado from './AdminEstado';
import { CuotaIA, GruposProfesor, ServiciosExternos } from './AdminServicios';
import { CrearCuentas, Credenciales, ROLES, csv, descargar, nombreRol } from './Cuentas';
import Selector from './Selector';
import { avisar, confirmar } from './Avisos';
import './Proyecto.css';
import './Cuentas.css';
import './Admin.css';

/*
 * Administración. Seis pestañas:
 *  - Usuarios: buscar, filtrar, ordenar, crear cuentas, cambiar varias a la vez y abrir la ficha de cada una.
 *  - Proyectos: todos los proyectos de la plataforma con su dueño, avance y coherencia.
 *  - Grupos: resumen por grupo y por profesor, profesor a cargo y cuota de IA de cada grupo.
 *  - Papelera: cuentas eliminadas en los últimos 30 días.
 *  - Uso: cuota de IA y actividad por día, por grupo y por cuenta.
 *  - Sistema: servicios externos, copias de seguridad, errores y registro de cambios.
 */

const TAMANOS = [25, 50, 100, 200];
const SIN_GRUPO = '—'; // valor del filtro «Sin grupo»

// Lo que el administrador dejó puesto (pestaña, filtros, filas por página) se recuerda mientras dure la sesión del
// navegador: al volver a Administración encuentra la lista como la dejó.
const RECUERDO = 'projectsia-admin';
const recordado = (() => { try { return JSON.parse(sessionStorage.getItem(RECUERDO)) || {}; } catch { return {}; } })();
const useRecordado = (clave, inicial) => {
    const [valor, setValor] = useState(() => (recordado[clave] !== undefined ? recordado[clave] : inicial));
    useEffect(() => {
        recordado[clave] = valor;
        try { sessionStorage.setItem(RECUERDO, JSON.stringify(recordado)); } catch { /* sin almacenamiento: no se recuerda */ }
    }, [clave, valor]);
    return [valor, setValor];
};
const TRAMOS = [
    { id: 'cero', nombre: 'Sin empezar', sirve: (a) => a === 0 },
    { id: 'inicio', nombre: 'Empezando (1–33 %)', sirve: (a) => a > 0 && a <= 33 },
    { id: 'medio', nombre: 'En curso (34–66 %)', sirve: (a) => a > 33 && a <= 66 },
    { id: 'alto', nombre: 'Avanzado (67–99 %)', sirve: (a) => a > 66 && a < 100 },
    { id: 'listo', nombre: 'Completo', sirve: (a) => a >= 100 },
];
const STATUS = { active: 'Activo', pending: 'Pendiente', blocked: 'Bloqueado' };
const ROLES_FILTRO = [{ id: 'admin', nombre: 'Administrador' }, ...ROLES];

// SQLite guarda fechas UTC como "AAAA-MM-DD HH:MM:SS".
const aFecha = (value) => {
    if (!value) return null;
    const date = new Date(`${String(value).replace(' ', 'T')}Z`);
    return Number.isNaN(date.getTime()) ? null : date;
};
const formatDate = (value) => {
    const date = aFecha(value);
    return date ? date.toLocaleString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
};
// «hace 3 días»: en una lista se lee más rápido que la fecha completa (que queda en el título).
const haceCuanto = (value) => {
    const date = aFecha(value);
    if (!date) return 'Nunca';
    const min = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
    if (min < 2) return 'Ahora';
    if (min < 60) return `Hace ${min} min`;
    const h = Math.round(min / 60);
    if (h < 24) return `Hace ${h} h`;
    const d = Math.round(h / 24);
    if (d < 31) return d === 1 ? 'Ayer' : `Hace ${d} días`;
    const m = Math.round(d / 30);
    return m < 12 ? `Hace ${m} ${m === 1 ? 'mes' : 'meses'}` : date.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' });
};
const fechaCorta = (dia) => new Date(`${dia}T12:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
const suma = (serie, campo) => serie.reduce((t, d) => t + (d[campo] || 0), 0);
const sinTildes = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const StatusBadge = ({ status }) => <span className="adm-badge" data-status={status}>{STATUS[status] || status}</span>;
const RolBadge = ({ role }) => <span className="adm-rolb" data-rol={role}>{nombreRol(role)}</span>;
const CoherenciaBadge = ({ value }) => (value
    ? <span className="adm-coh" data-nivel={value.nivel} title={`Coherencia ${value.nivel}: ${value.evaluados} relaciones evaluadas`}>{value.score} %</span>
    : <span className="adm-coh" data-nivel="pendiente" title="Faltan secciones para evaluarla">—</span>);
const Avance = ({ value }) => (
    <span className="adm-avance" title={`${value || 0} % de avance`}>
        <span className="adm-avance-barra"><span style={{ width: `${value || 0}%` }} /></span>
        <b>{value || 0} %</b>
    </span>
);

// Cuántos proyectos puede crear la cuenta. 0 = todavía sin permiso.
const Cupo = ({ user, onChange, busy }) => {
    if (user.role === 'admin') return <span className="adm-muted">—</span>;
    if (user.role === 'guest') return <span className="adm-muted" title="Un invitado solo ve las presentaciones">No crea</span>;
    const limit = user.projectLimit || 0;
    return (
        <span className="adm-cupo" data-cero={limit === 0}>
            <button type="button" disabled={busy || limit <= 0} onClick={() => onChange(user, limit - 1)} aria-label={`Permitir un proyecto menos a ${user.name}`}>−</button>
            <b title={limit === 0 ? 'Sin permiso para crear proyectos' : `Puede crear hasta ${limit}`}>{limit}</b>
            <button type="button" disabled={busy || limit >= 20} onClick={() => onChange(user, limit + 1)} aria-label={`Autorizar un proyecto más a ${user.name}`}>+</button>
        </span>
    );
};

const StatusActions = ({ user, onChange, onResend, busy }) => {
    if (user.role === 'admin') return null;
    const bloquear = async () => {
        if (await confirmar({ texto: `¿Bloquear a ${user.name}?`, detalle: 'No podrá entrar hasta que la desbloquees. Sus proyectos se conservan.', aceptar: 'Bloquear', peligro: true })) onChange(user, 'blocked');
    };
    return (
        <>
            {user.status === 'pending' && (
                <>
                    <button type="button" className="pro-btn pro-btn--ghost adm-sm" disabled={busy} onClick={() => onChange(user, 'active')}><UserCheck size={15} /> Activar</button>
                    <button type="button" className="pro-btn pro-btn--ghost adm-sm" disabled={busy} onClick={() => onResend(user)} title="Reenviar el correo de activación"><Mail size={15} /> Reenviar enlace</button>
                </>
            )}
            {user.status === 'blocked'
                ? <button type="button" className="pro-btn pro-btn--ghost adm-sm" disabled={busy} onClick={() => onChange(user, 'active')}><CheckCircle2 size={15} /> Desbloquear</button>
                : <button type="button" className="pro-btn pro-btn--ghost adm-sm adm-danger" disabled={busy} onClick={bloquear}><Ban size={15} /> Bloquear</button>}
        </>
    );
};

// Encabezado de columna que ordena al presionarlo.
const Th = ({ id, orden, onOrden, children, num }) => {
    const activo = orden.por === id;
    return (
        <th scope="col" className={num ? 'adm-num' : undefined} aria-sort={activo ? (orden.asc ? 'ascending' : 'descending') : 'none'}>
            <button type="button" className="adm-th" data-activo={activo || undefined} onClick={() => onOrden(id)}>
                {children}
                {activo ? (orden.asc ? <ArrowUp size={13} aria-hidden="true" /> : <ArrowDown size={13} aria-hidden="true" />) : <ArrowDown size={13} className="adm-th-fantasma" aria-hidden="true" />}
            </button>
        </th>
    );
};

const Paginas = ({ total, pagina, onPagina, que, porPagina, onPorPagina }) => {
    if (total === 0) return null;
    const paginas = Math.ceil(total / porPagina);
    const desde = (pagina - 1) * porPagina + 1;
    const hasta = Math.min(total, pagina * porPagina);
    return (
        <div className="adm-paginas">
            <span>{desde}–{hasta} de {total} {que}</span>
            <span className="adm-paginas-botones">
                {total > TAMANOS[0] && (
                    <label className="adm-por-pagina">Filas
                        <select value={porPagina} onChange={(e) => onPorPagina(Number(e.target.value))}>{TAMANOS.map((n) => <option key={n} value={n}>{n}</option>)}</select>
                    </label>
                )}
                {paginas > 1 && (
                    <>
                        <button type="button" className="pro-btn pro-btn--ghost adm-sm" disabled={pagina <= 1} onClick={() => onPagina(pagina - 1)}><ChevronLeft size={15} /> Anterior</button>
                        <span>Página {pagina} de {paginas}</span>
                        <button type="button" className="pro-btn pro-btn--ghost adm-sm" disabled={pagina >= paginas} onClick={() => onPagina(pagina + 1)}>Siguiente <ChevronRight size={15} /></button>
                    </>
                )}
            </span>
        </div>
    );
};

const Esqueleto = ({ columnas }) => Array.from({ length: 6 }, (_, i) => (
    <tr key={i} className="adm-esqueleto" aria-hidden="true">
        {Array.from({ length: columnas }, (__, j) => <td key={j}><span style={{ width: `${j === 1 ? 70 : 40 + ((i + j) % 3) * 15}%` }} /></td>)}
    </tr>
));

const Admin = () => {
    const [vista, setVista] = useRecordado('vista', 'usuarios');
    const [fallo, setFallo] = useState(''); // no se pudo cargar la lista de usuarios
    const [papelera, setPapelera] = useState([]); // cuentas eliminadas que aún se pueden restaurar
    const [historial, setHistorial] = useState(null); // cambios hechos a la cuenta de la ficha abierta
    const [bQuery, setBQuery] = useState(''); // búsqueda en el registro de cambios
    const [mover, setMover] = useState(null); // { modo: 'traspasar' | 'duplicar', userId, keep, name } en la vista de un proyecto
    const [uso, setUso] = useState(null); // datos de la pestaña Uso
    const [usoDias, setUsoDias] = useRecordado('usoDias', 30);
    const [barra, setBarra] = useState(null); // día señalado en la gráfica de uso
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState(null); // null = todavía no se han pedido
    const [mailReady, setMailReady] = useState(true);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    // Los resultados y los errores salen como avisos emergentes.
    const setError = (texto) => avisar(texto, 'error');
    const setNotice = (texto) => avisar(texto);

    // Lista de usuarios: filtros, orden, página y selección.
    const [query, setQuery] = useRecordado('query', '');
    const [fRol, setFRol] = useRecordado('fRol', '');
    const [fEstado, setFEstado] = useRecordado('fEstado', '');
    const [fProfesor, setFProfesor] = useRecordado('fProfesor', ''); // id del profesor o 'ninguno'
    const [fAtencion, setFAtencion] = useState(''); // 'sinProfesor' | 'sinPermiso' | 'sinEstrenar'
    const [orden, setOrden] = useState({ por: 'registro', asc: false });
    const [pagina, setPagina] = useState(1);
    const [marcados, setMarcados] = useState(() => new Set());
    const [creando, setCreando] = useState(false);
    const [fGrupo, setFGrupo] = useRecordado('fGrupo', ''); // nombre del grupo o SIN_GRUPO
    const [fActividad, setFActividad] = useRecordado('fActividad', ''); // 'semana' | 'mes' | 'nunca'
    const [porPagina, setPorPagina] = useRecordado('porPagina', TAMANOS[0]);
    const [grupoNuevo, setGrupoNuevo] = useState(null); // texto mientras se escribe un grupo nuevo para la selección
    const [bitacora, setBitacora] = useState(null); // registro de cambios (pestaña Sistema)
    const [grupoEditado, setGrupoEditado] = useState(null); // { de, a } mientras se cambia el nombre de un grupo

    // Lista de proyectos.
    const [pQuery, setPQuery] = useRecordado('pQuery', '');
    const [pGrupo, setPGrupo] = useRecordado('pGrupo', '');
    const [pProfesor, setPProfesor] = useRecordado('pProfesor', '');
    const [pTramo, setPTramo] = useRecordado('pTramo', '');
    const [pOrden, setPOrden] = useState({ por: 'actualizado', asc: false });
    const [pPagina, setPPagina] = useState(1);

    const [selected, setSelected] = useState(null); // { user, projects }
    const [openProject, setOpenProject] = useState(null); // { project, owner }
    const [acceso, setAcceso] = useState(null); // contraseña temporal recién generada
    const [edicion, setEdicion] = useState(null); // { name, email } mientras se corrigen los datos de la ficha

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const result = await api.admin.users();
            setUsers(result.users);
            setMailReady(result.mail);
            setFallo('');
            api.admin.trash().then((r) => setPapelera(r.trash)).catch(() => { /* la papelera se reintenta al abrir su pestaña */ });
        } catch (err) {
            setFallo(err.message || 'No se pudo cargar la lista.');
        } finally {
            setLoading(false);
        }
    }, []);
    const loadProjects = useCallback(async () => {
        try { setProjects((await api.admin.projects()).projects); } catch (err) { setError(err.message); }
    }, []);

    useEffect(() => { load(); }, [load]);
    useEffect(() => { if (vista === 'proyectos' && projects === null) loadProjects(); }, [vista, projects, loadProjects]);
    useEffect(() => {
        if (vista !== 'sistema') return;
        const espera = setTimeout(() => { api.admin.log(bQuery.trim()).then((r) => setBitacora(r.log)).catch((err) => avisar(err.message, 'error')); }, bQuery ? 300 : 0);
        return () => clearTimeout(espera);
    }, [vista, bQuery]);
    useEffect(() => { if (vista === 'uso') { setUso(null); api.admin.usage(usoDias).then(setUso).catch((err) => avisar(err.message, 'error')); } }, [vista, usoDias]);
    useEffect(() => { if (vista === 'papelera') api.admin.trash().then((r) => setPapelera(r.trash)).catch((err) => avisar(err.message, 'error')); }, [vista]);
    // Ficha abierta: lo que se le ha hecho a esa cuenta, según el registro de cambios.
    const correoFicha = selected?.user?.email || '';
    useEffect(() => {
        setHistorial(null);
        if (!correoFicha) return;
        api.admin.log(correoFicha).then((r) => setHistorial(r.log)).catch(() => setHistorial([]));
    }, [correoFicha, selected?.user?.name, selected?.user?.status, selected?.user?.role, selected?.user?.projectLimit, selected?.user?.grupo]);

    const profesores = useMemo(() => users.filter((u) => u.role === 'teacher'), [users]);
    const opcionesProfesor = useMemo(() => [{ value: '', label: 'Sin profesor' }, ...profesores.map((p) => ({ value: p.id, label: p.name, nota: p.email }))], [profesores]);
    const estudiantesDe = useMemo(() => {
        const mapa = new Map();
        users.forEach((u) => { if (u.teacherId) mapa.set(u.teacherId, (mapa.get(u.teacherId) || 0) + 1); });
        return mapa;
    }, [users]);
    const atencion = {
        sinProfesor: (u) => u.role === 'student' && !u.teacherId,
        sinPermiso: (u) => u.role === 'student' && u.status === 'active' && !u.projectLimit && !u.projectCount,
        sinEstrenar: (u) => u.role !== 'admin' && u.mustChangePassword,
    };
    const grupos = useMemo(() => [...new Set(users.map((u) => u.grupo).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es', { numeric: true })), [users]);
    const diasSin = (u) => { const f = aFecha(u.lastActivity || u.lastLoginAt); return f ? (Date.now() - f.getTime()) / 86400000 : Infinity; };
    const porActividad = { semana: (u) => diasSin(u) <= 7, mes: (u) => diasSin(u) > 30 && diasSin(u) !== Infinity, nunca: (u) => diasSin(u) === Infinity };
    const resumen = useMemo(() => ({
        total: users.length,
        teacher: users.filter((u) => u.role === 'teacher').length,
        student: users.filter((u) => u.role === 'student').length,
        researcher: users.filter((u) => u.role === 'researcher').length,
        proyectos: users.reduce((n, u) => n + (u.projectCount || 0), 0),
        sinProfesor: users.filter(atencion.sinProfesor).length,
        sinPermiso: users.filter(atencion.sinPermiso).length,
        sinEstrenar: users.filter(atencion.sinEstrenar).length,
        pendientes: users.filter((u) => u.status === 'pending').length,
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [users]);

    const visible = useMemo(() => {
        const q = sinTildes(query.trim());
        const lista = users.filter((u) => (!fRol || u.role === fRol)
            && (!fEstado || u.status === fEstado)
            && (!fProfesor || (fProfesor === 'ninguno' ? u.role === 'student' && !u.teacherId : String(u.teacherId) === String(fProfesor)))
            && (!fAtencion || atencion[fAtencion](u))
            && (!fGrupo || (fGrupo === SIN_GRUPO ? !u.grupo : u.grupo === fGrupo))
            && (!fActividad || porActividad[fActividad](u))
            && (!q || sinTildes(u.name).includes(q) || u.email.toLowerCase().includes(q) || sinTildes(u.teacherName).includes(q) || sinTildes(u.grupo).includes(q)));
        const clave = {
            nombre: (u) => sinTildes(u.name),
            rol: (u) => nombreRol(u.role),
            proyectos: (u) => u.projectCount || 0,
            actividad: (u) => u.lastActivity || u.lastLoginAt || '',
            registro: (u) => u.createdAt || '',
        }[orden.por];
        const sentido = orden.asc ? 1 : -1;
        return [...lista].sort((a, b) => { const x = clave(a); const y = clave(b); return (x < y ? -1 : x > y ? 1 : 0) * sentido || a.id - b.id; });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [users, query, fRol, fEstado, fProfesor, fAtencion, fGrupo, fActividad, orden]);
    useEffect(() => { setPagina(1); }, [query, fRol, fEstado, fProfesor, fAtencion, fGrupo, fActividad, porPagina]);
    const enPagina = visible.slice((pagina - 1) * porPagina, pagina * porPagina);
    const hayFiltros = Boolean(query || fRol || fEstado || fProfesor || fAtencion || fGrupo || fActividad);
    const limpiarFiltros = () => { setQuery(''); setFRol(''); setFEstado(''); setFProfesor(''); setFAtencion(''); setFGrupo(''); setFActividad(''); };
    // Desde la pestaña «Grupos»: abre la lista de usuarios ya filtrada.
    const verUsuarios = (filtros) => { limpiarFiltros(); if (filtros.grupo !== undefined) setFGrupo(filtros.grupo); if (filtros.profesor !== undefined) setFProfesor(filtros.profesor); if (filtros.rol) setFRol(filtros.rol); setMarcados(new Set()); setVista('usuarios'); };
    const ordenar = (por) => setOrden((prev) => (prev.por === por ? { por, asc: !prev.asc } : { por, asc: por === 'nombre' || por === 'rol' }));

    const proyectosVisibles = useMemo(() => {
        const q = sinTildes(pQuery.trim());
        const tramo = TRAMOS.find((t) => t.id === pTramo);
        const lista = (projects || []).filter((p) => (!pGrupo || (pGrupo === SIN_GRUPO ? !p.ownerGrupo : p.ownerGrupo === pGrupo))
            && (!pProfesor || String(p.ownerTeacherId) === String(pProfesor))
            && (!tramo || tramo.sirve(p.avance || 0))).filter((p) => !q || sinTildes(p.titulo).includes(q) || sinTildes(p.name).includes(q) || sinTildes(p.owner).includes(q) || p.ownerEmail.toLowerCase().includes(q));
        const clave = {
            proyecto: (p) => sinTildes(p.titulo || p.name),
            dueno: (p) => sinTildes(p.owner),
            avance: (p) => p.avance || 0,
            coherencia: (p) => (p.coherencia ? p.coherencia.score : -1),
            actualizado: (p) => p.updatedAt || '',
        }[pOrden.por];
        const sentido = pOrden.asc ? 1 : -1;
        return [...lista].sort((a, b) => { const x = clave(a); const y = clave(b); return (x < y ? -1 : x > y ? 1 : 0) * sentido || a.id - b.id; });
    }, [projects, pQuery, pOrden, pGrupo, pProfesor, pTramo]);
    useEffect(() => { setPPagina(1); }, [pQuery, porPagina, pGrupo, pProfesor, pTramo]);
    const hayFiltrosP = Boolean(pQuery || pGrupo || pProfesor || pTramo);
    const reparto = TRAMOS.map((t) => ({ ...t, n: (projects || []).filter((p) => t.sirve(p.avance || 0)).length }));
    const ordenarP = (por) => setPOrden((prev) => (prev.por === por ? { por, asc: !prev.asc } : { por, asc: por === 'proyecto' || por === 'dueno' }));

    const replaceUser = (updated) => {
        // La lista trae además la coherencia del último proyecto; las respuestas de una acción no, así que se conserva.
        setUsers((prev) => prev.map((user) => (user.id === updated.id ? { coherencia: user.coherencia, ...updated } : user)));
        setSelected((prev) => (prev && prev.user.id === updated.id ? { ...prev, user: updated } : prev));
    };
    const accion = async (fn) => {
        setBusy(true);
        try { await fn(); } catch (err) { setError(err.message); } finally { setBusy(false); }
    };

    const changeLimit = (user, limit) => accion(async () => {
        const { user: updated } = await api.admin.setLimit(user.id, limit);
        replaceUser(updated);
        setNotice(limit === 0 ? `${updated.name} ya no puede crear proyectos nuevos.` : `${updated.name} puede crear hasta ${limit} ${limit === 1 ? 'proyecto' : 'proyectos'}.`);
    });
    const changeStatus = (user, status) => accion(async () => {
        const { user: updated } = await api.admin.setStatus(user.id, status);
        replaceUser(updated);
        setNotice(`Se ${status === 'blocked' ? 'bloqueó' : user.status === 'pending' ? 'activó' : 'desbloqueó'} la cuenta de ${updated.name}.`);
    });
    const changeRole = async (user, role, teacherId) => {
        if (role !== user.role && !(await confirmar({ texto: `¿Cambiar el rol de ${user.name} a ${nombreRol(role)}?`, detalle: ROLES.find((r) => r.id === role)?.nota, aceptar: 'Cambiar rol' }))) return undefined;
        return accion(async () => {
            const { user: updated } = await api.admin.setRole(user.id, role, teacherId);
            replaceUser(updated);
            if (role !== user.role) load();
            setNotice(role !== user.role ? `${updated.name} ahora es ${nombreRol(role).toLowerCase()}.` : `${updated.name} quedó ${updated.teacherName ? `a cargo de ${updated.teacherName}` : 'sin profesor a cargo'}.`);
        });
    };
    const newAccess = async (user) => {
        if (!(await confirmar({ texto: `¿Dar una contraseña nueva a ${user.name}?`, detalle: 'La anterior deja de servir y se cierran sus sesiones.', aceptar: 'Dar contraseña nueva' }))) return undefined;
        return accion(async () => {
            const r = await api.admin.newAccess(user.id);
            setAcceso({ cuentas: [{ name: user.name, email: user.email, clave: r.clave, emailSent: r.emailSent }], mail: r.emailSent });
        });
    };
    const guardarDatos = (event, user) => {
        event.preventDefault();
        return accion(async () => {
            const { user: updated } = await api.admin.updateUser(user.id, edicion);
            replaceUser(updated);
            setEdicion(null);
            setNotice(updated.email !== user.email ? `Datos guardados. ${updated.name} ahora entra con ${updated.email}; se cerraron sus sesiones.` : `Datos de ${updated.name} guardados.`);
        });
    };
    const eliminar = async (user) => {
        const n = user.projectCount || 0;
        const alumnos = users.filter((u) => u.teacherId === user.id).length;
        const detalle = [
            n ? `Se ${n === 1 ? 'borra su proyecto' : `borran sus ${n} proyectos`}, con versiones, figuras y encuestas. Antes se guarda una copia de seguridad.` : 'No tiene proyectos.',
            alumnos ? (alumnos === 1 ? 'Su estudiante queda sin profesor a cargo.' : `Sus ${alumnos} estudiantes quedan sin profesor a cargo.`) : '',
            'Queda 30 días en la papelera, desde donde se puede restaurar.',
        ].filter(Boolean).join(' ');
        if (!(await confirmar({ texto: `¿Eliminar la cuenta de ${user.name}?`, detalle, aceptar: 'Eliminar', peligro: true }))) return undefined;
        return accion(async () => {
            await api.admin.deleteUser(user.id);
            setSelected(null);
            setAcceso(null);
            setEdicion(null);
            setProjects(null);
            await load();
            setNotice(`Se eliminó la cuenta de ${user.name}. Está en la papelera durante 30 días.`);
        });
    };
    // Grupos: cambiar el nombre (si ya existe otro con ese nombre, se unen) o quitar el grupo sin tocar las cuentas.
    const renombrarGrupo = async (event) => {
        event.preventDefault();
        const de = grupoEditado.de;
        const a = grupoEditado.a.trim().replace(/\s+/g, ' ');
        if (!a || a === de) { setGrupoEditado(null); return undefined; }
        const existe = grupos.includes(a);
        if (existe && !(await confirmar({ texto: `Ya existe el grupo «${a}». ¿Unirlos?`, detalle: `Las cuentas de «${de}» pasan a «${a}» y «${de}» desaparece.`, aceptar: 'Unir grupos' }))) return undefined;
        return accion(async () => {
            const r = await api.admin.renameGroup(de, a);
            setGrupoEditado(null);
            if (fGrupo === de) setFGrupo(a);
            await load();
            setNotice(r.unido ? `«${de}» se unió a «${a}»: ${r.cuentas} ${r.cuentas === 1 ? 'cuenta pasó' : 'cuentas pasaron'}.` : `El grupo ahora se llama «${a}» (${r.cuentas} ${r.cuentas === 1 ? 'cuenta' : 'cuentas'}).`);
        });
    };
    const quitarGrupo = async (g) => {
        if (!(await confirmar({ texto: `¿Borrar el grupo «${g.nombre}»?`, detalle: `Sus ${g.n} ${g.n === 1 ? 'cuenta queda' : 'cuentas quedan'} sin grupo. No se borra ninguna cuenta ni proyecto.`, aceptar: 'Borrar grupo', peligro: true }))) return undefined;
        return accion(async () => {
            const r = await api.admin.renameGroup(g.clave, '');
            if (fGrupo === g.clave) setFGrupo('');
            await load();
            setNotice(`Se borró el grupo «${g.nombre}»; ${r.cuentas} ${r.cuentas === 1 ? 'cuenta quedó' : 'cuentas quedaron'} sin grupo.`);
        });
    };
    // Papelera: restaurar o borrar del todo.
    const restaurar = (c) => accion(async () => {
        const { user: vuelto } = await api.admin.restore(c.id);
        setPapelera((prev) => prev.filter((x) => x.id !== c.id));
        setProjects(null);
        await load();
        setNotice(`Se restauró la cuenta de ${vuelto.name}${c.projects ? `, con ${c.projects === 1 ? 'su proyecto' : `sus ${c.projects} proyectos`}` : ''}. Entra con el mismo correo y contraseña.`);
    });
    const borrarDeltodo = async (c) => {
        if (!(await confirmar({ texto: c ? `¿Borrar definitivamente a ${c.name}?` : `¿Vaciar la papelera (${papelera.length})?`, detalle: 'Ya no se podrá restaurar desde aquí. Solo quedaría la copia de seguridad del servidor.', aceptar: c ? 'Borrar definitivamente' : 'Vaciar papelera', peligro: true }))) return undefined;
        return accion(async () => {
            await api.admin.purge(c?.id);
            setPapelera((prev) => (c ? prev.filter((x) => x.id !== c.id) : []));
            setNotice(c ? `Se borró definitivamente la cuenta de ${c.name}.` : 'La papelera quedó vacía.');
        });
    };
    // Proyectos: cambiar de dueño o duplicar como plantilla.
    const aplicarMover = (event) => {
        event.preventDefault();
        const pr = openProject.project;
        const destino = users.find((u) => String(u.id) === String(mover.userId));
        if (!destino) return undefined;
        return accion(async () => {
            if (mover.modo === 'traspasar') {
                await api.admin.transferProject(pr.id, destino.id, mover.keep);
                setNotice(`«${pr.name}» ahora es de ${destino.name}.${mover.keep ? ` ${openProject.owner?.name || 'El dueño anterior'} queda como invitado.` : ''}`);
                setOpenProject(await api.admin.project(pr.id));
            } else {
                const r = await api.admin.duplicateProject(pr.id, destino.id, mover.name.trim());
                setNotice(`Se creó «${r.project.name}» en la cuenta de ${destino.name}, con el contenido y las figuras.`);
            }
            setMover(null);
            setProjects(null);
            load();
        });
    };
    const exportarRegistro = () => descargar('registro-projectsia.csv', csv([['Cuándo', 'Quién', 'Qué hizo', 'Detalle'], ...(bitacora || []).map((b) => [new Date(b.createdAt).toLocaleString('es-CO'), b.actor, b.action, b.detail])]));
    const resend = (user) => accion(async () => {
        await api.admin.resend(user.id);
        setNotice(`Se envió un enlace de activación nuevo a ${user.email}.`);
    });

    // Cambios a muchas cuentas a la vez: una sola llamada al servidor, que responde cuántas cambió.
    const elegidos = users.filter((u) => marcados.has(u.id) && u.role !== 'admin');
    const cuantas = `${elegidos.length} ${elegidos.length === 1 ? 'cuenta' : 'cuentas'}`;
    const enLote = async ({ action, value, hecho, pregunta }) => {
        if (pregunta && !(await confirmar(pregunta))) return undefined;
        return accion(async () => {
            const r = await api.admin.bulk(elegidos.map((u) => u.id), action, value);
            if (action === 'delete') setProjects(null);
            if (r.cuentas) setAcceso({ cuentas: r.cuentas, mail: r.mail });
            await load();
            setMarcados(new Set());
            setGrupoNuevo(null);
            setNotice(r.hechas ? `${hecho}: ${r.hechas} ${r.hechas === 1 ? 'cuenta' : 'cuentas'}.${r.omitidas ? (r.omitidas === 1 ? ' A la otra no le aplicaba.' : ` A las otras ${r.omitidas} no les aplicaba.`) : ''}` : 'A ninguna de las cuentas seleccionadas le aplicaba ese cambio.');
        });
    };
    const loteProfesor = (v) => {
        const prof = profesores.find((p) => String(p.id) === String(v));
        return enLote({ action: 'teacher', value: prof ? prof.id : '', hecho: prof ? `A cargo de ${prof.name}` : 'Sin profesor a cargo', pregunta: { texto: prof ? `¿Poner ${cuantas} a cargo de ${prof.name}?` : `¿Quitar el profesor a ${cuantas}?`, detalle: 'Solo aplica a las que son de estudiantes.', aceptar: prof ? 'Asignar' : 'Quitar' } });
    };
    const loteGrupo = (grupo) => enLote({ action: 'group', value: grupo, hecho: grupo ? `En el grupo «${grupo}»` : 'Sin grupo', pregunta: { texto: grupo ? `¿Poner ${cuantas} en el grupo «${grupo}»?` : `¿Sacar ${cuantas} de su grupo?`, aceptar: grupo ? 'Poner en el grupo' : 'Sacar' } });
    const ACCIONES = [
        { value: 'permitir', label: 'Permitir un proyecto', nota: 'Cupo en 1', run: () => enLote({ action: 'limit', value: 1, hecho: 'Con permiso para un proyecto', pregunta: { texto: `¿Permitir un proyecto a ${cuantas}?`, detalle: 'El cupo de cada una queda en 1. Lo que ya crearon se conserva.', aceptar: 'Permitir' } }) },
        { value: 'quitar', label: 'Quitar el permiso de crear', nota: 'Cupo en 0', run: () => enLote({ action: 'limit', value: 0, hecho: 'Sin permiso para crear', pregunta: { texto: `¿Quitar el permiso de crear proyectos a ${cuantas}?`, detalle: 'Conservan los proyectos que ya tienen.', aceptar: 'Quitar permiso' } }) },
        ...ROLES.map((r) => ({ value: `rol-${r.id}`, label: `Cambiar el rol a ${r.nombre.toLowerCase()}`, run: () => enLote({ action: 'role', value: r.id, hecho: `Ahora con rol de ${r.nombre.toLowerCase()}`, pregunta: { texto: `¿Cambiar el rol de ${cuantas} a ${r.nombre.toLowerCase()}?`, detalle: r.nota, aceptar: 'Cambiar rol' } }) })),
        { value: 'claves', label: 'Dar contraseñas nuevas', nota: 'Se muestran una sola vez', run: () => enLote({ action: 'access', hecho: 'Con contraseña nueva', pregunta: { texto: `¿Dar una contraseña nueva a ${cuantas}?`, detalle: 'Las anteriores dejan de servir y se cierran sus sesiones. Verás la lista para descargarla.', aceptar: 'Dar contraseñas' } }) },
        { value: 'activar', label: 'Activar o desbloquear', run: () => enLote({ action: 'status', value: 'active', hecho: 'Activadas' }) },
        { value: 'bloquear', label: 'Bloquear', run: () => enLote({ action: 'status', value: 'blocked', hecho: 'Bloqueadas', pregunta: { texto: `¿Bloquear ${cuantas}?`, detalle: 'No podrán entrar hasta que las desbloquees.', aceptar: 'Bloquear', peligro: true } }) },
        { value: 'eliminar', label: 'Eliminar', nota: 'Con sus proyectos', run: () => { const n = elegidos.reduce((t, u) => t + (u.projectCount || 0), 0); return enLote({ action: 'delete', hecho: 'Eliminadas', pregunta: { texto: `¿Eliminar ${cuantas}?`, detalle: `${n ? `Se borran también sus ${n} ${n === 1 ? 'proyecto' : 'proyectos'}; antes se guarda una copia de seguridad.` : 'Ninguna tiene proyectos.'} Quedan 30 días en la papelera, desde donde se pueden restaurar.`, aceptar: 'Eliminar', peligro: true } }); } },
    ];
    const marcar = (id) => setMarcados((prev) => { const s = new Set(prev); if (s.has(id)) s.delete(id); else s.add(id); return s; });
    const marcables = enPagina.filter((u) => u.role !== 'admin');
    const todosMarcados = marcables.length > 0 && marcables.every((u) => marcados.has(u.id));
    // Con muchas cuentas: marcar de una vez todas las que cumplen el filtro, no solo las de la página.
    const todasLasVisibles = visible.filter((u) => u.role !== 'admin');
    const marcarTodas = () => setMarcados(new Set(todasLasVisibles.map((u) => u.id)));
    const marcarPagina = () => setMarcados((prev) => { const s = new Set(prev); marcables.forEach((u) => (todosMarcados ? s.delete(u.id) : s.add(u.id))); return s; });

    const exportar = () => descargar('usuarios-projectsia.csv', csv([
        ['Nombre', 'Correo', 'Rol', 'Grupo', 'Profesor a cargo', 'Estado', 'Proyectos', 'Cupo', 'Última actividad', 'Registro'],
        ...visible.map((u) => [u.name, u.email, nombreRol(u.role), u.grupo || '', u.teacherName || '', STATUS[u.status] || u.status, u.projectCount, u.role === 'admin' ? '' : u.projectLimit, formatDate(u.lastActivity || u.lastLoginAt), formatDate(u.createdAt)]),
    ]));
    const exportarProyectos = () => descargar('proyectos-projectsia.csv', csv([
        ['Título', 'Nombre del proyecto', 'Dueño', 'Correo', 'Rol', 'Avance (%)', 'Coherencia (%)', 'Invitados', 'Actualizado'],
        ...proyectosVisibles.map((p) => [p.titulo, p.name, p.owner, p.ownerEmail, nombreRol(p.ownerRole), p.avance, p.coherencia ? p.coherencia.score : '', p.miembros, formatDate(p.updatedAt)]),
    ]));

    const viewUser = async (id) => {
        setAcceso(null);
        setEdicion(null);
        setOpenProject(null);
        try { setSelected(await api.admin.user(id)); } catch (err) { setError(err.message); }
    };
    const viewProject = async (id) => {
        setMover(null);
        try { setOpenProject(await api.admin.project(id)); } catch (err) { setError(err.message); }
    };


    /* ---------- Un proyecto, en solo lectura ---------- */
    if (openProject) {
        const sections = buildDocument(openProject.project.data);
        const pasos = sections.filter((section) => !section.extra);
        const filled = pasos.filter((section) => section.content.length > 0).length;
        return (
            <div className="pro-page">
                <div className="adm-crumbs">
                    <button type="button" className="pro-btn pro-btn--ghost" onClick={() => setOpenProject(null)}>
                        <ArrowLeft size={16} /> {selected ? `Volver a ${selected.user.name}` : 'Volver a los proyectos'}
                    </button>
                </div>
                <Coherencia data={openProject.project.data} compacto titulo="Coherencia del proyecto" />
                <section className="pro-doc">
                    <div className="pro-doc-bar">
                        <div>
                            <h2>{openProject.project.name}</h2>
                            <p className="adm-muted">
                                {openProject.owner?.name} · {openProject.owner?.email} · {filled} de {pasos.length} secciones · Actualizado {formatDate(openProject.project.updatedAt)}
                            </p>
                        </div>
                        <span className="adm-proyecto-acciones">
                            <button type="button" className="pro-btn pro-btn--ghost adm-sm" aria-expanded={mover?.modo === 'traspasar'} onClick={() => setMover(mover?.modo === 'traspasar' ? null : { modo: 'traspasar', userId: '', keep: true, name: '' })}><ArrowRightLeft size={15} /> Traspasar</button>
                            <button type="button" className="pro-btn pro-btn--ghost adm-sm" aria-expanded={mover?.modo === 'duplicar'} onClick={() => setMover(mover?.modo === 'duplicar' ? null : { modo: 'duplicar', userId: openProject.owner?.id || '', keep: false, name: `${openProject.project.name} (copia)` })}><Copy size={15} /> Duplicar</button>
                            <span className="adm-readonly">Solo lectura</span>
                        </span>
                    </div>
                    {mover && (
                        <form className="adm-mover" onSubmit={aplicarMover}>
                            <b>{mover.modo === 'traspasar' ? 'Traspasar el proyecto a otra cuenta' : 'Duplicar el proyecto como plantilla'}</b>
                            <p className="adm-muted">{mover.modo === 'traspasar'
                                ? 'Cambia el dueño. El proyecto es el mismo: conserva su contenido, historial, figuras, encuestas e invitados.'
                                : 'Crea un proyecto nuevo con el mismo contenido y las mismas figuras. No copia el historial, los invitados ni las encuestas con sus respuestas.'}</p>
                            <div className="adm-mover-campos">
                                <div className="cue-campo"><span>{mover.modo === 'traspasar' ? 'Nuevo dueño' : 'Cuenta donde se crea'}</span>
                                    <Selector buscar etiqueta="Cuenta de destino" vacio="Elegir cuenta…" value={mover.userId} onChange={(v) => setMover({ ...mover, userId: v })} opciones={users.filter((u) => u.role !== 'guest').filter((u) => mover.modo === 'duplicar' || u.id !== openProject.owner?.id).map((u) => ({ value: u.id, label: u.name, nota: `${u.email} · ${nombreRol(u.role)}${u.grupo ? ` · ${u.grupo}` : ''}` }))} />
                                </div>
                                {mover.modo === 'duplicar' && <label className="cue-campo"><span>Nombre del proyecto nuevo</span><input className="input-field" maxLength={120} value={mover.name} onChange={(e) => setMover({ ...mover, name: e.target.value })} /></label>}
                                {mover.modo === 'traspasar' && <label className="cue-check"><input type="checkbox" checked={mover.keep} onChange={(e) => setMover({ ...mover, keep: e.target.checked })} /> {openProject.owner?.name || 'El dueño anterior'} sigue pudiendo abrirlo, como invitado</label>}
                            </div>
                            <div className="adm-mover-botones">
                                <button type="submit" className="pro-btn pro-btn--primary adm-sm" disabled={busy || !mover.userId}>{busy ? 'Un momento…' : mover.modo === 'traspasar' ? 'Traspasar' : 'Crear la copia'}</button>
                                <button type="button" className="pro-btn pro-btn--ghost adm-sm" onClick={() => setMover(null)}>Cancelar</button>
                            </div>
                        </form>
                    )}
                    {filled === 0
                        ? <p className="adm-muted">Este proyecto todavía está vacío.</p>
                        : <DocumentPaper sections={sections} fallbackTitle={openProject.project.name} author={String(openProject.project.data?.integrantes || '').trim() || openProject.owner?.name} fileUrl={(fid) => `/api/projects/${openProject.project.id}/files/${fid}`} />}
                </section>
            </div>
        );
    }

    /* ---------- Ficha de un usuario ---------- */
    if (selected) {
        const { user, projects: suyos } = selected;
        const esAdmin = user.role === 'admin' || Boolean(user.comun); // tampoco se modifica la cuenta compartida de invitados
        const susEstudiantes = user.role === 'teacher' ? users.filter((u) => u.teacherId === user.id) : [];
        return (
            <div className="pro-page">
                <div className="adm-crumbs">
                    <button type="button" className="pro-btn pro-btn--ghost" onClick={() => { setSelected(null); setAcceso(null); setEdicion(null); load(); }}>
                        <ArrowLeft size={16} /> Todos los usuarios
                    </button>
                </div>
                <section className="pro-card adm-ficha">
                    <header className="adm-ficha-cabeza">
                        {edicion ? (
                            <form className="adm-editar" onSubmit={(e) => guardarDatos(e, user)}>
                                <label><span>Nombre completo</span><input className="input-field" required maxLength={80} value={edicion.name} onChange={(e) => setEdicion({ ...edicion, name: e.target.value })} autoFocus /></label>
                                <label><span>Correo (su usuario)</span><input className="input-field" type="email" required maxLength={160} value={edicion.email} onChange={(e) => setEdicion({ ...edicion, email: e.target.value })} /></label>
                                <label><span>Grupo o curso</span><input className="input-field" maxLength={60} list="adm-grupos" value={edicion.grupo} onChange={(e) => setEdicion({ ...edicion, grupo: e.target.value })} placeholder="Sin grupo" /></label>
                                <datalist id="adm-grupos">{grupos.map((g) => <option key={g} value={g} />)}</datalist>
                                <div>
                                    <button type="submit" className="pro-btn pro-btn--primary adm-sm" disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</button>
                                    <button type="button" className="pro-btn pro-btn--ghost adm-sm" onClick={() => setEdicion(null)}>Cancelar</button>
                                </div>
                                {edicion.email.trim().toLowerCase() !== user.email && <p className="adm-muted">Al cambiar el correo cambia su usuario para entrar: se cierran sus sesiones y conserva su contraseña.</p>}
                            </form>
                        ) : (
                            <div>
                                <h2>{user.name}</h2>
                                <p>{user.email}</p>
                            </div>
                        )}
                        <div className="adm-ficha-insignias">
                            <RolBadge role={user.role} /><StatusBadge status={user.status} />
                            {!esAdmin && !edicion && <button type="button" className="pro-btn pro-btn--ghost adm-sm" onClick={() => setEdicion({ name: user.name, email: user.email, grupo: user.grupo || '' })}><Pencil size={15} /> Modificar</button>}
                        </div>
                    </header>
                    <dl className="adm-datos">
                        <div><dt>Registro</dt><dd>{formatDate(user.createdAt)}</dd></div>
                        <div><dt>Último ingreso</dt><dd>{formatDate(user.lastLoginAt)}</dd></div>
                        <div><dt>Última actividad</dt><dd>{formatDate(user.lastActivity)}</dd></div>
                        <div><dt>Grupo</dt><dd>{user.grupo || 'Sin grupo'}</dd></div>
                        <div><dt>Contraseña</dt><dd>{user.mustChangePassword ? 'Temporal, aún sin cambiar' : 'Propia'}</dd></div>
                    </dl>
                    {!esAdmin && (
                        <div className="adm-ajustes">
                            <label>
                                <span>Rol</span>
                                <Selector etiqueta="Rol" value={user.role} disabled={busy} buscar={false} opciones={ROLES.map((r) => ({ value: r.id, label: r.nombre, nota: r.nota }))} onChange={(v) => changeRole(user, v, v === 'student' ? user.teacherId : null)} />
                            </label>
                            {user.role === 'student' && (
                                <label>
                                    <span>Profesor a cargo</span>
                                    <Selector buscar etiqueta="Profesor a cargo" value={user.teacherId || ''} disabled={busy} opciones={opcionesProfesor} onChange={(v) => changeRole(user, 'student', v ? Number(v) : null)} />
                                </label>
                            )}
                            <div className="adm-ajuste">
                                <span>Proyectos que puede crear</span>
                                <Cupo user={user} onChange={changeLimit} busy={busy} />
                            </div>
                            <p className="adm-muted">{ROLES.find((r) => r.id === user.role)?.nota}</p>
                        </div>
                    )}
                    {user.comun && (
                        <footer className="adm-ficha-acciones">
                            <p className="adm-muted" style={{ margin: 0, flex: '1 1 20rem' }}>Es la cuenta que usan quienes presionan «Entrar como invitado» en el ingreso. No tiene contraseña ni se modifica; si la bloqueas, ese botón deja de funcionar.</p>
                            <StatusActions user={user} onChange={changeStatus} onResend={resend} busy={busy} />
                        </footer>
                    )}
                    {!esAdmin && (
                        <footer className="adm-ficha-acciones">
                            <button type="button" className="pro-btn pro-btn--ghost adm-sm" disabled={busy} onClick={() => newAccess(user)}><KeyRound size={15} /> Dar contraseña nueva</button>
                            <StatusActions user={user} onChange={changeStatus} onResend={resend} busy={busy} />
                            <button type="button" className="pro-btn pro-btn--ghost adm-sm adm-danger adm-eliminar" disabled={busy} onClick={() => eliminar(user)}><Trash2 size={15} /> Eliminar cuenta</button>
                        </footer>
                    )}
                </section>
                {acceso && <Credenciales cuentas={acceso.cuentas} mail={acceso.mail} onCerrar={() => setAcceso(null)} />}

                {user.role === 'teacher' && (
                    <section className="pro-card">
                        <h2>Estudiantes a su cargo ({susEstudiantes.length})</h2>
                        {susEstudiantes.length === 0 ? <p className="adm-muted">Todavía no tiene estudiantes. Puede crearlos desde «Mis estudiantes», o puedes asignárselos tú desde la lista de usuarios.</p> : (
                            <ul className="adm-lista">
                                {susEstudiantes.map((e) => (
                                    <li key={e.id}>
                                        <button type="button" onClick={() => viewUser(e.id)}>
                                            <span><b>{e.name}</b><small>{e.email}</small></span>
                                            <small>{e.projectCount} {e.projectCount === 1 ? 'proyecto' : 'proyectos'} · {e.projectLimit ? `puede crear ${e.projectLimit}` : 'sin permiso para crear'}</small>
                                            <ChevronRight size={16} aria-hidden="true" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                )}

                <section className="pro-card">
                    <h2>Proyectos ({suyos.length})</h2>
                    {suyos.length === 0 ? (
                        <p className="adm-muted">{user.role === 'student' && !user.projectLimit ? 'No tiene proyectos y todavía no tiene permiso para crear uno.' : 'Todavía no tiene proyectos.'}</p>
                    ) : (
                        <ul className="adm-lista">
                            {suyos.map((project) => (
                                <li key={project.id}>
                                    <button type="button" onClick={() => viewProject(project.id)}>
                                        <span><b>{project.titulo || project.name}</b><small>{project.titulo ? `${project.name} · ` : ''}Actualizado {formatDate(project.updatedAt)}</small></span>
                                        <Avance value={project.avance} />
                                        <CoherenciaBadge value={project.coherencia} />
                                        <ChevronRight size={16} aria-hidden="true" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="pro-card">
                    <h2>Historial de la cuenta</h2>
                    {historial === null && <p className="adm-muted">Cargando…</p>}
                    {historial?.length === 0 && <p className="adm-muted">No hay cambios registrados para esta cuenta. El registro empezó a llevarse hace poco: lo anterior no aparece.</p>}
                    {historial?.length > 0 && (
                        <ol className="adm-historial">
                            {historial.slice(0, 30).map((b) => (
                                <li key={b.id}><time title={new Date(b.createdAt).toLocaleString('es-CO')}>{new Date(b.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}</time><span><b>{b.action}</b> · {b.actor}</span><small>{b.detail}</small></li>
                            ))}
                        </ol>
                    )}
                </section>
            </div>
        );
    }

    /* ---------- Resúmenes por grupo y por profesor ---------- */
    const resumir = (lista, extra) => {
        const conNota = lista.filter((u) => u.coherencia);
        const media = conNota.length ? Math.round(conNota.reduce((t, u) => t + u.coherencia.score, 0) / conNota.length) : null;
        return {
            n: lista.length,
            proyectos: lista.reduce((t, u) => t + (u.projectCount || 0), 0),
            sinPermiso: lista.filter(atencion.sinPermiso).length,
            sinEstrenar: lista.filter(atencion.sinEstrenar).length,
            inactivos: lista.filter(porActividad.mes).length,
            coherencia: media === null ? null : { score: media, nivel: media >= 75 ? 'alta' : media >= 50 ? 'media' : 'baja', evaluados: conNota.length },
            ...extra,
        };
    };
    const noAdmin = users.filter((u) => u.role !== 'admin');
    const unicos = (lista) => [...new Set(lista.filter(Boolean))];
    const tablaGrupos = [
        ...grupos.map((g) => { const l = noAdmin.filter((u) => u.grupo === g); return resumir(l, { clave: g, nombre: g, profesores: unicos([...l.filter((u) => u.role === 'teacher').map((u) => u.name), ...l.map((u) => u.teacherName)]) }); }),
        ...(grupos.length && noAdmin.some((u) => !u.grupo) ? [resumir(noAdmin.filter((u) => !u.grupo), { clave: SIN_GRUPO, nombre: 'Sin grupo', profesores: [] })] : []),
    ];
    const sinProfe = users.filter(atencion.sinProfesor);
    const tablaProfesores = [
        ...profesores.map((p) => { const l = users.filter((u) => u.teacherId === p.id); return resumir(l, { clave: String(p.id), nombre: p.name, nota: p.email, grupos: unicos(l.map((u) => u.grupo)) }); }).sort((a, b) => b.n - a.n),
        ...(profesores.length && sinProfe.length ? [resumir(sinProfe, { clave: 'ninguno', nombre: 'Estudiantes sin profesor', nota: '', grupos: unicos(sinProfe.map((u) => u.grupo)) })] : []),
    ];

    /* ---------- Panel ---------- */
    const pendientes = [
        { id: 'sinProfesor', n: resumen.sinProfesor, texto: (n) => `${n} ${n === 1 ? 'estudiante sin profesor' : 'estudiantes sin profesor'}` },
        { id: 'sinPermiso', n: resumen.sinPermiso, texto: (n) => `${n} ${n === 1 ? 'espera' : 'esperan'} permiso para crear su proyecto` },
        { id: 'sinEstrenar', n: resumen.sinEstrenar, texto: (n) => `${n} aún no ${n === 1 ? 'entra' : 'entran'} con su contraseña temporal` },
    ].filter((p) => p.n > 0);

    return (
        <div className="pro-page adm">
            <div className="adm-barra">
                <div className="pro-modes" role="tablist" aria-label="Secciones de la administración">
                    <button type="button" role="tab" aria-selected={vista === 'usuarios'} onClick={() => setVista('usuarios')}>Usuarios <span className="adm-count">{resumen.total}</span></button>
                    <button type="button" role="tab" aria-selected={vista === 'proyectos'} onClick={() => setVista('proyectos')}>Proyectos <span className="adm-count">{projects ? projects.length : resumen.proyectos}</span></button>
                    <button type="button" role="tab" aria-selected={vista === 'grupos'} onClick={() => setVista('grupos')}>Grupos <span className="adm-count">{grupos.length}</span></button>
                    <button type="button" role="tab" aria-selected={vista === 'papelera'} onClick={() => setVista('papelera')}>Papelera {papelera.length > 0 && <span className="adm-count">{papelera.length}</span>}</button>
                    <button type="button" role="tab" aria-selected={vista === 'uso'} onClick={() => setVista('uso')}>Uso</button>
                    <button type="button" role="tab" aria-selected={vista === 'sistema'} onClick={() => setVista('sistema')}>Sistema</button>
                </div>
                {vista !== 'sistema' && vista !== 'papelera' && vista !== 'uso' && (
                    <button type="button" className="pro-btn pro-btn--ghost adm-sm" onClick={() => (vista === 'proyectos' ? loadProjects() : load())} disabled={loading}><RefreshCw size={15} /> Actualizar</button>
                )}
            </div>

            {vista === 'usuarios' && (
                <>
                    <dl className="adm-resumen">
                        <div><dt>Usuarios</dt><dd><button type="button" aria-pressed={!hayFiltros} onClick={() => { limpiarFiltros();  }} title="Ver todos los usuarios">{resumen.total}</button></dd></div>
                        <div><dt>Profesores</dt><dd><button type="button" aria-pressed={fRol === 'teacher'} onClick={() => { limpiarFiltros(); setFRol('teacher'); }} title="Ver solo profesores">{resumen.teacher}</button></dd></div>
                        <div><dt>Estudiantes</dt><dd><button type="button" aria-pressed={fRol === 'student'} onClick={() => { limpiarFiltros(); setFRol('student'); }} title="Ver solo estudiantes">{resumen.student}</button></dd></div>
                        <div><dt>Investigadores</dt><dd><button type="button" aria-pressed={fRol === 'researcher'} onClick={() => { limpiarFiltros(); setFRol('researcher'); }} title="Ver solo investigadores">{resumen.researcher}</button></dd></div>
                        <div><dt>Proyectos</dt><dd><button type="button" onClick={() => setVista('proyectos')} title="Ir a Proyectos">{resumen.proyectos}</button></dd></div>
                    </dl>
                    {pendientes.length > 0 && (
                        <p className="adm-pendientes">
                            <b>Por atender:</b>
                            {pendientes.map((p) => (
                                <button key={p.id} type="button" aria-pressed={fAtencion === p.id} onClick={() => { setFAtencion(fAtencion === p.id ? '' : p.id); setFRol(''); setFEstado(''); setFProfesor(''); }}>{p.texto(p.n)}</button>
                            ))}
                        </p>
                    )}

                    {creando && (
                        <div className="adm-crear">
                            <CrearCuentas profesores={profesores} grupos={grupos} onCreadas={load} />
                            <button type="button" className="adm-crear-cerrar" onClick={() => setCreando(false)} aria-label="Cerrar la creación de cuentas"><X size={18} /></button>
                        </div>
                    )}

                    <section className="pro-card adm-panel">
                        <div className="adm-toolbar">
                            <div className="adm-search">
                                <Search size={16} aria-hidden="true" />
                                <input className="input-field" type="search" placeholder="Buscar por nombre, correo, profesor o grupo" aria-label="Buscar usuarios" value={query} onChange={(event) => setQuery(event.target.value)} />
                            </div>
                            <Selector etiqueta="Filtrar por rol" value={fRol} onChange={setFRol} buscar={false} opciones={[{ value: '', label: 'Todos los roles' }, ...ROLES_FILTRO.map((r) => ({ value: r.id, label: r.nombre }))]} />
                            <Selector buscar etiqueta="Filtrar por profesor" value={fProfesor} onChange={setFProfesor} opciones={[{ value: '', label: 'Todos los profesores' }, { value: 'ninguno', label: 'Sin profesor' }, ...profesores.map((p) => ({ value: p.id, label: p.name, nota: p.email }))]} />
                            <Selector etiqueta="Filtrar por estado" value={fEstado} onChange={setFEstado} buscar={false} opciones={[{ value: '', label: 'Todos los estados' }, ...Object.entries(STATUS).map(([id, nombre]) => ({ value: id, label: nombre }))]} />
                            <Selector buscar etiqueta="Filtrar por grupo" value={fGrupo} onChange={setFGrupo} opciones={[{ value: '', label: 'Todos los grupos' }, { value: SIN_GRUPO, label: 'Sin grupo' }, ...grupos.map((g) => ({ value: g, label: g }))]} />
                            <Selector buscar={false} etiqueta="Filtrar por actividad" value={fActividad} onChange={setFActividad} opciones={[{ value: '', label: 'Cualquier actividad' }, { value: 'semana', label: 'Activos esta semana' }, { value: 'mes', label: 'Más de 30 días sin actividad' }, { value: 'nunca', label: 'Nunca han entrado' }]} />
                            {hayFiltros && <button type="button" className="pro-link" onClick={limpiarFiltros}>Quitar filtros</button>}
                            <span className="adm-toolbar-fin">
                                <button type="button" className="pro-btn pro-btn--ghost" onClick={exportar} disabled={visible.length === 0} title="Descarga la lista que ves, con sus filtros"><Download size={15} /> Exportar</button>
                                <button type="button" className="pro-btn pro-btn--primary" onClick={() => setCreando(!creando)} aria-expanded={creando}><UserPlus size={15} /> Crear cuentas</button>
                            </span>
                        </div>

                        {elegidos.length > 0 && (
                            <div className="adm-lote" role="region" aria-label="Cambios a las cuentas seleccionadas">
                                <b>{elegidos.length} {elegidos.length === 1 ? 'seleccionada' : 'seleccionadas'}</b>
                                {todosMarcados && elegidos.length < todasLasVisibles.length && <button type="button" className="pro-link" onClick={marcarTodas}>Seleccionar las {todasLasVisibles.length} que coinciden</button>}
                                <Selector compacto buscar etiqueta="Profesor para las cuentas seleccionadas" vacio="Asignar profesor…" value="" disabled={busy} onChange={loteProfesor} opciones={[...profesores.map((p) => ({ value: p.id, label: p.name, nota: p.email })), { value: 'ninguno', label: 'Quitar el profesor' }]} />
                                {grupoNuevo === null ? (
                                    <Selector compacto buscar etiqueta="Grupo para las cuentas seleccionadas" vacio="Poner en grupo…" value="" disabled={busy} onChange={(v) => (v === '+' ? setGrupoNuevo('') : loteGrupo(v === SIN_GRUPO ? '' : v))} opciones={[...grupos.map((g) => ({ value: g, label: g })), { value: '+', label: 'Grupo nuevo…' }, { value: SIN_GRUPO, label: 'Sacar del grupo' }]} />
                                ) : (
                                    <form className="adm-lote-grupo" onSubmit={(e) => { e.preventDefault(); if (grupoNuevo.trim()) loteGrupo(grupoNuevo.trim()); }}>
                                        <input className="input-field" value={grupoNuevo} onChange={(e) => setGrupoNuevo(e.target.value)} maxLength={60} placeholder="Nombre del grupo" aria-label="Nombre del grupo nuevo" autoFocus />
                                        <button type="submit" className="pro-btn pro-btn--ghost adm-sm" disabled={busy || !grupoNuevo.trim()}>Aplicar</button>
                                        <button type="button" className="pro-btn pro-btn--ghost adm-sm" onClick={() => setGrupoNuevo(null)}>Cancelar</button>
                                    </form>
                                )}
                                <Selector compacto buscar={false} etiqueta="Más acciones para las cuentas seleccionadas" vacio="Más acciones…" value="" disabled={busy} onChange={(v) => ACCIONES.find((a) => a.value === v)?.run()} opciones={ACCIONES.map(({ value, label, nota }) => ({ value, label, nota }))} />
                                <button type="button" className="pro-link adm-lote-quitar" onClick={() => { setMarcados(new Set()); setGrupoNuevo(null); }}>Quitar selección</button>
                            </div>
                        )}
                        {acceso && <Credenciales cuentas={acceso.cuentas} mail={acceso.mail} onCerrar={() => setAcceso(null)} />}

                        <div className="adm-table-wrap">
                            <table className="adm-table adm-table--usuarios">
                                <thead>
                                    <tr>
                                        <th scope="col" className="adm-check"><input type="checkbox" checked={todosMarcados} onChange={marcarPagina} disabled={marcables.length === 0} aria-label="Seleccionar las cuentas de esta página" /></th>
                                        <Th id="nombre" orden={orden} onOrden={ordenar}>Usuario</Th>
                                        <Th id="rol" orden={orden} onOrden={ordenar}>Rol</Th>
                                        <th scope="col">Estado</th>
                                        <Th id="proyectos" orden={orden} onOrden={ordenar} num>Proyectos</Th>
                                        <th scope="col" title="Cuántos proyectos puede crear. 0 = sin permiso todavía">Puede crear</th>
                                        <Th id="actividad" orden={orden} onOrden={ordenar}>Actividad</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading && users.length === 0 && <Esqueleto columnas={7} />}
                                    {!loading && fallo && users.length === 0 && (
                                        <tr><td colSpan={7} className="adm-empty"><b>No se pudo cargar la lista</b><span>{fallo} Revisa tu conexión e inténtalo de nuevo; no se perdió nada.</span><button type="button" className="pro-btn pro-btn--primary" onClick={load}><RefreshCw size={15} /> Reintentar</button></td></tr>
                                    )}
                                    {!loading && !(fallo && users.length === 0) && visible.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="adm-empty">
                                                {users.length <= 1 && !hayFiltros
                                                    ? <><Users size={22} aria-hidden="true" /><b>Todavía no hay cuentas</b><span>Nadie se registra solo: crea las primeras con «Crear cuentas», una a una o pegando una lista.</span><button type="button" className="pro-btn pro-btn--primary" onClick={() => setCreando(true)}><UserPlus size={15} /> Crear cuentas</button></>
                                                    : <><b>Ninguna cuenta coincide</b><span>Prueba con otro nombre o quita los filtros.</span><button type="button" className="pro-btn pro-btn--ghost" onClick={limpiarFiltros}>Quitar filtros</button></>}
                                            </td>
                                        </tr>
                                    )}
                                    {enPagina.map((user) => (
                                        <tr key={user.id} data-marcado={marcados.has(user.id) || undefined}>
                                            <td className="adm-check">{user.role !== 'admin' && <input type="checkbox" checked={marcados.has(user.id)} onChange={() => marcar(user.id)} aria-label={`Seleccionar a ${user.name}`} />}</td>
                                            <td>
                                                <button type="button" className="adm-user-link" onClick={() => viewUser(user.id)}>
                                                    <b>{user.name}</b>
                                                    <small>{user.comun ? 'Cuenta compartida del botón «Entrar como invitado»' : user.email}</small>
                                                    {user.grupo && <small className="adm-grupo">{user.grupo}</small>}
                                                </button>
                                            </td>
                                            <td data-label="Rol">
                                                <span className="adm-rol-celda">
                                                    <RolBadge role={user.role} />
                                                    {user.role === 'student' && <small data-falta={!user.teacherId || undefined}>{user.teacherName || 'Sin profesor'}</small>}
                                                    {user.role === 'teacher' && <small>{estudiantesDe.get(user.id) || 0} {estudiantesDe.get(user.id) === 1 ? 'estudiante' : 'estudiantes'}</small>}
                                                </span>
                                            </td>
                                            <td data-label="Estado"><StatusBadge status={user.status} />{user.mustChangePassword && user.role !== 'admin' && <small className="adm-sub" title="Todavía no ha entrado a cambiar su contraseña temporal">Sin estrenar</small>}</td>
                                            <td className="adm-num" data-label="Proyectos">{user.projectCount}</td>
                                            <td data-label="Puede crear"><Cupo user={user} onChange={changeLimit} busy={busy} /></td>
                                            <td data-label="Actividad" title={formatDate(user.lastActivity || user.lastLoginAt)}>{haceCuanto(user.lastActivity || user.lastLoginAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Paginas total={visible.length} pagina={pagina} onPagina={setPagina} que={hayFiltros ? `(de ${users.length} cuentas)` : 'cuentas'} porPagina={porPagina} onPorPagina={setPorPagina} />
                    </section>
                </>
            )}

            {vista === 'proyectos' && (
                <section className="pro-card adm-panel">
                    <div className="adm-toolbar">
                        <div className="adm-search">
                            <Search size={16} aria-hidden="true" />
                            <input className="input-field" type="search" placeholder="Buscar por título, proyecto o dueño" aria-label="Buscar proyectos" value={pQuery} onChange={(event) => setPQuery(event.target.value)} />
                        </div>
                        <Selector buscar etiqueta="Filtrar proyectos por grupo" value={pGrupo} onChange={setPGrupo} opciones={[{ value: '', label: 'Todos los grupos' }, { value: SIN_GRUPO, label: 'Sin grupo' }, ...grupos.map((g) => ({ value: g, label: g }))]} />
                        <Selector buscar etiqueta="Filtrar proyectos por profesor" value={pProfesor} onChange={setPProfesor} opciones={[{ value: '', label: 'Todos los profesores' }, ...profesores.map((p) => ({ value: p.id, label: p.name, nota: p.email }))]} />
                        {hayFiltrosP && <button type="button" className="pro-link" onClick={() => { setPQuery(''); setPGrupo(''); setPProfesor(''); setPTramo(''); }}>Quitar filtros</button>}
                        <span className="adm-toolbar-fin">
                            <button type="button" className="pro-btn pro-btn--ghost" onClick={exportarProyectos} disabled={proyectosVisibles.length === 0}><Download size={15} /> Exportar</button>
                        </span>
                    </div>
                    {projects?.length > 0 && (
                        <div className="adm-reparto" role="group" aria-label="Proyectos según su avance">
                            {reparto.map((t) => (
                                <button key={t.id} type="button" data-tramo={t.id} aria-pressed={pTramo === t.id} onClick={() => setPTramo(pTramo === t.id ? '' : t.id)} disabled={t.n === 0}>
                                    <b>{t.n}</b><span>{t.nombre}</span>
                                    <i style={{ width: `${Math.round((t.n / projects.length) * 100)}%` }} aria-hidden="true" />
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="adm-table-wrap">
                        <table className="adm-table adm-table--proyectos">
                            <thead>
                                <tr>
                                    <Th id="proyecto" orden={pOrden} onOrden={ordenarP}>Proyecto</Th>
                                    <Th id="dueno" orden={pOrden} onOrden={ordenarP}>Dueño</Th>
                                    <Th id="avance" orden={pOrden} onOrden={ordenarP}>Avance</Th>
                                    <Th id="coherencia" orden={pOrden} onOrden={ordenarP}>Coherencia</Th>
                                    <th scope="col" className="adm-num" title="Compañeros invitados al proyecto">Invitados</th>
                                    <Th id="actualizado" orden={pOrden} onOrden={ordenarP}>Actualizado</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects === null && <Esqueleto columnas={6} />}
                                {projects !== null && proyectosVisibles.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="adm-empty">
                                            {projects.length === 0
                                                ? <><FileText size={22} aria-hidden="true" /><b>Todavía no hay proyectos</b><span>Aparecerán aquí cuando los profesores, investigadores y estudiantes con permiso empiecen a trabajar.</span></>
                                                : <><b>Ningún proyecto coincide</b><span>Prueba con otra palabra o quita los filtros de grupo, profesor o avance.</span><button type="button" className="pro-btn pro-btn--ghost" onClick={() => { setPQuery(''); setPGrupo(''); setPProfesor(''); setPTramo(''); }}>Quitar filtros</button></>}
                                        </td>
                                    </tr>
                                )}
                                {proyectosVisibles.slice((pPagina - 1) * porPagina, pPagina * porPagina).map((p) => (
                                    <tr key={p.id}>
                                        <td>
                                            <button type="button" className="adm-user-link" onClick={() => { setSelected(null); viewProject(p.id); }}>
                                                <b>{p.titulo || p.name}</b>
                                                <small>{p.titulo ? p.name : 'Aún sin título de investigación'}</small>
                                            </button>
                                        </td>
                                        <td>
                                            <button type="button" className="adm-user-link adm-user-link--suave" onClick={() => viewUser(p.ownerId)}>
                                                <b>{p.owner}</b>
                                                <small>{nombreRol(p.ownerRole)}</small>
                                            </button>
                                        </td>
                                        <td><Avance value={p.avance} /></td>
                                        <td><CoherenciaBadge value={p.coherencia} /></td>
                                        <td className="adm-num">{p.miembros || '—'}</td>
                                        <td title={formatDate(p.updatedAt)}>{haceCuanto(p.updatedAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Paginas total={proyectosVisibles.length} pagina={pPagina} onPagina={setPPagina} que={hayFiltrosP ? `(de ${projects?.length || 0} proyectos)` : 'proyectos'} porPagina={porPagina} onPorPagina={setPorPagina} />
                </section>
            )}

            {vista === 'grupos' && (
                <>
                    <section className="pro-card adm-panel">
                        <div className="adm-bitacora-cabeza">
                            <h2>Por grupo</h2>
                            <p className="adm-muted">Un grupo es un curso o cohorte. Se pone al crear las cuentas (también en la carga por lotes) o seleccionando varias en Usuarios. Presiona un grupo para ver sus cuentas; con el lápiz le cambias el nombre (si pones el de otro grupo, se unen) y con la papelera desaparece el grupo y sus cuentas quedan sin grupo.</p>
                        </div>
                        <div className="adm-table-wrap">
                            <table className="adm-table adm-table--grupos">
                                <thead><tr><th scope="col">Grupo</th><th scope="col" className="adm-num">Cuentas</th><th scope="col">Profesores</th><th scope="col" className="adm-num">Proyectos</th><th scope="col" className="adm-num" title="Estudiantes que aún no pueden crear su proyecto">Sin permiso</th><th scope="col" className="adm-num" title="Aún no entran con su contraseña temporal">Sin estrenar</th><th scope="col" className="adm-num" title="Sin actividad en más de 30 días">Inactivos</th><th scope="col" title="Promedio de la coherencia de sus proyectos">Coherencia</th><th scope="col"><span className="adm-sr">Acciones</span></th></tr></thead>
                                <tbody>
                                    {tablaGrupos.length === 0 && <tr><td colSpan={9} className="adm-empty"><b>Todavía no hay grupos</b><span>En Usuarios, marca varias cuentas y usa «Poner en grupo…», o indica el grupo al crear las cuentas.</span><button type="button" className="pro-btn pro-btn--ghost" onClick={() => setVista('usuarios')}>Ir a Usuarios</button></td></tr>}
                                    {tablaGrupos.map((g) => (
                                        <tr key={g.clave}>
                                            <td>
                                                {grupoEditado?.de === g.clave ? (
                                                    <form className="adm-grupo-editar" onSubmit={renombrarGrupo}>
                                                        <input className="input-field" value={grupoEditado.a} onChange={(e) => setGrupoEditado({ ...grupoEditado, a: e.target.value })} maxLength={60} aria-label={`Nombre nuevo para ${g.nombre}`} autoFocus onKeyDown={(e) => { if (e.key === 'Escape') setGrupoEditado(null); }} />
                                                        <button type="submit" className="pro-btn pro-btn--primary adm-sm" disabled={busy || !grupoEditado.a.trim()}>Guardar</button>
                                                        <button type="button" className="pro-btn pro-btn--ghost adm-sm" onClick={() => setGrupoEditado(null)}>Cancelar</button>
                                                    </form>
                                                ) : <button type="button" className="adm-user-link" onClick={() => verUsuarios({ grupo: g.clave })}><b>{g.nombre}</b></button>}
                                            </td>
                                            <td className="adm-num">{g.n}</td>
                                            <td>{g.profesores.slice(0, 3).join(', ') || '—'}{g.profesores.length > 3 ? ` y ${g.profesores.length - 3} más` : ''}</td>
                                            <td className="adm-num">{g.proyectos}</td>
                                            <td className="adm-num" data-alerta={g.sinPermiso > 0 || undefined}>{g.sinPermiso}</td>
                                            <td className="adm-num" data-alerta={g.sinEstrenar > 0 || undefined}>{g.sinEstrenar}</td>
                                            <td className="adm-num">{g.inactivos}</td>
                                            <td><CoherenciaBadge value={g.coherencia} /></td>
                                            <td>
                                                {g.clave !== SIN_GRUPO && grupoEditado?.de !== g.clave && (
                                                    <span className="adm-grupo-acciones">
                                                        <button type="button" className="adm-icono" disabled={busy} onClick={() => setGrupoEditado({ de: g.clave, a: g.nombre })} aria-label={`Cambiar el nombre de ${g.nombre}`} title="Renombrar (o unir con otro grupo)"><Pencil size={15} /></button>
                                                        <button type="button" className="adm-icono adm-danger" disabled={busy} onClick={() => quitarGrupo(g)} aria-label={`Borrar el grupo ${g.nombre}`} title="Borrar el grupo: sus cuentas quedan sin grupo; no se borra ninguna"><Trash2 size={15} /></button>
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                    <GruposProfesor profesores={profesores} version={users.map((u) => `${u.id}:${u.grupo}:${u.role}`).join('|')} onCambio={load} />
                    <section className="pro-card adm-panel">
                        <div className="adm-bitacora-cabeza">
                            <h2>Por profesor</h2>
                            <p className="adm-muted">Cuántos estudiantes tiene cada profesor a su cargo y cómo van. Presiona un profesor para ver a sus estudiantes.</p>
                        </div>
                        <div className="adm-table-wrap">
                            <table className="adm-table adm-table--grupos">
                                <thead><tr><th scope="col">Profesor</th><th scope="col" className="adm-num">Estudiantes</th><th scope="col">Grupos</th><th scope="col" className="adm-num">Proyectos</th><th scope="col" className="adm-num">Sin permiso</th><th scope="col" className="adm-num">Sin estrenar</th><th scope="col" className="adm-num">Inactivos</th><th scope="col">Coherencia</th></tr></thead>
                                <tbody>
                                    {tablaProfesores.length === 0 && <tr><td colSpan={8} className="adm-empty"><b>Todavía no hay profesores</b><span>Crea una cuenta con rol de profesor para que pueda tener estudiantes a su cargo.</span></td></tr>}
                                    {tablaProfesores.map((g) => (
                                        <tr key={g.clave}>
                                            <td><button type="button" className="adm-user-link" onClick={() => verUsuarios({ profesor: g.clave })}><b>{g.nombre}</b>{g.nota && <small>{g.nota}</small>}</button></td>
                                            <td className="adm-num">{g.n}</td>
                                            <td>{g.grupos.slice(0, 3).join(', ') || '—'}{g.grupos.length > 3 ? ` y ${g.grupos.length - 3} más` : ''}</td>
                                            <td className="adm-num">{g.proyectos}</td>
                                            <td className="adm-num" data-alerta={g.sinPermiso > 0 || undefined}>{g.sinPermiso}</td>
                                            <td className="adm-num" data-alerta={g.sinEstrenar > 0 || undefined}>{g.sinEstrenar}</td>
                                            <td className="adm-num">{g.inactivos}</td>
                                            <td><CoherenciaBadge value={g.coherencia} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </>
            )}

            {vista === 'papelera' && (
                <section className="pro-card adm-panel">
                    <div className="adm-bitacora-cabeza adm-papelera-cabeza">
                        <div>
                            <h2>Papelera</h2>
                            <p className="adm-muted">Las cuentas eliminadas se guardan aquí 30 días con todo lo suyo: proyectos, versiones, figuras y encuestas. Al restaurar, la persona entra con el mismo correo y contraseña.</p>
                        </div>
                        {papelera.length > 0 && <button type="button" className="pro-btn pro-btn--ghost adm-sm adm-danger" disabled={busy} onClick={() => borrarDeltodo(null)}><Trash2 size={15} /> Vaciar papelera</button>}
                    </div>
                    <div className="adm-table-wrap">
                        <table className="adm-table adm-table--grupos">
                            <thead><tr><th scope="col">Cuenta</th><th scope="col">Rol</th><th scope="col" className="adm-num">Proyectos</th><th scope="col">Eliminada</th><th scope="col">Se borra en</th><th scope="col"><span className="adm-sr">Acciones</span></th></tr></thead>
                            <tbody>
                                {papelera.length === 0 && <tr><td colSpan={6} className="adm-empty"><Trash2 size={22} aria-hidden="true" /><b>La papelera está vacía</b><span>Cuando elimines una cuenta quedará aquí 30 días, por si hay que recuperarla.</span></td></tr>}
                                {papelera.map((c) => (
                                    <tr key={c.id}>
                                        <td><span className="adm-user-link adm-user-link--suave"><b>{c.name}</b><small>{c.email}</small>{c.grupo && <small className="adm-grupo">{c.grupo}</small>}</span></td>
                                        <td><RolBadge role={c.role} /></td>
                                        <td className="adm-num">{c.projects}</td>
                                        <td title={new Date(c.deletedAt).toLocaleString('es-CO')}>{haceCuanto(new Date(c.deletedAt).toISOString().replace('T', ' ').slice(0, 19))}{c.deletedBy ? ` · ${c.deletedBy}` : ''}</td>
                                        <td data-alerta={c.venceEn <= 5 || undefined}>{c.venceEn} {c.venceEn === 1 ? 'día' : 'días'}</td>
                                        <td>
                                            <span className="adm-grupo-acciones">
                                                <button type="button" className="pro-btn pro-btn--primary adm-sm" disabled={busy} onClick={() => restaurar(c)}><RotateCcw size={14} /> Restaurar</button>
                                                <button type="button" className="pro-btn pro-btn--ghost adm-sm adm-danger" disabled={busy} onClick={() => borrarDeltodo(c)} aria-label={`Borrar definitivamente a ${c.name}`}><Trash2 size={14} /> Borrar</button>
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {vista === 'uso' && (
                <>
                    <CuotaIA onVerUsuario={viewUser} />
                    <section className="pro-card adm-panel">
                        <div className="adm-papelera-cabeza adm-bitacora-cabeza">
                            <div>
                                <h2>Cuentas activas por día</h2>
                                <p className="adm-muted">Cuántas cuentas distintas entraron, guardaron, usaron la IA o buscaron cada día.{uso?.desde ? ` El conteo empezó el ${fechaCorta(uso.desde)}: los días anteriores aparecen en cero.` : ' Todavía no hay datos: el conteo empieza desde ahora.'}</p>
                            </div>
                            <div className="pro-modes adm-uso-dias" role="tablist" aria-label="Periodo">
                                {[7, 30, 90].map((n) => <button key={n} type="button" role="tab" aria-selected={usoDias === n} onClick={() => setUsoDias(n)}>{n} días</button>)}
                            </div>
                        </div>
                        {uso === null && <p className="adm-muted">Cargando…</p>}
                        {uso && (() => {
                            const maximo = Math.max(1, ...uso.serie.map((d) => d.activos));
                            const tope = maximo <= 4 ? 4 : Math.ceil(maximo / 4) * 4;
                            const visto = barra ? uso.serie.find((d) => d.day === barra) : null;
                            const cadaCuanto = Math.ceil(uso.serie.length / 8);
                            return (
                                <>
                                    <dl className="adm-resumen adm-resumen--uso">
                                        <div><dt>Cuentas activas en el periodo</dt><dd>{uso.activosPeriodo} <small>de {uso.cuentas}</small></dd></div>
                                        <div><dt>Guardados</dt><dd>{suma(uso.serie, 'guardado')}</dd></div>
                                        <div><dt>Usos de la IA</dt><dd>{suma(uso.serie, 'ia')}</dd></div>
                                        <div><dt>Búsquedas</dt><dd>{suma(uso.serie, 'articulos') + suma(uso.serie, 'teorias') + suma(uso.serie, 'normas')}</dd></div>
                                        <div><dt>Normas: consultas de hoy</dt><dd>{uso.normas.configurada ? <>{uso.normas.consultasHoy} <small>{uso.normas.restantes === null ? `de ${uso.normas.limite} al día` : `· quedan ${uso.normas.restantes}`}</small></> : <small>Sin configurar</small>}</dd></div>
                                    </dl>
                                    <figure className="adm-grafica" onMouseLeave={() => setBarra(null)}>
                                        <div className="adm-grafica-eje" aria-hidden="true">{[tope, tope * 0.75, tope * 0.5, tope * 0.25, 0].map((v) => <span key={v}>{v}</span>)}</div>
                                        <div className="adm-grafica-lienzo" role="img" aria-label={`Cuentas activas por día en los últimos ${uso.dias} días. Máximo: ${maximo}.`}>
                                            {uso.serie.map((d, i) => (
                                                <button key={d.day} type="button" className="adm-col" data-vista={barra === d.day || undefined} onMouseEnter={() => setBarra(d.day)} onFocus={() => setBarra(d.day)} onBlur={() => setBarra(null)} aria-label={`${fechaCorta(d.day)}: ${d.activos} ${d.activos === 1 ? 'cuenta activa' : 'cuentas activas'}`}>
                                                    <i style={{ height: `${(d.activos / tope) * 100}%` }} />
                                                    {((i % cadaCuanto === 0 && uso.serie.length - 1 - i >= cadaCuanto * 0.6) || i === uso.serie.length - 1) && <span>{fechaCorta(d.day)}</span>}
                                                </button>
                                            ))}
                                        </div>
                                        <figcaption className="adm-grafica-nota" aria-live="polite">
                                            {visto
                                                ? <><b>{fechaCorta(visto.day)}</b> · {visto.activos} {visto.activos === 1 ? 'cuenta activa' : 'cuentas activas'} · {visto.ingreso} ingresos · {visto.guardado} guardados · {visto.ia} usos de la IA · {visto.articulos + visto.teorias + visto.normas} búsquedas</>
                                                : 'Pasa el cursor por una barra (o recórrelas con el tabulador) para ver el detalle de ese día.'}
                                        </figcaption>
                                    </figure>
                                    <details className="adm-uso-tabla">
                                        <summary>Ver los días como tabla</summary>
                                        <div className="adm-table-wrap">
                                            <table className="adm-table">
                                                <thead><tr><th scope="col">Día</th><th scope="col" className="adm-num">Cuentas activas</th><th scope="col" className="adm-num">Ingresos</th><th scope="col" className="adm-num">Guardados</th><th scope="col" className="adm-num">IA</th><th scope="col" className="adm-num">Artículos</th><th scope="col" className="adm-num">Teorías</th><th scope="col" className="adm-num">Normas</th></tr></thead>
                                                <tbody>{[...uso.serie].reverse().map((d) => <tr key={d.day}><td>{fechaCorta(d.day)}</td><td className="adm-num">{d.activos}</td><td className="adm-num">{d.ingreso}</td><td className="adm-num">{d.guardado}</td><td className="adm-num">{d.ia}</td><td className="adm-num">{d.articulos}</td><td className="adm-num">{d.teorias}</td><td className="adm-num">{d.normas}</td></tr>)}</tbody>
                                            </table>
                                        </div>
                                    </details>
                                </>
                            );
                        })()}
                    </section>
                    {uso && (
                        <>
                            <section className="pro-card adm-panel">
                                <div className="adm-bitacora-cabeza"><h2>Uso por grupo</h2><p className="adm-muted">Lo que hicieron las cuentas de cada grupo en los últimos {uso.dias} días.</p></div>
                                <div className="adm-table-wrap">
                                    <table className="adm-table adm-table--grupos">
                                        <thead><tr><th scope="col">Grupo</th><th scope="col" className="adm-num">Cuentas activas</th><th scope="col" className="adm-num">Ingresos</th><th scope="col" className="adm-num">Guardados</th><th scope="col" className="adm-num">IA</th><th scope="col" className="adm-num">Artículos</th><th scope="col" className="adm-num">Teorías</th><th scope="col" className="adm-num">Normas</th></tr></thead>
                                        <tbody>
                                            {uso.grupos.length === 0 && <tr><td colSpan={8} className="adm-empty"><b>Sin actividad registrada</b><span>Cuando las cuentas entren y trabajen, aquí verás el uso de cada grupo.</span></td></tr>}
                                            {uso.grupos.map((g) => <tr key={g.grupo || '-'}><td>{g.grupo ? <button type="button" className="adm-user-link" onClick={() => verUsuarios({ grupo: g.grupo })}><b>{g.grupo}</b></button> : <span className="adm-muted">Sin grupo</span>}</td><td className="adm-num">{g.cuentas}</td><td className="adm-num">{g.ingreso}</td><td className="adm-num">{g.guardado}</td><td className="adm-num">{g.ia}</td><td className="adm-num">{g.articulos}</td><td className="adm-num">{g.teorias}</td><td className="adm-num">{g.normas}</td></tr>)}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                            <section className="pro-card adm-panel">
                                <div className="adm-bitacora-cabeza"><h2>Cuentas que más la usan</h2><p className="adm-muted">Las diez con más actividad en el periodo.</p></div>
                                <div className="adm-table-wrap">
                                    <table className="adm-table adm-table--grupos">
                                        <thead><tr><th scope="col">Cuenta</th><th scope="col" className="adm-num">Días con actividad</th><th scope="col" className="adm-num">Guardados</th><th scope="col" className="adm-num">IA</th><th scope="col" className="adm-num">Acciones en total</th></tr></thead>
                                        <tbody>
                                            {uso.top.length === 0 && <tr><td colSpan={5} className="adm-empty"><b>Sin actividad registrada</b></td></tr>}
                                            {uso.top.map((t) => <tr key={t.id}><td><button type="button" className="adm-user-link" onClick={() => viewUser(t.id)}><b>{t.name}</b><small>{t.email}{t.grupo ? ` · ${t.grupo}` : ''}</small></button></td><td className="adm-num">{t.dias}</td><td className="adm-num">{t.guardado}</td><td className="adm-num">{t.ia}</td><td className="adm-num">{t.total}</td></tr>)}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </>
                    )}
                </>
            )}

            {vista === 'sistema' && (
                <>
                    {!mailReady && (
                        <p className="pro-warn" role="status">
                            El envío de correo no está configurado en el servidor: las cuentas nuevas no reciben el correo con su acceso. Entrega tú la contraseña temporal que aparece al crearlas.
                        </p>
                    )}
                    <ServiciosExternos />
                    <AdminEstado fijo onRestaurada={() => { setProjects(null); setSelected(null); load(); api.admin.log().then((r) => setBitacora(r.log)).catch(() => {}); }} />
                    <section className="pro-card adm-panel adm-bitacora">
                        <div className="adm-bitacora-cabeza">
                            <h2>Registro de cambios</h2>
                            <p className="adm-muted">Lo que el administrador y los profesores hacen con las cuentas: quién, qué y cuándo. Se conservan los últimos 3000.</p>
                        </div>
                        <div className="adm-toolbar">
                            <div className="adm-search">
                                <Search size={16} aria-hidden="true" />
                                <input className="input-field" type="search" placeholder="Buscar por correo, nombre, persona o acción" aria-label="Buscar en el registro de cambios" value={bQuery} onChange={(e) => setBQuery(e.target.value)} />
                            </div>
                            <span className="adm-toolbar-fin"><button type="button" className="pro-btn pro-btn--ghost" onClick={exportarRegistro} disabled={!bitacora?.length}><Download size={15} /> Exportar</button></span>
                        </div>
                        {bitacora === null && <p className="adm-muted">Cargando…</p>}
                        {bitacora?.length === 0 && <p className="adm-muted">{bQuery ? 'Ningún cambio coincide con esa búsqueda.' : 'Todavía no hay cambios registrados. Aparecerán aquí al crear, modificar o eliminar cuentas.'}</p>}
                        {bitacora?.length > 0 && (
                            <div className="adm-table-wrap adm-bitacora-lista">
                                <table className="adm-table">
                                    <thead><tr><th scope="col">Cuándo</th><th scope="col">Quién</th><th scope="col">Qué hizo</th><th scope="col">Detalle</th></tr></thead>
                                    <tbody>
                                        {bitacora.map((b) => (
                                            <tr key={b.id}>
                                                <td title={new Date(b.createdAt).toLocaleString('es-CO')}>{haceCuanto(new Date(b.createdAt).toISOString().replace('T', ' ').slice(0, 19))}</td>
                                                <td>{b.actor}</td>
                                                <td><b>{b.action}</b></td>
                                                <td className="adm-bitacora-detalle">{b.detail}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
};

export default Admin;
