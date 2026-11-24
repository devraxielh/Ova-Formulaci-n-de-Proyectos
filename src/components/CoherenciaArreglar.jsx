import React, { useState } from 'react';
import { AlertTriangle, Check, Loader2, Sparkles } from 'lucide-react';
import { groq } from '../services/api';
import { useProjectField } from '../context/ProjectContext';
import { partesObjetivos } from '../services/coherencia';

/*
 * Botón «Arreglar con IA» de una relación débil en «Coherencia entre secciones».
 * Propone el texto corregido (la pregunta, el objetivo general o los específicos), muestra el antes y el después,
 * y solo cambia el proyecto cuando el estudiante toca «Aplicar».
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
    especificos: 'Reescribe los OBJETIVOS ESPECÍFICOS que se alejan del objetivo general para que retomen su mismo objeto de estudio, población y lugar: cada específico es un paso para lograr el general. Devuelve todos, en el mismo orden y la misma cantidad; deja igual los que ya son coherentes. Conserva el verbo en infinitivo con que empieza cada uno y su intención (identificar, analizar, proponer…). Sin numeración y sin punto final. Responde con este JSON: {"especificos": ["…"]}',
};

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

    const pedir = async () => {
        setError('');
        setPropuesta(null);
        setEstado('pensando');
        try {
            const r = await groq.chat.completions.create({
                messages: [
                    { role: 'system', content: 'Ayudas a un estudiante a dejar coherentes las partes de su proyecto de investigación. Corriges solo lo que se te pide, con los datos que ya tiene: no agregas cifras, autores, variables ni poblaciones nuevas. Respondes solo JSON válido en español.' },
                    { role: 'user', content: `Título: ${limpio(data?.titulo) || '(sin título)'}\nPregunta de investigación: ${limpio(data?.pregunta) || '(sin pregunta)'}\nObjetivo general: ${general || '(sin objetivo general)'}\nObjetivos específicos:\n${especificos.length ? especificos.map((x, i) => `${i + 1}. ${x}`).join('\n') : '(sin específicos)'}\n\nProblema de coherencia detectado (${check.label}): ${check.detail}${check.porque ? `\nPor qué: ${check.porque}` : ''}\n\n${INSTRUCCION[que]}` },
                ],
                temperature: 0.3,
                max_tokens: 700,
                response_format: { type: 'json_object' },
            });
            const content = r.choices?.[0]?.message?.content || '';
            const json = JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1));
            if (que === 'pregunta') {
                const p = limpio(json.pregunta).replace(/^¿?/, '¿').replace(/\??$/, '?');
                if (p.length < 12) throw new Error('La IA no devolvió una pregunta. Inténtalo de nuevo.');
                setPropuesta({ pregunta: p });
            } else if (que === 'general') {
                const g = sinPunto(json.general);
                if (g.length < 12) throw new Error('La IA no devolvió un objetivo. Inténtalo de nuevo.');
                setPropuesta({ general: capital(g) });
            } else {
                const lista = (Array.isArray(json.especificos) ? json.especificos : []).map(sinPunto).filter(Boolean).map(capital);
                // Tiene que devolver los mismos objetivos, no más ni menos: si no, no se toca nada.
                if (lista.length !== especificos.length) throw new Error('La IA cambió la cantidad de objetivos. Inténtalo de nuevo.');
                setPropuesta({ especificos: lista });
            }
        } catch (err) {
            setError(err?.message?.includes('JSON') ? 'La IA respondió en un formato inesperado. Inténtalo de nuevo.' : (err.message || 'No se pudo proponer el arreglo.'));
        } finally {
            setEstado('');
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
