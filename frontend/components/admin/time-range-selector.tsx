"use client";

// T-US-ADMIN-05-03: Dashboard – Zeitraum & Granularität Auswahl

export type TimeRange = 7 | 14 | 30 | 90;
export type Granularity = "day" | "week" | "month";

interface TimeRangeSelectorProps {
  days: TimeRange;
  granularity: Granularity;
  onDaysChange: (days: TimeRange) => void;
  onGranularityChange: (g: Granularity) => void;
}

const RANGES: { value: TimeRange; label: string }[] = [
  { value: 7,  label: "7 Tage" },
  { value: 14, label: "14 Tage" },
  { value: 30, label: "30 Tage" },
  { value: 90, label: "90 Tage" },
];

const GRANULARITIES: { value: Granularity; label: string }[] = [
  { value: "day",   label: "Tag" },
  { value: "week",  label: "Woche" },
  { value: "month", label: "Monat" },
];

export function TimeRangeSelector({
  days,
  granularity,
  onDaysChange,
  onGranularityChange,
}: TimeRangeSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Zeitraum-Buttons */}
      <div className="flex items-center bg-gray-100 rounded-xl p-0.5 gap-0.5">
        {RANGES.map((r) => (
          <button
            key={r.value}
            onClick={() => onDaysChange(r.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              days === r.value
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Granularitäts-Buttons */}
      <div className="flex items-center bg-gray-100 rounded-xl p-0.5 gap-0.5">
        {GRANULARITIES.map((g) => (
          <button
            key={g.value}
            onClick={() => onGranularityChange(g.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              granularity === g.value
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>
    </div>
  );
}
