import * as readline from "readline";
import { LLMService } from "./llm";

interface JSONRPCRequest {
  id: number;
  method: string;
  params: {
    code: string;
    instruction: string;
    systemPrompt?: string;
  };
}

interface JSONRPCResponse {
  id: number;
  result?: string;
  error?: string;
}

class JSONRPCServer {
  private llmService: LLMService | null = null;
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    this.validateEnvironment();
  }

  private validateEnvironment(): void {
    const apiKey = process.env.MORPH_API_KEY;
    if (!apiKey) {
      this.logError("MORPH_API_KEY environment variable is not set");
      return;
    }

    this.llmService = new LLMService(apiKey);
    this.logError("LLM service initialized successfully");
  }

  private logError(message: string): void {
    console.error(`[nvim-redraft] ${message}`);
  }

  private sendResponse(response: JSONRPCResponse): void {
    console.log(JSON.stringify(response));
  }

  private async handleRequest(request: JSONRPCRequest): Promise<void> {
    if (!this.llmService) {
      this.sendResponse({
        id: request.id,
        error: "MORPH_API_KEY not set. Please set the environment variable and restart Neovim.",
      });
      return;
    }

    if (request.method !== "edit") {
      this.sendResponse({
        id: request.id,
        error: `Unknown method: ${request.method}`,
      });
      return;
    }

    try {
      const result = await this.llmService.edit({
        code: request.params.code,
        instruction: request.params.instruction,
        systemPrompt: request.params.systemPrompt,
      });

      this.sendResponse({
        id: request.id,
        result,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.sendResponse({
        id: request.id,
        error: `LLM request failed: ${errorMessage}`,
      });
    }
  }

  start(): void {
    this.rl.on("line", async (line) => {
      try {
        const request = JSON.parse(line) as JSONRPCRequest;
        await this.handleRequest(request);
      } catch (error) {
        this.logError(`Failed to parse request: ${error}`);
      }
    });

    this.rl.on("close", () => {
      process.exit(0);
    });
  }
}

const server = new JSONRPCServer();
server.start();
