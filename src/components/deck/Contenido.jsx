import React from 'react';
import { ArrowRight, Quote, Search } from 'lucide-react';
import { Opciones, Pestanas } from './SlideDeck';
import '../Marco.css';
import '../Objetivos.css';
import '../Justificacion.css';

/*
 * Diapositivas descritas como datos: { id, title, lead[], bullets[], hint, panel, quiz, action }.
 * panel.type: tabs | chain | quiz | table | example | list | accordion.
 */

// Texto con **negrita**.
export const Rico = ({ text }) => String(text).split(/(\*\*[^*]+\*\*)/g).map((part, i) => (
    part.startsWith('**') && part.endsWith('**') ? <b key={i}>{part.slice(2, -2)}</b> : part
));

export const Cadena = ({ title, items }) => (
    <div className="ide-panel">
        <h3>{title}</h3>
        <ol className="obj-chain">
            {items.map((item) => (
                <li key={item.label}><span>{item.label}</span><p><Rico text={item.text} /></p>{item.note && <small>{item.note}</small>}</li>
            ))}
        </ol>
    </div>
);

export const Panel = ({ slide }) => {
    const p = slide.panel;
    if (!p && slide.quiz) return <Opciones title={slide.title} questions={slide.quiz} />;
    if (!p) return null;
    if (p.type === 'tabs') return <Pestanas title={p.title} name={`deck-${slide.id}`} items={p.items} />;
    if (p.type === 'chain') return <Cadena title={p.title} items={p.items} />;
    if (p.type === 'table') {
        return (
            <div className="ide-panel">
                <h3>{p.title}</h3>
                <div className="mar-table-wrap">
                    <table className="mar-table">
                        <thead><tr>{p.head.map((h, i) => <th key={i} scope="col">{h}</th>)}</tr></thead>
                        <tbody>{p.rows.map((row, i) => <tr key={i}>{row.map((cell, k) => (k === 0 ? <th key={k} scope="row"><Rico text={cell} /></th> : <td key={k}><Rico text={cell} /></td>))}</tr>)}</tbody>
                    </table>
                </div>
            </div>
        );
    }
    if (p.type === 'example') {
        return (
            <div className="ide-panel mar-ejemplo">
                <h3><Quote size={17} aria-hidden="true" /> {p.title}</h3>
                {p.paragraphs.map((text) => <p key={text}><Rico text={text.replace(/^- /, '• ')} /></p>)}
            </div>
        );
    }
    if (p.type === 'list') {
        return (
            <div className="ide-panel">
                <h3>{p.title}</h3>
                <ul className="jus-questions">
                    {p.items.map((item) => <li key={item.label}><Search size={20} aria-hidden="true" /><span><b>{item.label}</b><Rico text={item.text} /></span></li>)}
                </ul>
            </div>
        );
    }
    if (p.type === 'accordion') {
        return (
            <div className="ide-panel">
                <h3>{p.title}</h3>
                <div className="ide-accordion">
                    {p.items.map((item, index) => (
                        <details key={item.error} open={index === 0}>
                            <summary>{item.error}</summary>
                            <p><em>{item.example}</em></p>
                            <p><strong>Cómo corregirlo:</strong> {item.fix}</p>
                        </details>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

// Diapositiva genérica: texto a la izquierda y su panel (o cuestionario) a la derecha.
// `aside` reemplaza el panel derecho cuando la diapositiva necesita algo propio.
export const Generica = ({ slide, heading, onNavigate, aside, extra }) => (
    <>
        <div>
            {heading}
            {(slide.lead || []).map((text) => <p key={text}><Rico text={text} /></p>)}
            {slide.bullets && <ul className="ide-bullets">{slide.bullets.map((b) => <li key={b}><Rico text={b} /></li>)}</ul>}
            {slide.hint && <p className="ide-hint">{slide.hint}</p>}
            {extra}
            {slide.panel && slide.quiz && <Opciones title="Comprueba" questions={slide.quiz} />}
            {slide.action && onNavigate && (
                <button type="button" className="ide-btn ide-btn--ghost" onClick={() => onNavigate(slide.action)}>
                    {slide.actionLabel || 'Ir a Referencias (agregar por DOI)'} <ArrowRight size={15} />
                </button>
            )}
        </div>
        {aside || <Panel slide={slide} />}
    </>
);
