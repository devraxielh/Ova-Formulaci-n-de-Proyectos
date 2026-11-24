import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Plus, Tags, Wand2, X } from 'lucide-react';
import SlideDeck from './deck/SlideDeck';
import { Generica } from './deck/Contenido';
import { useProject, useProjectField } from '../context/ProjectContext';
import { useAutoGuardar } from '../hooks/useAutoGuardar';
import { partesObjetivos } from '../services/coherencia';
import { MUESTREOS, tamanoMuestra } from '../data/metodologia';
import { MAX_PALABRAS, MIN_PALABRAS, SECTIONS, SLIDES } from '../data/resumenClase';
import './Titulo.css';
import './Planteamiento.css';
import './Objetivos.css';
import './Justificacion.css';
import './Marco.css';
import './Alcances.css';
import './Resumen.css';

const SLIDE_KEY = 'projectsia:resumen:diapositiva';

const clean = (text) => String(text || '').trim().replace(/[\s.,;:]+$/, '');
const lower = (text) => (text ? text.charAt(0).toLowerCase() + text.slice(1) : '');
const capital = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : '');
const countWords = (text) => String(text || '').trim().split(/\s+/).filter(Boolean).length;
const primeraOracion = (text) => (String(text || '').trim().match(/^[^.?!]+[.?!]/) || [''])[0].trim();

const PARTES = [
    { key: 'contexto', label: 'Contexto (opcional)', color: 'cuando', hint: 'Una oración que sitúe el problema.', placeholder: 'La inasistencia a citas médicas reduce la oportunidad de la atención y genera pérdidas para los servicios de salud.' },
    { key: 'objetivo', label: 'Objetivo', color: 'que', hint: 'El objetivo general, en pasado.', placeholder: 'Esta investigación tuvo como objetivo analizar los factores asociados a…' },
    { key: 'metodologia', label: 'Metodología', color: 'paraque', hint: 'Enfoque, tipo, diseño, muestra e instrumento.', placeholder: 'Se desarrolló un estudio cuantitativo, correlacional y no experimental, con una muestra de 278 pacientes…' },
    { key: 'resultados', label: 'Resultados', color: 'quien', hint: 'Los hallazgos principales, con cifras.', placeholder: 'Los resultados mostraron que el olvido fue la causa más frecuente (41 %)…' },
    { key: 'conclusiones', label: 'Conclusiones', color: 'donde', hint: 'La respuesta a la pregunta y su implicación, en presente.', placeholder: 'Se concluye que la inasistencia está asociada principalmente a…' },
];
const FORM = { contexto: '', objetivo: '', metodologia: '', resultados: '', conclusiones: '', claves: [] };
const GENERICAS = ['investigación', 'investigacion', 'estudio', 'análisis', 'analisis', 'colombia', 'proyecto', 'trabajo', 'resultados', 'metodología'];
const CITA = /\([^()]*(19|20)\d{2}[^()]*\)|\b[A-ZÁÉÍÓÚ][a-záéíóúñ]+ (?:et al\. )?\((19|20)\d{2}\)/;

const unir = (f) => PARTES.map((p) => String(f[p.key] || '').trim()).filter(Boolean)
    .map((txt) => (/[.?!]$/.test(txt) ? txt : `${txt}.`)).join(' ');

