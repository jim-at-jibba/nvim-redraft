# Add Debug Logging

## Why

Users need a way to troubleshoot issues with the plugin by capturing detailed logs from both the Lua and TypeScript components. Currently, logging is minimal and goes to stderr/notifications, making it difficult to diagnose problems with code transformations, API interactions, or IPC communication.

## What Changes

- Add a `debug` configuration option to the plugin setup
- Create a logging module in Lua that writes to a configurable log file
- Create a logging module in TypeScript that writes to the same log file
- Log all critical debugging information including:
  - User instructions
  - Selected code (input)
  - Generated sparse edits
  - Final merged code (output)
  - API requests and responses
  - IPC communication
  - Errors and stack traces
  - Timing information

## Impact

- Affected specs: `debug-logging` (new capability)
- Affected code:
  - `lua/nvim-redraft.lua` - Add debug config option
  - `lua/nvim-redraft/logger.lua` (new) - Lua logging module
  - `lua/nvim-redraft/ipc.lua` - Add logging to IPC calls
  - `ts/src/logger.ts` (new) - TypeScript logging module
  - `ts/src/index.ts` - Add logging to JSON-RPC handling
  - `ts/src/llm.ts` - Add logging to LLM operations
- No breaking changes
