"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type TicketDetail = {
  id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
  userName: string;
};

type TicketResponse = {
  id: string;
  message: string;
  created_at: string;
  admin_id: string | null;
};

export default function DestekDetayPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [responses, setResponses] = useState<TicketResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const [adminId, setAdminId] = useState<string | null>(null);
  const [newResponse, setNewResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;

      setLoading(true);
      setMsg(null);

      // oturumdaki admin
      const { data: userData } = await supabase.auth.getUser();
      setAdminId(userData.user?.id ?? null);

      // destek talebi
      const { data: ticketData, error: ticketError } = await supabase
        .from("support_tickets")
        .select(
          `
          id,
          subject,
          message,
          status,
          created_at,
          updated_at,
          profiles (
            full_name,
            username
          )
        `
        )
        .eq("id", id)
        .maybeSingle();

      if (ticketError || !ticketData) {
        setMsg("Destek talebi bulunamadı veya bir hata oluştu.");
        setTicket(null);
        setLoading(false);
        return;
      }

      if (ticketError || !ticketData) {
        setMsg("Destek talebi bulunamadı veya bir hata oluştu.");
        setTicket(null);
        setLoading(false);
        return;
      }

      // Supabase ilişkisi bazen object, bazen array gelebilir → güvenli al
      const anyTicket = ticketData as any;
      const profile = anyTicket.profiles?.[0] || anyTicket.profiles || null;

      const userName =
        profile?.full_name || profile?.username || "Anonim kullanıcı";

      const mappedTicket: TicketDetail = {
        id: ticketData.id as string,
        subject: ticketData.subject as string,
        message: ticketData.message as string,
        status: ticketData.status as string,
        created_at: ticketData.created_at as string,
        updated_at: ticketData.updated_at as string,
        userName,
      };

      setTicket(mappedTicket);

      // cevaplar
      const { data: respData, error: respError } = await supabase
        .from("support_responses")
        .select("id, message, created_at, admin_id")
        .eq("ticket_id", id)
        .order("created_at", { ascending: true });

      if (!respError && respData) {
        setResponses(
          (respData as any[]).map((r) => ({
            id: r.id as string,
            message: r.message as string,
            created_at: r.created_at as string,
            admin_id: r.admin_id as string | null,
          }))
        );
      } else {
        setResponses([]);
      }

      setLoading(false);
    };

    load();
  }, [id]);

  async function handleChangeStatus(newStatus: "open" | "answered" | "closed") {
    if (!ticket) return;

    setMsg(null);

    const { error } = await supabase
      .from("support_tickets")
      .update({ status: newStatus })
      .eq("id", ticket.id);

    if (error) {
      setMsg("Durum güncellenirken bir hata oluştu: " + error.message);
      return;
    }

    setTicket({ ...ticket, status: newStatus });
    setMsg("Talep durumu güncellendi.");
  }

  async function handleSubmitResponse(e: React.FormEvent) {
    e.preventDefault();
    if (!ticket || !adminId) {
      setMsg("Oturum bulunamadı. Lütfen tekrar giriş yap.");
      return;
    }
    if (!newResponse.trim()) return;

    setSubmitting(true);
    setMsg(null);

    const message = newResponse.trim();

    const { data, error } = await supabase
      .from("support_responses")
      .insert({
        ticket_id: ticket.id,
        admin_id: adminId,
        message,
      })
      .select("id, message, created_at, admin_id")
      .single();

    if (error) {
      setSubmitting(false);
      setMsg("Yanıt kaydedilirken bir hata oluştu: " + error.message);
      return;
    }

    const newResp: TicketResponse = {
      id: data.id as string,
      message: data.message as string,
      created_at: data.created_at as string,
      admin_id: data.admin_id as string | null,
    };

    setResponses((prev) => [...prev, newResp]);
    setNewResponse("");
    setSubmitting(false);

    // Talep yanıtlandı olarak işaretlenebilir
    if (ticket.status === "open") {
      await supabase
        .from("support_tickets")
        .update({ status: "answered" })
        .eq("id", ticket.id);
      setTicket({ ...ticket, status: "answered" });
    }

    setMsg("Yanıt eklendi.");
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
        Destek talebi yükleniyor…
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Destek talebi bulunamadı.
        </p>
        <button
          type="button"
          onClick={() => router.push("/yonetim/destek")}
          className="mt-3 rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          ← Destek taleplerine dön
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Üst kısım: konu + kullanıcı + durum */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-2">
          <div>
            <button
              type="button"
              onClick={() => router.push("/yonetim/destek")}
              className="mb-2 text-[11px] text-slate-500 hover:underline dark:text-slate-400"
            >
              ← Tüm taleplere dön
            </button>
            <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {ticket.subject}
            </h1>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Gönderen:{" "}
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {ticket.userName}
              </span>
            </p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Oluşturulma: {new Date(ticket.created_at).toLocaleString("tr-TR")}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Son güncelleme:{" "}
              {new Date(ticket.updated_at).toLocaleString("tr-TR")}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={ticket.status} />

            <div className="flex flex-wrap justify-end gap-2 text-[11px]">
              {ticket.status !== "open" && (
                <button
                  type="button"
                  onClick={() => handleChangeStatus("open")}
                  className="rounded-xl border border-amber-500/60 px-3 py-1 text-amber-600 hover:bg-amber-500/10 dark:text-amber-300"
                >
                  Açık yap
                </button>
              )}
              {ticket.status !== "answered" && (
                <button
                  type="button"
                  onClick={() => handleChangeStatus("answered")}
                  className="rounded-xl border border-blue-500/60 px-3 py-1 text-blue-600 hover:bg-blue-500/10 dark:text-blue-300"
                >
                  Yanıtlandı
                </button>
              )}
              {ticket.status !== "closed" && (
                <button
                  type="button"
                  onClick={() => handleChangeStatus("closed")}
                  className="rounded-xl border border-slate-500/60 px-3 py-1 text-slate-700 hover:bg-slate-100 dark:border-slate-500 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  Kapat
                </button>
              )}
            </div>
          </div>
        </div>

        {msg && (
          <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-300">
            {msg}
          </p>
        )}
      </section>

      {/* Kullanıcı mesajı */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Kullanıcı mesajı
        </h2>
        <p className="whitespace-pre-line text-sm text-slate-800 dark:text-slate-200">
          {ticket.message}
        </p>
      </section>

      {/* Admin cevapları */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Admin yanıtları
        </h2>

        {responses.length === 0 ? (
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Bu talebe henüz cevap yazılmamış.
          </p>
        ) : (
          <div className="space-y-3">
            {responses.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-900/70"
              >
                <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Admin</span>
                  <span>{new Date(r.created_at).toLocaleString("tr-TR")}</span>
                </div>
                <p className="whitespace-pre-line text-slate-800 dark:text-slate-200">
                  {r.message}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Yanıt formu */}
        <form
          onSubmit={handleSubmitResponse}
          className="mt-4 space-y-2 text-xs"
        >
          <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
            Yeni yanıt yaz
          </label>
          <textarea
            value={newResponse}
            onChange={(e) => setNewResponse(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            placeholder="Kullanıcıya göndermek istediğin yanıtı buraya yaz..."
          />
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Yanıt eklediğinde kullanıcıya e-posta / bildirim sistemi varsa
              oradan bilgilendirebilirsin.
            </p>
            <button
              type="submit"
              disabled={submitting || !newResponse.trim()}
              className="rounded-xl bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-900 disabled:opacity-60 dark:text-slate-950"
            >
              {submitting ? "Gönderiliyor…" : "Yanıtı kaydet"}
            </button>
          </div>
        </form>
      </section>
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
