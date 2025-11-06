#!/usr/bin/env bash
set -euo pipefail

echo "Running Black (check mode)..."
black src tests -l 120 --check

echo "Running Flake8..."
flake8 src tests

echo "Running MyPy..."
mypy src

echo "Lint & type-check passed."

