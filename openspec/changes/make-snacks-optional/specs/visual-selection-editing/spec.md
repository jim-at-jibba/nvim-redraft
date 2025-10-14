# visual-selection-editing Delta Specification

## MODIFIED Requirements

### Requirement: User Instruction Prompt
The system SHALL display an input prompt to collect editing instructions from the user, using Snacks.nvim when available or vim.ui.input as fallback.

#### Scenario: User provides instruction with Snacks
- **WHEN** selection is captured, Snacks.nvim is available, and Snacks.input prompt is shown
- **THEN** user can type natural language instructions with enhanced styling and submit with Enter

#### Scenario: User provides instruction without Snacks
- **WHEN** selection is captured, Snacks.nvim is not available, and vim.ui.input prompt is shown
- **THEN** user can type natural language instructions and submit with Enter

#### Scenario: User cancels prompt with Snacks
- **WHEN** user presses Escape or provides empty input in Snacks.input
- **THEN** the input closes and the operation is cancelled with no changes made

#### Scenario: User cancels prompt without Snacks
- **WHEN** user presses Escape or provides empty input in vim.ui.input
- **THEN** the input closes and the operation is cancelled with no changes made

#### Scenario: Input positioning with Snacks
- **WHEN** Snacks.nvim is available and input prompt is displayed
- **THEN** the input appears relative to cursor position with configured styling (icon, title, border)

#### Scenario: Input positioning without Snacks
- **WHEN** Snacks.nvim is not available and input prompt is displayed
- **THEN** vim.ui.input shows at the command line with prompt text only


