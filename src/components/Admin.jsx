import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Ban, CheckCircle2, FileText, KeyRound, Mail, RefreshCw, Search, UserCheck } from 'lucide-react';
import { api } from '../services/api';
import { buildDocument } from '../services/projectDoc';
import { DocumentPaper } from './ProjectDocument';
import Coherencia from './Coherencia';
import AdminEstado from './AdminEstado';
import { CrearCuentas, Credenciales, ROLES, nombreRol } from './Cuentas';

// Insignia con el porcentaje de coherencia entre secciones.
const CoherenciaBadge = ({ value }) => (value
    ? <span className="adm-coh" data-nivel={value.nivel} title={`Coherencia ${value.nivel}: ${value.evaluados} relaciones evaluadas`}>{value.score} %</span>
    : <span className="adm-coh" data-nivel="pendiente" title="Faltan secciones para evaluarla">—</span>);
import './Proyecto.css';

const STATUS = {
    active: 'Activo',
    pending: 'Pendiente',
    blocked: 'Bloqueado',
};

const FILTERS = [
    { id: 'all', label: 'Todos', count: (c) => c.total },
    { id: 'active', label: 'Activos', count: (c) => c.active },
    { id: 'pending', label: 'Pendientes', count: (c) => c.pending },
    { id: 'blocked', label: 'Bloqueados', count: (c) => c.blocked },
];

// SQLite guarda fechas UTC como "AAAA-MM-DD HH:MM:SS".
const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(`${value.replace(' ', 'T')}Z`);
    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const StatusBadge = ({ status }) => <span className="adm-badge" data-status={status}>{STATUS[status] || status}</span>;

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

