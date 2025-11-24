// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Senin Pazarın — İkinci El Alışveriş",
  description: "İkinci el ürünlerini kolayca alıp satabileceğin pazar yeri.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="bg-slate-950 text-slate-100">
        <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
          <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2 font-extrabold">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-400 text-slate-900 text-sm">
                SP
              </span>
              <span>Senin Pazarın</span>
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/explore">Keşfet</Link>
              <Link href="/inbox">Mesajlar</Link>
              <Link href="/sent">Gönderilenler</Link>
              <Link href="/profile">Profil</Link>
              <Link
                href="/auth/login"
                className="text-slate-300 hover:text-white"
              >
                Giriş
              </Link>
              <Link
                href="/auth/register"
                className="rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-3 py-1 text-slate-900 font-semibold text-sm"
              >
                Üye Ol
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto min-h-screen max-w-5xl px-4 py-4">
          {children}
        </main>
        <footer className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Senin Pazarın
        </footer>
      </body>
    </html>
  );
}
