/*
 * Genera server/ejemplos/sistemas.json: un proyecto completo de Ingeniería de Sistemas que el administrador puede
 * crear con un botón. Trae todas las secciones, el cuestionario, la encuesta publicada con sus respuestas y las
 * tablas de resultados, calculadas con el mismo análisis que usa la aplicación.
 *
 * Las respuestas son SIMULADAS (se generan aquí, siempre iguales) y así lo dice el propio proyecto. Las fuentes
 * citadas son publicaciones reales; las cifras de los resultados salen de las respuestas simuladas.
 *
 * Uso:  node scripts/ejemplo-sistemas.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { definicionEncuesta, LIKERT } from '../src/services/instrumentos.js';
import { analizarPorObjetivo, metaDePreguntas } from '../src/services/resultadosPunta.js';
import { correlacion, cruzar, descriptivos, fmt, fmtP, fuerza } from '../src/services/estadistica.js';

const raiz = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

/* ---------- Ficha del proyecto ---------- */
const QUIEN = 'estudiantes de pregrado de la Facultad de Ingeniería';
const DONDE = 'una universidad de Montería, Córdoba';
const CUANDO = 'el primer semestre de 2026';
const TITULO = `Factores asociados al uso de contraseñas inseguras en estudiantes de ${DONDE}`;
const PREGUNTA = `¿Qué factores están asociados al uso de contraseñas inseguras en los ${QUIEN} de ${DONDE}, durante ${CUANDO}?`;
const GENERAL = `Analizar los factores asociados al uso de contraseñas inseguras en los ${QUIEN} de ${DONDE}, durante ${CUANDO}.`;
const ESPECIFICOS = [
    'Caracterizar el uso de contraseñas inseguras en los estudiantes de pregrado de la Facultad de Ingeniería.',
    'Comparar el uso de contraseñas inseguras entre los estudiantes que han recibido capacitación en seguridad informática y los que no.',
    'Establecer la relación entre el conocimiento sobre seguridad informática y el uso de contraseñas inseguras en los estudiantes.',
];
const N = 1200;
const MUESTRA = 292;

/* ---------- Cuestionario ---------- */
const VAR_PRACTICAS = 'prácticas inseguras de manejo de contraseñas';
const VAR_CONOCIMIENTO = 'conocimiento sobre seguridad informática';
const LONGITUDES = ['Menos de 8 caracteres', 'Entre 8 y 11 caracteres', '12 caracteres o más'];
const MEDIDAS = ['Verificación en dos pasos', 'Gestor de contraseñas', 'Huella o reconocimiento facial', 'Ninguna'];
const RECOMENDACIONES = ['Nunca', 'Una vez', 'Varias veces'];
const SEXOS = ['Mujer', 'Hombre', 'Prefiero no decirlo'];
const SEMESTRES = ['1.º a 3.º semestre', '4.º a 6.º semestre', '7.º a 10.º semestre'];
const PROGRAMAS = ['Ingeniería de Sistemas', 'Ingeniería Industrial', 'Ingeniería Ambiental', 'Ingeniería Mecánica'];
const q = (id, texto, tipo, objetivo, extra = {}) => ({ id, texto, tipo, opciones: [], objetivo, ...extra });
const PREGUNTAS = [
    q('lon01', '¿Cuántos caracteres tiene la contraseña que más usa?', 'opcion', 1, { opciones: LONGITUDES, variable: 'seguridad de la contraseña', dimension: 'Longitud', indicador: 'Número de caracteres de la contraseña más usada' }),
    q('pra01', 'Uso la misma contraseña en varias cuentas.', 'likert', 1, { variable: VAR_PRACTICAS, dimension: 'Reutilización', indicador: 'Uso de una misma contraseña en varias cuentas' }),
    q('pra02', 'Mis contraseñas incluyen datos personales, como mi nombre o mi fecha de nacimiento.', 'likert', 1, { variable: VAR_PRACTICAS, dimension: 'Composición', indicador: 'Inclusión de datos personales en la contraseña' }),
    q('pra03', 'Comparto mis contraseñas con compañeros, amigos o familiares.', 'likert', 1, { variable: VAR_PRACTICAS, dimension: 'Custodia', indicador: 'Divulgación de la contraseña a otras personas' }),
    q('pra04', 'Guardo mis contraseñas en papel o en notas del celular sin protección.', 'likert', 1, { variable: VAR_PRACTICAS, dimension: 'Custodia', indicador: 'Almacenamiento de la contraseña sin protección' }),
    q('pra05', 'Cambio mis contraseñas solo cuando el sistema me obliga.', 'likert', 1, { variable: VAR_PRACTICAS, dimension: 'Reutilización', indicador: 'Cambio de contraseña solo por obligación' }),
    q('cue01', '¿En cuántas cuentas usa su contraseña principal?', 'numero', 1, { variable: VAR_PRACTICAS, dimension: 'Reutilización', indicador: 'Número de cuentas con la misma contraseña' }),
    q('med01', '¿Cuáles de estas medidas de protección usa en sus cuentas?', 'multiple', 1, { opciones: MEDIDAS, variable: 'seguridad de la contraseña', dimension: 'Protección adicional', indicador: 'Medidas de protección activadas' }),
    q('cap01', '¿Ha recibido alguna capacitación en seguridad informática?', 'sino', 2, { variable: 'capacitación en seguridad informática', dimension: 'Formación recibida', indicador: 'Haber recibido capacitación' }),
    q('cap02', '¿Con qué frecuencia ha recibido recomendaciones de seguridad por parte de la universidad?', 'opcion', 2, { opciones: RECOMENDACIONES, variable: 'capacitación en seguridad informática', dimension: 'Formación recibida', indicador: 'Frecuencia de recomendaciones institucionales' }),
    q('con01', 'Sé reconocer un correo o mensaje que intenta robar mis datos (phishing).', 'likert', 3, { variable: VAR_CONOCIMIENTO, dimension: 'Amenazas', indicador: 'Reconocimiento de mensajes fraudulentos' }),
    q('con02', 'Sé que una contraseña larga es más segura que una corta con símbolos.', 'likert', 3, { variable: VAR_CONOCIMIENTO, dimension: 'Contraseñas', indicador: 'Conocimiento de la importancia de la longitud' }),
    q('con03', 'Conozco qué es la verificación en dos pasos y cómo activarla.', 'likert', 3, { variable: VAR_CONOCIMIENTO, dimension: 'Contraseñas', indicador: 'Conocimiento de la verificación en dos pasos' }),
    q('con04', 'Sé para qué sirve un gestor de contraseñas.', 'likert', 3, { variable: VAR_CONOCIMIENTO, dimension: 'Contraseñas', indicador: 'Conocimiento de los gestores de contraseñas' }),
    q('con05', 'Sé qué hacer si sospecho que alguien conoce mi contraseña.', 'likert', 3, { variable: VAR_CONOCIMIENTO, dimension: 'Amenazas', indicador: 'Conocimiento de la respuesta ante una contraseña expuesta' }),
    q('gen01', '¿Cuál es su sexo?', 'opcion', 0, { opciones: SEXOS }),
    q('gen02', '¿En qué semestre está?', 'opcion', 0, { opciones: SEMESTRES }),
    q('gen03', '¿A qué programa pertenece?', 'opcion', 0, { opciones: PROGRAMAS }),
    q('gen04', '¿Cuántos años tiene?', 'numero', 0),
];
const INSTRUMENTO = {
    id: 'cuest01', filaId: 'i1', tipo: 'encuesta', ubicacion: 'anexo',
    aplicaA: `${QUIEN} de ${DONDE}`,
    titulo: 'Cuestionario sobre manejo de contraseñas y seguridad informática',
    intro: 'Gracias por participar. Este cuestionario hace parte de un proyecto de investigación sobre el manejo de contraseñas en estudiantes universitarios. Es anónimo, toma unos cinco minutos y no se le pedirá ninguna contraseña. Sus respuestas se usarán solo con fines académicos.',
    preguntas: PREGUNTAS,
};

