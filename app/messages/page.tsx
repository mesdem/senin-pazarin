// app/messages/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type AuthState = "loading" | "unauth" | "auth";

type ThreadItem = {
  listingId: string;
  otherUserId: string;
  lastMessage: string;
  lastMessageAt: string;
  isSender: boolean;
  listingTitle: string;
  listingCity: string | null;
  listingPrice: number | null;
};

export default function MessagesPage() {
  const router = useRouter();

  const [authState, setAuthState] = useState<AuthState>("loading");
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        setAuthState("unauth");
        setLoading(false);
        return;
      }

      setUserId(user.id);

      // Profil adı (opsiyonel)
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, username")
        .eq("id", user.id)
        .maybeSingle();

      setUserName(
        (profile?.full_name as string) ||
          (profile?.username as string) ||
          user.email ||
          null
      );

      setAuthState("auth");

      // 📨 Mesajları çek
      const { data, error } = await supabase
        .from("messages")
        .select(
          `
          id,
          listing_id,
          content,
          created_at,
          sender_id,
          receiver_id,
          listings (
            title,
            city,
            price
          )
        `
        )
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Mesajlar sorgu hatası:", error);
        setThreads([]);
        setLoading(false);
        return;
      }

      const rows = (data ?? []) as any[];

      const threadMap = new Map<string, ThreadItem>();

      for (const msg of rows) {
        const isSender = msg.sender_id === user.id;
        const otherUserId = isSender ? msg.receiver_id : msg.sender_id;
        const key = `${msg.listing_id}-${otherUserId}`;

        if (!threadMap.has(key)) {
          threadMap.set(key, {
            listingId: msg.listing_id,
            otherUserId,
            lastMessage: msg.content,
            lastMessageAt: msg.created_at,
            isSender,
            listingTitle: msg.listings?.title || "İlan",
            listingCity: msg.listings?.city || null,
            listingPrice:
              typeof msg.listings?.price === "number"
                ? msg.listings.price
                : null,
          });
        }
      }

      setThreads(Array.from(threadMap.values()));
      setLoading(false);
    };

    load();
  }, []);

  if (authState === "loading") {
    return (
      <div className="py-8 text-sm text-slate-500 dark:text-slate-400">
        Mesaj kutun yükleniyor…
      </div>
    );
  }

  if (authState === "unauth") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Mesajlarını görmek için giriş yapmalısın
          </h1>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            İlan sahipleriyle yaptığın tüm yazışmalar burada listelenecek.
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

  return (
    <div className="py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Mesajlar
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            İlan sahipleriyle yaptığın tüm yazışmalar burada.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Mesajlar yükleniyor…
        </p>
      ) : threads.length === 0 ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-6 text-center text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-2xl">
              💬
            </div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Henüz bir mesajın yok
            </h2>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Bir ilanı beğendiğinde{" "}
              <span className="font-medium text-slate-700 dark:text-slate-200">
                “Mesaj Gönder”
              </span>{" "}
              butonuna tıklayarak satıcıyla sohbet başlatabilirsin.
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Link
                href="/explore"
                className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 dark:text-slate-950"
              >
                İlanları keşfet
              </Link>
              <button
                type="button"
                onClick={() => router.push("/listings/new")}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                İlan ver
              </button>
            </div>

            {userName && (
              <p className="mt-4 text-[11px] text-slate-400 dark:text-slate-500">
                Giriş yapan kullanıcı:{" "}
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  {userName}
                </span>
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {threads.map((thread) => (
            <button
              key={`${thread.listingId}-${thread.otherUserId}`}
              type="button"
              onClick={() => router.push(`/messages/${thread.listingId}`)}
              className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left text-xs shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                    {thread.isSender ? "Satıcıya mesaj" : "Satıcıdan mesaj"}
                  </span>
                  {thread.listingCity && (
                    <span className="text-[10px] text-slate-400">
                      {thread.listingCity}
                    </span>
                  )}
                </div>
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {thread.listingTitle}
                </p>
                <p className="line-clamp-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {thread.lastMessage}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 pl-2">
                {thread.listingPrice != null && (
                  <span className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">
                    {thread.listingPrice.toLocaleString("tr-TR")} ₺
                  </span>
                )}
                <span className="text-[10px] text-slate-400">
                  {new Date(thread.lastMessageAt).toLocaleString("tr-TR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
