import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    AlertTriangle, ArrowRight, BookOpen, CheckCircle2, Cpu, Search, Target, Users, XCircle,
} from 'lucide-react';
import SlideDeck, { Opciones, Pestanas } from './deck/SlideDeck';
import { useProjectField } from '../context/ProjectContext';
import { useAutoGuardar } from '../hooks/useAutoGuardar';
import { groq } from '../services/api';
import { ALCANCES, ALL_VERBS, VERBS, alcanceOfVerb, findVerb, verbAtStart } from '../data/alcances';
import { objetoTitulo, proposito } from '../data/ejemplos';
import './Titulo.css';
import { construccionPrimero } from './deck/orden';

/* Clase de 60 minutos: la suma de `min` de todas las diapositivas. */
const SECTIONS = construccionPrimero([
    { id: 'apertura', label: 'Apertura' },
    { id: 'anatomia', label: 'Anatomía' },
    { id: 'calidad', label: 'Calidad' },
    { id: 'cierre', label: 'Cierre' },
    { id: 'construccion', label: 'Construcción' },
    { id: 'revision', label: 'Revisión' },
]);

const SLIDES = construccionPrimero([
    { id: 'portada', section: 'apertura', min: 3, title: 'El título: la puerta de tu investigación' },
    { id: 'funciones', section: 'apertura', min: 3, title: '¿Para qué sirve un título?' },
    { id: 'tema', section: 'apertura', min: 3, title: 'Del tema al título' },
    { id: 'anatomia', section: 'anatomia', min: 5, title: 'Las partes de un buen título' },
    { id: 'verbo', section: 'anatomia', min: 5, title: 'El verbo sustantivado' },
    { id: 'variables', section: 'anatomia', min: 5, title: 'Las variables en el título' },
    { id: 'delimitar', section: 'anatomia', min: 3, title: 'Población, lugar y tiempo' },
    { id: 'errores', section: 'calidad', min: 3, title: 'Siete errores frecuentes' },
    { id: 'juzga', section: 'calidad', min: 4, title: '¿Bueno o mejorable?' },
    { id: 'reescribe', section: 'calidad', min: 4, title: 'Antes y después' },
    { id: 'repaso', section: 'cierre', min: 2, title: 'Repaso' },
    { id: 'cierre', section: 'cierre', min: 1, title: 'Lo que te llevas' },
    { id: 'construye', section: 'construccion', min: 8, title: 'Construye tu título' },
    { id: 'prueba', section: 'revision', min: 7, title: 'Qué hace bueno a un título' },
]);

const SLIDE_KEY = 'projectsia:titulo:diapositiva';

// Misma forma que guarda la Ideación al usar una idea de la IA.
const TITULO_FORM = {
    accion: '', objeto: '', donde: '', quien: '', cuando: '', paraque: '',
    includeParaque: true, includeQuien: true, includeDonde: true, includeCuando: true,
};

/* ---------- Armado del título ---------- */

const clean = (text) => String(text || '').trim().replace(/[\s.,;:]+$/, '');
const startsWithAny = (text, words) => new RegExp(`^(${words.join('|')})\\b`, 'i').test(text);

// Partes del título en orden; cada una añade su conector si el estudiante no lo escribió.
const titleParts = (form) => {
    const parts = [];
    const accion = clean(form.accion);
    let objeto = clean(form.objeto);
    if (accion) parts.push({ key: 'que', text: accion });
    if (objeto) {
        if (/^el\s/i.test(objeto)) objeto = `del ${objeto.slice(3)}`;
        else if (!startsWithAny(objeto, ['de', 'del', 'sobre'])) objeto = `de ${objeto}`;
        parts.push({ key: 'que', text: accion ? objeto : objeto.replace(/^(de|del)\s/i, '') });
    }
    const paraque = clean(form.paraque);
    if (paraque && form.includeParaque !== false) parts.push({ key: 'paraque', text: startsWithAny(paraque, ['para']) ? paraque : `para ${paraque}` });
    const quien = clean(form.quien);
    if (quien && form.includeQuien !== false) parts.push({ key: 'quien', text: startsWithAny(quien, ['en', 'de']) ? quien : `en ${quien}` });
    const donde = clean(form.donde);
    if (donde && form.includeDonde !== false) parts.push({ key: 'donde', text: startsWithAny(donde, ['de', 'del', 'en']) ? donde : `de ${donde}` });
    const cuando = clean(form.cuando);
    if (cuando && form.includeCuando !== false) parts.push({ key: 'cuando', text: startsWithAny(cuando, ['durante', 'en', 'entre', 'a lo largo']) ? cuando : `durante ${cuando}` });
    if (parts.length > 0) parts[0] = { ...parts[0], text: parts[0].text.charAt(0).toUpperCase() + parts[0].text.slice(1) };
    return parts;
};

const buildTitle = (form) => titleParts(form).map((part) => part.text).join(' ');
const countWords = (text) => String(text || '').trim().split(/\s+/).filter(Boolean).length;

const PART_LABEL = { que: 'Qué', paraque: 'Para qué', quien: 'En quiénes', donde: 'Dónde', cuando: 'Cuándo' };

