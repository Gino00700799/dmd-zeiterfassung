#!/bin/bash
# ============================================================
# Install-Script für DMD Zeiterfassung
# Projektzeiterfassung & Projekt-Controlling
# ============================================================
# Dieses Script:
#   1. Prüft Systemvoraussetzungen
#   2. Installiert Node.js-Abhängigkeiten
#   3. Fragt Supabase-Zugangsdaten ab
#   4. Erstellt .env.local
#   5. Führt einen Build-Test durch
# ============================================================

set -e

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info()  { echo -e "${BLUE}[INFO]${NC}  $1"; }
print_ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
print_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  DMD Zeiterfassung – Installation"
echo "  Projektzeiterfassung & Projekt-Controlling"
echo "════════════════════════════════════════════════════════════"
echo ""

# ──────────────────────────────────────────────────────────
# 1. Systemvoraussetzungen prüfen
# ──────────────────────────────────────────────────────────
print_info "Prüfe Systemvoraussetzungen…"

# Node.js
if command -v node &> /dev/null; then
  NODE_VERSION=$(node --version)
  NODE_MAJOR=$(echo "$NODE_VERSION" | sed 's/v//' | cut -d. '.' -f1)
  if [ "$NODE_MAJOR" -ge 20 ]; then
    print_ok "Node.js $NODE_VERSION gefunden"
  else
    print_error "Node.js $NODE_VERSION gefunden – Version 20+ erforderlich"
    exit 1
  fi
else
  print_error "Node.js nicht gefunden. Bitte installieren: https://nodejs.org/"
  exit 1
fi

# npm
if command -v npm &> /dev/null; then
  print_ok "npm $(npm --version) gefunden"
else
  print_error "npm nicht gefunden. Bitte mit Node.js installieren."
  exit 1
fi

# git
if command -v git &> /dev/null; then
  print_ok "git $(git --version | cut -d' ' -f3) gefunden"
else
  print_warn "git nicht gefunden (optional, für Versionskontrolle empfohlen)"
fi

echo ""

# ──────────────────────────────────────────────────────────
# 2. Abhängigkeiten installieren
# ──────────────────────────────────────────────────────────
print_info "Installiere Node.js-Abhängigkeiten…"
npm install --silent
print_ok "Abhängigkeiten installiert ($(ls node_modules | wc -l) Pakete)"
echo ""

# ──────────────────────────────────────────────────────────
# 3. Supabase-Zugangsdaten abfragen
# ──────────────────────────────────────────────────────────
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Supabase-Konfiguration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Du brauchst ein Supabase-Projekt (kostenlos auf supabase.com)."
echo "Die Zugangsdaten findest du im Dashboard unter:"
echo "  Settings → API"
echo ""

# .env.local schon vorhanden?
if [ -f ".env.local" ]; then
  print_warn ".env.local bereits vorhanden."
  read -p "Überschreiben? (j/N) " OVERWRITE
  if [[ "$OVERWRITE" != "j" && "$OVERWRITE" != "J" ]]; then
    print_info "Behalte bestehende .env.local"
    echo ""
    # Prüfe ob die Keys gültig aussehen
    if grep -q "HIER" .env.local 2>/dev/null; then
      print_warn ".env.local enthält noch Platzhalter – bitte manuell anpassen!"
    fi
    # Skip to build
    SKIP_ENV=true
  fi
fi

if [ "$SKIP_ENV" != "true" ]; then
  echo ""
  read -p "Supabase Project URL (https://xxxxx.supabase.co): " SUPABASE_URL
  read -p "Supabase anon/publishable key: " SUPABASE_ANON
  read -p "Supabase service_role key (optional, für Edge Function): " SUPABASE_SERVICE

  if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON" ]; then
    print_error "URL und anon key sind erforderlich!"
    exit 1
  fi

  # .env.local erstellen
  cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE
EOF

  print_ok ".env.local erstellt"
  echo ""
  print_warn "WICHTIG: Führe jetzt die SQL-Migrationen im Supabase Dashboard aus!"
  echo "  1. Gehe zu SQL Editor → New query"
  echo "  2. Führe nacheinander aus:"
  echo "     supabase/migrations/0001_initial_schema.sql"
  echo "     supabase/migrations/0002_rls_policies.sql"
  echo "     supabase/migrations/0003_analytics_views.sql"
  echo "     supabase/seed.sql"
  echo "  3. Lege Test-User unter Authentication → Users an:"
  echo "     anna.schmidt@dmd-studio.de / test1234"
  echo "     julia.hofmann@dmd-studio.de / test1234"
  echo "  4. Verknüpfe User mit employees (SQL Editor):"
  echo "     UPDATE employees SET user_id='ANNA_UID' WHERE id='d0000000-0000-0000-0000-000000000001';"
  echo "     UPDATE employees SET user_id='JULIA_UID' WHERE id='d0000000-0000-0000-0000-000000000003';"
  echo ""
fi

# ──────────────────────────────────────────────────────────
# 4. Build-Test
# ──────────────────────────────────────────────────────────
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Build-Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

print_info "Führe Build-Test aus…"
if npm run build 2>&1 | tail -20; then
  print_ok "Build erfolgreich!"
else
  print_error "Build fehlgeschlagen – bitte Fehlermeldungen oben prüfen"
  exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  ✅ Installation abgeschlossen!"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "  Starten mit:"
echo "    npm run dev"
echo ""
echo "  App öffnen im Browser:"
echo "    http://localhost:3000"
echo ""
echo "  Test-Zugänge (nach User-Anlage in Supabase):"
echo "    Mitarbeiter:  anna.schmidt@dmd-studio.de / test1234"
echo "    Administrator: julia.hofmann@dmd-studio.de / test1234"
echo ""
echo "  Dokumentation:"
echo "    docs/ — Alle Dokumente (Anforderungen, Doku, Tests)"
echo "    README.md — Kurzanleitung"
echo "    DESIGN.md — Design-System Spec"
echo ""
echo "════════════════════════════════════════════════════════════"