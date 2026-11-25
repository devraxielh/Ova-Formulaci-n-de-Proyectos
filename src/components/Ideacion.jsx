import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    AlertTriangle, ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Clipboard, Clock, Compass, Cpu, Database,
    MapPin, Maximize2, Minimize2, Pause, Play, RotateCcw, Search, Users, Wallet, Wrench, XCircle,
} from 'lucide-react';
import { groq } from '../services/api';
import SlideDeck, { Opciones, Pestanas } from './deck/SlideDeck';
import { useProjectField } from '../context/ProjectContext';
import { ALCANCES, ALL_VERBS, findVerb } from '../data/alcances';
import './Ideacion.css';
import { construccionPrimero } from './deck/orden';
import TEORIA from '../data/teoria/ideacion';

/* La clase completa dura 50 minutos: la suma de `min` de todas las diapositivas. */
const SECTIONS = construccionPrimero([
    { id: 'apertura', label: 'Apertura' },
    { id: 'problema', label: 'Problema' },
    { id: 'delimitacion', label: 'Delimitación' },
    { id: 'sustento', label: 'Sustento' },
    { id: 'cierre', label: 'Cierre' },
    { id: 'sintesis', label: 'Construcción' },
]);

const SLIDES = construccionPrimero([
    { id: 'portada', section: 'apertura', min: 3, title: '¿Cómo nace un proyecto?' },
    { id: 'fuentes', section: 'apertura', min: 4, title: '¿De dónde salen las ideas?' },
    { id: 'criterios', section: 'apertura', min: 3, title: 'Qué hace buena a una idea de investigación' },
    { id: 'problema', section: 'problema', min: 4, title: 'Un problema no es la falta de una solución' },
    { id: 'porques', section: 'problema', min: 3, title: 'Del síntoma a la causa: los cinco porqués' },
    { id: 'arbol', section: 'problema', min: 3, title: 'El árbol de problemas' },
    { id: 'poblacion', section: 'delimitacion', min: 2, title: 'Población afectada' },
    { id: 'delimita', section: 'delimitacion', min: 4, title: 'Delimita tu idea: quién, dónde y cuándo' },
    { id: 'contexto', section: 'delimitacion', min: 2, title: 'Contexto' },
    { id: 'viabilidad', section: 'sustento', min: 3, title: 'Viabilidad' },
    { id: 'impacto', section: 'sustento', min: 2, title: 'Impacto' },
    { id: 'errores', section: 'sustento', min: 3, title: 'Cinco errores frecuentes al idear' },
    { id: 'repaso', section: 'cierre', min: 3, title: 'Repaso: comprueba lo aprendido' },
    { id: 'cierre', section: 'cierre', min: 2, title: 'Lo que te llevas de esta clase' },
    { id: 'asistente', section: 'sintesis', min: 9, title: 'Tu idea de investigación' },
]);


const SLIDE_KEY = 'projectsia:ideacion:diapositiva';

const EMPTY_WORKBOOK = {
    temas: '', problema: '',
    causa1: '', causa2: '', causa3: '',
    efecto1: '', efecto2: '', efecto3: '',
    quien: '', donde: '', cuando: '',
    antecedente1: '', antecedente2: '',
    programa: '', nivel: 'Pregrado', alcance: '',
    frase: '',
};


const joinFilled = (values, separator = '; ') => values.map((value) => value.trim()).filter(Boolean).join(separator);

// Quita espacios y la puntuación final para que la frase no termine en «..».
const cleanPart = (text) => String(text || '').trim().replace(/[\s.,;:]+$/, '');
const lowerFirst = (text) => (text ? text.charAt(0).toLowerCase() + text.slice(1) : text);
const upperFirst = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : text);

// Partes de la frase; los huecos sin llenar se muestran resaltados como guía.
const sentenceParts = (wb) => {
    const v = (key) => cleanPart(wb[key]);
    // El lugar conserva sus mayúsculas (nombre propio); el resto va en minúscula inicial.
    const slot = (value, placeholder, keepCase = false) => ({
        slot: true,
        filled: Boolean(value),
        text: value ? (keepCase ? value : lowerFirst(value)) : placeholder,
    });
    const parts = [{ text: 'En ' }, slot(v('donde'), 'lugar', true), { text: ', ' }, slot(v('quien'), 'población'), { text: ' presentan ' }, slot(v('problema'), 'problema')];
    if (v('causa1')) parts.push({ text: ', debido a ' }, slot(v('causa1')));
    if (v('efecto1')) parts.push({ text: ', lo que genera ' }, slot(v('efecto1')));
    if (v('cuando')) parts.push({ text: ', durante ' }, slot(v('cuando').replace(/^durante\s+/i, '')));
    parts.push({ text: '.' });
    return parts;
};

// Texto que se guarda en el proyecto: solo con lo que el estudiante ya escribió.
const buildSentence = (wb) => {
    const v = (key) => cleanPart(wb[key]);
    if (!v('problema')) return '';
    const sujeto = v('quien') ? `${lowerFirst(v('quien'))} presentan` : 'se presenta';
    let text = v('donde') ? `En ${v('donde')}, ${sujeto} ${lowerFirst(v('problema'))}` : `${upperFirst(sujeto)} ${lowerFirst(v('problema'))}`;
    if (v('causa1')) text += `, debido a ${lowerFirst(v('causa1'))}`;
    if (v('efecto1')) text += `, lo que genera ${lowerFirst(v('efecto1'))}`;
    if (v('cuando')) text += `, durante ${lowerFirst(v('cuando').replace(/^durante\s+/i, ''))}`;
    return `${text}.`;
};

const buildFicha = (wb) => [
    'FICHA DE IDEA DE INVESTIGACIÓN',
    '',
    `Temas de interés: ${wb.temas.trim() || '—'}`,
    `Problema central: ${wb.problema.trim() || '—'}`,
    `Causas: ${joinFilled([wb.causa1, wb.causa2, wb.causa3]) || '—'}`,
    `Efectos: ${joinFilled([wb.efecto1, wb.efecto2, wb.efecto3]) || '—'}`,
    `Población: ${wb.quien.trim() || '—'}`,
    `Lugar: ${wb.donde.trim() || '—'}`,
    `Periodo: ${wb.cuando.trim() || '—'}`,
    `Antecedentes: ${joinFilled([wb.antecedente1, wb.antecedente2]) || '—'}`,
    '',
    `Programa: ${(wb.programa || '').trim() || '—'}`,
    '',
    `Idea en una frase: ${(wb.frase || '').trim() || buildSentence(wb) || '—'}`,
].join('\n');

/* ---------- Piezas reutilizables ---------- */

const Campo = ({ id, label, value, onChange, placeholder, hint, autofill, multiline = false, rows = 3 }) => (
    <div className="input-group">
        <label htmlFor={id}>{label}</label>
        {multiline
            ? <textarea id={id} className="textarea-field" rows={rows} value={value} onChange={onChange} placeholder={placeholder} data-autofill={autofill} aria-describedby={hint ? `${id}-ayuda` : undefined} />
            : <input id={id} type="text" className="input-field" value={value} onChange={onChange} placeholder={placeholder} data-autofill={autofill} aria-describedby={hint ? `${id}-ayuda` : undefined} />}
        {hint && <small className="ide-field-hint" id={`${id}-ayuda`}>{hint}</small>}
    </div>
);

/* ---------- Contenido de los ejercicios ---------- */

