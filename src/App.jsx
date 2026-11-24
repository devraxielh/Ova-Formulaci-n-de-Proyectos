import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { Lightbulb, Type, HelpCircle, Layers, Menu, FileText, Target, BookOpen, Scale, LayoutGrid, Link, Compass, Library, PanelLeftClose, PanelLeftOpen, FolderOpen, UserRound, ShieldCheck, LogOut, CheckCircle2, ListOrdered, BarChart3, Flag, BookMarked, AlignLeft } from 'lucide-react';
import Herramientas from './components/Herramientas';
import { useProject } from './context/ProjectContext';
import { buildDocument } from './services/projectDoc';

// Cada página se descarga solo cuando se abre: la primera carga del sitio es mucho más liviana.
const Ideacion = lazy(() => import('./components/Ideacion'));
const Titulo = lazy(() => import('./components/Titulo'));
const PreguntaInvestigacion = lazy(() => import('./components/PreguntaInvestigacion'));
const PlanteamientoProblema = lazy(() => import('./components/PlanteamientoProblema'));
const Justificacion = lazy(() => import('./components/Justificacion'));
const AlcancesLimitaciones = lazy(() => import('./components/AlcancesLimitaciones'));
const Objetivos = lazy(() => import('./components/Objetivos'));
const Introduccion = lazy(() => import('./components/Introduccion'));
const MarcoReferencial = lazy(() => import('./components/MarcoReferencial'));
const Metodologia = lazy(() => import('./components/Metodologia'));
const Fases = lazy(() => import('./components/Fases'));
const Resultados = lazy(() => import('./components/Resultados'));
const Conclusiones = lazy(() => import('./components/Conclusiones'));
const Referencias = lazy(() => import('./components/Referencias'));
const Resumen = lazy(() => import('./components/Resumen'));
const MiProyecto = lazy(() => import('./components/MiProyecto'));
const Cuenta = lazy(() => import('./components/Cuenta'));
const Admin = lazy(() => import('./components/Admin'));

const TAB_ALIAS = { doi: 'referencias', poblacion: 'metodologia', 'plan-analisis': 'metodologia', cronograma: 'metodologia', presupuesto: 'metodologia' };

// Herramientas que son clases en diapositivas: usan todo el espacio y recogen el menú.
const DECK_TABS = ['ideacion', 'titulo', 'pregunta', 'planteamiento', 'objetivos', 'justificacion', 'alcances', 'introduccion', 'marco', 'metodologia', 'fases', 'resultados', 'conclusiones', 'resumen'];

const SAVE_LABEL = { local: 'Borrador en este navegador', saved: 'Guardado', saving: 'Guardando…', error: 'Sin guardar' };

