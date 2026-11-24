import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, Plus, Save, Trash2, X } from 'lucide-react';
import { MUESTREOS, tamanoMuestra } from '../data/metodologia';
import { LEYENDA_MUESTRA, ecuacionesMuestreo } from '../data/muestreoEcuaciones';
import { MUESTREO_DETALLE, repartoEstratos } from '../data/muestreo';
import './ValidacionModal.css';
import './MuestreoModal.css';

/*
 * Ventana «Muestreo»: explica cada tipo (qué es, cuándo se usa, pasos, ejemplo) y muestra sus ecuaciones
 * resueltas con los números del estudiante. «Usar este muestreo» guarda la elección y los datos que pide
 * cada tipo (estratos, conglomerados) en la población del proyecto.
 */

const num = (v) => Number(v).toLocaleString('es-CO', { maximumFractionDigits: 2 });

// Fracción dibujada con HTML: numerador sobre denominador.
const Frac = ({ arriba, abajo }) => (
    <span className="mue-frac"><span>{arriba}</span><span>{abajo}</span></span>
);
// Una ecuación como lista de partes (texto o fracción).
const Partes = ({ partes }) => partes.map((parte, i) => (typeof parte === 'string'
    ? <span key={i}>{parte}</span>
    : <Frac key={i} arriba={parte.num} abajo={parte.den} />));
// La ecuación general y, debajo, la misma con los números del estudiante.
const Ecuacion = ({ ec }) => (
    <div className="mue-ecuacion">
        <b>{ec.titulo}</b>
        <p className="mue-formula"><Partes partes={ec.general} /></p>
        {ec.con && <p className="mue-formula mue-formula--con"><Partes partes={ec.con} /></p>}
        {ec.nota && <small>{ec.nota}</small>}
    </div>
);

