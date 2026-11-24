import { arbolCompleto, arbolSvg, explicacionArbol, leerArbol, leerArbolObjetivos } from './arbol.js';
import { ordenarReferencias, referenciaAPA } from './apa.js';
import { partesObjetivos } from './coherencia.js';
import { bloquesInstrumento, preguntasDe, ubicacionDe } from './instrumentos.js';
import { LEYENDA_MUESTRA, ecuacionEnLinea, ecuacionesMuestreo } from '../data/muestreoEcuaciones.js';

// Arma el documento del proyecto a partir de lo guardado en cada herramienta.
// Cada sección produce "bloques" neutros que se pintan en pantalla o se exportan a Word.

const text = (value) => (typeof value === 'string' ? value.trim() : '');
const list = (value) => (Array.isArray(value) ? value : []);

// Convierte el texto de la IA (Markdown sencillo) en bloques: títulos, listas y párrafos.
export const parseBlocks = (raw) => {
    const blocks = [];
    let items = null;
    let nums = null; // números originales cuando la lista venía numerada (1., 2., …)
    const flush = () => {
        if (items) blocks.push(nums ? { type: 'list', items, nums } : { type: 'list', items });
        items = null;
        nums = null;
    };

    text(raw).split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || /^[-*_]{3,}$/.test(trimmed)) {
            flush();
            return;
        }
        const heading = trimmed.match(/^#{1,6}\s+(.*)$/);
        if (heading) {
            flush();
            blocks.push({ type: 'heading', text: heading[1].replace(/\*\*/g, '') });
            return;
        }
        const bullet = trimmed.match(/^(?:[-*•]|(\d+)[.)])\s+(.*)$/);
        if (bullet) {
            // Una lista es numerada o de viñetas, no mezcla: si cambia el tipo, empieza otra.
            if (items && Boolean(nums) !== Boolean(bullet[1])) flush();
            items = items || [];
            items.push(bullet[2]);
            if (bullet[1]) { nums = nums || []; nums.push(bullet[1]); }
            return;
        }
        flush();
        const boldLine = trimmed.match(/^\*\*([^*]+)\*\*:?$/);
        blocks.push(boldLine ? { type: 'heading', text: boldLine[1] } : { type: 'paragraph', text: trimmed });
    });
    flush();
    return blocks;
};

// Divide "texto **negrita** texto" en tramos para pintarlo sin HTML crudo.
export const splitBold = (value) => String(value).split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part) => (
    part.startsWith('**') && part.endsWith('**') ? { bold: true, text: part.slice(2, -2) } : { bold: false, text: part }
));

// Igual, pero también reconoce *cursiva* (lo que produce el editor visual).
export const splitInline = (value) => String(value).split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g).filter(Boolean).map((part) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return { bold: true, text: part.slice(2, -2) };
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2 && !part.startsWith('**')) return { italic: true, text: part.slice(1, -1) };
    return { text: part };
});

const ideaSentence = (idea) => {
    if (!idea) return '';
    if (text(idea.frase)) return text(idea.frase);
    if (!text(idea.problema)) return '';
    return text(idea.problema);
};

const ideaBlocks = (idea) => {
    if (!idea) return [];
    const blocks = [];
    const sentence = ideaSentence(idea);
    if (sentence) blocks.push({ type: 'paragraph', text: sentence });
    const rows = [
        ['Problema central', text(idea.problema)],
        ['Causas', [idea.causa1, idea.causa2, idea.causa3].map(text).filter(Boolean).join('; ')],
        ['Efectos', [idea.efecto1, idea.efecto2, idea.efecto3].map(text).filter(Boolean).join('; ')],
        ['Población', text(idea.quien)],
        ['Lugar', text(idea.donde)],
        ['Periodo', text(idea.cuando)],
        ['Antecedentes', [idea.antecedente1, idea.antecedente2].map(text).filter(Boolean).join('; ')],
    ].filter(([, value]) => value);
    if (rows.length > 0) blocks.push({ type: 'list', items: rows.map(([label, value]) => `**${label}:** ${value}`) });
    return blocks;
};

// Los títulos escritos dentro del texto (### o **Algo:**) quedan como subtítulos en negrita, fuera del índice.
// Ecuaciones del muestreo elegido, resueltas con los datos del proyecto: van después del texto de la población.
// `text` lleva la ecuación en una línea para todo lo que lee los bloques como texto (revisión, conteo, exportes simples).
const ecuacion = (partes) => ({ type: 'equation', partes, linea: ecuacionEnLinea(partes), text: ecuacionEnLinea(partes) });
const bloquesEcuaciones = (d) => {
    const p = d.metodologiaForm?.poblacion || {};
    if (!text(d.poblacionSugerida) || !p.muestreo) return [];
    // Con población finita sin escribir su tamaño no se muestran ecuaciones con un número de ejemplo.
    if (d.poblacionTipo !== 'infinita' && d.poblacionTamano == null) return [];
    const calc = { finita: d.poblacionTipo !== 'infinita', N: Number(d.poblacionTamano ?? 1000) || 0, Z: Number(d.muestraConfianza) || 1.96, e: Number(d.muestraError) || 0.05 };
    const ecuaciones = ecuacionesMuestreo({ muestreo: p.muestreo, calc, conglomerados: p.conglomerados, perdidas: p.perdidas }).filter((e) => !e.soloVentana);
    return ecuaciones.flatMap((e) => [
        { type: 'paragraph', text: `${e.titulo}:` },
        ecuacion(e.general),
        ...(e.con ? [ecuacion(e.con)] : []),
        // Las notas de cada ecuación ya están dichas en el párrafo de la población: aquí solo va la leyenda.
        ...(e.leyenda ? [{ type: 'paragraph', text: `Donde ${LEYENDA_MUESTRA}.` }] : e.explica ? [{ type: 'paragraph', text: e.explica }] : []),
    ]);
};

