import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluarCoherencia } from '../src/services/coherencia.js';
import { buildDocument, documentHtml } from '../src/services/projectDoc.js';
import { nivelDe, problemasEscalera } from '../src/data/nivelesVerbos.js';
import { generalDesdeTitulo } from '../src/data/ejemplos.js';

const proyecto = {
    titulo: 'Análisis de los factores asociados a la inasistencia a citas médicas en pacientes de consulta externa de un hospital de Sincelejo',
    pregunta: '¿Qué factores están asociados a la inasistencia a citas médicas en los pacientes de consulta externa de un hospital de Sincelejo?',
    objetivoGeneral: 'Analizar los factores asociados a la inasistencia a citas médicas en pacientes de consulta externa de un hospital de Sincelejo.',
    objetivos: '### Objetivo general\nAnalizar los factores.\n\n### Objetivos específicos\n1. Identificar las causas de la inasistencia a citas médicas.\n2. Caracterizar la inasistencia a citas médicas en los pacientes.\n3. Establecer la relación entre el olvido y la inasistencia a citas médicas.',
    tituloForm: { quien: 'pacientes de consulta externa', donde: 'un hospital de Sincelejo' },
};

test('un proyecto coherente obtiene coherencia alta', () => {
    const r = evaluarCoherencia(proyecto);
    assert.equal(r.nivel, 'alta');
    assert.ok(r.checks.find((c) => c.id === 'titulo-general').score >= 80);
});

test('una pregunta de otro tema baja la coherencia y explica por qué', () => {
    const r = evaluarCoherencia({ ...proyecto, pregunta: '¿Cómo diseñar una aplicación móvil para tiendas de barrio?' });
    const check = r.checks.find((c) => c.id === 'titulo-pregunta');
    assert.ok(check.score < 50);
    assert.match(check.porque, /no aparecen en la pregunta/);
    assert.ok(check.arreglo);
});

test('el verbo del título pasa a infinitivo', () => {
    assert.equal(generalDesdeTitulo('Diseño de una aplicación móvil para pacientes'), 'Diseñar una aplicación móvil para pacientes');
    assert.equal(generalDesdeTitulo('Caracterización del consumo de agua'), 'Caracterizar el consumo de agua');
});

test('la escalera de objetivos específicos avisa cuando un verbo baja de nivel', () => {
    assert.equal(nivelDe('Proponer una estrategia'), 6);
    assert.deepEqual(problemasEscalera('', ['Identificar x', 'Analizar y', 'Proponer z']), ['', '', '']);
    assert.deepEqual(problemasEscalera('', ['Proponer z', 'Describir x']), ['', 'baja']);
});

test('el documento pone el resumen después del título y las referencias al final', () => {
    const secciones = buildDocument({
        ...proyecto, resumen: 'Resumen del estudio.', palabrasClave: 'inasistencia, citas médicas', introduccion: 'Introducción.', conclusiones: '1. Conclusión.',
        referencias: [{ id: 'b', tipo: 'libro', autores: 'Smith, J.', anio: '2021', titulo: 'B', editorial: 'X' }, { id: 'a', tipo: 'libro', autores: 'Díaz, M.', anio: '2023', titulo: 'A', editorial: 'X' }],
    }).filter((s) => s.content.length > 0 && s.inDocument !== false).map((s) => s.id);
    assert.deepEqual(secciones.slice(0, 4), ['titulo', 'resumen', 'preliminares', 'introduccion']);
    // Después de las referencias solo van los anexos (aquí, la matriz de consistencia automática).
    assert.deepEqual(secciones.slice(-2), ['referencias', 'anexos']);
});

test('el Word lleva sangría francesa en las referencias y cursivas', () => {
    const html = documentHtml('Mi proyecto', 'Autor', buildDocument({ titulo: 'T', referencias: [{ id: 'a', tipo: 'libro', autores: 'Díaz, M.', anio: '2023', titulo: 'Un libro', editorial: 'X' }] }));
    assert.match(html, /<p class="ref">Díaz, M\. \(2023\)\. <i>Un libro<\/i>\. X\.<\/p>/);
    assert.match(html, /@page WordSection1/);
});

