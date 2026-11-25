import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, GitFork, Loader2, Plus, Sparkles, Target, Trash2, Wand2, XCircle } from 'lucide-react';
import { groq } from '../services/api';
import { arbolCompleto, leerArbolObjetivos } from '../services/arbol';
import SlideDeck, { Opciones, Pestanas } from './deck/SlideDeck';
import { useProjectField } from '../context/ProjectContext';
import { useAutoGuardar } from '../hooks/useAutoGuardar';
import { especificosSugeridos, generalDesdeTitulo } from '../data/ejemplos';
import { alcanceOfVerb, verbAtStart } from '../data/alcances';
import { NIVELES, nivelDe, problemasEscalera, rangoPeldano, verbosEntre } from '../data/nivelesVerbos';
import './Titulo.css';
import './Planteamiento.css';
import './Objetivos.css';
import { construccionPrimero } from './deck/orden';
import TEORIA from '../data/teoria/objetivos';

/* Clase de 60 minutos: la suma de `min` de todas las diapositivas. */
const SECTIONS = construccionPrimero([
    { id: 'apertura', label: 'Apertura' },
    { id: 'estructura', label: 'Estructura' },
    { id: 'calidad', label: 'Calidad' },
    { id: 'cierre', label: 'Cierre' },
    { id: 'construccion', label: 'Construcción' },
    { id: 'revision', label: 'Revisión' },
]);

const SLIDES = construccionPrimero([
    { id: 'portada', section: 'apertura', min: 3, title: 'Los objetivos: lo que tu investigación va a lograr' },
    { id: 'quees', section: 'apertura', min: 3, title: 'General y específicos' },
    { id: 'origen', section: 'apertura', min: 3, title: 'De la pregunta al objetivo' },
    { id: 'anatomia', section: 'estructura', min: 5, title: 'Anatomía de un objetivo' },
    { id: 'verbos', section: 'estructura', min: 5, title: 'El verbo: el corazón del objetivo' },
    { id: 'secuencia', section: 'estructura', min: 5, title: 'Los objetivos específicos son una escalera' },
    { id: 'alineacion', section: 'estructura', min: 4, title: 'Título, pregunta y objetivos dicen lo mismo' },
    { id: 'errores', section: 'calidad', min: 4, title: 'Siete errores frecuentes' },
    { id: 'juzga', section: 'calidad', min: 4, title: '¿Es un buen objetivo?' },
    { id: 'reescribe', section: 'calidad', min: 4, title: 'Antes y después' },
    { id: 'repaso', section: 'cierre', min: 2, title: 'Repaso' },
    { id: 'cierre', section: 'cierre', min: 1, title: 'Lo que te llevas' },
    { id: 'construye', section: 'construccion', min: 10, title: 'Redacta tus objetivos', layout: 'builder' },
    { id: 'revision', section: 'revision', min: 7, title: 'Qué hace buenos a unos objetivos' },
]);

const SLIDE_KEY = 'projectsia:objetivos:diapositiva';

/* ---------- Utilidades ---------- */

const clean = (text) => String(text || '').trim().replace(/[\s.,;:]+$/, '');
const countWords = (text) => String(text || '').trim().split(/\s+/).filter(Boolean).length;
const capital = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : '');
const firstWord = (text) => clean(text).split(/\s+/)[0] || '';
const isInfinitive = (word) => /^[a-záéíóúñ]+(ar|er|ir)$/i.test(word);
const VERBOS_DEBILES = ['conocer', 'saber', 'entender', 'aprender', 'estudiar', 'investigar', 'ver', 'mirar', 'lograr', 'tratar', 'intentar', 'buscar', 'realizar', 'hacer'];
const ACTIVIDADES = /\b(aplicar (una |la |las |el )?(encuesta|entrevista)s?|encuestar|entrevistar|tabular|recolectar (los )?datos|revisar (la )?bibliograf|buscar informaci|hacer (una |la )?encuesta)/i;
const SOLUCION_IMPLEMENTADA = /\b(implementar|ejecutar|instalar|capacitar a todos|solucionar|resolver (el|la) problema|eliminar (el|la))\b/i;

// Infinitivos que aparecen en el objetivo (para detectar dos verbos con «y»).
const extraVerbs = (text) => {
    const words = clean(text).toLowerCase().split(/[\s,]+/).slice(1);
    return words.filter((word, index) => isInfinitive(word) && ['y', 'e', 'o'].includes(words[index - 1]) && word.length > 4);
};

export const formatObjetivos = (general, especificos) => {
    const g = clean(general);
    const list = especificos.map(clean).filter(Boolean);
    if (!g && list.length === 0) return '';
    return [
        '### Objetivo general',
        g ? `${capital(g)}.` : '',
        '',
        '### Objetivos específicos',
        ...list.map((item, index) => `${index + 1}. ${capital(item)}.`),
    ].join('\n').trim();
};

/* ---------- Revisión automática ---------- */

const checkObjetivo = (text) => {
    const verb = firstWord(text).toLowerCase();
    const extra = extraVerbs(text);
    return [
        { id: 'infinitivo', ok: isInfinitive(verb), label: 'Empieza con un verbo en infinitivo', detail: `Empieza por «${verb || '…'}». Usa un verbo terminado en -ar, -er o -ir: Analizar, Describir, Establecer…` },
        { id: 'uno', ok: extra.length === 0, label: 'Tiene un solo verbo', detail: `También dice «${extra.join('», «')}». Divide en dos objetivos o quédate con uno.` },
        { id: 'debil', ok: !VERBOS_DEBILES.includes(verb), label: 'El verbo es verificable', detail: `«${verb}» no se puede comprobar. Cámbialo por uno que deje un producto: identificar, caracterizar, establecer…` },
        { id: 'actividad', ok: !ACTIVIDADES.test(text), label: 'Es un logro, no una actividad', detail: 'Aplicar encuestas o revisar bibliografía son actividades de la metodología, no objetivos.' },
    ];
};

