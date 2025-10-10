## ADDED Requirements

### Requirement: Ollama Provider Support
The system SHALL support Ollama as an LLM provider using the community provider package.

#### Scenario: Successful API request with Ollama
- **WHEN** user instruction and code are sent to TypeScript service with Ollama provider configured
- **THEN** a request is made using Vercel AI SDK's `generateText()` function with the Ollama provider from `ollama-ai-provider-v2`

#### Scenario: Custom Ollama base URL
- **WHEN** user configures `llm.base_url` with Ollama provider
- **THEN** requests are sent to the configured base URL instead of default `http://localhost:11434/api`

#### Scenario: Default Ollama base URL
- **WHEN** user configures Ollama provider without specifying `llm.base_url`
- **THEN** requests are sent to default Ollama URL `http://localhost:11434/api`

#### Scenario: Default model for Ollama
- **WHEN** user does not specify `llm.model` and provider is "ollama"
- **THEN** requests use "llama3.2" as default model via Vercel AI SDK

#### Scenario: Custom Ollama model
- **WHEN** user sets `llm.model` to "phi3" with Ollama provider
- **THEN** requests use the specified model through Ollama provider

#### Scenario: Ollama without API key requirement
- **WHEN** Ollama provider is selected and no OLLAMA_API_KEY is set
- **THEN** requests proceed without API key validation (local Ollama doesn't require keys)

## MODIFIED Requirements

### Requirement: LLM Configuration
The system SHALL allow users to configure LLM provider, model, base URL, and timeout using Vercel AI SDK.

#### Scenario: Provider selection
- **WHEN** user sets `llm.provider` to "openai", "anthropic", "xai", or "ollama" in configuration
- **THEN** the system uses the specified provider from Vercel AI SDK for all LLM requests

#### Scenario: Custom model name
- **WHEN** user sets `llm.model` in configuration
- **THEN** requests use the specified model through Vercel AI SDK

#### Scenario: Custom timeout
- **WHEN** user sets `llm.timeout` in configuration
- **THEN** requests timeout after specified milliseconds via Vercel AI SDK abort mechanism

#### Scenario: Custom base URL
- **WHEN** user sets `llm.base_url` in configuration (for providers that support it like Ollama)
- **THEN** requests are sent to the configured base URL

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

#### Scenario: Default model for Ollama
- **WHEN** user does not specify `llm.model` and provider is "ollama"
- **THEN** requests use "llama3.2" as default model via Vercel AI SDK
