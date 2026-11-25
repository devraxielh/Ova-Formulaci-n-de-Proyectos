// Comparación de textos del historial de versiones.
import test from 'node:test';
import assert from 'node:assert/strict';
import { compararTextos, contarCambios } from '../src/services/diff.js';

const lado = (trozos, fuera) => trozos.filter((t) => t.tipo !== fuera).map((t) => t.texto).join('');

test('comparar textos: marca lo quitado y lo agregado, y cada lado se puede reconstruir entero', () => {
    const antes = 'Analizar la relación entre los recordatorios y la asistencia a citas en Montería.';
    const despues = 'Analizar la relación entre los recordatorios por WhatsApp y la inasistencia a citas médicas en Montería.';
    const t = compararTextos(antes, despues);
    assert.equal(lado(t, '+'), antes);
    assert.equal(lado(t, '-'), despues);
    assert.deepEqual(t.filter((x) => x.tipo === '-').map((x) => x.texto.trim()), ['asistencia']);
    assert.ok(t.filter((x) => x.tipo === '+').some((x) => x.texto.includes('WhatsApp')));
    assert.deepEqual(contarCambios(t), { quitadas: 1, agregadas: 4 });
});

test('comparar textos: iguales, vacíos y textos largos (por párrafos)', () => {
    assert.deepEqual(compararTextos('igual', 'igual'), [{ tipo: '=', texto: 'igual' }]);
    assert.deepEqual(compararTextos('', 'nuevo texto'), [{ tipo: '+', texto: 'nuevo texto' }]);
    assert.deepEqual(compararTextos('se fue', ''), [{ tipo: '-', texto: 'se fue' }]);
    assert.deepEqual(compararTextos('', ''), []);
    const parrafo = (n) => `${Array.from({ length: 400 }, (_, i) => `palabra${n}-${i}`).join(' ')}\n`;
    const largoA = [1, 2, 3, 4, 5, 6].map(parrafo).join('');
    const largoB = [1, 2, 9, 4, 5, 6].map(parrafo).join('');
    const t = compararTextos(largoA, largoB);
    assert.equal(lado(t, '+'), largoA);
    assert.equal(lado(t, '-'), largoB);
    assert.equal(t.filter((x) => x.tipo === '-').length, 1);
    assert.equal(t.find((x) => x.tipo === '-').texto, parrafo(3));
    assert.equal(t.find((x) => x.tipo === '+').texto, parrafo(9));
});
