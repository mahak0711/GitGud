// app/api/chat/history/route.ts - FINAL, WORKING VERSION (LOGIC DIRECTLY IN HANDLER)

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; 
import { v4 as uuidv4 } from 'uuid'; 
import { MessageModel, connectToDatabase } from '@/lib/db';

// DELETE or COMMENT OUT the 'getSessionIdFromCookies' function

export async function GET(req: Request) {
    try {
        await connectToDatabase(); 

        // --- 🎯 THE FINAL WORKING FIX: COOKIE LOGIC INLINED ---
        const cookieStore = await cookies();
        const sessionIdKey = 'chat_session_id';
        
        // 1. Get Session ID
        let sessionId = cookieStore.get(sessionIdKey)?.value;

        if (!sessionId) {
            sessionId = uuidv4();
            
            // 2. Set new cookie
            cookieStore.set({ 
                name: sessionIdKey,
                value: sessionId,
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production', 
                maxAge: 60 * 60 * 24 * 30,
                path: '/', 
                sameSite: 'lax',
            });
        }
        // -----------------------------------------------------
const { searchParams } = new URL(req.url);
        const issueId = searchParams.get('issueId'); // 👈 Retrieve from URL

        if (!issueId) {
            return NextResponse.json({ success: true, history: [] }); // No ID, no history
        }
        // 3. Find and return history
        const history = await MessageModel.find({ sessionId,issueId })
                                          .sort({ timestamp: 1 })
                                          .lean();

        return NextResponse.json({ success: true, history });

    } catch (error) {
        console.error('Failed to retrieve chat history:', error);
        // The error log here will now be a specific MongoDB error if any setup fails.
        return NextResponse.json({ success: false, message: 'Could not load chat history' }, { status: 500 });
    }
}