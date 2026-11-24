import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, ArrowDown, ArrowUp, CalendarDays, CheckCircle2, Plus, Target, Trash2 } from 'lucide-react';
import SlideDeck from './deck/SlideDeck';
import { Generica } from './deck/Contenido';
import { useProject, useProjectField } from '../context/ProjectContext';
import { useAutoGuardar } from '../hooks/useAutoGuardar';
import { partesObjetivos } from '../services/coherencia';
import { INFINITIVO } from '../data/ejemplos';
import { nivelDe } from '../data/nivelesVerbos';
import { SECTIONS, SLIDES } from '../data/fasesClase';
import './Titulo.css';
import './Planteamiento.css';
import './Objetivos.css';
import './Justificacion.css';
import './Marco.css';
import './Fases.css';

const SLIDE_KEY = 'projectsia:fases:diapositiva';

const clean = (text) => String(text || '').trim().replace(/[\s.,;:]+$/, '');
const lower = (text) => (text ? text.charAt(0).toLowerCase() + text.slice(1) : '');
const capital = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : '');
const uid = () => Math.random().toString(36).slice(2, 10);
const isInfinitive = (word) => /^[a-záéíóúñ]+(ar|er|ir)$/i.test(word || '');

// «Caracterizar la inasistencia…» → «Caracterización de la inasistencia…».
const SUSTANTIVO = Object.fromEntries(Object.entries(INFINITIVO).map(([s, v]) => [v.toLowerCase(), s]));
const nombreDesdeObjetivo = (objetivo) => {
    const t = clean(objetivo);
    const [verbo, ...resto] = t.split(/\s+/);
    const sust = SUSTANTIVO[String(verbo || '').toLowerCase()];
    if (!sust) return t.split(/\s+/).slice(0, 6).join(' ');
    const frase = resto.join(' ');
    const conDe = /^(el|los)\s/i.test(frase) ? `de${frase.toLowerCase().startsWith('el ') ? 'l' + frase.slice(2) : ` ${frase}`}` : `de ${frase}`;
    return `${sust} ${conDe}`.split(/\s+/).slice(0, 9).join(' ');
};

// Actividades sugeridas según el nivel del verbo del objetivo.
const actividadesSugeridas = (objetivo) => {
    const n = nivelDe(objetivo);
    if (n <= 2) return ['Diseñar y validar el instrumento de recolección', 'Aplicar el instrumento a la muestra', 'Organizar los datos en una base', 'Describir los resultados con tablas y gráficos'];
    if (n <= 4) return ['Depurar la base de datos', 'Aplicar las técnicas de análisis definidas en la metodología', 'Interpretar los resultados frente a los antecedentes', 'Redactar el informe de resultados de la fase'];
    if (n === 5) return ['Definir los criterios de evaluación', 'Aplicar los instrumentos de evaluación', 'Comparar los resultados con la línea base', 'Redactar el informe de evaluación'];
    return ['Definir los componentes de la propuesta a partir de los resultados', 'Diseñar la propuesta', 'Validar la propuesta con expertos o usuarios', 'Ajustar la propuesta según la validación'];
};

const productoSugerido = (objetivo) => {
    const n = nivelDe(objetivo);
    if (n <= 2) return 'Informe de caracterización con tablas y gráficos';
    if (n <= 4) return 'Informe de resultados con las pruebas de análisis';
    if (n === 5) return 'Informe de evaluación';
    return 'Propuesta validada (documento o prototipo)';
};

const FASE_VACIA = () => ({ id: uid(), nombre: '', objetivo: '', descripcion: '', actividades: [''], tecnicas: '', productos: '', duracion: 4, responsable: '' });

