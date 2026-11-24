import React, { useState } from 'react';
import EditorRico from './EditorRico';
import {
    AlertTriangle, ArrowRight, BookOpen, CheckCircle2, Layers, Library, MapPin, Plus, Quote, Scale, Search, Target, Trash2,
} from 'lucide-react';
import SlideDeck, { Opciones, Pestanas } from './deck/SlideDeck';
import { useProjectField } from '../context/ProjectContext';
import { useAutoGuardar } from '../hooks/useAutoGuardar';
import { SECTIONS, SLIDES } from '../data/marcoClase';
import { Generica } from './deck/Contenido';
import './Titulo.css';
import './Planteamiento.css';
import './Objetivos.css';
import './Justificacion.css';
import BuscarAntecedentes from './BuscarAntecedentes';
import { autorCita } from '../services/apa';
import './Marco.css';
import './Alcances.css';

/* Clase larga de 4 horas: el contenido de cada diapositiva está en data/marcoClase.js. */

const SLIDE_KEY = 'projectsia:marco:diapositiva';
const ANIO_ACTUAL = new Date().getFullYear();
const RECIENTE = ANIO_ACTUAL - 10;

/* ---------- Utilidades ---------- */

const clean = (text) => String(text || '').trim().replace(/[\s.,;:]+$/, '');
const lower = (text) => (text ? text.charAt(0).toLowerCase() + text.slice(1) : '');
const capital = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : '');
const countWords = (text) => String(text || '').trim().split(/\s+/).filter(Boolean).length;

/* ---------- Los cinco apartados ---------- */

const APARTADOS = [
    { key: 'antecedentes', field: 'marcoAntecedentes', label: 'Antecedentes', icon: Library, pregunta: '¿Qué se ha investigado sobre el tema?' },
    { key: 'teorico', field: 'marcoTeorico', label: 'Marco Teórico', icon: Layers, pregunta: '¿Qué teorías explican el problema?' },
    { key: 'conceptual', field: 'marcoConceptual', label: 'Marco Conceptual', icon: BookOpen, pregunta: '¿Qué significa cada término clave?' },
    { key: 'contextual', field: 'marcoContextual', label: 'Marco Contextual', icon: MapPin, pregunta: '¿Dónde y con quiénes ocurre?' },
    { key: 'legal', field: 'marcoLegal', label: 'Marco Legal', icon: Scale, pregunta: '¿Qué normas lo regulan?' },
];

const AMBITOS = ['Internacional', 'Nacional', 'Regional o local'];
const TIPOS_NORMA = ['Constitución Política', 'Ley', 'Decreto', 'Resolución', 'Acuerdo u ordenanza', 'Norma institucional'];

const VACIO = {
    antecedente: { autor: '', anio: '', titulo: '', ambito: 'Nacional', lugar: '', objetivo: '', hallazgo: '', relacion: '' },
    teoria: { nombre: '', autor: '', anio: '', postulado: '', relacion: '' },
    concepto: { termino: '', definicion: '', autor: '', anio: '' },
    norma: { tipo: 'Ley', numero: '', anio: '', establece: '', relacion: '' },
};

const MARCO_FORM = {
    antecedentes: [{ ...VACIO.antecedente }],
    teorias: [{ ...VACIO.teoria }],
    conceptos: [{ ...VACIO.concepto }],
    contexto: { lugar: '', caracteristicas: '', institucion: '', poblacion: '' },
    normas: [{ ...VACIO.norma }],
};

/* ---------- Redacción automática de cada apartado ---------- */

const redactarAntecedentes = (items) => AMBITOS.flatMap((ambito) => items
    .filter((a) => a.ambito === ambito && clean(a.autor) && clean(a.hallazgo))
    .map((a) => {
        const partes = [
            `${clean(a.autor)} (${clean(a.anio) || 's. f.'})${clean(a.titulo) ? `, en su estudio «${clean(a.titulo)}»` : ''}${clean(a.lugar) ? `, realizado en ${clean(a.lugar)}` : ''}${clean(a.objetivo) ? `, buscó ${lower(clean(a.objetivo))}` : ''}.`,
            `${capital(clean(a.hallazgo))}.`,
            clean(a.relacion) ? `Este antecedente se relaciona con la presente investigación porque ${lower(clean(a.relacion))}.` : '',
        ];
        return partes.filter(Boolean).join(' ');
    })).join('\n\n');

