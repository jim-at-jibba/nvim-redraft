local input = require("nvim-redraft.input")

describe("input", function()
  describe("get_instruction", function()
    it("should call callback with user input", function()
      local result = nil
      local callback_called = false

      local original_input = vim.ui.input
      vim.ui.input = function(opts, callback)
        assert.equals("AI Edit: ", opts.prompt)
        callback("test instruction")
      end

      input.get_instruction(function(instruction)
        callback_called = true
        result = instruction
      end)

      vim.ui.input = original_input

      assert.is_true(callback_called)
      assert.equals("test instruction", result)
    end)

    it("should not call callback when input is empty", function()
      local callback_called = false

      local original_input = vim.ui.input
      vim.ui.input = function(opts, callback)
        callback("")
      end

      input.get_instruction(function(instruction)
        callback_called = true
      end)

      vim.ui.input = original_input

      assert.is_false(callback_called)
    end)

    it("should not call callback when input is nil", function()
      local callback_called = false

      local original_input = vim.ui.input
      vim.ui.input = function(opts, callback)
        callback(nil)
      end

      input.get_instruction(function(instruction)
        callback_called = true
      end)

      vim.ui.input = original_input

      assert.is_false(callback_called)
    end)

    it("should handle multi-word instructions", function()
      local result = nil

      local original_input = vim.ui.input
      vim.ui.input = function(opts, callback)
        callback("add error handling with try catch")
      end

      input.get_instruction(function(instruction)
        result = instruction
      end)

      vim.ui.input = original_input

      assert.equals("add error handling with try catch", result)
    end)

    it("should preserve whitespace in instructions", function()
      local result = nil

      local original_input = vim.ui.input
      vim.ui.input = function(opts, callback)
        callback("  leading and trailing spaces  ")
      end

      input.get_instruction(function(instruction)
        result = instruction
      end)

      vim.ui.input = original_input

      assert.equals("  leading and trailing spaces  ", result)
    end)
  end)
end)
