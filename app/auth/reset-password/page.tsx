// app/auth/reset-password/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function ResetPasswordRequestPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!email) {
      setMsg("Lütfen e-posta adresini yaz.");
      return;
    }

    setSending(true);

    try {
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:3000";

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/update-password`,
      });

      if (error) {
        setMsg("Bir hata oluştu: " + error.message);
      } else {
        setMsg(
          "Eğer bu e-posta ile bir hesap varsa, şifre sıfırlama bağlantısı gönderildi. Mail kutunu ve spam klasörünü kontrol et."
        );
      }
    } catch (err: any) {
      setMsg("Beklenmeyen bir hata oluştu.");
    }

    setSending(false);
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Şifreni sıfırla
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Hesabına kayıtlı e-posta adresini yaz. Sana şifre sıfırlama linki
          göndereceğiz.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-slate-500 dark:text-slate-400">
              E-posta
            </label>
            <input
              type="email"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
              placeholder="ornek@eposta.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {msg && (
            <p className="text-xs text-slate-600 dark:text-slate-300">{msg}</p>
          )}

          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60 dark:text-slate-950"
          >
            {sending ? "Gönderiliyor..." : "Şifre sıfırlama maili gönder"}
          </button>
        </form>

        <div className="mt-4 flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <Link href="/auth/login" className="hover:underline">
            ← Giriş sayfasına dön
          </Link>
          <Link href="/auth/register" className="hover:underline">
            Hesabın yok mu? Kayıt ol
          </Link>
        </div>
      </div>
    </div>
  );
}
