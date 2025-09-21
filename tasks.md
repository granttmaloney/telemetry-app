# Complete Development Plan: Multi-Window Telemetry Application

## Phase 1: Project Foundation & Setup

### Task 1.1: Initialize Project Structure
**Objective:** Create the basic project structure and dependencies

**Actions:**
1. Create root project directory: `telemetry-app`
2. Initialize npm project: `npm init -y`
3. Create folder structure:
   ```
   telemetry-app/
   ├── src/
   │   ├── main/           # Electron main process
   │   ├── renderer/       # React frontend
   │   └── backend/        # Python backend
   ├── dist/
   ├── package.json
   └── README.md
   ```

**Acceptance Criteria:** 
- Folder structure exists
- package.json initialized
- Basic README with setup instructions

### Task 1.2: Install Core Dependencies
**Objective:** Install all required npm packages

**Actions:**
```bash
# Electron dependencies
npm install electron electron-builder electron-window-state
npm install --save-dev electron-is-dev

# Frontend dependencies  
npm install react react-dom @types/react @types/react-dom
npm install typescript @types/node
npm install webpack webpack-cli webpack-dev-server
npm install html-webpack-plugin css-loader style-loader

# Development tools
npm install --save-dev concurrently wait-on
```

**Acceptance Criteria:**
- All packages installed without errors
- package.json contains all dependencies
- Node modules folder created

### Task 1.3: Setup Python Backend Environment
**Objective:** Prepare Python environment with required packages

**Actions:**
1. Create `backend/requirements.txt`:
   ```
   fastapi==0.104.1
   uvicorn==0.24.0
   websockets==12.0
   influxdb-client==1.38.0
   pandas==2.1.3
   numpy==1.25.2
   asyncio-mqtt==0.16.1
   ```
2. Create `backend/main.py` (placeholder)
3. Create virtual environment setup script

**Acceptance Criteria:**
- requirements.txt created
- Virtual environment can be created
- All Python packages install successfully

## Phase 2: Electron Shell & Window Management

### Task 2.1: Create Electron Main Process
**Objective:** Build the core Electron application with multi-window support

**File:** `src/main/main.js`

**Actions:**
1. Create main Electron process that:
   - Spawns Python backend subprocess
   - Creates main application window
   - Handles app lifecycle (quit, window-all-closed)
   - Implements basic menu structure

**Required Features:**
```javascript
const { app, BrowserWindow, Menu } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

// Global references
let mainWindow;
let pythonProcess;
let plotWindows = {};

// Functions to implement:
function createMainWindow() { /* Load main React app */ }
function createPlotWindow(plotId) { /* Create new plot window */ }
function startPythonBackend() { /* Spawn Python process */ }
function createApplicationMenu() { /* File, Window, Help menus */ }
```

**Acceptance Criteria:**
- Main window opens and displays placeholder content
- Application menu with "New Plot Window" option
- App properly quits when all windows closed
- Console shows no errors

### Task 2.2: Implement Window State Persistence
**Objective:** Save and restore window positions between app sessions

**File:** `src/main/windowManager.js`

**Actions:**
1. Install and configure `electron-window-state`
2. Create window state management module:
   ```javascript
   // Functions to implement:
   function saveWindowState(windowId, bounds) { }
   function loadWindowState(windowId) { }
   function saveAllWindowStates() { }
   function restoreAllWindows() { }
   ```
3. Integrate with main process to auto-save on move/resize
4. Store state in `userData` directory as JSON

**Acceptance Criteria:**
- Window positions persist after app restart
- New windows appear in saved positions
- Multiple plot windows positions are independently saved
- Invalid positions (off-screen) are handled gracefully

### Task 2.3: Create Plot Window Factory
**Objective:** Implement system to create and manage multiple plot windows

**File:** `src/main/plotWindowManager.js`

**Actions:**
1. Create plot window management system:
   ```javascript
   class PlotWindowManager {
     createPlotWindow(plotConfig) { }
     closePlotWindow(plotId) { }
     getAllPlotWindows() { }
     broadcastToAllPlots(message) { }
   }
   ```
2. Each plot window should:
   - Have unique ID
   - Load React app with plot-specific route
   - Be independently moveable/resizable
   - Communicate with main process

**Acceptance Criteria:**
- Can create multiple plot windows via menu
- Each window has unique title and ID
- Windows can be moved independently
- Closing plot window doesn't affect others
- Main window can create/track all plot windows

## Phase 3: Python Backend Integration

### Task 3.1: Create FastAPI Backend Server
**Objective:** Build Python server for telemetry data and API endpoints

**File:** `backend/main.py`

