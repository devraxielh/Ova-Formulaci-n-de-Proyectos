import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, HelpCircle, X } from 'lucide-react';
import './Avisos.css';

/*
 * Avisos emergentes (toasts) y confirmaciones. Se usan desde cualquier parte, sin pasar props:
 *   avisar('Cuenta creada.');                       // se cierra solo
 *   avisar('No se pudo guardar.', 'error');         // dura más y se puede cerrar
 *   if (await confirmar({ texto: '¿Bloquear a Ana?', aceptar: 'Bloquear', peligro: true })) …
 * <Avisos /> se monta una sola vez (en App) y dibuja la pila abajo a la derecha.
 */

let siguiente = 1;
let pila = [];
const oyentes = new Set();
const publicar = () => oyentes.forEach((fn) => fn(pila));
const quitar = (id) => { pila = pila.filter((a) => a.id !== id); publicar(); };

export const avisar = (texto, tipo = 'ok') => {
    if (!texto) return;
    // El mismo aviso repetido no se apila: se renueva.
    pila = pila.filter((a) => a.confirmar || a.texto !== texto);
    pila = [...pila, { id: siguiente++, texto, tipo }].slice(-5);
    publicar();
};

export const confirmar = ({ texto, detalle = '', aceptar = 'Aceptar', cancelar = 'Cancelar', peligro = false }) => new Promise((resolve) => {
    const id = siguiente++;
    pila = [...pila, { id, texto, detalle, aceptar, cancelar, peligro, tipo: 'pregunta', confirmar: (valor) => { quitar(id); resolve(valor); } }];
    publicar();
});

// Para componentes que guardan su mensaje en el estado: <Aviso texto={error} tipo="error" /> lo muestra como
// notificación cada vez que cambia, en lugar de un párrafo fijo en la página.
export const Aviso = ({ texto, tipo = 'ok' }) => {
    useEffect(() => { if (texto) avisar(String(texto), tipo); }, [texto, tipo]);
    return null;
};

const ICONO = { ok: CheckCircle2, error: AlertTriangle, pregunta: HelpCircle };
const DURA = { ok: 5000, error: 9000 };

const Tarjeta = ({ aviso }) => {
    const Icono = ICONO[aviso.tipo] || CheckCircle2;
    const primero = useRef(null);
    const [pausa, setPausa] = useState(false);

    // Los avisos se van solos (se detienen con el ratón encima); las preguntas esperan la respuesta.
    useEffect(() => {
        if (aviso.confirmar || pausa) return undefined;
        const t = setTimeout(() => quitar(aviso.id), DURA[aviso.tipo] || 5000);
        return () => clearTimeout(t);
    }, [aviso, pausa]);
    useEffect(() => { if (aviso.confirmar) primero.current?.focus({ preventScroll: true }); }, [aviso]);

    if (aviso.confirmar) {
        return (
            <div className="avi avi--pregunta" role="alertdialog" aria-label={aviso.texto} data-peligro={aviso.peligro || undefined} onKeyDown={(e) => { if (e.key === 'Escape') aviso.confirmar(false); }}>
                <Icono size={18} aria-hidden="true" />
                <div className="avi-texto"><b>{aviso.texto}</b>{aviso.detalle && <span>{aviso.detalle}</span>}</div>
                <div className="avi-botones">
                    {/* El foco cae en lo seguro: «Cancelar» si la acción es delicada. */}
                    <button ref={aviso.peligro ? primero : undefined} type="button" onClick={() => aviso.confirmar(false)}>{aviso.cancelar}</button>
                    <button ref={aviso.peligro ? undefined : primero} type="button" className="avi-si" onClick={() => aviso.confirmar(true)}>{aviso.aceptar}</button>
                </div>
            </div>
        );
    }
    return (
        <div className={`avi avi--${aviso.tipo}`} role={aviso.tipo === 'error' ? 'alert' : 'status'} onMouseEnter={() => setPausa(true)} onMouseLeave={() => setPausa(false)}>
            <Icono size={18} aria-hidden="true" />
            <div className="avi-texto"><span>{aviso.texto}</span></div>
            <button type="button" className="avi-cerrar" onClick={() => quitar(aviso.id)} aria-label="Cerrar el aviso"><X size={15} /></button>
        </div>
    );
};

const Avisos = () => {
    const [lista, setLista] = useState(pila);
    useEffect(() => { oyentes.add(setLista); return () => { oyentes.delete(setLista); }; }, []);
    // Avisos que llegan de fuera de React (el cliente del API): window.dispatchEvent(new CustomEvent('psia:aviso', { detail })).
    useEffect(() => {
        const oir = (e) => avisar(e.detail?.texto, e.detail?.tipo);
        window.addEventListener('psia:aviso', oir);
        return () => window.removeEventListener('psia:aviso', oir);
    }, []);
    if (lista.length === 0) return null;
    return createPortal(<div className="avi-pila">{lista.map((a) => <Tarjeta key={a.id} aviso={a} />)}</div>, document.body);
};

export default Avisos;
