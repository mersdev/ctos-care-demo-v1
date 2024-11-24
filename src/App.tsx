import React, { useState } from "react";
import { Navbar } from "./components/layout";
import { CTOSReport } from "./components/CTOSReport";
import TaskView from "./components/task/TaskView";
import ChatView from "./components/chat/ChatView";
import { AIModelType } from "./services/types";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState<"report" | "chat">("report");

  // TODO: HARDCODE YOUR PREFERRED MODEL HERE: "groq" | "gemini" | "ollama"
  const selectedModel: AIModelType = "ollama";

  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim() || undefined;
  const groqApiKey = import.meta.env.VITE_GROQ_API_KEY?.trim() || undefined;
  const ollamaBaseUrl =
    import.meta.env.VITE_OLLAMA_BASE_URL?.trim() || undefined;

  const config = {
    preferredModel: selectedModel,
    geminiApiKey: geminiApiKey,
    groqApiKey: groqApiKey,
    ollamaBaseUrl: ollamaBaseUrl,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Router basename="/ctos-care-demo-v1">
        <div className="flex flex-col h-screen">
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-8">
            <Routes>
              <Route
                path="/"
                element={
                  currentPage === "report" ? (
                    <CTOSReport {...config} />
                  ) : (
                    <ChatView />
                  )
                }
              />
              <Route path="/tasks" element={<TaskView />} />
              <Route path="/chat" element={<ChatView />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </div>
  );
}

export default App;
