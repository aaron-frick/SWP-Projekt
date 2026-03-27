"use client";

// T-US-ADMIN-04-03: Dashboard Kacheln (KPIs)

interface KpiTileProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color?: "indigo" | "emerald" | "amber" | "rose" | "sky";
}

const colorMap = {
  indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  amber: "bg-amber-50 text-amber-600 border-amber-100",
  rose: "bg-rose-50 text-rose-600 border-rose-100",
  sky: "bg-sky-50 text-sky-600 border-sky-100",
};

export function KpiTile({ label, value, sub, icon, color = "indigo" }: KpiTileProps) {
  return (
    <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm p-5 flex items-start gap-4">
      <div className={`flex-shrink-0 w-11 h-11 rounded-xl border flex items-center justify-center ${colorMap[color]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5 leading-none">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}
