local M = {}

function M.get_instruction(config, callback)
  local ok, snacks = pcall(require, "snacks")
  if not ok or not snacks.input then
    error(
      "[nvim-redraft] Snacks.nvim with input support is required. Please install it: https://github.com/folke/snacks.nvim"
    )
    return
  end

  local input_opts = vim.tbl_deep_extend("force", {
    prompt = config.input.prompt or "AI Edit: ",
    icon = config.input.icon,
    win = config.input.win or {},
  }, {})

  snacks.input(input_opts, function(input)
    if input and input ~= "" then
      callback(input)
    end
  end)
end

return M
