// app/u/[userId]/page.tsx
"use client";

import SellerRatingSummary from "@/components/SellerRatingSummary";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import type { ListingWithImages } from "@/lib/types";

type PublicProfile = {
  username: string | null;
  full_name: string | null;
  city: string | null;
  about: string | null;
  avatar_url: string | null;
};

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params?.userId as string;

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [listings, setListings] = useState<ListingWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      setMsg("");

      // 1) Profil bilgilerini al
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("username, full_name, city, about, avatar_url")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) {
        setMsg("Profil yüklenirken hata oluştu.");
        setLoading(false);
        return;
      }

      if (!profileData) {
        setMsg("Bu kullanıcı için profil bulunamadı.");
        setLoading(false);
        return;
      }

      setProfile(profileData as PublicProfile);

      // 2) Kullanıcının aktif ilanlarını al
      const { data: listingsData, error: listingsError } = await supabase
        .from("listings")
        .select("*, listing_images(image_url)")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (!listingsError && listingsData) {
        const mapped = (listingsData as any[]).map((row) => ({
          ...row,
          images: row.listing_images as { image_url: string }[] | undefined,
        }));
        setListings(mapped);
      }

      setLoading(false);
    };

    load();
  }, [userId]);

  if (loading) {
    return (
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        Yükleniyor…
      </p>
    );
  }

  if (!profile) {
    return (
      <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
        {msg || "Profil bulunamadı."}
      </div>
    );
  }

  const displayName = profile.full_name || profile.username || "Kullanıcı";

  const displayInitials = (profile.full_name || profile.username || "SP")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6 py-4">
      {/* Satıcı puanı özeti */}
      <SellerRatingSummary sellerId={userId} />

      {/* Profil kartı */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm space-y-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-slate-300 bg-slate-100 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-slate-700 dark:text-slate-200">
                {displayInitials}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {displayName}
            </h1>
            {profile.username && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                @{profile.username}
              </p>
            )}
            {profile.city && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Şehir: {profile.city}
              </p>
            )}
          </div>
        </div>

        {profile.about ? (
          <p className="mt-2 text-sm text-slate-800 whitespace-pre-line dark:text-slate-100">
            {profile.about}
          </p>
        ) : (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Kullanıcı henüz kendisi hakkında bir şey yazmamış.
          </p>
        )}
      </section>

      {/* İlanlar */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Bu kullanıcının aktif ilanları
        </h2>

        {listings.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Bu kullanıcının şu anda aktif ilanı yok.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {listings.map((item) => {
              const heroImg = item.images?.[0]?.image_url;
              return (
                <Link
                  key={item.id}
                  href={`/listings/${item.id}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80 transition"
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
    </div>
  );
}
