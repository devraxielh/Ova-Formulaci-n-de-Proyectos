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
