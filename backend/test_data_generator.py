"""Simulated telemetry generator used during local development.

This script emits randomised sensor data over TCP so the backend or
integration tests can ingest predictable payloads.
"""

from __future__ import annotations

import json
import random
import socket
import time
from dataclasses import dataclass
from typing import Iterator

HOST = "127.0.0.1"
PORT = 8765
SLEEP_SECONDS = 1.0


@dataclass
class SensorReading:
    sensor_id: str
    temperature_c: float
    pressure_kpa: float
    humidity_pct: float

    def to_json(self) -> str:
        return json.dumps(
            {
                "sensor_id": self.sensor_id,
                "temperature_c": self.temperature_c,
                "pressure_kpa": self.pressure_kpa,
                "humidity_pct": self.humidity_pct,
            }
        )


def generate_readings() -> Iterator[SensorReading]:
    baseline_temperature = random.uniform(19.0, 21.0)
    baseline_pressure = random.uniform(100.5, 101.5)
    baseline_humidity = random.uniform(40.0, 45.0)

    index = 0
    while True:
        yield SensorReading(
            sensor_id=f"sensor-{index % 4}",
            temperature_c=baseline_temperature + random.uniform(-1.0, 1.0),
            pressure_kpa=baseline_pressure + random.uniform(-0.5, 0.5),
            humidity_pct=baseline_humidity + random.uniform(-3.0, 3.0),
        )
        index += 1


def main() -> None:
    with socket.create_connection((HOST, PORT)) as sock:
        for reading in generate_readings():
            payload = reading.to_json().encode()
            sock.sendall(payload + b"\n")
            time.sleep(SLEEP_SECONDS)


if __name__ == "__main__":
    try:
        main()
    except ConnectionRefusedError:
        print(f"Unable to reach telemetry sink at {HOST}:{PORT}. ")
