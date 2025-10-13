# Design: GitHub Copilot Provider

## Context
GitHub Copilot provides a GPT-4 compatible API at `https://api.githubcopilot.com/chat/completions`, but is not supported by the Vercel AI SDK. Users with Copilot subscriptions want to use this as an LLM provider. The gp.nvim plugin demonstrates this is feasible by extracting the OAuth token from the Copilot config file and calling the API directly.

The current nvim-redraft architecture uses Vercel AI SDK for all providers, which abstracts away the HTTP layer. To support Copilot (and future non-Vercel-supported providers), we need a parallel implementation path.

## Goals / Non-Goals

### Goals
- Support GitHub Copilot as an LLM provider with zero config changes (token auto-extracted)
- Maintain identical user-facing API to existing providers (same setup pattern, same usage)
- Create reusable pattern for other OpenAI-compatible providers not in Vercel AI SDK
- Preserve all existing provider functionality (streaming, error handling, logging, markdown stripping)

### Non-Goals
- Rewriting existing Vercel AI SDK providers to use the new pattern
- Supporting non-OpenAI-compatible APIs (e.g., custom streaming formats)
- Handling Copilot authentication/setup (users must have copilot.lua configured)
- Supporting Copilot features beyond chat completions (e.g., inline completions)

## Decisions

### 1. Dual Provider Architecture
**Decision**: Maintain both Vercel AI SDK providers and custom OpenAI-compatible providers side-by-side using the same `BaseLLMProvider` interface.

**Alternatives considered**:
- Migrate all providers to custom implementation: Too much risk, no benefit for providers that work well with Vercel AI SDK
- Fork Vercel AI SDK to add Copilot: Maintenance burden, doesn't help with future custom providers
- Use a separate plugin system: Overcomplicates user configuration

**Rationale**: 
- Existing providers continue using battle-tested Vercel AI SDK
- New pattern only used where Vercel SDK doesn't support the provider
- Both share the same base class, ensuring consistent behavior
- User sees no difference - same config, same commands, same experience

### 2. OpenAI-Compatible Base Class
**Decision**: Create `OpenAICompatibleProvider` abstract base class that implements streaming SSE parsing and OpenAI message format handling.

**Implementation approach**:
```typescript
abstract class OpenAICompatibleProvider extends BaseLLMProvider {
  protected abstract getEndpoint(): string;
  protected abstract getAuthHeaders(): Promise<Record<string, string>>;
  
  // Implements applyEdit using fetch + SSE streaming
  // Handles OpenAI message format conversion
  // Reuses base class logging, timing, markdown stripping
}
```

**Rationale**:
- Any OpenAI-compatible API (Copilot, LM Studio, local servers, etc.) can extend this class
- Only need to implement endpoint URL and auth headers
- Streaming, error handling, and formatting are handled generically

### 3. Token Extraction Strategy
**Decision**: Read token synchronously from `~/.config/github-copilot/apps.json` on first request, cache for session.

**File format** (based on gp.nvim):
```json
{
  "github.com": {
    "oauth_token": "ghu_xxxxxxxxxxxx"
  }
}
```

**Extraction logic**:
```typescript
const configPath = path.join(os.homedir(), '.config/github-copilot/apps.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
return config['github.com'].oauth_token;
```

**Error handling**:
- File not found → error: "Copilot not authenticated. Install and authenticate copilot.lua first."
- Invalid JSON → error: "Copilot config file is corrupted"
- Missing oauth_token → error: "Copilot config missing authentication token"

**Rationale**:
- Same approach as gp.nvim (proven to work)
- No environment variables needed (better UX)
- Fails fast with clear error messages
- Users who have copilot.lua already have this file

### 4. SSE Streaming Implementation
**Decision**: Implement Server-Sent Events parsing manually using Node.js streams.

**Key considerations**:
- OpenAI/Copilot stream format: `data: {"choices":[{"delta":{"content":"text"}}]}\n\n`
- Must handle partial chunks, reconnects, and `data: [DONE]` terminator
- Reuse existing logger for stream debugging

**Rationale**:
- Vercel AI SDK handles this internally, but we need it for custom providers
- Standard SSE format is well-documented and stable
- Can be tested independently with mocked responses

### 5. Default Model Selection
**Decision**: Use "gpt-4o" as the default model for Copilot provider.

**Rationale**:
- Same as gp.nvim (consistency)
- GPT-4o is the latest Copilot-supported model
- Users can override via config like any other provider

## Risks / Trade-offs

### Risk: Copilot API changes
**Likelihood**: Low (API is stable, used by many tools)  
**Impact**: High (provider stops working)  
**Mitigation**: 
- Clear error messages with API response details
- Monitor gp.nvim for updates (they'll hit issues first)
- Document the endpoint and format for community debugging

### Risk: Token extraction breaks across OS/setup variations
**Likelihood**: Medium (different copilot.lua versions, OS differences)  
**Impact**: Medium (provider doesn't initialize)  
**Mitigation**:
- Comprehensive error messages with file path and expected format
- Fallback to GITHUB_COPILOT_TOKEN env var (optional)
- Document exact prerequisites (copilot.lua version, auth method)

### Risk: Streaming implementation bugs
**Likelihood**: Medium (SSE parsing is tricky)  
**Impact**: High (broken UX)  
**Mitigation**:
- Extensive unit tests with real-world SSE data
- Reuse proven patterns from Vercel AI SDK where possible
- Log all stream chunks in debug mode

### Trade-off: Maintenance burden
- **Cost**: Must maintain custom HTTP/SSE code alongside Vercel AI SDK
- **Benefit**: Unlocks any OpenAI-compatible provider
- **Decision**: Worth it - opens up local models, custom endpoints, and removes vendor lock-in to Vercel's provider support

### Trade-off: Code duplication
- **Cost**: Some logic (message formatting, error handling) duplicated between Vercel and custom providers
- **Mitigation**: Abstract shared logic into base class methods where possible
- **Decision**: Acceptable - separation allows both approaches to evolve independently

## Migration Plan
N/A - This is a purely additive change. No migration required.

## Open Questions
None - all design decisions finalized based on gp.nvim reference implementation and requirements.
