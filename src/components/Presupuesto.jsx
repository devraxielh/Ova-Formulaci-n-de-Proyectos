import React, { useState } from 'react';
import { DollarSign, Plus, Calculator, PiggyBank, Sparkles, Download, Trash2, PieChart } from 'lucide-react';
import { suggestPresupuesto } from '../services/groqService';
import * as XLSX from 'xlsx';

const Presupuesto = () => {
    // Basic AI Form
    const [title, setTitle] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Budget List
    const [budgetItems, setBudgetItems] = useState([]);
    
    // Manual Form
    const [cat, setCat] = useState('Recursos Humanos');
    const [desc, setDesc] = useState('');
    const [justificacion, setJustificacion] = useState('');
    const [costo, setCosto] = useState('');
    const [fuente, setFuente] = useState('Personal');

    // Constants
    const categorias = [
        "Recursos Humanos", "Infraestructura Física", "Infraestructura Cloud", 
        "Materiales/Muestreos", "Viajes", "Bibliografía/Licencias", "Otros"
    ];
    
    const fuentes = ["Personal", "Universidad/Institución", "Externa"];

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value || 0);
    };

    const handleAddManual = () => {
        if (!desc.trim() || !costo) return;

        const newItem = {
            id: Date.now(),
            categoria: cat,
            descripcion: desc,
            justificacion: justificacion,
            costo: parseFloat(costo) || 0,
            fuente: fuente
        };

        setBudgetItems([...budgetItems, newItem]);
        setDesc('');
        setJustificacion('');
        setCosto('');
    };

    const handleRemoveItem = (idToRemove) => {
        setBudgetItems(budgetItems.filter(item => item.id !== idToRemove));
    };

    const handleSuggestAI = async () => {
        if (!title.trim()) {
            setErrorMsg('Por favor ingresa un título o descripción del proyecto.');
            return;
        }

        setIsGenerating(true);
        setErrorMsg('');

        try {
            const result = await suggestPresupuesto(title);
            // Append generated items, adding random ID
            const newItems = result.map(item => ({
                id: Math.random().toString(36).substr(2, 9),
                categoria: item.categoria || 'Otros',
                descripcion: item.descripcion || 'Ítem sin descripción',
                justificacion: item.justificacion || 'Sin justificación',
                costo: parseFloat(item.costo) || 0,
                fuente: item.fuente || 'Personal'
            }));
            
            setBudgetItems([...budgetItems, ...newItems]);
        } catch (error) {
            console.error('Error in predict:', error);
            setErrorMsg('No se pudo generar el presupuesto. Intenta con un título más descriptivo.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExportExcel = () => {
        if (budgetItems.length === 0) return;

        const dt = [];
        
        // Cabeceras
        dt.push(["Categoría", "Ítem o Descripción", "Justificación", "Fuente de Financiación", "Costo Estimado"]);

        // Sumatorias parciales
        let total = 0;

        // Filas de Actividades
        budgetItems.forEach((item) => {
            dt.push([item.categoria, item.descripcion, item.justificacion, item.fuente, item.costo]);
            total += parseFloat(item.costo) || 0;
        });

        // Fila Total
        dt.push(["", "", "", "TOTAL:", total]);

        const ws = XLSX.utils.aoa_to_sheet(dt);

        const wscols = [{ wch: 25 }, { wch: 45 }, { wch: 45 }, { wch: 25 }, { wch: 20 }]; 
        ws['!cols'] = wscols;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Presupuesto");

        XLSX.writeFile(wb, "Presupuesto_Analitica.xlsx");
    };

    const totalGeneral = budgetItems.reduce((acc, item) => acc + (parseFloat(item.costo) || 0), 0);

    return (
        <div style={{ padding: '0', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.8rem', color: '#1e293b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <DollarSign color="#10b981" size={28} />
                    Gestión de Presupuesto
                </h2>
                <p style={{ color: '#64748b', fontSize: '1.05rem', lineHeight: '1.6' }}>
                    Calcula y estructura la inversión requerida en recursos humanos, infraestructura local y cloud, encuestas, y establece las fuentes de financiación.
                </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                
                {/* Lateral Izquierdo: Formularios */}
                <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Generador IA */}
                    <div className="glass-panel slide-up" style={{ padding: '2rem', borderTop: '4px solid #10b981' }}>
                        <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Sparkles size={20} color="#10b981" />
                            Generador IA de Analítica
                        </h3>
                        
                        <div className="input-group">
                            <label>Tema del Proyecto (Contexto)</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Ej: Implementación de Data Lake para predicción de fraude en salud..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={handleSuggestAI}
                            disabled={isGenerating || !title.trim()}
                            className="primary-button"
                            style={{
                                width: '100%',
                                background: isGenerating || !title.trim() ? '#cbd5e1' : 'linear-gradient(135deg, #10b981, #059669)',
                                marginTop: '1rem',
                                color: 'white',
                                padding: '1rem',
                                borderRadius: '0.75rem',
                                border: 'none',
                                fontWeight: 'bold',
                                fontSize: '1.05rem',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '0.5rem',
                                cursor: isGenerating || !title.trim() ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: isGenerating || !title.trim() ? 'none' : '0 4px 14px 0 rgba(16, 185, 129, 0.39)'
                            }}
                            onMouseEnter={(e) => { if (!isGenerating && title.trim()) e.currentTarget.style.transform = 'translateY(-2px)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
                        >
                            {isGenerating ? 'Estructurando presupuesto...' : '✨ Sugerir Ítems con IA'}
                        </button>

                        {errorMsg && (
                            <div style={{ marginTop: '1rem', padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem' }}>
                                <p style={{ margin: 0, color: '#991b1b', fontSize: '0.9rem' }}>⚠️ {errorMsg}</p>
                            </div>
                        )}
                    </div>

                    {/* Agregar Manual */}
                    <div className="glass-panel slide-up" style={{ padding: '2rem', animationDelay: '0.1s' }}>
                        <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Plus size={20} color="#3b82f6" />
                            Añadir Ítem Manualmente
                        </h3>

                        <div className="input-group">
                            <label>Categoría</label>
                            <select className="input-field" value={cat} onChange={(e) => setCat(e.target.value)}>
                                {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        
                        <div className="input-group">
                            <label>Descripción / Detalle</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Ej: Suscripción Colab Pro (6 meses)"
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                            />
                        </div>

                        <div className="input-group">
                            <label>Justificación del Gasto</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Ej: Necesario para el entrenamiento de modelos complejos"
                                value={justificacion}
                                onChange={(e) => setJustificacion(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div className="input-group" style={{ flex: 1 }}>
                                <label>Costo Estimado</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    placeholder="Valor en $"
                                    value={costo}
                                    onChange={(e) => setCosto(e.target.value)}
                                />
                            </div>
                            <div className="input-group" style={{ flex: 1 }}>
                                <label>Fuente Financiación</label>
                                <select className="input-field" value={fuente} onChange={(e) => setFuente(e.target.value)}>
                                    {fuentes.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleAddManual}
                            disabled={!desc.trim() || !costo}
                            className="primary-button"
                            style={{
                                width: '100%',
                                background: !desc.trim() || !costo ? '#cbd5e1' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                marginTop: '1rem',
                                color: 'white',
                                padding: '1rem',
                                borderRadius: '0.75rem',
                                border: 'none',
                                fontWeight: 'bold',
                                fontSize: '1.05rem',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '0.5rem',
                                cursor: !desc.trim() || !costo ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: !desc.trim() || !costo ? 'none' : '0 4px 14px 0 rgba(59, 130, 246, 0.39)'
                            }}
                            onMouseEnter={(e) => { if (desc.trim() && costo) e.currentTarget.style.transform = 'translateY(-2px)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
                        >
                            <Plus size={20} /> Añadir al Presupuesto
                        </button>
                    </div>

                </div>

                {/* Lateral Derecho: Tabla */}
                <div style={{ flex: '2 1 500px' }}>
                    <div className="glass-panel slide-up" style={{ padding: '0', overflow: 'hidden', animationDelay: '0.2s', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Calculator size={20} color="#10b981" />
                                Resumen Financiero
                            </h3>
                            
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#059669', background: '#d1fae5', padding: '0.4rem 1rem', borderRadius: '2rem' }}>
                                    Total: {formatCurrency(totalGeneral)}
                                </span>
                                {budgetItems.length > 0 && (
                                    <button 
                                        onClick={handleExportExcel}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                                            background: 'white', border: '1px solid #10b981', color: '#059669',
                                            padding: '0.5rem 1rem', borderRadius: '0.5rem',
                                            fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#d1fae5'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
                                    >
                                        <Download size={16} /> Exportar Excel
                                    </button>
                                )}
                            </div>
                        </div>

                        <div style={{ padding: '1rem', overflowY: 'auto', flex: 1, maxHeight: '600px' }}>
                            {budgetItems.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8' }}>
                                    <PiggyBank size={64} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                    <p style={{ fontSize: '1.1rem' }}>No hay ítems en el presupuesto.</p>
                                    <p style={{ fontSize: '0.9rem' }}>Agrega rubros manualmente o usa la Inteligencia Artificial.</p>
                                </div>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ padding: '0.5rem 1rem', textAlign: 'left', color: '#64748b', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>Categoría</th>
                                            <th style={{ padding: '0.5rem 1rem', textAlign: 'left', color: '#64748b', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>Descripción</th>
                                            <th style={{ padding: '0.5rem 1rem', textAlign: 'left', color: '#64748b', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>Fuente</th>
                                            <th style={{ padding: '0.5rem 1rem', textAlign: 'right', color: '#64748b', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>Costo</th>
                                            <th style={{ width: '40px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {budgetItems.map(item => (
                                            <tr key={item.id} style={{ background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                                                <td style={{ padding: '1rem', borderTopLeftRadius: '0.5rem', borderBottomLeftRadius: '0.5rem', fontWeight: '500', color: '#334155', fontSize: '0.9rem' }}>
                                                    {item.categoria}
                                                </td>
                                                <td style={{ padding: '1rem', color: '#1e293b', fontSize: '0.95rem' }}>
                                                    <div>{item.descripcion}</div>
                                                    {item.justificacion && (
                                                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem', fontStyle: 'italic' }}>
                                                            Justificación: {item.justificacion}
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{ 
                                                        background: item.fuente === 'Personal' ? '#f3f4f6' : item.fuente === 'Universidad/Institución' ? '#e0e7ff' : '#fef3c7',
                                                        color: item.fuente === 'Personal' ? '#4b5563' : item.fuente === 'Universidad/Institución' ? '#4338ca' : '#b45309',
                                                        padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: '600'
                                                    }}>
                                                        {item.fuente}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: '#0f766e', fontSize: '1rem' }}>
                                                    {formatCurrency(item.costo)}
                                                </td>
                                                <td style={{ padding: '1rem', borderTopRightRadius: '0.5rem', borderBottomRightRadius: '0.5rem', textAlign: 'center' }}>
                                                    <button 
                                                        onClick={() => handleRemoveItem(item.id)}
                                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.7, padding: '0.2rem' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                                        onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
                                                        title="Eliminar ítem"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    );
};

export default Presupuesto;
