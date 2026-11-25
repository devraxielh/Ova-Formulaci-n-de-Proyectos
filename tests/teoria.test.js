// Teoría ampliada de las presentaciones: cada archivo de src/data/teoria/ corresponde a una clase y a sus diapositivas.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
// clase → dónde están definidas sus diapositivas
const CLASES = {
    ideacion: 'src/components/Ideacion.jsx',
    titulo: 'src/components/Titulo.jsx',
    pregunta: 'src/components/PreguntaInvestigacion.jsx',
    arbolProblema: 'src/data/arbolClase.js',
    arbolObjetivos: 'src/data/arbolObjetivosClase.js',
    planteamiento: 'src/components/PlanteamientoProblema.jsx',
    objetivos: 'src/components/Objetivos.jsx',
    introduccion: 'src/components/Introduccion.jsx',
    justificacion: 'src/components/Justificacion.jsx',
    alcances: 'src/components/AlcancesLimitaciones.jsx',
    marco: 'src/data/marcoClase.js',
    metodologia: 'src/data/metodologiaClase.js',
    fases: 'src/data/fasesClase.js',
    resultados: 'src/data/resultadosClase.js',
    conclusiones: 'src/data/conclusionesClase.js',
    resumen: 'src/data/resumenClase.js',
};
// Diapositivas que no llevan teoría: portada, actividades, cierre, construcción y revisión.
const SIN_TEORIA = (id, seccion) => ['construccion', 'sintesis', 'revision', 'cierre'].includes(seccion) || id === 'portada' || /quiz|^juzga$|^repaso$/.test(id);
const diapositivas = (archivo) => [...fs.readFileSync(path.join(root, archivo), 'utf8').matchAll(/\{\s*id: '([^']+)', section: '([^']+)'/g)].map((m) => ({ id: m[1], seccion: m[2] }));
const palabras = (s) => String(s).split(/\s+/).filter(Boolean).length;

for (const [clase, fuente] of Object.entries(CLASES)) {
    test(`teoría ampliada de «${clase}»: cubre sus diapositivas de teoría y tiene la forma esperada`, async () => {
        const datos = (await import(`../src/data/teoria/${clase}.js`)).default;
        const todas = diapositivas(fuente);
        assert.ok(todas.length >= 10, 'no se leyeron las diapositivas de la clase');
        const ids = new Set(todas.map((d) => d.id));
        // Ninguna entrada huérfana: toda clave es una diapositiva de la clase.
        assert.deepEqual(Object.keys(datos).filter((k) => !ids.has(k)), []);
        // Toda diapositiva de teoría tiene su ampliación.
        assert.deepEqual(todas.filter((d) => !SIN_TEORIA(d.id, d.seccion) && !datos[d.id]).map((d) => d.id), []);
        for (const [id, e] of Object.entries(datos)) {
            assert.equal(e.claves.length, 3, `${id}: tres ideas`);
            e.claves.forEach(([titulo, texto]) => {
                assert.ok(titulo && palabras(titulo) <= 8, `${id}: título corto («${titulo}»)`);
                assert.ok(palabras(texto) >= 12 && palabras(texto) <= 70, `${id}: «${titulo}» tiene ${palabras(texto)} palabras`);
            });
            assert.equal(new Set(e.claves.map((c) => c[0])).size, 3, `${id}: títulos distintos`);
            assert.ok(palabras(e.ejemplo) >= 12 && palabras(e.ejemplo) <= 85, `${id}: ejemplo de ${palabras(e.ejemplo)} palabras`);
            assert.ok(palabras(e.ojo) >= 8 && palabras(e.ojo) <= 55, `${id}: «ten en cuenta» de ${palabras(e.ojo)} palabras`);
            // Las negritas van cerradas.
            [...e.claves.map((c) => c[1]), e.ejemplo, e.ojo].forEach((txt) => assert.equal((txt.match(/\*\*/g) || []).length % 2, 0, `${id}: negrita sin cerrar`));
        }
    });
}
