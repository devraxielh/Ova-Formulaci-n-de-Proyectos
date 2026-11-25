// Resultados de punta a punta: de las respuestas de la encuesta al análisis de cada objetivo.
// Toma las respuestas, las reparte por objetivo (según la pregunta del instrumento que mide cada uno), corre el
// análisis que el plan de análisis pide para ese objetivo y devuelve las tablas, las figuras por dibujar y un
// resumen con las cifras para que la IA redacte sin inventar nada. Todo el cálculo se hace aquí, no en la IA.
import { analizar, correlacion, cruzar, descriptivos, fmt, fmtP, fuerza, tablaDe } from './estadistica.js';
import { tablaRespuestas } from './instrumentos.js';

const t = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();
const corto = (v, n = 70) => { const s = t(v).replace(/[¿?]/g, '').replace(/[.:\s]+$/, ''); return s.length > n ? `${s.slice(0, n - 1).trim()}…` : s; };
const lista = (v) => (Array.isArray(v) ? v : []);
const RELACIONAL = /correlaci|asociaci|relaci|chi|ji.cuadrad|regresi|compar|cruce|conting/i;

// Número del objetivo específico que nombra un texto del plan («el objetivo específico 2»). 0 = todos o no se sabe.
export const objetivoDeTexto = (texto) => { const m = t(texto).match(/espec[ií]fico\s+(\d+)/i); return m ? Number(m[1]) : 0; };

// Variables de una encuesta ya analizadas, cada una con su objetivo y sus valores crudos.
const variablesDe = (encuesta) => {
    const preguntas = lista(encuesta.definition?.preguntas);
    const tabla = tablaRespuestas(encuesta.definition, encuesta.responses);
    return analizar(tabla).map((v, i) => {
        const q = preguntas[i] || {};
        const valores = tabla.filas.map((f) => f[i]);
        const opciones = lista(q.opciones);
        // En una escala, la respuesta se convierte en su posición (1 = primera opción) para promediar y correlacionar.
        const puntos = q.tipo === 'likert' && opciones.length ? valores.map((x) => { const k = opciones.indexOf(String(x)); return k >= 0 ? k + 1 : NaN; }) : null;
        return { ...v, id: q.id, tipo: q.tipo, objetivo: Number(encuesta.objetivoDe?.[q.id]) || 0, valores, puntos, opciones };
    });
};

// Puntaje de cada participante en un conjunto de ítems de escala (promedio de los que respondió).
const compuesto = (items) => {
    const n = items[0]?.puntos.length || 0;
    return Array.from({ length: n }, (_, r) => {
        const suyos = items.map((v) => v.puntos[r]).filter(Number.isFinite);
        return suyos.length ? suyos.reduce((s, x) => s + x, 0) / suyos.length : NaN;
    });
};

// Una fila del plan puede nombrar su objetivo por número («el objetivo específico 2») o con su texto completo.
const plano = (v) => t(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9ñ ]/g, ' ').replace(/\s+/g, ' ').trim();
export const objetivoDeFila = (texto, especificos) => {
    const porNumero = objetivoDeTexto(texto);
    if (porNumero) return porNumero;
    const buscado = plano(texto);
    if (buscado.length < 8) return 0;
    const i = lista(especificos).findIndex((o) => { const x = plano(o); return x === buscado || x.startsWith(buscado) || buscado.startsWith(x); });
    return i + 1;
};

// A qué objetivo responde cada pregunta de la encuesta publicada. Se busca primero por el identificador de la
// pregunta en su instrumento y, si el instrumento se editó después de publicarlo, por el texto de la pregunta
// en cualquiera de los instrumentos armados.
export const objetivosDePreguntas = (definition, instrumentoId, armados) => {
    const propio = lista(armados).find((a) => a?.id === instrumentoId);
    const porId = Object.fromEntries(lista(propio?.preguntas).map((q) => [q.id, Number(q.objetivo) || 0]));
    const porTexto = new Map();
    [...lista(armados).filter((a) => a !== propio), propio].filter(Boolean).forEach((a) => lista(a.preguntas).forEach((q) => { if (plano(q?.texto)) porTexto.set(plano(q.texto), Number(q.objetivo) || 0); }));
    return Object.fromEntries(lista(definition?.preguntas).map((q) => [q.id, porId[q.id] !== undefined ? porId[q.id] : (porTexto.get(plano(q.texto)) || 0)]));
};

/*
 * encuestas: [{ titulo, definition, responses, objetivoDe: { [idPregunta]: n } }]
 * especificos: textos de los objetivos específicos
 * plan: filas del plan de análisis [{ objetivo: 'el objetivo específico 2', tecnica }]
 * Devuelve { n, tablas, figuras, porObjetivo, resumen }.
 */