**Actions:**
1. Create FastAPI application with endpoints:
   ```python
   from fastapi import FastAPI, WebSocket
   from fastapi.staticfiles import StaticFiles
   
   app = FastAPI()
   
   # Endpoints to implement:
   @app.get("/api/health")  # Health check
   @app.get("/api/telemetry/{sensor_id}")  # Get sensor data
   @app.websocket("/ws")  # Real-time data stream
   @app.post("/api/telemetry")  # Receive telemetry data
   ```

2. Add CORS middleware for frontend communication
3. Serve React build files as static content
4. Include basic error handling and logging

**Acceptance Criteria:**
- Server starts on http://localhost:8000
- Health endpoint returns 200 OK
- CORS properly configured
- WebSocket connection accepts connections
- Logs show server startup and requests

### Task 3.2: Implement TCP Telemetry Server
**Objective:** Create TCP server to receive incoming telemetry data

**File:** `backend/telemetry_server.py`

**Actions:**
1. Create async TCP server:
   ```python
   import asyncio
   import json
   
   class TelemetryServer:
       async def start_server(self, host='localhost', port=9999):
           # Handle incoming TCP connections
           pass
       
       async def handle_client(self, reader, writer):
           # Process telemetry data
           # Parse JSON messages
           # Store to InfluxDB
           # Broadcast to WebSocket clients
           pass
   ```

2. Parse incoming JSON telemetry messages
3. Validate data format and handle errors
4. Integration with main FastAPI app

**Acceptance Criteria:**
- TCP server listens on port 9999
- Can receive and parse JSON telemetry data
- Invalid data is handled gracefully
- Server logs show incoming connections and data
- Can test with telnet or simple Python client

### Task 3.3: InfluxDB Integration
**Objective:** Set up data storage and retrieval with InfluxDB

**File:** `backend/database.py`

**Actions:**
1. Create InfluxDB client wrapper:
   ```python
   from influxdb_client import InfluxDBClient, Point
   
   class TelemetryDatabase:
       def __init__(self):
           # Initialize InfluxDB connection
           pass
       
       def write_telemetry(self, sensor_id, value, timestamp):
           # Write data point to InfluxDB
           pass
       
       def query_telemetry(self, sensor_id, start_time, end_time):
           # Query historical data
           pass
   ```

2. Set up database connection and bucket creation
3. Implement data writing and querying methods
4. Add connection error handling

**Acceptance Criteria:**
- InfluxDB connects successfully on startup
- Can write telemetry data points
- Can query historical data by sensor and time range
- Database operations handle errors gracefully
- Basic bucket/retention policy configured

## Phase 4: React Frontend Development

### Task 4.1: Setup React Build System
**Objective:** Configure webpack and React development environment

**Files:** `webpack.config.js`, `src/renderer/index.html`, `src/renderer/index.tsx`

**Actions:**
1. Create webpack configuration for React + TypeScript
2. Setup development and production builds
3. Configure hot module replacement for development
4. Create basic React app entry point:
   ```tsx
   import React from 'react';
   import { BrowserRouter, Routes, Route } from 'react-router-dom';
   
   function App() {
     return (
       <BrowserRouter>
         <Routes>
           <Route path="/" element={<Dashboard />} />
           <Route path="/plot/:plotId" element={<PlotWindow />} />
           <Route path="/spreadsheet" element={<Spreadsheet />} />
         </Routes>
       </BrowserRouter>
     );
   }
   ```

**Acceptance Criteria:**
- Webpack builds without errors
- React app loads in Electron window
- Hot reload works in development
- TypeScript compilation works
- Routing between different views works

### Task 4.2: Create Main Dashboard Component
**Objective:** Build the main application interface

**File:** `src/renderer/components/Dashboard.tsx`

**Actions:**
1. Create dashboard with:
   - List of active sensors
   - Recent telemetry values
   - Buttons to create new plot windows
   - System status indicators
   
2. Implement WebSocket connection to backend:
   ```tsx
   const [telemetryData, setTelemetryData] = useState({});
   const [wsConnection, setWsConnection] = useState(null);
   
   useEffect(() => {
     // Connect to WebSocket
     // Listen for real-time updates
     // Update UI with new data
   }, []);
   ```

**Acceptance Criteria:**
- Dashboard displays sensor list
- Real-time data updates via WebSocket
- "New Plot Window" button communicates with Electron
- Clean, responsive UI layout
- Shows connection status to backend

### Task 4.3: Create Plot Window Component
**Objective:** Build plotting interface for telemetry visualization

**File:** `src/renderer/components/PlotWindow.tsx`

