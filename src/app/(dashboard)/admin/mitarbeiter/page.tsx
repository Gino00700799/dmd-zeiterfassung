"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase-browser";
import type { Employee, EmployeeRole } from "@/types/database";
import { formatCurrency } from "@/lib/utils";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import clsx from "clsx";

export default function MitarbeiterPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "employee" as EmployeeRole,
    hourly_rate: "45",
    weekly_hours: "40",
    active: true,
  });

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("employees")
      .select("*")
      .order("last_name");
    setEmployees((data as Employee[]) ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function resetForm() {
    setForm({
      first_name: "",
      last_name: "",
      email: "",
      role: "employee",
      hourly_rate: "45",
      weekly_hours: "40",
      active: true,
    });
    setEditingId(null);
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      role: form.role,
      hourly_rate: Number(form.hourly_rate),
      weekly_hours: Number(form.weekly_hours),
      active: form.active,
    };

    if (editingId) {
      const { error } = await supabase
        .from("employees")
        .update(payload)
        .eq("id", editingId);
      if (error) {
        alert("Fehler: " + error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("employees").insert(payload);
      if (error) {
        alert("Fehler: " + error.message);
        return;
      }
    }
    resetForm();
    await load();
  }

  function handleEdit(e: Employee) {
    setEditingId(e.id);
    setForm({
      first_name: e.first_name,
      last_name: e.last_name,
      email: e.email,
      role: e.role,
      hourly_rate: e.hourly_rate.toString(),
      weekly_hours: e.weekly_hours.toString(),
      active: e.active,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    if (!confirm("Mitarbeiter deaktivieren? (Löschen nicht empfohlen)")) return;
    const { error } = await supabase
      .from("employees")
      .update({ active: false })
      .eq("id", id);
    if (error) {
      alert("Fehler: " + error.message);
      return;
    }
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mitarbeiter</h1>
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
          Neuer Mitarbeiter
        </button>
      </div>

      {showForm && (
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {editingId ? "Mitarbeiter bearbeiten" : "Neuer Mitarbeiter"}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Vorname *</label>
              <input
                className="input"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Nachname *</label>
              <input
                className="input"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">E-Mail *</label>
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Rolle</label>
              <select
                className="input"
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value as EmployeeRole })
                }
              >
                <option value="employee">Mitarbeiter</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div>
              <label className="label">Stundensatz (€)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={form.hourly_rate}
                onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Wochenstunden</label>
              <input
                type="number"
                step="0.5"
                className="input"
                value={form.weekly_hours}
                onChange={(e) =>
                  setForm({ ...form, weekly_hours: e.target.value })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-dmd-600"
              />
              <label htmlFor="active" className="text-sm text-gray-700">
                Aktiv
              </label>
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
              <th className="table-th">Name</th>
              <th className="table-th">E-Mail</th>
              <th className="table-th">Rolle</th>
              <th className="table-th">Stundensatz</th>
              <th className="table-th">Wochenstunden</th>
              <th className="table-th">Status</th>
              <th className="table-th text-right">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="table-td font-medium">
                  {e.first_name} {e.last_name}
                </td>
                <td className="table-td">{e.email}</td>
                <td className="table-td">
                  <span
                    className={clsx(
                      "badge",
                      e.role === "admin"
                        ? "bg-dmd-100 text-dmd-700"
                        : "bg-gray-100 text-gray-700"
                    )}
                  >
                    {e.role === "admin" ? "Admin" : "Mitarbeiter"}
                  </span>
                </td>
                <td className="table-td">{formatCurrency(e.hourly_rate)}/h</td>
                <td className="table-td">{e.weekly_hours} h</td>
                <td className="table-td">
                  <span
                    className={clsx(
                      "badge",
                      e.active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    )}
                  >
                    {e.active ? "Aktiv" : "Inaktiv"}
                  </span>
                </td>
                <td className="table-td">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => handleEdit(e)}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-dmd-600"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(e.id)}
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