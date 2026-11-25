// Teoría ampliada de la clase «Árbol de objetivos»: una entrada por diapositiva de teoría (ver components/deck/Teoria.jsx).
export default {
    quees: {
        claves: [
            ['Segundo paso del Marco Lógico', 'En la metodología del **Marco Lógico**, al análisis de problemas le sigue el análisis de objetivos. Se hace sobre el mismo esquema para que ninguna solución aparezca sin un problema que la justifique.'],
            ['De causa–efecto a medio–fin', 'La relación cambia de sentido: antes una causa **producía** el problema; ahora un medio **permite** alcanzar el objetivo. Las flechas siguen yendo de abajo hacia arriba.'],
            ['Estados alcanzados, no tareas', 'Cada tarjeta describe cómo estará la situación cuando mejore («los pacientes recuerdan su cita»), no lo que alguien hará para conseguirlo. Las tareas vienen después, en la metodología.'],
        ],
        ejemplo: 'Problema: «Alta reprobación de cálculo en primer semestre». Objetivo central: «Reducir la reprobación de cálculo en primer semestre». Causa: «vacíos de matemáticas del bachillerato». Medio: «los estudiantes nivelan sus bases de matemáticas al ingresar».',
        ojo: 'Si el árbol del problema tiene errores, el de objetivos los hereda. Corrige primero el del problema y vuelve a convertir.',
    },
    tronco: {
        claves: [
            ['Cómo se voltea', 'Cambia la palabra negativa por su contraria realista: «alta» pasa a «reducir»; «bajo», a «mejorar» o «aumentar»; «deficiente», a «fortalecer». El resto de la frase queda igual.'],
            ['Resultado frente a actividad', 'Un resultado se comprueba midiendo lo mismo que medía el problema: ¿bajó la inasistencia? Una actividad se comprueba con un «se hizo». El tronco siempre es un resultado.'],
            ['Del árbol a tu investigación', 'El objetivo central dice qué situación se busca. Tu objetivo general dirá qué **conocimiento o propuesta** aporta tu estudio para acercarse a ella; por eso su verbo puede ser «determinar», «analizar» o «proponer».'],
        ],
        ejemplo: 'Objetivo central del árbol: «Reducir la inasistencia a las citas de consulta externa». Objetivo general de un estudio: «Determinar los factores asociados a la inasistencia a las citas de consulta externa de un hospital de Sincelejo, como base para reducirla».',
        ojo: 'No prometas el extremo contrario. «Eliminar la inasistencia» o «lograr asistencia total» no es alcanzable; «reducir» sí.',
    },
    raices: {
        claves: [
            ['Conserva la jerarquía', 'Si en el árbol del problema una causa estaba debajo de otra, sus medios quedan en el mismo orden. El medio de abajo es condición para que se cumpla el de arriba.'],
            ['Seleccionar la alternativa', 'No todos los medios se trabajan. Elige los que puedas abordar con tu tiempo, tu acceso y tu formación; los demás quedan en el árbol, fuera del alcance del estudio.'],
            ['El verbo depende del estudio', 'En un trabajo de diagnóstico, el medio se estudia con verbos como «identificar» o «caracterizar»; en uno de propuesta, con «diseñar» o «proponer». El medio es el mismo; cambia hasta dónde llegas.'],
        ],
        ejemplo: 'Medio: «los pacientes recuerdan su cita». En un estudio descriptivo: «Identificar las razones por las que los pacientes olvidan su cita». En un proyecto de propuesta: «Diseñar un sistema de recordatorios por mensaje de texto».',
        ojo: 'Voltea una causa a la vez y compara el par. Si el medio no es exactamente lo contrario de su causa, añadiste una idea nueva.',
    },
    ramas: {
        claves: [
            ['Contribución, no logro propio', 'Los fines dependen también de otros factores: presupuesto, personal, decisiones de la institución. Por eso se redactan como aquello a lo que el proyecto **contribuye**.'],
            ['Fines cercanos y lejanos', 'El fin directo es el que se notaría primero al lograrse el objetivo; los de más arriba tardan más y dependen de más condiciones. Usa los cercanos para argumentar.'],
            ['De fin a argumento', 'Cada fin, con su beneficiario, es una razón para la justificación: dice quién gana y qué gana si el objetivo se alcanza. Redáctalo ahí en futuro.'],
        ],
        ejemplo: 'Fin: «Disminuyen los tiempos de espera para una cita». En la justificación: «Reducir la inasistencia permitirá reasignar los cupos perdidos, lo que contribuirá a disminuir los tiempos de espera de los pacientes de consulta externa».',
        ojo: 'Un fin se reconoce porque admite «contribuir a». Si puedes garantizarlo solo con tu trabajo, probablemente es un medio y va abajo.',
    },
    pasos: {
        claves: [
            ['Tarjeta por tarjeta', 'Convierte cada frase en su sitio, sin moverla ni fusionarla con otra. Al terminar, los dos árboles deben tener el mismo número de tarjetas en cada nivel.'],
            ['Frases que no se voltean', 'Cuando una causa no tiene un positivo razonable («llueve mucho en la zona»), no se puede intervenir. Déjala como condición externa o reformúlala en el árbol del problema.'],
            ['La lectura cambia de palabras', 'La verificación ya no usa «por eso», sino «si… entonces». Si aun cumpliéndose los medios el objetivo no se alcanzaría, falta un medio o sobra optimismo.'],
        ],
        ejemplo: 'Lectura de control: «Si reprogramar la cita es sencillo, entonces se reduce la inasistencia a consulta externa, y con eso se contribuye a que se aprovechen los cupos de atención». La oración debe sostenerse sin explicaciones adicionales.',
        ojo: 'No empieces el árbol de objetivos en blanco. Sin el del problema al lado terminarás escribiendo lo que quieres hacer, no lo que el problema pide.',
    },
    ejemplo: {
        claves: [
            ['Comparación en espejo', 'Pon los dos árboles lado a lado y revisa par por par: misma posición, misma población, sentido contrario. Cualquier tarjeta sin pareja es un error de conversión.'],
            ['Verbos de cambio moderados', 'Fíjate en los verbos: «reducir», «disminuyen», «se aprovechan». Ninguno promete eliminar el problema. Un árbol de objetivos creíble describe una mejora, no una situación perfecta.'],
            ['Tres medios, tres alcances', 'Recordar la cita y reprogramarla dependen del hospital; el transporte rural depende de terceros. Ver los medios juntos ayuda a decidir cuáles puede abordar tu estudio.'],
        ],
        ejemplo: 'Par a par: «Es difícil reprogramar la cita por teléfono» ↔ «Reprogramar es sencillo»; «Se interrumpen los tratamientos» ↔ «Los tratamientos tienen continuidad». Misma posición en el árbol, misma idea, sentido contrario.',
        ojo: 'Que el árbol se vea ordenado no prueba que sea lógico. Haz la lectura «si… entonces» con cada medio antes de darlo por terminado.',
    },
    usos: {
        claves: [
            ['Del medio al objetivo específico', 'Tres ajustes: añade un verbo en infinitivo que puedas verificar, precisa el objeto y conserva población y lugar. Así la condición deseada se vuelve un logro de tu estudio.'],
            ['Cuántos elegir', 'Entre dos y cuatro medios dan entre dos y cuatro objetivos específicos. Si tu árbol tiene más, prioriza: es mejor cumplir tres bien que prometer seis.'],
            ['Una sola línea argumental', 'Problema, objetivo general, específicos y justificación salen del mismo par de árboles. Un evaluador revisa justamente eso: que cada sección diga lo mismo desde su ángulo.'],
        ],
        ejemplo: 'Medio: «Reprogramar la cita es sencillo». Objetivo específico: «Describir las dificultades que encuentran los pacientes de consulta externa para reprogramar su cita». Fin relacionado, para la justificación: «Se aprovechan los cupos de atención».',
        ojo: 'Los medios que no elijas no se borran del árbol. Menciónalos al delimitar el estudio, para que se entienda que los viste y decidiste no abordarlos.',
    },
    errores: {
        claves: [
            ['Convertir no es inventar', 'El árbol de objetivos no admite ideas nuevas. Si durante la conversión se te ocurre algo valioso, pregúntate primero qué causa lo justifica y agrégala al árbol del problema.'],
            ['Dos pruebas rápidas', 'La del **espejo**: cada tarjeta tiene su pareja negativa. La del **estado**: cada medio se lee como algo que ya ocurre, sin verbos de tarea como «hacer», «comprar» o «capacitar».'],
            ['Positivo y verosímil', 'Voltear no es negar. «Que no haya reprobación» describe un ideal; «disminuye la reprobación» describe un cambio que se puede observar y medir en tu población.'],
        ],
        ejemplo: 'Causa: «Los estudiantes dedican poco tiempo al estudio autónomo». Mal: «Dictar talleres de hábitos de estudio» (actividad). Mal: «Mejorar la educación» (otro alcance). Bien: «Los estudiantes dedican más tiempo al estudio autónomo».',
        ojo: 'Si corriges aquí algo que en realidad falla en el árbol del problema, los dos dejan de coincidir. Arregla siempre el origen.',
    },
};
