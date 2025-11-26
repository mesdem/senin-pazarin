"use client";

import { useEffect, useState } from "react";
import { TURKISH_CITIES } from "@/lib/cities";

type SortType = "newest" | "price_asc" | "price_desc";

type Listing = {
  id: string;
  title: string;
  city: string | null;
  price: number;
  created_at: string;
};

export default function KesfetPage() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
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
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    fetchListings();
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-6 md:flex-row">
        {/* SOL: Koyu sidebar filtre paneli */}
        <aside className="w-full md:w-72 rounded-2xl bg-neutral-900 text-neutral-50 p-4 md:sticky md:top-24 h-fit shadow-lg">
          <h1 className="font-semibold text-xl mb-1">Keşfet</h1>
          <p className="text-xs text-neutral-400 mb-4">
            Türkiye’nin her yerinden ilanları filtrele.
          </p>

          {/* Arama */}
          <div className="space-y-1 mb-3">
            <label className="text-xs font-medium text-neutral-300">
              Arama
            </label>
            <input
              className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-2 py-1.5 text-sm text-neutral-50 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Ürün adı, anahtar kelime..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Şehir */}
          <div className="space-y-1 mb-3">
            <label className="text-xs font-medium text-neutral-300">
              Şehir
            </label>
            <select
              className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-2 py-1.5 text-sm text-neutral-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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

          {/* Fiyat aralığı */}
          <div className="space-y-1 mb-3">
            <label className="text-xs font-medium text-neutral-300">
              Fiyat aralığı (TL)
            </label>
            <div className="flex gap-2">
              <input
                className="w-1/2 rounded-lg bg-neutral-800 border border-neutral-700 px-2 py-1.5 text-sm text-neutral-50 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <input
                className="w-1/2 rounded-lg bg-neutral-800 border border-neutral-700 px-2 py-1.5 text-sm text-neutral-50 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Sıralama */}
          <div className="space-y-1 mb-4">
            <label className="text-xs font-medium text-neutral-300">
              Sırala
            </label>
            <select
              className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-2 py-1.5 text-sm text-neutral-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
              className="w-full rounded-lg px-3 py-2 text-sm font-medium bg-emerald-500 hover:bg-emerald-400 text-neutral-900 transition disabled:opacity-60"
              type="button"
              disabled={loading}
            >
              {loading ? "Yükleniyor..." : "Filtreleri uygula"}
            </button>
            <button
              onClick={resetFilters}
              className="w-full rounded-lg px-3 py-2 text-xs border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition disabled:opacity-60"
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
              <h2 className="font-semibold text-lg text-neutral-900 dark:text-neutral-50">
                İlanlar
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Filtrelerini değiştirerek Türkiye genelindeki ilanları keşfet.
              </p>
            </div>
          </div>

          {/* Seçili filtrelerin özeti */}
          <div className="mb-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3 text-xs text-neutral-600 dark:text-neutral-300">
            <div>
              <span className="font-semibold">Arama:</span> {search || "—"}
            </div>
            <div>
              <span className="font-semibold">Şehir:</span>{" "}
              {city || "Tüm Türkiye"}
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
          {error && <div className="mb-3 text-xs text-red-500">{error}</div>}

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
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3 shadow-sm hover:shadow-md transition"
                >
                  <div className="h-32 mb-2 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
                  <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 line-clamp-1">
                    {listing.title}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {(listing.city as string) || "Türkiye geneli"} • Kategori
                  </div>
                  <div className="mt-1 font-bold text-emerald-600 dark:text-emerald-400">
                    {listing.price} TL
                  </div>
                  <div className="mt-1 text-[10px] text-neutral-400">
                    {new Date(listing.created_at).toLocaleDateString("tr-TR")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
