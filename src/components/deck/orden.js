// Orden de todas las clases: primero «Construcción» (el estudiante entra directo a construir), después «Revisión»
// (comprueba lo que construyó) y a continuación la teoría como apoyo. Sirve igual para la lista de secciones
// y para la de diapositivas; dentro de cada grupo se conserva el orden original.
const PRIMERO = ['construccion', 'sintesis'];
const SEGUNDO = ['revision'];
const grupo = (item) => {
    const seccion = item.section ?? item.id;
    return PRIMERO.includes(seccion) ? 0 : SEGUNDO.includes(seccion) ? 1 : 2;
};

export const construccionPrimero = (lista) => [0, 1, 2].flatMap((g) => lista.filter((item) => grupo(item) === g));
