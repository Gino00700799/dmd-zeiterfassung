# Prozessmodell – Erfassungs- und Auswertungsablauf

## 1. Übersicht

Das Prozessmodell beschreibt zwei Hauptprozesse:
1. **Zeiterfassungsprozess** (Mitarbeiter bucht Arbeitszeit)
2. **Auswertungsprozess** (Geschäftsführung wertet Kennzahlen aus)

---

## 2. EPK – Erfassungsprozess (Zeit buchen)

```
┌─────────────────────────────────────────────────────────┐
│                    START                                │
│  Mitarbeiter beginnt neue Arbeitsleistung               │
└──────────────────────┬──────────────────────────────────┘
                       ↓
              ┌────────────────┐
              │  Funktion:     │
              │  Projekt       │
              │  auswählen     │
              └───────┬────────┘
                      ↓
              ┌────────────────┐         ┌──────────────┐
              │  Funktion:     │  ja    │  Funktion:   │
              │  Tätigkeit     │←───────│  Tätigkeit   │
              │  auswählen     │        │  vorhanden?  │
              └───────┬────────┘         └──────────────┘
                      ↓                   │ nein
              ┌────────────────┐         │
              │  Funktion:     │←────────┘
              │  Datum & Dauer │
              │  eingeben      │
              └───────┬────────┘
                      ↓
              ┌────────────────┐
              │  Funktion:     │
              │  Beschreibung  │
              │  + verrechenbar│
              └───────┬────────┘
                      ↓
              ┌────────────────┐
              │  Funktion:     │
              │  Buchung       │
              │  speichern     │
              │  (Status:      │
              │   Entwurf)     │
              └───────┬────────┘
                      ↓
              ┌────────────────┐         ┌──────────────┐
              │  Ereignis:     │  ja    │  Funktion:   │
              │  Weiter        │←───────│  Weitere     │
              │  buchen?       │        │  Buchung     │
              └───────┬────────┘         └──────────────┘
                      │ nein
                      ↓
              ┌────────────────┐
              │  Funktion:     │
              │  Status auf    │
              │  "Eingereicht" │
              └───────┬────────┘
                      ↓
                   ENDE
```

---

## 3. EPK – Genehmigungsprozess (Admin)

```
START
  ↓
Ereignis: Neue eingereichte Buchung vorhanden
  ↓
Funktion: Buchung prüfen (Admin)
  ↓
          ┌──────────────┐
          │  XOR:        │
          │  Korrekt?    │
          └──┬───────┬───┘
             │ ja   │ nein
             ↓      ↓
  Status:   Status:
  Genehmigt Abgelehnt
             ↓      ↓
  Ereignis:  Ereignis:
  Buchung    Mitarbeiter
  genehmigt  korrigiert
             ↓
          ENDE
```

---

## 4. BPMN – Auswertungsprozess (Geschäftsführung)

```
┌──────────────────────────────────────────────────────────────┐
│  Pool: Geschäftsführung                                       │
│                                                               │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌────────┐  │
│  │ Start    │───→│ Dashboard│───→│ Kennzahlen│───→│ Entscheidung│
│  │ Ereignis │    │ aufrufen │    │ prüfen   │    │ treffen│  │
│  └──────────┘    └──────────┘    └──────────┘    └───┬────┘  │
│                                                      │       │
│                          ┌──────────────────────────┘       │
│                          ↓                                   │
│                    ┌───────────┐                              │
│                    │ XOR-Gate  │                              │
│                    │ Projekt   │                              │
│                    │ über      │                              │
│                    │ Budget?   │                              │
│                    └──┬────┬───┘                              │
│                       │ja  │nein                              │
│                       ↓    ↓                                 │
│              ┌──────────┐ ┌──────────┐                        │
│              │ Maßnahme  │ │ Weiter   │                        │
│              │ einleiten│ │ betreuen │                        │
│              └────┬─────┘ └────┬─────┘                        │
│                   └─────┬──────┘                              │
│                         ↓                                     │
│                   ┌──────────┐                                │
│                   │  ENDE    │                                │
│                   └──────────┘                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. Prozessschritte im Detail

### 5.1 Zeiterfassung (Mitarbeiter)

| Schritt | Akteur | System-Aktion |
|---------|--------|---------------|
| 1 | Mitarbeiter | Login (E-Mail/Passwort) |
| 2 | System | Mitarbeiter-Profil laden, Rolle ermitteln |
| 3 | Mitarbeiter | Navigation → Zeiterfassung |
| 4 | System | Aktive Projekte + Tätigkeiten laden (RLS-gefiltert) |
| 5 | Mitarbeiter | „Neue Buchung" → Formular ausfüllen |
| 6 | System | Validierung (Pflichtfelder, Dauer > 0) |
| 7 | System | Insert in `time_entries` (RLS prüft `employee_id = current`) |
| 8 | Mitarbeiter | Weitere Buchungen oder Statuswechsel |

### 5.2 Auswertung (Geschäftsführung / Admin)

| Schritt | Akteur | System-Aktion |
|---------|--------|---------------|
| 1 | Admin | Login → Dashboard |
| 2 | System | Views `v_project_summary`, `v_employee_utilization` abfragen |
| 3 | System | KPI-Karten rendern (Stunden, Umsatz, Marge, Auslastung) |
| 4 | System | Diagramme rendern (Soll-/Ist, Marge, Auslastung) |
| 5 | System | Überbudget-Projekte markieren |
| 6 | Admin | Drilldown in Projekt-/Mitarbeiter-Verwaltung |

---

## 6. Datenfluss

```
auth.users ──→ employees (user_id)
                    │
                    ↓
              time_entries ←── activities
                    │
                    ↓
              projects ←── customers
                    │
                    ↓
         v_time_entries_full (View)
         v_project_summary (View)
         v_employee_utilization (View)
                    │
                    ↓
              Dashboard (Next.js)
```