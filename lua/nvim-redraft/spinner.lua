local M = {}

local spinner_frames = { "⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏" }
local spinner_state = {
  timer = nil,
  frame = 1,
  active = false,
}

function M.start(message)
  if spinner_state.active then
    return
  end

  spinner_state.active = true
  spinner_state.frame = 1

  spinner_state.timer = vim.loop.new_timer()
  spinner_state.timer:start(
    0,
    80,
    vim.schedule_wrap(function()
      if not spinner_state.active then
        return
      end

      local frame = spinner_frames[spinner_state.frame]
      vim.api.nvim_echo(
        { { string.format("%s %s", frame, message), "Normal" } },
        false,
        {}
      )

      spinner_state.frame = (spinner_state.frame % #spinner_frames) + 1
    end)
  )
end

function M.stop(final_message)
  if not spinner_state.active then
    return
  end

  spinner_state.active = false

  if spinner_state.timer then
    spinner_state.timer:stop()
    spinner_state.timer:close()
    spinner_state.timer = nil
  end

  vim.schedule(function()
    vim.api.nvim_echo({ { "", "Normal" } }, false, {})
    
    if final_message then
      vim.notify(final_message, vim.log.levels.INFO)
    end
  end)
end

return M
