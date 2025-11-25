// app/recent/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type RecentListingEntry = {
  id: string;
  title: string;
  price: number;
  city: string | null;
  category: string | null;
  condition: string | null;
  image_url: string | null;
  viewedAt: string;
};

export default function RecentListingsPage() {
  const [items, setItems] = useState<RecentListingEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem("recentListings");
      if (raw) {
        const parsed = JSON.parse(raw) as RecentListingEntry[];
        setItems(parsed);
      }
    } catch {
      // ignore
    } finally {
      setLoaded(true);
    }
  }, []);

  return (
    <div className="space-y-4 py-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Son baktığın ilanlar
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            En son görüntülediğin ilanlar burada listelenir. Tarayıcıya özel
            kaydedilir (hesaba bağlı değildir).
          </p>
        </div>
        {items.length > 0 && (
          <button
            className="rounded-xl border border-slate-300 bg-white px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            onClick={() => {
              if (typeof window === "undefined") return;
              window.localStorage.removeItem("recentListings");
              setItems([]);
            }}
          >
            Listeyi temizle
          </button>
        )}
      </header>

      {!loaded ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Yükleniyor…
        </p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Henüz hiç ilan görüntülememişsin. İlanlara göz attıkça burada
          görünecek.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {items.map((item) => {
            const viewed = new Date(item.viewedAt).toLocaleString("tr-TR", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <Link
                key={`${item.id}-${item.viewedAt}`}
                href={`/listings/${item.id}`}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80"
              >
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="h-32 w-full object-cover"
                  />
                ) : (
                  <div className="h-32 w-full bg-gradient-to-br from-cyan-500/30 to-violet-500/30" />
                )}
                <div className="space-y-1 p-3 text-xs">
                  <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-cyan-600 dark:text-slate-100 dark:group-hover:text-cyan-300">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {item.city} • {item.category} • {item.condition}
                  </p>
                  <p className="text-sm font-bold text-cyan-700 dark:text-cyan-300">
                    {item.price.toLocaleString("tr-TR")} ₺
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    Son görüntüleme: {viewed}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
