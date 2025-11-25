// app/admin/reports/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ListingReport = {
  id: number;
  listing_id: string;
  reporter_id: string;
  reason: string | null;
  created_at: string;
};

export default function AdminReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [reports, setReports] = useState<ListingReport[]>([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setMsg("");

      // 1) Kullanıcı var mı?
      const { data: userData } = await supabase.auth.getUser();
      const u = userData.user;

      if (!u) {
        router.push("/auth/login");
        return;
      }

      // 2) Admin mi?
      const { data: adminRow, error: adminError } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", u.id)
        .maybeSingle();

      if (adminError || !adminRow) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);

      // 3) Raporları çek
      const { data: reportsData, error: reportsError } = await supabase
        .from("listing_reports")
        .select("id, listing_id, reporter_id, reason, created_at")
        .order("created_at", { ascending: false })
        .limit(100);

      if (reportsError) {
        setMsg("Raporlar yüklenirken hata oluştu: " + reportsError.message);
      } else if (reportsData) {
        setReports(reportsData as ListingReport[]);
      }

      setLoading(false);
    };

    load();
  }, [router]);

  if (loading) {
    return <p className="mt-4 text-sm text-slate-400">Raporlar yükleniyor…</p>;
  }

  if (isAdmin === false) {
    return (
      <div className="mt-4 space-y-2 text-sm text-slate-300">
        <p>Bu sayfa sadece yöneticiler için.</p>
        <p className="text-xs text-slate-500">
          Eğer admin olman gerektiğini düşünüyorsan, Supabase üzerinden
          <code className="mx-1 rounded bg-slate-800 px-1">admins</code>
          tablosuna kullanıcı kimliğini eklemelisin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold">Raporlanan İlanlar</h1>
          <p className="text-xs text-slate-400">
            Kullanıcıların şüpheli bulduğu ilanlar burada listelenir.
          </p>
        </div>
        <Link href="/" className="text-xs text-cyan-300 hover:underline">
          Ana sayfaya dön
        </Link>
      </header>

      {msg && <p className="text-xs text-slate-300">{msg}</p>}

      {reports.length === 0 ? (
        <p className="text-sm text-slate-400">Şu anda raporlanmış ilan yok.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/70">
          <table className="min-w-full text-left text-xs text-slate-200">
            <thead className="border-b border-slate-800 bg-slate-900">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">İlan</th>
                <th className="px-3 py-2">Raporlayan</th>
                <th className="px-3 py-2">Sebep</th>
                <th className="px-3 py-2">Tarih</th>
                <th className="px-3 py-2">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-slate-800 hover:bg-slate-800/60"
                >
                  <td className="px-3 py-2 text-[11px] text-slate-500">
                    {r.id}
                  </td>
                  <td className="px-3 py-2 text-[11px]">
                    <code className="rounded bg-slate-800 px-1">
                      {r.listing_id.slice(0, 8)}…
                    </code>
                  </td>
                  <td className="px-3 py-2 text-[11px]">
                    <code className="rounded bg-slate-800 px-1">
                      {r.reporter_id.slice(0, 8)}…
                    </code>
                  </td>
                  <td className="px-3 py-2 text-[11px] max-w-xs">
                    {r.reason || "-"}
                  </td>
                  <td className="px-3 py-2 text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(r.created_at).toLocaleString("tr-TR")}
                  </td>
                  <td className="px-3 py-2 text-[11px]">
                    <Link
                      href={`/listings/${r.listing_id}`}
                      className="rounded-xl border border-slate-600 px-2 py-1 text-[11px] text-cyan-300 hover:bg-slate-800"
                    >
                      İlana git
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
