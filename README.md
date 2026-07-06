# DMD Zeiterfassung – Projektzeiterfassung & Projekt-Controlling

Modul zur Projektzeiterfassung und zum projektbezogenen Controlling für das
interne Verwaltungssystem der **DMD Studio GmbH**.

> Projektarbeit im Rahmen der Technikerschule SBSZ Bamberg

---

## Tech-Stack

| Bereich | Technologie |
|---------|-------------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS |
| Charts | Recharts |
| Backend | Supabase (PostgreSQL 15, Auth, Edge Functions) |
| Sicherheit | Row Level Security (RLS), JWT-Auth |

**Keine kostenpflichtigen SaaS-Dienste** – nutzt ausschließlich Supabase
(Free-Tier / self-hosted) und Open-Source-Bibliotheken.

---

## Schnellstart

### Voraussetzungen

- Node.js ≥ 20
- npm ≥ 10
- Supabase CLI (`npm install -g supabase` oder im Projekt via `npx supabase`)

### 1. Supabase lokal starten

```bash
cd zeiterfassung-modul
npx supabase init          # falls noch nicht initialisiert
npx supabase start          # lokales Supabase starten (Docker nötig)
npx supabase db reset       # Migrationen + Seed-Daten ausführen
```

Nach dem Start findest du die Supabase Studio URL und die API-Keys
in der Ausgabe von `supabase start`.

### 2. Umgebungsvariablen konfigurieren

```bash
cp .env.local.example .env.local
```

Trage die Werte aus `supabase start` ein:
- `NEXT_PUBLIC_SUPABASE_URL` → API URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → anon key
- `SUPABASE_SERVICE_ROLE_KEY` → service_role key (nur für Edge Function)

### 3. Next.js installieren und starten

```bash
npm install
npm run dev
```

Die App ist unter `http://localhost:3000` erreichbar.

### 4. Test-User anlegen (optional)

In Supabase Studio → Authentication → Users → „Add user":
- E-Mail: `anna.schmidt@dmd-studio.de`, Passwort: `test1234`
- Danach in der Tabelle `employees` den Datensatz mit dieser E-Mail
  auf `user_id` des angelegten Users setzen.

---

## Build

```bash
npm run build       # Produktions-Build
npm run type-check  # TypeScript-Prüfung
npm run lint        # ESLint
```

---

## Projektstruktur

```
zeiterfassung-modul/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── login/               # Login-Seite
│   │   └── (dashboard)/         # Geschützte Routen
│   │       ├── zeiterfassung/   # Zeiterfassung (Mitarbeiter)
│   │       ├── admin/projekte/  # Projektverwaltung (Admin)
│   │       └── admin/mitarbeiter/ # Mitarbeiterverwaltung (Admin)
│   ├── lib/                     # Supabase-Clients, Hilfsfunktionen
│   ├── types/                   # TypeScript-Domänenmodell
│   └── middleware.ts            # Auth-Middleware
├── supabase/
│   ├── migrations/              # DB-Migrationen (Schema, RLS, Views)
│   ├── seed.sql                 # Testdaten
│   └── functions/get-projects/  # Edge Function (Schnittstelle)
├── docs/                        # Dokumentation (01–07)
└── package.json
```

---

## Dokumentation

| Dokument | Inhalt |
|----------|--------|
| `docs/01_Anforderungsanalyse.md` | Ist-Aufnahme, Soll-Konzept, Anforderungen |
| `docs/02_Prozessmodell.md` | EPK/BPMN – Erfassungs- und Auswertungsablauf |
| `docs/03_Datenmodell.md` | ER-Diagramm, relationales Schema, Views |
| `docs/04_RLS_Konzept.md` | Rollen, Policies, DSGVO-Aspekte |
| `docs/05_Technische_Dokumentation.md` | Architektur, Stack, Deployment |
| `docs/06_Kurzanleitung.md` | Anwenderdokumentation |
| `docs/07_Testprotokoll.md` | Abnahmetests gemäß Akzeptanzkriterien |

---

## Kennzahlen (Dashboard)

| Kennzahl | Definition |
|----------|-----------|
| Gebuchte Stunden | Σ aller gebuchten Minuten / 60 |
| Umsatz (verrechenbar) | Σ verrechenbare Stunden × Projekt-Stundensatz |
| Projektmarge | Umsatz − interne Kosten (Mitarbeiter-Stundensätze) |
| Budget-Auslastung | Gebuchte Stunden / Budget-Stunden × 100 % |
| Mitarbeiter-Auslastung | Jahressoll / (Wochenstunden × 52) × 100 % |

---

## Abnahmekriterien

- [x] Zeiten lassen sich auf Projekte buchen und nachträglich korrigieren
- [x] Auswertungen liefern gegen Testdaten korrekte Summen je Projekt und Mitarbeiter
- [x] Berechtigungen greifen nachweislich (eigene vs. alle Daten)
- [x] Dashboard stellt mindestens drei definierte Kennzahlen korrekt dar
- [x] Modul läuft im bestehenden Next.js-/Supabase-Stack ohne externe Abo-Dienste
- [x] Dokumentation ist vollständig und nachvollziehbar

---

## Edge Function deployen

```bash
npx supabase functions deploy get-projects
```

Aufruf (mit JWT):
```bash
curl -H "Authorization: Bearer <JWT>" \
     https://<projekt>.supabase.co/functions/v1/get-projects
```

---

## Lizenz

Projektarbeit – DMD Studio GmbH / SBSZ Bamberg.
Alle Rechte bei den Projektbeteiligten.

---

## GitHub-Setup

### Repository auf GitHub erstellen und hochladen

```bash
# 1. Auf GitHub ein neues Repository erstellen (ohne README/.gitignore)

# 2. Remote hinzufügen (URL durch deine ersetzen)
git remote add origin https://github.com/DEIN-USERNAME/dmd-zeiterfassung.git

# 3. Hochladen
git branch -M main
git push -u origin main
```

### Für neue Entwickler (Clone & Install)

```bash
# 1. Repository klonen
git clone https://github.com/DEIN-USERNAME/dmd-zeiterfassung.git
cd dmd-zeiterfassung

# 2. Install-Script ausführen (prüft Node, installiert Pakete,
#    fragt Supabase-Keys ab, führt Build-Test durch)
./install.sh

# 3. SQL-Migrationen im Supabase Dashboard ausführen
#    (siehe install.sh Ausgabe oder README oben)

# 4. App starten
npm run dev
```