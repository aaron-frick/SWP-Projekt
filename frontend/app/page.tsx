import Link from "next/link";

/**
 * Landing page – clean Apple Liquid Glass hero.
 */
export default function HomePage() {
  return (
    <section className="flex min-h-[calc(100vh-6rem)] items-center justify-center px-6">
      <div className="mx-auto max-w-4xl text-center animate-fade-in-up">

        {/* Logo orb */}
        <div className="mx-auto mb-10 flex h-28 w-28 items-center justify-center rounded-full glass">
          <svg
            className="h-12 w-12 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>

        {/* Headline */}
        <h1 className="text-6xl font-bold tracking-tight text-gray-900 sm:text-8xl leading-none">
          Healthshop
        </h1>
        <p className="mt-6 text-xl text-gray-400 max-w-xl mx-auto leading-relaxed font-light">
          Entdecke unsere Produkte in einer einzigartigen Shopping-Erfahrung.
        </p>

        {/* CTA */}
        <div className="mt-12">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-gray-900 text-white
              px-8 py-4 rounded-full text-base font-medium
              hover:bg-gray-700 transition-colors"
          >
            Produkte entdecken
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        {/* Feature pills */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
          {["Schnelle Lieferung", "Sichere Zahlung", "Top Qualität"].map((f) => (
            <span key={f} className="glass rounded-full px-5 py-2 text-sm text-gray-500">
              {f}
            </span>
          ))}
        </div>

      </div>
    </section>
  );
}
