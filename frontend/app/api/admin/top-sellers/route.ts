// T-US-ADMIN-03-01/02: Sales-Items aus Bestellungen ableiten & aggregieren
// Expandiert JSONB items-Array aus orders und summiert Menge + Umsatz pro Produkt.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface OrderItem {
  product_slug: string;
  product_name: string;
  price: number;
  quantity: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = Number(searchParams.get("days") ?? "30");
  const limit = Number(searchParams.get("limit") ?? "10");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from("orders")
    .select("items")
    .gte("created_at", since.toISOString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // T-US-ADMIN-03-01: Items aus Bestellungen ableiten
  // T-US-ADMIN-03-02: Aggregation Menge & Umsatz pro Produkt
  const map = new Map<string, { name: string; quantity: number; revenue: number }>();

  for (const order of data ?? []) {
    const items: OrderItem[] = Array.isArray(order.items) ? order.items : [];
    for (const item of items) {
      const key = item.product_slug;
      const existing = map.get(key) ?? { name: item.product_name, quantity: 0, revenue: 0 };
      map.set(key, {
        name: item.product_name,
        quantity: existing.quantity + item.quantity,
        revenue: existing.revenue + item.price * item.quantity,
      });
    }
  }

  const result = Array.from(map.entries())
    .map(([slug, { name, quantity, revenue }]) => ({ slug, name, quantity, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);

  return NextResponse.json({ data: result });
}