const cuerpo = (raw) => parseBlocks(raw).map((b) => (b.type === 'heading' ? { type: 'sub', text: b.text } : b));
// Subsección del índice (nivel 2 o 3), p. ej. «6.1 Antecedentes».
const titled = (label, raw, level = 2) => (text(raw) ? [{ type: 'heading', level, text: label }, ...cuerpo(raw)] : []);
// Subtítulo en negrita que no va al índice.
const conSub = (label, raw) => (text(raw) ? [{ type: 'sub', text: label }, ...cuerpo(raw)] : []);

// En Objetivos solo «Objetivo general» y «Objetivos específicos» son subsecciones.
const objetivosBlocks = (raw) => parseBlocks(raw).map((b) => {
    if (b.type !== 'heading') return b;
    if (/objetivo\s+general/i.test(b.text)) return { type: 'heading', level: 2, text: 'Objetivo general' };
    if (/objetivos\s+espec/i.test(b.text)) return { type: 'heading', level: 2, text: 'Objetivos específicos' };
    return { type: 'sub', text: b.text };
});

// Textos modelo de los preliminares; cada institución puede exigir su redacción oficial.
export const DECLARACION_ORIGINALIDAD = (titulo) => `Declaro bajo la gravedad del juramento que he escrito el presente proyecto${titulo ? `, «${titulo}»,` : ''} por mi propia cuenta y que, por lo tanto, su contenido es original. Declaro que he indicado clara y precisamente todas las fuentes directas e indirectas de información y que este documento no ha sido entregado a otra institución con fines de calificación o publicación.`;
export const DECLARACION_EXONERACION = () => 'Declaro que la responsabilidad intelectual del presente trabajo es exclusivamente de su autor o autores. La institución no se hace responsable de los contenidos, opiniones o ideologías expresadas total o parcialmente en él.';

const money = (value) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(value) || 0);

/* ---------- Árbol del problema ---------- */

// Identificador de la figura del árbol: sirve para citarla («ver Figura 1») y para entregar su imagen a Word y PDF.
export const ARBOL_ID = 'arbolfig';

// Las figuras de los árboles van dentro del planteamiento, justo antes de su «Párrafo de cierre» (la parte 5 del constructor):
// así el texto cierra con la necesidad de investigar y no con una figura. Si el planteamiento no tiene cierre
// (o se escribió de otra forma), va al final del texto. La precede un párrafo que la presenta y la explica
// (la marca [[arbolfig]] se cambia por su número: «La Figura 1 presenta…»). Si el estudiante escribió su propio
// párrafo sin nombrar la figura, ese párrafo la cita solo («ver Figura 1»).
// Solo entra cuando hay texto (una figura sola no da el planteamiento por hecho) y el árbol está completo.
// Párrafo de presentación y figura de un árbol. `id` es su marca para citarla; `leyenda`, el título de la figura.
const bloquesDeArbol = (arbol, id, leyenda) => {
    const { w, h } = arbolSvg(arbol);
    const presentacion = { type: 'paragraph', text: arbol.explicacion ? arbol.explicacion.replace(/\b[Ll]a figura\b(?! \d)/, (m) => `${m.charAt(0)}a [[${id}]]`) : explicacionArbol(arbol, `La [[${id}]]`), citaDe: [id] };
    const figura = { type: 'figure', elementoId: id, fileId: id, arbol: { ...(arbol.tipo ? { tipo: arbol.tipo } : {}), problema: arbol.problema, causas: arbol.causas, efectos: arbol.efectos }, caption: leyenda, nota: 'Elaboración propia.', w, h };
    return [presentacion, figura];
};

// Árbol de objetivos: va justo debajo del árbol del problema, dentro del planteamiento (el problema y, enseguida,
// su versión en positivo). Solo cuenta el que el estudiante armó en su página y está completo.
export const ARBOL_OBJ_ID = 'arbolobj';
const bloquesArbolObjetivos = (d) => {
    const arbol = leerArbolObjetivos(d);
    return arbol.propio && arbolCompleto(arbol) ? bloquesDeArbol(arbol, ARBOL_OBJ_ID, 'Árbol de objetivos') : [];
};

