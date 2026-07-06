# Technische Dokumentation

## 1. Systemarchitektur

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Dashboard│  │ Zeiter-  │  │ Admin:   │  │ Admin:   │    │
│  │ (KPIs)   │  │ erfassung│  │ Projekte │  │ Mitarb.  │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │             │             │             │           │
│       └─────────────┴─────────────┴─────────────┘           │
│                         │                                    │
│              ┌──────────┴──────────┐                        │
│              │  Supabase JS Client │                        │
│              │  (@supabase/ssr)    │                        │
│              └──────────┬──────────┘                        │
└─────────────────────────┼───────────────────────────────────┘
                          │ HTTPS (JWT-Auth)
┌─────────────────────────┼───────────────────────────────────┐
│                  Supabase Backend                            │
│  ┌──────────┐  ┌────────┴───┐  ┌──────────────┐            │
│  │  Auth    │  │ PostgreSQL │  │ Edge Function│            │
│  │  (JWT)   │  │  + RLS     │  │ get-projects │            │
│  └──────────┘  └────────────┘  └──────────────┘            │
│                     │                                        │
│              ┌──────┴───────┐                                │
│              │   Views      │                                │
│              │  v_project_  │                                │
│              │  summary     │                                │
│              │  v_employee_ │                                │
│              │  utilization │                                │
│              └──────────────┘                                │
└──────────────────────────────────────────────────────────────┘
```

## 2. Technologie-Stack

| Komponente | Technologie | Version |
|------------|-------------|---------|
| Framework | Next.js (App Router) | 15.1.6 |
| UI-Library | React | 19.0 |
| Sprache | TypeScript | 5.7 |
| Styling | Tailwind CSS | 3.4 |
| Charts | Recharts | 2.15 |
| Icons | lucide-react | 0.474 |
| Datumsformatierung | date-fns | 4.1 |
| Backend | Supabase (PostgreSQL) | 15 |
| Auth | Supabase Auth (JWT) | – |
| Edge Runtime | Deno (Supabase Functions) | – |

## 3. Projektstruktur

```
zeiterfassung-modul/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root-Layout
│   │   ├── globals.css             # Tailwind + Komponenten
│   │   ├── login/page.tsx          # Login-Seite
│   │   └── (dashboard)/
│   │       ├── layout.tsx          # Sidebar-Shell + Auth-Guard
│   │       ├── page.tsx            # Dashboard mit KPIs
│   │       ├── zeiterfassung/page.tsx    # Zeiterfassung
│   │       └── admin/
│   │           ├── projekte/page.tsx     # Projekt-Verwaltung
│   │           └── mitarbeiter/page.tsx  # Mitarbeiter-Verwaltung
│   ├── lib/
│   │   ├── supabase-browser.ts     # Client-Side Supabase
│   │   ├── supabase-clients.ts     # Server/Client Supabase
│   │   └── utils.ts                # Formatierungs-Helfer
│   ├── types/
│   │   └── database.ts             # TypeScript-Domänenmodell
│   └── middleware.ts               # Session-Refresh + Routenschutz
├── supabase/
│   ├── config.toml                 # Supabase-Projekt-Konfig
│   ├── migrations/
│   │   ├── 0001_initial_schema.sql # Tabellen, Indizes, Trigger
│   │   ├── 0002_rls_policies.sql   # RLS + Helper + View
│   │   └── 0003_analytics_views.sql# Kennzahlen-Views
│   ├── seed.sql                    # Testdaten
│   └── functions/
│       └── get-projects/index.ts   # Edge Function
├── docs/                           # Dokumentation (01–07)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── .env.local.example
```

## 4. Datenbank-Migrationen

### 0001_initial_schema.sql
- Erstellt Tabellen: customers, employees, projects, activities, time_entries
- UUID-Primärschlüssel, Fremdschlüssel-Beziehungen
- Indizes für Performanz
- `updated_at`-Trigger

### 0002_rls_policies.sql
- Aktiviert RLS auf allen Tabellen
- Definiert Helper-Funktionen (security definer)
- Erstellt Policies je Tabelle und Rolle
- Erstellt `v_time_entries_full`-View

### 0003_analytics_views.sql
- `v_project_summary`: Projektmarge, Budget-Auslastung, Kosten/Erlös
- `v_employee_utilization`: Mitarbeiter-Auslastung
- `v_daily_hours`: Tageswerte für Diagramme

## 5. Edge Function: get-projects

**Zweck**: Gesicherte Lese-Schnittstelle für Kunden-/Projektdaten.
Ermöglicht die Anbindung des bestehenden Verwaltungssystems.

**Endpoint**: `GET /functions/v1/get-projects`

**Auth**: JWT-Pflicht (`verify_jwt = true`)

**Response**:
```json
{
  "customers": [
    {
      "id": "uuid",
      "name": "Müller Bau GmbH",
      "email": "info@...",
      "city": "Bamberg",
      "active": true,
      "projects": [
        { "id": "uuid", "name": "Website-Relaunch", "status": "active", ... }
      ]
    }
  ]
}
```

**Deployment**:
```bash
supabase functions deploy get-projects
```

## 6. Auth- und Session-Management

- **Login**: E-Mail/Passwort via `supabase.auth.signInWithPassword()`
- **Session**: Cookie-basiert (`@supabase/ssr`)
- **Middleware**: Refresh-Token bei jedem Request, Redirect auf `/login` bei fehlender Session
- **Logout**: `supabase.auth.signOut()` → Redirect

## 7. Kennzahlen-Definitionen

| Kennzahl | Formel | View |
|----------|--------|------|
| Gebuchte Stunden | Σ duration_min / 60 | v_project_summary.booked_hours |
| Verrechenbare Stunden | Σ duration_min (billable) / 60 | v_project_summary.billable_hours |
| Budget-Auslastung | booked_hours / budget_hours × 100 | v_project_summary.budget_utilization_pct |
| Interne Kosten | Σ (duration_min/60 × employee.hourly_rate) | v_project_summary.internal_cost |
| Erlös | billable_hours × project.hourly_rate | v_project_summary.revenue |
| Projektmarge | revenue − internal_cost | v_project_summary.margin |
| Mitarbeiter-Auslastung | booked_hours_year / (weekly_hours × 52) × 100 | v_employee_utilization |

## 8. Sicherheitskonzept

- **Authentifizierung**: Supabase Auth (JWT, bcrypt-Passwort-Hashing)
- **Autorisierung**: Row Level Security auf Tabellenebene
- **Schnittstelle**: Edge Function mit JWT-Verifikation
- **CORS**: Konfiguriert in Edge Function
- **Umgebungsvariablen**: Service-Role-Key nur serverseitig, nie im Browser
- **Keine** Secrets im Repository (`.env.local` in `.gitignore`)

## 9. Deployment

### Lokale Entwicklung
```bash
# 1. Supabase starten
supabase start
supabase db reset    # Migrationen + Seed ausführen

# 2. Next.js starten
cp .env.local.example .env.local  # Werte eintragen
npm install
npm run dev
```

### Produktiv-Deployment (nicht Teil der Projektarbeit)
- Next.js: Vercel oder Self-Hosted
- Supabase: Cloud oder Self-Hosted (Docker)
- Edge Function: `supabase functions deploy`