// Revisión automática de un título contra los criterios de la clase.
const checkTitle = (title, { quien, donde, alcance }) => {
    const text = String(title || '').trim();
    const words = countWords(text);
    const verb = verbAtStart(text);
    const goal = ALCANCES.find((item) => item.id === alcance);
    const lower = text.toLowerCase();
    const mentions = (value) => {
        const key = clean(value).toLowerCase().split(/[\s,]+/).filter((word) => word.length > 3)[0];
        return key ? lower.includes(key) : false;
    };
    return [
        { id: 'verbo', ok: Boolean(verb), label: 'Empieza con un verbo sustantivado', detail: verb ? `Empieza con «${verb}».` : 'Empieza con un sustantivo como Análisis, Diseño o Evaluación.' },
        goal && { id: 'objetivo', ok: goal.verbs.includes(verb), label: `Es coherente con tu objetivo: ${goal.label}`, detail: goal.verbs.includes(verb) ? 'El verbo corresponde a lo que quieres lograr.' : `Para ${goal.label.toLowerCase()} usa: ${goal.verbs.join(', ')}.` },
        { id: 'largo', ok: words >= 10 && words <= 30, label: 'Tiene entre 10 y 30 palabras', detail: `Tiene ${words} ${words === 1 ? 'palabra' : 'palabras'}.${words > 30 ? ' Quita detalles del método o palabras de relleno.' : words < 10 ? ' Le falta delimitar población, lugar o tiempo.' : ''}` },
        { id: 'quien', ok: quien ? mentions(quien) : /\ben\s+\w+/i.test(text), label: 'Dice en quiénes se estudia', detail: quien ? `Tu población es «${clean(quien)}».` : 'Indica la población o unidad de análisis.' },
        { id: 'donde', ok: donde ? mentions(donde) : false, label: 'Dice dónde', detail: donde ? `Tu lugar es «${clean(donde)}».` : 'Indica el lugar o la institución.' },
        { id: 'siglas', ok: !/\b[A-ZÁÉÍÓÚÑ]{2,}\b/.test(text), label: 'No usa siglas sin explicar', detail: 'Escribe los nombres completos: el lector y los buscadores no conocen tus siglas.' },
        { id: 'pregunta', ok: !/[¿?]/.test(text), label: 'Es una frase afirmativa, no una pregunta', detail: 'La pregunta va en su propia sección; el título la nombra.' },
    ].filter(Boolean);
};

/* ---------- Contenido de los ejercicios ---------- */

const FUNCIONES_QUIZ = [
    {
        text: '¿Cuál de estos títulos le dice más al lector sobre la investigación?',
        options: [
            'La deserción universitaria',
            'Análisis de los factores asociados a la deserción en estudiantes de primer semestre de ingeniería de una universidad pública de Montería',
        ],
        answer: 1,
        why: 'Dice qué se estudia, en quiénes y dónde. El primero es un tema, no un título de investigación.',
    },
];

const ESCALERA = [
    { label: 'Tema', text: 'Salud animal', note: 'Un área amplia. Sirve para buscar ideas, no para titular.' },
    { label: 'Problema', text: 'Alta mortalidad de terneros en su primer mes de vida', note: 'Un estado negativo concreto que ya ocurre.' },
    { label: 'Idea delimitada', text: 'En Montería, pequeños productores ganaderos presentan alta mortalidad de terneros en su primer mes de vida.', note: 'Ya dice quiénes y dónde: es la frase que construiste en la Ideación.' },
    { label: 'Título', text: 'Análisis de los factores asociados a la mortalidad de terneros en su primer mes en pequeños productores de Montería, Córdoba', note: 'Nombra el estudio: verbo, objeto, población y lugar.' },
];

const ANATOMIA = [
    { key: 'que', text: 'Análisis de los factores asociados a la deserción', what: 'El qué: verbo sustantivado y objeto de estudio. Es lo único obligatorio.' },
    { key: 'paraque', text: 'para el diseño de estrategias de retención', what: 'El para qué: el propósito. Es opcional; úsalo solo si aporta.' },
    { key: 'quien', text: 'en estudiantes de primer semestre de ingeniería', what: 'En quiénes: la población o unidad de análisis.' },
    { key: 'donde', text: 'de una universidad pública de Montería', what: 'Dónde: la institución, el municipio o la región.' },
    { key: 'cuando', text: 'durante el año 2026', what: 'Cuándo: el periodo. Es opcional; inclúyelo si el momento importa.' },
];

const VARIABLES_QUIZ = [
    {
        text: 'En «Efecto de las tutorías virtuales en el rendimiento académico de estudiantes de primer semestre», ¿cuál es la variable dependiente?',
        options: ['Las tutorías virtuales', 'El rendimiento académico', 'Los estudiantes de primer semestre'],
        answer: 1,
        why: 'El rendimiento es lo que se mide y cambia como resultado. Las tutorías son la variable independiente; los estudiantes, la población.',
    },
    {
        text: 'En «Relación entre el uso de redes sociales y la ansiedad en adolescentes de Sincelejo», ¿cuál es la variable independiente?',
        options: ['El uso de redes sociales', 'La ansiedad', 'Sincelejo'],
        answer: 0,
        why: 'Es el factor que se supone influye en la ansiedad, que es la variable dependiente.',
    },
    {
        text: '«Caracterización del consumo de agua en hogares rurales de Lorica». ¿Cuántas variables principales tiene?',
        options: ['Una: el consumo de agua', 'Dos: el consumo y los hogares', 'Ninguna'],
        answer: 0,
        why: 'Un estudio descriptivo puede tener una sola variable. Los hogares son la población, no una variable.',
    },
];

const DELIMITAR = [
    { id: 'poblacion', label: 'Población', what: 'Nombra a quiénes estudias con la condición que comparten.', example: 'Vago: «en jóvenes». Preciso: «en estudiantes de grado once de colegios públicos».' },
    { id: 'lugar', label: 'Lugar', what: 'Indica la institución, el municipio o la región donde ocurre.', example: 'Vago: «en Colombia». Preciso: «de tres colegios públicos de Montería, Córdoba».' },
    { id: 'tiempo', label: 'Tiempo', what: 'Úsalo cuando el periodo cambia los resultados. Es opcional.', example: 'Vago: «actualmente». Preciso: «durante el primer semestre de 2026».' },
];

