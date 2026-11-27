import React, { useCallback, useEffect, useState } from 'react';
import { ListChecks, Lock, Unlock } from 'lucide-react';
import { api } from '../services/api';
import { SECCIONES_MENU } from '../data/secciones';
import { avisar } from './Avisos';

// El profesor decide qué secciones pueden construir sus estudiantes, grupo por grupo, para que no se adelanten.
// Sin lista guardada, el grupo tiene todas habilitadas.
const TODAS = SECCIONES_MENU.map((s) => s.id);

const SeccionesGrupo = ({ version = 0 }) => {
    const [grupos, setGrupos] = useState(null);
    const [grupo, setGrupo] = useState('');
    const [marcadas, setMarcadas] = useState(TODAS);
    const [guardando, setGuardando] = useState(false);

    const cargar = useCallback(async () => {
        try { setGrupos((await api.teacher.secciones()).grupos); } catch (err) { avisar(err.message, 'error'); setGrupos([]); }
    }, []);
    useEffect(() => { cargar(); }, [cargar, version]);

    // Al cambiar de grupo (o al recargar) se muestra lo que ese grupo tiene guardado.
    const actual = (grupos || []).find((g) => g.grupo === grupo) || (grupos || [])[0];
    useEffect(() => {
        if (!actual) return;
        if (actual.grupo !== grupo) setGrupo(actual.grupo);
        setMarcadas(actual.secciones || TODAS);
    }, [actual, grupo]);

    if (!grupos || grupos.length === 0) return null;

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
                <h2><ListChecks size={19} aria-hidden="true" /> Secciones habilitadas</h2>
                {grupos.length > 1 && (
                    <label className="sec-grupo">
                        <span>Grupo</span>
                        <select className="input-field" value={actual.grupo} onChange={(e) => setGrupo(e.target.value)}>
                            {grupos.map((g) => <option key={g.grupo || '—'} value={g.grupo}>{g.grupo || 'Sin grupo'} ({g.estudiantes})</option>)}
                        </select>
                    </label>
                )}
            </div>
            <p className="adm-muted">
                Marca lo que {grupos.length > 1 ? 'este grupo puede' : 'tus estudiantes pueden'} construir ahora. Las demás secciones les aparecen con candado, para que nadie se adelante. «Mi proyecto» siempre está disponible.
                {grupos.length === 1 && actual.grupo ? <> Grupo: <b>{actual.grupo}</b> ({actual.estudiantes}).</> : null}
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
