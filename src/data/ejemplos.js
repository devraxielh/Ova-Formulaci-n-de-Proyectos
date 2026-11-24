import { NIVELES } from './nivelesVerbos.js';

/*
 * Ejemplos alineados con el proyecto del estudiante: se muestran como placeholder («Ej: …»)
 * y Tab los escribe en el campo vacío. Si falta un dato, cada componente usa su ejemplo genérico.
 * Nunca inventan cifras ni citas: dejan marcas [entre corchetes] para que el estudiante las complete.
 */

export const limpio = (text) => String(text || '').trim().replace(/[\s.,;:]+$/, '');
// Contracciones del español: «de el» → «del», «a el» → «al».
const contraer = (text) => String(text || '').replace(/\bde el\b/g, 'del').replace(/\ba el\b/g, 'al');
const minuscula = (text) => (text ? text.charAt(0).toLowerCase() + text.slice(1) : '');
const lista = (items) => {
    const values = items.map(limpio).filter(Boolean).map(minuscula);
    if (values.length <= 1) return values[0] || '';
    return `${values.slice(0, -1).join(', ')} y ${values[values.length - 1]}`;
};

// El problema de la Ideación, en minúscula y sin punto final.
export const problemaDe = (idea) => minuscula(limpio(idea?.problema));

// Agrega el artículo si falta: «alta tasa de…» → «la alta tasa de…», «bajo rendimiento» → «el bajo rendimiento».
const ARTICULO = /^(el|la|los|las|un|una|unos|unas|lo|su|sus|este|esta|estos|estas)\s/i;
export const conArticulo = (text) => {
    const t = minuscula(limpio(text));
    if (!t || ARTICULO.test(t)) return t;
    const first = t.split(/\s+/)[0];
    if (/(as)$/.test(first)) return `las ${t}`;
    if (/(os|es)$/.test(first)) return `los ${t}`;
    if (/(a|ción|sión|dad|tad|tud|umbre|ez)$/.test(first)) return `la ${t}`;
    if (/o$/.test(first)) return `el ${t}`;
    return t;
};

// Objeto de estudio del título según lo que el estudiante quiere lograr.
const PREFIJO_OBJETIVO = {
    explorar: 'las percepciones sobre',
    describir: 'las características de',
    comparar: 'las diferencias en',
    relacionar: 'los factores relacionados con',
    explicar: 'los factores que determinan',
    predecir: 'los factores que predicen',
    evaluar: 'el efecto de una estrategia sobre',
    proponer: 'una estrategia para reducir',
    mejorar: 'el proceso de atención para reducir',
};

export const objetoTitulo = (alcance, idea) => {
    const problema = conArticulo(idea?.problema);
    if (!problema) return '';
    return contraer(`${PREFIJO_OBJETIVO[alcance] || 'los factores asociados a'} ${problema}`);
};

export const proposito = (idea) => {
    const problema = conArticulo(idea?.problema);
    return problema ? contraer(`orientar acciones que reduzcan ${problema}`) : '';
};

// Última parte del lugar («un hospital de Sincelejo, Sucre» → «Sucre»).
const regionDe = (donde) => {
    const partes = limpio(donde).split(',').map((item) => item.trim()).filter(Boolean);
    return partes.length > 1 ? partes[partes.length - 1] : '';
};

// La pregunta como frase: «¿Qué factores…?» → «qué factores…».
const preguntaComoFrase = (pregunta) => minuscula(limpio(pregunta).replace(/^¿/, '').replace(/\?$/, ''));

