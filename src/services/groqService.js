import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
});

export async function generateTitle(formData) {
    const { accion, objeto, paraque, quien, donde, cuando } = formData;

    // Construir el prompt con la información del formulario
    const prompt = `Eres un experto en formulación de proyectos de investigación académica. 
Genera un título de tesis académico profesional y conciso basado en la siguiente información:

Acción/Verbo: ${accion || 'No especificado'}
Objeto de estudio: ${objeto || 'No especificado'}
${paraque ? `Propósito: ${paraque}` : ''}
${quien ? `Población: ${quien}` : ''}
${donde ? `Lugar: ${donde}` : ''}
${cuando ? `Tiempo: ${cuando}` : ''}

INSTRUCCIONES:
- El título debe ser claro, específico y académico
- Debe tener entre 10 y 25 palabras
- Debe incluir las variables clave mencionadas
- No uses comillas en el título
- Responde SOLO con el título, sin explicaciones adicionales

Título:`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'Eres un experto en formulación de títulos de tesis académicas. Generas títulos claros, concisos y profesionales.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: import.meta.env.VITE_GROQ_MODEL,
            temperature: 0.7,
            max_tokens: 100,
        });

        return chatCompletion.choices[0]?.message?.content?.trim() || 'Error al generar título';
    } catch (error) {
        console.error('Error calling Groq API:', error);
        throw new Error('No se pudo generar el título. Verifica tu conexión y la API key.');
    }
}

export async function evaluateTitle(title, formData) {
    const { accion, objeto, paraque, quien, donde, cuando } = formData;

    const prompt = `Eres un experto evaluador de títulos de tesis académicas. 
Analiza este título: "${title}"

INSTRUCCIONES IMPORTANTES:
- NO uses markdown (**, ###, etc.)
- Sé CONCISO y DIRECTO
- Usa texto plano simple

Proporciona EXACTAMENTE esto:

PUNTOS FUERTES:
• [Lista 2-3 aspectos positivos del título, una línea cada uno]

VARIABLES:
• Variable Independiente: [Identifica cuál es]. Es independiente porque [explica en 2-3 oraciones por qué esta variable es la que se manipula o controla en el estudio, y cómo influye en otras variables].

• Variable Dependiente: [Identifica cuál es]. Es dependiente porque [explica en 2-3 oraciones por qué esta variable es la que se mide o se ve afectada, y cómo responde a los cambios de la variable independiente].

Sé profesional, claro y educativo en las explicaciones.`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'Eres un evaluador de títulos académicos. Das retroalimentación concisa, clara y sin formato markdown.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: import.meta.env.VITE_GROQ_MODEL,
            temperature: 0.7,
            max_tokens: 350,
        });

        return chatCompletion.choices[0]?.message?.content?.trim() || 'Error al evaluar título';
    } catch (error) {
        console.error('Error calling Groq API:', error);
        throw new Error('No se pudo evaluar el título. Verifica tu conexión y la API key.');
    }
}

export async function generateResearchQuestion(title, questionType) {
    const prompt = `Eres un experto en formulación de preguntas de investigación académica.

TÍTULO DE LA INVESTIGACIÓN:
"${title}"

TIPO DE PREGUNTA SOLICITADA: ${questionType}

INSTRUCCIONES:
Genera UNA pregunta de investigación ${questionType.toLowerCase()} basada en el título proporcionado.

La pregunta debe:
- Ser clara, específica y académica
- Reflejar el tipo de pregunta solicitado (${questionType})
- Incluir las variables clave del título
- Tener entre 15 y 30 palabras
- NO usar comillas en la pregunta

Responde SOLO con la pregunta de investigación, sin explicaciones adicionales.

Pregunta de investigación:`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'Eres un experto en formulación de preguntas de investigación académica. Generas preguntas claras, específicas y bien estructuradas.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: import.meta.env.VITE_GROQ_MODEL,
            temperature: 0.7,
            max_tokens: 150,
        });

        return chatCompletion.choices[0]?.message?.content?.trim() || 'Error al generar pregunta';
    } catch (error) {
        console.error('Error calling Groq API:', error);
        throw new Error('No se pudo generar la pregunta. Verifica tu conexión y la API key.');
    }
}

export async function evaluateResearchQuestion(question, questionType) {
    const prompt = `Eres un experto evaluador de preguntas de investigación académica.

PREGUNTA A EVALUAR:
"${question}"

TIPO DE PREGUNTA: ${questionType}

INSTRUCCIONES:
Explica brevemente (3-4 oraciones) POR QUÉ esta pregunta es buena y cumple con los criterios de una pregunta de investigación ${questionType.toLowerCase()}.

Enfócate en:
- Cómo refleja el tipo de pregunta solicitado
- Qué elementos clave incluye (variables, contexto, delimitación)
- Por qué es clara y viable

NO uses markdown. Usa texto plano simple. Sé conciso y educativo.`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'Eres un evaluador de preguntas de investigación. Explicas de forma clara y concisa por qué una pregunta es buena.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: import.meta.env.VITE_GROQ_MODEL,
            temperature: 0.7,
            max_tokens: 200,
        });

        return chatCompletion.choices[0]?.message?.content?.trim() || 'Error al evaluar pregunta';
    } catch (error) {
        console.error('Error calling Groq API:', error);
        throw new Error('No se pudo evaluar la pregunta. Verifica tu conexión y la API key.');
    }
}

