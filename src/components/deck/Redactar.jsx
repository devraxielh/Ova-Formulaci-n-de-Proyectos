import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, Loader2, PenLine, Quote, Sparkles, X } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { leerArbol, leerArbolObjetivos } from '../../services/arbol';
import { groq } from '../../services/api';
// aHtml escapa todo lo escrito antes de aplicar negrita y cursiva: lo que se muestra nunca se interpreta como HTML.
import { aHtml } from '../../services/textoRico';
import { campoDe, fijarValor, insertarEn, marcaDe, placeholderDe, valorDe } from './campo';
import './RevisarIA.css';
import './Redactar.css';

/*
 * Botón «Redactar» de la barra de las clases: ayuda con el párrafo del campo donde está el cursor
 * (o solo con el texto seleccionado). Siempre muestra el antes y el después; nada cambia hasta «Aceptar».
 */

const ACCIONES = [
    // Única acción que escribe contenido: arma el párrafo con lo que el estudiante ya definió en su proyecto.
    { id: 'llenar', label: 'Llenar con mi proyecto', llenar: true },
    { id: 'mejorar', label: 'Mejorar la redacción', pide: 'Mejora la redacción: frases claras y bien conectadas, sin muletillas ni repeticiones, con ortografía y puntuación correctas. Conserva el registro académico.' },
    { id: 'tercera', label: 'Pasar a tercera persona', pide: 'Pasa el texto a tercera persona o a forma impersonal («se realizó», «el estudio analiza»), como exige la escritura académica. No cambies nada más.' },
    { id: 'acortar', label: 'Acortar', pide: 'Acorta el texto alrededor de un tercio: quita relleno y repeticiones, y conserva todas las ideas, datos y citas.' },
    { id: 'citas', label: 'Detectar frases sin cita', detectar: true },
];

const REGLAS = 'Reglas estrictas: no agregues información, datos, cifras, autores ni citas que no estén en el texto; no quites ni cambies las citas (Autor, año), las marcas entre corchetes dobles como [[abc123]] ni los asteriscos de formato (**negrita**, *cursiva*); conserva el significado y el idioma (español); no uses viñetas ni títulos si el original no los tiene.';

// De qué trata el campo: su etiqueta visible (o la más cercana) y su texto de ayuda.
const rotuloDe = (el) => {
    const doc = el.ownerDocument;
    const porId = el.id ? doc.querySelector(`label[for="${window.CSS?.escape ? window.CSS.escape(el.id) : el.id}"]`) : null;
    const cercano = porId || el.closest('label') || el.closest('.input-group, .pla-part, fieldset, .ide-field')?.querySelector('label, legend, h3, b');
    return String(el.getAttribute('aria-label') || cercano?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 140);
};

// Lo que ya está definido en el proyecto y sirve para redactar: solo los ítems que tienen contenido.
const itemsDelProyecto = (d) => {
    const t = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();
    const problema = leerArbol(d);
    const objetivos = leerArbolObjetivos(d);
    const f = d?.tituloForm || {};
    const idea = d?.idea || {};
    return [
        ['Título', t(d?.titulo)],
        ['Pregunta de investigación', t(d?.pregunta)],
        ['Población', t(f.quien || idea.quien)],
        ['Lugar', t(f.donde || idea.donde)],
        ['Periodo', t(f.cuando || idea.cuando)],
        ['Problema central', problema.problema],
        ['Causas del problema', problema.causas.join('; ')],
        ['Efectos del problema', problema.efectos.join('; ')],
        ['Objetivo general', t(d?.objetivoGeneral)],
        ['Objetivos específicos', t(String(d?.objetivos || '').split(/objetivos\s+espec[ií]ficos/i)[1]).slice(0, 700)],
        ['Medios (árbol de objetivos)', objetivos.propio ? objetivos.causas.join('; ') : ''],
        ['Fines (árbol de objetivos)', objetivos.propio ? objetivos.efectos.join('; ') : ''],
        ['Enfoque metodológico', t(d?.metEnfoque)],
        ['Tipo de investigación', t(d?.metTipo)],
        ['Diseño', t(d?.metDiseno)],
    ].filter(([, valor]) => valor);
};

