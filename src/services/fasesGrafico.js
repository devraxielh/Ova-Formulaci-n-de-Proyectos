/*
 * Figura «Ruta del proyecto» para «Desarrollo de las fases del proyecto»: horizontal, con una flecha por fase,
 * su nombre y su producto, y la línea del calendario. Se dibuja como SVG (pantalla) y como PNG (Word y PDF), como el árbol.
 */

const W = 1200;
const MARGEN = 36;
const FUENTE = 'Arial, Helvetica, sans-serif';

// Un color por fase: fuerte (número, acento, barra) y suave (fondo de la tarjeta).
const COLORES = [
    { fuerte: '#4f46e5', suave: '#eef2ff', texto: '#3730a3' },
    { fuerte: '#0d9488', suave: '#f0fdfa', texto: '#115e59' },
    { fuerte: '#d97706', suave: '#fffbeb', texto: '#92400e' },
    { fuerte: '#db2777', suave: '#fdf2f8', texto: '#9d174d' },
    { fuerte: '#0284c7', suave: '#f0f9ff', texto: '#075985' },
    { fuerte: '#7c3aed', suave: '#f5f3ff', texto: '#5b21b6' },
];
const colorDe = (i) => COLORES[i % COLORES.length];

const xml = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const limpio = (t) => String(t ?? '').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim().replace(/[.\s]+$/, '');

// Parte un texto en renglones de hasta `max` caracteres (aproximación al ancho real de Arial).
const renglones = (texto, max) => {
    const out = [];
    let actual = '';
    limpio(texto).split(' ').filter(Boolean).forEach((p) => {
        let palabra = p;
        while (palabra.length > max) {
            if (actual) { out.push(actual); actual = ''; }
            out.push(`${palabra.slice(0, max - 1)}-`);
            palabra = palabra.slice(max - 1);
        }
        if (!actual) actual = palabra;
        else if (`${actual} ${palabra}`.length <= max) actual = `${actual} ${palabra}`;
        else { out.push(actual); actual = palabra; }
    });
    if (actual) out.push(actual);
    return out;
};
const maxCaracteres = (ancho, fuente) => Math.max(8, Math.floor(ancho / (fuente * 0.55)));

const texto = (x, y, contenido, { size = 20, peso = 400, color = '#1f2937', ancla = 'start', italica = false, espacio = 0 } = {}) =>
    `<text x="${x}" y="${y}" font-size="${size}" font-weight="${peso}" fill="${color}" text-anchor="${ancla}"${italica ? ' font-style="italic"' : ''}${espacio ? ` letter-spacing="${espacio}"` : ''}>${xml(contenido)}</text>`;

/**
 * Ruta horizontal: una flecha por fase (número y duración), debajo su nombre y su producto, y al pie la línea del
 * calendario con el tramo de cada fase. Poco texto: el detalle va en el párrafo del documento.
 * @param {{ unidad: string, fases: Array<{ nombre, numeroObjetivo, duracion, productos }> }} datos
 * @returns {{ svg: string, w: number, h: number }}
 */
