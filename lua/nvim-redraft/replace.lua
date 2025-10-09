local M = {}

function M.replace_selection(selection, new_text)
  local lines = vim.split(new_text, "\n")

  vim.api.nvim_buf_set_lines(0, selection.start_line - 1, selection.end_line, false, lines)
end

return M
