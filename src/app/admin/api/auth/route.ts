import { NextRequest, NextResponse } from "next/server";

const ADMIN_SECRET = "af-admin-2024-xK9mP2vQ8nR5";

export async function POST(req: NextRequest) {
  try {
    const { email, secret } = await req.json();

    if (secret === ADMIN_SECRET && email) {
      const response = NextResponse.json({ ok: true, email });
      response.cookies.set("admin_token", ADMIN_SECRET, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }

    return NextResponse.json(
      { ok: false, error: "Invalid credentials" },
      { status: 401 },
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Request failed" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (token === ADMIN_SECRET) {
    return NextResponse.json({ ok: true, authenticated: true });
  }
  return NextResponse.json(
    { ok: false, authenticated: false },
    { status: 401 },
  );
}