export const parrafosPlanteamiento = ({ idea, quien, donde, pregunta }) => {
    const problema = problemaDe(idea);
    const region = regionDe(donde);
    const causas = lista([idea?.causa1, idea?.causa2, idea?.causa3]);
    const efectos = lista([idea?.efecto1, idea?.efecto2, idea?.efecto3]);
    const frase = preguntaComoFrase(pregunta);
    const sujeto = limpio(quien) ? minuscula(limpio(quien)) : '';
    const result = {
        contexto: problema
            ? `En la actualidad, ${conArticulo(problema)} es una situación que preocupa en Colombia${region ? ` y, en particular, en ${region}` : ''} [agrega una cifra nacional o regional y su fuente, por ejemplo (DANE, 2024)].`
            : '',
        descripcion: problema
            ? `${limpio(donde) ? `En ${limpio(donde)}, ` : ''}${sujeto ? `${sujeto} presentan` : 'se presenta'} ${problema} [agrega el dato que lo demuestra: porcentaje, cantidad o frecuencia, y su fuente].`
            : '',
        causas: causas
            ? `Entre las causas de esta situación se encuentran ${causas} [respalda al menos una con un estudio: (Autor, año)].`
            : '',
        efectos: efectos
            ? `Como consecuencia, se presentan ${efectos}; de continuar esta situación, [describe qué podría pasar].`
            : '',
        cierre: frase
            ? `Por lo anterior, resulta necesario establecer ${frase}.`
            : '',
    };
    return Object.fromEntries(Object.entries(result).map(([key, value]) => [key, contraer(value)]));
};

// Segunda variable de la pregunta, según cómo empieza.
export const segundaVariable = (conector, idea) => {
    const problema = conArticulo(idea?.problema);
    const efecto = conArticulo(idea?.efecto1);
    if (conector === 'para') return problema ? contraer(`reducir ${problema}`) : '';
    if (conector === 'a') return efecto ? contraer(`a ${efecto}`).replace(/^(a|al)\s/, '') : '';
    if (conector === 'en' || conector === 'y' || conector === 'con' || conector === 'según') return efecto || '';
    return '';
};

/* ---------- Objetivos ---------- */

// Verbo sustantivado del título → infinitivo del objetivo.
export const INFINITIVO = {
    'Análisis': 'Analizar', 'Cálculo': 'Calcular', 'Caracterización': 'Caracterizar', 'Categorización': 'Categorizar',
    'Comparación': 'Comparar', 'Compilación': 'Compilar', 'Comprobación': 'Comprobar', 'Construcción': 'Construir',
    'Definición': 'Definir', 'Demostración': 'Demostrar', 'Desarrollo': 'Desarrollar', 'Descripción': 'Describir',
    'Determinación': 'Determinar', 'Diagnóstico': 'Diagnosticar', 'Diseño': 'Diseñar', 'Establecimiento': 'Establecer',
    'Estandarización': 'Estandarizar', 'Estudio': 'Estudiar', 'Evaluación': 'Evaluar', 'Explicación': 'Explicar',
    'Formulación': 'Formular', 'Generación': 'Generar', 'Identificación': 'Identificar', 'Implementación': 'Implementar',
    'Interpretación': 'Interpretar', 'Investigación': 'Investigar', 'Moderación': 'Moderar', 'Monitoreo': 'Monitorear',
    'Optimización': 'Optimizar', 'Organización': 'Organizar', 'Planificación': 'Planificar', 'Producción': 'Producir',
    'Programación': 'Programar', 'Propuesta': 'Proponer', 'Relación': 'Relacionar', 'Sistematización': 'Sistematizar',
    'Validación': 'Validar', 'Verificación': 'Verificar',
};

// «Análisis de los factores…» → «Analizar los factores…».
export const generalDesdeTitulo = (titulo) => {
    const t = limpio(titulo);
    const sustantivo = Object.keys(INFINITIVO).find((item) => t.toLowerCase().startsWith(item.toLowerCase()));
    if (!sustantivo) return '';
    let resto = t.slice(sustantivo.length).trim();
    if (/^del\s/i.test(resto)) resto = `el ${resto.slice(4)}`;
    else if (/^de\s/i.test(resto)) resto = resto.slice(3);
    return `${INFINITIVO[sustantivo]} ${resto}`.trim();
};

