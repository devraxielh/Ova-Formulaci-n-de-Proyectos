import React, { useEffect, useRef, useState } from 'react';
import EditorRico from './EditorRico';
import {
    AlertTriangle, ArrowRight, BarChart3, CheckCircle2, Compass, FileText, Search, Target, XCircle,
} from 'lucide-react';
import SlideDeck, { Opciones, Pestanas } from './deck/SlideDeck';
import { useProjectField } from '../context/ProjectContext';
import { useAutoGuardar } from '../hooks/useAutoGuardar';
import { parrafosPlanteamiento } from '../data/ejemplos';
import './Titulo.css';
import './Planteamiento.css';

/* Clase de 60 minutos: la suma de `min` de todas las diapositivas. */
const SECTIONS = [
    { id: 'apertura', label: 'Apertura' },
    { id: 'estructura', label: 'Estructura' },
    { id: 'calidad', label: 'Calidad' },
    { id: 'cierre', label: 'Cierre' },
    { id: 'construccion', label: 'Construcción' },
    { id: 'revision', label: 'Revisión final' },
];

const SLIDES = [
    { id: 'portada', section: 'apertura', min: 3, title: 'El planteamiento: por qué existe tu investigación' },
    { id: 'quees', section: 'apertura', min: 3, title: 'Qué es y qué no es' },
    { id: 'embudo', section: 'apertura', min: 3, title: 'De lo general a lo particular' },
    { id: 'partes', section: 'estructura', min: 5, title: 'Las cinco partes del planteamiento' },
    { id: 'arbol', section: 'estructura', min: 4, title: 'Del árbol de problemas al texto' },
    { id: 'datos', section: 'estructura', min: 4, title: 'Los datos que lo sostienen' },
    { id: 'conectores', section: 'estructura', min: 4, title: 'Conectores para hilar los párrafos' },
    { id: 'errores', section: 'calidad', min: 3, title: 'Siete errores frecuentes' },
    { id: 'juzga', section: 'calidad', min: 4, title: '¿Bien planteado?' },
    { id: 'reescribe', section: 'calidad', min: 4, title: 'Antes y después' },
    { id: 'coherencia', section: 'calidad', min: 3, title: 'Todo debe llevar a la pregunta' },
    { id: 'repaso', section: 'cierre', min: 2, title: 'Repaso' },
    { id: 'cierre', section: 'cierre', min: 1, title: 'Lo que te llevas' },
    { id: 'construye', section: 'construccion', min: 10, title: 'Redacta tu planteamiento', layout: 'builder' },
    { id: 'revision', section: 'revision', min: 7, title: 'Qué hace bueno a un planteamiento' },
];

const SLIDE_KEY = 'projectsia:planteamiento:diapositiva';

/* ---------- Las cinco partes ---------- */

const PARTES = [
    {
        key: 'contexto', label: 'Contexto', color: 'que',
        what: 'Presenta el tema y la situación general: dónde ocurre y por qué importa. Va de lo general a lo particular.',
        hint: 'Dos o tres oraciones. Empieza por el panorama y acércate a tu lugar y tu población.',
        placeholder: 'Ej: En Colombia, la deserción en el primer año de universidad supera el 30 %… En el departamento de Córdoba…',
        conectores: ['En la actualidad,', 'En el contexto de', 'A nivel nacional,', 'En particular,'],
    },
    {
        key: 'descripcion', label: 'Descripción del problema', color: 'paraque',
        what: 'Dice qué está mal hoy, en quiénes y dónde, con datos que lo demuestren (síntomas).',
        hint: 'Incluye al menos un dato con su fuente: una cifra, un porcentaje, un informe.',
        placeholder: 'Ej: En una universidad pública de Montería, el 38 % de los estudiantes de primer semestre de ingeniería reprobó cálculo en 2025 (Oficina de Registro, 2025).',
        conectores: ['Según', 'De acuerdo con', 'Esta situación se evidencia en', 'Asimismo,'],
    },
    {
        key: 'causas', label: 'Causas', color: 'quien',
        what: 'Explica por qué ocurre: las raíces de tu árbol de problemas.',
        hint: 'Nombra dos o tres causas y, si puedes, respáldalas con un estudio.',
        placeholder: 'Ej: Entre las causas se encuentran los vacíos del bachillerato, el poco tiempo de estudio autónomo y…',
        conectores: ['Esto se debe a', 'Entre las causas se encuentran', 'Además,', 'A esto se suma'],
    },
    {
        key: 'efectos', label: 'Consecuencias', color: 'donde',
        what: 'Dice qué efectos tiene el problema y qué pasará si no se atiende: las ramas de tu árbol.',
        hint: 'Muestra lo que el problema ya causa y lo que podría pasar si continúa, para las personas, la institución o la región.',
        placeholder: 'Ej: Como consecuencia, aumentan la repitencia y la deserción temprana, y se alarga el tiempo de graduación…',
        conectores: ['Como consecuencia,', 'Por consiguiente,', 'Esto genera', 'De continuar esta situación,'],
    },
    {
        key: 'cierre', label: 'Párrafo de cierre', color: 'cuando',
        what: 'Sintetiza el problema y muestra por qué es necesario investigarlo: conduce a tu pregunta.',
        hint: 'Dos o tres oraciones: resume lo esencial (quiénes, qué problema, por qué importa) y anuncia lo que hace falta conocer. Tu pregunta va a continuación, en su propia sección.',
        placeholder: 'Ej: Por lo anterior, resulta necesario identificar los factores que explican la inasistencia de estos pacientes, como base para mejorar la atención…',
        conectores: ['Por lo anterior,', 'En síntesis,', 'En este sentido,', 'De ahí la necesidad de'],
    },
];

