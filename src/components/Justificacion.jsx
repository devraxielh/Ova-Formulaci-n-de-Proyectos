import React, { useState } from 'react';
import EditorRico from './EditorRico';
import {
    AlertTriangle, CheckCircle2, HelpCircle, Gauge, HandHeart, Lightbulb, Target, Wrench, XCircle,
} from 'lucide-react';
import SlideDeck, { Opciones, Pestanas } from './deck/SlideDeck';
import { useProjectField } from '../context/ProjectContext';
import { useAutoGuardar } from '../hooks/useAutoGuardar';
import { parrafosJustificacion } from '../data/ejemplos';
import './Titulo.css';
import './Planteamiento.css';
import './Objetivos.css';
import './Justificacion.css';
import { construccionPrimero } from './deck/orden';

/* Clase de 60 minutos: la suma de `min` de todas las diapositivas. */
const SECTIONS = construccionPrimero([
    { id: 'apertura', label: 'Apertura' },
    { id: 'estructura', label: 'Argumentos' },
    { id: 'calidad', label: 'Calidad' },
    { id: 'cierre', label: 'Cierre' },
    { id: 'construccion', label: 'Construcción' },
    { id: 'revision', label: 'Revisión final' },
]);

const SLIDES = construccionPrimero([
    { id: 'portada', section: 'apertura', min: 3, title: 'La justificación: por qué vale la pena tu investigación' },
    { id: 'quees', section: 'apertura', min: 3, title: 'Qué es y qué no es' },
    { id: 'preguntas', section: 'apertura', min: 3, title: 'Las cuatro preguntas que responde' },
    { id: 'criterios', section: 'estructura', min: 5, title: 'Cinco criterios para argumentar' },
    { id: 'viabilidad', section: 'estructura', min: 4, title: 'Viabilidad: ¿se puede hacer?' },
    { id: 'evidencia', section: 'estructura', min: 4, title: 'Argumentos con evidencia' },
    { id: 'conectores', section: 'estructura', min: 4, title: 'Conectores para argumentar' },
    { id: 'diferencia', section: 'calidad', min: 3, title: 'Planteamiento y justificación no son lo mismo' },
    { id: 'errores', section: 'calidad', min: 4, title: 'Siete errores frecuentes' },
    { id: 'juzga', section: 'calidad', min: 4, title: '¿Es un buen argumento?' },
    { id: 'reescribe', section: 'calidad', min: 4, title: 'Antes y después' },
    { id: 'repaso', section: 'cierre', min: 2, title: 'Repaso' },
    { id: 'cierre', section: 'cierre', min: 1, title: 'Lo que te llevas' },
    { id: 'construye', section: 'construccion', min: 10, title: 'Redacta tu justificación', layout: 'builder' },
    { id: 'revision', section: 'revision', min: 6, title: 'Qué hace buena a una justificación' },
]);

const SLIDE_KEY = 'projectsia:justificacion:diapositiva';

/* ---------- Las cinco partes ---------- */

