# ai-llm-integration Delta

## ADDED Requirements

### Requirement: OpenRouter Provider Support
The system SHALL support OpenRouter as an LLM provider using the Vercel AI SDK OpenRouter community provider package.

#### Scenario: Successful API request with OpenRouter
- **WHEN** user instruction and code are sent to TypeScript service with OpenRouter provider configured
- **THEN** a request is made using Vercel AI SDK's `generateText()` function with the OpenRouter provider from `@openrouter/ai-sdk-provider`

#### Scenario: OpenRouter API key validation
- **WHEN** TypeScript service starts with OpenRouter provider and `OPENROUTER_API_KEY` environment variable is not set
- **THEN** an error is logged and first request fails with message directing user to set OPENROUTER_API_KEY

#### Scenario: OpenRouter default model
- **WHEN** user does not specify `llm.model` and provider is "openrouter"
- **THEN** requests use "anthropic/claude-3.5-sonnet" as default model via Vercel AI SDK

#### Scenario: OpenRouter custom model selection
- **WHEN** user specifies a valid OpenRouter model identifier (e.g., "meta-llama/llama-3.1-405b-instruct", "google/gemini-pro")
- **THEN** requests use the specified model through OpenRouter's unified API

#### Scenario: OpenRouter provider extends base class
- **WHEN** OpenRouterProvider class is implemented
- **THEN** it extends `BaseLLMProvider` and implements only the `createProviderInstance()` method (approximately 15-20 lines)

## MODIFIED Requirements

### Requirement: LLM Configuration
The system SHALL allow users to configure LLM provider, model, and timeout using Vercel AI SDK.

#### Scenario: Provider selection
- **WHEN** user sets `llm.provider` to "openai", "anthropic", "xai", or "openrouter" in configuration
- **THEN** the system uses the specified provider from Vercel AI SDK for all LLM requests

#### Scenario: Custom model name
- **WHEN** user sets `llm.model` in configuration
- **THEN** requests use the specified model through Vercel AI SDK

#### Scenario: Custom timeout
- **WHEN** user sets `llm.timeout` in configuration
- **THEN** requests timeout after specified milliseconds via Vercel AI SDK abort mechanism

#### Scenario: Default model per provider
- **WHEN** user does not specify `llm.model` and provider is "openai"
- **THEN** requests use "gpt-4o-mini" as default model via Vercel AI SDK

#### Scenario: Default model for Anthropic
- **WHEN** user does not specify `llm.model` and provider is "anthropic"
- **THEN** requests use "claude-3-5-sonnet-20241022" as default model via Vercel AI SDK

#### Scenario: Default model for GLM
- **WHEN** user does not specify `llm.model` and provider is "glm"
- **THEN** requests use "glm-4.5-airx" as default model via Vercel AI SDK

#### Scenario: Default model for xAI
- **WHEN** user does not specify `llm.model` and provider is "xai"
- **THEN** requests use "grok-4-fast-non-reasoning" as default model via Vercel AI SDK

#### Scenario: Default model for OpenRouter
- **WHEN** user does not specify `llm.model` and provider is "openrouter"
- **THEN** requests use "anthropic/claude-3.5-sonnet" as default model via Vercel AI SDK
