import { CTOSReport, PersonalInfo } from "../types/ctos";
import { TransactionData } from "../types/financial";
import { AIService } from "./ai/types";

export interface CTOSServiceConfig {
  geminiApiKey?: string;
  groqApiKey?: string;
  ollamaBaseUrl?: string;
  preferredModel: AIModelType;
  aiService: AIService;
}

export type AIModelType = "gemini" | "ollama" | "groq";

export interface CTOSService {
  generateReport(
    transactionData: TransactionData,
    personalInfo: PersonalInfo,
    config: CTOSServiceConfig
  ): Promise<CTOSReport>;
}

export interface FinancialMetrics {
  monthlyIncome: number;
  monthlyExpenses: number;
  fixedExpenses: number;
  variableExpenses: number;
  debtPayments: number;
  netWorth: number;
  debtToIncomeRatio: number;
  savingsRate: number;
  creditUtilization: number;
  emergencyFundRatio: number;
}
