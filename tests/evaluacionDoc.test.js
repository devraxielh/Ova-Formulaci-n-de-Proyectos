import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ev = await import('../src/services/evaluacionDoc.js');

test('títulos de sección: reconoce los habituales y no confunde el índice ni los párrafos', () => {
    const casos = {
        '1 Introducción': 'introduccion', '1. INTRODUCCIÓN': 'introduccion', 'III. METODOLOGÍA': 'metodologia', 'Capítulo 2. Marco teórico': 'marco',
        'Diseño metodológico': 'metodologia', '2.1 Formulación o Pregunta de Investigación': 'pregunta', 'Objetivo general': 'objetivos',
        'Alcances y Limitaciones del Proyecto': 'alcances', 'Resultados y discusión': 'resultados', 'Referencias bibliográficas': 'referencias',
        'Tabla de contenido': 'indice', 'Anexo A. Matriz de consistencia': 'anexos',
        // No son títulos de sección:
        'Introducción ........ 3': '', '1 Introducción 1': '', 'Objetivo específico 1: caracterizar las prácticas': '', 'La introducción presenta el tema.': '',
    };
    Object.entries(casos).forEach(([texto, id]) => assert.equal(ev.seccionDeTitulo(texto), id, texto));
    assert.equal(ev.seccionDeTitulo('1 Introducción\t3'), ''); // índice de Word (con tabulación)
});

test('título de la portada, pregunta y objetivos', () => {
    assert.equal(ev.tituloDe(['Universidad de Córdoba', 'Facultad de Ingeniería', 'Factores asociados al uso de contraseñas inseguras en estudiantes de una universidad de', 'Montería, Córdoba', 'Presentado por:', 'Ana Pérez', 'Montería, 2026']), 'Factores asociados al uso de contraseñas inseguras en estudiantes de una universidad de Montería, Córdoba');
    assert.equal(ev.tituloDe(['CORPORACIÓN UNIFICADA', 'Diseño de un sistema de inventario para tiendas de barrio', 'Juan Pérez', 'Noviembre de 2026']), 'Diseño de un sistema de inventario para tiendas de barrio');
    assert.equal(ev.preguntaDe('Texto sin pregunta.', 'Por eso se plantea: ¿Qué factores se asocian a la deserción de los estudiantes de primer semestre? Y luego…'), '¿Qué factores se asocian a la deserción de los estudiantes de primer semestre?');
    // En un PDF cada objetivo puede ocupar varios renglones; con viñetas o sin ellas.
    const o = ev.objetivosDe('Objetivo general\nAnalizar los factores asociados a la deserción\nen estudiantes de primer semestre.\nObjetivos específicos\n1. Caracterizar a los estudiantes que desertan.\n2. Comparar la deserción según la jornada\ny el programa.\n• Establecer la relación entre el rendimiento y la deserción.');
    assert.equal(o.general, 'Analizar los factores asociados a la deserción en estudiantes de primer semestre.');
    assert.deepEqual(o.especificos, ['Caracterizar a los estudiantes que desertan.', 'Comparar la deserción según la jornada y el programa.', 'Establecer la relación entre el rendimiento y la deserción.']);
});

test('PDF: junta los fragmentos de la misma altura en renglones, de arriba abajo', () => {
    const item = (str, x, y) => ({ str, transform: [1, 0, 0, 1, x, y] });
    const lineas = ev.lineasDePagina([item('Introducción', 120, 700), item('1', 72, 700.5), item('segundo', 72, 650), item('renglón', 130, 650), item(' ', 10, 10), item('12', 500, 760)]);
    assert.deepEqual(lineas, ['12', '1 Introducción', 'segundo renglón']);
});

