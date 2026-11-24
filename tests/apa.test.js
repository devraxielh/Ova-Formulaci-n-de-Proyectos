import test from 'node:test';
import assert from 'node:assert/strict';
import { citaNarrativa, citaParentetica, citasEnTexto, claveRef, faltantes, ordenarReferencias, referenciaAPA, revisarCitas } from '../src/services/apa.js';

const articulo = { tipo: 'articulo', autores: 'Pérez, Ana María; Gómez, L.', anio: '2022', titulo: 'Inasistencia a citas médicas', revista: 'Revista de Salud Pública', volumen: '24', numero: '3', paginas: '10-25', doi: '10.1234/rsp.1' };
const tres = { tipo: 'articulo', autores: 'Smith, J.; Lee, K.; Wong, T.', anio: '2021', titulo: 'No-shows', revista: 'Health Services', volumen: '10' };
const ley = { tipo: 'ley', titulo: 'Ley 1751 de 2015', anio: '2015', descripcion: 'Por medio de la cual se regula el derecho fundamental a la salud', fecha: '16 de febrero' };
const institucion = { tipo: 'informe', autores: 'Ministerio de Salud', anio: '2024', titulo: 'Informe de oportunidad', editorial: 'Ministerio de Salud' };

test('referencia de artículo en APA 7', () => {
    assert.equal(referenciaAPA(articulo), 'Pérez, A. M. y Gómez, L. (2022). Inasistencia a citas médicas. *Revista de Salud Pública*, *24*(3), 10–25. https://doi.org/10.1234/rsp.1');
});

test('libro, ley e institución', () => {
    assert.equal(referenciaAPA({ tipo: 'libro', autores: 'Bandura, A.', anio: '1977', titulo: 'Social learning theory', editorial: 'Prentice Hall' }), 'Bandura, A. (1977). *Social learning theory*. Prentice Hall.');
    assert.equal(referenciaAPA(ley), 'Ley 1751 de 2015. Por medio de la cual se regula el derecho fundamental a la salud. 16 de febrero de 2015.');
    assert.equal(referenciaAPA(institucion), 'Ministerio de Salud. (2024). *Informe de oportunidad*.');
});

test('citas con uno, dos y tres o más autores', () => {
    assert.equal(citaParentetica(articulo), '(Pérez y Gómez, 2022)');
    assert.equal(citaNarrativa(articulo), 'Pérez y Gómez (2022)');
    assert.equal(citaParentetica(tres), '(Smith et al., 2021)');
    assert.equal(citaParentetica(ley), '(Ley 1751, 2015)');
    assert.equal(citaParentetica(institucion), '(Ministerio de Salud, 2024)');
});

test('campos que faltan y orden alfabético', () => {
    assert.deepEqual(faltantes({ tipo: 'articulo', autores: 'Díaz, M.', anio: '2023' }), ['título', 'revista']);
    assert.deepEqual(ordenarReferencias([tres, articulo, institucion]).map(claveRef), ['ministeriodesalud|2024', 'perez|2022', 'smith|2021']);
});

test('detecta citas parentéticas, narrativas, de instituciones y de normas', () => {
    const claves = citasEnTexto('Según el Ministerio de Salud (2024) y Pérez y Gómez (2022); además (Smith et al., 2021; Díaz, 2023) y la Ley 1581 de 2012.').map((c) => c.clave);
    assert.deepEqual(claves.sort(), ['diaz|2023', 'ley1581|2012', 'ministeriodesalud|2024', 'perez|2022', 'smith|2021']);
});

test('no confunde estadísticos ni tablas con citas', () => {
    assert.deepEqual(citasEnTexto('Como se observa en la tabla 1 (n = 278), la media fue alta (M = 46,8; DE = 12,3) y (rho = 0,41; p < 0,001).'), []);
});

