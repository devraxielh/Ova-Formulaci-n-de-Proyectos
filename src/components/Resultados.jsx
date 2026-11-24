import React, { useState } from 'react';
import { AlertTriangle, BarChart3, CheckCircle2, MessageSquareText } from 'lucide-react';
import SlideDeck from './deck/SlideDeck';
import { Generica } from './deck/Contenido';
import { useProject, useProjectField } from '../context/ProjectContext';
import { useAutoGuardar } from '../hooks/useAutoGuardar';
import { partesObjetivos } from '../services/coherencia';
import { SECTIONS, SLIDES } from '../data/resultadosClase';
import './Titulo.css';
import './Planteamiento.css';
import './Objetivos.css';
import './Justificacion.css';
import './Marco.css';
import './Alcances.css';
import './Fases.css';

const SLIDE_KEY = 'projectsia:resultados:diapositiva';

const clean = (text) => String(text || '').trim().replace(/[\s.,;:]+$/, '');
const lower = (text) => (text ? text.charAt(0).toLowerCase() + text.slice(1) : '');
const capital = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : '');
const countWords = (text) => String(text || '').trim().split(/\s+/).filter(Boolean).length;

const VACIO = {
    hallazgo: '', datos: '', apoyoTipo: 'Tabla', apoyoTitulo: '', apoyoNota: '',
    interpretacion: '', antecedente: '', relacion: 'coincide con', explicacion: '', teoria: '', teoriaExplica: '', implicacion: '',
};
const RELACIONES = ['coincide con', 'difiere de', 'amplía lo reportado por'];
const OPINIONES = /\b(increíble|muy grave|lamentablemente|obviamente|claramente|por suerte|pereza)\b/i;
const ABSOLUTOS = /\b(se demostró|demuestra que|prueba que|definitivamente|siempre|nunca|todos los)\b/i;
const PASADO = /\b(se encontró|se observó|se identificó|fue|fueron|presentó|presentaron|obtuvo|obtuvieron|mostró|mostraron|reportó|reportaron|tuvo|tuvieron|alcanzó|registró|indicó|señalaron|\w+ó|\w+aron|\w+ieron)\b/i;

const citaDe = (item) => (item ? `${clean(item.autor)} (${clean(item.anio) || 's. f.'})` : '');

/* ---------- Redacción ---------- */

const redactar = (form, especificos, antecedentes, teorias) => {
    const contador = { Tabla: 0, Figura: 0 };
    const res = [];
    const dis = [];
    especificos.forEach((objetivo, i) => {
        const r = { ...VACIO, ...(form.porObjetivo?.[i] || {}) };
        const partes = [];
        if (clean(r.hallazgo)) partes.push(`${capital(clean(r.hallazgo))}.`);
        if (clean(r.datos)) partes.push(`${capital(clean(r.datos))}.`);
        let apoyo = '';
        if (clean(r.apoyoTitulo) && r.apoyoTipo) {
            contador[r.apoyoTipo] += 1;
            apoyo = `\n**${r.apoyoTipo} ${contador[r.apoyoTipo]}.** ${capital(clean(r.apoyoTitulo))}${clean(r.apoyoNota) ? `\nNota. ${capital(clean(r.apoyoNota))}.` : ''}`;
        }
        if (partes.length || apoyo) res.push(`### Objetivo específico ${i + 1}: ${lower(clean(objetivo))}\n${partes.join(' ')}${apoyo}`);

        const ant = antecedentes.find((a) => citaDe(a) === r.antecedente);
        const teo = teorias.find((t) => clean(t.nombre) === r.teoria);
        const d = [];
        if (clean(r.interpretacion)) d.push(`${capital(clean(r.interpretacion))}.`);
        if (ant || clean(r.antecedente)) d.push(`Este hallazgo ${r.relacion} ${ant ? citaDe(ant) : clean(r.antecedente)}${clean(r.explicacion) ? `; ${lower(clean(r.explicacion))}` : ''}.`);
        if (teo || clean(r.teoria)) d.push(`Desde ${teo ? `${lower(clean(teo.nombre))} (${clean(teo.autor)}, ${clean(teo.anio) || 's. f.'})` : clean(r.teoria)}, ${lower(clean(r.teoriaExplica)) || 'este resultado se explica por los postulados presentados en el marco teórico'}.`);
        if (clean(r.implicacion)) d.push(`${capital(clean(r.implicacion))}.`);
        if (d.length) dis.push(`En cuanto al objetivo específico ${i + 1}, ${lower(d.join(' '))}`);
    });
    if (clean(form.limitaciones)) dis.push(`### Limitaciones\n${capital(clean(form.limitaciones))}.`);
    if (clean(form.futuras)) dis.push(`### Futuras investigaciones\n${capital(clean(form.futuras))}.`);
    return { resultados: res.join('\n\n'), discusion: dis.join('\n\n') };
};

