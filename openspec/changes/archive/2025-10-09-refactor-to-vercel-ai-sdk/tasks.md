## 1. Research and Planning
- [x] 1.1 Review Vercel AI SDK documentation for OpenAI and Anthropic providers
- [x] 1.2 Verify GLM provider availability in Vercel AI SDK (use `zhipu-ai-provider` package)
- [x] 1.3 Identify API differences between current SDKs and Vercel AI SDK

## 2. Update Dependencies
- [ ] 2.1 Install Vercel AI SDK core package (`ai`)
- [ ] 2.2 Install provider-specific packages (`@ai-sdk/openai`, `@ai-sdk/anthropic`, `zhipu-ai-provider`)
- [ ] 2.3 Remove old SDK dependencies (`openai`, `@anthropic-ai/sdk`)
- [ ] 2.4 Run `npm install` to update lockfile

## 3. Refactor Provider Implementations
- [ ] 3.1 Update OpenAIProvider to use Vercel AI SDK
  - [ ] 3.1.1 Replace OpenAI client initialization
  - [ ] 3.1.2 Update `enhanceInstruction` method to use Vercel AI SDK API
  - [ ] 3.1.3 Update `applyEdit` method to use Vercel AI SDK API
  - [ ] 3.1.4 Ensure markdown stripping logic remains intact
- [ ] 3.2 Update AnthropicProvider to use Vercel AI SDK
  - [ ] 3.2.1 Replace Anthropic client initialization
  - [ ] 3.2.2 Update `enhanceInstruction` method to use Vercel AI SDK API
  - [ ] 3.2.3 Update `applyEdit` method to use Vercel AI SDK API
  - [ ] 3.2.4 Ensure markdown stripping logic remains intact
- [ ] 3.3 Update GLMProvider to use `zhipu-ai-provider`
  - [ ] 3.3.1 Replace OpenAI client with zhipu provider
  - [ ] 3.3.2 Update `enhanceInstruction` method to use Vercel AI SDK API
  - [ ] 3.3.3 Update `applyEdit` method to use Vercel AI SDK API
  - [ ] 3.3.4 Update API key environment variable to `ZHIPU_API_KEY`
  - [ ] 3.3.5 Ensure markdown stripping logic remains intact

## 4. Update Tests
- [ ] 4.1 Update unit tests in `llm.test.ts` to match new implementation
- [ ] 4.2 Verify all existing test cases still pass
- [ ] 4.3 Add any new test cases if needed for Vercel AI SDK specifics
- [ ] 4.4 Run full test suite: `npm test`

## 5. Verification
- [ ] 5.1 Build TypeScript: `npm run build`
- [ ] 5.2 Verify no TypeScript compilation errors
- [ ] 5.3 Manual testing with OpenAI provider
- [ ] 5.4 Manual testing with Anthropic provider
- [ ] 5.5 Verify error handling works correctly
- [ ] 5.6 Verify logging output matches expectations

## 6. Documentation
- [ ] 6.1 Update code comments to reflect Vercel AI SDK usage
- [ ] 6.2 Update LLMProvider interface documentation if needed
- [ ] 6.3 Update provider addition instructions in comments
