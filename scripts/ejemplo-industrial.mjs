/*
 * Genera server/ejemplos/industrial.json: un proyecto completo de Ingeniería Industrial (ergonomía) que el
 * administrador puede crear con un botón. Misma estructura que scripts/ejemplo-sistemas.mjs: todas las secciones,
 * el cuestionario, la encuesta con sus respuestas y las tablas, calculadas con el análisis de la aplicación.
 *
 * Las respuestas son SIMULADAS (siempre iguales) y así lo dice el propio proyecto. Las fuentes citadas son
 * publicaciones reales; las cifras de los resultados salen de las respuestas simuladas.
 *
 * Uso:  node scripts/ejemplo-industrial.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { definicionEncuesta, LIKERT } from '../src/services/instrumentos.js';
import { analizarPorObjetivo, metaDePreguntas } from '../src/services/resultadosPunta.js';
import { correlacion, cruzar, descriptivos, fmt, fmtP, fuerza } from '../src/services/estadistica.js';

const raiz = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

/* ---------- Ficha del proyecto ---------- */
const QUIEN = 'operarios del área de producción';
const DONDE = 'una empresa de confecciones de Montería, Córdoba';
const CUANDO = 'el primer semestre de 2026';
const TITULO = `Factores asociados a las molestias musculoesqueléticas en operarios de ${DONDE}`;
const PREGUNTA = `¿Qué factores están asociados a las molestias musculoesqueléticas en los ${QUIEN} de ${DONDE}, durante ${CUANDO}?`;
const GENERAL = `Analizar los factores asociados a las molestias musculoesqueléticas en los ${QUIEN} de ${DONDE}, durante ${CUANDO}.`;
const ESPECIFICOS = [
    'Caracterizar las molestias musculoesqueléticas en los operarios del área de producción.',
    'Comparar las molestias musculoesqueléticas entre los operarios que realizan pausas activas y los que no.',
    'Establecer la relación entre las condiciones del puesto de trabajo y las molestias musculoesqueléticas en los operarios.',
];
const N = 320;
const MUESTRA = 175;

/* ---------- Cuestionario ---------- */
const VAR_MOLESTIAS = 'molestias musculoesqueléticas';
const VAR_PUESTO = 'condiciones del puesto de trabajo';
const FRECUENCIAS = ['Nunca o casi nunca', 'Algunas veces', 'Casi todos los días'];
const ZONAS = ['Cuello', 'Hombros', 'Espalda', 'Manos o muñecas', 'Ninguna'];
const PAUSAS = ['Ninguna', 'Una', 'Dos o más'];
const SEXOS = ['Mujer', 'Hombre', 'Prefiero no decirlo'];
const ANTIGUEDAD = ['Menos de 1 año', 'De 1 a 5 años', 'Más de 5 años'];
const PUESTOS = ['Costura', 'Corte', 'Planchado y acabado', 'Empaque'];
const q = (id, texto, tipo, objetivo, extra = {}) => ({ id, texto, tipo, opciones: [], objetivo, ...extra });
const PREGUNTAS = [
    q('fre01', '¿Con qué frecuencia sintió dolor o molestia en músculos o articulaciones durante el último mes?', 'opcion', 1, { opciones: FRECUENCIAS, variable: 'frecuencia de las molestias', dimension: 'Frecuencia', indicador: 'Frecuencia de dolor o molestia en el último mes' }),
    q('mol01', 'Al terminar la jornada siento dolor en el cuello o en los hombros.', 'likert', 1, { variable: VAR_MOLESTIAS, dimension: 'Cuello y miembros superiores', indicador: 'Dolor en cuello u hombros al final de la jornada' }),
    q('mol02', 'Siento dolor en la espalda durante la jornada.', 'likert', 1, { variable: VAR_MOLESTIAS, dimension: 'Espalda', indicador: 'Dolor de espalda durante la jornada' }),
    q('mol03', 'Siento hormigueo o dolor en las manos o en las muñecas.', 'likert', 1, { variable: VAR_MOLESTIAS, dimension: 'Cuello y miembros superiores', indicador: 'Hormigueo o dolor en manos o muñecas' }),
    q('mol04', 'Las molestias me obligan a detener o a disminuir mi ritmo de trabajo.', 'likert', 1, { variable: VAR_MOLESTIAS, dimension: 'Efecto en el trabajo', indicador: 'Interrupción del trabajo por las molestias' }),
    q('mol05', 'Las molestias continúan cuando estoy en casa.', 'likert', 1, { variable: VAR_MOLESTIAS, dimension: 'Efecto en el trabajo', indicador: 'Persistencia de las molestias fuera del trabajo' }),
    q('hor01', '¿Cuántas horas seguidas pasa en la misma postura durante la jornada?', 'numero', 1, { variable: 'frecuencia de las molestias', dimension: 'Exposición', indicador: 'Horas continuas en la misma postura' }),
    q('zon01', '¿En qué zonas del cuerpo ha sentido molestias en los últimos doce meses?', 'multiple', 1, { opciones: ZONAS, variable: 'frecuencia de las molestias', dimension: 'Localización', indicador: 'Zonas del cuerpo con molestias' }),
    q('pau01', '¿Realiza pausas activas durante la jornada?', 'sino', 2, { variable: 'pausas activas', dimension: 'Práctica de pausas', indicador: 'Realización de pausas activas' }),
    q('pau02', '¿Cuántas pausas activas hace en un día normal de trabajo?', 'opcion', 2, { opciones: PAUSAS, variable: 'pausas activas', dimension: 'Práctica de pausas', indicador: 'Número de pausas activas al día' }),
    q('pue01', 'Paso la mayor parte de la jornada en la misma postura.', 'likert', 3, { variable: VAR_PUESTO, dimension: 'Postura y repetición', indicador: 'Postura mantenida durante la jornada' }),
    q('pue02', 'Mi silla o mi mesa de trabajo no se ajustan a mi estatura.', 'likert', 3, { variable: VAR_PUESTO, dimension: 'Mobiliario y ambiente', indicador: 'Ajuste del mobiliario a la estatura' }),
    q('pue03', 'Repito los mismos movimientos de manos y brazos durante toda la jornada.', 'likert', 3, { variable: VAR_PUESTO, dimension: 'Postura y repetición', indicador: 'Movimientos repetitivos de manos y brazos' }),
    q('pue04', 'El ritmo de producción no me deja tiempo para descansar.', 'likert', 3, { variable: VAR_PUESTO, dimension: 'Organización del trabajo', indicador: 'Ritmo de producción sin tiempo de descanso' }),
    q('pue05', 'La iluminación de mi puesto me obliga a inclinarme o a forzar la postura.', 'likert', 3, { variable: VAR_PUESTO, dimension: 'Mobiliario y ambiente', indicador: 'Iluminación que obliga a forzar la postura' }),
    q('gen01', '¿Cuál es su sexo?', 'opcion', 0, { opciones: SEXOS }),
    q('gen02', '¿Cuánto tiempo lleva trabajando en la empresa?', 'opcion', 0, { opciones: ANTIGUEDAD }),
    q('gen03', '¿En qué puesto trabaja?', 'opcion', 0, { opciones: PUESTOS }),
    q('gen04', '¿Cuántos años tiene?', 'numero', 0),
];
const INSTRUMENTO = {
    id: 'cuest01', filaId: 'i1', tipo: 'encuesta', ubicacion: 'anexo',
    aplicaA: `${QUIEN} de ${DONDE}`,
    titulo: 'Cuestionario sobre molestias musculoesqueléticas y condiciones del puesto de trabajo',
    intro: 'Gracias por participar. Este cuestionario hace parte de un proyecto de investigación sobre las molestias musculares y de articulaciones en el trabajo. Es anónimo, toma unos cinco minutos y sus respuestas no se entregan a la empresa con su nombre: se usarán solo con fines académicos.',
    preguntas: PREGUNTAS,
};

