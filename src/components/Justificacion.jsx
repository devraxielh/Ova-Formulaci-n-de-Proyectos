import React, { useState } from 'react';
import { FileText, AlertCircle, ArrowRight, HelpCircle, Lightbulb, BookOpen, FlaskConical, BarChart2 } from 'lucide-react';
import { generateJustificationStructure } from '../services/groqService';

const Justificacion = () => {
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
            const generatedStructure = await generateJustificationStructure(title, researchQuestion);
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
                background: 'linear-gradient(to right, #ecfdf5, #d1fae5)',
                border: '1px solid #6ee7b7',
                borderRadius: '1rem',
                padding: '2rem',
                marginBottom: '2.5rem',
                display: 'flex',
                gap: '2rem',
                alignItems: 'start'
            }}>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.5rem', color: '#065f46', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={28} />
                        ¿Qué es la Justificación?
                    </h2>
                    <p style={{ color: '#047857', lineHeight: '1.7', fontSize: '1.05rem', marginBottom: '1rem' }}>
                        La justificación responde a los interrogantes del por qué se desea conocer el tema, por qué se seleccionó y
                        por qué es significativo. Debe darle <strong>sentido al propósito</strong> por el cual se define el proyecto,
                        explicando por qué la investigación es conveniente y cuál es su peso, fundamento e impacto.
                    </p>
                    <p style={{ color: '#047857', lineHeight: '1.7', fontSize: '1.05rem' }}>
                        Además, describe a quiénes beneficia, qué reflexiones aporta a la formación y cuál es el aporte que tendrá el texto
                        a la ciencia. Las razones pueden tener componentes teóricos, metodológicos o prácticos.
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
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', marginBottom: '0.75rem', fontSize: '1rem' }}>
                        <Lightbulb size={20} /> Preguntas Clave
                    </h4>
                    <ul style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6', paddingLeft: '1.25rem', margin: 0 }}>
                        <li style={{ marginBottom: '0.5rem' }}>¿<strong>Por qué</strong> se seleccionó este tema?</li>
                        <li style={{ marginBottom: '0.5rem' }}>¿<strong>Por qué</strong> es significativo?</li>
                        <li style={{ marginBottom: '0.5rem' }}>¿<strong>A quiénes</strong> beneficia?</li>
                        <li style={{ marginBottom: '0.5rem' }}>¿Qué <strong>reflexiones</strong> aporta?</li>
                        <li>¿Cuál es el <strong>aporte a la ciencia</strong>?</li>
                    </ul>
                </div>
            </div>

            {/* Three Types of Justification */}
            <div className="responsive-flex-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>

                {/* Card: Teórica */}
                <div style={{
                    background: 'linear-gradient(to bottom right, #f0f9ff, #e0f2fe)',
                    border: '1px solid #bae6fd',
                    borderRadius: '0.75rem',
                    padding: '1.5rem'
                }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#0369a1', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BookOpen size={22} color="#0ea5e9" />
                        Justificación Teórica
                    </h3>
                    <p style={{ color: '#0c4a6e', fontSize: '0.92rem', lineHeight: '1.65', margin: 0 }}>
                        Surge cuando el estudiante {' '}
                        <strong>indaga o explora el componente conceptual</strong>, observando múltiples formas
                        de cómo se trata el problema y de cómo se plantea una posible solución.
                        Cita autores, teorías y marcos conceptuales que respaldan la investigación.
                    </p>
                </div>

                {/* Card: Metodológica */}
                <div style={{
                    background: 'linear-gradient(to bottom right, #f5f3ff, #ede9fe)',
                    border: '1px solid #ddd6fe',
                    borderRadius: '0.75rem',
                    padding: '1.5rem'
                }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#6b21a8', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FlaskConical size={22} color="#a855f7" />
                        Justificación Metodológica
                    </h3>
                    <p style={{ color: '#581c87', fontSize: '0.92rem', lineHeight: '1.65', margin: 0 }}>
                        Indaga en los <strong>posibles métodos o técnicas</strong> que sirven de aporte para el
                        respectivo estudio de problemas similares al investigado y su probable aplicación a futuro.
                        Justifica el diseño y enfoque investigativo elegido.
                    </p>
                </div>

                {/* Card: Práctica */}
                <div style={{
                    background: 'linear-gradient(to bottom right, #f0fdf4, #dcfce7)',
                    border: '1px solid #bbf7d0',
                    borderRadius: '0.75rem',
                    padding: '1.5rem'
                }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#166534', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BarChart2 size={22} color="#22c55e" />
                        Justificación Práctica
                    </h3>
                    <p style={{ color: '#14532d', fontSize: '0.92rem', lineHeight: '1.65', margin: 0 }}>
                        Permite un análisis más <strong>experimental por medio de datos cuantitativos</strong>
                        {' '}para la visualización de soluciones con casos concretos de resultados visibles.
                        Describe los beneficios tangibles y aplicaciones reales del estudio.
                    </p>
                </div>

            </div>

            {/* Quality & Pitfalls */}
            <div className="responsive-flex-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>

                {/* Card: Estructura Recomendada */}
                <div style={{
                    background: 'linear-gradient(to bottom right, #fef3c7, #fef9e7)',
                    border: '1px solid #fde68a',
                    borderRadius: '0.75rem',
                    padding: '1.5rem'
                }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#92400e', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ArrowRight size={24} color="#d97706" />
                        Estructura Recomendada
                    </h3>
                    <div style={{ color: '#78350f', fontSize: '0.95rem', lineHeight: '1.6' }}>
                        <p style={{ marginBottom: '0.75rem' }}>
                            <strong>1. Relevancia del tema:</strong> Por qué el tema merece ser investigado
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            <strong>2. Beneficiarios:</strong> A quiénes impacta directa e indirectamente
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            <strong>3. Justificación teórica:</strong> Sustento conceptual y brechas del conocimiento
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            <strong>4. Justificación metodológica:</strong> Pertinencia del enfoque y diseño
                        </p>
                        <p style={{ margin: 0 }}>
                            <strong>5. Justificación práctica:</strong> Aplicaciones concretas y aporte social
                        </p>
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
                            ✗ <strong>Sin impacto claro:</strong> No definir a quiénes beneficia
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            ✗ <strong>Muy subjetiva:</strong> Basada en opinión sin respaldo teórico
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            ✗ <strong>Sin aporte:</strong> No explicar la contribución a la ciencia
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            ✗ <strong>Repetitiva:</strong> Reiterar el planteamiento sin argumentar
                        </p>
                        <p style={{ margin: 0 }}>
                            ✗ <strong>Abuso de énfasis:</strong> Exceso de negritas, cursivas o subrayado
                        </p>
                    </div>
                </div>

            </div>

            {/* Tips Card */}
            <div style={{
                background: 'linear-gradient(to right, #f0fdf4, #dcfce7)',
                border: '1px solid #bbf7d0',
                borderRadius: '0.75rem',
                padding: '1.25rem 1.5rem',
                marginBottom: '2.5rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'start'
            }}>
                <HelpCircle size={22} color="#16a34a" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                <div style={{ fontSize: '0.9rem', color: '#14532d', lineHeight: '1.65' }}>
                    <strong style={{ display: 'block', marginBottom: '0.4rem' }}>Recomendaciones de estilo (normas APA)</strong>
                    Utilice negritas y cursivas muy moderadamente; evite el subrayado. Prefiera las comillas "inglesas" y 'sencillas'
                    en lugar de las «latinas». Use abreviaturas solo cuando un término se repita continuamente en el mismo párrafo
                    y defínalas la primera vez que aparecen.
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
                <h3 style={{ fontSize: '1.2rem', color: '#854d0e', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ArrowRight size={24} color="#eab308" />
                    Conectores Lógicos para la Justificación
                </h3>
                <p style={{ color: '#713f12', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: '1.55' }}>
                    Utilícelos para encadenar los argumentos de forma coherente. Seleccione el conector según la función que cumple dentro del párrafo.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1rem' }}>

                    {/* Causa / Razón */}
                    <div style={{ background: 'white', borderRadius: '0.5rem', padding: '0.9rem', border: '1px solid #fde047' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                            Causa / Razón
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {['Dado que', 'Puesto que', 'Ya que', 'Debido a que', 'En razón de que', 'Porque'].map((c, i) => (
                                <span key={i} style={{ padding: '0.25rem 0.55rem', background: '#fef9c3', border: '1px solid #fde68a', borderRadius: '0.3rem', fontSize: '0.82rem', color: '#78350f' }}>{c}</span>
                            ))}
                        </div>
                    </div>

                    {/* Consecuencia */}
                    <div style={{ background: 'white', borderRadius: '0.5rem', padding: '0.9rem', border: '1px solid #fde047' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                            Consecuencia / Propósito
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {['Por consiguiente', 'En consecuencia', 'De ahí que', 'Por ende', 'Con el fin de', 'Con miras a'].map((c, i) => (
                                <span key={i} style={{ padding: '0.25rem 0.55rem', background: '#fef9c3', border: '1px solid #fde68a', borderRadius: '0.3rem', fontSize: '0.82rem', color: '#78350f' }}>{c}</span>
                            ))}
                        </div>
                    </div>

                    {/* Adición / Refuerzo */}
                    <div style={{ background: 'white', borderRadius: '0.5rem', padding: '0.9rem', border: '1px solid #fde047' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                            Adición / Refuerzo
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {['Además', 'Asimismo', 'Del mismo modo', 'De igual manera', 'Sumado a lo anterior', 'Al mismo tiempo'].map((c, i) => (
                                <span key={i} style={{ padding: '0.25rem 0.55rem', background: '#fef9c3', border: '1px solid #fde68a', borderRadius: '0.3rem', fontSize: '0.82rem', color: '#78350f' }}>{c}</span>
                            ))}
                        </div>
                    </div>

                    {/* Contraste */}
                    <div style={{ background: 'white', borderRadius: '0.5rem', padding: '0.9rem', border: '1px solid #fde047' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                            Contraste / Limitación
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {['Sin embargo', 'No obstante', 'Aunque', 'A pesar de que', 'Ahora bien', 'En cambio'].map((c, i) => (
                                <span key={i} style={{ padding: '0.25rem 0.55rem', background: '#fef9c3', border: '1px solid #fde68a', borderRadius: '0.3rem', fontSize: '0.82rem', color: '#78350f' }}>{c}</span>
                            ))}
                        </div>
                    </div>

                    {/* Ejemplo / Especificación */}
                    <div style={{ background: 'white', borderRadius: '0.5rem', padding: '0.9rem', border: '1px solid #fde047' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                            Ejemplo / Especificación
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {['Por ejemplo', 'En particular', 'Específicamente', 'Tal es el caso de', 'Entre estos', 'A saber'].map((c, i) => (
                                <span key={i} style={{ padding: '0.25rem 0.55rem', background: '#fef9c3', border: '1px solid #fde68a', borderRadius: '0.3rem', fontSize: '0.82rem', color: '#78350f' }}>{c}</span>
                            ))}
                        </div>
                    </div>

                    {/* Síntesis / Cierre */}
                    <div style={{ background: 'white', borderRadius: '0.5rem', padding: '0.9rem', border: '1px solid #fde047' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                            Síntesis / Cierre
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {['En síntesis', 'En conclusión', 'En definitiva', 'Para concluir', 'En resumen', 'Finalmente'].map((c, i) => (
                                <span key={i} style={{ padding: '0.25rem 0.55rem', background: '#fef9c3', border: '1px solid #fde68a', borderRadius: '0.3rem', fontSize: '0.82rem', color: '#78350f' }}>{c}</span>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* Main Form Section */}
            <div style={{ maxWidth: '1200px' }}>
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Redacta tu Justificación</h2>
                    <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
                        Argumenta por qué tu investigación es pertinente, a quiénes beneficia y qué aporta a la ciencia.
                        Incluye razones teóricas, metodológicas y prácticas.
                    </p>

                    {/* AI Generator Section */}
                    <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'linear-gradient(to right, #ecfdf5, #d1fae5)', borderRadius: '0.75rem', border: '1px solid #6ee7b7' }}>
                        <h3 style={{ fontSize: '1.1rem', color: '#065f46', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                                background: isGenerating || !title.trim() || !researchQuestion.trim() ? '#94a3b8' : 'linear-gradient(to right, #059669, #065f46)',
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
                                border: '2px solid #6ee7b7',
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
                                    <span style={{ fontSize: '1.3rem' }}>📊</span> Estructura Sugerida
                                </h5>
                                <div style={{
                                    color: '#047857',
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

export default Justificacion;
