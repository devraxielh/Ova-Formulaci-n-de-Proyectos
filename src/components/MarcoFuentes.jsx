import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, RotateCcw, Sparkles } from 'lucide-react';
import { groq } from '../services/api';
import { fuentesDeFichas, parrafosVerificados, revisarFuentes } from '../services/marcoFuentes';
import { avisar, confirmar } from './Avisos';

/*
 * Marco apoyado en las fuentes (Antecedentes, Marco teórico y Marco conceptual):
 *  - Integrado: la IA redacta el apartado como un texto continuo usando SOLO lo que dicen las fichas del estudiante;
 *    cada idea lleva su cita y el código descarta cualquier párrafo que cite algo que no esté en las fichas.
 *  - SinFuente: lista las afirmaciones del texto que no citan a nadie, para que el estudiante las apoye o las quite.
 */

const t = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();
const NOMBRE = { antecedentes: 'los antecedentes', teorico: 'el marco teórico', conceptual: 'el marco conceptual' };

const redactar = async ({ apartado, fuentes, proyecto }) => {
    const r = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: `Eres asesor de investigación y redactas ${NOMBRE[apartado]} de un proyecto como un texto académico continuo, en español. REGLAS ESTRICTAS: (1) usa SOLO la información de las FUENTES que se te dan; no agregues datos, cifras, autores ni años que no estén ahí. (2) cada oración que afirme algo de una fuente lleva su cita en formato APA con el autor y el año EXACTOS de esa fuente: narrativa «Autor (año) encontró…» o parentética «… (Autor, año).». (3) relaciona las fuentes entre sí: agrúpalas por lo que tienen en común, contrasta las que difieren y usa conectores; no hagas un párrafo por fuente si varias dicen algo parecido. (4) todas las fuentes se usan al menos una vez. (5) termina con UN párrafo de análisis propio, sin citas, que diga qué aporta este conjunto de fuentes al proyecto y qué vacío deja; ese párrafo va con "propio": true y debe nombrar «la presente investigación». (6) entre 3 y 6 párrafos de 60 a 120 palabras. Respondes solo JSON válido.` },
            { role: 'user', content: `PROYECTO\nTítulo: ${t(proyecto.titulo) || '(sin título)'}\nPregunta: ${t(proyecto.pregunta) || '(sin definir)'}\nProblema: ${t(proyecto.problema) || '(sin definir)'}\n\nFUENTES (las únicas que puedes citar)\n${fuentes.map((f) => `[${f.clave}] ${f.autor} (${f.anio})${f.titulo ? ` — ${f.titulo}` : ''}. ${f.contenido}`).join('\n')}\n\nDevuelve {"parrafos":[{"texto":"…","fuentes":["F1","F2"],"propio":false}]}` },
        ],
        temperature: 0.3,
        max_tokens: 2600,
        response_format: { type: 'json_object' },
    });
    const content = r.choices?.[0]?.message?.content || '';
    const json = JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1));
    return parrafosVerificados(json.parrafos, fuentes);
};

