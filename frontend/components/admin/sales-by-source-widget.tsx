"use client";

// T-US-ADMIN-02-03: Dashboard Widget – Sales nach Herkunft

export interface SourceRow {
  source: string;
  revenue: number;
  count: number;
}

interface SalesBySourceWidgetProps {
  rows: SourceRow[];
  loading?: boolean;
}

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  google:     { label: "Google",     color: "bg-blue-500" },
  instagram:  { label: "Instagram",  color: "bg-pink-500" },
  facebook:   { label: "Facebook",   color: "bg-indigo-500" },
  newsletter: { label: "Newsletter", color: "bg-amber-500" },
  direct:     { label: "Direkt",     color: "bg-emerald-500" },
};

function getSource(key: string) {
  return SOURCE_LABELS[key] ?? { label: key, color: "bg-gray-400" };
}

export function SalesBySourceWidget({ rows, loading }: SalesBySourceWidgetProps) {
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0) || 1;

  return (
    <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm p-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Umsatz nach Herkunft</h2>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">Keine Daten vorhanden.</p>
      ) : (
        <>
          {/* Stacked bar */}
          <div className="flex h-3 rounded-full overflow-hidden mb-5 gap-0.5">
            {rows.map((row) => {
              const pct = (row.revenue / totalRevenue) * 100;
              const { color } = getSource(row.source);
              return (
                <div
                  key={row.source}
                  className={`${color} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                  title={`${getSource(row.source).label}: €${row.revenue.toFixed(2)}`}
                />
              );
            })}
          </div>

          {/* Legende + Werte */}
          <div className="space-y-2.5">
            {rows.map((row) => {
              const { label, color } = getSource(row.source);
              const pct = ((row.revenue / totalRevenue) * 100).toFixed(1);
              return (
                <div key={row.source} className="flex items-center gap-2.5">
                  <span className={`flex-shrink-0 w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="flex-1 text-sm text-gray-700">{label}</span>
                  <span className="text-xs text-gray-400">{row.count} Bestellungen</span>
                  <span className="text-sm font-medium text-gray-800 w-20 text-right">
                    €{row.revenue.toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-400 w-10 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
