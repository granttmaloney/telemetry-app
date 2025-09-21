const path = require('path');
const { BrowserWindow, app } = require('electron');
const WindowStateKeeper = require('electron-window-state');
const { pathToFileURL } = require('url');
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

const plotWindows = new Map();
let mainWindow;

function resolvePreload() {
  return path.join(__dirname, '..', 'preload', 'preload.js');
}

function getRendererUrl(hash = '/') {
  if (isDev) {
    return `http://localhost:3000${hash}`;
  }

  const indexHtmlPath = path.join(__dirname, '..', '..', 'dist', 'renderer', 'index.html');
  const fileUrl = pathToFileURL(indexHtmlPath).toString();
  return `${fileUrl}${hash}`;
}

function createMainWindow() {
  const mainState = WindowStateKeeper({
    defaultWidth: 1280,
    defaultHeight: 800,
    file: 'main-window-state.json'
  });

  mainWindow = new BrowserWindow({
    x: mainState.x,
    y: mainState.y,
    width: mainState.width,
    height: mainState.height,
    minWidth: 960,
    minHeight: 600,
    show: false,
    webPreferences: {
      preload: resolvePreload(),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false
    }
  });

  mainState.manage(mainWindow);
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.loadURL(getRendererUrl('/'));
  return mainWindow;
}

function createPlotWindow(config = {}) {
  const plotId = config.plotId || `plot-${Date.now()}`;
  const state = WindowStateKeeper({
    defaultWidth: 800,
    defaultHeight: 600,
    file: `${plotId}-state.json`
  });

  const plotWindow = new BrowserWindow({
    x: state.x,
    y: state.y,
    width: state.width,
    height: state.height,
    minWidth: 480,
    minHeight: 320,
    show: false,
    title: config.title || `Plot: ${plotId}`,
    webPreferences: {
      preload: resolvePreload(),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  state.manage(plotWindow);
  plotWindow.once('ready-to-show', () => plotWindow.show());
  plotWindow.on('closed', () => plotWindows.delete(plotId));

  plotWindow.loadURL(getRendererUrl(`/#/plot/${plotId}`));
  plotWindows.set(plotId, plotWindow);

  return plotWindow;
}

function getMainWindow() {
  return mainWindow;
}

function getPlotWindows() {
  return plotWindows;
}

module.exports = {
  createMainWindow,
  createPlotWindow,
  getMainWindow,
  getPlotWindows
};
