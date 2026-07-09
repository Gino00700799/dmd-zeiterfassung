"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-browser";
import type { ProjectSummary, EmployeeUtilization, Employee } from "@/types/database";
import {
  formatCurrency,
  formatPercent,
  marginClass,
} from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Clock,
  DollarSign,
  Users,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from "lucide-react";
import clsx from "clsx";

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [employees, setEmployees] = useState<EmployeeUtilization[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: emp } = await supabase
        .from("employees")
        .select("*")
        .eq("user_id", user.id)
        .single();
      setCurrentEmployee(emp as Employee);

      const [{ data: projData }, { data: empData }] = await Promise.all([
        supabase.from("v_project_summary").select("*").order("project_name"),
        supabase.from("v_employee_utilization").select("*"),
      ]);

      setProjects((projData as ProjectSummary[]) ?? []);
      setEmployees((empData as EmployeeUtilization[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-tertiary" />
          <p className="text-sm text-text-muted">Lade Dashboard…</p>
        </div>
      </div>
    );
  }

  const isAdmin = currentEmployee?.role === "admin";

  // Kennzahlen
  const totalBookedHours = projects.reduce((s, p) => s + p.booked_hours, 0);
  const totalRevenue = projects.reduce((s, p) => s + (p.revenue ?? 0), 0);
  const totalMargin = projects.reduce((s, p) => s + (p.margin ?? 0), 0);
  const avgUtilization =
    employees.length > 0
      ? employees.reduce((s, e) => s + e.utilization_pct, 0) / employees.length
      : 0;

  const overBudget = projects.filter(
    (p) =>
      p.budget_utilization_pct != null && p.budget_utilization_pct > 100
  );

  // Chart-Daten
  const projectHoursData = projects.slice(0, 8).map((p) => ({
    name: p.project_name.length > 14 ? p.project_name.slice(0, 14) + "…" : p.project_name,
    gebucht: Math.round(p.booked_hours * 10) / 10,
    budget: p.budget_hours,
  }));

  const marginData = projects
    .filter((p) => p.margin != null)
    .map((p) => ({
      name: p.project_name.length > 14 ? p.project_name.slice(0, 14) + "…" : p.project_name,
      marge: p.margin,
    }));

  const utilizationData = employees.map((e) => ({
    name: `${e.first_name} ${e.last_name.charAt(0)}.`,
    auslastung: e.utilization_pct,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-text-primary">Dashboard</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Betriebswirtschaftliche Kennzahlen · Projekt-Controlling
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-secondary">
          <Calendar size={16} className="text-text-muted" />
          {new Date().toLocaleDateString("de-DE", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Überbudget-Warnung */}
      {overBudget.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 animate-slide-up">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-600" />
          <div className="text-sm">
            <span className="font-semibold text-amber-900">
              {overBudget.length} Projekt(e) über Budget
            </span>
            <p className="mt-0.5 text-amber-700">
              {overBudget.map((p) => p.project_name).join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* KPI-Karten */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Gebuchte Stunden"
          value={`${Math.round(totalBookedHours)} h`}
          subtitle={`${projects.length} Projekte`}
          icon={<Clock size={20} />}
          colorClass="bg-green-50 text-tertiary"
        />
        <StatCard
          label="Umsatz (verrechenbar)"
          value={formatCurrency(totalRevenue)}
          subtitle="Alle Projekte"
          icon={<DollarSign size={20} />}
          colorClass="bg-emerald-50 text-success"
        />
        <StatCard
          label="Projektmarge"
          value={formatCurrency(totalMargin)}
          subtitle={totalMargin >= 0 ? "Positiv" : "Negativ"}
          icon={<TrendingUp size={20} />}
          colorClass={
            totalMargin >= 0
              ? "bg-emerald-50 text-success"
              : "bg-red-50 text-danger"
          }
          trend={totalMargin >= 0 ? "up" : "down"}
        />
        <StatCard
          label="Ø Auslastung"
          value={formatPercent(avgUtilization)}
          subtitle={`${employees.length} Mitarbeiter`}
          icon={<Users size={20} />}
          colorClass="bg-violet-50 text-accent"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Soll-/Ist Diagramm */}
        <div className="card-elevated">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-h3 font-semibold text-text-primary">
                Soll-/Ist-Vergleich
              </h2>
              <p className="text-sm text-text-muted">Stunden je Projekt</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={projectHoursData} barGap={4}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
                angle={-15}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  fontSize: "13px",
                  boxShadow: "0 2px 8px -2px rgba(15,23,42,0.08)",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                iconType="circle"
              />
              <Bar
                dataKey="budget"
                name="Budget (Soll)"
                fill="#dcfce7"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="gebucht"
                name="Gebucht (Ist)"
                fill="#3da85e"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Margen Diagramm */}
        <div className="card-elevated">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-h3 font-semibold text-text-primary">
                Projektmarge
              </h2>
              <p className="text-sm text-text-muted">Erlös minus Kosten</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={marginData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
                angle={-15}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}€`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  fontSize: "13px",
                  boxShadow: "0 2px 8px -2px rgba(15,23,42,0.08)",
                }}
                formatter={(v: number) => formatCurrency(v)}
              />
              <Bar
                dataKey="marge"
                name="Marge"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mitarbeiter-Auslastung (Admin) */}
      {isAdmin && (
        <div className="card-elevated">
          <div className="mb-4">
            <h2 className="text-h3 font-semibold text-text-primary">
              Mitarbeiter-Auslastung
            </h2>
            <p className="text-sm text-text-muted">
              Gebuchte Stunden im Verhältnis zum Jahressoll
            </p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={utilizationData} layout="horizontal">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  fontSize: "13px",
                  boxShadow: "0 2px 8px -2px rgba(15,23,42,0.08)",
                }}
                formatter={(v: number) => `${v}%`}
              />
              <Bar
                dataKey="auslastung"
                name="Auslastung"
                fill="#51c878"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Projekt-Übersicht */}
      <div className="card-elevated overflow-visible p-0">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-h3 font-semibold text-text-primary">
            Projekt-Übersicht
          </h2>
          <p className="text-sm text-text-muted">
            Detailierte Kennzahlen je Projekt
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead className="bg-neutral">
              <tr>
                <th className="table-th">Projekt</th>
                <th className="table-th">Kunde</th>
                <th className="table-th text-right">Gebucht</th>
                <th className="table-th text-right">Budget</th>
                <th className="table-th">Auslastung</th>
                <th className="table-th text-right">Kosten</th>
                <th className="table-th text-right">Erlös</th>
                <th className="table-th text-right">Marge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.map((p) => (
                <tr
                  key={p.project_id}
                  className="transition-colors hover:bg-neutral/60"
                >
                  <td className="table-td font-medium text-text-primary">
                    {p.project_name}
                  </td>
                  <td className="table-td text-text-secondary">
                    {p.customer_name}
                  </td>
                  <td className="table-td text-right tabular-nums">
                    {Math.round(p.booked_hours)} h
                  </td>
                  <td className="table-td text-right tabular-nums text-text-secondary">
                    {p.budget_hours ? `${p.budget_hours} h` : "–"}
                  </td>
                  <td className="table-td">
                    {p.budget_utilization_pct != null ? (
                      <span
                        className={clsx(
                          "badge",
                          p.budget_utilization_pct > 100
                            ? "badge-danger"
                            : p.budget_utilization_pct > 80
                            ? "badge-warning"
                            : "badge-success"
                        )}
                      >
                        {p.budget_utilization_pct}%
                      </span>
                    ) : (
                      <span className="text-text-muted">–</span>
                    )}
                  </td>
                  <td className="table-td text-right tabular-nums text-text-secondary">
                    {formatCurrency(p.internal_cost)}
                  </td>
                  <td className="table-td text-right tabular-nums">
                    {formatCurrency(p.revenue)}
                  </td>
                  <td
                    className={clsx(
                      "table-td text-right font-semibold tabular-nums",
                      marginClass(p.margin)
                    )}
                  >
                    {formatCurrency(p.margin)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// StatCard Komponente
function StatCard({
  label,
  value,
  subtitle,
  icon,
  colorClass,
  trend,
}: {
  label: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  colorClass: string;
  trend?: "up" | "down";
}) {
  return (
    <div className="stat-card animate-slide-up">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="stat-label">{label}</p>
          <p className="stat-value mt-2">{value}</p>
          <div className="mt-2 flex items-center gap-1.5 text-sm">
            {trend === "up" && (
              <ArrowUpRight size={14} className="text-success" />
            )}
            {trend === "down" && (
              <ArrowDownRight size={14} className="text-danger" />
            )}
            <span
              className={clsx(
                "text-text-secondary",
                trend === "up" && "text-success",
                trend === "down" && "text-danger"
              )}
            >
              {subtitle}
            </span>
          </div>
        </div>
        <div className={clsx("stat-icon", colorClass)}>{icon}</div>
      </div>
    </div>
  );
}