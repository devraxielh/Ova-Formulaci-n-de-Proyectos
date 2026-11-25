import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, BarChart3, GitCompareArrows, CheckCircle2, Copy, Download, FileSpreadsheet, ImagePlus, Loader2, Table2, Trash2, Upload } from 'lucide-react';
import { useProject, useProjectField } from '../context/ProjectContext';
import { api } from '../services/api';
import { aCsv, tablaRespuestas } from '../services/instrumentos';
import { aNumero, aTabla, analizar, correlacion, cruzar, fmt, fmtP, fraseDe, fuerza, leerCsv, porGrupo, tablaDe } from '../services/estadistica';
import './Proyecto.css';
import './Instrumentos.css';
import AnalisisCualitativo from './AnalisisCualitativo';
import './Analisis.css';
import { Aviso } from './Avisos';

/*
 * Análisis de datos básico: toma las respuestas de una encuesta en línea o un archivo (Excel o CSV),
 * calcula frecuencias, porcentajes y medidas de resumen, y lleva tablas y gráficos a Resultados.
 * Los datos no se guardan en el proyecto: solo las tablas y figuras que el estudiante agrega.
 */

const uid = () => Math.random().toString(36).slice(2, 9);
// Nombre de la variable para un título: sin signos de pregunta ni punto final.
const limpio = (nombre) => String(nombre).replace(/[¿?]/g, '').replace(/[.:\s]+$/, '').trim();

// Gráfico de barras horizontales en un lienzo (PNG 1200 px de ancho, sobrio y legible al imprimir).
const dibujarBarras = (v) => {
    const items = v.frec.items;
    const W = 1200;
    const alto = 64;
    const top = 30;
    const H = top + items.length * alto + 70;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
    ctx.font = '26px Arial, Helvetica, sans-serif';
    const etiquetas = items.map((x) => (x.valor.length > 34 ? `${x.valor.slice(0, 33)}…` : x.valor));
    const izquierda = Math.min(520, Math.max(...etiquetas.map((e) => ctx.measureText(e).width)) + 40);
    const ancho = W - izquierda - 190;
    const max = Math.max(...items.map((x) => x.pct), 1);
    const tope = Math.min(100, Math.ceil(max / 10) * 10);
    // Rejilla y eje de porcentajes
    ctx.strokeStyle = '#d4d4d8';
    ctx.fillStyle = '#52525b';
    ctx.font = '22px Arial, Helvetica, sans-serif';
    ctx.textAlign = 'center';
    for (let t = 0; t <= tope; t += tope / 5) {
        const x = izquierda + (t / tope) * ancho;
        ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, top + items.length * alto); ctx.stroke();
        ctx.fillText(`${Math.round(t)} %`, x, top + items.length * alto + 32);
    }
    items.forEach((x, i) => {
        const y = top + i * alto + 12;
        ctx.fillStyle = '#18181b';
        ctx.font = '26px Arial, Helvetica, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(etiquetas[i], izquierda - 16, y + 28);
        ctx.fillStyle = '#4f46e5';
        ctx.fillRect(izquierda, y, Math.max(2, (x.pct / tope) * ancho), alto - 24);
        ctx.fillStyle = '#18181b';
        ctx.textAlign = 'left';
        ctx.font = '24px Arial, Helvetica, sans-serif';
        ctx.fillText(`${fmt(x.pct)} % (n = ${x.n})`, izquierda + (x.pct / tope) * ancho + 12, y + 28);
    });
    return canvas;
};

