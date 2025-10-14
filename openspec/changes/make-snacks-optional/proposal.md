# Make Snacks.nvim Optional Dependency

## Why
Users must currently install Snacks.nvim to use nvim-redraft, even though the plugin only uses Snacks for input prompts and model selection. This creates an unnecessary hard dependency that limits adoption and flexibility.

## What Changes
- Make Snacks.nvim detection conditional via `pcall(require, "snacks")`
- Implement fallback to `vim.ui.input()` when Snacks.nvim is not available
- Model selector already uses `vim.ui.select()` (no changes needed)
- Update documentation to reflect Snacks.nvim as optional enhancement
- Maintain existing Snacks.nvim functionality when available (no breaking changes)

## Impact
- Affected specs: user-configuration, visual-selection-editing
- Affected code: `lua/nvim-redraft/input.lua` (primary change)
- Users: Can use plugin with or without Snacks.nvim
- Existing users: No changes required, Snacks.nvim features still work
