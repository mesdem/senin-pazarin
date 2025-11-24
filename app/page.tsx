// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { ListingWithImages } from "@/lib/types";
import Link from "next/link";

export default function HomePage() {
  const [listings, setListings] = useState<ListingWithImages[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("listings")
        .select("*, listing_images(image_url)")
        .order("created_at", { ascending: false })
        .limit(8);

      if (!error && data) {
        const mapped = (data as any[]).map((row) => ({
          ...row,
          images: row.listing_images as { image_url: string }[] | undefined,
        }));
        setListings(mapped);
      }
      setLoading(false);
    };

    load();
  }, []);

  return (
    <div className="space-y-6 py-4">
      <section className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
        <h1 className="text-2xl font-bold">Senin Pazarın’a hoş geldin 👋</h1>
        <p className="mt-2 text-sm text-slate-300">
          İhtiyacın olmayanı değerlendir, aradığını uygun fiyata bul. İkinci el
          telefon, bilgisayar, mobilya, kitap ve daha fazlası…
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/explore"
            className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900"
          >
            İlanları Keşfet
          </Link>
          <Link
            href="/listings/new"
            className="rounded-xl border border-slate-600 px-4 py-2 text-sm"
          >
            + İlan Ver
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Son eklenen ilanlar</h2>
          <Link href="/explore" className="text-xs text-cyan-300">
            Tümünü gör →
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Yükleniyor…</p>
        ) : listings.length === 0 ? (
          <p className="text-sm text-slate-400">
            Henüz ilan yok. İlk ilanı sen verebilirsin.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {listings.map((item) => {
              const heroImg = item.images?.[0]?.image_url;
              return (
                <Link
                  key={item.id}
                  href={`/listings/${item.id}`}
                  className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70"
                >
                  {heroImg ? (
                    <img
                      src={heroImg}
                      alt={item.title}
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="h-40 w-full bg-gradient-to-br from-cyan-500/30 to-violet-500/30" />
                  )}
                  <div className="space-y-1 p-3">
                    <h3 className="truncate text-sm font-semibold group-hover:text-cyan-300">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 truncate">
                      {item.city} • {item.category}
                    </p>
                    <p className="text-sm font-bold text-cyan-300">
                      {item.price.toLocaleString("tr-TR")} ₺
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
