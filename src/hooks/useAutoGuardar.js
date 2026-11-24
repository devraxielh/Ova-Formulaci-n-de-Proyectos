import { useEffect, useRef } from 'react';

/*
 * Guardado automático de los constructores.
 * Llama a `guardar` poco después de que cambie `firma` (el texto ya redactado), pero solo si el
 * estudiante tocó algo desde que abrió el constructor: así los borradores que se cargan solos
 * al entrar no pasan al documento hasta que él empieza a trabajar.
 */
export const useAutoGuardar = (firma, guardar, espera = 900) => {
    const fn = useRef(guardar);
    fn.current = guardar;
    const interactuo = useRef(false);
    const primera = useRef(true);

    useEffect(() => {
        const marcar = () => { interactuo.current = true; };
        window.addEventListener('pointerdown', marcar, true);
        window.addEventListener('keydown', marcar, true);
        return () => {
            window.removeEventListener('pointerdown', marcar, true);
            window.removeEventListener('keydown', marcar, true);
        };
    }, []);

    useEffect(() => {
        if (primera.current) { primera.current = false; return undefined; }
        if (!firma || !interactuo.current) return undefined;
        const timer = window.setTimeout(() => fn.current(), espera);
        return () => window.clearTimeout(timer);
    }, [firma, espera]);
};
