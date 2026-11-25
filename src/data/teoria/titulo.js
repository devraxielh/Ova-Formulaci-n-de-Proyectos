// Teoría ampliada de la clase «Título»: una entrada por diapositiva de teoría (ver components/deck/Teoria.jsx).
export default {
    funciones: {
        claves: [
            ['Se lee más que el resto', 'La mayoría de lectores solo verá tu título en un listado de resultados o en un repositorio. Con eso deciden si abren el documento; por eso debe entenderse solo, sin el resumen al lado.'],
            ['Qué pide APA 7', 'La séptima edición recomienda un título **conciso** que exprese el tema central y las variables estudiadas, sin abreviaturas ni palabras que no aportan, como «Un estudio de». No fija un máximo de palabras.'],
            ['Un compromiso con el lector', 'Lo que el título anuncia, el estudio debe cumplirlo: la misma población, las mismas variables y el mismo alcance. Un evaluador compara el título con los objetivos y con los resultados.'],
        ],
        ejemplo: 'Quien busca «deserción primer semestre ingeniería» encuentra «Análisis de los factores asociados a la deserción en estudiantes de primer semestre de ingeniería…». «Una mirada a la realidad universitaria» no aparece en esa búsqueda ni dice de qué trata.',
        ojo: 'El título inicial es provisional. Se ajusta cuando cambian los objetivos o la población, y se revisa por última vez al terminar el informe.',
    },
    tema: {
        claves: [
            ['Una pregunta por escalón', 'Del tema al problema respondes «¿qué pasa?»; del problema a la idea delimitada, «¿a quiénes y dónde?»; de la idea al título, «¿qué haré con eso?». Esa última respuesta es el verbo.'],
            ['El tema no orienta', 'Con un tema solo no se pueden escribir objetivos ni elegir método, porque en él caben cientos de estudios distintos. Un título de investigación deja ver uno solo y permite juzgar si es viable.'],
            ['Varios títulos, una idea', 'De la misma idea delimitada salen títulos distintos según lo que quieras lograr: describirla, compararla, explicarla o evaluar una solución. Escribe dos o tres versiones y elige la que corresponde a tu objetivo.'],
        ],
        ejemplo: 'Tema: permanencia estudiantil. Problema: alta deserción en primer semestre. Idea: en una universidad pública de Montería, los estudiantes de primer semestre de ingeniería abandonan la carrera. Título: «Análisis de los factores asociados a la deserción en estudiantes de primer semestre…».',
        ojo: 'No saltes del tema al título. Si aún no puedes decir qué problema hay y a quién le ocurre, vuelve a la Ideación antes de redactar.',
    },
    anatomia: {
        claves: [
            ['Por qué ese orden', 'Lo primero que se lee es lo que más pesa. Por eso el título abre con la acción y el objeto de estudio, y deja para el final los datos que acotan: población, lugar y periodo.'],
            ['El objeto de estudio', 'Es el fenómeno o las variables que vas a observar: «los factores asociados a la deserción», no «los estudiantes». Los estudiantes son la población; el objeto es lo que estudias **en** ellos.'],
            ['Cuándo incluir el para qué', 'Inclúyelo si el estudio entrega un insumo para algo concreto, como un diseño o una propuesta. Si solo repite un fin genérico («para mejorar la calidad»), alarga el título sin informar.'],
        ],
        ejemplo: '«Caracterización (verbo) de la inasistencia a citas médicas (objeto) en pacientes de consulta externa (en quiénes) de un hospital público de Sincelejo (dónde) durante 2026 (cuándo)»: 20 palabras y cuatro de las cinco partes.',
        ojo: 'Un título no es mejor por tener las cinco partes. Si pasa de 30 palabras, quita primero el para qué y luego el periodo.',
    },
    verbo: {
        claves: [
            ['El verbo anuncia el alcance', 'En la clasificación de Hernández Sampieri un estudio puede ser exploratorio, descriptivo, correlacional o explicativo. «Caracterización» anuncia uno descriptivo; «Relación», uno correlacional; «Determinación de los factores», uno explicativo.'],
            ['También anuncia el método', 'Quien lee «Evaluación del efecto de…» espera una intervención y una medición antes y después. Quien lee «Diseño de…» espera un producto. Si no vas a entregar eso, cambia el verbo.'],
            ['Cómo elegirlo', 'Escribe primero tu objetivo general en infinitivo y conviértelo en sustantivo: analizar, análisis; comparar, comparación; evaluar, evaluación. Así el título y el objetivo nacen coherentes.'],
        ],
        ejemplo: 'Con el mismo objeto cambian los estudios: «Descripción de la inasistencia a citas…» cuenta cuántas se pierden y cuándo; «Determinación de los factores de la inasistencia…» busca por qué; «Evaluación de un sistema de recordatorios…» prueba una solución.',
        ojo: 'No elijas el verbo que suena más ambicioso. «Evaluación» o «Determinación» te obligan a diseños más exigentes que «Descripción»; elige el que puedes cumplir.',
    },
    variables: {
        claves: [
            ['Variable, no constante', 'Algo es variable si toma valores distintos entre los casos que estudias. Si todos tus participantes son de primer semestre, el semestre no es una variable: es una característica de la población.'],
            ['De la palabra a la medida', 'Cada variable del título necesita una definición **conceptual** (qué es) y una **operacional** (cómo la medirás: con qué instrumento o indicador). Si no logras decir cómo se mide, aún no sirve para el título.'],
            ['Relación no es causa', 'En un estudio correlacional las dos variables se asocian, pero no se afirma que una produzca la otra. Hablar de independiente y dependiente tiene pleno sentido cuando el diseño busca un efecto o una explicación.'],
        ],
        ejemplo: 'En «Efecto de los recordatorios por mensaje de texto en la asistencia a citas médicas», la independiente es el recordatorio (se envía o no) y la dependiente es la asistencia, medida como porcentaje de citas cumplidas.',
        ojo: 'Tres o más variables en el título suelen indicar que hay varios estudios mezclados. Deja las principales; las demás aparecerán en los objetivos específicos.',
    },
    delimitar: {
        claves: [
            ['El título fija el alcance', 'Lo que anuncias es hasta donde valen tus resultados. Si estudias un solo hospital, no puedes titular «en los hospitales de Sucre»: tus conclusiones no alcanzan para esa población.'],
            ['Nombrar o no la institución', 'Puedes escribir el nombre si tienes autorización. Si no la tienes, o si los resultados pueden afectarla, usa una descripción: «un hospital público de Sincelejo», «una universidad pública de Montería».'],
            ['Cuándo importa el tiempo', 'Inclúyelo si analizas datos de un periodo definido (registros de 2025), si comparas momentos o si el fenómeno cambia rápido. Si el año solo indica cuándo hiciste el trabajo, puede omitirse.'],
        ],
        ejemplo: 'Vago: «Análisis de la deserción en universitarios». Preciso: «Análisis de los factores asociados a la deserción en estudiantes de primer semestre de ingeniería de una universidad pública de Montería durante 2026».',
        ojo: 'Evita «actualmente», «en la actualidad» o «hoy en día»: envejecen al año siguiente. Si el tiempo importa, escribe el periodo exacto.',
    },
    errores: {
        claves: [
            ['Tres familias de error', 'Los siete se agrupan así: el título **no informa** (es un tema, tiene relleno o siglas), está **mal construido** (pregunta, infinitivo, demasiado largo) o promete lo que no corresponde (anuncia resultados).'],
            ['Por qué no anunciar resultados', 'En un proyecto todavía no hay resultados: afirmarlos es adelantar una conclusión. Y en el informe final, un título neutral sigue siendo válido aunque los datos no confirmen lo que esperabas.'],
            ['Lista de revisión', 'Lee tu título y marca: ¿empieza con verbo sustantivado?, ¿se entiende sin explicación?, ¿dice en quiénes y dónde?, ¿tiene entre 10 y 30 palabras?, ¿alguna palabra se puede quitar sin perder información?'],
        ],
        ejemplo: '«Estudio sobre el impacto de las TIC en la IE» tiene relleno, siglas y ninguna población. Corregido: «Evaluación del efecto del uso de tabletas en la comprensión lectora de estudiantes de quinto grado de una institución educativa de Cereté».',
        ojo: 'Las siglas muy conocidas tampoco se salvan: escribe el nombre completo. Quien busca en un repositorio no siempre usa la misma abreviatura que tú.',
    },
    reescribe: {
        claves: [
            ['Orden para reescribir', 'Primero fija el verbo según tu objetivo. Luego nombra el objeto o las variables. Después añade población y lugar. Al final recorta: quita método, instrumentos, artículos repetidos y adjetivos.'],
            ['Qué se puede quitar', 'Sobran las fórmulas de entrada («Estudio sobre», «Investigación acerca de»), el método («mediante encuestas»), los adjetivos de valor («importante», «novedoso») y lo que ya está implícito en la población o el lugar.'],
            ['Léelo en voz alta', 'Si te quedas sin aire o tienes que releer para entenderlo, hay demasiadas preposiciones encadenadas. Reordena las partes o elimina un complemento hasta que se lea de corrido.'],
        ],
        ejemplo: 'Antes: «Investigación sobre los problemas de las citas médicas en Sincelejo». Después: «Determinación de los factores asociados a la inasistencia a citas médicas en pacientes de consulta externa de un hospital público de Sincelejo».',
        ojo: 'Si la versión corregida te obliga a cambiar la población o el verbo, revisa también tu idea y tu objetivo: el título solo refleja lo que ya decidiste.',
    },
};
