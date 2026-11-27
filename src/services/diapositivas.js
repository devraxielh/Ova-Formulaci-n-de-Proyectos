// Diapositivas de sustentación: arma el guion (una lista de diapositivas) a partir del documento del proyecto.
// `presentacionPptx` las convierte en un archivo de PowerPoint.
import { temaDe } from '../data/temasDiapositivas.js';
import { documentoNumerado } from './projectDoc.js';
import { partesObjetivos } from './coherencia.js';

const t = (v) => String(v ?? '').trim();
const sinMarcas = (v) => t(v).replace(/\*\*?/g, '').replace(/\[\[[a-z0-9]{5,9}\]\]/g, '').replace(/\s+/g, ' ').trim();

// Texto corrido de una sección del documento (para resumirla).
export const textoSeccion = (numeradas, id, max = 5000) => {
    const s = numeradas.find((x) => x.id === id);
    if (!s) return '';
    // En el planteamiento se deja fuera la pregunta (2.1), que tiene su propia diapositiva.
    const corte = id === 'planteamiento' ? s.content.findIndex((b) => b.type === 'heading') : -1;
    return (corte >= 0 ? s.content.slice(0, corte) : s.content).map((b) => (b.type === 'list' ? b.items.join('. ') : ['paragraph', 'plain'].includes(b.type) ? b.text.replace(/\s*\(ver (?:Tabla|Figura) \d+(?: y (?:Tabla|Figura) \d+)*\)/g, '') : '')).filter(Boolean).map(sinMarcas).join(' ').slice(0, max);
};

// Sin IA: las primeras frases de la sección, recortadas, como viñetas.
export const vinetasBasicas = (texto, n = 4) => sinMarcas(texto).split(/(?<=[.!?])\s+/).map((f) => f.trim()).filter((f) => f.length > 25)
    .slice(0, n).map((f) => (f.length > 190 ? `${f.slice(0, 187).replace(/\s+\S*$/, '')}…` : f));

// Ítems de la plantilla «Presentación Final – Proyecto-Seminario II»: cada diapositiva y sus apartados.
// `fuente` dice de qué parte del proyecto sale el texto de cada apartado.
const campo = (...claves) => (d) => claves.map((k) => t(d[k])).filter(Boolean).join('\n');
export const PLANTILLA = [
    { titulo: 'Introducción', items: [
        { clave: 'contexto', rotulo: 'Contexto', fuente: campo('introduccion') },
        { clave: 'importancia', rotulo: 'Importancia', fuente: campo('justificacion', 'introduccion') },
    ] },
    { titulo: 'Planteamiento del Problema', items: [
        { clave: 'problema', rotulo: 'Problema Identificado', fuente: campo('planteamiento') },
        { clave: 'pregunta', rotulo: 'Pregunta Central', literal: (d) => sinMarcas(t(d.pregunta).split('\n')[0]) },
    ] },
    { titulo: 'Objetivos', objetivos: true },
    { titulo: 'Justificación', items: [
        { clave: 'justificacion', rotulo: 'Justificación', fuente: campo('justificacion') },
        { clave: 'alcances', rotulo: 'Alcances', fuente: campo('alcances') },
        { clave: 'limitaciones', rotulo: 'Limitaciones', fuente: campo('limitaciones') },
    ] },
    { titulo: 'Marco Referencial', numerados: true, items: [
        { clave: 'teorias', rotulo: 'Teorías', fuente: campo('marcoTeorico') },
        { clave: 'antecedentes', rotulo: 'Antecedentes', fuente: campo('marcoAntecedentes') },
        { clave: 'conceptos', rotulo: 'Conceptos', fuente: campo('marcoConceptual') },
    ] },
    { titulo: 'Metodología', figuras: 'fases', items: [
        { clave: 'enfoque', rotulo: 'Enfoque de investigación', fuente: campo('metEnfoque') },
        { clave: 'tipo', rotulo: 'Tipo de investigación', fuente: campo('metTipo') },
        { clave: 'diseno', rotulo: 'Diseño de investigación', fuente: campo('metDiseno') },
        { clave: 'poblacion', rotulo: 'Población y muestra', fuente: campo('poblacionSugerida') },
        { clave: 'instrumentos', rotulo: 'Instrumentos de recolección de información', fuente: campo('instrumentos') },
        { clave: 'analisis', rotulo: 'Análisis de información', fuente: campo('metPlanAnalisis') },
    ] },
    { titulo: 'Resultados', figuras: 'resultados', items: [
        { clave: 'hallazgos', rotulo: 'Hallazgos', fuente: campo('resultados') },
        { clave: 'interpretacion', rotulo: 'Interpretación', fuente: campo('discusion') },
    ] },
    { titulo: 'Conclusiones y Recomendaciones', numerados: true, items: [
        { clave: 'conclusiones', rotulo: 'Conclusiones', fuente: campo('conclusiones') },
        { clave: 'recomendaciones', rotulo: 'Recomendaciones', fuente: campo('recomendaciones') },
        { clave: 'implicaciones', rotulo: 'Implicaciones', fuente: campo('discusion', 'conclusiones'), soloIA: true },
    ] },
];

