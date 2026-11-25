// Teoría ampliada de la clase «Desarrollo de las fases del proyecto»: una entrada por diapositiva de teoría (ver components/deck/Teoria.jsx).
export default {
    quees: {
        claves: [
            ['Del diseño a la acción', 'La metodología toma decisiones (enfoque, diseño, muestra); las fases las convierten en **tareas ordenadas**. Si la metodología dice «encuesta», la fase dice quién la aplica, a cuántos, dónde y con qué producto termina.'],
            ['Base del cronograma', 'El cronograma y el presupuesto se arman a partir de las fases: cada actividad ocupa una fila del cronograma y cada recurso, un rubro del presupuesto. Por eso las fases se escriben primero.'],
            ['Permite hacer seguimiento', 'Con fases claras, tu asesor y tú pueden comprobar en cualquier momento qué está hecho, qué falta y si el proyecto va atrasado. Sin ellas, el avance solo se estima a ojo.'],
        ],
        ejemplo: 'Metodología: «Se aplicará una encuesta a una muestra de 278 pacientes». Fase: «Aplicar el cuestionario en la sala de espera de consulta externa durante cuatro semanas; producto: base de datos con 278 registros depurados».',
        ojo: 'Si al leer tu fase no queda claro qué harás el lunes de la primera semana, todavía es metodología, no plan de trabajo.',
    },
    porque: {
        claves: [
            ['Por qué una por objetivo', 'Los objetivos específicos ya dividen el trabajo en partes que, sumadas, cumplen el objetivo general. Usarlos como fases evita inventar otra división y garantiza que **nada se quede sin hacer**.'],
            ['Cómo nombrar la fase', 'Convierte el verbo del objetivo en sustantivo: caracterizar → caracterización, diseñar → diseño, evaluar → evaluación. El nombre queda corto y deja ver de inmediato qué objetivo cumple esa fase.'],
            ['Dónde van los preparativos', 'Los permisos y la validación del instrumento no son un objetivo. Inclúyelos como primeras actividades de la fase 1 o en una fase preparatoria breve con su producto; las demás responden cada una a un objetivo.'],
        ],
        ejemplo: 'Objetivo: «Proponer estrategias para reducir la inasistencia». Fase 3. Diseño de la propuesta. Al terminar queda el documento de la estrategia; si ese documento existe y fue validado, el objetivo está cumplido.',
        ojo: 'Haz la prueba inversa: tapa los objetivos y lee solo los nombres de las fases. Deberías poder reconstruir qué quería lograr cada objetivo.',
    },
    partes: {
        claves: [
            ['La misma plantilla siempre', 'Describir todas las fases con los mismos seis elementos permite compararlas y detectar vacíos de un vistazo: una fase sin producto o sin duración salta a la vista cuando las demás sí los tienen.'],
            ['El objetivo se copia', 'El objetivo de la fase es el objetivo específico **tal como está** en el proyecto. Si le cambias la redacción, el evaluador puede pensar que son dos cosas distintas y buscar cuál falta.'],
            ['Técnica, instrumento y herramienta', 'La técnica es el procedimiento (encuesta, revisión documental); el instrumento, con qué registras (cuestionario, ficha); la herramienta, el software o equipo (Jamovi, Excel). Nombra los tres cuando apliquen.'],
        ],
        ejemplo: 'Fase 1. Caracterización de la inasistencia. Técnica: revisión documental. Instrumento: ficha de registro. Herramienta: Excel. Producto: informe de caracterización con tablas y gráficos. Duración: 6 semanas. Responsable: investigador principal.',
        ojo: 'Una tabla con una fila por fase y una columna por elemento suele ser más clara que varios párrafos. Úsala si tu formato lo permite.',
    },
    actividades: {
        claves: [
            ['Cuatro datos por actividad', 'Una actividad completa dice **qué** se hace (verbo), **sobre qué o con quién** (registros, pacientes), **cuánto** (278, un semestre) y **con qué** (cuestionario, Jamovi). Si falta alguno, queda vaga.'],
            ['Verbos de tarea', 'Usa verbos que nombran una tarea observable: aplicar, digitar, calcular, redactar, validar. Evita «conocer», «comprender» o «investigar»: son propósitos y pertenecen a los objetivos, no a las actividades.'],
            ['Entre tres y seis', 'Menos de tres actividades suele indicar pasos ocultos; más de seis, que estás detallando tareas menores. Ordénalas como se ejecutarán: lo que produce un insumo va antes de lo que lo usa.'],
        ],
        ejemplo: 'Fase 1, en orden: «Solicitar el acceso al sistema de citas; diseñar la ficha de registro; revisar los registros del primer semestre de 2026; organizar la base de datos en Excel; elaborar las tablas de frecuencia».',
        ojo: 'Prueba de verificación: ¿otra persona podría decir «hecho» o «no hecho» frente a cada actividad? Si la respuesta depende de opiniones, concrétala más.',
    },
    productos: {
        claves: [
            ['Actividad no es producto', '«Aplicar el cuestionario» es lo que haces; «base de datos con 278 registros» es lo que queda. El producto se nombra con un **sustantivo** y debe poder abrirse, leerse o mostrarse.'],
            ['Insumo de la fase siguiente', 'El entregable de una fase suele alimentar la otra: la base depurada permite el análisis; el informe de resultados sustenta la propuesta. Un producto que nadie usa después ni responde a un objetivo sobra.'],
            ['Con criterio de aceptación', 'Añade cómo se sabrá que está bien hecho: «instrumento validado por tres expertos», «base sin duplicados», «informe aprobado por el asesor». Ese criterio es lo que vuelve verificable el producto.'],
        ],
        ejemplo: 'Débil: «Producto: análisis de los datos». Fuerte: «Producto: informe de resultados con tres tablas, dos figuras y la prueba de correlación, revisado por el asesor».',
        ojo: 'No prometas productos que tus actividades no generan. Si anuncias un artículo, debe existir la actividad «redactar el artículo» con su tiempo.',
    },
    hitos: {
        claves: [
            ['El hito no dura', 'Una actividad ocupa semanas; un hito es un **instante**: el día en que algo queda terminado o aprobado. En el cronograma se marca con una fecha, no con una barra.'],
            ['Indicador que se mide', 'Un buen indicador tiene una cantidad y una meta: «278 cuestionarios aplicados», «100 % de los registros revisados», «tres conceptos favorables». Así el cumplimiento no depende de apreciaciones personales.'],
            ['Sirven para decidir', 'Al llegar a un hito se revisa si se puede pasar a la fase siguiente. Si el indicador no se cumplió, se ajusta el plan en ese momento, no al final del proyecto.'],
        ],
        ejemplo: 'Fase 2. Hito: base de datos completa. Indicador: 278 cuestionarios digitados y menos del 5 % de datos faltantes. Si solo hay 240, se amplía una semana la recolección antes de iniciar el análisis.',
        ojo: '«Avanzar en la recolección» no es un hito: no tiene fecha ni forma de comprobarse. Un hito siempre describe algo terminado.',
    },
    'mod-cuanti': {
        claves: [
            ['Lineal y planeado', 'En lo cuantitativo el instrumento, la muestra y el plan de análisis se definen **antes** de recolectar y no se cambian después. Por eso las fases van una tras otra, sin volver atrás.'],
            ['La preparación pesa', 'Validar el instrumento con expertos, hacer una prueba piloto y conseguir los permisos puede tomar tanto como la recolección. Si se hace a medias, los errores aparecen cuando ya no tienen remedio.'],
            ['Cruce con tus objetivos', 'Este modelo ordena el trabajo en el tiempo; tus objetivos lo ordenan por propósito. Puedes usar las cuatro etapas como actividades dentro de cada fase por objetivo, o indicar qué objetivo se cumple en cada etapa.'],
        ],
        ejemplo: 'Preparación: validar el cuestionario con tres expertos y probarlo con 20 pacientes. Recolección: aplicarlo a los 278 de la muestra. Análisis: frecuencias y correlación de Spearman en Jamovi. Informe: redactar resultados y discusión.',
        ojo: 'No empieces a recolectar sin prueba piloto. Una pregunta mal entendida que descubres en el cuestionario 200 obliga a repetir la aplicación.',
    },
    'mod-cuali': {
        claves: [
            ['Diseño flexible', 'Aquí el plan puede cambiar con lo que vas encontrando: una entrevista revela un tema nuevo y ajustas la guía para las siguientes. Las fases describen un recorrido probable, no una secuencia cerrada.'],
            ['Qué es la saturación', 'Se alcanza cuando las nuevas entrevistas ya **no aportan categorías nuevas**: los participantes repiten lo que otros dijeron. Ese es el criterio para dejar de recolectar, no un número fijado de antemano.'],
            ['Tres niveles de codificación', 'La codificación abierta etiqueta fragmentos del texto; la axial agrupa esas etiquetas en categorías y las relaciona entre sí; la selectiva elige la categoría central que organiza toda la explicación.'],
        ],
        ejemplo: 'Se entrevista a cuatro pacientes, se transcribe y se codifica; aparece «costo del transporte». Se ajusta la guía, se entrevista a cuatro más y se repite, hasta que las últimas entrevistas ya no dejan categorías nuevas.',
        ojo: 'En el cronograma, recolección y análisis deben solaparse, no ir en bloques separados. Y reserva varias horas de transcripción por cada hora de entrevista.',
    },
    'mod-propositivo': {
        claves: [
            ['El diagnóstico justifica el diseño', 'Cada componente de la propuesta debe responder a una causa encontrada en el diagnóstico. Si propones algo que el diagnóstico no pidió, el evaluador preguntará de dónde salió esa idea.'],
            ['Validar no es implementar', 'En un proyecto propositivo la estrategia se diseña y se somete a juicio, pero **no se aplica** ni se mide su efecto. Eso corresponde a un proyecto de intervención. Decláralo en los alcances.'],
            ['El juicio de expertos', 'Seleccionas tres o más personas con experiencia en el tema, les entregas la propuesta y una rúbrica con criterios (pertinencia, claridad, viabilidad) y ajustas la propuesta según sus observaciones.'],
        ],
        ejemplo: 'Diagnóstico: el olvido es la causa más frecuente de inasistencia. Diseño: protocolo de recordatorios por mensaje de texto. Validación: tres profesionales de atención al usuario lo califican con una rúbrica. Ajuste: se cambia el horario de envío.',
        ojo: 'No escribas «se implementará la estrategia» si tu tiempo solo alcanza para diseñarla y validarla. Prometer la implementación te obliga a medirla.',
    },
    'mod-crisp': {
        claves: [
            ['Un ciclo con retornos', 'Las fases se recorren con idas y vueltas: al modelar descubres que falta una variable y regresas a la preparación; si la evaluación falla, vuelves a la comprensión del negocio. Planea ese tiempo.'],
            ['La preparación es larga', 'Limpiar, integrar y transformar los datos suele ser la fase **que más tiempo consume**, por encima del modelado. Asígnale más semanas de las que crees necesitar y registra cada transformación.'],
            ['Dos evaluaciones distintas', 'Una cosa es el desempeño técnico del modelo (exactitud, sensibilidad) y otra si cumple el criterio de éxito definido en la primera fase. La fase de evaluación responde sobre todo a la segunda.'],
        ],
        ejemplo: 'Criterio de éxito: identificar el 70 % de las citas perdidas. El modelo alcanza una sensibilidad del 58 % en datos de prueba. No se despliega: se vuelve a la preparación para añadir la variable «inasistencias previas».',
        ojo: 'Empezar por el modelo es el error típico. Sin una pregunta del negocio y un criterio de éxito, no hay forma de saber si el modelo sirve.',
    },
    'mod-intervencion': {
        claves: [
            ['Medir igual dos veces', 'La comparación solo vale si mides igual antes y después: el mismo instrumento, la misma población y condiciones parecidas. Cambiar el cuestionario entre mediciones impide saber si hubo cambio.'],
            ['El protocolo da fidelidad', 'El protocolo describe qué se hace, cuántas sesiones, cuánto duran y quién las aplica. Sirve para que todos reciban **la misma intervención** y para que otro investigador pueda repetirla.'],
            ['Grupo de comparación', 'Sin un grupo que no reciba la intervención, el cambio puede deberse a otras causas, como el paso del tiempo u otra campaña. Si puedes incluirlo, el diseño es cuasiexperimental y la conclusión, más sólida.'],
        ],
        ejemplo: 'Línea base: 28 % de inasistencia en marzo. Intervención: recordatorios por mensaje de texto durante abril y mayo, según protocolo. Evaluación: se mide la inasistencia en junio con el mismo registro y se compara con marzo.',
        ojo: 'Si no hay grupo de comparación, no escribas que la estrategia «causó» el cambio. Di que la inasistencia disminuyó tras la intervención y reconoce el límite.',
    },
    'mod-ia': {
        claves: [
            ['La comunidad decide', 'Los participantes no son informantes: **definen el problema**, acuerdan la acción y evalúan sus resultados junto al investigador. Las fases deben nombrar los espacios donde eso ocurre: reuniones, talleres, asambleas.'],
            ['Varios ciclos', 'La reflexión de un ciclo es el diagnóstico del siguiente. En el proyecto describe con detalle el primer ciclo y declara cuántos alcanzas a completar en el tiempo disponible.'],
            ['Registro sistemático', 'Observar exige instrumentos: diario de campo, actas de reunión, registros de asistencia, fotografías con permiso. Sin registro, la reflexión se apoya en recuerdos y pierde valor como evidencia.'],
        ],
        ejemplo: 'Ciclo 1: docentes y estudiantes de primer semestre acuerdan tutorías entre pares para cálculo; se realizan durante seis semanas; se registran asistencia y notas; en la reflexión deciden cambiar el horario. Ciclo 2: se repite con el nuevo horario.',
        ojo: 'Si diagnosticas solo y llevas la solución ya diseñada, no es investigación-acción aunque uses sus cuatro pasos: es un proyecto de intervención.',
    },
    'ej-salud': {
        claves: [
            ['Actividades encadenadas', 'Aplicar, digitar, depurar, calcular, interpretar: cada actividad recibe lo que dejó la anterior. Ese encadenamiento, sin saltos ni pasos ocultos, es lo que hace creíble la duración de ocho semanas.'],
            ['La técnica ya estaba decidida', 'Encuesta, cuestionario validado y correlación de Spearman vienen de la metodología. La fase no los justifica de nuevo: solo dice **cuándo y cómo** se usan dentro del plan de trabajo.'],
            ['Por qué Spearman', 'Se usa cuando las variables son ordinales o no siguen una distribución normal, como la frecuencia de olvido medida en una escala. Nombrar la prueba en la actividad muestra que el análisis está planeado.'],
        ],
        ejemplo: 'Reparto posible de las ocho semanas: cuatro para aplicar el cuestionario a los 278 pacientes, dos para digitar y depurar la base, una para calcular la correlación y una para redactar el informe de resultados.',
        ojo: 'Fíjate en que el nombre de la fase repite las variables del objetivo. Si el objetivo cambia, la fase debe cambiar con él.',
    },
    'ej-educacion': {
        claves: [
            ['Una fase que construye', 'En las fases de diseño no se recogen datos: se **construye** un producto. Las actividades describen cómo se arma, pieza por pieza, desde los desempeños hasta los instrumentos de evaluación.'],
            ['La validación va dentro', 'Validar con tres docentes expertos es la última actividad de la fase, no una fase aparte. Así el producto que se entrega ya está revisado y ajustado, y el objetivo queda cumplido.'],
            ['Depende de la fase anterior', 'Los desempeños esperados salen del diagnóstico de comprensión lectora hecho antes. Una fase de diseño sin un diagnóstico previo que la oriente queda sin sustento ante el evaluador.'],
        ],
        ejemplo: 'La rúbrica de validación pide a cada docente calificar de 1 a 4 la pertinencia de los textos, la claridad de las actividades y la coherencia con los desempeños. Los componentes con calificación baja se reescriben.',
        ojo: 'A este ejemplo le falta el responsable. En tu proyecto no lo omitas: aunque trabajes solo, escribe quién lidera cada fase.',
    },
    'ej-analitica': {
        claves: [
            ['Modelado dentro de CRISP-DM', 'Esta fase corresponde al modelado de CRISP-DM. Antes debieron existir la comprensión del negocio, la comprensión de los datos y su preparación: el modelo solo se entrena con datos ya limpios.'],
            ['Entrenamiento y prueba', 'El modelo se ajusta con una parte de los datos y se evalúa con otra que **nunca ha visto**. Si lo evalúas con los mismos datos, el desempeño parece mejor de lo que será en la práctica.'],
            ['Por qué F1', 'Las citas perdidas son menos que las cumplidas: un modelo que siempre diga «asistirá» acierta mucho y no sirve. F1 combina precisión y sensibilidad, y por eso no se deja engañar por ese desbalance.'],
        ],
        ejemplo: 'De 12.000 registros, 9.600 se usan para entrenar y 2.400 para probar. La regresión logística obtiene F1 = 0,61 y el árbol de decisión, 0,66 en los datos de prueba; se elige el árbol.',
        ojo: 'Comparar un modelo simple con otro más complejo es buena práctica: si el simple rinde casi igual, es más fácil de explicar al hospital.',
    },
    'ej-comparar': {
        claves: [
            ['Qué le falta a la débil', 'No dice qué objetivo cumple, cuántas personas participan ni con qué instrumento, y no deja nada que revisar. Con esa descripción no se puede calcular el tiempo ni el costo de la fase.'],
            ['El costo de la vaguedad', 'Una fase vaga parece más fácil de escribir, pero traslada el problema: el cronograma queda sin actividades que ubicar y el presupuesto sin recursos que valorar.'],
            ['Cómo fortalecerla', 'Recorre los seis elementos uno por uno y completa el que falte. Luego pasa cada actividad por las cuatro preguntas: qué se hace, con quién, cuánto y con qué.'],
        ],
        ejemplo: 'Débil: «Fase 1. Diagnóstico. Revisar datos». Fuerte: «Fase 1. Caracterización de la inasistencia. Revisar los registros de citas del primer semestre de 2026; producto: informe de caracterización; 6 semanas».',
        ojo: 'Una raya en producto o en duración no es un detalle de forma: significa que la fase no se puede controlar ni dar por terminada.',
    },
    duracion: {
        claves: [
            ['Estima desde la actividad', 'No asignes semanas a la fase a ojo. Calcula cada actividad con una cuenta sencilla: 278 cuestionarios a unos 15 por día son 19 días hábiles, casi cuatro semanas de aplicación.'],
            ['La cadena que no espera', 'Las fases que dependen una de otra forman una cadena: un atraso en cualquiera atrasa el final del proyecto. Identifícala y protégela; lo que va en paralelo tiene más holgura.'],
            ['Margen donde hace falta', 'Los trámites externos, como avales y respuestas de expertos, no dependen de ti y son los que más se demoran. Pon la holgura justo ahí, no repartida por igual entre todas las fases.'],
        ],
        ejemplo: 'Mientras el hospital estudia la solicitud de aval, que puede tardar tres semanas, validas el cuestionario con los expertos. Las dos tareas avanzan en paralelo y la fase 1 no se alarga.',
        ojo: 'Descuenta las semanas sin trabajo de campo: vacaciones, Semana Santa, parciales, cierre de semestre. Un cronograma que las ignora se incumple desde el inicio.',
    },
    recursos: {
        claves: [
            ['De la fase al presupuesto', 'Cada recurso que nombres en una fase debe aparecer como rubro con su valor. La forma segura es listar los recursos fase por fase y trasladar esa lista completa al presupuesto.'],
            ['Un solo responsable', 'El responsable **responde** por que la fase se cumpla y coordina a los demás. Encuestadores, expertos y asesor participan, pero solo una persona rinde cuentas por el producto.'],
            ['Lo que no pagas', 'Tu tiempo, el computador propio o el software libre son recursos aunque no impliquen desembolso. Se registran como aporte en especie para mostrar el costo real del proyecto.'],
        ],
        ejemplo: 'Fase 2. Quién: investigador principal y dos encuestadores. Con qué: 278 copias del cuestionario, un computador y Jamovi, que es gratuito. Dónde: sala de espera de consulta externa del hospital.',
        ojo: 'Si necesitas encuestadores, incluye una actividad para capacitarlos. Que cada uno aplique el instrumento a su manera daña la calidad de los datos.',
    },
    riesgos: {
        claves: [
            ['Probabilidad e impacto', 'No todos los riesgos merecen la misma atención. Valora qué tan probable es cada uno y cuánto daño haría; prepara respuesta para los que son probables o graves y solo vigila el resto.'],
            ['Prevenir y responder', 'Hay dos tipos de medida: la **preventiva**, que reduce la probabilidad (pedir el aval al inicio), y la de contingencia, que se activa si el riesgo ocurre (pasar a la institución alterna).'],
            ['Riesgo no es limitación', 'El riesgo es algo que **podría** pasar durante la ejecución y se gestiona. La limitación es una restricción que ya conoces y aceptas desde el diseño, como trabajar con una sola sede.'],
        ],
        ejemplo: 'Riesgo: menos de 278 cuestionarios respondidos. Prevención: aplicar en la sala de espera y no por correo. Contingencia: ampliar dos semanas la recolección, ya previstas como holgura en el cronograma.',
        ojo: 'Un riesgo sin respuesta escrita es solo una preocupación. Y toda respuesta que cueste tiempo o dinero debe caber en el cronograma y el presupuesto.',
    },
    errores: {
        claves: [
            ['El error de fondo', 'Casi todos vienen de escribir las fases **sin mirar los objetivos** ni el cronograma. Las fases son un puente entre ambos: si se redactan aisladas, no conectan con nada.'],
            ['Revisión en dos pasadas', 'Primera pasada, fase por fase: cada una tiene sus seis elementos. Segunda, de conjunto: cada objetivo tiene fase, cada fase deja producto y los tiempos suman lo que dice el cronograma.'],
            ['Acciones, no razones', 'La metodología argumenta **por qué** se eligió un diseño o una técnica; las fases solo dicen qué se hará con ellos. Si en una fase aparece un «porque», probablemente sobra.'],
        ],
        ejemplo: 'Tres objetivos y fases llamadas «Revisión bibliográfica», «Trabajo de campo» y «Conclusiones»: ninguna nombra un objetivo ni deja producto. Corregido: «Caracterización», «Análisis de la relación» y «Diseño de la propuesta», cada una con su entregable.',
        ojo: 'Pide a un compañero que lea solo tus fases y te diga qué vas a hacer y qué entregarás. Lo que no pueda responder es lo que falta.',
    },
    coherencia: {
        claves: [
            ['Una matriz para comprobarlo', 'Arma una tabla con una fila por objetivo específico y columnas para fase, técnicas, producto, semanas y recursos. Una celda vacía señala exactamente dónde se rompe la coherencia.'],
            ['Los cambios se propagan', 'Si amplías la muestra o agregas una actividad, cambian la duración, el cronograma y el presupuesto. Cada ajuste en las fases obliga a revisar las otras secciones antes de entregar.'],
            ['Las mismas palabras', 'Usa los mismos nombres en todo el documento: si la fase dice «cuestionario», el presupuesto no debe decir «encuesta impresa» ni el cronograma «test». Los sinónimos hacen dudar al evaluador.'],
        ],
        ejemplo: 'Objetivo 2 → Fase 2. Análisis de la relación → encuesta y correlación de Spearman, como en la metodología → semanas 7 a 14 del cronograma → rubros del presupuesto: copias, encuestadores y computador.',
        ojo: 'Haz esta revisión al final, cuando el cronograma y el presupuesto ya estén escritos. Es el momento en que aparecen las incoherencias.',
    },
};
