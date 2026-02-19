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