const redactarTeorias = (items) => items
    .filter((t) => clean(t.nombre) && clean(t.postulado))
    .map((t) => [
        `${capital(clean(t.nombre))}${clean(t.autor) ? `, propuesta por ${clean(t.autor)} (${clean(t.anio) || 's. f.'})` : ''}, plantea que ${lower(clean(t.postulado))}.`,
        clean(t.relacion) ? `Esta teoría sustenta la investigación porque ${lower(clean(t.relacion))}.` : '',
    ].filter(Boolean).join(' '))
    .join('\n\n');

const redactarConceptos = (items) => items
    .filter((c) => clean(c.termino) && clean(c.definicion))
    .map((c) => `- **${capital(clean(c.termino))}:** ${capital(clean(c.definicion))}${clean(c.autor) ? ` (${clean(c.autor)}, ${clean(c.anio) || 's. f.'})` : ''}.`)
    .join('\n');

const redactarContexto = (c) => [
    clean(c.lugar) ? `La investigación se desarrolla en ${clean(c.lugar)}.` : '',
    clean(c.caracteristicas) ? `${capital(clean(c.caracteristicas))}.` : '',
    clean(c.institucion) ? `${capital(clean(c.institucion))}.` : '',
    clean(c.poblacion) ? `${capital(clean(c.poblacion))}.` : '',
].filter(Boolean).join(' ');

const nombreNorma = (n) => {
    const num = clean(n.numero);
    const anio = clean(n.anio) ? ` de ${clean(n.anio)}` : '';
    switch (n.tipo) {
        case 'Constitución Política': return `La Constitución Política de Colombia de 1991${num ? `, en su artículo ${num},` : ''}`;
        case 'Ley': return `La Ley ${num}${anio}`;
        case 'Decreto': return `El Decreto ${num}${anio}`;
        case 'Resolución': return `La Resolución ${num}${anio}`;
        case 'Acuerdo u ordenanza': return `El acuerdo ${num}${anio}`;
        default: return `${capital(num)}${anio}`;
    }
};

const redactarNormas = (items) => [...items]
    .filter((n) => clean(n.establece) && (clean(n.numero) || n.tipo === 'Constitución Política'))
    .sort((x, y) => TIPOS_NORMA.indexOf(x.tipo) - TIPOS_NORMA.indexOf(y.tipo))
    .map((n) => {
        const nombre = nombreNorma(n);
        return [
            `${nombre} establece ${lower(clean(n.establece))}.`,
            clean(n.relacion) ? `Se relaciona con el estudio porque ${lower(clean(n.relacion))}.` : '',
        ].filter(Boolean).join(' ');
    })
    .join('\n\n');

const redactar = (f) => ({
    marcoAntecedentes: redactarAntecedentes(f.antecedentes),
    marcoTeorico: redactarTeorias(f.teorias),
    marcoConceptual: redactarConceptos(f.conceptos),
    marcoContextual: redactarContexto(f.contexto),
    marcoLegal: redactarNormas(f.normas),
});

const unir = (partes) => APARTADOS.map((a) => (clean(partes[a.field]) ? `## ${a.label}\n${partes[a.field].trim()}` : '')).filter(Boolean).join('\n\n');

/* ---------- Revisión automática ---------- */

