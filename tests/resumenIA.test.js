// Resumen redactado desde el proyecto: fuentes por sección y comprobación de lo que devuelve la IA.
import test from 'node:test';
import assert from 'node:assert/strict';
import { PARTES_IA, fuentesResumen, limpiarParte, mensajesResumen, revisarParte } from '../src/services/resumenIA.js';

const data = {
    titulo: 'Factores asociados a la inasistencia a citas médicas',
    objetivos: '### Objetivo general\nDeterminar los factores asociados a la inasistencia a citas médicas en pacientes de consulta externa de un hospital de Sincelejo.\n\n### Objetivos específicos\n1. Caracterizar la inasistencia.',
    resultados: 'El 41 % de los pacientes señaló el olvido como causa principal de la inasistencia, seguido del costo del transporte con 22 %.',
};

test('fuentes: solo las secciones que ya están escritas', () => {
    const f = fuentesResumen(data);
    assert.deepEqual(Object.keys(f), PARTES_IA);
    assert.match(f.objetivo, /Determinar los factores asociados/);
    assert.doesNotMatch(f.objetivo, /Caracterizar/); // solo el objetivo general, sin los específicos
    assert.match(f.resultados, /41 %/);
    assert.equal(f.metodologia, '');
    assert.equal(f.conclusiones, '');
    assert.deepEqual(fuentesResumen({}), { objetivo: '', metodologia: '', resultados: '', conclusiones: '' });
    // Una sección casi vacía todavía no se resume.
    assert.equal(fuentesResumen({ conclusiones: 'Se concluye algo.' }).conclusiones, '');
});

test('mensajes para la IA: se piden solo las partes con origen', () => {
    const m = mensajesResumen(fuentesResumen(data), data.titulo);
    assert.deepEqual(m.pedir, ['objetivo', 'resultados']);
    assert.match(m.messages[1].content, /=== OBJETIVOS \(texto del estudiante\) ===/);
    assert.doesNotMatch(m.messages[1].content, /METODOLOGÍA/);
    assert.match(m.messages[1].content, /\{"objetivo": "…", "resultados": "…"\}$/);
});

test('revisar una parte: quita citas, exige texto y rechaza cifras que no están en la sección', () => {
    assert.equal(limpiarParte('- Los resultados mostraron que el olvido fue la causa principal (Pérez, 2022) , con 41 %'), 'Los resultados mostraron que el olvido fue la causa principal, con 41 %.');
    const fuente = fuentesResumen(data).resultados;
    assert.deepEqual(revisarParte('Los resultados mostraron que el olvido fue la causa principal (41 %), seguido del transporte (22 %).', fuente), { ok: true, texto: 'Los resultados mostraron que el olvido fue la causa principal (41 %), seguido del transporte (22 %).' });
    const inventada = revisarParte('Los resultados mostraron que el 63 % de los pacientes olvidó su cita médica.', fuente);
    assert.deepEqual([inventada.ok, inventada.motivo, inventada.ajenas], [false, 'cifras', ['63']]);
    assert.equal(revisarParte('Muy corto.', fuente).motivo, 'vacia');
    assert.equal(revisarParte(Array(90).fill('palabra').join(' '), fuente).motivo, 'larga');
});
