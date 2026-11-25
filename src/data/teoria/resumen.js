// Teoría ampliada de la clase «Resumen»: una entrada por diapositiva de teoría (ver components/deck/Teoria.jsx).
export default {
    quees: {
        claves: [
            ['Informativo, no indicativo', 'Un resumen informativo **dice** qué se encontró («el olvido fue la causa más frecuente»). Uno indicativo solo anuncia («se presentan las causas»). En un informe de investigación se pide el primero.'],
            ['Para qué se usa', 'Con el resumen el lector decide si lee el documento completo, y es el texto que muestran los repositorios y las bases de datos. Muchas veces es lo único que circula de tu trabajo.'],
            ['Se entiende solo', 'No remite a otras partes («como se verá en el capítulo 3») ni depende de ellas. Quien lo lee sin el documento debe entender qué se hizo, con quiénes y qué resultó.'],
        ],
        ejemplo: 'Indicativo: «En este trabajo se analizan los factores de la inasistencia y se presentan conclusiones». Informativo: «El olvido de la cita fue la causa más frecuente de inasistencia (41 %) y se relacionó con no recibir recordatorio».',
        ojo: 'El rango de 150 a 250 palabras es el más común, y 250 es el máximo habitual en APA 7; aun así, revisa si tu universidad o la revista piden otro.',
    },
    donde: {
        claves: [
            ['En página propia', 'En el formato APA 7 el resumen ocupa una página aparte, después de la portada, con el título «Resumen» centrado y en negrita. El texto de la introducción empieza en la página siguiente.'],
            ['Por qué al final', 'Es una reducción del documento terminado. Escribirlo antes obliga a adivinar resultados; escribirlo después consiste en tomar una o dos oraciones de cada sección y enlazarlas.'],
            ['Propuesta frente a informe final', 'Si lo que entregas es la propuesta, aún no hay resultados: el resumen presenta problema, objetivo y método, y anuncia los resultados **esperados**. El resumen completo llega con el informe final.'],
        ],
        ejemplo: 'Propuesta: «Se desarrollará un estudio cuantitativo correlacional con una muestra de pacientes de consulta externa…». Informe final: «Se desarrolló un estudio cuantitativo correlacional con 278 pacientes… Los resultados mostraron que…».',
        ojo: 'Si corriges resultados o conclusiones después de escribir el resumen, corrígelo también: es frecuente que quede con cifras de una versión anterior.',
    },
    partes: {
        claves: [
            ['Una oración de contexto', 'Si la usas, que sea una sola y diga por qué importa el problema. El resumen no tiene espacio para antecedentes: dos oraciones de contexto ya le quitan lugar a los resultados.'],
            ['El método, con lo esencial', 'Enfoque, alcance y diseño, participantes con su número, instrumento y análisis principal. Lo suficiente para que el lector pueda juzgar qué tan sólidos son los resultados que vienen después.'],
            ['Resultados que responden', 'Elige los dos o tres hallazgos que responden directamente al **objetivo general**, con su cifra. No intentes meter un resultado por cada tabla del informe.'],
        ],
        ejemplo: 'Deserción: «El objetivo fue analizar los factores asociados a la deserción en primer semestre (objetivo). Se encuestó a 240 estudiantes de ingeniería (método). El 31 % no continuó; la reprobación de cálculo fue el factor más asociado (resultados). Se concluye que…».',
        ojo: 'Las cuatro partes van seguidas, en un párrafo, sin subtítulos. El resumen con rótulos («Objetivo:», «Método:») solo se usa cuando una revista lo pide así.',
    },
    forma: {
        claves: [
            ['Por qué sin citas', 'El resumen debe poder leerse sin la lista de referencias, y lo que resume es **tu** estudio. Por la misma razón no menciona tablas ni figuras: el lector no las tiene a la mano.'],
            ['Cifras y siglas', 'Reporta los números clave con su unidad (41 %, 278 pacientes). Si una sigla es indispensable, escribe el nombre completo la primera vez; si aparece una sola vez, no la uses.'],
            ['Cómo recortar', 'Para bajar de 250 palabras, quita primero el contexto y los detalles del procedimiento; después, adjetivos y frases de relleno («cabe resaltar que»). Los resultados son lo último que se toca.'],
        ],
        ejemplo: 'La misma idea en la mitad de palabras: «Es importante mencionar que, tras el proceso de análisis de la información recolectada, se pudo evidenciar que el olvido de la cita fue la causa más frecuente» pasa a «El olvido de la cita fue la causa más frecuente de inasistencia (41 %)».',
        ojo: 'Cuenta las palabras con el procesador de texto, no a ojo, y sin incluir el título «Resumen» ni la línea de palabras clave.',
    },
    ejemplo: {
        claves: [
            ['Cómo está repartido', 'Una oración de contexto, una de objetivo, una de método, dos de resultados y una de conclusión. Los resultados ocupan la mayor parte, como indica la tabla de proporciones.'],
            ['Lo que hace bien', 'Nombra población y lugar, da el tamaño de la muestra, reporta cifras con su estadístico y termina con una implicación práctica redactada con prudencia: «podrían reducirla», no «la reducirán».'],
            ['Estadísticos, solo los necesarios', 'Incluye el coeficiente y el valor p del hallazgo principal porque sustentan la relación. Un resumen no necesita todos los estadísticos del informe: basta el que respalda la conclusión.'],
        ],
        ejemplo: 'Prueba de lectura: subraya en el ejemplo cada verbo principal. «Reduce» (contexto, presente); «tuvo», «se desarrolló», «mostraron» y «fue» (pasado); «se concluye» (presente). Los tiempos siguen la regla de forma: pasado para lo hecho, presente para la conclusión.',
        ojo: 'Los datos del ejemplo son ilustrativos. En tu resumen, cada cifra debe coincidir exactamente con la que aparece en tu sección de resultados.',
    },
    verbos: {
        claves: [
            ['Verbos según el alcance', 'En resultados, el verbo debe corresponder a lo que el diseño permite: «se encontró una relación» en un estudio correlacional; «influyó» o «produjo» solo si el estudio fue explicativo o experimental.'],
            ['Voz y sujeto', 'Alterna la forma impersonal («se aplicó un cuestionario») con sujetos concretos («los resultados mostraron», «los pacientes jóvenes faltaron más»). Seis oraciones seguidas que empiezan con «se» cansan.'],
            ['La frase de cierre', 'La conclusión del resumen dice qué significa el hallazgo y para qué sirve, con verbos prudentes: «sugieren», «podría», «permite orientar». Evita cerrar con «se recomienda seguir investigando», que no informa.'],
        ],
        ejemplo: '«El propósito del estudio fue analizar… Participaron 240 estudiantes de primer semestre… Se encontró que la reprobación de cálculo se asoció con la deserción… Los hallazgos sugieren que las tutorías tempranas podrían reducirla».',
        ojo: 'Las frases de inicio son un apoyo, no una plantilla obligatoria. Si tus cuatro partes empiezan igual que el ejemplo de la clase, cambia al menos dos.',
    },
    'clave-que': {
        claves: [
            ['Para qué sirven', 'Las bases de datos y los repositorios indexan el trabajo por esos términos. Si eliges palabras que nadie busca, o demasiado amplias, tu estudio no aparece en las búsquedas de quien lo necesita.'],
            ['Formato APA 7', 'Una línea debajo del resumen, con sangría, que empieza con la etiqueta «Palabras clave:» en cursiva. Los términos van en minúscula, separados por comas y sin punto final.'],
            ['Complementan el título', 'Las palabras del título ya sirven para encontrar el trabajo. Aprovecha las palabras clave para añadir términos que no caben allí: la población, el contexto, el método o un sinónimo de uso frecuente.'],
        ],
        ejemplo: 'Título: «Factores asociados a la deserción en primer semestre de ingeniería». Palabras clave: deserción estudiantil, educación superior, rendimiento académico, permanencia, estudiantes de primer año. Tres de los cinco términos no están en el título.',
        ojo: 'APA 7 sugiere de tres a cinco palabras clave; algunas instituciones aceptan hasta seis. Confirma el número en la guía de tu programa.',
    },
    'clave-elegir': {
        claves: [
            ['Del término propio al normalizado', 'Tú dices «inasistencia a citas»; el tesauro puede registrar otro término para el mismo concepto. Buscar tu palabra en el tesauro te muestra el **descriptor** que usan las bases de datos.'],
            ['Ni muy amplias ni muy estrechas', '«Salud» devuelve millones de documentos; «inasistencia a citas de medicina interna en Sincelejo» no la busca nadie. El punto medio es el concepto: «citas médicas», «barreras de acceso», «consulta externa».'],
            ['Prueba de búsqueda', 'Escribe tus palabras clave en Google Académico o en una base de datos. Si los resultados se parecen a tu estudio, están bien elegidas; si no, cámbialas.'],
        ],
        ejemplo: 'Para el estudio de deserción: variable principal, «deserción estudiantil»; variable asociada, «rendimiento académico»; contexto, «educación superior». Luego se verifica cada término en el Tesauro de la UNESCO o en ERIC.',
        ojo: 'No uses siglas ni abreviaturas como palabras clave, y evita términos que solo se entienden dentro de tu institución.',
    },
    errores: {
        claves: [
            ['El error de fondo', 'Casi todos vienen de escribir el resumen como una **presentación** del trabajo, que anuncia, en lugar de una síntesis, que informa. La señal: verbos en futuro y ninguna cifra.'],
            ['Lista de comprobación', 'Subraya con cuatro colores objetivo, método, resultados y conclusión. Si falta un color, falta una parte; si un color ocupa más de la mitad, las proporciones están mal.'],
            ['Coherencia con el documento', 'Objetivo, tamaño de muestra y cifras deben ser idénticos a los del informe. Una diferencia entre el resumen y los resultados es de lo primero que detecta un evaluador.'],
        ],
        ejemplo: 'Resumen con errores: «La deserción es un problema grave en Colombia (Pérez, 2022). En este trabajo se presentarán los resultados de una encuesta». Tiene cita, verbo en futuro y ningún hallazgo.',
        ojo: 'No copies y pegues oraciones enteras de la introducción o de las conclusiones: quedan largas y con remisiones. Redáctalas de nuevo, más cortas.',
    },
    antes: {
        claves: [
            ['Qué cambia', 'La versión fuerte reemplaza el verbo vago («se habla», «salió») por uno preciso («analizar», «mostraron»), nombra la variable completa y añade la cifra. La idea es la misma; cambia la información que entrega.'],
            ['Registro académico', '«Se hicieron encuestas y salió que» es lenguaje oral. En el resumen se escribe «se aplicó un cuestionario» y «los resultados mostraron». No es adorno: son los términos exactos del método.'],
            ['Cada oración, una parte', 'Al reescribir, pregúntate a cuál de las cuatro partes pertenece la oración. Si no es objetivo, método, resultado ni conclusión, probablemente no cabe en el resumen.'],
        ],
        ejemplo: 'Débil: «Al final se vio que hay que hacer algo con los estudiantes que pierden». Fuerte: «Se concluye que la reprobación de cálculo está asociada a la deserción, por lo que las tutorías tempranas podrían reducirla».',
        ojo: 'Precisión no es extensión: si la versión fuerte supera las 40 palabras, divídela o quita detalles que ya están en otra oración.',
    },
};
