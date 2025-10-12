# user-configuration Delta

## MODIFIED Requirements

### Requirement: LLM Configuration
The system SHALL allow users to configure LLM provider, model, timeout, and multiple provider/model combinations.

#### Scenario: Provider selection (legacy)
- **WHEN** user sets `llm.provider` to "openai", "anthropic", "xai", or "openrouter" without `llm.models`
- **THEN** the system uses the specified provider converted to a single-entry models array

#### Scenario: Custom model name (legacy)
- **WHEN** user sets `llm.model` in configuration without `llm.models`
- **THEN** requests use the specified model converted to a single-entry models array

#### Scenario: Custom timeout
- **WHEN** user sets `llm.timeout` in configuration
- **THEN** requests timeout after specified milliseconds

#### Scenario: Default provider (legacy)
- **WHEN** user does not specify `llm.provider` or `llm.models`
- **THEN** system defaults to openai with default model in a single-entry models array

#### Scenario: Invalid provider value
- **WHEN** user provides a model entry with a provider value other than "openai", "anthropic", "xai", or "openrouter"
- **THEN** setup() fails with clear validation error

#### Scenario: Multiple models configuration takes precedence
- **WHEN** user configures both `llm.models` and legacy `llm.provider`/`llm.model`
- **THEN** `llm.models` is used and legacy fields are ignored with a warning

### Requirement: Environment Variable Requirements
The system SHALL document and validate required environment variables based on selected provider.

#### Scenario: OpenAI API key required
- **WHEN** provider is "openai" and first API request is made without `OPENAI_API_KEY` set
- **THEN** clear error message directs user to set the OPENAI_API_KEY environment variable

#### Scenario: Anthropic API key required
- **WHEN** provider is "anthropic" and first API request is made without `ANTHROPIC_API_KEY` set
- **THEN** clear error message directs user to set the ANTHROPIC_API_KEY environment variable

#### Scenario: OpenRouter API key required
- **WHEN** provider is "openrouter" and first API request is made without `OPENROUTER_API_KEY` set
- **THEN** clear error message directs user to set the OPENROUTER_API_KEY environment variable

#### Scenario: API key present for selected provider
- **WHEN** appropriate API key is set for selected provider
- **THEN** requests proceed without environment-related errors
