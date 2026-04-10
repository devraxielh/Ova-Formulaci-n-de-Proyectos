import React, { useState } from 'react';
import { Calendar, Clock, ListOrdered, Sparkles, Key, Edit3, LayoutTemplate, Download } from 'lucide-react';
import { suggestCronograma, generateGanttData } from '../services/groqService';
import * as XLSX from 'xlsx';

const Cronograma = () => {
    const [showGuia, setShowGuia] = useState(false);

    // AI Form States
    const [title, setTitle] = useState('');
    const [objetivos, setObjetivos] = useState('');
    const [suggestedCronograma, setSuggestedCronograma] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Gantt AI States
    const [ganttObjetivo, setGanttObjetivo] = useState('');
    const [ganttUnidad, setGanttUnidad] = useState('mensual');
    const [ganttPeriodos, setGanttPeriodos] = useState(6);
    const [addedObjectives, setAddedObjectives] = useState([]);
    const [ganttPeriodoInicio, setGanttPeriodoInicio] = useState(1);
    const [isGeneratingGantt, setIsGeneratingGantt] = useState(false);
    const [ganttError, setGanttError] = useState('');

    const handleAddObjective = async () => {
        if (!ganttObjetivo.trim()) {
            setGanttError('Por favor ingresa un objetivo específico para añadir al cronograma.');
            return;
        }
        setIsGeneratingGantt(true);
        setGanttError('');
        
        try {
            const results = await generateGanttData(ganttObjetivo, ganttUnidad, ganttPeriodos, ganttPeriodoInicio);
            
            // Add the new objective grouping
            const newObjectiveGroup = {
                id: Date.now(),
                title: ganttObjetivo.trim(),
                activities: results
            };

            setAddedObjectives([...addedObjectives, newObjectiveGroup]);
            setGanttObjetivo(''); // Clear input for the next one
            
            // Auto increment start period depending on generated activities length roughly
            // but for simplicity let's just leave the user to change it, or set to 1.
            // Leaving it exactly as is to remember their choice.

        } catch (error) {
            console.error('Error Gantt:', error);
            setGanttError(error.message || 'Error al generar las actividades. Intenta nuevamente.');
        } finally {
            setIsGeneratingGantt(false);
        }
    };

    const handleRemoveObjective = (idToRemove) => {
        setAddedObjectives(addedObjectives.filter(obj => obj.id !== idToRemove));
    };

    const handleExportExcel = () => {
        if (addedObjectives.length === 0) return;

        const dt = [];

        const headers = ['Objetivos y Actividades Específicas'];
        for (let i = 1; i <= ganttPeriodos; i++) {
            const u = ganttUnidad === 'semanal' ? 'Sem' : ganttUnidad === 'mensual' ? 'Mes' : ganttUnidad === 'trimestral' ? 'Trim' : 'Smtre';
            headers.push(`${u} ${i}`);
        }
        dt.push(headers);

        addedObjectives.forEach((objGroup, groupIndex) => {
            const objRow = [`Objetivo ${groupIndex + 1}: ${objGroup.title}`];
            for (let i = 1; i <= ganttPeriodos; i++) {
                objRow.push('');
            }
            dt.push(objRow);

            objGroup.activities.forEach((item, actIndex) => {
                const actCode = `OE${groupIndex + 1}A${actIndex + 1}`;
                const row = [`${actCode} - ${item.actividad}`];
                for (let i = 1; i <= ganttPeriodos; i++) {
                    const isSpanning = i >= item.inicio && i <= (item.inicio + item.duracion - 1);
                    row.push(isSpanning ? 'X' : '');
                }
                dt.push(row);
            });
        });

        const ws = XLSX.utils.aoa_to_sheet(dt);

        const wscols = [{ wch: 60 }]; 
        for (let i = 1; i <= ganttPeriodos; i++) {
            wscols.push({ wch: 8 });
        }
        ws['!cols'] = wscols;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Cronograma");

        XLSX.writeFile(wb, "Cronograma_Consolidado.xlsx");
    };

    const handleSuggestCronograma = async () => {
        if (!title.trim()) {
            setErrorMsg('Por favor ingresa el título de tu investigación');
            return;
        }
        setIsGenerating(true);
        setErrorMsg('');
        try {
            const results = await suggestCronograma(title, objetivos);
            setSuggestedCronograma(results);
        } catch (error) {
            console.error('Error:', error);
            setErrorMsg(error.message || 'Error al sugerir el cronograma');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div style={{ maxWidth: '100%', paddingBottom: '3rem' }}>

            {/* Main Theory Card */}
            <div className="responsive-banner" style={{
                background: 'linear-gradient(to right, #fff1f2, #ffe4e6)',
                border: '1px solid #fecdd3',
                borderRadius: '1rem',
                padding: '2rem',
                marginBottom: '2.5rem',
                display: 'flex',
                gap: '2rem',
                alignItems: 'start'
            }}>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.5rem', color: '#9f1239', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={28} />
                        Cronograma
                    </h2>
                    <p style={{ color: '#881337', lineHeight: '1.7', fontSize: '1.05rem', marginBottom: '1rem' }}>
                        El cronograma es una herramienta esencial que organiza en el tiempo todas las actividades necesarias para llevar a cabo el estudio. Se trata de un plan detallado que establece las fechas de inicio y fin de cada etapa, permitiendo al investigador administrar el tiempo de manera eficiente y cumplir con los objetivos propuestos.
                    </p>
                </div>
            </div>

            {/* Componentes Clave Section */}
            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ListOrdered size={24} color="#e11d48" /> Componentes de un Cronograma
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <h5 style={{ color: '#be123c', fontSize: '1.05rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        📅 Fases o Etapas
                    </h5>
                    <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
                        Agrupación lógica de las actividades (ej. Fase de Diseño, Fase de Recolección de Datos, Fase Analítica). Suele estar alineada con los objetivos específicos.
                    </p>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <h5 style={{ color: '#c2410c', fontSize: '1.05rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        🛠️ Actividades Específicas
                    </h5>
                    <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
                        Acciones concretas a realizar, como "Diseño del cuestionario", "Aplicación de encuestas", o "Redacción del informe final". Deben ser realizables y claras.
                    </p>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <h5 style={{ color: '#0f766e', fontSize: '1.05rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        ⏱️ Tiempos (Duración)
                    </h5>
                    <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
                        Medición del plazo asignado a cada tarea (semanas o meses). Es importante ser realista, contemplando posibles retrasos e imprevistos en la investigación.
                    </p>
                </div>
            </div>

            {/* Toggle Button Guía */}
            <div style={{ marginBottom: showGuia ? '1rem' : '3rem' }}>
                <button
                    onClick={() => setShowGuia(!showGuia)}
                    style={{
                        background: 'white',
                        border: '1px solid #fda4af',
                        color: '#e11d48',
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
                    {showGuia ? 'Ocultar Guía y Ejemplo' : 'Ver Guía y Ejemplo de Redacción'}
                </button>
            </div>

            {showGuia && (
                <div className="fade-in" style={{
                    background: '#f8fafc',
                    borderLeft: '4px solid #e11d48',
                    padding: '1.25rem',
                    borderRadius: '0 0.5rem 0.5rem 0',
                    marginBottom: '3rem'
                }}>
                    <h5 style={{ color: '#9f1239', fontSize: '1.05rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>📝</span> ¿Cómo se presenta el Cronograma en el documento?
                    </h5>
                    <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 0 1rem 0' }}>
                        Normalmente, se redacta un breve párrafo introductorio justificando que las actividades están distribuidas para cumplirse dentro del semestre o año establecido. Luego, <strong>se incluye una Tabla tipo Diagrama de Gantt</strong> donde las filas son las actividades y las columnas los meses o semanas marcadas con "X" o bloques de color.
                    </p>
                    <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                        <strong style={{ color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>📌 Ejemplo de párrafo introductorio</strong>
                        <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>
                            "Para el desarrollo de la presente investigación, se ha diseñado un cronograma estructurado en cuatro fases (diseño, recolección, análisis y presentación), distribuidas a lo largo de un período de 6 meses. La Tabla 1 ilustra mediante un Diagrama de Gantt la secuencialidad de las actividades propuestas para dar cumplimiento a los objetivos específicos..."
                        </p>
                    </div>
                </div>
            )}

            {/* AI Generator Section para Cronograma */}
            <div style={{ maxWidth: '1200px', marginTop: '3rem' }}>
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Asistente Generador de Cronograma (IA)</h2>
                    <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
                        La Inteligencia Artificial puede estructurar lógicamente las fases y actividades de tu proyecto, estimando tiempos realistas en función del título y los objetivos de tu investigación.
                    </p>

                    <div style={{ marginBottom: '1rem', padding: '1.5rem', background: 'linear-gradient(to right, #fff1f2, #ffe4e6)', borderRadius: '0.75rem', border: '1px solid #fecdd3' }}>
                        <h3 style={{ fontSize: '1.1rem', color: '#be123c', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Sparkles size={20} color="#e11d48" /> Consultor de Tiempos
                        </h3>

                        <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                            <label>Título de la Investigación</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Ej: Implementación de inteligencia artificial en pequeñas empresas..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                style={{ padding: '0.75rem' }}
                            />
                        </div>

                        <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                            <label>Objetivos (Opcional)</label>
                            <textarea
                                className="input-field"
                                placeholder="Pega aquí tus objetivos para obtener actividades más precisas..."
                                value={objetivos}
                                onChange={(e) => setObjetivos(e.target.value)}
                                rows="3"
                                style={{
                                    padding: '0.75rem',
                                    resize: 'vertical',
                                    minHeight: '80px'
                                }}
                            />
                        </div>

                        <button
                            onClick={handleSuggestCronograma}
                            disabled={isGenerating || !title.trim()}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: isGenerating || !title.trim() ? '#cbd5e1' : 'linear-gradient(to right, #e11d48, #be123c)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontWeight: '600',
                                cursor: isGenerating || !title.trim() ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                fontSize: '1.05rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            {isGenerating ? 'Estructurando fases y tiempos...' : '💡 Generar Propuesta de Cronograma'}
                        </button>

                        {suggestedCronograma && (
                            <div className="fade-in" style={{
                                marginTop: '1.5rem',
                                padding: '1.5rem',
                                background: 'white',
                                border: '2px solid #fb7185',
                                borderRadius: '0.75rem',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                            }}>
                                <h5 style={{
                                    margin: '0 0 1rem 0',
                                    color: '#be123c',
                                    fontSize: '1rem',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <span style={{ fontSize: '1.3rem' }}>✔️</span> Estructura Sugerida
                                </h5>
                                <div style={{
                                    color: '#4c0519',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.8',
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: 'inherit'
                                }}>
                                    {suggestedCronograma}
                                </div>
                            </div>
                        )}

                        {errorMsg && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '0.5rem'
                            }}>
                                <p style={{ margin: 0, color: '#991b1b', fontSize: '0.9rem' }}>⚠️ {errorMsg}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* AI Gantt Section */}
            <div style={{ maxWidth: '1200px', marginTop: '3rem', marginBottom: '3rem' }}>
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Generador de Diagrama de Gantt (IA)</h2>
                    <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
                        Introduce un objetivo específico y la IA desglosará las actividades necesarias, graficándolas en un Diagrama de Gantt interactivo según la duración que elijas.
                    </p>

                    <div style={{ marginBottom: '1rem', padding: '1.5rem', background: 'linear-gradient(to right, #f0fdfa, #ccfbf1)', borderRadius: '0.75rem', border: '1px solid #99f6e4' }}>
                        <h3 style={{ fontSize: '1.1rem', color: '#0f766e', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <LayoutTemplate size={20} color="#14b8a6" /> Creador de Gantt
                        </h3>

                        <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                            <label>Objetivo Específico</label>
                            <textarea
                                className="input-field"
                                placeholder="Ej: Diseñar un instrumento de recolección de datos cualitativo..."
                                value={ganttObjetivo}
                                onChange={(e) => setGanttObjetivo(e.target.value)}
                                rows="2"
                                style={{ padding: '0.75rem', resize: 'vertical' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                            <div className="input-group" style={{ flex: 1, margin: 0 }}>
                                <label>Unidad de Tiempo</label>
                                <select 
                                    className="input-field"
                                    value={ganttUnidad}
                                    onChange={(e) => setGanttUnidad(e.target.value)}
                                    style={{ padding: '0.75rem' }}
                                >
                                    <option value="semanal">Semanal</option>
                                    <option value="mensual">Mensual</option>
                                    <option value="trimestral">Trimestral</option>
                                    <option value="semestral">Semestral</option>
                                </select>
                            </div>
                            <div className="input-group" style={{ flex: 1, margin: 0 }}>
                                <label>Cantidad de Periodos</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    min="1"
                                    max="50"
                                    value={ganttPeriodos}
                                    onChange={(e) => setGanttPeriodos(parseInt(e.target.value) || 1)}
                                    style={{ padding: '0.75rem' }}
                                />
                            </div>
                            {addedObjectives.length > 0 && (
                                <div className="input-group fade-in" style={{ flex: 1, margin: 0 }}>
                                    <label>Periodo de Inicio (Este obj.)</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        min="1"
                                        max={ganttPeriodos}
                                        value={ganttPeriodoInicio}
                                        onChange={(e) => setGanttPeriodoInicio(parseInt(e.target.value) || 1)}
                                        style={{ padding: '0.75rem', borderColor: '#0ea5e9' }}
                                    />
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleAddObjective}
                            disabled={isGeneratingGantt || !ganttObjetivo.trim()}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: isGeneratingGantt || !ganttObjetivo.trim() ? '#cbd5e1' : 'linear-gradient(to right, #0d9488, #0f766e)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontWeight: '600',
                                cursor: isGeneratingGantt || !ganttObjetivo.trim() ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                fontSize: '1.05rem',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 6px -1px rgba(13,148,136,0.3)'
                            }}
                        >
                            {isGeneratingGantt ? 'Desglosando actividades...' : '✨ Generar Actividades y Añadir al Cronograma'}
                        </button>

                        {ganttError && (
                            <div style={{ marginTop: '1rem', padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem' }}>
                                <p style={{ margin: 0, color: '#991b1b', fontSize: '0.9rem' }}>⚠️ {ganttError}</p>
                            </div>
                        )}

                        {addedObjectives.length > 0 && (
                            <div className="fade-in" style={{
                                marginTop: '2.5rem',
                                background: 'white',
                                borderRadius: '1rem',
                                border: '1px solid #ccfbf1',
                                overflow: 'hidden',
                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)'
                            }}>
                                <div style={{ background: '#f0fdfa', padding: '1rem 1.5rem', borderBottom: '1px solid #ccfbf1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h4 style={{ margin: 0, color: '#0f766e', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Calendar size={18} /> Cronograma Consolidado
                                    </h4>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <button 
                                            onClick={handleExportExcel}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                                background: 'white', border: '1px solid #14b8a6', color: '#0f766e',
                                                padding: '0.4rem 0.8rem', borderRadius: '0.5rem',
                                                fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = '#f0fdfa'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
                                        >
                                            <Download size={16} /> Exportar Excel
                                        </button>
                                        <span style={{ fontSize: '0.85rem', color: '#0d9488', fontWeight: '500', background: '#ccfbf1', padding: '0.3rem 0.8rem', borderRadius: '1rem' }}>
                                            {ganttPeriodos} {ganttUnidad === 'semanal' ? 'Semanas' : ganttUnidad === 'mensual' ? 'Meses' : ganttUnidad === 'trimestral' ? 'Trimestres' : 'Semestres'}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ overflowX: 'auto', padding: '1rem' }}>
                                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', minWidth: '800px', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ padding: '1rem', background: '#f8fafc', borderBottom: '2px solid #e2e8f0', borderRight: '1px solid #e2e8f0', textAlign: 'left', width: '40%', color: '#334155', fontWeight: '700', fontSize: '0.95rem' }}>
                                                    Objetivos y Actividades Específicas
                                                </th>
                                                {Array.from({ length: ganttPeriodos }).map((_, i) => (
                                                    <th key={i} style={{ padding: '0.75rem', background: '#f8fafc', borderBottom: '2px solid #e2e8f0', borderRight: i === ganttPeriodos - 1 ? 'none' : '1px solid #e2e8f0', textAlign: 'center', color: '#64748b', fontSize: '0.85rem', fontWeight: '700' }}>
                                                        {ganttUnidad === 'semanal' ? 'S' : ganttUnidad === 'mensual' ? 'M' : ganttUnidad === 'trimestral' ? 'T' : 'S'}{i + 1}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {addedObjectives.map((objGroup, groupIndex) => (
                                                <React.Fragment key={objGroup.id}>
                                                    {/* Objetivo Header Row */}
                                                    <tr style={{ background: '#f1f5f9' }}>
                                                        <td style={{ padding: '1rem', borderBottom: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1', fontWeight: '700', color: '#0f766e', fontSize: '0.95rem' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <span style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                                                    <span style={{ background: '#0d9488', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.7rem', flexShrink: 0, marginTop: '2px' }}>
                                                                        {groupIndex + 1}
                                                                    </span>
                                                                    {objGroup.title}
                                                                </span>
                                                                <button 
                                                                    onClick={() => handleRemoveObjective(objGroup.id)}
                                                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', padding: '0.2rem 0.5rem', borderRadius: '0.25rem' }}
                                                                    onMouseEnter={(e) => e.target.style.background = '#fee2e2'}
                                                                    onMouseLeave={(e) => e.target.style.background = 'none'}
                                                                >
                                                                    Quitar
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td colSpan={ganttPeriodos} style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                                                        </td>
                                                    </tr>
                                                    
                                                    {/* Activities Rows */}
                                                    {objGroup.activities.map((item, actIndex) => {
                                                        const isLastActivity = actIndex === objGroup.activities.length - 1;
                                                        const actCode = `OE${groupIndex + 1}A${actIndex + 1}`;
                                                        return (
                                                            <tr key={`${objGroup.id}-act-${actIndex}`} style={{ transition: 'background 0.2s' }}>
                                                                <td style={{ padding: '0.85rem 1rem 0.85rem 2.5rem', borderBottom: isLastActivity ? '2px solid #e2e8f0' : '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#334155', fontWeight: '500', position: 'relative' }}>
                                                                    {/* Graphic line connecting */}
                                                                    <div style={{ position: 'absolute', left: '1.25rem', top: 0, bottom: isLastActivity ? '50%' : 0, width: '2px', background: '#cbd5e1' }}></div>
                                                                    <div style={{ position: 'absolute', left: '1.25rem', top: '50%', width: '12px', height: '2px', background: '#cbd5e1' }}></div>
                                                                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#0ea5e9', marginRight: '0.4rem', background: '#f0f9ff', padding: '0.1rem 0.3rem', borderRadius: '0.2rem', border: '1px solid #bae6fd' }}>{actCode}</span> 
                                                                    {item.actividad}
                                                                </td>
                                                                {Array.from({ length: ganttPeriodos }).map((_, i) => {
                                                                    const currentPeriod = i + 1;
                                                                    const isSpanning = currentPeriod >= item.inicio && currentPeriod <= (item.inicio + item.duracion - 1);
                                                                    const isStart = currentPeriod === item.inicio;
                                                                    const isEnd = currentPeriod === (item.inicio + item.duracion - 1);
                                                                    
                                                                    let borderRadius = '0';
                                                                    if (isStart && isEnd) borderRadius = '6px';
                                                                    else if (isStart) borderRadius = '6px 0 0 6px';
                                                                    else if (isEnd) borderRadius = '0 6px 6px 0';

                                                                    return (
                                                                        <td key={i} style={{ padding: '0.4rem', borderRight: i === ganttPeriodos - 1 ? 'none' : '1px dotted #cbd5e1', borderBottom: isLastActivity ? '2px solid #e2e8f0' : '1px solid #e2e8f0', background: isSpanning ? '#f0fdfa' : 'transparent', verticalAlign: 'middle', position: 'relative' }}>
                                                                            {isSpanning && (
                                                                                <div style={{
                                                                                    height: '24px',
                                                                                    background: 'linear-gradient(90deg, #2dd4bf, #0d9488)',
                                                                                    borderRadius: borderRadius,
                                                                                    boxShadow: '0 2px 4px rgba(13,148,136,0.2)',
                                                                                    position: 'absolute',
                                                                                    left: isStart ? '10%' : '0',
                                                                                    right: isEnd ? '10%' : '0',
                                                                                    top: '50%',
                                                                                    transform: 'translateY(-50%)',
                                                                                    zIndex: 1
                                                                                }}></div>
                                                                            )}
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        );
                                                    })}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Cronograma;
