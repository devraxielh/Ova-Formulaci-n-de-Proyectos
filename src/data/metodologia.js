import { VALIDACION_DETALLE, VALIDACION_IDS, parrafoConDatos } from './validacion.js';
import { preguntasDe, ubicacionDe } from '../services/instrumentos.js';
import { repartoEstratos } from './muestreo.js';

/*
 * Datos y redacción de la Metodología: enfoque, tipos, diseños, población y muestra,
 * plan de análisis, instrumentos, cronograma y presupuesto.
 * Lo usan la clase (componente Metodologia) y el documento (projectDoc).
 */

export const ENFOQUES = [
    { id: 'Cuantitativo', def: 'que mide variables con datos numéricos y los analiza con métodos estadísticos para describir, relacionar o explicar el fenómeno' },
    { id: 'Cualitativo', def: 'que comprende el fenómeno desde las experiencias, percepciones y significados de los participantes, a partir de datos textuales o visuales' },
    { id: 'Mixto', def: 'que integra datos cuantitativos y cualitativos para obtener una comprensión más completa del fenómeno' },
];

export const TIPOS = [
    { id: 'Exploratoria', alcance: 'exploratorio', def: 'pues examina un tema poco estudiado para identificar sus aspectos principales' },
    { id: 'Descriptiva', alcance: 'descriptivo', def: 'pues especifica las características del fenómeno y de la población sin establecer causas' },
    { id: 'Correlacional', alcance: 'correlacional', def: 'pues mide el grado de relación entre variables, sin afirmar que una cause la otra' },
    { id: 'Explicativa', alcance: 'explicativo', def: 'pues busca las causas o los factores que explican el fenómeno' },
    { id: 'Evaluativa', alcance: 'evaluativo', def: 'pues valora el efecto o la efectividad de una intervención' },
    { id: 'Propositiva', alcance: 'propositivo', def: 'pues diagnostica el problema y diseña una propuesta para atenderlo' },
];

export const DISENOS = {
    Cuantitativo: [
        { id: 'no experimental transversal', def: 'en el que se observan las variables tal como ocurren, sin manipularlas, en un solo momento' },
        { id: 'no experimental longitudinal', def: 'en el que se observan las variables sin manipularlas, en varios momentos, para ver sus cambios' },
        { id: 'cuasiexperimental', def: 'en el que se aplica una intervención a grupos ya formados y se comparan sus resultados antes y después' },
        { id: 'experimental', def: 'en el que se manipula una variable y se asignan los participantes al azar a grupos de intervención y control' },
    ],
    Cualitativo: [
        { id: 'fenomenológico', def: 'que describe y comprende la experiencia vivida por los participantes frente al fenómeno' },
        { id: 'estudio de caso', def: 'que analiza en profundidad un caso delimitado (una persona, un grupo o una institución)' },
        { id: 'etnográfico', def: 'que describe las prácticas, creencias y significados de un grupo en su propio contexto' },
        { id: 'teoría fundamentada', def: 'que construye una explicación teórica a partir de los datos recogidos' },
        { id: 'investigación-acción', def: 'que diagnostica un problema con la comunidad, actúa sobre él y reflexiona sobre los cambios' },
        { id: 'narrativo', def: 'que reconstruye las historias de vida de los participantes en relación con el fenómeno' },
    ],
    Mixto: [
        { id: 'explicativo secuencial', def: 'en el que primero se recogen datos cuantitativos y luego cualitativos para explicar los resultados' },
        { id: 'exploratorio secuencial', def: 'en el que primero se recogen datos cualitativos y luego cuantitativos para medir lo encontrado' },
        { id: 'convergente', def: 'en el que se recogen datos cuantitativos y cualitativos al mismo tiempo y se comparan' },
    ],
};

export const MUESTREOS = [
    { id: 'aleatorio simple', probabilistico: true, def: 'todos los individuos tienen la misma probabilidad de ser elegidos' },
    { id: 'aleatorio estratificado', probabilistico: true, def: 'la población se divide en grupos y se elige al azar dentro de cada uno' },
    { id: 'sistemático', probabilistico: true, def: 'se elige un individuo cada cierto intervalo de una lista' },
    { id: 'por conglomerados', probabilistico: true, def: 'se eligen al azar grupos completos, como cursos o sedes' },
    { id: 'por conveniencia', probabilistico: false, def: 'se eligen los participantes disponibles y accesibles' },
    { id: 'intencional', probabilistico: false, def: 'se eligen participantes que cumplen características definidas por el investigador' },
    { id: 'bola de nieve', probabilistico: false, def: 'los participantes recomiendan a otros que cumplen los criterios' },
    { id: 'censo (toda la población)', probabilistico: false, def: 'se estudia a toda la población porque es pequeña y accesible' },
];

