// Cronograma y presupuesto derivados.
import test from 'node:test';
import assert from 'node:assert/strict';
import { basePresupuesto, cronogramaDesdeFases, desfaseCronograma, desfasePresupuesto } from '../src/services/derivados.js';

const fasesForm = { unidad: 'semanas', fases: [
    { nombre: 'caracterización de la población', duracion: 4, actividades: ['Diseñar el cuestionario.', 'Aplicar el cuestionario', ''] },
    { nombre: '', duracion: 9, actividades: ['No cuenta'] },
    { nombre: 'Análisis', duracion: 3, actividades: ['Analizar los datos'] },
] };

test('cronograma desde las fases: una fase tras otra, con las fechas de su duración', () => {
    const d = cronogramaDesdeFases(fasesForm);
    assert.equal(d.unidad, 'semanal');
    assert.equal(d.periodos, 7);
    assert.deepEqual(d.filas, [
        { fase: 'Fase 1. Caracterización de la población', actividad: 'Diseñar el cuestionario', inicio: 1, fin: 4 },
        { fase: 'Fase 1. Caracterización de la población', actividad: 'Aplicar el cuestionario', inicio: 1, fin: 4 },
        { fase: 'Fase 2. Análisis', actividad: 'Analizar los datos', inicio: 5, fin: 7 },
    ]);
    assert.deepEqual(cronogramaDesdeFases(null), { filas: [], tramos: [], unidad: 'semanal', periodos: 0 });
});

test('desfase del cronograma: nada si coincide; avisa de duración, actividades y fechas', () => {
    const d = cronogramaDesdeFases(fasesForm);
    const base = { fasesForm, cronogramaItems: d.filas, ganttUnidad: 'semanal', ganttPeriodos: 7 };
    assert.deepEqual(desfaseCronograma(base), []);
    assert.deepEqual(desfaseCronograma({ cronogramaItems: d.filas }), []);
    assert.deepEqual(desfaseCronograma({ fasesForm, cronogramaItems: [] }), ['Tus fases todavía no están en el cronograma.']);
    // El estudiante puede afinar fechas dentro de la fase y agregar actividades propias sin que avise.
    const afinado = [{ ...d.filas[0], fin: 2 }, { ...d.filas[1], inicio: 3 }, d.filas[2], { fase: 'Cierre', actividad: 'Entregar el informe', inicio: 7, fin: 7 }];
    assert.deepEqual(desfaseCronograma({ ...base, cronogramaItems: afinado }), []);
    // Después se alarga una fase y se cambia una actividad.
    const cambiado = { unidad: 'semanas', fases: [{ ...fasesForm.fases[0], duracion: 6 }, { nombre: 'Análisis', duracion: 3, actividades: ['Analizar los datos', 'Redactar el informe'] }] };
    assert.deepEqual(desfaseCronograma({ ...base, fasesForm: cambiado }), [
        'Las fases suman 9 semanas y el cronograma dura 7.',
        '1 actividad de tus fases no está en el cronograma: «Redactar el informe».',
        '1 actividad quedó por fuera de las fechas de su fase: «Analizar los datos».',
    ]);
    const sinUna = { unidad: 'meses', fases: [fasesForm.fases[2]] };
    assert.deepEqual(desfaseCronograma({ ...base, fasesForm: sinUna }), [
        'Las fases están en meses y el cronograma en semanas.',
        '2 actividades del cronograma ya no están en tus fases: «Diseñar el cuestionario», «Aplicar el cuestionario».',
    ]);
});

test('desfase del presupuesto: compara participantes, instrumentos, duración y equipo', () => {
    const antes = basePresupuesto({ n: '292 (muestra calculada)', instrumentos: ['Encuesta: Cuestionario', ''], periodos: 6, unidad: 'mensual', integrantes: 2 });
    assert.deepEqual(antes, { n: '292 (muestra calculada)', instrumentos: ['Encuesta: Cuestionario'], duracion: '6 meses', integrantes: 2 });
    assert.deepEqual(desfasePresupuesto(antes, antes), []);
    assert.deepEqual(desfasePresupuesto(null, antes), []);
    const ahora = basePresupuesto({ n: '120 (muestra calculada)', instrumentos: ['Entrevista: Guía de entrevista'], periodos: 24, unidad: 'semanal', integrantes: 3 });
    assert.deepEqual(desfasePresupuesto(antes, ahora), [
        'Los participantes pasaron de 292 (muestra calculada) a 120 (muestra calculada).',
        'Agregaste un instrumento: «Entrevista: Guía de entrevista».',
        'Quitaste un instrumento: «Encuesta: Cuestionario».',
        'La duración pasó de 6 meses a 24 semanas.',
        'El equipo pasó de 2 integrantes a 3.',
    ]);
    // Sin sesión no se conoce el equipo: no se avisa por eso.
    assert.deepEqual(desfasePresupuesto(antes, { ...antes, integrantes: 0 }), []);
});
