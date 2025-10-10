## MODIFIED Requirements
### Requirement: MorphLLM API Integration
The system SHALL communicate with LLM providers using the Vercel AI SDK unified interface via TypeScript service, with shared implementation logic in a base provider class to eliminate code duplication.

#### Scenario: Successful API request with OpenAI
- **WHEN** user instruction and code are sent to TypeScript service with OpenAI provider configured
- **THEN** a request is made using Vercel AI SDK's `generateText()` function with the OpenAI provider from `@ai-sdk/openai`

#### Scenario: Successful API request with Anthropic
- **WHEN** user instruction and code are sent to TypeScript service with Anthropic provider configured
- **THEN** a request is made using Vercel AI SDK's `generateText()` function with the Anthropic provider from `@ai-sdk/anthropic`

#### Scenario: Successful API request with GLM
- **WHEN** user instruction and code are sent to TypeScript service with GLM provider configured
- **THEN** a request is made using Vercel AI SDK's `generateText()` function with the Zhipu provider from `zhipu-ai-provider`

#### Scenario: Successful API request with xAI
- **WHEN** user instruction and code are sent to TypeScript service with xAI provider configured
- **THEN** a request is made using Vercel AI SDK's `generateText()` function with the xAI provider from `@ai-sdk/xai`

#### Scenario: API key validation
- **WHEN** TypeScript service starts and required API key for configured provider is not set
- **THEN** an error is logged and first request fails with clear error message

#### Scenario: Base provider class eliminates duplication
- **WHEN** a new provider is added to the system
- **THEN** the provider implementation extends `BaseLLMProvider` and only implements provider-specific initialization logic (approximately 15-20 lines vs 150+ lines per provider)

#### Scenario: Shared logging and error handling
- **WHEN** any provider processes a request
- **THEN** logging, timing, error handling, and markdown stripping are handled by shared base class methods

### Requirement: LLM Configuration
The system SHALL allow users to configure LLM provider, model, and timeout using Vercel AI SDK.

#### Scenario: Provider selection
- **WHEN** user sets `llm.provider` to "openai", "anthropic", or "xai" in configuration
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
