# Add Anthropic Provider

## Why
Users need the flexibility to choose between OpenAI and Anthropic as their LLM provider, with each provider supporting its own model selection. The implementation must use an extensible architecture that makes it straightforward to add additional providers in the future.

## What Changes
- Refactor existing OpenAI integration into a provider-based architecture
- Define a common `LLMProvider` interface for all providers
- Implement OpenAI and Anthropic as concrete providers implementing the interface
- Add provider selection configuration (`llm.provider` field)
- Add model selection per provider (`llm.model` field)
- Add provider factory/registry pattern for instantiating providers
- Update environment variable validation to check for appropriate API key based on selected provider
- Maintain backward compatibility with existing OpenAI-only configurations
- Document the provider interface to enable future provider additions

## Impact
- Affected specs: `ai-llm-integration`, `user-configuration`
- Affected code: `ts/src/llm.ts`, `ts/src/index.ts`, `lua/nvim-redraft.lua`
- New dependency: `@anthropic-ai/sdk` npm package
- New environment variable: `ANTHROPIC_API_KEY` (when using Anthropic provider)
- Breaking changes: None (defaults to OpenAI with existing behavior)
