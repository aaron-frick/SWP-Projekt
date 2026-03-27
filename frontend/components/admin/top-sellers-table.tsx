"use client";

// T-US-ADMIN-03-03: Dashboard Ansicht – Top-Seller Liste

export interface TopSellerRow {
  slug: string;
  name: string;
  quantity: number;
  revenue: number;
}

interface TopSellersTableProps {
  rows: TopSellerRow[];
  loading?: boolean;
}

export function TopSellersTable({ rows, loading }: TopSellersTableProps) {
  const maxRevenue = rows.length > 0 ? rows[0].revenue : 1;

  return (
    <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm p-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Top-Seller</h2>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">Keine Daten vorhanden.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((row, idx) => (
            <div key={row.slug} className="flex items-center gap-3">
              {/* Rang */}
              <span className="flex-shrink-0 w-6 text-xs font-bold text-gray-400 text-right">
                {idx + 1}
              </span>

              {/* Produktname + Progress-Bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800 truncate">{row.name}</span>
                  <span className="flex-shrink-0 text-xs text-gray-500 ml-2">
                    {row.quantity} Stk · €{row.revenue.toFixed(2)}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${(row.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