// Tres objetivos específicos en escalera (diagnosticar → analizar → proponer o valorar).
// Los verbos cambian según lo que el estudiante quiere lograr y no repiten el verbo del objetivo general.
const ESCALERAS = {
    explorar: [
        ['Identificar', (c) => `las percepciones de ${c.sujeto} sobre ${c.problema}`],
        ['Reconocer', (c) => `las experiencias de ${c.sujeto} relacionadas con ${c.problema}`],
        ['Delimitar', (c) => `las categorías que emergen sobre ${c.problema}`],
    ],
    describir: [
        ['Identificar', (c) => `los factores asociados a ${c.problema}`],
        ['Cuantificar', (c) => `la frecuencia de ${c.problema} en ${c.sujeto}${c.lugar}`],
        ['Caracterizar', (c) => `${c.problema} según los factores identificados`],
    ],
    comparar: [
        ['Identificar', (c) => `los grupos de estudio y sus características`],
        ['Describir', (c) => `${c.problema} en cada uno de los grupos`],
        ['Contrastar', (c) => `${c.problema} entre los grupos de estudio`],
    ],
    relacionar: [
        ['Identificar', (c) => `${c.causa || 'los factores asociados'} en ${c.sujeto}`],
        ['Cuantificar', (c) => `${c.problema} en ${c.sujeto}${c.lugar}`],
        ['Establecer', (c) => `la relación entre ${c.causa || 'los factores identificados'} y ${c.problema}`],
    ],
    explicar: [
        ['Caracterizar', (c) => `${c.problema} en ${c.sujeto}${c.lugar}`],
        ['Relacionar', (c) => `los factores asociados con ${c.problema}`],
        ['Determinar', (c) => `los factores que más inciden en ${c.problema}`],
    ],
    predecir: [
        ['Caracterizar', (c) => `${c.sujeto}${c.lugar}`],
        ['Establecer', (c) => `las variables asociadas a ${c.problema}`],
        ['Estimar', (c) => `la probabilidad de ${c.problema} a partir de esas variables`],
    ],
    evaluar: [
        ['Diagnosticar', (c) => `${c.problema} antes de aplicar la estrategia`],
        ['Comparar', (c) => `${c.problema} antes y después de aplicar la estrategia`],
        ['Valorar', (c) => `el efecto de la estrategia sobre ${c.problema}`],
    ],
    proponer: [
        ['Diagnosticar', (c) => `${c.problema} en ${c.sujeto}${c.lugar}`],
        ['Analizar', (c) => `las causas de ${c.problema}`],
        ['Diseñar', (c) => `una estrategia para reducir ${c.problema}`],
    ],
    mejorar: [
        ['Describir', (c) => `el proceso actual relacionado con ${c.problema}`],
        ['Analizar', (c) => `las fallas del proceso que originan ${c.problema}`],
        ['Proponer', (c) => `mejoras al proceso para reducir ${c.problema}${c.efecto ? ` y ${c.efecto}` : ''}`],
    ],
};

export const especificosSugeridos = ({ idea, alcance, quien, donde, general }) => {
    const problema = conArticulo(idea?.problema);
    if (!problema) return [];
    const base = limpio(quien) ? minuscula(limpio(quien)) : '';
    const c = {
        problema,
        sujeto: base ? (ARTICULO.test(base) ? base : `los ${base}`) : 'la población de estudio',
        lugar: limpio(donde) ? ` de ${limpio(donde)}` : '',
        causa: conArticulo(idea?.causa1),
        efecto: conArticulo(idea?.efecto1),
    };
    const verboGeneral = limpio(general).split(/\s+/)[0]?.toLowerCase() || '';
    const pasos = ESCALERAS[alcance] || ESCALERAS.explicar;
    const usados = new Set(pasos.map(([verbo]) => verbo));
    return pasos.map(([verbo, objeto]) => {
        // Si repite el verbo del general, se usa otro del mismo nivel.
        const mismoNivel = NIVELES.find(({ verbs }) => verbs.includes(verbo))?.verbs || [];
        const elegido = verbo.toLowerCase() === verboGeneral
            ? mismoNivel.find((item) => item.toLowerCase() !== verboGeneral && !usados.has(item)) || verbo
            : verbo;
        return contraer(`${elegido} ${objeto(c)}`);
    });
};

/* ---------- Justificación ---------- */

