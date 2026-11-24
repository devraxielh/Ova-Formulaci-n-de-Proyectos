import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, ArrowDown, ArrowUp, BarChart3, CheckCircle2, ClipboardList, Copy, Globe, Loader2, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useProject, useProjectField } from '../context/ProjectContext';
import { api, groq } from '../services/api';
import { partesObjetivos } from '../services/coherencia';
import { FRECUENCIA, TIPOS_PREGUNTA, UBICACIONES, definicionEncuesta, opcionesDe, preguntasDe, ubicacionDe } from '../services/instrumentos';
import './Proyecto.css';
import './Instrumentos.css';

/*
 * Generador de instrumentos: arma la encuesta o la guía de entrevista a partir de los objetivos,
 * la deja como anexo del documento y permite publicarla en línea para recoger respuestas.
 */

const uid = () => Math.random().toString(36).slice(2, 9);
const TIPOS_INS = { encuesta: 'Encuesta (cuestionario)', entrevista: 'Guía de entrevista' };

const generar = async ({ tipo, aplicaA, cantidad, data }) => {
    const { general, especificos } = partesObjetivos(data.objetivos);
    const r = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: 'Eres metodólogo de investigación. Diseñas instrumentos de recolección de datos claros, neutrales y medibles para estudiantes universitarios. Cada pregunta mide una sola cosa, sin inducir la respuesta, sin dobles negaciones y con lenguaje sencillo. Respondes solo JSON válido en español.' },
            { role: 'user', content: `Diseña ${tipo === 'entrevista' ? 'una guía de entrevista semiestructurada' : 'un cuestionario de encuesta'} para este proyecto.\n\nTÍTULO: ${String(data.titulo || '').trim()}\nPREGUNTA: ${String(data.pregunta || '').split('\n')[0]}\nOBJETIVO GENERAL: ${general || data.objetivoGeneral || ''}\nOBJETIVOS ESPECÍFICOS:\n${especificos.map((o, i) => `${i + 1}. ${o}`).join('\n') || '(sin definir)'}\nSE APLICA A: ${aplicaA || 'los participantes del estudio'}\n\nReglas:\n- ${cantidad} preguntas en total, repartidas entre los objetivos específicos que se pueden medir con este instrumento.\n- Empieza con 2 o 3 preguntas de caracterización (edad, sexo u otra pertinente).\n- ${tipo === 'entrevista' ? 'Todas las preguntas son de tipo "abierta", invitan a narrar y no se responden con sí o no.' : 'Usa sobre todo tipo "likert" (afirmaciones para valorar de acuerdo/desacuerdo) y "opcion"; máximo 2 preguntas "abierta".'}\n- tipo es uno de: "likert", "opcion", "multiple", "sino", "numero", "abierta".\n- En "opcion" y "multiple" da entre 3 y 6 opciones excluyentes y completas. En "likert" deja opciones vacío.\n- objetivo es el número del objetivo específico que mide (0 para caracterización).\n\nResponde exactamente: {"titulo": "nombre del instrumento", "intro": "presentación breve para el participante: propósito, que es voluntario y anónimo, y tiempo estimado", "preguntas": [{"texto": "...", "tipo": "...", "opciones": ["..."], "objetivo": 1}]}` },
        ],
        temperature: 0.4,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
    });
    const content = r.choices?.[0]?.message?.content || '';
    const json = JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1));
    const tiposOk = new Set(TIPOS_PREGUNTA.map((t) => t.id));
    return {
        titulo: String(json.titulo || '').trim(),
        intro: String(json.intro || '').trim(),
        preguntas: (Array.isArray(json.preguntas) ? json.preguntas : []).map((q) => ({
            id: uid(),
            texto: String(q?.texto || '').trim(),
            tipo: tiposOk.has(q?.tipo) ? q.tipo : 'abierta',
            opciones: (Array.isArray(q?.opciones) ? q.opciones : []).map((o) => String(o).trim()).filter(Boolean).slice(0, 8),
            objetivo: Number(q?.objetivo) || 0,
        })).filter((q) => q.texto).slice(0, 40),
    };
};

