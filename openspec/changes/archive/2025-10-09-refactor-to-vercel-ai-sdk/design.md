## Context

The current LLM integration uses individual provider SDKs:
- OpenAI SDK for OpenAI models
- Anthropic SDK for Claude models  
- OpenAI SDK (with custom baseURL) for GLM models

This approach requires:
- Maintaining separate client initialization logic per provider
- Different API patterns for each provider (OpenAI uses `chat.completions.create`, Anthropic uses `messages.create`)
- Manual handling of response format differences
- More complex code when adding new providers

The Vercel AI SDK (https://ai-sdk.dev) provides:
- Unified interface via `generateText()` function
- Consistent API across all providers
- Built-in streaming support (for future use)
- Provider-specific packages (`@ai-sdk/openai`, `@ai-sdk/anthropic`, etc.)
- Same level of type safety with better ergonomics

## Goals / Non-Goals

**Goals:**
- Replace provider SDKs with Vercel AI SDK while maintaining exact same functionality
- Simplify provider implementation code
- Make it easier to add new providers in the future
- Keep all existing configuration, environment variables, and user-facing behavior identical

**Non-Goals:**
- Add new LLM providers beyond what currently exists (except removing GLM if unsupported)
- Change any user-facing behavior or configuration options
- Add streaming support (defer to future change)
- Modify prompt formats or system messages
- Change error handling behavior

## Decisions

### Decision: Use Vercel AI SDK's `generateText` function
**Why:** Provides unified interface across all providers with consistent options and response format.

**Alternatives considered:**
- Keep individual SDKs: Rejected because it maintains current complexity
- Use LangChain: Rejected because it's heavier and adds unnecessary abstraction for our use case

### Decision: Use provider-specific packages from Vercel AI SDK
**Why:** Vercel AI SDK splits providers into separate packages (`@ai-sdk/openai`, `@ai-sdk/anthropic`), allowing tree-shaking and smaller bundle sizes.

**Implementation:**
```typescript
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

const result = await generateText({
  model: openai('gpt-4o-mini'),
  messages: [...],
});
```

### Decision: Use community zhipu-ai-provider package for GLM
**Why:** GLM support is available via the `zhipu-ai-provider` community package for Vercel AI SDK. This maintains all three providers while achieving unified SDK architecture.

**Package:** `zhipu-ai-provider` (https://github.com/Xiang-CH/zhipu-ai-provider)
- Officially published npm package
- Supports GLM-4+ models including glm-4.5-airx
- Uses same Vercel AI SDK patterns as official providers
- Apache 2.0 licensed

**Implementation:**
```typescript
import { zhipu } from 'zhipu-ai-provider';
import { generateText } from 'ai';

const result = await generateText({
  model: zhipu('glm-4.5-airx'),
  messages: [...],
});
```

### Decision: Maintain `LLMProvider` interface
**Why:** Keep the abstraction layer that wraps Vercel AI SDK, allowing us to add custom logic (markdown stripping, logging, etc.) consistently.

**Trade-off:** Adds one layer of indirection but maintains clean separation of concerns.

### Decision: Keep same prompt structure and system messages
**Why:** Current prompts work well; changing them is out of scope for SDK migration.

## Implementation Details

### Provider Structure
Each provider class will:
1. Initialize with API key and model name
2. Use Vercel AI SDK's `generateText` function for both `enhanceInstruction` and `applyEdit`
3. Maintain existing markdown stripping logic
4. Preserve logging calls with same granularity

### Error Handling
Vercel AI SDK throws different error types:
- API errors (rate limits, auth failures)
- Network errors
- Validation errors

We'll wrap these in our existing error format to maintain consistent error messages.

### Response Format Mapping
**Current:**
- OpenAI: `response.choices[0].message.content`
- Anthropic: `response.content[0].text`

**New (Vercel AI SDK):**
- All providers: `result.text`

This simplification is a major benefit of the unified SDK.

## Risks / Trade-offs

**Risk:** Vercel AI SDK might not support all options we need
**Mitigation:** Review SDK docs thoroughly in task 1.1; SDK is mature and widely used

**Risk:** Performance differences between SDKs
**Mitigation:** Vercel AI SDK is a thin wrapper; performance should be equivalent

**Risk:** Breaking changes in Vercel AI SDK updates
**Mitigation:** Pin specific version in package.json; review release notes before upgrading

**Trade-off:** Adding dependency on Vercel AI SDK
**Benefit:** Reduced overall dependencies (removes 2 SDKs, adds 4 smaller packages), simpler code

**Trade-off:** Using community package for GLM
**Benefit:** Maintains GLM support while unifying on Vercel AI SDK architecture; package is maintained and has Apache 2.0 license

## Migration Plan

1. Install new dependencies alongside old ones
2. Refactor providers one at a time
3. Run tests after each provider migration
4. Once all providers work, remove old dependencies
5. Final test suite run and build verification

**Rollback:** If issues arise, previous code is in git history; revert commit and restore old dependencies.

## API Mapping Reference

### Package Imports
**Before:**
```typescript
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
```

**After:**
```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { zhipu } from 'zhipu-ai-provider';
```

### Client Initialization
**Before:**
```typescript
// OpenAI
this.client = new OpenAI({ apiKey });

// Anthropic
this.client = new Anthropic({ apiKey });

// GLM (via OpenAI SDK)
this.client = new OpenAI({
  apiKey,
  baseURL: 'https://open.bigmodel.cn/api/paas/v4'
});
```

**After:**
```typescript
// All providers use the same pattern
// API key passed via environment variable or config
// No client initialization needed
```

### API Calls
**Before:**
```typescript
// OpenAI
const response = await this.client.chat.completions.create({
  model: this.model,
  messages: [...],
  temperature: 0.3
});
const text = response.choices[0].message.content;

// Anthropic
const response = await this.client.messages.create({
  model: this.model,
  messages: [...],
  max_tokens: 4096,
  temperature: 0.3
});
const text = response.content[0].text;

// GLM (same as OpenAI)
```

**After:**
```typescript
// All providers
const result = await generateText({
  model: openai('gpt-4o-mini'),  // or anthropic(...) or zhipu(...)
  messages: [...],
  temperature: 0.3,
  maxTokens: 4096  // optional, reasonable defaults
});
const text = result.text;
```

### Environment Variables
**No change - same variables:**
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `ZHIPU_API_KEY` (GLM)

### Model Names
**No change:**
- OpenAI: `gpt-4o-mini`
- Anthropic: `claude-3-5-sonnet-20241022`
- GLM: `glm-4.5-airx`

## Open Questions

**Q: Does Vercel AI SDK support custom base URLs for OpenAI-compatible providers?**
**A:** Not needed - using dedicated `zhipu-ai-provider` package instead.

**Q: Are there any rate limit or retry helpers in Vercel AI SDK we should leverage?**
**A:** Vercel AI SDK has built-in retry logic; review during implementation for potential enhancements.
