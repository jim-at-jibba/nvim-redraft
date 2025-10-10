## Why

Optimize LLM performance by removing redundant instruction enhancement step and adding configurable token limits.

## What Changes

- Remove instruction enhancement preprocessing (eliminates second LLM call)
- Add configurable `max_output_tokens` setting with 4096 default for all providers
- Simplify to single-pass request/response pattern

## Impact

- **Performance**: Reduces latency (1 LLM call instead of 2)
- **Cost**: Reduces token usage
- **Configuration**: Adds `llm.max_output_tokens` option
- **User-facing**: No breaking changes to user configuration

### Affected Specs
- `ai-llm-integration` - core LLM communication requirements

### Affected Code
- `ts/src/llm.ts` - remove enhancement methods, add token limits
- `ts/src/__tests__/llm.test.ts` - remove enhancement tests
- `README.md` - document max_output_tokens configuration

