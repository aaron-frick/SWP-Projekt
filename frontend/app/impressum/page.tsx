import Link from "next/link";
import { GlassCard } from "@/components/glass-card";

/**
 * Impressum – rechtliche Pflichtangaben (nur Schulungsprojekt / Theorie).
 */
export default function ImpressumPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-12 animate-fade-in-up">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center gap-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-gray-700 transition-colors">Start</Link></li>
          <li>/</li>
          <li className="text-gray-700">Impressum</li>
        </ol>
      </nav>

      {/* Disclaimer */}
      <GlassCard className="mb-8 p-5 border-l-4 border-amber-400">
        <p className="text-sm font-medium text-amber-700">
          ⚠️ Dieses Impressum ist ein Platzhalter für ein Schulprojekt (HTL Dornbirn).
          Es handelt sich um keine echten Angaben und begründet kein rechtsverbindliches Angebot.
        </p>
      </GlassCard>

      <h1 className="mb-8 text-3xl font-bold text-gray-900">Impressum</h1>

      <div className="space-y-8">
        {/* Angaben gem. § 5 ECG */}
        <GlassCard className="p-6 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Angaben gemäß § 5 ECG
          </h2>
          <div className="space-y-1 text-sm text-gray-700">
            <p className="font-semibold text-gray-900">Healthshop</p>
            <p>Musterstraße 1</p>
            <p>6850 Dornbirn</p>
            <p>Österreich</p>
          </div>
        </GlassCard>

        {/* Kontakt */}
        <GlassCard className="p-6 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Kontakt</h2>
          <div className="space-y-1 text-sm text-gray-700">
            <p>E-Mail: <span className="text-gray-500 italic">kontakt@goonershop.example</span></p>
            <p>Tel.: <span className="text-gray-500 italic">+43 123 456 789</span></p>
          </div>
        </GlassCard>

        {/* Schulprojekt-Hinweis */}
        <GlassCard className="p-6 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Hinweis Schulprojekt
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Dieser Online-Shop wurde im Rahmen des Schulprojekts <strong>SWP (Softwareentwicklung &
            Projektmanagement)</strong> an der HTL Dornbirn erstellt. Alle Angaben sind fiktiv und
            dienen ausschließlich zu Lern- und Demonstrationszwecken. Es besteht kein kommerzieller
            Betrieb und keine Kaufmöglichkeit.
          </p>
        </GlassCard>

        {/* Haftungsausschluss */}
        <GlassCard className="p-6 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Haftungsausschluss
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die
            Richtigkeit, Vollständigkeit und Aktualität der Inhalte übernehmen wir jedoch keine
            Gewähr. Als Schulprojekt sind alle Produktbeschreibungen, Preise und Verfügbarkeiten
            rein fiktiver Natur.
          </p>
        </GlassCard>

        {/* Urheberrecht */}
        <GlassCard className="p-6 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Urheberrecht
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
            dem österreichischen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und
            jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen
            Zustimmung des jeweiligen Autors.
          </p>
        </GlassCard>
      </div>

      <div className="mt-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Zurück zur Startseite
        </Link>
      </div>
    </section>
  );
}
