import React, { useEffect, useRef, useState } from 'react';
import {
    AlertTriangle, ArrowRight, CheckCircle2, Compass, HelpCircle, ListChecks, Target, Users, XCircle,
} from 'lucide-react';
import SlideDeck, { Opciones, Pestanas } from './deck/SlideDeck';
import { useProjectField } from '../context/ProjectContext';
import { useAutoGuardar } from '../hooks/useAutoGuardar';
import { ALCANCES } from '../data/alcances';
import { conArticulo, segundaVariable } from '../data/ejemplos';
import './Titulo.css';

/* Clase de 60 minutos: la suma de `min` de todas las diapositivas. */
const SECTIONS = [
    { id: 'apertura', label: 'Apertura' },
    { id: 'tipos', label: 'Tipos' },
    { id: 'calidad', label: 'Calidad' },
    { id: 'cierre', label: 'Cierre' },
    { id: 'construccion', label: 'Construcción' },
    { id: 'revision', label: 'Revisión final' },
];

const SLIDES = [
    { id: 'portada', section: 'apertura', min: 3, title: 'La pregunta: el corazón de tu investigación' },
    { id: 'funcion', section: 'apertura', min: 3, title: 'Título, pregunta y objetivo' },
    { id: 'camino', section: 'apertura', min: 3, title: 'Del título a la pregunta' },
    { id: 'tipos', section: 'tipos', min: 5, title: 'Ocho tipos de pregunta' },
    { id: 'interrogativas', section: 'tipos', min: 4, title: 'Las palabras con que empieza' },
    { id: 'variables', section: 'tipos', min: 3, title: 'Las variables en la pregunta' },
    { id: 'delimitar', section: 'tipos', min: 3, title: 'Delimitar la pregunta' },
    { id: 'errores', section: 'calidad', min: 3, title: 'Ocho errores frecuentes' },
    { id: 'juzga', section: 'calidad', min: 4, title: '¿Investigable o no?' },
    { id: 'reescribe', section: 'calidad', min: 4, title: 'De débil a fuerte' },
    { id: 'coherencia', section: 'calidad', min: 3, title: 'Pregunta y título deben coincidir' },
    { id: 'repaso', section: 'cierre', min: 2, title: 'Repaso' },
    { id: 'cierre', section: 'cierre', min: 1, title: 'Lo que te llevas' },
    { id: 'construye', section: 'construccion', min: 12, title: 'Formula tu pregunta' },
    { id: 'revision', section: 'revision', min: 7, title: 'Qué hace buena a una pregunta' },
];

const SLIDE_KEY = 'projectsia:pregunta:diapositiva';

/* ---------- Los ocho tipos ---------- */

/*
 * Cada tipo trae: qué busca, un ejemplo, con qué palabras suele empezar, los inicios que ofrece
 * el constructor (con el conector de la segunda variable) y palabras que lo delatan en la revisión.
 */
