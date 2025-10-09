# Refactor to Vercel AI SDK

## Why
The current implementation uses individual provider SDKs (OpenAI SDK, Anthropic SDK) which creates maintenance overhead and inconsistent interfaces across providers. The Vercel AI SDK provides a unified interface for multiple LLM providers, simplifying the codebase and making it easier to add new providers in the future.

## What Changes
- Replace OpenAI SDK and Anthropic SDK dependencies with Vercel AI SDK (`ai` package)
- Refactor `OpenAIProvider`, `AnthropicProvider`, and `GLMProvider` classes to use Vercel AI SDK's unified interface
- Update provider initialization to use Vercel AI SDK's provider-specific modules (`@ai-sdk/openai`, `@ai-sdk/anthropic`)
- Maintain all existing functionality without behavioral changes (instruction enhancement, code editing, markdown stripping, error handling)
- Remove GLM provider temporarily if Vercel AI SDK does not support it
- Update tests to work with new SDK while maintaining same test coverage
- Update package.json dependencies

## Impact
- **Affected specs**: `ai-llm-integration`
- **Affected code**: 
  - `ts/src/llm.ts` (complete refactor of provider implementations)
  - `ts/src/__tests__/llm.test.ts` (update to match new implementation)
  - `ts/package.json` (dependency changes)
- **No breaking changes**: All existing configuration, API keys, and functionality remain the same from the user's perspective
- **Future benefit**: Adding new providers will be significantly simpler using Vercel AI SDK's standardized interface
