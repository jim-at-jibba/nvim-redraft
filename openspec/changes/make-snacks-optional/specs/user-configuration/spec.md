# user-configuration Delta Specification

## REMOVED Requirements

### Requirement: Snacks.nvim Dependency
**Reason**: Changing from hard dependency to optional dependency  
**Migration**: No migration needed - Snacks.nvim will continue to work when installed

## ADDED Requirements

### Requirement: Optional Snacks.nvim Dependency
The system SHALL work with or without Snacks.nvim installed, using appropriate input methods for each case.

#### Scenario: Snacks.nvim installed
- **WHEN** Snacks.nvim with input support is available
- **THEN** plugin uses Snacks.input for enhanced input experience with icons and custom styling

#### Scenario: Snacks.nvim not installed
- **WHEN** Snacks.nvim is not available
- **THEN** plugin falls back to vim.ui.input() for instruction prompts

#### Scenario: Input configuration with Snacks available
- **WHEN** Snacks.nvim is installed and user configures input.icon or input.win options
- **THEN** these options are applied to Snacks.input

#### Scenario: Input configuration without Snacks
- **WHEN** Snacks.nvim is not installed and user configures input.icon or input.win options
- **THEN** these options are silently ignored and vim.ui.input uses only the prompt text

## MODIFIED Requirements

### Requirement: Input Configuration
The system SHALL allow users to configure instruction prompt appearance, with behavior dependent on Snacks.nvim availability.

#### Scenario: Default input configuration
- **WHEN** user does not provide custom input configuration
- **THEN** system uses "AI Edit: " as prompt text (works in both Snacks and vim.ui.input)

#### Scenario: Custom input prompt
- **WHEN** user sets `input.prompt = "Custom: "`
- **THEN** the custom prompt is displayed in both Snacks.input and vim.ui.input

#### Scenario: Custom input window options
- **WHEN** user sets `input.win` or `input.icon` configuration
- **THEN** these options are applied only when Snacks.nvim is available

#### Scenario: Custom input icon
- **WHEN** user sets `input.icon = "🤖"` and Snacks.nvim is available
- **THEN** the custom icon is displayed in Snacks.input prompt