const checkConjunto = (general, especificos, { titulo, pregunta }) => {
    const g = clean(general);
    const list = especificos.map(clean).filter(Boolean);
    const lowerG = g.toLowerCase();
    const claves = (value) => clean(value).toLowerCase().replace(/[¿?]/g, '').split(/\s+/).filter((word) => word.length > 5);
    const coincide = (value) => {
        const keys = claves(value).slice(0, 6);
        return keys.length === 0 || keys.filter((word) => lowerG.includes(word)).length >= Math.min(2, keys.length);
    };
    const malos = list.filter((item) => checkObjetivo(item).some((check) => !check.ok));
    const verbG = firstWord(g).toLowerCase();
    return [
        { id: 'general', ok: Boolean(g), label: 'Tiene un objetivo general', detail: 'Escribe el objetivo general: lo que logrará la investigación completa.' },
        { id: 'formaG', ok: g ? checkObjetivo(g).every((check) => check.ok) : false, label: 'El general está bien formulado', detail: 'Un solo verbo en infinitivo, verificable y que no sea una actividad.' },
        { id: 'cantidad', ok: list.length >= 2 && list.length <= 4, label: 'Tiene entre 2 y 4 específicos', detail: `Tiene ${list.length}. Con 3 suele bastar; más de 4 vuelve inmanejable el proyecto.` },
        { id: 'formaE', ok: list.length > 0 && malos.length === 0, label: 'Los específicos están bien formulados', detail: malos.length ? `Revisa: «${malos[0].slice(0, 60)}…»` : 'Escribe tus objetivos específicos.' },
        { id: 'distinto', ok: !list.some((item) => item.toLowerCase() === lowerG), label: 'Ningún específico repite el general', detail: 'Los específicos son pasos del general, no una copia.' },
        { id: 'verbos', ok: new Set(list.map((item) => firstWord(item).toLowerCase())).size === list.length, label: 'Cada específico usa un verbo distinto', detail: 'Si repites el verbo, quizá dos objetivos son el mismo paso.' },
        { id: 'mayor', ok: !list.some((item) => firstWord(item).toLowerCase() === verbG), label: 'El general es más amplio que los específicos', detail: `Un específico usa el mismo verbo del general («${verbG}»).` },
        { id: 'escalera', ok: !problemasEscalera('', list).some(Boolean), label: 'Los específicos forman una escalera', detail: 'Ordena los específicos de lo simple a lo complejo: cada uno en el mismo nivel o más arriba que el anterior (identificar → describir → analizar → explicar → evaluar → proponer).' },
        { id: 'solucion', ok: ![g, ...list].some((item) => SOLUCION_IMPLEMENTADA.test(item)), label: 'Son alcanzables con la investigación', detail: 'Evita prometer implementar o resolver el problema: eso excede un proyecto de investigación.' },
        { id: 'titulo', ok: !titulo || coincide(titulo), label: 'El general coincide con tu título', detail: titulo ? `Tu título es: ${clean(titulo)}` : '' },
        { id: 'pregunta', ok: !pregunta || coincide(pregunta), label: 'El general responde tu pregunta', detail: pregunta ? `Tu pregunta es: ${clean(pregunta)}` : '' },
    ];
};

/* ---------- Contenido de la clase ---------- */

const QUEES_QUIZ = [
    {
        text: '¿Cuál es el objetivo general y no un específico?',
        options: [
            'Caracterizar la inasistencia a citas médicas en los pacientes de consulta externa.',
            'Analizar los factores asociados a la inasistencia a citas médicas en los pacientes de consulta externa de un hospital de Sincelejo.',
            'Establecer la relación entre el olvido de la cita y la inasistencia.',
        ],
        answer: 1,
        why: 'Abarca toda la investigación y responde la pregunta. Los otros dos son pasos para llegar a él.',
    },
];

const ORIGEN = [
    { label: 'Tu título', text: 'Análisis de los factores asociados a la deserción en estudiantes de primer semestre de una universidad pública de Montería', note: 'El título nombra el estudio con un verbo sustantivado: «Análisis».' },
    { label: 'Tu pregunta', text: '¿Qué factores están asociados a la deserción de los estudiantes de primer semestre de una universidad pública de Montería?', note: 'La pregunta pide una respuesta.' },
    { label: 'Tu objetivo general', text: 'Analizar los factores asociados a la deserción de los estudiantes de primer semestre de una universidad pública de Montería.', note: 'El objetivo dice qué harás para responderla: «Análisis» → «Analizar».' },
];

const PARTES = [
    { key: 'verbo', color: 'que', label: 'Verbo en infinitivo', text: 'Analizar', what: 'Qué acción cognitiva harás. Uno solo, verificable.' },
    { key: 'objeto', color: 'paraque', label: 'Qué', text: 'los factores asociados a la inasistencia a citas médicas', what: 'El objeto de estudio: tus variables.' },
    { key: 'quien', color: 'quien', label: 'En quiénes', text: 'en los pacientes de consulta externa', what: 'La población o unidad de análisis.' },
    { key: 'donde', color: 'donde', label: 'Dónde y cuándo', text: 'de un hospital de Sincelejo, en 2026', what: 'El lugar y, si aplica, el tiempo.' },
    { key: 'para', color: 'cuando', label: 'Para qué (opcional)', text: 'como base para reducir las citas perdidas', what: 'El propósito. Solo en el general y sin prometer resolverlo.' },
];

const VERBOS = [
    { id: 'explorar', label: 'Explorar', what: 'Cuando el tema es poco conocido.', example: 'Explorar · Indagar · Identificar · Reconocer' },
    { id: 'describir', label: 'Describir', what: 'Cuando quieres mostrar cómo es algo.', example: 'Describir · Caracterizar · Diagnosticar · Cuantificar · Clasificar' },
    { id: 'comparar', label: 'Comparar', what: 'Cuando hay dos o más grupos, lugares o momentos.', example: 'Comparar · Contrastar · Diferenciar' },
    { id: 'relacionar', label: 'Relacionar', what: 'Cuando buscas si dos variables van juntas.', example: 'Establecer (la relación) · Correlacionar · Asociar' },
    { id: 'explicar', label: 'Explicar', what: 'Cuando buscas causas o factores.', example: 'Determinar · Explicar · Analizar · Inferir' },
    { id: 'evaluar', label: 'Evaluar', what: 'Cuando mides el efecto de algo.', example: 'Evaluar · Valorar · Medir · Verificar' },
    { id: 'proponer', label: 'Proponer', what: 'Cuando el resultado es una propuesta o diseño.', example: 'Proponer · Diseñar · Formular · Elaborar · Validar' },
];

