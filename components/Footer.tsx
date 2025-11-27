// components/Footer.tsx
"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="
      mt-10 border-t border-slate-200 bg-white 
      dark:border-slate-800 dark:bg-slate-950
    "
    >
      <div className="mx-auto max-w-7xl px-5 py-10 grid gap-8 md:grid-cols-4 text-sm">
        {/* Logo + açıklama */}
        <div className="space-y-3">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="logo" className="h-7" />
            <span className="font-semibold">Senin Pazarın</span>
          </Link>

          <p className="text-slate-600 dark:text-slate-400 text-[13px] leading-relaxed">
            Türkiye’nin en modern ikinci el pazar yeri. Güvenli alışveriş, düşük
            komisyon ve hızlı mesajlaşma deneyimi.
          </p>
        </div>

        {/* Kurumsal */}
        <div>
          <h3 className="font-semibold mb-3">Kurumsal</h3>
          <ul className="space-y-2 text-slate-600 dark:text-slate-400">
            <li>
              <Link
                href="/about"
                className="hover:text-cyan-600 dark:hover:text-cyan-300"
              >
                Hakkımızda
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="hover:text-cyan-600 dark:hover:text-cyan-300"
              >
                Gizlilik Politikası
              </Link>
            </li>
            <li>
              <Link
                href="/kvkk"
                className="hover:text-cyan-600 dark:hover:text-cyan-300"
              >
                KVKK Aydınlatma
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="hover:text-cyan-600 dark:hover:text-cyan-300"
              >
                Kullanım Şartları
              </Link>
            </li>

            {/* 🆕 EKLENEN LİNK */}
            <li>
              <Link
                href="/bilgilendirme"
                className="hover:text-cyan-600 dark:hover:text-cyan-300"
              >
                Alıcı & Satıcı Bilgilendirme
              </Link>
            </li>
          </ul>
        </div>

        {/* Destek */}
        <div>
          <h3 className="font-semibold mb-3">Destek</h3>
          <ul className="space-y-2 text-slate-600 dark:text-slate-400">
            <li>
              <Link
                href="/help"
                className="hover:text-cyan-600 dark:hover:text-cyan-300"
              ></Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-cyan-600 dark:hover:text-cyan-300"
              >
                İletişim
              </Link>
            </li>
            <li>
              <Link
                href="/support"
                className="hover:text-cyan-600 dark:hover:text-cyan-300"
              >
                Destek Talebi
              </Link>
            </li>
            <li>
              <Link href="/kurumsal/kargo-ve-iade">Kargo &amp; İade</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 py-4">
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} Senin Pazarın — Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}
