import React from 'react';
import { useProject } from '../context/ProjectContext';
import { arbolCompleto, leerArbol, leerArbolObjetivos } from '../services/arbol';
import ArbolEditor from './ArbolEditor';
import SlideDeck from './deck/SlideDeck';
import { Generica } from './deck/Contenido';
import { SECTIONS, SLIDES } from '../data/arbolObjetivosClase';
import './Titulo.css';
import './Proyecto.css';
import './Arbol.css';
import TEORIA from '../data/teoria/arbolObjetivos';

/*
 * Árbol de objetivos: el árbol del problema «en positivo». El estudiante escribe el objetivo central,
 * los medios (raíces) y los fines (ramas), y la página dibuja la figura, que entra sola en el Planteamiento,
 * debajo del árbol del problema.
 * Es una clase como las demás: «Construcción» en la página y la teoría (40 minutos) en «Presentación».
 */
const texto = (v) => String(v ?? '').trim();

// Lo propio del árbol de objetivos para el editor.
const CFG = {
    campo: 'arbolObjetivos',
    tipo: 'objetivos',
    leer: leerArbolObjetivos,
    archivo: 'arbol-de-objetivos.png',
    intro: (base) => `Voltea tu árbol del problema: el problema se vuelve el objetivo central, cada causa un medio y cada efecto un fin. Escribe en positivo y conserva la misma población y el mismo lugar.${!base.propio && base.problema ? ' Ya cargamos tu objetivo general como punto de partida.' : ''}`,
    centroEjemplo: 'Reducir la inasistencia de los pacientes a sus citas médicas de consulta externa',
    abajo: { titulo: 'Medios', pregunta: 'las raíces · ¿cómo se logra?', ayuda: 'Cada causa del problema, resuelta. De aquí salen tus objetivos específicos.', ejemplo: 'Los pacientes reciben un recordatorio de su cita' },
    arriba: { titulo: 'Fines', pregunta: 'las ramas · ¿para qué se logra?', ayuda: 'Cada efecto del problema, en positivo. Son los beneficios a los que contribuye tu proyecto.', ejemplo: 'Se aprovechan los cupos de atención disponibles' },
    destino: <>Esta figura ya entra en el <strong>Planteamiento del problema</strong> de tu documento (vista previa, Word y PDF), justo debajo del árbol del problema y con un párrafo que la explica.</>,
    ia: {
        disponible: (d) => arbolCompleto(leerArbol(d)) || Boolean(texto(d?.objetivoGeneral) || texto(d?.titulo)),
        nota: 'A partir de tu árbol del problema, tu título y tu objetivo general.',
        falta: 'Primero arma tu árbol del problema o construye tu título.',
        aviso: 'Es la conversión de tu árbol del problema: revisa que cada medio venga de una causa y cada fin de un efecto, y ajusta la redacción.',
        leer: (json) => ({ problema: json.objetivo, causas: json.medios, efectos: json.fines }),
        mensajes: (d) => {
            const problema = leerArbol(d);
            const lista = (items) => (items.length ? items.map((x, i) => `${i + 1}. ${x}`).join('\n') : '(sin datos)');
            const n = (items) => Math.min(6, Math.max(3, items.length));
            return [
                { role: 'system', content: 'Ayudas a un estudiante a convertir su árbol del problema en un árbol de objetivos para su proyecto de investigación. Cada frase negativa se vuelve una frase positiva equivalente: el problema central pasa a ser el objetivo central, cada causa un medio y cada efecto un fin. No agregas ideas que no estén en el árbol del problema, ni cifras, ni autores. Respondes solo JSON válido en español.' },
                { role: 'user', content: `Título: ${texto(d?.titulo) || '(sin título)'}\nObjetivo general: ${texto(d?.objetivoGeneral) || '(sin objetivo general)'}\n\nÁrbol del problema\nProblema central: ${problema.problema || '(sin datos)'}\nCausas:\n${lista(problema.causas)}\nEfectos:\n${lista(problema.efectos)}\n\nConvierte al árbol de objetivos:\n- "objetivo": el problema central en positivo, en una sola frase que empiece con verbo en infinitivo (Reducir, Mejorar, Fortalecer, Aumentar…), con la misma población y el mismo lugar. Si hay objetivo general, sé coherente con él.\n- "medios": ${problema.causas.length ? `exactamente ${problema.causas.length}, uno por cada causa y en el mismo orden` : `exactamente ${n([])}, deducidos del título y el objetivo`}; cada uno es la causa ya resuelta, como condición lograda (máximo 14 palabras), no como actividad.\n- "fines": ${problema.efectos.length ? `exactamente ${problema.efectos.length}, uno por cada efecto y en el mismo orden` : `exactamente ${n([])}`}; cada uno es el efecto en positivo (máximo 14 palabras).\nSin punto final, sin numeración y sin cifras.\n\nResponde exactamente con este JSON: {"objetivo": "…", "medios": ["…"], "fines": ["…"]}` },
            ];
        },
    },
};

