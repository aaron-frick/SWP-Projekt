import { notFound } from "next/navigation";
import Link from "next/link";
import { productService } from "@/lib/api/product-service";
import { GlassCard } from "@/components/glass-card";
import { ImageGallery } from "@/components/image-gallery";
import { PriceTag } from "@/components/price-tag";
import { AvailabilityBadge } from "@/components/availability-badge";
import { AddToCartButton } from "@/components/add-to-cart-button";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Product detail page – Apple Liquid Glass design.
 */
export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await productService.getBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 animate-fade-in-up">
        <ol className="flex items-center gap-2 text-sm text-gray-400">
          <li>
            <Link href="/" className="hover:text-gray-700 transition-colors">
              Start
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/products" className="hover:text-gray-700 transition-colors">
              Produkte
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-700 truncate max-w-xs">{product.name}</li>
        </ol>
      </nav>

      {/* Product Layout */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 animate-fade-in-up [animation-delay:0.1s]">
        {/* Left: Image Gallery */}
        <ImageGallery images={product.images} alt={product.name} />

        {/* Right: Product Info */}
        <div className="flex flex-col justify-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              {product.name}
            </h1>

          </div>

          {/* Price & Availability */}
          <div className="flex items-center gap-4 flex-wrap">
            <PriceTag price={product.price} size="lg" />
            <AvailabilityBadge availability={product.availability ?? "in_stock"} />
          </div>

          {/* Description */}
          {product.description && (
            <GlassCard className="p-6">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
                Beschreibung
              </h2>
              <div
                className="prose prose-sm max-w-none text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </GlassCard>
          )}

          {/* Add to Cart */}
          <AddToCartButton
            product={{
              slug: product.slug,
              name: product.name,
              price: typeof product.price === "number" ? product.price : parseFloat(product.price) || 0,
            }}
          />

          {/* Back link */}
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm text-gray-400
              hover:text-gray-700 transition-colors w-fit"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Zurück zur Übersicht
          </Link>
        </div>
      </div>
    </section>
  );
}
