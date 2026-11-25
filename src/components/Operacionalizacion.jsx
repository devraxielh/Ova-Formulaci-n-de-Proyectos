import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useProject, useProjectField } from '../context/ProjectContext';
import { groq } from '../services/api';
import { partesObjetivos } from '../services/coherencia';
import { ESCALAS, TIPOS_VARIABLE, filasValidas, normalizarFilas } from '../services/operacionalizacion';
import { avisar, confirmar } from './Avisos';
import './Operacionalizacion.css';

/*
 * Operacionalización de variables (pestaña de Metodología): de cada objetivo específico salen sus variables,
 * dimensiones, indicadores e ítems. Con esta tabla se arma después el instrumento, así cada pregunta mide algo
 * que un objetivo necesita. En un enfoque cualitativo se habla de categorías y preguntas orientadoras.
 */

const uid = () => Math.random().toString(36).slice(2, 9);
const t = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();

const generar = async ({ data, especificos, general, cualitativo }) => {
    const r = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: `Eres asesor metodológico. Operacionalizas ${cualitativo ? 'las categorías de análisis' : 'las variables'} de un proyecto de investigación: de cada objetivo específico sacas ${cualitativo ? 'sus categorías, subcategorías, indicadores observables y una pregunta orientadora abierta' : 'sus variables, dimensiones, indicadores medibles y un ítem de cuestionario'}. Reglas: (1) usa SOLO ${cualitativo ? 'categorías' : 'variables'} que aparezcan en el título, la pregunta o los objetivos, con sus mismas palabras; no inventes otras. (2) cada indicador es observable y concreto, no repite el nombre de la dimensión. (3) cada ítem mide un solo indicador, en lenguaje sencillo, sin inducir la respuesta. (4) entre 2 y 4 indicadores por ${cualitativo ? 'categoría' : 'variable'}; todos los objetivos específicos quedan cubiertos. (5) incluye además 2 o 3 filas de caracterización de los participantes (edad, sexo u otra pertinente) con objetivo 0. Respondes solo JSON válido en español.` },
            { role: 'user', content: `PROYECTO\nTítulo: ${t(data.titulo) || '(sin título)'}\nPregunta: ${t(String(data.pregunta || '').split('\n')[0]) || '(sin definir)'}\nEnfoque: ${t(data.enfoque) || '(sin definir)'}\nObjetivo general: ${general || '(sin definir)'}\nObjetivos específicos:\n${especificos.map((o, i) => `${i + 1}. ${o}`).join('\n')}\n\nDevuelve {"filas":[{"objetivo":número del objetivo específico (0 = caracterización),"variable":"…","tipoVar":"${TIPOS_VARIABLE.join(' | ')}","definicion":"definición conceptual en una frase","dimension":"…","indicador":"…","item":"${cualitativo ? 'pregunta orientadora abierta' : 'afirmación o pregunta del cuestionario'}","escala":"${cualitativo ? 'abierta' : 'likert | opcion | multiple | sino | numero | abierta'}","opciones":["solo si la escala es opcion o multiple"]}]}` },
        ],
        temperature: 0.2,
        max_tokens: 3500,
        response_format: { type: 'json_object' },
    });
    const content = r.choices?.[0]?.message?.content || '';
    const json = JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1));
    const filas = normalizarFilas(json.filas, especificos.length);
    if (!filas.length) throw new Error('vacio');
    return cualitativo ? filas.map((f) => ({ ...f, escala: 'abierta', tipoVar: 'Categoría de análisis' })) : filas;
};