test('el índice queda numerado como la plantilla y sin títulos repetidos', async () => {
    const { documentoNumerado } = await import('../src/services/projectDoc.js');
    const secciones = documentoNumerado(buildDocument({
        ...proyecto,
        resumen: 'Resumen.', abstract: 'Abstract.', keywords: 'a, b',
        introduccion: 'Intro.', planteamiento: 'Problema.\n**Diagnóstico:**\nTexto.',
        justificacion: 'J.', alcances: 'A.', limitaciones: 'L.',
        marcoAntecedentes: 'x', marcoTeorico: 'x', marcoConceptual: 'x', marcoContextual: 'x', marcoLegal: 'x',
        metEnfoque: 'x', metTipo: 'x', metDiseno: 'x', poblacionSugerida: 'x', metPlanAnalisis: 'x', instrumentos: 'x\n### Validez y confiabilidad\ny',
        cronogramaItems: [{ fase: 'Fase 1', actividad: 'a', inicio: 1, fin: 2 }], presupuesto: [{ categoria: 'R', descripcion: 'd', fuente: 'f', costo: 10 }],
        fases: '### Fase 1\n**Actividades:**\n- a', resultados: 'r', discusion: 'd', conclusiones: '### Conclusión general\nc', recomendaciones: 'r',
        referencias: [{ id: 'a', tipo: 'libro', autores: 'Díaz, M.', anio: '2023', titulo: 'A', editorial: 'X' }],
    }));
    const indice = secciones.filter((s) => s.id !== 'titulo').flatMap((s) => [s.titulo, ...s.content.filter((b) => b.type === 'heading').map((b) => b.titulo)]);
    assert.deepEqual(indice, [
        'Resumen', 'Abstract', 'Preliminares', 'Declaración de originalidad y autonomía', 'Declaración de exoneración de responsabilidad',
        '1 Introducción', '2 Planteamiento del problema', '2.1 Formulación o Pregunta de Investigación',
        '3 Objetivos', '3.1 Objetivo general', '3.2 Objetivos específicos', '4 Justificación', '5 Alcances y Limitaciones del Proyecto',
        '6 Marco Referencial', '6.1 Antecedentes', '6.2 Marco teórico', '6.3 Marco Conceptual', '6.4 Marco Contextual', '6.5 Marco legal',
        '7 Metodología', '7.1 Enfoque de investigación', '7.2 Tipos de investigación', '7.3 Diseños de Investigación', '7.4 Población y muestra',
        '7.5 Plan de análisis de la información', '7.5.1 Instrumentos de recolección de información', '7.6 Cronograma', '7.7 Presupuesto',
        '8 Desarrollo de las fases del proyecto', '9 Resultados y discusión', '10 Conclusiones', 'Referencias bibliográficas',
        'Anexos', 'Anexo A. Matriz de consistencia',
    ]);
});

test('tablas y figuras propias se numeran de corrido y los anexos van al final', async () => {
    const { documentoNumerado } = await import('../src/services/projectDoc.js');
    const secciones = documentoNumerado(buildDocument({
        ...proyecto,
        metEnfoque: 'x', cronogramaItems: [{ fase: 'F1', actividad: 'Encuesta', inicio: 2, fin: 4 }], ganttPeriodos: 6,
        resultados: 'Hallazgos.', discusion: 'Discusión.',
        elementos: [
            { id: 'a', tipo: 'tabla', seccion: 'resultados', titulo: 'Motivos', head: ['Motivo', 'n'], rows: [['Olvido', '62'], ['', '']] },
            { id: 'b', tipo: 'figura', seccion: 'resultados', titulo: 'Distribución', fileId: 7, w: 800, h: 400 },
            { id: 'c', tipo: 'figura', seccion: 'resultados', titulo: 'Sin archivo' },
        ],
        anexos: [{ id: 'x', titulo: 'Cuestionario', contenido: '1. Edad' }, { id: 'y', titulo: 'Vacío', contenido: '' }],
    }));
    const rotulos = secciones.flatMap((s) => s.content).filter((b) => b.rotulo).map((b) => `${b.rotulo} ${b.caption}`);
    assert.deepEqual(rotulos, ['Tabla 1 Cronograma de actividades', 'Figura 1 Diagrama de Gantt del proyecto', 'Tabla 2 Motivos', 'Figura 2 Distribución']);
    const gantt = secciones.flatMap((s) => s.content).find((b) => b.type === 'gantt');
    assert.equal(gantt.total, 6);
    const tabla = secciones.flatMap((s) => s.content).find((b) => b.caption === 'Motivos');
    assert.equal(tabla.rows.length, 1); // la fila vacía no pasa al documento
    const res = secciones.find((s) => s.id === 'resultados').content.map((b) => b.type === 'sub' ? b.text : b.type);
    assert.deepEqual(res, ['Resultados', 'paragraph', 'table', 'figure', 'Discusión', 'paragraph']); // van antes de la discusión
    const anexos = secciones.at(-1);
    assert.equal(anexos.id, 'anexos');
    assert.deepEqual(anexos.content.filter((b) => b.type === 'heading').map((b) => b.text), ['Anexo A. Matriz de consistencia', 'Anexo B. Cuestionario']);
    const matriz = anexos.content.find((b) => b.type === 'table');
    assert.equal(matriz.rows.length, 3);
    assert.equal(matriz.caption, undefined); // sin «Tabla N»: no entra en la lista de tablas
});

