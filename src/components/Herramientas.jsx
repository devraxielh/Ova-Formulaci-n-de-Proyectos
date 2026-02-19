import React from 'react';
import {
    Lightbulb, Type, HelpCircle, FileText, Scale,
    Target, BookOpen, ArrowRight, Sparkles, Layers, Link
} from 'lucide-react';

const tools = [
    {
        id: 'ideacion',
        icon: Lightbulb,
        color: '#f59e0b',
        bg: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
        border: '#fde68a',
        title: 'Fase de Ideación',
        description: 'Explora y delimita tu tema de investigación. Define el área de interés, la pertinencia y el alcance inicial del proyecto.',
        badge: 'Inicio'
    },
    {
        id: 'titulo',
        icon: Type,
        color: '#6366f1',
        bg: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
        border: '#c7d2fe',
        title: 'Construcción del Título',
        description: 'Genera y evalúa títulos académicos con IA. Identifica las variables independiente y dependiente de tu investigación.',
        badge: 'IA'
    },
    {
        id: 'pregunta',
        icon: HelpCircle,
        color: '#0ea5e9',
        bg: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
        border: '#bae6fd',
        title: 'Pregunta de Investigación',
        description: 'Formula preguntas descriptivas, correlacionales o causales. Evalúa su claridad, especificidad y viabilidad.',
        badge: 'IA'
    },
    {
        id: 'planteamiento',
        icon: FileText,
        color: '#d97706',
        bg: 'linear-gradient(135deg, #fffbeb, #fef9e7)',
        border: '#fde68a',
        title: 'Planteamiento del Problema',
        description: 'Describe la situación problemática, sus causas, efectos y justificación. Genera la estructura de párrafos con IA.',
        badge: 'IA'
    },
    {
        id: 'justificacion',
        icon: Scale,
        color: '#059669',
        bg: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
        border: '#6ee7b7',
        title: 'Justificación',
        description: 'Argumenta por qué tu investigación es pertinente. Incluye razones teóricas, metodológicas y prácticas con conectores lógicos.',
        badge: 'IA'
    },
    {
        id: 'objetivos',
        icon: Target,
        color: '#7c3aed',
        bg: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
        border: '#ddd6fe',
        title: 'Objetivos de Investigación',
        description: 'Define el objetivo general y hasta tres objetivos específicos con verbos en infinitivo, medibles y alcanzables.',
        badge: 'IA'
    },
    {
        id: 'introduccion',
        icon: BookOpen,
        color: '#db2777',
        bg: 'linear-gradient(135deg, #fdf2f8, #fce7f3)',
        border: '#fbcfe8',
        title: 'Introducción',
        description: 'Redacta la presentación general de tu proyecto. La IA sugiere la estructura de párrafos y conectores recomendados.',
        badge: 'IA'
    },
    {
        id: 'doi',
        icon: Link,
        color: '#0891b2',
        bg: 'linear-gradient(135deg, #ecfeff, #cffafe)',
        border: '#a5f3fc',
        title: 'DOI to Cite',
        description: 'Convierte cualquier DOI en una referencia APA 7 lista para usar. Consulta CrossRef automáticamente y copia la cita al portapapeles.',
        badge: 'API'
    },
];

