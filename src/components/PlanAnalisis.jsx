import React, { useState } from 'react';
import { AreaChart, ClipboardList, TrendingUp, Key, Edit3, Sparkles } from 'lucide-react';
import { suggestInstruments } from '../services/groqService';

const PlanAnalisis = () => {
    const [showGuiaPlan, setShowGuiaPlan] = useState(false);
    const [showGuiaInstrumentos, setShowGuiaInstrumentos] = useState(false);

    // AI Form States
    const [title, setTitle] = useState('');
    const [suggestedInstruments, setSuggestedInstruments] = useState('');
    const [isGeneratingInst, setIsGeneratingInst] = useState(false);
    const [instError, setInstError] = useState('');

    const handleSuggestInstruments = async () => {
        if (!title.trim()) {
            setInstError('Por favor ingresa el título de tu investigación');
            return;
        }
        setIsGeneratingInst(true);
        setInstError('');
        try {
            const results = await suggestInstruments(title);
            setSuggestedInstruments(results);
        } catch (error) {
            console.error('Error:', error);
            setInstError(error.message || 'Error al sugerir instrumentos');
        } finally {
            setIsGeneratingInst(false);
        }
    };

    return (
        <div style={{ maxWidth: '100%', paddingBottom: '3rem' }}>

            {/* Main Theory Card */}
            <div className="responsive-banner" style={{
                background: 'linear-gradient(to right, #fdf4ff, #fae8ff)',
                border: '1px solid #f5d0fe',
                borderRadius: '1rem',
                padding: '2rem',
                marginBottom: '2.5rem',
                display: 'flex',
                gap: '2rem',
                alignItems: 'start'
            }}>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.5rem', color: '#86198f', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AreaChart size={28} />
                        Plan de análisis de la información e Instrumentos
                    </h2>
                    <p style={{ color: '#701a75', lineHeight: '1.7', fontSize: '1.05rem', marginBottom: '1rem' }}>
                        Una vez recabados los datos mediante los <strong>instrumentos de recolección</strong>, es necesario establecer un <strong>Plan de análisis</strong> que dictamine cómo se procesará matemáticamente o hermenéuticamente esa información para dar respuesta al problema de investigación.
                    </p>
                </div>
            </div>

            {/* Plan de análisis Section */}
            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={24} color="#d946ef" /> Plan de análisis de la información
            </h3>

            <div style={{
                background: 'linear-gradient(to bottom right, #fdf4ff, #fae8ff)',
                border: '1px solid #f5d0fe',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '1rem'
            }}>
                <h4 style={{ fontSize: '1.1rem', color: '#a21caf', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Key size={20} color="#d946ef" />
                    Procesamiento de los Datos
                </h4>
                <p style={{ color: '#86198f', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
                    Es el desarrollo de un mapa de ruta sobre cómo organizar y analizar los datos explorados. También puede considerarse como un proceso cíclico de selección, categorización, comparación, validación e interpretación de todas las fases de investigación que permite una mejor comprensión de la necesidad a estudiar.
                </p>
            </div>

            {/* Toggle Button Plan */}
            <div style={{ marginBottom: showGuiaPlan ? '1rem' : '3rem' }}>
                <button
                    onClick={() => setShowGuiaPlan(!showGuiaPlan)}
                    style={{
                        background: 'white',
                        border: '1px solid #fbcfe8',
                        color: '#db2777',
                        padding: '0.75rem 1.25rem',
                        borderRadius: '0.5rem',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <span style={{ fontSize: '1.2rem' }}>💡</span>
                    {showGuiaPlan ? 'Ocultar Guía y Ejemplo' : 'Ver Guía y Ejemplo de Redacción'}
                </button>
            </div>

            {showGuiaPlan && (
                <div className="fade-in" style={{
                    background: '#f8fafc',
                    borderLeft: '4px solid #db2777',
                    padding: '1.25rem',
                    borderRadius: '0 0.5rem 0.5rem 0',
                    marginBottom: '3rem'
                }}>
                    <h5 style={{ color: '#be185d', fontSize: '1.05rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>📝</span> ¿Cómo redactar el Plan de Análisis?
                    </h5>
                    <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 0 1rem 0' }}>
                        Debes especificar qué software (SPSS, Excel, Atlas.ti) utilizarás para organizar la información y qué técnicas aplicarás a los resultados (estadística descriptiva, análisis del discurso, tabulación cruzada). Explica paso a paso qué harás con las encuestas o entrevistas una vez que las tengas recolectadas en tus manos.
                    </p>
                    <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                        <strong style={{ color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>📌 Ejemplo de redacción</strong>
                        <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>
                            "Para el análisis de la información recolectada, se procederá a tabular los datos cuantitativos empleando el software estadístico SPSS V25. Se realizará inicialmente un análisis de estadística descriptiva para calcular frecuencias y porcentajes. Posteriormente, las preguntas abiertas de las entrevistas serán transcritas y sometidas a un proceso de categorización axial mediante el software Atlas.ti, lo que permitirá triangular los datos y dar respuesta a los objetivos específicos."
                        </p>
                    </div>
                </div>
            )}

            {/* Instrumentos Section */}
            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ClipboardList size={24} color="#10b981" /> Instrumentos de recolección de información
            </h3>

            <div style={{
                background: 'linear-gradient(to bottom right, #f0fdf4, #dcfce7)',
                border: '1px solid #bbf7d0',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '1rem'
            }}>
                <h4 style={{ fontSize: '1.1rem', color: '#047857', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Edit3 size={20} color="#10b981" />
                    Medición y Recolección
                </h4>
                <p style={{ color: '#065f46', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
                    Definir los instrumentos de recolección de información que se utilizarán en las etapas de análisis e identificación del problema. Estos pueden ser encuestas estructuradas, guías de entrevista, rúbricas de observación, fichas de análisis documental o cualquier herramienta física/digital que absorba los datos de la muestra.
                </p>
            </div>

            {/* Tipos de Instrumentos Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Encuesta */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <h5 style={{ color: '#047857', fontSize: '1.05rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        📋 Encuesta / Cuestionario
                    </h5>
                    <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: '1.5' }}>
                        Conjunto de preguntas estandarizadas (cerradas o abiertas) dirigidas a una muestra representativa.
                    </p>
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem', borderRadius: '0.5rem' }}>
                        <strong style={{ color: '#065f46', fontSize: '0.85rem' }}>Beneficios:</strong>
                        <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0, color: '#065f46', fontSize: '0.85rem', lineHeight: '1.5' }}>
                            <li style={{ marginBottom: '0.25rem' }}>Recolecta gran cantidad de datos rápidamente.</li>
                            <li style={{ marginBottom: '0.25rem' }}>Facilita el análisis estadístico y gráficas.</li>
                            <li>Garantiza el anonimato del encuestado.</li>
                        </ul>
                    </div>
                </div>

                {/* Entrevista */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <h5 style={{ color: '#0369a1', fontSize: '1.05rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        🎙️ Entrevista
                    </h5>
                    <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: '1.5' }}>
                        Diálogo dirigido entre el investigador y el sujeto de estudio para profundizar en un tema.
                    </p>
                    <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '0.75rem', borderRadius: '0.5rem' }}>
                        <strong style={{ color: '#075985', fontSize: '0.85rem' }}>Beneficios:</strong>
                        <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0, color: '#075985', fontSize: '0.85rem', lineHeight: '1.5' }}>
                            <li style={{ marginBottom: '0.25rem' }}>Proporciona información profunda y subjetiva.</li>
                            <li style={{ marginBottom: '0.25rem' }}>Permite aclarar dudas y repreguntar en el aire.</li>
                            <li>Capta emociones y contexto cualitativo.</li>
                        </ul>
                    </div>
                </div>

                {/* Observación */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <h5 style={{ color: '#6d28d9', fontSize: '1.05rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        👁️ Observación Crítica
                    </h5>
                    <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: '1.5' }}>
                        Registro visual o participativo de lo que ocurre en una situación real usando una matriz o rúbrica de campo.
                    </p>
                    <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '0.75rem', borderRadius: '0.5rem' }}>
                        <strong style={{ color: '#4c1d95', fontSize: '0.85rem' }}>Beneficios:</strong>
                        <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0, color: '#4c1d95', fontSize: '0.85rem', lineHeight: '1.5' }}>
                            <li style={{ marginBottom: '0.25rem' }}>Estudia el fenómeno en su entorno natural.</li>
                            <li style={{ marginBottom: '0.25rem' }}>No depende de la voluntad de respuesta.</li>
                            <li>Evita sesgos cognitivos o encuestas alteradas.</li>
                        </ul>
                    </div>
                </div>

                {/* Revisión Documental */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <h5 style={{ color: '#b45309', fontSize: '1.05rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        📚 Revisión Documental
                    </h5>
                    <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: '1.5' }}>
                        Análisis de fuentes secundarias objetivas: reportes, balances, historias clínicas o bases empíricas previas.
                    </p>
                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '0.75rem', borderRadius: '0.5rem' }}>
                        <strong style={{ color: '#92400e', fontSize: '0.85rem' }}>Beneficios:</strong>
                        <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0, color: '#92400e', fontSize: '0.85rem', lineHeight: '1.5' }}>
                            <li style={{ marginBottom: '0.25rem' }}>Análisis no reactivo de muy bajo costo.</li>
                            <li style={{ marginBottom: '0.25rem' }}>Información inalterada por el experimento.</li>
                            <li>Útil para análisis históricos o empresariales.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Toggle Button Instrumentos */}
            <div style={{ marginBottom: showGuiaInstrumentos ? '1rem' : '3rem' }}>
                <button
                    onClick={() => setShowGuiaInstrumentos(!showGuiaInstrumentos)}
                    style={{
                        background: 'white',
                        border: '1px solid #a7f3d0',
                        color: '#059669',
                        padding: '0.75rem 1.25rem',
                        borderRadius: '0.5rem',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <span style={{ fontSize: '1.2rem' }}>💡</span>
                    {showGuiaInstrumentos ? 'Ocultar Guía y Ejemplo' : 'Ver Guía y Ejemplo de Redacción'}
                </button>
            </div>

            {showGuiaInstrumentos && (
                <div className="fade-in" style={{
                    background: '#f8fafc',
                    borderLeft: '4px solid #059669',
                    padding: '1.25rem',
                    borderRadius: '0 0.5rem 0.5rem 0',
                    marginBottom: '3rem'
                }}>
                    <h5 style={{ color: '#047857', fontSize: '1.05rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>📝</span> ¿Cómo redactar los Instrumentos?
                    </h5>
                    <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 0 1rem 0' }}>
                        Nombra explícitamente el instrumento que vas a utilizar (Ej. Cuestionario de X preguntas tipo Likert, Guía de entrevista semiestructurada). Explica quién lo diseñó (si es propio o de un autor existente) y a quién se le aplicará. Además, menciona brevemente cómo asegura su validez y pertinencia frente al problema.
                    </p>
                    <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                        <strong style={{ color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>📌 Ejemplo de redacción</strong>
                        <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>
                            "El instrumento principal para la recolección de información será un cuestionario estructurado de 15 afirmaciones bajo escala Likert, diseñado ad hoc por los investigadores. Este cuestionario será aplicado a la muestra de 120 estudiantes de bachillerato. Para complementar la fase cualitativa, se empleará una matriz de observación no participante para evaluar el comportamiento en el aula durante la inmersión virtual."
                        </p>
                    </div>
                </div>
            )}

            {/* AI Generator Section para Instrumentos */}
            <div style={{ maxWidth: '1200px', marginTop: '3rem' }}>
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Asistente de Instrumentos y Viabilidad (IA)</h2>
                    <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
                        Si tienes dudas sobre qué técnica empírica usar, la Inteligencia Artificial analizará el título de tu proyecto para recomendarte los instrumentos más exactos, justificando por qué sirven y analizando si realmente son viables de aplicar en la práctica.
                    </p>

                    <div style={{ marginBottom: '1rem', padding: '1.5rem', background: 'linear-gradient(to right, #f0fdf4, #dcfce7)', borderRadius: '0.75rem', border: '1px solid #bbf7d0' }}>
                        <h3 style={{ fontSize: '1.1rem', color: '#065f46', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Sparkles size={20} color="#10b981" /> Consultor de Herramientas
                        </h3>

                        <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                            <label>Título de tu Investigación</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Ej: Implementación de inteligencia artificial en pequeñas empresas..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                style={{ padding: '0.75rem' }}
                            />
                        </div>

                        <button
                            onClick={handleSuggestInstruments}
                            disabled={isGeneratingInst || !title.trim()}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: isGeneratingInst || !title.trim() ? '#cbd5e1' : 'linear-gradient(to right, #10b981, #059669)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontWeight: '600',
                                cursor: isGeneratingInst || !title.trim() ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                fontSize: '1.05rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            {isGeneratingInst ? 'Analizando viabilidad...' : '💡 Sugerir Instrumentos y Viabilidad'}
                        </button>

                        {suggestedInstruments && (
                            <div className="fade-in" style={{
                                marginTop: '1.5rem',
                                padding: '1.5rem',
                                background: 'white',
                                border: '2px solid #34d399',
                                borderRadius: '0.75rem',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                            }}>
                                <h5 style={{
                                    margin: '0 0 1rem 0',
                                    color: '#065f46',
                                    fontSize: '1rem',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <span style={{ fontSize: '1.3rem' }}>✔️</span> Resultados de Análisis
                                </h5>
                                <div style={{
                                    color: '#065f46',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.8',
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: 'inherit'
                                }}>
                                    {suggestedInstruments}
                                </div>
                            </div>
                        )}

                        {instError && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '0.5rem'
                            }}>
                                <p style={{ margin: 0, color: '#991b1b', fontSize: '0.9rem' }}>⚠️ {instError}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default PlanAnalisis;
