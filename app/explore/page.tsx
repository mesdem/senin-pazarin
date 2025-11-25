// app/explore/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { ListingWithImages } from "@/lib/types";

import {
  TvIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  HomeModernIcon,
  WrenchIcon,
  ShoppingBagIcon,
  BookOpenIcon,
  MusicalNoteIcon,
  CameraIcon,
  CubeIcon,
  BuildingStorefrontIcon,
  GiftIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/solid";

type CategoryDef = {
  value: string; // veritabanındaki category değeri
  label: string;
  icon: any;
  color: string;
};

const CATEGORIES: CategoryDef[] = [
  {
    value: "Elektronik",
    label: "Elektronik",
    icon: TvIcon,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    value: "Bilgisayar",
    label: "Bilgisayar",
    icon: ComputerDesktopIcon,
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    value: "Telefon",
    label: "Telefon",
    icon: DevicePhoneMobileIcon,
    color: "bg-rose-500/10 text-rose-600",
  },
  {
    value: "Ev & Yaşam",
    label: "Ev & Yaşam",
    icon: HomeModernIcon,
    color: "bg-green-500/10 text-green-600",
  },
  {
    value: "Tamir / Hırdavat",
    label: "Tamir / Hırdavat",
    icon: WrenchIcon,
    color: "bg-yellow-500/10 text-yellow-600",
  },
  {
    value: "Giyim & Aksesuar",
    label: "Giyim & Aksesuar",
    icon: ShoppingBagIcon,
    color: "bg-pink-500/10 text-pink-600",
  },
  {
    value: "Kitap & Dergi",
    label: "Kitap & Dergi",
    icon: BookOpenIcon,
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    value: "Müzik",
    label: "Müzik",
    icon: MusicalNoteIcon,
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    value: "Kamera",
    label: "Kamera",
    icon: CameraIcon,
    color: "bg-cyan-500/10 text-cyan-600",
  },
  {
    value: "Oyuncak",
    label: "Oyuncak",
    icon: CubeIcon,
    color: "bg-indigo-500/10 text-indigo-600",
  },
  {
    value: "Market / Gıda",
    label: "Market / Gıda",
    icon: BuildingStorefrontIcon,
    color: "bg-red-500/10 text-red-600",
  },
  {
    value: "Hediye",
    label: "Hediye",
    icon: GiftIcon,
    color: "bg-teal-500/10 text-teal-600",
  },
  {
    value: "İş İlanları",
    label: "İş İlanları",
    icon: BriefcaseIcon,
    color: "bg-slate-500/10 text-slate-600",
  },
  {
    value: "Diğer",
    label: "Diğer",
    icon: CubeIcon,
    color: "bg-slate-400/10 text-slate-600",
  },
];

export default function ExplorePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<ListingWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // URL paramlarını okuyoruz
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const city = searchParams.get("city") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sort = searchParams.get("sort") || "newest";

  function updateParam(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value.trim() !== "") {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    // Sayfanın en tepesine atmak istemiyorsan scroll: false verebilirsin
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearFilters() {
    router.push(pathname);
  }

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setMsg("");

      let query = supabase
        .from("listings")
        .select("*, listing_images(image_url)")
        .eq("status", "active");

      if (search) {
        // Başlık veya açıklama içinde arama
        query = query.or(
          `title.ilike.%${search}%,description.ilike.%${search}%`
        );
      }

      if (category) {
        query = query.eq("category", category);
      }

      if (city) {
        query = query.ilike("city", `%${city}%`);
      }

      if (minPrice) {
        const n = Number(minPrice);
        if (!Number.isNaN(n)) query = query.gte("price", n);
      }

      if (maxPrice) {
        const n = Number(maxPrice);
        if (!Number.isNaN(n)) query = query.lte("price", n);
      }

      // Sıralama
      if (sort === "price_asc") {
        query = query.order("price", { ascending: true });
      } else if (sort === "price_desc") {
        query = query.order("price", { ascending: false });
      } else {
        // newest
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error(error);
        setMsg("İlanlar yüklenirken bir hata oluştu.");
        setItems([]);
        setLoading(false);
        return;
      }

      if (data) {
        const mapped = (data as any[]).map((row) => ({
          ...row,
          images: row.listing_images as { image_url: string }[] | undefined,
        }));
        setItems(mapped);
      }

      setLoading(false);
    };

    fetchListings();
    // searchParams değiştiğinde yeniden çalışsın
  }, [searchParams]);

  const activeCategoryDef = CATEGORIES.find((c) => c.value === category);

  return (
    <div className="space-y-6 py-6">
      {/* Üstte arama + filtre barı */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              İlanları keşfet
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Arama kutusunu ve filtreleri kullanarak aradığın ürünü daha hızlı
              bulabilirsin.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-[11px]">
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full border border-slate-300 px-3 py-1 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Filtreleri sıfırla
            </button>
            <Link
              href="/listings/new"
              className="rounded-full bg-cyan-400 px-3 py-1 font-semibold text-slate-900 dark:text-slate-950"
            >
              + Yeni ilan ver
            </Link>
          </div>
        </div>

        {/* Filtre formu */}
        <div className="mt-4 grid gap-3 md:grid-cols-3 lg:grid-cols-5">
          {/* Arama */}
          <div className="space-y-1 md:col-span-2">
            <label className="text-[11px] text-slate-500 dark:text-slate-400">
              Arama
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => updateParam("search", e.target.value)}
              placeholder="Örn: iPhone 11, çalışma masası, kitaplık..."
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Şehir */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-500 dark:text-slate-400">
              Şehir
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => updateParam("city", e.target.value)}
              placeholder="Burdur, İstanbul..."
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Min fiyat */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-500 dark:text-slate-400">
              Min. fiyat (₺)
            </label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => updateParam("minPrice", e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          {/* Max fiyat */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-500 dark:text-slate-400">
              Maks. fiyat (₺)
            </label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => updateParam("maxPrice", e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          {/* Sıralama */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-500 dark:text-slate-400">
              Sırala
            </label>
            <select
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="newest">En yeni ilanlar</option>
              <option value="price_asc">Fiyat (artan)</option>
              <option value="price_desc">Fiyat (azalan)</option>
            </select>
          </div>
        </div>

        {/* Aktif kategori etiketi */}
        {activeCategoryDef && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-200">
            <span>Kategori:</span>
            <span className="font-semibold">{activeCategoryDef.label}</span>
            <button
              type="button"
              onClick={() => updateParam("category", "")}
              className="ml-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
            >
              ×
            </button>
          </div>
        )}
      </section>

      {/* GENİŞ KATEGORİ İKONLARI */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Kategoriler
        </h2>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = category === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => {
                  updateParam("category", isActive ? "" : cat.value);
                }}
                className={`group flex flex-col items-center gap-3 rounded-2xl border bg-white p-4 text-xs shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900/80 ${
                  isActive
                    ? "border-cyan-400"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
                    cat.color
                  } ${
                    isActive
                      ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-950"
                      : ""
                  }`}
                >
                  <Icon className="h-9 w-9" />
                </div>
                <span className="text-[12px] font-semibold text-slate-800 group-hover:text-cyan-700 dark:text-slate-100 dark:group-hover:text-cyan-300">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* İLAN LİSTESİ */}
      <section className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            {loading ? "İlanlar yükleniyor…" : `${items.length} ilan bulundu`}
          </span>
        </div>

        {msg && <p className="text-xs text-red-500 dark:text-red-400">{msg}</p>}

        {!loading && items.length === 0 && !msg && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Filtrelere uygun ilan bulunamadı. Filtreleri azaltmayı
            deneyebilirsin.
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => {
            const heroImg = item.images?.[0]?.image_url;
            const catDef = CATEGORIES.find((c) => c.value === item.category);
            const CatIcon = catDef?.icon;

            return (
              <Link
                key={item.id}
                href={`/listings/${item.id}`}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-xs shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80"
              >
                {heroImg ? (
                  <img
                    src={heroImg}
                    alt={item.title}
                    className="h-36 w-full object-cover"
                  />
                ) : (
                  <div className="h-36 w-full bg-gradient-to-br from-cyan-500/30 to-violet-500/30" />
                )}
                <div className="space-y-1 p-3">
                  <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-cyan-600 dark:text-slate-100 dark:group-hover:text-cyan-300">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    {CatIcon && (
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-lg ${
                          catDef?.color || ""
                        }`}
                      >
                        <CatIcon className="h-3 w-3" />
                      </span>
                    )}
                    <span className="truncate">
                      {item.city} • {item.category} • {item.condition}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-cyan-700 dark:text-cyan-300">
                    {item.price.toLocaleString("tr-TR")} ₺
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
