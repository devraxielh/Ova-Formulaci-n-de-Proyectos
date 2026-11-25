import React from 'react';
import { useProject } from '../context/ProjectContext';
import { arbolCompleto, leerArbol } from '../services/arbol';
import ArbolEditor from './ArbolEditor';
import SlideDeck from './deck/SlideDeck';
import { Generica } from './deck/Contenido';
import { SECTIONS, SLIDES } from '../data/arbolClase';
import './Titulo.css';
import './Proyecto.css';
import './Arbol.css';
import TEORIA from '../data/teoria/arbolProblema';

/*
 * Árbol del problema: el estudiante escribe el problema central, sus causas (raíces) y sus efectos (ramas),
 * y la página dibuja la figura. Esa figura entra sola en el Planteamiento del problema del documento.
 * Es una clase como las demás: «Construcción» en la página y la teoría (40 minutos) en «Presentación».
 */
// Lo propio del árbol del problema para el editor.
const CFG = {
    campo: 'arbol',
    tipo: 'problema',
    leer: leerArbol,
    archivo: 'arbol-del-problema.png',
    intro: (base) => `Empieza por el tronco: el problema que observas, escrito como una situación negativa, no como la falta de una solución. Luego baja a las raíces y sube a las ramas.${!base.propio && (base.problema || base.causas.length || base.efectos.length) ? ' Ya cargamos lo que escribiste en la Ideación: ajústalo aquí.' : ''}`,
    centroEjemplo: 'Alta inasistencia de los pacientes a sus citas médicas de consulta externa',
    abajo: { titulo: 'Causas', pregunta: 'las raíces · ¿por qué ocurre?', ayuda: 'Lo que origina el problema. Tu proyecto normalmente interviene sobre una de ellas.', ejemplo: 'Los pacientes olvidan la fecha de la cita' },
    arriba: { titulo: 'Efectos', pregunta: 'las ramas · ¿qué consecuencias trae?', ayuda: 'Lo que pasa por culpa del problema. Muestran por qué vale la pena investigarlo.', ejemplo: 'Se pierden cupos de atención que otros pacientes necesitan' },
    destino: <>Esta figura ya entra en el <strong>Planteamiento del problema</strong> de tu documento (vista previa, Word y PDF), antes de su párrafo de cierre y con un párrafo que la explica.</>,
    ia: {
        disponible: (d) => Boolean(String(d?.titulo || '').trim() || String(d?.pregunta || '').trim()),
        nota: 'A partir de tu título y tu pregunta de investigación.',
        falta: 'Primero construye tu título o tu pregunta de investigación.',
        aviso: 'Son hipótesis de partida: revísalas, ajústalas a lo que realmente pasa y respáldalas con fuentes en tu planteamiento.',
        leer: (json) => json,
        mensajes: (d) => {
            const titulo = String(d?.titulo || '').trim();
            const pregunta = String(d?.pregunta || '').trim();
            return [
                { role: 'system', content: 'Ayudas a un estudiante a armar el árbol del problema de su proyecto de investigación. Propones un problema central, causas y efectos coherentes con su título y su pregunta. Son hipótesis de partida que el estudiante debe verificar: no inventas cifras, porcentajes, estudios ni autores. Respondes solo JSON válido en español.' },
                { role: 'user', content: `Título: ${titulo || '(sin título)'}\nPregunta de investigación: ${pregunta || '(sin pregunta)'}\n\nPropón el árbol del problema:\n- "problema": una sola frase, como situación negativa que existe hoy (empieza con «Alta», «Bajo», «Deficiente», «Escaso» o similar), con la población y el lugar del título. No lo escribas como la falta de una solución ni como pregunta.\n- "causas": exactamente 3 frases cortas (máximo 14 palabras) que respondan «¿por qué ocurre?», cercanas a esa población.\n- "efectos": exactamente 3 frases cortas (máximo 14 palabras) que respondan «¿qué consecuencias trae?».\nSin punto final, sin numeración y sin cifras.\n\nResponde exactamente con este JSON: {"problema": "…", "causas": ["…", "…", "…"], "efectos": ["…", "…", "…"]}` },
            ];
        },
    },
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
        construye: <ArbolEditor heading={heading} cfg={CFG} />,
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
            teoria={TEORIA}
            renderSlide={renderSlide}
            finish={onNavigate ? { label: 'Armar el árbol de objetivos', onClick: () => onNavigate('arbolobjetivos') } : null}
        />
    );
};

export default ArbolProblema;
