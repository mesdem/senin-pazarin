"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type OrderStatus = "preparing" | "shipped" | "delivered" | "cancelled";

type OrderItem = {
  id: string;
  listingId: string | null;
  title: string;
  price: number;
  quantity: number;
};

type OrderDetail = {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
  sellerName: string | null;
  city: string | null;
  shippingAddress: string | null;
  note: string | null;
  items: OrderItem[];
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(status: OrderStatus) {
  switch (status) {
    case "preparing":
      return "Hazırlanıyor";
    case "shipped":
      return "Kargoya verildi";
    case "delivered":
      return "Teslim edildi";
    case "cancelled":
      return "İptal edildi";
    default:
      return status;
  }
}

function statusColors(status: OrderStatus) {
  switch (status) {
    case "preparing":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
    case "shipped":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    case "delivered":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
    case "cancelled":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    default:
      return "";
  }
}

export default function SiparisDetayPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = params?.id;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchOrder() {
    if (!orderId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/orders/${orderId}`, {
        method: "GET",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Sipariş yüklenirken bir hata oluştu.");
      }

      const json = await res.json();
      const o = json.data;

      const detail: OrderDetail = {
        id: o.id,
        orderNumber: o.order_number,
        createdAt: o.created_at,
        status: o.status,
        total: Number(o.total_amount),
        itemCount: o.item_count,
        sellerName: o.seller_display_name,
        city: o.seller_city,
        shippingAddress: o.shipping_address,
        note: o.note,
        items: (o.order_items || []).map((item: any) => ({
          id: item.id,
          listingId: item.listing_id,
          title: item.title_snapshot,
          price: Number(item.price_snapshot),
          quantity: item.quantity,
        })),
      };

      setOrder(detail);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Bilinmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const itemsTotal = order
    ? order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    : 0;

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Üst bar: geri dön */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => router.push("/siparislerim")}
            className="text-xs text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-50"
          >
            ← Siparişlerime dön
          </button>
        </div>

        {loading && !order ? (
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 p-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
            Sipariş detayları yükleniyor...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-300 dark:border-red-800 bg-red-50/80 dark:bg-red-900/40 p-6 text-sm text-red-700 dark:text-red-200">
            {error}
          </div>
        ) : !order ? (
          <div className="rounded-2xl border border-neutral-300 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 p-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
            Sipariş bulunamadı.
          </div>
        ) : (
          <>
            {/* Sipariş özeti */}
            <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 md:p-5 space-y-3 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs md:text-sm">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-50">
                      Sipariş No: {order.orderNumber}
                    </span>
                    <span
                      className={
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium " +
                        statusColors(order.status)
                      }
                    >
                      {statusLabel(order.status)}
                    </span>
                  </div>
                  <div className="text-[11px] md:text-xs text-neutral-500 dark:text-neutral-400">
                    {formatDate(order.createdAt)} • Satıcı:{" "}
                    <span className="font-medium text-neutral-700 dark:text-neutral-200">
                      {order.sellerName || "Satıcı"}
                    </span>{" "}
                    • {order.city || "Türkiye"}
                  </div>
                  <div className="text-[11px] md:text-xs text-neutral-500 dark:text-neutral-400">
                    {order.itemCount} ürün • Toplam{" "}
                    <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                      {order.total.toLocaleString("tr-TR")} TL
                    </span>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end gap-2 text-xs">
                  <button className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
                    Satıcıya mesaj gönder
                  </button>
                  <button className="px-3 py-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition">
                    Fatura / dekont indir
                  </button>
                </div>
              </div>

              {/* Adres & not */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] md:text-xs text-neutral-600 dark:text-neutral-300 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <div>
                  <div className="font-semibold mb-1">Teslimat adresi</div>
                  <div className="whitespace-pre-line">
                    {order.shippingAddress || "Adres bilgisi girilmemiş."}
                  </div>
                </div>
                <div>
                  <div className="font-semibold mb-1">Not</div>
                  <div className="whitespace-pre-line">
                    {order.note || "Not eklenmemiş."}
                  </div>
                </div>
              </div>
            </section>

            {/* Ürünler + özet */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Ürün listesi */}
              <div className="md:col-span-2 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm space-y-3">
                <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 mb-1">
                  Ürünler
                </h2>
                {order.items.length === 0 ? (
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    Bu siparişe ait ürün kaydı bulunamadı.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3 py-2"
                      >
                        <div className="flex-1">
                          <div className="text-xs md:text-sm font-medium text-neutral-900 dark:text-neutral-50 line-clamp-2">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                            Adet: {item.quantity} • Birim fiyat:{" "}
                            {item.price.toLocaleString("tr-TR")} TL
                          </div>
                        </div>
                        <div className="text-xs md:text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                          {(item.price * item.quantity).toLocaleString("tr-TR")}{" "}
                          TL
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ödeme özeti */}
              <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm space-y-2 text-sm">
                <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 mb-1">
                  Ödeme özeti
                </h2>
                <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-300">
                  <span>Ürünler toplamı</span>
                  <span>{itemsTotal.toLocaleString("tr-TR")} TL</span>
                </div>
                <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-300">
                  <span>Kargo</span>
                  <span>Dahil / Hariç (mock)</span>
                </div>
                <div className="border-t border-neutral-200 dark:border-neutral-800 my-2" />
                <div className="flex justify-between text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                  <span>Genel toplam</span>
                  <span>{order.total.toLocaleString("tr-TR")} TL</span>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
