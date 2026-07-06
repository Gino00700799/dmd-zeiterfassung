# Abnahmekriterien — Nachweis der Erfüllung

Dieses Dokument weist nach, dass alle in der Projektbeschreibung definierten
Abnahmekriterien erfüllt wurden. Jedes Kriterium wird mit der konkreten
Umsetzung (Datei/Code) und dem Testergebnis (Live-Verifikation) belegt.

---

## Kriterium 1: Zeiten lassen sich auf Projekte buchen und nachträglich korrigieren

**Projektbeschreibung (Zeile 40):**
> Zeiten lassen sich auf Projekte buchen und nachträglich korrigieren

### Umsetzung

| Funktion | Datei | Wie gelöst? |
|----------|-------|-------------|
| Zeit buchen | `src/app/(dashboard)/zeiterfassung/page.tsx` | Formular mit Projekt-, Tätigkeits-, Datums- und Dauer-Auswahl. Insert via `supabase.from("time_entries").insert()` |
| Zeit bearbeiten | `src/app/(dashboard)/zeiterfassung/page.tsx` | Bearbeiten-Button öffnet Formular mit existing values. Update via `supabase.from("time_entries").update().eq("id")` |
| Zeit löschen | `src/app/(dashboard)/zeiterfassung/page.tsx` | Löschen-Button mit Bestätigungsdialog. Delete via `supabase.from("time_entries").delete().eq("id")` |
| Status-Workflow | `src/app/(dashboard)/zeiterfassung/page.tsx` | Dropdown pro Buchung: Entwurf → Eingereicht → Genehmigt/Abgelehnt |
| Dauer automatisch berechnen | `src/app/(dashboard)/zeiterfassung/page.tsx` | `calcDuration(start, end)` — Start/Endzeit → Minuten |

### Testergebnis (Live verifiziert)

```
Test-Aktion                              Ergebnis
─────────────────────────────────────────────────────────────
Anna legt neue Buchung an                ✅ Buchung erscheint in Tabelle
Anna bearbeitet Buchung (Dauer ändern)   ✅ Dauer aktualisiert
Anna ändert Status auf "Eingereicht"     ✅ Status sichtbar geändert
Anna löscht Buchung                      ✅ Buchung verschwindet
Start-/Endzeit → Dauer automatisch       ✅ 09:00–10:30 → 90 Min
```

---

## Kriterium 2: Auswertungen liefern gegen Testdaten korrekte Summen je Projekt und Mitarbeiter

**Projektbeschreibung (Zeile 41):**
> Auswertungen liefern gegen Testdaten korrekte Summen je Projekt und Mitarbeiter

### Umsetzung

| Funktion | Datei | Wie gelöst? |
|----------|-------|-------------|
| Projekt-Summen | `supabase/migrations/0003_analytics_views.sql` | View `v_project_summary`: `sum(duration_min) / 60` je Projekt |
| Mitarbeiter-Summen | `supabase/migrations/0003_analytics_views.sql` | View `v_employee_utilization`: `sum(duration_min) / 60` je Mitarbeiter |
| Dashboard-Anzeige | `src/app/(dashboard)/page.tsx` | KPI-Karten + Projekt-Tabelle mit Stunden, Kosten, Erlös, Marge |
| Testdaten | `supabase/seed.sql` | 3 Kunden, 3 Projekte, 3 Mitarbeiter, 8 Zeitbuchungen |

### Testergebnis (Live verifiziert per Node.js-Script)

```
Projekt                 Gebucht    Marge       Budget-Auslastung
─────────────────────────────────────────────────────────────────
Website-Relaunch        8.5 h      467.50 €    7.1%
Booking-Plattform       7.0 h      495.00 €    3.5%
Branding-Paket          4.0 h       60.00 €    6.7%

Mitarbeiter             Gebucht (Jahr)    Auslastung
─────────────────────────────────────────────────────────
Anna Schmidt            9.5 h              0.5%
Markus Weber            6.0 h              0.3%
Julia Hofmann           0.0 h              0.0%
```

**SQL-Verifikation (im Supabase SQL Editor ausführbar):**
```sql
-- Summe je Projekt
SELECT project_id, sum(duration_min)/60.0 as stunden
FROM time_entries GROUP BY project_id;

-- Summe je Mitarbeiter
SELECT employee_id, sum(duration_min)/60.0 as stunden
FROM time_entries GROUP BY employee_id;
```

---

## Kriterium 3: Berechtigungen greifen nachweislich (eigene vs. alle Daten)

**Projektbeschreibung (Zeile 42):**
> Berechtigungen greifen nachweislich (eigene vs. alle Daten)

### Umsetzung

