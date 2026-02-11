import React, { useState } from 'react';
import { Target, Users, TrendingUp, BookOpen, AlertTriangle, Check, ArrowRight, MapPin, History, Globe, Sparkles, Cpu, Key } from 'lucide-react';
import { Groq } from 'groq-sdk';

const Ideacion = () => {
    // AI Generator State
    const [level, setLevel] = useState('Pregrado');
    const [program, setProgram] = useState('');
    const [interest, setInterest] = useState('');
    // Initialize with env var or empty string
    const [apiKey, setApiKey] = useState(import.meta.env.VITE_GROQ_API_KEY || '');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedIdeas, setGeneratedIdeas] = useState([]);
    const [error, setError] = useState('');

    const generateIdeas = async () => {
        if (!program || !interest) {
            setError('Por favor completa el programa y el área de interés.');
            return;
        }

        if (!apiKey) {
            setError('Necesitas una API Key de Groq para usar esta función.');
            return;
        }

        setIsGenerating(true);
        setError('');
        setGeneratedIdeas([]);

        try {
            const groq = new Groq({
                apiKey: apiKey,
                dangerouslyAllowBrowser: true // Required for client-side usage
            });

            const prompt = `Actúa como un profesor experto en metodología de la investigación.
      Genera una lista de 5 ideas de proyectos de investigación innovadores y viables para un estudiante de nivel ${level} en el programa de ${program}.
      El área de interés específica es: ${interest}.
      
      Formato de respuesta deseado:
      Genera 5 ideas. Separa cada una EXCLUSIVAMENTE con el texto "---IDEA---".
      NO uses números al inicio de la idea.
      
      Formato de respuesta deseado:
      Genera 5 ideas. Separa cada una EXCLUSIVAMENTE con el texto "---IDEA---".
      NO uses números al inicio de la idea.
      
      Para cada idea, usa ESTRICTAMENTE este formato:
      
      **Idea**: [Descripción clara de la idea]
      **Cómo hacerlo**: [Metodología o enfoque breve]
      **Posibles Limitaciones**: [Menciona 1 o 2 limitaciones principales]`;

            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                model: import.meta.env.VITE_GROQ_MODEL || "llama3-70b-8192",
                temperature: 0.7,
                max_tokens: 2048,
            });

            const content = chatCompletion.choices[0]?.message?.content || '';

            // Robust parsing using the explicit separator
            const ideasList = content.split('---IDEA---')
                .map(item => item.trim())
                .filter(item => item.length > 0 && item.includes('Idea'));

            setGeneratedIdeas(ideasList);

        } catch (err) {
            console.error(err);
            setError(`Error: ${err.message || 'Error al conectar con Groq. Verifica tu configuración.'}`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div style={{ maxWidth: '100%', paddingBottom: '3rem' }}>
            {/* Introduction Banner */}
            <div style={{
                background: 'linear-gradient(to right, #eff6ff, #f0fdf4)',
                border: '1px solid #dbeafe',
                borderRadius: '1rem',
                padding: '2rem',
                marginBottom: '2.5rem',
                display: 'flex',
                gap: '2rem',
                alignItems: 'start'
            }}>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.5rem', color: '#1e3a8a', marginBottom: '1rem' }}>
                        ¿Cómo nace un proyecto?
                    </h2>
                    <p style={{ color: '#1e40af', lineHeight: '1.7', fontSize: '1.05rem' }}>
                        Todo gran proyecto comienza con la identificación de una <strong>situación problemática</strong> o una <strong>oportunidad de mejora</strong>.
                        No basta con tener una "buena idea"; es necesario validar que responda a una necesidad real de una población específica.
                    </p>
                </div>
                <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                    maxWidth: '300px'
                }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', marginBottom: '0.5rem' }}>
                        <BookOpen size={18} /> Concepto Clave
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: '#475569' }}>
                        Un <strong>problema</strong> no es la ausencia de una solución (ej: "falta una app"), sino un estado negativo existente (ej: "baja productividad").
                    </p>
                </div>
            </div>

            {/* Primary Educational Cards */}
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#334155' }}>Fundamentos del Problema</h3>
            <div className="grid-cols-3" style={{ marginBottom: '3rem', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
                {/* Card 1: Problems vs Symptoms */}
                <div className="card" style={{ borderTop: '4px solid #ef4444' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.5rem', background: '#fef2f2', borderRadius: '0.5rem' }}>
                            <AlertTriangle size={24} color="#ef4444" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0 }}>Problema vs. Síntoma</h3>
                            <span style={{ fontSize: '0.8rem', color: '#991b1b', fontWeight: '500' }}>DIAGNÓSTICO</span>
                        </div>
                    </div>
                    <p style={{ marginBottom: '1rem' }}>
                        Para formular bien, debes ir a la raíz. Usa la técnica del <strong>Árbol de Problemas</strong>:
                    </p>
                    <ul style={{ listStyle: 'none', fontSize: '0.95rem', color: '#475569', paddingLeft: '0.5rem' }}>
                        <li style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                            <ArrowRight size={16} style={{ marginTop: '4px', flexShrink: 0 }} color="#ef4444" />
                            <strong>Raíz (Causas):</strong> ¿Por qué ocurre esto?
                        </li>
                        <li style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                            <ArrowRight size={16} style={{ marginTop: '4px', flexShrink: 0 }} color="#ef4444" />
                            <strong>Tronco (Problema Central):</strong> La situación negativa principal.
                        </li>
                        <li style={{ display: 'flex', gap: '0.5rem' }}>
                            <ArrowRight size={16} style={{ marginTop: '4px', flexShrink: 0 }} color="#ef4444" />
                            <strong>Ramas (Efectos):</strong> ¿Qué consecuencias trae?
                        </li>
                    </ul>
                </div>

                {/* Card 2: Population */}
                <div className="card" style={{ borderTop: '4px solid #3b82f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.5rem', background: '#eff6ff', borderRadius: '0.5rem' }}>
                            <Users size={24} color="#3b82f6" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0 }}>Población Afectada</h3>
                            <span style={{ fontSize: '0.8rem', color: '#1e40af', fontWeight: '500' }}>ALCANCE</span>
                        </div>
                    </div>
                    <p style={{ marginBottom: '1rem' }}>
                        Define quién sufre el problema. Entre más específico seas, más efectiva será tu solución.
                    </p>
                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
                        <strong>Ejemplo:</strong>
                        <p style={{ marginTop: '0.25rem', color: '#64748b' }}>
                            ❌ "Todos los estudiantes."<br />
                            ✅ "Estudiantes de ingeniería de primer semestre con dificultades en matemáticas."
                        </p>
                    </div>
                </div>

                {/* Card 3: Solution Feasibility */}
                <div className="card" style={{ borderTop: '4px solid #10b981' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.5rem', background: '#ecfdf5', borderRadius: '0.5rem' }}>
                            <Check size={24} color="#10b981" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0 }}>Viabilidad</h3>
                            <span style={{ fontSize: '0.8rem', color: '#065f46', fontWeight: '500' }}>SOLUCIÓN</span>
                        </div>
                    </div>
                    <p style={{ marginBottom: '1rem' }}>
                        Tu idea debe ser realizable con los recursos y tiempo disponibles. Pregúntate:
                    </p>
                    <ul style={{ listStyle: 'none', fontSize: '0.95rem', color: '#475569', paddingLeft: '0.5rem' }}>
                        <li style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                            <Check size={16} color="#10b981" /> ¿Tengo acceso a la información?
                        </li>
                        <li style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                            <Check size={16} color="#10b981" /> ¿Tengo los conocimientos técnicos?
                        </li>
                        <li style={{ display: 'flex', gap: '0.5rem' }}>
                            <Check size={16} color="#10b981" /> ¿El costo es manejable?
                        </li>
                    </ul>
                </div>
            </div>

            {/* Secondary Educational Cards */}
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#334155' }}>Contexto y Justificación</h3>
            <div className="grid-cols-3" style={{ marginBottom: '3rem', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>

                {/* Card 4: Environmental Context */}
                <div className="card" style={{ borderTop: '4px solid #f59e0b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.5rem', background: '#fffbeb', borderRadius: '0.5rem' }}>
                            <MapPin size={24} color="#f59e0b" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0 }}>Contexto</h3>
                            <span style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: '500' }}>ENTORNO</span>
                        </div>
                    </div>
                    <p style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>
                        Ningún problema existe en el vacío. Describe las características físicas, sociales o culturales del lugar.
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                        <em>¿Es una zona rural o urbana? ¿Qué recursos tecnológicos hay disponibles? ¿Existen barreras culturales?</em>
                    </p>
                </div>

                {/* Card 5: Background/State of Art */}
                <div className="card" style={{ borderTop: '4px solid #8b5cf6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.5rem', background: '#f3f0ff', borderRadius: '0.5rem' }}>
                            <History size={24} color="#8b5cf6" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0 }}>Antecedentes</h3>
                            <span style={{ fontSize: '0.8rem', color: '#6d28d9', fontWeight: '500' }}>INVESTIGACIÓN PREVIA</span>
                        </div>
                    </div>
                    <p style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>
                        Revisa qué se ha hecho antes. No necesitas "reinventar la rueda", puedes mejorarla.
                    </p>
                    <ul style={{ listStyle: 'none', fontSize: '0.9rem', color: '#475569' }}>
                        <li style={{ marginBottom: '0.5rem' }}>• ¿Qué soluciones han fallado antes?</li>
                        <li style={{ marginBottom: '0.5rem' }}>• ¿Qué soluciones existen en otros lugares?</li>
                    </ul>
                </div>

                {/* Card 6: Impact */}
                <div className="card" style={{ borderTop: '4px solid #ec4899' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.5rem', background: '#fdf2f8', borderRadius: '0.5rem' }}>
                            <Globe size={24} color="#ec4899" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0 }}>Impacto</h3>
                            <span style={{ fontSize: '0.8rem', color: '#be185d', fontWeight: '500' }}>PROYECCIÓN</span>
                        </div>
                    </div>
                    <p style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>
                        Analiza las consecuencias de tu proyecto más allá de la solución inmediata.
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '1rem', color: '#475569' }}>Social</span>
                        <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '1rem', color: '#475569' }}>Económico</span>
                        <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '1rem', color: '#475569' }}>Ambiental</span>
                    </div>
                </div>
            </div>

            {/* AI Idea Generator Section */}
            <div className="card" style={{
                padding: '2rem',
                border: '1px solid #c084fc',
                boxShadow: '0 0 20px rgba(192, 132, 252, 0.15)',
                background: 'linear-gradient(to bottom, #ffffff, #faf5ff)'
            }}>
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: '#7e22ce' }}>
                        <Sparkles size={28} className="text-purple-600" />
                        Asistente de Lluvia de Ideas IA
                    </h2>
                    <p style={{ color: '#64748b', marginTop: '0.5rem', maxWidth: '600px', marginInline: 'auto' }}>
                        ¿Necesitas inspiración? Cuéntanos qué estudias y qué te interesa, y nuestra IA generará 5 ideas de proyectos a medida.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="input-group">
                            <label>Nivel Académico</label>
                            <select
                                className="input-field"
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                                style={{ cursor: 'pointer' }}
                            >
                                <option value="Pregrado">Pregrado</option>
                                <option value="Especialización">Especialización</option>
                                <option value="Maestría">Maestría</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Programa Académico</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Ej: Ingeniería de Sistemas, Derecho..."
                                value={program}
                                onChange={(e) => setProgram(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Área de Interés Específica</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Ej: Inteligencia Artificial en medicina, Derechos humanos en zonas rurales..."
                            value={interest}
                            onChange={(e) => setInterest(e.target.value)}
                        />
                    </div>

                    {!import.meta.env.VITE_GROQ_API_KEY && (
                        <div className="input-group" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px dashed #cbd5e1' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Key size={16} /> Groq API Key
                            </label>
                            <input
                                type="password"
                                className="input-field"
                                placeholder="gsk_..."
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                style={{ background: 'white' }}
                            />
                            <small style={{ color: '#94a3b8', marginTop: '0.5rem', display: 'block' }}>
                                Tu clave no se guarda y se usa solo para esta consulta. Obtenla en <a href="https://console.groq.com" target="_blank" rel="noreferrer" style={{ color: '#7e22ce' }}>console.groq.com</a>.
                            </small>
                        </div>
                    )}

                    {error && (
                        <div style={{ padding: '1rem', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '0.5rem', color: '#ef4444', display: 'flex', gap: '0.5rem' }}>
                            <AlertTriangle size={20} />
                            {error}
                        </div>
                    )}

                    <button
                        className="btn-primary"
                        onClick={generateIdeas}
                        disabled={isGenerating}
                        style={{
                            background: isGenerating ? '#94a3b8' : 'linear-gradient(135deg, #7e22ce, #a855f7)',
                            padding: '1rem',
                            fontSize: '1.1rem',
                            marginTop: '1rem',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}
                    >
                        {isGenerating ? (
                            <>
                                <div style={{ width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                Generando Ideas...
                            </>
                        ) : (
                            <>
                                <Cpu size={20} /> Sugerir 5 Ideas
                            </>
                        )}
                    </button>
                </div>

                {/* Results Area */}
                {generatedIdeas.length > 0 && (
                    <div className="fade-in" style={{ marginTop: '3rem', borderTop: '1px solid #e2e8f0', paddingTop: '2rem' }}>
                        <h3 style={{ textAlign: 'center', marginBottom: '2rem', color: '#334155' }}>Ideas Sugeridas para Ti</h3>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {generatedIdeas.map((idea, index) => (
                                <div key={index} style={{
                                    background: 'white',
                                    padding: '1.5rem',
                                    borderRadius: '0.75rem',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                                    borderLeft: `4px solid ${['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'][index % 5]}`,
                                    display: 'flex',
                                    gap: '1rem'
                                }}>
                                    <div style={{
                                        background: '#f1f5f9',
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold',
                                        color: '#64748b',
                                        flexShrink: 0
                                    }}>
                                        {index + 1}
                                    </div>
                                    <div style={{ color: '#334155', lineHeight: '1.6', width: '100%' }}>
                                        {idea.split('\n').map((line, i) => {
                                            const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

                                            // Style for specific component lines (Action, Object, etc.) to make them look like a list
                                            if (line.trim().startsWith('*')) {
                                                return (
                                                    <div key={i} style={{ paddingLeft: '1rem', color: '#475569', fontSize: '0.95rem', display: 'flex', gap: '0.5rem' }}>
                                                        <span style={{ color: '#7e22ce' }}>•</span>
                                                        <span dangerouslySetInnerHTML={{ __html: formattedLine.replace('*', '').trim() }} />
                                                    </div>
                                                );
                                            }

                                            // Style for "How to do it" section
                                            if (line.toLowerCase().includes('cómo hacerlo') || line.toLowerCase().includes('metodología')) {
                                                return (
                                                    <div key={i} style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem', borderLeft: '3px solid #0ea5e9', fontSize: '0.9rem' }}>
                                                        <span dangerouslySetInnerHTML={{ __html: formattedLine }} />
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div key={i} style={{ marginBottom: line.trim() ? '0.25rem' : '0' }}>
                                                    <span dangerouslySetInnerHTML={{ __html: formattedLine }} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
            <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
};

export default Ideacion;
