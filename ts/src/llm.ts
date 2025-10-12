import { generateText, LanguageModel } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createXai } from "@ai-sdk/xai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { logger } from "./logger";

export interface EditRequest {
  code: string;
  instruction: string;
  systemPrompt?: string;
}

/**
 * LLMProvider interface defines the contract that all LLM providers must implement.
 *
 * To add a new provider:
 * 1. Implement this interface in a new class (e.g., GeminiProvider)
 * 2. Add the provider to the PROVIDERS registry
 * 3. Add the API key environment variable to PROVIDER_API_KEYS registry
 * 4. Add the default model to DEFAULT_MODELS registry
 */
export interface LLMProvider {
  applyEdit(
    code: string,
    instruction: string,
    systemPrompt?: string,
  ): Promise<string>;
}

abstract class BaseLLMProvider implements LLMProvider {
  protected model: string;
  protected apiKey: string;
  protected maxOutputTokens: number;

  constructor(apiKey: string, model: string, maxOutputTokens?: number) {
    this.apiKey = apiKey;
    this.model = model;
    this.maxOutputTokens = maxOutputTokens || 4096;
  }

  protected abstract createProviderInstance(): any;

  protected getGenerateTextOptions(
    method: "enhance" | "apply",
    systemPrompt?: string,
  ): Record<string, any> {
    return {};
  }

