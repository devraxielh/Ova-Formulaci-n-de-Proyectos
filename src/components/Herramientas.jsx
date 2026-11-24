import React, { useMemo } from 'react';
import {
    AlignLeft, ArrowRight, BarChart3, BookMarked, BookOpen, Flag, CheckCircle2, Compass, FileText, FolderOpen,
    HelpCircle, Library, Lightbulb, ListOrdered, Microscope, Presentation, Scale, Sparkles, Target, Type,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { BUILD_ORDER, buildDocument } from '../services/projectDoc';
import './Herramientas.css';

/* Las herramientas, agrupadas por fase y en el orden en que se construye el proyecto. */
const FASES = [
    {
        id: 'formula',
        label: 'Formula tu investigación',
        text: 'Clases de una hora con teoría, ejercicios y un constructor que guarda en tu proyecto.',
        tools: [
            { id: 'ideacion', icon: Lightbulb, title: 'Ideación', text: 'Del interés a una idea delimitada: problema, causas, efectos, población y lugar.', clase: true, ia: true },
            { id: 'titulo', icon: Type, title: 'Título', text: 'Arma un título de 10 a 30 palabras con verbo, objeto, población y lugar.', clase: true, ia: true },
            { id: 'pregunta', icon: HelpCircle, title: 'Pregunta de investigación', text: 'Elige el tipo de pregunta y formúlala alineada con tu título.', clase: true },
            { id: 'planteamiento', icon: FileText, title: 'Planteamiento del problema', text: 'Redacta contexto, problema, causas, consecuencias y cierre con datos.', clase: true },
            { id: 'objetivos', icon: Target, title: 'Objetivos', text: 'Convierte tu título en objetivo general y ordena los específicos.', clase: true },
            { id: 'justificacion', icon: Scale, title: 'Justificación', text: 'Argumenta por qué, para quién y para qué investigar, y que es viable.', clase: true },
            { id: 'alcances', icon: Compass, title: 'Alcances y limitaciones', text: 'Declara el tipo de alcance, delimita el estudio y responde sus limitaciones.', clase: true },
        ],
    },
    {
        id: 'fundamenta',
        label: 'Fundamenta',
        text: 'Por qué vale la pena y en qué se apoya tu estudio.',
        tools: [
            { id: 'marco', icon: Library, title: 'Marco referencial', text: 'Antecedentes, Marco Teórico, Conceptual, Contextual y Legal, con teorías por área y citas APA 7.', clase: true, min: 240 },
        ],
    },
    {
        id: 'disena',
        label: 'Diseña el método',
        text: 'Cómo, con quiénes, con qué, cuándo y con cuánto se hará el estudio.',
        tools: [
            { id: 'metodologia', icon: Microscope, title: 'Metodología', text: 'Enfoque, tipos, diseños, población y muestra, plan de análisis, instrumentos, cronograma y presupuesto.', clase: true, min: 240 },
            { id: 'fases', icon: ListOrdered, title: 'Desarrollo de las fases', text: 'Una fase por objetivo: actividades, técnicas, productos, tiempos y responsables; se lleva al cronograma.', clase: true, min: 120 },
        ],
    },
    {
        id: 'cierra',
        label: 'Cierra',
        text: 'Resultados, discusión y la presentación del documento.',
        tools: [
            { id: 'resultados', icon: BarChart3, title: 'Resultados y discusión', text: 'Resultados por objetivo con tablas en APA y su discusión con antecedentes y teorías.', clase: true, min: 120 },
            { id: 'conclusiones', icon: Flag, title: 'Conclusiones', text: 'Una conclusión por objetivo, la conclusión general y recomendaciones con destinatario.', clase: true },
            { id: 'resumen', icon: AlignLeft, title: 'Resumen', text: 'Objetivo, metodología, resultados y conclusiones en un párrafo de 150 a 250 palabras, con palabras clave.', clase: true },
            { id: 'introduccion', icon: BookOpen, title: 'Introducción', text: 'Se escribe al final: presenta el problema, los objetivos y el documento.', clase: true },
        ],
    },
];

const APOYO = [
    { id: 'proyecto', icon: FolderOpen, title: 'Mi proyecto', text: 'Tu documento armado: descárgalo en Word o PDF.' },
    { id: 'referencias', icon: BookMarked, title: 'Referencias bibliográficas', text: 'Registra tus fuentes, cítalas en los párrafos y arma la lista final en APA 7.' },
];

const Herramientas = ({ onNavigate }) => {
    const { data, project, user } = useProject();
    const sections = useMemo(() => buildDocument(data), [data]);
    const done = useMemo(() => new Set(sections.filter((section) => section.content.length > 0).map((section) => section.tab)), [sections]);
    const total = BUILD_ORDER.length;
    const hechos = BUILD_ORDER.filter((tab) => done.has(tab)).length;
    const siguiente = BUILD_ORDER.find((tab) => !done.has(tab));
    const toolOf = (id) => FASES.flatMap((fase) => fase.tools).find((tool) => tool.id === id);
    let numero = 0;

    return (
        <div className="her-page">
            <section className="her-hero">
                <div className="her-hero-text">
                    <h2>Formula tu proyecto de investigación paso a paso</h2>
                    <p>Cada herramienta toma lo que hiciste en la anterior: la idea pasa al título, el título a la pregunta y así hasta tener el documento completo en <b>Mi proyecto</b>.</p>
                    <ul className="her-tags">
                        <li><Presentation size={15} aria-hidden="true" /> Clases de 60 minutos</li>
                        <li><Sparkles size={15} aria-hidden="true" /> Apoyo con IA</li>
                        <li><FileText size={15} aria-hidden="true" /> Documento en Word y PDF</li>
                    </ul>
                </div>
                <div className="her-progress">
                    <p className="her-progress-label">{user ? project.name : 'Tu avance'}</p>
                    <p className="her-progress-count"><b>{hechos}</b> de {total} pasos</p>
                    <div className="her-bar" aria-hidden="true"><span style={{ width: `${(hechos / total) * 100}%` }} /></div>
                    {siguiente ? (
                        <button type="button" className="her-cta" onClick={() => onNavigate(siguiente)}>
                            {hechos === 0 ? 'Empezar por la Ideación' : `Continuar: ${toolOf(siguiente)?.title || 'siguiente paso'}`} <ArrowRight size={16} />
                        </button>
                    ) : (
                        <button type="button" className="her-cta" onClick={() => onNavigate('proyecto')}>
                            Ver mi proyecto completo <ArrowRight size={16} />
                        </button>
                    )}
                    {!user && <button type="button" className="her-link" onClick={() => onNavigate('cuenta')}>Crea una cuenta para guardarlo en la nube</button>}
                </div>
            </section>

            {FASES.map((fase, faseIndex) => (
                <section className="her-fase" key={fase.id} aria-labelledby={`her-${fase.id}`}>
                    <header className="her-fase-head">
                        <span className="her-fase-num">{faseIndex + 1}</span>
                        <div>
                            <h3 id={`her-${fase.id}`}>{fase.label}</h3>
                            <p>{fase.text}</p>
                        </div>
                    </header>
                    <div className="her-grid">
                        {fase.tools.map((tool) => {
                            numero += 1;
                            const Icon = tool.icon;
                            const hecho = done.has(tool.id);
                            const esSiguiente = tool.id === siguiente;
                            return (
                                <button
                                    type="button"
                                    key={tool.id}
                                    className="her-card"
                                    data-fase={fase.id}
                                    data-state={hecho ? 'done' : esSiguiente ? 'next' : 'pending'}
                                    onClick={() => onNavigate(tool.id)}
                                >
                                    <span className="her-card-top">
                                        <span className="her-icon"><Icon size={20} aria-hidden="true" /></span>
                                        <span className="her-step">Paso {numero}</span>
                                        {hecho && <span className="her-done"><CheckCircle2 size={15} aria-hidden="true" /> Hecho</span>}
                                        {esSiguiente && <span className="her-next">Siguiente</span>}
                                    </span>
                                    <span className="her-title">{tool.title}</span>
                                    <span className="her-text">{tool.text}</span>
                                    <span className="her-meta">
                                        {tool.clase && <span className="her-badge her-badge--clase">Clase · {tool.min || 60} min</span>}
                                        {tool.ia && <span className="her-badge her-badge--ia">IA</span>}
                                        <span className="her-go">{hecho ? 'Revisar' : 'Abrir'} <ArrowRight size={14} aria-hidden="true" /></span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </section>
            ))}

            <section className="her-fase" aria-labelledby="her-apoyo">
                <header className="her-fase-head">
                    <span className="her-fase-num her-fase-num--apoyo"><Sparkles size={15} aria-hidden="true" /></span>
                    <div>
                        <h3 id="her-apoyo">Apoyo</h3>
                        <p>Úsalas en cualquier momento.</p>
                    </div>
                </header>
                <div className="her-grid her-grid--apoyo">
                    {APOYO.map((tool) => {
                        const Icon = tool.icon;
                        return (
                            <button type="button" key={tool.id} className="her-card her-card--row" data-fase="apoyo" onClick={() => onNavigate(tool.id)}>
                                <span className="her-icon"><Icon size={20} aria-hidden="true" /></span>
                                <span>
                                    <span className="her-title">{tool.title}</span>
                                    <span className="her-text">{tool.text}</span>
                                </span>
                                <ArrowRight size={16} className="her-row-arrow" aria-hidden="true" />
                            </button>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

export default Herramientas;
