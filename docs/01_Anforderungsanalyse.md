# Anforderungsanalyse und Ist-Aufnahme

## 1. Ist-Aufnahme der bisherigen Zeiterfassung

### 1.1 Aktuelle Situation bei DMD Studio GmbH

Die Erfassung von Arbeitszeiten erfolgt derzeit manuell und dezentral.
Mitarbeiter notieren ihre Zeiten in individueller Form (Tabellen,
Notizzettel, E-Mails). Eine zentrale, strukturierte Erfassung mit
Zuordnung zu Kunden und Projekten existiert nicht.

### 1.2 Schwachstellen des Ist-Zustandes

| # | Schwachstelle | Auswirkung |
|---|---------------|------------|
| 1 | Dezentrale, formlose Erfassung | Daten unvollständig, schwer auswertbar |
| 2 | Keine Zuordnung zu Kunde/Projekt/Tätigkeit | Keine projektbezogene Kalkulation möglich |
| 3 | Keine Rollen/Berechtigungen | Keine Trennung Mitarbeiter-/Geschäftsführungssicht |
| 4 | Keine Auswertungen/Dashboards | Kennzahlen (Marge, Auslastung) nicht verfügbar |
| 5 | Medienbrüche (Notiz → Tabelle → E-Mail) | Fehleranfällig, zeitaufwendig |
| 6 | Keine historische Nachvollziehbarkeit | Änderungen nicht dokumentiert |

### 1.3 Ist-Prozess (vereinfacht)

```
Mitarbeiter notiert Zeiten auf Papier/Excel
        ↓
Am Monatsende: Zusammenstellung per E-Mail an Geschäftsführung
        ↓
Manuelle Übertragung in Excel-Auswertung
        ↓
Kennzahlen werden händisch berechnet
        ↓
Ergebnis ist fehleranfällig und zeitverzögert
```

---

## 2. Soll-Konzept

### 2.1 Funktionale Anforderungen (FA)

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| FA1 | Erfassung von Arbeitszeiten mit Zuordnung zu Kunde, Projekt und Tätigkeit | Muss |
| FA2 | Nachträgliches Bearbeiten und Korrigieren erfasster Zeiten | Muss |
| FA3 | Rollen- und Berechtigungskonzept (Mitarbeiter sehen eigene, Admin alle Daten) | Muss |
| FA4 | Auswertungs-Dashboard mit betriebswirtschaftlichen Kennzahlen | Muss |
| FA5 | Anbindung an vorhandene Kunden-/Projektdaten über gesicherte Schnittstelle | Muss |
| FA6 | Umsetzung im bestehenden Tech-Stack ohne kostenpflichtige Abo-Dienste | Muss |
| FA7 | Status-Workflow für Zeitbuchungen (Entwurf → Eingereicht → Genehmigt/Abgelehnt) | Soll |
| FA8 | Monatsfilter und Zusammenfassung der gebuchten Stunden | Soll |
| FA9 | Überbudget-Warnung bei Projekten | Soll |
| FA10 | Verrechenbar/ nicht verrechenbar-Flag pro Buchung | Soll |

### 2.2 Nicht-funktionale Anforderungen (NFA)

| ID | Anforderung |
|----|-------------|
| NFA1 | DSGVO-Konformität: personenbezogene Arbeitszeiten geschützt durch RLS |
| NFA2 | Responsive Web-Oberfläche (Desktop + Tablet, browserbasiert) |
| NFA3 | Performance: Dashboard-Ladezeit < 2 s bei Testdaten |
| NFA4 | Sicherheit: Row Level Security auf Datenbankebene, JWT-Authentifizierung |
| NFA5 | Wartbarkeit: TypeScript, modulare Komponenten, dokumentierte Migrationen |
| NFA6 | Keine zusätzlichen kostenpflichtigen Dienste (nur Supabase Free-Tier) |

### 2.3 Randbedingungen

- **Tech-Stack**: Next.js (App Router), Supabase (PostgreSQL + Auth + Edge Functions)
- **Keine** native Mobile-App (browserbasierte Nutzung / PWA)
- **Keine** Rechnungserstellung, DATEV- oder Lohnanbindung
- **Keine** Migration historischer Altdaten
- **Kein** Produktivbetrieb/Hosting im Rahmen der Projektarbeit

---

## 3. Stakeholder

| Rolle | Name | Verantwortung |
|-------|------|---------------|
| Projektverantwortlicher | [Techniker] | Konzeption, Implementierung, Doku |
| Auftraggeber | DMD Studio GmbH – Geschäftsführung | Anforderungen, Daten, Abnahme |
| Betreuer | SBSZ Bamberg | Fachliche Betreuung, Bewertung |

---

## 4. Abnahmekriterien

1. Zeiten lassen sich auf Projekte buchen und nachträglich korrigieren
2. Auswertungen liefern gegen Testdaten korrekte Summen je Projekt und Mitarbeiter
3. Berechtigungen greifen nachweislich (eigene vs. alle Daten)
4. Dashboard stellt mindestens drei definierte Kennzahlen korrekt dar
5. Modul läuft im bestehenden Next.js-/Supabase-Stack ohne externe Abo-Dienste
6. Dokumentation ist vollständig und nachvollziehbar