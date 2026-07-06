---
version: alpha
name: DMD Studio
description: Moderne, professionelle Business-UI für Projektzeiterfassung — klare Hierarchie, ruhige Oberfläche, präzise Datenvisualisierung.
colors:
  primary: "#0F172A"
  secondary: "#64748B"
  tertiary: "#2563EB"
  accent: "#7C3AED"
  success: "#10B981"
  warning: "#F59E0B"
  danger: "#EF4444"
  neutral: "#F8FAFC"
  surface: "#FFFFFF"
  surface-elevated: "#FFFFFF"
  on-primary: "#FFFFFF"
  on-tertiary: "#FFFFFF"
  on-accent: "#FFFFFF"
  text-primary: "#0F172A"
  text-secondary: "#64748B"
  text-muted: "#94A3B8"
  border: "#E2E8F0"
  border-hover: "#CBD5E1"
  sidebar-bg: "#0F172A"
  sidebar-text: "#94A3B8"
  sidebar-active: "#1E293B"
  sidebar-active-text: "#FFFFFF"
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
  body-sm:
    fontFamily: Inter
    fontSize: 0.75rem
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
  sm: "0 1px 2px 0 rgba(15,23,42,0.04)"
  md: "0 2px 8px -2px rgba(15,23,42,0.08), 0 1px 3px -1px rgba(15,23,42,0.04)"
  lg: "0 8px 24px -4px rgba(15,23,42,0.10), 0 2px 8px -2px rgba(15,23,42,0.06)"
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    rounded: "{rounded.sm}"
    padding: 10px
  button-primary-hover:
    backgroundColor: "#1D4ED8"
    textColor: "{colors.on-tertiary}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: 24px
  card-elevated:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: 24px
  stat-card:
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

DMD Studio ist eine kreative Agentur — die UI des Projekt-Controlling-Moduls
spiegelt das wider: klare Linien, großzügige Weißräume, eine ruhige Farbpalette
mit einem einzigen Interaktions-Akzent (Blau). Daten stehen im Vordergrund,
nicht Dekoration. Die Sidebar ist dunkel für visuelle Trennung vom Inhalt.
KPI-Karten nutzen dezente Icons und große Zahlen für sofortige Erfassbarkeit.

## Colors

- **Primary (#0F172A):** „Deep Slate" — Überschriften, Sidebar, hochpriorisierte Texte.
- **Secondary (#64748B):** „Slate" — Sekundärtext, Tabellen-Header, Metadaten.
- **Tertiary (#2563EB):** „Royal Blue" — einziger Interaktions-Akzent. Buttons,
  Links, aktive States, Fokus-Ringe.
- **Accent (#7C3AED):** „Violet" — ausschließlich für Diagramm-Akzente und
  sekundäre Datenreihen, nie für UI-Interaktion.
- **Success/Warning/Danger:** Status-Indikatoren (Genehmigt, Über Budget, Abgelehnt).
  Nur als Badge-Hintergrund + Text, nie als大面积 Fläche.
- **Neutral (#F8FAFC):** Seitenhintergrund — ruhig, nicht weiß, reduziert Augenbelastung.
- **Surface (#FFFFFF):** Karten, Tabellen, Inputs — clean und lesbar.

## Typography

Inter für alles. Gewicht und Größe tragen die Hierarchie, nicht die Schriftfamilie.
Große Zahlen (stat-xl, 2.25rem/700) für KPI-Werte — sofort erfassbar.
label-caps (0.6875rem/600/0.08em) für Tabellen-Header und KPI-Beschriftungen —
Großbuchstaben mit weiter Sperrung für ruhige Hierarchie.

## Layout

4px-Baseline. `md` (16px) für intra-Komponenten-Abstände, `lg` (24px) für
inter-Komponenten, `xl` (32px) für Sektionswechsel. KPI-Karten in einem
4-Spalten-Raster auf Desktop, 2-Spalten auf Tablet, 1-Spalte auf Mobile.

## Elevation & Depth

Subtile Schatten, nicht demonstrativ. `sm` für Inputs und Badges, `md` für
Karten bei Hover, `lg` für Dropdowns und Modals. Keine Schatten auf der
Sidebar — sie ist flach mit Hintergrundfarbe.

## Shapes

`sm` (6px) für Buttons und Inputs — modern aber nicht Spielzeug-artig.
`lg` (16px) für Karten — weich genug um sie als Einheit zu lesen.
`full` nur für Badges und Avatare.

## Components

- `button-primary` ist die einzige hochpriorisierte Aktion pro Bildschirm.
- `card` ist die Standard-Oberfläche für gruppierte Inhalte — kein Schatten
  im Default-Zustand, `md`-Schatten bei Hover.
- `stat-card` für KPI-Karten: großer Zahlenwert (stat-xl), Beschriftung
  (label-caps), dezentes Icon rechts oben in einem farbigen Kreis.
- `badge-*` für Status-Indikatoren — niedriger Kontrast-Hintergrund + 
  volle Farbe als Text, niemals invertiert.

## Do's and Don'ts

- **Do** negative Zahlen in Rot ({colors.danger}) und positive in Grün
  ({colors.success}) darstellen — aber nur bei Margen und Abweichungen.
- **Do** Diagramme mit {colors.tertiary} als Primärdatenreihe und
  {colors.accent} als Sekundärdatenreihe einfärben.
- **Don't** mehrere Akzentfarben für Interaktion verwenden — nur {colors.tertiary}.
- **Don't** Schatten als Designelement einsetzen — sie strukturieren, nicht dekorieren.
- **Don't** runde Ecken über 16px für Karten verwenden — wirkt kindlich.