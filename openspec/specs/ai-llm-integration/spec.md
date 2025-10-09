# ai-llm-integration Specification

## Purpose
TBD - created by archiving change add-inline-ai-editing. Update Purpose after archive.
## Requirements
### Requirement: MorphLLM API Integration
The system SHALL communicate with MorphLLM API using the OpenAI SDK via TypeScript service.

#### Scenario: Successful API request
- **WHEN** user instruction and code are sent to TypeScript service
- **THEN** a request is made to https://api.morphllm.com/v1 with model "morph-v3-large"

#### Scenario: API key validation
- **WHEN** TypeScript service starts and MORPH_API_KEY is not set
- **THEN** an error is logged and first request fails with clear error message

### Requirement: Prompt Format
The system SHALL format prompts using instruction and code tags for LLM processing.

#### Scenario: Prompt structure
- **WHEN** generating LLM request
- **THEN** message content follows format: `<instruction>${user_input}</instruction>\n<code>${selection}</code>\n<update>${user_instruction}</update>`

### Requirement: TypeScript Service Lifecycle
The system SHALL manage a persistent TypeScript process for LLM communication.

#### Scenario: Service startup on first use
- **WHEN** first AI edit is triggered
- **THEN** TypeScript service is spawned and ready to accept requests

#### Scenario: Service restart on crash
- **WHEN** TypeScript service exits unexpectedly
- **THEN** next AI edit request spawns a new service instance

#### Scenario: Service cleanup
- **WHEN** Neovim exits or plugin is unloaded
- **THEN** TypeScript service process is terminated gracefully

### Requirement: JSON-RPC Communication
The system SHALL use JSON-RPC over stdio for Lua-TypeScript IPC.

#### Scenario: Request-response matching
- **WHEN** Lua sends a request with id
- **THEN** TypeScript response includes matching id for correlation

#### Scenario: Concurrent request handling
- **WHEN** multiple AI edits are triggered in quick succession
- **THEN** requests are queued and processed in order with distinct ids

### Requirement: Request Timeout
The system SHALL enforce configurable timeouts for LLM requests.

#### Scenario: Request completes within timeout
- **WHEN** LLM responds before timeout (default 30s)
- **THEN** response is processed normally

#### Scenario: Request exceeds timeout
- **WHEN** LLM does not respond within timeout
- **THEN** request is cancelled and timeout error is shown to user

### Requirement: Response Extraction
The system SHALL extract edited code from LLM response for replacement.

#### Scenario: Valid response content
- **WHEN** LLM returns chat completion
- **THEN** `response.choices[0].message.content` is extracted as edited code

#### Scenario: Malformed response
- **WHEN** LLM response is missing expected fields
- **THEN** error is returned to Lua with details for debugging

