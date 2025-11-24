// app/listings/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { ListingWithImages } from "@/lib/types";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [item, setItem] = useState<ListingWithImages | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // 1) Oturumdaki kullanıcıyı al
      const { data: userData } = await supabase.auth.getUser();
      setUserId(userData.user?.id ?? null);

      // 2) İlanı al (görsellerle birlikte)
      const { data, error } = await supabase
        .from("listings")
        .select("*, listing_images(image_url)")
        .eq("id", id)
        .single();

      if (!error && data) {
        setItem({
          ...(data as any),
          images: (data as any).listing_images,
        });
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
      .eq("user_id", userId); // sadece kendi ilanını silebilsin

    if (error) {
      setMsg("İlan silinirken bir hata oluştu: " + error.message);
    } else {
      setMsg("İlan silindi.");
      router.push("/profile"); // profil sayfasına dön
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

  return (
    <div className="grid gap-6 py-4 md:grid-cols-[2fr,1fr]">
      <div className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
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
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-200 whitespace-pre-line">
          {item.description}
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <h1 className="text-lg font-semibold">{item.title}</h1>
          <p className="mt-1 text-xs text-slate-400">
            {item.city} • {item.category} • {item.condition}
          </p>
          <p className="mt-3 text-2xl font-bold text-cyan-300">
            {item.price.toLocaleString("tr-TR")} ₺
          </p>

          {/* İlan sahibi DEĞİLSEN mesaj butonu */}
          {!isOwner && (
            <button
              className="mt-4 w-full rounded-xl bg-cyan-400 py-2 text-sm font-semibold text-slate-900"
              onClick={() => {
                if (!userId) {
                  // giriş yoksa login sayfasına
                  router.push("/auth/login");
                } else {
                  // giriş varsa bu ilanın mesaj sayfasına
                  router.push(`/messages/${item.id}`);
                }
              }}
            >
              Mesaj Gönder
            </button>
          )}

          {/* İlan sahibiysen yönetim butonları */}
          {isOwner && (
            <div className="mt-4 space-y-2 border-t border-slate-800 pt-3 text-xs">
              <p className="text-slate-400">Bu ilan sana ait.</p>
              <div className="flex gap-2">
                <Link
                  href={`/listings/${item.id}/edit`}
                  className="flex-1 rounded-xl border border-slate-600 px-3 py-2 text-center"
                >
                  Düzenle
                </Link>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 rounded-xl border border-red-500/60 px-3 py-2 text-red-300 hover:bg-red-500/10"
                >
                  Sil
                </button>
              </div>
              {msg && <p className="text-[11px] text-slate-400">{msg}</p>}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-xs text-slate-300">
          <p className="font-semibold text-slate-100">
            Güvenli alışveriş ipuçları
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>Tanımadığın kişilere kapora gönderme.</li>
            <li>Mümkünse ürünü görerek teslim al.</li>
            <li>Şüpheli ilanları bildir (gelecek sürüm).</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
