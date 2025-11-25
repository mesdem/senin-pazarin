// app/messages/[listingId]/page.tsx
"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type MessageRow = {
  id: number;
  listing_id: string;
  sender_id: string;
  receiver_id: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
};

type ListingRow = {
  id: string;
  title: string;
  user_id: string;
};

export default function MessagesForListingPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params?.listingId as string;

  const [userId, setUserId] = useState<string | null>(null);
  const [listing, setListing] = useState<ListingRow | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let channel: any = null;

    const init = async () => {
      setLoading(true);

      // 1) Kullanıcıyı kontrol et
      const { data: userData } = await supabase.auth.getUser();
      const u = userData.user;
      if (!u) {
        router.push("/auth/login");
        return;
      }
      setUserId(u.id);

      // 2) İlan bilgisini çek
      const { data: listingData, error: listingError } = await supabase
        .from("listings")
        .select("id, title, user_id")
        .eq("id", listingId)
        .single();

      if (listingError || !listingData) {
        setError("İlan bulunamadı veya erişim yok.");
        setLoading(false);
        return;
      }

      setListing(listingData as ListingRow);

      // 3) Mevcut mesajları çek (image_url dahil)
      const { data: msgData, error: msgError } = await supabase
        .from("messages")
        .select("*")
        .eq("listing_id", listingId)
        .order("created_at", { ascending: true });

      if (msgError) {
        console.error(msgError);
        setError("Mesajlar yüklenirken hata oluştu.");
      } else if (msgData) {
        setMessages(msgData as MessageRow[]);
      }

      // 4) Realtime kanal
      channel = supabase
        .channel(`messages-listing-${listingId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `listing_id=eq.${listingId}`,
          },
          (payload) => {
            const newMsg = payload.new as MessageRow;

            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg].sort((a, b) =>
                a.created_at.localeCompare(b.created_at)
              );
            });
          }
        )
        .subscribe();

      setLoading(false);
    };

    if (listingId) {
      init();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [listingId, router]);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basit bir boyut kontrolü (örn. 5MB üstünü reddet)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Görsel 5MB üzerinde olamaz.");
      return;
    }

    setError("");
    setImageFile(file);
  }

  async function handleSend(e?: FormEvent) {
    if (e) e.preventDefault();
    if (!userId || !listing || sending) return;

    const trimmed = text.trim();
    if (!trimmed && !imageFile) {
      // Ne yazı ne görsel var
      return;
    }

    setSending(true);
    setError("");

    try {
      let imageUrl: string | null = null;

      // 1) Görsel varsa önce onu upload et
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${userId}/${listing.id}/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("message-images")
          .upload(path, imageFile);

        if (uploadError) {
          console.error(uploadError);
          setError("Görsel yüklenirken hata oluştu.");
          setSending(false);
          return;
        }

        const { data: publicData } = supabase.storage
          .from("message-images")
          .getPublicUrl(path);

        imageUrl = publicData?.publicUrl ?? null;
      }

      // 2) Mesajı ekle (text + optional image_url)
      const { data: inserted, error: insertError } = await supabase
        .from("messages")
        .insert({
          listing_id: listing.id,
          sender_id: userId,
          receiver_id: listing.user_id,
          content: trimmed || null,
          image_url: imageUrl,
        })
        .select("*")
        .single();

      if (insertError || !inserted) {
        console.error(insertError);
        setError("Mesaj gönderilirken bir hata oluştu.");
        setSending(false);
        return;
      }

      const insertedMsg = inserted as MessageRow;

      // 3) Bildirim oluştur (alıcı için)
      await supabase.from("notifications").insert({
        user_id: listing.user_id,
        type: "new_message",
        title: "Yeni mesajın var",
        body: imageUrl
          ? `Bir kullanıcı sana "${listing.title}" ilanı hakkında fotoğraflı mesaj gönderdi.`
          : `Bir kullanıcı sana "${listing.title}" ilanı hakkında mesaj gönderdi.`,
        listing_id: listing.id,
        message_id: insertedMsg.id,
      });

      // 4) Mesajı hemen listeye ekle (Realtime da göndereceği için ID’ye göre çakışmayı engelliyoruz)
      setMessages((prev) => {
        if (prev.some((m) => m.id === insertedMsg.id)) return prev;
        return [...prev, insertedMsg].sort((a, b) =>
          a.created_at.localeCompare(b.created_at)
        );
      });

      setText("");
      setImageFile(null);
    } catch (err) {
      console.error(err);
      setError("Beklenmeyen bir hata oluştu.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return <p className="mt-4 text-sm text-slate-400">Mesajlar yükleniyor…</p>;
  }

  if (!listing || !userId) {
    return (
      <p className="mt-4 text-sm text-slate-400">
        Bu mesaja erişim yok veya ilan bulunamadı.
      </p>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col py-4">
      {/* Üst bar */}
      <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-2">
        <div>
          <p className="text-xs text-slate-400">Sohbet</p>
          <Link
            href={`/listings/${listing.id}`}
            className="text-sm font-semibold text-slate-100 hover:text-cyan-300"
          >
            {listing.title}
          </Link>
        </div>
        <Link href="/inbox" className="text-xs text-cyan-300 hover:underline">
          Gelen Kutusu
        </Link>
      </div>

      {/* Mesaj listesi */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
        {messages.length === 0 ? (
          <p className="text-xs text-slate-400">
            Henüz mesaj yok. İlk mesajı sen gönderebilirsin.
          </p>
        ) : (
          <div className="space-y-2">
            {messages.map((m) => {
              const isMine = m.sender_id === userId;
              const timeText = new Date(m.created_at).toLocaleTimeString(
                "tr-TR",
                { hour: "2-digit", minute: "2-digit" }
              );

              return (
                <div
                  key={m.id}
                  className={`flex w-full ${
                    isMine ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs ${
                      isMine
                        ? "bg-cyan-500 text-slate-900 rounded-br-sm"
                        : "bg-slate-800 text-slate-100 rounded-bl-sm"
                    }`}
                  >
                    {/* Görsel varsa */}
                    {m.image_url && (
                      <div className="mb-1 overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
                        <img
                          src={m.image_url}
                          alt="Gönderilen görsel"
                          className="max-h-64 w-full object-cover"
                        />
                      </div>
                    )}

                    {/* Metin varsa */}
                    {m.content && (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    )}

                    <p
                      className={`mt-1 text-[10px] ${
                        isMine ? "text-slate-900/70" : "text-slate-300/70"
                      }`}
                    >
                      {timeText}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hata mesajı */}
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      {/* Mesaj yazma + görsel ekleme alanı */}
      <form
        onSubmit={handleSend}
        className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 px-3 py-2"
      >
        <div className="flex flex-col gap-1 flex-1">
          <textarea
            className="max-h-24 min-h-[40px] flex-1 resize-none bg-transparent text-sm text-slate-100 outline-none"
            placeholder="Mesajını yaz..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {/* Seçili görsel önizleme */}
          {imageFile && (
            <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-200">
              <span className="truncate max-w-[200px]">
                📷 {imageFile.name}
              </span>
              <button
                type="button"
                className="text-red-400 hover:underline ml-2"
                onClick={() => setImageFile(null)}
              >
                Kaldır
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <label className="flex cursor-pointer items-center gap-1">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-600">
                📎
              </span>
              <span>Görsel ekle</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={sending || (!text.trim() && !imageFile)}
          className="rounded-xl bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-900 disabled:opacity-50"
        >
          Gönder
        </button>
      </form>
    </div>
  );
}