const redactarFases = (fases, unidad) => fases
    .filter((f) => clean(f.nombre))
    .map((f, i) => [
        `### Fase ${i + 1}. ${capital(clean(f.nombre))}`,
        clean(f.objetivo) ? `**Objetivo:** ${capital(clean(f.objetivo))}.` : '',
        clean(f.descripcion) ? `${capital(clean(f.descripcion))}.` : '',
        f.actividades.some((a) => clean(a)) ? '**Actividades:**' : '',
        ...f.actividades.filter((a) => clean(a)).map((a) => `- ${capital(clean(a))}.`),
        '',
        clean(f.tecnicas) ? `**Técnicas y herramientas:** ${clean(f.tecnicas)}.` : '',
        clean(f.productos) ? `**Producto:** ${capital(clean(f.productos))}.` : '',
        `**Duración:** ${Number(f.duracion) || 0} ${unidad === 'meses' ? 'meses' : 'semanas'}${clean(f.responsable) ? ` · **Responsable:** ${clean(f.responsable)}` : ''}.`,
    ].filter((line, k, arr) => line !== '' || arr[k - 1] !== '').join('\n'))
    .join('\n\n');

/* ---------- Estado ---------- */

const useFasesState = () => {
    const { data } = useProject();
    const [form, setForm] = useProjectField('fasesForm', { unidad: 'semanas', fases: [] });
    const [, setFasesTexto] = useProjectField('fases', '');
    const [metForm, setMetForm] = useProjectField('metodologiaForm', null);
    const [, setCronoItems] = useProjectField('cronogramaItems', []);
    const [, setUnidadGantt] = useProjectField('ganttUnidad', 'mensual');
    const [, setPeriodos] = useProjectField('ganttPeriodos', 6);
    const f = { unidad: 'semanas', fases: [], ...(form || {}) };
    if (!Array.isArray(f.fases)) f.fases = [];
    const update = (patch) => setForm((prev) => ({ unidad: 'semanas', fases: [], ...(prev || {}), ...patch }));
    const { especificos } = partesObjetivos(data.objetivos);
    return { data, f, update, setFasesTexto, metForm, setMetForm, setCronoItems, setUnidadGantt, setPeriodos, especificos: especificos.map((o) => o.replace(/\.$/, '')) };
};

/* ---------- Constructor ---------- */

