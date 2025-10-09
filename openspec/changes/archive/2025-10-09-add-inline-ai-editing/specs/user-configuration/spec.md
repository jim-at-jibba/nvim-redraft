# User Configuration Specification

## ADDED Requirements

### Requirement: Setup Function
The system SHALL provide a setup() function accepting user configuration.

#### Scenario: Setup with custom options
- **WHEN** user calls setup({ system_prompt = "custom", keybindings = { visual_edit = "<C-a>" } })
- **THEN** configuration is merged with defaults and applied

#### Scenario: Setup with no arguments
- **WHEN** user calls setup() or setup({})
- **THEN** default configuration is used

### Requirement: System Prompt Configuration
The system SHALL allow users to override the default system prompt.

#### Scenario: Default system prompt
- **WHEN** no system_prompt is configured
- **THEN** a default code editing instruction prompt is used

#### Scenario: Custom system prompt
- **WHEN** user sets system_prompt in configuration
- **THEN** all LLM requests use the custom prompt instead of default

### Requirement: Keybinding Configuration
The system SHALL allow users to customize AI edit keybindings.

#### Scenario: Custom visual mode keybinding
- **WHEN** user configures keybindings.visual_edit
- **THEN** the specified key triggers AI edit in visual mode

#### Scenario: Disable default keybinding
- **WHEN** user sets keybindings.visual_edit to false or nil
- **THEN** no default keybinding is registered

### Requirement: LLM Configuration
The system SHALL allow users to configure LLM model and timeout.

#### Scenario: Custom model name
- **WHEN** user sets llm.model in configuration
- **THEN** requests use the specified model instead of "morph-v3-large"

#### Scenario: Custom timeout
- **WHEN** user sets llm.timeout in configuration
- **THEN** requests timeout after specified milliseconds

### Requirement: Configuration Validation
The system SHALL validate configuration values and provide helpful errors.

#### Scenario: Invalid timeout value
- **WHEN** user sets llm.timeout to non-numeric value
- **THEN** setup() fails with clear validation error

#### Scenario: Unknown configuration keys
- **WHEN** user provides unrecognized configuration keys
- **THEN** a warning is logged but setup() continues

### Requirement: Environment Variable Requirements
The system SHALL document and validate required environment variables.

#### Scenario: Missing MORPH_API_KEY
- **WHEN** first API request is made without MORPH_API_KEY set
- **THEN** clear error message directs user to set the environment variable

#### Scenario: API key present
- **WHEN** MORPH_API_KEY is set in environment
- **THEN** requests proceed without environment-related errors