const separar = (text) => {
    const out = {};
    let actual = null;
    String(text || '').split('\n').forEach((line) => {
        const head = line.trim().replace(/^#+\s*/, '').replace(/[:.]$/, '').toLowerCase();
        const match = APARTADOS.find((a) => head === a.label.toLowerCase());
        if (match) { actual = match.key; out[actual] = ''; return; }
        if (actual) out[actual] += `${line}\n`;
    });
    return out;
};

const checkMarco = (text, { quien, donde }) => {
    const p = separar(text);
    const all = String(text || '');
    const ant = (p.antecedentes || '').split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
    const anios = (p.antecedentes || '').match(/\((?:[^)]*?)((?:19|20)\d{2})\)/g) || [];
    const yearsAnt = anios.map((x) => Number(x.match(/(19|20)\d{2}/)[0]));
    const recientes = yearsAnt.filter((y) => y >= RECIENTE).length;
    const conceptos = (p.conceptual || '').split('\n').filter((line) => /:/.test(line) && line.trim().length > 10);
    const normas = (p.legal || '').split(/\n\s*\n/).filter((x) => /ley|decreto|resoluci|constituci|acuerdo|ordenanza|reglamento|norma/i.test(x));
    const citas = (all.match(/\([^()]*?(19|20)\d{2}[^()]*?\)|\(s\. f\.\)/g) || []).length;
    const clave = (value) => clean(value).toLowerCase().split(/[\s,]+/).filter((word) => word.length > 3)[0];
    return [
        { id: 'apartados', ok: APARTADOS.every((a) => clean(p[a.key])), label: 'Tiene los cinco apartados', detail: `Faltan: ${APARTADOS.filter((a) => !clean(p[a.key])).map((a) => a.label).join(', ') || '—'}.` },
        { id: 'antecedentes', ok: ant.length >= 3, label: 'Presenta al menos tres antecedentes', detail: `Tiene ${ant.length}. Lo usual es entre 5 y 10, de distintos ámbitos.` },
        { id: 'recientes', ok: yearsAnt.length > 0 && recientes >= Math.ceil(yearsAnt.length * 0.7), label: `Los antecedentes son recientes (desde ${RECIENTE})`, detail: `${recientes} de ${yearsAnt.length} son de los últimos diez años.` },
        { id: 'relacion', ok: ant.length > 0 && ant.every((x) => /se relaciona|aporta|sirve|es útil|permite/i.test(x)), label: 'Cada antecedente dice cómo se relaciona con tu estudio', detail: 'Cierra cada antecedente con «Este antecedente se relaciona con la presente investigación porque…».' },
        { id: 'teoria', ok: /\((?:[^)]*?)(19|20)\d{2}\)|propuesta por/i.test(p.teorico || '') && countWords(p.teorico) >= 40, label: 'El Marco Teórico nombra teorías con su autor', detail: 'Presenta al menos una teoría con su autor y año, y explica su postulado.' },
        { id: 'sustenta', ok: /sustenta|explica|permite comprender|se relaciona|aplica/i.test(p.teorico || ''), label: 'Explica por qué la teoría sustenta el estudio', detail: '«Esta teoría sustenta la investigación porque…».' },
        { id: 'conceptos', ok: conceptos.length >= 3, label: 'Define al menos tres conceptos', detail: `Tiene ${conceptos.length}. Define tus variables y los términos clave de tu título.` },
        { id: 'contexto', ok: (!clave(donde) || (p.contextual || '').toLowerCase().includes(clave(donde))) && (!clave(quien) || (p.contextual || '').toLowerCase().includes(clave(quien))), label: 'El contexto describe tu lugar y tu población', detail: `Tu lugar es «${clean(donde) || '—'}» y tu población «${clean(quien) || '—'}».` },
        { id: 'normas', ok: normas.length >= 2, label: 'Cita al menos dos normas', detail: `Tiene ${normas.length}. Ordénalas de la Constitución a las normas institucionales.` },
        { id: 'citas', ok: citas >= 6, label: 'Cita sus fuentes en APA', detail: `Tiene ${citas} citas con año. Cada antecedente, teoría y concepto debe llevar (Autor, año).` },
        { id: 'pendientes', ok: !/\[[^\]]{3,}\]/.test(all), label: 'No quedan partes por completar', detail: 'Reemplaza los textos entre corchetes [ … ].' },
    ];
};

/* ---------- Piezas visuales ---------- */


/* ---------- Constructor ---------- */

