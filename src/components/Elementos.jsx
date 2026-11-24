import React, { useRef, useState } from 'react';
import { AlertTriangle, Copy, ImagePlus, Loader2, Plus, Table2, Trash2 } from 'lucide-react';
import { useProject, useProjectField } from '../context/ProjectContext';
import { api } from '../services/api';
import { SECCIONES_ELEMENTOS, buildDocument, documentoNumerado, parrafosDe } from '../services/projectDoc';
import './Elementos.css';

/*
 * Figuras y tablas propias del estudiante (data.elementos).
 * Cada una lleva título, nota o fuente y la sección donde va; el documento las numera solo (Tabla 1, Figura 1…).
 */

const uid = () => Math.random().toString(36).slice(2, 9);
const MAX_LADO = 1600;

// Reduce la imagen en el navegador antes de subirla: máximo 1600 px y JPG de buena calidad (PNG si es pequeña).
const prepararImagen = (file) => new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
        const escala = Math.min(1, MAX_LADO / Math.max(img.width, img.height));
        const w = Math.round(img.width * escala);
        const h = Math.round(img.height * escala);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        let dataUrl = file.type === 'image/png' ? canvas.toDataURL('image/png') : '';
        // Tope de ~650 KB por figura: cabe en el límite de subida del servidor sin tocar su configuración.
        for (const q of [0.86, 0.72, 0.58, 0.45]) {
            if (dataUrl && dataUrl.length <= 880000) break;
            dataUrl = canvas.toDataURL('image/jpeg', q);
        }
        const [meta, data] = dataUrl.split(',');
        resolve({ mime: meta.includes('png') ? 'image/png' : 'image/jpeg', data, w, h });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo leer la imagen. Usa un archivo PNG o JPG.')); };
    img.src = url;
});

// Pegar desde Excel o Word: filas separadas por saltos de línea y celdas por tabuladores.
const desdeTexto = (texto) => {
    const filas = String(texto).replace(/\r/g, '').split('\n').filter((l) => l.trim() !== '').map((l) => l.split('\t').map((c) => c.trim()));
    if (filas.length < 2 || filas.every((f) => f.length < 2)) return null;
    const ancho = Math.max(...filas.map((f) => f.length));
    const pad = (f) => [...f, ...Array(ancho - f.length).fill('')];
    return { head: pad(filas[0]), rows: filas.slice(1).map(pad) };
};

