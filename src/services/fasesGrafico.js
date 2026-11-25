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
const svgFlechas = (datos) => {
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

// Lo común a todos los estilos: fases con su tramo del calendario y las palabras de la unidad.
const preparar = (datos) => {
    const unidad = datos?.unidad === 'meses' ? 'meses' : 'semanas';
    const singular = unidad === 'meses' ? 'mes' : 'semana';
    const corta = unidad === 'meses' ? 'Mes' : 'Sem.';
    let inicio = 1;
    const fases = (datos?.fases || []).filter((f) => limpio(f.nombre)).map((f, i) => {
        const dur = Math.max(1, Number(f.duracion) || 1);
        const fase = { ...f, i, c: colorDe(i), dur, inicio, fin: inicio + dur - 1, duracionTxt: `${dur} ${dur === 1 ? singular : unidad}` };
        fase.tramo = dur === 1 ? `${corta} ${fase.inicio}` : `${corta} ${fase.inicio}–${fase.fin}`;
        inicio = fase.fin + 1;
        return fase;
    });
    const total = fases.reduce((s, f) => s + f.dur, 0) || 1;
    return { fases, n: Math.max(1, fases.length), total, unidad, singular, resumen: `${fases.length} ${fases.length === 1 ? 'fase' : 'fases'} · ${total} ${total === 1 ? singular : unidad}` };
};
const cabecera = (partes, resumen) => {
    partes.push(texto(MARGEN, MARGEN + 20, 'RUTA DEL PROYECTO', { size: 18, peso: 700, color: '#64748b', espacio: 2.5 }));
    partes.push(texto(W - MARGEN, MARGEN + 20, resumen, { size: 20, peso: 700, color: '#0f172a', ancla: 'end' }));
    return MARGEN + 46;
};
const cerrar = (partes, h) => ({ svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${Math.round(h)}" viewBox="0 0 ${W} ${Math.round(h)}" font-family="${FUENTE}"><rect width="${W}" height="${Math.round(h)}" fill="#ffffff"/>${partes.join('')}</svg>`, w: W, h: Math.round(h) });
const recortar = (lineas, max) => (lineas.length > max ? [...lineas.slice(0, max - 1), `${lineas[max - 1].replace(/\s+\S*$/, '')}…`] : lineas);
const tamanoPara = (n) => (n <= 3 ? 25 : n === 4 ? 23 : n === 5 ? 21 : 19);

// Estilo «Línea de tiempo»: una línea con un círculo numerado por fase; arriba la duración, abajo el nombre y el producto.
const svgLinea = (datos) => {
    const { fases, n, resumen } = preparar(datos);
    const partes = [];
    let y = cabecera(partes, resumen) + 30;
    const col = (W - MARGEN * 2) / n;
    const t = tamanoPara(n);
    const centro = (i) => MARGEN + col * i + col / 2;
    const yLinea = y + 62;
    partes.push(`<line x1="${centro(0)}" y1="${yLinea}" x2="${centro(n - 1)}" y2="${yLinea}" stroke="#cbd5e1" stroke-width="6" stroke-linecap="round"/>`);
    const cols = fases.map((f) => ({ nombre: recortar(renglones(f.nombre, maxCaracteres(col - 28, t)), n >= 5 ? 4 : 3), producto: limpio(f.productos) ? recortar(renglones(limpio(f.productos), maxCaracteres(col - 28, t - 4)), 3) : [] }));
    fases.forEach((f, i) => {
        const cx = centro(i);
        const anchoP = f.duracionTxt.length * 10 + 30;
        partes.push(`<rect x="${cx - anchoP / 2}" y="${y - 14}" width="${anchoP}" height="30" rx="15" fill="${f.c.suave}" stroke="${f.c.fuerte}" stroke-opacity="0.5"/>`);
        partes.push(texto(cx, y + 7, f.duracionTxt, { size: 17, peso: 700, color: f.c.texto, ancla: 'middle' }));
        if (i < n - 1) partes.push(`<line x1="${cx}" y1="${yLinea}" x2="${centro(i + 1)}" y2="${yLinea}" stroke="${f.c.fuerte}" stroke-width="6" stroke-linecap="round"/>`);
    });
    fases.forEach((f, i) => {
        const cx = centro(i);
        partes.push(`<circle cx="${cx}" cy="${yLinea}" r="34" fill="#ffffff"/><circle cx="${cx}" cy="${yLinea}" r="30" fill="${f.c.fuerte}"/><circle cx="${cx}" cy="${yLinea}" r="38" fill="none" stroke="${f.c.fuerte}" stroke-opacity="0.25" stroke-width="5"/>`);
        partes.push(texto(cx, yLinea + 10, `${i + 1}`, { size: 28, peso: 700, color: '#ffffff', ancla: 'middle' }));
        let yy = yLinea + 78;
        cols[i].nombre.forEach((l) => { partes.push(texto(cx, yy, l, { size: t, peso: 700, color: '#0f172a', ancla: 'middle' })); yy += t + 6; });
        yy = yLinea + 78 + Math.max(...cols.map((c) => c.nombre.length)) * (t + 6) + 8;
        cols[i].producto.forEach((l) => { partes.push(texto(cx, yy, l, { size: t - 4, color: '#475569', ancla: 'middle', italica: true })); yy += t + 1; });
    });
    const alto = yLinea + 78 + Math.max(...cols.map((c) => c.nombre.length)) * (t + 6) + 8 + Math.max(0, ...cols.map((c) => c.producto.length)) * (t + 1);
    fases.forEach((f, i) => partes.push(texto(centro(i), alto + 22, f.tramo, { size: 17, color: f.c.texto, ancla: 'middle', peso: 700 })));
    return cerrar(partes, alto + 22 + MARGEN);
};

// Estilo «Escalera»: cada fase es un peldaño más alto que el anterior; dentro, su número y su nombre.
const svgEscalera = (datos) => {
    const { fases, n, resumen } = preparar(datos);
    const partes = [];
    const y0 = cabecera(partes, resumen) + 10;
    const col = (W - MARGEN * 2) / n;
    const t = tamanoPara(n) - 1;
    const cols = fases.map((f) => ({ nombre: recortar(renglones(f.nombre, maxCaracteres(col - 40, t)), 4), producto: limpio(f.productos) ? recortar(renglones(limpio(f.productos), maxCaracteres(col - 26, t - 3)), 3) : [] }));
    const PASO = Math.min(46, 200 / n);
    const altoBase = 70 + Math.max(...cols.map((c) => c.nombre.length)) * (t + 6) + 24;
    const yPiso = y0 + altoBase + PASO * (n - 1);
    fases.forEach((f, i) => {
        const x = MARGEN + col * i;
        const alto = altoBase + PASO * i;
        const yTop = yPiso - alto;
        partes.push(`<rect x="${x + 3}" y="${yTop}" width="${col - 6}" height="${alto}" rx="14" fill="${f.c.fuerte}"/>`);
        partes.push(`<rect x="${x + 3}" y="${yPiso - 14}" width="${col - 6}" height="14" fill="${f.c.fuerte}"/>`);
        partes.push(`<circle cx="${x + 40}" cy="${yTop + 40}" r="22" fill="#ffffff"/>`);
        partes.push(texto(x + 40, yTop + 49, `${i + 1}`, { size: 24, peso: 800, color: f.c.fuerte, ancla: 'middle' }));
        partes.push(texto(x + col - 22, yTop + 47, f.duracionTxt, { size: 17, peso: 700, color: '#ffffff', ancla: 'end' }));
        let yy = yTop + 96;
        cols[i].nombre.forEach((l) => { partes.push(texto(x + 22, yy, l, { size: t, peso: 700, color: '#ffffff' })); yy += t + 6; });
        let yp = yPiso + 32;
        partes.push(texto(x + col / 2, yp, f.tramo, { size: 17, peso: 700, color: f.c.texto, ancla: 'middle' }));
        yp += 28;
        cols[i].producto.forEach((l) => { partes.push(texto(x + col / 2, yp, l, { size: t - 3, color: '#475569', ancla: 'middle', italica: true })); yp += t + 2; });
    });
    partes.push(`<line x1="${MARGEN}" y1="${yPiso}" x2="${W - MARGEN}" y2="${yPiso}" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/>`);
    return cerrar(partes, yPiso + 60 + Math.max(0, ...cols.map((c) => c.producto.length)) * (t + 2) + MARGEN - 10);
};

// Texto común bajo el dibujo de cada fase: nombre, producto y tramo del calendario, centrados en su columna.
const columnasDe = (fases, n, col, t) => fases.map((f) => ({
    nombre: recortar(renglones(f.nombre, maxCaracteres(col - 28, t)), n >= 5 ? 4 : 3),
    producto: limpio(f.productos) ? recortar(renglones(limpio(f.productos), maxCaracteres(col - 28, t - 4)), 3) : [],
}));
const pieColumnas = (partes, fases, cols, centro, y, t) => {
    const altoNombre = Math.max(...cols.map((c) => c.nombre.length)) * (t + 6);
    const altoProducto = Math.max(0, ...cols.map((c) => c.producto.length)) * (t + 1);
    fases.forEach((f, i) => {
        const cx = centro(i);
        let yy = y;
        cols[i].nombre.forEach((l) => { partes.push(texto(cx, yy, l, { size: t, peso: 700, color: '#0f172a', ancla: 'middle' })); yy += t + 6; });
        yy = y + altoNombre + 6;
        cols[i].producto.forEach((l) => { partes.push(texto(cx, yy, l, { size: t - 4, color: '#475569', ancla: 'middle', italica: true })); yy += t + 1; });
        partes.push(texto(cx, y + altoNombre + 6 + altoProducto + 20, f.tramo, { size: 17, peso: 700, color: f.c.texto, ancla: 'middle' }));
    });
    return y + altoNombre + 6 + altoProducto + 20;
};

// Estilo «Camino»: una carretera ondulada con una parada por fase, de la salida a la meta.
const svgCamino = (datos) => {
    const { fases, n, resumen } = preparar(datos);
    const partes = [];
    const y0 = cabecera(partes, resumen) + 24;
    const col = (W - MARGEN * 2) / n;
    const t = tamanoPara(n);
    const centro = (i) => MARGEN + col * i + col / 2;
    const A = 34; // cuánto sube y baja el camino
    const yMedio = y0 + 92;
    const yDe = (i) => yMedio + (i % 2 === 0 ? A : -A);
    // Camino: curvas suaves entre parada y parada, con entrada y salida rectas.
    let d = `M ${MARGEN} ${yDe(0)} L ${centro(0)} ${yDe(0)}`;
    for (let i = 1; i < n; i += 1) {
        const x1 = centro(i - 1);
        const x2 = centro(i);
        const xm = (x1 + x2) / 2;
        d += ` C ${xm} ${yDe(i - 1)}, ${xm} ${yDe(i)}, ${x2} ${yDe(i)}`;
    }
    d += ` L ${W - MARGEN} ${yDe(n - 1)}`;
    partes.push(`<path d="${d}" fill="none" stroke="#334155" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/>`);
    partes.push(`<path d="${d}" fill="none" stroke="#ffffff" stroke-width="3" stroke-dasharray="16 14" stroke-linecap="round"/>`);
    // Meta: banderín al final del camino.
    const xm = W - MARGEN - 6;
    const ym = yDe(n - 1);
    partes.push(`<line x1="${xm}" y1="${ym}" x2="${xm}" y2="${ym - 62}" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/><polygon points="${xm},${ym - 62} ${xm - 34},${ym - 50} ${xm},${ym - 38}" fill="#16a34a"/>`);
    // Paradas: un marcador con el número sobre el camino y la duración encima.
    fases.forEach((f, i) => {
        const cx = centro(i);
        const cy = yDe(i);
        partes.push(`<polygon points="${cx - 16},${cy - 34} ${cx + 16},${cy - 34} ${cx},${cy - 6}" fill="${f.c.fuerte}"/>`);
        partes.push(`<circle cx="${cx}" cy="${cy - 52}" r="30" fill="${f.c.fuerte}" stroke="#ffffff" stroke-width="4"/>`);
        partes.push(texto(cx, cy - 42, `${i + 1}`, { size: 28, peso: 800, color: '#ffffff', ancla: 'middle' }));
        partes.push(`<circle cx="${cx}" cy="${cy}" r="7" fill="#ffffff"/>`);
    });
    const yTexto = yMedio + A + 62;
    fases.forEach((f, i) => {
        const cx = centro(i);
        const ancho = f.duracionTxt.length * 10 + 28;
        partes.push(`<rect x="${cx - ancho / 2}" y="${yTexto - 22}" width="${ancho}" height="30" rx="15" fill="${f.c.suave}" stroke="${f.c.fuerte}" stroke-opacity="0.5"/>`);
        partes.push(texto(cx, yTexto - 1, f.duracionTxt, { size: 17, peso: 700, color: f.c.texto, ancla: 'middle' }));
    });
    const fin = pieColumnas(partes, fases, columnasDe(fases, n, col, t), centro, yTexto + 44, t);
    return cerrar(partes, fin + MARGEN);
};

// Estilo «Hexágonos»: un hexágono por fase, unidos como un panal.
const svgHexagonos = (datos) => {
    const { fases, n, resumen } = preparar(datos);
    const partes = [];
    const y0 = cabecera(partes, resumen) + 16;
    const col = (W - MARGEN * 2) / n;
    const t = tamanoPara(n);
    const centro = (i) => MARGEN + col * i + col / 2;
    const R = Math.min(84, col * 0.44);
    const cy = y0 + R;
    const hex = (cx, r) => Array.from({ length: 6 }, (_, k) => { const ang = (Math.PI / 3) * k; return `${(cx + r * Math.cos(ang)).toFixed(1)},${(cy + r * Math.sin(ang)).toFixed(1)}`; }).join(' ');
    // Uniones entre hexágonos.
    for (let i = 0; i < n - 1; i += 1) {
        partes.push(`<line x1="${centro(i) + R}" y1="${cy}" x2="${centro(i + 1) - R}" y2="${cy}" stroke="${fases[i].c.fuerte}" stroke-width="6" stroke-linecap="round" stroke-dasharray="1 12"/>`);
    }
    fases.forEach((f, i) => {
        const cx = centro(i);
        partes.push(`<polygon points="${hex(cx, R)}" fill="${f.c.suave}" stroke="${f.c.fuerte}" stroke-opacity="0.35" stroke-width="3"/>`);
        partes.push(`<polygon points="${hex(cx, R - 12)}" fill="${f.c.fuerte}"/>`);
        partes.push(texto(cx, cy - 22, 'FASE', { size: Math.max(13, R * 0.19), peso: 700, color: '#ffffff', ancla: 'middle', espacio: 2 }));
        partes.push(texto(cx, cy + R * 0.22, `${i + 1}`, { size: R * 0.62, peso: 800, color: '#ffffff', ancla: 'middle' }));
        partes.push(texto(cx, cy + R * 0.22 + Math.max(18, R * 0.26), f.duracionTxt, { size: Math.max(13, R * 0.19), peso: 700, color: '#ffffff', ancla: 'middle' }));
    });
    const fin = pieColumnas(partes, fases, columnasDe(fases, n, col, t), centro, cy + R + 44, t);
    return cerrar(partes, fin + MARGEN);
};

// Estilo «Tarjetas»: una tarjeta por fase con su franja de color, un número grande y la flecha a la siguiente.
const svgTarjetas = (datos) => {
    const { fases, n, resumen } = preparar(datos);
    const partes = [];
    const y0 = cabecera(partes, resumen) + 8;
    const HUECO = 22;
    const col = (W - MARGEN * 2 - HUECO * (n - 1)) / n;
    // Con columnas angostas, letra algo menor y la duración debajo de «FASE n» (no caben en una línea).
    const angosta = col < 215;
    const t = tamanoPara(n) - (angosta ? 3 : 0);
    const x = (i) => MARGEN + i * (col + HUECO);
    const cols = fases.map((f) => ({
        nombre: recortar(renglones(f.nombre, maxCaracteres(col - 30, t)), n >= 5 ? 5 : 3),
        producto: limpio(f.productos) ? recortar(renglones(limpio(f.productos), maxCaracteres(col - 30, t - 4)), 3) : [],
    }));
    const altoNombre = Math.max(...cols.map((c) => c.nombre.length)) * (t + 6);
    const altoProducto = Math.max(0, ...cols.map((c) => c.producto.length)) * (t + 1);
    const FRANJA = angosta ? 84 : 64;
    const alto = FRANJA + 34 + altoNombre + (altoProducto ? 22 + altoProducto : 0) + 58;
    fases.forEach((f, i) => {
        const xi = x(i);
        partes.push(`<rect x="${xi + 3}" y="${y0 + 5}" width="${col}" height="${alto}" rx="18" fill="#0f172a" fill-opacity="0.07"/>`);
        partes.push(`<rect x="${xi}" y="${y0}" width="${col}" height="${alto}" rx="18" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>`);
        // Franja superior de color (esquinas de arriba redondeadas).
        partes.push(`<path d="M ${xi} ${y0 + 18} a 18 18 0 0 1 18 -18 h ${col - 36} a 18 18 0 0 1 18 18 v ${FRANJA - 18} h ${-col} z" fill="${f.c.fuerte}"/>`);
        partes.push(texto(xi + 20, y0 + (angosta ? 36 : 41), `FASE ${i + 1}`, { size: 20, peso: 800, color: '#ffffff', espacio: 1.5 }));
        if (angosta) partes.push(texto(xi + 20, y0 + 62, f.duracionTxt, { size: 16, peso: 700, color: '#ffffff' }));
        else partes.push(texto(xi + col - 18, y0 + 41, f.duracionTxt, { size: 16, peso: 700, color: '#ffffff', ancla: 'end' }));
        // Número grande de fondo.
        partes.push(texto(xi + col - 14, y0 + alto - 46, `${i + 1}`, { size: 120, peso: 800, color: f.c.suave, ancla: 'end' }));
        let yy = y0 + FRANJA + 40;
        cols[i].nombre.forEach((l) => { partes.push(texto(xi + 20, yy, l, { size: t, peso: 700, color: '#0f172a' })); yy += t + 6; });
        yy = y0 + FRANJA + 40 + altoNombre + 10;
        if (cols[i].producto.length) {
            partes.push(`<rect x="${xi + 20}" y="${yy - 16}" width="34" height="4" rx="2" fill="${f.c.fuerte}"/>`);
            yy += 10;
            cols[i].producto.forEach((l) => { partes.push(texto(xi + 20, yy, l, { size: t - 4, color: '#475569', italica: true })); yy += t + 1; });
        }
        partes.push(texto(xi + 20, y0 + alto - 22, f.tramo, { size: 17, peso: 700, color: f.c.texto }));
        // Flecha a la siguiente fase.
        if (i < n - 1) {
            const cx = xi + col + HUECO / 2;
            const cyF = y0 + alto / 2;
            partes.push(`<circle cx="${cx}" cy="${cyF}" r="17" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>`);
            partes.push(`<path d="M ${cx - 5} ${cyF - 8} L ${cx + 5} ${cyF} L ${cx - 5} ${cyF + 8}" fill="none" stroke="#475569" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`);
        }
    });
    return cerrar(partes, y0 + alto + MARGEN);
};

// Estilos disponibles (el primero es el de siempre). `id` se guarda en el proyecto.
export const ESTILOS_FASES = [
    { id: 'flechas', nombre: 'Flechas', descripcion: 'Una flecha por fase, con su tarjeta y la línea del calendario.' },
    { id: 'linea', nombre: 'Línea de tiempo', descripcion: 'Círculos numerados sobre una línea; sobrio y con poco texto.' },
    { id: 'escalera', nombre: 'Escalera', descripcion: 'Cada fase es un peldaño más alto: muestra el avance.' },
    { id: 'camino', nombre: 'Camino', descripcion: 'Una carretera con una parada por fase, de la salida a la meta.' },
    { id: 'hexagonos', nombre: 'Hexágonos', descripcion: 'Un hexágono por fase, unidos como un panal.' },
    { id: 'tarjetas', nombre: 'Tarjetas', descripcion: 'Una tarjeta por fase con su número grande y la flecha a la siguiente.' },
];
const DIBUJOS = { flechas: svgFlechas, linea: svgLinea, escalera: svgEscalera, camino: svgCamino, hexagonos: svgHexagonos, tarjetas: svgTarjetas };

/**
 * Dibuja la ruta de fases con el estilo elegido (`datos.estilo`; por defecto, flechas).
 * @returns {{ svg: string, w: number, h: number }}
 */
export const fasesSvg = (datos) => (DIBUJOS[datos?.estilo] || svgFlechas)(datos);

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
        estilo: ESTILOS_FASES.some((e) => e.id === fasesForm?.estiloGrafico) ? fasesForm.estiloGrafico : 'flechas',
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
