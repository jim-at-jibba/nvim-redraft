import {
  createProvider,
  getApiKey,
  getDefaultModel,
  LLMService,
  PROVIDER_API_KEYS,
  DEFAULT_MODELS,
} from '../llm';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

jest.mock('fs');

describe('LLM Provider System', () => {
  describe('PROVIDER_API_KEYS', () => {
    it('should have all required provider keys', () => {
      expect(PROVIDER_API_KEYS.openai).toBe('OPENAI_API_KEY');
      expect(PROVIDER_API_KEYS.anthropic).toBe('ANTHROPIC_API_KEY');
      expect(PROVIDER_API_KEYS.xai).toBe('XAI_API_KEY');
      expect(PROVIDER_API_KEYS.openrouter).toBe('OPENROUTER_API_KEY');
      expect(PROVIDER_API_KEYS.copilot).toBe('COPILOT_TOKEN');
      expect(PROVIDER_API_KEYS.cerebras).toBe('CEREBRAS_API_KEY');
    });
  });

  describe('DEFAULT_MODELS', () => {
    it('should have default models for all providers', () => {
      expect(DEFAULT_MODELS.openai).toBe('gpt-4o-mini');
      expect(DEFAULT_MODELS.anthropic).toBe('claude-3-5-sonnet-20241022');
      expect(DEFAULT_MODELS.xai).toBe('grok-4-fast-non-reasoning');
      expect(DEFAULT_MODELS.openrouter).toBe('anthropic/claude-3.5-sonnet');
      expect(DEFAULT_MODELS.copilot).toBe('gpt-4o');
      expect(DEFAULT_MODELS.cerebras).toBe('qwen-3-235b-a22b-instruct-2507');
    });
  });

  describe('getApiKey', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should get OpenAI API key from environment', () => {
      process.env.OPENAI_API_KEY = 'test-openai-key';
      expect(getApiKey('openai')).toBe('test-openai-key');
    });

    it('should get Anthropic API key from environment', () => {
      process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
      expect(getApiKey('anthropic')).toBe('test-anthropic-key');
    });

    it('should get xAI API key from environment', () => {
      process.env.XAI_API_KEY = 'test-xai-key';
      expect(getApiKey('xai')).toBe('test-xai-key');
    });

    it('should get OpenRouter API key from environment', () => {
      process.env.OPENROUTER_API_KEY = 'test-openrouter-key';
      expect(getApiKey('openrouter')).toBe('test-openrouter-key');
    });

    it('should get Cerebras API key from environment', () => {
      process.env.CEREBRAS_API_KEY = 'test-cerebras-key';
      expect(getApiKey('cerebras')).toBe('test-cerebras-key');
    });

    it('should get Copilot token from environment', () => {
      process.env.COPILOT_TOKEN = 'test-copilot-token';
      expect(getApiKey('copilot')).toBe('');
    });

    it('should throw error for unknown provider', () => {
      expect(() => getApiKey('unknown')).toThrow('Unknown provider: unknown');
    });

    it('should throw error when API key is missing', () => {
      delete process.env.OPENAI_API_KEY;
      expect(() => getApiKey('openai')).toThrow('OPENAI_API_KEY environment variable is required');
    });
  });

  describe('getDefaultModel', () => {
    it('should return default model for known provider', () => {
      expect(getDefaultModel('openai')).toBe('gpt-4o-mini');
      expect(getDefaultModel('anthropic')).toBe('claude-3-5-sonnet-20241022');
      expect(getDefaultModel('xai')).toBe('grok-4-fast-non-reasoning');
      expect(getDefaultModel('openrouter')).toBe('anthropic/claude-3.5-sonnet');
      expect(getDefaultModel('copilot')).toBe('gpt-4o');
      expect(getDefaultModel('cerebras')).toBe('qwen-3-235b-a22b-instruct-2507');
    });

    it('should return empty string for unknown provider', () => {
      expect(getDefaultModel('unknown')).toBe('');
    });
  });

  describe('createProvider', () => {
    it('should create OpenAI provider', () => {
      const provider = createProvider('openai', 'test-key', 'gpt-4o-mini');
      expect(provider).toBeDefined();
      expect(provider.applyEdit).toBeDefined();
    });

    it('should create Anthropic provider', () => {
      const provider = createProvider('anthropic', 'test-key', 'claude-3-5-sonnet-20241022');
      expect(provider).toBeDefined();
      expect(provider.applyEdit).toBeDefined();
    });

    it('should create xAI provider', () => {
      const provider = createProvider('xai', 'test-key', 'grok-4-fast-non-reasoning');
      expect(provider).toBeDefined();
      expect(provider.applyEdit).toBeDefined();
    });

    it('should create OpenRouter provider', () => {
      const provider = createProvider('openrouter', 'test-key', 'anthropic/claude-3.5-sonnet');
      expect(provider).toBeDefined();
      expect(provider.applyEdit).toBeDefined();
    });

    it('should create Cerebras provider', () => {
      const provider = createProvider('cerebras', 'test-key', 'qwen-3-235b-a22b-instruct-2507');
      expect(provider).toBeDefined();
      expect(provider.applyEdit).toBeDefined();
    });

    it('should throw error for unknown provider', () => {
      expect(() => createProvider('unknown', 'test-key', 'model')).toThrow(
        'Unknown provider: unknown',
      );
    });
  });

  describe('LLMService', () => {
    it('should create service with provider', () => {
      const provider = createProvider('openai', 'test-key', 'gpt-4o-mini');
      const service = new LLMService(provider);
      expect(service).toBeDefined();
    });

    it('should have edit method', () => {
      const provider = createProvider('openai', 'test-key', 'gpt-4o-mini');
      const service = new LLMService(provider);
      expect(service.edit).toBeDefined();
      expect(typeof service.edit).toBe('function');
    });
  });
});

