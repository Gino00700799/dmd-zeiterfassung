// Login-Seite – E-Mail/Passwort via Supabase Auth
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { Building2, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sidebar-bg px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-tertiary text-on-tertiary shadow-lg">
            <Building2 size={28} />
          </div>
          <h1 className="text-2xl font-bold text-white">DMD Studio GmbH</h1>
          <p className="mt-1 text-sm text-sidebar-text">
            Projektzeiterfassung &amp; Projekt-Controlling
          </p>
        </div>

        {/* Login Card */}
        <div className="card-elevated animate-slide-up">
          <h2 className="mb-6 text-lg font-semibold text-text-primary">
            Anmeldung
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">
                E-Mail
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  id="email"
                  type="email"
                  className="input pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="name@dmd-studio.de"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="password">
                Passwort
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  id="password"
                  type="password"
                  className="input pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-danger">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-on-tertiary/30 border-t-on-tertiary" />
                  Anmeldung…
                </>
              ) : (
                "Anmelden"
              )}
            </button>
          </form>

          {/* Test-Zugänge */}
          <div className="mt-6 rounded-md border border-border bg-neutral px-3 py-3">
            <p className="text-label-caps font-semibold uppercase tracking-wider text-text-muted">
              Test-Zugänge
            </p>
            <div className="mt-2 space-y-1 text-xs text-text-secondary">
              <p>
                <span className="font-medium text-text-primary">Mitarbeiter:</span>{" "}
                anna.schmidt@dmd-studio.de · test1234
              </p>
              <p>
                <span className="font-medium text-text-primary">Administrator:</span>{" "}
                julia.hofmann@dmd-studio.de · test1234
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-sidebar-text/60">
          Prototyp · Projektarbeit Technikerschule SBSZ Bamberg
        </p>
      </div>
    </div>
  );
}