# Datenmodell – ER-Diagramm und relationales Schema

## 1. ER-Diagramm (textuelle Darstellung)

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  customers   │       │   projects   │       │ time_entries │
│──────────────│       │──────────────│       │──────────────│
│ PK  id       │◄──────│ FK  customer │       │ PK  id       │
│     name     │  1:n  │     id       │◄──────│ FK  project  │  n:1
│     street   │       │     name     │  n:1  │ FK  employee │──→ employees
│     zip_code │       │     status   │       │ FK  activity │──→ activities
│     city     │       │     budget_h │       │     date     │
│     email    │       │     budget_€ │       │     start    │
│     phone    │       │     rate     │       │     end      │
│     active   │       │     start    │       │     duration │
│     created  │       │     end      │       │     descr    │
│     updated  │       │     created  │       │     billable │
└──────────────┘       │     updated  │       │     status   │
                       └──────────────┘       │     created  │
                                              │     updated  │
┌──────────────┐                              └──────────────┘
│  employees   │
│──────────────│       ┌──────────────┐
│ PK  id       │       │  activities  │
│ FK  user_id  │──→auth│──────────────│
│     first    │       │ PK  id       │
│     last     │       │     name     │
│     email    │       │     descr    │
│     role     │       │     active   │
│     rate     │       │     created  │
│     weekly_h │       └──────────────┘
│     active   │
│     created  │
│     updated  │
└──────────────┘
```

## 2. Relationale Beziehungen

| Von | Nach | Typ | Fremdschlüssel | On Delete |
|-----|------|-----|----------------|-----------|
| projects | customers | n:1 | projects.customer_id → customers.id | RESTRICT |
| time_entries | employees | n:1 | time_entries.employee_id → employees.id | RESTRICT |
| time_entries | projects | n:1 | time_entries.project_id → projects.id | RESTRICT |
| time_entries | activities | n:1 | time_entries.activity_id → activities.id | SET NULL |
| employees | auth.users | 1:1 | employees.user_id → auth.users.id | CASCADE |

## 3. Tabellen-Spezifikation

### 3.1 customers

| Spalte | Typ | Constraints | Beschreibung |
|--------|-----|-------------|--------------|
| id | uuid | PK, default uuid_generate_v4() | Primärschlüssel |
| name | text | NOT NULL | Kundenname |
| street | text | | Straße |
| zip_code | text | | PLZ |
| city | text | | Ort |
| email | text | | E-Mail |
| phone | text | | Telefon |
| active | boolean | NOT NULL, default true | Aktiv-Flag |
| created_at | timestamptz | NOT NULL, default now() | Erstellzeitpunkt |
| updated_at | timestamptz | NOT NULL, default now() | Letzte Änderung |

### 3.2 employees

| Spalte | Typ | Constraints | Beschreibung |
|--------|-----|-------------|--------------|
| id | uuid | PK | Primärschlüssel |
| user_id | uuid | UNIQUE, FK → auth.users | Supabase-Auth-User |
| first_name | text | NOT NULL | Vorname |
| last_name | text | NOT NULL | Nachname |
| email | text | NOT NULL | E-Mail |
| role | text | NOT NULL, CHECK in ('employee','admin') | Rolle |
| hourly_rate | numeric(8,2) | NOT NULL, default 0 | Interner Stundensatz |
| weekly_hours | numeric(5,1) | NOT NULL, default 40 | Wochenstunden |
| active | boolean | NOT NULL, default true | Aktiv-Flag |
| created_at | timestamptz | NOT NULL | Erstellzeitpunkt |
| updated_at | timestamptz | NOT NULL | Letzte Änderung |

### 3.3 projects

| Spalte | Typ | Constraints | Beschreibung |
|--------|-----|-------------|--------------|
| id | uuid | PK | Primärschlüssel |
| customer_id | uuid | NOT NULL, FK → customers | Kundenbezug |
| name | text | NOT NULL | Projektname |
| description | text | | Beschreibung |
| status | text | CHECK in ('planned','active','completed','cancelled') | Status |
| budget_hours | numeric(8,2) | | Angebotssoll (Stunden) |
| budget_amount | numeric(12,2) | | Angebotssumme (€) |
| hourly_rate | numeric(8,2) | NOT NULL, default 0 | Verrechnungssatz |
| start_date | date | | Projektstart |
| end_date | date | | Projektende |
| created_at | timestamptz | | Erstellzeitpunkt |
| updated_at | timestamptz | | Letzte Änderung |

### 3.4 activities

| Spalte | Typ | Constraints | Beschreibung |
|--------|-----|-------------|--------------|
| id | uuid | PK | Primärschlüssel |
| name | text | NOT NULL | Tätigkeitsname |
| description | text | | Beschreibung |
| active | boolean | NOT NULL, default true | Aktiv-Flag |
| created_at | timestamptz | | Erstellzeitpunkt |

### 3.5 time_entries

| Spalte | Typ | Constraints | Beschreibung |
|--------|-----|-------------|--------------|
| id | uuid | PK | Primärschlüssel |
| employee_id | uuid | NOT NULL, FK → employees | Mitarbeiter |
| project_id | uuid | NOT NULL, FK → projects | Projekt |
| activity_id | uuid | FK → activities | Tätigkeit |
| date | date | NOT NULL, default current_date | Buchungsdatum |
| start_time | time | | Startzeit |
| end_time | time | | Endzeit |
| duration_min | integer | NOT NULL, CHECK > 0 | Dauer in Minuten |
| description | text | | Beschreibung |
| billable | boolean | NOT NULL, default true | Verrechenbar |
| status | text | CHECK in ('draft','submitted','approved','rejected') | Genehmigungsstatus |
| created_at | timestamptz | | Erstellzeitpunkt |
| updated_at | timestamptz | | Letzte Änderung |

## 4. Views

### 4.1 v_time_entries_full
Join über time_entries → employees → projects → customers → activities.
Erbt RLS von Basistabellen. Wird in der Zeiterfassungs-Tabelle verwendet.

### 4.2 v_project_summary
Aggregation je Projekt mit Kennzahlen:
- booked_hours, billable_hours, approved_hours
- budget_utilization_pct (Soll/Ist)
- internal_cost (Σ Dauer × Mitarbeiter-Stundensatz)
- revenue (Σ verrechenbare Dauer × Projekt-Stundensatz)
- margin (revenue − internal_cost)

### 4.3 v_employee_utilization
Auslastung je Mitarbeiter:
- booked_hours_year (gebuchte Stunden im laufenden Jahr)
- utilization_pct (gebucht / (weekly_hours × 52) × 100)

### 4.4 v_daily_hours
Gebuchte Stunden pro Tag und Mitarbeiter (für Diagramme).

## 5. Indizes

| Index | Tabelle | Spalte | Zweck |
|-------|---------|--------|-------|
| idx_time_entries_employee | time_entries | employee_id | Filter nach Mitarbeiter |
| idx_time_entries_project | time_entries | project_id | Filter nach Projekt |
| idx_time_entries_date | time_entries | date | Monatsfilter |
| idx_projects_customer | projects | customer_id | Join mit Kunden |
| idx_employees_user | employees | user_id | Auth-Lookup |

## 6. Trigger

`trg_set_updated_at` auf allen Tabellen → setzt `updated_at = now()` bei UPDATE.