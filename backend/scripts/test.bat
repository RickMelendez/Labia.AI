@echo off
setlocal enabledelayedexpansion
echo Running tests with coverage...
pytest --cov=src --cov-report=term-missing tests/ || goto :error
exit /b 0

:error
echo Tests failed.
exit /b 1

