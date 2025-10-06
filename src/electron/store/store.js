const Store = require("electron-store");

const store = new Store();

const getContent = () => store.get("content");

const setContent = (data) => store.set("content", data);

const setTheme = (theme) => store.set("theme", theme);

const getTheme = () => store.get("theme");

const setAllowHtml = (enable) => store.set("allowHtml", enable);

const getAllowHtml = () => store.get("allowHtml");

const setWorkspacePath = (path) => store.set("workspacePath", path);

const getWorkspacePath = () => store.get("workspacePath");

const setGithubToken = (token) => store.set("githubToken", token);

const getGithubToken = () => store.get("githubToken");

const setDefaultExportDir = (dir) => store.set("defaultExportDir", dir);

const getDefaultExportDir = () => store.get("defaultExportDir");

const setShowToc = (show) => store.set("showToc", show);

const getShowToc = () => store.get("showToc", false);

module.exports = {
  getContent,
  setContent,
  setTheme,
  getTheme,
  setAllowHtml,
  getAllowHtml,
  setWorkspacePath,
  getWorkspacePath,
  setGithubToken,
  getGithubToken,
  setDefaultExportDir,
  getDefaultExportDir,
  setShowToc,
  getShowToc,
};
