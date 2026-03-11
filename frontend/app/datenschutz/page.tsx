import Link from "next/link";
import { GlassCard } from "@/components/glass-card";

/**
 * Datenschutzerklärung – DSGVO-Hinweise (nur Schulungsprojekt / Theorie).
 */
export default function DatenschutzPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-12 animate-fade-in-up">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center gap-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-gray-700 transition-colors">Start</Link></li>
          <li>/</li>
          <li className="text-gray-700">Datenschutz</li>
        </ol>
      </nav>

      {/* Disclaimer */}
      <GlassCard className="mb-8 p-5 border-l-4 border-amber-400">
        <p className="text-sm font-medium text-amber-700">
          ⚠️ Diese Datenschutzerklärung ist ein Platzhalter für ein Schulprojekt (HTL Dornbirn).
          Es werden keine echten personenbezogenen Daten verarbeitet.
        </p>
      </GlassCard>

      <h1 className="mb-8 text-3xl font-bold text-gray-900">Datenschutzerklärung</h1>

      <div className="space-y-8 text-sm text-gray-600 leading-relaxed">

        {/* 1. Verantwortlicher */}
        <GlassCard className="p-6 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            1. Verantwortlicher (Art. 13 DSGVO)
          </h2>
          <p>
            Verantwortlich für die Datenverarbeitung auf dieser Website ist:
          </p>
          <div className="pl-4 border-l-2 border-gray-200 space-y-0.5 text-gray-700">
            <p className="font-medium">Healthshop – Schulprojekt HTL Dornbirn</p>
            <p>Musterstraße 1, 6850 Dornbirn, Österreich</p>
            <p>E-Mail: <span className="italic">kontakt@goonershop.example</span></p>
          </div>
        </GlassCard>

        {/* 2. Erhebung von Daten */}
        <GlassCard className="p-6 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            2. Erhebung und Verarbeitung personenbezogener Daten
          </h2>
          <p>
            Da es sich um ein <strong>Schulprojekt</strong> handelt, werden auf dieser Website
            <strong> keine</strong> personenbezogenen Daten aktiv erhoben, gespeichert oder
            weitergegeben. Es existieren keine Nutzerkonten, keine Bestellfunktion und keine
            Zahlungsabwicklung.
          </p>
          <p>
            Beim Aufruf dieser Website können technisch bedingt folgende Daten im Serverlog
            gespeichert werden (nur bei Produktivbetrieb relevant):
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-gray-500">
            <li>IP-Adresse (anonymisiert)</li>
            <li>Datum und Uhrzeit des Zugriffs</li>
            <li>Aufgerufene URL</li>
            <li>Browser und Betriebssystem (User-Agent)</li>
          </ul>
        </GlassCard>

        {/* 3. Cookies */}
        <GlassCard className="p-6 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            3. Cookies
          </h2>
          <p>
            Diese Website verwendet derzeit <strong>keine</strong> Tracking-Cookies oder
            Analyse-Tools (z.B. Google Analytics). Es werden ausschließlich technisch notwendige
            Session-Daten des Browsers verarbeitet, die beim Schließen des Browsers gelöscht werden.
          </p>
        </GlassCard>

        {/* 4. Betroffenenrechte */}
        <GlassCard className="p-6 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            4. Ihre Rechte (Art. 15–22 DSGVO)
          </h2>
          <p>Im Rahmen der DSGVO stehen Ihnen folgende Rechte zu:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong>Auskunft</strong> über gespeicherte Daten (Art. 15)</li>
            <li><strong>Berichtigung</strong> unrichtiger Daten (Art. 16)</li>
            <li><strong>Löschung</strong> Ihrer Daten (Art. 17)</li>
            <li><strong>Einschränkung</strong> der Verarbeitung (Art. 18)</li>
            <li><strong>Datenübertragbarkeit</strong> (Art. 20)</li>
            <li><strong>Widerspruch</strong> gegen die Verarbeitung (Art. 21)</li>
          </ul>
          <p className="text-gray-400 italic">
            Da keine personenbezogenen Daten erhoben werden, ist eine Ausübung dieser Rechte
            in diesem Schulprojekt nicht anwendbar.
          </p>
        </GlassCard>

        {/* 5. Beschwerderecht */}
        <GlassCard className="p-6 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            5. Beschwerderecht bei der Aufsichtsbehörde
          </h2>
          <p>
            Sie haben das Recht, sich bei der österreichischen Datenschutzbehörde zu beschweren:
          </p>
          <div className="pl-4 border-l-2 border-gray-200 space-y-0.5 text-gray-700">
            <p className="font-medium">Österreichische Datenschutzbehörde</p>
            <p>Barichgasse 40–42, 1030 Wien</p>
            <p>dsb.gv.at</p>
          </div>
        </GlassCard>

        {/* 6. Aktualität */}
        <GlassCard className="p-6 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            6. Aktualität dieser Erklärung
          </h2>
          <p>
            Diese Datenschutzerklärung gilt für das Schulprojekt Healthshop (HTL Dornbirn, Schuljahr
            2025/26) und hat keinen Anspruch auf rechtliche Vollständigkeit.
            Stand: {new Date().toLocaleDateString("de-AT", { year: "numeric", month: "long" })}.
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
