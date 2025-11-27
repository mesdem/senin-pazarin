// app/yonetim/sikayetler/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type AdminReport = {
  id: string;
  listing_id: string;
  reporter_id: string | null;
  reason: string | null;
  status: string | null;
  created_at: string;
  admin_note?: string | null;
};

const STATUS_OPTIONS = [
  { value: "open", label: "Açık" },
  { value: "in_review", label: "İnceleniyor" },
  { value: "resolved", label: "Çözüldü" },
];

export default function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<
    "" | "open" | "in_review" | "resolved"
  >("open");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setMsg(null);

      let query = supabase
        .from("listing_reports")
        .select(
          "id, listing_id, reporter_id, reason, status, created_at, admin_note"
        )
        .order("created_at", { ascending: false })
        .range(page * pageSize, page * pageSize + pageSize - 1);

      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }

      if (search.trim()) {
        const term = search.trim();
        // listing_id veya reason içinde arama
        query = query.or(`listing_id.eq.${term},reason.ilike.%${term}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error(error);
        setMsg("Şikayetler yüklenirken bir hata oluştu: " + error.message);
        setReports([]);
      } else {
        setReports((data as AdminReport[]) || []);
      }

      setLoading(false);
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page]); // aramayı submit ile tetikleyeceğiz

  async function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(0);
    setLoading(true);
    setMsg(null);

    let query = supabase
      .from("listing_reports")
      .select(
        "id, listing_id, reporter_id, reason, status, created_at, admin_note"
      )
      .order("created_at", { ascending: false })
      .range(0, pageSize - 1);

    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }

    if (search.trim()) {
      const term = search.trim();
      query = query.or(`listing_id.eq.${term},reason.ilike.%${term}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
      setMsg("Filtre uygulanırken bir hata oluştu: " + error.message);
      setReports([]);
    } else {
      setReports((data as AdminReport[]) || []);
    }

    setLoading(false);
  }

  async function handleStatusChange(
    id: string,
    newStatus: "open" | "in_review" | "resolved"
  ) {
    setMsg(null);

    const { error } = await supabase
      .from("listing_reports")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error(error);
      setMsg("Durum güncellenirken hata oluştu: " + error.message);
      return;
    }

    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    setMsg("Şikayet durumu güncellendi.");
  }

  async function handleSaveNote(id: string, note: string) {
    setMsg(null);

    const { error } = await supabase
      .from("listing_reports")
      .update({ admin_note: note || null })
      .eq("id", id);

    if (error) {
      console.error(error);
      setMsg("Not kaydedilirken hata oluştu: " + error.message);
      return;
    }

    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, admin_note: note || null } : r))
    );
    setMsg("Admin notu kaydedildi.");
  }

  return (
    <div className="space-y-4">
      {/* BAŞLIK + FİLTRELER */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Şikayet yönetimi
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Kullanıcıların bildirdiği şüpheli ilanları buradan inceleyebilir,
              durumlarını güncelleyebilir ve not bırakabilirsin.
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
              placeholder="İlan ID veya sebepte ara..."
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 sm:w-64"
            />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "" | "open" | "in_review" | "resolved"
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 sm:w-40"
            >
              <option value="">Tüm durumlar</option>
              <option value="open">Açık</option>
              <option value="in_review">İnceleniyor</option>
              <option value="resolved">Çözüldü</option>
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
        {loading && reports.length === 0 ? (
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Şikayetler yükleniyor…
          </p>
        ) : reports.length === 0 ? (
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Kriterlere uygun şikayet bulunamadı.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="px-2 py-2 text-left">ID</th>
                  <th className="px-2 py-2 text-left">İlan</th>
                  <th className="px-2 py-2 text-left">Raporlayan</th>
                  <th className="px-2 py-2 text-left">Sebep</th>
                  <th className="px-2 py-2 text-left">Durum</th>
                  <th className="px-2 py-2 text-left">Tarih</th>
                  <th className="px-2 py-2 text-left">Admin notu</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <ReportRow
                    key={r.id}
                    report={r}
                    onStatusChange={handleStatusChange}
                    onSaveNote={handleSaveNote}
                  />
                ))}
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

function ReportRow({
  report,
  onStatusChange,
  onSaveNote,
}: {
  report: AdminReport;
  onStatusChange: (
    id: string,
    status: "open" | "in_review" | "resolved"
  ) => void;
  onSaveNote: (id: string, note: string) => void;
}) {
  const [note, setNote] = useState(report.admin_note || "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSaveNote(report.id, note);
    setSaving(false);
  }

  return (
    <tr className="border-b border-slate-100 text-[11px] last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60">
      <td className="px-2 py-2 align-top text-[10px] text-slate-500 dark:text-slate-400">
        {report.id}
      </td>
      <td className="px-2 py-2 align-top">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-slate-700 dark:text-slate-200">
            İlan ID: {report.listing_id}
          </span>
          <Link
            href={`/listings/${report.listing_id}`}
            className="text-[11px] text-cyan-600 hover:underline dark:text-cyan-400"
          >
            İlana git →
          </Link>
        </div>
      </td>
      <td className="px-2 py-2 align-top">
        {report.reporter_id ? (
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-slate-700 dark:text-slate-200">
              {report.reporter_id}
            </span>
            <Link
              href={`/u/${report.reporter_id}`}
              className="text-[11px] text-cyan-600 hover:underline dark:text-cyan-400"
            >
              Profili gör →
            </Link>
          </div>
        ) : (
          <span className="text-slate-400">Anonim / misafir</span>
        )}
      </td>
      <td className="px-2 py-2 align-top max-w-xs">
        <p className="line-clamp-3 text-[11px] text-slate-700 dark:text-slate-200">
          {report.reason || "Sebep belirtilmemiş."}
        </p>
      </td>
      <td className="px-2 py-2 align-top">
        <select
          value={report.status || "open"}
          onChange={(e) =>
            onStatusChange(
              report.id,
              e.target.value as "open" | "in_review" | "resolved"
            )
          }
          className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-900 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-2 py-2 align-top whitespace-nowrap text-[10px] text-slate-500 dark:text-slate-400">
        {new Date(report.created_at).toLocaleString("tr-TR")}
      </td>
      <td className="px-2 py-2 align-top">
        <div className="flex flex-col gap-1">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            placeholder="Bu şikayetle ilgili kendi notun..."
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="self-start rounded-lg border border-slate-300 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            {saving ? "Kaydediliyor..." : "Notu kaydet"}
          </button>
        </div>
      </td>
    </tr>
  );
}
