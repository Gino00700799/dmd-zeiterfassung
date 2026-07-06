-- ============================================================
-- Seed-Daten – anonymisierte Testdaten für DMD Studio GmbH
-- ============================================================
-- Ausführung: supabase db seed  (oder manuell via psql)
-- ============================================================

-- Kunden
insert into public.customers (id, name, street, zip_code, city, email) values
  ('a0000000-0000-0000-0000-000000000001', 'Müller Bau GmbH',     'Industriestr. 12', '96047', 'Bamberg',   'info@mueller-bau.de'),
  ('a0000000-0000-0000-0000-000000000002', 'Naturpark Franken eV', 'Am Waldweg 3',     '95444', 'Bayreuth',  'kontakt@naturpark-franken.de'),
  ('a0000000-0000-0000-0000-000000000003', 'Technik & Design AG',  'Ludwigstr. 45',    '90402', 'Nürnberg',  'hallo@technik-design.de')
on conflict do nothing;

-- Projekte
insert into public.projects (id, customer_id, name, description, status, budget_hours, budget_amount, hourly_rate, start_date, end_date) values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Website-Relaunch',      'Neugestaltung der Firmenwebsite',    'active',    120, 12000, 100, '2026-01-15', '2026-03-31'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Booking-Plattform',     'Online-Buchungssystem für Workshops','active',    200, 24000, 120, '2026-02-01', '2026-05-31'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'Branding-Paket',        'Logo, CI und Briefpapier',           'completed',  60,  6000, 100, '2025-10-01', '2025-12-15')
on conflict do nothing;

-- Tätigkeiten
insert into public.activities (id, name) values
  ('c0000000-0000-0000-0000-000000000001', 'Konzeption'),
  ('c0000000-0000-0000-0000-000000000002', 'Design'),
  ('c0000000-0000-0000-0000-000000000003', 'Entwicklung'),
  ('c0000000-0000-0000-0000-000000000004', 'Projektmanagement'),
  ('c0000000-0000-0000-0000-000000000005', 'Kundengespräch'),
  ('c0000000-0000-0000-0000-000000000006', 'Testing')
on conflict do nothing;

-- Mitarbeiter (user_id bleibt null für Testdaten ohne auth-Kontext)
insert into public.employees (id, first_name, last_name, email, role, hourly_rate, weekly_hours) values
  ('d0000000-0000-0000-0000-000000000001', 'Anna',  'Schmidt',   'anna.schmidt@dmd-studio.de',   'employee', 45.00, 40),
  ('d0000000-0000-0000-0000-000000000002', 'Markus', 'Weber',    'markus.weber@dmd-studio.de',   'employee', 50.00, 40),
  ('d0000000-0000-0000-0000-000000000003', 'Julia', 'Hofmann',   'julia.hofmann@dmd-studio.de',  'admin',    60.00, 40)
on conflict do nothing;

-- Zeitbuchungen (Testdaten)
insert into public.time_entries (employee_id, project_id, activity_id, date, start_time, end_time, duration_min, description, billable, status) values
  ('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', '2026-06-02', '09:00', '10:00',  60, 'Kickoff mit Kunde',           true,  'approved'),
  ('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', '2026-06-02', '10:00', '12:30', 150, 'Wireframes Startseite',       true,  'approved'),
  ('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', '2026-06-03', '08:30', '12:00', 210, 'Header-Komponente gebaut',    true,  'submitted'),
  ('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', '2026-06-03', '09:00', '11:00', 120, 'Datenmodell entworfen',       true,  'submitted'),
  ('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', '2026-06-04', '13:00', '17:00', 240, 'Supabase Migrationen',        true,  'draft'),
  ('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', '2026-06-05', '10:00', '11:30',  90, 'Cross-Browser Tests',         true,  'draft'),
  ('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', '2025-11-10', '09:00', '12:00', 180, 'Logo-Design Varianten',       true,  'approved'),
  ('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000004', '2025-11-12', '14:00', '15:00',  60, 'Abstimmung Geschäftsführung', false, 'approved')
on conflict do nothing;