export const fasesSvg = (datos) => {
    const fases = (datos?.fases || []).filter((f) => limpio(f.nombre));
    const n = Math.max(1, fases.length);
    const unidad = datos?.unidad === 'meses' ? 'meses' : 'semanas';
    const singular = unidad === 'meses' ? 'mes' : 'semana';
    const corta = unidad === 'meses' ? 'Mes' : 'Sem.';
    const total = fases.reduce((s, f) => s + (Number(f.duracion) || 0), 0) || 1;
    const anchoUtil = W - MARGEN * 2;
    const col = anchoUtil / n;
    const PUNTA = Math.min(34, col * 0.16);
    const partes = [];

    // Encabezado.
    let y = MARGEN;
    partes.push(texto(MARGEN, y + 20, 'RUTA DEL PROYECTO', { size: 18, peso: 700, color: '#64748b', espacio: 2.5 }));
    partes.push(texto(W - MARGEN, y + 20, `${fases.length} ${fases.length === 1 ? 'fase' : 'fases'} · ${total} ${total === 1 ? singular : unidad}`, { size: 20, peso: 700, color: '#0f172a', ancla: 'end' }));
    y += 46;

    // Fila de flechas (chevrones): «FASE 1» y la duración.
    const ALTO_FLECHA = 92;
    fases.forEach((f, i) => {
        const c = colorDe(i);
        const x0 = MARGEN + i * col;
        const x1 = x0 + col - 6;
        const muesca = i === 0 ? 0 : PUNTA;
        const punta = i === n - 1 ? 0 : PUNTA;
        const puntos = [
            [x0, y], [x1 - punta, y], [x1, y + ALTO_FLECHA / 2], [x1 - punta, y + ALTO_FLECHA], [x0, y + ALTO_FLECHA], [x0 + muesca, y + ALTO_FLECHA / 2],
        ].map(([a, b]) => `${a.toFixed(1)},${b}`).join(' ');
        partes.push(`<polygon points="${puntos}" fill="${c.fuerte}"/>`);
        const cx = x0 + muesca / 2 + (col - 6 - punta) / 2;
        const dur = Math.max(1, Number(f.duracion) || 1);
        partes.push(texto(cx, y + 40, `FASE ${i + 1}`, { size: 24, peso: 800, color: '#ffffff', ancla: 'middle', espacio: 1.5 }));
        partes.push(texto(cx, y + 68, `${dur} ${dur === 1 ? singular : unidad}`, { size: 18, peso: 600, color: '#ffffff', ancla: 'middle' }));
    });
    y += ALTO_FLECHA + 22;

    // Columna de cada fase: nombre (hasta 3 renglones) y producto (hasta 3), en una tarjeta suave de su color.
    const anchoTexto = col - 30;
    // Con más fases, columnas más angostas: letra algo menor y un renglón más, para no cortar palabras.
    const tNombre = n <= 3 ? 25 : n === 4 ? 23 : n === 5 ? 21 : 19;
    const tProducto = tNombre - 4;
    const maxNombre = n >= 5 ? 4 : 3;
    const recorta = (lineas, max) => (lineas.length > max ? [...lineas.slice(0, max - 1), `${lineas[max - 1].replace(/\s+\S*$/, '')}…`] : lineas);
    const cols = fases.map((f) => ({
        nombre: recorta(renglones(f.nombre, maxCaracteres(anchoTexto, tNombre)), maxNombre),
        objetivo: f.numeroObjetivo ? `Objetivo ${f.numeroObjetivo}` : 'Cierre',
        producto: limpio(f.productos) ? recorta(renglones(limpio(f.productos), maxCaracteres(anchoTexto, tProducto)), 3) : [],
    }));
    const altoNombre = Math.max(...cols.map((c) => c.nombre.length)) * (tNombre + 6);
    const altoProducto = Math.max(0, ...cols.map((c) => c.producto.length)) * (tProducto + 5);
    const ALTO_CARTA = 30 + 22 + altoNombre + (altoProducto ? 26 + altoProducto : 0) + 22;
    cols.forEach((cl, i) => {
        const c = colorDe(i);
        const x0 = MARGEN + i * col;
        const cx = x0 + (col - 6) / 2;
        partes.push(`<rect x="${x0}" y="${y}" width="${col - 6}" height="${ALTO_CARTA}" rx="16" fill="${c.suave}"/>`);
        partes.push(`<rect x="${cx - 22}" y="${y - 2}" width="44" height="5" rx="2.5" fill="${c.fuerte}"/>`);
        let yy = y + 32;
        partes.push(texto(cx, yy, cl.objetivo.toUpperCase(), { size: 16, peso: 700, color: c.texto, ancla: 'middle', espacio: 1.2 }));
        yy += 30;
        cl.nombre.forEach((l) => { partes.push(texto(cx, yy, l, { size: tNombre, peso: 700, color: '#0f172a', ancla: 'middle' })); yy += tNombre + 6; });
        if (cl.producto.length) {
            yy = y + 32 + 30 + altoNombre + 6;
            partes.push(`<line x1="${cx - 30}" y1="${yy - 8}" x2="${cx + 30}" y2="${yy - 8}" stroke="${c.fuerte}" stroke-opacity="0.35" stroke-width="2"/>`);
            yy += 16;
            cl.producto.forEach((l) => { partes.push(texto(cx, yy, l, { size: tProducto, color: '#475569', ancla: 'middle', italica: true })); yy += tProducto + 5; });
        }
    });
    y += ALTO_CARTA + 34;

    // Calendario: una línea con el tramo de cada fase y sus semanas o meses.
    const xs = MARGEN;
    const ws = anchoUtil;
    partes.push(`<rect x="${xs}" y="${y}" width="${ws}" height="16" rx="8" fill="#e2e8f0"/>`);
    let inicio = 1;
    fases.forEach((f, i) => {
        const c = colorDe(i);
        const dur = Math.max(1, Number(f.duracion) || 1);
        const fin = inicio + dur - 1;
        const x = xs + (ws * (inicio - 1)) / total;
        const w = (ws * dur) / total;
        partes.push(`<rect x="${x + 2}" y="${y}" width="${Math.max(6, w - 4)}" height="16" rx="8" fill="${c.fuerte}"/>`);
        if (w > 70) partes.push(texto(x + w / 2, y + 42, dur === 1 ? `${corta} ${inicio}` : `${corta} ${inicio}–${fin}`, { size: 18, color: '#64748b', ancla: 'middle' }));
        inicio = fin + 1;
    });
    y += 16 + 34;

    const h = Math.round(y + MARGEN - 10);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}" viewBox="0 0 ${W} ${h}" font-family="${FUENTE}"><rect width="${W}" height="${h}" fill="#ffffff"/>${partes.join('')}</svg>`;
    return { svg, w: W, h };
};

