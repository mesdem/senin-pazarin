// app/yonetim/layout.tsx
import { supabase } from "@/lib/supabaseClient";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ReactNode } from "react";
import {
  Home,
  ListChecks,
  Users,
  Flag,
  LifeBuoy,
  Settings,
} from "lucide-react";

export default function YonetimLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto flex max-w-6xl gap-4 px-4 py-6">
        {/* SOL MENÜ */}
        <aside className="hidden w-56 flex-shrink-0 flex-col gap-3 md:flex">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold dark:border-slate-800 dark:bg-slate-900">
            Yönetim Paneli
          </div>

          <nav className="space-y-1 rounded-2xl border border-slate-200 bg-white p-2 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <YonetimNavItem href="/yonetim" icon={<Home size={16} />}>
              Dashboard
            </YonetimNavItem>

            <YonetimNavItem
              href="/yonetim/ilanlar"
              icon={<ListChecks size={16} />}
            >
              İlanlar
            </YonetimNavItem>

            <YonetimNavItem
              href="/yonetim/kullanicilar"
              icon={<Users size={16} />}
            >
              Kullanıcılar
            </YonetimNavItem>

            <YonetimNavItem
              href="/yonetim/sikayetler"
              icon={<Flag size={16} />}
            >
              Şikayetler
            </YonetimNavItem>

            <YonetimNavItem
              href="/yonetim/destek"
              icon={<LifeBuoy size={16} />}
            >
              Destek talepleri
            </YonetimNavItem>

            <YonetimNavItem
              href="/yonetim/ayarlar"
              icon={<Settings size={16} />}
            >
              Ayarlar
            </YonetimNavItem>

            {/* 🆕 İstatistikler menüde, diğerleriyle aynı stil */}
            <YonetimNavItem
              href="/yonetim/istatistikler"
              icon={<Home size={16} />} // istersen başka ikon koyarız
            >
              İstatistikler
            </YonetimNavItem>
          </nav>

          <div className="mt-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            <p className="font-semibold text-xs mb-1">Not</p>
            <p>
              Bu alan yalnızca admin/moderatör kullanıcılar içindir. Yetkisiz
              erişimleri engellemek için giriş kontrolünü eklemeyi unutma.
            </p>
          </div>
        </aside>

        {/* ANA ALAN */}
        <main className="flex-1 space-y-4">
          {/* ÜST BAR */}
          <header className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Yönetim
              </p>
              <h1 className="text-sm font-semibold">
                Senin Pazarın - Yönetim Paneli
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Link
                href="/"
                className="rounded-xl border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                Siteye dön
              </Link>
              {/* Buraya istersen admin kullanıcı bilgisi, çıkış butonu vs. koyarız */}
            </div>
          </header>

          {/* SAYFA İÇERİĞİ */}
          {children}
        </main>
      </div>
    </div>
  );
}

type NavItemProps = {
  href: string;
  icon?: React.ReactNode;
  children: ReactNode;
};

function YonetimNavItem({ href, icon, children }: NavItemProps) {
  // Şimdilik aktiflik kontrolü yok, istersen usePathname ile ekleriz.
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      {icon && (
        <span className="text-slate-500 dark:text-slate-400">{icon}</span>
      )}
      <span>{children}</span>
    </Link>
  );
}
