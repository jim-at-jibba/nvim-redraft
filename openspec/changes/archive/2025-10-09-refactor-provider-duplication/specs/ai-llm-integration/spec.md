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

#### Scenario: API key validation
- **WHEN** TypeScript service starts and required API key for configured provider is not set
- **THEN** an error is logged and first request fails with clear error message

#### Scenario: Base provider class eliminates duplication
- **WHEN** a new provider is added to the system
- **THEN** the provider implementation extends `BaseLLMProvider` and only implements provider-specific initialization logic (approximately 15-20 lines vs 150+ lines per provider)

#### Scenario: Shared logging and error handling
- **WHEN** any provider processes a request
- **THEN** logging, timing, error handling, and markdown stripping are handled by shared base class methods
