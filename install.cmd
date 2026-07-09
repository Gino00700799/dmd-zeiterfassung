@echo off
REM ============================================================
REM DMD Zeiterfassung — Windows Starter (.cmd)
REM ============================================================
REM Doppelklick zum Starten. Prüft Node.js/npm und installiert
 automatisch, falls fehlend.
REM ============================================================

chcp 65001 >nul 2>&1
title DMD Zeiterfassung - Installation

echo.
echo  ==========================================================
echo    DMD Zeiterfassung - Installation
echo    Projektzeiterfassung ^& Projekt-Controlling
echo  ==========================================================
echo.

REM ─── Node.js pruefen ───────────────────────────────────────
where node >nul 2>&1
if %errorlevel% neq 0 (
  echo  [WARN] Node.js nicht gefunden.
  echo.
  echo  Node.js wird automatisch installiert...
  echo  Dies kann 1-2 Minuten dauern.
  echo.

  REM WingMethode (Windows 10/11 hat winget ab Werk)
  where winget >nul 2>&1
  if %errorlevel% equ 0 (
    echo  [INFO] Installiere Node.js via winget...
    winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
    if %errorlevel% equ 0 (
      echo  [OK] Node.js installiert!
      REM PATH aktualisieren fuer diese Session
      set "PATH=%ProgramFiles%\nodejs;%PATH%"
      set "PATH=%ProgramFiles(x86)%\nodejs;%PATH%"
      set "PATH=%LOCALAPPDATA%\npm;%PATH%"
      goto :check_npm
    ) else (
      echo  [WARN] winget fehlgeschlagen, versuche Download...
      goto :download_node
    )
  ) else (
    goto :download_node
  )
)

:check_npm
where npm >nul 2>&1
if %errorlevel% equ 0 (
  echo  [OK] Node.js und npm gefunden!
  for /f "tokens=*" %%v in ('node --version') do echo  [OK] Node.js Version: %%v
  for /f "tokens=*" %%v in ('npm --version') do echo  [OK] npm Version: v%%v
  echo.
  goto :start_installer
) else (
  echo  [WARN] npm nicht gefunden - lade Node.js neu herunter...
  goto :download_node
)

:download_node
echo.
echo  [INFO] Lade Node.js LTS herunter...
echo  Bitte warte einen Moment...
echo.

REM PowerShell zum Download nutzen
powershell -Command "$ProgressPreference = 'SilentlyContinue'; [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v22.23.1/node-v22.23.1-x64.msi' -OutFile '%TEMP%\nodejs.msi'"
if exist "%TEMP%\nodejs.msi" (
  echo  [OK] Download abgeschlossen.
  echo  [INFO] Installiere Node.js...
  msiexec /i "%TEMP%\nodejs.msi" /qb
  if %errorlevel% equ 0 (
    echo  [OK] Node.js installiert!
    set "PATH=%ProgramFiles%\nodejs;%PATH%"
    set "PATH=%LOCALAPPDATA%\npm;%PATH%"
    del "%TEMP%\nodejs.msi" >nul 2>&1
    goto :start_installer
  ) else (
    echo  [ERROR] Installation fehlgeschlagen.
    echo  Bitte installiere Node.js manuell: https://nodejs.org/
    echo  Starte dann dieses Script erneut.
    echo.
    pause
    exit /b 1
  )
) else (
  echo  [ERROR] Download fehlgeschlagen.
  echo  Bitte installiere Node.js manuell: https://nodejs.org/
  echo  Starte dann dieses Script erneut.
  echo.
  pause
  exit /b 1
)

:start_installer
echo  [INFO] Starte Web-GUI Wizard...
echo  Der Browser oeffnet sich automatisch.
echo  (Wenn der Browser sich nicht oeffnet: http://localhost:4711)
echo.
node "%~dp0installer.js"
if %errorlevel% neq 0 (
  echo.
  echo  [WARN] Web-GUI fehlgeschlagen - versuche PowerShell...
  goto :powershell
)
goto :end

:powershell
where powershell >nul 2>&1
if %errorlevel% equ 0 (
  powershell -ExecutionPolicy Bypass -File "%~dp0install.ps1"
  goto :end
)
echo  [ERROR] PowerShell nicht gefunden.
echo.

:end
echo.
pause