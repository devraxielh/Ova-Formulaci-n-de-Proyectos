/*
 * Evaluación de proyectos hechos fuera de la plataforma (Word o PDF).
 * 1. Se lee el texto del archivo (Word aquí; PDF en leerPdf.js, que solo corre en el navegador).
 * 2. Se separa en secciones por sus títulos («Introducción», «2. Planteamiento del problema»…).
 * 3. Se extraen título, pregunta y objetivos para medir la coherencia con las mismas reglas de la plataforma.
 * 4. Cada sección se puede evaluar con IA contra una lista de criterios (¿la introducción tiene contexto?…).
 * Todo lo que no es IA es puro y se prueba en Node.
 */
import JSZip from 'jszip';
import { evaluarCoherencia, partesObjetivos } from './coherencia.js';
import { citasEnTexto, claveRef } from './apa.js';

const t = (v) => String(v ?? '').trim();
export const plano = (v) => t(v).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ ]+/g, ' ').replace(/\s+/g, ' ').trim();
export const palabras = (texto) => (t(texto).match(/[\p{L}\p{N}]+/gu) || []).length;

/* ---------- Lectura de Word (.docx) ---------- */

const entidades = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');

// Párrafos del documento: { texto, estilo, titulo } (titulo = el estilo es de título: Heading, Título…).
export const leerDocx = async (buffer) => {
    const zip = await JSZip.loadAsync(buffer);
    const archivo = zip.file('word/document.xml');
    if (!archivo) throw new Error('El archivo no parece un documento de Word (.docx).');
    const xml = await archivo.async('string');
    const cuerpo = xml.slice(xml.indexOf('<w:body'));
    const parrafos = [];
    // Tablas y párrafos en orden. Una tabla (cronograma, presupuesto…) entra como un solo renglón de texto que nunca
    // abre sección: sus celdas («Marco teórico», «Resultados») no son títulos.
    for (const m of cuerpo.matchAll(/<w:tbl>[\s\S]*?<\/w:tbl>|<w:p[ >][\s\S]*?<\/w:p>/g)) {
        if (m[0].startsWith('<w:tbl>')) {
            const celdas = [...m[0].matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map((x) => entidades(x[1]).trim()).filter(Boolean);
            if (celdas.length) parrafos.push({ texto: celdas.join(' · '), estilo: '', titulo: false, indice: false, tabla: true });
            continue;
        }
        const p = m[0];
        const estilo = (p.match(/<w:pStyle w:val="([^"]+)"/) || [])[1] || '';
        // Texto de las corridas, con tabulaciones y saltos de línea como espacios (en el índice separan el número de página).
        const texto = entidades([...p.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:tab\/>|<w:br\/>/g)].map((x) => (x[1] !== undefined ? x[1] : x[0] === '<w:tab/>' ? '\t' : ' ')).join('')).replace(/[  ]+/g, ' ').trim();
        if (!texto) continue;
        parrafos.push({ texto, estilo, titulo: /heading|t[ií]tulo|ttulo|^title/i.test(estilo) && !/toc|tdc|contenido/i.test(estilo), indice: /^toc|^tdc|contenido/i.test(estilo) });
    }
    if (!parrafos.length) throw new Error('El documento no tiene texto que se pueda leer.');
    return parrafos;
};

/* ---------- Líneas de un PDF (a partir de los fragmentos que entrega pdf.js) ---------- */

// items: [{ str, transform: [a, b, c, d, x, y] }] de una página. Junta los de la misma altura en una línea.
export const lineasDePagina = (items) => {
    const conTexto = (items || []).filter((it) => t(it.str));
    const filas = [];
    conTexto.forEach((it) => {
        const y = it.transform[5];
        const fila = filas.find((f) => Math.abs(f.y - y) < 2.5);
        if (fila) fila.items.push(it); else filas.push({ y, items: [it] });
    });
    return filas.sort((a, b) => b.y - a.y).map((f) => f.items.sort((a, b) => a.transform[4] - b.transform[4]).map((it) => it.str).join(' ').replace(/\s+/g, ' ').trim()).filter(Boolean);
};

