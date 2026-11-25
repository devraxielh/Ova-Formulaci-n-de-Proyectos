// Vocabulario y estilo del proyecto (data.estilo): cómo debe escribir la IA en este proyecto y qué términos usar.
// Se aplica en un solo punto (el envoltorio de la IA en api.js): va como instrucción en cada solicitud y, además,
// los términos que el estudiante pidió cambiar se corrigen en la respuesta, por si la IA no obedece.
// No importa nada de la app: api.js lo usa y no debe haber dependencias circulares.

const t = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();
const plano = (v) => t(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const lista = (v) => (Array.isArray(v) ? v : []);

export const PERSONAS = [
    { id: '', label: 'Sin preferencia' },
    { id: 'impersonal', label: 'Impersonal («se aplicó», «se encontró»)', regla: 'Escribe en forma impersonal con «se» («se aplicó», «se encontró»); no uses «yo», «nosotros» ni «el investigador».' },
    { id: 'plural', label: 'Primera persona del plural («aplicamos»)', regla: 'Escribe en primera persona del plural («aplicamos», «encontramos»).' },
    { id: 'tercera', label: 'Tercera persona («los investigadores aplicaron»)', regla: 'Escribe en tercera persona («los investigadores aplicaron»); no uses «yo» ni «nosotros».' },
];
export const TIEMPOS = [
    { id: '', label: 'Sin preferencia' },
    { id: 'futuro', label: 'Futuro: proyecto por hacer («se aplicará»)', regla: 'El proyecto aún no se ha ejecutado: lo que se va a hacer va en futuro («se aplicará», «se analizarán»).' },
    { id: 'pasado', label: 'Pasado: informe final («se aplicó»)', regla: 'El proyecto ya se ejecutó: lo que se hizo y lo que se encontró va en pasado («se aplicó», «se encontró»).' },
];

export const ESTILO_VACIO = { persona: '', tiempo: '', terminos: [], evitar: [], notas: '' };

// Texto seguro para usar dentro de una respuesta JSON: sin comillas, barras ni llaves.
const seguro = (v) => t(v).replace(/["\\{}[\]]/g, '').slice(0, 80);

export const normalizarEstilo = (crudo) => ({
    persona: PERSONAS.some((p) => p.id === crudo?.persona) ? crudo.persona : '',
    tiempo: TIEMPOS.some((p) => p.id === crudo?.tiempo) ? crudo.tiempo : '',
    // { usar: 'inasistencia', enLugarDe: 'no-show' }
    terminos: lista(crudo?.terminos).map((x) => ({ usar: seguro(x?.usar), enLugarDe: seguro(x?.enLugarDe) })).filter((x) => x.usar && x.enLugarDe && plano(x.usar) !== plano(x.enLugarDe)).slice(0, 30),
    evitar: lista(crudo?.evitar).map(seguro).filter(Boolean).slice(0, 30),
    notas: t(crudo?.notas).slice(0, 400),
});

export const estiloVacio = (crudo) => { const e = normalizarEstilo(crudo); return !e.persona && !e.tiempo && !e.terminos.length && !e.evitar.length && !e.notas; };

// Instrucción que se añade a cada solicitud a la IA.
export const textoEstilo = (crudo) => {
    const e = normalizarEstilo(crudo);
    const reglas = [
        PERSONAS.find((p) => p.id === e.persona)?.regla,
        TIEMPOS.find((p) => p.id === e.tiempo)?.regla,
        e.terminos.length ? `Términos del proyecto: ${e.terminos.map((x) => `di «${x.usar}», nunca «${x.enLugarDe}»`).join('; ')}.` : '',
        e.evitar.length ? `No uses estas palabras o expresiones: ${e.evitar.map((x) => `«${x}»`).join(', ')}.` : '',
        e.notas ? `Además: ${e.notas}` : '',
    ].filter(Boolean);
    return reglas.length ? `ESTILO DEL PROYECTO (obligatorio en todo lo que redactes, sin mencionarlo): ${reglas.join(' ')} Escribe siempre en español; si una fuente usa un término en otro idioma, tradúcelo.` : '';
};

const escapar = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const comoElOriginal = (hallado, nuevo) => (hallado[0] !== hallado[0].toLowerCase() ? nuevo[0].toUpperCase() + nuevo.slice(1) : nuevo);
// El guion puede venir como «-», «‑» (sin corte) o «–»: «no-show» debe encontrarse escrito de cualquiera de las tres formas.
const patron = (termino) => new RegExp(`(?<![\\p{L}\\p{N}])${escapar(t(termino)).replace(/[-‑–]/g, '[-‑–]')}(?![\\p{L}\\p{N}])`, 'giu');

// Corrige en un texto los términos que el estudiante pidió cambiar (palabra completa, respetando la mayúscula inicial).
export const aplicarEstilo = (texto, crudo) => normalizarEstilo(crudo).terminos
    .slice().sort((a, b) => b.enLugarDe.length - a.enLugarDe.length)
    .reduce((s, x) => s.replace(patron(x.enLugarDe), (m) => comoElOriginal(m, x.usar)), String(texto ?? ''));

// Respuesta de la IA en JSON: el código lee sus claves («variable», «objetivo»…) y compara etiquetas cortas con
// listas fijas («likert», «Recursos Humanos»). Por eso el vocabulario se aplica solo a los textos redactados
// (cuatro palabras o más) y nunca a las claves. Si no se puede leer como JSON, se devuelve tal cual.
const enProsa = (valor, crudo) => {
    if (typeof valor === 'string') return valor.trim().split(/\s+/).length >= 4 ? aplicarEstilo(valor, crudo) : valor;
    if (Array.isArray(valor)) return valor.map((x) => enProsa(x, crudo));
    if (valor && typeof valor === 'object') return Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, enProsa(v, crudo)]));
    return valor;
};
export const aplicarEstiloEnJson = (texto, crudo) => {
    const s = String(texto ?? '');
    const a = s.indexOf('{');
    const b = s.lastIndexOf('}');
    if (a < 0 || b <= a || !normalizarEstilo(crudo).terminos.length) return s;
    try { return JSON.stringify(enProsa(JSON.parse(s.slice(a, b + 1)), crudo)); } catch { return s; }
};

