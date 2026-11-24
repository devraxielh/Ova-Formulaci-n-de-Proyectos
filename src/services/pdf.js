/*
 * PDF del proyecto con la misma estructura del Word: portadas, tabla de contenido con números de página,
 * listas de tablas y figuras, preliminares con firma, capítulos en página nueva y número de página arriba a la derecha.
 * Usa Tinos (equivalente libre de Times New Roman, mismas medidas), que se descarga solo al exportar.
 */
import pdfMake from 'pdfmake/build/pdfmake';
import { documentoNumerado } from './projectDoc.js';

const CM = 28.35;
const MARGEN = 2.5 * CM;
const SANGRIA = 1.25 * CM;
const ANCHO = 612 - 2 * MARGEN;

// «texto **negrita** y *cursiva*» → tramos de pdfmake.
const tramos = (value) => String(value ?? '').split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean).map((part) => {
    if (part.startsWith('**') && part.endsWith('**')) return { text: part.slice(2, -2), bold: true };
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return { text: part.slice(1, -1), italics: true };
    return { text: part };
});

const centrado = (text, extra = {}) => ({ text: text || ' ', alignment: 'center', ...extra });
const vacios = (n) => Array.from({ length: n }, () => ({ text: ' ' }));
const fechaLarga = () => new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });

// Solo líneas horizontales arriba, bajo el encabezado y al final (tabla APA).
const lineasApa = (filasEncabezado, conPie) => ({
    hLineWidth: (i, node) => (i === 0 || i === filasEncabezado || i === node.table.body.length || (conPie && i === node.table.body.length - 1) ? 0.75 : 0),
    vLineWidth: () => 0,
    paddingTop: () => 3,
    paddingBottom: () => 3,
});

const rotulo = (block, lista) => ({
    text: [{ text: `${block.rotulo} `, bold: true }, { text: block.caption || '', italics: true }],
    alignment: 'left', lineHeight: 1.15, margin: [0, 8, 0, 4], tocItem: lista, headlineLevel: 9,
});
const nota = (texto) => ({ text: [{ text: 'Nota. ', italics: true }, texto], fontSize: 10, lineHeight: 1.15, alignment: 'left', margin: [0, 4, 0, 10] });

const bloque = (block, imagenes) => {
    if (block.type === 'heading') {
        return [{ text: block.titulo || block.text, bold: true, italics: block.level === 3, alignment: 'left', margin: [0, 10, 0, 6], tocItem: 'indice', tocMargin: [block.level === 3 ? 24 : 12, 0, 0, 0], headlineLevel: block.level }];
    }
    // En PDF la ecuación va en una sola línea, centrada (la fracción dibujada es de la pantalla y de Word).
    if (block.type === 'equation') return [{ text: block.linea, alignment: 'center', italics: true, margin: [0, 4, 0, 4] }];
    if (block.type === 'sub') return [{ text: block.text, bold: true, alignment: 'left', headlineLevel: 9 }];
    if (block.type === 'list' && block.nums) return block.items.map((item, i) => ({ columns: [{ width: 22, text: `${block.nums[i]}.`, alignment: 'left' }, { width: '*', text: tramos(item) }], margin: [SANGRIA, 0, 0, 0] }));
    if (block.type === 'list') return [{ ul: block.items.map((item) => ({ text: tramos(item) })), margin: [SANGRIA, 0, 0, 0] }];
    if (block.type === 'table') {
        const size = block.compact ? 8 : 10;
        const fila = (cells, bold) => cells.map((c) => ({ text: String(c ?? ''), bold, fontSize: size, lineHeight: 1.1, alignment: 'left' }));
        return [
            ...(block.caption ? [rotulo(block, 'tablas')] : []),
            { table: { headerRows: 1, widths: block.head.map(() => '*'), body: [fila(block.head, true), ...block.rows.map((r) => fila(r, false)), ...(block.foot ? [fila(block.foot, true)] : [])] }, layout: lineasApa(1, Boolean(block.foot)) },
            nota(block.nota || 'Elaboración propia.'),
        ];
    }
    if (block.type === 'gantt') {
        const cols = Array.from({ length: block.total }, (_, i) => i + 1);
        const celda = (text, extra = {}) => ({ text, fontSize: 8, lineHeight: 1.05, alignment: 'left', ...extra });
        return [
            rotulo(block, 'figuras'),
            {
                table: {
                    headerRows: 1,
                    widths: ['*', ...cols.map(() => Math.max(9, Math.floor(280 / block.total)))],
                    body: [
                        [celda('Actividad', { bold: true, fillColor: '#f2f2f2' }), ...cols.map((c) => celda(String(c), { bold: true, alignment: 'center', fillColor: '#f2f2f2' }))],
                        ...block.rows.map((r) => [celda(r.actividad || r.fase), ...cols.map((c) => celda(' ', c >= r.inicio && c <= r.fin ? { fillColor: '#4f46e5' } : {}))]),
                    ],
                },
                layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5, hLineColor: () => '#bfbfbf', vLineColor: () => '#bfbfbf' },
            },
            nota(`Las columnas corresponden a cada ${block.unidad.toLowerCase()} del proyecto. Elaboración propia.`),
        ];
    }
    if (block.type === 'figure') {
        const img = imagenes?.[block.fileId];
        return [
            { stack: [rotulo(block, 'figuras'), img ? { image: img.dataUrl, fit: [ANCHO, 380], alignment: 'center' } : centrado('[No se pudo incluir la imagen]')], unbreakable: true },
            nota(block.nota || 'Elaboración propia.'),
        ];
    }
    if (block.type === 'reference') return [{ text: tramos(block.text), alignment: 'left', leadingIndent: -SANGRIA, margin: [SANGRIA, 0, 0, 0] }];
    if (block.type === 'plain') return [{ text: tramos(block.text), leadingIndent: block.keywords ? SANGRIA : 0 }];
    return [{ text: tramos(block.text), leadingIndent: SANGRIA }];
};

