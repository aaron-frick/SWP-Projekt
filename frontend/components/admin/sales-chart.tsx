"use client";

// T-US-ADMIN-05-02: Chart Komponente (Line / Bar)
// Reines SVG ohne externe Abhängigkeiten.

export interface ChartDataPoint {
  label: string;
  revenue: number;
  orders: number;
}

type ChartMode = "line" | "bar";
type ChartMetric = "revenue" | "orders";

interface SalesChartProps {
  data: ChartDataPoint[];
  mode?: ChartMode;
  metric?: ChartMetric;
  loading?: boolean;
}

const W = 600;
const H = 200;
const PAD = { top: 16, right: 16, bottom: 32, left: 52 };
const INNER_W = W - PAD.left - PAD.right;
const INNER_H = H - PAD.top - PAD.bottom;

function formatLabel(label: string): string {
  // day: 2024-03-15 → 15.03
  if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
    const [, m, d] = label.split("-");
    return `${d}.${m}`;
  }
  // week: 2024-W12 → W12
  if (/^\d{4}-W\d+$/.test(label)) return label.split("-")[1];
  // month: 2024-03 → Mär
  if (/^\d{4}-\d{2}$/.test(label)) {
    const months = ["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"];
    const idx = parseInt(label.split("-")[1]) - 1;
    return months[idx] ?? label;
  }
  return label;
}

export function SalesChart({ data, mode = "bar", metric = "revenue", loading }: SalesChartProps) {
  if (loading) {
    return (
      <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm p-5">
        <div className="h-52 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm p-5 flex items-center justify-center h-52">
        <p className="text-sm text-gray-400">Keine Daten vorhanden.</p>
      </div>
    );
  }

  const values = data.map((d) => d[metric]);
  const maxVal = Math.max(...values, 1);
  const minVal = 0;

  function xPos(i: number): number {
    return PAD.left + (i / (data.length - 1 || 1)) * INNER_W;
  }
  function yPos(v: number): number {
    return PAD.top + INNER_H - ((v - minVal) / (maxVal - minVal)) * INNER_H;
  }

  // Y-axis ticks
  const tickCount = 4;
  const yTicks = Array.from({ length: tickCount + 1 }, (_, i) =>
    minVal + (maxVal - minVal) * (i / tickCount)
  );

  const formatValue = (v: number) =>
    metric === "revenue"
      ? v >= 1000 ? `€${(v / 1000).toFixed(1)}k` : `€${v.toFixed(0)}`
      : String(Math.round(v));

  return (
    <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm p-5">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: "200px" }}
        aria-label="Umsatz-Chart"
      >
        {/* Grid lines */}
        {yTicks.map((tick) => {
          const y = yPos(tick);
          return (
            <g key={tick}>
              <line
                x1={PAD.left} y1={y} x2={PAD.left + INNER_W} y2={y}
                stroke="#e5e7eb" strokeWidth={1}
              />
              <text
                x={PAD.left - 6} y={y + 4}
                textAnchor="end" fontSize={10} fill="#9ca3af"
              >
                {formatValue(tick)}
              </text>
            </g>
          );
        })}

        {/* X axis labels – show max 8 labels to avoid crowding */}
        {data.map((d, i) => {
          const step = Math.max(1, Math.floor(data.length / 8));
          if (i % step !== 0 && i !== data.length - 1) return null;
          return (
            <text
              key={i}
              x={mode === "bar"
                ? PAD.left + (i + 0.5) * (INNER_W / data.length)
                : xPos(i)}
              y={H - 6}
              textAnchor="middle" fontSize={9} fill="#9ca3af"
            >
              {formatLabel(d.label)}
            </text>
          );
        })}

        {mode === "bar" ? (
          /* Bar chart */
          <>
            {data.map((d, i) => {
              const barW = Math.max(2, INNER_W / data.length - 2);
              const x = PAD.left + i * (INNER_W / data.length) + (INNER_W / data.length - barW) / 2;
              const barH = ((d[metric] - minVal) / (maxVal - minVal)) * INNER_H;
              const y = PAD.top + INNER_H - barH;
              return (
                <rect
                  key={i} x={x} y={y} width={barW} height={barH}
                  rx={3} fill="#6366f1" opacity={0.85}
                >
                  <title>{formatLabel(d.label)}: {formatValue(d[metric])}</title>
                </rect>
              );
            })}
          </>
        ) : (
          /* Line chart */
          <>
            {/* Gradient fill */}
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Area fill */}
            <path
              d={[
                `M ${xPos(0)} ${PAD.top + INNER_H}`,
                ...data.map((d, i) => `L ${xPos(i)} ${yPos(d[metric])}`),
                `L ${xPos(data.length - 1)} ${PAD.top + INNER_H}`,
                "Z",
              ].join(" ")}
              fill="url(#lineGrad)"
            />

            {/* Line */}
            <polyline
              points={data.map((d, i) => `${xPos(i)},${yPos(d[metric])}`).join(" ")}
              fill="none" stroke="#6366f1" strokeWidth={2} strokeLinejoin="round"
            />

            {/* Dots */}
            {data.map((d, i) => (
              <circle key={i} cx={xPos(i)} cy={yPos(d[metric])} r={3}
                fill="white" stroke="#6366f1" strokeWidth={2}>
                <title>{formatLabel(d.label)}: {formatValue(d[metric])}</title>
              </circle>
            ))}
          </>
        )}
      </svg>
    </div>
  );
}
