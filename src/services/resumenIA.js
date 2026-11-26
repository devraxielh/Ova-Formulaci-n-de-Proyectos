// Resumen redactado desde el proyecto: qué texto de cada sección se le da a la IA y cómo se comprueba lo que devuelve.
// La IA solo resume: no puede traer cifras que no estén en la sección de origen ni citas de autores.
import { buildDocument } from './projectDoc.js';
import { partesObjetivos } from './coherencia.js';

const t = (v) => String(v ?? '').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();

// Parte del resumen → sección del proyecto de la que sale.
export const ORIGEN = {
    objetivo: { seccion: 'objetivos', nombre: 'Objetivos' },
    metodologia: { seccion: 'metodologia', nombre: 'Metodología' },
    resultados: { seccion: 'resultados', nombre: 'Resultados y discusión' },
    conclusiones: { seccion: 'conclusiones', nombre: 'Conclusiones' },
};
export const PARTES_IA = Object.keys(ORIGEN);

// Texto corrido de una sección del documento (párrafos y listas; sin tablas, figuras, cronograma ni presupuesto).
const textoDeSeccion = (secciones, id, maximo = 3500) => {
    const seccion = secciones.find((s) => s.id === id);
    const lineas = [];
    let fuera = false;
    (seccion?.content || []).forEach((b) => {
        if (b.type === 'heading' || b.type === 'sub') { fuera = /^(cronograma|presupuesto)/i.test(t(b.titulo || b.text)); return; }
        if (fuera) return;
        if (b.type === 'paragraph' || b.type === 'plain') lineas.push(t(b.text));
        else if (b.type === 'list') (b.items || []).forEach((item) => lineas.push(`- ${t(item)}`));
    });
    return lineas.filter(Boolean).join('\n').slice(0, maximo);
};

// Lo que ya está escrito de cada sección: { objetivo, metodologia, resultados, conclusiones } (cadena vacía si falta).
export const fuentesResumen = (data) => {
    const secciones = buildDocument(data || {});
    // El resumen lleva solo el objetivo general: los específicos no entran.
    const general = t(data?.objetivoGeneral) || t(partesObjetivos(data?.objetivos).general);
    return Object.fromEntries(PARTES_IA.map((parte) => {
        const texto = parte === 'objetivo' ? general : textoDeSeccion(secciones, ORIGEN[parte].seccion);
        // Una sección con menos de ocho palabras todavía no da para resumir.
        return [parte, texto.split(/\s+/).filter(Boolean).length >= 8 ? texto : ''];
    }));
};

const numeros = (texto) => (String(texto).match(/\d+(?:[.,]\d+)*/g) || []).map((n) => n.replace(/[.,]+$/, ''));
const CITA = /\s*\((?:[^()]*?,\s*)?(?:19|20)\d{2}[a-z]?(?:,[^()]*)?\)/g;

// Deja lista una parte devuelta por la IA: sin citas, sin viñetas ni saltos, en una o dos oraciones cortas.
export const limpiarParte = (texto) => {
    const limpio = t(String(texto ?? '').replace(/^[-•\d.)\s]+/, '')).replace(CITA, '').replace(/\s+([.,;:])/g, '$1');
    if (!limpio) return '';
    return /[.?!]$/.test(limpio) ? limpio : `${limpio}.`;
};

// ¿Se puede usar la parte? Debe tener texto, no pasarse de largo y no traer cifras que no estén en su sección de origen.
export const revisarParte = (texto, fuente) => {
    const parte = limpiarParte(texto);
    const palabras = parte.split(/\s+/).filter(Boolean).length;
    if (palabras < 6) return { ok: false, motivo: 'vacia', texto: '' };
    if (palabras > 80) return { ok: false, motivo: 'larga', texto: '' };
    const permitidos = new Set(numeros(fuente));
    const ajenas = numeros(parte).filter((n) => !permitidos.has(n));
    if (ajenas.length) return { ok: false, motivo: 'cifras', ajenas, texto: '' };
    return { ok: true, texto: parte };
};