let fuentesListas = false;
const prepararFuentes = () => {
    if (fuentesListas) return;
    const base = `${window.location.origin}/fonts/`;
    pdfMake.setUrlAccessPolicy((url) => url.startsWith(window.location.origin));
    pdfMake.setFonts({
        Tinos: {
            normal: `${base}Tinos_400Regular.ttf`,
            bold: `${base}Tinos_700Bold.ttf`,
            italics: `${base}Tinos_400Regular_Italic.ttf`,
            bolditalics: `${base}Tinos_700Bold_Italic.ttf`,
        },
    });
    fuentesListas = true;
};

/** @param extra { ciudad, director, dedicatoria, agradecimientos, imagenes: { [fileId]: { dataUrl } } } */
export const definicionPdf = (name, author, sections, extra = {}) => {
    const numeradas = documentoNumerado(sections);
    const titulo = numeradas.find((s) => s.id === 'titulo')?.content[0]?.text || name;
    const cuerpo = numeradas.filter((s) => s.id !== 'titulo');
    const ciudad = String(extra.ciudad || '').trim();
    const director = String(extra.director || '').trim();
    const lugarFecha = `${ciudad ? `${ciudad} ` : ''}${fechaLarga()}`;
    const autores = String(author || '').split(/\n|;/).map((a) => a.trim()).filter(Boolean);
    const firma = () => [...vacios(2), centrado('_______________________________'), centrado(autores.join(', ') || '(Nombres y apellidos completos)'), ...vacios(1), centrado(`Firmado en ${lugarFecha}`)];

    const portada = [
        ...vacios(4), centrado(titulo, { bold: true }), ...vacios(5), centrado('Presentado por:'), ...autores.map((a) => centrado(a)), ...vacios(6), centrado(lugarFecha),
        { text: ' ', pageBreak: 'before' },
        ...vacios(3), centrado(titulo, { bold: true }), ...vacios(3), centrado('Presentado por:'), ...autores.map((a) => centrado(a)),
        ...(director ? [...vacios(2), centrado('Bajo la dirección de:'), ...director.split('\n').map((d) => centrado(d.trim()))] : []),
        ...vacios(director ? 4 : 6), centrado(lugarFecha),
    ];
    const pagina = (t, texto) => (String(texto || '').trim() ? [centrado(t, { bold: true, pageBreak: 'before' }), ...String(texto).trim().split(/\n+/).map((x) => centrado(x.trim()))] : []);

    const hayTablas = cuerpo.some((s) => s.content.some((b) => b.type === 'table' && b.caption));
    const hayFiguras = cuerpo.some((s) => s.content.some((b) => b.type === 'figure' || b.type === 'gantt'));
    const lista = (id, t) => ({ toc: { id, title: centrado(t, { bold: true, margin: [0, 0, 0, 8] }), textStyle: { fontSize: 11, lineHeight: 1.6, alignment: 'left' }, numberStyle: { fontSize: 11 } }, pageBreak: 'before' });
    const indices = [lista('indice', 'Tabla de contenido'), ...(hayTablas ? [lista('tablas', 'Lista de tablas')] : []), ...(hayFiguras ? [lista('figuras', 'Lista de figuras')] : [])];

    const contenido = cuerpo.flatMap((section) => {
        if (section.id === 'preliminares') {
            const partes = [];
            let primera = true;
            section.content.forEach((b) => {
                if (b.type === 'heading') {
                    if (!primera) partes.push(...firma());
                    partes.push({ text: b.text, bold: true, italics: true, alignment: 'center', margin: [0, 6, 0, 8], tocItem: 'indice', tocMargin: [24, 0, 0, 0], ...(primera ? {} : { pageBreak: 'before' }) });
                    primera = false;
                } else partes.push(...bloque(b));
            });
            return [{ text: section.titulo, bold: true, alignment: 'left', pageBreak: 'before', tocItem: 'indice', tocMargin: [12, 0, 0, 0], margin: [0, 0, 0, 8] }, ...partes, ...firma()];
        }
        return [
            { text: section.titulo, bold: true, alignment: 'center', pageBreak: 'before', tocItem: 'indice', tocStyle: { bold: true }, margin: [0, 0, 0, 10], headlineLevel: 1 },
            ...section.content.flatMap((b) => bloque(b, extra.imagenes)),
        ];
    });

    return {
        info: { title: titulo, author: autores.join(', ') || 'PROJECTSIA', subject: 'Proyecto de investigación' },
        pageSize: 'LETTER',
        pageMargins: [MARGEN, MARGEN, MARGEN, MARGEN],
        header: (page) => ({ text: String(page), alignment: 'right', fontSize: 10, margin: [0, 1.25 * CM, MARGEN, 0] }),
        defaultStyle: { font: 'Tinos', fontSize: 12, lineHeight: 1.5, alignment: 'justify' },
        // Un título o un rótulo no se queda solo al final de la página.
        pageBreakBefore: (node, q) => Boolean(node.headlineLevel) && !node.pageBreak && q.getNodesOnNextPage().length > 0 && q.getFollowingNodesOnPage().length === 0,
        content: [...portada, ...pagina('Dedicatoria', extra.dedicatoria), ...pagina('Agradecimientos', extra.agradecimientos), ...indices, ...contenido],
    };
};

export const pdfBlob = (name, author, sections, extra) => {
    prepararFuentes();
    return pdfMake.createPdf(definicionPdf(name, author, sections, extra)).getBlob();
};
