import { UserButton } from '@clerk/nextjs';
import { octokit } from '@/lib/github';
import { SolveWrapper } from '@/components/SolveWrapper';
import Link from 'next/link';
import { 
    ChevronLeft, 
    GitBranch, 
    FileCode2, 
    AlertTriangle, 
    LayoutTemplate 
} from 'lucide-react';

// Define the Props based on the new URL structure
type SolvePageProps = {
    params: Promise<{ owner: string; repo: string; number: string }>;
};

// --- Comprehensive Language Map ---
// This map covers many common languages, ensuring wider support.
const LANGUAGE_MAP: { [key: string]: string } = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    java: 'java',
    go: 'go',
    rs: 'rust',
    rb: 'ruby',
    c: 'c',
    cpp: 'cpp',
    cs: 'csharp',
    html: 'html',
    css: 'css',
    scss: 'scss',
    less: 'less',
    md: 'markdown',
    json: 'json',
    yaml: 'yaml',
    sh: 'shell',
    xml: 'xml',
    php: 'php',
    swift: 'swift',
    kt: 'kotlin',
    sql: 'sql',
    vue: 'vue',
    svelte: 'svelte',
    // Add more extensions as needed
};

// --- Crucial: Define the Base URL for the Server-to-Server API call ---
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// --- Helper function to call the AI File Finder API (unchanged) ---
async function getPredictedFilePath(title: string, body: string, owner: string, repo: string): Promise<string> {
    try {
        const response = await fetch(`${BASE_URL}/api/file-finder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                issueTitle: title, 
                issueBody: body,
                owner, 
                repo   
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

// 💡 NEW HELPER: Guarantees a string result for README content (unchanged)
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

    const uniqueIssueId = `${owner}-${repo}-${number}`;

    let issueTitle = `Issue #${number}`;
    let issueBody = "Fetching issue details...";
    let fileContent = "// Could not fetch file content.";
    let filePath = "README.md";
    let language = "markdown";
    let readmeContent: string = "// Fallback README content."; 
    let isAiError = false;

    // ----------------------------------------------------
    // 2. Fetch the REAL Issue Details (unchanged)
    // ----------------------------------------------------
    try {
        const [issueResponse, fetchedReadmeContent] = await Promise.all([
            octokit.rest.issues.get({ owner, repo, issue_number: issueNumber }),
            getReadmeContent(owner, repo)
        ]);

        const issue = issueResponse.data;
        issueTitle = issue.title;
        issueBody = issue.body || "No detailed description provided by the maintainer.";
        
        readmeContent = fetchedReadmeContent;

    } catch (e) {
        console.error("Failed to fetch issue details:", e);
        issueBody = `Error: Could not retrieve issue details for ${owner}/${repo}#${number}.`;
    }
    
    // ----------------------------------------------------
    // 3. Fetch the REAL Code File
    // ----------------------------------------------------
    let predictedPath = await getPredictedFilePath(issueTitle, issueBody, owner, repo);
    predictedPath = predictedPath.replace(/^['"]|['"]$/g, '').replace(/^\//, '');

    if (predictedPath === 'UNKNOWN' || predictedPath === 'UNKNOWN_ERROR' || !predictedPath) {
        fileContent = `// AI failed to identify the file. Please check the issue description for file hints.\n\n` + readmeContent;
        filePath = "README.md (AI Failed)";
        language = "markdown";
        isAiError = true;
    } else {
        filePath = predictedPath;
        try {
            const { data: fileData } = await octokit.rest.repos.getContent({
                owner, repo, path: filePath,
            }) as any; 

            const base64Content = fileData.content;
            
            if (base64Content) {
                fileContent = Buffer.from(base64Content, 'base64').toString('utf8');
                
                // 🎯 FIX: Use the Comprehensive Language Map
                const ext = filePath.split('.').pop()?.toLowerCase();
                language = LANGUAGE_MAP[ext || ''] || 'plaintext'; // Default to 'plaintext' if extension is unknown
                
            } else {
                fileContent = `// File content could not be read. Path: ${filePath}`;
            }
            
        } catch (error) {
            const errorMessage = (error as { message?: string })?.message || 'Unknown error during file fetch.';
            console.error(`Could not fetch predicted file at path: ${filePath}. GitHub Error: ${errorMessage}`);
            
            fileContent = `// 🛑 ERROR: AI suggested file path '${filePath}', but it was not found on GitHub. Showing README.md instead.\n\n` + readmeContent;
            filePath = `README.md (AI Failed)`; 
            language = "markdown";
            isAiError = true;
        }
    }

    // --- Render the Workspace UI (unchanged) ---
    return (
        <div className="flex h-screen w-full flex-col bg-white text-zinc-900 dark:bg-black dark:text-zinc-50 overflow-hidden"> 
            
            {/* IDE Header */}
            <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950">
                
                {/* Left: Navigation & Context */}
                <div className="flex items-center gap-4">
                    <Link 
                        href="/dashboard" 
                        className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Back</span>
                    </Link>

                    <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />

                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                             <GitBranch className="h-3 w-3" />
                             <span>{owner}</span>
                             <span className="text-zinc-300 dark:text-zinc-700">/</span>
                             <span>{repo}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold leading-none text-zinc-900 dark:text-zinc-100">
                            <span className="max-w-[150px] truncate sm:max-w-md">{issueTitle}</span>
                            <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                #{issueNumber}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Center: File Indicator (Desktop Only) */}
                <div className="hidden items-center gap-2 rounded-md border border-zinc-100 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 md:flex">
                    {isAiError ? <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> : <FileCode2 className="h-3.5 w-3.5" />}
                    <span className="font-mono">{filePath}</span>
                </div>

                {/* Right: User & Actions */}
                <div className="flex items-center gap-3">
                    <div className="hidden items-center gap-2 text-xs text-zinc-400 sm:flex">
                        <LayoutTemplate className="h-4 w-4" />
                        <span>Workspace</span>
                    </div>
                    <UserButton 
                        appearance={{
                            elements: {
                                avatarBox: "h-8 w-8 border border-zinc-200 dark:border-zinc-700"
                            }
                        }}
                    />
                </div>
            </header>

            {/* Main Workspace Area */}
            <main className="flex grow overflow-hidden relative"> 
                <SolveWrapper
                    initialCode={fileContent}
                    initialIssueDescription={issueBody}
                    filePath={filePath}
                    language={language}
                    owner={owner}
                    repo={repo}
                    number={number}
                    issueId={uniqueIssueId} 
                />
            </main>
        </div>
    );
}