const useMarcoState = () => {
    const [form, setForm] = useProjectField('marcoForm', MARCO_FORM);
    const [tituloForm] = useProjectField('tituloForm', null);
    const [idea] = useProjectField('idea', null);
    const [titulo] = useProjectField('titulo', '');
    const setters = {
        marcoAntecedentes: useProjectField('marcoAntecedentes', '')[1],
        marcoTeorico: useProjectField('marcoTeorico', '')[1],
        marcoConceptual: useProjectField('marcoConceptual', '')[1],
        marcoContextual: useProjectField('marcoContextual', '')[1],
        marcoLegal: useProjectField('marcoLegal', '')[1],
    };
    const guardados = {
        marcoAntecedentes: useProjectField('marcoAntecedentes', '')[0],
        marcoTeorico: useProjectField('marcoTeorico', '')[0],
        marcoConceptual: useProjectField('marcoConceptual', '')[0],
        marcoContextual: useProjectField('marcoContextual', '')[0],
        marcoLegal: useProjectField('marcoLegal', '')[0],
    };
    const f = { ...MARCO_FORM, ...(form || {}) };
    f.contexto = { ...MARCO_FORM.contexto, ...(f.contexto || {}) };
    ['antecedentes', 'teorias', 'conceptos', 'normas'].forEach((key) => { if (!Array.isArray(f[key]) || f[key].length === 0) f[key] = MARCO_FORM[key]; });
    const update = (patch) => setForm((prev) => ({ ...MARCO_FORM, ...(prev || {}), ...patch }));
    const i = idea || {};
    const t = tituloForm || {};
    return {
        f, update, setters, guardados, titulo, idea: i,
        quien: clean(t.quien || i.quien), donde: clean(t.donde || i.donde),
    };
};

// Lista de fichas editables (antecedentes, teorías, conceptos o normas).
const Fichas = ({ items, vacio, max, onChange, render, agregar }) => (
    <div className="mar-fichas">
        {items.map((item, index) => (
            <div className="input-group pla-part mar-ficha" key={index}>
                <div className="alc-lim-head">
                    <span className="alc-label"><mark data-part="que" data-active="true">{index + 1}</mark></span>
                    {items.length > 1 && (
                        <button type="button" className="obj-remove" onClick={() => onChange(items.filter((_, i) => i !== index))} aria-label={`Quitar el elemento ${index + 1}`}><Trash2 size={16} /></button>
                    )}
                </div>
                {render(item, (patch) => onChange(items.map((it, i) => (i === index ? { ...it, ...patch } : it))), index)}
            </div>
        ))}
        {items.length < max && (
            <button type="button" className="ide-btn ide-btn--ghost obj-add" onClick={() => onChange([...items, { ...vacio }])}><Plus size={15} /> {agregar}</button>
        )}
    </div>
);

const Campo = ({ id, label, value, onChange, placeholder, rows = 1, className = '' }) => (
    <label className={`mar-campo ${className}`} htmlFor={id}>
        <span>{label}</span>
        {rows > 1
            ? <EditorRico id={id} className="textarea-field" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
            : <input id={id} className="input-field" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />}
    </label>
);

