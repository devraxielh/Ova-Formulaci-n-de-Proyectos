import { construccionPrimero } from '../components/deck/orden.js';
/*
 * Contenido de la clase larga de Marco Referencial (4 horas).
 * Cada diapositiva: { id, section, min, title, lead[], bullets[], hint, panel }.
 * panel.type: tabs | chain | quiz | table | example | list | accordion.
 * Las diapositivas 'portada', 'construye' y 'revision' se pintan aparte en el componente.
 */

export const SECTIONS = construccionPrimero([
    { id: 'apertura', label: 'Apertura' },
    { id: 'antecedentes', label: 'Antecedentes' },
    { id: 'teorico', label: 'Marco Teórico' },
    { id: 'conceptual', label: 'Marco Conceptual' },
    { id: 'contextual', label: 'Marco Contextual' },
    { id: 'legal', label: 'Marco Legal' },
    { id: 'citas', label: 'Citas APA' },
    { id: 'calidad', label: 'Calidad' },
    { id: 'cierre', label: 'Cierre' },
    { id: 'construccion', label: 'Construcción' },
    { id: 'revision', label: 'Revisión' },
]);

const q = (text, options, answer, why) => ({ text, options, answer, why });

export const SLIDES = construccionPrimero([
    /* ---------- Apertura (12) ---------- */
    { id: 'portada', section: 'apertura', min: 3, title: 'El marco referencial: en qué se apoya tu investigación' },
    {
        id: 'quees', section: 'apertura', min: 3, title: 'Cinco apartados, cinco preguntas',
        lead: ['El marco referencial reúne lo que ya se sabe sobre tu tema y lo que rodea a tu estudio. Se organiza en cinco apartados, cada uno con una pregunta.'],
        panel: {
            type: 'list', title: 'Los cinco apartados', items: [
                { label: 'Antecedentes', text: '¿Qué se ha investigado sobre el tema?' },
                { label: 'Marco Teórico', text: '¿Qué teorías explican el problema?' },
                { label: 'Marco Conceptual', text: '¿Qué significa cada término clave?' },
                { label: 'Marco Contextual', text: '¿Dónde y con quiénes ocurre?' },
                { label: 'Marco Legal', text: '¿Qué normas lo regulan?' },
            ],
        },
    },
    {
        id: 'funcion', section: 'apertura', min: 3, title: 'Para qué sirve',
        lead: ['Un buen marco referencial no es un resumen de lecturas: cada parte cumple una función para tu proyecto.'],
        hint: 'Si un texto no cumple ninguna de estas funciones, no va.',
        panel: {
            type: 'chain', title: 'Cuatro funciones', items: [
                { label: 'Sustenta', text: 'Muestra que tu problema tiene base en estudios y teorías.', note: 'No inventas: te apoyas en lo que ya se sabe.' },
                { label: 'Ubica', text: 'Sitúa tu estudio frente a lo que otros han hecho y deja ver el vacío.', note: 'Los antecedentes muestran qué falta.' },
                { label: 'Define', text: 'Fija el significado de tus variables para todo el documento.', note: 'Evita malentendidos con el evaluador.' },
                { label: 'Orienta', text: 'Guía la metodología y la interpretación de los resultados.', note: 'Las teorías dicen qué medir y cómo leerlo.' },
            ],
        },
    },
    {
        id: 'diferencias', section: 'apertura', min: 3, title: 'Marco referencial, marco teórico y estado del arte',
        lead: ['Estos nombres se confunden. En PROJECTSIA, el marco referencial es el capítulo completo; el marco teórico es una de sus partes.'],
        panel: {
            type: 'table', title: 'Cómo se relacionan', head: ['Término', 'Qué es'], rows: [
                ['Marco referencial', 'El capítulo completo: antecedentes y los cuatro marcos.'],
                ['Marco teórico', 'Solo las teorías y modelos que explican el problema.'],
                ['Estado del arte', 'Revisión amplia de lo investigado sobre el tema; en una propuesta corresponde a los antecedentes.'],
                ['Revisión de literatura', 'El proceso de buscar, leer y seleccionar fuentes para todo el marco.'],
            ],
        },
        quiz: [q('¿En qué apartado va «La Ley 1751 de 2015 establece la salud como un derecho fundamental»?', ['Marco Conceptual', 'Marco Legal', 'Antecedentes'], 1, 'Es una norma que regula el tema de la investigación.')],
    },

    /* ---------- Antecedentes (45) ---------- */
    {
        id: 'ant-quees', section: 'antecedentes', min: 4, title: 'Qué son los antecedentes',
        lead: ['Los antecedentes son investigaciones previas sobre tu tema: artículos, tesis o informes. Muestran qué se sabe, con qué métodos y qué falta: el vacío que tu estudio llena.'],
        bullets: ['Recientes: de los últimos diez años.', 'De varios ámbitos: internacional, nacional y regional o local, en ese orden.', 'Suficientes: lo usual es entre 5 y 10 en una propuesta de pregrado o especialización.'],
        panel: {
            type: 'chain', title: 'Del mundo a tu lugar', items: [
                { label: 'Internacional', text: 'Estudios de otros países que abordan el mismo problema.', note: 'Muestran el panorama y los métodos más usados.' },
                { label: 'Nacional', text: 'Estudios hechos en Colombia.', note: 'Acercan el problema a tu realidad.' },
                { label: 'Regional o local', text: 'Estudios en tu departamento, municipio o institución.', note: 'Suelen ser pocos: ahí está el vacío.' },
            ],
        },
    },
    {
        id: 'ant-ficha', section: 'antecedentes', min: 3, title: 'La ficha de un antecedente',
        lead: ['Antes de redactar, llena una ficha por cada fuente. Así no pierdes datos y la redacción sale casi sola.'],
        panel: {
            type: 'tabs', title: 'Lo que debe tener cada ficha', items: [
                { id: 'quien', label: 'Quién y cuándo', what: 'Autor(es) y año.', example: 'Pérez y Gómez (2022)' },
                { id: 'que', label: 'Qué hizo', what: 'Título, lugar, objetivo y método.', example: 'Analizaron las causas de la inasistencia en 380 pacientes de una IPS de Bogotá con una encuesta.' },
                { id: 'hallo', label: 'Qué encontró', what: 'El hallazgo principal, con cifras si las hay.', example: 'El olvido explicó el 41 % de las citas perdidas.' },
                { id: 'relacion', label: 'Qué te aporta', what: 'Cómo se relaciona con tu estudio.', example: 'Aporta una de las variables que se medirán y el instrumento que se adaptará.' },
                { id: 'fuente', label: 'Fuente', what: 'Revista, repositorio o base de datos, y su DOI o enlace.', example: 'Revista de Salud Pública, 24(3). https://doi.org/…' },
            ],
        },
    },
    {
        id: 'ant-ejemplos', section: 'antecedentes', min: 5, title: 'Tres antecedentes bien redactados',
        lead: ['Mira cómo cada antecedente dice quién, qué hizo, qué encontró y qué aporta. Los datos de estos ejemplos son ilustrativos.'],
        panel: {
            type: 'example', title: 'Ejemplo (salud)', paragraphs: [
                '**Internacional.** Smith y Lee (2021), en un estudio realizado en tres clínicas de Texas con 2.400 citas programadas, buscaron identificar los factores asociados a la inasistencia. Encontraron que la tasa fue del 23 % y que los recordatorios por mensaje de texto la redujeron a la mitad. Este antecedente se relaciona con la presente investigación porque aporta una de las variables que se medirán.',
                '**Nacional.** Pérez y Gómez (2022), en una IPS de Bogotá, encuestaron a 380 pacientes para analizar las causas de la inasistencia. El olvido de la cita explicó el 38 % de los casos. Este antecedente se relaciona con el estudio porque su cuestionario será adaptado.',
                '**Regional.** Díaz (2023), en una tesis de la Universidad de Sucre, describió la inasistencia en un centro de salud de Corozal y halló que el transporte fue la principal barrera en la zona rural. Se relaciona con esta investigación porque muestra que el problema existe en la región, aunque no se ha estudiado en hospitales de segundo nivel.',
            ],
        },
    },
    {
        id: 'ant-ejemplos2', section: 'antecedentes', min: 4, title: 'Antecedentes en otras áreas',
        lead: ['La misma estructura sirve en cualquier área: quién, qué hizo, qué encontró, qué aporta.'],
        panel: {
            type: 'tabs', title: 'Ejemplos por área (datos ilustrativos)', items: [
                { id: 'edu', label: 'Educación', what: 'Rodríguez (2022), en cinco colegios públicos de Medellín, relacionó el uso del celular en clase con el rendimiento en matemáticas de 600 estudiantes y halló una correlación negativa moderada.', example: 'Aporta: el instrumento para medir el uso del celular y la técnica de análisis (correlación).' },
                { id: 'neg', label: 'Negocios', what: 'Martínez y Ruiz (2023) analizaron 150 tiendas de barrio de Barranquilla y encontraron que las que usan pagos digitales vendieron 18 % más.', example: 'Aporta: las variables de adopción digital que se medirán en las tiendas de Montería.' },
                { id: 'ing', label: 'Ingeniería', what: 'Castro (2021) diseñó un sistema de riego automatizado con sensores de humedad para cultivos de maíz en Córdoba y redujo el consumo de agua en 30 %.', example: 'Aporta: el diseño de referencia y los indicadores de eficiencia.' },
                { id: 'soc', label: 'Ciencias sociales', what: 'Herrera (2020) entrevistó a 25 madres cabeza de hogar de Sincelejo y describió las estrategias que usan para conciliar trabajo y cuidado.', example: 'Aporta: las categorías de análisis para las entrevistas.' },
            ],
        },
    },
    {
        id: 'ant-buscar', section: 'antecedentes', min: 4, title: 'Dónde buscar',
        lead: ['Busca en fuentes académicas confiables y guarda los datos de cada fuente apenas la encuentres.'],
        panel: {
            type: 'list', title: 'Fuentes confiables', items: [
                { label: 'Bases académicas abiertas', text: 'Google Académico, SciELO, Redalyc, Dialnet, La Referencia.' },
                { label: 'Bases suscritas', text: 'Scopus, ScienceDirect, Web of Science, EBSCO (si tu universidad tiene acceso).' },
                { label: 'Repositorios', text: 'Tesis de tu universidad y de otras, en sus repositorios institucionales.' },
                { label: 'Fuentes oficiales', text: 'DANE, ministerios, OMS, OPS, CEPAL, Banco Mundial, para datos e informes.' },
            ],
        },
        action: 'referencias',
    },
    {
        id: 'ant-ecuacion', section: 'antecedentes', min: 4, title: 'Palabras clave y ecuaciones de búsqueda',
        lead: ['Busca con las palabras clave de tu título, en español y en inglés, y combínalas con operadores.'],
        bullets: ['AND (Y): ambas palabras deben aparecer.', 'OR (O): cualquiera de las dos; sirve para sinónimos.', 'Comillas: frase exacta.', 'Filtra por año (últimos diez) e idioma.'],
        panel: {
            type: 'table', title: 'Ejemplos de ecuaciones', head: ['Tema', 'Ecuación'], rows: [
                ['Inasistencia a citas', '("inasistencia" OR "no asistencia") AND ("cita médica" OR "consulta externa")'],
                ['En inglés', '("no-show" OR "missed appointment") AND "outpatient"'],
                ['Uso del celular y rendimiento', '("teléfono móvil" OR celular) AND "rendimiento académico" AND secundaria'],
                ['Pagos digitales en tiendas', '("pagos digitales" OR "billetera digital") AND (mipyme OR "tienda de barrio")'],
            ],
        },
    },
    {
        id: 'ant-seleccion', section: 'antecedentes', min: 4, title: 'Cómo elegir un buen antecedente',
        lead: ['No todo lo que encuentras sirve. Evalúa cada fuente antes de incluirla.'],
        panel: {
            type: 'chain', title: 'Cuatro filtros', items: [
                { label: 'Pertinencia', text: '¿Estudia tus variables o tu población?', note: 'Si solo comparte una palabra, descártalo.' },
                { label: 'Actualidad', text: '¿Es de los últimos diez años?', note: 'Los clásicos van en el Marco Teórico.' },
                { label: 'Calidad', text: '¿Es un artículo de revista arbitrada, una tesis o un informe oficial?', note: 'Evita blogs, monografías sin autor y páginas comerciales.' },
                { label: 'Utilidad', text: '¿Te aporta una variable, un instrumento, un método o un dato?', note: 'Si no aporta nada, no va.' },
            ],
        },
    },
    {
        id: 'ant-leer', section: 'antecedentes', min: 3, title: 'Cómo leer un artículo sin perder tiempo',
        lead: ['No necesitas leer todo el artículo para saber si sirve. Léelo en este orden.'],
        panel: {
            type: 'chain', title: 'Lectura en cuatro pasos', items: [
                { label: '1. Título y resumen', text: 'Decide si es pertinente.', note: '2 minutos.' },
                { label: '2. Método', text: 'Población, muestra, instrumento y análisis.', note: 'Lo que podrías replicar o adaptar.' },
                { label: '3. Resultados y conclusiones', text: 'El hallazgo principal, con cifras.', note: 'Lo que pondrás en la ficha.' },
                { label: '4. Referencias', text: 'Otras fuentes citadas que te pueden servir.', note: 'Búsqueda «en bola de nieve».' },
            ],
        },
    },
    {
        id: 'ant-matriz', section: 'antecedentes', min: 4, title: 'La matriz de antecedentes',
        lead: ['Organiza tus fichas en una matriz. Te permite comparar estudios y encontrar el vacío.'],
        panel: {
            type: 'table', title: 'Ejemplo de matriz', head: ['Autor y año', 'Ámbito', 'Método', 'Hallazgo', 'Aporte'], rows: [
                ['Smith y Lee (2021)', 'Internacional', 'Cuantitativo, 2.400 citas', 'Inasistencia del 23 %', 'Variable: recordatorios'],
                ['Pérez y Gómez (2022)', 'Nacional', 'Encuesta a 380 pacientes', 'Olvido: 38 %', 'Cuestionario'],
                ['Díaz (2023)', 'Regional', 'Descriptivo, centro de salud', 'Transporte: principal barrera', 'Contexto regional'],
            ],
        },
    },
    {
        id: 'ant-vacio', section: 'antecedentes', min: 4, title: 'Cerrar los antecedentes: el vacío',
        lead: ['Termina los antecedentes con un párrafo de síntesis: qué se sabe, qué falta y cómo tu estudio lo aborda.'],
        panel: {
            type: 'example', title: 'Párrafo de síntesis', paragraphs: [
                'En síntesis, los estudios revisados coinciden en que el olvido y las barreras de transporte explican buena parte de la inasistencia a citas médicas, y que los recordatorios la reducen. Sin embargo, la mayoría se ha realizado en grandes ciudades y en instituciones de primer nivel; no se encontraron estudios en hospitales de segundo nivel de la región Caribe. Esta investigación aborda ese vacío al analizar los factores asociados a la inasistencia en un hospital de Sincelejo.',
            ],
        },
    },
    {
        id: 'ant-quiz', section: 'antecedentes', min: 3, title: '¿Es un buen antecedente?',
        lead: ['Decide si cada fuente sirve como antecedente.'],
        quiz: [
            q('Un artículo de 2023 en una revista indexada sobre inasistencia a citas en Cartagena.', ['Sirve', 'No sirve'], 0, 'Es pertinente, reciente, de calidad y del ámbito nacional.'),
            q('Una entrada de blog sin autor sobre «tips para no olvidar tus citas».', ['Sirve', 'No sirve'], 1, 'No tiene autor ni respaldo académico.'),
            q('Una tesis de 1998 sobre la historia de los hospitales en Colombia.', ['Sirve', 'No sirve'], 1, 'Es antigua y no estudia tu problema.'),
        ],
    },

    /* ---------- Marco Teórico (45) ---------- */
    {
        id: 'teo-quees', section: 'teorico', min: 4, title: 'Qué es el Marco Teórico',
        lead: ['El Marco Teórico presenta las teorías o modelos que explican tu problema y tus variables. Responde: ¿por qué ocurre lo que estudias, según la ciencia?'],
        bullets: ['Una o dos teorías principales bien explicadas valen más que muchas mencionadas.', 'Aquí sí caben autores clásicos: una teoría puede tener décadas y seguir vigente.', 'Cada teoría debe conectarse con tus variables.'],
        panel: {
            type: 'table', title: 'Teoría, modelo y enfoque', head: ['Término', 'Qué es', 'Ejemplo'], rows: [
                ['Teoría', 'Explicación general y comprobada de un fenómeno.', 'Teoría del aprendizaje social (Bandura, 1977)'],
                ['Modelo', 'Representación simplificada de cómo se relacionan unas variables.', 'Modelo de aceptación tecnológica (Davis, 1989)'],
                ['Enfoque', 'Perspectiva general desde la que se mira un problema.', 'Enfoque de determinantes sociales de la salud'],
            ],
        },
    },
    {
        id: 'teo-elegir', section: 'teorico', min: 4, title: 'Cómo elegir tus teorías',
        lead: ['Elige la teoría según tu variable dependiente: la que explique por qué cambia.'],
        panel: {
            type: 'chain', title: 'Tres preguntas para elegir', items: [
                { label: '¿Qué quiero explicar?', text: 'La inasistencia a citas médicas.', note: 'Tu variable principal.' },
                { label: '¿Qué teorías la explican?', text: 'Modelo de creencias en salud; determinantes sociales de la salud.', note: 'Búscalas en tus antecedentes: ¿qué teorías usan?' },
                { label: '¿Cuál se ajusta mejor?', text: 'La que incluye las variables que vas a medir (barreras, beneficios, transporte).', note: 'Esa será tu teoría principal.' },
            ],
        },
    },
    {
        id: 'teo-salud', section: 'teorico', min: 4, title: 'Teorías en salud',
        lead: ['Teorías muy usadas en proyectos de salud, enfermería y salud pública.'],
        panel: {
            type: 'tabs', title: 'Salud', items: [
                { id: 'mcs', label: 'Creencias en salud', what: 'Rosenstock (1974): las personas actúan para cuidar su salud según la amenaza que perciben, los beneficios, las barreras y las señales para la acción.', example: 'Sirve para: adherencia, inasistencia, vacunación, autocuidado.' },
                { id: 'orem', label: 'Déficit de autocuidado', what: 'Orem (1971): la persona necesita cuidados de enfermería cuando su capacidad de autocuidado no alcanza para sus necesidades.', example: 'Sirve para: enfermería, enfermedades crónicas, educación al paciente.' },
                { id: 'dss', label: 'Determinantes sociales', what: 'Dahlgren y Whitehead (1991) y la OMS (2008): la salud depende de condiciones sociales, económicas y ambientales, no solo de la atención médica.', example: 'Sirve para: desigualdades en salud, acceso, salud pública.' },
                { id: 'pender', label: 'Promoción de la salud', what: 'Pender (1982): las conductas saludables dependen de las características personales, las cogniciones y los afectos relacionados con la conducta.', example: 'Sirve para: estilos de vida, actividad física, alimentación.' },
            ],
        },
    },
    {
        id: 'teo-educacion', section: 'teorico', min: 4, title: 'Teorías en educación',
        lead: ['Teorías clásicas para proyectos sobre aprendizaje, enseñanza y rendimiento.'],
        panel: {
            type: 'tabs', title: 'Educación', items: [
                { id: 'piaget', label: 'Constructivismo', what: 'Piaget (1952): el conocimiento se construye por la interacción del sujeto con el medio, mediante asimilación y acomodación.', example: 'Sirve para: estrategias activas, desarrollo cognitivo.' },
                { id: 'vygotsky', label: 'Sociocultural', what: 'Vygotsky (1978): se aprende en interacción social; la zona de desarrollo próximo es lo que el estudiante logra con ayuda.', example: 'Sirve para: trabajo colaborativo, tutorías, mediación docente.' },
                { id: 'ausubel', label: 'Aprendizaje significativo', what: 'Ausubel (1963): se aprende cuando la nueva información se relaciona con lo que el estudiante ya sabe.', example: 'Sirve para: secuencias didácticas, organizadores previos.' },
                { id: 'gardner', label: 'Inteligencias múltiples', what: 'Gardner (1983; ampliada en 1995): existen varias inteligencias (lingüística, lógico-matemática, espacial, musical, corporal, interpersonal, intrapersonal, naturalista).', example: 'Sirve para: diversificar la enseñanza y la evaluación.' },
            ],
        },
    },
    {
        id: 'teo-negocios', section: 'teorico', min: 4, title: 'Teorías en administración y negocios',
        lead: ['Teorías frecuentes en proyectos de administración, mercadeo, talento humano y negocios digitales.'],
        panel: {
            type: 'tabs', title: 'Administración y negocios', items: [
                { id: 'maslow', label: 'Jerarquía de necesidades', what: 'Maslow (1943): las necesidades humanas se ordenan de las fisiológicas a la autorrealización.', example: 'Sirve para: motivación laboral, comportamiento del consumidor.' },
                { id: 'herzberg', label: 'Dos factores', what: 'Herzberg (1959): la satisfacción laboral depende de factores motivadores; la insatisfacción, de factores higiénicos.', example: 'Sirve para: clima organizacional, rotación de personal.' },
                { id: 'barney', label: 'Recursos y capacidades', what: 'Barney (1991): la ventaja competitiva proviene de recursos valiosos, raros, difíciles de imitar y bien organizados.', example: 'Sirve para: estrategia, competitividad de mipymes.' },
                { id: 'porter', label: 'Cinco fuerzas', what: 'Porter (1979): la rentabilidad de un sector depende de cinco fuerzas: competidores, nuevos entrantes, sustitutos, proveedores y clientes.', example: 'Sirve para: análisis de mercado y planes de negocio.' },
                { id: 'servqual', label: 'Calidad del servicio', what: 'Parasuraman, Zeithaml y Berry (1988), modelo SERVQUAL: la calidad es la diferencia entre lo que el cliente espera y lo que percibe.', example: 'Sirve para: satisfacción del cliente o del usuario.' },
            ],
        },
    },
    {
        id: 'teo-tecnologia', section: 'teorico', min: 4, title: 'Teorías sobre tecnología e innovación',
        lead: ['Para proyectos sobre adopción de tecnologías, sistemas e innovación.'],
        panel: {
            type: 'tabs', title: 'Tecnología e innovación', items: [
                { id: 'tam', label: 'Aceptación tecnológica (TAM)', what: 'Davis (1989): la intención de usar una tecnología depende de su utilidad percibida y su facilidad de uso percibida.', example: 'Sirve para: adopción de apps, plataformas, pagos digitales.' },
                { id: 'utaut', label: 'UTAUT', what: 'Venkatesh et al. (2003): el uso depende de la expectativa de desempeño, el esfuerzo, la influencia social y las condiciones facilitadoras.', example: 'Sirve para: aceptación de tecnologías en organizaciones.' },
                { id: 'rogers', label: 'Difusión de innovaciones', what: 'Rogers (1962): las innovaciones se adoptan por etapas y grupos: innovadores, adoptadores tempranos, mayoría temprana, mayoría tardía y rezagados.', example: 'Sirve para: implementación de nuevas prácticas o productos.' },
                { id: 'sistemas', label: 'Teoría general de sistemas', what: 'Bertalanffy (1968): una organización es un sistema de partes interrelacionadas que intercambia información y energía con su entorno.', example: 'Sirve para: ingeniería, procesos, sistemas de información.' },
                { id: 'goldratt', label: 'Teoría de restricciones', what: 'Goldratt (1984): el desempeño de un sistema lo limita su restricción más fuerte (el cuello de botella).', example: 'Sirve para: mejora de procesos productivos y logísticos.' },
            ],
        },
    },
    {
        id: 'teo-social', section: 'teorico', min: 4, title: 'Teorías sobre comportamiento y sociedad',
        lead: ['Para proyectos de psicología, trabajo social, comunicación y comportamiento.'],
        panel: {
            type: 'tabs', title: 'Comportamiento y sociedad', items: [
                { id: 'ajzen', label: 'Acción planeada', what: 'Ajzen (1991): la conducta depende de la intención, que a su vez depende de la actitud, la norma subjetiva y el control percibido.', example: 'Sirve para: intención de compra, de emprender, de estudiar.' },
                { id: 'bandura', label: 'Aprendizaje social', what: 'Bandura (1977): se aprende observando a otros; la autoeficacia influye en lo que la persona intenta y logra.', example: 'Sirve para: conductas de riesgo, autoeficacia académica.' },
                { id: 'bronfenbrenner', label: 'Ecológica', what: 'Bronfenbrenner (1979): el desarrollo ocurre en sistemas que se influyen: micro, meso, exo y macrosistema.', example: 'Sirve para: familia, escuela, comunidad, infancia.' },
                { id: 'deci', label: 'Autodeterminación', what: 'Deci y Ryan (1985): la motivación depende de la satisfacción de tres necesidades: autonomía, competencia y relación.', example: 'Sirve para: motivación académica y laboral.' },
                { id: 'brundtland', label: 'Desarrollo sostenible', what: 'Comisión Brundtland (1987): satisfacer las necesidades del presente sin comprometer las de las generaciones futuras.', example: 'Sirve para: proyectos ambientales y de responsabilidad social.' },
            ],
        },
    },
    {
        id: 'teo-estructura', section: 'teorico', min: 4, title: 'Cómo redactar una teoría',
        lead: ['Cada teoría se presenta en cuatro movimientos.'],
        panel: {
            type: 'chain', title: 'Cuatro movimientos', items: [
                { label: '1. Presentación', text: 'Nombre de la teoría, autor y año.', note: '«El modelo de creencias en salud, propuesto por Rosenstock (1974)…»' },
                { label: '2. Postulados', text: 'Qué plantea y cuáles son sus componentes.', note: 'Explícalos con tus palabras y cita.' },
                { label: '3. Uso reciente', text: 'Qué estudios la han aplicado a temas parecidos.', note: 'Conecta con tus antecedentes.' },
                { label: '4. Relación', text: 'Por qué sustenta tu estudio y qué variables explica.', note: '«Esta teoría sustenta la investigación porque…»' },
            ],
        },
    },
    {
        id: 'teo-ejemplo', section: 'teorico', min: 5, title: 'Una teoría redactada completa',
        lead: ['Así se ve una teoría con sus cuatro movimientos. Fíjate en las citas y en el cierre.'],
        panel: {
            type: 'example', title: 'Ejemplo (salud)', paragraphs: [
                'El modelo de creencias en salud, propuesto por Rosenstock (1974), plantea que la probabilidad de que una persona adopte una conducta saludable depende de cuatro percepciones: la susceptibilidad a la enfermedad, la gravedad de sus consecuencias, los beneficios de actuar y las barreras para hacerlo. A estas se suman las señales para la acción, como un recordatorio o el consejo de un profesional.',
                'Este modelo ha sido usado para estudiar la adherencia a tratamientos y la asistencia a controles médicos; por ejemplo, Pérez y Gómez (2022) lo emplearon para explicar la inasistencia en una IPS de Bogotá.',
                'Esta teoría sustenta la presente investigación porque permite explicar la inasistencia a partir de las barreras que perciben los pacientes (transporte, tiempo, costos) y de la ausencia de señales para la acción, como los recordatorios de la cita.',
            ],
        },
    },
    {
        id: 'teo-quiz', section: 'teorico', min: 3, title: '¿Qué teoría usarías?',
        lead: ['Elige la teoría que mejor sustenta cada proyecto.'],
        quiz: [
            q('Proyecto sobre la intención de los tenderos de usar pagos digitales.', ['Jerarquía de necesidades', 'Aceptación tecnológica (TAM)', 'Constructivismo'], 1, 'TAM explica la intención de usar una tecnología por su utilidad y facilidad percibidas.'),
            q('Proyecto sobre tutorías entre pares para mejorar el rendimiento en cálculo.', ['Sociocultural de Vygotsky', 'Cinco fuerzas de Porter', 'Determinantes sociales'], 0, 'El aprendizaje con ayuda de otros es central en la zona de desarrollo próximo.'),
            q('Proyecto sobre la rotación de personal en un call center.', ['Dos factores de Herzberg', 'Difusión de innovaciones', 'Déficit de autocuidado'], 0, 'Herzberg explica la satisfacción e insatisfacción laboral.'),
        ],
    },

    /* ---------- Marco Conceptual (30) ---------- */
    {
        id: 'con-quees', section: 'conceptual', min: 4, title: 'Qué es el Marco Conceptual',
        lead: ['El Marco Conceptual define los términos clave de tu título y tus variables según autores del área, para que todos los entiendan igual.'],
        bullets: ['Empieza por las palabras de tu título y tus variables.', 'Cada concepto lleva su autor y año.', 'Evita las definiciones de diccionario general.', 'Ordénalos de lo general a lo particular, o en el orden en que aparecen en el título.'],
        panel: {
            type: 'chain', title: 'De dónde salen los conceptos', items: [
                { label: 'Del título', text: 'Análisis de los factores asociados a la **inasistencia** a **citas médicas** en pacientes de **consulta externa**.', note: 'Inasistencia, cita médica, consulta externa.' },
                { label: 'De las variables', text: 'Olvido, barreras de acceso, satisfacción con el servicio.', note: 'Lo que vas a medir.' },
                { label: 'De la teoría', text: 'Barreras percibidas, señales para la acción.', note: 'Los componentes de tu teoría.' },
            ],
        },
    },
    {
        id: 'con-operacional', section: 'conceptual', min: 5, title: 'Definición conceptual y definición operacional',
        lead: ['La definición conceptual dice qué es; la operacional, cómo lo vas a medir. En el Marco Conceptual va la conceptual; la operacional se usa en la metodología.'],
        panel: {
            type: 'table', title: 'Un mismo concepto, dos definiciones', head: ['Concepto', 'Conceptual', 'Operacional'], rows: [
                ['Inasistencia', 'Ausencia del paciente a una cita programada sin cancelación previa (Pérez, 2022).', 'Número de citas perdidas registradas en el sistema durante el semestre.'],
                ['Rendimiento académico', 'Nivel de logro de los aprendizajes esperados (Lamas, 2015).', 'Nota final de matemáticas en la escala de 1 a 5.'],
                ['Satisfacción del cliente', 'Diferencia entre lo que el cliente espera y lo que percibe (Parasuraman et al., 1988).', 'Puntaje en la escala SERVQUAL de 22 ítems.'],
            ],
        },
    },
    {
        id: 'con-salud', section: 'conceptual', min: 3, title: 'Conceptos de ejemplo: salud',
        lead: ['Así se ve un Marco Conceptual breve en un proyecto de salud. Las definiciones son ilustrativas.'],
        panel: {
            type: 'example', title: 'Ejemplo', paragraphs: [
                '- **Cita médica:** espacio programado de atención entre un profesional de la salud y un paciente (Ministerio de Salud, 2019).',
                '- **Inasistencia:** ausencia del paciente a una cita programada sin cancelación previa (Pérez, 2022).',
                '- **Consulta externa:** atención ambulatoria programada que no requiere hospitalización (Ministerio de Salud, 2019).',
                '- **Barrera de acceso:** obstáculo geográfico, económico, organizacional o cultural que impide recibir atención oportuna (Díaz, 2023).',
            ],
        },
    },
    {
        id: 'con-educacion', section: 'conceptual', min: 3, title: 'Conceptos de ejemplo: educación',
        lead: ['En educación, define con autores del área pedagógica.'],
        panel: {
            type: 'example', title: 'Ejemplo', paragraphs: [
                '- **Rendimiento académico:** nivel de logro de los aprendizajes esperados en un área, expresado en calificaciones (Lamas, 2015).',
                '- **Estrategia didáctica:** conjunto de acciones planificadas por el docente para lograr un aprendizaje (Díaz-Barriga y Hernández, 2010).',
                '- **Aprendizaje significativo:** proceso en el que la nueva información se relaciona con lo que el estudiante ya sabe (Ausubel, 1963).',
                '- **Deserción escolar:** abandono del sistema educativo antes de terminar el ciclo (Ministerio de Educación Nacional, 2022).',
            ],
        },
    },
    {
        id: 'con-negocios', section: 'conceptual', min: 3, title: 'Conceptos de ejemplo: negocios',
        lead: ['En negocios, apóyate en autores de administración y mercadeo.'],
        panel: {
            type: 'example', title: 'Ejemplo', paragraphs: [
                '- **Transformación digital:** integración de tecnologías digitales en todas las áreas de una organización, que cambia la forma en que opera y entrega valor (Vial, 2019).',
                '- **Mipyme:** micro, pequeña o mediana empresa, según sus activos, empleados o ingresos (Ley 590 de 2000).',
                '- **Pago digital:** transacción hecha por medios electrónicos, sin efectivo (Banco de la República, 2023).',
                '- **Satisfacción del cliente:** diferencia entre lo que el cliente espera y lo que percibe del servicio (Parasuraman et al., 1988).',
            ],
        },
    },
    {
        id: 'con-redaccion', section: 'conceptual', min: 4, title: 'Lista o texto: dos formas de presentarlo',
        lead: ['Puedes presentar los conceptos como una lista de definiciones o como un texto que los conecta. Las dos son válidas; pregunta a tu asesor cuál prefiere.'],
        panel: {
            type: 'example', title: 'Como texto conectado', paragraphs: [
                'La inasistencia se entiende como la ausencia del paciente a una cita programada sin cancelación previa (Pérez, 2022). Esta ocurre principalmente en la consulta externa, definida como la atención ambulatoria programada que no requiere hospitalización (Ministerio de Salud, 2019). Entre sus causas se encuentran las barreras de acceso, es decir, los obstáculos geográficos, económicos u organizacionales que impiden recibir atención oportuna (Díaz, 2023).',
            ],
        },
    },
    {
        id: 'con-quiz', section: 'conceptual', min: 4, title: '¿Es una buena definición?',
        lead: ['Decide si cada definición sirve para el Marco Conceptual.'],
        quiz: [
            q('«Salud: estado de completo bienestar físico, mental y social, y no solo la ausencia de enfermedad (OMS, 1948).»', ['Sirve', 'No sirve'], 0, 'Es una definición reconocida, de un organismo del área, con su cita.'),
            q('«Educación: según el diccionario, acción de educar.»', ['Sirve', 'No sirve'], 1, 'Es circular y de diccionario general, sin autor del área.'),
            q('«Tienda de barrio: lugar donde la gente compra cosas.»', ['Sirve', 'No sirve'], 1, 'Es vaga y no tiene autor: busca una definición en estudios sobre comercio minorista.'),
        ],
    },
    {
        id: 'con-orden', section: 'conceptual', min: 4, title: 'Cuántos y en qué orden',
        lead: ['Define entre cinco y diez conceptos: los de tu título, tus variables y los componentes de tu teoría.'],
        panel: {
            type: 'chain', title: 'Un orden lógico', items: [
                { label: 'Primero', text: 'El concepto más general del tema.', note: 'Ej.: servicio de salud.' },
                { label: 'Luego', text: 'Tu variable principal.', note: 'Ej.: inasistencia.' },
                { label: 'Después', text: 'Las variables que la explican.', note: 'Ej.: barreras de acceso, olvido.' },
                { label: 'Al final', text: 'Los términos de tu contexto.', note: 'Ej.: consulta externa, hospital de segundo nivel.' },
            ],
        },
    },

    /* ---------- Marco Contextual (30) ---------- */
    {
        id: 'ctx-quees', section: 'contextual', min: 4, title: 'Qué es el Marco Contextual',
        lead: ['El Marco Contextual describe el lugar, la institución y la población donde ocurre tu estudio, con datos concretos y sus fuentes.'],
        bullets: ['No describas el país entero: llega a tu lugar.', 'Usa cifras con fuente (DANE, planes de desarrollo, informes institucionales).', 'Termina en la población de tu estudio.'],
        panel: {
            type: 'chain', title: 'Del lugar a tu población', items: [
                { label: 'Lugar', text: 'Municipio o región: ubicación, población, economía.', note: '' },
                { label: 'Institución', text: 'Tipo, tamaño, servicios, usuarios.', note: '' },
                { label: 'Población', text: 'Quiénes son y cuántos, con sus características.', note: '' },
            ],
        },
    },
    {
        id: 'ctx-niveles', section: 'contextual', min: 5, title: 'Los cuatro niveles del contexto',
        lead: ['Un buen Marco Contextual cubre estos niveles, en este orden.'],
        panel: {
            type: 'tabs', title: 'Niveles', items: [
                { id: 'geo', label: 'Geográfico', what: 'Ubicación, extensión, población total, zona urbana y rural.', example: 'Sincelejo es la capital del departamento de Sucre, en la región Caribe.' },
                { id: 'soc', label: 'Socioeconómico', what: 'Actividades económicas, pobreza, empleo, educación, salud.', example: 'Su economía se basa en el comercio, los servicios y la ganadería.' },
                { id: 'inst', label: 'Institucional', what: 'Historia breve, naturaleza (pública o privada), servicios, tamaño, misión.', example: 'Hospital público de segundo nivel con servicios de consulta externa y especialidades.' },
                { id: 'pob', label: 'Poblacional', what: 'Características de tu población: edad, sexo, régimen, nivel educativo, ocupación.', example: 'La mayoría de los pacientes son adultos del régimen subsidiado.' },
            ],
        },
    },
    {
        id: 'ctx-fuentes', section: 'contextual', min: 4, title: 'Dónde encontrar los datos del contexto',
        lead: ['Las cifras del contexto deben tener fuente, igual que en el resto del marco.'],
        panel: {
            type: 'list', title: 'Fuentes de datos', items: [
                { label: 'DANE', text: 'Censo, proyecciones de población, pobreza, empleo (dane.gov.co).' },
                { label: 'Planes de desarrollo', text: 'Municipal y departamental: diagnóstico de cada sector.' },
                { label: 'Instituciones', text: 'Informes de gestión, sitio web, oficina de estadística o calidad.' },
                { label: 'Sistemas sectoriales', text: 'Salud: SISPRO. Educación: SIMAT y resultados ICFES. Empresas: Cámara de Comercio.' },
            ],
        },
    },
    {
        id: 'ctx-ej-salud', section: 'contextual', min: 3, title: 'Ejemplo: un hospital',
        lead: ['Contexto de un proyecto de salud. Los datos institucionales son ilustrativos: usa los reales de tu lugar.'],
        panel: {
            type: 'example', title: 'Ejemplo', paragraphs: [
                'La investigación se desarrolla en Sincelejo, capital del departamento de Sucre, en la región Caribe colombiana. El estudio se realiza en un hospital público de segundo nivel que presta servicios de consulta externa, urgencias y hospitalización, y atiende en promedio 4.000 consultas externas al mes (informe de gestión del hospital, 2025). Los pacientes de consulta externa son en su mayoría adultos del régimen subsidiado, procedentes de la zona urbana y de municipios cercanos.',
            ],
        },
    },
    {
        id: 'ctx-ej-colegio', section: 'contextual', min: 3, title: 'Ejemplo: un colegio',
        lead: ['Contexto de un proyecto de educación.'],
        panel: {
            type: 'example', title: 'Ejemplo', paragraphs: [
                'El estudio se realiza en una institución educativa pública de Lorica, Córdoba, ubicada en la zona urbana del municipio. La institución ofrece educación preescolar, básica y media en jornada única, con cerca de 1.100 estudiantes (SIMAT, 2025). Los estudiantes de grado noveno, población del estudio, tienen entre 14 y 16 años y provienen en su mayoría de familias de estratos 1 y 2.',
            ],
        },
    },
    {
        id: 'ctx-ej-empresa', section: 'contextual', min: 3, title: 'Ejemplo: empresas',
        lead: ['Contexto de un proyecto de negocios.'],
        panel: {
            type: 'example', title: 'Ejemplo', paragraphs: [
                'El estudio se desarrolla en Montería, capital de Córdoba, cuya economía se basa en la ganadería, el comercio y los servicios. Según el registro mercantil de la Cámara de Comercio, la mayoría de las empresas de la ciudad son microempresas del sector comercio. La población del estudio son las tiendas de barrio de la comuna 4, en su mayoría negocios familiares atendidos por sus propietarios.',
            ],
        },
    },
    {
        id: 'ctx-errores', section: 'contextual', min: 4, title: 'Contexto vago y contexto concreto',
        lead: ['Compara y fíjate en qué cambia.'],
        panel: {
            type: 'table', title: 'Antes y después', head: ['Vago', 'Concreto'], rows: [
                ['Colombia es un país con muchos problemas de salud.', 'Sincelejo, capital de Sucre, tiene un hospital público de segundo nivel que atiende cerca de 4.000 consultas externas al mes.'],
                ['La institución es muy buena.', 'La institución es pública, de jornada única y tiene 1.100 estudiantes (SIMAT, 2025).'],
                ['Los tenderos son personas trabajadoras.', 'Las tiendas de la comuna 4 son negocios familiares atendidos por sus propietarios.'],
            ],
        },
    },
    {
        id: 'ctx-quiz', section: 'contextual', min: 4, title: '¿Va en el Marco Contextual?',
        lead: ['Decide si cada fragmento va en el Marco Contextual.'],
        quiz: [
            q('«La institución tiene 1.100 estudiantes en jornada única (SIMAT, 2025).»', ['Sí va', 'No va'], 0, 'Describe la institución con un dato y su fuente.'),
            q('«Según Vygotsky, el aprendizaje es social.»', ['Sí va', 'No va'], 1, 'Es teoría: va en el Marco Teórico.'),
            q('«La Ley 115 de 1994 regula la educación en Colombia.»', ['Sí va', 'No va'], 1, 'Es una norma: va en el Marco Legal.'),
        ],
    },

    /* ---------- Marco Legal (30) ---------- */
    {
        id: 'leg-quees', section: 'legal', min: 4, title: 'Qué es el Marco Legal',
        lead: ['El Marco Legal presenta las normas que regulan tu tema, ordenadas por jerarquía. Para cada una: qué establece y por qué se relaciona con tu estudio.'],
        bullets: ['Cita el número, el año y, si puedes, el artículo.', 'No copies la norma: resume lo que establece.', 'Incluye solo las que se relacionan con tu tema.'],
        panel: {
            type: 'list', title: 'Dónde buscar las normas', items: [
                { label: 'Gestor Normativo', text: 'Función Pública: leyes, decretos y resoluciones vigentes.' },
                { label: 'Secretaría del Senado', text: 'Leyes y Constitución con sus modificaciones.' },
                { label: 'Ministerios', text: 'Resoluciones y normas sectoriales (salud, educación, TIC, comercio).' },
                { label: 'Tu institución', text: 'Reglamentos, acuerdos y políticas internas.' },
            ],
        },
    },
    {
        id: 'leg-piramide', section: 'legal', min: 4, title: 'La pirámide normativa',
        lead: ['Las normas se presentan de mayor a menor jerarquía. Las internacionales, si las usas, van primero.'],
        panel: {
            type: 'chain', title: 'De mayor a menor', items: [
                { label: 'Internacional', text: 'Tratados, declaraciones y acuerdos (ONU, OMS, OIT, Agenda 2030).', note: '' },
                { label: 'Constitución Política de 1991', text: 'La norma de mayor jerarquía del país.', note: '' },
                { label: 'Leyes', text: 'Expedidas por el Congreso.', note: '' },
                { label: 'Decretos', text: 'Expedidos por el Gobierno para reglamentar las leyes.', note: '' },
                { label: 'Resoluciones', text: 'Expedidas por ministerios y entidades.', note: '' },
                { label: 'Normas locales e institucionales', text: 'Ordenanzas, acuerdos y reglamentos internos.', note: '' },
            ],
        },
    },
    {
        id: 'leg-internacional', section: 'legal', min: 4, title: 'Referentes internacionales',
        lead: ['Úsalos cuando tu tema se relacione con derechos o metas globales.'],
        panel: {
            type: 'tabs', title: 'Internacional', items: [
                { id: 'dudh', label: 'Declaración Universal de DD. HH.', what: 'ONU (1948): el artículo 25 reconoce el derecho a la salud y el 26, el derecho a la educación.', example: 'Para proyectos de salud o educación.' },
                { id: 'ods', label: 'Agenda 2030 (ODS)', what: 'ONU (2015): 17 Objetivos de Desarrollo Sostenible, como el 3 (salud), el 4 (educación de calidad) y el 8 (trabajo decente y crecimiento económico).', example: 'Para alinear el proyecto con metas globales.' },
                { id: 'helsinki', label: 'Declaración de Helsinki', what: 'Asociación Médica Mundial (1964, actualizada): principios éticos para la investigación con seres humanos.', example: 'Para proyectos de salud con participantes.' },
            ],
        },
    },
    {
        id: 'leg-salud', section: 'legal', min: 4, title: 'Normas de ejemplo: salud',
        lead: ['Normas colombianas frecuentes en proyectos de salud.'],
        panel: {
            type: 'table', title: 'Salud', head: ['Norma', 'Qué establece'], rows: [
                ['Constitución Política, art. 49', 'La atención en salud como servicio público a cargo del Estado.'],
                ['Ley 100 de 1993', 'Crea el Sistema de Seguridad Social Integral.'],
                ['Ley 1751 de 2015', 'Ley estatutaria: la salud como derecho fundamental autónomo.'],
                ['Resolución 8430 de 1993', 'Normas científicas, técnicas y administrativas para la investigación en salud.'],
                ['Ley 1581 de 2012', 'Protección de datos personales.'],
            ],
        },
    },
    {
        id: 'leg-educacion', section: 'legal', min: 4, title: 'Normas de ejemplo: educación',
        lead: ['Normas colombianas frecuentes en proyectos de educación.'],
        panel: {
            type: 'table', title: 'Educación', head: ['Norma', 'Qué establece'], rows: [
                ['Constitución Política, art. 67', 'La educación como derecho y servicio público con función social.'],
                ['Ley 115 de 1994', 'Ley General de Educación.'],
                ['Ley 30 de 1992', 'Organiza el servicio público de la educación superior.'],
                ['Decreto 1075 de 2015', 'Decreto Único Reglamentario del Sector Educación.'],
                ['Ley 1620 de 2013', 'Sistema Nacional de Convivencia Escolar.'],
            ],
        },
    },
    {
        id: 'leg-empresa', section: 'legal', min: 4, title: 'Normas de ejemplo: empresa y tecnología',
        lead: ['Normas colombianas frecuentes en proyectos de negocios, emprendimiento y TIC.'],
        panel: {
            type: 'table', title: 'Empresa y tecnología', head: ['Norma', 'Qué establece'], rows: [
                ['Constitución Política, art. 333', 'La libertad económica y la iniciativa privada dentro del bien común.'],
                ['Ley 590 de 2000', 'Promoción del desarrollo de las micro, pequeñas y medianas empresas.'],
                ['Ley 1341 de 2009', 'Principios y conceptos de la sociedad de la información y las TIC.'],
                ['Ley 2069 de 2020', 'Impulso al emprendimiento en Colombia.'],
                ['Ley 1581 de 2012', 'Protección de datos personales de clientes y usuarios.'],
            ],
        },
    },
    {
        id: 'leg-ejemplo', section: 'legal', min: 3, title: 'Una norma bien redactada',
        lead: ['Cada norma: nombre, qué establece y por qué se relaciona con tu estudio.'],
        panel: {
            type: 'example', title: 'Ejemplo (salud)', paragraphs: [
                'La Constitución Política de Colombia de 1991, en su artículo 49, establece la atención en salud como un servicio público a cargo del Estado. Se relaciona con el estudio porque el acceso oportuno a la consulta es parte de ese servicio.',
                'La Ley 1751 de 2015 consagra la salud como un derecho fundamental autónomo e incluye la oportunidad como uno de sus elementos. Se relaciona con el estudio porque la inasistencia afecta la oportunidad de la atención para otros pacientes.',
                'La Ley 1581 de 2012 regula la protección de los datos personales. Se relaciona con el estudio porque se usarán registros de citas de los pacientes, que deberán anonimizarse.',
            ],
        },
    },
    {
        id: 'leg-quiz', section: 'legal', min: 3, title: '¿En qué orden van?',
        lead: ['Comprueba que sabes ordenar y usar las normas.'],
        quiz: [
            q('¿Qué va primero en el Marco Legal?', ['La Ley 1751 de 2015', 'La Constitución Política de 1991', 'El reglamento del hospital'], 1, 'La Constitución es la norma de mayor jerarquía del país.'),
            q('¿Qué norma aplica a cualquier proyecto que recoja datos de personas?', ['Ley 1581 de 2012', 'Ley 590 de 2000', 'Ley 30 de 1992'], 0, 'Es la ley de protección de datos personales.'),
        ],
    },

    /* ---------- Citas APA (15) ---------- */
    {
        id: 'apa-texto', section: 'citas', min: 5, title: 'Citar en el texto (APA 7)',
        lead: ['Todo lo que tomes de otro autor se cita en el texto con apellido y año.'],
        bullets: ['Uno o dos autores: (Pérez, 2022) · (Pérez y Gómez, 2022).', 'Tres o más: (Pérez et al., 2022).', 'Institución: (Ministerio de Salud, 2024).', 'Sin fecha: (Pérez, s. f.).'],
        panel: {
            type: 'tabs', title: 'Formas de citar', items: [
                { id: 'parafrasis', label: 'Paráfrasis', what: 'Dices con tus palabras lo que dijo el autor. Es la forma más usada.', example: 'La inasistencia se asocia con el olvido de la cita (Pérez, 2022).' },
                { id: 'narrativa', label: 'Cita narrativa', what: 'El autor es parte de la oración.', example: 'Pérez (2022) encontró que el olvido es la causa más frecuente de las citas perdidas.' },
                { id: 'textual', label: 'Cita textual corta', what: 'Menos de 40 palabras: entre comillas y con página.', example: '«El olvido es la principal barrera» (Pérez, 2022, p. 15).' },
                { id: 'larga', label: 'Cita textual larga', what: '40 palabras o más: en bloque aparte, con sangría y sin comillas.', example: 'Úsala muy poco: es mejor parafrasear.' },
            ],
        },
    },
    {
        id: 'apa-referencias', section: 'citas', min: 5, title: 'La lista de referencias',
        lead: ['Cada cita del texto debe aparecer en la lista de referencias, en orden alfabético, con sangría francesa.'],
        panel: {
            type: 'tabs', title: 'Referencias por tipo de fuente', items: [
                { id: 'art', label: 'Artículo', what: 'Autor, A. A. (año). Título del artículo. Nombre de la Revista, volumen(número), páginas. https://doi.org/…', example: 'Pérez, A. y Gómez, L. (2022). Inasistencia a citas médicas en consulta externa. Revista de Salud Pública, 24(3), 10–25. https://doi.org/…' },
                { id: 'libro', label: 'Libro', what: 'Autor, A. A. (año). Título del libro (ed.). Editorial.', example: 'Hernández-Sampieri, R. y Mendoza, C. (2018). Metodología de la investigación: las rutas cuantitativa, cualitativa y mixta. McGraw-Hill.' },
                { id: 'tesis', label: 'Tesis', what: 'Autor, A. A. (año). Título [Tesis de maestría, Universidad]. Repositorio. URL', example: 'Díaz, M. (2023). Inasistencia en un centro de salud de Corozal [Tesis de pregrado, Universidad de Sucre]. Repositorio institucional.' },
                { id: 'ley', label: 'Ley', what: 'Nombre de la ley [entidad]. Número de ley. Fecha. Diario Oficial No.', example: 'Ley 1751 de 2015. Por medio de la cual se regula el derecho fundamental a la salud. 16 de febrero de 2015. Diario Oficial No. 49.427.' },
                { id: 'web', label: 'Página web', what: 'Autor u organización. (año, día mes). Título. Sitio. URL', example: 'Organización Mundial de la Salud. (2023). Determinantes sociales de la salud. https://www.who.int/…' },
            ],
        },
        action: 'referencias',
    },
    {
        id: 'apa-plagio', section: 'citas', min: 4, title: 'Parafrasear sin plagiar',
        lead: ['Copiar sin citar, o cambiar solo unas palabras, es plagio. Parafrasear es explicar la idea con tus palabras y tu estructura, y citar.'],
        panel: {
            type: 'table', title: 'Del original a la paráfrasis', head: ['', 'Texto'], rows: [
                ['Original', '«El olvido de la fecha de la cita fue la causa más frecuente de inasistencia entre los pacientes encuestados» (Pérez, 2022, p. 15).'],
                ['Plagio', 'El olvido de la fecha de la cita fue la causa más común de inasistencia entre los pacientes.'],
                ['Paráfrasis', 'Entre los pacientes encuestados, el olvido de la fecha fue el motivo de inasistencia más común (Pérez, 2022).'],
            ],
        },
    },

    /* ---------- Calidad (13) ---------- */
    {
        id: 'errores', section: 'calidad', min: 4, title: 'Diez errores frecuentes',
        lead: ['Revisa si tu marco cae en alguno de estos errores.'],
        panel: {
            type: 'accordion', title: 'Abre cada error para ver cómo corregirlo', items: [
                { error: 'Copiar y pegar sin citar', example: 'Párrafos de internet sin autor ni año.', fix: 'Parafrasea y cita cada idea. Copiar sin citar es plagio.' },
                { error: 'Antecedentes viejos', example: 'Todos los estudios son de hace 20 años.', fix: 'Prefiere los de los últimos diez años.' },
                { error: 'Antecedentes que solo se enumeran', example: 'Una lista de títulos.', fix: 'Para cada uno: qué hizo, qué encontró y cómo se relaciona con tu estudio.' },
                { error: 'Sin párrafo de síntesis', example: 'Los antecedentes terminan sin decir qué falta.', fix: 'Cierra con el vacío que tu estudio aborda.' },
                { error: 'Teorías que no se conectan', example: 'Explicar una teoría sin decir para qué sirve.', fix: 'Cierra con «Esta teoría sustenta la investigación porque…».' },
                { error: 'Demasiadas teorías', example: 'Diez teorías mencionadas en una línea cada una.', fix: 'Una o dos bien explicadas.' },
                { error: 'Conceptos de diccionario', example: 'Definir «salud» con el diccionario.', fix: 'Usa definiciones de autores del área.' },
                { error: 'Contexto genérico', example: 'Describir Colombia en general.', fix: 'Describe tu lugar y tu institución concretos, con datos.' },
                { error: 'Normas sin orden ni relación', example: 'Una lista de leyes.', fix: 'Ordénalas por jerarquía y di qué establece cada una y por qué importa.' },
                { error: 'Citas sin referencia', example: 'Citas en el texto que no están en la lista final.', fix: 'Revisa que cada cita tenga su referencia, y al revés.' },
            ],
        },
    },
    {
        id: 'juzga', section: 'calidad', min: 4, title: '¿En qué apartado va?',
        lead: ['Lee cada fragmento y decide en qué apartado del marco va.'],
        quiz: [
            q('«Inasistencia: ausencia del paciente a una cita programada sin cancelación previa (Pérez, 2022).»', ['Antecedentes', 'Marco Conceptual', 'Marco Teórico'], 1, 'Define un término clave con su autor.'),
            q('«El hospital está ubicado en Sincelejo y atiende 4.000 consultas externas al mes.»', ['Marco Contextual', 'Marco Legal', 'Antecedentes'], 0, 'Describe el lugar donde ocurre el estudio.'),
            q('«Gómez (2023) encontró en Cartagena que los recordatorios redujeron la inasistencia en un 25 %.»', ['Marco Teórico', 'Antecedentes', 'Marco Contextual'], 1, 'Es un estudio previo con su hallazgo.'),
            q('«Según Ajzen (1991), la conducta depende de la intención, la actitud, la norma subjetiva y el control percibido.»', ['Marco Teórico', 'Marco Conceptual', 'Marco Legal'], 0, 'Es una teoría con sus componentes.'),
        ],
    },
    {
        id: 'coherencia', section: 'calidad', min: 3, title: 'Un marco coherente con tu proyecto',
        lead: ['Todo el marco debe girar alrededor de tu título, tus variables y tu población.'],
        panel: {
            type: 'chain', title: 'Preguntas de control', items: [
                { label: 'Antecedentes', text: '¿Estudian mis variables o mi población?', note: '' },
                { label: 'Marco Teórico', text: '¿La teoría explica mi variable principal?', note: '' },
                { label: 'Marco Conceptual', text: '¿Están definidos todos los términos de mi título?', note: '' },
                { label: 'Marco Contextual', text: '¿Describe mi lugar y mi población?', note: '' },
                { label: 'Marco Legal', text: '¿Las normas regulan mi tema?', note: '' },
            ],
        },
    },

    /* ---------- Cierre (5) ---------- */
    {
        id: 'repaso', section: 'cierre', min: 3, title: 'Repaso',
        lead: ['Cuatro preguntas para comprobar lo aprendido.'],
        quiz: [
            q('¿Qué apartado responde «qué se ha investigado sobre el tema»?', ['Marco Teórico', 'Antecedentes', 'Marco Legal'], 1, 'Los antecedentes son los estudios previos.'),
            q('¿Cómo se ordenan las normas en el Marco Legal?', ['Por fecha', 'Por jerarquía', 'Alfabéticamente'], 1, 'De la Constitución a las normas institucionales.'),
            q('¿Qué cierra la sección de antecedentes?', ['Una opinión', 'Un párrafo con el vacío que aborda tu estudio', 'La lista de referencias'], 1, 'La síntesis muestra qué falta y cómo lo abordas.'),
            q('¿Qué diferencia hay entre definición conceptual y operacional?', ['Ninguna', 'La conceptual dice qué es; la operacional, cómo se mide', 'La operacional va en el Marco Legal'], 1, 'La operacional se usa en la metodología.'),
        ],
    },
    {
        id: 'cierre', section: 'cierre', min: 2, title: 'Lo que te llevas',
        bullets: [
            'Antecedentes: recientes, de varios ámbitos, con ficha, matriz y párrafo de síntesis.',
            'Marco Teórico: una o dos teorías bien explicadas y conectadas con tus variables.',
            'Marco Conceptual: los términos de tu título y tus variables, con autor.',
            'Marco Contextual: tu lugar, tu institución y tu población, con datos.',
            'Marco Legal: normas por jerarquía, con lo que establecen y su relación.',
            'Todo citado en APA 7.',
        ],
        status: true,
    },

    /* ---------- Construcción y revisión (30) ---------- */
    { id: 'construye', section: 'construccion', min: 20, title: 'Construye tu marco referencial', layout: 'builder' },
    { id: 'revision', section: 'revision', min: 6, title: 'Qué hace bueno a un marco referencial' },
]);
