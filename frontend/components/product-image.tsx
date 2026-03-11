"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductImageProps {
  src: string | null;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
}

const PLACEHOLDER_GRADIENTS = [
  "from-violet-400 to-purple-600",
  "from-blue-400 to-cyan-600",
  "from-emerald-400 to-teal-600",
  "from-amber-400 to-orange-600",
  "from-rose-400 to-pink-600",
  "from-indigo-400 to-blue-600",
  "from-lime-400 to-green-600",
  "from-fuchsia-400 to-violet-600",
];

function getGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PLACEHOLDER_GRADIENTS[Math.abs(hash) % PLACEHOLDER_GRADIENTS.length];
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Product image component with fallback placeholder.
 * Handles missing images and loading errors gracefully.
 */
export function ProductImage({
  src,
  alt,
  className = "",
  fill = true,
  width,
  height,
  priority = false,
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    const gradient = getGradient(alt);
    const initials = getInitials(alt);
    return (
      <div
        className={`flex flex-col items-center justify-center bg-linear-to-br ${gradient} ${className}`}
        style={!fill ? { width, height } : undefined}
      >
        <span className="text-white font-bold text-4xl drop-shadow select-none">
          {initials}
        </span>
        <svg
          className="w-6 h-6 text-white/40 mt-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      priority={priority}
      onError={() => setHasError(true)}
      sizes={fill ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined}
    />
  );
}
