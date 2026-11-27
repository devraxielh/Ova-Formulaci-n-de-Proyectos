import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, Sparkles, X } from 'lucide-react';
import { useProject, useProjectField } from '../../context/ProjectContext';
import { groq } from '../../services/api';
import { buildDocument, documentText } from '../../services/projectDoc';
import { partesObjetivos } from '../../services/coherencia';
import './RevisarIA.css';
import { nivelDeRevision } from '../../services/revisionNivel';

/*
 * Botón «Revisar con IA» de la barra de las clases: lee lo que el estudiante guardó en la sección abierta
 * y devuelve observaciones concretas (qué falta, qué no concuerda con el título y los objetivos, cómo corregirlo).
 * La última revisión de cada sección queda guardada en el proyecto (data.revisionesIA).
 */

const QUE_EVALUAR = {
    ideacion: 'que el problema esté delimitado (qué pasa, a quién, dónde, cuándo) y que causas y efectos sean distintos del problema',
    titulo: 'que tenga entre 10 y 30 palabras, que incluya qué se estudia, en quién y dónde, y que no prometa más de lo que el estudio puede lograr',
    pregunta: 'que sea una sola pregunta clara, investigable, con variables o categorías, población y lugar, y que corresponda al título',
    planteamiento: 'que describa el contexto con datos y fuentes, el problema concreto, sus causas y consecuencias, y que cierre llevando a la pregunta',
    objetivos: 'que el objetivo general responda a la pregunta y al título, que los específicos sean pasos ordenados de menor a mayor complejidad que juntos logran el general, y que cada uno tenga un solo verbo medible',
    justificacion: 'que argumente conveniencia, relevancia social, aporte teórico o práctico, beneficiarios y viabilidad, sin repetir el planteamiento',
    alcances: 'que declare hasta dónde llega el estudio (tema, población, lugar, tiempo) y limitaciones reales con la forma de manejarlas',
    introduccion: 'que presente tema, problema, objetivo, método y estructura del documento, sin adelantar resultados que no existen',
    marco: 'que los antecedentes sean estudios reales citados y recientes con su hallazgo, que las teorías se relacionen con las variables del estudio, que los conceptos estén definidos con fuente y que el marco legal sea pertinente',
    metodologia: 'que enfoque, tipo y diseño sean coherentes entre sí y con los objetivos, que población, muestra y muestreo estén justificados, y que cada objetivo específico tenga técnica, instrumento y análisis',
    fases: 'que haya una fase por objetivo específico con actividades, técnicas, productos y tiempos realizables',
    resultados: 'que haya resultados por cada objetivo específico con datos concretos, y que la discusión los interprete y compare con antecedentes y teoría sin exagerar',
    conclusiones: 'que haya una conclusión por objetivo específico derivada de los resultados, una conclusión general que responda la pregunta, y recomendaciones con destinatario',
    resumen: 'que en 150 a 250 palabras incluya objetivo, metodología, resultados y conclusiones, sin citas ni datos que no estén en el documento',
};

const TIPOS = { falta: 'Falta', incoherencia: 'No concuerda', redaccion: 'Redacción', metodo: 'Método' };