/* ---------- Respuestas simuladas (siempre las mismas) ---------- */
let semilla = 20260309;
const azar = () => { semilla = (semilla * 1664525 + 1013904223) % 4294967296; return semilla / 4294967296; };
const normal = () => Math.sqrt(-2 * Math.log(1 - azar())) * Math.cos(2 * Math.PI * azar());
const elegir = (opciones, pesos) => { let r = azar() * pesos.reduce((a, b) => a + b, 0); for (let i = 0; i < opciones.length; i += 1) { r -= pesos[i]; if (r <= 0) return opciones[i]; } return opciones.at(-1); };
const escala = (x) => LIKERT[Math.max(0, Math.min(4, Math.round(x) - 1))];
const RESPUESTAS = Array.from({ length: MUESTRA }, () => {
    const puesto = elegir(PUESTOS, [0.52, 0.16, 0.18, 0.14]);
    const carga = normal() + (puesto === 'Costura' ? 0.35 : puesto === 'Empaque' ? -0.3 : 0); // exigencia del puesto (rasgo de fondo)
    const pausa = azar() < 1 / (1 + Math.exp(-(-0.35 - carga * 0.35)));
    const dolor = 0.58 * carga + 0.8 * normal() - (pausa ? 0.55 : 0); // tendencia a las molestias
    const zonas = ZONAS.slice(0, 4).filter((_, i) => azar() < [0.38, 0.33, 0.52, 0.36][i] + dolor * 0.1);
    return {
        fre01: dolor > 0.55 ? FRECUENCIAS[2] : dolor > -0.55 ? FRECUENCIAS[1] : FRECUENCIAS[0],
        mol01: escala(3.4 + dolor * 0.95 + normal() * 0.6),
        mol02: escala(3.65 + dolor * 0.95 + normal() * 0.6),
        mol03: escala(2.95 + dolor * 0.9 + normal() * 0.7),
        mol04: escala(2.5 + dolor * 0.85 + normal() * 0.7),
        mol05: escala(2.75 + dolor * 0.9 + normal() * 0.7),
        hor01: Math.max(1, Math.min(8, Math.round(3.6 + carga * 1.1 + normal() * 0.8))),
        zon01: zonas.length ? zonas : [ZONAS[4]],
        pau01: pausa ? 'Sí' : 'No',
        pau02: pausa ? elegir(PAUSAS, [0, 0.62, 0.38]) : elegir(PAUSAS, [0.9, 0.1, 0]),
        pue01: escala(3.9 + carga * 0.85 + normal() * 0.6),
        pue02: escala(3.0 + carga * 0.85 + normal() * 0.75),
        pue03: escala(4.0 + carga * 0.8 + normal() * 0.6),
        pue04: escala(3.35 + carga * 0.9 + normal() * 0.7),
        pue05: escala(2.7 + carga * 0.8 + normal() * 0.75),
        gen01: elegir(SEXOS, [0.71, 0.28, 0.01]),
        gen02: elegir(ANTIGUEDAD, [0.24, 0.47, 0.29]),
        gen03: puesto,
        gen04: Math.max(18, Math.min(60, Math.round(34 + normal() * 8.5))),
    };
});

/* ---------- Análisis: el mismo que hace la aplicación en «Resultados» ---------- */
const definition = definicionEncuesta(INSTRUMENTO);
const responses = RESPUESTAS.map((answers) => ({ answers }));
const OPERACIONALIZACION = PREGUNTAS.filter((p) => p.variable).map((p, i) => ({
    id: `op${String(i + 1).padStart(2, '0')}`, variable: p.variable,
    tipoVar: p.variable === VAR_MOLESTIAS || p.variable === 'frecuencia de las molestias' ? 'Dependiente' : 'Independiente',
    definicion: {
        [VAR_MOLESTIAS]: 'Dolor, hormigueo o incomodidad en músculos, tendones o articulaciones que el operario percibe y relaciona con su trabajo',
        'frecuencia de las molestias': 'Con qué frecuencia, dónde y bajo qué exposición aparecen las molestias',
        'pausas activas': 'Interrupciones breves de la tarea para estirar y mover las zonas del cuerpo más exigidas',
        [VAR_PUESTO]: 'Características del puesto que exigen posturas forzadas, movimientos repetitivos o un ritmo sin descanso',
    }[p.variable],
    dimension: p.dimension, indicador: p.indicador, item: p.texto,
    escala: { likert: 'likert', opcion: 'opcion', multiple: 'multiple', sino: 'sino', numero: 'numero' }[p.tipo], opciones: p.opciones, objetivo: p.objetivo,
}));
const PLAN = [
    { id: 'an1', objetivo: 'el objetivo específico 1', tecnica: 'estadística descriptiva (frecuencias, porcentajes, media y desviación estándar)', software: 'Jamovi', nota: 'describe qué molestias son más frecuentes, en qué zonas del cuerpo y cuánto afectan el trabajo' },
    { id: 'an2', objetivo: 'el objetivo específico 2', tecnica: 'tabla de contingencia y prueba ji-cuadrado, con V de Cramér', software: 'Jamovi', nota: 'compara la frecuencia de las molestias entre quienes hacen pausas activas y quienes no' },
    { id: 'an3', objetivo: 'el objetivo específico 3', tecnica: 'correlación de Pearson y de Spearman entre los puntajes de las dos escalas', software: 'Jamovi', nota: 'mide si a peores condiciones del puesto corresponden más molestias' },
];
const meta = metaDePreguntas(definition, INSTRUMENTO.id, [INSTRUMENTO], OPERACIONALIZACION);
const an = analizarPorObjetivo({ encuestas: [{ titulo: definition.titulo, definition, responses, meta }], especificos: ESPECIFICOS, plan: PLAN });

/* ---------- Cifras para redactar ---------- */
const col = (id) => RESPUESTAS.map((r) => r[id]);
const puntos = (id) => col(id).map((v) => LIKERT.indexOf(v) + 1);
const promedio = (ids) => RESPUESTAS.map((_, i) => ids.reduce((s, id) => s + puntos(id)[i], 0) / ids.length);
const pct = (n, total = MUESTRA) => `${fmt((n / total) * 100)} %`;
const cuenta = (id, valor) => col(id).filter((v) => (Array.isArray(v) ? v.includes(valor) : v === valor)).length;
const altos = (id) => puntos(id).filter((x) => x >= 4).length;
const MOL = ['mol01', 'mol02', 'mol03', 'mol04', 'mol05'];
const PUE = ['pue01', 'pue02', 'pue03', 'pue04', 'pue05'];
const dMol = descriptivos(promedio(MOL));
const dPue = descriptivos(promedio(PUE));
const dHoras = descriptivos(col('hor01'));
const dEdad = descriptivos(col('gen04'));
const items = (ids) => ids.map((id) => ({ id, texto: PREGUNTAS.find((p) => p.id === id).texto.replace(/\.$/, ''), media: descriptivos(puntos(id)).media, alto: altos(id) })).sort((a, b) => b.media - a.media);
const itemsMol = items(MOL);
const itemsPue = items(PUE);
const pauSi = cuenta('pau01', 'Sí');
const pauNo = MUESTRA - pauSi;
const diarias = (pau) => RESPUESTAS.filter((r) => r.pau01 === pau && r.fre01 === FRECUENCIAS[2]).length;
const ji = cruzar(col('pau01'), col('fre01'));
const corr = correlacion(promedio(PUE), promedio(MOL));
const m2 = (x) => fmt(x, 2);
if (!(ji.p < 0.05) || !(corr.pR < 0.05) || corr.r <= 0 || diarias('No') / pauNo <= diarias('Sí') / pauSi) throw new Error('Las respuestas simuladas no dieron las relaciones que el texto describe: ajusta la simulación.');
const alfa = (nombre) => an.confiabilidad.find((c) => c.escala === nombre);
const alfaMol = alfa(VAR_MOLESTIAS);
const alfaPue = alfa(VAR_PUESTO);
if (!alfaMol || !alfaPue || alfaMol.alfa < 0.7 || alfaPue.alfa < 0.7) throw new Error('La confiabilidad simulada quedó por debajo de 0,70.');
const zonaTop = ZONAS.slice(0, 4).map((z) => ({ z, n: cuenta('zon01', z) })).sort((a, b) => b.n - a.n);

