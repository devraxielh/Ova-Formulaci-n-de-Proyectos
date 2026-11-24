/*
 * Árbol del problema: raíces (causas), tronco (problema central) y ramas (efectos).
 * Se guarda en data.arbol = { problema, causas: [], efectos: [] } y se dibuja como SVG,
 * la misma figura que se ve en la página, en la vista previa y, convertida a PNG, en Word y PDF.
 *
 * Árbol de objetivos: es el mismo árbol «en positivo». Usa la misma forma, con `tipo: 'objetivos'`:
 * problema → objetivo central, causas → medios, efectos → fines. Se guarda en data.arbolObjetivos.
 */

export const MAX_RAMAS = 6;

const limpio = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();
const lista = (v) => (Array.isArray(v) ? v : []).map(limpio).filter(Boolean).slice(0, MAX_RAMAS);

// Árbol del proyecto. Si aún no se ha hecho en su página, parte de lo que se escribió en la Ideación.
export const leerArbol = (d) => {
    const a = d?.arbol;
    if (a && typeof a === 'object') return { problema: limpio(a.problema), causas: lista(a.causas), efectos: lista(a.efectos), explicacion: limpio(a.explicacion), propio: true };
    const idea = d?.idea || {};
    return { problema: limpio(idea.problema), causas: lista([idea.causa1, idea.causa2, idea.causa3]), efectos: lista([idea.efecto1, idea.efecto2, idea.efecto3]), propio: false };
};

// Árbol de objetivos del proyecto. Si aún no se ha hecho, su centro parte del objetivo general.
export const leerArbolObjetivos = (d) => {
    const a = d?.arbolObjetivos;
    if (a && typeof a === 'object') return { tipo: 'objetivos', problema: limpio(a.problema), causas: lista(a.causas), efectos: lista(a.efectos), explicacion: limpio(a.explicacion), propio: true };
    return { tipo: 'objetivos', problema: limpio(d?.objetivoGeneral), causas: [], efectos: [], propio: false };
};

// Palabras de cada árbol: cómo se llama cada nivel en la figura, en la página y en el párrafo del documento.
export const NIVELES = {
    problema: {
        nombre: 'Árbol del problema', centro: 'Problema central', abajo: 'Causa', arriba: 'Efecto', abajoPlural: 'Causas', arribaPlural: 'Efectos',
        rotuloArriba: 'EFECTOS · ¿Qué consecuencias trae?', rotuloAbajo: 'CAUSAS · ¿Por qué ocurre?',
        colores: { arriba: { fondo: '#ffe4e6', borde: '#be123c' }, centro: { fondo: '#e0e7ff', borde: '#4338ca' }, abajo: { fondo: '#fef3c7', borde: '#b45309' } },
    },
    objetivos: {
        nombre: 'Árbol de objetivos', centro: 'Objetivo central', abajo: 'Medio', arriba: 'Fin', abajoPlural: 'Medios', arribaPlural: 'Fines',
        rotuloArriba: 'FINES · ¿Para qué se logra?', rotuloAbajo: 'MEDIOS · ¿Cómo se logra?',
        colores: { arriba: { fondo: '#dcfce7', borde: '#15803d' }, centro: { fondo: '#e0e7ff', borde: '#4338ca' }, abajo: { fondo: '#e0f2fe', borde: '#0369a1' } },
    },
};
export const nivelesDe = (arbol) => NIVELES[arbol?.tipo === 'objetivos' ? 'objetivos' : 'problema'];

