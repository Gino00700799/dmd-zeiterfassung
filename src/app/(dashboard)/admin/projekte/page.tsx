"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase-browser";
import type { Project, Customer, ProjectStatus } from "@/types/database";
import { statusLabel, statusBadge, formatCurrency } from "@/lib/utils";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import clsx from "clsx";

export default function ProjektePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    customer_id: "",
    name: "",
    description: "",
    status: "active" as ProjectStatus,
    budget_hours: "",
    budget_amount: "",
    hourly_rate: "100",
    start_date: "",
    end_date: "",
  });

  const load = useCallback(async () => {
    const [{ data: projs }, { data: custs }] = await Promise.all([
      supabase.from("projects").select("*").order("name"),
      supabase.from("customers").select("*").eq("active", true).order("name"),
    ]);
    setProjects((projs as Project[]) ?? []);
    setCustomers((custs as Customer[]) ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function resetForm() {
    setForm({
      customer_id: "",
      name: "",
      description: "",
      status: "active",
      budget_hours: "",
      budget_amount: "",
      hourly_rate: "100",
      start_date: "",
      end_date: "",
    });
    setEditingId(null);
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customer_id || !form.name) return;

    const payload = {
      customer_id: form.customer_id,
      name: form.name,
      description: form.description || null,
      status: form.status,
      budget_hours: form.budget_hours ? Number(form.budget_hours) : null,
      budget_amount: form.budget_amount ? Number(form.budget_amount) : null,
      hourly_rate: Number(form.hourly_rate),
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    };

    if (editingId) {
      const { error } = await supabase
        .from("projects")
        .update(payload)
        .eq("id", editingId);
      if (error) {
        alert("Fehler: " + error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("projects").insert(payload);
      if (error) {
        alert("Fehler: " + error.message);
        return;
      }
    }
    resetForm();
    await load();
  }

  function handleEdit(p: Project) {
    setEditingId(p.id);
    setForm({
      customer_id: p.customer_id,
      name: p.name,
      description: p.description ?? "",
      status: p.status,
      budget_hours: p.budget_hours?.toString() ?? "",
      budget_amount: p.budget_amount?.toString() ?? "",
      hourly_rate: p.hourly_rate.toString(),
      start_date: p.start_date ?? "",
      end_date: p.end_date ?? "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    if (!confirm("Projekt wirklich löschen?")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) {
      alert("Fehler: " + error.message);
      return;
    }
    await load();
  }

  const customerName = (id: string) =>
    customers.find((c) => c.id === id)?.name ?? "–";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projekte</h1>
          <p className="text-sm text-gray-500">Stammdatenverwaltung (Admin)</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="btn-primary"
        >
          <Plus size={18} />
          Neues Projekt
        </button>
      </div>

      {showForm && (
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {editingId ? "Projekt bearbeiten" : "Neues Projekt"}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Kunde *</label>
              <select
                className="input"
                value={form.customer_id}
                onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
                required
              >
                <option value="">– auswählen –</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Projektname *</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Beschreibung</label>
              <textarea
                className="input"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Status</label>
              <select
                className="input"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as ProjectStatus })
                }
              >
                <option value="planned">Geplant</option>
                <option value="active">Aktiv</option>
                <option value="completed">Abgeschlossen</option>
                <option value="cancelled">Storniert</option>
              </select>
            </div>
            <div>
              <label className="label">Stundensatz (€)</label>
              <input
                type="number"
                className="input"
                value={form.hourly_rate}
                onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Budget (Stunden)</label>
              <input
                type="number"
                className="input"
                value={form.budget_hours}
                onChange={(e) => setForm({ ...form, budget_hours: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Budget (€)</label>
              <input
                type="number"
                className="input"
                value={form.budget_amount}
                onChange={(e) => setForm({ ...form, budget_amount: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Startdatum</label>
              <input
                type="date"
                className="input"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Enddatum</label>
              <input
                type="date"
                className="input"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 md:col-span-2">
              <button type="button" onClick={resetForm} className="btn-secondary">
                Abbrechen
              </button>
              <button type="submit" className="btn-primary">
                <Save size={18} />
                Speichern
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-visible p-0">
        <table className="table-base">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-th">Projekt</th>
              <th className="table-th">Kunde</th>
              <th className="table-th">Status</th>
              <th className="table-th">Stundensatz</th>
              <th className="table-th">Budget (h)</th>
              <th className="table-th">Budget (€)</th>
              <th className="table-th text-right">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {projects.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="table-td font-medium">{p.name}</td>
                <td className="table-td">{customerName(p.customer_id)}</td>
                <td className="table-td">
                  <span className={clsx("badge", statusBadge(p.status))}>
                    {statusLabel(p.status)}
                  </span>
                </td>
                <td className="table-td">{formatCurrency(p.hourly_rate)}/h</td>
                <td className="table-td">{p.budget_hours ?? "–"}</td>
                <td className="table-td">{formatCurrency(p.budget_amount)}</td>
                <td className="table-td">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => handleEdit(p)}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-dmd-600"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}