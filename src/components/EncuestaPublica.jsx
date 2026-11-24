import React, { useEffect, useState } from 'react';
import { CheckCircle2, Layers } from 'lucide-react';
import { api } from '../services/api';
import './Proyecto.css';
import './Instrumentos.css';

/* Formulario público de una encuesta: se abre con /?encuesta=TOKEN, sin cuenta. No guarda quién responde. */

const EncuestaPublica = ({ token }) => {
    const [encuesta, setEncuesta] = useState(null);
    const [abierta, setAbierta] = useState(true);
    const [respuestas, setRespuestas] = useState({});
    const [estado, setEstado] = useState('cargando'); // cargando | lista | enviando | gracias | error
    const [error, setError] = useState('');

    useEffect(() => {
        api.publicSurvey(token)
            .then((r) => { setEncuesta(r.survey); setAbierta(r.open); setEstado('lista'); })
            .catch((err) => { setError(err.message); setEstado('error'); });
    }, [token]);

    const set = (id, valor) => setRespuestas((prev) => ({ ...prev, [id]: valor }));
    const marcar = (id, opcion, on) => setRespuestas((prev) => {
        const actual = Array.isArray(prev[id]) ? prev[id] : [];
        return { ...prev, [id]: on ? [...actual, opcion] : actual.filter((o) => o !== opcion) };
    });
    const enviar = async (event) => {
        event.preventDefault();
        setError('');
        setEstado('enviando');
        try {
            await api.answerSurvey(token, respuestas);
            setEstado('gracias');
        } catch (err) {
            setError(err.message);
            setEstado('lista');
        }
    };

    return (
        <div className="enc-page">
            <div className="enc-card">
                {estado === 'cargando' && <p className="enc-intro" role="status">Cargando la encuesta…</p>}
                {estado === 'error' && <p className="pro-alert" role="alert">{error}</p>}
                {estado === 'gracias' && (
                    <div className="enc-gracias" role="status">
                        <CheckCircle2 size={44} aria-hidden="true" />
                        <h1>¡Gracias por participar!</h1>
                        <p>Tu respuesta quedó registrada de forma anónima. Ya puedes cerrar esta página.</p>
                    </div>
                )}
                {encuesta && ['lista', 'enviando'].includes(estado) && (
                    <form onSubmit={enviar} style={{ display: 'grid', gap: '1.25rem' }}>
                        <h1>{encuesta.titulo}</h1>
                        {encuesta.intro && <p className="enc-intro">{encuesta.intro}</p>}
                        {!abierta && <p className="pro-warn" role="status">Esta encuesta ya no recibe respuestas.</p>}
                        {abierta && encuesta.preguntas.map((q, i) => {
                            const opciones = q.tipo === 'sino' ? ['Sí', 'No'] : q.opciones;
                            return (
                                <fieldset className="enc-pregunta" key={q.id}>
                                    <legend>{i + 1}. {q.texto} {q.obligatoria && <small aria-label="obligatoria">*</small>}</legend>
                                    {['likert', 'opcion', 'sino'].includes(q.tipo) && (
                                        <div className="enc-opciones">
                                            {opciones.map((o) => <label key={o}><input type="radio" name={q.id} value={o} checked={respuestas[q.id] === o} onChange={() => set(q.id, o)} required={q.obligatoria} /> {o}</label>)}
                                        </div>
                                    )}
                                    {q.tipo === 'multiple' && (
                                        <div className="enc-opciones">
                                            {opciones.map((o) => <label key={o}><input type="checkbox" checked={(respuestas[q.id] || []).includes(o)} onChange={(e) => marcar(q.id, o, e.target.checked)} /> {o}</label>)}
                                        </div>
                                    )}
                                    {q.tipo === 'numero' && <input className="input-field" type="number" inputMode="decimal" step="any" value={respuestas[q.id] ?? ''} onChange={(e) => set(q.id, e.target.value)} required={q.obligatoria} aria-label={q.texto} />}
                                    {q.tipo === 'abierta' && <textarea className="textarea-field" rows={3} maxLength={2000} value={respuestas[q.id] ?? ''} onChange={(e) => set(q.id, e.target.value)} required={q.obligatoria} aria-label={q.texto} />}
                                </fieldset>
                            );
                        })}
                        {error && <p className="pro-alert" role="alert">{error}</p>}
                        {abierta && <button type="submit" className="pro-btn pro-btn--primary pro-btn--block" disabled={estado === 'enviando'}>{estado === 'enviando' ? 'Enviando…' : 'Enviar respuestas'}</button>}
                        <p className="enc-pie">Tu participación es voluntaria y anónima: no se guarda tu nombre, tu correo ni tu dirección de internet. No escribas datos que te identifiquen en las respuestas abiertas.</p>
                    </form>
                )}
            </div>
            <p className="enc-pie" style={{ marginTop: '1rem' }}><Layers size={13} aria-hidden="true" /> Encuesta creada con PROJECTSIA</p>
        </div>
    );
};

export default EncuestaPublica;
