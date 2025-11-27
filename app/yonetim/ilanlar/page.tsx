// app/yonetim/ilanlar/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type AdminListing = {
  id: string;
  title: string;
  price: number;
  city: string | null;
  category: string | null;
  condition: string | null;
  status: "active" | "sold" | "inactive" | string;
  created_at: string;
  user_id: string;
};

const STATUS_LABELS: Record<string, string> = {
  active: "Aktif",
  sold: "Satıldı",
  inactive: "Pasif",
};

export default function AdminListingsPage() {
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<
    "" | "active" | "sold" | "inactive"
  >("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0); // basit sayfalama

  const pageSize = 20;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setMsg(null);

      let query = supabase
        .from("listings")
        .select(
          "id, title, price, city, category, condition, status, created_at, user_id",
          {
            count: "exact",
          }
        )
        .order("created_at", { ascending: false })
        .range(page * pageSize, page * pageSize + pageSize - 1);

      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }

      if (search.trim()) {
        const term = search.trim();

        // basit: title ILIKE veya id eşit
        query = query.or(`title.ilike.%${term}%,id.eq.${term}`);
      }

      const { data, error } = await query;

      if (error) {
        console.error(error);
        setMsg("İlanlar yüklenirken bir hata oluştu: " + error.message);
        setListings([]);
      } else {
        setListings((data as AdminListing[]) || []);
      }

      setLoading(false);
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page]); // arama için buton kullanacağız

  async function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(0); // yeni aramada başa dön
    setLoading(true);

    let query = supabase
      .from("listings")
      .select(
        "id, title, price, city, category, condition, status, created_at, user_id"
      )
      .order("created_at", { ascending: false })
      .range(0, pageSize - 1);

    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }

    if (search.trim()) {
      const term = search.trim();
      query = query.or(`title.ilike.%${term}%,id.eq.${term}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
      setMsg("İlanlar filtrelenirken bir hata oluştu: " + error.message);
      setListings([]);
    } else {
      setListings((data as AdminListing[]) || []);
    }

    setLoading(false);
  }

  async function handleStatusChange(
    id: string,
    newStatus: "active" | "sold" | "inactive"
  ) {
    setMsg(null);

    const { error } = await supabase
      .from("listings")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error(error);
      setMsg("Durum güncellenirken hata oluştu: " + error.message);
      return;
    }

    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
    );
    setMsg("İlan durumu güncellendi.");
  }

  return (
    <div className="space-y-4">
      {/* BAŞLIK + FİLTRELER */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              İlan yönetimi
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              İlanları filtreleyebilir, durumlarını hızlıca değiştirebilir ve
              şüpheli ilanları inceleyebilirsin.
            </p>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col gap-2 sm:flex-row sm:items-center"
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Başlıkta ara veya ID gir..."
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 sm:w-64"
            />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "" | "active" | "sold" | "inactive"
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 sm:w-40"
            >
              <option value="">Tüm durumlar</option>
              <option value="active">Aktif</option>
              <option value="sold">Satıldı</option>
              <option value="inactive">Pasif</option>
            </select>

            <button
              type="submit"
              className="rounded-xl bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-900 dark:text-slate-950"
            >
              Filtrele
            </button>
          </form>
        </div>

        {msg && (
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-300">
            {msg}
          </p>
        )}
      </section>

      {/* TABLO */}
      <section className="rounded-2xl border border-slate-200 bg-white p-3 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading && listings.length === 0 ? (
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            İlanlar yükleniyor…
          </p>
        ) : listings.length === 0 ? (
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Kriterlere uygun ilan bulunamadı.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="px-2 py-2 text-left">ID</th>
                  <th className="px-2 py-2 text-left">Başlık</th>
                  <th className="px-2 py-2 text-left">Fiyat</th>
                  <th className="px-2 py-2 text-left">Şehir</th>
                  <th className="px-2 py-2 text-left">Kategori</th>
                  <th className="px-2 py-2 text-left">Durum</th>
                  <th className="px-2 py-2 text-left">Tarih</th>
                  <th className="px-2 py-2 text-left">Kullanıcı</th>
                  <th className="px-2 py-2 text-left">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => (
                  <tr
                    key={l.id}
                    className="border-b border-slate-100 text-[11px] last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                  >
                    <td className="px-2 py-2 align-top text-[10px] text-slate-500 dark:text-slate-400">
                      {l.id}
                    </td>
                    <td className="px-2 py-2 align-top">
                      <p className="line-clamp-2 text-xs font-medium text-slate-900 dark:text-slate-100">
                        {l.title}
                      </p>
                    </td>
                    <td className="px-2 py-2 align-top whitespace-nowrap">
                      {l.price.toLocaleString("tr-TR")} ₺
                    </td>
                    <td className="px-2 py-2 align-top">
                      {l.city || <span className="text-slate-400">–</span>}
                    </td>
                    <td className="px-2 py-2 align-top">
                      {l.category || <span className="text-slate-400">–</span>}
                    </td>
                    <td className="px-2 py-2 align-top">
                      <select
                        value={l.status}
                        onChange={(e) =>
                          handleStatusChange(
                            l.id,
                            e.target.value as "active" | "sold" | "inactive"
                          )
                        }
                        className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-900 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      >
                        <option value="active">Aktif</option>
                        <option value="sold">Satıldı</option>
                        <option value="inactive">Pasif</option>
                      </select>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        Şu an: {STATUS_LABELS[l.status] || l.status}
                      </p>
                    </td>
                    <td className="px-2 py-2 align-top whitespace-nowrap text-[10px] text-slate-500 dark:text-slate-400">
                      {new Date(l.created_at).toLocaleString("tr-TR")}
                    </td>
                    <td className="px-2 py-2 align-top">
                      <Link
                        href={`/u/${l.user_id}`}
                        className="text-[11px] text-cyan-600 hover:underline dark:text-cyan-400"
                      >
                        Profili gör
                      </Link>
                    </td>
                    <td className="px-2 py-2 align-top">
                      <div className="flex flex-col gap-1">
                        <Link
                          href={`/listings/${l.id}`}
                          className="text-[11px] text-cyan-600 hover:underline dark:text-cyan-400"
                        >
                          İlana git
                        </Link>
                        <Link
                          href={`/listings/${l.id}/edit`}
                          className="text-[11px] text-slate-600 hover:underline dark:text-slate-300"
                        >
                          Düzenle
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Basit sayfalama tuşları */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-40 dark:border-slate-700"
          >
            ← Önceki
          </button>
          <span>Sayfa: {page + 1}</span>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-slate-300 px-3 py-1 dark:border-slate-700"
          >
            Sonraki →
          </button>
        </div>
      </section>
    </div>
  );
}
