import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { FinancialHealthReport } from "./components/FinancialHealthReport";
import { TransactionData } from "./types/financial";
import "./App.css";

function App() {
  const [transactionData, setTransactionData] =
    useState<TransactionData | null>(null);
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // Determine base URL based on hostname
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  const baseUrl = isLocalhost
    ? "http://localhost:5173/trapeza-v1-demo/"
    : "https://mersdev.github.io/trapeza-v1-demo/";

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Use the correct path based on environment
        const response = await fetch("transactions.json");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTransactionData(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, []);

  if (!transactionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Router basename={isLocalhost ? "/trapeza-v1-demo" : "/trapeza-v1-demo"}>
        <Routes>
          <Route
            path="/"
            element={
              <FinancialHealthReport
                transactionData={transactionData}
                geminiApiKey={geminiApiKey}
              />
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
