// Teoría ampliada de la clase «Pregunta de investigación»: una entrada por diapositiva de teoría (ver components/deck/Teoria.jsx).
export default {
    funcion: {
        claves: [
            ['La pregunta manda', 'De la pregunta dependen el objetivo, el diseño, los instrumentos y hasta las conclusiones, que no son otra cosa que su respuesta. Por eso un cambio en ella obliga a revisar todo lo demás.'],
            ['Qué comparten las tres', 'Las tres formas llevan las mismas variables, población y lugar. Además, el verbo sustantivado del título, el tipo de pregunta y el infinitivo del objetivo apuntan a la misma acción: análisis, «¿qué relación…?», analizar.'],
            ['En qué orden se escriben', 'En esta ruta formulas primero el título y luego la pregunta y el objetivo. En la práctica se ajustan juntos: al precisar la pregunta es normal volver al título y corregirlo.'],
        ],
        ejemplo: 'Título: «Análisis de los factores asociados a la inasistencia a citas médicas…». Pregunta: «¿Qué factores están asociados a la inasistencia a citas médicas…?». Objetivo: «Analizar los factores asociados a la inasistencia a citas médicas…». Cambia la forma, no el estudio.',
        ojo: 'El objetivo no es la pregunta sin signos. La pregunta dice qué quieres saber; el objetivo, qué harás para saberlo, y debe poder cumplirse y verificarse.',
    },
    camino: {
        claves: [
            ['Primero con tus palabras', 'Escribir «quiero saber…» sin tecnicismos te muestra si de verdad hay una duda. Si lo único que sale es «quiero hacer una app», tienes una tarea, no una pregunta.'],
            ['De la duda al tipo', 'Mira qué clase de respuesta esperas: una descripción, una diferencia, una relación, una causa, un pronóstico, una valoración o una propuesta. Esa respuesta esperada es la que define el tipo de pregunta.'],
            ['Qué se conserva del título', 'Pasan a la pregunta, sin cambiar, las variables, la población y el lugar. Solo cambia el arranque: el verbo sustantivado se reemplaza por la expresión interrogativa que corresponde a ese tipo.'],
        ],
        ejemplo: 'Título: «Análisis de los factores asociados a la inasistencia a citas médicas en pacientes de consulta externa de un hospital de Sincelejo». Quiero saber con qué se relaciona que falten. Tipo: correlacional. Pregunta: «¿Qué factores están asociados a la inasistencia a citas médicas en los pacientes…?».',
        ojo: 'Si al formular la pregunta te descubres preguntando por otra cosa que la del título, no la fuerces. Decide cuál refleja lo que quieres saber y ajusta el otro.',
    },
    tipos: {
        claves: [
            ['El tipo fija el alcance', 'Cada tipo exige un estudio distinto. Describir pide medir una variable; relacionar, medir dos en los mismos casos; explicar o evaluar, un diseño que permita atribuir el resultado a una causa.'],
            ['Cuantitativa o cualitativa', 'Las preguntas por niveles, frecuencias, diferencias o relaciones se responden con números. Las interpretativas, y muchas exploratorias, con entrevistas y observación: buscan **comprender** significados, no medir. Un estudio mixto combina ambos enfoques.'],
            ['Cada tipo necesita el anterior', 'No se explica lo que no se ha descrito, ni se evalúa una solución sin diagnóstico. Si casi no hay estudios sobre tu problema en ese lugar, empieza por una pregunta exploratoria o descriptiva.'],
        ],
        ejemplo: 'Sobre la inasistencia a citas en un hospital de Sincelejo: descriptiva, «¿Cuál es la frecuencia de…?»; correlacional, «¿Qué relación existe entre el tiempo de espera y…?»; evaluativa, «¿Qué tan efectivo es un sistema de recordatorios para reducir…?».',
        ojo: 'Elige el tipo por lo que puedes responder con tu tiempo y tus datos. Una pregunta descriptiva bien resuelta vale más que una explicativa que no puedes sostener.',
    },
    interrogativas: {
        claves: [
            ['Por qué el sí o no cierra', 'Una respuesta de sí o no cabe en una línea y no da material para analizar. Además suele esconder una suposición sin definir: «¿funciona?» no dice para qué ni comparado con qué.'],
            ['Cada arranque pide una respuesta', '«¿Cuál es el nivel de…?» pide una medida; «¿Qué diferencias…?», una comparación; «¿Qué relación…?», una asociación; «¿Por qué…?» o «¿Qué factores determinan…?», una explicación; «¿Cómo viven…?», una interpretación.'],
            ['Cuidado con «¿por qué?»', 'Es el arranque más exigente: pide causas, y demostrarlas requiere un diseño explicativo. En pregrado suele ser más realista preguntar «¿qué factores se asocian a…?», que se responde con una encuesta o con registros.'],
        ],
        ejemplo: 'Cerrada: «¿Hay inasistencia a las citas en el hospital?». Abierta: «¿Cuál es la frecuencia de inasistencia a citas de consulta externa en un hospital de Sincelejo durante 2026?». La primera se responde con «sí»; la segunda, con un dato.',
        ojo: 'Empezar con «¿Cómo…?» no garantiza nada: «¿Cómo mejorar las ventas?» sigue siendo demasiado amplia. Además del arranque, hacen falta variables y delimitación.',
    },
    variables: {
        claves: [
            ['Variables que se puedan observar', 'Cada variable debe poder observarse en tu población. «Calidad de vida» o «éxito» necesitan un indicador o un instrumento; si no existe o no puedes aplicarlo, la pregunta no se puede responder.'],
            ['Cuántas según el tipo', 'Descriptivas y diagnósticas: una variable. Comparativas: una variable y los grupos que se comparan. Correlacionales: dos o más. Explicativas, predictivas y evaluativas: al menos un factor y un resultado.'],
            ['En lo cualitativo, categorías', 'Una pregunta interpretativa no mide variables: explora **categorías** como experiencias, significados o percepciones. No se definen con una escala, sino a partir de lo que los participantes cuentan.'],
        ],
        ejemplo: 'En «¿Qué relación existe entre el tiempo de espera para la cita y la inasistencia en pacientes de consulta externa?», las variables son el tiempo de espera (en días) y la inasistencia (cita cumplida o no). Los pacientes son la población.',
        ojo: 'No confundas la variable con la población ni con el lugar. «Estudiantes de primer semestre» no varía: es en quiénes observas lo que sí varía.',
    },
    delimitar: {
        claves: [
            ['Delimitada es respondible', 'Los límites te dicen cuántos casos necesitas, dónde están y cuánto tardarás. Sin ellos no puedes calcular una muestra ni saber cuándo terminaste de recoger la información.'],
            ['Los mismos límites del título', 'No inventes una delimitación nueva: copia la población, el lugar y el periodo del título. Si ahora te parecen muy amplios o muy estrechos, corrige los dos textos a la vez.'],
            ['Hasta dónde vale la respuesta', 'Lo que encuentres en un hospital de Sincelejo describe a ese hospital. Extenderlo a otros exige una muestra representativa de ellos o nuevos estudios, y así debe decirse en las conclusiones.'],
        ],
        ejemplo: 'Amplia: «¿Por qué los pacientes no van a las citas?». Delimitada: «¿Qué factores están asociados a la inasistencia a citas médicas en los pacientes de consulta externa de un hospital de Sincelejo?».',
        ojo: 'Delimitar no es llenar la pregunta de detalles. Si pasa de 40 palabras, deja el periodo o los criterios finos para la metodología.',
    },
    errores: {
        claves: [
            ['Qué la hace investigable', 'Tres condiciones: se responde con datos que puedes recoger, su respuesta no se conoce de antemano y está al alcance de tu tiempo y tus recursos. Cada error de la lista rompe alguna.'],
            ['Hechos, no valores', 'La investigación no decide si algo «es bueno» o «debería gustar»: eso es un juicio. Sí puede establecer qué efecto tiene, quiénes lo usan o qué opinan de ello, que son hechos observables.'],
            ['Pregunta general y específicas', 'Si tienes varias preguntas, una es la **general** y las demás, **específicas**: cada una resuelve una parte y juntas responden la general. Más adelante se corresponderán con tus objetivos específicos.'],
        ],
        ejemplo: 'Dos en una: «¿Por qué faltan los pacientes a las citas y cómo solucionarlo?». General: «¿Qué factores están asociados a la inasistencia a citas médicas en los pacientes de consulta externa de un hospital de Sincelejo?». La solución queda para un estudio posterior.',
        ojo: 'Antes de aceptar tu pregunta, imagina la respuesta escrita. Si cabe en una palabra o ya la conoces, no hay investigación que hacer.',
    },
    reescribe: {
        claves: [
            ['Primero: abrirla', 'Cambia el arranque de sí o no por uno que pida una medida, una relación o un efecto. «¿Funciona…?» se vuelve «¿Qué tan efectivo es… para…?»; «¿Hay…?», «¿Cuál es el nivel de…?».'],
            ['Segundo: nombrar las variables', 'Reemplaza las palabras vagas («problemas», «situación», «tema») por lo que vas a observar: una conducta, un indicador, una opinión. Si esperas un efecto, nombra el factor y el resultado.'],
            ['Tercero: delimitarla', 'Añade en quiénes y dónde, tomados del título. Luego léela completa y comprueba que sigue siendo una sola pregunta y que el tipo corresponde a tu objetivo.'],
        ],
        ejemplo: 'Débil: «¿Sirven los recordatorios?». Abierta: «¿Qué tan efectivos son los recordatorios…?». Con variables: «…por mensaje de texto para reducir la inasistencia a citas…?». Delimitada: «…en pacientes de consulta externa de un hospital de Sincelejo?».',
        ojo: 'Al reescribir puede cambiar el tipo de pregunta, por ejemplo de descriptiva a evaluativa. Cuando pase, confirma que ese nuevo estudio es el que quieres y puedes hacer.',
    },
    coherencia: {
        claves: [
            ['Cuatro puntos de control', 'Compara, uno por uno: el verbo del título con el tipo de pregunta, las variables, la población y el lugar. Una diferencia en cualquiera significa que estás describiendo dos estudios distintos.'],
            ['La cadena sigue', 'La misma coherencia se exigirá con el objetivo general, la hipótesis si la hay, el diseño y las conclusiones. Muchos programas la revisan con una **matriz de consistencia**, que pone todo en una tabla.'],
            ['Cuál de los dos se ajusta', 'Cuando no coinciden, manda lo que de verdad quieres saber y puedes responder. Con eso claro se corrige el texto que quedó atrás, sea el título o la pregunta.'],
        ],
        ejemplo: 'Incoherente: título «Diseño de un sistema de recordatorios…» con la pregunta «¿Qué factores están asociados a la inasistencia…?». Coherente: «¿Cómo debería diseñarse un sistema de recordatorios para reducir la inasistencia a citas en un hospital de Sincelejo?».',
        ojo: 'Usar palabras parecidas no basta. «Inasistencia» en el título y «cancelación» en la pregunta son variables distintas: usa siempre el mismo término.',
    },
};
