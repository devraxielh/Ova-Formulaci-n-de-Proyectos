import React, { useMemo, useRef, useState } from 'react';
import {
    AlertTriangle, BookMarked, CheckCircle2, Clipboard, Download, Link2, Pencil, Plus, Quote, Search, Trash2, Wand2, X,
} from 'lucide-react';
import { useProject, useProjectField } from '../context/ProjectContext';
import {
    CAMPOS, TIPOS_REF, aBibtex, citaNarrativa, citaParentetica, claveRef, desdeCrossref, faltantes, ordenarReferencias, referenciaAPA, revisarCitas,
} from '../services/apa';
import { REFERENCIAS_CONOCIDAS } from '../data/referenciasConocidas';
import './Proyecto.css';
import './Referencias.css';

const uid = () => Math.random().toString(36).slice(2, 10);
const CONOCIDAS = new Map(REFERENCIAS_CONOCIDAS.map((ref) => [claveRef(ref), ref]));
const VACIA = { tipo: 'articulo' };

// Texto con *cursivas* (formato de las referencias APA).
export const Cursiva = ({ text }) => String(text).split(/(\*[^*]+\*)/g).map((part, i) => (
    part.startsWith('*') && part.endsWith('*') && part.length > 2 ? <em key={i}>{part.slice(1, -1)}</em> : <React.Fragment key={i}>{part}</React.Fragment>
));

const useCopiar = () => {
    const [copiado, setCopiado] = useState('');
    const copiar = async (id, text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiado(id);
            window.setTimeout(() => setCopiado(''), 1800);
        } catch {
            setCopiado('');
        }
    };
    return [copiado, copiar];
};