// `calculadora`: los controles del cálculo de la muestra (población, confianza, error), que viven en la pestaña.
const MuestreoModal = ({ open, inicial, poblacion, calc, unidad = 'persona', calculadora, onUsar, onClose }) => {
    const ref = useRef(null);
    const [actual, setActual] = useState(inicial || MUESTREOS[0].id);
    const [estratos, setEstratos] = useState([]);
    const [cong, setCong] = useState({ total: '', promedio: '' });
    const [guardado, setGuardado] = useState(false);

    useEffect(() => {
        if (!open) return;
        setActual(inicial || MUESTREOS[0].id);
        setEstratos(Array.isArray(poblacion?.estratos) && poblacion.estratos.length ? poblacion.estratos : [{ nombre: '', N: '' }, { nombre: '', N: '' }]);
        setCong({ total: poblacion?.conglomerados?.total ?? '', promedio: poblacion?.conglomerados?.promedio ?? '' });
        setGuardado(false);
        // Solo al abrir: al guardar cambia el muestreo del proyecto y no debe reiniciarse la ventana.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);
    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    const m = MUESTREOS.find((x) => x.id === actual) || MUESTREOS[0];
    const d = MUESTREO_DETALLE[m.id];
    const N = Number(calc.N) || 0;
    const n = tamanoMuestra(calc);
    const reparto = repartoEstratos(estratos, n);
    const M = Math.round(Number(cong.total) || 0);
    const promedio = Number(cong.promedio) || 0;
    const enUso = poblacion?.muestreo === m.id;

    const usar = () => {
        onUsar({
            muestreo: m.id,
            ...(m.id === 'aleatorio estratificado' ? { estratos: reparto.filas.map(({ nombre, N: tam }) => ({ nombre, N: tam })) } : {}),
            ...(m.id === 'por conglomerados' ? { conglomerados: { total: M || '', promedio: promedio || '' } } : {}),
        });
        setGuardado(true);
    };
    const cambiar = (id) => { setActual(id); setGuardado(false); };

    const ecuaciones = ecuacionesMuestreo({ muestreo: m.id, calc, conglomerados: { total: M, promedio }, unidad });

    return createPortal(
        <dialog ref={ref} className="val-modal" aria-labelledby="mue-titulo" onClose={onClose} onClick={(event) => { if (event.target === ref.current) onClose(); }}>
            <div className="val-box">
                <header className="val-head">
                    <div>
                        <p className="val-kicker">Muestreo · {m.probabilistico ? 'probabilístico' : m.id.startsWith('censo') ? 'sin muestra' : 'no probabilístico'}</p>
                        <h2 id="mue-titulo">{m.id.charAt(0).toUpperCase() + m.id.slice(1)}</h2>
                        <p className="val-tipo">{d.idea}</p>
                    </div>
                    <button type="button" className="val-close" onClick={onClose} aria-label="Cerrar"><X size={18} /></button>
                </header>
                <div className="val-tabs" role="tablist" aria-label="Tipos de muestreo">
                    {MUESTREOS.map((x) => (
                        <button key={x.id} type="button" role="tab" aria-selected={x.id === m.id} onClick={() => cambiar(x.id)}>
                            {poblacion?.muestreo === x.id && <CheckCircle2 size={14} aria-hidden="true" />} {x.id}
                        </button>
                    ))}
                </div>
                <div className="val-body">
                    <div className="val-col">
                        <section className="val-intro">
                            <h3>Cuándo se usa</h3>
                            <p>{d.cuando}</p>
                        </section>
                        <section>
                            <h3>Paso a paso</h3>
                            <ol className="val-pasos">{d.pasos.map((p) => <li key={p}>{p}</li>)}</ol>
                        </section>
                        <section className="val-ejemplo">
                            <h3>Ejemplo</h3>
                            <p>{d.ejemplo}</p>
                        </section>
                        <section className="mue-pros">
                            <p><b>Ventaja:</b> {d.ventajas}</p>
                            <p><b>Límite:</b> {d.limites}</p>
                        </section>
                    </div>
                    <div className="val-col">
                        <section className="val-calc">
                            {m.probabilistico && (
                                <>
                                    <h3>Calcula tu muestra</h3>
                                    {calculadora}
                                </>
                            )}
                            <h3>{m.probabilistico ? 'Ecuaciones con tus datos' : 'Cómo se decide el tamaño'}</h3>
                            {ecuaciones.map((ec) => <Ecuacion key={ec.titulo} ec={ec} />)}
                            {m.probabilistico && <p className="mue-leyenda">Donde {LEYENDA_MUESTRA}.</p>}

                            {m.id === 'sistemático' && !(calc.finita && N > 0) && <p className="mue-aviso">Para calcular el intervalo k se necesita conocer el total de la población: arriba elige «Finita» y escribe el total.</p>}

                            {m.id === 'aleatorio estratificado' && (
                                <>
                                    <p className="mue-leyenda">Escribe tus estratos y cuántas personas tiene cada uno: la muestra se reparte sola.</p>
                                    <div className="mue-tabla">
                                        <div className="mue-fila mue-fila--head"><span>Estrato</span><span>Personas (N<sub>h</sub>)</span><span>Muestra (n<sub>h</sub>)</span><span /></div>
                                        {estratos.map((fila, i) => {
                                            const calculada = reparto.filas.find((r) => r.nombre === String(fila.nombre || '').trim() && r.N === Math.round(Number(fila.N) || 0));
                                            return (
                                                <div className="mue-fila" key={i}>
                                                    <input className="input-field" value={fila.nombre} onChange={(ev) => { setGuardado(false); setEstratos(estratos.map((x, j) => (j === i ? { ...x, nombre: ev.target.value } : x))); }} placeholder={`Ej: ${['Jornada mañana', 'Jornada tarde', 'Jornada noche'][i] || 'Otro grupo'}`} aria-label={`Nombre del estrato ${i + 1}`} />
                                                    <input className="input-field" type="number" min="0" value={fila.N} onChange={(ev) => { setGuardado(false); setEstratos(estratos.map((x, j) => (j === i ? { ...x, N: ev.target.value } : x))); }} placeholder="0" aria-label={`Personas del estrato ${i + 1}`} />
                                                    <strong>{calculada ? num(calculada.n) : '—'}</strong>
                                                    {estratos.length > 2 ? <button type="button" className="obj-remove" onClick={() => { setGuardado(false); setEstratos(estratos.filter((_, j) => j !== i)); }} aria-label={`Quitar el estrato ${i + 1}`}><Trash2 size={15} /></button> : <span />}
                                                </div>
                                            );
                                        })}
                                        <div className="mue-fila mue-fila--total"><span>Total</span><span>{num(reparto.total)}</span><span>{num(reparto.filas.reduce((s, r) => s + r.n, 0))}</span><span /></div>
                                    </div>
                                    {estratos.length < 8 && <button type="button" className="ide-link" onClick={() => setEstratos([...estratos, { nombre: '', N: '' }])}><Plus size={13} /> Agregar estrato</button>}
                                    {calc.finita && reparto.total > 0 && reparto.total !== N && <p className="mue-aviso">Tus estratos suman {num(reparto.total)}, pero arriba la población es {num(N)}: deja el mismo total en los dos lados.</p>}
                                </>
                            )}

                            {m.id === 'por conglomerados' && (
                                <div className="mue-dos">
                                    <label className="mar-campo"><span>Conglomerados en total (M)</span><input className="input-field" type="number" min="0" value={cong.total} onChange={(ev) => { setGuardado(false); setCong({ ...cong, total: ev.target.value }); }} placeholder="Ej: 40 cursos" /></label>
                                    <label className="mar-campo"><span>Personas por conglomerado (promedio)</span><input className="input-field" type="number" min="0" value={cong.promedio} onChange={(ev) => { setGuardado(false); setCong({ ...cong, promedio: ev.target.value }); }} placeholder="Ej: 30" /></label>
                                </div>
                            )}

                            {!m.probabilistico && !m.id.startsWith('censo') && (
                                <p className="mue-aviso">Este muestreo no usa fórmula: el número de participantes se decide por los criterios del estudio y, en lo cualitativo, por la saturación (cuando un participante más ya no aporta información nueva). Explícalo en «Cómo se eligen los participantes».</p>
                            )}
                        </section>
                    </div>
                </div>
                <footer className="val-foot">
                    <div className="val-foot-left">
                        <button type="button" className="ide-btn ide-btn--primary" onClick={usar}><Save size={16} /> {enUso ? 'Guardar este muestreo y su cálculo' : 'Elegir este muestreo'}</button>
                        {guardado && <span className="val-ok"><CheckCircle2 size={15} /> Guardado: ya está en tu metodología y sus ecuaciones salen en el documento</span>}
                        {!guardado && enUso && <span className="val-nota">Es el muestreo de tu proyecto</span>}
                    </div>
                    <button type="button" className="ide-btn ide-btn--ghost" onClick={onClose}>Cerrar</button>
                </footer>
            </div>
        </dialog>,
        document.body,
    );
};

export default MuestreoModal;
