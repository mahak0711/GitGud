'use client';
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import React, { useState } from 'react';
import { CodeEditor } from './CodeEditor';
import { MentorChat } from './MentorChat'; 
import { FileTree } from './FileTree'; 
import { 
    MessageSquare, 
    FolderTree, 
    FileCode2, 
    GitPullRequest, 
    Loader2, 
    CheckCircle2, 
    XCircle 
} from 'lucide-react';

interface SolveWrapperProps {
  initialCode: string;
  initialIssueDescription: string;
  filePath: string;
  language: string;
  owner: string;
  repo: string;
  number: string;
  issueId: string;
}

export function SolveWrapper({ 
  initialCode, 
  initialIssueDescription, 
  filePath, 
  language, 
  owner, 
  repo, 
  number, 
  issueId 
}: SolveWrapperProps) {
  
  const [currentCode, setCurrentCode] = useState(initialCode);
  const [currentFilePath, setCurrentFilePath] = useState(filePath);
  
  // Toggle between Chat and Files
  const [activeTab, setActiveTab] = useState<'chat' | 'files'>('chat');
  
  // Loading state for manual file fetch
  const [isFileLoading, setIsFileLoading] = useState(false);

  // For PR submission feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prStatus, setPrStatus] = useState<{ success: boolean | null, message: string | null, url: string | null }>({ success: null, message: null, url: null });

  // Helper: Fetch file content when user clicks in the File Tree
  const handleFileSelect = async (path: string) => {
    setIsFileLoading(true);
    setCurrentFilePath(path); 
    try {
      const res = await fetch('/api/get-file-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, repo, path }),
      });
      const data = await res.json();
      
      if (data.success) {
        setCurrentCode(data.content);
        setPrStatus({ success: null, message: null, url: null });
      } else {
        alert('Failed to load file: ' + data.message);
      }
    } catch (e) {
      console.error(e);
      alert('Error loading file.');
    } finally {
      setIsFileLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setPrStatus({ success: null, message: null, url: null });

    const payload = {
      owner, repo, issueNumber: number,
      filePath: currentFilePath, 
      newContent: currentCode, 
    };

    try {
      const response = await fetch('/api/submit-pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (data.success) {
        setPrStatus({ success: true, message: 'Pull Request Created Successfully!', url: data.prUrl });
      } else {
        setPrStatus({ success: false, message: data.message || 'PR creation failed.', url: null });
      }
    } catch (error) {
      setPrStatus({ success: false, message: 'Network error.', url: null });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-black text-zinc-300 md:flex-row"> 
      
      {/* =========================================================
          LEFT PANEL: Sidebar (Explorer & Chat)
      ========================================================= */}
      <div className="flex h-[40vh] w-full flex-col border-b border-zinc-800 bg-zinc-900/50 md:h-full md:w-80 md:border-b-0 md:border-r lg:w-96 flex-shrink-0"> 
        
        {/* Sidebar Tabs */}
        <div className="flex items-center gap-1 border-b border-zinc-800 p-2">
            <button 
              onClick={() => setActiveTab('chat')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                activeTab === 'chat' 
                  ? 'bg-zinc-800 text-white shadow-sm' 
                  : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Mentor
            </button>
            <button 
              onClick={() => setActiveTab('files')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                activeTab === 'files' 
                  ? 'bg-zinc-800 text-white shadow-sm' 
                  : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300'
              }`}
            >
              <FolderTree className="h-4 w-4" />
              Files
            </button>
        </div>

        {/* Sidebar Content Area */}
        <div className="flex-grow overflow-hidden relative">
          
          {/* TAB: CHAT */}
          {activeTab === 'chat' && (
            <div className="flex h-full flex-col">
              
              {/* Context Block (Collapsible-ish) */}
              <div className="shrink-0 border-b border-zinc-800 bg-zinc-900 p-4">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Issue Context
                </h3>
                <div className="max-h-32 overflow-y-auto rounded-md bg-black/40 p-3 text-xs leading-relaxed text-zinc-400 scrollbar-thin scrollbar-thumb-zinc-700">
                  {initialIssueDescription}
                </div>
              </div>

              {/* Chat Component */}
              <div className="flex grow min-h-0 bg-black/20">
                <MentorChat 
                  initialIssueDescription={initialIssueDescription} 
                  currentCode={currentCode} 
                  issueId={issueId} 
                />
              </div>
            </div>
          )}

          {/* TAB: FILES */}
          {activeTab === 'files' && (
            <div className="h-full overflow-y-auto bg-zinc-900/30 p-2 scrollbar-thin scrollbar-thumb-zinc-700">
               <div className="mb-4 px-2 pt-2">
                 <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Repository</h3>
                 <p className="text-sm text-zinc-300">{owner}/{repo}</p>
               </div>
              <FileTree owner={owner} repo={repo} onSelectFile={handleFileSelect} />
            </div>
          )}
        </div>
      </div>

      {/* =========================================================
          RIGHT PANEL: Editor Area
      ========================================================= */}
      <div className="flex flex-grow flex-col h-full bg-[#1e1e1e]">
        
        {/* Editor Breadcrumb / Toolbar */}
        <div className="flex h-10 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            {isFileLoading ? (
               <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            ) : (
               <FileCode2 className="h-4 w-4 text-blue-400" />
            )}
            
            {/* Editable File Path */}
            <input 
                type="text" 
                value={currentFilePath}
                onChange={(e) => setCurrentFilePath(e.target.value)}
                className="min-w-[300px] bg-transparent font-mono text-zinc-200 outline-none focus:text-white"
                spellCheck={false}
            />
          </div>
          <div className="text-xs text-zinc-500">
            {language}
          </div>
        </div>
        
        {/* Monaco Editor Container */}
        <div className="flex-grow relative"> 
          <CodeEditor initialCode={currentCode} language={language} onCodeChange={setCurrentCode} />
        </div>
        
        {/* Bottom Action Bar (Terminal Style) */}
        <div className="shrink-0 border-t border-zinc-800 bg-zinc-900 p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                
                {/* Status Message Area */}
                <div className="flex items-center gap-2">
                    {prStatus.message && (
                        <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                            prStatus.success 
                            ? 'bg-green-500/10 text-green-400' 
                            : 'bg-red-500/10 text-red-400'
                        }`}>
                            {prStatus.success ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            {prStatus.message}
                            {prStatus.url && (
                                <a href={prStatus.url} target="_blank" className="ml-1 underline decoration-green-400 underline-offset-2 hover:text-green-300">
                                    View PR
                                </a>
                            )}
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white transition-all ${
                        isSubmitting 
                        ? 'cursor-not-allowed bg-zinc-700 opacity-50' 
                        : 'bg-green-600 hover:bg-green-500 hover:shadow-lg active:scale-95'
                    }`}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Pushing...</span>
                        </>
                    ) : (
                        <>
                            <GitPullRequest className="h-4 w-4" />
                            <span>Submit Pull Request</span>
                        </>
                    )}
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}