const PARTES = [
    {
        key: 'importancia', label: 'Conveniencia', color: 'que',
        what: '¿Por qué es importante y oportuno estudiar este problema ahora?',
        hint: 'Retoma el problema en una oración (no lo repitas entero) y di por qué conviene investigarlo hoy.',
        placeholder: 'Ej: Esta investigación es conveniente porque la deserción en primer semestre sigue en aumento y la universidad aún no conoce sus causas…',
        conectores: ['Esta investigación es conveniente porque', 'Resulta oportuno', 'En la actualidad,', 'Dado que'],
    },
    {
        key: 'social', label: 'Relevancia social', color: 'paraque',
        what: '¿Quiénes se benefician y de qué manera?',
        hint: 'Nombra a los beneficiarios directos (tu población) e indirectos (institución, familias, región) y qué ganan.',
        placeholder: 'Ej: Los principales beneficiarios serán los estudiantes de primer semestre, pues…',
        conectores: ['Los principales beneficiarios serán', 'De igual forma,', 'Esto permitirá a', 'Asimismo,'],
    },
    {
        key: 'practico', label: 'Implicaciones prácticas', color: 'quien',
        what: '¿Qué problema real ayudará a resolver y quién usará los resultados?',
        hint: 'Di qué decisión o acción podrá tomarse con tus resultados y quién la tomaría.',
        placeholder: 'Ej: En lo práctico, los resultados servirán a la oficina de bienestar para diseñar…',
        conectores: ['En lo práctico,', 'Los resultados servirán para', 'Esto contribuirá a', 'De este modo,'],
    },
    {
        key: 'teorico', label: 'Valor teórico y metodológico', color: 'donde',
        what: '¿Qué conocimiento nuevo aporta y qué deja para otros investigadores?',
        hint: 'Di qué vacío ayuda a llenar (pocos estudios en tu contexto) y si deja un instrumento o procedimiento reutilizable.',
        placeholder: 'Ej: En lo teórico, el estudio aportará evidencia sobre… En lo metodológico, dejará un cuestionario validado…',
        conectores: ['En lo teórico,', 'Desde el punto de vista metodológico,', 'Además,', 'Por otra parte,'],
    },
    {
        key: 'viabilidad', label: 'Viabilidad', color: 'cuando',
        what: '¿Cuentas con acceso, tiempo, recursos y permisos para hacerlo?',
        hint: 'Menciona el acceso a la población, el aval de la institución, el tiempo y los recursos con que cuentas.',
        placeholder: 'Ej: El estudio es viable porque se cuenta con el aval de la facultad, acceso a los registros académicos y…',
        conectores: ['El estudio es viable porque', 'Se cuenta con', 'Por último,', 'Finalmente,'],
    },
];

const JUST_FORM = { importancia: '', social: '', practico: '', teorico: '', viabilidad: '' };

const clean = (text) => String(text || '').trim().replace(/[\s.,;:]+$/, '');
const countWords = (text) => String(text || '').trim().split(/\s+/).filter(Boolean).length;
const assemble = (form) => PARTES.map((parte) => String(form[parte.key] || '').trim()).filter(Boolean).join('\n\n');

/* ---------- Revisión automática ---------- */

const checkJustificacion = (text, { quien, general }) => {
    const raw = String(text || '').trim();
    const lower = raw.toLowerCase();
    const words = countWords(raw);
    const paragraphs = raw.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);
    const quienClave = clean(quien).toLowerCase().split(/[\s,]+/).filter((word) => word.length > 3)[0];
    const generalClave = clean(general).toLowerCase().split(/\s+/).slice(1).filter((word) => word.length > 5).slice(0, 5);
    return [
        { id: 'largo', ok: words >= 1200 && words <= 2400, label: 'Tiene una extensión adecuada', detail: `Tiene ${words} palabras; lo usual es entre 1200 y 2400.` },
        { id: 'parrafos', ok: paragraphs.length >= 3, label: 'Está organizada en párrafos', detail: `Tiene ${paragraphs.length} ${paragraphs.length === 1 ? 'párrafo' : 'párrafos'}; usa uno por argumento.` },
        { id: 'beneficiarios', ok: /benefici|permitir[áa] a|favorecer/i.test(raw), label: 'Dice quiénes se benefician', detail: 'Nombra a los beneficiarios directos e indirectos: «Los principales beneficiarios serán…».' },
        { id: 'practico', ok: /práctic|servir[áa]n?|utilidad|tomar decisiones|aplicar/i.test(raw), label: 'Muestra la utilidad práctica', detail: 'Di qué decisión o acción podrá tomarse con los resultados.' },
        { id: 'teorico', ok: /teóric|conocimiento|evidencia|vacío|pocos estudios|literatura/i.test(raw), label: 'Señala el aporte al conocimiento', detail: 'Di qué vacío ayuda a llenar: «En lo teórico, aportará evidencia sobre…».' },
        { id: 'metodologico', ok: /metodológ|instrumento|procedimiento|cuestionario|modelo/i.test(raw), label: 'Menciona el aporte metodológico', detail: 'Si dejas un instrumento o procedimiento reutilizable, dilo. Si no, explica por qué el método es adecuado.' },
        { id: 'viabilidad', ok: /viable|factible|se cuenta con|acceso|recursos|aval/i.test(raw), label: 'Demuestra que es viable', detail: 'Menciona acceso a la población, aval, tiempo y recursos.' },
        { id: 'fuentes', ok: /\([^)]*\d{4}[^)]*\)|según|de acuerdo con/i.test(raw), label: 'Se apoya en fuentes', detail: 'Respalda al menos un argumento con un dato o estudio: (Autor, año).' },
        { id: 'opinion', ok: !/\b(yo creo|me gusta|me interesa|en mi opinión|considero que|siempre he|porque quiero)\b/i.test(raw), label: 'Argumenta sin opiniones personales', detail: 'Evita «me interesa», «yo creo»: el gusto personal no justifica una investigación.' },
        { id: 'pendientes', ok: !/\[[^\]]{3,}\]/.test(raw), label: 'No quedan partes por completar', detail: 'Reemplaza los textos entre corchetes [ … ] de los ejemplos por tu información.' },
        { id: 'poblacion', ok: !quienClave || lower.includes(quienClave), label: 'Nombra tu población', detail: quien ? `Tu población es «${clean(quien)}».` : '' },
        { id: 'objetivo', ok: generalClave.length === 0 || generalClave.filter((word) => lower.includes(word)).length >= Math.min(2, generalClave.length), label: 'Habla de lo mismo que tu objetivo', detail: general ? `Tu objetivo general es: ${clean(general)}` : '' },
    ];
};

