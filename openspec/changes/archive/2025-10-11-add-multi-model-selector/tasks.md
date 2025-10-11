# Implementation Tasks

## 1. Configuration Schema Update
- [x] 1.1 Add `llm.models` array configuration option accepting list of `{provider, model, label?}` tables
- [x] 1.2 Add `llm.default_model_index` configuration option (defaults to 1)
- [x] 1.3 Add `keybindings.select_model` configuration option (defaults to `<leader>am`)
- [x] 1.4 Add validation to ensure at least one model is configured
- [x] 1.5 Add backward compatibility logic to convert single `llm.provider`/`llm.model` into `llm.models` array
- [x] 1.6 Store current model index in plugin state

## 2. Model Selector UI
- [x] 2.1 Create `select_model()` function in `lua/nvim-redraft.lua`
- [x] 2.2 Create `lua/nvim-redraft/model_selector.lua` with `get_model_selection()` function using `vim.ui.select()` (Snacks picker when configured)
- [x] 2.3 Format model list for display (show provider name and model name)
- [x] 2.4 Update current model index on selection
- [x] 2.5 Show notification when model is changed

## 3. Integration with Edit Flow
- [x] 3.1 Update `M.edit()` to use current model from `llm.models[current_index]`
- [x] 3.2 Pass selected provider and model to IPC request
- [x] 3.3 Update keybinding registration for model selector

## 4. Testing
- [x] 4.1 Test with multiple providers configured
- [x] 4.2 Test with same provider, different models
- [x] 4.3 Test backward compatibility with old configuration format
- [x] 4.4 Test model selector UI and switching
- [x] 4.5 Verify edits use the selected model

## 5. Documentation
- [x] 5.1 Update README with new configuration options
- [x] 5.2 Add examples of multi-model configuration
- [x] 5.3 Document the model selector keybinding
