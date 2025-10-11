# Add Multi-Model Selector

## Why
Users currently can only configure one provider and model at setup time. This forces them to restart Neovim or reconfigure the plugin to switch between different LLM providers or models, which is cumbersome when experimenting with different models or providers for different tasks.

## What Changes
- Extend configuration to accept a list of provider/model pairs instead of single provider/model
- Add a Snacks.nvim select menu that displays available provider/model combinations
- Add a keybinding to trigger the model selector
- Store the currently active provider/model selection
- Update TypeScript service to use the currently selected provider/model for processing
- Maintain backward compatibility with existing single provider/model configuration

## Impact
- **Affected specs**: `user-configuration`, `ai-llm-integration`, `visual-selection-editing`
- **Affected code**: 
  - `lua/nvim-redraft.lua` (configuration schema, setup function, new selector command)
  - `lua/nvim-redraft/model_selector.lua` (new file with model selection UI using Snacks picker)
  - `ts/src/index.ts` (no changes needed - already receives provider/model per request)
  - `ts/src/llm.ts` (no changes needed - already supports dynamic provider/model)
- **Backward compatibility**: Existing configurations with `llm.provider` and `llm.model` will continue to work by treating them as a single-item list
