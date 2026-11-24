import React, { useEffect, useRef, useState } from 'react';
import EditorRico from './EditorRico';
import {
    AlertTriangle, BarChart3, BookOpenCheck, Calculator, CalendarDays, CheckCircle2, ClipboardList, Compass, DollarSign, Layers, Microscope,
    Loader2, Plus, ShieldCheck, Sparkles, Target, Trash2, Users, X, XCircle,
} from 'lucide-react';
import SlideDeck, { Opciones, Pestanas } from './deck/SlideDeck';
import { useProject, useProjectField } from '../context/ProjectContext';
import { useAutoGuardar } from '../hooks/useAutoGuardar';
import { groq } from '../services/api';
import { partesObjetivos } from '../services/coherencia';
import { TIPO_ALCANCE } from '../data/ejemplos';
import {
    CATEGORIAS, CONFIANZAS, DISENOS, ENFOQUES, FASES, FUENTES, MUESTREOS, SOFTWARE, TECNICAS, TECNICAS_ANALISIS, TIPOS, VALIDACIONES,
    periodoLabel, redactarAnalisis, estadoValidacion, validacionesDe, redactarDiseno, redactarEnfoque, redactarInstrumentos, redactarPoblacion, redactarTipo, tamanoMuestra,
} from '../data/metodologia';
import { SECTIONS, SLIDES } from '../data/metodologiaClase';
import Instrumentos from './Instrumentos';
import { preguntasDe } from '../services/instrumentos';
import { Generica } from './deck/Contenido';
import ValidacionModal from './ValidacionModal';
import { VALIDACION_DETALLE } from '../data/validacion';
import './Titulo.css';
import './Planteamiento.css';
import './Objetivos.css';
import './Justificacion.css';
import './Marco.css';
import './Alcances.css';
import './Metodologia.css';

/* Clase larga de 4 horas: el contenido de cada diapositiva está en data/metodologiaClase.js. */

const SLIDE_KEY = 'projectsia:metodologia:diapositiva';

/* ---------- Utilidades ---------- */

// «Por qué este enfoque»: la razón sale de los objetivos del proyecto y del enfoque elegido.
const razonEnfoque = async ({ enfoque, data, especificos }) => {
    const t = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();
    const def = ENFOQUES.find((e) => e.id === enfoque)?.def || '';
    const general = t(data.objetivoGeneral) || t(partesObjetivos(data.objetivos).general);
    const r = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: 'Ayudas a un estudiante a justificar el enfoque de su investigación en la metodología. Escribes en español, en tercera persona o forma impersonal, con lo que dicen sus objetivos: no inventas cifras, técnicas, muestras, autores ni citas. Devuelves únicamente el texto, sin comillas ni explicaciones.' },
            { role: 'user', content: `ENFOQUE ELEGIDO: ${enfoque} (el ${def})\n\nPROYECTO\nTítulo: ${t(data.titulo) || '(sin título)'}\nPregunta: ${t(data.pregunta) || '(sin definir)'}\nObjetivo general: ${general || '(sin definir)'}\nObjetivos específicos:\n${especificos.length ? especificos.map((x, i) => `${i + 1}. ${x}`).join('\n') : '(sin definir)'}\n\nEscribe en dos frases (entre 40 y 70 palabras) por qué el enfoque ${enfoque.toLowerCase()} es el que corresponde a estos objetivos: qué piden hacer los objetivos (medir, relacionar, comprender, describir experiencias…) y qué clase de datos exige eso. ${enfoque === 'Mixto' ? 'Di qué objetivo necesita datos numéricos y cuál necesita datos cualitativos. ' : ''}Empieza con «Este enfoque». No repitas la definición del enfoque: ya está escrita antes. Es una justificación: no señales limitaciones ni recomiendes otro enfoque. Dos frases completas, sin punto final.` },
        ],
        temperature: 0.3,
        max_tokens: 1200,
    });
    const texto = t(r.choices?.[0]?.message?.content).replace(/^["«]|["»]$/g, '').replace(/[.\s]+$/, '');
    // Un texto muy corto o que termina en una palabra suelta («de», «la»…) llegó cortado: no se usa.
    if (texto.length < 120 || /\s(?:de|del|la|el|los|las|y|que|en|a|con|para|por|un|una)$/i.test(texto)) throw new Error('vacio');
    return texto;
};

// Elige el enfoque que corresponde al proyecto y explica por qué no los otros dos.
const recomendarEnfoque = async ({ data, especificos }) => {
    const t = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();
    const general = t(data.objetivoGeneral) || t(partesObjetivos(data.objetivos).general);
    const r = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: 'Eres asesor metodológico. Eliges el enfoque de investigación que corresponde a un proyecto según lo que piden su pregunta y sus objetivos, no según preferencias. Escribes en español, en tercera persona o forma impersonal. No inventas cifras, técnicas, muestras, autores ni citas. Respondes solo JSON válido.' },
            { role: 'user', content: `ENFOQUES POSIBLES\n${ENFOQUES.map((e) => `- ${e.id}: el ${e.def}`).join('\n')}\n\nPROYECTO\nTítulo: ${t(data.titulo) || '(sin título)'}\nPregunta: ${t(data.pregunta) || '(sin definir)'}\nProblema: ${t(data.idea?.problema) || '(sin definir)'}\nObjetivo general: ${general || '(sin definir)'}\nObjetivos específicos:\n${especificos.length ? especificos.map((x, i) => `${i + 1}. ${x}`).join('\n') : '(sin definir)'}\n\nElige UN enfoque. Criterio: cuantitativo si los objetivos piden medir, comparar, relacionar o determinar frecuencias y factores; cualitativo si piden comprender experiencias, percepciones o significados; mixto solo si hay objetivos de las dos clases y ninguno puede lograrse sin la otra clase de datos (no lo elijas por comodidad).\n- "enfoque": "Cuantitativo", "Cualitativo" o "Mixto".\n- "razon": dos frases completas (40 a 70 palabras) que justifiquen ese enfoque con lo que piden los objetivos y la clase de datos que exigen. Empieza con «Este enfoque». No repitas la definición ni señales limitaciones. Sin punto final.\n- "descartados": para CADA UNO de los otros dos enfoques, una frase (15 a 30 palabras) que diga por qué no es el adecuado para ESTE proyecto, nombrando lo que sus objetivos piden y ese enfoque no da (o lo que ese enfoque exigiría y el proyecto no busca). Sin punto final.\n\nResponde exactamente con este JSON: {"enfoque": "…", "razon": "…", "descartados": [{"enfoque": "…", "porque": "…"}, {"enfoque": "…", "porque": "…"}]}` },
        ],
        temperature: 0.2,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
    });
    const content = r.choices?.[0]?.message?.content || '';
    const json = JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1));
    const ids = ENFOQUES.map((e) => e.id);
    const sinPunto = (v) => t(v).replace(/[.\s]+$/, '');
    const enfoque = ids.find((id) => id.toLowerCase() === t(json.enfoque).toLowerCase());
    const razon = sinPunto(json.razon);
    if (!enfoque || razon.length < 60) throw new Error('vacio');
    const descartados = (Array.isArray(json.descartados) ? json.descartados : [])
        .map((d) => ({ enfoque: ids.find((id) => id.toLowerCase() === t(d?.enfoque).toLowerCase()), porque: sinPunto(d?.porque).replace(/^\p{Lu}(?=\p{Ll})/u, (l) => l.toLowerCase()) }))
        .filter((d) => d.enfoque && d.enfoque !== enfoque && d.porque.length > 15);
    return { enfoque, razon, descartados };
};

// Lo que la IA necesita saber del proyecto para elegir o justificar el tipo de investigación.
const proyectoParaTipo = ({ data, especificos, enfoque }) => {
    const t = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();
    const general = t(data.objetivoGeneral) || t(partesObjetivos(data.objetivos).general);
    return `PROYECTO\nTítulo: ${t(data.titulo) || '(sin título)'}\nPregunta: ${t(data.pregunta) || '(sin definir)'}\nObjetivo general: ${general || '(sin definir)'}\nObjetivos específicos:\n${especificos.length ? especificos.map((x, i) => `${i + 1}. ${x}`).join('\n') : '(sin definir)'}\nEnfoque elegido: ${enfoque || '(sin definir)'}`;
};
const TIPOS_TEXTO = TIPOS.map((x) => `- ${x.id}: ${x.def.replace(/^pues /, '')}`).join('\n');

