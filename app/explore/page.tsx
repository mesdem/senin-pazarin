// app/explore/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { ListingWithImages } from "@/lib/types";
import Link from "next/link";

const CATEGORIES = [
  "Elektronik",
  "Telefon",
  "Bilgisayar",
  "Ev & Yaşam",
  "Mobilya",
  "Giyim & Aksesuar",
  "Spor & Outdoor",
  "Oyun & Konsol",
  "Kitap",
  "Diğer",
];

const CITIES = [
  "İstanbul",
  "Ankara",
  "İzmir",
  "Bursa",
  "Antalya",
  "Adana",
  "Konya",
  "Gaziantep",
  "Kayseri",
  "Eskişehir",
  "Denizli",
  "Burdur",
];

export default function ExplorePage() {
  const [listings, setListings] = useState<ListingWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);

    let query = supabase
      .from("listings")
      .select("*, listing_images(image_url)")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (category) query = query.eq("category", category);
    if (city) query = query.eq("city", city);
    if (q) query = query.ilike("title", `%${q}%`);

    const { data, error } = await query;

    if (!error && data) {
      const mapped = (data as any[]).map((row) => ({
        ...row,
        images: row.listing_images as { image_url: string }[] | undefined,
      }));
      setListings(mapped);
    }
    setLoading(false);
  }

  const onFilterChange = () => {
    load();
  };

  return (
    <div className="space-y-4 py-4">
      <h1 className="text-xl font-semibold">İlanları Keşfet</h1>

      {/* Filtre Alanı */}
      <div className="grid gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-3 text-xs sm:grid-cols-4">
        <input
          placeholder="Ara: iPhone 12, koltuk, kitap…"
          className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs outline-none"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onBlur={onFilterChange}
        />
        <select
          className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            onFilterChange();
          }}
        >
          <option value="">Kategori (tümü)</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            onFilterChange();
          }}
        >
          <option value="">Şehir (tümü)</option>
          {CITIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button
          onClick={onFilterChange}
          className="rounded-xl bg-cyan-400 px-3 py-2 font-semibold text-slate-900"
        >
          Filtrele
        </button>
      </div>

      {/* İlan Listesi */}
      {loading ? (
        <p className="text-sm text-slate-400">Yükleniyor…</p>
      ) : listings.length === 0 ? (
        <p className="text-sm text-slate-400">
          Kriterlere uygun ilan bulunamadı.
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
    </div>
  );
}
