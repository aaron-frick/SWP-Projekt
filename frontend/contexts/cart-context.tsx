"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./auth-context";

export interface CartItem {
  id: string;
  product_slug: string;
  product_name: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  totalCount: number;
  totalPrice: number;
  addItem: (product: { slug: string; name: string; price: number }) => Promise<void>;
  removeItem: (productSlug: string) => Promise<void>;
  updateQuantity: (productSlug: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAuth();
  const supabase = createClient();

  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); return; }
    const { data } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at");
    setItems(data ?? []);
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  async function addItem(product: { slug: string; name: string; price: number }) {
    if (!user) return;
    await supabase.from("cart_items").upsert(
      {
        user_id: user.id,
        product_slug: product.slug,
        product_name: product.name,
        price: product.price,
        quantity: 1,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,product_slug",
        ignoreDuplicates: false,
      }
    );
    // Increase quantity if already in cart
    const existing = items.find((i) => i.product_slug === product.slug);
    if (existing) {
      await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + 1, updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("product_slug", product.slug);
    }
    await fetchCart();
  }

  async function removeItem(productSlug: string) {
    if (!user) return;
    await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id)
      .eq("product_slug", productSlug);
    await fetchCart();
  }

  async function updateQuantity(productSlug: string, quantity: number) {
    if (!user) return;
    if (quantity <= 0) { await removeItem(productSlug); return; }
    await supabase
      .from("cart_items")
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("product_slug", productSlug);
    await fetchCart();
  }

  async function clearCart() {
    if (!user) return;
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    setItems([]);
  }

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, totalCount, totalPrice, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
