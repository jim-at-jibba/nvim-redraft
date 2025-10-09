import OpenAI from "openai";

export interface EditRequest {
  code: string;
  instruction: string;
  systemPrompt?: string;
}

export class LLMService {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = "morph-v3-large") {
    this.client = new OpenAI({
      apiKey,
      baseURL: "https://api.morphllm.com/v1",
    });
    this.model = model;
  }

  async edit(request: EditRequest): Promise<string> {
    const { code, instruction, systemPrompt } = request;

    const prompt = `<instruction>${instruction}</instruction>\n<code>${code}</code>`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: "system",
          content: systemPrompt || "You are a code editing assistant. Apply the requested changes to the code and return only the modified code.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const result = response.choices[0]?.message?.content;
    if (!result) {
      throw new Error("No response from LLM");
    }

    return result;
  }
}
