import React, { useState } from 'react';
import { Microscope, Activity, Eye, Sliders, Settings, GitMerge, FileSearch, LineChart, Users, Sparkles } from 'lucide-react';
import { suggestMethodology, justifyMethodology, generateMethodologyStructure, generateMethodologyPhases } from '../services/groqService';

const Metodologia = () => {
    const [title, setTitle] = useState('');
    const [enfoque, setEnfoque] = useState('Cuantitativo');
    const [tipo, setTipo] = useState('Exploratoria');
    const [diseno, setDiseno] = useState('Experimental');
    const [objetivos, setObjetivos] = useState('');
    const [explicacion, setExplicacion] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    const [showGuiaEnfoque, setShowGuiaEnfoque] = useState(false);
    const [showGuiaTipo, setShowGuiaTipo] = useState(false);
    const [showGuiaDiseno, setShowGuiaDiseno] = useState(false);

    const handleSuggest = async () => {
        if (!title.trim()) {
            setError('Por favor ingresa el título de tu investigación');
            return;
        }

        setIsGenerating(true);
        setError('');
        try {
            const result = await suggestMethodology(title);
            
            const lines = result.split('\n');
            let newEnfoque = enfoque;
            let newTipo = tipo;
            let newDiseno = diseno;
            let explanationText = '';
            let parsingExplanation = false;

            for (const line of lines) {
                if (line.startsWith('ENFOQUE:')) newEnfoque = line.replace('ENFOQUE:', '').trim();
                else if (line.startsWith('TIPO:')) newTipo = line.replace('TIPO:', '').trim();
                else if (line.startsWith('DISEÑO:')) newDiseno = line.replace('DISEÑO:', '').trim();
                else if (line.startsWith('EXPLICACION:')) {
                    parsingExplanation = true;
                    explanationText += line.replace('EXPLICACION:', '').trim() + '\n';
                }
                else if (parsingExplanation) {
                    explanationText += line + '\n';
                }
            }

            setEnfoque(newEnfoque || 'Cuantitativo');
            setTipo(newTipo || 'Exploratoria');
            setDiseno(newDiseno || 'Experimental');
            setExplicacion(explanationText.trim());
        } catch (error) {
            console.error('Error:', error);
            setError(error.message || 'Error al sugerir metodología');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleJustify = async () => {
        if (!title.trim()) {
            setError('Por favor ingresa el título de tu investigación');
            return;
        }

        setIsGenerating(true);
        setError('');
        try {
            const justification = await justifyMethodology(title, enfoque, tipo, diseno);
            setExplicacion(justification);
        } catch (error) {
            console.error('Error:', error);
            setError(error.message || 'Error al justificar metodología');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGuide = async () => {
        if (!title.trim()) {
            setError('Por favor ingresa el título de tu investigación');
            return;
        }

        setIsGenerating(true);
        setError('');
        try {
            const outline = await generateMethodologyStructure(title, enfoque, tipo, diseno);
            setExplicacion(outline);
        } catch (error) {
            console.error('Error:', error);
            setError(error.message || 'Error al generar la guía estructurada');
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePhases = async () => {
        if (!title.trim()) {
            setError('Por favor ingresa el título de tu investigación');
            return;
        }

        setIsGenerating(true);
        setError('');
        try {
            const structure = await generateMethodologyPhases(title, objetivos, enfoque, tipo, diseno);
            setExplicacion(structure);
        } catch (error) {
            console.error('Error:', error);
            setError(error.message || 'Error al generar las fases');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div style={{ maxWidth: '100%', paddingBottom: '3rem' }}>

            {/* Main Theory Card */}
            <div className="responsive-banner" style={{
                background: 'linear-gradient(to right, #ecfeff, #cffafe)',
                border: '1px solid #a5f3fc',
                borderRadius: '1rem',
                padding: '2rem',
                marginBottom: '2.5rem',
                display: 'flex',
                gap: '2rem',
                alignItems: 'start'
            }}>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.5rem', color: '#083344', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Microscope size={28} />
                        Metodología
                    </h2>
                    <p style={{ color: '#164e63', lineHeight: '1.7', fontSize: '1.05rem', marginBottom: '1rem' }}>
                        La metodología contiene en forma organizada y precisa, cómo se proyecta que será alcanzado cada uno de los objetivos específicos propuestos. <strong>Debe reflejar la estructura lógica y el rigor científico del proceso de investigación.</strong>
                    </p>
                </div>
            </div>

            {/* Enfoque de investigación Section */}
            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Eye size={24} color="#0ea5e9" /> Enfoque de investigación
            </h3>
            <p style={{ color: '#475569', lineHeight: '1.6', marginBottom: '1.5rem', fontSize: '1rem' }}>
                El enfoque de investigación determina la perspectiva epistemológica y metodológica desde la cual se abordará el problema de investigación. En términos generales, se pueden distinguir dos enfoques principales: cuantitativo y cualitativo, si bien la investigación contemporánea admite la posibilidad de un enfoque mixto que integra elementos de ambos.
            </p>

            <div className="responsive-flex-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
                {/* Cuantitativo */}
                <div style={{
                    background: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)',
                    border: '1px solid #bfdbfe',
                    borderRadius: '0.75rem',
                    padding: '1.5rem'
                }}>
                    <h4 style={{ fontSize: '1.1rem', color: '#1e3a8a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <LineChart size={20} color="#2563eb" />
                        Enfoque cuantitativo
                    </h4>
                    <p style={{ color: '#1e40af', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                        Este enfoque se sustenta en el paradigma positivista y se caracteriza por la búsqueda de la objetividad y la generalización de los resultados. Se centra en la recolección y análisis de datos numéricos, empleando métodos estadísticos para establecer relaciones causales entre variables y probar hipótesis. Su finalidad es describir, explicar y predecir fenómenos, buscando la precisión y el rigor en la medición.
                    </p>
                </div>

                {/* Cualitativo */}
                <div style={{
                    background: 'linear-gradient(to bottom right, #fdf4ff, #fae8ff)',
                    border: '1px solid #f5d0fe',
                    borderRadius: '0.75rem',
                    padding: '1.5rem'
                }}>
                    <h4 style={{ fontSize: '1.1rem', color: '#701a75', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={20} color="#c026d3" />
                        Enfoque cualitativo
                    </h4>
                    <p style={{ color: '#86198f', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                        Este enfoque se enmarca en el paradigma interpretativo y se caracteriza por la búsqueda de la comprensión profunda de los fenómenos desde la perspectiva de los actores involucrados. Se centra en la exploración de significados, experiencias y perspectivas, empleando métodos como la observación participante, entrevistas en profundidad y análisis de discurso. Su finalidad es comprender la complejidad de los fenómenos sociales en su contexto natural.
                    </p>
                </div>

                {/* Mixto */}
                <div style={{
                    background: 'linear-gradient(to bottom right, #f5f3ff, #ede9fe)',
                    border: '1px solid #ddd6fe',
                    borderRadius: '0.75rem',
                    padding: '1.5rem'
                }}>
                    <h4 style={{ fontSize: '1.1rem', color: '#4c1d95', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <GitMerge size={20} color="#7c3aed" />
                        Enfoque mixto
                    </h4>
                    <p style={{ color: '#5b21b6', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                        Este enfoque representa la integración de los enfoques cuantitativo y cualitativo, combinando sus fortalezas para obtener una comprensión más integral del fenómeno de estudio. Implica la recolección y análisis de datos tanto cuantitativos como cualitativos, así como la triangulación de métodos y perspectivas.
                    </p>
                </div>
            </div>

            {/* Toggle Button Enfoque */}
            <div style={{ marginBottom: showGuiaEnfoque ? '1rem' : '3rem' }}>
                <button
                    onClick={() => setShowGuiaEnfoque(!showGuiaEnfoque)}
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
                    {showGuiaEnfoque ? 'Ocultar Guía y Ejemplo' : 'Ver Guía y Ejemplo de Redacción'}
                </button>
            </div>

            {/* Guía de redacción Enfoque */}
            {showGuiaEnfoque && (
                <div className="fade-in" style={{
                    background: '#f8fafc',
                    borderLeft: '4px solid #0284c7',
                    padding: '1.25rem',
                    borderRadius: '0 0.5rem 0.5rem 0',
                    marginBottom: '3rem'
                }}>
                    <h5 style={{ color: '#0369a1', fontSize: '1.05rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>📝</span> ¿Cómo redactar esta subsección?
                    </h5>
                    <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 0 1rem 0' }}>
                        Inicia definiendo el enfoque elegido (Cuantitativo, Cualitativo o Mixto) citando a un autor metodológico (como Hernández Sampieri, Tamayo, etc.). Luego, elabora al menos un párrafo justificando de manera clara por qué este enfoque es el más apropiado para tu problema de investigación, cómo responde a tus objetivos y qué perspectiva te permitirá adoptar.
                    </p>
                    <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                        <strong style={{ color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>📌 Ejemplo de redacción (Enfoque Cuantitativo)</strong>
                        <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>
                            "La presente investigación se enmarcó bajo un enfoque cuantitativo, ya que, como afirma Sampieri (2014), este utiliza la recolección de datos para probar hipótesis con base en la medición numérica. En el contexto de este proyecto, este paradigma permitirá medir el impacto exacto de la nueva herramienta digital sobre el rendimiento académico de los estudiantes de tercer grado, cuantificando los resultados mediante análisis estadístico para asegurar la neutralidad y precisión del estudio."
                        </p>
                    </div>
                </div>
            )}

            {/* Tipos de investigación Section */}
            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileSearch size={24} color="#f59e0b" /> Tipos de investigación
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
                {/* Exploratoria */}
                <div className="card" style={{ borderLeft: '4px solid #fbbf24' }}>
                    <h4 style={{ fontSize: '1.1rem', color: '#b45309', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Investigación exploratoria
                    </h4>
                    <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                        Es aquella que se realiza cuando el objetivo es examinar un tema o problema de investigación poco estudiado o que no ha sido abordado antes. Se caracteriza por ser flexible y abierta, donde el investigador se adentra en un territorio desconocido con el fin de obtener una primera aproximación al fenómeno, identificar variables relevantes, formular preguntas de investigación y generar hipótesis que puedan ser posteriormente sometidas a prueba. En este tipo de investigación, la recolección de datos suele ser cualitativa, a través de entrevistas a expertos, revisión de documentos, estudios de casos, etc. El objetivo principal no es llegar a conclusiones definitivas, sino abrir caminos para futuras investigaciones.
                    </p>
                </div>

                {/* Descriptiva */}
                <div className="card" style={{ borderLeft: '4px solid #34d399' }}>
                    <h4 style={{ fontSize: '1.1rem', color: '#047857', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Investigación descriptiva
                    </h4>
                    <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                        Su propósito central es describir de forma detallada las características de un fenómeno, situación o población. Se centra en responder preguntas como ¿qué?, ¿cómo?, ¿dónde? y ¿cuándo?, proporcionando una "fotografía" precisa del objeto de estudio. Para ello, se recopilan datos cuantitativos o cualitativos mediante técnicas como encuestas, entrevistas, observación y análisis de documentos. La investigación descriptiva no busca explicar las causas de los fenómenos, sino simplemente presentar una imagen completa y detallada de los mismos.
                    </p>
                </div>

                {/* Explicativa */}
                <div className="card" style={{ borderLeft: '4px solid #f87171' }}>
                    <h4 style={{ fontSize: '1.1rem', color: '#b91c1c', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Investigación explicativa
                    </h4>
                    <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                        Busca comprender las causas y consecuencias de un fenómeno, explicando por qué ocurre y cómo se relaciona con otros factores. Va más allá de la simple descripción, buscando establecer relaciones de causa-efecto entre las variables. Se basa en la investigación descriptiva, pero incorpora análisis más profundos para identificar los factores que determinan un fenómeno y predecir su comportamiento. Puede utilizar métodos cuantitativos, como análisis estadísticos, o cualitativos, buscando patrones y conexiones en los datos.
                    </p>
                </div>
            </div>

            {/* Toggle Button Tipo */}
            <div style={{ marginBottom: showGuiaTipo ? '1rem' : '3rem' }}>
                <button
                    onClick={() => setShowGuiaTipo(!showGuiaTipo)}
                    style={{
                        background: 'white',
                        border: '1px solid #fed7aa',
                        color: '#d97706',
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
                    {showGuiaTipo ? 'Ocultar Guía y Ejemplo' : 'Ver Guía y Ejemplo de Redacción'}
                </button>
            </div>

            {/* Guía de redacción Tipo */}
            {showGuiaTipo && (
                <div className="fade-in" style={{
                    background: '#f8fafc',
                    borderLeft: '4px solid #d97706',
                    padding: '1.25rem',
                    borderRadius: '0 0.5rem 0.5rem 0',
                    marginBottom: '3rem'
                }}>
                    <h5 style={{ color: '#b45309', fontSize: '1.05rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>📝</span> ¿Cómo redactar esta subsección?
                    </h5>
                    <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 0 1rem 0' }}>
                        Empieza con la definición teórica del alcance de la investigación (Exploratoria, Descriptiva o Explicativa) apoyado en un referente de metodología de investigación. Posteriormente, argumenta cómo el nivel de profundidad de tu proyecto coincide con este tipo en específico, detallando qué dimensiones precisas del fenómeno pretendes alcanzar o describir.
                    </p>
                    <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                        <strong style={{ color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>📌 Ejemplo de redacción (Tipo Descriptivo)</strong>
                        <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>
                            "El alcance o tipo de investigación empleado en este trabajo es de carácter descriptivo. Según Hernández Sampieri et al. (2014), los estudios descriptivos buscan especificar las propiedades, características y perfiles de personas, grupos, comunidades o cualquier otro fenómeno que se someta a un análisis. En alineación con esto, el presente estudio se centrará en detallar minuciosamente las estrategias didácticas empleadas actualmente por el cuerpo docente en el aula virtual, caracterizando su frecuencia y tipología, sin buscar inicialmente establecer relaciones de causalidad causalidad entre ellas."
                        </p>
                    </div>
                </div>
            )}

            {/* Diseños de Investigación Section */}
            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings size={24} color="#6366f1" /> Diseños de Investigación
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {/* Experimental */}
                <div style={{
                    background: 'linear-gradient(to bottom right, #fdf2f8, #fce7f3)',
                    border: '1px solid #fbcfe8',
                    borderRadius: '0.75rem',
                    padding: '1.5rem'
                }}>
                    <h4 style={{ fontSize: '1.1rem', color: '#be185d', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Sliders size={20} color="#ec4899" />
                        Investigación experimental
                    </h4>
                    <p style={{ color: '#9d174d', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                        Se caracteriza por la manipulación intencional de una o más variables independientes para analizar su efecto en una o más variables dependientes, buscando establecer relaciones de causa-efecto. Para asegurar la validez de los resultados, se implementa un control riguroso de las variables extrañas y se asignan los participantes aleatoriamente a grupos (experimental y control). Un ejemplo clásico es el estudio del efecto de un nuevo medicamento, donde un grupo recibe el fármaco y otro un placebo, manteniendo constantes otros factores que puedan influir en la salud.
                    </p>
                </div>

                {/* Cuasi-experimental */}
                <div style={{
                    background: 'linear-gradient(to bottom right, #ffedd5, #ffedd5)',
                    border: '1px solid #fed7aa',
                    borderRadius: '0.75rem',
                    padding: '1.5rem'
                }}>
                    <h4 style={{ fontSize: '1.1rem', color: '#c2410c', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Activity size={20} color="#f97316" />
                        Investigación cuasi-experimental
                    </h4>
                    <p style={{ color: '#9a3412', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                        Comparte similitudes con la experimental en cuanto a la manipulación de la variable independiente, pero se diferencia por un menor control sobre las variables y la ausencia de asignación aleatoria de los participantes. Esto se debe a que, a menudo, se trabaja con grupos ya formados en contextos naturales, como escuelas o empresas. Un ejemplo sería analizar el impacto de un programa educativo en dos colegios, donde no es posible asignar aleatoriamente a los estudiantes a cada grupo.
                    </p>
                </div>

                {/* No experimental */}
                <div style={{
                    background: 'linear-gradient(to bottom right, #f1f5f9, #e2e8f0)',
                    border: '1px solid #cbd5e1',
                    borderRadius: '0.75rem',
                    padding: '1.5rem'
                }}>
                    <h4 style={{ fontSize: '1.1rem', color: '#334155', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Eye size={20} color="#64748b" />
                        Investigación no experimental
                    </h4>
                    <p style={{ color: '#1e293b', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                        En este tipo de investigación, el investigador se limita a observar y analizar los fenómenos en su contexto natural, sin intervenir ni manipular las variables. Se centra en la descripción de las variables y el análisis de sus relaciones, pero no busca establecer causalidad. Puede ser descriptiva, correlacional o comparativa, entre otras. Un ejemplo sería un estudio que analiza la relación entre el nivel de ingresos y la satisfacción laboral en una población determinada, sin intervenir en ninguno de los dos factores.
                    </p>
                </div>
            </div>

            {/* Toggle Button Diseño */}
            <div style={{ marginBottom: showGuiaDiseno ? '1rem' : '3rem' }}>
                <button
                    onClick={() => setShowGuiaDiseno(!showGuiaDiseno)}
                    style={{
                        background: 'white',
                        border: '1px solid #c7d2fe',
                        color: '#4338ca',
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
                    {showGuiaDiseno ? 'Ocultar Guía y Ejemplo' : 'Ver Guía y Ejemplo de Redacción'}
                </button>
            </div>

            {/* Guía de redacción Diseño */}
            {showGuiaDiseno && (
                <div className="fade-in" style={{
                    background: '#f8fafc',
                    borderLeft: '4px solid #4f46e5',
                    padding: '1.25rem',
                    borderRadius: '0 0.5rem 0.5rem 0',
                    marginBottom: '3rem'
                }}>
                    <h5 style={{ color: '#4338ca', fontSize: '1.05rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>📝</span> ¿Cómo redactar esta subsección?
                    </h5>
                    <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 0 1rem 0' }}>
                        Define teóricamente tu diseño (Experimental, Cuasi-experimental o No experimental). Es indispensable que detalles el procedimiento: describe paso a paso cómo se recolectarán los datos en el contexto de tu tema, especifica si existirá o no manipulación voluntaria de las variables independientes, la temporalidad (transversal o longitudinal) y cómo se ejecutará físicamente el estudio en el escenario real.
                    </p>
                    <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                        <strong style={{ color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>📌 Ejemplo de redacción (Diseño No Experimental Transversal)</strong>
                        <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>
                            "El diseño seleccionado para este trabajo corresponde a una investigación no experimental de corte transversal. Según los autores consultados, los estudios no experimentales son aquellos que se realizan sin la manipulación deliberada de variables. Por lo tanto, en este estudio no se construirán situaciones de experimentación artificial, sino que se observarán los índices y factores de deserción universitaria del período 2023 tal y como se dieron en su contexto natural dentro de la institución. Además, es transversal debido a que el proceso de recolección de los datos y aplicación de la encuesta a los docentes se efectuó en un solo instante y en un tiempo único durante el mes de mayo de dicho año."
                        </p>
                    </div>
                </div>
            )}

            {/* AI Generator Section */}
            <div style={{ maxWidth: '1200px', marginTop: '3rem' }}>
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Sugerencia y Justificación Metodológica</h2>
                    <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
                        Define el título de tu proyecto para que la IA proponga o justifique la estructura metodológica.
                    </p>

                    <div style={{ marginBottom: '1rem', padding: '1.5rem', background: 'linear-gradient(to right, #ecfeff, #cffafe)', borderRadius: '0.75rem', border: '1px solid #a5f3fc' }}>
                        <h3 style={{ fontSize: '1.1rem', color: '#083344', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Sparkles size={20} color="#0284c7" /> Asistente Metodológico con IA
                        </h3>

                        <div className="input-group" style={{ marginBottom: '1rem' }}>
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

                        <div className="input-group" style={{ marginBottom: '1rem' }}>
                            <label>
                                Objetivos Específicos
                                <span style={{ fontSize: '0.85rem', color: '#64748b', marginLeft: '0.5rem', fontWeight: 'normal' }}>(Recomendado para Generar Fases)</span>
                            </label>
                            <textarea
                                className="input-field"
                                placeholder="- Objetivo 1&#10;- Objetivo 2&#10;- Objetivo 3..."
                                value={objetivos}
                                onChange={(e) => setObjetivos(e.target.value)}
                                style={{ padding: '0.75rem', minHeight: '80px', resize: 'vertical' }}
                            />
                        </div>

                        <div className="grid-cols-3 responsive-flex-grid" style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label>Enfoque</label>
                                <select className="input-field" value={enfoque} onChange={(e) => setEnfoque(e.target.value)} style={{ padding: '0.75rem', cursor: 'pointer' }}>
                                    <option value="Cuantitativo">Cuantitativo</option>
                                    <option value="Cualitativo">Cualitativo</option>
                                    <option value="Mixto">Mixto</option>
                                </select>
                            </div>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label>Tipo de investigación</label>
                                <select className="input-field" value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ padding: '0.75rem', cursor: 'pointer' }}>
                                    <option value="Exploratoria">Exploratoria</option>
                                    <option value="Descriptiva">Descriptiva</option>
                                    <option value="Explicativa">Explicativa</option>
                                </select>
                            </div>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label>Diseño</label>
                                <select className="input-field" value={diseno} onChange={(e) => setDiseno(e.target.value)} style={{ padding: '0.75rem', cursor: 'pointer' }}>
                                    <option value="Experimental">Experimental</option>
                                    <option value="Cuasi-experimental">Cuasi-experimental</option>
                                    <option value="No experimental">No experimental</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <button
                                onClick={handleSuggest}
                                disabled={isGenerating || !title.trim()}
                                style={{
                                    flex: 1,
                                    padding: '0.875rem',
                                    background: isGenerating || !title.trim() ? '#94a3b8' : 'linear-gradient(to right, #0284c7, #0369a1)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    fontWeight: '600',
                                    cursor: isGenerating || !title.trim() ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    fontSize: '1rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {isGenerating ? 'Generando...' : '💡 Sugerir Metodología'}
                            </button>

                            <button
                                onClick={handleJustify}
                                disabled={isGenerating || !title.trim()}
                                style={{
                                    flex: 1,
                                    padding: '0.875rem',
                                    background: isGenerating || !title.trim() ? '#e2e8f0' : 'white',
                                    color: isGenerating || !title.trim() ? '#64748b' : '#0369a1',
                                    border: '1px solid',
                                    borderColor: isGenerating || !title.trim() ? '#cbd5e1' : '#0284c7',
                                    borderRadius: '0.5rem',
                                    fontWeight: '600',
                                    cursor: isGenerating || !title.trim() ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    fontSize: '1rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                📝 Justificar Selección
                            </button>

                            <button
                                onClick={handleGuide}
                                disabled={isGenerating || !title.trim()}
                                style={{
                                    flex: 1,
                                    padding: '0.875rem',
                                    background: isGenerating || !title.trim() ? '#f1f5f9' : '#f0f9ff',
                                    color: isGenerating || !title.trim() ? '#64748b' : '#0369a1',
                                    border: '1px solid',
                                    borderColor: isGenerating || !title.trim() ? '#e2e8f0' : '#bae6fd',
                                    borderRadius: '0.5rem',
                                    fontWeight: '600',
                                    cursor: isGenerating || !title.trim() ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    fontSize: '1rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                📑 Guía de Redacción
                            </button>

                            <button
                                onClick={handlePhases}
                                disabled={isGenerating || !title.trim()}
                                style={{
                                    flex: 1,
                                    padding: '0.875rem',
                                    background: isGenerating || !title.trim() ? '#f8fafc' : '#f5f3ff',
                                    color: isGenerating || !title.trim() ? '#64748b' : '#6d28d9',
                                    border: '1px solid',
                                    borderColor: isGenerating || !title.trim() ? '#e2e8f0' : '#ddd6fe',
                                    borderRadius: '0.5rem',
                                    fontWeight: '600',
                                    cursor: isGenerating || !title.trim() ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    fontSize: '1rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                📋 Generar Fases
                            </button>
                        </div>

                        {explicacion && (
                            <div className="fade-in" style={{
                                marginTop: '1.5rem',
                                padding: '1.25rem',
                                background: 'white',
                                border: '2px solid #67e8f9',
                                borderRadius: '0.75rem',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                            }}>
                                <h5 style={{
                                    margin: '0 0 1rem 0',
                                    color: '#083344',
                                    fontSize: '1rem',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <span style={{ fontSize: '1.3rem' }}>✔️</span> Resultado
                                </h5>
                                <div style={{
                                    color: '#164e63',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.8',
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: 'inherit'
                                }}>
                                    {explicacion}
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

export default Metodologia;