const CRITERIA = [
    {
        id: 'interesante',
        label: 'Interesante',
        what: 'Te importa lo suficiente como para trabajar en ella durante meses.',
        example: 'Pregúntate: ¿seguiría leyendo sobre este tema aunque nadie me lo pidiera?',
    },
    {
        id: 'relevante',
        label: 'Relevante',
        what: 'Le importa a alguien más: una comunidad, una organización o tu disciplina.',
        example: 'Pregúntate: ¿quién usaría los resultados y para qué?',
    },
    {
        id: 'novedosa',
        label: 'Novedosa',
        what: 'Aporta algo que no estaba: otro contexto, otra población, otro método o datos más recientes.',
        example: 'No tiene que ser inédita en el mundo. Basta con que no sea una repetición exacta.',
    },
    {
        id: 'viable',
        label: 'Viable',
        what: 'Puedes terminarla con el tiempo, los datos y los recursos que realmente tienes.',
        example: 'Pregúntate: ¿puedo conseguir la información en el plazo de mi trabajo de grado?',
    },
];

const STATEMENTS = [
    {
        text: 'No existe una aplicación para pedir citas en el centro de salud.',
        options: ['Problema', 'Falta de solución'],
        answer: 1,
        why: 'Describe algo que falta, no lo que le pasa a la gente. Como problema sería: «Los pacientes esperan varias horas para conseguir una cita».',
    },
    {
        text: 'Muchos estudiantes de primer semestre reprueban cálculo.',
        options: ['Problema', 'Falta de solución'],
        answer: 0,
        why: 'Es un estado negativo que ya existe y se puede medir, sin importar cómo se resuelva.',
    },
    {
        text: 'Falta un laboratorio de computación en el colegio.',
        options: ['Problema', 'Falta de solución'],
        answer: 1,
        why: 'El laboratorio es una solución posible. El problema sería: «Los estudiantes se gradúan sin competencias digitales básicas».',
    },
    {
        text: 'Los pequeños agricultores pierden parte de su cosecha porque no pueden anticipar las lluvias.',
        options: ['Problema', 'Falta de solución'],
        answer: 0,
        why: 'Nombra a quién le pasa y qué consecuencia sufre. Admite varias soluciones distintas.',
    },
];

const REVIEW = [
    {
        text: '¿Cuál de estos enunciados es un problema bien formulado?',
        options: [
            'No hay un software de inventarios en la tienda.',
            'La tienda pierde mercancía porque no registra sus existencias.',
            'Se necesita capacitar a los empleados.',
        ],
        answer: 1,
        why: 'Es el único que describe un estado negativo existente. Los otros dos son soluciones.',
    },
    {
        text: 'En el árbol de problemas, las raíces representan…',
        options: ['Las causas', 'Los efectos', 'Las soluciones'],
        answer: 0,
        why: 'Raíces: causas. Tronco: problema central. Ramas: efectos.',
    },
    {
        text: '¿Cuál población está mejor delimitada?',
        options: [
            'Los jóvenes del país.',
            'Personas que usan internet.',
            'Estudiantes de grado 11 de colegios públicos de una ciudad durante 2026.',
        ],
        answer: 2,
        why: 'Dice quiénes son, dónde están y en qué periodo se estudian.',
    },
    {
        text: 'Una idea es viable cuando…',
        options: [
            'Puedes terminarla con el tiempo, los datos y los recursos que tienes.',
            'Usa la tecnología más reciente.',
            'Nadie la ha investigado antes.',
        ],
        answer: 0,
        why: 'La novedad y la tecnología no sirven si no puedes completar el proyecto.',
    },
];

const WHYS = [
    { q: 'Síntoma observado', a: 'Los estudiantes reprueban el primer parcial de cálculo.' },
    { q: '¿Por qué?', a: 'No logran resolver los ejercicios de álgebra básica.' },
    { q: '¿Por qué?', a: 'Llegan a la universidad con vacíos del bachillerato.' },
    { q: '¿Por qué?', a: 'En el colegio memorizaron procedimientos sin comprenderlos.' },
    { q: '¿Por qué?', a: 'Nadie detecta ni nivela esos vacíos al ingresar a la carrera.' },
];

const Porques = () => {
    const [shown, setShown] = useState(1);
    const complete = shown === WHYS.length;

    return (
        <div className="ide-panel">
            <h3>Ejemplo: pregunta «¿por qué?» hasta llegar a la raíz</h3>
            <ol className="ide-whys">
                {WHYS.slice(0, shown).map((step, index) => (
                    <li key={step.a} data-last={complete && index === WHYS.length - 1}>
                        <span>{step.q}</span>
                        {step.a}
                    </li>
                ))}
            </ol>
            <div className="ide-row">
                <span>{complete ? 'Causa raíz encontrada' : `Nivel ${shown} de ${WHYS.length}`}</span>
                <button
                    type="button"
                    className={`ide-btn ${complete ? 'ide-btn--ghost' : 'ide-btn--primary'}`}
                    onClick={() => setShown(complete ? 1 : shown + 1)}
                >
                    {complete ? <><RotateCcw size={15} /> Empezar de nuevo</> : <>¿Por qué? <ArrowRight size={15} /></>}
                </button>
            </div>
            {complete && (
                <p style={{ marginTop: '1rem' }}>
                    Un proyecto sobre «más horas de clase» atacaría el síntoma. Uno sobre diagnóstico y nivelación al ingreso ataca la causa.
                </p>
            )}
        </div>
    );
};

const TREE = {
    efectos: {
        name: 'Ramas · Efectos',
        items: ['Repitencia de asignaturas', 'Deserción temprana', 'Retraso en la graduación'],
        note: 'Los efectos responden a «¿qué consecuencias trae?». Muestran por qué vale la pena investigar el problema.',
    },
    problema: {
        name: 'Tronco · Problema central',
        text: 'Bajo rendimiento en matemáticas de los estudiantes de primer semestre de ingeniería',
        note: 'El tronco es la situación negativa principal. Se redacta como un hecho que ya ocurre, no como una carencia.',
    },
    causas: {
        name: 'Raíz · Causas',
        items: ['Bases débiles del bachillerato', 'Poco tiempo de estudio autónomo', 'Clases poco prácticas'],
        note: 'Las causas responden a «¿por qué ocurre esto?». Tu proyecto normalmente interviene sobre una de ellas.',
    },
};

const Arbol = () => {
    const [selected, setSelected] = useState('problema');

    const tier = (key, extraClass = '') => (
        <button
            type="button"
            className={`ide-tree-tier ${extraClass}`}
            aria-pressed={selected === key}
            onClick={() => setSelected(key)}
        >
            <span className="ide-tree-name">{TREE[key].name}</span>
            {TREE[key].text
                ? <span className="ide-tree-text">{TREE[key].text}</span>
                : (
                    <span className="ide-tree-list">
                        {TREE[key].items.map((item) => <span key={item}>{item}</span>)}
                    </span>
                )}
        </button>
    );

    return (
        <div className="ide-panel">
            <h3>Ejemplo: toca cada nivel del árbol</h3>
            <div className="ide-tree">
                {tier('efectos')}
                <div className="ide-tree-link" aria-hidden="true" />
                {tier('problema', 'ide-tree-tier--trunk')}
                <div className="ide-tree-link" aria-hidden="true" />
                {tier('causas')}
            </div>
            <p className="ide-tree-note" role="status">{TREE[selected].note}</p>
        </div>
    );
};

const SCOPE_STEPS = [
    { label: 'Muy amplia', parts: ['Todos los estudiantes'] },
    { label: 'Amplia', parts: ['Estudiantes', 'de ingeniería'] },
    { label: 'Acotada', parts: ['Estudiantes', 'de ingeniería', 'de primer semestre'] },
    { label: 'Específica', parts: ['Estudiantes', 'de ingeniería', 'de primer semestre', 'con dificultades en matemáticas'] },
];

