import OpenAI from "openai";

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
      throw new Error("OPENAI_API_KEY environment variable is required for edit generation");
    }
    
    this.openaiClient = new OpenAI({
      apiKey: openaiKey,
    });
    
    this.model = model;
    this.editModel = "gpt-4o-mini";
  }

  async edit(request: EditRequest): Promise<string> {
    const { code, instruction, systemPrompt } = request;

    try {
      const sparseEdit = await this.generateSparseEdit(code, instruction, systemPrompt);
      
      const mergedCode = await this.applyEdit(code, instruction, sparseEdit);

      return mergedCode;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Edit failed: ${error.message}`);
      }
      throw new Error("Edit failed with unknown error");
    }
  }

  private async generateSparseEdit(code: string, instruction: string, systemPrompt?: string): Promise<string> {
    const response = await this.openaiClient.chat.completions.create({
      model: this.editModel,
      messages: [
        {
          role: "system",
          content: systemPrompt || "You are a code editing assistant. Generate sparse edits with // ... existing code ... markers.",
        },
        {
          role: "user",
          content: `Instruction: ${instruction}\n\nCode:\n${code}`,
        },
      ],
    });

    const result = response.choices[0]?.message?.content;
    if (!result) {
      throw new Error("No response from edit generation");
    }

    return this.stripMarkdown(result);
  }

  private async applyEdit(code: string, instruction: string, sparseEdit: string): Promise<string> {
    const response = await this.morphClient.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: "user",
          content: `<instruction>${instruction}</instruction>\n<code>${code}</code>\n<update>${sparseEdit}</update>`,
        },
      ],
    });

    const result = response.choices[0]?.message?.content;
    if (!result) {
      throw new Error("No response from Fast Apply");
    }

    return result.trim();
  }

  private stripMarkdown(text: string): string {
    const codeBlockRegex = /^```(?:\w+)?\n([\s\S]*?)\n```$/;
    const match = text.trim().match(codeBlockRegex);
    return match ? match[1] : text;
  }
}
