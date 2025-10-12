local selection = require("nvim-redraft.selection")
local input = require("nvim-redraft.input")
local ipc = require("nvim-redraft.ipc")
local replace = require("nvim-redraft.replace")
local logger = require("nvim-redraft.logger")
local spinner = require("nvim-redraft.spinner")
local model_selector = require("nvim-redraft.model_selector")

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
  keys = {
    { "<leader>ae", function() require("nvim-redraft").edit() end, mode = "v", desc = "AI Edit Selection" },
    { "<leader>am", function() require("nvim-redraft").select_model() end, desc = "Select AI Model" },
  },
  llm = {
    provider = "openai",
    model = nil,
    models = nil,
    default_model_index = 1,
    current_index = 1,
    timeout = 30000,
    base_url = nil,
    max_output_tokens = nil,
  },
  input = {
    prompt = "AI Edit: ",
    icon = "󱚣",
    win = {
      title_pos = "left",
      relative = "cursor",
      row = -3,
      col = 0,
    },
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

  if type(opts.llm) == "table" and opts.llm.models and (opts.llm.provider or opts.llm.model) then
    vim.notify(
      "[nvim-redraft] Both llm.models and llm.provider/model configured. Using llm.models.",
      vim.log.levels.WARN
    )
  end

  M.config = vim.tbl_deep_extend("force", M.config, opts)

  if not M.config.llm.models then
    if M.config.llm.provider or M.config.llm.model then
      M.config.llm.models = {
        {
          provider = M.config.llm.provider or "openai",
          model = M.config.llm.model,
        },
      }
    else
      M.config.llm.models = {
        { provider = "openai", model = nil },
      }
    end
  end

  if type(M.config.llm.models) ~= "table" or #M.config.llm.models == 0 then
    error("llm.models must be a non-empty array of model configurations")
  end

  for i, model_config in ipairs(M.config.llm.models) do
    if type(model_config) ~= "table" then
      error(string.format("llm.models[%d] must be a table", i))
    end
    if not model_config.provider then
      error(string.format("llm.models[%d] must have a provider field", i))
    end
    local valid_providers = { openai = true, anthropic = true, xai = true, openrouter = true }
    if not valid_providers[model_config.provider] then
      error(
        string.format(
          "llm.models[%d].provider must be one of: openai, anthropic, xai, openrouter (got: %s)",
          i,
          model_config.provider
        )
      )
    end
  end

  if M.config.llm.default_model_index then
    if
      type(M.config.llm.default_model_index) ~= "number"
      or M.config.llm.default_model_index < 1
      or M.config.llm.default_model_index > #M.config.llm.models
    then
      error(
        string.format(
          "llm.default_model_index must be between 1 and %d",
          #M.config.llm.models
        )
      )
    end
    M.config.llm.current_index = M.config.llm.default_model_index
  else
    M.config.llm.current_index = 1
  end

  logger.init(M.config)
  ipc.config = M.config

  if M.config.keys then
    for _, key in ipairs(M.config.keys) do
      local mode = key.mode or "n"
      local opts = { desc = key.desc }
      vim.keymap.set(mode, key[1], key[2], opts)
    end
  end

  vim.api.nvim_create_autocmd("VimLeavePre", {
    callback = function()
      ipc.stop_service()
    end,
  })
end

function M.select_model()
  model_selector.get_model_selection(M.config.llm.models, M.config.llm.current_index, function(index)
    if index and index ~= M.config.llm.current_index then
      M.config.llm.current_index = index
      local selected = M.config.llm.models[index]
      local display_name = selected.label or (selected.provider .. ": " .. (selected.model or "default"))
      vim.notify(
        string.format("[nvim-redraft] Switched to %s", display_name),
        vim.log.levels.INFO
      )
      logger.info("select_model", string.format("Switched to model index %d: %s", index, display_name))
    end
  end)
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

  input.get_instruction(M.config, function(instruction)
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

    local current_model = M.config.llm.models[M.config.llm.current_index]
    logger.debug(
      "edit",
      string.format("Using model: %s (provider: %s)", current_model.model or "default", current_model.provider)
    )

    spinner.start("Processing edit...")

    ipc.send_request({
      code = sel.text,
      instruction = instruction,
      systemPrompt = M.config.system_prompt,
      provider = current_model.provider,
      model = current_model.model,
      baseURL = M.config.llm.base_url,
      maxOutputTokens = M.config.llm.max_output_tokens,
    }, function(result, error)
      spinner.stop()

      if error then
        local elapsed = (vim.loop.hrtime() - start_time) / 1e9
        logger.error("edit", string.format("Edit failed after %.2fs: %s", elapsed, error))
        vim.notify("[nvim-redraft] " .. error, vim.log.levels.ERROR)
        return
      end

      logger.debug("edit", "Final result:", result)

      replace.replace_selection(sel, result)

      local elapsed = (vim.loop.hrtime() - start_time) / 1e9
      logger.info("edit", string.format("Edit completed successfully in %.2fs", elapsed))
      vim.notify("[nvim-redraft] Edit applied", vim.log.levels.INFO)
    end)
  end)
end

return M