const Constructor = ({ intro, onNavigate }) => {
    const { f, update, setters, idea, quien, donde } = useMarcoState();
    const [tab, setTab] = useState('antecedentes');
    const [saved, setSaved] = useState(false);
    const partes = redactar(f);
    const texto = unir(partes);
    const problema = lower(clean(idea.problema)) || 'la inasistencia a citas médicas';
    const touch = () => setSaved(false);
    const set = (key) => (value) => { touch(); update({ [key]: value }); };
    const save = () => {
        Object.entries(partes).forEach(([field, value]) => { if (value.trim()) setters[field](value); });
        setSaved(true);
    };
    // Guardado automático: lo redactado pasa a Mi proyecto sin tener que tocar «Guardar».
    useAutoGuardar(texto, save);
    const cuenta = {
        antecedentes: f.antecedentes.filter((a) => clean(a.autor) && clean(a.hallazgo)).length,
        teorico: f.teorias.filter((t) => clean(t.nombre) && clean(t.postulado)).length,
        conceptual: f.conceptos.filter((c) => clean(c.termino) && clean(c.definicion)).length,
        contextual: clean(partes.marcoContextual) ? 1 : 0,
        legal: f.normas.filter((n) => clean(n.establece)).length,
    };

    return (
        <div className="pla-builder-wrap">
            <header className="pla-builder-head">
                <div>{intro}</div>
                <div className="pla-status">
                    <p className="obj-count"><b>{countWords(texto)} palabras</b> · {APARTADOS.filter((a) => cuenta[a.key] > 0).length} de 5 apartados</p>
                    <button type="button" className="ide-btn ide-btn--primary" disabled={!texto} onClick={save}>
                        <CheckCircle2 size={17} /> Guardar mi marco referencial
                    </button>
                    {saved && <p className="ide-feedback ide-feedback--ok" role="status"><CheckCircle2 size={16} /><span>Guardado. Ya aparece en Mi proyecto con sus cinco subtítulos.</span></p>}
                </div>
            </header>

            <div className="pla-builder">
                <div className="obj-form">
                    <div className="mar-tabs" role="tablist" aria-label="Apartados del marco referencial">
                        {APARTADOS.map((a) => {
                            const Icon = a.icon;
                            return (
                                <button key={a.key} type="button" role="tab" aria-selected={tab === a.key} onClick={() => setTab(a.key)}>
                                    <Icon size={15} aria-hidden="true" /> {a.label}
                                    <span className="mar-tab-count" data-ok={cuenta[a.key] > 0 || undefined}>{cuenta[a.key]}</span>
                                </button>
                            );
                        })}
                    </div>
                    <p className="ide-field-hint mar-pregunta">{APARTADOS.find((a) => a.key === tab).pregunta}</p>

                    {tab === 'antecedentes' && (
                        <BuscarAntecedentes
                            sugerencia={problema}
                            onUsar={(ref) => {
                                // La ficha queda con autor, año y título; el hallazgo lo escribe el estudiante después de leer el artículo.
                                const ficha = { ...VACIO.antecedente, autor: autorCita(ref), anio: ref.anio, titulo: ref.titulo, ambito: 'Internacional' };
                                const libre = f.antecedentes.findIndex((a) => !clean(a.autor) && !clean(a.titulo) && !clean(a.hallazgo));
                                set('antecedentes')(libre >= 0 ? f.antecedentes.map((a, i) => (i === libre ? ficha : a)) : [...f.antecedentes, ficha].slice(0, 10));
                            }}
                        />
                    )}
                    {tab === 'antecedentes' && (
                        <Fichas
                            items={f.antecedentes}
                            vacio={VACIO.antecedente}
                            max={10}
                            agregar="Agregar antecedente (lo usual es entre 5 y 10)"
                            onChange={set('antecedentes')}
                            render={(a, change, i) => (
                                <div className="mar-grid">
                                    <Campo id={`ant-autor-${i}`} label="Autor(es)" value={a.autor} onChange={(v) => change({ autor: v })} placeholder="Ej: Pérez y Gómez" />
                                    <Campo id={`ant-anio-${i}`} label="Año" value={a.anio} onChange={(v) => change({ anio: v })} placeholder={`Ej: ${ANIO_ACTUAL - 3}`} />
                                    <label className="mar-campo" htmlFor={`ant-ambito-${i}`}>
                                        <span>Ámbito</span>
                                        <select id={`ant-ambito-${i}`} className="input-field" value={a.ambito} onChange={(e) => change({ ambito: e.target.value })}>
                                            {AMBITOS.map((x) => <option key={x}>{x}</option>)}
                                        </select>
                                    </label>
                                    <Campo id={`ant-lugar-${i}`} label="Lugar" value={a.lugar} onChange={(v) => change({ lugar: v })} placeholder="Ej: un hospital de Bogotá" />
                                    <Campo className="mar-wide" id={`ant-titulo-${i}`} label="Título del estudio" value={a.titulo} onChange={(v) => change({ titulo: v })} placeholder={`Ej: Factores asociados a ${problema}`} />
                                    <Campo className="mar-wide" id={`ant-obj-${i}`} label="Qué buscó y cómo" value={a.objetivo} onChange={(v) => change({ objetivo: v })} rows={2} placeholder="Ej: identificar las causas de la inasistencia mediante una encuesta a 1.200 pacientes" />
                                    <Campo className="mar-wide" id={`ant-hal-${i}`} label="Qué encontró" value={a.hallazgo} onChange={(v) => change({ hallazgo: v })} rows={2} placeholder="Ej: el olvido explicó el 41 % de las citas perdidas" />
                                    <Campo className="mar-wide" id={`ant-rel-${i}`} label="Cómo se relaciona con tu estudio" value={a.relacion} onChange={(v) => change({ relacion: v })} rows={2} placeholder="Ej: aporta una de las variables que se medirán y el instrumento que se adaptará" />
                                </div>
                            )}
                        />
                    )}

                    {tab === 'teorico' && (
                        <Fichas
                            items={f.teorias}
                            vacio={VACIO.teoria}
                            max={5}
                            agregar="Agregar otra teoría"
                            onChange={set('teorias')}
                            render={(t, change, i) => (
                                <div className="mar-grid">
                                    <Campo className="mar-wide" id={`teo-nombre-${i}`} label="Nombre de la teoría o modelo" value={t.nombre} onChange={(v) => change({ nombre: v })} placeholder="Ej: El modelo de creencias en salud" />
                                    <Campo id={`teo-autor-${i}`} label="Autor(es)" value={t.autor} onChange={(v) => change({ autor: v })} placeholder="Ej: Rosenstock" />
                                    <Campo id={`teo-anio-${i}`} label="Año" value={t.anio} onChange={(v) => change({ anio: v })} placeholder="Ej: 1974" />
                                    <Campo className="mar-wide" id={`teo-post-${i}`} label="Qué plantea" value={t.postulado} onChange={(v) => change({ postulado: v })} rows={3} placeholder="Ej: las personas actúan para cuidar su salud según la amenaza que perciben, los beneficios y las barreras de la acción" />
                                    <Campo className="mar-wide" id={`teo-rel-${i}`} label="Por qué sustenta tu estudio" value={t.relacion} onChange={(v) => change({ relacion: v })} rows={2} placeholder={`Ej: permite explicar ${problema} a partir de las barreras que perciben los pacientes`} />
                                </div>
                            )}
                        />
                    )}

                    {tab === 'conceptual' && (
                        <Fichas
                            items={f.conceptos}
                            vacio={VACIO.concepto}
                            max={12}
                            agregar="Agregar concepto (define al menos tres)"
                            onChange={set('conceptos')}
                            render={(c, change, i) => (
                                <div className="mar-grid">
                                    <Campo className="mar-wide" id={`con-term-${i}`} label="Término" value={c.termino} onChange={(v) => change({ termino: v })} placeholder={`Ej: ${capital(problema)}`} />
                                    <Campo className="mar-wide" id={`con-def-${i}`} label="Definición" value={c.definicion} onChange={(v) => change({ definicion: v })} rows={2} placeholder="Ej: ausencia del paciente a una cita programada sin cancelación previa" />
                                    <Campo id={`con-autor-${i}`} label="Autor" value={c.autor} onChange={(v) => change({ autor: v })} placeholder="Ej: Pérez" />
                                    <Campo id={`con-anio-${i}`} label="Año" value={c.anio} onChange={(v) => change({ anio: v })} placeholder={`Ej: ${ANIO_ACTUAL - 4}`} />
                                </div>
                            )}
                        />
                    )}

                    {tab === 'contextual' && (
                        <div className="input-group pla-part mar-grid">
                            <Campo className="mar-wide" id="ctx-lugar" label="Dónde" value={f.contexto.lugar} onChange={(v) => set('contexto')({ ...f.contexto, lugar: v })} placeholder={`Ej: ${donde || 'un hospital de Sincelejo, Sucre'}`} />
                            <Campo className="mar-wide" id="ctx-car" label="Características del lugar" value={f.contexto.caracteristicas} onChange={(v) => set('contexto')({ ...f.contexto, caracteristicas: v })} rows={3} placeholder="Ej: Sincelejo es la capital de Sucre, con cerca de 300.000 habitantes; su red pública de salud…" />
                            <Campo className="mar-wide" id="ctx-inst" label="La institución" value={f.contexto.institucion} onChange={(v) => set('contexto')({ ...f.contexto, institucion: v })} rows={3} placeholder="Ej: El hospital es de segundo nivel, atiende unas 4.000 consultas externas al mes…" />
                            <Campo className="mar-wide" id="ctx-pob" label="La población" value={f.contexto.poblacion} onChange={(v) => set('contexto')({ ...f.contexto, poblacion: v })} rows={3} placeholder={`Ej: ${quien ? `${capital(quien)} son` : 'Los pacientes son'} principalmente adultos del régimen subsidiado…`} />
                        </div>
                    )}

                    {tab === 'legal' && (
                        <Fichas
                            items={f.normas}
                            vacio={VACIO.norma}
                            max={10}
                            agregar="Agregar norma (se ordenan solas por jerarquía)"
                            onChange={set('normas')}
                            render={(n, change, i) => (
                                <div className="mar-grid">
                                    <label className="mar-campo" htmlFor={`nor-tipo-${i}`}>
                                        <span>Tipo</span>
                                        <select id={`nor-tipo-${i}`} className="input-field" value={n.tipo} onChange={(e) => change({ tipo: e.target.value })}>
                                            {TIPOS_NORMA.map((x) => <option key={x}>{x}</option>)}
                                        </select>
                                    </label>
                                    <Campo id={`nor-num-${i}`} label={n.tipo === 'Constitución Política' ? 'Artículo' : n.tipo === 'Norma institucional' ? 'Nombre' : 'Número'} value={n.numero} onChange={(v) => change({ numero: v })} placeholder={n.tipo === 'Constitución Política' ? 'Ej: 49' : n.tipo === 'Norma institucional' ? 'Ej: reglamento de citas del hospital' : 'Ej: 1751'} />
                                    {n.tipo !== 'Constitución Política' && <Campo id={`nor-anio-${i}`} label="Año" value={n.anio} onChange={(v) => change({ anio: v })} placeholder="Ej: 2015" />}
                                    <Campo className="mar-wide" id={`nor-est-${i}`} label="Qué establece" value={n.establece} onChange={(v) => change({ establece: v })} rows={2} placeholder="Ej: la salud como un derecho fundamental autónomo" />
                                    <Campo className="mar-wide" id={`nor-rel-${i}`} label="Por qué se relaciona con tu estudio" value={n.relacion} onChange={(v) => change({ relacion: v })} rows={2} placeholder="Ej: obliga a las instituciones a garantizar el acceso oportuno a la consulta" />
                                </div>
                            )}
                        />
                    )}
                    {onNavigate && (
                        <button type="button" className="ide-link" onClick={() => onNavigate('referencias')}>Registra tus fuentes en Referencias (también por DOI) <ArrowRight size={13} /></button>
                    )}
                </div>

                <aside className="pla-side" aria-label="Tu marco referencial">
                    <p className="ide-synth-label">Así queda tu marco referencial</p>
                    <div className="pla-preview mar-preview" aria-live="polite">
                        {texto
                            ? APARTADOS.map((a) => (clean(partes[a.field]) ? (
                                <section key={a.key} data-active={tab === a.key}>
                                    <h4>{a.label}</h4>
                                    {partes[a.field].split('\n').filter(Boolean).map((line) => <p key={line}>{line.replace(/\*\*/g, '').replace(/^- /, '• ')}</p>)}
                                </section>
                            ) : null))
                            : <span className="tit-empty">Completa las fichas de cada apartado y aquí verás el texto redactado con sus cinco subtítulos.</span>}
                    </div>
                </aside>
            </div>
        </div>
    );
};

