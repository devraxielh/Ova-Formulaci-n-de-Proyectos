import React, { useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, Plus, Sparkles, Table2, Tags, Trash2 } from 'lucide-react';
import { useProject, useProjectField } from '../context/ProjectContext';
import { groq } from '../services/api';
import { partesObjetivos } from '../services/coherencia';
import { COLORES, MAX_FUENTES, MAX_TEXTO, normalizar, resumenCategorias, tablaCategorias, tramos } from '../services/cualitativo';

/*
 * Análisis cualitativo: se pegan las transcripciones, se marcan fragmentos con categorías
 * y se obtiene la tabla de categorías con sus citas textuales para Resultados.
 */

const uid = () => Math.random().toString(36).slice(2, 9);

const sugerir = async (texto, data) => {
    const { especificos } = partesObjetivos(data.objetivos);
    const r = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: 'Eres investigador cualitativo. Propones categorías de análisis a partir de una transcripción, mutuamente excluyentes y ligadas a los objetivos del estudio. No inventas contenido que no esté en el texto. Respondes solo JSON válido en español.' },
            { role: 'user', content: `Propón entre 4 y 7 categorías para codificar esta entrevista.\n\nOBJETIVOS ESPECÍFICOS:\n${especificos.map((o, i) => `${i + 1}. ${o}`).join('\n') || '(sin definir)'}\n\nTRANSCRIPCIÓN (fragmento):\n${texto.slice(0, 12000)}\n\nResponde exactamente: {"categorias": [{"nombre": "2 a 4 palabras", "definicion": "una frase que diga qué fragmentos entran en esta categoría"}]}` },
        ],
        temperature: 0.3,
        max_tokens: 1200,
        response_format: { type: 'json_object' },
    });
    const content = r.choices?.[0]?.message?.content || '';
    const json = JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1));
    return (Array.isArray(json.categorias) ? json.categorias : []).map((c) => ({ nombre: String(c?.nombre || '').trim(), definicion: String(c?.definicion || '').trim() })).filter((c) => c.nombre).slice(0, 8);
};

