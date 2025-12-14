'use client';

import React, { useState, useEffect } from 'react';

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
          setItems(data.items);
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

  return (
    <div className="flex flex-col h-full bg-white border rounded-md shadow-sm overflow-hidden text-sm">
      
      {/* 1. Header / Breadcrumbs */}
      <div className="p-2 bg-gray-100 border-b flex items-center gap-2">
        <button 
          onClick={handleGoBack}
          disabled={!currentPath}
          className={`px-2 py-1 rounded text-xs font-bold border transition
            ${!currentPath 
              ? 'text-gray-300 border-gray-200 cursor-not-allowed' 
              : 'text-gray-600 border-gray-300 hover:bg-white bg-gray-50'}`}
        >
          ⬆ Up
        </button>
        <div className="truncate font-mono text-gray-600 text-xs flex-1" title={currentPath}>
          {currentPath || '/ (root)'}
        </div>
      </div>

      {/* 2. The File List */}
      <div className="flex-grow overflow-y-auto p-2 space-y-1">
        
        {loading && (
          <div className="flex justify-center p-4 text-gray-400 italic">
            Loading...
          </div>
        )}

        {error && (
          <div className="p-4 text-red-500 text-center text-xs">
            {error} <br/>
            <button onClick={() => setCurrentPath('')} className="underline mt-1">
              Return to Root
            </button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="text-gray-400 text-center p-4 italic">Empty folder.</div>
        )}

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
            className={`
              flex items-center gap-2 p-2 rounded cursor-pointer transition select-none
              ${item.type === 'dir' 
                ? 'text-blue-700 hover:bg-blue-50 font-medium' 
                : 'text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            <span className="opacity-70 text-base">
              {item.type === 'dir' ? '📁' : '📄'}
            </span>
            <span className="truncate">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}