/* ---------- Respuestas simuladas (siempre las mismas) ---------- */
let semilla = 20260115;
const azar = () => { semilla = (semilla * 1664525 + 1013904223) % 4294967296; return semilla / 4294967296; };
const normal = () => Math.sqrt(-2 * Math.log(1 - azar())) * Math.cos(2 * Math.PI * azar());
const elegir = (opciones, pesos) => { let r = azar() * pesos.reduce((a, b) => a + b, 0); for (let i = 0; i < opciones.length; i += 1) { r -= pesos[i]; if (r <= 0) return opciones[i]; } return opciones.at(-1); };
const escala = (x) => LIKERT[Math.max(0, Math.min(4, Math.round(x) - 1))];
const RESPUESTAS = Array.from({ length: MUESTRA }, () => {
    const saber = normal(); // conocimiento de cada estudiante (rasgo de fondo)
    const capacitado = azar() < 1 / (1 + Math.exp(-(saber * 0.9 - 0.75)));
    const descuido = -0.55 * saber + 0.83 * normal() - (capacitado ? 0.25 : 0); // tendencia a prácticas inseguras
    const seguro = saber * 0.5 + (capacitado ? 0.9 : 0) + normal() * 0.9;
    const medidas = MEDIDAS.slice(0, 3).filter((_, i) => azar() < [0.42, 0.14, 0.58][i] + (capacitado ? 0.12 : 0) + saber * 0.06);
    return {
        lon01: seguro > 1.1 ? LONGITUDES[2] : seguro > -0.35 ? LONGITUDES[1] : LONGITUDES[0],
        pra01: escala(3.75 + descuido * 0.95 + normal() * 0.55),
        pra02: escala(3.05 + descuido * 0.9 + normal() * 0.7),
        pra03: escala(2.35 + descuido * 0.8 + normal() * 0.75),
        pra04: escala(3.2 + descuido * 0.9 + normal() * 0.7),
        pra05: escala(3.95 + descuido * 0.85 + normal() * 0.6),
        cue01: Math.max(1, Math.min(15, Math.round(5.2 + descuido * 2.2 + normal() * 1.4))),
        med01: medidas.length ? medidas : [MEDIDAS[3]],
        cap01: capacitado ? 'Sí' : 'No',
        cap02: capacitado ? elegir(RECOMENDACIONES, [0.1, 0.4, 0.5]) : elegir(RECOMENDACIONES, [0.55, 0.33, 0.12]),
        con01: escala(3.3 + saber * 0.9 + normal() * 0.6),
        con02: escala(2.9 + saber * 0.9 + normal() * 0.7),
        con03: escala(3.45 + saber * 0.85 + normal() * 0.65),
        con04: escala(2.6 + saber * 0.95 + normal() * 0.7),
        con05: escala(3.0 + saber * 0.9 + normal() * 0.65),
        gen01: elegir(SEXOS, [0.36, 0.62, 0.02]),
        gen02: elegir(SEMESTRES, [0.41, 0.35, 0.24]),
        gen03: elegir(PROGRAMAS, [0.38, 0.27, 0.19, 0.16]),
        gen04: Math.max(16, Math.min(34, Math.round(20.4 + normal() * 2.6))),
    };
});

