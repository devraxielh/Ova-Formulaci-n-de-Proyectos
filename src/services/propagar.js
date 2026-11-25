// Propagar los cambios: cuando el estudiante cambia el título o la pregunta, las demás secciones siguen usando
// los términos anteriores (otra población, otro lugar, otra variable). Aquí se detecta qué cambió, qué secciones
// quedaron desactualizadas y cómo quedaría cada una con los términos nuevos, para mostrarlo antes de aplicarlo.
import { CAMPOS_SECCION, SECTIONS, buildDocument, documentText } from './projectDoc.js';
import { compararTextos } from './diff.js';

const t = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();
const plano = (v) => t(v).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const primeraLinea = (v) => t(String(v ?? '').split('\n')[0].replace(/[#*]/g, ''));

// Qué se vigila (lo que define el proyecto) y qué secciones dependen de eso. El marco y las referencias no se tocan:
// citan fuentes reales con sus propios títulos. Tampoco los datos ya recogidos.
export const ORIGENES = [
    { id: 'titulo', nombre: 'el título', de: (d) => t(d?.titulo) },
    { id: 'pregunta', nombre: 'la pregunta de investigación', de: (d) => primeraLinea(d?.pregunta) },
];
export const DEPENDIENTES = ['titulo', 'pregunta', 'planteamiento', 'objetivos', 'justificacion', 'alcances', 'introduccion', 'metodologia', 'fases', 'resumen', 'conclusiones'];

const VACIAS = new Set(['para', 'entre', 'sobre', 'desde', 'hasta', 'como', 'cual', 'cuales', 'donde', 'cuando', 'segun', 'durante', 'mediante', 'ante', 'tras', 'este', 'esta', 'estos', 'estas', 'unos', 'unas', 'los', 'las', 'del', 'con', 'por', 'una', 'que', 'sus']);
const conPeso = (frase) => plano(frase).split(/[^a-z0-9ñ]+/).some((p) => p.length >= 4 && !VACIAS.has(p));

// Lo que cambió desde la última vez que el proyecto se dio por «al día» (data.propagado).
export const cambiosDetectados = (data) => {
    const base = data?.propagado;
    if (!base || typeof base !== 'object') return [];
    return ORIGENES.map((o) => ({ id: o.id, nombre: o.nombre, antes: t(base[o.id]), ahora: o.de(data) }))
        .filter((c) => c.antes && c.ahora && plano(c.antes) !== plano(c.ahora));
};
export const fotoActual = (data) => Object.fromEntries(ORIGENES.map((o) => [o.id, o.de(data)]));

// De «antes» a «ahora», los trozos que se reemplazaron por otros (no lo que solo se agregó o solo se quitó:
// eso no se puede llevar a otras secciones sin leerlas). Cada reemplazo debe tener al menos una palabra con peso.
export const reemplazosDe = (antes, ahora) => {
    const trozos = compararTextos(t(antes), t(ahora));
    // Palabras seguidas que cambiaron («adultos mayores» → «pacientes hipertensos») se juntan en una sola frase:
    // entre ellas la comparación deja un espacio «igual», que aquí se absorbe en los dos lados.
    const grupos = [];
    let actual = null;
    trozos.forEach((x, i) => {
        const soloEspacio = x.tipo === '=' && !x.texto.trim();
        const sigueCambio = trozos[i + 1] && trozos[i + 1].tipo !== '=';
        if (x.tipo === '=' && !(soloEspacio && actual && sigueCambio)) { if (actual) grupos.push(actual); actual = null; return; }
        if (!actual) actual = { de: '', a: '' };
        if (x.tipo !== '+') actual.de += x.texto;
        if (x.tipo !== '-') actual.a += x.texto;
    });
    if (actual) grupos.push(actual);
    const limpiar = (x) => t(x).replace(/^[\s,;:.¿?¡!«»"()]+|[\s,;:.¿?¡!«»"()]+$/g, '');
    const pares = grupos.map((g) => ({ antes: limpiar(g.de), despues: limpiar(g.a) }))
        .filter((p) => p.antes.length >= 3 && p.despues.length >= 2 && plano(p.antes) !== plano(p.despues) && conPeso(p.antes));
    return pares.filter((p, i) => pares.findIndex((x) => plano(x.antes) === plano(p.antes)) === i).slice(0, 8);
};

const escapar = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const comoElOriginal = (hallado, nuevo) => (hallado[0] === hallado[0].toUpperCase() && hallado[0] !== hallado[0].toLowerCase() ? nuevo[0].toUpperCase() + nuevo.slice(1) : nuevo);

// Aplica los reemplazos a un texto: palabra completa, sin importar mayúsculas (y respetando la mayúscula inicial).
// Los más largos van primero para que «citas médicas» no quede a medias por reemplazar antes «citas».
export const reemplazarEnTexto = (texto, reemplazos) => {
    const lista = [...(reemplazos || [])]
        .filter((r) => t(r?.antes) && t(r?.despues) && plano(r.antes) !== plano(r.despues))
        .sort((x, y) => y.antes.length - x.antes.length);
    if (!lista.length) return String(texto ?? '');
    // Una sola pasada: lo que sale de un reemplazo no vuelve a entrar en otro (así «A → B» y «B → A» se intercambian).
    // Si lo nuevo contiene lo viejo («citas» → «citas médicas»), donde ya está lo nuevo no se toca.
    const yaNuevos = lista.filter((r) => plano(r.despues).includes(plano(r.antes))).map((r) => t(r.despues)).sort((x, y) => y.length - x.length);
    const alternativas = [...yaNuevos, ...lista.map((r) => t(r.antes))].map(escapar).join('|');
    const porAntes = new Map(lista.map((r) => [plano(r.antes), t(r.despues)]));
    const intactos = new Set(yaNuevos.map(plano));
    return String(texto ?? '').replace(new RegExp(`(?<![\\p{L}\\p{N}])(?:${alternativas})(?![\\p{L}\\p{N}])`, 'giu'), (m) => {
        if (intactos.has(plano(m))) return m;
        const nuevo = porAntes.get(plano(m));
        return nuevo ? comoElOriginal(m, nuevo) : m;
    });
};

// Lo mismo en cualquier valor guardado (texto, lista u objeto): así cambian a la vez el texto ya redactado
// y el formulario del módulo, y lo uno no deshace lo otro al volver a abrirlo.
const SIN_TOCAR = new Set(['id', 'filaId', 'fileId', 'tipo', 'escala', 'tecnica', 'software', 'enlace', 'fuente', 'ubicacion', 'estilo']);
export const reemplazarEnValor = (valor, reemplazos) => {
    if (typeof valor === 'string') return reemplazarEnTexto(valor, reemplazos);
    if (Array.isArray(valor)) return valor.map((x) => reemplazarEnValor(x, reemplazos));
    if (valor && typeof valor === 'object') return Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, SIN_TOCAR.has(k) ? v : reemplazarEnValor(v, reemplazos)]));
    return valor;
};

