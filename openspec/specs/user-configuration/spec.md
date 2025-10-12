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

#### Scenario: OpenRouter API key required
- **WHEN** provider is "openrouter" and first API request is made without `OPENROUTER_API_KEY` set
- **THEN** clear error message directs user to set the OPENROUTER_API_KEY environment variable

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

### Requirement: Multi-Model Configuration
The system SHALL allow users to configure multiple provider/model combinations that can be switched at runtime.

#### Scenario: Configure multiple models
- **WHEN** user sets `llm.models` to an array of `{provider, model, label?}` tables
- **THEN** all configured models are available for selection during editing

#### Scenario: Optional model labels
- **WHEN** user provides a `label` field in a model configuration entry
- **THEN** the label is displayed in the model selector instead of the provider/model combination

#### Scenario: Default model selection
- **WHEN** user sets `llm.default_model_index` to a valid index
- **THEN** that model is selected by default on plugin initialization

#### Scenario: Default model index fallback
- **WHEN** user does not specify `llm.default_model_index`
- **THEN** the first model in the `llm.models` array is selected by default

#### Scenario: Backward compatibility with single provider/model
- **WHEN** user configures `llm.provider` and `llm.model` without `llm.models`
- **THEN** the system converts them into a single-entry `llm.models` array automatically

#### Scenario: Validation of models array
- **WHEN** `llm.models` is provided but empty or invalid
- **THEN** setup() fails with a clear error message requiring at least one valid model configuration

### Requirement: Model Selector Keybinding
The system SHALL provide a configurable keybinding to open the model selector menu.

#### Scenario: Default model selector keybinding
- **WHEN** user does not configure `keybindings.select_model`
- **THEN** `<leader>am` opens the model selector in normal mode

#### Scenario: Custom model selector keybinding
- **WHEN** user sets `keybindings.select_model` to a custom key sequence
- **THEN** the custom keybinding opens the model selector in normal mode

#### Scenario: Disable model selector keybinding
- **WHEN** user sets `keybindings.select_model` to `false` or `nil`
- **THEN** no keybinding is registered for the model selector