/* ---------- Secciones ---------- */

// Secciones que se buscan, en el orden habitual de un proyecto. `patron` se compara con el título sin número ni tildes.
export const SECCIONES = [
    { id: 'resumen', label: 'Resumen', patron: /^(resumen|abstract)( ejecutivo)?$/ },
    { id: 'introduccion', label: 'Introducción', patron: /^introduccion$/ },
    { id: 'planteamiento', label: 'Planteamiento del problema', patron: /^((planteamiento|descripcion|definicion|identificacion) (del|de la) problem(a|atica)( de investigacion)?|problema de investigacion|situacion problema|el problema)$/ },
    { id: 'pregunta', label: 'Pregunta de investigación', patron: /^((formulacion|pregunta)( del| de la| de)? (problema|pregunta|investigacion)( de investigacion)?|formulacion o pregunta de investigacion|pregunta problema)$/ },
    { id: 'objetivos', label: 'Objetivos', patron: /^objetivos?( de (la )?investigacion| del (proyecto|estudio)| general(es)?| especificos?)?$/ },
    { id: 'justificacion', label: 'Justificación', patron: /^justificacion( del (proyecto|estudio)| de la investigacion)?$/ },
    { id: 'alcances', label: 'Alcances y limitaciones', patron: /^(alcances?|delimitacion|limitaciones)( y (limitaciones|delimitacion|alcances?))?( del (proyecto|estudio)| de la investigacion)?$/ },
    { id: 'marco', label: 'Marco referencial', patron: /^(marco (referencial|teorico|conceptual|legal|contextual|normativo|de referencia|institucional)|estado del arte|antecedentes( de (la )?investigacion| del problema)?|fundamentacion teorica|bases teoricas|revision de (la )?literatura)$/ },
    { id: 'metodologia', label: 'Metodología', patron: /^(metodologia|diseno metodologico|marco metodologico|materiales y metodos|metodo|metodologia de (la )?investigacion|cronograma( de actividades)?|presupuesto)$/ },
    { id: 'fases', label: 'Desarrollo de las fases', patron: /^(desarrollo de las fases( del proyecto)?|fases del proyecto|fases de (la )?investigacion|plan de trabajo)$/ },
    { id: 'resultados', label: 'Resultados y discusión', patron: /^(resultados( y discusion)?( esperados)?|analisis (de|e interpretacion de) (los )?resultados|discusion( de (los )?resultados)?)$/ },
    { id: 'conclusiones', label: 'Conclusiones', patron: /^(conclusiones?|recomendaciones|conclusiones y recomendaciones)$/ },
    { id: 'referencias', label: 'Referencias', patron: /^(referencias( bibliograficas)?|bibliografia|fuentes consultadas|lista de referencias)$/ },
];
const IGNORAR = [
    { id: 'indice', patron: /^(tabla de contenido|contenido|indice( general)?|lista de (tablas|figuras|graficos))$/ },
    { id: 'anexos', patron: /^(anexos?|apendices?)( [a-z0-9].*)?$/ },
    { id: 'preliminares', patron: /^(preliminares|dedicatoria|agradecimientos|declaracion de .*)$/ },
];
// Secciones que un proyecto suele tener; las demás son opcionales según su avance.
export const ESPERADAS = ['introduccion', 'planteamiento', 'objetivos', 'justificacion', 'marco', 'metodologia', 'referencias'];