const PLANTEAMIENTO_FORM = { contexto: '', descripcion: '', causas: '', efectos: '', cierre: '' };

const clean = (text) => String(text || '').trim().replace(/[\s.,;:]+$/, '');
const countWords = (text) => String(text || '').trim().split(/\s+/).filter(Boolean).length;
const joinList = (items) => {
    const list = items.map(clean).filter(Boolean).map((item) => item.charAt(0).toLowerCase() + item.slice(1));
    if (list.length <= 1) return list[0] || '';
    return `${list.slice(0, -1).join(', ')} y ${list[list.length - 1]}`;
};

const assemble = (form) => PARTES.map((parte) => String(form[parte.key] || '').trim()).filter(Boolean).join('\n\n');

/* ---------- Revisión automática ---------- */

const checkPlanteamiento = (text, { quien, donde, pregunta }) => {
    const raw = String(text || '').trim();
    const lower = raw.toLowerCase();
    const words = countWords(raw);
    const paragraphs = raw.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);
    const last = (paragraphs[paragraphs.length - 1] || '').toLowerCase();
    const mentions = (value) => {
        const key = clean(value).toLowerCase().split(/[\s,]+/).filter((word) => word.length > 3)[0];
        return key ? lower.includes(key) : false;
    };
    const preguntaClave = clean(pregunta).toLowerCase().replace(/[¿?]/g, '').split(/\s+/).filter((word) => word.length > 5).slice(0, 4);
    return [
        { id: 'largo', ok: words >= 1200 && words <= 2400, label: 'Tiene una extensión adecuada', detail: `Tiene ${words} palabras; lo usual es entre 1200 y 2400.` },
        { id: 'parrafos', ok: paragraphs.length >= 4, label: 'Está organizado en párrafos', detail: `Tiene ${paragraphs.length} ${paragraphs.length === 1 ? 'párrafo' : 'párrafos'}; usa uno por parte (contexto, problema, causas, consecuencias y cierre).` },
        { id: 'datos', ok: /\d/.test(raw), label: 'Incluye datos', detail: 'Agrega al menos una cifra o porcentaje que muestre la magnitud del problema.' },
        { id: 'fuentes', ok: /\([^)]*\d{4}[^)]*\)|según|de acuerdo con/i.test(raw), label: 'Cita sus fuentes', detail: 'Indica de dónde salen los datos, por ejemplo (DANE, 2024) o «según el Ministerio de Educación».' },
        { id: 'quien', ok: quien ? mentions(quien) : true, label: 'Nombra la población', detail: quien ? `Tu población es «${clean(quien)}».` : '' },
        { id: 'donde', ok: donde ? mentions(donde) : true, label: 'Nombra el lugar', detail: donde ? `Tu lugar es «${clean(donde)}».` : '' },
        { id: 'causas', ok: /debido a|se debe|causa|factores|origina|por qué/i.test(raw), label: 'Explica las causas', detail: 'Di por qué ocurre el problema: «Esto se debe a…», «Entre las causas…».' },
        { id: 'efectos', ok: /consecuencia|efecto|genera|provoca|ocasiona|de continuar|si no se/i.test(raw), label: 'Muestra las consecuencias', detail: 'Di qué efectos tiene el problema y qué pasaría si no se atiende.' },
        { id: 'solucion', ok: !/se propone|la solución|se debe implementar|se implementará|desarrollar una (app|aplicación|plataforma)/i.test(raw), label: 'No propone la solución', detail: 'La solución va en los objetivos y la metodología; aquí solo se describe el problema.' },
        { id: 'cierre', ok: /por lo anterior|en síntesis|en este sentido|de ahí|en conclusión|por tanto|en suma|así las cosas|resulta necesario|es necesario/i.test(last), label: 'Termina con un párrafo de cierre', detail: 'Cierra sintetizando el problema y mostrando por qué hay que investigarlo: «Por lo anterior…», «En síntesis…».' },
        { id: 'pregunta', ok: preguntaClave.length === 0 || preguntaClave.filter((word) => lower.includes(word)).length >= Math.min(2, preguntaClave.length), label: 'Habla de lo mismo que tu pregunta', detail: pregunta ? `Tu pregunta es: ${clean(pregunta)}` : '' },
    ];
};

/* ---------- Contenido de los ejercicios ---------- */

