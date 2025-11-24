// app/sent/page.tsx
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
};

export default function SentPage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setMsg("");

      const { data: userData } = await supabase.auth.getUser();
      const u = userData.user;

      if (!u) {
        setMsg("Gönderdiğin mesajları görmek için önce giriş yapmalısın.");
        setLoading(false);
        router.push("/auth/login");
        return;
      }

      setUser({ id: u.id, email: u.email ?? undefined });

      // Bu kullanıcının GÖNDERDİĞİ mesajlar
      const { data, error } = await supabase
        .from("messages")
        .select(
          "id, listing_id, from_user, to_user, body, created_at, listings(title)"
        )
        .eq("from_user", u.id)
        .order("created_at", { ascending: false });

      if (error) {
        setMsg("Mesajlar alınırken hata oluştu: " + error.message);
        setLoading(false);
        return;
      }

      const rows = (data ?? []) as any[];

      const byListing = new Map<string, any>();

      rows.forEach((row) => {
        const listingId = row.listing_id as string;
        if (!byListing.has(listingId)) {
          byListing.set(listingId, row); // ilk gelen zaten en son mesaj
        }
      });

      const convs: Conversation[] = Array.from(byListing.values()).map(
        (row: any) => ({
          listing_id: row.listing_id,
          listing_title: row.listings?.title ?? "İlan",
          last_message: row.body,
          last_at: row.created_at,
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
          <h1 className="text-xl font-semibold">Gönderdiğin Mesajlar</h1>
          <p className="text-xs text-slate-400">
            Farklı ilanlara yazdığın son mesajları burada görebilirsin.
          </p>
        </div>
        <div className="text-right text-xs text-slate-400">
          <p>{user.email}</p>
        </div>
      </header>

      {msg && <p className="text-xs text-slate-300">{msg}</p>}

      {conversations.length === 0 ? (
        <p className="text-sm text-slate-400">
          Henüz kimseye mesaj yazmamışsın.
        </p>
      ) : (
        <div className="space-y-2">
          {conversations.map((c) => (
            <Link
              key={c.listing_id}
              href={`/messages/${c.listing_id}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-3 text-xs hover:border-cyan-500/60"
            >
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-100">
                  {c.listing_title}
                </p>
                <p className="mt-1 line-clamp-1 text-slate-300">
                  {c.last_message}
                </p>
              </div>
              <div className="text-right text-[11px] text-slate-400">
                {new Date(c.last_at).toLocaleString("tr-TR", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                <p className="mt-1 text-[10px] text-cyan-400">Görüntüle →</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