// «Por qué este tipo»: coherente con el título, la pregunta, los objetivos y el enfoque.
const razonTipo = async ({ tipo, ...proyecto }) => {
    const r = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: 'Ayudas a un estudiante a justificar el tipo (alcance) de su investigación en la metodología. Escribes en español, en tercera persona o forma impersonal, con lo que dicen su título, su pregunta y sus objetivos: no inventas cifras, técnicas, muestras, autores ni citas. Devuelves únicamente el texto, sin comillas ni explicaciones.' },
            { role: 'user', content: `TIPOS POSIBLES\n${TIPOS_TEXTO}\n\n${proyectoParaTipo(proyecto)}\n\nTIPO ELEGIDO: ${tipo}\n\nEscribe en dos frases completas (entre 40 y 70 palabras) por qué la investigación es de tipo ${tipo.toLowerCase()}: qué busca el estudio según su pregunta y su objetivo general (el verbo y lo que pide), hasta dónde llega y cómo encaja con el enfoque elegido. Empieza con «El estudio». No repitas la definición del tipo: ya está escrita antes. Es una justificación: no señales limitaciones ni recomiendes otro tipo. Sin punto final.` },
        ],
        temperature: 0.3,
        max_tokens: 1200,
    });
    const texto = String(r.choices?.[0]?.message?.content ?? '').replace(/\s+/g, ' ').trim().replace(/^["«]|["»]$/g, '').replace(/[.\s]+$/, '');
    if (texto.length < 120 || /\s(?:de|del|la|el|los|las|y|que|en|a|con|para|por|un|una)$/i.test(texto)) throw new Error('vacio');
    return texto;
};

// Elige el tipo que corresponde al proyecto y explica por qué no los demás.
const recomendarTipo = async (proyecto) => {
    const t = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();
    const r = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: 'Eres asesor metodológico. Eliges el tipo (alcance) de investigación que corresponde a un proyecto según lo que piden su pregunta, su objetivo general y sus específicos, en coherencia con su título y su enfoque. Escribes en español, en tercera persona o forma impersonal. No inventas cifras, técnicas, muestras, autores ni citas. Respondes solo JSON válido.' },
            { role: 'user', content: `TIPOS POSIBLES\n${TIPOS_TEXTO}\n\n${proyectoParaTipo(proyecto)}\n\nElige UN tipo: el nivel más alto que el proyecto realmente alcanza, que es el que piden la pregunta y el objetivo general (los específicos anteriores son pasos para llegar a él). Guíate por el verbo y por lo que se pide: explorar un tema nuevo → exploratoria; caracterizar o describir → descriptiva; relacionar o asociar variables → correlacional; determinar causas o por qué ocurre → explicativa; valorar el efecto de una intervención ya aplicada → evaluativa; diagnosticar y diseñar una propuesta como fin principal → propositiva. Debe ser posible con el enfoque elegido.\n- "tipo": uno de ${TIPOS.map((x) => `"${x.id}"`).join(', ')}.\n- "razon": dos frases completas (40 a 70 palabras) que justifiquen ese tipo con lo que piden la pregunta y el objetivo general, y cómo encaja con el enfoque. Empieza con «El estudio». No repitas la definición ni señales limitaciones. Sin punto final.\n- "descartados": para CADA UNO de los otros cinco tipos, una frase (12 a 25 palabras) que diga por qué no es el de ESTE proyecto: qué le faltaría al proyecto para serlo o qué pide el proyecto que ese tipo no alcanza. Empieza en minúscula. Sin punto final.\n\nResponde exactamente con este JSON: {"tipo": "…", "razon": "…", "descartados": [{"tipo": "…", "porque": "…"}]}` },
        ],
        temperature: 0.2,
        max_tokens: 2200,
        response_format: { type: 'json_object' },
    });
    const content = r.choices?.[0]?.message?.content || '';
    const json = JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1));
    const ids = TIPOS.map((x) => x.id);
    const sinPunto = (v) => t(v).replace(/[.\s]+$/, '');
    const tipo = ids.find((id) => id.toLowerCase() === t(json.tipo).toLowerCase());
    const razon = sinPunto(json.razon);
    if (!tipo || razon.length < 60) throw new Error('vacio');
    const descartados = (Array.isArray(json.descartados) ? json.descartados : [])
        .map((d) => ({ tipo: ids.find((id) => id.toLowerCase() === t(d?.tipo).toLowerCase()), porque: sinPunto(d?.porque).replace(/^\p{Lu}(?=\p{Ll})/u, (l) => l.toLowerCase()) }))
        .filter((d) => d.tipo && d.tipo !== tipo && d.porque.length > 15);
    return { tipo, razon, descartados };
};

const clean = (text) => String(text || '').trim().replace(/[\s.,;:]+$/, '');
const lower = (text) => (text ? text.charAt(0).toLowerCase() + text.slice(1) : '');
const money = (value) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(value) || 0);
const uid = () => Math.random().toString(36).slice(2, 10);

const SUBTITULOS = [
    { key: 'enfoque', label: 'Enfoque de investigación', icon: Compass },
    { key: 'tipo', label: 'Tipos de investigación', icon: Layers },
    { key: 'diseno', label: 'Diseños de investigación', icon: Microscope },
    { key: 'poblacion', label: 'Población y muestra', icon: Users },
    { key: 'analisis', label: 'Plan de análisis de la información', icon: BarChart3 },
    { key: 'instrumentos', label: 'Instrumentos de recolección de información', icon: ClipboardList },
    { key: 'cronograma', label: 'Cronograma', icon: CalendarDays },
    { key: 'presupuesto', label: 'Presupuesto', icon: DollarSign },
];

const MET_FORM = {
    enfoqueTexto: '', tipoTexto: '', disenoTexto: '',
    poblacion: { descripcion: '', unidad: '', inclusion: '', exclusion: '', muestreo: '', muestraTexto: '' },
    analisis: [],
    instrumentos: [{ id: 'i1', tecnica: 'Encuesta', instrumento: 'cuestionario', aplicaA: '', objetivo: '', validez: 'juicio de expertos' }],
    cronograma: [],
};

const CRONO_BASE = [
    { fase: 'Preparación', actividad: 'Ajustar la propuesta con el asesor', inicio: 1, fin: 1 },
    { fase: 'Preparación', actividad: 'Diseñar y validar los instrumentos', inicio: 1, fin: 2 },
    { fase: 'Recolección de datos', actividad: 'Aplicar los instrumentos', inicio: 2, fin: 3 },
    { fase: 'Análisis', actividad: 'Organizar y analizar los datos', inicio: 3, fin: 4 },
    { fase: 'Informe y socialización', actividad: 'Redactar el informe final', inicio: 4, fin: 5 },
    { fase: 'Informe y socialización', actividad: 'Socializar los resultados', inicio: 6, fin: 6 },
];

/* ---------- Piezas visuales ---------- */



// Calculadora interactiva de muestra (en la clase y en la construcción).
const Calculadora = ({ calc, onChange, compacta = false }) => {
    const n = tamanoMuestra(calc);
    return (
        <div className={compacta ? 'met-calc met-calc--compacta' : 'ide-panel met-calc'}>
            {!compacta && <h3><Calculator size={18} aria-hidden="true" /> Calculadora de muestra</h3>}
            <div className="met-calc-grid">
                <label className="mar-campo">
                    <span>Población</span>
                    <select className="input-field" value={calc.finita ? 'finita' : 'infinita'} onChange={(e) => onChange({ finita: e.target.value === 'finita' })}>
                        <option value="finita">Finita (se conoce el total)</option>
                        <option value="infinita">Infinita o desconocida</option>
                    </select>
                </label>
                {calc.finita && (
                    <label className="mar-campo">
                        <span>Tamaño de la población (N)</span>
                        <input className="input-field" type="number" min="1" value={calc.N} onChange={(e) => onChange({ N: Number(e.target.value) })} />
                    </label>
                )}
                <label className="mar-campo">
                    <span>Nivel de confianza</span>
                    <select className="input-field" value={calc.Z} onChange={(e) => onChange({ Z: Number(e.target.value) })}>
                        {CONFIANZAS.map((c) => <option key={c.z} value={c.z}>{c.label}</option>)}
                    </select>
                </label>
                <label className="mar-campo">
                    <span>Margen de error</span>
                    <select className="input-field" value={calc.e} onChange={(e) => onChange({ e: Number(e.target.value) })}>
                        {[0.03, 0.05, 0.07, 0.1].map((x) => <option key={x} value={x}>{Math.round(x * 100)} %</option>)}
                    </select>
                </label>
            </div>
            <p className="met-calc-result"><b>{n}</b> {n === 1 ? 'participante' : 'participantes'}</p>
            <small className="ide-field-hint">
                {calc.finita ? 'n = N·Z²·p·q / (e²·(N−1) + Z²·p·q)' : 'n = Z²·p·q / e²'}, con p = q = 0,5 (máxima variabilidad).
            </small>
        </div>
    );
};

/* ---------- Estado del constructor ---------- */