const pedirRevision = async ({ tab, etiqueta, texto, data }) => {
    const { general, especificos } = partesObjetivos(data.objetivos);
    const contexto = [
        data.titulo && `TÍTULO: ${String(data.titulo).trim()}`,
        data.pregunta && `PREGUNTA: ${String(data.pregunta).split('\n')[0].trim()}`,
        (general || data.objetivoGeneral) && `OBJETIVO GENERAL: ${general || data.objetivoGeneral}`,
        especificos.length > 0 && `OBJETIVOS ESPECÍFICOS:\n${especificos.map((o, i) => `${i + 1}. ${o}`).join('\n')}`,
    ].filter(Boolean).join('\n');
    const r = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: 'Eres un asesor metodológico que revisa proyectos de investigación de estudiantes universitarios. Eres exigente, concreto y respetuoso. No reescribes la sección por el estudiante: señalas qué mejorar y cómo. Nunca inventas datos, autores, fuentes ni cifras, tampoco como ejemplo: cuando falte un dato escribes el hueco entre corchetes, por ejemplo «Según [fuente oficial, año], el [X] % de…», y le dices al estudiante dónde buscarlo. Si algo no se puede verificar, lo dices. Respondes solo JSON válido en español.' },
            { role: 'user', content: `Revisa la sección «${etiqueta}» de este proyecto.\n\nCONTEXTO DEL PROYECTO\n${contexto || '(el estudiante aún no tiene título ni objetivos)'}\n\nSECCIÓN A REVISAR\n${texto.slice(0, 14000)}\n\nEvalúa sobre todo: ${QUE_EVALUAR[tab] || 'claridad, coherencia con el título y los objetivos, y rigor'}.\n\nResponde exactamente con este JSON:\n{"valoracion": "una o dos frases con el estado general de la sección", "nivel": "lista | casi | falta", "fortalezas": ["máximo 3, concretas"], "observaciones": [{"tipo": "falta | incoherencia | redaccion | metodo", "donde": "cita textual breve (máx. 12 palabras) del fragmento al que se refiere, o vacío si es algo que falta", "problema": "qué está mal o qué falta", "como": "cómo corregirlo, con un ejemplo aplicado a ESTE proyecto; si el ejemplo necesita una cifra, un autor o una fuente que no está en el texto, deja el hueco entre corchetes y di dónde consultarlo, sin inventar números ni nombres"}]}\n\nDa entre 3 y 7 observaciones ordenadas de la más importante a la menos importante. Si la sección contradice el título, la pregunta o los objetivos, dilo con tipo "incoherencia".` },
        ],
        temperature: 0.3,
        max_tokens: 3000,
        response_format: { type: 'json_object' },
    });
    const content = r.choices?.[0]?.message?.content || '';
    const json = JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1));
    const lista = (v) => (Array.isArray(v) ? v : []);
    const observaciones = lista(json.observaciones).map((o) => ({
        tipo: TIPOS[o?.tipo] ? o.tipo : 'redaccion',
        donde: String(o?.donde || '').trim(),
        problema: String(o?.problema || '').trim(),
        como: String(o?.como || '').trim(),
    })).filter((o) => o.problema).slice(0, 8);
    return {
        valoracion: String(json.valoracion || '').trim(),
        nivel: nivelDeRevision(json.nivel, observaciones),
        fortalezas: lista(json.fortalezas).map((x) => String(x).trim()).filter(Boolean).slice(0, 3),
        observaciones,
    };
};

const NIVEL = { lista: 'Lista para entregar', casi: 'Casi lista', falta: 'Necesita trabajo' };