/* ---------- Referencias (publicaciones reales) ---------- */
const REFERENCIAS = [
    { id: 'r01', tipo: 'informe', autores: 'Bernard, B. P.', anio: '1997', titulo: 'Musculoskeletal disorders and workplace factors: A critical review of epidemiologic evidence for work-related musculoskeletal disorders of the neck, upper extremity, and low back', numero: 'DHHS (NIOSH) Publication No. 97-141', editorial: 'National Institute for Occupational Safety and Health' },
    { id: 'r02', tipo: 'articulo', autores: 'Punnett, L.; Wegman, D. H.', anio: '2004', titulo: 'Work-related musculoskeletal disorders: The epidemiologic evidence and the debate', revista: 'Journal of Electromyography and Kinesiology', volumen: '14', numero: '1', paginas: '13-23', doi: '10.1016/j.jelekin.2003.09.015' },
    { id: 'r03', tipo: 'articulo', autores: 'da Costa, B. R.; Vieira, E. R.', anio: '2010', titulo: 'Risk factors for work-related musculoskeletal disorders: A systematic review of recent longitudinal studies', revista: 'American Journal of Industrial Medicine', volumen: '53', numero: '3', paginas: '285-323', doi: '10.1002/ajim.20750' },
    { id: 'r04', tipo: 'articulo', autores: 'Kuorinka, I.; Jonsson, B.; Kilbom, Å.; Vinterberg, H.; Biering-Sørensen, F.; Andersson, G.; Jørgensen, K.', anio: '1987', titulo: 'Standardised Nordic questionnaires for the analysis of musculoskeletal symptoms', revista: 'Applied Ergonomics', volumen: '18', numero: '3', paginas: '233-237', doi: '10.1016/0003-6870(87)90010-X' },
    { id: 'r05', tipo: 'articulo', autores: 'McAtamney, L.; Corlett, E. N.', anio: '1993', titulo: 'RULA: A survey method for the investigation of work-related upper limb disorders', revista: 'Applied Ergonomics', volumen: '24', numero: '2', paginas: '91-99', doi: '10.1016/0003-6870(93)90080-S' },
    { id: 'r06', tipo: 'articulo', autores: 'Hignett, S.; McAtamney, L.', anio: '2000', titulo: 'Rapid Entire Body Assessment (REBA)', revista: 'Applied Ergonomics', volumen: '31', numero: '2', paginas: '201-205', doi: '10.1016/S0003-6870(99)00039-3' },
    { id: 'r07', tipo: 'articulo', autores: 'Karasek, R. A.', anio: '1979', titulo: 'Job demands, job decision latitude, and mental strain: Implications for job redesign', revista: 'Administrative Science Quarterly', volumen: '24', numero: '2', paginas: '285-308', doi: '10.2307/2392498' },
    { id: 'r08', tipo: 'articulo', autores: 'Armstrong, T. J.; Buckle, P.; Fine, L. J.; Hagberg, M.; Jonsson, B.; Kilbom, Å.; Kuorinka, I. A.; Silverstein, B. A.; Sjøgaard, G.; Viikari-Juntura, E. R.', anio: '1993', titulo: 'A conceptual model for work-related neck and upper-limb musculoskeletal disorders', revista: 'Scandinavian Journal of Work, Environment & Health', volumen: '19', numero: '2', paginas: '73-84', doi: '10.5271/sjweh.1494' },
    { id: 'r09', tipo: 'libro', autores: 'Hernández-Sampieri, R.; Mendoza Torres, C. P.', anio: '2018', titulo: 'Metodología de la investigación: las rutas cuantitativa, cualitativa y mixta', editorial: 'McGraw-Hill Education' },
    { id: 'r10', tipo: 'libro', autores: 'George, D.; Mallery, P.', anio: '2003', titulo: 'SPSS for Windows step by step: A simple guide and reference, 11.0 update', edicion: '4.ª ed.', editorial: 'Allyn & Bacon' },
    { id: 'r11', tipo: 'ley', titulo: 'Ley 1562 de 2012', anio: '2012', descripcion: 'Por la cual se modifica el Sistema de Riesgos Laborales y se dictan otras disposiciones en materia de salud ocupacional', fecha: '11 de julio' },
    { id: 'r12', tipo: 'ley', titulo: 'Decreto 1072 de 2015', anio: '2015', descripcion: 'Por medio del cual se expide el Decreto Único Reglamentario del Sector Trabajo', fecha: '26 de mayo' },
    { id: 'r13', tipo: 'ley', titulo: 'Resolución 0312 de 2019', anio: '2019', descripcion: 'Por la cual se definen los estándares mínimos del Sistema de Gestión de la Seguridad y Salud en el Trabajo (SG-SST)', fecha: '13 de febrero' },
];

/* ---------- Textos del documento ---------- */
const obj = (i) => ESPECIFICOS[i].replace(/\.$/, '');
const minus = (s) => s.charAt(0).toLowerCase() + s.slice(1);

const ARBOL = {
    problema: 'los operarios del área de producción presentan molestias musculoesqueléticas',
    causas: ['Los puestos obligan a mantener la misma postura y a repetir movimientos durante toda la jornada', 'El mobiliario no se ajusta a la estatura de cada operario', 'Las pausas activas no se hacen de forma regular'],
    efectos: ['Los operarios trabajan con dolor y disminuyen su ritmo', 'Aumentan las ausencias y las incapacidades', 'La empresa pierde productividad y calidad en las prendas'],
};
const ARBOL_OBJ = {
    problema: 'Los operarios del área de producción trabajan sin molestias musculoesqueléticas',
    causas: ['Los puestos permiten alternar posturas y variar los movimientos durante la jornada', 'El mobiliario se ajusta a la estatura de cada operario', 'Las pausas activas se hacen de forma regular'],
    efectos: ['Los operarios trabajan sin dolor y mantienen su ritmo', 'Disminuyen las ausencias y las incapacidades', 'La empresa conserva su productividad y la calidad de las prendas'],
    explicacion: '',
};

const planteamientoForm = {
    contexto: 'Los trastornos musculoesqueléticos de origen laboral afectan el cuello, los miembros superiores y la espalda, y la evidencia epidemiológica los asocia con los movimientos repetitivos, las posturas forzadas y el esfuerzo sostenido (Bernard, 1997; Punnett y Wegman, 2004). La confección de prendas reúne varias de esas condiciones: el trabajo se hace sentado, con el tronco inclinado y con movimientos de manos que se repiten durante toda la jornada.',
    descripcion: `En ${DONDE}, los ${QUIEN} manifiestan dolor en la espalda, el cuello y las manos, y la empresa no cuenta con un diagnóstico de qué tan frecuentes son esas molestias ni de qué condiciones del puesto se asocian con ellas. La situación se estudia durante ${CUANDO}.`,
    causas: 'Entre las causas de esta situación se encuentran los puestos que obligan a mantener la misma postura y a repetir movimientos durante toda la jornada, el mobiliario que no se ajusta a la estatura de cada operario y las pausas activas que no se hacen de forma regular.',
    efectos: 'Como consecuencia, los operarios trabajan con dolor y disminuyen su ritmo, aumentan las ausencias y las incapacidades, y la empresa pierde productividad y calidad en las prendas.',
    cierre: 'Por lo anterior, resulta necesario investigar qué factores están asociados a las molestias musculoesqueléticas en esta población, como base para que la empresa priorice sus acciones de prevención.',
};
const planteamiento = Object.values(planteamientoForm).join('\n\n');

