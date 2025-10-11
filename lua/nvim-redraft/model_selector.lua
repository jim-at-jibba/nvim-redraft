local M = {}

function M.get_model_selection(models, current_index, callback)
  local items = {}
  
  for i, model_config in ipairs(models) do
    local display_name = model_config.label or (model_config.provider .. ": " .. (model_config.model or "default"))
    local is_current = (i == current_index)
    table.insert(items, {
      text = is_current and ("* " .. display_name) or ("  " .. display_name),
      display_name = display_name,
      idx = i,
    })
  end

  local select_opts = {
    prompt = "Select AI Model:",
    format_item = function(item)
      return item.text
    end,
  }

  vim.ui.select(items, select_opts, function(choice)
    if choice then
      callback(choice.idx)
    end
  end)
end

return M
