// Trato común para los dos tipos de campo de las clases: el <textarea> de siempre y el editor visual (EditorRico).
// «Citar», «Redactar» y la tecla Tab del ejemplo usan estas funciones para no depender de cuál es.

const esRico = (el) => el instanceof HTMLElement && el.dataset.editorRico !== undefined && Boolean(el.__rico);
const esNativo = (el) => el instanceof HTMLTextAreaElement
    || (el instanceof HTMLInputElement && ['text', 'search', ''].includes(el.type) && !el.readOnly && !el.disabled);

// Campo editable donde ocurrió un evento (o null).
export const campoDe = (target) => {
    if (!(target instanceof Node)) return null;
    const el = target instanceof HTMLElement ? target : target.parentElement;
    if (!el) return null;
    if (esNativo(el)) return el;
    const rico = el.closest?.('[data-editor-rico]');
    return rico && esRico(rico) ? rico : null;
};

export const valorDe = (el) => (esRico(el) ? el.__rico.valor() : el.value);
export const placeholderDe = (el) => (esRico(el) ? el.dataset.placeholder || '' : el.placeholder || '');

// Posición del cursor o selección, para volver a ella después de tocar un botón.
export const marcaDe = (el) => {
    if (esRico(el)) {
        const sel = window.getSelection();
        const rango = sel && sel.rangeCount && el.contains(sel.anchorNode) ? sel.getRangeAt(0).cloneRange() : null;
        return { rango, texto: rango ? sel.toString() : '' };
    }
    const inicio = el.selectionStart ?? el.value.length;
    const fin = el.selectionEnd ?? el.value.length;
    return { inicio, fin, texto: el.value.slice(inicio, fin) };
};

const fijarNativo = (el, nuevo) => {
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, nuevo);
    el.dispatchEvent(new Event('input', { bubbles: true }));
};

// Reemplaza todo el contenido del campo.
export const fijarValor = (el, texto) => {
    if (esRico(el)) { el.__rico.fijar(texto); return; }
    fijarNativo(el, texto);
    el.focus();
    el.setSelectionRange?.(texto.length, texto.length);
};

// Escribe `texto` en el cursor (o sobre la selección guardada en `marca`), cuidando los espacios alrededor.
export const insertarEn = (el, texto, marca = marcaDe(el), { espacios = true } = {}) => {
    if (esRico(el)) {
        const previo = marca.rango ? marca.rango.startContainer.textContent?.slice(0, marca.rango.startOffset) || '' : valorDe(el);
        const antes = espacios && previo && !/[\s(¿¡«]$/.test(previo) ? ' ' : '';
        el.__rico.insertar(`${antes}${texto}`, marca.rango);
        return;
    }
    const inicio = marca.inicio ?? el.value.length;
    const fin = marca.fin ?? el.value.length;
    const antes = el.value.slice(0, inicio);
    const despues = el.value.slice(fin);
    const espacioAntes = espacios && antes && !/[\s(¿¡«]$/.test(antes) ? ' ' : '';
    const espacioDespues = espacios && despues && !/^[\s.,;:)»?!]/.test(despues) ? ' ' : '';
    fijarNativo(el, `${antes}${espacioAntes}${texto}${espacioDespues}${despues}`);
    const pos = antes.length + espacioAntes.length + texto.length;
    el.focus();
    el.setSelectionRange?.(pos, pos);
};
