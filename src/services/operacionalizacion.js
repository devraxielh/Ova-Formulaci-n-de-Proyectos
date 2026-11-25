// Operacionalización de variables: de cada objetivo específico a sus variables (o categorías), dimensiones,
// indicadores e ítems. Es el paso que une los objetivos con el instrumento: cada ítem mide un indicador.
// Se guarda en data.operacionalizacion como filas planas, una por indicador.

export const ESCALAS = [
    { id: 'likert', label: 'Escala (Likert)' },
    { id: 'opcion', label: 'Opción única' },
    { id: 'multiple', label: 'Varias opciones' },
    { id: 'sino', label: 'Sí / No' },
    { id: 'numero', label: 'Número' },
    { id: 'abierta', label: 'Respuesta abierta' },
];
export const TIPOS_VARIABLE = ['Independiente', 'Dependiente', 'Interviniente', 'De caracterización', 'Categoría de análisis'];

const t = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();
const uid = () => Math.random().toString(36).slice(2, 9);
const lista = (v) => (Array.isArray(v) ? v : []);

// Filas con contenido (al menos la variable y el indicador).
export const filasValidas = (filas) => lista(filas).filter((f) => f && t(f.variable) && t(f.indicador));

// Normaliza lo que devuelve la IA (o lo que venga guardado) a filas seguras.
export const normalizarFilas = (crudas, cuantosObjetivos = 0) => lista(crudas).map((x) => {
    const escala = ESCALAS.find((e) => e.id === t(x?.escala).toLowerCase())?.id || 'likert';
    const tipoVar = TIPOS_VARIABLE.find((v) => v.toLowerCase() === t(x?.tipoVar || x?.tipo).toLowerCase()) || '';
    const objetivo = Math.round(Number(x?.objetivo) || 0);
    return {
        id: t(x?.id) || uid(),
        variable: t(x?.variable).slice(0, 120),
        tipoVar,
        definicion: t(x?.definicion).slice(0, 400),
        dimension: t(x?.dimension).slice(0, 120),
        indicador: t(x?.indicador).slice(0, 200),
        item: t(x?.item).slice(0, 300),
        escala,
        opciones: lista(x?.opciones).map(t).filter(Boolean).slice(0, 8),
        objetivo: objetivo >= 1 && objetivo <= cuantosObjetivos ? objetivo : 0,
    };
}).filter((f) => f.variable && f.indicador).slice(0, 40);

// Tabla para el documento (va en Anexos). Las celdas repetidas de variable y definición se dejan vacías para leerla mejor.
export const tablaOperacionalizacion = (d) => {
    const filas = filasValidas(d?.operacionalizacion);
    if (!filas.length) return null;
    const cualitativo = /cualitativ/i.test(String(d?.enfoque || ''));
    let anterior = '';
    const rows = filas.map((f) => {
        const repetida = t(f.variable).toLowerCase() === anterior;
        anterior = t(f.variable).toLowerCase();
        return [
            repetida ? '' : `${t(f.variable)}${f.tipoVar && !cualitativo ? ` (${f.tipoVar.toLowerCase()})` : ''}`,
            repetida ? '' : t(f.definicion),
            t(f.dimension),
            t(f.indicador),
            t(f.item),
            ESCALAS.find((e) => e.id === f.escala)?.label || '',
        ];
    });
    return { type: 'table', compact: true, head: [cualitativo ? 'Categoría' : 'Variable', 'Definición', cualitativo ? 'Subcategoría' : 'Dimensión', 'Indicador', cualitativo ? 'Pregunta orientadora' : 'Ítem', 'Escala'], rows };
};

// Preguntas del instrumento a partir de la matriz: cada ítem pasa a ser una pregunta que recuerda su indicador.
// Para una guía de entrevista todas son abiertas.
export const preguntasDesdeMatriz = (filas, tipoInstrumento = 'encuesta') => filasValidas(filas)
    .filter((f) => t(f.item))
    .map((f) => ({
        id: uid(),
        texto: t(f.item),
        tipo: tipoInstrumento === 'entrevista' ? 'abierta' : f.escala,
        opciones: tipoInstrumento === 'entrevista' ? [] : lista(f.opciones),
        objetivo: f.objetivo || 0,
        indicador: t(f.indicador),
        variable: t(f.variable),
        dimension: t(f.dimension),
    }));

// Qué indicadores de la matriz no tienen todavía una pregunta en el instrumento (para avisar al estudiante).
export const indicadoresSinPregunta = (filas, preguntas) => {
    const cubiertos = new Set(lista(preguntas).map((q) => t(q?.indicador).toLowerCase()).filter(Boolean));
    return filasValidas(filas).filter((f) => !cubiertos.has(t(f.indicador).toLowerCase()));
};

// Resumen en texto para dárselo a la IA cuando arma un instrumento o un análisis.
export const matrizEnTexto = (filas) => filasValidas(filas)
    .map((f, i) => `${i + 1}. [${f.objetivo ? `objetivo ${f.objetivo}` : 'caracterización'}] ${t(f.variable)} › ${t(f.dimension) || '—'} › ${t(f.indicador)}${t(f.item) ? ` — ítem: ${t(f.item)}` : ''}`)
    .join('\n');
