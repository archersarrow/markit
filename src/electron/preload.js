const { contextBridge, ipcRenderer } = require('electron')

// Allowed channels
const allowedReceiveChannels = new Set([
  'SET_EDITOR_TEXT', 'SET_THEME', 'SET_ALLOW_HTML', 'SELECT_ALL',
  'EXPORT_TO_HTML', 'EXPORT_TO_PDF', 'EXPORT_TO_PNG', 'COPY_HTML_TO_CLIPBOARD',
  'PUBLISH_GIST', 'TOGGLE_TOC', 'OPEN_SETTINGS', 'OPEN_WORKSPACE_FOLDER', 'WORKSPACE_OPENED', 'TOGGLE_PREVIEW'
])

const allowedSendChannels = new Set([
  'EXPORT_TO_PDF', 'SAVE_CONTENT_IN_STORE'
])

const allowedInvokeChannels = new Set([
  'GET_GLOBALS', 'FS_LIST_DIR', 'FS_READ_FILE', 'FS_WRITE_FILE', 'OPEN_FOLDER_DIALOG', 'FS_COPY_FILE', 'FS_ENSURE_DIR'
])

// Expose safe API to renderer process
contextBridge.exposeInMainWorld('api', {
  on: (channel, callback) => {
    if (allowedReceiveChannels.has(channel)) {
      ipcRenderer.on(channel, callback)
    }
  },
  once: (channel, callback) => {
    if (allowedReceiveChannels.has(channel)) {
      ipcRenderer.once(channel, callback)
    }
  },
  removeListener: (channel, callback) => {
    if (allowedReceiveChannels.has(channel)) {
      ipcRenderer.removeListener(channel, callback)
    }
  },
  send: (channel, data) => {
    if (allowedSendChannels.has(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
  invoke: (channel, data) => {
    if (allowedInvokeChannels.has(channel)) {
      return ipcRenderer.invoke(channel, data)
    }
    return Promise.reject(new Error('Blocked IPC invoke channel'))
  },
  // Workspace and file system APIs
  fs: {
    listDir: (path) => ipcRenderer.invoke('FS_LIST_DIR', path),
    readFile: (path) => ipcRenderer.invoke('FS_READ_FILE', path),
    writeFile: (path, content) => ipcRenderer.invoke('FS_WRITE_FILE', { path, content }),
    openFolderDialog: () => ipcRenderer.invoke('OPEN_FOLDER_DIALOG'),
    copyFile: (src, dest) => ipcRenderer.invoke('FS_COPY_FILE', { src, dest }),
    ensureDir: (path) => ipcRenderer.invoke('FS_ENSURE_DIR', path)
  }
})
