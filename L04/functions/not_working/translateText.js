import { OpenAI } from 'openai';

// Initialize OpenAI API using the secret key in your Codespace environment
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in your Codespace
});

// Function to handle the translation logic
const execute = async (text, targetLanguage) => {
    try {
        const prompt = `Translate the following sentence to ${targetLanguage}: "${text}"`;

        const response = await openai.chat.completions.create({
            model: "gpt-4", // You can also use gpt-3.5-turbo or another model
            messages: [{ role: "system", content: prompt }],
        });

        const translation = response.choices[0].message.content.trim();
        return translation;
    } catch (error) {
        console.error('Translation failed:', error);
        throw new Error('Error occurred during translation.');
    }
};

// Export the function details (metadata for your API)
const details = {
    name: "translateText",
    description: "Translates a given sentence into a specified language.",
    parameters: {
        text: { type: "string", description: "The sentence you want to translate" },
        targetLanguage: { type: "string", description: "The target language to translate the sentence into" },
    }
};

export { execute, details };


