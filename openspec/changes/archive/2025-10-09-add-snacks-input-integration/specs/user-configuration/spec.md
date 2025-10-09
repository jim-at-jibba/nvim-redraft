# user-configuration Specification Delta

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Setup Function
The system SHALL provide a setup() function accepting user configuration including input options.

#### Scenario: Setup with custom options
- **WHEN** user calls setup({ system_prompt = "custom", keybindings = { visual_edit = "<C-a>" }, input = { prompt = "Custom: " } })
- **THEN** configuration is merged with defaults and applied

#### Scenario: Setup with no arguments
- **WHEN** user calls setup() or setup({})
- **THEN** default configuration including default input options is used