const sinNumero = (texto) => t(texto).replace(/^(?:(?:cap[ií]tulo|secci[oó]n|parte)\s+[\divxlc]+\s*[.:\-–]?\s*|[\divxlc]{1,4}(?:\.\d+)*\s*[.)\-–]?\s+)/i, '').trim();
// ¿Es este renglón el título de una sección conocida? Devuelve su id ('' si no lo es).
// Las entradas del índice («1 Introducción ...... 3», o con tabulación en Word) no abren sección.
export const seccionDeTitulo = (texto, { estiloTitulo = false } = {}) => {
    const crudo = t(texto);
    if (!crudo || /\t/.test(texto) || /(\.{2,}|…)\s*[\divxlc]{1,4}$/i.test(crudo)) return '';
    const conPagina = crudo.match(/^(.*\S)\s+([\divxlc]{1,4})$/i);
    if (conPagina && seccionDeTitulo(conPagina[1])) return '';
    const limpio = sinNumero(crudo).replace(/[:.]$/, '');
    if (!limpio || limpio.length > 75 || palabras(limpio) > 9) return '';
    if (!estiloTitulo && /[;,]$/.test(crudo)) return '';
    // Un renglón partido del cuerpo («metodología.», «resultados») no es título: los títulos empiezan en mayúscula
    // y, si terminan en punto, llevan número delante.
    if (!estiloTitulo && (/^\p{Ll}/u.test(limpio) || (/\.$/.test(crudo) && limpio === crudo.replace(/\.$/, '')))) return '';
    const p = plano(limpio);
    const ignorada = IGNORAR.find((x) => x.patron.test(p));
    if (ignorada) return ignorada.id;
    return SECCIONES.find((x) => x.patron.test(p))?.id || '';
};

/*
 * Reparte los renglones (párrafos de Word o líneas de PDF) en secciones.
 * Devuelve { portada: [renglones antes de la primera sección], secciones: { id: { label, renglones, titulos } } }.
 * Una sección que aparece varias veces (p. ej. «Antecedentes» y «Marco teórico») se acumula en la misma.
 */
export const separarSecciones = (renglones) => {
    const portada = [];
    const secciones = {};
    let actual = '';
    (renglones || []).forEach((r) => {
        const texto = typeof r === 'string' ? r : r.texto;
        if (!t(texto) || r?.indice) return;
        if (/^[\divxlc]{1,4}$/i.test(t(texto))) return; // número de página suelto
        const id = r?.tabla ? '' : seccionDeTitulo(texto, { estiloTitulo: Boolean(r?.titulo) });
        if (id) {
            actual = id;
            if (SECCIONES.some((s) => s.id === id)) {
                const yaEstaba = Boolean(secciones[id]);
                secciones[id] = secciones[id] || { label: SECCIONES.find((s) => s.id === id).label, renglones: [], titulos: [], porParrafo: typeof r !== 'string' };
                secciones[id].titulos.push(t(texto));
                // Un subtítulo de la misma sección («Objetivo general», «Antecedentes») se conserva en el texto:
                // marca dónde empieza cada parte.
                if (yaEstaba) secciones[id].renglones.push(t(texto));
            }
            return;
        }
        if (!actual) portada.push(t(texto));
        else if (secciones[actual]) secciones[actual].renglones.push(t(texto));
    });
    // Una pregunta en su propio apartado también cuenta como parte del planteamiento (allí la busca la IA).
    return { portada, secciones };
};

export const textoDe = (seccion) => (seccion?.renglones || []).join('\n');

/* ---------- Título, pregunta y objetivos ---------- */

