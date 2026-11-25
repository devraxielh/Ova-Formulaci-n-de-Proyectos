// Resultados de punta a punta: de las respuestas de la encuesta al análisis por objetivo.
import test from 'node:test';
import assert from 'node:assert/strict';
import { analizarPorObjetivo, objetivoDeFila, objetivoDeTexto, objetivosDePreguntas } from '../src/services/resultadosPunta.js';

const LIKERT = ['Totalmente en desacuerdo', 'En desacuerdo', 'Ni de acuerdo ni en desacuerdo', 'De acuerdo', 'Totalmente de acuerdo'];
const definition = { titulo: 'Asistencia', preguntas: [
    { id: 'sexo', texto: 'Sexo', tipo: 'opcion', opciones: ['Mujer', 'Hombre'] },
    { id: 'r1', texto: 'Recibo recordatorios de mis citas', tipo: 'likert', opciones: LIKERT },
    { id: 'r2', texto: 'Los recordatorios me llegan a tiempo', tipo: 'likert', opciones: LIKERT },
    { id: 'a1', texto: 'Asisto a todas mis citas', tipo: 'likert', opciones: LIKERT },
    { id: 'a2', texto: 'Llego puntual a mis citas', tipo: 'likert', opciones: LIKERT },
    { id: 'causa', texto: '¿Por qué faltó la última vez?', tipo: 'opcion', opciones: ['Olvido', 'Transporte', 'Trabajo'] },
] };
// 12 participantes: quien recibe más recordatorios asiste más (relación directa fuerte).
const responses = Array.from({ length: 12 }, (_, i) => {
    const nivel = (i % 5);
    return { answers: { sexo: i % 2 ? 'Hombre' : 'Mujer', r1: LIKERT[nivel], r2: LIKERT[Math.min(4, nivel + (i % 2))], a1: LIKERT[nivel], a2: LIKERT[Math.max(0, nivel - (i % 3 === 0 ? 1 : 0))], causa: ['Olvido', 'Transporte', 'Trabajo'][i % 3] } };
});
const objetivoDe = { sexo: 0, r1: 1, r2: 1, a1: 2, a2: 2, causa: 3 };
const especificos = ['Describir el uso de recordatorios', 'Determinar la relación entre recordatorios y asistencia', 'Identificar las causas de inasistencia', 'Proponer mejoras'];
const plan = [{ objetivo: 'el objetivo específico 1', tecnica: 'Estadística descriptiva' }, { objetivo: 'el objetivo específico 2', tecnica: 'Correlación de Pearson' }, { objetivo: 'el objetivo específico 3', tecnica: 'Frecuencias' }];

test('objetivo de cada pregunta: por su identificador o, si el instrumento se editó tras publicarlo, por su texto', () => {
    const armados = [
        { id: 'ins1', preguntas: [{ id: 'q1', texto: 'Sexo', objetivo: 0 }, { id: 'nuevo', texto: 'Asisto a todas mis citas', objetivo: 2 }] },
        { id: 'ins2', preguntas: [{ id: 'zz', texto: '¿Recibo recordatorios?', objetivo: 1 }] },
    ];
    const def = { preguntas: [{ id: 'q1', texto: 'Sexo' }, { id: 'viejo', texto: 'Asisto a todas mis CITAS.' }, { id: 'otro', texto: 'recibo recordatorios' }, { id: 'nada', texto: 'Pregunta que ya no existe' }] };
    assert.deepEqual(objetivosDePreguntas(def, 'ins1', armados), { q1: 0, viejo: 2, otro: 1, nada: 0 });
    assert.deepEqual(objetivosDePreguntas(def, 'no-existe', []), { q1: 0, viejo: 0, otro: 0, nada: 0 });
});

test('objetivo que nombra una fila del plan', () => {
    assert.equal(objetivoDeFila('Determinar la relación entre recordatorios y asistencia.', ['Describir el uso', 'Determinar la relación entre recordatorios y asistencia']), 2);
    assert.equal(objetivoDeFila('el objetivo específico 1', ['a', 'b']), 1);
    assert.equal(objetivoDeFila('otra cosa distinta', ['Describir el uso']), 0);
    assert.equal(objetivoDeTexto('el objetivo específico 2'), 2);
    assert.equal(objetivoDeTexto('todos los objetivos específicos'), 0);
});

