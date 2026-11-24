import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, Plus, Save, Trash2, X } from 'lucide-react';
import { CONFIANZAS, MUESTREOS, tamanoMuestra } from '../data/metodologia';
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
// Una ecuación con su título y, debajo, la misma ecuación con los números del estudiante.
const Ecuacion = ({ titulo, children, con, nota }) => (
    <div className="mue-ecuacion">
        <b>{titulo}</b>
        <p className="mue-formula">{children}</p>
        {con && <p className="mue-formula mue-formula--con">{con}</p>}
        {nota && <small>{nota}</small>}
    </div>
);

const MuestreoModal = ({ open, inicial, poblacion, calc, unidad = 'personas', onUsar, onClose }) => {
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
    const Z = Number(calc.Z) || 1.96;
    const e = Number(calc.e) || 0.05;
    const n = tamanoMuestra(calc);
    const conf = CONFIANZAS.find((c) => c.z === Z)?.label || '95 %';
    const k = calc.finita && n > 0 ? Math.max(1, Math.floor(N / n)) : 0;
    const reparto = repartoEstratos(estratos, n);
    const M = Math.round(Number(cong.total) || 0);
    const promedio = Number(cong.promedio) || 0;
    const mCong = M > 0 && promedio > 0 ? Math.min(M, Math.ceil(n / promedio)) : 0;
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

    // Tamaño de la muestra: la misma fórmula de la calculadora, con sus números.
    const tamano = (
        <>
            {calc.finita ? (
                <Ecuacion
                    titulo="Tamaño de la muestra (población finita)"
                    con={<>n = <Frac arriba={`${num(N)} · ${num(Z)}² · 0,5 · 0,5`} abajo={`${num(e)}² · (${num(N)} − 1) + ${num(Z)}² · 0,5 · 0,5`} /> = <strong>{num(n)}</strong></>}
                    nota={`Con tus datos: población de ${num(N)}, confianza del ${conf} y error del ${Math.round(e * 100)} %. Cámbialos en la calculadora de la pestaña.`}
                >
                    n = <Frac arriba="N · Z² · p · q" abajo="e² · (N − 1) + Z² · p · q" />
                </Ecuacion>
            ) : (
                <Ecuacion
                    titulo="Tamaño de la muestra (población infinita o desconocida)"
                    con={<>n = <Frac arriba={`${num(Z)}² · 0,5 · 0,5`} abajo={`${num(e)}²`} /> = <strong>{num(n)}</strong></>}
                    nota={`Con tus datos: confianza del ${conf} y error del ${Math.round(e * 100)} %. Cámbialos en la calculadora de la pestaña.`}
                >
                    n = <Frac arriba="Z² · p · q" abajo="e²" />
                </Ecuacion>
            )}
            <p className="mue-leyenda"><b>N</b> población · <b>n</b> muestra · <b>Z</b> valor de la confianza (1,96 para 95 %) · <b>p</b> y <b>q</b> proporción esperada y su complemento (0,5 cuando no se conoce) · <b>e</b> margen de error</p>
        </>
    );

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
                            <h3>Ecuaciones con tus datos</h3>
                            {m.probabilistico && tamano}

                            {m.id === 'aleatorio simple' && calc.finita && N > 0 && (
                                <Ecuacion titulo="Probabilidad de que una persona sea elegida" con={<>P = <Frac arriba={num(n)} abajo={num(N)} /> = <strong>{num((n / N) * 100)} %</strong></>}>
                                    P = <Frac arriba="n" abajo="N" />
                                </Ecuacion>
                            )}

                            {m.id === 'sistemático' && (calc.finita && N > 0 ? (
                                <Ecuacion
                                    titulo="Intervalo de selección"
                                    con={<>k = <Frac arriba={num(N)} abajo={num(n)} /> ≈ <strong>{k}</strong></>}
                                    nota={`Se sortea un arranque entre 1 y ${k} y se toma un ${unidad} cada ${k} de la lista.`}
                                >
                                    k = <Frac arriba="N" abajo="n" />
                                </Ecuacion>
                            ) : <p className="mue-aviso">Para calcular el intervalo k se necesita conocer el total de la población: en la calculadora elige «Finita» y escribe el total.</p>)}

                            {m.id === 'aleatorio estratificado' && (
                                <>
                                    <Ecuacion titulo="Muestra de cada estrato (afijación proporcional)" nota="Escribe tus estratos y cuántas personas tiene cada uno: la muestra se reparte sola.">
                                        <span>n<sub>h</sub></span> = n · <Frac arriba={<>N<sub>h</sub></>} abajo="N" />
                                    </Ecuacion>
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
                                    {calc.finita && reparto.total > 0 && reparto.total !== N && <p className="mue-aviso">Tus estratos suman {num(reparto.total)}, pero en la calculadora la población es {num(N)}: deja el mismo total en los dos lados.</p>}
                                </>
                            )}

                            {m.id === 'por conglomerados' && (
                                <>
                                    <Ecuacion
                                        titulo="Conglomerados que se sortean"
                                        con={mCong ? <>m = <Frac arriba={num(n)} abajo={num(promedio)} /> ≈ <strong>{mCong}</strong> de {num(M)}</> : null}
                                        nota="Escribe cuántos conglomerados hay y cuántas personas tiene cada uno en promedio."
                                    >
                                        m = <Frac arriba="n" abajo="tamaño promedio del conglomerado" />
                                    </Ecuacion>
                                    <div className="mue-dos">
                                        <label className="mar-campo"><span>Conglomerados en total (M)</span><input className="input-field" type="number" min="0" value={cong.total} onChange={(ev) => { setGuardado(false); setCong({ ...cong, total: ev.target.value }); }} placeholder="Ej: 40 cursos" /></label>
                                        <label className="mar-campo"><span>Personas por conglomerado (promedio)</span><input className="input-field" type="number" min="0" value={cong.promedio} onChange={(ev) => { setGuardado(false); setCong({ ...cong, promedio: ev.target.value }); }} placeholder="Ej: 30" /></label>
                                    </div>
                                </>
                            )}

                            {m.id.startsWith('censo') && (
                                <Ecuacion titulo="Tamaño" con={calc.finita && N > 0 ? <>n = <strong>{num(N)}</strong></> : null} nota="No se calcula muestra ni margen de error: se estudia a todos. Informa la tasa de respuesta.">
                                    n = N
                                </Ecuacion>
                            )}
                            {m.id.startsWith('censo') && (
                                <Ecuacion titulo="Tasa de respuesta">
                                    Tasa = <Frac arriba="personas que respondieron" abajo="N" /> · 100
                                </Ecuacion>
                            )}

                            {!m.probabilistico && !m.id.startsWith('censo') && (
                                <p className="mue-aviso">Este muestreo no usa fórmula: el número de participantes se decide por los criterios del estudio y, en lo cualitativo, por la saturación (cuando un participante más ya no aporta información nueva). Explícalo en «Cómo se eligen los participantes».</p>
                            )}
                        </section>
                    </div>
                </div>
                <footer className="val-foot">
                    <div className="val-foot-left">
                        <button type="button" className="ide-btn ide-btn--primary" onClick={usar}><Save size={16} /> {enUso ? 'Guardar los datos de este muestreo' : 'Usar este muestreo'}</button>
                        {guardado && <span className="val-ok"><CheckCircle2 size={15} /> Guardado: ya está en tu metodología</span>}
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