const justificacionForm = {
    importancia: `Este estudio es **conveniente** porque las molestias musculoesqueléticas pueden prevenirse cuando se conocen las condiciones del trabajo que las favorecen (da Costa y Vieira, 2010). Analizar los factores asociados a esas molestias en los ${QUIEN}, con datos de ${CUANDO}, da a la empresa una base para actuar.`,
    social: `Los principales beneficiarios serán los ${QUIEN} de ${DONDE}, pues los resultados permitirán orientar la prevención hacia los puestos y las prácticas que más los afectan. También se beneficia el área de seguridad y salud en el trabajo, que contará con un diagnóstico propio.`,
    practico: 'En lo práctico, el estudio entrega un cuestionario validado y un procedimiento de análisis que la empresa puede repetir cada año para saber si sus medidas de prevención están dando resultado.',
    teorico: 'En lo teórico, pone a prueba en una empresa local la relación entre exposición y efecto que plantea el modelo de Armstrong et al. (1993), y la influencia de la organización del trabajo que describe Karasek (1979).',
    viabilidad: 'El estudio es viable porque la empresa autoriza el acceso, el cuestionario se responde en unos cinco minutos durante la jornada y los recursos requeridos son los propios de los investigadores.',
};
const justificacion = Object.values(justificacionForm).join('\n\n');

const alcancesForm = {
    tipo: 'Correlacional',
    tematico: 'las molestias musculoesqueléticas, la práctica de pausas activas y las condiciones del puesto de trabajo',
    poblacion: QUIEN, lugar: DONDE, tiempo: CUANDO,
    resultados: 'un diagnóstico de las molestias musculoesqueléticas y la medida de su relación con las pausas activas y con las condiciones del puesto',
    exclusiones: 'No se hace un diagnóstico médico de los operarios, no se aplica una evaluación ergonómica por observación de cada puesto y no se diseña ni se pone en marcha un programa de intervención.',
    limites: [
        { limitacion: 'Las molestias se miden por autorreporte y no por examen médico', mitigacion: 'el cuestionario toma como referencia un instrumento estandarizado de síntomas y es anónimo' },
        { limitacion: 'El diseño transversal no permite afirmar que las condiciones del puesto sean la causa de las molestias', mitigacion: 'los resultados se interpretan como asociación y no como causalidad' },
        { limitacion: 'El estudio se hace en una sola empresa', mitigacion: 'las conclusiones se restringen a esa empresa y se recomienda replicarlo en otras del sector' },
    ],
};
const alcances = `El estudio tiene un alcance correlacional. Aborda ${alcancesForm.tematico} en los ${QUIEN} de ${DONDE}, durante ${CUANDO}. Entrega ${alcancesForm.resultados}.\n\n${alcancesForm.exclusiones}`;
const limitaciones = alcancesForm.limites.map((l) => `- ${l.limitacion}; para atenuarlo, ${l.mitigacion}.`).join('\n');

const ANTECEDENTES = [
    { autor: 'Bernard', anio: '1997', titulo: REFERENCIAS[0].titulo, ambito: 'Internacional', lugar: 'Estados Unidos', objetivo: 'revisar críticamente la evidencia epidemiológica sobre los trastornos musculoesqueléticos y los factores del lugar de trabajo', hallazgo: 'hay evidencia de que la repetición, la fuerza y la postura se asocian con trastornos del cuello, los miembros superiores y la espalda baja', relacion: 'sustenta las condiciones del puesto que mide este estudio: postura mantenida y movimientos repetitivos' },
    { autor: 'Punnett y Wegman', anio: '2004', titulo: REFERENCIAS[1].titulo, ambito: 'Internacional', lugar: 'Estados Unidos', objetivo: 'examinar la evidencia epidemiológica sobre el origen laboral de los trastornos musculoesqueléticos', hallazgo: 'la evidencia respalda que la exposición a movimientos repetitivos, esfuerzos intensos y posturas no neutras aumenta el riesgo de estos trastornos', relacion: 'respalda interpretar las molestias de los operarios como relacionadas con su trabajo' },
    { autor: 'da Costa y Vieira', anio: '2010', titulo: REFERENCIAS[2].titulo, ambito: 'Internacional', lugar: 'Estados Unidos', objetivo: 'identificar, a partir de estudios longitudinales, los factores de riesgo de los trastornos musculoesqueléticos de origen laboral', hallazgo: 'las posturas forzadas y el trabajo repetitivo aparecen entre los factores con evidencia razonable de relación causal', relacion: 'es el antecedente directo de la relación entre condiciones del puesto y molestias que examina el tercer objetivo' },
    { autor: 'Kuorinka et al.', anio: '1987', titulo: REFERENCIAS[3].titulo, ambito: 'Internacional', lugar: 'Países nórdicos', objetivo: 'proponer cuestionarios estandarizados para registrar síntomas musculoesqueléticos en poblaciones de trabajadores', hallazgo: 'el cuestionario permite registrar de forma comparable las molestias por zona del cuerpo en los últimos doce meses', relacion: 'sirvió de referencia para las preguntas del cuestionario sobre la zona y la frecuencia de las molestias' },
];
const marcoAntecedentes = [
    `La relación entre el trabajo y los trastornos musculoesqueléticos ha sido ampliamente estudiada. ${ANTECEDENTES[0].autor} (${ANTECEDENTES[0].anio}) concluyó que ${ANTECEDENTES[0].hallazgo}. En la misma línea, ${ANTECEDENTES[1].autor} (${ANTECEDENTES[1].anio}) señalaron que ${ANTECEDENTES[1].hallazgo}.`,
    `Con estudios longitudinales, ${ANTECEDENTES[2].autor} (${ANTECEDENTES[2].anio}) encontraron que ${ANTECEDENTES[2].hallazgo}. Para medir los síntomas, ${ANTECEDENTES[3].autor} (${ANTECEDENTES[3].anio}) propusieron un instrumento con el que ${minus(ANTECEDENTES[3].hallazgo)}.`,
    'En la revisión no se encontraron estudios de este tipo con operarios de la empresa donde se realiza la investigación, vacío que este proyecto busca atender.',
].join('\n\n');
const TEORIAS = [
    { nombre: 'Modelo de exposición y efecto de los trastornos musculoesqueléticos', autor: 'Armstrong et al.', anio: '1993', postulado: 'las exigencias del trabajo producen una dosis de carga sobre los tejidos, y esta desencadena respuestas que, según la capacidad de la persona, se acumulan hasta convertirse en molestia o lesión', relacion: 'explica por qué los puestos con más postura mantenida y más repetición concentran más molestias', fuente: REFERENCIAS[7].titulo },
    { nombre: 'Modelo de demanda y control', autor: 'Karasek', anio: '1979', postulado: 'la tensión en el trabajo aparece cuando las demandas son altas y la persona tiene poco margen para decidir cómo y cuándo hacer su tarea', relacion: 'permite entender que un ritmo de producción que no deja pausas aumente la carga que soporta el operario', fuente: REFERENCIAS[6].titulo },
];
const marcoTeorico = TEORIAS.map((x) => `El ${minus(x.nombre)} sostiene que ${x.postulado} (${x.autor}, ${x.anio}). En este estudio, ${x.relacion}.`).join('\n\n');
const CONCEPTOS = [
    { termino: 'Trastorno musculoesquelético de origen laboral', definicion: 'alteración de músculos, tendones, nervios o articulaciones que el trabajo causa o agrava', autor: 'Punnett y Wegman', anio: '2004', fuente: REFERENCIAS[1].titulo },
    { termino: 'Movimiento repetitivo', definicion: 'acción que se realiza de forma cíclica, con los mismos grupos musculares, durante buena parte de la jornada', autor: 'Bernard', anio: '1997', fuente: REFERENCIAS[0].titulo },
    { termino: 'Postura forzada', definicion: 'posición de una o varias articulaciones que se aleja de la posición neutra y aumenta la carga sobre los tejidos', autor: 'McAtamney y Corlett', anio: '1993', fuente: REFERENCIAS[4].titulo },
    { termino: 'Carga postural', definicion: 'exigencia que una postura impone al cuerpo entero, valorada según la posición del tronco, el cuello, las piernas y los brazos', autor: 'Hignett y McAtamney', anio: '2000', fuente: REFERENCIAS[5].titulo },
];
const marcoConceptual = [
    ...CONCEPTOS.map((c) => `**${c.termino}:** ${c.definicion} (${c.autor}, ${c.anio}).`),
    '**Pausa activa:** interrupción breve de la tarea para estirar y mover las zonas del cuerpo más exigidas; en este estudio se registra si el operario la realiza y cuántas veces al día.',
].join('\n\n');
const CONTEXTO = { lugar: 'Montería, Córdoba', caracteristicas: 'capital del departamento de Córdoba, en el Caribe colombiano', institucion: 'una empresa mediana dedicada a la confección de prendas de vestir', poblacion: `${N} operarios en el área de producción` };
const marcoContextual = `La investigación se desarrolla en ${CONTEXTO.institucion}, ubicada en ${CONTEXTO.lugar}, ${CONTEXTO.caracteristicas}. El área de producción tiene ${CONTEXTO.poblacion} en ${CUANDO}, distribuidos en los puestos de costura, corte, planchado y acabado, y empaque. El nombre de la empresa se reserva.`;
const NORMAS = [
    { tipo: 'Ley', numero: '1562', anio: '2012', establece: 'el Sistema General de Riesgos Laborales y la obligación de prevenir los riesgos derivados del trabajo', relacion: 'enmarca el deber de la empresa de identificar y controlar los factores que afectan la salud de sus operarios', fuente: 'Ley 1562 de 2012' },
    { tipo: 'Decreto', numero: '1072', anio: '2015', establece: 'las reglas del Sistema de Gestión de la Seguridad y Salud en el Trabajo, entre ellas la identificación de peligros y la valoración de riesgos', relacion: 'hace del diagnóstico de este estudio un insumo de la gestión que la empresa ya debe adelantar', fuente: 'Decreto 1072 de 2015' },
    { tipo: 'Resolución', numero: '0312', anio: '2019', establece: 'los estándares mínimos del Sistema de Gestión de la Seguridad y Salud en el Trabajo', relacion: 'fija los estándares frente a los cuales la empresa puede usar los resultados', fuente: 'Resolución 0312 de 2019' },
];
const marcoLegal = [
    `La Ley 1562 de 2012 regula ${NORMAS[0].establece}. Esta norma ${NORMAS[0].relacion}.`,
    `El Decreto 1072 de 2015 reúne ${NORMAS[1].establece}, lo que ${NORMAS[1].relacion}.`,
    `La Resolución 0312 de 2019 define ${NORMAS[2].establece} y, con ello, ${NORMAS[2].relacion}.`,
].join('\n\n');

