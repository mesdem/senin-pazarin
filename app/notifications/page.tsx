// app/notifications/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Notification = {
  id: number;
  type: string;
  title: string | null;
  body: string | null;
  listing_id: string | null;
  message_id: number | null;
  is_read: boolean;
  created_at: string;
};

export default function NotificationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      const u = userData.user;

      if (!u) {
        router.push("/auth/login");
        return;
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", u.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        setMsg("Bildirimler yüklenirken hata oluştu: " + error.message);
      } else if (data) {
        setNotifications(data as Notification[]);
      }

      setLoading(false);
    };

    load();
  }, [router]);

  async function markAllAsRead() {
    setMsg("");
    const { data: userData } = await supabase.auth.getUser();
    const u = userData.user;
    if (!u) {
      router.push("/auth/login");
      return;
    }

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", u.id)
      .eq("is_read", false);

    if (error) {
      setMsg("Bildirimler güncellenirken hata oluştu: " + error.message);
      return;
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  if (loading) {
    return (
      <p className="mt-4 text-sm text-slate-400">Bildirimler yükleniyor…</p>
    );
  }

  return (
    <div className="space-y-4 py-4">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold">Bildirimlerin</h1>
          <p className="text-xs text-slate-400">
            Yeni mesaj ve diğer sistem bildirimlerin burada listelenir.
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <button
            onClick={markAllAsRead}
            className="rounded-xl border border-slate-700 px-3 py-2 text-slate-200 hover:bg-slate-800"
          >
            Tümünü okundu işaretle
          </button>
          <Link
            href="/"
            className="rounded-xl border border-slate-700 px-3 py-2 text-slate-200 hover:bg-slate-800"
          >
            Ana sayfa
          </Link>
        </div>
      </header>

      {msg && <p className="text-xs text-slate-300">{msg}</p>}

      {notifications.length === 0 ? (
        <p className="text-sm text-slate-400">Henüz bir bildirimin yok.</p>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const isNew = !n.is_read;
            const created = new Date(n.created_at).toLocaleString("tr-TR");

            // Hedef link (şimdilik mesaj ve ilan üzerinden)
            let linkHref: string | null = null;
            if (n.type === "new_message" && n.listing_id) {
              linkHref = `/listings/${n.listing_id}`;
            } else if (n.listing_id) {
              linkHref = `/listings/${n.listing_id}`;
            }

            return (
              <div
                key={n.id}
                className={`flex justify-between gap-3 rounded-2xl border px-4 py-3 text-xs ${
                  isNew
                    ? "border-cyan-500/40 bg-cyan-500/5"
                    : "border-slate-800 bg-slate-900/70"
                }`}
              >
                <div>
                  <p className="font-semibold text-slate-100">
                    {n.title || "Bildirim"}
                  </p>
                  {n.body && <p className="mt-1 text-slate-200">{n.body}</p>}
                  <p className="mt-1 text-[11px] text-slate-400">{created}</p>
                </div>
                {linkHref && (
                  <div className="flex items-center">
                    <Link
                      href={linkHref}
                      className="rounded-xl border border-slate-700 px-3 py-2 text-[11px] text-cyan-300 hover:bg-slate-800"
                    >
                      Görüntüle
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