test('una tabla puede ir después de un párrafo, se cita sola y las marcas [[id]] siguen su número', async () => {
    const { documentoNumerado, parrafosDe } = await import('../src/services/projectDoc.js');
    const datos = {
        ...proyecto, metEnfoque: 'x',
        resultados: 'Primer párrafo de resultados.\n\nSegundo párrafo; el detalle está en la [[graf001]].\n\nTercer párrafo.',
        discusion: 'Como muestra la [[tab0001]], coincide con otros estudios. Marca desconocida [[zzzzz99]] aquí.',
        elementos: [
            { id: 'tab0001', tipo: 'tabla', seccion: 'resultados', titulo: 'Motivos', despues: 1, head: ['a', 'b'], rows: [['1', '2']] },
            { id: 'graf001', tipo: 'figura', seccion: 'resultados', titulo: 'Gráfico', despues: 2, fileId: 3 },
            { id: 'tab0002', tipo: 'tabla', seccion: 'resultados', titulo: 'Edades', despues: 3, head: ['a', 'b'], rows: [['1', '2']] },
            { id: 'tab0003', tipo: 'tabla', seccion: 'resultados', titulo: 'Sin cita', despues: 3, citar: false, head: ['a', 'b'], rows: [['1', '2']] },
        ],
    };
    assert.deepEqual(parrafosDe(datos, 'resultados').map((t) => t.slice(0, 7)), ['Primer ', 'Segundo', 'Tercer ']);
    const res = documentoNumerado(buildDocument(datos)).find((s) => s.id === 'resultados').content;
    assert.deepEqual(res.map((b) => b.rotulo || (b.type === 'sub' ? b.text : 'p')), ['Resultados', 'p', 'Tabla 1', 'p', 'Figura 1', 'p', 'Tabla 2', 'Tabla 3', 'Discusión', 'p']);
    const p = res.filter((b) => b.type === 'paragraph').map((b) => b.text);
    assert.equal(p[0], 'Primer párrafo de resultados.'); // ya está citada en la discusión: no se repite
    assert.equal(p[1], 'Segundo párrafo; el detalle está en la Figura 1.');
    assert.equal(p[2], 'Tercer párrafo (ver Tabla 2).'); // nadie la citaba: se cita sola; la que pidió no citarse, no
    assert.equal(p[3], 'Como muestra la Tabla 1, coincide con otros estudios. Marca desconocida aquí.');
});

test('el instrumento sale dentro del Plan de análisis (7.5.1) y solo va a anexos si el estudiante lo pide', async () => {
    const { documentoNumerado } = await import('../src/services/projectDoc.js');
    const ins = { id: 'i1', titulo: 'Cuestionario de asistencia', intro: 'Anónimo.', preguntas: [{ id: 'q1', texto: '¿Por qué faltó?', tipo: 'opcion', opciones: ['Olvido', 'Transporte'] }, { id: 'q2', texto: 'Asisto siempre', tipo: 'likert' }] };
    const base = { ...proyecto, metEnfoque: 'x', metPlanAnalisis: 'Estadística descriptiva.', instrumentos: 'Se usará una encuesta.' };
    const met = (datos) => documentoNumerado(buildDocument(datos)).find((s) => s.id === 'metodologia').content;
    const anexos = (datos) => (documentoNumerado(buildDocument(datos)).find((s) => s.id === 'anexos')?.content || []).filter((b) => b.type === 'heading').map((b) => b.text);

    const dentro = met({ ...base, instrumentosGen: [ins] });
    const i = dentro.findIndex((b) => b.titulo === '3.2.1 Instrumentos de recolección de información');
    assert.ok(i > 0);
    assert.deepEqual(dentro.slice(i + 1, i + 5).map((b) => b.type === 'list' ? `${b.nums[0]}. ${b.items[0]}` : b.text), ['Se usará una encuesta.', 'Cuestionario de asistencia', 'Anónimo.', '1. ¿Por qué faltó?']);
    assert.ok(dentro.some((b) => b.type === 'plain' && b.text.includes('(1) Totalmente en desacuerdo')));
    assert.deepEqual(anexos({ ...base, instrumentosGen: [ins] }), ['Anexo A. Matriz de consistencia']);

    // Sin descripción de instrumentos en Metodología, el subtítulo se crea igual.
    const solo = met({ ...proyecto, metEnfoque: 'x', metPlanAnalisis: 'Plan.', instrumentosGen: [ins] });
    assert.ok(solo.some((b) => b.titulo === '3.2.1 Instrumentos de recolección de información'));

    assert.deepEqual(anexos({ ...base, instrumentosGen: [{ ...ins, ubicacion: 'anexo' }] }), ['Anexo A. Matriz de consistencia', 'Anexo B. Cuestionario de asistencia']);
    assert.ok(!met({ ...base, instrumentosGen: [{ ...ins, ubicacion: 'no' }] }).some((b) => b.text === 'Cuestionario de asistencia'));
});

