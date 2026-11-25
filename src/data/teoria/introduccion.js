// Teoría ampliada de la clase «Introducción»: una entrada por diapositiva de teoría (ver components/deck/Teoria.jsx).
export default {
    quees: {
        claves: [
            ['Tres funciones a la vez', 'Ubica al lector en el tema, le dice qué problema se estudia y le anuncia qué va a encontrar. Si al terminar de leerla no puede decir de qué trata tu proyecto, no cumplió.'],
            ['Resume, no desarrolla', 'Cada sección del proyecto aparece aquí reducida a una o dos oraciones. El detalle (las cifras, las teorías, el procedimiento) se queda en su sección; la introducción solo deja ver que existe.'],
            ['Introducción frente a resumen', 'El resumen se entiende solo y cabe en un párrafo de máximo 250 palabras. La introducción tiene varios párrafos, entre 500 y 1000 palabras, y **conduce** al lector hacia el resto del documento.'],
        ],
        ejemplo: 'Planteamiento: tres párrafos con cifras de inasistencia por servicio y por año. Introducción: «En un hospital de Sincelejo, una de cada cinco citas de consulta externa se pierde». Una oración resume lo que el planteamiento demuestra.',
        ojo: 'Prueba rápida: dale tu introducción a alguien que no conoce el proyecto. Debe poder decirte qué vas a estudiar, en quiénes y para qué.',
    },
    alfinal: {
        claves: [
            ['Por qué cambia tanto', 'Durante la formulación ajustas la pregunta, recortas la población y cambias verbos de los objetivos. Una introducción escrita al comienzo termina describiendo un proyecto que ya no existe.'],
            ['Un borrador temprano sí sirve', 'Puedes escribir al inicio un párrafo provisional para aclarar tus ideas. Trátalo como una nota de trabajo: la versión que se entrega se redacta cuando las demás secciones están cerradas.'],
            ['El orden de trabajo', 'Reúne primero las piezas: una oración del planteamiento, una de la justificación, el objetivo general, la pregunta y una línea del método. Redactar la introducción es **enlazar** esas piezas, no inventar texto nuevo.'],
        ],
        ejemplo: 'En marzo el objetivo decía «describir la inasistencia»; en mayo quedó «analizar los factores asociados a la inasistencia». Quien escribió la introducción en marzo anuncia un estudio descriptivo que el resto del documento ya no hace.',
        ojo: 'Cada vez que cambies el objetivo, la población o el método después de escribirla, vuelve a leerla completa: es la sección que más rápido queda desactualizada.',
    },
    partes: {
        claves: [
            ['Por qué ese orden', 'Sigue las preguntas que se hace el lector: ¿de qué trata?, ¿cuál es el problema?, ¿por qué importa?, ¿qué se hará?, ¿cómo? y ¿qué voy a leer? Cambiar el orden lo obliga a adivinar.'],
            ['Cuánto ocupa cada uno', 'Contexto, problema e importancia se llevan la mayor parte; objetivo, método y organización son párrafos cortos. Si el contexto pasa de un tercio del texto, estás repitiendo el planteamiento.'],
            ['El vacío es la bisagra', 'El movimiento de importancia termina diciendo qué **no se sabe** todavía. Esa frase justifica el objetivo que viene enseguida: el estudio existe para llenar ese vacío.'],
        ],
        ejemplo: '«Aunque la inasistencia se ha medido en hospitales de ciudades capitales, no se han estudiado sus factores en esta institución (vacío). En consecuencia, esta investigación tiene como objetivo analizar los factores asociados a la inasistencia…» (objetivo).',
        ojo: 'Un movimiento por párrafo. Si en un mismo párrafo mezclas contexto, objetivo y método, el lector no distingue dónde termina el problema y dónde empieza tu propuesta.',
    },
    embudo: {
        claves: [
            ['Cada oración estrecha', 'Pasa del país a la región, de la región a la institución, del fenómeno general a tu variable. Si una oración no acerca al lector a tu objetivo, sobra.'],
            ['Tres niveles bastan', 'Tema general, situación en tu contexto y problema específico. Empezar por el mundo y seguir por el continente, el país, el departamento y la ciudad alarga el embudo sin aportar nada.'],
            ['El dato va arriba', 'Una cifra con fuente en las primeras oraciones muestra que el tema es real y actual. Hacia el final del embudo ya no hacen falta datos: hace falta precisión sobre **qué** estudiarás.'],
        ],
        ejemplo: '«En Colombia, la deserción universitaria se concentra en los primeros semestres (tema). En la facultad de ingeniería, 3 de cada 10 estudiantes de primer semestre no se matriculan en el segundo (tu problema). No se han estudiado los factores asociados en esa facultad (lo que falta)».',
        ojo: 'El embudo debe terminar exactamente en tu objetivo general. Si la última oración podría servir para otro proyecto, todavía está demasiado ancho.',
    },
    estilo: {
        claves: [
            ['Propuesta o informe final', 'El tiempo verbal depende del momento. En la propuesta el estudio aún no se hace: «se analizará». En el informe final ya se hizo: «se analizó». Al pasar de uno a otro hay que cambiar los verbos.'],
            ['Impersonal sin enredos', 'La forma impersonal no obliga a escribir oraciones largas. «Se aplicará una encuesta a 278 pacientes» es impersonal y directa; «se procederá a llevar a cabo la aplicación» dice lo mismo con el doble de palabras.'],
            ['Oraciones cortas y concretas', 'Una idea por oración y, como guía, no más de tres líneas. Prefiere el sustantivo preciso («pacientes de consulta externa») al genérico («las personas»), y el verbo al adjetivo.'],
        ],
        ejemplo: 'Débil: «Yo quiero investigar este tema tan importante porque me parece que afecta mucho a la gente». Mejor: «Esta investigación analizará los factores asociados a la inasistencia a citas médicas en pacientes de consulta externa».',
        ojo: 'No mezcles tiempos: si en un párrafo escribes «se analizará» y en el siguiente «se analizó», el lector no sabe si el estudio ya se hizo.',
    },
    conectores: {
        claves: [
            ['Cada conector promete algo', '«Sin embargo» anuncia un contraste; «en consecuencia», un resultado de lo anterior; «para ello», un medio. Elige el conector por la **relación lógica** entre los párrafos, no porque suene académico.'],
            ['El giro hacia el problema', 'El conector más importante es el que pasa del contexto al vacío: «sin embargo», «no obstante», «aunque». Marca el punto donde termina lo que se sabe y empieza lo que falta.'],
            ['Uno por transición', 'Basta un conector al inicio del párrafo. Dentro del párrafo, las oraciones se enlazan mejor repitiendo el sujeto o usando un pronombre que acumulando «además» y «asimismo».'],
        ],
        ejemplo: '«En la actualidad, la inasistencia afecta… En particular, en un hospital de Sincelejo… **Sin embargo**, no se han estudiado sus factores… **En consecuencia**, esta investigación tiene como objetivo… Para ello, se desarrolla un estudio…».',
        ojo: 'Lee solo la primera palabra de cada párrafo. Si no se alcanza a seguir el recorrido (tema, problema, vacío, objetivo, método, organización), faltan conectores o están mal elegidos.',
    },
    errores: {
        claves: [
            ['Dos familias de errores', 'Unos son de **contenido**: falta un movimiento o sobra detalle de otra sección. Otros son de **coherencia**: la introducción dice algo distinto de lo que dice el proyecto. Los segundos pesan más en la evaluación.'],
            ['Cómo revisarla', 'Marca al margen de cada párrafo qué movimiento cumple. Si un párrafo no recibe etiqueta, sobra; si un movimiento no aparece, falta. Luego compara objetivo y pregunta, palabra por palabra, con los del proyecto.'],
            ['Ni corta ni inflada', 'Una introducción de media página casi siempre omite el vacío o el método. Una de cuatro páginas suele traer citas y teoría que pertenecen al marco referencial.'],
        ],
        ejemplo: 'Introducción revisada con etiquetas: párrafo 1, contexto; párrafo 2, contexto otra vez; párrafo 3, problema; párrafo 4, objetivo. Diagnóstico: sobra un párrafo de contexto y faltan importancia, método y organización.',
        ojo: 'No corrijas la introducción para tapar una incoherencia del proyecto. Si el objetivo ya no corresponde a la pregunta, arregla primero esas secciones.',
    },
    reescribe: {
        claves: [
            ['Pregunta qué dato falta', 'Una frase débil casi siempre esconde un dato que ya tienes en otra sección: la población, el lugar, la cifra, el verbo del objetivo. Reescribir es ir a buscarlo y ponerlo.'],
            ['Del «vamos a» al objetivo', 'Cambia «vamos a investigar», «queremos ver» o «se hablará de» por la fórmula «esta investigación tiene como objetivo», seguida del objetivo general tal como está escrito en tu proyecto.'],
            ['Quita los intensificadores', '«Muy», «sumamente», «desde siempre» y «todos» no informan. Al borrarlos, la frase queda vacía o queda mejor; en los dos casos ya sabes qué hacer con ella.'],
        ],
        ejemplo: 'Antes: «La deserción es un tema muy preocupante hoy en día». Después: «En la facultad de ingeniería de una universidad pública de Sincelejo, 3 de cada 10 estudiantes de primer semestre no se matriculan en el segundo».',
        ojo: 'La versión fuerte puede ser más larga que la débil, pero cada palabra añadida debe ser información: quién, dónde, cuánto o qué se hará.',
    },
    coherencia: {
        claves: [
            ['Qué debe coincidir', 'Cuatro cosas: el **objetivo general**, la pregunta, la población con su lugar y el tipo de estudio. Son los datos que el evaluador busca primero y los que compara entre secciones.'],
            ['Por qué copiar y no parafrasear', 'Cambiar «analizar» por «estudiar» o «determinar» parece un detalle de estilo, pero cada verbo anuncia un alcance distinto. El objetivo se copia literal; lo demás sí se resume con tus palabras.'],
            ['El mismo nombre siempre', 'Si en el título la variable se llama «inasistencia a citas médicas», no la llames después «ausentismo» ni «incumplimiento». Cambiar el término hace pensar que son variables distintas.'],
        ],
        ejemplo: 'Incoherente: el objetivo general dice «analizar los factores asociados a la inasistencia» y la introducción anuncia «determinar las causas de la inasistencia». «Causas» promete un alcance explicativo que el proyecto no tiene.',
        ojo: 'Haz esta comparación al final, con el documento completo abierto: título, pregunta, objetivo general e introducción deben nombrar la misma población y el mismo lugar.',
    },
};