test('cruza citas con referencias', () => {
    const r = revisarCitas({ discusion: 'Coincide con Pérez y Gómez (2022) y con (García, 2019).' }, [articulo, tres]);
    assert.deepEqual(r.sinReferencia.map((c) => c.clave), ['garcia|2019']);
    assert.deepEqual(r.noCitadas.map(claveRef), ['smith|2021']);
    assert.equal(r.vecesDe(articulo), 1);
});

test('análisis de datos: CSV, frecuencias, descriptivos y tabla APA', async () => {
    const { leerCsv, aTabla, analizar, tablaDe, fraseDe, descriptivos } = await import('../src/services/estadistica.js');
    const filas = leerCsv('﻿Motivo;Edad;Comentario\r\nOlvido;23;"Dijo: ""no me llamaron"""\r\nOlvido;31;Vive lejos; sin bus\r\nTransporte;40,5;\r\n;28;ok\r\n');
    assert.equal(filas.length, 5);
    assert.equal(filas[1][2], 'Dijo: "no me llamaron"');
    const d = descriptivos([2, 4, 4, 4, 5, 5, 7, 9]);
    assert.equal(d.media, 5);
    assert.equal(Math.round(d.de * 1000) / 1000, 2.138); // desviación estándar muestral
    assert.equal(d.mediana, 4.5);

    const tabla = aTabla([['Motivo', 'Edad'], ['Olvido', '23'], ['Olvido', '31'], ['Transporte', '40,5'], ['', '28'], ['Olvido', '35'], ['Trabajo', '52'], ['Olvido', '19'], ['Transporte', '44'], ['Olvido', '27']]);
    const [motivo, edad] = analizar(tabla);
    assert.equal(motivo.clase, 'categorica');
    assert.equal(motivo.perdidos, 1);
    assert.deepEqual(tablaDe(motivo).rows, [['Olvido', '5', '62,5 %'], ['Transporte', '2', '25,0 %'], ['Trabajo', '1', '12,5 %'], ['Total', '8', '100,0 %']]);
    assert.match(fraseDe(motivo), /^El 62,5 % de los participantes \(n = 5\) respondió «Olvido»/);
    assert.equal(edad.clase, 'numerica');
    assert.equal(edad.resumen.n, 9);
    assert.equal(tablaDe(edad).rows[0][4], '19,00');

    // Escala Likert de una encuesta en línea: respeta el orden de la escala y calcula el puntaje promedio.
    const escala = ['Nunca', 'A veces', 'Siempre'];
    const [lik] = analizar({ columnas: [{ nombre: 'Asiste', tipo: 'likert', opciones: escala }], filas: [['Siempre'], ['Siempre'], ['Nunca'], ['A veces']] });
    assert.deepEqual(lik.frec.items.map((x) => [x.valor, x.n]), [['Nunca', 1], ['A veces', 1], ['Siempre', 2]]);
    assert.equal(lik.puntaje.media, 2.25);
});