/* ---------- Revisión ---------- */

const CRITERIOS = [
    { label: 'Completo', text: 'Antecedentes, Marco Teórico, Conceptual, Contextual y Legal.' },
    { label: 'Actual', text: 'Antecedentes de los últimos diez años.' },
    { label: 'Relacionado', text: 'Cada antecedente y teoría dice para qué sirve en tu estudio.' },
    { label: 'Citado', text: 'Cada idea con (Autor, año) en APA 7.' },
    { label: 'Concreto', text: 'El contexto describe tu lugar y tu población.' },
];

const Revision = ({ intro }) => {
    const { guardados, f, quien, donde } = useMarcoState();
    const guardado = unir(guardados);
    const own = guardado || unir(redactar(f));
    const [text, setText] = useState(own);
    const target = text.trim();
    const isOwn = target === own;
    const checks = checkMarco(target, isOwn ? { quien, donde } : {});
    const passed = checks.filter((item) => item.ok).length;
    return (
        <>
            <div className="ide-synth-left">
                {intro}
                <ul className="tit-criteria">
                    {CRITERIOS.map((item) => <li key={item.label}><b>{item.label}</b> {item.text}</li>)}
                </ul>
                <label htmlFor="mar-revisar" className="ide-synth-label">Marco referencial a revisar</label>
                <textarea
                    id="mar-revisar"
                    className="textarea-field tit-review-input"
                    rows={8}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder={'Antecedentes\n…\n\nMarco Teórico\n…\n\nMarco Conceptual\n…\n\nMarco Contextual\n…\n\nMarco Legal\n…'}
                />
                {!isOwn && own && <button type="button" className="ide-link" onClick={() => setText(own)}>Volver a mi marco</button>}
            </div>
            <div className="ide-panel">
                <h3>{target ? `Cumple ${passed} de ${checks.length} criterios` : 'Criterios que se revisan'}</h3>
                <ul className="tit-checks">
                    {checks.map((item) => (
                        <li key={item.id} data-ok={target ? item.ok : undefined}>
                            {!target ? <Target size={18} aria-hidden="true" /> : item.ok ? <CheckCircle2 size={18} aria-hidden="true" /> : <AlertTriangle size={18} aria-hidden="true" />}
                            <span><b>{item.label}</b>{target && !item.ok && item.detail}</span>
                        </li>
                    ))}
                </ul>
                <p className="ide-hint">
                    {isOwn ? 'Revisa la forma de tu marco guardado.' : 'Revisando un texto distinto al tuyo: se omite el criterio de tu lugar y tu población.'} Escribe cada subtítulo en una línea aparte. Que las fuentes existan y sean confiables lo valida tu asesor.
                </p>
            </div>
        </>
    );
};

