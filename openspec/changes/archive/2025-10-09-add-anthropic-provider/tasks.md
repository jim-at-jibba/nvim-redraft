## 1. TypeScript Implementation
- [x] 1.1 Add `@anthropic-ai/sdk` dependency to `ts/package.json`
- [x] 1.2 Create `LLMProvider` interface in `ts/src/llm.ts` with `enhanceInstruction` and `applyEdit` methods
- [x] 1.3 Create provider registries: `PROVIDERS`, `PROVIDER_API_KEYS`, and `DEFAULT_MODELS`
- [x] 1.4 Implement `OpenAIProvider` class (refactor existing code into provider pattern)
- [x] 1.5 Implement `AnthropicProvider` class with same interface
- [x] 1.6 Add `createProvider()` factory function that looks up provider in registry
- [x] 1.7 Add `getApiKey()` helper function using `PROVIDER_API_KEYS` registry
- [x] 1.8 Add `getDefaultModel()` helper function using `DEFAULT_MODELS` registry
- [x] 1.9 Update `LLMService` to use provider interface and factory pattern

## 2. Configuration Updates
- [x] 2.1 Add `provider` field to `llm` config in `lua/nvim-redraft.lua` (default: "openai")
- [x] 2.2 Update config validation to ensure provider is either "openai" or "anthropic"
- [x] 2.3 Update default model based on provider ("gpt-4o-mini" for OpenAI, "claude-3-5-sonnet-20241022" for Anthropic)

## 3. Environment Variable Handling
- [x] 3.1 Use `getApiKey()` helper in `ts/src/index.ts` to retrieve correct API key based on provider
- [x] 3.2 Pass provider name and model to `createProvider()` factory
- [x] 3.3 Ensure clear error messages indicate which environment variable is required for selected provider

## 4. Documentation
- [x] 4.1 Update README.md with Anthropic setup instructions
- [x] 4.2 Add configuration examples for both providers
- [x] 4.3 Document default models for each provider
- [x] 4.4 Add inline code comments documenting the provider registry pattern for future extensibility
- [x] 4.5 Document how to add new providers (interface + registry entries) in code comments

## 5. Testing & Validation
- [x] 5.1 Test OpenAI provider with existing workflow (backward compatibility)
- [x] 5.2 Test Anthropic provider with sample edit
- [x] 5.3 Test error handling when API key is missing or incorrect
- [x] 5.4 Verify configuration validation works correctly
