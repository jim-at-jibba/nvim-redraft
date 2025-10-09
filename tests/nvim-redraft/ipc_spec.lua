local ipc = require("nvim-redraft.ipc")

describe("ipc", function()
  after_each(function()
    ipc.stop_service()
  end)

  describe("service lifecycle", function()
    it("should start service successfully", function()
      local started = ipc.start_service()
      assert.is_true(started)
      assert.is_not_nil(ipc.job_id)
    end)

    it("should reuse existing service", function()
      ipc.start_service()
      local first_job = ipc.job_id

      ipc.start_service()
      local second_job = ipc.job_id

      assert.equals(first_job, second_job)
    end)

    it("should stop service cleanly", function()
      ipc.start_service()
      assert.is_not_nil(ipc.job_id)

      ipc.stop_service()
      assert.is_nil(ipc.job_id)
    end)
  end)

  describe("request handling", function()
    it("should send request and receive response", function()
      local done = false
      local result_text = nil

      ipc.send_request({
        code = "const x = 1",
        instruction = "add semicolon",
        systemPrompt = "test",
      }, function(result, error)
        done = true
        result_text = result
      end)

      vim.wait(5000, function()
        return done
      end)

      assert.is_true(done)
    end)
  end)
end)
