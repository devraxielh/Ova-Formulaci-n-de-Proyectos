// Estadística descriptiva básica para el análisis de datos: frecuencias, porcentajes y medidas de resumen.

const vacio = (v) => v === null || v === undefined || String(v).trim() === '';
// «3,5» o «3.5» → 3.5; texto no numérico → NaN.
export const aNumero = (v) => {
    if (typeof v === 'number') return v;
    const s = String(v ?? '').trim().replace(/\s/g, '');
    if (!/^-?\d+([.,]\d+)?$/.test(s)) return NaN;
    return Number(s.replace(',', '.'));
};

export const redondear = (n, d = 2) => (Number.isFinite(n) ? Math.round(n * 10 ** d) / 10 ** d : n);
// Número con coma decimal, como se escribe en español.
export const fmt = (n, d = 1) => (Number.isFinite(n) ? redondear(n, d).toFixed(d).replace('.', ',') : '—');

// CSV con comas o punto y coma, comillas y saltos de línea dentro de comillas.
export const leerCsv = (texto) => {
    const limpio = String(texto).replace(/^﻿/, '');
    const primera = limpio.split(/\r?\n/)[0] || '';
    const sep = [';', '\t', ','].map((s) => [s, primera.split(s).length]).sort((a, b) => b[1] - a[1])[0][0];
    const filas = [];
    let fila = [];
    let celda = '';
    let comillas = false;
    for (let i = 0; i < limpio.length; i += 1) {
        const c = limpio[i];
        if (comillas) {
            if (c === '"' && limpio[i + 1] === '"') { celda += '"'; i += 1; } else if (c === '"') comillas = false; else celda += c;
        } else if (c === '"') comillas = true;
        else if (c === sep) { fila.push(celda); celda = ''; } else if (c === '\n' || c === '\r') {
            if (c === '\r' && limpio[i + 1] === '\n') i += 1;
            fila.push(celda); celda = '';
            if (fila.some((x) => x.trim() !== '')) filas.push(fila);
            fila = [];
        } else celda += c;
    }
    fila.push(celda);
    if (fila.some((x) => x.trim() !== '')) filas.push(fila);
    return filas.map((f) => f.map((x) => x.trim()));
};

// Primera fila = nombres de las variables; el resto, un participante por fila.
export const aTabla = (filas) => {
    const [cabecera = [], ...resto] = filas;
    const ancho = cabecera.length;
    return {
        columnas: cabecera.map((nombre, i) => ({ nombre: String(nombre ?? '').trim() || `Variable ${i + 1}`, tipo: '', opciones: [] })),
        filas: resto.map((f) => Array.from({ length: ancho }, (_, i) => f[i] ?? '')),
    };
};

export const descriptivos = (valores) => {
    const xs = valores.map(aNumero).filter(Number.isFinite).sort((a, b) => a - b);
    const n = xs.length;
    if (!n) return null;
    const media = xs.reduce((s, x) => s + x, 0) / n;
    const mediana = n % 2 ? xs[(n - 1) / 2] : (xs[n / 2 - 1] + xs[n / 2]) / 2;
    const de = n > 1 ? Math.sqrt(xs.reduce((s, x) => s + (x - media) ** 2, 0) / (n - 1)) : 0;
    return { n, media, mediana, de, min: xs[0], max: xs[n - 1] };
};

// Frecuencias y porcentajes. `orden` fija el orden de las categorías (escalas); `multiple` separa «a; b».
export const frecuencias = (valores, { orden = [], multiple = false, maximo = 12 } = {}) => {
    const presentes = valores.filter((v) => !vacio(v));
    const conteo = new Map();
    presentes.forEach((v) => {
        const partes = multiple ? String(v).split(';').map((x) => x.trim()).filter(Boolean) : [String(v).trim()];
        partes.forEach((p) => conteo.set(p, (conteo.get(p) || 0) + 1));
    });
    const total = presentes.length;
    let lista = [...conteo].map(([valor, n]) => ({ valor, n }));
    if (orden.length) {
        lista = [...orden.map((o) => ({ valor: o, n: conteo.get(o) || 0 })), ...lista.filter((x) => !orden.includes(x.valor))];
    } else {
        const numericas = lista.every((x) => Number.isFinite(aNumero(x.valor)));
        lista.sort((a, b) => (numericas ? aNumero(a.valor) - aNumero(b.valor) : b.n - a.n || a.valor.localeCompare(b.valor, 'es')));
        if (lista.length > maximo) {
            const resto = lista.slice(maximo - 1);
            lista = [...lista.slice(0, maximo - 1), { valor: `Otras (${resto.length})`, n: resto.reduce((s, x) => s + x.n, 0) }];
        }
    }
    return { total, items: lista.map((x) => ({ ...x, pct: total ? (x.n / total) * 100 : 0 })) };
};

