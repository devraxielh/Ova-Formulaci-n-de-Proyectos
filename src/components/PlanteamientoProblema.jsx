import React, { useState } from 'react';
import { FileText, AlertCircle, ArrowRight, HelpCircle, Lightbulb } from 'lucide-react';
import { generateProblemStatementStructure } from '../services/groqService';

const PlanteamientoProblema = () => {
    const [title, setTitle] = useState('');
    const [researchQuestion, setResearchQuestion] = useState('');
    const [structure, setStructure] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateStructure = async () => {
        if (!title.trim() || !researchQuestion.trim()) {
            setError('Por favor ingresa el título y la pregunta de investigación');
            return;
        }

        setIsGenerating(true);
        setError('');
        try {
            const generatedStructure = await generateProblemStatementStructure(title, researchQuestion);
            setStructure(generatedStructure);
        } catch (error) {
            console.error('Error generating structure:', error);
            setError(error.message || 'Error al generar la estructura');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div style={{ maxWidth: '100%', paddingBottom: '3rem' }}>

            {/* Main Theory Card */}
            <div className="responsive-banner" style={{
                background: 'linear-gradient(to right, #fef3c7, #fef9e7)',
                border: '1px solid #fde68a',
                borderRadius: '1rem',
                padding: '2rem',
                marginBottom: '2.5rem',
                display: 'flex',
                gap: '2rem',
                alignItems: 'start'
            }}>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.5rem', color: '#92400e', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={28} />
                        ¿Qué es el Planteamiento del Problema?
                    </h2>
                    <p style={{ color: '#78350f', lineHeight: '1.7', fontSize: '1.05rem', marginBottom: '1rem' }}>
                        El planteamiento del problema es la <strong>descripción clara y precisa de la situation problemática</strong> que motiva tu investigación. Debe explicar qué está sucediendo, por qué es importante estudiarlo y qué consecuencias tiene.
                    </p>
                    <p style={{ color: '#78350f', lineHeight: '1.7', fontSize: '1.05rem' }}>
                        Un buen planteamiento contextualiza el problema, identifica sus causas y efectos, y justifica la necesidad de investigarlo. Es la base que sustenta todo tu proyecto de investigación.
                    </p>
                </div>
                <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                    maxWidth: '320px',
                    width: '100%'
                }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d97706', marginBottom: '0.75rem', fontSize: '1rem' }}>
                        <Lightbulb size={20} /> Elementos Clave
                    </h4>
                    <ul style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6', paddingLeft: '1.25rem', margin: 0 }}>
                        <li style={{ marginBottom: '0.5rem' }}><strong>Contexto:</strong> Situación actual</li>
                        <li style={{ marginBottom: '0.5rem' }}><strong>Problema:</strong> Qué está mal</li>
                        <li style={{ marginBottom: '0.5rem' }}><strong>Causas:</strong> Por qué ocurre</li>
                        <li style={{ marginBottom: '0.5rem' }}><strong>Efectos:</strong> Qué consecuencias tiene</li>
                        <li><strong>Justificación:</strong> Por qué investigarlo</li>
                    </ul>
                </div>
            </div>

            {/* Additional Theory Cards */}
            <div className="responsive-flex-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>

                {/* Card: Estructura */}
                <div style={{
                    background: 'linear-gradient(to bottom right, #f0f9ff, #e0f2fe)',
                    border: '1px solid #bae6fd',
                    borderRadius: '0.75rem',
                    padding: '1.5rem'
                }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#0369a1', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ArrowRight size={24} color="#0ea5e9" />
                        Estructura Recomendada
                    </h3>
                    <div style={{ color: '#0c4a6e', fontSize: '0.95rem', lineHeight: '1.6' }}>
                        <p style={{ marginBottom: '0.75rem' }}>
                            <strong>1. Contextualización:</strong> Presenta el tema general y su importancia
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            <strong>2. Descripción del problema:</strong> Explica la situación problemática específica
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            <strong>3. Causas y efectos:</strong> Identifica factores y consecuencias
                        </p>
                        <p style={{ margin: 0 }}>
                            <strong>4. Justificación:</strong> Argumenta por qué es necesario investigar
                        </p>
                    </div>
                </div>

                {/* Card: Criterios de Calidad */}
                <div style={{
                    background: 'linear-gradient(to bottom right, #f0fdf4, #dcfce7)',
                    border: '1px solid #bbf7d0',
                    borderRadius: '0.75rem',
                    padding: '1.5rem'
                }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#166534', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <HelpCircle size={24} color="#22c55e" />
                        Criterios de Calidad
                    </h3>
                    <div style={{ color: '#14532d', fontSize: '0.95rem', lineHeight: '1.6' }}>
                        <p style={{ marginBottom: '0.75rem' }}>
                            ✓ <strong>Claro:</strong> Fácil de entender para cualquier lector
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            ✓ <strong>Específico:</strong> Delimitado en alcance y contexto
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            ✓ <strong>Relevante:</strong> Tiene importancia práctica o teórica
                        </p>
                        <p style={{ margin: 0 }}>
                            ✓ <strong>Fundamentado:</strong> Respaldado con datos o evidencias
                        </p>
                    </div>
                </div>

            </div>

            {/* More Theory Cards */}
            <div className="responsive-flex-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>

                {/* Card: Errores Comunes */}
                <div style={{
                    background: 'linear-gradient(to bottom right, #fef2f2, #fee2e2)',
                    border: '1px solid #fecaca',
                    borderRadius: '0.75rem',
                    padding: '1.5rem'
                }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#991b1b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertCircle size={24} color="#ef4444" />
                        Errores Comunes a Evitar
                    </h3>
                    <div style={{ color: '#7f1d1d', fontSize: '0.95rem', lineHeight: '1.6' }}>
                        <p style={{ marginBottom: '0.75rem' }}>
                            ✗ <strong>Demasiado general:</strong> No delimitar el problema específico
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            ✗ <strong>Sin evidencias:</strong> No respaldar con datos o fuentes
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            ✗ <strong>Confuso:</strong> Mezclar varios problemas sin claridad
                        </p>
                        <p style={{ margin: 0 }}>
                            ✗ <strong>Sin justificación:</strong> No explicar por qué es importante
                        </p>
                    </div>
                </div>

                {/* Card: Preguntas Guía */}
                <div style={{
                    background: 'linear-gradient(to bottom right, #f5f3ff, #ede9fe)',
                    border: '1px solid #ddd6fe',
                    borderRadius: '0.75rem',
                    padding: '1.5rem'
                }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#6b21a8', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <HelpCircle size={24} color="#a855f7" />
                        Preguntas Guía
                    </h3>
                    <div style={{ color: '#581c87', fontSize: '0.95rem', lineHeight: '1.6' }}>
                        <p style={{ marginBottom: '0.75rem' }}>
                            • ¿Cuál es la situación actual?
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            • ¿Qué está funcionando mal?
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            • ¿Por qué está ocurriendo esto?
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            • ¿Qué consecuencias tiene?
                        </p>
                        <p style={{ margin: 0 }}>
                            • ¿Por qué es importante resolverlo?
                        </p>
                    </div>
                </div>

            </div>

            {/* Main Form Section */}
            <div style={{ maxWidth: '1200px' }}>
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Redacta tu Planteamiento del Problema</h2>
                    <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
                        Describe la situación problemática que motiva tu investigación. Incluye contexto, causas, efectos y justificación.
                    </p>

                    {/* AI Generator Section */}
                    <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'linear-gradient(to right, #fef3c7, #fef9e7)', borderRadius: '0.75rem', border: '1px solid #fde68a' }}>
                        <h3 style={{ fontSize: '1.1rem', color: '#92400e', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.3rem' }}>✨</span> Generador de Estructura con IA
                        </h3>

                        <div className="input-group" style={{ marginBottom: '1rem' }}>
                            <label>Título de tu Investigación</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Ej: Estudio sobre la viabilidad de implementación de wallet para pago de cuotas..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                style={{ padding: '0.75rem' }}
                            />
                        </div>

                        <div className="input-group" style={{ marginBottom: '1rem' }}>
                            <label>Pregunta de Investigación</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Ej: ¿De qué manera la implementación de una wallet digital mejora la gestión de pagos...?"
                                value={researchQuestion}
                                onChange={(e) => setResearchQuestion(e.target.value)}
                                style={{ padding: '0.75rem' }}
                            />
                        </div>

                        <button
                            onClick={handleGenerateStructure}
                            disabled={isGenerating || !title.trim() || !researchQuestion.trim()}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                background: isGenerating || !title.trim() || !researchQuestion.trim() ? '#94a3b8' : 'linear-gradient(to right, #d97706, #b45309)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontWeight: '600',
                                cursor: isGenerating || !title.trim() || !researchQuestion.trim() ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                fontSize: '1rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            {isGenerating ? (
                                <>
                                    <span className="spinner" style={{ animation: 'spin 1s linear infinite' }}>⌛</span> Generando...
                                </>
                            ) : (
                                <>
                                    <span style={{ fontSize: '1.2rem' }}>📝</span> Generar Estructura de Párrafos
                                </>
                            )}
                        </button>

                        {structure && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '1.25rem',
                                background: 'white',
                                border: '2px solid #fde047',
                                borderRadius: '0.75rem',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                            }}>
                                <h5 style={{
                                    margin: '0 0 1rem 0',
                                    color: '#92400e',
                                    fontSize: '1rem',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <span style={{ fontSize: '1.3rem' }}>📊</span> Estructura Sugerida
                                </h5>
                                <div style={{
                                    color: '#78350f',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.8',
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: 'inherit'
                                }}>
                                    {structure}
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
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PlanteamientoProblema;
