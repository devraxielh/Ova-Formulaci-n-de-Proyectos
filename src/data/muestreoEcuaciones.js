/*
 * Ecuaciones del muestreo, resueltas con los datos del proyecto. Una sola fuente para la ventana de muestreo
 * y para el documento (pantalla y Word). Cada ecuación es una lista de partes: texto o fracción { num, den }.
 */
import { CONFIANZAS, MUESTREOS, tamanoMuestra } from './metodologia.js';

const num = (v) => Number(v).toLocaleString('es-CO', { maximumFractionDigits: 2 });

export const LEYENDA_MUESTRA = 'N es el tamaño de la población; n, el tamaño de la muestra; Z, el valor de la distribución normal para el nivel de confianza; p y q, la proporción esperada y su complemento (0,5 cuando no se conoce); y e, el margen de error';

// `calc`: { finita, N, Z, e }. Devuelve [{ titulo, general, con, nota, soloVentana }].
export const ecuacionesMuestreo = ({ muestreo, calc, conglomerados, unidad = 'persona' }) => {
    const m = MUESTREOS.find((x) => x.id === muestreo);
    if (!m) return [];
    const N = Number(calc.N) || 0;
    const Z = Number(calc.Z) || 1.96;
    const e = Number(calc.e) || 0.05;
    const n = tamanoMuestra(calc);
    const conf = CONFIANZAS.find((c) => c.z === Z)?.label || '95 %';
    const lista = [];
    if (m.probabilistico) {
        lista.push(calc.finita ? {
            titulo: 'Tamaño de la muestra para población finita',
            general: ['n = ', { num: 'N · Z² · p · q', den: 'e² · (N − 1) + Z² · p · q' }],
            con: N > 0 ? ['n = ', { num: `${num(N)} · ${num(Z)}² · 0,5 · 0,5`, den: `${num(e)}² · (${num(N)} − 1) + ${num(Z)}² · 0,5 · 0,5` }, ` = ${num(n)}`] : null,
            nota: `Población de ${num(N)}, nivel de confianza del ${conf} y margen de error del ${Math.round(e * 100)} %.`,
            leyenda: true,
        } : {
            titulo: 'Tamaño de la muestra para población infinita o desconocida',
            general: ['n = ', { num: 'Z² · p · q', den: 'e²' }],
            con: ['n = ', { num: `${num(Z)}² · 0,5 · 0,5`, den: `${num(e)}²` }, ` = ${num(n)}`],
            nota: `Nivel de confianza del ${conf} y margen de error del ${Math.round(e * 100)} %.`,
            leyenda: true,
        });
    }
    if (m.id === 'aleatorio simple' && calc.finita && N > 0) {
        lista.push({ titulo: 'Probabilidad de selección de cada elemento', general: ['P = ', { num: 'n', den: 'N' }], con: ['P = ', { num: num(n), den: num(N) }, ` = ${num((n / N) * 100)} %`] });
    }
    if (m.id === 'sistemático' && calc.finita && N > 0 && n > 0) {
        const k = Math.max(1, Math.floor(N / n));
        lista.push({ titulo: 'Intervalo de selección', general: ['k = ', { num: 'N', den: 'n' }], con: ['k = ', { num: num(N), den: num(n) }, ` ≈ ${k}`], nota: `Se sortea un arranque entre 1 y ${k} y se toma un elemento cada ${k} de la lista.` });
    }
    if (m.id === 'aleatorio estratificado') {
        lista.push({ titulo: 'Muestra de cada estrato (afijación proporcional)', general: ['nₕ = n · ', { num: 'Nₕ', den: 'N' }], con: null, nota: 'Nₕ es el tamaño de cada estrato y nₕ, la parte de la muestra que le corresponde.' });
    }
    if (m.id === 'por conglomerados') {
        const M = Math.round(Number(conglomerados?.total) || 0);
        const prom = Number(conglomerados?.promedio) || 0;
        const mc = M > 0 && prom > 0 ? Math.min(M, Math.ceil(n / prom)) : 0;
        lista.push({ titulo: 'Número de conglomerados que se sortean', general: ['m = ', { num: 'n', den: 'tamaño promedio del conglomerado' }], con: mc ? ['m = ', { num: num(n), den: num(prom) }, ` ≈ ${mc}`] : null, nota: mc ? `Se sortean ${mc} de los ${num(M)} conglomerados.` : '' });
    }
    if (m.id.startsWith('censo')) {
        lista.push({ titulo: 'Tamaño', general: ['n = N'], con: calc.finita && N > 0 ? [`n = ${num(N)}`] : null, nota: 'No se calcula muestra ni margen de error: se estudia a toda la población.', soloVentana: true });
        lista.push({ titulo: 'Tasa de respuesta', general: ['Tasa = ', { num: `${unidad}s que respondieron`, den: 'N' }, ' · 100'], con: null, soloVentana: true });
    }
    return lista;
};

// La ecuación en una sola línea, para donde no se puede dibujar la fracción.
export const ecuacionEnLinea = (partes) => (partes || []).map((p) => (typeof p === 'string' ? p : `(${p.num}) / (${p.den})`)).join('');
