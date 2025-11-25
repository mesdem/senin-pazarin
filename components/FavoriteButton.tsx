// components/FavoriteButton.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type FavoriteButtonProps = {
  listingId: string;
};

export default function FavoriteButton({ listingId }: FavoriteButtonProps) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // 1) Kullanıcı var mı?
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      if (!u) {
        setUserId(null);
        setIsFavorite(false);
        setLoading(false);
        return;
      }

      setUserId(u.id);

      // 2) Bu ilan zaten favoride mi?
      const { data: favData } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", u.id)
        .eq("listing_id", listingId)
        .maybeSingle();

      setIsFavorite(!!favData);
      setLoading(false);
    };

    load();
  }, [listingId]);

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault(); // kart linkini tetiklemesin
    e.stopPropagation();

    if (!userId) {
      router.push("/auth/login");
      return;
    }

    setLoading(true);

    if (isFavorite) {
      // kaldır
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("listing_id", listingId);
      setIsFavorite(false);
    } else {
      // ekle
      await supabase.from("favorites").insert({
        user_id: userId,
        listing_id: listingId,
      });
      setIsFavorite(true);
    }

    setLoading(false);
  }

  const icon = isFavorite ? "♥" : "♡";

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      disabled={loading}
      className={`rounded-full border border-slate-700 bg-slate-900/80 px-2 py-1 text-xs ${
        isFavorite ? "text-pink-400" : "text-slate-300"
      }`}
    >
      {loading ? "…" : icon}
    </button>
  );
}