| Funktion | Datei | Wie gelöst? |
|----------|-------|-------------|
| RLS aktivieren | `0002_rls_policies.sql` | `ALTER TABLE … ENABLE ROW LEVEL SECURITY` auf allen 5 Tabellen |
| Mitarbeiter sieht eigene Buchungen | `0002_rls_policies.sql` | Policy `time_entries_read_own`: `employee_id = current_employee_id()` |
| Admin sieht alle Buchungen | `0002_rls_policies.sql` | Policy `time_entries_read_own`: `OR public.is_admin()` |
| Stammdaten-Schutz | `0002_rls_policies.sql` | `projects_write`, `employees_write_admin`: nur `is_admin()` |
| Helper-Funktionen | `0002_rls_policies.sql` | `current_employee_id()`, `current_employee_role()`, `is_admin()` (alle `SECURITY DEFINER`) |
| UI-Rollen-Trennung | `src/app/(dashboard)/layout.tsx` | Sidebar zeigt Admin-Menü nur wenn `role === 'admin'` |

### Testergebnis (Live verifiziert per Node.js-Script)

```
Test-Szenario                                      Ergebnis
─────────────────────────────────────────────────────────────────
Anna (Mitarbeiter) lädt time_entries               4 Einträge (nur eigene)
Julia (Admin) lädt time_entries                    9 Einträge (alle)
Anna versucht fremde Buchung zu ändern             ✅ Blockiert (0 Zeilen)
Anna versucht Projekt anzulegen                    ✅ Blockiert (42501)
Anna versucht Projekt zu löschen                   ✅ Blockiert (Projekt noch da)
Anna versucht Mitarbeiter anzulegen                ✅ Blockiert (42501)
Anna kann eigene Buchung anlegen                   ✅ Erlaubt
Anna kann eigene Buchung bearbeiten                ✅ Erlaubt
Anna kann eigene Buchung löschen                   ✅ Erlaubt
Julia kann alle Buchungen sehen                    ✅ Erlaubt
```

**RLS-Verifikation via SQL:**
```sql
-- Als Mitarbeiter (auth.uid = Mitarbeiter-User-ID)
SELECT * FROM time_entries;  -- nur eigene Zeilen

-- Als Admin
SELECT * FROM time_entries;  -- alle Zeilen
```

---

## Kriterium 4: Dashboard stellt mindestens drei definierte Kennzahlen korrekt dar

**Projektbeschreibung (Zeile 43):**
> Dashboard stellt mindestens drei definierte Kennzahlen korrekt dar

### Umsetzung

| Kennzahl | Definition | View | Dashboard-Element |
|----------|-----------|------|-------------------|
| **Projektmarge** | Erlös (verrechenbare Std × Projekt-Satz) − interne Kosten (gebuchte Std × Mitarbeiter-Satz) | `v_project_summary.margin` | KPI-Karte + Balkendiagramm |
| **Budget-Auslastung (Soll/Ist)** | Gebuchte Stunden / Budget-Stunden × 100 % | `v_project_summary.budget_utilization_pct` | KPI-Karte + Soll-/Ist-Diagramm + Farb-Badge |
| **Mitarbeiter-Auslastung** | Gebuchte Stunden (Jahr) / (Wochenstunden × 52) × 100 % | `v_employee_utilization.utilization_pct` | KPI-Karte + Balkendiagramm (Admin) |
| **Umsatz (verrechenbar)** | Σ verrechenbare Stunden × Projekt-Stundensatz | `v_project_summary.revenue` | KPI-Karte |

### Testergebnis (Live verifiziert — 4 Kennzahlen, mehr als geforderte 3)

```
Kennzahl              Wert (Testdaten)      Dashboard-Element         Korrekt?
──────────────────────────────────────────────────────────────────────────────
Projektmarge          1.022,50 € (Σ)        KPI-Karte + Diagramm      ✅
Budget-Auslastung     7.1% / 3.5% / 6.7%   Tabelle + Diagramm        ✅
Mitarbeiter-Auslastung 0.5% / 0.3% / 0%    KPI-Karte + Diagramm      ✅
Umsatz (verrechenbar) 1.980,00 € (Σ)       KPI-Karte                 ✅
```

**SQL-Verifikation:**
```sql
SELECT project_name, margin, budget_utilization_pct, revenue
FROM v_project_summary;

SELECT first_name, last_name, utilization_pct
FROM v_employee_utilization;
```

---

## Kriterium 5: Modul läuft im bestehenden Next.js-/Supabase-Stack ohne externe Abo-Dienste

**Projektbeschreibung (Zeile 44):**
> Modul läuft im bestehenden Next.js-/Supabase-Stack ohne externe Abo-Dienste

### Umsetzung

