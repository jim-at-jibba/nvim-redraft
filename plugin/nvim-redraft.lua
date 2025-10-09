if vim.g.loaded_nvim_redraft then
  return
end
vim.g.loaded_nvim_redraft = true

vim.api.nvim_create_user_command("RedraftEdit", function()
  require("nvim-redraft").edit()
end, { range = true })