**Actions:**
1. Install plotting library: `npm install plotly.js react-plotly.js`
2. Create plot component that:
   - Receives plotId from route params
   - Fetches historical data for specific sensor
   - Updates plot in real-time via WebSocket
   - Allows plot configuration (time range, y-axis limits)

3. Implement basic line chart:
   ```tsx
   import Plot from 'react-plotly.js';
   
   function PlotWindow() {
     const { plotId } = useParams();
     const [plotData, setPlotData] = useState([]);
     
     // Fetch historical data
     // Subscribe to real-time updates
     // Render Plotly chart
   }
   ```

**Acceptance Criteria:**
- Plot window shows line chart of telemetry data
- Updates in real-time as new data arrives
- Can handle multiple different sensor types
- Basic zoom/pan functionality works
- Window title shows sensor name

## Phase 5: Integration & Testing

### Task 5.1: Implement Inter-Process Communication
**Objective:** Connect Electron, Python backend, and React frontend

**Files:** `src/main/ipc.js`, `src/renderer/api.js`

**Actions:**
1. Setup IPC between Electron main and renderer:
   ```javascript
   // Main process
   ipcMain.handle('create-plot-window', (event, plotConfig) => {
     return createPlotWindow(plotConfig);
   });
   
   // Renderer process
   const { ipcRenderer } = require('electron');
   
   export const electronAPI = {
     createPlotWindow: (config) => ipcRenderer.invoke('create-plot-window', config),
     getWindowConfig: () => ipcRenderer.invoke('get-window-config')
   };
   ```

2. Create API client for Python backend communication
3. Handle process startup synchronization

**Acceptance Criteria:**
- Frontend can request new plot windows via IPC
- Python backend starts before frontend loads
- WebSocket connections work between all components
- Error handling for component failures

### Task 5.2: Create Telemetry Data Generator
**Objective:** Build test data generator for development/testing

**File:** `backend/test_data_generator.py`

**Actions:**
1. Create script that sends simulated telemetry via TCP:
   ```python
   import socket
   import json
   import time
   import random
   
   def generate_telemetry():
       # Send realistic sensor data
       # Multiple sensor types (temperature, pressure, etc.)
       # 1Hz update rate
       # Gradually changing values
   ```

2. Simulate multiple sensors with different patterns
3. Include occasional data anomalies for testing

**Acceptance Criteria:**
- Generates realistic telemetry data at 1Hz
- Multiple sensor types with different value ranges
- Can run independently to test the system
- Data appears in InfluxDB and plots update

### Task 5.3: End-to-End Integration Test
**Objective:** Verify complete system functionality

**Actions:**
1. Create startup script that:
   - Starts InfluxDB (if not running)
   - Starts the Electron application
   - Launches test data generator
   
2. Test complete workflow:
   - App starts with main window
   - Create multiple plot windows
   - Move windows around screen
   - Close and restart app
   - Verify windows restore to saved positions
   - Confirm real-time data flows through system

**Acceptance Criteria:**
- Complete application starts without errors
- Multiple plot windows can be created and moved
- Real-time telemetry data appears in plots
- Window positions persist between restarts
- All components communicate successfully
- System handles component failures gracefully

## Phase 6: Build & Distribution Setup

### Task 6.1: Configure Application Build
**Objective:** Setup production build process

**Actions:**
1. Configure electron-builder in package.json:
   ```json
   "build": {
     "appId": "com.company.telemetry-app",
     "productName": "Telemetry Monitor",
     "directories": {
       "output": "dist"
     },
     "files": [
       "dist/**/*",
       "backend/**/*",
       "node_modules/**/*"
     ]
   }
   ```

2. Create build scripts for development and production
3. Include Python environment in distribution

**Acceptance Criteria:**
- `npm run build` creates distributable application
- Built app runs independently without development environment
- All dependencies included in distribution
- Application installs and runs on fresh system

---

## Summary of Deliverables

Upon completion, you should have:

1. **Working Electron application** with multiple moveable windows
2. **Python backend** receiving TCP telemetry and serving API
3. **InfluxDB integration** for data storage
4. **React frontend** with real-time plotting
5. **Window position persistence** between sessions
6. **Test data generator** for development
7. **Build system** for distribution

## Estimated Timeline
- **Phase 1-2:** 2-3 days (project setup and Electron shell)
- **Phase 3:** 2-3 days (Python backend and database)
- **Phase 4:** 3-4 days (React frontend and plotting)
- **Phase 5:** 2-3 days (integration and testing)
- **Phase 6:** 1-2 days (build configuration)

**Total: 10-15 days** for a functional framework

Each task should be completed and tested before moving to the next phase. This ensures a solid foundation at each step.