## Why

The current implementation makes two sequential LLM API calls for every edit operation:
1. `enhanceInstruction()` - expands brief user input into detailed sentence
2. `applyEdit()` - uses enhanced instruction to modify code

This doubles latency (~3-5s total), doubles token costs, and adds unnecessary complexity. Modern LLMs (GPT-4o, Claude 3.5 Sonnet, Grok) handle brief instructions with code context exceptionally well, making the enhancement step redundant overhead.

Additionally, users receive no feedback during processing, making even fast responses feel slow.

## What Changes

- **Remove instruction enhancement step** - eliminate `enhanceInstruction()` method and all related code
- **Add streaming support** - implement `streamText()` to provide progressive feedback to users
- **Optimize token limits** - add `maxOutputTokens` configuration for all providers
- **Improve system prompts** - enhance prompts to handle brief instructions directly

## Impact

- **Performance**: 50% latency reduction (1 LLM call instead of 2), ~1.5-2.5s vs 3-5s
- **Cost**: 50% token usage reduction
- **UX**: Immediate visual feedback with streaming (<500ms to first chunk)
- **Breaking**: Removes `enhanceInstruction()` from LLMProvider interface (internal API)
- **User-facing**: No configuration changes required, seamless upgrade

### Affected Specs
- `ai-llm-integration` - core LLM communication requirements

### Affected Code
- `ts/src/llm.ts` - remove enhancement methods, add streaming, optimize tokens
- `ts/src/index.ts` - update JSON-RPC protocol for streaming
- `ts/src/__tests__/llm.test.ts` - remove enhancement tests
- `lua/nvim-redraft/ipc.lua` - handle streaming responses
- `README.md` - update performance claims
