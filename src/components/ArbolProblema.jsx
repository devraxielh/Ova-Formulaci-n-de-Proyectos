import React, { useMemo, useState } from 'react';
import { Download, Network, Plus, Trash2 } from 'lucide-react';
import { useProject, useProjectField } from '../context/ProjectContext';
import { MAX_RAMAS, arbolCompleto, arbolDataUrl, arbolPng, leerArbol } from '../services/arbol';
import SlideDeck from './deck/SlideDeck';
import { Generica } from './deck/Contenido';
import { SECTIONS, SLIDES } from '../data/arbolClase';
import './Titulo.css';
import './Proyecto.css';
import './Arbol.css';

/*
 * Árbol del problema: el estudiante escribe el problema central, sus causas (raíces) y sus efectos (ramas),
 * y la página dibuja la figura. Esa figura entra sola en el Planteamiento del problema del documento.
 * Es una clase como las demás: «Construcción» en la página y la teoría (40 minutos) en «Presentación».
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

const Constructor = ({ heading }) => {
    const { data } = useProject();
    const [guardado, setArbol] = useProjectField('arbol', null);
    const [error, setError] = useState('');
    // Lo que se edita conserva las casillas vacías; lo que se dibuja y se guarda en el documento, no.
    const base = useMemo(() => leerArbol(data), [data]);
    const edicion = guardado && typeof guardado === 'object'
        ? { problema: String(guardado.problema ?? ''), causas: Array.isArray(guardado.causas) ? guardado.causas : [], efectos: Array.isArray(guardado.efectos) ? guardado.efectos : [] }
        : { problema: base.problema, causas: base.causas, efectos: base.efectos };
    const cambiar = (patch) => setArbol({ ...edicion, ...patch });

    const completo = arbolCompleto(base);
    const figura = useMemo(() => arbolDataUrl(base, { relleno: true }), [base]);
    const faltan = [!base.problema && 'el problema central', !base.causas.length && 'al menos una causa', !base.efectos.length && 'al menos un efecto'].filter(Boolean);

    const descargar = async () => {
        setError('');
        try {
            const { dataUrl } = await arbolPng(base);
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = 'arbol-del-problema.png';
            document.body.appendChild(a); a.click(); a.remove();
        } catch (err) {
            setError(err.message || 'No se pudo descargar la imagen.');
        }
    };

    return (
        <div className="arb-page">
            {heading}
            <div className="arb-cols">
                <section className="pro-card arb-form">
                    <h2><Network size={20} aria-hidden="true" /> Arma tu árbol</h2>
                    <p className="pro-panel-hint">Empieza por el tronco: el problema que observas, escrito como una situación negativa, no como la falta de una solución. Luego baja a las raíces y sube a las ramas.{!base.propio && (base.problema || base.causas.length || base.efectos.length) ? ' Ya cargamos lo que escribiste en la Ideación: ajústalo aquí.' : ''}</p>

                    <label className="arb-problema" htmlFor="arb-problema">
                        <b>Problema central <small>el tronco</small></b>
                        <textarea
                            id="arb-problema"
                            className="textarea-field"
                            rows={2}
                            maxLength={220}
                            value={edicion.problema}
                            placeholder="Ej: Alta inasistencia de los pacientes a sus citas médicas de consulta externa"
                            onChange={(event) => cambiar({ problema: event.target.value })}
                        />
                    </label>

                    <Ramas
                        tipo="causa"
                        titulo="Causas"
                        pregunta="las raíces · ¿por qué ocurre?"
                        ayuda="Lo que origina el problema. Tu proyecto normalmente interviene sobre una de ellas."
                        ejemplo="Los pacientes olvidan la fecha de la cita"
                        items={edicion.causas}
                        onChange={(causas) => cambiar({ causas })}
                    />
                    <Ramas
                        tipo="efecto"
                        titulo="Efectos"
                        pregunta="las ramas · ¿qué consecuencias trae?"
                        ayuda="Lo que pasa por culpa del problema. Muestran por qué vale la pena investigarlo."
                        ejemplo="Se pierden cupos de atención que otros pacientes necesitan"
                        items={edicion.efectos}
                        onChange={(efectos) => cambiar({ efectos })}
                    />
                </section>

                <section className="pro-card arb-vista">
                    <h2>Tu árbol del problema</h2>
                    <img className="arb-figura" src={figura} alt={completo ? `Árbol del problema. Problema central: ${base.problema}. Causas: ${base.causas.join('; ')}. Efectos: ${base.efectos.join('; ')}.` : 'Árbol del problema, aún incompleto'} />
                    {completo
                        ? <p className="arb-estado" data-ok="true">Esta figura ya entra en el <strong>Planteamiento del problema</strong> de tu documento (vista previa, Word y PDF), después de su texto.</p>
                        : <p className="arb-estado">Para que entre en tu documento falta {faltan.join(', ').replace(/, ([^,]*)$/, ' y $1')}.</p>}
                    {error && <p className="pro-alert" role="alert">{error}</p>}
                    <div className="arb-acciones">
                        <button type="button" className="pro-btn pro-btn--ghost" onClick={descargar} disabled={!completo}><Download size={15} /> Descargar imagen (PNG)</button>
                    </div>
                </section>
            </div>
        </div>
    );
};

const ArbolProblema = ({ onNavigate }) => {
    const { data } = useProject();
    const arbol = leerArbol(data);

    const renderSlide = ({ slide, heading, goToSection, sectionMinutes, totalMinutes }) => ({
        portada: (
            <>
                <div>
                    {heading}
                    <p>Antes de plantear un problema hay que entenderlo. El árbol del problema lo ordena en tres niveles y te muestra sobre qué parte puede actuar tu proyecto.</p>
                    <p><strong>Al terminar esta clase podrás:</strong></p>
                    <ul className="ide-bullets">
                        <li>Redactar el problema central como una situación negativa.</li>
                        <li>Distinguir causas de efectos con dos preguntas.</li>
                        <li>Armar tu árbol y leerlo de abajo hacia arriba.</li>
                        <li>Llevar cada nivel a un párrafo de tu planteamiento.</li>
                    </ul>
                </div>
                <div className="ide-panel">
                    <h3>Plan de la clase · {totalMinutes} minutos</h3>
                    <ol className="ide-agenda">
                        {SECTIONS.map((section) => (
                            <li key={section.id}>
                                <button type="button" onClick={() => goToSection(section.id)}>
                                    <span>{section.label}</span>
                                    <small>{SLIDES.filter((item) => item.section === section.id).map((item) => item.title).join(' · ')}</small>
                                    <b>{sectionMinutes(section.id)} min</b>
                                </button>
                            </li>
                        ))}
                    </ol>
                </div>
            </>
        ),
        construye: <Constructor heading={heading} />,
    })[slide.id] || (
        <Generica
            slide={slide}
            heading={heading}
            onNavigate={onNavigate}
            aside={slide.status ? (
                <div className="ide-panel">
                    <h3>Siguiente paso</h3>
                    {arbolCompleto(arbol)
                        ? <div className="tit-saved"><span>Tu problema central</span><p>{arbol.problema}</p></div>
                        : <p>En «Construcción» escribes el problema, sus causas y sus efectos, y el árbol se dibuja solo.</p>}
                </div>
            ) : null}
        />
    );

    return (
        <SlideDeck
            sections={SECTIONS}
            slides={SLIDES}
            label="Árbol del problema"
            renderSlide={renderSlide}
            finish={onNavigate ? { label: 'Plantear el problema', onClick: () => onNavigate('planteamiento') } : null}
        />
    );
};

export default ArbolProblema;
