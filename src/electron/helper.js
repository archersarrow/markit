const { BrowserWindow, Notification, clipboard, dialog } = require('electron')
const fs = require('fs')
const { SET_EDITOR_TEXT } = require('./constants')
const { updateContent } = require('./actions')
const { setContent, getContent, setWorkspacePath } = require('./store/store')

let openDialogBusy = false
let saveAsDialogBusy = false
let openFolderBusy = false
let exportHtmlBusy = false
let exportPdfBusy = false
let exportPngBusy = false

const readFile = filePath => {
  try {
    return fs.readFileSync(filePath)
  } catch (err) {
    console.error(err)
  }
}

const writeFile = (filePath, data) => {
  try {
    return fs.writeFileSync(filePath, data)
  } catch (err) {
    console.error(err)
  }
}

const openFile = () => {
  if (openDialogBusy) return
  openDialogBusy = true
  const { dialog } = require('electron')
  const fs = require('fs')
  dialog
    .showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Markdown', extensions: ['md'] }]
    })
    .then(data => {
      if (!data.canceled) {
        const content = readFile(data.filePaths[0]).toString()
        setContent(content)
        global.currentFilePath = data.filePaths[0]
        BrowserWindow.getFocusedWindow().webContents.send(SET_EDITOR_TEXT, content)
      }
    })
    .catch(console.error)
    .finally(() => {
      openDialogBusy = false
    })
}

const saveFileAs = () => {
  if (saveAsDialogBusy) return
  saveAsDialogBusy = true
  const { dialog } = require('electron')
  const fs = require('fs')
  dialog
    .showSaveDialog({
      filters: [{ name: 'Markdown', extensions: ['md'] }]
    })
    .then(data => {
      if (!data.canceled) {
        const content = getContent()
        writeFile(data.filePath, content)
        global.currentFilePath = data.filePath
      }
    })
    .catch(console.error)
    .finally(() => {
      saveAsDialogBusy = false
    })
}

const openFolder = () => {
  if (openFolderBusy) return
  openFolderBusy = true
  dialog
    .showOpenDialog({
      properties: ['openDirectory']
    })
    .then(result => {
      if (!result.canceled && result.filePaths.length > 0) {
        const folderPath = result.filePaths[0]
        setWorkspacePath(folderPath)
        BrowserWindow.getFocusedWindow().webContents.send('WORKSPACE_OPENED', folderPath)
      }
    })
    .catch(console.error)
    .finally(() => {
      openFolderBusy = false
    })
}

const exportAsHTML = async () => {
  if (exportHtmlBusy) return
  exportHtmlBusy = true
  try {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return
    const innerHTML = await win.webContents.executeJavaScript(
      "(function(){ const el = document.querySelector('[data-testid=\"markdown-preview\"]'); return el ? el.innerHTML : '' })()"
    )
    const { filePath, canceled } = await dialog.showSaveDialog(win, {
      defaultPath: 'export.html',
      filters: [{ name: 'HTML', extensions: ['html'] }]
    })
    if (!canceled && filePath) {
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Markdown</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #24292e;
      max-width: 900px;
      margin: 0 auto;
      padding: 32px;
      background: #fff;
    }
    .markdown-body { word-wrap: break-word; }
    .markdown-body h1, .markdown-body h2 { border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
    .markdown-body h1 { font-size: 2em; margin: 0.67em 0; }
    .markdown-body h2 { font-size: 1.5em; margin: 0.75em 0; }
    .markdown-body h3 { font-size: 1.25em; margin: 1em 0; }
    .markdown-body code { background-color: rgba(27, 31, 35, 0.05); border-radius: 3px; font-family: 'Courier New', Courier, monospace; font-size: 85%; padding: 0.2em 0.4em; }
    .markdown-body pre { background-color: #f6f8fa; border-radius: 3px; font-size: 85%; line-height: 1.45; overflow: auto; padding: 16px; }
    .markdown-body pre code { background-color: transparent; padding: 0; }
    .markdown-body blockquote { border-left: 4px solid #dfe2e5; color: #6a737d; padding: 0 1em; margin: 0; }
    .markdown-body table { border-collapse: collapse; width: 100%; }
    .markdown-body table th, .markdown-body table td { border: 1px solid #dfe2e5; padding: 6px 13px; }
    .markdown-body table tr:nth-child(2n) { background-color: #f6f8fa; }
    .markdown-body img { max-width: 100%; }
    .markdown-body a { color: #0366d6; text-decoration: none; }
    .markdown-body a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="markdown-body">${innerHTML}</div>
</body>
</html>`
      fs.writeFileSync(filePath, htmlContent)
      BrowserWindow.getFocusedWindow()?.webContents.send('SHOW_TOAST', {
        message: 'HTML exported successfully',
        type: 'success'
      })
    }
  } catch (e) {
    console.error('Failed to export HTML', e)
    BrowserWindow.getFocusedWindow()?.webContents.send('SHOW_TOAST', {
      message: 'Failed to export HTML',
      type: 'error'
    })
  } finally {
    exportHtmlBusy = false
  }
}

const exportAsPDF = async () => {
  if (exportPdfBusy) return
  exportPdfBusy = true
  try {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return

    const { filePath, canceled } = await dialog.showSaveDialog(win, {
      defaultPath: 'export.pdf',
      filters: [{ name: 'PDF', extensions: ['pdf'] }]
    })

    if (!canceled && filePath) {
      // Trigger the renderer to export PDF from preview only
      win.webContents.send('DO_EXPORT_PDF', filePath)
      win.webContents.send('SHOW_TOAST', {
        message: 'PDF exported successfully',
        type: 'success'
      })
    }
  } catch (e) {
    console.error('Failed to export PDF', e)
    win?.webContents.send('SHOW_TOAST', {
      message: 'Failed to export PDF',
      type: 'error'
    })
  } finally {
    exportPdfBusy = false
  }
}

const exportAsPNG = async () => {
  if (exportPngBusy) return
  exportPngBusy = true
  try {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return

    const { filePath, canceled } = await dialog.showSaveDialog(win, {
      defaultPath: 'export.png',
      filters: [{ name: 'PNG', extensions: ['png'] }]
    })

    if (!canceled && filePath) {
      // Trigger the renderer to export PNG from preview only
      win.webContents.send('DO_EXPORT_PNG', filePath)
      win.webContents.send('SHOW_TOAST', {
        message: 'PNG exported successfully',
        type: 'success'
      })
    }
  } catch (e) {
    console.error('Failed to export PNG', e)
    win?.webContents.send('SHOW_TOAST', {
      message: 'Failed to export PNG',
      type: 'error'
    })
  } finally {
    exportPngBusy = false
  }
}

const saveFile = () => {
  if (global.currentFilePath) {
    const content = getContent()
    return writeFile(global.currentFilePath, content)
  }
  saveFileAs()
}

const clearAll = mainWindow => {
  setContent('')
  updateContent(mainWindow)
  global.currentFilePath = null
}

const showNotification = (title, body) => {
  const notification = {
    title,
    body
  }
  new Notification(notification).show()
}

module.exports = { openFile, openFolder, saveFileAs, saveFile, clearAll, showNotification, exportAsPNG, exportAsPDF, exportAsHTML }