// Decide cómo tratar cada variable: numérica (medidas de resumen), categórica (frecuencias) o texto libre.
export const analizar = ({ columnas, filas }) => columnas.map((col, i) => {
    const valores = filas.map((f) => f[i]);
    const presentes = valores.filter((v) => !vacio(v));
    const numeros = presentes.map(aNumero).filter(Number.isFinite);
    const unicos = new Set(presentes.map((v) => String(v).trim())).size;
    let clase = 'categorica';
    if (col.tipo === 'abierta') clase = 'texto';
    else if (col.tipo === 'numero') clase = 'numerica';
    else if (!col.tipo && presentes.length && numeros.length / presentes.length >= 0.9 && unicos > 7) clase = 'numerica';
    else if (!col.tipo && unicos > 20 && unicos > presentes.length * 0.6) clase = 'texto';
    const base = { nombre: col.nombre, clase, n: presentes.length, perdidos: valores.length - presentes.length };
    if (clase === 'texto') return { ...base, muestras: presentes.slice(0, 5).map(String) };
    if (clase === 'numerica') return { ...base, resumen: descriptivos(presentes) };
    const frec = frecuencias(valores, { orden: col.tipo === 'likert' || col.tipo === 'sino' ? col.opciones : [], multiple: col.tipo === 'multiple' });
    // En las escalas también se informa el puntaje promedio (1 = primera opción).
    const puntaje = col.tipo === 'likert' && col.opciones.length ? descriptivos(presentes.map((v) => col.opciones.indexOf(String(v)) + 1).filter((x) => x > 0)) : null;
    return { ...base, frec, puntaje, multiple: col.tipo === 'multiple' };
});

// Tabla lista para «Tablas y figuras» (APA: sin decimales en n, un decimal en %).
export const tablaDe = (v) => {
    if (v.clase === 'numerica') {
        const r = v.resumen;
        return { head: ['n', 'Media', 'Mediana', 'Desviación estándar', 'Mínimo', 'Máximo'], rows: [[String(r.n), fmt(r.media, 2), fmt(r.mediana, 2), fmt(r.de, 2), fmt(r.min, 2), fmt(r.max, 2)]] };
    }
    return {
        head: ['Categoría', 'Frecuencia', 'Porcentaje'],
        rows: [...v.frec.items.map((x) => [x.valor, String(x.n), `${fmt(x.pct)} %`]), ...(v.multiple ? [] : [['Total', String(v.frec.total), '100,0 %']])],
    };
};

// Frase de apoyo para redactar el resultado (el estudiante la ajusta).
export const fraseDe = (v) => {
    if (v.clase === 'numerica' && v.resumen) return `La media fue de ${fmt(v.resumen.media, 2)} (DE = ${fmt(v.resumen.de, 2)}), con valores entre ${fmt(v.resumen.min, 2)} y ${fmt(v.resumen.max, 2)} (n = ${v.resumen.n}).`;
    if (v.clase === 'categorica' && v.frec.items.length) {
        const mayor = [...v.frec.items].sort((a, b) => b.n - a.n)[0];
        return `El ${fmt(mayor.pct)} % de los participantes (n = ${mayor.n}) respondió «${mayor.valor}»${v.puntaje ? `; el puntaje promedio fue de ${fmt(v.puntaje.media, 2)} sobre ${v.frec.items.length} (DE = ${fmt(v.puntaje.de, 2)})` : ''}.`;
    }
    return '';
};

/* ---------- Cruce de variables: chi-cuadrado, correlaciones y comparación de grupos ---------- */

// ln Γ(x) (Lanczos), base de las distribuciones.
const lnGamma = (x) => {
    const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
    let y = x;
    let tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    let ser = 1.000000000190015;
    for (let j = 0; j < 6; j += 1) { y += 1; ser += c[j] / y; }
    return -tmp + Math.log((2.5066282746310005 * ser) / x);
};

// Gamma incompleta regularizada P(a, x).
const gammaP = (a, x) => {
    if (x <= 0) return 0;
    if (x < a + 1) {
        let sum = 1 / a;
        let del = sum;
        for (let n = 1; n < 500; n += 1) { del *= x / (a + n); sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-12) break; }
        return sum * Math.exp(-x + a * Math.log(x) - lnGamma(a));
    }
    let b = x + 1 - a;
    let c = 1 / 1e-300;
    let d = 1 / b;
    let h = d;
    for (let i = 1; i < 500; i += 1) {
        const an = -i * (i - a);
        b += 2;
        d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300;
        c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300;
        d = 1 / d;
        const del = d * c;
        h *= del;
        if (Math.abs(del - 1) < 1e-12) break;
    }
    return 1 - Math.exp(-x + a * Math.log(x) - lnGamma(a)) * h;
};

