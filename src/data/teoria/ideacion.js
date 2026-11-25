// Teoría ampliada de la clase «Ideación»: una entrada por diapositiva de teoría (ver components/deck/Teoria.jsx).
export default {
    fuentes: {
        claves: [
            ['Del tema a la idea', 'Un tema es un área («deserción universitaria»); una idea ya señala qué te inquieta de él y en quiénes. Las fuentes te dan el tema; la idea aparece cuando lo observas de cerca y te haces preguntas.'],
            ['Leer antes de decidir', 'Revisa cinco o seis artículos o tesis recientes sobre el tema. Sabrás qué se ha estudiado, con qué métodos y qué queda pendiente, y evitarás repetir un estudio ya hecho sin aportar nada.'],
            ['La ventaja de lo cercano', 'Una idea que nace de tu práctica o de tu semillero trae resuelta parte de la viabilidad: conoces el lugar, tienes a quién preguntar y un asesor que ya trabaja el tema.'],
        ],
        ejemplo: 'En la monitoría de cálculo notas que buena parte del grupo deja de asistir antes del segundo parcial (experiencia). Buscas tesis sobre reprobación en primer semestre y ves que ninguna se hizo en tu universidad (vacío en la literatura).',
        ojo: 'Las primeras ideas son vagas, y eso es normal. No descartes un tema por impreciso: se afina leyendo y conversando con quien conoce el problema.',
    },
    criterios: {
        claves: [
            ['Cómo comprobar la novedad', 'Busca tu tema en Google Académico y en el repositorio de tu universidad. Si ya hay estudios, pregúntate qué cambia en el tuyo: la población, el lugar, el periodo, el método o la variable.'],
            ['La ética también cuenta', 'Los criterios **FINER** (factible, interesante, novedosa, ética y relevante), muy usados en salud, añaden un quinto filtro: que el estudio no perjudique a los participantes y respete su consentimiento y sus datos.'],
            ['Los criterios se compensan', 'Rara vez una idea es fuerte en todo. Una muy novedosa puede ser poco viable; una muy viable, poco novedosa. Se ajusta el alcance hasta que cumpla lo suficiente en los cuatro.'],
        ],
        ejemplo: '«Factores asociados a la reprobación de cálculo en primer semestre de ingeniería»: te interesa porque eres monitor, le sirve a la facultad, no hay un estudio en tu sede y las notas están en registro académico. Cumple los cuatro.',
        ojo: 'Novedosa no significa que nadie lo haya estudiado. Si no encuentras **ningún** antecedente, sospecha de tu búsqueda antes que de la originalidad de la idea.',
    },
    problema: {
        claves: [
            ['Brecha entre real y esperado', 'Un problema de investigación es la distancia entre lo que ocurre y lo que debería ocurrir, o entre lo que se sabe y lo que falta saber. Sin esa distancia no hay nada que investigar.'],
            ['No partas de la solución', 'Si empiezas por «falta una app», ya decidiste la respuesta sin estudiar el problema. Descartas otras salidas y no podrás demostrar después que la tuya sirvió, porque nunca mediste la situación inicial.'],
            ['Tres datos lo vuelven concreto', 'Un problema bien enunciado dice **a quién** le ocurre, **qué** le ocurre y cómo se nota: una cifra, una frecuencia o un hecho que cualquiera puede verificar.'],
        ],
        ejemplo: 'Solución disfrazada: «No hay un sistema de recordatorios en el hospital». Problema: «Tres de cada diez pacientes de consulta externa de un hospital de Sincelejo no asisten a su cita, y esos cupos se pierden».',
        ojo: 'Redacta el problema sin mencionar ninguna solución. Si al leerlo se te ocurren dos o tres formas distintas de atenderlo, está bien planteado.',
    },
    porques: {
        claves: [
            ['De dónde viene la técnica', 'Los cinco porqués nacieron en la industria, en el sistema de producción de Toyota, para hallar el origen de una falla. En investigación sirven para pasar de lo que se ve a lo que vale la pena estudiar.'],
            ['Cada respuesta es una suposición', 'Lo que contestas en cada nivel es una **hipótesis**, no un hecho. Anótala y busca un dato o un antecedente que la respalde; si no aparece, esa cadena puede estar equivocada.'],
            ['Varias cadenas, no una sola', 'Los problemas sociales suelen tener varias causas a la vez. Repite el ejercicio con respuestas distintas en el primer nivel y tendrás las raíces que luego ordenarás en el árbol de problemas.'],
        ],
        ejemplo: 'Los pacientes no asisten a la cita. ¿Por qué? La olvidan. ¿Por qué? Se la asignaron dos meses antes. ¿Por qué? La agenda está llena. ¿Por qué? Muchos cupos se pierden y hay que reprogramarlos. La inasistencia se alimenta a sí misma.',
        ojo: 'No termines la cadena en una culpa («son irresponsables», «no les importa»). Una causa útil describe una condición que se puede observar y cambiar.',
    },
    arbol: {
        claves: [
            ['Cómo se construye', 'Escribe primero el problema central, uno solo. Debajo, las causas directas y las causas de esas causas. Arriba, los efectos inmediatos y los que vienen después. Cada tarjeta lleva una sola idea, redactada en negativo.'],
            ['Se lee de abajo hacia arriba', 'El árbol debe leerse como una cadena: «porque hay bases débiles, hay bajo rendimiento; porque hay bajo rendimiento, hay repitencia». Si un salto no se sostiene, falta un nivel o sobra una tarjeta.'],
            ['Del árbol al proyecto', 'En la metodología de marco lógico, el árbol se pasa a positivo y se vuelve **árbol de objetivos**: el problema central da el objetivo general, las causas orientan los específicos y los efectos alimentan la justificación.'],
        ],
        ejemplo: 'Causa: los estudiantes no reciben nivelación al ingresar. Problema central: alta reprobación de cálculo en primer semestre de ingeniería. Efecto: repiten la asignatura y una parte de ellos abandona la carrera en el primer año.',
        ojo: 'Si tu problema central aparece también como causa o como efecto, está mal ubicado. Y si le encuentras una sola causa, probablemente describiste un síntoma.',
    },
    poblacion: {
        claves: [
            ['Población y muestra', 'La **población** es el conjunto completo de casos que cumplen tus criterios; la **muestra**, la parte que realmente estudias. Solo puedes extender tus conclusiones a la población que definiste, por eso se define primero.'],
            ['Unidad de análisis', 'No siempre son personas. Puedes estudiar hogares, empresas, historias clínicas, fincas o documentos. Decide qué es «un caso» en tu estudio: de ahí sale qué vas a contar y a quién le pedirás información.'],
            ['Criterios de inclusión y exclusión', 'Son las condiciones que debe cumplir un caso para entrar al estudio y las que lo dejan por fuera. Convierten una población vaga en una lista que se puede verificar caso por caso.'],
        ],
        ejemplo: 'Población: citas de consulta externa programadas a mayores de 18 años en un hospital de Sincelejo durante 2026. Se excluyen las canceladas por el hospital. Unidad de análisis: cada cita; por eso se cuentan citas perdidas, no pacientes.',
        ojo: 'Pregúntate si existe una lista o un registro de esa población. Si nadie puede decirte cuántos son ni dónde están, todavía no está delimitada.',
    },
    delimita: {
        claves: [
            ['También se recorta el contenido', 'Además de quién, dónde y cuándo, decides qué aspecto del problema estudias y cuál dejas por fuera. «Deserción» es amplio; «deserción por causas académicas en primer semestre» ya es un recorte.'],
            ['El periodo cambia el estudio', 'Observar un solo momento da un estudio **transversal**; seguir a los mismos casos a lo largo del tiempo, uno **longitudinal**. El segundo muestra cambios, pero exige más plazo del que suele tener un trabajo de grado.'],
            ['Delimitar no es limitar', 'La delimitación es una decisión tuya sobre el alcance. Las limitaciones son obstáculos que no controlas, como datos incompletos o poco acceso. En el documento se declaran por separado.'],
        ],
        ejemplo: 'Amplio: «la deserción universitaria». Delimitado: «la deserción por causas académicas (contenido) en estudiantes de primer semestre de ingeniería (quién) de una universidad pública de la región Caribe (dónde) durante 2026 (cuándo)».',
        ojo: 'Recortar de más también es un error: con una población de doce personas casi no hay qué analizar. Delimita hasta que el estudio quepa en tu plazo, no más.',
    },
    contexto: {
        claves: [
            ['Qué incluir y qué no', 'Solo lo que ayuda a entender el problema: ubicación y tamaño del lugar, a qué se dedica su gente, servicios disponibles, cómo funciona la institución y qué se ha intentado antes. No es una monografía del municipio.'],
            ['De lo general a lo particular', 'Se escribe en embudo: primero el país o la región, luego el municipio y al final la institución o comunidad concreta. Cada nivel aporta un dato que hace más comprensible el siguiente.'],
            ['Fuentes para describirlo', 'Usa fuentes oficiales y verificables: el DANE para población y condiciones de vida, los planes de desarrollo de la alcaldía o la gobernación y los informes de gestión de la propia institución.'],
        ],
        ejemplo: 'El hospital atiende a pacientes de Sincelejo y de municipios vecinos. Quien vive en zona rural viaja más de una hora para llegar y no siempre tiene señal de celular: un recordatorio por mensaje de texto no le sirve igual que a un paciente urbano.',
        ojo: 'Cada dato del contexto debe conectarse con el problema. Si puedes borrarlo sin que el lector entienda menos, sobra.',
    },
    viabilidad: {
        claves: [
            ['Primero el acceso', 'Es el recurso que más proyectos detiene. Antes de avanzar, habla con quien custodia los datos o autoriza el ingreso y pide el permiso **por escrito**. Una promesa verbal puede cambiar con el siguiente jefe.'],
            ['Viabilidad ética', 'Si trabajas con personas necesitas su consentimiento informado; con menores, historias clínicas o datos personales, también la autorización de la institución o de un comité de ética. Ese trámite toma semanas y debe estar en tu cronograma.'],
            ['Si algo falla, ajusta', 'Una respuesta negativa no obliga a abandonar la idea. Se reduce la población, se cambia la fuente de datos, se acorta el periodo o se busca un coasesor que domine el método.'],
        ],
        ejemplo: 'Querías estudiar la inasistencia en todos los hospitales de Sucre, pero solo uno te da acceso a su agenda. Idea viable: un hospital de Sincelejo, las citas de consulta externa de 2026 y una encuesta a pacientes en la sala de espera.',
        ojo: 'Calcula el tiempo al revés: parte de la fecha de entrega y resta análisis, recolección y permisos. Lo que quede es tu plazo real para el trabajo de campo.',
    },
    impacto: {
        claves: [
            ['Producto, efecto e impacto', 'El **producto** es lo que tu estudio entrega: un diagnóstico, un modelo, un prototipo. El efecto es lo que alguien hace con eso. El **impacto** es el cambio posterior en la comunidad, y no depende solo de ti.'],
            ['El impacto se proyecta', 'En la ideación no lo mides: lo estimas con cautela. Escribe «podría contribuir a» o «aportaría información para». Solo un estudio evaluativo, hecho después de aplicar la solución, puede afirmar que el cambio ocurrió.'],
            ['Otras dimensiones', 'Según el proyecto, también cuenta el impacto **académico** (conocimiento, instrumentos o datos nuevos), el tecnológico o el institucional. Y conviene anotar los efectos negativos posibles, no solo los favorables.'],
        ],
        ejemplo: 'Producto: los factores asociados a la inasistencia, identificados. Efecto: el hospital ajusta sus recordatorios y horarios. Impacto social: más pacientes atendidos a tiempo. Impacto económico: menos cupos perdidos sin contratar más personal.',
        ojo: 'No prometas impactos que tu estudio no puede producir. Un diagnóstico no «reduce la deserción»: entrega la información para que otros decidan cómo reducirla.',
    },
    errores: {
        claves: [
            ['Dos fallas detrás de los cinco', 'Los cinco errores se reducen a dos: no saber todavía **qué le pasa a quién** (tema amplio, solución anticipada, moda) y no poder **mostrarlo** (sin evidencia, sin nada que observar o medir).'],
            ['La prueba del minuto', 'Explícale tu idea en un minuto a alguien de otra carrera. Si no logra repetir qué problema hay, a quiénes afecta y dónde, la idea aún no está clara, tampoco para ti.'],
            ['Qué cuenta como evidencia', 'Para idear basta un indicio verificable: una cifra oficial, un informe de la institución, un estudio previo o una observación sistemática tuya. Una impresión personal no cuenta hasta que la contrastas.'],
        ],
        ejemplo: 'Sin evidencia: «Creo que los pacientes están inconformes con las citas». Con evidencia: «Según la oficina de estadística del hospital, tres de cada diez citas de consulta externa programadas en 2025 no se cumplieron».',
        ojo: 'Corregir un error suele destapar otro: al acotar un tema amplio quizá descubras que no tienes acceso a esa población. Revisa los cinco otra vez después de cada ajuste.',
    },
};
