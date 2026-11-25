import React, { useCallback, useEffect, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, CircleSlash, Gauge, GraduationCap, HelpCircle, History, Loader2, PlugZap, Plus, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { avisar, confirmar } from './Avisos';

/*
 * Tres bloques de la administración:
 *  - GruposProfesor (pestaña Grupos): el profesor a cargo de cada grupo, con su historial, y la cuota de IA del grupo.
 *  - CuotaIA (pestaña Uso): la cuota general, quién la está gastando hoy y cómo ampliarla.
 *  - ServiciosExternos (pestaña Sistema): IA, artículos, normas y correo, con el último error y el uso del día.
 */

const cuando = (ms) => (ms ? new Date(ms).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');
const dia = (ms) => (ms ? new Date(ms).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

// Campo de número que se guarda al salir o con Enter; vacío = heredar.
const CampoCuota = ({ valor, heredada, onGuardar, etiqueta, disabled }) => {
    const [texto, setTexto] = useState(valor ?? '');
    useEffect(() => { setTexto(valor ?? ''); }, [valor]);
    const guardar = () => { const limpio = String(texto).trim(); if (limpio !== String(valor ?? '')) onGuardar(limpio === '' ? null : Number(limpio)); };
    return (
        <input className="input-field adm-cuota-campo" type="number" min="0" max="5000" inputMode="numeric" value={texto} placeholder={String(heredada)} aria-label={etiqueta} disabled={disabled}
            onChange={(e) => setTexto(e.target.value)} onBlur={guardar} onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); if (e.key === 'Escape') setTexto(valor ?? ''); }} />
    );
};

/* ---------- Grupos: profesor a cargo y cuota de IA ---------- */

