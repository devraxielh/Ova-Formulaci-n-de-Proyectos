/*
 * Validez y confiabilidad de los instrumentos: paso a paso, ejemplo y párrafo para el documento.
 * Los ids coinciden con los valores que ya guardaba la Metodología.
 */

export const VALIDACION_DETALLE = [
    {
        id: 'juicio de expertos',
        titulo: 'Juicio de expertos',
        tipo: 'Validez de contenido',
        para: 'Cuestionarios, guías de entrevista, listas de chequeo y rúbricas creadas o adaptadas por ti.',
        que: 'Comprueba que cada ítem mide lo que debe medir y que el instrumento cubre todas las dimensiones de la variable.',
        pasos: [
            'Organiza la versión inicial del instrumento por variables y dimensiones, con la definición de cada una.',
            'Elige al menos tres expertos (lo usual, entre tres y cinco) con formación o experiencia en el tema o en metodología.',
            'Prepara la planilla de validación: para cada ítem, el experto califica la pertinencia, la claridad y la coherencia en una escala de 1 a 4, y deja observaciones.',
            'Envía a cada experto una carta de invitación, los objetivos del estudio, el instrumento y la planilla.',
            'Calcula el acuerdo entre expertos con la V de Aiken para cada ítem: V = S / [n · (c − 1)], donde S es la suma de las calificaciones menos el valor mínimo, n el número de expertos y c el número de valores de la escala.',
            'Conserva los ítems con V ≥ 0,80; ajusta o elimina los demás teniendo en cuenta las observaciones.',
            'Guarda las planillas firmadas: van como anexo del proyecto.',
        ],
        ejemplo: [
            'Cinco expertos califican la claridad del ítem 4 con 4, 4, 3, 4 y 4 (escala de 1 a 4).',
            'S = (4−1) + (4−1) + (3−1) + (4−1) + (4−1) = 14.',
            'V = 14 / [5 · (4 − 1)] = 14 / 15 = 0,93 → el ítem se conserva.',
            'El ítem 9 obtiene V = 0,60 → se reescribe según las observaciones.',
        ],
        parrafo: (instrumentos) => `La validez de contenido de ${instrumentos} se estableció mediante juicio de expertos: tres especialistas evaluaron la pertinencia, la claridad y la coherencia de cada ítem en una escala de 1 a 4. Se calculó el coeficiente V de Aiken para cada ítem; se conservaron los ítems con V ≥ 0,80 y los demás se ajustaron según las observaciones de los expertos.`,
    },
    {
        id: 'prueba piloto',
        titulo: 'Prueba piloto',
        tipo: 'Validez aparente y aplicabilidad',
        para: 'Cualquier instrumento, antes de aplicarlo a la muestra.',
        que: 'Comprueba en la práctica que las instrucciones y las preguntas se entienden, cuánto tiempo toma y si hay ítems que fallan.',
        pasos: [
            'Elige entre 10 y 30 personas con características parecidas a tu población, que no formen parte de la muestra (por ejemplo, de otra sede o de otro periodo).',
            'Aplica el instrumento en las mismas condiciones en que lo aplicarás en el estudio (presencial o en línea, mismo lugar, mismas instrucciones).',
            'Mide cuánto tarda cada persona en responder.',
            'Al terminar, pregunta a cada participante qué preguntas le resultaron confusas o difíciles y por qué.',
            'Revisa las respuestas: ítems sin responder, respuestas iguales en todos o resultados que no tienen sentido.',
            'Ajusta el instrumento: reescribe, elimina o reordena ítems y mejora las instrucciones.',
            'Si la escala es tipo Likert, usa estos datos para calcular el alfa de Cronbach.',
        ],
        ejemplo: [
            'Se aplica el cuestionario a 20 pacientes de otra sede del hospital.',
            'Tiempo promedio de respuesta: 14 minutos.',
            'Siete personas dicen no entender el ítem 7 («barreras organizacionales») → se cambia por «trámites para pedir o cambiar la cita».',
            'El ítem 12 queda sin responder en 6 casos → se elimina porque repite el ítem 5.',
        ],
        parrafo: (instrumentos, plural) => `Antes de su aplicación, ${instrumentos} se ${plural ? 'sometieron' : 'sometió'} a una prueba piloto con 20 personas de características similares a la población, que no hicieron parte de la muestra. La prueba permitió estimar el tiempo de respuesta, identificar ítems confusos y ajustar su redacción y el orden de las preguntas.`,
    },
    {
        id: 'alfa de Cronbach',
        titulo: 'Alfa de Cronbach',
        tipo: 'Confiabilidad (consistencia interna)',
        para: 'Escalas con varios ítems que miden una misma dimensión, como las escalas Likert.',
        que: 'Mide qué tan consistentes son los ítems entre sí: si miden lo mismo, sus respuestas van en la misma dirección.',
        pasos: [
            'Usa los datos de la prueba piloto (idealmente 30 personas o más) o de la muestra.',
            'Organiza los datos en una hoja: una fila por persona y una columna por ítem. Invierte los ítems redactados en sentido negativo.',
            'Calcula el alfa por cada dimensión: α = [k / (k − 1)] · [1 − (Σ varianzas de los ítems / varianza del total)], donde k es el número de ítems.',
            'En Jamovi: Factor → Reliability Analysis. En SPSS: Analizar → Escala → Análisis de fiabilidad. En Excel, con las fórmulas VAR.S y SUMA.',
            'Interpreta el resultado (George y Mallery, 2003): ≥ 0,9 excelente; ≥ 0,8 bueno; ≥ 0,7 aceptable; ≥ 0,6 cuestionable; < 0,6 pobre.',
            'Revisa «alfa si se elimina el ítem»: si al quitar un ítem el alfa sube de forma clara, revísalo o elimínalo.',
            'Reporta el alfa de cada dimensión y del instrumento completo.',
        ],
        ejemplo: [
            'Escala de barreras de acceso con 10 ítems (k = 10), aplicada a 30 personas en la prueba piloto.',
            'Suma de las varianzas de los ítems = 8,2; varianza del puntaje total = 30,5.',
            'α = (10 / 9) · (1 − 8,2 / 30,5) = 1,111 · 0,731 = 0,81 → confiabilidad buena.',
            'Si se elimina el ítem 6, el alfa sube a 0,85 → se revisa su redacción.',
        ],
        parrafo: (instrumentos) => `La confiabilidad de ${instrumentos} se evaluó mediante el coeficiente alfa de Cronbach, calculado con los datos de la prueba piloto para cada dimensión y para la escala completa. Se consideraron aceptables valores iguales o superiores a 0,70 (George y Mallery, 2003).`,
    },
    {
        id: 'uso de un instrumento ya validado',
        titulo: 'Instrumento ya validado',
        tipo: 'Validez y confiabilidad demostradas por otros autores',
        para: 'Cuando en tus antecedentes encuentras un instrumento que mide tu variable.',
        que: 'Aprovecha un instrumento cuya validez y confiabilidad ya fueron demostradas, y lo adapta a tu población.',
        pasos: [
            'Busca en tus antecedentes un instrumento que mida tu variable (por ejemplo, SERVQUAL para calidad del servicio).',
            'Verifica sus propiedades: con qué población se validó, qué alfa obtuvo y cómo se probó su validez.',
            'Revisa si es de uso libre o necesitas autorización del autor; guarda la autorización si aplica.',
            'Adapta el lenguaje a tu población sin cambiar el sentido de los ítems. Si está en otro idioma, haz traducción y retrotraducción.',
            'Valida de nuevo, de forma breve, en tu contexto: juicio de expertos para la adaptación, prueba piloto y alfa de Cronbach.',
            'Cita al autor original en el texto y en las referencias.',
        ],
        ejemplo: [
            'Se usa la escala SERVQUAL (Parasuraman et al., 1988), de 22 ítems, para medir la calidad del servicio de consulta externa.',
            'Se cambia «la empresa» por «el hospital» y se revisa el vocabulario con tres expertos.',
            'En la prueba piloto con 30 pacientes se obtiene α = 0,86 → confiabilidad buena en esta población.',
        ],
        parrafo: (instrumentos, plural) => `Para ${instrumentos} se ${plural ? 'utilizaron instrumentos previamente validados' : 'utilizó un instrumento previamente validado'} por otros autores, cuya validez y confiabilidad fueron reportadas en los estudios originales. La adaptación se hizo al lenguaje de la población con apoyo de expertos y la confiabilidad se verificó en este contexto mediante una prueba piloto y el coeficiente alfa de Cronbach.`,
    },
    {
        id: 'triangulación',
        titulo: 'Triangulación',
        tipo: 'Credibilidad en estudios cualitativos',
        para: 'Entrevistas, grupos focales y observación en estudios cualitativos o mixtos.',
        que: 'Contrasta la información desde varias fuentes, métodos o investigadores para que las conclusiones no dependan de una sola mirada. Es uno de los criterios de rigor cualitativo (Lincoln y Guba, 1985).',
        pasos: [
            'Define el tipo de triangulación: de fuentes (distintos participantes), de métodos (entrevista y observación), de investigadores (dos personas codifican) o teórica (varias teorías).',
            'Recoge la información de al menos dos fuentes o métodos sobre la misma categoría.',
            'Codifica cada fuente por separado.',
            'Construye una matriz con las categorías en las filas y las fuentes en las columnas; marca coincidencias y diferencias.',
            'Explica las diferencias: no se ocultan, se interpretan.',
            'Devuelve los hallazgos a algunos participantes para que confirmen si se sienten representados (validación con los participantes).',
            'Deja un registro de las decisiones de análisis (bitácora) para que otro investigador pueda seguir el proceso.',
        ],
        ejemplo: [
            'Categoría «barreras de transporte»: aparece en las entrevistas a pacientes, en las de los médicos y en los registros de citas perdidas de la zona rural.',
            'Categoría «trato del personal»: la mencionan los pacientes, pero no los médicos → se explica como una diferencia de perspectiva.',
            'Cuatro pacientes revisan el resumen de hallazgos y confirman que los representa.',
        ],
        parrafo: (instrumentos) => `La credibilidad de la información obtenida con ${instrumentos} se aseguró mediante triangulación de fuentes y métodos: las categorías se contrastaron entre los distintos grupos de participantes y con la revisión documental, en una matriz de coincidencias y diferencias. Además, los hallazgos se validaron con algunos participantes y las decisiones de análisis se registraron en una bitácora.`,
    },
];

