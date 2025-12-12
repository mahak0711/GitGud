import { UserButton } from '@clerk/nextjs';
import { CodeEditor } from '@/components/CodeEditor';
// 💡 We need the octokit client initialized in the library file
import { octokit } from '@/lib/github'; 
import { SolveWrapper } from '@/components/SolveWrapper';
// Define the Props based on the new URL structure
type SolvePageProps = {
  // 💡 Parameters are strongly typed to receive the three parts from the URL
  params: Promise<{ owner: string; repo: string; number: string }>;
};

export default async function SolvePage({ params }: SolvePageProps) {
  // 1. Unwrap the params Promise (required for Next.js 15)
  const { owner, repo, number } = await params;
  const issueNumber = parseInt(number); // GitHub API requires a number, not a string

  // --- Data Variables ---
  let issueTitle = `Issue #${number}`;
  let issueBody = "Fetching issue details...";
  let fileContent = "// Could not fetch file content.";
  let filePath = "README.md"; // Default file to fetch
  let language = "markdown"; // Default language for README

  // ----------------------------------------------------
  // 2. Fetch the REAL Issue Details (Title, Body)
  // ----------------------------------------------------
  try {
    const { data: issue } = await octokit.rest.issues.get({
      owner,
      repo,
      issue_number: issueNumber,
    });
    issueTitle = issue.title;
    // Use the issue's original body for the left panel
    issueBody = issue.body || "No detailed description provided by the maintainer.";
    
    // 💡 Logic for language hint (optional, but helpful for the editor)
    // --- Start of FIX block ---

// 💡 Logic for language hint (optional, but helpful for the editor)
if (issue.labels && issue.labels.length > 0) {
    const langLabel = issue.labels.find((label: any) => {
        // 1. Type Narrowing: Check if the label is an object AND has a 'name' property.
        if (typeof label === 'object' && label !== null && 'name' in label) {
            // 2. Now it is safe to access the name and check for a match
            const labelName = (label as { name: string }).name.toLowerCase();
            return ['javascript', 'python', 'typescript', 'rust', 'go'].includes(labelName);
        }
        return false; // Ignore if it's just a string or missing the 'name' property
    });

    if (langLabel) {
        // 3. Safely set the language, handling the object type again
        language = (langLabel as { name: string }).name.toLowerCase();

        // 💡 Bonus: If the language is found, set the file path to something more relevant than markdown
        // (This prepares for the AI phase by setting a base language for the editor)
        if (language === 'javascript' || language === 'typescript') {
            language = 'typescript'; // Set to typescript for better JS/TS support in Monaco
        } else if (language === 'python') {
            language = 'python';
        }
        // If we found a language, we assume the code file is needed, not the README
        filePath = `repo-file.${language.substring(0, 3)}.txt`;
    }
}
// --- End of FIX block ---

  } catch (e) {
    console.error("Failed to fetch issue details:", e);
    issueBody = `Error: Could not retrieve issue details for ${owner}/${repo}#${number}. Check token permissions.`;
  }
  
  // ----------------------------------------------------
  // 3. Fetch the REAL Code File (The README.md for now)
  // ----------------------------------------------------
  try {
    const { data: readme } = await octokit.rest.repos.getReadme({
      owner,
      repo,
      mediaType: { format: "raw" }, // Ask for raw text
    });
    fileContent = String(readme);
    filePath = "README.md";
  } catch (error) {
    fileContent = "// No README found or access denied. The correct file path will be identified by AI in Phase 3.";
    filePath = "initial.txt";
  }

  // --- Render the Workspace UI ---
  return (
   <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Navbar */}
<header className="flex justify-between items-center p-4 border-b bg-white">
        <div className="flex items-center gap-4">
          <a href="/dashboard" className="text-gray-500 hover:text-gray-900">← Back</a>
          <h1 className="font-bold text-xl truncate max-w-xl">
            {issueTitle} <span className="text-gray-400">({owner}/{repo})</span>
          </h1>
        </div>
        <UserButton />
      </header>

      {/* 💡 THE FIX: Use the SolveWrapper component here */}
      <SolveWrapper
        initialCode={fileContent}
        initialIssueDescription={issueBody}
        filePath={filePath}
        language={language}
        // Pass the repository coordinates, which the wrapper might need for future steps
        owner={owner}
        repo={repo}
        number={number}
      />
    </div>
  );
}