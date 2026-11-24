import React, { useState } from 'react';
import { CheckCircle2, ExternalLink, Lightbulb, Loader2, Search, Sparkles } from 'lucide-react';
import { useProjectField } from '../context/ProjectContext';
import { api, groq } from '../services/api';
import { referenciaAPA } from '../services/apa';
import { completarRef, deOpenAlex, refYaEsta } from './BuscarAntecedentes';
import './BuscarAntecedentes.css';

/*
 * «Sugerir teorías» del Marco teórico. La IA solo propone QUÉ teorías aplican al proyecto; el autor, el año y la
 * referencia salen de la obra más citada que nombra la teoría en su título (OpenAlex, por el servidor).
 * `onUsar({ nombre, ref, resumen, prestado })` crea la ficha y la llena; responde 'llena', 'prestada', 'ia' o 'vacia'.
 */

const uid = () => Math.random().toString(36).slice(2, 9);
const limpio = (v, max = 160) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

// La IA propone teorías reconocidas para el proyecto. No da referencias: esas se buscan después.
const proponer = async (proyecto, yaTiene) => {
    const r = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: 'Eres asesor de proyectos de investigación. Propones teorías o modelos teóricos que EXISTEN, están publicados y tienen un nombre establecido en la literatura académica, y que sirven para sustentar el proyecto del estudiante. No inventas teorías ni nombres. Si dudas de que una teoría exista con ese nombre, no la propones. Respondes solo JSON válido.' },
            { role: 'user', content: `PROYECTO\nTítulo: ${proyecto.titulo || '(sin título)'}\nProblema: ${proyecto.problema || '(sin definir)'}\nPregunta de investigación: ${proyecto.pregunta || '(sin definir)'}\nPoblación: ${proyecto.quien || '(sin definir)'}\nLugar: ${proyecto.donde || '(sin definir)'}\n${yaTiene.length ? `\nYa tiene estas teorías, no las repitas: ${yaTiene.join('; ')}\n` : ''}\nPropón cuatro teorías o modelos distintos que expliquen este problema, de la más a la menos pertinente. Para cada una:\n- "nombre": su nombre habitual en español, con artículo si lo lleva. Ejemplo solo de forma: «La teoría del apego».\n- "ingles": su nombre habitual en inglés, en minúsculas, tal como aparece en los títulos de los artículos, sin autor ni año. Ejemplo solo de forma: «attachment theory».\n- "autor": solo el apellido del autor que la propuso; cadena vacía si no estás seguro.\n- "porque": una frase corta que diga por qué sirve para este proyecto, que empiece con un verbo en tercera persona en minúscula. Sin punto final.\nLos ejemplos solo muestran la forma: no los propongas salvo que de verdad apliquen.\n\nResponde exactamente con este JSON: {"teorias": [{"nombre": "…", "ingles": "…", "autor": "…", "porque": "…"}]}` },
        ],
        temperature: 0.3,
        max_tokens: 900,
        response_format: { type: 'json_object' },
    });
    const content = r.choices?.[0]?.message?.content || '';
    const json = JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1));
    return (Array.isArray(json.teorias) ? json.teorias : [])
        .map((t) => ({ nombre: limpio(t.nombre), ingles: limpio(t.ingles), autor: limpio(t.autor, 60), porque: limpio(t.porque, 300).replace(/[.\s]+$/, '') }))
        .filter((t) => t.nombre && t.ingles)
        .slice(0, 5);
};