export const VALIDACION_IDS = VALIDACION_DETALLE.map((v) => v.id);
export const validacionPorId = (id) => VALIDACION_DETALLE.find((v) => v.id === id);

/* ---------- Cálculos ---------- */

export const num = (value, dec = 2) => (Number.isFinite(value) ? value.toFixed(dec).replace('.', ',') : '—');
const listaY = (items) => (items.length <= 1 ? items[0] || '' : `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`);

// V de Aiken: V = S / [n · (c − 1)], con S = suma de (calificación − 1) en una escala de 1 a c.
export const aiken = (notas, escala) => {
    const validas = notas.map(Number).filter((x) => Number.isFinite(x) && x >= 1 && x <= escala);
    if (validas.length === 0) return null;
    const S = validas.reduce((sum, x) => sum + (x - 1), 0);
    return S / (validas.length * (escala - 1));
};

export const resumenAiken = (d) => {
    const escala = Number(d?.escala) || 4;
    const items = (d?.items || []).map((it, i) => ({ nombre: String(it.nombre || '').trim() || `Ítem ${i + 1}`, v: aiken(it.notas || [], escala) })).filter((it) => it.v !== null);
    if (items.length === 0) return null;
    const promedio = items.reduce((s, it) => s + it.v, 0) / items.length;
    return { items, promedio, conservados: items.filter((it) => it.v >= 0.8), ajustar: items.filter((it) => it.v < 0.8), escala, expertos: Number(d?.expertos) || 0 };
};

