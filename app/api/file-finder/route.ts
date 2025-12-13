import { NextResponse } from 'next/server';
import { gemini } from '@/lib/gemini'; 

// 💡 The Specialized System Prompt for the AI File Finder
const FILE_FINDER_SYSTEM_PROMPT = `
You are a highly specialized AI tool for identifying the single most relevant file path in a Git repository to fix a specified bug.

IMPORTANT GUIDELINES:
1. **Output Format:** Your entire output MUST be ONLY the single, most likely file path. DO NOT include any explanation, quotes, numbering, or introductory text. 
2. **File Types:** Prioritize finding files with extensions like .js, .ts, .jsx, .tsx, .py, .java, .c, .go, or .rs.
3. **If UNKNOWN:** If the path cannot be determined with high certainty, you MUST output the single word: UNKNOWN
`;

export async function POST(req: Request) {
  try {
    const { issueTitle, issueBody } = await req.json();

    if (!issueTitle || !issueBody) {
      return NextResponse.json({ path: 'UNKNOWN' }, { status: 400 });
    }

    // 1. Construct the prompt with context
    const contextPrompt = `
      Issue Title: "${issueTitle}"
      Issue Description: "${issueBody}"

      Based on this information, what is the single most likely file path in the repository that needs to be edited to fix this bug?
    `;

    // 2. Call the Gemini API
    // File: app/api/file-finder/route.ts

// ... inside the POST function's try block ...

    // 2. Call the Gemini API
    const response = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: FILE_FINDER_SYSTEM_PROMPT,
      },
      contents: [{ role: 'user', parts: [{ text: contextPrompt }] }],
    });

    
    if (!response.text) {
        console.error("Gemini returned no text for file path prediction.");
        return NextResponse.json({ path: 'UNKNOWN' }, { status: 500 });
    }
    
    const cleanPath = response.text.trim();

    return NextResponse.json({ path: cleanPath });

  } catch (error) {
    console.error('File Finder AI Error:', error);
    return NextResponse.json({ path: 'UNKNOWN' }, { status: 500 });
  }
}