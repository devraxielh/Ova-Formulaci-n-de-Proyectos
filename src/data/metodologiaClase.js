import { construccionPrimero } from '../components/deck/orden.js';
/*
 * Contenido de la clase larga de Metodología (4 horas).
 * Cada diapositiva: { id, section, min, title, lead[], bullets[], hint, panel, quiz }.
 * Las diapositivas 'portada', 'muestra', 'gantt', 'construye' y 'revision' se pintan aparte en el componente.
 */

export const SECTIONS = construccionPrimero([
    { id: 'apertura', label: 'Apertura' },
    { id: 'enfoque', label: 'Enfoque' },
    { id: 'tipos', label: 'Tipos' },
    { id: 'disenos', label: 'Diseños' },
    { id: 'poblacion', label: 'Población y muestra' },
    { id: 'instrumentos', label: 'Instrumentos' },
    { id: 'analisis', label: 'Plan de análisis' },
    { id: 'cronograma', label: 'Cronograma' },
    { id: 'presupuesto', label: 'Presupuesto' },
    { id: 'calidad', label: 'Calidad' },
    { id: 'cierre', label: 'Cierre' },
    { id: 'construccion', label: 'Construcción' },
    { id: 'revision', label: 'Revisión final' },
]);

const q = (text, options, answer, why) => ({ text, options, answer, why });

