// Comparación de dos textos para el historial de versiones: qué se quitó, qué se agregó y qué quedó igual.
// Devuelve trozos { tipo: '=' | '-' | '+', texto }: '-' solo está en el texto anterior y '+' solo en el nuevo.

// Subsecuencia común más larga entre dos listas; devuelve los pares de índices que coinciden.
const comunes = (a, b) => {
    const n = a.length;
    const m = b.length;
    const ancho = m + 1;
    const tabla = new Uint32Array((n + 1) * ancho);
    for (let i = n - 1; i >= 0; i -= 1) {
        for (let j = m - 1; j >= 0; j -= 1) {
            tabla[i * ancho + j] = a[i] === b[j] ? tabla[(i + 1) * ancho + j + 1] + 1 : Math.max(tabla[(i + 1) * ancho + j], tabla[i * ancho + j + 1]);
        }
    }
    const pares = [];
    let i = 0;
    let j = 0;
    while (i < n && j < m) {
        if (a[i] === b[j]) { pares.push([i, j]); i += 1; j += 1; } else if (tabla[(i + 1) * ancho + j] >= tabla[i * ancho + j + 1]) i += 1; else j += 1;
    }
    return pares;
};

const comparar = (a, b) => {
    const salida = [];
    const poner = (tipo, texto) => {
        if (!texto) return;
        const ultimo = salida[salida.length - 1];
        if (ultimo && ultimo.tipo === tipo) ultimo.texto += texto; else salida.push({ tipo, texto });
    };
    let i = 0;
    let j = 0;
    [...comunes(a, b), [a.length, b.length]].forEach(([x, y]) => {
        poner('-', a.slice(i, x).join(''));
        poner('+', b.slice(j, y).join(''));
        if (x < a.length) poner('=', a[x]);
        i = x + 1;
        j = y + 1;
    });
    return salida;
};

// Palabras y espacios como piezas separadas, para poder volver a unir el texto tal cual.
const enPalabras = (texto) => String(texto || '').match(/\s+|[^\s]+/g) || [];
const enLineas = (texto) => String(texto || '').match(/[^\n]*\n|[^\n]+$/g) || [];
const LIMITE = 1800; // piezas por lado: con más, la comparación palabra a palabra sería lenta

export const compararTextos = (antes, despues) => {
    const a = enPalabras(antes);
    const b = enPalabras(despues);
    // Textos muy largos: se compara por párrafos (líneas) en lugar de por palabras.
    if (a.length > LIMITE || b.length > LIMITE) return comparar(enLineas(antes), enLineas(despues));
    return comparar(a, b);
};

// Cuántas palabras se quitaron y se agregaron (para el resumen de cada sección).
export const contarCambios = (trozos) => trozos.reduce((t, x) => {
    const n = (x.texto.match(/[^\s]+/g) || []).length;
    if (x.tipo === '-') t.quitadas += n;
    if (x.tipo === '+') t.agregadas += n;
    return t;
}, { quitadas: 0, agregadas: 0 });
