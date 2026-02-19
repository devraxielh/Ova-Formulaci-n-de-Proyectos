import React, { useState } from 'react';
import { Link, Copy, Check, AlertCircle, BookOpen, ArrowRight, HelpCircle, Lightbulb } from 'lucide-react';

// ─── APA 7 formatter ────────────────────────────────────────────────────────

function formatAuthors(authors) {
    // kept as alias for backward compat (used in formatAPA above)
    return formatAuthorsAPA(authors);
}

// ─── Shared helpers ──────────────────────────────────────────────────────────

function formatAuthorsAPA(authors) {
    if (!authors || authors.length === 0) return null;
    const fmt = authors.map(a => {
        const last = a.family || '';
        const first = a.given ? a.given.split(' ').map(n => n[0] + '.').join(' ') : '';
        return first ? `${last}, ${first}` : last;
    });
    if (fmt.length === 1) return fmt[0];
    if (fmt.length <= 20) return fmt.slice(0, -1).join(', ') + ', & ' + fmt[fmt.length - 1];
    return fmt.slice(0, 19).join(', ') + ', ... ' + fmt[fmt.length - 1];
}

function formatAuthorsIEEE(authors) {
    if (!authors || authors.length === 0) return '[Author Unknown]';
    const fmt = authors.map(a => {
        const first = a.given ? a.given.split(' ').map(n => n[0] + '.').join(' ') : '';
        const last = a.family || '';
        return first ? `${first} ${last}` : last;
    });
    if (fmt.length <= 3) return fmt.join(', ');
    return fmt[0] + ' et al.';
}

function formatAuthorsVancouver(authors) {
    if (!authors || authors.length === 0) return '[Author Unknown]';
    const fmt = authors.map(a => {
        const last = a.family || '';
        const first = a.given ? a.given.split(' ').map(n => n[0]).join('') : '';
        return first ? `${last} ${first}` : last;
    });
    if (fmt.length <= 6) return fmt.join(', ');
    return fmt.slice(0, 6).join(', ') + ', et al.';
}

function formatAuthorsMLA(authors) {
    if (!authors || authors.length === 0) return '[Author Unknown]';
    const first = authors[0];
    const lastName = first.family || '';
    const firstName = first.given || '';
    if (authors.length === 1) return firstName ? `${lastName}, ${firstName}` : lastName;
    if (authors.length === 2) {
        const s = authors[1];
        return `${lastName}, ${firstName}, and ${s.given || ''} ${s.family || ''}`;
    }
    return `${lastName}, ${firstName}, et al.`;
}

function getYear(data) {
    const parts =
        data['published-print']?.['date-parts']?.[0] ||
        data['published-online']?.['date-parts']?.[0] ||
        data['published']?.['date-parts']?.[0];
    return parts ? parts[0] : 'n.d.';
}

// ─── APA 7 ───────────────────────────────────────────────────────────────────
function formatAPA(data) {
    const type = data.type || '';
    const authors = formatAuthorsAPA(data.author);
    const year = getYear(data);
    const title = (data.title?.[0] || '').replace(/<[^>]+>/g, '');
    const doiUrl = `https://doi.org/${data.DOI}`;

    if (['journal-article', 'proceedings-article'].includes(type)) {
        const journal = data['container-title']?.[0] || '';
        const volume = data.volume || '';
        const issue = data.issue ? `(${data.issue})` : '';
        const pages = data.page ? `, ${data.page}` : '';
        const vol = volume ? `, ${volume}${issue}${pages}` : '';
        return `${authors || '[Autor desconocido]'} (${year}). ${title}. *${journal}*${vol}. ${doiUrl}`;
    }
    if (type === 'book') {
        return `${authors || '[Autor desconocido]'} (${year}). *${title}*. ${data.publisher || ''}. ${doiUrl}`;
    }
    if (type === 'book-chapter') {
        const editors = formatAuthorsAPA(data.editor);
        const bookTitle = data['container-title']?.[0] || '';
        const pages = data.page ? `pp. ${data.page}` : '';
        const edPart = editors ? `En ${editors} (Ed${data.editor?.length > 1 ? 's' : ''}.), ` : '';
        return `${authors || '[Autor desconocido]'} (${year}). ${title}. ${edPart}*${bookTitle}* (${pages}). ${data.publisher || ''}. ${doiUrl}`;
    }
    return `${authors || '[Autor desconocido]'} (${year}). *${title}*. ${data.publisher || ''}. ${doiUrl}`;
}

