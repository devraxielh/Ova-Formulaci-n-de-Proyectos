import React from 'react';
import { splitBold } from '../services/projectDoc';
import './Proyecto.css';

// Pinta los bloques del documento (títulos, párrafos, listas y tablas) sin HTML crudo.
export const Inline = ({ value }) => splitBold(value).map((part, index) => (
    part.bold ? <strong key={index}>{part.text}</strong> : <React.Fragment key={index}>{part.text}</React.Fragment>
));

export const Block = ({ block }) => {
    if (block.type === 'heading') return <h4>{block.text}</h4>;
    if (block.type === 'list') {
        return <ul>{block.items.map((item, index) => <li key={index}><Inline value={item} /></li>)}</ul>;
    }
    if (block.type === 'table') {
        return (
            <div className="pro-table-wrap">
                <table>
                    <thead><tr>{block.head.map((cell) => <th key={cell} scope="col">{cell}</th>)}</tr></thead>
                    <tbody>
                        {block.rows.map((cells, rowIndex) => (
                            <tr key={rowIndex}>{cells.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>
                        ))}
                    </tbody>
                    {block.foot && <tfoot><tr>{block.foot.map((cell, index) => <td key={index}>{cell}</td>)}</tr></tfoot>}
                </table>
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
export const DocumentPaper = ({ sections, fallbackTitle, author }) => {
    const done = sections.filter((section) => section.content.length > 0 && section.inDocument !== false);
    const title = sections.find((section) => section.id === 'titulo')?.content[0]?.text || fallbackTitle;
    return (
        <article className="pro-paper">
            <h3 className="pro-paper-title">{title}</h3>
            {author && <p className="pro-paper-author">{author}</p>}
            {done.filter((section) => section.id !== 'titulo').map((section) => (
                <section key={section.id}>
                    <h3>{section.label}</h3>
                    {section.content.map((block, index) => <Block key={index} block={block} />)}
                </section>
            ))}
        </article>
    );
};