// Párrafo que presenta la figura en el documento, para que no quede aislada. `figura` es cómo se nombra («la Figura 1»).
// Si el estudiante escribió el suyo, se usa ese; si no, se arma con el contenido del árbol.
const minuscula = (t) => (/^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]/.test(t) ? t.charAt(0).toLowerCase() + t.slice(1) : t);
const sinPunto = (t) => t.replace(/[.;,\s]+$/, '');
const enumerar = (items) => {
    const l = items.map((x) => minuscula(sinPunto(x)));
    if (l.length === 2) return `${l[0]}, y ${l[1]}`;
    return l.length > 2 ? `${l.slice(0, -1).join('; ')}; y ${l[l.length - 1]}` : l[0] || '';
};
export const explicacionArbol = (arbol, figura = 'La figura') => {
    if (arbol.explicacion) return arbol.explicacion;
    const n = (lista, uno, varios) => (lista.length === 1 ? uno : varios);
    if (arbol.tipo === 'objetivos') {
        return `${figura} presenta el árbol de objetivos, que convierte el problema estudiado en la situación que se quiere alcanzar. En el centro se ubica el objetivo central: ${minuscula(sinPunto(arbol.problema))}. `
            + `En la parte inferior ${n(arbol.causas, 'aparece el medio para lograrlo', 'aparecen los medios para lograrlo')}: ${enumerar(arbol.causas)}. `
            + `En la parte superior ${n(arbol.efectos, 'se muestra el fin al que contribuye', 'se muestran los fines a los que contribuye')}: ${enumerar(arbol.efectos)}.`;
    }
    return `${figura} presenta el árbol del problema, que resume la situación estudiada en tres niveles. En el centro se ubica el problema central: ${minuscula(sinPunto(arbol.problema))}. `
        + `En la parte inferior ${n(arbol.causas, 'aparece la causa que lo origina', 'aparecen las causas que lo originan')}: ${enumerar(arbol.causas)}. `
        + `En la parte superior ${n(arbol.efectos, 'se muestra el efecto que produce', 'se muestran los efectos que produce')}: ${enumerar(arbol.efectos)}.`;
};

// Para ser una figura del documento necesita el problema, al menos una causa y al menos un efecto.
export const arbolCompleto = (a) => Boolean(a && a.problema && a.causas.length && a.efectos.length);

// Los textos que usa el Planteamiento para su borrador (los mismos campos que tenía la Ideación).
export const ideaConArbol = (idea, d) => {
    const a = leerArbol(d);
    const base = idea || {};
    if (!a.propio) return base;
    const [c1 = '', c2 = '', ...cResto] = a.causas;
    const [e1 = '', e2 = '', ...eResto] = a.efectos;
    return { ...base, problema: a.problema || base.problema || '', causa1: c1, causa2: c2, causa3: cResto.join(', '), efecto1: e1, efecto2: e2, efecto3: eResto.join(', ') };
};

/* ---------- Dibujo ---------- */

const xml = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Parte un texto en renglones de un ancho aproximado (el SVG no ajusta el texto solo).
const renglones = (texto, maxChars) => {
    const out = [];
    let actual = '';
    limpio(texto).split(' ').forEach((palabra) => {
        let p = palabra;
        while (p.length > maxChars) { // palabra más larga que la caja: se corta
            if (actual) { out.push(actual); actual = ''; }
            out.push(`${p.slice(0, maxChars - 1)}-`);
            p = p.slice(maxChars - 1);
        }
        if (!actual) actual = p;
        else if (`${actual} ${p}`.length <= maxChars) actual = `${actual} ${p}`;
        else { out.push(actual); actual = p; }
    });
    if (actual) out.push(actual);
    return out;
};

const W = 1200;
const MARGEN = 40;
const SEP = 20;

// Una fila de cajas del mismo alto, centrada. Devuelve el SVG, el alto y el centro (x) de cada caja.
const fila = (textos, y, c, { ancho, fuente = 22, negrita = false } = {}) => {
    const n = textos.length;
    const util = W - MARGEN * 2;
    const w = ancho || Math.min(360, (util - SEP * (n - 1)) / n);
    const total = w * n + SEP * (n - 1);
    const x0 = (W - total) / 2;
    const interlinea = Math.round(fuente * 1.3);
    const maxChars = Math.max(6, Math.floor((w - 28) / (fuente * 0.54)));
    const partes = textos.map((t) => renglones(t, maxChars));
    const h = Math.max(...partes.map((p) => p.length)) * interlinea + 30;
    const svg = partes.map((lineas, i) => {
        const x = x0 + i * (w + SEP);
        const y0 = y + h / 2 - ((lineas.length - 1) * interlinea) / 2 + fuente * 0.35;
        return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${c.fondo}" stroke="${c.borde}" stroke-width="2.5"/>`
            + lineas.map((l, k) => `<text x="${x + w / 2}" y="${y0 + k * interlinea}" text-anchor="middle" font-size="${fuente}"${negrita ? ' font-weight="700"' : ''} fill="#111827">${xml(l)}</text>`).join('');
    }).join('');
    return { svg, h, centros: textos.map((_, i) => x0 + i * (w + SEP) + w / 2) };
};

