## MODIFIED Requirements

### Requirement: MorphLLM API Integration
The system SHALL communicate with LLM providers using the Vercel AI SDK unified interface via TypeScript service with a single-pass streaming approach, using shared implementation logic in a base provider class to eliminate code duplication.

#### Scenario: Direct instruction usage with OpenAI
- **WHEN** user instruction and code are sent to TypeScript service with OpenAI provider configured
- **THEN** instruction is sent directly to the LLM using Vercel AI SDK's `streamText()` function without enhancement preprocessing

#### Scenario: Direct instruction usage with Anthropic
- **WHEN** user instruction and code are sent to TypeScript service with Anthropic provider configured
- **THEN** instruction is sent directly to the LLM using Vercel AI SDK's `streamText()` function without enhancement preprocessing

#### Scenario: Direct instruction usage with xAI
- **WHEN** user instruction and code are sent to TypeScript service with xAI provider configured
- **THEN** instruction is sent directly to the LLM using Vercel AI SDK's `streamText()` function without enhancement preprocessing

#### Scenario: Streaming response chunks
- **WHEN** LLM generates code via `streamText()`
- **THEN** text chunks are streamed back to Neovim via JSON-RPC as they arrive, with response buffered for final replacement

#### Scenario: System prompt handles brief instructions
- **WHEN** user provides brief instruction like "add docs" or "refactor"
- **THEN** system prompt guides LLM to interpret brief instructions using code context

#### Scenario: Base provider class eliminates duplication
- **WHEN** a new provider is added to the system
- **THEN** the provider implementation extends `BaseLLMProvider` and only implements provider-specific initialization logic (approximately 15-20 lines vs 150+ lines per provider)

#### Scenario: Shared streaming and error handling
- **WHEN** any provider processes a request
- **THEN** streaming, logging, timing, error handling, and markdown stripping are handled by shared base class methods

### Requirement: Response Extraction
The system SHALL extract edited code from Vercel AI SDK streaming response for replacement.

#### Scenario: Valid streaming response content
- **WHEN** LLM returns completion chunks via Vercel AI SDK `streamText()`
- **THEN** chunks are buffered and complete text is extracted as edited code

#### Scenario: Streaming progress feedback
- **WHEN** LLM streams response chunks
- **THEN** Neovim displays progress indicator or partial results to user

#### Scenario: Malformed streaming response
- **WHEN** Vercel AI SDK streaming response encounters an error
- **THEN** error is returned to Lua with details for debugging and partial results are discarded

## REMOVED Requirements

### Requirement: Two-Step Instruction Enhancement
**Reason**: Redundant overhead - modern LLMs handle brief instructions with code context directly. Doubles latency and token costs without measurable quality improvement.

**Migration**: No user action required. Enhancement step is removed internally. Users continue providing instructions as before (brief or detailed both work).

#### Scenario: Instruction enhancement preprocessing
- **WHEN** user provides brief instruction
- **THEN** instruction is expanded into detailed sentence before code editing
  
#### Scenario: Enhanced instruction forwarding
- **WHEN** instruction enhancement completes
- **THEN** enhanced instruction is used for code editing step

## ADDED Requirements

### Requirement: Output Token Limits
The system SHALL enforce configurable maximum output token limits per provider to optimize response generation speed.

#### Scenario: Default token limits per provider
- **WHEN** user does not specify custom token limits
- **THEN** OpenAI uses 4096 max output tokens, Anthropic uses 4096, xAI uses 4096

#### Scenario: Custom token limit configuration
- **WHEN** user sets `llm.max_output_tokens` in configuration
- **THEN** requests use specified token limit via Vercel AI SDK

#### Scenario: Token limit prevents over-generation
- **WHEN** LLM reaches max output tokens during generation
- **THEN** generation stops gracefully and buffered response is returned