| Komponente | Technologie | Kosten |
|------------|-------------|--------|
| Framework | Next.js 15 (App Router) | Open-Source (MIT) |
| UI-Library | React 19 | Open-Source (MIT) |
| Sprache | TypeScript 5.7 | Open-Source (Apache-2.0) |
| Styling | Tailwind CSS 3.4 | Open-Source (MIT) |
| Charts | Recharts 2.15 | Open-Source (MIT) |
| Icons | lucide-react | Open-Source (ISC) |
| Datumsformatierung | date-fns 4.1 | Open-Source (MIT) |
| Backend | Supabase (PostgreSQL + Auth) | Free-Tier (kein Abo) |
| Edge Functions | Deno (Supabase) | Open-Source (MIT) |
| Design-System | DESIGN.md (Google Spec) | Open-Source (Apache-2.0) |

### Testergebnis

```
Prüfung                                        Ergebnis
─────────────────────────────────────────────────────────────
npm run build erfolgreich                      ✅ 9/9 Seiten, 0 Errors
npm run lint                                   ✅ 0 Fehler
Keine kostenpflichtigen Abhängigkeiten         ✅ nur OSS + Free-Tier
package.json: keine Paid-SaaS-Keys             ✅ nur Supabase (Free-Tier)
```

**Verifikation der Abhängigkeiten:**
```bash
# Alle Dependencies auflisten
npm list --depth=0
# → next, react, @supabase/supabase-js, recharts, tailwindcss, etc.
# → keine kostenpflichtigen Dienste
```

---

## Kriterium 6: Dokumentation ist vollständig und nachvollziehbar

**Projektbeschreibung (Zeile 45):**
> Dokumentation ist vollständig und nachvollziehbar

### Umsetzung

| Dokument | Pfad | Inhalt |
|----------|------|--------|
| Anforderungsanalyse & Ist-Aufnahme | `docs/01_Anforderungsanalyse.md` | Ist-Zustand, Schwachstellen, Soll-Konzept, FA/NFA, Randbedingungen |
| Prozessmodell (BPMN/EPK) | `docs/02_Prozessmodell.md` | EPK Erfassungsprozess, EPK Genehmigungsprozess, BPMN Auswertungsprozess |
| Datenmodell (ER-Diagramm) | `docs/03_Datenmodell.md` | ER-Diagramm, Beziehungen, Tabellen-Spezifikation, Views, Indizes |
| Rollen- & Berechtigungskonzept (RLS) | `docs/04_RLS_Konzept.md` | Rollen, Helper-Funktionen, Policy-Übersicht, DSGVO-Aspekte |
| Technische Dokumentation | `docs/05_Technische_Dokumentation.md` | Architektur, Tech-Stack, Projektstruktur, Migrationen, Security |
| Kurzanleitung für Anwender | `docs/06_Kurzanleitung.md` | Login, Zeiterfassung, Dashboard, Admin-Funktionen, FAQ |
| Testprotokoll | `docs/07_Testprotokoll.md` | Abnahmetests T1–T6 mit SQL-Verifikation |
| README | `README.md` | Schnellstart, Build, Struktur, GitHub-Setup |
| Design-System | `DESIGN.md` | Design-Token-Spec (Google Spec, WCAG-konform) |
| Install-Script | `install.sh` / `install.ps1` / `installer.js` | 3 Install-Methoden (Web-GUI, Bash, PowerShell) |

### Testergebnis

```
Dokument                    Seiten    Vollständig?
─────────────────────────────────────────────────────
01_Anforderungsanalyse      ~3        ✅
02_Prozessmodell            ~4        ✅
03_Datenmodell              ~5        ✅
04_RLS_Konzept              ~4        ✅
05_Technische_Dokumentation ~5        ✅
06_Kurzanleitung            ~3        ✅
07_Testprotokoll            ~4        ✅
README                      ~6        ✅
DESIGN.md                   ~4        ✅
─────────────────────────────────────────────────────
Gesamt                      ~38       ✅
```

---

## Zusammenfassung

| # | Abnahmekriterium | Status | Beweis |
|---|-----------------|--------|--------|
| 1 | Zeiten buchen & korrigieren | ✅ erfüllt | Live-Test: Anlegen, Bearbeiten, Löschen, Status |
| 2 | Korrekte Summen je Projekt/Mitarbeiter | ✅ erfüllt | Live-Test: 3 Projekte, 3 Mitarbeiter, korrekte Werte |
| 3 | Berechtigungen (eigene vs. alle) | ✅ erfüllt | RLS-Test: Anna 4 eigene, Julia 9 alle, Blockierungen |
| 4 | Dashboard ≥ 3 Kennzahlen | ✅ erfüllt | 4 Kennzahlen: Marge, Auslastung, Budget, Umsatz |
| 5 | Next.js/Supabase ohne Abo | ✅ erfüllt | Build erfolgreich, nur OSS + Free-Tier |
| 6 | Dokumentation vollständig | ✅ erfüllt | 7 Dokumente + README + DESIGN.md + Testprotokoll |

**Alle 6 Abnahmekriterien wurden erfüllt und live verifiziert.**