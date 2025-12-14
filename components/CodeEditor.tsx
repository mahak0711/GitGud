'use client'; 

import Editor from '@monaco-editor/react';
import { useState, useEffect } from 'react'; // 1. Import useEffect

interface CodeEditorProps {
  initialCode: string;
  language?: string;
  onCodeChange: (code: string) => void;
}

export function CodeEditor({ initialCode, language = 'javascript', onCodeChange }: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);

  // 2. ⚡ VITAL FIX: Update local state when the parent passes new code (e.g. changing files)
  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  return (
    <div className="h-full border border-gray-300 rounded-xl overflow-hidden shadow-sm flex flex-col bg-[#1e1e1e]">
      {/* Editor Header */}
      <div className="bg-[#2d2d2d] text-gray-300 px-4 py-2 text-sm font-mono border-b border-gray-700 flex justify-between">
        <span>{language}</span>
        <span className="text-xs text-green-400">● Editing Enabled</span>
      </div>
      
      {/* The Actual Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language} // Use 'language' prop directly (defaultLanguage is only for init)
          theme="vs-dark"
          value={code} // This now updates correctly thanks to the useEffect
          onChange={(value) => {
             const newCode = value || '';
             setCode(newCode); 
             onCodeChange(newCode); 
           }}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
            padding: { top: 16 },
            automaticLayout: true, // Helper to resize properly
          }}
        />
      </div>
    </div>
  );
}