export async function generateProblemStatementStructure(title, researchQuestion) {
    const prompt = `Eres un experto en redacción de planteamientos de problemas para investigaciones académicas.

TÍTULO DE LA INVESTIGACIÓN:
"${title}"

PREGUNTA DE INVESTIGACIÓN:
"${researchQuestion}"

INSTRUCCIONES:
Genera una ESTRUCTURA DETALLADA de párrafos para el planteamiento del problema. Para cada párrafo, indica:
1. El tema/enfoque del párrafo
2. Qué información específica debe incluir

La estructura debe tener 5 párrafos que cubran:
- Contextualización y situación actual
- Descripción específica del problema
- Causas del problema
- Efectos y consecuencias
- Justificación de la investigación

Formato de respuesta (NO uses markdown):

PÁRRAFO 1: [Título del párrafo]
[Descripción de qué debe incluir este párrafo, 2-3 oraciones explicando el contenido]

PÁRRAFO 2: [Título del párrafo]
[Descripción de qué debe incluir este párrafo, 2-3 oraciones explicando el contenido]

[Y así sucesivamente...]

Sé específico y práctico. Ayuda al investigador a saber exactamente qué escribir en cada párrafo.`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'Eres un experto en metodología de investigación. Ayudas a estructurar planteamientos de problemas de forma clara y académica.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: import.meta.env.VITE_GROQ_MODEL,
            temperature: 0.7,
            max_tokens: 1800,
        });

        return chatCompletion.choices[0]?.message?.content?.trim() || 'Error al generar estructura';
    } catch (error) {
        console.error('Error calling Groq API:', error);
        throw new Error('No se pudo generar la estructura. Verifica tu conexión y la API key.');
    }
}

export async function generateObjectives(title, researchQuestion) {
    const prompt = `Eres un experto en metodología de investigación académica.

TÍTULO DE LA INVESTIGACIÓN:
"${title}"

PREGUNTA DE INVESTIGACIÓN:
"${researchQuestion}"

INSTRUCCIONES:
Genera los objetivos de investigación siguiendo estas reglas estrictas:

1. OBJETIVO GENERAL (1 solo):
   - Debe coincidir con el título
   - Usar UN SOLO verbo en infinitivo
   - Ser amplio y global
   - Resumir el resultado final esperado

2. OBJETIVOS ESPECÍFICOS (máximo 3):
   - Pasos concretos para lograr el objetivo general
   - UN SOLO verbo en infinitivo por objetivo
   - Secuencia lógica
   - Medibles y alcanzables
   - Sujetos a una sola interpretación

Verbos recomendados: Evaluar, Analizar, Diseñar, Implementar, Comparar, Describir, Establecer, Determinar, Proponer, Crear, Medir, Explorar

Formato de respuesta (NO uses markdown, usa texto plano):

OBJETIVO GENERAL:
[Verbo en infinitivo] + [qué] + [para qué] + [dónde/cuándo si aplica]

OBJETIVOS ESPECÍFICOS:

1. [Verbo en infinitivo] + [acción específica concreta]

2. [Verbo en infinitivo] + [acción específica concreta]

3. [Verbo en infinitivo] + [acción específica concreta]

4. [Verbo en infinitivo] + [acción específica concreta]

Sé específico, claro y profesional. Los objetivos deben ser coherentes entre sí.`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'Eres un experto en metodología de investigación. Generas objetivos claros, medibles y bien estructurados.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: import.meta.env.VITE_GROQ_MODEL,
            temperature: 0.7,
            max_tokens: 600,
        });

        return chatCompletion.choices[0]?.message?.content?.trim() || 'Error al generar objetivos';
    } catch (error) {
        console.error('Error calling Groq API:', error);
        throw new Error('No se pudo generar los objetivos. Verifica tu conexión y la API key.');
    }
}

