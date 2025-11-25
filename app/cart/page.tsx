// app/cart/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";

type CartItemRow = {
  id: string;
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

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItemRow[]>([]);
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
        .from("cart_items")
        .select(
          `
          id,
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
        .eq("user_id", u.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setMsg("Sepet yüklenirken bir hata oluştu.");
        setItems([]);
        setLoading(false);
        return;
      }

      setItems((data as any[]) || []);
      setLoading(false);
    };

    load();
  }, [router]);

  async function handleRemove(cartItemId: string) {
    setMsg("");
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId);

    if (error) {
      setMsg("Ürün sepetten çıkarılırken hata oluştu: " + error.message);
    } else {
      setItems((prev) => prev.filter((it) => it.id !== cartItemId));
    }
  }

  async function handleClearAll() {
    setMsg("");
    const { data: userData } = await supabase.auth.getUser();
    const u = userData.user;
    if (!u) return;

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", u.id);

    if (error) {
      setMsg("Sepet temizlenirken hata oluştu: " + error.message);
    } else {
      setItems([]);
    }
  }

  async function handleQuickOrder(listingId: string, price: number) {
    setMsg("");
    const { data: userData } = await supabase.auth.getUser();
    const u = userData.user;
    if (!u) {
      router.push("/auth/login");
      return;
    }

    // İlan sahibi kendisi mi kontrolü sipariş sayfasında da var ama burada da yapalım
    // (Basit tutmak için burada listing_owner sorgusu yapmıyoruz; orders page'de kontrol var.)

    const { data, error } = await supabase
      .from("orders")
      .insert({
        listing_id: listingId,
        buyer_id: u.id,
        // seller_id doldurmak için listingten çekmek daha sağlıklı; basit olması için şimdilik null geçmeyelim
        // ama senin listings tablosunda user_id var, normalde onu da çekip kullanabilirsin.
        amount: price,
        currency: "TRY",
        status: "pending",
        payment_method: "manual",
      })
      .select("id")
      .single();

    if (error || !data) {
      setMsg("Sipariş oluşturulurken hata oluştu: " + error?.message);
      return;
    }

    const orderId = data.id as string;
    router.push(`/orders/${orderId}`);
  }

  const total = items.reduce((sum, row) => {
    const p = row.listing?.price ?? 0;
    return sum + Number(p);
  }, 0);

  if (loading) {
    return (
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        Sepetin yükleniyor…
      </p>
    );
  }

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Sepetin
        </h1>
        {items.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs text-red-500 hover:underline dark:text-red-400"
          >
            Sepeti tamamen boşalt
          </button>
        )}
      </div>

      {msg && (
        <p className="text-xs text-slate-600 dark:text-slate-300">{msg}</p>
      )}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          Sepetinde ürün yok.{" "}
          <Link
            href="/explore"
            className="text-cyan-600 hover:underline dark:text-cyan-400"
          >
            İlanlara göz at
          </Link>{" "}
          ve beğendiğin ürünleri sepete ekle.
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((row) => {
              const l = row.listing;
              if (!l) return null;

              const heroImg = l.listing_images?.[0]?.image_url;
              return (
                <div
                  key={row.id}
                  className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
                >
                  <Link
                    href={`/listings/${l.id}`}
                    className="h-20 w-24 flex-shrink-0 overflow-hidden rounded-xl"
                  >
                    {heroImg ? (
                      <img
                        src={heroImg}
                        alt={l.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-cyan-500/30 to-violet-500/30" />
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link
                        href={`/listings/${l.id}`}
                        className="text-sm font-semibold text-slate-900 hover:text-cyan-600 dark:text-slate-100 dark:hover:text-cyan-300"
                      >
                        {l.title}
                      </Link>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {l.city} • {l.category} • {l.condition}
                      </p>
                    </div>

                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-sm font-bold text-cyan-700 dark:text-cyan-300">
                        {l.price.toLocaleString("tr-TR")} ₺
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleQuickOrder(l.id, Number(l.price))
                          }
                          className="rounded-xl bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-slate-900 hover:bg-emerald-400"
                        >
                          Bu ürünü satın al
                        </button>
                        <button
                          onClick={() => handleRemove(row.id)}
                          className="rounded-xl border border-slate-400 px-3 py-1 text-[11px] text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          Kaldır
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Toplam ({items.length} ürün)
              </span>
              <span className="text-base font-bold text-cyan-700 dark:text-cyan-300">
                {total.toLocaleString("tr-TR")} ₺
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              Şu anda Senin Pazarın üzerinden gerçek ödeme alınmıyor. Her ürün
              için “Bu ürünü satın al” butonunu kullanarak ilgili ilan için
              sipariş oluşturabilir, ödeme ve teslimat detaylarını satıcıyla
              mesaj kısmından konuşabilirsin.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
