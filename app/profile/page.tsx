// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { ListingWithImages } from "@/lib/types";
import { useRouter } from "next/navigation";
import Link from "next/link";

type CurrentUser = {
  id: string;
  email?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [listings, setListings] = useState<ListingWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getUser();
      const u = data.user;

      if (!u) {
        setMsg("Profil sayfasını görmek için önce giriş yapmalısınız.");
        setLoading(false);
        router.push("/auth/login");
        return;
      }

      setUser({ id: u.id, email: u.email ?? undefined });

      const { data: listingsData, error } = await supabase
        .from("listings")
        .select("*, listing_images(image_url)")
        .eq("user_id", u.id)
        .order("created_at", { ascending: false });

      if (!error && listingsData) {
        const mapped = (listingsData as any[]).map((row) => ({
          ...row,
          images: row.listing_images as { image_url: string }[] | undefined,
        }));
        setListings(mapped);
      }

      setLoading(false);
    };

    load();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return <p className="mt-4 text-sm text-slate-400">Yükleniyor…</p>;
  }

  if (!user) {
    return (
      <div className="mt-4 text-sm text-slate-300">
        {msg || "Giriş yapılmamış."}
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      {/* Profil kartı */}
      <section className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-400">Hesabın</p>
            <p className="text-sm font-semibold">
              {user.email || "E-posta bilgisi yok"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-xl border border-slate-600 px-3 py-1 text-xs text-slate-200 hover:bg-slate-800"
          >
            Çıkış Yap
          </button>
        </div>
        <div className="text-xs text-slate-400">
          Buradan ilanlarını görebilir ve yönetebilirsin. (Düzenleme/silme
          işlemleri detay sayfasında.)
        </div>
      </section>

      {/* İlanlar listesi */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">İlanların</h2>
          <Link
            href="/listings/new"
            className="rounded-xl bg-cyan-400 px-3 py-1 text-xs font-semibold text-slate-900"
          >
            + Yeni İlan
          </Link>
        </div>

        {listings.length === 0 ? (
          <p className="text-xs text-slate-400">
            Henüz hiç ilan vermemişsin. İlk ilanı oluşturmak için yukarıdaki
            butona tıklayabilirsin.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {listings.map((item) => {
              const heroImg = item.images?.[0]?.image_url;
              return (
                <Link
                  key={item.id}
                  href={`/listings/${item.id}`}
                  className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-3 text-xs"
                >
                  {heroImg ? (
                    <img
                      src={heroImg}
                      alt={item.title}
                      className="mb-2 h-28 w-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="mb-2 h-28 w-full rounded-xl bg-gradient-to-br from-cyan-500/30 to-violet-500/30" />
                  )}
                  <p className="truncate text-sm font-semibold group-hover:text-cyan-300">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {item.city} • {item.category} • {item.condition}
                  </p>
                  <p className="mt-1 text-sm font-bold text-cyan-300">
                    {item.price.toLocaleString("tr-TR")} ₺
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
