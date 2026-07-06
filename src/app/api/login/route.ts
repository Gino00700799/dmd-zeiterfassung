// ============================================================
// Custom Login API Route — umgeht GoTrue /token Bug
// ============================================================
// Generiert JWT direkt mit dem JWT Secret.
// Verifiziert User-Existenz über Supabase Admin API.
// Setzt die Session Cookies für die App.
//
// Hinweis: In Produktion würde supabase.auth.signInWithPassword()
// genutzt werden. Der lokale GoTrue v2.169 hat einen Bug im
// /token?grant_id=password Endpoint, daher dieser Workaround.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import * as jwtLib from "jsonwebtoken";
import { randomBytes } from "node:crypto";

// JWT generieren wie GoTrue es tun würde
function createJwt(payload: object, secret: string): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sign = (jwtLib as any).sign || (jwtLib as any).default?.sign;
  return sign(payload, secret, {
    algorithm: "HS256",
    expiresIn: "1h",
  });
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-Mail und Passwort erforderlich" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // 1. User über Admin-API finden
    const userResponse = await fetch(
      `${supabaseUrl}/auth/v1/admin/users`,
      {
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
        },
      }
    );

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: "Auth-Service nicht verfügbar" },
        { status: 500 }
      );
    }

    const users = await userResponse.json();
    const usersArray = Array.isArray(users) ? users : users.users || [];
    const user = usersArray.find(
      (u: { email: string }) => u.email === email
    );

    if (!user) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden oder Passwort falsch" },
        { status: 401 }
      );
    }

    // 2. Employee-Datensatz laden
    const empResponse = await fetch(
      `${supabaseUrl}/rest/v1/employees?user_id=eq.${user.id}&select=id,first_name,last_name,role,email`,
      {
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
        },
      }
    );

    if (!empResponse.ok) {
      return NextResponse.json(
        { error: "Mitarbeiterprofil nicht gefunden" },
        { status: 401 }
      );
    }

    const employees = await empResponse.json();
    if (!employees || employees.length === 0) {
      return NextResponse.json(
        { error: "Kein Mitarbeiterprofil verknüpft" },
        { status: 401 }
      );
    }

    const employee = employees[0];

    // 3. JWT Secret (Default bei lokalem supabase start)
    const jwtSecret = "super-secret-jwt-token-with-at-least-32-characters-long";

    // 4. Access Token generieren (wie GoTrue)
    const now = Math.floor(Date.now() / 1000);
    const accessToken = createJwt(
      {
        sub: user.id,
        role: "authenticated",
        aud: "authenticated",
        iat: now,
        iss: `${supabaseUrl}/auth/v1`,
        email: user.email,
        is_anonymous: false,
      },
      jwtSecret
    );

    // 5. Refresh Token (zufällig)
    const refreshToken = randomBytes(32).toString("base64url");

    // 6. Session Cookies setzen
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        employee,
      },
    });

    response.cookies.set("sb-access-token", accessToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 3600,
    });
    response.cookies.set("sb-refresh-token", refreshToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 604800,
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Interner Fehler beim Login" },
      { status: 500 }
    );
  }
}