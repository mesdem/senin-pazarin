// components/SellerRatingSummary.tsx
"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";

type ReviewRow = {
  id: number;
  seller_id: string;
  rating: number;
  created_at: string;
};

type Props = {
  sellerId: string;
  className?: string;
};

export default function SellerRatingSummary({
  sellerId,
  className = "",
}: Props) {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("reviews")
        .select("id, seller_id, rating, created_at")
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setReviews(data as ReviewRow[]);
      }

      setLoading(false);
    };

    if (sellerId) {
      load();
    }
  }, [sellerId]);

  const { avgRating, totalCount } = useMemo(() => {
    if (reviews.length === 0) {
      return { avgRating: 0, totalCount: 0 };
    }
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    const avg = sum / reviews.length;
    return {
      avgRating: Number(avg.toFixed(1)),
      totalCount: reviews.length,
    };
  }, [reviews]);

  // JSX.Element yerine ReactNode[] kullanıyoruz
  function renderStars(value: number): ReactNode[] {
    const fullStars = Math.floor(value);
    const hasHalf = value - fullStars >= 0.5;
    const total = hasHalf ? fullStars + 1 : fullStars;

    const stars: ReactNode[] = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={`full-${i}`} className="text-sm text-yellow-500">
          ★
        </span>
      );
    }
    if (hasHalf) {
      stars.push(
        <span key="half" className="text-sm text-yellow-500">
          ★
        </span>
      );
    }
    for (let i = total; i < 5; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-sm text-yellow-500/40">
          ★
        </span>
      );
    }
    return stars;
  }

  return (
    <div
      className={
        "rounded-2xl border border-slate-200 bg-white p-3 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-900 " +
        className
      }
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Satıcı puanı
      </p>

      {loading ? (
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          Yükleniyor…
        </p>
      ) : totalCount === 0 ? (
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          Bu satıcı henüz hiç yorum almamış.
        </p>
      ) : (
        <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {renderStars(avgRating)}
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {avgRating} / 5
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Toplam <span className="font-semibold">{totalCount}</span> yorum
          </p>
        </div>
      )}
    </div>
  );
}
