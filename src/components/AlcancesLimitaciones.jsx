import React, { useState } from 'react';
import { Target, AlertCircle, ArrowRight, HelpCircle, MapPin, Search, Compass, ShieldAlert, Clock, Database, Users, BookX } from 'lucide-react';
import { generateAlcancesLimitacionesStructure, generateProjectLimitations } from '../services/groqService';

const AlcancesLimitaciones = () => {
    const [title, setTitle] = useState('');
    const [researchQuestion, setResearchQuestion] = useState('');
    const [structure, setStructure] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    const [limitations, setLimitations] = useState('');
    const [isGeneratingLimitations, setIsGeneratingLimitations] = useState(false);
    const [limitationsError, setLimitationsError] = useState('');

    const handleGenerateStructure = async () => {
        if (!title.trim() || !researchQuestion.trim()) {
            setError('Por favor ingresa el título y la pregunta de investigación');
            return;
        }

        setIsGenerating(true);
        setError('');
        try {
            const generatedStructure = await generateAlcancesLimitacionesStructure(title, researchQuestion);
            setStructure(generatedStructure);
        } catch (error) {
            console.error('Error generating structure:', error);
            setError(error.message || 'Error al generar la estructura');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateLimitations = async () => {
        if (!title.trim() || !researchQuestion.trim()) {
            setLimitationsError('Por favor ingresa el título y la pregunta de investigación');
            return;
        }

        setIsGeneratingLimitations(true);
        setLimitationsError('');
        try {
            const generatedLimitations = await generateProjectLimitations(title, researchQuestion);
            setLimitations(generatedLimitations);
        } catch (error) {
            console.error('Error generating limitations:', error);
            setLimitationsError(error.message || 'Error al generar limitaciones');
        } finally {
            setIsGeneratingLimitations(false);
        }
    };

    return (
        <div style={{ maxWidth: '100%', paddingBottom: '3rem' }}>

            {/* Main Theory Card */}
            <div className="responsive-banner" style={{
                background: 'linear-gradient(to right, #e0e7ff, #c7d2fe)',
                border: '1px solid #a5b4fc',
                borderRadius: '1rem',
                padding: '2rem',
                marginBottom: '2.5rem',
                display: 'flex',
                gap: '2rem',
                alignItems: 'start'
            }}>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.5rem', color: '#3730a3', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Compass size={28} />
                        Alcances y Limitaciones del Proyecto
                    </h2>
                    <p style={{ color: '#4338ca', lineHeight: '1.7', fontSize: '1.05rem', marginBottom: '1rem' }}>
                        Se debe exponer si el proyecto tiene alguna limitación y en qué forma influiría en el alcance del proyecto y/o en el desarrollo de las actividades, teniendo presente que el <strong>alcance del proyecto explora las fronteras y el máximo desarrollo</strong> que tendrá el proyecto.
                    </p>
                    <p style={{ color: '#4338ca', lineHeight: '1.7', fontSize: '1.05rem' }}>
                        Es decir, define hasta qué punto el investigador se compromete a llegar y cuál sería el impacto que realmente tendría, asegurando que el diseño del estudio sea realista, manejable y viable en el contexto dado.
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
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4f46e5', marginBottom: '0.75rem', fontSize: '1rem' }}>
                        <Target size={20} /> Puntos Clave
                    </h4>
                    <ul style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6', paddingLeft: '1.25rem', margin: 0 }}>
                        <li style={{ marginBottom: '0.5rem' }}>¿Cuáles son las <strong>fronteras</strong> del estudio?</li>
                        <li style={{ marginBottom: '0.5rem' }}>¿<strong>Hasta dónde</strong> se compromete a llegar?</li>
                        <li style={{ marginBottom: '0.5rem' }}>¿Qué <strong>impacto</strong> realista tendrá?</li>
                        <li style={{ marginBottom: '0.5rem' }}>¿Cuáles son las <strong>barreras</strong> anticipadas?</li>
                        <li>¿Cómo <strong>influirán</strong> las limitaciones en el resultado?</li>
                    </ul>
                </div>
            </div>

            {/* Types of Scopes */}
            <div className="responsive-flex-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>

                {/* Card: Alcance Temático/Teórico */}
                <div style={{
                    background: 'linear-gradient(to bottom right, #f0fdfa, #ccfbf1)',
                    border: '1px solid #99f6e4',
                    borderRadius: '0.75rem',
                    padding: '1.5rem'
                }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#0f766e', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Search size={22} color="#14b8a6" />
                        Alcance Temático y Teórico
                    </h3>
                    <p style={{ color: '#115e59', fontSize: '0.92rem', lineHeight: '1.65', margin: 0 }}>
                        Especifica qué temas, variables o teorías <strong>se incluyen y cuáles se excluyen</strong>.
                        Aclara el grado de profundidad (exploratorio, descriptivo, correlacional o explicativo)
                        y las fronteras conceptuales que enmarcan la investigación para evitar expectativas irreales.
                    </p>
                </div>

                {/* Card: Alcance Espacial/Temporal */}
                <div style={{
                    background: 'linear-gradient(to bottom right, #fff7ed, #ffedd5)',
                    border: '1px solid #fed7aa',
                    borderRadius: '0.75rem',
                    padding: '1.5rem'
                }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#c2410c', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={22} color="#f97316" />
                        Alcance Espacial, Temporal y Poblacional
                    </h3>
                    <p style={{ color: '#9a3412', fontSize: '0.92rem', lineHeight: '1.65', margin: 0 }}>
                        Determina el <strong>lugar geográfico</strong> o institución donde se realizará, el <strong>periodo de tiempo</strong>
                        que analizará el estudio, y define detalladamente la <strong>población o muestra</strong>
                        específica a la que se aplicarán los instrumentos y resultados de la investigación.
                    </p>
                </div>

            </div>

            {/* Types of Limitations */}
            <div style={{ marginBottom: '2.5rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#b91c1c', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldAlert size={24} color="#ef4444" />
                    Tipos de Limitaciones y su Impacto en el Alcance
                </h3>
                <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                    Identificar adecuadamente el tipo de limitación permite definir estrategias para que estas no invaliden los resultados de tu estudio.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>

                    {/* Metodológicas */}
                    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.25rem', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155', marginBottom: '0.75rem', fontSize: '1rem' }}>
                            <BookX size={18} color="#64748b" /> 1. Metodológicas
                        </h4>
                        <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                            <p style={{ marginBottom: '0.5rem' }}><strong>Ejemplos:</strong> Muestra pequeña o no representativa, falta de estudios previos, instrumentos no validados.</p>
                            <p style={{ margin: 0, color: '#991b1b' }}><strong>Impacto:</strong> Impide generalizar los resultados a toda la población o restringe el estudio a un nivel exploratorio en vez de correlacional/explicativo.</p>
                        </div>
                    </div>

                    {/* De Datos/Información */}
                    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.25rem', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155', marginBottom: '0.75rem', fontSize: '1rem' }}>
                            <Database size={18} color="#64748b" /> 2. De Información
                        </h4>
                        <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                            <p style={{ marginBottom: '0.5rem' }}><strong>Ejemplos:</strong> Bases de datos privadas, registros históricos incompletos, encuestas con alta tasa de rechazo.</p>
                            <p style={{ margin: 0, color: '#991b1b' }}><strong>Impacto:</strong> Obliga a ajustar el alcance temporal (evaluar menos años) o forzar un enfoque cualitativo ante la falta de métricas exactas.</p>
                        </div>
                    </div>

                    {/* Prácticas/De Recursos */}
                    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.25rem', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155', marginBottom: '0.75rem', fontSize: '1rem' }}>
                            <Users size={18} color="#64748b" /> 3. Prácticas y de Acceso
                        </h4>
                        <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                            <p style={{ marginBottom: '0.5rem' }}><strong>Ejemplos:</strong> Políticas de privacidad estrictas, negativa de una entidad pública a participar, acceso geográfico difícil o peligroso.</p>
                            <p style={{ margin: 0, color: '#991b1b' }}><strong>Impacto:</strong> El alcance espacial y poblacional se reduce (ej: de nivel municipal a un solo colegio). Obliga a usar muestreo por conveniencia.</p>
                        </div>
                    </div>

                    {/* Temporales */}
                    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.25rem', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155', marginBottom: '0.75rem', fontSize: '1rem' }}>
                            <Clock size={18} color="#64748b" /> 4. Temporales
                        </h4>
                        <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                            <p style={{ marginBottom: '0.5rem' }}><strong>Ejemplos:</strong> Tiempo asignado institucionalmente insuficiente para recolectar datos a largo plazo, demoras en aprobación ética.</p>
                            <p style={{ margin: 0, color: '#991b1b' }}><strong>Impacto:</strong> Limita el alcance temporal a un diseño transversal (un solo momento), impidiendo estudios longitudinales de seguimiento de efectos.</p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Quality & Pitfalls */}
            <div className="responsive-flex-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>

                {/* Card: Limitaciones */}
                <div style={{
                    background: 'linear-gradient(to bottom right, #fef2f2, #fee2e2)',
                    border: '1px solid #fecaca',
                    borderRadius: '0.75rem',
                    padding: '1.5rem'
                }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#b91c1c', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShieldAlert size={24} color="#ef4444" />
                        Tratamiento de las Limitaciones
                    </h3>
                    <div style={{ color: '#7f1d1d', fontSize: '0.95rem', lineHeight: '1.6' }}>
                        <p style={{ marginBottom: '0.75rem' }}>
                            <strong>Honestidad académica:</strong> Reconoce qué factores pueden dificultar el estudio (acceso a la información, disponibilidad de la muestra, tiempo, recursos metodológicos).
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            <strong>Impacto en el desarrollo:</strong> Explica en qué forma influirían estas barreras en el alcance metodológico general de las actividades.
                        </p>
                        <p style={{ margin: 0 }}>
                            <strong>Estrategias de mitigación:</strong> Por cada limitación principal que anticipas, indica cómo esperas lidiar con ella o por qué no invalidará los aportes finales de tu proyecto.
                        </p>
                    </div>
                </div>

                {/* Card: Errores Comunes */}
                <div style={{
                    background: 'linear-gradient(to bottom right, #fef3c7, #fef9e7)',
                    border: '1px solid #fde68a',
                    borderRadius: '0.75rem',
                    padding: '1.5rem'
                }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#92400e', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertCircle size={24} color="#d97706" />
                        Errores Comunes a Evitar
                    </h3>
                    <div style={{ color: '#78350f', fontSize: '0.95rem', lineHeight: '1.6' }}>
                        <p style={{ marginBottom: '0.75rem' }}>
                            ✗ <strong>Confundir excusas con limitaciones:</strong> La falta de tiempo personal o de dinero no son limitaciones académicas válidas, son problemas de gestión.
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            ✗ <strong>Prometer demasiado:</strong> Un alcance demasiado ambicioso que no concuerda con los recursos metodológicos disponibles.
                        </p>
                        <p style={{ margin: 0 }}>
                            ✗ <strong>Ocultar limitaciones metodológicas:</strong> Fingir que la muestra obtenida por conveniencia es perfectamente representativa en vez de asumirlo como límite.
                        </p>
                    </div>
                </div>

            </div>

            {/* Connectors Card - Full Width */}
            <div style={{
                background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)',
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '2.5rem'
            }}>
                <h3 style={{ fontSize: '1.2rem', color: '#334155', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ArrowRight size={24} color="#64748b" />
                    Conectores y Frases Útiles
                </h3>
                <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: '1.55' }}>
                    Utiliza estas frases de conexión para establecer claramente la frontera de tu desarrollo.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1rem' }}>

                    {/* Delimitación */}
                    <div style={{ background: 'white', borderRadius: '0.5rem', padding: '0.9rem', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                            Para Delimitar (Alcance)
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {['Hasta el punto de', 'Enmarcándose en', 'Cuyo alcance se limita a', 'Circunscrito a', 'Se centrará exclusivamente en', 'Cubrirá únicamente'].map((c, i) => (
                                <span key={i} style={{ padding: '0.25rem 0.55rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.3rem', fontSize: '0.82rem', color: '#334155' }}>{c}</span>
                            ))}
                        </div>
                    </div>

                    {/* Contraste / Limitación */}
                    <div style={{ background: 'white', borderRadius: '0.5rem', padding: '0.9rem', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                            Para Reconocer Limitaciones
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {['No obstante', 'A pesar de que', 'Sin embargo', 'Si bien es cierto', 'Debe tenerse en cuenta que', 'Esto podría restringir'].map((c, i) => (
                                <span key={i} style={{ padding: '0.25rem 0.55rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.3rem', fontSize: '0.82rem', color: '#334155' }}>{c}</span>
                            ))}
                        </div>
                    </div>

                    {/* Explicación Impacto */}
                    <div style={{ background: 'white', borderRadius: '0.5rem', padding: '0.9rem', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                            Para Explicar el Impacto
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {['Esto implica que', 'Por lo cual los hallazgos', 'Significa que los resultados', 'Lo que sugiere que', 'Se prevé que', 'De tal manera que'].map((c, i) => (
                                <span key={i} style={{ padding: '0.25rem 0.55rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.3rem', fontSize: '0.82rem', color: '#334155' }}>{c}</span>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* Main Form Section */}
            <div style={{ maxWidth: '1200px' }}>
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Generadores con Inteligencia Artificial</h2>
                    <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
                        Ingresa los datos de tu investigación para recibir recomendaciones específicas sobre las limitaciones de tu proyecto y generar la estructura sugerida.
                    </p>

                    {/* Common Inputs */}
                    <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '1.1rem', color: '#334155', marginBottom: '1rem', fontWeight: '600' }}>
                            Datos de tu Investigación
                        </h3>

                        <div className="input-group" style={{ marginBottom: '1rem' }}>
                            <label>Título del Proyecto</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Ej: Estudio sobre la viabilidad de implementación de wallet para pago de cuotas..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                style={{ padding: '0.75rem' }}
                            />
                        </div>

                        <div className="input-group" style={{ marginBottom: '0' }}>
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
                    </div>

                    <div className="responsive-flex-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

                        {/* Generator 1: Recommendations */}
                        <div style={{ padding: '1.5rem', background: 'linear-gradient(to right, #fef2f2, #fee2e2)', borderRadius: '0.75rem', border: '1px solid #fecaca' }}>
                            <h3 style={{ fontSize: '1.1rem', color: '#991b1b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1.3rem' }}>💡</span> Recomendar Limitaciones
                            </h3>

                            <button
                                onClick={handleGenerateLimitations}
                                disabled={isGeneratingLimitations || !title.trim() || !researchQuestion.trim()}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem',
                                    background: isGeneratingLimitations || !title.trim() || !researchQuestion.trim() ? '#94a3b8' : 'linear-gradient(to right, #dc2626, #991b1b)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    fontWeight: '600',
                                    cursor: isGeneratingLimitations || !title.trim() || !researchQuestion.trim() ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.95rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {isGeneratingLimitations ? (
                                    <>
                                        <span className="spinner" style={{ animation: 'spin 1s linear infinite' }}>⌛</span> Evaluando proyecto...
                                    </>
                                ) : (
                                    <>
                                        Predecir Obstáculos y Limitaciones
                                    </>
                                )}
                            </button>

                            {limitations && (
                                <div style={{
                                    marginTop: '1.25rem',
                                    padding: '1.25rem',
                                    background: 'white',
                                    border: '2px solid #fca5a5',
                                    borderRadius: '0.75rem',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                                }}>
                                    <h5 style={{ margin: '0 0 0.75rem 0', color: '#991b1b', fontSize: '0.95rem', fontWeight: '700' }}>
                                        Limitaciones Anticipadas
                                    </h5>
                                    <div style={{ color: '#7f1d1d', fontSize: '0.9rem', lineHeight: '1.7', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                                        {limitations}
                                    </div>
                                </div>
                            )}

                            {limitationsError && (
                                <div style={{ marginTop: '1rem', padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem' }}>
                                    <p style={{ margin: 0, color: '#991b1b', fontSize: '0.9rem' }}>⚠️ {limitationsError}</p>
                                </div>
                            )}
                        </div>

                        {/* Generator 2: Structure */}
                        <div style={{ padding: '1.5rem', background: 'linear-gradient(to right, #e0e7ff, #c7d2fe)', borderRadius: '0.75rem', border: '1px solid #a5b4fc' }}>
                            <h3 style={{ fontSize: '1.1rem', color: '#3730a3', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1.3rem' }}>�</span> Generar Estructura Redacción
                            </h3>

                            <button
                                onClick={handleGenerateStructure}
                                disabled={isGenerating || !title.trim() || !researchQuestion.trim()}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem',
                                    background: isGenerating || !title.trim() || !researchQuestion.trim() ? '#94a3b8' : 'linear-gradient(to right, #4f46e5, #3730a3)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    fontWeight: '600',
                                    cursor: isGenerating || !title.trim() || !researchQuestion.trim() ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.95rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {isGenerating ? (
                                    <>
                                        <span className="spinner" style={{ animation: 'spin 1s linear infinite' }}>⌛</span> Estructurando párrafos...
                                    </>
                                ) : (
                                    <>
                                        Generar Estructura Sugerida
                                    </>
                                )}
                            </button>

                            {structure && (
                                <div style={{
                                    marginTop: '1.25rem',
                                    padding: '1.25rem',
                                    background: 'white',
                                    border: '2px solid #a5b4fc',
                                    borderRadius: '0.75rem',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                                }}>
                                    <h5 style={{ margin: '0 0 0.75rem 0', color: '#3730a3', fontSize: '0.95rem', fontWeight: '700' }}>
                                        Estructura de Párrafos
                                    </h5>
                                    <div style={{ color: '#4338ca', fontSize: '0.9rem', lineHeight: '1.7', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                                        {structure}
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div style={{ marginTop: '1rem', padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem' }}>
                                    <p style={{ margin: 0, color: '#991b1b', fontSize: '0.9rem' }}>⚠️ {error}</p>
                                </div>
                            )}
                        </div>

                    </div>

                </div>
            </div>
        </div >
    );
};

export default AlcancesLimitaciones;
