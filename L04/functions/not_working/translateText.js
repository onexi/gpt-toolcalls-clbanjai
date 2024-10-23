import { OpenAI } from 'openai';
import { z } from 'zod';

// Initialize OpenAI API using the secret key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Define a Zod schema to validate the input parameters
const translateSchema = z.object({
    text: z.string().min(1, "Text cannot be empty"),
    targetLanguage: z.string().min(1, "Target language cannot be empty"),
});

// Function to handle the translation logic with Zod validation
const execute = async (text, targetLanguage) => {
    try {
        // Validate input parameters using the Zod schema
        const validatedParams = translateSchema.parse({ text, targetLanguage });

        const prompt = `Translate the following sentence to ${validatedParams.targetLanguage}: "${validatedParams.text}"`;

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "system", content: prompt }],
        });

        // Extract and return the translation from the response
        const translation = response.choices[0].message.content.trim();
        return translation;

    } catch (error) {
        // Handle Zod validation or API errors
        if (error instanceof z.ZodError) {
            console.error("Validation failed:", error.errors);
            throw new Error('Invalid input parameters.');
        } else {
            console.error('Translation failed:', error);
            throw new Error('Error occurred during translation.');
        }
    }
};

// Export the function details with Zod validation for OpenAI Function Calling
const details = {
    name: "translateText",
    description: "Translates a given sentence into a specified language.",
    parameters: {
        text: { type: "string", description: "The sentence you want to translate" },
        targetLanguage: { type: "string", description: "The target language to translate the sentence into" },
    },
    strict: true // Enable structured outputs to enforce strict parameter matching
};

export { execute, details };

// Example usage: Test the function locally

const result = await execute('Hello, how are you', 'portuguese');
console.log(result); //

