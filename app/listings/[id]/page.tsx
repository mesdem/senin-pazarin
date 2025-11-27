// app/listings/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import ListingReviews from "@/components/ListingReviews";

type SellerProfile = {
  username: string | null;
  full_name: string | null;
  city: string | null;
  avatar_url: string | null;
};

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

type ListingImage = {
  image_url: string;
  id?: string;
};

type ListingWithImages = {
  id: string;
  title: string;
  description: string;
  price: number;
  city: string | null;
  category: string | null;
  condition: string | null;
  status: "active" | "sold" | "inactive";
  ships_in_24h?: boolean;
  listing_images?: ListingImage[];
  images?: ListingImage[];
  user_id: string;
};

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [item, setItem] = useState<ListingWithImages | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [seller, setSeller] = useState<SellerProfile | null>(null);

  // Son baktığın ilanlar: localStorage'a yaz
  useEffect(() => {
    if (!item) return;
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem("recentListings");
      let parsed: RecentListingEntry[] = raw ? JSON.parse(raw) : [];

      // Aynı ilan zaten varsa listeden çıkar
      parsed = parsed.filter((entry) => entry.id !== String(item.id));

      // İlanın görseli (önce images, sonra listing_images fallback)
      const imageUrl =
        item.images?.[0]?.image_url ??
        item.listing_images?.[0]?.image_url ??
        null;

      // En üste ekle
      parsed.unshift({
        id: String(item.id),
        title: item.title,
        price: item.price,
        city: item.city,
        category: item.category,
        condition: item.condition,
        image_url: imageUrl,
        viewedAt: new Date().toISOString(),
      });

      // En fazla 20 kayıt tut
      parsed = parsed.slice(0, 20);

      window.localStorage.setItem("recentListings", JSON.stringify(parsed));
    } catch (err) {
      console.error("recentListings yazılırken hata:", err);
    }
  }, [item]);

  // Galeri için seçili görsel
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Benzer ilanlar
  const [similarListings, setSimilarListings] = useState<ListingWithImages[]>(
    []
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // 1) Oturumdaki kullanıcı
      const { data: userData } = await supabase.auth.getUser();
      setUserId(userData.user?.id ?? null);

      // 2) İlan + görseller
      const { data, error } = await supabase
        .from("listings")
        .select("*, listing_images(image_url, id)")
        .eq("id", id)
        .single();

      if (error || !data) {
        setItem(null);
        setLoading(false);
        return;
      }

      const listingAny = data as any;
      const mapped: ListingWithImages = {
        ...listingAny,
        images: (listingAny.listing_images || []) as ListingImage[],
      };

      setItem(mapped);
      setSelectedIndex(0);

      // 3) Satıcı profili
      const sellerId = listingAny.user_id as string;
      const { data: profileData } = await supabase
        .from("profiles")
        .select("username, full_name, city, avatar_url")
        .eq("id", sellerId)
        .maybeSingle();

      if (profileData) {
        setSeller(profileData as SellerProfile);
      }

      // 4) Benzer ilanlar:
      // Önce: aynı kategori + aktif + bu ilan hariç
      let similar: any[] = [];

      if (listingAny.category) {
        const { data: similarCatData } = await supabase
          .from("listings")
          .select("*, listing_images(image_url, id)")
          .eq("status", "active")
          .eq("category", listingAny.category)
          .neq("id", listingAny.id)
          .order("created_at", { ascending: false })
          .limit(8);

        if (similarCatData && similarCatData.length > 0) {
          similar = similarCatData;
        }
      }

      // Eğer hâlâ boşsa: kategori bakmadan en yeni aktif ilanlar (bu ilan hariç)
      if (!similar || similar.length === 0) {
        const { data: similarAnyData } = await supabase
          .from("listings")
          .select("*, listing_images(image_url, id)")
          .eq("status", "active")
          .neq("id", listingAny.id)
          .order("created_at", { ascending: false })
          .limit(8);

        if (similarAnyData && similarAnyData.length > 0) {
          similar = similarAnyData;
        }
      }

      if (similar && similar.length > 0) {
        const mappedSimilar = (similar as any[]).map((row) => ({
          ...row,
          images: (row.listing_images || []) as ListingImage[],
        }));
        setSimilarListings(mappedSimilar as ListingWithImages[]);
      } else {
        setSimilarListings([]);
      }

      setLoading(false);
    };

    if (id) {
      load();
    }
  }, [id]);

  async function handleDelete() {
    if (!item || !userId) return;
    const ok = window.confirm("Bu ilanı silmek istediğine emin misin?");
    if (!ok) return;

    setMsg("");
    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", item.id)
      .eq("user_id", userId);

    if (error) {
      setMsg("İlan silinirken bir hata oluştu: " + error.message);
    } else {
      setMsg("İlan silindi.");
      router.push("/profile");
    }
  }

  async function handleReport() {
    if (!item) return;

    if (!userId) {
      router.push("/auth/login");
      return;
    }

    const reason = window.prompt(
      "Bu ilan neden şüpheli? (kısa bir açıklama yazabilirsin)"
    );

    if (!reason || reason.trim() === "") {
      return;
    }

    setMsg("");

    const { error } = await supabase.from("listing_reports").insert({
      listing_id: item.id,
      reporter_id: userId,
      reason: reason.trim(),
    });

    if (error) {
      setMsg("Rapor gönderilirken hata oluştu: " + error.message);
    } else {
      setMsg("Raporun alındı. Teşekkür ederiz.");
    }
  }

  async function handleStatusChange(newStatus: "active" | "sold" | "inactive") {
    if (!item || !userId) return;

    setMsg("");
    const { error } = await supabase
      .from("listings")
      .update({ status: newStatus })
      .eq("id", item.id)
      .eq("user_id", userId);

    if (error) {
      setMsg("Durum güncellenirken hata oluştu: " + error.message);
    } else {
      setMsg("İlan durumu güncellendi.");
      setItem({ ...item, status: newStatus });
    }
  }

  async function handleAddToCart() {
    if (!item) return;

    if (!userId) {
      router.push("/auth/login");
      return;
    }

    if (item.user_id === userId) {
      setMsg("Kendi ilanını sepete ekleyemezsin.");
      return;
    }

    setMsg("");

    const { error } = await supabase.from("cart_items").insert({
      user_id: userId,
      listing_id: item.id,
    });

    if (error) {
      setMsg("Sepete eklenirken bir hata oluştu: " + error.message);
    } else {
      setMsg("Ürün sepetine eklendi.");
    }
  }

  if (loading) {
    return <p className="mt-4 text-sm text-slate-400">Yükleniyor…</p>;
  }

  if (!item) {
    return <p className="mt-4 text-sm text-slate-400">İlan bulunamadı.</p>;
  }

  const images: ListingImage[] = item.images || [];
  const currentImage =
    images.length > 0
      ? images[Math.min(selectedIndex, images.length - 1)]
      : null;

  const isOwner = userId && item.user_id === userId;
  const currentStatus: "active" | "sold" | "inactive" = item.status || "active";

  let statusLabel = "Aktif";
  let statusClass = "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";

  if (currentStatus === "sold") {
    statusLabel = "Satıldı";
    statusClass = "border-amber-500/40 bg-amber-500/10 text-amber-300";
  } else if (currentStatus === "inactive") {
    statusLabel = "Pasif";
    statusClass = "border-slate-500/60 bg-slate-800 text-slate-200";
  }

  const sellerDisplayName = seller?.full_name || seller?.username || "Satıcı";

  const sellerInitials = (seller?.full_name || seller?.username || "SP")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="grid gap-6 py-4 md:grid-cols-[2fr,1fr]">
      <div className="space-y-4">
        {/* Ana görsel + thumbnail galerisi */}
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="absolute right-3 top-3 z-20">
              <FavoriteButton listingId={String(item.id)} />
            </div>

            <div className="relative w-full aspect-[4/3] bg-slate-200 dark:bg-slate-900">
              {currentImage ? (
                <img
                  src={currentImage.image_url}
                  alt={item.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-slate-500 dark:text-slate-400">
                  Bu ilana ait görsel bulunmuyor.
                </div>
              )}
            </div>
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => {
                const isActive = idx === selectedIndex;
                return (
                  <button
                    key={img.id ?? idx}
                    type="button"
                    onClick={() => setSelectedIndex(idx)}
                    className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border transition ${
                      isActive
                        ? "border-cyan-400 ring-2 ring-cyan-400/60"
                        : "border-slate-300 dark:border-slate-700 hover:border-cyan-300"
                    }`}
                  >
                    <img
                      src={img.image_url}
                      alt={`Görsel ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Açıklama */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-800 whitespace-pre-line dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          {item.description}
        </div>

        {/* Yorumlar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <ListingReviews listingId={String(item.id)} />
        </div>

        {/* Benzer ilanlar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Benzer ilanlar
          </h2>

          {similarListings.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bu ürüne benzer başka ilan bulunamadı.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {similarListings.map((listing) => {
                const heroImg = listing.images?.[0]?.image_url;
                return (
                  <Link
                    key={listing.id}
                    href={`/listings/${listing.id}`}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-xs shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/80"
                  >
                    <div className="relative w-full aspect-[4/3] bg-slate-200 dark:bg-slate-800">
                      {heroImg ? (
                        <img
                          src={heroImg}
                          alt={listing.title}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-cyan-500/30 to-violet-500/30" />
                      )}
                    </div>
                    <div className="space-y-1 p-3">
                      <p className="line-clamp-1 text-sm font-semibold text-slate-900 group-hover:text-cyan-600 dark:text-slate-100 dark:group-hover:text-cyan-300">
                        {listing.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {listing.city || "Türkiye geneli"} •{" "}
                        {listing.condition || "Durum bilinmiyor"}
                      </p>
                      <p className="text-sm font-bold text-cyan-700 dark:text-cyan-300">
                        {listing.price.toLocaleString("tr-TR")} ₺
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-lg font-semibold">{item.title}</h1>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {item.city} • {item.category} • {item.condition}
              </p>
              {item.ships_in_24h && (
                <p className="mt-1 inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                  🚚 24 saatte kargoda
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Kargo ücreti: Satıcı öder
              </p>
            </div>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-medium ${statusClass}`}
            >
              {statusLabel}
            </span>
          </div>

          <p className="mt-3 text-2xl font-bold text-cyan-600 dark:text-cyan-300">
            {item.price.toLocaleString("tr-TR")} ₺
          </p>

          {!isOwner && currentStatus === "active" && (
            <div className="mt-3 space-y-2">
              <button
                className="w-full rounded-xl border border-emerald-400 bg-emerald-500/10 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-400/20 dark:text-emerald-300"
                onClick={handleAddToCart}
              >
                Sepete ekle
              </button>

              <button
                className="w-full rounded-xl bg-cyan-400 py-2 text-sm font-semibold text-slate-900 dark:text-slate-950"
                onClick={() => {
                  if (!userId) {
                    router.push("/auth/login");
                  } else {
                    router.push(`/messages/${item.id}`);
                  }
                }}
              >
                Mesaj Gönder
              </button>
            </div>
          )}

          {!isOwner && (
            <button
              className="mt-2 w-full rounded-xl border border-red-500/60 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/10 dark:text-red-300"
              onClick={handleReport}
            >
              Şüpheli ilan bildir
            </button>
          )}

          {!isOwner && currentStatus !== "active" && (
            <p className="mt-3 text-xs text-amber-500 dark:text-amber-300">
              Bu ilan artık aktif değil.
            </p>
          )}

          {isOwner && (
            <div className="mt-4 space-y-3 border-t border-slate-200 pt-3 text-xs dark:border-slate-800">
              <p className="text-slate-500 dark:text-slate-400">
                Bu ilan sana ait.
              </p>

              <div className="flex flex-wrap gap-2">
                {currentStatus !== "sold" && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange("sold")}
                    className="rounded-xl border border-amber-500/60 px-3 py-2 text-amber-600 hover:bg-amber-500/10 dark:text-amber-300"
                  >
                    Satıldı olarak işaretle
                  </button>
                )}

                {currentStatus === "active" && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange("inactive")}
                    className="rounded-xl border border-slate-400 px-3 py-2 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    İlanı pasifleştir
                  </button>
                )}

                {currentStatus !== "active" && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange("active")}
                    className="rounded-xl border border-emerald-500/60 px-3 py-2 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-300"
                  >
                    Tekrar yayına al
                  </button>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <Link
                  href={`/listings/${item.id}/edit`}
                  className="flex-1 rounded-xl border border-slate-400 px-3 py-2 text-center text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Düzenle
                </Link>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 rounded-xl border border-red-500/60 px-3 py-2 text-red-500 hover:bg-red-500/10 dark:text-red-300"
                >
                  Sil
                </button>
              </div>

              {msg && (
                <p className="text-[11px] text-slate-500 dark:text-slate-300">
                  {msg}
                </p>
              )}
            </div>
          )}

          {!isOwner && msg && (
            <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-300">
              {msg}
            </p>
          )}
        </div>

        {seller && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs dark:border-slate-800 dark:bg-slate-900">
            <p className="text-slate-500 dark:text-slate-400">Satıcı</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-300 bg-slate-100 text-[11px] font-semibold dark:border-slate-707 dark:bg-slate-800">
                {seller.avatar_url ? (
                  <img
                    src={seller.avatar_url}
                    alt={sellerDisplayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-slate-700 dark:text-slate-200">
                    {sellerInitials}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {sellerDisplayName}
                </p>
                {seller.city && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {seller.city}
                  </p>
                )}
                <Link
                  href={`/u/${item.user_id}`}
                  className="mt-1 inline-block text-[11px] text-cyan-600 hover:underline dark:text-cyan-400"
                >
                  Profilini gör →
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <p className="font-semibold text-slate-900 dark:text-slate-100">
            Güvenli alışveriş ipuçları
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>Mümkünse ürünü görerek teslim al.</li>
            <li>Şüpheli ilanları bildir.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
