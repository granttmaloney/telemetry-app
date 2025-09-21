const path = require('path');
const { spawn } = require('child_process');
const { app } = require('electron');

let pythonProcess;

function getPythonExecutable() {
  if (process.env.PYTHON_BACKEND_EXECUTABLE) {
    return process.env.PYTHON_BACKEND_EXECUTABLE;
  }

  return process.platform === 'win32' ? 'python' : 'python3';
}

function getBackendEntryPoint() {
  const appPath = app.getAppPath();
  return path.resolve(appPath, 'backend', 'main.py');
}

function startPythonBackend() {
  if (pythonProcess) {
    return pythonProcess;
  }

  const pythonExecutable = getPythonExecutable();
  const backendEntry = getBackendEntryPoint();

  pythonProcess = spawn(pythonExecutable, [backendEntry], {
    stdio: 'inherit',
    env: {
      ...process.env,
      PYTHONUNBUFFERED: '1'
    }
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`Python backend exited with code ${code}`);
    }
    pythonProcess = undefined;
  });

  pythonProcess.on('error', (error) => {
    console.error('Failed to start Python backend:', error);
  });

  return pythonProcess;
}

function stopPythonBackend() {
  if (!pythonProcess) {
    return;
  }

  pythonProcess.kill();
  pythonProcess = undefined;
}

module.exports = {
  startPythonBackend,
  stopPythonBackend
};
