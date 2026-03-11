"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";

export function Navbar() {
  const { user, signOut } = useAuth();
  const { totalCount } = useCart();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <div className="glass rounded-2xl mx-auto max-w-7xl">
        <div className="flex items-center justify-between px-6 py-3.5">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-gray-900 hover:text-gray-600 transition-colors"
          >
            Healthshop
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-900 px-4 py-2 rounded-full transition-colors hover:bg-black/5"
            >
              Start
            </Link>
            <Link
              href="/products"
              className="text-sm font-medium bg-gray-900 text-white px-5 py-2 rounded-full hover:bg-gray-700 transition-colors"
            >
              Produkte
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative text-sm text-gray-500 hover:text-gray-900 px-4 py-2 rounded-full transition-colors hover:bg-black/5 flex items-center gap-1"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white">
                  {totalCount > 9 ? "9+" : totalCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 hidden sm:block truncate max-w-32">
                  {user.email}
                </span>
                <button
                  onClick={signOut}
                  className="text-sm text-gray-500 hover:text-gray-900 px-4 py-2 rounded-full transition-colors hover:bg-black/5"
                >
                  Ausloggen
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="text-sm text-gray-500 hover:text-gray-900 px-4 py-2 rounded-full transition-colors hover:bg-black/5"
              >
                Einloggen
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