// ─── IEEE ─────────────────────────────────────────────────────────────────────
function formatIEEE(data) {
    const authors = formatAuthorsIEEE(data.author);
    const year = getYear(data);
    const title = (data.title?.[0] || '').replace(/<[^>]+>/g, '');
    const type = data.type || '';
    const doiUrl = `https://doi.org/${data.DOI}`;

    if (['journal-article', 'proceedings-article'].includes(type)) {
        const journal = data['container-title']?.[0] || '';
        const vol = data.volume ? `, vol. ${data.volume}` : '';
        const no = data.issue ? `, no. ${data.issue}` : '';
        const pp = data.page ? `, pp. ${data.page}` : '';
        return `${authors}, "${title}," *${journal}*${vol}${no}${pp}, ${year}, doi: ${data.DOI}.`;
    }
    if (type === 'book') {
        return `${authors}, *${title}*. ${data.publisher || ''}, ${year}. doi: ${data.DOI}.`;
    }
    if (type === 'book-chapter') {
        const bookTitle = data['container-title']?.[0] || '';
        const pp = data.page ? `, pp. ${data.page}` : '';
        const editors = formatAuthorsIEEE(data.editor);
        const edPart = editors !== '[Author Unknown]' ? ` in *${bookTitle}*, ${editors}, Ed.` : ` in *${bookTitle}*`;
        return `${authors}, "${title},"${edPart}${pp}. ${data.publisher || ''}, ${year}. doi: ${data.DOI}.`;
    }
    return `${authors}, "${title}," ${data.publisher || ''}, ${year}. doi: ${data.DOI}.`;
}

// ─── Vancouver ───────────────────────────────────────────────────────────────
function formatVancouver(data) {
    const authors = formatAuthorsVancouver(data.author);
    const year = getYear(data);
    const title = (data.title?.[0] || '').replace(/<[^>]+>/g, '');
    const type = data.type || '';

    if (['journal-article', 'proceedings-article'].includes(type)) {
        const journal = data['container-title']?.[0] || '';
        const vol = data.volume || '';
        const issue = data.issue ? `(${data.issue})` : '';
        const pages = data.page ? `:${data.page}` : '';
        return `${authors}. ${title}. ${journal}. ${year};${vol}${issue}${pages}. doi:${data.DOI}`;
    }
    if (type === 'book') {
        return `${authors}. ${title}. ${data.publisher || ''}; ${year}. doi:${data.DOI}`;
    }
    return `${authors}. ${title}. ${data.publisher || ''}. ${year}. doi:${data.DOI}`;
}

// ─── MLA 9 ───────────────────────────────────────────────────────────────────
function formatMLA(data) {
    const authors = formatAuthorsMLA(data.author);
    const year = getYear(data);
    const title = (data.title?.[0] || '').replace(/<[^>]+>/g, '');
    const type = data.type || '';
    const doiUrl = `https://doi.org/${data.DOI}`;

    if (['journal-article', 'proceedings-article'].includes(type)) {
        const journal = data['container-title']?.[0] || '';
        const vol = data.volume ? `vol. ${data.volume}` : '';
        const no = data.issue ? `no. ${data.issue}` : '';
        const pages = data.page || '';
        const volPart = [vol, no].filter(Boolean).join(', ');
        return `${authors}. "${title}." *${journal}*, ${volPart}${volPart ? ', ' : ''}${year}, pp. ${pages}. DOI: ${doiUrl}.`;
    }
    if (type === 'book') {
        return `${authors}. *${title}*. ${data.publisher || ''}, ${year}. DOI: ${doiUrl}.`;
    }
    if (type === 'book-chapter') {
        const bookTitle = data['container-title']?.[0] || '';
        const editors = formatAuthorsMLA(data.editor);
        const edPart = editors !== '[Author Unknown]' ? `, edited by ${editors}` : '';
        const pp = data.page ? `pp. ${data.page}` : '';
        return `${authors}. "${title}." *${bookTitle}*${edPart}, ${data.publisher || ''}, ${year}, ${pp}. DOI: ${doiUrl}.`;
    }
    return `${authors}. *${title}*. ${data.publisher || ''}, ${year}. DOI: ${doiUrl}.`;
}

