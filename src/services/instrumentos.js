// Instrumentos de recolección (encuesta o guía de entrevista) que arma el estudiante: data.instrumentosGen.

export const LIKERT = ['Totalmente en desacuerdo', 'En desacuerdo', 'Ni de acuerdo ni en desacuerdo', 'De acuerdo', 'Totalmente de acuerdo'];
export const FRECUENCIA = ['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'];

export const TIPOS_PREGUNTA = [
    { id: 'likert', label: 'Escala (Likert)', conOpciones: true },
    { id: 'opcion', label: 'Opción única', conOpciones: true },
    { id: 'multiple', label: 'Varias opciones', conOpciones: true },
    { id: 'sino', label: 'Sí / No' },
    { id: 'numero', label: 'Número' },
    { id: 'abierta', label: 'Respuesta abierta' },
];

export const opcionesDe = (q) => {
    if (q.tipo === 'sino') return ['Sí', 'No'];
    const propias = (Array.isArray(q.opciones) ? q.opciones : []).map((o) => String(o || '').trim()).filter(Boolean);
    if (q.tipo === 'likert') return propias.length >= 2 ? propias : LIKERT;
    return propias;
};

const texto = (v) => String(v ?? '').trim();

// Dónde sale el instrumento en el documento: dentro del Plan de análisis (7.5.1 Instrumentos), como anexo o en ninguna parte.
export const UBICACIONES = [
    { id: 'anexo', label: 'Como anexo, al final del documento' },
    { id: 'no', label: 'No incluirlo en el documento' },
];
// Los instrumentos armados van en Anexos (la opción antigua «dentro del plan» también se lleva a Anexos).
// Solo quedan fuera si el estudiante elige no incluirlos.
export const ubicacionDe = (ins) => (ins?.ubicacion === 'no' || (ins?.ubicacion == null && ins?.anexo === false) ? 'no' : 'anexo');

// Preguntas válidas de un instrumento, con sus opciones resueltas.
export const preguntasDe = (ins) => (Array.isArray(ins?.preguntas) ? ins.preguntas : [])
    .filter((q) => q && texto(q.texto))
    .map((q) => ({ ...q, texto: texto(q.texto), opciones: opcionesDe(q) }));

// Definición que se publica en línea.
export const definicionEncuesta = (ins) => ({
    titulo: texto(ins.titulo) || 'Encuesta',
    intro: texto(ins.intro),
    preguntas: preguntasDe(ins).map((q) => ({ id: q.id, texto: q.texto, tipo: q.tipo, opciones: q.opciones, obligatoria: q.obligatoria !== false, objetivo: Number(q.objetivo) || 0, ...(texto(q.variable) ? { variable: texto(q.variable) } : {}), ...(texto(q.dimension) ? { dimension: texto(q.dimension) } : {}), ...(texto(q.indicador) ? { indicador: texto(q.indicador) } : {}) })),
});

// Bloques del instrumento para el anexo del documento.
export const bloquesInstrumento = (ins) => {
    const blocks = [];
    // Las opciones van con sangría bajo su pregunta; el espacio duro evita que se peguen entre sí.
    const linea = (text) => ({ type: 'plain', keywords: true, text });
    const SEP = '\u00a0\u00a0\u00a0\u00a0 ';
    if (texto(ins.intro)) blocks.push({ type: 'paragraph', text: texto(ins.intro) });
    preguntasDe(ins).forEach((q, i) => {
        blocks.push({ type: 'list', items: [q.texto], nums: [String(i + 1)] });
        if (q.tipo === 'abierta') blocks.push(linea('______________________________________________________'));
        else if (q.tipo === 'numero') blocks.push(linea('__________'));
        else if (q.tipo === 'multiple') blocks.push(linea(`${q.opciones.map((o) => `[\u00a0\u00a0] ${o}`).join(SEP)}${SEP}(puede marcar varias)`));
        else blocks.push(linea(q.opciones.map((o, k) => (q.tipo === 'likert' ? `(${k + 1}) ${o}` : `(\u00a0\u00a0) ${o}`)).join(SEP)));
    });
    return blocks;
};

// Respuestas de la encuesta en línea → tabla (encabezados + filas) para analizar o exportar.
export const tablaRespuestas = (definition, responses) => {
    const preguntas = definition?.preguntas || [];
    return {
        columnas: preguntas.map((q) => ({ nombre: q.texto, tipo: q.tipo, opciones: q.opciones || [] })),
        filas: (responses || []).map((r) => preguntas.map((q) => {
            const v = r.answers?.[q.id];
            return Array.isArray(v) ? v.join('; ') : v ?? '';
        })),
    };
};

export const aCsv = (encabezados, filas) => [encabezados, ...filas]
    .map((fila) => fila.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\r\n');
