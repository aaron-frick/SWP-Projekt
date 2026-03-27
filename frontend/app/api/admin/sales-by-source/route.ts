// T-US-ADMIN-02-02: API/Query – Sales nach Herkunft aggregieren
// Liest orders aus Supabase und aggregiert Umsatz & Bestellanzahl pro Source.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = Number(searchParams.get("days") ?? "30");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from("orders")
    .select("source, total")
    .gte("created_at", since.toISOString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Aggregation: Umsatz & Anzahl pro Source (T-US-ADMIN-02-02)
  const map = new Map<string, { revenue: number; count: number }>();
  for (const row of data ?? []) {
    const src = row.source ?? "direct";
    const existing = map.get(src) ?? { revenue: 0, count: 0 };
    map.set(src, {
      revenue: existing.revenue + Number(row.total),
      count: existing.count + 1,
    });
  }

  const result = Array.from(map.entries())
    .map(([source, { revenue, count }]) => ({ source, revenue, count }))
    .sort((a, b) => b.revenue - a.revenue);

  return NextResponse.json({ data: result });
}
