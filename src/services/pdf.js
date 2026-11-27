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

// Entradas de la tabla de contenido y de las listas de tablas y figuras. Cada título anotado recibe un `id`;
// con él se averigua en qué página quedó y se enlaza desde su entrada. Se reinicia en cada `definicionPdf`.
let entradas = [];
const enIndice = (lista, nodo, { texto, margen = 0, negrita = false }) => {
    const id = `ix${entradas.length}`;
    entradas.push({ lista, id, texto: String(texto || ''), margen, negrita });
    return { ...nodo, id };
};
const romano = (n) => [[10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i']].reduce(([resto, txt], [v, r]) => { let t = txt; let q = resto; while (q >= v) { t += r; q -= v; } return [q, t]; }, [Math.max(0, Math.min(Number(n) || 0, 39)), ''])[1];
// Número que se muestra para una página: las preliminares van en romanos y la numeración arábiga
// empieza en 1 en la primera sección numerada (la Introducción).
export const numeroDePagina = (pagina, inicio) => {
    if (!pagina) return '';
    if (!inicio) return String(pagina);
    return pagina >= inicio ? String(pagina - inicio + 1) : romano(pagina);
};

const rotulo = (block, lista) => enIndice(lista, {
    text: [{ text: `${block.rotulo} `, bold: true }, { text: block.caption || '', italics: true }],
    alignment: 'left', lineHeight: 1.15, margin: [0, 8, 0, 4], headlineLevel: 9,
}, { texto: `${block.rotulo}. ${block.caption || ''}` });
const nota = (texto) => ({ text: [{ text: 'Nota. ', italics: true }, texto], fontSize: 10, lineHeight: 1.15, alignment: 'left', margin: [0, 4, 0, 10] });

const bloque = (block, imagenes) => {
    if (block.type === 'heading') {
        return [enIndice('indice', { text: block.titulo || block.text, bold: true, italics: block.level === 3, alignment: 'left', margin: [0, 10, 0, 6], headlineLevel: block.level }, { texto: block.titulo || block.text, margen: block.level === 3 ? 24 : 12 })];
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

/**
 * @param extra { ciudad, director, dedicatoria, agradecimientos, logo: { dataUrl, width, height }, imagenes: { [fileId]: { dataUrl } } }
 * @param numeros { paginas: { [id]: página }, inicio } de una pasada anterior: con ellos se escriben los números del índice
 *        y del encabezado. Sin ellos (primera pasada) el índice sale sin números y `registro` recoge las páginas.
 * @param registro objeto que se llena con { paginas, inicioId } al componer el PDF.
 */
// Título del índice que empieza página: el salto va en un bloque que lo envuelve, porque la biblioteca no informa
// la página de un bloque que trae su propio salto, y esa página se necesita para el índice.
const enPaginaNueva = (nodo) => ({ stack: [nodo], pageBreak: 'before' });

export const definicionPdf = (name, author, sections, extra = {}, numeros = null, registro = null) => {
    entradas = [];
    let inicioId = '';
    const numeradas = documentoNumerado(sections);
    const titulo = numeradas.find((s) => s.id === 'titulo')?.content[0]?.text || name;
    const cuerpo = numeradas.filter((s) => s.id !== 'titulo');
    const ciudad = String(extra.ciudad || '').trim();
    const director = String(extra.director || '').trim();
    const lugarFecha = `${ciudad ? `${ciudad} ` : ''}${fechaLarga()}`;
    const autores = String(author || '').split(/\n|;/).map((a) => a.trim()).filter(Boolean);
    const firma = () => [...vacios(2), centrado('_______________________________'), centrado(autores.join(', ') || '(Nombres y apellidos completos)'), ...vacios(1), centrado(`Firmado en ${lugarFecha}`)];

    // Logo de la institución (si se eligió): va arriba en la portada y ocupa el lugar de varios renglones en blanco.
    const lg = extra.logo?.dataUrl ? extra.logo : null;
    const logo = () => lg ? [{ image: lg.dataUrl, width: lg.width * 0.75, height: lg.height * 0.75, alignment: 'center', margin: [0, 0, 0, 6] }] : [];
    const portada = [
        ...(lg ? [...vacios(1), ...logo(), ...vacios(1)] : vacios(4)), centrado(titulo, { bold: true }), ...vacios(lg ? 4 : 5), centrado('Presentado por:'), ...autores.map((a) => centrado(a)), ...vacios(6), centrado(lugarFecha),
        { text: ' ', pageBreak: 'before' },
        ...(lg ? [...vacios(1), ...logo(), ...vacios(1)] : vacios(3)), centrado(titulo, { bold: true }), ...vacios(lg ? 2 : 3), centrado('Presentado por:'), ...autores.map((a) => centrado(a)),
        ...(director ? [...vacios(2), centrado('Bajo la dirección de:'), ...director.split('\n').map((d) => centrado(d.trim()))] : []),
        ...vacios(lg ? (director ? 3 : 4) : director ? 4 : 6), centrado(lugarFecha),
    ];
    const pagina = (t, texto) => (String(texto || '').trim() ? [centrado(t, { bold: true, pageBreak: 'before' }), ...String(texto).trim().split(/\n+/).map((x) => centrado(x.trim()))] : []);

    const contenido = cuerpo.flatMap((section) => {
        if (section.id === 'preliminares') {
            // Primero el título de la sección, para que quede antes que sus declaraciones en el índice.
            const cabeza = enIndice('indice', { text: section.titulo, bold: true, alignment: 'left', margin: [0, 0, 0, 8] }, { texto: section.titulo, margen: 12 });
            const partes = [];
            let primera = true;
            section.content.forEach((b) => {
                if (b.type === 'heading') {
                    if (!primera) partes.push(...firma());
                    const declaracion = enIndice('indice', { text: b.text, bold: true, italics: true, alignment: 'center', margin: [0, 6, 0, 8] }, { texto: b.text, margen: 24 });
                    partes.push(primera ? declaracion : enPaginaNueva(declaracion));
                    primera = false;
                } else partes.push(...bloque(b));
            });
            return [enPaginaNueva(cabeza), ...partes, ...firma()];
        }
        const cabeza = enIndice('indice', { text: section.titulo, bold: true, alignment: 'center', margin: [0, 0, 0, 10], headlineLevel: 1 }, { texto: section.titulo, negrita: true });
        // La numeración arábiga de las páginas empieza en la primera sección numerada (1 Introducción).
        if (!inicioId && section.numero) inicioId = cabeza.id;
        return [enPaginaNueva(cabeza), ...section.content.flatMap((b) => bloque(b, extra.imagenes))];
    });

    // Tabla de contenido y listas: una fila por título, con su página (ya con la numeración que se muestra).
    const inicio = numeros?.inicio || 0;
    const lista = (id, t) => {
        const filas = entradas.filter((e) => e.lista === id);
        return filas.length === 0 ? [] : [
            centrado(t, { bold: true, pageBreak: 'before', margin: [0, 0, 0, 8] }),
            ...filas.map((e) => ({
                columns: [
                    { text: e.texto, width: '*', bold: e.negrita, margin: [e.margen, 0, 0, 0], linkToDestination: e.id },
                    { text: numeros ? numeroDePagina(numeros.paginas?.[e.id], inicio) : ' ', width: 34, alignment: 'right' },
                ],
                columnGap: 8, fontSize: 11, lineHeight: 1.6, alignment: 'left',
            })),
        ];
    };
    const indices = [...lista('indice', 'Tabla de contenido'), ...lista('tablas', 'Lista de tablas'), ...lista('figuras', 'Lista de figuras')];
    if (registro) { registro.paginas = {}; registro.inicioId = inicioId; }

    return {
        info: { title: titulo, author: autores.join(', ') || 'PROJECTSIA', subject: 'Proyecto de investigación' },
        pageSize: 'LETTER',
        pageMargins: [MARGEN, MARGEN, MARGEN, MARGEN],
        // La portada no lleva número; las preliminares van en romanos y desde la Introducción se cuenta 1, 2, 3…
        header: (page) => ({ text: page === 1 ? '' : numeroDePagina(page, numeros ? inicio : 0), alignment: 'right', fontSize: 10, margin: [0, 1.25 * CM, MARGEN, 0] }),
        defaultStyle: { font: 'Tinos', fontSize: 12, lineHeight: 1.5, alignment: 'justify' },
        // Un título o un rótulo no se queda solo al final de la página.
        pageBreakBefore: (node, q) => {
            const pasa = Boolean(node.headlineLevel) && !node.pageBreak && q.getNodesOnNextPage().length > 0 && q.getFollowingNodesOnPage().length === 0;
            // Si el título pasa a la página siguiente, esa es su página (la biblioteca no vuelve a preguntar por él).
            if (registro && node.id && node.pageNumbers?.length) registro.paginas[node.id] = node.pageNumbers[0] + (pasa ? 1 : 0);
            return pasa;
        },
        content: [...portada, ...pagina('Dedicatoria', extra.dedicatoria), ...pagina('Agradecimientos', extra.agradecimientos), ...indices, ...contenido],
    };
};

export const pdfBlob = (name, author, sections, extra) => {
    prepararFuentes();
    // Dos pasadas: la primera averigua en qué página queda cada título; la segunda escribe esos números en el
    // índice y en el encabezado, contando desde 1 en la Introducción. El texto no se mueve entre una y otra.
    const registro = {};
    return pdfMake.createPdf(definicionPdf(name, author, sections, extra, null, registro)).getBuffer()
        .then(() => pdfMake.createPdf(definicionPdf(name, author, sections, extra, { paginas: registro.paginas, inicio: registro.paginas[registro.inicioId] || 0 })).getBlob());
};