// ─── Chicago Author-Date ──────────────────────────────────────────────────────
function formatChicago(data) {
    const authors = formatAuthorsAPA(data.author); // same Last, F. pattern
    const year = getYear(data);
    const title = (data.title?.[0] || '').replace(/<[^>]+>/g, '');
    const type = data.type || '';
    const doiUrl = `https://doi.org/${data.DOI}`;

    if (['journal-article', 'proceedings-article'].includes(type)) {
        const journal = data['container-title']?.[0] || '';
        const vol = data.volume || '';
        const no = data.issue ? `, no. ${data.issue}` : '';
        const pages = data.page ? `: ${data.page}` : '';
        const volPart = vol ? `${vol}${no}${pages}` : '';
        return `${authors || '[Author Unknown]'}. ${year}. "${title}." *${journal}* ${volPart}. ${doiUrl}.`;
    }
    if (type === 'book') {
        return `${authors || '[Author Unknown]'}. ${year}. *${title}*. ${data.publisher || ''}. ${doiUrl}.`;
    }
    if (type === 'book-chapter') {
        const bookTitle = data['container-title']?.[0] || '';
        const editors = formatAuthorsAPA(data.editor);
        const edPart = editors ? ` Edited by ${editors}.` : '';
        const pp = data.page ? `, ${data.page}` : '';
        return `${authors || '[Author Unknown]'}. ${year}. "${title}."${edPart} In *${bookTitle}*${pp}. ${data.publisher || ''}. ${doiUrl}.`;
    }
    return `${authors || '[Author Unknown]'}. ${year}. *${title}*. ${data.publisher || ''}. ${doiUrl}.`;
}

// ─── Dispatch by style ───────────────────────────────────────────────────────
const STYLES = [
    { id: 'apa7', label: 'APA 7', color: '#2563eb', fn: formatAPA },
    { id: 'ieee', label: 'IEEE', color: '#0891b2', fn: formatIEEE },
    { id: 'vancouver', label: 'Vancouver', color: '#059669', fn: formatVancouver },
    { id: 'mla9', label: 'MLA 9', color: '#7c3aed', fn: formatMLA },
    { id: 'chicago', label: 'Chicago', color: '#b45309', fn: formatChicago },
];

function getCitation(style, data) {
    const s = STYLES.find(s => s.id === style);
    return s ? s.fn(data) : formatAPA(data);
}

// ─── In-text by style ────────────────────────────────────────────────────────
function formatInText(style, data) {
    const authors = data.author || [];
    const year = getYear(data);
    const lastName = authors[0]?.family || '[Autor]';

    if (style === 'ieee') return '[N]  (número de referencia en la lista)';
    if (style === 'vancouver') return '(N)  ​o superíndice N';
    if (style === 'mla9') {
        const part = authors.length === 0 ? '[Autor]'
            : authors.length === 1 ? lastName
                : authors.length === 2 ? `${lastName} y ${authors[1].family}`
                    : `${lastName} et al.`;
        return `(${part} página)`;
    }
    if (style === 'chicago') {
        const part = authors.length === 0 ? '[Autor]'
            : authors.length >= 4 ? `${lastName} et al.`
                : authors.map(a => a.family || '').join(', ');
        return `(${part} ${year})`;
    }
    // APA 7 default
    const part = authors.length === 0 ? '[Autor desconocido]'
        : authors.length === 1 ? lastName
            : authors.length === 2 ? `${lastName} y ${authors[1].family}`
                : `${lastName} et al.`;
    return `(${part}, ${year})`;
}