export const TECNICAS_ANALISIS = [
    'estadística descriptiva (frecuencias, porcentajes, media y desviación estándar)',
    'tablas de contingencia y prueba chi cuadrado',
    'correlación de Pearson o Spearman',
    'comparación de grupos (t de Student o U de Mann-Whitney)',
    'análisis de varianza (ANOVA)',
    'regresión lineal o logística',
    'análisis de contenido',
    'análisis temático con codificación abierta y axial',
    'triangulación de fuentes',
];

export const SOFTWARE = ['Excel', 'SPSS', 'R', 'Jamovi', 'JASP', 'Atlas.ti', 'NVivo', 'Taguette'];

export const TECNICAS = [
    { tecnica: 'Encuesta', instrumento: 'cuestionario' },
    { tecnica: 'Entrevista', instrumento: 'guía de entrevista semiestructurada' },
    { tecnica: 'Observación', instrumento: 'lista de chequeo o guía de observación' },
    { tecnica: 'Grupo focal', instrumento: 'guía de grupo focal' },
    { tecnica: 'Revisión documental', instrumento: 'ficha de registro de datos' },
    { tecnica: 'Prueba o test', instrumento: 'prueba estandarizada' },
];

export const VALIDACIONES = VALIDACION_IDS;

export const CATEGORIAS = ['Recursos Humanos', 'Infraestructura Física', 'Equipos (servidores, computadores)', 'Infraestructura Cloud', 'Materiales/Muestreos', 'Viajes', 'Bibliografía/Licencias', 'Otros'];
export const FUENTES = ['Personal', 'Universidad/Institución', 'Externa'];

export const FASES = ['Preparación', 'Recolección de datos', 'Análisis', 'Informe y socialización'];

const clean = (text) => String(text || '').trim().replace(/[\s.,;:]+$/, '');
const lower = (text) => (text ? text.charAt(0).toLowerCase() + text.slice(1) : '');
const capital = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : '');

// Tamaño de muestra para proporciones (p = q = 0,5).
export const tamanoMuestra = ({ finita, N, Z, e }) => {
    const p = 0.5;
    const n0 = (Z ** 2 * p * (1 - p)) / (e ** 2);
    if (!finita) return Math.ceil(n0);
    const total = Number(N) || 0;
    if (total <= 0) return 0;
    return Math.ceil((total * Z ** 2 * p * (1 - p)) / ((e ** 2) * (total - 1) + Z ** 2 * p * (1 - p)));
};

export const CONFIANZAS = [{ z: 1.645, label: '90 %' }, { z: 1.96, label: '95 %' }, { z: 2.576, label: '99 %' }];

/* ---------- Redacción ---------- */

export const redactarEnfoque = ({ enfoque, texto }) => {
    const e = ENFOQUES.find((item) => item.id === enfoque);
    if (!e) return '';
    return [`La investigación tiene un enfoque ${e.id.toLowerCase()}, ${e.def}.`, clean(texto) ? `${capital(clean(texto))}.` : ''].filter(Boolean).join(' ');
};

export const redactarTipo = ({ tipo, texto }) => {
    const t = TIPOS.find((item) => item.id === tipo);
    if (!t) return '';
    return [`Es una investigación de tipo ${t.id.toLowerCase()}, ${t.def}.`, clean(texto) ? `${capital(clean(texto))}.` : ''].filter(Boolean).join(' ');
};

export const redactarDiseno = ({ enfoque, diseno, texto }) => {
    const d = (DISENOS[enfoque] || []).find((item) => item.id === diseno);
    if (!d) return '';
    return [`Se utiliza un diseño ${d.id}, ${d.def}.`, clean(texto) ? `${capital(clean(texto))}.` : ''].filter(Boolean).join(' ');
};