const Pregunta = ({ q, n, total, especificos, onChange, onMove, onRemove }) => {
    const tipo = TIPOS_PREGUNTA.find((t) => t.id === q.tipo) || TIPOS_PREGUNTA[5];
    return (
        <li className="ins-pregunta">
            <div className="ins-pregunta-top">
                <b>{n}</b>
                <textarea className="textarea-field" rows={2} value={q.texto} onChange={(e) => onChange({ texto: e.target.value })} placeholder="Escribe la pregunta o la afirmación" aria-label={`Pregunta ${n}`} />
                <div className="ins-mover">
                    <button type="button" onClick={() => onMove(-1)} disabled={n === 1} aria-label="Subir"><ArrowUp size={14} /></button>
                    <button type="button" onClick={() => onMove(1)} disabled={n === total} aria-label="Bajar"><ArrowDown size={14} /></button>
                    <button type="button" onClick={onRemove} aria-label="Quitar pregunta"><Trash2 size={14} /></button>
                </div>
            </div>
            <div className="ins-pregunta-opts">
                <select className="input-field" value={q.tipo} onChange={(e) => onChange({ tipo: e.target.value })} aria-label="Tipo de respuesta">
                    {TIPOS_PREGUNTA.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
                <select className="input-field" value={q.objetivo || 0} onChange={(e) => onChange({ objetivo: Number(e.target.value) })} aria-label="Objetivo que mide">
                    <option value={0}>Caracterización</option>
                    {especificos.map((o, i) => <option key={o} value={i + 1}>Objetivo específico {i + 1}</option>)}
                </select>
                {q.tipo === 'likert' && (
                    <select className="input-field" value={(q.opciones || []).join('|') === FRECUENCIA.join('|') ? 'frecuencia' : (q.opciones || []).length ? 'propia' : 'acuerdo'} onChange={(e) => onChange({ opciones: e.target.value === 'frecuencia' ? FRECUENCIA : e.target.value === 'acuerdo' ? [] : q.opciones })} aria-label="Escala">
                        <option value="acuerdo">Escala de acuerdo (5 puntos)</option>
                        <option value="frecuencia">Escala de frecuencia (5 puntos)</option>
                        {(q.opciones || []).length > 0 && (q.opciones || []).join('|') !== FRECUENCIA.join('|') && <option value="propia">Escala propia</option>}
                    </select>
                )}
            </div>
            {tipo.conOpciones && q.tipo !== 'likert' && (
                <input className="input-field" value={(q.opciones || []).join('; ')} onChange={(e) => onChange({ opciones: e.target.value.split(';').map((o) => o.trimStart()) })} placeholder="Opciones separadas por punto y coma: Olvido; Falta de transporte; Trabajo; Otro" aria-label="Opciones" />
            )}
            {q.tipo === 'likert' && <small className="ins-escala">{opcionesDe(q).map((o, i) => `(${i + 1}) ${o}`).join(' · ')}</small>}
        </li>
    );
};

const Instrumentos = ({ onNavigate, embebido = false }) => {
    const { data, project, user } = useProject();
    const [lista, setLista] = useProjectField('instrumentosGen', []);
    const instrumentos = Array.isArray(lista) ? lista : [];
    const [activo, setActivo] = useState('');
    const [nuevo, setNuevo] = useState({ tipo: 'encuesta', aplicaA: '', cantidad: 15 });
    const [estado, setEstado] = useState('');
    const [error, setError] = useState('');
    const [publicadas, setPublicadas] = useState({});
    const [copiado, setCopiado] = useState(false);
    const { especificos } = partesObjetivos(data.objetivos);
    const ins = instrumentos.find((i) => i.id === activo) || instrumentos[0] || null;

    const cargarPublicadas = useCallback(async () => {
        if (!project.id) return;
        try {
            const { surveys } = await api.surveys(project.id);
            setPublicadas(Object.fromEntries(surveys.map((s) => [s.instrumentId, s])));
        } catch { /* noop */ }
    }, [project.id]);
    useEffect(() => { cargarPublicadas(); }, [cargarPublicadas]);

    const cambiar = (patch) => setLista((prev) => (Array.isArray(prev) ? prev : []).map((i) => (i.id === ins.id ? { ...i, ...patch } : i)));
    const cambiarPregunta = (qid, patch) => cambiar({ preguntas: ins.preguntas.map((q) => (q.id === qid ? { ...q, ...patch } : q)) });
    const mover = (index, delta) => {
        const copia = [...ins.preguntas];
        const [q] = copia.splice(index, 1);
        copia.splice(index + delta, 0, q);
        cambiar({ preguntas: copia });
    };
    const crear = async (conIA) => {
        setError('');
        const base = { id: uid(), tipo: nuevo.tipo, aplicaA: nuevo.aplicaA.trim(), ubicacion: 'plan', titulo: `${nuevo.tipo === 'entrevista' ? 'Guía de entrevista' : 'Cuestionario'}${nuevo.aplicaA.trim() ? ` para ${nuevo.aplicaA.trim()}` : ''}`, intro: '', preguntas: [] };
        if (conIA) {
            setEstado('generando');
            try {
                const g = await generar({ ...nuevo, data });
                if (!g.preguntas.length) throw new Error('La IA no devolvió preguntas. Inténtalo de nuevo.');
                Object.assign(base, { titulo: g.titulo || base.titulo, intro: g.intro, preguntas: g.preguntas });
            } catch (err) {
                setError(err?.message?.includes('JSON') ? 'La IA respondió en un formato inesperado. Inténtalo de nuevo.' : (err.message || 'No se pudo generar el instrumento.'));
                setEstado('');
                return;
            }
            setEstado('');
        } else {
            base.preguntas = [{ id: uid(), texto: '', tipo: nuevo.tipo === 'entrevista' ? 'abierta' : 'likert', opciones: [], objetivo: 0 }];
        }
        setLista((prev) => [...(Array.isArray(prev) ? prev : []), base]);
        setActivo(base.id);
    };
    const eliminar = () => {
        setLista((prev) => (Array.isArray(prev) ? prev : []).filter((i) => i.id !== ins.id));
        setActivo('');
    };

    const pub = ins ? publicadas[ins.id] : null;
    const enlace = pub ? `${window.location.origin}/?encuesta=${pub.token}` : '';
    const publicar = async (open) => {
        setError('');
        setEstado('publicando');
        try {
            const { survey } = await api.publishSurvey(project.id, ins.id, { definition: definicionEncuesta(ins), open });
            setPublicadas((prev) => ({ ...prev, [ins.id]: survey }));
        } catch (err) {
            setError(err.message);
        } finally {
            setEstado('');
        }
    };
    const copiar = async () => {
        try { await navigator.clipboard.writeText(enlace); setCopiado(true); setTimeout(() => setCopiado(false), 2500); } catch { /* noop */ }
    };
    const validas = ins ? preguntasDe(ins) : [];
    const sinOpciones = validas.filter((q) => ['opcion', 'multiple'].includes(q.tipo) && q.opciones.length < 2).length;

    return (
        <div className={embebido ? 'ins-page ins-embebido' : 'pro-page ins-page'}>
            <section className="pro-card ins-nuevo">
                <h2><ClipboardList size={20} aria-hidden="true" /> {embebido ? 'Arma el instrumento completo' : 'Crear un instrumento'}</h2>
                <p className="adm-muted">La IA propone las preguntas a partir de tu título y tus objetivos específicos; tú las revisas y ajustas. El instrumento sale en tu documento dentro del Plan de análisis de la información. Recuerda validarlo (juicio de expertos, prueba piloto) como indica tu Metodología.</p>
                {especificos.length === 0 && <p className="pro-warn">Todavía no tienes objetivos específicos. Créalos primero para que las preguntas midan lo que tu proyecto necesita. <button type="button" className="pro-link" onClick={() => onNavigate('objetivos')}>Ir a Objetivos</button></p>}
                <div className="ins-nuevo-form">
                    <label><span>Tipo</span>
                        <select className="input-field" value={nuevo.tipo} onChange={(e) => setNuevo({ ...nuevo, tipo: e.target.value, cantidad: e.target.value === 'entrevista' ? 10 : 15 })}>
                            {Object.entries(TIPOS_INS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    </label>
                    <label><span>Se aplica a</span>
                        <input className="input-field" value={nuevo.aplicaA} onChange={(e) => setNuevo({ ...nuevo, aplicaA: e.target.value })} placeholder={`Ej: ${data.tituloForm?.quien || 'los pacientes de consulta externa'}`} />
                    </label>
                    <label><span>Preguntas</span>
                        <select className="input-field" value={nuevo.cantidad} onChange={(e) => setNuevo({ ...nuevo, cantidad: Number(e.target.value) })}>
                            {[8, 10, 15, 20, 25].map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </label>
                </div>
                <div className="ins-acciones">
                    <button type="button" className="pro-btn pro-btn--primary" onClick={() => crear(true)} disabled={estado === 'generando'}>
                        {estado === 'generando' ? <Loader2 size={16} className="ins-spin" /> : <Sparkles size={16} />} {estado === 'generando' ? 'Generando preguntas…' : 'Generar con IA'}
                    </button>
                    <button type="button" className="pro-btn pro-btn--ghost" onClick={() => crear(false)} disabled={estado === 'generando'}><Plus size={16} /> Empezar en blanco</button>
                </div>
                {error && <p className="pro-alert" role="alert"><AlertTriangle size={15} /> {error}</p>}
            </section>

            {instrumentos.length > 1 && (
                <div className="ins-tabs" role="tablist">
                    {instrumentos.map((i) => <button key={i.id} type="button" role="tab" aria-selected={ins?.id === i.id} onClick={() => setActivo(i.id)}>{i.titulo || 'Instrumento'}</button>)}
                </div>
            )}

            {ins && (
                <div className="ins-grid">
                    <section className="pro-card">
                        <div className="ins-head">
                            <input className="input-field ins-titulo" value={ins.titulo || ''} onChange={(e) => cambiar({ titulo: e.target.value })} placeholder="Nombre del instrumento" aria-label="Nombre del instrumento" />
                            <button type="button" className="pro-link pro-link--danger" onClick={eliminar}><Trash2 size={14} /> Eliminar</button>
                        </div>
                        <label className="ins-campo"><span>Presentación para el participante</span>
                            <textarea className="textarea-field" rows={3} value={ins.intro || ''} onChange={(e) => cambiar({ intro: e.target.value })} placeholder="Propósito del estudio, que la participación es voluntaria y anónima, y cuánto tarda." />
                        </label>
                        <ol className="ins-preguntas">
                            {ins.preguntas.map((q, i) => (
                                <Pregunta key={q.id} q={q} n={i + 1} total={ins.preguntas.length} especificos={especificos} onChange={(patch) => cambiarPregunta(q.id, patch)} onMove={(d) => mover(i, d)} onRemove={() => cambiar({ preguntas: ins.preguntas.filter((x) => x.id !== q.id) })} />
                            ))}
                        </ol>
                        <button type="button" className="pro-btn pro-btn--ghost" onClick={() => cambiar({ preguntas: [...ins.preguntas, { id: uid(), texto: '', tipo: ins.tipo === 'entrevista' ? 'abierta' : 'likert', opciones: [], objetivo: 0 }] })}><Plus size={15} /> Agregar pregunta</button>
                    </section>

                    <aside className="ins-lado">
                        <section className="pro-card">
                            <h3>En tu documento</h3>
                            <label className="ins-campo"><span>¿Dónde va el instrumento? ({validas.length} preguntas)</span>
                                <select className="input-field" value={ubicacionDe(ins)} onChange={(e) => cambiar({ ubicacion: e.target.value })}>
                                    {UBICACIONES.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
                                </select>
                            </label>
                            {especificos.length > 0 && (
                                <ul className="ins-cobertura">
                                    {especificos.map((o, i) => {
                                        const n = validas.filter((q) => q.objetivo === i + 1).length;
                                        return <li key={o} data-ok={n > 0}>{n > 0 ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />} Objetivo {i + 1}: {n} {n === 1 ? 'pregunta' : 'preguntas'}</li>;
                                    })}
                                </ul>
                            )}
                            {sinOpciones > 0 && <p className="pro-warn">{sinOpciones} {sinOpciones === 1 ? 'pregunta necesita' : 'preguntas necesitan'} al menos dos opciones.</p>}
                        </section>

                        {ins.tipo !== 'entrevista' && (
                            <section className="pro-card">
                                <h3><Globe size={16} aria-hidden="true" /> Aplicarla en línea</h3>
                                {!user || !project.id ? <p className="adm-muted">Inicia sesión para publicarla.</p> : !pub ? (
                                    <>
                                        <p className="adm-muted">Se crea un enlace para que los participantes respondan desde el celular, sin cuenta y de forma anónima.</p>
                                        <button type="button" className="pro-btn pro-btn--primary" onClick={() => publicar(true)} disabled={estado === 'publicando' || validas.length === 0 || sinOpciones > 0}><Globe size={15} /> Publicar encuesta</button>
                                    </>
                                ) : (
                                    <>
                                        <p className="ins-estado" data-open={pub.open}>{pub.open ? 'Recibiendo respuestas' : 'Cerrada'} · <b>{pub.count}</b> {pub.count === 1 ? 'respuesta' : 'respuestas'}</p>
                                        <div className="ins-enlace"><input className="input-field" readOnly value={enlace} onFocus={(e) => e.target.select()} aria-label="Enlace de la encuesta" /><button type="button" className="pro-btn pro-btn--ghost" onClick={copiar}><Copy size={15} /> {copiado ? 'Copiado' : 'Copiar'}</button></div>
                                        <div className="ins-acciones">
                                            <button type="button" className="pro-btn pro-btn--ghost" onClick={() => publicar(pub.open)} disabled={estado === 'publicando'}>Actualizar preguntas en línea</button>
                                            <button type="button" className="pro-btn pro-btn--ghost" onClick={() => publicar(!pub.open)} disabled={estado === 'publicando'}>{pub.open ? 'Cerrar encuesta' : 'Volver a abrir'}</button>
                                            <button type="button" className="pro-btn pro-btn--primary" onClick={() => { try { window.sessionStorage.setItem('projectsia:analisis:fuente', ins.id); } catch { /* noop */ } onNavigate('analisis'); }}><BarChart3 size={15} /> Analizar respuestas</button>
                                        </div>
                                        <small className="adm-muted">Si cambias las preguntas después de recibir respuestas, usa «Actualizar preguntas en línea». No cambies el sentido de una pregunta ya respondida.</small>
                                    </>
                                )}
                            </section>
                        )}
                    </aside>
                </div>
            )}
        </div>
    );
};

export default Instrumentos;
