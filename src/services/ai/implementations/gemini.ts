import { AIModelConfig, AIResponse, AIServiceError } from "../types";
import { BaseAIService } from "./base";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { CTOSReport } from "../../../types/ctos";
import {
  SystemPromptType,
  GenerateTextOptions,
  CTOSReportSystemPrompt,
  ChatSystemPrompt,
} from "../types/prompts";

export class GeminiService extends BaseAIService {
  name = "gemini";
  private client: GoogleGenerativeAI;

  constructor(config: AIModelConfig) {
    super(config);
    if (!config.apiKey?.trim()) {
      throw new AIServiceError("Gemini API key is required", this.name);
    }
    this.client = new GoogleGenerativeAI(config.apiKey.trim());
  }

  protected getSystemPrompt(type: SystemPromptType = "Chat"): string {
    switch (type) {
      case "CTOSReport":
        return `IMPORTANT: You must output ONLY valid JSON, with no additional text or explanations.

Task: Generate a CTOS credit report in JSON format.

Rules:
1. Use ONLY the exact field names shown in the example
2. ALL dates must be in YYYY-MM-DD format
3. ALL numbers must be actual numbers (not strings)
4. ALL boolean values must be true/false (not strings)
5. ALL arrays must be properly formatted with []
6. DO NOT include any comments or explanations
7. DO NOT include any text outside the JSON structure

Required JSON Structure:
{
  "personalInfo": {
    "name": "string",          // Full name
    "icNo": "string",          // 12-digit IC number
    "dateOfBirth": "YYYY-MM-DD",
    "nationality": "string",
    "address": "string"
  },
  "snapshot": {
    "idVerification": boolean,
    "bankruptcyStatus": boolean,
    "lastUpdated": "YYYY-MM-DD"
  },
  "score": {
    "score": number,           // 300-850
    "factors": {
      "paymentHistory": number,      // 0-100
      "outstandingDebt": number,     // 0-100
      "creditUtilization": number,   // 0-100
      "creditHistoryLength": number, // 0-100
      "recentInquiries": number      // 0-100
    },
    "riskCategory": "Low" | "Medium" | "High"
  },
  "bankingHistory": {
    "ccrisSummary": {
      "outstandingCredit": number,
      "specialAttentionAccounts": number,
      "creditApplications": number
    },
    "facilities": [
      {
        "status": "string",
        "capacity": "string",
        "lenderType": "string",
        "facilityType": "string",
        "outstandingBalance": number,
        "limit": number,
        "repaymentTerm": "string",
        "collateralType": "string",
        "conductOfAccount": "string",
        "legalStatus": "string"
      }
    ]
  },
  "directorships": [],
  "tradeReferees": [],
  "legalCases": {
    "asDefendant": [],
    "asPlaintiff": []
  },
  "litigationIndex": {
    "index": number,           // 0-100
    "activeCases": number,
    "resolvedCases": number,
    "totalClaims": number,
    "riskLevel": "Low" | "Medium" | "High"
  },
  "analysis": [
    {
      "section": "string",
      "confidence": number,    // 0-1
      "reasoning": "string"
    }
  ],
  "reportDate": "YYYY-MM-DD",
  "confidence": number        // 0-1
}`;
      case "Chat":
        return ChatSystemPrompt;
      default:
        return ChatSystemPrompt;
    }
  }

  protected validateCTOSReport(report: any): CTOSReport {
    return super.validateCTOSReport(report);
  }

  async generateText(
    prompt: string,
    options: GenerateTextOptions = {}
  ): Promise<AIResponse> {
    try {
      const model = this.client.getGenerativeModel({
        model: this._config.model,
      });

      const result = await model.generateContent([
        {
          text: this.getSystemPrompt(options.systemPromptType),
        },
        {
          text: `${prompt}${
            options.systemPromptType === "CTOSReport"
              ? "\n\nRespond with ONLY the JSON, no other text."
              : ""
          }`,
        },
      ]);

      const response = result.response;
      if (!response) {
        throw new Error("Empty response from Gemini");
      }

      let content = response.text() || "{}";
      content = this.cleanJsonResponse(content);

      if (options.systemPromptType === "CTOSReport") {
        try {
          const parsedJson = JSON.parse(content);
          const validatedReport = this.validateCTOSReport(parsedJson);
          const mergedReport = {
            ...this.createBaseReport(),
            ...validatedReport,
            reportDate: new Date().toISOString(),
          };

          return {
            text: JSON.stringify(mergedReport),
            usage: {
              promptTokens: 0, // Gemini doesn't provide token counts
              completionTokens: 0,
              totalTokens: 0,
            },
          };
        } catch (e) {
          console.error("JSON parsing error:", e);
          throw new AIServiceError(
            `Invalid JSON response: ${
              e instanceof Error ? e.message : "Unknown error"
            }`,
            this.name
          );
        }
      } else {
        return {
          text: content,
          usage: {
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
          },
        };
      }
    } catch (error) {
      this.handleServiceError(error, "generate text with Gemini");
    }
  }
}
