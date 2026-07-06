#!/bin/bash
# ============================================================
# DMD Zeiterfassung — Linux/macOS Installation (Bash)
# ============================================================
# Ausführen: ./install.sh
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

info()  { echo -e "${CYAN}[INFO]${NC}  $1"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
err()   { echo -e "${RED}[ERROR]${NC} $1"; }

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  ${BOLD}DMD Zeiterfassung — Installation${NC}"
echo -e "${BLUE}  Projektzeiterfassung & Projekt-Controlling${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# ─── 1. Prerequisites ─────────────────────────────────────
info "Prüfe Systemvoraussetzungen…"

if command -v node &>/dev/null; then
  NODE_VERSION=$(node --version)
  NODE_MAJOR=$(echo "$NODE_VERSION" | sed 's/v//' | cut -d. -f1)
  if [ "$NODE_MAJOR" -ge 20 ]; then
    ok "Node.js $NODE_VERSION"
  else
    err "Node.js $NODE_VERSION — Version 20+ erforderlich"
    exit 1
  fi
else
  err "Node.js nicht gefunden → https://nodejs.org/"
  exit 1
fi

if command -v npm &>/dev/null; then
  ok "npm $(npm --version)"
else
  err "npm nicht gefunden"
  exit 1
fi

if command -v git &>/dev/null; then
  ok "git $(git --version | cut -d' ' -f3)"
else
  warn "git nicht gefunden (optional)"
fi

echo ""

# ─── 2. npm install ───────────────────────────────────────
info "Installiere Node.js-Abhängigkeiten…"
npm install
PKG_COUNT=$(ls node_modules | wc -l)
ok "$PKG_COUNT Pakete installiert"
echo ""

# ─── 3. Supabase config ───────────────────────────────────
echo -e "${BLUE}───────────────────────────────────────────────────────────${NC}"
echo -e "${CYAN}  Supabase-Konfiguration${NC}"
echo -e "${BLUE}───────────────────────────────────────────────────────────${NC}"
echo ""
echo "Du brauchst ein Supabase-Projekt (supabase.com)."
echo "Keys im Dashboard unter: Settings → API"
echo ""

if [ -f ".env.local" ]; then
  warn ".env.local bereits vorhanden."
  read -p "Überschreiben? (j/N) " OVERWRITE
  if [[ "$OVERWRITE" != "j" && "$OVERWRITE" != "J" ]]; then
    info "Behalte bestehende .env.local"
    SKIP_ENV=true
  fi
fi

if [ "$SKIP_ENV" != "true" ]; then
  echo ""
  read -p "Supabase Project URL (https://xxxxx.supabase.co): " SUPABASE_URL
  read -p "Supabase anon/publishable key: " SUPABASE_ANON
  read -p "Supabase service_role key (optional): " SUPABASE_SERVICE

  if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON" ]; then
    err "URL und anon key sind erforderlich!"
    exit 1
  fi

  cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE
EOF
  ok ".env.local erstellt"

  echo ""
  warn "WICHTIG: Führe jetzt die SQL-Migrationen im Supabase Dashboard aus!"
  echo "  1. SQL Editor → New query"
  echo "  2. Nacheinander ausführen:"
  echo "     supabase/migrations/0001_initial_schema.sql"
  echo "     supabase/migrations/0002_rls_policies.sql"
  echo "     supabase/migrations/0003_analytics_views.sql"
  echo "     supabase/seed.sql"
  echo "  3. Test-User unter Authentication → Users anlegen:"
  echo "     anna.schmidt@dmd-studio.de / test1234"
  echo "     julia.hofmann@dmd-studio.de / test1234"
  echo "  4. User mit employees verknüpfen (SQL Editor):"
  echo "     UPDATE employees SET user_id='ANNA_UID' WHERE id='d0000000-…001';"
  echo "     UPDATE employees SET user_id='JULIA_UID' WHERE id='d0000000-…003';"
  echo ""
fi

# ─── 4. Build test ────────────────────────────────────────
echo -e "${BLUE}───────────────────────────────────────────────────────────${NC}"
echo -e "${CYAN}  Build-Test${NC}"
echo -e "${BLUE}───────────────────────────────────────────────────────────${NC}"
echo ""

info "Führe Build-Test aus…"
if npm run build 2>&1 | tail -20; then
  ok "Build erfolgreich!"
else
  err "Build fehlgeschlagen"
  exit 1
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ${BOLD}✅ Installation abgeschlossen!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "  Starten mit:   npm run dev"
echo "  Im Browser:    http://localhost:3000"
echo ""
echo "  Test-Zugänge:"
echo "    Mitarbeiter:   anna.schmidt@dmd-studio.de / test1234"
echo "    Administrator: julia.hofmann@dmd-studio.de / test1234"
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"