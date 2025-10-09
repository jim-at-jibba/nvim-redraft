import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
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
  enhanceInstruction(code: string, instruction: string): Promise<string>;
  applyEdit(
    code: string,
    instruction: string,
    systemPrompt?: string,
  ): Promise<string>;
}

class OpenAIProvider implements LLMProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async enhanceInstruction(code: string, instruction: string): Promise<string> {
    logger.debug(
      "enhance-instruction",
      `Enhancing instruction with ${this.model}`,
    );
    logger.debug("enhance-instruction", `Original: ${instruction}`);

    const startTime = Date.now();

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: "system",
          content:
            "You are a code editing assistant. Expand the user's brief instruction into a single, concise sentence in first person describing what changes to make. Be specific and direct. Example: 'I'm adding search functionality and keyboard navigation to the DataTable component.'",
        },
        {
          role: "user",
          content: `Instruction: ${instruction}\n\nCode:\n${code}\n\nExpand into one specific sentence:`,
        },
      ],
    });

    const elapsed = Date.now() - startTime;

    const result = response.choices[0]?.message?.content;
    if (!result) {
      logger.error(
        "enhance-instruction",
        "No response from instruction enhancement",
      );
      throw new Error("No response from instruction enhancement");
    }

    const enhanced = result.trim();

    logger.debug("enhance-instruction", `Enhanced: ${enhanced}`);
    logger.info("enhance-instruction", `Instruction enhanced in ${elapsed}ms`);

    if (response.usage) {
      logger.debug(
        "enhance-instruction",
        `Token usage - prompt: ${response.usage.prompt_tokens}, completion: ${response.usage.completion_tokens}, total: ${response.usage.total_tokens}`,
      );
    }

    return enhanced;
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

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: "system",
          content:
            systemPrompt ||
            "You are a code editing assistant. Apply the requested changes and return ONLY the modified code. Do not include explanations, markdown formatting, or any text before or after the code.",
        },
        {
          role: "user",
          content: `${instruction}\n\n${code}`,
        },
      ],
    });

    const elapsed = Date.now() - startTime;

    const result = response.choices[0]?.message?.content;
    if (!result) {
      logger.error("apply-edit", "No response from edit");
      throw new Error("No response from edit");
    }

    const stripped = this.stripMarkdown(result);

    logger.debug("apply-edit", "Edited code:", stripped);
    logger.info(
      "apply-edit",
      `Edit completed in ${elapsed}ms (${stripped.length} chars)`,
    );

    if (response.usage) {
      logger.debug(
        "apply-edit",
        `Token usage - prompt: ${response.usage.prompt_tokens}, completion: ${response.usage.completion_tokens}, total: ${response.usage.total_tokens}`,
      );
    }

    return stripped;
  }

  private stripMarkdown(text: string): string {
    const trimmed = text.trim();
    const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)\n```/;
    const match = trimmed.match(codeBlockRegex);
    return match ? match[1] : trimmed;
  }
}

class GLMProvider implements LLMProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: "https://api.z.ai/api/paas/v4/",
    });
    this.model = model;
  }

  async enhanceInstruction(code: string, instruction: string): Promise<string> {
    logger.debug(
      "enhance-instruction",
      `Enhancing instruction with ${this.model}`,
    );
    logger.debug("enhance-instruction", `Original: ${instruction}`);

    const startTime = Date.now();

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: "system",
          content:
            "You are a code editing assistant. Expand the user's brief instruction into a single, concise sentence in first person describing what changes to make. Be specific and direct. Example: 'I'm adding search functionality and keyboard navigation to the DataTable component.'",
        },
        {
          role: "user",
          content: `Instruction: ${instruction}\n\nCode:\n${code}\n\nExpand into one specific sentence:`,
        },
      ],
    });

    const elapsed = Date.now() - startTime;

    const result = response.choices[0]?.message?.content;
    if (!result) {
      logger.error(
        "enhance-instruction",
        "No response from instruction enhancement",
      );
      throw new Error("No response from instruction enhancement");
    }

    const enhanced = result.trim();

    logger.debug("enhance-instruction", `Enhanced: ${enhanced}`);
    logger.info("enhance-instruction", `Instruction enhanced in ${elapsed}ms`);

    if (response.usage) {
      logger.debug(
        "enhance-instruction",
        `Token usage - prompt: ${response.usage.prompt_tokens}, completion: ${response.usage.completion_tokens}, total: ${response.usage.total_tokens}`,
      );
    }

    return enhanced;
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

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: "system",
          content:
            systemPrompt ||
            "You are a code editing assistant. Apply the requested changes and return ONLY the modified code. Do not include explanations, markdown formatting, or any text before or after the code.",
        },
        {
          role: "user",
          content: `${instruction}\n\n${code}`,
        },
      ],
    });

    const elapsed = Date.now() - startTime;

    const result = response.choices[0]?.message?.content;
    if (!result) {
      logger.error("apply-edit", "No response from edit");
      throw new Error("No response from edit");
    }

    const stripped = this.stripMarkdown(result);

    logger.debug("apply-edit", "Edited code:", stripped);
    logger.info(
      "apply-edit",
      `Edit completed in ${elapsed}ms (${stripped.length} chars)`,
    );

    if (response.usage) {
      logger.debug(
        "apply-edit",
        `Token usage - prompt: ${response.usage.prompt_tokens}, completion: ${response.usage.completion_tokens}, total: ${response.usage.total_tokens}`,
      );
    }

    return stripped;
  }

  private stripMarkdown(text: string): string {
    const trimmed = text.trim();
    const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)\n```/;
    const match = trimmed.match(codeBlockRegex);
    return match ? match[1] : trimmed;
  }
}

