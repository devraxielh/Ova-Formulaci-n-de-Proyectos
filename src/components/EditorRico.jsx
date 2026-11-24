import React, { useEffect, useRef } from 'react';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';
import { aHtml, aTexto } from '../services/textoRico';
import './EditorRico.css';

/*
 * Editor visual ligero para los campos de redacción: negrita, cursiva y (si `listas`) viñetas y numeración,
 * mostradas con su formato real. Se usa igual que un <textarea>: `value` y `onChange(event)` con event.target.value.
 * Guarda el mismo texto de siempre (**negrita**, *cursiva*, «- ítem»), que es lo que leen el Word y el PDF.
 */
const EditorRico = ({ id, value, onChange, onFocus, placeholder = '', rows = 4, listas = false, className = '', ...resto }) => {
    const caja = useRef(null);
    const emitido = useRef(null); // último texto que salió de este editor (para no repintar mientras se escribe)

    const emitir = () => {
        const el = caja.current;
        if (!el) return;
        // Un editor que solo tiene saltos vacíos cuenta como vacío (para mostrar el ejemplo).
        if (el.textContent.trim() === '' && !el.querySelector('li')) el.innerHTML = '';
        const texto = aTexto(el);
        emitido.current = texto;
        onChange?.({ target: { value: texto, id } });
    };

    // Pinta el contenido cuando el valor cambia desde fuera (cargar el proyecto, «Redactar», un compañero).
    useEffect(() => {
        const el = caja.current;
        if (!el || value === emitido.current) return;
        emitido.current = value ?? '';
        el.innerHTML = aHtml(value ?? '');
    }, [value]);

    // «Citar», «Redactar» y la tecla Tab del ejemplo usan estas funciones (ver deck/campo.js).
    useEffect(() => {
        const el = caja.current;
        if (!el) return undefined;
        el.__rico = {
            valor: () => aTexto(el),
            fijar: (texto) => { el.innerHTML = aHtml(texto); emitir(); },
            insertar: (texto, rango) => {
                el.focus();
                const sel = window.getSelection();
                if (rango && el.contains(rango.startContainer)) { sel.removeAllRanges(); sel.addRange(rango); } else if (!el.contains(sel.anchorNode)) { sel.selectAllChildren(el); sel.collapseToEnd(); }
                document.execCommand('insertText', false, texto);
                emitir();
            },
        };
        return () => { delete el.__rico; };
    });

    const orden = (comando) => (event) => {
        event.preventDefault(); // el botón no le quita el cursor al texto
        caja.current?.focus();
        document.execCommand(comando, false);
        emitir();
    };
    // Al pegar solo entra texto: sin colores, fuentes ni tablas de Word o de una página web.
    const pegar = (event) => {
        event.preventDefault();
        const texto = event.clipboardData.getData('text/plain').replace(/\r/g, '');
        document.execCommand('insertText', false, listas ? texto : texto.replace(/\n{3,}/g, '\n\n'));
    };

    return (
        <div className={`rico ${className.replace(/\btextarea-field\b/, '')}`.replace(/\s+/g, ' ').trim()}>
            <div className="rico-barra" role="toolbar" aria-label="Formato del texto">
                <button type="button" onMouseDown={orden('bold')} title="Negrita (Ctrl+B)" aria-label="Negrita"><Bold size={15} /></button>
                <button type="button" onMouseDown={orden('italic')} title="Cursiva (Ctrl+I)" aria-label="Cursiva"><Italic size={15} /></button>
                {listas && (
                    <>
                        <i aria-hidden="true" />
                        <button type="button" onMouseDown={orden('insertUnorderedList')} title="Lista con viñetas" aria-label="Lista con viñetas"><List size={15} /></button>
                        <button type="button" onMouseDown={orden('insertOrderedList')} title="Lista numerada" aria-label="Lista numerada"><ListOrdered size={15} /></button>
                    </>
                )}
            </div>
            <div
                {...resto}
                id={id}
                ref={caja}
                className="rico-texto"
                contentEditable
                suppressContentEditableWarning
                role="textbox"
                aria-multiline="true"
                data-editor-rico=""
                data-placeholder={placeholder}
                style={{ minHeight: `${Math.max(2, rows) * 1.6 + 1.2}rem` }}
                onInput={emitir}
                onFocus={(event) => { try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch { /* noop */ } onFocus?.(event); }}
                onPaste={pegar}
            />
        </div>
    );
};

export default EditorRico;
