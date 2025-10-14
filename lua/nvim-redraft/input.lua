local M = {}

function M.get_instruction(config, callback)
  local ok, snacks = pcall(require, "snacks")
  
  if ok and snacks.input then
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
  else
    vim.ui.input({
      prompt = config.input.prompt or "AI Edit: ",
    }, function(input)
      if input and input ~= "" then
        callback(input)
      end
    end)
  end
end

return M
