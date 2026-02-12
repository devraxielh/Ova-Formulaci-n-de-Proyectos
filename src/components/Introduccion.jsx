import React, { useState } from 'react';
import { BookOpen, AlertCircle, ArrowRight, HelpCircle, Lightbulb, List } from 'lucide-react';
import { generateIntroduction } from '../services/groqService';

const Introduccion = () => {
    const [title, setTitle] = useState('');
    const [researchQuestion, setResearchQuestion] = useState('');
    const [generalObjective, setGeneralObjective] = useState('');
    const [introduction, setIntroduction] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateIntroduction = async () => {
        if (!title.trim() || !researchQuestion.trim() || !generalObjective.trim()) {
            setError('Por favor ingresa el título, la pregunta de investigación y el objetivo general');
            return;
        }

        setIsGenerating(true);
        setError('');
        try {
            const generatedIntroduction = await generateIntroduction(title, researchQuestion, generalObjective);
            setIntroduction(generatedIntroduction);
        } catch (error) {
            console.error('Error generating introduction:', error);
            setError(error.message || 'Error al generar la introducción');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div style={{ maxWidth: '100%', paddingBottom: '3rem' }}>

            {/* Main Theory Card */}
            <div style={{
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
                        <BookOpen size={28} />
                        ¿Qué es la Introducción?
                    </h2>
                    <p style={{ color: '#78350f', lineHeight: '1.7', fontSize: '1.05rem', marginBottom: '1rem' }}>
                        La introducción es la <strong>presentación general del proyecto de investigación</strong>. Debe captar el interés del lector, contextualizar el tema, presentar el problema de forma general y anticipar la estructura del documento.
                    </p>
                    <p style={{ color: '#78350f', lineHeight: '1.7', fontSize: '1.05rem' }}>
                        Una buena introducción va de lo general a lo específico, establece la relevancia del tema, y prepara al lector para comprender el desarrollo completo de la investigación.
                    </p>
                </div>
                <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                    maxWidth: '320px'
                }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d97706', marginBottom: '0.75rem', fontSize: '1rem' }}>
                        <Lightbulb size={20} /> Elementos Clave
                    </h4>
                    <ul style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6', paddingLeft: '1.25rem', margin: 0 }}>
                        <li style={{ marginBottom: '0.5rem' }}><strong>Contexto:</strong> Tema general</li>
                        <li style={{ marginBottom: '0.5rem' }}><strong>Problema:</strong> Situación a investigar</li>
                        <li style={{ marginBottom: '0.5rem' }}><strong>Justificación:</strong> Por qué es importante</li>
                        <li style={{ marginBottom: '0.5rem' }}><strong>Objetivo:</strong> Qué se busca lograr</li>
                        <li><strong>Estructura:</strong> Cómo se organiza el documento</li>
                    </ul>
                </div>
            </div>

            {/* Additional Theory Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>

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
                            <strong>1. Contexto general:</strong> Presenta el tema amplio y su importancia
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            <strong>2. Delimitación:</strong> Enfoca hacia el problema específico
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            <strong>3. Justificación:</strong> Explica por qué es relevante investigarlo
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            <strong>4. Objetivo:</strong> Presenta el propósito de la investigación
                        </p>
                        <p style={{ margin: 0 }}>
                            <strong>5. Organización:</strong> Describe brevemente la estructura del documento
                        </p>
                    </div>
                </div>

                {/* Card: Características */}
                <div style={{
                    background: 'linear-gradient(to bottom right, #f0fdf4, #dcfce7)',
                    border: '1px solid #bbf7d0',
                    borderRadius: '0.75rem',
                    padding: '1.5rem'
                }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#166534', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <HelpCircle size={24} color="#22c55e" />
                        Características Clave
                    </h3>
                    <div style={{ color: '#14532d', fontSize: '0.95rem', lineHeight: '1.6' }}>
                        <p style={{ marginBottom: '0.75rem' }}>
                            ✓ <strong>Atractiva:</strong> Capta el interés del lector desde el inicio
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            ✓ <strong>Clara:</strong> Lenguaje accesible y directo
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            ✓ <strong>Concisa:</strong> Aproximadamente 1-2 páginas
                        </p>
                        <p style={{ margin: 0 }}>
                            ✓ <strong>Coherente:</strong> Flujo lógico de ideas
                        </p>
                    </div>
                </div>

            </div>

            {/* More Theory Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>

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
                            ✗ <strong>Demasiado extensa:</strong> Más de 2-3 páginas
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            ✗ <strong>Muy técnica:</strong> Usar jerga sin explicar
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            ✗ <strong>Sin estructura:</strong> Ideas desordenadas
                        </p>
                        <p style={{ margin: 0 }}>
                            ✗ <strong>Incluir resultados:</strong> La introducción no presenta conclusiones
                        </p>
                    </div>
                </div>

                {/* Card: Consejos */}
                <div style={{
                    background: 'linear-gradient(to bottom right, #f5f3ff, #ede9fe)',
                    border: '1px solid #ddd6fe',
                    borderRadius: '0.75rem',
                    padding: '1.5rem'
                }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#6b21a8', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <List size={24} color="#a855f7" />
                        Consejos Prácticos
                    </h3>
                    <div style={{ color: '#581c87', fontSize: '0.95rem', lineHeight: '1.6' }}>
                        <p style={{ marginBottom: '0.75rem' }}>
                            • Escribe la introducción al final del proyecto
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            • Usa un lenguaje formal pero accesible
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            • Evita citas extensas en la introducción
                        </p>
                        <p style={{ margin: 0 }}>
                            • Revisa que sea coherente con el resto del documento
                        </p>
                    </div>
                </div>

            </div>

            {/* Connectors Card - Full Width */}
            <div style={{
                background: 'linear-gradient(to bottom right, #fefce8, #fef9c3)',
                border: '1px solid #fde047',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '2.5rem'
            }}>
                <h3 style={{ fontSize: '1.2rem', color: '#854d0e', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ArrowRight size={24} color="#eab308" />
                    Conectores y Estilo de Redacción (APA)
                </h3>
                <div style={{ color: '#713f12', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                    <p style={{ marginBottom: '0.75rem' }}>
                        <strong>Estilo de redacción:</strong> Se prefiere la narración en <strong>tercera persona</strong> (se realizaron las encuestas, se establecieron parámetros). También se acepta <strong>primera persona plural</strong> para múltiples autores (realizamos las encuestas) o <strong>primera persona singular</strong> para un solo autor (realicé las encuestas).
                    </p>
                    <p style={{ marginBottom: '0.75rem' }}>
                        <strong>Conectores útiles:</strong> Enriquecen la estructura y redacción del texto, uniendo elementos de forma coherente.
                    </p>
                </div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                    color: '#78350f'
                }}>
                    {['Sin embargo', 'Puesto que', 'Por consiguiente', 'Dado que', 'Teniendo en cuenta', 'Entonces', 'Simultáneamente', 'Posiblemente', 'En efecto', 'Ya que', 'Ahora bien', 'En cambio', 'En cuanto a', 'Así pues', 'Recapitulando', 'En conclusión', 'A continuación', 'Acto seguido', 'De la misma forma', 'En síntesis', 'Para concluir', 'Luego', 'Resumiendo', 'Al mismo tiempo', 'Probablemente'].map((connector, index) => (
                        <div key={index} style={{
                            padding: '0.4rem 0.6rem',
                            background: 'white',
                            borderRadius: '0.375rem',
                            border: '1px solid #fde047',
                            textAlign: 'center'
                        }}>
                            {connector}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Form Section */}
            <div style={{ maxWidth: '1200px' }}>
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Genera tu Introducción</h2>
                    <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
                        Crea una introducción profesional para tu proyecto de investigación.
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
                                placeholder="Ej: ¿Cuáles son los factores que explican la viabilidad de implementar wallet...?"
                                value={researchQuestion}
                                onChange={(e) => setResearchQuestion(e.target.value)}
                                style={{ padding: '0.75rem' }}
                            />
                        </div>

                        <div className="input-group" style={{ marginBottom: '1rem' }}>
                            <label>Objetivo General</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Ej: Evaluar la viabilidad de implementar wallet para pago de cuotas..."
                                value={generalObjective}
                                onChange={(e) => setGeneralObjective(e.target.value)}
                                style={{ padding: '0.75rem' }}
                            />
                        </div>

                        <button
                            onClick={handleGenerateIntroduction}
                            disabled={isGenerating || !title.trim() || !researchQuestion.trim() || !generalObjective.trim()}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                background: isGenerating || !title.trim() || !researchQuestion.trim() || !generalObjective.trim() ? '#94a3b8' : 'linear-gradient(to right, #d97706, #b45309)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontWeight: '600',
                                cursor: isGenerating || !title.trim() || !researchQuestion.trim() || !generalObjective.trim() ? 'not-allowed' : 'pointer',
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

                        {introduction && (
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
                                    <span style={{ fontSize: '1.3rem' }}>📊</span> Estructura de Párrafos y Conectores
                                </h5>
                                <div style={{
                                    color: '#78350f',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.8',
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: 'inherit'
                                }}>
                                    {introduction}
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

export default Introduccion;
