import React, { useEffect, useState, useCallback } from "react";
import type { CTOSReport as CTOSReportType } from "../types/ctos";
import { AIServiceError } from "../services/ai/types";
import {
  ExclamationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { toast, Toaster } from "react-hot-toast";
import { CTOSCoreService } from "../services/ctos-core";
import { AIModelType } from "../services/types";
import {
  ReportHeader,
  ScoreAndLitigationSection,
  SnapshotSection,
  BankingHistorySection,
  DirectorshipsSection,
  LegalCasesSection,
  TradeRefereesSection,
} from "./ctos/sections";
import { aiServiceFactory } from "../services/ai";

interface Props {
  geminiApiKey?: string;
  groqApiKey?: string;
  ollamaBaseUrl?: string;
  preferredModel: AIModelType;
}

interface CTOSReportProps {
  report?: CTOSReportType | null;
  onRegenerate: () => void;
  isLoading: boolean;
}

const STORAGE_KEY = "ctosReport";

const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Header skeleton */}
    <div className="h-32 bg-gray-200 rounded-lg w-full" />

    {/* Score and litigation skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="h-48 bg-gray-200 rounded-lg" />
      <div className="h-48 bg-gray-200 rounded-lg" />
    </div>

    {/* Banking history skeleton */}
    <div className="h-64 bg-gray-200 rounded-lg" />

    {/* Legal cases skeleton */}
    <div className="h-96 bg-gray-200 rounded-lg" />

    {/* Trade referees skeleton */}
    <div className="h-48 bg-gray-200 rounded-lg" />
  </div>
);

const FloatingButton = ({ onRegenerate, isLoading }: { onRegenerate: () => void; isLoading: boolean }) => (
  <button
    onClick={onRegenerate}
    disabled={isLoading}
    className={`fixed bottom-8 right-8 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${isLoading ? 'animate-pulse' : ''}`}
    aria-label="Regenerate Report"
  >
    <ArrowPathIcon className={`h-6 w-6 ${isLoading ? 'animate-spin' : ''}`} />
  </button>
);

const CTOSReport: React.FC<CTOSReportProps> = ({ report, onRegenerate, isLoading }) => {
  if (!report) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-8">
      <ReportHeader
        personalInfo={report.personalInfo}
        isVerified={report.isVerified}
      />
      <ScoreAndLitigationSection
        score={report.score}
        litigationIndex={report.litigationIndex}
      />
      <SnapshotSection snapshot={report.snapshot} />
      <BankingHistorySection
        ccrisSummary={report.bankingHistory.ccrisSummary}
      />
      <DirectorshipsSection directorships={report.directorships} />
      <LegalCasesSection
        asDefendant={report.legalCases.asDefendant}
        asPlaintiff={report.legalCases.asPlaintiff}
      />
      <TradeRefereesSection referees={report.tradeReferees} />
      <FloatingButton onRegenerate={onRegenerate} isLoading={isLoading} />
      <Toaster position="bottom-right" />
    </div>
  );
};

const CTOSReportContainer: React.FC<Props> = ({
  geminiApiKey,
  groqApiKey,
  ollamaBaseUrl,
  preferredModel,
}) => {
  const [report, setReport] = useState<CTOSReportType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to get report from localStorage first
      const cachedReport = localStorage.getItem(STORAGE_KEY);
      if (cachedReport) {
        setReport(JSON.parse(cachedReport));
        setIsLoading(false);
        return;
      }

      // If no cached report, generate a new one
      const serviceConfig = {
        geminiApiKey,
        groqApiKey,
        ollamaBaseUrl,
        preferredModel,
        aiService: aiServiceFactory.createService({
          model: preferredModel === "gemini"
            ? "gemini-1.5-flash"
            : preferredModel === "groq"
            ? "llama3-8b-8192"
            : "llama3",
          apiKey:
            preferredModel === "gemini"
              ? geminiApiKey
              : preferredModel === "groq"
              ? groqApiKey
              : undefined,
          baseUrl: preferredModel === "ollama" ? ollamaBaseUrl : undefined,
        }),
      };
      const ctosService = CTOSCoreService.getInstance(serviceConfig);
      const newReport = await ctosService.generateReportWithFetchedData(
        serviceConfig
      );

      // Save to localStorage and update state
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newReport));
      setReport(newReport);
      toast.success("Report generated successfully!");
    } catch (err) {
      console.error("Error generating report:", err);
      const errorMessage =
        err instanceof AIServiceError
          ? err.message
          : "An unexpected error occurred while generating the report";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [preferredModel, geminiApiKey, groqApiKey, ollamaBaseUrl]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleRegenerate = async () => {
    localStorage.clear(); // Clear all localStorage data
    setReport(null); // Clear current report to trigger re-render with loading state
    await fetchReport(); // Fetch and generate new report
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <ExclamationCircleIcon className="h-16 w-16 text-red-500" />
        <h2 className="text-xl font-semibold text-gray-900">Error</h2>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={handleRegenerate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <CTOSReport report={report} onRegenerate={handleRegenerate} isLoading={isLoading} />
      {isLoading && <LoadingSkeleton />}
    </div>
  );
};

export { CTOSReportContainer as CTOSReport };
