import { v4 as uuidv4 } from "uuid";
import { AIService } from "./ai/types";
import { ChatMessage } from "../types/chat";
import { CTOSReport } from "../types/ctos";
import { generateSystemChatPrompt, generateNoReportPrompt } from "./ai/prompts";
import { OPERATIONS_HOURS_MESSAGE } from "./constants";

export class ChatService {
  private static instance: ChatService | null = null;
  private aiService: AIService;
  private ctosReport: CTOSReport | null;

  private constructor(aiService: AIService, ctosReport: CTOSReport | null) {
    this.aiService = aiService;
    this.ctosReport = ctosReport;
  }

  public static getInstance(
    aiService: AIService,
    ctosReport: CTOSReport | null
  ): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService(aiService, ctosReport);
    }
    return ChatService.instance;
  }

  public async generateResponse(userInput: string): Promise<ChatMessage> {
    try {
      console.log("Generating response for user input:", userInput);
      
      if (!this.ctosReport) {
        console.log("No CTOS report available, returning prompt to generate report");
        return {
          id: uuidv4(),
          content: generateNoReportPrompt(),
          role: 'assistant' as const,
          timestamp: new Date(),
        };
      }

      console.log("CTOS report available, preparing data for AI");
      // Prepare report data for the AI
      const reportData = {
        personalInfo: this.ctosReport.personalInfo,
        score: this.ctosReport.score,
        bankingHistory: this.ctosReport.bankingHistory,
        snapshot: this.ctosReport.snapshot,
        directorships: this.ctosReport.directorships,
        legalCases: this.ctosReport.legalCases,
        litigationIndex: this.ctosReport.litigationIndex,
        tradeReferees: this.ctosReport.tradeReferees,
        analysis: this.ctosReport.analysis,
        reportDate: this.ctosReport.reportDate,
      };

      console.log("Generating chat prompt with report data and user input");
      const prompt = generateSystemChatPrompt(reportData, userInput);
      console.log("Generated prompt:", prompt);

      console.log("Calling AI service to generate response");
      const response = await this.aiService.generateText(prompt, {
        systemPromptType: "Chat",
        temperature: 0.7,
        maxTokens: 2000,
      });
      console.log("Received AI response:", response);

      const chatMessage: ChatMessage = {
        id: uuidv4(),
        content: response.text,
        role: 'assistant' as const,
        timestamp: new Date(),
      };
      console.log("Generated chat message:", chatMessage);

      return chatMessage;
    } catch (error) {
      console.error("Error generating chat response:", error);
      return {
        id: uuidv4(),
        content: OPERATIONS_HOURS_MESSAGE,
        role: 'assistant' as const,
        timestamp: new Date(),
      };
    }
  }
}
