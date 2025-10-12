# Add OpenRouter Provider

## Why
Users want access to hundreds of AI models from multiple providers (Anthropic, Google, Meta, Mistral, etc.) through a single unified API with transparent pricing and no monthly commitments.

## What Changes
- Add OpenRouter as a new LLM provider option using the `@openrouter/ai-sdk-provider` package
- Extend provider configuration to support "openrouter" alongside existing "openai", "anthropic", and "xai" options
- Add `OPENROUTER_API_KEY` environment variable support
- Set default model to "anthropic/claude-3.5-sonnet" for OpenRouter provider

## Impact
- Affected specs: **ai-llm-integration** (new provider scenarios), **user-configuration** (validation updates)
- Affected code: `ts/src/llm.ts` (add OpenRouterProvider class), `ts/package.json` (add dependency), tests
- Users can now access 100+ models through OpenRouter's unified gateway with a single API key
