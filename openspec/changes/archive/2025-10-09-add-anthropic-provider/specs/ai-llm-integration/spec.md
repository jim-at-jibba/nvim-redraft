## ADDED Requirements

### Requirement: Multi-Provider Support
The system SHALL support both OpenAI and Anthropic as LLM providers with provider-specific API clients.

#### Scenario: OpenAI provider selected
- **WHEN** user configures `llm.provider = "openai"` and sets `OPENAI_API_KEY`
- **THEN** requests are sent to OpenAI API using the OpenAI SDK

#### Scenario: Anthropic provider selected
- **WHEN** user configures `llm.provider = "anthropic"` and sets `ANTHROPIC_API_KEY`
- **THEN** requests are sent to Anthropic API using the Anthropic SDK

#### Scenario: Provider defaults to OpenAI
- **WHEN** user does not specify `llm.provider` in configuration
- **THEN** the system uses OpenAI as the default provider

### Requirement: Provider-Specific API Key Validation
The system SHALL validate the correct API key is set based on the selected provider.

#### Scenario: OpenAI requires OPENAI_API_KEY
- **WHEN** provider is "openai" and `OPENAI_API_KEY` is not set
- **THEN** service fails to initialize with error message directing user to set OPENAI_API_KEY

#### Scenario: Anthropic requires ANTHROPIC_API_KEY
- **WHEN** provider is "anthropic" and `ANTHROPIC_API_KEY` is not set
- **THEN** service fails to initialize with error message directing user to set ANTHROPIC_API_KEY

#### Scenario: Wrong API key for provider
- **WHEN** provider is "anthropic" but only `OPENAI_API_KEY` is set
- **THEN** service fails to initialize with clear error indicating ANTHROPIC_API_KEY is required

### Requirement: Provider Abstraction Interface
The system SHALL implement a common interface for all LLM providers to enable consistent behavior and easy addition of future providers.

#### Scenario: Provider interface consistency
- **WHEN** any provider is used for edit operations
- **THEN** both `enhanceInstruction` and `applyEdit` methods are available with identical signatures

#### Scenario: Provider-specific implementation details
- **WHEN** requests are made through provider interface
- **THEN** provider-specific API client handles authentication, request format, and response parsing internally

#### Scenario: Adding new provider
- **WHEN** a developer wants to add a new provider (e.g., Google Gemini)
- **THEN** they implement the `LLMProvider` interface and add registry entries without modifying core service logic

### Requirement: Provider Registry Pattern
The system SHALL use registry-based configuration for provider-specific settings to enable extensible provider management.

#### Scenario: Provider factory registry
- **WHEN** system needs to instantiate a provider
- **THEN** it looks up the provider name in `PROVIDERS` registry and calls the factory function

#### Scenario: API key registry
- **WHEN** system needs to validate API keys
- **THEN** it looks up the required environment variable name in `PROVIDER_API_KEYS` registry

#### Scenario: Default model registry
- **WHEN** user does not specify a model
- **THEN** system looks up the default model for the provider in `DEFAULT_MODELS` registry

#### Scenario: Unknown provider
- **WHEN** user specifies a provider not in registry
- **THEN** system fails with error message indicating unknown provider

### Requirement: LLM Configuration
The system SHALL allow users to configure LLM provider, model, and timeout.

#### Scenario: Provider selection
- **WHEN** user sets `llm.provider` to "openai" or "anthropic" in configuration
- **THEN** the system uses the specified provider for all LLM requests

#### Scenario: Custom model name
- **WHEN** user sets `llm.model` in configuration
- **THEN** requests use the specified model instead of provider default

#### Scenario: Custom timeout
- **WHEN** user sets `llm.timeout` in configuration
- **THEN** requests timeout after specified milliseconds

#### Scenario: Default model per provider
- **WHEN** user does not specify `llm.model` and provider is "openai"
- **THEN** requests use "gpt-4o-mini" as default model

#### Scenario: Default model for Anthropic
- **WHEN** user does not specify `llm.model` and provider is "anthropic"
- **THEN** requests use "claude-3-5-sonnet-20241022" as default model

## ADDED Requirements

### Requirement: LLM Configuration
The system SHALL allow users to configure LLM provider, model, and timeout.

#### Scenario: Provider selection
- **WHEN** user sets `llm.provider` to "openai" or "anthropic" in configuration
- **THEN** the system uses the specified provider for all LLM requests

#### Scenario: Custom model name
- **WHEN** user sets `llm.model` in configuration
- **THEN** requests use the specified model instead of provider default

#### Scenario: Custom timeout
- **WHEN** user sets `llm.timeout` in configuration
- **THEN** requests timeout after specified milliseconds

#### Scenario: Default model per provider
- **WHEN** user does not specify `llm.model` and provider is "openai"
- **THEN** requests use "gpt-4o-mini" as default model

#### Scenario: Default model for Anthropic
- **WHEN** user does not specify `llm.model` and provider is "anthropic"
- **THEN** requests use "claude-3-5-sonnet-20241022" as default model
