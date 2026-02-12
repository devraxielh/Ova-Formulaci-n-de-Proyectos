import React, { useState } from 'react';
import { Target, AlertCircle, ArrowRight, HelpCircle, Lightbulb, List } from 'lucide-react';
import { generateObjectives, evaluateObjectives } from '../services/groqService';

const Objetivos = () => {
    const [title, setTitle] = useState('');
    const [researchQuestion, setResearchQuestion] = useState('');
    const [objectives, setObjectives] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [evaluation, setEvaluation] = useState('');
    const [isEvaluating, setIsEvaluating] = useState(false);

    const verbs = [
        'Describir', 'Analizar', 'Demostrar', 'Probar', 'Comparar',
        'Definir', 'Diseñar', 'Proponer', 'Implementar', 'Crear',
        'Evaluar', 'Mejorar', 'Mensurar', 'Medir', 'Exponer',
        'Revisar', 'Explorar', 'Establecer', 'Interpretar'
    ];

    const handleGenerateObjectives = async () => {
        if (!title.trim() || !researchQuestion.trim()) {
            setError('Por favor ingresa el título y la pregunta de investigación');
            return;
        }

        setIsGenerating(true);
        setError('');
        setEvaluation('');
        try {
            const generatedObjectives = await generateObjectives(title, researchQuestion);
            setObjectives(generatedObjectives);
        } catch (error) {
            console.error('Error generating objectives:', error);
            setError(error.message || 'Error al generar los objetivos');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleEvaluateObjectives = async () => {
        if (!objectives) return;

        setIsEvaluating(true);
        setError('');
        try {
            const result = await evaluateObjectives(objectives, title, researchQuestion);
            setEvaluation(result);
        } catch (error) {
            console.error('Error evaluating objectives:', error);
            setError(error.message || 'Error al evaluar los objetivos');
        } finally {
            setIsEvaluating(false);
        }
    };

    return (
        <div style={{ maxWidth: '100%', paddingBottom: '3rem' }}>

            {/* Main Theory Card */}
            <div className="responsive-banner" style={{
                background: 'linear-gradient(to right, #dbeafe, #bfdbfe)',
                border: '1px solid #93c5fd',
                borderRadius: '1rem',
                padding: '2rem',
                marginBottom: '2.5rem',
                display: 'flex',
                gap: '2rem',
                alignItems: 'start'
            }}>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.5rem', color: '#1e40af', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Target size={28} />
                        ¿Qué son los Objetivos de Investigación?
                    </h2>
                    <p style={{ color: '#1e3a8a', lineHeight: '1.7', fontSize: '1.05rem', marginBottom: '1rem' }}>
                        Los objetivos de investigación son las <strong>metas específicas que se desean alcanzar</strong> con el proyecto. El objetivo general coincide con el título y representa la meta principal, mientras que los objetivos específicos son los pasos concretos para lograrlo.
                    </p>
                    <p style={{ color: '#1e3a8a', lineHeight: '1.7', fontSize: '1.05rem' }}>
                        Los objetivos deben redactarse en <strong>infinitivo</strong>, ser <strong>claros y medibles</strong>, y estar alineados con la pregunta de investigación. Se recomienda tener máximo 4 objetivos específicos.
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
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb', marginBottom: '0.75rem', fontSize: '1rem' }}>
                        <Lightbulb size={20} /> Características
                    </h4>
                    <ul style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6', paddingLeft: '1.25rem', margin: 0 }}>
                        <li style={{ marginBottom: '0.5rem' }}><strong>Verbo infinitivo:</strong> Termina en -ar, -er, -ir</li>
                        <li style={{ marginBottom: '0.5rem' }}><strong>Medibles:</strong> Se puede verificar su logro</li>
                        <li style={{ marginBottom: '0.5rem' }}><strong>Alcanzables:</strong> Realistas y viables</li>
                        <li><strong>Específicos:</strong> Una sola interpretación</li>
                    </ul>
                </div>
            </div>

            {/* Additional Theory Cards */}
            <div className="responsive-flex-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>

                {/* Card: Objetivo General */}
                <div style={{
                    background: 'linear-gradient(to bottom right, #f0f9ff, #e0f2fe)',
                    border: '1px solid #bae6fd',
                    borderRadius: '0.75rem',
                    padding: '1.5rem'
                }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#0369a1', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Target size={24} color="#0ea5e9" />
                        Objetivo General
                    </h3>
                    <div style={{ color: '#0c4a6e', fontSize: '0.95rem', lineHeight: '1.6' }}>
                        <p style={{ marginBottom: '0.75rem' }}>
                            <strong>Definición:</strong> Meta principal del proyecto que coincide con el título
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            <strong>Características:</strong> Amplio, global, resume el resultado final esperado
                        </p>
                        <p style={{ margin: 0 }}>
                            <strong>Ejemplo:</strong> "Evaluar la viabilidad de implementación de una wallet digital para el pago de cuotas en la Caja de Compensación de Córdoba"
                        </p>
                    </div>
                </div>

                {/* Card: Objetivos Específicos */}
                <div style={{
                    background: 'linear-gradient(to bottom right, #f0fdf4, #dcfce7)',
                    border: '1px solid #bbf7d0',
                    borderRadius: '0.75rem',
                    padding: '1.5rem'
                }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#166534', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <List size={24} color="#22c55e" />
                        Objetivos Específicos
                    </h3>
                    <div style={{ color: '#14532d', fontSize: '0.95rem', lineHeight: '1.6' }}>
                        <p style={{ marginBottom: '0.75rem' }}>
                            <strong>Definición:</strong> Pasos concretos para lograr el objetivo general
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            <strong>Cantidad:</strong> Máximo 4 objetivos específicos
                        </p>
                        <p style={{ margin: 0 }}>
                            <strong>Regla:</strong> Un solo verbo en infinitivo por objetivo, secuencia lógica
                        </p>
                    </div>
                </div>

            </div>

            {/* More Theory Cards */}
            <div className="responsive-flex-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>

                {/* Card: Verbos Comunes */}
                <div style={{
                    background: 'linear-gradient(to bottom right, #fef3c7, #fef9e7)',
                    border: '1px solid #fde68a',
                    borderRadius: '0.75rem',
                    padding: '1.5rem'
                }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#92400e', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <HelpCircle size={24} color="#f59e0b" />
                        Verbos Comunes (Taxonomía de Bloom)
                    </h3>
                    <div className="responsive-flex-grid" style={{ color: '#78350f', fontSize: '0.9rem', lineHeight: '1.5', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                        {verbs.map((verb, index) => (
                            <div key={index} style={{ padding: '0.25rem 0' }}>• {verb}</div>
                        ))}
                    </div>
                </div>

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
                            ✗ <strong>Múltiples verbos:</strong> Usar más de un verbo por objetivo
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            ✗ <strong>Ambigüedad:</strong> Objetivos sujetos a múltiples interpretaciones
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            ✗ <strong>No medibles:</strong> Objetivos que no se pueden verificar
                        </p>
                        <p style={{ margin: 0 }}>
                            ✗ <strong>Más de 4 específicos:</strong> Demasiados objetivos específicos
                        </p>
                    </div>
                </div>

            </div>

            {/* Main Form Section */}
            <div style={{ maxWidth: '1200px' }}>
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Define tus Objetivos</h2>
                    <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
                        Establece el objetivo general y los objetivos específicos de tu investigación.
                    </p>

                    {/* AI Generator Section */}
                    <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'linear-gradient(to right, #dbeafe, #bfdbfe)', borderRadius: '0.75rem', border: '1px solid #93c5fd' }}>
                        <h3 style={{ fontSize: '1.1rem', color: '#1e40af', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.3rem' }}>✨</span> Generador de Objetivos con IA
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
                            onClick={handleGenerateObjectives}
                            disabled={isGenerating || !title.trim() || !researchQuestion.trim()}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                background: isGenerating || !title.trim() || !researchQuestion.trim() ? '#94a3b8' : 'linear-gradient(to right, #2563eb, #1d4ed8)',
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
                                    <span style={{ fontSize: '1.2rem' }}>🎯</span> Generar Objetivos
                                </>
                            )}
                        </button>

                        {objectives && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '1.25rem',
                                background: 'white',
                                border: '2px solid #93c5fd',
                                borderRadius: '0.75rem',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h5 style={{
                                        margin: 0,
                                        color: '#1e40af',
                                        fontSize: '1rem',
                                        fontWeight: '700',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <span style={{ fontSize: '1.3rem' }}>📋</span> Objetivos Sugeridos
                                    </h5>
                                    <button
                                        onClick={handleEvaluateObjectives}
                                        disabled={isEvaluating}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: '#f0f9ff',
                                            color: '#0369a1',
                                            border: '1px solid #bae6fd',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            cursor: isEvaluating ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {isEvaluating ? 'Evaluando...' : '¿Por qué están bien estos objetivos?'}
                                    </button>
                                </div>
                                <div style={{
                                    color: '#1e3a8a',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.8',
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: 'inherit'
                                }}>
                                    {objectives}
                                </div>

                                {evaluation && (
                                    <div style={{
                                        marginTop: '1.25rem',
                                        padding: '1rem',
                                        background: '#f0fdf4',
                                        borderLeft: '4px solid #22c55e',
                                        borderRadius: '0.25rem'
                                    }}>
                                        <h6 style={{ margin: '0 0 0.5rem 0', color: '#166534', fontSize: '0.9rem', fontWeight: '700' }}>
                                            💡 Análisis del Experto:
                                        </h6>
                                        <p style={{ margin: 0, color: '#14532d', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                            {evaluation}
                                        </p>
                                    </div>
                                )}
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

export default Objetivos;
