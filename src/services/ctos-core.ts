import { AIService } from "./ai/types";
import { CTOSReport, PersonalInfo } from "../types/ctos";
import { TransactionData } from "../types/financial";
import { CTOSService, CTOSServiceConfig } from "./types";
import { STORAGE_KEY } from "./constants";

const PROMPTS = {
  PERSONAL_SUMMARY: (personalInfo: PersonalInfo) => `
Generate a comprehensive personal summary based on this information:
${JSON.stringify(personalInfo, null, 2)}

Return a JSON object with these fields:
{
  "personalSummary": "detailed summary of the person",
  "riskFactors": ["list of risk factors"],
  "recommendations": ["list of recommendations"]
}`,

  FINANCIAL_ANALYSIS: (transactions: TransactionData) => `
Analyze these financial transactions:
${JSON.stringify(transactions, null, 2)}

Return a JSON object with these fields:
{
  "financialSummary": "detailed analysis of financial health",
  "spendingPatterns": ["key spending patterns"],
  "riskIndicators": ["financial risk indicators"]
}`,

  CREDIT_ASSESSMENT: (personalSummary: string, financialAnalysis: string) => `
Based on this information:
Personal Summary: ${personalSummary}
Financial Analysis: ${financialAnalysis}

Return a JSON object with these fields:
{
  "creditScore": number between 300-850,
  "creditRating": "AAA" to "D" rating,
  "riskLevel": "LOW", "MEDIUM", or "HIGH",
  "creditLimit": recommended credit limit in USD,
  "approvalOdds": approval probability percentage
}`,
};

export class CTOSCoreService implements CTOSService {
  private static instance: CTOSCoreService | null = null;
  private _aiService: AIService;

  private constructor(config: CTOSServiceConfig) {
    this._aiService = config.aiService;
  }

  public static getInstance(config?: CTOSServiceConfig): CTOSCoreService {
    if (!CTOSCoreService.instance) {
      if (!config) {
        throw new Error("Config is required when creating a new instance");
      }
      CTOSCoreService.instance = new CTOSCoreService(config);
    }
    return CTOSCoreService.instance;
  }

  async generateReportWithFetchedData(
    config: CTOSServiceConfig
  ): Promise<CTOSReport> {
    // Update AI service with new config
    this._aiService = config.aiService;

    try {
      // Fetch transactions
      const transactionsResponse = await fetch(
        "ctos-care-demo-v1/bad/transactions.json"
      );
      if (!transactionsResponse.ok) {
        throw new Error(`HTTP error! status: ${transactionsResponse.status}`);
      }
      const transactionsData = await transactionsResponse.json();

      // Fetch personal info
      const personalInfoResponse = await fetch(
        "ctos-care-demo-v1/bad/personal_info.json"
      );
      if (!personalInfoResponse.ok) {
        throw new Error(`HTTP error! status: ${personalInfoResponse.status}`);
      }
      const personalInfoData = await personalInfoResponse.json();

      // Generate report with fetched data
      return this.generateReport(transactionsData, personalInfoData, config);
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  }

  async generateReport(
    transactionData: TransactionData,
    personalInfo: PersonalInfo,
    config: CTOSServiceConfig
  ): Promise<CTOSReport> {
    try {
      // Update AI service with new config
      this._aiService = config.aiService;
      
      console.log("Starting report generation...");

      // Step 1: Generate Personal Summary
      console.log("Generating personal summary...");
      const personalSummaryResponse = await this._aiService.generateText(
        PROMPTS.PERSONAL_SUMMARY(personalInfo),
        {
          systemPromptType: "CTOSReport",
          temperature: 0.1,
          maxTokens: 4000,
          topP: 0.95,
        }
      );
      const personalSummaryData = JSON.parse(personalSummaryResponse.text);
      console.log("Personal summary generated:", personalSummaryData);

      // Step 2: Generate Financial Analysis
      console.log("Generating financial analysis...");
      const financialAnalysisResponse = await this._aiService.generateText(
        PROMPTS.FINANCIAL_ANALYSIS(transactionData),
        {
          systemPromptType: "CTOSReport",
          temperature: 0.1,
          maxTokens: 4000,
          topP: 0.95,
        }
      );
      const financialAnalysisData = JSON.parse(financialAnalysisResponse.text);
      console.log("Financial analysis generated:", financialAnalysisData);

      // Step 3: Generate Credit Assessment
      console.log("Generating credit assessment...");
      const creditAssessmentResponse = await this._aiService.generateText(
        PROMPTS.CREDIT_ASSESSMENT(
          personalSummaryData.personalSummary,
          financialAnalysisData.financialSummary
        ),
        {
          systemPromptType: "CTOSReport",
          temperature: 0.1,
          maxTokens: 4000,
          topP: 0.95,
        }
      );
      const creditAssessmentData = JSON.parse(creditAssessmentResponse.text);
      console.log("Credit assessment generated:", creditAssessmentData);

      // Combine all results into final report
      const report = {
        personalInfo,
        analysis: [
          {
            section: "Personal",
            confidence: 0.9,
            reasoning: personalSummaryData.personalSummary,
          },
          {
            section: "Financial",
            confidence: 0.85,
            reasoning: financialAnalysisData.financialSummary,
          },
        ],
        score: {
          score: creditAssessmentData.creditScore,
          factors: {
            paymentHistory: 0.8,
            outstandingDebt: 0.7,
            creditUtilization: 0.75,
            creditHistoryLength: 0.6,
            recentInquiries: 0.9,
          },
          riskCategory: creditAssessmentData.riskLevel.toLowerCase() as
            | "Low"
            | "Medium"
            | "High",
        },
        reportDate: new Date().toISOString(),
        isVerified: true,
        directorships: [],
        legalCases: {
          asDefendant: [],
          asPlaintiff: [],
        },
        litigationIndex: {
          index: 0,
          activeCases: 0,
          resolvedCases: 0,
          totalClaims: 0,
          riskLevel: "Low" as "Low" | "Medium" | "High",
          explanation: "No litigation history found",
        },
        snapshot: {
          idVerification: true,
          bankruptcyStatus: false,
          activeLegalRecords: 0,
          hasLegalRecords: false,
          specialAttentionAccounts: 0,
          hasDishonouredCheques: false,
          outstandingFacilities: 0,
          creditApplications12Months: 0,
          hasTradeReferees: false,
        },
        tradeReferees: [],
        bankingHistory: {
          ccrisSummary: {
            outstandingCredit: 0,
            specialAttentionAccounts: 0,
            creditApplications: 0,
          },
          facilities: [],
          earliestFacility: "",
          securedFacilities: 0,
          unsecuredFacilities: 0,
        },
        confidence: 0.9,
      };

      // Store the report in localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(report));
      
      return report;
    } catch (error) {
      console.error("Error generating report:", error);
      throw error;
    }
  }

  public getStoredReport(): CTOSReport | null {
    try {
      const storedReport = localStorage.getItem(STORAGE_KEY);
      if (!storedReport) return null;
      return JSON.parse(storedReport) as CTOSReport;
    } catch (error) {
      console.error("Error retrieving stored report:", error);
      return null;
    }
  }
}
