"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase-browser";
import type {
  Project,
  Activity,
  TimeEntryFull,
  Employee,
} from "@/types/database";
import {
  formatDuration,
  formatDateShort,
  statusBadge,
  minutesToHours,
} from "@/lib/utils";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Clock,
  Filter,
} from "lucide-react";
import clsx from "clsx";

export default function ZeiterfassungPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [entries, setEntries] = useState<TimeEntryFull[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [form, setForm] = useState({
    project_id: "",
    activity_id: "",
    date: new Date().toISOString().slice(0, 10),
    start_time: "09:00",
    end_time: "10:00",
    duration_min: 60,
    description: "",
    billable: true,
  });

  const loadAll = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: emp } = await supabase
      .from("employees")
      .select("*")
      .eq("user_id", user.id)
      .single();
    setEmployee(emp as Employee);

    const [{ data: projs }, { data: acts }] = await Promise.all([
      supabase.from("projects").select("*").eq("status", "active").order("name"),
      supabase.from("activities").select("*").eq("active", true).order("name"),
    ]);
    setProjects(projs as Project[]);
    setActivities(acts as Activity[]);

    const startDate = `${filterMonth}-01`;
    const endDate = `${filterMonth}-31`;
    const { data: entryData } = await supabase
      .from("v_time_entries_full")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });
    setEntries((entryData as TimeEntryFull[]) ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMonth]);

  async function loadEntries() {
    const startDate = `${filterMonth}-01`;
    const endDate = `${filterMonth}-31`;
    const { data } = await supabase
      .from("v_time_entries_full")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });
    setEntries((data as TimeEntryFull[]) ?? []);
  }

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMonth]);

  function calcDuration(start: string, end: string): number {
    if (!start || !end) return form.duration_min;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    let diff = eh * 60 + em - (sh * 60 + sm);
    if (diff <= 0) diff += 24 * 60;
    return diff;
  }

  function resetForm() {
    setForm({
      project_id: "",
      activity_id: "",
      date: new Date().toISOString().slice(0, 10),
      start_time: "09:00",
      end_time: "10:00",
      duration_min: 60,
      description: "",
      billable: true,
    });
    setEditingId(null);
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!employee || !form.project_id) return;

    const payload = {
      employee_id: employee.id,
      project_id: form.project_id,
      activity_id: form.activity_id || null,
      date: form.date,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
      duration_min: form.duration_min,
      description: form.description || null,
      billable: form.billable,
      status: "draft" as const,
    };

    if (editingId) {
      const { error } = await supabase
        .from("time_entries")
        .update(payload)
        .eq("id", editingId);
      if (error) {
        alert("Fehler beim Speichern: " + error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("time_entries").insert(payload);
      if (error) {
        alert("Fehler beim Buchen: " + error.message);
        return;
      }
    }

    resetForm();
    await loadEntries();
  }

  function handleEdit(entry: TimeEntryFull) {
    setEditingId(entry.id);
    setForm({
      project_id: entry.project_id,
      activity_id: entry.activity_id ?? "",
      date: entry.date,
      start_time: entry.start_time ?? "09:00",
      end_time: entry.end_time ?? "10:00",
      duration_min: entry.duration_min,
      description: entry.description ?? "",
      billable: entry.billable,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    if (!confirm("Diese Zeitbuchung wirklich löschen?")) return;
    const { error } = await supabase.from("time_entries").delete().eq("id", id);
    if (error) {
      alert("Fehler: " + error.message);
      return;
    }
    await loadEntries();
  }

  async function handleStatusChange(id: string, status: string) {
    const { error } = await supabase
      .from("time_entries")
      .update({ status })
      .eq("id", id);
    if (error) {
      alert("Fehler: " + error.message);
      return;
    }
    await loadEntries();
  }

  const totalMinutes = entries.reduce((s, e) => s + e.duration_min, 0);
  const billableMinutes = entries
    .filter((e) => e.billable)
    .reduce((s, e) => s + e.duration_min, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-text-primary">Zeiterfassung</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Arbeitszeiten erfassen, bearbeiten und buchen
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="btn-primary"
        >
          <Plus size={18} />
          Neue Buchung
        </button>
      </div>

      {/* Formular */}
      {showForm && (
        <div className="card-elevated animate-slide-up">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-h3 font-semibold">
              {editingId ? "Buchung bearbeiten" : "Neue Zeitbuchung"}
            </h2>
            <button
              onClick={resetForm}
              className="rounded-md p-1.5 text-text-muted hover:bg-neutral hover:text-text-primary"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Projekt *</label>
              <select
                className="input"
                value={form.project_id}
                onChange={(e) =>
                  setForm({ ...form, project_id: e.target.value })
                }
                required
              >
                <option value="">– auswählen –</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Tätigkeit</label>
              <select
                className="input"
                value={form.activity_id}
                onChange={(e) =>
                  setForm({ ...form, activity_id: e.target.value })
                }
              >
                <option value="">– auswählen –</option>
                {activities.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Datum *</label>
              <input
                type="date"
                className="input"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Dauer (Minuten) *</label>
              <input
                type="number"
                className="input"
                value={form.duration_min}
                min={1}
                onChange={(e) =>
                  setForm({ ...form, duration_min: Number(e.target.value) })
                }
                required
              />
            </div>

            <div>
              <label className="label">Startzeit</label>
              <input
                type="time"
                className="input"
                value={form.start_time}
                onChange={(e) => {
                  const start = e.target.value;
                  setForm({
                    ...form,
                    start_time: start,
                    duration_min: calcDuration(start, form.end_time),
                  });
                }}
              />
            </div>

            <div>
              <label className="label">Endzeit</label>
              <input
                type="time"
                className="input"
                value={form.end_time}
                onChange={(e) => {
                  const end = e.target.value;
                  setForm({
                    ...form,
                    end_time: end,
                    duration_min: calcDuration(form.start_time, end),
                  });
                }}
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">Beschreibung</label>
              <textarea
                className="input"
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Kurzbeschreibung der Tätigkeit…"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="billable"
                checked={form.billable}
                onChange={(e) =>
                  setForm({ ...form, billable: e.target.checked })
                }
                className="h-4 w-4 rounded border-border text-tertiary focus:ring-tertiary/10"
              />
              <label htmlFor="billable" className="text-sm text-text-primary">
                Verrechenbar
              </label>
            </div>

            <div className="flex justify-end gap-2 md:col-span-2">
              <button type="button" onClick={resetForm} className="btn-secondary">
                Abbrechen
              </button>
              <button type="submit" className="btn-primary">
                <Save size={18} />
                {editingId ? "Speichern" : "Buchen"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter + Zusammenfassung */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Filter size={16} className="text-text-muted" />
          <label className="text-sm font-medium text-text-primary">Monat:</label>
          <input
            type="month"
            className="input w-48"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          />
        </div>
        <div className="flex gap-6 text-sm">
          <div className="rounded-lg border border-border bg-surface px-4 py-2">
            <span className="text-label-caps font-semibold uppercase tracking-wider text-text-muted">
              Gesamt
            </span>
            <p className="mt-0.5 font-semibold tabular-nums text-text-primary">
              {formatDuration(totalMinutes)}
              <span className="ml-1 text-xs font-normal text-text-muted">
                ({minutesToHours(totalMinutes)} h)
              </span>
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface px-4 py-2">
            <span className="text-label-caps font-semibold uppercase tracking-wider text-text-muted">
              Verrechenbar
            </span>
            <p className="mt-0.5 font-semibold tabular-nums text-tertiary">
              {formatDuration(billableMinutes)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabelle */}
      <div className="card-elevated overflow-visible p-0">
        <table className="table-base">
          <thead className="bg-neutral">
            <tr>
              <th className="table-th">Datum</th>
              <th className="table-th">Projekt</th>
              <th className="table-th">Tätigkeit</th>
              <th className="table-th text-right">Dauer</th>
              <th className="table-th">Beschreibung</th>
              <th className="table-th">Status</th>
              <th className="table-th text-right">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-text-muted"
                >
                  <Clock size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Keine Buchungen in diesem Monat</p>
                </td>
              </tr>
            ) : (
              entries.map((e) => (
                <tr
                  key={e.id}
                  className="transition-colors hover:bg-neutral/60"
                >
                  <td className="table-td whitespace-nowrap text-text-secondary">
                    {formatDateShort(e.date)}
                  </td>
                  <td className="table-td font-medium text-text-primary">
                    {e.project_name}
                  </td>
                  <td className="table-td text-text-secondary">
                    {e.activity_name ?? "–"}
                  </td>
                  <td className="table-td whitespace-nowrap text-right font-semibold tabular-nums">
                    {formatDuration(e.duration_min)}
                  </td>
                  <td
                    className="table-td max-w-xs truncate text-text-secondary"
                    title={e.description ?? ""}
                  >
                    {e.description ?? "–"}
                  </td>
                  <td className="table-td">
                    <select
                      value={e.status}
                      onChange={(ev) =>
                        handleStatusChange(e.id, ev.target.value)
                      }
                      className={clsx(
                        "rounded-full border-0 px-2.5 py-0.5 text-xs font-medium transition-colors",
                        statusBadge(e.status)
                      )}
                    >
                      <option value="draft">Entwurf</option>
                      <option value="submitted">Eingereicht</option>
                      <option value="approved">Genehmigt</option>
                      <option value="rejected">Abgelehnt</option>
                    </select>
                  </td>
                  <td className="table-td">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleEdit(e)}
                        className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-blue-50 hover:text-tertiary"
                        title="Bearbeiten"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-red-50 hover:text-danger"
                        title="Löschen"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}