import React, { useMemo, useState } from 'react';
import { Check, Download, Loader2, Network, Plus, Sparkles, Trash2 } from 'lucide-react';
import { groq } from '../services/api';
import { useProject, useProjectField } from '../context/ProjectContext';
import { MAX_RAMAS, NIVELES, arbolCompleto, arbolDataUrl, arbolPng, explicacionArbol } from '../services/arbol';
import './Proyecto.css';
import './Arbol.css';

/*
 * Editor de un árbol (del problema o de objetivos): el estudiante escribe el centro, las raíces y las ramas,
 * y la página dibuja la figura, que entra sola en su sección del documento con un párrafo que la explica.
 * `cfg` trae lo propio de cada árbol: dónde se guarda, sus textos y cómo se le pide una sugerencia a la IA.
 * Los dos árboles usan la misma forma de datos: { problema (centro), causas (abajo), efectos (arriba), explicacion }.
 */
const Ramas = ({ titulo, pregunta, ayuda, items, onChange, ejemplo, tipo }) => {
    const filas = items.length ? items : [''];
    const poner = (i, valor) => onChange(filas.map((x, k) => (k === i ? valor : x)));
    return (
        <fieldset className="arb-grupo" data-tipo={tipo}>
            <legend>{titulo} <small>{pregunta}</small></legend>
            <p className="pro-panel-hint">{ayuda}</p>
            <ul>
                {filas.map((valor, i) => (
                    <li key={i}>
                        <span aria-hidden="true">{i + 1}</span>
                        <input
                            type="text"
                            className="input-field"
                            value={valor}
                            maxLength={140}
                            aria-label={`${titulo} ${i + 1}`}
                            placeholder={i === 0 ? `Ej: ${ejemplo}` : ''}
                            onChange={(event) => poner(i, event.target.value)}
                        />
                        {filas.length > 1 && (
                            <button type="button" className="arb-quitar" aria-label={`Quitar ${titulo.toLowerCase()} ${i + 1}`} title="Quitar" onClick={() => onChange(filas.filter((_, k) => k !== i))}>
                                <Trash2 size={15} />
                            </button>
                        )}
                    </li>
                ))}
            </ul>
            {filas.length < MAX_RAMAS && (
                <button type="button" className="pro-btn pro-btn--ghost" onClick={() => onChange([...filas, ''])}><Plus size={15} /> Agregar</button>
            )}
        </fieldset>
    );
};

