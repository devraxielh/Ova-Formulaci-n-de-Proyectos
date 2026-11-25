// Resultados de punta a punta: de las respuestas de la encuesta al análisis por objetivo.
import test from 'node:test';
import assert from 'node:assert/strict';
import { analizarCualitativo, analizarPorObjetivo, metaDePreguntas, objetivoDeFila, objetivoDeTexto, objetivosDePreguntas } from '../src/services/resultadosPunta.js';

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

test('qué mide cada pregunta: manda lo que guardó la encuesta; si falta, el instrumento y la operacionalización', () => {
    const def = { preguntas: [
        { id: 'a', texto: 'Recibo recordatorios', objetivo: 1, variable: 'Recordatorios', dimension: 'Frecuencia', indicador: 'Recibe avisos' },
        { id: 'b', texto: 'Asisto a todas mis citas' },                 // encuesta antigua: sin metadatos
        { id: 'c', texto: 'Llego puntual a mis citas' },                // solo está en la matriz, por el texto del ítem
    ] };
    const armados = [{ id: 'ins', preguntas: [{ id: 'b', texto: 'Asisto a todas mis citas', objetivo: 2, indicador: 'Asistencia efectiva' }] }];
    const matriz = [
        { variable: 'Asistencia', dimension: 'Cumplimiento', indicador: 'Asistencia efectiva', item: 'otro texto', objetivo: 2 },
        { variable: 'Asistencia', dimension: 'Puntualidad', indicador: 'Llega a tiempo', item: 'Llego puntual a mis citas', objetivo: 2 },
    ];
    const m = metaDePreguntas(def, 'ins', armados, matriz);
    assert.deepEqual(m.a, { objetivo: 1, variable: 'Recordatorios', dimension: 'Frecuencia', indicador: 'Recibe avisos' });
    assert.deepEqual(m.b, { objetivo: 2, variable: 'Asistencia', dimension: 'Cumplimiento', indicador: 'Asistencia efectiva' });
    assert.deepEqual(m.c, { objetivo: 2, variable: 'Asistencia', dimension: 'Puntualidad', indicador: 'Llega a tiempo' });
});

test('confiabilidad y dimensiones: alfa de Cronbach con las respuestas y puntaje por variable y dimensión', () => {
    const meta = {
        sexo: { objetivo: 0 },
        r1: { objetivo: 1, variable: 'Recordatorios', dimension: 'Frecuencia' }, r2: { objetivo: 1, variable: 'Recordatorios', dimension: 'Oportunidad' },
        a1: { objetivo: 2, variable: 'Asistencia', dimension: 'Cumplimiento' }, a2: { objetivo: 2, variable: 'Asistencia', dimension: 'Cumplimiento' },
        causa: { objetivo: 3 },
    };
    const r = analizarPorObjetivo({ encuestas: [{ definition, responses, meta }], especificos, plan });
    // Alfa por variable: dos escalas de dos ítems, con todos los participantes.
    assert.deepEqual(r.confiabilidad.map((c) => [c.escala, c.k, c.n]), [['Recordatorios', 2, 12], ['Asistencia', 2, 12]]);
    assert.ok(r.confiabilidad.every((c) => c.alfa > 0.7 && c.alfa <= 1 && ['aceptable', 'buena', 'excelente'].includes(c.nivel)));
    const conf = r.tablas.find((x) => x.titulo === 'Confiabilidad de las escalas');
    assert.deepEqual(conf.head, ['Escala', 'Ítems', 'n', 'Alfa de Cronbach', 'Nivel']);
    // Dimensiones: Recordatorios tiene dos (más su total); Asistencia, una sola.
    const dim = r.tablas.find((x) => x.titulo === 'Puntaje por variable y dimensión');
    assert.deepEqual(dim.rows.map((x) => [x[0], x[1], x[2]]), [['Recordatorios', 'Frecuencia', '1'], ['', 'Oportunidad', '1'], ['', 'Total de la variable', '2'], ['Asistencia', 'Cumplimiento', '2']]);
    assert.match(r.resumen, /CONFIABILIDAD \(tabla «Confiabilidad de las escalas»\)\n- Recordatorios: alfa de Cronbach = 0,\d\d/);
    assert.match(r.porObjetivo[1].lineas.join(' '), /Dimensión «Frecuencia» de «Recordatorios»: media/);
    assert.ok(r.porObjetivo[1].titulos.includes('Puntaje por variable y dimensión'));
    // Sin metadatos de variable, el alfa se calcula por la escala de cada objetivo.
    const sin = analizarPorObjetivo({ encuestas: [{ definition, responses, objetivoDe }], especificos, plan });
    assert.deepEqual(sin.confiabilidad.map((c) => c.escala), ['Escala del objetivo específico 1', 'Escala del objetivo específico 2']);
    assert.equal(sin.dimensiones.length, 0);
});

