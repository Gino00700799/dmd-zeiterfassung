---
version: alpha
name: DMD Studio
description: DMD Studio Brand Design — Grün als Akzentfarbe, inspiriert von der Corporate Website dmd-studio.de. Klares, professionelles Layout für Projekt-Controlling.
colors:
  primary: "#51c878"
  secondary: "#475467"
  tertiary: "#3da85e"
  accent: "#7c3aed"
  success: "#17b26a"
  warning: "#f79009"
  danger: "#ef4444"
  neutral: "#f9fafb"
  surface: "#FFFFFF"
  on-primary: "#FFFFFF"
  on-tertiary: "#FFFFFF"
  text-primary: "#101828"
  text-secondary: "#475467"
  text-muted: "#667085"
  border: "#eaecf0"
  sidebar-bg: "#0b0c0f"
  sidebar-text: "#8a8f9a"
  sidebar-active: "#15171c"
  sidebar-active-text: "#ecedee"
typography:
  h1:
    fontFamily: Inter
    fontSize: 2rem
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  h2:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  h3:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: 600
    lineHeight: 1.4
  body-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  label-caps:
    fontFamily: Inter
    fontSize: 0.6875rem
    fontWeight: 600
    letterSpacing: "0.08em"
  stat-xl:
    fontFamily: Inter
    fontSize: 2.25rem
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.03em"
rounded:
  sm: 6px
  md: 10px
  lg: 16px
  xl: 20px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
elevation:
  sm: "0 1px 2px 0 rgba(16,24,40,0.04)"
  md: "0 2px 8px -2px rgba(16,24,40,0.08), 0 1px 3px -1px rgba(16,24,40,0.04)"
  lg: "0 8px 24px -4px rgba(16,24,40,0.10), 0 2px 8px -2px rgba(16,24,40,0.06)"
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    rounded: "{rounded.sm}"
    padding: 10px
  button-primary-hover:
    backgroundColor: "#15803d"
    textColor: "{colors.on-tertiary}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: 24px
  badge-success:
    backgroundColor: "#D1FAE5"
    textColor: "#065F46"
    rounded: "{rounded.full}"
    padding: 4px
  badge-warning:
    backgroundColor: "#FEF3C7"
    textColor: "#92400E"
    rounded: "{rounded.full}"
    padding: 4px
  badge-danger:
    backgroundColor: "#FEE2E2"
    textColor: "#991B1B"
    rounded: "{rounded.full}"
    padding: 4px
---

## Overview

DMD Studio ist eine Digitalagentur — „DMD" steht für Design, Marketing,
Development. Die Brand-Farbe ist Grün (#3da85e / #51c878), passend zur
Corporate-Website dmd-studio.de. Die Zeiterfassungs-App übernimmt diese
Farbsprache: grüne Akzente für Interaktion, dunkle Sidebar, helle
Inhaltsflächen. Daten stehen im Vordergrund, nicht Dekoration.

## Colors

- **Primary (#51c878):** „DMD Grün" — helleres Grün für Icons, Stat-Karten-Akzente.
- **Tertiary (#3da85e):** „DMD Grün dunkel" — Interaktions-Akzent (Buttons, Links, aktive States).
  Direkt von dmd-studio.de übernommen (brand-500).
- **Text-Primary (#101828):** „Dark Gray" — Überschriften, Primärtext (von dmd-studio.de).
- **Text-Secondary (#475467):** „Gray" — Sekundärtext (von dmd-studio.de).
- **Text-Muted (#667085):** „Gray Muted" — Metadaten, Tabellen-Header (von dmd-studio.de).
- **Neutral (#f9fafb):** Seitenhintergrund (von dmd-studio.de: bg-secondary).
- **Border (#eaecf0):** Karten- und Tabellenränder (von dmd-studio.de).
- **Sidebar-BG (#0b0c0f):** Dunkle Sidebar (von dmd-studio.de: Dark Mode bg).
- **Success/Warning/Danger:** Status-Indikatoren.

## Typography

Inter für alles — wie auf dmd-studio.de. Gewicht und Größe tragen die Hierarchie.
Große Zahlen (stat-xl, 2.25rem/700) für KPI-Werte.
label-caps (0.6875rem/600/0.08em) für Tabellen-Header und KPI-Beschriftungen.

## Layout

4px-Baseline. `md` (16px) für intra-Komponenten-Abstände, `lg` (24px) für
inter-Komponenten, `xl` (32px) für Sektionswechsel. KPI-Karten in einem
4-Spalten-Raster auf Desktop, 2-Spalten auf Tablet, 1-Spalte auf Mobile.

## Elevation & Depth

Subtile Schatten wie auf dmd-studio.de. `sm` für Inputs, `md` für Karten
bei Hover, `lg` für Dropdowns und Modals.

## Shapes

`sm` (6px) für Buttons und Inputs. `lg` (16px) für Karten. `full` für Badges.

## Components

- `button-primary` ist die einzige hochpriorisierte Aktion — grün wie auf dmd-studio.de.
- `card` ist die Standard-Oberfläche — kein Schatten im Default, `md` bei Hover.
- `badge-*` für Status-Indikatoren — niedriger Kontrast-Hintergrund + volle Farbe als Text.

## Do's and Don'ts

- **Do** negative Zahlen in Rot, positive in Grün darstellen.
- **Do** Diagramme mit Grün (tertiary) als Primärdatenreihe einfärben.
- **Don't** andere Farben als Grün für Interaktion verwenden.
- **Don't** Schatten als Designelement einsetzen — sie strukturieren, nicht dekorieren.