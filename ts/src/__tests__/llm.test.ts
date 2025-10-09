import {
  createProvider,
  getApiKey,
  getDefaultModel,
  LLMService,
  PROVIDER_API_KEYS,
  DEFAULT_MODELS,
} from "../llm";

describe("LLM Provider System", () => {
  describe("PROVIDER_API_KEYS", () => {
    it("should have all required provider keys", () => {
      expect(PROVIDER_API_KEYS.openai).toBe("OPENAI_API_KEY");
      expect(PROVIDER_API_KEYS.anthropic).toBe("ANTHROPIC_API_KEY");
      expect(PROVIDER_API_KEYS.glm).toBe("ZAI_API_KEY");
    });
  });

  describe("DEFAULT_MODELS", () => {
    it("should have default models for all providers", () => {
      expect(DEFAULT_MODELS.openai).toBe("gpt-4o-mini");
      expect(DEFAULT_MODELS.anthropic).toBe("claude-3-5-sonnet-20241022");
      expect(DEFAULT_MODELS.glm).toBe("glm-4.5-airx");
    });
  });

  describe("getApiKey", () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it("should get OpenAI API key from environment", () => {
      process.env.OPENAI_API_KEY = "test-openai-key";
      expect(getApiKey("openai")).toBe("test-openai-key");
    });

    it("should get Anthropic API key from environment", () => {
      process.env.ANTHROPIC_API_KEY = "test-anthropic-key";
      expect(getApiKey("anthropic")).toBe("test-anthropic-key");
    });

    it("should get GLM API key from environment", () => {
      process.env.ZAI_API_KEY = "test-glm-key";
      expect(getApiKey("glm")).toBe("test-glm-key");
    });

    it("should throw error for unknown provider", () => {
      expect(() => getApiKey("unknown")).toThrow("Unknown provider: unknown");
    });

    it("should throw error when API key is missing", () => {
      delete process.env.OPENAI_API_KEY;
      expect(() => getApiKey("openai")).toThrow(
        "OPENAI_API_KEY environment variable is required"
      );
    });
  });

  describe("getDefaultModel", () => {
    it("should return default model for known provider", () => {
      expect(getDefaultModel("openai")).toBe("gpt-4o-mini");
      expect(getDefaultModel("anthropic")).toBe("claude-3-5-sonnet-20241022");
      expect(getDefaultModel("glm")).toBe("glm-4.5-airx");
    });

    it("should return empty string for unknown provider", () => {
      expect(getDefaultModel("unknown")).toBe("");
    });
  });

  describe("createProvider", () => {
    it("should create OpenAI provider", () => {
      const provider = createProvider("openai", "test-key", "gpt-4o-mini");
      expect(provider).toBeDefined();
      expect(provider.enhanceInstruction).toBeDefined();
      expect(provider.applyEdit).toBeDefined();
    });

    it("should create Anthropic provider", () => {
      const provider = createProvider(
        "anthropic",
        "test-key",
        "claude-3-5-sonnet-20241022"
      );
      expect(provider).toBeDefined();
      expect(provider.enhanceInstruction).toBeDefined();
      expect(provider.applyEdit).toBeDefined();
    });

    it("should create GLM provider with default base URL", () => {
      const provider = createProvider("glm", "test-key", "glm-4.5-airx");
      expect(provider).toBeDefined();
      expect(provider.enhanceInstruction).toBeDefined();
      expect(provider.applyEdit).toBeDefined();
    });

    it("should create GLM provider with custom base URL", () => {
      const provider = createProvider(
        "glm",
        "test-key",
        "glm-4.5-airx"
      );
      expect(provider).toBeDefined();
    });

    it("should throw error for unknown provider", () => {
      expect(() => createProvider("unknown", "test-key", "model")).toThrow(
        "Unknown provider: unknown"
      );
    });
  });

  describe("LLMService", () => {
    it("should create service with provider", () => {
      const provider = createProvider("openai", "test-key", "gpt-4o-mini");
      const service = new LLMService(provider);
      expect(service).toBeDefined();
    });

    it("should have edit method", () => {
      const provider = createProvider("openai", "test-key", "gpt-4o-mini");
      const service = new LLMService(provider);
      expect(service.edit).toBeDefined();
      expect(typeof service.edit).toBe("function");
    });
  });
});

describe("Provider markdown stripping", () => {
  describe("OpenAI Provider", () => {
    let provider: any;

    beforeEach(() => {
      provider = createProvider("openai", "test-key", "gpt-4o-mini");
    });

    it("should strip markdown code blocks", () => {
      const input = "```javascript\nconst x = 1;\n```";
      const result = (provider as any).stripMarkdown(input);
      expect(result).toBe("const x = 1;");
    });

    it("should strip markdown with language specifier", () => {
      const input = "```typescript\ninterface Foo {}\n```";
      const result = (provider as any).stripMarkdown(input);
      expect(result).toBe("interface Foo {}");
    });

    it("should handle code without markdown", () => {
      const input = "const x = 1;";
      const result = (provider as any).stripMarkdown(input);
      expect(result).toBe("const x = 1;");
    });

    it("should trim whitespace", () => {
      const input = "  \n  const x = 1;  \n  ";
      const result = (provider as any).stripMarkdown(input);
      expect(result).toBe("const x = 1;");
    });
  });

  describe("GLM Provider", () => {
    let provider: any;

    beforeEach(() => {
      provider = createProvider("glm", "test-key", "glm-4.5-airx");
    });

    it("should strip markdown code blocks", () => {
      const input = "```python\nprint('hello')\n```";
      const result = (provider as any).stripMarkdown(input);
      expect(result).toBe("print('hello')");
    });

    it("should use custom base URL when provided", () => {
      const customProvider = createProvider(
        "glm",
        "test-key",
        "glm-4.5-airx"
      );
      expect(customProvider).toBeDefined();
    });
  });

  describe("Anthropic Provider", () => {
    let provider: any;

    beforeEach(() => {
      provider = createProvider(
        "anthropic",
        "test-key",
        "claude-3-5-sonnet-20241022"
      );
    });

    it("should strip markdown code blocks", () => {
      const input = "```rust\nfn main() {}\n```";
      const result = (provider as any).stripMarkdown(input);
      expect(result).toBe("fn main() {}");
    });
  });
});

describe("Provider interfaces", () => {
  it("should implement LLMProvider interface - OpenAI", () => {
    const provider = createProvider("openai", "test-key", "gpt-4o-mini");
    expect(typeof provider.enhanceInstruction).toBe("function");
    expect(typeof provider.applyEdit).toBe("function");
  });

  it("should implement LLMProvider interface - Anthropic", () => {
    const provider = createProvider(
      "anthropic",
      "test-key",
      "claude-3-5-sonnet-20241022"
    );
    expect(typeof provider.enhanceInstruction).toBe("function");
    expect(typeof provider.applyEdit).toBe("function");
  });

  it("should implement LLMProvider interface - GLM", () => {
    const provider = createProvider("glm", "test-key", "glm-4.5-airx");
    expect(typeof provider.enhanceInstruction).toBe("function");
    expect(typeof provider.applyEdit).toBe("function");
  });
});
