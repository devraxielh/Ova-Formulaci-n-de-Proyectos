// Teoría ampliada de la clase «Alcances y limitaciones»: una entrada por diapositiva de teoría (ver components/deck/Teoria.jsx).
export default {
    quees: {
        claves: [
            ['Decisión frente a condición', 'El alcance lo **decides** tú: eliges qué estudiar, con quiénes y dónde. La limitación no la eliges: es una condición del estudio que restringe lo que puedes afirmar con los resultados.'],
            ['Para qué le sirve al evaluador', 'Con el alcance sabe qué puede exigirte y qué no. Con las limitaciones sabe que conoces los puntos débiles del diseño y que ya pensaste cómo manejarlos.'],
            ['Dónde se usan después', 'El tipo de alcance orienta el diseño y las hipótesis en la metodología. Las limitaciones se retoman al final, cuando interpretas los resultados y dices hasta dónde valen las conclusiones.'],
        ],
        ejemplo: 'Alcance: «El estudio se hará con pacientes adultos de consulta externa de un hospital de Sincelejo». Limitación: «La agenda del hospital no registra el motivo de la inasistencia, por lo que este dato dependerá de lo que informe el paciente».',
        ojo: 'Recortar la población a una sede es una decisión de alcance, no una limitación. Solo es limitación lo que afecta la calidad o la generalización de los resultados.',
    },
    dossentidos: {
        claves: [
            ['Responden preguntas distintas', 'El tipo de alcance responde **qué clase de conocimiento** producirás: una descripción, una relación, una explicación. La delimitación responde sobre qué casos concretos valdrá ese conocimiento.'],
            ['Son independientes', 'Un estudio puede ser explicativo y estar delimitado a un solo hospital, o ser descriptivo y cubrir un departamento entero. Un alcance «más alto» no significa un estudio más grande.'],
            ['En qué orden decidirlos', 'Primero el tipo, porque sale de la pregunta y de los objetivos. Después las fronteras, que dependen del acceso, el tiempo y los recursos con que cuentas para hacer el estudio.'],
        ],
        ejemplo: '«Esta investigación tiene un alcance correlacional (tipo). Se realizará con pacientes adultos de consulta externa de un hospital de Sincelejo durante el primer semestre de 2026 (delimitación)».',
        ojo: 'Escribir «el alcance es el hospital de Sincelejo» responde solo la mitad. Falta decir si vas a describir, relacionar o explicar.',
    },
    tipos: {
        claves: [
            ['De qué depende', 'Según Hernández Sampieri, de dos cosas: lo que ya se sabe del tema según la revisión de la literatura y la perspectiva que quieres darle al estudio. Un tema sin antecedentes difícilmente admite un alcance explicativo.'],
            ['No es una escala de calidad', 'Ningún alcance es mejor que otro: un buen estudio descriptivo vale más que uno explicativo mal sustentado. Además, un mismo estudio puede incluir elementos de más de un alcance, por ejemplo describir y luego correlacionar.'],
            ['Correlación no es causa', 'El alcance correlacional dice que dos variables varían juntas y con qué fuerza; no prueba que una produzca la otra. Para hablar de causas se necesita un alcance **explicativo** y un diseño que lo sostenga.'],
        ],
        ejemplo: 'Con el mismo tema: describir el perfil de los pacientes que faltan a la cita es descriptivo; medir si el olvido se relaciona con la inasistencia es correlacional; establecer qué factores la determinan es explicativo.',
        ojo: 'Hernández Sampieri propone cuatro alcances: exploratorio, descriptivo, correlacional y explicativo. Evaluativo y propositivo vienen de otras clasificaciones; úsalos si tu programa los acepta.',
    },
    delimitacion: {
        claves: [
            ['Cada frontera se justifica', 'No basta con fijarla: conviene poder decir por qué. Se elige esa sede porque hay autorización, ese semestre porque coincide con la recolección, esos factores porque son los que reporta la literatura.'],
            ['La población, con criterios', 'Edad, servicio, programa, semestre, tiempo de vinculación. Con criterios de inclusión claros, cualquier persona puede decidir si un caso entra o no al estudio. De ahí saldrán después la población y la muestra.'],
            ['Dos tiempos distintos', 'Uno es el periodo que **cubren los datos** (las citas de 2025) y otro el periodo en que se recogen (marzo a mayo de 2026). Declara los dos cuando no coincidan.'],
        ],
        ejemplo: '«Se estudiarán los factores personales e institucionales de la inasistencia en pacientes mayores de 18 años con cita programada en consulta externa de un hospital de Sincelejo; se analizarán las citas del primer semestre de 2026».',
        ojo: 'Delimitar no empobrece el estudio. Un proyecto pequeño y preciso se puede terminar; uno amplio y vago no se puede evaluar ni ejecutar.',
    },
    loquesi: {
        claves: [
            ['Qué vale la pena excluir', 'Solo lo que un lector razonable podría esperar: poblaciones vecinas, otras sedes, variables muy relacionadas o la fase siguiente (aplicar la solución). No hace falta excluir lo que nadie supondría.'],
            ['Cada exclusión tiene razón', 'Se excluye por coherencia con el objetivo, por falta de acceso o por tiempo. Dar la razón en media oración evita que la exclusión parezca arbitraria o un descuido.'],
            ['Diagnosticar no es intervenir', 'Es la exclusión más frecuente en un trabajo de grado: el estudio identifica factores o diseña una propuesta, pero **no la implementa** ni mide su efecto. Dilo de forma explícita.'],
        ],
        ejemplo: '«El estudio no abarca a los pacientes de urgencias, porque no tienen cita programada, ni incluye el diseño ni la aplicación de una estrategia de recordatorios, que podrán abordarse en un trabajo posterior».',
        ojo: 'Revisa que las exclusiones no contradigan tus objetivos: si un objetivo dice «proponer una estrategia», no puedes excluir el diseño de la propuesta.',
    },
    tiposlim: {
        claves: [
            ['De dónde vienen', 'La mayoría sale de tres fuentes: el **diseño** (muestra no aleatoria, medición en un solo momento), los instrumentos y datos (autorreporte, registros incompletos) y las condiciones (tiempo, acceso, recursos).'],
            ['Qué parte del estudio afectan', 'Unas restringen a quiénes puedes extender los resultados, como la muestra intencional. Otras afectan la confianza en la medición, como el autorreporte. Identificar cuál es cuál te indica qué respuesta darle.'],
            ['Cuáles declarar', 'Las que un evaluador notaría al leer tu metodología. Entre dos y cuatro bien explicadas son suficientes; una lista de ocho da la impresión de un estudio que no se sostiene.'],
        ],
        ejemplo: 'En el estudio de inasistencia: la muestra se toma en una sola sede (no generaliza a otros hospitales), el motivo de la falta lo informa el paciente (autorreporte) y la agenda tiene registros sin teléfono de contacto (datos incompletos).',
        ojo: 'Las limitaciones se anticipan en la propuesta y se actualizan en el informe final con las que realmente aparecieron durante el trabajo de campo.',
    },
    mitigar: {
        claves: [
            ['El efecto es lo que importa', 'Una restricción sin efecto sobre los resultados no es una limitación del estudio. Pregúntate: ¿qué no podré afirmar, o qué afirmaré con menos seguridad, por causa de esto?'],
            ['Tres formas de responder', '**Prevenir** antes de recoger datos (prueba piloto, permisos anticipados), **compensar** durante el estudio (contrastar con registros, garantizar anonimato) o acotar la interpretación cuando la restricción no se puede evitar.'],
            ['La respuesta debe ser realizable', 'Solo promete lo que puedes hacer con tu tiempo y tus recursos. La respuesta que escribas aquí se convierte en una actividad del cronograma y, a veces, en un costo del presupuesto.'],
        ],
        ejemplo: '«Los registros de la agenda pueden estar incompletos (restricción), lo que reduciría el número de casos analizables (efecto); se depurará la base y se informará el porcentaje de registros excluidos (respuesta)».',
        ojo: 'Reducir no es eliminar. Evita escribir que la limitación «se superará» o «no afectará los resultados»: di qué harás y qué queda sin resolver.',
    },
    errores: {
        claves: [
            ['El error de fondo', 'Casi todos nacen de escribir esta sección al final y de afán, como un trámite. En realidad resume decisiones que ya tomaste en la pregunta, los objetivos y la viabilidad.'],
            ['Prueba de coherencia', 'Compara el tipo de alcance con el verbo de tus objetivos y con tu pregunta. «Describir» o «caracterizar» con alcance explicativo, o «¿qué relación existe…?» con alcance descriptivo, son señales de desajuste.'],
            ['Viabilidad frente a limitación', 'Si una restricción **impide** hacer el estudio, es un problema de viabilidad y se resuelve cambiando el diseño. Si solo reduce lo que puedes afirmar con los resultados, es una limitación y se declara.'],
        ],
        ejemplo: 'Desajuste: objetivos «identificar» y «describir» los motivos de deserción en primer semestre, y alcance declarado «explicativo». Corrección: declarar alcance descriptivo, o añadir un objetivo que analice qué factores determinan la deserción.',
        ojo: 'Cuando el tipo de alcance y los objetivos no coinciden, no cambies la etiqueta sin pensar: decide qué quieres lograr y ajusta lo que haga falta.',
    },
    reescribe: {
        claves: [
            ['Del adjetivo a la frontera', 'Cambia «amplio», «completo» o «general» por las cinco fronteras con datos: qué aspectos del tema, con quiénes, dónde, en qué periodo y qué se entregará al final.'],
            ['De la primera persona al estudio', 'El sujeto de una limitación es el estudio, no tú. «No tengo recursos» pasa a «el proyecto no cuenta con financiación externa», seguido del efecto y de la respuesta.'],
            ['Verbos que el alcance permite', 'Un alcance descriptivo «caracteriza»; uno correlacional «mide la relación»; uno explicativo «determina los factores». Revisa que ningún verbo de la sección prometa más que el tipo declarado.'],
        ],
        ejemplo: 'Antes: «Se estudiará la deserción en la universidad». Después: «Se describirán los motivos de deserción de los estudiantes de primer semestre de ingeniería de una universidad pública de Sincelejo, matriculados en 2026; no se incluyen otros programas».',
        ojo: 'Después de reescribir, verifica que la población, el lugar y el periodo sean idénticos a los del título y los objetivos.',
    },
};
