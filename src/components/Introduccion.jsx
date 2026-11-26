import React, { useEffect, useState } from 'react';
import EditorRico from './EditorRico';
import { AlertTriangle, BookOpen, CheckCircle2, Clock, Eye, Target, Wand2, XCircle } from 'lucide-react';
import SlideDeck, { Opciones, Pestanas } from './deck/SlideDeck';
import { useProject, useProjectField } from '../context/ProjectContext';
import { useAutoGuardar } from '../hooks/useAutoGuardar';
import { buildDocument } from '../services/projectDoc';
import './Titulo.css';
import './Planteamiento.css';
import './Objetivos.css';
import './Justificacion.css';
import { construccionPrimero } from './deck/orden';
import TEORIA from '../data/teoria/introduccion';

/* Clase de 60 minutos: la suma de `min` de todas las diapositivas. */
const SECTIONS = construccionPrimero([
    { id: 'apertura', label: 'Apertura' },
    { id: 'estructura', label: 'Estructura' },
    { id: 'calidad', label: 'Calidad' },
    { id: 'cierre', label: 'Cierre' },
    { id: 'construccion', label: 'Construcción' },
    { id: 'revision', label: 'Revisión' },
]);

const SLIDES = construccionPrimero([
    { id: 'portada', section: 'apertura', min: 3, title: 'La introducción: la puerta de entrada a tu proyecto' },
    { id: 'quees', section: 'apertura', min: 3, title: 'Qué es y qué no es' },
    { id: 'alfinal', section: 'apertura', min: 3, title: 'Se escribe al final, se lee primero' },
    { id: 'partes', section: 'estructura', min: 5, title: 'Los seis movimientos de una introducción' },
    { id: 'embudo', section: 'estructura', min: 4, title: 'Del tema general a tu objetivo' },
    { id: 'estilo', section: 'estructura', min: 4, title: 'Tiempo verbal, persona y tono' },
    { id: 'conectores', section: 'estructura', min: 4, title: 'Conectores para guiar al lector' },
    { id: 'errores', section: 'calidad', min: 4, title: 'Siete errores frecuentes' },
    { id: 'juzga', section: 'calidad', min: 4, title: '¿Va en la introducción?' },
    { id: 'reescribe', section: 'calidad', min: 4, title: 'Antes y después' },
    { id: 'coherencia', section: 'calidad', min: 3, title: 'Debe decir lo mismo que tu proyecto' },
    { id: 'repaso', section: 'cierre', min: 2, title: 'Repaso' },
    { id: 'cierre', section: 'cierre', min: 1, title: 'Lo que te llevas' },
    { id: 'construye', section: 'construccion', min: 10, title: 'Redacta tu introducción', layout: 'builder' },
    { id: 'revision', section: 'revision', min: 6, title: 'Qué hace buena a una introducción' },
]);

const SLIDE_KEY = 'projectsia:introduccion:diapositiva';
const MIN_PALABRAS = 500;
const MAX_PALABRAS = 1000;

/* ---------- Utilidades ---------- */