const conArbol = (d, blocks) => {
    if (!blocks.length) return blocks;
    const arbol = leerArbol(d);
    const arboles = [...(arbolCompleto(arbol) ? bloquesDeArbol(arbol, ARBOL_ID, 'Árbol del problema') : []), ...bloquesArbolObjetivos(d)];
    if (!arboles.length) return blocks;
    // El cierre son los últimos párrafos del texto, tantos como tenga la parte «cierre» del constructor.
    const parrafosCierre = text(d.planteamientoForm?.cierre).split(/\n\s*\n/).filter((p) => p.trim()).length;
    const indices = blocks.map((b, k) => (b.type === 'paragraph' ? k : -1)).filter((k) => k >= 0);
    const corte = parrafosCierre > 0 && indices.length > parrafosCierre ? indices[indices.length - parrafosCierre] : blocks.length;
    return [...blocks.slice(0, corte), ...arboles, ...blocks.slice(corte)];
};

// Si el planteamiento aún no tiene texto, el árbol de objetivos no se pierde: queda al final de Objetivos.
const conArbolObjetivos = (d, blocks) => {
    if (!blocks.length || cuerpo(d.planteamiento).length) return blocks;
    return [...blocks, ...bloquesArbolObjetivos(d)];
};
const arbolObjetivosBlocks = (d) => {
    const arbol = leerArbolObjetivos(d);
    if (!arbol.propio || !arbolCompleto(arbol)) return [];
    return [{ type: 'list', items: [`**Objetivo central:** ${arbol.problema}`, `**Medios:** ${arbol.causas.join('; ')}`, `**Fines:** ${arbol.efectos.join('; ')}`] }];
};

// Avance de la página «Árbol del problema»: cuenta cuando el estudiante lo armó allí y está completo.
const arbolBlocks = (d) => {
    const arbol = leerArbol(d);
    if (!arbol.propio || !arbolCompleto(arbol)) return [];
    return [{ type: 'list', items: [`**Problema central:** ${arbol.problema}`, `**Causas:** ${arbol.causas.join('; ')}`, `**Efectos:** ${arbol.efectos.join('; ')}`] }];
};

/* ---------- Figuras y tablas propias, Gantt, matriz y anexos ---------- */

// Secciones donde el estudiante puede ubicar una figura o una tabla propia.
export const SECCIONES_ELEMENTOS = [
    { id: 'resultados', label: 'Resultados y discusión' },
    { id: 'marco', label: 'Marco Referencial' },
    { id: 'metodologia', label: 'Metodología' },
    { id: 'fases', label: 'Desarrollo de las fases' },
];

// Bloques de las figuras y tablas que el estudiante ubicó en una sección (data.elementos).
const elementosDe = (d, seccion) => list(d.elementos)
    .filter((e) => e && (e.seccion || 'resultados') === seccion)
    .map((e) => {
        if (e.tipo === 'figura') {
            return e.fileId ? { type: 'figure', elementoId: e.id, despues: Number(e.despues) || 0, citar: e.citar !== false, caption: text(e.titulo) || 'Figura sin título', nota: text(e.nota), fileId: e.fileId, w: Number(e.w) || 0, h: Number(e.h) || 0 } : null;
        }
        const head = list(e.head).map((c) => text(String(c ?? '')));
        const rows = list(e.rows).map((r) => list(r).map((c) => text(String(c ?? '')))).filter((r) => r.some(Boolean));
        return head.some(Boolean) && rows.length ? { type: 'table', elementoId: e.id, despues: Number(e.despues) || 0, citar: e.citar !== false, caption: text(e.titulo) || 'Tabla sin título', nota: text(e.nota), head, rows } : null;
    })
    .filter(Boolean);

// Ubica cada tabla o figura después del párrafo que eligió el estudiante (o al final del texto de la sección).
// Solo se agregan a secciones que ya tienen texto (una figura sola no da la sección por hecha).
const conElementos = (d, seccion, blocks) => {
    if (!blocks.length) return blocks;
    const elementos = elementosDe(d, seccion);
    if (!elementos.length) return blocks;
    const out = [];
    let n = 0;
    blocks.forEach((b) => {
        if (b.type !== 'paragraph') { out.push(b); return; }
        n += 1;
        const aqui = elementos.filter((e) => e.despues === n);
        // El párrafo recuerda qué elementos lo siguen, para citarlos solo si el estudiante no lo hizo.
        out.push(aqui.some((e) => e.citar) ? { ...b, citaDe: aqui.filter((e) => e.citar).map((e) => e.elementoId) } : b);
        out.push(...aqui);
    });
    return [...out, ...elementos.filter((e) => !e.despues || e.despues > n)];
};

// Texto de la sección donde se pueden ubicar tablas y figuras (lo usa el editor para listar los párrafos).
const BASE_ELEMENTOS = {
    resultados: (d) => conSub('Resultados', d.resultados),
    marco: (d) => [
        ...titled('Antecedentes', d.marcoAntecedentes), ...titled('Marco teórico', d.marcoTeorico), ...titled('Marco Conceptual', d.marcoConceptual),
        ...titled('Marco Contextual', d.marcoContextual), ...titled('Marco legal', d.marcoLegal),
    ],
    metodologia: (d) => {
        // Los instrumentos armados en «Instrumentos» van completos dentro de «Instrumentos de recolección de información».
        const propios = list(d.instrumentosGen)
            .filter((ins) => ins && ubicacionDe(ins) === 'plan' && preguntasDe(ins).length > 0)
            .flatMap((ins) => [{ type: 'sub', text: text(ins.titulo) || 'Instrumento de recolección' }, ...bloquesInstrumento(ins)]);
        const descripcion = titled('Instrumentos de recolección de información', d.instrumentos, 3);
        const instrumentos = propios.length && !descripcion.length ? [{ type: 'heading', level: 3, text: 'Instrumentos de recolección de información' }] : descripcion;
        return [...titled('Plan de análisis de la información', d.metPlanAnalisis), ...instrumentos, ...propios];
    },
    fases: (d) => cuerpo(d.fases),
};
export const parrafosDe = (d, seccion) => (BASE_ELEMENTOS[seccion]?.(d || {}) || []).filter((b) => b.type === 'paragraph').map((b) => b.text);

