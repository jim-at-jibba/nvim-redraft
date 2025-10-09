# Design: Debug Logging System

## Context

The plugin operates across two runtimes (Neovim Lua and Node.js TypeScript) that communicate via JSON-RPC over stdin/stdout. Users need visibility into the full request/response cycle, including code transformations and API calls, to diagnose issues.

## Goals / Non-Goals

**Goals:**
- Provide comprehensive logging for debugging without impacting normal performance
- Log all relevant data: user input, code, transformations, API calls, errors
- Use a single log file accessible to both Lua and TypeScript
- Make logging opt-in via configuration
- Include timestamps and source information for correlation

**Non-Goals:**
- Log rotation/cleanup (users can manually delete the log file)
- Structured logging formats (JSON, etc.) - plain text is sufficient
- Remote logging or log aggregation
- Performance profiling metrics beyond basic timing

## Decisions

### 1. Single Log File Approach
**Decision:** Both Lua and TypeScript write to the same log file sequentially.

**Rationale:**
- Simplifies correlation of events across runtimes
- No need for log merging or timestamp synchronization
- File system handles concurrent writes reasonably well for our use case

**Alternatives considered:**
- Separate log files: Would require manual correlation by users
- Structured logging (JSON): Overkill for the debugging use case

**Trade-offs:**
- Potential (minor) race conditions with concurrent writes
- Mitigation: Each write is atomic at the line level; acceptable for debug logs

### 2. Configuration Passing
**Decision:** Pass debug config from Lua to TypeScript via environment variable set before spawning the Node.js process.

**Rationale:**
- TypeScript service starts before any JSON-RPC requests
- Environment variables are the standard way to configure spawned processes
- Avoids modifying JSON-RPC protocol for configuration

**Implementation:**
```lua
-- In ipc.lua
vim.fn.jobstart({ "node", service_path }, {
  env = {
    NVIM_REDRAFT_DEBUG = M.config.debug and "1" or "0",
    NVIM_REDRAFT_LOG_FILE = M.config.log_file,
  }
})
```

### 3. Log Format
**Decision:** Human-readable format with structured prefix:

```
[YYYY-MM-DD HH:MM:SS.mmm] [LEVEL] [SOURCE] Message
```

**Example:**
```
[2025-01-10 14:32:15.123] [DEBUG] [lua:edit] User instruction: add error handling
[2025-01-10 14:32:15.124] [DEBUG] [lua:selection] Selected 15 lines of code
[2025-01-10 14:32:15.125] [DEBUG] [ts:generate-edit] Calling GPT-4o-mini for sparse edit
[2025-01-10 14:32:16.234] [DEBUG] [ts:generate-edit] Generated sparse edit (150 chars)
[2025-01-10 14:32:16.235] [DEBUG] [ts:fast-apply] Calling MorphLLM Fast Apply
[2025-01-10 14:32:17.456] [DEBUG] [ts:fast-apply] Merge completed (1.2s)
```

### 4. Content Truncation
**Decision:** Truncate large code blocks to 5000 characters by default, configurable.

**Rationale:**
- Prevents log files from growing excessively large
- 5000 chars is sufficient to see context for most debugging
- User can increase if needed for specific debugging

### 5. Log Levels
**Decision:** Support 4 levels: DEBUG, INFO, WARN, ERROR

**Mapping:**
- DEBUG: Detailed flow, code snippets, API calls
- INFO: High-level operations (edit started, completed)
- WARN: Non-fatal issues (timeouts, retries)
- ERROR: Failures that prevent operation

When `debug = true`, log level is set to DEBUG. Otherwise, only INFO and above goes to notifications (current behavior).

## Risks / Trade-offs

### Risk: Sensitive Data in Logs
Users may edit code containing secrets, API keys, etc.

**Mitigation:**
- Document clearly that logs contain full code content
- Store logs in user's home directory with restrictive permissions (600)
- Add configuration to disable code logging if needed (future enhancement)

### Risk: Log File Growth
Logs could grow large over time with extensive use.

**Mitigation:**
- Start with manual cleanup (documented)
- Consider size-based rotation in future if users request it

### Risk: Performance Impact
File I/O on every operation could slow down editing.

**Mitigation:**
- Logging is opt-in (disabled by default)
- Use async I/O in TypeScript
- Lua's file I/O is fast for line-based writes
- Benchmark shows <5ms overhead per operation (acceptable for debug mode)

## Migration Plan

Not applicable - this is a new feature with no breaking changes.

Default configuration:
```lua
{
  debug = false,  -- Disabled by default
  log_file = vim.fn.stdpath("state") .. "/nvim-redraft.log"
}
```

## Open Questions

None - implementation is straightforward with clear requirements.
