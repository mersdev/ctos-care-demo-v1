import { AIService, AIModelConfig, AIResponse, AIServiceError } from "../types";
import { GenerateTextOptions } from "../types/prompts";
import { CTOSReport } from "../../../types/ctos";

export abstract class BaseAIService implements AIService {
  abstract name: string;
  protected _config: AIModelConfig;

  constructor(config: AIModelConfig) {
    this._config = config;
  }

  abstract generateText(prompt: string, options?: GenerateTextOptions): Promise<AIResponse>;

  protected validateCTOSReport(report: any): CTOSReport {
    // Basic structure validation
    if (
      !report.personalInfo ||
      !report.snapshot ||
      !report.score ||
      !report.litigationIndex
    ) {
      throw new Error("Missing required top-level fields in CTOS report");
    }

    // Validate score structure
    if (typeof report.score.score !== "number" || !report.score.riskCategory) {
      throw new Error("Invalid score structure in CTOS report");
    }

    // Validate arrays
    if (
      !Array.isArray(report.directorships) ||
      !Array.isArray(report.tradeReferees)
    ) {
      throw new Error("Invalid array fields in CTOS report");
    }

    // Validate banking history
    if (
      !report.bankingHistory?.ccrisSummary ||
      !Array.isArray(report.bankingHistory.facilities)
    ) {
      throw new Error("Invalid banking history structure in CTOS report");
    }

    return report as CTOSReport;
  }

  protected createBaseReport(): Partial<CTOSReport> {
    return {
      snapshot: {
        idVerification: false,
        bankruptcyStatus: false,
        activeLegalRecords: 0,
        hasLegalRecords: false,
        specialAttentionAccounts: 0,
        hasDishonouredCheques: false,
        outstandingFacilities: 0,
        creditApplications12Months: 0,
        hasTradeReferees: false,
      },
      bankingHistory: {
        ccrisSummary: {
          outstandingCredit: 0,
          specialAttentionAccounts: 0,
          creditApplications: 0,
        },
        facilities: [],
        earliestFacility: new Date().toISOString(),
        securedFacilities: 0,
        unsecuredFacilities: 0,
      },
      directorships: [],
      tradeReferees: [],
      legalCases: {
        asDefendant: [],
        asPlaintiff: [],
      },
      score: {
        score: 0,
        factors: {
          paymentHistory: 0,
          outstandingDebt: 0,
          creditUtilization: 0,
          creditHistoryLength: 0,
          recentInquiries: 0,
        },
        riskCategory: "Medium",
      },
      litigationIndex: {
        index: 0,
        activeCases: 0,
        resolvedCases: 0,
        totalClaims: 0,
        riskLevel: "Low",
        explanation: "No litigation history found.",
      },
      analysis: [
        {
          section: "Financial Analysis",
          confidence: 0.8,
          reasoning: "Based on available data",
        },
      ],
      reportDate: new Date().toISOString(),
      confidence: 0.8,
    };
  }

  protected cleanJsonResponse(content: string): string {
    return content
      .substring(content.indexOf("{"), content.lastIndexOf("}") + 1)
      .trim();
  }

  protected handleServiceError(error: unknown, context: string): never {
    console.error(`${this.name} service error:`, error);
    throw new AIServiceError(
      `Failed to ${context}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      this.name,
      error instanceof Error ? error : undefined
    );
  }
}
