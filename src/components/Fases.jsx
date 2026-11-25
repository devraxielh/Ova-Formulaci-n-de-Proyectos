import React, { useEffect, useRef, useState } from 'react';
import EditorRico from './EditorRico';
import { AlertTriangle, ArrowDown, ArrowUp, CalendarDays, CheckCircle2, Download, Image as ImageIcon, Loader2, Plus, Sparkles, Target, Trash2, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { ESTILOS_FASES, datosFases, fasesDataUrl, fasesPng } from '../services/fasesGrafico';
import SlideDeck from './deck/SlideDeck';
import { Generica } from './deck/Contenido';
import { useProject, useProjectField } from '../context/ProjectContext';
import { cronogramaDesdeFases } from '../services/derivados';
import { useAutoGuardar } from '../hooks/useAutoGuardar';
import { partesObjetivos } from '../services/coherencia';
import { groq } from '../services/api';
import { preguntasDe } from '../services/instrumentos';
import { INFINITIVO } from '../data/ejemplos';
import { nivelDe } from '../data/nivelesVerbos';
import { SECTIONS, SLIDES } from '../data/fasesClase';
import './Titulo.css';
import './Planteamiento.css';
import './Objetivos.css';
import './Justificacion.css';
import './Marco.css';
import './Fases.css';
import { confirmar } from './Avisos';

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

// Instrumentos declarados en la Metodología, numerados. `objetivo` = número del objetivo al que sirven (0 = todos).
const instrumentosDeclarados = (data, especificos) => {
    const t = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();
    const met = data.metodologiaForm || {};
    const armados = Array.isArray(data.instrumentosGen) ? data.instrumentosGen : [];
    return (Array.isArray(met.instrumentos) ? met.instrumentos : [])
        .filter((it) => t(it.tecnica))
        .map((it, i) => {
            const armado = armados.find((a) => a && it.id && a.filaId === it.id);
            const m = t(it.objetivo).match(/objetivo específico (\d+)/i);
            const k = m ? Number(m[1]) : 0;
            return {
                n: i + 1,
                tecnica: t(it.tecnica),
                instrumento: t(it.instrumento) || 'instrumento',
                aplicaA: t(it.aplicaA),
                objetivo: k >= 1 && k <= especificos.length ? k : 0,
                validaciones: (Array.isArray(it.validaciones) ? it.validaciones : [it.validez]).filter(Boolean),
                preguntas: armado ? preguntasDe(armado).length : 0,
            };
        });
};
// Los que puede usar la fase de un objetivo (1, 2…): los de ese objetivo y los que sirven a todos. La de cierre (0), ninguno.
const permitidosPara = (declarados, k) => (k >= 1 ? declarados.filter((d) => d.objetivo === 0 || d.objetivo === k) : []);

// Palabras con que una actividad nombra una técnica de recolección (para avisar si no está declarada).
const NOMBRES_TECNICA = [
    { tecnica: 'Encuesta', re: /\b(encuestas?|cuestionarios?)\b/i },
    { tecnica: 'Entrevista', re: /\bentrevist/i },
    { tecnica: 'Observación', re: /\b(observaci[oó]n|observar|lista de chequeo)\b/i },
    { tecnica: 'Grupo focal', re: /\bgrupos? focal/i },
    { tecnica: 'Revisión documental', re: /\b(revisi[oó]n documental|ficha de registro|historias? cl[ií]nicas?|registros? (?:del|de la) (?:hospital|instituci))/i },
    { tecnica: 'Prueba o test', re: /\b(pre-?test|pos-?test|prueba estandarizada|aplicar (?:la|una) prueba)\b/i },
];
// Técnicas que la fase nombra y que no están declaradas para su objetivo.
const instrumentosAjenos = (fase, declarados, especificos) => {
    const k = especificos.findIndex((o) => clean(o).toLowerCase() === clean(fase.objetivo).toLowerCase()) + 1;
    const permitidas = new Set(permitidosPara(declarados, k).map((d) => d.tecnica));
    const texto = [fase.descripcion, ...(fase.actividades || [])].join(' ').replace(/\bprueba piloto\b/gi, '');
    return NOMBRES_TECNICA.filter((x) => !permitidas.has(x.tecnica) && x.re.test(texto)).map((x) => x.tecnica);
};

// Lo que la IA necesita saber del proyecto para recomendar las fases: objetivos y metodología ya definidos.
const contextoFases = (data, especificos, unidad) => {
    const t = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();
    const met = data.metodologiaForm || {};
    const declarados = instrumentosDeclarados(data, especificos);
    const analisis = (Array.isArray(met.analisis) ? met.analisis : []).filter((x) => t(x.tecnica)).map((x) => `«${t(x.objetivo)}»: ${t(x.tecnica)}${t(x.software) ? ` en ${t(x.software)}` : ''}`);
    const general = t(data.objetivoGeneral) || t(partesObjetivos(data.objetivos).general);
    const crono = Number(data.ganttPeriodos) > 0 && (data.ganttUnidad === 'semanal') === (unidad === 'semanas') ? Number(data.ganttPeriodos) : 0;
    const lista = declarados.map((d) => `[${d.n}] ${d.tecnica}: ${d.instrumento}${d.preguntas ? ` (${d.preguntas} preguntas)` : ''}, se aplica a ${d.aplicaA || 'los participantes'}, ${d.objetivo ? `para el objetivo ${d.objetivo}` : 'para todos los objetivos'}; validación: ${d.validaciones.join(', ') || 'sin definir'}`).join('\n');
    const porObjetivo = especificos.map((_, i) => {
        const ok = permitidosPara(declarados, i + 1);
        return `Objetivo ${i + 1}: ${ok.length ? ok.map((d) => `[${d.n}] ${d.tecnica}`).join(', ') : 'ninguno (no recoge datos nuevos)'}`;
    }).join('\n');
    return {
        crono,
        declarados,
        texto: `PROYECTO\nTítulo: ${t(data.titulo) || '(sin título)'}\nPregunta: ${t(data.pregunta) || '(sin definir)'}\nObjetivo general: ${general || '(sin definir)'}\nObjetivos específicos:\n${especificos.map((o, i) => `${i + 1}. ${o}`).join('\n') || '(sin definir)'}\n\nMETODOLOGÍA\nEnfoque: ${t(data.enfoque) || '(sin definir)'} · Tipo: ${t(data.tipoInvestigacion) || '(sin definir)'} · Diseño: ${t(data.diseno) || '(sin definir)'}\nPoblación: ${t(met.poblacion?.descripcion) || '(sin describir)'} · Muestreo: ${t(met.poblacion?.muestreo) || '(sin definir)'}${Number(data.poblacionTamano) > 0 ? ` · Población de ${Number(data.poblacionTamano)}` : ''}\nPlan de análisis:\n${analisis.map((x) => `- ${x}`).join('\n') || '(sin definir)'}\n\nINSTRUMENTOS DECLARADOS (son los ÚNICOS que existen en este proyecto)\n${lista || '(ninguno declarado)'}\n\nINSTRUMENTOS QUE PUEDE USAR CADA OBJETIVO\n${porObjetivo || '(sin objetivos)'}`,
    };
};

const REGLAS_FASE = `Cada fase:\n- "objetivo": el NÚMERO del objetivo específico que cumple (1, 2, 3…), o 0 si es una fase de cierre o de socialización.\n- "instrumentos": los números entre corchetes de los instrumentos declarados que usa la fase, SOLO de los que puede usar su objetivo (lista «INSTRUMENTOS QUE PUEDE USAR CADA OBJETIVO»). La fase de socialización no usa ninguno: [].\n- "nombre": nombre corto de la fase con un sustantivo de acción (por ejemplo «Caracterización de la población»), de 3 a 9 palabras, sin «Fase» ni número.\n- "descripcion": una o dos frases que digan qué se hace en la fase y para qué, con los datos del proyecto (población, lugar, instrumento). Sin punto final.\n- "actividades": de 4 a 6 actividades en orden, cada una empezando con un verbo en infinitivo y concreta (qué, a quién, con qué). REGLA ESTRICTA DE INSTRUMENTOS: las actividades solo nombran los instrumentos declarados que usa la fase, con su nombre (por ejemplo «el cuestionario»). No propongas ninguna otra técnica de recolección (entrevistas, grupos focales, observación, revisión de historias clínicas, pruebas) si no está declarada para ese objetivo. Si el objetivo no tiene instrumentos, sus actividades trabajan con los datos ya recogidos en las fases anteriores o diseñan y validan su producto, sin recoger datos nuevos. La validación de un instrumento (juicio de expertos, prueba piloto, alfa de Cronbach) es una actividad propia, antes de aplicarlo, y usa solo los métodos de validación declarados para ese instrumento.\n- "software": el software del plan de análisis que usa la fase, o cadena vacía.\n- "productos": el entregable verificable de la fase, en minúscula.\n- "duracion": número entero de unidades de tiempo.\n- "responsable": quién la lidera (por ejemplo «investigadores» o «investigador principal con el asesor»).\nNo inventes cifras, fechas ni nombres de personas.`;

// Técnicas y herramientas de la fase: las arma el código con los instrumentos declarados que la fase puede usar.
const tecnicasDe = (usados, software) => [
    ...usados.map((d) => `${d.tecnica.toLowerCase()} (${d.instrumento})`),
    ...[...new Set(usados.flatMap((d) => d.validaciones))],
    ...(software ? [software] : []),
].join(', ');

const leerFase = (x, especificos, declarados) => {
    const t = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();
    const sinPunto = (v) => t(v).replace(/[.\s]+$/, '');
    const k = Math.round(Number(x?.objetivo) || 0);
    const permitidos = permitidosPara(declarados, k >= 1 && k <= especificos.length ? k : 0);
    const pedidos = (Array.isArray(x?.instrumentos) ? x.instrumentos : []).map(Number);
    const usados = permitidos.filter((d) => pedidos.includes(d.n));
    return {
        nombre: capital(sinPunto(x?.nombre).replace(/^fase\s*\d*[.:-]?\s*/i, '')).slice(0, 90),
        objetivo: k >= 1 && k <= especificos.length ? especificos[k - 1] : 'Socializar los resultados del proyecto',
        descripcion: sinPunto(x?.descripcion).slice(0, 400),
        actividades: (Array.isArray(x?.actividades) ? x.actividades : []).map((a) => capital(sinPunto(a))).filter(Boolean).slice(0, 7),
        tecnicas: tecnicasDe(usados, sinPunto(x?.software)).slice(0, 240),
        productos: lower(sinPunto(x?.productos)).slice(0, 160),
        duracion: Math.max(1, Math.min(52, Math.round(Number(x?.duracion) || 4))),
        responsable: sinPunto(x?.responsable).slice(0, 80),
    };
};

const JSON_FASE = '{"objetivo": 1, "instrumentos": [1], "nombre": "…", "descripcion": "…", "actividades": ["…"], "software": "…", "productos": "…", "duracion": 4, "responsable": "…"}';

// Recomienda todas las fases del proyecto: una por objetivo específico y, al final, la socialización.
const recomendarFases = async ({ data, especificos, unidad }) => {
    const ctx = contextoFases(data, especificos, unidad);
    const r = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: 'Eres asesor de proyectos de investigación formativa. Organizas la ejecución de un proyecto en fases coherentes con sus objetivos específicos y con la metodología que ya definió el estudiante. Solo usas los instrumentos que el proyecto declaró; nunca agregas otros. Escribes en español, en forma impersonal. Respondes solo JSON válido.' },
            { role: 'user', content: `${ctx.texto}\n\nRecomienda las fases del proyecto: una fase por cada objetivo específico, en el mismo orden, y una fase final de socialización de resultados (objetivo 0). Si un instrumento declarado se usa en varios objetivos, se diseña, valida y aplica una sola vez (en la primera fase que lo usa) y las fases siguientes analizan sus datos sin volver a aplicarlo. La unidad de tiempo es ${unidad}.${ctx.crono ? ` La suma de las duraciones debe ser exactamente ${ctx.crono} ${unidad}, como en el cronograma.` : ` Usa duraciones realistas para un proyecto de estudiantes (en total, entre ${unidad === 'meses' ? '4 y 8 meses' : '16 y 32 semanas'}).`}\n\n${REGLAS_FASE}\n\nResponde exactamente con este JSON: {"fases": [${JSON_FASE}]}` },
        ],
        temperature: 0.2,
        max_tokens: 3500,
        response_format: { type: 'json_object' },
    });
    const content = r.choices?.[0]?.message?.content || '';
    const json = JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1));
    const fases = (Array.isArray(json.fases) ? json.fases : []).map((x) => leerFase(x, especificos, ctx.declarados)).filter((x) => x.nombre && x.actividades.length >= 2).slice(0, 8);
    if (!fases.length) throw new Error('vacio');
    return fases;
};

