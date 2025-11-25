// components/SimilarListings.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type SimilarListing = {
  id: string;
  title: string;
  price: number;
  city: string | null;
  category: string | null;
  condition: string | null;
  listing_images?: { image_url: string }[];
  images?: { image_url: string }[];
};

type Props = {
  currentId: string;
  category: string | null;
  city: string | null;
};

export default function SimilarListings({ currentId, category, city }: Props) {
  const [items, setItems] = useState<SimilarListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!category) {
        setLoading(false);
        return;
      }

      setLoading(true);

      let query = supabase
        .from("listings")
        .select("*, listing_images(image_url)")
        .eq("status", "active")
        .eq("category", category)
        .neq("id", currentId)
        .limit(6);

      if (city) {
        query = query.eq("city", city);
      }

      const { data, error } = await query;

      if (!error && data) {
        const mapped = (data as any[]).map((row) => ({
          ...row,
          images: row.listing_images as { image_url: string }[] | undefined,
        }));
        setItems(mapped);
      }

      setLoading(false);
    };

    load();
  }, [currentId, category, city]);

  if (loading) {
    return (
      <section className="mt-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Benzer ilanlar yükleniyor…
        </p>
      </section>
    );
  }

  if (!items.length) {
    return null;
  }

  return (
    <section className="mt-6 space-y-3">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        Benzer ilanlar
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {items.map((item) => {
          const heroImg =
            item.images?.[0]?.image_url || item.listing_images?.[0]?.image_url;
          return (
            <Link
              key={item.id}
              href={`/listings/${item.id}`}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80"
            >
              {heroImg ? (
                <img
                  src={heroImg}
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
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