/* ---------- Contenido de la clase ---------- */

const QUEES_QUIZ = [
    {
        text: '¿Cuál de estos fragmentos pertenece a la justificación?',
        options: [
            'El 38 % de los estudiantes de primer semestre reprobó cálculo en 2025.',
            'Los resultados permitirán a la facultad diseñar tutorías dirigidas a los estudiantes con mayor riesgo de reprobar.',
            'Según Ausubel, el aprendizaje significativo ocurre cuando…',
        ],
        answer: 1,
        why: 'Dice para qué servirán los resultados y a quién benefician. El primero es planteamiento; el tercero, marco teórico.',
    },
];

const PREGUNTAS = [
    { icon: Lightbulb, label: '¿Por qué?', text: 'Por qué es importante y oportuno estudiar este problema.' },
    { icon: HandHeart, label: '¿Para quién?', text: 'Quiénes se benefician con los resultados.' },
    { icon: Wrench, label: '¿Para qué?', text: 'Qué se podrá hacer con lo que encuentres: aporte práctico, teórico y metodológico.' },
    { icon: Gauge, label: '¿Es posible?', text: 'Si cuentas con acceso, tiempo y recursos para hacerlo.' },
];

const CRITERIOS_TEORIA = [
    { id: 'conveniencia', label: 'Conveniencia', what: '¿Qué tan oportuna es la investigación? ¿Para qué sirve?', example: 'Esta investigación es conveniente porque la inasistencia a citas creció 12 % en el último año y el hospital no conoce sus causas.' },
    { id: 'social', label: 'Relevancia social', what: '¿Quiénes se benefician y de qué modo? ¿Qué alcance social tiene?', example: 'Se beneficiarán los pacientes, que tendrán citas más oportunas, y el hospital, que aprovechará mejor sus horas de consulta.' },
    { id: 'practica', label: 'Implicaciones prácticas', what: '¿Ayudará a resolver un problema real?', example: 'Los resultados servirán a la oficina de atención al usuario para diseñar un sistema de recordatorios.' },
    { id: 'teorico', label: 'Valor teórico', what: '¿Llena un vacío de conocimiento? ¿Aporta evidencia nueva?', example: 'Existen pocos estudios sobre inasistencia en hospitales de la región Caribe; este aportará evidencia en ese contexto.' },
    { id: 'metodologico', label: 'Utilidad metodológica', what: '¿Deja un instrumento, un procedimiento o una forma nueva de medir?', example: 'Dejará un cuestionario validado para medir las barreras de acceso a la consulta externa.' },
];

const VIABILIDAD = [
    { label: 'Acceso', text: '¿Puedes llegar a tu población o a los datos?', note: 'Ej: los registros de citas del hospital y los pacientes en sala de espera.' },
    { label: 'Permisos', text: '¿Tienes o puedes obtener el aval de la institución y del comité de ética?', note: 'Ej: carta de aval de la gerencia del hospital.' },
    { label: 'Tiempo', text: '¿Te alcanza el tiempo del semestre o del programa?', note: 'Ej: la recolección dura seis semanas.' },
    { label: 'Recursos', text: '¿Tienes el dinero, los equipos y el apoyo necesarios?', note: 'Ej: encuestas en línea gratuitas y apoyo del asesor.' },
];

