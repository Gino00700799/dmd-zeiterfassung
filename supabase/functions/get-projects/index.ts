// ============================================================
// Edge Function: get-projects
// Gesicherte Schnittstelle zum Lesen von Kunden- und Projektdaten
// ============================================================
// Aufruf:  GET /functions/v1/get-projects
// Auth:    JWT-Pflicht (verify_jwt = true in config.toml)
// Rückgabe: JSON-Array aller aktiven Kunden mit ihren Projekten
// Verwendung: Stammdaten-Sync aus dem bestehenden Verwaltungssystem
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

Deno.serve(async (req: Request) => {
  // CORS-Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Supabase-Client mit Service-Role-Key (bypasses RLS für Lesesicht)
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabase = createClient(supabaseUrl, serviceKey);

  // Kunden laden
  const { data: customers, error: custErr } = await supabase
    .from("customers")
    .select("id, name, email, city, active")
    .eq("active", true)
    .order("name");

  if (custErr) {
    return new Response(
      JSON.stringify({ error: "Failed to load customers", detail: custErr.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Projekte laden
  const { data: projects, error: projErr } = await supabase
    .from("projects")
    .select("id, customer_id, name, status, budget_hours, hourly_rate, start_date, end_date")
    .in("status", ["planned", "active"])
    .order("name");

  if (projErr) {
    return new Response(
      JSON.stringify({ error: "Failed to load projects", detail: projErr.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Kunden mit Projekten anreichern
  const result = customers.map((c) => ({
    ...c,
    projects: projects.filter((p) => p.customer_id === c.id),
  }));

  return new Response(JSON.stringify({ customers: result }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});