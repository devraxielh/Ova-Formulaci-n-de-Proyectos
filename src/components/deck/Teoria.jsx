import React from 'react';
import { BookOpen, Lightbulb, AlertTriangle } from 'lucide-react';
import './Teoria.css';

/*
 * Teoría ampliada de una diapositiva: va debajo de su contenido, a todo el ancho.
 * Los datos viven en src/data/teoria/<clase>.js, una entrada por diapositiva:
 *   { claves: [['Idea', 'Explicación'], …], ejemplo: '…', ojo: '…' }
 * Las diapositivas de actividad (cuestionarios, repaso, construcción, revisión) no llevan.
 */
// Texto con **negrita**.
const Rico = ({ text }) => String(text).split(/(\*\*[^*]+\*\*)/g).map((parte, i) => (
    parte.startsWith('**') && parte.endsWith('**') ? <b key={i}>{parte.slice(2, -2)}</b> : parte
));

const Teoria = ({ datos }) => {
    if (!datos) return null;
    const claves = Array.isArray(datos.claves) ? datos.claves.filter((c) => c && c[0] && c[1]) : [];
    if (!claves.length && !datos.ejemplo && !datos.ojo) return null;
    return (
        <section className="teo" aria-label="Para profundizar">
            <h3><BookOpen size={16} aria-hidden="true" /> Para profundizar</h3>
            {claves.length > 0 && (
                <dl className="teo-claves" data-n={claves.length}>
                    {claves.map(([titulo, texto]) => <div key={titulo}><dt>{titulo}</dt><dd><Rico text={texto} /></dd></div>)}
                </dl>
            )}
            {(datos.ejemplo || datos.ojo) && (
                <div className="teo-pie">
                    {datos.ejemplo && <p className="teo-ejemplo"><Lightbulb size={16} aria-hidden="true" /><span><b>Ejemplo.</b> <Rico text={datos.ejemplo} /></span></p>}
                    {datos.ojo && <p className="teo-ojo"><AlertTriangle size={16} aria-hidden="true" /><span><b>Ten en cuenta.</b> <Rico text={datos.ojo} /></span></p>}
                </div>
            )}
        </section>
    );
};

export default Teoria;
