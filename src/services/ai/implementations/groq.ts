import { AIModelConfig, AIResponse, AIServiceError } from "../types";
import { BaseAIService } from "./base";
import { Groq } from "groq-sdk";
import { CTOSReport } from "../../../types/ctos";
import {
  SystemPromptType,
  GenerateTextOptions,
  CTOSReportSystemPrompt,
  ChatSystemPrompt,
} from "../types/prompts";

export class GroqService extends BaseAIService {
  name = "groq";
  private client: Groq;

  constructor(config: AIModelConfig) {
    super(config);
    if (!config.apiKey?.trim()) {
      throw new AIServiceError("Groq API key is required", this.name);
    }
    this.client = new Groq({
      apiKey: config.apiKey.trim(),
      dangerouslyAllowBrowser: true
    });
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

  protected cleanJsonResponse(content: string): string {
    // Implement JSON response cleaning logic here
    return content;
  }

  async generateText(prompt: string, options?: GenerateTextOptions): Promise<AIResponse> {
    try {
      const completion = await this.client.chat.completions.create({
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt(options?.systemPromptType),
          },
          {
            role: "user",
            content: `${prompt}${
              options?.systemPromptType === "CTOSReport"
                ? "\n\nRespond with ONLY the JSON, no other text."
                : ""
            }`,
          },
        ],
        model: this._config.model,
        temperature: options?.temperature ?? 0.5,
        max_tokens: options?.maxTokens ?? 2000,
      });

      if (!completion.choices?.[0]?.message?.content) {
        throw new Error("Empty response from Groq");
      }

      let content = completion.choices[0].message.content;
      content = this.cleanJsonResponse(content);

      if (options?.systemPromptType === "CTOSReport") {
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
              promptTokens: completion.usage?.prompt_tokens || 0,
              completionTokens: completion.usage?.completion_tokens || 0,
              totalTokens: completion.usage?.total_tokens || 0,
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
            promptTokens: completion.usage?.prompt_tokens || 0,
            completionTokens: completion.usage?.completion_tokens || 0,
            totalTokens: completion.usage?.total_tokens || 0,
          },
        };
      }
    } catch (error) {
      this.handleServiceError(error, "generate text with Groq");
    }
  }
}
