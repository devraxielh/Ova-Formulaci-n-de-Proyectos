import { ordenarReferencias, referenciaAPA } from './apa.js';

// Arma el documento del proyecto a partir de lo guardado en cada herramienta.
// Cada sección produce "bloques" neutros que se pintan en pantalla o se exportan a Word.

const text = (value) => (typeof value === 'string' ? value.trim() : '');
const list = (value) => (Array.isArray(value) ? value : []);

// Convierte el texto de la IA (Markdown sencillo) en bloques: títulos, listas y párrafos.
export const parseBlocks = (raw) => {
    const blocks = [];
    let items = null;
    const flush = () => {
        if (items) blocks.push({ type: 'list', items });
        items = null;
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
        const bullet = trimmed.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);
        if (bullet) {
            items = items || [];
            items.push(bullet[1]);
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

const titled = (label, raw) => (text(raw) ? [{ type: 'heading', text: label }, ...parseBlocks(raw)] : []);

const money = (value) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(value) || 0);

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
    { id: 'introduccion', label: 'Introducción', tab: 'introduccion', blocks: (d) => parseBlocks(d.introduccion) },
    { id: 'planteamiento', label: 'Planteamiento del problema', tab: 'planteamiento', blocks: (d) => parseBlocks(d.planteamiento) },
    { id: 'pregunta', label: 'Pregunta de investigación', tab: 'pregunta', blocks: (d) => parseBlocks(d.pregunta) },
    { id: 'objetivos', label: 'Objetivos', tab: 'objetivos', blocks: (d) => parseBlocks(d.objetivos) },
    { id: 'justificacion', label: 'Justificación', tab: 'justificacion', blocks: (d) => parseBlocks(d.justificacion) },
    {
        id: 'alcances',
        label: 'Alcances y limitaciones',
        tab: 'alcances',
        blocks: (d) => [...parseBlocks(d.alcances), ...titled('Limitaciones', d.limitaciones)],
    },
    {
        id: 'marco',
        label: 'Marco referencial',
        tab: 'marco',
        blocks: (d) => [
            ...titled('Antecedentes', d.marcoAntecedentes),
            ...titled('Marco Teórico', d.marcoTeorico),
            ...titled('Marco Conceptual', d.marcoConceptual),
            ...titled('Marco Contextual', d.marcoContextual),
            ...titled('Marco Legal', d.marcoLegal),
        ],
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
                    .filter((block) => block.items.length)), ...parseBlocks(d.metodologia)]
                : [];
            const crono = list(d.cronogramaItems);
            const cronoBlocks = crono.length
                ? [{ type: 'heading', text: 'Cronograma' }, {
                    type: 'table',
                    head: ['Fase', 'Actividad', `${d.ganttUnidad === 'semanal' ? 'Semana' : 'Mes'} de inicio`, `${d.ganttUnidad === 'semanal' ? 'Semana' : 'Mes'} de fin`],
                    rows: crono.map((item) => [text(item.fase), text(item.actividad), String(item.inicio ?? ''), String(item.fin ?? '')]),
                }]
                : (() => {
                    const groups = list(d.gantt).map((group) => {
                        const activities = list(group.activities)
                            .map((activity) => text(activity.actividad || activity.nombre || activity.name || activity.title || activity.activity))
                            .filter(Boolean);
                        return [{ type: 'heading', text: text(group.title) || 'Objetivo' }, ...(activities.length ? [{ type: 'list', items: activities }] : [])];
                    }).flat();
                    const body = [...parseBlocks(d.cronograma), ...groups];
                    return body.length ? [{ type: 'heading', text: 'Cronograma' }, ...body] : [];
                })();
            const items = list(d.presupuesto);
            const total = items.reduce((sum, item) => sum + (Number(item.costo) || 0), 0);
            const presuBlocks = items.length
                ? [{ type: 'heading', text: 'Presupuesto' }, {
                    type: 'table',
                    head: ['Rubro', 'Descripción', 'Fuente', 'Costo'],
                    rows: items.map((item) => [text(item.categoria), text(item.descripcion), text(item.fuente), money(item.costo)]),
                    foot: ['Total', '', '', money(total)],
                }]
                : [];
            return [
                ...legacy,
                ...titled('Enfoque de investigación', d.metEnfoque),
                ...titled('Tipos de investigación', d.metTipo),
                ...titled('Diseños de investigación', d.metDiseno),
                ...titled('Población y muestra', d.poblacionSugerida),
                ...titled('Plan de análisis de la información', d.metPlanAnalisis),
                ...titled('Instrumentos de recolección de información', d.instrumentos),
                ...cronoBlocks,
                ...presuBlocks,
            ];
        },
    },
    { id: 'fases', label: 'Desarrollo de las fases del proyecto', tab: 'fases', blocks: (d) => parseBlocks(d.fases) },
    { id: 'resultados', label: 'Resultados y discusión', tab: 'resultados', blocks: (d) => [...titled('Resultados', d.resultados), ...titled('Discusión', d.discusion)] },
    { id: 'conclusiones', label: 'Conclusiones', tab: 'conclusiones', blocks: (d) => [...parseBlocks(d.conclusiones), ...titled('Recomendaciones', d.recomendaciones)] },
    {
        id: 'referencias',
        label: 'Referencias',
        tab: 'referencias',
        // Lista final en APA 7, en orden alfabético y con sangría francesa.
        blocks: (d) => ordenarReferencias(list(d.referencias)).map((ref) => ({ type: 'reference', text: referenciaAPA(ref) })),
    },
    { id: 'idea', label: 'Idea de investigación', inDocument: false, tab: 'ideacion', blocks: (d) => ideaBlocks(d.idea) },
];

