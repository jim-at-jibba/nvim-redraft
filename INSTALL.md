# Installation Guide

## Quick Start

1. Install the plugin using your package manager
2. Set your MorphLLM API key
3. Build the TypeScript service
4. Configure the plugin

## Step-by-Step

### 1. Install with lazy.nvim

```lua
{
  "yourusername/nvim-redraft",
  config = function()
    require("nvim-redraft").setup()
  end,
  build = "cd ts && npm install && npm run build",
}
```

### 2. Set API Keys

Add both API keys to your shell profile (`.bashrc`, `.zshrc`, etc.):

```bash
export MORPH_API_KEY="your-morph-api-key-here"
export OPENAI_API_KEY="your-openai-api-key-here"
```

> **Note:** The plugin requires both keys because it uses a two-step process: GPT-4o-mini generates sparse edits, then MorphLLM Fast Apply merges them into your code for optimal accuracy.

Then reload your shell or source the file:

```bash
source ~/.zshrc  # or ~/.bashrc
```

### 3. Build TypeScript Service

The build command should run automatically, but if needed:

```bash
cd ~/.local/share/nvim/lazy/nvim-redraft/ts  # or your plugin path
npm install
npm run build
```

### 4. Verify Installation

1. Restart Neovim
2. Open a file
3. Select some code in visual mode
4. Press `<leader>ae`
5. Enter an instruction like "add comments"

If you see an error, check the troubleshooting section in README.md.

## Manual Installation

If not using a package manager:

```bash
git clone https://github.com/yourusername/nvim-redraft ~/.config/nvim/pack/plugins/start/nvim-redraft
cd ~/.config/nvim/pack/plugins/start/nvim-redraft/ts
npm install
npm run build
```

Then add to your `init.lua`:

```lua
require("nvim-redraft").setup()
```
