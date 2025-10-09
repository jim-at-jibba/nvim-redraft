# Quick Start Guide

Get nvim-redraft running in 5 minutes.

## Prerequisites

- Neovim >= 0.8.0
- Node.js >= 18.0.0
- MorphLLM API key

## Installation

### Using lazy.nvim

Add to your Neovim config:

```lua
{
  "yourusername/nvim-redraft",
  config = function()
    require("nvim-redraft").setup()
  end,
  build = "cd ts && npm install && npm run build",
}
```

## Setup

1. **Get API Key**: Sign up at [morphllm.com](https://morphllm.com) and get your API key

2. **Set Environment Variable**:
   ```bash
   echo 'export MORPH_API_KEY="your-api-key-here"' >> ~/.zshrc
   source ~/.zshrc
   ```

3. **Restart Neovim**: The plugin will build automatically on first install

## Usage

1. Open a file in Neovim
2. Select code in visual mode (`v` or `V`)
3. Press `<leader>ae`
4. Type your instruction (e.g., "add error handling")
5. Press Enter
6. Watch the AI edit your code!

## Example

**Before:**
```python
def calculate(x, y):
    return x / y
```

**Select the code, press `<leader>ae`, type:** `add error handling for division by zero`

**After:**
```python
def calculate(x, y):
    if y == 0:
        raise ValueError("Cannot divide by zero")
    return x / y
```

## Troubleshooting

**"MORPH_API_KEY not set"**
- Make sure you exported the key and restarted Neovim

**"Failed to start TypeScript service"**
- Run `cd ~/.local/share/nvim/lazy/nvim-redraft/ts && npm install && npm run build`

**Nothing happens when I press the keybinding**
- Make sure you're in visual mode with text selected

## Next Steps

- Customize the system prompt in your config
- Change the keybinding to your preference
- Read the full README.md for advanced configuration

Enjoy AI-powered editing! 🚀
