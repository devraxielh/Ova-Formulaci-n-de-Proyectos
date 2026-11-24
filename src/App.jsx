import Cargando from './components/Cargando';
import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { Lightbulb, Type, HelpCircle, Layers, Menu, FileText, Target, BookOpen, Scale, Link, Compass, Library, PanelLeftClose, PanelLeftOpen, FolderOpen, UserRound, ShieldCheck, LogOut, CheckCircle2, ListOrdered, BarChart3, Flag, BookMarked, AlignLeft, FileSpreadsheet } from 'lucide-react';
import { useProject } from './context/ProjectContext';
import { CAMPOS_SECCION, SECTIONS, buildDocument } from './services/projectDoc';
import { api } from './services/api';
import './components/Proyecto.css';

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
const EncuestaPublica = lazy(() => import('./components/EncuestaPublica'));
const MiProyecto = lazy(() => import('./components/MiProyecto'));
const Cuenta = lazy(() => import('./components/Cuenta'));
const Admin = lazy(() => import('./components/Admin'));

const TAB_ALIAS = { instrumentos: 'metodologia', analisis: 'resultados', doi: 'referencias', poblacion: 'metodologia', 'plan-analisis': 'metodologia', cronograma: 'metodologia', presupuesto: 'metodologia' };

// Herramientas que son clases en diapositivas: usan todo el espacio y recogen el menú.
const DECK_TABS = ['ideacion', 'titulo', 'pregunta', 'planteamiento', 'objetivos', 'justificacion', 'alcances', 'introduccion', 'marco', 'metodologia', 'fases', 'resultados', 'conclusiones', 'resumen'];

const SAVE_LABEL = { local: 'Borrador en este navegador', saved: 'Guardado', saving: 'Guardando…', offline: 'Sin conexión · se sube al volver', error: 'Sin guardar' };

// Sección a la que pertenece cada campo del proyecto, para decir en qué parte hubo un choque.
const seccionDe = (key) => {
    const id = Object.keys(CAMPOS_SECCION).find((s) => CAMPOS_SECCION[s].includes(key));
    return SECTIONS.find((s) => s.id === id)?.label || 'Otros datos del proyecto';
};
// Nombre visible de la pestaña donde está un compañero.
const TAB_LABEL = { proyecto: 'Mi proyecto', ideacion: 'Ideación', titulo: 'Título', pregunta: 'Pregunta de investigación', planteamiento: 'Planteamiento', objetivos: 'Objetivos', introduccion: 'Introducción', justificacion: 'Justificación', alcances: 'Alcances y limitaciones', marco: 'Marco Referencial', metodologia: 'Metodología', fases: 'Desarrollo de las fases', resultados: 'Resultados y discusión', conclusiones: 'Conclusiones', resumen: 'Resumen', referencias: 'Referencias', cuenta: 'Mi cuenta' };

// Errores del navegador → registro del servidor (se ven en Administración). Como mucho 5 por visita.
let erroresEnviados = 0;
const reportar = (message, stack) => {
    if (erroresEnviados >= 5 || !message) return;
    erroresEnviados += 1;
    api.log({ message: String(message).slice(0, 300), stack: String(stack || '').slice(0, 1500), where: window.location.pathname + window.location.hash }).catch(() => {});
};
if (typeof window !== 'undefined' && !window.__psiaErrores) {
    window.__psiaErrores = true;
    window.addEventListener('error', (event) => reportar(event.message, event.error?.stack));
    window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason;
        // Los errores de red o del servidor ya se muestran al usuario: no son fallos de la app.
        if (reason?.name === 'ApiError') return;
        reportar(reason?.message || String(reason), reason?.stack);
    });
}