test('análisis por objetivo: tablas, figuras y cifras calculadas con las respuestas', () => {
    const r = analizarPorObjetivo({ encuestas: [{ titulo: 'Asistencia', definition, responses, objetivoDe }], especificos, plan });
    assert.equal(r.n, 12);
    // Caracterización: una tabla con sexo.
    const car = r.tablas.find((x) => x.objetivo === 0);
    assert.deepEqual([car.rows[0][0], car.rows[0][2], car.rows[0][3]], ['Sexo', '6', '50,0 %']);
    assert.deepEqual(car.rows.map((x) => x[1]).sort(), ['Hombre', 'Mujer']);
    // Objetivo 1: tabla por ítem con el puntaje global.
    const t1 = r.tablas.find((x) => x.objetivo === 1);
    assert.equal(t1.rows.length, 3);
    assert.equal(t1.rows[2][0], 'Puntaje global');
    assert.equal(t1.rows[0][1], '12');
    // Objetivo 2: el plan pide correlación → se calcula entre las dos escalas, y sale directa y significativa.
    const cor = r.tablas.find((x) => /^Correlación entre las escalas de los objetivos específicos 1 y 2/.test(x.titulo));
    assert.ok(cor);
    assert.equal(cor.rows[0][0], '12');
    assert.ok(Number(cor.rows[0][1].replace(',', '.')) > 0.8);
    assert.match(r.porObjetivo[2].lineas.join(' '), /relación directa fuerte y estadísticamente significativa/);
    // El objetivo 1 no pide relacionar: no trae correlación.
    assert.ok(!r.porObjetivo[1].lineas.some((l) => /Pearson/.test(l)));
    // Objetivo 3: frecuencias de la causa y su figura.
    const t3 = r.tablas.find((x) => x.objetivo === 3);
    assert.deepEqual(t3.head, ['Categoría', 'Frecuencia', 'Porcentaje']);
    assert.deepEqual(t3.rows.slice(0, 3).map((x) => x.slice(1)), [['4', '33,3 %'], ['4', '33,3 %'], ['4', '33,3 %']]);
    assert.deepEqual(t3.rows.at(-1), ['Total', '12', '100,0 %']);
    assert.equal(r.figuras.find((f) => f.objetivo === 3).variable.frec.items.length, 3);
    // Objetivo 4: ninguna pregunta lo mide → se dice, no se inventa.
    assert.equal(r.porObjetivo[4].sinDatos, true);
    assert.match(r.resumen, /OBJETIVO 4: Proponer mejoras\n- \(ninguna pregunta de la encuesta mide este objetivo: sin datos\)/);
    assert.match(r.resumen, /Técnica del plan de análisis: Correlación de Pearson/);
    assert.match(r.resumen, /Tablas disponibles para apoyar: «Resultados del objetivo específico 1: valoración por ítem»/);
    // Cada título de tabla es único (se usan para citarlas en el texto).
    assert.equal(new Set(r.tablas.map((x) => x.titulo)).size, r.tablas.length);
});

test('sin respuestas no hay análisis; sin escalas, el plan relacional usa ji-cuadrado', () => {
    assert.deepEqual(analizarPorObjetivo({ encuestas: [{ definition, responses: [], objetivoDe }], especificos, plan }).tablas, []);
    const def2 = { preguntas: [definition.preguntas[0], definition.preguntas[5]] };
    const r = analizarPorObjetivo({ encuestas: [{ definition: def2, responses, objetivoDe: { sexo: 0, causa: 1 } }], especificos: ['Asociar la causa con el sexo'], plan: [{ objetivo: 'el objetivo específico 1', tecnica: 'Chi-cuadrado' }] });
    const chi = r.tablas.find((x) => /^Asociación entre/.test(x.titulo));
    assert.deepEqual(chi.head, ['n', 'Ji-cuadrado', 'gl', 'p', 'V de Cramér']);
    assert.equal(chi.rows[0][2], '2');
    assert.match(r.porObjetivo[1].lineas.join(' '), /ji-cuadrado = .*V de Cramér/);
});
