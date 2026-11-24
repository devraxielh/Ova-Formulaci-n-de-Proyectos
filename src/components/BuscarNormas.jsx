import React, { useState } from 'react';
import { CheckCircle2, ExternalLink, Loader2, Scale, Search } from 'lucide-react';
import { api } from '../services/api';
import './BuscarAntecedentes.css';

/*
 * Buscador de normas y jurisprudencia de Colombia para el Marco legal (Rulex Data, por el servidor).
 * `onUsar(norma)` crea la ficha y la llena con el extracto; responde 'llena' o 'vacia'.
 * La cuota de la base es diaria y compartida por toda la plataforma: por eso se avisa cuántas quedan.
 */
const CLASE = { law: 'Ley', decree: 'Decreto', resolution: 'Resolución', constitution: 'Constitución', high_court_precedent: 'Sentencia', constitutional_tutela: 'Sentencia de tutela', constitutional_review: 'Sentencia de constitucionalidad' };

const BuscarNormas = ({ onUsar, sugerencia = '' }) => {
    const [texto, setTexto] = useState('');
    const [fuente, setFuente] = useState('normas');
    const [estado, setEstado] = useState('');
    const [error, setError] = useState('');
    const [res, setRes] = useState(null);
    const [abierto, setAbierto] = useState('');
    const [usados, setUsados] = useState({});
    const tema = String(sugerencia || '').trim().split(/\s+/).slice(0, 8).join(' ');

    const enviar = async (event) => {
        event?.preventDefault();
        const q = (texto || tema).trim();
        if (!q) return;
        if (!texto) setTexto(q);
        setEstado('buscando');
        setError('');
        try {
            setRes(await api.buscarNormas({ texto: q, fuente }));
        } catch (err) {
            setError(err.message || 'No se pudo buscar.');
            setRes(null);
        } finally {
            setEstado('');
        }
    };
    const usar = async (item) => {
        setUsados((p) => ({ ...p, [item.clave]: 'llenando' }));
        const quedo = await onUsar(item);
        setUsados((p) => ({ ...p, [item.clave]: quedo === 'llena' ? 'llena' : 'usada' }));
    };

    return (
        <section className="bus-panel">
            <h3><Scale size={17} aria-hidden="true" /> Buscar normas y sentencias de Colombia</h3>
            <div className="bus-bases" role="tablist" aria-label="Qué buscar">
                <button type="button" role="tab" aria-selected={fuente === 'normas'} onClick={() => { setFuente('normas'); setRes(null); }}>Solo normas</button>
                <button type="button" role="tab" aria-selected={fuente === 'todas'} onClick={() => { setFuente('todas'); setRes(null); }}>Normas y sentencias</button>
            </div>
            <p className="bus-base-nota">{fuente === 'normas' ? 'Leyes, decretos y resoluciones del Gestor Normativo.' : 'Además: Corte Constitucional, Corte Suprema, Consejo de Estado, DIAN y SIC.'}</p>
            <form className="bus-form bus-form--corta" onSubmit={enviar}>
                <input className="input-field" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={tema ? `Ej: ${tema}` : 'Ej: protección de datos personales en salud'} aria-label="Tema legal a buscar" />
                <button type="submit" className="ide-btn ide-btn--primary" disabled={estado === 'buscando'}>
                    {estado === 'buscando' ? <Loader2 size={16} className="bus-spin" /> : <Search size={16} />} Buscar
                </button>
            </form>
            <p className="ide-field-hint">Busca por el tema, no por el número: «derecho a la salud», «protección de datos», «educación superior». Antes de citar, confirma la norma y su vigencia en la fuente oficial.</p>
            {error && <p className="ide-feedback ide-feedback--bad" role="alert">{error}</p>}
            {res && (
                <>
                    <p className="bus-total">
                        {res.items.length ? `${res.items.length} resultados. No todos aplican a tu tema: lee el extracto y elige.` : 'Sin resultados. Prueba con otras palabras o incluye las sentencias.'}
                        {Number.isFinite(res.restantes) && res.restantes < 40 ? ` Quedan ${res.restantes} búsquedas hoy para toda la plataforma.` : ''}
                    </p>
                    <ul className="bus-lista">
                        {res.items.map((item) => {
                            const e = usados[item.clave];
                            return (
                                <li key={item.clave}>
                                    <p className="bus-apa"><strong>{item.cita}</strong>{item.titulo && item.titulo !== item.cita ? ` · ${item.titulo}` : ''}</p>
                                    <p className="bus-meta">
                                        {CLASE[item.clase] && <span>{CLASE[item.clase]}</span>}
                                        {item.anio && <span>{item.anio}</span>}
                                        {item.fuente && <span>{item.fuente === 'gestor-normativo' ? 'Gestor Normativo' : item.fuente}</span>}
                                        {item.enlace && <a href={item.enlace} target="_blank" rel="noreferrer noopener"><ExternalLink size={13} /> Abrir el texto</a>}
                                        {item.extracto && <button type="button" className="ide-link" onClick={() => setAbierto(abierto === item.clave ? '' : item.clave)}>{abierto === item.clave ? 'Ocultar extracto' : 'Ver extracto'}</button>}
                                    </p>
                                    {abierto === item.clave && <p className="bus-resumen">{item.extracto}</p>}
                                    <div className="bus-acciones">
                                        {!e && <button type="button" className="ide-btn ide-btn--ghost" onClick={() => usar(item)}>Usar como norma (llenar con el extracto)</button>}
                                        {e === 'llenando' && <span className="bus-ok"><Loader2 size={15} className="bus-spin" /> Llenando la ficha con el extracto…</span>}
                                        {e === 'llena' && <span className="bus-ok"><CheckCircle2 size={15} /> Ficha llena con el extracto: revísala abajo y verifica la norma en la fuente oficial</span>}
                                        {e === 'usada' && <span className="bus-ok"><CheckCircle2 size={15} /> Ficha de norma creada: completa qué establece</span>}
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

export default BuscarNormas;