const useMetState = () => {
    const { data } = useProject();
    const [form, setForm] = useProjectField('metodologiaForm', MET_FORM);
    const [enfoque, setEnfoque] = useProjectField('enfoque', '');
    const [tipo, setTipo] = useProjectField('tipoInvestigacion', '');
    const [diseno, setDiseno] = useProjectField('diseno', '');
    const [popTipo, setPopTipo] = useProjectField('poblacionTipo', 'finita');
    const [popN, setPopN] = useProjectField('poblacionTamano', 1000);
    const [conf, setConf] = useProjectField('muestraConfianza', 1.96);
    const [err, setErr] = useProjectField('muestraError', 0.05);
    const [unidad, setUnidad] = useProjectField('ganttUnidad', 'mensual');
    const [periodos, setPeriodos] = useProjectField('ganttPeriodos', 6);
    const [presupuesto, setPresupuesto] = useProjectField('presupuesto', []);
    const setters = {
        metEnfoque: useProjectField('metEnfoque', '')[1],
        metTipo: useProjectField('metTipo', '')[1],
        metDiseno: useProjectField('metDiseno', '')[1],
        poblacionSugerida: useProjectField('poblacionSugerida', '')[1],
        metPlanAnalisis: useProjectField('metPlanAnalisis', '')[1],
        instrumentos: useProjectField('instrumentos', '')[1],
        cronogramaItems: useProjectField('cronogramaItems', [])[1],
        metodologia: useProjectField('metodologia', '')[1],
    };
    const f = { ...MET_FORM, ...(form || {}) };
    f.poblacion = { ...MET_FORM.poblacion, ...(f.poblacion || {}) };
    if (!Array.isArray(f.analisis)) f.analisis = [];
    if (!Array.isArray(f.instrumentos) || f.instrumentos.length === 0) f.instrumentos = MET_FORM.instrumentos;
    if (!Array.isArray(f.cronograma)) f.cronograma = [];
    const update = (patch) => setForm((prev) => ({ ...MET_FORM, ...(prev || {}), ...patch }));
    const idea = data.idea || {};
    const t = data.tituloForm || {};
    const { especificos } = partesObjetivos(data.objetivos);
    const calc = { finita: popTipo !== 'infinita', N: Number(popN) || 0, Z: Number(conf) || 1.96, e: Number(err) || 0.05 };
    const setCalc = (patch) => {
        if ('finita' in patch) setPopTipo(patch.finita ? 'finita' : 'infinita');
        if ('N' in patch) setPopN(patch.N);
        if ('Z' in patch) setConf(patch.Z);
        if ('e' in patch) setErr(patch.e);
    };
    return {
        data, f, update, setters,
        enfoque, setEnfoque, tipo, setTipo, diseno, setDiseno,
        calc, setCalc, unidad, setUnidad, periodos: Number(periodos) || 6, setPeriodos,
        presupuesto: Array.isArray(presupuesto) ? presupuesto : [], setPresupuesto,
        especificos,
        quien: clean(t.quien || idea.quien), donde: clean(t.donde || idea.donde),
        tipoEsperado: TIPOS.find((x) => x.alcance === (TIPO_ALCANCE[idea.alcance] || '').split(' ')[0])?.id || '',
        alcancesTexto: String(data.alcances || ''),
        // Instrumentos completos (encuesta o guía) que el estudiante armó; cada uno pertenece a una fila por su `filaId`.
        armados: Array.isArray(data.instrumentosGen) ? data.instrumentosGen : [],
    };
};

const redactarTodo = (s) => ({
    metEnfoque: redactarEnfoque({ enfoque: s.enfoque, texto: s.f.enfoqueTexto }),
    metTipo: redactarTipo({ tipo: s.tipo, texto: s.f.tipoTexto }),
    metDiseno: redactarDiseno({ enfoque: s.enfoque, diseno: s.diseno, texto: s.f.disenoTexto }),
    poblacionSugerida: redactarPoblacion(s.f.poblacion, s.calc),
    metPlanAnalisis: redactarAnalisis(s.f.analisis),
    instrumentos: redactarInstrumentos(s.f.instrumentos, s.armados),
});

/* ---------- Ventana para armar el instrumento de una fila ---------- */

const ArmarModal = ({ fila, onClose, onNavigate }) => {
    const dialog = useRef(null);
    useEffect(() => {
        const el = dialog.current;
        if (!el) return;
        if (fila && !el.open) el.showModal();
        if (!fila && el.open) el.close();
    }, [fila]);
    return (
        <dialog ref={dialog} className="met-armar-modal" aria-label="Armar el instrumento" onClose={onClose} onClick={(e) => { if (e.target === dialog.current) onClose(); }}>
            {fila && (
                <div className="met-armar-caja">
                    <header>
                        <div>
                            <p>Instrumento de recolección</p>
                            <h2>{fila.tecnica}: {clean(fila.instrumento) || 'instrumento'}</h2>
                        </div>
                        <button type="button" onClick={onClose} aria-label="Cerrar"><X size={18} /></button>
                    </header>
                    <div className="met-armar-cuerpo">
                        <Instrumentos embebido fila={fila} onNavigate={(destino) => { onClose(); onNavigate?.(destino); }} />
                    </div>
                    <footer>
                        <small>Los cambios se guardan solos. La descripción de «Instrumentos de recolección de información» se redacta con lo que armes aquí.</small>
                        <button type="button" className="ide-btn ide-btn--primary" onClick={onClose}>Listo</button>
                    </footer>
                </div>
            )}
        </dialog>
    );
};

/* ---------- Constructor ---------- */

const Campo = ({ id, label, value, onChange, placeholder, rows = 1, className = '' }) => (
    <label className={`mar-campo ${className}`} htmlFor={id}>
        <span>{label}</span>
        {rows > 1
            ? <EditorRico id={id} className="textarea-field" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
            : <input id={id} className="input-field" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />}
    </label>
);

const Chips = ({ options, value, onPick, label, sugerido }) => (
    <div className="alc-tipos" role="radiogroup" aria-label={label}>
        {options.map((option) => (
            <button key={option} type="button" role="radio" aria-checked={value === option} className="ide-chip" onClick={() => onPick(option)}>
                {option.charAt(0).toUpperCase() + option.slice(1)}{sugerido === option ? ' ★' : ''}
            </button>
        ))}
    </div>
);

const Gantt = ({ filas, periodos, unidad }) => (
    <div className="met-gantt" role="table" aria-label="Diagrama de Gantt" style={{ '--periodos': periodos }}>
        <div className="met-gantt-row met-gantt-head" role="row">
            <span role="columnheader">Actividad</span>
            {Array.from({ length: periodos }, (_, i) => <span role="columnheader" key={i}>{periodoLabel(unidad).charAt(0)}{i + 1}</span>)}
        </div>
        {filas.filter((x) => clean(x.actividad)).map((x) => (
            <div className="met-gantt-row" role="row" key={x.id}>
                <span role="rowheader" title={x.fase}>{x.actividad}</span>
                {Array.from({ length: periodos }, (_, i) => (
                    <span role="cell" key={i} data-on={i + 1 >= Number(x.inicio) && i + 1 <= Number(x.fin) ? FASES.indexOf(x.fase) + 1 || 1 : undefined} />
                ))}
            </div>
        ))}
    </div>
);

