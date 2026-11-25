// Teoría ampliada de la clase «Resultados y discusión»: una entrada por diapositiva de teoría (ver components/deck/Teoria.jsx).
export default {
    quees: {
        claves: [
            ['Tres niveles de elaboración', 'Los resultados son **hechos**: lo que arrojaron los datos. La discusión es interpretación razonada. Las conclusiones son la respuesta breve a cada objetivo. Cada sección se apoya en la anterior y no la repite.'],
            ['Dónde va una oración', 'Si solo necesita tus datos para escribirse, es resultado. Si necesita otro autor, una teoría o un «esto sugiere», es discusión. Si responde un objetivo sin cifras nuevas, es conclusión.'],
            ['Juntas o separadas', 'Algunos formatos piden una sola sección de «Resultados y discusión». Aun así, dentro de cada apartado conserva el orden: primero el dato, después su interpretación y su comparación.'],
        ],
        ejemplo: 'Resultado: «El 41 % de los pacientes olvidó su cita». Discusión: «El olvido pesó más que las barreras económicas, lo que coincide con los antecedentes revisados». Conclusión: «El olvido es el principal factor asociado a la inasistencia en esta población».',
        ojo: 'Las conclusiones no traen datos ni citas que no hayan aparecido antes. Si surge algo nuevo, pertenece a resultados o a discusión.',
    },
    imryd: {
        claves: [
            ['El orden sigue el razonamiento', 'IMRyD reproduce los pasos de una investigación: una pregunta, un procedimiento, unos datos y una interpretación. Por eso un lector entrenado puede ir directo a la sección que necesita consultar.'],
            ['Qué se planea en la propuesta', 'Antes de tener datos puedes dejar definido el **plan de análisis**: qué tabla o figura responderá cada objetivo, qué prueba aplicarás y con qué antecedentes compararás lo que encuentres.'],
            ['Método y resultados se corresponden', 'Todo lo que anunciaste en el método debe tener su resultado, y ningún resultado debe salir de un procedimiento que no describiste. El evaluador revisa esa correspondencia.'],
        ],
        ejemplo: 'En la propuesta: «Para el objetivo 2 se presentará una tabla de inasistencia según recordatorio y se calculará la prueba chi cuadrado». En el informe final, esa tabla y esa prueba aparecen con los datos reales.',
        ojo: 'Preparar las tablas vacías desde la propuesta, solo con títulos y columnas, te muestra si tu instrumento recoge todo lo que necesitas reportar.',
    },
    'res-organizar': {
        claves: [
            ['Por qué el mismo orden', 'El lector llega con los objetivos en mente y busca la respuesta a cada uno. Si los resultados siguen ese orden, la encuentra sin esfuerzo y comprueba que **ningún objetivo quedó sin responder**.'],
            ['Primero la muestra', 'Antes del primer objetivo suele ir un párrafo breve que describe a los participantes: cuántos fueron, edad, sexo, procedencia. Ese párrafo da contexto a todos los resultados que siguen.'],
            ['Subtítulos que informan', 'Titula cada apartado con su contenido, no con el número del objetivo: «Caracterización de la inasistencia» orienta más al lector que «Resultados del objetivo 1».'],
        ],
        ejemplo: 'Participantes (278 pacientes, descripción general) → Caracterización de la inasistencia (tabla 1) → Comparación según edad, zona y recordatorio (tablas 2 y 3) → Relación entre el olvido y la inasistencia (prueba de correlación).',
        ojo: 'Un resultado que no responde a ningún objetivo, por interesante que sea, distrae. Déjalo fuera o repórtalo brevemente como hallazgo adicional.',
    },
    'res-que': {
        claves: [
            ['Por qué en pasado', 'Los resultados describen lo que ocurrió con **tu muestra** en el momento del estudio. El presente convierte el dato en una afirmación general («los pacientes olvidan») que tu estudio no puede sostener.'],
            ['Sin adjetivos ni adverbios', 'Palabras como «claramente», «preocupante» o «apenas» ya interpretan. Deja que la cifra hable: el lector juzgará si 41 % es mucho o poco, y tú lo argumentarás en la discusión.'],
            ['También lo que no salió', 'Se reportan los resultados no significativos o contrarios a lo esperado. Omitirlos sesga el informe; presentarlos tal como salieron es parte de la honestidad del estudio.'],
        ],
        ejemplo: 'Con interpretación: «Lamentablemente, casi la mitad olvida sus citas por descuido». Como resultado: «El 41 % de los pacientes reportó haber olvidado su cita; no se encontraron diferencias por sexo».',
        ojo: 'Si en resultados aparece un «porque», un «debido a» o un apellido entre paréntesis, esa oración ya es discusión. Muévela.',
    },
    'res-tablas': {
        claves: [
            ['Cuándo usar una tabla', 'Úsala cuando haya varios valores que comparar entre categorías o grupos. Dos o tres cifras caben mejor en una oración; una tabla de dos filas ocupa espacio y no aporta.'],
            ['Solo líneas horizontales', 'APA usa tres: arriba de los encabezados, debajo de ellos y al final de la tabla. Nada de líneas verticales ni cuadrícula: el espacio en blanco es lo que separa las columnas.'],
            ['Se entiende sola', 'Con el título, los encabezados y la nota, el lector debe comprender la tabla sin leer el texto: qué se midió, en quiénes y en qué unidades. Las abreviaturas se explican en la nota.'],
        ],
        ejemplo: 'Arriba, en negrita: **Tabla 1**. En la línea siguiente, en cursiva: Causas de inasistencia reportadas por los pacientes. Debajo del cuerpo: «Nota. n = 278. Elaboración propia a partir de la encuesta aplicada».',
        ojo: 'Numera las tablas en el orden en que las mencionas y no las pegues como imagen: se ven borrosas y no se pueden corregir.',
    },
    'res-figuras': {
        claves: [
            ['La figura en APA 7', 'Igual que la tabla: **Figura 1** en negrita arriba, título en cursiva en la línea siguiente y nota debajo si hace falta. Tablas y figuras llevan numeraciones independientes.'],
            ['Ejes y unidades claros', 'Cada eje lleva su nombre y su unidad. En un gráfico de barras el eje de frecuencias empieza en cero para no exagerar diferencias. Evita el 3D, las sombras y los colores sin significado.'],
            ['Tabla o figura', 'Elige la tabla cuando importan los **valores exactos** y la figura cuando importa el **patrón**: una tendencia, una diferencia grande, una relación. Cada resultado va en una de las dos.'],
        ],
        ejemplo: 'Las cuatro causas de inasistencia, que son categorías, van en barras ordenadas de mayor a menor. La relación entre días de espera y número de citas perdidas, dos variables numéricas, va en un diagrama de dispersión.',
        ojo: 'El gráfico de sectores solo funciona con pocas categorías y diferencias visibles. Si tienes más de cinco, usa barras.',
    },
    'res-describir': {
        claves: [
            ['Tres pasos', 'Primero **remite** a la tabla («como se observa en la tabla 1»); luego **destaca** el valor más alto, el más bajo o la diferencia principal; por último, señala un patrón si lo hay.'],
            ['Qué merece destacarse', 'Lo que responde al objetivo: el dato extremo, la tendencia, el contraste entre grupos o el resultado inesperado. Los valores intermedios se quedan en la tabla, donde el lector puede consultarlos.'],
            ['Mención antes de la tabla', 'La tabla aparece después del párrafo que la nombra por primera vez. Refiérete a ella por su número, nunca como «la tabla siguiente» o «la de arriba», porque su posición puede cambiar.'],
        ],
        ejemplo: '«Como se observa en la tabla 2, la inasistencia fue mayor en los pacientes menores de 30 años (31,2 %) y disminuyó en cada grupo de edad hasta el 14,5 % en los mayores de 60».',
        ojo: 'Describir lo principal no es explicar por qué ocurrió. «Fue mayor en los jóvenes» es resultado; «porque trabajan» es discusión.',
    },
    'res-estadisticos': {
        claves: [
            ['Símbolos en cursiva', 'Las letras que representan estadísticos van en cursiva: M, DE, n, N, p, t, d. Las letras griegas, como χ², no. En español la media se abrevia M y la desviación estándar DE, no SD.'],
            ['El valor p exacto', 'Reporta el valor que entrega el programa (p = 0,002) en lugar de «p < 0,05». Solo cuando es menor que 0,001 se escribe p < 0,001. Nunca escribas p = 0,000.'],
            ['Tamaño del efecto', 'Con muestras grandes casi cualquier diferencia resulta significativa. El tamaño del efecto (d, rho, V de Cramér) dice **qué tan grande** es la diferencia o la relación, que es lo que importa para decidir.'],
        ],
        ejemplo: '«Los pacientes sin recordatorio perdieron más citas en el semestre (M = 2,4; DE = 1,1) que quienes sí lo recibieron (M = 2,0; DE = 1,0), t(276) = 3,15; p = 0,002; d = 0,38».',
        ojo: 'APA en inglés usa punto decimal y omite el cero en p y en correlaciones (p = .002). En español muchas instituciones piden coma y cero. Usa una sola convención en todo el documento.',
    },
    'res-cuanti': {
        claves: [
            ['Estructura de la oración', 'Abre con el hallazgo en palabras, con la dirección y la fuerza de la relación, y deja los números entre paréntesis al final. Así se entiende aunque el lector no sepa estadística.'],
            ['Dirección y magnitud', '«Positiva» indica que las dos variables aumentan juntas; «moderada» califica el tamaño del coeficiente. Son descripciones del número, no interpretaciones: por eso caben en los resultados.'],
            ['Descriptivo e inferencial', 'La correlación resume la relación en un número; los porcentajes de la tabla 3 la hacen visible. Presentar ambos permite que el lector vea el dato y su respaldo estadístico.'],
        ],
        ejemplo: 'Misma estructura con un resultado no significativo: «La inasistencia fue de 23,0 % en las mujeres y de 20,5 % en los hombres; la diferencia no fue estadísticamente significativa, χ²(1, N = 278) = 0,24; p = 0,623».',
        ojo: 'El ejemplo dice «relación», no «efecto» ni «causa». Una correlación muestra que dos variables varían juntas, no que una produzca la otra.',
    },
    'res-cuali': {
        claves: [
            ['La categoría organiza', 'Cada categoría surge de la codificación y agrupa lo que varios participantes dijeron sobre un mismo asunto. Se presenta con una descripción tuya; la cita la **ilustra**, no la reemplaza.'],
            ['Cómo elegir la cita', 'Escoge la que expresa la idea con más claridad y en pocas líneas. Una o dos por categoría bastan; transcríbela tal como se dijo, sin corregir la forma de hablar del participante.'],
            ['Códigos y anonimato', 'El código (P3) protege la identidad y permite ver que las citas vienen de **personas distintas**. Añade solo los datos que ayudan a interpretar, como la edad o la zona de residencia.'],
        ],
        ejemplo: 'Categoría: olvido de la cita. «Los participantes relacionaron el olvido con el tiempo entre la asignación y la consulta: “Me la dieron para dentro de dos meses, ya ni me acordaba” (P7, 38 años)».',
        ojo: 'Una lista de citas sin texto tuyo no es un resultado. Y frases como «9 de 12» sirven de apoyo, pero lo cualitativo no busca porcentajes.',
    },
    'dis-quees': {
        claves: [
            ['De los datos a las ideas', 'En los resultados el protagonista es el dato; en la discusión, **tu razonamiento**. Aquí respondes la pregunta de investigación y muestras qué cambia en lo que se sabía antes del estudio.'],
            ['Cierra el círculo', 'La discusión vuelve a lo que abriste al inicio: el problema, los antecedentes y las teorías. Un marco referencial que no reaparece aquí fue un requisito cumplido, no una herramienta de trabajo.'],
            ['Interpretar con respaldo', 'Interpretar no es opinar. Cada afirmación se apoya en un resultado tuyo, en un antecedente o en una teoría. Si no puedes señalar en cuál de los tres, es una especulación.'],
        ],
        ejemplo: 'Resultado retomado: «El olvido fue la causa más frecuente». Interpretación con respaldo: «Esto sugiere que la inasistencia responde más a la organización del servicio que a la falta de interés, como plantean los antecedentes revisados».',
        ojo: 'Si tu discusión vuelve a escribir porcentajes y a describir tablas, estás repitiendo resultados. Una oración de recuerdo por hallazgo es suficiente.',
    },
    'dis-estructura': {
        claves: [
            ['Un bloque por hallazgo', 'Los cinco movimientos se repiten para cada hallazgo importante, normalmente uno por objetivo. El resultado son tres o cuatro párrafos con la misma lógica interna, fáciles de seguir.'],
            ['No todos pesan igual', 'Hallazgo e implicación ocupan una oración cada uno; **comparación y teoría** llevan el peso del párrafo. Si solo tienes los movimientos 1 y 2, todavía no has discutido.'],
            ['Plantilla para empezar', '«Los resultados mostraron que… Esto sugiere que… Este hallazgo coincide con (o difiere de)… Desde la teoría de… se explica porque… Por lo tanto, sería conveniente…». Después reescríbela con tus palabras.'],
        ],
        ejemplo: 'Hallazgo: los menores de 30 años faltaron más. Interpretación: la edad parece influir en la asistencia. Comparación: lo que hallaron tus antecedentes. Teoría: menor susceptibilidad percibida, según el modelo de creencias en salud. Implicación: recordatorios dirigidos a ese grupo.',
        ojo: 'El movimiento que más se omite es el cuarto. Sin teoría, la discusión compara cifras pero no explica por qué ocurre lo que encontraste.',
    },
    'dis-comparar': {
        claves: [
            ['Precisa en qué coincide', 'No basta con decir «coincide»: puede coincidir la dirección del resultado, su magnitud o solo la variable estudiada. Menciona el dato del otro estudio y el contexto en que se obtuvo.'],
            ['Compara lo comparable', 'Antes de contrastar cifras, revisa que el otro estudio midiera lo mismo, en una población parecida y con un instrumento similar. Si no es así, dilo: la comparación sirve, pero con esa salvedad.'],
            ['Varios antecedentes, una idea', 'Agrupa en una sola oración los estudios que apuntan en la misma dirección y dedica más espacio al que difiere. Evita la lista de un autor por párrafo, que resume pero no discute.'],
        ],
        ejemplo: '«El porcentaje de olvido (41 %) es cercano al 38 % reportado por Pérez y Gómez (2022) en Bogotá y contrasta con Díaz (2023), quien halló el transporte como principal barrera en la zona rural de Corozal».',
        ojo: 'Usa solo los antecedentes que ya están en tu marco referencial. Si necesitas uno nuevo para discutir, agrégalo también allá.',
    },
    'dis-diferencias': {
        claves: [
            ['Explicar, no excusar', 'La diferencia se presenta como un dato más y se le busca una razón plausible. No hace falta disculparse ni restarle valor al otro estudio o al tuyo.'],
            ['Las razones son hipótesis', 'Como no pusiste a prueba la explicación, redáctala con cautela: «podría deberse a», «es posible que». Y apóyala en algo verificable, como las características de tu muestra o las del otro estudio.'],
            ['Nunca ajustes el dato', 'Un resultado inesperado no se oculta ni se «corrige» para que coincida. Primero descarta errores de digitación o de análisis; si el dato se mantiene, repórtalo y discútelo.'],
        ],
        ejemplo: '«A diferencia de Díaz (2023), el transporte no fue la principal barrera. La diferencia podría explicarse por el contexto: la mayoría de los pacientes de este estudio reside en la zona urbana de Sincelejo, cerca del hospital».',
        ojo: 'Una diferencia bien explicada suele ser el aporte más original de tu estudio. No la escondas al final del párrafo.',
    },
    'dis-implicaciones': {
        claves: [
            ['Con destinatario', 'Una implicación práctica nombra **quién** puede actuar y **qué** puede hacer. «Es importante mejorar la atención» no orienta a nadie; «la oficina de atención al usuario podría…» sí.'],
            ['A la medida del resultado', 'Solo se deriva lo que tus datos sostienen. De un estudio en un hospital salen sugerencias para ese hospital y otros similares, no una política nacional de salud.'],
            ['Confirmar, matizar o extender', 'En lo teórico, tu estudio puede respaldar una teoría en un contexto nuevo, mostrar que un concepto pesa menos de lo esperado o señalar una variable que el modelo no contemplaba.'],
        ],
        ejemplo: 'Práctica: «El hospital podría enviar un recordatorio dos días antes de la cita, empezando por los pacientes menores de 30 años». Teórica: «Los resultados respaldan el papel de las señales para la acción en usuarios de un hospital público».',
        ojo: 'Una implicación no es una orden. Usa «podría» o «sería conveniente»: quien decide es la institución, que tiene más información que tu estudio.',
    },
    'dis-limites': {
        claves: [
            ['Tres tipos de limitación', 'De **muestra** (pequeña, de un solo lugar, no aleatoria), de **medición** (autorreporte, instrumento sin validación local) y de **diseño** (transversal: mide un solo momento y no permite establecer causas).'],
            ['Limitación más consecuencia', 'No basta nombrarla: di cómo afecta la lectura de los resultados. «La muestra provino de un solo hospital, **lo que limita** la generalización» tiene la estructura completa.'],
            ['De cada límite, una propuesta', 'Las futuras investigaciones salen de las limitaciones y de las preguntas que quedaron abiertas: otra población, un diseño que permita hablar de causas, una variable que no mediste.'],
        ],
        ejemplo: '«El diseño transversal no permite afirmar que el olvido cause la inasistencia. Se recomienda un estudio longitudinal que siga a los pacientes durante un año y tome sus inasistencias directamente del sistema de citas».',
        ojo: 'Las limitaciones no son excusas ni tropiezos personales («faltó tiempo»). Son condiciones del método que el lector necesita conocer para interpretar bien.',
    },
    'dis-prudente': {
        claves: [
            ['Por qué matizar', 'Tu estudio trabajó con una muestra, en un lugar y en un momento. El lenguaje prudente no es timidez: es **precisión** sobre hasta dónde llegan tus datos y a quiénes se aplican.'],
            ['Correlación no es causalidad', 'Que dos variables se relacionen no prueba que una produzca la otra: puede haber una tercera que explique ambas, o la relación puede ir en sentido contrario. Hablar de causa exige un diseño experimental.'],
            ['Verbos según el diseño', 'Elige el verbo que tu diseño autoriza y mantenlo en todo el texto. Descriptivo: «se observó», «predominó». Correlacional: «se asoció», «se relacionó». Experimental o cuasiexperimental: «aumentó», «redujo», «tuvo efecto».'],
        ],
        ejemplo: 'Olvido e inasistencia se correlacionan, pero quizá los pacientes con citas asignadas a más de un mes olvidan más y también faltan más. El tiempo de espera podría explicar ambas cosas.',
        ojo: 'Prudente no es vago. Un matiz por afirmación basta; «podría tal vez sugerir en alguna medida» ya no dice nada.',
    },
    'dis-ejemplo': {
        claves: [
            ['Localiza cada movimiento', 'Primera oración, hallazgo; segunda, interpretación; la tercera, la más larga, compara con dos antecedentes; la cuarta acude a la teoría; la última, que abre con «en consecuencia», es la implicación.'],
            ['Coincide y contrasta', 'El párrafo usa un antecedente que respalda y otro que difiere, y **explica la diferencia** por la zona de residencia. Mostrar los dos lados hace más creíble la discusión.'],
            ['El lenguaje del ejemplo', 'Observa los matices: «sugiere», «en buena medida», «podría explicarse», «podría reducir». Ninguna oración afirma más de lo que permite un estudio que solo midió asociaciones.'],
        ],
        ejemplo: 'El mismo esquema en educación: «La reprobación fue mayor entre quienes no asistieron a tutorías. Esto sugiere que el acompañamiento se asocia con el rendimiento. El hallazgo coincide con [antecedente]; desde [teoría] se explica por…; la facultad podría ampliar los horarios de tutoría».',
        ojo: 'Las citas del ejemplo son ilustrativas. En tu discusión, cada autor y cada cifra deben venir de una fuente real que hayas leído y que esté en tus referencias.',
    },
    errores: {
        claves: [
            ['Dos familias de errores', 'Los cuatro primeros son de **presentación** de los resultados: mezcla, orden, formato, repetición. Los cuatro últimos, de **profundidad** de la discusión, y se corrigen volviendo a tu marco referencial.'],
            ['Prueba de los colores', 'Subraya con un color los datos y con otro las interpretaciones. En los resultados solo debe aparecer el primero; en la discusión debe predominar el segundo.'],
            ['Lista de verificación final', 'Cada objetivo tiene su apartado; cada tabla, número, título y mención en el texto; cada hallazgo, un antecedente y una teoría; la discusión termina con limitaciones y futuras investigaciones.'],
        ],
        ejemplo: 'Mezcla: «El 41 % olvidó su cita, lo cual demuestra la falta de compromiso de los pacientes». Corregido: en resultados, «El 41 % olvidó su cita»; en discusión, «Esto sugiere que los recordatorios actuales son insuficientes».',
        ojo: 'Una discusión de un solo párrafo para tres objetivos casi siempre se quedó en interpretar. Revisa que cada hallazgo tenga comparación y teoría.',
    },
};
