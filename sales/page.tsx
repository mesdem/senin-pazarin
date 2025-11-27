// app/sales/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

type OrderWithListing = {
  id: string;
  status: string | null;
  created_at: string;
  total_price: number | null;
  shipping_status: string | null;
  shipped_at: string | null;
  buyer_id: string;
  seller_id: string;
  listing: {
    id: string;
    title: string;
    price: number;
    city: string | null;
  } | null;
};

function getStatusBadge(status: string | null) {
  if (status === "paid") {
    return {
      text: "Ödeme alındı",
      className:
        "bg-emerald-500/10 text-emerald-600 border border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-400/60",
    };
  }
  if (status === "cancelled") {
    return {
      text: "İptal edildi",
      className:
        "bg-red-500/10 text-red-600 border border-red-500/40 dark:bg-red-500/10 dark:text-red-200 dark:border-red-400/60",
    };
  }
  return {
    text: "Beklemede",
    className:
      "bg-slate-500/10 text-slate-600 border border-slate-500/40 dark:bg-slate-700/40 dark:text-slate-200 dark:border-slate-500/60",
  };
}

function getShippingBadge(status: string | null) {
  if (status === "shipped") {
    return {
      text: "Kargoya verildi",
      className:
        "bg-amber-500/10 text-amber-700 border border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-400/60",
      icon: "🚚",
    };
  }

  return {
    text: "Hazırlanıyor",
    className:
      "bg-slate-500/10 text-slate-600 border border-slate-500/40 dark:bg-slate-700/40 dark:text-slate-200 dark:border-slate-500/60",
    icon: "📦",
  };
}

export default function SalesPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderWithListing[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      // 1) Kullanıcı kontrolü
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUserId(user.id);

      // 2) Bu kullanıcının sattığı ürünlere ait siparişler
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          id,
          status,
          created_at,
          total_price,
          shipping_status,
          shipped_at,
          buyer_id,
          seller_id,
          listing:listings (
            id,
            title,
            price,
            city
          )
        `
        )
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setError("Siparişler yüklenirken bir hata oluştu.");
        setOrders([]);
      } else {
        // data bilinmiyor olabilir → önce array olduğundan emin olalım
        const raw = Array.isArray(data) ? data : [];

        // Sonra kesin tip dönüşümü
        const rows: OrderWithListing[] = raw.map((row: any) => ({
          id: row.id,
          status: row.status,
          created_at: row.created_at,
          total_price: row.total_price,
          shipping_status: row.shipping_status,
          shipped_at: row.shipped_at,
          buyer_id: row.buyer_id,
          seller_id: row.seller_id,
          listing: row.listing
            ? {
                id: row.listing.id,
                title: row.listing.title,
                price: row.listing.price,
                city: row.listing.city,
              }
            : null,
        }));

        setOrders(rows);
      }

      setLoading(false);
    };

    load();
  }, [router]);

  async function handleMarkAsShipped(orderId: string) {
    const ok = window.confirm(
      "Bu siparişi kargoya verdiğini işaretlemek istediğine emin misin? Bu bilgi alıcıya da gösterilecek."
    );
    if (!ok) return;

    setUpdatingId(orderId);
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("orders")
      .update({
        shipping_status: "shipped",
        shipped_at: now,
      })
      .eq("id", orderId)
      .eq("seller_id", userId!);

    if (error) {
      console.error(error);
      alert("Durum güncellenirken bir hata oluştu: " + error.message);
    } else {
      // local state güncelle
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                shipping_status: "shipped",
                shipped_at: now,
              }
            : o
        )
      );
      alert("Sipariş kargoya verildi olarak işaretlendi.");
    }

    setUpdatingId(null);
  }

  if (!userId && !loading) {
    return null;
  }

  return (
    <div className="py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            Satışlarım
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            İlanlarından gelen siparişleri ve kargo durumlarını buradan
            yönetebilirsin.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Satışlar yükleniyor…
        </p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Henüz hiç satışın yok.{" "}
          <Link
            href="/listings/new"
            className="text-cyan-600 hover:underline dark:text-cyan-400"
          >
            İlk ilanını oluşturarak başlayabilirsin.
          </Link>
        </p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const statusBadge = getStatusBadge(order.status);
            const shippingBadge = getShippingBadge(order.shipping_status);
            const listing = order.listing;

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {listing ? (
                        <Link
                          href={`/listings/${listing.id}`}
                          className="text-sm font-semibold text-slate-900 hover:text-cyan-600 dark:text-slate-100 dark:hover:text-cyan-300"
                        >
                          {listing.title}
                        </Link>
                      ) : (
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          İlan bulunamadı
                        </span>
                      )}
                    </div>
                    {listing && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {listing.city || "Şehir belirtilmedi"} •{" "}
                        {listing.price?.toLocaleString("tr-TR")} ₺ (İlan fiyatı)
                      </p>
                    )}
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Sipariş tarihi:{" "}
                      {new Date(order.created_at).toLocaleString("tr-TR")}
                    </p>
                    {order.shipped_at && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Kargoya verildi:{" "}
                        {new Date(order.shipped_at).toLocaleString("tr-TR")}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 text-xs sm:min-w-[180px]">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <span
                        className={
                          "inline-flex items-center rounded-full px-2 py-1 text-[10px] font-medium " +
                          statusBadge.className
                        }
                      >
                        {statusBadge.text}
                      </span>
                      <span
                        className={
                          "inline-flex items-center rounded-full px-2 py-1 text-[10px] font-medium " +
                          shippingBadge.className
                        }
                      >
                        <span className="mr-1">{shippingBadge.icon}</span>
                        {shippingBadge.text}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Toplam: {(order.total_price ?? 0).toLocaleString("tr-TR")}{" "}
                      ₺
                    </p>

                    {order.shipping_status !== "shipped" && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsShipped(order.id)}
                        disabled={updatingId === order.id}
                        className="mt-1 rounded-xl border border-emerald-500/60 px-3 py-1.5 text-[11px] font-semibold text-emerald-600 hover:bg-emerald-500/10 disabled:opacity-60 dark:border-emerald-400/70 dark:text-emerald-200 dark:hover:bg-emerald-500/10"
                      >
                        {updatingId === order.id
                          ? "Güncelleniyor…"
                          : "Kargoya verdim"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
