## 1. Remove Instruction Enhancement

- [x] 1.1 Remove `enhanceInstruction()` from BaseLLMProvider class
- [x] 1.2 Remove Anthropic-specific `enhanceInstruction()` override
- [x] 1.3 Remove `enhanceInstruction` from LLMProvider interface
- [x] 1.4 Simplify `LLMService.edit()` to single `applyEdit()` call
- [x] 1.5 Remove enhancement-related tests from `llm.test.ts`
- [x] 1.6 Improve system prompts to handle brief instructions directly

## 2. Optimize Token Limits

- [x] 2.1 Add `maxTokens` to OpenAIProvider `getGenerateTextOptions()`
- [x] 2.2 Add `maxTokens` to XaiProvider `getGenerateTextOptions()`
- [x] 2.3 Add `maxTokens` to AnthropicProvider `getGenerateTextOptions()`
- [x] 2.4 Add `maxTokens` to GlmProvider `getGenerateTextOptions()`
- [x] 2.5 Make token limits configurable per provider (default: 4096 for edits)
- [x] 2.6 Document token limit configuration in README

## 3. Testing & Validation

- [x] 3.1 Run existing TypeScript test suite and ensure all pass
- [x] 3.2 Run existing Lua test suite and ensure all pass
- [x] 3.3 Manual testing with all providers (OpenAI, Anthropic, xAI, GLM)

## 4. Documentation

- [x] 4.1 Update README with max_output_tokens configuration option
- [x] 4.2 Commit changes to git