// Borrador de cada parte con lo que ya está en el proyecto.
const borradores = (data) => {
    const { general: generalDoc } = partesObjetivos(data.objetivos);
    const general = clean(data.objetivoGeneral) || clean(generalDoc);
    const met = data.metodologiaForm || {};
    const pob = met.poblacion || {};
    const muestreo = MUESTREOS.find((m) => m.id === pob.muestreo);
    const calc = { finita: data.poblacionTipo !== 'infinita', N: Number(data.poblacionTamano) || 0, Z: Number(data.muestraConfianza) || 1.96, e: Number(data.muestraError) || 0.05 };
    const n = muestreo?.probabilistico ? tamanoMuestra(calc) : 0;
    const instrumento = clean((met.instrumentos || [])[0]?.instrumento);
    const diseno = [clean(data.enfoque).toLowerCase(), clean(data.tipoInvestigacion).toLowerCase(), clean(data.diseno) ? `de diseño ${clean(data.diseno)}` : ''].filter(Boolean);
    const hallazgos = [...new Set(Object.values(data.resultadosForm?.porObjetivo || {}).map((r) => clean(r?.hallazgo)).filter(Boolean))];
    const conclusion = clean(data.conclusionesForm?.general);
    return {
        // El resumen no lleva citas: se quitan las de la oración tomada del planteamiento.
        contexto: (primeraOracion(data.planteamientoForm?.contexto) || primeraOracion(data.introduccion)).replace(/\s*\([^()]*(19|20)\d{2}[^()]*\)/g, ''),
        objetivo: general ? `Esta investigación tuvo como objetivo ${lower(general)}` : '',
        metodologia: diseno.length || clean(pob.descripcion)
            ? `Se desarrolló un estudio ${diseno.join(', ') || 'de investigación'}${n ? `, con una muestra de ${n} ${lower(clean(pob.unidad)) || 'participantes'}` : clean(pob.descripcion) ? ` con ${lower(clean(pob.descripcion))}` : ''}${instrumento ? `, a quienes se aplicó un ${lower(instrumento)}` : ''}`
            : '',
        resultados: hallazgos.length ? `Los resultados mostraron que ${hallazgos.map(lower).join('; además, ')}` : '',
        conclusiones: conclusion ? (/^se concluye/i.test(conclusion) ? conclusion : `Se concluye que ${lower(conclusion.replace(/^en respuesta a la pregunta de investigación,\s*/i, ''))}`) : '',
    };
};

// Sugerencias de palabras clave a partir del título, la población y el problema.
const sugerirClaves = (data) => {
    const titulo = clean(data.titulo).toLowerCase();
    const trozos = titulo.split(/,|\s(?:de los|de las|de la|del|de|en|para|a|y|por|con|durante|entre)\s/).map((x) => x.trim().replace(/^(los|las|la|el|un|una)\s/, ''))
        .filter((x) => x && x.split(/\s+/).length <= 4 && x.length > 3 && !/^\d/.test(x) && !/^(análisis|analisis|descripción|caracterización|determinación|diseño|propuesta|evaluación|estudio|identificación|categorización)$/.test(x));
    const extra = [clean(data.idea?.problema).toLowerCase().replace(/^(alta|baja)\s(tasa|frecuencia|nivel) de\s/, ''), clean(data.tituloForm?.quien).toLowerCase().replace(/^(los|las)\s/, '')];
    // Fuera: lugares (van con mayúscula y no describen el tema) y términos genéricos.
    const lugares = new Set(clean(data.tituloForm?.donde || data.idea?.donde).toLowerCase().split(/,\s*|\s(?:de|del)\s/).map((x) => x.trim().replace(/^(un|una|el|la)\s/, '')));
    const genericos = /^(factores asociados|factores|hospital|institución|empresa|colegio|universidad|año \d{4}|\d{4})$/;
    const vistos = new Set();
    return [...extra, ...trozos].filter((x) => x && x.length > 3 && !lugares.has(x) && !genericos.test(x) && !vistos.has(x) && vistos.add(x)).slice(0, 8);
};

/* ---------- Estado ---------- */

const useResumenState = () => {
    const { data } = useProject();
    const [form, setForm] = useProjectField('resumenForm', FORM);
    const [, setResumen] = useProjectField('resumen', '');
    const [, setClaves] = useProjectField('palabrasClave', '');
    const f = { ...FORM, ...(form || {}) };
    if (!Array.isArray(f.claves)) f.claves = [];
    const update = (patch) => setForm((prev) => ({ ...FORM, ...(prev || {}), ...patch }));
    return { data, f, update, setResumen, setClaves };
};

/* ---------- Constructor ---------- */

