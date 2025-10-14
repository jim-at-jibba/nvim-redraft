local input = require("nvim-redraft.input")

describe("input", function()
  describe("get_instruction", function()
    local mock_config = {
      input = {
        prompt = "AI Edit: ",
        icon = "󱚣",
        win = {
          title_pos = "left",
          relative = "cursor",
          row = -3,
          col = 0,
        },
      },
    }

    it("should call callback with user input", function()
      local result = nil
      local callback_called = false

      package.loaded["snacks"] = {
        input = function(opts, callback)
          assert.equals("AI Edit: ", opts.prompt)
          assert.equals("󱚣", opts.icon)
          callback("test instruction")
        end,
      }

      input.get_instruction(mock_config, function(instruction)
        callback_called = true
        result = instruction
      end)

      package.loaded["snacks"] = nil

      assert.is_true(callback_called)
      assert.equals("test instruction", result)
    end)

    it("should not call callback when input is empty", function()
      local callback_called = false

      package.loaded["snacks"] = {
        input = function(opts, callback)
          callback("")
        end,
      }

      input.get_instruction(mock_config, function(instruction)
        callback_called = true
      end)

      package.loaded["snacks"] = nil

      assert.is_false(callback_called)
    end)

    it("should not call callback when input is nil", function()
      local callback_called = false

      package.loaded["snacks"] = {
        input = function(opts, callback)
          callback(nil)
        end,
      }

      input.get_instruction(mock_config, function(instruction)
        callback_called = true
      end)

      package.loaded["snacks"] = nil

      assert.is_false(callback_called)
    end)

    it("should handle multi-word instructions", function()
      local result = nil

      package.loaded["snacks"] = {
        input = function(opts, callback)
          callback("add error handling with try catch")
        end,
      }

      input.get_instruction(mock_config, function(instruction)
        result = instruction
      end)

      package.loaded["snacks"] = nil

      assert.equals("add error handling with try catch", result)
    end)

    it("should preserve whitespace in instructions", function()
      local result = nil

      package.loaded["snacks"] = {
        input = function(opts, callback)
          callback("  leading and trailing spaces  ")
        end,
      }

      input.get_instruction(mock_config, function(instruction)
        result = instruction
      end)

      package.loaded["snacks"] = nil

      assert.equals("  leading and trailing spaces  ", result)
    end)

    it("should fallback to vim.ui.input when Snacks.nvim is not available", function()
      package.loaded["snacks"] = nil
      local result = nil
      local callback_called = false

      local original_vim_ui_input = vim.ui.input
      vim.ui.input = function(opts, callback)
        assert.equals("AI Edit: ", opts.prompt)
        callback("fallback instruction")
      end

      input.get_instruction(mock_config, function(instruction)
        callback_called = true
        result = instruction
      end)

      vim.ui.input = original_vim_ui_input

      assert.is_true(callback_called)
      assert.equals("fallback instruction", result)
    end)

    it("should not pass icon or win options to vim.ui.input fallback", function()
      package.loaded["snacks"] = nil

      local original_vim_ui_input = vim.ui.input
      vim.ui.input = function(opts, callback)
        assert.equals("AI Edit: ", opts.prompt)
        assert.is_nil(opts.icon)
        assert.is_nil(opts.win)
        callback("test")
      end

      input.get_instruction(mock_config, function() end)

      vim.ui.input = original_vim_ui_input
    end)

    it("should use custom input options from config", function()
      local custom_config = {
        input = {
          prompt = "Custom Prompt: ",
          icon = "🤖",
          win = { relative = "editor", row = 10 },
        },
      }

      package.loaded["snacks"] = {
        input = function(opts, callback)
          assert.equals("Custom Prompt: ", opts.prompt)
          assert.equals("🤖", opts.icon)
          assert.equals("editor", opts.win.relative)
          assert.equals(10, opts.win.row)
          callback("test")
        end,
      }

      input.get_instruction(custom_config, function() end)

      package.loaded["snacks"] = nil
    end)
  end)
end)