export const GruposProfesor = ({ profesores, version, onCambio }) => {
    const [datos, setDatos] = useState(null);
    const [busy, setBusy] = useState(false);
    const cargar = useCallback(() => api.admin.groups().then(setDatos).catch((err) => avisar(err.message, 'error')), []);
    useEffect(() => { cargar(); }, [cargar, version]);

    const ponerProfesor = async (g, valor) => {
        const prof = profesores.find((p) => String(p.id) === String(valor));
        const texto = prof ? (g.teacherId ? `¿Cambiar el profesor de «${g.name}» a ${prof.name}?` : `¿Poner a ${prof.name} a cargo de «${g.name}»?`) : `¿Dejar «${g.name}» sin profesor?`;
        const detalle = prof
            ? `${plural(g.estudiantes, 'estudiante pasa', 'estudiantes pasan')} a su cargo${g.teacherId ? ` y ${g.teacherName} deja de verlos` : ''}. Los proyectos no cambian${g.teacherId ? '; queda anotado quién tuvo el grupo y hasta cuándo' : ''}.`
            : `${plural(g.estudiantes, 'estudiante queda', 'estudiantes quedan')} sin profesor a cargo. Los proyectos no cambian.`;
        if (!(await confirmar({ texto, detalle, aceptar: prof ? 'Asignar' : 'Quitar' }))) return;
        setBusy(true);
        try {
            const r = await api.admin.groupTeacher(g.name, prof ? prof.id : null);
            avisar(prof ? `${prof.name} quedó a cargo de «${g.name}» (${plural(r.estudiantes, 'estudiante', 'estudiantes')}).` : `«${g.name}» quedó sin profesor.`);
            await cargar();
            onCambio?.();
        } catch (err) { avisar(err.message, 'error'); } finally { setBusy(false); }
    };
    const ponerCuota = async (g, limite) => {
        setBusy(true);
        try {
            await api.admin.groupAiLimit(g.name, limite);
            avisar(limite === null ? `«${g.name}» vuelve a la cuota general de IA.` : `«${g.name}»: ${plural(limite, 'solicitud', 'solicitudes')} de IA por día para cada cuenta.`);
            await cargar();
        } catch (err) { avisar(err.message, 'error'); await cargar(); } finally { setBusy(false); }
    };

    return (
        <section className="pro-card adm-panel">
            <div className="adm-bitacora-cabeza">
                <h2><GraduationCap size={18} aria-hidden="true" /> Profesor y cuota de IA de cada grupo</h2>
                <p className="adm-muted">Al asignar un profesor, todos los estudiantes del grupo pasan a su cargo, y los que entren después también. Si lo cambias, los proyectos siguen igual y queda el historial de quién tuvo el grupo. La cuota de IA es por cuenta y por día; vacía usa la general{datos ? ` (${datos.iaGeneral})` : ''}.</p>
            </div>
            <div className="adm-table-wrap">
                <table className="adm-table adm-table--grupos">
                    <thead><tr><th scope="col">Grupo</th><th scope="col" className="adm-num">Estudiantes</th><th scope="col">Profesor a cargo</th><th scope="col">IA por día</th><th scope="col">Historial</th></tr></thead>
                    <tbody>
                        {datos === null && <tr><td colSpan={5} className="adm-muted">Cargando…</td></tr>}
                        {datos?.groups.length === 0 && <tr><td colSpan={5} className="adm-empty"><b>Todavía no hay grupos</b><span>Pon las cuentas en un grupo para poder asignarle un profesor.</span></td></tr>}
                        {datos?.groups.map((g) => (
                            <tr key={g.name}>
                                <td><b>{g.name}</b></td>
                                <td className="adm-num">{g.estudiantes}</td>
                                <td>
                                    <select className="input-field adm-grupo-prof" value={g.teacherId || ''} disabled={busy} aria-label={`Profesor a cargo de ${g.name}`} onChange={(e) => ponerProfesor(g, e.target.value)}>
                                        <option value="">Sin profesor</option>
                                        {profesores.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </td>
                                <td><CampoCuota valor={g.aiLimit} heredada={datos.iaGeneral} etiqueta={`Solicitudes de IA por día en ${g.name}`} disabled={busy} onGuardar={(v) => ponerCuota(g, v)} /></td>
                                <td>
                                    {g.historial.length === 0 ? <span className="adm-muted">—</span> : (
                                        <details className="adm-historial">
                                            <summary><History size={14} aria-hidden="true" /> {plural(g.historial.length, 'profesor', 'profesores')}</summary>
                                            <ul>{g.historial.map((h, i) => <li key={i}><b>{h.teacher}</b> <span>{dia(h.desde)} – {h.hasta ? dia(h.hasta) : 'hoy'}</span>{h.actor && <small>lo asignó {h.actor}</small>}</li>)}</ul>
                                        </details>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

/* ---------- Uso: cuota de IA ---------- */

const ORIGEN = { cuenta: 'propia', grupo: 'del grupo', general: 'general' };

export const CuotaIA = ({ onVerUsuario }) => {
    const [q, setQ] = useState(null);
    const [busy, setBusy] = useState(false);
    const cargar = useCallback(() => api.admin.aiQuota().then(setQ).catch((err) => avisar(err.message, 'error')), []);
    useEffect(() => { cargar(); }, [cargar]);
    const hacer = async (fn, mensaje) => {
        setBusy(true);
        try { await fn(); avisar(mensaje); } catch (err) { avisar(err.message, 'error'); } finally { await cargar(); setBusy(false); }
    };
    const general = (v) => { if (v !== null) hacer(() => api.admin.aiQuotaGeneral(v), `Cuota general: ${plural(v, 'solicitud', 'solicitudes')} de IA por día para cada cuenta.`); else cargar(); };
    const propia = (c, v) => hacer(() => api.admin.userAi(c.id, { limit: v }), v === null ? `${c.name} vuelve a la cuota ${c.grupo ? 'de su grupo o la general' : 'general'}.` : `${c.name}: ${plural(v, 'solicitud', 'solicitudes')} de IA por día.`);
    const ampliar = (c, mas) => hacer(() => api.admin.userAi(c.id, { extra: c.extra + mas }), `${c.name} tiene ${mas} solicitudes más por hoy.`);

    return (
        <section className="pro-card adm-panel">
            <div className="adm-papelera-cabeza adm-bitacora-cabeza">
                <div>
                    <h2><Gauge size={18} aria-hidden="true" /> Cuota de IA</h2>
                    <p className="adm-muted">Cuántas solicitudes de IA puede hacer cada cuenta por día. Vale la cuota propia de la cuenta; si no tiene, la de su grupo (se pone en Grupos); si no, la general. Se renueva cada día a medianoche, hora de Colombia. El administrador no tiene cuota.</p>
                </div>
                <label className="adm-cuota-general"><span>General, por cuenta y día</span>
                    {q && <CampoCuota valor={q.general} heredada={q.general} etiqueta="Cuota general de IA por día" disabled={busy} onGuardar={general} />}
                </label>
            </div>
            {q === null && <p className="adm-muted">Cargando…</p>}
            {q && (
                <>
                    <dl className="adm-cuota-resumen">
                        <div><dt>Solicitudes hoy</dt><dd>{q.solicitudesHoy}</dd></div>
                        <div data-alerta={q.agotaron > 0 || undefined}><dt>Agotaron la cuota</dt><dd>{q.agotaron}</dd></div>
                        <div><dt>Cerca del límite</dt><dd>{q.cerca}</dd></div>
                    </dl>
                    <div className="adm-table-wrap">
                        <table className="adm-table adm-table--grupos">
                            <thead><tr><th scope="col">Cuenta</th><th scope="col">Uso de hoy</th><th scope="col">Cuota por día</th><th scope="col">Ampliar solo hoy</th></tr></thead>
                            <tbody>
                                {q.cuentas.length === 0 && <tr><td colSpan={4} className="adm-empty"><b>Nadie ha usado la IA hoy</b><span>Aquí aparecen las cuentas que la usen hoy y las que tengan una cuota propia.</span></td></tr>}
                                {q.cuentas.map((c) => {
                                    const pct = c.tope > 0 ? Math.min(100, Math.round((c.usadas / c.tope) * 100)) : 100;
                                    const estado = c.tope === 0 ? 'sin' : c.usadas >= c.tope ? 'agotada' : pct >= 80 ? 'cerca' : 'bien';
                                    return (
                                        <tr key={c.id}>
                                            <td><button type="button" className="adm-user-link" onClick={() => onVerUsuario?.(c.id)}><b>{c.name}</b><small>{c.email}{c.grupo ? ` · ${c.grupo}` : ''}</small></button></td>
                                            <td>
                                                <div className="adm-cuota-uso" data-estado={estado}>
                                                    <span className="adm-cuota-barra" aria-hidden="true"><i style={{ width: `${pct}%` }} /></span>
                                                    <b>{c.usadas} de {c.tope}</b>
                                                    {estado === 'agotada' && <small>agotada</small>}
                                                    {estado === 'sin' && <small>sin IA</small>}
                                                    {c.extra > 0 && <small>incluye {c.extra} de hoy</small>}
                                                </div>
                                            </td>
                                            <td><span className="adm-cuota-celda"><CampoCuota valor={c.propia} heredada={c.limite} etiqueta={`Cuota propia de ${c.name}`} disabled={busy} onGuardar={(v) => propia(c, v)} /><small className="adm-muted">{ORIGEN[c.origen]}</small></span></td>
                                            <td><span className="adm-cuota-celda">
                                                {[20, 50].map((n) => <button key={n} type="button" className="pro-btn pro-btn--ghost adm-sm" disabled={busy} onClick={() => ampliar(c, n)} aria-label={`Dar ${n} solicitudes más hoy a ${c.name}`}><Plus size={13} /> {n}</button>)}
                                            </span></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {q.grupos.length > 0 && (
                        <p className="adm-muted adm-cuota-grupos"><b>Por grupo, hoy:</b> {q.grupos.map((g) => `${g.grupo}: ${plural(g.usadas, 'solicitud', 'solicitudes')}${g.agotaron ? `, ${plural(g.agotaron, 'cuenta la agotó', 'cuentas la agotaron')}` : ''}${g.limite != null ? ` (cuota ${g.limite})` : ''}`).join(' · ')}</p>
                    )}
                </>
            )}
        </section>
    );
};

/* ---------- Sistema: servicios externos ---------- */

const ESTADO = {
    bien: { texto: 'Funciona', Icono: CheckCircle2 },
    falla: { texto: 'Con fallas', Icono: AlertTriangle },
    sin_datos: { texto: 'Sin uso todavía', Icono: HelpCircle },
    sin_configurar: { texto: 'Sin configurar', Icono: CircleSlash },
};

export const ServiciosExternos = () => {
    const [lista, setLista] = useState(null);
    const [probando, setProbando] = useState('');
    const cargar = useCallback(() => api.admin.services().then((r) => setLista(r.servicios)).catch((err) => avisar(err.message, 'error')), []);
    useEffect(() => { cargar(); }, [cargar]);
    const probar = async (s) => {
        setProbando(s.id);
        try {
            const r = await api.admin.testService(s.id);
            setLista((prev) => prev.map((x) => (x.id === s.id ? r.servicio : x)));
            avisar(r.servicio.estado === 'bien' ? `${s.nombre}: respondió bien.` : `${s.nombre}: ${r.servicio.error || 'no respondió'}.`, r.servicio.estado === 'bien' ? 'ok' : 'error');
        } catch (err) { avisar(err.message, 'error'); } finally { setProbando(''); }
    };
    const fallando = (lista || []).filter((s) => s.estado === 'falla').length;

    return (
        <section className="pro-card adm-panel">
            <div className="adm-papelera-cabeza adm-bitacora-cabeza">
                <div>
                    <h2><PlugZap size={18} aria-hidden="true" /> Servicios externos</h2>
                    <p className="adm-muted">De qué depende la plataforma fuera del servidor. El estado sale del uso real de las cuentas (la última vez que cada servicio respondió) y de «Probar», que hace una consulta mínima sin gastar la cuota. {lista && (fallando ? `${plural(fallando, 'servicio está', 'servicios están')} fallando.` : 'Ninguno está fallando.')}</p>
                </div>
                <button type="button" className="pro-btn pro-btn--ghost adm-sm" onClick={cargar}><RefreshCw size={14} /> Actualizar</button>
            </div>
            {lista === null && <p className="adm-muted">Cargando…</p>}
            {lista && (
                <ul className="adm-servicios">
                    {lista.map((s) => {
                        const { texto, Icono } = ESTADO[s.estado] || ESTADO.sin_datos;
                        return (
                            <li key={s.id} data-estado={s.estado}>
                                <div className="adm-servicio-cabeza">
                                    <b>{s.nombre}</b>
                                    <span className="adm-servicio-estado"><Icono size={14} aria-hidden="true" /> {texto}{s.estado === 'falla' && s.fallos > 1 ? ` (${s.fallos} seguidas)` : ''}</span>
                                </div>
                                <small className="adm-muted">{s.proveedor}{s.detalle ? ` · ${s.detalle}` : ''}</small>
                                <dl>
                                    <div><dt>Hoy</dt><dd>{plural(s.hoy, s.id === 'correo' ? 'correo' : 'consulta', s.id === 'correo' ? 'correos' : 'consultas')}</dd></div>
                                    <div><dt>Última respuesta</dt><dd>{s.okAt ? cuando(s.okAt) : '—'}</dd></div>
                                </dl>
                                {s.error && s.errAt && <p className="adm-servicio-error" data-vigente={s.estado === 'falla' || undefined}><Activity size={13} aria-hidden="true" /> {s.estado === 'falla' ? 'Último error' : 'Error anterior'} ({cuando(s.errAt)}): {s.error}</p>}
                                {s.probar && <button type="button" className="pro-btn pro-btn--ghost adm-sm" disabled={Boolean(probando)} onClick={() => probar(s)}>{probando === s.id ? <Loader2 size={14} className="adm-gira" /> : <PlugZap size={14} />} {probando === s.id ? 'Probando…' : 'Probar'}</button>}
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
};