const metEnfoque = 'La investigación tiene un enfoque cuantitativo, que mide variables con datos numéricos y los analiza con métodos estadísticos para describir, relacionar o explicar el fenómeno (Hernández-Sampieri y Mendoza Torres, 2018). Este enfoque permite medir con qué frecuencia aparecen las molestias, compararlas entre grupos y cuantificar su relación con las condiciones del puesto de trabajo.';
const metTipo = 'Es una investigación de tipo correlacional, pues mide el grado de relación entre variables, sin afirmar que una cause la otra. El estudio describe primero las molestias musculoesqueléticas y luego examina su asociación con las pausas activas y con las condiciones del puesto.';
const metDiseno = `Se utiliza un diseño no experimental transversal, en el que se observan las variables sin manipularlas y en un solo momento. El cuestionario se aplica una sola vez a los ${QUIEN}, durante ${CUANDO}.`;
const poblacionSugerida = `La población está conformada por los ${QUIEN} de ${DONDE}, que suman ${N} personas. La muestra se calculó para una población finita, con un nivel de confianza del 95 % y un margen de error del 5 %, y es de ${MUESTRA} operarios, elegidos por muestreo aleatorio simple a partir de la nómina del área. Se incluyeron operarios con al menos tres meses en la empresa que aceptaron participar; se excluyeron quienes estaban en incapacidad o en vacaciones durante la aplicación.`;
const metPlanAnalisis = PLAN.map((p, i) => `- **Objetivo específico ${i + 1}** (${minus(obj(i))}): los datos se analizarán mediante ${p.tecnica}, con apoyo de ${p.software}.`).join('\n');
const instrumentos = [
    `- **Encuesta (cuestionario):** se aplicará a los ${QUIEN} de ${DONDE} para todos los objetivos específicos. Su validez y confiabilidad se asegurarán mediante juicio de expertos y alfa de Cronbach. Consta de ${PREGUNTAS.length} preguntas (10 de escala tipo Likert, 5 de opción única, 1 de opción múltiple, 1 de sí o no y 2 numéricas) y se presenta completo [[anexo:${INSTRUMENTO.id}]]. Las preguntas sobre la zona y la frecuencia de las molestias toman como referencia el cuestionario nórdico estandarizado (Kuorinka et al., 1987).`,
    '',
    '### Validez y confiabilidad',
    'La validez de contenido del cuestionario se estableció mediante juicio de expertos: tres especialistas en ergonomía, seguridad y salud en el trabajo y metodología evaluaron la pertinencia, la claridad y la coherencia de cada ítem en una escala de 1 a 4. Se calculó el coeficiente V de Aiken para cada ítem; se conservaron los ítems con V ≥ 0,80 y los demás se ajustaron según las observaciones de los expertos.',
    '',
    `La confiabilidad se evaluó con el coeficiente alfa de Cronbach, calculado con las respuestas del estudio para cada escala. Se consideraron aceptables valores iguales o superiores a 0,70 (George y Mallery, 2003). La escala de molestias musculoesqueléticas obtuvo un alfa de ${m2(alfaMol.alfa)} y la de condiciones del puesto, de ${m2(alfaPue.alfa)}.`,
].join('\n');

const FASES = [
    { id: 'fa01', nombre: 'Diagnóstico de las molestias', objetivo: obj(0), descripcion: 'se construye y valida el cuestionario, se aplica a la muestra y se describen las molestias musculoesqueléticas', actividades: ['Construir el cuestionario a partir de la matriz de operacionalización', 'Validar el cuestionario mediante juicio de expertos', 'Aplicar el cuestionario a la muestra durante la jornada', 'Depurar y codificar las respuestas', 'Describir las molestias con frecuencias y medias en Jamovi'], tecnicas: 'encuesta (cuestionario), juicio de expertos, alfa de Cronbach, Jamovi', productos: 'informe descriptivo de las molestias musculoesqueléticas', duracion: 7, responsable: 'investigadores', recomendada: true },
    { id: 'fa02', nombre: 'Comparación según las pausas activas', objetivo: obj(1), descripcion: 'se compara la frecuencia de las molestias entre los operarios que hacen pausas activas y los que no', actividades: ['Clasificar a los participantes según hagan o no pausas activas', 'Construir la tabla de contingencia', 'Aplicar la prueba ji-cuadrado y calcular la V de Cramér', 'Interpretar las diferencias encontradas'], tecnicas: 'tabla de contingencia, prueba ji-cuadrado, Jamovi', productos: 'tabla comparativa de las molestias según las pausas activas', duracion: 3, responsable: 'investigadores', recomendada: true },
    { id: 'fa03', nombre: 'Relación entre el puesto y las molestias', objetivo: obj(2), descripcion: 'se calcula el puntaje de cada escala por participante y se mide la relación entre las condiciones del puesto y las molestias', actividades: ['Calcular el puntaje de condiciones del puesto y el de molestias por participante', 'Comprobar la confiabilidad de las dos escalas', 'Calcular las correlaciones de Pearson y de Spearman', 'Interpretar la dirección y la fuerza de la relación'], tecnicas: 'correlación de Pearson y de Spearman, Jamovi', productos: 'informe de la relación entre las condiciones del puesto y las molestias', duracion: 3, responsable: 'investigadores', recomendada: true },
    { id: 'fa04', nombre: 'Socialización de resultados', objetivo: 'Socializar los resultados del proyecto', descripcion: 'se redacta el informe final y se presentan los hallazgos a la gerencia y al área de seguridad y salud en el trabajo', actividades: ['Redactar el informe final', 'Preparar la presentación de resultados', 'Exponer los hallazgos ante la gerencia y el área de seguridad y salud en el trabajo', 'Recoger la retroalimentación'], tecnicas: 'informe escrito y presentación oral', productos: 'documento final y presentación de socialización', duracion: 3, responsable: 'investigadores', recomendada: true },
];
const TOTAL_SEMANAS = FASES.reduce((s, f) => s + f.duracion, 0);
let semana = 1;
const CRONOGRAMA = FASES.flatMap((f, i) => {
    const inicio = semana; semana += f.duracion;
    return f.actividades.map((actividad, j) => ({ id: `cr${i + 1}${j + 1}`, fase: `Fase ${i + 1}. ${f.nombre}`, actividad, inicio, fin: inicio + f.duracion - 1 }));
});
const fases = FASES.map((f, i) => `### Fase ${i + 1}. ${f.nombre}\nEn esta fase ${f.descripcion}. Responde a: ${minus(f.objetivo)}. Dura ${f.duracion} semanas y entrega como producto: ${f.productos}.\n\n${f.actividades.map((a) => `- ${a}.`).join('\n')}`).join('\n\n');

