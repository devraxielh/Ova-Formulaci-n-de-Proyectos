import React, { useEffect, useRef, useState } from 'react';
import EditorRico from './EditorRico';
import {
    AlertTriangle, CalendarDays, CheckCircle2, MapPin, Package, Plus, Shapes, ShieldCheck, Target, Trash2, Users, XCircle,
} from 'lucide-react';
import SlideDeck, { Opciones, Pestanas } from './deck/SlideDeck';
import { useProjectField } from '../context/ProjectContext';
import { useAutoGuardar } from '../hooks/useAutoGuardar';
import { TIPO_ALCANCE, ejemplosAlcance } from '../data/ejemplos';
import './Titulo.css';
import './Planteamiento.css';
import './Objetivos.css';
import './Justificacion.css';
import './Alcances.css';
import { construccionPrimero } from './deck/orden';
import TEORIA from '../data/teoria/alcances';

/* Clase de 60 minutos: la suma de `min` de todas las diapositivas. */
const SECTIONS = construccionPrimero([
    { id: 'apertura', label: 'Apertura' },
    { id: 'alcances', label: 'Alcances' },
    { id: 'limitaciones', label: 'Limitaciones' },
    { id: 'calidad', label: 'Calidad' },
    { id: 'cierre', label: 'Cierre' },
    { id: 'construccion', label: 'Construcción' },
    { id: 'revision', label: 'Revisión' },
]);

const SLIDES = construccionPrimero([
    { id: 'portada', section: 'apertura', min: 3, title: 'Alcances y limitaciones: las fronteras de tu proyecto' },
    { id: 'quees', section: 'apertura', min: 3, title: 'Qué es cada uno' },
    { id: 'dossentidos', section: 'apertura', min: 3, title: 'Los dos sentidos de «alcance»' },
    { id: 'tipos', section: 'alcances', min: 5, title: 'Tipos de alcance de la investigación' },
    { id: 'delimitacion', section: 'alcances', min: 4, title: 'Las cinco fronteras del estudio' },
    { id: 'loquesi', section: 'alcances', min: 4, title: 'Lo que sí y lo que no' },
    { id: 'tiposlim', section: 'limitaciones', min: 5, title: 'Tipos de limitaciones' },
    { id: 'mitigar', section: 'limitaciones', min: 4, title: 'Toda limitación lleva su respuesta' },
    { id: 'errores', section: 'calidad', min: 4, title: 'Siete errores frecuentes' },
    { id: 'juzga', section: 'calidad', min: 4, title: '¿Alcance, limitación o ninguno?' },
    { id: 'reescribe', section: 'calidad', min: 3, title: 'Antes y después' },
    { id: 'repaso', section: 'cierre', min: 2, title: 'Repaso' },
    { id: 'cierre', section: 'cierre', min: 1, title: 'Lo que te llevas' },
    { id: 'construye', section: 'construccion', min: 10, title: 'Redacta tus alcances y limitaciones', layout: 'builder' },
    { id: 'revision', section: 'revision', min: 5, title: 'Qué hace buenos a unos alcances y limitaciones' },
]);

const SLIDE_KEY = 'projectsia:alcances:diapositiva';

/* ---------- Utilidades ---------- */

const clean = (text) => String(text || '').trim().replace(/[\s.,;:]+$/, '');
const capital = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : '');
const lower = (text) => (text ? text.charAt(0).toLowerCase() + text.slice(1) : '');
const countWords = (text) => String(text || '').trim().split(/\s+/).filter(Boolean).length;

const TIPOS = [
    { id: 'exploratorio', busca: 'examina un tema poco estudiado para identificar sus aspectos principales' },
    { id: 'descriptivo', busca: 'especifica las características del fenómeno sin establecer sus causas' },
    { id: 'descriptivo comparativo', busca: 'describe el fenómeno y lo compara entre grupos' },
    { id: 'correlacional', busca: 'mide el grado de relación entre variables, sin afirmar que una cause la otra' },
    { id: 'explicativo', busca: 'busca las causas o los factores que explican el fenómeno' },
    { id: 'explicativo predictivo', busca: 'busca anticipar el fenómeno a partir de las variables asociadas' },
    { id: 'evaluativo', busca: 'valora el efecto o la efectividad de una intervención' },
    { id: 'propositivo', busca: 'diagnostica el problema y diseña una propuesta para atenderlo' },
];

const LIMITES_TIPO = [
    { label: 'Tiempo', limitacion: 'el tiempo disponible para la recolección de datos es de un semestre', mitigacion: 'se elaborará un cronograma detallado y se recolectarán los datos en las primeras semanas' },
    { label: 'Acceso', limitacion: 'el acceso a los participantes depende de la autorización de la institución', mitigacion: 'se solicitará el aval con anticipación y se acordarán las fechas de recolección' },
    { label: 'Muestra', limitacion: 'la muestra es intencional y pequeña, por lo que los resultados no se pueden generalizar', mitigacion: 'se describirá con detalle la muestra y se interpretarán los resultados solo para ese contexto' },
    { label: 'Instrumentos', limitacion: 'no existe un instrumento validado para esta población', mitigacion: 'se adaptará un instrumento existente y se validará con expertos y una prueba piloto' },
    { label: 'Autorreporte', limitacion: 'los participantes pueden responder lo que consideran socialmente aceptable', mitigacion: 'las respuestas serán anónimas y se contrastarán con registros de la institución' },
    { label: 'Recursos', limitacion: 'el proyecto no cuenta con financiación externa', mitigacion: 'se usarán herramientas gratuitas, como formularios en línea, y recursos de la universidad' },
    { label: 'Datos', limitacion: 'los registros de la institución pueden estar incompletos', mitigacion: 'se depurarán los datos y se informará el porcentaje de registros incompletos' },
];

