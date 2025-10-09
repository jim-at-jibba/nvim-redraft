# Proposal: Add Snacks.nvim Input Integration

## Why
The current custom floating window implementation for user input lacks polish and features. Snacks.nvim provides a mature, well-tested input component with better UX (styling, icons, positioning) and integration with the Neovim ecosystem. Using Snacks.nvim aligns with modern plugin standards and reduces maintenance burden.

## What Changes
- Add Snacks.nvim as a required dependency
- Replace custom floating window input implementation with Snacks.nvim input
- Add `input` configuration table to allow users to override Snacks.input options
- Use cursor-relative positioning (like opencode.nvim) instead of selection-relative positioning
- Update documentation to reflect Snacks.nvim dependency and configuration options

## Impact
- Affected specs: user-configuration (add input options), visual-selection-editing (input behavior change)
- Affected code: lua/nvim-redraft/input.lua (implementation), lua/nvim-redraft.lua (configuration), tests/nvim-redraft/input_spec.lua (test expectations), README.md (installation instructions)
- **BREAKING**: Users must install Snacks.nvim as a dependency
- **BREAKING**: Input positioning changes from above-selection to cursor-relative
