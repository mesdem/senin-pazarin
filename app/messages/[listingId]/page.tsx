// app/messages/[listingId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";

type Message = {
  id: string;
  listing_id: string;
  from_user: string;
  to_user: string;
  body: string;
  created_at: string;
  is_read?: boolean;
};

export default function MessagesPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params?.listingId as string;

  const [userId, setUserId] = useState<string | null>(null);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [listingTitle, setListingTitle] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setMsg("");

      // 1) Kullanıcıyı al
      const { data: userData } = await supabase.auth.getUser();
      const u = userData.user;

      if (!u) {
        setMsg("Mesaj göndermek için önce giriş yapmalısınız.");
        setLoading(false);
        router.push("/auth/login");
        return;
      }

      setUserId(u.id);

      // 2) İlanı al (başlık + ilan sahibi id)
      const { data: listingData, error: listingError } = await supabase
        .from("listings")
        .select("id, title, user_id")
        .eq("id", listingId)
        .single();

      if (listingError || !listingData) {
        setMsg("İlan bulunamadı.");
        setLoading(false);
        return;
      }

      const listingOwnerId = (listingData as any).user_id as string;
      setListingTitle((listingData as any).title);

      if (listingOwnerId === u.id) {
        setMsg(
          "Bu senin ilanının mesaj sayfası. Alıcılar buradan sana yazacak."
        );
      }

      setOtherUserId(listingOwnerId);

      // 3) Mevcut mesajları çek (bu ilan için, iki kullanıcı arasında)
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .eq("listing_id", listingId)
        .or(
          `and(from_user.eq.${u.id},to_user.eq.${listingOwnerId}),and(from_user.eq.${listingOwnerId},to_user.eq.${u.id})`
        )
        .order("created_at", { ascending: true });

      if (!messagesError && messagesData) {
        setMessages(messagesData as Message[]);
      }

      // 4) Bu sayfayı açan kullanıcı için gelen mesajları "okundu" yap
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("listing_id", listingId)
        .eq("to_user", u.id)
        .eq("is_read", false);

      setLoading(false);
    };

    if (listingId) {
      load();
    }
  }, [listingId, router]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !otherUserId) return;
    if (!newMessage.trim()) return;

    setSending(true);
    setMsg("");

    const { data, error } = await supabase
      .from("messages")
      .insert({
        listing_id: listingId,
        from_user: userId,
        to_user: otherUserId,
        body: newMessage.trim(),
        is_read: false, // yeni mesaj, karşı taraf için okunmadı
      })
      .select("*")
      .single();

    if (error) {
      setMsg("Mesaj gönderilirken hata oluştu: " + error.message);
    } else if (data) {
      setMessages((prev) => [...prev, data as Message]);
      setNewMessage("");
    }

    setSending(false);
  }

  if (loading) {
    return <p className="mt-4 text-sm text-slate-400">Yükleniyor…</p>;
  }

  if (!userId) {
    return (
      <p className="mt-4 text-sm text-slate-300">
        Mesajlara erişmek için giriş yapmalısınız.
      </p>
    );
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col py-4">
      <header className="mb-3 border-b border-slate-800 pb-2">
        <p className="text-xs text-slate-400">İlan</p>
        <h1 className="text-sm font-semibold">{listingTitle}</h1>
        {msg && <p className="mt-1 text-[11px] text-slate-400">{msg}</p>}
      </header>

      {/* Mesajlar listesi */}
      <div className="flex-1 space-y-2 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-3 text-xs">
        {messages.length === 0 ? (
          <p className="text-slate-400">Henüz mesaj yok. İlk mesajı sen yaz.</p>
        ) : (
          messages.map((m) => {
            const isMine = m.from_user === userId;
            return (
              <div
                key={m.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-3 py-2 ${
                    isMine
                      ? "bg-cyan-500 text-slate-900"
                      : "bg-slate-800 text-slate-100"
                  }`}
                >
                  <p className="break-words">{m.body}</p>
                  <p className="mt-1 text-[10px] opacity-70">
                    {new Date(m.created_at).toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Mesaj yazma alanı */}
      <form
        onSubmit={handleSend}
        className="mt-3 flex gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-2 text-xs"
      >
        <input
          className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none"
          placeholder="Mesajını yaz..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          type="submit"
          disabled={sending}
          className="rounded-xl bg-cyan-400 px-3 py-2 font-semibold text-slate-900 disabled:opacity-60"
        >
          Gönder
        </button>
      </form>
    </div>
  );
}