const TIPOS = [
    {
        id: 'Exploratoria', desc: 'Indaga un tema poco estudiado o desde una perspectiva nueva.',
        ejemplo: '¿Cuáles son las percepciones de los comerciantes de plazas de mercado de Montería sobre los pagos digitales?',
        empieza: '¿Cuáles son las percepciones…? ¿Qué aspectos…?',
        inicios: [
            { text: '¿Cuáles son las percepciones sobre' },
            { text: '¿Qué aspectos caracterizan' },
            { text: '¿Qué factores intervienen en' },
            { text: '¿Qué significados se atribuyen a' },
            { text: '¿Cuáles son las experiencias relacionadas con' },
            { text: '¿Qué se conoce sobre' },
            { text: '¿Qué elementos configuran' },
            { text: '¿Cuáles son las prácticas asociadas a' },
            { text: '¿Qué dimensiones componen' },
        ],
        claves: ['percep', 'aspectos', 'interviene', 'experiencia', 'significado', 'se conoce', 'cómo viven', 'elementos', 'prácticas', 'dimensiones'],
    },
    {
        id: 'Descriptiva', desc: 'Define las características de personas, grupos o fenómenos.',
        ejemplo: '¿Cuáles son las características del consumo de agua en hogares rurales de Lorica, Córdoba?',
        empieza: '¿Cuáles son…? ¿Cómo es…? ¿Cuál es el nivel de…?',
        inicios: [
            { text: '¿Cuáles son las características de' },
            { text: '¿Cuál es el nivel de' },
            { text: '¿Cómo se presenta' },
            { text: '¿Cuál es la frecuencia de' },
            { text: '¿Cuál es el estado actual de' },
            { text: '¿Cómo se distribuye' },
            { text: '¿Qué rasgos definen' },
            { text: '¿Cuáles son los principales componentes de' },
            { text: '¿Cómo se comporta' },
        ],
        claves: ['caracter', 'nivel', 'cómo es', 'cómo se presenta', 'cuáles son', 'estado actual', 'frecuencia', 'distribuye', 'rasgos', 'componentes', 'comporta'],
    },
    {
        id: 'Comparativa', desc: 'Compara grupos, lugares, momentos o métodos para encontrar diferencias.',
        ejemplo: '¿Qué diferencias existen en el aprendizaje entre estudiantes de modalidad presencial y virtual de una universidad de Montería?',
        empieza: '¿Qué diferencias existen en… entre… y…?',
        inicios: [
            { text: '¿Qué diferencias existen en', conector: 'entre', var2: 'Grupos que comparas', var2Ej: 'comerciantes jóvenes y mayores' },
            { text: '¿Cómo varía', conector: 'entre', var2: 'Grupos, lugares o momentos', var2Ej: 'la jornada diurna y la nocturna' },
            { text: '¿En qué se diferencia', conector: 'entre', var2: 'Grupos que comparas', var2Ej: 'usuarios urbanos y rurales' },
            { text: '¿Qué semejanzas y diferencias presenta', conector: 'entre', var2: 'Grupos que comparas', var2Ej: 'el modelo presencial y el virtual' },
            { text: '¿Qué variaciones se observan en', conector: 'entre', var2: 'Grupos que comparas', var2Ej: 'zonas urbanas y rurales' },
            { text: '¿Cómo cambia', conector: 'entre', var2: 'Momentos que comparas', var2Ej: 'antes y después de la capacitación' },
            { text: '¿Qué contrastes presenta', conector: 'entre', var2: 'Grupos que comparas', var2Ej: 'empresas familiares y no familiares' },
        ],
        claves: ['diferencia', 'compar', 'entre', 'varía', 'semejanza', 'variacion', 'cambia', 'contraste'],
    },
    {
        id: 'Correlacional', desc: 'Evalúa si dos o más variables se asocian.',
        ejemplo: '¿Qué relación existe entre la motivación laboral y la productividad de empleados de pequeñas empresas de Montería?',
        empieza: '¿Qué relación existe entre… y…?',
        inicios: [
            { text: '¿Qué relación existe entre', conector: 'y', var2: 'Segunda variable', var2Ej: 'la productividad' },
            { text: '¿En qué medida se asocia', conector: 'con', var2: 'Segunda variable', var2Ej: 'el rendimiento académico' },
            { text: '¿Cómo se relaciona', conector: 'con', var2: 'Segunda variable', var2Ej: 'la satisfacción del cliente' },
            { text: '¿Qué grado de asociación hay entre', conector: 'y', var2: 'Segunda variable', var2Ej: 'la deserción' },
            { text: '¿Cuál es la relación entre', conector: 'y', var2: 'Segunda variable', var2Ej: 'el clima organizacional' },
            { text: '¿De qué manera se vincula', conector: 'con', var2: 'Segunda variable', var2Ej: 'la lealtad del cliente' },
            { text: '¿Cómo varía', conector: 'según', var2: 'Segunda variable', var2Ej: 'el nivel educativo' },
            { text: '¿Qué asociación se presenta entre', conector: 'y', var2: 'Segunda variable', var2Ej: 'el uso de redes sociales' },
        ],
        claves: ['relación', 'relaciona', 'asocia', 'correlación', 'vínculo', 'según', 'en función', 'vincula', 'asociación'],
    },
    {
        id: 'Explicativa', desc: 'Busca las causas de un fenómeno: por qué ocurre.',
        ejemplo: '¿Qué factores determinan el incumplimiento de los acuerdos con proveedores en pequeñas empresas de alimentos de Montería?',
        empieza: '¿Qué factores determinan…? ¿Por qué…? ¿Cuál es el efecto de… en…?',
        inicios: [
            { text: '¿Qué factores determinan' },
            { text: '¿Por qué se presenta' },
            { text: '¿Qué causas explican' },
            { text: '¿Cuál es el efecto de', conector: 'en', var2: 'Variable que cambia (dependiente)', var2Ej: 'el rendimiento académico' },
            { text: '¿Cómo influye', conector: 'en', var2: 'Variable que cambia (dependiente)', var2Ej: 'la decisión de compra' },
            { text: '¿Cuáles son los factores asociados a' },
            { text: '¿Qué explica' },
            { text: '¿De qué manera influye', conector: 'en', var2: 'Variable que cambia (dependiente)', var2Ej: 'la permanencia estudiantil' },
        ],
        claves: ['factores', 'por qué', 'efecto', 'causa', 'determina', 'influ', 'explica', 'asociados'],
    },
    {
        id: 'Predictiva', desc: 'Anticipa resultados o identifica quién está en riesgo.',
        ejemplo: '¿Qué factores permiten predecir la mortalidad de terneros en su primer mes en pequeños productores de Montería?',
        empieza: '¿Qué factores permiten predecir…? ¿Quiénes tienen mayor riesgo de…?',
        inicios: [
            { text: '¿Qué factores permiten predecir' },
            { text: '¿Quiénes tienen mayor riesgo de' },
            { text: '¿Cuál es la probabilidad de' },
            { text: '¿Qué variables anticipan' },
            { text: '¿Cómo evolucionará' },
            { text: '¿Qué características predicen' },
            { text: '¿Qué indicadores permiten anticipar' },
            { text: '¿Cómo se comportará' },
        ],
        claves: ['predec', 'riesgo', 'probabilidad', 'anticip', 'pronóstic', 'evolucion', 'predicen', 'indicadores', 'comportará'],
    },
    {
        id: 'Evaluativa', desc: 'Valora la efectividad o el efecto de un programa, método o intervención.',
        ejemplo: '¿Qué tan efectivo es un programa de lectura en voz alta para mejorar la comprensión lectora de estudiantes de quinto grado de Lorica?',
        empieza: '¿Qué tan efectivo es…? ¿Cuál es el efecto de… en…?',
        inicios: [
            { text: '¿Qué tan efectivo es', conector: 'para', var2: 'Resultado que esperas', var2Ej: 'mejorar la comprensión lectora' },
            { text: '¿Cuál es el efecto de', conector: 'en', var2: 'Resultado que mides', var2Ej: 'la comprensión lectora' },
            { text: '¿Cuál es el impacto de', conector: 'en', var2: 'Resultado que mides', var2Ej: 'las ventas' },
            { text: '¿En qué medida contribuye', conector: 'a', var2: 'Resultado que esperas', var2Ej: 'reducir la deserción' },
            { text: '¿Qué resultados ha tenido' },
            { text: '¿Qué tan eficiente es', conector: 'para', var2: 'Resultado que esperas', var2Ej: 'reducir los tiempos de atención' },
            { text: '¿En qué medida se cumplen los objetivos de' },
            { text: '¿Qué beneficios ha generado' },
        ],
        claves: ['efectiv', 'efecto', 'impacto', 'eficacia', 'resultado', 'eficiencia', 'contribuye', 'eficien', 'cumplen', 'beneficios'],
    },
    {
        id: 'Normativa', desc: 'Propone cómo deberían ser las cosas o qué acciones tomar.',
        ejemplo: '¿Cómo debería diseñarse una estrategia de marketing digital para aumentar la interacción con clientes de emprendimientos turísticos del Golfo de Morrosquillo?',
        empieza: '¿Cómo debería…? ¿Qué estrategias deberían…? ¿Cómo puede optimizarse…?',
        inicios: [
            { text: '¿Cómo debería diseñarse', conector: 'para', var2: 'Para qué', var2Ej: 'reducir la inasistencia a citas' },
            { text: '¿Qué estrategias deberían implementarse para mejorar' },
            { text: '¿Cómo puede optimizarse', conector: 'para', var2: 'Para qué', var2Ej: 'aumentar las ventas' },
            { text: '¿Qué lineamientos deberían orientar' },
            { text: '¿Qué acciones permitirían mejorar' },
            { text: '¿Qué modelo debería adoptarse para mejorar' },
            { text: '¿Qué propuesta permitiría mejorar' },
            { text: '¿Cómo debería organizarse', conector: 'para', var2: 'Para qué', var2Ej: 'atender a más usuarios' },
        ],
        claves: ['debería', 'deben', 'estrategia', 'optimiz', 'diseñ', 'mejorar', 'propuesta', 'lineamientos', 'acciones', 'modelo', 'propuesta', 'organizarse', 'permitiría'],
    },
];

