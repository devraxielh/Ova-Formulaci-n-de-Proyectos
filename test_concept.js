import 'dotenv/config';
import { Groq } from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.VITE_GROQ_API_KEY
});

async function test_groq() {
    const prompt = `Eres un experto en investigación académica.

TÍTULO DE LA INVESTIGACIÓN:
"Mi titulo"

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
        console.log("Using model:", process.env.VITE_GROQ_MODEL);
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
            model: process.env.VITE_GROQ_MODEL,
            temperature: 0.7,
            max_tokens: 1000,
        });

        console.log(chatCompletion.choices[0]?.message?.content);
    } catch (error) {
        console.error('Error calling Groq API:', error);
    }
}
test_groq();
