// En todas las clases la sección «Construcción» va de primera: el estudiante entra directo a construir
// y la teoría queda a continuación como apoyo. Sirve igual para la lista de secciones y para la de diapositivas.
const CONSTRUCCION = new Set(['construccion', 'sintesis']);
const esConstruccion = (item) => CONSTRUCCION.has(item.section ?? item.id);

export const construccionPrimero = (lista) => [...lista.filter(esConstruccion), ...lista.filter((item) => !esConstruccion(item))];
