import { GenerateTextOptions } from './types/prompts';

export interface AIModelConfig {
  apiKey?: string;
  baseUrl?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIService {
  generateText(
    prompt: string,
    options?: GenerateTextOptions
  ): Promise<AIResponse>;
  name: string;
}

export interface AIServiceFactory {
  createService(config: AIModelConfig): AIService;
}

export class AIServiceError extends Error {
  constructor(
    message: string,
    public readonly serviceName: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = "AIServiceError";
  }
}