// Matriz pegada desde Excel: filas = personas, columnas = ítems. Acepta tabulador, punto y coma o espacios; la coma es decimal.
export const leerMatriz = (texto) => String(texto || '').trim().split(/\r?\n/)
    .map((fila) => fila.trim().split(/[\t;]+|\s+/).filter(Boolean).map((x) => Number(x.replace(',', '.'))))
    .filter((fila) => fila.length > 0 && fila.every(Number.isFinite));

const varianza = (xs) => {
    if (xs.length < 2) return 0;
    const m = xs.reduce((s, x) => s + x, 0) / xs.length;
    return xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1);
};

const alfaDe = (filas, columnas) => {
    const k = columnas.length;
    if (k < 2 || filas.length < 2) return null;
    const sumVar = columnas.reduce((s, j) => s + varianza(filas.map((f) => f[j])), 0);
    const varTotal = varianza(filas.map((f) => columnas.reduce((s, j) => s + f[j], 0)));
    if (varTotal === 0) return null;
    return { alfa: (k / (k - 1)) * (1 - sumVar / varTotal), sumVar, varTotal };
};

export const cronbach = (texto) => {
    const filas = leerMatriz(texto);
    if (filas.length < 2) return { error: 'Pega al menos dos filas (personas) con dos o más ítems.' };
    const k = Math.min(...filas.map((f) => f.length));
    if (k < 2) return { error: 'Cada fila debe tener al menos dos ítems.' };
    if (filas.some((f) => f.length !== k)) return { error: `Todas las filas deben tener el mismo número de ítems (la más corta tiene ${k}).` };
    const columnas = Array.from({ length: k }, (_, j) => j);
    const base = alfaDe(filas, columnas);
    if (!base) return { error: 'No hay variación en las respuestas: no se puede calcular el alfa.' };
    const siElimina = columnas.map((j) => ({ item: j + 1, alfa: k > 2 ? alfaDe(filas, columnas.filter((c) => c !== j))?.alfa ?? null : null }));
    return { n: filas.length, k, ...base, siElimina };
};

