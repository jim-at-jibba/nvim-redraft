# Implementation Tasks

## 1. TypeScript AI Service Setup
- [x] 1.1 Initialize Node.js/TypeScript project with package.json
- [x] 1.2 Install Vercel AI SDK and OpenAI client dependencies
- [x] 1.3 Create AI service module with MorphLLM integration
- [x] 1.4 Implement stdio-based JSON-RPC interface for Lua communication
- [x] 1.5 Add environment variable validation for MORPH_API_KEY

## 2. Lua Core Implementation
- [x] 2.1 Create visual selection capture module
- [x] 2.2 Create input prompt UI module using vim.ui.input
- [x] 2.3 Create IPC module for spawning and communicating with TypeScript service
- [x] 2.4 Create inline replacement module for applying AI edits
- [x] 2.5 Wire up main plugin flow: selection → prompt → LLM → replace

## 3. Configuration System
- [x] 3.1 Define configuration schema with system_prompt and keybindings
- [x] 3.2 Implement setup() function with config merging
- [x] 3.3 Add default system prompt for code editing
- [x] 3.4 Add keybinding registration in visual mode

## 4. Testing and Validation
- [x] 4.1 Write unit tests for selection capture
- [x] 4.2 Write integration tests for IPC communication
- [x] 4.3 Manual testing with real MorphLLM API
- [x] 4.4 Run existing lint/test workflows (Stylua, plenary)
- [x] 4.5 Update README with usage instructions and configuration examples

## 5. Documentation
- [x] 5.1 Document required environment variables
- [x] 5.2 Document configuration options
- [x] 5.3 Document keybinding customization
- [x] 5.4 Add troubleshooting section for common issues
