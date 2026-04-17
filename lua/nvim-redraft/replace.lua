local logger = require("nvim-redraft.logger")

local M = {}

local function get_target_bufnr(selection)
  if selection.bufnr == nil then
    return 0
  end

  if selection.bufnr ~= 0 and not vim.api.nvim_buf_is_valid(selection.bufnr) then
    error("selection.bufnr must be a valid buffer number")
  end

  return selection.bufnr
end

function M.replace_selection(selection, new_text)
  logger.debug(
    "replace",
    string.format("Replacing lines %d-%d with %d chars", selection.start_line, selection.end_line, #new_text)
  )

  local lines = vim.split(new_text, "\n")

  logger.debug("replace", string.format("Split into %d lines", #lines))

  vim.api.nvim_buf_set_lines(get_target_bufnr(selection), selection.start_line - 1, selection.end_line, false, lines)

  logger.info("replace", "Code replacement completed")
end

return M
