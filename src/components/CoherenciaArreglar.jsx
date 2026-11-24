import React, { useState } from 'react';
import { AlertTriangle, Check, Loader2, Sparkles } from 'lucide-react';
import { groq } from '../services/api';
import { useProjectField } from '../context/ProjectContext';
import { comparar, evaluarCoherencia, partesObjetivos, terminos } from '../services/coherencia';

/*
 * Botón «Arreglar con IA» de una relación débil en «Coherencia entre secciones».
 * Propone el texto corregido (la pregunta, el objetivo general o los específicos), muestra el antes y el después,
 * y solo cambia el proyecto cuando el estudiante toca «Aplicar».
 * Cada propuesta se mide con la misma regla de la coherencia antes de mostrarla: si no sube el porcentaje, se le
 * pide otra a la IA diciéndole qué palabras siguen sobrando o faltando; nunca se ofrece un arreglo que no arregla.
 * Las relaciones que dependen de un texto largo (planteamiento, justificación, alcances) no se arreglan aquí:
 * para esas sigue el botón «Ir a…».
 */

// Qué se corrige en cada relación.
const OBJETIVO = {
    'titulo-pregunta': 'pregunta',
    'titulo-general': 'general',
    'pregunta-general': 'general',
    'general-especificos': 'especificos',
};
export const sePuedeArreglar = (id) => Boolean(OBJETIVO[id]);

const limpio = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();
const sinPunto = (v) => limpio(v).replace(/[.\s]+$/, '');
const capital = (v) => (v ? v.charAt(0).toUpperCase() + v.slice(1) : v);
// El mismo formato que guarda la página de Objetivos.
const textoObjetivos = (general, especificos) => [
    '### Objetivo general',
    general ? `${capital(sinPunto(general))}.` : '',
    '',
    '### Objetivos específicos',
    ...especificos.map(sinPunto).filter(Boolean).map((item, i) => `${i + 1}. ${capital(item)}.`),
].join('\n').trim();

const INSTRUCCION = {
    pregunta: 'Reescribe la PREGUNTA DE INVESTIGACIÓN para que trate lo mismo que el título: las mismas variables u objeto de estudio, la misma población y el mismo lugar. Conserva el tipo de pregunta (cómo empieza). Va entre signos ¿ ?. Responde con este JSON: {"pregunta": "…"}',
    general: 'Reescribe el OBJETIVO GENERAL para que sea el título con el verbo en infinitivo y responda la pregunta: el mismo objeto de estudio, la misma población y el mismo lugar. Un solo verbo en infinitivo al inicio, sin punto final. Responde con este JSON: {"general": "…"}',
    especificos: 'Reescribe los OBJETIVOS ESPECÍFICOS que se alejan del objetivo general para que retomen su mismo objeto de estudio, población y lugar: cada específico es un paso para lograr el general, así que debe seguir tratando de su aspecto propio (por ejemplo, si trata de un medio o una causa, se conserva) pero ligado al problema del general. Devuelve todos, en el mismo orden y la misma cantidad; deja igual los que ya son coherentes. Conserva el verbo en infinitivo con que empieza cada uno y su intención (identificar, analizar, proponer…). Sin numeración y sin punto final. Responde con este JSON: {"especificos": ["…"]}',
};

const palabras = (lista) => lista.map((w) => `«${w}»`).join(', ');