const Constructor = ({ intro }) => {
    const { data, f, update, setResumen, setClaves } = useResumenState();
    const [saved, setSaved] = useState(false);
    const [nueva, setNueva] = useState('');
    const [active, setActive] = useState('objetivo');
    const ejemplos = borradores(data);
    const sugeridas = sugerirClaves(data).filter((x) => !f.claves.includes(x));
    const texto = unir(f);
    const words = countWords(texto);
    const touch = () => setSaved(false);
    const vacios = PARTES.filter((p) => !String(f[p.key] || '').trim() && ejemplos[p.key]).length;
    const armar = () => {
        touch();
        const patch = {};
        PARTES.forEach((p) => { if (!String(f[p.key] || '').trim() && ejemplos[p.key]) patch[p.key] = `${ejemplos[p.key]}${/[.?!]$/.test(ejemplos[p.key]) ? '' : '.'}`; });
        update(patch);
    };
    const agregarClave = (valor) => {
        const v = clean(valor).toLowerCase();
        if (!v || f.claves.includes(v) || f.claves.length >= 6) return;
        touch();
        update({ claves: [...f.claves, v] });
    };
    const save = () => {
        setResumen(texto);
        setClaves(f.claves.join(', '));
        setSaved(true);
    };
    // Guardado automático: lo redactado pasa a Mi proyecto sin tener que tocar «Guardar».
    useAutoGuardar(texto ? `${texto}|${f.claves.join(',')}` : '', save);
    const estado = words === 0 ? 'empty' : words < MIN_PALABRAS ? 'short' : words <= MAX_PALABRAS ? 'ok' : 'over';

    return (
        <div className="pla-builder-wrap">
            <header className="pla-builder-head">
                <div>{intro}</div>
                <div className="pla-status">
                    <div className="tit-meter" data-state={estado}>
                        <div className="tit-meter-bar" aria-hidden="true"><span style={{ width: `${Math.min(words, MAX_PALABRAS) / MAX_PALABRAS * 100}%` }} /></div>
                        <p><b>{words} palabras</b> · {estado === 'short' ? `faltan ${MIN_PALABRAS - words} para el mínimo` : estado === 'over' ? `sobran ${words - MAX_PALABRAS}` : estado === 'ok' ? 'extensión correcta' : `entre ${MIN_PALABRAS} y ${MAX_PALABRAS}`} · {f.claves.length} palabras clave</p>
                    </div>
                    {vacios > 0 && <button type="button" className="ide-btn ide-btn--ghost" onClick={armar}><Wand2 size={16} /> Armar un borrador con mi proyecto</button>}
                    <button type="button" className="ide-btn ide-btn--primary" disabled={!texto} onClick={save}><CheckCircle2 size={17} /> Guardar mi resumen</button>
                    {saved && <p className="ide-feedback ide-feedback--ok" role="status"><CheckCircle2 size={16} /><span>Guardado. Ya aparece después del título en Mi proyecto.</span></p>}
                </div>
            </header>

            <div className="pla-builder">
                <div className="obj-form">
                    {PARTES.map((p) => (
                        <div className="input-group pla-part" data-active={active === p.key} key={p.key}>
                            <label htmlFor={`res-${p.key}`}><mark data-part={p.color} data-active="true">{PARTES.indexOf(p) || '·'}</mark> {p.label} <small className="res-cuenta">{countWords(f[p.key])} palabras</small></label>
                            <textarea id={`res-${p.key}`} className="textarea-field" rows={p.key === 'resultados' ? 4 : 3} value={f[p.key]} onFocus={() => setActive(p.key)} onChange={(e) => { touch(); update({ [p.key]: e.target.value }); }} placeholder={`Ej: ${ejemplos[p.key] || p.placeholder}`} />
                            <small className="ide-field-hint">{p.hint}</small>
                        </div>
                    ))}

                    <div className="input-group pla-part res-claves">
                        <span className="alc-label"><Tags size={16} aria-hidden="true" /> Palabras clave (de 3 a 6)</span>
                        <div className="res-chips">
                            {f.claves.map((k) => (
                                <span key={k} className="res-chip">{k}<button type="button" aria-label={`Quitar ${k}`} onClick={() => { touch(); update({ claves: f.claves.filter((x) => x !== k) }); }}><X size={12} /></button></span>
                            ))}
                            {f.claves.length < 6 && (
                                <form className="res-nueva" onSubmit={(e) => { e.preventDefault(); agregarClave(nueva); setNueva(''); }}>
                                    <input className="input-field" value={nueva} onChange={(e) => setNueva(e.target.value)} placeholder="Escribe y presiona Enter" aria-label="Nueva palabra clave" />
                                    <button type="submit" className="ide-btn ide-btn--ghost" disabled={!clean(nueva)}><Plus size={14} /> Agregar</button>
                                </form>
                            )}
                        </div>
                        {sugeridas.length > 0 && f.claves.length < 6 && (
                            <div className="res-sug">
                                <small>Sugeridas de tu título:</small>
                                {sugeridas.map((k) => <button key={k} type="button" className="ide-chip" onClick={() => agregarClave(k)}>+ {k}</button>)}
                            </div>
                        )}
                        <small className="ide-field-hint">Términos específicos con los que alguien buscaría tu estudio. Evita palabras generales como «investigación» o «estudio».</small>
                    </div>
                </div>

                <aside className="pla-side" aria-label="Tu resumen">
                    <p className="ide-synth-label">Así queda tu resumen</p>
                    <div className="pla-preview res-preview" aria-live="polite">
                        {texto ? (
                            <>
                                <h4>Resumen</h4>
                                <p>{PARTES.filter((p) => String(f[p.key] || '').trim()).map((p) => (
                                    <span key={p.key} className="res-parte" data-part={p.color} data-active={active === p.key}>{String(f[p.key]).trim()}{/[.?!]$/.test(String(f[p.key]).trim()) ? '' : '.'} </span>
                                ))}</p>
                                {f.claves.length > 0 && <p className="res-pc"><i>Palabras clave:</i> {f.claves.join(', ')}.</p>}
                            </>
                        ) : <span className="tit-empty">Toca «Armar un borrador con mi proyecto» o escribe cada parte.</span>}
                    </div>
                </aside>
            </div>
        </div>
    );
};

