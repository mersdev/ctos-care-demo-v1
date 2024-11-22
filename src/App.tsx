import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { FinancialHealthReport } from "./components/FinancialHealthReport";
import { TransactionData } from "./types/financial";
import "./App.css";

function App() {
  const [transactionData, setTransactionData] =
    useState<TransactionData | null>(null);
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
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
      <Router basename="/trapeza-v1-demo">
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
