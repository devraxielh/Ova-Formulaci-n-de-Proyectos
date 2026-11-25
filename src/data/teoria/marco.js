// Teoría ampliada de la clase «Marco referencial»: una entrada por diapositiva de teoría (ver components/deck/Teoria.jsx).
export default {
    /* Apertura */
    quees: {
        claves: [
            ['Se construyen en paralelo', 'El documento los presenta en este orden, pero se trabajan a la vez: los antecedentes te muestran qué teorías se usan y qué conceptos definir, mientras el contexto y las normas se consultan en otras fuentes.'],
            ['Cada apartado, sus fuentes', 'Antecedentes: artículos y tesis recientes. Teórico: los autores de la teoría. Conceptual: autores del área. Contextual: estadísticas e informes. Legal: el texto de las normas. Mezclarlas produce apartados confusos.'],
            ['El hilo son tus variables', 'Los cinco apartados hablan de lo mismo desde ángulos distintos: tus **variables** y tu **población**. Si un párrafo no menciona ninguna de las dos, probablemente sobra.'],
        ],
        ejemplo: 'En el proyecto de inasistencia: antecedentes, estudios sobre citas perdidas; teórico, el modelo de creencias en salud; conceptual, «inasistencia» y «consulta externa»; contextual, el hospital de Sincelejo; legal, la Ley 1751 de 2015.',
        ojo: 'El espacio no se reparte por igual: antecedentes y Marco Teórico suelen ocupar la mayor parte del capítulo; el conceptual y el legal son breves.',
    },
    funcion: {
        claves: [
            ['El marco se usa después', 'No es un requisito que se escribe y se olvida. La metodología toma de aquí las variables y los instrumentos, y la discusión compara tus resultados con los antecedentes y la teoría.'],
            ['Prueba de función', 'Ante cada párrafo pregúntate qué perdería el proyecto si lo borras. Si la respuesta es «nada», está de relleno, aunque sea verdadero y esté bien citado.'],
            ['Orientar es elegir qué medir', 'Una teoría convierte un problema amplio en variables concretas. Sin ella, el cuestionario se arma por intuición y después no hay con qué explicar los resultados.'],
        ],
        ejemplo: 'Si el modelo de creencias en salud habla de barreras percibidas y señales para la acción, tu cuestionario preguntará por transporte, costos y recordatorios, y en los resultados dirás si esas barreras explican la inasistencia.',
        ojo: 'Más páginas no hacen mejor un marco. Un evaluador valora que cada fuente esté conectada con el estudio, no la cantidad de fuentes.',
    },
    diferencias: {
        claves: [
            ['Los nombres cambian', 'Algunas universidades llaman «marco teórico» a todo el capítulo o piden «estado del arte» en lugar de antecedentes. Revisa la guía de tu programa y usa sus títulos; el contenido es el mismo.'],
            ['Antecedente frente a teoría', 'Un antecedente es un **estudio** concreto: alguien midió algo en un lugar y obtuvo un resultado. Una teoría es una **explicación** general que vale para muchos lugares y estudios.'],
            ['La revisión es el proceso', 'La revisión de literatura no es un apartado más: es el trabajo de buscar, leer y fichar. Su producto se reparte después entre antecedentes, teorías y conceptos.'],
        ],
        ejemplo: '«Pérez y Gómez (2022) encontraron que el olvido explicó el 41 % de las citas perdidas» es antecedente. «Las personas actúan según las barreras que perciben» es teoría. Una misma fuente puede aportar a los dos apartados.',
        ojo: 'Antes de escribir, decide a qué apartado pertenece cada ficha. Un mismo párrafo no debe aparecer en dos apartados.',
    },

    /* Antecedentes */
    'ant-quees': {
        claves: [
            ['Del mundo a lo local', 'El orden muestra que el problema es reconocido en otros países, que también existe en Colombia y que en tu región está poco estudiado. Ese recorrido prepara el vacío.'],
            ['Diez años es una guía', 'En temas que cambian rápido, como la tecnología, conviene acercarse a los últimos cinco. Si casi no hay estudios recientes, puedes incluir uno más antiguo y explicar por qué.'],
            ['Qué cuenta como antecedente', 'Una investigación con método y resultados: artículo científico, tesis o informe técnico. Un libro de texto, una noticia o una ley no son antecedentes, aunque sirvan en otros apartados.'],
        ],
        ejemplo: 'Para la inasistencia a citas: dos estudios internacionales, tres colombianos de distintas ciudades y uno o dos de Sucre o la región Caribe. Si de la región solo aparece una tesis, dilo: eso sostiene tu vacío.',
        ojo: 'Si no encuentras antecedentes locales, no fuerces uno que no trata tu tema. Declarar que no se hallaron es un argumento a tu favor.',
    },
    'ant-ficha': {
        claves: [
            ['Se llena mientras lees', 'Diligencia la ficha con el artículo abierto, no de memoria días después. Anota también la página de cada cifra, por si necesitas verificarla o citarla textualmente.'],
            ['El campo que más pesa', '«Qué te aporta» es lo que diferencia un antecedente de un resumen. Si no logras escribirlo en una oración, esa fuente probablemente no pertenece a tu estudio.'],
            ['De la ficha al párrafo', 'Cada campo se convierte en una oración, en el mismo orden: quién y dónde, con qué objetivo y método, qué halló y cómo se relaciona con tu investigación.'],
        ],
        ejemplo: 'Ficha: Pérez y Gómez (2022); IPS de Bogotá, encuesta a 380 pacientes; el olvido explicó el 41 %; aporta el cuestionario. Párrafo: «Pérez y Gómez (2022), en una IPS de Bogotá, encuestaron a 380 pacientes…».',
        ojo: 'Copia el DOI o el enlace en el momento. Buscar de nuevo una fuente la víspera de la entrega es como se termina con citas sin referencia.',
    },
    'ant-ejemplos': {
        claves: [
            ['Verbos en pasado y precisos', 'Los estudios ya se hicieron: «analizó», «comparó», «encontró», «concluyó». Evita «habla de» o «trata sobre», que no dicen qué hizo el autor ni qué obtuvo.'],
            ['Un párrafo por estudio', 'Entre 80 y 120 palabras suelen bastar. Más corto, falta el método o el hallazgo; más largo, estás resumiendo el artículo en lugar de extraer lo que te sirve.'],
            ['La relación debe ser específica', '«Se relaciona porque trata el mismo tema» no dice nada. Nombra **qué tomas**: una variable, un instrumento, un método de análisis o un dato para comparar.'],
        ],
        ejemplo: 'Vago: «Este estudio es importante para la presente investigación». Específico: «Se relaciona con este estudio porque su cuestionario de causas de inasistencia será adaptado a los pacientes del hospital de Sincelejo».',
        ojo: 'No repitas la misma frase de cierre en todos los antecedentes. Si los seis terminan igual, el evaluador entiende que no pensaste la relación de cada uno.',
    },
    'ant-ejemplos2': {
        claves: [
            ['El método cambia lo que reportas', 'De un estudio cuantitativo reportas muestra y cifras; de uno cualitativo, participantes y categorías o temas; de uno de diseño o ingeniería, el prototipo y sus indicadores de desempeño.'],
            ['También se aprende del método', 'Un antecedente no solo aporta resultados. Fíjate en cómo eligieron la muestra, qué instrumento usaron y qué limitaciones reconocen: son decisiones que tú también tendrás que tomar.'],
            ['Antecedentes que no coinciden', 'Si dos estudios llegan a resultados opuestos, incluye ambos y dilo. Una contradicción entre estudios también es un vacío que justifica investigar en tu contexto.'],
        ],
        ejemplo: 'Cualitativo: «Herrera (2020) entrevistó a 25 madres cabeza de hogar de Sincelejo y describió sus estrategias para conciliar trabajo y cuidado; aporta las categorías de análisis». Aquí no hay porcentajes, y no hacen falta.',
        ojo: 'No reportes una correlación como causa. Si el estudio halló que dos variables se relacionan, escribe «se asoció con», no «provocó».',
    },
    'ant-buscar': {
        claves: [
            ['Empieza por lo abierto', 'SciELO, Redalyc y Dialnet reúnen revistas iberoamericanas, muchas con texto completo gratuito. Google Académico encuentra más, pero mezcla calidades: revisa de dónde viene cada resultado antes de usarlo.'],
            ['Los repositorios dan lo local', 'Los estudios de tu municipio o tu institución casi nunca están en revistas internacionales. Búscalos en los repositorios de las universidades de la región: ahí aparecen las tesis.'],
            ['Dato oficial no es antecedente', 'Las cifras del DANE o de un ministerio sustentan el planteamiento y el Marco Contextual. Como antecedente solo cuentan los informes que tienen método y resultados propios.'],
        ],
        ejemplo: 'Ruta para el proyecto de inasistencia: SciELO y Redalyc para estudios colombianos y latinoamericanos; Google Académico para los internacionales en inglés; el repositorio de la Universidad de Sucre para tesis de la región.',
        ojo: 'Pregunta en la biblioteca de tu universidad por el acceso a las bases suscritas. Antes de pagar por un artículo, busca si tiene versión abierta.',
    },
    'ant-ecuacion': {
        claves: [
            ['Cómo se arma', 'Separa tu tema en dos o tres conceptos. Une los sinónimos de cada concepto con OR dentro de un paréntesis y une los paréntesis con AND. Así no pierdes estudios que usan otra palabra.'],
            ['Ajusta según los resultados', 'Si salen miles, agrega con AND un concepto más (la población o el lugar) o limita los años. Si salen muy pocos, quita un concepto o añade sinónimos con OR.'],
            ['Usa el vocabulario del área', 'Los artículos traen palabras clave: copia las de los primeros estudios útiles. En salud, los descriptores DeCS y MeSH te dan el término normalizado en español y en inglés.'],
        ],
        ejemplo: 'Si ("inasistencia" OR "no asistencia") AND "cita médica" devuelve pocos resultados, añade otro sinónimo al primer paréntesis, por ejemplo OR "ausentismo", y repite la búsqueda en inglés con "no-show".',
        ojo: 'Anota cada ecuación, la base de datos y la fecha en que buscaste. Te lo pueden pedir en la metodología y te evita repetir búsquedas.',
    },
    'ant-seleccion': {
        claves: [
            ['Los filtros van en orden', 'Empieza por la pertinencia: si el estudio no trata tus variables ni tu población, no importa que sea reciente o de buena revista. Los demás filtros solo se aplican a lo pertinente.'],
            ['Cómo reconocer la calidad', 'Revisa que tenga autores identificados, sección de método, resultados con datos y lista de referencias. En revistas, que declare revisión por pares; en tesis, la universidad que la respalda.'],
            ['Un clásico no es un antecedente', 'El texto donde un autor propuso una teoría hace décadas va en el Marco Teórico. En antecedentes van los estudios recientes que aplicaron esa teoría.'],
        ],
        ejemplo: 'Un artículo de 2023 sobre inasistencia a citas en un hospital de Cartagena pasa los cuatro filtros. Uno sobre «ausentismo laboral» comparte una palabra con tu tema, pero estudia otra variable y otra población: se descarta.',
        ojo: 'No incluyas una fuente solo para llegar al número que pide la guía. Seis antecedentes pertinentes pesan más que diez de relleno.',
    },
    'ant-leer': {
        claves: [
            ['El resumen decide', 'El resumen trae objetivo, método, resultado principal y conclusión. Si ahí no aparecen tus variables ni tu población, pasa al siguiente sin abrir el texto completo.'],
            ['Qué anotar del método', 'Tipo de estudio, lugar, tamaño de la muestra, instrumento y análisis. Con esos cinco datos puedes describir el estudio y valorar si sus resultados son comparables con los tuyos.'],
            ['Bola de nieve en dos sentidos', 'Hacia atrás, revisa las referencias del artículo. Hacia adelante, usa «Citado por» en Google Académico para ver quién lo citó después: suelen ser estudios más recientes sobre lo mismo.'],
        ],
        ejemplo: 'En el resumen ves que el estudio encuestó pacientes de consulta externa: sirve. En el método anotas «380 pacientes, cuestionario». En resultados, «olvido: 41 %». En las referencias encuentras dos estudios colombianos más.',
        ojo: 'No cites un artículo del que solo leíste el resumen. Como mínimo revisa el método y los resultados: el resumen no muestra las limitaciones.',
    },
    'ant-matriz': {
        claves: [
            ['Se lee por columnas', 'Recorrer hacia abajo la columna «Método» o «Hallazgo» muestra patrones: qué diseño predomina, en qué coinciden los estudios, dónde se hicieron. Eso no se ve leyendo las fichas una por una.'],
            ['Agrega las columnas que necesites', 'Además de las básicas, sirven «Instrumento», «Población» y «Teoría usada». Esta última te muestra qué teorías son habituales en tu tema, lo que ayuda a elegir la tuya.'],
            ['De la matriz sale la síntesis', 'Lo que se repite en la columna de hallazgos es «lo que se sabe». Lo que ningún estudio cubre (un lugar, una población, un método) es **el vacío**.'],
        ],
        ejemplo: 'En la matriz de inasistencia, la columna «Ámbito» muestra un solo estudio regional y la de «Método» ninguno hecho en un hospital de segundo nivel. Ese es el vacío que después redactas en el párrafo de síntesis.',
        ojo: 'La matriz es tu herramienta de trabajo; en el documento va la redacción. Si tu asesor la pide, inclúyela como tabla o como anexo.',
    },
    'ant-vacio': {
        claves: [
            ['Tres oraciones, tres funciones', 'Primero, las coincidencias entre estudios («coinciden en que…»). Luego, lo que falta, con un conector de contraste («sin embargo…»). Al final, lo que hará tu estudio frente a esa falta.'],
            ['Tipos de vacío', 'Puede faltar el **lugar** (no se ha estudiado en tu región), la **población** (otro grupo), el método (solo hay estudios descriptivos) o la variable (nadie ha medido cierto factor).'],
            ['El vacío debe poder comprobarse', 'Escribe «no se encontraron estudios en…» y no «no existen estudios». Lo primero describe tu búsqueda; lo segundo es una afirmación que no puedes demostrar.'],
        ],
        ejemplo: 'En educación: «Los estudios revisados coinciden en que las tutorías reducen la reprobación en primer semestre. Sin embargo, se realizaron en universidades de grandes ciudades; no se encontraron en universidades públicas de la región. Este estudio aborda ese vacío».',
        ojo: 'El vacío debe coincidir con tu objetivo general. Si dices que falta estudiar hospitales de segundo nivel, tu estudio tiene que hacerse en uno.',
    },

    /* Marco Teórico */
    'teo-quees': {
        claves: [
            ['Teoría frente a opinión', 'Una teoría tiene autor identificable, conceptos definidos y relaciones entre ellos que otros han puesto a prueba. «Los pacientes no van por pereza» es una opinión, no una teoría.'],
            ['Por qué pocas y bien explicadas', 'Cada teoría que incluyes te obliga a usarla: sus conceptos deben aparecer en tus variables y en tu análisis. Con cinco teorías eso es imposible; con una o dos, sí.'],
            ['Las fuentes son otras', 'Aquí se cita al autor de la teoría o un libro académico que la explique, no una página cualquiera de internet. Si no accedes al original, cita la fuente donde la leíste.'],
        ],
        ejemplo: 'Para la reprobación en primer semestre no basta decir «los estudiantes llegan mal preparados». El aprendizaje significativo de Ausubel explica el mecanismo: sin conocimientos previos con los que relacionar el contenido nuevo, el estudiante memoriza sin comprender.',
        ojo: 'No confundas el Marco Teórico con una historia del tema. La evolución de los hospitales o de la educación en Colombia no explica tu variable.',
    },
    'teo-elegir': {
        claves: [
            ['Parte de los antecedentes', 'Revisa qué teoría usan los estudios que fichaste. Si varios usan la misma, es una elección segura: ya está probada en tu tema y tendrás con quién comparar tus resultados.'],
            ['Componentes que puedas medir', 'Elige una teoría cuyos componentes puedas convertir en preguntas o indicadores con tu población. Si no puedes medir ninguno de sus conceptos, no te sirve aunque sea famosa.'],
            ['Principal y de apoyo', 'Si usas dos, define cuál explica la variable principal y cuál complementa otro aspecto. Deben ser compatibles: no presentes dos que expliquen lo mismo de forma opuesta sin advertirlo.'],
        ],
        ejemplo: 'Inasistencia a citas: el modelo de creencias en salud explica las razones individuales (barreras percibidas, señales para la acción) y el enfoque de determinantes sociales, las condiciones externas (transporte, ingresos). El primero es el principal; el segundo lo complementa.',
        ojo: 'No elijas la teoría por ser la más conocida. La pregunta es si explica **tu** variable dependiente con las variables que vas a medir.',
    },
    'teo-salud': {
        claves: [
            ['Nivel individual o social', 'Creencias en salud y promoción de la salud explican decisiones de la persona. Los determinantes sociales explican condiciones que la persona no controla. Elige según dónde esté tu variable.'],
            ['Lo que te piden medir', 'Con creencias en salud mides percepciones: susceptibilidad, gravedad, beneficios y barreras. Versiones posteriores del modelo añadieron la autoeficacia, que es la confianza de la persona en que puede realizar la conducta.'],
            ['La teoría de Orem', 'Se compone de tres teorías relacionadas: la del autocuidado, la del déficit de autocuidado y la de los sistemas de enfermería. Es habitual en proyectos sobre pacientes crónicos y educación al paciente.'],
        ],
        ejemplo: 'Proyecto sobre adherencia al tratamiento en pacientes hipertensos de un hospital de Sincelejo: con Orem estudias la capacidad de autocuidado del paciente; con creencias en salud, por qué percibe que no necesita el medicamento.',
        ojo: 'Los años de la diapositiva identifican la obra original. En tu texto cita la edición o el documento que realmente consultaste, con su propio año.',
    },
    'teo-educacion': {
        claves: [
            ['Qué explica cada una', 'Piaget explica cómo cambia el pensamiento con el desarrollo; Vygotsky, el papel de la interacción y de la ayuda de otros; Ausubel, la relación entre lo nuevo y lo que el estudiante ya sabe.'],
            ['De la teoría a la estrategia', 'Si tu proyecto prueba una estrategia, la teoría debe justificar por qué funcionaría: tutorías entre pares con Vygotsky, organizadores previos con Ausubel, actividades de exploración con Piaget.'],
            ['Cada concepto con su autor', 'La zona de desarrollo próximo es de Vygotsky; la asimilación y la acomodación, de Piaget. Atribuir un concepto al autor equivocado es un error que un evaluador de educación detecta rápido.'],
        ],
        ejemplo: 'Proyecto sobre reprobación en cálculo de primer semestre: con Ausubel, la hipótesis es que faltan conocimientos previos de álgebra; con Vygotsky, que la tutoría de un compañero avanzado permite resolver lo que el estudiante solo no logra.',
        ojo: 'Las inteligencias múltiples son muy citadas, pero han recibido críticas por su escaso respaldo empírico. Si las usas, reconócelo y apóyate en estudios que las apliquen.',
    },
    'teo-negocios': {
        claves: [
            ['Persona, empresa o sector', 'Maslow y Herzberg explican la motivación de personas; Barney, la ventaja de una empresa por sus recursos internos; Porter, la competencia en un sector. Elige según tu unidad de análisis.'],
            ['Herzberg en la práctica', 'Los factores higiénicos (salario, condiciones, supervisión) evitan la insatisfacción pero no motivan; los motivadores (logro, reconocimiento, el trabajo mismo) sí. Tu cuestionario debe preguntar por los dos grupos por separado.'],
            ['SERVQUAL ya trae dimensiones', 'El modelo evalúa cinco: elementos tangibles, fiabilidad, capacidad de respuesta, seguridad y empatía. Te da las dimensiones de la variable y un cuestionario base que puedes adaptar.'],
        ],
        ejemplo: 'Proyecto sobre satisfacción de los clientes de las tiendas de barrio de Montería: SERVQUAL permite comparar lo que el cliente espera con lo que percibe en cada dimensión, por ejemplo en la rapidez de la atención.',
        ojo: 'Las cinco fuerzas de Porter analizan un sector, no la gestión interna de un negocio. No las uses para explicar el clima laboral o la satisfacción de un cliente.',
    },
    'teo-tecnologia': {
        claves: [
            ['Adopción individual', 'TAM y UTAUT explican por qué una persona decide usar una tecnología. TAM es más simple, con dos percepciones; UTAUT agrega la influencia social y las condiciones facilitadoras, útiles en organizaciones.'],
            ['Difusión en un grupo', 'Rogers explica cómo una innovación se extiende en una comunidad con el tiempo. Señala atributos que influyen en la adopción: ventaja relativa, compatibilidad, complejidad, posibilidad de prueba y observabilidad.'],
            ['Procesos y sistemas', 'La teoría de restricciones propone un ciclo: identificar la restricción, aprovecharla al máximo, subordinar el resto a ella, elevarla y volver a empezar. Sirve como marco para proyectos de mejora.'],
        ],
        ejemplo: 'Proyecto sobre pagos digitales en tiendas de barrio de Montería: con TAM mides si el tendero cree que la billetera digital le ayuda a vender más (utilidad percibida) y si le parece fácil de manejar (facilidad de uso percibida).',
        ojo: 'TAM explica la **intención** de uso, no si la tecnología funciona bien. Si tu proyecto es construir un sistema, necesitas además un referente técnico o de ingeniería.',
    },
    'teo-social': {
        claves: [
            ['Intención no es conducta', 'La teoría de Ajzen trata la intención como el antecedente inmediato de la conducta. Si solo mides intención, dilo así: no afirmes que las personas harán lo que dicen.'],
            ['Autoeficacia según Bandura', 'Para Bandura, es la creencia de la persona en su capacidad para lograr algo concreto. Es específica de cada tarea: se mide para matemáticas o para dejar de fumar, no en general.'],
            ['Niveles de Bronfenbrenner', 'El microsistema es el entorno inmediato (familia, aula); el mesosistema, las relaciones entre esos entornos; el exosistema, ámbitos que influyen sin que la persona participe; el macrosistema, la cultura y las políticas.'],
        ],
        ejemplo: 'Proyecto sobre intención de emprender en estudiantes de último semestre: actitud («emprender me parece valioso»), norma subjetiva («mi familia lo apoyaría») y control percibido («me siento capaz de montar un negocio»).',
        ojo: 'El informe Brundtland aporta una definición y un enfoque, no una teoría que explique conductas. En proyectos ambientales suele acompañarse de una teoría del comportamiento.',
    },
    'teo-estructura': {
        claves: [
            ['Postulados con tus palabras', 'Explica los componentes como se los explicarías a un compañero y cita al autor. No encadenes citas textuales: una definición literal breve basta; lo demás, parafraseado.'],
            ['El uso reciente da vigencia', 'Mostrar que estudios actuales aplican la teoría a temas como el tuyo responde a la objeción «esa teoría es de hace cincuenta años». Con uno o dos estudios es suficiente.'],
            ['La relación nombra variables', 'El cuarto movimiento debe mencionar tus variables por su nombre y decir qué componente de la teoría explica cada una. Es el párrafo en el que más se fija el evaluador.'],
        ],
        ejemplo: 'Relación bien escrita: «El modelo de aceptación tecnológica sustenta este estudio porque permite explicar la intención de los tenderos de usar pagos digitales a partir de la utilidad y la facilidad de uso que perciben».',
        ojo: 'Si usas dos teorías, repite los cuatro movimientos para cada una y agrega una oración que diga cómo se complementan.',
    },
    'teo-ejemplo': {
        claves: [
            ['Cada párrafo, un movimiento', 'El primero presenta la teoría y explica sus postulados; el segundo muestra el uso reciente; el tercero la conecta con el estudio. Esa división ayuda al lector a ubicar cada parte.'],
            ['Dónde van las citas', 'La cita del autor de la teoría aparece al presentarla; la de los estudios que la aplican, en el segundo párrafo. El tercero es tu propio argumento y puede no llevar cita.'],
            ['Componentes que se vuelven variables', 'El cierre retoma «barreras» y «señales para la acción» y las traduce al caso: transporte, tiempo, costos, recordatorios. Así se pasa de la teoría a lo que vas a medir.'],
        ],
        ejemplo: 'El mismo esquema en educación: presentar el aprendizaje significativo de Ausubel y sus postulados; citar un estudio que lo aplicó en matemáticas universitarias; cerrar diciendo que sustenta el análisis de los conocimientos previos de quienes reprueban cálculo.',
        ojo: 'Como guía, una teoría ocupa de una a dos páginas. Si pasas de tres, probablemente estás contando la biografía del autor o la historia de la teoría.',
    },

    /* Marco Conceptual */
    'con-quees': {
        claves: [
            ['Para qué definir', 'Una misma palabra tiene sentidos distintos según el autor. Definir «inasistencia» o «rendimiento» fija cuál vas a usar, y esa decisión determina después qué mides y qué dejas por fuera.'],
            ['Concepto frente a teoría', 'El Marco Teórico explica relaciones: por qué una cosa influye en otra. El Marco Conceptual solo fija significados. Si un párrafo explica causas, pertenece al teórico.'],
            ['Dónde encontrar definiciones', 'En tus propios antecedentes y en los textos de tu teoría: los autores definen sus variables al comienzo. También sirven los organismos del área, como la OMS o el ministerio correspondiente.'],
        ],
        ejemplo: '¿«Inasistencia» incluye a quien canceló un día antes? Con la definición «ausencia a una cita programada sin cancelación previa», no. Esa precisión cambia cuántos casos vas a contar en el hospital.',
        ojo: 'Usa el mismo término en todo el documento. Si defines «inasistencia», no la llames después «ausentismo» o «incumplimiento»: el lector creerá que son variables distintas.',
    },
    'con-operacional': {
        claves: [
            ['Una se deriva de la otra', 'La definición operacional debe medir lo que dice la conceptual. Si defines inasistencia como ausencia «sin cancelación previa», tu conteo no puede incluir las citas que el paciente canceló.'],
            ['Tres formas de operacionalizar', 'Con un registro existente (citas perdidas en el sistema), con un instrumento (puntaje en una escala) o con una observación (número de veces que ocurre una conducta).'],
            ['Origen del cuadro de variables', 'En la metodología, cada variable tendrá su definición conceptual, sus dimensiones, sus indicadores y su instrumento. Lo que definas ahora es el punto de partida de ese cuadro.'],
        ],
        ejemplo: 'Reprobación. Conceptual: no alcanzar el nivel de logro mínimo exigido en una asignatura (con su autor y año). Operacional: nota final inferior a 3,0 en cálculo diferencial, según el registro académico del semestre.',
        ojo: 'No pongas la definición operacional en el Marco Conceptual. Aquí va el «qué es», con autor; el «cómo se mide» va en la metodología.',
    },
    'con-salud': {
        claves: [
            ['Anatomía de una definición', 'Una buena definición dice a qué clase pertenece el término y qué lo distingue. «Consulta externa: atención ambulatoria (clase) programada que no requiere hospitalización (lo que la distingue)», más la cita.'],
            ['Fuentes propias de salud', 'Además de autores, puedes definir con organismos del sector: la OMS, la OPS o el Ministerio de Salud y Protección Social. Sus glosarios y lineamientos traen definiciones aceptadas en el área.'],
            ['Términos técnicos del contexto', 'Si tu título dice «segundo nivel» o «régimen subsidiado», defínelos. Para ti son obvios, pero el evaluador puede venir de otra área y entenderlos de otro modo.'],
        ],
        ejemplo: '«Adherencia terapéutica: grado en que la conducta del paciente coincide con las recomendaciones acordadas con el profesional de salud (autor, año)». Tiene clase (grado de coincidencia) y rasgo que la distingue (con lo acordado).',
        ojo: 'Las citas del ejemplo de la diapositiva son ilustrativas. En tu marco, cada definición debe venir de una fuente que hayas leído y que esté en tus referencias.',
    },
    'con-educacion': {
        claves: [
            ['Elige según tu enfoque', 'Para «rendimiento académico» hay definiciones centradas en las calificaciones y otras en las competencias. Escoge la que coincida con lo que vas a medir: si medirás notas, usa la primera.'],
            ['Definiciones oficiales', 'Para términos administrativos, como deserción, repitencia o jornada única, la fuente adecuada es el Ministerio de Educación Nacional, porque así se registran en las estadísticas que vas a usar.'],
            ['Conceptos que vienen de la teoría', 'Si tu teoría es la de Ausubel, «aprendizaje significativo» se define citándolo a él. El Marco Conceptual y el Teórico deben usar el mismo autor para el mismo término.'],
        ],
        ejemplo: 'Proyecto de reprobación en primer semestre: reprobación, rendimiento académico, conocimientos previos, tutoría académica y permanencia estudiantil. Cinco conceptos, todos presentes en el título, en las variables o en la teoría.',
        ojo: 'No definas términos que no usarás. Si «estilos de aprendizaje» no aparece en tus objetivos ni en tus variables, sobra en el Marco Conceptual.',
    },
    'con-negocios': {
        claves: [
            ['Una norma también define', 'Algunos términos tienen definición legal, como mipyme. En ese caso cita la norma como fuente y verifica que esté vigente, porque los criterios de clasificación de las empresas se han actualizado.'],
            ['Términos en inglés', 'Si usas «e-commerce», «fintech» o «engagement», defínelos y decide una sola forma de escribirlos. Cuando exista un equivalente claro en español, como «comercio electrónico», prefiérelo.'],
            ['Informes del sector', 'Para conceptos recientes, las definiciones suelen estar en informes de bancos centrales, ministerios u organismos internacionales, además de los artículos académicos. Son fuentes válidas si tienen autor institucional y año.'],
        ],
        ejemplo: 'Proyecto de pagos digitales en tiendas de Montería: tienda de barrio, pago digital, billetera digital, adopción tecnológica, utilidad percibida y facilidad de uso percibida. Las dos últimas salen del modelo TAM y se definen con Davis.',
        ojo: 'No definas con la página de una empresa que vende el producto. Lo que un proveedor de billeteras dice sobre «pago digital» es publicidad, no una definición académica.',
    },
    'con-redaccion': {
        claves: [
            ['Cuándo conviene cada forma', 'La lista es clara y rápida de consultar cuando hay muchos términos independientes. El texto conectado funciona mejor cuando los conceptos se relacionan entre sí y quieres mostrar esa relación.'],
            ['Cómo se conecta', 'Usa el final de una definición para introducir el siguiente concepto: «esta ocurre en…», «entre sus causas están…», «para medirla se recurre a…». Cada definición conserva su cita.'],
            ['Verbos para definir', 'Alterna «se entiende como», «se define como», «hace referencia a» y «consiste en». Evita «es cuando», que describe una situación en lugar de definir el término.'],
        ],
        ejemplo: '«El rendimiento académico se entiende como el nivel de logro de los aprendizajes esperados (Lamas, 2015). Cuando ese nivel no alcanza el mínimo exigido se habla de reprobación, definida como… (autor, año)».',
        ojo: 'En texto conectado es fácil pasar de definir a explicar causas. Si el párrafo empieza a argumentar por qué ocurre el problema, ya es Marco Teórico.',
    },
    'con-orden': {
        claves: [
            ['Por qué no más de diez', 'Cada concepto debe volver a aparecer en los objetivos, la metodología o los resultados. Con veinte definiciones, la mayoría no se usará y el apartado se convierte en un glosario.'],
            ['El orden cuenta una historia', 'De lo general a lo particular, el lector entiende primero el campo, luego tu variable y después lo que la explica. Leídas seguidas, las definiciones resumen tu proyecto.'],
            ['Conceptos compuestos', 'Si un término contiene otros, define primero las partes. Para «barreras de acceso a los servicios de salud» conviene haber definido antes «servicio de salud» y «acceso».'],
        ],
        ejemplo: 'Tiendas de Montería: 1) comercio minorista, 2) adopción de pagos digitales, 3) utilidad percibida y facilidad de uso, 4) tienda de barrio y mipyme. Concepto general, variable principal, variables que la explican y términos del contexto.',
        ojo: 'Haz la prueba del título: subraya cada sustantivo importante y comprueba que todos tienen definición. Es de lo primero que revisa un evaluador.',
    },

    /* Marco Contextual */
    'ctx-quees': {
        claves: [
            ['Para qué sirve', 'Le permite al lector juzgar si tus resultados aplican en otro lugar. Un hallazgo en un hospital público de una ciudad intermedia no se lee igual que en una clínica privada de Bogotá.'],
            ['Describe, no argumenta', 'Aquí no explicas causas ni justificas el estudio: presentas datos del lugar y de la población. Las cifras del **problema** van en el planteamiento; las del **lugar**, aquí.'],
            ['Embudo corto', 'Dedica una o dos oraciones al municipio, un párrafo a la institución y otro a la población. La mayor parte del espacio es para lo que está más cerca de tu estudio.'],
        ],
        ejemplo: '«Una de cada cinco citas de consulta externa se pierde» es un dato del problema: va en el planteamiento. «El hospital tiene 12 consultorios de consulta externa y atiende de lunes a viernes» es un dato del contexto.',
        ojo: 'No copies la reseña histórica del municipio ni la misión completa de la institución. Selecciona solo los datos que ayudan a entender tu población.',
    },
    'ctx-niveles': {
        claves: [
            ['No todos pesan igual', 'Los niveles geográfico y socioeconómico se resuelven en pocas líneas. El institucional y el poblacional merecen más detalle, porque de ellos dependen tu muestra y el acceso a los datos.'],
            ['Elige datos que se relacionen', 'Del nivel socioeconómico toma lo que toca tu tema: si estudias inasistencia, importan la ruralidad y el transporte; si estudias pagos digitales, la conectividad y la informalidad.'],
            ['El poblacional anticipa la muestra', 'Decir cuántas personas son y qué características tienen prepara la sección de población y muestra de la metodología. Los dos apartados deben coincidir en las cifras.'],
        ],
        ejemplo: 'Colegio de Lorica. Geográfico: zona urbana del municipio. Socioeconómico: familias de estratos 1 y 2. Institucional: pública, jornada única, cerca de 1.100 estudiantes. Poblacional: grado noveno, entre 14 y 16 años.',
        ojo: 'Si tu estudio no ocurre en una institución, sino en un barrio o una comunidad, el nivel institucional se reemplaza por la descripción de esa comunidad.',
    },
    'ctx-fuentes': {
        claves: [
            ['Datos públicos y datos internos', 'Lo del municipio está publicado (DANE, plan de desarrollo). Lo de la institución a veces hay que solicitarlo por escrito a la oficina de estadística, de calidad o de registro académico.'],
            ['Cómo se citan', 'Los informes institucionales se citan como cualquier documento: la organización como autor, el año y el título. Si un dato te lo dio un funcionario en una conversación, es una comunicación personal y debes indicarlo.'],
            ['Actualidad del dato', 'Usa la cifra más reciente disponible y menciona su año. Para población, el DANE publica proyecciones posteriores al censo de 2018: indica si usas el censo o la proyección.'],
        ],
        ejemplo: '«Según el informe de gestión del hospital (2025), consulta externa atendió en promedio 4.000 consultas mensuales». El lector sabe quién produjo el dato, de qué año es y dónde puede verificarlo.',
        ojo: 'Wikipedia y las páginas de turismo no son fuente para las cifras del contexto. Ve al documento oficial del que esas páginas tomaron el dato.',
    },
    'ctx-ej-salud': {
        claves: [
            ['Qué tiene el ejemplo', 'En tres oraciones recorre lugar, institución y población. Cada una agrega datos verificables: capital de departamento, nivel de atención y servicios, volumen de consultas, régimen y procedencia.'],
            ['Datos que conviene añadir', 'Según tu tema: número de especialidades y consultorios, horarios, forma de asignar las citas (presencial, por teléfono, por internet) y municipios de donde llegan los pacientes.'],
            ['Contexto que ayuda a interpretar', 'Elige los datos que después den sentido a tus resultados. Si muchos pacientes vienen de otros municipios, se entiende que el transporte aparezca como barrera.'],
        ],
        ejemplo: 'Oración que podrías añadir: «Las citas se asignan de forma presencial y por teléfono, y cerca de un tercio de los pacientes procede de municipios distintos a Sincelejo (oficina de estadística del hospital, 2025)».',
        ojo: 'Antes de nombrar el hospital, confirma que tienes autorización. Si no, descríbelo sin nombre: «un hospital público de segundo nivel de Sincelejo».',
    },
    'ctx-ej-colegio': {
        claves: [
            ['Qué describir de un colegio', 'Carácter (oficial o privado), zona (urbana o rural), niveles que ofrece, jornada, número de estudiantes y de docentes. Si es pertinente para tu tema, sus resultados en pruebas externas.'],
            ['La población con precisión', 'No basta «los estudiantes»: indica grado, número de grupos, cuántos son, rango de edad y alguna característica relevante para tu tema, como el acceso a internet en casa.'],
            ['Dónde están los datos', 'El Proyecto Educativo Institucional describe el colegio y su comunidad; la secretaría del plantel maneja la matrícula. Solicita ambos por medio del rector o del coordinador.'],
        ],
        ejemplo: '«Grado noveno tiene tres grupos y 96 estudiantes. Según la caracterización del colegio, la mayoría vive en barrios cercanos y cerca de la mitad no tiene computador en casa (Proyecto Educativo Institucional, 2025)».',
        ojo: 'Con menores de edad, describe al grupo, nunca a personas identificables. Y deja previsto el permiso del colegio y de los padres para recoger la información.',
    },
    'ctx-ej-empresa': {
        claves: [
            ['Sector antes que empresa', 'Cuando la población son muchos negocios, describe el sector: cuántos hay, de qué tamaño, qué venden, qué tanta formalidad existe. No hay una institución única que describir.'],
            ['Fuentes del tejido empresarial', 'Las cámaras de comercio publican estudios económicos basados en el registro mercantil. Ten presente que ese registro solo cuenta negocios matriculados: muchas tiendas informales no aparecen.'],
            ['Delimita el territorio', 'Indicar la comuna o los barrios hace manejable el estudio y permite que otros lo repitan. Explica por qué elegiste esa zona: concentración de tiendas, acceso o cercanía.'],
        ],
        ejemplo: '«La comuna 4 es una zona residencial donde predominan las tiendas atendidas por sus dueños, que abren todos los días y venden al menudeo. Un recorrido previo del equipo identificó 85 tiendas en seis barrios».',
        ojo: 'Si no existe un listado oficial de tu población, dilo y explica cómo la contaste. Un conteo propio, bien descrito, es una fuente válida.',
    },
    'ctx-errores': {
        claves: [
            ['Qué cambia entre columnas', 'La versión concreta reemplaza un adjetivo («muy buena», «trabajadoras», «muchos problemas») por un hecho que se puede verificar: una cifra, una característica o una fuente.'],
            ['Prueba de sustitución', 'Cambia el nombre de tu ciudad por el de otra. Si la oración sigue siendo cierta, es genérica y no describe tu contexto. «Tiene problemas de salud» vale para cualquier lugar.'],
            ['Describir sin juzgar', 'El Marco Contextual no opina. «Los tenderos son trabajadores» o «la institución es excelente» son valoraciones; escribe solo lo que se puede observar, contar o verificar en una fuente.'],
        ],
        ejemplo: 'Vago: «Los estudiantes de primer semestre tienen muchas dificultades». Concreto: «El programa recibe cerca de 120 estudiantes nuevos por semestre, la mayoría egresados de colegios públicos del departamento (registro académico, 2025)».',
        ojo: 'Concreto no significa largo. Una oración con dos datos y su fuente vale más que un párrafo de generalidades.',
    },

    /* Marco Legal */
    'leg-quees': {
        claves: [
            ['Para qué sirve', 'Muestra que tu estudio se mueve dentro de las reglas: qué derechos están en juego, qué obligaciones tiene la institución y qué límites debes respetar al recoger información.'],
            ['Dos tipos de normas', 'Las que regulan tu **tema** (salud, educación, comercio) y las que regulan tu **investigación** (ética, protección de datos). Las segundas se olvidan con frecuencia y aplican a muchos proyectos.'],
            ['Verifica la vigencia', 'Las normas se modifican y se derogan. Antes de citar una, consulta en el Gestor Normativo o en la Secretaría del Senado si sigue vigente y si algún artículo cambió.'],
        ],
        ejemplo: 'Proyecto de inasistencia. Normas del tema: Constitución, artículo 49, y Ley 1751 de 2015. Normas de la investigación: Resolución 8430 de 1993, por ser un estudio en salud, y Ley 1581 de 2012, por usar datos de pacientes.',
        ojo: 'No tomes las normas de otra tesis sin verificarlas. Por esa vía se repiten leyes derogadas y números equivocados.',
    },
    'leg-piramide': {
        claves: [
            ['Por qué importa la jerarquía', 'Una norma inferior no puede contradecir a una superior: el decreto desarrolla la ley y la ley respeta la Constitución. Ordenarlas así muestra de dónde viene cada obligación.'],
            ['Lo internacional', 'Un tratado ratificado por Colombia obliga al país. Las declaraciones y agendas, como los ODS, orientan pero no son leyes: preséntalas como referentes y no como normas que se incumplen.'],
            ['Dentro del mismo nivel', 'Cuando hay varias leyes o varias resoluciones, lo usual es ordenarlas de la más antigua a la más reciente. Mantén el mismo criterio en todo el apartado.'],
        ],
        ejemplo: 'Proyecto en un colegio, de mayor a menor: Constitución Política, artículo 67; Ley 115 de 1994; Ley 1620 de 2013; Decreto 1075 de 2015; y, al final, el manual de convivencia de la institución.',
        ojo: 'No ordenes por importancia para tu tema ni por orden de hallazgo. La resolución que más te sirve puede ir de penúltima, y está bien.',
    },
    'leg-internacional': {
        claves: [
            ['Cuándo incluirlos', 'Úsalos si tu tema toca un derecho o una meta global y puedes señalar el artículo o la meta concreta. Si la relación es remota, basta con las normas nacionales.'],
            ['Los ODS tienen metas', 'Cada objetivo se divide en metas numeradas; en total son 169. Citar la meta es más preciso que citar el objetivo: por ejemplo, la meta 3.8 trata de la cobertura sanitaria universal.'],
            ['Ética en investigación', 'La Declaración de Helsinki pide, entre otros principios, consentimiento informado y revisión del estudio por un comité de ética. En Colombia, la norma nacional sobre investigación en salud es la Resolución 8430 de 1993.'],
        ],
        ejemplo: '«La Agenda 2030 (ONU, 2015), en su Objetivo 3, busca garantizar una vida sana para todos. Se relaciona con el estudio porque reducir las citas perdidas mejora el acceso efectivo a los servicios de salud».',
        ojo: 'Uno o dos referentes internacionales son suficientes. El peso del Marco Legal está en las normas colombianas que aplican directamente a tu tema.',
    },
    'leg-salud': {
        claves: [
            ['De lo general a tu caso', 'El artículo 49 y la Ley 1751 hablan del derecho; la Ley 100 organiza el sistema en el que opera tu hospital. Toma de cada una el aspecto que toca tu variable.'],
            ['Clasifica el riesgo de tu estudio', 'La Resolución 8430 distingue investigaciones sin riesgo, con riesgo mínimo y con riesgo mayor que el mínimo. Un estudio con cuestionarios o revisión de registros suele estar en las dos primeras: decláralo.'],
            ['Datos de salud', 'La Ley 1581 trata los datos de salud como **datos sensibles**, que exigen autorización del titular y mayor cuidado. Por eso los registros se usan anonimizados y con permiso de la institución.'],
        ],
        ejemplo: '«La Resolución 8430 de 1993 establece las normas para la investigación en salud. Se relaciona con el estudio porque este se clasifica como investigación sin riesgo, al basarse en la revisión de registros de citas sin intervenir a los pacientes».',
        ojo: 'La Ley 100 ha tenido varias reformas. Cita lo que establece sobre tu tema y verifica su texto vigente antes de escribir.',
    },
    'leg-educacion': {
        claves: [
            ['Básica y media, o superior', 'La Ley 115 regula la educación preescolar, básica y media; la Ley 30, la educación superior. Si tu estudio es en una universidad, tu ley principal es la segunda.'],
            ['El decreto único', 'El Decreto 1075 de 2015 compila en un solo texto los decretos reglamentarios del sector. Es extenso: cita la parte o el artículo que trata tu tema, no el decreto entero.'],
            ['Normas de la institución', 'El manual de convivencia, el sistema institucional de evaluación o el reglamento estudiantil son las normas más cercanas a tu problema. Van al final de la pirámide, pero suelen ser muy útiles.'],
        ],
        ejemplo: 'Proyecto de reprobación en primer semestre: Constitución, artículo 67; Ley 30 de 1992; y el reglamento estudiantil de la universidad, que define cuándo se reprueba una asignatura y cuántas veces puede repetirse.',
        ojo: 'Si participan menores de edad, necesitas el consentimiento de los padres y el asentimiento del estudiante. Menciónalo aquí o en las consideraciones éticas.',
    },
    'leg-empresa': {
        claves: [
            ['Según a quién estudias', 'Si tu población son mipymes, la Ley 590 es central; si son emprendedores, la Ley 2069; si estudias un servicio digital, la Ley 1341. Rara vez necesitas las tres.'],
            ['Datos de clientes', 'Si encuestas clientes o usas bases de datos de un negocio, aplica la Ley 1581: debes pedir autorización, informar para qué usarás los datos y no usarlos con otro fin.'],
            ['Normas que cambian', 'En empresa y tecnología las reformas son frecuentes. Revisa si la ley fue modificada y trabaja con el texto vigente; los criterios para clasificar el tamaño de las empresas, por ejemplo, se han actualizado.'],
        ],
        ejemplo: '«La Ley 590 de 2000 promueve el desarrollo de las micro, pequeñas y medianas empresas. Se relaciona con el estudio porque las tiendas de barrio de Montería son microempresas, destinatarias de esa política de fomento».',
        ojo: 'No cites una ley solo porque su título menciona tu tema. Lee al menos el artículo que vas a usar y resume lo que dice.',
    },
    'leg-ejemplo': {
        claves: [
            ['Tres partes por norma', 'Identificación (tipo, número, año y artículo), contenido (qué establece, resumido) y relación (qué tiene que ver con tu estudio). Si falta la tercera, es solo una lista de leyes.'],
            ['Verbos según la norma', 'La Constitución «consagra» o «reconoce»; una ley «establece», «regula» o «crea»; un decreto «reglamenta»; una resolución «adopta» o «fija». Elegir bien el verbo da precisión al párrafo.'],
            ['La relación apunta a tu estudio', 'En el ejemplo, cada relación menciona algo propio del proyecto: la consulta, la inasistencia, los registros de citas. No basta escribir «porque habla de salud».'],
        ],
        ejemplo: '«La Ley 1620 de 2013 crea el Sistema Nacional de Convivencia Escolar. Se relaciona con el estudio porque este analiza situaciones de convivencia entre estudiantes de grado noveno de una institución educativa de Lorica».',
        ojo: 'No transcribas artículos completos. Dos o tres oraciones por norma bastan; si necesitas una frase literal, va entre comillas y con su artículo.',
    },

    /* Citas APA */
    'apa-texto': {
        claves: [
            ['Cuándo va la página', 'En la cita textual es obligatoria: p. 15, o pp. 15-16 si abarca dos páginas. En la paráfrasis no se exige, aunque puedes ponerla para ayudar al lector a ubicar la idea.'],
            ['Siglas y varias fuentes', 'Institución con sigla: completa la primera vez, (Organización Mundial de la Salud [OMS], 2023), y después (OMS, 2023). Varias fuentes en un mismo paréntesis: en orden alfabético y separadas por punto y coma.'],
            ['Cita de cita', 'Si leíste a un autor a través de otro, escribe (Rosenstock, 1974, como se citó en Pérez, 2022) y en las referencias incluye solo la fuente que leíste. Úsala poco: busca el original.'],
        ],
        ejemplo: 'Cita en bloque: el texto de 40 palabras o más va en párrafo aparte, con sangría de 1,27 cm en todo el bloque, sin comillas, y con la cita (Pérez, 2022, p. 15) después del punto final.',
        ojo: '«et al.» lleva punto solo después de «al» y se usa desde la primera cita cuando hay tres autores o más. No se escribe «et. al» ni «y otros».',
    },
    'apa-referencias': {
        claves: [
            ['Cita y referencia, una a una', 'Todo lo citado en el texto va en la lista, y en la lista solo va lo citado. Las comunicaciones personales son la excepción: se citan en el texto y no llevan referencia.'],
            ['Qué va en cursiva', 'En un libro o una tesis, el título. En un artículo, el nombre de la revista y el volumen, no el título del artículo. Los títulos llevan mayúscula solo en la primera palabra y en los nombres propios.'],
            ['Cambios de la séptima edición', 'Ya no se escribe la ciudad de la editorial ni «Recuperado de» antes del enlace. El DOI se presenta como dirección completa (https://doi.org/…), sin punto al final.'],
        ],
        ejemplo: 'Orden alfabético por el primer apellido: Díaz, M. (2023) va antes de Pérez, A. y Gómez, L. (2022). Dos obras del mismo autor y año se distinguen con letras, (Pérez, 2022a) y (Pérez, 2022b), en el texto y en la lista.',
        ojo: 'Los generadores automáticos de referencias fallan en mayúsculas, autores institucionales y normas. Revisa cada referencia contra el formato antes de entregar.',
    },
    'apa-plagio': {
        claves: [
            ['Cómo parafrasear', 'Lee el fragmento hasta entenderlo, cierra la fuente, escribe la idea como la explicarías tú y después compara. Si conservaste la estructura de la oración original, vuelve a escribirla.'],
            ['Formas de plagio', 'Copiar sin comillas ni cita, cambiar palabras por sinónimos, traducir un texto sin citarlo, presentar como propio un trabajo ajeno y reutilizar un trabajo tuyo anterior sin declararlo.'],
            ['Qué no necesita cita', 'El conocimiento general («Sincelejo es la capital de Sucre») y tus propias ideas o conclusiones. Los datos, las cifras, las definiciones y los resultados de otros siempre se citan.'],
        ],
        ejemplo: 'Original: «El uso del celular en clase se asoció con menor rendimiento en matemáticas». Paráfrasis: los estudiantes que más usaban el teléfono durante las clases obtuvieron notas más bajas en matemáticas (Rodríguez, 2022).',
        ojo: 'Un texto redactado con ayuda de inteligencia artificial no te libra de citar: verifica que cada fuente exista y que diga lo que el texto afirma.',
    },

    /* Calidad */
    errores: {
        claves: [
            ['Tres familias de errores', 'De fuentes (viejas, poco confiables o sin citar), de conexión (antecedentes, teorías o normas que no se relacionan con el estudio) y de foco (demasiadas teorías, contexto genérico, conceptos que no se usan).'],
            ['El más grave', 'Copiar sin citar no es un defecto de redacción, sino una falta de integridad académica que puede anular el trabajo. Los demás errores bajan la nota; este la compromete.'],
            ['Cómo revisar', 'Haz dos pasadas. En la primera, verifica que cada idea ajena tenga cita y que cada cita esté en la lista. En la segunda, que cada apartado termine conectando con tu estudio.'],
        ],
        ejemplo: 'Solo enumerado: «Pérez y Gómez (2022) estudiaron la inasistencia en Bogotá». Corregido: añade qué encontraron (el olvido explicó el 41 %) y qué aporta (el cuestionario que adaptarás al hospital de Sincelejo).',
        ojo: 'Pídele a un compañero que lea tu marco y te diga de qué trata tu proyecto. Si no puede deducirlo, el marco no está conectado con el estudio.',
    },
    coherencia: {
        claves: [
            ['El marco y el proyecto', 'Las variables de tus objetivos deben aparecer en los antecedentes, estar explicadas por la teoría y definidas en el Marco Conceptual. La población del título debe ser la del Marco Contextual.'],
            ['Si cambia el título', 'Es común ajustar el título o los objetivos durante el proceso. Cada cambio obliga a revisar qué antecedentes, conceptos y normas siguen siendo pertinentes y cuáles sobran.'],
            ['Coherencia entre apartados', 'La teoría que presentas debería ser la que usan algunos de tus antecedentes, y sus componentes deberían estar entre tus conceptos. Si cada apartado va por su lado, parecen textos de proyectos distintos.'],
        ],
        ejemplo: 'Título: factores asociados a la inasistencia a citas en consulta externa. Antecedentes sobre inasistencia; modelo de creencias en salud con sus barreras; «barrera de acceso» definida; hospital de Sincelejo descrito; Ley 1751 de 2015 sobre oportunidad. Todo apunta a lo mismo.',
        ojo: 'Si una pregunta de control se responde con «más o menos», ese apartado necesita ajuste antes de pasar a la metodología.',
    },
};