// Recomienda una sola fase (la que está abierta), para su objetivo, sin tocar las demás.
const recomendarUnaFase = async ({ data, especificos, unidad, fase, otras }) => {
    const ctx = contextoFases(data, especificos, unidad);
    const k = especificos.findIndex((o) => clean(o).toLowerCase() === clean(fase.objetivo).toLowerCase());
    const r = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: 'Eres asesor de proyectos de investigación formativa. Diseñas una fase de ejecución coherente con su objetivo específico y con la metodología que ya definió el estudiante. Solo usas los instrumentos que el proyecto declaró; nunca agregas otros. Escribes en español, en forma impersonal. Respondes solo JSON válido.' },
            { role: 'user', content: `${ctx.texto}\n\nOTRAS FASES DEL PROYECTO (no repitas sus actividades; si un instrumento ya se aplica en una fase anterior, no lo vuelvas a aplicar: analiza sus datos)\n${otras.map((o) => `- ${o}`).join('\n') || '(ninguna)'}\n\nRecomienda la fase que cumple ${k >= 0 ? `el objetivo específico ${k + 1}: «${especificos[k]}»` : clean(fase.objetivo) ? `«${clean(fase.objetivo)}»` : 'la socialización de los resultados'}. La unidad de tiempo es ${unidad}; la duración actual es ${Number(fase.duracion) || 4}: consérvala salvo que sea claramente irreal.\n\n${REGLAS_FASE}\n\nResponde exactamente con este JSON: ${JSON_FASE.replace('"objetivo": 1', `"objetivo": ${k >= 0 ? k + 1 : 0}`)}` },
        ],
        temperature: 0.2,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
    });
    const content = r.choices?.[0]?.message?.content || '';
    const x = leerFase(JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1)), especificos, ctx.declarados);
    if (!x.nombre || x.actividades.length < 2) throw new Error('vacio');
    // La fase sigue asociada al objetivo que ya tenía.
    return { ...x, objetivo: clean(fase.objetivo) ? fase.objetivo : x.objetivo };
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