// Ejemplos de cada párrafo de la justificación armados con la idea, la población, el lugar y el objetivo general.
export const parrafosJustificacion = ({ idea, quien, donde, general }) => {
    const problema = problemaDe(idea);
    const efectos = lista([idea?.efecto1, idea?.efecto2]);
    const base = limpio(quien) ? minuscula(limpio(quien)) : '';
    const sujeto = base && !ARTICULO.test(base) ? `los ${base}` : base;
    const lugar = limpio(donde);
    const objetivo = minuscula(limpio(general));
    const result = {
        importancia: problema
            ? `Esta investigación es conveniente porque ${conArticulo(problema)}${efectos ? ` genera ${efectos}` : ' afecta a la población'}${lugar ? ` en ${lugar}` : ''}, y hasta ahora no se conoce con precisión [di por qué es oportuno estudiarlo ahora].`
            : '',
        social: sujeto
            ? `Los principales beneficiarios serán ${sujeto}${lugar ? ` de ${lugar}` : ''}, pues los resultados permitirán [di qué cambiará para ellos]; también se beneficiarán [nombra la institución, las familias o la comunidad].`
            : '',
        practico: problema
            ? `En lo práctico, los resultados servirán como base para orientar acciones que reduzcan ${conArticulo(problema)} [di quién podría usarlos y para qué decisión].`
            : '',
        teorico: objetivo
            ? `En lo teórico, al ${objetivo}, el estudio aportará evidencia en un contexto poco estudiado; en lo metodológico, [di qué instrumento o procedimiento dejará disponible para otros estudios].`
            : '',
        viabilidad: sujeto || lugar
            ? `El estudio es viable porque se cuenta con acceso a ${sujeto || 'la población'}${lugar ? ` en ${lugar}` : ''}, con el aval de [institución], y con el tiempo y los recursos necesarios [di cuáles].`
            : '',
    };
    return Object.fromEntries(Object.entries(result).map(([key, value]) => [key, contraer(value)]));
};

/* ---------- Alcances y limitaciones ---------- */

// Tipo de alcance de la investigación según lo que el estudiante quiere lograr.
export const TIPO_ALCANCE = {
    explorar: 'exploratorio', describir: 'descriptivo', comparar: 'descriptivo comparativo', relacionar: 'correlacional',
    explicar: 'explicativo', predecir: 'explicativo predictivo', evaluar: 'evaluativo', proponer: 'propositivo', mejorar: 'propositivo',
};

// Ejemplos de cada campo del alcance y de las limitaciones, armados con la idea del estudiante.
export const ejemplosAlcance = ({ idea, alcance }) => {
    const problema = conArticulo(idea?.problema);
    if (!problema) return {};
    const resultados = {
        explorar: `una primera descripción de las percepciones sobre ${problema} y las categorías que emergen`,
        describir: `la caracterización de ${problema} y de los factores asociados`,
        comparar: `las diferencias en ${problema} entre los grupos de estudio`,
        relacionar: `el grado de relación entre ${conArticulo(idea?.causa1) || 'los factores estudiados'} y ${problema}`,
        explicar: `la identificación de los factores que más inciden en ${problema}`,
        predecir: `un modelo que estime la probabilidad de ${problema}`,
        evaluar: `la valoración del efecto de la estrategia sobre ${problema}`,
        proponer: `una estrategia para reducir ${problema}, validada con expertos`,
        mejorar: `una propuesta de mejora del proceso para reducir ${problema}`,
    }[alcance] || `la identificación de los factores asociados a ${problema}`;
    const exclusiones = ['proponer', 'mejorar'].includes(alcance)
        ? 'la puesta en marcha de la propuesta ni la medición de sus efectos'
        : 'el diseño ni la aplicación de soluciones, ni otras poblaciones o sedes';
    const result = {
        tematico: `los factores asociados a ${problema}`,
        resultados,
        exclusiones,
        limitacion: limpio(idea?.limites) || 'el acceso a los participantes depende de la autorización de la institución',
        mitigacion: 'se solicitará el aval con anticipación y se acordará un cronograma de recolección con la institución',
    };
    return Object.fromEntries(Object.entries(result).map(([key, value]) => [key, contraer(value)]));
};