const pedirLlenar = async ({ rotulo, clase, ayuda, actual, items }) => {
    const r = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: 'Ayudas a un estudiante a redactar una parte de su proyecto de investigación, en español y en tercera persona o forma impersonal. Te basas únicamente en los datos de su proyecto que se te entregan. No inventas cifras, porcentajes, estudios, autores, citas ni leyes: donde haga falta un dato o una fuente, dejas una indicación entre corchetes, por ejemplo [agrega una cifra y su fuente]. Devuelves únicamente el párrafo, sin título, sin comillas y sin explicaciones.' },
            { role: 'user', content: `Sección del proyecto: ${clase || '(sin nombre)'}\nParte que se va a redactar: ${rotulo || '(sin etiqueta)'}${ayuda ? `\nIndicación del campo: ${ayuda}` : ''}\n\nDATOS DEL PROYECTO\n${items.map(([k, v]) => `- ${k}: ${v}`).join('\n')}\n\n${actual ? `El estudiante ya escribió esto; consérvalo, mejóralo si hace falta y complétalo:\n${actual}\n\n` : ''}Redacta ${actual ? 'el párrafo completo' : 'un párrafo'} para esa parte, de 70 a 130 palabras, coherente con el título, la pregunta y los objetivos. Usa solo lo que corresponde a esa parte (por ejemplo, en «Causas» habla de las causas; en «Contexto», del panorama general). Mantén la misma población y el mismo lugar. Conserva tal cual las citas (Autor, año) y las marcas como [[abc123]] que ya existan.` },
        ],
        temperature: 0.4,
        max_tokens: 700,
    });
    const propuesta = String(r.choices?.[0]?.message?.content || '').trim().replace(/^["«]|["»]$/g, '').trim();
    if (!propuesta) throw new Error('La IA no devolvió texto. Inténtalo de nuevo.');
    return { propuesta };
};

const pedir = async (accion, texto) => {
    if (accion.detectar) {
        const r = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: 'Eres revisor de escritura académica en formato APA. Identificas afirmaciones que necesitan respaldo de una fuente. Respondes solo JSON válido en español.' },
                { role: 'user', content: `En este texto, señala las frases que necesitan una cita y no la tienen: cifras, porcentajes, datos, definiciones, afirmaciones sobre lo que «se ha demostrado» o «los estudios indican», teorías y leyes. No señales opiniones propias del autor, descripciones de su propio estudio ni frases que ya tienen cita (Autor, año).\n\nTEXTO:\n${texto}\n\nResponde exactamente: {"frases": [{"frase": "copia textual de la frase, máximo 25 palabras", "porque": "qué tipo de respaldo necesita y dónde buscarlo"}]}. Si todas están respaldadas, devuelve {"frases": []}.` },
            ],
            temperature: 0.2,
            max_tokens: 1500,
            response_format: { type: 'json_object' },
        });
        const content = r.choices?.[0]?.message?.content || '';
        const json = JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1));
        return { frases: (Array.isArray(json.frases) ? json.frases : []).map((f) => ({ frase: String(f?.frase || '').trim(), porque: String(f?.porque || '').trim() })).filter((f) => f.frase).slice(0, 12) };
    }
    const r = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: `Eres corrector de estilo académico en español. ${REGLAS} Devuelves únicamente el texto corregido, sin comillas, sin explicaciones y sin frases de introducción.` },
            { role: 'user', content: `${accion.pide}\n\nTEXTO:\n${texto}` },
        ],
        temperature: 0.3,
        max_tokens: Math.min(4000, Math.max(400, Math.round(texto.length / 2))),
    });
    const propuesta = String(r.choices?.[0]?.message?.content || '').trim().replace(/^["«]|["»]$/g, '').trim();
    if (!propuesta) throw new Error('La IA no devolvió texto. Inténtalo de nuevo.');
    return { propuesta };
};

// Citas y marcas que deben sobrevivir al cambio; si falta alguna, se avisa antes de aceptar.
const protegidas = (texto) => [...String(texto).matchAll(/\([^()]*\b(?:19|20)\d{2}[^()]*\)|\[\[[a-z0-9]{5,9}\]\]/g)].map((m) => m[0]);