export async function generateIntroduction(title, researchQuestion, generalObjective) {
    const prompt = `Eres un experto en redacción académica de investigaciones.

TÍTULO DE LA INVESTIGACIÓN:
"${title}"

PREGUNTA DE INVESTIGACIÓN:
"${researchQuestion}"

OBJETIVO GENERAL:
"${generalObjective}"

INSTRUCCIONES:
Genera una ESTRUCTURA DETALLADA de párrafos para la introducción. Para cada párrafo, indica:
1. El tema/enfoque del párrafo
2. Qué información específica debe incluir (MÁXIMO 1-2 oraciones, sé CONCISO)
3. Conectores recomendados para usar

La estructura debe tener 5 párrafos que cubran:
- Contexto general y relevancia del tema
- Delimitación y descripción del problema
- Justificación de la investigación
- Presentación del objetivo
- Breve descripción de la estructura del documento

CONECTORES ÚTILES:
Sin embargo, Puesto que, Por consiguiente, Dado que, Teniendo en cuenta, Entonces, Simultáneamente, En efecto, Ya que, Ahora bien, En cambio, En cuanto a, Así pues, A continuación, De la misma forma, En síntesis, Al mismo tiempo

ESTILO DE REDACCIÓN:
- Preferiblemente en tercera persona (se realizó, se estableció, se analizó)
- También aceptable primera persona plural para múltiples autores (realizamos, establecimos)
- Lenguaje formal pero accesible
- NO incluir resultados ni conclusiones

Formato de respuesta (NO uses markdown):

PÁRRAFO 1: Contextualización General
[Descripción BREVE de qué debe incluir, 1-2 oraciones máximo]
Conectores sugeridos: [lista de 3-4 conectores]

PÁRRAFO 2: Delimitación del Problema
[Descripción BREVE de qué debe incluir, 1-2 oraciones máximo]
Conectores sugeridos: [lista de 3-4 conectores]

[Y así sucesivamente...]

Sé específico, práctico y CONCISO. Cada descripción debe ser breve (1-2 oraciones). Ayuda al investigador a saber exactamente qué escribir en cada párrafo y cómo conectar las ideas.`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'Eres un experto en metodología de investigación y redacción académica. Ayudas a estructurar introducciones de forma clara y profesional.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: import.meta.env.VITE_GROQ_MODEL,
            temperature: 0.7,
            max_tokens: 1700,
        });

        return chatCompletion.choices[0]?.message?.content?.trim() || 'Error al generar estructura';
    } catch (error) {
        console.error('Error calling Groq API:', error);
        throw new Error('No se pudo generar la estructura. Verifica tu conexión y la API key.');
    }
}

export async function generateJustificationStructure(title, researchQuestion) {
    const prompt = `Eres un experto en redacción de justificaciones para investigaciones académicas.

TÍTULO DE LA INVESTIGACIÓN:
"${title}"

PREGUNTA DE INVESTIGACIÓN:
"${researchQuestion}"

INSTRUCCIONES:
Genera una ESTRUCTURA DETALLADA de párrafos para la justificación de la investigación. Para cada párrafo, indica:
1. El tema/enfoque del párrafo
2. Qué información específica debe incluir (MÁXIMO 1-2 oraciones, sé CONCISO)
3. Conectores lógicos recomendados para ese párrafo (elige los más apropiados según su función)

La estructura debe tener 6 párrafos que cubran:
- Relevancia e importancia del tema seleccionado
- Beneficiarios directos e indirectos del estudio
- Justificación teórica (aporte conceptual y brechas del conocimiento)
- Justificación metodológica (pertinencia del enfoque y diseño)
- Justificación práctica (aplicaciones concretas y aporte social/científico)
- Urgencia y pertinencia actual (por qué es importante trabajar en esto ahora: contexto, coyuntura, vacíos sin resolver o consecuencias de no actuar)

CONECTORES ÚTILES (clasifícalos según su función):
Causa/Razón: Dado que, Puesto que, Ya que, Debido a que, En razón de que
Consecuencia/Propósito: Por consiguiente, En consecuencia, De ahí que, Por ende, Con el fin de
Adición/Refuerzo: Además, Asimismo, Del mismo modo, De igual manera, Sumado a lo anterior
Contraste/Limitación: Sin embargo, No obstante, Aunque, A pesar de que, Ahora bien
Ejemplo/Especificación: Por ejemplo, En particular, Específicamente, Tal es el caso de
Síntesis/Cierre: En síntesis, En conclusión, En definitiva, Para concluir, Finalmente

ESTILO DE REDACCIÓN:
- USE mayúsculas solo para nombres propios y comienzos de oración
- NO abuse de negritas, cursivas ni subrayado (normas APA)
- Prefiera las comillas "inglesas" y 'sencillas' por sobre las «latinas»
- Lenguaje formal y académico
- Texto plano, sin markdown

Formato de respuesta (NO uses markdown):

PÁRRAFO 1: [Título del párrafo]
[Descripción BREVE de qué debe incluir, 1-2 oraciones máximo]
Conectores sugeridos: [lista de 3-4 conectores apropiados para este párrafo]

PÁRRAFO 2: [Título del párrafo]
[Descripción BREVE de qué debe incluir, 1-2 oraciones máximo]
Conectores sugeridos: [lista de 3-4 conectores apropiados para este párrafo]

[Y así sucesivamente...]

Sé específico, práctico y CONCISO. Ayuda al investigador a saber exactamente qué escribir en cada párrafo y qué conectores usar.`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'Eres un experto en metodología de investigación. Ayudas a estructurar justificaciones de proyectos de forma clara, académica y siguiendo las normas APA.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: import.meta.env.VITE_GROQ_MODEL,
            temperature: 0.7,
            max_tokens: 1850,
        });

        return chatCompletion.choices[0]?.message?.content?.trim() || 'Error al generar estructura';
    } catch (error) {
        console.error('Error calling Groq API:', error);
        throw new Error('No se pudo generar la estructura. Verifica tu conexión y la API key.');
    }
}