/* ---------- Revisión ---------- */

const checkResumen = (f, general) => {
    const texto = unir(f);
    const w = countWords(texto);
    const lowerT = texto.toLowerCase();
    const claves = (clean(general).toLowerCase().split(/\s+/).slice(1).filter((x) => x.length > 5)).slice(0, 5);
    return [
        { id: 'largo', ok: w >= MIN_PALABRAS && w <= MAX_PALABRAS, label: `Tiene entre ${MIN_PALABRAS} y ${MAX_PALABRAS} palabras`, detail: `Tiene ${w}.` },
        { id: 'objetivo', ok: Boolean(clean(f.objetivo)), label: 'Menciona el objetivo', detail: '«Esta investigación tuvo como objetivo…».' },
        { id: 'general', ok: claves.length === 0 || claves.filter((x) => lowerT.includes(x)).length >= Math.min(2, claves.length), label: 'El objetivo coincide con el de tu proyecto', detail: general ? `Tu objetivo general: ${clean(general)}` : '' },
        { id: 'metodologia', ok: Boolean(clean(f.metodologia)), label: 'Describe la metodología', detail: 'Enfoque, diseño, muestra e instrumento.' },
        { id: 'resultados', ok: Boolean(clean(f.resultados)) && /\d/.test(f.resultados), label: 'Presenta resultados con datos', detail: 'Incluye los hallazgos principales con cifras.' },
        { id: 'conclusiones', ok: Boolean(clean(f.conclusiones)), label: 'Cierra con las conclusiones', detail: '«Se concluye que…».' },
        { id: 'citas', ok: !CITA.test(texto) && !/\b(tabla|figura)\s\d/i.test(texto), label: 'Sin citas, tablas ni figuras', detail: 'El resumen se entiende solo, sin remitir a otras partes.' },
        { id: 'claves', ok: f.claves.length >= 3 && f.claves.length <= 6, label: 'Tiene de 3 a 6 palabras clave', detail: `Tiene ${f.claves.length}.` },
        { id: 'especificas', ok: f.claves.length > 0 && !f.claves.some((k) => GENERICAS.includes(k.toLowerCase())), label: 'Las palabras clave son específicas', detail: 'Cambia términos generales como «investigación» o «estudio».' },
    ];
};

