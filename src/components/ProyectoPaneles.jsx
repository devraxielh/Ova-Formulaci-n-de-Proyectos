import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, History, LogOut, Paperclip, Plus, RotateCcw, Trash2, UserPlus, Users } from 'lucide-react';
import { useProject, useProjectField } from '../context/ProjectContext';
import { api } from '../services/api';
import EditorRico from './EditorRico';
import { CAMPOS_SECCION, SECTIONS, buildDocument, documentText, matrizConsistencia } from '../services/projectDoc';

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
            {msg && <p className="pro-notice" role="status"><CheckCircle2 size={15} /> {msg}</p>}
            {error && <p className="pro-alert" role="alert">{error}</p>}
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
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    const cargar = useCallback(async () => {
        if (!project.id) return;
        try { setVersions((await api.versions(project.id)).versions); } catch { /* noop */ }
    }, [project.id]);
    useEffect(() => { setAbierta(null); setMsg(''); cargar(); }, [cargar]);

    // Secciones cuyo contenido en la versión abierta es distinto al actual.
    const cambios = useMemo(() => {
        if (!abierta) return [];
        const antes = buildDocument(abierta.data);
        return SECTIONS.filter((s) => CAMPOS_SECCION[s.id]).map((s) => {
            const campos = CAMPOS_SECCION[s.id];
            if (campos.every((k) => igual(abierta.data[k], data[k]))) return null;
            const seccion = antes.find((x) => x.id === s.id);
            const texto = seccion.content.length ? documentText('', [{ ...seccion, inDocument: true }]).split('\n').slice(3).join('\n').trim() : '';
            return { id: s.id, label: s.label, campos, texto };
        }).filter(Boolean);
    }, [abierta, data]);

    if (!user || !project.id) return <p className="pro-panel-hint">Con una cuenta, la app guarda copias automáticas de tu proyecto para que puedas volver atrás.</p>;

    const abrir = async (v) => {
        setError('');
        setMsg('');
        try { setAbierta((await api.version(project.id, v.id)).version); } catch (err) { setError(err.message); }
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
            <p className="pro-panel-hint">Mientras trabajas se guarda una copia cada 10 minutos (se conservan las últimas 40). Abre una copia para ver qué secciones cambiaron y restaurar solo la que necesites.</p>
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
                    <h4>Copia del {fecha(abierta.createdAt)}</h4>
                    {cambios.length === 0
                        ? <p className="pro-panel-hint">Esta copia es igual a lo que tienes ahora.</p>
                        : (
                            <>
                                {cambios.map((c) => (
                                    <details key={c.id}>
                                        <summary>
                                            <span>{c.label}</span>
                                            <button type="button" className="pro-link" onClick={(e) => { e.preventDefault(); restaurar(c.campos, `«${c.label}»`); }}><RotateCcw size={14} /> Restaurar esta sección</button>
                                        </summary>
                                        <pre>{c.texto || '(En esta copia la sección estaba vacía.)'}</pre>
                                    </details>
                                ))}
                                <button type="button" className="pro-btn pro-btn--ghost" onClick={() => restaurar(cambios.flatMap((c) => c.campos), 'todo el proyecto')}><RotateCcw size={15} /> Restaurar todas las secciones</button>
                            </>
                        )}
                </div>
            )}
            {msg && <p className="pro-notice" role="status"><CheckCircle2 size={15} /> {msg}</p>}
            {error && <p className="pro-alert" role="alert"><AlertTriangle size={15} /> {error}</p>}
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

const PANELES = [
    { id: 'equipo', label: 'Equipo', icon: Users, Comp: Equipo },
    { id: 'historial', label: 'Historial de versiones', icon: History, Comp: Historial },
    { id: 'anexos', label: 'Anexos', icon: Paperclip, Comp: Anexos },
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
