import React, { useCallback, useEffect, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, DatabaseBackup, Download, RefreshCw, RotateCcw, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { avisar, confirmar } from './Avisos';

/* Estado del sistema para el administrador: copias de seguridad, IA, correo y errores recientes. */

const fecha = (ms) => (ms ? new Date(ms).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');
const peso = (bytes) => (bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);
const TIPO = { navegador: 'Navegador', servidor: 'Servidor', ia: 'IA', backup: 'Copia', correo: 'Correo', buscar: 'Búsqueda' };

const AdminEstado = ({ fijo = false, onRestaurada }) => {
    const [estado, setEstado] = useState(null);
    const [desplegado, setAbierto] = useState(false);
    const abierto = fijo || desplegado; // en la pestaña «Sistema» se muestra siempre completo
    const [busy, setBusy] = useState(false);
    const [restaurar, setRestaurar] = useState(null); // { name, palabra, clave } de la copia que se va a restaurar
    const setMsg = (texto) => avisar(texto);
    const setError = (texto) => avisar(texto, 'error');

    const cargar = useCallback(async () => {
        try { setEstado(await api.admin.estado()); } catch (err) { setError(err.message); }
    }, []);
    useEffect(() => { cargar(); }, [cargar]);

    if (!estado) return null;
    const hoy = new Date().toISOString().slice(0, 10);
    const copiaHoy = estado.backups.some((b) => b.name.includes(hoy));
    const iaBien = estado.ai.configured && estado.ai.fails < 3;
    const copiar = async () => {
        setBusy(true);
        try {
            const r = await api.admin.backupNow();
            setEstado((prev) => ({ ...prev, backups: r.backups }));
            setMsg('Copia creada.');
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };
    const restaurarCopia = async (event) => {
        event.preventDefault();
        setBusy(true);
        try {
            const r = await api.admin.restoreBackup(restaurar.name, restaurar.clave);
            setEstado((prev) => ({ ...prev, backups: r.backups, safety: r.safety }));
            setRestaurar(null);
            avisar(`Copia restaurada: ${r.usuarios} cuentas y ${r.proyectos} proyectos. El estado anterior quedó guardado, por si hay que volver.`);
            onRestaurada?.();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };
    // Las copias diarias llevan el día; las «de antes de restaurar», la hora exacta (guardada en UTC: se muestra en hora local).
    const fechaCopia = (name) => {
        if (!name.includes('antes-de-restaurar')) return name.slice(11, 21);
        const m = name.match(/(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})/);
        const d = m ? new Date(`${m[1]}T${m[2]}:${m[3]}:${m[4]}Z`) : null;
        return d && !Number.isNaN(d.getTime()) ? d.toLocaleString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : name;
    };
    const filaCopia = (b) => (
        <li key={b.name}>
            <span>{fechaCopia(b.name)}</span><small>{peso(b.size)}</small>
            <a className="pro-link" href={api.admin.backupUrl(b.name)} download><Download size={14} /> Descargar</a>
            <button type="button" className="pro-link" disabled={busy} onClick={() => setRestaurar({ name: b.name, palabra: '', clave: '' })}><RotateCcw size={14} /> Restaurar</button>
        </li>
    );
    const limpiar = async () => {
        if (!(await confirmar({ texto: '¿Borrar el registro de errores?', detalle: 'Solo se borra la lista; no afecta a los proyectos.', aceptar: 'Borrar', peligro: true }))) return;
        try { await api.admin.clearErrors(); setEstado((prev) => ({ ...prev, errors: [] })); } catch (err) { setError(err.message); }
    };

    return (
        <section className="pro-card adm-estado" data-fijo={fijo || undefined}>
            <button type="button" className="adm-estado-head" onClick={() => setAbierto(!abierto)} aria-expanded={abierto} disabled={fijo}>
                <Activity size={18} aria-hidden="true" />
                <b>Estado del sistema</b>
                <span data-ok={copiaHoy}>{copiaHoy ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />} Copia de hoy</span>
                <span data-ok={iaBien}>{iaBien ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />} IA</span>
                <span data-ok={estado.mail}>{estado.mail ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />} Correo</span>
                <span data-ok={estado.errors.length === 0}>{estado.errors.length === 0 ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />} {estado.errors.length === 0 ? 'Sin errores' : estado.errors.length === 1 ? '1 error' : `${estado.errors.length} errores`}</span>
            </button>
            {abierto && (
                <div className="adm-estado-body">
                    <div>
                        <h3><DatabaseBackup size={16} aria-hidden="true" /> Copias de seguridad</h3>
                        <p className="adm-muted">Se crea una copia completa cada día y se conservan las últimas 30 en el servidor. No se envían por correo: descarga una de vez en cuando para tenerla también fuera del servidor.</p>
                        <div className="adm-estado-acciones">
                            <button type="button" className="pro-btn pro-btn--ghost" onClick={copiar} disabled={busy}><RefreshCw size={15} /> {busy ? 'Creando…' : 'Crear una copia ahora'}</button>
                        </div>
                        {restaurar && (
                            <form className="adm-restaurar" onSubmit={restaurarCopia}>
                                <b><AlertTriangle size={16} aria-hidden="true" /> Restaurar la copia del {fechaCopia(restaurar.name)}</b>
                                <p>Las cuentas, los proyectos, las figuras y las encuestas vuelven a como estaban en esa copia: <strong>se pierde todo lo hecho después</strong>. Antes se guarda el estado actual en una copia aparte, para poder deshacerlo.</p>
                                <label><span>Escribe RESTAURAR</span><input className="input-field" value={restaurar.palabra} onChange={(e) => setRestaurar({ ...restaurar, palabra: e.target.value })} autoComplete="off" spellCheck={false} autoFocus /></label>
                                <label><span>Tu contraseña de administrador</span><input className="input-field" type="password" value={restaurar.clave} onChange={(e) => setRestaurar({ ...restaurar, clave: e.target.value })} autoComplete="current-password" /></label>
                                <div>
                                    <button type="submit" className="pro-btn pro-btn--danger adm-sm" disabled={busy || restaurar.palabra !== 'RESTAURAR' || !restaurar.clave}>{busy ? 'Restaurando…' : 'Restaurar esta copia'}</button>
                                    <button type="button" className="pro-btn pro-btn--ghost adm-sm" disabled={busy} onClick={() => setRestaurar(null)}>Cancelar</button>
                                </div>
                            </form>
                        )}
                        <ul className="adm-backups">
                            {estado.backups.slice(0, 8).map(filaCopia)}
                            {estado.backups.length === 0 && <li><small>Todavía no hay copias; la primera se crea un minuto después de iniciar el servidor.</small></li>}
                        </ul>
                        {estado.safety?.length > 0 && (
                            <>
                                <h3><RotateCcw size={16} aria-hidden="true" /> Estados guardados antes de restaurar</h3>
                                <p className="adm-muted">Cada vez que restauras una copia se guarda cómo estaba todo justo antes. Sirven para deshacer una restauración. Se conservan las últimas 5.</p>
                                <ul className="adm-backups">{estado.safety.map(filaCopia)}</ul>
                            </>
                        )}
                    </div>
                    <div>
                        <h3><Activity size={16} aria-hidden="true" /> Servicios</h3>
                        <p className="adm-muted">Servidor activo desde {fecha(estado.startedAt)}. IA: {estado.ai.configured ? (estado.ai.fails ? `${estado.ai.fails} fallos seguidos (${estado.ai.lastError})` : `funcionando${estado.ai.lastOk ? `, última respuesta ${fecha(estado.ai.lastOk)}` : ''}`) : 'sin configurar'}. {estado.mail ? 'Si el sitio o la IA fallan, llega un aviso por correo.' : 'Sin correo configurado no llegan avisos de fallas: revisa esta página.'}</p>
                        <h3><AlertTriangle size={16} aria-hidden="true" /> Errores recientes {estado.errors.length > 0 && <button type="button" className="pro-link" onClick={limpiar}><Trash2 size={13} /> Borrar registro</button>}</h3>
                        {estado.errors.length === 0 ? <p className="adm-muted">Sin errores registrados.</p> : (
                            <ul className="adm-errores">
                                {estado.errors.slice(0, 20).map((e) => (
                                    <li key={e.id}>
                                        <details>
                                            <summary><b>{TIPO[e.kind] || e.kind}</b> {e.message} <small>{fecha(e.createdAt)}{e.user ? ` · ${e.user}` : ''}</small></summary>
                                            <pre>{e.detail}</pre>
                                        </details>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};

export default AdminEstado;
