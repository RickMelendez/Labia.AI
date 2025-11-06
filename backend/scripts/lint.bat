@echo off
setlocal enabledelayedexpansion
echo Running Black (check mode)...
black src tests -l 120 --check || goto :error

echo Running Flake8...
flake8 src tests || goto :error

echo Running MyPy...
mypy src || goto :error

echo Lint & type-check passed.
exit /b 0

:error
echo Lint or type-check failed.
exit /b 1

