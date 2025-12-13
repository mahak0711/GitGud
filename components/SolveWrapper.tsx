'use client';

import React, { useState } from 'react';
import { CodeEditor } from './CodeEditor';
import { MentorChat } from './MentorChat'; 

interface SolveWrapperProps {
  initialCode: string;
  initialIssueDescription: string;
  filePath: string;
  language: string;
  owner: string;
  repo: string;
  number: string;
}

export function SolveWrapper({ initialCode, initialIssueDescription, filePath, language, owner, repo, number }: SolveWrapperProps) {
  const [currentCode, setCurrentCode] = useState(initialCode);

  return (
    // 💡 FIX 3: Ensure the wrapper itself takes the full height/width passed by the parent.
    <div className="flex grow w-full h-full"> 
      
      {/* 💡 FIX 4: The inner grid must also take full height. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full h-full"> 
        
        {/* Left Panel: Problem and Chat */}
        <div className="p-6 overflow-y-auto border-r bg-white flex flex-col h-full"> 
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4 flex-shrink-0">
            <h2 className="text-lg font-bold text-blue-900 mb-2">The Problem:</h2>
            <p className="text-blue-800 whitespace-pre-wrap font-mono text-sm">
              {initialIssueDescription}
            </p>
          </div>
          
          {/* Mentor Chat Component: Takes remaining vertical space */}
          <div className="grow min-h-0"> 
            <MentorChat 
              initialIssueDescription={initialIssueDescription}
              currentCode={currentCode} 
            />
          </div>
        </div>

        {/* Right Panel: Code Editor and Button */}
        <div className="h-full p-4 bg-gray-50 flex flex-col">
          <div className="text-sm font-mono text-gray-600 mb-2 flex-shrink-0">Editing File: {filePath}</div>
          
          {/* 💡 FIX 5: The editor container must fill the space between the file name and the button */}
          <div className="flex-grow mb-4"> 
            <CodeEditor 
              initialCode={initialCode} 
              language={language} 
              onCodeChange={setCurrentCode} 
            />
          </div>
          
          <button className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition shadow-md flex-shrink-0">
            Submit Pull Request (Phase 5)
          </button>
        </div>

      </div>
    </div>
  );
}