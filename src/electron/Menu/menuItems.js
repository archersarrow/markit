const { app } = require('electron')
const { openFile, openFolder, saveFileAs, saveFile, clearAll, exportAsHTML, exportAsPDF, exportAsPNG } = require('../helper')
const { selectAll } = require('../actions')
const shell = require('electron').shell

const themes = require('../constants/themes.json')
const { SET_THEME, SET_ALLOW_HTML } = require('../constants')
const { getTheme, setTheme, getAllowHtml, setAllowHtml } = require('../store/store')

module.exports = mainWindow => {
  const menuItems = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open',
          click() {
            openFile()
          },
          accelerator: 'CmdOrCtrl+O'
        },
        {
          label: 'Open Folder...',
          click() {
            openFolder()
          },
          accelerator: 'CmdOrCtrl+Shift+O'
        },
        {
          type: 'separator'
        },
        {
          label: 'Save',
          click() {
            saveFile()
          },
          accelerator: 'CmdOrCtrl+S'
        },
        {
          label: 'Save As',
          click() {
            saveFileAs()
          },
          accelerator: 'CmdOrCtrl+Shift+S'
        },
        {
          type: 'separator'
        },
        {
          label: 'Export',
          submenu: [
            {
              label: 'Export as HTML',
              click() {
                exportAsHTML()
              }
            },
            {
              label: 'Export as PDF',
              click() {
                exportAsPDF()
              }
            },
            {
              label: 'Export as PNG',
              click() {
                exportAsPNG()
              }
            },
            {
              type: 'separator'
            },
            {
              label: 'Copy HTML to Clipboard',
              click() {
                mainWindow.webContents.send('COPY_HTML_TO_CLIPBOARD')
              },
              accelerator: 'CmdOrCtrl+Shift+C'
            }
          ]
        },
        {
          label: 'Allow Html',
          type: 'checkbox',
          checked: getAllowHtml(),
          click() {
            const value = !getAllowHtml()
            mainWindow.webContents.send(SET_ALLOW_HTML, value)
            setAllowHtml(value)
          }
        }
      ]
    },

    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', role: 'undo' },
        { label: 'Redo', role: 'redo' },
        {
          type: 'separator'
        },
        { label: 'Cut', role: 'cut' },
        { label: 'Copy', role: 'copy' },
        { label: 'Paste', role: 'paste' },
        {
          label: 'Clear',
          click() {
            clearAll(mainWindow)
          },
          accelerator: 'CmdOrCtrl+Shift+d'
        },
        {
          label: 'Select All',
          click: selectAll.bind(null, mainWindow),
          accelerator: 'CmdOrCtrl+A'
        }
      ]
    },

    {
      label: 'View',
      submenu: [
        {
          label: 'Actual Size',
          role: 'resetzoom',
          accelerator: 'CmdOrCtrl+/'
        },
        { label: 'Zoom In', role: 'zoomin' },
        { label: 'Zoom Out', role: 'zoomout' },
        {
          type: 'separator'
        },
        {
          label: 'Toggle Full Screen',
          click() {
            if (!mainWindow.fullScreen) return mainWindow.setFullScreen(true)
            mainWindow.setFullScreen(false)
          },
          accelerator: 'CmdOrCtrl+Option+F'
        },
        {
          type: 'separator'
        },
        {
          label: 'Toggle Output',
          click() {
            mainWindow.webContents.send('TOGGLE_PREVIEW')
          },
          accelerator: 'CmdOrCtrl+Shift+P'
        }
      ]
    },

    {
      label: 'Themes',
      submenu: themes.map(theme => {
        theme.click = () => {
          setTheme(theme.value)
          mainWindow.webContents.send(SET_THEME, getTheme())
        }
        theme.type = 'radio'
        if (getTheme() === theme.value) theme.checked = true
        return theme
      })
    },

    {
      label: 'Share',
      submenu: [
        {
          label: 'Publish Gist (Public)',
          click() {
            mainWindow.webContents.send('PUBLISH_GIST', { secret: false })
          }
        },
        {
          label: 'Publish Gist (Secret)',
          click() {
            mainWindow.webContents.send('PUBLISH_GIST', { secret: true })
          }
        }
      ]
    },

    {
      label: 'Settings',
      submenu: [
        {
          label: 'Preferences...',
          click() {
            mainWindow.webContents.send('OPEN_SETTINGS')
          },
          accelerator: 'CmdOrCtrl+,'
        },
        {
          type: 'separator'
        },
        {
          label: 'Toggle Table of Contents',
          click() {
            mainWindow.webContents.send('TOGGLE_TOC')
          },
          accelerator: 'CmdOrCtrl+T'
        }
      ]
    },

    {
      label: 'Help',
      submenu: [
        {
          label: 'Welcome',
          click() {
            shell.openExternal('https://saketh-kowtha.github.io/markit/')
          }
        },
        {
          label: 'Release Notes',
          click() {
            shell.openExternal('https://github.com/saketh-kowtha/markit/releases')
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Report Issue',
          click() {
            shell.openExternal('https://github.com/saketh-kowtha/markit/issues')
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Follow in Twitter',
          click() {
            shell.openExternal('https://twitter.com/saketh_kowtha')
          }
        }
      ]
    }
  ]

  if (process.platform == 'darwin') {
    var name = app.getName()
    menuItems.unshift({
      label: 'MarkIt',
      submenu: [
        { label: 'About ' + name, role: 'about' },
        {
          type: 'separator'
        },
        {
          type: 'separator'
        },
        {
          label: 'Hide ' + name,
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Alt+H',
          role: 'hideothers'
        },
        {
          label: 'Show All',
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click() {
            app.quit()
          }
        }
      ]
    })
  }

  return menuItems
}