export async function evaluateObjectives(objectives, title, researchQuestion) {
    const prompt = `Eres un experto evaluador de objetivos de investigación académica.

OBJETIVOS A EVALUAR:
"${objectives}"

TÍTULO DE LA INVESTIGACIÓN:
"${title}"

PREGUNTA DE INVESTIGACIÓN:
"${researchQuestion}"

INSTRUCCIONES:
Explica brevemente (3-4 oraciones) POR QUÉ estos objetivos están bien planteados y cumplen con los criterios académicos.

Enfócate en:
- Coherencia entre el objetivo general y el título.
- Uso correcto de verbos en infinitivo.
- Cómo los objetivos específicos fragmentan y permiten alcanzar el general.
- Viabilidad y claridad.

NO uses markdown. Usa texto plano simple. Sé conciso y educativo.`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'Eres un evaluador de metodología de investigación. Explica de forma clara y concisa por qué los objetivos son correctos.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: import.meta.env.VITE_GROQ_MODEL,
            temperature: 0.7,
            max_tokens: 300,
        });

        return chatCompletion.choices[0]?.message?.content?.trim() || 'Error al evaluar los objetivos';
    } catch (error) {
        console.error('Error calling Groq API:', error);
        throw new Error('No se pudo evaluar los objetivos. Verifica tu conexión y la API key.');
    }
}

export async function generateAlcancesLimitacionesStructure(title, researchQuestion) {
    const prompt = `Eres un experto en redacción de alcances y limitaciones para investigaciones académicas.

TÍTULO DE LA INVESTIGACIÓN:
"${title}"

PREGUNTA DE INVESTIGACIÓN:
"${researchQuestion}"

INSTRUCCIONES:
Genera una ESTRUCTURA DETALLADA de párrafos para los Alcances y Limitaciones de la investigación. Para cada párrafo, indica:
1. El tema/enfoque del párrafo
2. Qué información específica debe incluir (MÁXIMO 1-2 oraciones, sé CONCISO)
3. Conectores lógicos recomendados para ese párrafo

La estructura debe tener 4 párrafos que cubran:
- Alcance temático y teórico (qué temas abordará exactamente y hasta dónde llegará la investigación)
- Alcance espacial y temporal (dónde y cuándo se desarrollará, población específica)
- Limitaciones metodológicas o prácticas (obstáculos anticipados y su impacto)
- Mitigación de limitaciones (cómo abordará esas limitaciones para no afectar la validez del estudio)

Recuerda que se debe exponer si el proyecto tiene alguna limitación y en qué forma influiría en el alcance del proyecto y/o en el desarrollo de las actividades, teniendo presente que el alcance del proyecto explora las fronteras y el máximo desarrollo que tendrá el proyecto, es decir, hasta qué punto el estudiante se compromete a llegar y cuál sería el impacto que realmente tendría.

CONECTORES ÚTILES:
Delimitación: Hasta el punto de, Enmarcándose en, Cuyo límite es, Circunscrito a
Contraste/Limitación: Sin embargo, No obstante, A pesar de, Si bien es cierto, Esto implica que
Explicación: Es decir, O sea, Esto significa que, En otras palabras
Precisión: Específicamente, Particularmente, En este sentido, En particular

Formato de respuesta (NO uses markdown):

PÁRRAFO 1: [Título del párrafo]
[Descripción BREVE de qué debe incluir, 1-2 oraciones máximo]
Conectores sugeridos: [lista de 3-4 conectores apropiados para este párrafo]

PÁRRAFO 2: [Título del párrafo]
[Descripción BREVE de qué debe incluir, 1-2 oraciones máximo]
Conectores sugeridos: [lista de 3-4 conectores apropiados para este párrafo]

[Y así sucesivamente...]

Sé específico, práctico y CONCISO. Ayuda al investigador a saber exactamente qué escribir.`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'Eres un experto en metodología de investigación. Ayudas a estructurar alcances y limitaciones de proyectos de forma clara, académica y delimitada.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: import.meta.env.VITE_GROQ_MODEL,
            temperature: 0.7,
            max_tokens: 1500,
        });

        return chatCompletion.choices[0]?.message?.content?.trim() || 'Error al generar estructura';
    } catch (error) {
        console.error('Error calling Groq API:', error);
        throw new Error('No se pudo generar la estructura. Verifica tu conexión y la API key.');
    }
}

export async function generateProjectLimitations(title, researchQuestion) {
    const prompt = `Eres un experto investigador y metodólogo académico.

TÍTULO DE LA INVESTIGACIÓN:
"${title}"

PREGUNTA DE INVESTIGACIÓN:
"${researchQuestion}"

INSTRUCCIONES:
Analiza el título y la pregunta proporcionados e identifica 3 posibles LIMITACIONES REALISTAS a las que se podría enfrentar este proyecto en específico, y explica cómo influirían en el alcance del proyecto.

Clasifica cada limitación en uno de estos tipos: Metodológica, De Información, Práctica/De Acceso, o Temporal.

Formato de respuesta (NO uses markdown):

LIMITACIÓN 1: [Nombre corto de la limitación]
Tipo: [Metodológica / De Información / Práctica / Temporal]
Descripción: [Explica la barrera específica que enfrentaría este proyecto. MÁXIMO 2 oraciones]
Impacto en el alcance: [Explica exactamente cómo esta limitación reduce el alcance, la profundidad, o la generalización de este estudio en particular. MÁXIMO 2 oraciones]

LIMITACIÓN 2: [Nombre corto de la limitación]
Tipo: [Metodológica / De Información / Práctica / Temporal]
Descripción: [Explica la barrera específica que enfrentaría este proyecto. MÁXIMO 2 oraciones]
Impacto en el alcance: [Explica exactamente cómo esta limitación reduce el alcance o el diseño del estudio. MÁXIMO 2 oraciones]

LIMITACIÓN 3: [Nombre corto de la limitación]
Tipo: [Metodológica / De Información / Práctica / Temporal]
Descripción: [Explica la barrera específica que enfrentaría este proyecto. MÁXIMO 2 oraciones]
Impacto en el alcance: [Explica exactamente cómo esta limitación restringe los resultados o la aplicación del estudio. MÁXIMO 2 oraciones]

Sé muy analítico, realista y ESPECÍFICO al proyecto mencionado. No des ejemplos genéricos, aplícalo al tema del estudiante.`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'Eres un experto en metodología de investigación que ayuda a estudiantes a anticipar obstáculos reales en sus proyectos y entender cómo estos limitan el alcance de su trabajo.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: import.meta.env.VITE_GROQ_MODEL,
            temperature: 0.8,
            max_tokens: 1200,
        });

        return chatCompletion.choices[0]?.message?.content?.trim() || 'Error al generar limitaciones';
    } catch (error) {
        console.error('Error calling Groq API:', error);
        throw new Error('No se pudo generar las limitaciones. Verifica tu conexión y la API key.');
    }
}

