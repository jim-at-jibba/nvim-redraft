local logger = require("nvim-redraft.logger")

describe("logger", function()
  local test_log_file

  before_each(function()
    test_log_file = vim.fn.tempname() .. ".log"
    logger.enabled = false
    logger.log_file = nil
  end)

  after_each(function()
    if test_log_file and vim.fn.filereadable(test_log_file) == 1 then
      vim.fn.delete(test_log_file)
    end
  end)

  describe("init", function()
    it("should initialize with debug enabled", function()
      logger.init({ debug = true, log_file = test_log_file })

      assert.is_true(logger.enabled)
      assert.equals(test_log_file, logger.log_file)
      assert.equals(1, vim.fn.filereadable(test_log_file))
    end)

    it("should not create log file when debug disabled", function()
      logger.init({ debug = false, log_file = test_log_file })

      assert.is_false(logger.enabled)
      assert.equals(0, vim.fn.filereadable(test_log_file))
    end)

    it("should use default log file path", function()
      logger.init({ debug = true })

      assert.is_not_nil(logger.log_file)
      assert.is_true(logger.log_file:match("nvim%-redraft%.log$") ~= nil)
    end)

    it("should set custom max_content_size", function()
      logger.init({ debug = true, log_file = test_log_file, debug_max_log_size = 1000 })

      assert.equals(1000, logger.max_content_size)
    end)

    it("should use default max_content_size", function()
      logger.init({ debug = true, log_file = test_log_file })

      assert.equals(5000, logger.max_content_size)
    end)
  end)

  describe("logging functions", function()
    before_each(function()
      logger.init({ debug = true, log_file = test_log_file })
    end)

    it("should write debug log", function()
      logger.debug("test-source", "debug message")

      local content = table.concat(vim.fn.readfile(test_log_file), "\n")
      assert.is_true(content:match("%[DEBUG%]") ~= nil)
      assert.is_true(content:match("%[lua:test%-source%]") ~= nil)
      assert.is_true(content:match("debug message") ~= nil)
    end)

    it("should write info log", function()
      logger.info("test-source", "info message")

      local content = table.concat(vim.fn.readfile(test_log_file), "\n")
      assert.is_true(content:match("%[INFO%]") ~= nil)
      assert.is_true(content:match("info message") ~= nil)
    end)

    it("should write warn log", function()
      logger.warn("test-source", "warn message")

      local content = table.concat(vim.fn.readfile(test_log_file), "\n")
      assert.is_true(content:match("%[WARN%]") ~= nil)
      assert.is_true(content:match("warn message") ~= nil)
    end)

    it("should write error log", function()
      logger.error("test-source", "error message")

      local content = table.concat(vim.fn.readfile(test_log_file), "\n")
      assert.is_true(content:match("%[ERROR%]") ~= nil)
      assert.is_true(content:match("error message") ~= nil)
    end)

    it("should log content on separate lines", function()
      logger.debug("test-source", "message", "line 1\nline 2\nline 3")

      local content = table.concat(vim.fn.readfile(test_log_file), "\n")
      assert.is_true(content:match("  line 1") ~= nil)
      assert.is_true(content:match("  line 2") ~= nil)
      assert.is_true(content:match("  line 3") ~= nil)
    end)

    it("should not log when disabled", function()
      logger.enabled = false
      logger.debug("test-source", "should not appear")

      local size = vim.fn.getfsize(test_log_file)
      local initial_size = size

      logger.debug("test-source", "another message")
      size = vim.fn.getfsize(test_log_file)

      assert.equals(initial_size, size)
    end)
  end)

  describe("content truncation", function()
    before_each(function()
      logger.init({ debug = true, log_file = test_log_file, debug_max_log_size = 50 })
    end)

    it("should truncate long content", function()
      local long_content = string.rep("a", 100)
      logger.debug("test-source", "message", long_content)

      local content = table.concat(vim.fn.readfile(test_log_file), "\n")
      assert.is_true(content:match("truncated") ~= nil)
      assert.is_true(content:match("50 more chars") ~= nil)
    end)

    it("should not truncate short content", function()
      local short_content = string.rep("a", 30)
      logger.debug("test-source", "message", short_content)

      local content = table.concat(vim.fn.readfile(test_log_file), "\n")
      assert.is_false(content:match("truncated") ~= nil)
    end)

    it("should not truncate when max_content_size is 0", function()
      logger.max_content_size = 0
      local long_content = string.rep("a", 10000)
      logger.debug("test-source", "message", long_content)

      local content = table.concat(vim.fn.readfile(test_log_file), "\n")
      assert.is_false(content:match("truncated") ~= nil)
    end)
  end)
end)
