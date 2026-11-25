import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Search } from 'lucide-react';
import './Selector.css';

/*
 * Lista desplegable con buscador. Reemplaza al <select> del navegador donde hay muchas opciones (profesores, roles…).
 *   <Selector value={id} onChange={setId} opciones={[{ value, label, nota }]} etiqueta="Profesor a cargo" />
 * Teclado: flechas para moverse, Enter para elegir, Escape para cerrar; al abrir se puede escribir para filtrar.
 * La lista se dibuja fuera del contenedor (portal) para que una tabla o tarjeta con desborde no la recorte.
 */

const sinTildes = (t) => String(t ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const Selector = ({ value, onChange, opciones, etiqueta, vacio = 'Elegir…', disabled = false, compacto = false, buscar, className = '' }) => {
    const [abierto, setAbierto] = useState(false);
    const [texto, setTexto] = useState('');
    const [activo, setActivo] = useState(0);
    const [lugar, setLugar] = useState(null);
    const boton = useRef(null);
    const panel = useRef(null);
    const campo = useRef(null);
    const id = useId();

    const actual = opciones.find((o) => String(o.value) === String(value ?? ''));
    const conBuscador = buscar ?? opciones.length > 5;
    const visibles = useMemo(() => {
        const q = sinTildes(texto.trim());
        return q ? opciones.filter((o) => sinTildes(o.label).includes(q) || sinTildes(o.nota).includes(q)) : opciones;
    }, [opciones, texto]);

    const ubicar = () => {
        const r = boton.current?.getBoundingClientRect();
        if (!r) return;
        const alto = Math.min(320, 48 + opciones.length * 40);
        const arriba = window.innerHeight - r.bottom < alto + 12 && r.top > alto;
        setLugar({ left: Math.max(8, Math.min(r.left, window.innerWidth - Math.max(r.width, 272) - 8)), width: Math.max(r.width, 272), ...(arriba ? { bottom: window.innerHeight - r.top + 4 } : { top: r.bottom + 4 }) });
    };
    const abrir = () => {
        if (disabled) return;
        setTexto('');
        setActivo(Math.max(0, opciones.findIndex((o) => String(o.value) === String(value ?? ''))));
        ubicar();
        setAbierto(true);
    };
    const cerrar = (devolverFoco = true) => { setAbierto(false); if (devolverFoco) boton.current?.focus(); };
    const elegir = (o) => { cerrar(); if (String(o.value) !== String(value ?? '')) onChange(o.value); };

    useLayoutEffect(() => { if (abierto) (conBuscador ? campo.current : panel.current)?.focus(); }, [abierto, conBuscador]);
    useEffect(() => {
        if (!abierto) return undefined;
        const fuera = (e) => { if (!panel.current?.contains(e.target) && !boton.current?.contains(e.target)) cerrar(false); };
        const mover = (e) => { if (!panel.current?.contains(e.target)) ubicar(); };
        document.addEventListener('mousedown', fuera);
        window.addEventListener('resize', ubicar);
        window.addEventListener('scroll', mover, true);
        return () => { document.removeEventListener('mousedown', fuera); window.removeEventListener('resize', ubicar); window.removeEventListener('scroll', mover, true); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [abierto]);
    useEffect(() => { setActivo(0); }, [texto]);
    useEffect(() => { if (abierto) panel.current?.querySelector('[data-activo]')?.scrollIntoView({ block: 'nearest' }); }, [activo, abierto]);

    const tecla = (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setActivo((i) => Math.min(visibles.length - 1, i + 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActivo((i) => Math.max(0, i - 1)); }
        else if (e.key === 'Home') { e.preventDefault(); setActivo(0); }
        else if (e.key === 'End') { e.preventDefault(); setActivo(visibles.length - 1); }
        else if (e.key === 'Enter') { e.preventDefault(); if (visibles[activo]) elegir(visibles[activo]); }
        else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); cerrar(); }
        else if (e.key === 'Tab') cerrar(false);
    };

    return (
        <>
            <button
                ref={boton}
                type="button"
                className={`sel ${compacto ? 'sel--compacto' : ''} ${className}`}
                data-vacio={!actual || actual.value === '' || undefined}
                aria-haspopup="listbox"
                aria-expanded={abierto}
                aria-label={etiqueta ? `${etiqueta}: ${actual?.label || vacio}` : undefined}
                disabled={disabled}
                onClick={() => (abierto ? cerrar() : abrir())}
                onKeyDown={(e) => { if (!abierto && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { e.preventDefault(); abrir(); } }}
            >
                <span>{actual?.label || vacio}</span>
                <ChevronDown size={16} aria-hidden="true" />
            </button>
            {abierto && lugar && createPortal(
                <div ref={panel} className="sel-panel" style={lugar} tabIndex={-1} onKeyDown={tecla}>
                    {conBuscador && (
                        <div className="sel-buscar">
                            <Search size={15} aria-hidden="true" />
                            <input ref={campo} type="text" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribe para filtrar" aria-label={`Filtrar ${etiqueta || 'opciones'}`} aria-controls={id} autoComplete="off" spellCheck={false} />
                        </div>
                    )}
                    <ul id={id} role="listbox" aria-label={etiqueta}>
                        {visibles.map((o, i) => {
                            const elegido = String(o.value) === String(value ?? '');
                            return (
                                <li key={String(o.value)} role="option" aria-selected={elegido} data-activo={i === activo || undefined} onMouseEnter={() => setActivo(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => elegir(o)}>
                                    <span><b>{o.label}</b>{o.nota && <small>{o.nota}</small>}</span>
                                    {elegido && <Check size={15} aria-hidden="true" />}
                                </li>
                            );
                        })}
                        {visibles.length === 0 && <li className="sel-nada" aria-disabled="true">Nada coincide con «{texto}».</li>}
                    </ul>
                </div>,
                document.body,
            )}
        </>
    );
};

export default Selector;
