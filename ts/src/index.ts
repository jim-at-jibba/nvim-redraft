import * as readline from "readline";
import { LLMService, createProvider, getApiKey, getDefaultModel } from "./llm";
import { logger } from "./logger";

interface JSONRPCRequest {
  id: number;
  method: string;
  params: {
    code: string;
    instruction: string;
    systemPrompt?: string;
    provider?: string;
    model?: string;
    baseURL?: string;
  };
}

interface JSONRPCResponse {
  id: number;
  result?: string;
  error?: string;
}

class JSONRPCServer {
  private rl: readline.Interface;

  constructor() {
    logger.info("server", "JSON-RPC server starting");
    logger.debug("server", `Node version: ${process.version}`);
    logger.debug("server", `Debug mode: ${process.env.NVIM_REDRAFT_DEBUG}`);
    logger.debug("server", `Log file: ${process.env.NVIM_REDRAFT_LOG_FILE}`);

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });
  }

  private logError(message: string): void {
    console.error(`[nvim-redraft] ${message}`);
  }

  private sendResponse(response: JSONRPCResponse): void {
    console.log(JSON.stringify(response));
  }

  private async handleRequest(request: JSONRPCRequest): Promise<void> {
    logger.debug("server", `Handling request #${request.id}, method: ${request.method}`);
    logger.debug("server", `Request instruction: ${request.params.instruction}`);
    logger.debug("server", "Request code:", request.params.code);

    if (request.method !== "edit") {
      const error = `Unknown method: ${request.method}`;
      logger.error("server", `Request #${request.id} failed: ${error}`);
      this.sendResponse({
        id: request.id,
        error,
      });
      return;
    }

    try {
      const providerName = request.params.provider || "openai";
      const modelName = request.params.model || getDefaultModel(providerName);

      logger.debug("server", `Using provider: ${providerName}, model: ${modelName}`);

      const apiKey = getApiKey(providerName);
      if (!apiKey) {
        const keyName =
          providerName === "openai"
            ? "OPENAI_API_KEY"
            : providerName === "anthropic"
              ? "ANTHROPIC_API_KEY"
              : "XAI_API_KEY";
        const error = `${keyName} environment variable is not set. Please set it and restart Neovim.`;
        logger.error("server", `Request #${request.id} failed: ${error}`);
        this.sendResponse({
          id: request.id,
          error,
        });
        return;
      }

      const provider = createProvider(providerName, apiKey, modelName);
      const llmService = new LLMService(provider);

      const result = await llmService.edit({
        code: request.params.code,
        instruction: request.params.instruction,
        systemPrompt: request.params.systemPrompt,
      });

      logger.debug("server", `Request #${request.id} completed successfully`);
      this.sendResponse({
        id: request.id,
        result,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("server", `Request #${request.id} failed: ${errorMessage}`);
      this.logError(`Edit request failed: ${errorMessage}`);
      this.sendResponse({
        id: request.id,
        error: `Edit failed: ${errorMessage}`,
      });
    }
  }

  start(): void {
    logger.info("server", "JSON-RPC server ready, listening for requests");

    this.rl.on("line", async (line) => {
      try {
        const request = JSON.parse(line) as JSONRPCRequest;
        await this.handleRequest(request);
      } catch (error) {
        const errorMsg = `Failed to parse request: ${error}`;
        logger.error("server", errorMsg);
        this.logError(errorMsg);
      }
    });

    this.rl.on("close", () => {
      logger.info("server", "JSON-RPC server shutting down");
      process.exit(0);
    });
  }
}

const server = new JSONRPCServer();
server.start();