const Redactar = ({ stageRef }) => {
    const { data } = useProject();
    const items = itemsDelProyecto(data);
    const [estado, setEstado] = useState('');
    const [error, setError] = useState('');
    const [trabajo, setTrabajo] = useState(null); // { el, inicio, fin, original, accion, propuesta?, frases? }
    const ultimo = useRef(null); // { el, inicio, fin }
    const dialog = useRef(null);

    // Recuerda el último campo y la selección que tenía antes de tocar el botón.
    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) return undefined;
        const anotar = (event) => {
            if (dialog.current?.contains(event.target)) return;
            const el = campoDe(event.target);
            if (el) ultimo.current = { el, marca: marcaDe(el) };
        };
        ['focusin', 'select', 'keyup', 'mouseup'].forEach((t) => stage.addEventListener(t, anotar));
        return () => ['focusin', 'select', 'keyup', 'mouseup'].forEach((t) => stage.removeEventListener(t, anotar));
    }, [stageRef]);

    const abrir = () => {
        setError('');
        setEstado('');
        const u = ultimo.current;
        if (!u || !u.el.isConnected) { setTrabajo(null); dialog.current?.showModal(); return; }
        // Con texto seleccionado se trabaja solo sobre esa parte; si no, sobre todo el campo.
        const haySeleccion = u.marca.texto.trim().length > 0;
        setTrabajo({ el: u.el, marca: u.marca, original: haySeleccion ? u.marca.texto : valorDe(u.el), seleccion: haySeleccion, rotulo: rotuloDe(u.el) });
        dialog.current?.showModal();
    };
    const ejecutar = async (accion) => {
        setError('');
        setEstado('pensando');
        setTrabajo((t) => ({ ...t, accion, propuesta: '', frases: null }));
        try {
            // «Llenar con mi proyecto» trabaja sobre el campo completo, aunque esté vacío o haya una parte seleccionada.
            const r = accion.llenar
                ? await pedirLlenar({ rotulo: trabajo.rotulo, clase: stageRef.current?.getAttribute('aria-label') || '', ayuda: placeholderDe(trabajo.el).replace(/^Ej:\s*/, ''), actual: valorDe(trabajo.el).trim(), items })
                : await pedir(accion, trabajo.original);
            setTrabajo((t) => ({ ...t, accion, ...r }));
        } catch (err) {
            setError(err?.message?.includes('JSON') ? 'La IA respondió en un formato inesperado. Inténtalo de nuevo.' : (err.message || 'No se pudo completar.'));
        } finally {
            setEstado('');
        }
    };
    const aceptar = () => {
        if (trabajo.el.isConnected) {
            if (trabajo.seleccion && !trabajo.accion?.llenar) insertarEn(trabajo.el, trabajo.propuesta, trabajo.marca, { espacios: false });
            else fijarValor(trabajo.el, trabajo.propuesta);
        }
        dialog.current?.close();
    };

    const texto = trabajo?.original?.trim() || '';
    const perdidas = trabajo?.propuesta ? protegidas(trabajo.original).filter((c) => !trabajo.propuesta.includes(c)) : [];
    const palabras = (t) => String(t).trim().split(/\s+/).filter(Boolean).length;

    return (
        <>
            <button type="button" className="ria-btn" onClick={abrir} title="Redactar o mejorar el párrafo donde está el cursor">
                <PenLine size={16} aria-hidden="true" /> <span>Redactar</span>
            </button>
            <dialog ref={dialog} className="ria-modal" aria-label="Asistente de redacción" onClick={(e) => { if (e.target === dialog.current) dialog.current.close(); }}>
                <div className="ria-box">
                    <header className="ria-head">
                        <div>
                            <p className="ria-kicker">Asistente de redacción</p>
                            <h2>{trabajo?.seleccion ? 'Texto seleccionado' : trabajo?.rotulo || 'Párrafo del campo'}</h2>
                        </div>
                        <button type="button" className="ria-close" onClick={() => dialog.current?.close()} aria-label="Cerrar"><X size={18} /></button>
                    </header>
                    <div className="ria-body">
                        {!trabajo ? (
                            <p className="ria-vacio">Haz clic dentro del campo que quieres redactar o mejorar (o selecciona solo una parte del texto) y vuelve a tocar «Redactar».</p>
                        ) : (
                            <>
                                <div className="red-acciones">
                                    {ACCIONES.map((a) => <button key={a.id} type="button" className="red-accion" data-activa={trabajo.accion?.id === a.id} data-llenar={a.llenar || undefined} disabled={estado === 'pensando' || (a.llenar ? items.length === 0 : !texto)} onClick={() => ejecutar(a)}>{a.detectar && <Quote size={14} aria-hidden="true" />}{a.llenar && <Sparkles size={14} aria-hidden="true" />} {a.label}</button>)}
                                </div>
                                <p className="red-nota">{items.length === 0
                                    ? '«Llenar con mi proyecto» necesita que ya tengas al menos tu título o tu pregunta de investigación.'
                                    : `«Llenar con mi proyecto» redacta este párrafo con lo que ya definiste: ${items.slice(0, 6).map(([k]) => k.toLowerCase()).join(', ')}${items.length > 6 ? ` y ${items.length - 6} más` : ''}.`}</p>
                                {texto ? (
                                    <section>
                                        <h3>Tu texto <small>{palabras(trabajo.original)} palabras</small></h3>
                                        <div className="red-texto" dangerouslySetInnerHTML={{ __html: aHtml(trabajo.original) }} />
                                    </section>
                                ) : <p className="ria-vacio">Este campo está vacío. Puedes llenarlo con tu proyecto; las demás opciones sirven cuando ya hay texto.</p>}
                                {estado === 'pensando' && <p className="ria-cargando" role="status"><Loader2 size={18} className="ria-spin" aria-hidden="true" /> Trabajando en tu texto…</p>}
                                {error && <p className="ria-error" role="alert"><AlertTriangle size={16} aria-hidden="true" /> {error}</p>}
                                {trabajo.propuesta && estado !== 'pensando' && (
                                    <section>
                                        <h3>Propuesta <small>{palabras(trabajo.propuesta)} palabras</small></h3>
                                        <div className="red-texto red-propuesta" dangerouslySetInnerHTML={{ __html: aHtml(trabajo.propuesta) }} />
                                        {perdidas.length > 0 && <p className="ria-aviso">Atención: en la propuesta ya no aparece {perdidas.length === 1 ? 'esta cita o marca' : 'estas citas o marcas'}: {perdidas.join(' · ')}. Si aceptas, vuelve a ponerlas.</p>}
                                    </section>
                                )}
                                {trabajo.frases && estado !== 'pensando' && (
                                    <section>
                                        <h3>{trabajo.frases.length ? `Frases que necesitan cita (${trabajo.frases.length})` : 'No se encontraron frases sin respaldo'}</h3>
                                        {trabajo.frases.length > 0 && (
                                            <ol className="ria-obs">
                                                {trabajo.frases.map((f, i) => <li key={i}><blockquote>«{f.frase}»</blockquote><p>{f.porque}</p></li>)}
                                            </ol>
                                        )}
                                        <p className="ria-vacio">Busca la fuente en Referencias › «Buscar artículos sobre tu tema» y agrégala con el botón «Citar».</p>
                                    </section>
                                )}
                            </>
                        )}
                    </div>
                    <footer className="ria-foot">
                        <small>{trabajo?.accion?.llenar ? 'Es un borrador armado con tu proyecto: no trae cifras ni fuentes. Complétalo donde veas corchetes, léelo completo y ajústalo antes de aceptarlo.' : 'La IA no agrega datos ni fuentes; solo cambia la forma. Lee la propuesta completa antes de aceptarla: el texto sigue siendo tuyo.'}</small>
                        {trabajo?.propuesta && estado !== 'pensando' && (
                            <span className="red-decidir">
                                <button type="button" className="red-rechazar" onClick={() => setTrabajo((t) => ({ ...t, propuesta: '', accion: null }))}>Rechazar</button>
                                <button type="button" className="ria-accion" onClick={aceptar}><Check size={15} /> Aceptar el cambio</button>
                            </span>
                        )}
                    </footer>
                </div>
            </dialog>
        </>
    );
};

export default Redactar;