// Beta incompleta regularizada I_x(a, b) (fracción continua de Lentz).
const betaI = (x, a, b) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const bt = Math.exp(lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    const cf = (xx, aa, bb) => {
        let c = 1;
        let d = 1 - ((aa + bb) * xx) / (aa + 1);
        if (Math.abs(d) < 1e-300) d = 1e-300;
        d = 1 / d;
        let h = d;
        for (let m = 1; m < 300; m += 1) {
            const m2 = 2 * m;
            let an = (m * (bb - m) * xx) / ((aa + m2 - 1) * (aa + m2));
            d = 1 + an * d; if (Math.abs(d) < 1e-300) d = 1e-300;
            c = 1 + an / c; if (Math.abs(c) < 1e-300) c = 1e-300;
            d = 1 / d; h *= d * c;
            an = (-(aa + m) * (aa + bb + m) * xx) / ((aa + m2) * (aa + m2 + 1));
            d = 1 + an * d; if (Math.abs(d) < 1e-300) d = 1e-300;
            c = 1 + an / c; if (Math.abs(c) < 1e-300) c = 1e-300;
            d = 1 / d;
            const del = d * c;
            h *= del;
            if (Math.abs(del - 1) < 1e-12) break;
        }
        return h;
    };
    return x < (a + 1) / (a + b + 2) ? (bt * cf(x, a, b)) / a : 1 - (bt * cf(1 - x, b, a)) / b;
};

// Valor p de chi-cuadrado (cola superior) y de t de Student (dos colas).
export const pChi = (chi, gl) => (gl > 0 ? 1 - gammaP(gl / 2, chi / 2) : 1);
export const pT = (t, gl) => (gl > 0 ? betaI(gl / (gl + t * t), gl / 2, 0.5) : 1);
// APA: p con tres decimales, o «< ,001».
export const fmtP = (p) => (p < 0.001 ? '< ,001' : `= ${p.toFixed(3).replace('0.', ',')}`);

// Tabla de contingencia de dos variables categóricas con chi-cuadrado de independencia y V de Cramér.
export const cruzar = (a, b) => {
    const pares = a.map((x, i) => [x, b[i]]).filter(([x, y]) => !vacio(x) && !vacio(y)).map(([x, y]) => [String(x).trim(), String(y).trim()]);
    const filas = [...new Set(pares.map((p) => p[0]))];
    const cols = [...new Set(pares.map((p) => p[1]))];
    const n = pares.length;
    const obs = filas.map((f) => cols.map((c) => pares.filter((p) => p[0] === f && p[1] === c).length));
    const totF = obs.map((r) => r.reduce((s, x) => s + x, 0));
    const totC = cols.map((_, j) => obs.reduce((s, r) => s + r[j], 0));
    let chi = 0;
    let bajas = 0;
    obs.forEach((r, i) => r.forEach((o, j) => {
        const e = (totF[i] * totC[j]) / n;
        if (e < 5) bajas += 1;
        if (e > 0) chi += (o - e) ** 2 / e;
    }));
    const gl = (filas.length - 1) * (cols.length - 1);
    const k = Math.min(filas.length, cols.length) - 1;
    return { filas, cols, obs, totF, totC, n, chi, gl, p: gl > 0 ? pChi(chi, gl) : 1, v: n && k > 0 ? Math.sqrt(chi / (n * k)) : 0, bajas, celdas: filas.length * cols.length };
};

const rangos = (xs) => {
    const orden = xs.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]);
    const r = Array(xs.length);
    for (let i = 0; i < orden.length;) {
        let j = i;
        while (j + 1 < orden.length && orden[j + 1][0] === orden[i][0]) j += 1;
        for (let k = i; k <= j; k += 1) r[orden[k][1]] = (i + j) / 2 + 1; // empates: rango promedio
        i = j + 1;
    }
    return r;
};
const pearson = (x, y) => {
    const n = x.length;
    const mx = x.reduce((s, v) => s + v, 0) / n;
    const my = y.reduce((s, v) => s + v, 0) / n;
    let sxy = 0; let sxx = 0; let syy = 0;
    for (let i = 0; i < n; i += 1) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; }
    return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : NaN;
};
const pDeR = (r, n) => (n > 2 && Math.abs(r) < 1 ? pT((r * Math.sqrt(n - 2)) / Math.sqrt(1 - r * r), n - 2) : n > 2 ? 0 : 1);

// Correlación entre dos variables numéricas (o puntajes de escala): Pearson y Spearman.
export const correlacion = (a, b) => {
    const pares = a.map((x, i) => [aNumero(x), aNumero(b[i])]).filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
    const n = pares.length;
    if (n < 3) return null;
    const x = pares.map((p) => p[0]);
    const y = pares.map((p) => p[1]);
    const r = pearson(x, y);
    const rho = pearson(rangos(x), rangos(y));
    return { n, r, pR: pDeR(r, n), rho, pRho: pDeR(rho, n) };
};

// Qué tan fuerte es una asociación (criterios usuales de Cohen).
export const fuerza = (valor) => {
    const v = Math.abs(valor);
    return v < 0.1 ? 'muy débil o nula' : v < 0.3 ? 'débil' : v < 0.5 ? 'moderada' : 'fuerte';
};

// Una variable numérica comparada entre los grupos de una categórica: medidas por grupo.
export const porGrupo = (grupo, valores) => {
    const mapa = new Map();
    grupo.forEach((g, i) => {
        const v = aNumero(valores[i]);
        if (vacio(g) || !Number.isFinite(v)) return;
        const k = String(g).trim();
        mapa.set(k, [...(mapa.get(k) || []), v]);
    });
    return [...mapa].map(([nombre, xs]) => ({ nombre, ...descriptivos(xs) }));
};
