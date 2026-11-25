import React, { useMemo, useState } from 'react';
import { CheckCircle2, Download, KeyRound, Upload, UserPlus, XCircle } from 'lucide-react';
import { api } from '../services/api';
import Selector from './Selector';
import { avisar } from './Avisos';
import './Cuentas.css';

/*
 * Creación de cuentas. Nadie se registra por su cuenta: el administrador crea usuarios (uno a uno o por lotes)
 * y el profesor crea a sus estudiantes. Cada cuenta nace con una contraseña temporal que se muestra UNA sola vez
 * a quien la crea (además del correo con el enlace, si el servidor tiene correo): la persona debe cambiarla al entrar.
 */

export const ROLES = [
    { id: 'student', nombre: 'Estudiante', nota: 'Crea proyectos solo si su profesor lo permite.' },
    { id: 'teacher', nombre: 'Profesor', nota: 'Crea a sus estudiantes, supervisa sus proyectos y crea los suyos.' },
    { id: 'researcher', nombre: 'Investigador', nota: 'Crea sus propios proyectos.' },
    { id: 'guest', nombre: 'Invitado', nota: 'Solo ve las presentaciones de cada módulo. No tiene proyectos ni usa la IA.' },
];
export const nombreRol = (id) => (id === 'admin' ? 'Administrador' : ROLES.find((r) => r.id === id)?.nombre || id);