const textoSeccion = (documento, id) => {
    const s = documento.find((x) => x.id === id);
    return s && s.content.length ? documentText('', [{ ...s, inDocument: true }]).split('\n').slice(3).join('\n').trim() : '';
};

// Secciones que cambiarían al aplicar los reemplazos, con su texto de antes y de después.
// `omitir`: secciones que no se proponen (la que el propio estudiante acaba de cambiar).
export const seccionesAfectadas = (data, reemplazos, omitir = []) => {
    const validos = (reemplazos || []).filter((r) => t(r?.antes) && t(r?.despues));
    if (!validos.length) return [];
    const ids = DEPENDIENTES.filter((id) => !omitir.includes(id) && CAMPOS_SECCION[id]);
    const nuevos = { ...data };
    ids.forEach((id) => CAMPOS_SECCION[id].forEach((k) => { if (data[k] !== undefined) nuevos[k] = reemplazarEnValor(data[k], validos); }));
    const antes = buildDocument(data);
    const despues = buildDocument(nuevos);
    return ids.map((id) => {
        const campos = CAMPOS_SECCION[id].filter((k) => data[k] !== undefined && JSON.stringify(data[k]) !== JSON.stringify(nuevos[k]));
        if (!campos.length) return null;
        const a = textoSeccion(antes, id);
        const b = textoSeccion(despues, id);
        // Cuántas veces aparece en el texto alguno de los términos anteriores (lo que el estudiante verá cambiar).
        const veces = validos.reduce((n, r) => n + (a.match(new RegExp(`(?<![\\p{L}\\p{N}])${escapar(t(r.antes))}(?![\\p{L}\\p{N}])`, 'giu')) || []).length, 0);
        return { id, label: SECTIONS.find((s) => s.id === id)?.label || id, campos, valores: Object.fromEntries(campos.map((k) => [k, nuevos[k]])), trozos: compararTextos(a, b), cambiaTexto: a !== b, veces };
    }).filter(Boolean);
};

