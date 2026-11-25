// Operacionalización de variables: normalización, tabla del documento y preguntas del instrumento.
import test from 'node:test';
import assert from 'node:assert/strict';
import { indicadoresSinPregunta, matrizEnTexto, normalizarFilas, preguntasDesdeMatriz, tablaOperacionalizacion } from '../src/services/operacionalizacion.js';
import { buildDocument } from '../src/services/projectDoc.js';

const crudas = [
    { objetivo: 1, variable: 'Uso de recordatorios', tipoVar: 'independiente', definicion: 'Mensajes que avisan la cita', dimension: 'Frecuencia', indicador: 'Número de recordatorios recibidos', item: '¿Cuántos recordatorios recibió?', escala: 'NUMERO' },
    { objetivo: 1, variable: 'Uso de recordatorios', tipoVar: 'Independiente', definicion: 'Mensajes que avisan la cita', dimension: 'Canal', indicador: 'Canal por el que llegó', item: '¿Por dónde le llegó?', escala: 'opcion', opciones: ['WhatsApp', 'Llamada', ''] },
    { objetivo: 9, variable: 'Asistencia', tipoVar: 'inventado', dimension: 'Cumplimiento', indicador: 'Asistió a la cita', item: 'Asistí a mi última cita', escala: 'otra' },
    { objetivo: 2, variable: '', indicador: 'sin variable' },
    { objetivo: 2, variable: 'Sin indicador', indicador: '' },
];

test('normalizar: valida escala, tipo y objetivo, y descarta filas incompletas', () => {
    const f = normalizarFilas(crudas, 2);
    assert.equal(f.length, 3);
    assert.deepEqual([f[0].escala, f[0].tipoVar, f[0].objetivo], ['numero', 'Independiente', 1]);
    assert.deepEqual(f[1].opciones, ['WhatsApp', 'Llamada']);
    assert.deepEqual([f[2].escala, f[2].tipoVar, f[2].objetivo], ['likert', '', 0]); // lo desconocido no se inventa
    assert.ok(f.every((x) => x.id));
});

test('tabla del documento: agrupa la variable repetida y cambia los rótulos en un enfoque cualitativo', () => {
    const filas = normalizarFilas(crudas, 2);
    const tabla = tablaOperacionalizacion({ operacionalizacion: filas, enfoque: 'Cuantitativo' });
    assert.deepEqual(tabla.head, ['Variable', 'Definición', 'Dimensión', 'Indicador', 'Ítem', 'Escala']);
    assert.equal(tabla.rows[0][0], 'Uso de recordatorios (independiente)');
    assert.deepEqual([tabla.rows[1][0], tabla.rows[1][1]], ['', '']); // misma variable: no se repite
    assert.equal(tabla.rows[1][5], 'Opción única');
    assert.equal(tablaOperacionalizacion({ operacionalizacion: filas, enfoque: 'Cualitativo' }).head[0], 'Categoría');
    assert.equal(tablaOperacionalizacion({ operacionalizacion: [] }), null);
    // Entra al documento como anexo.
    const anexos = buildDocument({ operacionalizacion: filas, enfoque: 'Cuantitativo' }).find((s) => s.id === 'anexos');
    assert.ok(anexos.content.some((b) => b.type === 'heading' && /operacionalización de variables/i.test(b.text)));
    assert.ok(anexos.content.some((b) => b.type === 'table' && b.head[3] === 'Indicador'));
});

test('instrumento desde la matriz: cada ítem es una pregunta que recuerda su indicador y su objetivo', () => {
    const filas = normalizarFilas(crudas, 2);
    const q = preguntasDesdeMatriz(filas, 'encuesta');
    assert.equal(q.length, 3);
    assert.deepEqual([q[0].texto, q[0].tipo, q[0].objetivo, q[0].indicador], ['¿Cuántos recordatorios recibió?', 'numero', 1, 'Número de recordatorios recibidos']);
    assert.deepEqual(q[1].opciones, ['WhatsApp', 'Llamada']);
    assert.ok(preguntasDesdeMatriz(filas, 'entrevista').every((x) => x.tipo === 'abierta' && x.opciones.length === 0));
    // Si el estudiante borra una pregunta, se sabe qué indicador quedó sin medir.
    assert.deepEqual(indicadoresSinPregunta(filas, q.slice(0, 2)).map((x) => x.indicador), ['Asistió a la cita']);
    assert.equal(indicadoresSinPregunta(filas, q).length, 0);
    assert.match(matrizEnTexto(filas), /objetivo 1\] Uso de recordatorios › Frecuencia › Número de recordatorios recibidos/);
});
