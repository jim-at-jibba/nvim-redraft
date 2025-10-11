# Design: Multi-Model Selector

## Context
The plugin currently supports multiple LLM providers (OpenAI, Anthropic, xAI) but only allows users to configure one provider/model pair at a time. Users who want to switch between models must edit their configuration and restart Neovim or call `setup()` again, which is disruptive to their workflow.

The TypeScript service already accepts provider and model parameters per request, so no backend changes are needed. This is purely a configuration and UI enhancement.

## Goals
- Allow users to configure multiple provider/model combinations
- Provide a runtime UI to switch between configured models
- Maintain backward compatibility with existing configurations
- Keep the implementation simple and lightweight

## Non-Goals
- Dynamic model discovery from API endpoints
- Model-specific configuration (timeout, max_tokens, etc.) per model
- Persistent storage of last-selected model across sessions
- Model selection via command-line arguments or API

## Decisions

### Configuration Schema
Users will define models in an array format:
```lua
require('nvim-redraft').setup({
  llm = {
    models = {
      { provider = "openai", model = "gpt-4o-mini", label = "GPT-4o Mini" },
      { provider = "openai", model = "gpt-4o" },
      { provider = "anthropic", model = "claude-3-5-sonnet-20241022" },
      { provider = "xai", model = "grok-4-fast-non-reasoning" },
    },
    default_model_index = 1,  -- Optional, defaults to 1
  }
})
```

**Rationale**: 
- Array format is idiomatic in Lua and makes ordering explicit
- Optional `label` field allows user-friendly names
- Index-based selection is simple and efficient
- Per-model configuration (timeout, max_tokens) remains global to avoid complexity

### Backward Compatibility
If `llm.models` is not present but `llm.provider` and `llm.model` are:
```lua
M.config.llm.models = {
  { provider = M.config.llm.provider, model = M.config.llm.model }
}
M.config.llm.current_index = 1
```

### Model Selection UI
Use `vim.ui.select()` which automatically uses Snacks picker when configured:
- Format: `"<label>" or "<provider>: <model>"`
- On selection, update `M.config.llm.current_index`
- Show notification: `"Switched to <label>"`

**Rationale**:
- `vim.ui.select` is the standard Neovim API
- Snacks automatically provides picker UI when configured (project requirement)
- Works seamlessly with any `vim.ui.select` override (Telescope, Dressing, etc.)
- Simple, idiomatic implementation following Neovim best practices

### State Management
Store current model index in `M.config.llm.current_index` (runtime state).

**Alternatives considered**:
- Persistent storage: Adds complexity, not requested
- Session-based storage: Overhead without clear benefit

### Keybinding
Default to `<leader>am` (AI Model).

**Rationale**: 
- Consistent with existing `<leader>ae` (AI Edit)
- Mnemonic and not commonly used

## Risks / Trade-offs

### Risk: Configuration Complexity
Users might misconfigure providers or models.

**Mitigation**: 
- Validate that each model entry has required fields
- Fall back to provider defaults if model is omitted
- Clear error messages on validation failure

### Trade-off: Global vs Per-Model Config
Configuration like `timeout`, `max_output_tokens`, `base_url` remains global.

**Rationale**: 
- Keeps implementation simple
- Users can override per-request if needed in future
- Most users want consistent timeout across models

## Migration Plan
No migration needed. Existing configurations continue to work unchanged.

New users can immediately use `llm.models` array format.

## Open Questions
None.
