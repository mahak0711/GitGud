'use client'; 

import Editor, { OnMount } from '@monaco-editor/react';
import { useState, useEffect } from 'react';
import { Copy, Check, RotateCcw, FileJson } from 'lucide-react';

interface CodeEditorProps {
  initialCode: string;
  language?: string;
  onCodeChange: (code: string) => void;
}

export function CodeEditor({ initialCode, language = 'javascript', onCodeChange }: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [isCopied, setIsCopied] = useState(false);

  // 1. Sync state when switching files
  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  // 2. Handle Copy to Clipboard
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // 3. Handle Reset
  const handleReset = () => {
    const confirmReset = window.confirm("Are you sure you want to revert all changes?");
    if (confirmReset) {
      setCode(initialCode);
      onCodeChange(initialCode);
    }
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-md border border-zinc-800 bg-[#1e1e1e] shadow-inner">
      
      {/* Utility Toolbar (Floating on top right or fixed strip) */}
      <div className="flex h-9 shrink-0 items-center justify-end gap-2 border-b border-zinc-800 bg-[#1e1e1e] px-2 pr-4">
        
        {/* Language Indicator */}
        <div className="mr-auto flex items-center gap-2 px-2 text-xs text-zinc-500">
           <FileJson className="h-3 w-3" />
           <span className="uppercase">{language}</span>
        </div>

        {/* Reset Button */}
        <button 
          onClick={handleReset}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
          title="Revert to original"
        >
          <RotateCcw className="h-3 w-3" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        {/* Copy Button */}
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
          title="Copy code"
        >
          {isCopied ? (
            <>
              <Check className="h-3 w-3 text-green-500" />
              <span className="text-green-500">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span className="hidden sm:inline">Copy</span>
            </>
          )}
        </button>
      </div>
      
      {/* The Actual Editor */}
      <div className="relative flex-1">
        <Editor
          height="100%"
          language={language} 
          theme="vs-dark"
          value={code} 
          onChange={(value) => {
             const newCode = value || '';
             setCode(newCode); 
             onCodeChange(newCode); 
           }}
          // 4. Premium Editor Options
          options={{
            minimap: { enabled: false }, // Cleaner look without minimap for smaller screens
            fontSize: 14,
            lineHeight: 22,
            fontFamily: "'Geist Mono', 'Fira Code', 'Menlo', monospace", // Use a nice font if available
            fontLigatures: true, // Makes => look like an arrow
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            padding: { top: 16, bottom: 16 },
            bracketPairColorization: { enabled: true },
            guides: {
                indentation: true,
                bracketPairs: true
            },
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}