// Propagar los cambios del título y la pregunta al resto del proyecto.
import test from 'node:test';
import assert from 'node:assert/strict';
import { REESCRIBIBLES, hojasDeSeccion, paresDeReescritura, cambiosDetectados, fotoActual, reemplazarEnTexto, reemplazarEnValor, reemplazosDe, seccionesAfectadas } from '../src/services/propagar.js';

const proyecto = {
    titulo: 'Análisis de los recordatorios y la inasistencia a citas médicas en pacientes hipertensos de Sincelejo',
    pregunta: '¿Cuál es la relación entre los recordatorios y la inasistencia a citas médicas en pacientes hipertensos de Sincelejo?\n\nTipo: correlacional',
    propagado: {
        titulo: 'Análisis de los recordatorios y la inasistencia a citas médicas en adultos mayores de Montería',
        pregunta: '¿Cuál es la relación entre los recordatorios y la inasistencia a citas médicas en adultos mayores de Montería?',
    },
    justificacion: 'Este estudio beneficia a los adultos mayores de Montería. Adultos mayores que faltan a sus citas pierden continuidad.',
    justificacionForm: { beneficiarios: 'adultos mayores de Montería', id: 'adultos mayores' },
    objetivos: 'Objetivo general\nAnalizar la relación entre los recordatorios y la inasistencia en adultos mayores de Montería.',
    marcoAntecedentes: 'Pérez (2021) estudió a adultos mayores de Montería.',
    conclusiones: 'No menciona a la población.',
};

test('se detecta qué cambió frente a la última foto; sin foto no hay aviso', () => {
    const c = cambiosDetectados(proyecto);
    assert.deepEqual(c.map((x) => x.id), ['titulo', 'pregunta']);
    assert.match(c[0].antes, /adultos mayores de Montería$/);
    assert.equal(c[1].ahora.includes('Tipo:'), false); // de la pregunta solo cuenta su primera línea
    assert.deepEqual(cambiosDetectados({ titulo: 'Algo' }), []);
    assert.deepEqual(cambiosDetectados({ ...proyecto, propagado: fotoActual(proyecto) }), []);
    assert.deepEqual(cambiosDetectados({ titulo: 'ALGO  nuevo', propagado: { titulo: 'algo nuevo' } }), []); // mayúsculas y espacios no cuentan
});

test('reemplazos: solo los términos que se cambiaron por otros, no lo agregado ni las palabras vacías', () => {
    assert.deepEqual(reemplazosDe(proyecto.propagado.titulo, proyecto.titulo), [{ antes: 'adultos mayores', despues: 'pacientes hipertensos' }, { antes: 'Montería', despues: 'Sincelejo' }]);
    assert.deepEqual(reemplazosDe('Uso de recordatorios en Montería', 'Uso de recordatorios por WhatsApp en Montería'), []); // solo se agregó
    assert.deepEqual(reemplazosDe('Efecto en la asistencia', 'Efecto de la asistencia'), []); // «en» → «de» no pesa
    assert.deepEqual(reemplazosDe('igual', 'igual'), []);
});

test('reemplazar en texto: palabra completa, respeta la mayúscula inicial y no duplica lo que ya está', () => {
    const r = [{ antes: 'adultos mayores', despues: 'pacientes hipertensos' }, { antes: 'Montería', despues: 'Sincelejo' }];
    assert.equal(reemplazarEnTexto(proyecto.justificacion, r), 'Este estudio beneficia a los pacientes hipertensos de Sincelejo. Pacientes hipertensos que faltan a sus citas pierden continuidad.');
    assert.equal(reemplazarEnTexto('La cita y la citación', [{ antes: 'cita', despues: 'consulta' }]), 'La consulta y la citación');
    assert.equal(reemplazarEnTexto('Las citas y las citas médicas', [{ antes: 'citas', despues: 'citas médicas' }]), 'Las citas médicas y las citas médicas');
    assert.equal(reemplazarEnTexto('sin cambios', []), 'sin cambios');
    // En objetos cambia los textos y deja quietos los identificadores.
    assert.deepEqual(reemplazarEnValor(proyecto.justificacionForm, r), { beneficiarios: 'pacientes hipertensos de Sincelejo', id: 'adultos mayores' });
    assert.deepEqual(reemplazarEnValor([1, null, 'Montería'], r), [1, null, 'Sincelejo']);
});

