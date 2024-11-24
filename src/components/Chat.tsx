import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatState } from '../types/chat';
import { ChatService } from '../services/chat-service';
import { CTOSReport } from '../types/ctos';
import { AIService } from '../services/ai/types';
import { v4 as uuidv4 } from 'uuid';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface Props {
  aiService: AIService;
  report: CTOSReport | null;
}

export const Chat: React.FC<Props> = ({ aiService, report }) => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatService = ChatService.getInstance(aiService, report);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || state.isLoading) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));
    setInput('');

    try {
      const response = await chatService.generateResponse(userMessage.content);
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, response],
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to generate response',
      }));
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-4 flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {state.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {state.isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={state.isLoading}
          />
          <button
            type="submit"
            disabled={state.isLoading || !input.trim()}
            className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
