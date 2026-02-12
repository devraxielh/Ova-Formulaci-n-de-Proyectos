import React, { useState } from 'react';
import { Search, ArrowRight, HelpCircle, AlertCircle } from 'lucide-react';
import { generateResearchQuestion, evaluateResearchQuestion } from '../services/groqService';

const PreguntaInvestigacion = () => {
    const [questionType, setQuestionType] = useState('Descriptiva');
    const [researchTitle, setResearchTitle] = useState('');
    const [generatedQuestion, setGeneratedQuestion] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [evaluation, setEvaluation] = useState('');
    const [isEvaluating, setIsEvaluating] = useState(false);

    const questionTypes = [
        'Descriptiva',
        'Correlacional',
        'Explicativa',
        'Exploratoria',
        'Comparativa',
        'Predictiva',
        'Evaluativa',
        'Normativa'
    ];

    const handleGenerateQuestion = async () => {
        if (!researchTitle.trim()) {
            setError('Por favor ingresa el título de tu investigación');
            return;
        }

        setIsGenerating(true);
        setError('');
        setEvaluation(''); // Clear previous evaluation
        try {
            const question = await generateResearchQuestion(researchTitle, questionType);
            setGeneratedQuestion(question);
        } catch (error) {
            console.error('Error generating question:', error);
            setError(error.message || 'Error al generar la pregunta');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleEvaluateQuestion = async () => {
        if (!generatedQuestion) {
            setError('No hay pregunta para evaluar');
            return;
        }

        setIsEvaluating(true);
        setError('');
        try {
            const evaluationResult = await evaluateResearchQuestion(generatedQuestion, questionType);
            setEvaluation(evaluationResult);
        } catch (error) {
            console.error('Error evaluating question:', error);
            setError(error.message || 'Error al evaluar la pregunta');
        } finally {
            setIsEvaluating(false);
        }
    };

    return (
        <div style={{ maxWidth: '100%', paddingBottom: '3rem' }}>

            {/* Theory Card */}
            <div style={{
                background: 'linear-gradient(to right, #f0f9ff, #e0f2fe)',
                border: '1px solid #bae6fd',
                borderRadius: '1rem',
                padding: '2rem',
                marginBottom: '2.5rem',
                display: 'flex',
                gap: '2rem',
                alignItems: 'start'
            }}>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.5rem', color: '#0369a1', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Search size={28} />
                        ¿Qué es una Pregunta de Investigación?
                    </h2>
                    <p style={{ color: '#0c4a6e', lineHeight: '1.7', fontSize: '1.05rem', marginBottom: '1rem' }}>
                        La pregunta de investigación es el <strong>corazón de tu proyecto</strong>. Es la interrogante central que guiará todo tu trabajo investigativo y que buscarás responder mediante la recolección y análisis de datos.
                    </p>
                    <p style={{ color: '#0c4a6e', lineHeight: '1.7', fontSize: '1.05rem' }}>
                        Una buena pregunta de investigación debe ser <strong>clara, específica, viable y relevante</strong>. No debe responderse con un simple "sí" o "no", sino que debe invitar a la exploración, el análisis y la comprensión profunda de un fenómeno.
                    </p>
                </div>
                <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                    maxWidth: '320px'
                }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0284c7', marginBottom: '0.75rem', fontSize: '1rem' }}>
                        <HelpCircle size={20} /> Características Clave
                    </h4>
                    <ul style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6', paddingLeft: '1.25rem', margin: 0 }}>
                        <li style={{ marginBottom: '0.5rem' }}><strong>Clara:</strong> Fácil de entender</li>
                        <li style={{ marginBottom: '0.5rem' }}><strong>Específica:</strong> Bien delimitada</li>
                        <li style={{ marginBottom: '0.5rem' }}><strong>Viable:</strong> Posible de responder</li>
                        <li><strong>Relevante:</strong> Aporta conocimiento</li>
                    </ul>
                </div>
            </div>

            {/* Additional Theory Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>

                {/* Card: Cómo Formular */}
                <div style={{
                    background: 'linear-gradient(to bottom right, #fef3c7, #fef9e7)',
                    border: '1px solid #fde68a',
                    borderRadius: '0.75rem',
                    padding: '1.5rem'
                }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#92400e', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ArrowRight size={24} color="#f59e0b" />
                        Cómo Formular tu Pregunta
                    </h3>
                    <div style={{ color: '#78350f', fontSize: '0.95rem', lineHeight: '1.6' }}>
                        <p style={{ marginBottom: '0.75rem' }}>
                            <strong>1. Identifica el problema:</strong> ¿Qué situación necesita ser comprendida o mejorada?
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            <strong>2. Define las variables:</strong> ¿Qué elementos están involucrados? (independiente y dependiente)
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            <strong>3. Delimita el contexto:</strong> ¿Dónde, cuándo y con quiénes?
                        </p>
                        <p style={{ margin: 0 }}>
                            <strong>4. Usa palabras interrogativas:</strong> ¿Cómo?, ¿De qué manera?, ¿En qué medida?, ¿Cuál es la relación...?
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
                            ✓ <strong>Factible:</strong> Puedes responderla con los recursos disponibles
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            ✓ <strong>Delimitada:</strong> No es demasiado amplia ni vaga
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            ✓ <strong>Original:</strong> Aporta algo nuevo al conocimiento
                        </p>
                        <p style={{ margin: 0 }}>
                            ✓ <strong>Ética:</strong> No viola principios éticos de investigación
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
                            ✗ <strong>Demasiado amplia:</strong> "¿Cómo mejorar la educación?"
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            ✗ <strong>Respuesta obvia:</strong> "¿Es importante la tecnología?"
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            ✗ <strong>Sin variables claras:</strong> "¿Qué pasa con las ventas?"
                        </p>
                        <p style={{ margin: 0 }}>
                            ✗ <strong>Sí/No:</strong> "¿Funciona el sistema X?"
                        </p>
                    </div>
                </div>

                {/* Card: Transformación de Preguntas */}
                <div style={{
                    background: 'linear-gradient(to bottom right, #f5f3ff, #ede9fe)',
                    border: '1px solid #ddd6fe',
                    borderRadius: '0.75rem',
                    padding: '1.5rem'
                }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#6b21a8', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ArrowRight size={24} color="#a855f7" />
                        De Pregunta Débil a Fuerte
                    </h3>
                    <div style={{ color: '#581c87', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.6)', borderRadius: '0.5rem' }}>
                            <div style={{ color: '#dc2626', marginBottom: '0.25rem' }}>❌ Débil:</div>
                            <div style={{ fontStyle: 'italic' }}>"¿Es bueno usar apps móviles?"</div>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.6)', borderRadius: '0.5rem' }}>
                            <div style={{ color: '#16a34a', marginBottom: '0.25rem' }}>✅ Fuerte:</div>
                            <div style={{ fontStyle: 'italic' }}>"¿De qué manera el uso de apps móviles mejora la productividad laboral en empresas de servicios?"</div>
                        </div>
                    </div>
                </div>

            </div>

            <div style={{ maxWidth: '1200px', display: 'grid', gridTemplateColumns: 'minmax(300px, 1.5fr) 1fr', gap: '2rem' }}>

                {/* Main Builder */}
                <div>
                    <div className="card" style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Formulación</h2>
                        <p style={{ marginBottom: '1.5rem' }}>
                            La pregunta de investigación es la meta que buscaremos responder. Debe ser clara, concisa y viable.
                        </p>

                        {/* AI Generator Section */}
                        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'linear-gradient(to right, #f0f9ff, #e0f2fe)', borderRadius: '0.75rem', border: '1px solid #bae6fd' }}>
                            <h3 style={{ fontSize: '1.1rem', color: '#0369a1', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1.3rem' }}>✨</span> Generador con IA
                            </h3>

                            <div className="input-group" style={{ marginBottom: '1rem' }}>
                                <label>Tipo de Pregunta</label>
                                <select
                                    className="input-field"
                                    value={questionType}
                                    onChange={(e) => setQuestionType(e.target.value)}
                                    style={{ padding: '0.75rem', fontSize: '1rem' }}
                                >
                                    {questionTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="input-group" style={{ marginBottom: '1rem' }}>
                                <label>Título de tu Investigación</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Ej: Estudio sobre la viabilidad de implementación de wallet para pago de cuotas..."
                                    value={researchTitle}
                                    onChange={(e) => setResearchTitle(e.target.value)}
                                    style={{ padding: '0.75rem' }}
                                />
                            </div>

                            <button
                                onClick={handleGenerateQuestion}
                                disabled={isGenerating || !researchTitle.trim()}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem',
                                    background: isGenerating || !researchTitle.trim() ? '#94a3b8' : 'linear-gradient(to right, #0284c7, #0369a1)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    fontWeight: '600',
                                    cursor: isGenerating || !researchTitle.trim() ? 'not-allowed' : 'pointer',
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
                                        <span style={{ fontSize: '1.2rem' }}>🤖</span> Generar Pregunta con IA
                                    </>
                                )}
                            </button>

                            {generatedQuestion && (
                                <div style={{
                                    marginTop: '1rem',
                                    padding: '1rem',
                                    background: '#f0fdf4',
                                    border: '1px solid #bbf7d0',
                                    borderRadius: '0.5rem'
                                }}>
                                    <h5 style={{ margin: '0 0 0.5rem 0', color: '#166534', fontSize: '0.85rem', textTransform: 'uppercase' }}>Pregunta Generada:</h5>
                                    <p style={{ margin: '0 0 1rem 0', color: '#14532d', fontWeight: '600', fontSize: '1.05rem' }}>{generatedQuestion}</p>

                                    <button
                                        onClick={handleEvaluateQuestion}
                                        disabled={isEvaluating}
                                        style={{
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
                                                <span style={{ fontSize: '1.1rem' }}>📊</span> ¿Por qué está bien esta pregunta?
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
                                        <span style={{ fontSize: '1.3rem' }}>✅</span> Evaluación de la Pregunta
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

                    <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <HelpCircle size={18} color="#f59e0b" />
                            <h4 style={{ margin: 0, color: '#1e293b' }}>Exploratoria</h4>
                        </div>
                        <p style={{ fontSize: '0.9rem' }}>Investiga un tema poco estudiado o desde una nueva perspectiva.</p>
                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.375rem', fontStyle: 'italic', fontSize: '0.85rem' }}>
                            "¿Cómo perciben los usuarios la implementación de blockchain en servicios financieros?"
                        </div>
                    </div>

                    <div className="card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <HelpCircle size={18} color="#8b5cf6" />
                            <h4 style={{ margin: 0, color: '#1e293b' }}>Comparativa</h4>
                        </div>
                        <p style={{ fontSize: '0.9rem' }}>Compara dos o más grupos, situaciones o métodos para identificar diferencias.</p>
                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.375rem', fontStyle: 'italic', fontSize: '0.85rem' }}>
                            "¿Qué diferencias existen entre el aprendizaje presencial y virtual en estudiantes universitarios?"
                        </div>
                    </div>

                    <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <HelpCircle size={18} color="#10b981" />
                            <h4 style={{ margin: 0, color: '#1e293b' }}>Predictiva</h4>
                        </div>
                        <p style={{ fontSize: '0.9rem' }}>Anticipa comportamientos o resultados futuros basándose en datos actuales.</p>
                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.375rem', fontStyle: 'italic', fontSize: '0.85rem' }}>
                            "¿Cómo impactará la automatización en el empleo del sector manufacturero en los próximos 5 años?"
                        </div>
                    </div>

                    <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <HelpCircle size={18} color="#ef4444" />
                            <h4 style={{ margin: 0, color: '#1e293b' }}>Evaluativa</h4>
                        </div>
                        <p style={{ fontSize: '0.9rem' }}>Valora la efectividad, eficiencia o calidad de un programa, método o intervención.</p>
                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.375rem', fontStyle: 'italic', fontSize: '0.85rem' }}>
                            "¿Qué tan efectivo es el programa de capacitación X para mejorar las competencias digitales de los docentes?"
                        </div>
                    </div>

                    <div className="card" style={{ borderLeft: '4px solid #0ea5e9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <HelpCircle size={18} color="#0ea5e9" />
                            <h4 style={{ margin: 0, color: '#1e293b' }}>Normativa</h4>
                        </div>
                        <p style={{ fontSize: '0.9rem' }}>Propone cómo deberían ser las cosas o qué acciones se deberían tomar.</p>
                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.375rem', fontStyle: 'italic', fontSize: '0.85rem' }}>
                            "¿Qué estrategias deberían implementarse para reducir la deserción escolar en zonas rurales?"
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreguntaInvestigacion;
