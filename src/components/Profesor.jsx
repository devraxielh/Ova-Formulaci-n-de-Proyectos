import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, FileText, KeyRound, RefreshCw, UserPlus, Users } from 'lucide-react';
import { api } from '../services/api';
import { buildDocument } from '../services/projectDoc';
import { DocumentPaper } from './ProjectDocument';
import Coherencia from './Coherencia';
import { Credenciales } from './Cuentas';
import { avisar, confirmar } from './Avisos';
import './Proyecto.css';
import './Cuentas.css';

/*
 * «Mis estudiantes» (rol profesor): crea las cuentas de los estudiantes a su cargo, decide si cada uno puede crear
 * proyectos y supervisa los que tengan (los abre en solo lectura, con su coherencia).
 */

const formatDate = (value) => {
    if (!value) return 'nunca';
    const date = new Date(`${String(value).replace(' ', 'T')}Z`);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const Profesor = () => {
    const [students, setStudents] = useState([]);
    const [cupoMaximo, setCupoMaximo] = useState(5);
    const [mail, setMail] = useState(true);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const setError = (texto) => avisar(texto, 'error');
    const setNotice = (texto) => avisar(texto);
    const [form, setForm] = useState({ name: '', email: '', permitir: true });
    const [creadas, setCreadas] = useState(null);
    const [abierto, setAbierto] = useState(null); // { project, owner }

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const r = await api.teacher.students();
            setStudents(r.students);
            setCupoMaximo(r.cupoMaximo);
            setMail(r.mail);
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    }, []);
    useEffect(() => { load(); }, [load]);

    const reemplazar = (s) => setStudents((prev) => prev.map((x) => (x.id === s.id ? s : x)));
    const crear = async (event) => {
        event.preventDefault();
        setBusy(true);
        try {
            const r = await api.teacher.createStudent(form);
            setStudents((prev) => [...prev, r.student].sort((a, b) => a.name.localeCompare(b.name, 'es')));
            setCreadas({ cuentas: [{ name: r.student.name, email: r.student.email, clave: r.clave, emailSent: r.emailSent }], mail: r.emailSent });
            setForm({ name: '', email: '', permitir: form.permitir });
        } catch (err) { setError(err.message); } finally { setBusy(false); }
    };
    const cambiarCupo = async (s, limit) => {
        setBusy(true);
        try {
            const r = await api.teacher.setLimit(s.id, limit);
            reemplazar(r.student);
            setNotice(limit === 0 ? `${s.name} ya no puede crear proyectos nuevos.` : `${s.name} puede crear hasta ${limit} ${limit === 1 ? 'proyecto' : 'proyectos'}.`);
        } catch (err) { setError(err.message); } finally { setBusy(false); }
    };
    const nuevoAcceso = async (s) => {
        if (!(await confirmar({ texto: `¿Dar una contraseña nueva a ${s.name}?`, detalle: 'La anterior deja de servir y se cierran sus sesiones.', aceptar: 'Dar contraseña nueva' }))) return;
        setBusy(true);
        try {
            const r = await api.teacher.newAccess(s.id);
            setCreadas({ cuentas: [{ name: s.name, email: s.email, clave: r.clave, emailSent: r.emailSent }], mail: r.emailSent });
        } catch (err) { setError(err.message); } finally { setBusy(false); }
    };
    const abrir = async (id) => {
        try { setAbierto(await api.teacher.project(id)); } catch (err) { setError(err.message); }
    };

    if (abierto) {
        const sections = buildDocument(abierto.project.data);
        const pasos = sections.filter((section) => !section.extra);
        const filled = pasos.filter((section) => section.content.length > 0).length;
        return (
            <div className="pro-page">
                <div className="adm-crumbs">
                    <button type="button" className="pro-btn pro-btn--ghost" onClick={() => setAbierto(null)}><ArrowLeft size={16} /> Volver a mis estudiantes</button>
                </div>
                <Coherencia data={abierto.project.data} compacto titulo="Coherencia del proyecto" />
                <section className="pro-doc">
                    <div className="pro-doc-bar">
                        <div>
                            <h2>{abierto.project.name}</h2>
                            <p className="adm-muted">{abierto.owner?.name} · {abierto.owner?.email} · {filled} de {pasos.length} secciones · Actualizado {formatDate(abierto.project.updatedAt)}</p>
                        </div>
                        <span className="adm-readonly">Solo lectura</span>
                    </div>
                    {filled === 0
                        ? <p className="adm-muted">Este proyecto todavía está vacío.</p>
                        : <DocumentPaper sections={sections} fallbackTitle={abierto.project.name} author={String(abierto.project.data?.integrantes || '').trim() || abierto.owner?.name} fileUrl={(fid) => `/api/projects/${abierto.project.id}/files/${fid}`} />}
                </section>
            </div>
        );
    }

    return (
        <div className="pro-page">
            <section className="pro-card cue">
                <div className="cue-cabeza">
                    <h2><UserPlus size={19} aria-hidden="true" /> Crear un estudiante</h2>
                </div>
                <p className="adm-muted">Los estudiantes no se registran solos: tú creas su cuenta y decides si pueden crear proyectos.</p>
                {creadas && <Credenciales cuentas={creadas.cuentas} mail={creadas.mail} onCerrar={() => setCreadas(null)} />}
                <form className="cue-form" onSubmit={crear}>
                    <label><span>Nombre completo</span><input className="input-field" required maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Ana Pérez Gómez" /></label>
                    <label><span>Correo (será su usuario)</span><input className="input-field" type="email" required maxLength={160} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ana@correo.edu.co" /></label>
                    <label className="cue-check"><input type="checkbox" checked={form.permitir} onChange={(e) => setForm({ ...form, permitir: e.target.checked })} /> Puede crear su proyecto desde ya</label>
                    <button type="submit" className="pro-btn pro-btn--primary" disabled={busy}><UserPlus size={15} /> {busy ? 'Creando…' : 'Crear estudiante'}</button>
                </form>
                {!mail && <p className="adm-muted">El servidor no tiene correo configurado: entrega tú la contraseña temporal a cada estudiante.</p>}
            </section>

            <section className="pro-card cue">
                <div className="cue-cabeza">
                    <h2><Users size={19} aria-hidden="true" /> Mis estudiantes ({students.length})</h2>
                    <button type="button" className="pro-btn pro-btn--ghost" onClick={load} disabled={loading}><RefreshCw size={15} /> Actualizar</button>
                </div>
                {loading && students.length === 0 && <p className="adm-muted">Cargando…</p>}
                {!loading && students.length === 0 && <p className="adm-muted">Todavía no tienes estudiantes a tu cargo. Crea el primero arriba.</p>}
                <div className="prf-lista">
                    {students.map((s) => (
                        <article className="prf-estudiante" key={s.id}>
                            <header>
                                <div>
                                    <b>{s.name}</b>
                                    <small>{s.email}{s.grupo ? ` · ${s.grupo}` : ''} · Último ingreso: {formatDate(s.lastLoginAt)}{s.mustChangePassword ? ' · aún no cambia su contraseña temporal' : ''}{s.status === 'blocked' ? ' · cuenta bloqueada' : ''}</small>
                                </div>
                                <button type="button" className="pro-btn pro-btn--ghost adm-sm" disabled={busy} onClick={() => nuevoAcceso(s)}><KeyRound size={15} /> Contraseña nueva</button>
                            </header>
                            <div className="prf-permiso">
                                <span className="prf-etiqueta" data-ok={s.projectLimit > 0 || undefined}>{s.projectLimit > 0 ? 'Puede crear proyectos' : 'No puede crear proyectos'}</span>
                                <span>Proyectos permitidos:</span>
                                <span className="adm-cupo" data-cero={s.projectLimit === 0}>
                                    <button type="button" disabled={busy || s.projectLimit <= 0} onClick={() => cambiarCupo(s, s.projectLimit - 1)} aria-label={`Permitir un proyecto menos a ${s.name}`}>−</button>
                                    <b>{s.projectLimit}</b>
                                    <button type="button" disabled={busy || s.projectLimit >= cupoMaximo} onClick={() => cambiarCupo(s, s.projectLimit + 1)} aria-label={`Permitir un proyecto más a ${s.name}`}>+</button>
                                </span>
                                <span className="adm-muted">Tiene {s.projects.length}.</span>
                            </div>
                            {s.projects.length > 0 && (
                                <ul className="adm-projects">
                                    {s.projects.map((p) => (
                                        <li key={p.id}>
                                            <button type="button" onClick={() => abrir(p.id)}>
                                                <FileText size={18} />
                                                <span>{p.titulo || p.name}</span>
                                                <span className="prf-avance" title={`${p.avance || 0} % de avance`}><span style={{ width: `${p.avance || 0}%` }} /></span>
                                                <small>{p.avance || 0} % · Coherencia {p.coherencia ? `${p.coherencia.score} %` : '—'} · Actualizado {formatDate(p.updatedAt)}</small>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Profesor;
