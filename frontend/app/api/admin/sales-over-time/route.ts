// T-US-ADMIN-05-01: Aggregation – Umsatz/Bestellungen über Zeit
// Gibt Umsatz & Bestellanzahl pro Zeiteinheit (day | week | month) zurück.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Granularity = "day" | "week" | "month";

function getBucketKey(date: Date, granularity: Granularity): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  if (granularity === "day") return `${y}-${m}-${d}`;
  if (granularity === "month") return `${y}-${m}`;

  // week: ISO week number
  const jan1 = new Date(y, 0, 1);
  const week = Math.ceil(((date.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  return `${y}-W${String(week).padStart(2, "0")}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = Number(searchParams.get("days") ?? "30");
  const granularity: Granularity =
    (searchParams.get("granularity") as Granularity) ?? "day";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from("orders")
    .select("total, created_at")
    .gte("created_at", since.toISOString())
    .order("created_at");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Aggregation nach Zeiteinheit
  const map = new Map<string, { revenue: number; orders: number }>();

  for (const row of data ?? []) {
    const key = getBucketKey(new Date(row.created_at), granularity);
    const existing = map.get(key) ?? { revenue: 0, orders: 0 };
    map.set(key, {
      revenue: existing.revenue + Number(row.total),
      orders: existing.orders + 1,
    });
  }

  const result = Array.from(map.entries())
    .map(([label, { revenue, orders }]) => ({ label, revenue, orders }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return NextResponse.json({ data: result });
}
