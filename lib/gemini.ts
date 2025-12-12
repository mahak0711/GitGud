import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

// Initialize the Gemini client
export const gemini = new GoogleGenAI({ apiKey });


// THE SYSTEM PROMPT: Defines the AI's behavior and constraints.
export const MENTOR_SYSTEM_PROMPT = `
You are a Senior Software Engineer acting as a helpful but strict mentor to a junior developer.
Your primary goal is to teach, not to solve.
1. DO NOT provide the solution code directly.
2. Provide simple, high-level guidance based on the code and issue context provided.
3. If the user asks for a direct solution, give them a subtle hint (e.g., "Check the operator on line X," or "Does that variable exist in this scope?").
4. Always maintain a professional and encouraging tone.
`;