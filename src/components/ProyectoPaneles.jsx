import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, History, Languages, LogOut, Paperclip, Plus, RotateCcw, Trash2, UserPlus, Users } from 'lucide-react';
import { useProject, useProjectField } from '../context/ProjectContext';
import { api } from '../services/api';
import EditorRico from './EditorRico';
import { CAMPOS_SECCION, SECTIONS, buildDocument, documentText, matrizConsistencia } from '../services/projectDoc';
import { Aviso } from './Avisos';
import Selector from './Selector';
import { compararTextos, contarCambios } from '../services/diff';
import { ESTILO_VACIO, PERSONAS, TIEMPOS, normalizarEstilo, revisarProyecto } from '../services/estilo';
import { avisar, confirmar } from './Avisos';

/* Paneles de Mi proyecto: Equipo, Historial de versiones y Anexos. */

const uid = () => Math.random().toString(36).slice(2, 9);

/* ---------- Equipo ---------- */

export const Equipo = () => {
    const { user, project, refreshProjects, openProject } = useProject();
    const [members, setMembers] = useState([]);
    const [isOwner, setIsOwner] = useState(false);
    const [email, setEmail] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const cargar = useCallback(async () => {
        if (!project.id) return;
        try {
            const r = await api.members(project.id);
            setMembers(r.members);
            setIsOwner(r.isOwner);
        } catch { /* noop */ }
    }, [project.id]);
    useEffect(() => { setMsg(''); setError(''); cargar(); }, [cargar]);

    if (!user || !project.id) {
        return <p className="pro-panel-hint">Inicia sesión para invitar a tus compañeros: cada integrante entra con su propia cuenta y todos editan el mismo proyecto.</p>;
    }

    const invitar = async (event) => {
        event.preventDefault();
        setError('');
        setMsg('');
        setBusy(true);
        try {
            const r = await api.addMember(project.id, email);
            setMembers(r.members);
            window.dispatchEvent(new Event('projectsia:equipo')); // el documento vuelve a leer sus autores
            setMsg(r.mailed ? `Invitación enviada a ${email.trim()}.` : `${email.trim()} ya puede abrir el proyecto al iniciar sesión con ese correo.`);
            setEmail('');
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };
    const quitar = async (m) => {
        setError('');
        try {
            const r = await api.removeMember(project.id, m.email);
            if (isOwner) { setMembers(r.members); window.dispatchEvent(new Event('projectsia:equipo')); return; }
            // Quien se sale deja de ver el proyecto: se abre otro de su lista.
            const list = await refreshProjects();
            if (list[0]) await openProject(list[0].id);
        } catch (err) {
            setError(err.message);
        }
    };
    const yo = String(user.email || '').toLowerCase();

    return (
        <div className="pro-panel-body">
            <p className="pro-panel-hint">Los integrantes editan el mismo proyecto, cada uno con su cuenta. Lo que guarda uno aparece a los demás en unos segundos; para no pisarse, trabajen en secciones distintas.</p>
            <ul className="pro-members">
                {members.map((m) => (
                    <li key={m.email}>
                        <span>
                            <b>{m.name || m.email}</b>
                            <small>{m.owner ? 'Creó el proyecto' : m.registered ? m.email : `${m.email} · aún no ha creado su cuenta`}</small>
                        </span>
                        {!m.owner && isOwner && <button type="button" className="pro-link pro-link--danger" onClick={() => quitar(m)}><Trash2 size={14} /> Quitar</button>}
                        {!m.owner && !isOwner && m.email === yo && <button type="button" className="pro-link pro-link--danger" onClick={() => quitar(m)}><LogOut size={14} /> Salir del proyecto</button>}
                    </li>
                ))}
            </ul>
            {isOwner && (
                <form className="pro-invite" onSubmit={invitar}>
                    <input className="input-field" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@delcompañero.com" aria-label="Correo del compañero" />
                    <button type="submit" className="pro-btn pro-btn--primary" disabled={busy}><UserPlus size={16} /> {busy ? 'Invitando…' : 'Invitar'}</button>
                </form>
            )}
            <Aviso texto={msg} />
            <Aviso texto={error} tipo="error" />
        </div>
    );
};

/* ---------- Historial ---------- */

const fecha = (ms) => new Date(ms).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const igual = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

export const Historial = () => {
    const { user, project, data, setField, flush } = useProject();
    const [versions, setVersions] = useState([]);
    const [abierta, setAbierta] = useState(null); // { id, createdAt, data }
    const [contra, setContra] = useState(null); // otra copia con la que se compara; null = lo que hay ahora
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    const cargar = useCallback(async () => {
        if (!project.id) return;
        try { setVersions((await api.versions(project.id)).versions); } catch { /* noop */ }
    }, [project.id]);
    useEffect(() => { setAbierta(null); setContra(null); setMsg(''); cargar(); }, [cargar]);

    // Secciones que cambian entre la copia abierta y aquello con lo que se compara (lo de ahora u otra copia),
    // con el texto de cada lado y las palabras que se quitaron o se agregaron.
    const otro = contra ? contra.data : data;
    const cambios = useMemo(() => {
        if (!abierta) return [];
        const textoDe = (documento, id) => {
            const seccion = documento.find((x) => x.id === id);
            return seccion.content.length ? documentText('', [{ ...seccion, inDocument: true }]).split('\n').slice(3).join('\n').trim() : '';
        };
        const antes = buildDocument(abierta.data);
        const despues = buildDocument(otro);
        // La copia más antigua va a la izquierda, para leer «antes → después».
        const abiertaEsAnterior = !contra || abierta.createdAt <= contra.createdAt;
        return SECTIONS.filter((s) => CAMPOS_SECCION[s.id]).map((s) => {
            const campos = CAMPOS_SECCION[s.id];
            if (campos.every((k) => igual(abierta.data[k], otro[k]))) return null;
            const deAbierta = textoDe(antes, s.id);
            const delOtro = textoDe(despues, s.id);
            const trozos = abiertaEsAnterior ? compararTextos(deAbierta, delOtro) : compararTextos(delOtro, deAbierta);
            return { id: s.id, label: s.label, campos, trozos, ...contarCambios(trozos), soloFormato: deAbierta === delOtro };
        }).filter(Boolean);
    }, [abierta, contra, otro]);
    const abiertaEsAnterior = !contra || (abierta && abierta.createdAt <= contra.createdAt);
    const nombreAbierta = abierta ? `Copia del ${fecha(abierta.createdAt)}` : '';
    const nombreOtro = contra ? `Copia del ${fecha(contra.createdAt)}` : 'Lo que tienes ahora';

    if (!user || !project.id) return <p className="pro-panel-hint">Con una cuenta, la app guarda copias automáticas de tu proyecto para que puedas volver atrás.</p>;

    const abrir = async (v) => {
        setError('');
        setMsg('');
        try { setAbierta((await api.version(project.id, v.id)).version); setContra(null); } catch (err) { setError(err.message); }
    };
    const compararCon = async (vid) => {
        setError('');
        if (!vid) { setContra(null); return; }
        try { setContra((await api.version(project.id, Number(vid))).version); } catch (err) { setError(err.message); }
    };
    // Antes de restaurar se guarda una copia de lo actual: la restauración también se puede deshacer.
    const restaurar = async (campos, etiqueta) => {
        setError('');
        try {
            await flush();
            await api.saveVersion(project.id);
            campos.forEach((k) => setField(k, abierta.data[k]));
            setMsg(`Se restauró ${etiqueta}. Lo que tenías quedó guardado como otra copia.`);
            cargar();
        } catch (err) {
            setError(err.message);
        }
    };
    const copiaAhora = async () => {
        setError('');
        try { await flush(); await api.saveVersion(project.id); setMsg('Copia guardada.'); cargar(); } catch (err) { setError(err.message); }
    };

    return (
        <div className="pro-panel-body">
            <p className="pro-panel-hint">Mientras trabajas se guarda una copia cada 10 minutos (se conservan las últimas 40). Abre una copia para ver qué cambió, compararla lado a lado con lo de ahora o con otra copia, y restaurar solo la sección que necesites.</p>
            <button type="button" className="pro-btn pro-btn--ghost" onClick={copiaAhora}><Plus size={15} /> Guardar una copia ahora</button>
            {versions.length === 0 && <p className="pro-panel-hint">Todavía no hay copias. La primera se crea cuando edites el proyecto.</p>}
            <ul className="pro-versions">
                {versions.map((v) => (
                    <li key={v.id} data-open={abierta?.id === v.id}>
                        <button type="button" onClick={() => abrir(v)}>
                            <b>{fecha(v.createdAt)}</b>
                            <small>{v.author ? `Antes de los cambios de ${v.author}` : 'Copia automática'}</small>
                        </button>
                    </li>
                ))}
            </ul>
            {abierta && (
                <div className="pro-version">
                    <div className="pro-version-cabeza">
                        <h4>{nombreAbierta}</h4>
                        <label className="pro-version-contra">
                            <span>Comparar con</span>
                            <Selector compacto buscar={versions.length > 8} etiqueta="Comparar con" value={contra ? contra.id : ''} onChange={compararCon} opciones={[{ value: '', label: 'Lo que tienes ahora' }, ...versions.filter((v) => v.id !== abierta.id).map((v) => ({ value: v.id, label: `Copia del ${fecha(v.createdAt)}`, nota: v.author ? `Antes de los cambios de ${v.author}` : 'Copia automática' }))]} />
                        </label>
                    </div>
                    {cambios.length === 0
                        ? <p className="pro-panel-hint">{contra ? 'Estas dos copias son iguales.' : 'Esta copia es igual a lo que tienes ahora.'}</p>
                        : (
                            <>
                                <p className="pro-panel-hint">{cambios.length === 1 ? 'Cambia una sección' : `Cambian ${cambios.length} secciones`}. Ábrelas para ver los dos textos lado a lado: <span className="pro-dif pro-dif--menos">lo que se quitó</span> y <span className="pro-dif pro-dif--mas">lo que se agregó</span>.</p>
                                {cambios.map((c) => (
                                    <details key={c.id}>
                                        <summary>
                                            <span>{c.label} <small>{c.soloFormato ? 'solo cambian datos internos' : `${c.quitadas ? `−${c.quitadas}` : ''}${c.quitadas && c.agregadas ? ' · ' : ''}${c.agregadas ? `+${c.agregadas}` : ''} palabras`}</small></span>
                                            <button type="button" className="pro-link" onClick={(e) => { e.preventDefault(); restaurar(c.campos, `«${c.label}»`); }} title={`Deja esta sección como estaba en la ${nombreAbierta.toLowerCase()}`}><RotateCcw size={14} /> Restaurar esta sección</button>
                                        </summary>
                                        <div className="pro-lados">
                                            <div>
                                                <b>{abiertaEsAnterior ? nombreAbierta : nombreOtro}</b>
                                                <p>{c.trozos.filter((t) => t.tipo !== '+').map((t, i) => (t.tipo === '-' ? <span key={i} className="pro-dif pro-dif--menos">{t.texto}</span> : <React.Fragment key={i}>{t.texto}</React.Fragment>))}{c.trozos.every((t) => t.tipo === '+') && <em>(Vacía)</em>}</p>
                                            </div>
                                            <div>
                                                <b>{abiertaEsAnterior ? nombreOtro : nombreAbierta}</b>
                                                <p>{c.trozos.filter((t) => t.tipo !== '-').map((t, i) => (t.tipo === '+' ? <span key={i} className="pro-dif pro-dif--mas">{t.texto}</span> : <React.Fragment key={i}>{t.texto}</React.Fragment>))}{c.trozos.every((t) => t.tipo === '-') && <em>(Vacía)</em>}</p>
                                            </div>
                                        </div>
                                    </details>
                                ))}
                                <button type="button" className="pro-btn pro-btn--ghost" onClick={() => restaurar(cambios.flatMap((c) => c.campos), contra ? 'esas secciones' : 'todo el proyecto')}><RotateCcw size={15} /> {contra ? `Restaurar estas secciones como en la ${nombreAbierta.toLowerCase()}` : 'Restaurar todas las secciones'}</button>
                            </>
                        )}
                </div>
            )}
            <Aviso texto={msg} />
            <Aviso texto={error} tipo="error" />
        </div>
    );
};

/* ---------- Anexos ---------- */

export const Anexos = () => {
    const { data } = useProject();
    const [anexos, setAnexos] = useProjectField('anexos', []);
    const [oculta, setOculta] = useProjectField('matrizOculta', false);
    const lista = Array.isArray(anexos) ? anexos : [];
    const hayMatriz = Boolean(matrizConsistencia(data));
    const cambiar = (id, patch) => setAnexos((prev) => (Array.isArray(prev) ? prev : []).map((a) => (a.id === id ? { ...a, ...patch } : a)));

    return (
        <div className="pro-panel-body">
            <p className="pro-panel-hint">Los anexos van al final del documento, después de las referencias, y se nombran solos (Anexo A, Anexo B…).</p>
            <label className="pro-check">
                <input type="checkbox" checked={!oculta} onChange={(e) => setOculta(!e.target.checked)} />
                <span><b>Matriz de consistencia</b> — se arma sola con tu pregunta, tus objetivos, tu metodología y tus instrumentos.{!hayMatriz && ' Aparecerá cuando tengas la pregunta y los objetivos específicos.'}</span>
            </label>
            {lista.map((a) => (
                <div className="pro-anexo" key={a.id}>
                    <div className="pro-anexo-head">
                        <input className="input-field" value={a.titulo || ''} onChange={(e) => cambiar(a.id, { titulo: e.target.value })} placeholder="Título: Cuestionario aplicado a los pacientes" aria-label="Título del anexo" />
                        <button type="button" className="pro-link pro-link--danger" onClick={() => setAnexos(lista.filter((x) => x.id !== a.id))}><Trash2 size={14} /> Quitar</button>
                    </div>
                    <EditorRico listas className="textarea-field" rows={7} value={a.contenido || ''} onChange={(e) => cambiar(a.id, { contenido: e.target.value })} placeholder={'Pega aquí el instrumento completo. Ejemplo:\n\n**Datos generales**\n1. Edad: ____\n2. Sexo: ____\n\n**Asistencia a las citas**\n3. ¿Cuántas citas perdió en los últimos seis meses?'} aria-label="Contenido del anexo" />
                </div>
            ))}
            <button type="button" className="pro-btn pro-btn--ghost" onClick={() => setAnexos([...lista, { id: uid(), titulo: '', contenido: '' }])}><Plus size={15} /> Agregar anexo (encuesta, guía de entrevista, consentimiento…)</button>
        </div>
    );
};

/* ---------- Vocabulario y estilo ---------- */

export const Estilo = () => {
    const { user, project, data, setField, flush } = useProject();
    const [guardado, setGuardado] = useProjectField('estilo', ESTILO_VACIO);
    const e = { ...ESTILO_VACIO, ...(guardado || {}) };
    const terminos = Array.isArray(e.terminos) ? e.terminos : [];
    const cambiar = (patch) => setGuardado({ ...e, ...patch });
    const cambiarTermino = (i, patch) => cambiar({ terminos: terminos.map((x, k) => (k === i ? { ...x, ...patch } : x)) });
    const revision = useMemo(() => revisarProyecto(data, e), [data]); // eslint-disable-line react-hooks/exhaustive-deps
    const reemplazables = revision.hallazgos.filter((h) => h.usar);
    const total = reemplazables.reduce((s, h) => s + h.veces, 0);

    const reemplazar = async () => {
        if (!(await confirmar({ texto: `¿Corregir ${total} ${total === 1 ? 'aparición' : 'apariciones'} en todo el proyecto?`, detalle: `${reemplazables.map((h) => `«${h.termino}» → «${h.usar}» (${h.veces})`).join('; ')}. No se tocan las referencias ni los títulos de tus fuentes. Lo anterior queda en el historial.`, aceptar: 'Corregir' }))) return;
        try {
            if (user && project.id) { await flush(); await api.saveVersion(project.id); }
            Object.entries(revision.cambios).forEach(([k, v]) => setField(k, v));
            avisar(`Vocabulario corregido en ${Object.keys(revision.cambios).length} ${Object.keys(revision.cambios).length === 1 ? 'campo' : 'campos'} del proyecto.`);
        } catch (err) {
            avisar(err.message || 'No se pudo corregir.', 'error');
        }
    };

    return (
        <div className="pro-panel-body est">
            <p className="pro-panel-hint">Define cómo se escribe este proyecto. La IA lo respeta en todo lo que redacte de aquí en adelante (sugerencias, redacción, resultados, conclusiones) y los términos que pidas cambiar se corrigen aunque vengan así en una fuente.</p>
            <div className="est-fila">
                <label><span>Persona gramatical</span>
                    <select className="input-field" value={e.persona || ''} onChange={(ev) => cambiar({ persona: ev.target.value })}>{PERSONAS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}</select>
                </label>
                <label><span>Tiempo verbal</span>
                    <select className="input-field" value={e.tiempo || ''} onChange={(ev) => cambiar({ tiempo: ev.target.value })}>{TIEMPOS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}</select>
                </label>
            </div>
            <div className="est-terminos">
                <b>Términos del proyecto</b>
                {terminos.length === 0 && <p className="pro-panel-hint">Ejemplo: usar «inasistencia» en lugar de «no-show»; «pacientes» en lugar de «usuarios».</p>}
                {terminos.map((x, i) => (
                    <div key={i} className="est-termino">
                        <label><span>Usar</span><input className="input-field" value={x.usar || ''} maxLength={80} onChange={(ev) => cambiarTermino(i, { usar: ev.target.value })} placeholder="inasistencia" /></label>
                        <label><span>en lugar de</span><input className="input-field" value={x.enLugarDe || ''} maxLength={80} onChange={(ev) => cambiarTermino(i, { enLugarDe: ev.target.value })} placeholder="no-show" /></label>
                        <button type="button" onClick={() => cambiar({ terminos: terminos.filter((_, k) => k !== i) })} aria-label={`Quitar el término ${x.usar || i + 1}`}><Trash2 size={15} /></button>
                    </div>
                ))}
                <button type="button" className="pro-btn pro-btn--ghost" onClick={() => cambiar({ terminos: [...terminos, { usar: '', enLugarDe: '' }] })}><Plus size={15} /> Agregar término</button>
            </div>
            <label className="est-campo"><span>Palabras o expresiones que no deben aparecer (separadas por coma)</span>
                <input className="input-field" value={(Array.isArray(e.evitar) ? e.evitar : []).join(', ')} onChange={(ev) => cambiar({ evitar: ev.target.value.split(',').map((v) => v.trimStart()) })} placeholder="en la actualidad, hoy en día, etc." />
            </label>
            <label className="est-campo"><span>Otra indicación de estilo (opcional)</span>
                <input className="input-field" value={e.notas || ''} maxLength={400} onChange={(ev) => cambiar({ notas: ev.target.value })} placeholder="Ej: frases cortas; evita los gerundios; escribe los números del uno al nueve en letras." />
            </label>
            {revision.hallazgos.length > 0 && (
                <div className="est-hallazgos" role="status">
                    <b><AlertTriangle size={15} aria-hidden="true" /> En lo que ya está escrito</b>
                    <ul>{revision.hallazgos.map((h) => <li key={h.termino}>«{h.termino}» aparece {h.veces} {h.veces === 1 ? 'vez' : 'veces'}{h.usar ? <> — debería decir «{h.usar}»</> : ' — pediste evitarla; cámbiala a mano donde aparezca'}</li>)}</ul>
                    {total > 0 && <button type="button" className="pro-btn pro-btn--primary" onClick={reemplazar}>Corregir {total} {total === 1 ? 'aparición' : 'apariciones'} en todo el proyecto</button>}
                </div>
            )}
            {revision.hallazgos.length === 0 && normalizarEstilo(e).terminos.length + normalizarEstilo(e).evitar.length > 0 && <p className="pro-panel-hint"><CheckCircle2 size={14} style={{ verticalAlign: '-2px' }} /> Lo que ya está escrito respeta tu vocabulario.</p>}
        </div>
    );
};

const PANELES = [
    { id: 'equipo', label: 'Equipo', icon: Users, Comp: Equipo },
    { id: 'historial', label: 'Historial de versiones', icon: History, Comp: Historial },
    { id: 'anexos', label: 'Anexos', icon: Paperclip, Comp: Anexos },
    { id: 'estilo', label: 'Vocabulario y estilo', icon: Languages, Comp: Estilo },
];

// `extra`: acciones del proyecto que van en la misma fila, al final (p. ej. «Eliminar proyecto»).
const ProyectoPaneles = ({ extra = null }) => {
    const [abierto, setAbierto] = useState('');
    return (
        <section className="pro-paneles" aria-label="Herramientas del proyecto">
            <div className="pro-paneles-tabs" role="tablist">
                {PANELES.map((p) => (
                    <button key={p.id} type="button" role="tab" aria-selected={abierto === p.id} onClick={() => setAbierto(abierto === p.id ? '' : p.id)}>
                        <p.icon size={16} aria-hidden="true" /> {p.label}
                    </button>
                ))}
                {extra && <div className="pro-paneles-extra">{extra}</div>}
            </div>
            {PANELES.filter((p) => p.id === abierto).map((p) => <p.Comp key={p.id} />)}
        </section>
    );
};

export default ProyectoPaneles;
