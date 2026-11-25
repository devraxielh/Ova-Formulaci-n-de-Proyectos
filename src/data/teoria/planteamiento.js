// Teoría ampliada de la clase «Planteamiento del problema»: una entrada por diapositiva de teoría (ver components/deck/Teoria.jsx).
export default {
    quees: {
        claves: [
            ['Afinar la idea', 'Para Hernández Sampieri, plantear el problema es **afinar y estructurar** la idea de investigación. En tu documento, ese trabajo se concreta en un texto que describe la situación y desemboca en la pregunta.'],
            ['Texto que describe', 'Expone hechos comprobables sobre la situación, en tercera persona y en presente. No pide apoyo ni promete beneficios: de eso se encarga la justificación, que viene después.'],
            ['Una prueba para cada oración', 'Pregunta a cada frase: ¿describe lo que pasa (planteamiento), dice por qué conviene estudiarlo (justificación), explica un concepto (marco teórico) o anuncia lo que harás (objetivos)?'],
        ],
        ejemplo: '«En 2025 se perdió una de cada cinco citas de consulta externa» es planteamiento. «Conocer las causas permitirá recuperar esos cupos» es justificación. «Se diseñará un sistema de recordatorios» es solución.',
        ojo: 'Puedes mencionar un concepto clave en el planteamiento, pero no desarrollarlo. Si un párrafo explica una teoría, pásalo al marco teórico.',
    },
    embudo: {
        claves: [
            ['Tres escalas bastan', 'Internacional o nacional, regional y local. No hace falta recorrerlas todas si no tienes un dato para cada una: una escala sin dato es relleno.'],
            ['El mismo fenómeno en cada nivel', 'Lo que se estrecha es el **lugar y la población**, no el tema. Si arriba hablas de deserción y abajo de reprobación, explica en una frase cómo se conectan.'],
            ['Proporción del texto', 'El contexto ocupa la parte menor. La mayor parte del planteamiento se dedica a tu institución y tu población: ahí están tu dato, tus causas y tus consecuencias.'],
        ],
        ejemplo: 'Para el hospital: «La inasistencia a citas programadas es frecuente en los servicios de salud del país. En Sucre afecta sobre todo a la consulta externa. En un hospital de Sincelejo, una de cada cinco citas se perdió en 2025».',
        ojo: 'Si después de tres o cuatro oraciones todavía no has nombrado tu población ni tu lugar, el embudo empieza demasiado arriba. Recorta el comienzo.',
    },
    partes: {
        claves: [
            ['Diagnóstico y pronóstico', 'Las partes centrales hacen un diagnóstico: síntomas, causas y efectos. Las consecuencias incluyen además el **pronóstico**: qué pasará si la situación continúa, redactado en condicional.'],
            ['Un párrafo, una función', 'Cada parte responde una pregunta distinta: ¿dónde?, ¿qué pasa?, ¿por qué?, ¿qué provoca?, ¿qué falta saber? Si un párrafo responde dos, divídelo en dos párrafos.'],
            ['El cierre señala el vacío', 'El último párrafo no repite todo: resume en una oración y dice **qué no se sabe todavía**. Ese vacío de conocimiento es lo que tu pregunta va a cubrir.'],
        ],
        ejemplo: 'Pronóstico: «De continuar esta situación, la repitencia en cálculo seguiría alargando el tiempo de graduación». Cierre: «Por lo anterior, resulta necesario identificar qué factores explican la reprobación en esta población, pues la institución no cuenta con estudios al respecto».',
        ojo: 'La parte que más se olvida es el cierre. Sin él, el texto termina en las consecuencias y la pregunta aparece de la nada.',
    },
    arbol: {
        claves: [
            ['De tarjeta a oración', 'Cada tarjeta del árbol es una frase corta. En el texto se vuelve una oración completa: quién, qué ocurre, en qué magnitud y según qué fuente.'],
            ['Las flechas son conectores', 'La relación que en el árbol es una flecha, en el texto es «esto se debe a», «a esto se suma» o «como consecuencia». Sin el conector, la relación se pierde.'],
            ['El árbol no trae evidencia', 'El árbol dice qué crees que pasa; el planteamiento debe **probarlo**. A cada causa y a cada efecto búscale un dato o un estudio que lo respalde.'],
        ],
        ejemplo: 'Tarjeta: «Es difícil reprogramar la cita por teléfono». En el texto: «A esto se suma la dificultad para reprogramar: la línea de citas del hospital atiende solo en la mañana, por lo que muchos pacientes no logran cancelar a tiempo».',
        ojo: 'No copies las tarjetas como una lista con viñetas. El planteamiento es prosa: párrafos con oraciones enlazadas.',
    },
    datos: {
        claves: [
            ['Qué debe probar cada dato', 'Tres cosas distintas: que el problema **existe** (magnitud), que **cambia** (tendencia o comparación con otro lugar) y que tiene las causas o efectos que afirmas (antecedentes).'],
            ['Fuente original y cita', 'Busca el informe original, no la noticia que lo comenta. En el texto, cita con autor o entidad y año, como pide el estilo APA, y guarda la referencia completa.'],
            ['El dato se interpreta', 'Una cifra sola no dice nada. Acompáñala de una frase que explique qué significa: con qué se compara, si es alta o baja y para quién.'],
        ],
        ejemplo: 'Sin interpretar: «El 38 % reprobó cálculo». Interpretado: «El 38 % de los estudiantes de primer semestre reprobó cálculo en 2025 (Oficina de Registro, 2025); es decir, más de uno de cada tres deberá repetir la asignatura».',
        ojo: 'Si no encuentras cifras de tu institución, dilo y usa la más cercana. Esa ausencia de datos locales es, además, un buen argumento para el cierre.',
    },
    conectores: {
        claves: [
            ['El conector anuncia la función', '«Esto se debe a» avisa que vienen causas; «como consecuencia», efectos; «por lo anterior», el cierre. El lector sabe en qué parte del planteamiento está sin necesidad de subtítulos.'],
            ['También dentro del párrafo', 'Entre oraciones de un mismo párrafo se usan conectores de adición o precisión: «además», «asimismo», «en particular», «es decir». Evitan que cada oración empiece de cero.'],
            ['El contraste abre el problema', '«Sin embargo» y «no obstante» sirven para pasar del contexto al problema: muestran lo que debería ocurrir frente a lo que en realidad ocurre hoy.'],
        ],
        ejemplo: '«La universidad ofrece tutorías gratuitas de cálculo. **Sin embargo**, el 38 % de los estudiantes de primer semestre reprobó la asignatura en 2025. **Esto se debe**, entre otras causas, a los vacíos del bachillerato…».',
        ojo: 'Un conector no arregla una relación que no existe. Antes de escribir «por consiguiente», comprueba que lo anterior de verdad produce lo que sigue.',
    },
    errores: {
        claves: [
            ['Tres familias de errores', 'De evidencia (sin datos, con opiniones), de foco (empieza lejos, mezcla problemas) y de límites (propone la solución, se vuelve justificación, no cierra). Ubicar la familia indica qué revisar.'],
            ['Revisión con colores', 'Marca con un color cada parte: contexto, problema, causas, consecuencias y cierre. Lo que quede sin color sobra o está en la sección equivocada; el color que falte es la parte ausente.'],
            ['Impersonal y sin adjetivos', 'Se escribe en tercera persona. Palabras como «grave», «alarmante» o «preocupante» son valoraciones: reemplázalas por la cifra que permite al lector sacar esa conclusión por su cuenta.'],
        ],
        ejemplo: 'Con opinión: «Es alarmante que los pacientes no valoren sus citas». Con evidencia: «En 2025 se perdió una de cada cinco citas de consulta externa; el olvido de la fecha fue la razón más reportada por los pacientes».',
        ojo: 'Revisa después de dejar reposar el texto, o pide a un compañero que lo lea. Recién escrito, casi nadie ve sus propios vacíos.',
    },
    reescribe: {
        claves: [
            ['Tres operaciones', 'Delimitar (quiénes, dónde, cuándo), sustentar (dato y fuente) y depurar (quitar opiniones y soluciones). Aplícalas **en ese orden** a cada oración débil de tu borrador.'],
            ['Preguntas para delimitar', '¿De quiénes hablo exactamente? ¿En qué lugar? ¿En qué periodo? Si la oración no responde al menos las dos primeras, todavía es una generalidad sin dueño.'],
            ['Qué hacer con lo que quitas', 'La solución que borras va a los objetivos o a la metodología; la opinión, si encuentras respaldo, se convierte en una causa con su fuente. Nada valioso se pierde.'],
        ],
        ejemplo: 'Antes: «Los pacientes son irresponsables y faltan mucho, por eso hace falta una aplicación». Después: «En 2025 se perdió el 22 % de las citas de consulta externa de un hospital de Sincelejo (Oficina de Estadística, 2025)».',
        ojo: 'No agregues un dato solo para que haya un número. Debe medir exactamente lo que la oración afirma, en tu población o en la más cercana.',
    },
    coherencia: {
        claves: [
            ['Prueba de las palabras clave', 'Subraya en tu pregunta las variables, la población y el lugar. Cada una debe aparecer en el planteamiento, con las mismas palabras, antes del párrafo de cierre.'],
            ['Los mismos términos siempre', 'Si escribes «inasistencia», no alternes después con «ausentismo» o «incumplimiento» para no repetir. En un texto académico, cambiar la palabra hace pensar al lector que cambiaste de variable.'],
            ['En ambos sentidos', 'El planteamiento tampoco debe abrir temas que la pregunta no recoge. Si dedicas un párrafo al transporte rural y la pregunta no lo incluye, sobra el párrafo o falta ajustar la pregunta.'],
        ],
        ejemplo: 'Pregunta: «¿Qué factores están asociados a la inasistencia a citas médicas en los pacientes de consulta externa de un hospital de Sincelejo?». El planteamiento debe mostrar la inasistencia con un dato y al menos dos posibles factores con su respaldo.',
        ojo: 'Si al terminar el planteamiento la pregunta ya no encaja, es válido ajustar la pregunta. Lo que no se puede es dejarlos distintos.',
    },
};
