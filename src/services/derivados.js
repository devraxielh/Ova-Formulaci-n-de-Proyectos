// Cronograma y presupuesto derivados: el cronograma sale de las fases y el presupuesto de la muestra, los instrumentos,
// la duración y el equipo. Aquí se arma el cronograma y se detecta cuándo uno u otro dejó de coincidir con lo que
// cambió después. Todo es cálculo: nada de esto lo decide la IA.

const t = (v) => String(v ?? '').replace(/\s+/g, ' ').trim().replace(/[\s.,;:]+$/, '');
const plano = (v) => t(v).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const capital = (s) => (s ? s[0].toUpperCase() + s.slice(1) : '');
const lista = (v) => (Array.isArray(v) ? v : []);
const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

// Las actividades de cada fase, una fase tras otra según su duración.
export const cronogramaDesdeFases = (fasesForm) => {
    const unidad = fasesForm?.unidad === 'meses' ? 'mensual' : 'semanal';
    let inicio = 1;
    const filas = [];
    const tramos = [];
    lista(fasesForm?.fases).filter((x) => t(x?.nombre)).forEach((x, i) => {
        const fin = inicio + Math.max(1, Number(x.duracion) || 1) - 1;
        const fase = `Fase ${i + 1}. ${capital(t(x.nombre))}`.slice(0, 60);
        tramos.push({ fase, inicio, fin });
        lista(x.actividades).filter((a) => t(a)).forEach((a) => filas.push({ fase, actividad: capital(t(a)), inicio, fin }));
        inicio = fin + 1;
    });
    return { filas, tramos, unidad, periodos: inicio - 1 };
};

const nombres = (xs) => `${xs.slice(0, 2).map((x) => `«${x.length > 60 ? `${x.slice(0, 57)}…` : x}»`).join(', ')}${xs.length > 2 ? ` y ${xs.length - 2} más` : ''}`;

// Qué dejó de coincidir entre las fases y el cronograma. Lista vacía: coinciden (o no hay fases).
export const desfaseCronograma = (data) => {
    const d = cronogramaDesdeFases(data?.fasesForm);
    if (!d.filas.length) return [];
    const items = lista(data?.cronogramaItems).filter((x) => t(x?.actividad));
    if (!items.length) return ['Tus fases todavía no están en el cronograma.'];
    const avisos = [];
    const unidadCrono = data?.ganttUnidad === 'semanal' ? 'semanal' : 'mensual';
    const nombreUnidad = (u, n) => (u === 'semanal' ? (n === 1 ? 'semana' : 'semanas') : (n === 1 ? 'mes' : 'meses'));
    const mismaUnidad = unidadCrono === d.unidad;
    const periodos = Number(data?.ganttPeriodos) || 0;
    if (!mismaUnidad) avisos.push(`Las fases están en ${nombreUnidad(d.unidad, 2)} y el cronograma en ${nombreUnidad(unidadCrono, 2)}.`);
    else if (periodos && periodos !== d.periodos) avisos.push(`Las fases suman ${d.periodos} ${nombreUnidad(d.unidad, d.periodos)} y el cronograma dura ${periodos}.`);
    const enCrono = new Set(items.map((x) => plano(x.actividad)));
    // Una misma actividad puede estar en varias fases: se guardan todos sus tramos.
    const enFases = new Map();
    d.filas.forEach((x) => enFases.set(plano(x.actividad), [...(enFases.get(plano(x.actividad)) || []), x]));
    const faltan = d.filas.filter((x) => !enCrono.has(plano(x.actividad))).map((x) => x.actividad);
    if (faltan.length) avisos.push(`${plural(faltan.length, 'actividad de tus fases no está', 'actividades de tus fases no están')} en el cronograma: ${nombres(faltan)}.`);
    // Solo se revisan las filas que vinieron de las fases («Fase 2. …»): las que el estudiante agregó a mano son suyas.
    const sobran = items.filter((x) => /^Fase \d+\./.test(t(x.fase)) && !enFases.has(plano(x.actividad))).map((x) => t(x.actividad));
    if (sobran.length) avisos.push(`${plural(sobran.length, 'actividad del cronograma ya no está', 'actividades del cronograma ya no están')} en tus fases: ${nombres(sobran)}.`);
    if (mismaUnidad) {
        const fuera = items.filter((x) => { const tramos = enFases.get(plano(x.actividad)); return tramos && !tramos.some((f) => Number(x.inicio) >= f.inicio && Number(x.fin) <= f.fin); }).map((x) => t(x.actividad));
        if (fuera.length) avisos.push(`${plural(fuera.length, 'actividad quedó', 'actividades quedaron')} por fuera de las fechas de su fase: ${nombres(fuera)}.`);
    }
    return avisos;
};

// Con qué datos se calculó el presupuesto. Se guarda al sugerirlo (data.presupuestoBase) y se compara después.
export const basePresupuesto = ({ n, instrumentos, periodos, unidad, integrantes }) => ({
    n: t(n),
    instrumentos: lista(instrumentos).map(t).filter(Boolean),
    duracion: `${Number(periodos) || 0} ${unidad === 'semanal' ? 'semanas' : 'meses'}`,
    integrantes: Number(integrantes) || 0,
});

export const desfasePresupuesto = (base, actual) => {
    if (!base || !actual) return [];
    const avisos = [];
    if (t(base.n) !== t(actual.n)) avisos.push(`Los participantes pasaron de ${t(base.n) || 'sin definir'} a ${t(actual.n) || 'sin definir'}.`);
    const antes = new Set(lista(base.instrumentos).map(plano));
    const ahora = new Set(lista(actual.instrumentos).map(plano));
    const nuevos = lista(actual.instrumentos).filter((x) => !antes.has(plano(x)));
    const quitados = lista(base.instrumentos).filter((x) => !ahora.has(plano(x)));
    if (nuevos.length) avisos.push(`${nuevos.length === 1 ? 'Agregaste un instrumento' : `Agregaste ${nuevos.length} instrumentos`}: ${nombres(nuevos)}.`);
    if (quitados.length) avisos.push(`${quitados.length === 1 ? 'Quitaste un instrumento' : `Quitaste ${quitados.length} instrumentos`}: ${nombres(quitados)}.`);
    if (t(base.duracion) !== t(actual.duracion)) avisos.push(`La duración pasó de ${t(base.duracion)} a ${t(actual.duracion)}.`);
    // El equipo solo se compara cuando se conoce en los dos momentos (sin sesión no se sabe).
    if (base.integrantes > 0 && actual.integrantes > 0 && base.integrantes !== actual.integrantes) avisos.push(`El equipo pasó de ${plural(base.integrantes, 'integrante', 'integrantes')} a ${actual.integrantes}.`);
    return avisos;
};
