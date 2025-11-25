// app/favorites/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ListingWithImages } from "@/lib/types";
import FavoriteButton from "@/components/FavoriteButton";

export default function FavoritesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<ListingWithImages[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // 1) Kullanıcı var mı?
      const { data: userData } = await supabase.auth.getUser();
      const u = userData.user;

      if (!u) {
        router.push("/auth/login");
        return;
      }

      // 2) Kullanıcının favorileri (listing_id listesi)
      const { data: favData, error: favError } = await supabase
        .from("favorites")
        .select("listing_id")
        .eq("user_id", u.id);

      if (favError) {
        setLoading(false);
        return;
      }

      const listingIds = (favData || []).map((f: any) => f.listing_id);

      if (listingIds.length === 0) {
        setListings([]);
        setLoading(false);
        return;
      }

      // 3) Bu ilanları detaylı çek
      const { data: listingsData, error: listingsError } = await supabase
        .from("listings")
        .select("*, listing_images(image_url)")
        .in("id", listingIds)
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
  }, [router]);

  if (loading) {
    return <p className="mt-4 text-sm text-slate-400">Yükleniyor…</p>;
  }

  return (
    <div className="space-y-4 py-4">
      <h1 className="text-lg font-semibold">Favori İlanların</h1>

      {listings.length === 0 ? (
        <p className="text-sm text-slate-400">
          Henüz favoriye eklediğin bir ilan yok.{" "}
          <Link href="/explore" className="text-cyan-300 hover:underline">
            İlanları keşfetmeye başla.
          </Link>
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {listings.map((item) => {
            const heroImg = item.images?.[0]?.image_url;
            return (
              <Link
                key={item.id}
                href={`/listings/${item.id}`}
                className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 relative"
              >
                <div className="absolute right-2 top-2 z-10">
                  <FavoriteButton listingId={String((item as any).id)} />
                </div>

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