const ERRORES = [
    { error: 'Es un tema, no un título', example: '«La educación en Colombia».', fix: 'Agrega qué se estudia, en quiénes y dónde.' },
    { error: 'Es demasiado largo', example: 'Más de 30 palabras con detalles del método o de los instrumentos.', fix: 'Deja solo lo esencial; el método va en la metodología.' },
    { error: 'Usa siglas sin explicar', example: '«Impacto de las TIC en la IE San José».', fix: 'Escribe los nombres completos.' },
    { error: 'Empieza con palabras de relleno', example: '«Estudio sobre…», «Una aproximación a…».', fix: 'Empieza directamente con el verbo sustantivado: «Análisis de…».' },
    { error: 'Es una pregunta', example: '«¿Por qué desertan los estudiantes?».', fix: 'Conviértela en afirmación: «Determinación de los factores de deserción…».' },
    { error: 'Anuncia los resultados', example: '«Las tutorías mejoran el rendimiento académico».', fix: 'El título nombra lo que se estudia, no lo que se encontró.' },
    { error: 'Usa el verbo en infinitivo', example: '«Analizar los factores de deserción…».', fix: 'El infinitivo es para los objetivos; en el título usa el sustantivo: «Análisis de…».' },
];

const JUZGA_QUIZ = [
    {
        text: '«Estudio sobre la tecnología»',
        options: ['Bueno', 'Mejorable'], answer: 1,
        why: 'Es un tema con palabras de relleno: no dice qué se estudia de la tecnología, en quiénes ni dónde.',
    },
    {
        text: '«Caracterización del consumo de agua en hogares rurales de Lorica, Córdoba»',
        options: ['Bueno', 'Mejorable'], answer: 0,
        why: 'Verbo sustantivado, objeto, población y lugar en 11 palabras.',
    },
    {
        text: '«¿Cómo afecta el uso del celular a los estudiantes?»',
        options: ['Bueno', 'Mejorable'], answer: 1,
        why: 'Es una pregunta y no delimita a qué estudiantes ni dónde.',
    },
    {
        text: '«Evaluación del efecto de un programa de lectura en voz alta en la comprensión lectora de estudiantes de quinto grado de Montería»',
        options: ['Bueno', 'Mejorable'], answer: 0,
        why: 'El verbo coincide con el objetivo (evaluar), nombra las dos variables, la población y el lugar.',
    },
    {
        text: '«Las redes sociales aumentan las ventas de las mipymes de la región»',
        options: ['Bueno', 'Mejorable'], answer: 1,
        why: 'Anuncia un resultado, usa una sigla y «la región» es vago.',
    },
];

const ANTES_DESPUES = [
    {
        antes: 'Estudio sobre la deserción',
        despues: 'Determinación de los factores asociados a la deserción en estudiantes de primer semestre de ingeniería de una universidad pública de Montería',
        porque: 'Se quitó el relleno y se agregaron el objetivo (determinar factores), la población y el lugar.',
    },
    {
        antes: 'Analizar el impacto de las TIC en la IE San José durante el confinamiento por la pandemia de COVID-19 en los años 2020, 2021 y parte de 2022 mediante encuestas',
        despues: 'Evaluación del efecto de las tecnologías de la información en el aprendizaje de estudiantes de una institución educativa de Cereté',
        porque: 'Verbo sustantivado, sin siglas, sin el método y dentro de las 30 palabras.',
    },
    {
        antes: '¿Por qué los clientes abandonan el carrito de compras?',
        despues: 'Determinación de los factores del abandono del carrito de compras en clientes de tiendas virtuales de moda en Colombia',
        porque: 'La pregunta se volvió afirmación y se delimitaron población y lugar.',
    },
];

const REPASO = [
    {
        text: '¿Con qué debe empezar un título de investigación?',
        options: ['Con un verbo en infinitivo («Analizar…»)', 'Con un verbo sustantivado («Análisis de…»)', 'Con «Estudio sobre…»'],
        answer: 1,
        why: 'El infinitivo es para los objetivos; el título nombra el estudio con un sustantivo.',
    },
    {
        text: 'Una extensión recomendada para un título es…',
        options: ['De 3 a 5 palabras', 'De 10 a 30 palabras', 'Más de 40 palabras'],
        answer: 1,
        why: 'Lo suficiente para delimitar sin incluir el método ni los resultados.',
    },
    {
        text: 'En «Efecto del ejercicio en la presión arterial de adultos mayores», la variable dependiente es…',
        options: ['El ejercicio', 'La presión arterial', 'Los adultos mayores'],
        answer: 1,
        why: 'La presión arterial es lo que se mide como resultado.',
    },
    {
        text: 'Si tu objetivo es comparar, el título debería empezar con…',
        options: ['Comparación de…', 'Diseño de…', 'Caracterización de…'],
        answer: 0,
        why: 'El verbo del título refleja el objetivo del estudio.',
    },
];

/* ---------- Componentes interactivos ---------- */

const Escalera = () => {
    const [step, setStep] = useState(0);
    const isLast = step === ESCALERA.length - 1;
    return (
        <div className="ide-panel">
            <h3>Ejemplo: del tema al título en cuatro pasos</h3>
            <ol className="tit-steps">
                {ESCALERA.slice(0, step + 1).map((item, index) => (
                    <li key={item.label} data-current={index === step}>
                        <span>{item.label}</span>
                        <p>{item.text}</p>
                        {index === step && <small>{item.note}</small>}
                    </li>
                ))}
            </ol>
            <div className="ide-row">
                <span>Paso {step + 1} de {ESCALERA.length}</span>
                <button type="button" className={`ide-btn ${isLast ? 'ide-btn--ghost' : 'ide-btn--primary'}`} onClick={() => setStep(isLast ? 0 : step + 1)}>
                    {isLast ? 'Empezar de nuevo' : <>Siguiente paso <ArrowRight size={15} /></>}
                </button>
            </div>
        </div>
    );
};

