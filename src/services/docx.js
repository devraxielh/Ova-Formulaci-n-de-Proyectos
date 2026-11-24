/*
 * Documento de Word real (.docx) en formato APA 7:
 * portada, tabla de contenido, numeración de páginas, Times New Roman 12, doble espacio,
 * sangría de primera línea, títulos por niveles, tablas y referencias con sangría francesa.
 */
import {
    AlignmentType, BorderStyle, Document, Header, HeadingLevel, LineRuleType, Packer, PageBreak, PageNumber,
    Paragraph, Table, TableCell, TableOfContents, TableRow, TextRun, WidthType,
} from 'docx';

const FUENTE = 'Times New Roman';
const TAM = 24; // medios puntos: 12 pt
const DOBLE = { line: 480, lineRule: LineRuleType.AUTO, before: 0, after: 0 };
const SANGRIA = 720; // 1,27 cm en twips

// «texto **negrita** y *cursiva*» → tramos de texto.
const tramos = (value, base = {}) => String(value ?? '').split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean).map((part) => {
    if (part.startsWith('**') && part.endsWith('**')) return new TextRun({ text: part.slice(2, -2), bold: true, ...base });
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return new TextRun({ text: part.slice(1, -1), italics: true, ...base });
    return new TextRun({ text: part, ...base });
});

const parrafo = (text, opciones = {}) => new Paragraph({
    spacing: DOBLE,
    indent: { firstLine: SANGRIA },
    alignment: AlignmentType.LEFT,
    children: tramos(text),
    ...opciones,
});

const celda = (text, { bold = false, top = false, bottom = false } = {}) => new TableCell({
    borders: {
        top: top ? { style: BorderStyle.SINGLE, size: 6, color: '000000' } : { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        bottom: bottom ? { style: BorderStyle.SINGLE, size: 6, color: '000000' } : { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    },
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ spacing: { line: 276, before: 0, after: 0 }, children: [new TextRun({ text: String(text ?? ''), bold, size: 22 })] })],
});

// Tabla en estilo APA: solo líneas horizontales (arriba, bajo el encabezado y al final).
const tabla = (block) => {
    const filas = [
        new TableRow({ tableHeader: true, children: block.head.map((h) => celda(h, { bold: true, top: true, bottom: true })) }),
        ...block.rows.map((row, i) => new TableRow({ children: row.map((c) => celda(c, { bottom: !block.foot && i === block.rows.length - 1 })) })),
        ...(block.foot ? [new TableRow({ children: block.foot.map((c) => celda(c, { bold: true, top: true, bottom: true })) })] : []),
    ];
    return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: filas });
};

const bloque = (block) => {
    if (block.type === 'heading') return [new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: block.text })] })];
    if (block.type === 'list') {
        return block.items.map((item) => new Paragraph({ spacing: DOBLE, bullet: { level: 0 }, children: tramos(item) }));
    }
    if (block.type === 'table') return [tabla(block), new Paragraph({ spacing: { before: 0, after: 120 }, children: [] })];
    if (block.type === 'reference') return [new Paragraph({ spacing: DOBLE, indent: { left: SANGRIA, hanging: SANGRIA }, children: tramos(block.text) })];
    if (block.type === 'plain') return [parrafo(block.text, { indent: { firstLine: block.keywords ? SANGRIA : 0 } })];
    return [parrafo(block.text)];
};

export const crearDocx = (name, author, sections) => {
    const visibles = sections.filter((s) => s.content.length > 0 && s.inDocument !== false);
    const titulo = visibles.find((s) => s.id === 'titulo')?.content[0]?.text || name;
    const cuerpo = visibles.filter((s) => s.id !== 'titulo');
    const centrado = (text, extra = {}) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: DOBLE, children: [new TextRun({ text, ...extra })] });
    const vacio = () => new Paragraph({ spacing: DOBLE, children: [] });
    const fecha = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long' });

    const portada = [
        vacio(), vacio(), vacio(),
        centrado(titulo, { bold: true }),
        vacio(),
        ...(author ? [centrado(author)] : []),
        centrado('Proyecto de investigación'),
        centrado(fecha.charAt(0).toUpperCase() + fecha.slice(1)),
        new Paragraph({ children: [new PageBreak()] }),
    ];

    const indice = cuerpo.length > 2 ? [
        centrado('Tabla de contenido', { bold: true }),
        new TableOfContents('Tabla de contenido', { hyperlink: true, headingStyleRange: '1-2' }),
        new Paragraph({ children: [new PageBreak()] }),
    ] : [];

    const contenido = cuerpo.flatMap((section, index) => {
        // Resumen y Referencias empiezan en página nueva; el texto después del resumen también.
        const nuevaPagina = index > 0 && (section.id === 'referencias' || cuerpo[index - 1].id === 'resumen');
        return [
            new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: nuevaPagina, children: [new TextRun({ text: section.label })] }),
            ...section.content.flatMap(bloque),
        ];
    });

    return new Document({
        creator: author || 'PROJECTSIA',
        title: titulo,
        description: 'Proyecto de investigación',
        features: { updateFields: indice.length > 0 },
        styles: {
            default: { document: { run: { font: FUENTE, size: TAM }, paragraph: { spacing: DOBLE } } },
            paragraphStyles: [
                { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FUENTE, size: TAM, bold: true, color: '000000' }, paragraph: { alignment: AlignmentType.CENTER, spacing: DOBLE, keepNext: true } },
                { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FUENTE, size: TAM, bold: true, color: '000000' }, paragraph: { alignment: AlignmentType.LEFT, spacing: DOBLE, keepNext: true } },
            ],
        },
        sections: [{
            properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
            headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ children: [PageNumber.CURRENT] })] })] }) },
            children: [...portada, ...indice, ...contenido],
        }],
    });
};

export const docxBlob = (name, author, sections) => Packer.toBlob(crearDocx(name, author, sections));
export const docxBuffer = (name, author, sections) => Packer.toBuffer(crearDocx(name, author, sections));
