import React, { useState } from 'react';
import { Lightbulb, Type, HelpCircle, Layers, Menu, FileText, Target, BookOpen } from 'lucide-react';
import Ideacion from './components/Ideacion';
import Titulo from './components/Titulo';
import PreguntaInvestigacion from './components/PreguntaInvestigacion';
import PlanteamientoProblema from './components/PlanteamientoProblema';
import Objetivos from './components/Objetivos';
import Introduccion from './components/Introduccion';

function App() {
    const [activeTab, setActiveTab] = useState('ideacion');

    const renderContent = () => {
        switch (activeTab) {
            case 'ideacion':
                return <Ideacion />;
            case 'titulo':
                return <Titulo />;
            case 'pregunta':
                return <PreguntaInvestigacion />;
            case 'planteamiento':
                return <PlanteamientoProblema />;
            case 'objetivos':
                return <Objetivos />;
            case 'introduccion':
                return <Introduccion />;
            default:
                return <Ideacion />;
        }
    };

    const getTitle = () => {
        switch (activeTab) {
            case 'ideacion': return 'Fase de Ideación';
            case 'titulo': return 'Construcción del Título';
            case 'pregunta': return 'Pregunta de Investigación';
            case 'planteamiento': return 'Planteamiento del Problema';
            case 'objetivos': return 'Objetivos de Investigación';
            case 'introduccion': return 'Introducción';
            default: return '';
        }
    };

    return (
        <div className="app-container">
            {/* Sidebar Navigation */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <Layers size={24} color="#4f46e5" />
                        <span>Proyectos + IA</span>
                    </div>
                </div>

                <nav style={{ flex: 1 }}>
                    <button
                        className={`nav-button ${activeTab === 'ideacion' ? 'active' : ''}`}
                        onClick={() => setActiveTab('ideacion')}
                    >
                        <Lightbulb size={20} />
                        <span>Ideación</span>
                    </button>

                    <button
                        className={`nav-button ${activeTab === 'titulo' ? 'active' : ''}`}
                        onClick={() => setActiveTab('titulo')}
                    >
                        <Type size={20} />
                        <span>Título</span>
                    </button>

                    <button
                        className={`nav-button ${activeTab === 'pregunta' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pregunta')}
                    >
                        <HelpCircle size={20} />
                        <span>Pregunta Investigación</span>
                    </button>

                    <button
                        className={`nav-button ${activeTab === 'planteamiento' ? 'active' : ''}`}
                        onClick={() => setActiveTab('planteamiento')}
                    >
                        <FileText size={20} />
                        <span>Planteamiento Problema</span>
                    </button>

                    <button
                        className={`nav-button ${activeTab === 'objetivos' ? 'active' : ''}`}
                        onClick={() => setActiveTab('objetivos')}
                    >
                        <Target size={20} />
                        <span>Objetivos</span>
                    </button>

                    <button
                        className={`nav-button ${activeTab === 'introduccion' ? 'active' : ''}`}
                        onClick={() => setActiveTab('introduccion')}
                    >
                        <BookOpen size={20} />
                        <span>Introducción</span>
                    </button>
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>© 2024 OVA Educación</p>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="main-content">
                <header style={{ marginBottom: '2rem' }}>
                    <h1 className="fade-in">{getTitle()}</h1>
                    <p className="fade-in" style={{ maxWidth: '800px' }}>
                        Explora las herramientas interactivas para definir y estructurar tu proyecto de investigación de manera efectiva.
                    </p>
                </header>

                <div className="fade-in">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}

export default App;
