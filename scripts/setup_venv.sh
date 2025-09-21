#!/usr/bin/env bash
set -euo pipefail

VENV_DIR="${1:-.venv}"
PYTHON_BIN="${PYTHON_BIN:-python3}"

if [ -d "$VENV_DIR" ];
then
  echo "Virtual environment already exists at $VENV_DIR"
  exit 0
fi

$PYTHON_BIN -m venv "$VENV_DIR"
source "$VENV_DIR/bin/activate"
pip install --upgrade pip
pip install -r backend/requirements.txt

echo "Virtual environment created at $VENV_DIR"
