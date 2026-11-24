import React, { useCallback, useEffect, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, DatabaseBackup, Download, RefreshCw, Trash2 } from 'lucide-react';
import { api } from '../services/api';

/* Estado del sistema para el administrador: copias de seguridad, IA, correo y errores recientes. */

const fecha = (ms) => (ms ? new Date(ms).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');
const peso = (bytes) => (bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);
const TIPO = { navegador: 'Navegador', servidor: 'Servidor', ia: 'IA', backup: 'Copia', correo: 'Correo', buscar: 'Búsqueda' };

const AdminEstado = () => {
    const [estado, setEstado] = useState(null);
    const [abierto, setAbierto] = useState(false);
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

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
        setMsg('');
        setError('');
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
    const limpiar = async () => {
        try { await api.admin.clearErrors(); setEstado((prev) => ({ ...prev, errors: [] })); } catch (err) { setError(err.message); }
    };

    return (
        <section className="pro-card adm-estado">
            <button type="button" className="adm-estado-head" onClick={() => setAbierto(!abierto)} aria-expanded={abierto}>
                <Activity size={18} aria-hidden="true" />
                <b>Estado del sistema</b>
                <span data-ok={copiaHoy}>{copiaHoy ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />} Copia de hoy</span>
                <span data-ok={iaBien}>{iaBien ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />} IA</span>
                <span data-ok={estado.mail}>{estado.mail ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />} Correo</span>
                <span data-ok={estado.errors.length === 0}>{estado.errors.length === 0 ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />} {estado.errors.length} errores</span>
            </button>
            {abierto && (
                <div className="adm-estado-body">
                    <div>
                        <h3><DatabaseBackup size={16} aria-hidden="true" /> Copias de seguridad</h3>
                        <p className="adm-muted">Se crea una copia completa cada día y se conservan las últimas 30 en el servidor.{estado.backupEmail ? ` Cada copia también se envía como adjunto a ${estado.backupEmail}, para tenerla fuera del servidor.` : ' El correo no está configurado: descarga una copia de vez en cuando para tenerla fuera del servidor.'}</p>
                        <div className="adm-estado-acciones">
                            <button type="button" className="pro-btn pro-btn--ghost" onClick={copiar} disabled={busy}><RefreshCw size={15} /> {busy ? 'Creando…' : 'Crear una copia ahora'}</button>
                        </div>
                        <ul className="adm-backups">
                            {estado.backups.slice(0, 8).map((b) => (
                                <li key={b.name}><span>{b.name.slice(11, 21)}</span><small>{peso(b.size)}</small><a className="pro-link" href={api.admin.backupUrl(b.name)} download><Download size={14} /> Descargar</a></li>
                            ))}
                            {estado.backups.length === 0 && <li><small>Todavía no hay copias; la primera se crea un minuto después de iniciar el servidor.</small></li>}
                        </ul>
                    </div>
                    <div>
                        <h3><Activity size={16} aria-hidden="true" /> Servicios</h3>
                        <p className="adm-muted">Servidor activo desde {fecha(estado.startedAt)}. IA: {estado.ai.configured ? (estado.ai.fails ? `${estado.ai.fails} fallos seguidos (${estado.ai.lastError})` : `funcionando${estado.ai.lastOk ? `, última respuesta ${fecha(estado.ai.lastOk)}` : ''}`) : 'sin configurar'}. Si el sitio o la IA fallan, llega un aviso por correo.</p>
                        <h3><AlertTriangle size={16} aria-hidden="true" /> Errores recientes {estado.errors.length > 0 && <button type="button" className="pro-link" onClick={limpiar}><Trash2 size={13} /> Limpiar</button>}</h3>
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
            {msg && <p className="pro-notice" role="status">{msg}</p>}
            {error && <p className="pro-alert" role="alert">{error}</p>}
        </section>
    );
};

export default AdminEstado;
