// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { ListingWithImages } from "@/lib/types";

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

export default function HomePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userCity, setUserCity] = useState<string | null>(null);

  const [newestListings, setNewestListings] = useState<ListingWithImages[]>([]);
  const [nearbyListings, setNearbyListings] = useState<ListingWithImages[]>([]);
  const [recentLocal, setRecentLocal] = useState<RecentListingEntry[]>([]);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // 1) Kullanıcı şehir bilgisi
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("city")
          .eq("id", user.id)
          .maybeSingle();

        if (profileData?.city) {
          setUserCity(profileData.city as string);
        }
      }

      // 2) En yeni ilanlar
      const { data: newestData } = await supabase
        .from("listings")
        .select("*, listing_images(image_url)")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(12);

      if (newestData) {
        const mapped = (newestData as any[]).map((row) => ({
          ...row,
          images: row.listing_images as { image_url: string }[] | undefined,
        }));
        setNewestListings(mapped);
      }

      // 3) Sana yakın ilanlar (şehir varsa)
      if (userCity) {
        const { data: nearbyData } = await supabase
          .from("listings")
          .select("*, listing_images(image_url)")
          .eq("status", "active")
          .eq("city", userCity)
          .order("created_at", { ascending: false })
          .limit(8);

        if (nearbyData) {
          const mapped = (nearbyData as any[]).map((row) => ({
            ...row,
            images: row.listing_images as { image_url: string }[] | undefined,
          }));
          setNearbyListings(mapped);
        }
      }

      // 4) Tarayıcıya özel: Son baktığın ilanlar (localStorage)
      if (typeof window !== "undefined") {
        try {
          const raw = window.localStorage.getItem("recentListings");
          if (raw) {
            const parsed = JSON.parse(raw) as RecentListingEntry[];
            setRecentLocal(parsed.slice(0, 4)); // sadece ilk 4 tanesi ana sayfada
          }
        } catch {
          // sessiz geç
        }
      }

      setLoading(false);
    };

    load();
    // userCity’yi dependency’e koymuyoruz, yoksa iki kez çalışır
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const featuredCategories: { slug: string; label: string; emoji: string }[] = [
    { slug: "Elektronik", label: "Elektronik", emoji: "📱" },
    { slug: "Ev & Yaşam", label: "Ev & Yaşam", emoji: "🏠" },
    { slug: "Oyun & Konsol", label: "Oyun & Konsol", emoji: "🎮" },
    { slug: "Kitap", label: "Kitap & Dergi", emoji: "📚" },
    { slug: "Giyim", label: "Giyim & Aksesuar", emoji: "👕" },
    { slug: "Diğer", label: "Diğer", emoji: "✨" },
  ];

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();

    const q = searchQuery.trim();

    if (!q) {
      router.push("/explore");
      return;
    }

    const params = new URLSearchParams();
    params.set("search", q);

    router.push(`/explore?${params.toString()}`);
  }

  return (
    <div className="space-y-8 py-6">
      {/* HERO ALANI + ARAMA */}
      <section className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-6 md:grid-cols-[2fr,1.2fr] md:items-center">
          <div className="space-y-4">
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-50">
                Kullanmadığın eşyalar rafta değil,
                <br />
                <span className="text-cyan-600 dark:text-cyan-300">
                  cebinde dursun.
                </span>
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Şehrindeki insanlarla güvenli bir şekilde ikinci el ürün alıp
                sat. İlan ver, mesajlaş, satıcı puanlarını gör; hepsi tek yerde.
              </p>
            </div>

            {/* ARAMA FORMU */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-2 text-sm shadow-inner dark:border-slate-700 dark:bg-slate-900/60"
            >
              <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Ne arıyorsun?
              </label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Örn: iPhone 11, çalışma masası, PS4, kitaplık..."
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 sm:min-w-[120px] dark:text-slate-950"
                >
                  Ara
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                İstersen yukarıdan kategorilere göre de filtreleyebilirsin.
              </p>
            </form>

            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href="/listings/new"
                className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 dark:text-slate-950"
              >
                + Hemen ilan ver
              </Link>
              <Link
                href="/explore"
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                İlanlara göz at
              </Link>
            </div>
          </div>

          <div className="relative hidden h-40 overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/20 via-violet-500/20 to-amber-500/20 p-4 md:flex md:h-48">
            <div className="m-auto space-y-2 text-sm text-slate-800 dark:text-slate-100">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Neler bulabilirsin?
              </p>
              <ul className="space-y-1 text-sm">
                <li>📱 Uygun fiyatlı telefon & tabletler</li>
                <li>🎮 Konsol, oyun, ekipman</li>
                <li>📚 Kitap, ders notu, hobi ürünleri</li>
                <li>🏠 Ev & yaşam ürünleri</li>
              </ul>
              <p className="pt-1 text-[11px] text-slate-600 dark:text-slate-300">
                Her ilan satıcı puanı ve mesajlaşma sistemiyle desteklenir.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ÖNE ÇIKAN KATEGORİLER */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Öne çıkan kategoriler
          </h2>
          <Link
            href="/explore"
            className="text-[11px] text-cyan-600 hover:underline dark:text-cyan-400"
          >
            Tüm ilanları gör →
          </Link>
        </div>
        <div className="grid gap-2 sm:grid-cols-3 md:grid-cols-6">
          {featuredCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/explore?category=${encodeURIComponent(cat.slug)}`}
              className="flex flex-col items-start justify-between rounded-2xl border border-slate-200 bg-white px-3 py-3 text-xs shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80"
            >
              <span className="text-base">{cat.emoji}</span>
              <div className="mt-2">
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {cat.label}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  İlanlara bak →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SANA YAKIN İLANLAR (ŞEHİR VARSA) */}
      {userCity && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Sana yakın ilanlar{" "}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                ({userCity})
              </span>
            </h2>
          </div>

          {loading && nearbyListings.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Yakın ilanlar yükleniyor…
            </p>
          ) : nearbyListings.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Şehrinde henüz aktif ilan yok. Yine de{" "}
              <Link
                href="/listings/new"
                className="text-cyan-600 hover:underline dark:text-cyan-400"
              >
                ilk ilanı sen verebilirsin.
              </Link>
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              {nearbyListings.map((item) => {
                const heroImg = item.images?.[0]?.image_url;
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
          )}
        </section>
      )}

      {/* EN YENİ İLANLAR */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            En yeni ilanlar
          </h2>
          <Link
            href="/explore"
            className="text-[11px] text-cyan-600 hover:underline dark:text-cyan-400"
          >
            Tümünü gör →
          </Link>
        </div>

        {loading && newestListings.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            En yeni ilanlar yükleniyor…
          </p>
        ) : newestListings.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Henüz hiç ilan yok.{" "}
            <Link
              href="/listings/new"
              className="text-cyan-600 hover:underline dark:text-cyan-400"
            >
              İlk ilanı sen verebilirsin.
            </Link>
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {newestListings.map((item) => {
              const heroImg = item.images?.[0]?.image_url;
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
        )}
      </section>

      {/* SON BAKTIĞIN İLANLAR (KISA ÖNİZLEME) */}
      {recentLocal.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Son baktığın ilanlar
            </h2>
            <Link
              href="/recent"
              className="text-[11px] text-cyan-600 hover:underline dark:text-cyan-400"
            >
              Tümünü gör →
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {recentLocal.map((item) => (
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
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
