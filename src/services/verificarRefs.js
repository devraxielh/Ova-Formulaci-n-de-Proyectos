// Verificación de referencias: ¿existe la fuente?, ¿coinciden año, autores y título con CrossRef?, ¿es reciente y confiable?
import { desdeCrossref, leerAutores } from './apa.js';

const t = (v) => String(v ?? '').trim();
const plano = (v) => t(v).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/<[^>]+>/g, ' ').replace(/[^a-z0-9ñ ]/g, ' ').replace(/\s+/g, ' ').trim();
const VACIAS = new Set(['de', 'la', 'el', 'los', 'las', 'en', 'y', 'del', 'un', 'una', 'the', 'of', 'and', 'in', 'a', 'to', 'for', 'on', 'con', 'por', 'para']);
const palabras = (v) => new Set(plano(v).split(' ').filter((w) => w.length > 2 && !VACIAS.has(w)));

// Parecido entre dos títulos (0 a 1): palabras en común sobre el total.
export const parecido = (a, b) => {
    const x = palabras(a);
    const y = palabras(b);
    if (!x.size || !y.size) return 0;
    const comunes = [...x].filter((w) => y.has(w)).length;
    return comunes / Math.max(x.size, y.size);
};

const primerApellido = (autores) => plano(leerAutores(autores)[0]?.apellido || '').split(' ').filter((w) => !VACIAS.has(w));

// Sitios que no son fuentes académicas (tareas, enciclopedias abiertas, resúmenes, blogs).
const POCO_CONFIABLES = ['wikipedia.org', 'monografias.com', 'rincondelvago.com', 'buenastareas.com', 'brainly', 'scribd.com', 'slideshare.net', 'studocu.com', 'coursehero.com', 'blogspot.', 'wordpress.com', 'prezi.com', 'yahoo.com', 'quora.com', 'taringa.net', 'ejemplode.com', 'definicion.de', 'concepto.de', 'significados.com', 'emagister.com', 'gestiopolis.com', 'chat.openai.com', 'chatgpt.com'];

// Avisos que no necesitan internet: antigüedad, sitio poco confiable, datos mínimos.
export const alertasRef = (ref, anioActual = new Date().getFullYear()) => {
    const avisos = [];
    const anio = parseInt(t(ref.anio), 10);
    if (ref.tipo !== 'ley' && Number.isFinite(anio) && anioActual - anio > 10) avisos.push({ tipo: 'antigua', texto: `Tiene ${anioActual - anio} años. Úsala solo si es una obra clásica de tu marco teórico; para antecedentes busca estudios de los últimos 5 a 10 años.` });
    if (Number.isFinite(anio) && anio > anioActual) avisos.push({ tipo: 'dato', texto: `El año ${anio} todavía no ha llegado: revísalo.` });
    const url = t(ref.url).toLowerCase();
    const sitio = POCO_CONFIABLES.find((s) => url.includes(s));
    if (sitio) avisos.push({ tipo: 'sitio', texto: `«${sitio.replace(/\.$/, '')}» no es una fuente académica. Busca el artículo, libro o documento oficial original y cita ese.` });
    return avisos;
};

// Compara lo que escribió el estudiante con el registro de CrossRef.
export const compararConCrossref = (ref, m) => {
    const real = desdeCrossref(m);
    const difs = [];
    if (t(ref.anio) && real.anio && t(ref.anio) !== real.anio) difs.push({ campo: 'anio', etiqueta: 'Año', tuyo: t(ref.anio), real: real.anio });
    const mio = primerApellido(ref.autores);
    const suyo = primerApellido(real.autores);
    if (mio.length && suyo.length && !mio.some((w) => suyo.includes(w))) difs.push({ campo: 'autores', etiqueta: 'Primer autor', tuyo: leerAutores(ref.autores)[0]?.apellido || '', real: leerAutores(real.autores)[0]?.apellido || '' });
    const sim = parecido(ref.titulo, real.titulo);
    if (t(ref.titulo) && real.titulo && sim < 0.6) difs.push({ campo: 'titulo', etiqueta: 'Título', tuyo: t(ref.titulo), real: real.titulo });
    return { real, difs, parecido: sim };
};

