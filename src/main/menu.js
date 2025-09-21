const { Menu, shell } = require('electron');

function createApplicationMenu({ onCreatePlotWindow }) {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Plot Window',
          accelerator: 'CmdOrCtrl+N',
          click: () => onCreatePlotWindow?.()
        },
        { type: 'separator' },
        {
          role: 'quit'
        }
      ]
    },
    {
      label: 'Window',
      role: 'window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      role: 'help',
      submenu: [
        {
          label: 'Project Documentation',
          click: () => shell.openExternal('https://github.com/your-org/telemetry-app')
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  return menu;
}

module.exports = {
  createApplicationMenu
};
