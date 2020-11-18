const { app, BrowserWindow, Notification } = require('electron')
const { init, updateContent } = require('./actions')
const initShortCuts = require('./Menu/menu')
const { ipcMain, dialog } = require('electron/main')
const { format } = require('url')
const { join } = require('path')
const isDev = require('electron-is-dev')
const prepareNext = require('electron-next')
const log = require('electron-log')
const { GET_CONTENT_FROM_STORE, SAVE_CONTENT_IN_STORE, SET_THEME } = require('./constants')
const { setContent, getTheme, getContent, getAllowHtml } = require('./store/store')
const { autoUpdater } = require('electron-updater')
const { showNotification } = require('./helper')

const browserWindowOptions = {
  width: 1000,
  height: 900,
  title: 'MarkIt',
  icon: join(__dirname, '../images/logo.tiff'),
  webPreferences: {
    nodeIntegration: true,
    enableRemoteModule: true
  }
}

autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'
log.info('App starting...')

app.whenReady().then(async () => {
  app.name = 'MarkIt'
  if (process.platform !== 'darwin') {
    log.info('Checking for auto update')
    autoUpdater
      .checkForUpdatesAndNotify()
      .then(data => log.info(JSON.stringify(data)))
      .catch(err => log.error(err))
  }
  showNotification('Hey', 'Hello....')
  await prepareNext('./src/renderer')
  const mainWindow = new BrowserWindow(browserWindowOptions)

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
    if (isDev) {
      mainWindow.webContents.openDevTools()
    }
    autoUpdate(mainWindow)

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

const autoUpdate = mainWindow => {
  function sendStatus(text) {
    log.info(text)
  }

  if (process.platform !== 'darwin') {
    log.info('Entered inti If')
    autoUpdater.on('checking-for-update', () => {
      sendStatus('Checking for update...')
    })
    autoUpdater.on('update-available', (ev, info) => {
      sendStatus('Update available.')
      log.info('info', info)
    })

    autoUpdater.on('download-progress', progressObj => {
      let log_message = 'Download speed: ' + progressObj.bytesPerSecond
      log_message = log_message + ' - Downloaded ' + progressObj.percent + '%'
      log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')'
      sendStatus(log_message)
      mainWindow.setProgressBar(progressObj.percent / 10)
    })

    autoUpdater.on('update-not-available', (ev, info) => {
      sendStatus('Update not available.')
      log.info('info', info)
    })
    autoUpdater.on('error', (ev, err) => {
      sendStatus('Error in auto-updater.')
      log.info('err', err)
    })

    autoUpdater.on('update-downloaded', (ev, info) => {
      sendStatus('Update downloaded.  Will quit and install')
      log.info('info', info)
      showNotification('Update Downloaded', 'Restarting the app...')
      dialog
        .showMessageBox({
          buttons: ['Restart now', 'Do it later'],
          message: 'Restart required to update'
        })
        .then((res, checked) => {
          if (res.response === 0) autoUpdater.quitAndInstall()
        })
        .catch(log.error)
    })
  }
}
