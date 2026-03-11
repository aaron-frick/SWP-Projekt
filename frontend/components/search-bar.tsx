"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

interface SearchBarProps {
  defaultValue?: string;
}

/**
 * Debounced search input with URL-sync and controlled state.
 * - 300 ms debounce prevents excessive navigations on every keystroke
 * - Controlled input so the field stays in sync when the URL changes externally
 *   (e.g. browser back-button clears the search param)
 */
export function SearchBar({ defaultValue = "" }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [value, setValue] = useState(defaultValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep input in sync when URL changes externally (e.g. browser back button)
  useEffect(() => {
    setValue(searchParams.get("search") ?? "");
  }, [searchParams]);

  function commitSearch(term: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (term.trim()) {
      params.set("search", term.trim());
    } else {
      params.delete("search");
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setValue(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => commitSearch(next), 300);
  }

  function handleClear() {
    setValue("");
    if (timerRef.current) clearTimeout(timerRef.current);
    commitSearch("");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (timerRef.current) clearTimeout(timerRef.current);
    commitSearch(value);
  }

  return (
    <form onSubmit={handleSubmit} className="relative" role="search">
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder="Produkte suchen (Name, SKU)…"
        aria-label="Produkte suchen"
        className="w-full glass rounded-xl px-4 py-3 pl-11 pr-10 text-sm text-gray-900
          placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
      />

      {value && !isPending && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Suche löschen"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400
            hover:text-gray-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {isPending && (
        <div
          aria-label="Suche lädt…"
          className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin
            rounded-full border-2 border-gray-200 border-t-gray-600"
        />
      )}
    </form>
  );
}
