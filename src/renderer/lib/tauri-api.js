// Tauri API Bridge - replaces Electron preload.js
import { invoke } from '@tauri-apps/api/tauri'
import { open, save, message } from '@tauri-apps/api/dialog'
import { readDir, readTextFile, writeTextFile, copyFile, createDir } from '@tauri-apps/api/fs'
import { emit, listen } from '@tauri-apps/api/event'
import { sendNotification } from '@tauri-apps/api/notification'

// Create a window.api compatible interface
const tauriAPI = {
  // Invoke backend commands
  invoke: async (command, ...args) => {
    const commandMap = {
      'GET_GLOBALS': () => invoke('get_globals'),
      'SAVE_CONTENT_IN_STORE': (content) => invoke('save_content_in_store', { content }),
      'SET_THEME': (theme) => invoke('set_theme', { theme }),
      'SET_ALLOW_HTML': (allow) => invoke('set_allow_html', { allow }),
      'GET_GITHUB_TOKEN': () => invoke('get_github_token'),
      'SET_GITHUB_TOKEN': (token) => invoke('set_github_token', { token }),
      'SAVE_PNG_FILE': ({ filePath, data }) => invoke('save_png_file', { filePath, data }),
    }

    const handler = commandMap[command]
    if (handler) {
      return handler(...args)
    }
    return invoke(command, ...args)
  },

  // Send events (replaces IPC send)
  send: (channel, ...args) => {
    emit(channel, args.length === 1 ? args[0] : args)
  },

  // Listen to events (replaces IPC on)
  on: (channel, callback) => {
    return listen(channel, (event) => {
      callback(event, event.payload)
    })
  },

  // Remove listener
  removeListener: (channel, callback) => {
    // Tauri uses unlisten, which is returned from listen()
    // In practice, we store the unlisten function
  },

  // File system operations
  fs: {
    openFolderDialog: async () => {
      try {
        const result = await open({
          directory: true,
          multiple: false,
        })
        return result
      } catch (e) {
        return null
      }
    },

    listDir: async (path) => {
      try {
        return await invoke('fs_list_dir', { path })
      } catch (e) {
        console.error('Failed to list dir:', e)
        throw e
      }
    },

    readFile: async (path) => {
      try {
        return await invoke('fs_read_file', { path })
      } catch (e) {
        console.error('Failed to read file:', e)
        throw e
      }
    },

    writeFile: async (path, content) => {
      try {
        return await invoke('fs_write_file', { path, content })
      } catch (e) {
        console.error('Failed to write file:', e)
        throw e
      }
    },

    copyFile: async (src, dest) => {
      try {
        return await invoke('fs_copy_file', { src, dest })
      } catch (e) {
        console.error('Failed to copy file:', e)
        throw e
      }
    },

    ensureDir: async (path) => {
      try {
        return await invoke('fs_ensure_dir', { path })
      } catch (e) {
        console.error('Failed to ensure dir:', e)
        throw e
      }
    },
  },

  // Notification
  notification: {
    show: async (title, body) => {
      try {
        await sendNotification({ title, body })
      } catch (e) {
        console.error('Failed to show notification:', e)
      }
    }
  }
}

// Make it available globally for compatibility
if (typeof window !== 'undefined') {
  window.api = tauriAPI
}

export default tauriAPI
