"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Ticket = {
  id: string;
  subject: string;
  status: string;
  created_at: string;
  userName: string; // full_name / username buraya tek string olarak geliyor
};

export default function DestekListPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setMsg(null);

      const { data, error } = await supabase
        .from("support_tickets")
        .select(
          `
          id,
          subject,
          status,
          created_at,
          profiles (
            full_name,
            username
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setMsg(
          "Destek talepleri yüklenirken bir hata oluştu: " + error.message
        );
        setTickets([]);
        setLoading(false);
        return;
      }

      const rows = (data ?? []) as any[];

      const mapped: Ticket[] = rows.map((row) => {
        const profile = row.profiles as
          | { full_name: string | null; username: string | null }
          | null
          | undefined;

        const name =
          profile?.full_name || profile?.username || "Anonim kullanıcı";

        return {
          id: row.id as string,
          subject: row.subject as string,
          status: row.status as string,
          created_at: row.created_at as string,
          userName: name,
        };
      });

      setTickets(mapped);
      setLoading(false);
    };

    load();
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h1 className="mb-2 text-base font-semibold text-slate-900 dark:text-slate-100">
        Destek talepleri
      </h1>
      <p className="mb-4 text-[11px] text-slate-500 dark:text-slate-400">
        Kullanıcıların oluşturduğu destek taleplerini görüntüleyebilir ve detay
        sayfasından yanıtlayabilirsin.
      </p>

      {msg && (
        <p className="mb-3 text-[11px] text-red-500 dark:text-red-400">{msg}</p>
      )}

      {loading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Talepler yükleniyor…
        </p>
      ) : tickets.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Henüz destek talebi bulunmuyor.
        </p>
      ) : (
        <div className="overflow-x-auto text-xs">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="py-2 pr-2 text-left">Kullanıcı</th>
                <th className="py-2 pr-2 text-left">Konu</th>
                <th className="py-2 pr-2 text-left">Durum</th>
                <th className="py-2 pr-2 text-left">Tarih</th>
                <th className="py-2 pr-2 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                >
                  <td className="py-2 pr-2 align-top">{t.userName}</td>
                  <td className="py-2 pr-2 align-top">
                    <span className="line-clamp-2 text-slate-900 dark:text-slate-100">
                      {t.subject}
                    </span>
                  </td>
                  <td className="py-2 pr-2 align-top">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="py-2 pr-2 align-top whitespace-nowrap text-[11px] text-slate-500 dark:text-slate-400">
                    {new Date(t.created_at).toLocaleString("tr-TR")}
                  </td>
                  <td className="py-2 pr-2 align-top text-right">
                    <Link
                      href={`/yonetim/destek/${t.id}`}
                      className="text-[11px] text-cyan-600 hover:underline dark:text-cyan-400"
                    >
                      Görüntüle →
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

function StatusBadge({ status }: { status: string }) {
  let label = status;
  let cls =
    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ";

  if (status === "open") {
    label = "Açık";
    cls +=
      "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";
  } else if (status === "answered") {
    label = "Yanıtlandı";
    cls += "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300";
  } else if (status === "closed") {
    label = "Kapalı";
    cls +=
      "bg-slate-200 text-slate-700 dark:bg-slate-600/40 dark:text-slate-100";
  } else {
    cls += "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200";
  }

  return <span className={cls}>{label}</span>;
}
