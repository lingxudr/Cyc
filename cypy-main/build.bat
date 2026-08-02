@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM Script directory
set "ROOT_DIR=%~dp0"
set "VENV="
set "PYTHON="

REM ----------------------------------------
REM Run setup
REM ----------------------------------------

call !ROOT_DIR!\scripts\setup.bat

title CYPY Build

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
) else (
    where python >nul 2>&1
    if errorlevel 1 (
        echo [^!] Python not found. Please install Python 3.8+ first.
        exit /b 1
    )

    set "PYTHON=python"
)


REM ----------------------------------------
REM Build application
REM ----------------------------------------

echo.
echo ========================================
echo   CYPY Build Script
echo ========================================
echo.

echo [i] Running build...

"%PYTHON%" build.py
if %errorlevel% neq 0 (
    set "CODE=%ERRORLEVEL%"
    echo.
    echo [^!] Build failed.
    exit /b !CODE!
)

echo.
echo ========================================
echo   Build completed! Check releases/ folder
echo ========================================