/* ---------- Ventana del gráfico ---------- */

// Muestra la figura de las fases tal como saldrá en el documento y deja elegir su diseño. El estilo elegido se
// guarda con el proyecto (`fasesForm.estiloGrafico`) y es el que usa «Desarrollo de las fases del proyecto».
const GraficoModal = ({ open, datos, estilo, onEstilo, onClose }) => {
    const ref = useRef(null);
    const [guardado, setGuardado] = useState(false);
    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) { dialog.showModal(); setGuardado(false); }
        if (!open && dialog.open) dialog.close();
    }, [open]);
    const descargar = async () => {
        try {
            const { dataUrl } = await fasesPng({ ...datos, estilo });
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = 'ruta-de-fases.png';
            a.click();
        } catch { /* si no se puede dibujar, no se descarga */ }
    };
    const actual = ESTILOS_FASES.find((e) => e.id === estilo) || ESTILOS_FASES[0];
    return createPortal(
        <dialog ref={ref} className="fas-modal" aria-labelledby="fas-modal-titulo" onClose={onClose} onClick={(e) => { if (e.target === ref.current) onClose(); }}>
            <div className="fas-modal-caja">
                <header>
                    <div>
                        <p className="fas-modal-kicker">Gráfico de las fases</p>
                        <h2 id="fas-modal-titulo">Ruta de las fases del proyecto</h2>
                        <p>Así sale en «Desarrollo de las fases del proyecto» de tu documento. Elige el diseño que prefieras.</p>
                    </div>
                    <button type="button" className="fas-modal-cerrar" onClick={onClose} aria-label="Cerrar"><X size={18} /></button>
                </header>
                <div className="fas-modal-cuerpo">
                    {open && datos.fases.length >= 2 ? (
                        <>
                            <div className="fas-estilos" role="radiogroup" aria-label="Diseño del gráfico">
                                {ESTILOS_FASES.map((e) => (
                                    <button key={e.id} type="button" role="radio" aria-checked={e.id === actual.id} className="fas-estilo" onClick={() => { onEstilo(e.id); setGuardado(true); }}>
                                        <img src={fasesDataUrl({ ...datos, estilo: e.id })} alt="" />
                                        <b>{e.id === actual.id && <CheckCircle2 size={15} aria-hidden="true" />} {e.nombre}</b>
                                        <small>{e.descripcion}</small>
                                    </button>
                                ))}
                            </div>
                            <figure className="fas-grafico">
                                <img src={fasesDataUrl({ ...datos, estilo: actual.id })} alt={`Ruta del proyecto, diseño ${actual.nombre}: ${datos.fases.map((x, i) => `fase ${i + 1}, ${x.nombre}`).join('; ')}`} />
                            </figure>
                        </>
                    ) : <p className="obj-warn"><AlertTriangle size={15} aria-hidden="true" /> El gráfico necesita al menos dos fases con nombre.</p>}
                </div>
                <footer>
                    <span className="fas-modal-estado">{guardado ? <><CheckCircle2 size={15} aria-hidden="true" /> Diseño «{actual.nombre}» guardado: así saldrá en tu documento.</> : `Diseño actual: ${actual.nombre}.`}</span>
                    <button type="button" className="ide-btn ide-btn--ghost" onClick={descargar} disabled={datos.fases.length < 2}><Download size={15} /> Descargar imagen</button>
                    <button type="button" className="ide-btn ide-btn--primary" onClick={onClose}>Listo</button>
                </footer>
            </div>
        </dialog>,
        document.body,
    );
};

