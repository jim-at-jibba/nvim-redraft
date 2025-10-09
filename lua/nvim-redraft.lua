local selection = require("nvim-redraft.selection")
local input = require("nvim-redraft.input")
local ipc = require("nvim-redraft.ipc")
local replace = require("nvim-redraft.replace")
local logger = require("nvim-redraft.logger")
local spinner = require("nvim-redraft.spinner")

local M = {}

M.config = {
  system_prompt = [[You are a code editing assistant. Analyze the user's instruction and the selected code to determine the appropriate action.

Based on the instruction, intelligently:
- ADD new code if the instruction requests new functionality, features, or additions
- MODIFY existing code if the instruction asks to change, update, refactor, or improve existing lines
- DELETE code if the instruction asks to remove, delete, or eliminate specific parts
- REPLACE code when the instruction implies substitution or complete rewrites

Generate a sparse edit showing only the changes needed:
- Show only the lines being changed plus minimal context
- For deletions, show context before and after with the marker, omitting the deleted section
- Make your edit clear and unambiguous
- Return ONLY the modified code, no explanations or markdown formatting

Be intelligent about preserving code structure, indentation, and style.]],
  keybindings = {
    visual_edit = "<leader>ae",
  },
  llm = {
    provider = "openai",
    model = "gpt-4o-mini",
    timeout = 30000,
    base_url = nil,
  },
  debug = false,
  log_file = vim.fn.stdpath("state") .. "/nvim-redraft.log",
  debug_max_log_size = 5000,
}

function M.setup(opts)
  opts = opts or {}

  if type(opts.llm) == "table" and type(opts.llm.timeout) == "number" and opts.llm.timeout <= 0 then
    error("llm.timeout must be a positive number")
  end

  M.config = vim.tbl_deep_extend("force", M.config, opts)

  logger.init(M.config)
  ipc.config = M.config

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
  local start_time = vim.loop.hrtime()
  logger.info("edit", "Edit operation started")

  vim.cmd('normal! "vy')
  local sel, err = selection.get_visual_selection()
  if not sel then
    logger.error("edit", "Failed to get selection: " .. err)
    vim.notify("[nvim-redraft] " .. err, vim.log.levels.ERROR)
    return
  end

  input.get_instruction(function(instruction)
    logger.debug("edit", "User instruction: " .. instruction)
    logger.debug("edit", "Selected code:", sel.text)
    logger.debug(
      "edit",
      string.format(
        "Selection details: lines %d-%d, cols %d-%d",
        sel.start_line,
        sel.end_line,
        sel.start_col,
        sel.end_col
      )
    )
    logger.debug("edit", "System prompt:", M.config.system_prompt)

    spinner.start("Processing edit...")

    ipc.send_request({
      code = sel.text,
      instruction = instruction,
      systemPrompt = M.config.system_prompt,
      provider = M.config.llm.provider,
      model = M.config.llm.model,
      baseURL = M.config.llm.base_url,
    }, function(result, error)
      spinner.stop()

      if error then
        local elapsed = (vim.loop.hrtime() - start_time) / 1e9
        logger.error("edit", string.format("Edit failed after %.2fs: %s", elapsed, error))
        vim.notify("[nvim-redraft] " .. error, vim.log.levels.ERROR)
        return
      end

      logger.debug("edit", "Merged code result:", result)

      replace.replace_selection(sel, result)

      local elapsed = (vim.loop.hrtime() - start_time) / 1e9
      logger.info("edit", string.format("Edit completed successfully in %.2fs", elapsed))
      vim.notify("[nvim-redraft] Edit applied", vim.log.levels.INFO)
    end)
  end)
end

return M