const RevisarIA = ({ etiqueta }) => {
    const { data, section } = useProject();
    const [revisiones, setRevisiones] = useProjectField('revisionesIA', {});
    const [estado, setEstado] = useState('');
    const [error, setError] = useState('');
    const dialog = useRef(null);
    const tab = section;

    // Texto guardado de la sección abierta (lo mismo que va al documento).
    const texto = useMemo(() => {
        const partes = buildDocument(data).filter((s) => s.tab === tab && s.content.length > 0 && s.id !== 'preliminares' && s.id !== 'anexos');
        return partes.map((s) => documentText('', [{ ...s, inDocument: true }]).split('\n').slice(2).join('\n').trim()).join('\n\n');
    }, [data, tab]);
    const guardada = (revisiones && revisiones[tab]) || null;
    const cambio = guardada && guardada.texto !== texto.length; // el texto cambió desde la última revisión

    useEffect(() => { setError(''); setEstado(''); }, [tab]);

    const revisar = async () => {
        setError('');
        setEstado('revisando');
        try {
            const resultado = await pedirRevision({ tab, etiqueta, texto, data });
            setRevisiones((prev) => ({ ...(prev || {}), [tab]: { ...resultado, at: Date.now(), texto: texto.length } }));
            setEstado('');
        } catch (err) {
            setError(err?.message?.includes('JSON') ? 'La IA respondió en un formato inesperado. Inténtalo de nuevo.' : (err.message || 'No se pudo hacer la revisión.'));
            setEstado('');
        }
    };
    const abrir = () => {
        dialog.current?.showModal();
        if (!guardada && texto && estado !== 'revisando') revisar();
    };
    const resolver = (i) => setRevisiones((prev) => {
        const actual = prev?.[tab];
        if (!actual) return prev;
        return { ...prev, [tab]: { ...actual, observaciones: actual.observaciones.map((o, k) => (k === i ? { ...o, hecho: !o.hecho } : o)) } };
    });
    const pendientes = guardada ? guardada.observaciones.filter((o) => !o.hecho).length : 0;

    return (
        <>
            <button type="button" className="ria-btn" onClick={abrir} title="Revisar esta sección con IA">
                <Sparkles size={16} aria-hidden="true" /> <span>Revisar con IA</span>
                {pendientes > 0 && <b aria-label={`${pendientes} observaciones pendientes`}>{pendientes}</b>}
            </button>
            <dialog ref={dialog} className="ria-modal" aria-label="Revisión con IA" onClick={(e) => { if (e.target === dialog.current) dialog.current.close(); }}>
                <div className="ria-box">
                    <header className="ria-head">
                        <div>
                            <p className="ria-kicker">Revisión con IA</p>
                            <h2>{etiqueta}</h2>
                        </div>
                        <button type="button" className="ria-close" onClick={() => dialog.current?.close()} aria-label="Cerrar"><X size={18} /></button>
                    </header>
                    <div className="ria-body">
                        {!texto && <p className="ria-vacio">Todavía no has guardado nada en esta sección. Ve a «Construcción», escribe y guarda; luego vuelve a pedir la revisión.</p>}
                        {estado === 'revisando' && <p className="ria-cargando" role="status"><Loader2 size={18} className="ria-spin" aria-hidden="true" /> Leyendo tu sección y comparándola con tu título y tus objetivos…</p>}
                        {error && <p className="ria-error" role="alert"><AlertTriangle size={16} aria-hidden="true" /> {error}</p>}
                        {guardada && estado !== 'revisando' && (
                            <>
                                <p className="ria-nivel" data-nivel={guardada.nivel}><b>{NIVEL[guardada.nivel]}</b> {guardada.valoracion}</p>
                                {cambio && <p className="ria-aviso">Cambiaste el texto después de esta revisión. Pide una nueva para ver si ya quedó.</p>}
                                {guardada.fortalezas.length > 0 && (
                                    <section>
                                        <h3><CheckCircle2 size={16} aria-hidden="true" /> Lo que está bien</h3>
                                        <ul className="ria-bien">{guardada.fortalezas.map((f) => <li key={f}>{f}</li>)}</ul>
                                    </section>
                                )}
                                <section>
                                    <h3><AlertTriangle size={16} aria-hidden="true" /> Qué mejorar ({pendientes} pendientes)</h3>
                                    <ol className="ria-obs">
                                        {guardada.observaciones.map((o, i) => (
                                            <li key={i} data-hecho={Boolean(o.hecho)}>
                                                <span className="ria-tipo" data-tipo={o.tipo}>{TIPOS[o.tipo]}</span>
                                                {o.donde && <blockquote>«{o.donde}»</blockquote>}
                                                <p><b>{o.problema}</b></p>
                                                {o.como && <p><i>Cómo corregirlo:</i> {o.como}</p>}
                                                <label><input type="checkbox" checked={Boolean(o.hecho)} onChange={() => resolver(i)} /> Ya lo corregí</label>
                                            </li>
                                        ))}
                                    </ol>
                                </section>
                            </>
                        )}
                    </div>
                    <footer className="ria-foot">
                        <small>La IA orienta, no califica: puede equivocarse y no verifica que tus fuentes existan. La decisión final es tuya y de tu asesor.{guardada ? ` Última revisión: ${new Date(guardada.at).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}.` : ''}</small>
                        <button type="button" className="ria-accion" onClick={revisar} disabled={!texto || estado === 'revisando'}><RefreshCw size={15} /> {guardada ? 'Revisar de nuevo' : 'Revisar'}</button>
                    </footer>
                </div>
            </dialog>
        </>
    );
};

export default RevisarIA;
