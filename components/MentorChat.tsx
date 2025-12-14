'use client';

import React, { useState, useRef, useEffect } from 'react';

// 1. UPDATED: Ensure the interface uses 'content'
interface Message {
  _id?: string;
  role: 'user' | 'mentor' | 'model'; 
  content: string; // Renamed from 'text'
  timestamp?: string;
}

interface MentorChatProps {
  initialIssueDescription: string;
  currentCode: string; 
}

export function MentorChat({ initialIssueDescription, currentCode }: MentorChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true); 
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- History Loading Logic (Remains mostly the same, ensuring role mapping) ---
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/chat/history');
        if (!response.ok) throw new Error('Failed to load chat history.');
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.history)) {
          const formattedHistory: Message[] = data.history.map((msg: any) => ({
            _id: msg._id,
            role: msg.role === 'user' ? 'user' : 'mentor', 
            content: msg.content, // 2. CORRECTED: Access 'content' from the DB object
            timestamp: msg.timestamp,
          }));
          setMessages(formattedHistory);
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
      } finally {
        setIsLoading(false); 
      }
    };

    fetchHistory();
  }, []); 

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // 3. CORRECTED: Use 'content' when creating the new user message object
    const userPrompt = input.trim();
    const tempUserMessage: Message = { role: 'user', content: userPrompt }; 

    setMessages((prev) => [...prev, tempUserMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // API call to the new persistent route
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: userPrompt, // Sending the prompt content
          issue: initialIssueDescription,
          code: currentCode
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from mentor API.');
      }

      const data = await response.json();
      
      if (data.success && data.message) {
        // The API returns the SAVED AI message object, which uses 'content'
        const mentorMessage: Message = { 
            role: 'mentor', 
            content: data.message.content, // Access 'content' from the API response
            _id: data.message._id 
        };
        
        // Final State Update
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
        // 4. CORRECTED: Use 'content' for the error message
        return [...failedMessages, { role: 'mentor', content: 'Error: Failed to send message or get response.' }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render ---
 return (
    // 🎯 FIX: Replace h-full with a defined height class (e.g., h-96 or h-[500px])
    // The h-[500px] class ensures the component takes up space regardless of its parent's height.
    <div className="flex flex-col h-[500px] rounded-xl border border-gray-300 shadow-lg"> 
      
      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 rounded-t-xl bg-gray-50 border-b border-gray-200">
        
        {/* Loading Message Check */}
        {isLoading && (
          <div className="text-center text-gray-500 italic p-2 bg-white rounded-lg">
            Loading chat history...
          </div>
        )}
        
        {/* Initial Prompt Message Check */}
        {!isLoading && messages.length === 0 && (
          <div className="text-center text-gray-500 italic p-2 bg-white rounded-lg">
              Ask your mentor for a hint! E.g., "Where is the bug in my current code?"
          </div>
        )}
        
        {/* Render Messages */}
        {messages.map((msg, index) => (
          // ... (Message rendering logic remains the same) ...
          <div key={msg._id || index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-xl shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-yellow-100 text-gray-800' 
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-white rounded-b-xl">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={isLoading ? "Mentor is thinking..." : "Ask your mentor..."}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {isLoading ? 'Wait' : 'Ask'}
          </button>
        </div>
      </form>
    </div>
  );
}