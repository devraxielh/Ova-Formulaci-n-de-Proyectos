/*
 * Figura «Ruta del proyecto» para «Desarrollo de las fases del proyecto»: una línea de tiempo vertical con una tarjeta
 * por fase (número, nombre, objetivo, duración, actividades clave, instrumentos, producto y su tramo en el calendario)
 * y, arriba, la barra de la duración total. Se dibuja como SVG (pantalla) y como PNG (Word y PDF), como el árbol.
 */

const W = 1200;
const MARGEN = 36;
const X_CARTA = 132; // donde empieza cada tarjeta; a la izquierda va la línea de tiempo
const ANCHO_CARTA = W - X_CARTA - MARGEN;
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
const maxCaracteres = (ancho, fuente) => Math.max(8, Math.floor(ancho / (fuente * 0.52)));

const texto = (x, y, contenido, { size = 20, peso = 400, color = '#1f2937', ancla = 'start', italica = false, espacio = 0 } = {}) =>
    `<text x="${x}" y="${y}" font-size="${size}" font-weight="${peso}" fill="${color}" text-anchor="${ancla}"${italica ? ' font-style="italic"' : ''}${espacio ? ` letter-spacing="${espacio}"` : ''}>${xml(contenido)}</text>`;

/**
 * @param {{ unidad: string, fases: Array<{ nombre, numeroObjetivo, duracion, actividades, productos, tecnicas }> }} datos
 * @returns {{ svg: string, w: number, h: number }}
 */
