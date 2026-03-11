"use client";

import { useState, useCallback, useRef } from "react";
import { ProductImage } from "@/components/product-image";
import type { ProductImage as ProductImageType } from "@/lib/types/product";

interface ImageGalleryProps {
  images: ProductImageType[];
  alt: string;
}

/**
 * Image gallery for the product detail page.
 * Slider with arrow navigation, swipe support, keyboard control and thumbnail strip.
 */
export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [animating, setAnimating] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback(
    (index: number, dir: "left" | "right") => {
      if (animating || index === selectedIndex) return;
      setDirection(dir);
      setAnimating(true);
      setSelectedIndex(index);
      setTimeout(() => setAnimating(false), 300);
    },
    [animating, selectedIndex]
  );

  const prev = useCallback(() => {
    const newIndex = (selectedIndex - 1 + images.length) % images.length;
    goTo(newIndex, "right");
  }, [selectedIndex, images.length, goTo]);

  const next = useCallback(() => {
    const newIndex = (selectedIndex + 1) % images.length;
    goTo(newIndex, "left");
  }, [selectedIndex, images.length, goTo]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    },
    [prev, next]
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      delta < 0 ? next() : prev();
    }
    touchStartX.current = null;
  };

  const current = images[selectedIndex] ?? null;
  const showControls = images.length > 1;

  const slideClass = animating
    ? direction === "left"
      ? "animate-slide-in-left"
      : "animate-slide-in-right"
    : "";

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div
        className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-white/5 outline-none"
        tabIndex={showControls ? 0 : -1}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div key={selectedIndex} className={`absolute inset-0 ${slideClass}`}>
          <ProductImage
            src={current?.url ?? null}
            alt={current?.alt ?? alt}
            priority
          />
        </div>

        {/* Arrow Buttons */}
        {showControls && (
          <>
            <button
              onClick={prev}
              aria-label="Vorheriges Bild"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10
                flex h-9 w-9 items-center justify-center rounded-full
                bg-black/30 text-white backdrop-blur-sm
                hover:bg-black/50 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={next}
              aria-label="Nächstes Bild"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10
                flex h-9 w-9 items-center justify-center rounded-full
                bg-black/30 text-white backdrop-blur-sm
                hover:bg-black/50 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Dot Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i, i > selectedIndex ? "left" : "right")}
                  aria-label={`Bild ${i + 1}`}
                  className={`rounded-full transition-all duration-200 ${
                    i === selectedIndex
                      ? "w-4 h-2 bg-white"
                      : "w-2 h-2 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, index) => (
            <button
              key={img.url ?? index}
              onClick={() => goTo(index, index > selectedIndex ? "left" : "right")}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border
                transition-all duration-200
                ${
                  index === selectedIndex
                    ? "border-white/40 ring-2 ring-white/20"
                    : "border-white/10 hover:border-white/25 opacity-60 hover:opacity-100"
                }
              `}
            >
              <ProductImage
                src={img.url}
                alt={img.alt ?? `${alt} – Bild ${index + 1}`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
