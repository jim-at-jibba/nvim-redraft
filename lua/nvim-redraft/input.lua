local M = {}

function M.get_instruction(callback)
  vim.ui.input({
    prompt = "AI Edit: ",
  }, function(input)
    if input and input ~= "" then
      callback(input)
    end
  end)
end

return M
