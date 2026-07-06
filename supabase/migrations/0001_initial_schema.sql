-- ============================================================
-- Migration 0001: Initialschema – Projektzeiterfassung DMD Studio
-- ============================================================
-- Erstellt die Tabellen für Kunden, Projekte, Tätigkeiten,
-- Mitarbeiter, Zeitbuchungen und Angebotssätze.
-- Alle Tabellen nutzen UUID-Primärschlüssel und audit timestamps.
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Tabelle: customers (Kunden)
-- ------------------------------------------------------------
create table if not exists public.customers (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  street      text,
  zip_code    text,
  city        text,
  email       text,
  phone       text,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Tabelle: employees (Mitarbeiter) – verknüpft mit auth.users
-- ------------------------------------------------------------
create table if not exists public.employees (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid unique references auth.users(id) on delete cascade,
  first_name    text not null,
  last_name     text not null,
  email         text not null,
  role          text not null default 'employee' check (role in ('employee','admin')),
  hourly_rate   numeric(8,2) not null default 0,
  weekly_hours  numeric(5,1) not null default 40,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Tabelle: projects (Projekte)
-- ------------------------------------------------------------
create table if not exists public.projects (
  id              uuid primary key default uuid_generate_v4(),
  customer_id     uuid not null references public.customers(id) on delete restrict,
  name            text not null,
  description     text,
  status          text not null default 'active' check (status in ('planned','active','completed','cancelled')),
  budget_hours    numeric(8,2),        -- Angebotssoll in Stunden
  budget_amount   numeric(12,2),       -- Angebotssumme in Euro
  hourly_rate     numeric(8,2) not null default 0,  -- Verrechnungssatz für dieses Projekt
  start_date      date,
  end_date        date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Tabelle: activities (Tätigkeiten / Tätigkeitskatalog)
-- ------------------------------------------------------------
create table if not exists public.activities (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Tabelle: time_entries (Zeitbuchungen)
-- ------------------------------------------------------------
create table if not exists public.time_entries (
  id            uuid primary key default uuid_generate_v4(),
  employee_id   uuid not null references public.employees(id) on delete restrict,
  project_id    uuid not null references public.projects(id) on delete restrict,
  activity_id   uuid references public.activities(id) on delete set null,
  date          date not null default current_date,
  start_time    time,
  end_time      time,
  duration_min  integer not null check (duration_min > 0),
  description   text,
  billable      boolean not null default true,
  status        text not null default 'draft' check (status in ('draft','submitted','approved','rejected')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Indizes
-- ------------------------------------------------------------
create index idx_time_entries_employee on public.time_entries(employee_id);
create index idx_time_entries_project  on public.time_entries(project_id);
create index idx_time_entries_date     on public.time_entries(date);
create index idx_projects_customer     on public.projects(customer_id);
create index idx_employees_user        on public.employees(user_id);

-- ------------------------------------------------------------
-- updated_at Trigger
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['customers','employees','projects','activities','time_entries']
  loop
    execute format('drop trigger if exists trg_set_updated_at on public.%I', t);
    execute format('create trigger trg_set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;