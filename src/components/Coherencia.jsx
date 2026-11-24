import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, ChevronDown, Circle, Clipboard, Link2, X } from 'lucide-react';
import { evaluarCoherencia } from '../services/coherencia';
import Arreglar, { sePuedeArreglar } from './CoherenciaArreglar';
import './Proyecto.css';

const NOMBRE_TAB = {
    titulo: 'Título', pregunta: 'Pregunta', planteamiento: 'Planteamiento', objetivos: 'Objetivos',
    justificacion: 'Justificación', alcances: 'Alcances',
};

/*
 * Panel de coherencia entre secciones.
 * - onNavigate: si existe, cada relación débil ofrece ir a la sección (vista del estudiante).
 * - compacto: oculta el encabezado explicativo (vista del administrador).
 * - enVentana: la tarjeta muestra solo el resultado; el detalle de cada relación se abre en una ventana al presionarla.
 */
const Coherencia = ({ data, onNavigate, compacto = false, enVentana = false, titulo = 'Coherencia entre secciones' }) => {
    const coherencia = useMemo(() => evaluarCoherencia(data || {}), [data]);
    const [abierto, setAbierto] = useState({});
    const [copiado, setCopiado] = useState('');
    const [ventana, setVentana] = useState(false);
    const dialog = useRef(null);
    useEffect(() => {
        const el = dialog.current;
        if (!el) return;
        if (ventana && !el.open) el.showModal();
        if (!ventana && el.open) el.close();
    }, [ventana]);

    const copiar = async (id, text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiado(id);
            window.setTimeout(() => setCopiado(''), 2000);
        } catch {
            /* sin portapapeles: el texto queda visible para copiarlo a mano */
        }
    };

    const detalle = (
        <>
            <ul className="pro-coh-list">
                {coherencia.checks.map((check) => {
                    const debil = check.score !== null && check.score < 80;
                    const open = Boolean(abierto[check.id]);
                    return (
                        <li key={check.id} data-nivel={check.nivel || 'pendiente'} data-open={open || undefined}>
                            <div className="pro-coh-row">
                                {check.score === null
                                    ? <Circle size={16} aria-hidden="true" />
                                    : check.score >= 80 ? <CheckCircle2 size={16} aria-hidden="true" /> : <AlertTriangle size={16} aria-hidden="true" />}
                                <b>{check.label}</b>
                                <span className="pro-coh-badge">{check.score === null ? 'Pendiente' : `${check.score} %`}</span>
                            </div>
                            <p>{check.detail}</p>
                            {debil && (
                                <button
                                    type="button"
                                    className="pro-link pro-coh-toggle"
                                    aria-expanded={open}
                                    onClick={() => setAbierto((prev) => ({ ...prev, [check.id]: !prev[check.id] }))}
                                >
                                    {open ? 'Ocultar' : 'Revisar'} <ChevronDown size={14} aria-hidden="true" />
                                </button>
                            )}
                            {debil && open && (
                                <div className="pro-coh-fix">
                                    {check.porque && (
                                        <div>
                                            <span>Por qué</span>
                                            <p>{check.porque}</p>
                                        </div>
                                    )}
                                    {check.arreglo && (
                                        <div>
                                            <span>Cómo arreglarlo</span>
                                            <p>{check.arreglo}</p>
                                        </div>
                                    )}
                                    {check.sugerencia && (
                                        <div className="pro-coh-sug">
                                            <span>{check.id === 'poblacion-lugar' ? 'Frase para usar' : 'Sugerencia'}</span>
                                            <p>{check.sugerencia}</p>
                                            <button type="button" className="pro-link" onClick={() => copiar(check.id, check.sugerencia)}>
                                                <Clipboard size={13} aria-hidden="true" /> {copiado === check.id ? 'Copiado' : 'Copiar'}
                                            </button>
                                        </div>
                                    )}
                                    {/* Solo en la vista del estudiante (con onNavigate): el administrador no cambia proyectos ajenos. */}
                                    {onNavigate && sePuedeArreglar(check.id) && <Arreglar check={check} data={data} />}
                                    {onNavigate && (
                                        <button type="button" className="pro-btn pro-btn--ghost pro-coh-go" onClick={() => { setVentana(false); onNavigate(check.tab); }}>
                                            Ir a {NOMBRE_TAB[check.tab] || 'la sección'} <ArrowRight size={14} aria-hidden="true" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
            <p className="pro-coh-note">Revisión automática de la forma; la coherencia de fondo la valida el asesor.</p>
        </>
    );

    return (
        <section className={`pro-coh ${compacto ? 'pro-coh--compacto' : ''}`} aria-label={titulo} data-nivel={coherencia.nivel || 'pendiente'}>
            <div className="pro-coh-head">
                <div>
                    {enVentana
                        ? <h2><button type="button" className="pro-coh-abrir" onClick={() => setVentana(true)}><Link2 size={18} aria-hidden="true" /> {titulo}</button></h2>
                        : <h2><Link2 size={18} aria-hidden="true" /> {titulo}</h2>}
                    {!compacto && <p>Compara cada sección con las que dependen de ella: los mismos términos, población, lugar y un tipo de alcance acorde con los objetivos. {enVentana ? 'Presiona el título para ver cada relación, por qué falla y cómo arreglarla.' : 'Toca «Revisar» para ver por qué y cómo arreglarlo.'}</p>}
                </div>
                {coherencia.score !== null ? (
                    <div className="pro-coh-score">
                        <b>{coherencia.score} %</b>
                        <span>Coherencia {coherencia.nivel}</span>
                        <div className="pro-bar" aria-hidden="true"><span style={{ width: `${coherencia.score}%` }} /></div>
                        <small>{coherencia.evaluados} de {coherencia.checks.length} relaciones evaluadas</small>
                    </div>
                ) : (
                    <p className="pro-coh-empty">Se necesitan al menos el título y la pregunta para evaluar la coherencia.</p>
                )}
            </div>
            {enVentana ? (
                <dialog ref={dialog} className="pro-coh-modal" data-nivel={coherencia.nivel || 'pendiente'} aria-label={titulo} onClose={() => setVentana(false)}>
                    <header>
                        <h2><Link2 size={18} aria-hidden="true" /> {titulo}{coherencia.score !== null && <span className="pro-coh-badge">{coherencia.score} %</span>}</h2>
                        <button type="button" className="pro-coh-cerrar" aria-label="Cerrar" onClick={() => setVentana(false)}><X size={18} /></button>
                    </header>
                    {ventana && detalle}
                </dialog>
            ) : detalle}
        </section>
    );
};

export default Coherencia;