const Variable = ({ v, fuenteNota, onTabla, onGrafico, estado }) => {
    const [copiada, setCopiada] = useState(false);
    const frase = fraseDe(v);
    const copiar = async () => { try { await navigator.clipboard.writeText(frase); setCopiada(true); setTimeout(() => setCopiada(false), 2000); } catch { /* noop */ } };
    const tabla = v.clase === 'texto' ? null : tablaDe(v);
    return (
        <li className="ana-var">
            <header>
                <h3>{v.nombre}</h3>
                <small>{v.clase === 'numerica' ? 'Numérica' : v.clase === 'texto' ? 'Texto libre' : v.multiple ? 'Categórica (varias opciones)' : 'Categórica'} · n = {v.n}{v.perdidos ? ` · ${v.perdidos} sin respuesta` : ''}</small>
            </header>
            {v.clase === 'texto' && (
                <>
                    <p className="adm-muted">Las respuestas abiertas se analizan por categorías (análisis de contenido), no con porcentajes. Algunas respuestas:</p>
                    <ul className="ana-muestras">{v.muestras.map((m, i) => <li key={i}>«{m.slice(0, 160)}»</li>)}</ul>
                </>
            )}
            {tabla && (
                <>
                    <div className="ana-tabla">
                        <table>
                            <thead><tr>{tabla.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
                            <tbody>{tabla.rows.map((r, i) => <tr key={i}>{r.map((c, k) => <td key={k}>{c}</td>)}</tr>)}</tbody>
                        </table>
                    </div>
                    {v.clase === 'categorica' && (
                        <figure className="ana-grafico" aria-label={`Gráfico de barras: ${v.nombre}`}>
                            {v.frec.items.map((x) => (
                                <div key={x.valor} className="ana-grafico-fila">
                                    <span className="ana-grafico-rotulo" title={x.valor}>{x.valor}</span>
                                    <span className="ana-grafico-pista"><i style={{ width: `${Math.max(0.5, x.pct)}%` }} /></span>
                                    <b>{fmt(x.pct)} % <small>(n = {x.n})</small></b>
                                </div>
                            ))}
                        </figure>
                    )}
                    {frase && <p className="ana-frase">{frase} <button type="button" className="pro-link" onClick={copiar}><Copy size={13} /> {copiada ? 'Copiada' : 'Copiar'}</button></p>}
                    <div className="ins-acciones">
                        <button type="button" className="pro-btn pro-btn--ghost" onClick={() => onTabla(v, tabla, fuenteNota)} disabled={estado.tabla}>
                            {estado.tabla ? <CheckCircle2 size={15} /> : <Table2 size={15} />} {estado.tabla ? 'Tabla agregada' : 'Llevar la tabla a mis tablas y figuras'}
                        </button>
                        {v.clase === 'categorica' && (
                            <button type="button" className="pro-btn pro-btn--ghost" onClick={() => onGrafico(v, fuenteNota)} disabled={estado.grafico === 'subiendo' || estado.grafico === 'ok'}>
                                {estado.grafico === 'subiendo' ? <Loader2 size={15} className="ins-spin" /> : estado.grafico === 'ok' ? <CheckCircle2 size={15} /> : <ImagePlus size={15} />} {estado.grafico === 'ok' ? 'Gráfico agregado' : 'Llevar el gráfico a mis tablas y figuras'}
                            </button>
                        )}
                    </div>
                </>
            )}
        </li>
    );
};

// Cruce de dos variables: tabla de contingencia con chi-cuadrado, correlación o comparación de grupos, según su tipo.
const Cruce = ({ tabla, variables, nota, onAgregar }) => {
    const utiles = variables.map((v, i) => ({ ...v, i })).filter((v) => v.clase !== 'texto' && v.n >= 3);
    const [a, setA] = useState('');
    const [b, setB] = useState('');
    const [hecho, setHecho] = useState(false);
    useEffect(() => { setHecho(false); }, [a, b]);
    const va = utiles.find((v) => String(v.i) === a);
    const vb = utiles.find((v) => String(v.i) === b);
    // Valores de una columna; las escalas Likert se pueden tratar como puntaje (1 = primera opción).
    const columna = (v) => tabla.filas.map((f) => f[v.i]);
    const puntajes = (v) => {
        const col = tabla.columnas[v.i];
        return col.tipo === 'likert' && col.opciones.length ? columna(v).map((x) => { const k = col.opciones.indexOf(String(x)); return k >= 0 ? k + 1 : ''; }) : columna(v);
    };
    // También cuenta como escala una variable codificada con números (p. ej. satisfacción de 1 a 5 en un Excel).
    const esEscala = (v) => v.clase === 'numerica' || tabla.columnas[v.i].tipo === 'likert'
        || (v.clase === 'categorica' && !tabla.columnas[v.i].tipo && v.frec.items.length >= 3 && v.frec.items.every((x) => Number.isFinite(aNumero(x.valor))));
    const nombre = (v) => v.nombre.replace(/[¿?]/g, '').replace(/[.:\s]+$/, '');

    let resultado = null;
    if (va && vb && va.i !== vb.i) {
        if (esEscala(va) && esEscala(vb)) {
            const c = correlacion(puntajes(va), puntajes(vb));
            if (c) {
                const sig = c.pRho < 0.05;
                resultado = {
                    tipo: 'Correlación',
                    titulo: `Correlación entre ${nombre(va)} y ${nombre(vb)}`,
                    head: ['Coeficiente', 'Valor', 'p', 'n'],
                    rows: [['Spearman (rho)', fmt(c.rho, 3), fmtP(c.pRho).replace('= ', ''), String(c.n)], ['Pearson (r)', fmt(c.r, 3), fmtP(c.pR).replace('= ', ''), String(c.n)]],
                    frase: `${sig ? 'Se encontró' : 'No se encontró'} una correlación estadísticamente significativa entre las dos variables (rho = ${fmt(c.rho, 3)}, p ${fmtP(c.pRho)}, n = ${c.n})${sig ? `; la relación es ${c.rho > 0 ? 'directa' : 'inversa'} y ${fuerza(c.rho)}` : ''}.`,
                    avisos: [c.n < 30 ? 'Con menos de 30 casos la correlación es poco estable.' : '', 'Usa Spearman con escalas tipo Likert o datos sin distribución normal; Pearson, con medidas continuas. Correlación no implica causa.'].filter(Boolean),
                };
            }
        } else if (!esEscala(va) || !esEscala(vb)) {
            const catA = va.clase === 'categorica';
            const catB = vb.clase === 'categorica';
            if (catA && catB && !(esEscala(va) && esEscala(vb))) {
                const c = cruzar(columna(va), columna(vb));
                if (c.gl > 0 && c.filas.length <= 8 && c.cols.length <= 8) {
                    const sig = c.p < 0.05;
                    resultado = {
                        tipo: 'Tabla cruzada',
                        titulo: `${nombre(va)} según ${nombre(vb)}`,
                        head: [nombre(va).slice(0, 40), ...c.cols, 'Total'],
                        rows: [...c.filas.map((f, i) => [f, ...c.obs[i].map((o, j) => `${o} (${fmt(c.totC[j] ? (o / c.totC[j]) * 100 : 0)} %)`), String(c.totF[i])]), ['Total', ...c.totC.map(String), String(c.n)]],
                        frase: `${sig ? 'Se encontró' : 'No se encontró'} una asociación estadísticamente significativa entre las dos variables, χ²(${c.gl}, N = ${c.n}) = ${fmt(c.chi, 2)}, p ${fmtP(c.p)}${sig ? `; la asociación es ${fuerza(c.v)} (V de Cramér = ${fmt(c.v, 2)})` : ''}.`,
                        nota: `Los porcentajes son por columna. χ²(${c.gl}) = ${fmt(c.chi, 2)}, p ${fmtP(c.p)}, V de Cramér = ${fmt(c.v, 2)}.`,
                        avisos: [c.bajas / c.celdas > 0.2 ? `${c.bajas} de ${c.celdas} casillas tienen frecuencia esperada menor que 5: el chi-cuadrado no es confiable. Agrupa categorías o consigue más casos.` : ''].filter(Boolean),
                    };
                } else if (c.gl > 0) {
                    resultado = { error: 'Alguna de las variables tiene más de 8 categorías: agrúpalas antes de cruzarlas.' };
                }
            } else {
                const [grupo, medida] = catA && !esEscala(va) ? [va, vb] : [vb, va];
                const g = porGrupo(columna(grupo), puntajes(medida)).filter((x) => x.n > 0);
                if (g.length >= 2 && g.length <= 10) {
                    const orden = [...g].sort((x, y) => y.media - x.media);
                    resultado = {
                        tipo: 'Comparación de grupos',
                        titulo: `${nombre(medida)} según ${nombre(grupo)}`,
                        head: [nombre(grupo).slice(0, 40), 'n', 'Media', 'Desviación estándar', 'Mediana'],
                        rows: g.map((x) => [x.nombre, String(x.n), fmt(x.media, 2), fmt(x.de, 2), fmt(x.mediana, 2)]),
                        frase: `La media más alta se observó en «${orden[0].nombre}» (M = ${fmt(orden[0].media, 2)}, DE = ${fmt(orden[0].de, 2)}) y la más baja en «${orden.at(-1).nombre}» (M = ${fmt(orden.at(-1).media, 2)}, DE = ${fmt(orden.at(-1).de, 2)}).`,
                        avisos: ['Esta tabla describe la diferencia entre grupos; para afirmar que es estadísticamente significativa se necesita una prueba como t de Student, ANOVA o Kruskal-Wallis.'],
                    };
                }
            }
        }
    }

    return (
        <section className="pro-card">
            <h2><GitCompareArrows size={20} aria-hidden="true" /> Cruzar dos variables</h2>
            <p className="adm-muted">Para objetivos que relacionan o comparan: dos categóricas dan una tabla cruzada con chi-cuadrado; dos numéricas o de escala, una correlación; una de cada tipo, las medias por grupo.</p>
            <div className="ana-cruce">
                <select className="input-field" value={a} onChange={(e) => setA(e.target.value)} aria-label="Primera variable">
                    <option value="">Primera variable…</option>
                    {utiles.map((v) => <option key={v.i} value={v.i}>{v.nombre.slice(0, 70)}</option>)}
                </select>
                <span>con</span>
                <select className="input-field" value={b} onChange={(e) => setB(e.target.value)} aria-label="Segunda variable">
                    <option value="">Segunda variable…</option>
                    {utiles.filter((v) => String(v.i) !== a).map((v) => <option key={v.i} value={v.i}>{v.nombre.slice(0, 70)}</option>)}
                </select>
            </div>
            {va && vb && !resultado && <p className="pro-warn">Estas dos variables no se pueden cruzar con los datos disponibles (muy pocos casos o una sola categoría).</p>}
            {resultado?.error && <p className="pro-warn">{resultado.error}</p>}
            {resultado && !resultado.error && (
                <div className="ana-var">
                    <header><h3>{resultado.titulo}</h3><small>{resultado.tipo}</small></header>
                    <div className="ana-tabla" style={{ gridTemplateColumns: '1fr' }}>
                        <table>
                            <thead><tr>{resultado.head.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
                            <tbody>{resultado.rows.map((r, i) => <tr key={i}>{r.map((c, k) => <td key={k}>{c}</td>)}</tr>)}</tbody>
                        </table>
                    </div>
                    <p className="ana-frase">{resultado.frase}</p>
                    {resultado.avisos.map((t) => <p key={t} className="pro-warn">{t}</p>)}
                    <div className="ins-acciones">
                        <button type="button" className="pro-btn pro-btn--ghost" disabled={hecho} onClick={() => { onAgregar({ tipo: 'tabla', titulo: resultado.titulo, nota: `${resultado.nota ? `${resultado.nota} ` : ''}${nota}`, head: resultado.head, rows: resultado.rows }); setHecho(true); }}>
                            {hecho ? <CheckCircle2 size={15} /> : <Table2 size={15} />} {hecho ? 'Tabla agregada' : 'Llevar la tabla a mis tablas y figuras'}
                        </button>
                        <button type="button" className="pro-link" onClick={() => navigator.clipboard?.writeText(resultado.frase)}><Copy size={13} /> Copiar la frase</button>
                    </div>
                </div>
            )}
        </section>
    );
};

const AnalisisDatos = ({ onNavigate, embebido = false }) => {
    const marco = embebido ? 'ins-page ana-embebido' : 'pro-page ins-page';
    const { data, project } = useProject();
    const [, setElementos] = useProjectField('elementos', []);
    const instrumentos = (Array.isArray(data.instrumentosGen) ? data.instrumentosGen : []);
    const [publicadas, setPublicadas] = useState([]);
    const [fuente, setFuente] = useState(null); // { nombre, tabla: { columnas, filas }, nota, instrumentId }
    const [estado, setEstado] = useState('');
    const [error, setError] = useState('');
    const [hechos, setHechos] = useState({});
    const [confirmar, setConfirmar] = useState(false);
    const fileRef = useRef(null);
    const [modo, setModo] = useState(() => { try { return window.sessionStorage.getItem('projectsia:analisis:modo') || 'cuanti'; } catch { return 'cuanti'; } });
    const cambiarModo = (m) => { setModo(m); try { window.sessionStorage.setItem('projectsia:analisis:modo', m); } catch { /* noop */ } };

    const abrirEncuesta = useCallback(async (instrumentId) => {
        setError('');
        setEstado('cargando');
        try {
            const r = await api.surveyResponses(project.id, instrumentId);
            const ins = instrumentos.find((i) => i.id === instrumentId);
            setFuente({ nombre: r.definition.titulo, tabla: tablaRespuestas(r.definition, r.responses), nota: `Encuesta aplicada${ins?.aplicaA ? ` a ${ins.aplicaA}` : ''} (n = ${r.responses.length}).`, instrumentId });
            setHechos({});
        } catch (err) {
            setError(err.message);
        } finally {
            setEstado('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project.id]);

    useEffect(() => {
        if (!project.id) return;
        api.surveys(project.id).then(({ surveys }) => {
            setPublicadas(surveys);
            // Si se llegó desde «Analizar respuestas» de un instrumento, se abre de una vez.
            let pedida = '';
            try { pedida = window.sessionStorage.getItem('projectsia:analisis:fuente') || ''; window.sessionStorage.removeItem('projectsia:analisis:fuente'); } catch { /* noop */ }
            if (pedida && surveys.some((s) => s.instrumentId === pedida)) { abrirEncuesta(pedida); return; }
            // Si ya hay un instrumento aplicado en línea, sus resultados se muestran de una vez (el de más respuestas).
            const conDatos = surveys.filter((s) => s.count > 0).sort((a, b) => b.count - a.count)[0];
            if (conDatos) abrirEncuesta(conDatos.instrumentId);
        }).catch(() => {});
    }, [project.id, abrirEncuesta]);

    const subir = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        setError('');
        setEstado('cargando');
        try {
            let filas;
            if (/\.xlsx$/i.test(file.name)) {
                const { readSheet } = await import('read-excel-file/browser');
                filas = (await readSheet(file)).map((f) => f.map((c) => (c instanceof Date ? c.toLocaleDateString('es-CO') : c ?? '')));
            } else if (/\.(csv|txt|tsv)$/i.test(file.name)) {
                filas = leerCsv(await file.text());
            } else {
                throw new Error('Usa un archivo de Excel (.xlsx) o CSV. Si tienes un .xls antiguo, ábrelo y guárdalo como .xlsx.');
            }
            if (filas.length < 2) throw new Error('El archivo necesita una fila de encabezados y al menos una fila de datos.');
            if (filas.length > 5001 || (filas[0] || []).length > 120) throw new Error('El archivo es muy grande: el máximo es de 5.000 filas y 120 columnas.');
            const tabla = aTabla(filas);
            setFuente({ nombre: file.name, tabla, nota: `Elaboración propia con datos del estudio (n = ${tabla.filas.length}).` });
            setHechos({});
        } catch (err) {
            setError(err.message || 'No se pudo leer el archivo.');
        } finally {
            setEstado('');
        }
    };

    const variables = useMemo(() => (fuente ? analizar(fuente.tabla) : []), [fuente]);
    const agregar = (elemento) => setElementos((prev) => [...(Array.isArray(prev) ? prev : []), { id: uid(), seccion: 'resultados', ...elemento }]);
    const onTabla = (v, tabla, nota) => {
        agregar({ tipo: 'tabla', titulo: v.clase === 'numerica' ? `Medidas de resumen: ${limpio(v.nombre)}` : `Distribución de respuestas: ${limpio(v.nombre)}`, nota, head: tabla.head, rows: tabla.rows });
        setHechos((p) => ({ ...p, [v.nombre]: { ...p[v.nombre], tabla: true } }));
    };
    const onGrafico = async (v, nota) => {
        setError('');
        setHechos((p) => ({ ...p, [v.nombre]: { ...p[v.nombre], grafico: 'subiendo' } }));
        try {
            const canvas = dibujarBarras(v);
            const dataUrl = canvas.toDataURL('image/png');
            const { file } = await api.uploadFile(project.id, { mime: 'image/png', data: dataUrl.split(',')[1] });
            agregar({ tipo: 'figura', titulo: `Distribución porcentual: ${limpio(v.nombre)}`, nota, fileId: file.id, w: canvas.width, h: canvas.height });
            setHechos((p) => ({ ...p, [v.nombre]: { ...p[v.nombre], grafico: 'ok' } }));
        } catch (err) {
            setError(err.message || 'No se pudo subir el gráfico.');
            setHechos((p) => ({ ...p, [v.nombre]: { ...p[v.nombre], grafico: '' } }));
        }
    };
    const descargar = () => {
        const blob = new Blob(['﻿', aCsv(fuente.tabla.columnas.map((c) => c.nombre), fuente.tabla.filas)], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${fuente.nombre.replace(/[^\p{L}\p{N} _-]/gu, '').trim() || 'respuestas'}.csv`;
        document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    };
    const borrarRespuestas = async () => {
        try { await api.clearSurveyResponses(project.id, fuente.instrumentId); setConfirmar(false); abrirEncuesta(fuente.instrumentId); setPublicadas((p) => p.map((s) => (s.instrumentId === fuente.instrumentId ? { ...s, count: 0 } : s))); } catch (err) { setError(err.message); }
    };

    const selector = (
        <div className="ana-modo" role="tablist" aria-label="Tipo de análisis">
            <button type="button" role="tab" aria-selected={modo === 'cuanti'} onClick={() => cambiarModo('cuanti')}>Encuestas y datos numéricos</button>
            <button type="button" role="tab" aria-selected={modo === 'cuali'} onClick={() => cambiarModo('cuali')}>Entrevistas (cualitativo)</button>
        </div>
    );
    if (modo === 'cuali') return <div className={marco}>{selector}<AnalisisCualitativo onNavigate={onNavigate} embebido={embebido} /></div>;

    return (
        <div className={marco}>
            {selector}
            <section className="pro-card">
                <h2><FileSpreadsheet size={20} aria-hidden="true" /> ¿De dónde vienen tus datos?</h2>
                <div className="ana-fuentes">
                    {publicadas.map((s) => {
                        const ins = instrumentos.find((i) => i.id === s.instrumentId);
                        return (
                            <button key={s.instrumentId} type="button" className="ana-fuente" data-activa={fuente?.instrumentId === s.instrumentId} onClick={() => abrirEncuesta(s.instrumentId)}>
                                <b>{ins?.titulo || 'Encuesta en línea'}</b>
                                <small>{s.count} {s.count === 1 ? 'respuesta' : 'respuestas'} en línea</small>
                            </button>
                        );
                    })}
                    <button type="button" className="ana-fuente" onClick={() => fileRef.current?.click()}>
                        <b><Upload size={15} aria-hidden="true" /> Subir un archivo</b>
                        <small>Excel (.xlsx) o CSV: una fila por participante y una columna por pregunta</small>
                    </button>
                    <input ref={fileRef} type="file" accept=".xlsx,.csv,.tsv,.txt" hidden onChange={subir} />
                </div>
                {publicadas.length === 0 && <p className="adm-muted">¿Aún no tienes datos? En <button type="button" className="pro-link" onClick={() => onNavigate('instrumentos')}>Instrumentos</button> puedes crear tu encuesta y aplicarla en línea.</p>}
                <p className="adm-muted">El archivo se analiza en tu navegador y no se guarda en la plataforma: solo quedan las tablas y los gráficos que lleves a Resultados. Quita antes los nombres, cédulas o teléfonos de los participantes.</p>
                {estado === 'cargando' && <p role="status"><Loader2 size={15} className="ins-spin" /> Leyendo los datos…</p>}
                <Aviso texto={error} tipo="error" />
            </section>

            {fuente && fuente.tabla.filas.length >= 5 && <Cruce tabla={fuente.tabla} variables={variables} nota={fuente.nota} onAgregar={agregar} />}

            {fuente && (
                <section className="pro-card">
                    <div className="ana-head">
                        <div>
                            <h2><BarChart3 size={20} aria-hidden="true" /> {fuente.nombre}</h2>
                            <p className="adm-muted">{fuente.tabla.filas.length} participantes · {fuente.tabla.columnas.length} variables</p>
                        </div>
                        <div className="ins-acciones">
                            <button type="button" className="pro-btn pro-btn--ghost" onClick={descargar}><Download size={15} /> Descargar datos (CSV)</button>
                            {fuente.instrumentId && fuente.tabla.filas.length > 0 && (confirmar
                                ? <><button type="button" className="pro-btn pro-btn--danger" onClick={borrarRespuestas}>Sí, borrar las {fuente.tabla.filas.length} respuestas</button><button type="button" className="pro-btn pro-btn--ghost" onClick={() => setConfirmar(false)}>Cancelar</button></>
                                : <button type="button" className="pro-link pro-link--danger" onClick={() => setConfirmar(true)}><Trash2 size={14} /> Borrar respuestas</button>)}
                            {!embebido && <button type="button" className="pro-btn pro-btn--primary" onClick={() => onNavigate('resultados')}>Ir a Resultados</button>}
                        </div>
                    </div>
                    {fuente.tabla.filas.length === 0
                        ? <p className="adm-muted">Todavía no hay respuestas. Comparte el enlace de la encuesta y vuelve cuando lleguen.</p>
                        : (
                            <>
                                {fuente.tabla.filas.length < 30 && <p className="pro-warn">Con menos de 30 participantes los porcentajes cambian mucho con cada respuesta: interprétalos con cautela y revisa el tamaño de muestra de tu Metodología.</p>}
                                <ul className="ana-vars">
                                    {variables.map((v) => <Variable key={v.nombre} v={v} fuenteNota={fuente.nota} onTabla={onTabla} onGrafico={onGrafico} estado={hechos[v.nombre] || {}} />)}
                                </ul>
                            </>
                        )}
                </section>
            )}
        </div>
    );
};

export default AnalisisDatos;
