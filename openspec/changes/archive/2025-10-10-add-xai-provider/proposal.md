## Why
Add support for xAI's Grok models as an LLM provider option, enabling users to leverage xAI's API through the existing Vercel AI SDK integration.

## What Changes
- Add xAI provider using `@ai-sdk/xai` package
- Extend `BaseLLMProvider` with `XaiProvider` class following existing pattern
- Register xAI in provider registries with `XAI_API_KEY` environment variable
- Set `grok-4-fast-non-reasoning` as default model for xAI provider

## Impact
- Affected specs: `ai-llm-integration`
- Affected code: `ts/src/llm.ts`, `ts/package.json`, `ts/src/__tests__/llm.test.ts`, `ts/src/index.ts`, `README.md`
- No breaking changes - purely additive feature
