import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Maximize2, Minimize2, Pause, Play, RotateCcw, XCircle } from 'lucide-react';
import Citar from './Citar';
import RevisarIA from './RevisarIA';
import Redactar from './Redactar';
import { campoDe, fijarValor, placeholderDe, valorDe } from './campo';
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

const readIndex = (key, total) => {
    try {
        const stored = Number(window.localStorage.getItem(key));
        return Number.isInteger(stored) && stored >= 0 && stored < total ? stored : 0;
    } catch {
        return 0;
    }
};

/**
 * Presentación de una clase: secciones, temporizador por diapositiva, pantalla completa,
 * barra de progreso y navegación con teclado. Cada diapositiva la pinta `renderSlide`.
 */
const SlideDeck = ({ sections, slides, storageKey, label, renderSlide, finish }) => {
    const [index, setIndex] = useState(() => readIndex(storageKey, slides.length));
    const [direction, setDirection] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const reduceMotion = useReducedMotion();
    const stageRef = useRef(null);
    const slideRef = useRef(null);
    const headingRef = useRef(null);
    const didMount = useRef(false);

    const totalMinutes = slides.reduce((sum, slide) => sum + slide.min, 0);
    const sectionMinutes = (id) => slides.filter((slide) => slide.section === id).reduce((sum, slide) => sum + slide.min, 0);

    const goTo = useCallback((next) => {
        setIndex((current) => {
            const target = Math.max(0, Math.min(slides.length - 1, next));
            if (target !== current) setDirection(target > current ? 1 : -1);
            return target;
        });
    }, [slides.length]);

    const goToSection = useCallback((sectionId) => goTo(slides.findIndex((item) => item.section === sectionId)), [goTo, slides]);

    useEffect(() => {
        const onKey = (event) => {
            if (event.altKey || event.ctrlKey || event.metaKey) return;
            if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
            if (event.key === 'ArrowRight' || event.key === 'PageDown') goTo(index + 1);
            if (event.key === 'ArrowLeft' || event.key === 'PageUp') goTo(index - 1);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [goTo, index]);

    useEffect(() => {
        try {
            window.localStorage.setItem(storageKey, String(index));
        } catch {
            /* el progreso no se guarda si el almacenamiento está bloqueado */
        }
        if (!didMount.current) {
            didMount.current = true;
            return;
        }
        slideRef.current?.scrollTo({ top: 0 });
        document.querySelector('.main-content')?.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    }, [index, reduceMotion, storageKey]);

    useEffect(() => {
        const onChange = () => setIsFullscreen(document.fullscreenElement === stageRef.current);
        document.addEventListener('fullscreenchange', onChange);
        return () => document.removeEventListener('fullscreenchange', onChange);
    }, []);

    const toggleFullscreen = () => {
        if (document.fullscreenElement) document.exitFullscreen?.();
        else stageRef.current?.requestFullscreen?.().catch(() => {});
    };

    const slide = slides[index];
    const isFirst = index === 0;
    const isLast = index === slides.length - 1;
    const shift = reduceMotion ? 0 : 28;
    const canFullscreen = typeof document !== 'undefined' && document.fullscreenEnabled;
    const heading = <h2 ref={headingRef} tabIndex={-1}>{slide.title}</h2>;

    return (
        <div className="ide-deck">
            <section ref={stageRef} className="ide-stage" aria-roledescription="presentación" aria-label={label} onKeyDown={fillExample}>
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
                    </div>
                    <div className="ide-tools">
                        <RevisarIA etiqueta={label} />
                        <Redactar stageRef={stageRef} />
                        <Citar stageRef={stageRef} />
                        <Temporizador key={slide.id} minutes={slide.min} />
                        {canFullscreen && (
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
                </div>

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

                    {isLast && finish ? (
                        <button type="button" className="ide-btn ide-btn--primary" onClick={finish.onClick}>
                            {finish.label} <ArrowRight size={16} />
                        </button>
                    ) : (
                        <button type="button" className="ide-btn ide-btn--primary" onClick={() => goTo(index + 1)} disabled={isLast}>
                            Siguiente <ArrowRight size={16} />
                        </button>
                    )}
                </nav>
            </section>

            <p className="ide-keys">
                Avanza con las teclas <kbd>←</kbd> y <kbd>→</kbd>. En un campo vacío, <kbd>Tab</kbd> escribe el ejemplo. Clase completa: {totalMinutes} minutos.
            </p>
        </div>
    );
};

export default SlideDeck;
