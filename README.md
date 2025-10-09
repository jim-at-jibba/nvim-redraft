# nvim-redraft

A Neovim plugin for AI-powered inline code editing using MorphLLM.

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
- MorphLLM API key ([get one here](https://morphllm.com))

### Using [lazy.nvim](https://github.com/folke/lazy.nvim)

```lua
{
  "yourusername/nvim-redraft",
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
  "yourusername/nvim-redraft",
  config = function()
    require("nvim-redraft").setup()
  end,
  run = "cd ts && npm install && npm run build",
}
```

## Setup

1. Set your MorphLLM API key:

```bash
export MORPH_API_KEY="your-api-key-here"
```

2. Install TypeScript dependencies:

```bash
cd ts
npm install
npm run build
```

3. Configure the plugin in your Neovim config:

```lua
require("nvim-redraft").setup({
  system_prompt = "You are a code editing assistant. Apply the requested changes to the code and return only the modified code without explanations.",
  keybindings = {
    visual_edit = "<leader>ae",
  },
  llm = {
    model = "morph-v3-large",
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
    model = string,            -- LLM model name (default: "morph-v3-large")
    timeout = number,          -- Request timeout in milliseconds (default: 30000)
  },
}
```

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

- `MORPH_API_KEY` - **Required**. Your MorphLLM API key

## Troubleshooting

### "MORPH_API_KEY not set" error

Make sure you've exported the API key in your shell:

```bash
export MORPH_API_KEY="your-api-key"
```

Add it to your `.bashrc`, `.zshrc`, or `.profile` to persist across sessions.

### TypeScript service fails to start

Ensure you've built the TypeScript service:

```bash
cd ts
npm install
npm run build
```

Verify that `ts/dist/index.js` exists.

### "Failed to start TypeScript service"

Check that Node.js is installed and in your PATH:

```bash
node --version  # Should be >= 18.0.0
```

### Large selections timeout

For very large code selections, increase the timeout:

```lua
require("nvim-redraft").setup({
  llm = {
    timeout = 60000,  -- 60 seconds
  },
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
