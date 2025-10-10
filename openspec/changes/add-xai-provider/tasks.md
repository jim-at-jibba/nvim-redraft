## 1. Implementation
- [x] 1.1 Add `@ai-sdk/xai` package dependency to `ts/package.json`
- [x] 1.2 Create `XaiProvider` class extending `BaseLLMProvider` in `ts/src/llm.ts`
- [x] 1.3 Register xAI in `PROVIDERS` registry
- [x] 1.4 Add `XAI_API_KEY` to `PROVIDER_API_KEYS` registry
- [x] 1.5 Add `grok-4-fast-non-reasoning` to `DEFAULT_MODELS` registry
- [x] 1.6 Update API key validation logic in `ts/src/index.ts` to handle xAI provider
- [x] 1.7 Add tests for xAI provider in `ts/src/__tests__/llm.test.ts`

## 2. Validation
- [x] 2.1 Run `npm test` to verify all tests pass
- [x] 2.2 Run `npm run build` to ensure TypeScript compilation succeeds
