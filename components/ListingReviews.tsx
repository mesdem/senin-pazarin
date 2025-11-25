// components/ListingReviews.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";

type ReviewRow = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

type Props = {
  listingId: string;
};

export default function ListingReviews({ listingId }: Props) {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setMsg("");

      const { data: authData } = await supabase.auth.getUser();
      setUserId(authData.user?.id ?? null);

      const { data, error } = await supabase
        .from("listing_reviews")
        .select("id, rating, comment, created_at")
        .eq("listing_id", listingId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setMsg("Yorumlar yüklenirken bir hata oluştu.");
        setReviews([]);
        setLoading(false);
        return;
      }

      setReviews((data as any[]) || []);
      setLoading(false);
    };

    load();
  }, [listingId]);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (!userId) {
      setMsg("Yorum yazmak için giriş yapmalısın.");
      return;
    }

    if (!rating) {
      setMsg("Lütfen bir puan seç.");
      return;
    }

    setSaving(true);

    // İlanın satıcısını bul (seller_id için)
    const { data: listingData, error: listingError } = await supabase
      .from("listings")
      .select("user_id")
      .eq("id", listingId)
      .maybeSingle();

    if (listingError || !listingData) {
      setMsg("İlan bilgisi alınamadı.");
      setSaving(false);
      return;
    }

    const sellerId = (listingData as any).user_id as string;

    // Aynı kullanıcı aynı ilan için birden fazla yorum yazmasın diye upsert mantığı da kurulabilir
    const { error } = await supabase.from("listing_reviews").insert({
      listing_id: listingId,
      seller_id: sellerId,
      reviewer_id: userId,
      rating,
      comment: comment.trim() || null,
    });

    if (error) {
      setMsg("Yorum kaydedilirken hata oluştu: " + error.message);
      setSaving(false);
      return;
    }

    setComment("");
    setRating(5);
    setMsg("Yorumun kaydedildi.");

    // Listeyi yeniden yükle
    const { data: newData } = await supabase
      .from("listing_reviews")
      .select("id, rating, comment, created_at")
      .eq("listing_id", listingId)
      .order("created_at", { ascending: false });

    setReviews((newData as any[]) || []);
    setSaving(false);
  }

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            İlan değerlendirmeleri
          </h2>
          {reviews.length > 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {reviews.length} yorum • Ortalama{" "}
              {avgRating.toFixed(1).replace(".", ",")} / 5
            </p>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bu ilan için henüz yorum yapılmamış.
            </p>
          )}
        </div>

        {reviews.length > 0 && (
          <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-100">
            <StarSolid className="h-4 w-4 text-amber-400" />
            <span>{avgRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {msg && (
        <p className="text-xs text-slate-600 dark:text-slate-300">{msg}</p>
      )}

      {/* Yorum formu */}
      <form
        onSubmit={handleSubmit}
        className="space-y-3 rounded-2xl bg-slate-50 p-3 text-xs dark:bg-slate-950/40"
      >
        <p className="font-semibold text-slate-800 dark:text-slate-100">
          Bu ilanı değerlendirin
        </p>

        {!userId && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Yorum yazmak için{" "}
            <a
              href="/auth/login"
              className="font-semibold text-cyan-600 hover:underline dark:text-cyan-400"
            >
              giriş yap
            </a>
            .
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setRating(v)}
                className="p-0.5"
              >
                <StarSolid
                  className={`h-5 w-5 ${
                    v <= rating
                      ? "text-amber-400"
                      : "text-slate-300 dark:text-slate-600"
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Puan: {rating} / 5
          </span>
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Ürün / satıcı hakkında deneyimini yazabilirsin (isteğe bağlı)."
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
          rows={3}
          disabled={!userId}
        />

        <button
          type="submit"
          disabled={saving || !userId}
          className="rounded-xl bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-900 disabled:opacity-60 dark:text-slate-950"
        >
          {saving ? "Kaydediliyor..." : "Yorumu gönder"}
        </button>
      </form>

      {/* Yorum listesi */}
      {loading ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Yorumlar yükleniyor…
        </p>
      ) : reviews.length === 0 ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Henüz yorum yok.
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-slate-200 bg-white p-3 text-xs dark:border-slate-800 dark:bg-slate-900/70"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <StarSolid
                      key={v}
                      className={`h-4 w-4 ${
                        v <= r.rating
                          ? "text-amber-400"
                          : "text-slate-300 dark:text-slate-700"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {new Date(r.created_at).toLocaleDateString("tr-TR")}
                </span>
              </div>
              {r.comment && (
                <p className="mt-2 text-[11px] text-slate-700 dark:text-slate-200 whitespace-pre-line">
                  {r.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
