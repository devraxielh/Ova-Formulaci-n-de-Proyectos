/*
 * Documento de Word real (.docx) con la estructura de la plantilla de proyectos:
 * portada (con el logo de la institución, si se elige) y portada interna, dedicatoria y agradecimientos opcionales,
 * tabla de contenido numerada, lista de tablas, preliminares con firmas y capítulos en página nueva.
 * Times New Roman 12, interlineado 1,5, texto justificado, márgenes de 2,5 cm y número de página arriba a la derecha.
 */
import { estimatePageNumbersWith } from 'docx/layout';
import {
    AlignmentType, Bookmark, BorderStyle, Document, InternalHyperlink, LeaderType, PageReference, Tab, TabStopType, Header, HeadingLevel, ImageRun, LineRuleType, Math as Ecuacion, MathFraction, MathRun, Packer, PageBreak, PageNumber,
    Paragraph, SequentialIdentifier, ShadingType, Table, TableCell, TableOfContents, TableRow, TextRun, WidthType,
} from 'docx';
import { documentoNumerado } from './projectDoc.js';

const FUENTE = 'Times New Roman';
const TAM = 24; // medios puntos: 12 pt
const LINEA = { line: 360, lineRule: LineRuleType.AUTO, before: 0, after: 0 }; // 1,5
const SANGRIA = 709; // 1,25 cm en twips

// «texto **negrita** y *cursiva*» → tramos de texto.
const tramos = (value, base = {}) => String(value ?? '').split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean).map((part) => {
    if (part.startsWith('**') && part.endsWith('**')) return new TextRun({ text: part.slice(2, -2), bold: true, ...base });
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return new TextRun({ text: part.slice(1, -1), italics: true, ...base });
    return new TextRun({ text: part, ...base });
});

const parrafo = (text, opciones = {}) => new Paragraph({
    spacing: LINEA,
    indent: { firstLine: SANGRIA },
    alignment: AlignmentType.JUSTIFIED,
    children: tramos(text),
    ...opciones,
});

const centrado = (text, extra = {}) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: LINEA, children: text ? [new TextRun({ text, ...extra })] : [] });
const vacios = (n) => Array.from({ length: n }, () => new Paragraph({ spacing: LINEA, children: [] }));
const salto = () => new Paragraph({ children: [new PageBreak()] });

const celda = (text, { bold = false, top = false, bottom = false, size = 20, fill, center = false, width } = {}) => new TableCell({
    ...(fill ? { shading: { type: ShadingType.CLEAR, color: 'auto', fill } } : {}),
    ...(width ? { width: { size: width, type: WidthType.PERCENTAGE } } : {}),
    borders: {
        top: top ? { style: BorderStyle.SINGLE, size: 6, color: '000000' } : { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        bottom: bottom ? { style: BorderStyle.SINGLE, size: 6, color: '000000' } : { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    },
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ spacing: { line: 240, before: 0, after: 0 }, alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT, children: [new TextRun({ text: String(text ?? ''), bold, size })] })],
});

// Rótulo APA: «Tabla N» o «Figura N» en negrita y, a continuación, el título en cursiva. El número es un campo de Word.
// Cada rótulo numerado lleva un marcador: las listas de tablas y de figuras enlazan a él y toman su página.
const anclaDe = (numero) => (numero ? `lista_${String(numero).toLowerCase().replace(/\s+/g, '_')}` : '');
const rotulo = (tipo, titulo, numero) => {
    const partes = [new TextRun({ text: `${tipo} `, bold: true }), new SequentialIdentifier(tipo), new TextRun({ text: ` ${titulo || ''}`, italics: true })];
    return new Paragraph({
        style: 'Caption',
        keepNext: true,
        children: numero ? [new Bookmark({ id: anclaDe(numero), children: partes })] : partes,
    });
};
// Ancho del texto en la página (carta, márgenes de 2,5 cm): donde va el número de página de cada entrada.
const ANCHO_TEXTO = 12240 - 1418 * 2;
// Una entrada de la lista de tablas o de figuras: «Tabla 1. Título ........ 12», con enlace al rótulo.
const entradaLista = (b) => new Paragraph({
    spacing: { before: 0, after: 120, line: 276 },
    indent: { left: 0, hanging: 0 },
    tabStops: [{ type: TabStopType.RIGHT, position: ANCHO_TEXTO, leader: LeaderType.DOT }],
    children: [
        new InternalHyperlink({ anchor: anclaDe(b.rotulo), children: [new TextRun({ text: `${b.rotulo}. ` }), new TextRun({ text: String(b.caption || ''), italics: true })] }),
        new TextRun({ children: [new Tab()] }),
        new PageReference(anclaDe(b.rotulo)),
    ],
});
const nota = (texto) => new Paragraph({ spacing: { before: 60, after: 240, line: 240 }, alignment: AlignmentType.LEFT, children: [new TextRun({ text: 'Nota. ', italics: true, size: 20 }), new TextRun({ text: texto, size: 20 })] });

