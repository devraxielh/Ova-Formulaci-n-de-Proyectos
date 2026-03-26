import React, { useState } from 'react';
import { Users, Target, PieChart, Focus, FileSearch, Sparkles, Calculator, Info } from 'lucide-react';
import { suggestPopulations } from '../services/groqService';

const Poblacion = () => {
    const [showGuiaPoblacion, setShowGuiaPoblacion] = useState(false);
    const [showGuiaMuestra, setShowGuiaMuestra] = useState(false);

    // AI Form States
    const [title, setTitle] = useState('');
    const [suggestedPops, setSuggestedPops] = useState('');
    const [isGeneratingPops, setIsGeneratingPops] = useState(false);
    const [popsError, setPopsError] = useState('');

    // Calculator States
    const [populationType, setPopulationType] = useState('finita'); // 'finita' or 'infinita'
    const [populationSize, setPopulationSize] = useState(1000);
    const [confidenceLevel, setConfidenceLevel] = useState(1.96); 
    const [marginError, setMarginError] = useState(0.05); 
    const [showTheory, setShowTheory] = useState(false);

    // Calculation function (finite & infinite population)
    const calculateSample = () => {
        const Z = parseFloat(confidenceLevel);
        const d = parseFloat(marginError);
        const p = 0.5; // Expected proportion max variability
        const q = 0.5;

        if (populationType === 'finita') {
            if (!populationSize || populationSize <= 0) return 0;
            const N = parseInt(populationSize);
            const numerator = N * Math.pow(Z, 2) * p * q;
            const denominator = (Math.pow(d, 2) * (N - 1)) + (Math.pow(Z, 2) * p * q);
            return Math.ceil(numerator / denominator);
        } else {
            // Infinite population
            const numerator = Math.pow(Z, 2) * p * q;
            const denominator = Math.pow(d, 2);
            return Math.ceil(numerator / denominator);
        }
    };

    const finalSample = calculateSample();

    const handleSuggestPops = async () => {
        if (!title.trim()) {
            setPopsError('Por favor ingresa el título de tu investigación');
            return;
        }
        setIsGeneratingPops(true);
        setPopsError('');
        try {
            const results = await suggestPopulations(title);
            setSuggestedPops(results);
        } catch (error) {
            console.error('Error:', error);
            setPopsError(error.message || 'Error al sugerir poblaciones');
        } finally {
            setIsGeneratingPops(false);
        }
    };

    return (
        <div style={{ maxWidth: '100%', paddingBottom: '3rem' }}>

            {/* Main Theory Card */}
            <div className="responsive-banner" style={{
                background: 'linear-gradient(to right, #fcf8ff, #f3e8ff)',
                border: '1px solid #d8b4fe',
                borderRadius: '1rem',
                padding: '2rem',
                marginBottom: '2.5rem',
                display: 'flex',
                gap: '2rem',
                alignItems: 'start'
            }}>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.5rem', color: '#4c1d95', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={28} />
                        Población y Muestra
                    </h2>
                    <p style={{ color: '#5b21b6', lineHeight: '1.7', fontSize: '1.05rem', marginBottom: '1rem' }}>
                        En toda investigación empírica es fundamental definir a quién o a qué se aplicará el estudio. Identificar la <strong>población</strong> y extraer una <strong>muestra</strong> representativa asegura la validez y generalización de los resultados obtenidos.
                    </p>
                </div>
            </div>

            {/* Población Section */}
            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target size={24} color="#0ea5e9" /> Población
            </h3>

            <div style={{
                background: 'linear-gradient(to bottom right, #f0f9ff, #e0f2fe)',
                border: '1px solid #bae6fd',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '1rem'
            }}>
                <h4 style={{ fontSize: '1.1rem', color: '#0369a1', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={20} color="#0284c7" />
                    Universo de estudio
                </h4>
                <p style={{ color: '#075985', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
                    Es el universo de elementos que comparten características específicas y que son objeto de estudio en una investigación. Estas características deben estar claramente definidas para delimitar con precisión la población.
                </p>
            </div>

            {/* Toggle Button Población */}
            <div style={{ marginBottom: showGuiaPoblacion ? '1rem' : '3rem' }}>
                <button
                    onClick={() => setShowGuiaPoblacion(!showGuiaPoblacion)}
                    style={{
                        background: 'white',
                        border: '1px solid #bfdbfe',
                        color: '#0284c7',
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
                    {showGuiaPoblacion ? 'Ocultar Guía y Ejemplo' : 'Ver Guía y Ejemplo de Redacción'}
                </button>
            </div>

            {showGuiaPoblacion && (
                <div className="fade-in" style={{
                    background: '#f8fafc',
                    borderLeft: '4px solid #0284c7',
                    padding: '1.25rem',
                    borderRadius: '0 0.5rem 0.5rem 0',
                    marginBottom: '3rem'
                }}>
                    <h5 style={{ color: '#0369a1', fontSize: '1.05rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>📝</span> ¿Cómo redactar la Población?
                    </h5>
                    <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 0 1rem 0' }}>
                        Empieza definiendo conceptualmente qué es la población en la investigación. Luego, especifica cuál es tu población exacta, delimitando sus características geográficas, demográficas o temporales, de modo que quede claro quiénes o qué elementos conforman el universo orgánico de tu estudio.
                    </p>
                    <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                        <strong style={{ color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>📌 Ejemplo de redacción</strong>
                        <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>
                            "La población es el conjunto de todos los casos que concuerdan con determinadas especificaciones (Sampieri, 2014). Para efecto de este estudio, la población de interés estuvo conformada por los 850 estudiantes de bachillerato matriculados activamente durante el período académico 2023-II en la Institución Educativa Nacional, pertenecientes a los estratos socioeconómicos 2 y 3."
                        </p>
                    </div>
                </div>
            )}

            {/* Muestra Section */}
            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PieChart size={24} color="#8b5cf6" /> Muestra
            </h3>

            <div style={{
                background: 'linear-gradient(to bottom right, #f5f3ff, #ede9fe)',
                border: '1px solid #ddd6fe',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '1rem'
            }}>
                <h4 style={{ fontSize: '1.1rem', color: '#5b21b6', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Focus size={20} color="#7c3aed" />
                    Subconjunto representativo
                </h4>
                <p style={{ color: '#4c1d95', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
                    Es una porción o subconjunto de la población que se selecciona para ser estudiada. La representatividad de la muestra es crucial, ya que permite generalizar los resultados obtenidos a la población de la que fue extraída.
                </p>
            </div>

            {/* Toggle Button Muestra */}
            <div style={{ marginBottom: showGuiaMuestra ? '1rem' : '3rem' }}>
                <button
                    onClick={() => setShowGuiaMuestra(!showGuiaMuestra)}
                    style={{
                        background: 'white',
                        border: '1px solid #c4b5fd',
                        color: '#6d28d9',
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
                    {showGuiaMuestra ? 'Ocultar Guía y Ejemplo' : 'Ver Guía y Ejemplo de Redacción'}
                </button>
            </div>

            {showGuiaMuestra && (
                <div className="fade-in" style={{
                    background: '#f8fafc',
                    borderLeft: '4px solid #6d28d9',
                    padding: '1.25rem',
                    borderRadius: '0 0.5rem 0.5rem 0',
                    marginBottom: '3rem'
                }}>
                    <h5 style={{ color: '#5b21b6', fontSize: '1.05rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>📝</span> ¿Cómo redactar la Muestra?
                    </h5>
                    <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 0 1rem 0' }}>
                        Define qué es una muestra según la literatura académica. A continuación, explica el tipo de muestreo que utilizaste (probabilístico o no probabilístico) y por qué lo elegiste. Finalmente, menciona el tamaño exacto de tu muestra y los criterios de inclusión o exclusión aplicados.
                    </p>
                    <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                        <strong style={{ color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>📌 Ejemplo de redacción</strong>
                        <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>
                            "La muestra constituye un subgrupo de la población de interés sobre el cual se recolectarán los datos. Para esta investigación, se utilizó un muestreo no probabilístico por conveniencia, seleccionando a los participantes accesibles al investigador. En concreto, la muestra se delimitó a 120 estudiantes de bachillerato que cursan sus asignaturas en el laboratorio de informática, ya que eran el foco de la intervención digital. Se incluyó únicamente a aquellos que contaban con acceso regular a computadores."
                        </p>
                    </div>
                </div>
            )}

            {/* AI Generator Section para Población */}
            <div style={{ maxWidth: '1200px', marginTop: '3rem' }}>
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Sugerencia de Poblaciones con IA</h2>
                    <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
                        Si no estás seguro de a quién encuestar o estudiar, escribe el título de tu proyecto y la IA te propondrá 3 opciones viables de población para tu investigación empírica.
                    </p>

                    <div style={{ marginBottom: '1rem', padding: '1.5rem', background: 'linear-gradient(to right, #f5f3ff, #ede9fe)', borderRadius: '0.75rem', border: '1px solid #c4b5fd' }}>
                        <h3 style={{ fontSize: '1.1rem', color: '#4c1d95', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Sparkles size={20} color="#7c3aed" /> Asistente de Poblaciones
                        </h3>

                        <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                            <label>Título de tu Investigación</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Ej: Impacto de las redes sociales en el rendimiento académico..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                style={{ padding: '0.75rem' }}
                            />
                        </div>

                        <button
                            onClick={handleSuggestPops}
                            disabled={isGeneratingPops || !title.trim()}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: isGeneratingPops || !title.trim() ? '#cbd5e1' : 'linear-gradient(to right, #7c3aed, #6d28d9)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontWeight: '600',
                                cursor: isGeneratingPops || !title.trim() ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                fontSize: '1.05rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            {isGeneratingPops ? 'Analizando posibles poblaciones...' : '💡 Sugerir Poblaciones Viables'}
                        </button>

                        {suggestedPops && (
                            <div className="fade-in" style={{
                                marginTop: '1.5rem',
                                padding: '1.5rem',
                                background: 'white',
                                border: '2px solid #a78bfa',
                                borderRadius: '0.75rem',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                            }}>
                                <h5 style={{
                                    margin: '0 0 1rem 0',
                                    color: '#4c1d95',
                                    fontSize: '1rem',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <span style={{ fontSize: '1.3rem' }}>✔️</span> Opciones de Población Surgidas
                                </h5>
                                <div style={{
                                    color: '#4c1d95',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.8',
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: 'inherit'
                                }}>
                                    {suggestedPops}
                                </div>
                            </div>
                        )}

                        {popsError && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '0.5rem'
                            }}>
                                <p style={{ margin: 0, color: '#991b1b', fontSize: '0.9rem' }}>⚠️ {popsError}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Calculadora de Muestra Section */}
            <div style={{ maxWidth: '1200px', marginTop: '4rem' }}>
                <div className="card" style={{ borderTop: '4px solid #0284c7' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
                        <Calculator size={24} color="#0284c7" /> Calculadora de Tamaño de Muestra
                    </h2>
                    <p style={{ marginBottom: '2rem', color: '#64748b', lineHeight: '1.6' }}>
                        Calcula estadísticamente cuántos elementos de tu población necesitas estudiar para asegurar que tus resultados sean fiables y representativos. Soporta tanto <strong>poblaciones finitas</strong> (conoces exactamente cuántos la conforman) como <strong>poblaciones infinitas</strong> (desconocidas o muy grandes, &gt; 100.000), aplicando un nivel de heterogeneidad estándar (50%).
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        
                        {/* Controles */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    Tipo de Población
                                    <span title="¿Conoces cuántas personas o elementos hay en total?" style={{ cursor: 'help', color: '#94a3b8' }}><Info size={16} /></span>
                                </label>
                                <select className="input-field" value={populationType} onChange={(e) => setPopulationType(e.target.value)} style={{ padding: '0.75rem', cursor: 'pointer' }}>
                                    <option value="finita">Finita (Conozco la cantidad total exacta)</option>
                                    <option value="infinita">Infinita / Desconocida (No la conozco o es mayor a 100.000)</option>
                                </select>
                            </div>

                            {populationType === 'finita' && (
                                <div className="input-group fade-in" style={{ marginBottom: 0 }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        Tamaño de la Población (N)
                                        <span title="Total de elementos en tu universo de estudio" style={{ cursor: 'help', color: '#94a3b8' }}><Info size={16} /></span>
                                    </label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        min="1"
                                        value={populationSize}
                                        onChange={(e) => setPopulationSize(e.target.value)}
                                        style={{ padding: '0.75rem' }}
                                    />
                                </div>
                            )}

                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    Nivel de Confianza (Z)
                                    <span title="Nivel de certeza estadística que deseas (95% es el estándar académico)" style={{ cursor: 'help', color: '#94a3b8' }}><Info size={16} /></span>
                                </label>
                                <select className="input-field" value={confidenceLevel} onChange={(e) => setConfidenceLevel(e.target.value)} style={{ padding: '0.75rem', cursor: 'pointer' }}>
                                    <option value={1.645}>90% (Z = 1.645) - Menos exacto</option>
                                    <option value={1.96}>95% (Z = 1.96) - Estándar recomendado</option>
                                    <option value={2.576}>99% (Z = 2.576) - Alta precisión</option>
                                </select>
                            </div>

                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    Margen de Error (e)
                                    <span title="Porcentaje máximo de error que estás dispuesto a aceptar (5% es el estándar académico)" style={{ cursor: 'help', color: '#94a3b8' }}><Info size={16} /></span>
                                </label>
                                <select className="input-field" value={marginError} onChange={(e) => setMarginError(e.target.value)} style={{ padding: '0.75rem', cursor: 'pointer' }}>
                                    <option value={0.01}>1% - Tolerancia mínima (muy estricto)</option>
                                    <option value={0.03}>3% - Tolerancia baja</option>
                                    <option value={0.05}>5% - Estándar recomendado</option>
                                    <option value={0.10}>10% - Tolerancia alta (investigación piloto)</option>
                                </select>
                            </div>
                        </div>

                        {/* Resultado */}
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #bae6fd', textAlign: 'center' }}>
                            <span style={{ fontSize: '1.1rem', color: '#0369a1', fontWeight: 'bold', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Tamaño de Muestra Requerido
                            </span>
                            
                            <div style={{ fontSize: '4.5rem', fontWeight: '900', color: '#0284c7', lineHeight: '1', margin: '1rem 0', fontFamily: 'monospace' }}>
                                {isNaN(finalSample) ? 0 : new Intl.NumberFormat('es-CO').format(finalSample)}
                            </div>
                            
                            <p style={{ color: '#075985', fontSize: '1rem', lineHeight: '1.6', margin: '1rem 0 0 0' }}>
                                Si tu población es {populationType === 'finita' ? <strong>de {populationSize} elementos</strong> : <strong>infinita o de tamaño desconocido</strong>}, necesitarás recolectar datos válidos en <strong>{finalSample} individuos</strong>. Así, podrás generalizar tus hallazgos estadísticos para ese universo con un {confidenceLevel == 1.96 ? 95 : confidenceLevel == 2.576 ? 99 : 90}% de confianza y menos de un {marginError * 100}% de margen de error probabilístico.
                            </p>
                        </div>
                    </div>

                    {/* Explicación Teórica de la Fórmula */}
                    <div style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                        <button
                            onClick={() => setShowTheory(!showTheory)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#0369a1',
                                fontWeight: '600',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: 0
                            }}
                        >
                            <span style={{ transition: 'transform 0.2s', transform: showTheory ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                            ¿Qué hay detrás de este cálculo? (Teoría y Fórmula)
                        </button>

                        {showTheory && (
                            <div className="fade-in" style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}>
                                <h5 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '1rem' }}>Fórmula para Poblaciones {populationType === 'finita' ? 'Finitas (conocidas)' : 'Infinitas (desconocidas o &gt; 100k)'}</h5>
                                <div className="fade-in" style={{ background: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', fontFamily: 'monospace', fontSize: '1.2rem', color: '#0284c7' }}>
                                    {populationType === 'finita' 
                                        ? 'n = (N × Z² × p × q) / (e² × (N - 1) + Z² × p × q)'
                                        : 'n = (Z² × p × q) / e²'}
                                </div>
                                
                                <ul style={{ listStyleType: 'none', padding: 0, margin: 0, color: '#334155', lineHeight: '1.8' }}>
                                    <li style={{ marginBottom: '0.75rem' }}>
                                        <strong style={{ color: '#0f172a' }}>n (Tamaño de la Muestra):</strong> Es el resultado estadístico, el número de elementos que debes encuestar o medir experimentalmente.
                                    </li>
                                    {populationType === 'finita' && (
                                        <li className="fade-in" style={{ marginBottom: '0.75rem' }}>
                                            <strong style={{ color: '#0f172a' }}>N (Población Total):</strong> Es el universo completo medible que indicaste arriba ({populationSize}). Debido a que es una cantidad finita, se aplica un factor de corrección sobre la fórmula.
                                        </li>
                                    )}
                                    <li style={{ marginBottom: '0.75rem' }}>
                                        <strong style={{ color: '#0f172a' }}>Z (Nivel de Confianza):</strong> Es la certeza de estimación que elegiste. El valor estándar (95%) equivale en una Curva Normal a una puntuación Z de 1.96. Significa que, si repitiéramos el estudio infinitamente, en el 95% de las veces obtendríamos un resultado dentro de tu margen de error.
                                    </li>
                                    <li style={{ marginBottom: '0.75rem' }}>
                                        <strong style={{ color: '#0f172a' }}>p y q (Probabilidad):</strong> Refleja la variabilidad teórica del fenómeno. Como académicamente no la conocemos antes del estudio real, se asume matemáticamente el escenario de máxima heterogeneidad: probabilidad de ocurrencia (p = 0.5) y no ocurrencia (q = 0.5).
                                    </li>
                                    <li style={{ marginBottom: '0.75rem' }}>
                                        <strong style={{ color: '#0f172a' }}>e (Margen de Error):</strong> Es la máxima brecha de desviación estándar que toleras. Un margen de {marginError * 100}% significa que tus resultados empíricos calculados en tu muestra pueden diferir hasta un {marginError * 100}% por encima o por debajo de lo que hallaremos si encuestaramos a cada persona en el planeta.
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Poblacion;