const QUEES_QUIZ = [
    {
        text: '¿Cuál de estos fragmentos pertenece al planteamiento del problema?',
        options: [
            'Este estudio es importante porque aportará una herramienta útil para la universidad.',
            'El 38 % de los estudiantes de primer semestre reprobó cálculo en 2025, lo que ha aumentado la repitencia.',
            'Según Vygotsky, el aprendizaje ocurre en la zona de desarrollo próximo.',
        ],
        answer: 1,
        why: 'Describe la situación con un dato. El primero es justificación; el tercero, marco teórico.',
    },
];

const EMBUDO = [
    { label: 'Panorama amplio', text: 'En América Latina, cerca de la mitad de los estudiantes que ingresan a la universidad no termina su carrera.', note: 'Empieza con el tema en su escala más amplia, con un dato.' },
    { label: 'País o región', text: 'En Colombia, la deserción en el primer año supera el 30 %, y en Córdoba es aún mayor en las carreras de ingeniería.', note: 'Acércate a tu país y tu región.' },
    { label: 'Tu institución y población', text: 'En una universidad pública de Montería, el 38 % de los estudiantes de primer semestre de ingeniería reprobó cálculo en 2025.', note: 'Llega a tu población y tu lugar: aquí está tu problema.' },
    { label: 'Tu pregunta', text: '¿Qué factores determinan el bajo rendimiento en cálculo de los estudiantes de primer semestre de ingeniería de una universidad pública de Montería?', note: 'El embudo termina en la pregunta.' },
];

const PARTES_EJEMPLO = [
    { key: 'contexto', text: 'En Colombia, la deserción en el primer año de universidad supera el 30 %.' },
    { key: 'descripcion', text: 'En una universidad pública de Montería, el 38 % de los estudiantes de primer semestre de ingeniería reprobó cálculo en 2025 (Oficina de Registro, 2025).' },
    { key: 'causas', text: 'Esto se debe, entre otras causas, a vacíos del bachillerato y al poco tiempo de estudio autónomo.' },
    { key: 'efectos', text: 'Como consecuencia, aumentan la repitencia y la deserción temprana.' },
    { key: 'cierre', text: 'Por lo anterior, resulta necesario identificar los factores que explican este bajo rendimiento, como base para diseñar acciones de acompañamiento.' },
];

const DATOS_QUIZ = [
    {
        text: '¿Cuál afirmación está mejor sustentada?',
        options: [
            'Muchos estudiantes abandonan la universidad.',
            'El 30,1 % de los estudiantes abandona la universidad en el primer año (Ministerio de Educación Nacional, 2024).',
            'Todos sabemos que la deserción es un problema grave.',
        ],
        answer: 1,
        why: 'Tiene una cifra y dice de dónde sale. Las otras son opiniones o generalidades.',
    },
    {
        text: '¿Dónde buscarías datos sobre la población de un municipio colombiano?',
        options: ['En el DANE', 'En una red social', 'En un foro de opinión'],
        answer: 0,
        why: 'El DANE es la fuente oficial de estadísticas del país.',
    },
];

const CONECTORES = [
    { id: 'contexto', label: 'Contextualizar', what: 'Para abrir y situar el tema.', example: 'En la actualidad · En el contexto de · A nivel nacional · En el caso de' },
    { id: 'sumar', label: 'Agregar', what: 'Para sumar información en la misma dirección.', example: 'Además · Asimismo · De igual forma · A esto se suma' },
    { id: 'causa', label: 'Causa', what: 'Para explicar por qué ocurre.', example: 'Debido a · Esto se debe a · Dado que · A raíz de' },
    { id: 'consecuencia', label: 'Consecuencia', what: 'Para mostrar los efectos.', example: 'Como consecuencia · Por consiguiente · En consecuencia · Esto genera' },
    { id: 'contraste', label: 'Contraste', what: 'Para mostrar una tensión o un vacío.', example: 'Sin embargo · No obstante · A pesar de · Aun así' },
    { id: 'cierre', label: 'Cerrar', what: 'Para sintetizar y llevar a la pregunta.', example: 'Por lo anterior · En síntesis · En este sentido · De ahí la necesidad de' },
];

const ERRORES = [
    { error: 'No tiene datos', example: '«Es bien sabido que muchos estudiantes fracasan».', fix: 'Agrega cifras y su fuente: informes oficiales, estudios, registros de la institución.' },
    { error: 'Empieza demasiado lejos', example: 'Dos párrafos sobre la historia de la educación desde la Antigüedad.', fix: 'Un párrafo de contexto basta; llega rápido a tu población y tu lugar.' },
    { error: 'Mezcla varios problemas', example: 'Habla de deserción, salud mental y transporte a la vez.', fix: 'Quédate con un problema central; los demás pueden ser causas o efectos.' },
    { error: 'Propone la solución', example: '«Por eso se desarrollará una aplicación…».', fix: 'La solución va en los objetivos y la metodología; aquí solo describes.' },
    { error: 'Se confunde con la justificación', example: '«Este estudio es importante porque…».', fix: 'El planteamiento dice qué pasa; la justificación, por qué vale la pena investigarlo.' },
    { error: 'Opina sin fuentes', example: '«Creo que los docentes no se esfuerzan».', fix: 'Escribe en tercera persona y respalda cada afirmación.' },
    { error: 'No tiene párrafo de cierre', example: 'El texto acaba de golpe en las consecuencias.', fix: 'Termina con un párrafo que sintetice el problema y conduzca a tu pregunta.' },
];

