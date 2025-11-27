// app/yonetim/kullanicilar/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type AdminUser = {
  id: string;
  username: string | null;
  full_name: string | null;
  city: string | null;
  created_at: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const [cities, setCities] = useState<string[]>([]);

  const [adminId, setAdminId] = useState<string | null>(null);
  const [allowBlocking, setAllowBlocking] = useState<boolean>(true);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);

  // Aramada gerçekten uygulanan terim (submit ile güncelliyoruz)
  const [appliedSearch, setAppliedSearch] = useState("");

  // 1) Meta bilgiler: admin id, ayarlar, şehir listesi, engelli kullanıcılar
  useEffect(() => {
    const loadMeta = async () => {
      setMsg(null);

      // oturumdaki kullanıcı (admin olduğumuzu varsayıyoruz)
      const { data: userData } = await supabase.auth.getUser();
      const currentUserId = userData.user?.id ?? null;
      setAdminId(currentUserId);

      // platform ayarlarından allow_user_blocking
      const { data: settingsData } = await supabase
        .from("platform_settings")
        .select("allow_user_blocking")
        .eq("id", 1)
        .maybeSingle();

      if (
        settingsData &&
        typeof settingsData.allow_user_blocking === "boolean"
      ) {
        setAllowBlocking(settingsData.allow_user_blocking);
      } else {
        setAllowBlocking(true); // tablo yoksa ya da kolon yoksa varsayılan: true
      }

      // Şehir listesi (distinct)
      const { data: cityData } = await supabase
        .from("profiles")
        .select("city")
        .not("city", "is", null);

      if (cityData) {
        const unique = Array.from(
          new Set(
            (cityData as { city: string | null }[])
              .map((r) => r.city)
              .filter(Boolean) as string[]
          )
        ).sort();
        setCities(unique);
      }

      // Engelli kullanıcılar
      const { data: blockedData } = await supabase
        .from("user_blocklist")
        .select("user_id");

      if (blockedData) {
        const ids = (blockedData as { user_id: string }[]).map(
          (r) => r.user_id
        );
        setBlockedUserIds(ids);
      }
    };

    loadMeta();
  }, []);

  // 2) Kullanıcı listesini yükle (sayfa, şehir, arama değiştiğinde)
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setMsg(null);

      let query = supabase
        .from("profiles")
        .select("id, username, full_name, city, created_at")
        .order("created_at", { ascending: false })
        .range(page * pageSize, page * pageSize + pageSize - 1);

      if (cityFilter) {
        query = query.eq("city", cityFilter);
      }

      if (appliedSearch.trim()) {
        const term = appliedSearch.trim();
        query = query.or(
          `username.ilike.%${term}%,full_name.ilike.%${term}%,id.eq.${term}`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error(error);
        setMsg("Kullanıcılar yüklenirken bir hata oluştu: " + error.message);
        setUsers([]);
      } else {
        setUsers((data as AdminUser[]) || []);
      }

      setLoading(false);
    };

    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, cityFilter, appliedSearch]);

  async function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(0);
    setAppliedSearch(search);
  }

  const isBlocked = (userId: string) => blockedUserIds.includes(userId);

  async function handleBlockUser(userId: string) {
    if (!adminId) {
      setMsg("Oturum bulunamadı. Lütfen tekrar giriş yap.");
      return;
    }
    if (userId === adminId) {
      setMsg("Kendini engelleyemezsin.");
      return;
    }

    const reason = window.prompt(
      "Bu kullanıcı neden engelleniyor? (İsteğe bağlı bir açıklama yazabilirsin)"
    );

    setMsg(null);

    const { error } = await supabase.from("user_blocklist").insert({
      user_id: userId,
      blocked_by: adminId,
      reason: reason?.trim() || null,
    });

    if (error) {
      console.error(error);
      setMsg("Kullanıcı engellenirken bir hata oluştu: " + error.message);
      return;
    }

    setBlockedUserIds((prev) =>
      prev.includes(userId) ? prev : [...prev, userId]
    );
    setMsg("Kullanıcı engellendi.");
  }

  async function handleUnblockUser(userId: string) {
    setMsg(null);

    const { error } = await supabase
      .from("user_blocklist")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error(error);
      setMsg("Engel kaldırılırken bir hata oluştu: " + error.message);
      return;
    }

    setBlockedUserIds((prev) => prev.filter((id) => id !== userId));
    setMsg("Kullanıcının engeli kaldırıldı.");
  }

  return (
    <div className="space-y-4">
      {/* BAŞLIK + FİLTRELER */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Kullanıcı yönetimi
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Kayıtlı kullanıcıları listeleyebilir, arayabilir, profillerine
              gidebilir ve gerektiğinde engelleyebilirsin.
            </p>
            {!allowBlocking && (
              <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
                Kullanıcı engelleme özelliği platform ayarlarından devre dışı
                bırakılmış. (platform_settings.allow_user_blocking = false)
              </p>
            )}
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col gap-2 sm:flex-row sm:items-center"
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Kullanıcı adı, ad-soyad veya ID..."
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 sm:w-64"
            />

            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 sm:w-40"
            >
              <option value="">Tüm şehirler</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
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
        {loading && users.length === 0 ? (
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Kullanıcılar yükleniyor…
          </p>
        ) : users.length === 0 ? (
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Kriterlere uygun kullanıcı bulunamadı.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="px-2 py-2 text-left">ID</th>
                  <th className="px-2 py-2 text-left">Ad / Kullanıcı adı</th>
                  <th className="px-2 py-2 text-left">Şehir</th>
                  <th className="px-2 py-2 text-left">Kayıt tarihi</th>
                  <th className="px-2 py-2 text-left">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const displayName =
                    u.full_name || u.username || "İsimsiz kullanıcı";
                  const blocked = isBlocked(u.id);

                  return (
                    <tr
                      key={u.id}
                      className="border-b border-slate-100 text-[11px] last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                    >
                      <td className="px-2 py-2 align-top text-[10px] text-slate-500 dark:text-slate-400">
                        {u.id}
                      </td>
                      <td className="px-2 py-2 align-top">
                        <p className="text-xs font-medium text-slate-900 dark:text-slate-100">
                          {displayName}
                        </p>
                        {u.username && (
                          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                            @{u.username}
                          </p>
                        )}
                        {blocked && (
                          <p className="mt-1 inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-600 dark:bg-red-500/15 dark:text-red-300">
                            Engelli kullanıcı
                          </p>
                        )}
                      </td>
                      <td className="px-2 py-2 align-top">
                        {u.city || (
                          <span className="text-slate-400">Belirtilmemiş</span>
                        )}
                      </td>
                      <td className="px-2 py-2 align-top whitespace-nowrap text-[10px] text-slate-500 dark:text-slate-400">
                        {new Date(u.created_at).toLocaleString("tr-TR")}
                      </td>
                      <td className="px-2 py-2 align-top">
                        <div className="flex flex-col gap-1">
                          <Link
                            href={`/u/${u.id}`}
                            className="text-[11px] text-cyan-600 hover:underline dark:text-cyan-400"
                          >
                            Profili gör →
                          </Link>

                          {allowBlocking && adminId && u.id !== adminId && (
                            <>
                              {!blocked ? (
                                <button
                                  type="button"
                                  onClick={() => handleBlockUser(u.id)}
                                  className="self-start rounded-lg border border-red-500/60 px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-500/10 dark:text-red-300"
                                >
                                  Kullanıcıyı engelle
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleUnblockUser(u.id)}
                                  className="self-start rounded-lg border border-amber-500/60 px-2 py-1 text-[11px] font-semibold text-amber-600 hover:bg-amber-500/10 dark:text-amber-300"
                                >
                                  Engeli kaldır
                                </button>
                              )}
                            </>
                          )}

                          {!allowBlocking && (
                            <span className="text-[10px] text-slate-400">
                              Engelleme devre dışı.
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Basit sayfalama */}
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