const Operacionalizacion = () => {
    const { data } = useProject();
    const [guardadas, setGuardadas] = useProjectField('operacionalizacion', []);
    const filas = Array.isArray(guardadas) ? guardadas : [];
    const [estado, setEstado] = useState('');
    // Si la tabla ya se llenó sola una vez, no se vuelve a llenar aunque el estudiante la deje vacía a propósito.
    const [yaSugerida, setYaSugerida] = useProjectField('operacionalizacionAuto', false);
    const { general, especificos } = partesObjetivos(data.objetivos);
    const cualitativo = /cualitativ/i.test(String(data.enfoque || ''));
    const nombre = cualitativo ? 'categoría' : 'variable';

    const cambiar = (id, patch) => setGuardadas((prev) => (Array.isArray(prev) ? prev : []).map((f) => (f.id === id ? { ...f, ...patch } : f)));
    const agregar = (base = {}) => setGuardadas((prev) => [...(Array.isArray(prev) ? prev : []), { id: uid(), variable: '', tipoVar: '', definicion: '', dimension: '', indicador: '', item: '', escala: cualitativo ? 'abierta' : 'likert', opciones: [], objetivo: 0, ...base }]);
    const quitar = (id) => setGuardadas((prev) => (Array.isArray(prev) ? prev : []).filter((f) => f.id !== id));

    const conIA = async (sola = false) => {
        if (!especificos.length) { if (!sola) avisar('Primero escribe tus objetivos específicos: la operacionalización sale de ellos.', 'error'); return; }
        if (!sola && filasValidas(filas).length && !(await confirmar({ texto: '¿Reemplazar la tabla actual?', detalle: 'Se cambia por la que salga de tus objetivos. Puedes recuperar la anterior desde el historial de versiones.', aceptar: 'Reemplazar', peligro: true }))) return;
        setEstado('pensando');
        try {
            const nuevas = await generar({ data, especificos, general: general || t(data.objetivoGeneral), cualitativo });
            // Llenado automático: solo si la tabla sigue vacía (nunca se pisa lo que el estudiante haya escrito mientras tanto).
            let puesta = true;
            setGuardadas((prev) => { if (sola && filasValidas(prev).length) { puesta = false; return prev; } return nuevas; });
            setYaSugerida(true);
            if (puesta) avisar(sola ? 'Llenamos la tabla con las variables de tus objetivos. Revísala y ajústala: cada ítem pasará a ser una pregunta de tu instrumento.' : 'Tabla lista. Revísala: cada ítem pasará a ser una pregunta de tu instrumento.');
        } catch (err) {
            if (!sola && err?.code !== 'cuota_ia') avisar('No se pudo generar la tabla. Inténtalo de nuevo.', 'error');
        } finally {
            setEstado('');
        }
    };

    // Al abrir la pestaña por primera vez con la tabla vacía y los objetivos ya escritos, se llena sola.
    const intento = useRef(false);
    useEffect(() => {
        if (intento.current || yaSugerida || filasValidas(filas).length || !especificos.length) return;
        intento.current = true;
        conIA(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [yaSugerida, especificos.length]);

    const sinCubrir = especificos.map((_, i) => i + 1).filter((n) => !filasValidas(filas).some((f) => f.objetivo === n));

    return (
        <div className="ope">
            <div className="met-razon">
                <button type="button" className="ide-btn ide-btn--ghost" disabled={estado === 'pensando'} onClick={() => conIA(false)}>
                    {estado === 'pensando' ? <Loader2 size={15} className="met-gira" /> : <Sparkles size={15} />} {estado === 'pensando' ? 'Leyendo tus objetivos…' : filasValidas(filas).length ? 'Volver a generar desde mis objetivos' : 'Generar desde mis objetivos'}
                </button>
                <span>De cada objetivo salen sus {cualitativo ? 'categorías, subcategorías' : 'variables, dimensiones'}, indicadores e ítems. Con esta tabla se arma el instrumento.</span>
            </div>
            {filas.length === 0 && <p className="ope-vacio">{estado === 'pensando' ? 'Estamos sacando las variables de tus objetivos…' : !especificos.length ? 'Escribe primero tus objetivos específicos: de ellos salen las variables.' : `Todavía no hay filas. Genera la tabla desde tus objetivos o agrega la primera ${nombre} a mano.`}</p>}
            {sinCubrir.length > 0 && filasValidas(filas).length > 0 && <p className="ope-aviso">{sinCubrir.length === 1 ? `El objetivo específico ${sinCubrir[0]} no tiene` : `Los objetivos específicos ${sinCubrir.join(', ')} no tienen`} ninguna {nombre} en la tabla.</p>}
            {filas.length > 0 && (
                <div className="ope-tabla-wrap">
                    <table className="ope-tabla">
                        <thead>
                            <tr>
                                <th scope="col">Objetivo</th>
                                <th scope="col">{cualitativo ? 'Categoría' : 'Variable'}</th>
                                <th scope="col">Definición</th>
                                <th scope="col">{cualitativo ? 'Subcategoría' : 'Dimensión'}</th>
                                <th scope="col">Indicador</th>
                                <th scope="col">{cualitativo ? 'Pregunta orientadora' : 'Ítem'}</th>
                                <th scope="col">Escala</th>
                                <th scope="col"><span className="adm-sr">Acciones</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filas.map((f, i) => {
                                const repetida = i > 0 && t(filas[i - 1].variable).toLowerCase() === t(f.variable).toLowerCase() && t(f.variable);
                                return (
                                    <tr key={f.id} data-grupo={repetida ? undefined : 'inicio'}>
                                        <td>
                                            <select className="input-field" value={f.objetivo || 0} onChange={(e) => cambiar(f.id, { objetivo: Number(e.target.value) })} aria-label={`Objetivo de la fila ${i + 1}`}>
                                                <option value={0}>Caracterización</option>
                                                {especificos.map((o, k) => <option key={o} value={k + 1} title={o}>Específico {k + 1}</option>)}
                                            </select>
                                        </td>
                                        <td>
                                            <textarea className="textarea-field" rows={2} value={f.variable} onChange={(e) => cambiar(f.id, { variable: e.target.value })} placeholder={cualitativo ? 'Categoría' : 'Variable'} aria-label={`${cualitativo ? 'Categoría' : 'Variable'} de la fila ${i + 1}`} />
                                            {!cualitativo && (
                                                <select className="input-field ope-tipo" value={f.tipoVar || ''} onChange={(e) => cambiar(f.id, { tipoVar: e.target.value })} aria-label={`Tipo de variable de la fila ${i + 1}`}>
                                                    <option value="">Tipo…</option>
                                                    {TIPOS_VARIABLE.filter((v) => v !== 'Categoría de análisis').map((v) => <option key={v} value={v}>{v}</option>)}
                                                </select>
                                            )}
                                        </td>
                                        <td><textarea className="textarea-field" rows={3} value={f.definicion} onChange={(e) => cambiar(f.id, { definicion: e.target.value })} placeholder="Qué es, en una frase" aria-label={`Definición de la fila ${i + 1}`} /></td>
                                        <td><textarea className="textarea-field" rows={2} value={f.dimension} onChange={(e) => cambiar(f.id, { dimension: e.target.value })} placeholder={cualitativo ? 'Subcategoría' : 'Dimensión'} aria-label={`${cualitativo ? 'Subcategoría' : 'Dimensión'} de la fila ${i + 1}`} /></td>
                                        <td><textarea className="textarea-field" rows={3} value={f.indicador} onChange={(e) => cambiar(f.id, { indicador: e.target.value })} placeholder="Qué se observa o se mide" aria-label={`Indicador de la fila ${i + 1}`} /></td>
                                        <td><textarea className="textarea-field" rows={3} value={f.item} onChange={(e) => cambiar(f.id, { item: e.target.value })} placeholder={cualitativo ? 'Pregunta abierta para la entrevista' : 'Pregunta o afirmación del cuestionario'} aria-label={`Ítem de la fila ${i + 1}`} /></td>
                                        <td>
                                            <select className="input-field" value={f.escala || 'likert'} onChange={(e) => cambiar(f.id, { escala: e.target.value })} aria-label={`Escala de la fila ${i + 1}`}>
                                                {ESCALAS.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
                                            </select>
                                            {['opcion', 'multiple'].includes(f.escala) && <input className="input-field ope-opciones" value={(f.opciones || []).join('; ')} onChange={(e) => cambiar(f.id, { opciones: e.target.value.split(';').map((o) => o.trimStart()) })} placeholder="Opciones; separadas; así" aria-label={`Opciones de la fila ${i + 1}`} />}
                                        </td>
                                        <td>
                                            <span className="ope-acciones">
                                                <button type="button" onClick={() => agregar({ variable: f.variable, tipoVar: f.tipoVar, definicion: f.definicion, dimension: f.dimension, objetivo: f.objetivo, escala: f.escala })} aria-label={`Agregar otro indicador a ${t(f.variable) || 'esta fila'}`} title="Otro indicador de la misma variable"><Plus size={14} /></button>
                                                <button type="button" onClick={() => quitar(f.id)} aria-label={`Quitar la fila ${i + 1}`} title="Quitar esta fila"><Trash2 size={14} /></button>
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            <button type="button" className="ide-btn ide-btn--ghost obj-add" onClick={() => agregar()}><Plus size={15} /> Agregar {nombre}</button>
            {filasValidas(filas).length > 0 && <p className="ope-nota">Esta tabla sale en los anexos del documento. En la pestaña «Instrumentos» puedes armar el instrumento directamente con estos ítems.</p>}
        </div>
    );
};

export default Operacionalizacion;
