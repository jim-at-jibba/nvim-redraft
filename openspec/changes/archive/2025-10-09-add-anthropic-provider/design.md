## Context
The plugin currently supports only OpenAI as an LLM provider. Users want the flexibility to choose between OpenAI and Anthropic (Claude models), which have different pricing, rate limits, and capabilities. Additionally, new LLM providers are emerging regularly, so the architecture must make it easy to add support for future providers without significant refactoring.

## Goals
- Support both OpenAI and Anthropic as LLM providers
- Allow users to select provider and model via configuration
- Maintain backward compatibility with existing OpenAI-only setups
- **Design an extensible provider architecture that makes adding new providers straightforward**
- Minimize code changes needed when adding a new provider (ideally just implementing interface + adding to registry)

## Non-Goals
- Supporting other providers (e.g., Google, Cohere) in this change
- Automatic provider switching or fallback mechanisms
- Provider-specific prompt optimization (use same prompts for both)

## Decisions

### Provider Abstraction Pattern
Use an interface-based approach with a provider registry:
```typescript
interface LLMProvider {
  enhanceInstruction(code: string, instruction: string): Promise<string>;
  applyEdit(code: string, instruction: string, systemPrompt?: string): Promise<string>;
}

class OpenAIProvider implements LLMProvider { ... }
class AnthropicProvider implements LLMProvider { ... }

// Provider registry for extensibility
const PROVIDERS: Record<string, (apiKey: string, model: string) => LLMProvider> = {
  openai: (apiKey, model) => new OpenAIProvider(apiKey, model),
  anthropic: (apiKey, model) => new AnthropicProvider(apiKey, model),
  // Future providers added here with one line
};

function createProvider(provider: string, apiKey: string, model: string): LLMProvider {
  const factory = PROVIDERS[provider];
  if (!factory) {
    throw new Error(`Unknown provider: ${provider}`);
  }
  return factory(apiKey, model);
}
```

**Why:** The interface defines the contract all providers must implement. The registry maps provider names to factory functions, making it trivial to add new providers (implement interface + add one line to registry). This scales well as new providers emerge.

**Benefits for future extensibility:**
- Adding a new provider requires: (1) implementing the `LLMProvider` interface, (2) adding one entry to the registry
- No changes to core service logic or configuration handling
- Provider-specific logic is fully encapsulated in each provider class
- Easy to test providers in isolation

**Alternatives considered:**
- Hard-coded switch statement: Requires modifying service logic for each new provider (poor extensibility)
- Dynamic plugin system with external providers: Unnecessary complexity for built-in providers; overkill for current needs

### Configuration Schema
Add `provider` field to `llm` config:
```lua
llm = {
  provider = "openai",  -- or "anthropic"
  model = "gpt-4o-mini",
  timeout = 30000,
}
```

**Why:** Simple, flat structure that matches existing config style. Provider and model are at the same level since model selection depends on provider.

**Alternatives considered:**
- Nested provider-specific configs: More flexible but harder to validate and document
- Separate `openai_model` and `anthropic_model` fields: Clutters config with unused fields

### API Key Handling
Use a convention-based approach with a registry mapping provider names to environment variable names:
```typescript
const PROVIDER_API_KEYS: Record<string, string> = {
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  // Future providers add their env var here
};

function getApiKey(provider: string): string {
  const envVar = PROVIDER_API_KEYS[provider];
  if (!envVar) {
    throw new Error(`Unknown provider: ${provider}`);
  }
  const apiKey = process.env[envVar];
  if (!apiKey) {
    throw new Error(`${envVar} environment variable is required for provider '${provider}'`);
  }
  return apiKey;
}
```

**Why:** Follows each provider's standard environment variable convention. The registry makes it easy to add new providers' API key requirements. Clear error messages guide users to set the correct key.

**Benefits for future extensibility:**
- New providers just add one line to `PROVIDER_API_KEYS` registry
- Automatic validation and error messages for any provider

**Alternatives considered:**
- Generic `LLM_API_KEY` variable: Confusing when users have both keys and want to switch providers
- Config-based API keys: Security risk (keys in dotfiles)

### Default Models
Use a registry for provider-specific defaults:
```typescript
const DEFAULT_MODELS: Record<string, string> = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-5-sonnet-20241022',
  // Future providers add their default model here
};

function getDefaultModel(provider: string): string {
  return DEFAULT_MODELS[provider] || '';
}
```

**Why:** Each provider has different model naming schemes. The registry centralizes defaults and makes it easy to add new providers with one line.

**Benefits for future extensibility:**
- New providers just add one line to `DEFAULT_MODELS` registry
- Consistent pattern across all provider-specific configuration

## Risks / Trade-offs

**Risk:** Anthropic and OpenAI may format responses differently, requiring provider-specific post-processing.
**Mitigation:** Test both providers with identical prompts. If issues arise, add provider-specific markdown stripping logic within each provider class (encapsulated).

**Risk:** API rate limits and error codes differ between providers.
**Mitigation:** Current error handling is generic (captures all errors as strings). This should work for both providers. Improve error messages if users report issues. Provider-specific error handling can be added within each provider class without affecting the interface.

**Trade-off:** Adding `@anthropic-ai/sdk` increases bundle size.
**Justification:** Negligible impact (~50KB). Users explicitly opt into Anthropic by configuring it.

**Trade-off:** Registry-based architecture adds slight indirection vs. hard-coded logic.
**Justification:** The indirection is minimal (one registry lookup) and provides significant extensibility benefits. Adding a new provider becomes a 5-minute task instead of requiring refactoring.

## Extensibility Example

To add a new provider (e.g., Google Gemini) after this change, a developer would:

1. Create a new provider class implementing `LLMProvider` interface (~50-100 lines):
   ```typescript
   class GeminiProvider implements LLMProvider {
     constructor(apiKey: string, model: string) { ... }
     async enhanceInstruction(...) { ... }
     async applyEdit(...) { ... }
   }
   ```

2. Add three one-line registry entries:
   ```typescript
   // In PROVIDERS registry
   gemini: (apiKey, model) => new GeminiProvider(apiKey, model),
   
   // In PROVIDER_API_KEYS registry
   gemini: 'GEMINI_API_KEY',
   
   // In DEFAULT_MODELS registry
   gemini: 'gemini-pro',
   ```

3. Update Lua validation to accept "gemini" as valid provider value (one line)

That's it. No changes to service initialization, request handling, or configuration logic.

## Migration Plan

1. **Backward Compatibility:** Default to `provider = "openai"` if not specified. Existing configs work unchanged.
2. **Upgrade Path:** Users add `provider = "anthropic"` to config and set `ANTHROPIC_API_KEY` environment variable.
3. **Rollback:** Remove `provider` field from config to revert to OpenAI-only behavior.

No data migration or breaking changes required.

## Open Questions

None. Design is straightforward and aligns with existing patterns.
