// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const { init, updateContent } = require('./actions')
const initShortCuts = require('./Menu/menu')
const { ipcMain } = require('electron/main')
const { format } = require('url')
const { join } = require('path')
const isDev = require('electron-is-dev')
const prepareNext = require('electron-next')
const log = require('electron-log')
const { GET_CONTENT_FROM_STORE, SAVE_CONTENT_IN_STORE, SET_THEME } = require('./constants')
const { setContent, getTheme, getContent, getAllowHtml } = require('./store/store')
const { autoUpdater } = require('electron-updater')

autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'
log.info('App starting...')
app.whenReady().then(async () => {
  app.name = 'MarkIt'
  if (process.platform !== 'darwin') {
    log.info('Checking for auto update')
    autoUpdater.checkForUpdatesAndNotify()
  }

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

  function sendStatus(text) {
    log.info(text)
    if (win) {
      mainWindow.webContents.send('message', text)
    }
  }

  mainWindow.webContents.on('ready-to-show', () => {
    //Auto update

    if (isDev) {
      mainWindow.webContents.openDevTools()
    }

    if (process.platform !== 'darwin') {
      log.info('Entered inti If')
      autoUpdater.on('checking-for-update', () => {
        sendStatus('Checking for update...')
      })
      autoUpdater.on('update-available', (ev, info) => {
        sendStatus('Update available.')
        log.info('info', info)
        log.info('arguments', arguments)
      })
      autoUpdater.on('update-not-available', (ev, info) => {
        sendStatus('Update not available.')
        log.info('info', info)
        log.info('arguments', arguments)
      })
      autoUpdater.on('error', (ev, err) => {
        sendStatus('Error in auto-updater.')
        log.info('err', err)
        log.info('arguments', arguments)
      })

      autoUpdater.on('update-downloaded', (ev, info) => {
        sendStatus('Update downloaded.  Will quit and install in 5 seconds.')
        log.info('info', info)
        log.info('arguments', arguments)
        // Wait 5 seconds, then quit and install
        autoUpdater.quitAndInstall()
      })
    }
    //Auto update end

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
