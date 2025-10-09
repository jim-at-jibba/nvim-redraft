# Proposal: Add Inline AI Editing

## Why

Neovim users need a frictionless way to apply AI-driven code edits directly to their selections without context-switching or confirmation dialogs. This enables rapid iteration and natural integration of AI assistance into the editing workflow.

## What Changes

- Add visual selection capture and inline replacement capability
- Add TypeScript-based AI service using Vercel AI SDK and MorphLLM
- Add input prompt UI for user instructions
- Add configurable system prompts with override support
- Add Lua-TypeScript IPC bridge for LLM communication
- Add keybinding registration for triggering AI edits

## Impact

- Affected specs: `visual-selection-editing`, `ai-llm-integration`, `user-configuration` (new capabilities)
- Affected code: 
  - `lua/plugin_name.lua` - main plugin entry point
  - `lua/plugin_name/` - new modules for selection, input, IPC
  - New TypeScript service directory for AI integration
  - Plugin configuration and keybinding setup