test('entrevistas codificadas: tabla de categorías, figura y citas textuales para redactar', () => {
    const cualitativo = {
        fuentes: [{ id: 'f1', nombre: 'Entrevista 1', texto: '…' }, { id: 'f2', nombre: 'Entrevista 2', texto: '…' }],
        categorias: [{ id: 'c1', nombre: 'Olvido', definicion: 'No recordar la fecha' }, { id: 'c2', nombre: 'Transporte' }, { id: 'c3', nombre: 'Sin fragmentos' }],
        citas: [
            { id: 'q1', fuenteId: 'f1', categoriaId: 'c1', texto: 'Se me pasó la fecha porque nadie me avisó con tiempo.' },
            { id: 'q2', fuenteId: 'f2', categoriaId: 'c1', texto: 'A veces ni me acuerdo de que tenía la cita.' },
            { id: 'q3', fuenteId: 'f2', categoriaId: 'c1', texto: 'Uno anda ocupado y se le olvida.' },
            { id: 'q4', fuenteId: 'f1', categoriaId: 'c2', texto: 'El bus no pasa temprano por mi vereda.' },
        ],
    };
    const r = analizarCualitativo(cualitativo);
    assert.deepEqual([r.n, r.fragmentos], [2, 4]);
    assert.equal(r.tablas[0].titulo, 'Categorías de análisis de las entrevistas');
    assert.equal(r.tablas[0].rows.length, 2); // la categoría sin fragmentos no entra
    assert.deepEqual(r.figuras[0].variable.frec.items.map((x) => [x.valor, x.n, x.pct]), [['Olvido', 3, 75], ['Transporte', 1, 25]]);
    assert.match(r.resumen, /ENTREVISTAS: 2 fuentes, 4 fragmentos codificados en 2 categorías/);
    assert.match(r.resumen, /CATEGORÍA «Olvido» — No recordar la fecha\n- 3 fragmentos \(75,0 % del total\), en 2 de 2 fuentes\./);
    assert.match(r.resumen, /- Cita textual \(Entrevista 1\): «El bus no pasa temprano por mi vereda»/);
    assert.deepEqual(analizarCualitativo({}), { n: 0, fragmentos: 0, tablas: [], figuras: [], resumen: '' });
    assert.deepEqual(analizarCualitativo({ fuentes: [], categorias: [{ id: 'c', nombre: 'x' }], citas: [] }).tablas, []);
});

test('con dos encuestas de distinto tamaño, la nota no afirma un solo n', () => {
    const una = (id, k) => ({ definition: { preguntas: [{ id, texto: `Pregunta ${id}`, tipo: 'opcion', opciones: ['Sí', 'No'] }] }, responses: Array.from({ length: k }, (_, i) => ({ answers: { [id]: i % 2 ? 'Sí' : 'No' } })), meta: { [id]: { objetivo: 0 } } });
    const dos = analizarPorObjetivo({ encuestas: [una('a', 6), una('b', 4)], especificos: ['Uno'], plan: [] });
    assert.match(dos.tablas[0].nota, /n entre 4 y 6, según el instrumento/);
    const sola = analizarPorObjetivo({ encuestas: [una('a', 6)], especificos: ['Uno'], plan: [] });
    assert.match(sola.tablas[0].nota, /\(n = 6\)/);
});