const Arreglar = ({ check, data }) => {
    const que = OBJETIVO[check.id];
    const [, setPregunta] = useProjectField('pregunta', '');
    const [, setObjetivos] = useProjectField('objetivos', '');
    const [, setObjetivoGeneral] = useProjectField('objetivoGeneral', '');
    const [, setForm] = useProjectField('objetivosForm', null);
    const [estado, setEstado] = useState('');
    const [error, setError] = useState('');
    const [propuesta, setPropuesta] = useState(null); // { pregunta } | { general } | { especificos: [] }

    const partes = partesObjetivos(data?.objetivos);
    const general = sinPunto(data?.objetivoGeneral || partes.general);
    const especificos = partes.especificos.map(sinPunto).filter(Boolean);

    // El proyecto tal como quedaría con la propuesta, para medirla con la misma regla de la coherencia.
    const conPropuesta = (p) => {
        if (p.pregunta) return { ...data, pregunta: p.pregunta };
        const g = p.general || general;
        return { ...data, objetivos: textoObjetivos(g, p.especificos || especificos), objetivoGeneral: g ? `${capital(sinPunto(g))}.` : '' };
    };
    const puntaje = (d) => evaluarCoherencia(d).checks.find((c) => c.id === check.id)?.score ?? 0;

    // Un específico deja de estar «alejado» cuando al menos esta parte de sus palabras clave está en el general.
    const META = 0.6;
    const cerca = (p) => (p.especificos ? alejados.every((i) => (comparar(p.especificos[i], general).ratio ?? 1) >= META) : puntaje(conPropuesta(p)) >= 80);
    // Específicos que se alejan del general (los únicos que se pueden tocar) y las palabras propias de cada uno.
    const alejados = especificos.map((x, i) => ((comparar(x, general).ratio ?? 1) < 0.8 ? i : -1)).filter((i) => i >= 0);
    // Un arreglo no puede borrar de qué trata el paso: debe conservar al menos una de sus palabras propias.
    const pierdeTema = (p) => (p.especificos || []).map((nuevo, i) => {
        if (!alejados.includes(i)) return '';
        const propias = comparar(especificos[i], general).faltan;
        const quedan = terminos(nuevo);
        return propias.length && !propias.some((w) => [...terminos(w)].some((raiz) => quedan.has(raiz))) ? `En el específico ${i + 1} borraste de qué trata el paso: debe conservar al menos una de estas palabras: ${palabras(propias)}.` : '';
    }).filter(Boolean).join(' ');

    // Lo que la regla mide, dicho en palabras concretas: qué términos faltan o sobran en el texto (actual o propuesto).
    const pista = (p) => {
        const titulo = limpio(data?.titulo);
        const pregunta = limpio(data?.pregunta);
        if (que === 'pregunta') {
            const faltan = comparar(titulo, p?.pregunta || pregunta).faltan;
            return faltan.length ? `La coherencia se mide por las palabras clave del título que aparecen en la pregunta. Faltan estas: ${palabras(faltan)}. Inclúyelas (la misma palabra, no un sinónimo).` : '';
        }
        if (que === 'general') {
            const g = p?.general || general;
            const faltan = [...new Set([...comparar(titulo, g).faltan, ...comparar(pregunta, g).faltan])];
            return faltan.length ? `La coherencia se mide por las palabras clave del título y de la pregunta que aparecen en el objetivo general. Faltan estas: ${palabras(faltan)}. Inclúyelas (la misma palabra, no un sinónimo).` : '';
        }
        const lista = p?.especificos || especificos;
        const lejos = lista.map((x, i) => ({ i, ...comparar(x, general) })).filter((x) => alejados.includes(x.i) && (x.ratio ?? 1) < META && x.faltan.length);
        if (!lejos.length) return '';
        return `La coherencia se mide por cuántas palabras clave de cada específico están también en el objetivo general. Agregar palabras nuevas (aunque sean el lugar o la población) NO ayuda si no están en el general: lo que ayuda es nombrar el objeto de estudio, la población y el lugar con las mismas palabras del general y quitar las que no están en él.\n${lejos.map((x) => `- Específico ${x.i + 1}: no están en el general ${palabras(x.faltan)}. Conserva una o dos de esas, las que dicen de qué trata ese paso (no lo conviertas en una copia del general), quita las demás y nombra el problema, la población y el lugar con las palabras del objetivo general.`).join('\n')}\nNo cambies los demás específicos.`;
    };

    const leer = (json) => {
        if (que === 'pregunta') {
            const p = limpio(json.pregunta).replace(/^¿?/, '¿').replace(/\??$/, '?');
            if (p.length < 12) throw new Error('La IA no devolvió una pregunta. Inténtalo de nuevo.');
            return { pregunta: p };
        }
        if (que === 'general') {
            const g = sinPunto(json.general);
            if (g.length < 12) throw new Error('La IA no devolvió un objetivo. Inténtalo de nuevo.');
            return { general: capital(g) };
        }
        const lista = (Array.isArray(json.especificos) ? json.especificos : []).map(sinPunto).filter(Boolean).map(capital);
        // Tiene que devolver los mismos objetivos, no más ni menos: si no, no se toca nada.
        if (lista.length !== especificos.length) throw new Error('La IA cambió la cantidad de objetivos. Inténtalo de nuevo.');
        // Los que ya eran coherentes se dejan exactamente como estaban.
        return { especificos: lista.map((x, i) => (alejados.includes(i) ? x : especificos[i])) };
    };

    const pedir = async () => {
        setError('');
        setPropuesta(null);
        setEstado('pensando');
        const antes = puntaje(data);
        let mejor = null; // { propuesta, score }
        let ultimo = null;
        let fallo = null;
        // Hasta cuatro intentos: cada uno recibe lo que le faltó al anterior. Se queda la propuesta que más sube.
        for (let intento = 0; intento < 4 && !(mejor && cerca(mejor.propuesta)); intento += 1) {
            try {
                const mensajes = [
                    { role: 'system', content: 'Ayudas a un estudiante a dejar coherentes las partes de su proyecto de investigación. Corriges solo lo que se te pide, con los datos que ya tiene: no agregas cifras, autores, variables ni poblaciones nuevas. El texto debe seguir siendo natural y decir algo con sentido. Respondes solo JSON válido en español.' },
                    { role: 'user', content: `Título: ${limpio(data?.titulo) || '(sin título)'}\nPregunta de investigación: ${limpio(data?.pregunta) || '(sin pregunta)'}\nObjetivo general: ${general || '(sin objetivo general)'}\nObjetivos específicos:\n${especificos.length ? especificos.map((x, i) => `${i + 1}. ${x}`).join('\n') : '(sin específicos)'}\n\nProblema de coherencia detectado (${check.label}): ${check.detail}${check.porque ? `\nPor qué: ${check.porque}` : ''}\n\n${pista(null)}\n\n${INSTRUCCION[que]}` },
                ];
                if (ultimo) {
                    mensajes.push({ role: 'assistant', content: JSON.stringify(ultimo.propuesta) });
                    mensajes.push({ role: 'user', content: `${ultimo.perdio || `Esa propuesta deja la coherencia en ${ultimo.score} % (estaba en ${antes} %): no alcanza.\n${pista(ultimo.propuesta) || 'Acércala más a las palabras del texto de referencia.'}`}\nPropón otra con el mismo formato JSON.` });
                }
                const r = await groq.chat.completions.create({ messages: mensajes, temperature: 0.3 + intento * 0.15, max_tokens: 700, response_format: { type: 'json_object' } });
                const content = r.choices?.[0]?.message?.content || '';
                const p = leer(JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1)));
                const perdio = pierdeTema(p);
                ultimo = { propuesta: p, score: puntaje(conPropuesta(p)), perdio };
                if (!perdio && (!mejor || ultimo.score > mejor.score)) mejor = ultimo;
            } catch (err) {
                fallo = err;
            }
        }
        setEstado('');
        if (!mejor) {
            setError(fallo?.message?.includes('JSON') ? 'La IA respondió en un formato inesperado. Inténtalo de nuevo.' : (fallo?.message || 'No se pudo proponer el arreglo.'));
        } else if (mejor.score <= antes) {
            // Ninguna propuesta mejora: no se ofrece un cambio que no arregla nada.
            setError(`La IA no encontró una redacción que suba la coherencia (sigue en ${antes} %). ${que === 'especificos' ? 'Puede que el específico esté bien y lo que falte sea nombrar ese aspecto en el objetivo general: revísalo a mano en Objetivos.' : 'Revísalo a mano en la sección.'}`);
        } else {
            setPropuesta({ ...mejor.propuesta, antes, despues: mejor.score });
        }
    };

    const aplicar = () => {
        if (propuesta.pregunta) setPregunta(propuesta.pregunta);
        else {
            const g = propuesta.general || general;
            const lista = propuesta.especificos || especificos;
            setObjetivos(textoObjetivos(g, lista));
            setObjetivoGeneral(g ? `${capital(sinPunto(g))}.` : '');
            setForm((prev) => ({ ...(prev || {}), general: g, especificos: lista.length ? lista : ['', '', ''] }));
        }
        setPropuesta(null);
        setEstado('aplicado');
    };

    // Antes y después, solo de lo que cambia.
    const cambios = !propuesta ? [] : propuesta.pregunta
        ? [{ rotulo: 'Pregunta', antes: limpio(data?.pregunta), despues: propuesta.pregunta }]
        : propuesta.general
            ? [{ rotulo: 'Objetivo general', antes: general, despues: propuesta.general }]
            : propuesta.especificos.map((despues, i) => ({ rotulo: `Específico ${i + 1}`, antes: especificos[i], despues })).filter((c) => c.antes.toLowerCase() !== c.despues.toLowerCase());

    return (
        <div className="pro-coh-ia">
            {!propuesta && (
                <button type="button" className="pro-btn pro-btn--primary" onClick={pedir} disabled={estado === 'pensando'}>
                    {estado === 'pensando' ? <Loader2 size={15} className="pro-coh-gira" /> : <Sparkles size={15} />} {estado === 'pensando' ? 'Buscando el arreglo…' : 'Arreglar con IA'}
                </button>
            )}
            {estado === 'aplicado' && <p className="pro-coh-ok" role="status"><Check size={14} aria-hidden="true" /> Cambio aplicado. La coherencia se volvió a calcular.</p>}
            {error && <p className="pro-alert" role="alert"><AlertTriangle size={15} aria-hidden="true" /> {error}</p>}
            {propuesta && (
                <div className="pro-coh-propuesta">
                    <span>Propuesta de la IA</span>
                    {cambios.length > 0 && <p className="pro-coh-sube">Con este cambio la coherencia de esta relación pasa de <b>{propuesta.antes} %</b> a <b>{propuesta.despues} %</b>.</p>}
                    {cambios.length === 0
                        ? <p>La IA no encontró nada que cambiar en la redacción. Revisa la sección a mano.</p>
                        : cambios.map((c) => (
                            <div key={c.rotulo} className="pro-coh-cambio">
                                <b>{c.rotulo}</b>
                                <p className="pro-coh-antes"><i>Antes</i>{c.antes || '—'}</p>
                                <p className="pro-coh-despues"><i>Después</i>{c.despues}</p>
                            </div>
                        ))}
                    <div className="pro-coh-decidir">
                        {cambios.length > 0 && <button type="button" className="pro-btn pro-btn--primary" onClick={aplicar}><Check size={15} /> Aplicar</button>}
                        <button type="button" className="pro-btn pro-btn--ghost" onClick={pedir}>Proponer otra</button>
                        <button type="button" className="pro-link" onClick={() => setPropuesta(null)}>Descartar</button>
                    </div>
                    <small>Léela antes de aplicarla: cambia el texto guardado de tu proyecto. Puedes deshacerlo desde «Historial de versiones».</small>
                </div>
            )}
        </div>
    );
};

export default Arreglar;
