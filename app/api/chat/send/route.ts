// pages/api/chat/send.ts

import { NextResponse } from 'next/server';
// 🚨 RECOMMENDATION: Use the new SDK @google/genai, but using old one for now:
import { GoogleGenerativeAI } from '@google/generative-ai'; 
import { cookies } from 'next/headers'; // 🚨 REQUIRED IMPORT
import { getCurrentSessionId } from '@/lib/session'; 
import { MessageModel, connectToDatabase } from '@/lib/db';
import { getCache, setCache } from '@/lib/cache';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const { prompt, issueId, code } = await req.json(); // Destructure issue/code for context

        // Validate required fields early to avoid DB validation errors
        if (!issueId) {
            return NextResponse.json({ success: false, message: 'issueId is required' }, { status: 400 });
        }
        
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
        
        // 6. Persist the User's message (include issueId required by schema)
        await MessageModel.create({ 
            sessionId, 
            issueId,
            role: 'user', 
            content: prompt, 
        });

        // 7. Get the AI response
        // Try cached response first to avoid unnecessary Gemini calls
        const cacheKey = `ai:${issueId}:${prompt}`;
        const cached = getCache<any>(cacheKey);
        if (cached) {
            return NextResponse.json({ success: true, message: cached, cached: true }, { status: 200 });
        }
        // 🚨 OPTIMIZATION: If you need the mentor to use the issue/code, 
        // you must prepend a SYSTEM prompt here using issue/code variables.
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        // Wrap the API call with retry/backoff to handle 429s gracefully
        async function sleep(ms: number) { return new Promise(res => setTimeout(res, ms)); }

        function parseRetrySecondsFromError(err: any): number | null {
            try {
                const details = err?.errorDetails || err?.details || [];
                for (const d of details) {
                    if (d['@type'] && d['@type'].includes('RetryInfo') && d.retryDelay) {
                        // retryDelay might be like '58s' or '1m30s'
                        const s = d.retryDelay.toString();
                        const m = s.match(/(?:(\d+)m)?(?:(\d+)s)?/);
                        if (m) {
                            const mins = parseInt(m[1] || '0', 10);
                            const secs = parseInt(m[2] || '0', 10);
                            return mins * 60 + secs;
                        }
                    }
                }
            } catch (e) {
                // ignore parse errors
            }
            return null;
        }

        async function retryGenerate(attempts = 4) {
            let attempt = 0;
            while (attempt < attempts) {
                attempt++;
                try {
                    const result = await model.generateContent({ contents });
                    return result;
                } catch (err: any) {
                    const retrySeconds = parseRetrySecondsFromError(err);
                    // If API explicitly returns RetryInfo, honor it immediately
                    if (retrySeconds != null) {
                        // If last attempt, rethrow so caller can surface Retry-After
                        if (attempt === attempts) throw Object.assign(err, { retryAfter: retrySeconds });
                        await sleep(retrySeconds * 1000 + 200);
                        continue;
                    }

                    // If HTTP 429, apply exponential backoff with jitter
                    const status = err?.status || err?.statusCode || err?.code;
                    if (status === 429 || (typeof status === 'string' && status.includes('429'))) {
                        if (attempt === attempts) throw err;
                        const backoff = Math.min(30000, (2 ** attempt) * 500) + Math.floor(Math.random() * 300);
                        await sleep(backoff);
                        continue;
                    }

                    // Non-retriable error: rethrow
                    throw err;
                }
            }
            throw new Error('Failed to generate content after retries');
        }

        const result = await retryGenerate(4);
        const aiResponse = result.response?.text
            ? await result.response.text()
            : ((result as any).output?.[0]?.content?.[0]?.text ?? (result as any).outputText ?? '');

        // 8. Persist the AI's response
        // Cache the AI response for subsequent identical prompts (TTL = 1 hour)
        try { setCache(cacheKey, { sessionId, issueId, role: 'model', content: aiResponse }, 60 * 60); } catch (e) { /* ignore cache errors */ }

        const aiMessage = await MessageModel.create({ 
            sessionId, 
            issueId,
            role: 'model', 
            content: aiResponse, 
        });

        return NextResponse.json({ success: true, message: aiMessage });

    } catch (error: any) {
        console.error('AI Chat Error:', error);

        // If upstream told us when to retry, surface that to the client
        const retryAfter = error?.retryAfter || parseInt(error?.retry_after || error?.retryAfterSeconds || '0', 10) || null;
        if (retryAfter) {
            return new NextResponse(JSON.stringify({ success: false, message: 'Rate limit exceeded. Retry later.' }), {
                status: 429,
                headers: { 'Retry-After': String(retryAfter), 'Content-Type': 'application/json' }
            });
        }

        return NextResponse.json({ success: false, message: 'AI chat failed' }, { status: 500 });
    }
}