// El rol lo asigna el administrador; al estudiante se le elige además el profesor a cargo.
const Rol = ({ user, profesores, onChange, busy }) => {
    if (user.role === 'admin') return <span className="adm-muted">Administrador</span>;
    return (
        <span className="adm-rol">
            <select className="input-field" value={user.role} disabled={busy} aria-label={`Rol de ${user.name}`} onChange={(e) => onChange(user, e.target.value, e.target.value === 'student' ? user.teacherId : null)}>
                {ROLES.filter((r) => r.id !== 'admin').map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
            {user.role === 'student' && (
                <select className="input-field" value={user.teacherId || ''} disabled={busy} aria-label={`Profesor a cargo de ${user.name}`} onChange={(e) => onChange(user, 'student', e.target.value ? Number(e.target.value) : null)}>
                    <option value="">Sin profesor</option>
                    {profesores.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            )}
        </span>
    );
};

const StatusActions = ({ user, onChange, onResend, busy }) => {
    const [confirm, setConfirm] = useState(false);
    if (user.role === 'admin') return <span className="adm-muted">Administrador</span>;

    if (confirm) {
        return (
            <span className="adm-confirm">
                <span>¿Bloquear a {user.name}?</span>
                <button type="button" className="pro-btn pro-btn--danger adm-sm" disabled={busy} onClick={() => { setConfirm(false); onChange(user, 'blocked'); }}>Bloquear</button>
                <button type="button" className="pro-btn pro-btn--ghost adm-sm" onClick={() => setConfirm(false)}>Cancelar</button>
            </span>
        );
    }

    return (
        <span className="adm-row-actions">
            {user.status === 'pending' && (
                <>
                    <button type="button" className="pro-btn pro-btn--ghost adm-sm" disabled={busy} onClick={() => onChange(user, 'active')}>
                        <UserCheck size={15} /> Activar
                    </button>
                    <button type="button" className="pro-btn pro-btn--ghost adm-sm" disabled={busy} onClick={() => onResend(user)} title="Reenviar el correo de activación">
                        <Mail size={15} /> Reenviar
                    </button>
                </>
            )}
            {user.status === 'blocked' ? (
                <button type="button" className="pro-btn pro-btn--ghost adm-sm" disabled={busy} onClick={() => onChange(user, 'active')}>
                    <CheckCircle2 size={15} /> Desbloquear
                </button>
            ) : (
                <button type="button" className="pro-btn pro-btn--ghost adm-sm adm-danger" disabled={busy} onClick={() => setConfirm(true)}>
                    <Ban size={15} /> Bloquear
                </button>
            )}
        </span>
    );
};

const Admin = () => {
    const [users, setUsers] = useState([]);
    const [counts, setCounts] = useState({ total: 0, active: 0, pending: 0, blocked: 0 });
    const [mailReady, setMailReady] = useState(true);
    const [filter, setFilter] = useState('all');
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    const [selected, setSelected] = useState(null); // { user, projects }
    const [openProject, setOpenProject] = useState(null); // { project, owner }
    const [acceso, setAcceso] = useState(null); // contraseña temporal recién generada
    const profesores = useMemo(() => users.filter((u) => u.role === 'teacher'), [users]);

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const result = await api.admin.users();
            setUsers(result.users);
            setCounts(result.counts);
            setMailReady(result.mail);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return users.filter((user) => (filter === 'all' || user.status === filter)
            && (!q || user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q)));
    }, [users, filter, query]);

    const replaceUser = (updated) => {
        setUsers((prev) => prev.map((user) => (user.id === updated.id ? updated : user)));
        setSelected((prev) => (prev && prev.user.id === updated.id ? { ...prev, user: updated } : prev));
        setCounts((prev) => {
            const old = users.find((user) => user.id === updated.id);
            if (!old || old.status === updated.status) return prev;
            return { ...prev, [old.status]: prev[old.status] - 1, [updated.status]: prev[updated.status] + 1 };
        });
    };

    const changeLimit = async (user, limit) => {
        setBusy(true);
        setError('');
        setNotice('');
        try {
            const { user: updated } = await api.admin.setLimit(user.id, limit);
            replaceUser(updated);
            setNotice(limit === 0 ? `${updated.name} ya no puede crear proyectos nuevos.` : `${updated.name} puede crear hasta ${limit} ${limit === 1 ? 'proyecto' : 'proyectos'}.`);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const changeStatus = async (user, status) => {
        setBusy(true);
        setError('');
        setNotice('');
        try {
            const { user: updated } = await api.admin.setStatus(user.id, status);
            replaceUser(updated);
            const action = status === 'blocked' ? 'bloqueó' : user.status === 'pending' ? 'activó' : 'desbloqueó';
            setNotice(`Se ${action} la cuenta de ${updated.name}.`);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const changeRole = async (user, role, teacherId) => {
        if (role !== user.role && !window.confirm(`¿Cambiar el rol de ${user.name} a ${nombreRol(role)}?`)) return;
        setBusy(true);
        setError('');
        setNotice('');
        try {
            const { user: updated } = await api.admin.setRole(user.id, role, teacherId);
            replaceUser(updated);
            if (role !== user.role) load();
            setNotice(role !== user.role ? `${updated.name} ahora es ${nombreRol(role).toLowerCase()}.` : `${updated.name} quedó ${updated.teacherName ? `a cargo de ${updated.teacherName}` : 'sin profesor a cargo'}.`);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const newAccess = async (user) => {
        if (!window.confirm(`¿Dar una contraseña nueva a ${user.name}? La anterior deja de servir.`)) return;
        setBusy(true);
        setError('');
        setNotice('');
        try {
            const r = await api.admin.newAccess(user.id);
            setAcceso({ cuentas: [{ name: user.name, email: user.email, clave: r.clave, emailSent: r.emailSent }], mail: r.emailSent });
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const resend = async (user) => {
        setBusy(true);
        setError('');
        setNotice('');
        try {
            await api.admin.resend(user.id);
            setNotice(`Se envió un enlace de activación nuevo a ${user.email}.`);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const viewUser = async (user) => {
        setError('');
        setNotice('');
        setOpenProject(null);
        try {
            setSelected(await api.admin.user(user.id));
        } catch (err) {
            setError(err.message);
        }
    };

    const viewProject = async (id) => {
        setError('');
        try {
            setOpenProject(await api.admin.project(id));
        } catch (err) {
            setError(err.message);
        }
    };

    const messages = (
        <>
            {error && <p className="pro-alert" role="alert">{error}</p>}
            {notice && <p className="pro-notice" role="status">{notice}</p>}
        </>
    );

    if (openProject) {
        const sections = buildDocument(openProject.project.data);
        const pasos = sections.filter((section) => !section.extra);
        const filled = pasos.filter((section) => section.content.length > 0).length;
        return (
            <div className="pro-page">
                <div className="adm-crumbs">
                    <button type="button" className="pro-btn pro-btn--ghost" onClick={() => setOpenProject(null)}>
                        <ArrowLeft size={16} /> Volver a {openProject.owner?.name || 'el usuario'}
                    </button>
                </div>
                {messages}
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

    if (selected) {
        const { user, projects } = selected;
        return (
            <div className="pro-page">
                <div className="adm-crumbs">
                    <button type="button" className="pro-btn pro-btn--ghost" onClick={() => { setSelected(null); load(); }}>
                        <ArrowLeft size={16} /> Todos los usuarios
                    </button>
                </div>
                {messages}
                <section className="pro-card adm-user">
                    <div>
                        <h2>{user.name}</h2>
                        <p>{user.email} · {nombreRol(user.role)}{user.teacherName ? ` · Profesor: ${user.teacherName}` : ''} · <StatusBadge status={user.status} /></p>
                        <p className="adm-muted">Registro: {formatDate(user.createdAt)} · Último ingreso: {formatDate(user.lastLoginAt)}</p>
                    </div>
                    <div className="adm-user-acciones">
                        {user.role !== 'admin' && <button type="button" className="pro-btn pro-btn--ghost adm-sm" disabled={busy} onClick={() => newAccess(user)}><KeyRound size={15} /> Dar acceso nuevo</button>}
                        <StatusActions user={user} onChange={changeStatus} onResend={resend} busy={busy} />
                    </div>
                </section>
                {acceso && <Credenciales cuentas={acceso.cuentas} mail={acceso.mail} onCerrar={() => setAcceso(null)} />}

                <section className="pro-card">
                    <h2>Proyectos ({projects.length})</h2>
                    {projects.length === 0 ? (
                        <p className="adm-muted">Este usuario todavía no tiene proyectos.</p>
                    ) : (
                        <ul className="adm-projects">
                            {projects.map((project) => (
                                <li key={project.id}>
                                    <button type="button" onClick={() => viewProject(project.id)}>
                                        <FileText size={18} />
                                        <span>{project.name}</span>
                                        <CoherenciaBadge value={project.coherencia} />
                                        <small>Actualizado {formatDate(project.updatedAt)}</small>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        );
    }

    return (
        <div className="pro-page">
            {!mailReady && (
                <p className="pro-warn" role="status">
                    El envío de correo no está configurado en el servidor: las cuentas nuevas no reciben el correo con su acceso. Entrega tú la contraseña temporal que aparece al crearlas.
                </p>
            )}
            {messages}

            <AdminEstado />

            <CrearCuentas profesores={profesores} onCreadas={load} />

            <section className="pro-card">
                <div className="adm-toolbar">
                    <div className="pro-modes adm-filters" role="tablist" aria-label="Filtrar por estado">
                        {FILTERS.map((item) => (
                            <button key={item.id} type="button" role="tab" aria-selected={filter === item.id} onClick={() => setFilter(item.id)}>
                                {item.label} <span className="adm-count">{item.count(counts)}</span>
                            </button>
                        ))}
                    </div>
                    <div className="adm-search">
                        <Search size={16} aria-hidden="true" />
                        <input
                            className="input-field"
                            type="search"
                            placeholder="Buscar por nombre o correo"
                            aria-label="Buscar usuarios"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                        />
                    </div>
                    <button type="button" className="pro-btn pro-btn--ghost" onClick={load} disabled={loading}>
                        <RefreshCw size={15} /> Actualizar
                    </button>
                </div>

                <div className="adm-table-wrap">
                    <table className="adm-table">
                        <thead>
                            <tr>
                                <th scope="col">Usuario</th>
                                <th scope="col">Rol</th>
                                <th scope="col">Estado</th>
                                <th scope="col" className="adm-num">Proyectos</th>
                                <th scope="col" title="Cuántos proyectos puede crear. 0 = sin permiso todavía">Cupo</th>
                                <th scope="col" title="Coherencia entre secciones del proyecto más reciente">Coherencia</th>
                                <th scope="col">Última actividad</th>
                                <th scope="col">Registro</th>
                                <th scope="col"><span className="adm-sr">Acciones</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && users.length === 0 && (
                                <tr><td colSpan={9} className="adm-empty">Cargando usuarios…</td></tr>
                            )}
                            {!loading && visible.length === 0 && (
                                <tr><td colSpan={9} className="adm-empty">{users.length === 0 ? 'Todavía no hay usuarios registrados.' : 'Ningún usuario coincide con el filtro.'}</td></tr>
                            )}
                            {visible.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <button type="button" className="adm-user-link" onClick={() => viewUser(user)}>
                                            <b>{user.name}</b>
                                            <small>{user.email}</small>
                                        </button>
                                    </td>
                                    <td><Rol user={user} profesores={profesores} onChange={changeRole} busy={busy} /></td>
                                    <td><StatusBadge status={user.status} /></td>
                                    <td className="adm-num">{user.projectCount}</td>
                                    <td><Cupo user={user} onChange={changeLimit} busy={busy} /></td>
                                    <td><CoherenciaBadge value={user.coherencia} /></td>
                                    <td>{formatDate(user.lastActivity || user.lastLoginAt)}</td>
                                    <td>{formatDate(user.createdAt)}</td>
                                    <td><StatusActions user={user} onChange={changeStatus} onResend={resend} busy={busy} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default Admin;