// Tabla APA (solo líneas horizontales). Con título entra en la «Lista de tablas»; las de anexos van sin número.
const tabla = (block) => {
    const size = block.compact ? 16 : 20;
    const filas = [
        new TableRow({ tableHeader: true, children: block.head.map((h) => celda(h, { bold: true, top: true, bottom: true, size })) }),
        ...block.rows.map((row, i) => new TableRow({ children: row.map((c) => celda(c, { bottom: !block.foot && i === block.rows.length - 1, size })) })),
        ...(block.foot ? [new TableRow({ children: block.foot.map((c) => celda(c, { bold: true, top: true, bottom: true, size })) })] : []),
    ];
    return [
        ...(block.caption ? [rotulo('Tabla', block.caption, block.rotulo)] : []),
        new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: filas }),
        nota(block.nota || 'Elaboración propia.'),
    ];
};

// Diagrama de Gantt dibujado como cuadrícula: una fila por actividad y celdas sombreadas en los periodos que dura.
const gantt = (block) => {
    const cols = Array.from({ length: block.total }, (_, i) => i + 1);
    const ancho = Math.max(2, Math.floor(62 / block.total));
    const linea = { style: BorderStyle.SINGLE, size: 4, color: 'BFBFBF' };
    const celdaG = (texto, { bold = false, fill, center = false, width } = {}) => new TableCell({
        borders: { top: linea, bottom: linea, left: linea, right: linea },
        ...(fill ? { shading: { type: ShadingType.CLEAR, color: 'auto', fill } } : {}),
        ...(width ? { width: { size: width, type: WidthType.PERCENTAGE } } : {}),
        margins: { top: 40, bottom: 40, left: 60, right: 60 },
        children: [new Paragraph({ spacing: { line: 240, before: 0, after: 0 }, alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT, children: [new TextRun({ text: String(texto ?? ''), bold, size: 16 })] })],
    });
    const filas = [
        new TableRow({ tableHeader: true, children: [celdaG('Actividad', { bold: true, width: 100 - ancho * block.total, fill: 'F2F2F2' }), ...cols.map((c) => celdaG(String(c), { bold: true, center: true, width: ancho, fill: 'F2F2F2' }))] }),
        ...block.rows.map((r) => new TableRow({ children: [celdaG(r.actividad || r.fase), ...cols.map((c) => celdaG('', { fill: c >= r.inicio && c <= r.fin ? '4F46E5' : undefined }))] })),
    ];
    return [
        rotulo('Figura', block.caption, block.rotulo),
        new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: filas }),
        nota(`Las columnas corresponden a cada ${block.unidad.toLowerCase()} del proyecto. Elaboración propia.`),
    ];
};

// Figura subida por el estudiante; ancho máximo de la caja de texto (16,5 cm) y alto máximo de media página.
const figura = (block, imagenes) => {
    const img = imagenes?.[block.fileId];
    const MAX_W = 620;
    const MAX_H = 520;
    const w0 = block.w || img?.w || MAX_W;
    const h0 = block.h || img?.h || 400;
    const escala = Math.min(1, MAX_W / w0, MAX_H / h0);
    return [
        rotulo('Figura', block.caption, block.rotulo),
        img
            ? new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 60, line: 240 }, children: [new ImageRun({ type: img.type, data: img.data, transformation: { width: Math.round(w0 * escala), height: Math.round(h0 * escala) } })] })
            : centrado('[No se pudo incluir la imagen]'),
        nota(block.nota || 'Elaboración propia.'),
    ];
};

const bloque = (block, imagenes) => {
    if (block.type === 'gantt') return gantt(block);
    // Ecuación de Word (editable con el editor de ecuaciones), centrada.
    if (block.type === 'equation') {
        return [new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 120, line: 360 },
            children: [new Ecuacion({
                children: block.partes.map((parte) => (typeof parte === 'string'
                    ? new MathRun(parte)
                    : new MathFraction({ numerator: [new MathRun(parte.num)], denominator: [new MathRun(parte.den)] }))),
            })],
        })];
    }
    if (block.type === 'figure') return figura(block, imagenes);
    if (block.type === 'heading') {
        return [new Paragraph({ heading: block.level === 3 ? HeadingLevel.HEADING_3 : HeadingLevel.HEADING_2, children: [new TextRun({ text: block.titulo || block.text })] })];
    }
    if (block.type === 'sub') return [new Paragraph({ spacing: LINEA, keepNext: true, children: [new TextRun({ text: block.text, bold: true })] })];
    if (block.type === 'list' && block.nums) {
        return block.items.map((item, i) => new Paragraph({ spacing: LINEA, alignment: AlignmentType.JUSTIFIED, indent: { left: SANGRIA + 360, hanging: 360 }, children: [new TextRun({ text: `${block.nums[i]}. ` }), ...tramos(item)] }));
    }
    if (block.type === 'list') {
        return block.items.map((item) => new Paragraph({ spacing: LINEA, alignment: AlignmentType.JUSTIFIED, bullet: { level: 0 }, children: tramos(item) }));
    }
    if (block.type === 'table') return tabla(block);
    if (block.type === 'reference') return [new Paragraph({ spacing: LINEA, alignment: AlignmentType.LEFT, indent: { left: SANGRIA, hanging: SANGRIA }, children: tramos(block.text) })];
    if (block.type === 'plain') return [parrafo(block.text, { indent: { firstLine: block.keywords ? SANGRIA : 0 } })];
    return [parrafo(block.text)];
};

