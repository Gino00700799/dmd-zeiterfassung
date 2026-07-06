// ============================================================
// Typdefinitionen – Domänenmodell Projektzeiterfassung
// ============================================================

export type EmployeeRole = "employee" | "admin";

export interface Customer {
  id: string;
  name: string;
  street: string | null;
  zip_code: string | null;
  city: string | null;
  email: string | null;
  phone: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  role: EmployeeRole;
  hourly_rate: number;
  weekly_hours: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type ProjectStatus = "planned" | "active" | "completed" | "cancelled";

export interface Project {
  id: string;
  customer_id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  budget_hours: number | null;
  budget_amount: number | null;
  hourly_rate: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  created_at: string;
}

export type TimeEntryStatus = "draft" | "submitted" | "approved" | "rejected";

export interface TimeEntry {
  id: string;
  employee_id: string;
  project_id: string;
  activity_id: string | null;
  date: string;
  start_time: string | null;
  end_time: string | null;
  duration_min: number;
  description: string | null;
  billable: boolean;
  status: TimeEntryStatus;
  created_at: string;
  updated_at: string;
}

// View-Typen
export interface TimeEntryFull extends TimeEntry {
  employee_first_name: string;
  employee_last_name: string;
  employee_hourly_rate: number;
  project_name: string;
  customer_id: string;
  customer_name: string;
  budget_hours: number | null;
  budget_amount: number | null;
  project_hourly_rate: number;
  activity_name: string | null;
}

export interface ProjectSummary {
  project_id: string;
  project_name: string;
  customer_id: string;
  customer_name: string;
  status: ProjectStatus;
  budget_hours: number | null;
  budget_amount: number | null;
  project_hourly_rate: number;
  booked_hours: number;
  billable_hours: number;
  approved_hours: number;
  entry_count: number;
  budget_utilization_pct: number | null;
  internal_cost: number | null;
  revenue: number | null;
  margin: number | null;
}

export interface EmployeeUtilization {
  employee_id: string;
  first_name: string;
  last_name: string;
  weekly_hours: number;
  hourly_rate: number;
  booked_hours_year: number;
  utilization_pct: number;
}