import { construccionPrimero } from '../components/deck/orden.js';
/*
 * Clase «Árbol del problema»: presentación de 40 minutos, más la construcción del árbol.
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
    { id: 'portada', section: 'apertura', min: 3, title: 'El árbol del problema: causas, problema y efectos' },
    {
        id: 'quees', section: 'apertura', min: 2, title: 'Qué es y para qué sirve',
        lead: [
            'El árbol del problema es un esquema que ordena una situación negativa en tres niveles: lo que la **origina**, el **problema** en sí y lo que **provoca**.',
            'Sirve para no confundir el problema con sus síntomas ni con su solución, y para decidir sobre qué parte va a actuar tu proyecto.',
        ],
        panel: {
            type: 'chain', title: 'Se lee de abajo hacia arriba', items: [
                { label: 'Ramas · Efectos', text: 'Lo que el problema provoca. Responden **¿qué consecuencias trae?**' },
                { label: 'Tronco · Problema central', text: 'La situación negativa que observas, en una sola frase.' },
                { label: 'Raíces · Causas', text: 'Lo que origina el problema. Responden **¿por qué ocurre?**' },
            ],
        },
    },
    {
        id: 'quiz-apertura', section: 'apertura', min: 2, title: '¿Raíz, tronco o rama?',
        lead: ['Ubica cada frase en el árbol de un hospital donde los pacientes faltan a sus citas.'],
        quiz: [
            q('«Alta inasistencia de los pacientes a las citas de consulta externa.»', ['Causa', 'Problema central', 'Efecto'], 1, 'Es la situación negativa que se observa: el tronco.'),
            q('«Los pacientes olvidan la fecha de la cita.»', ['Causa', 'Problema central', 'Efecto'], 0, 'Explica por qué ocurre el problema: es una raíz.'),
            q('«Se pierden cupos que otros pacientes necesitan.»', ['Causa', 'Problema central', 'Efecto'], 2, 'Es una consecuencia del problema: una rama.'),
        ],
    },

    /* ---------- Las tres partes (11) ---------- */
    {
        id: 'tronco', section: 'partes', min: 4, title: 'El tronco: el problema central',
        lead: ['Se escribe como una **situación negativa que existe hoy**, que se puede observar y que afecta a alguien en un lugar. No es la falta de una solución.'],
        bullets: [
            'Un solo problema, no varios a la vez.',
            'En presente y en negativo: «alta», «bajo», «deficiente», «escaso».',
            'Con quiénes y dónde: una población y un lugar.',
        ],
        panel: {
            type: 'tabs', title: 'Cómo se redacta', items: [
                { id: 'mal1', label: 'Falta de solución', what: 'Nombra la solución que tú ya quieres dar. Así el árbol solo sirve para justificarla.', example: '«Falta una aplicación para recordar las citas médicas.»' },
                { id: 'mal2', label: 'Muy amplio', what: 'No se puede observar ni medir: no dice quiénes ni dónde.', example: '«La salud en Colombia está mal.»' },
                { id: 'bien', label: 'Bien redactado', what: 'Situación negativa, observable, con población y lugar.', example: '«Alta inasistencia de los pacientes a las citas de consulta externa de un hospital de Sincelejo.»' },
            ],
        },
    },
    {
        id: 'raices', section: 'partes', min: 4, title: 'Las raíces: las causas',
        lead: [
            'Las causas explican **por qué ocurre** el problema. Para encontrarlas, pregunta «¿por qué?» varias veces: cada respuesta te lleva a una raíz más profunda.',
            'Tu proyecto casi nunca resuelve todo el problema: interviene sobre **una o dos causas** que sí están a tu alcance.',
        ],
        panel: {
            type: 'chain', title: 'Los porqués, en un ejemplo', items: [
                { label: 'Problema', text: 'Los pacientes no asisten a sus citas.' },
                { label: '¿Por qué?', text: 'Porque olvidan la fecha.' },
                { label: '¿Por qué la olvidan?', text: 'Porque la cita se asigna con varias semanas de anticipación y nadie la recuerda.' },
                { label: '¿Por qué nadie la recuerda?', text: 'Porque el hospital no tiene un sistema de recordatorios.', note: 'Esta es una causa sobre la que un proyecto sí puede actuar.' },
            ],
        },
    },
    {
        id: 'ramas', section: 'partes', min: 3, title: 'Las ramas: los efectos',
        lead: ['Los efectos son lo que pasa **por culpa** del problema. Muestran a quién afecta y por qué vale la pena investigarlo: son la base de tu justificación.'],
        panel: {
            type: 'table', title: 'Efectos cercanos y lejanos', head: ['Tipo', 'Qué es', 'Ejemplo'], rows: [
                ['**Directo**', 'Lo que el problema causa de inmediato.', 'Se pierden cupos de atención.'],
                ['**Indirecto**', 'Lo que ese efecto causa después.', 'Aumentan los tiempos de espera para una cita.'],
                ['**De fondo**', 'El daño mayor si nada cambia.', 'Se agravan enfermedades que pudieron controlarse.'],
            ],
        },
        hint: 'Un efecto no es una causa disfrazada: si responde «¿por qué ocurre?», va abajo; si responde «¿qué provoca?», va arriba.',
    },

    /* ---------- Cómo se construye (11) ---------- */
    {
        id: 'pasos', section: 'pasos', min: 4, title: 'Cinco pasos para armarlo',
        lead: ['Hazlo en este orden. Empezar por las causas o por la solución es la forma más común de terminar con un árbol confuso.'],
        panel: {
            type: 'chain', title: 'El orden importa', items: [
                { label: '1 · Observa', text: 'Escribe todo lo que ves que anda mal, sin ordenarlo.' },
                { label: '2 · Elige el tronco', text: 'De la lista, escoge **un** problema central y redáctalo en negativo.' },
                { label: '3 · Baja a las raíces', text: 'Pregunta «¿por qué ocurre?» y anota de dos a cuatro causas.' },
                { label: '4 · Sube a las ramas', text: 'Pregunta «¿qué consecuencias trae?» y anota de dos a cuatro efectos.' },
                { label: '5 · Revisa la lógica', text: 'Lee de abajo hacia arriba: «como pasa **esto**, ocurre **el problema**, y por eso pasa **aquello**».' },
            ],
        },
    },
    {
        id: 'ejemplo', section: 'pasos', min: 4, title: 'Un árbol completo',
        lead: ['Este es el árbol del hospital, ya terminado. Léelo de abajo hacia arriba y comprueba que cada nivel explica al siguiente.'],
        panel: {
            type: 'table', title: 'Inasistencia a citas médicas', head: ['Nivel', 'Contenido'], rows: [
                ['**Efectos**', 'Se pierden cupos de atención · Aumentan los tiempos de espera · Se interrumpen los tratamientos'],
                ['**Problema central**', 'Alta inasistencia de los pacientes a las citas de consulta externa de un hospital de Sincelejo'],
                ['**Causas**', 'Los pacientes olvidan la fecha · Es difícil reprogramar la cita por teléfono · El transporte desde la zona rural es costoso'],
            ],
        },
        quiz: [
            q('Si el proyecto va a crear recordatorios por mensaje de texto, ¿sobre qué parte del árbol actúa?', ['Sobre un efecto', 'Sobre una causa', 'Sobre el problema central directamente'], 1, 'Ataca la causa «los pacientes olvidan la fecha»; al reducirla, baja la inasistencia.'),
        ],
    },
    {
        id: 'usos', section: 'pasos', min: 3, title: 'Del árbol a tu proyecto',
        lead: ['El árbol no es un adorno: de él salen varias partes de tu documento. En PROJECTSIA, además, la figura entra sola en el Planteamiento.'],
        panel: {
            type: 'table', title: 'Para qué te sirve cada nivel', head: ['Del árbol', 'Sale'], rows: [
                ['Problema central', 'El párrafo de **descripción** del planteamiento y la **pregunta** de investigación.'],
                ['Causas', 'El párrafo de **causas** y, puestas en positivo, los **objetivos específicos**.'],
                ['Efectos', 'El párrafo de **consecuencias** y los argumentos de la **justificación**.'],
                ['La figura', 'La **Figura** «Árbol del problema» dentro del planteamiento.'],
            ],
        },
    },

    /* ---------- Errores frecuentes (6) ---------- */
    {
        id: 'errores', section: 'errores', min: 3, title: 'Cinco errores al armar el árbol',
        lead: ['Casi todos los árboles débiles caen en alguno de estos. Revisa el tuyo contra la lista.'],
        panel: {
            type: 'accordion', title: 'Errores y cómo corregirlos', items: [
                { error: 'El problema es la falta de una solución', example: '«No hay una aplicación de citas.»', fix: 'Pregúntate qué situación negativa existe hoy sin esa solución, y escribe eso.' },
                { error: 'Causas y efectos mezclados', example: '«Largas filas» puesto como causa de la inasistencia.', fix: 'Aplica la prueba: ¿responde «por qué ocurre» o «qué provoca»?' },
                { error: 'Varios problemas en el tronco', example: '«Inasistencia, mala atención y falta de médicos.»', fix: 'Deja uno solo; los otros suelen ser causas o efectos de ese.' },
                { error: 'Causas que no se pueden intervenir', example: '«La pobreza del país.»', fix: 'Sigue preguntando «¿por qué?» hasta llegar a una causa cercana a tu población.' },
                { error: 'Frases sueltas de una palabra', example: '«Desinterés», «Economía».', fix: 'Escribe una frase completa que diga quién y qué: «Los pacientes no reciben recordatorio de su cita».' },
            ],
        },
    },
    {
        id: 'quiz-errores', section: 'errores', min: 3, title: 'Corrige estos árboles',
        lead: ['Decide qué está mal en cada caso.'],
        quiz: [
            q('Tronco: «Falta de un laboratorio de computación en el colegio».', ['Está bien redactado', 'Es la falta de una solución', 'Es un efecto'], 1, 'El problema real podría ser «bajo nivel de competencias digitales de los estudiantes».'),
            q('Problema: «Bajo rendimiento en matemáticas». Se anota como causa: «Aumenta la repitencia».', ['Está bien', 'Es un efecto, no una causa', 'Es otro problema central'], 1, 'La repitencia es consecuencia del bajo rendimiento: va en las ramas.'),
            q('Causa anotada: «La situación económica mundial».', ['Es una buena causa', 'Es demasiado lejana para intervenirla', 'Es un efecto'], 1, 'Hay que bajar hasta una causa cercana a la población del estudio.'),
        ],
    },

    /* ---------- Cierre (5) ---------- */
    {
        id: 'repaso', section: 'cierre', min: 3, title: 'Repaso: comprueba lo aprendido',
        lead: ['Tres preguntas antes de armar tu árbol.'],
        quiz: [
            q('¿Qué pregunta te lleva a las causas?', ['¿Qué consecuencias trae?', '¿Por qué ocurre?', '¿Cómo se soluciona?'], 1, 'Las causas explican el origen del problema.'),
            q('¿Cómo se redacta el problema central?', ['Como la falta de una solución', 'Como una situación negativa que existe hoy', 'Como un objetivo en infinitivo'], 1, 'Negativo, observable, con población y lugar.'),
            q('¿Sobre qué parte actúa normalmente un proyecto?', ['Sobre los efectos', 'Sobre una o dos causas', 'Sobre todo el árbol'], 1, 'Al reducir una causa, se reduce el problema y con él sus efectos.'),
        ],
    },
    {
        id: 'cierre', section: 'cierre', min: 2, title: 'Lo que te llevas',
        lead: ['Con el árbol claro, el planteamiento casi se escribe solo.'],
        bullets: [
            'El árbol separa **causas**, **problema central** y **efectos**.',
            'El tronco es una situación negativa, no la falta de una solución.',
            'Las causas responden «¿por qué ocurre?»; los efectos, «¿qué consecuencias trae?».',
            'Tu proyecto interviene sobre una o dos causas a tu alcance.',
            'De cada nivel sale un párrafo del planteamiento.',
        ],
        status: true,
    },

    /* ---------- Construcción (15) ---------- */
    { id: 'construye', section: 'construccion', min: 15, title: 'Arma tu árbol del problema', layout: 'builder' },
]);
