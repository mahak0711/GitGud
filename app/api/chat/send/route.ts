// pages/api/chat/send.ts

import { NextResponse } from 'next/server';
// 🚨 RECOMMENDATION: Use the new SDK @google/genai, but using old one for now:
import { GoogleGenerativeAI } from '@google/generative-ai'; 
import { cookies } from 'next/headers'; // 🚨 REQUIRED IMPORT
import { getCurrentSessionId } from '@/lib/session'; 
import { MessageModel, connectToDatabase } from '@/lib/db';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const { prompt, issue, code } = await req.json(); // Destructure issue/code for context
        
        // 1. Get the cookie store and assert 'as any'
        const cookieStore = cookies() as any; 
        
        // 2. Call the helper, passing the store
      const sessionId = await getCurrentSessionId();

        // 3. Retrieve current history from DB to provide context to Gemini
        const dbHistory = await MessageModel.find({ sessionId }).sort({ timestamp: 1 }).lean();

        // 4. Prepare context (Map DB objects to Gemini content objects)
        const contents = dbHistory.map(msg => ({ 
            role: msg.role === 'user' ? 'user' : 'model', 
            parts: [{ text: msg.content }] 
        }));
        
        // 5. Add the LATEST user message to the context
        contents.push({ role: 'user', parts: [{ text: prompt }] });
        
        // 6. Persist the User's message 
        await MessageModel.create({ 
            sessionId, 
            role: 'user', 
            content: prompt, 
        });

        // 7. Get the AI response
        // 🚨 OPTIMIZATION: If you need the mentor to use the issue/code, 
        // you must prepend a SYSTEM prompt here using issue/code variables.
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent({ contents });
        const aiResponse = result.response.text();

        // 8. Persist the AI's response
        const aiMessage = await MessageModel.create({ 
            sessionId, 
            role: 'model', 
            content: aiResponse, 
        });

        return NextResponse.json({ success: true, message: aiMessage });

    } catch (error) {
        console.error('AI Chat Error:', error);
        return NextResponse.json({ success: false, message: 'AI chat failed' }, { status: 500 });
    }
}