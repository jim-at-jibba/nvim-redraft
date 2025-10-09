## Context

The current implementation has three provider classes that duplicate 85% of their code. The only differences are:
1. Provider SDK factory function (`createOpenAI` vs `createAnthropic` vs `createZhipu`)
2. Model type casting (GLM requires `as unknown as LanguageModel`)
3. Anthropic-specific parameters (`maxOutputTokens`, separate `system` field)

This refactoring aims to reduce maintenance burden while preserving all existing behavior.

## Goals / Non-Goals

**Goals:**
- Eliminate code duplication without changing behavior
- Make adding new providers simpler (implement 1-2 methods instead of full class)
- Centralize logging, error handling, and result processing

**Non-Goals:**
- Change public API or external interfaces
- Modify prompt content or LLM behavior
- Add new features or providers

## Decisions

### Decision: Use abstract base class pattern

**Why:** TypeScript abstract classes provide:
- Shared implementation in base class
- Enforced contracts via abstract methods
- Type safety and IDE support
- Clear extension points

**Alternatives considered:**
- Composition with helper functions → Less cohesive, harder to discover shared behavior
- Template method pattern with callbacks → More complex, less type-safe

### Decision: Single `createProviderInstance()` abstract method

**Why:** The only truly provider-specific code is SDK initialization. Everything else (messages, logging, parsing) is identical.

**Alternatives considered:**
- Separate abstract methods for `enhanceInstruction` and `applyEdit` → More boilerplate, defeats purpose
- Configuration objects → Over-engineered for 3 providers

### Decision: Optional `getGenerateTextOptions()` hook

**Why:** Anthropic needs `maxOutputTokens` and handles `system` differently. Rather than force all providers to implement both methods, provide override hook.

**Pattern:**
```typescript
protected getGenerateTextOptions(
  method: 'enhance' | 'apply',
  systemPrompt?: string
): Record<string, any> {
  return {}; // Base: no extra options
}
```

Anthropic overrides to return `{ maxOutputTokens: 1024 | 4096 }`.

## Risks / Trade-offs

**Risk:** Harder to customize individual provider behavior  
→ **Mitigation:** Provide override hooks; if providers diverge significantly, can split out later

**Risk:** Type casting issues (GLM's `as unknown as LanguageModel`)  
→ **Mitigation:** Keep casting in subclass's `createProviderInstance()`

**Trade-off:** Slight abstraction overhead vs. significant duplication reduction  
→ **Accepted:** 85% duplication removal justifies minimal abstraction

## Migration Plan

1. Create `BaseLLMProvider` abstract class
2. Migrate `OpenAIProvider` first (simplest case)
3. Test OpenAI thoroughly
4. Migrate `GLMProvider` (handle type casting)
5. Migrate `AnthropicProvider` last (most special cases)
6. Run full test suite
7. No user-facing changes; internal refactor only

**Rollback:** Simple - revert to previous commit. No external API changes.

## Open Questions

None - scope is clear and implementation path is straightforward.