export const fasesSvg = (datos) => {
    const fases = (datos?.fases || []).filter((f) => limpio(f.nombre));
    const unidad = datos?.unidad === 'meses' ? 'meses' : 'semanas';
    const singular = unidad === 'meses' ? 'mes' : 'semana';
    const total = fases.reduce((s, f) => s + (Number(f.duracion) || 0), 0) || 1;
    const partes = [];
    let y = MARGEN;

    // Cabecera: duración total y barra con un tramo por fase.
    partes.push(texto(MARGEN, y + 22, 'RUTA DEL PROYECTO', { size: 18, peso: 700, color: '#64748b', espacio: 2.5 }));
    partes.push(texto(W - MARGEN, y + 22, `${fases.length} ${fases.length === 1 ? 'fase' : 'fases'} · ${total} ${total === 1 ? singular : unidad}`, { size: 20, peso: 700, color: '#0f172a', ancla: 'end' }));
    y += 40;
    const anchoBarra = W - MARGEN * 2;
    let x = MARGEN;
    fases.forEach((f, i) => {
        const w = Math.max(28, (anchoBarra * (Number(f.duracion) || 0)) / total);
        const c = colorDe(i);
        partes.push(`<rect x="${x}" y="${y}" width="${Math.max(4, w - 4)}" height="34" rx="8" fill="${c.fuerte}"/>`);
        if (w > 40) partes.push(texto(x + (w - 4) / 2, y + 23, `${i + 1}`, { size: 18, peso: 700, color: '#ffffff', ancla: 'middle' }));
        x += w;
    });
    y += 34 + 34;

    // Tarjetas.
    const centrosNumero = [];
    let inicio = 1;
    fases.forEach((f, i) => {
        const c = colorDe(i);
        const dur = Math.max(1, Number(f.duracion) || 1);
        const fin = inicio + dur - 1;
        const interior = ANCHO_CARTA - 56;
        const nombre = renglones(f.nombre, maxCaracteres(interior, 27));
        const acts = (f.actividades || []).map(limpio).filter(Boolean);
        const visibles = acts.slice(0, 4).map((a) => renglones(a, maxCaracteres(interior - 30, 20)));
        const extra = acts.length - visibles.length;
        const tecnicas = limpio(f.tecnicas) ? renglones(`Instrumentos y herramientas: ${limpio(f.tecnicas)}`, maxCaracteres(interior, 18)) : [];
        const producto = limpio(f.productos) ? renglones(`Producto: ${limpio(f.productos)}`, maxCaracteres(interior - 30, 20)) : [];

        // Alto de la tarjeta según sus renglones.
        let alto = 26 + 26; // margen superior + rótulo
        alto += nombre.length * 34 + 10;
        alto += visibles.reduce((s, r) => s + r.length * 27 + 6, 0) + (extra > 0 ? 28 : 0);
        alto += tecnicas.length ? tecnicas.length * 24 + 10 : 0;
        alto += producto.length ? producto.length * 27 + 22 : 0;
        alto += 74; // tramo en el calendario (rótulo y barra)
        const y0 = y;
        const cx = 64;
        centrosNumero.push({ y: y0 + 46, c });

        partes.push(`<rect x="${X_CARTA}" y="${y0}" width="${ANCHO_CARTA}" height="${alto}" rx="18" fill="${c.suave}" stroke="${c.fuerte}" stroke-opacity="0.35" stroke-width="2"/>`);
        partes.push(`<rect x="${X_CARTA}" y="${y0}" width="10" height="${alto}" rx="5" fill="${c.fuerte}"/>`);
        // Conector desde la línea de tiempo.
        partes.push(`<line x1="${cx + 30}" y1="${y0 + 46}" x2="${X_CARTA}" y2="${y0 + 46}" stroke="${c.fuerte}" stroke-width="3"/>`);

        let yy = y0 + 42;
        const rotulo = f.numeroObjetivo ? `FASE ${i + 1} · OBJETIVO ESPECÍFICO ${f.numeroObjetivo}` : `FASE ${i + 1} · CIERRE`;
        partes.push(texto(X_CARTA + 32, yy, rotulo, { size: 17, peso: 700, color: c.texto, espacio: 1.5 }));
        // Píldora con la duración.
        const pild = `${dur} ${dur === 1 ? singular : unidad}`;
        const anchoPild = pild.length * 11 + 34;
        partes.push(`<rect x="${X_CARTA + ANCHO_CARTA - 24 - anchoPild}" y="${yy - 23}" width="${anchoPild}" height="32" rx="16" fill="${c.fuerte}"/>`);
        partes.push(texto(X_CARTA + ANCHO_CARTA - 24 - anchoPild / 2, yy - 1, pild, { size: 18, peso: 700, color: '#ffffff', ancla: 'middle' }));
        yy += 40;
        nombre.forEach((l) => { partes.push(texto(X_CARTA + 32, yy, l, { size: 27, peso: 700, color: '#0f172a' })); yy += 34; });
        yy += 4;
        visibles.forEach((r) => {
            partes.push(`<circle cx="${X_CARTA + 40}" cy="${yy - 7}" r="5" fill="${c.fuerte}"/>`);
            r.forEach((l) => { partes.push(texto(X_CARTA + 58, yy, l, { size: 20, color: '#1f2937' })); yy += 27; });
            yy += 6;
        });
        if (extra > 0) { partes.push(texto(X_CARTA + 58, yy, `y ${extra} ${extra === 1 ? 'actividad más' : 'actividades más'}`, { size: 18, color: '#64748b', italica: true })); yy += 28; }
        if (tecnicas.length) {
            yy += 4;
            tecnicas.forEach((l) => { partes.push(texto(X_CARTA + 32, yy, l, { size: 18, color: '#475569' })); yy += 24; });
            yy += 6;
        }
        if (producto.length) {
            const altoProd = producto.length * 27 + 14;
            partes.push(`<rect x="${X_CARTA + 28}" y="${yy - 4}" width="${ANCHO_CARTA - 56}" height="${altoProd}" rx="10" fill="#ffffff" stroke="${c.fuerte}" stroke-opacity="0.4"/>`);
            let yp = yy + 20;
            partes.push(texto(X_CARTA + 44, yp, '→', { size: 20, peso: 700, color: c.fuerte }));
            producto.forEach((l) => { partes.push(texto(X_CARTA + 72, yp, l, { size: 20, peso: 600, color: '#0f172a' })); yp += 27; });
            yy += altoProd + 8;
        }
        // Tramo de la fase en el calendario del proyecto.
        const xs = X_CARTA + 32;
        const ws = ANCHO_CARTA - 64;
        const yTramo = y0 + alto - 34;
        partes.push(`<rect x="${xs}" y="${yTramo}" width="${ws}" height="12" rx="6" fill="#e2e8f0"/>`);
        partes.push(`<rect x="${xs + (ws * (inicio - 1)) / total}" y="${yTramo}" width="${Math.max(10, (ws * dur) / total)}" height="12" rx="6" fill="${c.fuerte}"/>`);
        partes.push(texto(xs, yTramo - 8, dur === 1 ? `${singular.charAt(0).toUpperCase()}${singular.slice(1)} ${inicio}` : `${unidad.charAt(0).toUpperCase()}${unidad.slice(1)} ${inicio} a ${fin}`, { size: 16, color: '#64748b' }));

        inicio = fin + 1;
        y = y0 + alto + 26;
    });

    // Línea de tiempo y números (encima de los conectores).
    if (centrosNumero.length) {
        const cx = 64;
        partes.unshift(`<line x1="${cx}" y1="${centrosNumero[0].y}" x2="${cx}" y2="${centrosNumero[centrosNumero.length - 1].y}" stroke="#cbd5e1" stroke-width="4" stroke-dasharray="2 10" stroke-linecap="round"/>`);
        centrosNumero.forEach(({ y: cy, c }, i) => {
            partes.push(`<circle cx="${cx}" cy="${cy}" r="30" fill="${c.fuerte}"/><circle cx="${cx}" cy="${cy}" r="36" fill="none" stroke="${c.fuerte}" stroke-opacity="0.25" stroke-width="5"/>`);
            partes.push(texto(cx, cy + 10, `${i + 1}`, { size: 28, peso: 700, color: '#ffffff', ancla: 'middle' }));
        });
    }

    const h = Math.round(y - 26 + MARGEN);
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