/* ---------- Estado ---------- */

const useResState = () => {
    const { data } = useProject();
    const [form, setForm] = useProjectField('resultadosForm', { porObjetivo: {}, limitaciones: '', futuras: '' });
    const [, setResultados] = useProjectField('resultados', '');
    const [, setDiscusion] = useProjectField('discusion', '');
    const f = { porObjetivo: {}, limitaciones: '', futuras: '', ...(form || {}) };
    const update = (patch) => setForm((prev) => ({ porObjetivo: {}, limitaciones: '', futuras: '', ...(prev || {}), ...patch }));
    const { especificos } = partesObjetivos(data.objetivos);
    const marco = data.marcoForm || {};
    const antecedentes = (marco.antecedentes || []).filter((a) => clean(a.autor));
    const teorias = (marco.teorias || []).filter((t) => clean(t.nombre));
    const limitacionesAlcances = String(data.limitaciones || '').split('\n').map((l) => l.replace(/^\d+\.\s*/, '').split('. Para reducir')[0].trim()).filter(Boolean).join(' ');
    return {
        f, update, setResultados, setDiscusion,
        especificos: especificos.map((o) => o.replace(/\.$/, '')), antecedentes, teorias, limitacionesAlcances,
    };
};

/* ---------- Constructor ---------- */

const Campo = ({ id, label, value, onChange, placeholder, rows = 1, className = '' }) => (
    <label className={`mar-campo ${className}`} htmlFor={id}>
        <span>{label}</span>
        {rows > 1
            ? <textarea id={id} className="textarea-field" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
            : <input id={id} className="input-field" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />}
    </label>
);