export async function generateMarcoReferencialStructure(title, researchQuestion) {
    const prompt = `Eres un experto en redacción de marcos referenciales (marcos teóricos) para investigaciones académicas.

TÍTULO DE LA INVESTIGACIÓN:
"${title}"

PREGUNTA DE INVESTIGACIÓN:
"${researchQuestion}"

INSTRUCCIONES:
Genera una ESTRUCTURA DETALLADA de títulos y subtítulos para el Marco Referencial de esta investigación. Para cada sección, indica:
1. El título/subtítulo de la sección
2. Qué información específica debe incluir (MÁXIMO 2-3 oraciones, sé CONCISO)
3. Qué tipo de fuentes buscar y qué autores/teorías podrían ser relevantes

La estructura debe cubrir:
- Antecedentes teóricos y estado del arte del tema
- Teorías representativas que fundamentan la investigación
- Identificación y definición de variables y/o categorías
- Contribuciones e inconsistencias teóricas encontradas
- Soporte empírico y evidencia científica reciente
- Síntesis del marco referencial y su relación con el diseño metodológico

REGLAS IMPORTANTES:
- Máximo 5 páginas de extensión (orienta al estudiante sobre la profundidad)
- Las fuentes deben ser recientes y de calidad (artículos científicos, libros académicos)
- NO referenciar blogs, Wikipedia, Rincón del Vago ni portales web no académicos
- Seguir Normas APA Séptima Edición
- El marco debe demostrar lectura, análisis y redacción propios (preferir paráfrasis sobre citas textuales)
- Debe contener análisis crítico, no solo descripción de fuentes

Formato de respuesta (NO uses markdown):

TÍTULO 1: [Título de la sección]
[Descripción BREVE de qué debe incluir, 2-3 oraciones máximo]
Fuentes sugeridas: [Tipo de fuentes a buscar y bases de datos recomendadas]

SUBTÍTULO 1.1: [Subtítulo]
[Descripción BREVE de qué debe incluir, 2-3 oraciones máximo]
Fuentes sugeridas: [Tipo de fuentes a buscar]

TÍTULO 2: [Título de la sección]
[Descripción BREVE de qué debe incluir, 2-3 oraciones máximo]
Fuentes sugeridas: [Tipo de fuentes a buscar y bases de datos recomendadas]

[Y así sucesivamente...]

Sé específico al tema de la investigación. Ayuda al investigador a saber exactamente qué escribir y dónde buscar información.`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'Eres un experto en metodología de investigación y redacción académica. Ayudas a estructurar marcos referenciales de forma clara, siguiendo las normas APA 7, con énfasis en fuentes de calidad y análisis crítico.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: import.meta.env.VITE_GROQ_MODEL,
            temperature: 0.7,
            max_tokens: 2000,
        });

        return chatCompletion.choices[0]?.message?.content?.trim() || 'Error al generar estructura';
    } catch (error) {
        console.error('Error calling Groq API:', error);
        throw new Error('No se pudo generar la estructura del marco referencial. Verifica tu conexión y la API key.');
    }
}

