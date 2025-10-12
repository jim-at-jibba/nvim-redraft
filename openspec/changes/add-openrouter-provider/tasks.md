# Implementation Tasks

## 1. Dependencies
- [x] 1.1 Add `@openrouter/ai-sdk-provider` package to `ts/package.json`
- [x] 1.2 Run `npm install` in `ts/` directory

## 2. Core Implementation
- [x] 2.1 Add `OPENROUTER_API_KEY` to `PROVIDER_API_KEYS` registry in `ts/src/llm.ts`
- [x] 2.2 Add "anthropic/claude-3.5-sonnet" default model to `DEFAULT_MODELS` registry
- [x] 2.3 Create `OpenRouterProvider` class extending `BaseLLMProvider`
- [x] 2.4 Add openrouter factory to `PROVIDERS` registry
- [x] 2.5 Update provider selection logic in `ts/src/index.ts` to include openrouter

## 3. Testing
- [x] 3.1 Add OpenRouter API key tests to `ts/src/__tests__/llm.test.ts`
- [x] 3.2 Add OpenRouter default model tests
- [x] 3.3 Add OpenRouter provider creation tests
- [x] 3.4 Add OpenRouter provider interface implementation tests
- [x] 3.5 Run test suite with `npm test`

## 4. Validation
- [x] 4.1 Build TypeScript service with `npm run build`
- [x] 4.2 Manually test OpenRouter provider with real API key
- [x] 4.3 Verify error message when `OPENROUTER_API_KEY` is missing
