const { contextBridge, ipcRenderer } = require('electron')

// Expose safe API to renderer process
contextBridge.exposeInMainWorld('api', {
  on: (channel, callback) => {
    ipcRenderer.on(channel, callback)
  },
  once: (channel, callback) => {
    ipcRenderer.once(channel, callback)
  },
  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback)
  },
  send: (channel, data) => {
    ipcRenderer.send(channel, data)
  },
  invoke: (channel, data) => {
    return ipcRenderer.invoke(channel, data)
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
