// Marco apoyado en las fuentes: afirmaciones sin cita y citas que no están en las fichas.
import test from 'node:test';
import assert from 'node:assert/strict';
import { fuentesDeFichas, oraciones, parrafosVerificados, revisarFuentes } from '../src/services/marcoFuentes.js';

const f = {
    antecedentes: [
        { autor: 'Pérez y Gómez', anio: '2021', titulo: 'Recordatorios en consulta externa', lugar: 'Bogotá', objetivo: 'medir el efecto de los SMS', hallazgo: 'los recordatorios redujeron la inasistencia en 12 %', relacion: 'usa la misma variable' },
        { autor: 'Ruiz et al.', anio: '2019', titulo: 'Barreras de acceso', hallazgo: 'el transporte fue la principal causa de inasistencia' },
        { autor: '', anio: '2020', hallazgo: 'sin autor: no cuenta' },
        { autor: 'Incompleta', anio: '2020', hallazgo: '' },
    ],
    teorias: [{ nombre: 'Teoría del comportamiento planificado', autor: 'Ajzen', anio: '1991', postulado: 'la intención predice la conducta' }],
};

test('fuentes de las fichas: solo las completas, con su clave', () => {
    const a = fuentesDeFichas(f, 'antecedentes');
    assert.deepEqual(a.map((x) => [x.clave, x.autor, x.anio]), [['F1', 'Pérez y Gómez', '2021'], ['F2', 'Ruiz et al.', '2019']]);
    assert.match(a[0].contenido, /Hallazgo: los recordatorios redujeron/);
    assert.equal(fuentesDeFichas(f, 'teorico')[0].titulo, 'Teoría del comportamiento planificado');
    assert.deepEqual(fuentesDeFichas(f, 'legal'), []);
});

test('oraciones: no se parten en «et al.», iniciales ni decimales', () => {
    const o = oraciones('Ruiz et al. (2019) hallaron que el transporte pesa más. El efecto fue de 12.5 puntos según J. Pérez y su equipo. Corto.');
    assert.equal(o.length, 2);
    assert.match(o[0], /^Ruiz et al\. \(2019\)/);
    assert.match(o[1], /12\.5 puntos según J\. Pérez/);
});

test('revisión: marca la afirmación sin cita y la cita que no está en las fichas; respeta el análisis propio', () => {
    const fuentes = fuentesDeFichas(f, 'antecedentes');
    const texto = [
        'Pérez y Gómez (2021) encontraron que los recordatorios redujeron la inasistencia en 12 %. El efecto fue mayor en los pacientes crónicos del estudio.',
        'El transporte fue la principal causa de inasistencia en zonas rurales (Ruiz et al., 2019).',
        'La inasistencia cuesta millones de pesos cada año al sistema de salud.',
        'Muchos pacientes olvidan la fecha de su cita con facilidad. Otros estudios confirman este resultado en hospitales públicos (Martínez, 2018).',
        'En conjunto, estos trabajos orientan la presente investigación hacia los recordatorios digitales.',
        'Según Ruiz y su equipo, la distancia al centro de salud también influye bastante.',
    ].join('\n\n');
    const r = revisarFuentes(texto, fuentes);
    assert.equal(r.total, 8);
    // Sin apoyo: el párrafo sin ninguna cita y la oración que va antes de la cita en su párrafo.
    // La oración que sigue a una citada en el mismo párrafo se entiende de la misma fuente.
    assert.deepEqual(r.sinFuente, ['La inasistencia cuesta millones de pesos cada año al sistema de salud.', 'Muchos pacientes olvidan la fecha de su cita con facilidad.']);
    assert.deepEqual(r.ajenas.map((c) => c.texto), ['(Martínez, 2018)']);
    assert.deepEqual(revisarFuentes('', fuentes), { sinFuente: [], ajenas: [], total: 0 });
    // Autores con dos apellidos: «Romero (2025)» corresponde a «Guevara Cando y Chafla Romero».
    const dos = fuentesDeFichas({ antecedentes: [{ autor: 'Guevara Cando y Chafla Romero', anio: '2025', hallazgo: 'x' }] }, 'antecedentes');
    assert.deepEqual(revisarFuentes('Guevara Cando y Chafla Romero (2025), en su estudio, buscó medir la satisfacción de los usuarios.', dos).ajenas, []);
});

test('párrafos de la IA: se descarta el que cita algo ajeno o no cita nada; se acepta el análisis propio', () => {
    const fuentes = fuentesDeFichas(f, 'antecedentes');
    const { aceptados, descartados } = parrafosVerificados([
        { texto: 'Pérez y Gómez (2021) mostraron que los recordatorios redujeron la inasistencia, y el transporte sigue siendo una barrera (Ruiz et al., 2019).', fuentes: ['F1', 'f2'] },
        { texto: 'Un metaanálisis reciente confirma el efecto de los mensajes de texto en la asistencia (López, 2023).', fuentes: ['F1'] },
        { texto: 'Los pacientes olvidan sus citas con mucha frecuencia en todos los niveles de atención del país.', fuentes: [] },
        { texto: 'En conjunto, estos antecedentes muestran que la presente investigación puede aportar evidencia local sobre los recordatorios.', fuentes: [], propio: true },
        { texto: 'Muy corto.', fuentes: ['F1'] },
    ], fuentes);
    assert.equal(aceptados.length, 2);
    assert.deepEqual(aceptados[0].fuentes, ['F1', 'F2']);
    assert.equal(aceptados[1].propio, true);
    assert.equal(descartados.length, 2);
    assert.match(descartados[0].motivo, /López, 2023/);
    assert.match(descartados[1].motivo, /no cita ninguna/);
});

test('apellidos de dos letras (Li, Wu, Ng) también cuentan como fuente propia', () => {
    const fuentes = [{ autor: 'Li, W.', anio: '2020', clave: 'F1' }, { autor: 'De la Ossa, P.', anio: '2021', clave: 'F2' }];
    assert.deepEqual(revisarFuentes('Según Li (2020), los recordatorios reducen la inasistencia a las citas médicas.', fuentes).ajenas, []);
    assert.equal(revisarFuentes('Según Wu (2019), los recordatorios reducen la inasistencia a las citas médicas.', fuentes).ajenas.length, 1);
});
