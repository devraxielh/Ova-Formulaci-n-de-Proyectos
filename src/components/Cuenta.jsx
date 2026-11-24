import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Download, FileText, FolderOpen, Layers, Lightbulb, LogOut, MailCheck, MonitorSmartphone, ShieldCheck } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { api } from '../services/api';
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
                    Estás usando la contraseña inicial. Cámbiala ahora para poder entrar a la administración.
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

const BENEFITS = [
    { icon: FolderOpen, title: 'Tu avance se guarda solo', text: 'Cada herramienta guarda lo que escribes y lo que genera la IA.' },
    { icon: Lightbulb, title: 'De la idea al documento', text: 'Tu idea pasa al título, la pregunta y las demás secciones.' },
    { icon: Download, title: 'Descárgalo en Word', text: 'El proyecto completo, listo para revisar con tu asesor.' },
    { icon: MonitorSmartphone, title: 'Desde cualquier equipo', text: 'Continúa en casa o en la universidad con tu cuenta.' },
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
            <p>Crea una cuenta gratuita para guardar tu proyecto y no perder lo que construyes en cada clase.</p>
            <ul className="acc-benefits">
                {BENEFITS.map(({ icon: Icon, title, text }) => (
                    <li key={title}>
                        <span className="acc-icon"><Icon size={18} aria-hidden="true" /></span>
                        <span><b>{title}</b>{text}</span>
                    </li>
                ))}
            </ul>
        </div>
        <p className="acc-aside-foot">Sin cuenta también puedes usar las herramientas: tu borrador queda en este navegador.</p>
    </>
);

const Cuenta = ({ onNavigate, activation }) => {
    const { user, login, register, logout, hasContent, projects } = useProject();
    const [mode, setMode] = useState('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);
    const [sent, setSent] = useState(null); // { email, emailSent }
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

        if (mode === 'register') {
            if (!name.trim()) return setError({ message: 'Escribe tu nombre.' });
            if (!email.trim()) return setError({ message: 'Escribe tu correo.' });
            if (password.length < 8) return setError({ message: 'La contraseña debe tener al menos 8 caracteres.' });
        } else if (!email.trim() || !password) {
            return setError({ message: 'Escribe tu usuario y tu contraseña.' });
        }

        setBusy(true);
        try {
            if (mode === 'register') {
                const result = await register({ name: name.trim(), email: email.trim(), password });
                setSent({ email: result.email, emailSent: result.emailSent });
            } else {
                await login({ email: email.trim(), password });
                onNavigate('proyecto');
            }
            setPassword('');
        } catch (err) {
            setError({ message: err.message || 'No se pudo completar la solicitud.', code: err.code });
        } finally {
            setBusy(false);
        }
        return undefined;
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
                        <div><dt>Proyectos</dt><dd>{projects.length}</dd></div>
                        <div><dt>Rol</dt><dd>{isAdmin ? 'Administrador' : 'Estudiante'}</dd></div>
                    </dl>
                    {!user.mustChangePassword && (
                        <div className="acc-aside-actions">
                            <button type="button" className="pro-btn acc-btn-light" onClick={() => onNavigate(isAdmin ? 'admin' : 'proyecto')}>
                                {isAdmin ? <><ShieldCheck size={16} /> Ir a la administración</> : <><FileText size={16} /> Ir a mi proyecto</>} <ArrowRight size={16} />
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
                    <h2>Cambiar contraseña</h2>
                    <p className="acc-lead">Usa una contraseña que no uses en otros sitios. Al cambiarla se cierran tus otras sesiones.</p>
                    <CambioClave forced={user.mustChangePassword} />
                </section>
            </AccountShell>
        );
    }

    if (sent) {
        return (
            <AccountShell aside={<BenefitsAside />}>
                <section className="acc-card">
                    <span className="acc-badge-icon"><MailCheck size={24} aria-hidden="true" /></span>
                    <h2>Activa tu cuenta</h2>
                    {sent.emailSent ? (
                        <p className="acc-lead">Enviamos un enlace de activación a <strong>{sent.email}</strong>. Ábrelo para activar tu cuenta; vence en 48 horas. Si no lo ves, revisa la carpeta de correo no deseado.</p>
                    ) : (
                        <p className="acc-lead">Tu cuenta quedó registrada, pero no pudimos enviar el correo de activación a <strong>{sent.email}</strong>. Pide al administrador que active tu cuenta.</p>
                    )}
                    {resent && <p className="pro-notice" role="status">Si la cuenta sigue pendiente, enviamos un enlace nuevo.</p>}
                    {error && <p className="pro-alert" role="alert">{error.message}</p>}
                    <div className="acc-stack">
                        <button type="button" className="pro-btn pro-btn--primary pro-btn--block" onClick={() => { setSent(null); setMode('login'); setEmail(sent.email); }}>
                            Ya la activé, iniciar sesión
                        </button>
                        <button type="button" className="pro-btn pro-btn--ghost pro-btn--block" onClick={() => resend(sent.email)}>Reenviar el enlace</button>
                    </div>
                </section>
            </AccountShell>
        );
    }

    const isRegister = mode === 'register';

    return (
        <AccountShell aside={<BenefitsAside />}>
            <section className="acc-card">
                {activation?.status === 'working' && <p className="pro-notice" role="status">Activando tu cuenta…</p>}
                {activation?.status === 'error' && <p className="pro-alert" role="alert">{activation.message}</p>}
                <h2>{isRegister ? 'Crea tu cuenta' : 'Inicia sesión'}</h2>
                <div className="pro-modes" role="tablist" aria-label="Acceso">
                    <button type="button" role="tab" aria-selected={!isRegister} onClick={() => { setMode('login'); setError(null); }}>Iniciar sesión</button>
                    <button type="button" role="tab" aria-selected={isRegister} onClick={() => { setMode('register'); setError(null); }}>Crear cuenta</button>
                </div>

                <p className="acc-lead">
                    {isRegister
                        ? 'Con una cuenta, tu proyecto se guarda en el servidor y puedes continuarlo desde cualquier equipo. Te enviaremos un enlace para activarla.'
                        : 'Entra para abrir tus proyectos guardados.'}
                    {hasContent && ' Lo que ya escribiste en este navegador se conserva y pasa a tu cuenta.'}
                </p>

                <form className="pro-form" onSubmit={submit} noValidate>
                    {isRegister && (
                        <div className="input-group">
                            <label htmlFor="cuenta-nombre">Nombre completo</label>
                            <input id="cuenta-nombre" className="input-field" type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} maxLength={80} />
                        </div>
                    )}
                    <div className="input-group">
                        <label htmlFor="cuenta-correo">{isRegister ? 'Correo electrónico' : 'Correo o usuario'}</label>
                        <input
                            id="cuenta-correo"
                            className="input-field"
                            type={isRegister ? 'email' : 'text'}
                            autoComplete={isRegister ? 'email' : 'username'}
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
                            autoComplete={isRegister ? 'new-password' : 'current-password'}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            aria-describedby={isRegister ? 'cuenta-clave-ayuda' : undefined}
                        />
                        {isRegister && <small id="cuenta-clave-ayuda">Mínimo 8 caracteres. Por ahora no hay recuperación de contraseña por correo.</small>}
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
                        {busy ? 'Un momento…' : isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
                    </button>
                </form>

                {isRegister && (
                    <p className="pro-fine">
                        Guardamos tu nombre, tu correo y el contenido de tus proyectos para que puedas continuar tu trabajo. El administrador de la plataforma puede consultarlos. No se comparten con terceros.
                    </p>
                )}
            </section>
        </AccountShell>
    );
};

export default Cuenta;
