import React from 'react';
import { Layers } from 'lucide-react';

/*
 * Indicador de carga. Sus estilos (.carga…) están en index.html, para que la misma pantalla
 * se vea desde antes de que llegue la aplicación y no haya salto al pasar de una a otra.
 * - pantalla: ocupa toda la ventana, con la marca (arranque, sesión, encuesta pública).
 * - sin `pantalla`: bloque dentro de la página, al abrir una sección; aparece tras un instante
 *   para no parpadear cuando la sección carga de inmediato.
 */
const Cargando = ({ pantalla = false, texto }) => (
    <div className={`carga ${pantalla ? 'carga--pantalla' : 'carga--seccion'}`} role="status" aria-live="polite">
        {pantalla && <div className="carga-marca"><Layers size={34} aria-hidden="true" /><span>PROJECTSIA</span></div>}
        <div className="carga-barra" aria-hidden="true"><i /></div>
        <p>{texto || (pantalla ? 'Cargando tu proyecto…' : 'Abriendo la sección…')}</p>
    </div>
);

export default Cargando;
