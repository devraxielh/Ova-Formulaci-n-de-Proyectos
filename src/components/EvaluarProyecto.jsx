import React, { useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, CircleDashed, Download, FileText, FileUp, Loader2, Sparkles, XCircle } from 'lucide-react';
import { api } from '../services/api';
import { CRITERIOS, SECCIONES, diagnosticar, leerDocx, leerEvaluacion, mensajesEvaluacion, palabras, textoDe } from '../services/evaluacionDoc';
import Coherencia from './Coherencia';
import './Proyecto.css';
import './EvaluarProyecto.css';

/*
 * Evaluación de proyectos hechos fuera de la plataforma: se sube un Word o un PDF y se revisa
 * su estructura, la coherencia entre título, pregunta y objetivos, las citas y, con IA, cada sección
 * contra una lista de criterios. El archivo se lee en el navegador y no se guarda en el servidor.
 */

const NIVEL = { lista: 'Bien desarrollada', casi: 'Le faltan detalles', falta: 'Necesita trabajo' };
const ESTADO = { cumple: 'Cumple', parcial: 'Parcial', no: 'No aparece' };
const IconoEstado = ({ estado }) => (estado === 'cumple' ? <CheckCircle2 size={17} aria-hidden="true" /> : estado === 'parcial' ? <CircleDashed size={17} aria-hidden="true" /> : <XCircle size={17} aria-hidden="true" />);
const esperar = (ms) => new Promise((r) => { setTimeout(r, ms); });
const escapar = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Texto que se manda a la IA por sección: la pregunta, si va aparte, se evalúa con el planteamiento.
const textoParaIA = (secciones, id) => (id === 'planteamiento' ? [textoDe(secciones.planteamiento), textoDe(secciones.pregunta)].filter(Boolean).join('\n\n') : textoDe(secciones[id]));

const evaluarSeccion = async (id, diag) => {
    const mensajes = mensajesEvaluacion({ id, texto: textoParaIA(diag.secciones, id), titulo: diag.titulo, pregunta: diag.pregunta, general: diag.general, especificos: diag.especificos });
    for (let intento = 0; intento < 2; intento += 1) {
        try {
            // eslint-disable-next-line no-await-in-loop
            const r = await api.chat({ messages: mensajes, temperature: 0.2, max_tokens: 1300, response_format: { type: 'json_object' } });
            return leerEvaluacion(id, r?.choices?.[0]?.message?.content || '');
        } catch (err) {
            if (intento === 1 || err?.code === 'cuota_ia' || err?.status === 401 || err?.status === 403) throw err;
            // El servicio de IA limita el texto por minuto: se da tiempo a que se libere antes del segundo intento.
            // eslint-disable-next-line no-await-in-loop
            await esperar(err?.status === 429 || err?.status === 504 ? 30000 : 6000);
        }
    }
    return null;
};

