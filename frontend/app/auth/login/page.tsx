"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { GlassCard } from "@/components/glass-card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) { setError(error); return; }
    router.push("/");
  }

  return (
    <section className="mx-auto max-w-md px-6 py-20">
      <GlassCard className="p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Einloggen</h1>
          <p className="text-sm text-gray-500">Melde dich mit deinem Konto an.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-400">E-Mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/40 bg-white/50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900/20"
              placeholder="deine@email.de"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-400">Passwort</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/40 bg-white/50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900/20"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gray-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? "Laden…" : "Einloggen"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Noch kein Konto?{" "}
          <Link href="/auth/register" className="font-medium text-gray-900 hover:underline">
            Registrieren
          </Link>
        </p>
      </GlassCard>
    </section>
  );
}
