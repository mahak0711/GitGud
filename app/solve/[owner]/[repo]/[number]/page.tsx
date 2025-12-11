import { UserButton } from '@clerk/nextjs';
import {CodeEditor} from '@/components/CodeEditor'

// 💡 Mock Data: later we will fetch this real file content from GitHub
const MOCK_FILE_CONTENT = `// Welcome to GitGud!
// This is the file you need to fix.

function calculateTotal(price, tax) {
  // TODO: Fix the bug here. Tax is not being added correctly.
  return price * tax; 
}

console.log(calculateTotal(100, 0.2));
`;

// Define the shape of the props for Next.js 15
type SolvePageProps = {
  params: Promise<{ issueId: string }>;
};

export default async function SolvePage({ params }: SolvePageProps) {
  // 1. Unwrap the params Promise
  const resolvedParams = await params;
  const { issueId } = resolvedParams;

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Navbar */}
      <header className="flex justify-between items-center p-4 border-b bg-white">
        <div className="flex items-center gap-4">
          <a href="/dashboard" className="text-black hover:text-gray-900">← Back</a>
          <h1 className="font-bold text-xl text-amber-300">Fixing Issue #{issueId}</h1>
        </div>
        <UserButton />
      </header>

      {/* Main Workspace Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        
        {/* Left Panel: The Problem */}
        <div className="p-6 overflow-y-auto border-r bg-white">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-black mb-2">Instructions</h2>
            <p className="text-black">
              The function <code>calculateTotal</code> is supposed to add tax to the price, 
              but currently it multiplies it incorrectly. Fix the math!
            </p>
          </div>
          
          <h3 className="font-bold text-black mb-4">Discussion & Hints</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
            (AI Chat will go here in Phase 3)
          </div>
        </div>

        {/* Right Panel: The Code Editor */}
        <div className="h-full p-4 bg-gray-50">
          <CodeEditor initialCode={MOCK_FILE_CONTENT} language="javascript" />
          
          <button className="mt-4 w-full py-3 bg-green-600 hover:bg-green-700 text-black font-bold rounded-lg transition shadow-md">
            Submit Pull Request
          </button>
        </div>

      </div>
    </div>
  );
}