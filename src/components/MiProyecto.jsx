import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Circle, Clipboard, Download, FileDown, Pencil, Presentation, Plus, Printer, Trash2, UserRound } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { BUILD_ORDER, buildDocument, documentHtml, documentText } from '../services/projectDoc';
import { DocumentPaper } from './ProjectDocument';
import Coherencia from './Coherencia';
import ProyectoPaneles from './ProyectoPaneles';
import { api, groq } from '../services/api';
import './Proyecto.css';

// Mismo orden que el menú lateral.
const MENU_ORDER = ['ideacion', 'titulo', 'pregunta', 'planteamiento', 'objetivos', 'introduccion', 'justificacion', 'alcances', 'marco', 'metodologia', 'fases', 'resultados', 'conclusiones', 'resumen', 'referencias'];

const SAVE_LABEL = {
    local: 'Guardado solo en este navegador',
    saved: 'Guardado en tu cuenta',
    saving: 'Guardando…',
    offline: 'Sin conexión: tus cambios están guardados en este navegador y se suben solos al volver el internet',
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
    const [generando, setGenerando] = useState('');

    useEffect(() => { setName(project.name); setConfirmDelete(false); }, [project.id, project.name]);

    const sections = useMemo(() => buildDocument(data), [data]);
    // Abstract y Preliminares van en el documento, pero no cuentan como pasos del avance.
    const pasos = useMemo(() => sections.filter((section) => !section.extra), [sections]);
    // La lista de avance sigue el orden del menú; «Continuar con» sigue el orden de construcción
    // (la introducción se escribe al final). El documento usa el orden formal de la propuesta.
    const steps = useMemo(() => [...pasos].sort((x, y) => MENU_ORDER.indexOf(x.tab) - MENU_ORDER.indexOf(y.tab)), [pasos]);
    const buildSteps = useMemo(() => [...pasos].sort((x, y) => BUILD_ORDER.indexOf(x.tab) - BUILD_ORDER.indexOf(y.tab)), [pasos]);
    const done = pasos.filter((section) => section.content.length > 0);
    const inPaper = sections.filter((section) => section.content.length > 0).filter((section) => section.inDocument !== false);
    const next = buildSteps.find((section) => section.content.length === 0);
    // Integrantes escritos en Resumen › Portada y preliminares; si no hay, el nombre de la cuenta.
    // Cupo de proyectos propios que autorizó el administrador (los compartidos no cuentan).
    const cupo = user?.projectLimit ?? 0;
    const propios = projects.filter((item) => !item.shared).length;
    // Autores del documento: los integrantes escritos a mano en Resumen › Portada y preliminares; si no hay,
    // el equipo del proyecto (el dueño y los invitados que ya tienen cuenta); y si no hay equipo, la cuenta.
    const [equipo, setEquipo] = useState([]);
    useEffect(() => {
        if (!project.id) { setEquipo([]); return undefined; }
        let vivo = true;
        const cargar = () => api.members(project.id)
            .then(({ members }) => { if (vivo) setEquipo(members.filter((m) => m.registered && m.name).map((m) => m.name.trim())); })
            .catch(() => {});
        cargar();
        window.addEventListener('projectsia:equipo', cargar);
        return () => { vivo = false; window.removeEventListener('projectsia:equipo', cargar); };
    }, [project.id]);
    const author = String(data?.integrantes || '').trim() || equipo.join('\n') || user?.name || '';
    const extra = { ciudad: data?.ciudad, director: data?.director, dedicatoria: data?.dedicatoria, agradecimientos: data?.agradecimientos };

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

    // Descarga las figuras del proyecto para incluirlas en el Word o en el PDF.
    const cargarImagenes = async () => {
        const ids = [...new Set(sections.flatMap((section) => section.content).filter((b) => b.type === 'figure').map((b) => b.fileId))];
        const imagenes = {};
        if (!project.id) return imagenes;
        await Promise.all(ids.map(async (fid) => {
            try {
                const res = await fetch(api.fileUrl(project.id, fid), { credentials: 'same-origin' });
                if (!res.ok) return;
                const blob = await res.blob();
                const data = new Uint8Array(await blob.arrayBuffer());
                const dataUrl = await new Promise((resolve) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.readAsDataURL(blob); });
                imagenes[fid] = { data, dataUrl, type: blob.type === 'image/png' ? 'png' : 'jpg' };
            } catch { /* la figura queda con un aviso en el documento */ }
        }));
        return imagenes;
    };

    // Word real (.docx) con portada, tabla de contenido y numeración. Si falla, se entrega la versión anterior (.doc).
    const downloadWord = async () => {
        setError('');
        setNotice('');
        setGenerando('word');
        try {
            const [{ docxBlob }, imagenes] = await Promise.all([import('../services/docx'), cargarImagenes()]);
            descargar(await docxBlob(project.name, author, sections, { ...extra, imagenes }), 'docx');
            setNotice('Word descargado. Al abrirlo, Word puede preguntar si actualiza los campos: responde «Sí» para que la tabla de contenido muestre los números de página.');
        } catch {
            descargar(new Blob(['\ufeff', documentHtml(project.name, author, sections)], { type: 'application/msword' }), 'doc');
            setNotice('No se pudo generar el .docx; se descargó la versión .doc.');
        } finally {
            setGenerando('');
        }
    };

    // PDF con la misma estructura del Word y el índice ya paginado.
    const downloadPdf = async () => {
        setError('');
        setNotice('');
        setGenerando('pdf');
        try {
            const [{ pdfBlob }, imagenes] = await Promise.all([import('../services/pdf'), cargarImagenes()]);
            descargar(await pdfBlob(project.name, author, sections, { ...extra, imagenes }), 'pdf');
            setNotice('PDF descargado.');
        } catch (err) {
            setError(`No se pudo generar el PDF${err?.message ? `: ${err.message}` : ''}. Puedes usar «Imprimir» y elegir «Guardar como PDF».`);
        } finally {
            setGenerando('');
        }
    };

    // Diapositivas de sustentación con los ítems de la plantilla del seminario. La IA resume cada apartado;
    // si falla, se usan las primeras frases de lo que escribió el estudiante.
    const downloadSlides = async () => {
        setError('');
        setNotice('');
        setGenerando('pptx');
        try {
            const { apartadosParaResumir, guionDiapositivas, presentacionPptx } = await import('../services/diapositivas');
            const apartados = apartadosParaResumir(data);
            let resumen = {};
            let conIA = false;
            if (apartados.length) {
                try {
                    const r = await groq.chat.completions.create({
                        messages: [
                            { role: 'system', content: 'Preparas las diapositivas de la sustentación final de un proyecto de investigación. Resumes cada apartado en un texto muy breve, fiel a lo que escribió el estudiante: no agregas datos, cifras, autores ni conclusiones que no estén en su texto. Respondes solo JSON válido en español.' },
                            { role: 'user', content: `Resume cada apartado para una diapositiva: máximo 40 palabras, una o dos frases directas en tercera persona, conservando cifras y citas (Autor, año). Para «implicaciones» di qué decisiones o mejoras permiten los resultados, solo a partir del texto dado.\n\n${apartados.map((x) => `### ${x.clave} — ${x.rotulo}\n${x.texto}`).join('\n\n')}\n\nResponde exactamente con este JSON (un texto por clave): {${apartados.map((x) => `"${x.clave}": "…"`).join(', ')}}` },
                        ],
                        temperature: 0.2,
                        max_tokens: 3000,
                        response_format: { type: 'json_object' },
                    });
                    const content = r.choices?.[0]?.message?.content || '';
                    resumen = JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1));
                    conIA = true;
                } catch { /* sin IA: primeras frases de cada apartado */ }
            }
            const slides = guionDiapositivas(sections, data, { autor: author, resumen });
            const imagenes = await cargarImagenes();
            descargar(await presentacionPptx(slides, imagenes), 'pptx');
            setNotice(`Presentación descargada: ${slides.length} diapositivas con los apartados de la plantilla de sustentación${conIA ? ', resumidos por la IA a partir de tu documento' : ' (sin resumen de IA: se usaron las primeras frases de cada apartado)'}. Los apartados que aún no has escrito no aparecen. Revísala en PowerPoint antes de sustentar.`);
        } catch (err) {
            setError(`No se pudo generar la presentación${err?.message ? `: ${err.message}` : ''}.`);
        } finally {
            setGenerando('');
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
                                {projects.map((item) => <option key={item.id} value={item.id}>{item.name}{item.shared ? ` (de ${item.ownerName})` : ''}</option>)}
                            </select>
                            <button type="button" className="pro-btn pro-btn--ghost" disabled={propios >= cupo} title={propios >= cupo ? 'Llegaste al número de proyectos que te autorizó el administrador' : undefined} onClick={() => run(() => createProject('Proyecto nuevo'))}>
                                <Plus size={16} /> Nuevo
                            </button>
                        </div>
                        {user.role !== 'admin' && <small className="pro-name-help">Proyectos propios: {propios} de {cupo} autorizados.</small>}
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

            <ProyectoPaneles
                extra={user && !project.shared && (confirmDelete ? (
                    <>
                        <span>¿Eliminar «{project.name}»? No se puede deshacer.</span>
                        <button type="button" className="pro-btn pro-btn--danger" onClick={() => run(() => deleteProject(project.id))}>Sí, eliminar</button>
                        <button type="button" className="pro-btn pro-btn--ghost" onClick={() => setConfirmDelete(false)}>Cancelar</button>
                    </>
                ) : (
                    <button type="button" className="pro-paneles-eliminar" onClick={() => setConfirmDelete(true)}>
                        <Trash2 size={16} aria-hidden="true" /> Eliminar proyecto
                    </button>
                ))}
            />

            <Coherencia data={data} onNavigate={onNavigate} enVentana />

            <div className="pro-grid">
                <section className="pro-progress" aria-labelledby="pro-progress-title">
                    <h2 id="pro-progress-title">Avance</h2>
                    <p className="pro-count">{done.length} de {pasos.length} secciones con contenido</p>
                    <div className="pro-bar" aria-hidden="true"><span style={{ width: `${(done.length / pasos.length) * 100}%` }} /></div>
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
                            <button type="button" className="pro-btn pro-btn--primary" onClick={downloadWord} disabled={inPaper.length === 0 || Boolean(generando)}>
                                <Download size={16} /> {generando === 'word' ? 'Generando…' : 'Descargar Word'}
                            </button>
                            <button type="button" className="pro-btn pro-btn--ghost" onClick={downloadPdf} disabled={inPaper.length === 0 || Boolean(generando)}>
                                <FileDown size={16} /> {generando === 'pdf' ? 'Generando…' : 'Descargar PDF'}
                            </button>
                            <button type="button" className="pro-btn pro-btn--ghost" onClick={downloadSlides} disabled={inPaper.length === 0 || Boolean(generando)}>
                                <Presentation size={16} /> {generando === 'pptx' ? 'Generando…' : 'Diapositivas'}
                            </button>
                            <button type="button" className="pro-btn pro-btn--ghost" onClick={() => window.print()} disabled={inPaper.length === 0}>
                                <Printer size={16} /> Imprimir
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
                        <DocumentPaper sections={sections} fallbackTitle={project.name} author={author} fileUrl={project.id ? (fid) => api.fileUrl(project.id, fid) : undefined} />
                    )}
                </section>
            </div>

            {/* «Eliminar proyecto» está arriba, junto a Anexos. Aquí queda solo lo demás. */}
            {!(user && !project.shared) && (
            <section className="pro-danger">
                {user && project.shared ? (
                    <span className="pro-panel-hint">Este proyecto es de {project.ownerName}. Para dejar de verlo, usa «Salir del proyecto» en Equipo.</span>
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
            )}
        </div>
    );
};

export default MiProyecto;
