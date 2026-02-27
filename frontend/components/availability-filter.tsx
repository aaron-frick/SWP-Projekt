"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";

interface AvailabilityFilterProps {
  options: string[];
  current?: string;
}

export function AvailabilityFilter({ options, current }: AvailabilityFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  if (options.length === 0) return null;

  function handleClick(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (current === value) {
      params.delete("availability");
    } else {
      params.set("availability", value);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-white/40">Verfügbarkeit:</span>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => handleClick(opt)}
          disabled={isPending}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all border
            ${
              current === opt
                ? "bg-white/20 text-white border-white/30"
                : "bg-white/5 text-white/50 border-white/10 hover:border-white/20 hover:text-white/70"
            }`}
        >
          {opt}
        </button>
      ))}
      {current && (
        <button
          onClick={() => handleClick(current)}
          disabled={isPending}
          className="text-sm text-white/30 hover:text-white/60 transition-colors"
        >
          × zurücksetzen
        </button>
      )}
    </div>
  );
}
