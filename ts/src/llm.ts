import OpenAI from "openai";
import { logger } from "./logger";

export interface EditRequest {
  code: string;
  instruction: string;
  systemPrompt?: string;
}

export class LLMService {
  private morphClient: OpenAI;
  private openaiClient: OpenAI;
  private model: string;
  private editModel: string;

  constructor(apiKey: string, model: string = "morph-v3-large") {
    this.morphClient = new OpenAI({
      apiKey,
      baseURL: "https://api.morphllm.com/v1",
    });

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      throw new Error(
        "OPENAI_API_KEY environment variable is required for edit generation",
      );
    }

    this.openaiClient = new OpenAI({
      apiKey: openaiKey,
    });

    this.model = model;
    this.editModel = "gpt-4o-mini";
  }

  async edit(request: EditRequest): Promise<string> {
    const { code, instruction, systemPrompt } = request;

    logger.debug("llm", "Starting two-step edit process");
    logger.debug("llm", `Original instruction: ${instruction}`);

    try {
      const enhancedInstruction = await this.enhanceInstruction(
        code,
        instruction,
      );

      const sparseEdit = await this.generateSparseEdit(
        code,
        enhancedInstruction,
        systemPrompt,
      );

      const mergedCode = await this.applyEdit(
        code,
        enhancedInstruction,
        sparseEdit,
      );

      logger.info("llm", "Two-step edit completed successfully");
      return mergedCode;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error("llm", `Edit failed: ${errorMsg}`);
      if (error instanceof Error) {
        throw new Error(`Edit failed: ${error.message}`);
      }
      throw new Error("Edit failed with unknown error");
    }
  }

  private async enhanceInstruction(
    code: string,
    instruction: string,
  ): Promise<string> {
    logger.debug(
      "enhance-instruction",
      `Enhancing instruction with ${this.editModel}`,
    );
    logger.debug("enhance-instruction", `Original: ${instruction}`);

    const startTime = Date.now();

    const response = await this.openaiClient.chat.completions.create({
      model: this.editModel,
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

  private async generateSparseEdit(
    code: string,
    instruction: string,
    systemPrompt?: string,
  ): Promise<string> {
    logger.debug(
      "generate-edit",
      `Calling ${this.editModel} for sparse edit generation`,
    );
    logger.debug("generate-edit", "Input code:", code);

    const startTime = Date.now();

    const response = await this.openaiClient.chat.completions.create({
      model: this.editModel,
      messages: [
        {
          role: "system",
          content:
            systemPrompt ||
            "You are a code editing assistant. Generate sparse edits with // ... existing code ... markers.",
        },
        {
          role: "user",
          content: `Instruction: ${instruction}\n\nCode:\n${code}`,
        },
      ],
    });

    const elapsed = Date.now() - startTime;

    const result = response.choices[0]?.message?.content;
    if (!result) {
      logger.error("generate-edit", "No response from edit generation");
      throw new Error("No response from edit generation");
    }

    const stripped = this.stripMarkdown(result);

    logger.debug("generate-edit", "Generated sparse edit:", stripped);
    logger.info(
      "generate-edit",
      `Sparse edit generated in ${elapsed}ms (${stripped.length} chars)`,
    );

    if (response.usage) {
      logger.debug(
        "generate-edit",
        `Token usage - prompt: ${response.usage.prompt_tokens}, completion: ${response.usage.completion_tokens}, total: ${response.usage.total_tokens}`,
      );
    }

    return stripped;
  }

  private async applyEdit(
    code: string,
    instruction: string,
    sparseEdit: string,
  ): Promise<string> {
    logger.debug(
      "fast-apply",
      `Calling MorphLLM ${this.model} for Fast Apply merge`,
    );
    logger.debug("fast-apply", "Original code:", code);
    logger.debug("fast-apply", "Sparse edit to apply:", sparseEdit);

    const startTime = Date.now();

    const response = await this.morphClient.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: "user",
          content: `<instruction>${instruction}</instruction>\n<code>${code}</code>\n<update>${sparseEdit}</update>`,
        },
      ],
    });

    const elapsed = Date.now() - startTime;

    const result = response.choices[0]?.message?.content;
    if (!result) {
      logger.error("fast-apply", "No response from Fast Apply");
      throw new Error("No response from Fast Apply");
    }

    const trimmed = result.trim();

    logger.debug("fast-apply", "Merged code result:", trimmed);
    logger.info(
      "fast-apply",
      `Fast Apply merge completed in ${elapsed}ms (${trimmed.length} chars)`,
    );

    if (response.usage) {
      logger.debug(
        "fast-apply",
        `Token usage - prompt: ${response.usage.prompt_tokens}, completion: ${response.usage.completion_tokens}, total: ${response.usage.total_tokens}`,
      );
    }

    return trimmed;
  }

  private stripMarkdown(text: string): string {
    const codeBlockRegex = /^```(?:\w+)?\n([\s\S]*?)\n```$/;
    const match = text.trim().match(codeBlockRegex);
    return match ? match[1] : text;
  }
}