export const redactarPoblacion = (p, calc) => {
    if (!clean(p.descripcion)) return '';
    const m = MUESTREOS.find((item) => item.id === p.muestreo);
    const unidad = clean(p.unidad) || 'personas';
    const partes = [
        `La población está conformada por ${lower(clean(p.descripcion))}${calc.finita && Number(calc.N) > 0 ? `, que suman ${Number(calc.N).toLocaleString('es-CO')} ${lower(unidad)}` : ''}.`,
        clean(p.unidad) ? `La unidad de análisis corresponde a ${/^(el|la|los|las|cada)\s/i.test(clean(p.unidad)) ? lower(clean(p.unidad)) : `los ${lower(clean(p.unidad))}`}.` : '',
        clean(p.inclusion) ? `Criterios de inclusión: ${lower(clean(p.inclusion))}.` : '',
        clean(p.exclusion) ? `Criterios de exclusión: ${lower(clean(p.exclusion))}.` : '',
    ];
    if (m?.probabilistico) {
        const conf = CONFIANZAS.find((c) => c.z === Number(calc.Z))?.label || '95 %';
        partes.push(`El tamaño de la muestra se calculó con la fórmula para población ${calc.finita ? 'finita' : 'infinita'}, con un nivel de confianza del ${conf} y un margen de error del ${Math.round(Number(calc.e) * 100)} %, lo que da una muestra de ${tamanoMuestra(calc)} ${lower(unidad)}.`);
        partes.push(`Se usa un muestreo probabilístico ${m.id}: ${m.def}.`);
        // Datos guardados desde la ventana de muestreo: intervalo, reparto por estratos o conglomerados sorteados.
        const n = tamanoMuestra(calc);
        if (m.id === 'sistemático' && calc.finita && Number(calc.N) > 0 && n > 0) {
            const k = Math.max(1, Math.floor(Number(calc.N) / n));
            partes.push(`El intervalo de selección es k = ${Number(calc.N).toLocaleString('es-CO')} / ${n} ≈ ${k}: a partir de un arranque sorteado entre 1 y ${k}, se toma un elemento cada ${k} de la lista.`);
        }
        if (m.id === 'aleatorio estratificado') {
            const { filas } = repartoEstratos(p.estratos, n);
            if (filas.length >= 2) partes.push(`La muestra se reparte de forma proporcional al tamaño de cada estrato: ${filas.map((f) => `${f.nombre} (${f.n} de ${f.N.toLocaleString('es-CO')})`).join('; ')}.`);
        }
        if (m.id === 'por conglomerados') {
            const M = Math.round(Number(p.conglomerados?.total) || 0);
            const prom = Number(p.conglomerados?.promedio) || 0;
            if (M > 0 && prom > 0) partes.push(`De los ${M.toLocaleString('es-CO')} conglomerados, con cerca de ${prom.toLocaleString('es-CO')} ${lower(unidad)} cada uno, se sortean ${Math.min(M, Math.ceil(n / prom))} y se estudia a todos sus integrantes.`);
        }
    } else if (m) {
        partes.push(m.id.startsWith('censo')
            ? `Se trabaja con toda la población (censo): ${m.def}.`
            : `Se usa un muestreo no probabilístico ${m.id}: ${m.def}.`);
    }
    if (clean(p.muestraTexto)) partes.push(`${capital(clean(p.muestraTexto))}.`);
    return partes.filter(Boolean).join(' ');
};

export const redactarAnalisis = (filas) => filas
    .filter((f) => clean(f.objetivo) && clean(f.tecnica))
    .map((f, i) => `- **Objetivo específico ${i + 1}** (${lower(clean(f.objetivo))}): los datos se analizarán mediante ${clean(f.tecnica)}${clean(f.software) ? `, con apoyo de ${clean(f.software)}` : ''}.`)
    .join('\n');

// Métodos de validez y confiabilidad de un instrumento (acepta el campo antiguo `validez`).
export const validacionesDe = (it) => {
    if (Array.isArray(it?.validaciones)) return it.validaciones.filter(Boolean);
    return clean(it?.validez) ? [clean(it.validez)] : [];
};

const listaY = (items) => (items.length <= 1 ? items[0] || '' : `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`);
const conArticuloInstr = (nombre) => {
    const n = lower(clean(nombre));
    if (/^(el|la|los|las|un|una)\s/.test(n)) return n;
    return /^(guía|lista|ficha|prueba|escala|rúbrica|bitácora|matriz|encuesta|entrevista)/.test(n) ? `la ${n}` : `el ${n}`;
};

