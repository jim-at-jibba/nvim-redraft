## Why

The three LLM provider classes (`OpenAIProvider`, `GLMProvider`, `AnthropicProvider`) contain ~85% duplicate code. Each class reimplements identical logging, error handling, result processing, and markdown stripping logic. This duplication creates maintenance burden and increases the risk of inconsistencies when updating shared behavior.

## What Changes

- Extract shared provider logic into abstract base class `BaseLLMProvider`
- Move common methods (`enhanceInstruction`, `applyEdit`, `stripMarkdown`, logging, timing) to base class
- Require subclasses to implement only `createProviderInstance()` and optionally override `getGenerateTextOptions()`
- Reduce code from ~450 lines to ~150 lines without changing external behavior

## Impact

- Affected specs: `ai-llm-integration`
- Affected code: `ts/src/llm.ts`
- No breaking changes - public API (`LLMProvider` interface, `createProvider()`, `LLMService`) remains unchanged
- All three providers (OpenAI, Anthropic, GLM) continue to work identically