export async function generateAntecedentesStructure(title) {
    const prompt = `Eres un experto en metodología de investigación académica.

TÍTULO DE LA INVESTIGACIÓN:
"${title}"

INSTRUCCIONES:
Genera una GUÍA ESTRUCTURADA para redactar los antecedentes de esta investigación. Incluye:

1. PALABRAS CLAVE SUGERIDAS para buscar antecedentes en bases de datos académicas (mínimo 6 términos de búsqueda en español e inglés).

2. CADENAS DE BÚSQUEDA recomendadas para Google Scholar y bases de datos (combinaciones con operadores AND, OR, con comillas).

3. ESTRUCTURA DE REDACCIÓN: Para cada antecedente que el estudiante encuentre, debe redactarlo siguiendo este orden:
   - Autor(es) y año
   - Objetivo del estudio
   - Metodología empleada
   - Principales resultados
   - Conclusiones relevantes
   - Relación con la investigación actual

4. EJEMPLO REDACTADO: Escribe un ejemplo ficticio pero realista de cómo se redacta UN antecedente completo relacionado con el título proporcionado, usando el formato APA 7 (paráfrasis). El ejemplo debe tener entre 80 y 120 palabras y ser un modelo de referencia.

5. ORGANIZACIÓN RECOMENDADA: Indica cómo organizar los antecedentes (internacional → nacional → local, o cronológico, o temático) y cuántos antecedentes se recomienda incluir.

Formato de respuesta (NO uses markdown):

PALABRAS CLAVE DE BÚSQUEDA:
[Lista de términos en español e inglés separados por comas]

CADENAS DE BÚSQUEDA SUGERIDAS:
1. [cadena para Google Scholar]
2. [cadena para Google Scholar]
3. [cadena para base de datos]

ESTRUCTURA DE CADA ANTECEDENTE:
[Explica el orden y qué incluir en cada parte, 2-3 oraciones por sección]

EJEMPLO DE ANTECEDENTE REDACTADO:
[Ejemplo completo con cita APA 7 en paráfrasis]

ORGANIZACIÓN Y CANTIDAD:
[Recomendaciones de organización y número de antecedentes]

Sé específico al tema de la investigación. Ayuda al estudiante a saber exactamente qué buscar y cómo escribir cada antecedente.`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'Eres un experto en metodología de investigación y redacción académica. Ayudas a estudiantes a buscar y redactar antecedentes de investigación de forma clara, siguiendo las normas APA 7.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: import.meta.env.VITE_GROQ_MODEL,
            temperature: 0.7,
            max_tokens: 2000,
        });

        return chatCompletion.choices[0]?.message?.content?.trim() || 'Error al generar estructura';
    } catch (error) {
        console.error('Error calling Groq API:', error);
        throw new Error('No se pudo generar la guía de antecedentes. Verifica tu conexión y la API key.');
    }
}

export async function generateMarcoTeoricoStructure(title) {
    const prompt = `Eres un experto en metodología de investigación académica.

TÍTULO DE LA INVESTIGACIÓN:
"${title}"

INSTRUCCIONES:
Genera una GUÍA ESTRUCTURADA para redactar el marco teórico de esta investigación. Incluye:

1. TEORÍAS Y MODELOS SUGERIDOS: Identifica las principales teorías, modelos teóricos y enfoques conceptuales que podrían sustentar esta investigación (mínimo 3 teorías con sus autores principales).

2. PALABRAS CLAVE para buscar teorías en bases de datos (en español e inglés, mínimo 6 términos).

3. CADENAS DE BÚSQUEDA recomendadas para encontrar artículos teóricos y revisiones de literatura.

4. ESTRUCTURA DE REDACCIÓN del marco teórico:
   - Cómo introducir cada teoría
   - Cómo vincular la teoría con las variables del estudio
   - Cómo hacer análisis crítico comparando posturas
   - Cómo cerrar con una síntesis teórica

5. EJEMPLO REDACTADO: Escribe un ejemplo ficticio pero realista de cómo se redacta un párrafo del marco teórico relacionado con el título, usando citas APA 7 en paráfrasis. El ejemplo debe tener entre 100 y 150 palabras.

6. AUTORES REPRESENTATIVOS: Lista los autores más citados en las teorías sugeridas que el estudiante debería buscar.

Formato de respuesta (NO uses markdown):

TEORÍAS Y MODELOS SUGERIDOS:
[Lista de teorías con breve descripción y autores principales]

PALABRAS CLAVE DE BÚSQUEDA:
[Términos en español e inglés]

CADENAS DE BÚSQUEDA SUGERIDAS:
1. [cadena]
2. [cadena]
3. [cadena]

ESTRUCTURA DE REDACCIÓN:
[Guía paso a paso de cómo organizar y redactar el marco teórico]

EJEMPLO DE PÁRRAFO REDACTADO:
[Ejemplo con citas APA 7]

AUTORES REPRESENTATIVOS:
[Lista de autores clave por teoría]

Sé específico al tema de la investigación.`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'Eres un experto en metodología de investigación y fundamentación teórica. Ayudas a estudiantes a identificar teorías, buscar fuentes teóricas y redactar marcos teóricos sólidos siguiendo las normas APA 7.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: import.meta.env.VITE_GROQ_MODEL,
            temperature: 0.7,
            max_tokens: 2000,
        });

        return chatCompletion.choices[0]?.message?.content?.trim() || 'Error al generar estructura';
    } catch (error) {
        console.error('Error calling Groq API:', error);
        throw new Error('No se pudo generar la guía del marco teórico. Verifica tu conexión y la API key.');
    }
}

