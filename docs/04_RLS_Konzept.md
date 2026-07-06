# Rollen- und Berechtigungskonzept mit Row Level Security

## 1. Übersicht

Die Zugriffskontrolle erfolgt **ausschließlich auf Datenbankebene** über
PostgreSQL Row Level Security (RLS). Es gibt kein client-side Filtering.
Supabase nutzt JWT-Tokens zur Authentifizierung; die RLS-Policies
prüfen die Identität via `auth.uid()`.

## 2. Rollen

| Rolle | Kennung | Rechte |
|-------|---------|--------|
| Mitarbeiter | `employee` | Eigene Zeitbuchungen: Lesen, Anlegen, Ändern, Löschen. Stammdaten: Lesen. |
| Administrator | `admin` | Alle Zeitbuchungen: Lesen, Ändern, Löschen. Stammdaten: Lesen und Schreiben (CRUD). |

## 3. RLS-Aktivierung

```sql
alter table public.customers    enable row level security;
alter table public.employees    enable row level security;
alter table public.projects     enable row level security;
alter table public.activities   enable row level security;
alter table public.time_entries enable row level security;
```

## 4. Helper-Funktionen

### 4.1 current_employee_role()
```sql
create or replace function public.current_employee_role()
returns text language sql security definer stable as $$
  select e.role from public.employees e
  where e.user_id = auth.uid() limit 1;
$$;
```
Gibt die Rolle des angemeldeten Nutzers zurück (`'employee'` oder `'admin'`).

### 4.2 current_employee_id()
```sql
create or replace function public.current_employee_id()
returns uuid language sql security definer stable as $$
  select e.id from public.employees e
  where e.user_id = auth.uid() limit 1;
$$;
```
Gibt die UUID des Employee-Datensatzes zurück.

### 4.3 is_admin()
```sql
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select coalesce(public.current_employee_role() = 'admin', false);
$$;
```
Wahr, wenn der angemeldete Nutzer Admin ist.

> **Wichtig**: Alle Helper sind `SECURITY DEFINER` (ausgeführt mit
> Tabellen-Owner-Rechten), damit sie innerhalb von RLS-Policies
> verwendet werden können, ohne eine Rekursion auszulösen.

## 5. Policy-Übersicht

### 5.1 customers

| Policy | Operation | Bedingung |
|--------|-----------|-----------|
| customers_read | SELECT | `auth.role() = 'authenticated'` |
| customers_write | ALL | `public.is_admin()` |

### 5.2 employees

| Policy | Operation | Bedingung |
|--------|-----------|-----------|
| employees_read_self | SELECT | `user_id = auth.uid() OR is_admin()` |
| employees_write_admin | ALL | `is_admin()` |

### 5.3 projects

| Policy | Operation | Bedingung |
|--------|-----------|-----------|
| projects_read | SELECT | `auth.role() = 'authenticated'` |
| projects_write | ALL | `is_admin()` |

### 5.4 activities

| Policy | Operation | Bedingung |
|--------|-----------|-----------|
| activities_read | SELECT | `auth.role() = 'authenticated'` |
| activities_write | ALL | `is_admin()` |

### 5.5 time_entries

| Policy | Operation | Bedingung |
|--------|-----------|-----------|
| time_entries_read_own | SELECT | `employee_id = current_employee_id() OR is_admin()` |
| time_entries_insert_own | INSERT | `employee_id = current_employee_id()` |
| time_entries_update_own | UPDATE | `employee_id = current_employee_id()` (USING + WITH CHECK) |
| time_entries_admin_update | UPDATE | `is_admin()` |
| time_entries_delete_own | DELETE | `employee_id = current_employee_id()` |
| time_entries_admin_delete | DELETE | `is_admin()` |

## 6. DSGVO-Aspekte

- Arbeitszeiten sind **personenbezogene Daten** (Art. 4 DSGVO).
- Zugriff durch Mitarbeiter nur auf **eigene** Daten (Art. 5 Grundsatz
  der Datenminimierung, Art. 32 Sicherheit der Verarbeitung).
- Admin-Zugriff ist **zielgerichtet** auf Auswertung und Genehmigung
  beschränkt (kein Export an Dritte).
- **Anonymisierte Testdaten** in `seed.sql` (keine echten Personen).
- Keine Datenweitergabe an externe Dienste (Supabase self-hosted möglich).

## 7. Test-Verifikation der RLS-Policies

### Szenario A: Mitarbeiter liest fremde Buchung
```sql
-- set config role to employee user
select * from time_entries where employee_id != current_employee_id();
-- erwartetes Ergebnis: 0 Zeilen
```

### Szenario B: Admin liest alle Buchungen
```sql
-- set config role to admin user
select count(*) from time_entries;
-- erwartetes Ergebnis: alle Zeilen
```

### Szenario C: Mitarbeiter versucht Projekt zu löschen
```sql
delete from projects where id = '...';
-- erwartetes Ergebnis: Fehler oder 0 Zeilen (RLS blockiert)
```

## 8. Views und RLS-Vererbung

PostgreSQL-Views erben RLS-Policies von den **zugrundeliegenden
Tabellen**, wenn die Views mit `security_invoker`-Semantik ausgeführt
werden (Default bei Supabase). Dadurch sind auch
`v_time_entries_full`, `v_project_summary` und
`v_employee_utilization` automatisch rollenabhängig – ein Mitarbeiter
sieht in der View nur seine eigenen Zeitbuchungen, ein Admin alle.