/* ---------- Constructor ---------- */

const Constructor = ({ intro, onNavigate }) => {
    const { data, f, update, setFasesTexto, metForm, setMetForm, setCronoItems, setUnidadGantt, setPeriodos, especificos } = useFasesState();
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

    // Recomendación con la IA: todas las fases (reemplaza las actuales) o solo la que está abierta.
    const [recomendando, setRecomendando] = useState(''); // '' | 'todas' | 'una' | 'fallo'
    const sinTrabajar = (x) => !clean(x.descripcion) && !clean(x.tecnicas) && !clean(x.responsable);
    const recomendarTodas = async (preguntar = true) => {
        if (preguntar && fases.length && !fases.every(sinTrabajar) && !(await confirmar({ texto: '¿Reemplazar tus fases?', detalle: 'Las fases actuales se cambian por las recomendadas. Puedes recuperar lo anterior desde el historial de versiones.', aceptar: 'Reemplazar', peligro: true }))) return;
        setRecomendando('todas');
        try {
            const nuevas = await recomendarFases({ data, especificos, unidad: f.unidad });
            touch();
            update({ fases: nuevas.map((x) => ({ ...FASE_VACIA(), ...x, recomendada: true })), recomendadas: true });
            setActive(0);
            setRecomendando('');
        } catch {
            setRecomendando('fallo');
        }
    };
    const recomendarActiva = async () => {
        const actual = fases[ai];
        if (!actual) return;
        setRecomendando('una');
        try {
            const x = await recomendarUnaFase({ data, especificos, unidad: f.unidad, fase: actual, otras: fases.filter((_, k) => k !== ai).map((o) => `${clean(o.nombre)}: ${o.actividades.filter((a) => clean(a)).join('; ')}`) });
            setFase(ai, { ...x, recomendada: true });
            setRecomendando('');
        } catch {
            setRecomendando('fallo');
        }
    };
    // La primera vez, si las fases son solo las armadas desde los objetivos (sin trabajar), se recomiendan solas.
    const yaRecomendo = useRef(false);
    useEffect(() => {
        if (yaRecomendo.current || f.recomendadas || !especificos.length || !fases.every(sinTrabajar)) return;
        yaRecomendo.current = true;
        recomendarTodas(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [especificos.length]);

    const declarados = instrumentosDeclarados(data, especificos);
    const [verGrafico, setVerGrafico] = useState(false);
    const datosGrafico = datosFases(f, especificos);
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
        const filas = cronogramaDesdeFases({ ...f, fases }).filas.map((x) => ({ id: uid(), ...x }));
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
                    <button type="button" className="ide-btn ide-btn--ghost" disabled={datosGrafico.fases.length < 2} onClick={() => setVerGrafico(true)}>
                        <ImageIcon size={16} /> Ver el gráfico de las fases
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
                    {especificos.length > 0 && (
                        <div className="fas-recomendar">
                            <button type="button" className="ide-btn ide-btn--ghost" disabled={Boolean(recomendando) && recomendando !== 'fallo'} onClick={() => recomendarTodas(true)}>
                                {recomendando === 'todas' ? <Loader2 size={15} className="fas-gira" /> : <Sparkles size={15} />} {recomendando === 'todas' ? 'Recomendando las fases…' : 'Recomendar todas las fases'}
                            </button>
                            <span>{recomendando === 'fallo' ? 'No se pudo recomendar: inténtalo de nuevo.' : `Una por objetivo específico y la de socialización. Solo usa ${declarados.length ? `tus ${declarados.length} ${declarados.length === 1 ? 'instrumento declarado' : 'instrumentos declarados'} (${declarados.map((d) => d.tecnica.toLowerCase()).join(', ')})` : 'los instrumentos que declares en la Metodología'}.`}</span>
                        </div>
                    )}
                    {especificos.length > 0 && declarados.length === 0 && (
                        <p className="obj-warn"><AlertTriangle size={14} aria-hidden="true" /> Aún no declaras instrumentos de recolección en la Metodología: las fases no tendrán con qué recoger datos.{onNavigate && <> <button type="button" className="ide-link" onClick={() => onNavigate('metodologia')}>Ir a la Metodología</button></>}</p>
                    )}

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
                            <div className="fas-recomendar mar-wide">
                                <button type="button" className="ide-btn ide-btn--ghost" disabled={Boolean(recomendando) && recomendando !== 'fallo'} onClick={recomendarActiva}>
                                    {recomendando === 'una' ? <Loader2 size={15} className="fas-gira" /> : <Sparkles size={15} />} {recomendando === 'una' ? 'Recomendando esta fase…' : 'Recomendar esta fase'}
                                </button>
                                <span>{fase.recomendada ? 'Recomendada por la IA con tu proyecto: revísala y ajústala.' : 'Llena esta fase según su objetivo y tu metodología. No cambia las demás.'}</span>
                            </div>
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
                                <EditorRico className="textarea-field" rows={2} value={fase.descripcion} onChange={(e) => setFase(ai, { descripcion: e.target.value })} placeholder="Ej: En esta fase se describe la situación actual de la inasistencia a partir de los registros del hospital" />
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
                                {instrumentosAjenos(fase, declarados, especificos).length > 0 && (
                                    <p className="obj-warn"><AlertTriangle size={14} aria-hidden="true" /> Esta fase menciona {instrumentosAjenos(fase, declarados, especificos).map((x) => `«${x.toLowerCase()}»`).join(', ')}, que no {instrumentosAjenos(fase, declarados, especificos).length === 1 ? 'está declarada' : 'están declaradas'} en tu Metodología para este objetivo. Declárala allí o ajusta la actividad.</p>
                                )}
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
            <GraficoModal open={verGrafico} datos={datosGrafico} estilo={datosGrafico.estilo} onEstilo={(id) => { touch(); update({ estiloGrafico: id }); }} onClose={() => setVerGrafico(false)} />
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
                        <p>Revisa que tus fases estén completas, en orden y coherentes con el cronograma.</p>
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