const EvaluarProyecto = () => {
    const [archivo, setArchivo] = useState(null); // { nombre, tipo, paginas }
    const [renglones, setRenglones] = useState(null);
    const [leyendo, setLeyendo] = useState(false);
    const [error, setError] = useState('');
    const [tituloManual, setTituloManual] = useState('');
    const [evaluaciones, setEvaluaciones] = useState({}); // id → { estado: 'cargando' | 'listo' | 'error', resultado, error }
    const [enCurso, setEnCurso] = useState('');
    const [arrastrando, setArrastrando] = useState(false);
    const entrada = useRef(null);
    // Cada archivo cargado abre una «tanda»: lo que responda la IA para un archivo anterior se descarta.
    const tanda = useRef(0);

    const diag = useMemo(() => (renglones ? diagnosticar(renglones, { titulo: tituloManual }) : null), [renglones, tituloManual]);
    const evaluables = useMemo(() => (diag ? Object.keys(CRITERIOS).filter((id) => palabras(textoParaIA(diag.secciones, id)) >= 20) : []), [diag]);

    const cargar = async (file) => {
        if (!file) return;
        setError('');
        const nombre = file.name || 'documento';
        const tipo = /\.pdf$/i.test(nombre) || file.type === 'application/pdf' ? 'pdf' : /\.docx$/i.test(nombre) ? 'docx' : '';
        if (!tipo) { setError(/\.doc$/i.test(nombre) ? 'Ese es un Word antiguo (.doc). Ábrelo en Word y guárdalo como .docx, o expórtalo a PDF.' : 'Sube un archivo de Word (.docx) o un PDF.'); return; }
        if (file.size > 25 * 1024 * 1024) { setError('El archivo pesa más de 25 MB. Quítale imágenes pesadas o expórtalo de nuevo.'); return; }
        setLeyendo(true);
        try {
            const buffer = await file.arrayBuffer();
            let lineas;
            let paginas = 0;
            if (tipo === 'pdf') {
                const { leerPdf } = await import('../services/leerPdf');
                const r = await leerPdf(buffer);
                lineas = r.renglones;
                paginas = r.paginas;
            } else {
                lineas = await leerDocx(buffer);
            }
            tanda.current += 1;
            setArchivo({ nombre, tipo, paginas });
            setRenglones(lineas);
            setTituloManual('');
            setEvaluaciones({});
            setEnCurso('');
        } catch (err) {
            setError(err?.message || 'No se pudo leer el archivo.');
        } finally {
            setLeyendo(false);
        }
    };

    const evaluarUna = async (id) => {
        const mia = tanda.current;
        setEvaluaciones((prev) => ({ ...prev, [id]: { estado: 'cargando' } }));
        try {
            const resultado = await evaluarSeccion(id, diag);
            if (mia !== tanda.current) return false;
            setEvaluaciones((prev) => ({ ...prev, [id]: { estado: 'listo', resultado } }));
            return true;
        } catch (err) {
            if (mia !== tanda.current) return false;
            const mensaje = err?.code === 'cuota_ia' ? err.message : err?.message?.includes('JSON') ? 'La IA respondió en un formato inesperado. Inténtalo de nuevo.' : (err?.message || 'No se pudo evaluar esta sección.');
            setEvaluaciones((prev) => ({ ...prev, [id]: { estado: 'error', error: mensaje } }));
            return err?.code !== 'cuota_ia';
        }
    };
    // Una sección tras otra: el servicio de IA limita cuánto texto acepta por minuto.
    const evaluarTodas = async () => {
        const mia = tanda.current;
        const pendientes = evaluables.filter((id) => evaluaciones[id]?.estado !== 'listo');
        for (const [k, id] of pendientes.entries()) {
            if (mia !== tanda.current) return;
            setEnCurso(id);
            // eslint-disable-next-line no-await-in-loop
            const seguir = await evaluarUna(id);
            if (!seguir || mia !== tanda.current) break;
            // Una pausa breve entre secciones para no chocar con el límite por minuto del servicio de IA.
            // eslint-disable-next-line no-await-in-loop
            if (k < pendientes.length - 1) await esperar(8000);
        }
        if (mia === tanda.current) setEnCurso('');
    };

    const listas = evaluables.filter((id) => evaluaciones[id]?.estado === 'listo');
    const promedio = listas.length ? Math.round(listas.reduce((s, id) => s + evaluaciones[id].resultado.puntaje, 0) / listas.length) : null;
    const etiqueta = (id) => SECCIONES.find((s) => s.id === id)?.label || id;

    const descargarInforme = () => {
        const fecha = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
        const c = diag.coherencia;
        const filas = (pares) => pares.map(([a, b]) => `<tr><td>${escapar(a)}</td><td>${escapar(b)}</td></tr>`).join('');
        const html = `<!doctype html><html><head><meta charset="utf-8"><title>Evaluación del proyecto</title>
<style>body{font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#111}h1{font-size:16pt}h2{font-size:13pt;margin-top:18pt}h3{font-size:11.5pt}table{border-collapse:collapse;width:100%}td,th{border:1px solid #999;padding:4pt;vertical-align:top;text-align:left}.n{color:#555}</style></head><body>
<h1>Evaluación del proyecto</h1>
<p><b>Título:</b> ${escapar(diag.titulo || '(no se detectó)')}<br><b>Archivo:</b> ${escapar(archivo.nombre)}<br><b>Fecha:</b> ${fecha}</p>
${promedio !== null ? `<p><b>Cumplimiento de criterios (secciones evaluadas):</b> ${promedio} %</p>` : ''}
<p><b>Coherencia entre título, pregunta y objetivos:</b> ${c.score ?? '—'}${c.score !== null ? ' %' : ''}</p>
<h2>Estructura</h2><table><tr><th>Sección</th><th>Estado</th></tr>${filas(diag.estructura.map((e) => [e.label, e.encontrada ? `Presente (${e.palabras} palabras)` : e.esperada ? 'No se encontró' : 'No aparece (opcional)']))}</table>
<h2>Coherencia</h2><ul>${c.checks.map((k) => `<li><b>${escapar(k.label)}:</b> ${k.score === null ? 'sin datos' : `${k.score} %`}. ${escapar(k.detail)} ${escapar(k.porque || '')}</li>`).join('')}</ul>
<h2>Citas y referencias</h2><p>${diag.citas.citas.length} citas en el texto y ${diag.citas.referencias} referencias en la lista.</p>
${diag.citas.sinReferencia.length ? `<p><b>Citas sin referencia en la lista:</b> ${diag.citas.sinReferencia.map((x) => escapar(x.texto)).join('; ')}</p>` : ''}
${diag.citas.noCitadas.length ? `<p><b>Referencias que no se citan en el texto:</b></p><ul>${diag.citas.noCitadas.map((x) => `<li>${escapar(x)}</li>`).join('')}</ul>` : ''}
<h2>Evaluación por sección</h2>
${listas.length === 0 ? '<p class="n">No se evaluaron secciones con IA.</p>' : listas.map((id) => {
        const r = evaluaciones[id].resultado;
        return `<h3>${escapar(etiqueta(id))}: ${NIVEL[r.nivel]} (${r.puntaje} %)</h3><p>${escapar(r.valoracion)}</p><table><tr><th>Criterio</th><th>Estado</th><th>Comentario</th></tr>${r.criterios.map((k) => `<tr><td>${escapar(k.texto)}</td><td>${ESTADO[k.estado]}</td><td>${escapar(k.comentario)}${k.evidencia ? `<br><i class="n">«${escapar(k.evidencia)}»</i>` : ''}</td></tr>`).join('')}</table>${r.sugerencias.length ? `<p><b>Sugerencias:</b></p><ol>${r.sugerencias.map((x) => `<li>${escapar(x)}</li>`).join('')}</ol>` : ''}`;
    }).join('')}
<p class="n">Evaluación orientativa hecha con PROJECTSIA: la estructura, la coherencia y las citas se calculan con reglas; los criterios de cada sección los valora una IA, que puede equivocarse y no verifica que las fuentes existan.</p>
</body></html>`;
        const url = URL.createObjectURL(new Blob(['﻿', html], { type: 'application/msword' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = `Evaluación - ${(diag.titulo || archivo.nombre).replace(/[\\/:*?"<>|]+/g, ' ').slice(0, 80)}.doc`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
    };

    return (
        <div className="pro-page evp">
            <section className="pro-card">
                <div
                    className="evp-subir"
                    data-arrastrando={arrastrando || undefined}
                    onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
                    onDragLeave={() => setArrastrando(false)}
                    onDrop={(e) => { e.preventDefault(); setArrastrando(false); cargar(e.dataTransfer.files?.[0]); }}
                >
                    <FileUp size={30} aria-hidden="true" />
                    <div>
                        <h2>Evalúa un proyecto hecho fuera de la plataforma</h2>
                        <p>Sube el documento en Word (.docx) o PDF. Se revisa su estructura, la coherencia entre título, pregunta y objetivos, y las citas; luego puedes evaluar cada sección con IA (por ejemplo, si la introducción tiene contexto, problema y objetivo).</p>
                        <p className="evp-nota">El archivo se lee en tu navegador y no se guarda. Solo al evaluar con IA se envía el texto de cada sección al servicio de IA.</p>
                    </div>
                    <span className="evp-subir-accion">
                        <input ref={entrada} type="file" accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" hidden onChange={(e) => { cargar(e.target.files?.[0]); e.target.value = ''; }} />
                        <button type="button" className="pro-btn pro-btn--primary" onClick={() => entrada.current?.click()} disabled={leyendo}>
                            {leyendo ? <><Loader2 size={16} className="evp-gira" aria-hidden="true" /> Leyendo…</> : <><FileText size={16} aria-hidden="true" /> {archivo ? 'Subir otro archivo' : 'Elegir archivo'}</>}
                        </button>
                        <small>o arrástralo aquí</small>
                    </span>
                </div>
                {error && <p className="evp-error" role="alert"><AlertTriangle size={16} aria-hidden="true" /> {error}</p>}
            </section>

            {diag && (
                <>
                    <section className="pro-card evp-ficha">
                        <div className="evp-ficha-cabeza">
                            <div>
                                <small>{archivo.nombre}{archivo.paginas ? ` · ${archivo.paginas} páginas` : ''} · {diag.palabras.toLocaleString('es-CO')} palabras en las secciones</small>
                                <label className="evp-titulo">
                                    <span>Título detectado (corrígelo si no es)</span>
                                    <input className="input-field" value={tituloManual || diag.titulo} onChange={(e) => setTituloManual(e.target.value)} placeholder="Escribe el título del proyecto" />
                                </label>
                            </div>
                            <div className="evp-resumen">
                                <div><b>{diag.coherencia.score ?? '—'}{diag.coherencia.score !== null ? '%' : ''}</b><span>Coherencia</span></div>
                                <div><b>{promedio ?? '—'}{promedio !== null ? '%' : ''}</b><span>Criterios ({listas.length} de {evaluables.length})</span></div>
                                <button type="button" className="pro-btn pro-btn--ghost" onClick={descargarInforme}><Download size={15} aria-hidden="true" /> Descargar informe</button>
                            </div>
                        </div>
                        <dl className="evp-datos">
                            <dt>Pregunta</dt><dd>{diag.pregunta || <i>No se encontró una pregunta entre signos «¿…?».</i>}</dd>
                            <dt>Objetivo general</dt><dd>{diag.general || <i>No se encontró.</i>}</dd>
                            <dt>Objetivos específicos</dt><dd>{diag.especificos.length ? <ol>{diag.especificos.map((o) => <li key={o}>{o}</li>)}</ol> : <i>No se encontraron.</i>}</dd>
                        </dl>
                    </section>

                    <section className="pro-card">
                        <h2 className="evp-h2">Estructura</h2>
                        <ul className="evp-estructura">
                            {diag.estructura.map((e) => (
                                <li key={e.id} data-estado={e.encontrada ? 'si' : e.esperada ? 'falta' : 'opcional'}>
                                    {e.encontrada ? <CheckCircle2 size={16} aria-hidden="true" /> : e.esperada ? <XCircle size={16} aria-hidden="true" /> : <CircleDashed size={16} aria-hidden="true" />}
                                    <span>{e.label}</span>
                                    <small>{e.encontrada ? `${e.palabras} palabras${e.palabras < 80 && e.id !== 'pregunta' ? ' · muy breve' : ''}` : e.esperada ? 'No se encontró' : 'No aparece'}</small>
                                </li>
                            ))}
                        </ul>
                        <p className="evp-nota">Las secciones se reconocen por sus títulos. Si una aparece como «No se encontró» pero sí está, revisa que su título sea el habitual (por ejemplo «Planteamiento del problema» o «Metodología»).</p>
                    </section>

                    <Coherencia data={diag.datos} compacto titulo="Coherencia entre título, pregunta y objetivos" />

                    <section className="pro-card">
                        <h2 className="evp-h2">Citas y referencias</h2>
                        <p>{diag.citas.citas.length} {diag.citas.citas.length === 1 ? 'cita' : 'citas'} en el texto y {diag.citas.referencias} {diag.citas.referencias === 1 ? 'referencia' : 'referencias'} en la lista.</p>
                        {diag.citas.sinReferencia.length > 0 && <p className="evp-alerta"><b>Citas que no están en la lista de referencias:</b> {diag.citas.sinReferencia.map((x) => x.texto).join('; ')}</p>}
                        {diag.citas.noCitadas.length > 0 && (
                            <details className="evp-detalle"><summary>{diag.citas.noCitadas.length} {diag.citas.noCitadas.length === 1 ? 'referencia no se cita' : 'referencias no se citan'} en el texto</summary><ul>{diag.citas.noCitadas.map((x) => <li key={x}>{x}</li>)}</ul></details>
                        )}
                        {diag.citas.referencias === 0 && <p className="evp-alerta">No se encontró la lista de referencias.</p>}
                        {diag.citas.sinReferencia.length === 0 && diag.citas.noCitadas.length === 0 && diag.citas.referencias > 0 && <p className="evp-ok"><CheckCircle2 size={16} aria-hidden="true" /> Las citas y la lista de referencias coinciden.</p>}
                        <p className="evp-nota">Se cruzan por el primer apellido y el año. Es una revisión aproximada: no comprueba que las fuentes existan.</p>
                    </section>

                    <section className="pro-card">
                        <div className="evp-secciones-cabeza">
                            <h2 className="evp-h2">Evaluación por sección</h2>
                            <button type="button" className="pro-btn pro-btn--primary" onClick={evaluarTodas} disabled={Boolean(enCurso) || evaluables.length === 0 || listas.length === evaluables.length}>
                                {enCurso ? <><Loader2 size={16} className="evp-gira" aria-hidden="true" /> Evaluando {etiqueta(enCurso)} ({evaluables.indexOf(enCurso) + 1} de {evaluables.length})…</> : <><Sparkles size={16} aria-hidden="true" /> {listas.length ? 'Evaluar las que faltan' : 'Evaluar todas con IA'}</>}
                            </button>
                        </div>
                        <p className="evp-nota">Cada sección se compara con los criterios de la clase correspondiente. Las secciones se evalúan una tras otra; con un proyecto completo puede tardar unos minutos.</p>
                        {evaluables.length === 0 && <p>No hay secciones con texto suficiente para evaluar.</p>}
                        <div className="evp-lista">
                            {evaluables.map((id) => {
                                const ev = evaluaciones[id];
                                const r = ev?.resultado;
                                return (
                                    <article key={id} className="evp-seccion" data-nivel={r?.nivel}>
                                        <header>
                                            <div>
                                                <h3>{etiqueta(id)}</h3>
                                                <small>{palabras(textoParaIA(diag.secciones, id))} palabras · {CRITERIOS[id].length} criterios</small>
                                            </div>
                                            {r ? <span className="evp-nivel" data-nivel={r.nivel}>{NIVEL[r.nivel]} · {r.puntaje}%</span> : null}
                                            <button type="button" className="pro-btn pro-btn--ghost adm-sm" onClick={() => evaluarUna(id)} disabled={ev?.estado === 'cargando' || Boolean(enCurso)}>
                                                {ev?.estado === 'cargando' ? <><Loader2 size={15} className="evp-gira" aria-hidden="true" /> Evaluando…</> : <><Sparkles size={15} aria-hidden="true" /> {r ? 'Evaluar de nuevo' : 'Evaluar'}</>}
                                            </button>
                                        </header>
                                        {ev?.estado === 'error' && <p className="evp-error" role="alert"><AlertTriangle size={16} aria-hidden="true" /> {ev.error}</p>}
                                        {!r && ev?.estado !== 'cargando' && (
                                            <ul className="evp-criterios evp-criterios--pendiente">{CRITERIOS[id].map(([cid, texto]) => <li key={cid}><span>{texto}</span></li>)}</ul>
                                        )}
                                        {r && (
                                            <>
                                                {r.valoracion && <p className="evp-valoracion">{r.valoracion}</p>}
                                                <ul className="evp-criterios">
                                                    {r.criterios.map((k) => (
                                                        <li key={k.id} data-estado={k.estado}>
                                                            <IconoEstado estado={k.estado} />
                                                            <div>
                                                                <b>{k.texto}</b> <span className="evp-estado">{ESTADO[k.estado]}</span>
                                                                {k.comentario && <p>{k.comentario}</p>}
                                                                {k.evidencia && <blockquote>«{k.evidencia}»</blockquote>}
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                                {r.sugerencias.length > 0 && (<div className="evp-sugerencias"><b>Sugerencias</b><ol>{r.sugerencias.map((x) => <li key={x}>{x}</li>)}</ol></div>)}
                                            </>
                                        )}
                                        <details className="evp-detalle">
                                            <summary><ChevronDown size={14} aria-hidden="true" /> Ver el texto leído</summary>
                                            <pre>{textoParaIA(diag.secciones, id).slice(0, 6000)}{textoParaIA(diag.secciones, id).length > 6000 ? '\n…' : ''}</pre>
                                        </details>
                                    </article>
                                );
                            })}
                        </div>
                        <p className="evp-nota">La IA orienta, no califica: puede equivocarse y no verifica que las fuentes existan. La decisión final es del evaluador.</p>
                    </section>
                </>
            )}
        </div>
    );
};

export default EvaluarProyecto;
