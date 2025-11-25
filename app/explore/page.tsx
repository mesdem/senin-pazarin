// app/explore/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import type { ListingWithImages } from "@/lib/types";
import { CATEGORY_GROUPS } from "@/lib/categories";

function ExploreContent() {
  const searchParams = useSearchParams();

  const [listings, setListings] = useState<ListingWithImages[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedCategory = searchParams.get("category") || "";
  const query = searchParams.get("q") || "";

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      let queryBuilder = supabase
        .from("listings")
        .select("*, listing_images(image_url)")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(40);

      if (selectedCategory) {
        queryBuilder = queryBuilder.eq("category", selectedCategory);
      }

      if (query) {
        // basit arama: başlıkta arama
        queryBuilder = queryBuilder.ilike("title", `%${query}%`);
      }

      const { data, error } = await queryBuilder;

      if (!error && data) {
        const mapped = (data as any[]).map((row) => ({
          ...row,
          images: row.listing_images as { image_url: string }[] | undefined,
        }));
        setListings(mapped);
      } else {
        setListings([]);
      }

      setLoading(false);
    };

    load();
  }, [selectedCategory, query]);

  return (
    <div className="space-y-6 py-4">
      {/* Başlık + arama */}
      <section className="space-y-3">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Keşfet
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Farklı kategorilerde ikinci el ürünleri keşfet.
        </p>

        <form onSubmit={(e) => e.preventDefault()} className="mt-2 flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Ürün adı, marka, kategori ara..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 dark:border-slate-700 dark:bg-slate-900"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const form = e.currentTarget.form;
                if (!form) return;
                const value = (e.currentTarget as HTMLInputElement).value;
                const params = new URLSearchParams(
                  window.location.search || ""
                );
                if (value) {
                  params.set("q", value);
                } else {
                  params.delete("q");
                }
                const cat = params.get("category");
                const href =
                  "/explore" +
                  (params.toString() ? `?${params.toString()}` : "");
                window.location.href = href;
              }
            }}
          />
        </form>
      </section>

      {/* Kategori grupları */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Kategoriler
        </h2>
        <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {CATEGORY_GROUPS.map((group) => (
            <Link
              key={group.key}
              href={
                "/explore?category=" +
                encodeURIComponent(group.id) +
                (query ? `&q=${encodeURIComponent(query)}` : "")
              }
              className={`group flex flex-col items-start justify-between rounded-2xl border px-3 py-3 text-xs transition hover:border-cyan-400 hover:bg-cyan-50/60 dark:hover:bg-slate-900/70 ${
                selectedCategory === group.id
                  ? "border-cyan-400 bg-cyan-50/70 dark:border-cyan-400/80 dark:bg-slate-900"
                  : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
              }`}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {group.label}
              </span>
              <span className="mt-2 line-clamp-3 text-[11px] text-slate-500 dark:text-slate-400">
                {group.items.map((item) => item.label).join(", ")}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* İlan listesi */}
      <section className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">
            {selectedCategory
              ? "Bu kategorideki ilanlar"
              : "Son eklenen ilanlar"}
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {loading
              ? "Yükleniyor..."
              : listings.length === 0
              ? "İlan bulunamadı"
              : `${listings.length} ilan bulundu`}
          </span>
        </div>

        {loading ? (
          <p className="mt-2 text-xs text-slate-500">İlanlar yükleniyor…</p>
        ) : listings.length === 0 ? (
          <p className="mt-2 text-xs text-slate-500">
            Bu filtrelerle eşleşen ilan bulunamadı.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {listings.map((item) => {
              const heroImg = item.images?.[0]?.image_url;
              return (
                <Link
                  key={item.id}
                  href={`/listings/${item.id}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-[2px] hover:border-cyan-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
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
                  <div className="space-y-1 p-3 text-xs">
                    <p className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-cyan-600 dark:text-slate-50 dark:group-hover:text-cyan-300">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {item.city} • {item.category} • {item.condition}
                    </p>
                    <p className="text-sm font-bold text-cyan-600 dark:text-cyan-300">
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

export default function ExplorePage() {
  return (
    <Suspense
      fallback={<p className="p-4 text-sm text-slate-500">Yükleniyor…</p>}
    >
      <ExploreContent />
    </Suspense>
  );
}