// Lee la respuesta de la IA: una línea por parte, «[1] …», «[2] …», en el orden en que se pidieron.
// No se usa JSON: al copiar comillas del texto del estudiante, la IA devolvía JSON inválido y la solicitud fallaba.
export const leerPartes = (contenido, pedir) => {
    const texto = String(contenido ?? '');
    const marcas = [...texto.matchAll(/\[(\d+)\]/g)].filter((m) => Number(m[1]) >= 1 && Number(m[1]) <= pedir.length);
    const partes = {};
    marcas.forEach((m, k) => {
        const clave = pedir[Number(m[1]) - 1];
        const fin = k + 1 < marcas.length ? marcas[k + 1].index : texto.length;
        const cuerpo = texto.slice(m.index + m[0].length, fin).trim();
        if (clave && cuerpo && !partes[clave]) partes[clave] = cuerpo;
    });
    return partes;
};

// Borrador de respaldo (cuando la IA falla o trae algo que no se puede usar): se arma con frases del propio estudiante,
// así que hay que quitarle los arranques dobles («mostraron que se identificó que…») y dejarlo corto.
export const pulirBorrador = (texto, maximo = 55) => {
    let limpio = t(texto).replace(CITA, '')
        .replace(/\b(que|:)\s+se\s+(identificó|constató|encontró|determinó|estableció|evidenció|observó|halló|comprobó|caracterizó)\s+que\b/gi, '$1')
        .replace(/\s+([.,;:])/g, '$1');
    const palabras = limpio.split(/\s+/).filter(Boolean);
    if (palabras.length > maximo) {
        // Se corta en el último punto, punto y coma o «además» que quepa; si no hay, en la última coma.
        const cabe = palabras.slice(0, maximo).join(' ');
        const corte = Math.max(cabe.lastIndexOf('. '), cabe.lastIndexOf('; '), cabe.lastIndexOf('; además'));
        limpio = corte > 40 ? cabe.slice(0, corte) : cabe.slice(0, Math.max(cabe.lastIndexOf(','), 0) || cabe.length);
    }
    limpio = limpio.replace(/[\s,;:]+$/, '');
    if (!limpio) return '';
    return /[.?!]$/.test(limpio) ? limpio : `${limpio}.`;
};

// Instrucción y datos para la IA: solo las partes que tienen sección de origen.
export const mensajesResumen = (fuentes, titulo = '') => {
    const pedir = PARTES_IA.filter((p) => fuentes[p]);
    const reglas = {
        objetivo: 'el objetivo general del estudio, completo y sin cambiarle el sentido, en pasado («Esta investigación tuvo como objetivo…»). Una oración.',
        metodologia: 'enfoque, tipo y diseño, población o muestra e instrumento, en pasado («Se desarrolló un estudio…»). Una o dos oraciones.',
        resultados: 'los hallazgos principales con sus cifras tal como aparecen, en pasado («Los resultados mostraron que…»). Una o dos oraciones.',
        conclusiones: 'la respuesta a la pregunta y su implicación, en presente («Se concluye que…»). Una o dos oraciones.',
    };
    return {
        pedir,
        messages: [
            { role: 'system', content: 'Eres editor académico. Redactas el resumen (abstract) de un proyecto de investigación a partir de lo que el estudiante ya escribió en cada sección. Resumes; no agregas nada. Reglas: español claro y formal, oraciones cortas, impersonal con «se»; sin citas de autores, sin viñetas, sin títulos, sin abreviaturas sin explicar; usa SOLO cifras que aparezcan en el texto de esa sección, copiadas igual; no inventes datos, lugares ni resultados; si la sección no dice algo, no lo digas. Cada parte tiene como máximo 45 palabras y entre todas no pasan de 200. Respondes solo con las líneas numeradas que se te piden, sin nada antes ni después.' },
            { role: 'user', content: `${t(titulo) ? `TÍTULO DEL PROYECTO: ${t(titulo)}\n\n` : ''}${pedir.map((p) => `=== ${ORIGEN[p].nombre.toUpperCase()} (texto del estudiante) ===\n${fuentes[p]}`).join('\n\n')}\n\nRedacta estas partes del resumen:\n${pedir.map((p, i) => `[${i + 1}] ${ORIGEN[p].nombre}: ${reglas[p]}`).join('\n')}\n\nResponde exactamente con ${pedir.length === 1 ? 'esta línea' : `estas ${pedir.length} líneas`}, cada una en un solo párrafo y empezando por su número entre corchetes:\n${pedir.map((_, i) => `[${i + 1}] …`).join('\n')}` },
        ],
    };
};
