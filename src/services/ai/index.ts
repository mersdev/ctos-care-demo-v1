export * from "./types";
export * from "./implementations/gemini";
export * from "./implementations/groq";
export * from "./implementations/ollama";

import {
  AIService,
  AIServiceFactory,
  AIModelConfig,
  AIServiceError,
} from "./types";
import { GeminiService } from "./implementations/gemini";
import { GroqService } from "./implementations/groq";
import { OllamaService } from "./implementations/ollama";

// Model configurations
const MODEL_CONFIGS = {
  OLLAMA: {
    name: "llama3",
    requiresBaseUrl: true,
  },
  GROQ: {
    name: "llama3-8b-8192",
    requiresApiKey: true,
  },
  GEMINI: {
    name: "gemini-1.5-flash",
    requiresApiKey: true,
  },
} as const;

class AIServiceFactoryImpl implements AIServiceFactory {
  private validateConfig(
    config: AIModelConfig,
    requirements: { requiresApiKey?: boolean; requiresBaseUrl?: boolean }
  ) {
    if (!config.model) {
      throw new AIServiceError("Model name is required", "AIServiceFactory");
    }

    if (requirements.requiresApiKey && !config.apiKey?.trim()) {
      throw new AIServiceError(
        `API key is required for model ${config.model}`,
        "AIServiceFactory"
      );
    }

    if (requirements.requiresBaseUrl && !config.baseUrl?.trim()) {
      throw new AIServiceError(
        `Base URL is required for model ${config.model}`,
        "AIServiceFactory"
      );
    }
  }

  createService(config: AIModelConfig): AIService {
    try {
      switch (config.model) {
        case MODEL_CONFIGS.GROQ.name:
          this.validateConfig(config, MODEL_CONFIGS.GROQ);
          return new GroqService(config);

        case MODEL_CONFIGS.GEMINI.name:
          this.validateConfig(config, MODEL_CONFIGS.GEMINI);
          return new GeminiService(config);

        case MODEL_CONFIGS.OLLAMA.name:
          this.validateConfig(config, MODEL_CONFIGS.OLLAMA);
          return new OllamaService(config);

        default:
          throw new AIServiceError(
            `Unsupported model: ${config.model}`,
            "AIServiceFactory"
          );
      }
    } catch (error) {
      if (error instanceof AIServiceError) throw error;
      throw new AIServiceError(
        `Failed to create AI service: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "AIServiceFactory"
      );
    }
  }
}

// Export singleton instance
export const aiServiceFactory = new AIServiceFactoryImpl();
