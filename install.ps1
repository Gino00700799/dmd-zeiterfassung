# ============================================================
# DMD Zeiterfassung — Windows Installation (PowerShell)
# ============================================================
# Ausführen in PowerShell:
#   .\install.ps1
# Prüft Node.js/npm und installiert automatisch, falls fehlend.
# ============================================================

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

function Write-Info($msg)  { Write-Host "[INFO]  $msg" -ForegroundColor Cyan }
function Write-Ok($msg)    { Write-Host "[OK]    $msg" -ForegroundColor Green }
function Write-Warn($msg)  { Write-Host "[WARN]  $msg" -ForegroundColor Yellow }
function Write-Err($msg)   { Write-Host "[ERROR] $msg" -ForegroundColor Red }

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Blue
Write-Host "  DMD Zeiterfassung - Installation (Windows)" -ForegroundColor Blue
Write-Host "==========================================================" -ForegroundColor Blue
Write-Host ""

# --- 0. Node.js / npm pruefen und ggf. installieren ---
function Test-Node {
    try { $v = node --version 2>$null; return $v } catch { return $null }
}
function Test-Npm {
    try { $v = npm --version 2>$null; return $v } catch { return $null }
}

$nodeVer = Test-Node
$npmVer = Test-Npm

if (-not $nodeVer) {
    Write-Warn "Node.js nicht gefunden."
    Write-Host ""
    Write-Info "Node.js wird automatisch installiert..."
    Write-Info "Dies kann 1-2 Minuten dauern."
    Write-Host ""

    # Methode 1: winget (Windows 10/11 ab Werk)
    $winget = Get-Command winget -ErrorAction SilentlyContinue
    if ($winget) {
        Write-Info "Installiere Node.js via winget..."
        try {
            winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
            Write-Ok "Node.js via winget installiert!"
        } catch {
            Write-Warn "winget fehlgeschlagen, versuche Download..."
            goto :download
        }
    } else {
        Write-Info "winget nicht verfügbar, lade Node.js herunter..."
    }

    # Methode 2: Direkter Download + MSI-Installation
    if (-not (Test-Node)) {
        $nodeUrl = "https://nodejs.org/dist/v22.23.1/node-v22.23.1-x64.msi"
        $msiPath = "$env:TEMP\nodejs.msi"

        Write-Info "Lade Node.js LTS herunter..."
        try {
            [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
            Invoke-WebRequest -Uri $nodeUrl -OutFile $msiPath
            Write-Ok "Download abgeschlossen."
        } catch {
            Write-Err "Download fehlgeschlagen: $_"
            Write-Err "Bitte installiere Node.js manuell: https://nodejs.org/"
            exit 1
        }

        Write-Info "Installiere Node.js..."
        Start-Process msiexec.exe -ArgumentList "/i `"$msiPath`" /qb" -Wait
        Remove-Item $msiPath -ErrorAction SilentlyContinue

        # PATH für diese Session aktualisieren
        $env:PATH = "$env:ProgramFiles\nodejs;$env:LOCALAPPDATA\npm;$env:PATH"
    }

    # Erneut prüfen
    $nodeVer = Test-Node
    if ($nodeVer) {
        Write-Ok "Node.js $nodeVer installiert!"
        $npmVer = Test-Npm
        if ($npmVer) { Write-Ok "npm v$npmVer" }
    } else {
        Write-Err "Node.js Installation fehlgeschlagen."
        Write-Err "Bitte installiere Node.js manuell: https://nodejs.org/"
        Write-Err "Starte dann dieses Script erneut."
        exit 1
    }
} else {
    Write-Ok "Node.js $nodeVer"
    if ($npmVer) {
        Write-Ok "npm v$npmVer"
    } else {
        Write-Err "npm nicht gefunden (sollte mit Node.js kommen)."
        Write-Err "Bitte Node.js neu installieren: https://nodejs.org/"
        exit 1
    }
}

# Node-Version prüfen (≥ 20)
if ($nodeVer -match "v(\d+)") {
    $major = [int]$Matches[1]
    if ($major -lt 20) {
        Write-Err "Node.js $nodeVer - Version 20+ erforderlich"
        Write-Err "Bitte aktualisieren: https://nodejs.org/"
        exit 1
    }
}

try {
    $gitVersion = git --version 2>$null
    Write-Ok "git $gitVersion"
} catch {
    Write-Warn "git nicht gefunden (optional)"
}

Write-Host ""

# --- 1. npm install ---
Write-Info "Installiere Abhaengigkeiten..."
Set-Location $ProjectRoot
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Err "npm install fehlgeschlagen"
    exit 1
}
$pkgCount = (Get-ChildItem node_modules -Directory).Count
Write-Ok "$pkgCount Pakete installiert"
Write-Host ""

# --- 2. Supabase config ---
Write-Host "----------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "  Supabase-Konfiguration" -ForegroundColor Cyan
Write-Host "----------------------------------------------------------" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Du brauchst ein Supabase-Projekt (supabase.com)."
Write-Host "Keys finden unter: Dashboard -> Settings -> API"
Write-Host ""

if (Test-Path "$ProjectRoot\.env.local") {
    Write-Warn ".env.local bereits vorhanden."
    $overwrite = Read-Host "Ueberschreiben? (j/N)"
    if ($overwrite -ne "j" -and $overwrite -ne "J") {
        Write-Info "Behalte bestehende .env.local"
        $skipEnv = $true
    }
}

if (-not $skipEnv) {
    $supUrl = Read-Host "Supabase Project URL (https://xxxxx.supabase.co)"
    $supAnon = Read-Host "Supabase anon/publishable key"
    $supService = Read-Host "Supabase service_role key (optional)"

    if (-not $supUrl -or -not $supAnon) {
        Write-Err "URL und anon key sind erforderlich!"
        exit 1
    }

    $envContent = "NEXT_PUBLIC_SUPABASE_URL=$supUrl`nNEXT_PUBLIC_SUPABASE_ANON_KEY=$supAnon`nSUPABASE_SERVICE_ROLE_KEY=$supService"
    Set-Content -Path "$ProjectRoot\.env.local" -Value $envContent -NoNewline
    Write-Ok ".env.local erstellt"

    Write-Host ""
    Write-Warn "WICHTIG: SQL-Migrationen im Supabase Dashboard ausfuehren!"
    Write-Host "  1. SQL Editor -> New query"
    Write-Host "  2. Nacheinander ausfuehren:"
    Write-Host "     supabase/migrations/0001_initial_schema.sql"
    Write-Host "     supabase/migrations/0002_rls_policies.sql"
    Write-Host "     supabase/migrations/0003_analytics_views.sql"
    Write-Host "     supabase/seed.sql"
    Write-Host "  3. Test-User unter Authentication -> Users anlegen"
    Write-Host ""
}

# --- 3. Build test ---
Write-Host "----------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "  Build-Test" -ForegroundColor Cyan
Write-Host "----------------------------------------------------------" -ForegroundColor DarkGray
Write-Host ""

Write-Info "Fuehre Build-Test aus..."
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Ok "Build erfolgreich!"
} else {
    Write-Err "Build fehlgeschlagen"
    exit 1
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  Installation abgeschlossen!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Starten mit:  npm run dev"
Write-Host "  Im Browser:   http://localhost:3000"
Write-Host ""
Write-Host "  Test-Zugänge:"
Write-Host "    Mitarbeiter:   anna.schmidt@dmd-studio.de / test1234"
Write-Host "    Administrator: julia.hofmann@dmd-studio.de / test1234"
Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green