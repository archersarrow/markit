const getMenuItems = require('./menuItems')

const { Menu } = require('electron')

const initShortCuts = mainWindow => {
  const menuItems = getMenuItems(mainWindow)
  var menu = Menu.buildFromTemplate(menuItems)
  Menu.setApplicationMenu(menu)
}

module.exports = initShortCuts
