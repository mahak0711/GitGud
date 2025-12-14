import { UserButton } from '@clerk/nextjs';
import { octokit } from '@/lib/github'; 
import { SolveWrapper } from '@/components/SolveWrapper'; 

// Define the Props based on the new URL structure
type SolvePageProps = {
  params: Promise<{ owner: string; repo: string; number: string }>;
};

// --- Crucial: Define the Base URL for the Server-to-Server API call ---
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// --- Helper function to call the AI File Finder API ---
// 💡 FIXED: Added owner and repo parameters here
async function getPredictedFilePath(title: string, body: string, owner: string, repo: string): Promise<string> {
    try {
        const response = await fetch(`${BASE_URL}/api/file-finder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                issueTitle: title, 
                issueBody: body,
                owner, // 👈 Added
                repo   // 👈 Added
            }),
            cache: 'no-store', 
        });

        if (!response.ok) {
            return "UNKNOWN_ERROR";
        }

        const { path } = await response.json();
        return path ? path.trim() : "UNKNOWN";
        
    } catch (e) {
        console.error("Error calling file-finder API:", e);
        return "UNKNOWN_ERROR";
    }
}

// 💡 NEW HELPER: Guarantees a string result for README content, avoiding crash on 404
const getReadmeContent = async (owner: string, repo: string): Promise<string> => {
    try {
        const { data: readme } = await octokit.rest.repos.getReadme({ 
            owner, 
            repo, 
            mediaType: { format: "raw" } 
        });
        return String(readme);
    } catch (e) {
        return "// No README file found in this repository.";
    }
};


export default async function SolvePage({ params }: SolvePageProps) {
    const { owner, repo, number } = await params;
    const issueNumber = parseInt(number);

    let issueTitle = `Issue #${number}`;
    let issueBody = "Fetching issue details...";
    let fileContent = "// Could not fetch file content.";
    let filePath = "README.md";
    let language = "markdown";
    let readmeContent: string = "// Fallback README content."; 

    // ----------------------------------------------------
    // 2. Fetch the REAL Issue Details (Sequential, but necessary first step)
    // ----------------------------------------------------
    try {
        const [issueResponse, fetchedReadmeContent] = await Promise.all([
            octokit.rest.issues.get({ owner, repo, issue_number: issueNumber }),
            getReadmeContent(owner, repo)
        ]);

        const issue = issueResponse.data;
        issueTitle = issue.title;
        issueBody = issue.body || "No detailed description provided by the maintainer.";
        
        // Save the README content
        readmeContent = fetchedReadmeContent;

    } catch (e) {
        console.error("Failed to fetch issue details:", e);
        issueBody = `Error: Could not retrieve issue details for ${owner}/${repo}#${number}.`;
    }
    
    // ----------------------------------------------------
    // 3. Fetch the REAL Code File (The AI Intelligent Fetch)
    // ----------------------------------------------------
    
    // 💡 FIXED: Now passing owner and repo to the helper function
    let predictedPath = await getPredictedFilePath(issueTitle, issueBody, owner, repo);

    predictedPath = predictedPath.replace(/^['"]|['"]$/g, '').replace(/^\//, '');

    if (predictedPath === 'UNKNOWN' || predictedPath === 'UNKNOWN_ERROR' || !predictedPath) {
        // AI Failed: Fallback to the pre-fetched README
        fileContent = `// AI failed to identify the file. Please check the issue description for file hints.\n\n` + readmeContent;
        filePath = "README.md (AI Failed)";
        language = "markdown";
    } else {
        // AI Succeeded: Try to fetch the predicted file
        filePath = predictedPath;
        
        try {
            const { data: fileData } = await octokit.rest.repos.getContent({
                owner, repo, path: filePath,
            }) as any; 

            const base64Content = fileData.content;
            
            if (base64Content) {
                fileContent = Buffer.from(base64Content, 'base64').toString('utf8');
                // Set Language based on file extension
                const ext = filePath.split('.').pop()?.toLowerCase();
                if (ext === 'js' || ext === 'jsx') language = 'javascript';
                else if (ext === 'ts' || ext === 'tsx') language = 'typescript';
                else if (ext === 'py') language = 'python';
                else if (ext === 'md') language = 'markdown';
            } else {
                fileContent = `// File content could not be read. Path: ${filePath}`;
            }
            
        } catch (error) {
            // 🚨 UX FIX: File not found (404) - Use pre-fetched README
            const errorMessage = (error as { message?: string })?.message || 'Unknown error during file fetch.';
            console.error(`Could not fetch predicted file at path: ${filePath}. GitHub Error: ${errorMessage}`);
            
            // Show the error message, then the actual README content
            fileContent = `// 🛑 ERROR: AI suggested file path '${filePath}', but it was not found on GitHub. Showing README.md instead.\n\n` + readmeContent;
            filePath = `README.md (AI Failed)`; 
            language = "markdown";
        }
    }

    // --- Render the Workspace UI ---
    return (
        <div className="flex flex-col min-h-screen bg-gray-50"> 
            
            {/* Navbar (Header) */}
            <header className="flex justify-between items-center p-4 border-b bg-white flex-shrink-0">
                <div className="flex items-center gap-4">
                    <a href="/dashboard" className="text-gray-500 hover:text-gray-900">← Back</a>
                    <h1 className="font-bold text-xl truncate max-w-xl">
                        {issueTitle} <span className="text-gray-400">({owner}/{repo})</span>
                    </h1>
                </div>
                <UserButton />
            </header>

            {/* Wrapper container takes ALL remaining vertical space (flex-grow) */}
            <div className="flex grow w-full"> 
                <SolveWrapper
                    initialCode={fileContent}
                    initialIssueDescription={issueBody}
                    filePath={filePath}
                    language={language}
                    owner={owner}
                    repo={repo}
                    number={number}
                />
            </div>
        </div>
    );
}