import { generateText, LanguageModel } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createXai } from "@ai-sdk/xai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { logger } from "./logger";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

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

abstract class OpenAICompatibleProvider extends BaseLLMProvider {
  protected abstract getEndpoint(): string;
  protected abstract getAuthHeaders(): Promise<Record<string, string>>;

  async applyEdit(
    code: string,
    instruction: string,
    systemPrompt?: string,
  ): Promise<string> {
    logger.debug("apply-edit", `Calling ${this.model} for edit`);
    logger.debug("apply-edit", "Input code:", code);
    logger.debug("apply-edit", "Instruction:", instruction);

    const startTime = Date.now();

    const defaultSystemPrompt =
      "You are a code editing assistant. Apply the user's requested changes to the code and return ONLY the modified code. Handle both brief instructions (e.g., 'add error handling') and detailed instructions equally well. Be precise and maintain code quality. Do not include explanations, markdown formatting, or any text before or after the code.";

    const messages = [
      {
        role: "system",
        content: systemPrompt || defaultSystemPrompt,
      },
      {
        role: "user",
        content: `${instruction}\n\n${code}`,
      },
    ];

    try {
      const authHeaders = await this.getAuthHeaders();
      const response = await fetch(this.getEndpoint(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: this.maxOutputTokens,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error(
          "apply-edit",
          `API request failed: ${response.status} ${response.statusText}`,
        );
        logger.error("apply-edit", `Response body: ${errorBody}`);
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`,
        );
      }

      const fullText = await this.parseSSEStream(response.body);
      const elapsed = Date.now() - startTime;

      if (!fullText) {
        logger.error("apply-edit", "No response from edit");
        throw new Error("No response from edit");
      }

      const stripped = this.stripMarkdown(fullText);

      logger.debug("apply-edit", "Edited code:", stripped);
      logger.info(
        "apply-edit",
        `Edit completed in ${elapsed}ms (${stripped.length} chars)`,
      );

      return stripped;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error("apply-edit", `Request failed: ${errorMsg}`);
      throw error;
    }
  }

  private async parseSSEStream(
    body: ReadableStream<Uint8Array> | null,
  ): Promise<string> {
    if (!body) {
      throw new Error("Response body is null");
    }

    const reader = body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullText += content;
              }
            } catch (e) {
              logger.debug("apply-edit", `Failed to parse SSE chunk: ${data}`);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return fullText;
  }

  protected createProviderInstance(): any {
    throw new Error(
      "OpenAICompatibleProvider does not use createProviderInstance",
    );
  }
}

class CopilotProvider extends OpenAICompatibleProvider {
  private cachedBearerToken: string | null = null;
  private tokenExpiresAt: number = 0;

  protected getEndpoint(): string {
    return "https://api.githubcopilot.com/chat/completions";
  }

  protected async getAuthHeaders(): Promise<Record<string, string>> {
    const bearerToken = await this.getBearerToken();
    return {
      Authorization: `Bearer ${bearerToken}`,
      "editor-version": "vscode/1.90.2",
    };
  }

  private async getBearerToken(): Promise<string> {
    if (this.cachedBearerToken && this.tokenExpiresAt > Date.now() / 1000) {
      return this.cachedBearerToken;
    }

    const oauthToken = this.extractCopilotToken();
    const bearerToken = await this.exchangeForBearerToken(oauthToken);
    return bearerToken;
  }

  private async exchangeForBearerToken(oauthToken: string): Promise<string> {
    try {
      const response = await fetch("https://api.github.com/copilot_internal/v2/token", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "accept": "*/*",
          "authorization": `token ${oauthToken}`,
          "editor-version": "vscode/1.90.2",
          "editor-plugin-version": "copilot-chat/0.17.2024062801",
          "user-agent": "GitHubCopilotChat/0.17.2024062801",
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Failed to exchange OAuth token for bearer token: ${response.status} ${response.statusText}\n${errorBody}`
        );
      }

      type CopilotTokenResponse = { token: string; expires_at: number };
      const data = (await response.json()) as CopilotTokenResponse;
      this.cachedBearerToken = data.token;
      this.tokenExpiresAt = data.expires_at;

      logger.debug(
        "copilot",
        `Successfully exchanged OAuth token for bearer token (expires at ${data.expires_at})`
      );

      return data.token;
    } catch (error) {
      logger.error(
        "copilot",
        `Failed to exchange OAuth token: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  public extractCopilotToken(): string {
    const configPath = path.join(
      os.homedir(),
      ".config/github-copilot/apps.json",
    );

    try {
      if (!fs.existsSync(configPath)) {
        throw new Error(
          "Copilot not authenticated. Install and authenticate copilot.lua first. " +
            `Expected config file at: ${configPath}`,
        );
      }

      const configContent = fs.readFileSync(configPath, "utf-8");
      const config = JSON.parse(configContent);

      const githubKey = Object.keys(config).find(key => key.startsWith("github.com"));
      if (!githubKey) {
        throw new Error(
          "Copilot config missing github.com entry. " +
            `Check that ${configPath} contains a 'github.com' key`,
        );
      }

      const token = config[githubKey]?.oauth_token;
      if (!token) {
        throw new Error(
          "Copilot config missing authentication token. " +
            `Check that ${configPath} contains 'oauth_token' under the github.com key`,
        );
      }

      logger.debug(
        "copilot",
        `Successfully extracted Copilot token from ${configPath}`,
      );
      return token;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(
          `Copilot config file is corrupted (invalid JSON): ${configPath}`,
        );
      }
      throw error;
    }
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
  copilot: (apiKey, model, baseURL, maxOutputTokens) => new CopilotProvider(apiKey, model, maxOutputTokens),
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
  copilot: "COPILOT_TOKEN",
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
  copilot: "gpt-4o",
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
  if (provider === "copilot") {
    return "";
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
