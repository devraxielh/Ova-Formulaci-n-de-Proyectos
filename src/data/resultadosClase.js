import { construccionPrimero } from '../components/deck/orden.js';
/*
 * Clase «Resultados y discusión» (2 horas).
 * Las diapositivas 'portada', 'construye' y 'revision' se pintan aparte en el componente.
 */

export const SECTIONS = construccionPrimero([
    { id: 'apertura', label: 'Apertura' },
    { id: 'resultados', label: 'Resultados' },
    { id: 'discusion', label: 'Discusión' },
    { id: 'calidad', label: 'Calidad' },
    { id: 'cierre', label: 'Cierre' },
    { id: 'construccion', label: 'Construcción' },
    { id: 'revision', label: 'Revisión final' },
]);

const q = (text, options, answer, why) => ({ text, options, answer, why });

export const SLIDES = construccionPrimero([
    /* ---------- Apertura (12) ---------- */
    { id: 'portada', section: 'apertura', min: 3, title: 'Resultados y discusión: qué encontraste y qué significa' },
    {
        id: 'quees', section: 'apertura', min: 3, title: 'Resultados, discusión y conclusiones',
        lead: ['Son tres secciones distintas que suelen confundirse.'],
        panel: {
            type: 'table', title: 'Qué responde cada una', head: ['Sección', 'Responde', 'Ejemplo'], rows: [
                ['Resultados', '¿Qué encontré?', 'El 22 % de las citas se perdió; el olvido fue la causa más frecuente (41 %).'],
                ['Discusión', '¿Qué significa y cómo se compara?', 'Este resultado coincide con Pérez y Gómez (2022) y se explica por las barreras percibidas.'],
                ['Conclusiones', '¿Qué respondo a cada objetivo?', 'El olvido es el principal factor asociado a la inasistencia en esta población.'],
            ],
        },
    },
    {
        id: 'imryd', section: 'apertura', min: 3, title: 'Dónde van en el informe',
        lead: ['Los informes y artículos científicos siguen la estructura IMRyD: Introducción, Método, Resultados y Discusión. En la propuesta, esta sección se planea; en el informe final, se escribe con los datos reales.'],
        panel: {
            type: 'chain', title: 'IMRyD', items: [
                { label: 'Introducción', text: '¿Por qué y para qué se hizo el estudio?' },
                { label: 'Método', text: '¿Cómo se hizo?' },
                { label: 'Resultados', text: '¿Qué se encontró?' },
                { label: 'Discusión', text: '¿Qué significa?' },
            ],
        },
    },
    {
        id: 'quiz-apertura', section: 'apertura', min: 3, title: '¿Resultado o discusión?',
        lead: ['Clasifica cada fragmento.'],
        quiz: [
            q('«El 62 % de los estudiantes usa el celular más de tres horas al día.»', ['Resultado', 'Discusión'], 0, 'Reporta un dato sin interpretarlo.'),
            q('«Este hallazgo coincide con Rodríguez (2022), quien encontró una relación negativa entre el uso del celular y el rendimiento.»', ['Resultado', 'Discusión'], 1, 'Compara con un antecedente: es discusión.'),
        ],
    },

    /* ---------- Resultados (40) ---------- */
    {
        id: 'res-organizar', section: 'resultados', min: 4, title: 'Organiza los resultados por objetivo',
        lead: ['La forma más clara de presentar los resultados es un apartado por cada objetivo específico, en el mismo orden.'],
        panel: {
            type: 'chain', title: 'Un apartado por objetivo', items: [
                { label: 'Objetivo 1', text: 'Caracterización de la inasistencia → perfil de los pacientes y frecuencia.' },
                { label: 'Objetivo 2', text: 'Relación entre el olvido y la inasistencia → prueba estadística.' },
                { label: 'Objetivo 3', text: 'Propuesta → estrategia diseñada y su validación.' },
            ],
        },
    },
    {
        id: 'res-que', section: 'resultados', min: 4, title: 'Qué va en los resultados',
        lead: ['Los resultados describen lo encontrado, sin interpretarlo ni compararlo. Se escriben en pasado.'],
        bullets: ['Sí: datos, cifras, tablas, figuras y citas de los participantes.', 'Sí: el resultado de las pruebas estadísticas.', 'No: opiniones, explicaciones ni comparaciones con otros autores (eso va en la discusión).', 'No: repetir la metodología.'],
        panel: {
            type: 'table', title: 'Resultados en pasado', head: ['Evita', 'Prefiere'], rows: [
                ['Los pacientes olvidan sus citas.', 'El 41 % de los pacientes olvidó su cita.'],
                ['Se encontrará una relación.', 'Se encontró una relación positiva moderada.'],
                ['Claramente, el olvido es lo peor.', 'El olvido fue la causa más frecuente.'],
            ],
        },
    },
    {
        id: 'res-tablas', section: 'resultados', min: 5, title: 'Tablas en APA 7',
        lead: ['Cada tabla lleva número en negrita, título en cursiva en la línea siguiente, el cuerpo y una nota si hace falta. Se menciona en el texto antes de aparecer.'],
        bullets: ['**Tabla 1** (en negrita).', 'Título en cursiva, breve y descriptivo.', 'Sin líneas verticales.', 'Nota debajo: fuente o abreviaturas.'],
        panel: {
            type: 'table', title: 'Tabla 1 · Causas de inasistencia reportadas (n = 278)', head: ['Causa', 'Frecuencia', '%'], rows: [
                ['Olvido de la cita', '114', '41,0'],
                ['Costo del transporte', '61', '21,9'],
                ['Horario laboral', '50', '18,0'],
                ['Otras', '53', '19,1'],
            ],
        },
        hint: 'Nota. Elaboración propia a partir de la encuesta aplicada (datos ilustrativos).',
    },
    {
        id: 'res-figuras', section: 'resultados', min: 4, title: 'Figuras: qué gráfico usar',
        lead: ['Una figura muestra de un vistazo lo que una tabla muestra en detalle. No repitas la misma información en tabla y figura.'],
        panel: {
            type: 'table', title: 'Gráfico según lo que quieres mostrar', head: ['Quieres mostrar', 'Gráfico'], rows: [
                ['Frecuencias de categorías', 'Barras'],
                ['Partes de un todo (pocas categorías)', 'Sectores o barras apiladas'],
                ['Distribución de una variable numérica', 'Histograma o caja'],
                ['Relación entre dos variables numéricas', 'Dispersión'],
                ['Cambio en el tiempo', 'Líneas'],
            ],
        },
    },
    {
        id: 'res-describir', section: 'resultados', min: 5, title: 'Describir una tabla sin repetirla',
        lead: ['El texto no repite todos los datos de la tabla: destaca lo más importante y remite a ella.'],
        panel: {
            type: 'table', title: 'Débil y fuerte', head: ['Débil', 'Fuerte'], rows: [
                ['En la tabla 1 se ve que 114 olvidaron, 61 por transporte, 50 por horario y 53 por otras.', 'Como se observa en la tabla 1, el olvido fue la causa más frecuente de inasistencia (41,0 %), seguido del costo del transporte (21,9 %).'],
                ['La tabla muestra los datos.', 'La tabla 2 muestra que la inasistencia fue mayor en los pacientes menores de 30 años.'],
            ],
        },
    },
    {
        id: 'res-estadisticos', section: 'resultados', min: 4, title: 'Reportar estadísticos en APA',
        lead: ['Las pruebas se reportan con su estadístico, grados de libertad (si aplica), valor p y, cuando sea posible, el tamaño del efecto. Los símbolos estadísticos van en cursiva.'],
        panel: {
            type: 'table', title: 'Formatos frecuentes', head: ['Prueba', 'Cómo se reporta'], rows: [
                ['Media y desviación', 'M = 46,8; DE = 12,3'],
                ['Correlación', 'rho = 0,41; p < 0,001'],
                ['Chi cuadrado', 'χ²(2, N = 278) = 12,4; p = 0,002'],
                ['t de Student', 't(276) = 3,15; p = 0,002; d = 0,38'],
            ],
        },
    },
    {
        id: 'res-cuanti', section: 'resultados', min: 5, title: 'Ejemplo de resultados cuantitativos',
        lead: ['Así se ve un apartado de resultados con su objetivo, su tabla y su prueba. Datos ilustrativos.'],
        panel: {
            type: 'example', title: 'Objetivo 2: relación entre el olvido y la inasistencia', paragraphs: [
                'Se encontró una relación positiva moderada entre la frecuencia con que los pacientes olvidan sus citas y el número de citas perdidas en el semestre (rho = 0,41; p < 0,001).',
                'Como se observa en la tabla 3, los pacientes que no recibieron recordatorio presentaron una inasistencia mayor (28,4 %) que quienes sí lo recibieron (12,1 %).',
            ],
        },
    },
    {
        id: 'res-cuali', section: 'resultados', min: 5, title: 'Ejemplo de resultados cualitativos',
        lead: ['En lo cualitativo, los resultados se organizan por categorías y se ilustran con citas textuales de los participantes, identificados con un código.'],
        panel: {
            type: 'example', title: 'Categoría: barreras de transporte', paragraphs: [
                'Los participantes de la zona rural describieron el transporte como la principal razón para no asistir. Varios señalaron que el costo del viaje equivale a un día de trabajo:',
                '«Si voy a la cita pierdo el día y la plata del bus; a veces prefiero no ir» (P3, 54 años).',
                'Esta barrera fue mencionada por 9 de los 12 participantes.',
            ],
        },
    },
    {
        id: 'res-quiz', section: 'resultados', min: 4, title: '¿Está bien escrito este resultado?',
        lead: ['Decide si cada fragmento está bien escrito como resultado.'],
        quiz: [
            q('«Como se observa en la tabla 2, el 58 % de los tenderos usa al menos un medio de pago digital.»', ['Bien escrito', 'Hay que mejorarlo'], 0, 'Reporta el dato principal y remite a la tabla.'),
            q('«Es increíble que tan pocos docentes usen la plataforma; seguramente es por pereza.»', ['Bien escrito', 'Hay que mejorarlo'], 1, 'Opina e interpreta sin evidencia. Reporta el dato.'),
            q('«Se usó un muestreo aleatorio simple con 278 pacientes.»', ['Bien escrito', 'Hay que mejorarlo'], 1, 'Es metodología, no un resultado.'),
        ],
    },

    /* ---------- Discusión (36) ---------- */
    {
        id: 'dis-quees', section: 'discusion', min: 4, title: 'Qué es la discusión',
        lead: ['La discusión interpreta los resultados: explica qué significan, los compara con los antecedentes y las teorías, señala sus implicaciones y reconoce sus límites. Es la sección donde el investigador piensa.'],
        bullets: ['No repite los resultados: los retoma en una oración.', 'Sigue el orden de los objetivos.', 'Usa las fuentes del marco referencial.'],
        panel: {
            type: 'chain', title: 'Preguntas que responde', items: [
                { label: '¿Qué significa?', text: 'Interpretación del hallazgo.' },
                { label: '¿Coincide con otros?', text: 'Comparación con los antecedentes.' },
                { label: '¿Por qué ocurre?', text: 'Explicación desde la teoría.' },
                { label: '¿Para qué sirve?', text: 'Implicaciones prácticas y teóricas.' },
            ],
        },
    },
    {
        id: 'dis-estructura', section: 'discusion', min: 5, title: 'Los cinco movimientos de la discusión',
        lead: ['Cada hallazgo importante se discute en cinco movimientos.'],
        panel: {
            type: 'tabs', title: 'Movimientos', items: [
                { id: 'h', label: '1. Hallazgo', what: 'Retoma el resultado principal en una oración.', example: 'Los resultados mostraron que el olvido fue el principal factor asociado a la inasistencia.' },
                { id: 'i', label: '2. Interpretación', what: 'Di qué significa.', example: 'Esto sugiere que la inasistencia depende más de la organización de la cita que de la voluntad del paciente.' },
                { id: 'c', label: '3. Comparación', what: 'Compara con los antecedentes: coincide o difiere, y por qué.', example: 'Este hallazgo coincide con Pérez y Gómez (2022), quienes reportaron que el olvido explicó el 41 % de las citas perdidas en Bogotá.' },
                { id: 't', label: '4. Teoría', what: 'Explica el hallazgo con tu marco teórico.', example: 'Desde el modelo de creencias en salud (Rosenstock, 1974), la falta de recordatorios equivale a la ausencia de señales para la acción.' },
                { id: 'im', label: '5. Implicación', what: 'Di qué se puede hacer con este conocimiento.', example: 'Implementar recordatorios automáticos podría reducir la inasistencia.' },
            ],
        },
    },
    {
        id: 'dis-comparar', section: 'discusion', min: 5, title: 'Comparar con los antecedentes',
        lead: ['Los antecedentes que presentaste en el marco referencial vuelven aquí. Usa conectores de coincidencia y de diferencia.'],
        panel: {
            type: 'table', title: 'Conectores', head: ['Para…', 'Usa'], rows: [
                ['Coincidir', 'Este hallazgo coincide con… · En la misma línea… · De forma similar, … encontró…'],
                ['Diferir', 'A diferencia de… · Este resultado contrasta con… · Por el contrario, …'],
                ['Ampliar', 'Este estudio amplía lo reportado por… al mostrar que…'],
            ],
        },
    },
    {
        id: 'dis-diferencias', section: 'discusion', min: 4, title: 'Cuando tus resultados son distintos',
        lead: ['Un resultado distinto a los antecedentes no es un error: es una oportunidad para explicar. Propón razones posibles.'],
        panel: {
            type: 'list', title: 'Explicaciones posibles', items: [
                { label: 'Contexto', text: 'Población, región o institución distintas.' },
                { label: 'Método', text: 'Otro instrumento, tamaño de muestra o tipo de análisis.' },
                { label: 'Tiempo', text: 'El estudio se hizo en otro momento (por ejemplo, antes de la pandemia).' },
                { label: 'Variables', text: 'Se midieron variables que el otro estudio no consideró.' },
            ],
        },
    },
    {
        id: 'dis-implicaciones', section: 'discusion', min: 4, title: 'Implicaciones prácticas y teóricas',
        lead: ['Las implicaciones dicen para qué sirve lo que encontraste.'],
        panel: {
            type: 'tabs', title: 'Dos tipos', items: [
                { id: 'p', label: 'Prácticas', what: 'Qué decisiones o acciones pueden tomar las personas o instituciones con tus resultados.', example: 'La oficina de atención al usuario podría priorizar recordatorios para los pacientes menores de 30 años.' },
                { id: 't', label: 'Teóricas', what: 'Qué aporta tu estudio al conocimiento o a la teoría.', example: 'Los resultados respaldan el papel de las señales para la acción en la asistencia a controles médicos.' },
            ],
        },
    },
    {
        id: 'dis-limites', section: 'discusion', min: 5, title: 'Limitaciones y futuras investigaciones',
        lead: ['Cierra la discusión reconociendo los límites del estudio y proponiendo lo que debería investigarse después.'],
        panel: {
            type: 'example', title: 'Ejemplo', paragraphs: [
                '**Limitaciones.** Los datos se obtuvieron por autorreporte, por lo que los participantes pudieron subestimar sus inasistencias. Además, la muestra provino de un solo hospital, lo que limita la generalización a otras instituciones.',
                '**Futuras investigaciones.** Se recomienda evaluar el efecto de los recordatorios por mensaje de texto mediante un diseño cuasiexperimental, e incluir hospitales de otros municipios de la región.',
            ],
        },
    },
    {
        id: 'dis-prudente', section: 'discusion', min: 4, title: 'Lenguaje prudente',
        lead: ['Una investigación rara vez «demuestra» algo de forma definitiva. Usa un lenguaje que refleje el alcance de tu estudio.'],
        panel: {
            type: 'table', title: 'Evita y prefiere', head: ['Evita', 'Prefiere'], rows: [
                ['Se demostró que el olvido causa la inasistencia.', 'Los resultados sugieren que el olvido está asociado a la inasistencia.'],
                ['Esto prueba que la estrategia funciona siempre.', 'La estrategia mostró un efecto favorable en esta población.'],
                ['Todos los pacientes…', 'La mayoría de los pacientes encuestados…'],
            ],
        },
    },
    {
        id: 'dis-ejemplo', section: 'discusion', min: 5, title: 'Una discusión completa',
        lead: ['Mira los cinco movimientos en un solo párrafo.'],
        panel: {
            type: 'example', title: 'Ejemplo', paragraphs: [
                'Los resultados mostraron que el olvido fue el principal factor asociado a la inasistencia. Esto sugiere que la inasistencia depende en buena medida de la organización de la cita. Este hallazgo coincide con Pérez y Gómez (2022), quienes reportaron que el olvido explicó el 41 % de las citas perdidas en una IPS de Bogotá, y contrasta con Díaz (2023), que encontró el transporte como principal barrera en la zona rural de Corozal; la diferencia podría explicarse porque la mayoría de los pacientes de este estudio vive en la zona urbana. Desde el modelo de creencias en salud (Rosenstock, 1974), la falta de recordatorios equivale a la ausencia de señales para la acción. En consecuencia, implementar recordatorios automáticos podría reducir la inasistencia.',
            ],
        },
    },

    /* ---------- Calidad (7) ---------- */
    {
        id: 'errores', section: 'calidad', min: 4, title: 'Ocho errores frecuentes',
        lead: ['Revisa si tus resultados y tu discusión caen en alguno.'],
        panel: {
            type: 'accordion', title: 'Abre cada error para ver cómo corregirlo', items: [
                { error: 'Mezclar resultados y discusión', example: 'Opinar en los resultados.', fix: 'Resultados: qué encontraste. Discusión: qué significa.' },
                { error: 'Resultados sin orden', example: 'Tablas sueltas sin relación con los objetivos.', fix: 'Un apartado por objetivo, en orden.' },
                { error: 'Tablas sin número ni título', example: 'Una tabla pegada sin identificar.', fix: 'Tabla N en negrita y título en cursiva.' },
                { error: 'Repetir la tabla en el texto', example: 'Escribir todos los datos de la tabla.', fix: 'Destaca lo principal y remite a la tabla.' },
                { error: 'Discusión sin antecedentes', example: 'Interpretar sin comparar con nadie.', fix: 'Compara cada hallazgo con al menos un antecedente.' },
                { error: 'Discusión sin teoría', example: 'No volver al marco teórico.', fix: 'Explica los hallazgos con tus teorías.' },
                { error: 'Conclusiones exageradas', example: '«Se demostró que…».', fix: 'Usa lenguaje prudente acorde al alcance.' },
                { error: 'Olvidar las limitaciones', example: 'Terminar sin reconocer los límites.', fix: 'Cierra con limitaciones y futuras investigaciones.' },
            ],
        },
    },
    {
        id: 'juzga', section: 'calidad', min: 3, title: '¿Está bien discutido?',
        lead: ['Decide si cada fragmento es una buena discusión.'],
        quiz: [
            q('«El 41 % olvidó su cita. Esto es muy grave.»', ['Buena discusión', 'Hay que mejorarla'], 1, 'Solo repite el dato y opina; falta comparar y explicar.'),
            q('«Este hallazgo coincide con Pérez y Gómez (2022) y puede explicarse por la ausencia de señales para la acción (Rosenstock, 1974).»', ['Buena discusión', 'Hay que mejorarla'], 0, 'Compara con un antecedente y explica con la teoría.'),
        ],
    },

    /* ---------- Cierre (5) ---------- */
    {
        id: 'repaso', section: 'cierre', min: 3, title: 'Repaso',
        lead: ['Tres preguntas para comprobar lo aprendido.'],
        quiz: [
            q('¿En qué tiempo verbal se escriben los resultados?', ['Futuro', 'Pasado', 'Presente'], 1, 'Describen lo que se encontró.'),
            q('¿Qué hace la discusión con los antecedentes?', ['Los ignora', 'Los compara con los resultados', 'Los copia'], 1, 'Muestra si coinciden o difieren, y por qué.'),
            q('¿Cómo se identifica una tabla en APA 7?', ['Tabla N en negrita y título en cursiva', 'Solo con un título', 'Con un número al final'], 0, 'Número en negrita y título en cursiva en la línea siguiente.'),
        ],
    },
    {
        id: 'cierre', section: 'cierre', min: 2, title: 'Lo que te llevas',
        bullets: [
            'Resultados: un apartado por objetivo, en pasado, con tablas y figuras en APA.',
            'Describe lo principal de cada tabla sin repetirla.',
            'Discusión: hallazgo, interpretación, comparación, teoría e implicación.',
            'Lenguaje prudente, limitaciones y futuras investigaciones.',
        ],
        status: true,
    },

    /* ---------- Construcción y revisión (20) ---------- */
    { id: 'construye', section: 'construccion', min: 15, title: 'Construye tus resultados y tu discusión', layout: 'builder' },
    { id: 'revision', section: 'revision', min: 5, title: 'Qué hace buenos a unos resultados y una discusión' },
]);
