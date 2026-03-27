"use client";

// Admin Dashboard – Hauptseite
// Aggregiert alle US-ADMIN-02 bis US-ADMIN-05 Widgets.

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { KpiTile } from "@/components/admin/kpi-tile";
import { TopSellersTable, type TopSellerRow } from "@/components/admin/top-sellers-table";
import { SalesBySourceWidget, type SourceRow } from "@/components/admin/sales-by-source-widget";
import { SalesChart, type ChartDataPoint } from "@/components/admin/sales-chart";
import {
  TimeRangeSelector,
  type TimeRange,
  type Granularity,
} from "@/components/admin/time-range-selector";

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconBox() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
    </svg>
  );
}
function IconCurrency() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function IconShoppingCart() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}
function IconChartBar() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProductStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { user, loading, isAdmin, signOut } = useAuth();
  const router = useRouter();

  // Zeitraum-State (T-US-ADMIN-05-03)
  const [days, setDays] = useState<TimeRange>(30);
  const [granularity, setGranularity] = useState<Granularity>("day");
  const [chartMetric, setChartMetric] = useState<"revenue" | "orders">("revenue");
  const [chartMode, setChartMode] = useState<"line" | "bar">("bar");

  // Daten-State
  const [productStats, setProductStats] = useState<ProductStats | null>(null);
  const [topSellers, setTopSellers] = useState<TopSellerRow[]>([]);
  const [sourceRows, setSourceRows] = useState<SourceRow[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // Loading-States
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingTopSellers, setLoadingTopSellers] = useState(true);
  const [loadingSource, setLoadingSource] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);

  // T-US-ADMIN-01-03: Route-Guard – muss vor allen anderen Effects stehen, aber nach allen Hooks
  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/admin/login");
    else if (!isAdmin) router.replace("/");
  }, [user, loading, isAdmin, router]);

  // Produkt-KPIs laden (einmalig, T-US-ADMIN-04-02/03)
  useEffect(() => {
    if (!isAdmin) return;
    fetch("/api/admin/product-stats")
      .then((r) => r.json())
      .then((json) => setProductStats(json.data ?? null))
      .finally(() => setLoadingProducts(false));
  }, [isAdmin]);

  // Zeitraum-abhängige Daten laden (T-US-ADMIN-03, 02-02, 05-01)
  const fetchTimedData = useCallback(async () => {
    setLoadingTopSellers(true);
    setLoadingSource(true);
    setLoadingChart(true);

    const [sellersRes, sourceRes, chartRes] = await Promise.all([
      fetch(`/api/admin/top-sellers?days=${days}`),
      fetch(`/api/admin/sales-by-source?days=${days}`),
      fetch(`/api/admin/sales-over-time?days=${days}&granularity=${granularity}`),
    ]);

    const [sellers, source, chart] = await Promise.all([
      sellersRes.json(),
      sourceRes.json(),
      chartRes.json(),
    ]);

    setTopSellers(sellers.data ?? []);
    setSourceRows(source.data ?? []);
    setChartData(chart.data ?? []);
    setLoadingTopSellers(false);
    setLoadingSource(false);
    setLoadingChart(false);
  }, [days, granularity]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchTimedData();
  }, [fetchTimedData, isAdmin]);

  // Aggregierte KPIs aus den Daten
  const totalRevenue = sourceRows.reduce((s, r) => s + r.revenue, 0);
  const totalOrders = sourceRows.reduce((s, r) => s + r.count, 0);

  async function handleSignOut() {
    await signOut();
    router.replace("/admin/login");
  }

  // Guard-Render – nach allen Hooks
  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Healthshop Verwaltung · {user?.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900
                     bg-white/70 border border-gray-200 rounded-xl transition-colors"
        >
          Abmelden
        </button>
      </div>

      {/* KPI Kacheln – T-US-ADMIN-04-03 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiTile
          label="Gesamtumsatz"
          value={loadingSource ? "–" : `€${totalRevenue.toFixed(2)}`}
          sub={`letzte ${days} Tage`}
          icon={<IconCurrency />}
          color="emerald"
        />
        <KpiTile
          label="Bestellungen"
          value={loadingSource ? "–" : totalOrders}
          sub={`letzte ${days} Tage`}
          icon={<IconShoppingCart />}
          color="indigo"
        />
        <KpiTile
          label="Produkte (gesamt)"
          value={loadingProducts ? "–" : (productStats?.total ?? "–")}
          sub={loadingProducts ? "" : `${productStats?.published ?? 0} published`}
          icon={<IconBox />}
          color="sky"
        />
        <KpiTile
          label="Aktive Produkte"
          value={loadingProducts ? "–" : (productStats?.published ?? "–")}
          sub={loadingProducts ? "" : `${productStats?.draft ?? 0} Entwürfe`}
          icon={<IconCheck />}
          color="amber"
        />
      </div>

      {/* Zeitraum & Granularität – T-US-ADMIN-05-03 */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <TimeRangeSelector
          days={days}
          granularity={granularity}
          onDaysChange={setDays}
          onGranularityChange={setGranularity}
        />

        {/* Chart-Optionen */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-xl p-0.5 gap-0.5">
            {(["revenue", "orders"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setChartMetric(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  chartMetric === m
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {m === "revenue" ? "Umsatz" : "Bestellungen"}
              </button>
            ))}
          </div>
          <div className="flex items-center bg-gray-100 rounded-xl p-0.5 gap-0.5">
            {(["bar", "line"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setChartMode(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  chartMode === m
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {m === "bar" ? "Balken" : "Linie"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart – T-US-ADMIN-05-01/02 */}
      <div className="mb-6">
        <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">
              {chartMetric === "revenue" ? "Umsatz" : "Bestellungen"} über Zeit
            </h2>
          </div>
          <SalesChart
            data={chartData}
            mode={chartMode}
            metric={chartMetric}
            loading={loadingChart}
          />
        </div>
      </div>

      {/* Bottom Grid: Top-Seller + Herkunft */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* T-US-ADMIN-03-03 */}
        <TopSellersTable rows={topSellers} loading={loadingTopSellers} />

        {/* T-US-ADMIN-02-03 */}
        <SalesBySourceWidget rows={sourceRows} loading={loadingSource} />
      </div>
    </div>
  );
}
