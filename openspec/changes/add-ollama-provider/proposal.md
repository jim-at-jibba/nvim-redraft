## Why
Users want to run LLM models locally using Ollama for privacy, cost savings, and offline usage.

## What Changes
- Add Ollama as a supported LLM provider using the `ollama-ai-provider-v2` community package
- Support user configuration of Ollama model and base URL
- Follow existing provider pattern with BaseLLMProvider architecture
- Default base URL to Ollama's standard `http://localhost:11434/api`

## Impact
- Affected specs: ai-llm-integration, user-configuration
- Affected code: ts/src/llm.ts (new OllamaProvider class), ts/package.json (new dependency)
- No breaking changes
