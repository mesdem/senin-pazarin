// app/yonetim/istatistikler/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type TopCategory = {
  category: string | null;
  count: number;
};

type StatsState = {
  totalUsers: number;
  newUsers7d: number;
  totalListings: number;
  activeListings: number;
  soldListings: number;
  newListings7d: number;
  openReports: number;
  topCategories: TopCategory[];
};

export default function AdminStatsPage() {
  const [stats, setStats] = useState<StatsState>({
    totalUsers: 0,
    newUsers7d: 0,
    totalListings: 0,
    activeListings: 0,
    soldListings: 0,
    newListings7d: 0,
    openReports: 0,
    topCategories: [],
  });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setMsg(null);

      try {
        const now = new Date();
        const d7 = new Date(now);
        d7.setDate(d7.getDate() - 7);
        const since7 = d7.toISOString();

        // 1) Toplam kullanıcı sayısı
        const totalUsersPromise = supabase
          .from("profiles")
          .select("id", { count: "exact", head: true });

        // 2) Son 7 günde eklenen kullanıcılar
        const newUsers7dPromise = supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .gte("created_at", since7);

        // 3) Toplam ilan sayısı
        const totalListingsPromise = supabase
          .from("listings")
          .select("id", { count: "exact", head: true });

        // 4) Aktif ilan sayısı
        const activeListingsPromise = supabase
          .from("listings")
          .select("id", { count: "exact", head: true })
          .eq("status", "active");

        // 5) Satıldı ilan sayısı
        const soldListingsPromise = supabase
          .from("listings")
          .select("id", { count: "exact", head: true })
          .eq("status", "sold");

        // 6) Son 7 günde açılan ilanlar
        const newListings7dPromise = supabase
          .from("listings")
          .select("id", { count: "exact", head: true })
          .gte("created_at", since7);

        // 7) Açık şikayet sayısı (status = open)
        const openReportsPromise = supabase
          .from("listing_reports")
          .select("id", { count: "exact", head: true })
          .eq("status", "open");

        // 8) En popüler kategoriler (aktif ilanlar içinde) - JS tarafında sayacağız
        const topCategoriesPromise = supabase
          .from("listings")
          .select("category")
          .eq("status", "active")
          .not("category", "is", null);

        const [
          totalUsersRes,
          newUsers7dRes,
          totalListingsRes,
          activeListingsRes,
          soldListingsRes,
          newListings7dRes,
          openReportsRes,
          topCategoriesRes,
        ] = await Promise.all([
          totalUsersPromise,
          newUsers7dPromise,
          totalListingsPromise,
          activeListingsPromise,
          soldListingsPromise,
          newListings7dPromise,
          openReportsPromise,
          topCategoriesPromise,
        ]);

        const totalUsers = totalUsersRes.count ?? 0;
        const newUsers7d = newUsers7dRes.count ?? 0;
        const totalListings = totalListingsRes.count ?? 0;
        const activeListings = activeListingsRes.count ?? 0;
        const soldListings = soldListingsRes.count ?? 0;
        const newListings7d = newListings7dRes.count ?? 0;
        const openReports = openReportsRes.count ?? 0;

        let topCategories: TopCategory[] = [];
        if (!topCategoriesRes.error && topCategoriesRes.data) {
          const rows = topCategoriesRes.data as { category: string | null }[];

          const map = new Map<string, number>();

          for (const row of rows) {
            if (!row.category) continue;
            const current = map.get(row.category) ?? 0;
            map.set(row.category, current + 1);
          }

          topCategories = Array.from(map.entries())
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        }

        setStats({
          totalUsers,
          newUsers7d,
          totalListings,
          activeListings,
          soldListings,
          newListings7d,
          openReports,
          topCategories,
        });
      } catch (err) {
        console.error(err);
        setMsg("İstatistikler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const {
    totalUsers,
    newUsers7d,
    totalListings,
    activeListings,
    soldListings,
    newListings7d,
    openReports,
    topCategories,
  } = stats;

  return (
    <div className="space-y-4">
      {/* BAŞLIK */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          İstatistikler & Raporlar
        </h2>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          Platformun genel sağlığını, kullanıcı ve ilan hareketliliğini buradan
          takip edebilirsin.
        </p>
        {msg && (
          <p className="mt-2 text-[11px] text-red-500 dark:text-red-400">
            {msg}
          </p>
        )}
      </section>

      {/* KARTLAR: KULLANICI & İLAN ÖZETİ */}
      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {/* Toplam kullanıcı */}
        <StatCard
          title="Toplam kullanıcı"
          value={loading ? "…" : totalUsers.toLocaleString("tr-TR")}
          subtitle={
            !loading
              ? `Son 7 günde ${newUsers7d.toLocaleString("tr-TR")} yeni kayıt`
              : "Yükleniyor…"
          }
        />
        {/* Toplam ilan */}
        <StatCard
          title="Toplam ilan"
          value={loading ? "…" : totalListings.toLocaleString("tr-TR")}
          subtitle={
            !loading
              ? `Son 7 günde ${newListings7d.toLocaleString("tr-TR")} yeni ilan`
              : "Yükleniyor…"
          }
        />
        {/* Aktif ilanlar */}
        <StatCard
          title="Aktif ilanlar"
          value={loading ? "…" : activeListings.toLocaleString("tr-TR")}
          subtitle={
            !loading && totalListings > 0
              ? `%${Math.round(
                  (activeListings / Math.max(totalListings, 1)) * 100
                )} aktif`
              : ""
          }
        />
        {/* Satıldı ilanlar */}
        <StatCard
          title="Satıldı olarak işaretlenen ilanlar"
          value={loading ? "…" : soldListings.toLocaleString("tr-TR")}
          subtitle=""
        />
      </section>

      {/* ŞİKAYET / MODERASYON ÖZETİ */}
      <section className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Moderasyon
          </h3>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {loading ? "…" : openReports.toLocaleString("tr-TR")}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              açık şikayet
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Şikayetleri detaylı görmek için{" "}
            <span className="font-semibold">Yönetim → Şikayetler</span>{" "}
            sayfasını kullanabilirsin.
          </p>
        </div>

        {/* En popüler kategoriler */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            En popüler kategoriler (aktif ilan)
          </h3>

          {loading ? (
            <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
              Yükleniyor…
            </p>
          ) : topCategories.length === 0 ? (
            <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
              Henüz istatistik çıkarılacak kadar aktif ilan yok.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {topCategories.map((cat) => (
                <CategoryBar
                  key={cat.category ?? "bos"}
                  label={cat.category || "Kategori yok"}
                  value={cat.count}
                  maxValue={topCategories[0]?.count || 1}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {title}
      </p>
      <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
        {value}
      </p>
      {subtitle && (
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function CategoryBar({
  label,
  value,
  maxValue,
}: {
  label: string;
  value: number;
  maxValue: number;
}) {
  const ratio = maxValue > 0 ? value / maxValue : 0;
  const widthPercent = Math.max(8, Math.round(ratio * 100)); // en az biraz görünsün

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="truncate text-slate-700 dark:text-slate-200">
          {label}
        </span>
        <span className="ml-2 text-slate-500 dark:text-slate-400">
          {value.toLocaleString("tr-TR")} ilan
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-2 rounded-full bg-cyan-400 dark:bg-cyan-500"
          style={{ width: `${widthPercent}%` }}
        />
      </div>
    </div>
  );
}
