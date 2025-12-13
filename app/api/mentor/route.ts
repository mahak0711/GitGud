import { NextResponse } from 'next/server';
import { gemini, MENTOR_SYSTEM_PROMPT } from '@/lib/gemini'; 
import { HarmCategory, HarmBlockThreshold } from '@google/genai';
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
      model: 'gemini-2.5-flash',
      
      // 💡 FIX 1: Pass the System Prompt in the 'config' object
      config: {
        systemInstruction: MENTOR_SYSTEM_PROMPT,
        // Optional: Ensure the model doesn't block hints
        safetySettings: [
          {
           category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
        ],
      },
      
      // 💡 FIX 2: Send only the User message in the 'contents' array
      contents: [{ role: 'user', parts: [{ text: fullContextPrompt }] }],
    });

    // 4. Send the clean response back to the client
    return NextResponse.json({ response: response.text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: 'Failed to connect to the AI mentor service.' }, { status: 500 });
  }
}