const CRITERIOS = [
    { label: 'Completo', text: 'Objetivo, metodología, resultados y conclusiones.' },
    { label: 'Breve', text: `Un párrafo de ${MIN_PALABRAS} a ${MAX_PALABRAS} palabras.` },
    { label: 'Autónomo', text: 'Se entiende solo: sin citas, tablas ni datos nuevos.' },
    { label: 'Encontrable', text: 'Con 3 a 6 palabras clave específicas.' },
];

const Revision = ({ intro }) => {
    const { data, f } = useResumenState();
    const { general: generalDoc } = partesObjetivos(data.objetivos);
    const checks = checkResumen(f, clean(data.objetivoGeneral) || generalDoc);
    const passed = checks.filter((x) => x.ok).length;
    return (
        <>
            <div className="ide-synth-left">
                {intro}
                <ul className="tit-criteria">{CRITERIOS.map((item) => <li key={item.label}><b>{item.label}</b> {item.text}</li>)}</ul>
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
                <p className="ide-hint">Que el resumen refleje fielmente el estudio lo valida tu asesor.</p>
            </div>
        </>
    );
};

/* ---------- Clase ---------- */

const Resumen = ({ onNavigate }) => {
    const [guardado] = useProjectField('resumen', '');

    const renderSlide = ({ slide, heading, goToSection, sectionMinutes, totalMinutes }) => ({
        portada: (
            <>
                <div>
                    {heading}
                    <p>El resumen es la puerta de entrada a tu investigación: en un solo párrafo dice qué buscaste, cómo lo hiciste, qué encontraste y qué concluiste. Lo acompañan las palabras clave.</p>
                    <p><strong>Al terminar esta clase podrás:</strong></p>
                    <ul className="ide-bullets">
                        <li>Escribir un resumen de {MIN_PALABRAS} a {MAX_PALABRAS} palabras con sus cuatro partes.</li>
                        <li>Elegir palabras clave específicas.</li>
                        <li>Evitar los errores más frecuentes.</li>
                    </ul>
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
            <Constructor intro={(
                <>
                    {heading}
                    <p>Toca «Armar un borrador con mi proyecto»: cada parte se llena con tu objetivo, tu metodología, tus resultados y tus conclusiones. Ajusta hasta quedar entre {MIN_PALABRAS} y {MAX_PALABRAS} palabras y agrega tus palabras clave.</p>
                </>
            )}
            />
        ),
        revision: <Revision intro={(<>{heading}<p>Último paso: revisa tu resumen antes de llevarlo a tu asesor.</p></>)} />,
    })[slide.id] || (
        <Generica
            slide={slide}
            heading={heading}
            onNavigate={onNavigate}
            aside={slide.status ? (
                <div className="ide-panel">
                    <h3>Siguiente paso</h3>
                    {String(guardado || '').trim()
                        ? <div className="tit-saved"><span>Tu resumen guardado</span><p>{countWords(guardado)} palabras</p></div>
                        : <p>En la construcción, un clic arma el borrador con lo que ya construiste.</p>}
                </div>
            ) : null}
        />
    );

    return (
        <SlideDeck
            sections={SECTIONS}
            slides={SLIDES}
            storageKey={SLIDE_KEY}
            label="Resumen"
            renderSlide={renderSlide}
            finish={onNavigate ? { label: 'Ver mi proyecto completo', onClick: () => onNavigate('proyecto') } : null}
        />
    );
};

export default Resumen;
