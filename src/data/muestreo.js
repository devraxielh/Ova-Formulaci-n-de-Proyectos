/*
 * Explicación de cada tipo de muestreo para la ventana «Muestreo» de la Metodología:
 * cuándo se usa, cómo se hace paso a paso, un ejemplo, y qué gana y qué pierde el estudio.
 * Las ecuaciones se dibujan en el componente (MuestreoModal), con los números del estudiante.
 */
export const MUESTREO_DETALLE = {
    'aleatorio simple': {
        idea: 'Se sortea la muestra entre toda la población: cada persona tiene exactamente la misma probabilidad de salir.',
        cuando: 'Cuando existe una lista completa de la población (el marco muestral) y la población es parecida entre sí.',
        pasos: [
            'Consigue la lista completa y numérala de 1 a N.',
            'Calcula el tamaño de la muestra (n) con la fórmula.',
            'Sortea n números entre 1 y N con una tabla de números aleatorios, Excel (=ALEATORIO.ENTRE) o un generador en línea.',
            'Las personas con esos números forman la muestra. Si alguien no participa, se reemplaza con otro número sorteado.',
        ],
        ejemplo: 'De una lista de 1.200 pacientes se sortean 291 números; esos pacientes responden la encuesta.',
        ventajas: 'Es el más sencillo de explicar y permite generalizar los resultados a la población.',
        limites: 'Exige la lista completa. Si la población está muy dispersa, ubicar a los sorteados puede ser costoso.',
    },
    'aleatorio estratificado': {
        idea: 'La población se divide en grupos que no se cruzan (estratos) y dentro de cada uno se sortea su parte de la muestra.',
        cuando: 'Cuando hay grupos distintos que deben quedar representados: sedes, grados, sexo, régimen de salud, jornadas.',
        pasos: [
            'Define los estratos y cuenta cuántas personas hay en cada uno (N₁, N₂…).',
            'Calcula el tamaño total de la muestra (n).',
            'Reparte la muestra en proporción al tamaño de cada estrato (afijación proporcional).',
            'Dentro de cada estrato, sortea las personas como en el muestreo aleatorio simple.',
        ],
        ejemplo: 'Si el 60 % de los estudiantes está en la jornada de la mañana y el 40 % en la de la tarde, la muestra de 200 se reparte en 120 y 80.',
        ventajas: 'Asegura que ningún grupo quede por fuera y permite comparar entre grupos.',
        limites: 'Hay que saber de antemano a qué estrato pertenece cada persona y cuántas hay en cada uno.',
    },
    'sistemático': {
        idea: 'Se elige una persona cada cierto intervalo fijo (k) de una lista ordenada, empezando en un punto sorteado.',
        cuando: 'Cuando hay una lista o una fila ordenada (historias clínicas, planillas, turnos de llegada) y sortear uno por uno es poco práctico.',
        pasos: [
            'Calcula el tamaño de la muestra (n).',
            'Calcula el intervalo k dividiendo la población entre la muestra.',
            'Sortea un número de arranque entre 1 y k.',
            'Toma a esa persona y luego a cada k-ésima de la lista hasta completar la muestra.',
        ],
        ejemplo: 'Con 1.200 pacientes y una muestra de 291, k es 4: se sortea un arranque entre 1 y 4 (por ejemplo, 3) y se toman los pacientes 3, 7, 11, 15…',
        ventajas: 'Es rápido y reparte la muestra a lo largo de toda la lista.',
        limites: 'Si la lista tiene un patrón que se repite con el mismo ritmo de k (por ejemplo, días de la semana), la muestra queda sesgada.',
    },
    'por conglomerados': {
        idea: 'En vez de sortear personas, se sortean grupos completos que ya existen (conglomerados) y se estudia a todos los de esos grupos.',
        cuando: 'Cuando no hay lista de personas pero sí de grupos: cursos, barrios, sedes, empresas, consultorios.',
        pasos: [
            'Haz la lista de todos los conglomerados (M) y averigua cuántas personas tiene cada uno en promedio.',
            'Calcula el tamaño de la muestra (n) y divídelo entre el tamaño promedio para saber cuántos conglomerados necesitas (m).',
            'Sortea m conglomerados.',
            'Estudia a todas las personas de los conglomerados sorteados.',
        ],
        ejemplo: 'Un colegio tiene 40 cursos de unos 30 estudiantes. Para una muestra de 290 se sortean 10 cursos y se encuesta a todos sus estudiantes.',
        ventajas: 'No necesita la lista de personas y reduce costos de desplazamiento.',
        limites: 'Las personas de un mismo grupo se parecen entre sí, así que el error es mayor que en el aleatorio simple con la misma muestra.',
    },
    'por conveniencia': {
        idea: 'Participan las personas que están disponibles y a las que el investigador puede llegar con facilidad.',
        cuando: 'En estudios exploratorios, pruebas piloto o cuando no hay lista de la población ni recursos para sortear.',
        pasos: [
            'Define los criterios de inclusión y exclusión.',
            'Elige el lugar y el momento donde encontrarás a la población.',
            'Invita a quienes cumplan los criterios hasta completar el número previsto.',
            'Describe en el informe cómo y dónde se reclutó a los participantes.',
        ],
        ejemplo: 'Se encuesta a los pacientes que estén en la sala de espera durante dos semanas y acepten participar.',
        ventajas: 'Es rápido, barato y posible en casi cualquier contexto.',
        limites: 'No permite generalizar a toda la población: los resultados valen para el grupo estudiado. No se calcula con fórmula.',
    },
    intencional: {
        idea: 'El investigador elige a propósito a las personas que mejor pueden informar sobre el fenómeno, según criterios definidos.',
        cuando: 'En estudios cualitativos o cuando se necesitan casos con características precisas: expertos, casos típicos o casos extremos.',
        pasos: [
            'Define con claridad los criterios que debe cumplir cada participante.',
            'Identifica a las personas que los cumplen (con ayuda de la institución o de informantes clave).',
            'Selecciona los casos y justifica por qué cada perfil aporta al estudio.',
            'Incluye participantes hasta alcanzar la saturación: cuando las entrevistas ya no aportan información nueva.',
        ],
        ejemplo: 'Se entrevista a 12 pacientes que han faltado a tres o más citas en el último año, porque son quienes viven el problema.',
        ventajas: 'Lleva a los casos más ricos en información con pocos participantes.',
        limites: 'Depende del criterio del investigador y no permite generalizar estadísticamente.',
    },
    'bola de nieve': {
        idea: 'Los primeros participantes recomiendan a otros que cumplen los criterios, y así la muestra crece en cadena.',
        cuando: 'Con poblaciones difíciles de ubicar o que no figuran en listas: migrantes, trabajadores informales, personas con una condición poco frecuente.',
        pasos: [
            'Ubica a unos pocos participantes iniciales (semillas) que cumplan los criterios.',
            'Al terminar con cada uno, pídele que te refiera a otras personas que también los cumplan.',
            'Contacta a los referidos y repite el proceso.',
            'Detente al alcanzar el número previsto o la saturación de la información.',
        ],
        ejemplo: 'Tres cuidadores de pacientes con una enfermedad rara refieren a otros cuidadores que conocen, hasta completar 15 entrevistas.',
        ventajas: 'Permite llegar a personas que de otro modo no se encontrarían.',
        limites: 'La muestra queda formada por personas conectadas entre sí, que suelen parecerse. No permite generalizar.',
    },
    'censo (toda la población)': {
        idea: 'No se saca muestra: se estudia a todas las personas de la población.',
        cuando: 'Cuando la población es pequeña y accesible (por lo general, menos de 100 personas) o cuando se necesita el dato de todos.',
        pasos: [
            'Consigue la lista completa de la población.',
            'Aplica el instrumento a todas las personas.',
            'Registra cuántas no respondieron y por qué.',
            'Informa la tasa de respuesta: cuántos respondieron sobre el total.',
        ],
        ejemplo: 'Los 38 docentes de la institución responden el cuestionario.',
        ventajas: 'No hay error de muestreo: los resultados son los de la población.',
        limites: 'Solo es viable con poblaciones pequeñas, y la falta de respuesta de algunos puede sesgar el resultado.',
    },
};

// Reparto proporcional de la muestra entre los estratos: n_h = n · N_h / N.
export const repartoEstratos = (estratos, n) => {
    const validos = (estratos || []).map((e) => ({ nombre: String(e?.nombre || '').trim(), N: Math.max(0, Math.round(Number(e?.N) || 0)) })).filter((e) => e.nombre && e.N > 0);
    const total = validos.reduce((s, e) => s + e.N, 0);
    return { total, filas: validos.map((e) => ({ ...e, n: total > 0 ? Math.round((n * e.N) / total) : 0 })) };
};
