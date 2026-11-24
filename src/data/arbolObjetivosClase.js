import { construccionPrimero } from '../components/deck/orden.js';
/*
 * Clase «Árbol de objetivos»: presentación de 40 minutos, más la construcción del árbol.
 * Las diapositivas 'portada' y 'construye' se pintan aparte en el componente.
 */

export const SECTIONS = construccionPrimero([
    { id: 'apertura', label: 'Apertura' },
    { id: 'partes', label: 'Las tres partes' },
    { id: 'pasos', label: 'Cómo se construye' },
    { id: 'errores', label: 'Errores frecuentes' },
    { id: 'cierre', label: 'Cierre' },
    { id: 'construccion', label: 'Construcción' },
]);

const q = (text, options, answer, why) => ({ text, options, answer, why });

export const SLIDES = construccionPrimero([
    /* ---------- Apertura (7) ---------- */
    { id: 'portada', section: 'apertura', min: 3, title: 'El árbol de objetivos: medios, objetivo y fines' },
    {
        id: 'quees', section: 'apertura', min: 2, title: 'El árbol del problema, en positivo',
        lead: [
            'El árbol de objetivos es el **mismo árbol del problema, convertido en la situación que quieres alcanzar**. Cada frase negativa se vuelve una frase positiva.',
            'Sirve para pasar de «qué anda mal» a «qué se quiere lograr», y de ahí salen tu objetivo general y tus objetivos específicos.',
        ],
        panel: {
            type: 'table', title: 'Cada nivel cambia de nombre', head: ['En el árbol del problema', 'En el árbol de objetivos'], rows: [
                ['Efectos (ramas)', '**Fines**: a qué contribuye lograr el objetivo.'],
                ['Problema central (tronco)', '**Objetivo central**: la situación deseada.'],
                ['Causas (raíces)', '**Medios**: lo que hay que hacer para lograrlo.'],
            ],
        },
    },
    {
        id: 'quiz-apertura', section: 'apertura', min: 2, title: '¿Medio, objetivo o fin?',
        lead: ['Ubica cada frase en el árbol de objetivos del hospital donde los pacientes faltaban a sus citas.'],
        quiz: [
            q('«Reducir la inasistencia de los pacientes a las citas de consulta externa.»', ['Medio', 'Objetivo central', 'Fin'], 1, 'Es el problema central puesto en positivo: el tronco.'),
            q('«Los pacientes reciben un recordatorio de su cita.»', ['Medio', 'Objetivo central', 'Fin'], 0, 'Es la causa «olvidan la fecha» resuelta: una raíz, un medio.'),
            q('«Se aprovechan los cupos de atención disponibles.»', ['Medio', 'Objetivo central', 'Fin'], 2, 'Es el efecto «se pierden cupos» en positivo: una rama, un fin.'),
        ],
    },

    /* ---------- Las tres partes (11) ---------- */
    {
        id: 'tronco', section: 'partes', min: 4, title: 'El tronco: el objetivo central',
        lead: ['Es el problema central **dado vuelta**: la misma población y el mismo lugar, pero con la situación resuelta. De él sale tu **objetivo general**.'],
        bullets: [
            'Conserva quiénes y dónde: no cambies de población.',
            'Dice el cambio que se busca, no la actividad que harás.',
            'Tiene que ser alcanzable con lo que está a tu alcance.',
        ],
        panel: {
            type: 'tabs', title: 'Del problema al objetivo', items: [
                { id: 'neg', label: 'Problema', what: 'La situación negativa de la que partes.', example: '«Alta inasistencia de los pacientes a las citas de consulta externa de un hospital de Sincelejo.»' },
                { id: 'mal', label: 'Mal convertido', what: 'Es una actividad, no un resultado: dice qué harás, no qué cambia.', example: '«Hacer una aplicación de citas.»' },
                { id: 'bien', label: 'Bien convertido', what: 'El mismo problema, resuelto, con su población y su lugar.', example: '«Reducir la inasistencia de los pacientes a las citas de consulta externa de un hospital de Sincelejo.»' },
            ],
        },
    },
    {
        id: 'raices', section: 'partes', min: 4, title: 'Las raíces: los medios',
        lead: [
            'Cada **causa** del problema se convierte en un **medio**: la condición que debe cumplirse para lograr el objetivo. Responden **¿cómo se logra?**',
            'De los medios salen tus **objetivos específicos**: basta ponerles un verbo en infinitivo.',
        ],
        panel: {
            type: 'table', title: 'De causa a medio, y de medio a objetivo específico', head: ['Causa', 'Medio', 'Objetivo específico'], rows: [
                ['Los pacientes olvidan la fecha', 'Los pacientes recuerdan su cita', '**Implementar** recordatorios de cita por mensaje de texto.'],
                ['Es difícil reprogramar por teléfono', 'Reprogramar la cita es sencillo', '**Diseñar** un canal de reprogramación en línea.'],
                ['El transporte rural es costoso', 'Las citas se ajustan al transporte disponible', '**Proponer** horarios acordes con las rutas rurales.'],
            ],
        },
    },
    {
        id: 'ramas', section: 'partes', min: 3, title: 'Las ramas: los fines',
        lead: ['Cada **efecto** se convierte en un **fin**: el beneficio que llega cuando se logra el objetivo. Responden **¿para qué se logra?** y alimentan tu justificación.'],
        panel: {
            type: 'table', title: 'De efecto a fin', head: ['Efecto', 'Fin'], rows: [
                ['Se pierden cupos de atención', 'Se aprovechan los cupos de atención.'],
                ['Aumentan los tiempos de espera', 'Disminuyen los tiempos de espera para una cita.'],
                ['Se interrumpen los tratamientos', 'Los pacientes dan continuidad a sus tratamientos.'],
            ],
        },
        hint: 'Los fines no los logra tu proyecto por sí solo: tu proyecto contribuye a ellos. Por eso no van como objetivos específicos.',
    },

    /* ---------- Cómo se construye (11) ---------- */
    {
        id: 'pasos', section: 'pasos', min: 4, title: 'Cinco pasos para armarlo',
        lead: ['Se arma con el árbol del problema al lado. No se inventa nada nuevo: se convierte lo que ya tienes.'],
        panel: {
            type: 'chain', title: 'Del árbol del problema al de objetivos', items: [
                { label: '1 · Parte del problema', text: 'Ten a la vista tu árbol del problema terminado.' },
                { label: '2 · Voltea el tronco', text: 'Escribe el problema central en positivo: ese es el objetivo central.' },
                { label: '3 · Voltea las raíces', text: 'Convierte cada causa en un medio, una por una.' },
                { label: '4 · Voltea las ramas', text: 'Convierte cada efecto en un fin.' },
                { label: '5 · Revisa la lógica', text: 'Lee de abajo hacia arriba: «si se logra **este medio**, se alcanza **el objetivo**, y con eso se contribuye a **este fin**».' },
            ],
        },
    },
    {
        id: 'ejemplo', section: 'pasos', min: 4, title: 'Un árbol de objetivos completo',
        lead: ['Este es el árbol de objetivos del hospital. Compáralo con su árbol del problema: es el mismo, en positivo.'],
        panel: {
            type: 'table', title: 'Menos inasistencia a citas médicas', head: ['Nivel', 'Contenido'], rows: [
                ['**Fines**', 'Se aprovechan los cupos · Disminuyen los tiempos de espera · Los tratamientos tienen continuidad'],
                ['**Objetivo central**', 'Reducir la inasistencia de los pacientes a las citas de consulta externa de un hospital de Sincelejo'],
                ['**Medios**', 'Los pacientes recuerdan su cita · Reprogramar es sencillo · Las citas se ajustan al transporte disponible'],
            ],
        },
        quiz: [
            q('¿De qué nivel del árbol salen los objetivos específicos?', ['De los fines', 'De los medios', 'Del objetivo central'], 1, 'Cada medio, con un verbo en infinitivo, es un objetivo específico.'),
        ],
    },
    {
        id: 'usos', section: 'pasos', min: 3, title: 'Del árbol a tus objetivos',
        lead: ['El árbol de objetivos es el puente entre el problema y lo que vas a hacer. En PROJECTSIA, además, la figura entra sola en tu documento, justo debajo del árbol del problema.'],
        panel: {
            type: 'table', title: 'Para qué te sirve cada nivel', head: ['Del árbol', 'Sale'], rows: [
                ['Objetivo central', 'Tu **objetivo general**.'],
                ['Medios', 'Tus **objetivos específicos** (elige los que sí puedes cumplir).'],
                ['Fines', 'Los argumentos de la **justificación** y el **impacto** esperado.'],
                ['La figura', 'La **Figura** «Árbol de objetivos», debajo del árbol del problema.'],
            ],
        },
    },

    /* ---------- Errores frecuentes (6) ---------- */
    {
        id: 'errores', section: 'errores', min: 3, title: 'Cinco errores al armar el árbol',
        lead: ['Casi todos vienen de no convertir, sino de escribir algo distinto.'],
        panel: {
            type: 'accordion', title: 'Errores y cómo corregirlos', items: [
                { error: 'Medios que no vienen de ninguna causa', example: 'Aparece «capacitar al personal» y ninguna causa hablaba del personal.', fix: 'Cada medio debe ser una causa volteada. Si falta la causa, vuelve al árbol del problema.' },
                { error: 'Actividades en vez de resultados', example: '«Hacer encuestas», «comprar equipos».', fix: 'Escribe la condición lograda: «los pacientes reciben un recordatorio».' },
                { error: 'Cambiar de población o de lugar', example: 'El problema era de un hospital y el objetivo habla de «la región».', fix: 'Conserva exactamente la población y el lugar del problema.' },
                { error: 'Fines puestos como objetivos específicos', example: '«Disminuir los tiempos de espera» como objetivo específico.', fix: 'Los fines son beneficios a los que contribuyes; los específicos salen de los medios.' },
                { error: 'Convertir todo con «no»', example: '«Que no haya inasistencia».', fix: 'Redacta en positivo y realista: «reducir la inasistencia».' },
            ],
        },
    },
    {
        id: 'quiz-errores', section: 'errores', min: 3, title: 'Convierte bien',
        lead: ['Elige la mejor conversión de cada frase del árbol del problema.'],
        quiz: [
            q('Causa: «Los docentes no usan herramientas digitales en clase».', ['Comprar tabletas', 'Los docentes usan herramientas digitales en clase', 'Mejorar la educación del país'], 1, 'Es la misma causa en positivo. Lo otro es una actividad o algo demasiado amplio.'),
            q('Problema: «Bajo rendimiento en matemáticas de estudiantes de primer semestre».', ['Mejorar el rendimiento en matemáticas de estudiantes de primer semestre', 'Dictar un curso de nivelación', 'Disminuir la deserción'], 0, 'Conserva la población y voltea la situación. La deserción es un fin; el curso, una actividad.'),
            q('Efecto: «Aumenta la repitencia».', ['Es un medio', 'Disminuye la repitencia (fin)', 'Es el objetivo central'], 1, 'Los efectos se convierten en fines.'),
        ],
    },

    /* ---------- Cierre (5) ---------- */
    {
        id: 'repaso', section: 'cierre', min: 3, title: 'Repaso: comprueba lo aprendido',
        lead: ['Tres preguntas antes de armar tu árbol.'],
        quiz: [
            q('¿En qué se convierten las causas?', ['En fines', 'En medios', 'En el objetivo central'], 1, 'Las raíces del problema son las raíces de la solución.'),
            q('¿De dónde sale el objetivo general?', ['Del objetivo central', 'De los fines', 'De la justificación'], 0, 'El tronco del árbol de objetivos es tu objetivo general.'),
            q('¿Qué pregunta responden los fines?', ['¿Cómo se logra?', '¿Para qué se logra?', '¿Por qué ocurre?'], 1, 'Son los beneficios a los que contribuye lograr el objetivo.'),
        ],
    },
    {
        id: 'cierre', section: 'cierre', min: 2, title: 'Lo que te llevas',
        lead: ['Con el árbol de objetivos, tus objetivos dejan de ser una lista y pasan a tener una lógica.'],
        bullets: [
            'El árbol de objetivos es el árbol del problema **en positivo**.',
            'Causas → **medios**; problema → **objetivo central**; efectos → **fines**.',
            'El objetivo central es tu objetivo general.',
            'De los medios salen tus objetivos específicos.',
            'Los fines alimentan la justificación.',
        ],
        status: true,
    },

    /* ---------- Construcción (15) ---------- */
    { id: 'construye', section: 'construccion', min: 15, title: 'Arma tu árbol de objetivos', layout: 'builder' },
]);