const rotuloFila = (texto, y) => `<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="17" font-weight="700" letter-spacing="2" fill="#475569">${xml(texto)}</text>`;

// Conectores entre una fila y el problema: una línea por caja hasta una barra, y de la barra al tronco.
const conectores = (centros, yCajas, yBarra, yTronco) => {
    const linea = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#64748b" stroke-width="2.5" stroke-linecap="round"/>`;
    const min = Math.min(...centros, W / 2);
    const max = Math.max(...centros, W / 2);
    return centros.map((x) => linea(x, yCajas, x, yBarra)).join('') + linea(min, yBarra, max, yBarra) + linea(W / 2, yBarra, W / 2, yTronco);
};

/**
 * Dibuja el árbol. `relleno` pone textos de ejemplo donde falta algo (para la página, mientras se escribe).
 * @returns {{ svg: string, w: number, h: number }}
 */
export const arbolSvg = (arbol, { relleno = false } = {}) => {
    const a = arbol || { problema: '', causas: [], efectos: [] };
    const nv = nivelesDe(a);
    const efectos = a.efectos.length ? a.efectos : relleno ? [`${nv.arriba} 1`, `${nv.arriba} 2`] : [];
    const causas = a.causas.length ? a.causas : relleno ? [`${nv.abajo} 1`, `${nv.abajo} 2`] : [];
    const problema = a.problema || (relleno ? nv.centro : '');
    const fuente = (n) => (n > 4 ? 18 : n > 3 ? 20 : 22);
    const HUECO = 56; // espacio de los conectores

    let y = 30;
    const partes = [];
    partes.push(rotuloFila(nv.rotuloArriba, y + 4));
    y += 22;
    const fe = fila(efectos.length ? efectos : [' '], y, nv.colores.arriba, { fuente: fuente(efectos.length) });
    partes.push(fe.svg);
    const yEfectos = y + fe.h;
    y = yEfectos + HUECO;
    const fp = fila([problema || ' '], y, nv.colores.centro, { ancho: 720, fuente: 24, negrita: true });
    partes.push(fp.svg);
    partes.unshift(conectores(fe.centros, yEfectos, yEfectos + 28, y));
    const yProblema = y + fp.h;
    y = yProblema + HUECO;
    const fc = fila(causas.length ? causas : [' '], y, nv.colores.abajo, { fuente: fuente(causas.length) });
    partes.push(fc.svg);
    partes.unshift(conectores(fc.centros, y, y - 28, yProblema));
    y += fc.h;
    partes.push(rotuloFila(nv.rotuloAbajo, y + 32));
    const h = y + 50;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}" viewBox="0 0 ${W} ${h}" font-family="Arial, Helvetica, sans-serif"><rect width="${W}" height="${h}" fill="#ffffff"/>${partes.join('')}</svg>`;
    return { svg, w: W, h };
};

export const arbolDataUrl = (arbol, opciones) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(arbolSvg(arbol, opciones).svg)}`;

// Solo en el navegador: la figura como PNG, para Word, PDF y para descargarla.
export const arbolPng = (arbol) => new Promise((resolve, reject) => {
    const { svg, w, h } = arbolSvg(arbol);
    const img = new Image();
    img.onload = () => {
        try {
            const escala = 2; // nítida al imprimir
            const canvas = document.createElement('canvas');
            canvas.width = w * escala;
            canvas.height = h * escala;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/png');
            const binario = atob(dataUrl.split(',')[1]);
            const data = new Uint8Array(binario.length);
            for (let i = 0; i < binario.length; i += 1) data[i] = binario.charCodeAt(i);
            resolve({ data, dataUrl, type: 'png', w, h });
        } catch (error) { reject(error); }
    };
    img.onerror = () => reject(new Error('No se pudo dibujar el árbol del problema.'));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
});
