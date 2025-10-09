# visual-selection-editing Specification

## Purpose
TBD - created by archiving change add-inline-ai-editing. Update Purpose after archive.
## Requirements
### Requirement: Visual Selection Capture
The system SHALL capture the currently selected text in visual mode when the user triggers an AI edit.

#### Scenario: Visual mode selection captured
- **WHEN** user selects text in visual or visual-line mode and triggers AI edit
- **THEN** the selected text is extracted with correct line and column ranges

#### Scenario: No selection active
- **WHEN** user triggers AI edit without an active visual selection
- **THEN** an error message is displayed and no AI request is made

### Requirement: User Instruction Prompt
The system SHALL display a Snacks.nvim input prompt to collect editing instructions from the user.

#### Scenario: User provides instruction
- **WHEN** selection is captured and Snacks.input prompt is shown
- **THEN** user can type natural language instructions and submit with Enter

#### Scenario: User cancels prompt
- **WHEN** user presses Escape or provides empty input
- **THEN** the Snacks.input closes and the operation is cancelled with no changes made

#### Scenario: Input positioning
- **WHEN** Snacks.input prompt is displayed
- **THEN** the input appears relative to cursor position with configured styling (icon, title, border)

### Requirement: Inline Replacement
The system SHALL replace the selected text with AI-generated output without confirmation.

#### Scenario: Successful replacement
- **WHEN** AI service returns edited code
- **THEN** the original selection is replaced atomically in the buffer

#### Scenario: Replacement preserves undo history
- **WHEN** AI edit is applied
- **THEN** user can undo the change with a single `u` command

### Requirement: Keybinding Registration
The system SHALL register configurable keybindings in visual mode for triggering AI edits.

#### Scenario: Default keybinding
- **WHEN** plugin is loaded with default configuration
- **THEN** `<leader>ae` in visual mode triggers the AI edit flow

#### Scenario: Custom keybinding
- **WHEN** user configures custom keybinding in setup()
- **THEN** the custom keybinding triggers AI edit and default is not registered

### Requirement: Error Handling for Edit Failures
The system SHALL preserve original content and notify users when edits fail.

#### Scenario: API failure during edit
- **WHEN** AI service returns an error
- **THEN** original selection remains unchanged and error is displayed via vim.notify

#### Scenario: IPC communication failure
- **WHEN** TypeScript service crashes or is unresponsive
- **THEN** user sees error message and selection is not modified