const ESCALERA = [
    { label: 'Peldaño 1 · Nivel 2 · Describir', text: 'Caracterizar la inasistencia a citas médicas en los pacientes de consulta externa.', note: '¿Cómo es? Muestra la situación actual.' },
    { label: 'Peldaño 2 · Nivel 3 · Analizar', text: 'Comparar la inasistencia según la edad, la zona de residencia y el recordatorio de la cita.', note: '¿En quiénes es mayor? Usa la descripción anterior.' },
    { label: 'Peldaño 3 · Nivel 3 · Analizar', text: 'Establecer la relación entre el olvido de la cita y la inasistencia.', note: '¿Con qué se relaciona? Mismo nivel que el anterior: no baja.' },
];

const ERRORES = [
    { error: 'Usar dos verbos en un objetivo', example: '«Identificar y analizar las causas de la deserción».', fix: 'Separa en dos objetivos o quédate con el verbo más amplio: «Analizar las causas…».' },
    { error: 'Verbos que no se pueden verificar', example: '«Conocer la opinión de los estudiantes».', fix: '¿Cómo compruebas que alguien «conoció»? Usa «Identificar», «Describir» o «Caracterizar».' },
    { error: 'Confundir objetivos con actividades', example: '«Aplicar una encuesta a 200 estudiantes».', fix: 'La encuesta es un medio; va en la metodología. El objetivo es lo que obtienes con ella: «Describir las prácticas…».' },
    { error: 'Prometer resolver el problema', example: '«Eliminar la deserción en la universidad».', fix: 'Una investigación genera conocimiento o propuestas; no garantiza la solución. «Proponer estrategias para reducir…».' },
    { error: 'Un general que no responde la pregunta', example: 'Pregunta sobre factores de deserción; objetivo sobre una aplicación móvil.', fix: 'El general debe decir lo mismo que el título y la pregunta, con un verbo.' },
    { error: 'Específicos que son el general partido en trozos de tema', example: '«Analizar los factores económicos… Analizar los factores académicos… Analizar los factores sociales…».', fix: 'Los específicos son peldaños que suben de nivel entre sí (identificar → describir → analizar → explicar…), no subtemas con el mismo verbo.' },
    { error: 'Demasiados específicos', example: 'Siete objetivos específicos para un trabajo de un semestre.', fix: 'Entre 2 y 4. Cada uno debe tener resultado propio en tu informe.' },
];

const JUZGA_QUIZ = [
    {
        text: '«Conocer las causas de la baja venta en la tienda.»',
        options: ['Está bien', 'Hay que mejorarlo'],
        answer: 1,
        why: '«Conocer» no se puede verificar y no dice en qué tienda ni en qué periodo. Mejor: «Identificar las causas de la disminución de las ventas en una tienda de barrio de Montería durante 2025».',
    },
    {
        text: '«Determinar la relación entre el uso del celular en clase y el rendimiento en matemáticas de los estudiantes de grado 9 de una institución educativa de Lorica.»',
        options: ['Está bien', 'Hay que mejorarlo'],
        answer: 0,
        why: 'Un solo verbo verificable, dos variables, población y lugar.',
    },
    {
        text: '«Realizar entrevistas a los docentes y tabular los resultados.»',
        options: ['Está bien', 'Hay que mejorarlo'],
        answer: 1,
        why: 'Son actividades, no objetivos, y tiene dos verbos. ¿Qué quieres obtener de las entrevistas?',
    },
];

const ANTES_DESPUES = [
    { antes: 'Mejorar la atención en la clínica.', despues: 'Proponer estrategias para reducir el tiempo de espera de los pacientes de urgencias de una clínica de Montería.', porque: 'Pasa de una promesa vaga a un producto concreto, con población y lugar.' },
    { antes: 'Investigar y analizar el consumo de agua.', despues: 'Caracterizar el consumo de agua en los hogares rurales de Lorica, Córdoba.', porque: 'Un solo verbo verificable y un objeto delimitado.' },
    { antes: 'Hacer una encuesta para saber qué piensan los clientes.', despues: 'Describir la percepción de los clientes sobre la calidad del servicio de una tienda en línea.', porque: 'Convierte la actividad (encuesta) en el resultado que se busca.' },
];

const REPASO = [
    {
        text: '¿Cuántos verbos debe tener cada objetivo?',
        options: ['Uno', 'Dos, para que sea completo', 'Los que hagan falta'],
        answer: 0,
        why: 'Un verbo por objetivo: así se puede verificar si se cumplió.',
    },
    {
        text: '¿De dónde sale el objetivo general?',
        options: ['De la metodología', 'Del título y la pregunta', 'De la justificación'],
        answer: 1,
        why: 'Es la pregunta convertida en acción, con el verbo del título en infinitivo.',
    },
    {
        text: '¿Qué diferencia a un objetivo de una actividad?',
        options: ['El objetivo es más largo', 'El objetivo dice qué se obtiene; la actividad, cómo se hace', 'No hay diferencia'],
        answer: 1,
        why: 'Las actividades (encuestar, tabular) van en la metodología y el cronograma.',
    },
];

/* ---------- Piezas visuales ---------- */

const Anatomia = () => (
    <div className="ide-panel">
        <h3>Un objetivo general, por partes</h3>
        <p className="obj-sentence">
            {PARTES.map((parte) => <mark key={parte.key} data-part={parte.color} data-active="true">{parte.text}</mark>)}
        </p>
        <ul className="pla-map">
            {PARTES.map((parte) => <li key={parte.key} data-part={parte.color}><span>{parte.label}</span><p>{parte.what}</p></li>)}
        </ul>
    </div>
);

const Cadena = ({ title, items }) => (
    <div className="ide-panel">
        <h3>{title}</h3>
        <ol className="obj-chain">
            {items.map((item) => (
                <li key={item.label}>
                    <span>{item.label}</span>
                    <p>{item.text}</p>
                    <small>{item.note}</small>
                </li>
            ))}
        </ol>
    </div>
);