const Herramientas = ({ onNavigate }) => {
    return (
        <div style={{ maxWidth: '100%', paddingBottom: '3rem' }}>

            {/* Hero Banner */}
            <div style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #0ea5e9 100%)',
                borderRadius: '1.25rem',
                padding: '2.5rem 2rem',
                marginBottom: '2.5rem',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative circles */}
                <div style={{
                    position: 'absolute', top: '-40px', right: '-40px',
                    width: '180px', height: '180px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.07)'
                }} />
                <div style={{
                    position: 'absolute', bottom: '-60px', right: '120px',
                    width: '240px', height: '240px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)'
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <p style={{ fontSize: '1.1rem', opacity: 0.9, color: 'white', lineHeight: '1.65', maxWidth: '600px', margin: 0 }}>
                        Plataforma de herramientas interactivas con Inteligencia Artificial para la formulación
                        de proyectos de investigación académica. Navega por las secciones en orden o accede
                        directamente a la herramienta que necesitas.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                        <span style={{ padding: '0.35rem 0.9rem', background: 'rgba(255,255,255,0.15)', borderRadius: '2rem', fontSize: '0.85rem', backdropFilter: 'blur(4px)' }}>
                            ✨ Generación con IA
                        </span>
                        <span style={{ padding: '0.35rem 0.9rem', background: 'rgba(255,255,255,0.15)', borderRadius: '2rem', fontSize: '0.85rem', backdropFilter: 'blur(4px)' }}>
                            📐 Normas APA
                        </span>
                        <span style={{ padding: '0.35rem 0.9rem', background: 'rgba(255,255,255,0.15)', borderRadius: '2rem', fontSize: '0.85rem', backdropFilter: 'blur(4px)' }}>
                            🔗 Conectores lógicos
                        </span>
                    </div>
                </div>
            </div>

            {/* Workflow hint */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                marginBottom: '1.5rem', color: '#64748b', fontSize: '0.9rem'
            }}>
                <Sparkles size={16} color="#6366f1" />
                <span>Flujo recomendado: sigue las herramientas en orden para construir tu proyecto paso a paso.</span>
            </div>

            {/* Tools Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.25rem'
            }}>
                {tools.map((tool, index) => {
                    const Icon = tool.icon;
                    return (
                        <button
                            key={tool.id}
                            onClick={() => onNavigate(tool.id)}
                            style={{
                                background: tool.bg,
                                border: `1px solid ${tool.border}`,
                                borderRadius: '0.875rem',
                                padding: '1.5rem',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'transform 0.18s, box-shadow 0.18s',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-3px)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {/* Step number */}
                            <div style={{
                                position: 'absolute', top: '1rem', right: '1rem',
                                width: '26px', height: '26px', borderRadius: '50%',
                                background: 'rgba(0,0,0,0.07)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.75rem', fontWeight: '700', color: tool.color
                            }}>
                                {index + 1}
                            </div>

                            {/* Icon */}
                            <div style={{
                                width: '44px', height: '44px', borderRadius: '0.625rem',
                                background: 'rgba(255,255,255,0.7)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '1rem',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
                            }}>
                                <Icon size={22} color={tool.color} />
                            </div>

                            {/* Badge */}
                            {tool.badge === 'IA' && (
                                <span style={{
                                    display: 'inline-block', marginBottom: '0.5rem',
                                    padding: '0.15rem 0.55rem',
                                    background: tool.color, color: 'white',
                                    borderRadius: '2rem', fontSize: '0.7rem', fontWeight: '700'
                                }}>✨ IA</span>
                            )}
                            {tool.badge === 'Inicio' && (
                                <span style={{
                                    display: 'inline-block', marginBottom: '0.5rem',
                                    padding: '0.15rem 0.55rem',
                                    background: '#64748b', color: 'white',
                                    borderRadius: '2rem', fontSize: '0.7rem', fontWeight: '700'
                                }}>Inicio</span>
                            )}
                            {tool.badge === 'API' && (
                                <span style={{
                                    display: 'inline-block', marginBottom: '0.5rem',
                                    padding: '0.15rem 0.55rem',
                                    background: tool.color, color: 'white',
                                    borderRadius: '2rem', fontSize: '0.7rem', fontWeight: '700'
                                }}>🔗 API</span>
                            )}

                            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', margin: '0 0 0.5rem 0' }}>
                                {tool.title}
                            </h3>
                            <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: '1.55', margin: '0 0 1rem 0' }}>
                                {tool.description}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: tool.color, fontSize: '0.85rem', fontWeight: '600' }}>
                                Ir a la herramienta <ArrowRight size={15} />
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Herramientas;