const tipoDe = (id) => TIPOS.find((item) => item.id === id) || null;
const objetivosDe = (tipoId) => ALCANCES.filter((item) => item.pregunta === tipoId).map((item) => item.label);

/* ---------- Armado de la pregunta ---------- */

const clean = (text) => String(text || '').trim().replace(/[\s.,;:¿?]+$/, '').replace(/^¿/, '');
const startsWithAny = (text, words) => new RegExp(`^(${words.join('|')})\\b`, 'i').test(text);
const countWords = (text) => String(text || '').trim().split(/\s+/).filter(Boolean).length;

const OTRA = '__otra__';
const PREGUNTA_FORM = { tipo: '', inicio: '', inicioLibre: '', objeto: '', var2: '', quien: '', donde: '', cuando: '' };

const questionParts = (form) => {
    const tipo = tipoDe(form.tipo);
    // «Otra forma»: el estudiante escribe cómo empieza; se le agrega el signo de apertura si falta.
    const libre = clean(form.inicioLibre);
    const inicio = form.inicio === OTRA
        ? (libre ? { text: `¿${libre}` } : null)
        : tipo?.inicios.find((item) => item.text === form.inicio) || tipo?.inicios[0];
    const objeto = clean(form.objeto);
    if (!inicio || !objeto) return [];
    const parts = [{ key: 'que', text: `${inicio.text} ${objeto}` }];
    const var2 = clean(form.var2);
    if (inicio.conector && var2) parts.push({ key: 'paraque', text: `${inicio.conector} ${var2}` });
    const quien = clean(form.quien);
    if (quien) parts.push({ key: 'quien', text: startsWithAny(quien, ['en', 'de']) ? quien : `en ${quien}` });
    const donde = clean(form.donde);
    if (donde) parts.push({ key: 'donde', text: startsWithAny(donde, ['de', 'del', 'en']) ? donde : `de ${donde}` });
    const cuando = clean(form.cuando);
    if (cuando) parts.push({ key: 'cuando', text: startsWithAny(cuando, ['durante', 'en', 'entre']) ? cuando : `durante ${cuando}` });
    parts[parts.length - 1] = { ...parts[parts.length - 1], text: `${parts[parts.length - 1].text}?` };
    return parts;
};

const buildQuestion = (form) => questionParts(form).map((part) => part.text).join(' ');

const PART_LABEL = { que: 'Qué quieres saber', paraque: 'Segunda variable', quien: 'En quiénes', donde: 'Dónde', cuando: 'Cuándo' };

// Revisión automática de una pregunta contra los criterios de la clase.
const SI_NO = /^¿\s*(es|son|hay|existe|existen|puede|pueden|debe|deben|tiene|tienen|funciona|sirve|se puede|será|fue|ha)\b/i;
const ABIERTA = /^¿\s*(cómo|cuál|cuáles|qué|en qué|por qué|quiénes|de qué|hasta qué|cuánto|cuánta|cuántos|cuántas|dónde|cuándo)\b/i;

const checkQuestion = (question, { tipo, quien, donde, objeto }) => {
    const text = String(question || '').trim();
    const lower = text.toLowerCase();
    const words = countWords(text);
    const mentions = (value) => {
        const key = clean(value).toLowerCase().split(/[\s,]+/).filter((word) => word.length > 3)[0];
        return key ? lower.includes(key) : false;
    };
    const t = tipoDe(tipo);
    const objetoClave = clean(objeto).toLowerCase().split(/[\s,]+/).filter((word) => word.length > 4);
    return [
        { id: 'signos', ok: /^¿/.test(text) && /\?$/.test(text), label: 'Abre y cierra con signos de interrogación', detail: 'En español la pregunta empieza con «¿» y termina con «?».' },
        { id: 'una', ok: (text.match(/\?/g) || []).length <= 1, label: 'Es una sola pregunta', detail: 'Si tienes varias, quédate con la principal; las demás pueden ser específicas.' },
        { id: 'abierta', ok: ABIERTA.test(text) && !SI_NO.test(text), label: 'No se responde con sí o no', detail: 'Empieza con Cómo, Cuál, Qué, En qué medida o Por qué.' },
        t && { id: 'tipo', ok: t.claves.some((clave) => lower.includes(clave)), label: `Corresponde a una pregunta ${t.id.toLowerCase()}`, detail: `Suele empezar así: ${t.empieza}` },
        { id: 'quien', ok: quien ? mentions(quien) : /\ben\s+\w+/i.test(text), label: 'Dice en quiénes', detail: quien ? `Tu población es «${clean(quien)}».` : 'Indica la población.' },
        { id: 'donde', ok: donde ? mentions(donde) : false, label: 'Dice dónde', detail: donde ? `Tu lugar es «${clean(donde)}».` : 'Indica el lugar o la institución.' },
        objetoClave.length > 0 && { id: 'titulo', ok: objetoClave.some((word) => lower.includes(word)), label: 'Pregunta por lo mismo que nombra tu título', detail: `Tu título estudia «${clean(objeto)}».` },
        { id: 'largo', ok: words >= 8 && words <= 40, label: 'Tiene una extensión adecuada', detail: `Tiene ${words} palabras; lo usual es entre 8 y 40.` },
    ].filter(Boolean);
};

