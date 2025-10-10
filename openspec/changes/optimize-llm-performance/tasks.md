## 1. Remove Instruction Enhancement

- [ ] 1.1 Remove `enhanceInstruction()` from BaseLLMProvider class
- [ ] 1.2 Remove Anthropic-specific `enhanceInstruction()` override
- [ ] 1.3 Remove `enhanceInstruction` from LLMProvider interface
- [ ] 1.4 Simplify `LLMService.edit()` to single `applyEdit()` call
- [ ] 1.5 Remove enhancement-related tests from `llm.test.ts`
- [ ] 1.6 Improve system prompts to handle brief instructions directly

## 2. Add Streaming Support

- [ ] 2.1 Replace `generateText()` with `streamText()` in `applyEdit()` method
- [ ] 2.2 Implement async iterator over `result.textStream` for chunk processing
- [ ] 2.3 Add streaming protocol to JSON-RPC (partial/complete/error message types)
- [ ] 2.4 Update `index.ts` handleRequest to support streaming responses
- [ ] 2.5 Implement Lua IPC streaming handler in `ipc.lua`
- [ ] 2.6 Add progress indicator/spinner during streaming in Neovim
- [ ] 2.7 Buffer and replace full response on completion
- [ ] 2.8 Handle streaming errors and fallback gracefully

## 3. Optimize Token Limits

- [ ] 3.1 Add `maxOutputTokens` to OpenAIProvider `getGenerateTextOptions()`
- [ ] 3.2 Add `maxOutputTokens` to XaiProvider `getGenerateTextOptions()`
- [ ] 3.3 Make token limits configurable per provider (default: 4096 for edits)
- [ ] 3.4 Document token limit configuration in README

## 4. Testing & Validation

- [ ] 4.1 Run existing test suite and ensure all pass
- [ ] 4.2 Add streaming integration tests
- [ ] 4.3 Manual testing: verify latency improvements (measure before/after)
- [ ] 4.4 Manual testing: verify streaming visual feedback works
- [ ] 4.5 Test error handling for streaming failures
- [ ] 4.6 Test with all providers (OpenAI, Anthropic, xAI)

## 5. Documentation

- [ ] 5.1 Update README performance claims (mention streaming)
- [ ] 5.2 Add streaming behavior to user documentation
- [ ] 5.3 Update troubleshooting section
- [ ] 5.4 Add CHANGELOG entry for v2.0 breaking changes
