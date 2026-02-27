import { Suspense } from "react";
import { productService } from "@/lib/api/product-service";
import type { Product } from "@/lib/types/product";
import { ProductCard } from "@/components/product-card";
import { GlassCard } from "@/components/glass-card";
import { SearchBar } from "@/components/search-bar";
import { AvailabilityFilter } from "@/components/availability-filter";

/**
 * Product listing page.
 * Server component – fetches products from the backend API.
 * Supports search via ?search= and availability filter via ?availability=.
 */
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; availability?: string }>;
}) {
  const { search, availability } = await searchParams;

  let allProducts: Product[] = [];
  let error: string | null = null;

  try {
    allProducts = await productService.getAll({ search });
  } catch (err) {
    error =
      err instanceof Error ? err.message : "Produkte konnten nicht geladen werden.";
  }

  // Apply availability filter locally from already-fetched products
  const products = availability
    ? allProducts.filter((p) => p.availability === availability)
    : allProducts;

  // Collect unique availability values for filter buttons
  const availabilityOptions = [
    ...new Set(allProducts.map((p) => p.availability).filter(Boolean)),
  ] as string[];

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      {/* Header */}
      <div className="mb-12 animate-fade-in-up">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
            Unsere Produkte
          </span>
        </h1>
        <p className="mt-4 text-lg text-white/40">
          Stöbere durch unser Sortiment und finde genau das Richtige.
        </p>
      </div>

      {/* Search & Filter */}
      {!error && (
        <div className="mb-8 space-y-4 animate-fade-in-up">
          <Suspense>
            <SearchBar defaultValue={search} />
          </Suspense>
          {availabilityOptions.length > 0 && (
            <Suspense>
              <AvailabilityFilter
                options={availabilityOptions}
                current={availability}
              />
            </Suspense>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <GlassCard className="p-8 text-center">
          <p className="text-red-300">{error}</p>
          <p className="mt-2 text-sm text-white/40">
            Bitte stelle sicher, dass der Backend-Server läuft.
          </p>
        </GlassCard>
      )}

      {/* Result count when filtering */}
      {!error && (search || availability) && (
        <p className="mb-4 text-sm text-white/40">
          {products.length} Produkt{products.length !== 1 ? "e" : ""} gefunden
          {search && ` für „${search}"`}
          {availability && ` · ${availability}`}
        </p>
      )}

      {/* Empty State */}
      {!error && products.length === 0 && (
        <GlassCard className="p-12 text-center">
          <p className="text-xl text-white/50">
            {search || availability
              ? "Keine Produkte für diese Suche gefunden."
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
