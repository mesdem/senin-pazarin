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

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [item, setItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [seller, setSeller] = useState<SellerProfile | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // 1) Oturumdaki kullanıcı
      const { data: userData } = await supabase.auth.getUser();
      setUserId(userData.user?.id ?? null);

      // 2) İlan + görseller
      const { data, error } = await supabase
        .from("listings")
        .select("*, listing_images(image_url)")
        .eq("id", id)
        .single();

      if (error || !data) {
        setItem(null);
        setLoading(false);
        return;
      }

      const listingAny = data as any;
      const mapped = {
        ...listingAny,
        images: listingAny.listing_images as
          | { image_url: string }[]
          | undefined,
      };
      setItem(mapped);

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

  // 🛒 SEPETE EKLE FONKSİYONU — bileşenin İÇİNDE, diğer handle'ların yanında
  async function handleAddToCart() {
    if (!item) return;

    if (!userId) {
      router.push("/auth/login");
      return;
    }

    // Kendi ilanını sepete ekleme
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

  const heroImg = item.images?.[0]?.image_url;
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
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          {/* Favori butonu */}
          <div className="absolute right-3 top-3 z-20">
            <FavoriteButton listingId={String(item.id)} />
          </div>

          {heroImg ? (
            <img
              src={heroImg}
              alt={item.title}
              className="h-72 w-full object-cover"
            />
          ) : (
            <div className="h-72 w-full bg-gradient-to-br from-cyan-500/30 to-violet-500/30" />
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-800 whitespace-pre-line dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          {item.description}
        </div>

        {/* İlan yorumları / değerlendirmeler */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <ListingReviews listingId={String(item.id)} />
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

          {/* 🛒 Sepet + Mesaj butonları */}
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

          {/* Şüpheli ilan bildir */}
          {!isOwner && (
            <button
              className="mt-2 w-full rounded-xl border border-red-500/60 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/10 dark:text-red-300"
              onClick={handleReport}
            >
              Şüpheli ilan bildir
            </button>
          )}

          {/* İlan aktif değilse ve sahip değilsen küçük bilgi */}
          {!isOwner && currentStatus !== "active" && (
            <p className="mt-3 text-xs text-amber-500 dark:text-amber-300">
              Bu ilan artık aktif değil.
            </p>
          )}

          {/* İlan sahibiysen: yönetim paneli */}
          {isOwner && (
            <div className="mt-4 space-y-3 border-t border-slate-200 pt-3 text-xs dark:border-slate-800">
              <p className="text-slate-500 dark:text-slate-400">
                Bu ilan sana ait.
              </p>

              {/* Durum butonları */}
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

              {/* Düzenle / Sil */}
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

        {/* Satıcı kartı */}
        {seller && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs dark:border-slate-800 dark:bg-slate-900">
            <p className="text-slate-500 dark:text-slate-400">Satıcı</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-300 bg-slate-100 text-[11px] font-semibold dark:border-slate-700 dark:bg-slate-800">
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
            <li>Tanımadığın kişilere kapora gönderme.</li>
            <li>Mümkünse ürünü görerek teslim al.</li>
            <li>Şüpheli ilanları bildir.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