const EVIDENCIA_QUIZ = [
    {
        text: '¿Qué argumento convence más?',
        options: [
            'Este tema es muy importante para todos.',
            'Según el Ministerio de Salud (2024), una de cada cinco citas se pierde, lo que equivale a miles de horas de consulta sin usar al año.',
            'Me interesa este tema desde que hice mis prácticas.',
        ],
        answer: 1,
        why: 'Tiene un dato y una fuente. El primero es una generalidad y el tercero, un gusto personal.',
    },
];

const CONECTORES = [
    { id: 'causa', label: 'Dar razones', what: 'Para presentar por qué conviene la investigación.', example: 'Dado que · Puesto que · Ya que · Esta investigación es conveniente porque' },
    { id: 'adicion', label: 'Sumar argumentos', what: 'Para agregar otro beneficio o aporte.', example: 'Además · Asimismo · De igual forma · Por otra parte' },
    { id: 'finalidad', label: 'Indicar finalidad', what: 'Para decir para qué servirán los resultados.', example: 'Con el fin de · Para que · De este modo · Esto permitirá' },
    { id: 'cierre', label: 'Cerrar', what: 'Para terminar el argumento.', example: 'Por último · Finalmente · En consecuencia · Por todo lo anterior' },
];

const DIFERENCIA = [
    { tema: 'Pregunta que responde', pla: '¿Qué está pasando?', jus: '¿Por qué vale la pena investigarlo?' },
    { tema: 'Contenido', pla: 'Situación, datos, causas y consecuencias.', jus: 'Beneficiarios, utilidad, aportes y viabilidad.' },
    { tema: 'Tiempo verbal', pla: 'Presente: lo que ocurre.', jus: 'Futuro: lo que permitirán los resultados.' },
    { tema: 'Ejemplo', pla: 'El 22 % de las citas se pierde.', jus: 'Los resultados permitirán reducir las citas perdidas.' },
];

const ERRORES = [
    { error: 'Repetir el planteamiento', example: 'Volver a describir el problema con todos sus datos.', fix: 'Retómalo en una sola oración y pasa a explicar para qué servirá investigarlo.' },
    { error: 'Justificar con gustos personales', example: '«Escogí este tema porque me apasiona».', fix: 'Argumenta con beneficios para otros, no con tu motivación.' },
    { error: 'Beneficiarios vagos', example: '«Beneficiará a toda la sociedad».', fix: 'Nombra a quiénes exactamente y qué ganan: «los pacientes de consulta externa tendrán…».' },
    { error: 'Prometer demasiado', example: '«Solucionará el problema de la deserción en Colombia».', fix: 'Di lo que tus resultados permitirán, dentro del alcance de tu estudio.' },
    { error: 'Argumentos sin respaldo', example: '«Es un tema de gran importancia».', fix: 'Respáldalo con un dato o una fuente: (Autor, año).' },
    { error: 'Olvidar la viabilidad', example: 'No decir cómo se accederá a la población.', fix: 'Menciona acceso, aval, tiempo y recursos.' },
    { error: 'Desconectada de los objetivos', example: 'Justificar un tema distinto al de los objetivos.', fix: 'Cada argumento debe referirse a lo que vas a lograr.' },
];

const JUZGA_QUIZ = [
    {
        text: '«Esta investigación beneficiará a todo el mundo porque la educación es importante.»',
        options: ['Está bien', 'Hay que mejorarlo'],
        answer: 1,
        why: 'Beneficiarios vagos y sin respaldo. ¿Quiénes exactamente y qué ganan?',
    },
    {
        text: '«Los resultados permitirán a la coordinación académica identificar a tiempo a los estudiantes en riesgo de reprobar cálculo y remitirlos a tutorías.»',
        options: ['Está bien', 'Hay que mejorarlo'],
        answer: 0,
        why: 'Dice quién usará los resultados y para qué decisión.',
    },
    {
        text: '«Me interesa este tema porque mi hermano dejó la universidad.»',
        options: ['Está bien', 'Hay que mejorarlo'],
        answer: 1,
        why: 'Es una motivación personal, no un argumento. Puede inspirarte, pero no va en la justificación.',
    },
];