/* ---------- Cambios de fondo: reescritura propuesta por la IA ---------- */

// Secciones que puede reescribir la IA cuando cambia el sentido del título o la pregunta (no solo un término).
export const REESCRIBIBLES = DEPENDIENTES.filter((id) => !ORIGENES.some((o) => o.id === id));

// Frases con las que está armada una sección: los textos de su formulario (o, si no tiene, los párrafos de su texto).
// Cada una lleva una clave corta para que la IA diga cuál cambia sin tener que repetirla.
export const hojasDeSeccion = (data, id, maximo = 24) => {
    const hojas = [];
    const vistas = new Set();
    const tomar = (texto) => {
        const limpio = t(texto);
        if (limpio.length < 25 || limpio.length > 700 || vistas.has(plano(limpio))) return;
        vistas.add(plano(limpio));
        hojas.push(limpio);
    };
    const andar = (v, clave = '') => {
        if (SIN_TOCAR.has(clave)) return;
        if (typeof v === 'string') { if (/\n/.test(v)) v.split(/\n+/).forEach((p) => tomar(p.replace(/^[-#*\d.\s]+/, ''))); else tomar(v); }
        else if (Array.isArray(v)) v.forEach((x) => andar(x, clave));
        else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => andar(x, k));
    };
    const campos = CAMPOS_SECCION[id] || [];
    // Primero los formularios (son las piezas con las que el módulo arma el texto); si no dieron nada, el texto mismo.
    campos.filter((k) => data?.[k] && typeof data[k] === 'object').forEach((k) => andar(data[k], k));
    if (!hojas.length) campos.filter((k) => typeof data?.[k] === 'string').forEach((k) => andar(data[k], k));
    return hojas.slice(0, maximo).map((texto, i) => ({ id: `h${i + 1}`, texto }));
};

// Lo que responde la IA → reemplazos seguros: solo frases que se le dieron, con un texto nuevo de tamaño parecido.
export const paresDeReescritura = (hojas, cambios) => {
    const porId = Object.fromEntries((hojas || []).map((h) => [h.id, h.texto]));
    const pares = [];
    (Array.isArray(cambios) ? cambios : []).forEach((c) => {
        const antes = porId[t(c?.id).toLowerCase()];
        const despues = t(c?.texto);
        if (!antes || !despues || plano(antes) === plano(despues)) return;
        if (despues.length < antes.length * 0.4 || despues.length > antes.length * 2.5 + 80) return;
        if (pares.some((p) => p.antes === antes)) return;
        pares.push({ antes: antes.replace(/[\s.]+$/, ''), despues: despues.replace(/[\s.]+$/, '') });
    });
    return pares;
};