const ALC_FORM = { tipo: '', tematico: '', poblacion: '', lugar: '', tiempo: '', resultados: '', exclusiones: '', limites: [{ limitacion: '', mitigacion: '' }] };

const assembleAlcance = (f) => {
    const tipo = TIPOS.find((item) => item.id === f.tipo);
    const s = [];
    if (tipo) s.push(`Esta investigación tiene un alcance ${tipo.id}: ${tipo.busca}.`);
    if (clean(f.tematico)) s.push(`En lo temático, abarca ${lower(clean(f.tematico))}.`);
    if (clean(f.poblacion) || clean(f.lugar) || clean(f.tiempo)) {
        s.push(`Se realizará${clean(f.poblacion) ? ` con ${lower(clean(f.poblacion))}` : ''}${clean(f.lugar) ? ` de ${clean(f.lugar)}` : ''}${clean(f.tiempo) ? `, durante ${lower(clean(f.tiempo).replace(/^durante\s+/i, ''))}` : ''}.`);
    }
    if (clean(f.resultados)) s.push(`Como resultado, se obtendrá ${lower(clean(f.resultados))}.`);
    if (clean(f.exclusiones)) s.push(`El estudio no abarca ${lower(clean(f.exclusiones).replace(/^no abarca\s+/i, ''))}.`);
    return s.join(' ');
};

const assembleLimitaciones = (limites) => (limites || [])
    .filter((item) => clean(item.limitacion))
    .map((item, index) => `${index + 1}. ${capital(clean(item.limitacion))}.${clean(item.mitigacion) ? ` Para reducir su efecto, ${lower(clean(item.mitigacion))}.` : ''}`)
    .join('\n');

/* ---------- Revisión automática ---------- */

const checkAlcances = (alcance, limitaciones, { quien, donde, tipoEsperado }) => {
    const a = String(alcance || '');
    const l = String(limitaciones || '');
    const items = l.split('\n').map((line) => line.trim()).filter((line) => /^(?:\d+[.)]|[-*•])\s+/.test(line) || line.length > 20);
    const conRespuesta = items.filter((line) => /para (reducir|mitigar|controlar|compensar|disminuir)|se (mitigará|controlará|compensará)|se (solicitará|usará|adaptará|validará|elaborará|describirá|contrastará|depurará)/i.test(line));
    const mentions = (value, text) => {
        const key = clean(value).toLowerCase().split(/[\s,]+/).filter((word) => word.length > 3)[0];
        return key ? text.toLowerCase().includes(key) : true;
    };
    const tipoDeclarado = TIPOS.slice().reverse().find((item) => a.toLowerCase().includes(item.id))?.id;
    return [
        { id: 'tipo', ok: Boolean(tipoDeclarado), label: 'Declara el tipo de alcance', detail: 'Di si es exploratorio, descriptivo, correlacional, explicativo, evaluativo o propositivo.' },
        { id: 'coherente', ok: !tipoEsperado || !tipoDeclarado || tipoDeclarado.split(' ')[0] === tipoEsperado.split(' ')[0], label: 'El tipo coincide con lo que quieres lograr', detail: tipoEsperado ? `Según tu idea y tus objetivos, el alcance es ${tipoEsperado}.` : '' },
        { id: 'tematico', ok: /abarca|comprende|se centra|se enfoca|aborda/i.test(a), label: 'Delimita el tema', detail: 'Di qué aspectos del tema abarca: «En lo temático, abarca…».' },
        { id: 'poblacion', ok: quien ? mentions(quien, a) : /con (los|las|el|la|\d)|participantes|población/i.test(a), label: 'Delimita la población', detail: quien ? `Tu población es «${clean(quien)}».` : 'Di con quiénes se hará el estudio.' },
        { id: 'lugar', ok: donde ? mentions(donde, a) : /\bde (un|una|la|el)\b|en (el|la) /i.test(a), label: 'Delimita el lugar', detail: donde ? `Tu lugar es «${clean(donde)}».` : 'Di dónde se hará el estudio.' },
        { id: 'tiempo', ok: /\b(19|20)\d{2}\b|semestre|mes(es)?\b|año|periodo|período|durante/i.test(a), label: 'Delimita el tiempo', detail: 'Di en qué periodo se hará: «durante el primer semestre de 2026».' },
        { id: 'resultados', ok: /obtendrá|resultado|producto|entregará|permitirá/i.test(a), label: 'Dice qué se obtendrá', detail: 'Di qué producto o conocimiento dejará el estudio.' },
        { id: 'exclusiones', ok: /no (abarca|incluye|hace parte|pretende|se (estudiará|evaluará|incluirá))|queda(n)? por fuera/i.test(a), label: 'Dice lo que no abarca', detail: 'Declara lo que queda fuera: «El estudio no abarca…».' },
        { id: 'cantidad', ok: items.length >= 2, label: 'Reconoce al menos dos limitaciones', detail: `Tiene ${items.length}. Piensa en tiempo, acceso, muestra, instrumentos o recursos.` },
        { id: 'respuesta', ok: items.length > 0 && conRespuesta.length === items.length, label: 'Cada limitación tiene cómo reducirla', detail: 'Agrega a cada limitación lo que harás para reducir su efecto: «Para reducir su efecto, se…».' },
        { id: 'promesas', ok: !/solucionará|eliminará|resolverá (el|la) problema|garantiza/i.test(`${a} ${l}`), label: 'No promete más de lo posible', detail: 'Evita «solucionará» o «garantiza»: di lo que el estudio sí puede lograr.' },
    ];
};