const ANTES_DESPUES = [
    { antes: 'Este proyecto es muy importante para la sociedad.', despues: 'Los resultados beneficiarán a los pacientes de consulta externa, que podrán acceder a citas más oportunas, y al hospital, que aprovechará mejor sus horas de consulta.', porque: 'Nombra a los beneficiarios y lo que ganan.' },
    { antes: 'Escogí este tema porque me gusta la tecnología.', despues: 'En lo práctico, el estudio servirá a la tienda para decidir en qué canales digitales invertir su presupuesto de publicidad.', porque: 'Cambia el gusto personal por una utilidad concreta.' },
    { antes: 'Hay muchos estudios, pero este será diferente.', despues: 'Aunque existen estudios sobre el tema en Bogotá y Medellín (Pérez, 2022), pocos se han hecho en municipios del Caribe; este aportará evidencia en ese contexto.', porque: 'Precisa el vacío de conocimiento y lo respalda con una fuente.' },
];

const REPASO = [
    {
        text: '¿Qué responde la justificación?',
        options: ['Qué está pasando', 'Por qué y para qué vale la pena investigar', 'Cómo se recogerán los datos'],
        answer: 1,
        why: 'Lo que pasa va en el planteamiento; cómo se hará, en la metodología.',
    },
    {
        text: '¿Cuál NO es un criterio de justificación?',
        options: ['Relevancia social', 'Gusto personal del investigador', 'Valor teórico'],
        answer: 1,
        why: 'Los criterios son conveniencia, relevancia social, implicaciones prácticas, valor teórico y utilidad metodológica.',
    },
    {
        text: '¿Qué demuestra la viabilidad?',
        options: ['Que el tema es interesante', 'Que se cuenta con acceso, tiempo, recursos y permisos', 'Que el problema es grave'],
        answer: 1,
        why: 'Una investigación valiosa pero imposible de hacer no se aprueba.',
    },
];

/* ---------- Piezas visuales ---------- */

