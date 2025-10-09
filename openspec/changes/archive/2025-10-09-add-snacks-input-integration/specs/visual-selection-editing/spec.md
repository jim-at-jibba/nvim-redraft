# visual-selection-editing Specification Delta

## MODIFIED Requirements

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