const TIPOS_CON_REGISTRO = new Set(['articulo', 'libro', 'capitulo', 'conferencia', 'tesis', 'informe']);

/**
 * Verifica una referencia. Devuelve { estado, mensaje, difs?, real?, doi?, avisos }.
 * estado: ok | difiere | no-doi (el DOI no existe) | sugerida (se halló un DOI probable) | sin-verificar | error
 * `consultar(url)` permite probar sin red; por defecto usa fetch.
 */
export const verificarRef = async (ref, consultar = (url) => fetch(url)) => {
    const avisos = alertasRef(ref);
    const doi = t(ref.doi).replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').replace(/^doi:\s*/i, '');
    try {
        if (doi) {
            const res = await consultar(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
            if (res.status === 404) {
                // No todos los DOI son de CrossRef (arXiv, tesis y datos usan DataCite): se pregunta al registro general de DOI.
                try {
                    const general = await consultar(`https://doi.org/api/handles/${encodeURI(doi)}`);
                    if (general.ok && (await general.json()).responseCode === 1) {
                        return { estado: 'ok', mensaje: 'El DOI existe (está registrado fuera de CrossRef, como pasa con arXiv y los repositorios). No se pudieron comparar año, autor y título: revísalos tú.', avisos };
                    }
                } catch { /* se informa como inexistente */ }
                return { estado: 'no-doi', mensaje: 'Ese DOI no existe. Revisa que esté completo y bien copiado; si la fuente no existe, no la cites.', avisos };
            }
            if (!res.ok) return { estado: 'error', mensaje: 'CrossRef no respondió. Inténtalo más tarde.', avisos };
            const { real, difs } = compararConCrossref(ref, (await res.json()).message);
            return difs.length
                ? { estado: 'difiere', mensaje: 'La fuente existe, pero algunos datos no coinciden con el registro oficial.', difs, real, avisos }
                : { estado: 'ok', mensaje: 'La fuente existe y sus datos coinciden con CrossRef.', real, avisos };
        }
        if (!TIPOS_CON_REGISTRO.has(ref.tipo) || !t(ref.titulo)) return { estado: 'sin-verificar', mensaje: 'Este tipo de fuente no tiene DOI: verifica tú mismo que el enlace abre y que el documento es oficial.', avisos };
        const q = encodeURIComponent(`${t(ref.titulo)} ${leerAutores(ref.autores)[0]?.apellido || ''}`.trim());
        const res = await consultar(`https://api.crossref.org/works?query.bibliographic=${q}&rows=3&select=DOI,title,author,issued,container-title,volume,issue,page,publisher,type`);
        if (!res.ok) return { estado: 'error', mensaje: 'CrossRef no respondió. Inténtalo más tarde.', avisos };
        const items = (await res.json()).message?.items || [];
        const mejor = items.map((m) => ({ m, ...compararConCrossref(ref, m) })).sort((a, b) => b.parecido - a.parecido)[0];
        if (mejor && mejor.parecido >= 0.8 && !mejor.difs.some((d) => d.campo === 'autores')) {
            return { estado: 'sugerida', mensaje: 'Encontramos esta fuente en CrossRef. Puedes completar sus datos y su DOI.', difs: mejor.difs, real: mejor.real, doi: mejor.m.DOI, avisos };
        }
        return { estado: 'sin-verificar', mensaje: 'No la encontramos en CrossRef. Puede existir (muchas revistas y libros en español no están allí): confirma que tienes el documento en la mano y agrega su DOI o su enlace.', avisos };
    } catch {
        return { estado: 'error', mensaje: 'No hay conexión con CrossRef.', avisos };
    }
};
