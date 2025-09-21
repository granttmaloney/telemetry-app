const { ipcMain } = require('electron');
const { createPlotWindow, getPlotWindows } = require('./windowManager');

function registerIpcHandlers() {
  ipcMain.handle('create-plot-window', async (_event, config) => {
    const window = createPlotWindow(config);
    return { windowId: window.id };
  });

  ipcMain.handle('get-window-config', async () => {
    return {
      openPlotWindows: Array.from(getPlotWindows().keys())
    };
  });
}

module.exports = {
  registerIpcHandlers
};
