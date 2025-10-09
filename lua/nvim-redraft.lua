local selection = require("nvim-redraft.selection")
local input = require("nvim-redraft.input")
local ipc = require("nvim-redraft.ipc")
local replace = require("nvim-redraft.replace")

local M = {}

M.config = {
  system_prompt = "You are a code editing assistant. Apply the requested changes to the code and return only the modified code without any explanations or markdown formatting.",
  keybindings = {
    visual_edit = "<leader>ae",
  },
  llm = {
    model = "morph-v3-large",
    timeout = 30000,
  },
}

function M.setup(opts)
  opts = opts or {}

  if type(opts.llm) == "table" and type(opts.llm.timeout) == "number" and opts.llm.timeout <= 0 then
    error("llm.timeout must be a positive number")
  end

  M.config = vim.tbl_deep_extend("force", M.config, opts)

  if M.config.keybindings.visual_edit then
    vim.keymap.set("v", M.config.keybindings.visual_edit, function()
      M.edit()
    end, { desc = "AI Edit Selection" })
  end

  vim.api.nvim_create_autocmd("VimLeavePre", {
    callback = function()
      ipc.stop_service()
    end,
  })
end

function M.edit()
  local sel, err = selection.get_visual_selection()
  if not sel then
    vim.notify("[nvim-redraft] " .. err, vim.log.levels.ERROR)
    return
  end

  vim.cmd("normal! gv")

  input.get_instruction(function(instruction)
    ipc.send_request({
      code = sel.text,
      instruction = instruction,
      systemPrompt = M.config.system_prompt,
    }, function(result, error)
      if error then
        vim.notify("[nvim-redraft] " .. error, vim.log.levels.ERROR)
        return
      end

      replace.replace_selection(sel, result)
      vim.notify("[nvim-redraft] Edit applied", vim.log.levels.INFO)
    end)
  end)
end

return M
