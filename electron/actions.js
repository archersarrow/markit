const { getContent } = require("./store/store");

const { SET_EDITOR_TEXT, SELECT_ALL } = require("../constants");

const updateContent = (mainWindow) =>
  mainWindow.webContents.send(SET_EDITOR_TEXT, getContent());

const init = (mainWindow) => () => {
  updateContent(mainWindow);
};

const selectAll = (mainWindow) => mainWindow.webContents.send(SELECT_ALL, getContent());

module.exports = {
  init,
  updateContent,
  selectAll
};
