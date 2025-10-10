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

### Requirement: Response Extraction
The system SHALL extract edited code from Vercel AI SDK response for replacement.

#### Scenario: Valid response content
- **WHEN** LLM returns completion via Vercel AI SDK
- **THEN** `result.text` is extracted as edited code

#### Scenario: Malformed response
- **WHEN** Vercel AI SDK response is missing expected fields
- **THEN** error is returned to Lua with details for debugging



## ADDED Requirements

### Requirement: Output Token Limits
The system SHALL enforce configurable maximum output token limits per provider to optimize response generation.

#### Scenario: Default token limits per provider
- **WHEN** user does not specify custom token limits
- **THEN** OpenAI uses 4096 max output tokens, Anthropic uses 4096, xAI uses 4096, GLM uses 4096

#### Scenario: Custom token limit configuration
- **WHEN** user sets `llm.max_output_tokens` in configuration
- **THEN** requests use specified token limit via Vercel AI SDK `maxTokens` parameter

#### Scenario: Token limit prevents over-generation
- **WHEN** LLM reaches max output tokens during generation
- **THEN** generation stops gracefully and complete response is returned

