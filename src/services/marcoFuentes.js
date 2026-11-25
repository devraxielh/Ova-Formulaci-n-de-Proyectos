// Marco apoyado en las fuentes: qué fuentes tiene el estudiante en sus fichas, qué afirmaciones del texto no citan
// ninguna, y si las citas de un texto redactado corresponden a esas fuentes (para no dejar pasar citas inventadas).
import { citasEnTexto } from './apa.js';

const t = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();
const plano = (v) => t(v).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const lista = (v) => (Array.isArray(v) ? v : []);
// Primer apellido de «Pérez y Gómez», «Pérez et al.», «Pérez, J.».
const apellido = (autor) => plano(autor).replace(/\bet al\.?$/, '').split(/\s+y\s+|,|;|&/)[0].trim().split(/\s+/).pop() || '';

// Fuentes disponibles en un apartado, a partir de sus fichas completas. Cada una lleva su clave (F1, F2…).
export const fuentesDeFichas = (f, apartado) => {
    const de = {
        antecedentes: () => lista(f?.antecedentes).filter((a) => t(a.autor) && t(a.hallazgo)).map((a) => ({
            autor: t(a.autor), anio: t(a.anio) || 's. f.', titulo: t(a.titulo),
            contenido: [t(a.lugar) && `Lugar: ${t(a.lugar)}`, t(a.objetivo) && `Objetivo: ${t(a.objetivo)}`, `Hallazgo: ${t(a.hallazgo)}`, t(a.relacion) && `Relación con el proyecto: ${t(a.relacion)}`].filter(Boolean).join('. '),
        })),
        teorico: () => lista(f?.teorias).filter((x) => t(x.nombre) && t(x.postulado) && t(x.autor)).map((x) => ({
            autor: t(x.autor), anio: t(x.anio) || 's. f.', titulo: t(x.nombre),
            contenido: [`Teoría o modelo: ${t(x.nombre)}`, `Postulado: ${t(x.postulado)}`, t(x.relacion) && `Relación con el proyecto: ${t(x.relacion)}`].filter(Boolean).join('. '),
        })),
        conceptual: () => lista(f?.conceptos).filter((c) => t(c.termino) && t(c.definicion) && t(c.autor)).map((c) => ({
            autor: t(c.autor), anio: t(c.anio) || 's. f.', titulo: t(c.termino), contenido: `Concepto: ${t(c.termino)}. Definición: ${t(c.definicion)}`,
        })),
    }[apartado];
    return (de ? de() : []).map((x, i) => ({ ...x, clave: `F${i + 1}` }));
};

// Apellidos de un autor («Guevara Cando y Chafla Romero» → guevara, cando, chafla, romero), sin partículas.
const apellidos = (autor) => plano(autor).replace(/\bet al\.?/g, '').split(/[^a-zñ]+/).filter((p) => p.length > 1 && !['los', 'las', 'del', 'de', 'la', 'el', 'da', 'do', 'di', 'du', 'le', 'al', 'van', 'von', 'et'].includes(p));
// La cita corresponde a la fuente si comparten algún apellido y el año: el detector de citas a veces solo ve
// el último apellido de un autor con dos («Chafla Romero (2025)» → «Romero (2025)»).
const mismaFuente = (cita, fuente) => apellidos(cita.autor).some((a) => apellidos(fuente.autor).includes(a))
    && (plano(cita.anio).replace(/[a-z]$/, '') === plano(fuente.anio).replace(/[a-z]$/, '') || /s\. ?f/.test(plano(cita.anio)) || /s\. ?f/.test(plano(fuente.anio)));

// Frases de análisis propio: hablan del proyecto, no de lo que dice un autor, así que no necesitan cita.
const PROPIA = /\b(la presente investigaci[oó]n|este (estudio|proyecto|trabajo|antecedente)|esta (investigaci[oó]n|teor[ií]a|propuesta)|el presente (estudio|proyecto|trabajo)|para este proyecto|en este trabajo)\b/i;

// Separa en oraciones sin partir «et al.», «s. f.», iniciales ni números decimales.
export const oraciones = (texto) => {
    const limpio = String(texto || '').replace(/^#+\s.*$/gm, '').replace(/\*\*/g, '').replace(/^-\s+/gm, '');
    const protegido = limpio.replace(/\bet al\./g, 'et al§').replace(/\bs\. ?f\./g, 's§ f§').replace(/\b([A-ZÁÉÍÓÚÑ])\./g, '$1§').replace(/(\d)\.(\d)/g, '$1§$2').replace(/\b(p|pp|cap|art|vol|núm|ed|etc)\./gi, '$1§');
    return protegido.split(/(?<=[.!?])\s+|\n+/).map((o) => o.replace(/§/g, '.').trim()).filter((o) => o.split(/\s+/).length >= 5);
};

// Revisión de un texto contra sus fuentes:
//  - sinFuente: oraciones que afirman algo y no citan a nadie (ni son análisis propio).
//  - ajenas: citas que no corresponden a ninguna fuente de las fichas (posible cita inventada o mal escrita).
export const revisarFuentes = (texto, fuentes) => {
    const sinFuente = [];
    const ajenas = [];
    let total = 0;
    // Se revisa párrafo por párrafo: dentro de un párrafo, lo que sigue a una oración citada se entiende como
    // parte de la misma fuente (así se escribe en APA); lo que va antes de cualquier cita, o en un párrafo sin
    // ninguna, queda sin apoyo.
    String(texto || '').split(/\n+/).forEach((parrafo) => {
        let apoyado = false;
        oraciones(parrafo).forEach((o) => {
            total += 1;
            const citas = citasEnTexto(o);
            // También cuenta como apoyo nombrar al autor de una fuente («Según Bandura…»), aunque falte el año.
            const nombraAutor = lista(fuentes).some((f) => apellidos(f.autor).some((a) => a.length > 3 && new RegExp(`(?<![\\p{L}])${a}(?![\\p{L}])`, 'u').test(plano(o))));
            if (citas.length || nombraAutor) apoyado = true;
            if (!apoyado && !PROPIA.test(o)) sinFuente.push(o);
            citas.forEach((c) => { if (lista(fuentes).length && !lista(fuentes).some((f) => mismaFuente(c, f)) && !ajenas.some((x) => x.texto === c.texto)) ajenas.push(c); });
        });
    });
    return { sinFuente, ajenas, total };
};

// Lo que devuelve la IA → párrafos seguros: cada uno con las fuentes que declara usar, que deben existir,
// y con la cita de cada una escrita en el texto. Un párrafo que cita algo ajeno a las fichas se descarta.
export const parrafosVerificados = (crudos, fuentes) => {
    const porClave = Object.fromEntries(lista(fuentes).map((f) => [f.clave, f]));
    const aceptados = [];
    const descartados = [];
    lista(crudos).forEach((p) => {
        const texto = t(p?.texto);
        if (texto.split(/\s+/).length < 8) return;
        const declaradas = lista(p?.fuentes).map((k) => porClave[t(k).toUpperCase()]).filter(Boolean);
        const revision = revisarFuentes(texto, fuentes);
        const propio = Boolean(p?.propio) && !citasEnTexto(texto).length;
        if (revision.ajenas.length) { descartados.push({ texto, motivo: `cita una fuente que no está en tus fichas: ${revision.ajenas.map((c) => c.texto).join(', ')}` }); return; }
        if (!propio && revision.sinFuente.length === oraciones(texto).length) { descartados.push({ texto, motivo: 'no cita ninguna de tus fuentes' }); return; }
        aceptados.push({ texto, propio, fuentes: declaradas.map((f) => f.clave) });
    });
    return { aceptados, descartados };
};