test('diapositivas de sustentación: siguen los ítems de la plantilla, con resumen de la IA o las primeras frases', async () => {
    const { guionDiapositivas, apartadosParaResumir } = await import('../src/services/diapositivas.js');
    const datos = {
        ...proyecto, director: 'Rodrigo García, PhD', ciudad: 'Sincelejo',
        introduccion: 'La inasistencia a citas médicas afecta la eficiencia de los servicios de salud en Colombia y retrasa la atención.',
        planteamiento: '### Diagnóstico\nEn el hospital se pierde una de cada cinco citas médicas programadas en consulta externa.',
        justificacion: 'El estudio es conveniente porque permite reducir costos y mejorar la oportunidad de la atención a los pacientes.',
        alcances: 'El estudio abarca a los pacientes de consulta externa durante el primer semestre de 2026.', limitaciones: 'No se incluyen pacientes de urgencias por falta de acceso a esos registros.',
        marcoTeorico: 'El modelo de creencias en salud explica por qué las personas asisten o no a sus controles médicos.', marcoAntecedentes: 'García (2021) encontró que el olvido explica la mayoría de las inasistencias en hospitales públicos.',
        metEnfoque: 'El enfoque es cuantitativo porque se miden variables con instrumentos estandarizados.', metTipo: 'El tipo es correlacional porque relaciona factores con la inasistencia.',
        resultados: 'El 62 % de los pacientes olvidó la cita y el 25 % no tuvo transporte para llegar.', discusion: 'Estos hallazgos coinciden con García (2021) y sugieren implementar recordatorios.',
        conclusiones: 'El olvido es el principal factor asociado a la inasistencia en esta población.', recomendaciones: 'Se recomienda al hospital enviar un mensaje de texto el día anterior a la cita.',
        elementos: [
            { id: 'tab0001', tipo: 'tabla', seccion: 'resultados', titulo: 'Motivos', head: ['Motivo', 'n'], rows: [['Olvido', '74']] },
            { id: 'fig0001', tipo: 'figura', seccion: 'resultados', titulo: 'Distribución', fileId: 9, w: 1200, h: 420 },
        ],
        referencias: [{ id: 'a', tipo: 'libro', autores: 'Díaz, M.', anio: '2023', titulo: 'Gestión', editorial: 'X' }],
    };
    const slides = guionDiapositivas(buildDocument(datos), datos, { autor: 'Ana Pérez\nLuis Ruiz', resumen: { enfoque: 'Cuantitativo: se miden **variables** [[tab0001]]', implicaciones: 'Permite decidir dónde invertir en recordatorios' } });
    assert.deepEqual(slides.map((s) => s.titulo === datos.titulo ? s.tipo : s.titulo), [
        'portada', 'Introducción', 'Planteamiento del Problema', 'Objetivos', 'Justificación', 'Marco Referencial', 'Metodología',
        'Resultados', 'Conclusiones y Recomendaciones', 'Referencias bibliográficas', '¿Preguntas?', // exactamente las de la plantilla, sin diapositivas extra
    ]);
    const bloques = (titulo) => slides.find((s) => s.titulo === titulo).bloques.map((b) => b.rotulo);
    assert.deepEqual(bloques('Introducción'), ['Contexto', 'Importancia']);
    assert.deepEqual(bloques('Planteamiento del Problema'), ['Problema Identificado', 'Pregunta Central']);
    assert.deepEqual(bloques('Justificación'), ['Justificación', 'Alcances', 'Limitaciones']);
    assert.deepEqual(bloques('Marco Referencial'), ['Teorías', 'Antecedentes']); // sin marco conceptual escrito, ese apartado no sale vacío
    assert.deepEqual(bloques('Metodología'), ['Enfoque de investigación', 'Tipo de investigación']);
    assert.deepEqual(bloques('Resultados'), ['Hallazgos', 'Interpretación']);
    assert.deepEqual(bloques('Conclusiones y Recomendaciones'), ['Conclusiones', 'Recomendaciones', 'Implicaciones']);
    const met = slides.find((s) => s.titulo === 'Metodología').bloques;
    assert.equal(met[0].texto, 'Cuantitativo: se miden variables'); // resumen de la IA, sin negritas ni marcas
    assert.match(met[1].texto, /^El tipo es correlacional/); // sin IA: primeras frases del apartado
    assert.match(slides[2].bloques[0].texto, /^En el hospital se pierde/); // sin el título «### Diagnóstico»
    assert.equal(slides[2].bloques[1].texto, datos.pregunta); // la pregunta va literal, no resumida
    assert.equal(slides[0].antetitulo, 'Socialización');
    assert.equal(slides[3].especificos.length, 3);

    const pedir = apartadosParaResumir(datos).map((a) => a.clave);
    assert.ok(pedir.includes('contexto') && pedir.includes('implicaciones') && !pedir.includes('pregunta') && !pedir.includes('conceptos'));
});

