import { NextResponse } from 'next/server';
import { gemini, MENTOR_SYSTEM_PROMPT } from '@/lib/gemini'; 

export async function POST(req: Request) {
  try {
    const { userMessage, issue, code } = await req.json();

    if (!userMessage || !code || !issue) {
      return NextResponse.json({ error: 'Missing necessary context.' }, { status: 400 });
    }

    const fullContextPrompt = `
      Current Bug Issue Description: "${issue}"
      User's Current Code: 
      ---
      ${code}
      ---
      User's Question: "${userMessage}"

      Remember your system prompt: Offer a hint, but DO NOT provide the solution code.
    `;

    const response = await gemini.models.generateContent({
      model: 'gemini-2.5-flash', // Fast and effective model for chat
      contents: [
        { role: 'system', parts: [{ text: MENTOR_SYSTEM_PROMPT }] }, // The personality
        { role: 'user', parts: [{ text: fullContextPrompt }] }, // The question + context
      ],
    });

    return NextResponse.json({ response: response.text });

  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: 'Failed to connect to the AI mentor service.' }, { status: 500 });
  }
}