const JUZGA_QUIZ = [
    { text: '«La tecnología ha cambiado el mundo desde la Revolución Industrial y hoy está en todas partes.»', options: ['Bien planteado', 'Mejorable'], answer: 1, why: 'Empieza demasiado lejos, sin datos ni población.' },
    { text: '«En 2025, el 42 % de los pacientes de consulta externa de un hospital de Sincelejo no asistió a su cita (Oficina de Estadística, 2025).»', options: ['Bien planteado', 'Mejorable'], answer: 0, why: 'Dato con fuente, población, lugar y periodo.' },
    { text: '«Por eso es necesario crear una app de recordatorios para el hospital.»', options: ['Bien planteado', 'Mejorable'], answer: 1, why: 'Propone la solución: eso va en los objetivos.' },
    { text: '«Esta inasistencia se debe, entre otras causas, al olvido de la cita y a la dificultad para reprogramarla (Gómez, 2023).»', options: ['Bien planteado', 'Mejorable'], answer: 0, why: 'Explica causas y las respalda con una fuente.' },
];

const ANTES_DESPUES = [
    {
        antes: 'Hoy en día hay muchos problemas en la educación y los estudiantes no aprenden matemáticas.',
        despues: 'En una universidad pública de Montería, el 38 % de los estudiantes de primer semestre de ingeniería reprobó cálculo en 2025 (Oficina de Registro, 2025), una cifra superior al promedio nacional.',
        porque: 'Se delimitó población y lugar y se agregó un dato con su fuente.',
    },
    {
        antes: 'Los comerciantes no usan pagos digitales porque no quieren, y por eso hay que capacitarlos.',
        despues: 'Solo el 18 % de los comerciantes de plazas de mercado de Montería acepta pagos digitales (Cámara de Comercio, 2024). Entre las causas se señalan la desconfianza en la seguridad y la baja alfabetización digital (Pérez, 2023).',
        porque: 'Se quitaron la opinión y la solución, y se agregaron dato, causas y fuentes.',
    },
];

const COHERENCIA_QUIZ = [
    {
        text: 'Pregunta: «¿Qué relación existe entre las horas de sueño y el rendimiento académico de estudiantes de primer semestre?». ¿Qué planteamiento la sostiene mejor?',
        options: [
            'Uno que describa el bajo rendimiento con datos y muestre que los estudiantes duermen pocas horas.',
            'Uno sobre la historia de las universidades en Colombia.',
            'Uno que proponga horarios de clase más tarde.',
        ],
        answer: 0,
        why: 'El planteamiento debe mostrar las dos variables de la pregunta: sueño y rendimiento.',
    },
];

const REPASO = [
    { text: 'El planteamiento del problema termina con…', options: ['La justificación', 'Un párrafo de cierre que sintetiza y conduce a la pregunta', 'Los objetivos'], answer: 1, why: 'El cierre resume el problema y muestra por qué hay que investigarlo; la pregunta va a continuación, en su propia sección.' },
    { text: '¿Qué parte responde «qué pasará si no se atiende»?', options: ['El contexto', 'Las causas', 'Las consecuencias o pronóstico'], answer: 2, why: 'El pronóstico muestra el costo de no investigar.' },
    { text: '¿Qué NO va en el planteamiento?', options: ['Datos con su fuente', 'La solución que vas a construir', 'Las causas del problema'], answer: 1, why: 'La solución va en los objetivos y la metodología.' },
];

/* ---------- Componentes interactivos ---------- */

const Embudo = () => {
    const [step, setStep] = useState(0);
    const isLast = step === EMBUDO.length - 1;
    return (
        <div className="ide-panel">
            <h3>Ejemplo: el embudo del planteamiento</h3>
            <ol className="tit-steps pla-funnel">
                {EMBUDO.slice(0, step + 1).map((item, index) => (
                    <li key={item.label} data-current={index === step} style={{ marginInline: `${index * 0.9}rem` }}>
                        <span>{item.label}</span>
                        <p>{item.text}</p>
                        {index === step && <small>{item.note}</small>}
                    </li>
                ))}
            </ol>
            <div className="ide-row">
                <span>Nivel {step + 1} de {EMBUDO.length}</span>
                <button type="button" className={`ide-btn ${isLast ? 'ide-btn--ghost' : 'ide-btn--primary'}`} onClick={() => setStep(isLast ? 0 : step + 1)}>
                    {isLast ? 'Empezar de nuevo' : <>Acercarse <ArrowRight size={15} /></>}
                </button>
            </div>
        </div>
    );
};