const SugerirTeorias = ({ proyecto, yaTiene = [], onUsar }) => {
    const [refs, setRefs] = useProjectField('referencias', []);
    const [estado, setEstado] = useState('');
    const [error, setError] = useState('');
    const [teorias, setTeorias] = useState(null);
    const [nombre, setNombre] = useState('');
    const [abierto, setAbierto] = useState('');
    const [usados, setUsados] = useState({});
    const lista = Array.isArray(refs) ? refs : [];

    // Trae de OpenAlex las obras de cada teoría y las une a la propuesta.
    const conObras = async (propuestas) => {
        const r = await api.buscarTeorias(propuestas.map((t) => ({ nombre: t.nombre, ingles: t.ingles, autor: t.autor })));
        return propuestas.map((t, i) => ({ ...t, id: uid(), obras: (r.items?.[i]?.obras || []).map((w) => ({ ...deOpenAlex(w), delAutor: Boolean(w.del_autor) })) }));
    };

    const sugerir = async () => {
        setEstado('pensando');
        setError('');
        try {
            const propuestas = await proponer(proyecto, yaTiene);
            if (!propuestas.length) throw new Error('La IA no propuso teorías. Inténtalo de nuevo o escribe el nombre de una teoría.');
            setEstado('buscando');
            setTeorias(await conObras(propuestas));
        } catch (err) {
            setError(err.name === 'SyntaxError' ? 'La IA no respondió bien. Inténtalo de nuevo.' : (err.message || 'No se pudo sugerir.'));
        } finally {
            setEstado('');
        }
    };

    // El estudiante ya sabe qué teoría quiere: se busca su obra por el nombre que escriba (mejor en inglés).
    const buscarNombre = async (event) => {
        event.preventDefault();
        const q = limpio(nombre);
        if (q.length < 3) return;
        setEstado('nombre');
        setError('');
        try {
            const [nueva] = await conObras([{ nombre: q, ingles: q, autor: '', porque: '' }]);
            setTeorias((prev) => [nueva, ...(prev || [])]);
            setNombre('');
        } catch (err) {
            setError(err.message || 'No se pudo buscar.');
        } finally {
            setEstado('');
        }
    };

    const usar = async (teoria, item) => {
        setUsados((p) => ({ ...p, [item.clave]: 'llenando' }));
        const ref = await completarRef(item);
        if (!refYaEsta(lista, ref)) setRefs((prev) => [...(Array.isArray(prev) ? prev : []), { ...ref, id: uid() }]);
        // Si esta obra no trae resumen (pasa en libros antiguos), se usa el de otra obra muy citada sobre la misma teoría.
        const otra = item.resumen.length >= 80 ? null : teoria.obras.find((o) => o.clave !== item.clave && o.resumen.length >= 80);
        const quedo = await onUsar({ nombre: teoria.nombre, ref, resumen: otra ? otra.resumen : item.resumen, prestado: otra ? otra.ref.titulo : '' });
        setUsados((p) => ({ ...p, [item.clave]: quedo }));
    };

    const ocupado = Boolean(estado);
    return (
        <section className="bus-panel">
            <h3><Lightbulb size={17} aria-hidden="true" /> Sugerir teorías para tu tema</h3>
            <p className="bus-base-nota">La IA propone qué teorías aplican a tu proyecto. El autor, el año y la referencia no los pone la IA: salen de la obra más citada sobre cada teoría en OpenAlex.</p>
            <div className="bus-acciones">
                <button type="button" className="ide-btn ide-btn--primary" disabled={ocupado} onClick={sugerir}>
                    {estado === 'pensando' || estado === 'buscando' ? <Loader2 size={16} className="bus-spin" /> : <Sparkles size={16} />}
                    {estado === 'pensando' ? ' Pensando en tu proyecto…' : estado === 'buscando' ? ' Buscando las obras originales…' : teorias ? ' Sugerir otras' : ' Sugerir teorías para mi tema'}
                </button>
            </div>
            <form className="bus-form bus-form--corta" onSubmit={buscarNombre}>
                <input className="input-field" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="¿Ya sabes cuál? Escribe su nombre, mejor en inglés. Ej: social cognitive theory" aria-label="Nombre de la teoría" />
                <button type="submit" className="ide-btn ide-btn--ghost" disabled={ocupado || limpio(nombre).length < 3}>
                    {estado === 'nombre' ? <Loader2 size={16} className="bus-spin" /> : <Search size={16} />} Buscar su obra
                </button>
            </form>
            {error && <p className="ide-feedback ide-feedback--bad" role="alert">{error}</p>}
            {teorias && (
                <ul className="bus-lista bus-teorias">
                    {teorias.map((t) => (
                        <li key={t.id}>
                            <p className="bus-apa"><strong>{t.nombre}</strong>{t.porque ? ` — ${t.porque}.` : ''}</p>
                            {t.obras.length === 0 && <p className="bus-meta"><span className="bus-pre">Sin obra encontrada con ese nombre. Puede que la teoría se llame de otra forma: búscala por su nombre en inglés antes de usarla.</span></p>}
                            {t.obras.map((item) => {
                                const e = usados[item.clave];
                                return (
                                    <div className="bus-obra" key={item.clave}>
                                        <p className="bus-apa">{referenciaAPA(item.ref).split(/(\*[^*]+\*)/g).map((p, i) => (p.startsWith('*') && p.endsWith('*') ? <em key={i}>{p.slice(1, -1)}</em> : p))}</p>
                                        <p className="bus-meta">
                                            {item.delAutor && <span className="bus-oa">Del autor de la teoría</span>}
                                            {item.ref.tipo === 'libro' && <span>Libro</span>}
                                            {item.citas > 0 && <span>{item.citas.toLocaleString('es-CO')} citas</span>}
                                            {!item.resumen && <span>Sin resumen</span>}
                                            {item.enlace && <a href={item.enlace} target="_blank" rel="noreferrer noopener"><ExternalLink size={13} /> Abrir la obra</a>}
                                            {item.resumen && <button type="button" className="ide-link" onClick={() => setAbierto(abierto === item.clave ? '' : item.clave)}>{abierto === item.clave ? 'Ocultar resumen' : 'Ver resumen'}</button>}
                                        </p>
                                        {abierto === item.clave && <p className="bus-resumen">{item.resumen}</p>}
                                        <div className="bus-acciones">
                                            {!e && <button type="button" className="ide-btn ide-btn--ghost" onClick={() => usar(t, item)}>Usar esta obra en la ficha</button>}
                                            {e === 'llenando' && <span className="bus-ok"><Loader2 size={15} className="bus-spin" /> Llenando la ficha…</span>}
                                            {e === 'llena' && <span className="bus-ok"><CheckCircle2 size={15} /> Ficha llena con el resumen de la obra y agregada a tus referencias: revísala abajo</span>}
                                            {e === 'prestada' && <span className="bus-ok"><CheckCircle2 size={15} /> Ficha llena. Esta obra no trae resumen: «Qué plantea» sale del resumen de otra obra sobre la teoría. Verifícalo</span>}
                                            {e === 'ia' && <span className="bus-ok bus-ok--ojo"><CheckCircle2 size={15} /> Ficha llena. No había resumen: «Qué plantea» lo redactó la IA. Verifícalo en la obra antes de entregar</span>}
                                            {e === 'vacia' && <span className="bus-ok"><CheckCircle2 size={15} /> Ficha creada con el autor y el año: completa qué plantea</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </li>
                    ))}
                </ul>
            )}
            {teorias && <p className="ide-field-hint">La obra más citada no siempre es la original: a veces es una revisión posterior. Mira el año y el autor antes de elegir, y lee la obra antes de citarla.</p>}
        </section>
    );
};

export default SugerirTeorias;
