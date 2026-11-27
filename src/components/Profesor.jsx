import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { ArrowLeft, FileText, KeyRound, RefreshCw, Search, Upload, UserPlus, Users } from 'lucide-react';
import { api } from '../services/api';
import { buildDocument } from '../services/projectDoc';
import { DocumentPaper } from './ProjectDocument';
import Coherencia from './Coherencia';
import { Credenciales, csv, descargar, leerEstudiantes } from './Cuentas';
import Selector from './Selector';
import { avisar, confirmar } from './Avisos';
import SeccionesGrupo from './SeccionesGrupo';
import './Proyecto.css';
import './Cuentas.css';

/*
 * «Mis estudiantes» (rol profesor): crea las cuentas de los estudiantes a su cargo, decide si cada uno puede crear
 * proyectos y supervisa los que tengan (los abre en solo lectura, con su coherencia).
 */

const SIN_GRUPO = '__sin_grupo__'; // valor del filtro «Sin grupo» (no choca con un grupo de verdad)

const formatDate = (value) => {
    if (!value) return 'nunca';
    const date = new Date(`${String(value).replace(' ', 'T')}Z`);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const Profesor = () => {
    const [students, setStudents] = useState([]);
    const [cupoMaximo, setCupoMaximo] = useState(1);
    const [mail, setMail] = useState(true);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const setError = (texto) => avisar(texto, 'error');
    const setNotice = (texto) => avisar(texto);
    const [form, setForm] = useState({ name: '', email: '', grupo: '', permitir: true });
    const [modo, setModo] = useState('uno'); // 'uno' | 'lote'
    const [lote, setLote] = useState('');
    const [grupoLote, setGrupoLote] = useState('');
    const [fGrupo, setFGrupo] = useState(''); // nombre del grupo o SIN_GRUPO
    const [query, setQuery] = useState('');
    const [grupoPara, setGrupoPara] = useState(null); // { id, valor } mientras se cambia el grupo de un estudiante
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
            setForm({ name: '', email: '', grupo: form.grupo, permitir: form.permitir });
        } catch (err) { setError(err.message); } finally { setBusy(false); }
    };
    // Crear un estudiante desde la tarjeta de un grupo: queda asociado a ese grupo. Devuelve su contraseña temporal.
    const crearEnGrupo = async ({ name, email, grupo }) => {
        const r = await api.teacher.createStudent({ name, email, grupo, permitir: form.permitir });
        setStudents((prev) => [...prev, r.student].sort((a, b) => a.name.localeCompare(b.name, 'es')));
        return { cuentas: [{ name: r.student.name, email: r.student.email, clave: r.clave, emailSent: r.emailSent }], mail: r.emailSent };
    };
    const listaRef = useRef(null);
    const verGrupoEnLista = (grupo) => { setFGrupo(grupo || SIN_GRUPO); setQuery(''); listaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
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
    // Carga por lotes: nombre, correo y grupo.
    const filas = useMemo(() => leerEstudiantes(lote), [lote]);
    const validas = filas.filter((f) => !f.error);
    const cargarLote = async () => {
        setBusy(true);
        try {
            const r = await api.teacher.createBatch(validas.map(({ name, email, group }) => ({ name, email, group })), { group: grupoLote.trim(), permitir: form.permitir });
            setCreadas({ cuentas: r.resultados, mail: r.mail });
            setStudents(r.students);
            if (r.creadas) setLote('');
        } catch (err) { setError(err.message); } finally { setBusy(false); }
    };
    const leerArchivo = async (event) => {
        const archivo = event.target.files?.[0];
        event.target.value = '';
        if (!archivo) return;
        if (archivo.size > 300000) { setError('El archivo es muy grande. Usa un CSV de hasta 150 filas.'); return; }
        setLote(await archivo.text());
    };

    // Grupos y filtro de la lista.
    // Grupos: los de los estudiantes más los que el profesor creó a mano (aunque aún estén vacíos).
    const [gruposCreados, setGruposCreados] = useState([]);
    const grupos = useMemo(() => [...new Set([...students.map((s) => s.grupo), ...gruposCreados].filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es', { numeric: true })), [students, gruposCreados]);
    // Estudiantes marcados para asociarlos a un grupo de una sola vez.
    const [marcados, setMarcados] = useState([]);
    const [grupoDestino, setGrupoDestino] = useState('');
    // Si se elimina un grupo, el filtro y el destino de «Asociar» no se quedan apuntando a él (lo recrearían).
    useEffect(() => {
        if (grupoDestino && !grupos.includes(grupoDestino)) setGrupoDestino('');
        if (fGrupo && fGrupo !== SIN_GRUPO && !grupos.includes(fGrupo)) setFGrupo('');
    }, [grupos, grupoDestino, fGrupo]);
    const alternarMarcado = (id) => setMarcados((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));
    const visibles = useMemo(() => {
        const q = query.trim().toLowerCase();
        return students.filter((s) => (!fGrupo || (fGrupo === SIN_GRUPO ? !s.grupo : s.grupo === fGrupo)) && (!q || s.name.toLowerCase().includes(q) || s.email.includes(q)));
    }, [students, fGrupo, query]);
    const enVarios = async (ids, action, value, hecho) => {
        setBusy(true);
        try {
            const r = await api.teacher.bulk(ids, action, value);
            setStudents(r.students);
            setGrupoPara(null);
            setNotice(`${hecho}: ${r.hechas} ${r.hechas === 1 ? 'estudiante' : 'estudiantes'}.`);
        } catch (err) { setError(err.message); } finally { setBusy(false); }
    };
    const permitirVisibles = async () => {
        const sin = visibles.filter((s) => !s.projectLimit);
        if (!sin.length) { setNotice('Todos los que ves ya pueden crear su proyecto.'); return; }
        if (!(await confirmar({ texto: `¿Permitir un proyecto a ${sin.length} ${sin.length === 1 ? 'estudiante' : 'estudiantes'}?`, detalle: fGrupo && fGrupo !== SIN_GRUPO ? `Son los del grupo «${fGrupo}» que aún no tienen permiso.` : 'Son los de la lista que aún no tienen permiso.', aceptar: 'Permitir' }))) return;
        await enVarios(sin.map((s) => s.id), 'limit', 1, 'Con permiso para un proyecto');
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
                    <h2><UserPlus size={19} aria-hidden="true" /> Crear estudiantes</h2>
                    <div className="pro-modes" role="tablist" aria-label="Cómo crear">
                        <button type="button" role="tab" aria-selected={modo === 'uno'} onClick={() => setModo('uno')}>Uno</button>
                        <button type="button" role="tab" aria-selected={modo === 'lote'} onClick={() => setModo('lote')}>Por lotes</button>
                    </div>
                </div>
                <p className="adm-muted">Los estudiantes no se registran solos: tú creas su cuenta y decides si pueden crear proyectos.</p>
                {creadas && <Credenciales cuentas={creadas.cuentas} mail={creadas.mail} onCerrar={() => setCreadas(null)} />}
                <datalist id="prf-grupos">{grupos.map((g) => <option key={g} value={g} />)}</datalist>
                {modo === 'uno' && (
                    <form className="cue-form" onSubmit={crear}>
                        <label><span>Nombre completo</span><input className="input-field" required maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Ana Pérez Gómez" /></label>
                        <label><span>Correo (será su usuario)</span><input className="input-field" type="email" required maxLength={160} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ana@correo.edu.co" /></label>
                        <label><span>Grupo o curso (opcional)</span><input className="input-field" maxLength={60} list="prf-grupos" value={form.grupo} onChange={(e) => setForm({ ...form, grupo: e.target.value })} placeholder="Ej: Metodología 2026-2 A" /></label>
                        <label className="cue-check"><input type="checkbox" checked={form.permitir} onChange={(e) => setForm({ ...form, permitir: e.target.checked })} /> Puede crear su proyecto desde ya</label>
                        <button type="submit" className="pro-btn pro-btn--primary" disabled={busy}><UserPlus size={15} /> {busy ? 'Creando…' : 'Crear estudiante'}</button>
                    </form>
                )}
                {modo === 'lote' && (
                    <div className="cue-lote">
                        <p>Pega la lista o sube un archivo CSV (también sirve copiar y pegar desde Excel). Un estudiante por fila, en este orden: <b>nombre, correo, grupo</b>. El grupo es opcional. Máximo 150 filas por vez.</p>
                        <div className="cue-acciones">
                            <label className="pro-btn pro-btn--ghost cue-archivo"><Upload size={15} /> Subir archivo CSV<input type="file" accept=".csv,.txt,text/csv,text/plain" onChange={leerArchivo} /></label>
                            <button type="button" className="pro-link" onClick={() => descargar('plantilla-estudiantes.csv', csv([['nombre', 'correo', 'grupo'], ['Ana Pérez', 'ana.perez@correo.edu.co', 'Metodología 2026-2 A']]))}>Descargar plantilla</button>
                        </div>
                        <label className="cue-grupo-lote"><span>Grupo para toda la lista (opcional)</span><input className="input-field" maxLength={60} list="prf-grupos" value={grupoLote} onChange={(e) => setGrupoLote(e.target.value)} placeholder="Se pone a las filas que no traen grupo" /></label>
                        <label className="cue-check"><input type="checkbox" checked={form.permitir} onChange={(e) => setForm({ ...form, permitir: e.target.checked })} /> Pueden crear su proyecto desde ya</label>
                        <textarea className="textarea-field cue-texto" rows={6} value={lote} onChange={(e) => setLote(e.target.value)} placeholder={'Ana Pérez, ana.perez@correo.edu.co, Metodología 2026-2 A\nLuis Ruiz, luis.ruiz@correo.edu.co'} aria-label="Lista de estudiantes" />
                        {filas.length > 0 && (
                            <>
                                <p className="cue-resumen">
                                    <b>{validas.length}</b> {validas.length === 1 ? 'fila lista' : 'filas listas'} para crear
                                    {filas.length - validas.length > 0 && <> · <span className="cue-mal">{filas.length - validas.length} con errores (no se cargan)</span></>}
                                    {filas.length > 150 && <> · <span className="cue-mal">solo se cargan las primeras 150</span></>}
                                </p>
                                <div className="cue-tabla-wrap">
                                    <table className="cue-tabla">
                                        <thead><tr><th scope="col">#</th><th scope="col">Nombre</th><th scope="col">Correo</th><th scope="col">Grupo</th><th scope="col">Estado</th></tr></thead>
                                        <tbody>
                                            {filas.slice(0, 150).map((f, i) => (
                                                <tr key={i} data-mal={Boolean(f.error) || undefined}><td>{i + 1}</td><td>{f.name || '—'}</td><td>{f.email || '—'}</td><td>{f.group || grupoLote.trim() || '—'}</td><td>{f.error || 'Lista'}</td></tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <button type="button" className="pro-btn pro-btn--primary" disabled={busy || validas.length === 0} onClick={cargarLote}><Upload size={15} /> {busy ? 'Creando estudiantes…' : `Crear ${Math.min(150, validas.length)} ${validas.length === 1 ? 'estudiante' : 'estudiantes'}`}</button>
                            </>
                        )}
                    </div>
                )}
                {!mail && <p className="adm-muted">El servidor no tiene correo configurado: entrega tú la contraseña temporal a cada estudiante.</p>}
            </section>

            <SeccionesGrupo version={students.map((x) => `${x.id}:${x.grupo || ''}`).join('|')} onGrupos={setGruposCreados} students={students} onCrear={crearEnGrupo} onVer={verGrupoEnLista} onEstudiantes={setStudents} permitir={form.permitir} />

            <section className="pro-card cue" ref={listaRef}>
                <div className="cue-cabeza">
                    <h2><Users size={19} aria-hidden="true" /> Mis estudiantes ({students.length})</h2>
                    <button type="button" className="pro-btn pro-btn--ghost" onClick={load} disabled={loading}><RefreshCw size={15} /> Actualizar</button>
                </div>
                {students.length > 0 && (
                    <div className="adm-toolbar prf-filtros">
                        <div className="adm-search">
                            <Search size={16} aria-hidden="true" />
                            <input className="input-field" type="search" placeholder="Buscar por nombre o correo" aria-label="Buscar estudiantes" value={query} onChange={(e) => setQuery(e.target.value)} />
                        </div>
                        <Selector buscar etiqueta="Filtrar por grupo" value={fGrupo} onChange={setFGrupo} opciones={[{ value: '', label: 'Todos los grupos' }, { value: SIN_GRUPO, label: 'Sin grupo' }, ...grupos.map((g) => ({ value: g, label: g, nota: ((n) => `${n} ${n === 1 ? 'estudiante' : 'estudiantes'}`)(students.filter((x) => x.grupo === g).length) }))]} />
                        <button type="button" className="pro-btn pro-btn--ghost" disabled={busy || visibles.length === 0} onClick={permitirVisibles}>Permitir un proyecto a los que ves</button>
                        <span className="adm-muted">{visibles.length} de {students.length}</span>
                    </div>
                )}
                {students.length > 0 && (
                    <div className="prf-asociar" data-activa={marcados.length > 0 || undefined}>
                        <label className="prf-todos">
                            <input type="checkbox" checked={visibles.length > 0 && visibles.every((x) => marcados.includes(x.id))} onChange={(e) => setMarcados(e.target.checked ? [...new Set([...marcados, ...visibles.map((x) => x.id)])] : marcados.filter((id) => !visibles.some((x) => x.id === id)))} />
                            <span>{marcados.length > 0 ? `${marcados.length} ${marcados.length === 1 ? 'marcado' : 'marcados'}` : 'Marcar los que ves'}</span>
                        </label>
                        <label className="prf-destino">
                            <span>Asociar al grupo</span>
                            <select className="input-field" value={grupoDestino} onChange={(e) => setGrupoDestino(e.target.value)} aria-label="Grupo al que se asocian los estudiantes marcados">
                                <option value="">Sin grupo</option>
                                {grupos.map((g) => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </label>
                        <button type="button" className="pro-btn pro-btn--primary adm-sm" disabled={busy || marcados.length === 0} onClick={async () => { await enVarios(marcados, 'group', grupoDestino, grupoDestino ? `En el grupo «${grupoDestino}»` : 'Sin grupo'); setMarcados([]); }}>Asociar</button>
                        {grupos.length === 0 && <small className="adm-muted">Crea primero un grupo arriba.</small>}
                    </div>
                )}
                {loading && students.length === 0 && <p className="adm-muted">Cargando…</p>}
                {!loading && students.length > 0 && visibles.length === 0 && <p className="adm-muted">Ningún estudiante coincide. Prueba con otro nombre o quita el filtro de grupo.</p>}
                {!loading && students.length === 0 && <p className="adm-muted">Todavía no tienes estudiantes a tu cargo. Crea el primero arriba.</p>}
                <div className="prf-lista">
                    {visibles.map((s) => (
                        <article className="prf-estudiante" key={s.id}>
                            <header>
                                <input type="checkbox" className="prf-marca" checked={marcados.includes(s.id)} onChange={() => alternarMarcado(s.id)} aria-label={`Marcar a ${s.name}`} />
                                <div>
                                    <b>{s.name}</b>
                                    <small>{s.email} · Último ingreso: {formatDate(s.lastLoginAt)}{s.mustChangePassword ? ' · aún no cambia su contraseña temporal' : ''}{s.status === 'blocked' ? ' · cuenta bloqueada' : ''}</small>
                                </div>
                                <button type="button" className="pro-btn pro-btn--ghost adm-sm" disabled={busy} onClick={() => nuevoAcceso(s)}><KeyRound size={15} /> Contraseña nueva</button>
                            </header>
                            <div className="prf-permiso">
                                <span className="prf-etiqueta" data-ok={s.projectLimit > 0 || undefined}>{s.projectLimit > 0 ? 'Puede crear su proyecto' : 'No puede crear su proyecto'}</span>
                                {/* Un estudiante construye un solo proyecto: el permiso es sí o no. */}
                                {cupoMaximo <= 1
                                    ? <button type="button" className="pro-btn pro-btn--ghost adm-sm" disabled={busy} onClick={() => cambiarCupo(s, s.projectLimit > 0 ? 0 : 1)}>{s.projectLimit > 0 ? 'Quitar el permiso' : 'Permitir su proyecto'}</button>
                                    : (
                                        <span className="adm-cupo" data-cero={s.projectLimit === 0}>
                                            <button type="button" disabled={busy || s.projectLimit <= 0} onClick={() => cambiarCupo(s, s.projectLimit - 1)} aria-label={`Permitir un proyecto menos a ${s.name}`}>−</button>
                                            <b>{s.projectLimit}</b>
                                            <button type="button" disabled={busy || s.projectLimit >= cupoMaximo} onClick={() => cambiarCupo(s, s.projectLimit + 1)} aria-label={`Permitir un proyecto más a ${s.name}`}>+</button>
                                        </span>
                                    )}
                                <span className="adm-muted">{s.projects.length === 0 ? 'Aún no lo ha creado.' : s.projects.length === 1 ? 'Ya lo creó.' : `Tiene ${s.projects.length} proyectos.`}</span>
                                {grupoPara?.id === s.id ? (
                                    <form className="prf-grupo" onSubmit={(e) => { e.preventDefault(); enVarios([s.id], 'group', grupoPara.valor.trim(), grupoPara.valor.trim() ? `En el grupo «${grupoPara.valor.trim()}»` : 'Sin grupo'); }}>
                                        <input className="input-field" maxLength={60} list="prf-grupos" value={grupoPara.valor} onChange={(e) => setGrupoPara({ id: s.id, valor: e.target.value })} placeholder="Sin grupo" aria-label={`Grupo de ${s.name}`} autoFocus onKeyDown={(e) => { if (e.key === 'Escape') setGrupoPara(null); }} />
                                        <button type="submit" className="pro-btn pro-btn--primary adm-sm" disabled={busy}>Guardar</button>
                                        <button type="button" className="pro-btn pro-btn--ghost adm-sm" onClick={() => setGrupoPara(null)}>Cancelar</button>
                                    </form>
                                ) : (
                                    <button type="button" className="prf-grupo-chip" data-vacio={!s.grupo || undefined} disabled={busy} onClick={() => setGrupoPara({ id: s.id, valor: s.grupo || '' })} title="Cambiar el grupo">{s.grupo || 'Sin grupo'}</button>
                                )}
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
