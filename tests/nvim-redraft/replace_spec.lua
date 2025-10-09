local replace = require("nvim-redraft.replace")

describe("replace", function()
  before_each(function()
    vim.cmd("enew!")
    vim.wait(10)
  end)

  describe("replace_selection", function()
    it("should replace single line selection", function()
      vim.api.nvim_buf_set_lines(0, 0, -1, false, { "hello world" })

      local selection = {
        text = "hello world",
        start_line = 1,
        end_line = 1,
        start_col = 1,
        end_col = 11,
      }

      replace.replace_selection(selection, "goodbye world")

      local lines = vim.api.nvim_buf_get_lines(0, 0, -1, false)
      assert.equals(1, #lines)
      assert.equals("goodbye world", lines[1])
    end)

    it("should replace multi-line selection with single line", function()
      vim.api.nvim_buf_set_lines(0, 0, -1, false, { "line 1", "line 2", "line 3" })

      local selection = {
        text = "line 1\nline 2\nline 3",
        start_line = 1,
        end_line = 3,
        start_col = 1,
        end_col = 6,
      }

      replace.replace_selection(selection, "single line")

      local lines = vim.api.nvim_buf_get_lines(0, 0, -1, false)
      assert.equals(1, #lines)
      assert.equals("single line", lines[1])
    end)

    it("should replace single line with multi-line", function()
      vim.api.nvim_buf_set_lines(0, 0, -1, false, { "single line" })

      local selection = {
        text = "single line",
        start_line = 1,
        end_line = 1,
        start_col = 1,
        end_col = 11,
      }

      replace.replace_selection(selection, "line 1\nline 2\nline 3")

      local lines = vim.api.nvim_buf_get_lines(0, 0, -1, false)
      assert.equals(3, #lines)
      assert.equals("line 1", lines[1])
      assert.equals("line 2", lines[2])
      assert.equals("line 3", lines[3])
    end)

    it("should replace multi-line with multi-line", function()
      vim.api.nvim_buf_set_lines(0, 0, -1, false, { "old 1", "old 2", "old 3" })

      local selection = {
        text = "old 1\nold 2\nold 3",
        start_line = 1,
        end_line = 3,
        start_col = 1,
        end_col = 5,
      }

      replace.replace_selection(selection, "new 1\nnew 2")

      local lines = vim.api.nvim_buf_get_lines(0, 0, -1, false)
      assert.equals(2, #lines)
      assert.equals("new 1", lines[1])
      assert.equals("new 2", lines[2])
    end)

    it("should handle empty replacement text", function()
      vim.api.nvim_buf_set_lines(0, 0, -1, false, { "line 1", "line 2" })

      local selection = {
        text = "line 1\nline 2",
        start_line = 1,
        end_line = 2,
        start_col = 1,
        end_col = 6,
      }

      replace.replace_selection(selection, "")

      local lines = vim.api.nvim_buf_get_lines(0, 0, -1, false)
      assert.equals(1, #lines)
      assert.equals("", lines[1])
    end)

    it("should replace middle lines preserving surrounding content", function()
      vim.api.nvim_buf_set_lines(0, 0, -1, false, { "keep 1", "replace me", "keep 2" })

      local selection = {
        text = "replace me",
        start_line = 2,
        end_line = 2,
        start_col = 1,
        end_col = 10,
      }

      replace.replace_selection(selection, "replaced")

      local lines = vim.api.nvim_buf_get_lines(0, 0, -1, false)
      assert.equals(3, #lines)
      assert.equals("keep 1", lines[1])
      assert.equals("replaced", lines[2])
      assert.equals("keep 2", lines[3])
    end)

    it("should handle replacement with trailing newline", function()
      vim.api.nvim_buf_set_lines(0, 0, -1, false, { "original" })

      local selection = {
        text = "original",
        start_line = 1,
        end_line = 1,
        start_col = 1,
        end_col = 8,
      }

      replace.replace_selection(selection, "new text\n")

      local lines = vim.api.nvim_buf_get_lines(0, 0, -1, false)
      assert.equals(2, #lines)
      assert.equals("new text", lines[1])
      assert.equals("", lines[2])
    end)
  end)
end)