function App() {
    const [selectedTab, setActiveTab] = useState('proyecto');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const { user, authReady, project, saveState, verify, logout, data, conflict, others, setSection, resolveConflict, sinCupo, recheck } = useProject();
    const [comprobando, setComprobando] = useState(false);
    const [resetToken, setResetToken] = useState('');
    const [encuestaToken] = useState(() => new URLSearchParams(window.location.search).get('encuesta') || '');
    const [resolviendo, setResolviendo] = useState(false);
    // Herramientas que ya tienen contenido guardado en el proyecto: su ícono se muestra en verde.
    const doneTabs = useMemo(() => new Set(buildDocument(data).filter((section) => section.content.length > 0 && !section.extra).map((section) => section.tab)), [data]);
    const [signingOut, setSigningOut] = useState(false);

    const handleLogout = async () => {
        setSigningOut(true);
        try {
            await logout();
            setActiveTab('proyecto');
            closeSidebar();
        } catch {
            /* si falla, la sesión sigue abierta y el botón vuelve a estar disponible */
        } finally {
            setSigningOut(false);
        }
    };
    const [activation, setActivation] = useState(null);
    const activationStarted = useRef(false);
    // Menú recogido (solo íconos): al pasar el cursor o enfocar una opción, su nombre aparece al lado, sin esperar.
    // El `title` pasa a `data-pista` para que el navegador no muestre además su propia etiqueta, más lenta.
    const [pista, setPista] = useState(null);
    const mostrarPista = (event) => {
        const boton = event.target.closest?.('button');
        if (!boton || !event.currentTarget.classList.contains('sidebar--collapsed')) { setPista(null); return; }
        const titulo = boton.getAttribute('title');
        if (titulo) {
            boton.dataset.pista = titulo;
            if (!boton.getAttribute('aria-label')) boton.setAttribute('aria-label', titulo);
            boton.removeAttribute('title');
        }
        const texto = boton.dataset.pista;
        if (!texto) { setPista(null); return; }
        const r = boton.getBoundingClientRect();
        setPista({ texto, x: r.right + 10, y: r.top + r.height / 2 });
    };
    const isAdmin = user?.role === 'admin';
    // Con la contraseña inicial solo se puede estar en la cuenta, la cambie o no la pestaña elegida.
    const activeTab = user?.mustChangePassword ? 'cuenta' : selectedTab;

    // Enlace para restablecer la contraseña: /?restablecer=TOKEN
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('restablecer');
        if (!token) return;
        params.delete('restablecer');
        const rest = params.toString();
        window.history.replaceState(null, '', `${window.location.pathname}${rest ? `?${rest}` : ''}${window.location.hash}`);
        setResetToken(token);
    }, []);

    // Los compañeros ven en qué sección está cada uno.
    useEffect(() => { setSection(activeTab); }, [activeTab, setSection]);

    const resolver = async (choice) => {
        setResolviendo(true);
        try { await resolveConflict(choice); } catch { /* sigue abierto para reintentar */ } finally { setResolviendo(false); }
    };
    const aqui = others.filter((o) => o.tab === activeTab && DECK_TABS.includes(activeTab));
    const enOtra = others.filter((o) => !aqui.includes(o));

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

    // Mientras espera la autorización, la app consulta sola cada 30 segundos.
    useEffect(() => {
        if (!sinCupo) return undefined;
        const timer = window.setInterval(() => { recheck().catch(() => {}); }, 30000);
        return () => window.clearInterval(timer);
    }, [sinCupo, recheck]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    const handleTabChange = (requested) => {
        // Población, plan de análisis, cronograma y presupuesto ahora son parte de la clase de Metodología.
        const tabId = TAB_ALIAS[requested] || requested;
        // Los instrumentos viven dentro de Metodología › Construcción › pestaña «Instrumentos».
        if (requested === 'instrumentos') {
            try { window.sessionStorage.setItem('projectsia:metodologia:tab', 'instrumentos'); } catch { /* noop */ }
        }
        // El análisis de datos vive dentro de Resultados y discusión › Construcción.
        if (requested === 'analisis') {
            try { window.sessionStorage.setItem('projectsia:resultados:analisis', '1'); } catch { /* noop */ }
        }
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

    // Enlace público de una encuesta: /?encuesta=TOKEN (los participantes responden sin cuenta).
    if (encuestaToken) {
        return <Suspense fallback={<Cargando pantalla texto="Cargando la encuesta…" />}><EncuestaPublica token={encuestaToken} /></Suspense>;
    }

    // La app solo se usa con sesión iniciada: sin cuenta se muestra únicamente el ingreso o el registro.
    if (!authReady) return <Cargando pantalla />;
    if (!user) {
        return (
            <div className="app-acceso">
                <Suspense fallback={<Cargando pantalla />}>
                    <Cuenta onNavigate={handleTabChange} activation={activation} resetToken={resetToken} onResetDone={() => setResetToken('')} />
                </Suspense>
                <p className="app-acceso-pie">© Rodrigo García,PhD</p>
            </div>
        );
    }

    // Cuenta activa sin cupo: no puede crear proyectos hasta que el administrador lo autorice.
    if (sinCupo && !isAdmin && !user.mustChangePassword) {
        return (
            <div className="app-acceso">
                <section className="app-espera" role="status">
                    <Layers size={30} color="#4f46e5" aria-hidden="true" />
                    <h1>Tu cuenta está activa</h1>
                    <p><b>Falta un paso:</b> el administrador debe autorizarte para crear tu proyecto. Ya le avisamos que estás esperando.</p>
                    <p>Cuando lo haga te llegará un correo a <b>{user.email}</b> y esta página se actualizará sola. Si un compañero te invita a su proyecto, también lo verás aquí.</p>
                    <div>
                        <button type="button" className="pro-btn pro-btn--primary" disabled={comprobando} onClick={async () => { setComprobando(true); try { await recheck(); } catch { /* se reintenta solo */ } finally { setComprobando(false); } }}>{comprobando ? 'Comprobando…' : 'Comprobar ahora'}</button>
                        <button type="button" className="pro-btn pro-btn--ghost" onClick={handleLogout} disabled={signingOut}>Cerrar sesión</button>
                    </div>
                </section>
                <p className="app-acceso-pie">© Rodrigo García,PhD</p>
            </div>
        );
    }

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
            <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''} ${isSidebarCollapsed ? 'sidebar--collapsed' : ''}`} onMouseOver={mostrarPista} onFocus={mostrarPista} onMouseLeave={() => setPista(null)} onBlur={() => setPista(null)} onClick={() => setPista(null)}>
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

                <nav style={{ flex: 1, overflowY: 'auto', margin: '0.4rem -0.5rem', padding: '0 0.5rem' }}>
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

                <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '0.6rem', borderTop: '1px solid #e2e8f0' }}>
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
            {pista && <div className="sidebar-pista" role="tooltip" style={{ top: pista.y, left: pista.x }}>{pista.texto}</div>}

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

                {others.length > 0 && (
                    <div className="app-presencia" data-aqui={aqui.length > 0} role="status">
                        {aqui.length > 0
                            ? <span><b>{aqui.map((o) => o.name).join(', ')}</b> {aqui.length > 1 ? 'están' : 'está'} en esta misma sección ahora. Para no pisarse, pónganse de acuerdo antes de editarla.</span>
                            : <span>Conectados ahora: {enOtra.map((o) => `${o.name} (${TAB_LABEL[o.tab] || 'otra sección'})`).join(', ')}.</span>}
                    </div>
                )}

                {conflict && (
                    <div className="app-choque" role="alertdialog" aria-label="Cambios al mismo tiempo">
                        <p><b>Dos personas editaron lo mismo a la vez.</b> {[...new Set(conflict.keys.map((c) => c.by))].join(' y ')} guardó cambios en {[...new Set(conflict.keys.map((c) => `«${seccionDe(c.key)}»`))].join(', ')} mientras tú escribías. Tu versión todavía no se ha guardado.</p>
                        <div>
                            <button type="button" className="pro-btn pro-btn--primary" disabled={resolviendo} onClick={() => resolver('mine')}>Guardar la mía</button>
                            <button type="button" className="pro-btn pro-btn--ghost" disabled={resolviendo} onClick={() => resolver('theirs')}>Quedarme con la de {conflict.keys[0].by}</button>
                        </div>
                        <small>Si guardas la tuya, la del compañero queda en Mi proyecto › Historial de versiones.</small>
                    </div>
                )}

                <div className="fade-in">
                    <Suspense fallback={<Cargando />}>
                        {renderContent()}
                    </Suspense>
                </div>
            </main>
        </div>
    );
}

export default App;