const Constructor = ({ intro, onNavigate }) => {
    const { f, update, setResultados, setDiscusion, especificos, antecedentes, teorias, limitacionesAlcances } = useResState();
    const [tab, setTab] = useState(0);
    const [saved, setSaved] = useState(false);
    const touch = () => setSaved(false);
    const cierre = tab === especificos.length;
    const r = { ...VACIO, ...(f.porObjetivo?.[tab] || {}) };
    const setR = (patch) => { touch(); update({ porObjetivo: { ...f.porObjetivo, [tab]: { ...r, ...patch } } }); };
    const textos = redactar(f, especificos, antecedentes, teorias);
    const save = () => {
        setResultados(textos.resultados);
        setDiscusion(textos.discusion);
        setSaved(true);
    };
    // Guardado automático: lo redactado pasa a Mi proyecto sin tener que tocar «Guardar».
    useAutoGuardar(textos.resultados || textos.discusion ? JSON.stringify(textos) : '', save);
    const listos = especificos.filter((_, i) => clean(f.porObjetivo?.[i]?.hallazgo)).length;

    if (especificos.length === 0) {
        return (
            <div className="pla-builder-wrap">
                <div>{intro}</div>
                <p className="obj-warn"><AlertTriangle size={15} aria-hidden="true" /> Primero guarda tus objetivos específicos: los resultados y la discusión se organizan por objetivo.</p>
                {onNavigate && <button type="button" className="ide-btn ide-btn--primary" onClick={() => onNavigate('objetivos')}>Ir a Objetivos</button>}
            </div>
        );
    }

    return (
        <div className="pla-builder-wrap">
            <header className="pla-builder-head">
                <div>{intro}</div>
                <div className="pla-status">
                    <p className="obj-count"><b>{listos} de {especificos.length} objetivos con resultados</b> · {countWords(textos.resultados) + countWords(textos.discusion)} palabras</p>
                    <button type="button" className="ide-btn ide-btn--primary" disabled={!textos.resultados && !textos.discusion} onClick={save}>
                        <CheckCircle2 size={17} /> Guardar resultados y discusión
                    </button>
                    {saved && <p className="ide-feedback ide-feedback--ok" role="status"><CheckCircle2 size={16} /><span>Guardados. Ya aparecen en Mi proyecto.</span></p>}
                </div>
            </header>

            <div className="pla-builder">
                <div className="obj-form">
                    <div className="fas-tabs" role="tablist" aria-label="Objetivos específicos">
                        {especificos.map((o, i) => (
                            <button key={o} type="button" role="tab" aria-selected={tab === i} onClick={() => setTab(i)}>
                                <span className="fas-num">{i + 1}</span> {capital(o).slice(0, 32)}{o.length > 32 ? '…' : ''}
                            </button>
                        ))}
                        <button type="button" role="tab" aria-selected={cierre} onClick={() => setTab(especificos.length)}>
                            <MessageSquareText size={15} aria-hidden="true" /> Cierre de la discusión
                        </button>
                    </div>

                    {!cierre ? (
                        <>
                            <p className="ide-field-hint mar-pregunta">Objetivo específico {tab + 1}: {especificos[tab]}</p>
                            <div className="input-group pla-part mar-grid">
                                <h3 className="alc-block-title mar-wide"><BarChart3 size={17} aria-hidden="true" /> Resultados (qué encontraste, en pasado)</h3>
                                <Campo className="mar-wide" id="res-hal" label="Hallazgo principal" rows={2} value={r.hallazgo} onChange={(v) => setR({ hallazgo: v })} placeholder="Ej: El olvido fue la causa más frecuente de inasistencia (41,0 %), seguido del costo del transporte (21,9 %)" />
                                <Campo className="mar-wide" id="res-dat" label="Otros datos o resultado de la prueba" rows={2} value={r.datos} onChange={(v) => setR({ datos: v })} placeholder="Ej: Se encontró una relación positiva moderada entre el olvido y la inasistencia (rho = 0,41; p < 0,001)" />
                                <label className="mar-campo">
                                    <span>Apoyo visual</span>
                                    <select className="input-field" value={r.apoyoTipo} onChange={(e) => setR({ apoyoTipo: e.target.value })}>
                                        <option value="Tabla">Tabla</option>
                                        <option value="Figura">Figura</option>
                                        <option value="">Ninguno</option>
                                    </select>
                                </label>
                                {r.apoyoTipo && <Campo id="res-tit" label={`Título de la ${r.apoyoTipo.toLowerCase()}`} value={r.apoyoTitulo} onChange={(v) => setR({ apoyoTitulo: v })} placeholder="Ej: Causas de inasistencia reportadas (n = 278)" />}
                                {r.apoyoTipo && <Campo className="mar-wide" id="res-nota" label="Nota (fuente o abreviaturas)" value={r.apoyoNota} onChange={(v) => setR({ apoyoNota: v })} placeholder="Ej: elaboración propia a partir de la encuesta aplicada" />}
                                {clean(r.hallazgo) && !PASADO.test(r.hallazgo) && <small className="obj-warn mar-wide"><AlertTriangle size={13} aria-hidden="true" /> Escribe el hallazgo en pasado: «fue», «se encontró», «presentaron».</small>}
                                {OPINIONES.test(`${r.hallazgo} ${r.datos}`) && <small className="obj-warn mar-wide"><AlertTriangle size={13} aria-hidden="true" /> Evita opiniones en los resultados: déjalas para la discusión, con evidencia.</small>}
                            </div>

                            <div className="input-group pla-part mar-grid">
                                <h3 className="alc-block-title mar-wide"><MessageSquareText size={17} aria-hidden="true" /> Discusión (qué significa)</h3>
                                <Campo className="mar-wide" id="dis-int" label="Interpretación" rows={2} value={r.interpretacion} onChange={(v) => setR({ interpretacion: v })} placeholder="Ej: Esto sugiere que la inasistencia depende en buena medida de la organización de la cita" />
                                <label className="mar-campo">
                                    <span>Este hallazgo…</span>
                                    <select className="input-field" value={r.relacion} onChange={(e) => setR({ relacion: e.target.value })}>
                                        {RELACIONES.map((x) => <option key={x}>{x}</option>)}
                                    </select>
                                </label>
                                {antecedentes.length ? (
                                    <label className="mar-campo">
                                        <span>Antecedente (de tu marco)</span>
                                        <select className="input-field" value={r.antecedente} onChange={(e) => setR({ antecedente: e.target.value })}>
                                            <option value="">Elige…</option>
                                            {antecedentes.map((a) => <option key={citaDe(a)} value={citaDe(a)}>{citaDe(a)}{clean(a.lugar) ? ` · ${clean(a.lugar)}` : ''}</option>)}
                                        </select>
                                    </label>
                                ) : (
                                    <Campo id="dis-ant" label="Antecedente: Autor (año)" value={r.antecedente} onChange={(v) => setR({ antecedente: v })} placeholder="Ej: Pérez y Gómez (2022)" />
                                )}
                                <Campo className="mar-wide" id="dis-exp" label="Qué encontró ese autor y por qué coincide o difiere" rows={2} value={r.explicacion} onChange={(v) => setR({ explicacion: v })} placeholder="Ej: quienes reportaron que el olvido explicó el 41 % de las citas perdidas en Bogotá" />
                                {teorias.length ? (
                                    <label className="mar-campo">
                                        <span>Teoría (de tu marco)</span>
                                        <select className="input-field" value={r.teoria} onChange={(e) => setR({ teoria: e.target.value })}>
                                            <option value="">Elige…</option>
                                            {teorias.map((t) => <option key={t.nombre} value={clean(t.nombre)}>{capital(clean(t.nombre))}</option>)}
                                        </select>
                                    </label>
                                ) : (
                                    <Campo id="dis-teo" label="Teoría" value={r.teoria} onChange={(v) => setR({ teoria: v })} placeholder="Ej: el modelo de creencias en salud (Rosenstock, 1974)" />
                                )}
                                <Campo id="dis-teox" label="Cómo explica la teoría el hallazgo" value={r.teoriaExplica} onChange={(v) => setR({ teoriaExplica: v })} placeholder="Ej: la falta de recordatorios equivale a la ausencia de señales para la acción" />
                                <Campo className="mar-wide" id="dis-imp" label="Implicación" rows={2} value={r.implicacion} onChange={(v) => setR({ implicacion: v })} placeholder="Ej: Implementar recordatorios automáticos podría reducir la inasistencia" />
                                {ABSOLUTOS.test(`${r.interpretacion} ${r.implicacion}`) && <small className="obj-warn mar-wide"><AlertTriangle size={13} aria-hidden="true" /> Usa lenguaje prudente: «sugiere», «podría», «en esta población».</small>}
                            </div>
                        </>
                    ) : (
                        <div className="input-group pla-part mar-grid">
                            <Campo className="mar-wide" id="dis-lim" label="Limitaciones del estudio" rows={4} value={f.limitaciones} onChange={(v) => { touch(); update({ limitaciones: v }); }} placeholder={limitacionesAlcances ? `Ej: ${limitacionesAlcances}` : 'Ej: los datos se obtuvieron por autorreporte y la muestra provino de un solo hospital, lo que limita la generalización'} />
                            {limitacionesAlcances && !clean(f.limitaciones) && (
                                <button type="button" className="ide-link mar-wide" onClick={() => { touch(); update({ limitaciones: limitacionesAlcances }); }}>Traer las limitaciones de mis Alcances</button>
                            )}
                            <Campo className="mar-wide" id="dis-fut" label="Futuras investigaciones" rows={3} value={f.futuras} onChange={(v) => { touch(); update({ futuras: v }); }} placeholder="Ej: se recomienda evaluar el efecto de los recordatorios con un diseño cuasiexperimental e incluir otros hospitales de la región" />
                        </div>
                    )}
                    {antecedentes.length === 0 && <p className="ide-hint">Si completas los antecedentes y teorías del Marco Referencial, aquí podrás elegirlos de una lista.</p>}
                </div>

                <aside className="pla-side" aria-label="Tus resultados y tu discusión">
                    <p className="ide-synth-label">Así quedan</p>
                    <div className="pla-preview mar-preview" aria-live="polite">
                        {textos.resultados || textos.discusion ? (
                            <>
                                {textos.resultados && <section><h4>Resultados</h4>{textos.resultados.split('\n').filter(Boolean).map((line) => <p key={line}>{line.replace(/^###\s*/, '').replace(/\*\*/g, '')}</p>)}</section>}
                                {textos.discusion && <section><h4>Discusión</h4>{textos.discusion.split('\n').filter(Boolean).map((line) => <p key={line}>{line.replace(/^###\s*/, '')}</p>)}</section>}
                            </>
                        ) : <span className="tit-empty">Completa el hallazgo de cada objetivo y verás aquí tus resultados y tu discusión.</span>}
                    </div>
                </aside>
            </div>
        </div>
    );
};

/* ---------- Revisión ---------- */

const checkResultados = ({ f, especificos, antecedentes }) => {
    const filas = especificos.map((_, i) => ({ ...VACIO, ...(f.porObjetivo?.[i] || {}) }));
    const conHallazgo = filas.filter((r) => clean(r.hallazgo));
    return [
        { id: 'todos', ok: especificos.length > 0 && conHallazgo.length === especificos.length, label: 'Cada objetivo tiene sus resultados', detail: `${conHallazgo.length} de ${especificos.length} objetivos tienen hallazgo.` },
        { id: 'datos', ok: conHallazgo.length > 0 && conHallazgo.every((r) => /\d/.test(`${r.hallazgo} ${r.datos}`)), label: 'Los resultados tienen datos', detail: 'Incluye cifras, porcentajes o el resultado de la prueba (o, en lo cualitativo, cuántos participantes lo mencionaron).' },
        { id: 'pasado', ok: conHallazgo.length > 0 && conHallazgo.every((r) => PASADO.test(r.hallazgo)), label: 'Los resultados están en pasado', detail: '«El olvido fue…», «se encontró…».' },
        { id: 'apoyo', ok: filas.some((r) => r.apoyoTipo && clean(r.apoyoTitulo)) && filas.every((r) => !r.apoyoTipo || !clean(r.apoyoTitulo) || clean(r.apoyoTitulo).length > 8), label: 'Hay tablas o figuras con título', detail: 'Agrega al menos una tabla o figura numerada con su título.' },
        { id: 'opiniones', ok: !filas.some((r) => OPINIONES.test(`${r.hallazgo} ${r.datos}`)), label: 'Los resultados no tienen opiniones', detail: 'Deja la interpretación para la discusión.' },
        { id: 'interpreta', ok: conHallazgo.length > 0 && conHallazgo.every((r) => clean(r.interpretacion)), label: 'Cada hallazgo se interpreta', detail: 'Di qué significa cada resultado.' },
        { id: 'antecedentes', ok: conHallazgo.length > 0 && conHallazgo.every((r) => clean(r.antecedente)), label: 'Cada hallazgo se compara con un antecedente', detail: antecedentes.length ? 'Elige un antecedente de tu marco para cada objetivo.' : 'Escribe Autor (año) del estudio con el que comparas.' },
        { id: 'teoria', ok: filas.some((r) => clean(r.teoria)), label: 'La discusión vuelve a la teoría', detail: 'Explica al menos un hallazgo con tu marco teórico.' },
        { id: 'implicaciones', ok: filas.some((r) => clean(r.implicacion)), label: 'Señala implicaciones', detail: 'Di qué se puede hacer con lo encontrado.' },
        { id: 'prudente', ok: !filas.some((r) => ABSOLUTOS.test(`${r.interpretacion} ${r.implicacion}`)), label: 'Usa lenguaje prudente', detail: 'Cambia «se demostró» o «siempre» por «sugiere» o «en esta población».' },
        { id: 'limites', ok: Boolean(clean(f.limitaciones)) && Boolean(clean(f.futuras)), label: 'Cierra con limitaciones y futuras investigaciones', detail: 'Completa la pestaña «Cierre de la discusión».' },
    ];
};

const CRITERIOS = [
    { label: 'Ordenados', text: 'Un apartado de resultados por objetivo, en pasado.' },
    { label: 'Con evidencia', text: 'Datos, tablas y figuras numeradas.' },
    { label: 'Discutidos', text: 'Interpretación, antecedentes, teoría e implicaciones.' },
    { label: 'Prudentes', text: 'Sin exagerar y con sus limitaciones.' },
];

const Revision = ({ intro }) => {
    const s = useResState();
    const checks = checkResultados(s);
    const passed = checks.filter((x) => x.ok).length;
    return (
        <>
            <div className="ide-synth-left">
                {intro}
                <ul className="tit-criteria">
                    {CRITERIOS.map((item) => <li key={item.label}><b>{item.label}</b> {item.text}</li>)}
                </ul>
                <p className="ide-hint">La revisión se hace sobre lo que construiste.</p>
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
                <p className="ide-hint">Que los datos sean correctos y la interpretación sólida lo valida tu asesor.</p>
            </div>
        </>
    );
};

/* ---------- Clase ---------- */

const Resultados = ({ onNavigate }) => {
    const { data } = useProject();
    const { especificos } = partesObjetivos(data.objetivos);
    const [guardados] = useProjectField('resultados', '');

    const renderSlide = ({ slide, heading, goToSection, sectionMinutes, totalMinutes }) => ({
        portada: (
            <>
                <div>
                    {heading}
                    <p>Los resultados presentan lo que encontraste; la discusión explica qué significa, cómo se compara con otros estudios y para qué sirve. Juntos son el corazón del informe final.</p>
                    <p><strong>Al terminar esta clase podrás:</strong></p>
                    <ul className="ide-bullets">
                        <li>Organizar los resultados por objetivo específico.</li>
                        <li>Presentar tablas, figuras y estadísticos en APA 7.</li>
                        <li>Discutir cada hallazgo con antecedentes y teorías.</li>
                        <li>Escribir implicaciones, limitaciones y futuras investigaciones.</li>
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
                        <p>Completa una pestaña por objetivo: arriba los resultados, abajo su discusión. Los antecedentes y teorías de tu Marco Referencial aparecen en listas para elegirlos. Termina en «Cierre de la discusión».</p>
                    </>
                )}
            />
        ),
        revision: (
            <Revision
                intro={(
                    <>
                        {heading}
                        <p>Último paso: revisa tus resultados y tu discusión antes de llevarlos a tu asesor.</p>
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
                    {String(guardados || '').trim()
                        ? <div className="tit-saved"><span>Tus resultados guardados</span><p>{countWords(guardados)} palabras</p></div>
                        : <p>En la construcción tendrás una pestaña por cada objetivo específico, con tus antecedentes y teorías listos para elegir.</p>}
                </div>
            ) : null}
        />
    );

    return (
        <SlideDeck
            sections={SECTIONS}
            slides={SLIDES}
            storageKey={SLIDE_KEY}
            label="Resultados y discusión"
            renderSlide={renderSlide}
            finish={onNavigate ? { label: 'Escribir las conclusiones', onClick: () => onNavigate('conclusiones') } : null}
        />
    );
};

export default Resultados;
