// Vocabulario y estilo del proyecto.
import test from 'node:test';
import assert from 'node:assert/strict';
import { aplicarEstilo, aplicarEstiloEnJson, aplicarEstiloEnValor, estiloVacio, hallazgosDeEstilo, normalizarEstilo, revisarProyecto, textoEstilo } from '../src/services/estilo.js';

const estilo = { persona: 'impersonal', tiempo: 'pasado', terminos: [{ usar: 'inasistencia', enLugarDe: 'no-show' }, { usar: 'pacientes', enLugarDe: 'usuarios' }, { usar: 'x', enLugarDe: 'x' }, { usar: '', enLugarDe: 'vacío' }], evitar: ['hoy en día', ''], notas: 'Frases cortas.' };

test('normalizar: descarta términos vacíos o iguales y valores desconocidos; vacío de verdad', () => {
    const e = normalizarEstilo({ ...estilo, persona: 'inventada' });
    assert.equal(e.persona, '');
    assert.deepEqual(e.terminos, [{ usar: 'inasistencia', enLugarDe: 'no-show' }, { usar: 'pacientes', enLugarDe: 'usuarios' }]);
    assert.deepEqual(e.evitar, ['hoy en día']);
    assert.equal(estiloVacio({}), true);
    assert.equal(estiloVacio({ terminos: [{ usar: '', enLugarDe: '' }] }), true);
    assert.equal(estiloVacio(estilo), false);
    // Un término con comillas o llaves no puede romper una respuesta en JSON.
    assert.deepEqual(normalizarEstilo({ terminos: [{ usar: 'cita "médica"', enLugarDe: 'turno{}' }] }).terminos, [{ usar: 'cita médica', enLugarDe: 'turno' }]);
});

test('instrucción para la IA: persona, tiempo, términos y lo que hay que evitar', () => {
    const txt = textoEstilo(estilo);
    assert.match(txt, /^ESTILO DEL PROYECTO/);
    assert.match(txt, /forma impersonal/);
    assert.match(txt, /va en pasado/);
    assert.match(txt, /di «inasistencia», nunca «no-show»; di «pacientes», nunca «usuarios»/);
    assert.match(txt, /No uses estas palabras o expresiones: «hoy en día»/);
    assert.match(txt, /Además: Frases cortas\./);
    assert.equal(textoEstilo({}), '');
});

test('corregir un texto: palabra completa, mayúscula inicial y los tres tipos de guion', () => {
    assert.equal(aplicarEstilo('El no‑show bajó. No-show alto en usuarios nuevos; los usuarios2 no cuentan.', estilo), 'El inasistencia bajó. Inasistencia alto en pacientes nuevos; los usuarios2 no cuentan.');
    assert.equal(aplicarEstilo('{"texto":"tasa de no–show"}', estilo), '{"texto":"tasa de inasistencia"}');
    assert.equal(aplicarEstilo('sin cambios', {}), 'sin cambios');
    assert.deepEqual(hallazgosDeEstilo('Hoy en día el no-show es alto. Hoy en día pasa.', estilo), [{ termino: 'no-show', usar: 'inasistencia', veces: 1 }, { termino: 'hoy en día', usar: '', veces: 2 }]);
});

test('revisar el proyecto: cuenta, corrige lo del estudiante y no toca los datos de las fuentes', () => {
    const data = {
        titulo: 'Factores del no-show en usuarios de un hospital',
        justificacion: 'El no-show afecta a los usuarios.',
        marcoForm: { antecedentes: [{ autor: 'Usuarios et al.', titulo: 'Reducing no-show rates', hallazgo: 'redujo el no-show de 18 % a 7 %' }] },
        referencias: [{ titulo: 'Reducing no-show rates' }],
        estilo,
    };
    const r = revisarProyecto(data, estilo);
    assert.deepEqual(r.hallazgos.map((h) => [h.termino, h.veces]), [['no-show', 3], ['usuarios', 2]]);
    assert.deepEqual(Object.keys(r.cambios).sort(), ['justificacion', 'marcoForm', 'titulo']);
    assert.equal(r.cambios.titulo, 'Factores del inasistencia en pacientes de un hospital');
    assert.equal(r.cambios.justificacion, 'El inasistencia afecta a los pacientes.');
    assert.deepEqual(r.cambios.marcoForm.antecedentes[0], { autor: 'Usuarios et al.', titulo: 'Reducing no-show rates', hallazgo: 'redujo el inasistencia de 18 % a 7 %' });
    assert.deepEqual(aplicarEstiloEnValor({ id: 'no-show', nota: 'no-show' }, estilo), { id: 'no-show', nota: 'inasistencia' });
    assert.deepEqual(revisarProyecto({ titulo: 'Sin problemas' }, estilo), { hallazgos: [], cambios: {} });
});

test('respuesta de la IA en JSON: el vocabulario no toca las claves ni las etiquetas cortas', () => {
    const e = { terminos: [{ usar: 'categoría', enLugarDe: 'variable' }, { usar: 'propósito', enLugarDe: 'objetivo' }] };
    const cruda = 'Aquí va: {"filas":[{"variable":"inasistencia","objetivo":2,"tipo":"variable","item":"¿Cuál es la variable que más pesa en el objetivo del estudio?"}]} fin';
    const r = JSON.parse(aplicarEstiloEnJson(cruda, e));
    assert.deepEqual(Object.keys(r.filas[0]), ['variable', 'objetivo', 'tipo', 'item']); // las claves que el código lee siguen ahí
    assert.equal(r.filas[0].tipo, 'variable'); // etiqueta corta: se compara con listas fijas
    assert.equal(r.filas[0].item, '¿Cuál es la categoría que más pesa en el propósito del estudio?');
    // Sin términos o sin JSON legible, la respuesta queda intacta.
    assert.equal(aplicarEstiloEnJson(cruda, {}), cruda);
    assert.equal(aplicarEstiloEnJson('{"a": roto', e), '{"a": roto');
});
