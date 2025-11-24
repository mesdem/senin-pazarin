// app/inbox/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

type CurrentUser = {
  id: string;
  email?: string;
};

type Conversation = {
  listing_id: string;
  listing_title: string;
  last_message: string;
  last_at: string;
  has_unread: boolean;
};

export default function InboxPage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setMsg("");

      // 1) Kullanıcıyı al
      const { data: userData } = await supabase.auth.getUser();
      const u = userData.user;

      if (!u) {
        setMsg("Mesaj kutusunu görmek için önce giriş yapmalısınız.");
        setLoading(false);
        router.push("/auth/login");
        return;
      }

      setUser({ id: u.id, email: u.email ?? undefined });

      // 2) Bu kullanıcıya gelen mesajları çek (is_read alanı ile birlikte)
      const { data, error } = await supabase
        .from("messages")
        .select(
          "id, listing_id, from_user, to_user, body, created_at, is_read, listings(title)"
        )
        .eq("to_user", u.id)
        .order("created_at", { ascending: false });

      if (error) {
        setMsg("Mesajlar alınırken hata oluştu: " + error.message);
        setLoading(false);
        return;
      }

      const rows = (data ?? []) as any[];

      // 3) Aynı ilan için birden fazla mesaj olabilir;
      //    ilan başına sadece "son mesaj" + okunmamış var mı bilgisi
      const byListing = new Map<string, { row: any; hasUnread: boolean }>();

      rows.forEach((row) => {
        const listingId = row.listing_id as string;
        const isUnread = row.is_read === false && row.to_user === u.id;

        if (!byListing.has(listingId)) {
          byListing.set(listingId, {
            row,
            hasUnread: isUnread,
          });
        } else {
          const existing = byListing.get(listingId)!;
          // daha önce kaydedilmişse sadece "hasUnread" bilgisini güncelle
          if (isUnread) {
            existing.hasUnread = true;
          }
        }
      });

      const convs: Conversation[] = Array.from(byListing.values()).map(
        ({ row, hasUnread }) => ({
          listing_id: row.listing_id,
          listing_title: row.listings?.title ?? "İlan",
          last_message: row.body,
          last_at: row.created_at,
          has_unread: hasUnread,
        })
      );

      setConversations(convs);
      setLoading(false);
    };

    load();
  }, [router]);

  if (loading) {
    return <p className="mt-4 text-sm text-slate-400">Yükleniyor…</p>;
  }

  if (!user) {
    return (
      <div className="mt-4 text-sm text-slate-300">
        {msg || "Giriş yapılmamış."}
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Mesaj Kutun</h1>
          <p className="text-xs text-slate-400">
            İlanlarına gelen mesajları buradan görebilirsin.
          </p>
        </div>
        <div className="text-right text-xs text-slate-400">
          <p>{user.email}</p>
        </div>
      </header>

      {msg && <p className="text-xs text-slate-300">{msg}</p>}

      {conversations.length === 0 ? (
        <p className="text-sm text-slate-400">
          Henüz ilanlarına gelen mesaj yok.
        </p>
      ) : (
        <div className="space-y-2">
          {conversations.map((c) => (
            <Link
              key={c.listing_id}
              href={`/messages/${c.listing_id}`}
              className={`flex items-center justify-between gap-3 rounded-2xl border p-3 text-xs hover:border-cyan-500/60 ${
                c.has_unread
                  ? "border-cyan-500/60 bg-slate-900"
                  : "border-slate-800 bg-slate-900/70"
              }`}
            >
              <div className="flex-1">
                <p
                  className={`text-sm ${
                    c.has_unread
                      ? "font-semibold text-slate-50"
                      : "font-semibold text-slate-100"
                  }`}
                >
                  {c.listing_title}
                </p>
                <p
                  className={`mt-1 line-clamp-1 ${
                    c.has_unread ? "text-slate-50" : "text-slate-300"
                  }`}
                >
                  {c.last_message}
                </p>
              </div>
              <div className="flex flex-col items-end text-[11px] text-slate-400">
                {new Date(c.last_at).toLocaleString("tr-TR", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {c.has_unread && (
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-cyan-400" />
                )}
                {!c.has_unread && (
                  <span className="mt-1 text-[10px] text-cyan-400">
                    Görüntüle →
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
