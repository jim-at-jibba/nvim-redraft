# Add GitHub Copilot Provider

## Why
GitHub Copilot is not supported by the Vercel AI SDK, but provides users with essentially unlimited GPT-4 access through their Copilot subscription. Users who already have copilot.lua installed and authenticated should be able to use it as a provider without additional configuration changes to the existing provider setup pattern.

## What Changes
- Add GitHub Copilot as an LLM provider using a custom OpenAI-compatible implementation
- Extract OAuth token from `~/.config/github-copilot/apps.json` automatically
- Implement a generic "OpenAI-compatible" provider pattern that can be reused for future non-Vercel-AI-SDK providers
- Maintain identical user-facing API - no changes to how providers are configured or used
- Document requirement for copilot.lua installation and authentication

## Impact
- Affected specs: ai-llm-integration, user-configuration
- Affected code: ts/src/llm.ts (new CopilotProvider class and generic OpenAI-compatible base class)
- New pattern: Creates foundation for adding other OpenAI-compatible providers not supported by Vercel AI SDK (e.g., local LLM servers, custom endpoints)
- No breaking changes - existing providers continue to work unchanged