// Texto limpio de un campo del proyecto (sin títulos ### ni viñetas de Markdown).
const limpiar = (texto) => sinMarcas(t(texto).split('\n').filter((l) => !/^#{1,6}\s/.test(l.trim())).map((l) => l.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, '')).join(' '));

// Apartados que la IA debe resumir: [{ clave, rotulo, texto }] (solo los que tienen contenido).
export const apartadosParaResumir = (data, max = 2200) => PLANTILLA.flatMap((dia) => dia.items || [])
    .filter((it) => it.fuente)
    .map((it) => ({ clave: it.clave, rotulo: it.rotulo, texto: limpiar(it.fuente(data || {})).slice(0, max) }))
    .filter((it) => it.texto.length > 40);

/**
 * Guion de la presentación con los ítems de la plantilla. `resumen` = { contexto: '…', problema: '…', … } (de la IA);
 * lo que falte se arma con las primeras frases del apartado.
 * Devuelve [{ tipo: 'portada' | 'bloques' | 'objetivos' | 'figura' | 'tabla' | 'referencias' | 'cierre', titulo, … }].
 */
const MAX_GRAFICOS = 8;
export const guionDiapositivas = (sections, data, { autor = '', resumen = {} } = {}) => {
    const d = data || {};
    const numeradas = documentoNumerado(sections);
    const titulo = numeradas.find((s) => s.id === 'titulo')?.content[0]?.text || t(d.titulo) || 'Proyecto de investigación';
    const { general, especificos } = partesObjetivos(d.objetivos);
    const textoDe = (it) => {
        if (it.literal) return it.literal(d);
        const ia = Array.isArray(resumen[it.clave]) ? resumen[it.clave].join('. ') : resumen[it.clave];
        if (t(ia)) return sinMarcas(ia);
        if (it.soloIA) return '';
        return vinetasBasicas(limpiar(it.fuente(d)), 2).join(' ');
    };
    const slides = [{
        tipo: 'portada', antetitulo: 'Socialización', titulo,
        autores: t(autor).split(/\n|;/).map((a) => a.trim()).filter(Boolean),
        director: t(d.director).split('\n').map((x) => x.trim()).filter(Boolean),
        pie: [t(d.ciudad), new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })].filter(Boolean).join(' · '),
    }];

    PLANTILLA.forEach((dia) => {
        if (dia.objetivos) {
            if (general || t(d.objetivoGeneral) || especificos.length) slides.push({ tipo: 'objetivos', titulo: dia.titulo, general: sinMarcas(general || d.objetivoGeneral), especificos: especificos.map(sinMarcas).slice(0, 6) });
            return;
        }
        const bloques = dia.items.map((it) => ({ rotulo: it.rotulo, texto: textoDe(it) })).filter((b) => b.texto);
        if (bloques.length) slides.push({ tipo: 'bloques', titulo: dia.titulo, bloques, numerados: Boolean(dia.numerados) });
        // Después de Metodología va el gráfico de la ruta de fases; después de Resultados, sus gráficos
        // (uno por diapositiva, con su número y su título; como mucho MAX_GRAFICOS).
        if (dia.figuras) {
            const figuras = (numeradas.find((sec) => sec.id === dia.figuras)?.content || []).filter((b) => b.type === 'figure' && b.rotulo && (dia.figuras !== 'fases' || b.fases));
            figuras.slice(0, MAX_GRAFICOS).forEach((b) => slides.push({ tipo: 'figura', titulo: dia.figuras === 'fases' ? 'Fases del proyecto' : `${b.rotulo}. ${sinMarcas(b.caption)}`, fileId: b.fileId, w: b.w, h: b.h, nota: t(b.nota) }));
        }
    });

    const refs = (numeradas.find((s) => s.id === 'referencias')?.content || []).map((b) => sinMarcas(b.text)).slice(0, 7);
    if (refs.length) slides.push({ tipo: 'referencias', titulo: 'Referencias bibliográficas', items: refs });
    slides.push({ tipo: 'cierre', titulo: '¿Preguntas?' });
    return slides;
};