const AnalisisCualitativo = ({ onNavigate, embebido = false }) => {
    const { data } = useProject();
    const [guardado, setGuardado] = useProjectField('cualitativo', { fuentes: [], categorias: [], citas: [] });
    const [, setElementos] = useProjectField('elementos', []);
    const c = normalizar(guardado);
    const [activa, setActiva] = useState('');
    const [nueva, setNueva] = useState({ nombre: '', texto: '' });
    const [seleccion, setSeleccion] = useState('');
    const [nuevaCat, setNuevaCat] = useState('');
    const [estado, setEstado] = useState('');
    const [error, setError] = useState('');
    const [sugeridas, setSugeridas] = useState([]);
    const [hecho, setHecho] = useState(false);
    const caja = useRef(null);
    const fuente = c.fuentes.find((f) => f.id === activa) || c.fuentes[0] || null;
    const cambiar = (patch) => { setHecho(false); setGuardado((prev) => ({ ...normalizar(prev), ...patch(normalizar(prev)) })); };

    const agregarFuente = () => {
        const texto = nueva.texto.trim().slice(0, MAX_TEXTO);
        if (texto.length < 80) { setError('Pega la transcripción completa (al menos unas líneas).'); return; }
        setError('');
        const f = { id: uid(), nombre: nueva.nombre.trim() || `Entrevista ${c.fuentes.length + 1}`, texto };
        cambiar((p) => ({ fuentes: [...p.fuentes, f] }));
        setActiva(f.id);
        setNueva({ nombre: '', texto: '' });
    };
    const quitarFuente = (id) => cambiar((p) => ({ fuentes: p.fuentes.filter((f) => f.id !== id), citas: p.citas.filter((x) => x.fuenteId !== id) }));
    const agregarCategoria = (nombre, definicion = '') => {
        const limpio = nombre.trim();
        if (!limpio || c.categorias.some((k) => k.nombre.toLowerCase() === limpio.toLowerCase())) return null;
        const cat = { id: uid(), nombre: limpio, definicion, color: COLORES[c.categorias.length % COLORES.length] };
        cambiar((p) => ({ categorias: [...p.categorias, cat] }));
        return cat;
    };
    // Al soltar el ratón sobre la transcripción se toma el texto seleccionado para codificarlo.
    const alSeleccionar = () => {
        const sel = window.getSelection();
        const texto = sel ? sel.toString().replace(/\s+/g, ' ').trim() : '';
        if (!sel || !caja.current?.contains(sel.anchorNode) || texto.length < 8) { setSeleccion(''); return; }
        // Se guarda tal como está en la transcripción (para poder resaltarlo después).
        const crudo = sel.toString().trim();
        setSeleccion(fuente.texto.includes(crudo) ? crudo : texto);
    };
    const codificar = (categoriaId) => {
        if (!seleccion || !fuente) return;
        cambiar((p) => ({ citas: [...p.citas, { id: uid(), fuenteId: fuente.id, categoriaId, texto: seleccion.slice(0, 700) }] }));
        setSeleccion('');
        window.getSelection()?.removeAllRanges();
    };
    const pedirSugerencias = async () => {
        setError('');
        setEstado('sugiriendo');
        try {
            const lista = await sugerir(fuente.texto, data);
            setSugeridas(lista.filter((s) => !c.categorias.some((k) => k.nombre.toLowerCase() === s.nombre.toLowerCase())));
        } catch (err) {
            setError(err?.message?.includes('JSON') ? 'La IA respondió en un formato inesperado. Inténtalo de nuevo.' : (err.message || 'No se pudieron sugerir categorías.'));
        } finally {
            setEstado('');
        }
    };
    const resumen = resumenCategorias(c);
    const llevar = () => {
        const tabla = tablaCategorias(c);
        setElementos((prev) => [...(Array.isArray(prev) ? prev : []), { id: uid(), tipo: 'tabla', seccion: 'resultados', titulo: 'Categorías de análisis y citas representativas', nota: `Elaboración propia a partir de ${c.fuentes.length} ${c.fuentes.length === 1 ? 'entrevista' : 'entrevistas'} (${c.citas.length} fragmentos codificados).`, head: tabla.head, rows: tabla.rows }]);
        setHecho(true);
    };

    return (
        <>
            <section className="pro-card">
                <h2><Tags size={20} aria-hidden="true" /> Entrevistas y categorías</h2>
                <p className="adm-muted">Pega cada transcripción, selecciona con el ratón los fragmentos importantes y asígnales una categoría. Cambia los nombres reales por códigos (E1, E2…) antes de pegar: las transcripciones se guardan en tu proyecto.</p>
                {c.fuentes.length > 0 && (
                    <div className="ins-tabs" role="tablist">
                        {c.fuentes.map((f) => <button key={f.id} type="button" role="tab" aria-selected={fuente?.id === f.id} onClick={() => { setActiva(f.id); setSeleccion(''); }}>{f.nombre}</button>)}
                    </div>
                )}
                {c.fuentes.length < MAX_FUENTES && (
                    <details className="cua-nueva" open={c.fuentes.length === 0}>
                        <summary><Plus size={15} /> Agregar una transcripción ({c.fuentes.length} de {MAX_FUENTES})</summary>
                        <input className="input-field" value={nueva.nombre} onChange={(e) => setNueva({ ...nueva, nombre: e.target.value })} placeholder="Nombre o código: E1 – Enfermera de consulta externa" aria-label="Nombre de la transcripción" />
                        <textarea className="textarea-field" rows={6} value={nueva.texto} onChange={(e) => setNueva({ ...nueva, texto: e.target.value })} placeholder="Pega aquí la transcripción de la entrevista o del grupo focal…" aria-label="Texto de la transcripción" />
                        <small className="adm-muted">{nueva.texto.length.toLocaleString('es-CO')} de {MAX_TEXTO.toLocaleString('es-CO')} caracteres (unas 25 páginas).</small>
                        <button type="button" className="pro-btn pro-btn--primary" onClick={agregarFuente}>Guardar transcripción</button>
                    </details>
                )}
                {error && <p className="pro-alert" role="alert"><AlertTriangle size={15} /> {error}</p>}
            </section>

            {fuente && (
                <div className="cua-grid">
                    <section className="pro-card">
                        <div className="ana-head">
                            <h3>{fuente.nombre}</h3>
                            <button type="button" className="pro-link pro-link--danger" onClick={() => quitarFuente(fuente.id)}><Trash2 size={14} /> Quitar esta transcripción</button>
                        </div>
                        <div className="cua-barra" data-activa={Boolean(seleccion)}>
                            {seleccion ? (
                                <>
                                    <span>Marcar «{seleccion.slice(0, 60)}{seleccion.length > 60 ? '…' : ''}» como:</span>
                                    {c.categorias.map((k) => <button key={k.id} type="button" className="cua-chip" style={{ background: k.color }} onClick={() => codificar(k.id)}>{k.nombre}</button>)}
                                    <form onSubmit={(e) => { e.preventDefault(); const cat = agregarCategoria(nuevaCat); if (cat) { codificar(cat.id); setNuevaCat(''); } }}>
                                        <input className="input-field" value={nuevaCat} onChange={(e) => setNuevaCat(e.target.value)} placeholder="Nueva categoría…" aria-label="Nueva categoría" />
                                    </form>
                                </>
                            ) : <span>Selecciona un fragmento del texto para asignarle una categoría.</span>}
                        </div>
                        <div className="cua-texto" ref={caja} onMouseUp={alSeleccionar} onKeyUp={alSeleccionar}>
                            {tramos(fuente.texto, c.citas.filter((x) => x.fuenteId === fuente.id), c.categorias).map((tr, i) => (
                                tr.cita ? <mark key={i} style={{ background: tr.categoria?.color || '#e5e7eb' }} title={tr.categoria?.nombre}>{tr.texto}</mark> : <React.Fragment key={i}>{tr.texto}</React.Fragment>
                            ))}
                        </div>
                    </section>

                    <aside className="ins-lado">
                        <section className="pro-card">
                            <h3>Categorías ({c.categorias.length})</h3>
                            <button type="button" className="pro-btn pro-btn--ghost" onClick={pedirSugerencias} disabled={estado === 'sugiriendo'}>
                                {estado === 'sugiriendo' ? <Loader2 size={15} className="ins-spin" /> : <Sparkles size={15} />} {estado === 'sugiriendo' ? 'Leyendo la entrevista…' : 'Sugerir categorías con IA'}
                            </button>
                            {sugeridas.length > 0 && (
                                <ul className="cua-sugeridas">
                                    {sugeridas.map((s) => (
                                        <li key={s.nombre}><span><b>{s.nombre}</b> {s.definicion}</span><button type="button" className="pro-link" onClick={() => { agregarCategoria(s.nombre, s.definicion); setSugeridas((p) => p.filter((x) => x.nombre !== s.nombre)); }}><Plus size={13} /> Usar</button></li>
                                    ))}
                                </ul>
                            )}
                            <ul className="cua-cats">
                                {resumen.map((k) => (
                                    <li key={k.id}>
                                        <div className="cua-cat-head">
                                            <i style={{ background: k.color }} aria-hidden="true" />
                                            <input className="input-field" value={k.nombre} onChange={(e) => cambiar((p) => ({ categorias: p.categorias.map((x) => (x.id === k.id ? { ...x, nombre: e.target.value } : x)) }))} aria-label="Nombre de la categoría" />
                                            <b>{k.n}</b>
                                            <button type="button" className="pro-link pro-link--danger" onClick={() => cambiar((p) => ({ categorias: p.categorias.filter((x) => x.id !== k.id), citas: p.citas.filter((x) => x.categoriaId !== k.id) }))} aria-label={`Quitar la categoría ${k.nombre}`}><Trash2 size={13} /></button>
                                        </div>
                                        <input className="input-field" value={k.definicion || ''} onChange={(e) => cambiar((p) => ({ categorias: p.categorias.map((x) => (x.id === k.id ? { ...x, definicion: e.target.value } : x)) }))} placeholder="Definición: qué fragmentos entran aquí" aria-label="Definición de la categoría" />
                                        {k.citas.length > 0 && (
                                            <details>
                                                <summary>{k.citas.length} {k.citas.length === 1 ? 'fragmento' : 'fragmentos'} en {k.enFuentes} {k.enFuentes === 1 ? 'fuente' : 'fuentes'}</summary>
                                                <ul className="cua-citas">
                                                    {k.citas.map((x) => (
                                                        <li key={x.id} data-ejemplo={k.ejemplo?.id === x.id}>
                                                            <span>«{x.texto.slice(0, 220)}{x.texto.length > 220 ? '…' : ''}» <small>({c.fuentes.find((f) => f.id === x.fuenteId)?.nombre})</small></span>
                                                            <span className="cua-cita-acc">
                                                                {k.ejemplo?.id !== x.id && <button type="button" className="pro-link" onClick={() => cambiar((p) => ({ categorias: p.categorias.map((y) => (y.id === k.id ? { ...y, ejemploId: x.id } : y)) }))}>Usar como cita representativa</button>}
                                                                <button type="button" className="pro-link pro-link--danger" onClick={() => cambiar((p) => ({ citas: p.citas.filter((y) => y.id !== x.id) }))}>Quitar</button>
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </details>
                                        )}
                                    </li>
                                ))}
                            </ul>
                            {c.categorias.length === 0 && <p className="adm-muted">Crea tus categorías a partir de tus objetivos, o pídele una propuesta a la IA y ajústala.</p>}
                        </section>
                        {c.citas.length > 0 && (
                            <section className="pro-card">
                                <h3>Para tus Resultados</h3>
                                <p className="adm-muted">Tabla con cada categoría, su definición, cuántos fragmentos tiene y su cita representativa.</p>
                                <div className="ins-acciones">
                                    <button type="button" className="pro-btn pro-btn--primary" onClick={llevar} disabled={hecho}>{hecho ? <CheckCircle2 size={15} /> : <Table2 size={15} />} {hecho ? 'Tabla agregada' : 'Llevar la tabla a mis tablas y figuras'}</button>
                                    {!embebido && <button type="button" className="pro-btn pro-btn--ghost" onClick={() => onNavigate('resultados')}>Ir a Resultados</button>}
                                </div>
                                <small className="adm-muted">En lo cualitativo importa el sentido de lo que dicen, no cuántas veces: usa el conteo solo como apoyo y explica cada categoría con sus citas.</small>
                            </section>
                        )}
                    </aside>
                </div>
            )}
        </>
    );
};

export default AnalisisCualitativo;
