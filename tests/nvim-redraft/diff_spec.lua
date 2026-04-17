local diff = require("nvim-redraft.diff")

describe("diff", function()
  before_each(function()
    vim.cmd("enew!")
    vim.wait(10)
  end)

  describe("detect_conflicts", function()
    it("should detect a single conflict", function()
      local lines = {
        "<<<<<<< Current",
        "original code",
        "=======",
        "new code",
        ">>>>>>> Incoming",
      }

      local positions = diff.detect_conflicts(lines)

      assert.equals(1, #positions)
      assert.equals(0, positions[1].current_start)
      assert.equals(1, positions[1].current_content_start)
      assert.equals(1, positions[1].current_content_end)
      assert.equals(2, positions[1].middle)
      assert.equals(3, positions[1].incoming_content_start)
      assert.equals(3, positions[1].incoming_content_end)
      assert.equals(4, positions[1].incoming_end)
    end)

    it("should detect multiple conflicts", function()
      local lines = {
        "<<<<<<< Current",
        "first original",
        "=======",
        "first new",
        ">>>>>>> Incoming",
        "some code between",
        "<<<<<<< Current",
        "second original",
        "=======",
        "second new",
        ">>>>>>> Incoming",
      }

      local positions = diff.detect_conflicts(lines)

      assert.equals(2, #positions)
      assert.equals(0, positions[1].current_start)
      assert.equals(6, positions[2].current_start)
    end)

    it("should detect conflicts with multi-line content", function()
      local lines = {
        "<<<<<<< Current",
        "line 1",
        "line 2",
        "line 3",
        "=======",
        "new line 1",
        "new line 2",
        ">>>>>>> Incoming",
      }

      local positions = diff.detect_conflicts(lines)

      assert.equals(1, #positions)
      assert.equals(1, positions[1].current_content_start)
      assert.equals(3, positions[1].current_content_end)
      assert.equals(5, positions[1].incoming_content_start)
      assert.equals(6, positions[1].incoming_content_end)
    end)

    it("should return empty array when no conflicts", function()
      local lines = {
        "regular code",
        "no conflicts here",
      }

      local positions = diff.detect_conflicts(lines)

      assert.equals(0, #positions)
    end)

    it("should handle empty content sections", function()
      local lines = {
        "<<<<<<< Current",
        "=======",
        "new code only",
        ">>>>>>> Incoming",
      }

      local positions = diff.detect_conflicts(lines)

      assert.equals(1, #positions)
      assert.equals(1, positions[1].current_content_start)
      assert.equals(0, positions[1].current_content_end)
    end)
  end)

  describe("inject_conflict_markers", function()
    it("should inject markers for single line selection", function()
      vim.api.nvim_buf_set_lines(0, 0, -1, false, { "original line" })

      local selection = {
        bufnr = 0,
        start_line = 1,
        end_line = 1,
      }

      diff.inject_conflict_markers(selection, "new line")

      local lines = vim.api.nvim_buf_get_lines(0, 0, -1, false)

      assert.equals(5, #lines)
      assert.equals("<<<<<<< Current", lines[1])
      assert.equals("original line", lines[2])
      assert.equals("=======", lines[3])
      assert.equals("new line", lines[4])
      assert.equals(">>>>>>> Incoming", lines[5])
    end)

    it("should inject markers for multi-line selection", function()
      vim.api.nvim_buf_set_lines(0, 0, -1, false, { "line 1", "line 2", "line 3" })

      local selection = {
        bufnr = 0,
        start_line = 1,
        end_line = 3,
      }

      diff.inject_conflict_markers(selection, "new line 1\nnew line 2")

      local lines = vim.api.nvim_buf_get_lines(0, 0, -1, false)

      -- 3 original + 3 markers + 2 new = 8 lines
      assert.equals(8, #lines)
      assert.equals("<<<<<<< Current", lines[1])
      assert.equals("line 1", lines[2])
      assert.equals("line 2", lines[3])
      assert.equals("line 3", lines[4])
      assert.equals("=======", lines[5])
      assert.equals("new line 1", lines[6])
      assert.equals("new line 2", lines[7])
      assert.equals(">>>>>>> Incoming", lines[8])
    end)

    it("should preserve surrounding content", function()
      vim.api.nvim_buf_set_lines(0, 0, -1, false, { "before", "replace me", "after" })

      local selection = {
        bufnr = 0,
        start_line = 2,
        end_line = 2,
      }

      diff.inject_conflict_markers(selection, "replaced")

      local lines = vim.api.nvim_buf_get_lines(0, 0, -1, false)

      assert.equals(7, #lines)
      assert.equals("before", lines[1])
      assert.equals("<<<<<<< Current", lines[2])
      assert.equals("replace me", lines[3])
      assert.equals("=======", lines[4])
      assert.equals("replaced", lines[5])
      assert.equals(">>>>>>> Incoming", lines[6])
      assert.equals("after", lines[7])
    end)

    it("should default to the current buffer when bufnr is missing", function()
      vim.api.nvim_buf_set_lines(0, 0, -1, false, { "original line" })

      local selection = {
        start_line = 1,
        end_line = 1,
      }

      diff.inject_conflict_markers(selection, "new line")

      local lines = vim.api.nvim_buf_get_lines(0, 0, -1, false)
      assert.equals(5, #lines)
      assert.equals("<<<<<<< Current", lines[1])
      assert.equals("original line", lines[2])
      assert.equals("=======", lines[3])
      assert.equals("new line", lines[4])
      assert.equals(">>>>>>> Incoming", lines[5])
    end)
  end)

  describe("resolve_conflict", function()
    local function setup_conflict()
      vim.api.nvim_buf_set_lines(0, 0, -1, false, {
        "<<<<<<< Current",
        "original code",
        "=======",
        "new code",
        ">>>>>>> Incoming",
      })
      diff.process_buffer(0)
      return diff.get_conflict_by_index(0, 1)
    end

    it("should keep original when choosing ours", function()
      local pos = setup_conflict()

      diff.resolve_conflict(0, pos, "ours")

      local lines = vim.api.nvim_buf_get_lines(0, 0, -1, false)
      assert.equals(1, #lines)
      assert.equals("original code", lines[1])
    end)

    it("should keep new when choosing theirs", function()
      local pos = setup_conflict()

      diff.resolve_conflict(0, pos, "theirs")

      local lines = vim.api.nvim_buf_get_lines(0, 0, -1, false)
      assert.equals(1, #lines)
      assert.equals("new code", lines[1])
    end)

    it("should keep both when choosing both", function()
      local pos = setup_conflict()

      diff.resolve_conflict(0, pos, "both")

      local lines = vim.api.nvim_buf_get_lines(0, 0, -1, false)
      assert.equals(2, #lines)
      assert.equals("original code", lines[1])
      assert.equals("new code", lines[2])
    end)

    it("should remove all when choosing none", function()
      local pos = setup_conflict()

      diff.resolve_conflict(0, pos, "none")

      local lines = vim.api.nvim_buf_get_lines(0, 0, -1, false)
      assert.equals(1, #lines)
      assert.equals("", lines[1])
    end)

    it("should handle multi-line content when choosing ours", function()
      vim.api.nvim_buf_set_lines(0, 0, -1, false, {
        "<<<<<<< Current",
        "original line 1",
        "original line 2",
        "=======",
        "new line 1",
        "new line 2",
        "new line 3",
        ">>>>>>> Incoming",
      })
      diff.process_buffer(0)
      local pos = diff.get_conflict_by_index(0, 1)

      diff.resolve_conflict(0, pos, "ours")

      local lines = vim.api.nvim_buf_get_lines(0, 0, -1, false)
      assert.equals(2, #lines)
      assert.equals("original line 1", lines[1])
      assert.equals("original line 2", lines[2])
    end)

    it("should handle multi-line content when choosing theirs", function()
      vim.api.nvim_buf_set_lines(0, 0, -1, false, {
        "<<<<<<< Current",
        "original line 1",
        "original line 2",
        "=======",
        "new line 1",
        "new line 2",
        "new line 3",
        ">>>>>>> Incoming",
      })
      diff.process_buffer(0)
      local pos = diff.get_conflict_by_index(0, 1)

      diff.resolve_conflict(0, pos, "theirs")

      local lines = vim.api.nvim_buf_get_lines(0, 0, -1, false)
      assert.equals(3, #lines)
      assert.equals("new line 1", lines[1])
      assert.equals("new line 2", lines[2])
      assert.equals("new line 3", lines[3])
    end)
  end)

  describe("conflict_count", function()
    it("should return 0 for buffer with no conflicts", function()
      vim.api.nvim_buf_set_lines(0, 0, -1, false, { "no conflicts" })
      diff.process_buffer(0)

      assert.equals(0, diff.conflict_count(0))
    end)

    it("should return correct count for single conflict", function()
      vim.api.nvim_buf_set_lines(0, 0, -1, false, {
        "<<<<<<< Current",
        "original",
        "=======",
        "new",
        ">>>>>>> Incoming",
      })
      diff.process_buffer(0)

      assert.equals(1, diff.conflict_count(0))
    end)

    it("should return correct count for multiple conflicts", function()
      vim.api.nvim_buf_set_lines(0, 0, -1, false, {
        "<<<<<<< Current",
        "original 1",
        "=======",
        "new 1",
        ">>>>>>> Incoming",
        "code between",
        "<<<<<<< Current",
        "original 2",
        "=======",
        "new 2",
        ">>>>>>> Incoming",
      })
      diff.process_buffer(0)

      assert.equals(2, diff.conflict_count(0))
    end)
  end)

  describe("clear", function()
    it("should clear state and namespaces", function()
      vim.api.nvim_buf_set_lines(0, 0, -1, false, {
        "<<<<<<< Current",
        "original",
        "=======",
        "new",
        ">>>>>>> Incoming",
      })
      diff.process_buffer(0)
      assert.equals(1, diff.conflict_count(0))

      diff.clear(0)

      assert.equals(0, diff.conflict_count(0))
    end)
  end)
end)

describe("edge cases", function()
  it("should handle empty incoming section", function()
    local lines = {
      "<<<<<<< Current",
      "original code",
      "=======",
      ">>>>>>> Incoming",
    }

    local positions = diff.detect_conflicts(lines)

    assert.equals(1, #positions)
    assert.equals(3, positions[1].incoming_content_start)
    assert.equals(2, positions[1].incoming_content_end)
  end)

  it("should return empty when choosing theirs with empty incoming", function()
    vim.api.nvim_buf_set_lines(0, 0, -1, false, {
      "<<<<<<< Current",
      "original code",
      "=======",
      ">>>>>>> Incoming",
    })
    diff.process_buffer(0)
    local pos = diff.get_conflict_by_index(0, 1)

    diff.resolve_conflict(0, pos, "theirs")

    local lines = vim.api.nvim_buf_get_lines(0, 0, -1, false)
    assert.equals(1, #lines)
    assert.equals("", lines[1])
  end)

  it("should resolve first conflict and keep second intact", function()
    vim.api.nvim_buf_set_lines(0, 0, -1, false, {
      "<<<<<<< Current",
      "first original",
      "=======",
      "first new",
      ">>>>>>> Incoming",
      "code between",
      "<<<<<<< Current",
      "second original",
      "=======",
      "second new",
      ">>>>>>> Incoming",
    })
    diff.process_buffer(0)
    assert.equals(2, diff.conflict_count(0))

    local pos = diff.get_conflict_by_index(0, 1)
    diff.resolve_conflict(0, pos, "theirs")

    assert.equals(1, diff.conflict_count(0))

    local remaining_pos = diff.get_conflict_by_index(0, 1)
    assert.is_not_nil(remaining_pos)

    diff.resolve_conflict(0, remaining_pos, "ours")

    local lines = vim.api.nvim_buf_get_lines(0, 0, -1, false)
    assert.equals(3, #lines)
    assert.equals("first new", lines[1])
    assert.equals("code between", lines[2])
    assert.equals("second original", lines[3])
  end)
end)
