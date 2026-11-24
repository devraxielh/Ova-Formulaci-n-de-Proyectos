import { construccionPrimero } from '../components/deck/orden.js';
/*
 * Clase «Resumen» (1 hora).
 * Las diapositivas 'portada', 'construye' y 'revision' se pintan aparte en el componente.
 */

export const MIN_PALABRAS = 150;
export const MAX_PALABRAS = 250;

export const SECTIONS = construccionPrimero([
    { id: 'apertura', label: 'Apertura' },
    { id: 'estructura', label: 'Estructura' },
    { id: 'clave', label: 'Palabras clave' },
    { id: 'calidad', label: 'Calidad' },
    { id: 'cierre', label: 'Cierre' },
    { id: 'construccion', label: 'Construcción' },
    { id: 'revision', label: 'Revisión' },
]);

const q = (text, options, answer, why) => ({ text, options, answer, why });

export const EJEMPLO_RESUMEN = 'La inasistencia a citas médicas reduce la oportunidad de la atención y genera pérdidas para los servicios de salud. Esta investigación tuvo como objetivo analizar los factores asociados a la inasistencia a citas médicas en los pacientes de consulta externa de un hospital de Sincelejo, Sucre. Se desarrolló un estudio cuantitativo, correlacional y de diseño no experimental transversal, con una muestra aleatoria de 278 pacientes, a quienes se aplicó un cuestionario validado por juicio de expertos (α = 0,81). Los resultados mostraron que el 22 % de las citas programadas se perdió; el olvido de la cita fue la causa más frecuente (41 %), seguido del costo del transporte (22 %), y se encontró una relación positiva moderada entre el olvido y la inasistencia (rho = 0,41; p < 0,001). La inasistencia fue mayor en los pacientes menores de 30 años y en los residentes de la zona rural. Se concluye que la inasistencia en esta población está asociada principalmente a factores organizacionales y económicos, más que a la voluntad del paciente, por lo que estrategias como los recordatorios automáticos y la flexibilización de horarios podrían reducirla.';

