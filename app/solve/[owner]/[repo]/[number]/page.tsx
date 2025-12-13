import { UserButton } from '@clerk/nextjs';
import { octokit } from '@/lib/github'; 
import { SolveWrapper } from '@/components/SolveWrapper'; 

// Define the Props based on the new URL structure
type SolvePageProps = {
  params: Promise<{ owner: string; repo: string; number: string }>;
};

export default async function SolvePage({ params }: SolvePageProps) {
  // 1. Unwrap the params Promise
  const { owner, repo, number } = await params;
  const issueNumber = parseInt(number);

  // --- Data Variables ---
  let issueTitle = `Issue #${number}`;
  let issueBody = "Fetching issue details...";
  let fileContent = "// Could not fetch file content.";
  let filePath = "README.md";
  let language = "markdown"; 

  // ----------------------------------------------------
  // 2. Fetch the REAL Issue Details (Title, Body) - (Logic omitted for brevity)
  // ----------------------------------------------------
  try {
    const { data: issue } = await octokit.rest.issues.get({ owner, repo, issue_number: issueNumber });
    issueTitle = issue.title;
    issueBody = issue.body || "No detailed description provided by the maintainer.";
    
    // ... (Language and Label Detection Logic is assumed to be here) ...

  } catch (e) {
    console.error("Failed to fetch issue details:", e);
    issueBody = `Error: Could not retrieve issue details for ${owner}/${repo}#${number}.`;
  }
  
  // ----------------------------------------------------
  // 3. Fetch the REAL Code File (README.md placeholder) - (Logic omitted for brevity)
  // ----------------------------------------------------
  try {
    const { data: readme } = await octokit.rest.repos.getReadme({ owner, repo, mediaType: { format: "raw" } });
    fileContent = String(readme);
    filePath = "README.md";
  } catch (error) {
    fileContent = "// No README found. AI path finding will be implemented next.";
    filePath = "initial.txt";
  }

  // --- Render the Workspace UI ---
  return (
    // 💡 FIX 1: Change h-screen to min-h-screen and set flex-col to enable vertical stacking.
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

      {/* 💡 FIX 2: Wrapper container takes ALL remaining vertical space (flex-grow) */}
      <div className="flex flex-grow w-full"> 
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