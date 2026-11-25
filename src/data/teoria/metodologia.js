// Teoría ampliada de la clase «Metodología»: una entrada por diapositiva de teoría (ver components/deck/Teoria.jsx).
export default {
    /* Apertura */
    quees: {
        claves: [
            ['Responde al «cómo»', 'El planteamiento dice qué estudias y la justificación, por qué; la metodología dice **cómo**. Un lector debe poder repetir tu estudio solo con leer este capítulo: esa es la prueba de que está completo.'],
            ['Se redacta en futuro', 'En el anteproyecto todavía no has recogido datos: escribe «se aplicará», «se seleccionará». En el informe final, el mismo texto pasa a pasado y se ajusta a lo que realmente ocurrió.'],
            ['Cada decisión se justifica', 'No basta con nombrar el enfoque o el diseño. Cada subtítulo dice qué elegiste y **por qué** esa opción responde a tus objetivos, con apoyo en un autor de metodología.'],
        ],
        ejemplo: 'Incompleto: «El estudio es cuantitativo». Completo: «El estudio es cuantitativo porque busca medir la frecuencia de la inasistencia a citas y su relación con la edad en pacientes de consulta externa, mediante datos numéricos y análisis estadístico».',
        ojo: 'No copies definiciones de manual. Media página sobre qué es el enfoque cuantitativo no dice nada de tu estudio: define en una línea y aplica a tu caso.',
    },
    ruta: {
        claves: [
            ['El verbo decide', '«Describir» o «caracterizar» piden estadística descriptiva; «relacionar», una prueba de asociación; «comparar», una prueba de diferencias; «comprender», entrevistas y codificación. Lee el verbo de cada objetivo antes de elegir el método.'],
            ['Un método por objetivo', 'Los objetivos específicos pueden necesitar técnicas distintas: uno se responde con registros y otro con una encuesta. Lo que no cambia es el enfoque y el diseño generales, que cubren todo el estudio.'],
            ['Ruta en ambos sentidos', 'Si al planear el método descubres que un objetivo no se puede lograr (no hay acceso, no hay instrumento), se ajusta el objetivo. Método y objetivos se corrigen juntos hasta que encajen.'],
        ],
        ejemplo: 'Objetivo: «Caracterizar la inasistencia a citas según edad y régimen de salud». Método: revisión documental del sistema de citas, ficha de registro, frecuencias y porcentajes. No hace falta encuesta: el dato ya existe en los registros.',
        ojo: 'Si tu metodología incluye una técnica que no responde a ningún objetivo, estás recogiendo datos que no vas a usar. Quítala o agrega el objetivo.',
    },

    /* Enfoque */
    'enf-quees': {
        claves: [
            ['Qué es un paradigma', 'Es la idea de fondo sobre qué es la realidad y cómo se conoce. El positivista supone una realidad medible desde afuera; el interpretativo, que la realidad se construye en los significados de las personas.'],
            ['El enfoque se deriva', 'No se elige por gusto ni por miedo a la estadística: sale de la pregunta de investigación. Preguntas de cuánto y de relación son cuantitativas; preguntas de cómo se vive o qué significa, cualitativas.'],
            ['Ordena todo lo demás', 'Del enfoque dependen el diseño, el tipo de muestra, los instrumentos y el análisis. Por eso es el primer subtítulo: una vez declarado, las demás decisiones deben ser del mismo enfoque.'],
        ],
        ejemplo: 'Mismo tema, dos enfoques. Cuantitativo: «¿Qué relación hay entre la edad y la inasistencia a citas?». Cualitativo: «¿Cómo explican los pacientes que faltan a sus citas las razones de su inasistencia?». La pregunta define el enfoque.',
        ojo: 'Ningún enfoque es más riguroso que otro. El cualitativo no es «más fácil»: transcribir y codificar entrevistas toma tanto tiempo como un análisis estadístico.',
    },
    'enf-cuanti': {
        claves: [
            ['Proceso secuencial y deductivo', 'Va de lo general a lo particular: parte de la teoría, deriva hipótesis, mide y contrasta. Las etapas siguen un orden fijo y el instrumento se define **antes** de recoger los datos.'],
            ['Variables operacionalizadas', 'Todo concepto se convierte en algo medible: la variable se define, se descompone en dimensiones e indicadores, y cada indicador se vuelve una pregunta del instrumento. Lo que no se operacionaliza no se puede medir.'],
            ['Generalizar exige representatividad', 'Los resultados se extienden a la población solo si la muestra se eligió al azar y tiene tamaño suficiente. Con una muestra por conveniencia, las conclusiones valen para el grupo estudiado.'],
        ],
        ejemplo: 'Variable «inasistencia»: número de citas programadas a las que el paciente no asistió en los últimos seis meses, tomado del sistema de citas. Hipótesis: «La inasistencia es mayor en los pacientes que viven en zona rural».',
        ojo: 'No todo estudio cuantitativo lleva hipótesis: los descriptivos solo la formulan cuando pronostican un dato. Los correlacionales y los explicativos sí la necesitan.',
    },
    'enf-cuali': {
        claves: [
            ['Proceso inductivo y flexible', 'Va de los datos a las ideas: no parte de hipótesis para probar, sino que las construye al analizar. La pregunta, la muestra y la guía de entrevista pueden ajustarse durante el trabajo de campo.'],
            ['El investigador es el instrumento', 'Quien entrevista y observa también interpreta. Por eso se declara la propia postura frente al tema y se lleva un diario de campo: esa **reflexividad** hace transparente el proceso.'],
            ['Rigor con otros criterios', 'En lugar de validez y confiabilidad estadísticas se habla de **credibilidad** (los participantes se reconocen en los resultados) y **transferibilidad** (el contexto está tan bien descrito que otros juzgan si aplica al suyo).'],
        ],
        ejemplo: 'Se entrevista a 12 pacientes que faltaron a tres o más citas. Al analizar aparece una categoría no prevista, «pena de pedir permiso en el trabajo», y se añade una pregunta sobre ese tema para las entrevistas siguientes.',
        ojo: 'No presentes resultados cualitativos con porcentajes («el 60 % de los entrevistados dijo…»). Con 12 participantes el porcentaje no significa nada: muestra las categorías y las citas textuales.',
    },
    'enf-mixto': {
        claves: [
            ['Cuándo vale la pena', 'Cuando un solo tipo de dato deja la pregunta a medias: los números muestran cuánto y con qué se asocia, pero no por qué; las entrevistas explican, pero no dicen qué tan frecuente es.'],
            ['La integración es obligatoria', 'Un estudio mixto no son dos estudios pegados. Hay un momento, declarado en el método, en que los resultados se **comparan o se conectan**: uno explica, amplía o contrasta al otro.'],
            ['Cuesta el doble', 'Requiere dos muestras, dos instrumentos, dos análisis y competencias en ambos enfoques. En un trabajo de grado de un semestre conviene solo si el equipo y el tiempo lo permiten.'],
        ],
        ejemplo: 'La encuesta muestra que el olvido es la causa más reportada de inasistencia. Las entrevistas revelan que «olvido» incluye no haber recibido la fecha por escrito. Al integrar: el problema es de información, no de memoria del paciente.',
        ojo: 'Agregar dos preguntas abiertas al final de un cuestionario no convierte el estudio en mixto. Hace falta una fase cualitativa con su propia muestra y su propio análisis.',
    },
    'enf-comparar': {
        claves: [
            ['Papel de la teoría', 'En lo cuantitativo, la teoría va primero: de ella salen las variables y las hipótesis. En lo cualitativo orienta la mirada, pero no la encierra: las categorías pueden surgir de los datos.'],
            ['Relación con los participantes', 'El cuantitativo busca distancia para no influir en las respuestas: mismo cuestionario, mismas instrucciones. El cualitativo busca cercanía y confianza, porque sin ellas nadie cuenta su experiencia.'],
            ['Cómo se escriben los resultados', 'Los cuantitativos se presentan en tablas, gráficos y pruebas estadísticas. Los cualitativos, en categorías sustentadas con fragmentos textuales de los participantes, identificados con un código para proteger su identidad.'],
        ],
        ejemplo: 'Resultado cuantitativo: «El 59 % de los pacientes perdió al menos una cita en el semestre». Resultado cualitativo: «Barreras económicas: “Si pago el bus para ir al hospital, ese día no almuerzo” (P7, mujer, zona rural)».',
        ojo: 'Revisa todos tus objetivos, no solo el general. Si uno dice «medir» y otro «comprender», o el estudio es mixto o uno de los dos verbos está mal elegido.',
    },

    /* Tipos */
    'tip-exploratoria': {
        claves: [
            ['Cómo saber si es exploratoria', 'Lo decide la revisión de antecedentes: si tras buscar en bases de datos solo hay estudios de otros contextos o de temas vecinos, el alcance es exploratorio. Esa búsqueda se documenta en el proyecto.'],
            ['No lleva hipótesis', 'Como no hay conocimiento previo suficiente, no se puede anticipar un resultado. Las hipótesis son el **producto** del estudio: lo que deja planteado para que otros lo comprueben.'],
            ['Prepara el siguiente estudio', 'Sus resultados sirven para identificar variables, afinar conceptos y construir instrumentos. Por eso suele ser la primera fase de un proyecto más grande, o un estudio breve con pocos participantes.'],
        ],
        ejemplo: 'No se encuentran estudios sobre inasistencia a citas por teleconsulta en hospitales de Sucre. Se entrevista a ocho pacientes y a tres médicos para identificar qué factores intervienen; con ellos se construirá después un cuestionario.',
        ojo: 'Que tú no conozcas el tema no lo hace exploratorio. Si existen estudios en poblaciones parecidas, tu alcance es al menos descriptivo.',
    },
    'tip-descriptiva': {
        claves: [
            ['Mide variables por separado', 'Cada variable se mide y se reporta de forma independiente: cuántos, con qué frecuencia, con qué características. Si las cruzas con una prueba estadística para ver si se relacionan, el alcance ya es correlacional.'],
            ['La precisión es su valor', 'Una buena descripción exige definir bien qué se mide, en quiénes y cuándo. Un perfil exacto de la población es la base para tomar decisiones y el punto de partida de estudios posteriores.'],
            ['También hay descripción cualitativa', 'Describir no es solo contar. Un estudio cualitativo descriptivo detalla cómo ocurre un proceso o cómo es una práctica, con palabras de los participantes y sin pretender explicarlo con una teoría.'],
        ],
        ejemplo: '«El 62 % de los pacientes que faltaron a su cita son mujeres, la edad media es de 47 años y la especialidad con más inasistencia es medicina interna». Tres datos, tres variables, ninguna relación entre ellas.',
        ojo: 'Un estudio descriptivo no concluye causas. Si encuentras que faltan más los pacientes rurales, puedes reportarlo, pero no afirmar que vivir lejos provoca la inasistencia.',
    },
    'tip-correlacional': {
        claves: [
            ['Sentido y fuerza', 'El coeficiente va de −1 a +1. El signo indica el sentido: positivo si ambas variables suben juntas, negativo si una sube y la otra baja. Cuanto más se acerca a 0, más débil es la relación.'],
            ['Correlación no es causalidad', 'Que dos variables se muevan juntas no prueba que una cause la otra: puede haber una **tercera variable** detrás de ambas, o la dirección puede ser la contraria a la que supones.'],
            ['Lleva hipótesis', 'Se formula una hipótesis de relación entre las variables y se contrasta con una prueba estadística. También permite cierta predicción: conocer el valor de una variable ayuda a estimar el de la otra.'],
        ],
        ejemplo: 'Se encuentra una relación positiva entre la distancia al hospital y el número de citas perdidas. Redacción correcta: «a mayor distancia, mayor inasistencia». Incorrecta: «la distancia causa la inasistencia»; quizá ambas dependen del ingreso del hogar.',
        ojo: 'Las dos variables se miden en las **mismas personas**. Si mides el uso del celular en un grupo y el rendimiento en otro, no hay nada que correlacionar.',
    },
    'tip-explicativa': {
        claves: [
            ['Tres condiciones de la causalidad', 'Para afirmar que X causa Y se necesita que ambas estén asociadas, que X ocurra **antes** que Y y que se hayan descartado otras explicaciones. La tercera condición es la más difícil de cumplir.'],
            ['Qué diseños la sostienen', 'El experimento es el camino más sólido, porque controla las otras explicaciones. Sin experimento se usan modelos de regresión con varias variables, que estiman el peso de cada factor manteniendo constantes los demás.'],
            ['Es el alcance más exigente', 'Requiere teoría sólida, más variables, muestras mayores y análisis multivariado. No es «mejor» que los otros alcances: es el adecuado solo cuando ya existen descripciones y correlaciones previas sobre el tema.'],
        ],
        ejemplo: 'Una regresión logística con la reprobación en primer semestre como resultado y, como factores, el puntaje de ingreso, las horas de trabajo semanal y la asistencia a tutorías muestra cuáles predicen reprobar cuando se controlan los demás.',
        ojo: 'No declares tu estudio «explicativo» para que parezca más importante. Si tus objetivos solo describen o relacionan, el evaluador verá la incoherencia de inmediato.',
    },
    'tip-otras': {
        claves: [
            ['Evaluar exige comparar', 'Para valorar un programa se necesita un punto de referencia: la situación **antes** de la intervención, un grupo que no la recibió o una meta fijada. Sin comparación solo describes lo que pasó.'],
            ['La propuesta nace del diagnóstico', 'En la investigación propositiva, cada componente de la propuesta responde a un hallazgo del diagnóstico. El estudio llega hasta diseñarla y, si acaso, validarla con expertos; implementarla es otro proyecto.'],
            ['Se combinan con el alcance', 'No reemplazan la clasificación por alcance: una evaluación puede ser descriptiva o explicativa, y una propositiva empieza con una fase descriptiva. Declara ambas cosas si el formato de tu programa lo pide.'],
        ],
        ejemplo: 'Evaluativa: comparar el porcentaje de citas perdidas en los tres meses anteriores y los tres posteriores al inicio de los recordatorios por WhatsApp. Propositiva: diagnosticar las causas y diseñar un protocolo de recordatorios validado por tres expertos.',
        ojo: 'Si tu último objetivo es «implementar» o «evaluar el impacto» de la propuesta, necesitas tiempo para aplicarla y medir. En un semestre casi nunca alcanza: déjalo en «diseñar».',
    },
    'tip-clasificaciones': {
        claves: [
            ['Criterios independientes', 'Cada clasificación responde a una pregunta distinta, así que un mismo estudio recibe una etiqueta por criterio. No se elige una sola: se combinan para describir el estudio completo.'],
            ['Datos primarios y secundarios', 'En la investigación de campo recoges tú los datos (primarios). En la documental usas datos que otros produjeron (secundarios): registros, bases de datos, historias. Los secundarios ahorran tiempo, pero no controlas su calidad.'],
            ['Básica o aplicada', 'Casi todos los trabajos de grado son investigación aplicada: parten de un problema concreto de una institución o una comunidad. La básica busca ampliar la teoría sin un uso inmediato.'],
        ],
        ejemplo: 'El estudio de inasistencia a citas es aplicado (atiende un problema del hospital), de campo (encuesta a pacientes), transversal (una sola medición) y no experimental (no se interviene). Cuatro criterios, cuatro etiquetas compatibles.',
        ojo: 'Menciona solo las clasificaciones que aclaren tu estudio. Una lista de ocho etiquetas sin explicar ninguna no aporta rigor.',
    },

    /* Diseños */
    'dis-experimental': {
        claves: [
            ['Validez interna', 'Es la confianza en que el cambio observado se debe a la intervención y no a otra cosa. La **asignación al azar** la protege: reparte por igual entre los grupos las características que no controlas.'],
            ['Tres requisitos', 'Un experimento «puro» exige manipular la variable independiente, medir su efecto en la dependiente y controlar la situación con grupos equivalentes. Si falta la equivalencia inicial de los grupos, ya no es un experimento puro.'],
            ['El costo: validez externa', 'Controlar tanto la situación la aleja de la vida real, y los resultados pueden no repetirse fuera del estudio. Además, asignar un tratamiento al azar exige el aval de un comité de ética.'],
        ],
        ejemplo: 'De 200 pacientes con cita programada, se sortean 100 que reciben un recordatorio por mensaje de texto dos días antes y 100 que no. Al final del mes se compara el porcentaje de asistencia de ambos grupos.',
        ojo: 'Elegir la muestra al azar y asignar al azar son cosas distintas: lo primero define quiénes entran al estudio; lo segundo, a qué grupo va cada uno.',
    },
    'dis-cuasi': {
        claves: [
            ['El riesgo: grupos no equivalentes', 'Como los grupos ya existían, pueden diferir desde antes en algo que afecte el resultado. Cualquier diferencia final podría deberse a esa desigualdad inicial y no a la intervención.'],
            ['La preprueba es la defensa', 'Medir a ambos grupos **antes** de intervenir permite comprobar si partían de un nivel parecido y comparar cuánto cambió cada uno, en lugar de comparar solo el resultado final.'],
            ['Elegir grupos parecidos', 'Busca grupos lo más semejantes posible: misma institución, mismo nivel, misma jornada, características similares. Y descríbelos en el método, para que el lector juzgue qué tan comparables eran.'],
        ],
        ejemplo: 'Dos grupos de primer semestre de la misma carrera: uno recibe tutorías de cálculo y el otro no. Se aplica la misma prueba diagnóstica al inicio y se compara el avance de cada grupo al final del semestre.',
        ojo: 'Un solo grupo medido antes y después, sin grupo de comparación, es un preexperimento: el cambio pudo ocurrir de todos modos. Preséntalo con esa limitación.',
    },
    'dis-noexp': {
        claves: [
            ['Por qué es el más usado', 'Muchas variables no se pueden o no se deben manipular: la edad, el ingreso, una enfermedad. Además no exige intervenir ni controlar grupos, así que cabe en el tiempo de un trabajo de grado.'],
            ['Tipos de estudio longitudinal', 'Los de tendencia miden la misma población en varios momentos con muestras distintas; los de cohorte siguen a un subgrupo definido por una característica o evento común; los de panel miden a las mismas personas cada vez.'],
            ['Límite del transversal', 'Al medir todo en un solo momento no sabes qué ocurrió primero. Puedes mostrar que dos variables se asocian, pero no que una antecede a la otra, y sin eso no hay causalidad.'],
        ],
        ejemplo: 'Transversal: encuestar una sola vez, en marzo, a 278 pacientes sobre sus citas perdidas. Longitudinal de panel: registrar la asistencia de esos mismos pacientes en marzo, junio y septiembre para ver si cambia.',
        ojo: 'Declara el diseño completo: «no experimental, transversal, de alcance correlacional». Decir solo «no experimental» deja sin responder cuántas veces se mide.',
    },
    'dis-cuali': {
        claves: [
            ['Elige por lo que quieres comprender', 'La experiencia vivida de un fenómeno pide fenomenología; la cultura de un grupo, etnografía; un proceso que quieres explicar, teoría fundamentada; un caso singular, estudio de caso; una vida en el tiempo, diseño narrativo.'],
            ['Cada diseño tiene su técnica central', 'La fenomenología se apoya en entrevistas en profundidad; la etnografía, en observación participante prolongada; el estudio de caso combina varias fuentes sobre el mismo caso; la teoría fundamentada alterna recolección y análisis.'],
            ['Investigación-acción: otra lógica', 'Aquí el propósito no es solo comprender, sino **cambiar** una situación junto con quienes la viven. Avanza en ciclos de diagnóstico, plan, acción y reflexión, y los participantes toman parte en las decisiones.'],
        ],
        ejemplo: 'Para comprender cómo viven los pacientes el hecho de perder sus citas, un diseño fenomenológico con entrevistas. Para analizar cómo gestiona las citas una sede concreta del hospital, un estudio de caso con entrevistas, observación y documentos.',
        ojo: 'No pongas «fenomenológico» solo porque vas a hacer entrevistas. La entrevista es una técnica que usan casi todos los diseños; lo que define el diseño es tu propósito.',
    },
    'dis-mixtos': {
        claves: [
            ['Tiempo y prioridad', 'Dos decisiones definen el diseño: si las fases van una tras otra o en paralelo, y cuál enfoque pesa más. Las mayúsculas marcan la prioridad: en «CUAN → cual» domina lo cuantitativo.'],
            ['Dónde ocurre la integración', 'En los secuenciales, la primera fase **construye** la segunda: sus resultados definen a quién entrevistar o qué preguntar. En el convergente, los datos se analizan por separado y los resultados se comparan al final.'],
            ['Cuál elegir', 'Explicativo secuencial si esperas resultados numéricos que necesitarán explicación. Exploratorio secuencial si no existe un instrumento para tu población. Convergente si quieres contrastar dos miradas y solo tienes un periodo de recolección.'],
        ],
        ejemplo: 'Explicativo secuencial: tras la encuesta a 278 pacientes, se eligen para entrevista 12 de quienes perdieron tres o más citas. La selección de los entrevistados depende de los resultados de la primera fase: ahí se conectan.',
        ojo: 'Un diseño secuencial suma los tiempos de dos estudios. Si tu cronograma tiene un solo mes de recolección, el convergente es el único que cabe.',
    },
    'dis-elegir': {
        claves: [
            ['Ya lo decidiste antes', 'El diseño no se escoge desde cero: el enfoque y el alcance lo acotan. Un alcance descriptivo o correlacional dentro del enfoque cuantitativo casi siempre lleva a un diseño no experimental transversal.'],
            ['Lo ideal y lo posible', 'El objetivo dice qué diseño sería el mejor; el tiempo, el acceso y la ética dicen cuál se puede hacer. Si no coinciden, elige el viable y declara la diferencia como limitación.'],
            ['Justifícalo en una oración', 'La redacción completa nombra el diseño y da la razón: qué harás con las variables y cuántas veces medirás. La definición se respalda con un autor de metodología.'],
        ],
        ejemplo: '«El diseño es no experimental, de corte transversal: no se manipulan las variables, sino que se observan tal como ocurren en los pacientes de consulta externa, y los datos se recogen en un solo momento».',
        ojo: 'Si no vas a aplicar ninguna intervención, tu diseño no es experimental ni cuasiexperimental, aunque compares grupos. Comparar hombres y mujeres es no experimental.',
    },

    /* Población y muestra */
    'pob-def': {
        claves: [
            ['Población objetivo y accesible', 'La población objetivo es a quién quieres referirte; la accesible, a quién puedes llegar realmente. Los resultados se generalizan a la **accesible**, así que esa es la que debes delimitar y cuantificar.'],
            ['Delimitar en tres dimensiones', 'Una población bien definida dice quiénes son (características), dónde están (lugar o institución) y cuándo (periodo). Con esos tres datos cualquiera puede decidir si una persona pertenece o no.'],
            ['El marco muestral', 'Es la lista real de donde se sortea. Si está incompleta o desactualizada, quienes faltan en ella no pueden salir elegidos y la muestra deja de representar a la población.'],
        ],
        ejemplo: 'Población objetivo: los usuarios de consulta externa del hospital. Población accesible: quienes tienen cita registrada en el sistema durante el semestre. Si el sistema omite las citas asignadas por teléfono, esos pacientes quedan fuera del marco muestral.',
        ojo: 'Averigua el tamaño de la población con una fuente (la oficina de estadística, la secretaría académica). Sin ese número no puedes calcular la muestra.',
    },
    'pob-criterios': {
        claves: [
            ['Unidad de análisis y de observación', 'La unidad de análisis es sobre quién concluyes; la de observación, quién te da el dato. Pueden diferir: si estudias a niños y responde el acudiente, el niño sigue siendo la unidad de análisis.'],
            ['Exclusión no es el reverso', 'Los criterios de exclusión se aplican a quienes **ya cumplen** los de inclusión, pero tienen una condición que impide participar o altera el dato. «Menores de 18» no es exclusión si incluiste «mayores de 18».'],
            ['Criterios verificables', 'Cada criterio debe poder comprobarse antes de aplicar el instrumento, con un registro o una pregunta filtro. «Pacientes comprometidos con su salud» no se puede verificar; «con dos o más citas en el semestre», sí.'],
        ],
        ejemplo: 'Inclusión: pacientes mayores de 18 años con al menos una cita de consulta externa en el semestre. Exclusión: pacientes con una condición que les impida responder el cuestionario por sí mismos, o que no firmen el consentimiento informado.',
        ojo: 'Cada criterio que agregas reduce la población. Vuelve a contar cuántos quedan después de aplicarlos: ese es el N que va a la fórmula.',
    },
    muestra: {
        claves: [
            ['La fórmula', 'Para estimar una proporción en una población finita: **n = N·Z²·p·q / (e²·(N−1) + Z²·p·q)**. N es la población; Z, el valor de la confianza (1,96 para 95 %); e, el error en decimales (0,05).'],
            ['Por qué p = q = 0,5', 'p es la proporción esperada de la característica y q, su complemento (1 − p). Cuando no se conoce, se usa 0,5 en ambas porque ese valor da la muestra **más grande**: es la opción prudente.'],
            ['No crece como la población', 'En poblaciones grandes la muestra se estabiliza: con 95 % de confianza y 5 % de error nunca pasa de 385. En las pequeñas ocurre lo contrario: para 50 personas se necesitan 45.'],
        ],
        ejemplo: 'Con N = 1.000, Z = 1,96, p = q = 0,5 y e = 0,05: n = 960,4 / 3,4579 = 277,7, que se redondea hacia arriba a **278** pacientes. Con un error del 3 %, la muestra sube a 517.',
        ojo: 'Agrega un margen por quienes no respondan. Si esperas 10 % de pérdidas, divide la muestra entre 0,90: 278 pasa a 309 personas por contactar.',
    },
    'pob-probabilistico': {
        claves: [
            ['Cómo elegir entre los cuatro', 'Con lista completa y población homogénea, aleatorio simple o sistemático. Si hay subgrupos que deben quedar representados, estratificado. Si no hay lista de personas pero sí de grupos, por conglomerados.'],
            ['El tamaño se calcula igual', 'La fórmula da el n total; el tipo de muestreo define **cómo se reparte y se sortea**. En el estratificado proporcional, cada estrato recibe una parte de la muestra igual a su peso en la población.'],
            ['El azar se documenta', 'En el método se dice con qué se sorteó: una función de números aleatorios en Excel, un generador en línea o el intervalo k. «Se eligieron al azar», sin procedimiento, no convence.'],
        ],
        ejemplo: 'De 1.000 pacientes, 600 son del régimen subsidiado (60 %) y 400 del contributivo (40 %). La muestra de 278 se reparte en 167 y 111, y dentro de cada régimen se sortean los pacientes de la lista.',
        ojo: 'Encuestar «al que pase» no es aleatorio. Aleatorio significa que un sorteo decide quién entra, no el encuestador ni la disposición de las personas.',
    },
    'pob-noprob': {
        claves: [
            ['Cuándo es la opción correcta', 'En estudios cualitativos, donde importa la riqueza de cada caso y no la representatividad; cuando no existe una lista de la población; y en pruebas piloto o estudios exploratorios.'],
            ['Cómo se justifica', 'La justificación tiene tres partes: por qué no es posible o pertinente un sorteo, con qué criterios se eligen los participantes y cuántos se prevén. Con eso la muestra queda sustentada sin fórmula.'],
            ['El censo es un caso aparte', 'No es propiamente un muestreo: se estudia a todos, así que no hay error de muestreo. Lo que debes reportar es la **tasa de respuesta**, porque quienes no contestan pueden ser distintos de quienes sí.'],
        ],
        ejemplo: '«Se usará un muestreo por conveniencia, dado que no se cuenta con un listado de los acompañantes de los pacientes. Participarán quienes estén en la sala de espera durante dos semanas y cumplan los criterios de inclusión».',
        ojo: 'Con un muestreo no probabilístico no escribas «los pacientes del hospital opinan…». Escribe «los pacientes encuestados»: tus resultados describen a ese grupo.',
    },
    'pob-cuali': {
        claves: [
            ['Cómo se reconoce la saturación', 'Cuando las últimas entrevistas repiten lo que dijeron las anteriores y ya no surgen códigos nuevos. Solo se nota si analizas **mientras** recoges: quien codifica todo al final no sabe cuándo parar.'],
            ['Muestreo teórico', 'En la teoría fundamentada, los participantes siguientes se eligen según lo que va apareciendo en el análisis: se busca a quien pueda confirmar, ampliar o contradecir una categoría en construcción.'],
            ['Variedad antes que cantidad', 'Importa más la diversidad de perfiles que el número. Incluir a propósito casos distintos (edad, zona, tiempo con la condición) muestra el fenómeno desde varios ángulos y hace más creíbles los resultados.'],
        ],
        ejemplo: 'Se prevén entre 10 y 15 entrevistas a pacientes que perdieron tres o más citas, de zona urbana y rural. Si las entrevistas 11 y 12 no aportan códigos nuevos, se detiene la recolección y se informa que se alcanzó la saturación.',
        ojo: 'En el anteproyecto no puedes saber el número exacto. Da un rango estimado y declara que el criterio de cierre es la saturación.',
    },
    'pob-ejemplo': {
        claves: [
            ['Orden del párrafo', 'La secuencia es fija: población con su tamaño, lugar y periodo; unidad de análisis; criterios de inclusión y exclusión; tipo de muestreo; tamaño de la muestra con sus parámetros; y forma de seleccionar a los participantes.'],
            ['Parámetros a la vista', 'Quien lee debe poder **rehacer el cálculo**: indica el tamaño de la población, el nivel de confianza, el margen de error y la proporción usada. Si aplicaste un ajuste por pérdidas, también.'],
            ['Fuente del dato poblacional', 'El tamaño de la población necesita respaldo: di de dónde salió (sistema de citas, registro académico, oficina de estadística) y de qué fecha es. Un número sin fuente parece inventado.'],
        ],
        ejemplo: 'Otro caso: «La población son los 640 estudiantes matriculados en primer semestre, según la oficina de registro académico. Con 95 % de confianza, 5 % de error y p = 0,5, la muestra es de 241 estudiantes, seleccionados por muestreo aleatorio simple».',
        ojo: 'Si usaste un muestreo no probabilístico, no escribas confianza ni margen de error: esos parámetros solo tienen sentido cuando la muestra se sortea.',
    },

    /* Instrumentos */
    'ins-quees': {
        claves: [
            ['El instrumento sale de las variables', 'No se empieza escribiendo preguntas. Se parte de la tabla de operacionalización: cada variable tiene dimensiones, cada dimensión tiene indicadores y cada indicador se convierte en uno o más ítems. Así no sobra ni falta nada.'],
            ['Fuentes primarias y secundarias', 'Encuesta, entrevista, observación y grupo focal producen datos nuevos. La revisión documental usa datos que ya existen: es más rápida, pero dependes de cómo los registró otra persona.'],
            ['Buscar antes de construir', 'Antes de diseñar un cuestionario, revisa si tus antecedentes usaron uno ya validado para la misma variable. Adaptarlo es más rápido y más defendible que crear uno desde cero.'],
        ],
        ejemplo: 'Variable «barreras de acceso», dimensión «económica», indicador «costo del transporte», ítem: «El costo del transporte me impide asistir a mis citas». Técnica: encuesta. Instrumento: cuestionario. Cada ítem se puede rastrear hasta su variable.',
        ojo: 'En el método se nombran los dos: «se aplicará la técnica de la encuesta mediante un cuestionario de 20 ítems». El instrumento completo va en los anexos.',
    },
    'ins-cuestionario': {
        claves: [
            ['Errores de redacción', 'Evita la pregunta doble («¿el trato y la puntualidad fueron buenos?»), la que induce la respuesta («¿no cree que…?»), las negaciones y los términos técnicos. Cada ítem pregunta una sola cosa en el lenguaje del encuestado.'],
            ['Opciones completas y excluyentes', 'En las preguntas cerradas, toda persona debe encontrar su respuesta, y solo una. Revisa que los rangos no se crucen («18 a 30» y «30 a 45») y agrega «otro» o «no aplica» si hace falta.'],
            ['Cómo funciona una escala Likert', 'Varias afirmaciones sobre la misma variable se responden con los mismos puntos, normalmente cinco. Las respuestas se suman o se promedian para obtener un puntaje; un ítem suelto es ordinal y dice poco.'],
        ],
        ejemplo: 'Pregunta doble: «¿Recibió el recordatorio y le pareció útil?». Corregida en dos: «¿Recibió un recordatorio de su última cita? ( ) Sí ( ) No» y «El recordatorio me resultó útil», con escala de acuerdo de cinco puntos.',
        ojo: 'Un cuestionario largo se responde mal. Si un ítem no corresponde a ningún indicador de tus variables, elimínalo: cada pregunta de más aumenta los abandonos.',
    },
    'ins-entrevista': {
        claves: [
            ['Tres grados de estructura', 'La estructurada sigue un guion fijo; la semiestructurada tiene temas y preguntas base que se amplían; la abierta parte de una pregunta general. La semiestructurada es la más usada porque permite comparar sin perder profundidad.'],
            ['Preguntar para que narren', 'Las buenas preguntas piden relatos: «cuénteme», «cómo fue». Evita las que se responden con sí o no y los «¿por qué?» seguidos, que ponen a la persona a justificarse. Luego profundiza: «¿puede darme un ejemplo?».'],
            ['Grupo focal: interesa la interacción', 'No es una entrevista a varios a la vez. Sirve para ver cómo un grupo discute, coincide o difiere sobre un tema. Requiere un moderador, alguien que tome notas y participantes de perfil parecido.'],
        ],
        ejemplo: 'En vez de «¿Por qué no asiste a sus citas?», que suena a reproche, la guía pregunta: «Cuénteme qué pasó el día de la última cita a la que no pudo ir». La persona narra y las razones aparecen solas.',
        ojo: 'Graba solo con autorización expresa del participante y transcribe literalmente. Las notas tomadas de memoria pierden justo las palabras exactas que después necesitas citar.',
    },
    'ins-observacion': {
        claves: [
            ['Participante o no participante', 'En la observación participante te integras a la actividad del grupo; en la no participante miras sin intervenir. La primera es propia de la etnografía; la segunda, de estudios que registran conductas concretas.'],
            ['Estructurada o abierta', 'La estructurada usa una lista de chequeo con conductas definidas de antemano y produce datos cuantificables. La abierta usa un diario de campo donde se describe lo que ocurre, y se analiza cualitativamente.'],
            ['Calidad de los registros', 'En la revisión documental trabajas con datos que no recogiste. Antes de usarlos revisa cómo se registraron, si hay campos vacíos o duplicados y si la definición de cada dato coincide con la de tu variable.'],
        ],
        ejemplo: 'La ficha de registro toma del sistema de citas la fecha, la especialidad, la edad, el régimen y si el paciente asistió. Antes de analizar se descubre que las citas reprogramadas figuran como inasistencia: hay que separarlas.',
        ojo: 'Para acceder a historias clínicas o bases institucionales necesitas autorización escrita de la institución, y debes extraer los datos sin nombres ni documentos de identidad.',
    },
    'ins-validez': {
        claves: [
            ['Tipos de validez', 'La de contenido revisa que los ítems cubran toda la variable (juicio de expertos). La de constructo, que midan el concepto teórico y no otra cosa. La de criterio, que coincidan con otra medida reconocida.'],
            ['Confiable no es válido', 'Un instrumento puede dar siempre el mismo resultado y medir lo que no es, como una balanza descalibrada. La confiabilidad es condición necesaria de la validez, pero no la garantiza.'],
            ['Cuándo aplica el alfa', 'El alfa de Cronbach solo sirve para escalas de varios ítems que miden la misma variable, como una escala Likert. No se calcula sobre preguntas sueltas, datos sociodemográficos ni guías de entrevista.'],
        ],
        ejemplo: 'Tres expertos califican la pertinencia y la claridad de cada ítem, y se corrigen los observados. La escala «barreras de acceso», de ocho ítems, se aplica en una prueba piloto y obtiene un alfa de 0,82: supera el mínimo de 0,70.',
        ojo: 'Un instrumento validado en otro país o en otra población no queda validado para la tuya. Si lo adaptas, haz al menos juicio de expertos y prueba piloto.',
    },
    'ins-etica': {
        claves: [
            ['Niveles de riesgo', 'La Resolución 8430 distingue investigación sin riesgo, con riesgo mínimo y con riesgo mayor que el mínimo. Un estudio con cuestionarios o revisión de registros, sin intervención y sin tratar aspectos sensibles de la conducta, suele quedar sin riesgo.'],
            ['Qué debe decir el consentimiento', 'El propósito del estudio, qué se le pide al participante y cuánto tiempo toma, los riesgos y beneficios, que es voluntario y puede retirarse, cómo se protegen sus datos y a quién contactar si tiene dudas.'],
            ['Datos sensibles', 'La Ley 1581 considera sensibles, entre otros, los datos relativos a la salud. Tratarlos exige la autorización expresa del titular, informarle para qué se usarán y no emplearlos con otra finalidad.'],
        ],
        ejemplo: 'En la base de datos, cada paciente se identifica con un código (P001, P002) y no con su nombre ni su cédula. La lista que relaciona códigos y personas se guarda aparte, con contraseña, y solo la conoce el equipo investigador.',
        ojo: 'La clasificación del riesgo la confirma el comité de ética, no tú. Tramita el aval **antes** de recoger datos: pedirlo después puede invalidar lo recogido.',
    },

    /* Plan de análisis */
    'an-quees': {
        claves: [
            ['Se planea antes de recoger', 'El plan de análisis se escribe en el anteproyecto porque condiciona el instrumento: si quieres comparar medias necesitas una variable numérica; si solo preguntaste la edad por rangos, ya no podrás calcular su promedio.'],
            ['Depurar antes de analizar', 'Con los datos digitados se revisan valores imposibles (una edad de 250), respuestas duplicadas y casillas vacías. Se decide qué hacer con los datos faltantes y se deja constancia de cuántos casos se excluyeron.'],
            ['Libro de códigos', 'Es la tabla que dice cómo se registra cada variable: su nombre en la base, su tipo y qué número corresponde a cada respuesta. Garantiza que todo el equipo digite de la misma manera.'],
        ],
        ejemplo: 'Libro de códigos: «regimen»: 1 = subsidiado, 2 = contributivo; «olvido»: de 1 = totalmente en desacuerdo a 5 = totalmente de acuerdo; «citas_perdidas»: número entero. Al depurar se excluyen cuatro cuestionarios con más de la mitad de las preguntas sin responder.',
        ojo: 'El plan sigue el orden de los objetivos específicos: un párrafo de análisis por cada uno. Así el capítulo de resultados ya tiene su estructura.',
    },
    'an-descriptivo': {
        claves: [
            ['Escalas de medición', 'La tabla se entiende mejor con las cuatro escalas: nominal (categorías sin orden), ordinal (con orden), de intervalo y de razón (numéricas). La escala fija qué operaciones tienen sentido: el régimen de salud no se promedia.'],
            ['Media o mediana', 'La media se deja arrastrar por los valores extremos; la mediana, no. Si la distribución es asimétrica o hay datos muy alejados, reporta la mediana con el rango intercuartílico en lugar de la media y la desviación estándar.'],
            ['Centro y dispersión juntos', 'Una medida de tendencia central sin su dispersión es media información. Dos grupos pueden tener la misma edad media y ser muy distintos: uno homogéneo y otro con edades de extremo a extremo.'],
        ],
        ejemplo: 'En 278 pacientes, la mayoría perdió 0 o 1 citas y unos pocos perdieron 8 o más. La media es 1,9, pero la mediana es 1: la mediana describe mejor al paciente típico porque no la inflan los casos extremos.',
        ojo: 'Reporta siempre el número de casos junto al porcentaje: «41 % (n = 114)». Y no uses gráfico de sectores con muchas categorías: no se lee.',
    },
    'an-inferencial': {
        claves: [
            ['Qué es una prueba de hipótesis', 'Se parte de la hipótesis nula (no hay relación o diferencia). El **valor p** indica qué tan probable sería un resultado como el tuyo, o más extremo, si la nula fuera cierta; por convención, si p < 0,05 se rechaza.'],
            ['Paramétricas o no paramétricas', 't de Student, ANOVA y Pearson suponen variables numéricas con distribución aproximadamente normal. Si eso no se cumple, o los datos son ordinales, se usan sus equivalentes: U de Mann-Whitney, Kruskal-Wallis y Spearman.'],
            ['Significativo no es importante', 'Con muestras grandes, diferencias mínimas resultan significativas. Por eso se reporta también el **tamaño del efecto**: qué tan fuerte es la relación o qué tan grande la diferencia, no solo si existe.'],
        ],
        ejemplo: 'Para saber si la inasistencia (sí/no) se relaciona con el régimen de salud (subsidiado/contributivo), dos variables categóricas, se usa chi cuadrado. Si resulta p = 0,03, menor que 0,05, se concluye que hay una asociación estadísticamente significativa.',
        ojo: 'Un valor p mayor que 0,05 no demuestra que no haya relación: solo que tus datos no alcanzan para afirmarla. Y la significancia nunca es prueba de causalidad.',
    },
    'an-cualitativo': {
        claves: [
            ['Antes de codificar', 'Las entrevistas se transcriben completas y se leen varias veces antes de marcar nada. Cada transcripción lleva un código de participante. Esa lectura inicial da la visión de conjunto que evita codificar frases sueltas sin contexto.'],
            ['Categorías previas o emergentes', 'Las categorías pueden venir del marco teórico (deductivas) o surgir de los datos (emergentes). Lo habitual es combinar: partes de unas pocas categorías previas y dejas espacio para lo que no esperabas.'],
            ['Triangulación para dar credibilidad', 'Se contrastan fuentes (pacientes y personal), técnicas (entrevista y observación) o analistas (dos personas codifican el mismo texto y comparan). También puedes devolver los resultados a los participantes para que los validen.'],
        ],
        ejemplo: 'Fragmento: «Yo no tenía quién me cuidara a los niños ese día». Código abierto: «cuidado de hijos». Categoría axial: «barreras familiares», junto con «acompañar a un familiar enfermo». Categoría central: «la cita compite con las obligaciones de cuidado».',
        ojo: 'Resumir lo que dijo cada entrevistado no es analizar. El análisis cruza las entrevistas: busca qué se repite, qué difiere y cómo se relacionan las categorías.',
    },
    'an-software': {
        claves: [
            ['El software no decide', 'El programa calcula lo que le pidas, tenga sentido o no: elegir la prueba, verificar sus supuestos e interpretar el resultado es trabajo tuyo. En cualitativo, ATLAS.ti, NVivo o MAXQDA organizan los códigos; la interpretación sigue siendo tuya.'],
            ['Criterios para elegir', 'Tres preguntas: ¿hace el análisis que necesito?, ¿tengo acceso legal (gratuito o con licencia institucional)?, ¿hay alguien que me pueda orientar? Para un trabajo de grado descriptivo o correlacional, Jamovi o JASP son suficientes.'],
            ['Cómo se cita en el método', 'Se nombra el programa, su versión y para qué se usó. Eso permite a otra persona repetir el análisis. Si usaste Excel para digitar y otro programa para las pruebas, se mencionan ambos.'],
        ],
        ejemplo: '«Los datos se digitarán en Excel y se analizarán en Jamovi, donde se calcularán frecuencias, porcentajes y la prueba de chi cuadrado. Las entrevistas se transcribirán y se codificarán en Taguette».',
        ojo: 'No uses copias sin licencia de programas de pago. Hay alternativas gratuitas para casi todo, y una licencia irregular es un problema ético en tu trabajo.',
    },
    'an-matriz': {
        claves: [
            ['Coherencia horizontal', 'Cada fila se lee de izquierda a derecha como una cadena: el objetivo pide un dato, la técnica lo recoge, el instrumento lo registra y el análisis lo procesa. Si un eslabón no encaja, la fila está mal.'],
            ['Versión ampliada', 'La matriz completa suele añadir columnas: pregunta, hipótesis, variables, dimensiones e indicadores. Algunas universidades la exigen como anexo; revisa el formato de tu programa antes de armarla.'],
            ['Herramienta de revisión', 'Úsala cada vez que cambies algo. Si reformulas un objetivo, recorre su fila y ajusta la técnica y el análisis. Es la forma más rápida de detectar incoherencias antes de que lo haga el evaluador.'],
        ],
        ejemplo: 'Fila incoherente: objetivo «Establecer la relación entre el olvido y la inasistencia», análisis «frecuencias y porcentajes». Los porcentajes describen cada variable por separado, pero no las relacionan: falta una prueba como chi cuadrado o Spearman.',
        ojo: 'Un mismo instrumento puede servir a varios objetivos, pero cada objetivo necesita su propio análisis. Dos filas idénticas suelen indicar objetivos repetidos.',
    },

    /* Cronograma */
    'cro-quees': {
        claves: [
            ['Las actividades salen de los objetivos', 'Cada objetivo específico se descompone en las tareas necesarias para cumplirlo. A esas se suman las transversales: permisos, validación de instrumentos, redacción del informe. Si una actividad no sirve a ningún objetivo, sobra.'],
            ['Dependencias entre actividades', 'Algunas actividades no pueden empezar hasta que termina otra: no se recoge sin aval ni instrumento validado, no se analiza sin datos. Identificar ese orden muestra qué retrasos atrasan todo el proyecto.'],
            ['Unidad de tiempo', 'En un proyecto de un semestre se planea por semanas; en uno de un año, por meses. Usa «semana 1» o «mes 1» en vez de fechas exactas, porque la fecha de inicio puede cambiar.'],
        ],
        ejemplo: 'El objetivo «Identificar las causas de inasistencia reportadas por los pacientes» se convierte en: diseñar el cuestionario, validarlo con expertos, hacer la prueba piloto, aplicarlo a los 278 pacientes, digitar los datos y calcular las frecuencias.',
        ojo: 'El cronograma empieza cuando te aprueban el anteproyecto, no antes. No incluyas como actividades lo que ya hiciste para escribirlo.',
    },
    gantt: {
        claves: [
            ['Cómo se lee', 'Las filas son actividades y las columnas, periodos. Cada barra muestra cuándo empieza y cuándo termina una actividad. De un vistazo se ve qué va primero, qué se hace al tiempo y cuánto dura todo.'],
            ['Barras que se solapan', 'Las actividades no van siempre una tras otra. Puedes digitar mientras sigues recogiendo, o ajustar el marco teórico durante la recolección. Los solapes acortan el proyecto, siempre que el equipo dé abasto.'],
            ['Hitos de control', 'Marca los momentos clave: aval del comité, instrumento validado, recolección terminada, entrega del borrador. Sirven para que tú y tu asesor comprueben si el proyecto va al día.'],
        ],
        ejemplo: 'En el diagrama, «Diseñar y validar los instrumentos» ocupa los meses 1 y 2, y «Aplicar los instrumentos», los meses 2 y 3. Se solapan en el mes 2: la aplicación arranca apenas el instrumento queda validado, sin esperar al mes siguiente.',
        ojo: 'Un Gantt con todas las barras del mismo largo y en fila, sin ningún solape, suele ser un cronograma hecho sin pensar cuánto toma cada actividad.',
    },
    'cro-consejos': {
        claves: [
            ['Estima con números', 'Calcula la duración a partir del rendimiento real: cuántas encuestas se aplican por jornada, cuántas jornadas hay por semana, cuántos encuestadores. Y recuerda que transcribir una entrevista toma varias veces lo que duró.'],
            ['Tiempos que no controlas', 'La respuesta del comité de ética, la carta de la institución, las vacaciones y las semanas de exámenes no dependen de ti. Averigua esos plazos antes de fijar la fecha de recolección.'],
            ['Calendario de la población', 'Revisa cuándo está disponible tu población. No se encuesta a estudiantes en semana de parciales ni en vacaciones, y en un hospital hay que acordar los horarios con el servicio.'],
        ],
        ejemplo: 'Si cada encuestador aplica unas 25 encuestas por jornada y hay dos encuestadores tres días por semana, se logran 150 por semana. Las 278 encuestas toman dos semanas; con margen por rechazos y ausencias, se programan tres.',
        ojo: 'Reserva un margen explícito, por ejemplo una semana de holgura por cada fase. Si el plan solo funciona cuando todo sale perfecto, no es un plan.',
    },

    /* Presupuesto */
    'pre-quees': {
        claves: [
            ['Para qué sirve', 'El presupuesto demuestra que el proyecto es **viable** y que sabes lo que cuesta. Para un evaluador, un presupuesto ordenado es señal de que el estudio se pensó hasta el final.'],
            ['Aporte en especie', 'No todo es dinero que sale del bolsillo. Tu tiempo, tu computador o las horas del asesor son recursos que alguien aporta sin desembolso: se valoran igual y se registran con su fuente.'],
            ['Sale del método', 'Cada rubro corresponde a algo que el método dice que harás: tantas encuestas impresas como muestra, tantos viajes como jornadas de recolección. Si un gasto no aparece en el método, sobra o falta explicarlo.'],
        ],
        ejemplo: 'El método dice: 278 cuestionarios de dos hojas, dos encuestadores, seis jornadas en el hospital. El presupuesto dice: 556 impresiones, 12 desplazamientos de ida y vuelta y las horas de dos investigadores. Las cantidades coinciden una a una.',
        ojo: 'Usa «externa» como fuente solo si existe un financiador real, con nombre. Lo que pagas tú es «personal», aunque esperes recuperarlo después.',
    },
    'pre-ejemplo': {
        claves: [
            ['Cómo leer la tabla', 'Cada fila es un recurso concreto con cuatro datos: a qué rubro pertenece, qué es y en qué cantidad, quién lo aporta y cuánto vale. Al final se suma el total y, mejor aún, un subtotal por fuente.'],
            ['Cantidad por valor unitario', 'El costo no se pone a ojo: resulta de multiplicar una cantidad por el valor de una unidad. Mostrar esa operación en la descripción permite verificar el cálculo y ajustarlo si cambia la muestra.'],
            ['El costo cero también se registra', 'Lo que ya tienes o presta la institución sin cobrar (una licencia institucional, un software gratuito, una sala) se incluye con valor cero y su fuente. Así queda claro que el recurso está previsto.'],
        ],
        ejemplo: 'Impresión de cuestionarios: 278 cuestionarios × 2 hojas = 556 hojas; a $ 200 cada una, $ 111.200, fuente personal. Si la muestra cambia, basta corregir la cantidad y el costo se recalcula.',
        ojo: 'No infles ni recortes valores para que el total se vea «bien». Un presupuesto creíble es el que usa precios que cualquiera puede comprobar.',
    },
    'pre-estimar': {
        claves: [
            ['Valor de la hora', 'Para valorar tu tiempo, toma un salario mensual de referencia para tu perfil y divídelo entre las horas laborales del mes. Para el asesor, usa el valor de la hora que reconoce la universidad.'],
            ['Guarda el soporte', 'Conserva de dónde salió cada precio: una cotización, la captura de una tarifa publicada, el valor del pasaje. No va en el documento, pero es tu respaldo si el evaluador pregunta.'],
            ['Rubro de imprevistos', 'Muchos formatos permiten un rubro de imprevistos, calculado como un porcentaje pequeño del total. Cubre alzas de precios o encuestas que haya que repetir. Revisa si tu universidad lo admite y con qué tope.'],
        ],
        ejemplo: 'Transporte: seis jornadas de recolección, dos encuestadores, ida y vuelta en bus urbano. Son 24 pasajes al valor de la tarifa vigente en la ciudad. El dato se puede comprobar y se actualiza si la tarifa cambia.',
        ojo: 'Los desplazamientos se calculan por jornada de recolección, no por participante. Nadie hace 278 viajes para aplicar 278 encuestas.',
    },

    /* Calidad */
    errores: {
        claves: [
            ['El patrón común', 'Casi todos los errores son de **coherencia**: una decisión que no encaja con la anterior. El enfoque no corresponde al objetivo, el diseño no corresponde al enfoque, el análisis no corresponde a la variable.'],
            ['Revisa en cadena', 'Lee tu metodología en orden y pregunta en cada paso si se deriva del anterior: objetivo, enfoque, alcance, diseño, muestra, instrumento, análisis. El primer eslabón que no encaje es el que hay que corregir.'],
            ['Copiar el método de otro', 'Tomar el método de una tesis parecida es una fuente habitual de incoherencias: esas decisiones respondían a otros objetivos. Puedes usarla como modelo de redacción, no como modelo de decisiones.'],
        ],
        ejemplo: 'Objetivo: «Comprender las razones de la inasistencia». Método declarado: cuantitativo, cuestionario cerrado, chi cuadrado. La cadena se rompe en el primer eslabón: o el objetivo cambia a «identificar los factores asociados», o el método pasa a entrevistas.',
        ojo: 'Corregir un error suele obligar a ajustar lo que sigue. Si cambias el enfoque, revisa otra vez diseño, muestra, instrumento y análisis.',
    },
    coherencia: {
        claves: [
            ['Los mismos términos siempre', 'Las variables, la población y el lugar deben llamarse igual en el título, los objetivos, el marco y la metodología. Si en un capítulo dices «inasistencia» y en otro «ausentismo», el lector cree que son dos cosas.'],
            ['Variables con respaldo teórico', 'Cada variable que mides debe estar definida en el marco referencial, y cada concepto central del marco debe aparecer en el método. Lo que no está en el marco no tiene sustento para medirse.'],
            ['El método fija las limitaciones', 'Lo que el método no puede hacer se declara: un muestreo por conveniencia no permite generalizar; un diseño transversal no muestra causas. Esas limitaciones deben coincidir con las que ya escribiste.'],
        ],
        ejemplo: 'El título dice «pacientes de consulta externa de un hospital de Sincelejo», pero la población del método incluye también a los de urgencias. Hay que decidir cuál es la correcta y dejarla igual en título, objetivos y metodología.',
        ojo: 'Después de terminar la metodología, relee el título y los objetivos. Es normal tener que ajustarlos: el método revela lo que de verdad se puede lograr.',
    },
};
