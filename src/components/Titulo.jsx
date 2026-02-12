import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Bookmark, Calendar, MapPin, Users, HelpCircle, PenTool, BookOpen } from 'lucide-react';
import { generateTitle, evaluateTitle } from '../services/groqService';


import verbsData from '../data/verbs.json';

const Titulo = () => {

    const verbs = verbsData;


    const [formData, setFormData] = useState({
        accion: '',
        objeto: '',
        donde: '',
        quien: '',
        cuando: '',
        paraque: '',
        includeParaque: true,
        includeQuien: true,
        includeDonde: true,
        includeCuando: true
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [aiTitle, setAiTitle] = useState('');
    const [error, setError] = useState('');
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [evaluation, setEvaluation] = useState('');

    const handleGenerateTitle = async () => {
        setIsGenerating(true);
        setError('');
        try {
            const generatedTitle = await generateTitle(formData);
            setAiTitle(generatedTitle);
        } catch (error) {
            console.error('Error generating title:', error);
            setError(error.message || 'Error al generar el título');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleEvaluateTitle = async () => {
        const titleToEvaluate = aiTitle || generatedTitle;
        if (!titleToEvaluate) {
            setError('No hay título para evaluar');
            return;
        }

        setIsEvaluating(true);
        setError('');
        try {
            const evaluationResult = await evaluateTitle(titleToEvaluate, formData);
            setEvaluation(evaluationResult);
        } catch (error) {
            console.error('Error evaluating title:', error);
            setError(error.message || 'Error al evaluar el título');
        } finally {
            setIsEvaluating(false);
        }
    };



    // Constructing the title: Action + Object + Context + Population + Time + Purpose
    // Using a more academic structure logic
    const generatedTitle = [
        formData.accion,
        formData.objeto,
        (formData.includeParaque && formData.paraque) ? `para ${formData.paraque}` : null,
        (formData.includeQuien && formData.quien) ? `en ${formData.quien}` : null, // Often "en estudiantes de..."
        (formData.includeDonde && formData.donde) ? `de ${formData.donde}` : null,   // "de la empresa X"
        (formData.includeCuando && formData.cuando) ? `durante ${formData.cuando}` : null
    ].filter(Boolean).join(' ');

    const wordCount = generatedTitle.split(/\s+/).filter(w => w.length > 0).length;

    return (
        <div style={{ maxWidth: '100%', paddingBottom: '3rem' }}>

            {/* Introduction Banner */}
            <div className="responsive-banner" style={{
                background: 'linear-gradient(to right, #f3e8ff, #fdf4ff)',
                border: '1px solid #e9d5ff',
                borderRadius: '1rem',
                padding: '2rem',
                marginBottom: '2.5rem',
                display: 'flex',
                gap: '2rem',
                alignItems: 'start'
            }}>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.5rem', color: '#6b21a8', marginBottom: '1rem' }}>
                        El Arte de un Buen Título
                    </h2>
                    <p style={{ color: '#581c87', lineHeight: '1.7', fontSize: '1.05rem' }}>
                        El título es la <strong>primera impresión</strong> de tu investigación. Debe ser una "etiqueta" precisa que le diga al lector exactamente qué esperar.
                        No es un resumen, pero tampoco debe ser vago. Debe contener las variables clave, la población y el contexto.
                    </p>
                </div>
                <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                    maxWidth: '300px',
                    width: '100%'
                }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9333ea', marginBottom: '0.5rem' }}>
                        <BookOpen size={18} /> Regla de Oro
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: '#475569' }}>
                        Intenta mantenerlo entre <strong>12 y 20 palabras</strong>. Si es más largo, podrías estar incluyendo detalles innecesarios.
                    </p>
                </div>
            </div>

            {/* Educational Theory Cards */}
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#334155' }}>Anatomía del Título</h3>
            <div className="grid-cols-3 responsive-flex-grid" style={{ marginBottom: '3rem' }}>

                <div className="card" style={{ borderTop: '4px solid #3b82f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.5rem', background: '#eff6ff', borderRadius: '0.5rem' }}>
                            <Bookmark size={24} color="#3b82f6" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0 }}>Qué (Variable Central)</h3>
                            <span style={{ fontSize: '0.8rem', color: '#1e40af', fontWeight: '500' }}>CONTENIDO</span>
                        </div>
                    </div>
                    <p style={{ fontSize: '0.95rem', color: '#475569' }}>
                        ¿Cuál es el objeto de estudio? ¿Qué se va a investigar o desarrollar?
                    </p>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
                        Ej: "Estrategias de aprendizaje", "Sistema de monitoreo", "Impacto ambiental"
                    </div>
                </div>

                <div className="card" style={{ borderTop: '4px solid #10b981' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.5rem', background: '#ecfdf5', borderRadius: '0.5rem' }}>
                            <HelpCircle size={24} color="#10b981" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0 }}>Para Qué (Propósito)</h3>
                            <span style={{ fontSize: '0.8rem', color: '#065f46', fontWeight: '500' }}>FINALIDAD</span>
                        </div>
                    </div>
                    <p style={{ fontSize: '0.95rem', color: '#475569' }}>
                        ¿Cuál es el objetivo principal o el efecto esperado? (Especialmente en proyectos aplicados).
                    </p>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
                        Ej: "...para la optimización de procesos", "...para reducir la deserción"
                    </div>
                </div>

                <div className="card" style={{ borderTop: '4px solid #f59e0b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.5rem', background: '#fffbeb', borderRadius: '0.5rem' }}>
                            <MapPin size={24} color="#f59e0b" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0 }}>Dónde y Cuándo</h3>
                            <span style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: '500' }}>CONTEXTO</span>
                        </div>
                    </div>
                    <p style={{ fontSize: '0.95rem', color: '#475569' }}>
                        Delimitación espacial (Lugar/Institución) y temporal (Periodo, si aplica).
                    </p>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
                        Ej: "...en la ciudad de Bogotá", "...durante el periodo 2023-2024"
                    </div>
                </div>

            </div>

            {/* Examples & Common Mistakes Section */}
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#334155' }}>Ejemplos y Buenas Prácticas</h3>
            <div className="responsive-flex-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>

                {/* Deconstructed Examples */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h4 style={{ fontSize: '1rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ejemplos Desglosados</h4>

                    <div className="card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                        <p style={{ fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
                            "Implementación de un chatbot con IA para la atención al cliente en el Banco Finandina durante el 2024"
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.75rem' }}>
                            <span style={{ padding: '2px 8px', background: '#eff6ff', color: '#1e40af', borderRadius: '4px' }}>Acción: Implementación</span>
                            <span style={{ padding: '2px 8px', background: '#ecfdf5', color: '#065f46', borderRadius: '4px' }}>Objeto: Chatbot IA</span>
                            <span style={{ padding: '2px 8px', background: '#fffbeb', color: '#b45309', borderRadius: '4px' }}>Contexto: Banco Finandina</span>
                            <span style={{ padding: '2px 8px', background: '#f3f0ff', color: '#6b21a8', borderRadius: '4px' }}>Tiempo: 2024</span>
                        </div>
                    </div>

                    <div className="card" style={{ borderLeft: '4px solid #ec4899' }}>
                        <p style={{ fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
                            "Evaluación del impacto del teletrabajo en la salud mental de los docentes universitarios en Bogotá"
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.75rem' }}>
                            <span style={{ padding: '2px 8px', background: '#eff6ff', color: '#1e40af', borderRadius: '4px' }}>Acción: Evaluación</span>
                            <span style={{ padding: '2px 8px', background: '#ecfdf5', color: '#065f46', borderRadius: '4px' }}>Objeto: Impacto del teletrabajo</span>
                            <span style={{ padding: '2px 8px', background: '#fdf2f8', color: '#be185d', borderRadius: '4px' }}>Población: Docentes</span>
                        </div>
                    </div>
                </div>

                {/* Common Mistakes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h4 style={{ fontSize: '1rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Errores Comunes</h4>

                    <div className="card" style={{ borderLeft: '4px solid #ef4444', backgroundColor: '#fef2f2' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <AlertCircle size={16} color="#ef4444" />
                            <span style={{ fontWeight: '600', color: '#991b1b' }}>El título "Misterioso"</span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#7f1d1d' }}>
                            ❌ "Un camino hacia el futuro." <br />
                            ✅ Evita metáforas literarias. Sé literal y técnico.
                        </p>
                    </div>

                    <div className="card" style={{ borderLeft: '4px solid #f59e0b', backgroundColor: '#fffbeb' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <AlertCircle size={16} color="#f59e0b" />
                            <span style={{ fontWeight: '600', color: '#92400e' }}>La "Tesis Enciclopedia"</span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#92400e' }}>
                            ❌ Intentar cubrir demasiados temas en un solo proyecto. <br />
                            ✅ Delimita: Menos es más si se profundiza bien.
                        </p>
                    </div>
                </div>

            </div>
            {/* Interactive Builder */}
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <PenTool size={20} /> Constructor Estructurado
            </h3>

            <div className="responsive-flex-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.5fr) 1fr', gap: '2rem' }}>

                {/* Form Section */}
                <div className="card">





                    <div className="input-group">
                        <label>1. ¿Qué se hace? (Acción / Verbo sustantivado)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'start' }}>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Buscar verbo..."
                                    value={formData.accion}
                                    onChange={(e) => setFormData({ ...formData, accion: e.target.value })}
                                    list="verbs-list"
                                />
                                <datalist id="verbs-list">
                                    {verbs.map(v => <option key={v.label} value={v.label} />)}
                                </datalist>
                            </div>

                            {(() => {
                                const selectedVerb = verbs.find(v => v.label.toLowerCase() === formData.accion.toLowerCase());
                                return selectedVerb ? (
                                    <div style={{
                                        background: '#f0f9ff',
                                        border: '1px solid #bae6fd',
                                        padding: '0.75rem',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.85rem'
                                    }}>
                                        <div style={{ fontWeight: '600', color: '#0369a1', marginBottom: '0.25rem' }}>{selectedVerb.label}</div>
                                        <div style={{ color: '#0c4a6e' }}>{selectedVerb.desc}</div>
                                    </div>
                                ) : (
                                    <div style={{
                                        background: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        padding: '0.75rem',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.85rem',
                                        color: '#64748b',
                                        fontStyle: 'italic'
                                    }}>
                                        Selecciona un verbo para ver su definición.
                                    </div>
                                );
                            })()}
                        </div>
                        <div style={{
                            marginTop: '0.75rem',
                            padding: '0.875rem',
                            background: 'linear-gradient(to right, #fef3c7, #fef9e7)',
                            border: '1px solid #fde68a',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            lineHeight: '1.6'
                        }}>
                            <div style={{ fontWeight: '600', color: '#92400e', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1.1rem' }}>💡</span> ¿Qué se hace?
                            </div>
                            <div style={{ color: '#78350f' }}>
                                <strong>Define la acción principal</strong> de tu investigación usando un verbo sustantivado (análisis, evaluación, diseño, etc.).
                                Este verbo representa <strong>qué tipo de trabajo investigativo</strong> realizarás.
                            </div>
                            <div style={{ marginTop: '0.5rem', color: '#78350f', fontSize: '0.8rem', fontStyle: 'italic' }}>
                                Ejemplo: "Análisis" si vas a examinar datos, "Diseño" si vas a crear algo nuevo, "Evaluación" si vas a medir resultados.
                            </div>
                        </div>
                    </div>

                    <div className="input-group">
                        <label>2. ¿Sobre qué? (Objeto de Estudio / Variable)</label>
                        {(() => {
                            const selectedVerb = verbs.find(v => v.label.toLowerCase() === formData.accion.toLowerCase());
                            return (
                                <div>
                                    {selectedVerb && (
                                        <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: '#0369a1', fontWeight: '500' }}>
                                            💡 {selectedVerb.objectHint}
                                        </div>
                                    )}
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder={selectedVerb ? `Ej: ${selectedVerb.example}...` : "Ej: del clima organizacional, de un software contable..."}
                                        value={formData.objeto}
                                        onChange={(e) => setFormData({ ...formData, objeto: e.target.value })}
                                    />
                                </div>
                            );
                        })()}
                        <div style={{
                            marginTop: '0.75rem',
                            padding: '0.875rem',
                            background: 'linear-gradient(to right, #fef3c7, #fef9e7)',
                            border: '1px solid #fde68a',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            lineHeight: '1.6'
                        }}>
                            <div style={{ fontWeight: '600', color: '#92400e', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1.1rem' }}>💡</span> ¿Sobre qué?
                            </div>
                            <div style={{ color: '#78350f' }}>
                                <strong>Define el objeto de estudio o las variables</strong> que investigarás. Es el "qué" específico que analizarás, medirás o estudiarás.
                            </div>
                            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #fde68a' }}>
                                <div style={{ color: '#78350f', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                    <strong>Ejemplos de objetos de estudio:</strong>
                                </div>
                                <ul style={{ margin: '0.25rem 0 0 1.25rem', padding: 0, color: '#78350f', fontSize: '0.8rem' }}>
                                    <li>El clima organizacional en empresas tecnológicas</li>
                                    <li>La satisfacción del cliente en servicios bancarios</li>
                                    <li>El proceso de toma de decisiones gerenciales</li>
                                </ul>
                            </div>
                            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #fde68a' }}>
                                <div style={{ color: '#78350f', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                    <strong>Ejemplos de variables:</strong>
                                </div>
                                <ul style={{ margin: '0.25rem 0 0 1.25rem', padding: 0, color: '#78350f', fontSize: '0.8rem' }}>
                                    <li>La productividad laboral</li>
                                    <li>El rendimiento académico</li>
                                    <li>La eficiencia operativa</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="input-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label>3. ¿Para qué? (Propósito) <span style={{ color: '#94a3b8', fontWeight: 'normal' }}></span></label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.includeParaque}
                                    onChange={(e) => setFormData({ ...formData, includeParaque: e.target.checked })}
                                />
                                Incluir
                            </label>
                        </div>
                        {(() => {
                            const selectedVerb = verbs.find(v => v.label.toLowerCase() === formData.accion.toLowerCase());
                            return (
                                <div>
                                    {selectedVerb && (
                                        <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: '#059669', fontWeight: '500' }}>
                                            💡 {selectedVerb.purposeHint}
                                        </div>
                                    )}
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder={selectedVerb ? `Ej: ${selectedVerb.purposeExample}...` : "Ej: mejorar la productividad, reducir riesgos..."}
                                        value={formData.paraque}
                                        onChange={(e) => setFormData({ ...formData, paraque: e.target.value })}
                                        style={{ opacity: formData.includeParaque ? 1 : 0.6 }}
                                    />
                                </div>
                            );
                        })()}
                        <div style={{
                            marginTop: '0.75rem',
                            padding: '0.875rem',
                            background: 'linear-gradient(to right, #fef3c7, #fef9e7)',
                            border: '1px solid #fde68a',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            lineHeight: '1.6'
                        }}>
                            <div style={{ fontWeight: '600', color: '#92400e', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1.1rem' }}>💡</span> ¿Para qué?
                            </div>
                            <div style={{ color: '#78350f' }}>
                                <strong>Define el propósito u objetivo</strong> de tu investigación. Responde a la pregunta: ¿qué quieres lograr o conseguir con este estudio?
                            </div>
                            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #fde68a' }}>
                                <div style={{ color: '#78350f', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                    <strong>Ejemplos de propósitos:</strong>
                                </div>
                                <ul style={{ margin: '0.25rem 0 0 1.25rem', padding: 0, color: '#78350f', fontSize: '0.8rem' }}>
                                    <li>Para mejorar la productividad laboral</li>
                                    <li>Para identificar oportunidades de mejora</li>
                                    <li>Para reducir costos operativos</li>
                                    <li>Para optimizar procesos de negocio</li>
                                    <li>Para aumentar la satisfacción del cliente</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="input-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label>4. ¿En quiénes? (Unidad de Análisis / Población)</label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.includeQuien}
                                    onChange={(e) => setFormData({ ...formData, includeQuien: e.target.checked })}
                                />
                                Incluir
                            </label>
                        </div>
                        {(() => {
                            const selectedVerb = verbs.find(v => v.label.toLowerCase() === formData.accion.toLowerCase());
                            return (
                                <div>
                                    {selectedVerb && (
                                        <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: '#7c3aed', fontWeight: '500' }}>
                                            💡 {selectedVerb.populationHint}
                                        </div>
                                    )}
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder={selectedVerb ? `Ej: ${selectedVerb.populationExample}...` : "Ej: en estudiantes, en las pymes..."}
                                        value={formData.quien}
                                        onChange={(e) => setFormData({ ...formData, quien: e.target.value })}
                                        style={{ opacity: formData.includeQuien ? 1 : 0.6 }}
                                    />
                                </div>
                            );
                        })()}
                        <div style={{
                            marginTop: '0.75rem',
                            padding: '0.875rem',
                            background: 'linear-gradient(to right, #fef3c7, #fef9e7)',
                            border: '1px solid #fde68a',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            lineHeight: '1.6'
                        }}>
                            <div style={{ fontWeight: '600', color: '#92400e', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1.1rem' }}>💡</span> ¿En quiénes?
                            </div>
                            <div style={{ color: '#78350f' }}>
                                <strong>Define la población o unidad de análisis</strong> de tu investigación. ¿Sobre quiénes o qué entidades recopilarás información?
                            </div>
                            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #fde68a' }}>
                                <div style={{ color: '#78350f', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                    <strong>Ejemplos de poblaciones:</strong>
                                </div>
                                <ul style={{ margin: '0.25rem 0 0 1.25rem', padding: 0, color: '#78350f', fontSize: '0.8rem' }}>
                                    <li>En estudiantes universitarios de Colombia</li>
                                    <li>En docentes de educación básica</li>
                                    <li>En pequeñas y medianas empresas (PYMES)</li>
                                    <li>En trabajadores del sector salud</li>
                                    <li>En clientes de servicios financieros</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="input-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label>5. ¿Dónde? (Lugar)</label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.includeDonde}
                                        onChange={(e) => setFormData({ ...formData, includeDonde: e.target.checked })}
                                    />
                                    Incluir
                                </label>
                            </div>
                            {(() => {
                                const selectedVerb = verbs.find(v => v.label.toLowerCase() === formData.accion.toLowerCase());
                                return (
                                    <div>
                                        {selectedVerb && (
                                            <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: '#db2777', fontWeight: '500' }}>
                                                💡 {selectedVerb.placeHint}
                                            </div>
                                        )}
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder={selectedVerb ? `Ej: ${selectedVerb.placeExample}...` : "Ej: en la ciudad de Bogotá, en el laboratorio..."}
                                            value={formData.donde}
                                            onChange={(e) => setFormData({ ...formData, donde: e.target.value })}
                                            style={{ opacity: formData.includeDonde ? 1 : 0.6 }}
                                        />
                                    </div>
                                );
                            })()}
                            <div style={{
                                marginTop: '0.75rem',
                                padding: '0.875rem',
                                background: 'linear-gradient(to right, #fef3c7, #fef9e7)',
                                border: '1px solid #fde68a',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                lineHeight: '1.6'
                            }}>
                                <div style={{ fontWeight: '600', color: '#92400e', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.1rem' }}>💡</span> ¿Dónde?
                                </div>
                                <div style={{ color: '#78350f' }}>
                                    <strong>Define el contexto geográfico o espacial</strong> donde se realizará la investigación.
                                </div>
                                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #fde68a' }}>
                                    <div style={{ color: '#78350f', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                        <strong>Ejemplos de lugares:</strong>
                                    </div>
                                    <ul style={{ margin: '0.25rem 0 0 1.25rem', padding: 0, color: '#78350f', fontSize: '0.8rem' }}>
                                        <li>En la ciudad de Bogotá</li>
                                        <li>En la Universidad Nacional de Colombia</li>
                                        <li>En empresas del sector tecnológico de Medellín</li>
                                        <li>En hospitales públicos de Cali</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="input-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label>6. ¿Cuándo? (Tiempo) <span style={{ color: '#94a3b8', fontWeight: 'normal' }}>(Opcional)</span></label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.includeCuando}
                                        onChange={(e) => setFormData({ ...formData, includeCuando: e.target.checked })}
                                    />
                                    Incluir
                                </label>
                            </div>
                            {(() => {
                                const selectedVerb = verbs.find(v => v.label.toLowerCase() === formData.accion.toLowerCase());
                                return (
                                    <div>
                                        {selectedVerb && (
                                            <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: '#ea580c', fontWeight: '500' }}>
                                                💡 {selectedVerb.timeHint}
                                            </div>
                                        )}
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder={selectedVerb ? `Ej: ${selectedVerb.timeExample}...` : "Ej: 2024, primer semestre..."}
                                            value={formData.cuando}
                                            onChange={(e) => setFormData({ ...formData, cuando: e.target.value })}
                                            style={{ opacity: formData.includeCuando ? 1 : 0.6 }}
                                        />
                                    </div>
                                );
                            })()}
                            <div style={{
                                marginTop: '0.75rem',
                                padding: '0.875rem',
                                background: 'linear-gradient(to right, #fef3c7, #fef9e7)',
                                border: '1px solid #fde68a',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                lineHeight: '1.6'
                            }}>
                                <div style={{ fontWeight: '600', color: '#92400e', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.1rem' }}>💡</span> ¿Cuándo?
                                </div>
                                <div style={{ color: '#78350f' }}>
                                    <strong>Define el marco temporal</strong> de tu investigación. ¿En qué período se realizará o se enfoca el estudio?
                                </div>
                                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #fde68a' }}>
                                    <div style={{ color: '#78350f', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                        <strong>Ejemplos de períodos temporales:</strong>
                                    </div>
                                    <ul style={{ margin: '0.25rem 0 0 1.25rem', padding: 0, color: '#78350f', fontSize: '0.8rem' }}>
                                        <li>Durante el año 2024</li>
                                        <li>En el primer semestre de 2025</li>
                                        <li>Entre enero y junio de 2024</li>
                                        <li>Durante el período 2023-2024</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Live Preview Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div className="card" style={{
                        background: 'linear-gradient(to bottom right, #ffffff, #f8fafc)',
                        borderColor: '#e2e8f0',
                        position: 'sticky',
                        top: '2rem'
                    }}>
                        <h3 style={{ color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Resultado Preliminar</h3>

                        <div style={{
                            padding: '1.5rem',
                            background: '#ffffff',
                            borderRadius: '0.75rem',
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
                            border: '1px solid #e2e8f0',
                            minHeight: '140px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center'
                        }}>
                            {generatedTitle.trim() ? (
                                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', lineHeight: '1.5' }}>
                                    {generatedTitle}
                                </span>
                            ) : (

                                <div style={{ marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: '#64748b' }}>
                                        <span>Conteo de palabras:</span>
                                        <span style={{
                                            fontWeight: 'bold',
                                            color: wordCount > 20 ? '#ef4444' : (wordCount > 0 ? '#10b981' : '#94a3b8')
                                        }}>
                                            {wordCount} palabras
                                        </span>
                                    </div>
                                    {wordCount > 20 && (
                                        <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.5rem' }}>
                                            * Intenta simplificar. Un título académico idealmente no supera las 20 palabras.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* AI Generation Section */}
                        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px dashed #cbd5e1' }}>
                            <button
                                onClick={handleGenerateTitle}
                                disabled={isGenerating || !formData.accion || !formData.objeto}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: isGenerating ? '#94a3b8' : 'linear-gradient(to right, #7c3aed, #db2777)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    fontWeight: '600',
                                    cursor: isGenerating || !formData.accion || !formData.objeto ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    boxShadow: '0 4px 6px -1px rgba(124, 58, 237, 0.3)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {isGenerating ? (
                                    <>
                                        <span className="spinner" style={{ animation: 'spin 1s linear infinite' }}>⌛</span> Generando...
                                    </>
                                ) : (
                                    <>
                                        <span style={{ fontSize: '1.2rem' }}>✨</span> Generar con IA
                                    </>
                                )}
                            </button>

                            {aiTitle && (
                                <div style={{
                                    marginTop: '1rem',
                                    padding: '1rem',
                                    background: '#f0fdf4',
                                    border: '1px solid #bbf7d0',
                                    borderRadius: '0.5rem',
                                    position: 'relative'
                                }}>
                                    <h5 style={{ margin: '0 0 0.5rem 0', color: '#166534', fontSize: '0.85rem', textTransform: 'uppercase' }}>Sugerencia IA:</h5>
                                    <p style={{ margin: 0, color: '#14532d', fontWeight: '600', fontSize: '1.1rem' }}>{aiTitle}</p>

                                    <button
                                        onClick={handleEvaluateTitle}
                                        disabled={isEvaluating}
                                        style={{
                                            marginTop: '0.75rem',
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: isEvaluating ? '#94a3b8' : 'linear-gradient(to right, #059669, #047857)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '0.5rem',
                                            fontWeight: '600',
                                            cursor: isEvaluating ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            fontSize: '0.9rem',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {isEvaluating ? (
                                            <>
                                                <span className="spinner" style={{ animation: 'spin 1s linear infinite' }}>⌛</span> Evaluando...
                                            </>
                                        ) : (
                                            <>
                                                <span style={{ fontSize: '1.1rem' }}>🎯</span> Evaluar Título
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                            {evaluation && (
                                <div style={{
                                    marginTop: '1rem',
                                    padding: '1.25rem',
                                    background: 'linear-gradient(to bottom right, #fefce8, #fef9c3)',
                                    border: '2px solid #fde047',
                                    borderRadius: '0.75rem',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                                }}>
                                    <h5 style={{
                                        margin: '0 0 1rem 0',
                                        color: '#854d0e',
                                        fontSize: '1rem',
                                        fontWeight: '700',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <span style={{ fontSize: '1.3rem' }}>📊</span> Evaluación del Título
                                    </h5>
                                    <div style={{
                                        color: '#713f12',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.7',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {evaluation}
                                    </div>
                                </div>
                            )}
                            {error && (
                                <div style={{
                                    marginTop: '1rem',
                                    padding: '1rem',
                                    background: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    borderRadius: '0.5rem'
                                }}>
                                    <p style={{ margin: 0, color: '#991b1b', fontSize: '0.9rem' }}>⚠️ {error}</p>
                                </div>
                            )}
                            {!formData.accion && !formData.objeto && (
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', marginTop: '0.5rem' }}>
                                    * Completa al menos la Acción y el Objeto para usar la IA.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

            </div >

        </div >
    );
};

export default Titulo;
