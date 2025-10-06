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
      const htmlContent = `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Exported Markdown</title>\n</head>\n<body>\n<div class="markdown-body">${innerHTML}</div>\n</body>\n</html>`
      fs.writeFileSync(filePath, htmlContent)
    }
  } catch (e) {
    console.error('Failed to export HTML', e)
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
    const pdfData = await win.webContents.printToPDF({
      printBackground: true,
      marginsType: 1,
      pageSize: 'A4'
    })
    const { filePath, canceled } = await dialog.showSaveDialog(win, {
      defaultPath: 'export.pdf',
      filters: [{ name: 'PDF', extensions: ['pdf'] }]
    })
    if (!canceled && filePath) {
      fs.writeFileSync(filePath, pdfData)
    }
  } catch (e) {
    console.error('Failed to export PDF', e)
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
    const image = await win.webContents.capturePage()
    const pngBuffer = image.toPNG()
    const { filePath, canceled } = await dialog.showSaveDialog(win, {
      defaultPath: 'export.png',
      filters: [{ name: 'PNG', extensions: ['png'] }]
    })
    if (!canceled && filePath) {
      fs.writeFileSync(filePath, pngBuffer)
    }
  } catch (e) {
    console.error('Failed to export PNG', e)
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
