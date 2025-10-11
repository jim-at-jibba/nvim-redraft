# visual-selection-editing Delta

## ADDED Requirements

### Requirement: Runtime Model Selection
The system SHALL allow users to switch between configured LLM models at runtime without restarting Neovim.

#### Scenario: Open model selector
- **WHEN** user triggers the model selector keybinding in normal mode
- **THEN** a Snacks.select menu displays all configured models with their labels or provider/model names

#### Scenario: Select model from menu
- **WHEN** user selects a model from the selector menu
- **THEN** the selected model becomes active for all subsequent edit operations

#### Scenario: Model selection confirmation
- **WHEN** user selects a model from the selector menu
- **THEN** a notification displays confirming the switch (e.g., "Switched to GPT-4o Mini")

#### Scenario: Cancel model selection
- **WHEN** user cancels the model selector menu without choosing
- **THEN** the currently active model remains unchanged

#### Scenario: Edit uses selected model
- **WHEN** user performs an AI edit operation
- **THEN** the currently selected model from `llm.models[current_index]` is used for processing

#### Scenario: Model selector with single model
- **WHEN** only one model is configured in `llm.models`
- **THEN** the model selector can still be opened but shows only one option