// Renglones de portada que no son el título: institución, autores, asesor, ciudad y fecha.
const NO_TITULO = /^(universidad|facultad|programa|corporaci[oó]n|instituci[oó]n|escuela|departamento|presentado|presenta|autor|asesor|director|tutor|docente|estudiante|trabajo de grado|proyecto de grado|requisito|para optar|p[aá]gina|\d|(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\b)/i;
export const tituloDe = (portada) => {
    const lista = (portada || []).map(t);
    const i = lista.findIndex((l) => palabras(l) >= 6 && palabras(l) <= 45 && !NO_TITULO.test(l) && !(palabras(l) <= 8 && /\b(19|20)\d{2}\b/.test(l)));
    if (i < 0) return '';
    let titulo = lista[i];
    // En un PDF el título largo ocupa varios renglones: se juntan mientras no termine en punto y siga pareciendo título.
    for (let k = i + 1; k < lista.length && palabras(titulo) < 40; k += 1) {
        const sig = lista[k];
        // Solo se junta si el renglón quedó a mitad de frase (termina en «de», «la», coma…) o el siguiente sigue en minúscula.
        const sigue = /(\s(de|del|la|las|el|los|en|y|e|o|a|al|para|por|con|sin|sobre|entre|un|una|su|sus)|,)$/i.test(titulo) || /^\p{Ll}/u.test(sig);
        if (!sigue || /[.:]$/.test(titulo) || NO_TITULO.test(sig) || /^(presentado|autor|asesor)/i.test(sig) || palabras(sig) > 14 || palabras(titulo) + palabras(sig) > 45) break;
        titulo = `${titulo} ${sig}`;
    }
    return titulo.replace(/\s+/g, ' ').replace(/\.$/, '');
};

export const preguntaDe = (...textos) => {
    for (const texto of textos) {
        const m = t(texto).replace(/\s+/g, ' ').match(/¿[^¿?]{15,400}\?/);
        if (m) return m[0];
    }
    return '';
};

const VERBO = /^(analizar|identificar|describir|caracterizar|determinar|establecer|evaluar|comparar|proponer|disenar|diseñar|explicar|relacionar|conocer|valorar|medir|estimar|examinar|explorar|definir|desarrollar|implementar|elaborar|construir|formular|validar|estudiar|indagar|diagnosticar|reconocer|interpretar|comprender|verificar|demostrar|contrastar|plantear|aplicar|crear|generar|mejorar|optimizar|calcular|cuantificar|clasificar|seleccionar|categorizar|precisar|especificar|delimitar|inferir|predecir|sistematizar|documentar|registrar|fortalecer|promover|socializar)\b/i;
const sinVineta = (l) => t(l).replace(/^([-•*·▪◦]|\d{1,2}[.)]|[a-h][.)])\s*/i, '');

// Objetivo general y específicos a partir del texto de la sección de objetivos.
export const objetivosDe = (texto) => {
    const lineas = t(texto).split('\n').map(t).filter(Boolean);
    let modo = '';
    let general = '';
    const especificos = [];
    lineas.forEach((l) => {
        const p = plano(sinNumero(l));
        if (/^objetivo general/.test(p)) { modo = 'general'; const resto = l.replace(/^.*?objetivo general\s*[:.\-–]?\s*/i, ''); if (palabras(resto) > 3) general = resto; return; }
        if (/^objetivos? especificos?/.test(p)) {
            modo = 'especificos';
            // «Objetivo específico 1: Identificar…» o «Objetivos específicos: identificar…; describir…».
            const resto = l.replace(/^.*?objetivos? espec[ií]ficos?\s*\d*\s*[:.\-–]?\s*/i, '');
            resto.split(/;\s*/).map(sinVineta).filter((x) => palabras(x) > 3).forEach((x) => especificos.push(x.charAt(0).toUpperCase() + x.slice(1)));
            return;
        }
        if (modo === 'fin') return;
        const limpia = sinVineta(l);
        if (modo === 'general') {
            if (!general) general = limpia;
            else if (!VERBO.test(plano(limpia)) && !/[.]$/.test(general)) general = `${general} ${limpia}`;
            else if (VERBO.test(plano(limpia))) { modo = 'especificos'; especificos.push(limpia); }
            return;
        }
        if (modo === 'especificos') {
            const nuevo = /^([-•*·▪◦]|\d{1,2}[.)]|[a-h][.)])\s*/i.test(l) || VERBO.test(plano(limpia));
            if (nuevo || !especificos.length) especificos.push(limpia);
            else if (!/[.]$/.test(especificos.at(-1))) especificos[especificos.length - 1] = `${especificos.at(-1)} ${limpia}`;
            else modo = 'fin'; // un párrafo de cierre después de la lista no es otro objetivo
            return;
        }
        // Sin rótulos: el primer verbo en infinitivo es el general y los siguientes, los específicos;
        // un renglón que no empieza con verbo continúa el objetivo anterior (en un PDF el texto se parte en renglones).
        if (VERBO.test(plano(limpia))) { if (!general) general = limpia; else especificos.push(limpia); return; }
        if (especificos.length && !/[.]$/.test(especificos.at(-1))) especificos[especificos.length - 1] = `${especificos.at(-1)} ${limpia}`;
        else if (general && !especificos.length && !/[.]$/.test(general)) general = `${general} ${limpia}`;
    });
    return { general: general.replace(/\s+/g, ' '), especificos: especificos.map((x) => x.replace(/\s+/g, ' ')).filter((x) => palabras(x) >= 3).slice(0, 8) };
};