export const fasesDataUrl = (datos) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(fasesSvg(datos).svg)}`;

// Solo en el navegador: la figura como PNG, para Word y PDF.
export const fasesPng = (datos) => new Promise((resolve, reject) => {
    const { svg, w, h } = fasesSvg(datos);
    const img = new Image();
    img.onload = () => {
        try {
            const escala = 2;
            const canvas = document.createElement('canvas');
            canvas.width = w * escala;
            canvas.height = h * escala;
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/png');
            const binario = atob(dataUrl.split(',')[1]);
            const data = new Uint8Array(binario.length);
            for (let i = 0; i < binario.length; i += 1) data[i] = binario.charCodeAt(i);
            resolve({ data, dataUrl, type: 'png', w, h });
        } catch (error) { reject(error); }
    };
    img.onerror = () => reject(new Error('No se pudo dibujar la ruta de fases.'));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
});

// Los datos de la figura a partir de lo guardado en «Fases» (y los objetivos específicos, para numerarlos).
export const datosFases = (fasesForm, especificos = []) => {
    const plano = (t) => limpio(t).toLowerCase();
    return {
        unidad: fasesForm?.unidad === 'meses' ? 'meses' : 'semanas',
        fases: (Array.isArray(fasesForm?.fases) ? fasesForm.fases : []).filter((f) => limpio(f?.nombre)).map((f) => ({
            nombre: limpio(f.nombre),
            numeroObjetivo: especificos.findIndex((o) => plano(o) === plano(f.objetivo)) + 1,
            duracion: Math.max(1, Number(f.duracion) || 1),
            actividades: (f.actividades || []).map(limpio).filter(Boolean),
            productos: limpio(f.productos),
            tecnicas: limpio(f.tecnicas),
        })),
    };
};
