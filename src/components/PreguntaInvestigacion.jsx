import React from 'react';
import { Search, ArrowRight, HelpCircle } from 'lucide-react';

const PreguntaInvestigacion = () => {
    return (
        <div style={{ maxWidth: '1200px', display: 'grid', gridTemplateColumns: 'minmax(300px, 1.5fr) 1fr', gap: '2rem' }}>

            {/* Main Builder */}
            <div>
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Formulación</h2>
                    <p style={{ marginBottom: '1.5rem' }}>
                        La pregunta de investigación es la meta que buscaremos responder. Debe ser clara, concisa y viable.
                    </p>

                    <div className="input-group">
                        <label>Escribe tu Pregunta de Investigación</label>
                        <textarea
                            className="textarea-field"
                            rows="5"
                            placeholder="Ej: ¿De qué manera la implementación de un sistema web optimiza los procesos de ventas en la empresa X para mejorar la satisfacción del cliente?"
                            style={{ padding: '1rem', lineHeight: '1.6' }}
                        ></textarea>
                    </div>
                </div>

                <div className="card" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                    <h3 style={{ color: '#0369a1', marginBottom: '1rem' }}>Lista de Chequeo</h3>
                    <ul style={{ listStyle: 'none' }}>
                        <li style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', color: '#0c4a6e' }}>
                            <ArrowRight size={18} color="#0ea5e9" />
                            ¿Invita a investigar, no solo a buscar un dato?
                        </li>
                        <li style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', color: '#0c4a6e' }}>
                            <ArrowRight size={18} color="#0ea5e9" />
                            ¿No se responde con un simple SÍ o NO?
                        </li>
                        <li style={{ display: 'flex', gap: '0.75rem', color: '#0c4a6e' }}>
                            <ArrowRight size={18} color="#0ea5e9" />
                            ¿Tiene las variables claras (causa/efecto)?
                        </li>
                    </ul>
                </div>
            </div>

            {/* Examples Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tipos de Preguntas</h3>

                <div className="card" style={{ borderLeft: '4px solid #6366f1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <HelpCircle size={18} color="#6366f1" />
                        <h4 style={{ margin: 0, color: '#1e293b' }}>Descriptiva</h4>
                    </div>
                    <p style={{ fontSize: '0.9rem' }}>Busca definir las propiedades importantes de personas, grupos o fenómenos.</p>
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.375rem', fontStyle: 'italic', fontSize: '0.85rem' }}>
                        "¿Cuáles son las características del comportamiento de compra...?"
                    </div>
                </div>

                <div className="card" style={{ borderLeft: '4px solid #ec4899' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <HelpCircle size={18} color="#ec4899" />
                        <h4 style={{ margin: 0, color: '#1e293b' }}>Correlacional</h4>
                    </div>
                    <p style={{ fontSize: '0.9rem' }}>Evalúa la relación entre dos o más conceptos.</p>
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.375rem', fontStyle: 'italic', fontSize: '0.85rem' }}>
                        "¿Qué relación existe entre la motivación laboral y la productividad...?"
                    </div>
                </div>

                <div className="card" style={{ borderLeft: '4px solid #14b8a6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <HelpCircle size={18} color="#14b8a6" />
                        <h4 style={{ margin: 0, color: '#1e293b' }}>Explicativa</h4>
                    </div>
                    <p style={{ fontSize: '0.9rem' }}>Establece las causas de los sucesos o fenómenos.</p>
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.375rem', fontStyle: 'italic', fontSize: '0.85rem' }}>
                        "¿Por qué el modelo pedagógico X influye en el rendimiento...?"
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreguntaInvestigacion;
