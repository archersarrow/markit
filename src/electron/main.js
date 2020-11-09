// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const { init, updateContent } = require('./actions')
const initShortCuts = require('./Menu/menu')
const { ipcMain } = require('electron/main')
const { format } = require('url')
const { join } = require('path')
const autoUpdater = require('electron-updater')

const isDev = require('electron-is-dev')
const prepareNext = require('electron-next')

const { GET_CONTENT_FROM_STORE, SAVE_CONTENT_IN_STORE, SET_THEME } = require('./constants')
const { setContent, getTheme, getContent, getAllowHtml } = require('./store/store')

app.whenReady().then(async () => {
  app.name = 'MarkIt'
  if (process.platform !== 'darwin') autoUpdater.checkForUpdatesAndNotify()

  await prepareNext('./src/renderer')
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 900,
    title: 'MarkIt',
    icon: join(__dirname, '../images/logo.tiff'),
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })

  const url = isDev
    ? 'http://localhost:3000'
    : format({
        pathname: join(__dirname, '../renderer/out/index.html'),
        protocol: 'file:',
        slashes: true
      })

  mainWindow.loadURL(url)
  global.content = getContent()
  global.theme = getTheme()
  global.allowHtml = getAllowHtml()

  initShortCuts(mainWindow)
  init(mainWindow)

  ipcMain.on(GET_CONTENT_FROM_STORE, (event, data) => updateContent(mainWindow))

  ipcMain.on(SAVE_CONTENT_IN_STORE, (event, data) => setContent(data))

  mainWindow.webContents.on('ready-to-show', () => {
    mainWindow.webContents.openDevTools()
    updateContent(mainWindow)
    mainWindow.webContents.send(SET_THEME, getTheme())
  })

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
})