/* ---------- Contenido de la clase ---------- */

const QUEES_QUIZ = [
    {
        text: '¿Cuál es una limitación?',
        options: [
            'El estudio se hará con estudiantes de primer semestre de una universidad pública de Montería durante 2026.',
            'La muestra es intencional, por lo que los resultados no se podrán generalizar a otras universidades.',
            'El tema de la deserción es muy importante para el país.',
        ],
        answer: 1,
        why: 'Es una restricción que afecta los resultados. La primera es parte del alcance (delimitación); la tercera es justificación.',
    },
];

const DOS_SENTIDOS = [
    { label: 'Alcance de la investigación', text: 'Hasta qué nivel de conocimiento llega: explorar, describir, correlacionar, explicar, evaluar o proponer.', note: 'Depende de tu pregunta y de tus objetivos.' },
    { label: 'Alcance del proyecto (delimitación)', text: 'Las fronteras concretas: qué tema, con quiénes, dónde, cuándo y qué se entregará.', note: 'Dice exactamente qué cubre el estudio y qué no.' },
];

const TIPOS_TEORIA = [
    { id: 'exploratorio', label: 'Exploratorio', what: 'Tema poco estudiado: identifica aspectos, categorías o variables para estudios posteriores.', example: '¿Cómo viven los adultos mayores rurales el uso de la telemedicina?' },
    { id: 'descriptivo', label: 'Descriptivo', what: 'Especifica características, frecuencias o perfiles, sin buscar causas.', example: '¿Cuál es el perfil de los pacientes que no asisten a sus citas?' },
    { id: 'correlacional', label: 'Correlacional', what: 'Mide si dos o más variables se relacionan y con qué fuerza.', example: '¿Qué relación hay entre el olvido de la cita y la inasistencia?' },
    { id: 'explicativo', label: 'Explicativo', what: 'Busca por qué ocurre: causas o factores que lo determinan.', example: '¿Qué factores determinan la inasistencia a las citas?' },
    { id: 'evaluativo', label: 'Evaluativo', what: 'Valora si una intervención funciona o qué efecto tiene.', example: '¿Qué efecto tienen los recordatorios por mensaje en la inasistencia?' },
    { id: 'propositivo', label: 'Propositivo', what: 'Diagnostica y diseña una propuesta para atender el problema.', example: '¿Cómo debería diseñarse una estrategia para reducir la inasistencia?' },
];

const FRONTERAS = [
    { icon: Shapes, label: 'Temática', text: 'Qué aspectos del tema se estudian.', example: 'Los factores personales e institucionales de la inasistencia.' },
    { icon: Users, label: 'Poblacional', text: 'Con quiénes.', example: 'Pacientes adultos de consulta externa.' },
    { icon: MapPin, label: 'Espacial', text: 'Dónde.', example: 'Un hospital de Sincelejo, Sucre.' },
    { icon: CalendarDays, label: 'Temporal', text: 'Cuándo o en qué periodo.', example: 'Primer semestre de 2026.' },
    { icon: Package, label: 'Resultados', text: 'Qué se obtendrá o entregará.', example: 'Los factores que más inciden en la inasistencia.' },
];

const LOQUESI = [
    { si: 'Identificar los factores asociados a la inasistencia.', no: 'Diseñar ni aplicar un sistema de recordatorios.' },
    { si: 'Pacientes adultos de consulta externa.', no: 'Pacientes de urgencias, hospitalización ni menores de edad.' },
    { si: 'Un hospital de Sincelejo.', no: 'Otros hospitales del departamento.' },
    { si: 'Citas del primer semestre de 2026.', no: 'Datos de años anteriores.' },
];

const TIPOS_LIM = LIMITES_TIPO.map((item) => ({
    id: item.label.toLowerCase(), label: item.label, what: `Ejemplo: ${capital(item.limitacion)}.`, example: `Para reducir su efecto, ${item.mitigacion}.`,
}));

const ERRORES = [
    { error: 'Confundir alcance con justificación', example: '«El alcance de este proyecto es muy grande porque beneficiará a toda la región».', fix: 'El alcance dice qué cubre el estudio; para qué sirve va en la justificación.' },
    { error: 'No declarar el tipo de alcance', example: 'Delimitar población y lugar, pero no decir si es descriptivo, correlacional…', fix: 'Abre con «Esta investigación tiene un alcance…» según tus objetivos.' },
    { error: 'Un tipo de alcance que no corresponde', example: 'Decir que es explicativo cuando los objetivos solo describen.', fix: 'El tipo de alcance lo marca el verbo más alto de tus objetivos específicos.' },
    { error: 'Fronteras vagas', example: '«Se hará con jóvenes de Colombia».', fix: 'Precisa: «estudiantes de grado 11 de dos colegios públicos de Lorica, en 2026».' },
    { error: 'Limitaciones que son excusas', example: '«No tengo mucho tiempo porque trabajo».', fix: 'Una limitación es una restricción del estudio, no una situación personal. Escríbela en tercera persona y con su efecto.' },
    { error: 'Limitaciones sin respuesta', example: '«La muestra es pequeña.» (y nada más)', fix: 'Agrega cómo reducirás su efecto: «…por lo que los resultados se interpretarán solo para ese contexto».' },
    { error: 'Limitaciones que invalidan el estudio', example: '«No se podrá acceder a la población».', fix: 'Si eso es cierto, el estudio no es viable: cambia el diseño antes de seguir.' },
];

