# user-configuration Specification

## Purpose
TBD - created by archiving change add-inline-ai-editing. Update Purpose after archive.
## Requirements
### Requirement: Setup Function
The system SHALL provide a setup() function accepting user configuration including input options.

#### Scenario: Setup with custom options
- **WHEN** user calls setup({ system_prompt = "custom", keybindings = { visual_edit = "<C-a>" }, input = { prompt = "Custom: " } })
- **THEN** configuration is merged with defaults and applied

#### Scenario: Setup with no arguments
- **WHEN** user calls setup() or setup({})
- **THEN** default configuration including default input options is used

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

### Requirement: Configuration Validation
The system SHALL validate configuration values and provide helpful errors.

#### Scenario: Invalid timeout value
- **WHEN** user sets llm.timeout to non-numeric value
- **THEN** setup() fails with clear validation error

#### Scenario: Unknown configuration keys
- **WHEN** user provides unrecognized configuration keys
- **THEN** a warning is logged but setup() continues

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

### Requirement: Input Configuration
The system SHALL allow users to configure Snacks.nvim input options.

#### Scenario: Default input configuration
- **WHEN** user does not specify `input` configuration
- **THEN** Snacks.input uses sensible defaults (prompt, icon, cursor-relative positioning)

#### Scenario: Custom input prompt
- **WHEN** user sets `input.prompt` in configuration
- **THEN** the input displays the custom prompt text

#### Scenario: Custom input window options
- **WHEN** user sets `input.win` options (e.g., relative, row, col, title_pos)
- **THEN** Snacks.input applies the custom window positioning and styling

#### Scenario: Custom input icon
- **WHEN** user sets `input.icon` in configuration
- **THEN** the input displays the custom icon

### Requirement: Snacks.nvim Dependency
The system SHALL require Snacks.nvim with input support to be installed.

#### Scenario: Snacks.nvim not installed
- **WHEN** user attempts to use plugin without Snacks.nvim
- **THEN** clear error message directs user to install Snacks.nvim

#### Scenario: Snacks.nvim installed
- **WHEN** Snacks.nvim with input support is available
- **THEN** plugin functions normally using Snacks.input

