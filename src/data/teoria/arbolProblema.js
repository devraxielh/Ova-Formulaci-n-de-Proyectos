// Teoría ampliada de la clase «Árbol del problema»: una entrada por diapositiva de teoría (ver components/deck/Teoria.jsx).
export default {
    quees: {
        claves: [
            ['Viene del Marco Lógico', 'Es la herramienta de análisis con la que la metodología del **Marco Lógico** inicia el diseño de un proyecto. En investigación se usa igual: primero se entiende el problema y después se formula la pregunta.'],
            ['Relaciones de causa y efecto', 'El árbol no es una lista en tres cajas: cada flecha afirma que una cosa **produce** la otra. Si no puedes defender esa relación con un dato o un estudio, la tarjeta sobra.'],
            ['Una hipótesis de trabajo', 'El primer árbol recoge lo que crees que ocurre. Se corrige al revisar antecedentes y al hablar con quienes viven el problema; es normal rehacerlo dos o tres veces.'],
        ],
        ejemplo: 'En una universidad: los estudiantes llegan con vacíos de matemáticas del bachillerato (causa), por eso hay alta reprobación de cálculo en primer semestre (problema) y por eso aumenta la deserción temprana (efecto). Tres niveles, una sola cadena.',
        ojo: 'El árbol describe, no propone. Si en una tarjeta aparece lo que piensas hacer (una aplicación, una capacitación), todavía estás pensando en la solución y no en el problema.',
    },
    tronco: {
        claves: [
            ['Algo que sube o baja', 'Un buen tronco nombra algo que puede aumentar o disminuir: inasistencia, reprobación, tiempo de espera. Eso es lo que después medirás, y por eso se convierte en la variable principal de tu pregunta.'],
            ['La solución escondida', 'Si tu frase empieza con «falta de», «no hay» o «ausencia de», pregúntate: ¿qué les pasa hoy a las personas por no tener eso? La respuesta es el verdadero problema.'],
            ['Del tamaño justo', 'Muy amplio no se puede medir; muy estrecho se queda sin causas que analizar. Delimita con **población y lugar** hasta que puedas conseguir un dato que lo demuestre.'],
        ],
        ejemplo: '«Falta de tutorías de cálculo» esconde una solución. Al preguntar qué pasa hoy sin ellas aparece el problema: «Alta reprobación de cálculo en los estudiantes de primer semestre de ingeniería de una universidad pública de Montería».',
        ojo: 'Antes de seguir, busca una cifra que confirme el tronco. Si nadie lo ha medido ni puedes medirlo tú, quizá el problema es solo una impresión.',
    },
    raices: {
        claves: [
            ['Causas directas e indirectas', 'Las **directas** tocan el tronco; las indirectas explican a las directas y van debajo de ellas. Colocarlas por niveles muestra qué causa depende de cuál.'],
            ['Cuándo dejar de preguntar', 'Detente cuando la respuesta salga de tu alcance (la economía, la cultura) o cuando ya no puedas respaldarla. La última causa útil es la que alguien de tu institución podría cambiar.'],
            ['Criterios para elegir', 'Para decidir sobre cuál causa trabajar, compara tres cosas: cuánto pesa en el problema, si está a tu alcance y si tienes datos o acceso para estudiarla.'],
        ],
        ejemplo: 'Causa directa: «los pacientes olvidan la fecha de la cita». Causa indirecta, debajo: «el hospital no envía recordatorios». Una sostiene a la otra; puestas al mismo nivel parecerían dos causas independientes, y no lo son.',
        ojo: 'Una causa es un hecho que se puede comprobar, no un juicio sobre las personas. «A los pacientes no les importa su salud» es una opinión; «olvidan la fecha» se puede preguntar.',
    },
    ramas: {
        claves: [
            ['Cadena hacia arriba', 'Los efectos también se encadenan: pregunta «¿y eso qué provoca?» sobre cada efecto para subir de nivel. Dos o tres niveles bastan; más arriba todo termina en «menor calidad de vida».'],
            ['A quién afecta cada uno', 'Anota junto a cada efecto quién lo sufre: el paciente, la institución, la comunidad. Esa lista te da después los **beneficiarios** de la justificación, ya con nombre propio.'],
            ['Efectos que ya ocurren', 'Prefiere consecuencias que se observan hoy y que puedes respaldar con un dato. Las que solo «podrían pasar» van en el pronóstico del planteamiento, redactadas en condicional.'],
        ],
        ejemplo: 'Reprobación de cálculo en primer semestre. Efecto directo: los estudiantes repiten la materia. Indirecto: se atrasan en el plan de estudios. De fondo: abandonan la carrera. Afectados: el estudiante, su familia y la universidad.',
        ojo: 'Si un efecto ocurriría igual aunque el problema no existiera, no es efecto de tu problema. Quítalo o revisa la relación.',
    },
    pasos: {
        claves: [
            ['La lluvia de ideas', 'En el paso 1 no juzgues ni ordenes: una situación por tarjeta, todas en negativo. Si trabajas en grupo, que cada persona escriba las suyas antes de discutir.'],
            ['Cómo elegir el tronco', 'De la lista, el problema central suele ser el que **más tarjetas explica**: varias son su causa y otras varias su consecuencia. Las demás se reacomodan por debajo o por encima.'],
            ['Verificar es parte del método', 'La lectura final debe sonar lógica en voz alta. Si al decir «como pasa esto, ocurre aquello» necesitas agregar una explicación, falta una tarjeta intermedia.'],
        ],
        ejemplo: 'Lista inicial: tiempos de espera largos, citas perdidas, pacientes que olvidan la fecha, tratamientos interrumpidos, línea telefónica ocupada. «Citas perdidas» explica la espera y los tratamientos, y a su vez se explica por el olvido y el teléfono: ese es el tronco.',
        ojo: 'No borres las tarjetas que no encajan a la primera. Muchas vuelven a entrar como causa indirecta o como efecto cuando el tronco queda claro.',
    },
    ejemplo: {
        claves: [
            ['Lectura causa por causa', 'Cada causa debe poder leerse con el problema en una oración con «por eso». Haz la prueba una por una; no basta con que el conjunto parezca razonable.'],
            ['Causas independientes entre sí', 'Olvido, reprogramación y transporte son tres orígenes distintos. Si dos causas dicen lo mismo con otras palabras, únelas; si una explica a la otra, ponla debajo.'],
            ['Cada causa, un camino', 'Tres causas abren tres posibles intervenciones: recordatorios, un canal de reprogramación, horarios para la zona rural. El árbol te deja ver las opciones antes de elegir una.'],
        ],
        ejemplo: 'Prueba de lectura: «Como es difícil reprogramar la cita por teléfono, los pacientes faltan sin avisar, y por eso se pierden cupos de atención». Si la oración se sostiene sin añadidos, esa parte del árbol está bien armada.',
        ojo: 'Un árbol con una sola causa o un solo efecto suele estar incompleto. Busca al menos dos de cada uno, pero no los inventes para llenar casillas.',
    },
    usos: {
        claves: [
            ['El mismo orden en el texto', 'El planteamiento sigue el árbol: primero el problema con su dato, luego las causas y después las consecuencias. No tienes que decidir la estructura; ya la armaste.'],
            ['Coherencia entre secciones', 'Si cambias una causa en el árbol, cambian también el párrafo de causas y un objetivo específico. Por eso conviene dejar el árbol firme antes de redactar.'],
            ['También delimita', 'Las causas que decides **no** trabajar no desaparecen: se mencionan en el planteamiento y luego se declaran fuera del alcance del estudio, con la razón por la que quedaron fuera.'],
        ],
        ejemplo: 'De la causa «los pacientes olvidan la fecha» salen una oración del planteamiento («Entre las causas se encuentra el olvido de la cita…») y un objetivo específico («Identificar las razones que los pacientes reportan para no asistir»).',
        ojo: 'La figura acompaña al texto, no lo reemplaza. En el planteamiento debes explicar con palabras lo que el árbol muestra y mencionar la figura.',
    },
    errores: {
        claves: [
            ['La raíz de casi todos', 'La mayoría aparece cuando se arma el árbol **con la solución ya decidida**: el tronco se vuelve «falta de…» y las causas se escogen para justificarla.'],
            ['Revisión en dos pasadas', 'Primero revisa la forma: frases completas, en negativo, una idea por tarjeta. Después la lógica: cada flecha, leída con «por eso», debe tener sentido por sí sola.'],
            ['Pide una segunda lectura', 'Quien no conoce tu tema detecta rápido las relaciones forzadas. Si necesita que le expliques por qué una causa lleva al problema, esa relación no está clara en el árbol.'],
        ],
        ejemplo: 'Débil: tronco «No hay tutorías», causa «Desinterés», efecto «Mala educación». Corregido: tronco «Alta reprobación de cálculo en primer semestre», causa «Los estudiantes dedican poco tiempo al estudio autónomo», efecto «Aumenta la repitencia».',
        ojo: 'Corregir un error suele mover otras tarjetas. Después de cada cambio, vuelve a leer el árbol completo de abajo hacia arriba.',
    },
};
