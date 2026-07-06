// ============================================================
// Supabase-Clients (Browser + Server) via @supabase/ssr
// ============================================================

import { createBrowserClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Browser-Client für Client Components.
 * Liest NEXT_PUBLIC_* Env-Vars.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Server-Client für Server Components / Route Handlers.
 * Next.js 15: cookies() ist async und gibt ein Promise zurück.
 */
export async function createServerClient() {
  const cookieStore = await cookies();
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // In Server Components ist der Cookie-Store read-only.
            // Das Session-Refresh erfolgt in der Middleware.
          }
        },
      },
    }
  );
}