export const SLIDES = construccionPrimero([
    /* ---------- Apertura (12) ---------- */
    { id: 'portada', section: 'apertura', min: 3, title: 'La metodología: cómo vas a lograr tus objetivos' },
    {
        id: 'quees', section: 'apertura', min: 3, title: 'Qué es la metodología',
        lead: ['La metodología contiene, en forma organizada y precisa, cómo se proyecta alcanzar cada uno de los objetivos específicos propuestos. Debe reflejar la estructura lógica y el rigor científico del proceso de investigación.'],
        panel: {
            type: 'list', title: 'Ocho subtítulos', items: [
                { label: 'Enfoque de investigación', text: 'Desde qué perspectiva se aborda el problema.' },
                { label: 'Tipos de investigación', text: 'Hasta dónde llega el conocimiento.' },
                { label: 'Diseños de investigación', text: 'El plan para obtener los datos.' },
                { label: 'Población y muestra', text: 'Con quiénes.' },
                { label: 'Plan de análisis de la información', text: 'Qué se hará con los datos.' },
                { label: 'Instrumentos de recolección', text: 'Con qué se recogen los datos.' },
                { label: 'Cronograma', text: 'Cuándo.' },
                { label: 'Presupuesto', text: 'Con cuánto y con qué fuentes.' },
            ],
        },
    },
    {
        id: 'ruta', section: 'apertura', min: 3, title: 'De los objetivos al método',
        lead: ['Cada decisión metodológica sale de un objetivo. Si una decisión no responde a ningún objetivo, sobra; si un objetivo no tiene método, falta.'],
        panel: {
            type: 'chain', title: 'Un objetivo, todo su método', items: [
                { label: 'Objetivo específico', text: 'Establecer la relación entre el olvido de la cita y la inasistencia.', note: 'Lo que quieres lograr.' },
                { label: 'Enfoque, tipo y diseño', text: 'Cuantitativo, correlacional, no experimental transversal.', note: '«Establecer la relación» pide medir y correlacionar.' },
                { label: 'Población e instrumento', text: '278 pacientes; encuesta con un cuestionario validado.', note: 'De quiénes y con qué.' },
                { label: 'Análisis', text: 'Correlación de Spearman en Jamovi.', note: 'Cómo se responde el objetivo.' },
            ],
        },
    },
    {
        id: 'quiz-apertura', section: 'apertura', min: 3, title: '¿Qué responde la metodología?',
        lead: ['Comprueba la idea central antes de empezar.'],
        quiz: [
            q('¿Qué responde la metodología?', ['Por qué es importante el estudio', 'Cómo, con quiénes, con qué, cuándo y con cuánto se hará', 'Qué teorías explican el problema'], 1, 'La importancia va en la justificación y las teorías en el marco referencial.'),
            q('¿De dónde salen las decisiones metodológicas?', ['De los gustos del investigador', 'De los objetivos específicos', 'Del presupuesto disponible'], 1, 'Cada objetivo específico necesita su método.'),
        ],
    },

    /* ---------- Enfoque (25) ---------- */
    {
        id: 'enf-quees', section: 'enfoque', min: 4, title: 'Enfoque de investigación',
        lead: ['El enfoque determina la perspectiva epistemológica y metodológica desde la cual se aborda el problema. Hay dos enfoques principales, cuantitativo y cualitativo, y la investigación contemporánea admite un enfoque mixto que integra elementos de ambos.'],
        panel: {
            type: 'table', title: 'Enfoque y paradigma', head: ['Enfoque', 'Paradigma', 'Busca'], rows: [
                ['Cuantitativo', 'Positivista', 'Objetividad, medición y generalización.'],
                ['Cualitativo', 'Interpretativo', 'Comprensión profunda desde los actores.'],
                ['Mixto', 'Pragmático', 'Integrar ambos para una comprensión más completa.'],
            ],
        },
    },
    {
        id: 'enf-cuanti', section: 'enfoque', min: 5, title: 'Enfoque cuantitativo',
        lead: ['Se sustenta en el paradigma positivista: busca la objetividad y la generalización de los resultados. Recolecta y analiza datos numéricos con métodos estadísticos para establecer relaciones entre variables y probar hipótesis. Su finalidad es describir, explicar y predecir fenómenos con precisión y rigor en la medición.'],
        bullets: ['Datos: números (encuestas cerradas, pruebas, registros).', 'Muestras grandes y, si es posible, aleatorias.', 'Análisis: estadística descriptiva e inferencial.', 'Hipótesis que se ponen a prueba.'],
        panel: {
            type: 'example', title: 'Ejemplos cuantitativos', paragraphs: [
                '**Salud.** Determinar la relación entre la edad y la inasistencia a citas en 278 pacientes de consulta externa.',
                '**Educación.** Comparar el rendimiento en matemáticas de dos grupos que usan estrategias distintas.',
                '**Negocios.** Medir el efecto de los pagos digitales en las ventas de 150 tiendas de barrio.',
            ],
        },
    },
    {
        id: 'enf-cuali', section: 'enfoque', min: 5, title: 'Enfoque cualitativo',
        lead: ['Se enmarca en el paradigma interpretativo: busca comprender en profundidad los fenómenos desde la perspectiva de los actores. Explora significados, experiencias y perspectivas con métodos como la observación participante, las entrevistas en profundidad y el análisis del discurso. Su finalidad es comprender la complejidad de los fenómenos sociales en su contexto natural.'],
        bullets: ['Datos: palabras, imágenes, observaciones.', 'Pocos participantes, elegidos con intención.', 'Análisis: codificación y categorías.', 'Preguntas abiertas que se afinan en el proceso.'],
        panel: {
            type: 'example', title: 'Ejemplos cualitativos', paragraphs: [
                '**Salud.** Comprender cómo viven los pacientes con diabetes el cuidado de su enfermedad en la zona rural.',
                '**Educación.** Interpretar las experiencias de los docentes con la educación virtual.',
                '**Negocios.** Comprender por qué los tenderos desconfían de los pagos digitales.',
            ],
        },
    },
    {
        id: 'enf-mixto', section: 'enfoque', min: 4, title: 'Enfoque mixto',
        lead: ['Integra los enfoques cuantitativo y cualitativo y combina sus fortalezas para obtener una comprensión más integral del fenómeno. Recolecta y analiza ambos tipos de datos y usa la triangulación de métodos y perspectivas.'],
        panel: {
            type: 'example', title: 'Ejemplo mixto', paragraphs: [
                'Primero se encuesta a 278 pacientes para medir la frecuencia de la inasistencia y sus factores (fase cuantitativa). Luego se entrevista a 12 de ellos para comprender por qué los factores más frecuentes les impiden asistir (fase cualitativa). Al final se integran ambos resultados.',
            ],
        },
    },
    {
        id: 'enf-comparar', section: 'enfoque', min: 4, title: 'Cuantitativo y cualitativo, lado a lado',
        lead: ['Mira el verbo de tus objetivos: «medir, relacionar, determinar» apuntan a lo cuantitativo; «comprender, interpretar, describir experiencias», a lo cualitativo.'],
        panel: {
            type: 'table', title: 'Comparación', head: ['Aspecto', 'Cuantitativo', 'Cualitativo'], rows: [
                ['Pregunta', '¿Cuánto? ¿Qué relación hay?', '¿Cómo? ¿Por qué? ¿Qué significa?'],
                ['Datos', 'Números', 'Palabras, imágenes'],
                ['Muestra', 'Grande, representativa', 'Pequeña, intencional'],
                ['Instrumento', 'Cuestionario, prueba', 'Guía de entrevista, observación'],
                ['Análisis', 'Estadístico', 'Codificación y categorías'],
                ['Resultado', 'Generalizable', 'Comprensión profunda del caso'],
            ],
        },
    },
    {
        id: 'enf-quiz', section: 'enfoque', min: 3, title: '¿Qué enfoque corresponde?',
        lead: ['Lee cada objetivo y elige el enfoque.'],
        quiz: [
            q('«Comprender cómo perciben los adultos mayores la atención por telemedicina.»', ['Cuantitativo', 'Cualitativo', 'Mixto'], 1, '«Comprender cómo perciben» pide profundizar en experiencias.'),
            q('«Determinar el porcentaje de pacientes que no asisten y su relación con la edad.»', ['Cuantitativo', 'Cualitativo', 'Mixto'], 0, 'Porcentajes y relaciones se miden con números.'),
            q('«Medir la satisfacción de los usuarios y luego profundizar con entrevistas en las causas de la insatisfacción.»', ['Cuantitativo', 'Cualitativo', 'Mixto'], 2, 'Combina medición y comprensión.'),
        ],
    },

    /* ---------- Tipos (25) ---------- */
    {
        id: 'tip-exploratoria', section: 'tipos', min: 4, title: 'Investigación exploratoria',
        lead: ['Se realiza cuando el tema ha sido poco estudiado o no se ha abordado antes. Es flexible y abierta: el investigador obtiene una primera aproximación al fenómeno, identifica variables relevantes, formula preguntas y genera hipótesis para estudios posteriores. Suele recoger datos cualitativos (entrevistas a expertos, revisión de documentos, estudios de caso). No busca conclusiones definitivas, sino abrir caminos.'],
        panel: { type: 'example', title: 'Ejemplo', paragraphs: ['Explorar los usos que dan los pequeños productores de Córdoba a la inteligencia artificial en la gestión de sus cultivos, un tema sin estudios previos en la región.'] },
    },
    {
        id: 'tip-descriptiva', section: 'tipos', min: 4, title: 'Investigación descriptiva',
        lead: ['Su propósito es describir en detalle las características de un fenómeno, situación o población. Responde ¿qué?, ¿cómo?, ¿dónde? y ¿cuándo?, y ofrece una «fotografía» precisa del objeto de estudio con encuestas, entrevistas, observación o análisis de documentos. No busca explicar causas, sino presentar una imagen completa.'],
        panel: { type: 'example', title: 'Ejemplo', paragraphs: ['Describir el perfil sociodemográfico y la frecuencia de inasistencia de los pacientes de consulta externa de un hospital de Sincelejo en 2026.'] },
    },
    {
        id: 'tip-correlacional', section: 'tipos', min: 4, title: 'Investigación correlacional',
        lead: ['Mide el grado de relación entre dos o más variables en un mismo grupo, sin afirmar que una cause la otra. Responde: ¿cuando una variable cambia, la otra también?'],
        panel: { type: 'example', title: 'Ejemplo', paragraphs: ['Establecer la relación entre las horas de uso del celular y el rendimiento en matemáticas de los estudiantes de grado noveno de una institución de Lorica.'] },
    },
    {
        id: 'tip-explicativa', section: 'tipos', min: 4, title: 'Investigación explicativa',
        lead: ['Busca comprender las causas y consecuencias de un fenómeno: por qué ocurre y cómo se relaciona con otros factores. Va más allá de la descripción y busca relaciones de causa y efecto. Se apoya en la investigación descriptiva, pero incorpora análisis más profundos para identificar los factores que lo determinan y predecir su comportamiento, con métodos cuantitativos (análisis estadísticos) o cualitativos (patrones y conexiones).'],
        panel: { type: 'example', title: 'Ejemplo', paragraphs: ['Determinar los factores que explican la deserción de los estudiantes de primer semestre de ingeniería de una universidad pública de Montería.'] },
    },
    {
        id: 'tip-otras', section: 'tipos', min: 3, title: 'Evaluativa y propositiva',
        lead: ['Dos tipos frecuentes en proyectos aplicados y de especialización.'],
        panel: {
            type: 'tabs', title: 'Otros tipos', items: [
                { id: 'eval', label: 'Evaluativa', what: 'Valora el efecto o la efectividad de una intervención, un programa o una tecnología.', example: 'Evaluar el efecto de los recordatorios por WhatsApp en la inasistencia.' },
                { id: 'prop', label: 'Propositiva', what: 'Diagnostica el problema y diseña una propuesta (modelo, estrategia, prototipo) para atenderlo.', example: 'Diseñar un tablero de analítica para el seguimiento de la inasistencia.' },
            ],
        },
    },
    {
        id: 'tip-clasificaciones', section: 'tipos', min: 3, title: 'Otras clasificaciones',
        lead: ['Además del alcance, la investigación se clasifica según otros criterios. Puedes mencionarlos si aportan claridad.'],
        panel: {
            type: 'table', title: 'Según…', head: ['Criterio', 'Tipos'], rows: [
                ['Finalidad', 'Básica (amplía el conocimiento) o aplicada (resuelve un problema práctico).'],
                ['Tiempo', 'Transversal (un momento) o longitudinal (varios momentos).'],
                ['Fuente de datos', 'De campo (datos directos) o documental (registros y documentos).'],
                ['Control', 'Experimental, cuasiexperimental o no experimental.'],
            ],
        },
    },
    {
        id: 'tip-quiz', section: 'tipos', min: 3, title: 'El tipo lo marcan tus objetivos',
        lead: ['El verbo más alto de tus objetivos marca el tipo de investigación. Debe coincidir con tus alcances.'],
        quiz: [
            q('Objetivo general: «Establecer la relación entre…».', ['Descriptiva', 'Correlacional', 'Propositiva'], 1, 'Relacionar variables es propio de la correlacional.'),
            q('Último específico: «Diseñar una estrategia para reducir…».', ['Exploratoria', 'Explicativa', 'Propositiva'], 2, 'Terminar en una propuesta es propio de la propositiva.'),
            q('«Describir las características de los usuarios de la biblioteca.»', ['Descriptiva', 'Explicativa', 'Evaluativa'], 0, 'Responde qué y cómo, sin buscar causas.'),
        ],
    },

    /* ---------- Diseños (30) ---------- */
    {
        id: 'dis-experimental', section: 'disenos', min: 5, title: 'Diseño experimental',
        lead: ['Se manipulan intencionalmente una o más variables independientes para analizar su efecto en una o más dependientes, buscando relaciones de causa y efecto. Se controlan con rigor las variables extrañas y los participantes se asignan al azar a un grupo experimental y uno de control.'],
        bullets: ['Esquema: G1 (azar) → O1 → X → O2 · G2 (azar) → O1 → — → O2.', 'X es la intervención; O, la medición.'],
        panel: { type: 'example', title: 'Ejemplo clásico', paragraphs: ['Para estudiar el efecto de un nuevo medicamento, un grupo recibe el fármaco y otro un placebo; los pacientes se asignan al azar y se mantienen constantes los demás factores que pueden influir en la salud.'] },
    },
    {
        id: 'dis-cuasi', section: 'disenos', min: 5, title: 'Diseño cuasiexperimental',
        lead: ['Comparte con el experimental la manipulación de la variable independiente, pero tiene menos control y no asigna a los participantes al azar, porque se trabaja con grupos ya formados en contextos naturales, como escuelas o empresas.'],
        panel: { type: 'example', title: 'Ejemplo', paragraphs: ['Analizar el impacto de un programa educativo en dos colegios: en uno se aplica el programa y en el otro no. No es posible asignar a los estudiantes al azar, así que se comparan los grupos antes y después.'] },
    },
    {
        id: 'dis-noexp', section: 'disenos', min: 5, title: 'Diseño no experimental',
        lead: ['El investigador observa y analiza los fenómenos en su contexto natural, sin intervenir ni manipular las variables. Describe las variables y analiza sus relaciones, sin buscar causalidad. Puede ser descriptivo, correlacional o comparativo.'],
        bullets: ['Transversal: los datos se recogen una sola vez.', 'Longitudinal: los datos se recogen en varios momentos para ver cambios.', 'Es el diseño más usado en trabajos de grado.'],
        panel: { type: 'example', title: 'Ejemplo', paragraphs: ['Analizar la relación entre el nivel de ingresos y la satisfacción laboral en los trabajadores de una empresa, sin intervenir en ninguno de los dos factores.'] },
    },
    {
        id: 'dis-cuali', section: 'disenos', min: 5, title: 'Diseños cualitativos',
        lead: ['En lo cualitativo, el diseño depende de qué quieres comprender.'],
        panel: {
            type: 'tabs', title: 'Diseños cualitativos', items: [
                { id: 'fen', label: 'Fenomenológico', what: 'Describe y comprende la experiencia vivida por los participantes.', example: 'Experiencias de madres de niños con cáncer.' },
                { id: 'caso', label: 'Estudio de caso', what: 'Analiza en profundidad un caso delimitado: una persona, un grupo o una institución.', example: 'La transformación digital de una cooperativa.' },
                { id: 'etno', label: 'Etnográfico', what: 'Describe las prácticas y creencias de un grupo en su contexto.', example: 'Prácticas de cuidado de la salud en una comunidad indígena zenú.' },
                { id: 'tf', label: 'Teoría fundamentada', what: 'Construye una explicación teórica a partir de los datos.', example: 'Cómo deciden los jóvenes rurales si estudian o trabajan.' },
                { id: 'ia', label: 'Investigación-acción', what: 'Diagnostica con la comunidad, actúa y reflexiona sobre los cambios.', example: 'Mejorar la convivencia en un colegio con los propios estudiantes.' },
                { id: 'nar', label: 'Narrativo', what: 'Reconstruye historias de vida en relación con el fenómeno.', example: 'Trayectorias de mujeres emprendedoras.' },
            ],
        },
    },
    {
        id: 'dis-mixtos', section: 'disenos', min: 4, title: 'Diseños mixtos',
        lead: ['El diseño mixto dice en qué orden se recogen los datos y cómo se integran.'],
        panel: {
            type: 'table', title: 'Diseños mixtos', head: ['Diseño', 'Orden', 'Ejemplo'], rows: [
                ['Explicativo secuencial', 'CUAN → cual', 'Encuesta y luego entrevistas para explicar los resultados.'],
                ['Exploratorio secuencial', 'CUAL → cuan', 'Entrevistas para crear un cuestionario y luego aplicarlo.'],
                ['Convergente', 'CUAN + CUAL al mismo tiempo', 'Encuesta y grupos focales en paralelo y comparación.'],
            ],
        },
    },
    {
        id: 'dis-elegir', section: 'disenos', min: 3, title: 'Cómo elegir el diseño',
        lead: ['Tres preguntas te llevan al diseño.'],
        panel: {
            type: 'chain', title: 'Árbol de decisión', items: [
                { label: '¿Mides o comprendes?', text: 'Si mides → cuantitativo. Si comprendes → cualitativo. Ambas → mixto.' },
                { label: '¿Intervienes?', text: 'Si no → no experimental. Si sí, con grupos formados → cuasiexperimental. Si sí, al azar → experimental.' },
                { label: '¿Cuántas veces mides?', text: 'Una → transversal. Varias → longitudinal.' },
            ],
        },
    },
    {
        id: 'dis-quiz', section: 'disenos', min: 3, title: '¿Qué diseño es?',
        lead: ['Identifica el diseño de cada estudio.'],
        quiz: [
            q('Se aplica una estrategia de lectura en un curso y se compara con otro curso del mismo colegio que no la recibe.', ['Experimental', 'Cuasiexperimental', 'No experimental'], 1, 'Hay intervención, pero con grupos ya formados.'),
            q('Se encuesta una sola vez a 300 trabajadores sobre su satisfacción y su salario.', ['No experimental transversal', 'Experimental', 'Longitudinal'], 0, 'No se interviene y se mide una vez.'),
            q('Se entrevista a 10 docentes para comprender su experiencia con la educación virtual.', ['Fenomenológico', 'Cuasiexperimental', 'Explicativo secuencial'], 0, 'Busca la experiencia vivida.'),
        ],
    },

    /* ---------- Población y muestra (30) ---------- */
    {
        id: 'pob-def', section: 'poblacion', min: 4, title: 'Población y muestra',
        lead: ['**Población:** el universo de elementos que comparten características específicas y que son objeto de estudio. Esas características deben estar claramente definidas para delimitarla con precisión.', '**Muestra:** una porción o subconjunto de la población que se selecciona para estudiarla. Su representatividad es crucial, porque permite generalizar los resultados a la población de la que fue extraída.'],
        panel: {
            type: 'chain', title: 'De la población a la muestra', items: [
                { label: 'Población', text: '1.000 pacientes de consulta externa del hospital en el primer semestre de 2026.' },
                { label: 'Marco muestral', text: 'La lista de pacientes con cita en el sistema de citas.' },
                { label: 'Muestra', text: '278 pacientes elegidos al azar de esa lista.' },
            ],
        },
    },
    {
        id: 'pob-criterios', section: 'poblacion', min: 4, title: 'Unidad de análisis y criterios',
        lead: ['La unidad de análisis es cada elemento que se estudia. Los criterios de inclusión y exclusión delimitan quiénes entran.'],
        panel: {
            type: 'table', title: 'Ejemplos', head: ['Proyecto', 'Unidad', 'Inclusión', 'Exclusión'], rows: [
                ['Inasistencia a citas', 'Paciente', 'Mayor de 18 años con cita programada', 'Pacientes de urgencias'],
                ['Rendimiento en matemáticas', 'Estudiante', 'Matriculado en grado noveno', 'Ingresó después del primer periodo'],
                ['Pagos digitales', 'Tienda de barrio', 'Con registro mercantil vigente', 'Cadenas o franquicias'],
            ],
        },
    },
    { id: 'muestra', section: 'poblacion', min: 5, title: 'Calcular el tamaño de la muestra' },
    {
        id: 'pob-probabilistico', section: 'poblacion', min: 4, title: 'Muestreo probabilístico',
        lead: ['Todos los elementos tienen una probabilidad conocida de ser elegidos. Permite generalizar y calcular el tamaño de la muestra.'],
        panel: {
            type: 'tabs', title: 'Tipos', items: [
                { id: 'mas', label: 'Aleatorio simple', what: 'Todos tienen la misma probabilidad; se sortea de la lista.', example: 'Sortear 278 pacientes de la lista de 1.000.' },
                { id: 'est', label: 'Estratificado', what: 'Se divide en grupos (estratos) y se sortea en cada uno, en proporción.', example: 'Sortear estudiantes por cada grado.' },
                { id: 'sis', label: 'Sistemático', what: 'Se elige uno cada k elementos de la lista.', example: 'Uno de cada 4 pacientes en orden de llegada.' },
                { id: 'con', label: 'Por conglomerados', what: 'Se sortean grupos completos.', example: 'Sortear 5 de 20 colegios y encuestar a todos sus estudiantes de noveno.' },
            ],
        },
    },
    {
        id: 'pob-noprob', section: 'poblacion', min: 4, title: 'Muestreo no probabilístico',
        lead: ['Los participantes se eligen por criterios del investigador. No permite generalizar estadísticamente, pero es útil sin lista completa o en estudios cualitativos. Se justifica, no se calcula.'],
        panel: {
            type: 'tabs', title: 'Tipos', items: [
                { id: 'conv', label: 'Por conveniencia', what: 'Los disponibles y accesibles.', example: 'Los pacientes en sala de espera durante la semana de recolección.' },
                { id: 'int', label: 'Intencional', what: 'Los que cumplen características definidas.', example: 'Docentes con más de 5 años en educación virtual.' },
                { id: 'bola', label: 'Bola de nieve', what: 'Los participantes recomiendan a otros.', example: 'Estudiantes que desertaron, contactados por sus compañeros.' },
                { id: 'censo', label: 'Censo', what: 'Toda la población, si es pequeña y accesible.', example: 'Los 35 trabajadores de una empresa.' },
            ],
        },
    },
    {
        id: 'pob-cuali', section: 'poblacion', min: 3, title: '¿Cuántos en un estudio cualitativo?',
        lead: ['En lo cualitativo no se calcula la muestra: se incluyen participantes hasta la **saturación**, el punto en que nuevas entrevistas ya no aportan información nueva.'],
        bullets: ['Fenomenológico: entre 5 y 25 participantes.', 'Estudio de caso: uno o pocos casos, en profundidad.', 'Grupo focal: de 6 a 10 personas por grupo.'],
        panel: { type: 'example', title: 'Así se redacta', paragraphs: ['Se entrevistará a docentes con más de cinco años de experiencia en educación virtual, seleccionados de manera intencional, hasta alcanzar la saturación de la información; se estima un total de entre 10 y 15 participantes.'] },
    },
    {
        id: 'pob-ejemplo', section: 'poblacion', min: 3, title: 'Población y muestra redactadas',
        lead: ['Así queda el subtítulo completo en un estudio cuantitativo.'],
        panel: { type: 'example', title: 'Ejemplo', paragraphs: ['La población está conformada por los 1.000 pacientes de consulta externa de un hospital de Sincelejo con cita programada en el primer semestre de 2026. La unidad de análisis corresponde a los pacientes. Criterios de inclusión: mayores de 18 años con al menos una cita en el periodo, que acepten participar. Criterios de exclusión: pacientes de urgencias u hospitalización. El tamaño de la muestra se calculó con la fórmula para población finita, con un nivel de confianza del 95 % y un margen de error del 5 %, lo que da 278 pacientes, elegidos por muestreo aleatorio simple.'] },
    },
    {
        id: 'pob-quiz', section: 'poblacion', min: 3, title: '¿Qué muestreo usarías?',
        lead: ['Decide en cada situación.'],
        quiz: [
            q('Tienes la lista de los 1.200 estudiantes y quieres generalizar.', ['Por conveniencia', 'Aleatorio simple', 'Bola de nieve'], 1, 'Con lista completa y deseo de generalizar, uno probabilístico.'),
            q('Quieres entrevistar a personas que dejaron la universidad y no hay lista.', ['Bola de nieve', 'Estratificado', 'Sistemático'], 0, 'Los participantes recomiendan a otros.'),
            q('La empresa tiene 30 trabajadores y todos aceptan participar.', ['Censo', 'Conglomerados', 'Aleatorio simple'], 0, 'Si es pequeña y accesible, se estudia toda.'),
        ],
    },

    /* ---------- Instrumentos (25) ---------- */
    {
        id: 'ins-quees', section: 'instrumentos', min: 4, title: 'Técnicas e instrumentos de recolección',
        lead: ['Define los instrumentos que se usarán en las etapas de análisis e identificación del problema. La técnica es el procedimiento; el instrumento, la herramienta concreta.'],
        panel: {
            type: 'table', title: 'Técnica → instrumento', head: ['Técnica', 'Instrumento', 'Cuándo usarla'], rows: [
                ['Encuesta', 'Cuestionario', 'Muchas personas, datos numéricos.'],
                ['Entrevista', 'Guía de entrevista', 'Pocas personas, profundidad.'],
                ['Observación', 'Lista de chequeo o guía', 'Conductas o procesos tal como ocurren.'],
                ['Grupo focal', 'Guía de grupo focal', 'Conversación de 6 a 10 personas.'],
                ['Revisión documental', 'Ficha de registro', 'Datos de registros, historias o bases de datos.'],
                ['Prueba o test', 'Prueba estandarizada', 'Conocimientos, habilidades o rasgos.'],
            ],
        },
    },
    {
        id: 'ins-cuestionario', section: 'instrumentos', min: 5, title: 'Encuesta y cuestionario',
        lead: ['Un cuestionario tiene instrucciones, datos generales y preguntas agrupadas por variable. Usa preguntas claras, de una sola idea y sin inducir la respuesta.'],
        bullets: ['Cerradas dicotómicas: sí / no.', 'Opción múltiple: elegir una o varias.', 'Escala Likert: de «totalmente en desacuerdo» a «totalmente de acuerdo».', 'Abiertas: pocas, solo cuando hace falta.'],
        panel: {
            type: 'example', title: 'Ítems de ejemplo', paragraphs: [
                '1. ¿Cuántas citas programadas ha perdido en los últimos seis meses? ( ) Ninguna ( ) 1 ( ) 2 o más',
                '2. Olvidé la fecha de mi última cita. ( ) Totalmente en desacuerdo … ( ) Totalmente de acuerdo',
                '3. El costo del transporte me impide asistir a mis citas. ( ) Nunca ( ) A veces ( ) Siempre',
            ],
        },
    },
    {
        id: 'ins-entrevista', section: 'instrumentos', min: 4, title: 'Entrevista y grupo focal',
        lead: ['La guía de entrevista semiestructurada tiene preguntas abiertas por tema, que se pueden ampliar según las respuestas.'],
        panel: {
            type: 'example', title: 'Preguntas de ejemplo', paragraphs: [
                '- Cuénteme cómo fue la última vez que no pudo asistir a una cita.',
                '- ¿Qué cosas le dificultan llegar al hospital?',
                '- ¿Qué haría que le resultara más fácil asistir?',
            ],
        },
    },
    {
        id: 'ins-observacion', section: 'instrumentos', min: 3, title: 'Observación y revisión documental',
        lead: ['La observación registra lo que ocurre; la revisión documental extrae datos de registros existentes.'],
        panel: {
            type: 'table', title: 'Ejemplos', head: ['Técnica', 'Ejemplo de instrumento'], rows: [
                ['Observación', 'Lista de chequeo con 15 conductas de los estudiantes en clase (sí/no).'],
                ['Revisión documental', 'Ficha con fecha de cita, edad, régimen y asistencia, tomada del sistema de citas.'],
            ],
        },
    },
    {
        id: 'ins-validez', section: 'instrumentos', min: 4, title: 'Validez y confiabilidad',
        lead: ['Un instrumento es **válido** si mide lo que dice medir y **confiable** si da resultados consistentes.'],
        panel: {
            type: 'chain', title: 'Cómo asegurarlas', items: [
                { label: 'Juicio de expertos', text: 'Tres a cinco expertos revisan la pertinencia y claridad de cada ítem.' },
                { label: 'Prueba piloto', text: 'Se aplica a un grupo pequeño parecido a la población y se ajusta.' },
                { label: 'Alfa de Cronbach', text: 'Mide la consistencia interna de una escala; aceptable desde 0,7.' },
                { label: 'Instrumento ya validado', text: 'Usa uno de tus antecedentes, adáptalo y cita al autor.' },
            ],
        },
    },
    {
        id: 'ins-etica', section: 'instrumentos', min: 3, title: 'Ética: consentimiento y datos',
        lead: ['Toda investigación con personas debe protegerlas.'],
        bullets: ['Consentimiento informado: cada participante acepta por escrito y puede retirarse.', 'Confidencialidad: datos anonimizados y guardados de forma segura (Ley 1581 de 2012).', 'En salud, la Resolución 8430 de 1993 clasifica el riesgo de la investigación.', 'Con menores: consentimiento de los acudientes y asentimiento del menor.'],
        panel: { type: 'example', title: 'Frase para el consentimiento', paragraphs: ['Su participación es voluntaria y anónima. Puede retirarse en cualquier momento sin consecuencias. Los datos se usarán solo con fines académicos.'] },
    },
    {
        id: 'ins-quiz', section: 'instrumentos', min: 2, title: 'Técnica o instrumento',
        lead: ['Comprueba la diferencia.'],
        quiz: [
            q('«Cuestionario de 20 preguntas con escala Likert.»', ['Técnica', 'Instrumento'], 1, 'Es la herramienta; la técnica es la encuesta.'),
            q('«Entrevista semiestructurada.»', ['Técnica', 'Instrumento'], 0, 'Es el procedimiento; el instrumento es la guía.'),
        ],
    },

    /* ---------- Plan de análisis (25) ---------- */
    {
        id: 'an-quees', section: 'analisis', min: 4, title: 'Plan de análisis de la información',
        lead: ['Es un mapa de ruta sobre cómo organizar y analizar los datos. También puede verse como un proceso cíclico de selección, categorización, comparación, validación e interpretación en todas las fases de la investigación, que permite comprender mejor la necesidad estudiada.'],
        panel: {
            type: 'chain', title: 'Del dato al resultado', items: [
                { label: 'Organizar', text: 'Digitar, depurar y codificar los datos.' },
                { label: 'Describir', text: 'Tablas, gráficos y medidas.' },
                { label: 'Analizar', text: 'Relaciones, diferencias o categorías.' },
                { label: 'Interpretar', text: 'Responder cada objetivo y compararlo con los antecedentes.' },
            ],
        },
    },
    {
        id: 'an-descriptivo', section: 'analisis', min: 4, title: 'Análisis descriptivo',
        lead: ['Resume los datos según el tipo de variable.'],
        panel: {
            type: 'table', title: 'Qué usar según la variable', head: ['Variable', 'Medidas', 'Gráfico'], rows: [
                ['Cualitativa (sexo, régimen)', 'Frecuencias y porcentajes', 'Barras o sectores'],
                ['Ordinal (escala Likert)', 'Frecuencias, mediana', 'Barras apiladas'],
                ['Cuantitativa (edad, nota)', 'Media, desviación estándar, mínimo y máximo', 'Histograma o caja'],
            ],
        },
    },
    {
        id: 'an-inferencial', section: 'analisis', min: 5, title: 'Análisis inferencial: qué prueba usar',
        lead: ['Elige la prueba según lo que quieras saber y el tipo de variables.'],
        panel: {
            type: 'table', title: 'Pruebas frecuentes', head: ['Quieres saber…', 'Variables', 'Prueba'], rows: [
                ['Si dos variables se relacionan', 'Dos cualitativas', 'Chi cuadrado'],
                ['Si dos variables se relacionan', 'Dos cuantitativas', 'Pearson (normal) o Spearman'],
                ['Si dos grupos son diferentes', 'Una cuantitativa y dos grupos', 't de Student o U de Mann-Whitney'],
                ['Si tres o más grupos son diferentes', 'Una cuantitativa y 3+ grupos', 'ANOVA o Kruskal-Wallis'],
                ['Qué factores predicen un resultado', 'Varias independientes', 'Regresión lineal o logística'],
            ],
        },
    },
    {
        id: 'an-cualitativo', section: 'analisis', min: 4, title: 'Análisis cualitativo',
        lead: ['Los textos se codifican y agrupan en categorías.'],
        panel: {
            type: 'chain', title: 'Tres momentos de la codificación', items: [
                { label: 'Abierta', text: 'Se marcan fragmentos con códigos: «olvido», «costo del bus», «no me avisaron».' },
                { label: 'Axial', text: 'Los códigos se agrupan en categorías: «barreras económicas», «barreras de información».' },
                { label: 'Selectiva', text: 'Se identifica la categoría central que explica el fenómeno.' },
            ],
        },
    },
    {
        id: 'an-software', section: 'analisis', min: 3, title: 'Software de análisis',
        lead: ['Elige un software que tu universidad tenga o que sea gratuito.'],
        panel: {
            type: 'tabs', title: 'Opciones', items: [
                { id: 'excel', label: 'Excel', what: 'Tablas y gráficos descriptivos.', example: 'Ideal para empezar.' },
                { id: 'jamovi', label: 'Jamovi / JASP', what: 'Estadística descriptiva e inferencial, gratuitos y sencillos.', example: 'Correlaciones, t de Student, chi cuadrado.' },
                { id: 'spss', label: 'SPSS', what: 'Estadística completa; licencia de pago.', example: 'Disponible en muchas universidades.' },
                { id: 'r', label: 'R / Python', what: 'Análisis avanzado y analítica de datos.', example: 'Para especializaciones en analítica.' },
                { id: 'atlas', label: 'Atlas.ti / NVivo / Taguette', what: 'Análisis cualitativo; Taguette es gratuito.', example: 'Codificación de entrevistas.' },
            ],
        },
    },
    {
        id: 'an-matriz', section: 'analisis', min: 5, title: 'Matriz de consistencia',
        lead: ['Conecta cada objetivo específico con su técnica, su instrumento y su análisis. Si una fila queda vacía, falta algo en tu método.'],
        panel: {
            type: 'table', title: 'Ejemplo de matriz', head: ['Objetivo específico', 'Técnica e instrumento', 'Análisis'], rows: [
                ['Caracterizar la inasistencia', 'Revisión documental · ficha de registro', 'Frecuencias y porcentajes'],
                ['Identificar las causas reportadas', 'Encuesta · cuestionario', 'Estadística descriptiva'],
                ['Establecer la relación entre olvido e inasistencia', 'Encuesta · cuestionario', 'Chi cuadrado o Spearman'],
            ],
        },
    },

    /* ---------- Cronograma (10) ---------- */
    {
        id: 'cro-quees', section: 'cronograma', min: 3, title: 'Cronograma',
        lead: ['El cronograma organiza en el tiempo todas las actividades necesarias para llevar a cabo el estudio. Es un plan detallado con las fechas de inicio y fin de cada etapa, que permite administrar el tiempo y cumplir los objetivos.'],
        panel: {
            type: 'chain', title: 'Fases típicas', items: [
                { label: 'Preparación', text: 'Ajustes de la propuesta, permisos, diseño y validación de instrumentos.' },
                { label: 'Recolección', text: 'Aplicación de instrumentos.' },
                { label: 'Análisis', text: 'Organización, análisis e interpretación.' },
                { label: 'Informe y socialización', text: 'Redacción, revisión y presentación.' },
            ],
        },
    },
    { id: 'gantt', section: 'cronograma', min: 4, title: 'El diagrama de Gantt' },
    {
        id: 'cro-consejos', section: 'cronograma', min: 3, title: 'Un cronograma realista',
        lead: ['Algunos consejos para que el cronograma se cumpla.'],
        bullets: ['Organiza las actividades por objetivo específico o por fase.', 'La recolección casi siempre tarda más de lo previsto: deja margen.', 'Incluye los permisos (aval, comité de ética) al inicio.', 'Deja tiempo para las correcciones del asesor.'],
        panel: { type: 'example', title: 'Error frecuente', paragraphs: ['Recolectar y analizar los datos de 278 encuestas en una semana. Mejor: tres semanas de recolección y dos de análisis.'] },
    },

    /* ---------- Presupuesto (13) ---------- */
    {
        id: 'pre-quees', section: 'presupuesto', min: 4, title: 'Presupuesto',
        lead: ['El presupuesto muestra el capital necesario para el proyecto: recursos humanos, infraestructura física, equipos como servidores locales, infraestructura cloud, materiales (encuestas, muestreos a una comunidad), viajes en proyectos aplicados o experimentales y bibliografía de pago, entre otros.', 'Cada rubro debe indicar su **fuente**: personal, universidad, institución o externa. Esta fuente se valora en todos los ítems.'],
        panel: {
            type: 'list', title: 'Rubros frecuentes', items: [
                { label: 'Recursos humanos', text: 'Horas del investigador, asesor, encuestadores, analistas.' },
                { label: 'Infraestructura física y equipos', text: 'Computadores, servidores locales, espacios.' },
                { label: 'Infraestructura cloud', text: 'Servicios en la nube, almacenamiento, licencias de plataformas.' },
                { label: 'Materiales y muestreos', text: 'Impresión de encuestas, aplicación en campo.' },
                { label: 'Viajes', text: 'Transporte y viáticos para el trabajo de campo.' },
                { label: 'Bibliografía y licencias', text: 'Artículos, libros y software de pago.' },
            ],
        },
    },
    {
        id: 'pre-ejemplo', section: 'presupuesto', min: 5, title: 'Un presupuesto de ejemplo',
        lead: ['Los valores son ilustrativos: usa los de tu contexto. Incluye los aportes propios y de la institución, aunque no impliquen pagos.'],
        panel: {
            type: 'table', title: 'Presupuesto (pesos colombianos)', head: ['Rubro', 'Descripción', 'Fuente', 'Costo'], rows: [
                ['Recursos Humanos', 'Investigador: 120 horas', 'Personal', '$ 3.600.000'],
                ['Recursos Humanos', 'Asesoría: 20 horas', 'Universidad', '$ 1.200.000'],
                ['Infraestructura Cloud', 'Almacenamiento y cómputo, 6 meses', 'Personal', '$ 300.000'],
                ['Materiales/Muestreos', 'Impresión de 300 cuestionarios', 'Personal', '$ 150.000'],
                ['Viajes', 'Transporte a la institución, 10 visitas', 'Personal', '$ 200.000'],
                ['Bibliografía/Licencias', 'Licencia de software estadístico', 'Universidad', '$ 0 (licencia institucional)'],
            ],
        },
    },
    {
        id: 'pre-estimar', section: 'presupuesto', min: 4, title: 'Cómo estimar los costos',
        lead: ['Cada valor debe poder justificarse.'],
        panel: {
            type: 'chain', title: 'Tres formas de estimar', items: [
                { label: 'Horas × valor', text: 'Recursos humanos: horas dedicadas por el valor de la hora según el perfil.' },
                { label: 'Cotizaciones', text: 'Equipos, servicios y materiales: precio de mercado de al menos un proveedor.' },
                { label: 'Tarifas publicadas', text: 'Servicios cloud y licencias: precio oficial por mes o por uso.' },
            ],
        },
    },

    /* ---------- Calidad (10) ---------- */
    {
        id: 'errores', section: 'calidad', min: 4, title: 'Diez errores frecuentes',
        lead: ['Revisa si tu metodología cae en alguno de estos errores.'],
        panel: {
            type: 'accordion', title: 'Abre cada error para ver cómo corregirlo', items: [
                { error: 'Enfoque que no corresponde a los objetivos', example: 'Medir porcentajes con un enfoque cualitativo.', fix: 'Si mides, cuantitativo; si comprendes, cualitativo.' },
                { error: 'Tipo distinto al alcance', example: 'Decir «explicativa» cuando los objetivos solo describen.', fix: 'Usa el nivel que declaraste en los alcances.' },
                { error: 'Diseño de otro enfoque', example: 'Enfoque cuantitativo con diseño fenomenológico.', fix: 'Elige el diseño dentro de tu enfoque.' },
                { error: 'Población vaga', example: '«Los jóvenes».', fix: 'Quiénes, dónde, cuándo y cuántos, con criterios.' },
                { error: 'Muestra sin justificar', example: '«Se encuestará a 50 personas».', fix: 'Calcúlala o justifica el muestreo no probabilístico.' },
                { error: 'Instrumentos sin validez', example: 'Un cuestionario sin revisar.', fix: 'Juicio de expertos, prueba piloto o instrumento validado.' },
                { error: 'Análisis que no responde los objetivos', example: 'Solo porcentajes cuando el objetivo pide relacionar.', fix: 'Una técnica de análisis por objetivo.' },
                { error: 'Olvidar la ética', example: 'Encuestar sin consentimiento.', fix: 'Consentimiento informado y protección de datos.' },
                { error: 'Cronograma irreal', example: 'Todo en un mes.', fix: 'Reparte el tiempo por fases y deja margen.' },
                { error: 'Presupuesto en cero o sin fuentes', example: '«No requiere recursos».', fix: 'Valora todos los recursos, con su fuente.' },
            ],
        },
    },
    {
        id: 'juzga', section: 'calidad', min: 3, title: '¿Es coherente este método?',
        lead: ['Lee cada objetivo con su método y decide.'],
        quiz: [
            q('Objetivo: «Comprender las experiencias de las madres cabeza de hogar…». Método: encuesta cerrada a 400 madres y regresión.', ['Coherente', 'No coherente'], 1, 'Comprender experiencias pide un enfoque cualitativo.'),
            q('Objetivo: «Determinar la relación entre el uso del celular y el rendimiento…». Método: cuantitativo, correlacional, no experimental transversal, muestra aleatoria y Spearman.', ['Coherente', 'No coherente'], 0, 'Cada decisión responde al objetivo.'),
        ],
    },
    {
        id: 'coherencia', section: 'calidad', min: 3, title: 'La metodología y el resto del proyecto',
        lead: ['La metodología debe coincidir con lo que ya escribiste.'],
        panel: {
            type: 'chain', title: 'Preguntas de control', items: [
                { label: 'Objetivos', text: '¿Cada objetivo específico tiene técnica, instrumento y análisis?' },
                { label: 'Alcances', text: '¿El tipo de investigación es el mismo nivel del alcance?' },
                { label: 'Título', text: '¿La población y el lugar son los mismos?' },
                { label: 'Marco referencial', text: '¿Usas instrumentos o variables de tus antecedentes y teorías?' },
            ],
        },
    },

    /* ---------- Cierre (5) ---------- */
    {
        id: 'repaso', section: 'cierre', min: 3, title: 'Repaso',
        lead: ['Cuatro preguntas para comprobar lo aprendido.'],
        quiz: [
            q('¿Qué define el tipo de investigación?', ['El tamaño de la muestra', 'Lo que quieres lograr según tus objetivos', 'El software'], 1, 'Es el mismo nivel del alcance.'),
            q('¿Cuándo se calcula la muestra con una fórmula?', ['Siempre', 'Con muestreo probabilístico', 'Nunca'], 1, 'Los no probabilísticos se justifican.'),
            q('¿Qué diferencia al diseño cuasiexperimental del experimental?', ['No hay intervención', 'No hay asignación al azar', 'No hay mediciones'], 1, 'Trabaja con grupos ya formados.'),
            q('¿Qué debe indicar cada rubro del presupuesto?', ['Solo el costo', 'El costo y su fuente', 'Solo la fuente'], 1, 'La fuente se valora en todos los ítems.'),
        ],
    },
    {
        id: 'cierre', section: 'cierre', min: 2, title: 'Lo que te llevas',
        bullets: [
            'Enfoque: cuantitativo, cualitativo o mixto, según tus objetivos.',
            'Tipo: el mismo nivel de tus alcances.',
            'Diseño: experimental, cuasiexperimental o no experimental; o un diseño cualitativo o mixto.',
            'Población delimitada y muestra calculada o justificada.',
            'Instrumentos válidos y un análisis por objetivo.',
            'Cronograma por fases y presupuesto con fuentes.',
        ],
        status: true,
    },

    /* ---------- Construcción y revisión (30) ---------- */
    { id: 'construye', section: 'construccion', min: 25, title: 'Construye tu metodología', layout: 'builder' },
    { id: 'revision', section: 'revision', min: 5, title: 'Qué hace buena a una metodología' },
]);
