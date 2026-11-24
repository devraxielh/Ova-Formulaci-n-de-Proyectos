import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluarCoherencia } from '../src/services/coherencia.js';
import { buildDocument, documentHtml } from '../src/services/projectDoc.js';
import { nivelDe, problemasEscalera } from '../src/data/nivelesVerbos.js';
import { generalDesdeTitulo } from '../src/data/ejemplos.js';

const proyecto = {
    titulo: 'Análisis de los factores asociados a la inasistencia a citas médicas en pacientes de consulta externa de un hospital de Sincelejo',
    pregunta: '¿Qué factores están asociados a la inasistencia a citas médicas en los pacientes de consulta externa de un hospital de Sincelejo?',
    objetivoGeneral: 'Analizar los factores asociados a la inasistencia a citas médicas en pacientes de consulta externa de un hospital de Sincelejo.',
    objetivos: '### Objetivo general\nAnalizar los factores.\n\n### Objetivos específicos\n1. Identificar las causas de la inasistencia a citas médicas.\n2. Caracterizar la inasistencia a citas médicas en los pacientes.\n3. Establecer la relación entre el olvido y la inasistencia a citas médicas.',
    tituloForm: { quien: 'pacientes de consulta externa', donde: 'un hospital de Sincelejo' },
};

test('un proyecto coherente obtiene coherencia alta', () => {
    const r = evaluarCoherencia(proyecto);
    assert.equal(r.nivel, 'alta');
    assert.ok(r.checks.find((c) => c.id === 'titulo-general').score >= 80);
});

test('una pregunta de otro tema baja la coherencia y explica por qué', () => {
    const r = evaluarCoherencia({ ...proyecto, pregunta: '¿Cómo diseñar una aplicación móvil para tiendas de barrio?' });
    const check = r.checks.find((c) => c.id === 'titulo-pregunta');
    assert.ok(check.score < 50);
    assert.match(check.porque, /no aparecen en la pregunta/);
    assert.ok(check.arreglo);
});

test('el verbo del título pasa a infinitivo', () => {
    assert.equal(generalDesdeTitulo('Diseño de una aplicación móvil para pacientes'), 'Diseñar una aplicación móvil para pacientes');
    assert.equal(generalDesdeTitulo('Caracterización del consumo de agua'), 'Caracterizar el consumo de agua');
});

test('la escalera de objetivos específicos avisa cuando un verbo baja de nivel', () => {
    assert.equal(nivelDe('Proponer una estrategia'), 6);
    assert.deepEqual(problemasEscalera('', ['Identificar x', 'Analizar y', 'Proponer z']), ['', '', '']);
    assert.deepEqual(problemasEscalera('', ['Proponer z', 'Describir x']), ['', 'baja']);
});

test('el documento pone el resumen después del título y las referencias al final', () => {
    const secciones = buildDocument({
        ...proyecto, resumen: 'Resumen del estudio.', palabrasClave: 'inasistencia, citas médicas', introduccion: 'Introducción.', conclusiones: '1. Conclusión.',
        referencias: [{ id: 'b', tipo: 'libro', autores: 'Smith, J.', anio: '2021', titulo: 'B', editorial: 'X' }, { id: 'a', tipo: 'libro', autores: 'Díaz, M.', anio: '2023', titulo: 'A', editorial: 'X' }],
    }).filter((s) => s.content.length > 0 && s.inDocument !== false).map((s) => s.id);
    assert.deepEqual(secciones.slice(0, 3), ['titulo', 'resumen', 'introduccion']);
    assert.equal(secciones.at(-1), 'referencias');
});

test('el Word lleva sangría francesa en las referencias y cursivas', () => {
    const html = documentHtml('Mi proyecto', 'Autor', buildDocument({ titulo: 'T', referencias: [{ id: 'a', tipo: 'libro', autores: 'Díaz, M.', anio: '2023', titulo: 'Un libro', editorial: 'X' }] }));
    assert.match(html, /<p class="ref">Díaz, M\. \(2023\)\. <i>Un libro<\/i>\. X\.<\/p>/);
    assert.match(html, /@page WordSection1/);
});
