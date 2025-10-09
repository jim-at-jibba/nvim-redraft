# Implementation Tasks

## 1. Lua Logging Infrastructure
- [x] 1.1 Create `lua/nvim-redraft/logger.lua` module with file logging support
- [x] 1.2 Add `debug` config option to main plugin setup
- [x] 1.3 Add log file path configuration (default: `~/.local/state/nvim/nvim-redraft.log`)
- [x] 1.4 Implement log levels (DEBUG, INFO, WARN, ERROR)
- [x] 1.5 Add timestamp and source location to log entries

## 2. TypeScript Logging Infrastructure
- [x] 2.1 Create `ts/src/logger.ts` module with file logging support
- [x] 2.2 Receive debug config and log file path via IPC initialization
- [x] 2.3 Implement matching log levels and format
- [x] 2.4 Add safe truncation for large code blocks (configurable limit)

## 3. Integrate Logging in Lua Components
- [x] 3.1 Add logging to `nvim-redraft.lua` edit function
- [x] 3.2 Add logging to `ipc.lua` for request/response tracking
- [x] 3.3 Add logging to `selection.lua` for selection extraction
- [x] 3.4 Add logging to `replace.lua` for code replacement

## 4. Integrate Logging in TypeScript Components
- [x] 4.1 Add logging to JSON-RPC server initialization
- [x] 4.2 Add logging to request parsing and handling
- [x] 4.3 Add logging to LLM service for sparse edit generation
- [x] 4.4 Add logging to LLM service for Fast Apply merging
- [x] 4.5 Log API response metadata (tokens, timing)

## 5. Documentation and Testing
- [x] 5.1 Update README.md with debug configuration example
- [x] 5.2 Add troubleshooting section about log file location
- [x] 5.3 Test logging with various scenarios (success, errors, timeouts)
- [x] 5.4 Verify log file rotation/size limits if implemented
- [x] 5.5 Test that logging is disabled by default (no performance impact)

## Dependencies
- Tasks 3.x depend on 1.x
- Tasks 4.x depend on 2.x
- Task 2.2 depends on 1.2 (config passing)
- Task 5.x can be done in parallel with integration tasks