function App() {
    const [selectedTab, setActiveTab] = useState('herramientas');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const { user, project, saveState, verify, logout, data } = useProject();
    // Herramientas que ya tienen contenido guardado en el proyecto: su ícono se muestra en verde.
    const doneTabs = useMemo(() => new Set(buildDocument(data).filter((section) => section.content.length > 0).map((section) => section.tab)), [data]);
    const [signingOut, setSigningOut] = useState(false);

    const handleLogout = async () => {
        setSigningOut(true);
        try {
            await logout();
            setActiveTab('herramientas');
            closeSidebar();
        } catch {
            /* si falla, la sesión sigue abierta y el botón vuelve a estar disponible */
        } finally {
            setSigningOut(false);
        }
    };
    const [activation, setActivation] = useState(null);
    const activationStarted = useRef(false);
    const isAdmin = user?.role === 'admin';
    // Con la contraseña inicial solo se puede estar en la cuenta, la cambie o no la pestaña elegida.
    const activeTab = user?.mustChangePassword ? 'cuenta' : selectedTab;

    // Enlace de activación del correo: /?activar=TOKEN
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('activar');
        if (!token || activationStarted.current) return;
        activationStarted.current = true;
        params.delete('activar');
        const rest = params.toString();
        window.history.replaceState(null, '', `${window.location.pathname}${rest ? `?${rest}` : ''}${window.location.hash}`);
        setActiveTab('cuenta');
        setActivation({ status: 'working' });
        verify(token)
            .then(() => setActivation({ status: 'ok' }))
            .catch((error) => setActivation({ status: 'error', message: error.message }));
    }, [verify]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    const handleTabChange = (requested) => {
        // Población, plan de análisis, cronograma y presupuesto ahora son parte de la clase de Metodología.
        const tabId = TAB_ALIAS[requested] || requested;
        setActiveTab(tabId);
        closeSidebar(); // Close sidebar on selection (mobile)
        // La presentación de Ideación necesita todo el ancho: se recoge el menú al abrirla
        if (DECK_TABS.includes(tabId)) setIsSidebarCollapsed(true);
    };

    // El botón «Citar» de las clases pide abrir la página de referencias.
    useEffect(() => {
        const onNavegar = (event) => {
            const destino = TAB_ALIAS[event.detail] || event.detail;
            if (typeof destino === 'string') setActiveTab(destino);
        };
        window.addEventListener('projectsia:navegar', onNavegar);
        return () => window.removeEventListener('projectsia:navegar', onNavegar);
    }, []);

    const renderContent = () => {
        switch (activeTab) {
            case 'herramientas':
                return <Herramientas onNavigate={handleTabChange} />;
            case 'ideacion':
                return <Ideacion onNavigate={handleTabChange} />;
            case 'titulo':
                return <Titulo onNavigate={handleTabChange} />;
            case 'pregunta':
                return <PreguntaInvestigacion onNavigate={handleTabChange} />;
            case 'planteamiento':
                return <PlanteamientoProblema onNavigate={handleTabChange} />;
            case 'justificacion':
                return <Justificacion onNavigate={handleTabChange} />;
            case 'alcances':
                return <AlcancesLimitaciones onNavigate={handleTabChange} />;
            case 'objetivos':
                return <Objetivos onNavigate={handleTabChange} />;
            case 'introduccion':
                return <Introduccion onNavigate={handleTabChange} />;
            case 'marco':
                return <MarcoReferencial onNavigate={handleTabChange} />;
            case 'poblacion':
            case 'plan-analisis':
            case 'cronograma':
            case 'presupuesto':
            case 'metodologia':
                return <Metodologia onNavigate={handleTabChange} />;
            case 'fases':
                return <Fases onNavigate={handleTabChange} />;
            case 'resultados':
                return <Resultados onNavigate={handleTabChange} />;
            case 'conclusiones':
                return <Conclusiones onNavigate={handleTabChange} />;
            case 'referencias':
                return <Referencias onNavigate={handleTabChange} />;
            case 'resumen':
                return <Resumen onNavigate={handleTabChange} />;
            case 'proyecto':
                return <MiProyecto onNavigate={handleTabChange} />;
            case 'cuenta':
                return <Cuenta onNavigate={handleTabChange} activation={activation} />;
            case 'admin':
                return isAdmin && !user.mustChangePassword ? <Admin /> : <Cuenta onNavigate={handleTabChange} activation={activation} />;
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
            case 'alcances': return 'Alcances y Limitaciones';
            case 'objetivos': return 'Objetivos de Investigación';
            case 'introduccion': return 'Introducción';
            case 'marco': return 'Marco Referencial';
            case 'fases': return 'Desarrollo de las fases del proyecto';
            case 'resultados': return 'Resultados y discusión';
            case 'conclusiones': return 'Conclusiones';
            case 'referencias': return 'Referencias bibliográficas';
            case 'resumen': return 'Resumen';
            case 'metodologia': return 'Metodología';
            case 'poblacion': return 'Población y Muestra';
            case 'plan-analisis': return 'Plan de Análisis e Instrumentos';
            case 'cronograma': return 'Cronograma';
            case 'presupuesto': return 'Presupuesto Financiero';
            case 'proyecto': return 'Mi proyecto';
            case 'cuenta': return 'Mi cuenta';
            case 'admin': return 'Administración';
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
            <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''} ${isSidebarCollapsed ? 'sidebar--collapsed' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <Layers size={24} color="#4f46e5" />
                        <span>PROJECTSIA</span>
                    </div>
                    <button
                        type="button"
                        className="sidebar-toggle"
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        aria-expanded={!isSidebarCollapsed}
                        aria-label={isSidebarCollapsed ? 'Abrir el menú' : 'Recoger el menú'}
                        title={isSidebarCollapsed ? 'Abrir el menú' : 'Recoger el menú'}
                    >
                        {isSidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                    </button>
                </div>

                <nav style={{ flex: 1, overflowY: 'auto', margin: '1rem -0.5rem', padding: '0 0.5rem' }}>
                    <button
                        className={`nav-button ${activeTab === 'herramientas' ? 'active' : ''}`}
                        onClick={() => handleTabChange('herramientas')}
                        title="Herramientas"
                    >
                        <LayoutGrid size={20} />
                        <span>Herramientas</span>
                    </button>

                    {isAdmin && (
                        <button
                            className={`nav-button ${activeTab === 'admin' ? 'active' : ''}`}
                            onClick={() => handleTabChange('admin')}
                            title="Administración"
                        >
                            <ShieldCheck size={20} />
                            <span>Administración</span>
                        </button>
                    )}

                    <button
                        className={`nav-button ${activeTab === 'proyecto' ? 'active' : ''}`}
                        onClick={() => handleTabChange('proyecto')}
                        title="Mi proyecto"
                    >
                        <FolderOpen size={20} />
                        <span>Mi proyecto</span>
                    </button>

                    <button
                        className={`nav-button ${activeTab === 'ideacion' ? 'active' : ''} ${doneTabs.has('ideacion') ? 'nav-button--done' : ''}`}
                        onClick={() => handleTabChange('ideacion')}
                        title="Ideación"
                    >
                        <Lightbulb size={20} />
                        <span>Ideación</span>
                        {doneTabs.has('ideacion') && <CheckCircle2 size={16} className="nav-done-check" aria-label="completado" />}
                    </button>

                    <button
                        className={`nav-button ${activeTab === 'titulo' ? 'active' : ''} ${doneTabs.has('titulo') ? 'nav-button--done' : ''}`}
                        onClick={() => handleTabChange('titulo')}
                        title="Título"
                    >
                        <Type size={20} />
                        <span>Título</span>
                        {doneTabs.has('titulo') && <CheckCircle2 size={16} className="nav-done-check" aria-label="completado" />}
                    </button>

                    <button
                        className={`nav-button ${activeTab === 'pregunta' ? 'active' : ''} ${doneTabs.has('pregunta') ? 'nav-button--done' : ''}`}
                        onClick={() => handleTabChange('pregunta')}
                        title="Pregunta Investigación"
                    >
                        <HelpCircle size={20} />
                        <span>Pregunta Investigación</span>
                        {doneTabs.has('pregunta') && <CheckCircle2 size={16} className="nav-done-check" aria-label="completado" />}
                    </button>

                    <button
                        className={`nav-button ${activeTab === 'planteamiento' ? 'active' : ''} ${doneTabs.has('planteamiento') ? 'nav-button--done' : ''}`}
                        onClick={() => handleTabChange('planteamiento')}
                        title="Planteamiento Problema"
                    >
                        <FileText size={20} />
                        <span>Planteamiento Problema</span>
                        {doneTabs.has('planteamiento') && <CheckCircle2 size={16} className="nav-done-check" aria-label="completado" />}
                    </button>

                    <button
                        className={`nav-button ${activeTab === 'objetivos' ? 'active' : ''} ${doneTabs.has('objetivos') ? 'nav-button--done' : ''}`}
                        onClick={() => handleTabChange('objetivos')}
                        title="Objetivos"
                    >
                        <Target size={20} />
                        <span>Objetivos</span>
                        {doneTabs.has('objetivos') && <CheckCircle2 size={16} className="nav-done-check" aria-label="completado" />}
                    </button>

                    <button
                        className={`nav-button ${activeTab === 'introduccion' ? 'active' : ''} ${doneTabs.has('introduccion') ? 'nav-button--done' : ''}`}
                        onClick={() => handleTabChange('introduccion')}
                        title="Introducción"
                    >
                        <BookOpen size={20} />
                        <span>Introducción</span>
                        {doneTabs.has('introduccion') && <CheckCircle2 size={16} className="nav-done-check" aria-label="completado" />}
                    </button>

                    <button
                        className={`nav-button ${activeTab === 'justificacion' ? 'active' : ''} ${doneTabs.has('justificacion') ? 'nav-button--done' : ''}`}
                        onClick={() => handleTabChange('justificacion')}
                        title="Justificación"
                    >
                        <Scale size={20} />
                        <span>Justificación</span>
                        {doneTabs.has('justificacion') && <CheckCircle2 size={16} className="nav-done-check" aria-label="completado" />}
                    </button>

                    <button
                        className={`nav-button ${activeTab === 'alcances' ? 'active' : ''} ${doneTabs.has('alcances') ? 'nav-button--done' : ''}`}
                        onClick={() => handleTabChange('alcances')}
                        title="Alcances y Limites"
                    >
                        <Compass size={20} />
                        <span>Alcances y Limites</span>
                        {doneTabs.has('alcances') && <CheckCircle2 size={16} className="nav-done-check" aria-label="completado" />}
                    </button>

                    <button
                        className={`nav-button ${activeTab === 'marco' ? 'active' : ''} ${doneTabs.has('marco') ? 'nav-button--done' : ''}`}
                        onClick={() => handleTabChange('marco')}
                        title="Marco Referencial"
                    >
                        <Library size={20} />
                        <span>Marco Referencial</span>
                        {doneTabs.has('marco') && <CheckCircle2 size={16} className="nav-done-check" aria-label="completado" />}
                    </button>

                    <button
                        className={`nav-button ${activeTab === 'metodologia' ? 'active' : ''} ${doneTabs.has('metodologia') ? 'nav-button--done' : ''}`}
                        onClick={() => handleTabChange('metodologia')}
                        title="Metodología"
                    >
                        <FileText size={20} />
                        <span>Metodología</span>
                        {doneTabs.has('metodologia') && <CheckCircle2 size={16} className="nav-done-check" aria-label="completado" />}
                    </button>

                    <button
                        className={`nav-button ${activeTab === 'fases' ? 'active' : ''} ${doneTabs.has('fases') ? 'nav-button--done' : ''}`}
                        onClick={() => handleTabChange('fases')}
                        title="Desarrollo de las fases"
                    >
                        <ListOrdered size={20} />
                        <span>Desarrollo de las fases</span>
                        {doneTabs.has('fases') && <CheckCircle2 size={16} className="nav-done-check" aria-label="completado" />}
                    </button>

                    <button
                        className={`nav-button ${activeTab === 'resultados' ? 'active' : ''} ${doneTabs.has('resultados') ? 'nav-button--done' : ''}`}
                        onClick={() => handleTabChange('resultados')}
                        title="Resultados y discusión"
                    >
                        <BarChart3 size={20} />
                        <span>Resultados y discusión</span>
                        {doneTabs.has('resultados') && <CheckCircle2 size={16} className="nav-done-check" aria-label="completado" />}
                    </button>

                    <button
                        className={`nav-button ${activeTab === 'conclusiones' ? 'active' : ''} ${doneTabs.has('conclusiones') ? 'nav-button--done' : ''}`}
                        onClick={() => handleTabChange('conclusiones')}
                        title="Conclusiones"
                    >
                        <Flag size={20} />
                        <span>Conclusiones</span>
                        {doneTabs.has('conclusiones') && <CheckCircle2 size={16} className="nav-done-check" aria-label="completado" />}
                    </button>

                    <button
                        className={`nav-button ${activeTab === 'resumen' ? 'active' : ''} ${doneTabs.has('resumen') ? 'nav-button--done' : ''}`}
                        onClick={() => handleTabChange('resumen')}
                        title="Resumen"
                    >
                        <AlignLeft size={20} />
                        <span>Resumen</span>
                        {doneTabs.has('resumen') && <CheckCircle2 size={16} className="nav-done-check" aria-label="completado" />}
                    </button>

                    <button
                        className={`nav-button ${activeTab === 'referencias' ? 'active' : ''} ${doneTabs.has('referencias') ? 'nav-button--done' : ''}`}
                        onClick={() => handleTabChange('referencias')}
                        title="Referencias bibliográficas"
                    >
                        <BookMarked size={20} />
                        <span>Referencias</span>
                        {doneTabs.has('referencias') && <CheckCircle2 size={16} className="nav-done-check" aria-label="completado" />}
                    </button>


                </nav>

                <button
                    className={`nav-button sidebar-account-icon ${activeTab === 'cuenta' ? 'active' : ''}`}
                    onClick={() => handleTabChange('cuenta')}
                    title={user ? user.name : 'Iniciar sesión'}
                >
                    <UserRound size={20} />
                    <span>{user ? user.name : 'Iniciar sesión'}</span>
                </button>

                {user && (
                    <button
                        className="nav-button sidebar-logout-icon"
                        onClick={handleLogout}
                        disabled={signingOut}
                        title="Cerrar sesión"
                    >
                        <LogOut size={20} />
                        <span>Cerrar sesión</span>
                    </button>
                )}

                <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                    <button type="button" className="sidebar-account" onClick={() => handleTabChange(user ? 'proyecto' : 'cuenta')}>
                        <b>{user ? project.name : 'Iniciar sesión'}</b>
                        <small data-state={saveState}>{user ? SAVE_LABEL[saveState] : 'Guarda tu proyecto en tu cuenta'}</small>
                    </button>
                    {user && (
                        <button type="button" className="sidebar-logout" onClick={handleLogout} disabled={signingOut}>
                            <LogOut size={16} aria-hidden="true" />
                            <span>{signingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}</span>
                            <small>{user.name}</small>
                        </button>
                    )}
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>© Rodrigo García,PhD</p>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className={`main-content ${[...DECK_TABS, 'cuenta'].includes(activeTab) ? 'main-content--deck' : ''}`}>
                {![...DECK_TABS, 'cuenta'].includes(activeTab) && (
                    <header style={{ marginBottom: '2rem' }}>
                        <h1 className="fade-in">{getTitle()}</h1>
                        <p className="fade-in" style={{ maxWidth: '800px' }}>
                            {activeTab === 'proyecto'
                                ? 'Aquí se reúne lo que construyes en cada herramienta. Revisa tu avance y descarga el documento.'
                                : activeTab === 'cuenta'
                                    ? 'Guarda tu proyecto y continúalo desde cualquier equipo.'
                                    : activeTab === 'admin'
                                        ? 'Consulta los usuarios registrados, sus proyectos y su estado.'
                                    : 'Explora las herramientas interactivas para definir y estructurar tu proyecto de investigación de manera efectiva.'}
                        </p>
                    </header>
                )}

                <div className="fade-in">
                    <Suspense fallback={<p className="app-cargando" role="status">Cargando…</p>}>
                        {renderContent()}
                    </Suspense>
                </div>
            </main>
        </div>
    );
}

export default App;