// Orden en que se construye el proyecto (menú y avance). El documento sigue el orden de SECTIONS.
export const BUILD_ORDER = ['ideacion', 'titulo', 'pregunta', 'planteamiento', 'objetivos', 'justificacion', 'alcances', 'marco', 'metodologia', 'fases', 'resultados', 'conclusiones', 'introduccion', 'resumen', 'referencias'];

export const buildDocument = (data) => SECTIONS.map((section) => ({ ...section, content: section.blocks(data || {}) }));

/* ---------- Exportación ---------- */

const escapeHtml = (value) => String(value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const inlineHtml = (value) => splitBold(value).map((part) => (part.bold ? `<b>${escapeHtml(part.text)}</b>` : escapeHtml(part.text))).join('');

const blockHtml = (block) => {
    if (block.type === 'heading') return `<h3>${escapeHtml(block.text)}</h3>`;
    if (block.type === 'list') return `<ul>${block.items.map((item) => `<li>${inlineHtml(item)}</li>`).join('')}</ul>`;
    if (block.type === 'table') {
        const row = (cells, tag) => `<tr>${cells.map((cell) => `<${tag}>${escapeHtml(cell)}</${tag}>`).join('')}</tr>`;
        return `<table>${row(block.head, 'th')}${block.rows.map((cells) => row(cells, 'td')).join('')}${block.foot ? row(block.foot, 'th') : ''}</table>`;
    }
    if (block.type === 'plain') return `<p class="${block.keywords ? 'pc' : 'abs'}">${escapeHtml(block.text).replace(/\*([^*]+)\*/g, '<i>$1</i>')}</p>`;
    if (block.type === 'reference') return `<p class="ref">${escapeHtml(block.text).replace(/\*([^*]+)\*/g, '<i>$1</i>')}</p>`;
    return `<p>${inlineHtml(block.text)}</p>`;
};

// Word abre HTML con extensión .doc y conserva títulos, listas y tablas.
export const documentHtml = (name, author, sections) => {
    const body = sections
        .filter((section) => section.content.length > 0 && section.id !== 'titulo' && section.inDocument !== false)
        .map((section) => `<h2>${escapeHtml(section.label)}</h2>${section.content.map(blockHtml).join('')}`)
        .join('');
    const title = sections.find((section) => section.id === 'titulo')?.content[0]?.text || name;
    // HTML con los espacios de nombres de Word: márgenes de página reales (no del cuerpo), vista de impresión y formato APA 7.
    return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40" lang="es">
<head><meta charset="utf-8"><title>${escapeHtml(name)}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]-->
<style>
@page WordSection1{size:21.59cm 27.94cm;margin:2.54cm 2.54cm 2.54cm 2.54cm;mso-header-margin:1.27cm;mso-footer-margin:1.27cm;mso-paper-source:0}
div.WordSection1{page:WordSection1}
body{font-family:"Times New Roman",serif;font-size:12pt;margin:0}
p,li,td,th{font-family:"Times New Roman",serif;font-size:12pt}
p{margin:0;line-height:200%;text-indent:1.27cm;text-align:left}
p.ref{margin:0 0 0 1.27cm;text-indent:-1.27cm;line-height:200%}
p.abs{text-indent:0}
p.pc{text-indent:1.27cm}
h1{font-family:"Times New Roman",serif;font-size:12pt;font-weight:bold;text-align:center;line-height:200%;margin:0}
.autor{text-align:center;text-indent:0;margin:0 0 12pt}
h2{font-family:"Times New Roman",serif;font-size:12pt;font-weight:bold;text-align:center;line-height:200%;margin:12pt 0 0;page-break-after:avoid}
h3{font-family:"Times New Roman",serif;font-size:12pt;font-weight:bold;text-align:left;line-height:200%;margin:6pt 0 0;page-break-after:avoid}
ul{margin:0 0 0 1.27cm}
li{line-height:200%}
table{border-collapse:collapse;width:100%;margin:6pt 0}
th,td{border:1px solid #000;padding:3pt 5pt;text-align:left;font-size:11pt;line-height:115%;text-indent:0}
</style></head>
<body><div class="WordSection1"><h1>${escapeHtml(title)}</h1>${author ? `<p class="autor">${escapeHtml(author)}</p>` : ''}${body}</div></body></html>`;
};

export const documentText = (name, sections) => {
    const lines = [name.toUpperCase(), ''];
    sections.filter((section) => section.content.length > 0 && section.inDocument !== false).forEach((section) => {
        lines.push(section.label.toUpperCase());
        section.content.forEach((block) => {
            if (block.type === 'heading') lines.push('', block.text);
            else if (block.type === 'list') block.items.forEach((item) => lines.push(`- ${item.replace(/\*\*/g, '')}`));
            else if (block.type === 'table') {
                block.rows.forEach((cells) => lines.push(`- ${cells.filter(Boolean).join(' | ')}`));
                if (block.foot) lines.push(block.foot.filter(Boolean).join(': '));
            } else lines.push(block.text.replace(/\*/g, ''));
        });
        lines.push('');
    });
    return lines.join('\n');
};