// Términos «en lugar de» y «evitar» que todavía aparecen en un texto, con cuántas veces.
export const hallazgosDeEstilo = (texto, crudo) => {
    const e = normalizarEstilo(crudo);
    const s = String(texto ?? '');
    return [
        ...e.terminos.map((x) => ({ termino: x.enLugarDe, usar: x.usar, veces: (s.match(patron(x.enLugarDe)) || []).length })),
        ...e.evitar.map((x) => ({ termino: x, usar: '', veces: (s.match(patron(x)) || []).length })),
    ].filter((h) => h.veces > 0);
};

// Lo mismo en cualquier valor guardado. No se tocan identificadores, enlaces ni los datos de las fuentes
// (título, autor y año de un artículo son de la fuente, no del estudiante).
const SIN_TOCAR = new Set(['id', 'filaId', 'fileId', 'tipo', 'escala', 'tecnica', 'software', 'enlace', 'fuente', 'ubicacion', 'estilo', 'titulo', 'autor', 'anio', 'doi', 'url', 'revista', 'editorial']);
export const aplicarEstiloEnValor = (valor, crudo, clave = '') => {
    if (SIN_TOCAR.has(clave)) return valor;
    if (typeof valor === 'string') return aplicarEstilo(valor, crudo);
    if (Array.isArray(valor)) return valor.map((x) => aplicarEstiloEnValor(x, crudo, clave));
    if (valor && typeof valor === 'object') return Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, aplicarEstiloEnValor(v, crudo, k)]));
    return valor;
};
const textoDe = (valor, clave = '') => {
    if (SIN_TOCAR.has(clave)) return '';
    if (typeof valor === 'string') return valor;
    if (Array.isArray(valor)) return valor.map((x) => textoDe(x, clave)).join('\n');
    if (valor && typeof valor === 'object') return Object.entries(valor).map(([k, v]) => textoDe(v, k)).join('\n');
    return '';
};

// Campos del proyecto donde se revisa el vocabulario: todo lo que el estudiante redacta, menos las referencias
// y el propio estilo. El título del proyecto sí entra (es suyo).
const FUERA = new Set(['estilo', 'referencias', 'propagado', 'elementos', 'cualitativo', 'instrumentosGen']);
export const revisarProyecto = (data, crudo) => {
    const campos = Object.keys(data || {}).filter((k) => !FUERA.has(k));
    const todo = campos.map((k) => (k === 'titulo' ? String(data[k] ?? '') : textoDe(data[k], k))).join('\n');
    const cambios = {};
    campos.forEach((k) => {
        const nuevo = k === 'titulo' ? aplicarEstilo(data[k], crudo) : aplicarEstiloEnValor(data[k], crudo, k);
        if (JSON.stringify(nuevo) !== JSON.stringify(data[k])) cambios[k] = nuevo;
    });
    return { hallazgos: hallazgosDeEstilo(todo, crudo), cambios };
};