const JUZGA_QUIZ = [
    {
        text: '«El estudio se realizará con 120 estudiantes de grado 11 de dos colegios públicos de Lorica, entre febrero y junio de 2026.»',
        options: ['Alcance', 'Limitación', 'Ninguno'],
        answer: 0,
        why: 'Delimita la población, el lugar y el tiempo: es parte del alcance.',
    },
    {
        text: '«Como los datos se obtienen por autorreporte, los participantes podrían ocultar conductas; por eso las encuestas serán anónimas.»',
        options: ['Alcance', 'Limitación', 'Ninguno'],
        answer: 1,
        why: 'Reconoce una restricción y dice cómo se reduce su efecto.',
    },
    {
        text: '«Este proyecto es muy importante porque la educación transforma vidas.»',
        options: ['Alcance', 'Limitación', 'Ninguno'],
        answer: 2,
        why: 'Es una opinión general; si se respalda, iría en la justificación.',
    },
];

const ANTES_DESPUES = [
    { antes: 'El proyecto abarcará a la población de Córdoba.', despues: 'El estudio se realizará con pacientes adultos de consulta externa de un hospital de Montería durante el primer semestre de 2026; no incluye urgencias ni hospitalización.', porque: 'Precisa población, lugar y tiempo, y dice lo que queda fuera.' },
    { antes: 'Una limitación es que no tengo tiempo.', despues: 'El tiempo para la recolección es de un semestre; para reducir su efecto, se aplicarán los instrumentos en las primeras seis semanas.', porque: 'Pasa de excusa personal a restricción del estudio con su respuesta.' },
    { antes: 'Es una investigación muy completa que analizará todo sobre la deserción.', despues: 'Esta investigación tiene un alcance correlacional: mide la relación entre el rendimiento en cálculo y la deserción, sin afirmar causalidad.', porque: 'Declara el tipo de alcance y lo limita a lo que el diseño permite.' },
];

const REPASO = [
    {
        text: '¿Qué define el tipo de alcance (descriptivo, correlacional…)?',
        options: ['El tamaño de la muestra', 'Lo que quieres lograr según tu pregunta y tus objetivos', 'El presupuesto'],
        answer: 1,
        why: 'El nivel de conocimiento que buscas lo fijan la pregunta y los objetivos.',
    },
    {
        text: '¿Cuáles son las fronteras del alcance del proyecto?',
        options: ['Tema, población, lugar, tiempo y resultados', 'Causas y consecuencias', 'Objetivos y metodología'],
        answer: 0,
        why: 'Son las cinco fronteras que dicen qué cubre el estudio.',
    },
    {
        text: '¿Qué debe acompañar a cada limitación?',
        options: ['Una disculpa', 'Lo que se hará para reducir su efecto', 'Una cita bibliográfica'],
        answer: 1,
        why: 'Reconocer la limitación y responderla muestra rigor.',
    },
];

/* ---------- Piezas visuales ---------- */

const Cadena = ({ title, items }) => (
    <div className="ide-panel">
        <h3>{title}</h3>
        <ol className="obj-chain">
            {items.map((item) => (
                <li key={item.label}><span>{item.label}</span><p>{item.text}</p><small>{item.note}</small></li>
            ))}
        </ol>
    </div>
);

