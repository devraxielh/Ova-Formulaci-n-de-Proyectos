import React, { useState } from 'react';
import { Lightbulb, Type, HelpCircle, Layers, Menu, FileText, Target, BookOpen, Scale, LayoutGrid, Link } from 'lucide-react';
import Herramientas from './components/Herramientas';
import Ideacion from './components/Ideacion';
import Titulo from './components/Titulo';
import PreguntaInvestigacion from './components/PreguntaInvestigacion';
import PlanteamientoProblema from './components/PlanteamientoProblema';
import Justificacion from './components/Justificacion';
import Objetivos from './components/Objetivos';
import Introduccion from './components/Introduccion';
import DoiCite from './components/DoiCite';

function App() {
    const [activeTab, setActiveTab] = useState('herramientas');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        closeSidebar(); // Close sidebar on selection (mobile)
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'herramientas':
                return <Herramientas onNavigate={handleTabChange} />;
            case 'ideacion':
                return <Ideacion />;
            case 'titulo':
                return <Titulo />;
            case 'pregunta':
                return <PreguntaInvestigacion />;
            case 'planteamiento':
                return <PlanteamientoProblema />;
            case 'justificacion':
                return <Justificacion />;
            case 'objetivos':
                return <Objetivos />;
            case 'introduccion':
                return <Introduccion />;
            case 'doi':
                return <DoiCite />;
            default:
                return <Ideacion />;
        }
    };

    const getTitle = () => {
        switch (activeTab) {
            case 'herramientas': return 'Herramientas';
            case 'ideacion': return 'Fase de Ideación';
            case 'titulo': return 'Construcción del Título';
            case 'pregunta': return 'Pregunta de Investigación';
            case 'planteamiento': return 'Planteamiento del Problema';
            case 'justificacion': return 'Justificación';
            case 'objetivos': return 'Objetivos de Investigación';
            case 'introduccion': return 'Introducción';
            case 'doi': return 'DOI to Cite';
            default: return '';
        }
    };

    return (
        <div className="app-container">
            {/* Mobile Header */}
            <header className="mobile-header">
                <button
                    onClick={toggleSidebar}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: '#1e293b' }}
                >
                    <Menu size={24} />
                </button>
                <div className="sidebar-brand" style={{ marginLeft: '1rem', fontSize: '1.1rem', borderBottom: 'none', marginBottom: 0 }}>
                    <Layers size={20} color="#4f46e5" />
                    <span>PROJECTSIA</span>
                </div>
            </header>

            {/* Sidebar Overlay (Mobile) */}
            {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

            {/* Sidebar Navigation */}
            <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <Layers size={24} color="#4f46e5" />
                        <span>PROJECTSIA</span>
                    </div>
                </div>

                <nav style={{ flex: 1 }}>
                    <button
                        className={`nav-button ${activeTab === 'herramientas' ? 'active' : ''}`}
                        onClick={() => handleTabChange('herramientas')}
                    >
                        <LayoutGrid size={20} />
                        <span>Herramientas</span>
                    </button>

                    <button
                        className={`nav-button ${activeTab === 'ideacion' ? 'active' : ''}`}
                        onClick={() => handleTabChange('ideacion')}
                    >
                        <Lightbulb size={20} />
                        <span>Ideación</span>
                    </button>

                    <button
                        className={`nav-button ${activeTab === 'titulo' ? 'active' : ''}`}
                        onClick={() => handleTabChange('titulo')}
                    >
                        <Type size={20} />
                        <span>Título</span>
                    </button>

                    <button
                        className={`nav-button ${activeTab === 'pregunta' ? 'active' : ''}`}
                        onClick={() => handleTabChange('pregunta')}
                    >
                        <HelpCircle size={20} />
                        <span>Pregunta Investigación</span>
                    </button>

                    <button
                        className={`nav-button ${activeTab === 'planteamiento' ? 'active' : ''}`}
                        onClick={() => handleTabChange('planteamiento')}
                    >
                        <FileText size={20} />
                        <span>Planteamiento Problema</span>
                    </button>

                    <button
                        className={`nav-button ${activeTab === 'justificacion' ? 'active' : ''}`}
                        onClick={() => handleTabChange('justificacion')}
                    >
                        <Scale size={20} />
                        <span>Justificación</span>
                    </button>

                    <button
                        className={`nav-button ${activeTab === 'objetivos' ? 'active' : ''}`}
                        onClick={() => handleTabChange('objetivos')}
                    >
                        <Target size={20} />
                        <span>Objetivos</span>
                    </button>

                    <button
                        className={`nav-button ${activeTab === 'introduccion' ? 'active' : ''}`}
                        onClick={() => handleTabChange('introduccion')}
                    >
                        <BookOpen size={20} />
                        <span>Introducción</span>
                    </button>

                    <button
                        className={`nav-button ${activeTab === 'doi' ? 'active' : ''}`}
                        onClick={() => handleTabChange('doi')}
                    >
                        <Link size={20} />
                        <span>DOI to Cite</span>
                    </button>
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>© Rodrigo García,PhD</p>
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
