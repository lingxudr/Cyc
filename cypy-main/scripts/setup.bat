@echo off
setlocal EnableExtensions EnableDelayedExpansion

title CYPY Setup
echo ========================================
echo   Setting up CYPY...
echo ========================================
echo.

REM Script directory
set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR="
for %%I in ("%SCRIPT_DIR%\..") do set "ROOT_DIR=%%~fI"

set "VENV="
set "PYTHON="
set "PYVER="

REM ----------------------------------------
REM Detect Python / virtual environment
REM ----------------------------------------

if defined VIRTUAL_ENV (
    set "VENV=%VIRTUAL_ENV%"
) else (
    if exist "!ROOT_DIR!\.venv\Scripts\python.exe" (
        set "VENV=!ROOT_DIR!\.venv"
    ) else if exist "!ROOT_DIR!\venv\Scripts\python.exe" (
        set "VENV=!ROOT_DIR!\venv"
    )
)

if defined VENV (
    set "PYTHON=!VENV!\Scripts\python.exe"
    echo [+] Found virtual environment: !VENV!
) else (
    echo [^!] No virtual environment found

    where python >nul 2>&1
    if errorlevel 1 (
        echo [^!] Python not found. Please install Python 3.8+ first.
        exit /b 1
    )

    set "PYTHON=python"
)

REM Validate Python version
"%PYTHON%" -c "import sys; sys.exit(0 if sys.version_info >= (3,8) else 1)"
if errorlevel 1 (
    echo [^!] Current Python version is not supported. Need Python 3.8+.
    exit /b 1
)

for /f "delims=" %%v in ('"%PYTHON%" --version 2^>^&1') do set "PYVER=%%v"

if defined VENV (
    echo [+] Using !PYVER! from virtual environment
) else (
    echo [+] Using !PYVER! from system Python
)

REM ----------------------------------------
REM Setup virtual environment
REM ----------------------------------------

if not defined VENV (
    echo [+] Setting up venv for the application...
    "%PYTHON%" -m venv "!ROOT_DIR!\venv"
    if errorlevel 1 (
        echo [^!] Failed to create virtual environment.
        exit /b 1
    )

    set "VENV=!ROOT_DIR!\venv"
    set "PYTHON=!VENV!\Scripts\python.exe"

    echo [+] Upgrading pip...
    "%PYTHON%" -m pip install --upgrade pip
    if errorlevel 1 (
        echo [^!] Failed to upgrade pip.
    )

    echo [+] Installing Python dependencies...
    "%PYTHON%" -m pip install -e .
    if errorlevel 1 (
        echo [^!] Failed to install dependencies.
        exit /b 1
    )
)

REM ----------------------------------------
REM Setup .env
REM ----------------------------------------

if not exist ".env" (
    echo [i] No .env found. Copying from .env.example...

    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo [+] .env created. Please edit it with your API key.

        if defined EDITOR (
            "%EDITOR%" ".env"
        ) else (
            notepad ".env"
        )
    ) else (
        echo [^!] No .env.example found. Please create .env manually.
    )
)
