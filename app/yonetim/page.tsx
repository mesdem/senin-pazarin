// app/yonetim/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type StatState = {
  activeListings: number;
  totalUsers: number;
  openReports: number;
  openTickets: number;
};

type DashboardListing = {
  id: string;
  title: string;
  price: number;
  city: string | null;
  status: string;
  created_at: string;
};

type DashboardReport = {
  id: string;
  listing_id: string;
  reason: string;
  created_at: string;
};

type DashboardTicket = {
  id: string;
  subject: string;
  status: string;
  created_at: string;
};

export default function YonetimDashboardPage() {
  const [stats, setStats] = useState<StatState>({
    activeListings: 0,
    totalUsers: 0,
    openReports: 0,
    openTickets: 0,
  });

  const [latestListings, setLatestListings] = useState<DashboardListing[]>([]);
  const [latestReports, setLatestReports] = useState<DashboardReport[]>([]);
  const [latestTickets, setLatestTickets] = useState<DashboardTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // 1) Aktif ilan sayısı
      const { count: activeListingsCount } = await supabase
        .from("listings")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // 2) Toplam kullanıcı sayısı (profiles tablosu)
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // 3) Açık şikayet sayısı (listing_reports.status = 'open')
      let openReportsCount = 0;
      const { count: reportsCount, error: reportError } = await supabase
        .from("listing_reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "open")
        .maybeSingle(); // status kolonu yoksa error alırsan bu kısmı yorumla

      if (!reportError && typeof reportsCount === "number") {
        openReportsCount = reportsCount;
      }

      // 4) Açık destek talebi sayısı (support_tickets.status != 'closed')
      let openTicketsCount = 0;
      const { count: ticketsCount, error: ticketError } = await supabase
        .from("support_tickets")
        .select("*", { count: "exact", head: true })
        .neq("status", "closed")
        .maybeSingle(); // bu tablo yoksa yine yorumlaman yeter

      if (!ticketError && typeof ticketsCount === "number") {
        openTicketsCount = ticketsCount;
      }

      setStats({
        activeListings: activeListingsCount ?? 0,
        totalUsers: usersCount ?? 0,
        openReports: openReportsCount,
        openTickets: openTicketsCount,
      });

      // Son 5 ilan
      const { data: listingsData } = await supabase
        .from("listings")
        .select("id, title, price, city, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      setLatestListings((listingsData as DashboardListing[]) || []);

      // Son 5 şikayet
      const { data: reportsData } = await supabase
        .from("listing_reports")
        .select("id, listing_id, reason, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      setLatestReports((reportsData as DashboardReport[]) || []);

      // Son 5 destek talebi
      const { data: ticketsData } = await supabase
        .from("support_tickets")
        .select("id, subject, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      setLatestTickets((ticketsData as DashboardTicket[]) || []);

      setLoading(false);
    };

    load();
  }, []);

  return (
    <div className="space-y-4">
      {/* ÜST ÖZET KARTLAR */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Aktif ilan"
          value={stats.activeListings}
          hint="Şu anda yayında olan ilan sayısı"
        />
        <StatCard
          label="Toplam kullanıcı"
          value={stats.totalUsers}
          hint="Profiller tablosundaki toplam kayıt"
        />
        <StatCard
          label="Açık şikayet"
          value={stats.openReports}
          hint="İncelenmeyi bekleyen ilan şikayetleri"
        />
        <StatCard
          label="Açık destek talebi"
          value={stats.openTickets}
          hint="Yanıt bekleyen destek biletleri"
        />
      </section>

      {/* ALTTAKİ İKİLİ BLOKLAR */}
      <section className="grid gap-4 md:grid-cols-2">
        {/* Son eklenen ilanlar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Son eklenen ilanlar
            </h2>
            <Link
              href="/yonetim/ilanlar"
              className="text-[11px] text-cyan-600 hover:underline dark:text-cyan-400"
            >
              Tümünü gör →
            </Link>
          </div>

          {loading && latestListings.length === 0 ? (
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Yükleniyor…
            </p>
          ) : latestListings.length === 0 ? (
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Henüz ilan bulunamadı.
            </p>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
              {latestListings.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center justify-between gap-2 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                      {l.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      {l.city || "Şehir yok"} • {l.status} •{" "}
                      {l.price.toLocaleString("tr-TR")} ₺
                    </p>
                  </div>
                  <Link
                    href={`/listings/${l.id}`}
                    className="whitespace-nowrap text-[11px] text-cyan-600 hover:underline dark:text-cyan-400"
                  >
                    İlana git
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Şikayetler + Destek talepleri */}
        <div className="space-y-4">
          {/* Şikayetler */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Son şikayetler
              </h2>
              <Link
                href="/yonetim/sikayetler"
                className="text-[11px] text-cyan-600 hover:underline dark:text-cyan-400"
              >
                Tümünü gör →
              </Link>
            </div>

            {latestReports.length === 0 ? (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Henüz şikayet yok veya tablo oluşturulmadı.
              </p>
            ) : (
              <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                {latestReports.map((r) => (
                  <li key={r.id} className="py-2">
                    <p className="line-clamp-2 text-[11px] text-slate-700 dark:text-slate-200">
                      {r.reason}
                    </p>
                    <Link
                      href={`/listings/${r.listing_id}`}
                      className="mt-1 inline-block text-[11px] text-cyan-600 hover:underline dark:text-cyan-400"
                    >
                      İlana git →
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Destek talepleri */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Son destek talepleri
              </h2>
              <Link
                href="/yonetim/destek"
                className="text-[11px] text-cyan-600 hover:underline dark:text-cyan-400"
              >
                Tümünü gör →
              </Link>
            </div>

            {latestTickets.length === 0 ? (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Henüz destek talebi yok veya tablo oluşturulmadı.
              </p>
            ) : (
              <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                {latestTickets.map((t) => (
                  <li key={t.id} className="py-2">
                    <p className="truncate text-sm text-slate-900 dark:text-slate-100">
                      {t.subject}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      Durum: {t.status}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">
        {value.toLocaleString("tr-TR")}
      </p>
      {hint && (
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      )}
    </div>
  );
}
