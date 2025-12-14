'use client';

import React, { useState } from 'react';
import { CodeEditor } from './CodeEditor';
import { MentorChat } from './MentorChat'; 
import { FileTree } from './FileTree'; // 👈 Import the new component

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
  const [currentFilePath, setCurrentFilePath] = useState(filePath);
  
  // 💡 NEW STATE: Toggle between Chat and Files
  const [activeTab, setActiveTab] = useState<'chat' | 'files'>('chat');
  
  // 💡 NEW STATE: Loading state for manual file fetch
  const [isFileLoading, setIsFileLoading] = useState(false);

  // For PR submission feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prStatus, setPrStatus] = useState<{ success: boolean | null, message: string | null, url: string | null }>({ success: null, message: null, url: null });

  // ⚡ Helper: Fetch file content when user clicks in the File Tree
  const handleFileSelect = async (path: string) => {
    setIsFileLoading(true);
    setCurrentFilePath(path); // Update input field
    try {
      // Call our new API to get the raw content
      const res = await fetch('/api/get-file-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, repo, path }),
      });
      const data = await res.json();
      
      if (data.success) {
        setCurrentCode(data.content);
        // Reset PR status when loading new file
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
        setPrStatus({ success: true, message: '🎉 Success! Pull Request created.', url: data.prUrl });
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
    <div className="flex flex-grow w-full h-full"> 
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full h-full"> 
        
        {/* LEFT PANEL: Sidebar with Tabs */}
        <div className="border-r bg-white flex flex-col h-full overflow-hidden"> 
          
          {/* Tab Headers */}
          <div className="flex border-b">
            <button 
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'chat' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
            >
              🤖 AI Mentor
            </button>
            <button 
              onClick={() => setActiveTab('files')}
              className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'files' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
            >
              📂 File Browser
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-grow overflow-hidden relative">
            
            {/* 1. CHAT TAB */}
            {activeTab === 'chat' && (
              <div className="h-full flex flex-col p-4 overflow-y-auto">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4 flex-shrink-0">
                  <h2 className="text-lg font-bold text-blue-900 mb-2">The Issue:</h2>
                  <p className="text-blue-800 whitespace-pre-wrap font-mono text-sm max-h-40 overflow-y-auto">
                    {initialIssueDescription}
                  </p>
                </div>
                <div className="flex-grow min-h-0">
                  <MentorChat initialIssueDescription={initialIssueDescription} currentCode={currentCode} />
                </div>
              </div>
            )}

            {/* 2. FILES TAB */}
            {activeTab === 'files' && (
              <div className="h-full p-2 overflow-y-auto bg-gray-50">
                <FileTree owner={owner} repo={repo} onSelectFile={handleFileSelect} />
              </div>
            )}

          </div>
        </div>

        {/* RIGHT PANEL: Editor */}
        <div className="h-full p-4 bg-gray-50 flex flex-col">
          {/* File Path Bar */}
          <div className="mb-2 flex flex-col gap-1 flex-shrink-0">
            <label className="text-xs font-bold text-gray-500 uppercase flex justify-between">
              <span>Target File Path:</span>
              {isFileLoading && <span className="text-blue-600 animate-pulse">Loading file...</span>}
            </label>
            <input 
                type="text" 
                value={currentFilePath}
                onChange={(e) => setCurrentFilePath(e.target.value)}
                className="border border-gray-300 p-2 rounded text-sm w-full font-mono text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          
          <div className="flex-grow mb-4 relative border rounded-md overflow-hidden shadow-sm"> 
            <CodeEditor initialCode={currentCode} language={language} onCodeChange={setCurrentCode} />
          </div>
          
          {prStatus.message && (
            <div className={`p-3 mb-2 rounded-lg text-sm text-center font-medium ${prStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {prStatus.message}
              {prStatus.url && <a href={prStatus.url} target="_blank" className="block mt-1 underline font-bold">View PR →</a>}
            </div>
          )}

          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className={`w-full py-3 font-bold rounded-lg transition shadow-md flex justify-center items-center gap-2 ${isSubmitting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700 text-white'}`}
          >
            {isSubmitting ? 'Creating PR...' : 'Submit Pull Request'}
          </button>
        </div>

      </div>
    </div>
  );
}