test('cruce de variables: chi-cuadrado, V de Cramér y correlaciones con su valor p', async () => {
    const { cruzar, correlacion, pChi, pT, fmtP, fuerza, porGrupo } = await import('../src/services/estadistica.js');
    // Valores de referencia de tablas estadísticas.
    assert.ok(Math.abs(pChi(3.841, 1) - 0.05) < 0.0005);
    assert.ok(Math.abs(pChi(9.488, 4) - 0.05) < 0.0005);
    assert.ok(Math.abs(pT(2.228, 10) - 0.05) < 0.0005);
    assert.ok(Math.abs(pT(1.96, 1000) - 0.05) < 0.001);

    // Tabla 2x2 clásica: 20/10 y 10/20 → chi² = 6,667 con 1 gl, p = ,010, V = ,333.
    const sexo = [...Array(30).fill('Hombre'), ...Array(30).fill('Mujer')];
    const falta = [...Array(20).fill('Sí'), ...Array(10).fill('No'), ...Array(10).fill('Sí'), ...Array(20).fill('No')];
    const c = cruzar(sexo, falta);
    assert.deepEqual(c.obs, [[20, 10], [10, 20]]);
    assert.equal(c.gl, 1);
    assert.ok(Math.abs(c.chi - 6.667) < 0.001);
    assert.ok(Math.abs(c.p - 0.0098) < 0.0005);
    assert.ok(Math.abs(c.v - 0.3333) < 0.001);
    assert.equal(c.bajas, 0);
    assert.equal(fmtP(c.p), '= ,010');
    assert.equal(fmtP(0.00004), '< ,001');
    assert.equal(fuerza(c.v), 'moderada');

    // Correlación perfecta, inversa y con un caso conocido (r = 0,7746 para estos datos).
    assert.equal(Math.round(correlacion([1, 2, 3, 4, 5], [2, 4, 6, 8, 10]).r * 1000) / 1000, 1);
    assert.equal(Math.round(correlacion([1, 2, 3, 4, 5], [5, 4, 3, 2, 1]).rho * 1000) / 1000, -1);
    const k = correlacion([1, 2, 3, 4, 5], [2, 1, 4, 3, 5]);
    assert.ok(Math.abs(k.r - 0.8) < 0.0001);
    assert.ok(Math.abs(k.rho - 0.8) < 0.0001);
    assert.ok(Math.abs(k.pR - 0.104) < 0.002);
    assert.equal(correlacion([1, 2], [1, 2]), null);

    const g = porGrupo(['A', 'A', 'B', 'B', ''], ['10', '20', '30', '50', '99']);
    assert.deepEqual(g.map((x) => [x.nombre, x.n, x.media]), [['A', 2, 15], ['B', 2, 40]]);
});

test('verificación de referencias: DOI inexistente, datos que no coinciden, fuente antigua y sitio poco confiable', async () => {
    const { verificarRef, alertasRef, parecido } = await import('../src/services/verificarRefs.js');
    const registro = { DOI: '10.1/abc', type: 'journal-article', title: ['Factores asociados a la inasistencia a citas médicas'], author: [{ family: 'Pérez Gómez', given: 'Ana' }], issued: { 'date-parts': [[2021]] }, 'container-title': ['Revista de Salud'], volume: '5', page: '10-20' };
    const red = (respuestas) => async (url) => {
        const r = respuestas.find(([clave]) => url.includes(clave));
        return r ? { ok: r[1] === 200, status: r[1], json: async () => r[2] } : { ok: false, status: 500, json: async () => ({}) };
    };
    const ref = { tipo: 'articulo', autores: 'Pérez Gómez, A.', anio: '2021', titulo: 'Factores asociados a la inasistencia a citas médicas', doi: '10.1/abc' };

    assert.equal((await verificarRef(ref, red([['10.1%2Fabc', 200, { message: registro }]]))).estado, 'ok');
    assert.equal((await verificarRef({ ...ref, doi: 'https://doi.org/10.9/falso' }, red([['10.9%2Ffalso', 404, {}]]))).estado, 'no-doi');
    // Un DOI de arXiv no está en CrossRef, pero existe en el registro general: no se marca como falso.
    const arxiv = await verificarRef({ ...ref, doi: '10.48550/arXiv.1807.06176' }, red([['api.crossref.org/works/10.48550', 404, {}], ['doi.org/api/handles/10.48550', 200, { responseCode: 1 }]]));
    assert.equal(arxiv.estado, 'ok');
    assert.match(arxiv.mensaje, /fuera de CrossRef/);
    assert.equal((await verificarRef({ ...ref, doi: '10.9/falso' }, red([['10.9%2Ffalso', 404, {}], ['doi.org/api/handles', 200, { responseCode: 100 }]]))).estado, 'no-doi');

    const mal = await verificarRef({ ...ref, anio: '2019', autores: 'Rodríguez, J.' }, red([['10.1%2Fabc', 200, { message: registro }]]));
    assert.equal(mal.estado, 'difiere');
    assert.deepEqual(mal.difs.map((d) => [d.campo, d.tuyo, d.real]), [['anio', '2019', '2021'], ['autores', 'Rodríguez', 'Pérez Gómez']]);

    // Sin DOI: se busca por título y se sugiere el DOI solo si coincide de verdad.
    const sin = await verificarRef({ ...ref, doi: '' }, red([['query.bibliographic', 200, { message: { items: [registro] } }]]));
    assert.equal(sin.estado, 'sugerida');
    assert.equal(sin.doi, '10.1/abc');
    const otra = await verificarRef({ ...ref, doi: '', titulo: 'Un estudio completamente distinto sobre agricultura' }, red([['query.bibliographic', 200, { message: { items: [registro] } }]]));
    assert.equal(otra.estado, 'sin-verificar');
    assert.equal((await verificarRef({ tipo: 'web', titulo: 'Página', url: 'https://minsalud.gov.co/x' }, red([]))).estado, 'sin-verificar');

    assert.deepEqual(alertasRef({ tipo: 'articulo', anio: '2005' }, 2026).map((a) => a.tipo), ['antigua']);
    assert.deepEqual(alertasRef({ tipo: 'ley', anio: '1993' }, 2026), []); // las leyes no envejecen
    assert.deepEqual(alertasRef({ tipo: 'web', anio: '2024', url: 'https://es.wikipedia.org/wiki/Salud' }, 2026).map((a) => a.tipo), ['sitio']);
    assert.ok(parecido('Factores asociados a la inasistencia', 'Factores asociados a la inasistencia a citas') > 0.6);
});

