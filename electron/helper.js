const { BrowserWindow } = require("electron");
const fs = require("fs");
const { SET_EDITOR_TEXT } = require("./constants");
const { updateContent } = require("./actions");
const { setContent, getContent } = require("./store/store");

const readFile = (filePath) => {
  try {
    return fs.readFileSync(filePath);
  } catch (err) {
    console.error(err);
  }
};

const writeFile = (filePath, data) => {
  try {
    return fs.writeFileSync(filePath, data);
  } catch (err) {
    console.error(err);
  }
};

const openFile = () => {
  const { dialog } = require("electron");
  const fs = require("fs");
  dialog
    .showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "Markdown", extensions: ["md"] }],
    })
    .then((data) => {
      if (!data.canceled) {
        const content = readFile(data.filePaths[0]).toString();
        setContent(content);
        global.currentFilePath = data.filePaths[0];
        BrowserWindow.getFocusedWindow().webContents.send(
          SET_EDITOR_TEXT,
          content
        );
      }
    })
    .catch(console.error);
};

const saveFileAs = () => {
  const { dialog } = require("electron");
  const fs = require("fs");
  dialog
    .showSaveDialog({
      filters: [{ name: "Markdown", extensions: ["md"] }],
    })
    .then((data) => {
      if (!data.canceled) {
        const content = getContent();
        writeFile(data.filePath, content);
        global.currentFilePath = data.filePath;
      }
    })
    .catch(console.error);
};

const saveFile = () => {
  if (global.currentFilePath) {
    const content = getContent();
    return writeFile(global.currentFilePath, content);
  }
  saveFileAs();
};

const clearAll = (mainWindow) => {
  setContent("");
  updateContent(mainWindow);
  global.currentFilePath = null;
};

module.exports = { openFile, saveFileAs, saveFile, clearAll };
