"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";

const PRICE_RANGES = [
  { value: "0-10",  label: "Unter 10 €" },
  { value: "10-20", label: "10 – 20 €" },
  { value: "20-30", label: "20 – 30 €" },
  { value: "30+",   label: "Über 30 €" },
];

interface PriceFilterProps {
  current?: string;
}

export function PriceFilter({ current }: PriceFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleClick(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (current === value) {
      params.delete("price");
    } else {
      params.set("price", value);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-400">Preis:</span>
      {PRICE_RANGES.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => handleClick(value)}
          disabled={isPending}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            current === value
              ? "bg-gray-900 text-white"
              : "glass text-gray-600 hover:text-gray-900"
          }`}
        >
          {label}
        </button>
      ))}
      {current && (
        <button
          onClick={() => handleClick(current)}
          disabled={isPending}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          × zurücksetzen
        </button>
      )}
    </div>
  );
}
