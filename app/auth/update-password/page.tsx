// app/auth/update-password/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Bu sayfaya Supabase'in linkiyle gelinmiş mi, bir oturum var mı kontrol
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setMsg(
          "Geçersiz veya süresi geçmiş bağlantı. Lütfen şifre sıfırlama isteğini tekrar gönder."
        );
      }
      setCheckingSession(false);
    };
    checkSession();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (!newPassword || newPassword.length < 6) {
      setMsg("Şifre en az 6 karakter olmalı.");
      return;
    }

    if (newPassword !== confirm) {
      setMsg("Şifre ve şifre tekrar aynı olmalı.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setMsg("Şifre güncellenirken hata oluştu: " + error.message);
    } else {
      setMsg("Şifren güncellendi. Giriş sayfasına yönlendiriliyorsun...");
      // Biraz bekleyip login sayfasına yönlendirelim
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    }

    setSaving(false);
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Bağlantı kontrol ediliyor…
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Yeni şifreni belirle
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Güvenli bir şifre seç ve hesabına yeni şifrenle giriş yap.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-slate-500 dark:text-slate-400">
              Yeni şifre
            </label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 dark:text-slate-400">
              Yeni şifre (tekrar)
            </label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {msg && (
            <p className="text-xs text-slate-600 dark:text-slate-300">{msg}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60 dark:text-slate-950"
          >
            {saving ? "Kaydediliyor..." : "Şifreyi güncelle"}
          </button>
        </form>

        <div className="mt-4 text-center text-[11px] text-slate-500 dark:text-slate-400">
          <Link href="/auth/login" className="hover:underline">
            Giriş sayfasına dön
          </Link>
        </div>
      </div>
    </div>
  );
}