const ArbolEditor = ({ heading, cfg }) => {
    const { data } = useProject();
    const [guardado, setArbol] = useProjectField(cfg.campo, null);
    const nv = NIVELES[cfg.tipo];
    const [error, setError] = useState('');
    // Lo que se edita conserva las casillas vacías; lo que se dibuja y se guarda en el documento, no.
    const base = useMemo(() => cfg.leer(data), [data, cfg]);
    const edicion = guardado && typeof guardado === 'object'
        ? { problema: String(guardado.problema ?? ''), causas: Array.isArray(guardado.causas) ? guardado.causas : [], efectos: Array.isArray(guardado.efectos) ? guardado.efectos : [], explicacion: String(guardado.explicacion ?? '') }
        : { problema: base.problema, causas: base.causas, efectos: base.efectos, explicacion: '' };
    const cambiar = (patch) => setArbol({ ...edicion, ...patch });

    // Sugerencia de la IA a partir del título y la pregunta. Si el árbol está vacío, lo llena; si no, la propone al lado
    // para que el estudiante tome lo que le sirva sin perder lo que ya escribió.
    const iaLista = cfg.ia.disponible(data);
    const [sugerencia, setSugerencia] = useState(null);
    const [pensando, setPensando] = useState(false);
    const vacio = !base.problema && !base.causas.length && !base.efectos.length;
    const sugerir = async () => {
        setError('');
        setPensando(true);
        try {
            const r = await groq.chat.completions.create({
                messages: cfg.ia.mensajes(data),
                temperature: 0.4,
                max_tokens: 700,
                response_format: { type: 'json_object' },
            });
            const content = r.choices?.[0]?.message?.content || '';
            const json = JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1));
            const frases = (v) => (Array.isArray(v) ? v : []).map((x) => String(x ?? '').replace(/\s+/g, ' ').replace(/[.\s]+$/, '').trim()).filter(Boolean).slice(0, MAX_RAMAS);
            const crudo = cfg.ia.leer(json);
            const nueva = { problema: frases([crudo.problema])[0] || '', causas: frases(crudo.causas), efectos: frases(crudo.efectos) };
            if (!nueva.problema && !nueva.causas.length && !nueva.efectos.length) throw new Error('La IA no devolvió una sugerencia. Inténtalo de nuevo.');
            if (vacio) { setArbol({ ...nueva, explicacion: edicion.explicacion }); setSugerencia({ ...nueva, aplicada: true }); } else setSugerencia(nueva);
        } catch (err) {
            setError(err.message || 'No se pudo generar la sugerencia.');
        } finally {
            setPensando(false);
        }
    };
    const tiene = (lista, frase) => lista.some((x) => String(x).trim().toLowerCase() === frase.toLowerCase());
    const sumar = (campo, frase) => {
        const actuales = edicion[campo].filter((x) => String(x).trim());
        if (!tiene(actuales, frase) && actuales.length < MAX_RAMAS) cambiar({ [campo]: [...actuales, frase] });
    };

    const completo = arbolCompleto(base);
    const figura = useMemo(() => arbolDataUrl(base, { relleno: true }), [base]);
    const faltan = [!base.problema && `el ${nv.centro.toLowerCase()}`, !base.causas.length && `al menos ${cfg.tipo === 'objetivos' ? 'un medio' : 'una causa'}`, !base.efectos.length && `al menos ${cfg.tipo === 'objetivos' ? 'un fin' : 'un efecto'}`].filter(Boolean);

    const descargar = async () => {
        setError('');
        try {
            const { dataUrl } = await arbolPng(base);
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = cfg.archivo;
            document.body.appendChild(a); a.click(); a.remove();
        } catch (err) {
            setError(err.message || 'No se pudo descargar la imagen.');
        }
    };

    return (
        <div className="arb-page" data-arbol={cfg.tipo}>
            {heading}
            <div className="arb-cols">
                <section className="pro-card arb-form">
                    <h2><Network size={20} aria-hidden="true" /> Arma tu árbol</h2>
                    <p className="pro-panel-hint">{cfg.intro(base)}</p>

                    <div className="arb-ia">
                        <button type="button" className="pro-btn pro-btn--primary" onClick={sugerir} disabled={pensando || !iaLista}>
                            {pensando ? <Loader2 size={15} className="arb-gira" /> : <Sparkles size={15} />} {pensando ? 'Pensando…' : sugerencia ? 'Sugerir otra vez' : 'Sugerir con IA'}
                        </button>
                        <small>{iaLista ? cfg.ia.nota : cfg.ia.falta}</small>
                    </div>
                    {sugerencia && (
                        <div className="arb-sugerencia" role="status">
                            <b><Sparkles size={14} aria-hidden="true" /> {sugerencia.aplicada ? 'La IA llenó tu árbol con esta sugerencia' : 'Sugerencia de la IA'}</b>
                            <p>{cfg.ia.aviso}</p>
                            {!sugerencia.aplicada && (
                                <>
                                    {sugerencia.problema && (
                                        <div className="arb-sug-fila">
                                            <span><i>{cfg.tipo === 'objetivos' ? 'Objetivo' : 'Problema'}</i>{sugerencia.problema}</span>
                                            <button type="button" className="pro-link" onClick={() => cambiar({ problema: sugerencia.problema })} disabled={edicion.problema.trim() === sugerencia.problema}>{edicion.problema.trim() === sugerencia.problema ? <><Check size={13} /> Usado</> : 'Usar'}</button>
                                        </div>
                                    )}
                                    {[['causas', nv.abajo], ['efectos', nv.arriba]].flatMap(([campo, rotulo]) => sugerencia[campo].map((frase) => (
                                        <div className="arb-sug-fila" key={`${campo}-${frase}`}>
                                            <span><i>{rotulo}</i>{frase}</span>
                                            <button type="button" className="pro-link" onClick={() => sumar(campo, frase)} disabled={tiene(edicion[campo], frase)}>{tiene(edicion[campo], frase) ? <><Check size={13} /> En tu árbol</> : <><Plus size={13} /> Agregar</>}</button>
                                        </div>
                                    )))}
                                    <div className="arb-acciones">
                                        <button type="button" className="pro-btn pro-btn--ghost" onClick={() => { setArbol({ problema: sugerencia.problema, causas: sugerencia.causas, efectos: sugerencia.efectos, explicacion: edicion.explicacion }); setSugerencia({ ...sugerencia, aplicada: true }); }}>Reemplazar mi árbol por esta sugerencia</button>
                                        <button type="button" className="pro-link" onClick={() => setSugerencia(null)}>Descartar</button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    <label className="arb-problema" htmlFor="arb-problema">
                        <b>{nv.centro} <small>el tronco</small></b>
                        <textarea
                            id="arb-problema"
                            className="textarea-field"
                            rows={2}
                            maxLength={220}
                            value={edicion.problema}
                            placeholder={`Ej: ${cfg.centroEjemplo}`}
                            onChange={(event) => cambiar({ problema: event.target.value })}
                        />
                    </label>

                    <Ramas tipo="causa" {...cfg.abajo} items={edicion.causas} onChange={(causas) => cambiar({ causas })} />
                    <Ramas tipo="efecto" {...cfg.arriba} items={edicion.efectos} onChange={(efectos) => cambiar({ efectos })} />
                </section>

                <section className="pro-card arb-vista">
                    <h2>Tu {nv.nombre.toLowerCase()}</h2>
                    <img className="arb-figura" src={figura} alt={completo ? `${nv.nombre}. ${nv.centro}: ${base.problema}. ${nv.abajoPlural}: ${base.causas.join('; ')}. ${nv.arribaPlural}: ${base.efectos.join('; ')}.` : `${nv.nombre}, aún incompleto`} />
                    {completo
                        ? <p className="arb-estado" data-ok="true">{cfg.destino}</p>
                        : <p className="arb-estado">Para que entre en tu documento falta {faltan.join(', ').replace(/, ([^,]*)$/, ' y $1')}.</p>}
                    {completo && (
                        <label className="arb-explica" htmlFor="arb-explica">
                            <b>Párrafo que explica la figura <small>va antes de ella en tu documento</small></b>
                            <textarea
                                id="arb-explica"
                                className="textarea-field"
                                rows={5}
                                maxLength={1200}
                                value={edicion.explicacion}
                                placeholder={explicacionArbol({ ...base, explicacion: '' }, 'La Figura N')}
                                onChange={(event) => cambiar({ explicacion: event.target.value })}
                            />
                            <small>{edicion.explicacion.trim() ? 'Se usará tu texto. Bórralo para volver al párrafo automático.' : 'Si lo dejas vacío se usa este párrafo automático, con el número real de la figura. Escribe aquí para redactarlo a tu manera.'}</small>
                        </label>
                    )}
                    {error && <p className="pro-alert" role="alert">{error}</p>}
                    <div className="arb-acciones">
                        <button type="button" className="pro-btn pro-btn--ghost" onClick={descargar} disabled={!completo}><Download size={15} /> Descargar imagen (PNG)</button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ArbolEditor;
