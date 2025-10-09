## MODIFIED Requirements

### Requirement: LLM Configuration
The system SHALL allow users to configure LLM provider, model, and timeout.

#### Scenario: Provider selection
- **WHEN** user sets `llm.provider` to "openai" or "anthropic"
- **THEN** the system uses the specified provider for all LLM requests

#### Scenario: Custom model name
- **WHEN** user sets `llm.model` in configuration
- **THEN** requests use the specified model instead of provider default

#### Scenario: Custom timeout
- **WHEN** user sets `llm.timeout` in configuration
- **THEN** requests timeout after specified milliseconds

#### Scenario: Default provider
- **WHEN** user does not specify `llm.provider`
- **THEN** system defaults to "openai" provider

#### Scenario: Invalid provider value
- **WHEN** user sets `llm.provider` to value other than "openai" or "anthropic"
- **THEN** setup() fails with clear validation error

### Requirement: Environment Variable Requirements
The system SHALL document and validate required environment variables based on selected provider.

#### Scenario: OpenAI API key required
- **WHEN** provider is "openai" and first API request is made without `OPENAI_API_KEY` set
- **THEN** clear error message directs user to set the OPENAI_API_KEY environment variable

#### Scenario: Anthropic API key required
- **WHEN** provider is "anthropic" and first API request is made without `ANTHROPIC_API_KEY` set
- **THEN** clear error message directs user to set the ANTHROPIC_API_KEY environment variable

#### Scenario: API key present for selected provider
- **WHEN** appropriate API key is set for selected provider
- **THEN** requests proceed without environment-related errors