/* ---------- Referencias y citas ---------- */

// Entradas de la lista de referencias (en un PDF cada entrada puede ocupar varios renglones).
export const entradasReferencias = (texto, { porParrafo = false } = {}) => {
    const entradas = [];
    if (porParrafo) return t(texto).split('\n').map(t).filter((l) => palabras(l) >= 3);
    t(texto).split('\n').map(t).filter(Boolean).forEach((l) => {
        // Un apellido puede empezar con partícula en minúscula: «da Costa, B. R.», «van Dijk, T.».
        const l2 = l.replace(/^((da|das|de|del|di|do|dos|du|la|le|van|von|der|den)\s)+/, '');
        // «Apellido, I.» abre una entrada solo si la anterior ya tiene su año: así una lista larga de autores
        // partida en varios renglones sigue siendo una sola entrada.
        const anterior = entradas.at(-1) || '';
        const completa = !anterior || /\(\s*((19|20)\d{2}[a-z]?|s\.\s?f\.)/.test(anterior) || /^(Ley|Decreto|Resoluci[oó]n|Acuerdo|Constituci[oó]n)\s/i.test(anterior) || /([.)]|https?:\/\/\S+)$/.test(anterior);
        // APA («Pérez, J.»), ICONTEC («PÉREZ, Juan.») o una institución con su año («Ministerio de Salud. (2020)»).
        const autor = /^[\p{Lu}][\p{L}'’-]+(\s[\p{L}'’-]+){0,3},\s*[\p{Lu}]\./u.test(l2) || /^[\p{Lu}][^()]{0,160}\(\s*((19|20)\d{2}[a-z]?|s\.\s?f\.)\)/u.test(l2) || /^\p{Lu}{2,}[\p{Lu} '’-]*,\s*\p{Lu}/u.test(l2);
        const empieza = (autor && completa) || /^(Ley|Decreto|Resoluci[oó]n|Acuerdo|Constituci[oó]n)\s\S+\sde\s(19|20)\d{2}/i.test(l);
        if (empieza || !entradas.length) entradas.push(l); else entradas[entradas.length - 1] = `${entradas.at(-1)} ${l}`;
    });
    return entradas;
};
const refDeEntrada = (entrada) => {
    const norma = entrada.match(/^((?:Ley|Decreto|Resoluci[oó]n|Acuerdo)\s(?:n\.?[ºo°]?\s*)?\d+\sde\s((?:19|20)\d{2}))/i);
    if (norma) return { tipo: 'ley', titulo: norma[1], anio: norma[2] };
    const m = entrada.match(/^(.{2,300}?)\s*\(\s*((?:19|20)\d{2})[a-z]?[^)]*\)/);
    if (!m) return null;
    const autores = m[1].replace(/\.$/, '').replace(/,?\s*(y|&)\s+/g, '; ').replace(/\.,\s+(?=[\p{Lu}])/gu, '.; ');
    return { tipo: 'articulo', autores, anio: m[2] };
};
export const revisarCitasDocumento = (secciones) => {
    const textoCuerpo = Object.entries(secciones).filter(([id]) => id !== 'referencias').map(([, s]) => textoDe(s)).join('\n');
    const citas = new Map();
    citasEnTexto(textoCuerpo.replace(/\n/g, ' ')).forEach((c) => { const x = citas.get(c.clave) || { ...c, veces: 0 }; x.veces += 1; citas.set(c.clave, x); });
    const entradas = entradasReferencias(textoDe(secciones.referencias), { porParrafo: Boolean(secciones.referencias?.porParrafo) });
    const refs = entradas.map((e) => ({ entrada: e, ref: refDeEntrada(e) }));
    const claves = new Set(refs.filter((r) => r.ref).map((r) => claveRef(r.ref)));
    const citadas = new Set(citas.keys());
    return {
        citas: [...citas.values()],
        referencias: entradas.length,
        sinReferencia: [...citas.values()].filter((c) => !claves.has(c.clave)),
        noCitadas: refs.filter((r) => r.ref && !citadas.has(claveRef(r.ref))).map((r) => r.entrada),
        sinLeer: refs.filter((r) => !r.ref).map((r) => r.entrada),
    };
};