const AntesDespues = () => {
    const [open, setOpen] = useState({});
    return (
        <div className="ide-panel">
            <h3>Mira cómo se fortalece cada objetivo</h3>
            <ul className="tit-fixes">
                {ANTES_DESPUES.map((item, index) => (
                    <li key={item.antes}>
                        <p className="tit-before"><XCircle size={16} aria-hidden="true" /> {item.antes}</p>
                        {open[index] ? (
                            <>
                                <p className="tit-after"><CheckCircle2 size={16} aria-hidden="true" /> {item.despues}</p>
                                <small>{item.porque}</small>
                            </>
                        ) : (
                            <button type="button" className="ide-btn ide-btn--ghost" onClick={() => setOpen((prev) => ({ ...prev, [index]: true }))}>
                                Primero intenta mejorarlo tú; luego mira la versión fuerte
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

/* ---------- Constructor y revisión ---------- */

const OBJ_FORM = { general: '', especificos: ['', '', ''] };

const useObjetivosState = () => {
    const [form, setForm] = useProjectField('objetivosForm', OBJ_FORM);
    const [objetivos, setObjetivos] = useProjectField('objetivos', '');
    const [, setObjetivoGeneral] = useProjectField('objetivoGeneral', '');
    const [titulo] = useProjectField('titulo', '');
    const [pregunta] = useProjectField('pregunta', '');
    const [tituloForm] = useProjectField('tituloForm', null);
    const [idea] = useProjectField('idea', null);
    const [arbolGuardado] = useProjectField('arbolObjetivos', null);
    // Árbol de objetivos armado en su página: de su centro sale el general y de sus medios, los específicos.
    const arbol = leerArbolObjetivos({ arbolObjetivos: arbolGuardado });
    const f = { ...OBJ_FORM, ...(form || {}) };
    if (!Array.isArray(f.especificos) || f.especificos.length === 0) f.especificos = ['', '', ''];
    const update = (patch) => setForm((prev) => ({ ...OBJ_FORM, ...(prev || {}), ...patch }));
    const i = idea || {};
    const t = tituloForm || {};
    return {
        f, update, objetivos, setObjetivos, setObjetivoGeneral, titulo, pregunta, idea: i,
        arbol: arbol.propio && arbolCompleto(arbol) ? arbol : null,
        quien: clean(t.quien || i.quien), donde: clean(t.donde || i.donde),
    };
};

// Pregunta que responde cada nivel de la escalera.
const PREGUNTA_NIVEL = {
    1: '¿Qué hay?', 2: '¿Cómo es?', 3: '¿Con qué se relaciona?', 4: '¿Por qué ocurre?', 5: '¿Qué tan bien funciona?', 6: '¿Qué se propone?',
};
const nombresDe = (grupos) => grupos.map((grupo) => grupo.nombre.toLowerCase()).join(' o ');

// Verbos de un objetivo, agrupados por los 6 niveles; los niveles sugeridos (y el del verbo actual) aparecen abiertos.
const Verbos = ({ value, sugeridos = [], excluir = '', onPick }) => {
    const current = firstWord(value).toLowerCase();
    const nivelActual = nivelDe(value);
    return (
        <div className="obj-verbs-wrap" role="group" aria-label="Elegir el verbo de este objetivo">
            {NIVELES.map((grupo) => {
                const sugerido = sugeridos.includes(grupo.nivel);
                const verbs = grupo.verbs.filter((verb) => verb.toLowerCase() !== excluir);
                return (
                    <details className="obj-level-group" key={grupo.nivel} open={sugerido || grupo.nivel === nivelActual} data-sugerido={sugerido || undefined}>
                        <summary>
                            <span className="obj-level" data-nivel={grupo.nivel}>Nivel {grupo.nivel} · {grupo.nombre}</span>
                            <small>{PREGUNTA_NIVEL[grupo.nivel]} · {verbs.length} verbos{sugerido ? ' · sugerido para este peldaño' : ''}</small>
                        </summary>
                        <div className="obj-verbs">
                            {verbs.map((verb) => (
                                <button
                                    key={verb}
                                    type="button"
                                    className="ide-chip"
                                    aria-pressed={current === verb.toLowerCase()}
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => onPick(verb)}
                                >
                                    {verb}
                                </button>
                            ))}
                        </div>
                    </details>
                );
            })}
        </div>
    );
};

const Constructor = ({ intro, onNavigate }) => {
    const { f, update, setObjetivos, setObjetivoGeneral, titulo, idea, quien, donde, arbol } = useObjetivosState();
    const [saved, setSaved] = useState(false);
    const [active, setActive] = useState('general');
    const prefilled = useRef(false);
    const desdeTitulo = generalDesdeTitulo(titulo);
    const alcance = idea.alcance || alcanceOfVerb(verbAtStart(titulo))?.id;
    const sugeridos = especificosSugeridos({ idea, alcance, quien, donde, general: f.general });

    // La primera vez, el objetivo general sale del título (Análisis → Analizar).
    useEffect(() => {
        if (prefilled.current) return;
        prefilled.current = true;
        if (!f.general.trim() && desdeTitulo) update({ general: desdeTitulo });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const list = f.especificos;
    const text = formatObjetivos(f.general, list);
    const filled = list.filter((item) => item.trim()).length;
    const touch = () => setSaved(false);
    const setEspecifico = (index, value) => { touch(); update({ especificos: list.map((item, i) => (i === index ? value : item)) }); };
    const addEspecifico = () => { touch(); update({ especificos: [...list, ''] }); };
    const removeEspecifico = (index) => { touch(); update({ especificos: list.filter((_, i) => i !== index) }); };
    const putVerb = (target, verb) => {
        touch();
        const replaceVerb = (value) => {
            const rest = String(value || '').trim();
            return isInfinitive(firstWord(rest)) ? `${verb} ${rest.split(/\s+/).slice(1).join(' ')}` : `${verb} ${rest}`;
        };
        if (target === 'general') update({ general: replaceVerb(f.general) });
        else {
            const index = Number(target.replace('esp-', ''));
            update({ especificos: list.map((item, i) => (i === index ? replaceVerb(item) : item)) });
        }
        setActive(target);
        document.getElementById(target === 'general' ? 'obj-general' : `obj-${target}`)?.focus();
    };
    // La escalera es entre los específicos: cada uno sube de nivel respecto al anterior.
    const verboGeneral = firstWord(f.general).toLowerCase();
    const problemas = problemasEscalera('', list);
    const peldano = (index) => verbosEntre(rangoPeldano(index, list.length));
    const loadSuggestions = () => {
        touch();
        update({ especificos: list.map((item, index) => item.trim() || sugeridos[index] || '') });
    };
    // Específicos desde el árbol de objetivos: la IA convierte cada medio en un objetivo (verbo en infinitivo),
    // ordenados de lo simple a lo complejo. Solo llena las cajas vacías: lo que el estudiante ya escribió no se toca.
    const [pensando, setPensando] = useState(false);
    const [errorArbol, setErrorArbol] = useState('');
    const vacios = list.filter((item) => !item.trim()).length;
    const desdeArbol = async () => {
        if (!arbol) return;
        setErrorArbol('');
        setPensando(true);
        try {
            const cuantos = Math.min(4, Math.max(list.length, Math.min(arbol.causas.length, 4)));
            const r = await groq.chat.completions.create({
                messages: [
                    { role: 'system', content: 'Ayudas a un estudiante a redactar los objetivos específicos de su proyecto de investigación a partir de su árbol de objetivos. Cada objetivo específico sale de un medio del árbol. No agregas ideas que no estén en el árbol, ni cifras, ni autores. Respondes solo JSON válido en español.' },
                    { role: 'user', content: `Objetivo general: ${f.general.trim() || arbol.problema}\nObjetivo central del árbol: ${arbol.problema}\nMedios del árbol:\n${arbol.causas.map((m, i) => `${i + 1}. ${m}`).join('\n')}\nPoblación: ${quien || '(la del objetivo general)'}\nLugar: ${donde || '(el del objetivo general)'}\n\nRedacta exactamente ${cuantos} objetivos específicos:\n- Cada uno empieza con un verbo en infinitivo y dice qué se hará y sobre qué, en máximo 22 palabras.\n- Cada uno responde a un medio del árbol${arbol.causas.length > cuantos ? ' (agrupa los medios parecidos)' : ''}.\n- Van ordenados de lo simple a lo complejo, como peldaños: primero conocer o describir (Identificar, Caracterizar, Describir), luego analizar o determinar, y al final proponer o diseñar si aplica.\n- No repitas el verbo del objetivo general ni uses dos veces el mismo verbo.\n- Son pasos para lograr el objetivo general, no beneficios ni fines.\nSin punto final y sin numeración.\n\nResponde exactamente con este JSON: {"especificos": ["…"]}` },
                ],
                temperature: 0.3,
                max_tokens: 700,
                response_format: { type: 'json_object' },
            });
            const content = r.choices?.[0]?.message?.content || '';
            const json = JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1));
            const propuestos = (Array.isArray(json.especificos) ? json.especificos : []).map((x) => String(x ?? '').replace(/\s+/g, ' ').replace(/[.\s]+$/, '').trim()).filter(Boolean).slice(0, 4);
            if (!propuestos.length) throw new Error('La IA no devolvió objetivos. Inténtalo de nuevo.');
            touch();
            // Se respetan los ya escritos, en su lugar; las propuestas ocupan las cajas vacías, en orden.
            const base = [...list, ...Array(Math.max(0, propuestos.length - list.length)).fill('')];
            const escritos = new Set(base.map((x) => x.trim().toLowerCase()).filter(Boolean));
            const libres = propuestos.filter((x) => !escritos.has(x.toLowerCase()));
            update({ especificos: base.map((item) => (item.trim() ? item : libres.shift() || '')) });
        } catch (err) {
            setErrorArbol(err.message || 'No se pudieron proponer los objetivos.');
        } finally {
            setPensando(false);
        }
    };
    const save = () => {
        if (!text) return;
        setObjetivos(text);
        setObjetivoGeneral(f.general.trim() ? `${capital(clean(f.general))}.` : '');
        setSaved(true);
    };
    // Guardado automático: lo redactado pasa a Mi proyecto sin tener que tocar «Guardar».
    useAutoGuardar(text, save);

    const fieldChecks = (value) => (value.trim() ? checkObjetivo(value).filter((check) => !check.ok) : []);
    const Warnings = ({ value }) => {
        const bad = fieldChecks(value);
        if (!value.trim()) return null;
        return bad.length === 0
            ? <small className="obj-ok"><CheckCircle2 size={14} aria-hidden="true" /> Bien formulado</small>
            : <small className="obj-warn"><AlertTriangle size={14} aria-hidden="true" /> {bad[0].detail}</small>;
    };

    return (
        <div className="pla-builder-wrap">
            <header className="pla-builder-head">
                <div>{intro}</div>
                <div className="pla-status">
                    <p className="obj-count"><b>{f.general.trim() ? '1 general' : 'Sin general'}</b> · {filled} {filled === 1 ? 'específico' : 'específicos'}</p>
                    <button type="button" className="ide-btn ide-btn--primary" disabled={!text} onClick={save}>
                        <CheckCircle2 size={17} /> Guardar como mis objetivos
                    </button>
                    {saved && <p className="ide-feedback ide-feedback--ok" role="status"><CheckCircle2 size={16} /><span>Guardado. Ya aparece en Mi proyecto.</span></p>}
                </div>
            </header>

            <div className="pla-builder">
                <form className="obj-form" onSubmit={(event) => { event.preventDefault(); save(); }} noValidate>
                    <div className="input-group pla-part" data-active={active === 'general'}>
                        <label htmlFor="obj-general"><mark data-part="que" data-active="true">G</mark> Objetivo general</label>
                        <textarea
                            id="obj-general"
                            className="textarea-field"
                            rows={3}
                            value={f.general}
                            onChange={(event) => { touch(); update({ general: event.target.value }); }}
                            onFocus={() => setActive('general')}
                            placeholder={`Ej: ${desdeTitulo || 'Analizar los factores asociados a la inasistencia a citas médicas en los pacientes de consulta externa de un hospital de Sincelejo'}`}
                        />
                        <Warnings value={f.general} />
                        {desdeTitulo && f.general.trim() !== desdeTitulo && (
                            <button type="button" className="ide-link" onClick={() => { touch(); update({ general: desdeTitulo }); }}>Usar el de mi título: «{desdeTitulo}»</button>
                        )}
                    </div>

                    {/* El árbol de objetivos a la vista: de aquí salen el general y los específicos. */}
                    {arbol ? (
                        <div className="obj-arbol">
                            <b><GitFork size={15} aria-hidden="true" /> Tu árbol de objetivos</b>
                            <p><span>Objetivo central</span>{arbol.problema}</p>
                            <p><span>Medios · de aquí salen tus específicos</span>{arbol.causas.join(' · ')}</p>
                            <div className="obj-arbol-acciones">
                                <button type="button" className="ide-btn ide-btn--ghost" onClick={desdeArbol} disabled={pensando || vacios === 0}>
                                    {pensando ? <Loader2 size={15} className="obj-gira" /> : <Sparkles size={15} />} {pensando ? 'Redactando…' : 'Sacar los específicos de mis medios'}
                                </button>
                                {f.general.trim() !== arbol.problema && (
                                    <button type="button" className="ide-link" onClick={() => { touch(); update({ general: arbol.problema }); }}>Usar el objetivo central como objetivo general</button>
                                )}
                            </div>
                            <small>{vacios === 0 ? 'Todas las cajas tienen texto: borra un específico para volver a llenarlo desde el árbol.' : 'Llena solo las cajas vacías; lo que ya escribiste no se toca. Revisa la redacción: son un punto de partida.'}</small>
                            {errorArbol && <small className="obj-warn"><AlertTriangle size={14} aria-hidden="true" /> {errorArbol}</small>}
                        </div>
                    ) : onNavigate && (
                        <p className="obj-arbol obj-arbol--falta">
                            Tus objetivos salen de tu árbol de objetivos: el centro es el general y cada medio, un específico. <button type="button" className="ide-link" onClick={() => onNavigate('arbolobjetivos')}>Armar mi árbol de objetivos</button>
                        </p>
                    )}

                    <div className="obj-esp-head">
                        <h3>Objetivos específicos</h3>
                        {sugeridos.length > 0 && list.some((item) => !item.trim()) && (
                            <button type="button" className="ide-btn ide-btn--ghost" onClick={loadSuggestions}><Wand2 size={15} /> Llenar los vacíos con sugerencias de mi idea</button>
                        )}
                    </div>
                    {list.map((value, index) => (
                        <div className="input-group pla-part obj-esp" data-active={active === `esp-${index}`} key={index}>
                            <label htmlFor={`obj-esp-${index}`}><mark data-part={['paraque', 'quien', 'donde', 'cuando'][index] || 'cuando'} data-active="true">{index + 1}</mark> Peldaño {index + 1} · {capital(nombresDe(peldano(index)))} <small className="obj-step-hint">{peldano(index).map((grupo) => PREGUNTA_NIVEL[grupo.nivel]).join(' ')}</small></label>
                            <div className="obj-esp-row">
                                <textarea
                                    id={`obj-esp-${index}`}
                                    className="textarea-field"
                                    rows={2}
                                    value={value}
                                    onChange={(event) => setEspecifico(index, event.target.value)}
                                    onFocus={() => setActive(`esp-${index}`)}
                                    placeholder={sugeridos[index] ? `Ej: ${sugeridos[index]}` : `Ej: ${ESCALERA[Math.min(index, 2)].text.replace(/\.$/, '')}`}
                                />
                                {list.length > 2 && (
                                    <button type="button" className="obj-remove" onClick={() => removeEspecifico(index)} aria-label={`Quitar el objetivo específico ${index + 1}`}><Trash2 size={16} /></button>
                                )}
                            </div>
                            <Verbos value={value} sugeridos={peldano(index).map((grupo) => grupo.nivel)} excluir={verboGeneral} onPick={(verb) => putVerb(`esp-${index}`, verb)} />
                            {problemas[index] === 'baja' && <small className="obj-warn"><AlertTriangle size={14} aria-hidden="true" /> Baja de nivel respecto al anterior: ordena los específicos de lo simple a lo complejo.</small>}
                            {!problemas[index] && <Warnings value={value} />}
                        </div>
                    ))}
                    {list.length < 4 && (
                        <button type="button" className="ide-btn ide-btn--ghost obj-add" onClick={addEspecifico}><Plus size={15} /> Agregar un específico (máximo 4)</button>
                    )}
                    <p className="ide-hint">Tab en una caja vacía escribe el ejemplo armado con tu idea.</p>
                </form>

                <aside className="pla-side" aria-label="Tus objetivos">
                    <p className="ide-synth-label">Así quedan tus objetivos</p>
                    <div className="pla-preview obj-preview" aria-live="polite">
                        {text ? (
                            <>
                                <h4>Objetivo general</h4>
                                <p data-active={active === 'general'}>
                                    {f.general.trim() ? `${capital(clean(f.general))}.` : <span className="tit-empty">Falta el objetivo general.</span>}
                                </p>
                                <h4>Objetivos específicos <small>(en escalera)</small></h4>
                                <ol className="obj-stairs">
                                    {list.map((item, index) => item.trim() && (
                                        <li key={index} data-active={active === `esp-${index}`} data-problem={problemas[index] || undefined} style={{ '--step': Math.max(nivelDe(item), 1) - 1 }}>
                                            {nivelDe(item) > 0 && <span className="obj-level" data-nivel={nivelDe(item)}>Nivel {nivelDe(item)}</span>}
                                            {capital(clean(item))}.
                                        </li>
                                    ))}
                                </ol>
                                <p className={`obj-ladder-status ${problemas.some(Boolean) ? 'is-bad' : ''}`}>
                                    {problemas.some(Boolean)
                                        ? <><AlertTriangle size={14} aria-hidden="true" /> La escalera tiene un peldaño fuera de orden.</>
                                        : <><CheckCircle2 size={14} aria-hidden="true" /> Escalera en orden: de lo simple a lo complejo.</>}
                                </p>
                            </>
                        ) : <span className="tit-empty">Escribe tu objetivo general y tus específicos, y verás aquí cómo quedan.</span>}
                    </div>
                </aside>
            </div>
        </div>
    );
};

const CRITERIOS = [
    { label: 'Claros', text: 'Un verbo en infinitivo por objetivo, verificable.' },
    { label: 'Alineados', text: 'El general dice lo mismo que tu título y tu pregunta.' },
    { label: 'En escalera', text: 'Los específicos suben de nivel, de lo simple a lo complejo.' },
    { label: 'Alcanzables', text: 'Se pueden lograr con tu tiempo y recursos.' },
    { label: 'Logros', text: 'Dicen qué se obtiene, no qué actividades se hacen.' },
];

const parseObjetivos = (raw) => {
    const lines = String(raw || '').split('\n').map((line) => line.trim()).filter(Boolean);
    const general = [];
    const especificos = [];
    let mode = 'general';
    lines.forEach((line) => {
        if (/espec[ií]fico/i.test(line) && (/^#/.test(line) || /:$/.test(line) || line.length < 30)) { mode = 'esp'; return; }
        if (/general/i.test(line) && (/^#/.test(line) || /:$/.test(line) || line.length < 30)) { mode = 'general'; return; }
        const item = line.replace(/^(?:[-*•]|\d+[.)])\s+/, '');
        if (mode === 'general') general.push(item); else especificos.push(item);
    });
    return { general: general.join(' '), especificos };
};

const Revision = ({ intro }) => {
    const { f, objetivos, titulo, pregunta } = useObjetivosState();
    const own = objetivos.trim() || formatObjetivos(f.general, f.especificos);
    const [text, setText] = useState(own);
    const target = text.trim();
    const isOwn = target === own;
    const parsed = parseObjetivos(target);
    const checks = checkConjunto(parsed.general, parsed.especificos, { titulo: isOwn ? titulo : '', pregunta: isOwn ? pregunta : '' });
    const passed = checks.filter((item) => item.ok).length;
    return (
        <>
            <div className="ide-synth-left">
                {intro}
                <ul className="tit-criteria">
                    {CRITERIOS.map((item) => <li key={item.label}><b>{item.label}</b> {item.text}</li>)}
                </ul>
                <label htmlFor="obj-revisar" className="ide-synth-label">Objetivos a revisar</label>
                <textarea
                    id="obj-revisar"
                    className="textarea-field tit-review-input"
                    rows={8}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder={'Objetivo general:\n…\n\nObjetivos específicos:\n1. …\n2. …'}
                />
                {!isOwn && own && <button type="button" className="ide-link" onClick={() => setText(own)}>Volver a mis objetivos</button>}
            </div>
            <div className="ide-panel">
                <h3>{target ? `Cumple ${passed} de ${checks.length} criterios` : 'Criterios que se revisan'}</h3>
                <ul className="tit-checks">
                    {checks.map((item) => (
                        <li key={item.id} data-ok={target ? item.ok : undefined}>
                            {!target ? <Target size={18} aria-hidden="true" /> : item.ok ? <CheckCircle2 size={18} aria-hidden="true" /> : <AlertTriangle size={18} aria-hidden="true" />}
                            <span><b>{item.label}</b>{target && !item.ok && item.detail}</span>
                        </li>
                    ))}
                </ul>
                <p className="ide-hint">
                    {isOwn ? 'Revisa la forma de tus objetivos guardados.' : 'Revisando un texto distinto al tuyo: se omite la comparación con tu título y tu pregunta.'} Que sean alcanzables lo confirma tu asesor.
                </p>
            </div>
        </>
    );
};

/* ---------- Clase ---------- */

const Objetivos = ({ onNavigate }) => {
    const [titulo] = useProjectField('titulo', '');
    const [pregunta] = useProjectField('pregunta', '');
    const [objetivos] = useProjectField('objetivos', '');
    const desdeTitulo = generalDesdeTitulo(titulo);

    const renderSlide = ({ slide, heading, goToSection, sectionMinutes, totalMinutes }) => ({
        portada: (
            <>
                <div>
                    {heading}
                    <p>Los objetivos dicen qué va a lograr tu investigación. El general responde tu pregunta; los específicos son los pasos para llegar a él. Todo lo que hagas después (metodología, instrumentos, cronograma) sale de aquí.</p>
                    <p><strong>Al terminar esta clase podrás:</strong></p>
                    <ul className="ide-bullets">
                        <li>Distinguir el objetivo general de los específicos.</li>
                        <li>Convertir tu título y tu pregunta en un objetivo general.</li>
                        <li>Elegir verbos verificables según lo que quieres lograr.</li>
                        <li>Ordenar los específicos como una secuencia lógica.</li>
                        <li>Redactar los tuyos y revisarlos con criterios.</li>
                    </ul>
                    {(clean(titulo) || clean(pregunta)) && (
                        <div className="tit-from-idea">
                            <span>Partirás de</span>
                            {clean(titulo) && <p>{titulo}</p>}
                            {clean(pregunta) && <p>{pregunta}</p>}
                        </div>
                    )}
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
        quees: (
            <>
                <div>
                    {heading}
                    <ul className="ide-list">
                        <li><Target size={18} /><span><b>Objetivo general</b>Uno solo. Expresa el propósito de toda la investigación y responde tu pregunta.</span></li>
                        <li><CheckCircle2 size={18} /><span><b>Objetivos específicos</b>Entre dos y cuatro. Son los logros parciales que, sumados, cumplen el general.</span></li>
                        <li><XCircle size={18} /><span><b>No son actividades</b>Encuestar, tabular o revisar bibliografía van en la metodología.</span></li>
                    </ul>
                    <p className="ide-hint">Piensa en el general como el destino y en los específicos como las paradas del camino.</p>
                </div>
                <Opciones title="¿Cuál es el general?" questions={QUEES_QUIZ} />
            </>
        ),
        origen: (
            <>
                <div>
                    {heading}
                    <p>No inventes el objetivo general: ya está en tu título y tu pregunta. Toma el verbo sustantivado del título y pásalo a infinitivo.</p>
                    <ul className="ide-bullets">
                        <li>Análisis → Analizar · Descripción → Describir</li>
                        <li>Diseño → Diseñar · Evaluación → Evaluar</li>
                        <li>Caracterización → Caracterizar · Propuesta → Proponer</li>
                    </ul>
                    {desdeTitulo && <div className="tit-saved"><span>Con tu título quedaría</span><p>{desdeTitulo}.</p></div>}
                </div>
                <Cadena title="Una misma idea, tres formas" items={ORIGEN} />
            </>
        ),
        anatomia: (
            <>
                <div>
                    {heading}
                    <p>Un buen objetivo responde cinco preguntas: qué harás, sobre qué, en quiénes, dónde y, en el general, para qué.</p>
                    <p className="ide-hint">Los específicos pueden ser más cortos: si la población y el lugar ya están en el general, no hace falta repetirlos completos.</p>
                </div>
                <Anatomia />
            </>
        ),
        verbos: (
            <>
                <div>
                    {heading}
                    <p>El verbo dice qué tan lejos llega tu investigación. Escoge el que corresponde a lo que quieres lograr y úsalo en infinitivo.</p>
                    <ul className="ide-list">
                        <li><XCircle size={18} /><span><b>Evita</b>Conocer, saber, entender, aprender, investigar, estudiar: no se pueden verificar. «Comprender» e «interpretar» sí valen en objetivos cualitativos.</span></li>
                        <li><CheckCircle2 size={18} /><span><b>Prefiere</b>Verbos que dejan un producto: una descripción, una relación, una comparación, una propuesta.</span></li>
                    </ul>
                </div>
                <Pestanas title="Verbos según lo que quieres lograr" name="obj-verbos" items={VERBOS} />
            </>
        ),
        secuencia: (
            <>
                <div>
                    {heading}
                    <p>Los objetivos específicos forman una escalera: los verbos tienen niveles, de lo simple a lo complejo, y cada específico es un peldaño que sube respecto al anterior. Al subirlos todos se logra el objetivo general.</p>
                    <ol className="obj-levels">
                        {[...NIVELES].reverse().map((item) => (
                            <li key={item.nivel} data-nivel={item.nivel}><b>Nivel {item.nivel} · {item.nombre}</b> {PREGUNTA_NIVEL[item.nivel]} <small>{item.verbs.slice(0, 4).join(', ')}…</small></li>
                        ))}
                    </ol>
                    <p className="ide-hint">Regla: cada específico está en el mismo nivel o más arriba que el anterior; nunca baja.</p>
                </div>
                <Cadena title="Ejemplo: tres peldaños" items={ESCALERA} />
            </>
        ),
        alineacion: (
            <>
                <div>
                    {heading}
                    <ul className="ide-list">
                        <li><Target size={18} /><span><b>Título ↔ objetivo general</b>Mismo objeto, población y lugar; el verbo pasa de sustantivo a infinitivo.</span></li>
                        <li><Target size={18} /><span><b>Pregunta ↔ objetivo general</b>Si logras el objetivo, tienes la respuesta a la pregunta.</span></li>
                        <li><Target size={18} /><span><b>Específicos ↔ resultados</b>Cada específico tendrá su apartado de resultados en el informe final.</span></li>
                        <li><Target size={18} /><span><b>Específicos ↔ metodología</b>Para cada específico definirás después la técnica y el instrumento.</span></li>
                    </ul>
                </div>
                <div className="ide-panel">
                    <h3>Tu cadena hasta ahora</h3>
                    <ol className="obj-chain">
                        <li><span>Título</span><p>{clean(titulo) || 'Aún no has guardado tu título.'}</p></li>
                        <li><span>Pregunta</span><p>{clean(pregunta) || 'Aún no has guardado tu pregunta.'}</p></li>
                        <li><span>Objetivo general</span><p>{desdeTitulo ? `${desdeTitulo}.` : 'Lo construirás en la siguiente sección.'}</p></li>
                    </ol>
                </div>
            </>
        ),
        errores: (
            <>
                <div>
                    {heading}
                    <p>Revisa si tu primera versión cae en alguno de estos errores.</p>
                </div>
                <div className="ide-panel">
                    <h3>Abre cada error para ver cómo corregirlo</h3>
                    <div className="ide-accordion">
                        {ERRORES.map((item, index) => (
                            <details key={item.error} open={index === 0}>
                                <summary>{item.error}</summary>
                                <p><em>{item.example}</em></p>
                                <p><strong>Cómo corregirlo:</strong> {item.fix}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </>
        ),
        juzga: (
            <>
                <div>
                    {heading}
                    <p>Lee cada objetivo y decide si sirve tal como está.</p>
                    <p className="ide-hint">Para discutir en parejas: ¿cómo mejorarían los mejorables?</p>
                </div>
                <Opciones title="Juzga cada objetivo" questions={JUZGA_QUIZ} />
            </>
        ),
        reescribe: (
            <>
                <div>
                    {heading}
                    <p>Casi todos los objetivos débiles se arreglan igual: un verbo verificable, un objeto delimitado y un logro en lugar de una actividad.</p>
                </div>
                <AntesDespues />
            </>
        ),
        repaso: (
            <>
                <div>
                    {heading}
                    <p>Tres preguntas para comprobar lo aprendido.</p>
                </div>
                <Opciones title="Cuestionario de repaso" questions={REPASO} />
            </>
        ),
        cierre: (
            <>
                <div>
                    {heading}
                    <ul className="ide-bullets">
                        <li>Un objetivo general que responde tu pregunta, con el verbo de tu título.</li>
                        <li>De dos a cuatro específicos en escalera: cada uno sube de nivel respecto al anterior.</li>
                        <li>Un solo verbo en infinitivo por objetivo, verificable.</li>
                        <li>Logros, no actividades; alcanzables, sin prometer resolver el problema.</li>
                    </ul>
                </div>
                <div className="ide-panel">
                    <h3>Siguiente paso</h3>
                    {objetivos.trim()
                        ? <div className="tit-saved"><span>Tus objetivos guardados</span><p>{parseObjetivos(objetivos).especificos.length} específicos</p></div>
                        : <p>Los redactarás en la siguiente sección: el objetivo general ya viene armado con tu título.</p>}
                    <p>Después, la justificación explicará por qué vale la pena lograrlos.</p>
                </div>
            </>
        ),
        construye: (
            <Constructor
                onNavigate={onNavigate}
                intro={(
                    <>
                        {heading}
                        <p>Tu objetivo general ya viene de tu título y tus específicos salen de los medios de tu árbol de objetivos. Escríbelos como peldaños de una escalera: cada uno trae los verbos de su paso; toca uno para usarlo.</p>
                    </>
                )}
            />
        ),
        revision: (
            <Revision
                intro={(
                    <>
                        {heading}
                        <p>Revisa tus objetivos antes de llevarlos a tu asesor. También puedes pegar los objetivos de otro trabajo para analizarlos.</p>
                    </>
                )}
            />
        ),
    })[slide.id];

    return (
        <SlideDeck
            sections={SECTIONS}
            slides={SLIDES}
            storageKey={SLIDE_KEY}
            label="Objetivos de investigación"
            teoria={TEORIA}
            renderSlide={renderSlide}
            finish={onNavigate ? { label: 'Escribir la justificación', onClick: () => onNavigate('justificacion') } : null}
        />
    );
};

export default Objetivos;
