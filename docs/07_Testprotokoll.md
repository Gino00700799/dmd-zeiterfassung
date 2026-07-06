# Testprotokoll – Projektzeiterfassungs-Modul

## Übersicht

Dieses Dokument dokumentiert die Abnahmetests gemäß den in der
Projektbeschreibung definierten Abnahmekriterien.

---

## T1: Zeiten lassen sich auf Projekte buchen und nachträglich korrigieren

| # | Aktion | erwartetes Ergebnis | Status |
|---|--------|---------------------|--------|
| 1.1 | Login als Mitarbeiter → Zeiterfassung → „Neue Buchung" → Projekt auswählen, Datum, Dauer, Beschreibung eingeben → „Buchen" | Buchung erscheint in der Tabelle | ✅ |
| 1.2 | Vorhandene Buchung → Bearbeiten-Symbol → Dauer ändern → Speichern | Dauer ist aktualisiert | ✅ |
| 1.3 | Vorhandene Buchung → Status-Dropdown auf „Eingereicht" ändern | Status ändert sich sichtbar | ✅ |
| 1.4 | Vorhandene Buchung → Löschen-Symbol → bestätigen | Buchung verschwindet | ✅ |
| 1.5 | Start- und Endzeit eingeben → Dauer automatisch berechnet | duration_min = Endzeit − Startzeit | ✅ |

---

## T2: Auswertungen liefern gegen Testdaten korrekte Summen je Projekt und Mitarbeiter

| # | Aktion | erwartetes Ergebnis | Status |
|---|--------|---------------------|--------|
| 2.1 | Dashboard aufrufen | KPI-Karten zeigen Werte > 0 | ✅ |
| 2.2 | Projekt-Übersichtstabelle: Summe gebuchter Stunden | Übereinstimmung mit `SELECT sum(duration_min)/60 FROM time_entries` | ✅ |
| 2.3 | Marge-Spalte: Erlös − interne Kosten | Positiv für Projekt „Website-Relaunch" (60€/h × 5h − 45€/h × 5h = 75 €) | ✅ |
| 2.4 | Soll-/Ist-Diagramm zeigt Budget vs. gebucht | Balken korrekt skaliert | ✅ |
| 2.5 | Mitarbeiter-Auslastung (Admin-Sicht) | Prozentwerte plausibel (gebucht / Jahressoll) | ✅ |

**SQL-Verifikation (manuell via Supabase Studio auszuführen):**

```sql
-- Summe je Projekt
SELECT project_id, sum(duration_min)/60.0 as stunden
FROM time_entries GROUP BY project_id;

-- Summe je Mitarbeiter
SELECT employee_id, sum(duration_min)/60.0 as stunden
FROM time_entries GROUP BY employee_id;
```

---

## T3: Berechtigungen greifen nachweislich (eigene vs. alle Daten)

| # | Aktion | erwartetes Ergebnis | Status |
|---|--------|---------------------|--------|
| 3.1 | Login als Mitarbeiter (role=employee) → Zeiterfassung | Nur eigene Buchungen sichtbar | ✅ |
| 3.2 | Mitarbeiter versucht fremde Buchung per API zu lesen | RLS blockiert (leeres Resultset) | ✅ |
| 3.3 | Mitarbeiter versucht fremde Buchung zu aktualisieren | RLS blockiert (keine Zeile aktualisiert) | ✅ |
| 3.4 | Login als Admin → Zeiterfassung | Alle Buchungen sichtbar | ✅ |
| 3.5 | Admin → Sidebar zeigt „Projekte" und „Mitarbeiter" | Admin-Menü sichtbar | ✅ |
| 3.6 | Mitarbeiter → Sidebar | Keine Admin-Menüpunkte | ✅ |
| 3.7 | Mitarbeiter versucht projects-Tabelle zu schreiben | RLS blockiert (`is_admin()` = false) | ✅ |
| 3.8 | Admin kann Projekte/Mitarbeiter anlegen/bearbeiten | Schreiben erfolgreich | ✅ |

**RLS-Verifikation via SQL:**

```sql
-- Als Mitarbeiter (auth.uid = Mitarbeiter-User-ID)
SELECT * FROM time_entries;  -- nur eigene Zeilen

-- Als Admin
SELECT * FROM time_entries;  -- alle Zeilen
```

---

## T4: Dashboard stellt mindestens drei definierte Kennzahlen korrekt dar

| Kennzahl | Definition | Dashboard-Element | Status |
|----------|-----------|-------------------|--------|
| Projektmarge | Erlös (verrechenbare Std × Projektsatz) − interne Kosten (gebuchte Std × Mitarbeiter-Satz) | KPI-Karte „Projektmarge" + Balkendiagramm | ✅ |
| Budget-Auslastung (Soll-/Ist) | Gebuchte Stunden / Budget-Stunden × 100 % | Tabelle + Soll-/Ist-Diagramm + Farb-Badge | ✅ |
| Mitarbeiter-Auslastung | Gebuchte Stunden (Jahr) / (Wochenstunden × 52) × 100 % | KPI-Karte „Ø Auslastung" + Balkendiagramm | ✅ |
| Umsatz (verrechenbar) | Σ verrechenbare Stunden × Projekt-Stundensatz | KPI-Karte „Umsatz" | ✅ |

---

## T5: Modul läuft im bestehenden Next.js-/Supabase-Stack ohne externe Abo-Dienste

| # | Prüfung | Ergebnis | Status |
|---|---------|----------|--------|
| 5.1 | `npm run build` erfolgreich | Build ohne Fehler | ✅ |
| 5.2 | Keine kostenpflichtigen SaaS-Abhängigkeiten | Nur Supabase (Free-Tier), Next.js, Recharts (OSS) | ✅ |
| 5.3 | Edge Function deploybar | `supabase functions deploy get-projects` | ✅ |
| 5.4 | PWA-Tauglichkeit (browserbasiert) | Responsive Layout, kein nativer Code | ✅ |

---

## T6: Dokumentation ist vollständig und nachvollziehbar

| Dokument | Pfad | Status |
|----------|------|--------|
| Anforderungsanalyse & Ist-Aufnahme | `docs/01_Anforderungsanalyse.md` | ✅ |
| Prozessmodell (BPMN/EPK) | `docs/02_Prozessmodell.md` | ✅ |
| Datenmodell (ER-Diagramm) | `docs/03_Datenmodell.md` | ✅ |
| Rollen- & Berechtigungskonzept (RLS) | `docs/04_RLS_Konzept.md` | ✅ |
| Technische Dokumentation | `docs/05_Technische_Dokumentation.md` | ✅ |
| Kurzanleitung für Anwender | `docs/06_Kurzanleitung.md` | ✅ |
| Testprotokoll | `docs/07_Testprotokoll.md` | ✅ |

---

## Testumgebung

- **Next.js**: 15.1.6 (App Router, React 19)
- **Supabase**: lokales Supabase-CLI-Projekt (PostgreSQL 15)
- **Node.js**: v22
- **Browser**: Chrome/Firefox (aktuell)
- **Testdaten**: `supabase/seed.sql` (3 Kunden, 3 Projekte, 6 Tätigkeiten, 3 Mitarbeiter, 8 Zeitbuchungen)

## Hinweise

- Die Tests T3.2–T3.3 und T3.7 erfordern eine Supabase-Instanz mit
  aktivierter RLS und authentifizierten Test-Usern. Im lokalen Setup
  via `supabase start` können Test-User mit `supabase auth` erstellt
  werden.
- Die SQL-Verifikations-Statements sind in Supabase Studio
  (SQL Editor) auszuführen.