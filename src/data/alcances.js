import verbsData from './verbs.json';

/*
 * Lo que el estudiante quiere lograr con su estudio. Cada objetivo agrupa los verbos
 * sustantivados que usa el título (verbs.json) y fija el tipo de pregunta y de investigación.
 * Lo comparten la Ideación y la Construcción del Título.
 */
export const ALCANCES = [
    { id: 'explorar', questionForm: '¿Cuáles son…? o ¿Cómo perciben…? sobre algo poco estudiado', method: 'revisión documental, entrevistas o grupos focales para conocer el tema', label: 'Explorar', hint: 'Conocer un tema poco estudiado', pregunta: 'Exploratoria', tipo: 'Exploratoria',
        verbs: ['Identificación', 'Exploración', 'Compilación', 'Interpretación'] },
    { id: 'describir', questionForm: '¿Cuáles son las características de…? o ¿Cómo es…?', method: 'encuestas, observación o registros con análisis descriptivo', label: 'Describir', hint: 'Cómo es o cómo ocurre algo', pregunta: 'Descriptiva', tipo: 'Descriptiva',
        verbs: ['Descripción', 'Caracterización', 'Diagnóstico', 'Definición', 'Categorización', 'Monitoreo'] },
    { id: 'comparar', questionForm: '¿Qué diferencias existen en… entre… y…?', method: 'comparación entre dos o más grupos, lugares o momentos', label: 'Comparar', hint: 'Diferencias entre grupos, lugares o momentos', pregunta: 'Comparativa', tipo: 'Descriptiva',
        verbs: ['Comparación'] },
    { id: 'relacionar', questionForm: '¿Qué relación existe entre… y…?', method: 'medición de dos o más variables y análisis de correlación o asociación', label: 'Relacionar', hint: 'Si dos aspectos se asocian', pregunta: 'Correlacional', tipo: '',
        verbs: ['Relación', 'Análisis'] },
    { id: 'explicar', questionForm: '¿Qué factores determinan…? o ¿Por qué…?', method: 'análisis de las causas o factores que producen el problema', label: 'Explicar', hint: 'Por qué ocurre o qué lo causa', pregunta: 'Explicativa', tipo: 'Explicativa',
        verbs: ['Explicación', 'Determinación', 'Demostración'] },
    { id: 'predecir', questionForm: '¿Qué factores permiten predecir…? o ¿Quiénes tienen mayor riesgo de…?', method: 'datos históricos y un modelo que anticipe el resultado', label: 'Predecir', hint: 'Qué pasará o quién está en riesgo', pregunta: 'Predictiva', tipo: 'Explicativa',
        verbs: ['Cálculo', 'Generación'] },
    { id: 'evaluar', questionForm: '¿Cuál es el efecto de… en…? o ¿Qué tan efectivo es…?', method: 'medición antes y después, o comparación con un grupo que no recibe la intervención', label: 'Evaluar', hint: 'Si algo funciona o da resultado', pregunta: 'Evaluativa', tipo: '',
        verbs: ['Evaluación', 'Validación', 'Verificación', 'Comprobación'] },
    { id: 'proponer', questionForm: '¿Cómo debería diseñarse… para…?', method: 'diagnóstico del problema y diseño de una propuesta validada con expertos o usuarios', label: 'Proponer', hint: 'Diseñar una solución o modelo', pregunta: 'Propositiva', tipo: '',
        verbs: ['Diseño', 'Propuesta', 'Formulación', 'Planificación', 'Programación', 'Construcción', 'Desarrollo'] },
    { id: 'mejorar', questionForm: '¿Cómo puede optimizarse… para…?', method: 'diagnóstico del proceso actual, implementación de mejoras y medición de resultados', label: 'Mejorar', hint: 'Aplicar u optimizar un proceso', pregunta: 'Propositiva', tipo: '',
        verbs: ['Implementación', 'Optimización', 'Sistematización', 'Estandarización', 'Organización', 'Producción', 'Establecimiento', 'Moderación'] },
];

export const ALL_VERBS = ALCANCES.flatMap((item) => item.verbs);

export const VERBS = Object.fromEntries(verbsData.map((verb) => [verb.label, verb]));

export const findVerb = (value) => verbsData.find((verb) => verb.label.toLowerCase() === String(value || '').trim().toLowerCase())?.label || '';

// Verbo con el que empieza un título, si es uno de los permitidos.
export const verbAtStart = (title, allowed = ALL_VERBS) => {
    const text = String(title || '').trim().toLowerCase();
    return allowed.find((label) => text.startsWith(label.toLowerCase())) || '';
};

export const alcanceOfVerb = (label) => ALCANCES.find((item) => item.verbs.includes(label)) || null;
