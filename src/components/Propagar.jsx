import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, GitCompareArrows, RefreshCw } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { api } from '../services/api';
import { cambiosDetectados, fotoActual, reemplazosDe, seccionesAfectadas } from '../services/propagar';
import { avisar } from './Avisos';

/*
 * Propagar los cambios (en Mi proyecto): si el estudiante cambió el título o la pregunta, muestra qué términos
 * cambiaron, qué secciones siguen usando los anteriores y cómo quedaría cada una, lado a lado. Él decide cuáles
 * actualizar. Antes de aplicar se guarda una copia en el historial.
 */

const Propagar = () => {
    const { user, project, data, setField, flush } = useProject();
    const cambios = useMemo(() => cambiosDetectados(data), [data]);
    const [pares, setPares] = useState(null); // reemplazos editables; null = se toman los detectados
    const [busy, setBusy] = useState(false);

    // La primera vez (o tras un proyecto recién creado) se toma una foto del título y la pregunta: a partir de ahí
    // se nota cuándo cambian.
    const sinFoto = !data.propagado && Boolean(fotoActual(data).titulo || fotoActual(data).pregunta);
    useEffect(() => { if (user && project.id && sinFoto) setField('propagado', fotoActual(data)); }, [user, project.id, sinFoto]); // eslint-disable-line react-hooks/exhaustive-deps

    const firma = cambios.map((c) => `${c.id}:${c.ahora}`).join('|');
    useEffect(() => { setPares(null); }, [firma]);
    const detectados = useMemo(() => cambios.flatMap((c) => reemplazosDe(c.antes, c.ahora)).filter((p, i, todos) => todos.findIndex((x) => x.antes.toLowerCase() === p.antes.toLowerCase()) === i).map((p) => ({ ...p, usar: true })), [firma]); // eslint-disable-line react-hooks/exhaustive-deps
    const lista = pares || detectados;
    const activos = lista.filter((p) => p.usar && p.antes.trim() && p.despues.trim());
    const afectadas = useMemo(() => seccionesAfectadas(data, activos, cambios.map((c) => c.id)), [data, JSON.stringify(activos), firma]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!user || !project.id || cambios.length === 0) return null;

    const alDia = () => { setField('propagado', fotoActual(data)); avisar('Listo: el proyecto quedó marcado como al día con el título y la pregunta actuales.'); };
    const aplicar = async (secciones) => {
        setBusy(true);
        try {
            await flush();
            await api.saveVersion(project.id); // copia de lo que había, por si hay que volver
            secciones.forEach((s) => Object.entries(s.valores).forEach(([k, v]) => setField(k, v)));
            const quedan = afectadas.length - secciones.length;
            if (quedan === 0) setField('propagado', fotoActual(data));
            avisar(`${secciones.length === 1 ? `Se actualizó «${secciones[0].label}»` : `Se actualizaron ${secciones.length} secciones`}. Lo anterior quedó como una copia en el historial.`);
        } catch (err) {
            avisar(err.message || 'No se pudieron aplicar los cambios.', 'error');
        } finally {
            setBusy(false);
        }
    };
    const editar = (i, patch) => setPares(lista.map((p, k) => (k === i ? { ...p, ...patch } : p)));

    return (
        <section className="pro-card prg" aria-label="Cambios por propagar">
            <div className="prg-cabeza">
                <h2><GitCompareArrows size={19} aria-hidden="true" /> Cambiaste {cambios.map((c) => c.nombre).join(' y ')}</h2>
                <button type="button" className="pro-btn pro-btn--ghost" disabled={busy} onClick={alDia} title="No cambia nada: solo deja de avisar hasta el próximo cambio"><CheckCircle2 size={15} /> Ya está todo al día</button>
            </div>
            {cambios.map((c) => (
                <p key={c.id} className="prg-cambio"><span>{c.antes}</span><ArrowRight size={15} aria-hidden="true" /><b>{c.ahora}</b></p>
            ))}

            {lista.length === 0 ? (
                <p className="adm-muted">No se reemplazó un término por otro (solo se agregó o se quitó texto), así que no hay nada que llevar automáticamente a las demás secciones. Revísalas con la coherencia de abajo y, cuando estén bien, marca el proyecto como al día.</p>
            ) : (
                <>
                    <p className="adm-muted">Estos términos cambiaron. Las demás secciones todavía usan los anteriores; elige cuáles llevar al resto del proyecto (puedes corregirlos).</p>
                    <ul className="prg-pares">
                        {lista.map((p, i) => (
                            <li key={i}>
                                <input type="checkbox" checked={p.usar} onChange={(e) => editar(i, { usar: e.target.checked })} aria-label={`Usar el cambio de ${p.antes} a ${p.despues}`} />
                                <input className="input-field" value={p.antes} onChange={(e) => editar(i, { antes: e.target.value })} aria-label="Término anterior" />
                                <ArrowRight size={15} aria-hidden="true" />
                                <input className="input-field" value={p.despues} onChange={(e) => editar(i, { despues: e.target.value })} aria-label="Término nuevo" />
                            </li>
                        ))}
                    </ul>
                    {afectadas.length === 0 ? (
                        <p className="adm-muted">Ninguna otra sección usa los términos anteriores: no hay nada que actualizar.</p>
                    ) : (
                        <>
                            <p className="prg-cuenta"><b>{afectadas.length === 1 ? 'Una sección quedó desactualizada' : `${afectadas.length} secciones quedaron desactualizadas`}.</b> Ábrelas para ver cómo quedarían.</p>
                            {afectadas.map((s) => {
                                return (
                                    <details key={s.id} className="prg-seccion">
                                        <summary>
                                            <span>{s.label} <small>{s.cambiaTexto ? `${s.veces || 1} ${(s.veces || 1) === 1 ? 'cambio' : 'cambios'} en el texto` : 'cambia en el formulario del módulo'}</small></span>
                                            <button type="button" className="pro-link" disabled={busy} onClick={(e) => { e.preventDefault(); aplicar([s]); }}><RefreshCw size={14} /> Actualizar esta sección</button>
                                        </summary>
                                        {s.cambiaTexto ? (
                                            <div className="pro-lados">
                                                <div><b>Como está</b><p>{s.trozos.filter((x) => x.tipo !== '+').map((x, i) => (x.tipo === '-' ? <span key={i} className="pro-dif pro-dif--menos">{x.texto}</span> : <React.Fragment key={i}>{x.texto}</React.Fragment>))}</p></div>
                                                <div><b>Como quedaría</b><p>{s.trozos.filter((x) => x.tipo !== '-').map((x, i) => (x.tipo === '+' ? <span key={i} className="pro-dif pro-dif--mas">{x.texto}</span> : <React.Fragment key={i}>{x.texto}</React.Fragment>))}</p></div>
                                            </div>
                                        ) : <p className="adm-muted">El texto del documento no cambia todavía, pero sí lo que tienes escrito en el formulario de este módulo.</p>}
                                    </details>
                                );
                            })}
                            <button type="button" className="pro-btn pro-btn--primary" disabled={busy} onClick={() => aplicar(afectadas)}><RefreshCw size={15} /> {busy ? 'Actualizando…' : afectadas.length === 1 ? 'Actualizar la sección' : `Actualizar las ${afectadas.length} secciones`}</button>
                        </>
                    )}
                </>
            )}
        </section>
    );
};

export default Propagar;
