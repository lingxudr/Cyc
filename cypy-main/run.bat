@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM Script directory
set "ROOT_DIR=%~dp0"
set "VENV="
set "PYTHON="
set "PYVER="

call !ROOT_DIR!\scripts\setup.bat

title CYPY - Cyrene's Python Manga Translator

REM ----------------------------------------
REM Detect Python / virtual environment
REM ----------------------------------------

if defined VIRTUAL_ENV (
    set "VENV=%VIRTUAL_ENV%"
) else (
    if exist "%ROOT_DIR%\.venv\Scripts\python.exe" (
        set "VENV=%ROOT_DIR%\.venv"
    ) else if exist "%ROOT_DIR%\venv\Scripts\python.exe" (
        set "VENV=%ROOT_DIR%\venv"
    )
)

if defined VENV (
    set "PYTHON=!VENV!\Scripts\python.exe"
    echo [+] Found virtual environment: !VENV!
) else (
    echo [!!] No virtual environment found

    where python >nul 2>&1
    if errorlevel 1 (
        echo [!!] Python not found. Please install Python 3.8+ first.
        exit /b 1
    )

    set "PYTHON=python"
)


REM ----------------------------------------
REM Run application
REM ----------------------------------------

cls

for /f "delims=" %%v in ('"%PYTHON%" --version 2^>^&1') do set "PYVER=%%v"
echo ========================================
echo   Starting CYPY...
echo   !PYTHON! - !PYVER!
echo ========================================
echo.

"%PYTHON%" -m cypy
if errorlevel 1 (
    set "CODE=%ERRORLEVEL%"
    echo.
    echo [!!] CYPY exited with error.
    exit /b !CODE!
)