/* ---------- Análisis: el mismo que hace la aplicación en «Resultados» ---------- */
const definition = definicionEncuesta(INSTRUMENTO);
const responses = RESPUESTAS.map((answers) => ({ answers }));
const OPERACIONALIZACION = PREGUNTAS.filter((p) => p.variable).map((p, i) => ({
    id: `op${String(i + 1).padStart(2, '0')}`, variable: p.variable,
    tipoVar: p.variable === VAR_PRACTICAS || p.variable === 'seguridad de la contraseña' ? 'Dependiente' : 'Independiente',
    definicion: {
        [VAR_PRACTICAS]: 'Conductas habituales de creación, uso y custodia de contraseñas que aumentan el riesgo de acceso no autorizado a las cuentas',
        'seguridad de la contraseña': 'Resistencia de la contraseña y de la cuenta frente a un intento de acceso no autorizado',
        'capacitación en seguridad informática': 'Formación o recomendaciones recibidas sobre el cuidado de la información y de las cuentas',
        [VAR_CONOCIMIENTO]: 'Grado en que el estudiante conoce las amenazas a sus cuentas y las medidas para protegerlas',
    }[p.variable],
    dimension: p.dimension, indicador: p.indicador, item: p.texto,
    escala: { likert: 'likert', opcion: 'opcion', multiple: 'multiple', sino: 'sino', numero: 'numero' }[p.tipo], opciones: p.opciones, objetivo: p.objetivo,
}));
const PLAN = [
    { id: 'an1', objetivo: 'el objetivo específico 1', tecnica: 'estadística descriptiva (frecuencias, porcentajes, media y desviación estándar)', software: 'Jamovi', nota: 'describe con qué frecuencia aparece cada práctica insegura y qué medidas de protección usan los estudiantes' },
    { id: 'an2', objetivo: 'el objetivo específico 2', tecnica: 'tabla de contingencia y prueba ji-cuadrado, con V de Cramér', software: 'Jamovi', nota: 'compara la longitud de la contraseña entre quienes recibieron capacitación y quienes no' },
    { id: 'an3', objetivo: 'el objetivo específico 3', tecnica: 'correlación de Pearson y de Spearman entre los puntajes de las dos escalas', software: 'Jamovi', nota: 'mide si a mayor conocimiento corresponden menos prácticas inseguras' },
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
const PRA = ['pra01', 'pra02', 'pra03', 'pra04', 'pra05'];
const CON = ['con01', 'con02', 'con03', 'con04', 'con05'];
const dPra = descriptivos(promedio(PRA));
const dCon = descriptivos(promedio(CON));
const dCuentas = descriptivos(col('cue01'));
const dEdad = descriptivos(col('gen04'));
const itemsPra = PRA.map((id) => ({ id, texto: PREGUNTAS.find((p) => p.id === id).texto.replace(/\.$/, ''), media: descriptivos(puntos(id)).media, alto: altos(id) })).sort((a, b) => b.media - a.media);
const itemsCon = CON.map((id) => ({ id, texto: PREGUNTAS.find((p) => p.id === id).texto.replace(/\.$/, ''), media: descriptivos(puntos(id)).media, alto: altos(id) })).sort((a, b) => b.media - a.media);
const capSi = cuenta('cap01', 'Sí');
const capNo = MUESTRA - capSi;
const cortas = (cap) => RESPUESTAS.filter((r) => r.cap01 === cap && r.lon01 === LONGITUDES[0]).length;
const largas = (cap) => RESPUESTAS.filter((r) => r.cap01 === cap && r.lon01 === LONGITUDES[2]).length;
const ji = cruzar(col('cap01'), col('lon01'));
const corr = correlacion(promedio(CON), promedio(PRA));
const m2 = (x) => fmt(x, 2);
if (!(ji.p < 0.05) || !(corr.pR < 0.05) || corr.r >= 0) throw new Error('Las respuestas simuladas no dieron las relaciones que el texto describe: ajusta la simulación.');
const alfa = (nombre) => an.confiabilidad.find((c) => c.escala === nombre);
const alfaPra = alfa(VAR_PRACTICAS);
const alfaCon = alfa(VAR_CONOCIMIENTO);
if (!alfaPra || !alfaCon || alfaPra.alfa < 0.7 || alfaCon.alfa < 0.7) throw new Error('La confiabilidad simulada quedó por debajo de 0,70.');

/* ---------- Referencias (publicaciones reales) ---------- */
const REFERENCIAS = [
    { id: 'r01', tipo: 'capitulo', autores: 'Florêncio, D.; Herley, C.', anio: '2007', titulo: 'A large-scale study of web password habits', libro: 'Proceedings of the 16th International Conference on World Wide Web', paginas: '657-666', editorial: 'Association for Computing Machinery', doi: '10.1145/1242572.1242661' },
    { id: 'r02', tipo: 'capitulo', autores: 'Das, A.; Bonneau, J.; Caesar, M.; Borisov, N.; Wang, X.', anio: '2014', titulo: 'The tangled web of password reuse', libro: 'Proceedings of the Network and Distributed System Security Symposium (NDSS 2014)', editorial: 'Internet Society', doi: '10.14722/ndss.2014.23357' },
    { id: 'r03', tipo: 'capitulo', autores: 'Stobert, E.; Biddle, R.', anio: '2014', titulo: 'The password life cycle: User behaviour in managing passwords', libro: 'Proceedings of the Tenth Symposium on Usable Privacy and Security (SOUPS 2014)', paginas: '243-255', editorial: 'USENIX Association' },
    { id: 'r04', tipo: 'capitulo', autores: 'Ur, B.; Noma, F.; Bees, J.; Segreti, S. M.; Shay, R.; Bauer, L.; Christin, N.; Cranor, L. F.', anio: '2015', titulo: '"I added \'!\' at the end to make it secure": Observing password creation in the lab', libro: 'Proceedings of the Eleventh Symposium on Usable Privacy and Security (SOUPS 2015)', paginas: '123-140', editorial: 'USENIX Association' },
    { id: 'r05', tipo: 'articulo', autores: 'Parsons, K.; Calic, D.; Pattinson, M.; Butavicius, M.; McCormac, A.; Zwaans, T.', anio: '2017', titulo: 'The Human Aspects of Information Security Questionnaire (HAIS-Q): Two further validation studies', revista: 'Computers & Security', volumen: '66', paginas: '40-51', doi: '10.1016/j.cose.2017.01.004' },
    { id: 'r06', tipo: 'articulo', autores: 'Rogers, R. W.', anio: '1975', titulo: 'A protection motivation theory of fear appeals and attitude change', revista: 'The Journal of Psychology', volumen: '91', numero: '1', paginas: '93-114', doi: '10.1080/00223980.1975.9915803' },
    { id: 'r07', tipo: 'articulo', autores: 'Ajzen, I.', anio: '1991', titulo: 'The theory of planned behavior', revista: 'Organizational Behavior and Human Decision Processes', volumen: '50', numero: '2', paginas: '179-211', doi: '10.1016/0749-5978(91)90020-T' },
    { id: 'r08', tipo: 'informe', autores: 'Grassi, P. A.; Fenton, J. L.; Newton, E. M.; Perlner, R. A.; Regenscheid, A. R.; Burr, W. E.; Richer, J. P.', anio: '2017', titulo: 'Digital identity guidelines: Authentication and lifecycle management', numero: 'NIST Special Publication 800-63B', editorial: 'National Institute of Standards and Technology', url: 'https://doi.org/10.6028/NIST.SP.800-63b' },
    { id: 'r09', tipo: 'capitulo', autores: 'Bonneau, J.; Herley, C.; van Oorschot, P. C.; Stajano, F.', anio: '2012', titulo: 'The quest to replace passwords: A framework for comparative evaluation of web authentication schemes', libro: '2012 IEEE Symposium on Security and Privacy', paginas: '553-567', editorial: 'IEEE', doi: '10.1109/SP.2012.44' },
    { id: 'r10', tipo: 'libro', autores: 'Hernández-Sampieri, R.; Mendoza Torres, C. P.', anio: '2018', titulo: 'Metodología de la investigación: las rutas cuantitativa, cualitativa y mixta', editorial: 'McGraw-Hill Education' },
    { id: 'r11', tipo: 'libro', autores: 'George, D.; Mallery, P.', anio: '2003', titulo: 'SPSS for Windows step by step: A simple guide and reference, 11.0 update', edicion: '4.ª ed.', editorial: 'Allyn & Bacon' },
    { id: 'r12', tipo: 'ley', titulo: 'Ley 1581 de 2012', anio: '2012', descripcion: 'Por la cual se dictan disposiciones generales para la protección de datos personales', fecha: '17 de octubre', fuente: 'Diario Oficial No. 48.587' },
    { id: 'r13', tipo: 'ley', titulo: 'Ley 1273 de 2009', anio: '2009', descripcion: 'Por medio de la cual se modifica el Código Penal, se crea un nuevo bien jurídico tutelado —denominado «de la protección de la información y de los datos»— y se preservan integralmente los sistemas que utilicen las tecnologías de la información y las comunicaciones', fecha: '5 de enero', fuente: 'Diario Oficial No. 47.223' },
];

/* ---------- Textos del documento ---------- */
const obj = (i) => ESPECIFICOS[i].replace(/\.$/, '');
const minus = (s) => s.charAt(0).toLowerCase() + s.slice(1);

const ARBOL = {
    problema: 'los estudiantes usan contraseñas inseguras en sus cuentas institucionales y personales',
    causas: ['Los estudiantes desconocen cómo se crea y se protege una contraseña segura', 'La universidad casi no ofrece capacitación en seguridad informática', 'Recordar muchas contraseñas distintas resulta difícil y se opta por repetirlas'],
    efectos: ['Las cuentas quedan expuestas a accesos no autorizados', 'Se puede perder o filtrar información académica y personal', 'Una sola contraseña descubierta compromete varias cuentas a la vez'],
};
const ARBOL_OBJ = {
    problema: 'Los estudiantes usan contraseñas seguras en sus cuentas institucionales y personales',
    causas: ['Los estudiantes conocen cómo se crea y se protege una contraseña segura', 'La universidad ofrece capacitación periódica en seguridad informática', 'Los estudiantes cuentan con herramientas para manejar muchas contraseñas distintas'],
    efectos: ['Las cuentas quedan protegidas frente a accesos no autorizados', 'La información académica y personal se conserva íntegra y reservada', 'Una contraseña descubierta no compromete las demás cuentas'],
    explicacion: '',
};

const planteamientoForm = {
    contexto: 'Las contraseñas siguen siendo el mecanismo de autenticación más extendido en los servicios en línea, a pesar de que se han propuesto numerosas alternativas para reemplazarlas (Bonneau et al., 2012). Su seguridad depende en buena medida de quien las crea y las administra: los usuarios manejan muchas más cuentas que contraseñas, por lo que tienden a repetirlas (Florêncio y Herley, 2007), y cuando una de ellas se filtra, las demás cuentas que la comparten quedan expuestas (Das et al., 2014).',
    descripcion: `En ${DONDE}, los ${QUIEN} usan las mismas credenciales para la plataforma académica, el correo institucional y sus cuentas personales, y la institución no cuenta con un diagnóstico de cómo crean, reutilizan y guardan esas contraseñas. La situación se estudia durante ${CUANDO}.`,
    causas: 'Entre las causas de esta situación se encuentran el desconocimiento de cómo se crea y se protege una contraseña segura, la escasa capacitación en seguridad informática que ofrece la universidad y la dificultad de recordar muchas contraseñas distintas, que lleva a repetirlas.',
    efectos: 'Como consecuencia, las cuentas quedan expuestas a accesos no autorizados, se puede perder o filtrar información académica y personal, y una sola contraseña descubierta compromete varias cuentas a la vez.',
    cierre: 'Por lo anterior, resulta necesario investigar qué factores están asociados al uso de contraseñas inseguras en esta población, como base para que la universidad oriente sus acciones de formación.',
};
const planteamiento = Object.values(planteamientoForm).join('\n\n');

const justificacionForm = {
    importancia: `Este estudio es **conveniente** porque el uso de contraseñas inseguras es una de las vías por las que se comprometen las cuentas de los usuarios, y la evidencia muestra que quienes saben más de seguridad de la información tienden a comportarse de forma más segura (Parsons et al., 2017). Analizar los factores asociados a ese uso, con datos de ${CUANDO}, da a la universidad una base para actuar.`,
    social: `Los principales beneficiarios serán los ${QUIEN} de ${DONDE}, pues los resultados permitirán orientar las recomendaciones y capacitaciones hacia las prácticas que más los exponen. También se beneficia la oficina de tecnología de la universidad, que contará con un diagnóstico propio en lugar de suposiciones.`,
    practico: 'En lo práctico, el estudio entrega un cuestionario validado y un procedimiento de análisis que la universidad puede repetir cada año para saber si sus acciones de formación están dando resultado.',
    teorico: 'En lo teórico, pone a prueba en un contexto universitario local la relación entre conocimiento y conducta que plantean la teoría de la motivación a la protección (Rogers, 1975) y la teoría de la conducta planificada (Ajzen, 1991).',
    viabilidad: 'El estudio es viable porque la población es accesible, el cuestionario se responde en línea en unos cinco minutos, no se solicita ninguna contraseña y los recursos requeridos son los propios de los investigadores.',
};
const justificacion = Object.values(justificacionForm).join('\n\n');

const alcancesForm = {
    tipo: 'Correlacional',
    tematico: 'las prácticas de manejo de contraseñas, la capacitación recibida y el conocimiento sobre seguridad informática',
    poblacion: QUIEN, lugar: DONDE, tiempo: CUANDO,
    resultados: 'un diagnóstico de las prácticas de manejo de contraseñas y la medida de su relación con la capacitación y el conocimiento',
    exclusiones: 'No se evalúa la fortaleza real de las contraseñas (no se solicitan), no se auditan los sistemas de la universidad y no se diseña ni se aplica un programa de capacitación.',
    limites: [
        { limitacion: 'Las prácticas se miden por autorreporte, que puede subestimar las conductas inseguras', mitigacion: 'el cuestionario es anónimo y no pide datos que identifiquen al estudiante' },
        { limitacion: 'El diseño transversal no permite afirmar que el conocimiento sea la causa de las prácticas', mitigacion: 'los resultados se interpretan como asociación y no como causalidad' },
        { limitacion: 'La muestra proviene de una sola facultad', mitigacion: 'las conclusiones se restringen a esa facultad y se recomienda replicar el estudio en las demás' },
    ],
};
const alcances = `El estudio tiene un alcance correlacional. Aborda ${alcancesForm.tematico} en los ${QUIEN} de ${DONDE}, durante ${CUANDO}. Entrega ${alcancesForm.resultados}.\n\n${alcancesForm.exclusiones}`;
const limitaciones = alcancesForm.limites.map((l) => `- ${l.limitacion}; para atenuarlo, ${l.mitigacion}.`).join('\n');

const ANTECEDENTES = [
    { autor: 'Florêncio y Herley', anio: '2007', titulo: REFERENCIAS[0].titulo, ambito: 'Internacional', lugar: 'Estados Unidos', objetivo: 'medir los hábitos de uso de contraseñas de medio millón de usuarios durante tres meses', hallazgo: 'cada usuario tenía en promedio unas 25 cuentas que exigían contraseña y cerca de 6,5 contraseñas, cada una compartida entre varios sitios', relacion: 'muestra que la reutilización es la respuesta habitual a tener más cuentas que contraseñas, práctica que este estudio mide en estudiantes' },
    { autor: 'Das et al.', anio: '2014', titulo: REFERENCIAS[1].titulo, ambito: 'Internacional', lugar: 'Estados Unidos', objetivo: 'estimar con qué frecuencia los usuarios repiten su contraseña en distintos sitios y qué tan fácil es adivinar una a partir de otra', hallazgo: 'entre el 43 % y el 51 % de los usuarios reutilizaba la misma contraseña en varios sitios', relacion: 'sustenta el riesgo que justifica el estudio: una contraseña filtrada compromete las demás cuentas que la comparten' },
    { autor: 'Stobert y Biddle', anio: '2014', titulo: REFERENCIAS[2].titulo, ambito: 'Internacional', lugar: 'Canadá', objetivo: 'comprender cómo las personas administran sus contraseñas a lo largo del tiempo', hallazgo: 'los usuarios racionan su esfuerzo: reutilizan y anotan las contraseñas de las cuentas que consideran menos importantes', relacion: 'ayuda a interpretar las prácticas de reutilización y de custodia que mide el cuestionario' },
    { autor: 'Ur et al.', anio: '2015', titulo: REFERENCIAS[3].titulo, ambito: 'Internacional', lugar: 'Estados Unidos', objetivo: 'observar en laboratorio cómo las personas crean contraseñas y qué creen que las hace seguras', hallazgo: 'muchos participantes sostenían ideas equivocadas, como que añadir un símbolo o un número al final vuelve segura una contraseña', relacion: 'respalda medir el conocimiento, porque las creencias erróneas se traducen en contraseñas débiles' },
    { autor: 'Parsons et al.', anio: '2017', titulo: REFERENCIAS[4].titulo, ambito: 'Internacional', lugar: 'Australia', objetivo: 'validar un cuestionario que mide conocimiento, actitud y conducta frente a la seguridad de la información', hallazgo: 'quienes obtuvieron mayor puntaje de conocimiento mostraron actitudes y conductas más seguras', relacion: 'es el antecedente directo de la relación entre conocimiento y prácticas que examina el tercer objetivo' },
];
const marcoAntecedentes = [
    `Los estudios sobre contraseñas coinciden en que las personas administran muchas más cuentas que contraseñas. ${ANTECEDENTES[0].autor} (${ANTECEDENTES[0].anio}) encontraron que ${ANTECEDENTES[0].hallazgo}. En la misma línea, ${ANTECEDENTES[1].autor} (${ANTECEDENTES[1].anio}) reportaron que ${ANTECEDENTES[1].hallazgo}, lo que convierte la filtración de una sola contraseña en un riesgo para todas las cuentas que la comparten.`,
    `Otros trabajos explican por qué ocurre. ${ANTECEDENTES[2].autor} (${ANTECEDENTES[2].anio}) observaron que ${ANTECEDENTES[2].hallazgo}. Por su parte, ${ANTECEDENTES[3].autor} (${ANTECEDENTES[3].anio}) hallaron que ${ANTECEDENTES[3].hallazgo}.`,
    `Finalmente, ${ANTECEDENTES[4].autor} (${ANTECEDENTES[4].anio}) mostraron que ${ANTECEDENTES[4].hallazgo}. En la revisión no se encontraron estudios de este tipo con estudiantes de la universidad donde se realiza la investigación, vacío que este proyecto busca atender.`,
].join('\n\n');
const TEORIAS = [
    { nombre: 'Teoría de la motivación a la protección', autor: 'Rogers', anio: '1975', postulado: 'una persona adopta una conducta de protección cuando percibe que la amenaza es grave y probable, y cree que la medida es eficaz y que es capaz de aplicarla', relacion: 'explica por qué quien conoce las amenazas y sabe cómo protegerse tiende a manejar mejor sus contraseñas', fuente: REFERENCIAS[5].titulo },
    { nombre: 'Teoría de la conducta planificada', autor: 'Ajzen', anio: '1991', postulado: 'la conducta depende de la intención, y esta de la actitud hacia la conducta, de la norma subjetiva y del control que la persona percibe sobre ella', relacion: 'permite entender que recordar muchas contraseñas se perciba como difícil y lleve a repetirlas, aun sabiendo que no es lo recomendable', fuente: REFERENCIAS[6].titulo },
];
const marcoTeorico = TEORIAS.map((x) => `La ${minus(x.nombre)} sostiene que ${x.postulado} (${x.autor}, ${x.anio}). En este estudio, ${x.relacion}.`).join('\n\n');
const CONCEPTOS = [
    { termino: 'Contraseña', definicion: 'secreto memorizado que el usuario elige y que el sistema usa para comprobar su identidad', autor: 'Grassi et al.', anio: '2017', fuente: REFERENCIAS[7].titulo },
    { termino: 'Reutilización de contraseñas', definicion: 'uso de una misma contraseña, o de variaciones mínimas de ella, en varias cuentas', autor: 'Das et al.', anio: '2014', fuente: REFERENCIAS[1].titulo },
    { termino: 'Verificación en dos pasos', definicion: 'forma de autenticación que exige, además de la contraseña, un segundo factor que el usuario posee o que lo identifica', autor: 'Grassi et al.', anio: '2017', fuente: REFERENCIAS[7].titulo },
    { termino: 'Conocimiento sobre seguridad de la información', definicion: 'grado en que una persona entiende las amenazas a la información y las conductas que la protegen', autor: 'Parsons et al.', anio: '2017', fuente: REFERENCIAS[4].titulo },
];
const marcoConceptual = CONCEPTOS.map((c) => `**${c.termino}:** ${c.definicion} (${c.autor}, ${c.anio}).`).join('\n\n');
const CONTEXTO = { lugar: 'Montería, Córdoba', caracteristicas: 'capital del departamento de Córdoba, en el Caribe colombiano', institucion: 'una universidad con programas de pregrado en ingeniería', poblacion: `${N.toLocaleString('es-CO')} estudiantes matriculados en la Facultad de Ingeniería` };
const marcoContextual = `La investigación se desarrolla en ${CONTEXTO.institucion}, ubicada en ${CONTEXTO.lugar}, ${CONTEXTO.caracteristicas}. La Facultad de Ingeniería tiene ${CONTEXTO.poblacion} en ${CUANDO}, quienes usan una misma cuenta institucional para la plataforma académica, el correo y la biblioteca digital. El nombre de la institución se reserva.`;
const NORMAS = [
    { tipo: 'Ley', numero: '1581', anio: '2012', establece: 'las disposiciones generales para la protección de los datos personales y los deberes de quienes los tratan', relacion: 'obliga a la universidad a proteger los datos de sus estudiantes y exige que el cuestionario se aplique con su autorización y de forma anónima', fuente: 'Ley 1581 de 2012' },
    { tipo: 'Ley', numero: '1273', anio: '2009', establece: 'como delito el acceso abusivo a un sistema informático y otras conductas contra la información y los datos', relacion: 'muestra que el acceso a una cuenta ajena con una contraseña descubierta tiene consecuencias penales', fuente: 'Ley 1273 de 2009' },
];
const marcoLegal = [
    `La Ley 1581 de 2012 establece ${NORMAS[0].establece}. Esta norma ${NORMAS[0].relacion}.`,
    `La Ley 1273 de 2009 tipifica ${NORMAS[1].establece}, lo que ${NORMAS[1].relacion}.`,
    'En el plano técnico, las guías de identidad digital del NIST recomiendan privilegiar la longitud de la contraseña sobre las reglas de composición, no exigir cambios periódicos sin motivo y rechazar las contraseñas que ya aparecen en filtraciones conocidas (Grassi et al., 2017).',
].join('\n\n');

const metEnfoque = 'La investigación tiene un enfoque cuantitativo, que mide variables con datos numéricos y los analiza con métodos estadísticos para describir, relacionar o explicar el fenómeno (Hernández-Sampieri y Mendoza Torres, 2018). Este enfoque permite medir con qué frecuencia aparecen las prácticas inseguras, compararlas entre grupos y cuantificar su relación con el conocimiento sobre seguridad informática.';
const metTipo = 'Es una investigación de tipo correlacional, pues mide el grado de relación entre variables, sin afirmar que una cause la otra. El estudio describe primero las prácticas de manejo de contraseñas y luego examina su asociación con la capacitación recibida y con el conocimiento sobre seguridad informática.';
const metDiseno = `Se utiliza un diseño no experimental transversal, en el que se observan las variables sin manipularlas y en un solo momento. El cuestionario se aplica una sola vez a los ${QUIEN}, durante ${CUANDO}.`;
const poblacionSugerida = `La población está conformada por los ${QUIEN} de ${DONDE}, que suman ${N.toLocaleString('es-CO')} personas. La muestra se calculó para una población finita, con un nivel de confianza del 95 % y un margen de error del 5 %, y es de ${MUESTRA} estudiantes, elegidos por muestreo aleatorio simple a partir del listado de matriculados. Se incluyeron estudiantes con matrícula activa en ${CUANDO} que aceptaron participar; se excluyeron quienes estaban en intercambio o en práctica fuera de la ciudad.`;
const metPlanAnalisis = PLAN.map((p, i) => `- **Objetivo específico ${i + 1}** (${minus(obj(i))}): los datos se analizarán mediante ${p.tecnica}, con apoyo de ${p.software}.`).join('\n');
const instrumentos = [
    `- **Encuesta (cuestionario):** se aplicará a los ${QUIEN} de ${DONDE} para todos los objetivos específicos. Su validez y confiabilidad se asegurarán mediante juicio de expertos y alfa de Cronbach. Consta de ${PREGUNTAS.length} preguntas (10 de escala tipo Likert, 5 de opción única, 1 de opción múltiple, 1 de sí o no y 2 numéricas) y se presenta completo [[anexo:${INSTRUMENTO.id}]].`,
    '',
    '### Validez y confiabilidad',
    'La validez de contenido del cuestionario se estableció mediante juicio de expertos: tres especialistas en seguridad informática y en metodología evaluaron la pertinencia, la claridad y la coherencia de cada ítem en una escala de 1 a 4. Se calculó el coeficiente V de Aiken para cada ítem; se conservaron los ítems con V ≥ 0,80 y los demás se ajustaron según las observaciones de los expertos.',
    '',
    `La confiabilidad se evaluó con el coeficiente alfa de Cronbach, calculado con las respuestas del estudio para cada escala. Se consideraron aceptables valores iguales o superiores a 0,70 (George y Mallery, 2003). La escala de prácticas inseguras obtuvo un alfa de ${m2(alfaPra.alfa)} y la de conocimiento, de ${m2(alfaCon.alfa)}.`,
].join('\n');

const FASES = [
    { id: 'fa01', nombre: 'Diagnóstico de las prácticas', objetivo: obj(0), descripcion: 'se construye y valida el cuestionario, se aplica a la muestra y se describen las prácticas de manejo de contraseñas', actividades: ['Construir el cuestionario a partir de la matriz de operacionalización', 'Validar el cuestionario mediante juicio de expertos', 'Aplicar el cuestionario en línea a la muestra', 'Depurar y codificar las respuestas', 'Describir las prácticas con frecuencias y medias en Jamovi'], tecnicas: 'encuesta (cuestionario), juicio de expertos, alfa de Cronbach, Jamovi', productos: 'informe descriptivo de las prácticas de manejo de contraseñas', duracion: 7, responsable: 'investigadores', recomendada: true },
    { id: 'fa02', nombre: 'Comparación según la capacitación', objetivo: obj(1), descripcion: 'se compara la longitud de la contraseña entre quienes recibieron capacitación en seguridad informática y quienes no', actividades: ['Clasificar a los participantes según la capacitación recibida', 'Construir la tabla de contingencia', 'Aplicar la prueba ji-cuadrado y calcular la V de Cramér', 'Interpretar las diferencias encontradas'], tecnicas: 'tabla de contingencia, prueba ji-cuadrado, Jamovi', productos: 'tabla comparativa de la seguridad de las contraseñas según la capacitación', duracion: 3, responsable: 'investigadores', recomendada: true },
    { id: 'fa03', nombre: 'Relación entre conocimiento y prácticas', objetivo: obj(2), descripcion: 'se calcula el puntaje de cada escala por participante y se mide la relación entre el conocimiento y las prácticas inseguras', actividades: ['Calcular el puntaje de conocimiento y el de prácticas inseguras por participante', 'Comprobar la confiabilidad de las dos escalas', 'Calcular las correlaciones de Pearson y de Spearman', 'Interpretar la dirección y la fuerza de la relación'], tecnicas: 'correlación de Pearson y de Spearman, Jamovi', productos: 'informe de la relación entre conocimiento y prácticas inseguras', duracion: 3, responsable: 'investigadores', recomendada: true },
    { id: 'fa04', nombre: 'Socialización de resultados', objetivo: 'Socializar los resultados del proyecto', descripcion: 'se redacta el informe final y se presentan los hallazgos a la oficina de tecnología y a la facultad', actividades: ['Redactar el informe final', 'Preparar la presentación de resultados', 'Exponer los hallazgos ante la facultad y la oficina de tecnología', 'Recoger la retroalimentación'], tecnicas: 'informe escrito y presentación oral', productos: 'documento final y presentación de socialización', duracion: 3, responsable: 'investigadores', recomendada: true },
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
    ['Software', 'Jamovi y formulario en línea', 'Software libre: sin costo', 0],
    ['Servicios', 'Conexión a internet', `2 investigadores × 4 meses × $40.000`, 320000],
    ['Materiales/Muestreos', 'Piezas de invitación a la encuesta', 'Diseño e impresión de 20 carteles con el código de la encuesta × $6.000', 120000],
    ['Viajes/Salidas de campo', 'Transporte a la sede', '2 investigadores × 12 visitas × $8.000', 192000],
    ['Imprevistos', 'Imprevistos', '5 % de los demás rubros', 0],
].map(([categoria, descripcion, justificacion, costo], i) => ({ id: 1795000000000 + i, categoria, descripcion, justificacion, fuente: 'Personal', costo, sugerido: true }));
PRESUPUESTO.at(-1).costo = Math.round((PRESUPUESTO.slice(0, -1).reduce((s, x) => s + x.costo, 0) * 0.05) / 1000) * 1000;

/* ---------- Resultados, discusión y conclusiones (con las cifras calculadas) ---------- */
const sexoM = cuenta('gen01', 'Mujer'); const sexoH = cuenta('gen01', 'Hombre');
const parrafoParticipantes = `Respondieron el cuestionario ${MUESTRA} estudiantes: ${sexoH} hombres (${pct(sexoH)}) y ${sexoM} mujeres (${pct(sexoM)}), con una edad media de ${m2(dEdad.media)} años (DE ${m2(dEdad.de)}). El ${pct(cuenta('gen03', PROGRAMAS[0]))} pertenece a ${PROGRAMAS[0]}. Las dos escalas resultaron confiables: alfa de Cronbach de ${m2(alfaPra.alfa)} para las prácticas inseguras y de ${m2(alfaCon.alfa)} para el conocimiento.`;
const R = [
    {
        hallazgo: `Se encontró que la práctica insegura más frecuente fue «${itemsPra[0].texto}», con una media de ${m2(itemsPra[0].media)} sobre 5 y ${pct(itemsPra[0].alto)} de los estudiantes de acuerdo o totalmente de acuerdo`,
        datos: `Le siguió «${itemsPra[1].texto}» (media ${m2(itemsPra[1].media)}; ${pct(itemsPra[1].alto)}). La menos frecuente fue «${itemsPra.at(-1).texto}» (media ${m2(itemsPra.at(-1).media)}; ${pct(itemsPra.at(-1).alto)}). El puntaje global de prácticas inseguras fue de ${m2(dPra.media)} (DE ${m2(dPra.de)}). Los estudiantes usan su contraseña principal en ${m2(dCuentas.media)} cuentas en promedio (DE ${m2(dCuentas.de)}); el ${pct(cuenta('lon01', LONGITUDES[0]))} tiene una contraseña de menos de 8 caracteres y solo el ${pct(cuenta('lon01', LONGITUDES[2]))}, de 12 o más. El ${pct(cuenta('med01', MEDIDAS[0]))} usa la verificación en dos pasos, el ${pct(cuenta('med01', MEDIDAS[1]))} un gestor de contraseñas y el ${pct(cuenta('med01', MEDIDAS[3]))} ninguna medida adicional.`,
        apoyoTipo: 'Tabla', apoyoTitulo: 'Resultados del objetivo específico 1: valoración por ítem', apoyoNota: '',
        interpretacion: 'indica que la reutilización es la práctica dominante y que la mayoría protege sus cuentas con contraseñas cortas',
        relacion: 'coincide con', antecedente: 'Florêncio y Herley (2007)',
        explicacion: 'esos autores encontraron que cada contraseña se comparte entre varios sitios, y Das et al. (2014) estimaron que cerca de la mitad de los usuarios repite la misma contraseña',
        teoria: TEORIAS[1].nombre, teoriaExplica: 'recordar una contraseña distinta por cuenta se percibe como poco controlable, de modo que repetirla resulta la conducta más fácil',
        implicacion: 'la universidad debería promover el gestor de contraseñas y la verificación en dos pasos antes que exigir contraseñas más complejas', sugerido: true,
    },
    {
        hallazgo: `Se encontró que el ${pct(capSi)} de los estudiantes (${capSi}) ha recibido alguna capacitación en seguridad informática y el ${pct(capNo)} (${capNo}) no`,
        datos: `Entre quienes no la recibieron, el ${pct(cortas('No'), capNo)} usa contraseñas de menos de 8 caracteres y el ${pct(largas('No'), capNo)} de 12 o más; entre los capacitados, esas proporciones son ${pct(cortas('Sí'), capSi)} y ${pct(largas('Sí'), capSi)}. La asociación entre la capacitación y la longitud de la contraseña fue estadísticamente significativa (ji-cuadrado = ${m2(ji.chi)}, gl = ${ji.gl}, p ${fmtP(ji.p)}; V de Cramér = ${m2(ji.v)}, asociación ${fuerza(ji.v)}). Además, el ${pct(cuenta('cap02', RECOMENDACIONES[0]))} afirma que nunca ha recibido recomendaciones de seguridad por parte de la universidad.`,
        apoyoTipo: 'Tabla', apoyoTitulo: an.porObjetivo[2].titulos.find((x) => /Asociación/.test(x)) || 'Distribución de respuestas', apoyoNota: '',
        interpretacion: 'muestra que quienes han recibido capacitación tienden a usar contraseñas más largas',
        relacion: 'amplía lo reportado por', antecedente: 'Ur et al. (2015)',
        explicacion: 'esos autores mostraron que las ideas equivocadas sobre qué hace segura una contraseña llevan a crear contraseñas débiles; aquí la formación recibida se asocia con contraseñas más largas',
        teoria: TEORIAS[0].nombre, teoriaExplica: 'la capacitación aumenta la percepción de la amenaza y la confianza en que la medida es eficaz, condiciones que la teoría propone para que la persona se proteja',
        implicacion: 'ampliar la cobertura de la capacitación es una medida al alcance de la universidad, pues más de la mitad de los estudiantes no la ha recibido', sugerido: true,
    },
    {
        hallazgo: `Se encontró una relación inversa y ${fuerza(corr.r)} entre el conocimiento sobre seguridad informática y las prácticas inseguras (r de Pearson = ${m2(corr.r)}, p ${fmtP(corr.pR)}; rho de Spearman = ${m2(corr.rho)}, p ${fmtP(corr.pRho)}; n = ${corr.n})`,
        datos: `El puntaje global de conocimiento fue de ${m2(dCon.media)} sobre 5 (DE ${m2(dCon.de)}). El aspecto mejor conocido fue «${itemsCon[0].texto}» (media ${m2(itemsCon[0].media)}; ${pct(itemsCon[0].alto)} de acuerdo o totalmente de acuerdo) y el menos conocido, «${itemsCon.at(-1).texto}» (media ${m2(itemsCon.at(-1).media)}; ${pct(itemsCon.at(-1).alto)}).`,
        apoyoTipo: 'Tabla', apoyoTitulo: an.porObjetivo[3].titulos.find((x) => /Correlación/.test(x)) || 'Resultados del objetivo específico 3: valoración por ítem', apoyoNota: '',
        interpretacion: 'indica que los estudiantes que más saben de seguridad informática son los que menos incurren en prácticas inseguras, aunque el conocimiento no las explica por completo',
        relacion: 'coincide con', antecedente: 'Parsons et al. (2017)',
        explicacion: 'esos autores hallaron que un mayor conocimiento sobre seguridad de la información se acompaña de conductas más seguras',
        teoria: TEORIAS[0].nombre, teoriaExplica: 'quien conoce la amenaza y sabe cómo responder a ella se siente capaz de protegerse y actúa en consecuencia',
        implicacion: 'las acciones de formación deberían concentrarse en lo que menos se conoce, en especial para qué sirve un gestor de contraseñas', sugerido: true,
    },
];
const resultadosForm = {
    porObjetivo: Object.fromEntries(R.map((r, i) => [String(i), r])),
    limitaciones: 'Las prácticas se midieron por autorreporte, de modo que las conductas inseguras pueden estar subestimadas. El diseño transversal permite hablar de asociación, no de causa. La muestra proviene de una sola facultad, por lo que los resultados no se generalizan a toda la universidad.',
    futuras: 'Se sugiere replicar el estudio en las demás facultades, evaluar con un diseño cuasiexperimental si una capacitación breve cambia las prácticas, y complementar el autorreporte con indicadores que no dependan de la memoria del estudiante.',
    sugeridos: true,
};
const resultados = [parrafoParticipantes, ...R.map((r, i) => `### Objetivo específico ${i + 1}: ${minus(obj(i))}\n${r.hallazgo}. ${r.datos}`)].join('\n\n');
const discusion = [
    ...R.map((r, i) => `En cuanto al objetivo específico ${i + 1}, el resultado ${r.interpretacion}. Este hallazgo ${r.relacion} ${r.antecedente}: ${r.explicacion}. Desde la ${minus(r.teoria)}, ${r.teoriaExplica}. En consecuencia, ${r.implicacion}.`),
    `**Limitaciones.** ${resultadosForm.limitaciones}`,
    `**Futuras investigaciones.** ${resultadosForm.futuras}`,
].join('\n\n');

const conclusionesForm = {
    especificas: {
        0: `Se caracterizaron las prácticas de manejo de contraseñas: la más extendida es «${minus(itemsPra[0].texto)}» (${pct(itemsPra[0].alto)} de los estudiantes), la contraseña principal se usa en ${m2(dCuentas.media)} cuentas en promedio y solo el ${pct(cuenta('lon01', LONGITUDES[2]))} tiene contraseñas de 12 caracteres o más.`,
        1: `Se comparó la seguridad de las contraseñas según la capacitación: quienes la han recibido usan contraseñas más largas, con una asociación estadísticamente significativa y ${fuerza(ji.v)} (V de Cramér = ${m2(ji.v)}); el ${pct(capNo)} de los estudiantes no ha recibido ninguna.`,
        2: `Se estableció que el conocimiento sobre seguridad informática se relaciona de forma inversa y ${fuerza(corr.r)} con las prácticas inseguras (r = ${m2(corr.r)}): a mayor conocimiento, menos prácticas inseguras.`,
    },
    general: 'En respuesta a la pregunta de investigación, el uso de contraseñas inseguras en los estudiantes de la Facultad de Ingeniería está asociado a dos factores: no haber recibido capacitación en seguridad informática y tener un menor conocimiento sobre el tema. Ninguno de los dos lo explica por completo, pues la reutilización aparece incluso entre quienes más saben, lo que sugiere que también pesa la dificultad de recordar muchas contraseñas.',
    recomendaciones: [
        { destinatario: 'La oficina de tecnología de la universidad', accion: 'activar la verificación en dos pasos en la cuenta institucional y recomendar un gestor de contraseñas, en lugar de exigir cambios periódicos' },
        { destinatario: 'La Facultad de Ingeniería', accion: 'incluir una capacitación breve en seguridad informática en la inducción de primer semestre y repetirla cada año' },
        { destinatario: 'Los estudiantes', accion: 'usar contraseñas de 12 caracteres o más, distintas para cada cuenta, y no compartirlas' },
        { destinatario: 'Futuros investigadores', accion: 'replicar el estudio en otras facultades y medir el efecto de una capacitación con un diseño que permita hablar de causa' },
    ],
    sugeridas: true,
};
const conclusiones = [...Object.values(conclusionesForm.especificas).map((c, i) => `${i + 1}. ${c}`), '', conclusionesForm.general].join('\n');
const recomendaciones = conclusionesForm.recomendaciones.map((r) => `- **A ${minus(r.destinatario)}:** ${r.accion.charAt(0).toUpperCase()}${r.accion.slice(1)}.`).join('\n');

const introduccionForm = {
    contexto: 'Las contraseñas siguen siendo la forma más común de proteger una cuenta en línea, y su seguridad depende en buena medida de quien las crea y las administra (Bonneau et al., 2012).',
    problema: `En ${DONDE}, los ${QUIEN} usan una misma cuenta para la plataforma académica, el correo y la biblioteca digital, y la institución no sabe cómo crean, reutilizan y guardan sus contraseñas.`,
    importancia: 'Conocerlo es necesario para orientar la formación en seguridad informática hacia las prácticas que más exponen a los estudiantes.',
    objetivo: `En consecuencia, esta investigación tiene como objetivo ${minus(GENERAL.replace(/\.$/, ''))}, para responder a la pregunta: ${PREGUNTA}`,
    metodo: `Para ello, se desarrolla un estudio de enfoque cuantitativo, de tipo correlacional y diseño no experimental transversal, con un cuestionario aplicado a ${MUESTRA} estudiantes.`,
    organizacion: 'El documento presenta primero el planteamiento del problema, los objetivos y la justificación; luego el marco referencial y la metodología; después los resultados y su discusión, y por último las conclusiones y recomendaciones.',
};
const introduccion = Object.values(introduccionForm).join('\n\n');

const resumenForm = {
    contexto: 'Las contraseñas siguen siendo el mecanismo de autenticación más usado, y su seguridad depende de las prácticas de quien las administra.',
    objetivo: `Esta investigación tuvo como objetivo ${minus(GENERAL.replace(/\.$/, ''))}.`,
    metodologia: `Se desarrolló un estudio cuantitativo, correlacional, de diseño no experimental transversal, con un cuestionario de ${PREGUNTAS.length} preguntas aplicado a ${MUESTRA} estudiantes elegidos por muestreo aleatorio simple.`,
    resultados: `Los resultados mostraron que la práctica más frecuente es reutilizar la contraseña (${pct(itemsPra[0].alto)}), que quienes han recibido capacitación usan contraseñas más largas (V de Cramér = ${m2(ji.v)}) y que el conocimiento se relaciona de forma inversa con las prácticas inseguras (r = ${m2(corr.r)}).`,
    conclusiones: 'Se concluye que el uso de contraseñas inseguras está asociado a la falta de capacitación y a un menor conocimiento sobre seguridad informática, por lo que se recomienda formar a los estudiantes desde el primer semestre y activar la verificación en dos pasos.',
    claves: ['contraseñas', 'seguridad informática', 'autenticación', 'estudiantes universitarios', 'capacitación'],
};
const resumen = [resumenForm.contexto, resumenForm.objetivo, resumenForm.metodologia, resumenForm.resultados, resumenForm.conclusiones].join(' ');

/* ---------- Tablas y figuras de resultados ---------- */
// Cada tabla va después del párrafo que la comenta: 1 = participantes; 2, 3 y 4 = objetivos específicos 1, 2 y 3.
const elementos = [
    ...an.tablas.map((x, i) => ({ id: `tb${String(i + 1).padStart(2, '0')}`, seccion: 'resultados', tipo: 'tabla', auto: true, titulo: x.titulo, nota: x.nota, head: x.head, rows: x.rows, despues: (x.objetivo || 0) + 1 })),
    ...an.figuras.map((f, i) => ({ id: `fg${String(i + 1).padStart(2, '0')}`, seccion: 'resultados', tipo: 'figura', auto: true, titulo: f.titulo, nota: f.nota, despues: (f.objetivo || 0) + 1 })),
];
// Lo que el navegador necesita para dibujar cada figura con el mismo gráfico de barras de la aplicación.
const figuras = an.figuras.map((f, i) => ({ id: `fg${String(i + 1).padStart(2, '0')}`, variable: { nombre: f.variable.nombre, clase: f.variable.clase, frec: f.variable.frec, n: f.variable.n } }));

/* ---------- Proyecto ---------- */
const data = {
    idea: { temas: 'ciberseguridad', problema: 'uso de contraseñas inseguras en las cuentas institucionales y personales', causa1: ARBOL.causas[0], causa2: ARBOL.causas[1], causa3: ARBOL.causas[2], efecto1: ARBOL.efectos[0], efecto2: ARBOL.efectos[1], efecto3: ARBOL.efectos[2], quien: QUIEN, donde: DONDE, cuando: CUANDO, antecedente1: 'Florêncio y Herley (2007)', antecedente2: 'Das et al. (2014)', programa: 'Ingeniería de Sistemas', nivel: 'Pregrado', alcance: 'relacionar', frase: `En ${DONDE}, ${QUIEN} presentan uso de contraseñas inseguras en las cuentas institucionales y personales, durante ${CUANDO}.`, elegida: `En ${DONDE}, ${QUIEN} presentan uso de contraseñas inseguras en las cuentas institucionales y personales, durante ${CUANDO}.` },
    tituloForm: { accion: 'Factores asociados a', objeto: 'el uso de contraseñas inseguras', donde: DONDE, quien: 'estudiantes', cuando: '', paraque: '', includeParaque: false, includeQuien: true, includeDonde: true, includeCuando: false },
    titulo: TITULO,
    preguntaForm: { tipo: 'Correlacional', inicio: '¿Qué factores están asociados a', inicioLibre: '', objeto: 'el uso de contraseñas inseguras', var2: '', quien: `los ${QUIEN}`, donde: DONDE, cuando: CUANDO },
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
        poblacion: { descripcion: `${QUIEN} de ${DONDE}`, unidad: 'estudiante con matrícula activa', inclusion: `estudiantes con matrícula activa en ${CUANDO} que aceptaron participar`, exclusion: 'estudiantes en intercambio o en práctica fuera de la ciudad', muestreo: 'aleatorio simple', muestraTexto: '', estratos: [], perdidas: 0 },
        analisis: PLAN,
        instrumentos: [{ id: 'i1', tecnica: 'Encuesta', instrumento: 'cuestionario', aplicaA: `${QUIEN} de ${DONDE}`, objetivo: 'todos los objetivos específicos', nota: 'permite medir las prácticas, la capacitación recibida y el conocimiento en una sola aplicación', validaciones: ['juicio de expertos', 'alfa de Cronbach'], validez: 'juicio de expertos' }],
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
    estilo: { persona: 'impersonal', tiempo: 'pasado', terminos: [{ usar: 'contraseña', enLugarDe: 'password' }, { usar: 'verificación en dos pasos', enLugarDe: 'doble factor' }], evitar: ['hoy en día'], notas: '' },
    ejemplo: { clave: 'sistemas', aviso: 'Proyecto de ejemplo. Las respuestas de la encuesta son simuladas; las fuentes citadas son publicaciones reales.' },
};

const salida = {
    clave: 'sistemas',
    nombre: 'Ejemplo · Ingeniería de Sistemas: contraseñas inseguras',
    data,
    encuestas: [{ instrumentId: INSTRUMENTO.id, definition, respuestas: RESPUESTAS }],
    figuras,
};
const destino = path.join(raiz, 'server', 'ejemplos', 'sistemas.json');
fs.mkdirSync(path.dirname(destino), { recursive: true });
fs.writeFileSync(destino, `${JSON.stringify(salida)}\n`);
console.log(`${destino}\n${(fs.statSync(destino).size / 1024).toFixed(0)} KB · proyecto ${(JSON.stringify(data).length / 1024).toFixed(0)} KB · ${RESPUESTAS.length} respuestas · ${an.tablas.length} tablas · ${an.figuras.length} figuras`);
console.log(`alfa prácticas ${m2(alfaPra.alfa)} · alfa conocimiento ${m2(alfaCon.alfa)} · r ${m2(corr.r)} · V ${m2(ji.v)} (p ${fmtP(ji.p)}) · capacitados ${capSi}`);
