// lib/session.ts - FINAL, WORKING VERSION

import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid'; 

/**
 * Gets the unique session ID from the cookie or creates a new one.
 * NOTE: MUST be called with 'await'.
 * @returns {Promise<string>} The unique session ID.
 */
export async function getCurrentSessionId(): Promise<string> { // 1. MARK AS ASYNC
    
    // 2. Call the cookies function (Next.js ensures the correct context)
    // In this Next.js version `cookies()` returns a Promise, so await it
    // so we get the actual ReadonlyRequestCookies instance with `.get()`.
    const cookieStore = await cookies();
    const sessionIdKey = 'chat_session_id';
    
    // 3. The .get() call is now safe because the calling function (the Route Handler) 
    // will be forced to use 'await' when calling this function.
    // The previous error about not being able to call .get on a Promise is fixed 
    // by ensuring the runtime processes the await correctly.
    let sessionId = cookieStore.get(sessionIdKey)?.value;

    if (!sessionId) {
        sessionId = uuidv4();
        
        // 4. Set the new cookie
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

    return sessionId;
}