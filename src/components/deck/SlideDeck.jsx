import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Maximize2, Minimize2, Pause, Play, Presentation, RotateCcw, X, XCircle } from 'lucide-react';
import Citar from './Citar';
import RevisarIA from './RevisarIA';
import Redactar from './Redactar';
import { campoDe, fijarValor, placeholderDe, valorDe } from './campo';
import { useProject } from '../../context/ProjectContext';
import '../Ideacion.css';

/* Piezas compartidas por las clases en diapositivas (Ideación, Título…). */

export const Temporizador = ({ minutes }) => {
    const [left, setLeft] = useState(minutes * 60);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        if (!running) return undefined;
        const timer = window.setInterval(() => {
            setLeft((value) => {
                if (value <= 1) {
                    setRunning(false);
                    return 0;
                }
                return value - 1;
            });
        }, 1000);
        return () => window.clearInterval(timer);
    }, [running]);

    const mm = String(Math.floor(left / 60)).padStart(2, '0');
    const ss = String(left % 60).padStart(2, '0');
    const done = left === 0;

    return (
        <div className="ide-timer" data-done={done}>
            <Clock size={15} aria-hidden="true" />
            <span className="ide-timer-time" role="timer" aria-label={`Tiempo restante: ${mm} minutos ${ss} segundos`}>{mm}:{ss}</span>
            <button
                type="button"
                className="ide-icon-btn"
                aria-label={running ? 'Pausar temporizador' : 'Iniciar temporizador'}
                title={running ? 'Pausar' : 'Iniciar'}
                disabled={done}
                onClick={() => setRunning((value) => !value)}
            >
                {running ? <Pause size={15} /> : <Play size={15} />}
            </button>
            <button
                type="button"
                className="ide-icon-btn"
                aria-label="Reiniciar temporizador"
                title="Reiniciar"
                onClick={() => { setRunning(false); setLeft(minutes * 60); }}
            >
                <RotateCcw size={15} />
            </button>
        </div>
    );
};

