import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, GitCompareArrows, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { api, groq } from '../services/api';
import { SECTIONS } from '../services/projectDoc';
import { REESCRIBIBLES, cambiosDetectados, fotoActual, hojasDeSeccion, paresDeReescritura, reemplazosDe, seccionesAfectadas } from '../services/propagar';
import { avisar } from './Avisos';

/*
 * Propagar los cambios (en Mi proyecto): si el estudiante cambió el título o la pregunta, muestra qué términos
 * cambiaron, qué secciones siguen usando los anteriores y cómo quedaría cada una, lado a lado. Él decide cuáles
 * actualizar. Antes de aplicar se guarda una copia en el historial.
 */

// Reescritura de una sección cuando cambia el sentido del título o la pregunta: la IA dice qué frases cambian y cómo.
const reescribir = async ({ cambios, data, seccion, hojas }) => {
    const r = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: 'Eres asesor de investigación. El estudiante cambió el título o la pregunta de su proyecto y una sección quedó escrita para la versión anterior. Tu tarea es decir qué frases de esa sección dejaron de ser coherentes y cómo deben quedar. Reglas: (1) cambia SOLO las frases que contradicen o ignoran el cambio (otro alcance o verbo, otra variable, otra población, otro lugar o periodo); si una frase sigue siendo válida, no la incluyas. (2) conserva el estilo, la persona gramatical y una extensión parecida. (3) no inventes cifras, autores, citas ni datos nuevos; no quites los que ya están. (4) si el cambio pide algo que la frase no puede decir sin información nueva, déjala igual. (5) si nada debe cambiar, devuelve la lista vacía. Respondes solo JSON válido en español.' },
            { role: 'user', content: `CAMBIO\n${cambios.map((c) => `${c.nombre.replace(/^(el|la) /, '')} — antes: ${c.antes}\n${c.nombre.replace(/^(el|la) /, '')} — ahora: ${c.ahora}`).join('\n')}\n\nPROYECTO (versión actual)\nTítulo: ${String(data.titulo || '').trim()}\nPregunta: ${String(data.pregunta || '').split('\n')[0]}\nObjetivo general: ${String(data.objetivoGeneral || '').trim() || '(sin definir)'}\n\nSECCIÓN: ${seccion}\nFRASES\n${hojas.map((h) => `[${h.id}] ${h.texto}`).join('\n')}\n\nDevuelve {"cambios":[{"id":"h3","texto":"la frase como debe quedar"}]}` },
        ],
        temperature: 0.2,
        max_tokens: 2400,
        response_format: { type: 'json_object' },
    });
    const content = r.choices?.[0]?.message?.content || '';
    const json = JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1));
    return paresDeReescritura(hojas, json.cambios);
};