export const nivelAlfa = (a) => (a >= 0.9 ? 'excelente' : a >= 0.8 ? 'buena' : a >= 0.7 ? 'aceptable' : a >= 0.6 ? 'cuestionable' : 'pobre');

export const resumenTriangulacion = (d) => {
    const fuentes = (d?.fuentes || []).map((f) => String(f).trim()).filter(Boolean);
    const categorias = (d?.categorias || []).filter((c) => String(c.nombre || '').trim());
    if (fuentes.length < 2 || categorias.length === 0) return null;
    const estado = categorias.map((c) => {
        const vals = fuentes.map((f) => c.celdas?.[f] || '');
        const si = vals.filter((v) => v === 'si').length;
        return { nombre: c.nombre.trim(), si, difiere: vals.includes('difiere'), converge: si === fuentes.length };
    });
    return { fuentes, estado, convergen: estado.filter((e) => e.converge), difieren: estado.filter((e) => e.difiere) };
};

/* ---------- Párrafos con los datos calculados ---------- */

export const parrafoConDatos = (id, instrumento, d) => {
    if (!d) return '';
    if (id === 'juicio de expertos') {
        const r = resumenAiken(d);
        if (!r) return '';
        return `La validez de contenido de ${instrumento} se estableció mediante juicio de ${r.expertos || 'tres'} expertos, que calificaron ${r.items.length} ítems en una escala de 1 a ${r.escala}. El coeficiente V de Aiken promedio fue de ${num(r.promedio)}; ${r.conservados.length === 1 ? '1 ítem obtuvo V ≥ 0,80 y se conservó' : `${r.conservados.length} ítems obtuvieron V ≥ 0,80 y se conservaron`}${r.ajustar.length ? `, y ${listaY(r.ajustar.map((it) => `${it.nombre.toLowerCase()} (V = ${num(it.v)})`))} se ${r.ajustar.length === 1 ? 'ajustó' : 'ajustaron'} según las observaciones de los expertos` : ''}.`;
    }
    if (id === 'prueba piloto') {
        const n = Number(d.participantes) || 0;
        if (!n) return '';
        return `Antes de su aplicación, ${instrumento} se sometió a una prueba piloto con ${n} personas de características similares a la población, que no hicieron parte de la muestra${Number(d.tiempo) ? `; el tiempo promedio de respuesta fue de ${num(Number(d.tiempo), 0)} minutos` : ''}. ${String(d.confusos || '').trim() ? `Se identificaron dificultades de comprensión en ${String(d.confusos).trim().replace(/\.$/, '')}` : 'No se identificaron ítems confusos'}${String(d.cambios || '').trim() ? `, por lo que ${String(d.cambios).trim().replace(/\.$/, '').replace(/^./, (c) => c.toLowerCase())}` : ''}.`;
    }
    if (id === 'alfa de Cronbach') {
        const r = cronbach(d.matriz);
        if (r.error) return '';
        const suben = r.siElimina.filter((x) => x.alfa !== null && x.alfa > r.alfa + 0.02);
        return `La confiabilidad de ${instrumento} se evaluó con el coeficiente alfa de Cronbach a partir de ${r.n} respuestas a ${r.k} ítems${String(d.dimension || '').trim() ? ` de la dimensión ${String(d.dimension).trim()}` : ''}. Se obtuvo α = ${num(r.alfa)}, que indica una confiabilidad ${nivelAlfa(r.alfa)} (George y Mallery, 2003).${suben.length ? ` Al eliminar ${listaY(suben.map((x) => `el ítem ${x.item}`))}, el alfa aumentaría a ${num(Math.max(...suben.map((x) => x.alfa)))}, por lo que se revisó su redacción.` : ''}`;
    }
    if (id === 'uso de un instrumento ya validado') {
        if (!String(d.nombre || '').trim()) return '';
        return `Se utilizó ${String(d.nombre).trim()}${String(d.autor || '').trim() ? ` (${String(d.autor).trim()})` : ''}${String(d.poblacion || '').trim() ? `, validado originalmente en ${String(d.poblacion).trim()}` : ''}${Number(d.alfaOriginal) ? ` con α = ${num(Number(d.alfaOriginal))}` : ''}.${String(d.adaptaciones || '').trim() ? ` Para este estudio, ${String(d.adaptaciones).trim().replace(/\.$/, '').replace(/^./, (c) => c.toLowerCase())}.` : ''}${Number(d.alfaLocal) ? ` En esta población se obtuvo α = ${num(Number(d.alfaLocal))}, que indica una confiabilidad ${nivelAlfa(Number(d.alfaLocal))}.` : ''}`;
    }
    if (id === 'triangulación') {
        const r = resumenTriangulacion(d);
        if (!r) return '';
        return `Para asegurar la credibilidad de la información obtenida con ${instrumento}, se trianguló entre ${listaY(r.fuentes.map((f) => f.toLowerCase()))} en ${r.estado.length} ${r.estado.length === 1 ? 'categoría' : 'categorías'}: ${r.convergen.length} ${r.convergen.length === 1 ? 'convergió' : 'convergieron'} en todas las fuentes${r.convergen.length ? ` (${listaY(r.convergen.map((e) => e.nombre.toLowerCase()))})` : ''}${r.difieren.length ? `, mientras que en ${listaY(r.difieren.map((e) => e.nombre.toLowerCase()))} se encontraron diferencias entre fuentes, que se interpretan en la discusión` : ''}.`;
    }
    return '';
};
