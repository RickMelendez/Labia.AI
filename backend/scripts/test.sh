#!/usr/bin/env bash
set -euo pipefail

echo "Running tests with coverage..."
pytest --cov=src --cov-report=term-missing tests/