const PRESUPUESTO = [
    ['Recursos Humanos', 'Horas de los investigadores', `2 investigadores, 4 horas semanales, ${TOTAL_SEMANAS} semanas: ${2 * 4 * TOTAL_SEMANAS} horas × $20.000`, 2 * 4 * TOTAL_SEMANAS * 20000],
    ['Recursos Humanos', 'Juicio de expertos', '3 expertos, 2 horas cada uno × $60.000', 360000],
    ['Equipos', 'Uso de computadores', '2 computadores propios durante el proyecto (depreciación estimada)', 400000],
    ['Software', 'Jamovi', 'Software libre: sin costo', 0],
    ['Materiales/Muestreos', 'Impresión de cuestionarios', `${MUESTRA} cuestionarios de 2 hojas: ${MUESTRA * 2} hojas × $200`, MUESTRA * 2 * 200],
    ['Materiales/Muestreos', 'Lapiceros y tablas de apoyo', '20 lapiceros y 10 tablas de apoyo', 90000],
    ['Viajes/Salidas de campo', 'Transporte a la empresa', '2 investigadores × 14 visitas × $8.000', 224000],
    ['Imprevistos', 'Imprevistos', '5 % de los demás rubros', 0],
].map(([categoria, descripcion, justificacion, costo], i) => ({ id: 1795100000000 + i, categoria, descripcion, justificacion, fuente: 'Personal', costo, sugerido: true }));
PRESUPUESTO.at(-1).costo = Math.round((PRESUPUESTO.slice(0, -1).reduce((s, x) => s + x.costo, 0) * 0.05) / 1000) * 1000;

/* ---------- Resultados, discusión y conclusiones (con las cifras calculadas) ---------- */
const sexoM = cuenta('gen01', 'Mujer'); const sexoH = cuenta('gen01', 'Hombre');
const parrafoParticipantes = `Respondieron el cuestionario ${MUESTRA} operarios: ${sexoM} mujeres (${pct(sexoM)}) y ${sexoH} hombres (${pct(sexoH)}), con una edad media de ${m2(dEdad.media)} años (DE ${m2(dEdad.de)}). El ${pct(cuenta('gen03', PUESTOS[0]))} trabaja en ${PUESTOS[0].toLowerCase()}. Las dos escalas resultaron confiables: alfa de Cronbach de ${m2(alfaMol.alfa)} para las molestias musculoesqueléticas y de ${m2(alfaPue.alfa)} para las condiciones del puesto.`;
const R = [
    {
        hallazgo: `Se encontró que la molestia más frecuente fue «${itemsMol[0].texto}», con una media de ${m2(itemsMol[0].media)} sobre 5 y ${pct(itemsMol[0].alto)} de los operarios de acuerdo o totalmente de acuerdo`,
        datos: `Le siguió «${itemsMol[1].texto}» (media ${m2(itemsMol[1].media)}; ${pct(itemsMol[1].alto)}). La menos frecuente fue «${itemsMol.at(-1).texto}» (media ${m2(itemsMol.at(-1).media)}; ${pct(itemsMol.at(-1).alto)}). El puntaje global de molestias fue de ${m2(dMol.media)} (DE ${m2(dMol.de)}). El ${pct(cuenta('fre01', FRECUENCIAS[2]))} sintió dolor o molestia casi todos los días del último mes y el ${pct(cuenta('fre01', FRECUENCIAS[0]))}, nunca o casi nunca. Los operarios pasan en promedio ${m2(dHoras.media)} horas seguidas en la misma postura (DE ${m2(dHoras.de)}). La zona más señalada fue ${zonaTop[0].z.toLowerCase()} (${pct(zonaTop[0].n)}), seguida de ${zonaTop[1].z.toLowerCase()} (${pct(zonaTop[1].n)}); el ${pct(cuenta('zon01', ZONAS[4]))} no reportó molestias en ninguna zona.`,
        apoyoTipo: 'Tabla', apoyoTitulo: 'Resultados del objetivo específico 1: valoración por ítem', apoyoNota: '',
        interpretacion: 'indica que las molestias se concentran en la espalda, el cuello y los hombros, y que para una parte de los operarios son de casi todos los días',
        relacion: 'coincide con', antecedente: 'Bernard (1997)',
        explicacion: 'esa revisión asocia la postura mantenida y la repetición con trastornos del cuello, los miembros superiores y la espalda baja, las mismas zonas que señalan los operarios',
        teoria: TEORIAS[0].nombre, teoriaExplica: 'la carga que se acumula sobre los tejidos durante horas en la misma postura termina por percibirse como molestia',
        implicacion: 'la empresa debería empezar la prevención por los puestos donde se trabaja sentado y con el tronco inclinado', sugerido: true,
    },
    {
        hallazgo: `Se encontró que el ${pct(pauSi)} de los operarios (${pauSi}) realiza pausas activas durante la jornada y el ${pct(pauNo)} (${pauNo}) no`,
        datos: `Entre quienes no las realizan, el ${pct(diarias('No'), pauNo)} sintió molestias casi todos los días; entre quienes sí, el ${pct(diarias('Sí'), pauSi)}. La asociación entre las pausas activas y la frecuencia de las molestias fue estadísticamente significativa (ji-cuadrado = ${m2(ji.chi)}, gl = ${ji.gl}, p ${fmtP(ji.p)}; V de Cramér = ${m2(ji.v)}, asociación ${fuerza(ji.v)}). De quienes hacen pausas, el ${pct(cuenta('pau02', PAUSAS[2]), pauSi)} hace dos o más al día.`,
        apoyoTipo: 'Tabla', apoyoTitulo: an.porObjetivo[2].titulos.find((x) => /Asociación/.test(x)) || 'Distribución de respuestas', apoyoNota: '',
        interpretacion: 'muestra que los operarios que hacen pausas activas reportan molestias con menor frecuencia',
        relacion: 'amplía lo reportado por', antecedente: 'da Costa y Vieira (2010)',
        explicacion: 'esos autores identifican la postura forzada y el trabajo repetitivo como factores de riesgo; aquí, interrumpir esa exposición con pausas se asocia con menos molestias',
        teoria: TEORIAS[1].nombre, teoriaExplica: 'la pausa devuelve al operario algo de control sobre su ritmo y reduce la tensión que producen las demandas altas',
        implicacion: 'conviene programar las pausas activas dentro del turno, pues más de la mitad de los operarios no las hace', sugerido: true,
    },
    {
        hallazgo: `Se encontró una relación directa y ${fuerza(corr.r)} entre las condiciones del puesto de trabajo y las molestias musculoesqueléticas (r de Pearson = ${m2(corr.r)}, p ${fmtP(corr.pR)}; rho de Spearman = ${m2(corr.rho)}, p ${fmtP(corr.pRho)}; n = ${corr.n})`,
        datos: `El puntaje global de condiciones desfavorables del puesto fue de ${m2(dPue.media)} sobre 5 (DE ${m2(dPue.de)}). La condición más señalada fue «${itemsPue[0].texto}» (media ${m2(itemsPue[0].media)}; ${pct(itemsPue[0].alto)} de acuerdo o totalmente de acuerdo) y la menos señalada, «${itemsPue.at(-1).texto}» (media ${m2(itemsPue.at(-1).media)}; ${pct(itemsPue.at(-1).alto)}).`,
        apoyoTipo: 'Tabla', apoyoTitulo: an.porObjetivo[3].titulos.find((x) => /Correlación/.test(x)) || 'Resultados del objetivo específico 3: valoración por ítem', apoyoNota: '',
        interpretacion: 'indica que los operarios con puestos más exigentes en postura, repetición y ritmo son los que reportan más molestias, aunque el puesto no las explica por completo',
        relacion: 'coincide con', antecedente: 'Punnett y Wegman (2004)',
        explicacion: 'esos autores concluyen que la exposición a movimientos repetitivos y a posturas no neutras aumenta el riesgo de trastornos musculoesqueléticos',
        teoria: TEORIAS[0].nombre, teoriaExplica: 'a mayor exigencia del puesto, mayor dosis de carga sobre los tejidos y mayor probabilidad de que aparezca la molestia',
        implicacion: 'la prevención debería intervenir primero las condiciones más señaladas: la repetición de movimientos y la postura mantenida', sugerido: true,
    },
];
const resultadosForm = {
    porObjetivo: Object.fromEntries(R.map((r, i) => [String(i), r])),
    limitaciones: 'Las molestias se midieron por autorreporte y no por examen médico. El diseño transversal permite hablar de asociación, no de causa. El estudio se hizo en una sola empresa, por lo que los resultados no se generalizan a todo el sector.',
    futuras: 'Se sugiere complementar el cuestionario con una evaluación ergonómica por observación de los puestos, medir con un diseño cuasiexperimental el efecto de un programa de pausas activas y replicar el estudio en otras empresas de confecciones.',
    sugeridos: true,
};
const resultados = [parrafoParticipantes, ...R.map((r, i) => `### Objetivo específico ${i + 1}: ${minus(obj(i))}\n${r.hallazgo}. ${r.datos}`)].join('\n\n');
const articulo = (teoria) => `el ${minus(teoria)}`;
const discusion = [
    ...R.map((r, i) => `En cuanto al objetivo específico ${i + 1}, el resultado ${r.interpretacion}. Este hallazgo ${r.relacion} ${r.antecedente}: ${r.explicacion}. Según ${articulo(r.teoria)}, ${r.teoriaExplica}. En consecuencia, ${r.implicacion}.`),
    `**Limitaciones.** ${resultadosForm.limitaciones}`,
    `**Futuras investigaciones.** ${resultadosForm.futuras}`,
].join('\n\n');

