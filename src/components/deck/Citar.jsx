import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookMarked, Quote, Search, X } from 'lucide-react';
import { useProjectField } from '../../context/ProjectContext';
import { citaNarrativa, citaParentetica, ordenarReferencias, referenciaAPA } from '../../services/apa';
import './Citar.css';

const esEditable = (el) => el instanceof HTMLTextAreaElement
    || (el instanceof HTMLInputElement && ['text', 'search', ''].includes(el.type) && !el.readOnly && !el.disabled);

// Escribe `texto` en la posición del cursor de un campo controlado por React.
const insertar = (el, texto) => {
    const inicio = el.selectionStart ?? el.value.length;
    const fin = el.selectionEnd ?? el.value.length;
    const antes = el.value.slice(0, inicio);
    const despues = el.value.slice(fin);
    const espacioAntes = antes && !/[\s(¿¡«]$/.test(antes) ? ' ' : '';
    const espacioDespues = despues && !/^[\s.,;:)»?!]/.test(despues) ? ' ' : '';
    const nuevo = `${antes}${espacioAntes}${texto}${espacioDespues}${despues}`;
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, nuevo);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    const pos = antes.length + espacioAntes.length + texto.length;
    el.focus();
    el.setSelectionRange?.(pos, pos);
};

/*
 * Botón «Citar» de la barra de las clases: inserta la cita de una referencia guardada
 * en el último campo de texto donde estuvo el cursor.
 * `stageRef` es el contenedor de la clase (para saber qué campo se usó por última vez).
 */
const Citar = ({ stageRef }) => {
    const [refs] = useProjectField('referencias', []);
    const [open, setOpen] = useState(false);
    const [filtro, setFiltro] = useState('');
    const [campo, setCampo] = useState(null);
    const [hecho, setHecho] = useState('');
    const ultimo = useRef(null);
    const caja = useRef(null);

    const lista = useMemo(() => ordenarReferencias(Array.isArray(refs) ? refs : []), [refs]);
    const visibles = lista.filter((ref) => !filtro.trim() || referenciaAPA(ref).toLowerCase().includes(filtro.trim().toLowerCase()));

    // Recuerda el último campo de texto de la clase que tuvo el cursor.
    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) return undefined;
        const onFocus = (event) => {
            if (caja.current?.contains(event.target)) return;
            if (esEditable(event.target)) ultimo.current = event.target;
        };
        stage.addEventListener('focusin', onFocus);
        return () => stage.removeEventListener('focusin', onFocus);
    }, [stageRef]);

    useEffect(() => {
        if (!open) return undefined;
        const onKey = (event) => { if (event.key === 'Escape') setOpen(false); };
        const onDown = (event) => { if (!caja.current?.contains(event.target)) setOpen(false); };
        window.addEventListener('keydown', onKey);
        window.addEventListener('mousedown', onDown);
        return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('mousedown', onDown); };
    }, [open]);

    const abrir = () => {
        const el = ultimo.current && document.body.contains(ultimo.current) ? ultimo.current : null;
        setCampo(el);
        setHecho('');
        setOpen((prev) => !prev);
    };

    const citar = (texto) => {
        const el = campo && document.body.contains(campo) ? campo : null;
        if (!el) return;
        insertar(el, texto);
        setHecho(texto);
        setOpen(false);
    };

    const irAReferencias = () => {
        setOpen(false);
        window.dispatchEvent(new CustomEvent('projectsia:navegar', { detail: 'referencias' }));
    };

    return (
        <div className="cit" ref={caja}>
            <button
                type="button"
                className="ide-tool cit-btn"
                aria-expanded={open}
                aria-haspopup="dialog"
                title="Citar una referencia en el párrafo donde está el cursor"
                onMouseDown={(event) => event.preventDefault()}
                onClick={abrir}
            >
                <Quote size={16} aria-hidden="true" /> <span>Citar</span>
            </button>
            {open && (
                <div className="cit-pop" role="dialog" aria-label="Citar una referencia">
                    <div className="cit-head">
                        <b>Citar una referencia</b>
                        <button type="button" className="cit-x" onClick={() => setOpen(false)} aria-label="Cerrar"><X size={16} /></button>
                    </div>
                    {lista.length === 0 ? (
                        <div className="cit-vacio">
                            <p>Todavía no tienes referencias guardadas.</p>
                            <button type="button" className="cit-ir" onClick={irAReferencias}><BookMarked size={15} /> Agregar referencias</button>
                        </div>
                    ) : (
                        <>
                            <p className={`cit-donde ${campo ? '' : 'cit-donde--falta'}`}>
                                {campo ? 'La cita se escribirá donde dejaste el cursor.' : 'Primero haz clic dentro del párrafo donde va la cita y vuelve a tocar «Citar».'}
                            </p>
                            {lista.length > 5 && (
                                <label className="cit-buscar"><Search size={14} aria-hidden="true" /><input value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="Buscar autor o título" aria-label="Buscar referencia" /></label>
                            )}
                            <ul className="cit-lista">
                                {visibles.map((ref) => (
                                    <li key={ref.id}>
                                        <small>{referenciaAPA(ref).replace(/\*/g, '').slice(0, 110)}{referenciaAPA(ref).length > 110 ? '…' : ''}</small>
                                        <div>
                                            <button type="button" disabled={!campo} onMouseDown={(e) => e.preventDefault()} onClick={() => citar(citaParentetica(ref))}>{citaParentetica(ref)}</button>
                                            <button type="button" disabled={!campo} onMouseDown={(e) => e.preventDefault()} onClick={() => citar(citaNarrativa(ref))}>{citaNarrativa(ref)}</button>
                                        </div>
                                    </li>
                                ))}
                                {visibles.length === 0 && <li><small>Ninguna referencia coincide.</small></li>}
                            </ul>
                            <button type="button" className="cit-ir" onClick={irAReferencias}><BookMarked size={15} /> Administrar mis referencias</button>
                        </>
                    )}
                </div>
            )}
            {hecho && <span className="cit-ok" role="status">Cita insertada: {hecho}</span>}
        </div>
    );
};

export default Citar;
