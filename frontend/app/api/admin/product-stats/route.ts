// T-US-ADMIN-04-02: API/Query – Produktanzahlen aggregieren
// Fragt den Express-Backend (Directus) nach Produkten und gibt KPIs zurück.

import { NextResponse } from "next/server";

export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const adminSecret = process.env.ADMIN_SECRET ?? "";

  try {
    const res = await fetch(`${apiUrl}/api/admin/product-stats`, {
      headers: { "x-admin-token": adminSecret },
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return NextResponse.json(body, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: { type: "network", message: "Backend nicht erreichbar." } },
      { status: 502 }
    );
  }
}