const conclusionesForm = {
    especificas: {
        0: `Se caracterizaron las molestias musculoesqueléticas: la más extendida es «${minus(itemsMol[0].texto)}» (${pct(itemsMol[0].alto)} de los operarios), el ${pct(cuenta('fre01', FRECUENCIAS[2]))} las siente casi todos los días y la zona más señalada es ${zonaTop[0].z.toLowerCase()}.`,
        1: `Se compararon las molestias según las pausas activas: quienes las realizan reportan molestias con menor frecuencia, con una asociación estadísticamente significativa y ${fuerza(ji.v)} (V de Cramér = ${m2(ji.v)}); el ${pct(pauNo)} de los operarios no hace ninguna.`,
        2: `Se estableció que las condiciones del puesto de trabajo se relacionan de forma directa y ${fuerza(corr.r)} con las molestias musculoesqueléticas (r = ${m2(corr.r)}): a peores condiciones, más molestias.`,
    },
    general: 'En respuesta a la pregunta de investigación, las molestias musculoesqueléticas de los operarios del área de producción están asociadas a dos factores: no realizar pausas activas y trabajar en puestos con más postura mantenida, repetición y ritmo sin descanso. Ninguno de los dos las explica por completo, lo que sugiere que también pesan características de la persona que este estudio no midió.',
    recomendaciones: [
        { destinatario: 'La gerencia de la empresa', accion: 'programar dos pausas activas dentro de cada turno y asignar a alguien que las dirija' },
        { destinatario: 'El área de seguridad y salud en el trabajo', accion: 'evaluar por observación los puestos de costura y ajustar las sillas y las mesas a la estatura de cada operario' },
        { destinatario: 'Los operarios', accion: 'cambiar de postura cuando la tarea lo permita y reportar las molestias desde que aparecen' },
        { destinatario: 'Futuros investigadores', accion: 'medir el efecto de un programa de pausas activas con un diseño que permita hablar de causa' },
    ],
    sugeridas: true,
};
const conclusiones = [...Object.values(conclusionesForm.especificas).map((c, i) => `${i + 1}. ${c}`), '', conclusionesForm.general].join('\n');
const recomendaciones = conclusionesForm.recomendaciones.map((r) => `- **A ${minus(r.destinatario)}:** ${r.accion.charAt(0).toUpperCase()}${r.accion.slice(1)}.`).join('\n');

const introduccionForm = {
    contexto: 'Los trastornos musculoesqueléticos de origen laboral se asocian con los movimientos repetitivos y las posturas forzadas, condiciones habituales en la confección de prendas (Punnett y Wegman, 2004).',
    problema: `En ${DONDE}, los ${QUIEN} manifiestan dolor en la espalda, el cuello y las manos, y la empresa no sabe qué tan frecuentes son esas molestias ni con qué condiciones del puesto se relacionan.`,
    importancia: 'Conocerlo es necesario para orientar la prevención hacia los puestos y las prácticas que más afectan a los operarios.',
    objetivo: `En consecuencia, esta investigación tiene como objetivo ${minus(GENERAL.replace(/\.$/, ''))}, para responder a la pregunta: ${PREGUNTA}`,
    metodo: `Para ello, se desarrolla un estudio de enfoque cuantitativo, de tipo correlacional y diseño no experimental transversal, con un cuestionario aplicado a ${MUESTRA} operarios.`,
    organizacion: 'El documento presenta primero el planteamiento del problema, los objetivos y la justificación; luego el marco referencial y la metodología; después los resultados y su discusión, y por último las conclusiones y recomendaciones.',
};
const introduccion = Object.values(introduccionForm).join('\n\n');

const resumenForm = {
    contexto: 'Los trastornos musculoesqueléticos de origen laboral son frecuentes en trabajos con posturas mantenidas y movimientos repetitivos, como la confección de prendas.',
    objetivo: `Esta investigación tuvo como objetivo ${minus(GENERAL.replace(/\.$/, ''))}.`,
    metodologia: `Se desarrolló un estudio cuantitativo, correlacional, de diseño no experimental transversal, con un cuestionario de ${PREGUNTAS.length} preguntas aplicado a ${MUESTRA} operarios elegidos por muestreo aleatorio simple.`,
    resultados: `Los resultados mostraron que el ${pct(cuenta('fre01', FRECUENCIAS[2]))} siente molestias casi todos los días, que quienes hacen pausas activas las reportan con menor frecuencia (V de Cramér = ${m2(ji.v)}) y que las condiciones del puesto se relacionan de forma directa con las molestias (r = ${m2(corr.r)}).`,
    conclusiones: 'Se concluye que las molestias están asociadas a la falta de pausas activas y a puestos con más postura mantenida, repetición y ritmo sin descanso, por lo que se recomienda programar las pausas dentro del turno y ajustar el mobiliario.',
    claves: ['ergonomía', 'trastornos musculoesqueléticos', 'pausas activas', 'puesto de trabajo', 'confecciones'],
};
const resumen = [resumenForm.contexto, resumenForm.objetivo, resumenForm.metodologia, resumenForm.resultados, resumenForm.conclusiones].join(' ');