test('la fila de instrumentos se redacta con el instrumento armado que tiene asociado', async () => {
    const { redactarInstrumentos, fraseArmado } = await import('../src/data/metodologia.js');
    const filas = [
        { id: 'f1', tecnica: 'Encuesta', instrumento: 'cuestionario', aplicaA: 'los pacientes', objetivo: 'el objetivo específico 1' },
        { id: 'f2', tecnica: 'Entrevista', instrumento: 'guía de entrevista', aplicaA: 'las enfermeras', objetivo: '' },
    ];
    const armado = { id: 'a1', filaId: 'f1', titulo: 'Cuestionario', preguntas: [
        { id: 'q1', texto: 'Edad', tipo: 'numero' }, { id: 'q2', texto: 'Olvido la cita', tipo: 'likert' }, { id: 'q3', texto: 'Llego tarde', tipo: 'likert' }, { id: 'q4', texto: '', tipo: 'abierta' },
    ] };
    assert.equal(fraseArmado(armado), ' Consta de 3 preguntas (2 de escala tipo Likert, 1 numérica) y se presenta completo al final de este apartado.');
    assert.equal(fraseArmado({ ...armado, ubicacion: 'anexo', preguntas: [{ id: 'q', texto: '¿Qué opina?', tipo: 'abierta' }] }), ' Consta de 1 pregunta abierta y se presenta completo en los anexos.');
    assert.equal(fraseArmado(null), '');

    const texto = redactarInstrumentos(filas, [armado]);
    const [uno, dos] = texto.split('\n');
    assert.ok(uno.startsWith('- **Encuesta (cuestionario):** se aplicará a los pacientes para el objetivo específico 1. Consta de 3 preguntas'));
    assert.ok(!dos.includes('Consta de')); // la fila sin instrumento armado se redacta igual que antes
    assert.equal(redactarInstrumentos(filas), redactarInstrumentos(filas, [])); // sin instrumentos armados no cambia nada
});

test('validez y confiabilidad: sin cálculo el documento deja dicho que falta; con cálculo, no', async () => {
    const { redactarInstrumentos, estadoValidacion } = await import('../src/data/metodologia.js');
    const fila = { id: 'f1', tecnica: 'Encuesta', instrumento: 'cuestionario', aplicaA: 'los pacientes', validaciones: ['prueba piloto', 'juicio de expertos'] };
    assert.deepEqual(estadoValidacion(fila).map((v) => [v.titulo, v.hecho]), [['Prueba piloto', false], ['Juicio de expertos', false]]);
    const sin = redactarInstrumentos([fila]);
    assert.equal((sin.match(/\[Falta: registra en la calculadora/g) || []).length, 2);
    assert.ok(sin.includes('los resultados de prueba piloto de el cuestionario') || sin.includes('los resultados de prueba piloto del cuestionario'));

    const conPiloto = { ...fila, validacionDatos: { 'prueba piloto': { participantes: 15, tiempo: 12 } } };
    assert.deepEqual(estadoValidacion(conPiloto).map((v) => v.hecho), [true, false]);
    const con = redactarInstrumentos([conPiloto]);
    assert.equal((con.match(/\[Falta:/g) || []).length, 1); // solo queda pendiente el juicio de expertos
    assert.ok(con.includes('prueba piloto con 15 personas'));
    assert.deepEqual(estadoValidacion({ instrumento: 'guía' }), []); // sin métodos elegidos no hay nada pendiente
});
