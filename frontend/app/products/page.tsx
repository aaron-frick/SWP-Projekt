import { Suspense } from "react";
import { productService } from "@/lib/api/product-service";
import type { Product } from "@/lib/types/product";
import { ProductCard } from "@/components/product-card";
import { GlassCard } from "@/components/glass-card";
import { SearchBar } from "@/components/search-bar";
import { AvailabilityFilter } from "@/components/availability-filter";
import { PriceFilter } from "@/components/price-filter";

const PRICE_RANGE_LABELS: Record<string, string> = {
  "0-10":  "Unter 10 €",
  "10-20": "10 – 20 €",
  "20-30": "20 – 30 €",
  "30+":   "Über 30 €",
};

function filterByPrice(products: Product[], range?: string): Product[] {
  if (!range) return products;
  return products.filter((p) => {
    const price = typeof p.price === "number" ? p.price : parseFloat(String(p.price));
    if (isNaN(price)) return false;
    if (range === "0-10")  return price < 10;
    if (range === "10-20") return price >= 10 && price < 20;
    if (range === "20-30") return price >= 20 && price < 30;
    if (range === "30+")   return price >= 30;
    return true;
  });
}

/**
 * Product listing page – Apple Liquid Glass design.
 */
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; availability?: string; price?: string }>;
}) {
  const { search, availability, price } = await searchParams;

  let allProducts: Product[] = [];
  let error: string | null = null;

  try {
    allProducts = await productService.getAll({ search });
  } catch (err) {
    error =
      err instanceof Error ? err.message : "Produkte konnten nicht geladen werden.";
  }

  const afterAvailability = availability
    ? allProducts.filter((p) => p.availability === availability)
    : allProducts;

  const products = filterByPrice(afterAvailability, price);

  const availabilityOptions = [
    ...new Set(allProducts.map((p) => p.availability).filter(Boolean)),
  ] as string[];

  const activeFilters = [
    search && `„${search}"`,
    availability && (availability === "in_stock" ? "Auf Lager" : availability === "low_stock" ? "Wenig Lager" : availability),
    price && PRICE_RANGE_LABELS[price],
  ].filter(Boolean);

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      {/* Header */}
      <div className="mb-10 animate-fade-in-up">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Unsere Produkte
        </h1>
        <p className="mt-3 text-lg text-gray-400 font-light">
          Stöbere durch unser Sortiment und finde genau das Richtige.
        </p>
      </div>

      {/* Search & Filter */}
      {!error && (
        <div className="mb-8 space-y-3 animate-fade-in-up">
          <Suspense>
            <SearchBar defaultValue={search} />
          </Suspense>
          <Suspense>
            <PriceFilter current={price} />
          </Suspense>
          {availabilityOptions.length > 0 && (
            <Suspense>
              <AvailabilityFilter options={availabilityOptions} current={availability} />
            </Suspense>
          )}
        </div>
      )}

      {/* Result count */}
      {!error && activeFilters.length > 0 && (
        <p className="mb-4 text-sm text-gray-400">
          {products.length} Produkt{products.length !== 1 ? "e" : ""} gefunden
          {` · ${activeFilters.join(" · ")}`}
        </p>
      )}

      {/* Error State */}
      {error && (
        <GlassCard className="p-8 text-center">
          <p className="text-red-500">{error}</p>
          <p className="mt-2 text-sm text-gray-400">
            Bitte stelle sicher, dass der Backend-Server läuft.
          </p>
        </GlassCard>
      )}

      {/* Empty State */}
      {!error && products.length === 0 && (
        <GlassCard className="p-12 text-center">
          <p className="text-xl text-gray-400">
            {activeFilters.length > 0
              ? "Keine Produkte für diese Filter gefunden."
              : "Keine Produkte gefunden."}
          </p>
        </GlassCard>
      )}

      {/* Product Grid */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 stagger-children">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