/* ---------- Tablas y figuras de resultados ---------- */
// Cada tabla va después del párrafo que la comenta: 1 = participantes; 2, 3 y 4 = objetivos específicos 1, 2 y 3.
const elementos = [
    ...an.tablas.map((x, i) => ({ id: `tb${String(i + 1).padStart(2, '0')}`, seccion: 'resultados', tipo: 'tabla', auto: true, titulo: x.titulo, nota: x.nota, head: x.head, rows: x.rows, despues: (x.objetivo || 0) + 1 })),
    ...an.figuras.map((f, i) => ({ id: `fg${String(i + 1).padStart(2, '0')}`, seccion: 'resultados', tipo: 'figura', auto: true, titulo: f.titulo, nota: f.nota, despues: (f.objetivo || 0) + 1 })),
];
const figuras = an.figuras.map((f, i) => ({ id: `fg${String(i + 1).padStart(2, '0')}`, variable: { nombre: f.variable.nombre, clase: f.variable.clase, frec: f.variable.frec, n: f.variable.n } }));

/* ---------- Proyecto ---------- */
const FRASE = `En ${DONDE}, ${QUIEN} presentan molestias musculoesqueléticas relacionadas con su trabajo, durante ${CUANDO}.`;
const data = {
    idea: { temas: 'ergonomía y salud en el trabajo', problema: 'molestias musculoesqueléticas relacionadas con el trabajo', causa1: ARBOL.causas[0], causa2: ARBOL.causas[1], causa3: ARBOL.causas[2], efecto1: ARBOL.efectos[0], efecto2: ARBOL.efectos[1], efecto3: ARBOL.efectos[2], quien: QUIEN, donde: DONDE, cuando: CUANDO, antecedente1: 'Bernard (1997)', antecedente2: 'Punnett y Wegman (2004)', programa: 'Ingeniería Industrial', nivel: 'Pregrado', alcance: 'relacionar', frase: FRASE, elegida: FRASE },
    tituloForm: { accion: 'Factores asociados a', objeto: 'las molestias musculoesqueléticas', donde: DONDE, quien: 'operarios', cuando: '', paraque: '', includeParaque: false, includeQuien: true, includeDonde: true, includeCuando: false },
    titulo: TITULO,
    preguntaForm: { tipo: 'Correlacional', inicio: '¿Qué factores están asociados a', inicioLibre: '', objeto: 'las molestias musculoesqueléticas', var2: '', quien: `los ${QUIEN}`, donde: DONDE, cuando: CUANDO },
    preguntaTipo: 'Correlacional',
    pregunta: PREGUNTA,
    arbol: ARBOL,
    arbolObjetivos: ARBOL_OBJ,
    planteamientoForm, planteamiento,
    objetivosForm: { general: GENERAL, especificos: ESPECIFICOS },
    objetivoGeneral: GENERAL,
    objetivos: `### Objetivo general\n${GENERAL}\n\n### Objetivos específicos\n${ESPECIFICOS.map((o, i) => `${i + 1}. ${o}`).join('\n')}`,
    justificacionForm, justificacion,
    alcancesForm, alcances, limitaciones,
    marcoForm: { antecedentes: ANTECEDENTES, teorias: TEORIAS, conceptos: CONCEPTOS, contexto: CONTEXTO, normas: NORMAS },
    marcoAntecedentes, marcoTeorico, marcoConceptual, marcoContextual, marcoLegal,
    enfoque: 'Cuantitativo', tipoInvestigacion: 'Correlacional', diseno: 'no experimental transversal',
    metEnfoque, metTipo, metDiseno, poblacionSugerida, poblacionTipo: 'finita', poblacionTamano: N, muestraConfianza: 1.96, muestraError: 0.05,
    metPlanAnalisis, instrumentos,
    metodologia: [metEnfoque, metTipo, metDiseno, poblacionSugerida].join('\n\n'),
    metodologiaForm: {
        enfoqueTexto: metEnfoque.split('. ').slice(1).join('. '), tipoTexto: metTipo.split('. ').slice(1).join('. '), disenoTexto: metDiseno.split('. ').slice(1).join('. '),
        poblacion: { descripcion: `${QUIEN} de ${DONDE}`, unidad: 'operario del área de producción', inclusion: 'operarios con al menos tres meses en la empresa que aceptaron participar', exclusion: 'operarios en incapacidad o en vacaciones durante la aplicación', muestreo: 'aleatorio simple', muestraTexto: '', estratos: [], perdidas: 0 },
        analisis: PLAN,
        instrumentos: [{ id: 'i1', tecnica: 'Encuesta', instrumento: 'cuestionario', aplicaA: `${QUIEN} de ${DONDE}`, objetivo: 'todos los objetivos específicos', nota: 'permite medir las molestias, las pausas activas y las condiciones del puesto en una sola aplicación', validaciones: ['juicio de expertos', 'alfa de Cronbach'], validez: 'juicio de expertos' }],
        cronograma: CRONOGRAMA,
    },
    instrumentosGen: [INSTRUMENTO],
    operacionalizacion: OPERACIONALIZACION, operacionalizacionAuto: false,
    cronogramaItems: CRONOGRAMA.map(({ fase, actividad, inicio, fin }) => ({ fase, actividad, inicio, fin })),
    ganttUnidad: 'semanal', ganttPeriodos: TOTAL_SEMANAS,
    presupuesto: PRESUPUESTO,
    presupuestoBase: { n: `${MUESTRA} (muestra calculada)`, instrumentos: ['Encuesta: cuestionario'], duracion: `${TOTAL_SEMANAS} semanas`, integrantes: 2 },
    fasesForm: { unidad: 'semanas', fases: FASES, recomendadas: true },
    fases,
    resultadosForm, resultados, discusion, elementos,
    conclusionesForm, conclusiones, recomendaciones,
    introduccionForm, introduccion,
    resumenForm, resumen, palabrasClave: resumenForm.claves.join(', '),
    referencias: REFERENCIAS,
    ciudad: 'Montería, Córdoba',
    estilo: { persona: 'impersonal', tiempo: 'pasado', terminos: [{ usar: 'operario', enLugarDe: 'obrero' }, { usar: 'molestia musculoesquelética', enLugarDe: 'dolencia' }], evitar: ['hoy en día'], notas: '' },
    ejemplo: { clave: 'industrial', aviso: 'Proyecto de ejemplo. Las respuestas de la encuesta son simuladas; las fuentes citadas son publicaciones reales.' },
};

const salida = {
    clave: 'industrial',
    nombre: 'Ejemplo · Ingeniería Industrial: molestias musculoesqueléticas',
    data,
    encuestas: [{ instrumentId: INSTRUMENTO.id, definition, respuestas: RESPUESTAS }],
    figuras,
};
const destino = path.join(raiz, 'server', 'ejemplos', 'industrial.json');
fs.mkdirSync(path.dirname(destino), { recursive: true });
fs.writeFileSync(destino, `${JSON.stringify(salida)}\n`);
console.log(`${destino}\n${(fs.statSync(destino).size / 1024).toFixed(0)} KB · proyecto ${(JSON.stringify(data).length / 1024).toFixed(0)} KB · ${RESPUESTAS.length} respuestas · ${an.tablas.length} tablas · ${an.figuras.length} figuras`);
console.log(`alfa molestias ${m2(alfaMol.alfa)} · alfa puesto ${m2(alfaPue.alfa)} · r ${m2(corr.r)} · V ${m2(ji.v)} (p ${fmtP(ji.p)}) · con pausas ${pauSi} · diarias sin/con ${pct(diarias('No'), pauNo)} / ${pct(diarias('Sí'), pauSi)}`);
