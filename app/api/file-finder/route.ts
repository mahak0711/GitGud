import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { octokit } from '@/lib/github';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { issueTitle, issueBody, owner, repo } = await req.json();

    if (!owner || !repo) {
        return NextResponse.json({ success: false, message: "Missing owner/repo" }, { status: 400 });
    }

    // --- 1. Fetch the Real File Structure ---
    let fileListString = "";
    try {
        // Get the default branch (main/master)
        const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
        const defaultBranch = repoData.default_branch;

        // Get the full tree (recursive)
        const { data: treeData } = await octokit.rest.git.getTree({
            owner,
            repo,
            tree_sha: defaultBranch,
            recursive: 'true', 
        });

        // Filter out noise (images, huge folders, locks) to save AI tokens
        const relevantFiles = treeData.tree
            .filter((item) => item.type === 'blob') // Files only
            .map((item) => item.path)
            .filter((path) => 
                path &&
                !path.includes('node_modules') && 
                !path.includes('.git/') &&
                !path.includes('package-lock.json') &&
                !path.includes('yarn.lock') &&
                !path.match(/\.(png|jpg|jpeg|gif|svg|ico|pdf)$/) // No images
            );

        // Take top 600 files (Gemini Flash has a huge context window, so this is safe)
        fileListString = relevantFiles.slice(0, 600).join('\n');

    } catch (e) {
        console.error("Failed to fetch tree for AI:", e);
        fileListString = "(Could not fetch file structure. Please guess based on standard conventions.)";
    }

    // --- 2. Construct the "Architect" Prompt ---
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }); // 1.5 Flash has huge context
    
    const prompt = `
    You are a **highly specialized** Senior Software Architect. Your **sole responsibility** is to identify the single file most likely needing a code change to resolve a GitHub issue.
    
    YOUR GOAL: Identify the SINGLE file path that most likely contains the code causing the issue. **If the issue describes a UI/Styling bug, prioritize CSS/JS/TSX files. If it describes a data or logic bug, prioritize API routes or utility files.**

    CONTEXT:
    Repo: ${owner}/${repo}
    Issue Title: "${issueTitle}"
    Issue Description: "${issueBody.slice(0, 2000)}"

    ACTUAL REPOSITORY FILE STRUCTURE (choose from this list):
    ---
    ${fileListString}
    ---

    **STRICT INSTRUCTIONS (Follow these rules above all else):**
    1. **CRITICAL:** Return **ONLY** the single file path string.
    2. **NEVER** include markdown formatting (like \` or \`\`\`), quotes, or any surrounding text.
    3. Analyze the issue context and file list to make the best prediction.
    4. The output must be a single line of text that is a valid file path from the list above.
    
    Example Output:
    src/components/Navbar.jsx
    `;

    // --- 3. Generate Prediction ---
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Clean up response (remove potential quotes or markdown)
    const cleanedPath = text.replace(/`/g, '').replace(/'/g, '').replace(/"/g, '').trim();

    console.log(`🤖 AI Predicted: ${cleanedPath}`);

    return NextResponse.json({ path: cleanedPath });

  } catch (error) {
    console.error('AI File Finder Error:', error);
    // Return a soft error so the UI handles it gracefully
    return NextResponse.json({ path: null, error: 'Failed to predict file' }, { status: 500 });
  }
}