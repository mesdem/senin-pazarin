// app/messages/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type ListingSummary = {
  id: string;
  title: string;
  city: string | null;
  price: number | null;
  user_id: string;
};

type MessageItem = {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
};

type AuthState = "loading" | "unauth" | "auth";

export default function MessageThreadPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params?.id as string | undefined;

  const [authState, setAuthState] = useState<AuthState>("loading");
  const [userId, setUserId] = useState<string | null>(null);

  const [listing, setListing] = useState<ListingSummary | null>(null);
  const [sellerId, setSellerId] = useState<string | null>(null);

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!listingId) return;

      setLoading(true);
      setMsg(null);

      // 1) Kullanıcı oturumu
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        setAuthState("unauth");
        setLoading(false);
        return;
      }

      setAuthState("auth");
      setUserId(user.id);

      // 2) İlan bilgisi
      const { data: listingData, error: listingError } = await supabase
        .from("listings")
        .select("id, title, city, price, user_id")
        .eq("id", listingId)
        .maybeSingle();

      if (listingError || !listingData) {
        setMsg("İlan bilgisi bulunamadı.");
        setListing(null);
        setLoading(false);
        return;
      }

      const listingAny = listingData as any;
      const mappedListing: ListingSummary = {
        id: listingAny.id as string,
        title: listingAny.title as string,
        city: (listingAny.city as string) ?? null,
        price:
          typeof listingAny.price === "number"
            ? (listingAny.price as number)
            : null,
        user_id: listingAny.user_id as string,
      };

      setListing(mappedListing);
      setSellerId(mappedListing.user_id);

      // 3) Mesajları çek
      const { data: msgData, error: msgError } = await supabase
        .from("messages")
        .select("id, content, created_at, sender_id, receiver_id")
        .eq("listing_id", listingId)
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${mappedListing.user_id}),and(sender_id.eq.${mappedListing.user_id},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });

      if (msgError) {
        console.error("Mesajları çekerken hata:", msgError);
        setMessages([]);
      } else {
        const rows = (msgData ?? []) as any[];
        setMessages(
          rows.map((m) => ({
            id: m.id as string,
            content: m.content as string,
            created_at: m.created_at as string,
            sender_id: m.sender_id as string,
            receiver_id: m.receiver_id as string,
          }))
        );
      }

      setLoading(false);
    };

    load();
  }, [listingId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !sellerId || !listingId) return;
    if (!newMessage.trim()) return;

    setSending(true);
    setMsg(null);

    const content = newMessage.trim();

    const { data, error } = await supabase
      .from("messages")
      .insert({
        listing_id: listingId,
        sender_id: userId,
        receiver_id: sellerId,
        content,
      })
      .select("id, content, created_at, sender_id, receiver_id")
      .single();

    if (error) {
      console.error("Mesaj gönderme hatası:", error);
      setMsg("Mesaj gönderilirken bir hata oluştu.");
      setSending(false);
      return;
    }

    const inserted: MessageItem = {
      id: data.id as string,
      content: data.content as string,
      created_at: data.created_at as string,
      sender_id: data.sender_id as string,
      receiver_id: data.receiver_id as string,
    };

    setMessages((prev) => [...prev, inserted]);
    setNewMessage("");
    setSending(false);
  }

  // 🔹 Oturum durumları
  if (!listingId) {
    return (
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        Geçersiz mesaj sayfası (ilan bilgisi eksik).
      </p>
    );
  }

  if (authState === "loading") {
    return (
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        Giriş bilgilerin kontrol ediliyor…
      </p>
    );
  }

  if (authState === "unauth") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Mesaj göndermek için giriş yapmalısın
          </h1>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            İlan sahibine mesaj gönderebilmek için önce giriş yap.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Link
              href="/auth/login"
              className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 dark:text-slate-950"
            >
              Giriş yap
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Ana sayfaya dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        Mesaj sayfası yükleniyor…
      </p>
    );
  }

  if (!listing || !sellerId) {
    return (
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          İlan veya satıcı bilgisi bulunamadı.
        </p>
        <button
          type="button"
          onClick={() => router.push("/messages")}
          className="mt-3 rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          ← Mesaj listesine dön
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl py-4 space-y-4">
      {/* Üst bilgi: ilan özeti */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <button
          type="button"
          onClick={() => router.push("/messages")}
          className="mb-2 text-[11px] text-slate-500 hover:underline dark:text-slate-400"
        >
          ← Mesaj listesine dön
        </button>
        <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {listing.title}
        </h1>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          {listing.city && <span>{listing.city} • </span>}
          {listing.price != null && (
            <span>{listing.price.toLocaleString("tr-TR")} ₺</span>
          )}
        </p>
        <Link
          href={`/listings/${listing.id}`}
          className="mt-2 inline-block text-[11px] text-cyan-600 hover:underline dark:text-cyan-400"
        >
          İlan sayfasını gör →
        </Link>
      </section>

      {/* Mesajlar listesi */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Sohbet
          </h2>
        </div>

        {messages.length === 0 ? (
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Henüz bu ilan için mesaj yok. İlk mesajı sen gönderebilirsin.
          </p>
        ) : (
          <div className="mb-4 space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {messages.map((m) => {
              const isMine = m.sender_id === userId;
              return (
                <div
                  key={m.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs ${
                      isMine
                        ? "bg-cyan-500 text-slate-950"
                        : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.content}</p>
                    <p
                      className={`mt-1 text-[10px] ${
                        isMine
                          ? "text-slate-900/70"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {new Date(m.created_at).toLocaleString("tr-TR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Yeni mesaj formu */}
        <form onSubmit={handleSend} className="space-y-2 text-xs">
          <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
            Yeni mesaj yaz
          </label>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            placeholder="Satıcıya göndermek istediğin mesajı buraya yaz..."
          />

          {msg && (
            <p className="text-[11px] text-slate-500 dark:text-slate-300">
              {msg}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="rounded-xl bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-900 disabled:opacity-60 dark:text-slate-950"
            >
              {sending ? "Gönderiliyor…" : "Mesaj Gönder"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