const Anatomia = () => {
    const [active, setActive] = useState('contexto');
    const current = PARTES.find((item) => item.key === active);
    const colorOf = (key) => PARTES.find((item) => item.key === key).color;
    return (
        <div className="ide-panel">
            <h3>Toca cada parte del ejemplo</h3>
            <p className="tit-anatomy pla-sample">
                {PARTES_EJEMPLO.map((item, index) => (
                    <React.Fragment key={item.key}>
                        {index > 0 && ' '}
                        <mark data-part={colorOf(item.key)} data-active={active === item.key}>{item.text}</mark>
                    </React.Fragment>
                ))}
            </p>
            <div className="ide-tabs" role="group" aria-label="Partes del planteamiento">
                {PARTES.map((item) => (
                    <button key={item.key} type="button" className="ide-chip" aria-pressed={active === item.key} onClick={() => setActive(item.key)}>
                        {item.label}
                    </button>
                ))}
            </div>
            <p className="tit-note" role="status">{current.what}</p>
        </div>
    );
};

const ArbolATexto = ({ idea }) => {
    const causas = [idea.causa1, idea.causa2, idea.causa3].map(clean).filter(Boolean);
    const efectos = [idea.efecto1, idea.efecto2, idea.efecto3].map(clean).filter(Boolean);
    const propio = Boolean(clean(idea.problema) || causas.length || efectos.length);
    const problema = clean(idea.problema) || 'Bajo rendimiento en matemáticas de estudiantes de primer semestre';
    const listaCausas = causas.length ? causas : ['Vacíos del bachillerato', 'Poco tiempo de estudio autónomo'];
    const listaEfectos = efectos.length ? efectos : ['Repitencia', 'Deserción temprana'];
    return (
        <div className="ide-panel">
            <h3>{propio ? 'Tu árbol de la Ideación' : 'Ejemplo de árbol'}</h3>
            <ul className="pla-map">
                <li data-part="donde"><span>Ramas · Efectos → párrafo de consecuencias</span><p>{listaEfectos.join(' · ')}</p></li>
                <li data-part="paraque"><span>Tronco · Problema → párrafo de descripción</span><p>{problema}</p></li>
                <li data-part="quien"><span>Raíces · Causas → párrafo de causas</span><p>{listaCausas.join(' · ')}</p></li>
            </ul>
            {!propio && <p className="ide-hint">Completa tu árbol en la Ideación y aquí verás el tuyo.</p>}
        </div>
    );
};

