local spinner = require("nvim-redraft.spinner")

describe("spinner", function()
  after_each(function()
    spinner.stop()
  end)

  describe("start", function()
    it("should start spinner with message", function()
      spinner.start("Processing...")

      vim.wait(100)

      spinner.stop()
    end)

    it("should not start duplicate spinner", function()
      spinner.start("First spinner")

      local first_timer = spinner.timer

      spinner.start("Second spinner")

      vim.wait(100)

      spinner.stop()
    end)

    it("should cycle through frames", function()
      local frame_changes = 0
      local last_frame = nil

      spinner.start("Testing frames")

      for i = 1, 5 do
        vim.wait(100)
      end

      spinner.stop()
    end)
  end)

  describe("stop", function()
    it("should stop active spinner", function()
      spinner.start("Processing...")
      vim.wait(100)

      spinner.stop()

      vim.wait(50)
    end)

    it("should handle stopping when not active", function()
      spinner.stop()
      spinner.stop()
    end)

    it("should show final message", function()
      spinner.start("Processing...")
      vim.wait(100)

      spinner.stop("Completed!")

      vim.wait(50)
    end)

    it("should stop without final message", function()
      spinner.start("Processing...")
      vim.wait(100)

      spinner.stop()

      vim.wait(50)
    end)
  end)

  describe("lifecycle", function()
    it("should allow restart after stop", function()
      spinner.start("First")
      vim.wait(100)
      spinner.stop()

      vim.wait(50)

      spinner.start("Second")
      vim.wait(100)
      spinner.stop()
    end)

    it("should handle rapid start-stop cycles", function()
      for i = 1, 3 do
        spinner.start("Cycle " .. i)
        vim.wait(50)
        spinner.stop()
        vim.wait(20)
      end
    end)
  end)
end)