const Poblacion = () => {
    const [step, setStep] = useState(0);
    const current = SCOPE_STEPS[step];
    const isLast = step === SCOPE_STEPS.length - 1;

    return (
        <div className="ide-panel">
            <h3>Afina la población paso a paso</h3>
            <div className="ide-scope" aria-live="polite">
                {current.parts.map((part, index) => (
                    <React.Fragment key={part}>
                        {index > 0 && ' '}
                        {index === current.parts.length - 1 && step > 0 ? <mark>{part}</mark> : part}
                    </React.Fragment>
                ))}
                .
            </div>
            <div className="ide-meter" aria-hidden="true">
                {SCOPE_STEPS.map((item, index) => <span key={item.label} data-on={index <= step} />)}
            </div>
            <div className="ide-row">
                <span>Precisión: {current.label}</span>
                <button
                    type="button"
                    className={`ide-btn ${isLast ? 'ide-btn--ghost' : 'ide-btn--primary'}`}
                    onClick={() => setStep(isLast ? 0 : step + 1)}
                >
                    {isLast ? <><RotateCcw size={15} /> Empezar de nuevo</> : <>Hacerla más específica <ArrowRight size={15} /></>}
                </button>
            </div>
            {isLast && (
                <p style={{ marginTop: '1rem' }}>
                    Ahora sabes a quién encuestar, dónde encontrarlo y qué medir. Con «todos los estudiantes» no sabrías por dónde empezar.
                </p>
            )}
        </div>
    );
};

const FEASIBILITY = [
    { text: '¿Tengo acceso a la información?', hint: 'Datos, personas o documentos que necesitas consultar.' },
    { text: '¿Tengo los conocimientos técnicos?', hint: 'O puedo adquirirlos en el tiempo del proyecto.' },
    { text: '¿El costo es manejable?', hint: 'Equipos, desplazamientos, licencias, encuestas.' },
    { text: '¿Me alcanza el tiempo?', hint: 'Cuenta el plazo real de tu trabajo de grado.' },
];

