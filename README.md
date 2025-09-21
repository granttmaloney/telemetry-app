# Telemetry Monitor Framework

This project scaffolds a multi-window telemetry monitoring application composed of an Electron shell, a React renderer, and a Python backend. The current state focuses on providing a structured foundation so individual subsystems can be implemented independently.

## Getting Started

> Dependencies are declared, but packages are not yet installed. Run the commands after reviewing and adjusting for your environment.

```bash
cd telemetry-app
npm install
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

## Available Scripts

- `npm run dev`: Starts the Python backend, webpack dev server, and Electron shell in parallel.
- `npm run build`: Produces production bundles for the renderer and Electron main process.
- `npm run package`: Builds distributable binaries via `electron-builder`.

## Project Structure

```
telemetry-app/
├── backend/           # Python backend service (FastAPI + telemetry ingest)
├── dist/              # Bundled output (generated)
├── scripts/           # Utility scripts (venv setup, orchestration)
├── src/
│   ├── main/          # Electron main process
│   ├── preload/       # Secure IPC bridge
│   └── renderer/      # React frontend
├── package.json
└── README.md
```

## Next Steps

- Flesh out renderer UI components to consume telemetry feeds.
- Implement backend data pipelines and InfluxDB integration.
- Configure automated testing, linting, and CI pipelines.
