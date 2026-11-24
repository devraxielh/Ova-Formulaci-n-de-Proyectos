import React from 'react';
import { documentoNumerado, splitInline } from '../services/projectDoc';
import { arbolDataUrl, nivelesDe } from '../services/arbol';
import './Proyecto.css';

// Pinta los bloques del documento (títulos, párrafos, listas y tablas) sin HTML crudo.
export const Inline = ({ value }) => splitInline(value).map((part, index) => (
    part.bold ? <strong key={index}>{part.text}</strong> : part.italic ? <em key={index}>{part.text}</em> : <React.Fragment key={index}>{part.text}</React.Fragment>
));

const Rotulo = ({ block }) => (block.caption ? <p className="pro-cap"><strong>{block.rotulo || (block.type === 'table' ? 'Tabla' : 'Figura')}</strong><em>{block.caption}</em></p> : null);
const Nota = ({ text }) => (text ? <p className="pro-nota"><em>Nota.</em> {text}</p> : null);

export const Block = ({ block, fileUrl }) => {
    if (block.type === 'figure') {
        return (
            <figure className="pro-figura">
                <Rotulo block={block} />
                {block.arbol
                    ? <img src={arbolDataUrl(block.arbol)} alt={`${nivelesDe(block.arbol).nombre}. ${nivelesDe(block.arbol).centro}: ${block.arbol.problema}. ${nivelesDe(block.arbol).abajoPlural}: ${block.arbol.causas.join('; ')}. ${nivelesDe(block.arbol).arribaPlural}: ${block.arbol.efectos.join('; ')}.`} />
                    : fileUrl ? <img src={fileUrl(block.fileId)} alt={block.caption} loading="lazy" /> : <p className="pro-nota">La imagen se ve al iniciar sesión.</p>}
                <Nota text={block.nota} />
            </figure>
        );
    }
    if (block.type === 'gantt') {
        const cols = Array.from({ length: block.total }, (_, i) => i + 1);
        return (
            <figure className="pro-figura">
                <Rotulo block={block} />
                <div className="pro-table-wrap">
                    <table className="pro-gantt">
                        <thead><tr><th scope="col">Actividad</th>{cols.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
                        <tbody>
                            {block.rows.map((r, i) => (
                                <tr key={i}><td>{r.actividad || r.fase}</td>{cols.map((c) => <td key={c} data-on={c >= r.inicio && c <= r.fin} />)}</tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Nota text={`Las columnas corresponden a cada ${block.unidad.toLowerCase()} del proyecto.`} />
            </figure>
        );
    }
    if (block.type === 'heading') return <h4 className={block.level === 3 ? 'pro-h3' : undefined}>{block.titulo || block.text}</h4>;
    if (block.type === 'sub') return <p className="pro-sub"><strong>{block.text}</strong></p>;
    if (block.type === 'list') {
        if (block.nums) return <ol className="pro-ol">{block.items.map((item, index) => <li key={index} value={Number(block.nums[index]) || index + 1}><Inline value={item} /></li>)}</ol>;
        return <ul>{block.items.map((item, index) => <li key={index}><Inline value={item} /></li>)}</ul>;
    }
    if (block.type === 'table') {
        return (
            <div className="pro-table-wrap">
                <Rotulo block={block} />
                <table className={block.compact ? 'pro-compact' : undefined}>
                    <thead><tr>{block.head.map((cell, i) => <th key={i} scope="col">{cell}</th>)}</tr></thead>
                    <tbody>
                        {block.rows.map((cells, rowIndex) => (
                            <tr key={rowIndex}>{cells.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>
                        ))}
                    </tbody>
                    {block.foot && <tfoot><tr>{block.foot.map((cell, index) => <td key={index}>{cell}</td>)}</tr></tfoot>}
                </table>
                <Nota text={block.nota} />
            </div>
        );
    }
    if (block.type === 'plain') {
        return (
            <p className={block.keywords ? 'pro-pc' : 'pro-abs'}>
                {String(block.text).split(/(\*[^*]+\*)/g).map((part, index) => (
                    part.startsWith('*') && part.endsWith('*') && part.length > 2 ? <em key={index}>{part.slice(1, -1)}</em> : <React.Fragment key={index}>{part}</React.Fragment>
                ))}
            </p>
        );
    }
    if (block.type === 'reference') {
        // Referencia APA: *cursivas* y sangría francesa.
        return (
            <p className="pro-ref">
                {String(block.text).split(/(\*[^*]+\*)/g).map((part, index) => (
                    part.startsWith('*') && part.endsWith('*') && part.length > 2 ? <em key={index}>{part.slice(1, -1)}</em> : <React.Fragment key={index}>{part}</React.Fragment>
                ))}
            </p>
        );
    }
    return <p><Inline value={block.text} /></p>;
};

// Hoja del documento completo, de solo lectura.
export const DocumentPaper = ({ sections, fallbackTitle, author, fileUrl }) => {
    const done = documentoNumerado(sections);
    const title = sections.find((section) => section.id === 'titulo')?.content[0]?.text || fallbackTitle;
    return (
        <article className="pro-paper">
            <h3 className="pro-paper-title">{title}</h3>
            {author && <p className="pro-paper-author">{String(author).split(/\n+/).join(", ")}</p>}
            {done.filter((section) => section.id !== 'titulo').map((section) => (
                <section key={section.id}>
                    <h3>{section.titulo}</h3>
                    {section.content.map((block, index) => <Block key={index} block={block} fileUrl={fileUrl} />)}
                </section>
            ))}
        </article>
    );
};