  protected stripMarkdown(text: string): string {
    const trimmed = text.trim();
    const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)\n```/;
    const match = trimmed.match(codeBlockRegex);
    return match ? match[1] : trimmed;
  }

  async applyEdit(
    code: string,
    instruction: string,
    systemPrompt?: string,
  ): Promise<string> {
    logger.debug("apply-edit", `Calling ${this.model} for edit`);
    logger.debug("apply-edit", "Input code:", code);
    logger.debug("apply-edit", "Instruction:", instruction);

    const startTime = Date.now();

    const provider = this.createProviderInstance();

    const defaultSystemPrompt =
      "You are a code editing assistant. Apply the user's requested changes to the code and return ONLY the modified code. Handle both brief instructions (e.g., 'add error handling') and detailed instructions equally well. Be precise and maintain code quality. Do not include explanations, markdown formatting, or any text before or after the code.";

    const options = this.getGenerateTextOptions("apply", systemPrompt);

    const result = await generateText({
      model: provider(this.model),
      ...options,
      messages: [
        {
          role: "system",
          content: systemPrompt || defaultSystemPrompt,
        },
        {
          role: "user",
          content: `${instruction}\n\n${code}`,
        },
      ],
    });

    const elapsed = Date.now() - startTime;

    if (!result.text) {
      logger.error("apply-edit", "No response from edit");
      throw new Error("No response from edit");
    }

    const stripped = this.stripMarkdown(result.text);

    logger.debug("apply-edit", "Edited code:", stripped);
    logger.info(
      "apply-edit",
      `Edit completed in ${elapsed}ms (${stripped.length} chars)`,
    );

    if (result.usage) {
      logger.debug(
        "apply-edit",
        `Token usage - input: ${result.usage.inputTokens}, output: ${result.usage.outputTokens}, total: ${result.usage.totalTokens}`,
      );
    }

    return stripped;
  }
}

class OpenAIProvider extends BaseLLMProvider {
  protected createProviderInstance() {
    return createOpenAI({ apiKey: this.apiKey });
  }

  protected getGenerateTextOptions(
    method: "enhance" | "apply",
    systemPrompt?: string,
  ): Record<string, any> {
    return {
      maxOutputTokens: this.maxOutputTokens,
    };
  }
}

class AnthropicProvider extends BaseLLMProvider {
  protected createProviderInstance() {
    return createAnthropic({ apiKey: this.apiKey });
  }

  protected getGenerateTextOptions(
    method: "enhance" | "apply",
    systemPrompt?: string,
  ): Record<string, any> {
    const options: Record<string, any> = {
      maxOutputTokens: this.maxOutputTokens,
    };

    const defaultSystemPrompt =
      "You are a code editing assistant. Apply the user's requested changes to the code and return ONLY the modified code. Handle both brief instructions (e.g., 'add error handling') and detailed instructions equally well. Be precise and maintain code quality. Do not include explanations, markdown formatting, or any text before or after the code.";
    options.system = systemPrompt || defaultSystemPrompt;

    return options;
  }

  async applyEdit(
    code: string,
    instruction: string,
    systemPrompt?: string,
  ): Promise<string> {
    logger.debug("apply-edit", `Calling ${this.model} for edit`);
    logger.debug("apply-edit", "Input code:", code);
    logger.debug("apply-edit", "Instruction:", instruction);

    const startTime = Date.now();

    const provider = this.createProviderInstance();

    const options = this.getGenerateTextOptions("apply", systemPrompt);

    const result = await generateText({
      model: provider(this.model),
      ...options,
      messages: [
        {
          role: "user",
          content: `${instruction}\n\n${code}`,
        },
      ],
    });

    const elapsed = Date.now() - startTime;

    if (!result.text) {
      logger.error("apply-edit", "No response from edit");
      throw new Error("No response from edit");
    }

    const stripped = this.stripMarkdown(result.text);

    logger.debug("apply-edit", "Edited code:", stripped);
    logger.info(
      "apply-edit",
      `Edit completed in ${elapsed}ms (${stripped.length} chars)`,
    );

    if (result.usage) {
      logger.debug(
        "apply-edit",
        `Token usage - input: ${result.usage.inputTokens}, output: ${result.usage.outputTokens}, total: ${result.usage.totalTokens}`,
      );
    }

    return stripped;
  }
}

class XaiProvider extends BaseLLMProvider {
  protected createProviderInstance() {
    return createXai({ apiKey: this.apiKey });
  }

  protected getGenerateTextOptions(
    method: "enhance" | "apply",
    systemPrompt?: string,
  ): Record<string, any> {
    return {
      maxOutputTokens: this.maxOutputTokens,
    };
  }
}

class OpenRouterProvider extends BaseLLMProvider {
  protected createProviderInstance() {
    return createOpenRouter({ apiKey: this.apiKey });
  }

  protected getGenerateTextOptions(
    method: "enhance" | "apply",
    systemPrompt?: string,
  ): Record<string, any> {
    return {
      maxOutputTokens: this.maxOutputTokens,
    };
  }
}

/**
 * Provider registry maps provider names to factory functions.
 * To add a new provider, add one line here after implementing the LLMProvider interface.
 */
const PROVIDERS: Record<
  string,
  (apiKey: string, model: string, baseURL?: string, maxOutputTokens?: number) => LLMProvider
> = {
  openai: (apiKey, model, baseURL, maxOutputTokens) => new OpenAIProvider(apiKey, model, maxOutputTokens),
  anthropic: (apiKey, model, baseURL, maxOutputTokens) => new AnthropicProvider(apiKey, model, maxOutputTokens),
  xai: (apiKey, model, baseURL, maxOutputTokens) => new XaiProvider(apiKey, model, maxOutputTokens),
  openrouter: (apiKey, model, baseURL, maxOutputTokens) => new OpenRouterProvider(apiKey, model, maxOutputTokens),
};

/**
 * Maps provider names to their required environment variable names.
 * To add a new provider, add one line here.
 */
export const PROVIDER_API_KEYS: Record<string, string> = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  xai: "XAI_API_KEY",
  openrouter: "OPENROUTER_API_KEY",
};

/**
 * Maps provider names to their default model names.
 * To add a new provider, add one line here.
 */
export const DEFAULT_MODELS: Record<string, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-3-5-sonnet-20241022",
  xai: "grok-4-fast-non-reasoning",
  openrouter: "anthropic/claude-3.5-sonnet",
};

export function createProvider(
  provider: string,
  apiKey: string,
  model: string,
  baseURL?: string,
  maxOutputTokens?: number,
): LLMProvider {
  const factory = PROVIDERS[provider];
  if (!factory) {
    throw new Error(`Unknown provider: ${provider}`);
  }
  return factory(apiKey, model, baseURL, maxOutputTokens);
}

export function getApiKey(provider: string): string {
  const envVar = PROVIDER_API_KEYS[provider];
  if (!envVar) {
    throw new Error(`Unknown provider: ${provider}`);
  }
  const apiKey = process.env[envVar];
  if (!apiKey) {
    throw new Error(
      `${envVar} environment variable is required for provider '${provider}'`,
    );
  }
  return apiKey;
}

export function getDefaultModel(provider: string): string {
  return DEFAULT_MODELS[provider] || "";
}

export class LLMService {
  private provider: LLMProvider;

  constructor(provider: LLMProvider) {
    this.provider = provider;
  }

  async edit(request: EditRequest): Promise<string> {
    const { code, instruction, systemPrompt } = request;

    logger.debug("llm", "Starting edit process");
    logger.debug("llm", `Instruction: ${instruction}`);

    try {
      const editedCode = await this.provider.applyEdit(
        code,
        instruction,
        systemPrompt,
      );

      logger.info("llm", "Edit completed successfully");
      return editedCode;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error("llm", `Edit failed: ${errorMsg}`);
      if (error instanceof Error) {
        throw new Error(`Edit failed: ${error.message}`);
      }
      throw new Error("Edit failed with unknown error");
    }
  }
}