// Frase sobre el instrumento ya armado (preguntas y dónde se presenta), para la fila que lo describe.
const TIPO_PREGUNTA = { likert: ['de escala tipo Likert', 'de escala tipo Likert'], opcion: ['de opción única', 'de opción única'], multiple: ['de opción múltiple', 'de opción múltiple'], sino: ['dicotómica (sí o no)', 'dicotómicas (sí o no)'], numero: ['numérica', 'numéricas'], abierta: ['abierta', 'abiertas'] };
export const fraseArmado = (armado) => {
    const preguntas = armado ? preguntasDe(armado) : [];
    if (!preguntas.length) return '';
    const cuenta = Object.keys(TIPO_PREGUNTA).map((tipo) => [tipo, preguntas.filter((q) => q.tipo === tipo).length]).filter(([, n]) => n > 0);
    const desglose = cuenta.length > 1 ? ` (${cuenta.map(([tipo, n]) => `${n} ${TIPO_PREGUNTA[tipo][n === 1 ? 0 : 1]}`).join(', ')})` : ` ${TIPO_PREGUNTA[cuenta[0][0]][preguntas.length === 1 ? 0 : 1]}`;
    const donde = { plan: 'se presenta completo al final de este apartado', anexo: 'se presenta completo en los anexos', no: '' }[ubicacionDe(armado)];
    return ` Consta de ${preguntas.length} ${preguntas.length === 1 ? 'pregunta' : 'preguntas'}${desglose}${donde ? ` y ${donde}` : ''}.`;
};

// `armados` = instrumentos completos (data.instrumentosGen); cada uno se asocia a su fila por `filaId`.
// Métodos de validez elegidos para un instrumento y si ya tienen su cálculo: [{ id, titulo, hecho }].
export const estadoValidacion = (it) => validacionesDe(it).map((id) => {
    const v = VALIDACION_DETALLE.find((x) => x.id === id);
    return { id, titulo: v?.titulo || id, hecho: Boolean(parrafoConDatos(id, conArticuloInstr(it.instrumento), it.validacionDatos?.[id])) };
});

export const redactarInstrumentos = (items, armados = []) => {
    const armadoDe = (it) => (Array.isArray(armados) ? armados : []).find((a) => a && it.id && a.filaId === it.id);
    const validos = items.filter((it) => clean(it.tecnica) && clean(it.instrumento));
    const lista = validos
        .map((it) => {
            const vals = validacionesDe(it);
            return `- **${capital(clean(it.tecnica))} (${lower(clean(it.instrumento))}):** se aplicará a ${lower(clean(it.aplicaA)) || 'los participantes'}${clean(it.objetivo) ? ` para ${lower(clean(it.objetivo))}` : ''}.${vals.length ? ` Su validez y confiabilidad se asegurarán mediante ${listaY(vals.map(lower))}.` : ''}${fraseArmado(armadoDe(it))}`;
        })
        .join('\n');
    // Subtítulo «Validez y confiabilidad»: un párrafo por método, con los instrumentos que lo usan.
    const metodos = VALIDACION_DETALLE.filter((v) => validos.some((it) => validacionesDe(it).includes(v.id)));
    if (!lista || metodos.length === 0) return lista;
    const contraer = (t) => t.replace(/\bde el\b/g, 'del').replace(/\ba el\b/g, 'al');
    const parrafos = metodos.flatMap((v) => {
        const usan = validos.filter((it) => validacionesDe(it).includes(v.id));
        // Con datos de la calculadora: un párrafo por instrumento con sus valores; sin datos: el párrafo modelo.
        const conDatos = usan.map((it) => parrafoConDatos(v.id, conArticuloInstr(it.instrumento), it.validacionDatos?.[v.id])).filter(Boolean);
        const sinDatos = usan.filter((it) => !parrafoConDatos(v.id, conArticuloInstr(it.instrumento), it.validacionDatos?.[v.id]));
        // Sin resultados registrados: queda el párrafo modelo y, entre corchetes, la advertencia de que falta hacerlo.
        const modelo = sinDatos.length ? [`${v.parrafo(listaY(sinDatos.map((it) => conArticuloInstr(it.instrumento))), sinDatos.length > 1)} [Falta: registra en la calculadora los resultados de ${lower(v.titulo)} de ${listaY(sinDatos.map((it) => conArticuloInstr(it.instrumento)))}.]`] : [];
        return [...conDatos, ...modelo].map(contraer);
    });
    return `${lista}\n\n### Validez y confiabilidad\n${parrafos.join('\n\n')}`;
};

export const periodoLabel = (unidad) => (unidad === 'semanal' ? 'Semana' : 'Mes');
