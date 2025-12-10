'use client'; 

import Editor from '@monaco-editor/react';
import { useState } from 'react';

interface CodeEditorProps {
  initialCode: string;
  language?: string;
}

export function CodeEditor({ initialCode, language = 'javascript' }: CodeEditorProps) {
  // We track the code in state so we can eventually send it to the AI or GitHub
  const [code, setCode] = useState(initialCode);

  return (
    <div className="h-full border border-gray-300 rounded-xl overflow-hidden shadow-sm flex flex-col bg-[#1e1e1e]">
      {/* Editor Header */}
      <div className="bg-[#2d2d2d] text-gray-300 px-4 py-2 text-sm font-mono border-b border-gray-700 flex justify-between">
        <span>main.{language === 'javascript' ? 'js' : 'py'}</span>
        <span className="text-xs text-gray-500">Read-only mode (Demo)</span>
      </div>
      
      {/* The Actual Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage={language}
          theme="vs-dark" // The classic dark mode theme
          value={code}
          onChange={(value) => setCode(value || '')}
          options={{
            minimap: { enabled: false }, // Saves space
            fontSize: 14,
            scrollBeyondLastLine: false,
            padding: { top: 16 },
          }}
        />
      </div>
    </div>
  );
}