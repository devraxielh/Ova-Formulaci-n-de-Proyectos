// Veredicto de «Revisar con IA»: lo decide el código con lo que la IA encontró.
import test from 'node:test';
import assert from 'node:assert/strict';
import { nivelDeRevision } from '../src/services/revisionNivel.js';

const obs = (...tipos) => tipos.map((tipo) => ({ tipo, problema: 'x' }));

test('la etiqueta no contradice la lista de pendientes', () => {
    assert.equal(nivelDeRevision('casi', []), 'lista');
    assert.equal(nivelDeRevision('lista', obs('redaccion')), 'casi'); // con algo por mejorar no está lista
    assert.equal(nivelDeRevision('casi', obs('redaccion', 'falta')), 'casi');
    assert.equal(nivelDeRevision('falta', obs('redaccion')), 'falta'); // la IA puede ser más exigente
    assert.equal(nivelDeRevision('casi', obs('falta', 'falta', 'incoherencia')), 'falta'); // tres de fondo
    assert.equal(nivelDeRevision('casi', obs('redaccion', 'redaccion', 'redaccion', 'redaccion', 'redaccion')), 'falta'); // cinco o más
    assert.equal(nivelDeRevision(undefined, null), 'lista');
});
