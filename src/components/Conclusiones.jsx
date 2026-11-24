import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Flag, Lightbulb, Plus, Trash2, Wand2 } from 'lucide-react';
import SlideDeck from './deck/SlideDeck';
import { Generica } from './deck/Contenido';
import { useProject, useProjectField } from '../context/ProjectContext';
import { useAutoGuardar } from '../hooks/useAutoGuardar';
import { partesObjetivos } from '../services/coherencia';
import { SECTIONS, SLIDES } from '../data/conclusionesClase';
import './Titulo.css';
import './Planteamiento.css';
import './Objetivos.css';
import './Justificacion.css';
import './Marco.css';
import './Fases.css';

const SLIDE_KEY = 'projectsia:conclusiones:diapositiva';

const clean = (text) => String(text || '').trim().replace(/[\s.,;:]+$/, '');
const lower = (text) => (text ? text.charAt(0).toLowerCase() + text.slice(1) : '');
const capital = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : '');
const countWords = (text) => String(text || '').trim().split(/\s+/).filter(Boolean).length;

const CITA = /\([^()]*(19|20)\d{2}[^()]*\)|\b(según|de acuerdo con) [A-ZÁÉÍÓÚ]/;
const RECOMIENDA = /\bse recomienda|\brecomendamos|\bse sugiere\b/i;
const ABSOLUTOS = /\b(se demostró|prueba que|definitivamente|siempre|nunca|todos los|en todo el país|en colombia)\b/i;

// «Caracterizar la inasistencia…» → «Se caracterizó la inasistencia…»; con objeto plural, «Se determinaron los factores…».
const IRREGULARES = {
    proponer: ['propuso', 'propusieron'], construir: ['construyó', 'construyeron'], producir: ['produjo', 'produjeron'],
    distinguir: ['distinguió', 'distinguieron'], concluir: ['concluyó', 'concluyeron'], atribuir: ['atribuyó', 'atribuyeron'],
    reconocer: ['reconoció', 'reconocieron'], hacer: ['hizo', 'hicieron'],
};
const pasado = (infinitivo, plural) => {
    const v = String(infinitivo || '').toLowerCase();
    if (IRREGULARES[v]) return IRREGULARES[v][plural ? 1 : 0];
    if (v.endsWith('ar')) return `${v.slice(0, -2)}${plural ? 'aron' : 'ó'}`;
    if (v.endsWith('er') || v.endsWith('ir')) return `${v.slice(0, -2)}${plural ? 'ieron' : 'ió'}`;
    return v;
};
const inicioDesdeObjetivo = (objetivo) => {
    const [verbo, ...resto] = clean(objetivo).split(/\s+/);
    if (!/(ar|er|ir)$/i.test(verbo || '')) return '';
    const [primera = '', segunda = ''] = resto;
    const plural = /^(los|las|unos|unas)$/i.test(primera) || (/^(la|el)$/i.test(primera) ? false : /s$/i.test(primera) || /s$/i.test(segunda));
    return `Se ${pasado(verbo, plural)} ${resto.join(' ')}`;
};

const redactar = (form, especificos) => {
    const lista = especificos
        .map((_, i) => clean(form.especificas?.[i]))
        .map((txt, i) => (txt ? `${i + 1}. ${capital(txt)}.` : ''))
        .filter(Boolean);
    const partes = [];
    if (lista.length) partes.push(lista.join('\n'));
    if (clean(form.general)) partes.push(`### Conclusión general\n${capital(clean(form.general))}.`);
    const recs = (form.recomendaciones || []).filter((r) => clean(r.accion));
    const recomendaciones = recs.map((r) => `- ${clean(r.destinatario) ? `**A ${lower(clean(r.destinatario)).replace(/^a\s+/, '')}:** ` : ''}${capital(clean(r.accion))}.`).join('\n');
    return { conclusiones: partes.join('\n\n'), recomendaciones };
};

/* ---------- Estado ---------- */