/* ---------- Diagnóstico sin IA ---------- */

// Lo que la plataforma puede medir sin IA: estructura, extensión, coherencia y citas.
export const diagnosticar = (renglones, { titulo: tituloManual = '' } = {}) => {
    const { portada, secciones } = separarSecciones(renglones);
    const titulo = t(tituloManual) || tituloDe(portada);
    const pregunta = preguntaDe(textoDe(secciones.pregunta), textoDe(secciones.planteamiento), textoDe(secciones.introduccion), textoDe(secciones.objetivos));
    const { general, especificos } = objetivosDe(textoDe(secciones.objetivos));
    const objetivos = general || especificos.length ? `### Objetivo general\n${general}\n\n### Objetivos específicos\n${especificos.map((o, i) => `${i + 1}. ${o}`).join('\n')}` : '';
    const datos = {
        titulo,
        pregunta,
        planteamiento: [textoDe(secciones.planteamiento), textoDe(secciones.pregunta)].filter(Boolean).join('\n\n'),
        objetivos,
        objetivoGeneral: general,
        justificacion: textoDe(secciones.justificacion),
        alcances: textoDe(secciones.alcances),
    };
    const estructura = SECCIONES.map((s) => ({ id: s.id, label: s.label, esperada: ESPERADAS.includes(s.id), encontrada: Boolean(secciones[s.id]?.renglones.length), palabras: palabras(textoDe(secciones[s.id])) }));
    return {
        titulo, pregunta, general, especificos, datos, secciones, estructura,
        coherencia: evaluarCoherencia(datos),
        citas: revisarCitasDocumento(secciones),
        palabras: Object.values(secciones).reduce((n, s) => n + palabras(textoDe(s)), 0),
        objetivosLeidos: partesObjetivos(objetivos),
    };
};

/* ---------- Criterios de cada sección (para la evaluación con IA) ---------- */

