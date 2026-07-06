# ============================================================
# DMD Zeiterfassung — Windows Installation (PowerShell)
# ============================================================
# Ausführen in PowerShell:
#   .\install.ps1
# Oder per Rechtsklick → "Mit PowerShell ausführen"
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

# --- 1. Prerequisites ---
Write-Info "Pruefe Systemvoraussetzungen..."

try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion -match "v(\d+)") {
        $major = [int]$Matches[1]
        if ($major -ge 20) {
            Write-Ok "Node.js $nodeVersion"
        } else {
            Write-Err "Node.js $nodeVersion - Version 20+ erforderlich"
            exit 1
        }
    } else { throw }
} catch {
    Write-Err "Node.js nicht gefunden. Installieren: https://nodejs.org/"
    exit 1
}

try {
    $npmVersion = npm --version 2>$null
    Write-Ok "npm v$npmVersion"
} catch {
    Write-Err "npm nicht gefunden."
    exit 1
}

try {
    $gitVersion = git --version 2>$null
    Write-Ok "git $gitVersion"
} catch {
    Write-Warn "git nicht gefunden (optional)"
}

Write-Host ""

# --- 2. npm install ---
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

# --- 3. Supabase config ---
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

# --- 4. Build test ---
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