export async function generateMarcoConceptualStructure(title) {
    const prompt = `Eres un experto en metodología de investigación académica.

TÍTULO DE LA INVESTIGACIÓN:
"${title}"

INSTRUCCIONES:
Genera una GUÍA ESTRUCTURADA para redactar el marco conceptual de esta investigación. Incluye:

1. CONCEPTOS CLAVE A DEFINIR: Extrae los principales conceptos (variables y categorías) del título que necesitan definición teórica y operacional (mínimo 4 conceptos).

2. PALABRAS CLAVE para buscar estos conceptos en bases de datos (en español e inglés).

3. CADENAS DE BÚSQUEDA recomendadas para encontrar artículos de revisión conceptual o definiciones operacionales.

4. DIMENSIONES O INDICADORES: Para los conceptos principales, sugiere posibles dimensiones empíricas (cómo se podrían medir u observar).

5. EJEMPLO REDACTADO: Escribe un ejemplo ficticio pero realista de cómo se redacta la definición de uno de esos conceptos, incluyendo su definición teórica (con cita APA) y su definición operacional para el estudio. El ejemplo debe tener entre 80 y 120 palabras.

Formato de respuesta (NO uses markdown):

CONCEPTOS CLAVE A DEFINIR:
[Lista de conceptos]

PALABRAS CLAVE DE BÚSQUEDA:
[Términos en español e inglés]

CADENAS DE BÚSQUEDA SUGERIDAS:
1. [cadena]
2. [cadena]
3. [cadena]

DIMENSIONES SUGERIDAS:
[Concepto 1: Dimensión A, Dimensión B...]
[Concepto 2: Dimensión C, Dimensión D...]

EJEMPLO DE PÁRRAFO REDACTADO:
[Ejemplo con definición teórica y operacional]

Sé específico al tema de la investigación.`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'Eres un experto en metodología de investigación. Ayudas a estudiantes a estructurar sus marcos conceptuales identificando y definiendo variables clave.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: import.meta.env.VITE_GROQ_MODEL,
            temperature: 0.7,
            max_tokens: 2000,
        });

        return chatCompletion.choices[0]?.message?.content?.trim() || 'Error al generar estructura';
    } catch (error) {
        console.error('Error calling Groq API:', error);
        throw new Error('No se pudo generar la guía del marco conceptual. Verifica tu conexión y la API key.');
    }
}

export async function generateMarcoContextualStructure(title) {
    const prompt = `Eres un experto en metodología de investigación académica.

TÍTULO DE LA INVESTIGACIÓN:
"${title}"

INSTRUCCIONES:
Genera una GUÍA ESTRUCTURADA para redactar el marco contextual de esta investigación. Incluye:

1. DIMENSIONES A DESCRIBIR: Identifica los aspectos clave del contexto que deben abordarse (geográfico, demográfico, institucional, económico, etc.) específicos para este proyecto.

2. FUENTES DE DATOS RECOMENDADAS: Sugiere dónde buscar datos estadísticos, históricos o informes oficiales que soporten la descripción del contexto.

3. ESTRUCTURA DE REDACCIÓN: Pasos para organizar el marco contextual de lo macro a lo micro (por ejemplo, contexto internacional, nacional, regional, e institucional/local).

4. EJEMPLO REDACTADO: Escribe un breve ejemplo ficticio de cómo se redacta un párrafo caracterizando el contexto específico del problema planteado en el título. El ejemplo debe tener entre 80 y 120 palabras.

Formato de respuesta (NO uses markdown):

DIMENSIONES A DESCRIBIR:
[Lista de las dimensiones del contexto necesarias para el proyecto]

FUENTES DE DATOS SUGERIDAS:
[Tipos de fuentes o nombres de entidades recomendadas]

ESTRUCTURA DE REDACCIÓN:
[Guía paso a paso para organizar la información de lo macro a lo micro]

EJEMPLO DE PÁRRAFO REDACTADO:
[Ejemplo de caracterización contextual]

Sé específico al tema de la investigación.`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'Eres un experto en metodología de investigación. Ayudas a estructurar las características y el entorno donde se desarrolla el problema de estudio.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: import.meta.env.VITE_GROQ_MODEL,
            temperature: 0.7,
            max_tokens: 2000,
        });

        return chatCompletion.choices[0]?.message?.content?.trim() || 'Error al generar estructura';
    } catch (error) {
        console.error('Error calling Groq API:', error);
        throw new Error('No se pudo generar la guía del marco contextual. Verifica tu conexión y la API key.');
    }
}

export async function suggestTheoriesForTitle(title) {
    const prompt = `Eres un experto en investigación académica.

TÍTULO DE LA INVESTIGACIÓN:
"${title}"

INSTRUCCIONES:
El estudiante necesita ayuda para saber qué teorías o modelos académicos puede incorporar en su Marco Teórico según su título.
Sugiere al menos 5 teorías o modelos consolidados que apliquen directamente a su tema. Para cada una, proporciona:
1. El nombre de la teoría o modelo.
2. Breve justificación de por qué encaja perfectamente con el título (1-2 oraciones).

Formato de respuesta (NO uses markdown):

TEORÍA 1: [Nombre de la teoría]
JUSTIFICACIÓN: [Breve justificación]

TEORÍA 2: [Nombre de la teoría]
JUSTIFICACIÓN: [Breve justificación]
...
`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'Eres un experto en metodología de investigación. Formateas tu respuesta sin markdown, solo texto plano.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: import.meta.env.VITE_GROQ_MODEL,
            temperature: 0.7,
            max_tokens: 1000,
        });

        return chatCompletion.choices[0]?.message?.content?.trim() || 'Error al sugerir teorías';
    } catch (error) {
        console.error('Error calling Groq API:', error);
        throw new Error('No se pudo sugerir las teorías. Verifica tu conexión y la API key.');
    }
}

