import React, { useState } from 'react';
import { ArrowRight, BarChart3, CheckCircle2, ClipboardList, Compass, Download, FileText, FolderOpen, GraduationCap, History, Layers, Link2, LogOut, Presentation, Search, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { api } from '../services/api';
import { nombreRol } from './Cuentas';
import './Proyecto.css';

const CambioClave = ({ forced }) => {
    const { changePassword } = useProject();
    const [current, setCurrent] = useState('');
    const [next, setNext] = useState('');
    const [repeat, setRepeat] = useState('');
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);
    const [busy, setBusy] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        setError('');
        setDone(false);
        if (next.length < 8) return setError('La nueva contraseña debe tener al menos 8 caracteres.');
        if (next !== repeat) return setError('Las dos contraseñas nuevas no coinciden.');
        setBusy(true);
        try {
            await changePassword({ current, next });
            setCurrent('');
            setNext('');
            setRepeat('');
            setDone(true);
        } catch (err) {
            setError(err.message || 'No se pudo cambiar la contraseña.');
        } finally {
            setBusy(false);
        }
        return undefined;
    };

    return (
        <form className="pro-form" onSubmit={submit} noValidate>
            {forced && (
                <p className="pro-warn" role="alert">
                    Estás usando la contraseña temporal que te entregaron. Cámbiala ahora por una tuya para poder continuar.
                </p>
            )}
            <div className="input-group">
                <label htmlFor="clave-actual">Contraseña actual</label>
                <input id="clave-actual" className="input-field" type="password" autoComplete="current-password" value={current} onChange={(event) => setCurrent(event.target.value)} />
            </div>
            <div className="input-group">
                <label htmlFor="clave-nueva">Nueva contraseña</label>
                <input id="clave-nueva" className="input-field" type="password" autoComplete="new-password" value={next} onChange={(event) => setNext(event.target.value)} aria-describedby="clave-nueva-ayuda" />
                <small id="clave-nueva-ayuda">Mínimo 8 caracteres, distinta de la actual y de tu usuario.</small>
            </div>
            <div className="input-group">
                <label htmlFor="clave-repetir">Repite la nueva contraseña</label>
                <input id="clave-repetir" className="input-field" type="password" autoComplete="new-password" value={repeat} onChange={(event) => setRepeat(event.target.value)} />
            </div>
            {error && <p className="pro-alert" role="alert">{error}</p>}
            {done && <p className="pro-notice" role="status">Contraseña actualizada. Se cerraron tus otras sesiones abiertas.</p>}
            <button type="submit" className="pro-btn pro-btn--primary" disabled={busy}>
                {busy ? 'Un momento…' : 'Cambiar contraseña'}
            </button>
        </form>
    );
};

// Todo lo que hace la app, para quien llega al ingreso sin conocerla.
const BENEFITS = [
    { icon: Presentation, title: '16 clases guiadas', text: 'De la idea al resumen, sección por sección.' },
    { icon: Sparkles, title: 'Asistente de IA', text: 'Sugiere, redacta y revisa con el contexto de tu proyecto (con un número de solicitudes por día).' },
    { icon: Link2, title: 'Coherencia entre secciones', text: 'Detecta lo que no encaja y propone el arreglo.' },
    { icon: Search, title: 'Fuentes reales', text: 'Artículos, teorías y normas, citados en APA 7.' },
    { icon: Compass, title: 'Metodología completa', text: 'Diseño, muestra calculada, cronograma y presupuesto.' },
    { icon: ClipboardList, title: 'Instrumentos y encuestas', text: 'Ármalos, valídalos y recoge respuestas con un enlace.' },
    { icon: BarChart3, title: 'Análisis de datos', text: 'Descriptivos, cruces, correlaciones y análisis cualitativo.' },
    { icon: Download, title: 'Documento listo', text: 'Word, PDF y diapositivas, con índice, tablas y anexos.' },
    { icon: Users, title: 'Trabajo en equipo', text: 'Invita compañeros: todos editan el mismo proyecto y ven quién está en cada sección.' },
    { icon: History, title: 'Historial de versiones', text: 'Compara lado a lado y restaura una sección.' },
    { icon: GraduationCap, title: 'Acompañamiento del profesor', text: 'Organiza grupos, autoriza y revisa tu avance.' },
    { icon: FolderOpen, title: 'Se guarda solo', text: 'En cualquier equipo, incluso si se cae la conexión.' },
];