/* ---------- Contenido de los ejercicios ---------- */

const FUNCION = [
    { id: 'titulo', label: 'Título', what: 'Nombra el estudio. Es una frase afirmativa.', example: 'Análisis de la relación entre la motivación laboral y la productividad en empleados de pymes de Montería' },
    { id: 'pregunta', label: 'Pregunta', what: 'Dice qué quieres saber. Todo el proyecto busca responderla.', example: '¿Qué relación existe entre la motivación laboral y la productividad de empleados de pymes de Montería?' },
    { id: 'objetivo', label: 'Objetivo general', what: 'Dice qué harás para responderla. Empieza con un verbo en infinitivo.', example: 'Analizar la relación entre la motivación laboral y la productividad de empleados de pymes de Montería.' },
];

const CAMINO = [
    { label: 'Título', text: 'Determinación de los factores del abandono del carrito de compras en clientes de tiendas virtuales de moda en Colombia', note: 'Nombra lo que vas a estudiar.' },
    { label: '¿Qué quiero saber?', text: 'Qué hace que los clientes dejen la compra a medias.', note: 'Dilo con tus palabras antes de formularla.' },
    { label: 'Tipo', text: 'Explicativa: busco las causas.', note: 'El verbo del título (Determinación) ya anticipa el tipo.' },
    { label: 'Pregunta', text: '¿Qué factores determinan el abandono del carrito de compras en clientes de tiendas virtuales de moda en Colombia?', note: 'Mismas variables, población y lugar que el título.' },
];

const INTERROGATIVAS_QUIZ = [
    { text: '¿Qué diferencias existen en el rendimiento entre estudiantes de jornada diurna y nocturna?', options: ['Descriptiva', 'Comparativa', 'Normativa'], answer: 1, why: '«Qué diferencias existen… entre» es la forma de una pregunta comparativa.' },
    { text: '¿Qué tan efectivo es un programa de tutorías para reducir la deserción?', options: ['Evaluativa', 'Exploratoria', 'Correlacional'], answer: 0, why: 'Valora si una intervención funciona.' },
    { text: '¿Cuáles son las características del consumo de agua en hogares rurales?', options: ['Predictiva', 'Descriptiva', 'Explicativa'], answer: 1, why: 'Busca describir cómo es algo.' },
    { text: '¿Qué factores permiten predecir el abandono de los estudios?', options: ['Predictiva', 'Normativa', 'Comparativa'], answer: 0, why: 'Busca anticipar un resultado.' },
];

const VARIABLES_QUIZ = [
    {
        text: 'En «¿Cuál es el efecto del ejercicio en la presión arterial de adultos mayores?», ¿cuál es la variable dependiente?',
        options: ['El ejercicio', 'La presión arterial', 'Los adultos mayores'],
        answer: 1,
        why: 'La presión arterial es lo que se mide como resultado; el ejercicio es la variable independiente.',
    },
    {
        text: 'En «¿Qué relación existe entre el uso de redes sociales y la ansiedad en adolescentes?», ¿cuántas variables hay?',
        options: ['Una', 'Dos', 'Tres'],
        answer: 1,
        why: 'El uso de redes sociales y la ansiedad. Los adolescentes son la población.',
    },
];

const DELIMITAR = [
    { id: 'poblacion', label: 'Población', what: 'A quiénes vas a preguntar u observar.', example: 'Vaga: «¿… en los jóvenes?». Precisa: «¿… en estudiantes de grado once de colegios públicos?».' },
    { id: 'lugar', label: 'Lugar', what: 'Dónde los encontrarás.', example: 'Vaga: «¿… en Colombia?». Precisa: «¿… de tres colegios públicos de Montería?».' },
    { id: 'tiempo', label: 'Tiempo', what: 'Úsalo si el periodo cambia la respuesta. Es opcional.', example: 'Vaga: «¿… actualmente?». Precisa: «¿… durante el primer semestre de 2026?».' },
];

const ERRORES = [
    { error: 'Es demasiado amplia', example: '«¿Cómo mejorar la educación?»', fix: 'Delimita población, lugar y qué aspecto de la educación estudias.' },
    { error: 'Se responde con sí o no', example: '«¿Funciona el sistema de turnos?»', fix: 'Cámbiala por «¿Qué tan efectivo es…?» o «¿Cuál es el efecto de…?».' },
    { error: 'La respuesta es obvia', example: '«¿Es importante la tecnología?»', fix: 'Pregunta por algo que no sepas y que valga la pena medir.' },
    { error: 'No tiene variables claras', example: '«¿Qué pasa con las ventas?»', fix: 'Nombra lo que vas a medir: «¿Qué relación existe entre la publicidad en redes y las ventas…?».' },
    { error: 'Pide una opinión o un juicio de valor', example: '«¿Es bueno usar apps móviles?»', fix: 'Pregunta por algo observable: uso, efecto, diferencias.' },
    { error: 'Pregunta por cómo construir la solución', example: '«¿Cómo hago una app de citas?»', fix: 'Eso es una tarea; pregunta por el problema o por el efecto de la solución.' },
    { error: 'Son varias preguntas en una', example: '«¿Cuáles son las causas y cómo se puede solucionar?»', fix: 'Deja una pregunta general; las demás pueden ser preguntas específicas.' },
    { error: 'No coincide con el título', example: 'Título de «Diseño…» con una pregunta sobre causas.', fix: 'El tipo de pregunta, las variables y la población deben ser los del título.' },
];

