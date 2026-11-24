// Análisis cualitativo: transcripciones (fuentes), categorías y fragmentos codificados (citas). data.cualitativo

export const COLORES = ['#fde68a', '#bfdbfe', '#bbf7d0', '#fbcfe8', '#ddd6fe', '#fed7aa', '#a5f3fc', '#e5e7eb'];
export const MAX_FUENTES = 6;
export const MAX_TEXTO = 40000;

const t = (v) => String(v ?? '').trim();
const list = (v) => (Array.isArray(v) ? v : []);

export const normalizar = (c) => ({ fuentes: list(c?.fuentes), categorias: list(c?.categorias), citas: list(c?.citas) });

// Parte la transcripción en tramos, marcando los fragmentos ya codificados (sin solaparse).
export const tramos = (texto, citas, categorias) => {
    const marcas = [];
    citas.forEach((cita) => {
        const pos = texto.indexOf(cita.texto);
        if (pos >= 0) marcas.push({ inicio: pos, fin: pos + cita.texto.length, cita });
    });
    marcas.sort((a, b) => a.inicio - b.inicio);
    const out = [];
    let cursor = 0;
    marcas.forEach((m) => {
        if (m.inicio < cursor) return; // solapado con el anterior: se muestra solo el primero
        if (m.inicio > cursor) out.push({ texto: texto.slice(cursor, m.inicio) });
        out.push({ texto: texto.slice(m.inicio, m.fin), cita: m.cita, categoria: categorias.find((c) => c.id === m.cita.categoriaId) });
        cursor = m.fin;
    });
    if (cursor < texto.length) out.push({ texto: texto.slice(cursor) });
    return out;
};

// Resumen por categoría: cuántos fragmentos, en cuántas fuentes y el fragmento más representativo (el más corto con sentido).
export const resumenCategorias = (c) => {
    const { fuentes, categorias, citas } = normalizar(c);
    return categorias.map((cat) => {
        const propias = citas.filter((x) => x.categoriaId === cat.id);
        const enFuentes = new Set(propias.map((x) => x.fuenteId)).size;
        const ejemplo = cat.ejemploId ? propias.find((x) => x.id === cat.ejemploId) : [...propias].sort((a, b) => Math.abs(a.texto.length - 160) - Math.abs(b.texto.length - 160))[0];
        return { ...cat, n: propias.length, enFuentes, citas: propias, ejemplo: ejemplo ? { ...ejemplo, fuente: fuentes.find((f) => f.id === ejemplo.fuenteId)?.nombre || '' } : null };
    }).sort((a, b) => b.n - a.n);
};

// Tabla de categorías para Resultados.
export const tablaCategorias = (c) => {
    const filas = resumenCategorias(c).filter((x) => x.n > 0);
    return {
        head: ['Categoría', 'Definición', 'Fragmentos', 'Cita representativa'],
        rows: filas.map((x) => [x.nombre, t(x.definicion), `${x.n} (en ${x.enFuentes} ${x.enFuentes === 1 ? 'fuente' : 'fuentes'})`, x.ejemplo ? `«${x.ejemplo.texto.length > 260 ? `${x.ejemplo.texto.slice(0, 257)}…` : x.ejemplo.texto}» (${x.ejemplo.fuente})` : '']),
    };
};
