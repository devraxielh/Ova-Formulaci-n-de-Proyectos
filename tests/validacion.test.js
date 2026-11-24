import test from 'node:test';
import assert from 'node:assert/strict';
import { aiken, cronbach, nivelAlfa, parrafoConDatos, resumenAiken, resumenTriangulacion } from '../src/data/validacion.js';
import { redactarInstrumentos, tamanoMuestra } from '../src/data/metodologia.js';

const cerca = (a, b, tol = 0.005) => assert.ok(Math.abs(a - b) < tol, `${a} ≠ ${b}`);

test('V de Aiken del ejemplo de la clase', () => {
    cerca(aiken([4, 4, 3, 4, 4], 4), 14 / 15);
    assert.equal(aiken([4, 4, 4], 4), 1);
    assert.equal(aiken([1, 1, 1], 4), 0);
    assert.equal(aiken([], 4), null);
});

test('resumen de Aiken separa los ítems que se conservan', () => {
    const r = resumenAiken({ expertos: 3, escala: 4, items: [{ nombre: 'Ítem 1', notas: [4, 4, 3] }, { nombre: 'Ítem 2', notas: [2, 3, 2] }] });
    assert.equal(r.conservados.length, 1);
    assert.equal(r.ajustar[0].nombre, 'Ítem 2');
});

test('alfa de Cronbach', () => {
    // Ítems idénticos entre sí → consistencia perfecta.
    cerca(cronbach('1 1 1\n2 2 2\n3 3 3\n5 5 5').alfa, 1);
    // Caso de regresión calculado a mano: k = 2, varianzas 1 y 1, covarianza 0,5 → α = 2·(1 − 2/3) = 0,667.
    cerca(cronbach('1\t2\n2\t1\n3\t3\n2\t2').alfa, 2 * (1 - (2 * (2 / 3)) / (2 * (2 / 3) + 2 * (1 / 3))));
    assert.ok(cronbach('1 2').error);
    assert.ok(cronbach('1 2\n3').error);
    assert.equal(cronbach('4;5;4\n3;4;4\n5;5;4\n2;3;2').k, 3);
});

test('niveles del alfa', () => {
    assert.equal(nivelAlfa(0.93), 'excelente');
    assert.equal(nivelAlfa(0.81), 'buena');
    assert.equal(nivelAlfa(0.72), 'aceptable');
    assert.equal(nivelAlfa(0.5), 'pobre');
});

test('triangulación cuenta convergencias y diferencias', () => {
    const r = resumenTriangulacion({ fuentes: ['A', 'B'], categorias: [{ nombre: 'Transporte', celdas: { A: 'si', B: 'si' } }, { nombre: 'Trato', celdas: { A: 'si', B: 'difiere' } }] });
    assert.equal(r.convergen.length, 1);
    assert.equal(r.difieren[0].nombre, 'Trato');
});

test('el documento usa los valores calculados', () => {
    const texto = parrafoConDatos('alfa de Cronbach', 'el cuestionario', { matriz: '1 1 1\n2 2 2\n3 3 3\n5 5 5' });
    assert.match(texto, /α = 1,00/);
    const instrumentos = redactarInstrumentos([{ tecnica: 'Encuesta', instrumento: 'cuestionario', aplicaA: 'los pacientes', validaciones: ['juicio de expertos'] }]);
    assert.match(instrumentos, /### Validez y confiabilidad/);
    assert.match(instrumentos, /del cuestionario/);
});

test('tamaño de muestra', () => {
    assert.equal(tamanoMuestra({ finita: true, N: 1000, Z: 1.96, e: 0.05 }), 278);
    assert.equal(tamanoMuestra({ finita: false, N: 0, Z: 1.96, e: 0.05 }), 385);
});