const useConcState = () => {
    const { data } = useProject();
    const [form, setForm] = useProjectField('conclusionesForm', { especificas: {}, general: '', recomendaciones: [{ destinatario: '', accion: '' }] });
    const [, setConclusiones] = useProjectField('conclusiones', '');
    const [, setRecomendaciones] = useProjectField('recomendaciones', '');
    const f = { especificas: {}, general: '', recomendaciones: [{ destinatario: '', accion: '' }], ...(form || {}) };
    if (!Array.isArray(f.recomendaciones) || f.recomendaciones.length === 0) f.recomendaciones = [{ destinatario: '', accion: '' }];
    const update = (patch) => setForm((prev) => ({ especificas: {}, general: '', recomendaciones: [{ destinatario: '', accion: '' }], ...(prev || {}), ...patch }));
    const { especificos } = partesObjetivos(data.objetivos);
    const hallazgos = (data.resultadosForm?.porObjetivo) || {};
    return {
        data, f, update, setConclusiones, setRecomendaciones,
        especificos: especificos.map((o) => o.replace(/\.$/, '')),
        hallazgos, pregunta: clean(data.pregunta), futuras: clean(data.resultadosForm?.futuras),
    };
};

/* ---------- Constructor ---------- */

const Constructor = ({ intro, onNavigate }) => {
    const { f, update, setConclusiones, setRecomendaciones, especificos, hallazgos, pregunta, futuras } = useConcState();
    const [tab, setTab] = useState(0);
    const [saved, setSaved] = useState(false);
    const touch = () => setSaved(false);
    const n = especificos.length;
    const textos = redactar(f, especificos);
    const setEsp = (i, v) => { touch(); update({ especificas: { ...f.especificas, [i]: v } }); };
    const borrador = (i) => {
        const h = hallazgos[i] || {};
        const inicio = inicioDesdeObjetivo(especificos[i]);
        const base = clean(h.hallazgo);
        return [inicio, base ? `: ${lower(base)}` : ''].join('').trim();
    };
    const save = () => {
        setConclusiones(textos.conclusiones);
        setRecomendaciones(textos.recomendaciones);
        setSaved(true);
    };
    // Guardado automático: lo redactado pasa a Mi proyecto sin tener que tocar «Guardar».
    useAutoGuardar(textos.conclusiones || textos.recomendaciones ? JSON.stringify(textos) : '', save);
    const listas = especificos.filter((_, i) => clean(f.especificas?.[i])).length;

    if (n === 0) {
        return (
            <div className="pla-builder-wrap">
                <div>{intro}</div>
                <p className="obj-warn"><AlertTriangle size={15} aria-hidden="true" /> Primero guarda tus objetivos específicos: las conclusiones se escriben una por objetivo.</p>
                {onNavigate && <button type="button" className="ide-btn ide-btn--primary" onClick={() => onNavigate('objetivos')}>Ir a Objetivos</button>}
            </div>
        );
    }

    const actual = tab < n ? 'esp' : tab === n ? 'general' : 'rec';
    const texto = actual === 'esp' ? (f.especificas?.[tab] || '') : '';

    return (
        <div className="pla-builder-wrap">
            <header className="pla-builder-head">
                <div>{intro}</div>
                <div className="pla-status">
                    <p className="obj-count"><b>{listas} de {n} conclusiones específicas</b> · {f.recomendaciones.filter((r) => clean(r.accion)).length} recomendaciones</p>
                    <button type="button" className="ide-btn ide-btn--primary" disabled={!textos.conclusiones} onClick={save}>
                        <CheckCircle2 size={17} /> Guardar conclusiones
                    </button>
                    {saved && <p className="ide-feedback ide-feedback--ok" role="status"><CheckCircle2 size={16} /><span>Guardadas. Ya aparecen en Mi proyecto.</span></p>}
                </div>
            </header>

            <div className="pla-builder">
                <div className="obj-form">
                    <div className="fas-tabs" role="tablist" aria-label="Conclusiones">
                        {especificos.map((o, i) => (
                            <button key={o} type="button" role="tab" aria-selected={tab === i} onClick={() => setTab(i)}>
                                <span className="fas-num">{i + 1}</span> {capital(o).slice(0, 30)}{o.length > 30 ? '…' : ''}
                            </button>
                        ))}
                        <button type="button" role="tab" aria-selected={actual === 'general'} onClick={() => setTab(n)}><Flag size={15} aria-hidden="true" /> Conclusión general</button>
                        <button type="button" role="tab" aria-selected={actual === 'rec'} onClick={() => setTab(n + 1)}><Lightbulb size={15} aria-hidden="true" /> Recomendaciones</button>
                    </div>

                    {actual === 'esp' && (
                        <div className="input-group pla-part mar-grid">
                            <p className="ide-field-hint mar-pregunta mar-wide">Objetivo específico {tab + 1}: {especificos[tab]}</p>
                            {clean(hallazgos[tab]?.hallazgo) && (
                                <div className="tit-from-idea mar-wide"><span>Tu resultado de este objetivo</span><p>{capital(clean(hallazgos[tab].hallazgo))}.</p></div>
                            )}
                            <label className="mar-campo mar-wide" htmlFor="conc-esp">
                                <span>Conclusión (responde el objetivo, sin citas ni datos nuevos)</span>
                                <textarea id="conc-esp" className="textarea-field" rows={4} value={texto} onChange={(e) => setEsp(tab, e.target.value)} placeholder={`Ej: ${borrador(tab) || 'Se estableció que…'}`} />
                            </label>
                            {!clean(texto) && borrador(tab) && (
                                <button type="button" className="ide-link mar-wide" onClick={() => setEsp(tab, borrador(tab))}><Wand2 size={13} /> Empezar con el objetivo{clean(hallazgos[tab]?.hallazgo) ? ' y tu resultado' : ''}</button>
                            )}
                            {CITA.test(texto) && <small className="obj-warn mar-wide"><AlertTriangle size={13} aria-hidden="true" /> Quita las citas de autores: van en la discusión.</small>}
                            {RECOMIENDA.test(texto) && <small className="obj-warn mar-wide"><AlertTriangle size={13} aria-hidden="true" /> Las recomendaciones van en su propia pestaña.</small>}
                            {ABSOLUTOS.test(texto) && <small className="obj-warn mar-wide"><AlertTriangle size={13} aria-hidden="true" /> Limita la conclusión a tu población; evita «siempre», «todos» o «se demostró».</small>}
                            {countWords(texto) > 120 && <small className="obj-warn mar-wide"><AlertTriangle size={13} aria-hidden="true" /> Es larga ({countWords(texto)} palabras): resume en dos a cuatro oraciones.</small>}
                        </div>
                    )}

                    {actual === 'general' && (
                        <div className="input-group pla-part mar-grid">
                            {pregunta && <div className="tit-from-idea mar-wide"><span>Tu pregunta de investigación</span><p>{pregunta}</p></div>}
                            <label className="mar-campo mar-wide" htmlFor="conc-gen">
                                <span>Conclusión general (responde la pregunta y el objetivo general)</span>
                                <textarea id="conc-gen" className="textarea-field" rows={5} value={f.general} onChange={(e) => { touch(); update({ general: e.target.value }); }} placeholder="Ej: En respuesta a la pregunta de investigación, los factores asociados a la inasistencia son principalmente el olvido de la cita y el costo del transporte, lo que permitió proponer una estrategia de recordatorios" />
                            </label>
                            {!clean(f.general) && pregunta && (
                                <button type="button" className="ide-link mar-wide" onClick={() => { touch(); update({ general: 'En respuesta a la pregunta de investigación, ' }); }}><Wand2 size={13} /> Empezar con «En respuesta a la pregunta de investigación…»</button>
                            )}
                        </div>
                    )}

                    {actual === 'rec' && (
                        <div className="mar-fichas">
                            {f.recomendaciones.map((r, i) => (
                                <div className="input-group pla-part mar-grid" key={i}>
                                    <label className="mar-campo">
                                        <span>A quién</span>
                                        <input className="input-field" value={r.destinatario} onChange={(e) => { touch(); update({ recomendaciones: f.recomendaciones.map((x, k) => (k === i ? { ...x, destinatario: e.target.value } : x)) }); }} placeholder="Ej: la oficina de atención al usuario" list="conc-dest" />
                                    </label>
                                    <label className="mar-campo">
                                        <span>Qué acción concreta</span>
                                        <input className="input-field" value={r.accion} onChange={(e) => { touch(); update({ recomendaciones: f.recomendaciones.map((x, k) => (k === i ? { ...x, accion: e.target.value } : x)) }); }} placeholder="Ej: implementar recordatorios automáticos 48 horas antes de la cita" />
                                    </label>
                                    {f.recomendaciones.length > 1 && <button type="button" className="ide-link" onClick={() => { touch(); update({ recomendaciones: f.recomendaciones.filter((_, k) => k !== i) }); }}><Trash2 size={13} /> Quitar</button>}
                                </div>
                            ))}
                            <datalist id="conc-dest">
                                <option value="la institución" /><option value="los docentes" /><option value="la secretaría de salud" /><option value="la gerencia" /><option value="futuros investigadores" />
                            </datalist>
                            <button type="button" className="ide-btn ide-btn--ghost obj-add" onClick={() => { touch(); update({ recomendaciones: [...f.recomendaciones, { destinatario: '', accion: '' }] }); }}><Plus size={15} /> Agregar recomendación</button>
                            {futuras && !f.recomendaciones.some((r) => /investigador/i.test(r.destinatario)) && (
                                <button type="button" className="ide-link" onClick={() => { touch(); update({ recomendaciones: [...f.recomendaciones.filter((r) => clean(r.accion) || clean(r.destinatario)), { destinatario: 'futuros investigadores', accion: futuras }] }); }}><Wand2 size={13} /> Traer las futuras investigaciones de tu discusión</button>
                            )}
                        </div>
                    )}
                </div>

                <aside className="pla-side" aria-label="Tus conclusiones">
                    <p className="ide-synth-label">Así quedan</p>
                    <div className="pla-preview mar-preview" aria-live="polite">
                        {textos.conclusiones || textos.recomendaciones ? (
                            <>
                                {textos.conclusiones && <section><h4>Conclusiones</h4>{textos.conclusiones.split('\n').filter(Boolean).map((line) => <p key={line}>{line.replace(/^###\s*/, '')}</p>)}</section>}
                                {textos.recomendaciones && <section><h4>Recomendaciones</h4>{textos.recomendaciones.split('\n').map((line) => <p key={line}>{line.replace(/\*\*/g, '').replace(/^- /, '• ')}</p>)}</section>}
                            </>
                        ) : <span className="tit-empty">Escribe la conclusión de cada objetivo y verás aquí tus conclusiones.</span>}
                    </div>
                </aside>
            </div>
        </div>
    );
};

/* ---------- Revisión ---------- */

const checkConclusiones = ({ f, especificos, pregunta }) => {
    const textos = especificos.map((_, i) => clean(f.especificas?.[i]));
    const escritas = textos.filter(Boolean);
    const todo = [...escritas, clean(f.general)].join(' ');
    const recs = (f.recomendaciones || []).filter((r) => clean(r.accion));
    const clavesPregunta = clean(pregunta).toLowerCase().replace(/[¿?]/g, '').split(/\s+/).filter((w) => w.length > 5).slice(0, 6);
    return [
        { id: 'todas', ok: especificos.length > 0 && escritas.length === especificos.length, label: 'Hay una conclusión por objetivo', detail: `${escritas.length} de ${especificos.length} objetivos tienen conclusión.` },
        { id: 'breves', ok: escritas.length > 0 && escritas.every((t) => countWords(t) <= 120), label: 'Son breves', detail: 'Cada conclusión en dos a cuatro oraciones.' },
        { id: 'citas', ok: !CITA.test(todo), label: 'No citan autores', detail: 'Las citas van en la discusión.' },
        { id: 'separadas', ok: !RECOMIENDA.test(todo), label: 'No mezclan recomendaciones', detail: 'Lleva las recomendaciones a su pestaña.' },
        { id: 'prudentes', ok: !ABSOLUTOS.test(todo), label: 'Se limitan a la población estudiada', detail: 'Evita generalizar a todo el país o usar «siempre».' },
        { id: 'general', ok: Boolean(clean(f.general)), label: 'Tiene una conclusión general', detail: 'Escribe la respuesta a tu pregunta de investigación.' },
        { id: 'pregunta', ok: !clean(f.general) || clavesPregunta.length === 0 || clavesPregunta.filter((w) => clean(f.general).toLowerCase().includes(w)).length >= Math.min(2, clavesPregunta.length), label: 'La conclusión general responde la pregunta', detail: pregunta ? `Tu pregunta: ${pregunta}` : '' },
        { id: 'recs', ok: recs.length >= 2, label: 'Tiene al menos dos recomendaciones', detail: `Tiene ${recs.length}.` },
        { id: 'destinatario', ok: recs.length > 0 && recs.every((r) => clean(r.destinatario)), label: 'Cada recomendación dice a quién va dirigida', detail: 'Completa «A quién» en cada recomendación.' },
    ];
};

const CRITERIOS = [
    { label: 'Completas', text: 'Una por objetivo y una general.' },
    { label: 'Fieles', text: 'Basadas en tus resultados, sin citas ni datos nuevos.' },
    { label: 'Prudentes', text: 'Limitadas a tu población.' },
    { label: 'Útiles', text: 'Recomendaciones con destinatario y acción.' },
];

const Revision = ({ intro }) => {
    const s = useConcState();
    const checks = checkConclusiones(s);
    const passed = checks.filter((x) => x.ok).length;
    return (
        <>
            <div className="ide-synth-left">
                {intro}
                <ul className="tit-criteria">
                    {CRITERIOS.map((item) => <li key={item.label}><b>{item.label}</b> {item.text}</li>)}
                </ul>
            </div>
            <div className="ide-panel">
                <h3>Cumple {passed} de {checks.length} criterios</h3>
                <ul className="tit-checks">
                    {checks.map((item) => (
                        <li key={item.id} data-ok={item.ok}>
                            {item.ok ? <CheckCircle2 size={18} aria-hidden="true" /> : <AlertTriangle size={18} aria-hidden="true" />}
                            <span><b>{item.label}</b>{!item.ok && item.detail}</span>
                        </li>
                    ))}
                </ul>
                <p className="ide-hint">Que las conclusiones se sostengan en los datos lo valida tu asesor.</p>
            </div>
        </>
    );
};

/* ---------- Clase ---------- */

const Conclusiones = ({ onNavigate }) => {
    const { data } = useProject();
    const { especificos } = partesObjetivos(data.objetivos);
    const [guardadas] = useProjectField('conclusiones', '');

    const renderSlide = ({ slide, heading, goToSection, sectionMinutes, totalMinutes }) => ({
        portada: (
            <>
                <div>
                    {heading}
                    <p>Las conclusiones cierran la investigación: responden cada objetivo y la pregunta con lo que encontraste. Las recomendaciones proponen qué hacer con ese conocimiento.</p>
                    <p><strong>Al terminar esta clase podrás:</strong></p>
                    <ul className="ide-bullets">
                        <li>Escribir una conclusión por objetivo y una conclusión general.</li>
                        <li>Diferenciar conclusiones de resultados, discusión y recomendaciones.</li>
                        <li>Formular recomendaciones con destinatario y acción.</li>
                    </ul>
                    {especificos.length > 0 && (
                        <div className="tit-from-idea">
                            <span>Tus objetivos específicos</span>
                            {especificos.map((o) => <p key={o}>{o}</p>)}
                        </div>
                    )}
                </div>
                <div className="ide-panel">
                    <h3>Plan de la clase · {totalMinutes} minutos</h3>
                    <ol className="ide-agenda">
                        {SECTIONS.map((section) => (
                            <li key={section.id}>
                                <button type="button" onClick={() => goToSection(section.id)}>
                                    <span>{section.label}</span>
                                    <small>{SLIDES.filter((item) => item.section === section.id).map((item) => item.title).join(' · ')}</small>
                                    <b>{sectionMinutes(section.id)} min</b>
                                </button>
                            </li>
                        ))}
                    </ol>
                </div>
            </>
        ),
        construye: (
            <Constructor
                onNavigate={onNavigate}
                intro={(
                    <>
                        {heading}
                        <p>Escribe una conclusión por objetivo (tu resultado aparece como referencia), la conclusión general y tus recomendaciones.</p>
                    </>
                )}
            />
        ),
        revision: (
            <Revision
                intro={(
                    <>
                        {heading}
                        <p>Último paso: revisa tus conclusiones y recomendaciones antes de llevarlas a tu asesor.</p>
                    </>
                )}
            />
        ),
    })[slide.id] || (
        <Generica
            slide={slide}
            heading={heading}
            onNavigate={onNavigate}
            aside={slide.status ? (
                <div className="ide-panel">
                    <h3>Siguiente paso</h3>
                    {String(guardadas || '').trim()
                        ? <div className="tit-saved"><span>Tus conclusiones guardadas</span><p>{countWords(guardadas)} palabras</p></div>
                        : <p>En la construcción tendrás una pestaña por objetivo, con tu resultado como referencia.</p>}
                </div>
            ) : null}
        />
    );

    return (
        <SlideDeck
            sections={SECTIONS}
            slides={SLIDES}
            storageKey={SLIDE_KEY}
            label="Conclusiones"
            renderSlide={renderSlide}
            finish={onNavigate ? { label: 'Escribir la introducción', onClick: () => onNavigate('introduccion') } : null}
        />
    );
};

export default Conclusiones;
