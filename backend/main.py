"""Entry point for the Python telemetry backend.

This module exposes a FastAPI application with placeholders for
REST and WebSocket interfaces that the Electron application will
consume. The current implementation focuses on structure rather
than production-ready behavior.
"""

from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


class TelemetryHub:
    """Minimal in-memory pub/sub hub used during early development."""

    def __init__(self) -> None:
        self._connections: set[WebSocket] = set()
        self._lock = asyncio.Lock()

    async def register(self, websocket: WebSocket) -> None:
        async with self._lock:
            self._connections.add(websocket)
            logger.info("WebSocket connected: %s", websocket.client)

    async def unregister(self, websocket: WebSocket) -> None:
        async with self._lock:
            self._connections.discard(websocket)
            logger.info("WebSocket disconnected: %s", websocket.client)

    async def broadcast(self, payload: dict) -> None:
        async with self._lock:
            targets = list(self._connections)
        for connection in targets:
            try:
                await connection.send_json(payload)
            except Exception as error:  # pragma: no cover - placeholder logging
                logger.warning("Failed to send payload to %s: %s", connection.client, error)


telemetry_hub = TelemetryHub()


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """Placeholder for connecting to databases or external systems."""
    logger.info("Starting telemetry backend...")
    try:
        yield
    finally:
        logger.info("Shutting down telemetry backend")


app = FastAPI(lifespan=lifespan, title="Telemetry Backend", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"]
)


@app.get("/health")
async def healthcheck() -> dict[str, str]:
    """Simple health endpoint used by the Electron shell."""
    return {"status": "ok"}


@app.websocket("/ws/telemetry")
async def websocket_endpoint(websocket: WebSocket) -> None:
    await websocket.accept()
    await telemetry_hub.register(websocket)

    try:
        # During early development we broadcast synthetic updates so the
        # renderer can validate its data plumbing.
        while True:
            await telemetry_hub.broadcast(
                {
                    "type": "telemetry.placeholder",
                    "message": "Replace with real telemetry ingestion pipeline",
                }
            )
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")
    finally:
        await telemetry_hub.unregister(websocket)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        log_level="info",
        reload=False,
    )
