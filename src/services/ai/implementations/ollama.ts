import { AIModelConfig, AIResponse, AIServiceError } from "../types";
import { BaseAIService } from "./base";
import {
  SystemPromptType,
  GenerateTextOptions,
  CTOSReportSystemPrompt,
  ChatSystemPrompt,
} from "../types/prompts";

export class OllamaService extends BaseAIService {
  name = "ollama";
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second
  private requestTimeout = 600000; // 60 seconds

  constructor(config: AIModelConfig) {
    super(config);
    if (!config.baseUrl?.trim()) {
      throw new AIServiceError("Ollama base URL is required", this.name);
    }
    if (!config.model?.trim()) {
      throw new AIServiceError("Model name is required", this.name);
    }
  }

  protected getSystemPrompt(type: SystemPromptType = "Chat"): string {
    switch (type) {
      case "CTOSReport":
        return CTOSReportSystemPrompt;
      case "Chat":
        return ChatSystemPrompt;
      default:
        return ChatSystemPrompt;
    }
  }

  private async retryWithBackoff(
    fn: () => Promise<Response>,
    attempt = 1,
    controller: AbortController
  ): Promise<Response> {
    try {
      const timeoutId = setTimeout(() => {
        if (!controller.signal.aborted) {
          controller.abort();
        }
      }, this.requestTimeout);

      try {
        const response = await fn();
        clearTimeout(timeoutId);

        if (!response.ok && attempt < this.maxRetries) {
          console.log(`Retry attempt ${attempt} for Ollama request`);
          const delay = this.retryDelay * Math.pow(2, attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.retryWithBackoff(fn, attempt + 1, controller);
        }
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      if (controller.signal.aborted) {
        throw new Error("Request timed out");
      }
      console.error(`Ollama request error (attempt ${attempt}):`, error);
      if (attempt < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.retryWithBackoff(fn, attempt + 1, controller);
      }
      throw new AIServiceError(
        `Request failed after ${this.maxRetries} attempts: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        this.name
      );
    }
  }

  protected cleanJsonResponse(content: string): string {
    if (!content) return "{}";

    try {
      // Remove markdown code blocks if present
      content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "");

      // Check if we have multiple JSON objects
      if (content.trim().startsWith("{") && content.includes("}, {")) {
        // Wrap multiple objects in an array
        content = "[" + content + "]";
      }

      // Remove any text before the first { or [
      let startIndex = Math.min(
        content.indexOf("{") === -1 ? Infinity : content.indexOf("{"),
        content.indexOf("[") === -1 ? Infinity : content.indexOf("[")
      );
      if (startIndex === Infinity) return "{}";
      content = content.slice(startIndex);

      // Remove any text after the last } or ]
      let lastBrace = content.lastIndexOf("}");
      let lastBracket = content.lastIndexOf("]");
      let lastIndex = Math.max(lastBrace, lastBracket);
      if (lastIndex === -1) return "{}";
      content = content.slice(0, lastIndex + 1);

      // Replace any invalid JSON that might cause parsing errors
      content = content
        .replace(/\n/g, " ")
        .replace(/\r/g, " ")
        .replace(/\t/g, " ")
        .replace(/\s+/g, " ")
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\")
        .replace(/\.{3}/g, ""); // Remove ellipsis

      // Try to fix truncated arrays
      if (content.includes("... ]")) {
        content = content.replace(/,\s*\.\.\.\s*\]/g, "]");
      }
      if (content.includes("... }")) {
        content = content.replace(/,\s*\.\.\.\s*\}/g, "}");
      }

      // Validate JSON structure
      let openBraces = (content.match(/{/g) || []).length;
      let closeBraces = (content.match(/}/g) || []).length;
      let openBrackets = (content.match(/\[/g) || []).length;
      let closeBrackets = (content.match(/\]/g) || []).length;

      if (openBraces !== closeBraces || openBrackets !== closeBrackets) {
        console.warn(
          "Unbalanced JSON structure detected, attempting to fix..."
        );

        // Add missing closing braces/brackets
        while (openBraces > closeBraces) {
          content += "}";
          closeBraces++;
        }
        while (openBrackets > closeBrackets) {
          content += "]";
          closeBrackets++;
        }
      }

      // Handle trailing commas
      content = content.replace(/,\s*([}\]])/g, "$1");

      // Try to parse the JSON to validate it
      const parsed = JSON.parse(content);
      
      // If we got a valid array or object, return it
      if (Array.isArray(parsed) || typeof parsed === "object") {
        return JSON.stringify(parsed);
      }
      
      return "{}";
    } catch (e) {
      console.error("Error cleaning JSON:", e, "Original content:", content);
      // If parsing failed, try wrapping in array as last resort
      try {
        if (content.trim().startsWith("{")) {
          const wrapped = "[" + content + "]";
          JSON.parse(wrapped); // Validate it parses
          return wrapped;
        }
      } catch {
        // If all else fails, return empty object
        return "{}";
      }
      return "{}";
    }
  }

  async generateText(
    prompt: string,
    options?: GenerateTextOptions
  ): Promise<AIResponse> {
    const controller = new AbortController();

    try {
      const systemPrompt = this.getSystemPrompt(options?.systemPromptType);
      const response = await this.retryWithBackoff(
        () =>
          fetch(`${this._config.baseUrl}/api/chat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: this._config.model,
              messages: [
                {
                  role: "system",
                  content: systemPrompt,
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
              stream: false,
              options: {
                temperature: options?.temperature ?? 0.7,
                top_p: options?.topP ?? 0.9,
                max_tokens: options?.maxTokens,
              },
            }),
            signal: controller.signal,
          }),
        1,
        controller
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Ollama API error response:", errorText);
        throw new AIServiceError(
          `Ollama API error: ${response.status} ${response.statusText} - ${errorText}`,
          this.name
        );
      }

      const data = await response.json();
      console.log("Raw Ollama API response:", JSON.stringify(data, null, 2));

      // Handle both chat completion and regular completion formats
      let content = '';
      if (data.message?.content) {
        content = data.message.content;
      } else if (data.response) {
        content = data.response;
      } else {
        console.error("Invalid response structure from Ollama:", data);
        throw new AIServiceError("Invalid response format from Ollama API", this.name);
      }

      if (options?.systemPromptType === "CTOSReport") {
        try {
          // Clean and parse the JSON response for CTOS Report
          content = this.cleanJsonResponse(content);
          console.log("Cleaned CTOS report content:", content);
          const parsedJson = JSON.parse(content);
          return {
            text: JSON.stringify(parsedJson),
            usage: {
              promptTokens: data.prompt_tokens || 0,
              completionTokens: data.completion_tokens || 0,
              totalTokens: (data.prompt_tokens || 0) + (data.completion_tokens || 0),
            },
          };
        } catch (e) {
          console.error("JSON parsing error:", e, "Content:", content);
          throw new AIServiceError(
            `Invalid JSON response: ${
              e instanceof Error ? e.message : "Unknown error"
            }`,
            this.name
          );
        }
      } else {
        // For Chat responses, return the text directly without cleaning
        console.log("Chat response content:", content);
        return {
          text: content,
          usage: {
            promptTokens: data.prompt_tokens || 0,
            completionTokens: data.completion_tokens || 0,
            totalTokens: (data.prompt_tokens || 0) + (data.completion_tokens || 0),
          },
        };
      }
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }
      throw new AIServiceError(
        `Failed to generate text: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        this.name
      );
    }
  }
}
