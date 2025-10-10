local logger = require("nvim-redraft.logger")

local M = {}

M.job_id = nil
M.request_id = 0
M.pending_requests = {}
M.config = {}

local function get_service_path()
  local plugin_path = vim.fn.fnamemodify(debug.getinfo(1).source:sub(2), ":p:h:h:h")
  return plugin_path .. "/ts/dist/index.js"
end

function M.start_service()
  if M.job_id and vim.fn.jobwait({ M.job_id }, 0)[1] == -1 then
    return true
  end

  local service_path = get_service_path()

  logger.debug("ipc", "Starting TypeScript service: " .. service_path)

  local env = vim.fn.environ()
  env.NVIM_REDRAFT_DEBUG = M.config.debug and "1" or "0"
  env.NVIM_REDRAFT_LOG_FILE = M.config.log_file or ""

  M.job_id = vim.fn.jobstart({ "node", service_path }, {
    env = env,
    on_stdout = function(_, data)
      for _, line in ipairs(data) do
        if line and line ~= "" then
          M.handle_response(line)
        end
      end
    end,
    on_stderr = function(_, data)
      for _, line in ipairs(data) do
        if line and line ~= "" then
          logger.debug("ipc", "Service stderr: " .. line)
          vim.notify("[nvim-redraft] " .. line, vim.log.levels.DEBUG)
        end
      end
    end,
    on_exit = function(_, exit_code)
      logger.info("ipc", "Service exited with code " .. exit_code)
      if exit_code ~= 0 then
        vim.notify("[nvim-redraft] Service exited with code " .. exit_code, vim.log.levels.ERROR)
      end
      M.job_id = nil
    end,
    stdout_buffered = false,
    stderr_buffered = false,
  })

  if M.job_id <= 0 then
    logger.error("ipc", "Failed to start TypeScript service")
    vim.notify("[nvim-redraft] Failed to start TypeScript service", vim.log.levels.ERROR)
    return false
  end

  logger.info("ipc", "TypeScript service started with job_id " .. M.job_id)
  return true
end

function M.send_request(params, callback)
  if not M.start_service() then
    callback(nil, "Failed to start service")
    return
  end

  M.request_id = M.request_id + 1
  local id = M.request_id

  M.pending_requests[id] = {
    callback = callback,
  }

  local request = vim.fn.json_encode({
    id = id,
    method = "edit",
    params = params,
  })

  logger.debug("ipc", string.format("Sending request #%d (method: edit)", id))
  logger.debug("ipc", "Request params:", vim.inspect(params))

  vim.fn.chansend(M.job_id, request .. "\n")
end

function M.handle_response(line)
  local ok, response = pcall(vim.fn.json_decode, line)
  if not ok then
    logger.error("ipc", "Failed to parse response: " .. line)
    vim.notify("[nvim-redraft] Failed to parse response: " .. line, vim.log.levels.ERROR)
    return
  end

  logger.debug("ipc", string.format("Received response #%d", response.id))

  local request_data = M.pending_requests[response.id]
  if not request_data then
    logger.warn("ipc", string.format("No callback found for response #%d", response.id))
    return
  end

  M.pending_requests[response.id] = nil

  if response.error then
    logger.error("ipc", string.format("Response #%d error: %s", response.id, response.error))
    request_data.callback(nil, response.error)
  elseif response.result then
    logger.debug("ipc", string.format("Response #%d result:", response.id), response.result)
    request_data.callback(response.result, nil)
  end
end

function M.stop_service()
  if M.job_id then
    vim.fn.jobstop(M.job_id)
    M.job_id = nil
  end
end

return M
