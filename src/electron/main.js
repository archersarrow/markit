const { app, BrowserWindow, Notification } = require('electron')
const { init, updateContent } = require('./actions')
const initShortCuts = require('./Menu/menu')
const { ipcMain, dialog } = require('electron/main')
const { format } = require('url')
const { join, dirname, extname } = require('path')
const { writeFile, readFile, readdir, copyFile, mkdir, stat } = require('fs/promises')
const isDev = !app.isPackaged
const log = require('electron-log')
const { GET_CONTENT_FROM_STORE, SAVE_CONTENT_IN_STORE, SET_THEME } = require('./constants')
const { setContent, getTheme, getContent, getAllowHtml, setWorkspacePath, getWorkspacePath, getGithubToken, setGithubToken } = require('./store/store')
const { autoUpdater } = require('electron-updater')
const { showNotification } = require('./helper')

const browserWindowOptions = {
  width: 1000,
  height: 900,
  title: 'MarkIt',
  icon: join(__dirname, '../images/logo.icns'),
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    sandbox: true,
    preload: join(__dirname, 'preload.js')
  }
}

autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'
log.info('App starting...')

const createMainWindow = async () => {
  const mainWindow = new BrowserWindow(browserWindowOptions)

  const url = isDev
    ? 'http://localhost:3000'
    : format({
        pathname: join(__dirname, '../renderer/out/index.html'),
        protocol: 'file:',
        slashes: true
      })

  mainWindow.loadURL(url)

  initShortCuts(mainWindow)
  init(mainWindow)

  mainWindow.webContents.on('ready-to-show', () => {
    if (isDev) {
      mainWindow.webContents.openDevTools()
    }

    if (process.platform !== 'darwin') autoUpdate(mainWindow)

    updateContent(mainWindow)
    mainWindow.webContents.send(SET_THEME, getTheme())
  })

  return mainWindow
}

app.whenReady().then(async () => {
  app.name = 'MarkIt'
  if (process.platform !== 'darwin') {
    log.info('Checking for auto update')
    autoUpdater
      .checkForUpdatesAndNotify()
      .then(data => log.info(JSON.stringify(data)))
      .catch(err => log.error(err))
  }

  ipcMain.handle('GET_GLOBALS', () => ({
    content: getContent(),
    theme: getTheme(),
    allowHtml: getAllowHtml()
  }))

  ipcMain.on(GET_CONTENT_FROM_STORE, (event, data) => updateContent(BrowserWindow.getFocusedWindow()))

  ipcMain.on(SAVE_CONTENT_IN_STORE, (event, data) => setContent(data))

  ipcMain.on('EXPORT_TO_PDF', async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    try {
      const pdfData = await window.webContents.printToPDF({
        printBackground: true,
        marginsType: 1,
        pageSize: 'A4'
      })

      const { filePath, canceled } = await dialog.showSaveDialog(window, {
        defaultPath: 'export.pdf',
        filters: [{ name: 'PDF', extensions: ['pdf'] }]
      })

      if (!canceled && filePath) {
        await writeFile(filePath, pdfData)
      }
    } catch (error) {
      log.error('Failed to export PDF:', error)
    }
  })

  // Filesystem IPC handlers
  ipcMain.handle('FS_LIST_DIR', async (event, dirPath) => {
    try {
      const entries = await readdir(dirPath, { withFileTypes: true })
      return Promise.all(
        entries.map(async (entry) => {
          const fullPath = join(dirPath, entry.name)
          const stats = await stat(fullPath)
          return {
            name: entry.name,
            path: fullPath,
            isDirectory: entry.isDirectory(),
            isFile: entry.isFile(),
            extension: extname(entry.name),
            size: stats.size,
            modified: stats.mtime
          }
        })
      )
    } catch (error) {
      log.error('Failed to list directory:', error)
      throw error
    }
  })

  ipcMain.handle('FS_READ_FILE', async (event, filePath) => {
    try {
      const content = await readFile(filePath, 'utf-8')
      return content
    } catch (error) {
      log.error('Failed to read file:', error)
      throw error
    }
  })

  ipcMain.handle('FS_WRITE_FILE', async (event, { path, content }) => {
    try {
      await writeFile(path, content, 'utf-8')
      return true
    } catch (error) {
      log.error('Failed to write file:', error)
      throw error
    }
  })

  let openFolderBusy = false
  ipcMain.handle('OPEN_FOLDER_DIALOG', async () => {
    if (openFolderBusy) return null
    openFolderBusy = true
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
      })
      if (!result.canceled && result.filePaths.length > 0) {
        const folderPath = result.filePaths[0]
        setWorkspacePath(folderPath)
        return folderPath
      }
      return null
    } finally {
      openFolderBusy = false
    }
  })

  ipcMain.handle('FS_COPY_FILE', async (event, { src, dest }) => {
    try {
      await copyFile(src, dest)
      return true
    } catch (error) {
      log.error('Failed to copy file:', error)
      throw error
    }
  })

  ipcMain.handle('FS_ENSURE_DIR', async (event, dirPath) => {
    try {
      await mkdir(dirPath, { recursive: true })
      return true
    } catch (error) {
      log.error('Failed to ensure directory:', error)
      throw error
    }
  })

  // Settings: GitHub token
  ipcMain.handle('GET_GITHUB_TOKEN', async () => {
    try {
      return getGithubToken()
    } catch (error) {
      log.error('Failed to get GitHub token:', error)
      throw error
    }
  })

  ipcMain.handle('SET_GITHUB_TOKEN', async (event, token) => {
    try {
      setGithubToken(token)
      return true
    } catch (error) {
      log.error('Failed to set GitHub token:', error)
      throw error
    }
  })

  await createMainWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })

  app.on('window-all-closed', () => {
    app.quit()
  })
})

const autoUpdate = mainWindow => {
  function sendStatus(text) {
    log.info(text)
  }

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
    mainWindow.setProgressBar(progressObj.percent / 100)
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