const TablaEditor = ({ item, onChange }) => {
    const head = item.head || [];
    const rows = item.rows || [];
    const setHead = (i, v) => onChange({ head: head.map((c, k) => (k === i ? v : c)) });
    const setCell = (r, c, v) => onChange({ rows: rows.map((row, i) => (i === r ? row.map((cell, k) => (k === c ? v : cell)) : row)) });
    const pegar = (event) => {
        const tabla = desdeTexto(event.clipboardData.getData('text/plain'));
        if (!tabla) return;
        event.preventDefault();
        onChange(tabla);
    };
    return (
        <div className="ele-tabla" onPaste={pegar}>
            <div className="ele-tabla-scroll">
                <table>
                    <thead>
                        <tr>
                            {head.map((c, i) => <th key={i}><input value={c} onChange={(e) => setHead(i, e.target.value)} placeholder={`Columna ${i + 1}`} aria-label={`Encabezado de la columna ${i + 1}`} /></th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, r) => (
                            <tr key={r}>
                                {row.map((c, k) => <td key={k}><input value={c} onChange={(e) => setCell(r, k, e.target.value)} aria-label={`Fila ${r + 1}, columna ${k + 1}`} /></td>)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="ele-tabla-acciones">
                <button type="button" className="ide-link" onClick={() => onChange({ rows: [...rows, head.map(() => '')] })}><Plus size={13} /> Fila</button>
                <button type="button" className="ide-link" disabled={head.length >= 8} onClick={() => onChange({ head: [...head, ''], rows: rows.map((row) => [...row, '']) })}><Plus size={13} /> Columna</button>
                {rows.length > 1 && <button type="button" className="ide-link" onClick={() => onChange({ rows: rows.slice(0, -1) })}><Trash2 size={13} /> Última fila</button>}
                {head.length > 2 && <button type="button" className="ide-link" onClick={() => onChange({ head: head.slice(0, -1), rows: rows.map((row) => row.slice(0, -1)) })}><Trash2 size={13} /> Última columna</button>}
                <small>Puedes copiar una tabla de Excel y pegarla aquí.</small>
            </div>
        </div>
    );
};

const Elementos = ({ seccion = 'resultados' }) => {
    const { user, project, data } = useProject();
    const [copiada, setCopiada] = useState('');
    // Número actual de cada tabla o figura en el documento (cambia solo si se reordenan).
    const rotulos = new Map(documentoNumerado(buildDocument(data)).flatMap((s) => s.content).filter((b) => b.elementoId).map((b) => [b.elementoId, b.rotulo]));
    const copiarMarca = async (item) => {
        try { await navigator.clipboard.writeText(`[[${item.id}]]`); setCopiada(item.id); } catch { setCopiada(''); }
    };
    const [elementos, setElementos] = useProjectField('elementos', []);
    const [subiendo, setSubiendo] = useState(false);
    const [error, setError] = useState('');
    const fileRef = useRef(null);
    const lista = Array.isArray(elementos) ? elementos : [];
    const conCuenta = Boolean(user && project.id);

    const cambiar = (id, patch) => setElementos((prev) => (Array.isArray(prev) ? prev : []).map((e) => (e.id === id ? { ...e, ...patch } : e)));
    const quitar = (item) => {
        setElementos((prev) => (Array.isArray(prev) ? prev : []).filter((e) => e.id !== item.id));
        if (item.fileId && project.id) api.deleteFile(project.id, item.fileId).catch(() => {});
    };
    const nuevaTabla = () => setElementos((prev) => [...(Array.isArray(prev) ? prev : []), {
        id: uid(), tipo: 'tabla', seccion, titulo: '', nota: 'Elaboración propia.', head: ['', '', ''], rows: [['', '', ''], ['', '', '']],
    }]);
    const subir = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        setError('');
        setSubiendo(true);
        try {
            const img = await prepararImagen(file);
            const { file: saved } = await api.uploadFile(project.id, { mime: img.mime, data: img.data });
            setElementos((prev) => [...(Array.isArray(prev) ? prev : []), { id: uid(), tipo: 'figura', seccion, titulo: '', nota: 'Elaboración propia.', fileId: saved.id, w: img.w, h: img.h }]);
        } catch (err) {
            setError(err.message || 'No se pudo subir la imagen.');
        } finally {
            setSubiendo(false);
        }
    };

    // Numeración provisional dentro de la lista; el documento numera de corrido con las demás tablas y figuras.
    return (
        <section className="ide-panel ele-panel">
            <h3><Table2 size={18} aria-hidden="true" /> Tablas y figuras</h3>
            <p className="ide-field-hint">Agrega tus tablas y figuras con su título y su nota, y elige después de qué párrafo va cada una. El documento las numera solas, las cita en ese párrafo («ver Tabla 2») y arma la «Lista de tablas» y la «Lista de figuras». Si cambias el orden, los números se actualizan en todo el texto.</p>

            {lista.map((item) => (
                <div className="ele-item" key={item.id}>
                    <div className="ele-item-head">
                        <b>{rotulos.get(item.id) || (item.tipo === 'figura' ? 'Figura' : 'Tabla')}</b>
                        <select className="input-field" value={item.seccion || 'resultados'} onChange={(e) => cambiar(item.id, { seccion: e.target.value })} aria-label="Sección donde va">
                            {SECCIONES_ELEMENTOS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>
                        <button type="button" className="ide-link" onClick={() => quitar(item)}><Trash2 size={13} /> Quitar</button>
                    </div>
                    <input className="input-field" value={item.titulo || ''} onChange={(e) => cambiar(item.id, { titulo: e.target.value })} placeholder={item.tipo === 'figura' ? 'Título: Motivos de inasistencia a las citas' : 'Título: Características de los participantes'} aria-label="Título" />
                    {item.tipo === 'figura'
                        ? (project.id && item.fileId ? <img className="ele-img" src={api.fileUrl(project.id, item.fileId)} alt={item.titulo || 'Figura'} /> : null)
                        : <TablaEditor item={item} onChange={(patch) => cambiar(item.id, patch)} />}
                    {(() => {
                        const parrafos = parrafosDe(data, item.seccion || 'resultados');
                        return (
                            <div className="ele-ubicacion">
                                <label>
                                    <span>Ubicación</span>
                                    <select className="input-field" value={Math.min(Number(item.despues) || 0, parrafos.length)} onChange={(e) => cambiar(item.id, { despues: Number(e.target.value) })}>
                                        <option value={0}>Al final del texto de la sección</option>
                                        {parrafos.map((t, i) => <option key={i} value={i + 1}>Después del párrafo {i + 1}: «{t.replace(/\*/g, '').slice(0, 55)}…»</option>)}
                                    </select>
                                </label>
                                {Number(item.despues) > 0 && (
                                    <label className="ele-check"><input type="checkbox" checked={item.citar !== false} onChange={(e) => cambiar(item.id, { citar: e.target.checked })} /> Citarla sola al final de ese párrafo</label>
                                )}
                                <button type="button" className="ide-link" onClick={() => copiarMarca(item)} title="Pega la marca en cualquier párrafo y el documento escribirá el número actual">
                                    <Copy size={13} /> {copiada === item.id ? `Copiada: pega [[${item.id}]] donde quieras citarla` : 'Copiar marca para citarla en otro párrafo'}
                                </button>
                            </div>
                        );
                    })()}
                    <input className="input-field" value={item.nota || ''} onChange={(e) => cambiar(item.id, { nota: e.target.value })} placeholder="Nota o fuente: Elaboración propia con datos de la encuesta (n = 120)." aria-label="Nota o fuente" />
                </div>
            ))}

            {error && <p className="ide-feedback ide-feedback--bad" role="alert"><AlertTriangle size={16} /><span>{error}</span></p>}
            <div className="ele-acciones">
                <button type="button" className="ide-btn ide-btn--ghost" onClick={nuevaTabla}><Plus size={15} /> Agregar tabla</button>
                <button type="button" className="ide-btn ide-btn--ghost" disabled={!conCuenta || subiendo} onClick={() => fileRef.current?.click()}>
                    {subiendo ? <Loader2 size={15} className="ele-spin" /> : <ImagePlus size={15} />} {subiendo ? 'Subiendo…' : 'Agregar figura (PNG o JPG)'}
                </button>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg" hidden onChange={subir} />
            </div>
            {!conCuenta && <small className="ide-field-hint">Para subir figuras necesitas iniciar sesión; las tablas funcionan sin cuenta.</small>}
        </section>
    );
};

export default Elementos;
