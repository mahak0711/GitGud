'use client';

import React, { useState, useRef, useEffect } from 'react';

// Interfaces for component messages
interface Message {
  role: 'user' | 'mentor';
  text: string;
}

interface MentorChatProps {
  initialIssueDescription: string;
  currentCode: string; // The code the user is currently editing
}

export function MentorChat({ initialIssueDescription, currentCode }: MentorChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 💡 API Call to the Next.js API Route Handler
      const response = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userMessage: userMessage.text,
          issue: initialIssueDescription,
          code: currentCode // Sends the live, updated code content
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from mentor API.');
      }

      const data = await response.json();
      const mentorMessage: Message = { role: 'mentor', text: data.response };
      setMessages((prev) => [...prev, mentorMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, { role: 'mentor', text: 'Error: Cannot connect to the AI mentor. Check your GEMINI_API_KEY.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-xl">
      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 rounded-t-xl bg-gray-50 border border-gray-200">
        {messages.length === 0 && (
            <div className="text-center text-gray-500 italic p-2 bg-white rounded-lg">
                Ask your mentor for a hint! E.g., "Where is the bug in my current code?"
            </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-xl shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-yellow-100 text-gray-800' // Mentor messages look distinct
            }`}>
              {msg.text}
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
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {isLoading ? 'Wait' : 'Ask'}
          </button>
        </div>
      </form>
    </div>
  );
}