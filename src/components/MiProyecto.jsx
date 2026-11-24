import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Circle, Clipboard, Download, Pencil, Plus, Printer, Trash2, UserRound } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { BUILD_ORDER, buildDocument, documentHtml, documentText } from '../services/projectDoc';
import { DocumentPaper } from './ProjectDocument';
import Coherencia from './Coherencia';
import './Proyecto.css';

// Mismo orden que el menú lateral.
const MENU_ORDER = ['ideacion', 'titulo', 'pregunta', 'planteamiento', 'objetivos', 'introduccion', 'justificacion', 'alcances', 'marco', 'metodologia', 'fases', 'resultados', 'conclusiones', 'resumen', 'referencias'];

const SAVE_LABEL = {
    local: 'Guardado solo en este navegador',
    saved: 'Guardado en tu cuenta',
    saving: 'Guardando…',
    error: 'No se pudo guardar',
};

const MiProyecto = ({ onNavigate }) => {
    const {
        user, projects, project, data, saveState, saveError, retrySave,
        openProject, createProject, renameProject, deleteProject, clearDraft,
    } = useProject();
    const [name, setName] = useState(project.name);
    const [notice, setNotice] = useState('');
    const [error, setError] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [nameSaved, setNameSaved] = useState(false);
    const [generando, setGenerando] = useState(false);

    useEffect(() => { setName(project.name); setConfirmDelete(false); }, [project.id, project.name]);

    const sections = useMemo(() => buildDocument(data), [data]);
    // La lista de avance sigue el orden del menú; «Continuar con» sigue el orden de construcción
    // (la introducción se escribe al final). El documento usa el orden formal de la propuesta.
    const steps = useMemo(() => [...sections].sort((x, y) => MENU_ORDER.indexOf(x.tab) - MENU_ORDER.indexOf(y.tab)), [sections]);
    const buildSteps = useMemo(() => [...sections].sort((x, y) => BUILD_ORDER.indexOf(x.tab) - BUILD_ORDER.indexOf(y.tab)), [sections]);
    const done = sections.filter((section) => section.content.length > 0);
    const inPaper = done.filter((section) => section.inDocument !== false);
    const next = buildSteps.find((section) => section.content.length === 0);
    const author = user?.name || '';

    const run = async (action) => {
        setError('');
        setNotice('');
        try {
            await action();
        } catch (err) {
            setError(err.message || 'No se pudo completar la acción.');
        }
    };

    const saveName = () => {
        const clean = name.trim();
        if (!clean) {
            setName(project.name);
            return;
        }
        if (clean === project.name) return;
        run(async () => {
            await renameProject(clean);
            setNameSaved(true);
        });
    };

    const descargar = (blob, extension) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${project.name.replace(/[^\p{L}\p{N} _-]/gu, '').trim() || 'proyecto'}.${extension}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    // Word real (.docx) con portada, tabla de contenido y numeración. Si falla, se entrega la versión anterior (.doc).
    const downloadWord = async () => {
        setError('');
        setNotice('');
        setGenerando(true);
        try {
            const { docxBlob } = await import('../services/docx');
            descargar(await docxBlob(project.name, author, sections), 'docx');
            setNotice('Word descargado. Al abrirlo, Word puede preguntar si actualiza los campos: responde «Sí» para que la tabla de contenido muestre los números de página.');
        } catch {
            descargar(new Blob(['\ufeff', documentHtml(project.name, author, sections)], { type: 'application/msword' }), 'doc');
            setNotice('No se pudo generar el .docx; se descargó la versión .doc.');
        } finally {
            setGenerando(false);
        }
    };

    const copyText = () => run(async () => {
        await navigator.clipboard.writeText(documentText(project.name, sections));
        setNotice('Texto del proyecto copiado al portapapeles.');
    });

    return (
        <div className="pro-page">
            <section className="pro-head">
                <div className="pro-head-main">
                    <label htmlFor="pro-name">Nombre del proyecto</label>
                    <div className="pro-name-wrap">
                        <input
                            id="pro-name"
                            className="input-field pro-name"
                            value={name}
                            onChange={(event) => { setNameSaved(false); setName(event.target.value); }}
                            onBlur={saveName}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') event.currentTarget.blur();
                                if (event.key === 'Escape') { setName(project.name); event.currentTarget.blur(); }
                            }}
                            maxLength={120}
                            aria-describedby="pro-name-ayuda"
                        />
                        <Pencil size={17} className="pro-name-icon" aria-hidden="true" />
                    </div>
                    <small id="pro-name-ayuda" className="pro-name-help">
                        {nameSaved
                            ? <span className="pro-name-ok"><CheckCircle2 size={14} aria-hidden="true" /> Nombre guardado{user ? '' : ' en este navegador'}.</span>
                            : 'Haz clic para cambiarlo; se guarda al presionar Enter o al salir del campo.'}
                    </small>
                    <p className="pro-save" data-state={saveState} role="status">
                        {SAVE_LABEL[saveState]}
                        {saveState === 'error' && (
                            <>
                                {saveError ? `: ${saveError} ` : '. '}
                                <button type="button" className="pro-link" onClick={retrySave}>Reintentar</button>
                            </>
                        )}
                    </p>
                </div>

                {user ? (
                    <div className="pro-switch">
                        <label htmlFor="pro-select">Tus proyectos</label>
                        <div className="pro-switch-row">
                            <select
                                id="pro-select"
                                className="input-field"
                                value={project.id ?? ''}
                                onChange={(event) => run(() => openProject(Number(event.target.value)))}
                            >
                                {projects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                            </select>
                            <button type="button" className="pro-btn pro-btn--ghost" onClick={() => run(() => createProject('Proyecto nuevo'))}>
                                <Plus size={16} /> Nuevo
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="pro-callout">
                        <p><strong>Tu proyecto está solo en este navegador.</strong> Crea una cuenta para guardarlo y abrirlo desde cualquier equipo.</p>
                        <button type="button" className="pro-btn pro-btn--primary" onClick={() => onNavigate('cuenta')}>
                            <UserRound size={16} /> Crear cuenta o iniciar sesión
                        </button>
                    </div>
                )}
            </section>

            {error && <p className="pro-alert" role="alert">{error}</p>}

            <Coherencia data={data} onNavigate={onNavigate} />

            <div className="pro-grid">
                <section className="pro-progress" aria-labelledby="pro-progress-title">
                    <h2 id="pro-progress-title">Avance</h2>
                    <p className="pro-count">{done.length} de {sections.length} secciones con contenido</p>
                    <div className="pro-bar" aria-hidden="true"><span style={{ width: `${(done.length / sections.length) * 100}%` }} /></div>
                    <ol className="pro-steps">
                        {steps.map((section) => {
                            const complete = section.content.length > 0;
                            return (
                                <li key={section.id}>
                                    <button type="button" onClick={() => onNavigate(section.tab)} data-done={complete}>
                                        {complete ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                        <span>{section.label}</span>
                                        <small>{complete ? 'Editar' : 'Pendiente'}</small>
                                    </button>
                                </li>
                            );
                        })}
                    </ol>
                    {next && (
                        <button type="button" className="pro-btn pro-btn--primary pro-next" onClick={() => onNavigate(next.tab)}>
                            Continuar con {next.label} <ArrowRight size={16} />
                        </button>
                    )}
                </section>

                <section className="pro-doc" aria-labelledby="pro-doc-title">
                    <div className="pro-doc-bar">
                        <h2 id="pro-doc-title">Documento del proyecto</h2>
                        <div className="pro-actions">
                            <button type="button" className="pro-btn pro-btn--primary" onClick={downloadWord} disabled={inPaper.length === 0 || generando}>
                                <Download size={16} /> {generando ? 'Generando…' : 'Descargar Word'}
                            </button>
                            <button type="button" className="pro-btn pro-btn--ghost" onClick={() => window.print()} disabled={inPaper.length === 0}>
                                <Printer size={16} /> Imprimir o PDF
                            </button>
                            <button type="button" className="pro-btn pro-btn--ghost" onClick={copyText} disabled={inPaper.length === 0}>
                                <Clipboard size={16} /> Copiar texto
                            </button>
                        </div>
                    </div>
                    {notice && <p className="pro-notice" role="status">{notice}</p>}

                    {inPaper.length === 0 ? (
                        <div className="pro-empty">
                            {done.length === 0 ? (
                                <>
                                    <p><strong>Tu proyecto todavía está vacío.</strong></p>
                                    <p>Empieza por la Ideación: lo que escribas allí pasa al título y de ahí a las demás herramientas. Cada resultado que generes aparecerá aquí.</p>
                                    <button type="button" className="pro-btn pro-btn--primary" onClick={() => onNavigate('ideacion')}>
                                        Empezar por la Ideación <ArrowRight size={16} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p><strong>Tu idea ya está lista.</strong></p>
                                    <p>La ficha de la idea es tu material de trabajo y no va en el documento. El documento empieza con tu título.</p>
                                    <button type="button" className="pro-btn pro-btn--primary" onClick={() => onNavigate('titulo')}>
                                        Construir el título <ArrowRight size={16} />
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <DocumentPaper sections={sections} fallbackTitle={project.name} author={author} />
                    )}
                </section>
            </div>

            <section className="pro-danger">
                {user ? (
                    confirmDelete ? (
                        <>
                            <span>¿Eliminar «{project.name}»? No se puede deshacer.</span>
                            <button type="button" className="pro-btn pro-btn--danger" onClick={() => run(() => deleteProject(project.id))}>Sí, eliminar</button>
                            <button type="button" className="pro-btn pro-btn--ghost" onClick={() => setConfirmDelete(false)}>Cancelar</button>
                        </>
                    ) : (
                        <button type="button" className="pro-link pro-link--danger" onClick={() => setConfirmDelete(true)}>
                            <Trash2 size={15} /> Eliminar este proyecto
                        </button>
                    )
                ) : (
                    confirmDelete ? (
                        <>
                            <span>¿Borrar todo el borrador de este navegador? No se puede deshacer.</span>
                            <button type="button" className="pro-btn pro-btn--danger" onClick={() => { clearDraft(); setConfirmDelete(false); }}>Sí, borrar</button>
                            <button type="button" className="pro-btn pro-btn--ghost" onClick={() => setConfirmDelete(false)}>Cancelar</button>
                        </>
                    ) : (
                        <button type="button" className="pro-link pro-link--danger" onClick={() => setConfirmDelete(true)}>
                            <Trash2 size={15} /> Borrar el borrador y empezar de cero
                        </button>
                    )
                )}
            </section>
        </div>
    );
};

export default MiProyecto;
