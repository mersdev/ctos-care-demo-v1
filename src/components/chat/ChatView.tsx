import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChatMessage, ChatState } from "../../types/chat";
import { ChatService } from "../../services/chat-service";
import { v4 as uuidv4 } from "uuid";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { aiServiceFactory } from "../../services/ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const STORAGE_KEY = "ctosReport";

const ChatView: React.FC = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get report from localStorage
  const getReport = useRef(() => {
    const storedReport = localStorage.getItem(STORAGE_KEY);
    if (!storedReport) return null;
    try {
      return JSON.parse(storedReport);
    } catch (error) {
      console.error("Error parsing stored report:", error);
      return null;
    }
  }).current;

  // Create AI service and chat service only once
  const chatService = useMemo(() => {
    const aiService = aiServiceFactory.createService({
      model: "llama3",
      baseUrl: "http://localhost:11434",
    });
    return ChatService.getInstance(aiService, getReport());
  }, []); // Empty dependency array means this will only run once

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      role: "user",
      timestamp: new Date(),
    };

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));
    setInput("");

    try {
      const response = await chatService.generateResponse(userMessage.content);
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, response],
        isLoading: false,
      }));
    } catch (error) {
      console.error("Chat response error:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to generate response",
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg flex-1 flex flex-col overflow-hidden">
        {/* Chat messages container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {state.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              } animate-fadeIn`}
            >
              <div
                className={`
                  ${message.role === "user" ? "max-w-[85%]" : "w-[85%]"} 
                  rounded-lg shadow-sm
                  transform transition-all duration-200 ease-out
                  hover:shadow-md hover:-translate-y-0.5
                  ${
                    message.role === "user"
                      ? "bg-blue-500 text-white px-5 py-3 rounded-br-none animate-slideLeft"
                      : "bg-gray-50 text-gray-800 px-6 py-4 rounded-bl-none border border-gray-100 animate-slideRight"
                  }
                `}
              >
                <div className="flex flex-col">
                  {message.role === "user" ? (
                    <div>
                      <p className="text-sm leading-relaxed text-right">
                        {message.content}
                      </p>
                      <p className="text-xs mt-2 text-blue-100 text-right">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <ReactMarkdown
                        className="text-sm prose prose-sm max-w-none text-left
                          prose-headings:font-semibold prose-headings:mb-2 prose-headings:mt-1
                          prose-h2:text-lg prose-h3:text-base
                          prose-p:my-2 prose-p:leading-relaxed
                          prose-li:my-1
                          prose-table:my-2 prose-table:text-sm
                          prose-th:py-2 prose-th:px-3 prose-th:bg-gray-100
                          prose-td:py-2 prose-td:px-3
                          prose-strong:text-blue-600 dark:prose-strong:text-blue-500
                          prose-pre:bg-gray-100 prose-pre:p-3 prose-pre:rounded-md
                          prose-code:text-blue-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                          [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                        remarkPlugins={[remarkGfm]}
                      >
                        {message.content}
                      </ReactMarkdown>
                      <p className="text-xs mt-2 text-gray-400 text-left">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {state.isLoading && (
            <div className="flex justify-start animate-fadeIn">
              <div className="w-[85%] bg-gray-50 rounded-lg px-6 py-4 shadow-sm border border-gray-100 rounded-bl-none">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="👋 How can I help you today? ✨"
              className="flex-1 border border-gray-200 rounded-lg px-4 py-3 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                placeholder:text-gray-400 text-gray-700
                transition-all duration-200 ease-out
                hover:border-blue-300"
              disabled={state.isLoading}
            />
            <button
              type="submit"
              disabled={state.isLoading || !input.trim()}
              className="bg-blue-500 text-white rounded-lg px-5 py-3
                focus:outline-none focus:ring-2 focus:ring-blue-500 
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200 ease-out
                hover:bg-blue-600 hover:shadow-md hover:-translate-y-0.5
                active:translate-y-0"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
