"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SupportRequestPage() {
  const [category, setCategory] = useState("Hesap Sorunları");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      const u = data.user;

      if (!u) {
        router.push("/auth/login");
        return;
      }

      setUserId(u.id);
      setEmail(u.email || "");
    };

    loadUser();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setInfo(null);

    if (!message.trim()) {
      setErrorMsg("Lütfen mesajınızı yazın.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("support_requests").insert({
      user_id: userId,
      email,
      category,
      message,
    });

    if (error) {
      setErrorMsg("Talep gönderilirken hata oluştu.");
      console.error(error);
    } else {
      setInfo(
        "Destek talebiniz başarıyla gönderildi. En kısa sürede dönüş yapacağız."
      );
      setMessage("");
    }

    setLoading(false);
  }

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-2">Destek Talebi Oluştur</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
        Yaşadığınız sorunları veya taleplerinizi bize bildirebilirsiniz.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        {/* Kategori */}
        <div>
          <label className="block text-xs font-semibold mb-1">Kategori</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          >
            <option>Hesap Sorunları</option>
            <option>Ödeme Problemleri</option>
            <option>İlan / Ürün Sorunları</option>
            <option>Güvenlik & Dolandırıcılık</option>
            <option>Şikayet</option>
            <option>Öneri</option>
          </select>
        </div>

        {/* E-posta */}
        <div>
          <label className="block text-xs font-semibold mb-1">E-posta</label>
          <input
            type="email"
            readOnly
            value={email}
            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
        </div>

        {/* Mesaj */}
        <div>
          <label className="block text-xs font-semibold mb-1">Açıklama</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 min-h-[120px] dark:border-slate-700 dark:bg-slate-900"
            placeholder="Sorununuzu ayrıntılı olarak açıklayın..."
          />
        </div>

        {/* Hata / Bilgi */}
        {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}
        {info && <p className="text-xs text-emerald-500">{info}</p>}

        {/* Gönder */}
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Gönderiliyor..." : "Talep Gönder"}
        </button>
      </form>
    </div>
  );
}
