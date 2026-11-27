import React, { useCallback, useEffect, useState } from 'react';
import { ListChecks, Lock, Plus, Trash2, Unlock } from 'lucide-react';
import { api } from '../services/api';
import { SECCIONES_MENU } from '../data/secciones';
import { avisar, confirmar } from './Avisos';

// El profesor crea sus grupos y decide qué secciones puede construir cada uno, para que nadie se adelante.
// Sin lista guardada, el grupo tiene todas habilitadas. Un grupo puede crearse antes de tener estudiantes.
const TODAS = SECCIONES_MENU.map((s) => s.id);

const SeccionesGrupo = ({ version = 0, onGrupos }) => {
    const [grupos, setGrupos] = useState(null);
    const [grupo, setGrupo] = useState('');
    const [marcadas, setMarcadas] = useState(TODAS);
    const [guardando, setGuardando] = useState(false);
    const [nuevo, setNuevo] = useState('');
    const [creando, setCreando] = useState(false);

    const cargar = useCallback(async () => {
        try { setGrupos((await api.teacher.secciones()).grupos); } catch (err) { avisar(err.message, 'error'); setGrupos([]); }
    }, []);
    useEffect(() => { cargar(); }, [cargar, version]);
    // El panel usa estos nombres para ofrecerlos al crear estudiantes y al asociarlos.
    useEffect(() => { if (grupos) onGrupos?.(grupos.map((g) => g.grupo).filter(Boolean)); }, [grupos, onGrupos]);

    const crear = async (event) => {
        event.preventDefault();
        const nombre = nuevo.trim();
        if (!nombre) return;
        setCreando(true);
        try {
            const r = await api.teacher.crearGrupo(nombre);
            setGrupos(r.grupos);
            setGrupo(r.grupos.find((g) => g.grupo.toLowerCase() === nombre.toLowerCase())?.grupo || nombre);
            setNuevo('');
            avisar(`Grupo «${nombre}» creado. Elige abajo sus secciones y asocia estudiantes desde «Mis estudiantes».`);
        } catch (err) { avisar(err.message, 'error'); } finally { setCreando(false); }
    };
    const eliminar = async (g) => {
        if (!(await confirmar({ texto: `¿Eliminar el grupo «${g.grupo}»?`, detalle: 'Está vacío. Se borra también su lista de secciones habilitadas.', aceptar: 'Eliminar grupo', peligro: true }))) return;
        try { setGrupos((await api.teacher.eliminarGrupo(g.grupo)).grupos); setGrupo(''); avisar(`Grupo «${g.grupo}» eliminado.`); } catch (err) { avisar(err.message, 'error'); }
    };

    // Al cambiar de grupo (o al recargar) se muestra lo que ese grupo tiene guardado.
    const actual = (grupos || []).find((g) => g.grupo === grupo) || (grupos || [])[0];
    useEffect(() => {
        if (!actual) return;
        if (actual.grupo !== grupo) setGrupo(actual.grupo);
        setMarcadas(actual.secciones || TODAS);
    }, [actual, grupo]);

    if (!grupos) return null;
    const formulario = (
        <form className="sec-crear" onSubmit={crear}>
            <label htmlFor="sec-nuevo">Crear grupo</label>
            <input id="sec-nuevo" className="input-field" maxLength={60} value={nuevo} onChange={(e) => setNuevo(e.target.value)} placeholder="Ej.: Seminario II – Grupo A" />
            <button type="submit" className="pro-btn pro-btn--ghost" disabled={creando || !nuevo.trim()}><Plus size={15} /> {creando ? 'Creando…' : 'Crear'}</button>
        </form>
    );
    if (grupos.length === 0) {
        return (
            <section className="pro-card cue">
                <div className="cue-cabeza"><h2><ListChecks size={19} aria-hidden="true" /> Grupos y secciones habilitadas</h2></div>
                <p className="adm-muted">Crea un grupo para decidir qué secciones pueden construir sus estudiantes. Después los asocias desde «Mis estudiantes» o al crearlos.</p>
                {formulario}
            </section>
        );
    }

    const guardadas = actual?.secciones || TODAS;
    const cambio = marcadas.length !== guardadas.length || marcadas.some((id) => !guardadas.includes(id));
    const alternar = (id) => setMarcadas((m) => (m.includes(id) ? m.filter((x) => x !== id) : TODAS.filter((x) => x === id || m.includes(x))));
    // Lo habitual es avanzar en orden: habilitar todo hasta una sección.
    const hasta = (id) => setMarcadas(TODAS.slice(0, TODAS.indexOf(id) + 1));
    const guardar = async () => {
        setGuardando(true);
        try {
            const r = await api.teacher.guardarSecciones(actual.grupo, marcadas.length === TODAS.length ? null : marcadas);
            setGrupos(r.grupos);
            avisar(marcadas.length === TODAS.length
                ? `${actual.grupo ? `El grupo ${actual.grupo}` : 'Tus estudiantes sin grupo'} puede construir todas las secciones.`
                : `${actual.grupo ? `El grupo ${actual.grupo}` : 'Tus estudiantes sin grupo'} puede construir ${marcadas.length} de ${TODAS.length} secciones. Lo verán al volver a entrar o recargar.`);
        } catch (err) { avisar(err.message, 'error'); } finally { setGuardando(false); }
    };

    return (
        <section className="pro-card cue">
            <div className="cue-cabeza">
                <h2><ListChecks size={19} aria-hidden="true" /> Grupos y secciones habilitadas</h2>
            </div>
            {formulario}
            <div className="sec-grupos" role="group" aria-label="Grupo que se configura">
                {grupos.map((g) => (
                    <button key={g.grupo || '—'} type="button" className="sec-chip" aria-pressed={g.grupo === actual.grupo} onClick={() => setGrupo(g.grupo)}>
                        <b>{g.grupo || 'Sin grupo'}</b>
                        <small>{g.estudiantes} {g.estudiantes === 1 ? 'estudiante' : 'estudiantes'} · {g.secciones ? `${g.secciones.length} de ${TODAS.length}` : 'todas'}</small>
                    </button>
                ))}
            </div>
            <p className="adm-muted">
                Marca lo que <b>{actual.grupo ? `el grupo ${actual.grupo}` : 'los estudiantes sin grupo'}</b> puede construir ahora. Las demás secciones les aparecen con candado, para que nadie se adelante. «Mi proyecto» siempre está disponible.
                {actual.estudiantes === 0 && actual.grupo ? <> Este grupo aún no tiene estudiantes: asócialos desde «Mis estudiantes». <button type="button" className="pro-link" onClick={() => eliminar(actual)}><Trash2 size={13} aria-hidden="true" /> Eliminar grupo</button></> : null}
            </p>
            <ol className="sec-lista">
                {SECCIONES_MENU.map((s, i) => {
                    const activa = marcadas.includes(s.id);
                    return (
                        <li key={s.id} data-activa={activa}>
                            <label>
                                <input type="checkbox" checked={activa} onChange={() => alternar(s.id)} />
                                <span className="sec-num">{i + 1}</span>
                                <span className="sec-nombre">{s.label}</span>
                                {activa ? <Unlock size={15} aria-hidden="true" /> : <Lock size={15} aria-hidden="true" />}
                            </label>
                            <button type="button" className="pro-link" onClick={() => hasta(s.id)} title={`Habilitar de Ideación a ${s.label} y bloquear las siguientes`}>Hasta aquí</button>
                        </li>
                    );
                })}
            </ol>
            <div className="sec-pie">
                <small>{marcadas.length === TODAS.length ? 'Todas habilitadas (sin restricción)' : `${marcadas.length} de ${TODAS.length} habilitadas`}{cambio ? ' · cambios sin guardar' : ''}</small>
                <span>
                    <button type="button" className="pro-btn pro-btn--ghost" onClick={() => setMarcadas(TODAS)} disabled={marcadas.length === TODAS.length}>Habilitar todas</button>
                    <button type="button" className="pro-btn pro-btn--primary" onClick={guardar} disabled={!cambio || guardando}>{guardando ? 'Guardando…' : 'Guardar'}</button>
                </span>
            </div>
        </section>
    );
};

export default SeccionesGrupo;