test('secciones afectadas: las que usan los términos anteriores, con su antes y después; el marco no se toca', () => {
    const r = reemplazosDe(proyecto.propagado.titulo, proyecto.titulo);
    const s = seccionesAfectadas(proyecto, r, ['titulo', 'pregunta']);
    assert.deepEqual(s.map((x) => x.id), ['objetivos', 'justificacion']);
    const j = s.find((x) => x.id === 'justificacion');
    assert.deepEqual(j.campos.sort(), ['justificacion', 'justificacionForm']);
    assert.match(j.valores.justificacion, /pacientes hipertensos de Sincelejo/);
    assert.equal(j.cambiaTexto, true);
    assert.equal(j.veces, 3); // «adultos mayores» dos veces y «Montería» una
    assert.ok(j.trozos.some((x) => x.tipo === '-' && /adultos/.test(x.texto)) && j.trozos.some((x) => x.tipo === '+' && /hipertensos/.test(x.texto)));
    assert.ok(!s.some((x) => x.id === 'marco' || x.id === 'conclusiones'));
    assert.deepEqual(seccionesAfectadas(proyecto, [], []), []);
});

test('cambios de fondo: las frases de una sección y lo que la IA puede cambiar de ellas', () => {
    const data = {
        justificacionForm: { conveniencia: 'Sirve para describir cuántos pacientes faltan a sus citas en el hospital.', beneficiarios: 'Los pacientes y el personal de consulta externa del hospital.', corto: 'muy corto', id: 'Sirve para describir cuántos pacientes faltan a sus citas en el hospital.' },
        justificacion: 'Texto ya redactado que no se usa si hay formulario con contenido suficiente.',
        resumen: 'Este estudio describe la inasistencia a citas médicas en un hospital.\n\nSe aplicó una encuesta a los pacientes de consulta externa.',
    };
    assert.ok(!REESCRIBIBLES.includes('titulo') && !REESCRIBIBLES.includes('pregunta') && REESCRIBIBLES.includes('justificacion'));
    const h = hojasDeSeccion(data, 'justificacion');
    assert.deepEqual(h.map((x) => x.id), ['h1', 'h2']); // sin el texto corto ni el identificador
    assert.match(h[0].texto, /^Sirve para describir/);
    // Sin formulario, se usan los párrafos del texto.
    assert.equal(hojasDeSeccion(data, 'resumen').length, 2);
    assert.deepEqual(hojasDeSeccion({}, 'justificacion'), []);

    const pares = paresDeReescritura(h, [
        { id: 'H1', texto: 'Sirve para determinar la relación entre los recordatorios y la inasistencia a las citas en el hospital.' },
        { id: 'h2', texto: 'Los pacientes y el personal de consulta externa del hospital.' },   // igual: no es un cambio
        { id: 'h9', texto: 'Frase que la IA inventó para una clave que no existe en la sección.' },
        { id: 'h2', texto: 'Sí.' },                                                              // demasiado corta
    ]);
    assert.equal(pares.length, 1);
    assert.match(pares[0].antes, /^Sirve para describir cuántos pacientes faltan a sus citas en el hospital$/);
    // El reemplazo llega al formulario de la sección, con su antes y después.
    const s = seccionesAfectadas(data, pares, []);
    assert.deepEqual(s.map((x) => x.id), ['justificacion']);
    assert.match(s[0].valores.justificacionForm.conveniencia, /^Sirve para determinar la relación/);
    assert.equal(s[0].valores.justificacionForm.id, data.justificacionForm.id); // los identificadores no se tocan
    assert.deepEqual(paresDeReescritura(h, null), []);
});