const AntesDespues = () => {
    const [open, setOpen] = useState({});
    return (
        <div className="ide-panel">
            <h3>Mira cómo se fortalece cada argumento</h3>
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

const useJustificacionState = () => {
    const [form, setForm] = useProjectField('justificacionForm', JUST_FORM);
    const [justificacion, setJustificacion] = useProjectField('justificacion', '');
    const [general] = useProjectField('objetivoGeneral', '');
    const [tituloForm] = useProjectField('tituloForm', null);
    const [idea] = useProjectField('idea', null);
    const f = { ...JUST_FORM, ...(form || {}) };
    const update = (patch) => setForm((prev) => ({ ...JUST_FORM, ...(prev || {}), ...patch }));
    const i = idea || {};
    const t = tituloForm || {};
    return {
        f, update, justificacion, setJustificacion, general, idea: i,
        quien: clean(t.quien || i.quien), donde: clean(t.donde || i.donde),
    };
};

const Constructor = ({ intro }) => {
    const { f, update, setJustificacion, general, idea, quien, donde } = useJustificacionState();
    const [saved, setSaved] = useState(false);
    const [active, setActive] = useState('importancia');

    const text = assemble(f);
    const words = countWords(text);
    const filled = PARTES.filter((parte) => String(f[parte.key] || '').trim()).length;
    const pendientes = (text.match(/\[[^\]]{3,}\]/g) || []).length;
    const field = (key) => (event) => { setSaved(false); update({ [key]: event.target.value }); };
    const addConnector = (key, connector) => {
        setSaved(false);
        const current = f[key] || '';
        update({ [key]: `${current}${current && !/\s$/.test(current) ? ' ' : ''}${connector} ` });
        document.getElementById(`jus-${key}`)?.focus();
    };
    const save = () => {
        if (!text) return;
        setJustificacion(text);
        setSaved(true);
    };
    // Guardado automático: lo redactado pasa a Mi proyecto sin tener que tocar «Guardar».
    useAutoGuardar(text, save);
    const meterState = words === 0 ? 'empty' : words < 1200 ? 'short' : words <= 2400 ? 'ok' : 'over';
    // Ejemplos armados con tu idea, población, lugar y objetivo (Tab los escribe en la caja vacía).
    const ejemplos = parrafosJustificacion({ idea, quien, donde, general });

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
                        <CheckCircle2 size={17} /> Guardar como mi justificación
                    </button>
                    {saved && <p className="ide-feedback ide-feedback--ok" role="status"><CheckCircle2 size={16} /><span>Guardada. Ya aparece en Mi proyecto.</span></p>}
                    {pendientes > 0 && <p className="jus-pending"><AlertTriangle size={15} aria-hidden="true" /> {pendientes === 1 ? 'Queda 1 parte' : `Quedan ${pendientes} partes`} entre corchetes [ … ] por completar.</p>}
                </div>
            </header>

            <div className="pla-builder">
                <form className="pla-parts" onSubmit={(event) => { event.preventDefault(); save(); }} noValidate>
                    {PARTES.map((parte, index) => (
                        <div className="input-group pla-part" data-part={parte.key} data-active={active === parte.key} key={parte.key}>
                            <label htmlFor={`jus-${parte.key}`}>
                                <mark data-part={parte.color} data-active="true">{index + 1}</mark> {parte.label}
                            </label>
                            <small className="jus-what">{parte.what}</small>
                            <EditorRico
                                id={`jus-${parte.key}`}
                                className="textarea-field pla-textarea"
                                rows={5}
                                value={f[parte.key]}
                                onChange={field(parte.key)}
                                onFocus={() => setActive(parte.key)}
                                placeholder={ejemplos[parte.key] ? `Ej: ${ejemplos[parte.key]}` : parte.placeholder}
                                aria-describedby={`jus-${parte.key}-ayuda`}
                            />
                            <small className="ide-field-hint" id={`jus-${parte.key}-ayuda`}>{parte.hint}</small>
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

                <aside className="pla-side" aria-label="Tu justificación completa">
                    <p className="ide-synth-label">Tu justificación completa</p>
                    <div className="pla-preview" aria-live="polite">
                        {text
                            ? PARTES.filter((parte) => String(f[parte.key] || '').trim()).map((parte) => (
                                <p key={parte.key} data-active={active === parte.key}>
                                    <mark data-part={parte.color} data-active="true">{parte.label}</mark>
                                    {String(f[parte.key]).trim()}
                                </p>
                            ))
                            : <span className="tit-empty">Escribe cada argumento y verás aquí tu justificación completa. Tab en una caja vacía escribe el ejemplo armado con tu proyecto.</span>}
                    </div>
                </aside>
            </div>
        </div>
    );
};

const CRITERIOS = [
    { label: 'Argumentada', text: 'Cada razón tiene un dato, una fuente o un beneficio concreto.' },
    { label: 'Completa', text: 'Conveniencia, relevancia social, aportes y viabilidad.' },
    { label: 'Precisa', text: 'Nombra beneficiarios y usos reales, sin promesas exageradas.' },
    { label: 'Objetiva', text: 'Sin gustos ni motivaciones personales.' },
    { label: 'Coherente', text: 'Habla de lo mismo que tus objetivos.' },
];

const Revision = ({ intro }) => {
    const { f, justificacion, general, quien } = useJustificacionState();
    const own = justificacion.trim() || assemble(f);
    const [text, setText] = useState(own);
    const target = text.trim();
    const isOwn = target === own;
    const checks = checkJustificacion(target, { quien: isOwn ? quien : '', general: isOwn ? general : '' });
    const passed = checks.filter((item) => item.ok).length;
    return (
        <>
            <div className="ide-synth-left">
                {intro}
                <ul className="tit-criteria">
                    {CRITERIOS.map((item) => <li key={item.label}><b>{item.label}</b> {item.text}</li>)}
                </ul>
                <label htmlFor="jus-revisar" className="ide-synth-label">Justificación a revisar</label>
                <textarea
                    id="jus-revisar"
                    className="textarea-field tit-review-input"
                    rows={8}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder="Pega una justificación o redáctala en «Redacta tu justificación»"
                />
                {!isOwn && own && <button type="button" className="ide-link" onClick={() => setText(own)}>Volver a mi justificación</button>}
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
                    {isOwn ? 'Revisa la forma de tu justificación guardada.' : 'Revisando un texto distinto al tuyo: se omiten los criterios de tu población y tu objetivo.'} La solidez de los argumentos la valida tu asesor.
                </p>
            </div>
        </>
    );
};

/* ---------- Clase ---------- */

const Justificacion = ({ onNavigate }) => {
    const [general] = useProjectField('objetivoGeneral', '');
    const [planteamiento] = useProjectField('planteamiento', '');
    const [justificacion] = useProjectField('justificacion', '');

    const renderSlide = ({ slide, heading, goToSection, sectionMinutes, totalMinutes }) => ({
        portada: (
            <>
                <div>
                    {heading}
                    <p>La justificación convence al lector de que tu investigación vale la pena: explica por qué conviene hacerla, a quiénes beneficia, qué aporta y que es posible llevarla a cabo.</p>
                    <p><strong>Al terminar esta clase podrás:</strong></p>
                    <ul className="ide-bullets">
                        <li>Distinguir la justificación del planteamiento del problema.</li>
                        <li>Argumentar con los cinco criterios de justificación.</li>
                        <li>Demostrar la viabilidad de tu estudio.</li>
                        <li>Respaldar tus argumentos con evidencia y conectores.</li>
                        <li>Redactar la tuya y revisarla con criterios.</li>
                    </ul>
                    {clean(general) && (
                        <div className="tit-from-idea">
                            <span>Justificarás este objetivo</span>
                            <p>{general}</p>
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
                        <li><CheckCircle2 size={18} /><span><b>Es</b>Los argumentos de por qué y para qué hacer la investigación, con sus beneficiarios, aportes y viabilidad.</span></li>
                        <li><XCircle size={18} /><span><b>No es el planteamiento</b>Ese describe el problema; aquí solo lo retomas en una oración.</span></li>
                        <li><XCircle size={18} /><span><b>No es tu motivación personal</b>Que te guste el tema no convence a un evaluador.</span></li>
                        <li><XCircle size={18} /><span><b>No es la metodología</b>Cómo lo harás va después.</span></li>
                    </ul>
                </div>
                <Opciones title="¿Dónde va?" questions={QUEES_QUIZ} />
            </>
        ),
        preguntas: (
            <>
                <div>
                    {heading}
                    <p>Una buena justificación responde cuatro preguntas. Si un evaluador lee la tuya, debe poder contestarlas todas.</p>
                    <p className="ide-hint">Para discutir en parejas: respondan las cuatro preguntas de su proyecto en voz alta, en una frase cada una.</p>
                </div>
                <div className="ide-panel">
                    <h3>Lo que el lector quiere saber</h3>
                    <ul className="jus-questions">
                        {PREGUNTAS.map(({ icon: Icon, label, text }) => (
                            <li key={label}><Icon size={20} aria-hidden="true" /><span><b>{label}</b>{text}</span></li>
                        ))}
                    </ul>
                </div>
            </>
        ),
        criterios: (
            <>
                <div>
                    {heading}
                    <p>Hernández Sampieri propone cinco criterios para evaluar el valor de una investigación. No todos aplican siempre, pero cuantos más cubras, más sólida será tu justificación.</p>
                    <p className="ide-hint">En la construcción, cada criterio tendrá su propio párrafo; el valor teórico y el metodológico van juntos.</p>
                </div>
                <Pestanas title="Los cinco criterios, con ejemplo" name="jus-criterios" items={CRITERIOS_TEORIA} />
            </>
        ),
        viabilidad: (
            <>
                <div>
                    {heading}
                    <p>Una investigación valiosa que no se puede hacer no se aprueba. La viabilidad demuestra que tienes lo necesario para llevarla a cabo.</p>
                    <p className="ide-hint">Si algo falta (por ejemplo, el aval), di cómo lo vas a conseguir.</p>
                </div>
                <div className="ide-panel">
                    <h3>Cuatro condiciones para que sea viable</h3>
                    <ol className="obj-chain jus-chain">
                        {VIABILIDAD.map((item) => (
                            <li key={item.label}><span>{item.label}</span><p>{item.text}</p><small>{item.note}</small></li>
                        ))}
                    </ol>
                </div>
            </>
        ),
        evidencia: (
            <>
                <div>
                    {heading}
                    <p>Un argumento sin respaldo es una opinión. Apoya tus razones con datos, estudios previos o normas que muestren la necesidad.</p>
                    <ul className="ide-list">
                        <li><HelpCircle size={18} /><span><b>Datos</b>Cifras del problema y de cuántas personas afecta.</span></li>
                        <li><HelpCircle size={18} /><span><b>Estudios previos</b>Lo que otros encontraron y lo que falta por saber (el vacío).</span></li>
                        <li><HelpCircle size={18} /><span><b>Políticas y normas</b>Planes de desarrollo, leyes o metas institucionales con las que se alinea tu estudio.</span></li>
                    </ul>
                </div>
                <Opciones title="¿Cuál convence más?" questions={EVIDENCIA_QUIZ} />
            </>
        ),
        conectores: (
            <>
                <div>
                    {heading}
                    <p>La justificación es un texto argumentativo: los conectores muestran cómo se suman las razones. Usa uno al inicio de cada párrafo y varíalos.</p>
                    <p className="ide-hint">En la construcción podrás insertarlos con un clic.</p>
                </div>
                <Pestanas title="Conectores según su función" name="jus-conectores" items={CONECTORES} />
            </>
        ),
        diferencia: (
            <>
                <div>
                    {heading}
                    <p>Es el error más común: escribir en la justificación lo mismo del planteamiento. Compara.</p>
                    {planteamiento.trim() && <p className="ide-hint">Ya escribiste tu planteamiento ({countWords(planteamiento)} palabras): no lo repitas, retómalo en una oración.</p>}
                </div>
                <div className="ide-panel">
                    <h3>Planteamiento vs. justificación</h3>
                    <div className="jus-table" role="table">
                        <div role="row" className="jus-row jus-row--head">
                            <span role="columnheader" />
                            <span role="columnheader">Planteamiento</span>
                            <span role="columnheader">Justificación</span>
                        </div>
                        {DIFERENCIA.map((item) => (
                            <div role="row" className="jus-row" key={item.tema}>
                                <span role="rowheader">{item.tema}</span>
                                <span role="cell">{item.pla}</span>
                                <span role="cell">{item.jus}</span>
                            </div>
                        ))}
                    </div>
                </div>
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
                    <p>Lee cada fragmento y decide si sirve para una justificación tal como está.</p>
                    <p className="ide-hint">Para discutir en parejas: ¿cómo mejorarían los mejorables?</p>
                </div>
                <Opciones title="Juzga cada argumento" questions={JUZGA_QUIZ} />
            </>
        ),
        reescribe: (
            <>
                <div>
                    {heading}
                    <p>Casi todos los argumentos débiles se arreglan igual: nombrar beneficiarios concretos, decir para qué sirven los resultados y respaldarlo con una fuente.</p>
                </div>
                <AntesDespues />
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
                        <li>La justificación responde por qué, para quién, para qué y si es posible.</li>
                        <li>Se argumenta con conveniencia, relevancia social, implicaciones prácticas, valor teórico y utilidad metodológica.</li>
                        <li>Cada argumento tiene un beneficio concreto o una fuente.</li>
                        <li>No repite el planteamiento ni usa gustos personales.</li>
                    </ul>
                </div>
                <div className="ide-panel">
                    <h3>Siguiente paso</h3>
                    {justificacion.trim()
                        ? <div className="tit-saved"><span>Tu justificación guardada</span><p>{countWords(justificacion)} palabras</p></div>
                        : <p>La redactarás en la siguiente sección, con ejemplos armados con tu proyecto.</p>}
                    <p>Ten a mano un dato o un estudio que respalde la importancia de tu tema.</p>
                </div>
            </>
        ),
        construye: (
            <Constructor
                intro={(
                    <>
                        {heading}
                        <p>Escribe un párrafo por argumento. Tab en una caja vacía escribe un ejemplo armado con tu proyecto: completa lo que está entre corchetes y une los párrafos con conectores.</p>
                    </>
                )}
            />
        ),
        revision: (
            <Revision
                intro={(
                    <>
                        {heading}
                        <p>Último paso: revisa tu justificación antes de llevarla a tu asesor. También puedes pegar la justificación de otro trabajo para analizarla.</p>
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
            label="Justificación"
            renderSlide={renderSlide}
            finish={onNavigate ? { label: 'Definir alcances y limitaciones', onClick: () => onNavigate('alcances') } : null}
        />
    );
};

export default Justificacion;
