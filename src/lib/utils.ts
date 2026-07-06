// ============================================================
// Hilfsfunktionen: Formatierung, Kennzahlen-Berechnung
// ============================================================

import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";

/** Minuten → "Xh Ym" */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Minuten → Dezimalstunden "X,XX" */
export function minutesToHours(minutes: number): number {
  return Math.round((minutes / 60) * 100) / 100;
}

/** Euro formatieren */
export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "–";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

/** Prozent formatieren */
export function formatPercent(value: number | null | undefined): string {
  if (value == null) return "–";
  return new Intl.NumberFormat("de-DE", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

/** ISO-Datum → "Mo, 02. Jun 2026" */
export function formatDate(iso: string): string {
  try {
    return format(parseISO(iso), "EEE, dd. MMM yyyy", { locale: de });
  } catch {
    return iso;
  }
}

/** ISO-Datum → "02.06.2026" */
export function formatDateShort(iso: string): string {
  try {
    return format(parseISO(iso), "dd.MM.yyyy", { locale: de });
  } catch {
    return iso;
  }
}

/** Zeit-String "HH:MM" → "HH:MM" (passt durch) */
export function formatTime(time: string | null | undefined): string {
  if (!time) return "–";
  return time.slice(0, 5);
}

/** Status-Label auf Deutsch */
export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: "Entwurf",
    submitted: "Eingereicht",
    approved: "Genehmigt",
    rejected: "Abgelehnt",
    planned: "Geplant",
    active: "Aktiv",
    completed: "Abgeschlossen",
    cancelled: "Storniert",
  };
  return map[status] ?? status;
}

/** Status → Badge-Farbe (Tailwind-Klassen) */
export function statusBadge(status: string): string {
  const map: Record<string, string> = {
    draft: "bg-slate-100 text-slate-600",
    submitted: "bg-blue-100 text-blue-700",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-700",
    planned: "bg-amber-100 text-amber-800",
    active: "bg-green-100 text-green-800",
    completed: "bg-slate-100 text-slate-600",
    cancelled: "bg-red-100 text-red-700",
  };
  return map[status] ?? "bg-slate-100 text-slate-600";
}

/** Marge-Klasse (positiv/negativ) */
export function marginClass(value: number | null | undefined): string {
  if (value == null) return "";
  return value >= 0 ? "text-green-600" : "text-red-600";
}