const AntesDespues = () => {
    const [open, setOpen] = useState({});
    return (
        <div className="ide-panel">
            <h3>Mira cómo se fortalece cada fragmento</h3>
            <ul className="tit-fixes">
                {ANTES_DESPUES.map((item, index) => (
                    <li key={item.antes}>
                        <p className="tit-before"><XCircle size={16} aria-hidden="true" /> {item.antes}</p>
                        {open[index] ? (
                            <>
                                <p className="tit-after"><CheckCircle2 size={16} aria-hidden="true" /> {item.despues}</p>
                                <small>{item.porque}</small>
                            </>
                        ) : (
                            <button type="button" className="ide-btn ide-btn--ghost" onClick={() => setOpen((prev) => ({ ...prev, [index]: true }))}>
                                Primero intenta mejorarlo tú; luego mira la versión fuerte
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

/* ---------- Constructor y revisión ---------- */

const usePlanteamientoState = () => {
    const [form, setForm] = useProjectField('planteamientoForm', PLANTEAMIENTO_FORM);
    const [planteamiento, setPlanteamiento] = useProjectField('planteamiento', '');
    const [pregunta] = useProjectField('pregunta', '');
    const [tituloForm] = useProjectField('tituloForm', null);
    const [idea] = useProjectField('idea', null);
    const f = { ...PLANTEAMIENTO_FORM, ...(form || {}) };
    const update = (patch) => setForm((prev) => ({ ...PLANTEAMIENTO_FORM, ...(prev || {}), ...patch }));
    const i = idea || {};
    const t = tituloForm || {};
    return {
        f, update, planteamiento, setPlanteamiento, pregunta, idea: i,
        quien: clean(t.quien || i.quien), donde: clean(t.donde || i.donde),
    };
};

const Constructor = ({ intro }) => {
    const { f, update, setPlanteamiento, pregunta, idea, quien, donde } = usePlanteamientoState();
    const [saved, setSaved] = useState(false);
    const [active, setActive] = useState('contexto');
    const prefilled = useRef(false);

    // La primera vez arma un borrador con el árbol de la Ideación y la pregunta.
    useEffect(() => {
        if (prefilled.current) return;
        prefilled.current = true;
        const patch = {};
        const causas = joinList([idea.causa1, idea.causa2, idea.causa3]);
        const efectos = joinList([idea.efecto1, idea.efecto2, idea.efecto3]);
        if (!f.descripcion.trim() && clean(idea.problema)) {
            patch.descripcion = `${donde ? `En ${donde}, ` : ''}${quien ? `${quien.charAt(0).toLowerCase()}${quien.slice(1)} presentan` : 'se presenta'} ${clean(idea.problema).charAt(0).toLowerCase()}${clean(idea.problema).slice(1)}. `;
        }
        if (!f.causas.trim() && causas) patch.causas = `Entre las causas de esta situación se encuentran ${causas}. `;
        if (!f.efectos.trim() && efectos) patch.efectos = `Como consecuencia, se presentan ${efectos}. `;
        if (Object.keys(patch).length > 0) update(patch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const text = assemble(f);
    const words = countWords(text);
    const filled = PARTES.filter((parte) => String(f[parte.key] || '').trim()).length;
    const field = (key) => (event) => { setSaved(false); update({ [key]: event.target.value }); };
    const addConnector = (key, connector) => {
        setSaved(false);
        const current = f[key] || '';
        update({ [key]: `${current}${current && !/\s$/.test(current) ? ' ' : ''}${connector} ` });
        document.getElementById(`pla-${key}`)?.focus();
    };
    const save = () => {
        if (!text) return;
        setPlanteamiento(text);
        setSaved(true);
    };
    // Guardado automático: lo redactado pasa a Mi proyecto sin tener que tocar «Guardar».
    useAutoGuardar(text, save);
    const meterState = words === 0 ? 'empty' : words < 1200 ? 'short' : words <= 2400 ? 'ok' : 'over';
    // Ejemplos armados con tu idea, población, lugar y pregunta (Tab los escribe en la caja vacía).
    const ejemplos = parrafosPlanteamiento({ idea, quien, donde, pregunta });

    return (
        <div className="pla-builder-wrap">
            <header className="pla-builder-head">
                <div>{intro}</div>
                <div className="pla-status">
                    <div className="tit-meter" data-state={meterState}>
                        <div className="tit-meter-bar" aria-hidden="true"><span style={{ width: `${Math.min(words, 2400) / 2400 * 100}%` }} /></div>
                        <p><b>{words} palabras</b> · {filled} de {PARTES.length} partes{words > 0 && words < 1200 ? ' · lo usual es entre 1200 y 2400' : ''}</p>
                    </div>
                    <button type="button" className="ide-btn ide-btn--primary" disabled={!text} onClick={save}>
                        <CheckCircle2 size={17} /> Guardar como mi planteamiento
                    </button>
                    {saved && <p className="ide-feedback ide-feedback--ok" role="status"><CheckCircle2 size={16} /><span>Guardado. Ya aparece en Mi proyecto.</span></p>}
                </div>
            </header>

            <div className="pla-builder">
                <form className="pla-parts" onSubmit={(event) => { event.preventDefault(); save(); }} noValidate>
                    {PARTES.map((parte, index) => (
                        <div className="input-group pla-part" data-part={parte.key} data-active={active === parte.key} key={parte.key}>
                            <label htmlFor={`pla-${parte.key}`}>
                                <mark data-part={parte.color} data-active="true">{index + 1}</mark> {parte.label}
                            </label>
                            <EditorRico
                                id={`pla-${parte.key}`}
                                className="textarea-field pla-textarea"
                                rows={5}
                                value={f[parte.key]}
                                onChange={field(parte.key)}
                                onFocus={() => setActive(parte.key)}
                                placeholder={ejemplos[parte.key] ? `Ej: ${ejemplos[parte.key]}` : parte.placeholder}
                                aria-describedby={`pla-${parte.key}-ayuda`}
                            />
                            <small className="ide-field-hint" id={`pla-${parte.key}-ayuda`}>{parte.hint}</small>
                            <div className="pla-connectors" role="group" aria-label={`Conectores para ${parte.label.toLowerCase()}`}>
                                {parte.conectores.map((connector) => (
                                    <button key={connector} type="button" className="ide-chip" onClick={() => addConnector(parte.key, connector)}>
                                        + {connector}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </form>

                <aside className="pla-side" aria-label="Tu planteamiento completo">
                    <p className="ide-synth-label">Tu planteamiento completo</p>
                    <div className="pla-preview" aria-live="polite">
                        {text
                            ? PARTES.filter((parte) => String(f[parte.key] || '').trim()).map((parte) => (
                                <p key={parte.key} data-active={active === parte.key}>
                                    <mark data-part={parte.color} data-active="true">{parte.label}</mark>
                                    {String(f[parte.key]).trim()}
                                </p>
                            ))
                            : <span className="tit-empty">Escribe cada parte y verás aquí tu planteamiento completo.</span>}
                    </div>
                </aside>
            </div>
        </div>
    );
};

const CRITERIOS = [
    { label: 'Fundamentado', text: 'Cada afirmación importante tiene un dato o una fuente.' },
    { label: 'Delimitado', text: 'Llega a tu población y tu lugar; no se queda en lo general.' },
    { label: 'Completo', text: 'Tiene contexto, problema, causas, consecuencias y párrafo de cierre.' },
    { label: 'Objetivo', text: 'Describe sin opinar y sin proponer la solución.' },
    { label: 'Coherente', text: 'Habla de lo mismo que tu pregunta y conduce a ella.' },
];

const Revision = ({ intro }) => {
    const { f, planteamiento, pregunta, quien, donde } = usePlanteamientoState();
    const own = planteamiento.trim() || assemble(f);
    const [text, setText] = useState(own);
    const target = text.trim();
    const isOwn = target === own;
    const checks = checkPlanteamiento(target, {
        quien: isOwn ? quien : '',
        donde: isOwn ? donde : '',
        pregunta: isOwn ? pregunta : '',
    });
    const passed = checks.filter((item) => item.ok).length;
    return (
        <>
            <div className="ide-synth-left">
                {intro}
                <ul className="tit-criteria">
                    {CRITERIOS.map((item) => <li key={item.label}><b>{item.label}</b> {item.text}</li>)}
                </ul>
                <label htmlFor="pla-revisar" className="ide-synth-label">Planteamiento a revisar</label>
                <textarea
                    id="pla-revisar"
                    className="textarea-field tit-review-input"
                    rows={8}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder="Pega un planteamiento o redáctalo en «Redacta tu planteamiento»"
                />
                {!isOwn && own && <button type="button" className="ide-link" onClick={() => setText(own)}>Volver a mi planteamiento</button>}
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
                    {isOwn ? 'Revisa la forma de tu planteamiento guardado.' : 'Revisando un texto distinto al tuyo: se omiten los criterios de tu población, lugar y pregunta.'} La veracidad de los datos la valida tu docente.
                </p>
            </div>
        </>
    );
};

/* ---------- Clase ---------- */

const PlanteamientoProblema = ({ onNavigate }) => {
    const [idea] = useProjectField('idea', null);
    const [pregunta] = useProjectField('pregunta', '');
    const [planteamiento] = useProjectField('planteamiento', '');
    const frase = clean(idea?.frase);

    const renderSlide = ({ slide, heading, goToSection, sectionMinutes, totalMinutes }) => ({
        portada: (
            <>
                <div>
                    {heading}
                    <p>El planteamiento describe la situación problemática que da origen a tu investigación y conduce a tu pregunta. Es el texto que convence al lector de que el problema existe y merece estudiarse.</p>
                    <p><strong>Al terminar esta clase podrás:</strong></p>
                    <ul className="ide-bullets">
                        <li>Distinguir el planteamiento de la justificación y del marco teórico.</li>
                        <li>Organizarlo en cinco partes, de lo general a lo particular.</li>
                        <li>Sustentarlo con datos y fuentes.</li>
                        <li>Hilar los párrafos con conectores.</li>
                        <li>Redactar el tuyo y revisarlo con criterios.</li>
                    </ul>
                    {(frase || clean(pregunta)) && (
                        <div className="tit-from-idea">
                            <span>Partirás de</span>
                            {frase && <p>{frase}</p>}
                            {clean(pregunta) && <p>{pregunta}</p>}
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
        quees: (
            <>
                <div>
                    {heading}
                    <ul className="ide-list">
                        <li><CheckCircle2 size={18} /><span><b>Es</b>La descripción de lo que está pasando, con datos, causas, consecuencias y un cierre que desemboca en tu pregunta.</span></li>
                        <li><XCircle size={18} /><span><b>No es la justificación</b>Esa dice por qué vale la pena investigar; va en su propia sección.</span></li>
                        <li><XCircle size={18} /><span><b>No es el marco teórico</b>Las teorías y conceptos se desarrollan después.</span></li>
                        <li><XCircle size={18} /><span><b>No es la solución</b>Lo que harás va en los objetivos y la metodología.</span></li>
                    </ul>
                </div>
                <Opciones title="¿Dónde va?" questions={QUEES_QUIZ} />
            </>
        ),
        embudo: (
            <>
                <div>
                    {heading}
                    <p>El planteamiento funciona como un embudo: empieza con el panorama amplio y se va cerrando hasta llegar a tu población, tu lugar y tu pregunta.</p>
                    <p className="ide-hint">Un párrafo de contexto basta. Si tardas más en llegar a tu problema, el lector se pierde.</p>
                </div>
                <Embudo />
            </>
        ),
        partes: (
            <>
                <div>
                    {heading}
                    <ol className="pla-steps-list">
                        {PARTES.map((parte) => <li key={parte.key}><b>{parte.label}</b> {parte.what}</li>)}
                    </ol>
                </div>
                <Anatomia />
            </>
        ),
        arbol: (
            <>
                <div>
                    {heading}
                    <p>Tu árbol de problemas ya es el esqueleto del planteamiento: el tronco se vuelve la descripción del problema, las raíces el párrafo de causas y las ramas el de consecuencias.</p>
                    <p className="ide-hint">En la construcción, las causas y los efectos de tu árbol aparecerán ya escritos como punto de partida.</p>
                </div>
                <ArbolATexto idea={idea || {}} />
            </>
        ),
        datos: (
            <>
                <div>
                    {heading}
                    <p>Un problema sin datos es una opinión. Cada afirmación importante debe tener una cifra o una fuente.</p>
                    <ul className="ide-list">
                        <li><BarChart3 size={18} /><span><b>Estadísticas oficiales</b>DANE, ministerios, gobernaciones, secretarías.</span></li>
                        <li><Search size={18} /><span><b>Estudios</b>Google Académico, SciELO, Redalyc, el repositorio de tu universidad.</span></li>
                        <li><FileText size={18} /><span><b>Registros de la institución</b>Informes internos, bases de datos, actas (con permiso).</span></li>
                    </ul>
                    {onNavigate && (
                        <button type="button" className="ide-btn ide-btn--ghost" onClick={() => onNavigate('referencias')}>
                            Agregar la fuente a mis referencias <ArrowRight size={15} />
                        </button>
                    )}
                </div>
                <Opciones title="Datos y fuentes" questions={DATOS_QUIZ} />
            </>
        ),
        conectores: (
            <>
                <div>
                    {heading}
                    <p>Los conectores hacen que los párrafos se lean como un argumento y no como una lista. Usa uno al inicio de cada párrafo y varíalos.</p>
                    <p className="ide-hint">En la construcción podrás insertarlos con un clic.</p>
                </div>
                <Pestanas title="Conectores según su función" name="conectores" items={CONECTORES} />
            </>
        ),
        errores: (
            <>
                <div>
                    {heading}
                    <p>Revisa si tu primera versión cae en alguno de estos errores.</p>
                </div>
                <div className="ide-panel">
                    <h3>Abre cada error para ver cómo corregirlo</h3>
                    <div className="ide-accordion">
                        {ERRORES.map((item, index) => (
                            <details key={item.error} open={index === 0}>
                                <summary>{item.error}</summary>
                                <p><em>{item.example}</em></p>
                                <p><strong>Cómo corregirlo:</strong> {item.fix}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </>
        ),
        juzga: (
            <>
                <div>
                    {heading}
                    <p>Lee cada fragmento y decide si sirve para un planteamiento tal como está.</p>
                    <p className="ide-hint">Para discutir en parejas: ¿cómo mejorarían los mejorables?</p>
                </div>
                <Opciones title="Juzga cada fragmento" questions={JUZGA_QUIZ} />
            </>
        ),
        reescribe: (
            <>
                <div>
                    {heading}
                    <p>Casi todos los fragmentos débiles se arreglan igual: delimitar, agregar datos con fuente y quitar opiniones y soluciones.</p>
                </div>
                <AntesDespues />
            </>
        ),
        coherencia: (
            <>
                <div>
                    {heading}
                    <p>El planteamiento debe mostrar las variables, la población y el lugar de tu pregunta. Si la pregunta habla de algo que el planteamiento no menciona, uno de los dos está mal.</p>
                    {clean(pregunta) && <div className="tit-saved"><span>Tu pregunta</span><p>{pregunta}</p></div>}
                </div>
                <Opciones title="¿Lo sostiene?" questions={COHERENCIA_QUIZ} />
            </>
        ),
        repaso: (
            <>
                <div>
                    {heading}
                    <p>Tres preguntas para comprobar lo aprendido.</p>
                </div>
                <Opciones title="Cuestionario de repaso" questions={REPASO} />
            </>
        ),
        cierre: (
            <>
                <div>
                    {heading}
                    <ul className="ide-bullets">
                        <li>El planteamiento describe lo que pasa y cierra conduciendo a tu pregunta.</li>
                        <li>Va de lo general a lo particular en cinco partes.</li>
                        <li>Cada afirmación importante tiene un dato o una fuente.</li>
                        <li>No opina, no justifica y no propone la solución.</li>
                    </ul>
                </div>
                <div className="ide-panel">
                    <h3>Siguiente paso</h3>
                    {planteamiento.trim()
                        ? <div className="tit-saved"><span>Tu planteamiento guardado</span><p>{countWords(planteamiento)} palabras</p></div>
                        : <p>Lo redactarás en la siguiente sección, con todo lo que acabas de repasar.</p>}
                    <p>Ten a mano tus datos y fuentes: los necesitarás para el párrafo de descripción.</p>
                </div>
            </>
        ),
        construye: (
            <Constructor
                intro={(
                    <>
                        {heading}
                        <p>Escribe cada parte en su caja: tu árbol de problemas ya está cargado como punto de partida. Agrega el contexto, los datos y sus fuentes, y une los párrafos con conectores.</p>
                    </>
                )}
            />
        ),
        revision: (
            <Revision
                intro={(
                    <>
                        {heading}
                        <p>Último paso: revisa tu planteamiento antes de llevarlo a tu asesor. También puedes pegar el planteamiento de otro trabajo para analizarlo.</p>
                    </>
                )}
            />
        ),
    })[slide.id];

    return (
        <SlideDeck
            sections={SECTIONS}
            slides={SLIDES}
            storageKey={SLIDE_KEY}
            label="Planteamiento del problema"
            renderSlide={renderSlide}
            finish={onNavigate ? { label: 'Definir los objetivos', onClick: () => onNavigate('objetivos') } : null}
        />
    );
};

export default PlanteamientoProblema;
