/*
 * Coherencia entre las secciones del proyecto.
 * Compara los términos clave de cada par de secciones y algunas reglas de forma
 * (verbo del título → objetivo general, escalera de los específicos, tipo de alcance).
 * Es una revisión automática de la forma: la coherencia de fondo la valida el asesor.
 */
import { INFINITIVO, generalDesdeTitulo } from '../data/ejemplos.js';
import { nivelDe, problemasEscalera } from '../data/nivelesVerbos.js';

const STOP = new Set(`a al algo algunas algunos ante antes como con contra cual cuales cuando de del desde donde durante e el ella ellas ellos en entre era es esa esas ese eso esos esta estas este esto estos fue ha hay la las le les lo los mas más me mi muy no nos o para pero por que qué se sea según ser si sin sobre su sus tal tambien también tanto te tiene tienen todo todos tu un una uno unos unas y ya
cuál cuáles cómo qué quién quiénes dónde cuánto existe existen relación factores asociados nivel través partir medio forma manera mismo misma parte caso casos tipo tipos general específicos objetivo objetivos investigación estudio proyecto análisis
pública público públicas públicos durante entre`.split(/\s+/));

const plain = (text) => String(text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// Términos clave: palabras de contenido, recortadas a su raíz aproximada (6 letras).
// Devuelve un mapa raíz → palabra original (la primera vez que aparece).
const terminosMapa = (text) => {
    const verbos = new Set(Object.keys(INFINITIVO).map(plain).concat(Object.values(INFINITIVO).map(plain)));
    const map = new Map();
    String(text || '').toLowerCase().replace(/[^a-záéíóúüñ0-9\s]/g, ' ').split(/\s+/).forEach((word) => {
        const w = plain(word);
        if (w.length > 3 && !STOP.has(w) && !verbos.has(w) && !map.has(w.slice(0, 6))) map.set(w.slice(0, 6), word);
    });
    return map;
};

export const terminos = (text) => new Set(terminosMapa(text).keys());

// Qué parte de los términos de `ref` aparece en `otro` (0 a 1) y qué palabras faltan.
const comparar = (ref, otro) => {
    const a = terminosMapa(ref);
    if (a.size === 0) return { ratio: null, faltan: [] };
    const b = terminos(otro);
    const faltan = [];
    a.forEach((word, stem) => { if (!b.has(stem)) faltan.push(word); });
    return { ratio: (a.size - faltan.length) / a.size, faltan };
};
const cobertura = (ref, otro) => comparar(ref, otro).ratio;
const lista = (words, max = 5) => words.slice(0, max).map((word) => `«${word}»`).join(', ') + (words.length > max ? ` y ${words.length - max} más` : '');
const minus = (text) => (text ? text.charAt(0).toLowerCase() + text.slice(1) : '');
const sinPunto = (text) => String(text || '').trim().replace(/[\s.]+$/, '');

const pct = (value) => Math.round(Math.max(0, Math.min(1, value)) * 100);
const clean = (text) => String(text || '').trim();

// Separa «### Objetivo general / ### Objetivos específicos».
export const partesObjetivos = (raw) => {
    const lines = String(raw || '').split('\n').map((line) => line.trim()).filter(Boolean);
    const general = [];
    const especificos = [];
    let mode = 'general';
    lines.forEach((line) => {
        if (/espec[ií]fico/i.test(line) && (/^#/.test(line) || /:$/.test(line) || line.length < 30)) { mode = 'esp'; return; }
        if (/general/i.test(line) && (/^#/.test(line) || /:$/.test(line) || line.length < 30)) { mode = 'general'; return; }
        const item = line.replace(/^(?:[-*•]|\d+[.)])\s+/, '');
        if (mode === 'general') general.push(item); else especificos.push(item);
    });
    return { general: general.join(' '), especificos };
};

const TIPO_POR_NIVEL = { 1: 'exploratorio', 2: 'descriptivo', 3: 'correlacional', 4: 'explicativo', 5: 'evaluativo', 6: 'propositivo' };
const TIPOS = ['exploratorio', 'descriptivo', 'correlacional', 'explicativo', 'evaluativo', 'propositivo'];

const nivelTexto = (score) => (score >= 80 ? 'alta' : score >= 50 ? 'media' : 'baja');

/*
 * Devuelve { score, nivel, checks } con un check por relación entre secciones.
 * Cada check: { id, label, tab, score|null, detail (qué pasa), porque (por qué falla),
 * arreglo (cómo arreglarlo), sugerencia (texto propuesto, opcional) }.
 */
export const evaluarCoherencia = (data = {}) => {
    const titulo = clean(data.titulo);
    const pregunta = clean(data.pregunta);
    const planteamiento = clean(data.planteamiento);
    const { general: generalDoc, especificos } = partesObjetivos(data.objetivos);
    const general = clean(data.objetivoGeneral) || clean(generalDoc);
    const justificacion = clean(data.justificacion);
    const alcances = clean(data.alcances);
    const quien = clean(data.tituloForm?.quien || data.idea?.quien);
    const donde = clean(data.tituloForm?.donde || data.idea?.donde);
    const desdeTitulo = generalDesdeTitulo(titulo);
    const preguntaFrase = minus(sinPunto(pregunta).replace(/^¿/, '').replace(/\?$/, ''));

    const checks = [];
    const pendiente = (id, label, tab, detail) => checks.push({ id, label, tab, score: null, detail });

    // 1. Título ↔ pregunta
    if (!titulo || !pregunta) pendiente('titulo-pregunta', 'Título ↔ Pregunta', !titulo ? 'titulo' : 'pregunta', 'Falta el título o la pregunta.');
    else {
        const { ratio, faltan } = comparar(titulo, pregunta);
        const s = pct(ratio ?? 0);
        checks.push({
            id: 'titulo-pregunta', label: 'Título ↔ Pregunta', tab: 'pregunta', score: s,
            detail: s >= 80 ? 'La pregunta habla de lo mismo que el título.' : 'La pregunta no retoma varios términos del título.',
            porque: faltan.length ? `Estas palabras del título no aparecen en la pregunta: ${lista(faltan)}. Si no están, el lector entiende que estudian cosas distintas.` : '',
            arreglo: 'Reescribe la pregunta con el mismo objeto de estudio, la misma población y el mismo lugar del título. Si el título está mal, corrígelo primero.',
        });
    }

    // 2. Título ↔ objetivo general (verbo sustantivado → infinitivo)
    if (!titulo || !general) pendiente('titulo-general', 'Título ↔ Objetivo general', !titulo ? 'titulo' : 'objetivos', 'Falta el título o el objetivo general.');
    else {
        const sustantivo = Object.keys(INFINITIVO).find((item) => plain(titulo).startsWith(plain(item)));
        const verbo = plain(general).split(/\s+/)[0];
        const verboOk = !sustantivo || plain(INFINITIVO[sustantivo]) === verbo;
        const { ratio, faltan } = comparar(titulo, general);
        const s = pct((ratio ?? 0) * 0.75 + (verboOk ? 0.25 : 0));
        const porque = [
            !verboOk && `El título empieza con «${sustantivo}», pero el objetivo general con «${general.split(/\s+/)[0]}»: el verbo debería ser «${INFINITIVO[sustantivo]}».`,
            faltan.length && `Estas palabras del título no están en el objetivo general: ${lista(faltan)}.`,
        ].filter(Boolean).join(' ');
        checks.push({
            id: 'titulo-general', label: 'Título ↔ Objetivo general', tab: 'objetivos', score: s,
            detail: !verboOk ? 'El verbo del objetivo general no corresponde al del título.' : s >= 80 ? 'El objetivo general es el título con el verbo en infinitivo.' : 'El objetivo general no retoma varios términos del título.',
            porque,
            arreglo: 'El objetivo general es el título con el verbo sustantivado pasado a infinitivo (Análisis → Analizar). Usa esta versión o ajústala.',
            sugerencia: desdeTitulo ? `${desdeTitulo}.` : '',
        });
    }

    // 3. Pregunta ↔ objetivo general
    if (!pregunta || !general) pendiente('pregunta-general', 'Pregunta ↔ Objetivo general', !pregunta ? 'pregunta' : 'objetivos', 'Falta la pregunta o el objetivo general.');
    else {
        const { ratio, faltan } = comparar(pregunta, general);
        const s = pct(ratio ?? 0);
        checks.push({
            id: 'pregunta-general', label: 'Pregunta ↔ Objetivo general', tab: 'objetivos', score: s,
            detail: s >= 80 ? 'Al lograr el objetivo general se responde la pregunta.' : 'El objetivo general no responde del todo la pregunta.',
            porque: faltan.length ? `La pregunta habla de ${lista(faltan)}, pero el objetivo general no. Al cumplir el objetivo, esa parte de la pregunta quedaría sin respuesta.` : '',
            arreglo: 'Incluye en el objetivo general las variables, la población y el lugar de la pregunta, o ajusta la pregunta para que pida lo que el objetivo logra.',
            sugerencia: desdeTitulo && cobertura(pregunta, desdeTitulo) > (ratio ?? 0) ? `${desdeTitulo}.` : '',
        });
    }

    // 4. Planteamiento ↔ pregunta
    if (!planteamiento || !pregunta) pendiente('planteamiento-pregunta', 'Planteamiento ↔ Pregunta', !planteamiento ? 'planteamiento' : 'pregunta', 'Falta el planteamiento o la pregunta.');
    else {
        const { ratio, faltan } = comparar(pregunta, planteamiento);
        const s = pct(ratio ?? 0);
        checks.push({
            id: 'planteamiento-pregunta', label: 'Planteamiento ↔ Pregunta', tab: 'planteamiento', score: s,
            detail: s >= 80 ? 'El planteamiento describe las variables de la pregunta.' : 'El planteamiento no menciona algunos términos de la pregunta.',
            porque: faltan.length ? `La pregunta habla de ${lista(faltan)}, pero el planteamiento no los describe. El planteamiento debe mostrar el problema que la pregunta busca resolver.` : '',
            arreglo: 'Describe esos términos en el contexto, la descripción o las causas, y termina el párrafo de cierre conduciendo a la pregunta.',
            sugerencia: preguntaFrase ? `Por lo anterior, resulta necesario establecer ${preguntaFrase}.` : '',
        });
    }

    // 5. Objetivo general ↔ específicos (tema y escalera)
    if (!general || especificos.length === 0) pendiente('general-especificos', 'Objetivo general ↔ Específicos', 'objetivos', 'Faltan los objetivos específicos.');
    else {
        const temas = especificos.map((item) => cobertura(item, general) ?? 0);
        const tema = temas.reduce((sum, value) => sum + value, 0) / especificos.length;
        const problemas = problemasEscalera('', especificos);
        const baja = problemas.findIndex(Boolean);
        const escaleraOk = baja < 0;
        const cantidadOk = especificos.length >= 2 && especificos.length <= 4;
        const s = pct(tema * 0.6 + (escaleraOk ? 0.25 : 0) + (cantidadOk ? 0.15 : 0));
        // El específico más alejado del tema del general (si el tema es lo que baja el puntaje).
        const minimo = Math.min(...temas);
        const lejano = minimo < 0.6 ? temas.indexOf(minimo) : -1;
        const faltanLejano = lejano >= 0 ? comparar(especificos[lejano], general).faltan : [];
        const porque = [
            !escaleraOk && `El específico ${baja + 1} («${especificos[baja].split(/\s+/)[0]}», nivel ${nivelDe(especificos[baja])}) está más abajo que uno anterior: la escalera baja en vez de subir.`,
            !cantidadOk && `Tiene ${especificos.length} específicos; lo usual es entre 2 y 4.`,
            lejano >= 0 && `El específico ${lejano + 1} («${especificos[lejano].split(/\s+/).slice(0, 6).join(' ')}…») retoma pocas palabras del general${faltanLejano.length ? `: menciona ${lista(faltanLejano, 4)}, que no están en el objetivo general` : ''}.`,
        ].filter(Boolean).join(' ');
        checks.push({
            id: 'general-especificos', label: 'Objetivo general ↔ Específicos', tab: 'objetivos', score: s,
            detail: !escaleraOk ? 'Los específicos no forman una escalera.' : !cantidadOk ? 'La cantidad de específicos no es la usual.' : s >= 80 ? 'Los específicos son pasos del general y suben de nivel.' : 'Algunos específicos se alejan del tema del general.',
            porque,
            arreglo: [
                !escaleraOk && 'Ordénalos de lo simple a lo complejo (identificar → describir → analizar → explicar → evaluar → proponer) o cambia el verbo del que baja.',
                !cantidadOk && (especificos.length < 2 ? 'Agrega al menos otro específico.' : 'Une o quita específicos hasta dejar 3 o 4.'),
                lejano >= 0 && 'Reescribe ese específico con el mismo objeto de estudio del general: cada específico es un paso para lograrlo.',
            ].filter(Boolean).join(' ') || 'Revisa que cada específico sea un paso hacia el general.',
        });
    }

    // 6. Justificación ↔ objetivos
    if (!justificacion || !general) pendiente('justificacion-objetivos', 'Justificación ↔ Objetivos', !justificacion ? 'justificacion' : 'objetivos', 'Falta la justificación o el objetivo general.');
    else {
        const { ratio, faltan } = comparar(general, justificacion);
        const s = pct(ratio ?? 0);
        checks.push({
            id: 'justificacion-objetivos', label: 'Justificación ↔ Objetivos', tab: 'justificacion', score: s,
            detail: s >= 80 ? 'La justificación argumenta sobre lo que vas a lograr.' : 'La justificación no menciona varios términos del objetivo general.',
            porque: faltan.length ? `La justificación no menciona ${lista(faltan)}, que están en el objetivo general. Parece justificar un estudio distinto.` : '',
            arreglo: 'Retoma en la justificación lo que vas a lograr: di por qué conviene, a quién beneficia y para qué sirve justamente ese objetivo.',
            sugerencia: general ? `Al ${minus(sinPunto(general))}, el estudio permitirá [di qué decisión o acción será posible y a quién beneficia].` : '',
        });
    }

    // 7. Alcance ↔ objetivos (tipo de alcance según el verbo más alto de los objetivos)
    if (!alcances || !general) pendiente('alcance-objetivos', 'Alcance ↔ Objetivos', !alcances ? 'alcances' : 'objetivos', 'Faltan los alcances o el objetivo general.');
    else {
        const nivel = Math.max(nivelDe(general), ...especificos.map(nivelDe), 0);
        const esperado = TIPO_POR_NIVEL[nivel];
        const declarado = TIPOS.find((tipo) => plain(alcances).includes(tipo));
        const tipoOk = !esperado || !declarado || declarado === esperado || Math.abs(TIPOS.indexOf(declarado) - TIPOS.indexOf(esperado)) <= 1;
        const { ratio, faltan } = comparar(general, alcances);
        const s = pct((ratio ?? 0) * 0.6 + (declarado ? 0.15 : 0) + (tipoOk ? 0.25 : 0));
        const porque = [
            !declarado && 'Los alcances no dicen si el estudio es exploratorio, descriptivo, correlacional, explicativo, evaluativo o propositivo.',
            !tipoOk && `Dicen «${declarado}», pero el verbo más alto de tus objetivos es de nivel ${nivel}, que corresponde a un alcance ${esperado}.`,
            faltan.length && `No delimitan ${lista(faltan, 4)}, ${faltan.length === 1 ? 'que está' : 'que están'} en el objetivo general.`,
        ].filter(Boolean).join(' ');
        checks.push({
            id: 'alcance-objetivos', label: 'Alcance ↔ Objetivos', tab: 'alcances', score: s,
            detail: !declarado ? 'Los alcances no declaran el tipo de alcance.' : !tipoOk ? 'El tipo de alcance no corresponde a tus objetivos.' : s >= 80 ? 'El tipo de alcance corresponde a tus objetivos.' : 'Los alcances no retoman varios términos del objetivo general.',
            porque,
            arreglo: !tipoOk || !declarado
                ? `Declara un alcance ${esperado || 'acorde con tus objetivos'}; o, si de verdad es ${declarado || 'otro'}, ajusta el verbo de tus objetivos.`
                : 'Delimita en los alcances el mismo tema, población y lugar del objetivo general.',
            sugerencia: esperado ? `Esta investigación tiene un alcance ${esperado}.` : '',
        });
    }

    // 8. Población y lugar en todas las secciones
    const secciones = [['título', titulo], ['pregunta', pregunta], ['planteamiento', planteamiento], ['objetivo general', general], ['alcances', alcances]].filter(([, text]) => text);
    if ((!quien && !donde) || secciones.length < 2) pendiente('poblacion-lugar', 'Población y lugar', 'titulo', 'Faltan la población y el lugar en el título, o hay menos de dos secciones.');
    else {
        const clave = (value) => [...terminos(value)][0];
        const kq = quien && clave(quien);
        const kd = donde && clave(donde);
        const faltan = [];
        let hits = 0;
        let total = 0;
        secciones.forEach(([nombre, text]) => {
            const t = terminos(text);
            const sin = [];
            if (kq) { total += 1; if (t.has(kq)) hits += 1; else sin.push('población'); }
            if (kd) { total += 1; if (t.has(kd)) hits += 1; else sin.push('lugar'); }
            if (sin.length) faltan.push(`${nombre} (${sin.join(' y ')})`);
        });
        const s = total ? pct(hits / total) : 0;
        checks.push({
            id: 'poblacion-lugar', label: 'Población y lugar', tab: 'titulo', score: s,
            detail: faltan.length ? 'La población o el lugar no aparecen en todas las secciones.' : 'La población y el lugar son los mismos en todas las secciones.',
            porque: faltan.length ? `Falta en: ${faltan.join(', ')}. Tu población es «${quien || '—'}» y tu lugar «${donde || '—'}».` : '',
            arreglo: 'Usa exactamente la misma población y el mismo lugar en todas las secciones; si cambiaste alguno, actualízalo en las demás.',
            sugerencia: quien || donde ? `${quien ? `en ${minus(quien)}` : ''}${donde ? ` de ${donde}` : ''}`.trim() : '',
        });
    }

    const evaluados = checks.filter((check) => check.score !== null);
    const score = evaluados.length ? Math.round(evaluados.reduce((sum, check) => sum + check.score, 0) / evaluados.length) : null;
    const orden = ['titulo-pregunta', 'titulo-general', 'pregunta-general', 'planteamiento-pregunta', 'general-especificos', 'justificacion-objetivos', 'alcance-objetivos', 'poblacion-lugar'];
    return {
        score,
        nivel: score === null ? null : nivelTexto(score),
        evaluados: evaluados.length,
        checks: checks
            .sort((x, y) => orden.indexOf(x.id) - orden.indexOf(y.id))
            .map((check) => ({ ...check, nivel: check.score === null ? null : nivelTexto(check.score) })),
    };
};