export const SLIDES = construccionPrimero([
    /* ---------- Apertura (9) ---------- */
    { id: 'portada', section: 'apertura', min: 3, title: 'El resumen: tu investigación en un párrafo' },
    {
        id: 'quees', section: 'apertura', min: 3, title: 'Qué es el resumen',
        lead: [`El resumen permite identificar la esencia del escrito: menciona brevemente el objetivo y la metodología, así como los resultados y las conclusiones, en un mínimo de ${MIN_PALABRAS} y un máximo de ${MAX_PALABRAS} palabras.`],
        bullets: ['Es lo primero que se lee y, muchas veces, lo único.', 'Debe entenderse solo, sin leer el resto del documento.', 'Va acompañado de las palabras clave.'],
        panel: {
            type: 'table', title: 'No confundir', head: ['Sección', 'Qué hace'], rows: [
                ['**Resumen**', '**Sintetiza todo el estudio: objetivo, método, resultados y conclusiones.**'],
                ['Introducción', 'Presenta el problema y anuncia el estudio; no da resultados.'],
                ['Conclusiones', 'Responde los objetivos con más detalle.'],
            ],
        },
    },
    {
        id: 'donde', section: 'apertura', min: 3, title: 'Dónde va y cuándo se escribe',
        lead: ['Va al comienzo del documento, después del título y antes de la introducción. Pero se escribe al final, cuando ya tienes resultados y conclusiones.'],
        panel: {
            type: 'chain', title: 'Orden en el documento', items: [
                { label: 'Título', text: 'Lo que se estudió.' },
                { label: 'Resumen y palabras clave', text: 'Todo el estudio en un párrafo.' },
                { label: 'Introducción', text: 'El problema y el propósito.' },
                { label: '…', text: 'El resto del documento.' },
            ],
        },
        quiz: [q('¿Cuándo se escribe el resumen?', ['Antes de empezar la investigación', 'Al final, con resultados y conclusiones', 'Después de la introducción'], 1, 'Necesita los resultados y las conclusiones.')],
    },

    /* ---------- Estructura (18) ---------- */
    {
        id: 'partes', section: 'estructura', min: 5, title: 'Las cuatro partes del resumen',
        lead: ['Un buen resumen responde cuatro preguntas, en este orden. Puede empezar con una oración breve de contexto.'],
        panel: {
            type: 'tabs', title: 'Partes, con ejemplo', items: [
                { id: 'obj', label: '1. Objetivo', what: '¿Qué se buscó? Usa el objetivo general.', example: 'Esta investigación tuvo como objetivo analizar los factores asociados a la inasistencia a citas médicas…' },
                { id: 'met', label: '2. Metodología', what: '¿Cómo se hizo? Enfoque, tipo, diseño, población o muestra e instrumento.', example: 'Se desarrolló un estudio cuantitativo, correlacional y no experimental, con una muestra de 278 pacientes…' },
                { id: 'res', label: '3. Resultados', what: '¿Qué se encontró? Los hallazgos principales, con cifras.', example: 'El olvido fue la causa más frecuente (41 %) y se relacionó con la inasistencia (rho = 0,41).' },
                { id: 'con', label: '4. Conclusiones', what: '¿Qué significa? La respuesta a la pregunta y su implicación.', example: 'Se concluye que la inasistencia está asociada a factores organizacionales y económicos…' },
            ],
        },
    },
    {
        id: 'forma', section: 'estructura', min: 4, title: 'Extensión y forma',
        lead: ['El resumen sigue reglas de forma muy concretas.'],
        bullets: [
            `Entre ${MIN_PALABRAS} y ${MAX_PALABRAS} palabras.`,
            'Un solo párrafo, sin sangría.',
            'En pasado para lo que se hizo y se encontró; en presente para las conclusiones.',
            'Sin citas, tablas, figuras ni referencias.',
            'Sin abreviaturas sin definir.',
            'En tercera persona o impersonal.',
        ],
        panel: {
            type: 'table', title: 'Cuánto espacio a cada parte', head: ['Parte', 'Proporción aproximada', 'En 200 palabras'], rows: [
                ['Contexto y objetivo', '20 %', '40 palabras'],
                ['Metodología', '25 %', '50 palabras'],
                ['Resultados', '35 %', '70 palabras'],
                ['Conclusiones', '20 %', '40 palabras'],
            ],
        },
    },
    {
        id: 'ejemplo', section: 'estructura', min: 5, title: 'Un resumen completo',
        lead: ['Lee el ejemplo e identifica las cuatro partes. Los datos son ilustrativos.'],
        panel: { type: 'example', title: 'Resumen (ejemplo, 187 palabras)', paragraphs: [EJEMPLO_RESUMEN, '**Palabras clave:** inasistencia, citas médicas, consulta externa, barreras de acceso, servicios de salud.'] },
    },
    {
        id: 'verbos', section: 'estructura', min: 4, title: 'Frases para cada parte',
        lead: ['Estas frases te ayudan a empezar cada parte.'],
        panel: {
            type: 'table', title: 'Inicios útiles', head: ['Parte', 'Frases'], rows: [
                ['Objetivo', 'Esta investigación tuvo como objetivo… · El propósito del estudio fue…'],
                ['Metodología', 'Se desarrolló un estudio… · Participaron… · Se aplicó…'],
                ['Resultados', 'Los resultados mostraron que… · Se encontró… · El … fue el más frecuente…'],
                ['Conclusiones', 'Se concluye que… · Los hallazgos sugieren que… · Esto permite…'],
            ],
        },
    },

    /* ---------- Palabras clave (9) ---------- */
    {
        id: 'clave-que', section: 'clave', min: 3, title: 'Palabras clave',
        lead: ['Las palabras clave son los términos con los que otros encontrarán tu trabajo en bases de datos y buscadores. Van debajo del resumen.'],
        bullets: ['Entre tres y seis términos.', 'Separados por comas, en minúscula (salvo nombres propios).', 'Pueden ser frases cortas: «citas médicas», «consulta externa».'],
        panel: { type: 'example', title: 'Así se escriben', paragraphs: ['**Palabras clave:** artículo científico, artículo de revisión, investigación, estilos de citación.'] },
    },
    {
        id: 'clave-elegir', section: 'clave', min: 3, title: 'Cómo elegirlas',
        lead: ['Elige los términos que alguien escribiría para buscar un estudio como el tuyo.'],
        panel: {
            type: 'chain', title: 'De dónde salen', items: [
                { label: 'Tu variable principal', text: 'inasistencia' },
                { label: 'Las variables que la explican', text: 'barreras de acceso, recordatorios' },
                { label: 'Tu población o contexto', text: 'consulta externa, servicios de salud' },
                { label: 'Un tesauro', text: 'DeCS (salud), Tesauro de la UNESCO o ERIC (educación): términos normalizados que usan las bases de datos.' },
            ],
        },
    },
    {
        id: 'clave-quiz', section: 'clave', min: 3, title: '¿Son buenas palabras clave?',
        lead: ['Decide en cada caso.'],
        quiz: [
            q('«Palabras clave: estudio, investigación, Colombia, análisis.»', ['Buenas', 'Hay que mejorarlas'], 1, 'Son demasiado generales: no ayudan a encontrar tu tema.'),
            q('«Palabras clave: inasistencia, citas médicas, consulta externa, barreras de acceso.»', ['Buenas', 'Hay que mejorarlas'], 0, 'Son específicas y describen el tema, la población y las variables.'),
        ],
    },

    /* ---------- Calidad (9) ---------- */
    {
        id: 'errores', section: 'calidad', min: 4, title: 'Siete errores frecuentes',
        lead: ['Revisa si tu resumen cae en alguno.'],
        panel: {
            type: 'accordion', title: 'Abre cada error para ver cómo corregirlo', items: [
                { error: 'Copiar la introducción', example: 'Un resumen que solo habla del problema.', fix: 'Incluye método, resultados y conclusiones.' },
                { error: 'Faltan los resultados', example: '«Se presentarán los resultados…».', fix: 'Di qué se encontró, con cifras.' },
                { error: 'Demasiado largo o corto', example: 'Más de 250 o menos de 150 palabras.', fix: 'Ajusta la proporción de cada parte.' },
                { error: 'Varios párrafos', example: 'Un párrafo por parte.', fix: 'Un solo párrafo continuo.' },
                { error: 'Citas o tablas', example: '«Según Pérez (2022)…» o «ver tabla 1».', fix: 'El resumen no lleva citas ni remite a tablas.' },
                { error: 'Datos que no están en el documento', example: 'Una cifra nueva.', fix: 'Todo lo del resumen debe estar en el texto.' },
                { error: 'Palabras clave genéricas', example: '«investigación, estudio».', fix: 'Usa términos específicos de tu tema.' },
            ],
        },
    },
    {
        id: 'juzga', section: 'calidad', min: 3, title: '¿Le falta algo?',
        lead: ['Identifica qué parte falta en cada resumen.'],
        quiz: [
            q('«Este estudio buscó describir el uso de redes sociales en adolescentes. Se encuestó a 300 estudiantes. Se concluye que el uso es alto.»', ['Le faltan los resultados con datos', 'Está completo', 'Le falta el objetivo'], 0, 'Dice qué se buscó, cómo y qué se concluye, pero no qué se encontró.'),
            q('«La deserción es un problema grave en Colombia. Afecta a muchos estudiantes y a las universidades. Es necesario estudiarla.»', ['Solo tiene contexto', 'Está completo', 'Le faltan las conclusiones'], 0, 'No tiene objetivo, método, resultados ni conclusiones.'),
        ],
    },
    {
        id: 'antes', section: 'calidad', min: 2, title: 'Débil y fuerte',
        lead: ['Compara una frase débil con su versión fuerte.'],
        panel: {
            type: 'table', title: 'Antes y después', head: ['Débil', 'Fuerte'], rows: [
                ['En este trabajo se habla de las citas.', 'Esta investigación tuvo como objetivo analizar los factores asociados a la inasistencia a citas médicas.'],
                ['Se hicieron encuestas y salió que olvidan.', 'Los resultados mostraron que el olvido fue la causa más frecuente de inasistencia (41 %).'],
            ],
        },
    },

    /* ---------- Cierre (3) ---------- */
    {
        id: 'repaso', section: 'cierre', min: 2, title: 'Repaso',
        lead: ['Dos preguntas para cerrar.'],
        quiz: [
            q('¿Cuántas palabras debe tener el resumen?', [`Entre ${MIN_PALABRAS} y ${MAX_PALABRAS}`, 'Menos de 100', 'Más de 400'], 0, 'Es el rango pedido.'),
            q('¿Qué cuatro partes tiene?', ['Objetivo, metodología, resultados y conclusiones', 'Título, autores, índice y anexos', 'Problema, pregunta, hipótesis y marco'], 0, 'Son la esencia del estudio.'),
        ],
    },
    {
        id: 'cierre', section: 'cierre', min: 1, title: 'Lo que te llevas',
        bullets: [
            `Un párrafo de ${MIN_PALABRAS} a ${MAX_PALABRAS} palabras.`,
            'Objetivo, metodología, resultados y conclusiones.',
            'Sin citas, tablas ni datos nuevos.',
            'De tres a seis palabras clave específicas.',
        ],
        status: true,
    },

    /* ---------- Construcción y revisión (12) ---------- */
    { id: 'construye', section: 'construccion', min: 9, title: 'Construye tu resumen', layout: 'builder' },
    { id: 'revision', section: 'revision', min: 3, title: 'Qué hace bueno a un resumen' },
]);
