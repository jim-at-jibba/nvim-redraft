import OpenAI from "openai";
import { logger } from "./logger";

export interface EditRequest {
  code: string;
  instruction: string;
  systemPrompt?: string;
}

export class LLMService {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = "gpt-4o-mini") {
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is required");
    }

    this.client = new OpenAI({
      apiKey,
    });

    this.model = model;
  }

  async edit(request: EditRequest): Promise<string> {
    const { code, instruction, systemPrompt } = request;

    logger.debug("llm", "Starting edit process");
    logger.debug("llm", `Original instruction: ${instruction}`);

    try {
      const enhancedInstruction = await this.enhanceInstruction(
        code,
        instruction,
      );

      const editedCode = await this.applyEdit(
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

  private async enhanceInstruction(
    code: string,
    instruction: string,
  ): Promise<string> {
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

  private async applyEdit(
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
