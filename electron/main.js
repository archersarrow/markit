// Modules to control application life and create native browser window
const { app, BrowserWindow } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const { init, updateContent } = require("./actions");
const initShortCuts = require("./Menu/menu");
const { ipcMain } = require("electron/main");

app.name = "MarkIt";
const {
  GET_CONTENT_FROM_STORE,
  SAVE_CONTENT_IN_STORE,
  SET_THEME,
} = require("../constants");
const { setContent, getTheme } = require("./store/store");

let mainWindow = null;
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 900,
    title: "MarkIt",
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
};

app.whenReady().then(() => {
  createWindow();
  initShortCuts(mainWindow);
  init(mainWindow);

  ipcMain.on(GET_CONTENT_FROM_STORE, (event, data) =>
    updateContent(mainWindow)
  );

  ipcMain.on(SAVE_CONTENT_IN_STORE, (event, data) => setContent(data));

  mainWindow.webContents.on("ready-to-show", () => {
    updateContent(mainWindow);
    mainWindow.webContents.send(SET_THEME, getTheme());
  });

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  app.on("window-all-closed", function () {
    if (process.platform !== "darwin") app.quit();
  });
});
