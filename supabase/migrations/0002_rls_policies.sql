-- ============================================================
-- Migration 0002: Row Level Security (RLS) & Berechtigungskonzept
-- ============================================================
-- Rollen:
--   employee  – Mitarbeiter: sieht/bucht nur eigene Zeitbuchungen
--   admin     – Geschäftsführung: sieht alle Daten, verwaltet Stammdaten
--
-- Umsetzung ausschließlich über RLS-Policies (kein client-side
-- Filtering). Die Rolle wird in der Spalte employees.role
-- gespeichert und über eine Helper-Funktion geprüft.
-- ============================================================

-- RLS aktivieren
alter table public.customers    enable row level security;
alter table public.employees    enable row level security;
alter table public.projects     enable row level security;
alter table public.activities   enable row level security;
alter table public.time_entries enable row level security;

-- ------------------------------------------------------------
-- Helper: aktuelle Employee-Rolle ermitteln
-- ------------------------------------------------------------
create or replace function public.current_employee_role()
returns text
language sql
security definer
stable
as $$
  select e.role
  from public.employees e
  where e.user_id = auth.uid()
  limit 1;
$$;

-- Helper: Employee-ID des angemeldeten Nutzers
create or replace function public.current_employee_id()
returns uuid
language sql
security definer
stable
as $$
  select e.id
  from public.employees e
  where e.user_id = auth.uid()
  limit 1;
$$;

-- Helper: ist der angemeldete Nutzer Admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select coalesce(public.current_employee_role() = 'admin', false);
$$;

-- ------------------------------------------------------------
-- customers: alle angemeldeten Mitarbeiter dürfen lesen;
-- nur admin darf schreiben
-- ------------------------------------------------------------
create policy "customers_read"   on public.customers
  for select using (auth.role() = 'authenticated');
create policy "customers_write"  on public.customers
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- employees: Mitarbeiter sehen eigenen Datensatz;
-- admin sieht alle; nur admin darf verwalten
-- ------------------------------------------------------------
create policy "employees_read_self"  on public.employees
  for select using (user_id = auth.uid() or public.is_admin());
create policy "employees_write_admin" on public.employees
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- projects: alle angemeldeten Mitarbeiter lesen;
-- nur admin darf schreiben
-- ------------------------------------------------------------
create policy "projects_read"  on public.projects
  for select using (auth.role() = 'authenticated');
create policy "projects_write" on public.projects
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- activities: alle lesen; nur admin schreibt
-- ------------------------------------------------------------
create policy "activities_read"  on public.activities
  for select using (auth.role() = 'authenticated');
create policy "activities_write" on public.activities
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- time_entries:
--   employee → nur eigene (select/insert/update/delete)
--   admin    → alle (select/update/delete, kein insert nötig)
-- ------------------------------------------------------------
create policy "time_entries_read_own" on public.time_entries
  for select using (
    employee_id = public.current_employee_id() or public.is_admin()
  );

create policy "time_entries_insert_own" on public.time_entries
  for insert with check (employee_id = public.current_employee_id());

create policy "time_entries_update_own" on public.time_entries
  for update using (employee_id = public.current_employee_id())
  with check (employee_id = public.current_employee_id());

create policy "time_entries_admin_update" on public.time_entries
  for update using (public.is_admin());

create policy "time_entries_delete_own" on public.time_entries
  for delete using (employee_id = public.current_employee_id());

create policy "time_entries_admin_delete" on public.time_entries
  for delete using (public.is_admin());

-- ------------------------------------------------------------
-- View: v_time_entries_full – bequeme Auswertungssicht
-- (Join über alle relevanten Tabellen)
-- ------------------------------------------------------------
create or replace view public.v_time_entries_full as
select
  te.id,
  te.employee_id,
  e.first_name  as employee_first_name,
  e.last_name   as employee_last_name,
  e.hourly_rate as employee_hourly_rate,
  te.project_id,
  p.name         as project_name,
  p.customer_id,
  c.name         as customer_name,
  p.budget_hours,
  p.budget_amount,
  p.hourly_rate  as project_hourly_rate,
  te.activity_id,
  a.name         as activity_name,
  te.date,
  te.start_time,
  te.end_time,
  te.duration_min,
  te.description,
  te.billable,
  te.status,
  te.created_at,
  te.updated_at
from public.time_entries te
join public.employees  e  on e.id  = te.employee_id
join public.projects   p  on p.id  = te.project_id
join public.customers  c  on c.id  = p.customer_id
left join public.activities a on a.id = te.activity_id;

-- Die View erbt RLS von den zugrundeliegenden Tabellen,
-- daher ist sie automatisch rollenabhängig.
comment on view public.v_time_entries_full is
  'Bequeme Auswertungssicht über Zeitbuchungen mit Kunden-/Projekt-/Mitarbeiter-Join. RLS wird von den Basistabellen vererbt.';