const Constructor = ({ intro, onNavigate }) => {
    const s = useMetState();
    const estado = s;
    const { f, update, setters, enfoque, setEnfoque, tipo, setTipo, diseno, setDiseno, calc, setCalc, unidad, setUnidad, periodos, setPeriodos, presupuesto, setPresupuesto, especificos, quien, donde, tipoEsperado } = s;
    // Si se llega desde «Análisis de datos» u otro enlace a los instrumentos, se abre esa pestaña.
    const [tab, setTab] = useState(() => {
        try { return window.sessionStorage.getItem('projectsia:metodologia:tab') || 'enfoque'; } catch { return 'enfoque'; }
    });
    // La petición se consume una sola vez, ya con la pestaña abierta.
    useEffect(() => {
        try { window.sessionStorage.removeItem('projectsia:metodologia:tab'); } catch { /* noop */ }
    }, []);
    const [saved, setSaved] = useState(false);
    const prefilled = useRef(false);
    const touch = () => setSaved(false);
    const set = (key) => (value) => { touch(); update({ [key]: value }); };
    // Al elegir el enfoque se redacta su razón con los objetivos. Solo se escribe si el campo está vacío o si lo que
    // tiene es lo que se redactó antes (el estudiante no lo tocó): lo escrito a mano no se pisa.
    const [razon, setRazon] = useState('');
    const pedirRazon = async (v, forzar) => {
        if (!v || (!forzar && String(f.enfoqueTexto || '').trim() && f.enfoqueTexto !== f.enfoqueAuto)) return;
        setRazon('pensando');
        try {
            const texto = await razonEnfoque({ enfoque: v, data: estado.data, especificos });
            touch();
            update({ enfoqueTexto: texto, enfoqueAuto: texto });
            setRazon('');
        } catch {
            setRazon('fallo');
        }
    };
    // «Elegir con mi proyecto»: la IA escoge el enfoque según la pregunta y los objetivos, redacta la razón y deja
    // en notas por qué no los otros. La razón escrita a mano por el estudiante no se pisa.
    const elegirEnfoque = async () => {
        setRazon('eligiendo');
        try {
            const r = await recomendarEnfoque({ data: estado.data, especificos });
            touch();
            setEnfoque(r.enfoque);
            if (!(DISENOS[r.enfoque] || []).some((d) => d.id === diseno)) setDiseno('');
            const libre = !String(f.enfoqueTexto || '').trim() || f.enfoqueTexto === f.enfoqueAuto;
            update({ enfoqueNotas: { recomendado: r.enfoque, descartados: r.descartados }, ...(libre ? { enfoqueTexto: r.razon, enfoqueAuto: r.razon } : {}) });
            setRazon('');
        } catch {
            setRazon('fallo');
        }
    };
    // La primera vez que se abre el enfoque sin haber elegido ninguno, se elige solo (si ya hay objetivos o pregunta).
    const yaEligio = useRef(false);
    useEffect(() => {
        if (tab !== 'enfoque' || yaEligio.current || enfoque || f.enfoqueNotas) return;
        if (!especificos.length && !String(estado.data.pregunta || '').trim()) return;
        yaEligio.current = true;
        elegirEnfoque();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab, enfoque]);
    // Tipo de investigación: lo mismo que el enfoque. Se elige con el título, la pregunta, los objetivos y el
    // enfoque; la razón se redacta sola y las notas dicen por qué no los demás tipos.
    const [razonT, setRazonT] = useState('');
    const proyectoTipo = () => ({ data: estado.data, especificos, enfoque });
    const pedirRazonTipo = async (v, forzar) => {
        if (!v || (!forzar && String(f.tipoTexto || '').trim() && f.tipoTexto !== f.tipoAuto)) return;
        setRazonT('pensando');
        try {
            const texto = await razonTipo({ tipo: v, ...proyectoTipo() });
            touch();
            update({ tipoTexto: texto, tipoAuto: texto });
            setRazonT('');
        } catch {
            setRazonT('fallo');
        }
    };
    const elegirTipo = async () => {
        setRazonT('eligiendo');
        try {
            const r = await recomendarTipo(proyectoTipo());
            touch();
            setTipo(r.tipo);
            const libre = !String(f.tipoTexto || '').trim() || f.tipoTexto === f.tipoAuto;
            update({ tipoNotas: { recomendado: r.tipo, enfoque, descartados: r.descartados }, ...(libre ? { tipoTexto: r.razon, tipoAuto: r.razon } : {}) });
            setRazonT('');
        } catch {
            setRazonT('fallo');
        }
    };
    // La primera vez que se abre el tipo sin razón escrita ni notas, se elige solo (si ya hay objetivos o pregunta).
    const yaEligioTipo = useRef(false);
    useEffect(() => {
        if (tab !== 'tipo' || yaEligioTipo.current || f.tipoNotas || String(f.tipoTexto || '').trim()) return;
        if (!especificos.length && !String(estado.data.pregunta || '').trim()) return;
        yaEligioTipo.current = true;
        elegirTipo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab]);
    const setPob = (patch) => { touch(); update({ poblacion: { ...f.poblacion, ...patch } }); };

    // La primera vez: tipo según los alcances, población del título, una fila de análisis por específico y un cronograma base.
    useEffect(() => {
        if (prefilled.current) return;
        prefilled.current = true;
        const patch = {};
        if (!tipo && tipoEsperado) setTipo(tipoEsperado);
        if (!clean(f.poblacion.descripcion) && quien) patch.poblacion = { ...f.poblacion, descripcion: `${lower(quien)}${donde ? ` de ${donde}` : ''}` };
        if (f.analisis.length === 0 && especificos.length) patch.analisis = especificos.map((obj) => ({ id: uid(), objetivo: obj.replace(/\.$/, ''), tecnica: '', software: '' }));
        if (f.cronograma.length === 0) patch.cronograma = CRONO_BASE.map((x) => ({ ...x, id: uid() }));
        if (Object.keys(patch).length) update(patch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const partes = redactarTodo(s);
    const totalPresupuesto = presupuesto.reduce((sum, item) => sum + (Number(item.costo) || 0), 0);
    const cuenta = {
        enfoque: enfoque ? 1 : 0,
        tipo: tipo ? 1 : 0,
        diseno: diseno && (DISENOS[enfoque] || []).some((d) => d.id === diseno) ? 1 : 0,
        poblacion: clean(partes.poblacionSugerida) ? 1 : 0,
        analisis: f.analisis.filter((x) => clean(x.tecnica)).length,
        instrumentos: f.instrumentos.filter((x) => clean(x.instrumento)).length,
        cronograma: f.cronograma.filter((x) => clean(x.actividad)).length,
        presupuesto: presupuesto.length,
    };
    const save = () => {
        Object.entries(partes).forEach(([field, value]) => setters[field](value));
        setters.cronogramaItems(f.cronograma.filter((x) => clean(x.actividad)).map(({ fase, actividad, inicio, fin }) => ({ fase, actividad, inicio: Number(inicio), fin: Number(fin) })));
        setters.metodologia([partes.metEnfoque, partes.metTipo, partes.metDiseno].filter(Boolean).join('\n\n'));
        setSaved(true);
    };
    // Guardado automático: lo redactado pasa a Mi proyecto sin tener que tocar «Guardar».
    useAutoGuardar(JSON.stringify([partes, f.cronograma]), save);
    const setFila = (key, list, index, patch) => { touch(); update({ [key]: list.map((x, i) => (i === index ? { ...x, ...patch } : x)) }); };
    const [modal, setModal] = useState(null);
    const [armar, setArmar] = useState(null); // id de la fila cuyo instrumento completo se está armando
    const abrirArmado = (it, i) => {
        // Las filas antiguas pueden no tener identificador: se les da uno para poder asociarles su instrumento.
        const id = it.id || uid();
        if (!it.id) setFila('instrumentos', f.instrumentos, i, { id });
        setArmar(id);
    };
    const toggleValidacion = (index, id) => {
        const actual = validacionesDe(f.instrumentos[index]);
        const next = actual.includes(id) ? actual.filter((x) => x !== id) : [...actual, id];
        setFila('instrumentos', f.instrumentos, index, { validaciones: next, validez: next[0] || '' });
        // Al elegir un método se abre de una vez su calculadora: sin resultados, el documento deja dicho que falta.
        if (!actual.includes(id)) setModal({ index, metodo: id, calculadora: true });
    };

    return (
        <div className="pla-builder-wrap">
            <header className="pla-builder-head">
                <div>{intro}</div>
                <div className="pla-status">
                    <p className="obj-count"><b>{SUBTITULOS.filter((x) => cuenta[x.key] > 0).length} de 8 subtítulos</b> · muestra de {tamanoMuestra(calc)} · {money(totalPresupuesto)}</p>
                    <button type="button" className="ide-btn ide-btn--primary" onClick={save}>
                        <CheckCircle2 size={17} /> Guardar mi metodología
                    </button>
                    {saved && <p className="ide-feedback ide-feedback--ok" role="status"><CheckCircle2 size={16} /><span>Guardada. Ya aparece en Mi proyecto con sus ocho subtítulos.</span></p>}
                </div>
            </header>

            <div className="pla-builder">
                <div className="obj-form">
                    <div className="mar-tabs" role="tablist" aria-label="Subtítulos de la metodología">
                        {SUBTITULOS.map((x) => {
                            const Icon = x.icon;
                            return (
                                <button key={x.key} type="button" role="tab" aria-selected={tab === x.key} onClick={() => setTab(x.key)}>
                                    <Icon size={15} aria-hidden="true" /> {x.label}
                                    <span className="mar-tab-count" data-ok={cuenta[x.key] > 0 || undefined}>{cuenta[x.key] > 0 ? '✓' : '·'}</span>
                                </button>
                            );
                        })}
                    </div>

                    {tab === 'enfoque' && (
                        <div className="input-group pla-part">
                            <span className="alc-label">Elige el enfoque</span>
                            <div className="met-razon">
                                <button type="button" className="ide-btn ide-btn--ghost" disabled={razon === 'eligiendo' || razon === 'pensando'} onClick={elegirEnfoque}>
                                    {razon === 'eligiendo' ? <Loader2 size={15} className="met-gira" /> : <Sparkles size={15} />} {razon === 'eligiendo' ? 'Eligiendo según tu proyecto…' : 'Elegir el enfoque con mi proyecto'}
                                </button>
                                <span>Se basa en tu pregunta y tus objetivos. Puedes cambiarlo abajo.</span>
                            </div>
                            <Chips options={ENFOQUES.map((e) => e.id)} value={enfoque} label="Enfoque" onPick={(v) => { touch(); setEnfoque(v); if (!(DISENOS[v] || []).some((d) => d.id === diseno)) setDiseno(''); if (v !== enfoque) pedirRazon(v, false); }} />
                            <small className="ide-field-hint">{ENFOQUES.find((e) => e.id === enfoque)?.def ? `Un enfoque ${enfoque.toLowerCase()} es el ${ENFOQUES.find((e) => e.id === enfoque).def}.` : 'Cuantitativo si mides y relacionas; cualitativo si comprendes; mixto si haces ambas cosas.'}</small>
                            {f.enfoqueNotas?.recomendado && (
                                <div className="met-notas">
                                    <b>Notas</b>
                                    <p>Para tu proyecto se recomienda el enfoque <strong>{f.enfoqueNotas.recomendado.toLowerCase()}</strong>{enfoque && enfoque !== f.enfoqueNotas.recomendado ? `, pero elegiste el ${enfoque.toLowerCase()}: revisa que tus objetivos lo sostengan` : ''}.</p>
                                    {(f.enfoqueNotas.descartados || []).map((d) => <p key={d.enfoque}><strong>Por qué no {d.enfoque.toLowerCase()}:</strong> {d.porque}.</p>)}
                                    <small>Las notas son para ti: no pasan al documento.</small>
                                </div>
                            )}
                            <Campo id="met-enf-txt" label="Por qué este enfoque (con tus objetivos)" rows={3} value={f.enfoqueTexto} onChange={set('enfoqueTexto')} placeholder="Ej: Este enfoque permite medir la frecuencia de la inasistencia y su relación con los factores identificados en los pacientes" />
                            {enfoque && (
                                <div className="met-razon">
                                    <button type="button" className="ide-link" disabled={razon === 'pensando'} onClick={() => pedirRazon(enfoque, true)}>
                                        {razon === 'pensando' ? <Loader2 size={13} className="met-gira" /> : <Sparkles size={13} />} {razon === 'pensando' ? 'Redactando con tus objetivos…' : clean(f.enfoqueTexto) ? 'Volver a redactar con mis objetivos' : 'Redactar con mis objetivos'}
                                    </button>
                                    {razon === 'fallo' && <span>No se pudo redactar: inténtalo de nuevo o escríbelo tú.</span>}
                                    {razon !== 'fallo' && f.enfoqueTexto && f.enfoqueTexto === f.enfoqueAuto && <span>Redactado por la IA con tus objetivos: léelo y ajústalo.</span>}
                                </div>
                            )}
                        </div>
                    )}

                    {tab === 'tipo' && (
                        <div className="input-group pla-part">
                            <span className="alc-label">Elige el tipo de investigación</span>
                            <div className="met-razon">
                                <button type="button" className="ide-btn ide-btn--ghost" disabled={razonT === 'eligiendo' || razonT === 'pensando'} onClick={elegirTipo}>
                                    {razonT === 'eligiendo' ? <Loader2 size={15} className="met-gira" /> : <Sparkles size={15} />} {razonT === 'eligiendo' ? 'Eligiendo según tu proyecto…' : 'Elegir el tipo con mi proyecto'}
                                </button>
                                <span>Se basa en tu título, tu pregunta, tus objetivos y el enfoque{enfoque ? ` ${enfoque.toLowerCase()}` : ''}. Puedes cambiarlo abajo.</span>
                            </div>
                            <Chips options={TIPOS.map((t) => t.id)} value={tipo} label="Tipo de investigación" sugerido={tipoEsperado} onPick={(v) => { touch(); setTipo(v); if (v !== tipo) pedirRazonTipo(v, false); }} />
                            <small className="ide-field-hint">{tipoEsperado ? `★ Según lo que quieres lograr (y tus alcances), el tuyo es ${tipoEsperado.toLowerCase()}.` : 'Debe coincidir con el alcance que declaraste.'}</small>
                            {f.tipoNotas?.recomendado && (
                                <div className="met-notas">
                                    <b>Notas</b>
                                    <p>Para tu proyecto se recomienda una investigación <strong>{f.tipoNotas.recomendado.toLowerCase()}</strong>{tipo && tipo !== f.tipoNotas.recomendado ? `, pero elegiste ${tipo.toLowerCase()}: revisa que tu pregunta y tu objetivo general lo sostengan` : ''}.</p>
                                    {tipoEsperado && tipoEsperado !== f.tipoNotas.recomendado && <p>En tus alcances declaraste un estudio {tipoEsperado.toLowerCase()}: deja el mismo en las dos secciones.</p>}
                                    {f.tipoNotas.enfoque && enfoque && f.tipoNotas.enfoque !== enfoque && <p>Cambiaste el enfoque después de esta recomendación: vuelve a elegir el tipo con tu proyecto.</p>}
                                    {(f.tipoNotas.descartados || []).map((d) => <p key={d.tipo}><strong>Por qué no {d.tipo.toLowerCase()}:</strong> {d.porque}.</p>)}
                                    <small>Las notas son para ti: no pasan al documento.</small>
                                </div>
                            )}
                            <Campo id="met-tipo-txt" label="Por qué este tipo" rows={3} value={f.tipoTexto} onChange={set('tipoTexto')} placeholder="Ej: El estudio busca establecer la relación entre el olvido de la cita y la inasistencia, sin manipular las variables" />
                            {tipo && (
                                <div className="met-razon">
                                    <button type="button" className="ide-link" disabled={razonT === 'pensando' || razonT === 'eligiendo'} onClick={() => pedirRazonTipo(tipo, true)}>
                                        {razonT === 'pensando' ? <Loader2 size={13} className="met-gira" /> : <Sparkles size={13} />} {razonT === 'pensando' ? 'Redactando con tu proyecto…' : clean(f.tipoTexto) ? 'Volver a redactar con mi proyecto' : 'Redactar con mi proyecto'}
                                    </button>
                                    {razonT === 'fallo' && <span>No se pudo: inténtalo de nuevo o escríbelo tú.</span>}
                                    {razonT !== 'fallo' && f.tipoTexto && f.tipoTexto === f.tipoAuto && <span>Redactado por la IA con tu proyecto: léelo y ajústalo.</span>}
                                </div>
                            )}
                        </div>
                    )}

                    {tab === 'diseno' && (
                        <div className="input-group pla-part">
                            <span className="alc-label">Elige el diseño {enfoque ? `(${enfoque.toLowerCase()})` : ''}</span>
                            {enfoque
                                ? <Chips options={DISENOS[enfoque].map((d) => d.id)} value={diseno} label="Diseño" onPick={(v) => { touch(); setDiseno(v); }} />
                                : <p className="obj-warn"><AlertTriangle size={14} aria-hidden="true" /> Primero elige el enfoque: los diseños dependen de él.</p>}
                            {diseno && <small className="ide-field-hint">Un diseño {diseno} es aquel {(DISENOS[enfoque] || []).find((d) => d.id === diseno)?.def}.</small>}
                            <Campo id="met-dis-txt" label="Cómo se aplica en tu estudio" rows={3} value={f.disenoTexto} onChange={set('disenoTexto')} placeholder="Ej: Los datos se recogerán una sola vez, entre febrero y abril de 2026, sin intervenir en la atención de los pacientes" />
                        </div>
                    )}

                    {tab === 'poblacion' && (
                        <div className="input-group pla-part mar-grid">
                            <Campo className="mar-wide" id="met-pob" label="Población" rows={2} value={f.poblacion.descripcion} onChange={(v) => setPob({ descripcion: v })} placeholder={`Ej: ${quien || 'los pacientes de consulta externa'}${donde ? ` de ${donde}` : ''} atendidos en el primer semestre de 2026`} />
                            <Campo id="met-uni" label="Unidad de análisis" value={f.poblacion.unidad} onChange={(v) => setPob({ unidad: v })} placeholder="Ej: pacientes" />
                            <label className="mar-campo">
                                <span>Muestreo</span>
                                <select className="input-field" value={f.poblacion.muestreo} onChange={(e) => setPob({ muestreo: e.target.value })}>
                                    <option value="">Elige…</option>
                                    <optgroup label="Probabilístico">{MUESTREOS.filter((m) => m.probabilistico).map((m) => <option key={m.id} value={m.id}>{m.id}</option>)}</optgroup>
                                    <optgroup label="No probabilístico">{MUESTREOS.filter((m) => !m.probabilistico).map((m) => <option key={m.id} value={m.id}>{m.id}</option>)}</optgroup>
                                </select>
                            </label>
                            <Campo className="mar-wide" id="met-inc" label="Criterios de inclusión" rows={2} value={f.poblacion.inclusion} onChange={(v) => setPob({ inclusion: v })} placeholder="Ej: mayores de 18 años, con al menos una cita programada en el periodo, que acepten participar" />
                            <Campo className="mar-wide" id="met-exc" label="Criterios de exclusión" rows={2} value={f.poblacion.exclusion} onChange={(v) => setPob({ exclusion: v })} placeholder="Ej: pacientes de urgencias u hospitalización, o con limitaciones para responder" />
                            {MUESTREOS.find((m) => m.id === f.poblacion.muestreo)?.probabilistico
                                ? <div className="mar-wide"><Calculadora calc={calc} onChange={(patch) => { touch(); setCalc(patch); }} compacta /></div>
                                : <Campo className="mar-wide" id="met-mtx" label="Cómo se eligen los participantes" rows={2} value={f.poblacion.muestraTexto} onChange={(v) => setPob({ muestraTexto: v })} placeholder="Ej: se entrevistará a 12 pacientes hasta alcanzar la saturación de la información" />}
                        </div>
                    )}

                    {tab === 'analisis' && (
                        <div className="mar-fichas">
                            {f.analisis.length === 0 && <p className="obj-warn"><AlertTriangle size={14} aria-hidden="true" /> Guarda tus objetivos específicos para tener una fila por objetivo, o agrega una.</p>}
                            {f.analisis.map((fila, i) => (
                                <div className="input-group pla-part mar-grid" key={fila.id || i}>
                                    <Campo className="mar-wide" id={`an-obj-${i}`} label={`Objetivo específico ${i + 1}`} value={fila.objetivo} onChange={(v) => setFila('analisis', f.analisis, i, { objetivo: v })} placeholder="Ej: Caracterizar la inasistencia…" />
                                    <label className="mar-campo">
                                        <span>Técnica de análisis</span>
                                        <select className="input-field" value={fila.tecnica} onChange={(e) => setFila('analisis', f.analisis, i, { tecnica: e.target.value })}>
                                            <option value="">Elige…</option>
                                            {TECNICAS_ANALISIS.map((t) => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </label>
                                    <label className="mar-campo">
                                        <span>Software</span>
                                        <select className="input-field" value={fila.software} onChange={(e) => setFila('analisis', f.analisis, i, { software: e.target.value })}>
                                            <option value="">Elige…</option>
                                            {SOFTWARE.map((t) => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </label>
                                    {f.analisis.length > 1 && <button type="button" className="ide-link" onClick={() => { touch(); update({ analisis: f.analisis.filter((_, k) => k !== i) }); }}><Trash2 size={13} /> Quitar</button>}
                                </div>
                            ))}
                            <button type="button" className="ide-btn ide-btn--ghost obj-add" onClick={() => { touch(); update({ analisis: [...f.analisis, { id: uid(), objetivo: '', tecnica: '', software: '' }] }); }}><Plus size={15} /> Agregar fila</button>
                        </div>
                    )}

                    {tab === 'instrumentos' && (
                        <div className="mar-fichas">
                            {f.instrumentos.map((it, i) => (
                                <div className="input-group pla-part mar-grid" key={it.id || i}>
                                    <label className="mar-campo">
                                        <span>Técnica</span>
                                        <select className="input-field" value={it.tecnica} onChange={(e) => setFila('instrumentos', f.instrumentos, i, { tecnica: e.target.value, instrumento: TECNICAS.find((t) => t.tecnica === e.target.value)?.instrumento || it.instrumento })}>
                                            {TECNICAS.map((t) => <option key={t.tecnica}>{t.tecnica}</option>)}
                                        </select>
                                    </label>
                                    <Campo id={`in-ins-${i}`} label="Instrumento" value={it.instrumento} onChange={(v) => setFila('instrumentos', f.instrumentos, i, { instrumento: v })} placeholder="Ej: cuestionario de 20 preguntas" />
                                    <Campo id={`in-a-${i}`} label="Se aplica a" value={it.aplicaA} onChange={(v) => setFila('instrumentos', f.instrumentos, i, { aplicaA: v })} placeholder={`Ej: ${quien || 'los pacientes'} de la muestra`} />
                                    <label className="mar-campo">
                                        <span>Para el objetivo</span>
                                        <select className="input-field" value={it.objetivo} onChange={(e) => setFila('instrumentos', f.instrumentos, i, { objetivo: e.target.value })}>
                                            <option value="">Elige…</option>
                                            {especificos.map((o, k) => <option key={o} value={`el objetivo específico ${k + 1}`}>Objetivo específico {k + 1}</option>)}
                                            <option value="todos los objetivos específicos">Todos</option>
                                        </select>
                                    </label>
                                    <div className="mar-campo mar-wide met-val">
                                        <span>Validez y confiabilidad (puedes elegir varios)</span>
                                        <div className="met-val-chips" role="group" aria-label={`Métodos de validación del instrumento ${i + 1}`}>
                                            {VALIDACION_DETALLE.map((v) => {
                                                const on = validacionesDe(it).includes(v.id);
                                                return (
                                                    <button key={v.id} type="button" className="ide-chip" aria-pressed={on} onClick={() => toggleValidacion(i, v.id)}>
                                                        {on ? '✓ ' : '+ '}{v.titulo}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {estadoValidacion(it).length > 0 && (
                                            <ul className="met-val-estado">
                                                {estadoValidacion(it).map((v) => (
                                                    <li key={v.id} data-hecho={v.hecho}>
                                                        {v.hecho ? <CheckCircle2 size={15} aria-hidden="true" /> : <AlertTriangle size={15} aria-hidden="true" />}
                                                        <span><b>{v.titulo}:</b> {v.hecho ? 'cálculo registrado; ya está en tu documento.' : 'falta hacer el cálculo. Mientras tanto, tu documento dice que está pendiente.'}</span>
                                                        <button type="button" className="ide-link" onClick={() => setModal({ index: i, metodo: v.id, calculadora: true })}><Calculator size={13} aria-hidden="true" /> {v.hecho ? 'Ver o cambiar' : 'Hacer el cálculo'}</button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        <button type="button" className="ide-link" onClick={() => setModal({ index: i, metodo: validacionesDe(it)[0] || VALIDACION_DETALLE[0].id })}>
                                            <BookOpenCheck size={14} aria-hidden="true" /> ¿Cómo se hace? Paso a paso, ejemplo y calculadora
                                        </button>
                                    </div>
                                    {(() => {
                                        const armado = s.armados.find((a) => a && it.id && a.filaId === it.id);
                                        const n = armado ? preguntasDe(armado).length : 0;
                                        return (
                                            <div className="mar-wide met-armar" data-listo={n > 0}>
                                                <span>{n > 0
                                                    ? <><CheckCircle2 size={16} aria-hidden="true" /> <b>{armado.titulo || 'Instrumento'}</b> · {n} {n === 1 ? 'pregunta' : 'preguntas'}</>
                                                    : <>Aún no has armado este instrumento: sus preguntas, sus escalas y su versión para aplicar en línea.</>}</span>
                                                <button type="button" className="ide-btn ide-btn--primary" onClick={() => abrirArmado(it, i)}>
                                                    <ClipboardList size={16} aria-hidden="true" /> {n > 0 ? 'Editar el instrumento' : 'Arma el instrumento completo'}
                                                </button>
                                            </div>
                                        );
                                    })()}
                                    {f.instrumentos.length > 1 && <button type="button" className="ide-link" onClick={() => { touch(); update({ instrumentos: f.instrumentos.filter((_, k) => k !== i) }); }}><Trash2 size={13} /> Quitar</button>}
                                </div>
                            ))}
                            <button type="button" className="ide-btn ide-btn--ghost obj-add" onClick={() => { touch(); update({ instrumentos: [...f.instrumentos, { id: uid(), tecnica: 'Entrevista', instrumento: 'guía de entrevista semiestructurada', aplicaA: '', objetivo: '', validez: 'juicio de expertos', validaciones: ['juicio de expertos'] }] }); }}><Plus size={15} /> Agregar instrumento</button>
                        </div>
                    )}

                    {tab === 'cronograma' && (
                        <div className="mar-fichas">
                            <div className="met-crono-opts">
                                <label className="mar-campo"><span>Unidad</span>
                                    <select className="input-field" value={unidad} onChange={(e) => { touch(); setUnidad(e.target.value); }}>
                                        <option value="mensual">Meses</option><option value="semanal">Semanas</option>
                                    </select>
                                </label>
                                <label className="mar-campo"><span>Duración</span>
                                    <input className="input-field" type="number" min="1" max="24" value={periodos} onChange={(e) => { touch(); setPeriodos(Math.max(1, Math.min(24, Number(e.target.value) || 1))); }} />
                                </label>
                            </div>
                            {f.cronograma.map((x, i) => (
                                <div className="met-crono-row" key={x.id || i}>
                                    <select className="input-field" aria-label="Fase" value={x.fase} onChange={(e) => setFila('cronograma', f.cronograma, i, { fase: e.target.value })}>
                                        {FASES.map((fase) => <option key={fase}>{fase}</option>)}
                                    </select>
                                    <input className="input-field" aria-label="Actividad" value={x.actividad} onChange={(e) => setFila('cronograma', f.cronograma, i, { actividad: e.target.value })} placeholder="Actividad" />
                                    <input className="input-field" aria-label={`${periodoLabel(unidad)} de inicio`} type="number" min="1" max={periodos} value={x.inicio} onChange={(e) => setFila('cronograma', f.cronograma, i, { inicio: Number(e.target.value) })} />
                                    <input className="input-field" aria-label={`${periodoLabel(unidad)} de fin`} type="number" min="1" max={periodos} value={x.fin} onChange={(e) => setFila('cronograma', f.cronograma, i, { fin: Number(e.target.value) })} />
                                    <button type="button" className="obj-remove" onClick={() => { touch(); update({ cronograma: f.cronograma.filter((_, k) => k !== i) }); }} aria-label={`Quitar ${x.actividad || 'actividad'}`}><Trash2 size={16} /></button>
                                </div>
                            ))}
                            <button type="button" className="ide-btn ide-btn--ghost obj-add" onClick={() => { touch(); update({ cronograma: [...f.cronograma, { id: uid(), fase: 'Recolección de datos', actividad: '', inicio: 1, fin: 1 }] }); }}><Plus size={15} /> Agregar actividad</button>
                            <Gantt filas={f.cronograma} periodos={periodos} unidad={unidad} />
                        </div>
                    )}

                    {tab === 'presupuesto' && (
                        <div className="mar-fichas">
                            {presupuesto.map((it, i) => (
                                <div className="met-pres-row" key={it.id || i}>
                                    <select className="input-field" aria-label="Rubro" value={it.categoria} onChange={(e) => { touch(); setPresupuesto(presupuesto.map((x, k) => (k === i ? { ...x, categoria: e.target.value } : x))); }}>
                                        {[...new Set([...CATEGORIAS, it.categoria].filter(Boolean))].map((c) => <option key={c}>{c}</option>)}
                                    </select>
                                    <input className="input-field" aria-label="Descripción" value={it.descripcion} onChange={(e) => { touch(); setPresupuesto(presupuesto.map((x, k) => (k === i ? { ...x, descripcion: e.target.value } : x))); }} placeholder="Descripción" />
                                    <select className="input-field" aria-label="Fuente" value={it.fuente} onChange={(e) => { touch(); setPresupuesto(presupuesto.map((x, k) => (k === i ? { ...x, fuente: e.target.value } : x))); }}>
                                        {[...new Set([...FUENTES, it.fuente].filter(Boolean))].map((c) => <option key={c}>{c}</option>)}
                                    </select>
                                    <input className="input-field" aria-label="Costo en pesos" type="number" min="0" step="1000" value={it.costo} onChange={(e) => { touch(); setPresupuesto(presupuesto.map((x, k) => (k === i ? { ...x, costo: Number(e.target.value) } : x))); }} />
                                    <button type="button" className="obj-remove" onClick={() => { touch(); setPresupuesto(presupuesto.filter((_, k) => k !== i)); }} aria-label={`Quitar ${it.descripcion || 'rubro'}`}><Trash2 size={16} /></button>
                                </div>
                            ))}
                            <button type="button" className="ide-btn ide-btn--ghost obj-add" onClick={() => { touch(); setPresupuesto([...presupuesto, { id: Date.now(), categoria: 'Recursos Humanos', descripcion: '', justificacion: '', fuente: 'Personal', costo: 0 }]); }}><Plus size={15} /> Agregar rubro</button>
                            <p className="met-total">Total: <b>{money(totalPresupuesto)}</b></p>
                            <small className="ide-field-hint">El presupuesto se guarda al momento. Incluye los aportes propios y de la institución, aunque no impliquen pagos.</small>
                        </div>
                    )}
                    {onNavigate && tab === 'instrumentos' && <button type="button" className="ide-link" onClick={() => onNavigate('alcances')}>Revisa que el método respete tus alcances y limitaciones</button>}
                </div>

                <aside className="pla-side" aria-label="Tu metodología">
                    <p className="ide-synth-label">Así queda tu metodología</p>
                    <div className="pla-preview mar-preview" aria-live="polite">
                        {[['enfoque', partes.metEnfoque], ['tipo', partes.metTipo], ['diseno', partes.metDiseno], ['poblacion', partes.poblacionSugerida], ['analisis', partes.metPlanAnalisis], ['instrumentos', partes.instrumentos]].map(([key, text]) => (clean(text) ? (
                            <section key={key} data-active={tab === key}>
                                <h4>{SUBTITULOS.find((x) => x.key === key).label}</h4>
                                {text.split('\n').filter(Boolean).map((line) => <p key={line}>{line.replace(/\*\*/g, '').replace(/^- /, '• ')}</p>)}
                            </section>
                        ) : null))}
                        {cuenta.cronograma > 0 && <section data-active={tab === 'cronograma'}><h4>Cronograma</h4><p>{cuenta.cronograma} actividades en {periodos} {unidad === 'semanal' ? 'semanas' : 'meses'}.</p></section>}
                        {presupuesto.length > 0 && <section data-active={tab === 'presupuesto'}><h4>Presupuesto</h4><p>{presupuesto.length} rubros · {money(totalPresupuesto)}</p></section>}
                    </div>
                </aside>
            </div>
            {/* El instrumento completo de cada fila (encuesta o guía) se arma en una ventana grande y queda asociado a ella. */}
            <ArmarModal fila={f.instrumentos.find((it) => it.id && it.id === armar) || null} onClose={() => setArmar(null)} onNavigate={onNavigate} />
            <ValidacionModal
                open={Boolean(modal)}
                inicial={modal?.metodo}
                enCalculadora={Boolean(modal?.calculadora)}
                instrumento={modal ? clean(f.instrumentos[modal.index]?.instrumento) : ''}
                seleccionados={modal ? validacionesDe(f.instrumentos[modal.index]) : []}
                onToggle={(id) => modal && toggleValidacion(modal.index, id)}
                datos={modal ? f.instrumentos[modal.index]?.validacionDatos || {} : {}}
                onGuardar={(id, datos) => {
                    if (!modal) return;
                    const it = f.instrumentos[modal.index];
                    const actual = validacionesDe(it);
                    const next = actual.includes(id) ? actual : [...actual, id];
                    setFila('instrumentos', f.instrumentos, modal.index, { validaciones: next, validez: next[0] || '', validacionDatos: { ...(it.validacionDatos || {}), [id]: datos } });
                }}
                onClose={() => setModal(null)}
            />
        </div>
    );
};

/* ---------- Revisión ---------- */

const checkMetodologia = (s) => {
    const { enfoque, tipo, diseno, f, calc, especificos, presupuesto, quien, tipoEsperado, alcancesTexto } = s;
    const partes = redactarTodo(s);
    const m = MUESTREOS.find((x) => x.id === f.poblacion.muestreo);
    const n = tamanoMuestra(calc);
    const tipoAlcance = TIPOS.find((t) => alcancesTexto.toLowerCase().includes(`alcance ${t.alcance}`))?.id;
    const actividades = f.cronograma.filter((x) => clean(x.actividad));
    const fasesUsadas = new Set(actividades.map((x) => x.fase));
    const enfoqueTipo = !(enfoque === 'Cualitativo' && ['Correlacional', 'Explicativa'].includes(tipo));
    const total = presupuesto.reduce((sum, item) => sum + (Number(item.costo) || 0), 0);
    return [
        { id: 'enfoque', ok: Boolean(enfoque) && clean(f.enfoqueTexto).length > 20, label: 'Declara y justifica el enfoque', detail: 'Elige el enfoque y explica por qué corresponde a tus objetivos.' },
        { id: 'tipo', ok: Boolean(tipo) && (!tipoEsperado || tipo === tipoEsperado || tipo === tipoAlcance), label: 'El tipo coincide con lo que quieres lograr', detail: tipoEsperado ? `Según tu idea y tus alcances, el tipo es ${tipoEsperado.toLowerCase()}.` : 'Elige el tipo de investigación.' },
        { id: 'coherencia', ok: enfoqueTipo, label: 'El tipo es compatible con el enfoque', detail: 'Un enfoque cualitativo no mide correlaciones ni causas: revisa el enfoque o el tipo.' },
        { id: 'diseno', ok: Boolean(diseno) && (DISENOS[enfoque] || []).some((d) => d.id === diseno), label: 'El diseño pertenece al enfoque', detail: 'Elige un diseño de la lista de tu enfoque.' },
        { id: 'poblacion', ok: clean(f.poblacion.descripcion).length > 10 && (!quien || f.poblacion.descripcion.toLowerCase().includes(clean(quien).toLowerCase().split(/\s+/)[0])), label: 'Delimita la población', detail: quien ? `Tu población es «${clean(quien)}».` : 'Di quiénes, dónde y cuándo.' },
        { id: 'criterios', ok: clean(f.poblacion.inclusion).length > 5 && clean(f.poblacion.exclusion).length > 5, label: 'Tiene criterios de inclusión y exclusión', detail: 'Di quiénes entran al estudio y quiénes no.' },
        { id: 'muestra', ok: Boolean(m) && (m.probabilistico ? n > 0 && (!calc.finita || calc.N > n) : clean(f.poblacion.muestraTexto).length > 10 || m.id.startsWith('censo')), label: 'Justifica la muestra', detail: m?.probabilistico ? 'Revisa el tamaño de la población en la calculadora.' : 'Elige el muestreo y explica cómo se eligen los participantes.' },
        { id: 'analisis', ok: especificos.length > 0 && f.analisis.filter((x) => clean(x.tecnica)).length >= especificos.length, label: 'Hay un análisis para cada objetivo específico', detail: `Tienes ${especificos.length} específicos y ${f.analisis.filter((x) => clean(x.tecnica)).length} con técnica de análisis.` },
        { id: 'instrumentos', ok: f.instrumentos.some((x) => clean(x.instrumento) && clean(x.aplicaA)), label: 'Define los instrumentos y a quién se aplican', detail: 'Para cada técnica, el instrumento y a quiénes se aplica.' },
        { id: 'validez', ok: f.instrumentos.every((x) => !clean(x.instrumento) || validacionesDe(x).length > 0), label: 'Asegura la validez de los instrumentos', detail: 'Juicio de expertos, prueba piloto, alfa de Cronbach o un instrumento ya validado.' },
        { id: 'validez-calculo', ok: f.instrumentos.every((x) => estadoValidacion(x).every((v) => v.hecho)), label: 'Registra los resultados de validez y confiabilidad', detail: `Falta el cálculo de: ${f.instrumentos.flatMap((x) => estadoValidacion(x).filter((v) => !v.hecho).map((v) => `${v.titulo.toLowerCase()} (${clean(x.instrumento) || 'instrumento'})`)).join('; ') || '—'}. Hazlo en Instrumentos › «Hacer el cálculo».` },
        { id: 'cronograma', ok: actividades.length >= 5 && FASES.every((fase) => fasesUsadas.has(fase)), label: 'El cronograma cubre todas las fases', detail: `Tiene ${actividades.length} actividades; incluye preparación, recolección, análisis e informe.` },
        { id: 'presupuesto', ok: presupuesto.length >= 3 && total > 0, label: 'El presupuesto tiene al menos tres rubros', detail: `Tiene ${presupuesto.length} rubros por ${money(total)}.` },
        { id: 'textos', ok: Object.values(partes).filter((x) => clean(x)).length >= 6, label: 'Todos los subtítulos tienen texto', detail: 'Completa enfoque, tipo, diseño, población, plan de análisis e instrumentos.' },
    ];
};

const CRITERIOS = [
    { label: 'Coherente', text: 'Enfoque, tipo y diseño responden a tus objetivos y alcances.' },
    { label: 'Delimitada', text: 'Población con criterios y una muestra justificada.' },
    { label: 'Válida', text: 'Instrumentos con su validez y un análisis por objetivo.' },
    { label: 'Viable', text: 'Cronograma por fases y presupuesto realista.' },
];

const Revision = ({ intro }) => {
    const s = useMetState();
    const checks = checkMetodologia(s);
    const passed = checks.filter((item) => item.ok).length;
    return (
        <>
            <div className="ide-synth-left">
                {intro}
                <ul className="tit-criteria">
                    {CRITERIOS.map((item) => <li key={item.label}><b>{item.label}</b> {item.text}</li>)}
                </ul>
                <p className="ide-hint">La revisión se hace sobre lo que construiste en «Construye tu metodología».</p>
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
                <p className="ide-hint">Que el método sea viable en tu contexto lo confirma tu asesor.</p>
            </div>
        </>
    );
};

/* ---------- Clase ---------- */

const Metodologia = ({ onNavigate }) => {
    const { data } = useProject();
    const { especificos } = partesObjetivos(data.objetivos);
    const [demo, setDemo] = useState({ finita: true, N: 1200, Z: 1.96, e: 0.05 });
    const [verValidacion, setVerValidacion] = useState(false);

    const renderSlide = ({ slide, heading, goToSection, sectionMinutes, totalMinutes }) => ({
        portada: (
            <>
                <div>
                    {heading}
                    <p>La metodología explica cómo vas a lograr tus objetivos: con qué enfoque, de qué tipo, con qué diseño, con quiénes, con qué instrumentos, cómo analizarás los datos, en cuánto tiempo y con qué recursos.</p>
                    <p><strong>Al terminar esta clase podrás:</strong></p>
                    <ul className="ide-bullets">
                        <li>Elegir el enfoque, el tipo y el diseño acordes con tus objetivos.</li>
                        <li>Delimitar la población y calcular o justificar la muestra.</li>
                        <li>Escoger técnicas e instrumentos válidos.</li>
                        <li>Planear el análisis de cada objetivo.</li>
                        <li>Armar el cronograma y el presupuesto.</li>
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
        muestra: (
            <>
                <div>
                    {heading}
                    <p>Con un muestreo probabilístico, el tamaño de la muestra se calcula. Prueba la calculadora: cambia la población, la confianza y el error, y mira cómo cambia la muestra.</p>
                    <ul className="ide-bullets">
                        <li><b>Confianza</b>: qué tan seguro quieres estar (lo usual, 95 %).</li>
                        <li><b>Error</b>: cuánto te puedes equivocar (lo usual, 5 %).</li>
                        <li>A más confianza o menos error, más grande la muestra.</li>
                    </ul>
                </div>
                <Calculadora calc={demo} onChange={(patch) => setDemo((prev) => ({ ...prev, ...patch }))} />
            </>
        ),
        gantt: (
            <>
                <div>
                    {heading}
                    <p>El cronograma organiza las actividades en el tiempo, por fases: preparación, recolección, análisis e informe. Se presenta como un diagrama de Gantt.</p>
                    <p className="ide-hint">Deja tiempo para imprevistos: la recolección casi siempre toma más de lo previsto.</p>
                </div>
                <div className="ide-panel">
                    <h3>Ejemplo de diagrama de Gantt</h3>
                    <Gantt filas={CRONO_BASE.map((x, i) => ({ ...x, id: i }))} periodos={6} unidad="mensual" />
                </div>
            </>
        ),
        construye: (
            <Constructor
                onNavigate={onNavigate}
                intro={(
                    <>
                        {heading}
                        <p>Completa cada subtítulo en su pestaña. El texto se redacta solo; el cronograma se dibuja como diagrama de Gantt y el presupuesto suma el total.</p>
                    </>
                )}
            />
        ),
        revision: (
            <Revision
                intro={(
                    <>
                        {heading}
                        <p>Revisa que tu metodología sea coherente, válida y viable antes de llevarla a tu asesor.</p>
                    </>
                )}
            />
        ),
    })[slide.id] || (
        <Generica
            slide={slide}
            heading={heading}
            onNavigate={onNavigate}
            extra={slide.id === 'ins-validez' ? (
                <>
                    <button type="button" className="ide-btn ide-btn--primary" onClick={() => setVerValidacion(true)}>
                        <BookOpenCheck size={16} /> Ver cada método paso a paso
                    </button>
                    <ValidacionModal open={verValidacion} onClose={() => setVerValidacion(false)} />
                </>
            ) : null}
            aside={slide.status ? (
                <div className="ide-panel">
                    <h3>Siguiente paso</h3>
                    <p>En la construcción completarás los ocho subtítulos: el tipo de investigación y la población ya vienen de tu proyecto, y hay una fila de análisis por cada objetivo específico.</p>
                </div>
            ) : null}
        />
    );

    return (
        <SlideDeck
            sections={SECTIONS}
            slides={SLIDES}
            storageKey={SLIDE_KEY}
            label="Metodología"
            renderSlide={renderSlide}
            finish={onNavigate ? { label: 'Desarrollar las fases del proyecto', onClick: () => onNavigate('fases') } : null}
        />
    );
};

export default Metodologia;
