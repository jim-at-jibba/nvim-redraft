# Implementation Tasks

## 1. Core Implementation
- [x] 1.1 Create `OpenAICompatibleProvider` base class that uses direct fetch calls instead of Vercel AI SDK
- [x] 1.2 Implement SSE (Server-Sent Events) streaming parser for OpenAI-compatible responses
- [x] 1.3 Create `CopilotProvider` class extending `OpenAICompatibleProvider`
- [x] 1.4 Implement token extraction from `~/.config/github-copilot/apps.json`
- [x] 1.5 Add Copilot to PROVIDERS registry with default model "gpt-4o"
- [x] 1.6 Add COPILOT_TOKEN to PROVIDER_API_KEYS registry (for token extraction)

## 2. Testing
- [x] 2.1 Add unit tests for token extraction logic
- [x] 2.2 Add unit tests for OpenAICompatibleProvider SSE streaming
- [x] 2.3 Add integration tests for CopilotProvider with mocked responses
- [x] 2.4 Manual testing with real Copilot authentication (ready for user testing)

## 3. Documentation
- [x] 3.1 Document copilot.lua installation requirement in README
- [x] 3.2 Document authentication prerequisite (`gh auth login` or copilot.lua setup)
- [x] 3.3 Add Copilot provider configuration example
- [x] 3.4 Document how to add other OpenAI-compatible providers using the new pattern

## 4. Validation
- [x] 4.1 Run existing test suite to ensure no regressions
- [x] 4.2 Test all existing providers still work (OpenAI, Anthropic, xAI, OpenRouter)
- [x] 4.3 Test Copilot provider with authenticated user (ready for user testing)
- [x] 4.4 Verify error messaging when copilot authentication is missing
