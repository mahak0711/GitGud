'use client';

import React, { useState } from 'react';
import { CodeEditor } from './CodeEditor';
import { MentorChat } from './MentorChat'; // We'll create this next

interface SolveWrapperProps {
  initialCode: string;
  initialIssueDescription: string;
  filePath: string;
  language: string;
  // New props for the repository coordinates
  owner: string;
  repo: string;
  number: string;
}

export function SolveWrapper({ initialCode, initialIssueDescription, filePath, language, owner, repo, number }: SolveWrapperProps) {
  // 💡 CENTRAL STATE: This state holds the code that is shared.
  const [currentCode, setCurrentCode] = useState(initialCode);

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
      {/* Left Panel */}
      <div className="p-6 overflow-y-auto border-r bg-white flex flex-col h-full">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4 flex-shrink-0">
          <h2 className="text-lg font-bold text-blue-900 mb-2">The Problem:</h2>
          <p className="text-blue-800 whitespace-pre-wrap font-mono text-sm">
            {initialIssueDescription}
          </p>
        </div>
        
        {/* Mentor Chat Component (takes up remaining space) */}
        <div className="flex-1 min-h-[400px]"> 
          <MentorChat 
            initialIssueDescription={initialIssueDescription}
            currentCode={currentCode} // 👈 Passes the real-time code to the Mentor
          />
        </div>
      </div>

      {/* Right Panel: Code Editor */}
      <div className="h-full p-4 bg-gray-50 flex flex-col">
        <div className="text-sm font-mono text-gray-600 mb-2">Editing File: {filePath}</div>
        
        <div className="flex-1">
          <CodeEditor 
            initialCode={initialCode} 
            language={language} 
            onCodeChange={setCurrentCode} // 👈 Updates central state whenever code changes
          />
        </div>
        
        <button className="mt-4 w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition shadow-md flex-shrink-0">
          Submit Pull Request (Phase 5)
        </button>
      </div>
    </div>
  );
}