const Propagar = () => {
    const { user, project, data, setField, flush } = useProject();
    const cambios = useMemo(() => cambiosDetectados(data), [data]);
    const [pares, setPares] = useState(null); // reemplazos editables; null = se toman los detectados
    const [busy, setBusy] = useState(false);
    const [fondo, setFondo] = useState([]); // reescrituras propuestas por la IA (frase anterior → frase nueva)
    const [pensando, setPensando] = useState(''); // sección que la IA está revisando

    // La primera vez (o tras un proyecto recién creado) se toma una foto del título y la pregunta: a partir de ahí
    // se nota cuándo cambian.
    const sinFoto = !data.propagado && Boolean(fotoActual(data).titulo || fotoActual(data).pregunta);
    useEffect(() => { if (user && project.id && sinFoto) setField('propagado', fotoActual(data)); }, [user, project.id, sinFoto]); // eslint-disable-line react-hooks/exhaustive-deps

    const firma = cambios.map((c) => `${c.id}:${c.ahora}`).join('|');
    useEffect(() => { setPares(null); setFondo([]); }, [firma]);
    const detectados = useMemo(() => cambios.flatMap((c) => reemplazosDe(c.antes, c.ahora)).filter((p, i, todos) => todos.findIndex((x) => x.antes.toLowerCase() === p.antes.toLowerCase()) === i).map((p) => ({ ...p, usar: true })), [firma]); // eslint-disable-line react-hooks/exhaustive-deps
    const lista = pares || detectados;
    const activos = [...lista.filter((p) => p.usar && p.antes.trim() && p.despues.trim()), ...fondo];
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
    // Cambios de fondo: la IA revisa sección por sección, sobre el proyecto con los términos ya llevados.
    const proponerFondo = async () => {
        const terminos = lista.filter((p) => p.usar && p.antes.trim() && p.despues.trim());
        const nuevas = [];
        let fallos = 0;
        let sinCuota = false;
        for (const id of REESCRIBIBLES) {
            if (sinCuota) break; // la cuota de IA del día se agotó: no tiene sentido seguir ni reintentar
            const hojas = hojasDeSeccion(data, id);
            if (!hojas.length) continue;
            const nombre = SECTIONS.find((s) => s.id === id)?.label || id;
            setPensando(nombre);
            // Son varias solicitudes seguidas y el servicio de IA limita cuántas caben por minuto: si una falla,
            // se espera y se intenta una vez más antes de darla por perdida.
            let propuestas = null;
            for (let intento = 0; intento < 2 && !propuestas; intento += 1) {
                try {
                    // eslint-disable-next-line no-await-in-loop
                    if (intento) await new Promise((r) => { setTimeout(r, 8000); });
                    // eslint-disable-next-line no-await-in-loop
                    propuestas = await reescribir({ cambios, data, seccion: nombre, hojas });
                } catch (err) { if (err?.code === 'cuota_ia') { sinCuota = true; break; } /* si no, se reintenta */ }
            }
            if (propuestas) propuestas.forEach((p) => { if (!nuevas.some((x) => x.antes === p.antes)) nuevas.push(p); });
            else fallos += 1;
        }
        setPensando('');
        setFondo(nuevas);
        void terminos;
        if (sinCuota && !nuevas.length) return; // el aviso de cuota agotada ya salió
        if (!nuevas.length) avisar(fallos ? 'No se pudo revisar con la IA. Inténtalo de nuevo.' : 'La IA no encontró frases que deban reescribirse por este cambio.', fallos ? 'error' : 'ok');
        else avisar(`La IA propone reescribir ${nuevas.length} ${nuevas.length === 1 ? 'frase' : 'frases'}. Revisa cada sección antes de actualizarla.${fallos ? ` ${fallos === 1 ? 'No se pudo revisar una sección' : `No se pudieron revisar ${fallos} secciones`}: vuelve a revisar en un minuto.` : ''}`);
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

            <div className="prg-fondo">
                <button type="button" className="pro-btn pro-btn--ghost" disabled={busy || Boolean(pensando)} onClick={proponerFondo}>
                    {pensando ? <Loader2 size={15} className="prg-gira" /> : <Sparkles size={15} />} {pensando ? `Revisando ${pensando}…` : fondo.length ? 'Volver a revisar con IA' : 'Revisar el fondo con IA'}
                </button>
                <span>{fondo.length ? <><b>{fondo.length} {fondo.length === 1 ? 'frase' : 'frases'} por reescribir</b> propuestas por la IA. <button type="button" className="pro-link" onClick={() => setFondo([])}>Descartarlas</button></> : 'Si cambió el sentido (otro alcance, otra variable, otra población), la IA lee cada sección y propone qué frases reescribir. Nada se aplica sin que lo veas.'}</span>
            </div>

            {lista.length === 0 && fondo.length === 0 ? (
                <p className="adm-muted">No se reemplazó un término por otro (solo se agregó o se quitó texto), así que no hay nada que llevar automáticamente a las demás secciones. Usa «Revisar el fondo con IA» o revísalas con la coherencia de abajo; cuando estén bien, marca el proyecto como al día.</p>
            ) : (
                <>
                    {lista.length > 0 && <p className="adm-muted">Estos términos cambiaron. Las demás secciones todavía usan los anteriores; elige cuáles llevar al resto del proyecto (puedes corregirlos).</p>}
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
