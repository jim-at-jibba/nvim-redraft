# Implementation Tasks

## 1. Core Implementation
- [x] 1.1 Update `lua/nvim-redraft/input.lua` to detect Snacks.nvim availability
- [x] 1.2 Implement fallback logic to use `vim.ui.input()` when Snacks not available
- [x] 1.3 Preserve Snacks-specific configuration options (icon, win) when Snacks is available
- [x] 1.4 Ensure prompt text works correctly in both Snacks and vim.ui.input modes

## 2. Documentation
- [x] 2.1 Update README.md to list Snacks.nvim as optional (not required)
- [x] 2.2 Document behavior differences between Snacks.nvim and vim.ui.input
- [x] 2.3 Update installation examples to show Snacks.nvim as optional dependency
- [x] 2.4 Add note about enhanced UX when Snacks.nvim is installed

## 3. Testing
- [x] 3.1 Test input flow with Snacks.nvim installed
- [x] 3.2 Test input flow with Snacks.nvim not installed (fallback)
- [x] 3.3 Test model selector continues to work (already uses vim.ui.select)
- [x] 3.4 Verify configuration options work correctly in both modes

## 4. Validation
- [x] 4.1 Run existing test suite to ensure no regressions
- [ ] 4.2 Manually test complete edit flow without Snacks.nvim (ready for user testing)
- [ ] 4.3 Manually test complete edit flow with Snacks.nvim (ready for user testing)
- [x] 4.4 Verify error messages are clear in both modes
