## 1. Implementation

- [x] 1.1 Create `BaseLLMProvider` abstract class with shared `enhanceInstruction` implementation
- [x] 1.2 Move `applyEdit` shared logic to `BaseLLMProvider`
- [x] 1.3 Move `stripMarkdown` method to `BaseLLMProvider`
- [x] 1.4 Add abstract `createProviderInstance()` method for subclasses to implement
- [x] 1.5 Add overridable `getGenerateTextOptions()` hook for provider-specific options
- [x] 1.6 Refactor `OpenAIProvider` to extend `BaseLLMProvider` (remove duplicates)
- [x] 1.7 Refactor `GLMProvider` to extend `BaseLLMProvider` (remove duplicates)
- [x] 1.8 Refactor `AnthropicProvider` to extend `BaseLLMProvider` (handle `maxOutputTokens` and `system` parameter)

## 2. Testing

- [x] 2.1 Run existing tests to verify no behavior changes
- [x] 2.2 Verify OpenAI provider still works correctly
- [x] 2.3 Verify Anthropic provider still works correctly
- [x] 2.4 Verify GLM provider still works correctly

## 3. Validation

- [x] 3.1 Run TypeScript compiler (`npm run build` or `tsc`)
- [x] 3.2 Run linter if available (`npm run lint`)
- [x] 3.3 Validate OpenSpec change with `openspec validate refactor-provider-duplication --strict`
