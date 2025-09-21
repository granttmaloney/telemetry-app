const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  createPlotWindow: (config) => ipcRenderer.invoke('create-plot-window', config),
  getWindowConfig: () => ipcRenderer.invoke('get-window-config')
});
