"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";

interface AddToCartButtonProps {
  product: { slug: string; name: string; price: number };
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!user) { router.push("/auth/login"); return; }
    setLoading(true);
    await addItem(product);
    setLoading(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full rounded-full bg-gray-900 py-3.5 text-sm font-medium text-white
        transition-all hover:bg-gray-700 disabled:opacity-50 active:scale-95"
    >
      {loading ? "Wird hinzugefügt…" : added ? "✓ Im Warenkorb" : "In den Warenkorb"}
    </button>
  );
}