test('un Word real: el proyecto de ejemplo se lee, se separa en secciones y sus citas cuadran', async () => {
    const { buildDocument } = await import('../src/services/projectDoc.js');
    const { docxBuffer } = await import('../src/services/docx.js');
    for (const clave of ['sistemas', 'industrial']) {
        const ejemplo = JSON.parse(fs.readFileSync(path.join(raiz, 'server', 'ejemplos', `${clave}.json`), 'utf8'));
        // eslint-disable-next-line no-await-in-loop
        const buffer = await docxBuffer(ejemplo.nombre, 'Ana Pérez', buildDocument(ejemplo.data), { ciudad: 'Montería' });
        // eslint-disable-next-line no-await-in-loop
        const d = ev.diagnosticar(await ev.leerDocx(buffer));
        assert.equal(d.titulo, ejemplo.data.titulo, clave);
        assert.equal(d.pregunta, ejemplo.data.pregunta, clave);
        assert.equal(d.general, ejemplo.data.objetivosForm.general, clave);
        assert.deepEqual(d.especificos, ejemplo.data.objetivosForm.especificos, clave);
        const faltan = d.estructura.filter((e) => e.esperada && !e.encontrada).map((e) => e.id);
        assert.deepEqual(faltan, [], clave);
        ['resumen', 'introduccion', 'alcances', 'fases', 'resultados', 'conclusiones'].forEach((id) => assert.ok(d.secciones[id]?.renglones.length, `${clave}: ${id}`));
        assert.ok(d.coherencia.score >= 85, `${clave}: coherencia ${d.coherencia.score}`);
        assert.equal(d.citas.referencias, ejemplo.data.referencias.length, clave);
        assert.deepEqual([d.citas.sinReferencia.length, d.citas.noCitadas.length, d.citas.sinLeer.length], [0, 0, 0], clave);
        // Las tablas y anexos no se cuelan en las secciones: el anexo (cuestionario) no está en Referencias.
        assert.ok(!ev.textoDe(d.secciones.referencias).includes('Cuestionario sobre'), clave);
    }
});

test('evaluación con IA: mensajes con los criterios y lectura de la respuesta', () => {
    const msgs = ev.mensajesEvaluacion({ id: 'introduccion', texto: 'En Colombia…', titulo: 'T', pregunta: '¿P?', general: 'Analizar X.', especificos: ['Describir Y.'] });
    assert.match(msgs[1].content, /contexto: Presenta el contexto/);
    assert.match(msgs[1].content, /OBJETIVO GENERAL: Analizar X\./);
    const r = ev.leerEvaluacion('introduccion', 'texto previo {"valoracion":"Buena base.","criterios":[{"id":"contexto","estado":"cumple","evidencia":"En Colombia","comentario":"Bien."},{"id":"problema","estado":"parcial","comentario":"Falta delimitarlo."},{"id":"otro","estado":"cumple"}],"sugerencias":["Agregar el método."]}');
    assert.equal(r.criterios.length, 6); // los seis criterios de la introducción, en su orden
    assert.deepEqual(r.criterios.slice(0, 3).map((c) => c.estado), ['cumple', 'parcial', 'no']); // lo que la IA no evaluó cuenta como ausente
    assert.equal(r.puntaje, 25); // (1 + 0,5) de 6
    assert.equal(r.nivel, 'falta');
    assert.deepEqual(r.sugerencias, ['Agregar el método.']);
});

test('documentos reales: pregunta como título, celdas de tablas, renglones partidos y referencias en otros estilos', () => {
    assert.equal(ev.seccionDeTitulo('2.3 Pregunta de investigación'), 'pregunta');
    assert.equal(ev.seccionDeTitulo('metodología.'), ''); // renglón partido de un párrafo en un PDF
    // Una tabla (cronograma) con celdas «Marco teórico» o «Resultados» no abre secciones.
    const { secciones } = ev.separarSecciones([{ texto: 'Planteamiento del problema', titulo: true }, { texto: 'El problema es grave.' }, { texto: 'Actividad · Marco teórico · Resultados · Conclusiones', tabla: true }, { texto: 'Sigue el planteamiento.' }]);
    assert.deepEqual(Object.keys(secciones), ['planteamiento']);
    assert.equal(secciones.planteamiento.renglones.length, 3);
    // Objetivos escritos en el mismo renglón del rótulo; un párrafo de cierre no es otro objetivo.
    assert.deepEqual(ev.objetivosDe('Objetivo específico 1: Identificar las causas de la deserción.\nObjetivo específico 2: Describir el perfil de quienes desertan.').especificos, ['Identificar las causas de la deserción.', 'Describir el perfil de quienes desertan.']);
    assert.deepEqual(ev.objetivosDe('Objetivos específicos\n1. Identificar las causas de la deserción.\nCon esto se busca aportar a la universidad.').especificos, ['Identificar las causas de la deserción.']);
    // Referencias ICONTEC y entradas sin año no se juntan con la siguiente.
    assert.equal(ev.entradasReferencias('PÉREZ, Juan. Metodología. Bogotá: Norma, 2019.\nGÓMEZ, Ana. Estadística básica. Medellín: UdeA, 2020.').length, 2);
    assert.equal(ev.entradasReferencias('Ministerio de Salud. Portal de datos. https://www.minsalud.gov.co\nPérez, J. (2020). Título. Editorial.').length, 2);
});
