'use client';

import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FileCode2, 
  File, 
  ChevronLeft, 
  Home, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

// Define what a file look like
interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'dir';
}

interface FileTreeProps {
  owner: string;
  repo: string;
  onSelectFile: (path: string) => void;
}

export function FileTree({ owner, repo, onSelectFile }: FileTreeProps) {
  const [currentPath, setCurrentPath] = useState(''); // Root starts empty
  const [items, setItems] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch files whenever the path changes
  useEffect(() => {
    async function fetchFiles() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/repo-tree', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ owner, repo, path: currentPath }),
        });
        const data = await res.json();
        
        if (data.success) {
          // Sort: Folders first, then files
          const sortedItems = (data.items as FileNode[]).sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'dir' ? -1 : 1;
          });
          setItems(sortedItems);
        } else {
          setError(data.message || 'Failed to load folder');
        }
      } catch (err) {
        setError('Network error loading files.');
      } finally {
        setLoading(false);
      }
    }

    fetchFiles();
  }, [owner, repo, currentPath]);

  // Handle "Go Up" navigation
  const handleGoBack = () => {
    if (!currentPath) return; // Already at root
    const parts = currentPath.split('/');
    parts.pop(); // Remove last folder
    setCurrentPath(parts.join('/'));
  };

  // Helper to get icon based on type/extension
  const getIcon = (type: 'file' | 'dir', name: string) => {
    if (type === 'dir') return <Folder className="h-4 w-4 text-blue-400 fill-blue-400/10" />;
    if (name.endsWith('.js') || name.endsWith('.ts') || name.endsWith('.tsx') || name.endsWith('.jsx')) {
      return <FileCode2 className="h-4 w-4 text-yellow-500" />;
    }
    return <File className="h-4 w-4 text-zinc-500" />;
  };

  return (
    <div className="flex h-full flex-col bg-zinc-950 text-sm text-zinc-300">
      
      {/* 1. Header / Navigation Bar */}
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-zinc-800 bg-zinc-900/50 px-3">
        {currentPath ? (
            <button 
                onClick={handleGoBack}
                className="flex items-center gap-1 rounded px-1.5 py-1 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                title="Go up one level"
            >
                <ChevronLeft className="h-3.5 w-3.5" />
                Back
            </button>
        ) : (
            <div className="flex items-center gap-1 px-1.5 py-1 text-xs font-medium text-zinc-500">
                <Home className="h-3.5 w-3.5" />
                <span>Root</span>
            </div>
        )}
        
        {/* Breadcrumb Display */}
        <div className="h-4 w-px bg-zinc-800 mx-1"></div>
        <div className="truncate font-mono text-xs text-zinc-500 flex-1" title={currentPath || '/'}>
          {currentPath ? `/${currentPath}` : '/'}
        </div>
      </div>

      {/* 2. The File List */}
      <div className="flex-grow overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-zinc-800">
        
        {loading && (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-zinc-500">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            <span className="text-xs">Fetching contents...</span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-center text-xs text-red-400">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
            <button 
                onClick={() => setCurrentPath('')} 
                className="mt-2 rounded bg-zinc-800 px-3 py-1 text-zinc-300 hover:bg-zinc-700"
            >
              Return to Root
            </button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="py-8 text-center text-xs text-zinc-600 italic">
            Empty directory.
          </div>
        )}

        {/* File Items */}
        {!loading && !error && items.map((item) => (
          <div 
            key={item.path}
            onClick={() => {
              if (item.type === 'dir') {
                setCurrentPath(item.path); // Dive deeper
              } else {
                onSelectFile(item.path); // Tell parent to load this file
              }
            }}
            className="group flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-zinc-800/60 active:bg-zinc-800"
          >
            {/* Icon */}
            <span className="shrink-0">
                {getIcon(item.type, item.name)}
            </span>
            
            {/* Name */}
            <span className={`truncate text-xs ${item.type === 'dir' ? 'font-semibold text-zinc-200' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}