test('análisis cualitativo: resalta fragmentos sin solaparlos y arma la tabla de categorías', async () => {
    const { tramos, resumenCategorias, tablaCategorias } = await import('../src/services/cualitativo.js');
    const texto = 'A veces se me olvida la cita. El bus no pasa temprano y llego tarde. Nadie me llama para recordarme.';
    const c = {
        fuentes: [{ id: 'f1', nombre: 'E1', texto }, { id: 'f2', nombre: 'E2', texto: 'Yo también lo olvido.' }],
        categorias: [{ id: 'k1', nombre: 'Olvido', definicion: 'No recordar la cita', color: '#fde68a' }, { id: 'k2', nombre: 'Transporte', definicion: '', color: '#bfdbfe' }, { id: 'k3', nombre: 'Vacía', color: '#eee' }],
        citas: [
            { id: 'c1', fuenteId: 'f1', categoriaId: 'k1', texto: 'se me olvida la cita' },
            { id: 'c2', fuenteId: 'f1', categoriaId: 'k2', texto: 'El bus no pasa temprano' },
            { id: 'c3', fuenteId: 'f1', categoriaId: 'k1', texto: 'olvida la cita. El bus' }, // se solapa con c1: no se resalta dos veces
            { id: 'c4', fuenteId: 'f2', categoriaId: 'k1', texto: 'Yo también lo olvido.' },
        ],
    };
    const tr = tramos(texto, c.citas.filter((x) => x.fuenteId === 'f1'), c.categorias);
    assert.equal(tr.map((x) => x.texto).join(''), texto); // no se pierde ni se duplica texto
    assert.deepEqual(tr.filter((x) => x.cita).map((x) => [x.cita.id, x.categoria.nombre]), [['c1', 'Olvido'], ['c2', 'Transporte']]);
    const r = resumenCategorias(c);
    assert.deepEqual(r.map((x) => [x.nombre, x.n, x.enFuentes]), [['Olvido', 3, 2], ['Transporte', 1, 1], ['Vacía', 0, 0]]);
    const t = tablaCategorias({ ...c, categorias: c.categorias.map((k) => (k.id === 'k1' ? { ...k, ejemploId: 'c4' } : k)) });
    assert.equal(t.rows.length, 2); // la categoría sin fragmentos no va a la tabla
    assert.deepEqual(t.rows[0], ['Olvido', 'No recordar la cita', '3 (en 2 fuentes)', '«Yo también lo olvido.» (E2)']);
});

