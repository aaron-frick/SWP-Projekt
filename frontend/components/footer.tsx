import Link from "next/link";

/**
 * Site-wide footer – glass design with legal links.
 */
export function Footer() {
  return (
    <footer className="mt-24 px-4 pb-6">
      <div className="glass rounded-2xl mx-auto max-w-7xl px-8 py-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Healthshop</span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-400">
              © {new Date().getFullYear()} – Schulprojekt HTL Dornbirn
            </span>
          </div>

          {/* Legal links */}
          <nav className="flex items-center gap-6">
            <Link
              href="/impressum"
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
            >
              Impressum
            </Link>
            <Link
              href="/datenschutz"
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
            >
              Datenschutz
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