export const CRITERIOS = {
    resumen: [['objetivo', 'Presenta el objetivo del estudio'], ['metodo', 'Describe la metodología (enfoque, población, instrumento)'], ['resultados', 'Resume los resultados principales (o los esperados, si es una propuesta)'], ['conclusiones', 'Incluye las conclusiones o el aporte'], ['extension', 'Tiene una extensión adecuada (unas 150 a 250 palabras) y sin citas'], ['claves', 'Trae palabras clave']],
    introduccion: [['contexto', 'Presenta el contexto del tema con datos o fuentes'], ['problema', 'Plantea el problema que motiva el estudio'], ['importancia', 'Explica por qué es importante estudiarlo'], ['objetivo', 'Enuncia el objetivo de la investigación'], ['metodo', 'Menciona cómo se hará el estudio (enfoque o método)'], ['estructura', 'Anuncia cómo está organizado el documento']],
    planteamiento: [['contexto', 'Describe el contexto (global, nacional o local) con datos y fuentes citadas'], ['problema', 'Delimita el problema: qué pasa, a quién, dónde y cuándo'], ['causas', 'Expone las causas del problema'], ['efectos', 'Expone las consecuencias si no se atiende'], ['evidencia', 'Sustenta con cifras o estudios, no solo con opiniones'], ['pregunta', 'Cierra con una pregunta de investigación clara y coherente con lo planteado']],
    objetivos: [['general', 'El objetivo general empieza con un verbo en infinitivo y responde a la pregunta'], ['alcanzable', 'El objetivo general es alcanzable con el tiempo y los recursos del estudio'], ['cantidad', 'Tiene entre 2 y 4 objetivos específicos'], ['pasos', 'Los específicos son pasos para lograr el general, no tareas operativas'], ['verbo', 'Cada objetivo tiene un solo verbo medible'], ['orden', 'Los específicos van de menor a mayor complejidad']],
    justificacion: [['conveniencia', 'Explica para qué sirve el estudio (conveniencia)'], ['social', 'Dice a quién beneficia (relevancia social)'], ['practico', 'Indica qué problema práctico ayuda a resolver'], ['teorico', 'Señala su aporte teórico o metodológico'], ['viabilidad', 'Muestra que es viable (acceso, tiempo, recursos)'], ['no-repite', 'No repite el planteamiento: argumenta']],
    alcances: [['tema', 'Delimita el tema o las variables'], ['poblacion', 'Delimita la población'], ['lugar', 'Delimita el lugar'], ['tiempo', 'Delimita el tiempo'], ['limitaciones', 'Reconoce limitaciones reales'], ['manejo', 'Dice cómo se manejarán esas limitaciones']],
    marco: [['antecedentes', 'Presenta antecedentes (estudios previos) con autor, año y hallazgo'], ['recientes', 'Los antecedentes son pertinentes y relativamente recientes'], ['teorias', 'Expone teorías o modelos y los relaciona con las variables del estudio'], ['conceptos', 'Define los conceptos clave con fuente'], ['legal', 'Incluye el marco legal o normativo, si aplica'], ['citas', 'Cita las fuentes en el texto (autor, año)']],
    metodologia: [['enfoque', 'Declara el enfoque (cuantitativo, cualitativo o mixto) y lo justifica'], ['tipo', 'Declara el tipo o alcance de la investigación'], ['diseno', 'Declara el diseño de la investigación'], ['poblacion', 'Describe la población y la muestra, con el muestreo'], ['instrumentos', 'Describe técnicas e instrumentos de recolección'], ['validez', 'Explica cómo se asegura la validez y la confiabilidad'], ['analisis', 'Tiene un plan de análisis para cada objetivo específico'], ['etica', 'Considera aspectos éticos (consentimiento, confidencialidad)']],
    fases: [['por-objetivo', 'Hay una fase por objetivo específico'], ['actividades', 'Cada fase tiene actividades concretas'], ['productos', 'Cada fase entrega un producto'], ['tiempos', 'Los tiempos son realistas']],
    resultados: [['por-objetivo', 'Presenta resultados para cada objetivo específico'], ['datos', 'Los resultados traen datos concretos (cifras, porcentajes, categorías)'], ['apoyos', 'Usa tablas o figuras y las comenta en el texto'], ['discusion', 'Interpreta y compara los resultados con antecedentes o teoría'], ['sin-exagerar', 'No afirma más de lo que los datos muestran']],
    conclusiones: [['por-objetivo', 'Hay una conclusión por cada objetivo específico'], ['pregunta', 'Responde la pregunta de investigación'], ['derivadas', 'Las conclusiones se derivan de los resultados, sin datos nuevos'], ['recomendaciones', 'Hace recomendaciones con destinatario']],
};
export const SECCIONES_EVALUABLES = Object.keys(CRITERIOS);

