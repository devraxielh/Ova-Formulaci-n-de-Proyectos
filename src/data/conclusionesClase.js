import { construccionPrimero } from '../components/deck/orden.js';
/*
 * Clase «Conclusiones» (1 hora).
 * Las diapositivas 'portada', 'construye' y 'revision' se pintan aparte en el componente.
 */

export const SECTIONS = construccionPrimero([
    { id: 'apertura', label: 'Apertura' },
    { id: 'estructura', label: 'Cómo se escriben' },
    { id: 'recomendaciones', label: 'Recomendaciones' },
    { id: 'calidad', label: 'Calidad' },
    { id: 'cierre', label: 'Cierre' },
    { id: 'construccion', label: 'Construcción' },
    { id: 'revision', label: 'Revisión' },
]);

const q = (text, options, answer, why) => ({ text, options, answer, why });

export const SLIDES = construccionPrimero([
    /* ---------- Apertura (9) ---------- */
    { id: 'portada', section: 'apertura', min: 3, title: 'Conclusiones: la respuesta a tus objetivos' },
    {
        id: 'quees', section: 'apertura', min: 3, title: 'Qué son y qué no son',
        lead: ['Las conclusiones responden, de forma breve y directa, a cada objetivo y a la pregunta de investigación, a partir de los resultados. Son lo que el lector debe recordar del estudio.'],
        panel: {
            type: 'table', title: 'No confundir', head: ['Sección', 'Qué hace'], rows: [
                ['Resultados', 'Presenta los datos encontrados.'],
                ['Discusión', 'Interpreta y compara con otros estudios.'],
                ['**Conclusiones**', '**Responde cada objetivo con lo que se encontró.**'],
                ['Recomendaciones', 'Propone acciones derivadas de las conclusiones.'],
                ['Resumen', 'Sintetiza todo el estudio en un párrafo.'],
            ],
        },
    },
    {
        id: 'quiz-apertura', section: 'apertura', min: 3, title: '¿Es una conclusión?',
        lead: ['Decide si cada fragmento es una conclusión.'],
        quiz: [
            q('«El olvido de la cita es el principal factor asociado a la inasistencia de los pacientes de consulta externa del hospital.»', ['Conclusión', 'No es conclusión'], 0, 'Responde un objetivo con lo encontrado.'),
            q('«Según Pérez y Gómez (2022), el olvido explica el 41 % de las citas perdidas.»', ['Conclusión', 'No es conclusión'], 1, 'Cita a otro autor: eso va en la discusión.'),
        ],
    },

    /* ---------- Cómo se escriben (18) ---------- */
    {
        id: 'porobjetivo', section: 'estructura', min: 4, title: 'Una conclusión por objetivo',
        lead: ['Escribe una conclusión por cada objetivo específico, en el mismo orden, y cierra con una conclusión general que responda el objetivo general y la pregunta.'],
        panel: {
            type: 'chain', title: 'De los objetivos a las conclusiones', items: [
                { label: 'Objetivo específico 1', text: 'Caracterizar la inasistencia → Conclusión 1: cómo es la inasistencia.' },
                { label: 'Objetivo específico 2', text: 'Comparar la inasistencia → Conclusión 2: en qué grupos es mayor.' },
                { label: 'Objetivo específico 3', text: 'Establecer la relación → Conclusión 3: si hay relación y de qué tipo.' },
                { label: 'Conclusión general', text: 'Responde el objetivo general y la pregunta de investigación.' },
            ],
        },
    },
    {
        id: 'reglas', section: 'estructura', min: 4, title: 'Cómo se escribe una conclusión',
        lead: ['Una buena conclusión es una afirmación clara, respaldada por los resultados.'],
        bullets: [
            'Responde directamente el objetivo: empieza por lo que se logró.',
            'Se basa solo en tus resultados: no introduce datos nuevos.',
            'No lleva citas de otros autores (eso es discusión).',
            'Es breve: dos a cuatro oraciones por objetivo.',
            'Usa lenguaje prudente: «en esta población», «los resultados indican».',
        ],
        panel: {
            type: 'table', title: 'Verbo del objetivo → inicio de la conclusión', head: ['Objetivo', 'Conclusión'], rows: [
                ['Caracterizar…', 'Se caracterizó… / La inasistencia se caracteriza por…'],
                ['Comparar…', 'Se encontró que la inasistencia es mayor en…'],
                ['Establecer la relación…', 'Se estableció que existe una relación…'],
                ['Analizar los factores…', 'Los factores asociados a… son…'],
            ],
        },
    },
    {
        id: 'general', section: 'estructura', min: 4, title: 'La conclusión general',
        lead: ['Integra las conclusiones específicas en una respuesta a tu pregunta de investigación. Si planteaste una hipótesis, di si los resultados la respaldan o no.'],
        panel: {
            type: 'example', title: 'Ejemplo', paragraphs: [
                'En respuesta a la pregunta de investigación, los factores asociados a la inasistencia a citas médicas de los pacientes de consulta externa del hospital son principalmente el olvido de la cita y el costo del transporte; la inasistencia es mayor en los pacientes menores de 30 años, en los de la zona rural y en quienes no recibieron recordatorio. El olvido se relaciona de forma positiva y moderada con la inasistencia, lo que indica asociación y no causalidad.',
            ],
        },
    },
    {
        id: 'ejemplo', section: 'estructura', min: 6, title: 'Conclusiones completas',
        lead: ['Mira cómo cada conclusión responde su objetivo, sin citas ni datos nuevos. Ejemplo ilustrativo.'],
        panel: {
            type: 'example', title: 'Ejemplo (salud)', paragraphs: [
                '**1.** La inasistencia a citas médicas en la consulta externa del hospital es frecuente: se pierde cerca de una de cada cinco citas, y el olvido es la causa que más reportan los pacientes.',
                '**2.** La inasistencia es mayor en los pacientes menores de 30 años, en quienes viven en la zona rural y en quienes no recibieron recordatorio de la cita.',
                '**3.** Se estableció que el olvido de la cita se relaciona de forma positiva y moderada con la inasistencia: a mayor olvido, más citas perdidas.',
            ],
        },
    },

    /* ---------- Recomendaciones (9) ---------- */
    {
        id: 'rec-quees', section: 'recomendaciones', min: 3, title: 'Recomendaciones',
        lead: ['Las recomendaciones proponen acciones concretas que se derivan de las conclusiones. Cada una dice a quién va dirigida y qué debería hacer.'],
        bullets: ['Se derivan de una conclusión: no de opiniones.', 'Dicen quién: la institución, los docentes, el gobierno local, los futuros investigadores.', 'Son realizables.'],
        panel: {
            type: 'table', title: 'Conclusión → recomendación', head: ['Conclusión', 'Recomendación'], rows: [
                ['El olvido está asociado a la inasistencia.', 'A la oficina de atención al usuario: implementar recordatorios automáticos 48 horas antes de la cita.'],
                ['La inasistencia es mayor en la zona rural.', 'A la gerencia: coordinar con las alcaldías el transporte para pacientes rurales.'],
            ],
        },
    },
    {
        id: 'rec-actores', section: 'recomendaciones', min: 3, title: 'Recomendaciones por actor',
        lead: ['Organizar las recomendaciones por destinatario las hace más claras.'],
        panel: {
            type: 'tabs', title: 'Ejemplos', items: [
                { id: 'inst', label: 'Institución', what: 'Acciones de gestión, procesos o políticas internas.', example: 'Al hospital: incluir la confirmación de la cita en el proceso de agendamiento.' },
                { id: 'prof', label: 'Profesionales', what: 'Cambios en la práctica diaria.', example: 'A los docentes: usar organizadores previos al iniciar cada unidad.' },
                { id: 'gob', label: 'Entidades públicas', what: 'Programas o decisiones de política.', example: 'A la secretaría de salud: apoyar el transporte de pacientes rurales.' },
                { id: 'inv', label: 'Futuros investigadores', what: 'Estudios que deberían hacerse después.', example: 'Evaluar el efecto de los recordatorios con un diseño cuasiexperimental.' },
            ],
        },
    },
    {
        id: 'rec-quiz', section: 'recomendaciones', min: 3, title: '¿Es una buena recomendación?',
        lead: ['Decide si cada recomendación está bien formulada.'],
        quiz: [
            q('«Se recomienda mejorar la salud.»', ['Bien formulada', 'Hay que mejorarla'], 1, 'No dice a quién ni qué acción concreta.'),
            q('«A la coordinación académica: ofrecer tutorías de cálculo a los estudiantes con nota inferior a 3,0 en el primer corte.»', ['Bien formulada', 'Hay que mejorarla'], 0, 'Tiene destinatario, acción y criterio.'),
        ],
    },

    /* ---------- Calidad (9) ---------- */
    {
        id: 'errores', section: 'calidad', min: 4, title: 'Siete errores frecuentes',
        lead: ['Revisa si tus conclusiones caen en alguno.'],
        panel: {
            type: 'accordion', title: 'Abre cada error para ver cómo corregirlo', items: [
                { error: 'Repetir los resultados', example: 'Copiar porcentajes y tablas.', fix: 'Conclúyelos: di qué significan para el objetivo.' },
                { error: 'Datos nuevos', example: 'Una cifra que no aparece en los resultados.', fix: 'Solo concluye sobre lo que ya presentaste.' },
                { error: 'Citar autores', example: '«Como dice Pérez (2022)…».', fix: 'Las citas van en la discusión.' },
                { error: 'Objetivos sin conclusión', example: 'Falta la conclusión del objetivo 3.', fix: 'Una conclusión por objetivo.' },
                { error: 'Conclusiones que no responden', example: '«El tema es muy importante».', fix: 'Responde directamente lo que pedía el objetivo.' },
                { error: 'Generalizar de más', example: '«Todos los hospitales de Colombia…».', fix: 'Limita la conclusión a tu población.' },
                { error: 'Mezclar con recomendaciones', example: '«…por eso se recomienda…» dentro de la conclusión.', fix: 'Pon las recomendaciones en su propio apartado.' },
            ],
        },
    },
    {
        id: 'antes', section: 'calidad', min: 3, title: 'Conclusión débil y fuerte',
        lead: ['Compara.'],
        panel: {
            type: 'table', title: 'Antes y después', head: ['Débil', 'Fuerte'], rows: [
                ['Se hizo la encuesta y se vieron muchas cosas.', 'La inasistencia se concentra en los pacientes jóvenes y de la zona rural.'],
                ['El olvido es malo según varios autores.', 'Se estableció que el olvido de la cita está asociado a la inasistencia en esta población.'],
                ['Los recordatorios solucionarán la inasistencia en todo el país.', 'En esta población, la inasistencia es mayor en quienes no recibieron recordatorio de la cita.'],
            ],
        },
    },
    {
        id: 'juzga', section: 'calidad', min: 2, title: '¿Está bien escrita?',
        lead: ['Una última prueba.'],
        quiz: [
            q('«Se determinó que el uso del celular durante la clase está asociado a un menor rendimiento en matemáticas en los estudiantes de grado noveno de la institución.»', ['Bien escrita', 'Hay que mejorarla'], 0, 'Responde el objetivo, se limita a la población y no cita autores.'),
        ],
    },

    /* ---------- Cierre (3) ---------- */
    {
        id: 'repaso', section: 'cierre', min: 2, title: 'Repaso',
        lead: ['Dos preguntas para cerrar.'],
        quiz: [
            q('¿Cuántas conclusiones específicas debe haber?', ['Una por objetivo específico', 'Una sola', 'Las que se quieran'], 0, 'Cada objetivo necesita su respuesta.'),
            q('¿Qué lleva cada recomendación?', ['Una cita', 'A quién va dirigida y qué acción', 'Un porcentaje'], 1, 'Destinatario y acción concreta.'),
        ],
    },
    {
        id: 'cierre', section: 'cierre', min: 1, title: 'Lo que te llevas',
        bullets: [
            'Una conclusión por objetivo, en orden, y una conclusión general que responde la pregunta.',
            'Basadas en tus resultados, sin citas ni datos nuevos.',
            'Breves y prudentes, limitadas a tu población.',
            'Recomendaciones aparte, con destinatario y acción.',
        ],
        status: true,
    },

    /* ---------- Construcción y revisión (12) ---------- */
    { id: 'construye', section: 'construccion', min: 9, title: 'Construye tus conclusiones', layout: 'builder' },
    { id: 'revision', section: 'revision', min: 3, title: 'Qué hace buenas a unas conclusiones' },
]);
