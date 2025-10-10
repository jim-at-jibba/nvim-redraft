## 1. Implementation
- [x] 1.1 Install `ollama-ai-provider-v2` npm package
- [x] 1.2 Create OllamaProvider class extending BaseLLMProvider
- [x] 1.3 Add Ollama to PROVIDERS registry
- [x] 1.4 Add OLLAMA_API_KEY (optional) to PROVIDER_API_KEYS
- [x] 1.5 Add default model to DEFAULT_MODELS
- [x] 1.6 Update createProvider to accept baseURL for Ollama
- [x] 1.7 Update index.ts to pass baseURL to createProvider
- [x] 1.8 Write test for Ollama provider initialization
- [x] 1.9 Update documentation with Ollama setup instructions

## 2. Validation
- [x] 2.1 Run `npm test` in ts/ directory
- [x] 2.2 Test with local Ollama instance
- [x] 2.3 Verify custom base URL configuration works
- [x] 2.4 Verify default model fallback works