const Referencias = ({ onNavigate }) => {
    const { data } = useProject();
    const [refs, setRefs] = useProjectField('referencias', []);
    const lista = Array.isArray(refs) ? refs : [];
    const [form, setForm] = useState(VACIA);
    const [editando, setEditando] = useState(null);
    const [doi, setDoi] = useState('');
    const [buscando, setBuscando] = useState(false);
    const [aviso, setAviso] = useState('');
    const [error, setError] = useState('');
    const [filtro, setFiltro] = useState('');
    const [copiado, copiar] = useCopiar();
    const formRef = useRef(null);

    const tipo = TIPOS_REF.find((x) => x.id === form.tipo) || TIPOS_REF[0];
    const ordenadas = useMemo(() => ordenarReferencias(lista), [lista]);
    const revision = useMemo(() => revisarCitas(data, lista), [data, lista]);
    const visibles = ordenadas.filter((ref) => !filtro.trim() || referenciaAPA(ref).toLowerCase().includes(filtro.trim().toLowerCase()));
    const incompletas = lista.filter((ref) => faltantes(ref).length > 0).length;

    // Autores del Marco Referencial que todavía no están en la lista.
    const delMarco = useMemo(() => {
        const marco = data.marcoForm || {};
        const claves = new Set(lista.map(claveRef));
        const candidatos = [
            ...(marco.antecedentes || []).map((a) => ({ tipo: 'articulo', autores: a.autor, anio: a.anio, titulo: a.titulo })),
            ...(marco.teorias || []).map((t) => ({ tipo: 'libro', autores: t.autor, anio: t.anio, titulo: t.nombre })),
            ...(marco.conceptos || []).map((c) => ({ tipo: 'articulo', autores: c.autor, anio: c.anio, titulo: '' })),
        ].filter((r) => String(r.autores || '').trim())
            .map((r) => ({ ...r, autores: String(r.autores).replace(/\s+y\s+/g, '; ').replace(/\s+et al\.?/i, '') }));
        const vistos = new Set();
        return candidatos.filter((r) => {
            const k = claveRef(r);
            if (claves.has(k) || vistos.has(k)) return false;
            vistos.add(k);
            return true;
        });
    }, [data.marcoForm, lista]);

    const limpiar = () => { setForm(VACIA); setEditando(null); setDoi(''); setError(''); };
    const set = (campo) => (event) => { setAviso(''); setForm((prev) => ({ ...prev, [campo]: event.target.value })); };

    const guardar = (event) => {
        event?.preventDefault();
        if (!String(form.titulo || '').trim() && !String(form.autores || '').trim()) {
            setError('Escribe al menos los autores o el título.');
            return;
        }
        const limpio = Object.fromEntries(Object.entries(form).filter(([k, v]) => k === 'tipo' || k === 'id' || (tipo.campos.includes(k) && String(v || '').trim())));
        if (editando) setRefs(lista.map((r) => (r.id === editando ? { ...limpio, id: editando } : r)));
        else setRefs([...lista, { ...limpio, id: uid() }]);
        setAviso(editando ? 'Referencia actualizada.' : 'Referencia agregada. Ya puedes citarla en tus párrafos con el botón «Citar».');
        limpiar();
    };

    const editar = (ref) => {
        setForm(ref);
        setEditando(ref.id);
        setAviso('');
        setError('');
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const buscarDoi = async () => {
        const limpio = doi.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').replace(/^doi:\s*/i, '');
        if (!limpio) return;
        setBuscando(true);
        setError('');
        try {
            const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(limpio)}`);
            if (!response.ok) throw new Error('No se encontró ese DOI en CrossRef. Revisa que esté completo.');
            const { message } = await response.json();
            setForm((prev) => ({ ...desdeCrossref(message), id: prev.id }));
            setAviso('Datos traídos de CrossRef. Revísalos y guarda.');
        } catch (err) {
            setError(err.message || 'No se pudo consultar el DOI.');
        } finally {
            setBuscando(false);
        }
    };

    const importarMarco = () => {
        setRefs([...lista, ...delMarco.map((r) => ({ ...(CONOCIDAS.get(claveRef(r)) || r), id: uid() }))]);
        setAviso(`Se agregaron ${delMarco.length} referencias desde tu Marco Referencial. Completa las que tienen solo autor, año y título.`);
    };

    const agregarConocida = (cita) => {
        const ref = CONOCIDAS.get(cita.clave);
        if (!ref) return;
        setRefs([...lista, { ...ref, id: uid() }]);
        setAviso(`Se agregó la referencia completa de ${cita.texto}. Verifica que sea la edición que consultaste.`);
    };

    const crearDesdeCita = (cita) => {
        setForm({ tipo: 'articulo', autores: cita.autor.replace(/\s+et al\.?/i, '').replace(/\s+y\s+/g, '; '), anio: /\d{4}/.test(cita.anio) ? cita.anio : '' });
        setEditando(null);
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const todas = ordenadas.map((ref) => referenciaAPA(ref).replace(/\*/g, '')).join('\n\n');
    const descargarBib = () => {
        const blob = new Blob([aBibtex(ordenadas)], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'referencias.bib';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    const vista = (String(form.autores || '').trim() || String(form.titulo || '').trim()) ? referenciaAPA(form) : '';

    return (
        <div className="pro-page ref-page">
            <section className="ref-hero">
                <div>
                    <h2><BookMarked size={22} aria-hidden="true" /> Tus fuentes, bien citadas</h2>
                    <p>Registra tus fuentes una sola vez: la herramienta las escribe en APA 7, te da la cita para tus párrafos, revisa que cada cita tenga su referencia y arma la lista final del documento.</p>
                </div>
                <ul className="ref-stats">
                    <li><b>{lista.length}</b> referencias</li>
                    <li data-alerta={revision.sinReferencia.length > 0 || undefined}><b>{revision.sinReferencia.length}</b> citas sin referencia</li>
                    <li data-alerta={revision.noCitadas.length > 0 || undefined}><b>{revision.noCitadas.length}</b> sin citar</li>
                    <li data-alerta={incompletas > 0 || undefined}><b>{incompletas}</b> incompletas</li>
                </ul>
            </section>

            <div className="ref-grid">
                {/* ---------- Formulario ---------- */}
                <section className="pro-card ref-form" ref={formRef} aria-labelledby="ref-form-title">
                    <h2 id="ref-form-title">{editando ? 'Editar referencia' : 'Agregar referencia'}</h2>

                    <div className="ref-doi">
                        <label htmlFor="ref-doi">¿Tiene DOI? Tráela automáticamente</label>
                        <div className="ref-doi-row">
                            <input id="ref-doi" className="input-field" value={doi} onChange={(e) => setDoi(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); buscarDoi(); } }} placeholder="10.1016/j.jbi.2020.103456 o https://doi.org/…" />
                            <button type="button" className="pro-btn pro-btn--ghost" onClick={buscarDoi} disabled={buscando || !doi.trim()}>
                                <Link2 size={15} /> {buscando ? 'Buscando…' : 'Buscar'}
                            </button>
                        </div>
                    </div>

                    <form onSubmit={guardar} noValidate>
                        <label className="ref-campo" htmlFor="ref-tipo">
                            <span>Tipo de fuente</span>
                            <select id="ref-tipo" className="input-field" value={form.tipo} onChange={set('tipo')}>
                                {TIPOS_REF.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
                            </select>
                        </label>
                        <div className="ref-campos">
                            {tipo.campos.map((campo) => {
                                const def = CAMPOS[campo];
                                const ancho = ['autores', 'titulo', 'descripcion', 'url', 'doi', 'libro', 'editores', 'evento'].includes(campo);
                                return (
                                    <label key={campo} className={`ref-campo ${ancho ? 'ref-ancho' : ''}`} htmlFor={`ref-${campo}`}>
                                        <span>{campo === 'titulo' && form.tipo === 'ley' ? 'Nombre de la norma' : def.label}{tipo.requeridos.includes(campo) ? ' *' : ''}</span>
                                        <input id={`ref-${campo}`} className="input-field" value={form[campo] || ''} onChange={set(campo)} placeholder={campo === 'titulo' && form.tipo === 'ley' ? 'Ley 1751 de 2015' : def.placeholder} />
                                        {def.ayuda && <small>{def.ayuda}</small>}
                                    </label>
                                );
                            })}
                        </div>

                        {vista && (
                            <div className="ref-vista" aria-live="polite">
                                <span>Así queda en APA 7</span>
                                <p className="ref-apa"><Cursiva text={vista} /></p>
                                <p className="ref-citas"><b>En el texto:</b> {citaParentetica(form)} · {citaNarrativa(form)}</p>
                            </div>
                        )}
                        {error && <p className="pro-alert" role="alert">{error}</p>}
                        <div className="ref-acciones">
                            <button type="submit" className="pro-btn pro-btn--primary">{editando ? <><CheckCircle2 size={16} /> Guardar cambios</> : <><Plus size={16} /> Agregar a mis referencias</>}</button>
                            {(editando || vista) && <button type="button" className="pro-btn pro-btn--ghost" onClick={limpiar}><X size={15} /> {editando ? 'Cancelar' : 'Limpiar'}</button>}
                        </div>
                    </form>
                    {aviso && <p className="pro-notice" role="status">{aviso}</p>}

                    <details className="ref-ayuda">
                        <summary>Cómo citar en tus párrafos</summary>
                        <ol>
                            <li>En cualquier clase, haz clic dentro del párrafo donde va la cita.</li>
                            <li>Toca el botón <b>«Citar»</b> de la barra superior de la clase.</li>
                            <li>Elige la referencia y la forma: parentética <em>(Pérez, 2022)</em> o narrativa <em>Pérez (2022)</em>.</li>
                            <li>La cita se escribe donde estaba el cursor. La lista de referencias se arma sola en Mi proyecto.</li>
                        </ol>
                    </details>
                </section>

                {/* ---------- Lista ---------- */}
                <section className="pro-card ref-lista" aria-labelledby="ref-lista-title">
                    <div className="ref-lista-head">
                        <h2 id="ref-lista-title">Mis referencias ({lista.length})</h2>
                        <div className="ref-lista-tools">
                            {lista.length > 4 && (
                                <label className="ref-buscar"><Search size={15} aria-hidden="true" /><input className="input-field" value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="Buscar" aria-label="Buscar en mis referencias" /></label>
                            )}
                            <button type="button" className="pro-btn pro-btn--ghost" onClick={() => copiar('todas', todas)} disabled={lista.length === 0}><Clipboard size={15} /> {copiado === 'todas' ? 'Copiadas' : 'Copiar todas'}</button>
                            <button type="button" className="pro-btn pro-btn--ghost" onClick={descargarBib} disabled={lista.length === 0}><Download size={15} /> BibTeX</button>
                        </div>
                    </div>

                    {delMarco.length > 0 && (
                        <button type="button" className="ref-importar" onClick={importarMarco}>
                            <Wand2 size={16} aria-hidden="true" /> Traer {delMarco.length} {delMarco.length === 1 ? 'autor' : 'autores'} de mi Marco Referencial
                        </button>
                    )}

                    {lista.length === 0 ? (
                        <div className="pro-empty">
                            <p><strong>Todavía no tienes referencias.</strong></p>
                            <p>Agrega la primera con su DOI o llenando el formulario. Aparecerán aquí en orden alfabético, listas para citar.</p>
                        </div>
                    ) : (
                        <ol className="ref-items">
                            {visibles.map((ref) => {
                                const faltan = faltantes(ref);
                                const veces = revision.vecesDe(ref);
                                return (
                                    <li key={ref.id} data-editando={ref.id === editando || undefined}>
                                        <p className="ref-apa"><Cursiva text={referenciaAPA(ref)} /></p>
                                        <div className="ref-meta">
                                            <span className="ref-tag">{TIPOS_REF.find((x) => x.id === ref.tipo)?.label}</span>
                                            {faltan.length ? <span className="ref-tag ref-tag--mal"><AlertTriangle size={12} aria-hidden="true" /> Faltan: {faltan.join(', ')}</span> : <span className="ref-tag ref-tag--bien"><CheckCircle2 size={12} aria-hidden="true" /> Completa</span>}
                                            <span className={`ref-tag ${veces ? 'ref-tag--bien' : 'ref-tag--gris'}`}>{veces ? `Citada ${veces} ${veces === 1 ? 'vez' : 'veces'}` : 'Sin citar'}</span>
                                        </div>
                                        <div className="ref-botones">
                                            <button type="button" className="pro-link" onClick={() => copiar(`p-${ref.id}`, citaParentetica(ref))}><Quote size={13} /> {copiado === `p-${ref.id}` ? 'Copiada' : citaParentetica(ref)}</button>
                                            <button type="button" className="pro-link" onClick={() => copiar(`n-${ref.id}`, citaNarrativa(ref))}><Quote size={13} /> {copiado === `n-${ref.id}` ? 'Copiada' : citaNarrativa(ref)}</button>
                                            <button type="button" className="pro-link" onClick={() => copiar(`r-${ref.id}`, referenciaAPA(ref).replace(/\*/g, ''))}><Clipboard size={13} /> {copiado === `r-${ref.id}` ? 'Copiada' : 'Referencia'}</button>
                                            <button type="button" className="pro-link" onClick={() => editar(ref)}><Pencil size={13} /> Editar</button>
                                            <button type="button" className="pro-link pro-link--danger" onClick={() => { setRefs(lista.filter((r) => r.id !== ref.id)); if (editando === ref.id) limpiar(); }}><Trash2 size={13} /> Quitar</button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
                    )}
                </section>
            </div>

            {/* ---------- Revisión de citas ---------- */}
            <section className="pro-card ref-revision" aria-labelledby="ref-rev-title">
                <h2 id="ref-rev-title">Revisión de citas del proyecto</h2>
                <p className="ref-nota">Busca en todas las secciones de tu proyecto las citas con la forma (Autor, año) o Autor (año) y las cruza con tu lista. En APA, toda cita debe tener su referencia y toda referencia debe estar citada.</p>
                <div className="ref-rev-grid">
                    <div data-estado={revision.sinReferencia.length ? 'mal' : 'bien'}>
                        <h3>{revision.sinReferencia.length ? <AlertTriangle size={16} aria-hidden="true" /> : <CheckCircle2 size={16} aria-hidden="true" />} Citas sin referencia ({revision.sinReferencia.length})</h3>
                        {revision.sinReferencia.length === 0 ? <p>Todas las citas de tu proyecto tienen su referencia.</p> : (
                            <ul>
                                {revision.sinReferencia.map((cita) => (
                                    <li key={cita.clave}>
                                        <span><b>{cita.texto}</b> <small>en {cita.secciones.join(', ')}</small></span>
                                        {CONOCIDAS.has(cita.clave)
                                            ? <button type="button" className="pro-link" onClick={() => agregarConocida(cita)}><Wand2 size={13} /> Agregar la referencia completa</button>
                                            : <button type="button" className="pro-link" onClick={() => crearDesdeCita(cita)}><Plus size={13} /> Crear referencia</button>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div data-estado={revision.noCitadas.length ? 'aviso' : 'bien'}>
                        <h3>{revision.noCitadas.length ? <AlertTriangle size={16} aria-hidden="true" /> : <CheckCircle2 size={16} aria-hidden="true" />} Referencias sin citar ({revision.noCitadas.length})</h3>
                        {revision.noCitadas.length === 0 ? <p>{lista.length ? 'Todas tus referencias están citadas en el texto.' : 'Aún no hay referencias.'}</p> : (
                            <ul>
                                {revision.noCitadas.map((ref) => (
                                    <li key={ref.id}><span><b>{citaParentetica(ref)}</b></span><small>Cítala en un párrafo o quítala de la lista.</small></li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div data-estado="bien">
                        <h3><CheckCircle2 size={16} aria-hidden="true" /> Citas con referencia ({revision.conReferencia.length})</h3>
                        {revision.conReferencia.length === 0 ? <p>Cuando cites en tus párrafos, aparecerán aquí.</p> : (
                            <ul>{revision.conReferencia.map((cita) => <li key={cita.clave}><span><b>{cita.texto}</b> <small>{cita.veces} {cita.veces === 1 ? 'vez' : 'veces'} · {cita.secciones.join(', ')}</small></span></li>)}</ul>
                        )}
                    </div>
                </div>
                {onNavigate && lista.length > 0 && (
                    <button type="button" className="pro-btn pro-btn--ghost" onClick={() => onNavigate('proyecto')}>Ver la lista de referencias en Mi proyecto</button>
                )}
            </section>
        </div>
    );
};

export default Referencias;
