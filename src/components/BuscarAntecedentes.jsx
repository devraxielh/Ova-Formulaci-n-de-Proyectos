import React, { useState } from 'react';
import { BookPlus, CheckCircle2, ExternalLink, Loader2, Search } from 'lucide-react';
import { useProject, useProjectField } from '../context/ProjectContext';
import { api } from '../services/api';
import { claveRef, desdeCrossref, referenciaAPA } from '../services/apa';
import './BuscarAntecedentes.css';

/*
 * Busca artículos por tema en bases abiertas (OpenAlex y, si no responde, CrossRef)
 * y los agrega a «Mis referencias» ya en APA 7. `onUsar(ref, resumen)` permite llevarlos a una ficha de antecedente.
 * La consulta sale del navegador del estudiante: solo viaja el texto buscado.
 */

const uid = () => Math.random().toString(36).slice(2, 9);
const ANIO = new Date().getFullYear();

// «Nombre Segundo Apellido» → «Apellido, N. S.» (aproximado; con DOI se corrige con los datos de CrossRef).
const invertir = (nombre) => {
    const partes = String(nombre || '').trim().split(/\s+/).filter(Boolean);
    if (partes.length < 2) return partes[0] || '';
    const apellido = partes.at(-1);
    return `${apellido}, ${partes.slice(0, -1).map((p) => `${p[0].toUpperCase()}.`).join(' ')}`;
};

const resumenDe = (indice) => {
    if (!indice) return '';
    const palabras = [];
    Object.entries(indice).forEach(([palabra, posiciones]) => posiciones.forEach((p) => { palabras[p] = palabra; }));
    return palabras.join(' ').replace(/\s+/g, ' ').trim();
};

