const { app } = require('electron');
const { createMainWindow, getMainWindow, createPlotWindow } = require('./windowManager');
const { createApplicationMenu } = require('./menu');
const { startPythonBackend, stopPythonBackend } = require('./backendProcess');
const { registerIpcHandlers } = require('./ipc');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

let pythonStarted = false;

async function bootstrap() {
  if (!pythonStarted) {
    startPythonBackend();
    pythonStarted = true;
  }

  const mainWindow = createMainWindow();
  createApplicationMenu({ onCreatePlotWindow: () => createPlotWindow() });
  registerIpcHandlers();

  if (!isDev) {
    mainWindow.removeMenu();
  }
}

app.whenReady().then(bootstrap);

app.on('second-instance', () => {
  const mainWindow = getMainWindow();
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopPythonBackend();
});

app.on('activate', () => {
  if (!getMainWindow()) {
    createMainWindow();
  }
});
