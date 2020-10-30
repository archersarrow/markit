const { app } = require("electron");
const { openFile, saveFileAs, saveFile, clearAll } = require("../helper");
const { selectAll } = require("../actions");

const themes = require("../../constants/themes.json");
const { SET_THEME, SET_ALLOW_HTML } = require("../../constants");
const { getTheme, setTheme, getAllowHtml, setAllowHtml } = require("../store/store");

module.exports = (mainWindow) => {
  const menuItems = [
    {
      label: "File",
      submenu: [
        {
          label: "Open",
          click() {
            openFile();
          },
          accelerator: "CmdOrCtrl+O",
        },
        {
          label: "Save",
          click() {
            saveFile();
          },
          accelerator: "CmdOrCtrl+S",
        },
        {
          label: "Save As",
          click() {
            saveFileAs();
          },
          accelerator: "CmdOrCtrl+Shift+S",
        },
        {
          type: "separator",
        },
        {
          label: "Export",
          submenu: [{ label: "Export as HTML" }, { label: "Export as PDF" }],
        },
        {
          label: "Allow Html",
          type: "radio",
          checked: getAllowHtml(),
          click() {
            const value = !getAllowHtml();
            mainWindow.webContents.send(SET_ALLOW_HTML, value);
            setAllowHtml(value);
          },
        },
      ],
    },

    {
      label: "Edit",
      submenu: [
        { label: "Undo", role: "undo" },
        { label: "Redo", role: "redo" },
        {
          type: "separator",
        },
        { label: "Cut", role: "cut" },
        { label: "Copy", role: "copy" },
        { label: "Paste", role: "paste" },
        {
          label: "Clear",
          click() {
            clearAll(mainWindow);
          },
          accelerator: "CmdOrCtrl+Shift+d",
        },
        {
          label: "Select All",
          click: selectAll.bind(null, mainWindow),
          accelerator: "CmdOrCtrl+A",
        },
        // {
        //   type: "separator",
        // },
      ],
    },

    {
      label: "View",
      submenu: [
        {
          label: "Actual Size",
          role: "resetzoom",
          accelerator: "CmdOrCtrl+/",
        },
        { label: "Zoom In", role: "zoomin" },
        { label: "Zoom Out", role: "zoomout" },
        {
          type: "separator",
        },
        {
          label: "Toggle Full Screen",
          click() {
            if (!mainWindow.fullScreen) return mainWindow.setFullScreen(true);
            mainWindow.setFullScreen(false);
          },
          accelerator: "CmdOrCtrl+Option+F",
        },
        {
          type: "separator",
        },
        { label: "Toggle Output" },
      ],
    },

    {
      label: "Themes",
      submenu: themes.map((theme) => {
        theme.click = () => {
          setTheme(theme.value);
          mainWindow.webContents.send(SET_THEME, getTheme());
        };
        theme.type = "radio";
        if (getTheme() === theme.value) theme.checked = true;
        return theme;
      }),
    },

    {
      label: "Help",
      submenu: [],
    },
  ];

  if (process.platform == "darwin") {
    var name = app.getName();
    menuItems.unshift({
      label: "Mac App",
      submenu: [
        { label: "About " + name, role: "about" },
        {
          type: "separator",
        },
        {
          type: "separator",
        },
        {
          label: "Hide " + name,
          accelerator: "Command+H",
          role: "hide",
        },
        {
          label: "Hide Others",
          accelerator: "Command+Alt+H",
          role: "hideothers",
        },
        {
          label: "Show All",
          role: "unhide",
        },
        {
          type: "separator",
        },
        {
          label: "Quit",
          accelerator: "Command+Q",
          click() {
            app.quit();
          },
        },
      ],
    });
  }

  return menuItems;
};