const JUZGA_QUIZ = [
    { text: '«¿Es importante la tecnología en la educación?»', options: ['Investigable', 'Mejorable'], answer: 1, why: 'Se responde con sí, la respuesta es obvia y no está delimitada.' },
    { text: '«¿Qué relación existe entre las horas de sueño y el rendimiento académico de estudiantes de primer semestre de una universidad de Sincelejo?»', options: ['Investigable', 'Mejorable'], answer: 0, why: 'Dos variables medibles, población y lugar.' },
    { text: '«¿Cómo podemos acabar con la pobreza?»', options: ['Investigable', 'Mejorable'], answer: 1, why: 'Demasiado amplia y sin variables ni población.' },
    { text: '«¿Qué factores determinan la inasistencia a citas médicas en pacientes de consulta externa de un hospital de Sincelejo?»', options: ['Investigable', 'Mejorable'], answer: 0, why: 'Pregunta explicativa delimitada y abierta.' },
    { text: '«¿Funciona la nueva plataforma del colegio?»', options: ['Investigable', 'Mejorable'], answer: 1, why: 'Se responde con sí o no y no dice qué se entiende por «funcionar».' },
];

const ANTES_DESPUES = [
    { antes: '¿Es bueno usar apps móviles?', despues: '¿De qué manera el uso de aplicaciones móviles influye en la productividad laboral de empleados de empresas de servicios de Montería?', porque: 'Dejó de ser sí o no, nombra dos variables y delimita población y lugar.' },
    { antes: '¿Cómo mejorar las ventas?', despues: '¿Qué relación existe entre la frecuencia de publicaciones en redes sociales y las ventas de micro y pequeñas empresas de comercio de Montería?', porque: 'De una pregunta amplia a una correlacional con dos variables medibles.' },
    { antes: '¿Funciona el programa de tutorías?', despues: '¿Qué tan efectivo es el programa de tutorías para reducir la deserción de estudiantes de primer semestre de una universidad pública de Córdoba?', porque: 'Pasó a evaluativa: dice qué resultado se valora y en quiénes.' },
];

const COHERENCIA_QUIZ = [
    {
        text: 'Título: «Comparación de la adopción de pagos digitales entre comerciantes jóvenes y mayores de plazas de mercado de Montería». ¿Qué pregunta es coherente?',
        options: [
            '¿Qué diferencias existen en la adopción de pagos digitales entre comerciantes jóvenes y mayores de plazas de mercado de Montería?',
            '¿Cómo debería diseñarse una app de pagos para comerciantes?',
            '¿Es bueno pagar con el celular?',
        ],
        answer: 0,
        why: 'Mismo tipo (comparar), mismas variables, población y lugar.',
    },
    {
        text: 'Título: «Diseño de una aplicación de recordatorios para reducir la inasistencia a citas en un hospital de Sincelejo». ¿Qué tipo de pregunta le corresponde?',
        options: ['Normativa', 'Correlacional', 'Exploratoria'],
        answer: 0,
        why: '«Diseño» propone una solución: la pregunta pregunta cómo debería ser.',
    },
];

const REPASO = [
    { text: '¿Qué diferencia a la pregunta del título?', options: ['La pregunta interroga; el título nombra el estudio', 'Son lo mismo', 'La pregunta es más corta'], answer: 0, why: 'El título es una frase afirmativa; la pregunta dice qué quieres saber.' },
    { text: '¿Cuál de estas empieza bien una pregunta investigable?', options: ['¿Es…', '¿Qué relación existe entre…', '¿Hay…'], answer: 1, why: 'Las otras dos invitan a responder sí o no.' },
    { text: 'Si tu título empieza con «Evaluación de…», tu pregunta debería ser…', options: ['Evaluativa', 'Exploratoria', 'Descriptiva'], answer: 0, why: 'El tipo de pregunta sigue el objetivo del título.' },
];

/* ---------- Componentes interactivos ---------- */

const Camino = () => {
    const [step, setStep] = useState(0);
    const isLast = step === CAMINO.length - 1;
    return (
        <div className="ide-panel">
            <h3>Ejemplo: del título a la pregunta</h3>
            <ol className="tit-steps">
                {CAMINO.slice(0, step + 1).map((item, index) => (
                    <li key={item.label} data-current={index === step}>
                        <span>{item.label}</span>
                        <p>{item.text}</p>
                        {index === step && <small>{item.note}</small>}
                    </li>
                ))}
            </ol>
            <div className="ide-row">
                <span>Paso {step + 1} de {CAMINO.length}</span>
                <button type="button" className={`ide-btn ${isLast ? 'ide-btn--ghost' : 'ide-btn--primary'}`} onClick={() => setStep(isLast ? 0 : step + 1)}>
                    {isLast ? 'Empezar de nuevo' : <>Siguiente paso <ArrowRight size={15} /></>}
                </button>
            </div>
        </div>
    );
};

const TiposExplorer = ({ initial }) => {
    const [active, setActive] = useState(initial || 'Descriptiva');
    const current = tipoDe(active) || TIPOS[1];
    const objetivos = objetivosDe(current.id);
    return (
        <div className="ide-panel">
            <h3>Toca cada tipo</h3>
            <div className="ide-tabs" role="group" aria-label="Tipos de pregunta">
                {TIPOS.map((item) => (
                    <button key={item.id} type="button" className="ide-chip" aria-pressed={active === item.id} onClick={() => setActive(item.id)}>
                        {item.id}
                    </button>
                ))}
            </div>
            <div className="ide-tabpanel">
                <p>{current.desc}</p>
                <p><strong>Suele empezar:</strong> {current.empieza}</p>
                <p className="tit-example-q">{current.ejemplo}</p>
                {objetivos.length > 0 && <p className="ide-hint">Corresponde al objetivo de la Ideación: {objetivos.join(' o ')}.</p>}
            </div>
        </div>
    );
};

