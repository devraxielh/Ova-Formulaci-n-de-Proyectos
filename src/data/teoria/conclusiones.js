// Teoría ampliada de la clase «Conclusiones»: una entrada por diapositiva de teoría (ver components/deck/Teoria.jsx).
export default {
    quees: {
        claves: [
            ['Responde, no describe', 'Los resultados dicen «el 41 % olvidó la cita». La conclusión dice qué significa eso frente al objetivo: «el olvido es el principal factor asociado a la inasistencia». Sube un nivel: del dato a la **afirmación**.'],
            ['Cierra lo que abrió el proyecto', 'El planteamiento formuló una pregunta y los objetivos la dividieron en partes. Las conclusiones devuelven una respuesta por cada parte. Por eso se escriben con los objetivos al lado.'],
            ['Sin nada nuevo', 'Todo lo que afirma una conclusión ya debe estar sustentado en los resultados y la discusión. Si aparece una idea que el lector no ha visto antes, falta un resultado o sobra la conclusión.'],
        ],
        ejemplo: 'Resultado: «El 41 % de los pacientes que faltaron dijo haber olvidado la cita». Discusión: «Coincide con lo hallado en otros hospitales públicos». Conclusión: «El olvido de la cita es el principal factor asociado a la inasistencia en esta consulta externa».',
        ojo: 'Si tu conclusión se puede escribir sin haber hecho el estudio («la inasistencia es un problema importante»), no es una conclusión.',
    },
    porobjetivo: {
        claves: [
            ['Por qué en el mismo orden', 'El evaluador lee con los objetivos en la mano y verifica uno por uno si se cumplieron. Mantener el orden y la numeración le permite hacerlo sin tener que buscar.'],
            ['Si se cumplió a medias', 'Dilo. Una conclusión honesta señala hasta dónde se llegó y por qué: «se caracterizó la inasistencia en consulta externa; no fue posible hacerlo por especialidad porque la agenda no registra ese dato».'],
            ['Hallazgos fuera de los objetivos', 'Si encontraste algo relevante que ningún objetivo pedía, no lo fuerces como conclusión. Preséntalo en la discusión y conviértelo en una recomendación para futuros estudios.'],
        ],
        ejemplo: 'Objetivo 3: «Establecer la relación entre el olvido de la cita y la inasistencia». Conclusión 3: «Se estableció que existe una relación positiva y moderada entre el olvido y la inasistencia: a mayor olvido, más citas perdidas».',
        ojo: 'Cuenta: si tienes tres objetivos específicos y cinco conclusiones, o solo dos, algo no corresponde. Revisa cuál sobra o cuál falta.',
    },
    reglas: {
        claves: [
            ['El verbo sigue al alcance', 'Un estudio descriptivo concluye que algo «se caracteriza por»; uno correlacional, que dos variables «están asociadas»; solo uno explicativo puede concluir que algo «influye» o «determina». No uses verbos causales con datos correlacionales.'],
            ['Cifras, las mínimas', 'La conclusión puede apoyarse en un dato clave, pero no repite tablas. Una cifra por conclusión, como mucho, y siempre una que ya esté presentada en la sección de resultados.'],
            ['Prudente no es tibio', 'Acotar a «esta población» delimita la afirmación sin debilitarla. Lo que sí la debilita es llenarla de «podría», «tal vez» y «al parecer» cuando los resultados son claros.'],
        ],
        ejemplo: 'Con una correlación entre olvido e inasistencia: correcto, «el olvido de la cita está asociado a la inasistencia en esta población»; incorrecto, «el olvido causa la inasistencia», porque el diseño no permite afirmar causalidad.',
        ojo: 'Empieza por el hallazgo, no por el procedimiento. «Se aplicó una encuesta y se analizaron los datos» cuenta lo que hiciste, no lo que encontraste.',
    },
    general: {
        claves: [
            ['Integra, no suma', 'No es la lista de las conclusiones específicas pegadas con comas. Dice qué se entiende ahora del problema al juntarlas: cuál es la respuesta completa a la pregunta de investigación.'],
            ['La hipótesis, con su evidencia', 'Si formulaste hipótesis, indica si los resultados la **apoyan** o no, y con qué evidencia. Que no se confirme también es un resultado válido y se reporta igual.'],
            ['Hasta dónde vale', 'Cierra recordando el límite de la afirmación: la población, el lugar y el periodo estudiados. Aquí se retoman las limitaciones que declaraste al formular el proyecto.'],
        ],
        ejemplo: 'Pregunta: «¿Qué factores están asociados a la deserción en primer semestre de ingeniería?». Conclusión general: «La deserción en primer semestre está asociada principalmente a la reprobación de cálculo y a las dificultades económicas, con mayor peso en los estudiantes que trabajan».',
        ojo: 'Pon la pregunta de investigación encima de la conclusión general y léelas seguidas. Si la segunda no contesta la primera, reescríbela.',
    },
    ejemplo: {
        claves: [
            ['Qué tienen en común', 'Las tres empiezan por el hallazgo, nombran la población o el lugar y caben en una o dos oraciones. Ninguna explica cómo se recogieron los datos ni cita a otro autor.'],
            ['Cada una con su alcance', 'La primera describe («es frecuente y se concentra en…»), la segunda compara («es mayor en…») y la tercera relaciona («se relaciona de forma positiva…»). El verbo corresponde al objetivo que responde.'],
            ['La propuesta también se concluye', 'Cuando un objetivo pide diseñar algo, la conclusión dice qué se obtuvo y **cómo se validó**: por expertos, por usuarios o con una prueba piloto. Sin validación, solo se afirma que existe.'],
        ],
        ejemplo: 'En educación: «1. La reprobación en primer semestre se concentra en cálculo y en los estudiantes que trabajan. 2. Se estableció que la asistencia a tutorías está asociada a una menor reprobación. 3. Se propuso un plan de tutorías tempranas, valorado como viable por la coordinación académica».',
        ojo: 'Usa el ejemplo como molde de forma, no de contenido: tus conclusiones salen de tus resultados, aunque el tema se parezca.',
    },
    'rec-quees': {
        claves: [
            ['Tres componentes', 'Una recomendación completa tiene **destinatario** (quién), acción (qué debe hacer) y, cuando se puede, una condición o criterio que la precisa (cuándo, a quiénes, con qué frecuencia).'],
            ['El puente con la conclusión', 'Cada recomendación debe poder rastrearse hasta una conclusión. Si alguien pregunta «¿por qué recomiendas esto?», la respuesta es un hallazgo de tu estudio, no tu opinión.'],
            ['Proporcionales a la evidencia', 'Un estudio en una sede permite recomendar acciones a esa institución y sugerir que otras examinen su propio caso. No alcanza para pedir una política nacional.'],
        ],
        ejemplo: 'Conclusión: «La reprobación se concentra en cálculo». Recomendación: «A la coordinación académica: ofrecer tutorías de cálculo desde la segunda semana a los estudiantes que obtengan menos de 3,0 en la prueba diagnóstica».',
        ojo: 'Verbo en infinitivo y acción verificable: «implementar», «incluir», «ofrecer». «Concientizar» o «mejorar» no permiten saber si la recomendación se cumplió.',
    },
    'rec-actores': {
        claves: [
            ['Elige a quien puede actuar', 'Dirige cada recomendación a quien tiene la **competencia** para ejecutarla. Pedirle al docente que cambie el plan de estudios, o al paciente que modifique la agenda, no lleva a ninguna parte.'],
            ['Futuros investigadores', 'Estas recomendaciones salen de tus limitaciones: lo que tu diseño no permitió. Ampliar la muestra, incluir otras sedes, medir en varios momentos o usar un diseño que permita evaluar causas.'],
            ['Pocas y ordenadas', 'Dos o tres por actor, de la más prioritaria a la menos. Una lista larga diluye las importantes y sugiere que no se distinguió lo urgente de lo deseable.'],
        ],
        ejemplo: 'A la universidad: incluir una prueba diagnóstica de matemáticas en la inducción. A los docentes de cálculo: reportar en la semana cuatro a los estudiantes con bajo rendimiento. A futuros investigadores: seguir a una cohorte durante todo el primer año.',
        ojo: 'No recomiendes lo que ya se hace. Antes de escribir, averigua qué acciones existen en la institución para proponer ajustes y no repeticiones.',
    },
    errores: {
        claves: [
            ['El error de fondo', 'Casi todos vienen de escribir las conclusiones sin tener los objetivos a la vista. Sin esa guía, el texto deriva hacia el resumen de resultados o hacia opiniones generales.'],
            ['Tres comprobaciones', 'Para cada conclusión: ¿qué objetivo responde?, ¿en qué resultado se apoya?, ¿se limita a mi población? Si alguna respuesta es «ninguno» o «no», hay que corregirla.'],
            ['Generalizar tiene reglas', 'Con una muestra **probabilística** puedes extender los resultados a la población de la que se tomó, no más allá. Con una muestra intencional, las conclusiones valen para los participantes y su contexto.'],
        ],
        ejemplo: 'Con 278 pacientes de un hospital: incorrecto, «los pacientes colombianos faltan a sus citas por olvido»; correcto, «en la consulta externa del hospital estudiado, el olvido es el motivo más frecuente de inasistencia».',
        ojo: 'Borrar los porcentajes no convierte un resultado en conclusión. Hay que decir qué responde ese resultado frente al objetivo.',
    },
    antes: {
        claves: [
            ['Tres defectos típicos', 'La primera frase débil cuenta el procedimiento, la segunda se apoya en otros autores y la tercera promete más de lo que el estudio hizo. Cada versión fuerte corrige uno de ellos.'],
            ['Sujeto: el hallazgo', 'En la versión fuerte el sujeto de la oración es la variable o el resultado («la inasistencia», «el olvido de la cita», «la relación»), no el investigador ni el instrumento.'],
            ['Sin verbos en futuro', 'Las conclusiones hablan de lo que se encontró o **se logró**, en pasado o en presente: «se estableció», «se concentra». Un verbo en futuro («solucionará») suele ser una promesa o una recomendación disfrazada.'],
        ],
        ejemplo: 'Débil: «Con las encuestas se pudo ver que los estudiantes tienen problemas». Fuerte: «La reprobación en primer semestre se concentra en cálculo y en los estudiantes que trabajan más de 20 horas semanales».',
        ojo: 'Al reescribir, no agregues información que no esté en tus resultados para que la frase suene más sólida.',
    },
};
