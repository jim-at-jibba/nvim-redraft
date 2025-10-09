local logger = require("nvim-redraft.logger")

local M = {}

function M.replace_selection(selection, new_text)
  logger.debug(
    "replace",
    string.format("Replacing lines %d-%d with %d chars", selection.start_line, selection.end_line, #new_text)
  )

  local lines = vim.split(new_text, "\n")

  logger.debug("replace", string.format("Split into %d lines", #lines))

  vim.api.nvim_buf_set_lines(0, selection.start_line - 1, selection.end_line, false, lines)

  logger.info("replace", "Code replacement completed")
end

return M