const ArbolObjetivos = ({ onNavigate }) => {
    const { data } = useProject();
    const arbol = leerArbolObjetivos(data);
    const problema = leerArbol(data);

    const renderSlide = ({ slide, heading, goToSection, sectionMinutes, totalMinutes }) => ({
        portada: (
            <>
                <div>
                    {heading}
                    <p>Ya sabes qué anda mal y por qué. El árbol de objetivos da vuelta a ese diagnóstico y muestra qué se quiere lograr, cómo y para qué.</p>
                    <p><strong>Al terminar esta clase podrás:</strong></p>
                    <ul className="ide-bullets">
                        <li>Convertir el problema central en un objetivo central.</li>
                        <li>Pasar cada causa a un medio y cada efecto a un fin.</li>
                        <li>Sacar de los medios tus objetivos específicos.</li>
                        <li>Leer el árbol de abajo hacia arriba para revisar su lógica.</li>
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
        construye: (
            <ArbolEditor
                cfg={CFG}
                heading={(
                    <>
                        {heading}
                        {/* El árbol del problema a la vista: es de donde sale cada frase de este árbol. */}
                        {arbolCompleto(problema) ? (
                            <details className="arb-origen">
                                <summary>Ver mi árbol del problema (de aquí sale cada frase)</summary>
                                <dl>
                                    <dt>Problema central → objetivo central</dt><dd>{problema.problema}</dd>
                                    <dt>Causas → medios</dt><dd>{problema.causas.join(' · ')}</dd>
                                    <dt>Efectos → fines</dt><dd>{problema.efectos.join(' · ')}</dd>
                                </dl>
                            </details>
                        ) : onNavigate && (
                            <p className="arb-origen arb-origen--falta">Este árbol sale de tu árbol del problema, que aún no está completo. <button type="button" className="pro-link" onClick={() => onNavigate('arbol')}>Armar el árbol del problema</button></p>
                        )}
                    </>
                )}
            />
        ),
    })[slide.id] || (
        <Generica
            slide={slide}
            heading={heading}
            onNavigate={onNavigate}
            aside={slide.status ? (
                <div className="ide-panel">
                    <h3>Siguiente paso</h3>
                    {arbolCompleto(arbol)
                        ? <div className="tit-saved"><span>Tu objetivo central</span><p>{arbol.problema}</p></div>
                        : <p>En «Construcción» conviertes tu árbol del problema en objetivo central, medios y fines.</p>}
                </div>
            ) : null}
        />
    );

    return (
        <SlideDeck
            sections={SECTIONS}
            slides={SLIDES}
            label="Árbol de objetivos"
            teoria={TEORIA}
            renderSlide={renderSlide}
            finish={onNavigate ? { label: 'Plantear el problema', onClick: () => onNavigate('planteamiento') } : null}
        />
    );
};

export default ArbolObjetivos;