// Mensajes para la IA: evalúa una sección contra sus criterios, con el contexto del proyecto.
export const mensajesEvaluacion = ({ id, texto, titulo, pregunta, general, especificos }) => {
    const criterios = CRITERIOS[id] || [];
    const etiqueta = SECCIONES.find((s) => s.id === id)?.label || id;
    const contexto = [titulo && `TÍTULO: ${titulo}`, pregunta && `PREGUNTA: ${pregunta}`, general && `OBJETIVO GENERAL: ${general}`, especificos?.length && `OBJETIVOS ESPECÍFICOS:\n${especificos.map((o, i) => `${i + 1}. ${o}`).join('\n')}`].filter(Boolean).join('\n');
    return [
        { role: 'system', content: 'Eres un evaluador metodológico de proyectos de investigación universitarios. Revisas con rigor y respeto un documento escrito por otra persona, fuera de cualquier plataforma. Solo juzgas lo que está en el texto: si algo no aparece, lo marcas como ausente; nunca inventas datos, autores ni cifras. Respondes solo JSON válido en español.' },
        { role: 'user', content: `Evalúa la sección «${etiqueta}» de este proyecto.\n\nCONTEXTO DEL PROYECTO\n${contexto || '(no se pudieron leer el título ni los objetivos)'}\n\nTEXTO DE LA SECCIÓN\n${t(texto).slice(0, 6000)}\n\nCRITERIOS\n${criterios.map(([cid, desc]) => `- ${cid}: ${desc}`).join('\n')}\n\nPara cada criterio decide: "cumple" (está y está bien), "parcial" (está pero incompleto o débil) o "no" (no aparece). Da como evidencia una cita textual breve (máx. 15 palabras, sin comillas dobles) cuando exista. Responde exactamente con este JSON:\n{"valoracion": "una o dos frases con el estado general de la sección", "criterios": [{"id": "id del criterio", "estado": "cumple | parcial | no", "evidencia": "cita breve o vacío", "comentario": "qué falta o cómo mejorarlo, en una frase; vacío si cumple sin reparos"}], "sugerencias": ["máximo 3 mejoras concretas, de la más a la menos importante"]}` },
    ];
};

// Respuesta de la IA → { valoracion, criterios: [{ id, texto, estado, evidencia, comentario }], sugerencias, nivel, puntaje }.
export const leerEvaluacion = (id, contenido) => {
    const json = JSON.parse(contenido.slice(contenido.indexOf('{'), contenido.lastIndexOf('}') + 1));
    const dados = new Map((Array.isArray(json.criterios) ? json.criterios : []).map((c) => [String(c?.id || ''), c]));
    const criterios = (CRITERIOS[id] || []).map(([cid, texto]) => {
        const c = dados.get(cid) || {};
        const estado = ['cumple', 'parcial', 'no'].includes(c.estado) ? c.estado : 'no';
        const vacio = (v) => /^(n\/?a|no aplica|ningun[oa]?|sin comentarios?|-|—)\.?$/i.test(t(v)) ? '' : t(v);
        return { id: cid, texto, estado, evidencia: vacio(c.evidencia).slice(0, 200), comentario: vacio(c.comentario) };
    });
    const puntos = criterios.reduce((s, c) => s + (c.estado === 'cumple' ? 1 : c.estado === 'parcial' ? 0.5 : 0), 0);
    const puntaje = criterios.length ? Math.round((puntos / criterios.length) * 100) : 0;
    return {
        valoracion: t(json.valoracion),
        criterios,
        sugerencias: (Array.isArray(json.sugerencias) ? json.sugerencias : []).map(t).filter(Boolean).slice(0, 3),
        puntaje,
        nivel: puntaje >= 85 ? 'lista' : puntaje >= 55 ? 'casi' : 'falta',
    };
};