const Viabilidad = () => {
    const [checked, setChecked] = useState(FEASIBILITY.map(() => false));
    const total = checked.filter(Boolean).length;

    const verdict = total === FEASIBILITY.length
        ? { ok: true, text: 'Tu idea es viable con lo que tienes. Puedes avanzar al título.' }
        : total === 0
            ? null
            : { ok: false, text: 'Antes de avanzar, reduce el alcance o busca apoyo para lo que aún no marcaste.' };

    return (
        <div className="ide-panel">
            <h3>Evalúa tu idea</h3>
            {FEASIBILITY.map((item, index) => (
                <label className="ide-check" key={item.text}>
                    <input
                        type="checkbox"
                        checked={checked[index]}
                        onChange={() => setChecked((prev) => prev.map((value, i) => (i === index ? !value : value)))}
                    />
                    <span>
                        {item.text}
                        <small>{item.hint}</small>
                    </span>
                </label>
            ))}
            {verdict ? (
                <div className={`ide-feedback ${verdict.ok ? 'ide-feedback--ok' : 'ide-feedback--bad'}`} role="status">
                    {verdict.ok ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                    <span>{verdict.text}</span>
                </div>
            ) : (
                <p>Marca las preguntas a las que puedes responder «sí» con tu idea actual.</p>
            )}
        </div>
    );
};

const IMPACTS = [
    {
        id: 'social',
        label: 'Social',
        what: '¿Cómo cambia la vida de las personas o de la comunidad?',
        example: 'Ejemplo: menos estudiantes abandonan la carrera en el primer año.',
    },
    {
        id: 'economico',
        label: 'Económico',
        what: '¿Genera ahorros, ingresos o un uso más eficiente de los recursos?',
        example: 'Ejemplo: las familias no pagan semestres repetidos y la universidad retiene matrícula.',
    },
    {
        id: 'ambiental',
        label: 'Ambiental',
        what: '¿Reduce o aumenta la presión sobre el entorno natural?',
        example: 'Ejemplo: las tutorías virtuales evitan desplazamientos y material impreso.',
    },
];

const MISTAKES = [
    {
        error: 'El tema es demasiado amplio',
        example: '«La inteligencia artificial en la educación».',
        fix: 'Acota población, lugar y periodo hasta que sepas a quién le preguntarías y qué medirías.',
    },
    {
        error: 'Se parte de la solución',
        example: '«Desarrollar una app para el restaurante».',
        fix: 'Pregunta qué consecuencia sufre la gente hoy y redacta ese estado negativo.',
    },
    {
        error: 'El problema no tiene evidencia',
        example: '«Yo creo que los clientes están insatisfechos».',
        fix: 'Busca un dato, un informe o un antecedente que muestre que el problema existe.',
    },
    {
        error: 'No se puede observar ni medir',
        example: '«Mejorar la calidad de vida».',
        fix: 'Define qué observarías: un indicador, una conducta o una opinión que se pueda recoger.',
    },
    {
        error: 'Se elige el tema solo por moda',
        example: 'Un tema de tendencia que no conoces ni puedes abordar.',
        fix: 'Contrasta con los cuatro criterios: interesante, relevante, novedosa y viable.',
    },
];

/* ---------- Asistente IA ---------- */

const IDEA_SECTIONS = [
    { key: 'idea', pattern: /^idea\s*:/i },
    { key: 'problema', pattern: /^problema\s*:/i },
    { key: 'poblacion', pattern: /^poblaci[oó]n\s*:/i },
    { key: 'lugar', pattern: /^lugar\s*:/i },
    { key: 'periodo', pattern: /^periodo\s*:/i },
    { key: 'verbo', pattern: /^verbo\s*:/i },
    { key: 'objeto', pattern: /^objeto de estudio\s*:/i },
    { key: 'titulo', pattern: /^t[ií]tulo\s*:/i },
    { key: 'pregunta', pattern: /^pregunta\s*:/i },
    { key: 'como', pattern: /^c[oó]mo hacerlo\s*:/i },
    { key: 'limites', pattern: /^posibles limitaciones\s*:/i },
];

// El alcance agrupa los 38 verbos sustantivados que usa la herramienta de Título
// y decide el tipo de pregunta y de investigación.
// Qué se espera de una idea según el nivel académico.
const NIVEL_GUIA = {
    Pregrado: 'alcance acotado, realizable en un semestre o un año con los recursos de un estudiante',
    'Especialización': 'aplicada a una organización o contexto profesional concreto, con resultados útiles para tomar decisiones',
    'Maestría': 'con mayor rigor metodológico y un aporte al conocimiento del área',
    Doctorado: 'con un aporte original al conocimiento y una fundamentación teórica sólida',
};


const ENFOQUES = ['Cuantitativo', 'Cualitativo', 'Mixto'];
const TIEMPOS = ['3 meses', '6 meses', '1 año', 'Más de 1 año'];

// Misma forma inicial que usa la herramienta de Título.
const TITULO_FORM = {
    accion: '', objeto: '', donde: '', quien: '', cuando: '', paraque: '',
    includeParaque: true, includeQuien: true, includeDonde: true, includeCuando: true,
};

const parseIdea = (raw) => {
    const parsed = { idea: '', problema: '', poblacion: '', lugar: '', periodo: '', verbo: '', objeto: '', titulo: '', pregunta: '', como: '', limites: '' };
    let current = 'idea';
    raw.replace(/\*\*/g, '').split('\n').forEach((line) => {
        let text = line.trim().replace(/^[-*•]\s*/, '');
        if (!text) return;
        const section = IDEA_SECTIONS.find((item) => item.pattern.test(text));
        if (section) {
            current = section.key;
            text = text.replace(section.pattern, '').trim();
        }
        if (text) parsed[current] = parsed[current] ? `${parsed[current]} ${text}` : text;
    });
    return parsed;
};

// Ejemplos de distintas carreras para mostrar cómo se arma una idea completa.
const EJEMPLOS = [
    {
        nombre: 'Zootecnia', grupo: 'Pregrado', nivel: 'Pregrado',
        programa: 'Zootecnia', temas: 'salud de terneros',
        problema: 'alta mortalidad de terneros en su primer mes de vida',
        quien: 'pequeños productores ganaderos', donde: 'Montería, Córdoba', cuando: 'el primer semestre de 2026',
        alcance: 'predecir',
    },
    {
        nombre: 'Ingeniería de Sistemas', grupo: 'Pregrado', nivel: 'Pregrado',
        programa: 'Ingeniería de Sistemas', temas: 'tecnología en salud',
        problema: 'inasistencia frecuente a las citas médicas programadas',
        quien: 'pacientes de consulta externa', donde: 'un hospital de Sincelejo, Sucre', cuando: 'el año 2026',
        alcance: 'proponer',
    },
    {
        nombre: 'Enfermería', grupo: 'Pregrado', nivel: 'Pregrado',
        programa: 'Enfermería', temas: 'enfermedades crónicas',
        problema: 'baja adherencia al tratamiento de la hipertensión',
        quien: 'adultos mayores', donde: 'un centro de salud de Cartagena, Bolívar', cuando: 'el segundo semestre de 2026',
        alcance: 'explicar',
    },
    {
        nombre: 'Licenciatura en Educación', grupo: 'Pregrado', nivel: 'Pregrado',
        programa: 'Licenciatura en Educación Básica', temas: 'lectura en la escuela',
        problema: 'bajo nivel de comprensión lectora',
        quien: 'estudiantes de quinto grado', donde: 'escuelas rurales de Lorica, Córdoba', cuando: 'el año escolar 2026',
        alcance: 'evaluar',
    },
    {
        nombre: 'Administración de Empresas', grupo: 'Pregrado', nivel: 'Pregrado',
        programa: 'Administración de Empresas', temas: 'gestión del talento humano',
        problema: 'alta rotación de personal',
        quien: 'empleados de pequeñas empresas de comercio', donde: 'Montería, Córdoba', cuando: 'el año 2026',
        alcance: 'relacionar',
    },
    {
        nombre: 'Ventas en línea', grupo: 'Especialización en Gestión de Negocios Digitales', nivel: 'Especialización',
        programa: 'Especialización en Gestión de Negocios Digitales', temas: 'comercio electrónico',
        problema: 'bajo volumen de ventas a través de canales digitales',
        quien: 'micro y pequeñas empresas de comercio minorista', donde: 'Montería, Córdoba', cuando: 'el año 2026',
        alcance: 'describir',
    },
    {
        nombre: 'Carritos abandonados', grupo: 'Especialización en Gestión de Negocios Digitales', nivel: 'Especialización',
        programa: 'Especialización en Gestión de Negocios Digitales', temas: 'experiencia de compra en línea',
        problema: 'alta tasa de abandono del carrito de compras',
        quien: 'clientes de tiendas virtuales de moda', donde: 'Colombia', cuando: 'el primer semestre de 2026',
        alcance: 'explicar',
    },
    {
        nombre: 'Pagos digitales', grupo: 'Especialización en Gestión de Negocios Digitales', nivel: 'Especialización',
        programa: 'Especialización en Gestión de Negocios Digitales', temas: 'billeteras y pagos digitales',
        problema: 'baja adopción de los pagos digitales',
        quien: 'comerciantes de plazas de mercado', donde: 'Montería, Córdoba', cuando: 'el año 2026',
        alcance: 'comparar',
    },
    {
        nombre: 'Redes sociales', grupo: 'Especialización en Gestión de Negocios Digitales', nivel: 'Especialización',
        programa: 'Especialización en Gestión de Negocios Digitales', temas: 'marketing digital',
        problema: 'baja interacción con los clientes en redes sociales',
        quien: 'emprendimientos turísticos', donde: 'el Golfo de Morrosquillo, Sucre', cuando: 'el segundo semestre de 2026',
        alcance: 'mejorar',
    },
    {
        nombre: 'Acuerdos con proveedores', grupo: 'Especialización en Negociación y Toma de Decisiones', nivel: 'Especialización',
        programa: 'Especialización en Negociación y Toma de Decisiones', temas: 'negociación con proveedores',
        problema: 'incumplimiento frecuente de los acuerdos pactados con proveedores',
        quien: 'pequeñas empresas de alimentos', donde: 'Montería, Córdoba', cuando: 'el año 2026',
        alcance: 'explicar',
    },
    {
        nombre: 'Negociación colectiva', grupo: 'Especialización en Negociación y Toma de Decisiones', nivel: 'Especialización',
        programa: 'Especialización en Negociación y Toma de Decisiones', temas: 'conflictos laborales',
        problema: 'negociaciones colectivas prolongadas que terminan sin acuerdo',
        quien: 'sindicatos y directivos de empresas agroindustriales', donde: 'el departamento de Córdoba', cuando: 'el periodo 2024-2026',
        alcance: 'describir',
    },
    {
        nombre: 'Decisiones gerenciales', grupo: 'Especialización en Negociación y Toma de Decisiones', nivel: 'Especialización',
        programa: 'Especialización en Negociación y Toma de Decisiones', temas: 'toma de decisiones basada en datos',
        problema: 'decisiones de inversión tomadas sin análisis de información',
        quien: 'gerentes de pequeñas y medianas empresas', donde: 'Montería, Córdoba', cuando: 'el año 2026',
        alcance: 'relacionar',
    },
    {
        nombre: 'Conflictos comunitarios', grupo: 'Especialización en Negociación y Toma de Decisiones', nivel: 'Especialización',
        programa: 'Especialización en Negociación y Toma de Decisiones', temas: 'resolución de conflictos',
        problema: 'pocos acuerdos alcanzados en los conflictos por el uso de la tierra',
        quien: 'comunidades campesinas', donde: 'el sur de Córdoba', cuando: 'el año 2026',
        alcance: 'proponer',
    },
];
const EXAMPLE_GROUPS = [...new Set(EJEMPLOS.map((example) => example.grupo))];
const EXAMPLE_KEYS = ['nivel', 'programa', 'temas', 'problema', 'quien', 'donde', 'cuando', 'alcance'];
const exampleFields = (example) => Object.fromEntries(EXAMPLE_KEYS.map((key) => [key, example[key]]));

// Cuántas ideas propone la IA cada vez. Se piden en dos tandas para que la respuesta no se corte.
const TOTAL_IDEAS = 15;

// Un solo formulario: arma la idea en una frase y, con los mismos datos, pide ideas a la IA.
const SintesisIA = ({ intro, wb, setWb, onNavigate }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [ideas, setIdeas] = useProjectField('ideasIA', []);
    const [error, setError] = useState('');
    const [confirming, setConfirming] = useState(null);
    const [applied, setApplied] = useState(null);

    const [, setTituloForm] = useProjectField('tituloForm', TITULO_FORM);
    const [, setTituloIA] = useProjectField('tituloIA', '');
    const [titulo, setTitulo] = useProjectField('titulo', '');
    const [, setPregunta] = useProjectField('pregunta', '');
    const [, setPreguntaTipo] = useProjectField('preguntaTipo', 'Descriptiva');
    const [, setTipoInvestigacion] = useProjectField('tipoInvestigacion', 'Exploratoria');

    // Cada cambio actualiza la ficha y vuelve a armar la frase.
    const update = (patch) => setWb((prev) => {
        const next = { ...prev, ...patch };
        return { ...next, frase: buildSentence(next) };
    });
    const field = (key) => (event) => update({ [key]: event.target.value });

    const isEmpty = !['programa', 'problema', 'quien', 'donde', 'cuando'].some((key) => (wb[key] || '').trim());
    // Los ejemplos se muestran mientras el formulario está vacío o tiene cargado un ejemplo.
    const currentExample = EJEMPLOS.find((example) => example.problema === (wb.problema || '').trim());
    const showExamples = isEmpty || Boolean(currentExample);
    const hasOwnWork = Boolean((wb.problema || '').trim() || (titulo || '').trim());
    const alcanceSel = ALCANCES.find((item) => item.id === wb.alcance);

    const applyIdea = (idea) => {
        const periodo = (wb.cuando || '').trim().replace(/^durante\s+/i, '');
        update({
            problema: idea.problema || wb.problema,
            quien: idea.poblacion || wb.quien,
            donde: idea.lugar || wb.donde,
            cuando: periodo || wb.cuando,
        });
        setTituloForm((prev) => ({
            ...TITULO_FORM,
            ...prev,
            accion: findVerb(idea.verbo) || prev.accion,
            objeto: idea.objeto || prev.objeto,
            quien: idea.poblacion || prev.quien,
            donde: idea.lugar || prev.donde,
            cuando: periodo || prev.cuando,
        }));
        if (idea.titulo) {
            setTituloIA(idea.titulo);
            setTitulo(idea.titulo);
        }
        if (idea.pregunta) setPregunta(idea.pregunta);
        const chosen = ALCANCES.find((item) => item.id === idea.alcance);
        if (chosen?.pregunta) setPreguntaTipo(chosen.pregunta);
        if (chosen?.tipo) setTipoInvestigacion(chosen.tipo);
        setConfirming(null);
        setApplied(idea.idea);
    };

    // «Seleccionar esta idea»: la frase del estudiante queda como su idea elegida y sus datos pasan al Título.
    const fraseActual = buildSentence(wb);
    const fraseCompleta = ['problema', 'quien', 'donde'].every((key) => (wb[key] || '').trim());
    const elegida = Boolean(fraseActual) && (wb.elegida || '') === fraseActual;
    const seleccionarPropia = () => {
        const periodo = (wb.cuando || '').trim().replace(/^durante\s+/i, '');
        setTituloForm((prev) => ({
            ...TITULO_FORM,
            ...prev,
            quien: (wb.quien || '').trim() || prev.quien,
            donde: (wb.donde || '').trim() || prev.donde,
            cuando: periodo || prev.cuando,
        }));
        const chosen = ALCANCES.find((item) => item.id === wb.alcance);
        if (chosen?.pregunta) setPreguntaTipo(chosen.pregunta);
        if (chosen?.tipo) setTipoInvestigacion(chosen.tipo);
        update({ elegida: fraseActual });
        setApplied(null);
    };

    const chooseIdea = (idea) => {
        if (hasOwnWork) setConfirming(idea.idea);
        else applyIdea(idea);
    };

    const buildPrompt = (count, tema, avoid = []) => {
        const v = (key) => (wb[key] || '').trim();
        const nivel = wb.nivel || 'Pregrado';
        const verbs = alcanceSel ? alcanceSel.verbs : ALL_VERBS;
        const reglas = [
            `- Nivel ${nivel}: cada idea debe ser ${NIVEL_GUIA[nivel] || NIVEL_GUIA.Pregrado}.`,
            v('problema') && `- Problema observado: «${v('problema')}». Cada idea debe estudiar este problema o una de sus causas; no cambies de problema.`,
            v('quien') && `- Población: escribe exactamente «${v('quien')}» en el campo Población y menciónala en el título.`,
            v('donde') && `- Lugar: escribe exactamente «${v('donde')}» en el campo Lugar y menciónalo en el título.`,
            v('cuando')
                ? `- Periodo: escribe exactamente «${v('cuando')}» en el campo Periodo.`
                : '- El estudiante no definió un periodo: deja el campo Periodo vacío y no incluyas fechas ni años en el título.',
            alcanceSel && `- Objetivo: ${alcanceSel.label.toUpperCase()} (${alcanceSel.hint.toLowerCase()}). Todas las ideas deben tener este objetivo, no otro.`,
            alcanceSel && `- La pregunta debe ser ${alcanceSel.pregunta.toLowerCase()}, con una forma como: ${alcanceSel.questionForm}`,
            alcanceSel && `- El "Cómo hacerlo" debe corresponder a ese objetivo: ${alcanceSel.method}.`,
            `- El campo Verbo debe ser EXACTAMENTE uno de estos sustantivos: ${verbs.join(', ')}. El título debe empezar con ese mismo sustantivo (por ejemplo «${verbs[0]} de…»).`,
            avoid.length && `- No repitas estas ideas ya propuestas: ${avoid.map((t) => `«${t}»`).join('; ')}.`,
            count > 1 && '- Las ideas deben ser distintas entre sí: cambia la causa, la variable, el ángulo o el método; no repitas la misma idea con otras palabras.',
        ].filter(Boolean);

        return `Actúa como un profesor experto en metodología de la investigación.
Genera ${count} ${count === 1 ? 'idea' : 'ideas'} de proyecto de investigación para un estudiante de ${nivel} del programa ${v('programa')}.
Tema de interés: ${tema}.

REGLAS OBLIGATORIAS (si una idea no cumple alguna, no la incluyas):
${reglas.join('\n')}
- Cada idea parte de un problema real: un estado negativo que ya existe, no la ausencia de una solución.

Separa cada idea EXCLUSIVAMENTE con el texto "---IDEA---". NO uses números al inicio.
Para cada idea usa ESTRICTAMENTE este formato, una línea por campo:

**Idea**: [Descripción clara en una o dos oraciones]
**Problema**: [El estado negativo que se estudia, en una frase]
**Población**: [Quiénes lo sufren, sin artículo inicial]
**Lugar**: [Dónde ocurre]
**Periodo**: [Cuándo se estudiará]
**Verbo**: [Uno de los sustantivos permitidos]
**Objeto de estudio**: [Lo que se estudia, para completar el título después del verbo]
**Título**: [Empieza con el Verbo; de 10 a 30 palabras]
**Pregunta**: [Pregunta de investigación clara, entre signos de interrogación]
**Cómo hacerlo**: [Método breve, coherente con el objetivo]
**Posibles Limitaciones**: [1 o 2 limitaciones principales]`;
    };

    // Comprueba que la idea respete el formulario; completa con los datos del estudiante lo que debe ser idéntico.
    const checkIdea = (raw) => {
        const v = (key) => (wb[key] || '').trim();
        const allowed = alcanceSel ? alcanceSel.verbs : ALL_VERBS;
        const titulo = (raw.titulo || '').trim();
        const verbo = findVerb(raw.verbo) || allowed.find((label) => titulo.toLowerCase().startsWith(label.toLowerCase())) || '';
        const idea = {
            ...raw,
            verbo,
            poblacion: v('quien') || raw.poblacion,
            lugar: v('donde') || raw.lugar,
            periodo: v('cuando'),
            alcance: wb.alcance || '',
        };
        const ok = Boolean(
            idea.idea
            && titulo
            && allowed.includes(verbo)
            && titulo.toLowerCase().startsWith(verbo.toLowerCase())
            && (idea.pregunta || '').includes('?'),
        );
        return { idea, ok };
    };

    const requestIdeas = async (count, tema, avoid) => {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: buildPrompt(count, tema, avoid) }],
            temperature: 0.6,
            max_tokens: 8000,
        });
        const content = chatCompletion.choices[0]?.message?.content || '';
        return content.split('---IDEA---').map((item) => parseIdea(item)).filter((item) => item.idea).map(checkIdea);
    };

    const generateIdeas = async (event) => {
        event.preventDefault();
        const tema = (wb.temas || '').trim() || (wb.problema || '').trim();
        if (!(wb.programa || '').trim() || !tema) {
            setError('Escribe al menos tu programa y el tema o el problema para generar ideas.');
            return;
        }

        setIsGenerating(true);
        setError('');
        setApplied(null);
        setConfirming(null);

        try {
            // «Generar otras»: no se repiten las que ya están en pantalla.
            const previas = (Array.isArray(ideas) ? ideas : []).map((item) => item.titulo).filter(Boolean).slice(0, TOTAL_IDEAS);
            const validas = (lista) => lista.filter((item) => item.ok).map((item) => item.idea);
            const sinRepetir = (lista) => lista.filter((item, i) => lista.findIndex((x) => (x.titulo || '').trim().toLowerCase() === (item.titulo || '').trim().toLowerCase()) === i);
            // Primera tanda de 8 y segunda de 7, pidiendo a la segunda que no repita la primera.
            const primera = Math.ceil(TOTAL_IDEAS / 2);
            let valid = validas(await requestIdeas(primera, tema, previas));
            valid = sinRepetir([...valid, ...validas(await requestIdeas(TOTAL_IDEAS - primera, tema, [...previas, ...valid.map((item) => item.titulo)]))]);
            // Si alguna no respetó el formulario, se piden de nuevo solo las que faltan.
            if (valid.length > 0 && valid.length < TOTAL_IDEAS) {
                const retry = await requestIdeas(TOTAL_IDEAS - valid.length, tema, [...previas, ...valid.map((item) => item.titulo)]);
                valid = sinRepetir([...valid, ...validas(retry)]).slice(0, TOTAL_IDEAS);
            }
            if (valid.length === 0) {
                setError('La IA no generó ideas que respeten tus datos. Revisa el formulario e inténtalo de nuevo.');
                return;
            }
            setIdeas(valid);
        } catch (err) {
            console.error(err);
            setError(err.message || 'No se pudieron generar las ideas. Revisa tu conexión y vuelve a intentarlo.');
        } finally {
            setIsGenerating(false);
        }
    };

    const parts = sentenceParts(wb);

    return (
        <>
            <div className="ide-synth-left">
                {intro}
                <p className="ide-synth-label">Tu idea en una frase</p>
                <p className="ide-template ide-sentence" aria-live="polite">
                    {parts.map((part, index) => (part.slot
                        ? <mark key={index} data-filled={part.filled}>{part.text}</mark>
                        : <React.Fragment key={index}>{part.text}</React.Fragment>))}
                </p>
                <p className="ide-hint">
                    Se arma sola mientras completas el formulario. Léela en voz alta: si necesitas explicarla, todavía no está lista.
                </p>
                <div className="ide-elegir">
                    {elegida ? (
                        <>
                            <p className="ide-feedback ide-feedback--ok" role="status"><CheckCircle2 size={16} /><span>Idea seleccionada. El Título ya tiene tu población, tu lugar y tu periodo.</span></p>
                            {onNavigate && <button type="button" className="ide-btn ide-btn--ghost" onClick={() => onNavigate('titulo')}>Construir el título <ArrowRight size={15} /></button>}
                        </>
                    ) : (
                        <>
                            <button type="button" className="ide-btn ide-btn--primary" onClick={seleccionarPropia} disabled={!fraseCompleta}>
                                <CheckCircle2 size={16} /> Seleccionar esta idea
                            </button>
                            {!fraseCompleta && <small className="ide-field-hint">Completa al menos el problema, la población y el lugar.</small>}
                        </>
                    )}
                </div>
                {showExamples && (
                    <div className="ide-examples">
                        <span className="ide-label" id="ide-ejemplos-label">Mira cómo queda con un ejemplo</span>
                        {EXAMPLE_GROUPS.map((grupo) => (
                            <div key={grupo} className="ide-example-group">
                                <small id={`ide-ej-${grupo.length}`}>{grupo}</small>
                                <div className="ide-verbs" role="group" aria-labelledby={`ide-ej-${grupo.length}`}>
                                    {EJEMPLOS.filter((example) => example.grupo === grupo).map((example) => (
                                        <button
                                            key={example.nombre}
                                            type="button"
                                            className="ide-chip"
                                            aria-pressed={currentExample === example}
                                            onClick={() => update(exampleFields(example))}
                                        >
                                            {example.nombre}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {currentExample && (
                            <button
                                type="button"
                                className="ide-link"
                                onClick={() => update({ ...Object.fromEntries(EXAMPLE_KEYS.map((key) => [key, ''])), nivel: 'Pregrado' })}
                            >
                                Quitar el ejemplo y escribir el mío
                            </button>
                        )}
                    </div>
                )}
            </div>

            <form className="ide-panel ide-form" onSubmit={generateIdeas} noValidate>
                <div className="ide-form-pair">
                    <div className="input-group">
                        <label htmlFor="ide-nivel">Nivel</label>
                        <select id="ide-nivel" className="input-field" value={wb.nivel || 'Pregrado'} onChange={field('nivel')}>
                            <option value="Pregrado">Pregrado</option>
                            <option value="Especialización">Especialización</option>
                            <option value="Maestría">Maestría</option>
                            <option value="Doctorado">Doctorado</option>
                        </select>
                    </div>
                    <Campo id="ide-programa" label="Programa académico" value={wb.programa || ''} onChange={field('programa')} placeholder="Ej: Zootecnia, Ingeniería de Sistemas" autofill="Zootecnia" />
                </div>

                <Campo
                    id="ide-problema"
                    label="¿Qué problema has observado?"
                    value={wb.problema || ''}
                    onChange={field('problema')}
                    placeholder="Ej: alta mortalidad de terneros en su primer mes"
                    hint="Escríbelo como algo que ya ocurre, no como algo que falta («no hay una app»)."
                />

                <div className="ide-form-trio">
                    <Campo id="ide-quien" label="¿A quiénes afecta?" value={wb.quien || ''} onChange={field('quien')} placeholder="Ej: pequeños productores" />
                    <Campo id="ide-donde" label="¿Dónde?" value={wb.donde || ''} onChange={field('donde')} placeholder="Ej: Montería, Córdoba" />
                    <Campo id="ide-cuando" label="¿Cuándo? (opcional)" value={wb.cuando || ''} onChange={field('cuando')} placeholder="Ej: primer semestre de 2026" />
                </div>

                <div className="input-group">
                    <span className="ide-label" id="ide-alcance-label">¿Qué quieres lograr?</span>
                    <div className="ide-alcances" role="group" aria-labelledby="ide-alcance-label">
                        {ALCANCES.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                className="ide-alcance"
                                aria-pressed={wb.alcance === item.id}
                                onClick={() => update({ alcance: wb.alcance === item.id ? '' : item.id })}
                            >
                                <b>{item.label}</b>
                                <small>{item.hint}</small>
                            </button>
                        ))}
                    </div>
                </div>

                <Campo
                    id="ide-tema"
                    label="Tema de interés (para la IA)"
                    value={wb.temas || ''}
                    onChange={field('temas')}
                    placeholder="Ej: salud animal, deserción universitaria"
                    autofill="salud animal"
                />

                {error && (
                    <div className="ide-alert" role="alert">
                        <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                        <span>{error}</span>
                    </div>
                )}

                <button type="submit" className="ide-btn ide-btn--primary" disabled={isGenerating} style={{ justifyContent: 'center', padding: '0.8rem 1rem' }}>
                    {isGenerating
                        ? <><span className="ide-spinner" aria-hidden="true" /> Generando ideas…</>
                        : <><Cpu size={17} /> {ideas.length > 0 ? `Generar otras ${TOTAL_IDEAS} ideas` : `¿Te falta inspiración? Sugerir ${TOTAL_IDEAS} ideas`}</>}
                </button>
            </form>

            {ideas.length > 0 && (
                <section className="ide-results" aria-live="polite">
                    <h3>Ideas sugeridas para ti</h3>
                    <ol className="ide-ideas">
                        {ideas.map((idea) => {
                            const isApplied = applied === idea.idea;
                            return (
                                <li key={idea.idea} data-applied={isApplied}>
                                    <div>
                                        <p className="ide-idea-main">{idea.idea}</p>
                                        {(() => {
                                            const meta = ALCANCES.find((item) => item.id === idea.alcance);
                                            const tags = [
                                                meta && `Objetivo: ${meta.label}`,
                                                meta && `Pregunta ${meta.pregunta.toLowerCase()}`,
                                                idea.verbo && `Verbo: ${idea.verbo}`,
                                                [idea.poblacion, idea.lugar, idea.periodo].filter(Boolean).join(' · '),
                                            ].filter(Boolean);
                                            return tags.length > 0 && (
                                                <ul className="ide-idea-tags">{tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
                                            );
                                        })()}
                                        <dl>
                                            {idea.titulo && <div><dt>Título sugerido</dt><dd>{idea.titulo}</dd></div>}
                                            {idea.pregunta && <div><dt>Pregunta sugerida</dt><dd>{idea.pregunta}</dd></div>}
                                            {idea.como && <div><dt>Cómo hacerlo</dt><dd>{idea.como}</dd></div>}
                                            {idea.limites && <div><dt>Posibles limitaciones</dt><dd>{idea.limites}</dd></div>}
                                        </dl>
                                        <div className="ide-idea-actions">
                                            {isApplied ? (
                                                <div className="ide-feedback ide-feedback--ok" role="status">
                                                    <CheckCircle2 size={16} />
                                                    <span>Idea guardada: tu frase, el Título y la Pregunta ya la tienen.</span>
                                                </div>
                                            ) : confirming === idea.idea ? (
                                                <div className="ide-confirm" role="alert">
                                                    <span>Esto reemplaza el problema, la población, el título y la pregunta que ya tienes.</span>
                                                    <button type="button" className="ide-btn ide-btn--primary" onClick={() => applyIdea(idea)}>Reemplazar</button>
                                                    <button type="button" className="ide-btn ide-btn--ghost" onClick={() => setConfirming(null)}>Cancelar</button>
                                                </div>
                                            ) : (
                                                <button type="button" className="ide-btn ide-btn--primary" onClick={() => chooseIdea(idea)}>
                                                    <CheckCircle2 size={16} /> Usar esta idea
                                                </button>
                                            )}
                                            {isApplied && onNavigate && (
                                                <div className="ide-idea-next">
                                                    <button type="button" className="ide-btn ide-btn--primary" onClick={() => onNavigate('titulo')}>
                                                        Seguir con el título <ArrowRight size={16} />
                                                    </button>
                                                    <button type="button" className="ide-btn ide-btn--ghost" onClick={() => onNavigate('pregunta')}>
                                                        Ver la pregunta
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </section>
            )}
        </>
    );
};

/* ---------- Presentación ---------- */

const Ideacion = ({ onNavigate }) => {
    const [storedIdea, setStoredIdea] = useProjectField('idea', EMPTY_WORKBOOK);
    const wb = useMemo(() => ({ ...EMPTY_WORKBOOK, ...(storedIdea || {}) }), [storedIdea]);
    const setWb = useCallback((update) => {
        setStoredIdea((prev) => {
            const current = { ...EMPTY_WORKBOOK, ...(prev || {}) };
            return typeof update === 'function' ? update(current) : update;
        });
    }, [setStoredIdea]);
    const [copied, setCopied] = useState('');
    const field = (key) => (event) => setWb((prev) => ({ ...prev, [key]: event.target.value }));

    const copyFicha = async () => {
        try {
            await navigator.clipboard.writeText(buildFicha(wb));
            setCopied('Ficha copiada al portapapeles.');
        } catch {
            setCopied('No se pudo copiar. Selecciona el texto de la ficha y cópialo manualmente.');
        }
    };

    const copyControls = (
        <>
            <div className="ide-row">
                <span>Tus respuestas se guardan en tu proyecto.</span>
                <button type="button" className="ide-btn ide-btn--ghost" onClick={copyFicha}>
                    <Clipboard size={15} /> Copiar mi ficha
                </button>
            </div>
            {copied && <p className="ide-hint" role="status">{copied}</p>}
        </>
    );

    const renderSlide = ({ slide, heading, goToSection, sectionMinutes, totalMinutes }) => ({
        portada: (
            <>
                <div>
                    {heading}
                    <p>
                        Todo gran proyecto comienza con la identificación de una <strong>situación problemática</strong> o una <strong>oportunidad de mejora</strong>.
                    </p>
                    <p>
                        No basta con tener una «buena idea»: hay que validar que responda a una necesidad real de una población específica.
                    </p>
                    <p><strong>Al terminar esta clase podrás:</strong></p>
                    <ul className="ide-bullets">
                        <li>Distinguir un problema de una solución y de un síntoma.</li>
                        <li>Reconocer causas y efectos con el árbol de problemas.</li>
                        <li>Delimitar población, lugar y periodo.</li>
                        <li>Valorar la viabilidad y el impacto de tu idea.</li>
                        <li>Redactar tu idea de investigación en una frase.</li>
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
                    <p className="ide-hint">Ten a mano papel y lápiz. Lo que escribas en los ejercicios se reúne al final en tu ficha de idea.</p>
                </div>
            </>
        ),
        fuentes: (
            <>
                <div>
                    {heading}
                    <p>Las ideas de investigación rara vez aparecen de la nada. Casi siempre vienen de una de estas cuatro fuentes.</p>
                    <ul className="ide-list">
                        <li><Users size={18} /><span><b>Tu experiencia</b>Lo que has visto en prácticas, trabajo, voluntariado o tu propio barrio.</span></li>
                        <li><MapPin size={18} /><span><b>Necesidades del entorno</b>Problemas que una comunidad, empresa o institución ya reconoce.</span></li>
                        <li><BookOpen size={18} /><span><b>Vacíos en la literatura</b>La sección «futuras investigaciones» de artículos y tesis recientes.</span></li>
                        <li><Compass size={18} /><span><b>Líneas de tu programa</b>Grupos y semilleros que ya tienen datos, asesores y proyectos en curso.</span></li>
                    </ul>
                </div>
                <div className="ide-panel">
                    <h3>Actividad individual: tus temas de interés</h3>
                    <Campo
                        id="ide-temas"
                        label="Escribe tres temas que te gustaría investigar"
                        value={wb.temas}
                        onChange={field('temas')}
                        placeholder="Ej: deserción universitaria, agricultura de precisión, salud mental en adolescentes"
                        multiline
                        rows={4}
                    />
                    <p>Para discutir en parejas: ¿de cuál de las cuatro fuentes salió cada tema? ¿Cuál conoces de primera mano?</p>
                </div>
            </>
        ),
        criterios: (
            <>
                <div>
                    {heading}
                    <p>Antes de enamorarte de una idea, pásala por cuatro criterios. Si falla en uno, se puede ajustar; si falla en varios, conviene cambiarla.</p>
                    <p className="ide-hint">Para discutir: de tus tres temas, ¿cuál cumple mejor los cuatro criterios? Marca ese y trabaja con él el resto de la clase.</p>
                </div>
                <Pestanas title="Los cuatro criterios" name="criterios" items={CRITERIA} />
            </>
        ),
        problema: (
            <>
                <div>
                    {heading}
                    <p>
                        Un <strong>problema</strong> es un estado negativo que ya existe: algo que le ocurre a alguien y que se puede observar o medir.
                    </p>
                    <p>
                        «Falta una app» no es un problema, es una solución disfrazada. El problema real podría ser «baja productividad», y la app solo una de varias formas de atenderlo.
                    </p>
                    <p className="ide-hint">
                        <BookOpen size={15} style={{ verticalAlign: '-2px', marginRight: '0.35rem' }} />
                        Prueba rápida: si tu frase empieza con «falta», «no hay» o «no existe», pregúntate qué consecuencia sufre la gente.
                    </p>
                </div>
                <Opciones title="Practica: ¿problema o falta de solución?" questions={STATEMENTS} />
            </>
        ),
        porques: (
            <>
                <div>
                    {heading}
                    <p>
                        Un <strong>síntoma</strong> es lo que se ve; la <strong>causa</strong> es lo que lo produce. Si tu proyecto ataca el síntoma, el problema vuelve a aparecer.
                    </p>
                    <p>La técnica es sencilla: toma lo que observas y pregunta «¿por qué?» varias veces, hasta llegar a algo sobre lo que sí puedes intervenir.</p>
                    <p className="ide-hint">No siempre son exactamente cinco. Detente cuando la respuesta ya no dependa de ti o de tu disciplina.</p>
                </div>
                <Porques />
            </>
        ),
        arbol: (
            <>
                <div>
                    {heading}
                    <p>
                        Para formular bien hay que ir a la raíz y no quedarse en el síntoma. El árbol de problemas ordena lo que observas en tres niveles.
                    </p>
                    <p>
                        <strong>Raíz (causas):</strong> ¿por qué ocurre esto?<br />
                        <strong>Tronco (problema central):</strong> la situación negativa principal.<br />
                        <strong>Ramas (efectos):</strong> ¿qué consecuencias trae?
                    </p>
                    <p className="ide-hint">En la siguiente diapositiva vas a construir el tuyo.</p>
                </div>
                <Arbol />
            </>
        ),
        poblacion: (
            <>
                <div>
                    {heading}
                    <p>
                        Define <strong>quién sufre el problema</strong>. Entre más específico seas, más efectiva será tu solución y más fácil será recolectar datos.
                    </p>
                    <p>
                        Una buena delimitación responde a quiénes son, dónde están y qué condición comparten.
                    </p>
                </div>
                <Poblacion />
            </>
        ),
        delimita: (
            <>
                <div>
                    {heading}
                    <p>Delimitar es decidir hasta dónde llega tu estudio. No lo hace menos importante: lo hace posible.</p>
                    <ul className="ide-list">
                        <li><Users size={18} /><span><b>Quién</b>La población y la condición que comparte.</span></li>
                        <li><MapPin size={18} /><span><b>Dónde</b>La institución, municipio o región donde ocurre.</span></li>
                        <li><Clock size={18} /><span><b>Cuándo</b>El periodo que vas a observar.</span></li>
                    </ul>
                </div>
                <div className="ide-panel ide-workbook">
                    <h3>Actividad: delimita tu problema</h3>
                    <Campo id="ide-wb-quien" label="¿Quién sufre el problema?" value={wb.quien} onChange={field('quien')} placeholder="Ej: Los estudiantes de primer semestre de ingeniería" />
                    <Campo id="ide-wb-donde" label="¿Dónde ocurre?" value={wb.donde} onChange={field('donde')} placeholder="Ej: una universidad pública de la región Caribe" />
                    <Campo id="ide-wb-cuando" label="¿En qué periodo lo vas a estudiar?" value={wb.cuando} onChange={field('cuando')} placeholder="Ej: durante el año 2026" />
                </div>
            </>
        ),
        contexto: (
            <>
                <div>
                    {heading}
                    <p>
                        Ningún problema existe en el vacío. Describe las características físicas, sociales o culturales del lugar donde ocurre.
                    </p>
                    <p>
                        El mismo problema exige soluciones distintas en una ciudad con buena conectividad que en una vereda sin señal.
                    </p>
                    <p className="ide-hint">Para discutir: ¿qué característica del lugar que elegiste cambia la forma de abordar tu problema?</p>
                </div>
                <div className="ide-panel">
                    <h3>Preguntas para describir tu entorno</h3>
                    <ul className="ide-list">
                        <li><MapPin size={18} /><span><b>¿Es una zona rural o urbana?</b>Define distancias, transporte y acceso a servicios.</span></li>
                        <li><Cpu size={18} /><span><b>¿Qué recursos tecnológicos hay disponibles?</b>Internet, equipos, energía estable.</span></li>
                        <li><Users size={18} /><span><b>¿Existen barreras culturales?</b>Idioma, costumbres, desconfianza frente a lo nuevo.</span></li>
                    </ul>
                </div>
            </>
        ),
        viabilidad: (
            <>
                <div>
                    {heading}
                    <p>
                        Tu idea debe ser <strong>realizable</strong> con los recursos y el tiempo disponibles. Una idea brillante que no puedes terminar no es un buen proyecto.
                    </p>
                    <ul className="ide-list">
                        <li><Database size={18} /><span><b>Información</b>¿Alguien te dará acceso a los datos o a las personas?</span></li>
                        <li><Wrench size={18} /><span><b>Conocimiento</b>¿Dominas el método o puedes aprenderlo a tiempo?</span></li>
                        <li><Wallet size={18} /><span><b>Costo</b>¿Quién paga equipos, viajes o licencias?</span></li>
                    </ul>
                </div>
                <Viabilidad />
            </>
        ),
        impacto: (
            <>
                <div>
                    {heading}
                    <p>
                        Analiza las consecuencias de tu proyecto más allá de la solución inmediata. El impacto es lo que justifica invertir tiempo y recursos en él.
                    </p>
                    <p>No todo proyecto impacta en las tres dimensiones. Elige las que de verdad aplican y sé concreto.</p>
                </div>
                <Pestanas title="Tres dimensiones para proyectar tu idea" name="impacto" items={IMPACTS} />
            </>
        ),
        errores: (
            <>
                <div>
                    {heading}
                    <p>Estos son los tropiezos que más se repiten en las primeras propuestas. Reconocerlos a tiempo ahorra semanas de trabajo.</p>
                    <p className="ide-hint">Para discutir: lee tu idea y tu delimitación. ¿Caíste en alguno de los cinco?</p>
                </div>
                <div className="ide-panel">
                    <h3>Abre cada error para ver cómo corregirlo</h3>
                    <div className="ide-accordion">
                        {MISTAKES.map((item, i) => (
                            <details key={item.error} open={i === 0}>
                                <summary>{item.error}</summary>
                                <p><em>{item.example}</em></p>
                                <p><strong>Cómo corregirlo:</strong> {item.fix}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </>
        ),
        asistente: (
            <SintesisIA
                wb={wb}
                setWb={setWb}
                onNavigate={onNavigate}
                intro={(
                    <>
                        {heading}
                        <p>Completa los datos y verás tu idea armarse en una frase. Si te falta inspiración, la IA te propone 15 ideas con esos mismos datos.</p>
                    </>
                )}
            />
        ),
        repaso: (
            <>
                <div>
                    {heading}
                    <p>Cinco preguntas rápidas sobre lo visto. Respóndelas sin volver atrás y revisa la explicación de cada una.</p>
                    <p className="ide-hint">Si fallas alguna, vuelve a la diapositiva del tema con la barra de progreso.</p>
                </div>
                <Opciones title="Cuestionario de repaso" questions={REVIEW} />
            </>
        ),
        cierre: (
            <>
                <div>
                    {heading}
                    <ul className="ide-bullets">
                        <li>Un problema es un estado negativo existente, no la ausencia de una solución.</li>
                        <li>El árbol de problemas separa causas, problema central y efectos.</li>
                        <li>Delimitar quién, dónde y cuándo hace posible el estudio.</li>
                        <li>Una buena idea es interesante, relevante, novedosa y viable.</li>
                    </ul>
                </div>
                <div className="ide-panel">
                    <h3>Para la próxima sesión</h3>
                    <ul className="ide-list">
                        <li><CheckCircle2 size={18} /><span><b>Trae tu ficha de idea</b>Con la delimitación y la frase final.</span></li>
                        <li><CheckCircle2 size={18} /><span><b>Sigue con el título</b>Tu frase es el insumo para construirlo.</span></li>
                    </ul>
                    {copyControls}
                </div>
            </>
        ),
    })[slide.id];

    return (
        <SlideDeck
            sections={SECTIONS}
            slides={SLIDES}
            storageKey={SLIDE_KEY}
            label="Fase de Ideación"
            teoria={TEORIA}
            renderSlide={renderSlide}
            finish={onNavigate ? { label: 'Construir el título', onClick: () => onNavigate('titulo') } : null}
        />
    );
};

export default Ideacion;
