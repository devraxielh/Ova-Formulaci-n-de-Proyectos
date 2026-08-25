import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({ apiKey: process.env.VITE_GROQ_API_KEY });

async function generateResearchQuestion(title, questionType) {
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
            model: process.env.VITE_GROQ_MODEL,
            temperature: 0.7,
            max_tokens: 1000,
        });

        console.log("RESPONSE:", JSON.stringify(chatCompletion.choices[0], null, 2));
        return chatCompletion.choices[0]?.message?.content?.trim() || 'Error al generar pregunta';
    } catch (error) {
        console.error('Error calling Groq API:', error);
        throw error;
    }
}

generateResearchQuestion("Estudio sobre la viabilidad de implementación de wallet para pago de cuotas en la Caja de Compensación de Córdoba", "Descriptiva").then(console.log).catch(console.error);
