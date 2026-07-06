-- ============================================================
-- Migration 0003: Auswertungs-Views (Kennzahlen)
-- ============================================================
-- Definiert die betriebswirtschaftlichen Kennzahlen als
-- PostgreSQL-Views, die vom Dashboard direkt abgefragt werden.
-- ============================================================

-- ------------------------------------------------------------
-- View: v_project_summary – Kennzahlen je Projekt
-- ------------------------------------------------------------
create or replace view public.v_project_summary as
with booked as (
  select
    project_id,
    sum(duration_min)                              as booked_minutes,
    sum(duration_min) filter (where billable)      as billable_minutes,
    sum(duration_min) filter (where status = 'approved') as approved_minutes,
    count(*)                                       as entry_count
  from public.time_entries
  group by project_id
)
select
  p.id             as project_id,
  p.name           as project_name,
  p.customer_id,
  c.name           as customer_name,
  p.status,
  p.budget_hours,
  p.budget_amount,
  p.hourly_rate    as project_hourly_rate,
  coalesce(b.booked_minutes, 0) / 60.0                        as booked_hours,
  coalesce(b.billable_minutes, 0) / 60.0                     as billable_hours,
  coalesce(b.approved_minutes, 0) / 60.0                     as approved_hours,
  coalesce(b.entry_count, 0)                                 as entry_count,
  -- Soll-/Ist-Vergleich
  case
    when p.budget_hours is null then null
    else round(coalesce(b.booked_minutes, 0) / 60.0 / p.budget_hours * 100, 1)
  end as budget_utilization_pct,
  -- Kosten (interne Mitarbeiter-Stundensätze)
  round(
    (select sum(te.duration_min / 60.0 * e.hourly_rate)
     from public.time_entries te
     join public.employees e on e.id = te.employee_id
     where te.project_id = p.id) ::numeric, 2
  ) as internal_cost,
  -- Erlös (verrechenbare Stunden × Projekt-Stundensatz)
  round(
    coalesce(b.billable_minutes, 0) / 60.0 * p.hourly_rate, 2
  ) as revenue,
  -- Marge = Erlös - Kosten
  round(
    coalesce(b.billable_minutes, 0) / 60.0 * p.hourly_rate
    - coalesce((
        select sum(te.duration_min / 60.0 * e.hourly_rate)
        from public.time_entries te
        join public.employees e on e.id = te.employee_id
        where te.project_id = p.id
      ), 0), 2
  ) as margin
from public.projects p
join public.customers c on c.id = p.customer_id
left join booked b on b.project_id = p.id;

-- ------------------------------------------------------------
-- View: v_employee_utilization – Auslastung je Mitarbeiter
-- ------------------------------------------------------------
create or replace view public.v_employee_utilization as
select
  e.id             as employee_id,
  e.first_name,
  e.last_name,
  e.weekly_hours,
  e.hourly_rate,
  -- Gebuchte Stunden (laufendes Jahr)
  round(
    coalesce((
      select sum(duration_min) / 60.0
      from public.time_entries te
      where te.employee_id = e.id
        and extract(year from te.date) = extract(year from current_date)
    ), 0), 1
  ) as booked_hours_year,
  -- Auslastung in % bezogen auf Jahressoll (weekly_hours × 52)
  round(
    coalesce((
      select sum(duration_min) / 60.0
      from public.time_entries te
      where te.employee_id = e.id
        and extract(year from te.date) = extract(year from current_date)
    ), 0) / (e.weekly_hours * 52) * 100, 1
  ) as utilization_pct
from public.employees e
where e.active = true;

-- ------------------------------------------------------------
-- View: v_daily_hours – gebuchte Stunden pro Tag (für Diagramm)
-- ------------------------------------------------------------
create or replace view public.v_daily_hours as
select
  date,
  employee_id,
  sum(duration_min) / 60.0 as hours
from public.time_entries
group by date, employee_id
order by date;