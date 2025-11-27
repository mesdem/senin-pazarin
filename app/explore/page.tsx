// app/kesfet/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TURKISH_CITIES } from "@/lib/cities";
import FavoriteButton from "@/components/FavoriteButton";
import { ALL_CATEGORY_LABELS } from "@/lib/categories";

type SortType = "newest" | "price_asc" | "price_desc";

type Listing = {
  id: string;
  title: string;
  city: string | null;
  price: number;
  created_at: string;
  ships_in_24h?: boolean;
  thumbnail_url?: string | null;
  category?: string | null;
};

export default function KesfetPage() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<SortType>("newest");

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchListings() {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      if (search) params.set("q", search);
      if (city) params.set("city", city);
      if (category) params.set("category", category);
      if (minPrice) params.set("min", minPrice);
      if (maxPrice) params.set("max", maxPrice);
      if (sort) params.set("sort", sort);

      const res = await fetch(`/api/listings?${params.toString()}`, {
        method: "GET",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "İlanlar yüklenirken bir hata oluştu.");
      }

      const json = await res.json();
      setListings(json.data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Bilinmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  // Sayfa ilk açıldığında ilanları yükle
  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetFilters() {
    setSearch("");
    setCity("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    fetchListings();
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:flex-row">
        {/* SOL: Koyu sidebar filtre paneli */}
        <aside className="h-fit w-full rounded-2xl bg-neutral-900 p-4 text-neutral-50 shadow-lg md:sticky md:top-24 md:w-72">
          <h1 className="mb-1 text-xl font-semibold">Keşfet</h1>
          <p className="mb-4 text-xs text-neutral-400">
            Türkiye’nin her yerinden ilanları filtrele.
          </p>

          {/* Arama */}
          <div className="mb-3 space-y-1">
            <label className="text-xs font-medium text-neutral-300">
              Arama
            </label>
            <input
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-sm text-neutral-50 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Ürün adı, anahtar kelime..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Şehir */}
          <div className="mb-3 space-y-1">
            <label className="text-xs font-medium text-neutral-300">
              Şehir
            </label>
            <select
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-sm text-neutral-50 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="">Tüm Türkiye</option>
              {TURKISH_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Kategori */}
          <div className="mb-3 space-y-1">
            <label className="text-xs font-medium text-neutral-300">
              Kategori
            </label>
            <select
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-sm text-neutral-50 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Tüm kategoriler</option>
              {ALL_CATEGORY_LABELS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Fiyat aralığı */}
          <div className="mb-3 space-y-1">
            <label className="text-xs font-medium text-neutral-300">
              Fiyat aralığı (TL)
            </label>
            <div className="flex gap-2">
              <input
                className="w-1/2 rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-sm text-neutral-50 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <input
                className="w-1/2 rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-sm text-neutral-50 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Sıralama */}
          <div className="mb-4 space-y-1">
            <label className="text-xs font-medium text-neutral-300">
              Sırala
            </label>
            <select
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-sm text-neutral-50 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortType)}
            >
              <option value="newest">En yeni ilanlar</option>
              <option value="price_asc">Fiyat (artan)</option>
              <option value="price_desc">Fiyat (azalan)</option>
            </select>
          </div>

          {/* Butonlar */}
          <div className="flex flex-col gap-2">
            <button
              onClick={fetchListings}
              className="w-full rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-neutral-900 transition hover:bg-emerald-400 disabled:opacity-60"
              type="button"
              disabled={loading}
            >
              {loading ? "Yükleniyor..." : "Filtreleri uygula"}
            </button>
            <button
              onClick={resetFilters}
              className="w-full rounded-lg border border-neutral-700 px-3 py-2 text-xs text-neutral-300 transition hover:bg-neutral-800 disabled:opacity-60"
              type="button"
              disabled={loading}
            >
              Temizle
            </button>
          </div>
        </aside>

        {/* SAĞ: İçerik alanı */}
        <main className="flex-1">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                İlanlar
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Filtrelerini değiştirerek Türkiye genelindeki ilanları keşfet.
              </p>
            </div>
          </div>

          {/* Seçili filtrelerin özeti */}
          <div className="mb-4 rounded-2xl border border-neutral-200 bg-white p-3 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
            <div>
              <span className="font-semibold">Arama:</span> {search || "—"}
            </div>
            <div>
              <span className="font-semibold">Şehir:</span>{" "}
              {city || "Tüm Türkiye"}
            </div>
            <div>
              <span className="font-semibold">Kategori:</span>{" "}
              {category || "Tüm kategoriler"}
            </div>
            <div>
              <span className="font-semibold">Fiyat:</span>{" "}
              {(minPrice || "—") + " - " + (maxPrice || "—")} TL
            </div>
            <div>
              <span className="font-semibold">Sıralama:</span>{" "}
              {sort === "newest"
                ? "En yeni ilanlar"
                : sort === "price_asc"
                ? "Fiyat (artan)"
                : "Fiyat (azalan)"}
            </div>
          </div>

          {/* Hata mesajı */}
          {error && (
            <div className="mb-3 text-xs text-red-500">
              {error || "Bir hata oluştu."}
            </div>
          )}

          {/* İlan kartları */}
          {loading && listings.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              İlanlar yükleniyor...
            </p>
          ) : listings.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Kriterlerine uygun ilan bulunamadı.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.id}`}
                  className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-0 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="relative h-40 w-full overflow-hidden rounded-t-2xl bg-neutral-200 dark:bg-neutral-800">
                    {listing.thumbnail_url ? (
                      <img
                        src={listing.thumbnail_url}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-cyan-500/30 to-violet-500/30" />
                    )}

                    {/* Favori butonu */}
                    <div className="absolute right-2 top-2 z-10">
                      <FavoriteButton listingId={String(listing.id)} />
                    </div>
                  </div>

                  <div className="space-y-1 p-3 text-xs">
                    <div className="line-clamp-1 text-sm font-semibold text-neutral-900 group-hover:text-cyan-600 dark:text-neutral-50 dark:group-hover:text-cyan-300">
                      {listing.title}
                    </div>

                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      {(listing.city as string) || "Türkiye geneli"} •{" "}
                      {listing.category || "Kategori"}
                    </div>

                    <div className="mt-1 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {listing.price.toLocaleString("tr-TR")} TL
                    </div>

                    {listing.ships_in_24h && (
                      <span className="mt-1 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                        🚀 24 saatte kargoda
                      </span>
                    )}

                    <div className="mt-1 text-[10px] text-neutral-400">
                      {new Date(listing.created_at).toLocaleDateString("tr-TR")}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
