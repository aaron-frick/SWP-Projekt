import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Healthshop",
  description: "Healthshop – Dein Online Shop",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased
          min-h-screen bg-gradient-to-br from-slate-100 via-white to-indigo-50
          text-gray-900 font-sans`}
      >
        {/* Ambient color blobs */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-purple-300/25 blur-3xl animate-blob" />
          <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-blue-300/20 blur-3xl animate-blob [animation-delay:4s]" />
          <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-pink-300/20 blur-3xl animate-blob [animation-delay:8s]" />
          <div className="absolute top-2/3 left-1/4 w-[400px] h-[400px] rounded-full bg-cyan-200/20 blur-3xl animate-blob [animation-delay:12s]" />
        </div>

        <Providers>
          <Navbar />
          <main className="pt-24">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