// ─── Render APA with italic simulation ──────────────────────────────────────
function RenderAPA({ text }) {
    // Split by * to apply italics
    const parts = text.split('*');
    return (
        <span>
            {parts.map((part, i) =>
                i % 2 === 1 ? <em key={i}>{part}</em> : <span key={i}>{part}</span>
            )}
        </span>
    );
}

// ─── Component ───────────────────────────────────────────────────────────────

const DoiCite = () => {
    const [doi, setDoi] = useState('');
    const [citationStyle, setCitationStyle] = useState('apa7');
    const [citation, setCitation] = useState('');
    const [inTextCitation, setInTextCitation] = useState('');
    const [metadata, setMetadata] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [copiedInText, setCopiedInText] = useState(false);

    // Re-format when style changes without re-fetching
    const handleStyleChange = (styleId) => {
        setCitationStyle(styleId);
        if (metadata) {
            setCitation(getCitation(styleId, metadata));
            setInTextCitation(formatInText(styleId, metadata));
        }
    };

    const cleanDoi = (raw) => {
        // Accept full URL or bare DOI
        return raw
            .trim()
            .replace(/^https?:\/\/doi\.org\//i, '')
            .replace(/^doi:\s*/i, '');
    };

    const handleFetch = async () => {
        const cleaned = cleanDoi(doi);
        if (!cleaned) {
            setError('Por favor ingresa un DOI válido.');
            return;
        }
        setIsLoading(true);
        setError('');
        setCitation('');
        setInTextCitation('');
        setMetadata(null);
        try {
            const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(cleaned)}`, {
                headers: { 'User-Agent': 'PROJECTSIA/1.0 (mailto:info@projectsia.edu)' }
            });
            if (!res.ok) throw new Error(`DOI no encontrado (${res.status})`);
            const json = await res.json();
            const data = json.message;
            setMetadata(data);
            setCitation(getCitation(citationStyle, data));
            setInTextCitation(formatInText(citationStyle, data));
        } catch (e) {
            setError(e.message || 'No se pudo obtener la información del DOI. Verifica que sea correcto.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(stripMarkdown(citation)).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleCopyInText = () => {
        navigator.clipboard.writeText(inTextCitation).then(() => {
            setCopiedInText(true);
            setTimeout(() => setCopiedInText(false), 2000);
        });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleFetch();
    };

    return (
        <div style={{ maxWidth: '100%', paddingBottom: '3rem' }}>

            {/* Theory banner */}
            <div className="responsive-banner" style={{
                background: 'linear-gradient(to right, #eff6ff, #dbeafe)',
                border: '1px solid #93c5fd',
                borderRadius: '1rem',
                padding: '2rem',
                marginBottom: '2.5rem',
                display: 'flex',
                gap: '2rem',
                alignItems: 'start'
            }}>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.5rem', color: '#1e40af', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Link size={28} />
                        ¿Qué es un DOI?
                    </h2>
                    <p style={{ color: '#1d4ed8', lineHeight: '1.7', fontSize: '1.05rem', marginBottom: '1rem' }}>
                        Un DOI (<em>Digital Object Identifier</em>) es un identificador único y persistente asignado a
                        documentos digitales como artículos científicos, libros y capítulos. Permite localizar
                        una publicación de forma permanente, incluso si cambia su URL.
                    </p>
                    <p style={{ color: '#1d4ed8', lineHeight: '1.7', fontSize: '1.05rem' }}>
                        Esta herramienta consulta la base de datos pública de <strong>CrossRef</strong> para recuperar
                        los metadatos del documento y genera automáticamente la referencia en formato <strong>APA 7.a edición</strong>.
                    </p>
                </div>
                <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                    maxWidth: '280px',
                    width: '100%'
                }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb', marginBottom: '0.75rem', fontSize: '1rem' }}>
                        <Lightbulb size={20} /> Formatos aceptados
                    </h4>
                    <ul style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.7', paddingLeft: '1.25rem', margin: 0 }}>
                        <li><code style={{ background: '#f1f5f9', padding: '0.1rem 0.3rem', borderRadius: '0.25rem' }}>10.1000/xyz123</code></li>
                        <li><code style={{ background: '#f1f5f9', padding: '0.1rem 0.3rem', borderRadius: '0.25rem' }}>doi:10.1000/xyz123</code></li>
                        <li><code style={{ background: '#f1f5f9', padding: '0.1rem 0.3rem', borderRadius: '0.25rem' }}>https://doi.org/10.1000/xyz123</code></li>
                    </ul>
                </div>
            </div>

            {/* Info cards — How to cite with DOI */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>

                <div style={{ background: 'linear-gradient(to bottom right, #f0f9ff, #e0f2fe)', border: '1px solid #bae6fd', borderRadius: '0.75rem', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', color: '#0369a1', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ArrowRight size={20} color="#0ea5e9" /> Tipos de fuente soportados
                    </h3>
                    <div style={{ color: '#0c4a6e', fontSize: '0.9rem', lineHeight: '1.75' }}>
                        <p style={{ marginBottom: '0.4rem' }}>📄 <strong>Artículo de revista científica</strong></p>
                        <p style={{ marginBottom: '0.4rem' }}>📚 <strong>Libro</strong></p>
                        <p style={{ marginBottom: '0.4rem' }}>📖 <strong>Capítulo de libro</strong></p>
                        <p style={{ margin: 0 }}>📋 <strong>Ponencia / proceedings</strong></p>
                    </div>
                </div>

                <div style={{ background: 'linear-gradient(to bottom right, #f0fdf4, #dcfce7)', border: '1px solid #bbf7d0', borderRadius: '0.75rem', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', color: '#166534', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <HelpCircle size={20} color="#22c55e" /> ¿Cómo se cita? — Artículo
                    </h3>
                    <div style={{ color: '#14532d', fontSize: '0.85rem', fontFamily: 'Georgia, serif', lineHeight: '1.8', paddingLeft: '2em', textIndent: '-2em' }}>
                        Apellido, N., &amp; Apellido, N. (Año). Título del artículo. <em>Nombre de la Revista</em>, <em>volumen</em>(número), páginas. https://doi.org/xxxxx
                    </div>
                    <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#166534' }}>💡 La sangría francesa (2 em) se aplica desde la segunda línea.</p>
                </div>

                <div style={{ background: 'linear-gradient(to bottom right, #fdf4ff, #fae8ff)', border: '1px solid #e9d5ff', borderRadius: '0.75rem', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', color: '#6b21a8', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <HelpCircle size={20} color="#a855f7" /> ¿Cómo se cita? — Libro y capítulo
                    </h3>
                    <p style={{ fontWeight: '600', fontSize: '0.8rem', color: '#7e22ce', marginBottom: '0.35rem' }}>Libro:</p>
                    <div style={{ color: '#581c87', fontSize: '0.83rem', fontFamily: 'Georgia, serif', lineHeight: '1.8', paddingLeft: '2em', textIndent: '-2em', marginBottom: '0.75rem' }}>
                        Apellido, N. (Año). <em>Título del libro</em>. Editorial. https://doi.org/xxxxx
                    </div>
                    <p style={{ fontWeight: '600', fontSize: '0.8rem', color: '#7e22ce', marginBottom: '0.35rem' }}>Capítulo en libro editado:</p>
                    <div style={{ color: '#581c87', fontSize: '0.83rem', fontFamily: 'Georgia, serif', lineHeight: '1.8', paddingLeft: '2em', textIndent: '-2em' }}>
                        Apellido, N. (Año). Título del capítulo. En N. Editor (Ed.), <em>Título del libro</em> (pp. xx–xx). Editorial. https://doi.org/xxxxx
                    </div>
                </div>

                {/* 4th card: in-text citation */}
                <div style={{ background: 'linear-gradient(to bottom right, #fff7ed, #ffedd5)', border: '1px solid #fed7aa', borderRadius: '0.75rem', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', color: '#9a3412', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <HelpCircle size={20} color="#f97316" /> Cita en el texto (paréntesis)
                    </h3>
                    <p style={{ fontSize: '0.83rem', color: '#7c2d12', lineHeight: '1.65', marginBottom: '0.75rem' }}>
                        La cita en el texto es la referencia corta que se inserta dentro del párrafo. Sigue el formato <strong>(Autor, año)</strong> o con número de página <strong>(Autor, año, p. xx)</strong>.
                    </p>
                    <div style={{ fontSize: '0.83rem', color: '#7c2d12', lineHeight: '1.9', fontFamily: 'Georgia, serif' }}>
                        <p style={{ marginBottom: '0.3rem' }}><strong>1 autor:</strong> (García, 2021)</p>
                        <p style={{ marginBottom: '0.3rem' }}><strong>2 autores:</strong> (García y López, 2021)</p>
                        <p style={{ marginBottom: '0.3rem' }}><strong>3+ autores:</strong> (García et al., 2021)</p>
                        <p style={{ margin: 0 }}><strong>Con página:</strong> (García, 2021, p. 45)</p>
                    </div>
                </div>

            </div>

            {/* Main tool */}
            <div style={{ maxWidth: '1200px' }}>
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Convertir DOI a Cita</h2>
                    <p style={{ marginBottom: '1rem', color: '#64748b' }}>
                        Ingresa el DOI de la publicación y selecciona el formato de citación.
                    </p>

                    {/* Style selector pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                        {STYLES.map(s => (
                            <button
                                key={s.id}
                                onClick={() => handleStyleChange(s.id)}
                                style={{
                                    padding: '0.45rem 1rem',
                                    borderRadius: '2rem',
                                    border: `2px solid ${s.color}`,
                                    background: citationStyle === s.id ? s.color : 'white',
                                    color: citationStyle === s.id ? 'white' : s.color,
                                    fontWeight: '700',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s'
                                }}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Ej: 10.1016/j.learninstruc.2009.02.023 o https://doi.org/10.xxxx/..."
                            value={doi}
                            onChange={e => setDoi(e.target.value)}
                            onKeyDown={handleKeyDown}
                            style={{ flex: 1, minWidth: '260px', padding: '0.75rem' }}
                        />
                        <button
                            onClick={handleFetch}
                            disabled={isLoading || !doi.trim()}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: isLoading || !doi.trim() ? '#94a3b8' : 'linear-gradient(to right, #2563eb, #1d4ed8)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontWeight: '600',
                                cursor: isLoading || !doi.trim() ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '1rem',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {isLoading ? (
                                <><span style={{ animation: 'spin 1s linear infinite' }}>⌛</span> Buscando...</>
                            ) : (
                                <><Link size={18} /> Generar Cita</>
                            )}
                        </button>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{ padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', gap: '0.6rem', alignItems: 'start' }}>
                            <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                            <p style={{ margin: 0, color: '#991b1b', fontSize: '0.9rem' }}>{error}</p>
                        </div>
                    )}

                    {/* Result */}
                    {citation && metadata && (
                        <div style={{ marginTop: '0.5rem' }}>
                            {/* Citation box */}
                            <div style={{
                                padding: '1.5rem',
                                background: 'linear-gradient(to right, #eff6ff, #dbeafe)',
                                border: '2px solid #93c5fd',
                                borderRadius: '0.75rem',
                                marginBottom: '1rem',
                                position: 'relative'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem', flexWrap: 'wrap' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                            <BookOpen size={18} color="#2563eb" />
                                            <span style={{ fontWeight: '700', color: '#1e40af', fontSize: '0.9rem' }}>
                                                Referencia {STYLES.find(s => s.id === citationStyle)?.label}
                                            </span>
                                        </div>
                                        <p style={{
                                            margin: 0,
                                            color: '#1e293b',
                                            fontSize: '0.97rem',
                                            lineHeight: '1.8',
                                            fontFamily: 'Georgia, "Times New Roman", serif',
                                            /* APA 7 hanging indent */
                                            paddingLeft: '2em',
                                            textIndent: '-2em'
                                        }}>
                                            <RenderAPA text={citation} />
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleCopy}
                                        style={{
                                            padding: '0.6rem 1rem',
                                            background: copied ? '#16a34a' : 'white',
                                            color: copied ? 'white' : '#2563eb',
                                            border: `2px solid ${copied ? '#16a34a' : '#93c5fd'}`,
                                            borderRadius: '0.5rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                            fontSize: '0.875rem',
                                            transition: 'all 0.2s',
                                            flexShrink: 0
                                        }}
                                    >
                                        {copied ? <><Check size={16} /> Copiado</> : <><Copy size={16} /> Copiar</>}
                                    </button>
                                </div>
                            </div>

                            {/* In-text citation */}
                            <div style={{
                                padding: '1.25rem 1.5rem',
                                background: 'linear-gradient(to right, #fff7ed, #ffedd5)',
                                border: '2px solid #fed7aa',
                                borderRadius: '0.75rem',
                                marginBottom: '1rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '1rem'
                            }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '1.1rem' }}>✏️</span>
                                        <span style={{ fontWeight: '700', color: '#9a3412', fontSize: '0.9rem' }}>Cita en el texto</span>
                                    </div>
                                    <p style={{
                                        margin: '0 0 0.4rem 0',
                                        fontFamily: 'Georgia, "Times New Roman", serif',
                                        fontSize: '1.05rem',
                                        color: '#1e293b',
                                        fontWeight: '600'
                                    }}>
                                        {inTextCitation}
                                    </p>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#7c2d12' }}>
                                        Con página: {inTextCitation.replace(')', ', p. xx)')}
                                    </p>
                                </div>
                                <button
                                    onClick={handleCopyInText}
                                    style={{
                                        padding: '0.6rem 1rem',
                                        background: copiedInText ? '#16a34a' : 'white',
                                        color: copiedInText ? 'white' : '#ea580c',
                                        border: `2px solid ${copiedInText ? '#16a34a' : '#fed7aa'}`,
                                        borderRadius: '0.5rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        fontSize: '0.875rem',
                                        transition: 'all 0.2s',
                                        flexShrink: 0
                                    }}
                                >
                                    {copiedInText ? <><Check size={16} /> Copiado</> : <><Copy size={16} /> Copiar</>}
                                </button>
                            </div>

                            {/* Metadata summary */}
                            <div style={{
                                padding: '1.25rem',
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '0.75rem'
                            }}>
                                <p style={{ fontWeight: '700', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.75rem 0' }}>
                                    Metadatos recuperados
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.88rem', color: '#64748b' }}>
                                    {metadata.type && <div><strong>Tipo:</strong> {metadata.type}</div>}
                                    {metadata['container-title']?.[0] && <div><strong>Publicación:</strong> {metadata['container-title'][0]}</div>}
                                    {metadata.publisher && <div><strong>Editorial:</strong> {metadata.publisher}</div>}
                                    {metadata.volume && <div><strong>Volumen:</strong> {metadata.volume}</div>}
                                    {metadata.issue && <div><strong>Número:</strong> {metadata.issue}</div>}
                                    {metadata.page && <div><strong>Páginas:</strong> {metadata.page}</div>}
                                    {metadata.DOI && <div><strong>DOI:</strong> <a href={`https://doi.org/${metadata.DOI}`} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>{metadata.DOI}</a></div>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoiCite;