// Dos columnas que llenan el alto disponible: contexto a la izquierda, acción a la derecha.
const AccountShell = ({ aside, children }) => (
    <div className="acc-layout">
        <aside className="acc-aside">
            <div className="acc-brand"><Layers size={22} aria-hidden="true" /> PROJECTSIA</div>
            {aside}
        </aside>
        <div className="acc-main">{children}</div>
    </div>
);

const BenefitsAside = () => (
    <>
        <div className="acc-aside-body">
            <h2>Formula tu proyecto de investigación paso a paso</h2>
            <p>Una sola herramienta para construir el proyecto completo, clase a clase, con el acompañamiento de tu profesor.</p>
            <ul className="acc-benefits">
                {BENEFITS.map(({ icon: Icon, title, text }) => (
                    <li key={title}>
                        <span className="acc-icon"><Icon size={18} aria-hidden="true" /></span>
                        <span><b>{title}</b>{text}</span>
                    </li>
                ))}
            </ul>
        </div>
        <p className="acc-aside-foot">Para usar las herramientas necesitas una cuenta, que te entrega tu profesor o el administrador: así tu proyecto queda guardado y tu docente puede acompañarlo.</p>
    </>
);

// Crear la contraseña nueva desde el enlace del correo.
const Restablecer = ({ token, onDone, onNavigate }) => {
    const { resetPassword } = useProject();
    const [clave, setClave] = useState('');
    const [repite, setRepite] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const submit = async (event) => {
        event.preventDefault();
        setError('');
        if (clave.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.');
        if (clave !== repite) return setError('Las dos contraseñas no coinciden.');
        setBusy(true);
        try {
            await resetPassword({ token, password: clave });
            onDone();
            onNavigate('proyecto');
        } catch (err) {
            setError(err.message || 'No se pudo cambiar la contraseña.');
        } finally {
            setBusy(false);
        }
        return undefined;
    };
    return (
        <AccountShell aside={<BenefitsAside />}>
            <section className="acc-card">
                <h2>Crea tu contraseña nueva</h2>
                <p className="acc-lead">Al guardarla entras de una vez y se cierran las sesiones que tuvieras abiertas en otros equipos.</p>
                <form className="pro-form" onSubmit={submit} noValidate>
                    <div className="input-group">
                        <label htmlFor="reset-clave">Contraseña nueva</label>
                        <input id="reset-clave" className="input-field" type="password" autoComplete="new-password" value={clave} onChange={(e) => setClave(e.target.value)} />
                        <small>Mínimo 8 caracteres.</small>
                    </div>
                    <div className="input-group">
                        <label htmlFor="reset-repite">Repite la contraseña</label>
                        <input id="reset-repite" className="input-field" type="password" autoComplete="new-password" value={repite} onChange={(e) => setRepite(e.target.value)} />
                    </div>
                    {error && <p className="pro-alert" role="alert">{error}</p>}
                    <button type="submit" className="pro-btn pro-btn--primary pro-btn--block" disabled={busy}>{busy ? 'Un momento…' : 'Guardar y entrar'}</button>
                    <button type="button" className="pro-link" onClick={onDone}>Volver a iniciar sesión</button>
                </form>
            </section>
        </AccountShell>
    );
};

const Cuenta = ({ onNavigate, activation, resetToken, onResetDone }) => {
    const { user, login, entrarInvitado, logout, hasContent, projects } = useProject();
    const [olvido, setOlvido] = useState(null); // null | 'form' | 'sent' | 'nomail'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);
    const [resent, setResent] = useState(false);

    const resend = async (address) => {
        setResent(false);
        try {
            await api.resend(address);
            setResent(true);
        } catch (err) {
            setError({ message: err.message });
        }
    };

    const submit = async (event) => {
        event.preventDefault();
        setError(null);
        setResent(false);

        if (!email.trim() || !password) return setError({ message: 'Escribe tu usuario y tu contraseña.' });

        setBusy(true);
        try {
            await login({ email: email.trim(), password });
            onNavigate('proyecto');
            setPassword('');
        } catch (err) {
            setError({ message: err.message || 'No se pudo completar la solicitud.', code: err.code });
        } finally {
            setBusy(false);
        }
        return undefined;
    };

    const comoInvitado = async () => {
        setError(null);
        setBusy(true);
        try {
            await entrarInvitado();
            onNavigate('ideacion');
        } catch (err) {
            setError({ message: err.message || 'No se pudo entrar como invitado.' });
        } finally {
            setBusy(false);
        }
    };

    const signOut = async () => {
        setError(null);
        setBusy(true);
        try {
            await logout();
        } catch (err) {
            setError({ message: err.message || 'No se pudo cerrar la sesión.' });
        } finally {
            setBusy(false);
        }
    };

    if (user) {
        const isAdmin = user.role === 'admin';
        const aside = (
            <>
                <div className="acc-aside-body">
                    <h2>Hola, {user.name.split(' ')[0]}</h2>
                    <p>{isAdmin ? `Usuario: ${user.email}` : user.email}</p>
                    <dl className="acc-stats">
                        {user.role !== 'guest' && <div><dt>Proyectos</dt><dd>{projects.length}</dd></div>}
                        <div><dt>Rol</dt><dd>{nombreRol(user.role)}</dd></div>
                    </dl>
                    {!user.mustChangePassword && (
                        <div className="acc-aside-actions">
                            <button type="button" className="pro-btn acc-btn-light" onClick={() => onNavigate(isAdmin ? 'admin' : user.role === 'guest' ? 'ideacion' : 'proyecto')}>
                                {isAdmin ? <><ShieldCheck size={16} /> Ir a la administración</> : user.role === 'guest' ? <><FileText size={16} /> Ver las presentaciones</> : <><FileText size={16} /> Ir a mi proyecto</>} <ArrowRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
                <button type="button" className="acc-signout" onClick={signOut} disabled={busy}>
                    <LogOut size={16} /> Cerrar sesión
                </button>
            </>
        );
        return (
            <AccountShell aside={aside}>
                <section className="acc-card">
                    {activation?.status === 'ok' && (
                        <p className="pro-notice" role="status"><CheckCircle2 size={16} style={{ verticalAlign: '-3px' }} /> Tu cuenta quedó activada. Ya puedes guardar tu proyecto.</p>
                    )}
                    {error && <p className="pro-alert" role="alert">{error.message}</p>}
                    {user.comun ? (
                        <>
                            <h2>Entraste como invitado</h2>
                            <p className="acc-lead">Puedes ver las presentaciones de todos los módulos. Para construir tu proyecto, guardar tu avance y usar el asistente necesitas una cuenta propia: pídela a tu profesor o al administrador.</p>
                        </>
                    ) : (
                        <>
                            <h2>Cambiar contraseña</h2>
                            <p className="acc-lead">Usa una contraseña que no uses en otros sitios. Al cambiarla se cierran tus otras sesiones.</p>
                            <CambioClave forced={user.mustChangePassword} />
                        </>
                    )}
                </section>
            </AccountShell>
        );
    }

    if (resetToken && !user) return <Restablecer token={resetToken} onDone={onResetDone} onNavigate={onNavigate} />;

    if (olvido) {
        const pedir = async (event) => {
            event.preventDefault();
            setError(null);
            if (!email.trim()) return setError({ message: 'Escribe el correo de tu cuenta.' });
            setBusy(true);
            try {
                const r = await api.forgot(email.trim());
                setOlvido(r.mail ? 'sent' : 'nomail');
            } catch (err) {
                setError({ message: err.message });
            } finally {
                setBusy(false);
            }
            return undefined;
        };
        return (
            <AccountShell aside={<BenefitsAside />}>
                <section className="acc-card">
                    <h2>Recupera tu contraseña</h2>
                    {olvido === 'form' && (
                        <>
                            <p className="acc-lead">Escribe el correo de tu cuenta y te enviaremos un enlace para crear una contraseña nueva.</p>
                            <form className="pro-form" onSubmit={pedir} noValidate>
                                <div className="input-group">
                                    <label htmlFor="olvido-correo">Correo electrónico</label>
                                    <input id="olvido-correo" className="input-field" type="email" autoComplete="email" autoCapitalize="none" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={160} />
                                </div>
                                {error && <p className="pro-alert" role="alert">{error.message}</p>}
                                <button type="submit" className="pro-btn pro-btn--primary pro-btn--block" disabled={busy}>{busy ? 'Un momento…' : 'Enviarme el enlace'}</button>
                            </form>
                        </>
                    )}
                    {olvido === 'sent' && <p className="acc-lead">Si <strong>{email.trim()}</strong> tiene una cuenta, acabamos de enviarle un enlace para crear una contraseña nueva. Vence en 60 minutos. Si no lo ves, revisa el correo no deseado.</p>}
                    {olvido === 'nomail' && <p className="pro-alert" role="alert">El envío de correos no está disponible en este momento. Pide ayuda al administrador de la plataforma.</p>}
                    <button type="button" className="pro-link" onClick={() => { setOlvido(null); setError(null); }}>Volver a iniciar sesión</button>
                </section>
            </AccountShell>
        );
    }

    return (
        <AccountShell aside={<BenefitsAside />}>
            <section className="acc-card">
                {activation?.status === 'working' && <p className="pro-notice" role="status">Activando tu cuenta…</p>}
                {activation?.status === 'error' && <p className="pro-alert" role="alert">{activation.message}</p>}
                <h2>Inicia sesión</h2>

                <p className="acc-lead">
                    Entra para abrir tus proyectos guardados.
                    {hasContent && ' Lo que ya escribiste en este navegador se conserva y pasa a tu cuenta.'}
                </p>

                <form className="pro-form" onSubmit={submit} noValidate>
                    <div className="input-group">
                        <label htmlFor="cuenta-correo">Correo o usuario</label>
                        <input
                            id="cuenta-correo"
                            className="input-field"
                            type="text"
                            autoComplete="username"
                            autoCapitalize="none"
                            spellCheck={false}
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            maxLength={160}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="cuenta-clave">Contraseña</label>
                        <input
                            id="cuenta-clave"
                            className="input-field"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                        />
                        <button type="button" className="pro-link acc-olvido" onClick={() => { setOlvido('form'); setError(null); }}>¿Olvidaste tu contraseña?</button>
                    </div>

                    {error && (
                        <div className="pro-alert" role="alert">
                            {error.message}
                            {error.code === 'pending' && (
                                <>
                                    {' '}
                                    <button type="button" className="pro-link" onClick={() => resend(email.trim())}>Enviar un enlace nuevo</button>
                                </>
                            )}
                        </div>
                    )}
                    {resent && <p className="pro-notice" role="status">Si la cuenta sigue pendiente, enviamos un enlace nuevo a ese correo.</p>}

                    <button type="submit" className="pro-btn pro-btn--primary pro-btn--block" disabled={busy}>
                        {busy ? 'Un momento…' : 'Iniciar sesión'}
                    </button>
                </form>

                <div className="acc-invitado">
                    <span>o</span>
                    <button type="button" className="pro-btn pro-btn--ghost pro-btn--block" disabled={busy} onClick={comoInvitado}><Presentation size={16} /> Entrar como invitado</button>
                    <small>Sin cuenta: solo verás las presentaciones de cada módulo.</small>
                </div>

                <p className="pro-fine">
                    ¿No tienes cuenta? Aquí nadie se registra por su cuenta: la crea el administrador de la plataforma o tu profesor, que te entrega tu usuario y una contraseña temporal.
                </p>
            </section>
        </AccountShell>
    );
};

export default Cuenta;