// Marca que el estudiante puede escribir en cualquier texto para citar una tabla o figura: [[id]] → «Tabla 2».
const MARCA = /\[\[([a-z0-9]{5,9})\]\]/g;

// Diagrama de Gantt a partir del cronograma: una fila por actividad y una columna por periodo.
const ganttBlock = (d) => {
    const rows = list(d.cronogramaItems)
        .map((item) => ({ fase: text(item.fase), actividad: text(item.actividad), inicio: Math.max(1, Number(item.inicio) || 1), fin: Number(item.fin) || 0 }))
        .map((r) => ({ ...r, fin: Math.max(r.inicio, r.fin) }))
        .filter((r) => r.actividad || r.fase);
    if (!rows.length) return [];
    const total = Math.min(24, Math.max(Number(d.ganttPeriodos) || 0, ...rows.map((r) => r.fin)));
    return [{ type: 'gantt', caption: 'Diagrama de Gantt del proyecto', unidad: d.ganttUnidad === 'semanal' ? 'Semana' : 'Mes', total, rows }];
};

// Matriz de consistencia: pregunta, objetivos, método e instrumentos en una sola tabla.
export const matrizConsistencia = (d) => {
    const { general, especificos } = partesObjetivos(d.objetivos);
    const pregunta = text(d.pregunta).split('\n')[0].replace(/[#*]/g, '').trim();
    if (!especificos.length || (!pregunta && !general)) return null;
    const f = d.metodologiaForm || {};
    const corto = (v) => (typeof v === 'string' && v.trim().length <= 60 ? v.trim() : '');
    const metodo = [['Enfoque', corto(d.enfoque)], ['Tipo', corto(d.tipoInvestigacion)], ['Diseño', corto(d.diseno)]]
        .filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('. ');
    const instrumentos = list(f.instrumentos).filter((i) => i && text(i.instrumento));
    const rows = especificos.map((objetivo, index) => {
        const propios = instrumentos.filter((i) => i.objetivo === `el objetivo específico ${index + 1}` || i.objetivo === 'todos los objetivos específicos');
        const tecnica = propios.map((i) => `${text(i.tecnica)}: ${text(i.instrumento)}${text(i.aplicaA) ? ` (${text(i.aplicaA)})` : ''}`).join('; ');
        return [index === 0 ? pregunta : '', index === 0 ? (general || text(d.objetivoGeneral)) : '', objetivo, index === 0 ? metodo : '', tecnica];
    });
    return { type: 'table', compact: true, head: ['Pregunta de investigación', 'Objetivo general', 'Objetivos específicos', 'Metodología', 'Técnicas e instrumentos'], rows };
};

const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Anexos: la matriz de consistencia (automática, se puede ocultar) y los que agregue el estudiante, p. ej. el instrumento completo.
const anexosBlocks = (d) => {
    const partes = [];
    const matriz = d.matrizOculta ? null : matrizConsistencia(d);
    if (matriz) partes.push({ titulo: 'Matriz de consistencia', blocks: [matriz] });
    // Instrumentos que el estudiante prefirió dejar como anexo (por defecto van dentro del Plan de análisis).
    list(d.instrumentosGen).forEach((ins) => {
        if (ins && ubicacionDe(ins) === 'anexo' && preguntasDe(ins).length > 0) partes.push({ titulo: text(ins.titulo) || 'Instrumento de recolección', blocks: bloquesInstrumento(ins) });
    });
    list(d.anexos).forEach((a) => {
        if (a && text(a.contenido)) partes.push({ titulo: text(a.titulo) || 'Anexo', blocks: cuerpo(a.contenido) });
    });
    return partes.flatMap((parte, i) => [{ type: 'heading', level: 2, text: `Anexo ${LETRAS[i] || i + 1}. ${parte.titulo}` }, ...parte.blocks]);
};

// Campos del proyecto que pertenecen a cada sección: sirven para restaurar una sección desde el historial.
export const CAMPOS_SECCION = {
    idea: ['idea', 'ideasIA'],
    titulo: ['titulo', 'tituloForm', 'tituloIA', 'titulosIA'],
    resumen: ['resumen', 'resumenForm', 'palabrasClave', 'abstract', 'keywords', 'abstractFuente', 'abstractManual'],
    preliminares: ['integrantes', 'director', 'ciudad', 'dedicatoria', 'agradecimientos', 'declaracionOriginalidad', 'declaracionExoneracion'],
    introduccion: ['introduccion', 'introduccionForm'],
    arbol: ['arbol'],
    arbolObjetivos: ['arbolObjetivos'],
    planteamiento: ['planteamiento', 'planteamientoForm'],
    pregunta: ['pregunta', 'preguntaForm', 'preguntaTipo'],
    objetivos: ['objetivos', 'objetivosForm', 'objetivoGeneral'],
    justificacion: ['justificacion', 'justificacionForm'],
    alcances: ['alcances', 'alcancesForm', 'limitaciones'],
    marco: ['marcoAntecedentes', 'marcoTeorico', 'marcoConceptual', 'marcoContextual', 'marcoLegal', 'marcoForm'],
    metodologia: ['metodologia', 'metodologiaForm', 'metEnfoque', 'metTipo', 'metDiseno', 'metPlanAnalisis', 'poblacionSugerida', 'poblacionTamano', 'poblacionTipo', 'muestraConfianza', 'muestraError', 'instrumentos', 'presupuesto', 'cronogramaItems', 'ganttPeriodos', 'ganttUnidad', 'enfoque', 'tipoInvestigacion', 'diseno', 'instrumentosGen'],
    fases: ['fases', 'fasesForm'],
    resultados: ['resultados', 'discusion', 'resultadosForm', 'elementos', 'cualitativo'],
    conclusiones: ['conclusiones', 'conclusionesForm', 'recomendaciones'],
    referencias: ['referencias'],
    anexos: ['anexos', 'matrizOculta'],
};

export const SECTIONS = [
    { id: 'titulo', label: 'Título', tab: 'titulo', blocks: (d) => (text(d.titulo) ? [{ type: 'paragraph', text: text(d.titulo) }] : []) },
    {
        id: 'resumen',
        label: 'Resumen',
        tab: 'resumen',
        // APA: un solo párrafo sin sangría y, debajo, las palabras clave.
        blocks: (d) => (text(d.resumen) ? [
            { type: 'plain', text: text(d.resumen) },
            ...(text(d.palabrasClave) ? [{ type: 'plain', text: `*Palabras clave:* ${text(d.palabrasClave)}.`, keywords: true }] : []),
        ] : []),
    },
    {
        id: 'abstract',
        label: 'Abstract',
        tab: 'resumen',
        extra: true,
        blocks: (d) => (text(d.abstract) ? [
            { type: 'plain', text: text(d.abstract) },
            ...(text(d.keywords) ? [{ type: 'plain', text: `*Keywords:* ${text(d.keywords)}.`, keywords: true }] : []),
        ] : []),
    },
    {
        id: 'preliminares',
        label: 'Preliminares',
        tab: 'resumen',
        extra: true,
        // Aparecen en cuanto el proyecto tiene título; el estudiante puede reemplazar el texto modelo.
        blocks: (d) => (text(d.titulo) ? [
            { type: 'heading', level: 2, text: 'Declaración de originalidad y autonomía' },
            ...cuerpo(text(d.declaracionOriginalidad) || DECLARACION_ORIGINALIDAD(text(d.titulo))),
            { type: 'heading', level: 2, text: 'Declaración de exoneración de responsabilidad' },
            ...cuerpo(text(d.declaracionExoneracion) || DECLARACION_EXONERACION()),
        ] : []),
    },
    { id: 'introduccion', label: 'Introducción', tab: 'introduccion', blocks: (d) => cuerpo(d.introduccion) },
    { id: 'planteamiento', label: 'Planteamiento del problema', tab: 'planteamiento', blocks: (d) => conArbol(d, cuerpo(d.planteamiento)) },
    { id: 'pregunta', label: 'Pregunta de investigación', tab: 'pregunta', blocks: (d) => cuerpo(d.pregunta) },
    { id: 'objetivos', label: 'Objetivos', tab: 'objetivos', blocks: (d) => conArbolObjetivos(d, objetivosBlocks(d.objetivos)) },
    { id: 'justificacion', label: 'Justificación', tab: 'justificacion', blocks: (d) => cuerpo(d.justificacion) },
    {
        id: 'alcances',
        label: 'Alcances y Limitaciones del Proyecto',
        tab: 'alcances',
        blocks: (d) => [...cuerpo(d.alcances), ...conSub('Limitaciones', d.limitaciones)],
    },
    {
        id: 'marco',
        label: 'Marco Referencial',
        tab: 'marco',
        blocks: (d) => conElementos(d, 'marco', BASE_ELEMENTOS.marco(d)),
    },
    {
        id: 'metodologia',
        label: 'Metodología',
        tab: 'metodologia',
        blocks: (d) => {
            // Versión anterior (solo enfoque, tipo, diseño y un texto libre).
            const legacy = !text(d.metEnfoque) && text(d.metodologia)
                ? [...([['Enfoque', d.enfoque], ['Tipo', d.tipoInvestigacion], ['Diseño', d.diseno]]
                    .filter(([, value]) => text(value))
                    .map(([label, value]) => `**${label}:** ${text(value)}`)
                    .reduce((acc, item) => { acc[0].items.push(item); return acc; }, [{ type: 'list', items: [] }])
                    .filter((block) => block.items.length)), ...cuerpo(d.metodologia)]
                : [];
            const crono = list(d.cronogramaItems);
            const cronoBlocks = crono.length
                ? [{ type: 'heading', level: 2, text: 'Cronograma' }, {
                    type: 'table',
                    caption: 'Cronograma de actividades',
                    head: ['Fase', 'Actividad', `${d.ganttUnidad === 'semanal' ? 'Semana' : 'Mes'} de inicio`, `${d.ganttUnidad === 'semanal' ? 'Semana' : 'Mes'} de fin`],
                    rows: crono.map((item) => [text(item.fase), text(item.actividad), String(item.inicio ?? ''), String(item.fin ?? '')]),
                }]
                : (() => {
                    const groups = list(d.gantt).map((group) => {
                        const activities = list(group.activities)
                            .map((activity) => text(activity.actividad || activity.nombre || activity.name || activity.title || activity.activity))
                            .filter(Boolean);
                        return [{ type: 'sub', text: text(group.title) || 'Objetivo' }, ...(activities.length ? [{ type: 'list', items: activities }] : [])];
                    }).flat();
                    const body = [...cuerpo(d.cronograma), ...groups];
                    return body.length ? [{ type: 'heading', level: 2, text: 'Cronograma' }, ...body] : [];
                })();
            const items = list(d.presupuesto);
            const total = items.reduce((sum, item) => sum + (Number(item.costo) || 0), 0);
            const presuBlocks = items.length
                ? [{ type: 'heading', level: 2, text: 'Presupuesto' }, {
                    type: 'table',
                    caption: 'Presupuesto del proyecto',
                    head: ['Rubro', 'Descripción', 'Fuente', 'Costo'],
                    rows: items.map((item) => [text(item.categoria), text(item.descripcion), text(item.fuente), money(item.costo)]),
                    foot: ['Total', '', '', money(total)],
                }]
                : [];
            return [
                ...legacy,
                ...titled('Enfoque de investigación', d.metEnfoque),
                ...titled('Tipos de investigación', d.metTipo),
                ...titled('Diseños de Investigación', d.metDiseno),
                ...titled('Población y muestra', d.poblacionSugerida),
                ...bloquesEcuaciones(d),
                ...conElementos(d, 'metodologia', BASE_ELEMENTOS.metodologia(d)),
                ...cronoBlocks,
                ...(crono.length ? ganttBlock(d) : []),
                ...presuBlocks,
            ];
        },
    },
    { id: 'fases', label: 'Desarrollo de las fases del proyecto', tab: 'fases', blocks: (d) => conElementos(d, 'fases', BASE_ELEMENTOS.fases(d)) },
    { id: 'resultados', label: 'Resultados y discusión', tab: 'resultados', blocks: (d) => [...conElementos(d, 'resultados', BASE_ELEMENTOS.resultados(d)), ...conSub('Discusión', d.discusion)] },
    { id: 'conclusiones', label: 'Conclusiones', tab: 'conclusiones', blocks: (d) => [...cuerpo(d.conclusiones), ...conSub('Recomendaciones', d.recomendaciones)] },
    {
        id: 'referencias',
        label: 'Referencias bibliográficas',
        tab: 'referencias',
        // Lista final en APA 7, en orden alfabético y con sangría francesa.
        blocks: (d) => ordenarReferencias(list(d.referencias)).map((ref) => ({ type: 'reference', text: referenciaAPA(ref) })),
    },
    { id: 'anexos', label: 'Anexos', tab: 'proyecto', extra: true, blocks: anexosBlocks },
    { id: 'idea', label: 'Idea de investigación', inDocument: false, tab: 'ideacion', blocks: (d) => ideaBlocks(d.idea) },
    // El árbol no es un capítulo: su figura va dentro del Planteamiento. Esta entrada solo marca el avance de su página.
    { id: 'arbol', label: 'Árbol del problema', inDocument: false, tab: 'arbol', blocks: arbolBlocks },
    { id: 'arbolObjetivos', label: 'Árbol de objetivos', inDocument: false, tab: 'arbolobjetivos', blocks: arbolObjetivosBlocks },
];

// Orden en que se construye el proyecto (menú y avance). El documento sigue el orden de SECTIONS.
export const BUILD_ORDER = ['ideacion', 'titulo', 'pregunta', 'arbol', 'arbolobjetivos', 'planteamiento', 'objetivos', 'justificacion', 'alcances', 'marco', 'metodologia', 'fases', 'resultados', 'conclusiones', 'introduccion', 'resumen', 'referencias'];

export const buildDocument = (data) => SECTIONS.map((section) => ({ ...section, content: section.blocks(data || {}) }));

/* ---------- Estructura numerada (como la plantilla institucional) ---------- */

// Sin número: preliminares del documento y referencias.
const SIN_NUMERO = new Set(['titulo', 'resumen', 'abstract', 'preliminares', 'referencias', 'anexos']);

// Devuelve las secciones visibles con su número («6 Marco Referencial», «6.1 Antecedentes», «7.5.1 …»).
// La pregunta de investigación pasa a ser «2.1 Formulación o Pregunta de Investigación» dentro del planteamiento.
export const documentoNumerado = (sections) => {
    const visibles = sections.filter((s) => s.content.length > 0 && s.inDocument !== false);
    const pregunta = visibles.find((s) => s.id === 'pregunta');
    const formulacion = pregunta ? [{ type: 'heading', level: 2, text: 'Formulación o Pregunta de Investigación' }, ...pregunta.content] : [];
    const conPlanteamiento = visibles.some((s) => s.id === 'planteamiento');
    const lista = visibles.flatMap((s) => {
        if (s.id === 'planteamiento') return [{ ...s, content: [...s.content, ...formulacion] }];
        if (s.id === 'pregunta') {
            if (conPlanteamiento) return [];
            const base = sections.find((x) => x.id === 'planteamiento') || {};
            return [{ ...base, id: 'planteamiento', label: base.label || 'Planteamiento del problema', content: formulacion }];
        }
        return [s];
    });
    // Tablas y figuras se numeran de corrido en todo el documento (Tabla 1, Figura 1…).
    let tablas = 0;
    let figuras = 0;
    const rotular = (b) => {
        if (b.type === 'table' && b.caption) { tablas += 1; return { ...b, rotulo: `Tabla ${tablas}` }; }
        if (b.type === 'figure' || b.type === 'gantt') { figuras += 1; return { ...b, rotulo: `Figura ${figuras}` }; }
        return b;
    };
    const rotulada = lista.map((s) => ({ ...s, content: s.content.map(rotular) }));
    // Citas a tablas y figuras: las marcas [[id]] se cambian por su número actual; si un elemento va después
    // de un párrafo y nadie lo cita, ese párrafo lo cita solo («(ver Tabla 2)»).
    const rotuloDe = new Map(rotulada.flatMap((s) => s.content).filter((b) => b.elementoId && b.rotulo).map((b) => [b.elementoId, b.rotulo]));
    const textos = (b) => (b.type === 'list' ? b.items : typeof b.text === 'string' ? [b.text] : []);
    const citados = new Set(rotulada.flatMap((s) => s.content).flatMap(textos).flatMap((t) => [...t.matchAll(MARCA)].map((m) => m[1])));
    const marcas = (t) => t.replace(MARCA, (_, id) => rotuloDe.get(id) || '').replace(/ {2,}/g, ' ');
    const citar = (b) => {
        if (b.type === 'list') return { ...b, items: b.items.map(marcas) };
        if (typeof b.text !== 'string' || b.type === 'heading') return b;
        let text = marcas(b.text);
        const faltan = (b.citaDe || []).filter((id) => !citados.has(id) && rotuloDe.has(id)).map((id) => rotuloDe.get(id));
        if (faltan.length) text = `${text.replace(/[.\s]+$/, '')} (ver ${faltan.join(' y ')}).`;
        return text === b.text ? b : { ...b, text };
    };
    let n = 0;
    return rotulada.map((s) => ({ ...s, content: s.content.map(citar) })).map((s) => {
        if (SIN_NUMERO.has(s.id)) {
            return { ...s, numero: '', titulo: s.label, content: s.content.map((b) => (b.type === 'heading' ? { ...b, numero: '', titulo: b.text } : b)) };
        }
        n += 1;
        let m = 0;
        let k = 0;
        const content = s.content.map((b) => {
            if (b.type !== 'heading') return b;
            if (b.level === 3 && m > 0) {
                k += 1;
                const numero = `${n}.${m}.${k}`;
                return { ...b, numero, titulo: `${numero} ${b.text}` };
            }
            m += 1;
            k = 0;
            const numero = `${n}.${m}`;
            return { ...b, level: 2, numero, titulo: `${numero} ${b.text}` };
        });
        return { ...s, numero: String(n), titulo: `${n} ${s.label}`, content };
    });
};

/* ---------- Exportación ---------- */

const escapeHtml = (value) => String(value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const inlineHtml = (value) => splitInline(value).map((part) => (part.bold ? `<b>${escapeHtml(part.text)}</b>` : part.italic ? `<i>${escapeHtml(part.text)}</i>` : escapeHtml(part.text))).join('');

const blockHtml = (block) => {
    if (block.type === 'heading') return block.level === 3 ? `<h4>${escapeHtml(block.titulo || block.text)}</h4>` : `<h3>${escapeHtml(block.titulo || block.text)}</h3>`;
    if (block.type === 'sub') return `<p class="sub"><b>${escapeHtml(block.text)}</b></p>`;
    if (block.type === 'list') return block.nums ? block.items.map((item, i) => `<p class="num">${block.nums[i]}. ${inlineHtml(item)}</p>`).join('') : `<ul>${block.items.map((item) => `<li>${inlineHtml(item)}</li>`).join('')}</ul>`;
    if (block.type === 'table') {
        const row = (cells, tag) => `<tr>${cells.map((cell) => `<${tag}>${escapeHtml(cell)}</${tag}>`).join('')}</tr>`;
        return `${block.caption ? `<p class="cap"><b>${block.rotulo || 'Tabla'}.</b> <i>${escapeHtml(block.caption)}</i></p>` : ''}<table>${row(block.head, 'th')}${block.rows.map((cells) => row(cells, 'td')).join('')}${block.foot ? row(block.foot, 'th') : ''}</table>${block.nota ? `<p class="cap"><i>Nota.</i> ${escapeHtml(block.nota)}</p>` : ''}`;
    }
    if (block.type === 'gantt') {
        const cols = Array.from({ length: block.total }, (_, i) => i + 1);
        return `<p class="cap"><b>${block.rotulo || 'Figura'}.</b> <i>${escapeHtml(block.caption)}</i></p><table><tr><th>Actividad</th>${cols.map((c) => `<th>${c}</th>`).join('')}</tr>${block.rows.map((r) => `<tr><td>${escapeHtml(r.actividad || r.fase)}</td>${cols.map((c) => `<td${c >= r.inicio && c <= r.fin ? ' style="background:#4f46e5"' : ''}>&nbsp;</td>`).join('')}</tr>`).join('')}</table><p class="cap"><i>Nota.</i> Las columnas corresponden a cada ${block.unidad.toLowerCase()} del proyecto.</p>`;
    }
    if (block.type === 'figure') return `<p class="cap"><b>${block.rotulo || 'Figura'}.</b> <i>${escapeHtml(block.caption)}</i> (la imagen se incluye en la versión .docx)</p>${block.nota ? `<p class="cap"><i>Nota.</i> ${escapeHtml(block.nota)}</p>` : ''}`;
    if (block.type === 'plain') return `<p class="${block.keywords ? 'pc' : 'abs'}">${escapeHtml(block.text).replace(/\*([^*]+)\*/g, '<i>$1</i>')}</p>`;
    if (block.type === 'reference') return `<p class="ref">${escapeHtml(block.text).replace(/\*([^*]+)\*/g, '<i>$1</i>')}</p>`;
    return `<p>${inlineHtml(block.text)}</p>`;
};

// Word abre HTML con extensión .doc y conserva títulos, listas y tablas.
export const documentHtml = (name, author, sections) => {
    const body = documentoNumerado(sections)
        .filter((section) => section.id !== 'titulo')
        .map((section) => `<h2>${escapeHtml(section.titulo)}</h2>${section.content.map(blockHtml).join('')}`)
        .join('');
    const title = sections.find((section) => section.id === 'titulo')?.content[0]?.text || name;
    // HTML con los espacios de nombres de Word: márgenes de página reales (no del cuerpo), vista de impresión y formato APA 7.
    return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40" lang="es">
<head><meta charset="utf-8"><title>${escapeHtml(name)}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]-->
<style>
@page WordSection1{size:21.59cm 27.94cm;margin:2.5cm 2.5cm 2.5cm 2.5cm;mso-header-margin:1.27cm;mso-footer-margin:1.27cm;mso-paper-source:0}
div.WordSection1{page:WordSection1}
body{font-family:"Times New Roman",serif;font-size:12pt;margin:0}
p,li,td,th{font-family:"Times New Roman",serif;font-size:12pt}
p{margin:0;line-height:150%;text-indent:1.25cm;text-align:justify}
p.sub,p.cap{text-indent:0;text-align:left}
p.num{text-indent:-0.6cm;margin-left:1.85cm}
p.ref{margin:0 0 0 1.27cm;text-indent:-1.27cm;line-height:150%}
p.abs{text-indent:0}
p.pc{text-indent:1.27cm}
h1{font-family:"Times New Roman",serif;font-size:12pt;font-weight:bold;text-align:center;line-height:150%;margin:0}
.autor{text-align:center;text-indent:0;margin:0 0 12pt}
h2{font-family:"Times New Roman",serif;font-size:12pt;font-weight:bold;text-align:center;line-height:150%;margin:12pt 0 0;page-break-after:avoid}
h3{font-family:"Times New Roman",serif;font-size:12pt;font-weight:bold;text-align:left;line-height:150%;margin:6pt 0 0;page-break-after:avoid}
h4{font-family:"Times New Roman",serif;font-size:12pt;font-weight:bold;font-style:italic;text-align:left;line-height:150%;margin:6pt 0 0;page-break-after:avoid}
ul{margin:0 0 0 1.27cm}
li{line-height:150%}
table{border-collapse:collapse;width:100%;margin:6pt 0}
th,td{border:1px solid #000;padding:3pt 5pt;text-align:left;font-size:11pt;line-height:115%;text-indent:0}
</style></head>
<body><div class="WordSection1"><h1>${escapeHtml(title)}</h1>${author ? `<p class="autor">${escapeHtml(author)}</p>` : ''}${body}</div></body></html>`;
};

export const documentText = (name, sections) => {
    const lines = [name.toUpperCase(), ''];
    documentoNumerado(sections).forEach((section) => {
        lines.push(section.titulo.toUpperCase());
        section.content.forEach((block) => {
            if (block.type === 'heading') lines.push('', block.titulo || block.text);
            else if (block.type === 'sub') lines.push('', block.text);
            else if (block.type === 'list') block.items.forEach((item, i) => lines.push(`${block.nums ? `${block.nums[i]}.` : '-'} ${item.replace(/\*\*/g, '')}`));
            else if (block.type === 'figure') lines.push(`[Figura: ${block.caption}]`);
            else if (block.type === 'gantt') block.rows.forEach((r) => lines.push(`- ${r.actividad || r.fase}: ${block.unidad.toLowerCase()} ${r.inicio} a ${r.fin}`));
            else if (block.type === 'table') {
                if (block.caption) lines.push(`Tabla: ${block.caption}`);
                block.rows.forEach((cells) => lines.push(`- ${cells.filter(Boolean).join(' | ')}`));
                if (block.foot) lines.push(block.foot.filter(Boolean).join(': '));
            } else lines.push(block.text.replace(/\*/g, ''));
        });
        lines.push('');
    });
    return lines.join('\n');
};