export async function suggestConceptsForTitle(title) {
    const prompt = `Eres un experto en investigación académica.

TÍTULO DE LA INVESTIGACIÓN:
"${title}"

INSTRUCCIONES:
El estudiante necesita ayuda para saber qué conceptos o variables debe definir en su Marco Conceptual según su título.
Sugiere al menos 5 conceptos o variables clave que apliquen directamente a su tema y que deban ser medidos o definidos operacionalmente. Para cada uno, proporciona:
1. El nombre del concepto o variable.
2. Breve justificación de por qué es esencial definirlo para este proyecto (1-2 oraciones).

Formato de respuesta (NO uses markdown):

CONCEPTO 1: [Nombre del concepto]
JUSTIFICACIÓN: [Breve justificación]

CONCEPTO 2: [Nombre del concepto]
JUSTIFICACIÓN: [Breve justificación]
...
`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'Eres un experto en metodología de investigación. Formateas tu respuesta sin markdown, solo texto plano.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: import.meta.env.VITE_GROQ_MODEL,
            temperature: 0.7,
            max_tokens: 1000,
        });

        return chatCompletion.choices[0]?.message?.content?.trim() || 'Error al sugerir conceptos';
    } catch (error) {
        console.error('Error calling Groq API:', error);
        throw new Error('No se pudo sugerir los conceptos. Verifica tu conexión y la API key.');
    }
}

export async function generateMarcoLegalStructure(title) {
    const prompt = `Eres un experto en metodología de investigación académica y redacción de marcos normativos/legales.

TÍTULO DE LA INVESTIGACIÓN:
"${title}"

INSTRUCCIONES:
Genera una GUÍA ESTRUCTURADA para redactar el marco legal o normativo de esta investigación. Incluye:

1. JERARQUÍA NORMATIVA (PIRÁMIDE DE KELSEN): Sugiere qué tipo de normas deben investigarse, organizadas desde normas constitucionales/internacionales, leyes nacionales, hasta resoluciones/decretos locales o sectoriales aplicables al tema.

2. PALABRAS CLAVE PARA BUSCADORES LEGALES: Sugiere 4-5 conceptos jurídicos para buscar en bases de datos normativas.

3. ESTRUCTURA DE REDACCIÓN: Pasos lógicos para presentar el marco legal (ej: citar norma, explicar objetivo de la norma, y aterrizar la relación directa con el proyecto).

4. EJEMPLO REDACTADO: Escribe un breve ejemplo ficticio de cómo se analizaría una ley inventada aplicándola a este proyecto, resaltando su cumplimiento o regulación. El ejemplo debe tener entre 80 y 120 palabras.

Formato de respuesta (NO uses markdown):

JERARQUÍA NORMATIVA A INVESTIGAR:
[Estructura sugerida]

PALABRAS CLAVE BÚSQUEDA LEGAL:
[Lista de palabras clave]

ESTRUCTURA DE REDACCIÓN:
[Paso a paso]

EJEMPLO DE PÁRRAFO REDACTADO:
[Ejemplo de redacción]

Sé preciso y coherente con el área de estudio del título.`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'Eres un experto en metodología de investigación y marcos legales. Formateas tu respuesta sin markdown, solo texto plano.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: import.meta.env.VITE_GROQ_MODEL,
            temperature: 0.7,
            max_tokens: 2000,
        });

        return chatCompletion.choices[0]?.message?.content?.trim() || 'Error al generar estructura legal';
    } catch (error) {
        console.error('Error calling Groq API:', error);
        throw new Error('No se pudo generar la guía del marco legal. Verifica tu conexión y la API key.');
    }
}

export async function suggestNormsForTitle(title) {
    const prompt = `Eres un experto investigador en derecho y normatividad.

TÍTULO DE LA INVESTIGACIÓN:
"${title}"

INSTRUCCIONES:
El estudiante necesita ayuda para identificar categorías de leyes, normativas o regulaciones (nacionales o internacionales) aplicables a su proyecto.
Sugiere al menos 5 normativas generales o tipos de regulación (ej. "Ley Marco de Educación", "Normativa de Protección de Datos Personales", "Derecho Ambiental Internacional", etc.) que deba investigar obligatoriamente para su Marco Legal.
No incluyas autores. Para cada sugerencia, proporciona:
1. El nombre o tipo general de la norma/ley.
2. Breve justificación de por qué es esencial incluirla como base legal en su proyecto (1-2 oraciones).

Formato de respuesta (NO uses markdown):

NORMATIVA 1: [Nombre o tipo de norma]
JUSTIFICACIÓN: [Breve justificación]

NORMATIVA 2: [Nombre o tipo de norma]
JUSTIFICACIÓN: [Breve justificación]
...
`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'Eres un experto en investigación legal. Formateas tu respuesta sin markdown, solo texto plano.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: import.meta.env.VITE_GROQ_MODEL,
            temperature: 0.7,
            max_tokens: 1000,
        });

        return chatCompletion.choices[0]?.message?.content?.trim() || 'Error al sugerir normativas';
    } catch (error) {
        console.error('Error calling Groq API:', error);
        throw new Error('No se pudo sugerir normativas. Verifica tu conexión y la API key.');
    }
}