// Con fondo institucional, el contenido se encoge hacia la zona libre de la imagen (sin tocar la franja diagonal de
// arriba a la derecha ni el logo de abajo a la derecha). Zona original → zona libre, en pulgadas.
const ZONA = { x0: 0.75, y0: 0.4, w0: 11.9, h0: 6.45, x1: 0.6, y1: 0.55, w1: 10.75, h1: 6.25 };
const enZona = (o = {}) => {
    const fx = ZONA.w1 / ZONA.w0; const fy = ZONA.h1 / ZONA.h0;
    return {
        ...o,
        ...(typeof o.x === 'number' ? { x: ZONA.x1 + (o.x - ZONA.x0) * fx } : {}),
        ...(typeof o.y === 'number' ? { y: ZONA.y1 + (o.y - ZONA.y0) * fy } : {}),
        ...(typeof o.w === 'number' ? { w: o.w * fx } : {}),
        ...(typeof o.h === 'number' ? { h: o.h * fy } : {}),
        ...(typeof o.fontSize === 'number' ? { fontSize: Math.round(o.fontSize * 0.93) } : {}),
    };
};
// La diapositiva con sus medidas ya ajustadas a la zona libre.
const ajustada = (slide) => ({
    addText: (t2, o) => slide.addText(t2, enZona(o)),
    addShape: (f, o) => slide.addShape(f, enZona(o)),
    addImage: (o) => slide.addImage(enZona(o)),
    addTable: (filas, o) => slide.addTable(filas, enZona(o)),
});

/** Genera el .pptx. `imagenes` = { [fileId]: { dataUrl } }; `tema` = uno de los TEMAS (colores);
 *  `logo` = { dataUrl, width, height } de la institución, para la portada (opcional);
 *  `fondos` = { portada, contenido } (dataUrl) y `tema`: fondo institucional. La imagen oscura va en la primera
 *  diapositiva y la clara en las demás; ya trae el logo, así que la portada no lo repite. */
