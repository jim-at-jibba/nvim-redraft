# nvim-redraft

A Neovim plugin for AI-powered inline code editing with support for multiple LLM providers (OpenAI, Anthropic, xAI).

https://github.com/user-attachments/assets/4124e8e5-27ce-4628-b005-e0d7b65a1392

## Features

- Select code in visual mode and apply AI edits inline
- No confirmation dialogs - seamless editing experience
- Customizable system prompts
- Configurable keybindings
- Built with Lua and TypeScript for optimal performance

## Installation

### Prerequisites

- Neovim >= 0.8.0
- Node.js >= 18.0.0
- [Snacks.nvim](https://github.com/folke/snacks.nvim) with input support
- API key for at least one supported provider:
  - OpenAI API key ([get one here](https://platform.openai.com/api-keys))
  - Anthropic API key ([get one here](https://console.anthropic.com/))
  - xAI API key ([get one here](https://console.x.ai/))

### Using [lazy.nvim](https://github.com/folke/lazy.nvim)

```lua
{
  "jim-at-jibba/nvim-redraft",
  dependencies = {
    { "folke/snacks.nvim", opts = { input = {} } },
  },
  config = function()
    require("nvim-redraft").setup({
      -- Optional configuration
      system_prompt = "You are a code editing assistant...",
      keybindings = {
        visual_edit = "<leader>ae",
      },
    })
  end,
  build = "cd ts && npm install && npm run build",
}
```

### Using [packer.nvim](https://github.com/wbthomason/packer.nvim)

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

## Setup

1. Set your API key(s):

```bash
# For OpenAI (default provider)
export OPENAI_API_KEY="your-openai-api-key-here"

# For Anthropic
export ANTHROPIC_API_KEY="your-anthropic-api-key-here"

# For xAI
export XAI_API_KEY="your-xai-api-key-here"
```


2. Configure the plugin in your Neovim config:

```lua
require("nvim-redraft").setup({
  system_prompt = "You are a code editing assistant. Apply the requested changes to the code and return only the modified code without explanations.",
  keybindings = {
    visual_edit = "<leader>ae",
  },
  llm = {
    provider = "openai",       -- "openai", "anthropic", or "xai"
    model = "gpt-4o-mini",     -- Model name (optional, uses provider default if omitted)
    timeout = 30000,
  },
})
```

## Usage

1. Select code in visual mode (`v`, `V`, or `Ctrl-v`)
2. Press `<leader>ae` (or your configured keybinding)
3. Enter your editing instruction in the prompt
4. The AI will apply the changes inline

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

### Options

```lua
{
  system_prompt = string,      -- Custom system prompt for the LLM
  keybindings = {
    visual_edit = string,      -- Keybinding for visual mode edit (default: "<leader>ae")
  },
  llm = {
    provider = string,         -- LLM provider: "openai", "anthropic", or "xai" (default: "openai")
    model = string,            -- Model name (optional, defaults: gpt-4o-mini for OpenAI, claude-3-5-sonnet-20241022 for Anthropic, grok-4-fast-non-reasoning for xAI)
    timeout = number,          -- Request timeout in milliseconds (default: 30000)
  },
  input = {
    prompt = string,           -- Input prompt text (default: "AI Edit: ")
    icon = string,             -- Input icon (default: "󱚣")
    win = table,               -- Snacks.input window options (relative, row, col, title_pos, etc.)
  },
  debug = boolean,             -- Enable debug logging (default: false)
  log_file = string,           -- Log file path (default: "~/.local/state/nvim/nvim-redraft.log")
  debug_max_log_size = number, -- Max chars to log for code content (default: 5000, 0 = unlimited)
}
```

### Provider Configuration

The plugin supports multiple LLM providers. Choose the one that best fits your needs:

#### OpenAI (default)
```lua
require("nvim-redraft").setup({
  llm = {
    provider = "openai",
    model = "gpt-4o-mini",  -- Or "gpt-4o" etc.
  },
})
```

Set environment variable:
```bash
export OPENAI_API_KEY="your-openai-api-key"
```

#### Anthropic
```lua
require("nvim-redraft").setup({
  llm = {
    provider = "anthropic",
    model = "claude-3-7-sonnet-latest",  -- Or other Claude models
  },
})
```

Set environment variable:
```bash
export ANTHROPIC_API_KEY="your-anthropic-api-key"
```

#### xAI
```lua
require("nvim-redraft").setup({
  llm = {
    provider = "xai",
    model = "grok-4-fast-non-reasoning",  -- Or other Grok models
  },
})
```

Set environment variable:
```bash
export XAI_API_KEY="your-xai-api-key"
```

### Debug Logging

Enable detailed logging to troubleshoot issues:

```lua
require("nvim-redraft").setup({
  debug = true,  -- Enable debug logging
})
```

When enabled, all plugin activity is logged to `~/.local/state/nvim/nvim-redraft.log`, including:
- User instructions and selected code
- Sparse edits generated by the LLM
- API requests/responses and timing
- Code transformations and replacements
- All errors with stack traces

**Warning:** Log files contain full code content. Store them securely and delete when done debugging.

### Custom Keybindings

```lua
require("nvim-redraft").setup({
  keybindings = {
    visual_edit = "<C-a>",  -- Use Ctrl+a instead
  },
})
```

To disable the default keybinding:

```lua
require("nvim-redraft").setup({
  keybindings = {
    visual_edit = false,
  },
})
```

You can then create your own:

```lua
vim.keymap.set("v", "<C-a>", function()
  require("nvim-redraft").edit()
end)
```

## Commands

- `:RedraftEdit` - Trigger AI edit on visual selection

## Environment Variables

- `OPENAI_API_KEY` - Your OpenAI API key (required if using OpenAI provider)
- `ANTHROPIC_API_KEY` - Your Anthropic API key (required if using Anthropic provider)
- `XAI_API_KEY` - Your xAI API key (required if using xAI provider)

You only need to set the API key for the provider you're using.

## Troubleshooting

### Enable Debug Logging

For any issues, enable debug logging first:

```lua
require("nvim-redraft").setup({
  debug = true,
})
```

Then check the log file at `~/.local/state/nvim/nvim-redraft.log` for detailed information about what's happening.

### "OPENAI_API_KEY not set", "ANTHROPIC_API_KEY not set", or "XAI_API_KEY not set" error

Make sure you've exported the API key for your chosen provider:

```bash
# For OpenAI
export OPENAI_API_KEY="your-openai-api-key"

# For Anthropic
export ANTHROPIC_API_KEY="your-anthropic-api-key"

# For xAI
export XAI_API_KEY="your-xai-api-key"
```

Add them to your `.bashrc`, `.zshrc`, or `.profile` to persist across sessions.

### TypeScript service fails to start

Ensure you've built the TypeScript service:

```bash
cd ts
npm install
npm run build
```

Verify that `ts/dist/index.js` exists.

Check debug logs for detailed error messages.

### "Failed to start TypeScript service"

Check that Node.js is installed and in your PATH:

```bash
node --version  # Should be >= 18.0.0
```

Enable debug mode and check `~/.local/state/nvim/nvim-redraft.log` for service startup errors.

### Large selections timeout

For very large code selections, increase the timeout:

```lua
require("nvim-redraft").setup({
  llm = {
    timeout = 60000,  -- 60 seconds
  },
})
```

### Edits not applying correctly

Enable debug logging to see the full transformation:

```lua
require("nvim-redraft").setup({
  debug = true,
})
```

The log will show:
- Original selected code
- Sparse edit generated
- Final merged code
- Any errors in the transformation

### Finding the log file

Default location: `~/.local/state/nvim/nvim-redraft.log`

Custom location:
```lua
require("nvim-redraft").setup({
  debug = true,
  log_file = "/path/to/your/debug.log",
})
```

## Development

### Running Tests

```bash
make test
```

### Formatting

```bash
stylua lua/
```

### Building TypeScript

```bash
cd ts
npm run build
```

## License

MIT