const fechaLarga = () => new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });

// Firma al final de cada declaración.
const firma = (author, lugarFecha) => [
    ...vacios(2),
    centrado('_______________________________'),
    centrado(author || '(Nombres y apellidos completos)'),
    ...vacios(1),
    centrado(`Firmado en ${lugarFecha}`),
];

/**
 * @param extra { ciudad, director, dedicatoria, agradecimientos, imagenes, logo } datos opcionales de portada y preliminares;
 *        logo = { data: Uint8Array, type: 'png' | 'jpg', width, height } de la institución, para la portada;
 *        imagenes = { [fileId]: { data: Uint8Array, type: 'png' | 'jpg', w, h } } para las figuras.
 */
export const crearDocx = (name, author, sections, extra = {}) => {
    const numeradas = documentoNumerado(sections);
    const titulo = numeradas.find((s) => s.id === 'titulo')?.content[0]?.text || name;
    const cuerpo = numeradas.filter((s) => s.id !== 'titulo');
    const ciudad = String(extra.ciudad || '').trim();
    const director = String(extra.director || '').trim();
    const lugarFecha = `${ciudad ? `${ciudad} ` : ''}${fechaLarga()}`;
    const autores = String(author || '').split(/\n|;/).map((a) => a.trim()).filter(Boolean);

    // Portada (con el logo de la institución, si se eligió una) y portada interna.
    // Va en las dos hojas de portada: cada una lleva su propio párrafo con la imagen.
    const hacerLogo = () => (extra.logo?.data && extra.logo.width > 0
        ? new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 240, line: 240 }, children: [new ImageRun({ type: extra.logo.type === 'png' ? 'png' : 'jpg', data: extra.logo.data, transformation: { width: extra.logo.width, height: extra.logo.height } })] })
        : null);
    const logo = hacerLogo();
    const logo2 = hacerLogo();
    const portada = [
        ...(logo ? [...vacios(1), logo, ...vacios(1)] : vacios(4)),
        centrado(titulo, { bold: true }),
        ...vacios(logo ? 4 : 5),
        centrado('Presentado por:'),
        ...autores.map((a) => centrado(a)),
        ...vacios(logo ? 4 : 6),
        centrado(lugarFecha),
        salto(),
        ...(logo2 ? [...vacios(1), logo2, ...vacios(1)] : vacios(4)),
        centrado(titulo, { bold: true }),
        ...vacios(logo2 ? 2 : 3),
        centrado('Presentado por:'),
        ...autores.map((a) => centrado(a)),
        ...(director ? [...vacios(2), centrado('Bajo la dirección de:'), ...director.split('\n').map((d) => centrado(d.trim()))] : []),
        ...vacios(logo2 ? (director ? 3 : 4) : director ? 4 : 6),
        centrado(lugarFecha),
        salto(),
    ];

    const pagina = (titulo2, texto) => (String(texto || '').trim() ? [
        centrado(titulo2, { bold: true }),
        ...String(texto).trim().split(/\n+/).map((t) => centrado(t.trim())),
        salto(),
    ] : []);
    const dedicatoria = [...pagina('Dedicatoria', extra.dedicatoria), ...pagina('Agradecimientos', extra.agradecimientos)];

    // Tablas y figuras numeradas del cuerpo, en orden (las de anexos no llevan número y no entran en las listas).
    const rotulados = cuerpo.flatMap((sec) => sec.content).filter((b) => b.rotulo && ((b.type === 'table' && b.caption) || b.type === 'figure' || b.type === 'gantt'));
    const hayTablas = rotulados.some((b) => b.type === 'table');
    const hayFiguras = rotulados.some((b) => b.type !== 'table');
    const bloques = (b) => bloque(b, extra.imagenes);
    const indice = [
        centrado('Tabla de contenido', { bold: true }),
        new TableOfContents('Tabla de contenido', { hyperlink: true, headingStyleRange: '1-3' }),
        salto(),
        // Las listas se escriben con sus entradas (no como campo para que Word las llene al actualizar):
        // cada entrada enlaza a su rótulo y su página la calcula la estimación de páginas.
        ...(hayTablas ? [
            centrado('Lista de tablas', { bold: true }),
            ...rotulados.filter((b) => b.type === 'table').map(entradaLista),
            salto(),
        ] : []),
        ...(hayFiguras ? [
            centrado('Lista de figuras', { bold: true }),
            ...rotulados.filter((b) => b.type !== 'table').map(entradaLista),
            salto(),
        ] : []),
    ];

    const contenido = cuerpo.flatMap((section, index) => {
        if (section.id === 'preliminares') {
            // Preliminares (nivel 2) y cada declaración (nivel 3, centrada) con su firma, cada una en página propia.
            let primera = true;
            const partes = [];
            section.content.forEach((b) => {
                if (b.type === 'heading') {
                    if (!primera) partes.push(...firma(autores.join(', '), lugarFecha));
                    partes.push(new Paragraph({ heading: HeadingLevel.HEADING_3, alignment: AlignmentType.CENTER, pageBreakBefore: !primera, children: [new TextRun({ text: b.text })] }));
                    primera = false;
                } else partes.push(...bloques(b));
            });
            partes.push(...firma(autores.join(', '), lugarFecha));
            return [new Paragraph({ heading: HeadingLevel.HEADING_2, pageBreakBefore: index > 0, children: [new TextRun({ text: section.titulo })] }), ...partes];
        }
        return [
            new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: index > 0, children: [new TextRun({ text: section.titulo })] }),
            ...section.content.flatMap(bloques),
        ];
    });

    return new Document({
        creator: autores.join(', ') || 'PROJECTSIA',
        title: titulo,
        description: 'Proyecto de investigación',
        // Los números de página de la tabla de contenido y de las listas se calculan aquí y se escriben en el archivo.
        // Así Word abre el documento sin preguntar «¿Deseas actualizar los campos de este documento?».
        // Con `guess`, la estimación no se detiene en lo que no sabe medir (p. ej. un símbolo de una ecuación):
        // sigue con su mejor cálculo, así el índice nunca queda con números en blanco.
        pageNumbers: estimatePageNumbersWith({ guess: true }),
        styles: {
            default: { document: { run: { font: FUENTE, size: TAM }, paragraph: { spacing: LINEA, alignment: AlignmentType.JUSTIFIED } } },
            paragraphStyles: [
                { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FUENTE, size: TAM, bold: true, color: '000000' }, paragraph: { alignment: AlignmentType.CENTER, spacing: { ...LINEA, after: 240 }, keepNext: true, keepLines: true } },
                { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FUENTE, size: TAM, bold: true, color: '000000' }, paragraph: { alignment: AlignmentType.LEFT, spacing: { ...LINEA, before: 240, after: 240 }, keepNext: true, keepLines: true } },
                { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FUENTE, size: TAM, bold: true, italics: true, color: '000000' }, paragraph: { alignment: AlignmentType.LEFT, spacing: { ...LINEA, before: 240, after: 120 }, keepNext: true, keepLines: true } },
                { id: 'Caption', name: 'caption', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FUENTE, size: TAM, color: '000000' }, paragraph: { alignment: AlignmentType.LEFT, spacing: { line: 240, before: 120, after: 120 } } },
                { id: 'TOC1', name: 'toc 1', basedOn: 'Normal', next: 'Normal', run: { font: FUENTE, size: 22, bold: true }, paragraph: { spacing: { before: 120, after: 120, line: 240 }, alignment: AlignmentType.LEFT } },
                { id: 'TOC2', name: 'toc 2', basedOn: 'Normal', next: 'Normal', run: { font: FUENTE, size: 22 }, paragraph: { spacing: { before: 60, after: 60, line: 240 }, indent: { left: 238 }, alignment: AlignmentType.LEFT } },
                { id: 'TOC3', name: 'toc 3', basedOn: 'Normal', next: 'Normal', run: { font: FUENTE, size: 22 }, paragraph: { spacing: { before: 60, after: 60, line: 240 }, indent: { left: 442 }, alignment: AlignmentType.LEFT } },
            ],
        },
        sections: [{
            properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1418, right: 1418, bottom: 1418, left: 1418, header: 709, footer: 709 } } },
            headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ children: [PageNumber.CURRENT], size: 20 })] })] }) },
            children: [...portada, ...dedicatoria, ...indice, ...contenido],
        }],
    });
};

export const docxBlob = (name, author, sections, extra) => Packer.toBlob(crearDocx(name, author, sections, extra));
export const docxBuffer = (name, author, sections, extra) => Packer.toBuffer(crearDocx(name, author, sections, extra));