export const presentacionPptx = async (slides, imagenes = {}, tema = temaDe(), logo = null, fondos = null) => {
    const conFondo = Boolean(fondos?.portada && fondos?.contenido);
    const T = conFondo && fondos.tema ? fondos.tema : tema;
    const { default: Pptx } = await import('pptxgenjs');
    const pptx = new Pptx();
    pptx.layout = 'LAYOUT_WIDE'; // 13,33 × 7,5 pulgadas (16:9)
    pptx.title = slides[0]?.titulo || 'Sustentación';
    pptx.defineSlideMaster({
        title: 'CONTENIDO',
        background: conFondo ? { data: fondos.contenido } : { color: T.fondo },
        objects: conFondo ? [] : [{ rect: { x: 0, y: 0, w: 0.28, h: 7.5, fill: { color: T.primario } } }],
        // Con fondo institucional el número va sobre la franja oscura de abajo, a la izquierda (a la derecha está el logo).
        slideNumber: conFondo ? { x: 0.45, y: 7.05, fontSize: 11, color: 'FFFFFF', fontFace: 'Calibri' } : { x: 12.45, y: 6.95, fontSize: 11, color: T.gris, fontFace: 'Calibri' },
    });
    const titular = (slide, texto) => slide.addText(texto, { x: 0.75, y: 0.4, w: conFondo ? 10.6 : 11.9, h: 1.0, fontSize: texto.length > 70 ? 24 : 30, bold: true, color: T.tinta, fontFace: 'Calibri', valign: 'middle', fit: 'shrink' });

    slides.forEach((s) => {
        if (s.tipo === 'portada') {
            const slide = pptx.addSlide();
            slide.background = conFondo ? { data: fondos.portada } : { color: T.primario };
            slide.addText(s.titulo, { x: 0.9, y: 0.9, w: conFondo ? 9.6 : 11.5, h: 2.7, fontSize: s.titulo.length > 140 ? 28 : 36, bold: true, color: T.sobrePrimario, fontFace: 'Calibri', valign: 'middle', fit: 'shrink' });
            slide.addText(s.antetitulo || 'Socialización', { x: 0.9, y: 3.75, w: 11.5, h: 0.7, fontSize: 26, color: T.suavePrimario, fontFace: 'Calibri' });
            slide.addText('Presentado por:', { x: 0.9, y: 5.0, w: 11.5, h: 0.45, fontSize: 16, color: T.suavePrimario, fontFace: 'Calibri' });
            // Logo de la institución: en una tarjeta blanca (los logos traen fondo blanco y la portada es de color).
            const conLogo = !conFondo && Boolean(logo?.dataUrl && logo.width > 0 && logo.height > 0);
            if (conLogo) {
                const CX = 10.15; const CY = 4.75; const CW = 2.55; const CH = 2.0; const pad = 0.2;
                const k = Math.min((CW - pad * 2) / logo.width, (CH - pad * 2) / logo.height);
                const w = logo.width * k; const h = logo.height * k;
                slide.addShape(pptx.ShapeType.roundRect, { x: CX, y: CY, w: CW, h: CH, fill: { color: 'FFFFFF' }, line: { color: 'FFFFFF', width: 0 }, rectRadius: 0.12 });
                slide.addImage({ data: logo.dataUrl, x: CX + (CW - w) / 2, y: CY + (CH - h) / 2, w, h });
            }
            slide.addText(s.autores.join('  |  ') || ' ', { x: 0.9, y: 5.45, w: conLogo || conFondo ? 9.0 : 11.5, h: 0.8, fontSize: 22, bold: true, color: T.sobrePrimario, fontFace: 'Calibri', valign: 'top', fit: 'shrink' });
            return;
        }
        if (s.tipo === 'cierre') {
            const slide = pptx.addSlide();
            slide.background = conFondo ? { data: fondos.contenido } : { color: T.primario };
            slide.addText(s.titulo, { x: 0.9, y: 2.6, w: 11.5, h: 1.6, fontSize: 60, bold: true, color: conFondo ? T.tinta : T.sobrePrimario, fontFace: 'Calibri', align: 'center' });
            return;
        }
        const hoja = pptx.addSlide({ masterName: 'CONTENIDO' });
        const slide = conFondo ? ajustada(hoja) : hoja;
        titular(slide, s.titulo);
        if (s.tipo === 'bloques') {
            // Tarjetas por apartado: hasta 3 en una fila; 4 a 6, en dos filas de tres (como la plantilla).
            const n = s.bloques.length;
            const cols = n <= 3 ? n : 3;
            const filas = Math.ceil(n / cols);
            const X0 = 0.9; const Y0 = 1.6; const W = 11.7; const H = 5.2; const sep = 0.3;
            const w = (W - sep * (cols - 1)) / cols;
            const h = (H - sep * (filas - 1)) / filas;
            s.bloques.forEach((b, i) => {
                const x = X0 + (i % cols) * (w + sep);
                const y = Y0 + Math.floor(i / cols) * (h + sep);
                slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, fill: { color: T.tarjeta }, line: { color: T.borde, width: 1 }, rectRadius: 0.12 });
                slide.addText(`${s.numerados ? `${i + 1}   ` : ''}${b.rotulo}`, { x: x + 0.25, y: y + 0.15, w: w - 0.5, h: 0.7, fontSize: filas > 1 ? 16 : 20, bold: true, color: T.acento, fontFace: 'Calibri', valign: 'middle', fit: 'shrink' });
                const largo = b.texto.length;
                slide.addText(b.texto, { x: x + 0.25, y: y + 0.85, w: w - 0.5, h: h - 1.0, fontSize: filas > 1 ? (largo > 220 ? 12 : 14) : largo > 420 ? 14 : largo > 260 ? 16 : 18, color: T.tinta, fontFace: 'Calibri', valign: 'top', fit: 'shrink' });
            });
        } else if (s.tipo === 'referencias') {
            slide.addText(s.items.map((item) => ({ text: item, options: { bullet: { indent: 18 }, breakLine: true, paraSpaceAfter: 10 } })), { x: 0.9, y: 1.6, w: 11.7, h: 5.2, fontSize: 14, color: T.tinta, fontFace: 'Calibri', valign: 'top', fit: 'shrink' });
        } else if (s.tipo === 'objetivos') {
            slide.addShape(pptx.ShapeType.roundRect, { x: 0.9, y: 1.6, w: 4.6, h: 5.2, fill: { color: T.realce }, line: { color: T.realceBorde, width: 1 }, rectRadius: 0.12 });
            slide.addText('Objetivo General', { x: 1.15, y: 1.75, w: 4.1, h: 0.6, fontSize: 20, bold: true, color: T.acento, fontFace: 'Calibri' });
            slide.addText(s.general || '', { x: 1.15, y: 2.4, w: 4.1, h: 4.2, fontSize: 18, color: T.tinta, fontFace: 'Calibri', valign: 'top', fit: 'shrink' });
            slide.addText('Objetivos Específicos', { x: 5.9, y: 1.75, w: 6.7, h: 0.6, fontSize: 20, bold: true, color: T.acento, fontFace: 'Calibri' });
            slide.addText(s.especificos.map((o) => ({ text: o, options: { bullet: { indent: 18 }, breakLine: true, paraSpaceAfter: 10 } })), { x: 5.9, y: 2.4, w: 6.7, h: 4.4, fontSize: s.especificos.join(' ').length > 500 ? 14 : 17, color: T.tinta, fontFace: 'Calibri', valign: 'top', fit: 'shrink' });
        } else if (s.tipo === 'figura') {
            const img = imagenes[s.fileId];
            const maxW = 11.4; const maxH = 4.7;
            const ratio = s.w && s.h ? s.w / s.h : 16 / 9;
            const w = Math.min(maxW, maxH * ratio);
            const h = w / ratio;
            if (img) slide.addImage({ data: img.dataUrl, x: 0.9 + (maxW - w) / 2, y: 1.6, w, h });
            else slide.addText('[Imagen no disponible]', { x: 0.9, y: 3.2, w: maxW, h: 1, fontSize: 18, color: T.gris, align: 'center' });
            if (s.nota) slide.addText(`Nota. ${s.nota}`, { x: 0.9, y: 6.4, w: 11.4, h: 0.45, fontSize: 12, color: T.gris, fontFace: 'Calibri', italic: true });
        } else if (s.tipo === 'tabla') {
            const celda = (texto, extra = {}) => ({ text: String(texto ?? ''), options: { fontFace: 'Calibri', fontSize: s.rows.length > 6 ? 12 : 14, color: T.tinta, valign: 'middle', ...extra } });
            slide.addTable([s.head.map((h) => celda(h, { bold: true, color: T.sobrePrimario, fill: { color: T.primario } })), ...s.rows.map((r, i) => r.map((c) => celda(c, i % 2 ? { fill: { color: T.tarjeta } } : {})))], { x: 0.9, y: 1.6, w: 11.5, border: { type: 'solid', color: T.borde, pt: 0.75 }, autoPage: false });
            if (s.nota) slide.addText(`Nota. ${s.nota}`, { x: 0.9, y: 6.5, w: 11.4, h: 0.4, fontSize: 12, color: T.gris, fontFace: 'Calibri', italic: true });
        }
    });
    return pptx.write({ outputType: 'blob' });
};