export const Pestanas = ({ title, name, items }) => {
    const [active, setActive] = useState(items[0].id);
    const current = items.find((item) => item.id === active);

    return (
        <div className="ide-panel">
            <h3>{title}</h3>
            <div className="ide-tabs" role="tablist" aria-label={title}>
                {items.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        role="tab"
                        id={`ide-${name}-tab-${item.id}`}
                        aria-selected={active === item.id}
                        aria-pressed={active === item.id}
                        aria-controls={`ide-${name}-panel`}
                        className="ide-chip"
                        onClick={() => setActive(item.id)}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
            <div className="ide-tabpanel" role="tabpanel" id={`ide-${name}-panel`} aria-labelledby={`ide-${name}-tab-${active}`}>
                <p>{current.what}</p>
                <p>{current.example}</p>
            </div>
        </div>
    );
};

export const Opciones = ({ title, questions }) => {
    const [answers, setAnswers] = useState({});
    const answered = Object.keys(answers).length;
    const score = questions.filter((question, index) => answers[index] === question.answer).length;

    return (
        <div className="ide-panel">
            <h3>{title}</h3>
            <div className="ide-quiz">
                {questions.map((question, index) => {
                    const chosen = answers[index];
                    const isRight = chosen === question.answer;
                    return (
                        <div className="ide-quiz-item" key={question.text}>
                            <p>{question.text}</p>
                            <div className="ide-quiz-actions">
                                {question.options.map((option, optionIndex) => (
                                    <button
                                        key={option}
                                        type="button"
                                        className="ide-chip"
                                        aria-pressed={chosen === optionIndex}
                                        disabled={chosen !== undefined}
                                        onClick={() => setAnswers((prev) => ({ ...prev, [index]: optionIndex }))}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                            {chosen !== undefined && (
                                <div className={`ide-feedback ${isRight ? 'ide-feedback--ok' : 'ide-feedback--bad'}`} role="status">
                                    {isRight ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                    <span><strong style={{ color: 'inherit' }}>{isRight ? 'Correcto.' : 'No exactamente.'}</strong> {question.why}</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            {answered > 0 && (
                <div className="ide-row">
                    <span>{score} de {questions.length} aciertos</span>
                    <button type="button" className="ide-btn ide-btn--ghost" onClick={() => setAnswers({})}>
                        <RotateCcw size={15} /> Reiniciar
                    </button>
                </div>
            )}
        </div>
    );
};


// Tab en un campo vacío escribe el texto del ejemplo («Ej: …») o el de data-autofill.
const fillExample = (event) => {
    if (event.key !== 'Tab' || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return;
    const el = campoDe(event.target);
    if (!el || valorDe(el).trim() !== '') return;
    const source = el.dataset.autofill || placeholderDe(el);
    if (!el.dataset.autofill && !/^Ej[:.]/i.test(source)) return;
    const text = source.replace(/^Ej[:.]\s*/i, '').replace(/(\s*(…|\.\.\.))+\s*$/, '').trim();
    if (!text) return;
    event.preventDefault();
    fijarValor(el, text);
};

/*
 * Un mazo de diapositivas. Hay dos por clase:
 * - el principal, en la página: «Construcción» y «Revisión»;
 * - la «Presentación», en una ventana grande: la teoría de la clase (Apertura … Cierre).
 * `onFuera(seccion)` avisa cuando se pide una sección que está en el otro mazo.
 */
const Mazo = ({ sections, slides, label, renderSlide, finish, soloVer = false, enModal = false, activo = true, seccionInicial, salto, pantallaRef, onPresentacion, onFuera, onCerrar, totalClase, minutosDe }) => {
    // Abre siempre en su primera diapositiva (o en la sección pedida): no se recuerda dónde quedó la vez anterior.
    const [index, setIndex] = useState(() => Math.max(0, slides.findIndex((item) => item.section === seccionInicial)));
    const [direction, setDirection] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    // Mazo de la página en una clase con presentación aparte: se navega con las pestañas, no paso a paso.
    const sinPasos = Boolean(onPresentacion);
    const reduceMotion = useReducedMotion();
    const stageRef = useRef(null);
    const slideRef = useRef(null);
    const headingRef = useRef(null);
    const didMount = useRef(false);

    // Los minutos se cuentan sobre toda la clase, no solo sobre este mazo.
    const totalMinutes = totalClase;
    const sectionMinutes = minutosDe;

    const goTo = useCallback((next) => {
        setIndex((current) => {
            const target = Math.max(0, Math.min(slides.length - 1, next));
            if (target !== current) setDirection(target > current ? 1 : -1);
            return target;
        });
    }, [slides.length]);

    const goToSection = useCallback((sectionId) => {
        const destino = slides.findIndex((item) => item.section === sectionId);
        if (destino >= 0) goTo(destino);
        else onFuera?.(sectionId);
    }, [goTo, slides, onFuera]);

    // Cuando el otro mazo pide una sección de este, se salta a ella.
    useEffect(() => {
        if (!salto) return;
        const destino = slides.findIndex((item) => item.section === salto.seccion);
        if (destino >= 0) goTo(destino);
        // Solo al recibir un salto nuevo: si dependiera de `slides`, cada cambio del proyecto devolvería la clase a esa sección.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [salto]);

    useEffect(() => {
        const onKey = (event) => {
            // Con la presentación abierta, las flechas solo mueven la presentación.
            if (!activo || sinPasos) return;
            if (event.altKey || event.ctrlKey || event.metaKey) return;
            if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
            if (event.key === 'ArrowRight' || event.key === 'PageDown') goTo(index + 1);
            if (event.key === 'ArrowLeft' || event.key === 'PageUp') goTo(index - 1);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [goTo, index, activo, sinPasos]);

    useEffect(() => {
        if (!didMount.current) {
            didMount.current = true;
            return;
        }
        slideRef.current?.scrollTo({ top: 0 });
        document.querySelector('.main-content')?.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    }, [index, reduceMotion]);

    useEffect(() => {
        const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement) && document.fullscreenElement === (pantallaRef?.current ?? stageRef.current));
        onChange(); // la presentación ya llega en pantalla completa
        document.addEventListener('fullscreenchange', onChange);
        return () => document.removeEventListener('fullscreenchange', onChange);
    }, []);

    const toggleFullscreen = () => {
        if (document.fullscreenElement) document.exitFullscreen?.();
        else (pantallaRef?.current ?? stageRef.current)?.requestFullscreen?.().catch(() => {});
    };

    const slide = slides[index];
    const isFirst = index === 0;
    const isLast = index === slides.length - 1;
    const shift = reduceMotion ? 0 : 28;
    const canFullscreen = typeof document !== 'undefined' && document.fullscreenEnabled;
    const heading = <h2 ref={headingRef} tabIndex={-1}>{slide.title}</h2>;

    return (
        <div className={`ide-deck${enModal ? ' ide-deck--modal' : ''}${sinPasos ? ' ide-deck--pagina' : ''}`}>
            <section ref={stageRef} className="ide-stage" aria-roledescription="presentación" aria-label={enModal ? `Presentación de la clase: ${label}` : label} onKeyDown={fillExample}>
                <header className="ide-top">
                    <div className="ide-sections" role="group" aria-label="Secciones de la clase">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                type="button"
                                className="ide-section"
                                aria-current={slide.section === section.id ? 'true' : undefined}
                                title={`${section.label}: ${sectionMinutes(section.id)} minutos`}
                                onClick={() => goToSection(section.id)}
                            >
                                {section.label}
                            </button>
                        ))}
                        {onPresentacion && (
                            <button type="button" className="ide-section ide-section--pres" title={`Presentación de la clase: ${totalClase - slides.reduce((sum, item) => sum + item.min, 0)} minutos`} onClick={() => onPresentacion()}>
                                <Presentation size={15} aria-hidden="true" /> Presentación
                            </button>
                        )}
                    </div>
                    <div className="ide-tools">
                        {!enModal && !soloVer && <RevisarIA etiqueta={label} />}
                        {!enModal && !soloVer && <Redactar stageRef={stageRef} />}
                        {!enModal && !soloVer && <Citar stageRef={stageRef} />}
                        {/* En la página no hay tiempo ni pantalla completa: eso es de la presentación. */}
                        {!sinPasos && <Temporizador key={slide.id} minutes={slide.min} />}
                        {!sinPasos && canFullscreen && (
                            <button
                                type="button"
                                className="ide-icon-btn"
                                aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Ver en pantalla completa'}
                                title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                                onClick={toggleFullscreen}
                            >
                                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                            </button>
                        )}
                        {enModal && (
                            <button type="button" className="ide-icon-btn" aria-label="Cerrar la presentación" title="Cerrar la presentación" onClick={onCerrar}>
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </header>

                <div className="ide-viewport" ref={slideRef}>
                    <AnimatePresence mode="wait" custom={direction} initial={false}>
                        <motion.div
                            key={slide.id}
                            className={`ide-slide ide-slide--split${slide.layout ? ` ide-slide--${slide.layout}` : ''}`}
                            role="group"
                            aria-roledescription="diapositiva"
                            aria-label={`${index + 1} de ${slides.length}: ${slide.title}`}
                            custom={direction}
                            variants={{
                                enter: (dir) => ({ opacity: 0, x: dir * shift }),
                                center: { opacity: 1, x: 0 },
                                exit: (dir) => ({ opacity: 0, x: dir * -shift }),
                            }}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: reduceMotion ? 0.01 : 0.26, ease: [0.16, 1, 0.3, 1] }}
                            onAnimationComplete={(definition) => {
                                if (definition === 'center' && didMount.current) headingRef.current?.focus({ preventScroll: true });
                            }}
                        >
                            {renderSlide({ slide, heading, goTo, goToSection, sectionMinutes, totalMinutes })}
                        </motion.div>
                    </AnimatePresence>
                    {/* En la página, una pestaña con varias partes (p. ej. «Construye tu título» y «Mejóralo con IA») las muestra todas, una bajo otra. */}
                    {sinPasos && slides.filter((item) => item.section === slide.section && item.id !== slide.id).map((item) => (
                        <div key={item.id} className={`ide-slide ide-slide--split ide-slide--extra${item.layout ? ` ide-slide--${item.layout}` : ''}`} role="group" aria-label={item.title}>
                            {renderSlide({ slide: item, heading: <h2>{item.title}</h2>, goTo, goToSection, sectionMinutes, totalMinutes })}
                        </div>
                    ))}
                </div>

                {/* En la página (Construcción y Revisión) se cambia con las pestañas: sin Anterior/Siguiente; solo queda el paso a la siguiente herramienta. */}
                {sinPasos ? (finish && (
                    <nav className="ide-nav ide-nav--solo" aria-label="Siguiente paso">
                        <button type="button" className="ide-btn ide-btn--primary" onClick={finish.onClick}>
                            {finish.label} <ArrowRight size={16} />
                        </button>
                    </nav>
                )) : (
                <nav className="ide-nav" aria-label="Navegación de diapositivas">
                    <button type="button" className="ide-btn ide-btn--ghost" onClick={() => goTo(index - 1)} disabled={isFirst}>
                        <ArrowLeft size={16} /> Anterior
                    </button>

                    <div className="ide-progress">
                        <div className="ide-progress-track">
                            {slides.map((item, i) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    className="ide-dot"
                                    data-state={i === index ? 'current' : i < index ? 'done' : 'todo'}
                                    aria-label={`Ir a la diapositiva ${i + 1}: ${item.title}`}
                                    aria-current={i === index ? 'step' : undefined}
                                    title={`${item.title} · ${item.min} min`}
                                    onClick={() => goTo(i)}
                                />
                            ))}
                        </div>
                        <span className="ide-count">{index + 1} de {slides.length}</span>
                    </div>

                    <div className="ide-nav-fin">
                        {/* Tras revisar lo construido, el paso natural es la siguiente herramienta; la teoría que sigue es de apoyo. */}
                        {finish && !isLast && slide.section === 'revision' && (
                            <button type="button" className="ide-btn ide-btn--ghost ide-btn--siguiente-paso" onClick={finish.onClick}>
                                {finish.label} <ArrowRight size={16} />
                            </button>
                        )}
                        {isLast && finish ? (
                            <button type="button" className="ide-btn ide-btn--primary" onClick={finish.onClick}>
                                {finish.label} <ArrowRight size={16} />
                            </button>
                        ) : (
                            <button type="button" className="ide-btn ide-btn--primary" onClick={() => goTo(index + 1)} disabled={isLast}>
                                Siguiente <ArrowRight size={16} />
                            </button>
                        )}
                    </div>
                </nav>
                )}
            </section>

            {!enModal && !soloVer && (
                <p className="ide-keys">
                    {slides.length > 1 && !sinPasos && <>Avanza con las teclas <kbd>←</kbd> y <kbd>→</kbd>. </>}En un campo vacío, <kbd>Tab</kbd> escribe el ejemplo.{onPresentacion ? ` La presentación de la clase dura ${totalClase - slides.reduce((sum, item) => sum + item.min, 0)} minutos.` : ''}
                </p>
            )}
        </div>
    );
};

// Secciones de trabajo, que se quedan en la página; el resto es la presentación de la clase.
const DE_TRABAJO = new Set(['construccion', 'sintesis', 'revision']);

// `storageKey` se sigue aceptando para no cambiar las clases, pero ya no se usa.
const SlideDeck = ({ sections, slides, label, renderSlide, finish }) => {
    const { user } = useProject();
    const invitado = user?.role === 'guest'; // solo ve la presentación: sin construcción, revisión ni herramientas de escritura
    const [presentacion, setPresentacion] = useState(null); // null = cerrada; { seccion } = abierta (en esa sección)
    const [irA, setIrA] = useState(null); // { seccion }: sección de trabajo pedida desde la presentación
    const dialog = useRef(null);
    const pantalla = useRef(null);

    const trabajo = slides.filter((item) => DE_TRABAJO.has(item.section));
    const teoria = slides.filter((item) => !DE_TRABAJO.has(item.section));
    const comunes = {
        label,
        renderSlide,
        totalClase: slides.reduce((sum, item) => sum + item.min, 0),
        minutosDe: (id) => slides.filter((item) => item.section === id).reduce((sum, item) => sum + item.min, 0),
    };

    useEffect(() => {
        const el = dialog.current;
        if (!el) return;
        if (presentacion && !el.open) { el.showModal(); el.focus(); } // el foco va a la ventana, no a la primera pestaña
        if (!presentacion) {
            if (el.open) el.close();
            if (document.fullscreenElement && document.fullscreenElement === pantalla.current) document.exitFullscreen?.();
        }
    }, [presentacion]);

    // «Presentación» abre directamente en pantalla completa. Se pide dentro del mismo clic, que es cuando el navegador lo permite;
    // si lo niega, la presentación queda como ventana grande. Un <dialog> no puede ir a pantalla completa: va su contenedor.
    const abrir = (seccion) => {
        const el = dialog.current;
        if (el && !el.open) { el.showModal(); el.focus(); }
        pantalla.current?.requestFullscreen?.().catch(() => {});
        setPresentacion({ seccion });
    };

    if (invitado) {
        if (teoria.length === 0) return <p className="ide-invitado-nota">Este módulo no tiene presentación: es solo de trabajo sobre el proyecto.</p>;
        return (
            <>
                <p className="ide-invitado-nota">Estás viendo la presentación de este módulo como invitado. La construcción del proyecto y el asistente de IA son para las cuentas de estudiantes, profesores e investigadores.</p>
                <Mazo {...comunes} soloVer totalClase={teoria.reduce((sum, item) => sum + item.min, 0)} sections={sections.filter((item) => !DE_TRABAJO.has(item.id))} slides={teoria} />
            </>
        );
    }

    // Una clase sin secciones de trabajo (o sin teoría) se muestra como un solo mazo.
    if (trabajo.length === 0 || teoria.length === 0) return <Mazo {...comunes} sections={sections} slides={slides} finish={finish} />;

    return (
        <>
            <Mazo
                {...comunes}
                sections={sections.filter((item) => DE_TRABAJO.has(item.id))}
                slides={trabajo}
                finish={finish}
                activo={!presentacion}
                salto={irA}
                onPresentacion={() => abrir(teoria[0].section)}
                onFuera={abrir}
            />
            <dialog ref={dialog} tabIndex={-1} className="ide-pres-modal" aria-label={`Presentación de la clase: ${label}`} onClose={() => setPresentacion(null)}>
                <div ref={pantalla} className="ide-pres-full">
                {presentacion && (
                    <Mazo
                        {...comunes}
                        key={presentacion.seccion}
                        sections={sections.filter((item) => !DE_TRABAJO.has(item.id))}
                        slides={teoria}
                        enModal
                        pantallaRef={pantalla}
                        seccionInicial={presentacion.seccion}
                        onCerrar={() => setPresentacion(null)}
                        onFuera={(seccion) => { setPresentacion(null); setIrA({ seccion }); }}
                    />
                )}
                </div>
            </dialog>
        </>
    );
};

export default SlideDeck;
