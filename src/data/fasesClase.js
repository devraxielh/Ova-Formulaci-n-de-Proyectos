import { construccionPrimero } from '../components/deck/orden.js';
/*
 * Clase «Desarrollo de las fases del proyecto» (2 horas).
 * Las diapositivas 'portada', 'construye' y 'revision' se pintan aparte en el componente.
 */

export const SECTIONS = construccionPrimero([
    { id: 'apertura', label: 'Apertura' },
    { id: 'estructura', label: 'Estructura de una fase' },
    { id: 'modelos', label: 'Modelos de fases' },
    { id: 'ejemplos', label: 'Ejemplos' },
    { id: 'gestion', label: 'Tiempo y recursos' },
    { id: 'calidad', label: 'Calidad' },
    { id: 'cierre', label: 'Cierre' },
    { id: 'construccion', label: 'Construcción' },
    { id: 'revision', label: 'Revisión final' },
]);

const q = (text, options, answer, why) => ({ text, options, answer, why });

export const SLIDES = construccionPrimero([
    /* ---------- Apertura (12) ---------- */
    { id: 'portada', section: 'apertura', min: 3, title: 'Desarrollo de las fases del proyecto' },
    {
        id: 'quees', section: 'apertura', min: 3, title: 'Qué es el desarrollo de las fases',
        lead: ['Es la descripción, etapa por etapa, de cómo se ejecutará el proyecto: qué se hace en cada fase, con qué técnicas, qué productos se obtienen y cuánto tiempo toma. Convierte la metodología en un plan de trabajo.'],
        panel: {
            type: 'table', title: 'No es lo mismo que…', head: ['Sección', 'Responde'], rows: [
                ['Metodología', 'Con qué enfoque, diseño, población e instrumentos se investiga.'],
                ['**Desarrollo de las fases**', '**Qué se hace, paso a paso, para lograr cada objetivo.**'],
                ['Cronograma', 'Cuándo se hace cada actividad.'],
                ['Presupuesto', 'Cuánto cuesta.'],
            ],
        },
    },
    {
        id: 'porque', section: 'apertura', min: 3, title: 'Una fase por objetivo específico',
        lead: ['La forma más clara de organizar las fases es una por cada objetivo específico: al terminar la fase, el objetivo queda cumplido y deja un producto.'],
        panel: {
            type: 'chain', title: 'Del objetivo a la fase', items: [
                { label: 'Objetivo específico 1', text: 'Caracterizar la inasistencia a citas médicas.', note: '→ Fase 1. Caracterización' },
                { label: 'Objetivo específico 2', text: 'Establecer la relación entre el olvido y la inasistencia.', note: '→ Fase 2. Análisis de la relación' },
                { label: 'Objetivo específico 3', text: 'Proponer estrategias para reducir la inasistencia.', note: '→ Fase 3. Diseño de la propuesta' },
            ],
        },
    },
    {
        id: 'quiz-apertura', section: 'apertura', min: 3, title: '¿Dónde va?',
        lead: ['Distingue las fases de las demás secciones.'],
        quiz: [
            q('«Aplicar el cuestionario a los 278 pacientes de la muestra.»', ['Desarrollo de las fases', 'Justificación', 'Marco teórico'], 0, 'Es una actividad de una fase.'),
            q('«Se usará un diseño no experimental transversal.»', ['Desarrollo de las fases', 'Metodología', 'Cronograma'], 1, 'Es una decisión metodológica.'),
        ],
    },

    /* ---------- Estructura de una fase (18) ---------- */
    {
        id: 'partes', section: 'estructura', min: 5, title: 'Las partes de una fase',
        lead: ['Cada fase se describe con los mismos elementos.'],
        panel: {
            type: 'tabs', title: 'Elementos de una fase', items: [
                { id: 'nombre', label: 'Nombre', what: 'Un sustantivo que resume la fase.', example: 'Fase 1. Caracterización de la inasistencia.' },
                { id: 'obj', label: 'Objetivo', what: 'El objetivo específico que cumple.', example: 'Caracterizar la inasistencia a citas médicas en los pacientes de consulta externa.' },
                { id: 'act', label: 'Actividades', what: 'Las acciones concretas, en orden, con verbo en infinitivo.', example: 'Diseñar la ficha de registro; revisar los registros de citas; organizar la base de datos.' },
                { id: 'tec', label: 'Técnicas y herramientas', what: 'Con qué se hace: técnicas, instrumentos y software.', example: 'Revisión documental, ficha de registro, Excel.' },
                { id: 'prod', label: 'Productos', what: 'Lo que queda al terminar: un entregable verificable.', example: 'Informe de caracterización con tablas y gráficos.' },
                { id: 'dur', label: 'Duración y responsable', what: 'Cuánto tiempo toma y quién la lidera.', example: '6 semanas · investigador principal.' },
            ],
        },
    },
    {
        id: 'actividades', section: 'estructura', min: 4, title: 'Cómo escribir las actividades',
        lead: ['Las actividades son acciones concretas y verificables, con verbo en infinitivo y en orden lógico.'],
        panel: {
            type: 'table', title: 'Débil y fuerte', head: ['Débil', 'Fuerte'], rows: [
                ['Hacer encuestas.', 'Aplicar el cuestionario a los 278 pacientes de la muestra.'],
                ['Revisar información.', 'Revisar los registros de citas del primer semestre de 2026 en el sistema del hospital.'],
                ['Analizar.', 'Calcular la correlación de Spearman entre el olvido y la inasistencia en Jamovi.'],
            ],
        },
    },
    {
        id: 'productos', section: 'estructura', min: 4, title: 'Productos y entregables',
        lead: ['Cada fase termina en un producto que se puede mostrar y revisar. Si no hay producto, no hay forma de saber que la fase se cumplió.'],
        panel: {
            type: 'list', title: 'Productos frecuentes', items: [
                { label: 'Diagnóstico', text: 'Informe de caracterización, matriz DOFA, línea base.' },
                { label: 'Recolección', text: 'Instrumento validado, base de datos depurada.' },
                { label: 'Análisis', text: 'Tablas y gráficos, informe de resultados, modelo estadístico.' },
                { label: 'Propuesta', text: 'Documento de la estrategia, prototipo, tablero de analítica.' },
                { label: 'Cierre', text: 'Informe final, artículo, presentación de socialización.' },
            ],
        },
    },
    {
        id: 'hitos', section: 'estructura', min: 5, title: 'Hitos e indicadores',
        lead: ['Un hito es un momento clave que marca el fin de una fase. Un indicador dice cómo sabrás que se cumplió.'],
        panel: {
            type: 'table', title: 'Ejemplos', head: ['Fase', 'Hito', 'Indicador'], rows: [
                ['Caracterización', 'Base de datos depurada', '100 % de los registros del semestre revisados'],
                ['Análisis', 'Informe de resultados aprobado por el asesor', 'Una prueba estadística por objetivo'],
                ['Propuesta', 'Estrategia validada', 'Concepto favorable de 3 expertos'],
            ],
        },
    },

    /* ---------- Modelos de fases (24) ---------- */
    {
        id: 'mod-cuanti', section: 'modelos', min: 4, title: 'Proyecto de investigación cuantitativa',
        lead: ['Las fases siguen el recorrido de los datos.'],
        panel: {
            type: 'chain', title: 'Cuatro fases', items: [
                { label: '1. Preparación', text: 'Diseño y validación del instrumento, permisos, selección de la muestra.' },
                { label: '2. Recolección', text: 'Aplicación del instrumento y control de calidad de los datos.' },
                { label: '3. Análisis', text: 'Depuración, estadística descriptiva e inferencial.' },
                { label: '4. Informe', text: 'Interpretación, discusión con los antecedentes y conclusiones.' },
            ],
        },
    },
    {
        id: 'mod-cuali', section: 'modelos', min: 4, title: 'Proyecto de investigación cualitativa',
        lead: ['Las fases se repiten y se ajustan: recolección y análisis van juntos hasta la saturación.'],
        panel: {
            type: 'chain', title: 'Cuatro fases', items: [
                { label: '1. Entrada al campo', text: 'Contacto con los participantes, consentimiento, guía de entrevista.' },
                { label: '2. Recolección', text: 'Entrevistas, observación o grupos focales, con transcripción.' },
                { label: '3. Análisis', text: 'Codificación abierta, axial y selectiva; triangulación.' },
                { label: '4. Informe', text: 'Categorías, interpretación y validación con los participantes.' },
            ],
        },
    },
    {
        id: 'mod-propositivo', section: 'modelos', min: 4, title: 'Proyecto propositivo o de diseño',
        lead: ['Para proyectos que terminan en una estrategia, un modelo o un prototipo.'],
        panel: {
            type: 'chain', title: 'Cuatro fases', items: [
                { label: '1. Diagnóstico', text: 'Identificar el problema y sus causas en el contexto.' },
                { label: '2. Diseño', text: 'Definir los componentes y construir la propuesta.' },
                { label: '3. Validación', text: 'Juicio de expertos o prueba con usuarios.' },
                { label: '4. Ajuste y socialización', text: 'Incorporar mejoras y presentar la versión final.' },
            ],
        },
    },
    {
        id: 'mod-crisp', section: 'modelos', min: 4, title: 'Proyecto de analítica de datos (CRISP-DM)',
        lead: ['CRISP-DM (Chapman et al., 2000) es el modelo más usado para proyectos de analítica y minería de datos.'],
        panel: {
            type: 'tabs', title: 'Seis fases de CRISP-DM', items: [
                { id: 'neg', label: '1. Comprensión del negocio', what: 'Definir el problema, los objetivos y los criterios de éxito.', example: 'Reducir la inasistencia; éxito: predecir el 70 % de las citas perdidas.' },
                { id: 'dat', label: '2. Comprensión de los datos', what: 'Recolectar y explorar los datos disponibles.', example: 'Exportar 12.000 registros de citas y explorar sus variables.' },
                { id: 'prep', label: '3. Preparación', what: 'Limpiar, transformar e integrar los datos.', example: 'Eliminar duplicados, crear variables como «días entre asignación y cita».' },
                { id: 'mod', label: '4. Modelado', what: 'Aplicar y ajustar técnicas o modelos.', example: 'Regresión logística y árboles de decisión.' },
                { id: 'eval', label: '5. Evaluación', what: 'Comprobar si el modelo cumple los criterios de éxito.', example: 'Exactitud, sensibilidad y especificidad en datos de prueba.' },
                { id: 'desp', label: '6. Despliegue', what: 'Poner el resultado al servicio de los usuarios.', example: 'Tablero que marca las citas con alto riesgo de inasistencia.' },
            ],
        },
    },
    {
        id: 'mod-intervencion', section: 'modelos', min: 4, title: 'Proyecto de intervención o evaluativo',
        lead: ['Para proyectos que aplican una estrategia y miden su efecto.'],
        panel: {
            type: 'chain', title: 'Tres fases', items: [
                { label: '1. Línea base', text: 'Medir la situación antes de la intervención.' },
                { label: '2. Intervención', text: 'Aplicar la estrategia según un protocolo.' },
                { label: '3. Evaluación', text: 'Medir de nuevo y comparar con la línea base.' },
            ],
        },
    },
    {
        id: 'mod-ia', section: 'modelos', min: 4, title: 'Investigación-acción',
        lead: ['Kemmis y McTaggart (1988) proponen un ciclo que se repite con la comunidad.'],
        panel: {
            type: 'chain', title: 'El ciclo', items: [
                { label: '1. Planificar', text: 'Diagnosticar con la comunidad y acordar una acción.' },
                { label: '2. Actuar', text: 'Poner en marcha la acción acordada.' },
                { label: '3. Observar', text: 'Registrar lo que ocurre.' },
                { label: '4. Reflexionar', text: 'Analizar los cambios y planear el siguiente ciclo.' },
            ],
        },
    },

    /* ---------- Ejemplos (15) ---------- */
    {
        id: 'ej-salud', section: 'ejemplos', min: 4, title: 'Ejemplo: salud',
        lead: ['Una fase completa en un proyecto de salud.'],
        panel: {
            type: 'example', title: 'Fase 2. Análisis de la relación entre el olvido y la inasistencia', paragraphs: [
                '**Objetivo:** establecer la relación entre el olvido de la cita y la inasistencia en los pacientes de consulta externa.',
                '**Actividades:** aplicar el cuestionario a los 278 pacientes de la muestra; digitar y depurar la base de datos; calcular la correlación de Spearman; interpretar los resultados frente a los antecedentes.',
                '**Técnicas y herramientas:** encuesta, cuestionario validado por expertos, Jamovi.',
                '**Producto:** informe de resultados con tablas y la prueba estadística.',
                '**Duración:** 8 semanas · investigador principal.',
            ],
        },
    },
    {
        id: 'ej-educacion', section: 'ejemplos', min: 4, title: 'Ejemplo: educación',
        lead: ['Una fase de diseño en un proyecto de educación.'],
        panel: {
            type: 'example', title: 'Fase 3. Diseño de la secuencia didáctica', paragraphs: [
                '**Objetivo:** diseñar una secuencia didáctica para fortalecer la comprensión lectora en grado quinto.',
                '**Actividades:** definir los desempeños esperados; seleccionar los textos y las actividades; elaborar los instrumentos de evaluación; validar la secuencia con tres docentes expertos.',
                '**Técnicas y herramientas:** juicio de expertos, rúbrica de validación.',
                '**Producto:** secuencia didáctica validada (documento).',
                '**Duración:** 6 semanas.',
            ],
        },
    },
    {
        id: 'ej-analitica', section: 'ejemplos', min: 4, title: 'Ejemplo: analítica de datos',
        lead: ['Una fase de modelado en un proyecto de analítica.'],
        panel: {
            type: 'example', title: 'Fase 3. Modelado predictivo de la inasistencia', paragraphs: [
                '**Objetivo:** construir un modelo que estime la probabilidad de inasistencia de cada cita.',
                '**Actividades:** dividir los datos en entrenamiento y prueba; entrenar una regresión logística y un árbol de decisión; ajustar los hiperparámetros; comparar los modelos con la métrica F1.',
                '**Técnicas y herramientas:** Python (pandas, scikit-learn), Jupyter.',
                '**Producto:** modelo entrenado y reporte de desempeño.',
                '**Duración:** 5 semanas.',
            ],
        },
    },
    {
        id: 'ej-comparar', section: 'ejemplos', min: 3, title: 'Fase débil y fase fuerte',
        lead: ['Compara y fíjate en lo que falta en la débil.'],
        panel: {
            type: 'table', title: 'Antes y después', head: ['Elemento', 'Débil', 'Fuerte'], rows: [
                ['Nombre', 'Fase 2', 'Fase 2. Análisis de la relación'],
                ['Actividades', 'Hacer encuestas y analizar.', 'Aplicar el cuestionario; depurar la base; calcular Spearman; interpretar.'],
                ['Producto', '—', 'Informe de resultados con tablas y prueba estadística.'],
                ['Duración', '—', '8 semanas.'],
            ],
        },
    },

    /* ---------- Tiempo y recursos (10) ---------- */
    {
        id: 'duracion', section: 'gestion', min: 4, title: 'Duración y secuencia',
        lead: ['Algunas fases dependen de otras: no puedes analizar antes de recolectar. Otras pueden ir en paralelo, como la revisión de literatura y la validación del instrumento.'],
        bullets: ['Estima la duración de cada actividad y súmalas.', 'Deja margen para imprevistos (recolección, permisos, correcciones).', 'La suma de las fases debe coincidir con el cronograma.'],
        panel: {
            type: 'table', title: 'Ejemplo de secuencia', head: ['Fase', 'Depende de', 'Duración'], rows: [
                ['1. Caracterización', '—', '6 semanas'],
                ['2. Análisis', 'Fase 1', '8 semanas'],
                ['3. Propuesta', 'Fase 2', '6 semanas'],
                ['Total', '', '20 semanas (5 meses)'],
            ],
        },
    },
    {
        id: 'recursos', section: 'gestion', min: 3, title: 'Recursos y responsables',
        lead: ['Cada fase usa recursos que deben aparecer en el presupuesto, y tiene un responsable.'],
        panel: {
            type: 'list', title: 'Por fase, pregúntate', items: [
                { label: '¿Quién?', text: 'Investigador, asesor, encuestadores, expertos.' },
                { label: '¿Con qué?', text: 'Equipos, software, servicios en la nube, materiales.' },
                { label: '¿Dónde?', text: 'Institución, campo, laboratorio, trabajo remoto.' },
            ],
        },
    },
    {
        id: 'riesgos', section: 'gestion', min: 3, title: 'Riesgos de cada fase',
        lead: ['Anticipa qué puede salir mal y cómo responderás. Se relaciona con las limitaciones.'],
        panel: {
            type: 'table', title: 'Riesgos frecuentes', head: ['Riesgo', 'Respuesta'], rows: [
                ['La institución demora el aval', 'Solicitarlo al inicio; tener una institución alterna.'],
                ['Baja tasa de respuesta', 'Recordatorios, aplicación presencial, ampliar el periodo.'],
                ['Datos incompletos', 'Depurar y reportar el porcentaje de datos faltantes.'],
                ['Pérdida de información', 'Copias de seguridad en la nube.'],
            ],
        },
    },

    /* ---------- Calidad (10) ---------- */
    {
        id: 'errores', section: 'calidad', min: 4, title: 'Ocho errores frecuentes',
        lead: ['Revisa si tus fases caen en alguno.'],
        panel: {
            type: 'accordion', title: 'Abre cada error para ver cómo corregirlo', items: [
                { error: 'Fases sin objetivo', example: 'Fases que no cumplen ningún objetivo específico.', fix: 'Asocia cada fase a un objetivo.' },
                { error: 'Objetivos sin fase', example: 'Un objetivo específico que no aparece en ninguna fase.', fix: 'Cada objetivo debe tener su fase.' },
                { error: 'Actividades vagas', example: '«Hacer encuestas».', fix: 'Verbo en infinitivo, qué, con quién y cómo.' },
                { error: 'Sin productos', example: 'Fases que no dejan nada verificable.', fix: 'Un producto por fase.' },
                { error: 'Orden ilógico', example: 'Analizar antes de recolectar.', fix: 'Respeta las dependencias.' },
                { error: 'Fases que repiten la metodología', example: 'Copiar el enfoque y el diseño.', fix: 'Aquí se describen acciones, no decisiones metodológicas.' },
                { error: 'Tiempos que no cuadran', example: 'Las fases suman 10 meses y el cronograma 6.', fix: 'Ajusta fases y cronograma para que coincidan.' },
                { error: 'Sin responsables ni recursos', example: 'No se sabe quién hace qué.', fix: 'Indica responsable y recursos por fase.' },
            ],
        },
    },
    {
        id: 'juzga', section: 'calidad', min: 3, title: '¿Está bien planteada?',
        lead: ['Decide si cada fase está bien planteada.'],
        quiz: [
            q('«Fase 1: Investigar el tema. Actividades: leer.»', ['Bien planteada', 'Hay que mejorarla'], 1, 'No tiene objetivo, actividades concretas ni producto.'),
            q('«Fase 2. Validación. Objetivo: validar la estrategia. Actividades: seleccionar tres expertos; enviar la estrategia y la rúbrica; ajustar según sus conceptos. Producto: estrategia validada. Duración: 4 semanas.»', ['Bien planteada', 'Hay que mejorarla'], 0, 'Tiene todos los elementos.'),
        ],
    },
    {
        id: 'coherencia', section: 'calidad', min: 3, title: 'Coherencia con el resto del proyecto',
        lead: ['Las fases conectan los objetivos con el cronograma y el presupuesto.'],
        panel: {
            type: 'chain', title: 'Preguntas de control', items: [
                { label: 'Objetivos', text: '¿Cada objetivo específico tiene una fase?' },
                { label: 'Metodología', text: '¿Las técnicas de cada fase son las de la metodología?' },
                { label: 'Cronograma', text: '¿Las actividades y los tiempos coinciden?' },
                { label: 'Presupuesto', text: '¿Los recursos de cada fase están valorados?' },
            ],
        },
    },

    /* ---------- Cierre (5) ---------- */
    {
        id: 'repaso', section: 'cierre', min: 3, title: 'Repaso',
        lead: ['Tres preguntas para comprobar lo aprendido.'],
        quiz: [
            q('¿Cuántas fases debe tener el proyecto?', ['Siempre cinco', 'Normalmente una por objetivo específico', 'Una sola'], 1, 'Así cada fase cumple un objetivo.'),
            q('¿Qué debe dejar cada fase?', ['Un producto verificable', 'Una opinión', 'Nada'], 0, 'El producto muestra que la fase se cumplió.'),
            q('¿Qué modelo de fases se usa en analítica de datos?', ['CRISP-DM', 'Investigación-acción', 'SERVQUAL'], 0, 'CRISP-DM tiene seis fases, del negocio al despliegue.'),
        ],
    },
    {
        id: 'cierre', section: 'cierre', min: 2, title: 'Lo que te llevas',
        bullets: [
            'Una fase por objetivo específico, en orden lógico.',
            'Cada fase: nombre, objetivo, actividades, técnicas, producto, duración y responsable.',
            'Actividades concretas con verbo en infinitivo.',
            'Un modelo de fases acorde con el tipo de proyecto.',
            'Tiempos que coinciden con el cronograma y recursos en el presupuesto.',
        ],
        status: true,
    },

    /* ---------- Construcción y revisión (26) ---------- */
    { id: 'construye', section: 'construccion', min: 20, title: 'Construye las fases de tu proyecto', layout: 'builder' },
    { id: 'revision', section: 'revision', min: 6, title: 'Qué hace buenas a unas fases' },
]);
