# LLM Performance Optimization - Implementation Plan

## Overview

This change eliminates the redundant instruction enhancement step and adds streaming support to achieve 50% latency reduction and significantly improve user experience.

## Key Metrics

**Before:**
- Latency: 3-5 seconds (2 sequential LLM calls)
- Token usage: 2000-5000 tokens
- User feedback: None until completion

**After:**
- Latency: 1.5-2.5 seconds (1 LLM call)
- Token usage: 1000-2500 tokens
- User feedback: <500ms to first chunk

## Implementation Phases

### Phase 1: Remove Enhancement (ts/src/llm.ts)
**Goal**: Eliminate the `enhanceInstruction()` step

**Changes:**
1. Delete `enhanceInstruction()` from `BaseLLMProvider` (lines 56-108)
2. Delete Anthropic override (lines 197-251)
3. Remove from `LLMProvider` interface (line 23)
4. Simplify `LLMService.edit()` to call `applyEdit()` directly (line 389-392)
5. Enhance system prompts to handle brief instructions (lines 123-124, 189-190)

**Risk**: Low - modern LLMs handle brief instructions well

### Phase 2: Add Streaming (ts/src/llm.ts)
**Goal**: Provide progressive feedback to users

**Changes:**
1. Import `streamText` from 'ai' SDK
2. Replace `generateText()` with `streamText()` in `applyEdit()`
3. Implement async iteration over `result.textStream`
4. Buffer chunks and return complete text
5. Update JSON-RPC protocol for streaming (ts/src/index.ts)
6. Implement Lua streaming handler (lua/nvim-redraft/ipc.lua)

**Risk**: Medium - requires protocol changes, but maintains backward compatibility via buffering

### Phase 3: Token Optimization (ts/src/llm.ts)
**Goal**: Prevent over-generation, improve speed

**Changes:**
1. Add `maxOutputTokens: 4096` to OpenAIProvider `getGenerateTextOptions()`
2. Add `maxOutputTokens: 4096` to XaiProvider `getGenerateTextOptions()`
3. Already implemented in AnthropicProvider ✓

**Risk**: Low - only adds limits, doesn't change behavior

### Phase 4: Testing & Documentation
**Goal**: Ensure quality and communicate changes

**Changes:**
1. Remove enhancement tests from `llm.test.ts`
2. Add streaming integration tests
3. Manual performance testing
4. Update README with new performance claims
5. Add CHANGELOG for v2.0

**Risk**: Low - standard quality assurance

## Files Modified

### Core Changes
- `ts/src/llm.ts` - Remove enhancement, add streaming, optimize tokens
- `ts/src/index.ts` - Update JSON-RPC for streaming
- `ts/src/__tests__/llm.test.ts` - Remove enhancement tests

### Lua Changes
- `lua/nvim-redraft/ipc.lua` - Handle streaming responses
- `lua/nvim-redraft/spinner.lua` - Already exists for progress indication ✓

### Documentation
- `README.md` - Update performance claims, add streaming docs
- `CHANGELOG.md` - Add v2.0 breaking changes

## Testing Strategy

### Unit Tests
- [x] Existing tests for provider system
- [ ] Remove enhancement test assertions
- [ ] Add streaming buffer tests

### Integration Tests
- [ ] Test streaming with all providers (OpenAI, Anthropic, xAI)
- [ ] Test error handling during streaming
- [ ] Test timeout during streaming

### Manual Testing
- [ ] Measure latency before/after (use `logger` timestamps)
- [ ] Verify streaming visual feedback in Neovim
- [ ] Test with various instruction lengths (brief vs detailed)
- [ ] Test with different code sizes (small/medium/large)

## Success Criteria

✅ **Performance**
- Latency reduced by 40-50% (measured via logger timestamps)
- Token usage reduced by 40-50% (visible in debug logs)

✅ **UX**
- First chunk arrives <500ms (streaming progress visible)
- Final result quality unchanged or improved

✅ **Quality**
- All existing tests pass
- No regressions in edit accuracy
- Error handling maintains robustness

## Rollback Plan

If issues arise:
1. Revert to git tag `v1.x.x` (before this change)
2. Users can downgrade via package manager
3. No data migration needed (stateless plugin)

## Timeline Estimate

- Phase 1 (Remove Enhancement): 2-3 hours
- Phase 2 (Add Streaming): 4-6 hours
- Phase 3 (Token Optimization): 1 hour
- Phase 4 (Testing & Docs): 2-3 hours

**Total**: 1-2 days of focused development

## Next Steps

1. ✅ Create OpenSpec proposal (DONE)
2. ✅ Validate proposal (DONE)
3. ⏭️ **Implement Phase 1**: Remove enhancement step
4. ⏭️ **Implement Phase 2**: Add streaming support
5. ⏭️ **Implement Phase 3**: Token optimization
6. ⏭️ **Test & Document**: Comprehensive validation
7. ⏭️ **Archive**: Move to `openspec/changes/archive/` after deployment

## Questions for Review

- Should we add a feature flag for streaming (on/off)? 
  - **Recommendation**: No - streaming is strictly better, adds complexity
  
- Should we support progressive line-by-line replacement or buffer-then-replace?
  - **Recommendation**: Buffer-then-replace initially (simpler, safer)
  
- What should the progress indicator show? Spinner, percentage, chunk count?
  - **Recommendation**: Use existing spinner (already implemented in `lua/nvim-redraft/spinner.lua`)

- Should we add telemetry to measure actual performance improvements?
  - **Recommendation**: Yes - add optional anonymous timing metrics (opt-in)
