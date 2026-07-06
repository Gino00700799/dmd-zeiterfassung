"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-browser";
import type { Employee } from "@/types/database";
import {
  LayoutDashboard,
  Clock,
  Users,
  FolderKanban,
  LogOut,
  Menu,
  X,
  Building2,
} from "lucide-react";
import clsx from "clsx";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("employees")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setEmployee(data as Employee | null);
    }
    loadProfile();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const isAdmin = employee?.role === "admin";

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/zeiterfassung", label: "Zeiterfassung", icon: Clock },
    ...(isAdmin
      ? [
          { href: "/admin/projekte", label: "Projekte", icon: FolderKanban },
          { href: "/admin/mitarbeiter", label: "Mitarbeiter", icon: Users },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-neutral">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <Building2 size={20} className="text-tertiary" />
          <span className="font-semibold text-text-primary">DMD Studio</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-md p-1.5 text-text-secondary hover:bg-neutral"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={clsx(
            "fixed inset-y-0 left-0 z-30 w-64 transform bg-sidebar-bg transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex items-center gap-3 border-b border-white/5 px-6 py-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-tertiary text-on-tertiary">
                <Building2 size={20} />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white">DMD Studio</h1>
                <p className="text-xs text-sidebar-text">Zeiterfassung</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-text/60">
                Navigation
              </p>
              {navItems.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={clsx(
                      active ? "sidebar-link-active" : "sidebar-link-inactive"
                    )}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* User + Logout */}
            <div className="border-t border-white/5 p-3">
              {employee && (
                <div className="mb-2 flex items-center gap-3 rounded-md px-3 py-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tertiary/20 text-sm font-semibold text-tertiary">
                    {employee.first_name.charAt(0)}
                    {employee.last_name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {employee.first_name} {employee.last_name}
                    </p>
                    <p className="text-xs text-sidebar-text">
                      {isAdmin ? "Administrator" : "Mitarbeiter"}
                    </p>
                  </div>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="sidebar-link-inactive w-full"
              >
                <LogOut size={18} />
                Abmelden
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay für mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Hauptbereich */}
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}