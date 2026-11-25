import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowUp, Ban, CheckCircle2, ChevronLeft, ChevronRight, Download, FileText, KeyRound, Mail, RefreshCw, Search, UserCheck, UserPlus, Users, X } from 'lucide-react';
import { api } from '../services/api';
import { buildDocument } from '../services/projectDoc';
import { DocumentPaper } from './ProjectDocument';
import Coherencia from './Coherencia';
import AdminEstado from './AdminEstado';
import { CrearCuentas, Credenciales, ROLES, csv, descargar, nombreRol } from './Cuentas';
import Selector from './Selector';
import { avisar, confirmar } from './Avisos';
import './Proyecto.css';
import './Cuentas.css';
import './Admin.css';

/*
 * Administración. Tres pestañas:
 *  - Usuarios: buscar, filtrar, ordenar, crear cuentas, cambiar varias a la vez y abrir la ficha de cada una.
 *  - Proyectos: todos los proyectos de la plataforma con su dueño, avance y coherencia.
 *  - Sistema: copias de seguridad, servicios y errores.
 */

const POR_PAGINA = 25;
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
    const limit = user.projectLimit || 0;
    return (
        <span className="adm-cupo" data-cero={limit === 0}>
            <button type="button" disabled={busy || limit <= 0} onClick={() => onChange(user, limit - 1)} aria-label={`Quitar un proyecto a ${user.name}`}>−</button>
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

const Paginas = ({ total, pagina, onPagina, que }) => {
    if (total === 0) return null;
    const paginas = Math.ceil(total / POR_PAGINA);
    const desde = (pagina - 1) * POR_PAGINA + 1;
    const hasta = Math.min(total, pagina * POR_PAGINA);
    return (
        <div className="adm-paginas">
            <span>{desde}–{hasta} de {total} {que}</span>
            {paginas > 1 && (
                <span className="adm-paginas-botones">
                    <button type="button" className="pro-btn pro-btn--ghost adm-sm" disabled={pagina <= 1} onClick={() => onPagina(pagina - 1)}><ChevronLeft size={15} /> Anterior</button>
                    <span>Página {pagina} de {paginas}</span>
                    <button type="button" className="pro-btn pro-btn--ghost adm-sm" disabled={pagina >= paginas} onClick={() => onPagina(pagina + 1)}>Siguiente <ChevronRight size={15} /></button>
                </span>
            )}
        </div>
    );
};

const Esqueleto = ({ columnas }) => Array.from({ length: 6 }, (_, i) => (
    <tr key={i} className="adm-esqueleto" aria-hidden="true">
        {Array.from({ length: columnas }, (__, j) => <td key={j}><span style={{ width: `${j === 1 ? 70 : 40 + ((i + j) % 3) * 15}%` }} /></td>)}
    </tr>
));

const Admin = () => {
    const [vista, setVista] = useState('usuarios');
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState(null); // null = todavía no se han pedido
    const [mailReady, setMailReady] = useState(true);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    // Los resultados y los errores salen como avisos emergentes.
    const setError = (texto) => avisar(texto, 'error');
    const setNotice = (texto) => avisar(texto);

    // Lista de usuarios: filtros, orden, página y selección.
    const [query, setQuery] = useState('');
    const [fRol, setFRol] = useState('');
    const [fEstado, setFEstado] = useState('');
    const [fProfesor, setFProfesor] = useState(''); // id del profesor o 'ninguno'
    const [fAtencion, setFAtencion] = useState(''); // 'sinProfesor' | 'sinPermiso' | 'sinEstrenar'
    const [orden, setOrden] = useState({ por: 'registro', asc: false });
    const [pagina, setPagina] = useState(1);
    const [marcados, setMarcados] = useState(() => new Set());
    const [creando, setCreando] = useState(false);
    const [loteProfesor, setLoteProfesor] = useState('');

    // Lista de proyectos.
    const [pQuery, setPQuery] = useState('');
    const [pOrden, setPOrden] = useState({ por: 'actualizado', asc: false });
    const [pPagina, setPPagina] = useState(1);

    const [selected, setSelected] = useState(null); // { user, projects }
    const [openProject, setOpenProject] = useState(null); // { project, owner }
    const [acceso, setAcceso] = useState(null); // contraseña temporal recién generada

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const result = await api.admin.users();
            setUsers(result.users);
            setMailReady(result.mail);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);
    const loadProjects = useCallback(async () => {
        try { setProjects((await api.admin.projects()).projects); } catch (err) { setError(err.message); }
    }, []);

    useEffect(() => { load(); }, [load]);
    useEffect(() => { if (vista === 'proyectos' && projects === null) loadProjects(); }, [vista, projects, loadProjects]);

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
            && (!q || sinTildes(u.name).includes(q) || u.email.toLowerCase().includes(q) || sinTildes(u.teacherName).includes(q)));
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
    }, [users, query, fRol, fEstado, fProfesor, fAtencion, orden]);
    useEffect(() => { setPagina(1); }, [query, fRol, fEstado, fProfesor, fAtencion]);
    const enPagina = visible.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
    const hayFiltros = Boolean(query || fRol || fEstado || fProfesor || fAtencion);
    const limpiarFiltros = () => { setQuery(''); setFRol(''); setFEstado(''); setFProfesor(''); setFAtencion(''); };
    const ordenar = (por) => setOrden((prev) => (prev.por === por ? { por, asc: !prev.asc } : { por, asc: por === 'nombre' || por === 'rol' }));

    const proyectosVisibles = useMemo(() => {
        const q = sinTildes(pQuery.trim());
        const lista = (projects || []).filter((p) => !q || sinTildes(p.titulo).includes(q) || sinTildes(p.name).includes(q) || sinTildes(p.owner).includes(q) || p.ownerEmail.toLowerCase().includes(q));
        const clave = {
            proyecto: (p) => sinTildes(p.titulo || p.name),
            dueno: (p) => sinTildes(p.owner),
            avance: (p) => p.avance || 0,
            coherencia: (p) => (p.coherencia ? p.coherencia.score : -1),
            actualizado: (p) => p.updatedAt || '',
        }[pOrden.por];
        const sentido = pOrden.asc ? 1 : -1;
        return [...lista].sort((a, b) => { const x = clave(a); const y = clave(b); return (x < y ? -1 : x > y ? 1 : 0) * sentido || a.id - b.id; });
    }, [projects, pQuery, pOrden]);
    useEffect(() => { setPPagina(1); }, [pQuery]);
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
    const resend = (user) => accion(async () => {
        await api.admin.resend(user.id);
        setNotice(`Se envió un enlace de activación nuevo a ${user.email}.`);
    });

    // Cambios a varias cuentas a la vez: se aplican una por una y al final se cuenta cuántas quedaron.
    const elegidos = users.filter((u) => marcados.has(u.id) && u.role !== 'admin');
    const enLote = (texto, sirve, fn) => accion(async () => {
        const destino = elegidos.filter(sirve);
        if (!destino.length) { setNotice('Ninguna de las cuentas seleccionadas admite ese cambio.'); return; }
        let hechas = 0;
        let fallo = '';
        for (const u of destino) {
            // eslint-disable-next-line no-await-in-loop
            try { await fn(u); hechas += 1; } catch (err) { fallo = err.message; }
        }
        await load();
        setMarcados(new Set());
        setNotice(`${texto}: ${hechas} de ${destino.length} ${destino.length === 1 ? 'cuenta' : 'cuentas'}.${destino.length < elegidos.length ? ` Las otras ${elegidos.length - destino.length} no aplicaban.` : ''}`);
        if (fallo) setError(`Algunas no se pudieron cambiar: ${fallo}`);
    });
    const loteAsignar = () => {
        const prof = profesores.find((p) => String(p.id) === loteProfesor);
        if (!prof) return undefined;
        return enLote(`A cargo de ${prof.name}`, (u) => u.role === 'student', (u) => api.admin.setRole(u.id, 'student', prof.id));
    };
    const lotePermitir = () => enLote('Permiso para crear un proyecto', (u) => !u.projectLimit, (u) => api.admin.setLimit(u.id, 1));
    const loteEstado = async (status) => {
        if (status === 'blocked' && !(await confirmar({ texto: `¿Bloquear ${elegidos.length} ${elegidos.length === 1 ? 'cuenta' : 'cuentas'}?`, detalle: 'No podrán entrar hasta que las desbloquees.', aceptar: 'Bloquear', peligro: true }))) return undefined;
        return enLote(status === 'blocked' ? 'Bloqueadas' : 'Activadas', (u) => u.status !== status, (u) => api.admin.setStatus(u.id, status));
    };
    const marcar = (id) => setMarcados((prev) => { const s = new Set(prev); if (s.has(id)) s.delete(id); else s.add(id); return s; });
    const marcables = enPagina.filter((u) => u.role !== 'admin');
    const todosMarcados = marcables.length > 0 && marcables.every((u) => marcados.has(u.id));
    const marcarPagina = () => setMarcados((prev) => { const s = new Set(prev); marcables.forEach((u) => (todosMarcados ? s.delete(u.id) : s.add(u.id))); return s; });

    const exportar = () => descargar('usuarios-projectsia.csv', csv([
        ['Nombre', 'Correo', 'Rol', 'Profesor a cargo', 'Estado', 'Proyectos', 'Cupo', 'Coherencia (%)', 'Última actividad', 'Registro'],
        ...visible.map((u) => [u.name, u.email, nombreRol(u.role), u.teacherName || '', STATUS[u.status] || u.status, u.projectCount, u.role === 'admin' ? '' : u.projectLimit, u.coherencia ? u.coherencia.score : '', formatDate(u.lastActivity || u.lastLoginAt), formatDate(u.createdAt)]),
    ]));
    const exportarProyectos = () => descargar('proyectos-projectsia.csv', csv([
        ['Título', 'Nombre del proyecto', 'Dueño', 'Correo', 'Rol', 'Avance (%)', 'Coherencia (%)', 'Invitados', 'Actualizado'],
        ...proyectosVisibles.map((p) => [p.titulo, p.name, p.owner, p.ownerEmail, nombreRol(p.ownerRole), p.avance, p.coherencia ? p.coherencia.score : '', p.miembros, formatDate(p.updatedAt)]),
    ]));

    const viewUser = async (id) => {
        setAcceso(null);
        setOpenProject(null);
        try { setSelected(await api.admin.user(id)); } catch (err) { setError(err.message); }
    };
    const viewProject = async (id) => {
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
                        <span className="adm-readonly">Solo lectura</span>
                    </div>
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
        const esAdmin = user.role === 'admin';
        const susEstudiantes = user.role === 'teacher' ? users.filter((u) => u.teacherId === user.id) : [];
        return (
            <div className="pro-page">
                <div className="adm-crumbs">
                    <button type="button" className="pro-btn pro-btn--ghost" onClick={() => { setSelected(null); setAcceso(null); load(); }}>
                        <ArrowLeft size={16} /> Todos los usuarios
                    </button>
                </div>
                <section className="pro-card adm-ficha">
                    <header className="adm-ficha-cabeza">
                        <div>
                            <h2>{user.name}</h2>
                            <p>{user.email}</p>
                        </div>
                        <div className="adm-ficha-insignias"><RolBadge role={user.role} /><StatusBadge status={user.status} /></div>
                    </header>
                    <dl className="adm-datos">
                        <div><dt>Registro</dt><dd>{formatDate(user.createdAt)}</dd></div>
                        <div><dt>Último ingreso</dt><dd>{formatDate(user.lastLoginAt)}</dd></div>
                        <div><dt>Última actividad</dt><dd>{formatDate(user.lastActivity)}</dd></div>
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
                    {!esAdmin && (
                        <footer className="adm-ficha-acciones">
                            <button type="button" className="pro-btn pro-btn--ghost adm-sm" disabled={busy} onClick={() => newAccess(user)}><KeyRound size={15} /> Dar contraseña nueva</button>
                            <StatusActions user={user} onChange={changeStatus} onResend={resend} busy={busy} />
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
                                            <CoherenciaBadge value={e.coherencia} />
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
            </div>
        );
    }

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
                    <button type="button" role="tab" aria-selected={vista === 'sistema'} onClick={() => setVista('sistema')}>Sistema</button>
                </div>
                {vista !== 'sistema' && (
                    <button type="button" className="pro-btn pro-btn--ghost adm-sm" onClick={() => (vista === 'usuarios' ? load() : loadProjects())} disabled={loading}><RefreshCw size={15} /> Actualizar</button>
                )}
            </div>

            {vista === 'usuarios' && (
                <>
                    <dl className="adm-resumen">
                        <div><dt>Usuarios</dt><dd>{resumen.total}</dd></div>
                        <div><dt>Profesores</dt><dd>{resumen.teacher}</dd></div>
                        <div><dt>Estudiantes</dt><dd>{resumen.student}</dd></div>
                        <div><dt>Investigadores</dt><dd>{resumen.researcher}</dd></div>
                        <div><dt>Proyectos</dt><dd>{resumen.proyectos}</dd></div>
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
                            <CrearCuentas profesores={profesores} onCreadas={load} />
                            <button type="button" className="adm-crear-cerrar" onClick={() => setCreando(false)} aria-label="Cerrar la creación de cuentas"><X size={18} /></button>
                        </div>
                    )}

                    <section className="pro-card adm-panel">
                        <div className="adm-toolbar">
                            <div className="adm-search">
                                <Search size={16} aria-hidden="true" />
                                <input className="input-field" type="search" placeholder="Buscar por nombre, correo o profesor" aria-label="Buscar usuarios" value={query} onChange={(event) => setQuery(event.target.value)} />
                            </div>
                            <Selector etiqueta="Filtrar por rol" value={fRol} onChange={setFRol} buscar={false} opciones={[{ value: '', label: 'Todos los roles' }, ...ROLES_FILTRO.map((r) => ({ value: r.id, label: r.nombre }))]} />
                            <Selector buscar etiqueta="Filtrar por profesor" value={fProfesor} onChange={setFProfesor} opciones={[{ value: '', label: 'Todos los profesores' }, { value: 'ninguno', label: 'Sin profesor' }, ...profesores.map((p) => ({ value: p.id, label: p.name, nota: p.email }))]} />
                            <Selector etiqueta="Filtrar por estado" value={fEstado} onChange={setFEstado} buscar={false} opciones={[{ value: '', label: 'Todos los estados' }, ...Object.entries(STATUS).map(([id, nombre]) => ({ value: id, label: nombre }))]} />
                            <span className="adm-toolbar-fin">
                                <button type="button" className="pro-btn pro-btn--ghost" onClick={exportar} disabled={visible.length === 0} title="Descarga la lista que ves, con sus filtros"><Download size={15} /> Exportar</button>
                                <button type="button" className="pro-btn pro-btn--primary" onClick={() => setCreando(!creando)} aria-expanded={creando}><UserPlus size={15} /> Crear cuentas</button>
                            </span>
                        </div>

                        {elegidos.length > 0 && (
                            <div className="adm-lote" role="region" aria-label="Cambios a las cuentas seleccionadas">
                                <b>{elegidos.length} {elegidos.length === 1 ? 'seleccionada' : 'seleccionadas'}</b>
                                <span className="adm-lote-grupo">
                                    <Selector compacto buscar etiqueta="Profesor para las cuentas seleccionadas" vacio="Asignar profesor…" value={loteProfesor} onChange={(v) => setLoteProfesor(String(v))} opciones={profesores.map((p) => ({ value: p.id, label: p.name, nota: p.email }))} />
                                    <button type="button" className="pro-btn pro-btn--ghost adm-sm" disabled={busy || !loteProfesor} onClick={loteAsignar}>Asignar</button>
                                </span>
                                <button type="button" className="pro-btn pro-btn--ghost adm-sm" disabled={busy} onClick={lotePermitir}>Permitir un proyecto</button>
                                <button type="button" className="pro-btn pro-btn--ghost adm-sm" disabled={busy} onClick={() => loteEstado('active')}><CheckCircle2 size={15} /> Activar</button>
                                <button type="button" className="pro-btn pro-btn--ghost adm-sm adm-danger" disabled={busy} onClick={() => loteEstado('blocked')}><Ban size={15} /> Bloquear</button>
                                <button type="button" className="pro-link" onClick={() => setMarcados(new Set())}>Quitar selección</button>
                            </div>
                        )}

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
                                        <th scope="col" title="Coherencia entre secciones del proyecto más reciente">Coherencia</th>
                                        <Th id="actividad" orden={orden} onOrden={ordenar}>Actividad</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading && users.length === 0 && <Esqueleto columnas={8} />}
                                    {!loading && visible.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="adm-empty">
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
                                                    <small>{user.email}</small>
                                                </button>
                                            </td>
                                            <td>
                                                <span className="adm-rol-celda">
                                                    <RolBadge role={user.role} />
                                                    {user.role === 'student' && <small data-falta={!user.teacherId || undefined}>{user.teacherName || 'Sin profesor'}</small>}
                                                    {user.role === 'teacher' && <small>{estudiantesDe.get(user.id) || 0} {estudiantesDe.get(user.id) === 1 ? 'estudiante' : 'estudiantes'}</small>}
                                                </span>
                                            </td>
                                            <td><StatusBadge status={user.status} />{user.mustChangePassword && user.role !== 'admin' && <small className="adm-sub" title="Todavía no ha entrado a cambiar su contraseña temporal">Sin estrenar</small>}</td>
                                            <td className="adm-num">{user.projectCount}</td>
                                            <td><Cupo user={user} onChange={changeLimit} busy={busy} /></td>
                                            <td><CoherenciaBadge value={user.coherencia} /></td>
                                            <td title={formatDate(user.lastActivity || user.lastLoginAt)}>{haceCuanto(user.lastActivity || user.lastLoginAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Paginas total={visible.length} pagina={pagina} onPagina={setPagina} que={hayFiltros ? `(de ${users.length} cuentas)` : 'cuentas'} />
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
                        <span className="adm-toolbar-fin">
                            <button type="button" className="pro-btn pro-btn--ghost" onClick={exportarProyectos} disabled={proyectosVisibles.length === 0}><Download size={15} /> Exportar</button>
                        </span>
                    </div>
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
                                                : <><b>Ningún proyecto coincide</b><span>Prueba con otra palabra del título o con el nombre del dueño.</span><button type="button" className="pro-btn pro-btn--ghost" onClick={() => setPQuery('')}>Quitar la búsqueda</button></>}
                                        </td>
                                    </tr>
                                )}
                                {proyectosVisibles.slice((pPagina - 1) * POR_PAGINA, pPagina * POR_PAGINA).map((p) => (
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
                    <Paginas total={proyectosVisibles.length} pagina={pPagina} onPagina={setPPagina} que={pQuery ? `(de ${projects?.length || 0} proyectos)` : 'proyectos'} />
                </section>
            )}

            {vista === 'sistema' && (
                <>
                    {!mailReady && (
                        <p className="pro-warn" role="status">
                            El envío de correo no está configurado en el servidor: las cuentas nuevas no reciben el correo con su acceso. Entrega tú la contraseña temporal que aparece al crearlas.
                        </p>
                    )}
                    <AdminEstado fijo />
                </>
            )}
        </div>
    );
};

export default Admin;