const Anatomia = () => {
    const [active, setActive] = useState('que');
    const current = ANATOMIA.find((item) => item.key === active);
    return (
        <div className="ide-panel">
            <h3>Toca cada parte del título</h3>
            <p className="tit-anatomy">
                {ANATOMIA.map((item, index) => (
                    <React.Fragment key={item.key}>
                        {index > 0 && ' '}
                        <mark data-part={item.key} data-active={active === item.key}>{item.text}</mark>
                    </React.Fragment>
                ))}
            </p>
            <div className="ide-tabs" role="group" aria-label="Partes del título">
                {ANATOMIA.map((item) => (
                    <button key={item.key} type="button" className="ide-chip" aria-pressed={active === item.key} onClick={() => setActive(item.key)}>
                        {PART_LABEL[item.key]}
                    </button>
                ))}
            </div>
            <p className="tit-note" role="status">{current.what}</p>
        </div>
    );
};

const VerbExplorer = ({ initial }) => {
    const [goal, setGoal] = useState(initial || 'describir');
    const current = ALCANCES.find((item) => item.id === goal);
    return (
        <div className="ide-panel">
            <h3>Elige un objetivo y mira sus verbos</h3>
            <div className="ide-tabs" role="group" aria-label="Objetivos">
                {ALCANCES.map((item) => (
                    <button key={item.id} type="button" className="ide-chip" aria-pressed={goal === item.id} onClick={() => setGoal(item.id)}>
                        {item.label}
                    </button>
                ))}
            </div>
            <ul className="tit-verbs">
                {current.verbs.map((label) => (
                    <li key={label}>
                        <b>{label}</b>
                        <span>{VERBS[label]?.desc}</span>
                        {VERBS[label]?.example && <small>Ej.: «{label} de {VERBS[label].example}».</small>}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const WordMeter = ({ text }) => {
    const words = countWords(text);
    const state = words === 0 ? 'empty' : words < 10 ? 'short' : words <= 30 ? 'ok' : 'over';
    const label = {
        empty: 'Escribe o construye un título para medirlo.',
        short: 'Corto: probablemente le falta población, lugar o tiempo.',
        ok: 'Extensión adecuada.',
        over: 'Demasiado largo: quita el método o las palabras de relleno.',
    }[state];
    return (
        <div className="tit-meter" data-state={state}>
            <div className="tit-meter-bar" aria-hidden="true"><span style={{ width: `${Math.min(words, 40) / 40 * 100}%` }} /></div>
            <p><b>{words} {words === 1 ? 'palabra' : 'palabras'}</b> · {label}</p>
        </div>
    );
};

const AntesDespues = () => {
    const [open, setOpen] = useState({});
    return (
        <div className="ide-panel">
            <h3>Mira cómo se corrige cada título</h3>
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
                                Primero intenta mejorarlo tú; luego mira la versión corregida
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

/* ---------- Constructor y revisión ---------- */

const useTituloState = () => {
    const [form, setForm] = useProjectField('tituloForm', TITULO_FORM);
    const [titulo, setTitulo] = useProjectField('titulo', '');
    const [, setTituloIA] = useProjectField('tituloIA', '');
    const [idea] = useProjectField('idea', null);
    const f = { ...TITULO_FORM, ...(form || {}) };
    const update = (patch) => setForm((prev) => ({ ...TITULO_FORM, ...(prev || {}), ...patch }));
    return { f, update, titulo, setTitulo, setTituloIA, idea: idea || {} };
};

// Trae población, lugar y periodo de la Ideación la primera vez que se abre el constructor.
const usePrefillFromIdea = (f, update, idea) => {
    const done = useRef(false);
    useEffect(() => {
        if (done.current) return;
        done.current = true;
        const patch = {};
        if (!clean(f.quien) && clean(idea.quien)) patch.quien = clean(idea.quien);
        if (!clean(f.donde) && clean(idea.donde)) patch.donde = clean(idea.donde);
        if (!clean(f.cuando) && clean(idea.cuando)) patch.cuando = clean(idea.cuando).replace(/^durante\s+/i, '');
        if (Object.keys(patch).length > 0) update(patch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
};

const SavedTitle = ({ titulo }) => (clean(titulo) ? (
    <div className="tit-saved">
        <span>Tu título guardado</span>
        <p>{titulo}</p>
    </div>
) : null);

const Constructor = ({ intro }) => {
    const { f, update, titulo, setTitulo, idea } = useTituloState();
    usePrefillFromIdea(f, update, idea);
    const [saved, setSaved] = useState(false);
    const parts = titleParts(f);
    const built = buildTitle(f);
    // Guardado automático cuando el título ya tiene forma (6 palabras o más).
    useAutoGuardar(built && built.trim().split(/\s+/).length >= 6 ? built : '', () => { setTitulo(built); setSaved(true); });
    const goal = ALCANCES.find((item) => item.id === idea.alcance);
    const verbInfo = VERBS[findVerb(f.accion)];
    // Ejemplos con los datos del propio proyecto (Tab los escribe en el campo vacío).
    const goalDeVerbo = ALCANCES.find((item) => item.verbs.includes(findVerb(f.accion)));
    const ejObjeto = objetoTitulo(goalDeVerbo?.id || idea.alcance, idea) || verbInfo?.example || 'los factores asociados a la deserción';
    const ejParaque = proposito(idea) || verbInfo?.purposeExample || 'para diseñar estrategias de retención';
    const ej = (value, fallback) => `Ej: ${clean(value) || fallback}`;
    const field = (key) => (event) => { setSaved(false); update({ [key]: event.target.value }); };

    const groups = goal ? [goal, ...ALCANCES.filter((item) => item.id !== goal.id)] : ALCANCES;
    const unknownVerb = clean(f.accion) && !findVerb(f.accion);

    return (
        <>
            <div className="ide-synth-left">
                {intro}
                <p className="ide-synth-label">Tu título, parte por parte</p>
                <p className="tit-anatomy tit-live" aria-live="polite">
                    {parts.length > 0
                        ? parts.map((part, index) => (
                            <React.Fragment key={`${part.key}-${index}`}>
                                {index > 0 && ' '}
                                <mark data-part={part.key} data-active="true">{part.text}</mark>
                            </React.Fragment>
                        ))
                        : <span className="tit-empty">Completa el formulario y verás aquí tu título.</span>}
                </p>
                <ul className="tit-legend" aria-hidden="true">
                    {Object.entries(PART_LABEL).map(([key, label]) => <li key={key}><mark data-part={key} data-active="true">{label}</mark></li>)}
                </ul>
                <WordMeter text={built} />
                <SavedTitle titulo={titulo} />
            </div>

            <form className="ide-panel ide-form" onSubmit={(event) => { event.preventDefault(); if (built) { setTitulo(built); setSaved(true); } }} noValidate>
                <div className="input-group">
                    <label htmlFor="tit-accion">¿Qué harás? Verbo sustantivado</label>
                    <select id="tit-accion" className="input-field" value={findVerb(f.accion) || (unknownVerb ? f.accion : '')} onChange={field('accion')}>
                        <option value="">Elige un verbo</option>
                        {unknownVerb && <option value={f.accion}>{f.accion}</option>}
                        {groups.map((item) => (
                            <optgroup key={item.id} label={`${item.label}${goal && item.id === goal.id ? ' (tu objetivo)' : ''}`}>
                                {item.verbs.map((label) => <option key={label} value={label}>{label}</option>)}
                            </optgroup>
                        ))}
                    </select>
                    <small className="ide-field-hint">
                        {verbInfo ? <><strong>{verbInfo.label}:</strong> {verbInfo.desc}</> : goal ? `Tu objetivo en la Ideación fue ${goal.label.toLowerCase()}: sus verbos aparecen primero.` : 'Elige el que corresponde a lo que quieres lograr.'}
                    </small>
                </div>

                <div className="input-group">
                    <label htmlFor="tit-objeto">¿Sobre qué? Objeto de estudio</label>
                    <input id="tit-objeto" className="input-field" value={f.objeto} onChange={field('objeto')} placeholder={`Ej: ${ejObjeto}`} aria-describedby="tit-objeto-ayuda" />
                    <small className="ide-field-hint" id="tit-objeto-ayuda">{verbInfo?.objectHint || 'Las variables o el fenómeno que estudiarás.'}</small>
                </div>

                <div className="input-group">
                    <label htmlFor="tit-paraque">¿Para qué? <span className="ide-optional">(opcional)</span></label>
                    <input id="tit-paraque" className="input-field" value={f.paraque} onChange={field('paraque')} placeholder={`Ej: ${ejParaque}`} />
                </div>

                <div className="ide-form-trio">
                    <div className="input-group">
                        <label htmlFor="tit-quien">¿En quiénes?</label>
                        <input id="tit-quien" className="input-field" value={f.quien} onChange={field('quien')} placeholder={ej(idea.quien, 'estudiantes de primer semestre')} />
                    </div>
                    <div className="input-group">
                        <label htmlFor="tit-donde">¿Dónde?</label>
                        <input id="tit-donde" className="input-field" value={f.donde} onChange={field('donde')} placeholder={ej(idea.donde, 'Montería, Córdoba')} />
                    </div>
                    <div className="input-group">
                        <label htmlFor="tit-cuando">¿Cuándo? <span className="ide-optional">(opcional)</span></label>
                        <input id="tit-cuando" className="input-field" value={f.cuando} onChange={field('cuando')} placeholder={ej(idea.cuando, 'el año 2026')} />
                    </div>
                </div>

                <button type="submit" className="ide-btn ide-btn--primary" disabled={!built} style={{ justifyContent: 'center', padding: '0.8rem 1rem' }}>
                    <CheckCircle2 size={17} /> Guardar como mi título
                </button>
                {saved && <p className="ide-feedback ide-feedback--ok" role="status"><CheckCircle2 size={16} /><span>Guardado. La Pregunta y las demás herramientas ya lo usan.</span></p>}
            </form>
        </>
    );
};

const CRITERIOS = [
    { label: 'Claro', text: 'Lo entiende alguien que no es de tu área.' },
    { label: 'Preciso', text: 'Nombra las variables, la población y el lugar.' },
    { label: 'Conciso', text: 'Entre 10 y 30 palabras, sin relleno ni método.' },
    { label: 'Coherente', text: 'Su verbo coincide con tu objetivo y tu pregunta.' },
    { label: 'Afirmativo', text: 'Es una frase, no una pregunta, y no anuncia resultados.' },
];

// Criterios de un buen título y revisión automática de tu título (o de cualquier otro que pegues).
const Prueba = ({ intro }) => {
    const { f, titulo, idea } = useTituloState();
    const own = clean(titulo) || buildTitle(f);
    const [text, setText] = useState(own);
    const target = text.trim();
    const isOwn = target === own;
    const checks = checkTitle(target, {
        quien: isOwn ? (f.quien || idea.quien) : '',
        donde: isOwn ? (f.donde || idea.donde) : '',
        alcance: isOwn ? idea.alcance : '',
    });
    const passed = checks.filter((item) => item.ok).length;
    return (
        <>
            <div className="ide-synth-left">
                {intro}
                <ul className="tit-criteria">
                    {CRITERIOS.map((item) => <li key={item.label}><b>{item.label}</b> {item.text}</li>)}
                </ul>
                <label htmlFor="tit-revisar" className="ide-synth-label">Título a revisar</label>
                <textarea
                    id="tit-revisar"
                    className="textarea-field tit-review-input"
                    rows={3}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder="Pega un título (tuyo o de un artículo) o constrúyelo en «Construye tu título»"
                />
                <WordMeter text={target} />
                {!isOwn && own && (
                    <button type="button" className="ide-link" onClick={() => setText(own)}>Volver a mi título</button>
                )}
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
                    {isOwn ? 'Revisa la forma de tu título guardado.' : 'Revisando un título distinto al tuyo: se omiten los criterios de tu población, lugar y objetivo.'} El contenido lo valida tu docente.
                </p>
            </div>
        </>
    );
};

// Lee las líneas «ETIQUETA: texto» que devuelve la IA.
const readLabeled = (content) => {
    const result = { fortalezas: [], mejoras: [], independiente: '', dependiente: '', mejorado: '' };
    content.replace(/\*\*/g, '').split('\n').forEach((line) => {
        const text = line.trim().replace(/^[-*•]\s*/, '');
        const match = text.match(/^(FORTALEZA|MEJORA|VARIABLE INDEPENDIENTE|VARIABLE DEPENDIENTE|T[ÍI]TULO MEJORADO)\s*:\s*(.+)$/i);
        if (!match) return;
        const key = match[1].toUpperCase();
        const value = match[2].trim();
        if (key === 'FORTALEZA') result.fortalezas.push(value);
        else if (key === 'MEJORA') result.mejoras.push(value);
        else if (key === 'VARIABLE INDEPENDIENTE') result.independiente = value;
        else if (key === 'VARIABLE DEPENDIENTE') result.dependiente = value;
        else result.mejorado = value.replace(/^["«]|["»]$/g, '').replace(/[\s.]+$/, '');
    });
    return result;
};

const ConIA = ({ intro }) => {
    const { f, titulo, setTitulo, setTituloIA, idea } = useTituloState();
    const target = clean(titulo) || buildTitle(f);
    const goal = ALCANCES.find((item) => item.id === idea.alcance) || alcanceOfVerb(findVerb(f.accion) || verbAtStart(target));
    const allowed = goal ? goal.verbs : ALL_VERBS;
    const [busy, setBusy] = useState('');
    const [error, setError] = useState('');
    const [review, setReview] = useState(null);
    const [options, setOptions] = useProjectField('titulosIA', []);
    const [used, setUsed] = useState('');

    const contexto = [
        goal && `Objetivo del estudio: ${goal.label.toLowerCase()} (${goal.hint.toLowerCase()}).`,
        clean(f.quien || idea.quien) && `Población: ${clean(f.quien || idea.quien)}.`,
        clean(f.donde || idea.donde) && `Lugar: ${clean(f.donde || idea.donde)}.`,
        clean(idea.problema) && `Problema: ${clean(idea.problema)}.`,
    ].filter(Boolean).join('\n');

    const ask = async (prompt) => {
        const response = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.5,
            max_tokens: 3000,
        });
        return response.choices[0]?.message?.content || '';
    };

    const evaluate = async () => {
        setBusy('evaluar');
        setError('');
        try {
            const content = await ask(`Eres un evaluador experto de títulos de investigación. Evalúa este título: "${target}"
${contexto}

Responde SOLO con estas líneas, en texto plano, sin markdown:
FORTALEZA: [un aspecto positivo]
FORTALEZA: [otro aspecto positivo]
MEJORA: [una mejora concreta]
MEJORA: [otra mejora concreta]
VARIABLE INDEPENDIENTE: [nombre] — [por qué, en una oración]. Si es un estudio de una sola variable escribe: No aplica — [explica en una oración]
VARIABLE DEPENDIENTE: [nombre] — [por qué, en una oración]
TÍTULO MEJORADO: [versión mejorada de 10 a 30 palabras que empiece con uno de estos sustantivos: ${allowed.join(', ')}; sin siglas ni signos de interrogación]`);
            const parsed = readLabeled(content);
            if (!parsed.fortalezas.length && !parsed.mejorado) throw new Error('La IA respondió en un formato que no se pudo leer. Intenta de nuevo.');
            if (parsed.mejorado && !verbAtStart(parsed.mejorado, allowed)) parsed.mejorado = '';
            setReview(parsed);
        } catch (err) {
            setError(err.message || 'No se pudo evaluar el título.');
        } finally {
            setBusy('');
        }
    };

    const alternatives = async () => {
        setBusy('alternativas');
        setError('');
        try {
            const content = await ask(`Eres un experto en formulación de títulos de investigación. Propón 3 títulos alternativos para este proyecto.
Título actual: "${target}"
${contexto}

Reglas para cada título:
- Empieza con uno de estos sustantivos: ${allowed.join(', ')}.
- Tiene entre 10 y 30 palabras.
${clean(f.quien || idea.quien) ? `- Incluye la población «${clean(f.quien || idea.quien)}».\n` : ''}${clean(f.donde || idea.donde) ? `- Incluye el lugar «${clean(f.donde || idea.donde)}».\n` : ''}- Sin siglas, sin signos de interrogación y sin anunciar resultados.

Responde SOLO con los 3 títulos, uno por línea, cada uno empezando con "- ".`);
            const list = content.split('\n')
                .map((line) => line.trim().replace(/^(?:[-*•]|\d+[.)])\s*/, '').replace(/^["«]|["»]$/g, '').replace(/\*\*/g, '').replace(/[\s.]+$/, '').trim())
                .filter((line) => line && verbAtStart(line, allowed) && !/[¿?]/.test(line))
                .slice(0, 3);
            if (list.length === 0) throw new Error('La IA no propuso títulos que cumplan los criterios. Intenta de nuevo.');
            setOptions(list);
        } catch (err) {
            setError(err.message || 'No se pudieron generar alternativas.');
        } finally {
            setBusy('');
        }
    };

    const pickTitle = (text) => {
        setTitulo(text);
        setTituloIA(text);
        setUsed(text);
    };

    return (
        <>
            <div className="ide-synth-left">
                {intro}
                {target
                    ? <><p className="ide-synth-label">Título a mejorar</p><p className="tit-under-test">{target}</p></>
                    : <p className="tit-empty">Primero construye y guarda tu título.</p>}
                <div className="tit-ai-actions">
                    <button type="button" className="ide-btn ide-btn--primary" disabled={!target || Boolean(busy)} onClick={evaluate}>
                        {busy === 'evaluar' ? <><span className="ide-spinner" aria-hidden="true" /> Evaluando…</> : <><Search size={16} /> Evaluar y encontrar variables</>}
                    </button>
                    <button type="button" className="ide-btn ide-btn--ghost" disabled={!target || Boolean(busy)} onClick={alternatives}>
                        {busy === 'alternativas' ? <><span className="ide-spinner tit-spinner-dark" aria-hidden="true" /> Generando…</> : <><Cpu size={16} /> Proponer 3 alternativas</>}
                    </button>
                </div>
                {error && <div className="ide-alert" role="alert"><AlertTriangle size={18} style={{ flexShrink: 0 }} /><span>{error}</span></div>}
                {used && <p className="ide-feedback ide-feedback--ok" role="status"><CheckCircle2 size={16} /><span>Título guardado: «{used}».</span></p>}
            </div>

            <div className="ide-panel tit-ai-panel" aria-live="polite">
                {!review && options.length === 0 && (
                    <p className="tit-empty">La evaluación y las alternativas aparecerán aquí. La IA revisa la forma; la decisión final es tuya y de tu asesor.</p>
                )}
                {review && (
                    <div className="tit-review">
                        <h3>Evaluación</h3>
                        {review.fortalezas.length > 0 && <><h4>Fortalezas</h4><ul>{review.fortalezas.map((item) => <li key={item}>{item}</li>)}</ul></>}
                        {review.mejoras.length > 0 && <><h4>Para mejorar</h4><ul>{review.mejoras.map((item) => <li key={item}>{item}</li>)}</ul></>}
                        {(review.independiente || review.dependiente) && (
                            <dl className="tit-vars">
                                {review.independiente && <div><dt>Variable independiente</dt><dd>{review.independiente}</dd></div>}
                                {review.dependiente && <div><dt>Variable dependiente</dt><dd>{review.dependiente}</dd></div>}
                            </dl>
                        )}
                        {review.mejorado && (
                            <div className="tit-option">
                                <p>{review.mejorado}</p>
                                <button type="button" className="ide-btn ide-btn--ghost" onClick={() => pickTitle(review.mejorado)} disabled={used === review.mejorado}>
                                    {used === review.mejorado ? 'En uso' : 'Usar este título'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
                {options.length > 0 && (
                    <div className="tit-review">
                        <h3>Alternativas</h3>
                        {options.map((text) => (
                            <div className="tit-option" key={text}>
                                <p>{text}</p>
                                <small>{countWords(text)} palabras · {verbAtStart(text)}</small>
                                <button type="button" className="ide-btn ide-btn--ghost" onClick={() => pickTitle(text)} disabled={used === text}>
                                    {used === text ? 'En uso' : 'Usar este título'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

/* ---------- Clase ---------- */

const Titulo = ({ onNavigate }) => {
    const [idea] = useProjectField('idea', null);
    const [titulo] = useProjectField('titulo', '');
    const frase = clean(idea?.frase);
    const goal = ALCANCES.find((item) => item.id === idea?.alcance);

    const renderSlide = ({ slide, heading, goToSection, sectionMinutes, totalMinutes }) => ({
        portada: (
            <>
                <div>
                    {heading}
                    <p>El título es lo primero que leen tu asesor, el jurado y los buscadores académicos. En una sola línea debe decir qué estudias, en quiénes y dónde.</p>
                    <p><strong>Al terminar esta clase podrás:</strong></p>
                    <ul className="ide-bullets">
                        <li>Reconocer las partes de un buen título.</li>
                        <li>Elegir el verbo sustantivado según tu objetivo.</li>
                        <li>Identificar las variables que nombra un título.</li>
                        <li>Evitar los errores más frecuentes.</li>
                        <li>Construir, probar y mejorar tu propio título.</li>
                    </ul>
                    {frase && (
                        <div className="tit-from-idea">
                            <span>Partirás de tu idea</span>
                            <p>{frase}</p>
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
        funciones: (
            <>
                <div>
                    {heading}
                    <ul className="ide-list">
                        <li><BookOpen size={18} /><span><b>Identifica</b>Dice de qué trata el estudio sin leer nada más.</span></li>
                        <li><Users size={18} /><span><b>Delimita</b>Marca hasta dónde llega: población, lugar y, si importa, tiempo.</span></li>
                        <li><Target size={18} /><span><b>Orienta</b>Su verbo anticipa el tipo de estudio: describir, comparar, evaluar…</span></li>
                        <li><Search size={18} /><span><b>Se encuentra</b>Sus palabras son las que usan los buscadores como Google Académico o los repositorios.</span></li>
                    </ul>
                </div>
                <Opciones title="Compara" questions={FUNCIONES_QUIZ} />
            </>
        ),
        tema: (
            <>
                <div>
                    {heading}
                    <p>Un tema no es un título. Entre los dos hay un camino: del área de interés al problema, del problema a la idea delimitada y de la idea al título.</p>
                    <p>Si ya hiciste la Ideación, tienes recorrida la mitad del camino.</p>
                </div>
                <Escalera />
            </>
        ),
        anatomia: (
            <>
                <div>
                    {heading}
                    <p>Un título de investigación responde, en este orden, a cinco preguntas. Solo la primera es obligatoria; las demás delimitan.</p>
                    <ul className="ide-list">
                        <li><Target size={18} /><span><b>¿Qué?</b>Verbo sustantivado y objeto de estudio.</span></li>
                        <li><ArrowRight size={18} /><span><b>¿Para qué?</b>Propósito, solo si aporta.</span></li>
                        <li><Users size={18} /><span><b>¿En quiénes? ¿Dónde? ¿Cuándo?</b>Población, lugar y tiempo.</span></li>
                    </ul>
                </div>
                <Anatomia />
            </>
        ),
        verbo: (
            <>
                <div>
                    {heading}
                    <p>El título <strong>nombra</strong> el estudio; por eso usa un sustantivo: «Análisis de…», no «Analizar…». El infinitivo se reserva para los objetivos.</p>
                    <div className="tit-compare">
                        <p><span>Objetivo</span>Analizar los factores asociados a la deserción…</p>
                        <p><span>Título</span>Análisis de los factores asociados a la deserción…</p>
                    </div>
                    <p>El verbo debe corresponder a lo que quieres lograr: no se titula «Diseño de…» un estudio que solo describe.</p>
                </div>
                <VerbExplorer initial={goal?.id} />
            </>
        ),
        variables: (
            <>
                <div>
                    {heading}
                    <p>Una <strong>variable</strong> es una característica que cambia y se puede observar o medir.</p>
                    <ul className="ide-list">
                        <li><ArrowRight size={18} /><span><b>Independiente</b>El factor o causa: lo que se supone que influye.</span></li>
                        <li><Target size={18} /><span><b>Dependiente</b>El efecto o resultado: lo que se mide para ver si cambia.</span></li>
                    </ul>
                    <p className="ide-hint">Los estudios para describir o explorar pueden tener una sola variable. Comparar, relacionar, explicar y evaluar suelen tener dos.</p>
                </div>
                <Opciones title="Identifica las variables" questions={VARIABLES_QUIZ} />
            </>
        ),
        delimitar: (
            <>
                <div>
                    {heading}
                    <p>Delimitar no hace más pequeño tu estudio: lo hace posible. Un buen título deja claro a quiénes vas a encuestar u observar y dónde los encontrarás.</p>
                </div>
                <Pestanas title="Vago o preciso" name="delimitar" items={DELIMITAR} />
            </>
        ),
        errores: (
            <>
                <div>
                    {heading}
                    <p>Estos son los tropiezos que más aparecen en las primeras versiones. Revisa si tu título tiene alguno.</p>
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
                    <p>Aplica los criterios: lee cada título y decide si está listo o necesita trabajo. Después lee la explicación.</p>
                    <p className="ide-hint">Para discutir en parejas: ¿cómo mejorarían los que marcaron como mejorables?</p>
                </div>
                <Opciones title="Juzga cada título" questions={JUZGA_QUIZ} />
            </>
        ),
        reescribe: (
            <>
                <div>
                    {heading}
                    <p>Reescribir es normal: los buenos títulos rara vez salen en el primer intento. Intenta corregir cada ejemplo en tu cuaderno antes de ver la versión mejorada.</p>
                </div>
                <AntesDespues />
            </>
        ),
        construye: (
            <Constructor
                intro={(
                    <>
                        {heading}
                        <p>Completa las partes y verás tu título armarse en colores. Lo que definiste en la Ideación ya está cargado.</p>
                    </>
                )}
            />
        ),
        prueba: (
            <Prueba
                intro={(
                    <>
                        {heading}
                        <p>Un buen título cumple cinco criterios. Revisa el tuyo antes de llevarlo a tu asesor; también puedes pegar el título de un artículo para analizarlo.</p>
                    </>
                )}
            />
        ),
        ia: (
            <ConIA
                intro={(
                    <>
                        {heading}
                        <p>La IA evalúa tu título, identifica sus variables y propone alternativas con el verbo de tu objetivo. Tú decides cuál usar; en la pestaña «Revisión» lo revisarás con los criterios.</p>
                    </>
                )}
            />
        ),
        repaso: (
            <>
                <div>
                    {heading}
                    <p>Cuatro preguntas para comprobar lo aprendido.</p>
                </div>
                <Opciones title="Cuestionario de repaso" questions={REPASO} />
            </>
        ),
        cierre: (
            <>
                <div>
                    {heading}
                    <ul className="ide-bullets">
                        <li>El título nombra el estudio: verbo sustantivado y objeto, luego población, lugar y tiempo.</li>
                        <li>El verbo refleja tu objetivo; el infinitivo queda para los objetivos.</li>
                        <li>Un buen título es claro, preciso, conciso, coherente y afirmativo.</li>
                        <li>Las variables del título son las que vas a observar o medir.</li>
                    </ul>
                </div>
                <div className="ide-panel">
                    <h3>Siguiente paso</h3>
                    {clean(titulo) ? <SavedTitle titulo={titulo} /> : <p>Lo construirás en la siguiente sección, con todo lo que acabas de repasar.</p>}
                    <p>Con tu título listo, formula la pregunta de investigación: el tipo de pregunta debe coincidir con tu objetivo.</p>
                </div>
            </>
        ),
    })[slide.id];

    return (
        <SlideDeck
            sections={SECTIONS}
            slides={SLIDES}
            storageKey={SLIDE_KEY}
            label="Construcción del título"
            renderSlide={renderSlide}
            finish={onNavigate ? { label: 'Formular la pregunta', onClick: () => onNavigate('pregunta') } : null}
        />
    );
};

export default Titulo;
