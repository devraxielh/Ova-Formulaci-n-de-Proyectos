// Veredicto de «Revisar con IA». La IA propone un nivel, pero lo decide el código a partir de lo que ella misma
// encontró, para que la etiqueta no contradiga la lista: no puede decir «Casi lista» con seis pendientes de fondo.
const DE_FONDO = new Set(['falta', 'incoherencia', 'metodo']);

export const nivelDeRevision = (nivelIA, observaciones) => {
    const lista = Array.isArray(observaciones) ? observaciones : [];
    const deFondo = lista.filter((o) => DE_FONDO.has(o?.tipo)).length;
    if (lista.length === 0) return 'lista';
    if (deFondo >= 3 || lista.length >= 5) return 'falta';
    // Con pocas observaciones vale lo que diga la IA, salvo «lista»: si hay algo por mejorar, no está lista.
    return nivelIA === 'falta' ? 'falta' : 'casi';
};
