import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Check, CheckCircle2, Clock, Layers, ListChecks, Lock, Send } from 'lucide-react';
import { api } from '../services/api';
import { LIKERT } from '../services/instrumentos';
import './EncuestaPublica.css';

/* Formulario público de una encuesta: se abre con /?encuesta=TOKEN, sin cuenta. No guarda quién responde. */

const respondida = (q, valor) => (Array.isArray(valor) ? valor.length > 0 : String(valor ?? '').trim() !== '');

const EncuestaPublica = ({ token }) => {
    const [encuesta, setEncuesta] = useState(null);
    const [abierta, setAbierta] = useState(true);
    const [respuestas, setRespuestas] = useState({});
    const [estado, setEstado] = useState('cargando'); // cargando | lista | enviando | gracias | error
    const [error, setError] = useState('');
    const [faltan, setFaltan] = useState([]); // ids de obligatorias sin responder, tras intentar enviar
    const pagina = useRef(null);

    useEffect(() => {
        api.publicSurvey(token)
            .then((r) => { setEncuesta(r.survey); setAbierta(r.open); setEstado('lista'); })
            .catch((err) => { setError(err.message); setEstado('error'); });
    }, [token]);

    const preguntas = encuesta?.preguntas || [];
    const hechas = preguntas.filter((q) => respondida(q, respuestas[q.id])).length;
    const avance = preguntas.length ? Math.round((hechas / preguntas.length) * 100) : 0;
    const minutos = Math.max(2, Math.round(preguntas.length * 0.5));

    const quitarFalta = (id) => setFaltan((prev) => prev.filter((x) => x !== id));
    const set = (id, valor) => { setRespuestas((prev) => ({ ...prev, [id]: valor })); quitarFalta(id); };
    const marcar = (id, opcion, on) => {
        setRespuestas((prev) => {
            const actual = Array.isArray(prev[id]) ? prev[id] : [];
            return { ...prev, [id]: on ? [...actual, opcion] : actual.filter((o) => o !== opcion) };
        });
        quitarFalta(id);
    };

    const enviar = async (event) => {
        event.preventDefault();
        // Las obligatorias se revisan aquí (no con el aviso del navegador) para llevar a la primera que falta.
        const sinResponder = preguntas.filter((q) => q.obligatoria && !respondida(q, respuestas[q.id])).map((q) => q.id);
        if (sinResponder.length) {
            setFaltan(sinResponder);
            const primera = document.getElementById(`p-${sinResponder[0]}`);
            primera?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            primera?.querySelector('input, textarea')?.focus({ preventScroll: true });
            return;
        }
        setError('');
        setEstado('enviando');
        try {
            await api.answerSurvey(token, respuestas);
            setEstado('gracias');
            pagina.current?.scrollTo({ top: 0 });
        } catch (err) {
            setError(err.message);
            setEstado('lista');
        }
    };

    // Una escala publicada sin opciones propias usa la escala de cinco puntos (como al armar el instrumento).
    const opcionesDe = (q) => (q.tipo === 'sino' ? ['Sí', 'No'] : q.tipo === 'likert' && !(q.opciones || []).length ? LIKERT : q.opciones || []);

    return (
        <div className="encp" ref={pagina}>
            {encuesta && abierta && ['lista', 'enviando'].includes(estado) && preguntas.length > 0 && (
                <div className="encp-avance" role="progressbar" aria-valuemin={0} aria-valuemax={preguntas.length} aria-valuenow={hechas} aria-label="Preguntas respondidas">
                    <div className="encp-avance-barra"><span style={{ width: `${avance}%` }} /></div>
                    <p>{hechas} de {preguntas.length} respondidas</p>
                </div>
            )}

            <main className="encp-main">
                {estado === 'cargando' && (
                    <div className="encp-card encp-estado" role="status">
                        <span className="encp-gira" aria-hidden="true" />
                        <p>Cargando la encuesta…</p>
                    </div>
                )}

                {estado === 'error' && (
                    <div className="encp-card encp-estado" role="alert">
                        <AlertCircle size={40} aria-hidden="true" className="encp-estado-icono encp-estado-icono--mal" />
                        <h1>No se pudo abrir la encuesta</h1>
                        <p>{error || 'Revisa que el enlace esté completo e inténtalo de nuevo.'}</p>
                    </div>
                )}

                {estado === 'gracias' && (
                    <div className="encp-card encp-estado encp-gracias" role="status">
                        <span className="encp-gracias-icono" aria-hidden="true"><Check size={38} strokeWidth={3} /></span>
                        <h1>¡Gracias por participar!</h1>
                        <p>Tu respuesta quedó registrada de forma anónima. Ya puedes cerrar esta página.</p>
                    </div>
                )}

                {encuesta && ['lista', 'enviando'].includes(estado) && (
                    <form onSubmit={enviar} noValidate className="encp-form">
                        <header className="encp-card encp-cabeza">
                            <p className="encp-kicker">Encuesta</p>
                            <h1>{encuesta.titulo}</h1>
                            {encuesta.intro && <p className="encp-intro">{encuesta.intro}</p>}
                            <ul className="encp-datos">
                                <li><ListChecks size={15} aria-hidden="true" /> {preguntas.length} {preguntas.length === 1 ? 'pregunta' : 'preguntas'}</li>
                                <li><Clock size={15} aria-hidden="true" /> Unos {minutos} minutos</li>
                                <li><Lock size={15} aria-hidden="true" /> Anónima</li>
                            </ul>
                            {preguntas.some((q) => q.obligatoria) && <p className="encp-nota"><span aria-hidden="true">*</span> Indica una pregunta obligatoria.</p>}
                        </header>

                        {!abierta && (
                            <div className="encp-card encp-estado" role="status">
                                <Lock size={36} aria-hidden="true" className="encp-estado-icono" />
                                <h2>Esta encuesta ya no recibe respuestas</h2>
                                <p>Gracias por tu interés.</p>
                            </div>
                        )}

                        {abierta && preguntas.map((q, i) => {
                            const valor = respuestas[q.id];
                            const lista = respondida(q, valor);
                            const falta = faltan.includes(q.id);
                            const opciones = opcionesDe(q);
                            const escala = q.tipo === 'likert';
                            return (
                                <fieldset key={q.id} id={`p-${q.id}`} className="encp-card encp-pregunta" data-lista={lista || undefined} data-falta={falta || undefined} aria-invalid={falta || undefined}>
                                    <legend className="sr-only">{i + 1}. {q.texto}</legend>
                                    <div className="encp-pregunta-cabeza" aria-hidden="true">
                                        <span className="encp-numero">{lista ? <Check size={15} strokeWidth={3} /> : i + 1}</span>
                                        <p>{q.texto}{q.obligatoria && <span className="encp-obligatoria">*</span>}</p>
                                    </div>
                                    {q.tipo === 'multiple' && <p className="encp-ayuda">Puedes marcar varias.</p>}

                                    {['likert', 'opcion', 'sino'].includes(q.tipo) && (
                                        <div className={`encp-opciones${escala ? ' encp-opciones--escala' : ''}${q.tipo === 'sino' ? ' encp-opciones--dos' : ''}`} style={escala ? { '--cols': opciones.length } : undefined}>
                                            {opciones.map((o, k) => (
                                                <label key={o} className="encp-opcion">
                                                    <input type="radio" name={q.id} value={o} checked={valor === o} onChange={() => set(q.id, o)} />
                                                    {escala ? <span className="encp-escala-num" aria-hidden="true">{k + 1}</span> : <span className="encp-marca" aria-hidden="true" />}
                                                    <span className="encp-opcion-texto">{o}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                    {q.tipo === 'multiple' && (
                                        <div className="encp-opciones">
                                            {opciones.map((o) => (
                                                <label key={o} className="encp-opcion">
                                                    <input type="checkbox" checked={(valor || []).includes(o)} onChange={(e) => marcar(q.id, o, e.target.checked)} />
                                                    <span className="encp-marca encp-marca--caja" aria-hidden="true"><Check size={13} strokeWidth={3.5} /></span>
                                                    <span className="encp-opcion-texto">{o}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                    {q.tipo === 'numero' && <input className="encp-campo encp-campo--numero" type="number" inputMode="decimal" step="any" value={valor ?? ''} onChange={(e) => set(q.id, e.target.value)} aria-label={q.texto} placeholder="Escribe un número" />}
                                    {q.tipo === 'abierta' && (
                                        <>
                                            <textarea className="encp-campo" rows={4} maxLength={2000} value={valor ?? ''} onChange={(e) => set(q.id, e.target.value)} aria-label={q.texto} placeholder="Escribe tu respuesta" />
                                            <small className="encp-contador">{String(valor ?? '').length} / 2000</small>
                                        </>
                                    )}
                                    {falta && <p className="encp-falta" role="alert"><AlertCircle size={15} aria-hidden="true" /> Responde esta pregunta para poder enviar.</p>}
                                </fieldset>
                            );
                        })}

                        {abierta && (
                            <div className="encp-card encp-enviar">
                                {faltan.length > 0 && <p className="encp-falta" role="alert"><AlertCircle size={15} aria-hidden="true" /> {faltan.length === 1 ? 'Falta 1 pregunta obligatoria.' : `Faltan ${faltan.length} preguntas obligatorias.`}</p>}
                                {error && <p className="encp-falta" role="alert"><AlertCircle size={15} aria-hidden="true" /> {error}</p>}
                                <button type="submit" className="encp-boton" disabled={estado === 'enviando'}>
                                    {estado === 'enviando' ? <span className="encp-gira encp-gira--blanco" aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}
                                    {estado === 'enviando' ? 'Enviando…' : 'Enviar respuestas'}
                                </button>
                                <p className="encp-privacidad"><Lock size={13} aria-hidden="true" /> Tu participación es voluntaria y anónima: no se guarda tu nombre, tu correo ni tu dirección de internet. No escribas datos que te identifiquen en las respuestas abiertas.</p>
                            </div>
                        )}
                    </form>
                )}

                <p className="encp-marca-sitio"><Layers size={13} aria-hidden="true" /> Encuesta creada con PROJECTSIA</p>
            </main>
        </div>
    );
};

export default EncuestaPublica;
