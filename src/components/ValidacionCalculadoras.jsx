import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { cronbach, nivelAlfa, num, resumenAiken, resumenTriangulacion } from '../data/validacion';

/*
 * Calculadoras de validez y confiabilidad. Cada una recibe `value` (datos guardados) y `onChange`.
 */

const Campo = ({ label, children, wide }) => (
    <label className={`calc-campo ${wide ? 'calc-wide' : ''}`}>
        <span>{label}</span>
        {children}
    </label>
);

/* ---------- V de Aiken ---------- */

const EJEMPLO_AIKEN = { expertos: 3, escala: 4, items: [
    { nombre: 'Ítem 1', notas: [4, 4, 3] }, { nombre: 'Ítem 2', notas: [4, 3, 4] }, { nombre: 'Ítem 3', notas: [2, 3, 2] },
] };

export const CalcAiken = ({ value, onChange }) => {
    const d = { expertos: 3, escala: 4, items: [{ nombre: 'Ítem 1', notas: [] }], ...(value || {}) };
    const n = Math.max(1, Math.min(10, Number(d.expertos) || 3));
    const set = (patch) => onChange({ ...d, ...patch });
    const setNota = (i, j, v) => set({ items: d.items.map((it, k) => (k === i ? { ...it, notas: Array.from({ length: n }, (_, x) => (x === j ? v : it.notas?.[x] ?? '')) } : it)) });
    const r = resumenAiken({ ...d, expertos: n });
    return (
        <div className="calc">
            <div className="calc-row">
                <Campo label="Número de expertos">
                    <input className="input-field" type="number" min="1" max="10" value={d.expertos} onChange={(e) => set({ expertos: Number(e.target.value) })} />
                </Campo>
                <Campo label="Escala de calificación">
                    <select className="input-field" value={d.escala} onChange={(e) => set({ escala: Number(e.target.value) })}>
                        <option value={4}>1 a 4</option>
                        <option value={5}>1 a 5</option>
                    </select>
                </Campo>
                <button type="button" className="ide-link" onClick={() => onChange(EJEMPLO_AIKEN)}>Cargar ejemplo</button>
            </div>
            <div className="calc-table-wrap">
                <table className="calc-table">
                    <thead>
                        <tr>
                            <th scope="col">Ítem</th>
                            {Array.from({ length: n }, (_, j) => <th key={j} scope="col">Experto {j + 1}</th>)}
                            <th scope="col">V de Aiken</th>
                            <th scope="col"><span className="sr-only">Quitar</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {d.items.map((it, i) => {
                            const vi = (() => { const notas = (it.notas || []).slice(0, n).map(Number).filter((x) => x >= 1 && x <= d.escala); return notas.length ? notas.reduce((s, x) => s + x - 1, 0) / (notas.length * (d.escala - 1)) : null; })();
                            return (
                                <tr key={i}>
                                    <th scope="row"><input className="input-field calc-name" aria-label={`Nombre del ítem ${i + 1}`} value={it.nombre} onChange={(e) => set({ items: d.items.map((x, k) => (k === i ? { ...x, nombre: e.target.value } : x)) })} /></th>
                                    {Array.from({ length: n }, (_, j) => (
                                        <td key={j}>
                                            <input className="input-field calc-num" type="number" min="1" max={d.escala} aria-label={`Calificación del experto ${j + 1} al ítem ${i + 1}`} value={it.notas?.[j] ?? ''} onChange={(e) => setNota(i, j, e.target.value === '' ? '' : Number(e.target.value))} />
                                        </td>
                                    ))}
                                    <td><b className="calc-v" data-ok={vi === null ? undefined : vi >= 0.8}>{vi === null ? '—' : num(vi)}</b></td>
                                    <td><button type="button" className="obj-remove" aria-label={`Quitar el ítem ${i + 1}`} onClick={() => set({ items: d.items.length > 1 ? d.items.filter((_, k) => k !== i) : d.items })}><Trash2 size={14} /></button></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <button type="button" className="ide-btn ide-btn--ghost" onClick={() => set({ items: [...d.items, { nombre: `Ítem ${d.items.length + 1}`, notas: [] }] })}><Plus size={15} /> Agregar ítem</button>
            {r && (
                <div className="calc-result">
                    <p><b>V promedio: {num(r.promedio)}</b> · {r.conservados.length} de {r.items.length} ítems con V ≥ 0,80 (se conservan).</p>
                    {r.ajustar.length > 0 && <p>Ajustar: {r.ajustar.map((it) => `${it.nombre} (${num(it.v)})`).join(', ')}.</p>}
                </div>
            )}
        </div>
    );
};

/* ---------- Prueba piloto ---------- */

export const CalcPiloto = ({ value, onChange }) => {
    const d = { participantes: '', tiempo: '', confusos: '', cambios: '', ...(value || {}) };
    const set = (patch) => onChange({ ...d, ...patch });
    return (
        <div className="calc">
            <div className="calc-row">
                <Campo label="Participantes de la prueba">
                    <input className="input-field" type="number" min="1" value={d.participantes} onChange={(e) => set({ participantes: e.target.value })} placeholder="Ej: 20" />
                </Campo>
                <Campo label="Tiempo promedio (minutos)">
                    <input className="input-field" type="number" min="1" value={d.tiempo} onChange={(e) => set({ tiempo: e.target.value })} placeholder="Ej: 14" />
                </Campo>
            </div>
            <Campo label="Ítems que resultaron confusos" wide>
                <input className="input-field" value={d.confusos} onChange={(e) => set({ confusos: e.target.value })} placeholder="Ej: los ítems 7 y 12" />
            </Campo>
            <Campo label="Cambios realizados" wide>
                <textarea className="textarea-field" rows={2} value={d.cambios} onChange={(e) => set({ cambios: e.target.value })} placeholder="Ej: se reescribió el ítem 7 y se eliminó el 12 porque repetía el 5" />
            </Campo>
            {Number(d.participantes) > 0 && Number(d.participantes) < 10 && <p className="obj-warn">Con menos de 10 personas la prueba piloto es muy pequeña; lo usual es entre 10 y 30.</p>}
        </div>
    );
};

/* ---------- Alfa de Cronbach ---------- */

const EJEMPLO_ALFA = '4\t5\t4\t3\t4\n3\t4\t4\t3\t3\n5\t5\t4\t4\t5\n2\t3\t2\t2\t3\n4\t4\t5\t3\t4\n3\t3\t3\t2\t3\n5\t4\t5\t4\t4\n2\t2\t3\t2\t2';

export const CalcAlfa = ({ value, onChange }) => {
    const d = { matriz: '', dimension: '', ...(value || {}) };
    const set = (patch) => onChange({ ...d, ...patch });
    const r = d.matriz.trim() ? cronbach(d.matriz) : null;
    return (
        <div className="calc">
            <Campo label="Pega las respuestas desde Excel (una fila por persona, una columna por ítem)" wide>
                <textarea className="textarea-field calc-matriz" rows={7} value={d.matriz} onChange={(e) => set({ matriz: e.target.value })} placeholder={'4\t5\t4\t3\n3\t4\t4\t3\n…'} spellCheck={false} />
            </Campo>
            <div className="calc-row">
                <Campo label="Dimensión (opcional)">
                    <input className="input-field" value={d.dimension} onChange={(e) => set({ dimension: e.target.value })} placeholder="Ej: barreras de acceso" />
                </Campo>
                <button type="button" className="ide-link" onClick={() => set({ matriz: EJEMPLO_ALFA })}>Cargar ejemplo</button>
            </div>
            {r?.error && <p className="obj-warn">{r.error}</p>}
            {r && !r.error && (
                <div className="calc-result">
                    <p className="calc-big">α = <b>{num(r.alfa)}</b> <span data-nivel={nivelAlfa(r.alfa)}>confiabilidad {nivelAlfa(r.alfa)}</span></p>
                    <p>{r.n} personas · {r.k} ítems · suma de varianzas de los ítems = {num(r.sumVar)} · varianza del total = {num(r.varTotal)}</p>
                    <p>α = ({r.k} / {r.k - 1}) · (1 − {num(r.sumVar)} / {num(r.varTotal)}) = {num(r.alfa)}</p>
                    {r.k > 2 && (
                        <div className="calc-table-wrap">
                            <table className="calc-table">
                                <thead><tr><th scope="col">Ítem</th>{r.siElimina.map((x) => <th key={x.item} scope="col">{x.item}</th>)}</tr></thead>
                                <tbody><tr><th scope="row">α si se elimina</th>{r.siElimina.map((x) => <td key={x.item}><b className="calc-v" data-ok={x.alfa === null ? undefined : x.alfa <= r.alfa + 0.02}>{x.alfa === null ? '—' : num(x.alfa)}</b></td>)}</tr></tbody>
                            </table>
                        </div>
                    )}
                    {r.n < 30 && <p className="obj-warn">Con menos de 30 personas el alfa es poco estable; úsalo como referencia.</p>}
                </div>
            )}
        </div>
    );
};

/* ---------- Instrumento ya validado ---------- */

export const CalcValidado = ({ value, onChange, alfaLocalSugerido }) => {
    const d = { nombre: '', autor: '', poblacion: '', alfaOriginal: '', adaptaciones: '', alfaLocal: '', ...(value || {}) };
    const set = (patch) => onChange({ ...d, ...patch });
    const orig = Number(String(d.alfaOriginal).replace(',', '.'));
    const local = Number(String(d.alfaLocal).replace(',', '.'));
    return (
        <div className="calc">
            <div className="calc-row">
                <Campo label="Nombre del instrumento" wide>
                    <input className="input-field" value={d.nombre} onChange={(e) => set({ nombre: e.target.value })} placeholder="Ej: la escala SERVQUAL" />
                </Campo>
            </div>
            <div className="calc-row">
                <Campo label="Autor y año">
                    <input className="input-field" value={d.autor} onChange={(e) => set({ autor: e.target.value })} placeholder="Ej: Parasuraman et al., 1988" />
                </Campo>
                <Campo label="Población de la validación original">
                    <input className="input-field" value={d.poblacion} onChange={(e) => set({ poblacion: e.target.value })} placeholder="Ej: clientes de empresas de servicios" />
                </Campo>
                <Campo label="α original">
                    <input className="input-field" value={d.alfaOriginal} onChange={(e) => set({ alfaOriginal: e.target.value.replace(',', '.') })} placeholder="Ej: 0.88" />
                </Campo>
            </div>
            <Campo label="Adaptaciones realizadas" wide>
                <textarea className="textarea-field" rows={2} value={d.adaptaciones} onChange={(e) => set({ adaptaciones: e.target.value })} placeholder="Ej: se cambió «la empresa» por «el hospital» y tres expertos revisaron el vocabulario" />
            </Campo>
            <div className="calc-row">
                <Campo label="α en tu población (prueba piloto)">
                    <input className="input-field" value={d.alfaLocal} onChange={(e) => set({ alfaLocal: e.target.value.replace(',', '.') })} placeholder="Ej: 0.86" />
                </Campo>
                {alfaLocalSugerido && !d.alfaLocal && <button type="button" className="ide-link" onClick={() => set({ alfaLocal: alfaLocalSugerido.toFixed(2) })}>Usar el α calculado en la pestaña Alfa de Cronbach ({num(alfaLocalSugerido)})</button>}
            </div>
            {(orig > 0 || local > 0) && (
                <div className="calc-result">
                    {orig > 0 && <p>α original: <b>{num(orig)}</b> ({nivelAlfa(orig)})</p>}
                    {local > 0 && <p>α en tu población: <b>{num(local)}</b> ({nivelAlfa(local)}){orig > 0 ? ` · diferencia ${num(local - orig)}` : ''}</p>}
                </div>
            )}
        </div>
    );
};

/* ---------- Triangulación ---------- */

const ESTADOS = [{ v: '', l: '—' }, { v: 'si', l: 'Lo menciona' }, { v: 'no', l: 'No aparece' }, { v: 'difiere', l: 'Difiere' }];
const EJEMPLO_TRI = { fuentes: ['Pacientes', 'Médicos', 'Registros'], categorias: [
    { nombre: 'Barreras de transporte', celdas: { Pacientes: 'si', Médicos: 'si', Registros: 'si' } },
    { nombre: 'Olvido de la cita', celdas: { Pacientes: 'si', Médicos: 'si', Registros: 'no' } },
    { nombre: 'Trato del personal', celdas: { Pacientes: 'si', Médicos: 'difiere', Registros: 'no' } },
] };

export const CalcTriangulacion = ({ value, onChange }) => {
    const d = { fuentes: ['Fuente 1', 'Fuente 2'], categorias: [{ nombre: '', celdas: {} }], ...(value || {}) };
    const set = (patch) => onChange({ ...d, ...patch });
    const r = resumenTriangulacion(d);
    return (
        <div className="calc">
            <div className="calc-row">
                <Campo label="Fuentes o métodos (separados por coma)" wide>
                    <input className="input-field" value={d.fuentes.join(', ')} onChange={(e) => set({ fuentes: e.target.value.split(',').map((x) => x.trim()) })} placeholder="Ej: Pacientes, Médicos, Registros" />
                </Campo>
                <button type="button" className="ide-link" onClick={() => onChange(EJEMPLO_TRI)}>Cargar ejemplo</button>
            </div>
            <div className="calc-table-wrap">
                <table className="calc-table">
                    <thead><tr><th scope="col">Categoría</th>{d.fuentes.filter(Boolean).map((f) => <th key={f} scope="col">{f}</th>)}<th scope="col">Converge</th><th scope="col"><span className="sr-only">Quitar</span></th></tr></thead>
                    <tbody>
                        {d.categorias.map((c, i) => {
                            const e = r?.estado.find((x) => x.nombre === String(c.nombre || '').trim());
                            return (
                                <tr key={i}>
                                    <th scope="row"><input className="input-field calc-name" aria-label={`Categoría ${i + 1}`} value={c.nombre} onChange={(ev) => set({ categorias: d.categorias.map((x, k) => (k === i ? { ...x, nombre: ev.target.value } : x)) })} placeholder="Ej: barreras de transporte" /></th>
                                    {d.fuentes.filter(Boolean).map((f) => (
                                        <td key={f}>
                                            <select className="input-field calc-sel" aria-label={`${c.nombre || 'Categoría'} en ${f}`} value={c.celdas?.[f] || ''} onChange={(ev) => set({ categorias: d.categorias.map((x, k) => (k === i ? { ...x, celdas: { ...(x.celdas || {}), [f]: ev.target.value } } : x)) })}>
                                                {ESTADOS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
                                            </select>
                                        </td>
                                    ))}
                                    <td><b className="calc-v" data-ok={e ? e.converge : undefined}>{e ? (e.converge ? 'Sí' : e.difiere ? 'Difiere' : 'Parcial') : '—'}</b></td>
                                    <td><button type="button" className="obj-remove" aria-label={`Quitar la categoría ${i + 1}`} onClick={() => set({ categorias: d.categorias.length > 1 ? d.categorias.filter((_, k) => k !== i) : d.categorias })}><Trash2 size={14} /></button></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <button type="button" className="ide-btn ide-btn--ghost" onClick={() => set({ categorias: [...d.categorias, { nombre: '', celdas: {} }] })}><Plus size={15} /> Agregar categoría</button>
            {r && (
                <div className="calc-result">
                    <p><b>{r.convergen.length} de {r.estado.length}</b> categorías convergen en todas las fuentes ({Math.round((r.convergen.length / r.estado.length) * 100)} %).</p>
                    {r.difieren.length > 0 && <p>Con diferencias para interpretar en la discusión: {r.difieren.map((x) => x.nombre).join(', ')}.</p>}
                </div>
            )}
        </div>
    );
};

export const CALCULADORAS = {
    'juicio de expertos': CalcAiken,
    'prueba piloto': CalcPiloto,
    'alfa de Cronbach': CalcAlfa,
    'uso de un instrumento ya validado': CalcValidado,
    triangulación: CalcTriangulacion,
};

// El α calculado (si existe) para sugerirlo en «Instrumento ya validado».
export const alfaCalculado = (datos) => {
    const r = datos?.['alfa de Cronbach']?.matriz ? cronbach(datos['alfa de Cronbach'].matriz) : null;
    return r && !r.error ? r.alfa : null;
};