// «profesor», «Docente», «teacher»… → id del rol. Vacío = estudiante.
const rolDesdeTexto = (texto) => {
    const t = String(texto || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (!t || /^(estudiante|alumn|student)/.test(t)) return 'student';
    if (/^(profesor|docente|teacher|maestr)/.test(t)) return 'teacher';
    if (/^(investigador|researcher)/.test(t)) return 'researcher';
    if (/^(invitad|guest|visitante|oyente)/.test(t)) return 'guest';
    return '';
};

export const csv = (filas) => filas.map((f) => f.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
export const descargar = (nombre, contenido) => {
    const url = URL.createObjectURL(new Blob([`﻿${contenido}`], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    a.click();
    URL.revokeObjectURL(url);
};

// Cuentas recién creadas con su contraseña temporal. Solo se ve aquí: al cerrar no se puede recuperar.
export const Credenciales = ({ cuentas, mail, onCerrar }) => {
    if (!cuentas?.length) return null;
    const buenas = cuentas.filter((c) => c.ok !== false && !c.actualizada);
    const actualizadas = cuentas.filter((c) => c.actualizada);
    const cambiadas = actualizadas.filter((c) => c.cambios?.length);
    const malas = cuentas.filter((c) => c.ok === false);
    return (
        <section className="cue-credenciales" role="status">
            <h3><KeyRound size={17} aria-hidden="true" /> {buenas.length === 0 && actualizadas.length > 0 ? 'Lista aplicada' : buenas.length === 1 ? 'Cuenta creada' : `${buenas.length} cuentas creadas`}</h3>
            {actualizadas.length > 0 && (
                <p>
                    <b>{cambiadas.length} {cambiadas.length === 1 ? 'cuenta actualizada' : 'cuentas actualizadas'}</b>
                    {cambiadas.length > 0 && <> ({['grupo', 'profesor', 'sin profesor', 'rol'].map((k) => [k, cambiadas.filter((c) => c.cambios.includes(k)).length]).filter(([, n]) => n).map(([k, n]) => `${n} de ${k}`).join(', ')})</>}
                    {actualizadas.length > cambiadas.length && <>; {actualizadas.length - cambiadas.length} ya estaban así y no cambiaron</>}. Sus contraseñas no se tocan.
                </p>
            )}
            {buenas.length > 0 && (
                <>
                    <p>
                        Entrega a cada persona su usuario y su contraseña temporal: al entrar por primera vez tendrá que cambiarla.
                        {mail ? ' También le enviamos un correo con un enlace para crear su contraseña.' : ' El servidor no tiene correo configurado: estas contraseñas son la única forma de entrar.'}
                        {' '}<b>Las contraseñas solo se muestran ahora:</b> cópialas o descárgalas antes de cerrar.
                    </p>
                    <div className="cue-tabla-wrap">
                        <table className="cue-tabla">
                            <thead><tr><th scope="col">Nombre</th><th scope="col">Usuario (correo)</th><th scope="col">Contraseña temporal</th><th scope="col">Correo</th></tr></thead>
                            <tbody>
                                {buenas.map((c) => (
                                    <tr key={c.email}>
                                        <td>{c.name}</td><td>{c.email}</td><td><code>{c.clave}</code></td>
                                        <td>{c.emailSent ? 'Enviado' : 'No enviado'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
            {malas.length > 0 && (
                <div className="cue-malas">
                    <b><XCircle size={15} aria-hidden="true" /> {malas.length === 1 ? 'Una fila no se pudo crear' : `${malas.length} filas no se pudieron crear`}</b>
                    <ul>{malas.map((c, i) => <li key={`${c.email}-${i}`}>{c.name || '(sin nombre)'} · {c.email || '(sin correo)'}: {c.error}</li>)}</ul>
                </div>
            )}
            <div className="cue-acciones">
                {buenas.length > 0 && <button type="button" className="pro-btn pro-btn--ghost" onClick={() => descargar('cuentas-projectsia.csv', csv([['Nombre', 'Usuario', 'Contraseña temporal'], ...buenas.map((c) => [c.name, c.email, c.clave])]))}><Download size={15} /> Descargar la lista</button>}
                <button type="button" className="pro-btn pro-btn--primary" onClick={onCerrar}><CheckCircle2 size={15} /> Ya las guardé</button>
            </div>
        </section>
    );
};

// Lee el texto pegado o el archivo CSV: nombre, correo, rol, (para estudiantes) el correo de su profesor y el grupo.
// Acepta coma, punto y coma o tabulador, con o sin fila de encabezados.
export const leerLote = (texto) => {
    const lineas = String(texto || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (!lineas.length) return [];
    // Separa una línea respetando las comillas ("Pérez, Ana" es una sola celda).
    const partir = (l) => {
        // El separador se decide en cada fila: una lista pegada puede mezclar tabuladores (Excel) y comas o punto y coma.
        const fuera = l.replace(/"[^"]*"/g, '');
        const sep = ['\t', ';', ','].find((x) => fuera.includes(x)) || ',';
        const celdas = [];
        let actual = '';
        let entreComillas = false;
        for (let i = 0; i < l.length; i += 1) {
            const ch = l[i];
            if (ch === '"') {
                if (entreComillas && l[i + 1] === '"') { actual += '"'; i += 1; } else entreComillas = !entreComillas;
            } else if (ch === sep && !entreComillas) { celdas.push(actual.trim()); actual = ''; } else actual += ch;
        }
        celdas.push(actual.trim());
        return celdas.slice(0, 5);
    };
    const filas = lineas.map(partir);
    const conEncabezado = /nombre|name/i.test(filas[0][0] || '') || /correo|email|mail/i.test(filas[0][1] || '');
    return (conEncabezado ? filas.slice(1) : filas).filter((f) => f.some(Boolean)).map(([name = '', email = '', rol = '', teacher = '', group = '']) => {
        const role = rolDesdeTexto(rol);
        const correo = email.trim().toLowerCase();
        const error = !name.trim() ? 'Falta el nombre.' : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo) ? 'El correo no es válido.' : !role ? `No se reconoce el rol «${rol}».` : '';
        return { name: name.trim(), email: correo, role: role || 'student', teacher: role === 'student' ? teacher.trim().toLowerCase() : '', rolDado: Boolean(rol.trim()), group: group.trim().replace(/\s+/g, ' ').slice(0, 60), error };
    });
};

/* ---------- Administrador: crear un usuario o cargar un lote ---------- */

export const CrearCuentas = ({ profesores, grupos = [], onCreadas }) => {
    const [modo, setModo] = useState('uno');
    const [form, setForm] = useState({ name: '', email: '', role: 'student', teacherId: '', grupo: '' });
    const [lote, setLote] = useState('');
    const [grupoLote, setGrupoLote] = useState('');
    const [actualizar, setActualizar] = useState(false); // las cuentas que ya existen se actualizan en vez de dar error // grupo para las filas del lote que no traen el suyo
    const [busy, setBusy] = useState(false);
    const setError = (texto) => avisar(texto, 'error');
    const [creadas, setCreadas] = useState(null); // { cuentas, mail }
    const filas = useMemo(() => leerLote(lote), [lote]);
    const validas = filas.filter((f) => !f.error);
    const repetidos = validas.filter((f, i) => validas.findIndex((x) => x.email === f.email) !== i).length;

    const crearUno = async (event) => {
        event.preventDefault();
        setBusy(true);
        try {
            const r = await api.admin.createUser({ ...form, teacherId: form.role === 'student' ? Number(form.teacherId) || null : null });
            setCreadas({ cuentas: [{ name: r.user.name, email: r.user.email, clave: r.clave, emailSent: r.emailSent }], mail: r.emailSent });
            setForm({ name: '', email: '', role: form.role, teacherId: form.teacherId, grupo: form.grupo });
            onCreadas();
        } catch (err) { setError(err.message); } finally { setBusy(false); }
    };
    const cargarLote = async () => {
        setBusy(true);
        try {
            // Al actualizar, el rol solo viaja si la fila lo trae escrito: una celda vacía no debe volver estudiante a un profesor.
            const r = await api.admin.createBatch(validas.map(({ name, email, role, rolDado, teacher, group }) => ({ name, email, role: actualizar && !rolDado ? '' : role, teacher, group: group || grupoLote.trim() })), { update: actualizar });
            setCreadas({ cuentas: r.resultados, mail: r.mail });
            if (r.creadas || r.actualizadas) { setLote(''); onCreadas(); }
        } catch (err) { setError(err.message); } finally { setBusy(false); }
    };
    const leerArchivo = async (event) => {
        const archivo = event.target.files?.[0];
        event.target.value = '';
        if (!archivo) return;
        if (archivo.size > 500000) { setError('El archivo es muy grande. Usa un CSV de hasta 300 filas.'); return; }
        setLote(await archivo.text());
    };

    return (
        <section className="pro-card cue">
            <div className="cue-cabeza">
                <h2><UserPlus size={19} aria-hidden="true" /> Crear cuentas</h2>
                <div className="pro-modes" role="tablist" aria-label="Cómo crear">
                    <button type="button" role="tab" aria-selected={modo === 'uno'} onClick={() => setModo('uno')}>Un usuario</button>
                    <button type="button" role="tab" aria-selected={modo === 'lote'} onClick={() => setModo('lote')}>Por lotes</button>
                </div>
            </div>
            <p className="adm-muted">Nadie se registra por su cuenta: tú creas a profesores, investigadores y estudiantes, y cada profesor puede crear a los suyos.</p>
            {creadas && <Credenciales cuentas={creadas.cuentas} mail={creadas.mail} onCerrar={() => setCreadas(null)} />}
            <datalist id="cue-grupos">{grupos.map((g) => <option key={g} value={g} />)}</datalist>

            {modo === 'uno' && (
                <form className="cue-form" onSubmit={crearUno}>
                    <label><span>Nombre completo</span><input className="input-field" required maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Ana Pérez Gómez" /></label>
                    <label><span>Correo (será su usuario)</span><input className="input-field" type="email" required maxLength={160} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ana@correo.edu.co" /></label>
                    <div className="cue-campo"><span>Rol</span>
                        <Selector etiqueta="Rol" buscar={false} value={form.role} onChange={(v) => setForm({ ...form, role: v })} opciones={ROLES.map((r) => ({ value: r.id, label: r.nombre }))} />
                    </div>
                    {form.role === 'student' && (
                        <div className="cue-campo"><span>Profesor a cargo</span>
                            <Selector buscar etiqueta="Profesor a cargo" value={form.teacherId} onChange={(v) => setForm({ ...form, teacherId: String(v) })} opciones={[{ value: '', label: 'Sin profesor por ahora' }, ...profesores.map((p) => ({ value: p.id, label: p.name, nota: p.email }))]} />
                        </div>
                    )}
                    <label><span>Grupo o curso (opcional)</span><input className="input-field" maxLength={60} list="cue-grupos" value={form.grupo} onChange={(e) => setForm({ ...form, grupo: e.target.value })} placeholder="Ej: Metodología 2026-2 A" /></label>
                    <p className="cue-nota">{ROLES.find((r) => r.id === form.role).nota}</p>
                    <button type="submit" className="pro-btn pro-btn--primary" disabled={busy}><UserPlus size={15} /> {busy ? 'Creando…' : 'Crear usuario'}</button>
                </form>
            )}

            {modo === 'lote' && (
                <div className="cue-lote">
                    <p>Pega la lista o sube un archivo CSV (también sirve copiar y pegar desde Excel). Una persona por fila, en este orden: <b>nombre, correo, rol, correo del profesor, grupo</b>. El rol puede ser estudiante, profesor, investigador o invitado (vacío = estudiante). El correo del profesor es opcional y solo aplica a estudiantes; el grupo también es opcional. Máximo 300 filas.</p>
                    <div className="cue-acciones">
                        <label className="pro-btn pro-btn--ghost cue-archivo"><Upload size={15} /> Subir archivo CSV<input type="file" accept=".csv,.txt,text/csv,text/plain" onChange={leerArchivo} /></label>
                        <button type="button" className="pro-link" onClick={() => descargar('plantilla-usuarios.csv', csv([['nombre', 'correo', 'rol', 'correo del profesor', 'grupo'], ['Carlos Ruiz', 'carlos.ruiz@correo.edu.co', 'profesor', ''], ['Ana Pérez', 'ana.perez@correo.edu.co', 'estudiante', 'carlos.ruiz@correo.edu.co'], ['Luisa Díaz', 'luisa.diaz@correo.edu.co', 'investigador', '']]))}>Descargar plantilla</button>
                    </div>
                    <label className="cue-grupo-lote"><span>Grupo para todo el lote (opcional)</span><input className="input-field" maxLength={60} list="cue-grupos" value={grupoLote} onChange={(e) => setGrupoLote(e.target.value)} placeholder="Se pone a las filas que no traen grupo" /></label>
                    <label className="cue-check cue-actualizar"><input type="checkbox" checked={actualizar} onChange={(e) => setActualizar(e.target.checked)} /> <span><b>Actualizar las cuentas que ya existen</b> en vez de dar error: se les cambia el rol, el profesor o el grupo que traiga su fila. Lo que la fila deja vacío no se toca, y «ninguno» en la columna del profesor se lo quita. El nombre y la contraseña no cambian.</span></label>
                    <textarea className="textarea-field cue-texto" rows={6} value={lote} onChange={(e) => setLote(e.target.value)} placeholder={'Carlos Ruiz, carlos.ruiz@correo.edu.co, profesor\nAna Pérez, ana.perez@correo.edu.co, estudiante, carlos.ruiz@correo.edu.co'} spellCheck={false} aria-label="Lista de usuarios" />
                    {filas.length > 0 && (
                        <>
                            <p className="cue-resumen">
                                <b>{validas.length}</b> {validas.length === 1 ? 'fila lista' : 'filas listas'} para crear
                                {filas.length - validas.length > 0 && <> · <span className="cue-mal">{filas.length - validas.length} con errores (no se cargan)</span></>}
                                {repetidos > 0 && <> · <span className="cue-mal">{repetidos} con el correo repetido</span></>}
                                {filas.length > 300 && <> · <span className="cue-mal">solo se cargan las primeras 300</span></>}
                            </p>
                            <div className="cue-tabla-wrap">
                                <table className="cue-tabla">
                                    <thead><tr><th scope="col">#</th><th scope="col">Nombre</th><th scope="col">Correo</th><th scope="col">Rol</th><th scope="col">Profesor</th><th scope="col">Grupo</th><th scope="col">Estado</th></tr></thead>
                                    <tbody>
                                        {filas.slice(0, 300).map((f, i) => (
                                            <tr key={i} data-mal={Boolean(f.error) || undefined}>
                                                <td>{i + 1}</td><td>{f.name || '—'}</td><td>{f.email || '—'}</td><td>{nombreRol(f.role)}</td><td>{f.teacher || '—'}</td><td>{f.group || grupoLote.trim() || '—'}</td>
                                                <td>{f.error || 'Lista'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button type="button" className="pro-btn pro-btn--primary" disabled={busy || validas.length === 0} onClick={cargarLote}><Upload size={15} /> {busy ? 'Aplicando…' : actualizar ? `Crear o actualizar ${Math.min(300, validas.length)} ${validas.length === 1 ? 'cuenta' : 'cuentas'}` : `Crear ${Math.min(300, validas.length)} ${validas.length === 1 ? 'cuenta' : 'cuentas'}`}</button>
                        </>
                    )}
                </div>
            )}
        </section>
    );
};
