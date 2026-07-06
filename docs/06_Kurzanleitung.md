# Kurzanleitung für Anwender

## 1. Anmeldung

1. Browser öffnen, URL des Zeiterfassungs-Moduls aufrufen
2. E-Mail-Adresse und Passwort eingeben
3. **Anmelden** klicken

> Als Mitarbeiter sehen Sie nur Ihre eigenen Daten.
> Als Administrator (Geschäftsführung) sehen Sie alle Daten und haben
> Zugriff auf die Stammdatenverwaltung.

---

## 2. Zeiterfassung – Zeiten buchen

### 2.1 Neue Buchung anlegen

1. In der Seitenleiste **Zeiterfassung** anklicken
2. Oben rechts **Neue Buchung** klicken
3. Im Formular ausfüllen:
   - **Projekt** (Pflichtfeld): aus Dropdown auswählen
   - **Tätigkeit**: aus Dropdown auswählen (optional)
   - **Datum** (Pflichtfeld): Datum der Arbeitsleistung
   - **Dauer (Minuten)** (Pflichtfeld): z. B. 90 für 1h 30min
   - **Start-/Endzeit**: optional – die Dauer wird automatisch berechnet
   - **Beschreibung**: Kurztext zur Tätigkeit
   - **Verrechenbar**: Häkchen setzen, wenn Zeit auf Kunden abrechenbar
4. **Buchen** klicken

### 2.2 Buchung bearbeiten

1. In der Tabelle das **Stift-Symbol** (Bearbeiten) in der Zeile der
   jeweiligen Buchung klicken
2. Werte im Formular anpassen
3. **Speichern** klicken

### 2.3 Buchung löschen

1. **Papierkorb-Symbol** in der jeweiligen Zeile klicken
2. Löschung bestätigen

### 2.4 Status ändern

- Über das **Status-Dropdown** in der Tabellenzeile:
  - **Entwurf**: Standard bei Neuanlage
  - **Eingereicht**: Zur Genehmigung an Geschäftsführung übermittelt
  - **Genehmigt**: Von Admin bestätigt
  - **Abgelehnt**: Von Admin abgelehnt (Korrektur erforderlich)

### 2.5 Monatsfilter

- Oben links **Monats-Auswahl** verwenden, um Buchungen eines
  bestimmten Monats zu filtern
- Die Zusammenfassung (Gesamt / Verrechenbar) passt sich automatisch an

---

## 3. Dashboard – Auswertungen

### 3.1 Übersicht aufrufen

- In der Seitenleiste **Dashboard** anklicken

### 3.2 Kennzahlen-Karten (oben)

| Karte | Bedeutung |
|-------|-----------|
| Gebuchte Stunden | Σ aller gebuchten Stunden über alle Projekte |
| Umsatz (verrechenbar) | Σ verrechenbare Stunden × Projekt-Stundensatz |
| Projektmarge | Umsatz − interne Kosten (Mitarbeiter-Stundensätze) |
| Ø Auslastung | Durchschnittliche Mitarbeiter-Auslastung im Jahr |

### 3.3 Diagramme

- **Soll-/Ist-Vergleich**: Blaue Balken = gebuchte Stunden, helle Balken = Budget
- **Projektmarge**: Balken je Projekt; grün = positiv, rot = negativ
- **Mitarbeiter-Auslastung** (nur Admin): Prozentuale Auslastung je Mitarbeiter

### 3.4 Projekt-Übersichtstabelle

- Zeigt je Projekt: Gebuchte Stunden, Budget, Auslastung %, Kosten, Erlös, Marge
- Farb-Codes der Auslastung:
  - 🟢 Grün: < 80 % (im Plan)
  - 🟡 Gelb: 80–100 % (kritisch)
  - 🔴 Rot: > 100 % (über Budget)

### 3.5 Überbudget-Warnung

- Gelbe Warnleiste erscheint, wenn Projekte das Budget überschreiten

---

## 4. Admin: Projekte verwalten

> Nur für Administratoren sichtbar.

1. **Projekte** in der Seitenleiste
2. **Neues Projekt**: Kunde auswählen, Name, Status, Budget (Stunden/€),
   Stundensatz, Laufzeit eingeben → **Speichern**
3. **Bearbeiten**: Stift-Symbol → Werte ändern → Speichern
4. **Löschen**: Papierkorb-Symbol → bestätigen

---

## 5. Admin: Mitarbeiter verwalten

> Nur für Administratoren sichtbar.

1. **Mitarbeiter** in der Seitenleiste
2. **Neuer Mitarbeiter**: Name, E-Mail, Rolle (Mitarbeiter/Admin),
   Stundensatz, Wochenstunden → **Speichern**
3. **Bearbeiten**: Stift-Symbol
4. **Deaktivieren**: Papierkorb-Symbol setzt `active = false`

---

## 6. Abmeldung

- Unten in der Seitenleiste **Abmelden** klicken

---

## 7. FAQ

**F: Kann ich Zeiten nachträglich ändern?**
A: Ja, solange der Status nicht „Genehmigt" ist. Genehmigte Buchungen
können nur vom Admin geändert werden.

**F: Was bedeutet „verrechenbar"?**
A: Wenn angehakt, wird die Zeit mit dem Projekt-Stundensatz als Erlös
berechnet. interne Besprechungen etc. sollten nicht verrechenbar sein.

**F: Sehe ich die Zeiten meiner Kollegen?**
A: Nein. Als Mitarbeiter sehen Sie nur Ihre eigenen Buchungen. Nur
Administratoren sehen alle Daten.

**F: Was passiert bei „Abgelehnt"?**
A: Die Buchung bleibt erhalten, Sie können sie korrigieren und erneut
einreichen.