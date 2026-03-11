"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { GlassCard } from "@/components/glass-card";

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const { items, totalPrice, removeItem, updateQuantity } = useCart();

  if (authLoading) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-20 text-center text-gray-400">
        Laden…
      </section>
    );
  }

  if (!user) {
    return (
      <section className="mx-auto max-w-md px-6 py-20">
        <GlassCard className="p-8 space-y-4 text-center">
          <h1 className="text-xl font-bold text-gray-900">Nicht eingeloggt</h1>
          <p className="text-sm text-gray-500">Melde dich an, um deinen Warenkorb zu sehen.</p>
          <Link
            href="/auth/login"
            className="inline-block rounded-full bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
          >
            Zum Login
          </Link>
        </GlassCard>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-md px-6 py-20">
        <GlassCard className="p-8 space-y-4 text-center">
          <div className="text-4xl">🛒</div>
          <h1 className="text-xl font-bold text-gray-900">Dein Warenkorb ist leer</h1>
          <p className="text-sm text-gray-500">Füge Produkte hinzu, um sie hier zu sehen.</p>
          <Link
            href="/products"
            className="inline-block rounded-full bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
          >
            Zu den Produkten
          </Link>
        </GlassCard>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-12 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Warenkorb</h1>

      <div className="space-y-3">
        {items.map((item) => (
          <GlassCard key={item.id} className="p-5 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{item.product_name}</p>
              <p className="text-sm text-gray-500">
                {item.price.toFixed(2)} € × {item.quantity} = {(item.price * item.quantity).toFixed(2)} €
              </p>
            </div>

            {/* Quantity controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.product_slug, item.quantity - 1)}
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-sm font-medium transition-colors"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.product_slug, item.quantity + 1)}
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-sm font-medium transition-colors"
              >
                +
              </button>
            </div>

            <button
              onClick={() => removeItem(item.product_slug)}
              className="text-red-400 hover:text-red-600 transition-colors text-sm"
            >
              Entfernen
            </button>
          </GlassCard>
        ))}
      </div>

      {/* Summary */}
      <GlassCard className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Gesamt</p>
          <p className="text-2xl font-bold text-gray-900">{totalPrice.toFixed(2)} €</p>
        </div>
        <button className="rounded-full bg-gray-900 px-8 py-3 text-sm font-medium text-white hover:bg-gray-700 transition-colors">
          Zur Kasse
        </button>
      </GlassCard>
    </section>
  );
}