class AnthropicProvider implements LLMProvider {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async enhanceInstruction(code: string, instruction: string): Promise<string> {
    logger.debug(
      "enhance-instruction",
      `Enhancing instruction with ${this.model}`,
    );
    logger.debug("enhance-instruction", `Original: ${instruction}`);

    const startTime = Date.now();

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a code editing assistant. Expand the user's brief instruction into a single, concise sentence in first person describing what changes to make. Be specific and direct. Example: 'I'm adding search functionality and keyboard navigation to the DataTable component.'

Instruction: ${instruction}

Code:
${code}

Expand into one specific sentence:`,
        },
      ],
    });

    const elapsed = Date.now() - startTime;

    const result = response.content[0];
    if (!result || result.type !== "text") {
      logger.error(
        "enhance-instruction",
        "No response from instruction enhancement",
      );
      throw new Error("No response from instruction enhancement");
    }

    const enhanced = result.text.trim();

    logger.debug("enhance-instruction", `Enhanced: ${enhanced}`);
    logger.info("enhance-instruction", `Instruction enhanced in ${elapsed}ms`);

    if (response.usage) {
      logger.debug(
        "enhance-instruction",
        `Token usage - input: ${response.usage.input_tokens}, output: ${response.usage.output_tokens}`,
      );
    }

    return enhanced;
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

    const systemMessage =
      systemPrompt ||
      "You are a code editing assistant. Apply the requested changes and return ONLY the modified code. Do not include explanations, markdown formatting, or any text before or after the code.";

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: systemMessage,
      messages: [
        {
          role: "user",
          content: `${instruction}\n\n${code}`,
        },
      ],
    });

    const elapsed = Date.now() - startTime;

    const result = response.content[0];
    if (!result || result.type !== "text") {
      logger.error("apply-edit", "No response from edit");
      throw new Error("No response from edit");
    }

    const stripped = this.stripMarkdown(result.text);

    logger.debug("apply-edit", "Edited code:", stripped);
    logger.info(
      "apply-edit",
      `Edit completed in ${elapsed}ms (${stripped.length} chars)`,
    );

    if (response.usage) {
      logger.debug(
        "apply-edit",
        `Token usage - input: ${response.usage.input_tokens}, output: ${response.usage.output_tokens}`,
      );
    }

    return stripped;
  }

  private stripMarkdown(text: string): string {
    const trimmed = text.trim();
    const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)\n```/;
    const match = trimmed.match(codeBlockRegex);
    return match ? match[1] : trimmed;
  }
}

/**
 * Provider registry maps provider names to factory functions.
 * To add a new provider, add one line here after implementing the LLMProvider interface.
 */
const PROVIDERS: Record<
  string,
  (apiKey: string, model: string) => LLMProvider
> = {
  openai: (apiKey, model) => new OpenAIProvider(apiKey, model),
  anthropic: (apiKey, model) => new AnthropicProvider(apiKey, model),
  glm: (apiKey, model) => new GLMProvider(apiKey, model),
};

/**
 * Maps provider names to their required environment variable names.
 * To add a new provider, add one line here.
 */
export const PROVIDER_API_KEYS: Record<string, string> = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  glm: "GLM_API_KEY",
};

/**
 * Maps provider names to their default model names.
 * To add a new provider, add one line here.
 */
export const DEFAULT_MODELS: Record<string, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-3-5-sonnet-20241022",
  glm: "glm-4.5",
};

export function createProvider(
  provider: string,
  apiKey: string,
  model: string,
): LLMProvider {
  const factory = PROVIDERS[provider];
  if (!factory) {
    throw new Error(`Unknown provider: ${provider}`);
  }
  return factory(apiKey, model);
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
    logger.debug("llm", `Original instruction: ${instruction}`);

    try {
      const enhancedInstruction = await this.provider.enhanceInstruction(
        code,
        instruction,
      );

      const editedCode = await this.provider.applyEdit(
        code,
        enhancedInstruction,
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
