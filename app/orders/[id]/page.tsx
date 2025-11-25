// app/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

type OrderRow = {
  id: string;
  status: string;
  amount: number;
  currency: string;
  created_at: string;
  listing: {
    id: string;
    title: string;
    city: string | null;
    category: string | null;
    condition: string | null;
    price: number;
    listing_images?: { image_url: string }[];
  } | null;
};

export default function BuyerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setMsg("");

      const { data: userData } = await supabase.auth.getUser();
      const u = userData.user;
      if (!u) {
        router.push("/auth/login");
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          id,
          status,
          amount,
          currency,
          created_at,
          listing: listings (
            id,
            title,
            city,
            category,
            condition,
            price,
            listing_images (image_url)
          )
        `
        )
        .eq("buyer_id", u.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setMsg("Siparişlerin yüklenirken bir hata oluştu.");
        setOrders([]);
        setLoading(false);
        return;
      }

      setOrders((data as any[]) || []);
      setLoading(false);
    };

    load();
  }, [router]);

  function statusLabel(status: string) {
    if (status === "paid") return "Ödeme yapıldı";
    if (status === "completed") return "Tamamlandı";
    if (status === "cancelled") return "İptal edildi";
    return "Bekliyor";
  }

  function statusClass(status: string) {
    if (status === "paid")
      return "border-emerald-400 bg-emerald-500/10 text-emerald-300";
    if (status === "completed")
      return "border-blue-400 bg-blue-500/10 text-blue-300";
    if (status === "cancelled")
      return "border-red-400 bg-red-500/10 text-red-300";
    return "border-amber-400 bg-amber-500/10 text-amber-300";
  }

  if (loading) {
    return (
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        Siparişlerin yükleniyor…
      </p>
    );
  }

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Siparişlerin
        </h1>
        <Link
          href="/cart"
          className="text-xs text-cyan-600 hover:underline dark:text-cyan-400"
        >
          Sepete git →
        </Link>
      </div>

      {msg && (
        <p className="text-xs text-slate-600 dark:text-slate-300">{msg}</p>
      )}

      {orders.length === 0 ? (
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Henüz hiç siparişin yok. İlanlara göz atıp sepetine ürün ekleyebilir
          ve sipariş başlatabilirsin.
        </p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const l = o.listing;
            const heroImg = l?.listing_images?.[0]?.image_url;
            return (
              <Link
                key={o.id}
                href={`/orders/${o.id}`}
                className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-xs shadow-sm hover:border-cyan-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80"
              >
                <div className="h-20 w-24 flex-shrink-0 overflow-hidden rounded-xl">
                  {heroImg ? (
                    <img
                      src={heroImg}
                      alt={l?.title || ""}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-cyan-500/30 to-violet-500/30" />
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {l?.title || "İlan bulunamadı"}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {l?.city} • {l?.category} • {l?.condition}
                    </p>
                  </div>

                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-sm font-bold text-cyan-700 dark:text-cyan-300">
                      {o.amount.toLocaleString("tr-TR")} {o.currency}
                    </p>
                    <span
                      className={
                        "inline-flex rounded-full border px-2 py-0.5 text-[11px] " +
                        statusClass(o.status)
                      }
                    >
                      {statusLabel(o.status)}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {new Date(o.created_at).toLocaleString("tr-TR")}
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