const AntesDespues = () => {
    const [open, setOpen] = useState({});
    return (
        <div className="ide-panel">
            <h3>Mira cómo se fortalece cada pregunta</h3>
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
                                Primero intenta mejorarla tú; luego mira la versión fuerte
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

/* ---------- Constructor y revisión ---------- */

const usePreguntaState = () => {
    const [form, setForm] = useProjectField('preguntaForm', PREGUNTA_FORM);
    const [pregunta, setPregunta] = useProjectField('pregunta', '');
    const [preguntaTipo, setPreguntaTipo] = useProjectField('preguntaTipo', '');
    const [tituloForm] = useProjectField('tituloForm', null);
    const [titulo] = useProjectField('titulo', '');
    const [idea] = useProjectField('idea', null);
    const f = { ...PREGUNTA_FORM, ...(form || {}) };
    const update = (patch) => setForm((prev) => ({ ...PREGUNTA_FORM, ...(prev || {}), ...patch }));
    return {
        f, update, pregunta, setPregunta, preguntaTipo, setPreguntaTipo,
        tituloForm: tituloForm || {}, titulo, idea: idea || {},
    };
};

// Tipo sugerido: el que se eligió antes o el que corresponde al objetivo de la Ideación.
const tipoSugerido = (preguntaTipo, idea) => tipoDe(preguntaTipo)?.id || ALCANCES.find((item) => item.id === idea.alcance)?.pregunta || 'Descriptiva';

const Constructor = ({ intro }) => {
    const { f, update, setPregunta, preguntaTipo, setPreguntaTipo, tituloForm, titulo, idea } = usePreguntaState();
    const [saved, setSaved] = useState(false);
    const prefilled = useRef(false);

    // La primera vez trae del título y la Ideación el tipo, el objeto, la población, el lugar y el periodo.
    useEffect(() => {
        if (prefilled.current) return;
        prefilled.current = true;
        const patch = {};
        if (!f.tipo) patch.tipo = tipoSugerido(preguntaTipo, idea);
        if (!clean(f.objeto) && clean(tituloForm.objeto)) patch.objeto = clean(tituloForm.objeto).replace(/^(de|del)\s+/i, (m) => (m.toLowerCase().startsWith('del') ? 'el ' : ''));
        if (!clean(f.quien) && clean(tituloForm.quien || idea.quien)) patch.quien = clean(tituloForm.quien || idea.quien);
        if (!clean(f.donde) && clean(tituloForm.donde || idea.donde)) patch.donde = clean(tituloForm.donde || idea.donde);
        if (!clean(f.cuando) && clean(tituloForm.cuando || idea.cuando)) patch.cuando = clean(tituloForm.cuando || idea.cuando).replace(/^durante\s+/i, '');
        if (Object.keys(patch).length > 0) update(patch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const tipo = tipoDe(f.tipo) || TIPOS[1];
    const isOtra = f.inicio === OTRA;
    const inicio = isOtra ? { text: OTRA } : tipo.inicios.find((item) => item.text === f.inicio) || tipo.inicios[0];
    const parts = questionParts({ ...f, tipo: tipo.id, inicio: inicio.text });
    const built = parts.map((part) => part.text).join(' ');
    // Guardado automático cuando la pregunta ya tiene forma (6 palabras o más).
    useAutoGuardar(built && built.trim().split(/\s+/).length >= 6 ? `${built}|${tipo.id}` : '', () => { setPregunta(built); setPreguntaTipo(tipo.id); setSaved(true); });
    const field = (key) => (event) => { setSaved(false); update({ [key]: event.target.value }); };
    const sugerido = tipoSugerido(preguntaTipo, idea);
    // Ejemplos con los datos del propio proyecto (Tab los escribe en el campo vacío).
    const ej = (value, fallback) => `Ej: ${clean(value) || fallback}`;
    const ejObjeto = clean(tituloForm.objeto).replace(/^(de|del)\s+/i, '') || conArticulo(idea.problema) || 'la inasistencia a las citas médicas';
    const ejVar2 = segundaVariable(inicio.conector, idea) || inicio.var2Ej;

    return (
        <>
            <div className="ide-synth-left">
                {intro}
                {clean(titulo) && (
                    <div className="tit-from-idea">
                        <span>Tu título</span>
                        <p>{titulo}</p>
                    </div>
                )}
                <p className="ide-synth-label">Tu pregunta, parte por parte</p>
                <p className="tit-anatomy tit-live" aria-live="polite">
                    {parts.length > 0
                        ? parts.map((part, index) => (
                            <React.Fragment key={`${part.key}-${index}`}>
                                {index > 0 && ' '}
                                <mark data-part={part.key} data-active="true">{part.text}</mark>
                            </React.Fragment>
                        ))
                        : <span className="tit-empty">Completa el formulario y verás aquí tu pregunta.</span>}
                </p>
                <ul className="tit-legend" aria-hidden="true">
                    {Object.entries(PART_LABEL).map(([key, label]) => <li key={key}><mark data-part={key} data-active="true">{label}</mark></li>)}
                </ul>
            </div>

            <form
                className="ide-panel ide-form"
                onSubmit={(event) => {
                    event.preventDefault();
                    if (!built) return;
                    setPregunta(built);
                    setPreguntaTipo(tipo.id);
                    setSaved(true);
                }}
                noValidate
            >
                <div className="ide-form-pair">
                    <div className="input-group">
                        <label htmlFor="pre-tipo">Tipo de pregunta</label>
                        <select id="pre-tipo" className="input-field" value={tipo.id} onChange={(event) => { setSaved(false); update({ tipo: event.target.value, inicio: '', var2: '' }); }}>
                            {TIPOS.map((item) => <option key={item.id} value={item.id}>{item.id}{item.id === sugerido ? ' (sugerida)' : ''}</option>)}
                        </select>
                    </div>
                    <div className="input-group">
                        <label htmlFor="pre-inicio">Cómo empieza</label>
                        <select id="pre-inicio" className="input-field" value={inicio.text} onChange={(event) => { setSaved(false); update({ inicio: event.target.value, var2: '' }); }}>
                            {tipo.inicios.map((item) => <option key={item.text} value={item.text}>{item.text}…</option>)}
                            <option value={OTRA}>Otra forma (escríbela tú)</option>
                        </select>
                    </div>
                </div>
                {isOtra && (
                    <div className="input-group">
                        <label htmlFor="pre-inicio-libre">Tu forma de empezar</label>
                        <input
                            id="pre-inicio-libre"
                            className="input-field"
                            value={f.inicioLibre}
                            onChange={field('inicioLibre')}
                            placeholder={`Ej: ${tipo.inicios[0].text.replace(/^¿/, '')}`}
                            aria-describedby="pre-inicio-libre-ayuda"
                        />
                        <small className="ide-field-hint" id="pre-inicio-libre-ayuda">Usa una palabra abierta: Cómo, Cuál, Qué, En qué medida o Por qué. Evita Es, Hay o Existe, que se responden con sí o no.</small>
                    </div>
                )}
                <small className="ide-field-hint">{tipo.desc} {sugerido === tipo.id && (idea.alcance || preguntaTipo) ? 'Es la que corresponde a tu objetivo y tu título.' : ''}</small>

                <div className="input-group">
                    <label htmlFor="pre-objeto">¿Qué quieres saber? Variable u objeto de estudio</label>
                    <input id="pre-objeto" className="input-field" value={f.objeto} onChange={field('objeto')} placeholder={`Ej: ${ejObjeto}`} aria-describedby="pre-objeto-ayuda" />
                    <small className="ide-field-hint" id="pre-objeto-ayuda">Lo mismo que estudia tu título. Ya viene de tu título si lo construiste.</small>
                </div>

                {inicio.conector && (
                    <div className="input-group">
                        <label htmlFor="pre-var2">{inicio.var2}</label>
                        <input id="pre-var2" className="input-field" value={f.var2} onChange={field('var2')} placeholder={`Ej: ${ejVar2}`} />
                    </div>
                )}

                <div className="ide-form-trio">
                    <div className="input-group">
                        <label htmlFor="pre-quien">¿En quiénes?</label>
                        <input id="pre-quien" className="input-field" value={f.quien} onChange={field('quien')} placeholder={ej(tituloForm.quien || idea.quien, 'estudiantes de primer semestre')} />
                    </div>
                    <div className="input-group">
                        <label htmlFor="pre-donde">¿Dónde?</label>
                        <input id="pre-donde" className="input-field" value={f.donde} onChange={field('donde')} placeholder={ej(tituloForm.donde || idea.donde, 'Montería, Córdoba')} />
                    </div>
                    <div className="input-group">
                        <label htmlFor="pre-cuando">¿Cuándo? <span className="ide-optional">(opcional)</span></label>
                        <input id="pre-cuando" className="input-field" value={f.cuando} onChange={field('cuando')} placeholder={ej(tituloForm.cuando || idea.cuando, 'el año 2026')} />
                    </div>
                </div>

                <button type="submit" className="ide-btn ide-btn--primary" disabled={!built} style={{ justifyContent: 'center', padding: '0.8rem 1rem' }}>
                    <CheckCircle2 size={17} /> Guardar como mi pregunta
                </button>
                {saved && <p className="ide-feedback ide-feedback--ok" role="status"><CheckCircle2 size={16} /><span>Guardada. El planteamiento, los objetivos y las demás herramientas ya la usan.</span></p>}
            </form>
        </>
    );
};

const CRITERIOS = [
    { label: 'Clara', text: 'La entiende alguien que no es de tu área.' },
    { label: 'Delimitada', text: 'Dice en quiénes, dónde y, si importa, cuándo.' },
    { label: 'Investigable', text: 'No se responde con sí o no ni tiene una respuesta obvia.' },
    { label: 'Coherente', text: 'Tiene el tipo, las variables y la población de tu título.' },
    { label: 'Viable', text: 'Puedes responderla con tu tiempo, tus datos y tus recursos.' },
];

const Revision = ({ intro }) => {
    const { f, pregunta, preguntaTipo, tituloForm, idea } = usePreguntaState();
    const own = clean(pregunta) ? pregunta.trim() : buildQuestion(f);
    const [text, setText] = useState(own);
    const target = text.trim();
    const isOwn = target === own;
    const checks = checkQuestion(target, {
        tipo: isOwn ? (preguntaTipo || f.tipo) : '',
        quien: isOwn ? (f.quien || tituloForm.quien || idea.quien) : '',
        donde: isOwn ? (f.donde || tituloForm.donde || idea.donde) : '',
        objeto: isOwn ? (tituloForm.objeto || f.objeto) : '',
    });
    const passed = checks.filter((item) => item.ok).length;
    return (
        <>
            <div className="ide-synth-left">
                {intro}
                <ul className="tit-criteria">
                    {CRITERIOS.map((item) => <li key={item.label}><b>{item.label}</b> {item.text}</li>)}
                </ul>
                <label htmlFor="pre-revisar" className="ide-synth-label">Pregunta a revisar</label>
                <textarea
                    id="pre-revisar"
                    className="textarea-field tit-review-input"
                    rows={3}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder="Pega una pregunta (tuya o de un artículo) o formúlala en «Formula tu pregunta»"
                />
                {!isOwn && own && <button type="button" className="ide-link" onClick={() => setText(own)}>Volver a mi pregunta</button>}
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
                    {isOwn ? 'Revisa la forma de tu pregunta guardada.' : 'Revisando una pregunta distinta a la tuya: se omiten los criterios de tu tipo, población, lugar y título.'} La viabilidad y el contenido los valida tu docente.
                </p>
            </div>
        </>
    );
};

/* ---------- Clase ---------- */

const PreguntaInvestigacion = ({ onNavigate }) => {
    const [titulo] = useProjectField('titulo', '');
    const [pregunta] = useProjectField('pregunta', '');
    const [preguntaTipo] = useProjectField('preguntaTipo', '');
    const [idea] = useProjectField('idea', null);
    const sugerido = tipoSugerido(preguntaTipo, idea || {});

    const renderSlide = ({ slide, heading, goToSection, sectionMinutes, totalMinutes }) => ({
        portada: (
            <>
                <div>
                    {heading}
                    <p>La pregunta de investigación dice qué quieres saber. Todo lo demás (objetivos, método, datos) existe para responderla.</p>
                    <p><strong>Al terminar esta clase podrás:</strong></p>
                    <ul className="ide-bullets">
                        <li>Distinguir el título, la pregunta y el objetivo.</li>
                        <li>Reconocer los ocho tipos de pregunta y elegir el tuyo.</li>
                        <li>Evitar preguntas amplias, obvias o de sí o no.</li>
                        <li>Formular una pregunta coherente con tu título.</li>
                        <li>Revisarla con criterios de calidad.</li>
                    </ul>
                    {clean(titulo) && (
                        <div className="tit-from-idea">
                            <span>Partirás de tu título</span>
                            <p>{titulo}</p>
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
        funcion: (
            <>
                <div>
                    {heading}
                    <p>Los tres hablan del mismo estudio, pero cumplen funciones distintas y se escriben distinto.</p>
                    <ul className="ide-list">
                        <li><Compass size={18} /><span><b>El título nombra</b>Frase afirmativa con verbo sustantivado.</span></li>
                        <li><HelpCircle size={18} /><span><b>La pregunta interroga</b>Dice qué quieres saber, entre signos de interrogación.</span></li>
                        <li><Target size={18} /><span><b>El objetivo responde</b>Dice qué harás, con un verbo en infinitivo.</span></li>
                    </ul>
                </div>
                <Pestanas title="El mismo estudio en tres formas" name="funcion" items={FUNCION} />
            </>
        ),
        camino: (
            <>
                <div>
                    {heading}
                    <p>Tu título ya tiene casi todo: las variables, la población y el lugar. Para pasar a la pregunta, dilo primero con tus palabras y luego elige el tipo.</p>
                    <p className="ide-hint">El verbo del título anticipa el tipo: «Comparación» lleva a una pregunta comparativa; «Diseño», a una normativa.</p>
                </div>
                <Camino />
            </>
        ),
        tipos: (
            <>
                <div>
                    {heading}
                    <p>El tipo de pregunta depende de lo que quieres lograr. Son los mismos objetivos que elegiste en la Ideación.</p>
                    <ul className="ide-list">
                        <li><ListChecks size={18} /><span><b>Conocer o describir</b>Exploratoria, descriptiva.</span></li>
                        <li><Users size={18} /><span><b>Comparar o relacionar</b>Comparativa, correlacional.</span></li>
                        <li><Target size={18} /><span><b>Explicar, predecir o evaluar</b>Explicativa, predictiva, evaluativa.</span></li>
                        <li><Compass size={18} /><span><b>Proponer o mejorar</b>Normativa.</span></li>
                    </ul>
                </div>
                <TiposExplorer initial={sugerido} />
            </>
        ),
        interrogativas: (
            <>
                <div>
                    {heading}
                    <p>Las primeras palabras deciden si la pregunta es investigable.</p>
                    <ul className="ide-list">
                        <li><CheckCircle2 size={18} /><span><b>Abren la investigación</b>¿Cómo…? ¿Cuál…? ¿Qué relación…? ¿En qué medida…? ¿Por qué…? ¿Qué tan efectivo…?</span></li>
                        <li><XCircle size={18} /><span><b>La cierran</b>¿Es…? ¿Hay…? ¿Existe…? ¿Puede…? Se responden con sí o no.</span></li>
                    </ul>
                </div>
                <Opciones title="¿Qué tipo de pregunta es?" questions={INTERROGATIVAS_QUIZ} />
            </>
        ),
        variables: (
            <>
                <div>
                    {heading}
                    <p>La pregunta nombra las mismas variables que el título. En las preguntas de efecto o relación, la <strong>independiente</strong> es el factor y la <strong>dependiente</strong> es lo que se mide como resultado.</p>
                    <p className="ide-hint">Las preguntas descriptivas y exploratorias pueden tener una sola variable.</p>
                </div>
                <Opciones title="Identifica las variables" questions={VARIABLES_QUIZ} />
            </>
        ),
        delimitar: (
            <>
                <div>
                    {heading}
                    <p>Una pregunta delimitada te dice a quién preguntar y dónde. Si no puedes imaginar a quién entrevistar u observar, todavía es demasiado amplia.</p>
                </div>
                <Pestanas title="Vaga o precisa" name="delimitar" items={DELIMITAR} />
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
                    <p>Lee cada pregunta y decide si se puede investigar tal como está. Después lee la explicación.</p>
                    <p className="ide-hint">Para discutir en parejas: ¿cómo mejorarían las que marcaron como mejorables?</p>
                </div>
                <Opciones title="Juzga cada pregunta" questions={JUZGA_QUIZ} />
            </>
        ),
        reescribe: (
            <>
                <div>
                    {heading}
                    <p>Una pregunta débil casi siempre se arregla con tres movimientos: abrirla, nombrar las variables y delimitarla.</p>
                </div>
                <AntesDespues />
            </>
        ),
        coherencia: (
            <>
                <div>
                    {heading}
                    <p>El título y la pregunta deben hablar del mismo estudio: mismo tipo, mismas variables, misma población y mismo lugar.</p>
                    <p className="ide-hint">Si al formular la pregunta descubres algo distinto, ajusta también el título.</p>
                </div>
                <Opciones title="¿Coinciden?" questions={COHERENCIA_QUIZ} />
            </>
        ),
        construye: (
            <Constructor
                intro={(
                    <>
                        {heading}
                        <p>Elige el tipo, la forma de empezar y completa las partes. Lo que definiste en el título y la Ideación ya está cargado.</p>
                    </>
                )}
            />
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
                        <li>El título nombra, la pregunta interroga y el objetivo responde.</li>
                        <li>El tipo de pregunta sigue lo que quieres lograr.</li>
                        <li>Una buena pregunta es abierta, delimitada y coherente con el título.</li>
                    </ul>
                </div>
                <div className="ide-panel">
                    <h3>Siguiente paso</h3>
                    {clean(pregunta) ? (
                        <div className="tit-saved"><span>Tu pregunta guardada</span><p>{pregunta}</p></div>
                    ) : <p>La formularás en la siguiente sección, con todo lo que acabas de repasar.</p>}
                    <p>Antes de seguir, revísala en la última diapositiva. Luego plantea el problema que la origina.</p>
                </div>
            </>
        ),
        revision: (
            <Revision
                intro={(
                    <>
                        {heading}
                        <p>Último paso: revisa tu pregunta final antes de llevarla a tu asesor. También puedes pegar la pregunta de un artículo para analizarla.</p>
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
            label="Pregunta de investigación"
            renderSlide={renderSlide}
            finish={onNavigate ? { label: 'Plantear el problema', onClick: () => onNavigate('planteamiento') } : null}
        />
    );
};

export default PreguntaInvestigacion;
