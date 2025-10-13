# ai-llm-integration Specification Delta

## ADDED Requirements

### Requirement: GitHub Copilot Provider Support
The system SHALL support GitHub Copilot as an LLM provider using a custom OpenAI-compatible implementation that extracts authentication from copilot.lua config files.

#### Scenario: Successful API request with Copilot
- **WHEN** user instruction and code are sent to TypeScript service with Copilot provider configured
- **THEN** a request is made to `https://api.githubcopilot.com/chat/completions` using OAuth token extracted from `~/.config/github-copilot/apps.json`

#### Scenario: Copilot authentication token extraction
- **WHEN** CopilotProvider is initialized
- **THEN** OAuth token is read from `~/.config/github-copilot/apps.json` under the `github.com.oauth_token` path

#### Scenario: Copilot config file missing
- **WHEN** `~/.config/github-copilot/apps.json` does not exist
- **THEN** an error is logged with message "Copilot not authenticated. Install and authenticate copilot.lua first."

#### Scenario: Copilot config file invalid
- **WHEN** `~/.config/github-copilot/apps.json` exists but is not valid JSON or missing oauth_token
- **THEN** an error is logged with clear message about config file corruption or missing token

#### Scenario: Copilot default model
- **WHEN** user does not specify `llm.model` and provider is "copilot"
- **THEN** requests use "gpt-4o" as default model

#### Scenario: Copilot uses OpenAI-compatible format
- **WHEN** Copilot provider processes a request
- **THEN** messages are formatted in OpenAI chat completion format and response is parsed from SSE stream

### Requirement: OpenAI-Compatible Provider Pattern
The system SHALL provide a generic OpenAI-compatible provider base class that can be used for any provider supporting OpenAI's chat completions API format.

#### Scenario: OpenAI-compatible provider initialization
- **WHEN** a provider extends OpenAICompatibleProvider
- **THEN** provider only needs to implement getEndpoint() and getAuthHeaders() methods

#### Scenario: SSE streaming for OpenAI-compatible providers
- **WHEN** an OpenAI-compatible provider makes a request with streaming enabled
- **THEN** Server-Sent Events are parsed incrementally and content is streamed to the user

#### Scenario: OpenAI message format conversion
- **WHEN** an OpenAI-compatible provider processes a request
- **THEN** system prompt and user message are converted to OpenAI messages array format

#### Scenario: Shared base class functionality
- **WHEN** any OpenAI-compatible provider processes a request
- **THEN** logging, timing, error handling, and markdown stripping are handled by shared base class methods

#### Scenario: Error handling for OpenAI-compatible requests
- **WHEN** an OpenAI-compatible provider request fails
- **THEN** HTTP status, error message, and response body are logged with clear error context

### Requirement: Dual Provider Architecture
The system SHALL support both Vercel AI SDK providers and custom OpenAI-compatible providers simultaneously through a unified interface.

#### Scenario: Vercel AI SDK providers unchanged
- **WHEN** existing providers (OpenAI, Anthropic, xAI, OpenRouter) are used
- **THEN** they continue using Vercel AI SDK with no behavioral changes

#### Scenario: User-facing API consistency
- **WHEN** user configures any provider (Vercel AI SDK or OpenAI-compatible)
- **THEN** configuration syntax, commands, and behavior are identical

#### Scenario: Provider registry includes both types
- **WHEN** PROVIDERS registry is accessed
- **THEN** both Vercel AI SDK providers and OpenAI-compatible providers are available

## MODIFIED Requirements

### Requirement: MorphLLM API Integration
The system SHALL communicate with LLM providers using either the Vercel AI SDK unified interface or custom OpenAI-compatible implementation via TypeScript service, with shared implementation logic in a base provider class to eliminate code duplication.

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

#### Scenario: Successful API request with Copilot
- **WHEN** user instruction and code are sent to TypeScript service with Copilot provider configured
- **THEN** a request is made using custom OpenAI-compatible implementation to `https://api.githubcopilot.com/chat/completions`

#### Scenario: API key validation
- **WHEN** TypeScript service starts and required API key for configured provider is not set
- **THEN** an error is logged and first request fails with clear error message

#### Scenario: Base provider class eliminates duplication
- **WHEN** a new provider is added to the system
- **THEN** the provider implementation extends `BaseLLMProvider` and only implements provider-specific initialization logic (approximately 15-20 lines vs 150+ lines per provider)

#### Scenario: Shared logging and error handling
- **WHEN** any provider processes a request
- **THEN** logging, timing, error handling, and markdown stripping are handled by shared base class methods