/* ---------- Clase ---------- */

const MarcoReferencial = ({ onNavigate }) => {
    const [titulo] = useProjectField('titulo', '');
    const [ant] = useProjectField('marcoAntecedentes', '');
    const [teo] = useProjectField('marcoTeorico', '');
    const [con] = useProjectField('marcoConceptual', '');
    const [ctx] = useProjectField('marcoContextual', '');
    const [leg] = useProjectField('marcoLegal', '');
    const hechos = [ant, teo, con, ctx, leg].filter((x) => String(x || '').trim()).length;

    const renderSlide = ({ slide, heading, goToSection, sectionMinutes, totalMinutes }) => ({
        portada: (
            <>
                <div>
                    {heading}
                    <p>El marco referencial reúne lo que ya se sabe sobre tu tema y lo que rodea a tu estudio: investigaciones previas, teorías, conceptos, el lugar y las normas. Es la base sobre la que se apoya todo lo demás.</p>
                    <p><strong>Al terminar esta clase podrás:</strong></p>
                    <ul className="ide-bullets">
                        <li>Distinguir los cinco apartados del marco referencial.</li>
                        <li>Buscar, leer y presentar antecedentes.</li>
                        <li>Elegir teorías, definir conceptos y describir el contexto.</li>
                        <li>Organizar el marco legal por jerarquía.</li>
                        <li>Citar en APA 7 y construir el tuyo.</li>
                    </ul>
                    {clean(titulo) && <div className="tit-from-idea"><span>Tu título</span><p>{titulo}</p></div>}
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
                        <p>Elige un apartado y llena una ficha por cada fuente: el texto se redacta solo, con sus citas, y queda bajo su subtítulo.</p>
                    </>
                )}
            />
        ),
        revision: (
            <Revision
                intro={(
                    <>
                        {heading}
                        <p>Revisa tu marco antes de llevarlo a tu asesor. También puedes pegar el de otro trabajo, con sus subtítulos, para analizarlo.</p>
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
                    <div className="tit-saved"><span>Tu marco hoy</span><p>{hechos} de 5 apartados guardados</p></div>
                    <p>Ten a mano las fuentes que encontraste: en la construcción llenarás una ficha por cada una.</p>
                </div>
            ) : null}
        />
    );

    return (
        <SlideDeck
            sections={SECTIONS}
            slides={SLIDES}
            storageKey={SLIDE_KEY}
            label="Marco referencial"
            renderSlide={renderSlide}
            finish={onNavigate ? { label: 'Definir la metodología', onClick: () => onNavigate('metodologia') } : null}
        />
    );
};

export default MarcoReferencial;
