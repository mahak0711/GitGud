'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';

// 1. Interface matching the Database Schema
interface Message {
  _id?: string;
  role: 'user' | 'mentor' | 'model'; 
  content: string; 
  timestamp?: string;
}

interface MentorChatProps {
  initialIssueDescription: string;
  currentCode: string; 
  issueId: string; 
}

export function MentorChat({ initialIssueDescription, currentCode, issueId }: MentorChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true); 
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- 1. Load History ---
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true); 
      try {
        const response = await fetch(`/api/chat/history?issueId=${issueId}`);
        
        if (!response.ok) throw new Error('Failed to load chat history.');
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.history)) {
          const formattedHistory: Message[] = data.history.map((msg: any) => ({
            _id: msg._id,
            role: msg.role === 'user' ? 'user' : 'mentor', 
            content: msg.content, 
            timestamp: msg.timestamp,
          }));
          setMessages(formattedHistory);
        } else {
            setMessages([]); 
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
      } finally {
        setIsLoading(false); 
      }
    };

    if (issueId) {
        fetchHistory();
    }
  }, [issueId]); 

  // Scroll to bottom effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]); // Trigger on loading state change too (for thinking indicator)

  // --- 2. Send Message ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userPrompt = input.trim();
    const tempUserMessage: Message = { role: 'user', content: userPrompt }; 

    // Optimistic Update
    setMessages((prev) => [...prev, tempUserMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: userPrompt, 
          issueId: issueId, 
          issue: initialIssueDescription,
          code: currentCode
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from mentor API.');
      }

      const data = await response.json();
      
      if (data.success && data.message) {
        const mentorMessage: Message = { 
            role: 'mentor', 
            content: data.message.content, 
            _id: data.message._id 
        };
        
        setMessages((prev) => {
          const confirmedMessages = prev.filter(msg => msg !== tempUserMessage);
          return [...confirmedMessages, { ...tempUserMessage, _id: data.message._id + "-user" }, mentorMessage];
        });

      } else {
         throw new Error(data.message || 'API call succeeded but returned unexpected data.');
      }

    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => {
        const failedMessages = prev.filter(msg => msg !== tempUserMessage);
        return [...failedMessages, { role: 'mentor', content: 'Error: Failed to send message or get response.' }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Changed to h-full to fill the parent sidebar container
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-300"> 
      
      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        
        {/* Empty State */}
        {!isLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center space-y-3 py-10 opacity-60">
              <div className="rounded-full bg-zinc-900 p-3">
                <Sparkles className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-sm text-center">
                I'm your AI Mentor. <br/> Ask me for a hint or help debugging!
              </p>
          </div>
        )}
        
        {/* Message Bubbles */}
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg._id || index} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                isUser 
                  ? 'border-zinc-700 bg-zinc-800 text-zinc-300' 
                  : 'border-blue-900/30 bg-blue-900/20 text-blue-400'
              }`}>
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              {/* Bubble */}
              <div className={`flex max-w-[85%] flex-col gap-1`}>
                <div className={`relative rounded-lg px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                  isUser 
                    ? 'bg-zinc-800 text-zinc-100' 
                    : 'bg-zinc-900/50 text-zinc-300 border border-zinc-800'
                }`}>
                  {/* Simple Markdown Simulation for Code Blocks */}
                  <span className="whitespace-pre-wrap font-sans">
                    {msg.content.split('```').map((part, i) => {
                        if (i % 2 === 1) {
                            // Code block style
                            return (
                                <code key={i} className="my-2 block rounded-md bg-black p-2 font-mono text-xs text-green-400">
                                    {part.trim()}
                                </code>
                            )
                        }
                        return part;
                    })}
                  </span>
                </div>
                {/* Timestamp (Optional) */}
                <span className={`text-[10px] text-zinc-600 ${isUser ? 'text-right' : 'text-left'}`}>
                    {isUser ? 'You' : 'Mentor'}
                </span>
              </div>
            </div>
          );
        })}

        {/* Thinking Indicator */}
        {isLoading && (
            <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-blue-900/30 bg-blue-900/20 text-blue-400">
                    <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.3s]"></span>
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.15s]"></span>
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500"></span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-zinc-800 bg-zinc-900 p-3">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={isLoading ? "Analyzing..." : "Ask a question about the code..."}
            className="flex-1 rounded-md border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white transition-colors hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}