const clean = (text) => String(text || '').trim().replace(/[\s.,;:]+$/, '');
const lower = (text) => (text ? text.charAt(0).toLowerCase() + text.slice(1) : '');
const countWords = (text) => String(text || '').trim().split(/\s+/).filter(Boolean).length;
const primeraOracion = (text) => (String(text || '').trim().match(/^[^.?!]+[.?!]/) || [''])[0].trim();
const generalDe = (objetivos, objetivoGeneral) => clean(objetivoGeneral)
    || clean((String(objetivos || '').split(/###\s*Objetivos espec[ií]ficos/i)[0] || '').replace(/###\s*Objetivo general/i, ''));

/* ---------- Los seis movimientos ---------- */

const PARTES = [
    {
        key: 'contexto', label: 'Contexto', color: 'que',
        what: 'Presenta el tema amplio y por qué importa hoy.',
        hint: 'Uno o dos párrafos, con un dato si lo tienes. Empieza por lo general.',
        placeholder: 'Ej: En la actualidad, la inasistencia a citas médicas es uno de los problemas que más afecta la eficiencia de los servicios de salud…',
        conectores: ['En la actualidad,', 'En los últimos años,', 'A nivel nacional,', 'En el contexto de'],
    },
    {
        key: 'problema', label: 'Problema', color: 'paraque',
        what: 'Resume el problema en tu población y tu lugar.',
        hint: 'Uno o dos párrafos: es la síntesis del planteamiento (qué pasa, en quiénes y dónde). No lo repitas entero.',
        placeholder: 'Ej: En un hospital de Sincelejo, los pacientes de consulta externa presentan una alta tasa de inasistencia a sus citas…',
        conectores: ['En particular,', 'En este contexto,', 'Esta situación se presenta en', 'Sin embargo,'],
    },
    {
        key: 'importancia', label: 'Importancia y vacío', color: 'quien',
        what: 'Dice por qué vale la pena estudiarlo y qué falta por saber.',
        hint: 'Un párrafo: la síntesis de la justificación (a quién beneficia y qué no se conoce todavía).',
        placeholder: 'Ej: Aunque el problema es conocido, no se han estudiado sus factores en esta institución, lo que impide diseñar acciones…',
        conectores: ['Por esta razón,', 'Aunque', 'No obstante,', 'De ahí la importancia de'],
    },
    {
        key: 'objetivo', label: 'Objetivo y pregunta', color: 'donde',
        what: 'Presenta lo que busca tu investigación: tu objetivo general y tu pregunta, tal como están en tu proyecto.',
        hint: 'Sale de tus Objetivos y de tu Pregunta.',
        placeholder: 'Ej: En consecuencia, esta investigación tiene como objetivo analizar los factores asociados a…, para responder a la pregunta: ¿…?',
        conectores: ['En consecuencia,', 'Por lo anterior,', 'Este estudio tiene como objetivo', 'Así, se busca responder'],
    },
    {
        key: 'metodo', label: 'Método', color: 'cuando',
        what: 'Anticipa cómo se hará, en una o dos oraciones.',
        hint: 'Enfoque, tipo o alcance, población y técnica principal. El detalle va en la metodología.',
        placeholder: 'Ej: Para ello, se desarrolla un estudio cuantitativo de alcance correlacional, con una encuesta aplicada a los pacientes…',
        conectores: ['Para ello,', 'Con este propósito,', 'Metodológicamente,', 'Se propone'],
    },
    {
        key: 'organizacion', label: 'Organización del documento', color: 'extra1',
        what: 'Cuenta al lector cómo está organizado el documento.',
        hint: 'Una oración por bloque, en el orden en que aparecen las secciones.',
        placeholder: 'Ej: El documento se organiza así: primero se presenta el planteamiento del problema; luego, los objetivos y la justificación…',
        conectores: ['El documento se organiza así:', 'En primer lugar,', 'Luego,', 'Finalmente,'],
    },
];

const INTRO_FORM = { contexto: '', problema: '', importancia: '', objetivo: '', metodo: '', organizacion: '' };
const assemble = (form) => PARTES.map((parte) => String(form[parte.key] || '').trim()).filter(Boolean).join('\n\n');

// Cómo se nombra cada sección al contar la organización del documento.
const NOMBRE_SECCION = {
    planteamiento: 'el planteamiento del problema', pregunta: 'la pregunta de investigación', objetivos: 'los objetivos',
    justificacion: 'la justificación', alcances: 'los alcances y limitaciones', marco: 'el marco referencial',
    metodologia: 'la metodología', poblacion: 'la población y muestra', instrumentos: 'el plan de análisis e instrumentos',
    cronograma: 'el cronograma', presupuesto: 'el presupuesto', fases: 'el desarrollo de las fases del proyecto',
    resultados: 'los resultados y la discusión', conclusiones: 'las conclusiones', referencias: 'las referencias', resumen: 'el resumen',
};
const conLos = (text) => {
    const t = lower(clean(text));
    return /^(el|la|los|las|un|una|unos|unas)\s/i.test(t) ? t : `los ${t}`;
};

// La parte «Método» no se escribe a mano: sale de la Metodología (enfoque, tipo, diseño, población y técnicas).
// Devuelve '' mientras la Metodología no tenga al menos el enfoque o el tipo.
export const metodoDesdeMetodologia = (data) => {
    const halla = (texto, patron) => (String(texto || '').match(patron) || [])[1]?.toLowerCase() || '';
    const enfoque = halla(data.metEnfoque, /enfoque\s+(cuantitativo|cualitativo|mixto)/i) || halla(data.metEnfoque, /\b(cuantitativo|cualitativo|mixto)\b/i);
    const tipo = halla(data.metTipo, /\b(exploratori[oa]|descriptiv[oa]|correlacional|explicativ[oa]|evaluativ[oa]|propositiv[oa]|proyectiv[oa]|aplicad[oa])\b/i);
    const diseno = halla(data.metDiseno, /\b(no experimental|cuasiexperimental|preexperimental|experimental|estudio de caso|fenomenológico|etnográfico|investigación[- ]acción|teoría fundamentada|narrativo)\b/i);
    const corte = halla(data.metDiseno, /\b(transversal|longitudinal)\b/i);
    if (!enfoque && !tipo) return '';
    const idea = data.idea || {};
    const t = data.tituloForm || {};
    const quien = clean(t.quien || idea.quien);
    const donde = clean(t.donde || idea.donde);
    const tecnicas = [...new Set((Array.isArray(data.metodologiaForm?.instrumentos) ? data.metodologiaForm.instrumentos : []).map((i) => lower(clean(i?.tecnica))).filter(Boolean))];
    const lista = (items) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}` : items[0] || '');
    const rasgos = [enfoque && `de enfoque ${enfoque}`, tipo && `de tipo ${tipo.replace(/a$/, 'o')}`, diseno && `con un diseño ${diseno}${corte ? ` ${corte}` : ''}`].filter(Boolean);
    return `Para ello, se desarrolla un estudio ${lista(rasgos)}${quien ? `, con ${conLos(quien)}` : ''}${quien && donde ? ` de ${donde}` : ''}${tecnicas.length ? `, mediante ${lista(tecnicas)}` : ''}.`;
};

// «Objetivo y pregunta» también es automático: sale de los Objetivos y de la Pregunta, tal como están en el proyecto.
export const objetivoDesdeProyecto = (data) => {
    const general = generalDe(data.objetivos, data.objetivoGeneral);
    const pregunta = clean(data.pregunta);
    return general ? `En consecuencia, esta investigación tiene como objetivo ${lower(general.replace(/\.$/, ''))}${pregunta ? `, para responder a la pregunta: ${pregunta}` : '.'}` : '';
};

// Borradores de cada movimiento armados con lo que ya está en el proyecto.
const borradores = (data) => {
    const idea = data.idea || {};
    const t = data.tituloForm || {};
    const quien = clean(t.quien || idea.quien);
    const donde = clean(t.donde || idea.donde);
    const problema = lower(clean(idea.problema));
    const general = generalDe(data.objetivos, data.objetivoGeneral);
    const pregunta = clean(data.pregunta);
    const pf = data.planteamientoForm || {};
    const jf = data.justificacionForm || {};
    const tipo = (String(data.alcances || '').match(/alcance (exploratorio|descriptivo comparativo|descriptivo|correlacional|explicativo predictivo|explicativo|evaluativo|propositivo)/i) || [])[1];
    const enfoque = clean(data.enfoque);
    const sections = buildDocument(data).filter((s) => s.inDocument !== false && s.content.length > 0 && !['titulo', 'introduccion', 'resumen'].includes(s.id));
    const nombres = sections.map((section) => NOMBRE_SECCION[section.id] || section.label.toLowerCase());
    const organizacion = nombres.length === 0 ? ''
        : nombres.length === 1 ? `El documento presenta ${nombres[0]}.`
            : nombres.length === 2 ? `El documento se organiza así: en primer lugar, se presenta ${nombres[0]} y, finalmente, ${nombres[1]}.`
                : `El documento se organiza así: en primer lugar, se presenta ${nombres[0]}; luego, ${nombres.slice(1, -1).join(', ')}; y, finalmente, ${nombres[nombres.length - 1]}.`;
    return {
        contexto: primeraOracion(pf.contexto) || (problema ? `En la actualidad, ${problema} es una situación que preocupa [agrega un dato del país o la región y su fuente].` : ''),
        problema: problema ? `${donde ? `En ${donde}, ` : ''}${quien ? `${conLos(quien)} presentan` : 'se presenta'} ${problema}${idea.efecto1 ? `, lo que genera ${lower(clean(idea.efecto1))}` : ''}.` : '',
        importancia: primeraOracion(jf.importancia) || (problema ? `Aunque ${problema} es conocido, no se han estudiado sus causas en esta población, lo que impide [di qué no se puede hacer sin este conocimiento].` : ''),
        objetivo: objetivoDesdeProyecto(data),
        metodo: metodoDesdeMetodologia(data) || (tipo || enfoque
            ? `Para ello, se desarrolla un estudio${enfoque ? ` de enfoque ${enfoque.toLowerCase()}` : ''}${tipo ? ` de alcance ${tipo.toLowerCase()}` : ''}${quien ? ` con ${lower(quien)}` : ''}${donde ? ` de ${donde}` : ''}, mediante [nombra la técnica principal, por ejemplo una encuesta].`
            : ''),
        organizacion,
    };
};

/* ---------- Revisión automática ---------- */

const checkIntro = (text, { general, pregunta, quien }) => {
    const raw = String(text || '').trim();
    const lowerText = raw.toLowerCase();
    const words = countWords(raw);
    const paragraphs = raw.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);
    const claves = (value) => clean(value).toLowerCase().replace(/[¿?]/g, '').split(/\s+/).filter((word) => word.length > 5).slice(0, 6);
    const coincide = (value) => {
        const keys = claves(value);
        return keys.length === 0 || keys.filter((word) => lowerText.includes(word)).length >= Math.min(3, keys.length);
    };
    const quienClave = clean(quien).toLowerCase().split(/[\s,]+/).filter((word) => word.length > 3)[0];
    return [
        { id: 'largo', ok: words >= MIN_PALABRAS && words <= MAX_PALABRAS, label: 'Tiene una extensión adecuada', detail: `Tiene ${words} palabras; lo usual es entre ${MIN_PALABRAS} y ${MAX_PALABRAS}.` },
        { id: 'parrafos', ok: paragraphs.length >= 4, label: 'Está organizada en párrafos', detail: `Tiene ${paragraphs.length} ${paragraphs.length === 1 ? 'párrafo' : 'párrafos'}; usa uno por movimiento.` },
        { id: 'contexto', ok: /en la actualidad|en los últimos años|a nivel (nacional|mundial|regional)|en colombia|en el contexto/i.test(paragraphs[0] || ''), label: 'Abre con el contexto', detail: 'Empieza por el tema amplio: «En la actualidad…», «En Colombia…».' },
        { id: 'poblacion', ok: !quienClave || lowerText.includes(quienClave), label: 'Presenta el problema en tu población', detail: quien ? `Tu población es «${clean(quien)}».` : '' },
        { id: 'importancia', ok: /importan|conveniente|benefici|vacío|no se ha|no se han|pocos estudios|necesario/i.test(raw), label: 'Dice por qué importa', detail: 'Resume en un párrafo por qué vale la pena y qué falta por saber.' },
        { id: 'objetivo', ok: /objetivo|tiene como propósito|busca|pretende/i.test(raw), label: 'Presenta el objetivo', detail: '«Esta investigación tiene como objetivo…».' },
        { id: 'general', ok: !general || coincide(general), label: 'El objetivo coincide con el de tu proyecto', detail: general ? `Tu objetivo general es: ${clean(general)}` : '' },
        { id: 'pregunta', ok: /¿[^?]+\?/.test(raw) || /pregunta/i.test(raw) || (pregunta && coincide(pregunta)), label: 'Incluye la pregunta', detail: 'Presenta tu pregunta de investigación.' },
        { id: 'metodo', ok: /enfoque|diseño|metodolog|alcance (exploratorio|descriptivo|correlacional|explicativo|evaluativo|propositivo)|encuesta|entrevista|estudio de caso/i.test(raw), label: 'Anticipa el método', detail: 'En una o dos oraciones: enfoque, alcance y técnica principal.' },
        { id: 'organizacion', ok: /el documento se organiza|se organiza (así|de la siguiente)|en primer lugar|apartado|capítulo|sección|finalmente/i.test(paragraphs[paragraphs.length - 1] || ''), label: 'Termina con la organización del documento', detail: 'Cierra contando qué secciones vienen y en qué orden.' },
        { id: 'resultados', ok: !/(se encontró|los resultados (muestran|evidencian|indican)|se concluyó|se demostró)/i.test(raw), label: 'No adelanta resultados', detail: 'Es una propuesta: aún no hay resultados ni conclusiones.' },
        { id: 'pendientes', ok: !/\[[^\]]{3,}\]/.test(raw), label: 'No quedan partes por completar', detail: 'Reemplaza los textos entre corchetes [ … ] por tu información.' },
    ];
};

/* ---------- Contenido de la clase ---------- */

const QUEES_QUIZ = [
    {
        text: '¿Cuál de estos fragmentos va en la introducción?',
        options: [
            'Según Ajzen (1991), la intención de una conducta depende de la actitud, la norma subjetiva y el control percibido.',
            'Este documento presenta una propuesta para analizar los factores asociados a la inasistencia a citas médicas en un hospital de Sincelejo.',
            'Se aplicó la encuesta a 278 pacientes entre marzo y mayo.',
        ],
        answer: 1,
        why: 'Presenta el proyecto completo. El primero es marco teórico; el tercero, metodología o resultados.',
    },
];

const ALFINAL = [
    { label: 'Se escribe al final', text: 'Resume problema, objetivo, importancia y método: solo se puede escribir cuando todo eso existe.', note: 'Si la escribes primero, tendrás que rehacerla.' },
    { label: 'Se lee primero', text: 'Es lo primero que lee el evaluador: decide si sigue leyendo con interés.', note: 'Debe ser clara, breve y fiel al proyecto.' },
    { label: 'Va de primera en el documento', text: 'Después del título y antes del planteamiento del problema.', note: 'En PROJECTSIA aparece así en Mi proyecto y en el Word.' },
];

const EMBUDO = [
    { label: 'Tema general', text: 'En la actualidad, la inasistencia a citas médicas afecta la eficiencia de los servicios de salud en el país.', note: 'Contexto amplio.' },
    { label: 'Tu problema', text: 'En un hospital de Sincelejo, una de cada cinco citas de consulta externa se pierde.', note: 'Población y lugar.' },
    { label: 'Lo que falta', text: 'Aunque el problema es conocido, no se han estudiado sus factores en esta institución.', note: 'El vacío que justifica el estudio.' },
    { label: 'Tu objetivo', text: 'Esta investigación tiene como objetivo analizar los factores asociados a la inasistencia de estos pacientes.', note: 'La punta del embudo.' },
];

const ESTILO = [
    { id: 'tiempo', label: 'Tiempo verbal', what: 'En una propuesta, presente para lo que hace el documento y futuro para lo que hará el estudio.', example: '«Este documento presenta…», «El estudio analizará…».' },
    { id: 'persona', label: 'Persona', what: 'Tercera persona o impersonal; evita «yo» y «mi».', example: '«Se propone…», «Esta investigación busca…» en lugar de «Yo quiero…».' },
    { id: 'tono', label: 'Tono', what: 'Claro y directo, sin adornos ni frases vacías.', example: 'Evita «Desde tiempos inmemoriales…» o «Es bien sabido que…».' },
    { id: 'citas', label: 'Citas', what: 'Pocas y solo para datos clave; la teoría va en el marco referencial.', example: '«…una de cada cinco citas se pierde (Oficina de Estadística, 2025)».' },
];

const CONECTORES = [
    { id: 'abrir', label: 'Abrir', what: 'Para situar el tema.', example: 'En la actualidad · En los últimos años · A nivel nacional' },
    { id: 'enfocar', label: 'Enfocar', what: 'Para pasar de lo general a tu caso.', example: 'En particular · En este contexto · Sin embargo' },
    { id: 'concluir', label: 'Llevar al objetivo', what: 'Para presentar lo que harás.', example: 'En consecuencia · Por lo anterior · Así' },
    { id: 'ordenar', label: 'Ordenar', what: 'Para contar la organización del documento.', example: 'En primer lugar · Luego · A continuación · Finalmente' },
];

const ERRORES = [
    { error: 'Escribirla primero', example: 'Redactar la introducción antes de tener objetivos y método.', fix: 'Escríbela al final, cuando el resto del proyecto esté listo.' },
    { error: 'Copiar el planteamiento', example: 'Pegar todos los párrafos del planteamiento.', fix: 'Resume el problema en uno o dos párrafos: qué pasa, en quiénes y dónde.' },
    { error: 'Empezar demasiado lejos', example: '«Desde el inicio de la humanidad, la salud…».', fix: 'Empieza por el tema actual y llega a tu problema en dos o tres oraciones.' },
    { error: 'Olvidar el objetivo', example: 'Contexto y problema, pero nunca dice qué busca el estudio.', fix: 'Incluye el objetivo general y la pregunta, tal como están en el proyecto.' },
    { error: 'Un objetivo distinto al del proyecto', example: 'La introducción dice «diseñar una app» y el objetivo general dice «analizar factores».', fix: 'Copia el objetivo general; si cambió, actualiza la introducción.' },
    { error: 'Adelantar resultados', example: '«Se encontró que el olvido es la principal causa».', fix: 'En una propuesta aún no hay resultados: di lo que el estudio busca.' },
    { error: 'No contar la organización', example: 'Terminar en el objetivo sin decir qué sigue.', fix: 'Cierra con un párrafo que anticipe las secciones del documento.' },
];

const JUZGA_QUIZ = [
    {
        text: '«Desde tiempos inmemoriales, el ser humano se ha preocupado por su salud.»',
        options: ['Sí va', 'No va'],
        answer: 1,
        why: 'Es una frase vacía y demasiado lejana. Empieza por el tema actual con un dato.',
    },
    {
        text: '«Para ello, se desarrolla un estudio cuantitativo de alcance correlacional, mediante una encuesta a los pacientes de consulta externa.»',
        options: ['Sí va', 'No va'],
        answer: 0,
        why: 'Anticipa el método en una oración: es justo lo que pide la introducción.',
    },
    {
        text: '«Los resultados muestran que el 41 % de los pacientes olvidó su cita.»',
        options: ['Sí va', 'No va'],
        answer: 1,
        why: 'Es un resultado: en una propuesta todavía no existe.',
    },
];

const ANTES_DESPUES = [
    { antes: 'Desde siempre, la salud ha sido muy importante para todos.', despues: 'En la actualidad, la inasistencia a citas médicas es uno de los problemas que más afecta la eficiencia de la consulta externa en Colombia (Ministerio de Salud, 2024).', porque: 'Cambia una frase vacía por el tema actual con un dato.' },
    { antes: 'En este trabajo vamos a investigar muchas cosas sobre las citas.', despues: 'Esta investigación tiene como objetivo analizar los factores asociados a la inasistencia a citas médicas en los pacientes de consulta externa de un hospital de Sincelejo.', porque: 'Presenta el objetivo exacto del proyecto, en tercera persona.' },
    { antes: 'Después viene lo demás del trabajo.', despues: 'El documento se organiza así: primero se presenta el planteamiento del problema y la pregunta; luego, los objetivos, la justificación y los alcances; finalmente, el marco referencial y la metodología.', porque: 'Anticipa las secciones en orden.' },
];

const REPASO = [
    {
        text: '¿Cuándo se escribe la introducción?',
        options: ['Primero, para orientar el proyecto', 'Al final, cuando el resto del proyecto está listo', 'En cualquier momento'],
        answer: 1,
        why: 'Resume todo el proyecto: solo se puede escribir al final.',
    },
    {
        text: '¿Qué movimiento cierra la introducción?',
        options: ['El contexto', 'La organización del documento', 'Los resultados'],
        answer: 1,
        why: 'Termina contando al lector qué secciones vienen y en qué orden.',
    },
    {
        text: '¿Qué NO va en la introducción de una propuesta?',
        options: ['El objetivo general', 'Los resultados', 'Una síntesis del problema'],
        answer: 1,
        why: 'En una propuesta aún no hay resultados.',
    },
];

/* ---------- Piezas visuales ---------- */

const Cadena = ({ title, items }) => (
    <div className="ide-panel">
        <h3>{title}</h3>
        <ol className="obj-chain">
            {items.map((item) => (
                <li key={item.label}><span>{item.label}</span><p>{item.text}</p><small>{item.note}</small></li>
            ))}
        </ol>
    </div>
);

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

const useIntroState = () => {
    const { data } = useProject();
    const [form, setForm] = useProjectField('introduccionForm', INTRO_FORM);
    const [introduccion, setIntroduccion] = useProjectField('introduccion', '');
    const f = { ...INTRO_FORM, ...(form || {}) };
    const update = (patch) => setForm((prev) => ({ ...INTRO_FORM, ...(prev || {}), ...patch }));
    const idea = data.idea || {};
    const t = data.tituloForm || {};
    return {
        data, f, update, introduccion, setIntroduccion,
        general: generalDe(data.objetivos, data.objetivoGeneral),
        pregunta: clean(data.pregunta),
        quien: clean(t.quien || idea.quien),
    };
};

const Constructor = ({ intro, onNavigate }) => {
    const { data, f, update, setIntroduccion } = useIntroState();
    const [saved, setSaved] = useState(false);
    const [active, setActive] = useState('contexto');
    const ejemplos = borradores(data);

    // «Método» es automático: se copia de la Metodología cada vez que cambia. Mientras la Metodología no esté,
    // la parte queda desactivada (y conserva lo que tuviera de antes, para no borrar trabajo).
    const metodoAuto = metodoDesdeMetodologia(data);
    useEffect(() => {
        if (metodoAuto && f.metodo !== metodoAuto) update({ metodo: metodoAuto });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [metodoAuto]);
    // «Objetivo y pregunta» funciona igual: se llena sola con el objetivo general y la pregunta, y se actualiza con ellos.
    const objetivoAuto = objetivoDesdeProyecto(data);
    useEffect(() => {
        if (objetivoAuto && f.objetivo !== objetivoAuto) update({ objetivo: objetivoAuto });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [objetivoAuto]);
    // Partes que no se escriben aquí: de dónde salen y qué decir mientras falta su origen.
    const AUTO = {
        metodo: { valor: metodoAuto, falta: 'Se llenará sola cuando completes tu Metodología (enfoque y tipo de investigación).', lista: 'Sale de tu Metodología y se actualiza sola. Para cambiarla, edita la Metodología.', pendiente: 'Esta parte no se escribe aquí: sale de tu Metodología.', destino: 'metodologia', ir: 'Ir a Metodología', definir: 'Definir la Metodología' },
        objetivo: { valor: objetivoAuto, falta: 'Se llenará sola cuando redactes tu objetivo general (y tu pregunta de investigación).', lista: `Sale de tus Objetivos${clean(data.pregunta) ? ' y de tu Pregunta' : ''} y se actualiza sola. Para cambiarla, edita ${clean(data.pregunta) ? 'esas clases' : 'los Objetivos'}.`, pendiente: 'Esta parte no se escribe aquí: sale de tus Objetivos y de tu Pregunta.', destino: 'objetivos', ir: 'Ir a Objetivos', definir: 'Redactar los Objetivos' },
    };

    const text = assemble(f);
    const words = countWords(text);
    const filled = PARTES.filter((parte) => String(f[parte.key] || '').trim()).length;
    const pendientes = (text.match(/\[[^\]]{3,}\]/g) || []).length;
    const field = (key) => (event) => { setSaved(false); update({ [key]: event.target.value }); };
    const addConnector = (key, connector) => {
        setSaved(false);
        const current = f[key] || '';
        update({ [key]: `${current}${current && !/\s$/.test(current) ? ' ' : ''}${connector} ` });
        document.getElementById(`int-${key}`)?.focus();
    };
    const componer = () => {
        setSaved(false);
        const patch = {};
        PARTES.forEach((parte) => { if (!AUTO[parte.key] && !String(f[parte.key] || '').trim() && ejemplos[parte.key]) patch[parte.key] = ejemplos[parte.key]; });
        update(patch);
    };
    const save = () => {
        if (!text) return;
        setIntroduccion(text);
        setSaved(true);
    };
    // Guardado automático: lo redactado pasa a Mi proyecto sin tener que tocar «Guardar».
    useAutoGuardar(text, save);
    const meterState = words === 0 ? 'empty' : words < MIN_PALABRAS ? 'short' : words <= MAX_PALABRAS ? 'ok' : 'over';
    const vacios = PARTES.filter((parte) => !AUTO[parte.key] && !String(f[parte.key] || '').trim() && ejemplos[parte.key]).length;

    return (
        <div className="pla-builder-wrap">
            <header className="pla-builder-head">
                <div>{intro}</div>
                <div className="pla-status">
                    <div className="tit-meter" data-state={meterState}>
                        <div className="tit-meter-bar" aria-hidden="true"><span style={{ width: `${Math.min(words, MAX_PALABRAS) / MAX_PALABRAS * 100}%` }} /></div>
                        <p><b>{words} palabras</b> · {filled} de {PARTES.length} movimientos{words > 0 && words < MIN_PALABRAS ? ` · lo usual es entre ${MIN_PALABRAS} y ${MAX_PALABRAS}` : ''}</p>
                    </div>
                    {vacios > 0 && (
                        <button type="button" className="ide-btn ide-btn--ghost" onClick={componer}>
                            <Wand2 size={16} /> Armar un borrador con mi proyecto
                        </button>
                    )}
                    <button type="button" className="ide-btn ide-btn--primary" disabled={!text} onClick={save}>
                        <CheckCircle2 size={17} /> Guardar como mi introducción
                    </button>
                    {saved && <p className="ide-feedback ide-feedback--ok" role="status"><CheckCircle2 size={16} /><span>Guardada. Ya aparece de primera en Mi proyecto.</span></p>}
                    {pendientes > 0 && <p className="jus-pending"><AlertTriangle size={15} aria-hidden="true" /> {pendientes === 1 ? 'Queda 1 parte' : `Quedan ${pendientes} partes`} entre corchetes [ … ] por completar.</p>}
                </div>
            </header>

            <div className="pla-builder">
                <form className="pla-parts" onSubmit={(event) => { event.preventDefault(); save(); }} noValidate>
                    {PARTES.map((parte, index) => (
                        <div className="input-group pla-part" data-part={parte.key} data-active={active === parte.key} key={parte.key}>
                            <label htmlFor={`int-${parte.key}`}>
                                <mark data-part={parte.color} data-active="true">{index + 1}</mark> {parte.label}
                            </label>
                            <small className="jus-what">{parte.what}</small>
                            {AUTO[parte.key] ? (
                                <div className="int-auto" data-lista={Boolean(AUTO[parte.key].valor)} aria-live="polite">
                                    <p id={`int-${parte.key}`} className="int-auto-texto">{AUTO[parte.key].valor || clean(f[parte.key]) || AUTO[parte.key].falta}</p>
                                    <small>
                                        {AUTO[parte.key].valor ? AUTO[parte.key].lista : AUTO[parte.key].pendiente}
                                        {onNavigate && <> <button type="button" className="ide-link" onClick={() => onNavigate(AUTO[parte.key].destino)}>{AUTO[parte.key].valor ? AUTO[parte.key].ir : AUTO[parte.key].definir}</button></>}
                                    </small>
                                </div>
                            ) : (
                            <>
                            <EditorRico
                                id={`int-${parte.key}`}
                                className="textarea-field pla-textarea"
                                rows={4}
                                value={f[parte.key]}
                                onChange={field(parte.key)}
                                onFocus={() => setActive(parte.key)}
                                placeholder={ejemplos[parte.key] ? `Ej: ${ejemplos[parte.key]}` : parte.placeholder}
                            />
                            <small className="ide-field-hint">{parte.hint}</small>
                            <div className="pla-connectors" role="group" aria-label={`Conectores para ${parte.label.toLowerCase()}`}>
                                {parte.conectores.map((connector) => (
                                    <button key={connector} type="button" className="ide-chip" onClick={() => addConnector(parte.key, connector)}>
                                        + {connector}
                                    </button>
                                ))}
                            </div>
                            </>
                            )}
                        </div>
                    ))}
                </form>

                <aside className="pla-side" aria-label="Tu introducción completa">
                    <p className="ide-synth-label">Tu introducción completa</p>
                    <div className="pla-preview" aria-live="polite">
                        {text
                            ? PARTES.filter((parte) => String(f[parte.key] || '').trim()).map((parte) => (
                                <p key={parte.key} data-active={active === parte.key}>
                                    <mark data-part={parte.color} data-active="true">{parte.label}</mark>
                                    {String(f[parte.key]).trim()}
                                </p>
                            ))
                            : <span className="tit-empty">«Objetivo y pregunta» y «Método» se llenan solos con tu proyecto. Para los demás, toca «Armar un borrador con mi proyecto» o escríbelos; Tab en una caja vacía escribe su ejemplo.</span>}
                    </div>
                </aside>
            </div>
        </div>
    );
};

const CRITERIOS = [
    { label: 'Completa', text: 'Contexto, problema, importancia, objetivo, método y organización.' },
    { label: 'Fiel', text: 'Dice lo mismo que tu título, tu objetivo y tu pregunta.' },
    { label: 'Breve', text: 'Resume; no copia secciones enteras.' },
    { label: 'Propuesta', text: 'Sin resultados ni conclusiones.' },
    { label: 'Guía', text: 'Termina contando cómo está organizado el documento.' },
];

const Revision = ({ intro }) => {
    const { f, introduccion, general, pregunta, quien } = useIntroState();
    const own = introduccion.trim() || assemble(f);
    const [text, setText] = useState(own);
    const target = text.trim();
    const isOwn = target === own;
    const checks = checkIntro(target, isOwn ? { general, pregunta, quien } : {});
    const passed = checks.filter((item) => item.ok).length;
    return (
        <>
            <div className="ide-synth-left">
                {intro}
                <ul className="tit-criteria">
                    {CRITERIOS.map((item) => <li key={item.label}><b>{item.label}</b> {item.text}</li>)}
                </ul>
                <label htmlFor="int-revisar" className="ide-synth-label">Introducción a revisar</label>
                <textarea
                    id="int-revisar"
                    className="textarea-field tit-review-input"
                    rows={8}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder="Pega una introducción o redáctala en «Redacta tu introducción»"
                />
                {!isOwn && own && <button type="button" className="ide-link" onClick={() => setText(own)}>Volver a mi introducción</button>}
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
                    {isOwn ? 'Revisa la forma de tu introducción guardada.' : 'Revisando un texto distinto al tuyo: se omiten los criterios de tu objetivo, pregunta y población.'} La claridad de fondo la valida tu asesor.
                </p>
            </div>
        </>
    );
};

/* ---------- Clase ---------- */

const Introduccion = ({ onNavigate }) => {
    const { data } = useProject();
    const [introduccion] = useProjectField('introduccion', '');
    const general = generalDe(data.objetivos, data.objetivoGeneral);
    const pregunta = clean(data.pregunta);
    const titulo = clean(data.titulo);
    const listas = buildDocument(data).filter((s) => s.inDocument !== false && s.content.length > 0 && s.id !== 'introduccion').length;

    const renderSlide = ({ slide, heading, goToSection, sectionMinutes, totalMinutes }) => ({
        portada: (
            <>
                <div>
                    {heading}
                    <p>La introducción presenta tu proyecto completo en pocas páginas: el tema, el problema, por qué importa, qué busca, cómo se hará y cómo está organizado el documento. Es lo primero que lee el evaluador.</p>
                    <p><strong>Al terminar esta clase podrás:</strong></p>
                    <ul className="ide-bullets">
                        <li>Distinguir la introducción del planteamiento y del resumen.</li>
                        <li>Organizarla en seis movimientos, de lo general a tu objetivo.</li>
                        <li>Escribir con el tiempo verbal y el tono de una propuesta.</li>
                        <li>Armar un borrador con lo que ya construiste.</li>
                        <li>Redactar la tuya y revisarla con criterios.</li>
                    </ul>
                    <div className="tit-from-idea">
                        <span>Tu proyecto hoy</span>
                        <p>{listas} secciones con contenido{listas < 5 ? ': conviene terminar las demás antes de escribir la introducción.' : '.'}</p>
                    </div>
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
                        <li><BookOpen size={18} /><span><b>Es</b>Una presentación breve del proyecto completo que guía al lector.</span></li>
                        <li><XCircle size={18} /><span><b>No es el planteamiento</b>Ese describe el problema en detalle; aquí solo se resume.</span></li>
                        <li><XCircle size={18} /><span><b>No es el resumen</b>El resumen es un párrafo cerrado con resultados; la introducción invita a leer.</span></li>
                        <li><XCircle size={18} /><span><b>No es el marco teórico</b>Las teorías van después.</span></li>
                    </ul>
                </div>
                <Opciones title="¿Dónde va?" questions={QUEES_QUIZ} />
            </>
        ),
        alfinal: (
            <>
                <div>
                    {heading}
                    <p>Por eso en el menú aparece después de los objetivos y en la ruta de construcción es el último paso, aunque en el documento va de primera.</p>
                    <ul className="ide-list">
                        <li><Clock size={18} /><span><b>Cuándo</b>Cuando tengas planteamiento, objetivos, justificación, alcances y método.</span></li>
                        <li><Eye size={18} /><span><b>Dónde</b>Justo después del título, antes del planteamiento.</span></li>
                    </ul>
                </div>
                <Cadena title="La paradoja de la introducción" items={ALFINAL} />
            </>
        ),
        partes: (
            <>
                <div>
                    {heading}
                    <ol className="pla-steps-list">
                        {PARTES.map((parte) => <li key={parte.key}><b>{parte.label}</b> {parte.what}</li>)}
                    </ol>
                    <p className="ide-hint">Contexto y problema ocupan uno o dos párrafos cada uno; los demás, un párrafo. En total, entre {MIN_PALABRAS} y {MAX_PALABRAS} palabras.</p>
                </div>
                <div className="ide-panel">
                    <h3>De dónde sale cada movimiento</h3>
                    <ul className="pla-map">
                        <li data-part="donde"><span>Contexto y problema</span><p>Del planteamiento del problema, resumido.</p></li>
                        <li data-part="paraque"><span>Importancia y vacío</span><p>De la justificación, en un párrafo.</p></li>
                        <li data-part="quien"><span>Objetivo y pregunta</span><p>Copiados de tus objetivos y tu pregunta.</p></li>
                        <li><span>Método</span><p>De los alcances y la metodología.</p></li>
                        <li><span>Organización</span><p>De las secciones de tu documento.</p></li>
                    </ul>
                </div>
            </>
        ),
        embudo: (
            <>
                <div>
                    {heading}
                    <p>Como el planteamiento, la introducción funciona como un embudo, pero más corto: en pocas oraciones pasa del tema general a tu objetivo.</p>
                    <p className="ide-hint">Luego anticipa el método y la organización del documento.</p>
                </div>
                <Cadena title="Un embudo en cuatro pasos" items={EMBUDO} />
            </>
        ),
        estilo: (
            <>
                <div>
                    {heading}
                    <p>La forma también comunica. Una introducción clara usa el tiempo verbal correcto, habla en tercera persona y va al grano.</p>
                </div>
                <Pestanas title="Cuatro decisiones de estilo" name="int-estilo" items={ESTILO} />
            </>
        ),
        conectores: (
            <>
                <div>
                    {heading}
                    <p>Los conectores marcan el paso de un movimiento a otro. Úsalos al inicio de cada párrafo.</p>
                    <p className="ide-hint">En la construcción podrás insertarlos con un clic.</p>
                </div>
                <Pestanas title="Conectores según su función" name="int-conectores" items={CONECTORES} />
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
                    <p>Lee cada fragmento y decide si va en la introducción de una propuesta.</p>
                    <p className="ide-hint">Para discutir en parejas: ¿dónde irían los que no van?</p>
                </div>
                <Opciones title="Juzga cada fragmento" questions={JUZGA_QUIZ} />
            </>
        ),
        reescribe: (
            <>
                <div>
                    {heading}
                    <p>Casi todos los fragmentos débiles se arreglan igual: ir al grano, usar los datos del proyecto y escribir en tercera persona.</p>
                </div>
                <AntesDespues />
            </>
        ),
        coherencia: (
            <>
                <div>
                    {heading}
                    <p>La introducción debe repetir, sin cambiarlos, el objetivo general y la pregunta de tu proyecto. Si cambias el objetivo, actualiza la introducción.</p>
                    {onNavigate && <button type="button" className="ide-btn ide-btn--ghost" onClick={() => onNavigate('proyecto')}>Ver la coherencia en Mi proyecto</button>}
                </div>
                <div className="ide-panel">
                    <h3>Lo que tu introducción debe repetir</h3>
                    <ol className="obj-chain">
                        <li><span>Título</span><p>{titulo || 'Aún no has guardado tu título.'}</p></li>
                        <li><span>Objetivo general</span><p>{general || 'Aún no has guardado tus objetivos.'}</p></li>
                        <li><span>Pregunta</span><p>{pregunta || 'Aún no has guardado tu pregunta.'}</p></li>
                    </ol>
                </div>
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
                        <li>Se escribe al final y se lee primero.</li>
                        <li>Seis movimientos: contexto, problema, importancia, objetivo, método y organización.</li>
                        <li>Resume; no copia el planteamiento ni la justificación.</li>
                        <li>Repite el objetivo y la pregunta del proyecto; no adelanta resultados.</li>
                    </ul>
                </div>
                <div className="ide-panel">
                    <h3>Siguiente paso</h3>
                    {introduccion.trim()
                        ? <div className="tit-saved"><span>Tu introducción guardada</span><p>{countWords(introduccion)} palabras</p></div>
                        : <p>La redactarás en la siguiente sección: un clic arma un borrador con lo que ya construiste.</p>}
                </div>
            </>
        ),
        construye: (
            <Constructor
                onNavigate={onNavigate}
                intro={(
                    <>
                        {heading}
                        <p>Toca «Armar un borrador con mi proyecto»: cada movimiento se llena con lo que ya escribiste. Luego complétalo, une los párrafos con conectores y reemplaza lo que esté entre corchetes.</p>
                    </>
                )}
            />
        ),
        revision: (
            <Revision
                intro={(
                    <>
                        {heading}
                        <p>Revisa tu introducción antes de llevarla a tu asesor. También puedes pegar la introducción de otro trabajo para analizarla.</p>
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
            label="Introducción"
            teoria={TEORIA}
            renderSlide={renderSlide}
            finish={onNavigate ? { label: 'Escribir el resumen', onClick: () => onNavigate('resumen') } : null}
        />
    );
};

export default Introduccion;