const AntesDespues = () => {
    const [open, setOpen] = useState({});
    return (
        <div className="ide-panel">
            <h3>Mira cómo se fortalece cada fragmento</h3>
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

const useAlcancesState = () => {
    const [form, setForm] = useProjectField('alcancesForm', ALC_FORM);
    const [alcances, setAlcances] = useProjectField('alcances', '');
    const [limitaciones, setLimitaciones] = useProjectField('limitaciones', '');
    const [tituloForm] = useProjectField('tituloForm', null);
    const [idea] = useProjectField('idea', null);
    const f = { ...ALC_FORM, ...(form || {}) };
    if (!Array.isArray(f.limites) || f.limites.length === 0) f.limites = [{ limitacion: '', mitigacion: '' }];
    const update = (patch) => setForm((prev) => ({ ...ALC_FORM, ...(prev || {}), ...patch }));
    const i = idea || {};
    const t = tituloForm || {};
    return {
        f, update, alcances, setAlcances, limitaciones, setLimitaciones, idea: i,
        quien: clean(t.quien || i.quien), donde: clean(t.donde || i.donde), cuando: clean(t.cuando || i.periodo),
        tipoEsperado: TIPO_ALCANCE[i.alcance] || '',
    };
};

const CAMPOS = [
    { key: 'tematico', label: 'Qué abarca del tema', color: 'que', hint: 'Los aspectos del tema que estudiarás.', fallback: 'los factores personales e institucionales asociados a la inasistencia a citas' },
    { key: 'poblacion', label: 'Con quiénes', color: 'quien', hint: 'Tu población, lo más precisa posible.', fallback: 'pacientes adultos de consulta externa' },
    { key: 'lugar', label: 'Dónde', color: 'donde', hint: 'La institución, el municipio o la región.', fallback: 'un hospital de Sincelejo, Sucre' },
    { key: 'tiempo', label: 'Cuándo', color: 'cuando', hint: 'El periodo en que se recogen los datos.', fallback: 'el primer semestre de 2026' },
    { key: 'resultados', label: 'Qué se obtendrá', color: 'paraque', hint: 'El producto o conocimiento que dejará el estudio.', fallback: 'la identificación de los factores que más inciden en la inasistencia' },
    { key: 'exclusiones', label: 'Qué no abarca', color: 'extra2', hint: 'Lo que queda por fuera: otras poblaciones, sedes, la aplicación de soluciones…', fallback: 'pacientes de urgencias ni la aplicación de soluciones' },
];

const Constructor = ({ intro }) => {
    const { f, update, setAlcances, setLimitaciones, idea, quien, donde, cuando, tipoEsperado } = useAlcancesState();
    const [saved, setSaved] = useState(false);
    const [active, setActive] = useState('tipo');
    const prefilled = useRef(false);
    const ejemplos = ejemplosAlcance({ idea, alcance: idea.alcance });

    // La primera vez trae el tipo de alcance, la población, el lugar, el tiempo y la limitación de la Ideación.
    useEffect(() => {
        if (prefilled.current) return;
        prefilled.current = true;
        const patch = {};
        if (!f.tipo && tipoEsperado) patch.tipo = tipoEsperado;
        if (!f.poblacion.trim() && quien) patch.poblacion = lower(quien);
        if (!f.lugar.trim() && donde) patch.lugar = donde;
        if (!f.tiempo.trim() && cuando) patch.tiempo = lower(cuando.replace(/^durante\s+/i, ''));
        if (!f.limites.some((item) => item.limitacion.trim()) && clean(idea.limites)) patch.limites = [{ limitacion: clean(idea.limites), mitigacion: '' }];
        if (Object.keys(patch).length > 0) update(patch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const touch = () => setSaved(false);
    const alcanceText = assembleAlcance(f);
    const limText = assembleLimitaciones(f.limites);
    const setLimite = (index, key, value) => { touch(); update({ limites: f.limites.map((item, i) => (i === index ? { ...item, [key]: value } : item)) }); };
    const addLimite = (plantilla) => {
        touch();
        const vacio = f.limites.findIndex((item) => !item.limitacion.trim() && !item.mitigacion.trim());
        const nuevo = plantilla ? { limitacion: plantilla.limitacion, mitigacion: plantilla.mitigacion } : { limitacion: '', mitigacion: '' };
        if (vacio >= 0 && plantilla) update({ limites: f.limites.map((item, i) => (i === vacio ? nuevo : item)) });
        else if (f.limites.length < 6) update({ limites: [...f.limites, nuevo] });
    };
    const removeLimite = (index) => { touch(); update({ limites: f.limites.filter((_, i) => i !== index) }); };
    const save = () => {
        if (!alcanceText && !limText) return;
        setAlcances(alcanceText);
        setLimitaciones(limText);
        setSaved(true);
    };
    // Guardado automático: lo redactado pasa a Mi proyecto sin tener que tocar «Guardar».
    useAutoGuardar(`${alcanceText}|${limText}`.length > 1 ? `${alcanceText}|${limText}` : '', save);
    const tipoInfo = TIPOS.find((item) => item.id === f.tipo);

    return (
        <div className="pla-builder-wrap">
            <header className="pla-builder-head">
                <div>{intro}</div>
                <div className="pla-status">
                    <p className="obj-count"><b>{countWords(alcanceText) + countWords(limText)} palabras</b> · {f.limites.filter((item) => item.limitacion.trim()).length} limitaciones</p>
                    <button type="button" className="ide-btn ide-btn--primary" disabled={!alcanceText && !limText} onClick={save}>
                        <CheckCircle2 size={17} /> Guardar alcances y limitaciones
                    </button>
                    {saved && <p className="ide-feedback ide-feedback--ok" role="status"><CheckCircle2 size={16} /><span>Guardado. Ya aparece en Mi proyecto.</span></p>}
                </div>
            </header>

            <div className="pla-builder">
                <form className="obj-form" onSubmit={(event) => { event.preventDefault(); save(); }} noValidate>
                    <h3 className="alc-block-title"><Target size={17} aria-hidden="true" /> Alcance</h3>
                    <div className="input-group pla-part" data-active={active === 'tipo'}>
                        <span className="alc-label" id="alc-tipo-label"><mark data-part="que" data-active="true">1</mark> Tipo de alcance</span>
                        <div className="alc-tipos" role="radiogroup" aria-labelledby="alc-tipo-label">
                            {TIPOS.map((tipo) => (
                                <button
                                    key={tipo.id}
                                    type="button"
                                    role="radio"
                                    aria-checked={f.tipo === tipo.id}
                                    className="ide-chip"
                                    onClick={() => { touch(); setActive('tipo'); update({ tipo: tipo.id }); }}
                                >
                                    {capital(tipo.id)}{tipoEsperado === tipo.id ? ' ★' : ''}
                                </button>
                            ))}
                        </div>
                        <small className="ide-field-hint">
                            {tipoInfo ? `Un estudio ${tipoInfo.id} ${tipoInfo.busca}.` : 'Elige el nivel de conocimiento al que llega tu estudio.'}
                            {tipoEsperado && ` ★ Según lo que quieres lograr, el tuyo es ${tipoEsperado}.`}
                        </small>
                    </div>

                    <div className="alc-grid">
                        {CAMPOS.map((campo, index) => (
                            <div className="input-group pla-part" data-active={active === campo.key} key={campo.key}>
                                <label htmlFor={`alc-${campo.key}`}><mark data-part={campo.color} data-active="true">{index + 2}</mark> {campo.label}</label>
                                <EditorRico
                                    id={`alc-${campo.key}`}
                                    className="textarea-field"
                                    rows={2}
                                    value={f[campo.key]}
                                    onChange={(event) => { touch(); update({ [campo.key]: event.target.value }); }}
                                    onFocus={() => setActive(campo.key)}
                                    placeholder={`Ej: ${ejemplos[campo.key] || campo.fallback}`}
                                />
                                <small className="ide-field-hint">{campo.hint}</small>
                            </div>
                        ))}
                    </div>

                    <h3 className="alc-block-title"><ShieldCheck size={17} aria-hidden="true" /> Limitaciones y cómo reducirlas</h3>
                    <div className="obj-verbs" role="group" aria-label="Agregar una limitación frecuente">
                        <span>Agregar una limitación frecuente:</span>
                        {LIMITES_TIPO.map((plantilla) => (
                            <button key={plantilla.label} type="button" className="ide-chip" onClick={() => addLimite(plantilla)}>+ {plantilla.label}</button>
                        ))}
                    </div>
                    {f.limites.map((item, index) => (
                        <div className="input-group pla-part alc-lim" data-active={active === `lim-${index}`} key={index}>
                            <div className="alc-lim-head">
                                <span className="alc-label"><mark data-part="donde" data-active="true">L{index + 1}</mark> Limitación {index + 1}</span>
                                {f.limites.length > 1 && (
                                    <button type="button" className="obj-remove" onClick={() => removeLimite(index)} aria-label={`Quitar la limitación ${index + 1}`}><Trash2 size={16} /></button>
                                )}
                            </div>
                            <label className="sr-only" htmlFor={`alc-lim-${index}`}>Limitación {index + 1}</label>
                            <EditorRico
                                id={`alc-lim-${index}`}
                                className="textarea-field"
                                rows={2}
                                value={item.limitacion}
                                onChange={(event) => setLimite(index, 'limitacion', event.target.value)}
                                onFocus={() => setActive(`lim-${index}`)}
                                placeholder={`Ej: ${index === 0 ? ejemplos.limitacion || LIMITES_TIPO[1].limitacion : LIMITES_TIPO[(index + 1) % LIMITES_TIPO.length].limitacion}`}
                            />
                            <label className="alc-sub" htmlFor={`alc-mit-${index}`}>Para reducir su efecto…</label>
                            <EditorRico
                                id={`alc-mit-${index}`}
                                className="textarea-field"
                                rows={2}
                                value={item.mitigacion}
                                onChange={(event) => setLimite(index, 'mitigacion', event.target.value)}
                                onFocus={() => setActive(`lim-${index}`)}
                                placeholder={`Ej: ${index === 0 ? ejemplos.mitigacion || LIMITES_TIPO[1].mitigacion : LIMITES_TIPO[(index + 1) % LIMITES_TIPO.length].mitigacion}`}
                            />
                            {item.limitacion.trim() && !item.mitigacion.trim() && <small className="obj-warn"><AlertTriangle size={14} aria-hidden="true" /> Falta decir cómo reducirás su efecto.</small>}
                        </div>
                    ))}
                    {f.limites.length < 6 && (
                        <button type="button" className="ide-btn ide-btn--ghost obj-add" onClick={() => addLimite(null)}><Plus size={15} /> Agregar otra limitación</button>
                    )}
                    <p className="ide-hint">Tab en una caja vacía escribe el ejemplo armado con tu proyecto.</p>
                </form>

                <aside className="pla-side" aria-label="Tus alcances y limitaciones">
                    <p className="ide-synth-label">Así quedan</p>
                    <div className="pla-preview obj-preview" aria-live="polite">
                        {alcanceText || limText ? (
                            <>
                                <h4>Alcance</h4>
                                <p>{alcanceText || <span className="tit-empty">Completa los campos del alcance.</span>}</p>
                                <h4>Limitaciones</h4>
                                {limText
                                    ? <ol>{limText.split('\n').map((line) => <li key={line}>{line.replace(/^\d+\.\s+/, '')}</li>)}</ol>
                                    : <span className="tit-empty">Agrega al menos dos limitaciones.</span>}
                            </>
                        ) : <span className="tit-empty">Completa los campos y verás aquí tus alcances y limitaciones redactados.</span>}
                    </div>
                </aside>
            </div>
        </div>
    );
};

const CRITERIOS = [
    { label: 'Claro', text: 'Declara el tipo de alcance acorde con tus objetivos.' },
    { label: 'Delimitado', text: 'Tema, población, lugar, tiempo y resultados.' },
    { label: 'Honesto', text: 'Dice lo que no abarca y reconoce sus limitaciones.' },
    { label: 'Responsable', text: 'Cada limitación tiene cómo reducir su efecto.' },
    { label: 'Realista', text: 'No promete más de lo que el diseño permite.' },
];

const Revision = ({ intro }) => {
    const { f, alcances, limitaciones, quien, donde, tipoEsperado } = useAlcancesState();
    const ownA = alcances.trim() || assembleAlcance(f);
    const ownL = limitaciones.trim() || assembleLimitaciones(f.limites);
    const own = [ownA, ownL && `Limitaciones:\n${ownL}`].filter(Boolean).join('\n\n');
    const [text, setText] = useState(own);
    const target = text.trim();
    const isOwn = target === own;
    const [partA, partL = ''] = target.split(/\n\s*limitaciones\s*:?\s*\n/i);
    const checks = checkAlcances(partA, partL, isOwn ? { quien, donde, tipoEsperado } : {});
    const passed = checks.filter((item) => item.ok).length;
    return (
        <>
            <div className="ide-synth-left">
                {intro}
                <ul className="tit-criteria">
                    {CRITERIOS.map((item) => <li key={item.label}><b>{item.label}</b> {item.text}</li>)}
                </ul>
                <label htmlFor="alc-revisar" className="ide-synth-label">Alcances y limitaciones a revisar</label>
                <textarea
                    id="alc-revisar"
                    className="textarea-field tit-review-input"
                    rows={8}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder={'Esta investigación tiene un alcance…\n\nLimitaciones:\n1. …'}
                />
                {!isOwn && own && <button type="button" className="ide-link" onClick={() => setText(own)}>Volver a los míos</button>}
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
                    {isOwn ? 'Revisa la forma de tus alcances y limitaciones guardados.' : 'Revisando un texto distinto al tuyo: se omiten los criterios de tu población, lugar y tipo de alcance.'} Escribe «Limitaciones:» en una línea aparte para separar las dos partes.
                </p>
            </div>
        </>
    );
};

/* ---------- Clase ---------- */

const AlcancesLimitaciones = ({ onNavigate }) => {
    const [idea] = useProjectField('idea', null);
    const [general] = useProjectField('objetivoGeneral', '');
    const [alcances] = useProjectField('alcances', '');
    const tipoEsperado = TIPO_ALCANCE[idea?.alcance] || '';

    const renderSlide = ({ slide, heading, goToSection, sectionMinutes, totalMinutes }) => ({
        portada: (
            <>
                <div>
                    {heading}
                    <p>Los alcances dicen hasta dónde llega tu investigación; las limitaciones, qué podría restringir sus resultados y cómo lo vas a manejar. Juntos le muestran al evaluador que conoces las fronteras de tu proyecto.</p>
                    <p><strong>Al terminar esta clase podrás:</strong></p>
                    <ul className="ide-bullets">
                        <li>Distinguir alcance, limitación y justificación.</li>
                        <li>Declarar el tipo de alcance de tu investigación.</li>
                        <li>Delimitar tema, población, lugar, tiempo y resultados.</li>
                        <li>Reconocer limitaciones y decir cómo reducir su efecto.</li>
                        <li>Redactar los tuyos y revisarlos con criterios.</li>
                    </ul>
                    {clean(general) && (
                        <div className="tit-from-idea">
                            <span>Partirás de tu objetivo general</span>
                            <p>{general}</p>
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
                        <li><Target size={18} /><span><b>Alcance</b>Lo que el estudio cubre: su nivel de conocimiento y sus fronteras (tema, población, lugar, tiempo y resultados).</span></li>
                        <li><ShieldCheck size={18} /><span><b>Limitación</b>Una restricción que puede afectar los resultados, con lo que harás para reducir su efecto.</span></li>
                        <li><XCircle size={18} /><span><b>No es la justificación</b>Para qué sirve el estudio va en su propia sección.</span></li>
                    </ul>
                </div>
                <Opciones title="¿Cuál es una limitación?" questions={QUEES_QUIZ} />
            </>
        ),
        dossentidos: (
            <>
                <div>
                    {heading}
                    <p>La palabra «alcance» se usa en dos sentidos y en esta sección necesitas los dos.</p>
                    <p className="ide-hint">En la construcción, primero eliges el tipo de alcance y luego escribes las fronteras.</p>
                </div>
                <Cadena title="Un estudio, dos respuestas" items={DOS_SENTIDOS} />
            </>
        ),
        tipos: (
            <>
                <div>
                    {heading}
                    <p>Según Hernández Sampieri, el alcance indica el nivel de conocimiento al que llega el estudio. Lo define lo que quieres lograr: tu pregunta y el verbo más alto de tus objetivos específicos.</p>
                    {tipoEsperado
                        ? <div className="tit-saved"><span>Según tu idea, tu alcance es</span><p>{capital(tipoEsperado)}</p></div>
                        : <p className="ide-hint">Completa la Ideación y aquí verás cuál es el tuyo.</p>}
                </div>
                <Pestanas title="Tipos de alcance, con ejemplo" name="alc-tipos" items={TIPOS_TEORIA} />
            </>
        ),
        delimitacion: (
            <>
                <div>
                    {heading}
                    <p>El alcance del proyecto se delimita en cinco fronteras. Cada una responde una pregunta concreta.</p>
                    <p className="ide-hint">Si una frontera queda vaga («jóvenes de Colombia»), el evaluador no sabrá qué vas a estudiar.</p>
                </div>
                <div className="ide-panel">
                    <h3>Las cinco fronteras, con ejemplo</h3>
                    <ul className="jus-questions">
                        {FRONTERAS.map(({ icon: Icon, label, text, example }) => (
                            <li key={label}><Icon size={20} aria-hidden="true" /><span><b>{label}</b>{text} <em>{example}</em></span></li>
                        ))}
                    </ul>
                </div>
            </>
        ),
        loquesi: (
            <>
                <div>
                    {heading}
                    <p>Decir lo que no abarca tu estudio es tan importante como decir lo que sí: evita que te pidan resultados que nunca prometiste.</p>
                    <p className="ide-hint">Para discutir en parejas: ¿qué podría esperar un lector de su proyecto que en realidad no van a hacer?</p>
                </div>
                <div className="ide-panel">
                    <h3>Sí abarca / No abarca</h3>
                    <div className="jus-table" role="table">
                        <div role="row" className="jus-row jus-row--head alc-row">
                            <span role="columnheader">Sí abarca</span>
                            <span role="columnheader">No abarca</span>
                        </div>
                        {LOQUESI.map((item) => (
                            <div role="row" className="jus-row alc-row" key={item.si}>
                                <span role="cell"><CheckCircle2 size={15} aria-hidden="true" /> {item.si}</span>
                                <span role="cell"><XCircle size={15} aria-hidden="true" /> {item.no}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        ),
        tiposlim: (
            <>
                <div>
                    {heading}
                    <p>Todo estudio tiene limitaciones. Reconocerlas no lo debilita: muestra que sabes dónde están los riesgos.</p>
                    <p className="ide-hint">En la construcción podrás agregar cualquiera de estas con un clic y adaptarla.</p>
                </div>
                <Pestanas title="Limitaciones frecuentes y su respuesta" name="alc-lim" items={TIPOS_LIM} />
            </>
        ),
        mitigar: (
            <>
                <div>
                    {heading}
                    <p>Una limitación tiene tres partes: la restricción, su efecto en los resultados y lo que harás para reducirlo.</p>
                    <ul className="ide-list">
                        <li><AlertTriangle size={18} /><span><b>Restricción</b>La muestra es intencional y pequeña…</span></li>
                        <li><Target size={18} /><span><b>Efecto</b>…por lo que los resultados no se pueden generalizar…</span></li>
                        <li><ShieldCheck size={18} /><span><b>Respuesta</b>…se describirá la muestra con detalle y se interpretarán los resultados solo para ese contexto.</span></li>
                    </ul>
                </div>
                <div className="ide-panel">
                    <h3>Limitación o excusa</h3>
                    <ul className="tit-fixes">
                        <li><p className="tit-before"><XCircle size={16} aria-hidden="true" /> «No tengo tiempo porque trabajo.»</p><small>Es personal y no dice qué hará el estudio.</small></li>
                        <li><p className="tit-after"><CheckCircle2 size={16} aria-hidden="true" /> «La recolección se limita a un semestre; los instrumentos se aplicarán en las primeras seis semanas.»</p><small>Restricción del estudio con su respuesta.</small></li>
                    </ul>
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
                    <p>Lee cada fragmento y decide si es parte del alcance, una limitación o ninguno de los dos.</p>
                    <p className="ide-hint">Para discutir en parejas: ¿dónde iría el que no es ninguno?</p>
                </div>
                <Opciones title="Clasifica cada fragmento" questions={JUZGA_QUIZ} />
            </>
        ),
        reescribe: (
            <>
                <div>
                    {heading}
                    <p>Casi todos los fragmentos débiles se arreglan igual: precisar las fronteras, declarar el tipo de alcance y responder cada limitación.</p>
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
                        <li>El alcance declara el nivel de conocimiento (exploratorio, descriptivo, correlacional, explicativo, evaluativo o propositivo).</li>
                        <li>Delimita tema, población, lugar, tiempo y resultados, y dice lo que no abarca.</li>
                        <li>Las limitaciones son restricciones del estudio, no excusas personales.</li>
                        <li>Cada limitación lleva lo que harás para reducir su efecto.</li>
                    </ul>
                </div>
                <div className="ide-panel">
                    <h3>Siguiente paso</h3>
                    {alcances.trim()
                        ? <div className="tit-saved"><span>Tus alcances guardados</span><p>{countWords(alcances)} palabras</p></div>
                        : <p>Los redactarás en la siguiente sección: el tipo de alcance, la población, el lugar y el tiempo ya vienen de tu proyecto.</p>}
                </div>
            </>
        ),
        construye: (
            <Constructor
                intro={(
                    <>
                        {heading}
                        <p>Elige el tipo de alcance y completa cada frontera con una frase: el texto se redacta solo. Luego agrega tus limitaciones, cada una con cómo reducir su efecto.</p>
                    </>
                )}
            />
        ),
        revision: (
            <Revision
                intro={(
                    <>
                        {heading}
                        <p>Revisa tus alcances y limitaciones antes de llevarlos a tu asesor. También puedes pegar los de otro trabajo para analizarlos.</p>
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
            label="Alcances y limitaciones"
            teoria={TEORIA}
            renderSlide={renderSlide}
            finish={onNavigate ? { label: 'Construir el marco referencial', onClick: () => onNavigate('marco') } : null}
        />
    );
};

export default AlcancesLimitaciones;