describe('Provider markdown stripping', () => {
  describe('OpenAI Provider', () => {
    let provider: any;

    beforeEach(() => {
      provider = createProvider('openai', 'test-key', 'gpt-4o-mini');
    });

    it('should strip markdown code blocks', () => {
      const input = '```javascript\nconst x = 1;\n```';
      const result = (provider as any).stripMarkdown(input);
      expect(result).toBe('const x = 1;');
    });

    it('should strip markdown with language specifier', () => {
      const input = '```typescript\ninterface Foo {}\n```';
      const result = (provider as any).stripMarkdown(input);
      expect(result).toBe('interface Foo {}');
    });

    it('should handle code without markdown', () => {
      const input = 'const x = 1;';
      const result = (provider as any).stripMarkdown(input);
      expect(result).toBe('const x = 1;');
    });

    it('should trim whitespace', () => {
      const input = '  \n  const x = 1;  \n  ';
      const result = (provider as any).stripMarkdown(input);
      expect(result).toBe('const x = 1;');
    });
  });

  describe('Anthropic Provider', () => {
    let provider: any;

    beforeEach(() => {
      provider = createProvider('anthropic', 'test-key', 'claude-3-5-sonnet-20241022');
    });

    it('should strip markdown code blocks', () => {
      const input = '```rust\nfn main() {}\n```';
      const result = (provider as any).stripMarkdown(input);
      expect(result).toBe('fn main() {}');
    });
  });
});

describe('Provider interfaces', () => {
  it('should implement LLMProvider interface - OpenAI', () => {
    const provider = createProvider('openai', 'test-key', 'gpt-4o-mini');
    expect(typeof provider.applyEdit).toBe('function');
  });

  it('should implement LLMProvider interface - Anthropic', () => {
    const provider = createProvider('anthropic', 'test-key', 'claude-3-5-sonnet-20241022');
    expect(typeof provider.applyEdit).toBe('function');
  });

  it('should implement LLMProvider interface - xAI', () => {
    const provider = createProvider('xai', 'test-key', 'grok-4-fast-non-reasoning');
    expect(typeof provider.applyEdit).toBe('function');
  });

  it('should implement LLMProvider interface - OpenRouter', () => {
    const provider = createProvider('openrouter', 'test-key', 'anthropic/claude-3.5-sonnet');
    expect(typeof provider.applyEdit).toBe('function');
  });

  it('should implement LLMProvider interface - Copilot', () => {
    const provider = createProvider('copilot', 'test-key', 'gpt-4o');
    expect(typeof provider.applyEdit).toBe('function');
  });

  it('should implement LLMProvider interface - Cerebras', () => {
    const provider = createProvider('cerebras', 'test-key', 'qwen-3-235b-a22b-instruct-2507');
    expect(typeof provider.applyEdit).toBe('function');
  });
});

describe('Copilot Provider', () => {
  const mockConfigPath = path.join(os.homedir(), '.config/github-copilot/apps.json');
  const mockFs = fs as jest.Mocked<typeof fs>;

  describe('Token extraction', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should extract token from valid config file', () => {
      const mockConfig = {
        'github.com': {
          oauth_token: 'ghu_test_token_123',
        },
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

      const provider = createProvider('copilot', 'dummy', 'gpt-4o');
      expect(provider).toBeDefined();
    });

    it('should throw error when config file does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      expect(() => {
        const provider = createProvider('copilot', 'dummy', 'gpt-4o');
        (provider as any).extractCopilotToken();
      }).toThrow('Copilot not authenticated');
    });

    it('should throw error when config file is invalid JSON', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('invalid json');

      expect(() => {
        const provider = createProvider('copilot', 'dummy', 'gpt-4o');
        (provider as any).extractCopilotToken();
      }).toThrow('Copilot config file is corrupted');
    });

    it('should throw error when oauth_token is missing', () => {
      const mockConfig = {
        'github.com': {},
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

      expect(() => {
        const provider = createProvider('copilot', 'dummy', 'gpt-4o');
        (provider as any).extractCopilotToken();
      }).toThrow('Copilot config missing authentication token');
    });
  });

  describe('Provider creation', () => {
    beforeEach(() => {
      const mockConfig = {
        'github.com': {
          oauth_token: 'ghu_test_token_123',
        },
      };
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));
    });

    it('should create Copilot provider with default model', () => {
      const provider = createProvider('copilot', 'test-key', 'gpt-4o');
      expect(provider).toBeDefined();
      expect(provider.applyEdit).toBeDefined();
    });

    it('should create Copilot provider with custom model', () => {
      const provider = createProvider('copilot', 'test-key', 'gpt-4-turbo');
      expect(provider).toBeDefined();
    });
  });
});
