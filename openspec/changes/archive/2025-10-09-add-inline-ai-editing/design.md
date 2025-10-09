# Design: Inline AI Editing

## Context

Building a Neovim plugin that enables users to select code, provide natural language instructions, and have an LLM apply the edit inline. The plugin uses a hybrid architecture: Lua for Neovim integration and TypeScript for LLM communication.

### Constraints
- Must work across platforms (macOS, Linux, Windows)
- Requires Node.js runtime for TypeScript service
- Depends on external MorphLLM API (requires API key)
- Must not block Neovim UI during LLM requests

### Stakeholders
- End users: Neovim developers seeking AI-assisted editing
- Plugin maintainers: Need simple, debuggable architecture

## Goals / Non-Goals

### Goals
- Seamless inline editing experience (no confirmations, no separate windows)
- Simple configuration with sensible defaults
- Reliable Lua-TypeScript IPC
- Overridable system prompts

### Non-Goals
- Multi-provider LLM support (start with MorphLLM only)
- Streaming responses (use simple request/response)
- Undo/redo integration beyond Neovim's built-in undo
- Chat history or conversation context

## Decisions

### Architecture: Lua + TypeScript IPC
- **What**: Lua plugin spawns a long-lived TypeScript process, communicates via stdio using JSON-RPC
- **Why**: 
  - Vercel AI SDK is TypeScript-native
  - Lua job control (`vim.fn.jobstart`) handles async I/O well
  - Keeps plugin logic in Lua, LLM complexity in TypeScript
- **Alternatives considered**:
  - Pure Lua with curl: Would require manual HTTP client code, no AI SDK benefits
  - Embedded Python: Adds another runtime dependency
  - HTTP server: Overkill for single-user local plugin

### Prompt Format
- **What**: `<instruction>${user_input}</instruction>\n<code>${selection}</code>\n<update>${user_instruction}</update>`
- **Why**: Structured tags help model distinguish instruction from code context
- **Alternatives considered**:
  - Plain text: Less reliable parsing by LLM
  - System/user message split: Simpler but less explicit

### UI: vim.ui.input for Prompts
- **What**: Use built-in `vim.ui.input()` for instruction prompt
- **Why**: 
  - Native integration, respects user's UI overrides (e.g., Telescope, dressing.nvim)
  - No additional dependencies
- **Alternatives considered**:
  - Custom floating window: More control but more code, less ecosystem integration

### Error Handling Strategy
- Display errors via `vim.notify()` with ERROR level
- Preserve original selection on failure (no partial edits)
- Log detailed errors for debugging (API failures, IPC issues)

## Implementation Details

### IPC Protocol
```lua
-- Request format (Lua → TypeScript)
{
  id = 1,
  method = "edit",
  params = {
    code = "original code",
    instruction = "user instruction",
    systemPrompt = "optional override"
  }
}

-- Response format (TypeScript → Lua)
{
  id = 1,
  result = "edited code"  -- or error = "message"
}
```

### File Structure
```
.
├── lua/
│   ├── nvim-redraft.lua              # Main entry, setup()
│   └── nvim-redraft/
│       ├── selection.lua             # Visual selection capture
│       ├── input.lua                 # Prompt UI wrapper
│       ├── ipc.lua                   # TypeScript service management
│       └── replace.lua               # Inline replacement logic
├── ts/
│   ├── package.json
│   ├── src/
│   │   ├── index.ts                  # JSON-RPC server
│   │   └── llm.ts                    # MorphLLM client
│   └── dist/                         # Compiled JS
```

### Configuration Schema
```lua
{
  system_prompt = "You are a code editing assistant...",
  keybindings = {
    visual_edit = "<leader>ae"
  },
  llm = {
    model = "morph-v3-large",
    timeout = 30000  -- ms
  }
}
```

## Risks / Trade-offs

### Risk: TypeScript Service Crashes
- **Mitigation**: Auto-restart on failure, log crash details, validate startup

### Risk: API Key Not Set
- **Mitigation**: Check `MORPH_API_KEY` on first use, show clear error message

### Risk: Large Selections / Timeouts
- **Mitigation**: Document recommended selection size, implement configurable timeout

### Trade-off: No Streaming
- **Pro**: Simpler implementation, atomic edits
- **Con**: User sees no progress for slow requests
- **Decision**: Start simple, add streaming if users request it

## Migration Plan

N/A - New plugin, no migration needed.

### Rollout
1. Release as 0.1.0 with MorphLLM only
2. Gather user feedback on prompt format and UX
3. Consider multi-provider support in 0.2.0 if requested

## Open Questions

1. **Q**: Should we support undo grouping (single undo for AI edit)?
   - **A**: Yes, use `vim.api.nvim_buf_set_lines` which respects undo. Document that normal `u` reverts the change.

2. **Q**: How to handle multi-line prompts?
   - **A**: `vim.ui.input` is single-line only. Start with that; if users need multi-line, switch to floating window.

3. **Q**: Should TypeScript service be persistent or spawn per-request?
   - **A**: Persistent for performance (avoid repeated startup). Restart if crashes.
