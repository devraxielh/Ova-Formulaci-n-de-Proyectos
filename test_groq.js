import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.VITE_GROQ_API_KEY;

console.log('Testing API Key:', apiKey ? 'Loaded' : 'Not Loaded');

const groq = new Groq({ apiKey });

async function main() {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: 'Explain quantum physics in one sentence.' }],
            model: 'mixtral-8x7b-32768',
        });

        console.log('Success:', chatCompletion.choices[0]?.message?.content);
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
