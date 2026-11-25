// Teoría ampliada de la clase «Justificación»: una entrada por diapositiva de teoría (ver components/deck/Teoria.jsx).
export default {
    quees: {
        claves: [
            ['Es un texto argumentativo', 'No describe ni narra: **defiende** una decisión. Cada párrafo sostiene una razón por la que el estudio merece hacerse y la respalda con un beneficio o un dato.'],
            ['Mira hacia adelante', 'El planteamiento dice qué pasa hoy; la justificación dice **qué cambia** si el estudio se hace: quién gana, qué se podrá decidir y qué conocimiento queda.'],
            ['Se escribe para un evaluador', 'Quien la lee decide si aprueba el proyecto o le asigna recursos. Por eso responde a sus dudas: ¿sirve?, ¿a quién?, ¿es nuevo?, ¿se puede hacer?'],
        ],
        ejemplo: '«Los resultados permitirán a la coordinación de consulta externa programar recordatorios en los horarios con más inasistencias» argumenta; «la inasistencia es un problema grave» solo repite el problema.',
        ojo: 'Si un párrafo se puede pasar al planteamiento sin cambiarle nada, no es justificación: le falta decir para qué sirve investigarlo.',
    },
    preguntas: {
        claves: [
            ['¿Por qué?', 'La razón de fondo: el problema es frecuente, costoso o está sin estudiar en ese lugar. Se apoya en un dato del planteamiento, sin volver a contarlo.'],
            ['¿Para quién y para qué?', 'Los **beneficiarios** (directos e indirectos) y el **uso** de los resultados: una decisión, un programa, una política o una herramienta.'],
            ['¿Se puede?', 'La viabilidad cierra el argumento: hay acceso a la población, tiempo, recursos y permisos. Un estudio valioso pero imposible no se aprueba.'],
        ],
        ejemplo: 'Por qué: 3 de cada 10 citas se pierden. Para quién: pacientes y hospital. Para qué: ajustar los recordatorios. ¿Se puede?: el hospital autorizó el acceso a la agenda del último año.',
        ojo: 'Responder solo «por qué me interesa» es motivación personal. La pregunta es por qué le interesa a los demás.',
    },
    criterios: {
        claves: [
            ['No hay que cubrir los cinco', 'Un estudio aplicado suele ser fuerte en conveniencia, relevancia social e implicaciones prácticas; uno básico, en valor teórico. Desarrolla bien los que apliquen en lugar de forzar todos.'],
            ['Valor teórico', 'Aporta cuando llena un **vacío**: nadie lo ha estudiado en esa población, hay resultados contradictorios o se pone a prueba una teoría en un contexto nuevo.'],
            ['Utilidad metodológica', 'Aporta cuando deja algo reutilizable: un instrumento validado, una forma de medir una variable o un procedimiento que otros pueden repetir.'],
        ],
        ejemplo: 'Valor teórico: «No se encontraron estudios sobre inasistencia a citas en hospitales públicos de Sucre; los disponibles son de ciudades capitales». Utilidad metodológica: «El cuestionario validado queda disponible para otros hospitales de la región».',
        ojo: 'Decir «tiene gran valor teórico» no es argumentar. Di **cuál** es el vacío y **qué** deja el estudio.',
    },
    viabilidad: {
        claves: [
            ['Cuatro recursos', '**Tiempo** (cabe en el semestre o el año), **acceso** (a las personas o a los datos), **dinero** (lo que cuesta y quién lo cubre) y **competencias** (el equipo sabe aplicar el método).'],
            ['Viabilidad ética', 'Si participan personas, hace falta su consentimiento informado y, con menores o datos de salud, la autorización de la institución o de un comité de ética.'],
            ['Se demuestra, no se afirma', 'La viabilidad se prueba con hechos: una carta de autorización, una base de datos ya disponible, un asesor con experiencia, un cronograma realista.'],
        ],
        ejemplo: '«El estudio es viable porque el hospital autorizó por escrito el acceso a la agenda de citas de 2025, la muestra es de 278 pacientes atendidos en la misma sede y el equipo cuenta con seis meses para la recolección».',
        ojo: 'La viabilidad también fija el tamaño del proyecto: si no hay acceso a toda la ciudad, se delimita a una sede. Eso se declara luego en alcances y limitaciones.',
    },
    evidencia: {
        claves: [
            ['Tres tipos de respaldo', 'Un **dato** (cifra con fuente y año), un **antecedente** (lo que encontró otro estudio) o una **norma o política** que pide atender el problema.'],
            ['Fuente, lugar y año', 'Un dato sin fuente no convence. Prefiere fuentes oficiales o académicas, lo más cercanas posible a tu población y de los últimos cinco años.'],
            ['Afirmación + evidencia + consecuencia', 'Estructura de un buen argumento: lo que afirmas, el dato que lo sostiene y lo que eso implica para tu estudio.'],
        ],
        ejemplo: '«La inasistencia genera pérdidas para el sistema (afirmación). En el hospital se perdieron 4 de cada 10 cupos de medicina interna en 2025, según su oficina de estadística (evidencia). Conocer sus causas permitirá recuperar esos cupos (consecuencia)».',
        ojo: 'Usa solo cifras que puedas rastrear hasta su fuente. Una cifra inventada o «aproximada» invalida todo el argumento ante un evaluador.',
    },
    conectores: {
        claves: [
            ['Marcan la relación entre ideas', 'Un conector le dice al lector si lo que sigue es una **causa** (porque, dado que), una **consecuencia** (por lo tanto, de este modo) o una **adición** (además, asimismo).'],
            ['Uno por párrafo, al inicio', 'Abrir cada párrafo con un conector distinto ordena el texto: conveniencia, luego beneficiarios, luego aportes y, al final, viabilidad.'],
            ['Variedad sin exceso', 'Repetir «además» cinco veces cansa; encadenar tres conectores en una oración confunde. Basta uno donde cambia la idea.'],
        ],
        ejemplo: '«**En primer lugar**, el estudio es conveniente porque… **Asimismo**, beneficiará a… **En lo práctico**, los resultados servirán para… **Finalmente**, es viable dado que…».',
        ojo: 'El conector debe ser verdadero: «por lo tanto» exige que lo anterior realmente lleve a lo siguiente.',
    },
    diferencia: {
        claves: [
            ['Tiempo verbal distinto', 'El planteamiento habla en presente de lo que **ocurre**; la justificación, en futuro o condicional de lo que el estudio **permitirá** o **aportará**.'],
            ['Dato compartido, uso distinto', 'Los dos pueden usar la misma cifra: en el planteamiento prueba que el problema existe; en la justificación muestra cuánto se gana al resolverlo.'],
            ['Orden en el documento', 'Primero se plantea el problema y se formulan pregunta y objetivos; después se justifica. Por eso la justificación puede referirse a «el problema descrito» sin repetirlo.'],
        ],
        ejemplo: 'Planteamiento: «El 38 % de los estudiantes reprobó cálculo en 2025». Justificación: «Identificar las causas de esa reprobación permitirá a la facultad orientar las tutorías hacia quienes más las necesitan».',
        ojo: 'Una justificación que dedica la mitad de sus párrafos a describir el problema está repitiendo el planteamiento.',
    },
    errores: {
        claves: [
            ['El error de fondo', 'Casi todos los errores vienen de lo mismo: afirmar que el estudio es importante **sin decir para quién ni para qué**.'],
            ['Cómo detectarlos', 'Subraya en cada párrafo el beneficiario y el beneficio. Si no encuentras alguno de los dos, el párrafo es descripción o es opinión.'],
            ['Promesas que el estudio no cumple', 'Un trabajo de grado no «resuelve» ni «elimina» un problema: **aporta información** para que otros decidan. Prometer de más resta credibilidad.'],
        ],
        ejemplo: 'Débil: «Este estudio solucionará la deserción». Fuerte: «Este estudio identificará los factores asociados a la deserción en primer semestre, insumo para el programa de permanencia».',
        ojo: 'Revisa que cada beneficio que prometes se pueda obtener con tus objetivos. Si no hay un objetivo que lo produzca, quítalo.',
    },
    reescribe: {
        claves: [
            ['Tres preguntas para reescribir', '¿Quién se beneficia, con nombre? ¿Qué podrá hacer con los resultados? ¿Qué dato o fuente lo respalda?'],
            ['De adjetivos a hechos', 'Cambia «muy importante», «de gran impacto» o «fundamental» por el hecho que lo demuestra: una cifra, una decisión, un producto.'],
            ['Una idea por oración', 'Los argumentos fuertes son cortos. Si una oración pasa de tres líneas, pártela: primero la afirmación, luego el respaldo.'],
        ],
        ejemplo: 'Antes: «El tema es de gran importancia para la sociedad». Después: «Los resultados permitirán a la Secretaría de Salud de Sincelejo priorizar las sedes con más citas perdidas».',
        ojo: 'Reescribir no es alargar. La versión fuerte suele tener las mismas palabras que la débil, pero concretas.',
    },
};