// Redacción integrada de un apartado. `valor` es el texto integrado guardado ('' = se usa el texto por fichas).
export const Integrado = ({ apartado, f, valor, onChange, proyecto }) => {
    const [estado, setEstado] = useState('');
    const fuentes = useMemo(() => fuentesDeFichas(f, apartado), [f, apartado]);
    const generar = async () => {
        if (fuentes.length < 2) { avisar('Necesitas al menos dos fichas completas (con autor) para integrar sus ideas.', 'error'); return; }
        if (t(valor) && !(await confirmar({ texto: '¿Volver a redactar el texto integrado?', detalle: 'Se reemplaza el que tienes, incluidos tus ajustes.', aceptar: 'Redactar de nuevo', peligro: true }))) return;
        setEstado('pensando');
        try {
            let r = await redactar({ apartado, fuentes, proyecto });
            // Si quedó muy poco tras la verificación, se intenta una vez más.
            if (r.aceptados.filter((p) => !p.propio).length < 2) r = await redactar({ apartado, fuentes, proyecto });
            if (r.aceptados.filter((p) => !p.propio).length < 1) throw new Error('vacio');
            onChange(r.aceptados.map((p) => p.texto).join('\n\n'));
            const usadas = new Set(r.aceptados.flatMap((p) => p.fuentes));
            const sinUsar = fuentes.filter((x) => !usadas.has(x.clave));
            avisar(`Texto integrado con ${usadas.size} de tus ${fuentes.length} fuentes.${r.descartados.length ? ` Se descartaron ${r.descartados.length} párrafos porque citaban algo que no está en tus fichas.` : ''}${sinUsar.length ? ` No se usó: ${sinUsar.map((x) => `${x.autor} (${x.anio})`).join('; ')}.` : ''}`);
        } catch (err) {
            // La cuota de IA agotada ya la avisa el cliente del API con su propio mensaje.
            if (err?.code !== 'cuota_ia') avisar('No se pudo redactar con tus fuentes. Inténtalo de nuevo.', 'error');
        } finally {
            setEstado('');
        }
    };
    return (
        <div className="mfu">
            <div className="met-razon">
                <button type="button" className="ide-btn ide-btn--ghost" disabled={estado === 'pensando' || fuentes.length < 2} onClick={generar}>
                    {estado === 'pensando' ? <Loader2 size={15} className="met-gira" /> : <Sparkles size={15} />} {estado === 'pensando' ? 'Integrando tus fuentes…' : t(valor) ? 'Redactar de nuevo con mis fuentes' : 'Redactar integrado con mis fuentes'}
                </button>
                <span>{fuentes.length < 2 ? 'Completa al menos dos fichas con autor: el texto integrado solo usa lo que ellas dicen.' : `Une tus ${fuentes.length} fichas en un texto continuo. Solo usa lo que ellas dicen y cada idea lleva su cita.`}</span>
            </div>
            {t(valor) && (
                <div className="mfu-texto">
                    <label>
                        <span>Texto integrado (es el que va al documento; puedes ajustarlo)</span>
                        <textarea className="textarea-field" rows={10} value={valor} onChange={(e) => onChange(e.target.value)} />
                    </label>
                    <button type="button" className="ide-link" onClick={async () => { if (await confirmar({ texto: '¿Volver al texto por fichas?', detalle: 'Se descarta el texto integrado y el documento usa de nuevo un párrafo por ficha.', aceptar: 'Volver a las fichas', peligro: true })) onChange(''); }}><RotateCcw size={13} /> Volver al texto por fichas</button>
                </div>
            )}
        </div>
    );
};

// Aviso de afirmaciones sin fuente y de citas que no corresponden a ninguna ficha.
export const SinFuente = ({ apartado, f, texto }) => {
    const fuentes = useMemo(() => fuentesDeFichas(f, apartado), [f, apartado]);
    const r = useMemo(() => revisarFuentes(texto, fuentes), [texto, fuentes]);
    if (!t(texto)) return null;
    if (!r.sinFuente.length && !r.ajenas.length) return <p className="mfu-ok"><CheckCircle2 size={15} aria-hidden="true" /> Todas las afirmaciones de este apartado citan una fuente o son análisis propio.</p>;
    return (
        <div className="mfu-avisos" role="status">
            {r.sinFuente.length > 0 && (
                <details open={r.sinFuente.length <= 3}>
                    <summary><AlertTriangle size={15} aria-hidden="true" /> {r.sinFuente.length === 1 ? 'Una afirmación sin fuente' : `${r.sinFuente.length} afirmaciones sin fuente`} <small>de {r.total} oraciones</small></summary>
                    <ul>{r.sinFuente.map((o) => <li key={o}>{o}</li>)}</ul>
                    <p>Apóyalas con una cita (Autor, año), o dilo como análisis tuyo nombrando «la presente investigación».</p>
                </details>
            )}
            {r.ajenas.length > 0 && (
                <details open>
                    <summary><AlertTriangle size={15} aria-hidden="true" /> {r.ajenas.length === 1 ? 'Una cita que no está en tus fichas' : `${r.ajenas.length} citas que no están en tus fichas`}</summary>
                    <ul>{r.ajenas.map((c) => <li key={c.texto}>{c.texto}</li>)}</ul>
                    <p>Revisa que el autor y el año estén bien escritos, o agrega la ficha de esa fuente.</p>
                </details>
            )}
        </div>
    );
};
