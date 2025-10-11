# user-configuration Delta

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: LLM Configuration
The system SHALL allow users to configure LLM provider, model, timeout, and multiple provider/model combinations.

#### Scenario: Provider selection (legacy)
- **WHEN** user sets `llm.provider` to "openai", "anthropic", or "xai" without `llm.models`
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
- **WHEN** user provides a model entry with a provider value other than "openai", "anthropic", or "xai"
- **THEN** setup() fails with clear validation error

#### Scenario: Multiple models configuration takes precedence
- **WHEN** user configures both `llm.models` and legacy `llm.provider`/`llm.model`
- **THEN** `llm.models` is used and legacy fields are ignored with a warning
