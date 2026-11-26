// Resumen redactado desde el proyecto: fuentes por sección y comprobación de lo que devuelve la IA.
import test from 'node:test';
import assert from 'node:assert/strict';
import { PARTES_IA, fuentesResumen, leerPartes, limpiarParte, mensajesResumen, pulirBorrador, revisarParte } from '../src/services/resumenIA.js';

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
    assert.match(m.messages[1].content, /\[1\] …\n\[2\] …$/);
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

test('borrador de respaldo: sin arranques dobles y corto', () => {
    assert.equal(pulirBorrador('Los resultados mostraron que se identificó que el olvido fue la causa principal'), 'Los resultados mostraron que el olvido fue la causa principal.');
    assert.equal(pulirBorrador('Se concluye que se constató que la inasistencia se asocia al olvido (Pérez, 2022)'), 'Se concluye que la inasistencia se asocia al olvido.');
    const largo = `Se concluye que la inasistencia se asocia al olvido de la fecha y al costo del transporte; ${Array(70).fill('palabra').join(' ')}.`;
    const corto = pulirBorrador(largo);
    assert.ok(corto.split(/\s+/).length <= 56 && /[.]$/.test(corto));
    assert.match(corto, /^Se concluye que la inasistencia se asocia al olvido/);
    assert.equal(pulirBorrador(''), '');
});

test('leer la respuesta de la IA: líneas numeradas, en el orden pedido, aunque traigan comillas', () => {
    const pedir = ['objetivo', 'resultados', 'conclusiones'];
    const r = leerPartes('[1] Esta investigación tuvo como objetivo analizar los factores.\n[2] Los resultados mostraron que el ítem "Prefiero otro centro" obtuvo la media más alta\ny el olvido fue frecuente.\n\n[3] Se concluye que el olvido se asocia a la inasistencia.', pedir);
    assert.deepEqual(Object.keys(r), pedir);
    assert.match(r.resultados, /"Prefiero otro centro" obtuvo la media más alta\ny el olvido fue frecuente\.$/);
    assert.equal(r.conclusiones, 'Se concluye que el olvido se asocia a la inasistencia.');
    // Números fuera de rango o texto sin marcas: no se inventa nada.
    assert.deepEqual(leerPartes('[7] sobra. Texto libre.', pedir), {});
    assert.deepEqual(leerPartes('', pedir), {});
});