// Árbol mínimo que imita el DOM del navegador, para probar el editor visual sin navegador.
const arbol = (html) => {
    const raiz = { nodeType: 1, nodeName: 'DIV', childNodes: [], attrs: {} };
    const pila = [raiz];
    const des = (t) => t.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    for (const m of html.matchAll(/<\/?([a-zA-Z0-9]+)([^>]*)>|([^<]+)/g)) {
        if (m[3] !== undefined) { pila.at(-1).childNodes.push({ nodeType: 3, nodeName: '#text', textContent: des(m[3]), childNodes: [] }); continue; }
        const nombre = m[1].toUpperCase();
        if (m[0].startsWith('</')) { pila.pop(); continue; }
        const attrs = Object.fromEntries([...m[2].matchAll(/([a-z-]+)="([^"]*)"/g)].map((a) => [a[1], a[2]]));
        const nodo = { nodeType: 1, nodeName: nombre, childNodes: [], attrs, getAttribute: (k) => attrs[k] ?? null };
        pila.at(-1).childNodes.push(nodo);
        if (nombre !== 'BR') pila.push(nodo);
    }
    return raiz;
};

test('editor visual: lo que se ve con formato se guarda en el texto de siempre y vuelve igual', async () => {
    const { aHtml, aTexto } = await import('../src/services/textoRico.js');
    const casos = [
        'Un párrafo simple.',
        'Texto con **negrita** y *cursiva* en la misma línea.',
        'Primer párrafo.\n\nSegundo párrafo, según García (2021).',
        'Las causas son:\n- el olvido\n- el **transporte**\n\nY cierra aquí.',
        '3. Tercera pregunta\n4. Cuarta pregunta',
        '### Fase 1. Diagnóstico\n**Actividades:**\n- Revisar registros',
        'Menor que 5 < 10 & mayor [[tab0001]]',
    ];
    for (const texto of casos) assert.equal(aTexto(arbol(aHtml(texto))), texto);

    assert.equal(aHtml(''), '');
    assert.equal(aHtml('a **b**'), '<p>a <strong>b</strong></p>');
    assert.equal(aHtml('- uno\n- dos'), '<ul><li>uno</li><li>dos</li></ul>');
    assert.equal(aHtml('3. tres'), '<ol start="3"><li>tres</li></ol>');
    assert.match(aHtml('<script>alert(1)</script>'), /&lt;script&gt;/); // lo escrito nunca se interpreta como HTML

    // Lo que producen los navegadores al escribir: <div> anidados, <b>/<i>, espacios dentro de la negrita y <br> sueltos.
    assert.equal(aTexto(arbol('Hola <b>mundo </b>cruel<div>segunda <i>línea</i></div><div><br></div><div>tercera</div>')), 'Hola **mundo** cruel\nsegunda *línea*\n\ntercera');
    assert.equal(aTexto(arbol('<p><span style="font-weight: 700">Negrita por estilo</span></p>')), '**Negrita por estilo**');
    assert.equal(aTexto(arbol('<p><b></b>solo texto</p>')), 'solo texto');
});

test('la cursiva del editor se respeta en pantalla y en el Word de respaldo', async () => {
    const { splitInline, documentHtml, buildDocument } = await import('../src/services/projectDoc.js');
    assert.deepEqual(splitInline('a **b** y *c* fin'), [{ text: 'a ' }, { bold: true, text: 'b' }, { text: ' y ' }, { italic: true, text: 'c' }, { text: ' fin' }]);
    assert.deepEqual(splitInline('p < 0,05 * nota'), [{ text: 'p < 0,05 * nota' }]); // un asterisco suelto no es cursiva
    const html = documentHtml('P', 'A', buildDocument({ titulo: 'T', introduccion: 'El *Aedes aegypti* es el **vector**.' }));
    assert.match(html, /El <i>Aedes aegypti<\/i> es el <b>vector<\/b>\./);
});