const Constructor = ({ intro, onNavigate }) => {
    const { f, update, setFasesTexto, metForm, setMetForm, setCronoItems, setUnidadGantt, setPeriodos, especificos } = useFasesState();
    const [saved, setSaved] = useState('');
    const [active, setActive] = useState(0);
    const prefilled = useRef(false);
    const fases = f.fases;
    const touch = () => setSaved('');
    const setFases = (next) => { touch(); update({ fases: next }); };
    const setFase = (i, patch) => setFases(fases.map((x, k) => (k === i ? { ...x, ...patch } : x)));

    // La primera vez: una fase por objetivo específico, con actividades y producto sugeridos.
    useEffect(() => {
        if (prefilled.current) return;
        prefilled.current = true;
        if (fases.length === 0 && especificos.length) {
            update({
                fases: especificos.map((objetivo) => ({
                    ...FASE_VACIA(),
                    nombre: nombreDesdeObjetivo(objetivo),
                    objetivo,
                    actividades: actividadesSugeridas(objetivo),
                    productos: productoSugerido(objetivo),
                    duracion: 4,
                })),
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const total = fases.reduce((sum, x) => sum + (Number(x.duracion) || 0), 0);
    const texto = redactarFases(fases, f.unidad);
    const fase = fases[Math.min(active, fases.length - 1)];
    const ai = Math.min(active, fases.length - 1);
    const mover = (i, dir) => {
        const j = i + dir;
        if (j < 0 || j >= fases.length) return;
        const next = [...fases];
        [next[i], next[j]] = [next[j], next[i]];
        setFases(next);
        setActive(j);
    };
    const save = () => {
        setFasesTexto(texto);
        setSaved('fases');
    };
    // Guardado automático: lo redactado pasa a Mi proyecto sin tener que tocar «Guardar».
    useAutoGuardar(texto, save);
    // Pasa las actividades al cronograma de la Metodología, una tras otra según la duración de cada fase.
    const alCronograma = () => {
        let inicio = 1;
        const filas = [];
        fases.filter((x) => clean(x.nombre)).forEach((x, i) => {
            const dur = Math.max(1, Number(x.duracion) || 1);
            const fin = inicio + dur - 1;
            x.actividades.filter((a) => clean(a)).forEach((a) => filas.push({ id: uid(), fase: `Fase ${i + 1}. ${capital(clean(x.nombre))}`.slice(0, 60), actividad: capital(clean(a)), inicio, fin }));
            inicio = fin + 1;
        });
        setMetForm({ ...(metForm || {}), cronograma: filas });
        setCronoItems(filas.map(({ fase: nombre, actividad, inicio: a, fin: b }) => ({ fase: nombre, actividad, inicio: a, fin: b })));
        setUnidadGantt(f.unidad === 'meses' ? 'mensual' : 'semanal');
        setPeriodos(Math.min(52, total));
        setFasesTexto(texto);
        setSaved('crono');
    };

    return (
        <div className="pla-builder-wrap">
            <header className="pla-builder-head">
                <div>{intro}</div>
                <div className="pla-status">
                    <p className="obj-count"><b>{fases.length} {fases.length === 1 ? 'fase' : 'fases'}</b> · {total} {f.unidad} en total</p>
                    <button type="button" className="ide-btn ide-btn--primary" disabled={!texto} onClick={save}>
                        <CheckCircle2 size={17} /> Guardar mis fases
                    </button>
                    <button type="button" className="ide-btn ide-btn--ghost" disabled={!texto} onClick={alCronograma}>
                        <CalendarDays size={16} /> Guardar y llevar al cronograma
                    </button>
                    {saved === 'fases' && <p className="ide-feedback ide-feedback--ok" role="status"><CheckCircle2 size={16} /><span>Guardadas. Ya aparecen en Mi proyecto.</span></p>}
                    {saved === 'crono' && (
                        <p className="ide-feedback ide-feedback--ok" role="status">
                            <CheckCircle2 size={16} />
                            <span>Guardadas y llevadas al cronograma de la Metodología ({total} {f.unidad}).{onNavigate && <> <button type="button" className="ide-link" onClick={() => onNavigate('metodologia')}>Ver la Metodología</button></>}</span>
                        </p>
                    )}
                </div>
            </header>

            <div className="pla-builder">
                <div className="obj-form">
                    <div className="fas-toolbar">
                        <label className="mar-campo">
                            <span>Unidad de tiempo</span>
                            <select className="input-field" value={f.unidad} onChange={(e) => { touch(); update({ unidad: e.target.value }); }}>
                                <option value="semanas">Semanas</option>
                                <option value="meses">Meses</option>
                            </select>
                        </label>
                        {especificos.length === 0 && <p className="obj-warn"><AlertTriangle size={14} aria-hidden="true" /> Guarda tus objetivos específicos para crear una fase por objetivo.</p>}
                    </div>

                    <div className="fas-tabs" role="tablist" aria-label="Fases del proyecto">
                        {fases.map((x, i) => (
                            <button key={x.id} type="button" role="tab" aria-selected={i === ai} onClick={() => setActive(i)}>
                                <span className="fas-num">{i + 1}</span> {clean(x.nombre) ? capital(clean(x.nombre)).slice(0, 34) : 'Fase sin nombre'}
                            </button>
                        ))}
                        <button type="button" className="fas-add" onClick={() => { setFases([...fases, FASE_VACIA()]); setActive(fases.length); }}><Plus size={15} /> Fase</button>
                    </div>

                    {fase ? (
                        <div className="input-group pla-part mar-grid" key={fase.id}>
                            <label className="mar-campo mar-wide">
                                <span>Nombre de la fase</span>
                                <input className="input-field" value={fase.nombre} onChange={(e) => setFase(ai, { nombre: e.target.value })} placeholder="Ej: Caracterización de la inasistencia" />
                            </label>
                            <label className="mar-campo mar-wide">
                                <span>Objetivo específico que cumple</span>
                                <select className="input-field" value={fase.objetivo} onChange={(e) => {
                                    const objetivo = e.target.value;
                                    const patch = { objetivo };
                                    if (!clean(fase.nombre)) patch.nombre = nombreDesdeObjetivo(objetivo);
                                    if (!fase.actividades.some((a) => clean(a))) patch.actividades = actividadesSugeridas(objetivo);
                                    if (!clean(fase.productos)) patch.productos = productoSugerido(objetivo);
                                    setFase(ai, patch);
                                }}>
                                    <option value="">Elige…</option>
                                    {especificos.map((o, k) => <option key={o} value={o}>{k + 1}. {o}</option>)}
                                    <option value="Socializar los resultados del proyecto">Fase de cierre: socializar los resultados</option>
                                </select>
                            </label>
                            <label className="mar-campo mar-wide">
                                <span>Descripción breve (opcional)</span>
                                <textarea className="textarea-field" rows={2} value={fase.descripcion} onChange={(e) => setFase(ai, { descripcion: e.target.value })} placeholder="Ej: En esta fase se describe la situación actual de la inasistencia a partir de los registros del hospital" />
                            </label>

                            <div className="mar-campo mar-wide">
                                <span>Actividades (en orden, con verbo en infinitivo)</span>
                                <ol className="fas-acts">
                                    {fase.actividades.map((a, k) => {
                                        const verbo = clean(a).split(/\s+/)[0];
                                        return (
                                            <li key={k}>
                                                <input className="input-field" aria-label={`Actividad ${k + 1}`} value={a} onChange={(e) => setFase(ai, { actividades: fase.actividades.map((x, j) => (j === k ? e.target.value : x)) })} placeholder="Ej: Aplicar el cuestionario a los pacientes de la muestra" />
                                                <button type="button" className="obj-remove" disabled={k === 0} onClick={() => { const next = [...fase.actividades]; [next[k - 1], next[k]] = [next[k], next[k - 1]]; setFase(ai, { actividades: next }); }} aria-label={`Subir la actividad ${k + 1}`}><ArrowUp size={14} /></button>
                                                <button type="button" className="obj-remove" onClick={() => setFase(ai, { actividades: fase.actividades.length > 1 ? fase.actividades.filter((_, j) => j !== k) : [''] })} aria-label={`Quitar la actividad ${k + 1}`}><Trash2 size={14} /></button>
                                                {clean(a) && !isInfinitive(verbo) && <small className="obj-warn"><AlertTriangle size={13} aria-hidden="true" /> Empieza con un verbo en infinitivo.</small>}
                                            </li>
                                        );
                                    })}
                                </ol>
                                <button type="button" className="ide-btn ide-btn--ghost obj-add" onClick={() => setFase(ai, { actividades: [...fase.actividades, ''] })}><Plus size={15} /> Agregar actividad</button>
                            </div>

                            <label className="mar-campo mar-wide">
                                <span>Técnicas y herramientas</span>
                                <input className="input-field" value={fase.tecnicas} onChange={(e) => setFase(ai, { tecnicas: e.target.value })} placeholder="Ej: encuesta, cuestionario validado, Jamovi" />
                            </label>
                            <label className="mar-campo mar-wide">
                                <span>Producto o entregable</span>
                                <input className="input-field" value={fase.productos} onChange={(e) => setFase(ai, { productos: e.target.value })} placeholder="Ej: informe de resultados con tablas y gráficos" />
                            </label>
                            <label className="mar-campo">
                                <span>Duración ({f.unidad})</span>
                                <input className="input-field" type="number" min="1" max="52" value={fase.duracion} onChange={(e) => setFase(ai, { duracion: Math.max(1, Math.min(52, Number(e.target.value) || 1)) })} />
                            </label>
                            <label className="mar-campo">
                                <span>Responsable</span>
                                <input className="input-field" value={fase.responsable} onChange={(e) => setFase(ai, { responsable: e.target.value })} placeholder="Ej: investigador principal" />
                            </label>
                            <div className="fas-move mar-wide">
                                <button type="button" className="ide-link" disabled={ai === 0} onClick={() => mover(ai, -1)}><ArrowUp size={13} /> Mover antes</button>
                                <button type="button" className="ide-link" disabled={ai === fases.length - 1} onClick={() => mover(ai, 1)}><ArrowDown size={13} /> Mover después</button>
                                <button type="button" className="ide-link fas-del" onClick={() => { setFases(fases.filter((_, k) => k !== ai)); setActive(Math.max(0, ai - 1)); }}><Trash2 size={13} /> Quitar esta fase</button>
                            </div>
                        </div>
                    ) : (
                        <button type="button" className="ide-btn ide-btn--ghost" onClick={() => setFases([FASE_VACIA()])}><Plus size={15} /> Crear la primera fase</button>
                    )}
                </div>

                <aside className="pla-side" aria-label="Tus fases">
                    <p className="ide-synth-label">Ruta del proyecto</p>
                    <div className="pla-preview fas-ruta" aria-live="polite">
                        {fases.length ? (
                            <ol>
                                {fases.map((x, i) => (
                                    <li key={x.id} data-active={i === ai}>
                                        <button type="button" onClick={() => setActive(i)}>
                                            <b>Fase {i + 1}. {capital(clean(x.nombre)) || 'Sin nombre'}</b>
                                            <small>{x.actividades.filter((a) => clean(a)).length} actividades · {Number(x.duracion) || 0} {f.unidad}</small>
                                            {clean(x.productos) && <small>→ {capital(clean(x.productos))}</small>}
                                        </button>
                                    </li>
                                ))}
                            </ol>
                        ) : <span className="tit-empty">Tus fases aparecerán aquí, en orden.</span>}
                        {fases.length > 0 && (
                            <div className="fas-barra" aria-hidden="true">
                                {fases.map((x, i) => <span key={x.id} data-n={(i % 4) + 1} style={{ flex: Number(x.duracion) || 1 }} title={x.nombre} />)}
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
};

/* ---------- Revisión ---------- */

const checkFases = (fases, especificos, cronoPeriodos, unidadCrono, unidad) => {
    const validas = fases.filter((x) => clean(x.nombre));
    const cubiertos = especificos.filter((o) => validas.some((x) => clean(x.objetivo).toLowerCase() === clean(o).toLowerCase()));
    const actsMalas = validas.flatMap((x) => x.actividades.filter((a) => clean(a) && !isInfinitive(clean(a).split(/\s+/)[0])));
    const orden = validas.map((x) => especificos.findIndex((o) => clean(o).toLowerCase() === clean(x.objetivo).toLowerCase())).filter((n) => n >= 0);
    const total = validas.reduce((s, x) => s + (Number(x.duracion) || 0), 0);
    const mismoTipo = (unidad === 'meses') === (unidadCrono === 'mensual');
    return [
        { id: 'cantidad', ok: validas.length >= 2, label: 'Tiene al menos dos fases', detail: `Tiene ${validas.length}.` },
        { id: 'cubre', ok: especificos.length > 0 && cubiertos.length === especificos.length, label: 'Cada objetivo específico tiene su fase', detail: `${cubiertos.length} de ${especificos.length} objetivos tienen fase.` },
        { id: 'asociada', ok: validas.every((x) => clean(x.objetivo)), label: 'Cada fase cumple un objetivo', detail: 'Elige el objetivo de cada fase.' },
        { id: 'orden', ok: orden.every((n, i) => i === 0 || n >= orden[i - 1]), label: 'Las fases siguen el orden de los objetivos', detail: 'Ordénalas como tus objetivos específicos.' },
        { id: 'actividades', ok: validas.length > 0 && validas.every((x) => x.actividades.filter((a) => clean(a)).length >= 2), label: 'Cada fase tiene al menos dos actividades', detail: 'Divide cada fase en acciones concretas.' },
        { id: 'verbos', ok: actsMalas.length === 0, label: 'Las actividades empiezan con un verbo en infinitivo', detail: actsMalas.length ? `Revisa: «${clean(actsMalas[0]).slice(0, 50)}».` : '' },
        { id: 'tecnicas', ok: validas.length > 0 && validas.every((x) => clean(x.tecnicas)), label: 'Cada fase dice con qué técnicas y herramientas', detail: 'Indica técnicas, instrumentos o software.' },
        { id: 'productos', ok: validas.length > 0 && validas.every((x) => clean(x.productos)), label: 'Cada fase deja un producto', detail: 'Un entregable verificable por fase.' },
        { id: 'responsable', ok: validas.length > 0 && validas.every((x) => clean(x.responsable)), label: 'Cada fase tiene responsable', detail: 'Indica quién la lidera.' },
        { id: 'cronograma', ok: !cronoPeriodos || !mismoTipo || total === Number(cronoPeriodos), label: 'La duración coincide con el cronograma', detail: `Las fases suman ${total} y el cronograma tiene ${cronoPeriodos}. Usa «Guardar y llevar al cronograma».` },
    ];
};

const CRITERIOS = [
    { label: 'Completas', text: 'Una fase por objetivo, con actividades, técnicas, producto, duración y responsable.' },
    { label: 'Ordenadas', text: 'En secuencia lógica, como los objetivos.' },
    { label: 'Concretas', text: 'Actividades verificables con verbo en infinitivo.' },
    { label: 'Coherentes', text: 'Tiempos iguales a los del cronograma.' },
];

const Revision = ({ intro }) => {
    const { data, f, especificos } = useFasesState();
    const checks = checkFases(f.fases, especificos, Array.isArray(data.cronogramaItems) && data.cronogramaItems.length ? data.ganttPeriodos : 0, data.ganttUnidad, f.unidad);
    const passed = checks.filter((x) => x.ok).length;
    return (
        <>
            <div className="ide-synth-left">
                {intro}
                <ul className="tit-criteria">
                    {CRITERIOS.map((item) => <li key={item.label}><b>{item.label}</b> {item.text}</li>)}
                </ul>
                <p className="ide-hint">La revisión se hace sobre las fases que construiste.</p>
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
                <p className="ide-hint">Que los tiempos sean realistas lo confirma tu asesor.</p>
            </div>
        </>
    );
};

/* ---------- Clase ---------- */

const Fases = ({ onNavigate }) => {
    const { data } = useProject();
    const { especificos } = partesObjetivos(data.objetivos);
    const [guardadas] = useProjectField('fases', '');

    const renderSlide = ({ slide, heading, goToSection, sectionMinutes, totalMinutes }) => ({
        portada: (
            <>
                <div>
                    {heading}
                    <p>Esta sección convierte tu metodología en un plan de trabajo: qué harás, paso a paso, para lograr cada objetivo específico, con qué técnicas, qué productos obtendrás y cuánto tiempo tomará.</p>
                    <p><strong>Al terminar esta clase podrás:</strong></p>
                    <ul className="ide-bullets">
                        <li>Organizar el proyecto en una fase por objetivo específico.</li>
                        <li>Describir cada fase con actividades, técnicas, productos y tiempos.</li>
                        <li>Elegir un modelo de fases según el tipo de proyecto (incluido CRISP-DM).</li>
                        <li>Conectar las fases con el cronograma y el presupuesto.</li>
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
                        <p>Ya hay una fase por cada objetivo específico, con actividades y producto sugeridos según el verbo del objetivo. Ajústalas, completa técnicas, duración y responsable, y llévalas al cronograma.</p>
                    </>
                )}
            />
        ),
        revision: (
            <Revision
                intro={(
                    <>
                        {heading}
                        <p>Último paso: revisa que tus fases estén completas, en orden y coherentes con el cronograma.</p>
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
                        ? <div className="tit-saved"><span>Tus fases guardadas</span><p>{(String(guardadas).match(/^### Fase/gm) || []).length} fases</p></div>
                        : <p>En la construcción ya tendrás una fase por cada objetivo específico, lista para completar.</p>}
                </div>
            ) : null}
        />
    );

    return (
        <SlideDeck
            sections={SECTIONS}
            slides={SLIDES}
            storageKey={SLIDE_KEY}
            label="Desarrollo de las fases del proyecto"
            renderSlide={renderSlide}
            finish={onNavigate ? { label: 'Resultados y discusión', onClick: () => onNavigate('resultados') } : null}
        />
    );
};

export default Fases;