const deOpenAlex = (w) => ({
    clave: w.id,
    resumen: resumenDe(w.abstract_inverted_index),
    citas: w.cited_by_count || 0,
    idioma: w.language || '',
    enlace: w.open_access?.oa_url || w.doi || '',
    abierto: Boolean(w.open_access?.is_oa),
    ref: {
        tipo: 'articulo',
        autores: (w.authorships || []).slice(0, 20).map((a) => invertir(a.author?.display_name)).filter(Boolean).join('; '),
        anio: String(w.publication_year || ''),
        titulo: String(w.display_name || '').replace(/<[^>]+>/g, ''),
        revista: w.primary_location?.source?.display_name || '',
        volumen: w.biblio?.volume || '', numero: w.biblio?.issue || '',
        paginas: w.biblio?.first_page ? `${w.biblio.first_page}${w.biblio.last_page && w.biblio.last_page !== w.biblio.first_page ? `-${w.biblio.last_page}` : ''}` : '',
        doi: String(w.doi || '').replace(/^https?:\/\/doi\.org\//i, ''),
    },
});

const deCrossref = (m) => ({
    clave: m.DOI,
    resumen: String(m.abstract || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    citas: m['is-referenced-by-count'] || 0,
    idioma: m.language || '',
    enlace: m.DOI ? `https://doi.org/${m.DOI}` : '',
    abierto: false,
    completo: true,
    ref: desdeCrossref(m),
});

// Bases disponibles. SciELO no permite consultas automáticas: se abre su buscador en otra pestaña.
const BASES = [
    { id: 'openalex', label: 'OpenAlex', nota: 'General: 250 millones de trabajos de todas las áreas e idiomas.' },
    { id: 'semantic', label: 'Semantic Scholar', nota: 'General, fuerte en ciencias y salud; ordena bien por relevancia. Sobre todo en inglés.' },
    { id: 'arxiv', label: 'arXiv', nota: 'Prepublicaciones de ingeniería, computación, matemáticas y física, en inglés. Aún no tienen revisión por pares: úsalas con cautela.' },
    { id: 'scielo', label: 'SciELO', externo: (q) => `https://search.scielo.org/?q=${encodeURIComponent(q)}&lang=es`, nota: 'Revistas latinoamericanas arbitradas. Su buscador se abre en otra pestaña; copia el DOI del artículo y pégalo en «¿Tiene DOI?» para traerlo.' },
];

// Resultados de Semantic Scholar o arXiv (ya vienen con forma común; solo falta ordenar los nombres).
const deServidor = (x) => ({ ...x, ref: { ...x.ref, autores: (x.nombres || []).map(invertir).filter(Boolean).join('; ') } });

const buscar = async ({ texto, desde, idioma, fuente = 'openalex' }) => {
    const q = encodeURIComponent(texto);
    if (fuente !== 'openalex') {
        const r = await api.buscarArticulos({ texto, desde, idioma, fuente });
        return { fuente: BASES.find((b) => b.id === fuente).label, total: r.total, items: (r.items || []).map(deServidor) };
    }
    // Primero por el servidor, que usa la clave de la plataforma (cupo propio). Si no está disponible, directo desde el navegador.
    try {
        const r = await api.buscarArticulos({ texto, desde, idioma });
        return { fuente: 'OpenAlex', total: r.total, items: r.results.filter((w) => w.display_name).map(deOpenAlex) };
    } catch { /* se intenta directo */ }
    try {
        const filtros = [`from_publication_date:${desde}-01-01`, 'type:article', idioma ? `language:${idioma}` : ''].filter(Boolean).join(',');
        const res = await fetch(`https://api.openalex.org/works?search=${q}&per-page=12&filter=${filtros}&select=id,display_name,publication_year,authorships,primary_location,biblio,doi,cited_by_count,open_access,language,abstract_inverted_index`);
        if (!res.ok) throw new Error('openalex');
        const json = await res.json();
        return { fuente: 'OpenAlex', total: json.meta?.count || 0, items: (json.results || []).filter((w) => w.display_name).map(deOpenAlex) };
    } catch {
        // Respaldo: CrossRef (sin filtro de idioma).
        const res = await fetch(`https://api.crossref.org/works?query.bibliographic=${q}&rows=12&filter=from-pub-date:${desde},type:journal-article&select=DOI,title,author,issued,container-title,volume,issue,page,publisher,type,abstract,is-referenced-by-count,language`);
        if (!res.ok) throw new Error('No se pudo consultar las bases de artículos. Inténtalo de nuevo en unos minutos.');
        const json = await res.json();
        return { fuente: 'CrossRef', total: json.message?.['total-results'] || 0, items: (json.message?.items || []).filter((m) => m.title?.[0]).map(deCrossref) };
    }
};

// `usarComo`: para qué ficha se usa el artículo («antecedente», «teoría», «concepto»); `titulo`: encabezado del panel.
const BuscarAntecedentes = ({ onUsar, sugerencia = '', usarComo = 'antecedente', titulo = 'Buscar artículos sobre tu tema' }) => {
    const { data } = useProject();
    const [refs, setRefs] = useProjectField('referencias', []);
    const [texto, setTexto] = useState('');
    const [desde, setDesde] = useState(String(ANIO - 5));
    const [idioma, setIdioma] = useState('');
    const [base, setBase] = useState('openalex');
    const baseActual = BASES.find((b) => b.id === base);
    const [estado, setEstado] = useState('');
    const [error, setError] = useState('');
    const [res, setRes] = useState(null);
    const [abierto, setAbierto] = useState('');
    const [usados, setUsados] = useState({});
    const lista = Array.isArray(refs) ? refs : [];
    const yaEsta = (ref) => lista.some((r) => (ref.doi && r.doi && String(r.doi).toLowerCase() === ref.doi.toLowerCase()) || (claveRef(r) === claveRef(ref) && String(r.titulo || '').toLowerCase().slice(0, 40) === ref.titulo.toLowerCase().slice(0, 40)));
    const tema = String(sugerencia || data.tituloForm?.objeto || data.titulo || '').trim().split(/\s+/).slice(0, 8).join(' ');

    const enviar = async (event) => {
        event?.preventDefault();
        const q = (texto || tema).trim();
        if (!q) return;
        if (!texto) setTexto(q);
        if (baseActual.externo) { window.open(baseActual.externo(q), '_blank', 'noopener,noreferrer'); return; }
        setEstado('buscando');
        setError('');
        try {
            setRes(await buscar({ texto: q, desde, idioma, fuente: base }));
        } catch (err) {
            setError(err.message);
            setRes(null);
        } finally {
            setEstado('');
        }
    };

    // Con DOI se piden a CrossRef los datos completos (apellidos y nombres separados, volumen, páginas).
    const completar = async (item) => {
        if (item.completo || !item.ref.doi) return item.ref;
        try {
            const r = await fetch(`https://api.crossref.org/works/${encodeURIComponent(item.ref.doi)}`);
            if (!r.ok) return item.ref;
            const mejor = desdeCrossref((await r.json()).message);
            return { ...item.ref, ...Object.fromEntries(Object.entries(mejor).filter(([, v]) => v)) };
        } catch {
            return item.ref;
        }
    };
    const agregar = async (item, usar) => {
        setUsados((p) => ({ ...p, [item.clave]: 'cargando' }));
        const ref = await completar(item);
        if (!yaEsta(ref)) setRefs((prev) => [...(Array.isArray(prev) ? prev : []), { ...ref, id: uid() }]);
        // onUsar crea la ficha y, si el artículo trae resumen, la llena con él: dice cómo quedó ('llena' o 'vacia').
        if (usar && onUsar) setUsados((p) => ({ ...p, [item.clave]: 'llenando' }));
        const quedo = usar && onUsar ? await onUsar(ref, item.resumen) : '';
        setUsados((p) => ({ ...p, [item.clave]: usar ? (quedo === 'llena' ? 'llena' : 'usado') : 'agregado' }));
    };

    return (
        <section className="bus-panel">
            <h3><Search size={17} aria-hidden="true" /> {titulo}</h3>
            <div className="bus-bases" role="tablist" aria-label="Base de artículos">
                {BASES.map((b) => <button key={b.id} type="button" role="tab" aria-selected={base === b.id} onClick={() => { setBase(b.id); setRes(null); setError(''); }}>{b.label}</button>)}
            </div>
            <p className="bus-base-nota">{baseActual.nota}</p>
            <form className="bus-form" onSubmit={enviar}>
                <input className="input-field" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={tema ? `Ej: ${tema}` : 'Ej: inasistencia a citas médicas'} aria-label="Tema a buscar" />
                <select className="input-field" value={desde} onChange={(e) => setDesde(e.target.value)} aria-label="Desde el año">
                    <option value={String(ANIO - 5)}>Últimos 5 años</option>
                    <option value={String(ANIO - 10)}>Últimos 10 años</option>
                    <option value="1950">Cualquier año</option>
                </select>
                <select className="input-field" value={idioma} onChange={(e) => setIdioma(e.target.value)} aria-label="Idioma">
                    <option value="">Cualquier idioma</option>
                    <option value="es">Español</option>
                    <option value="en">Inglés</option>
                    <option value="pt">Portugués</option>
                </select>
                <button type="submit" className="ide-btn ide-btn--primary" disabled={estado === 'buscando'}>
                    {estado === 'buscando' ? <Loader2 size={16} className="bus-spin" /> : <Search size={16} />} {baseActual.externo ? 'Abrir SciELO' : 'Buscar'}
                </button>
            </form>
            <p className="ide-field-hint">Usa pocas palabras clave{base === 'arxiv' || base === 'semantic' ? ' y escríbelas en inglés' : '; prueba también en inglés'}. Lee el artículo antes de citarlo: aquí solo ves su resumen.</p>
            {error && <p className="ide-feedback ide-feedback--bad" role="alert">{error}</p>}
            {res && (
                <>
                    <p className="bus-total">{res.total.toLocaleString('es-CO')} resultados en {res.fuente}{res.items.length ? `; se muestran los ${res.items.length} más relevantes.` : '. Prueba con otras palabras o amplía los años.'}</p>
                    <ul className="bus-lista">
                        {res.items.map((item) => {
                            const esta = yaEsta(item.ref);
                            const estadoItem = usados[item.clave];
                            return (
                                <li key={item.clave}>
                                    <p className="bus-apa">{referenciaAPA(item.ref).split(/(\*[^*]+\*)/g).map((p, i) => (p.startsWith('*') && p.endsWith('*') ? <em key={i}>{p.slice(1, -1)}</em> : p))}</p>
                                    <p className="bus-meta">
                                        {item.citas > 0 && <span>{item.citas} citas</span>}
                                        {item.idioma && <span>{({ es: 'Español', en: 'Inglés', pt: 'Portugués' })[item.idioma] || item.idioma}</span>}
                                        {item.abierto && <span className="bus-oa">Acceso abierto</span>}
                                        {item.preprint && <span className="bus-pre">Prepublicación sin revisión por pares</span>}
                                        {item.enlace && <a href={item.enlace} target="_blank" rel="noreferrer noopener"><ExternalLink size={13} /> Abrir el artículo</a>}
                                        {item.resumen && <button type="button" className="ide-link" onClick={() => setAbierto(abierto === item.clave ? '' : item.clave)}>{abierto === item.clave ? 'Ocultar resumen' : 'Ver resumen'}</button>}
                                    </p>
                                    {abierto === item.clave && <p className="bus-resumen">{item.resumen}</p>}
                                    <div className="bus-acciones">
                                        {esta || estadoItem === 'agregado' || estadoItem === 'usado' || estadoItem === 'llena' || estadoItem === 'llenando'
                                            ? <span className="bus-ok"><CheckCircle2 size={15} /> En tus referencias</span>
                                            : <button type="button" className="ide-btn ide-btn--ghost" disabled={estadoItem === 'cargando'} onClick={() => agregar(item, false)}><BookPlus size={15} /> {estadoItem === 'cargando' ? 'Agregando…' : 'Agregar a mis referencias'}</button>}
                                        {onUsar && !['usado', 'llena', 'llenando'].includes(estadoItem) && <button type="button" className="ide-btn ide-btn--ghost" disabled={estadoItem === 'cargando'} onClick={() => agregar(item, true)}>Usar como {usarComo}{item.resumen ? ' (llenar con el resumen)' : ''}</button>}
                                        {estadoItem === 'llenando' && <span className="bus-ok"><Loader2 size={15} className="bus-spin" /> Llenando la ficha con el resumen…</span>}
                                        {estadoItem === 'llena' && <span className="bus-ok"><CheckCircle2 size={15} /> Ficha llena con el resumen: revísala abajo y verifícala leyendo el artículo</span>}
                                        {estadoItem === 'usado' && <span className="bus-ok"><CheckCircle2 size={15} /> Ficha de {usarComo} creada: complétala</span>}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </>
            )}
        </section>
    );
};

export default BuscarAntecedentes;
