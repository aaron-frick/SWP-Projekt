interface AvailabilityBadgeProps {
  availability: string;
}

const AVAILABILITY_MAP: Record<string, { label: string; color: string }> = {
  in_stock:     { label: "Auf Lager",      color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  low_stock:    { label: "Wenig Lager",    color: "bg-amber-100 text-amber-700 border-amber-200" },
  out_of_stock: { label: "Nicht verfügbar", color: "bg-red-100 text-red-700 border-red-200" },
};

/**
 * Stock status badge – maps Directus values to German labels.
 */
export function AvailabilityBadge({ availability }: AvailabilityBadgeProps) {
  const key = availability.toLowerCase().replace(/[\s-]/g, "_");
  const config = AVAILABILITY_MAP[key];

  const label = config?.label ?? availability;
  const color = config?.color ?? "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1
        text-xs font-medium ${color}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
