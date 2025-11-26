// app/layout.tsx
import Footer from "@/components/Footer";
import "./globals.css";
import type { ReactNode } from "react";
import HeaderNav from "@/components/HeaderNav";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata = {
  title: "Senin Pazarın",
  description: "İkinci el ürünlerini güvenle al ve sat.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" />
      </head>
      <body
        className="
          bg-slate-50 text-slate-900
          dark:bg-slate-950 dark:text-slate-50
          transition-colors duration-200
        "
      >
        <ThemeProvider>
          <div className="min-h-screen">
            {/* Üst menü tamamen HeaderNav içinde */}
            <HeaderNav />

            {/* İÇERİK - geniş container */}
            <main className="mx-auto max-w-screen-xl px-5 py-4">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
