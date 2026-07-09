@echo off
REM ============================================================
REM DMD Zeiterfassung — Windows Starter (.cmd)
REM ============================================================
REM Doppelklick zum Starten. Wählt automatisch die beste
REM Install-Methode:
REM   1. Web-GUI Wizard (installer.js) — wenn Node.js vorhanden
REM   2. PowerShell Script (install.ps1) — Fallback
REM ============================================================

chcp 65001 >nul 2>&1
title DMD Zeiterfassung - Installation

echo.
echo  ==========================================================
echo    DMD Zeiterfassung - Installation
echo    Projektzeiterfassung ^& Projekt-Controlling
echo  ==========================================================
echo.

REM Prüfe ob Node.js installiert ist
where node >nul 2>&1
if %errorlevel% equ 0 (
  echo  [OK] Node.js gefunden - starte Web-GUI Wizard...
  echo.
  node "%~dp0installer.js"
  if %errorlevel% neq 0 (
    echo.
    echo  [WARN] Web-GUI fehlgeschlagen - versuche PowerShell...
    goto :powershell
  )
  goto :end
) else (
  echo  [WARN] Node.js nicht gefunden.
  echo.
  echo  Bitte installiere Node.js 20+ von https://nodejs.org/
  echo  Versuche PowerShell-Script als Alternative...
  echo.
  goto :powershell
)

:powershell
where pwsh >nul 2>&1
if %errorlevel% equ 0 (
  pwsh -ExecutionPolicy Bypass -File "%~dp0install.ps1"
  goto :end
)
where powershell >nul 2>&1
if %errorlevel% equ 0 (
  powershell -ExecutionPolicy Bypass -File "%~dp0install.ps1"
  goto :end
)
echo  [ERROR] Weder Node.js noch PowerShell gefunden.
echo  Bitte installiere Node.js 20+ von https://nodejs.org/
echo.

:end
echo.
pause