export const analizarPorObjetivo = ({ encuestas, especificos, plan }) => {
    const tablas = [];
    const figuras = [];
    const porObjetivo = {};
    const todas = lista(encuestas).filter((e) => lista(e.responses).length > 0).flatMap(variablesDe);
    const n = Math.max(0, ...lista(encuestas).map((e) => lista(e.responses).length));
    const nota = `Elaboración propia con datos del estudio (n = ${n}).`;
    if (!todas.length) return { n: 0, tablas, figuras, porObjetivo, resumen: '' };

    // Caracterización de los participantes: una sola tabla con las preguntas que no miden un objetivo.
    const caract = todas.filter((v) => v.objetivo === 0 && v.clase === 'categorica' && v.frec?.items?.length && !v.multiple).slice(0, 4);
    const lineasCaract = [];
    if (caract.length) {
        const rows = caract.flatMap((v) => v.frec.items.map((x, i) => [i === 0 ? corto(v.nombre, 50) : '', x.valor, String(x.n), `${fmt(x.pct)} %`]));
        tablas.push({ objetivo: 0, titulo: 'Caracterización de los participantes', nota, head: ['Variable', 'Categoría', 'Frecuencia', 'Porcentaje'], rows });
        caract.forEach((v) => lineasCaract.push(`${corto(v.nombre, 50)}: ${v.frec.items.map((x) => `${x.valor} ${x.n} (${fmt(x.pct)} %)`).join('; ')}`));
    }
    todas.filter((v) => v.objetivo === 0 && v.clase === 'numerica' && v.resumen).slice(0, 2).forEach((v) => lineasCaract.push(`${corto(v.nombre, 50)}: media ${fmt(v.resumen.media, 2)} (DE ${fmt(v.resumen.de, 2)}), entre ${fmt(v.resumen.min, 2)} y ${fmt(v.resumen.max, 2)}`));

    const escalasDe = (k) => todas.filter((v) => v.objetivo === k && v.puntos);
    especificos.forEach((objetivo, idx) => {
        const k = idx + 1;
        const suyas = todas.filter((v) => v.objetivo === k);
        const lineas = [];
        const titulos = [];
        if (!suyas.length) { porObjetivo[k] = { lineas, titulos, sinDatos: true }; return; }

        // Ítems de escala: una tabla con la media de cada ítem y el puntaje global del objetivo.
        const escalas = suyas.filter((v) => v.puntos);
        if (escalas.length) {
            const global = descriptivos(compuesto(escalas).filter(Number.isFinite));
            const tope = Math.max(...escalas.map((v) => v.opciones.length));
            const alto = (v) => { const validos = v.puntos.filter(Number.isFinite); return validos.length ? (validos.filter((x) => x >= v.opciones.length - 1).length / validos.length) * 100 : 0; };
            const rows = escalas.map((v) => [corto(v.nombre, 90), String(v.puntaje.n), fmt(v.puntaje.media, 2), fmt(v.puntaje.de, 2), `${fmt(alto(v))} %`]);
            if (escalas.length > 1) rows.push(['Puntaje global', String(global.n), fmt(global.media, 2), fmt(global.de, 2), '']);
            const titulo = `Resultados del objetivo específico ${k}: valoración por ítem`;
            tablas.push({ objetivo: k, titulo, nota: `${nota} Escala de 1 a ${tope}; la última columna reúne las dos opciones más altas.`, head: ['Ítem', 'n', 'Media', 'Desviación estándar', 'Dos opciones más altas'], rows });
            titulos.push(titulo);
            lineas.push(`Puntaje global de la escala (1 a ${tope}): media ${fmt(global.media, 2)}, DE ${fmt(global.de, 2)}, n = ${global.n}.`);
            const orden = [...escalas].sort((a, b) => b.puntaje.media - a.puntaje.media);
            lineas.push(`Ítem más alto: «${corto(orden[0].nombre, 90)}» (media ${fmt(orden[0].puntaje.media, 2)}; ${fmt(alto(orden[0]))} % en las dos opciones más altas).`);
            if (orden.length > 1) lineas.push(`Ítem más bajo: «${corto(orden.at(-1).nombre, 90)}» (media ${fmt(orden.at(-1).puntaje.media, 2)}; ${fmt(alto(orden.at(-1)))} % en las dos opciones más altas).`);
        }
        // Preguntas de opción y numéricas: su tabla de frecuencias o de medidas (hasta dos, para no llenar el documento).
        suyas.filter((v) => !v.puntos && (v.clase === 'categorica' ? v.frec?.items?.length : v.clase === 'numerica' && v.resumen)).slice(0, 2).forEach((v) => {
            const titulo = v.clase === 'numerica' ? `Medidas de resumen: ${corto(v.nombre)}` : `Distribución de respuestas: ${corto(v.nombre)}`;
            tablas.push({ objetivo: k, titulo, nota, ...tablaDe(v) });
            titulos.push(titulo);
            if (v.clase === 'numerica') lineas.push(`«${corto(v.nombre, 90)}»: media ${fmt(v.resumen.media, 2)}, DE ${fmt(v.resumen.de, 2)}, mínimo ${fmt(v.resumen.min, 2)}, máximo ${fmt(v.resumen.max, 2)}, n = ${v.resumen.n}.`);
            else lineas.push(`«${corto(v.nombre, 90)}»: ${v.frec.items.map((x) => `${x.valor} ${x.n} (${fmt(x.pct)} %)`).join('; ')}.`);
        });
        suyas.filter((v) => v.clase === 'texto' && v.muestras?.length).slice(0, 1).forEach((v) => lineas.push(`Respuestas abiertas a «${corto(v.nombre, 90)}» (${v.n}): ${v.muestras.slice(0, 3).map((m) => `«${corto(m, 110)}»`).join(' ')}`));

        // Figura: la primera pregunta categórica del objetivo (su distribución en barras).
        const paraFigura = suyas.find((v) => v.clase === 'categorica' && v.frec?.items?.length && !v.puntos) || escalas[0];
        if (paraFigura) figuras.push({ objetivo: k, titulo: `Distribución porcentual: ${corto(paraFigura.nombre)}`, nota, variable: paraFigura });

        // Si el plan pide relacionar, se relaciona este objetivo con otro que también tenga medida.
        const tecnica = t(lista(plan).find((p) => objetivoDeFila(p?.objetivo, especificos) === k)?.tecnica);
        if (RELACIONAL.test(tecnica)) {
            const otroK = especificos.map((_, j) => j + 1).find((j) => j !== k && escalasDe(j).length && escalas.length);
            if (otroK) {
                const c = correlacion(compuesto(escalas), compuesto(escalasDe(otroK)));
                if (c) {
                    const titulo = `Correlación entre las escalas de los objetivos específicos ${Math.min(k, otroK)} y ${Math.max(k, otroK)}`;
                    if (!tablas.some((x) => x.titulo === titulo)) tablas.push({ objetivo: k, titulo, nota: `${nota} Puntaje promedio de cada escala por participante.`, head: ['n', 'r de Pearson', 'p', 'rho de Spearman', 'p'], rows: [[String(c.n), fmt(c.r, 2), fmtP(c.pR), fmt(c.rho, 2), fmtP(c.pRho)]] });
                    titulos.push(titulo);
                    lineas.push(`Relación con la escala del objetivo ${otroK}: r de Pearson = ${fmt(c.r, 2)} (p ${fmtP(c.pR)}), rho de Spearman = ${fmt(c.rho, 2)} (p ${fmtP(c.pRho)}), n = ${c.n}; relación ${c.r >= 0 ? 'directa' : 'inversa'} ${fuerza(c.r)}${c.pR < 0.05 ? ' y estadísticamente significativa' : ', sin significancia estadística'}.`);
                }
            } else {
                const a = suyas.find((v) => v.clase === 'categorica' && !v.multiple && !v.puntos && v.frec?.items?.length >= 2);
                const b = todas.find((v) => v !== a && v.objetivo !== k && v.clase === 'categorica' && !v.multiple && !v.puntos && v.frec?.items?.length >= 2);
                if (a && b && a.valores.length === b.valores.length) {
                    const x = cruzar(a.valores, b.valores);
                    if (x.n >= 5 && x.gl > 0) {
                        const titulo = `Asociación entre «${corto(a.nombre, 40)}» y «${corto(b.nombre, 40)}»`;
                        tablas.push({ objetivo: k, titulo, nota: `${nota}${x.bajas ? ` ${x.bajas} de ${x.celdas} casillas tienen frecuencia esperada menor que 5: interprétese con cautela.` : ''}`, head: ['n', 'Ji-cuadrado', 'gl', 'p', 'V de Cramér'], rows: [[String(x.n), fmt(x.chi, 2), String(x.gl), fmtP(x.p), fmt(x.v, 2)]] });
                        titulos.push(titulo);
                        lineas.push(`Asociación con «${corto(b.nombre, 60)}»: ji-cuadrado = ${fmt(x.chi, 2)}, gl = ${x.gl}, p ${fmtP(x.p)}, V de Cramér = ${fmt(x.v, 2)} (asociación ${fuerza(x.v)}${x.p < 0.05 ? ', estadísticamente significativa' : ', sin significancia estadística'}), n = ${x.n}.`);
                    }
                }
            }
        }
        porObjetivo[k] = { lineas, titulos, tecnica };
    });

    const resumen = [
        `Participantes: ${n}.`,
        lineasCaract.length ? `CARACTERIZACIÓN${tablas.some((x) => x.objetivo === 0) ? ' (tabla «Caracterización de los participantes»)' : ''}\n${lineasCaract.map((l) => `- ${l}`).join('\n')}` : '',
        ...especificos.map((o, i) => {
            const r = porObjetivo[i + 1];
            if (!r || r.sinDatos || !r.lineas.length) return `OBJETIVO ${i + 1}: ${o}\n- (ninguna pregunta de la encuesta mide este objetivo: sin datos)`;
            return `OBJETIVO ${i + 1}: ${o}${r.tecnica ? `\nTécnica del plan de análisis: ${r.tecnica}` : ''}\n${r.lineas.map((l) => `- ${l}`).join('\n')}${r.titulos.length ? `\nTablas disponibles para apoyar: ${r.titulos.map((x) => `«${x}»`).join('; ')}` : ''}`;
        }),
    ].filter(Boolean).join('\n\n');
    return { n, tablas, figuras, porObjetivo, resumen };
};
