# nvim-redraft

A Neovim plugin for AI-powered inline code editing with support for multiple LLM providers (OpenAI, Anthropic, xAI).

https://github.com/user-attachments/assets/4124e8e5-27ce-4628-b005-e0d7b65a1392

## Features

- Select code in visual mode and apply AI edits inline
- No confirmation dialogs - seamless editing experience
- Switch between multiple LLM providers and models on the fly
- Customizable system prompts and keybindings
- Built with Lua and TypeScript for optimal performance

## Installation

### Prerequisites

- Neovim >= 0.8.0
- Node.js >= 18.0.0
- [Snacks.nvim](https://github.com/folke/snacks.nvim) with input support
- API key for at least one supported provider ([OpenAI](https://platform.openai.com/api-keys), [Anthropic](https://console.anthropic.com/), [xAI](https://console.x.ai/))

### lazy.nvim

```lua
{
  "jim-at-jibba/nvim-redraft",
  dependencies = {
    { "folke/snacks.nvim", opts = { input = {}, picker = {} } },
  },
  event = "VeryLazy",
  build = "cd ts && npm install && npm run build",
  opts = {
    -- See Configuration section for options
  },
}
```

### packer.nvim

```lua
use {
  "folke/snacks.nvim",
  config = function()
    require("snacks").setup({ input = {} })
  end,
}

use {
  "jim-at-jibba/nvim-redraft",
  requires = { "folke/snacks.nvim" },
  config = function()
    require("nvim-redraft").setup()
  end,
  run = "cd ts && npm install && npm run build",
}
```

## Quick Start

1. Set your API key(s) in your shell profile:

```bash
export OPENAI_API_KEY="your-openai-api-key"
export ANTHROPIC_API_KEY="your-anthropic-api-key"
export XAI_API_KEY="your-xai-api-key"
```

2. Select code in visual mode (`v`, `V`, or `Ctrl-v`)
3. Press `<leader>ae` and enter your instruction
4. The AI applies changes inline

### Example

Select this code:

```javascript
function add(a, b) {
  return a + b
}
```

Press `<leader>ae` and type: "add JSDoc comments"

Result:

```javascript
/**
 * Adds two numbers together
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Sum of a and b
 */
function add(a, b) {
  return a + b
}
```

## Configuration

### Multiple Models (Recommended)

Configure multiple provider/model combinations and switch between them with `<leader>am`:

```lua
require("nvim-redraft").setup({
  llm = {
    models = {
      { provider = "openai", model = "gpt-4o-mini", label = "GPT-4o Mini" },
      { provider = "openai", model = "gpt-4o", label = "GPT-4o" },
      { provider = "anthropic", model = "claude-3-5-sonnet-20241022", label = "Claude 3.5 Sonnet" },
      { provider = "xai", model = "grok-4-fast-non-reasoning", label = "Grok 4 Fast" },
    },
    default_model_index = 1,
  },
})
```

The `label` field is optional - defaults to `"provider: model"`.

### Single Provider

```lua
require("nvim-redraft").setup({
  llm = {
    provider = "openai",  -- "openai", "anthropic", or "xai"
    model = "gpt-4o-mini",
  },
})
```

Default models: `gpt-4o-mini` (OpenAI), `claude-3-5-sonnet-20241022` (Anthropic), `grok-4-fast-non-reasoning` (xAI).

### Default Keybindings

```lua
require("nvim-redraft").setup({
  keys = {
    { "<leader>ae", function() require("nvim-redraft").edit() end, mode = "v", desc = "AI Edit Selection" },
    { "<leader>am", function() require("nvim-redraft").select_model() end, desc = "Select AI Model" },
  },
})
```

Or disable and define your own:

```lua
require("nvim-redraft").setup({
  keys = {},
})

vim.keymap.set("v", "<C-a>", function()
  require("nvim-redraft").edit()
end, { desc = "AI Edit Selection" })
```

### All Options

```lua
{
  system_prompt = string,      -- Custom system prompt for the LLM
  keys = table,                -- Array of keybindings: { key, function, mode?, desc? }
  llm = {
    provider = string,         -- "openai", "anthropic", or "xai" (default: "openai")
    model = string,            -- Model name (optional, uses provider default)
    models = table,            -- Array of {provider, model, label?} for multi-model setup
    default_model_index = number, -- Starting model index (default: 1)
    timeout = number,          -- Request timeout in ms (default: 30000)
    max_output_tokens = number,-- Max response tokens (default: 4096)
  },
  input = {
    prompt = string,           -- Input prompt text (default: "AI Edit: ")
    icon = string,             -- Input icon (default: "󱚣")
    win = table,               -- Snacks.input window options
  },
  debug = boolean,             -- Enable debug logging (default: false)
  log_file = string,           -- Log file path (default: "~/.local/state/nvim/nvim-redraft.log")
  debug_max_log_size = number, -- Max chars to log (default: 5000, 0 = unlimited)
}
```

## Troubleshooting

### Debug Logging

Enable detailed logging for any issues:

```lua
require("nvim-redraft").setup({
  debug = true,
  log_file = "~/.local/state/nvim/nvim-redraft.log",  -- optional, this is the default
})
```

The log contains:
- User instructions and selected code
- LLM requests/responses and timing
- Code transformations
- All errors with stack traces

**Warning:** Logs contain full code content. Store securely and delete when done.

### Common Issues

| Issue | Solution |
|-------|----------|
| **API key not set** | Export the appropriate key: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `XAI_API_KEY` in your shell profile (`.bashrc`, `.zshrc`, etc.) |
| **TypeScript service fails** | Run `cd ts && npm install && npm run build`, verify `ts/dist/index.js` exists |
| **Service won't start** | Check Node.js >= 18.0.0 with `node --version` |
| **Large selections timeout** | Increase timeout: `llm = { timeout = 60000 }` |
| **Edits not applying** | Enable debug logging to see transformation steps |

## Development

```bash
make test          # Run tests
stylua lua/        # Format Lua code
cd ts && npm run build  # Build TypeScript service
```

## License

MIT
