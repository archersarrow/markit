const Store = require("electron-store");

const store = new Store();

const getContent = () => store.get("content");

const setContent = (data) => store.set("content", data);

const setTheme = (theme) => store.set("theme", theme);

const getTheme = () => store.get("theme");

const setAllowHtml = (enable) => store.set("allowHtml", enable);

const getAllowHtml = () => store.get("allowHtml");

module.exports = {
  getContent,
  setContent,
  setTheme,
  getTheme,
  setAllowHtml,
  getAllowHtml,
};
