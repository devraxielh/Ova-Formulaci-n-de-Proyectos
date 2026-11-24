import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calculator, CheckCircle2, Plus, Save, X } from 'lucide-react';
import { VALIDACION_DETALLE, parrafoConDatos } from '../data/validacion';
import { CALCULADORAS, alfaCalculado } from './ValidacionCalculadoras';
import './ValidacionModal.css';

const articulo = (nombre) => {
    const n = String(nombre || 'instrumento').trim().toLowerCase();
    if (/^(el|la|los|las)\s/.test(n)) return n;
    return /^(guía|lista|ficha|prueba|escala|rúbrica|bitácora|matriz)/.test(n) ? `la ${n}` : `el ${n}`;
};
const contraer = (text) => text.replace(/\bde el\b/g, 'del').replace(/\ba el\b/g, 'al');

/*
 * Modal con el paso a paso, la calculadora y el párrafo para el documento de cada método.
 * - datos / onGuardar: si existen, la calculadora se guarda en el instrumento.
 * - seleccionados / onToggle: agregar o quitar el método del instrumento.
 */
const ValidacionModal = ({ open, inicial, instrumento, seleccionados = [], onToggle, datos = {}, onGuardar, onClose }) => {
    const ref = useRef(null);
    const [actual, setActual] = useState(inicial || VALIDACION_DETALLE[0].id);
    const [borrador, setBorrador] = useState(datos || {});
    const [guardado, setGuardado] = useState('');

    useEffect(() => {
        if (!open) return;
        if (inicial) setActual(inicial);
        setBorrador(datos || {});
        setGuardado('');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, inicial]);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    const v = VALIDACION_DETALLE.find((item) => item.id === actual) || VALIDACION_DETALLE[0];
    const agregado = seleccionados.includes(v.id);
    const Calc = CALCULADORAS[v.id];
    const nombre = articulo(instrumento);
    const conDatos = parrafoConDatos(v.id, nombre, borrador[v.id]);
    const parrafo = contraer(conDatos || v.parrafo(nombre));
    const cambiado = JSON.stringify(borrador[v.id] || null) !== JSON.stringify(datos?.[v.id] || null);

    return createPortal(
        <dialog
            ref={ref}
            className="val-modal"
            aria-labelledby="val-modal-title"
            onClose={onClose}
            onClick={(event) => { if (event.target === ref.current) onClose(); }}
        >
            <div className="val-box">
                <header className="val-head">
                    <div>
                        <p className="val-kicker">Validez y confiabilidad{instrumento ? ` · ${instrumento}` : ''}</p>
                        <h2 id="val-modal-title">{v.titulo}</h2>
                        <p className="val-tipo">{v.tipo}</p>
                    </div>
                    <button type="button" className="val-close" onClick={onClose} aria-label="Cerrar"><X size={20} /></button>
                </header>

                <div className="val-tabs" role="tablist" aria-label="Métodos">
                    {VALIDACION_DETALLE.map((item) => (
                        <button key={item.id} type="button" role="tab" aria-selected={item.id === v.id} onClick={() => { setActual(item.id); setGuardado(''); }}>
                            {seleccionados.includes(item.id) && <CheckCircle2 size={14} aria-hidden="true" />} {item.titulo}
                        </button>
                    ))}
                </div>

                <div className="val-body">
                    <div className="val-col">
                        <section className="val-intro">
                            <p><b>Qué es:</b> {v.que}</p>
                            <p><b>Para qué instrumentos:</b> {v.para}</p>
                        </section>
                        <section>
                            <h3>Paso a paso</h3>
                            <ol className="val-pasos">
                                {v.pasos.map((paso) => <li key={paso}>{paso}</li>)}
                            </ol>
                        </section>
                        <section className="val-ejemplo">
                            <h3>Ejemplo</h3>
                            <ul>{v.ejemplo.map((linea) => <li key={linea}>{linea}</li>)}</ul>
                        </section>
                    </div>

                    <div className="val-col">
                        <section className="val-calc">
                            <h3><Calculator size={17} aria-hidden="true" /> Calculadora</h3>
                            {Calc && (
                                <Calc
                                    value={borrador[v.id]}
                                    onChange={(next) => { setBorrador((prev) => ({ ...prev, [v.id]: next })); setGuardado(''); }}
                                    alfaLocalSugerido={alfaCalculado(borrador)}
                                />
                            )}
                        </section>
                        <section className="val-texto">
                            <h3>Así queda en tu documento</h3>
                            <p>{parrafo}</p>
                            <small>{conDatos ? 'Con los datos de tu calculadora. ' : 'Texto modelo: usa la calculadora para que tenga tus datos. '}Va bajo el subtítulo «Validez y confiabilidad», dentro de Instrumentos de recolección de información.</small>
                        </section>
                    </div>
                </div>

                <footer className="val-foot">
                    <div className="val-foot-left">
                        {onGuardar ? (
                            <button type="button" className="ide-btn ide-btn--primary" disabled={!cambiado && agregado} onClick={() => { onGuardar(v.id, borrador[v.id]); setGuardado(v.id); }}>
                                <Save size={16} /> {agregado ? 'Guardar el cálculo' : 'Guardar y agregar a este instrumento'}
                            </button>
                        ) : <small className="val-nota">Para guardar el cálculo, abre este modal desde «Construye tu metodología».</small>}
                        {onToggle && agregado && (
                            <button type="button" className="ide-btn ide-btn--ghost" onClick={() => onToggle(v.id)}><X size={16} /> Quitar de este instrumento</button>
                        )}
                        {onToggle && !agregado && !onGuardar && (
                            <button type="button" className="ide-btn ide-btn--ghost" onClick={() => onToggle(v.id)}><Plus size={16} /> Agregar a este instrumento</button>
                        )}
                        {guardado === v.id && <span className="val-ok" role="status"><CheckCircle2 size={15} aria-hidden="true" /> Guardado. Recuerda «Guardar mi metodología».</span>}
                    </div>
                    <button type="button" className="ide-btn ide-btn--ghost" onClick={onClose}>Cerrar</button>
                </footer>
            </div>
        </dialog>,
        document.body,
    );
};

export default ValidacionModal;
