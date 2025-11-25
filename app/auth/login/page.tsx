// app/auth/login/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMsg("Giriş yapılamadı: " + error.message);
    } else {
      setMsg("Giriş başarılı! Yönlendiriliyorsun...");
      window.location.href = "/"; // anasayfaya yönlendirme
    }

    setLoading(false);
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Giriş Yap
        </h1>

        <form onSubmit={handleLogin} className="mt-4 space-y-3">
          {/* E-posta */}
          <div className="space-y-1">
            <label className="text-xs text-slate-500 dark:text-slate-400">
              E-posta
            </label>
            <input
              type="email"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              placeholder="ornek@eposta.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Şifre */}
          <div className="space-y-1">
            <label className="text-xs text-slate-500 dark:text-slate-400">
              Şifre
            </label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* 🔥 ŞİFRE SIFIRLAMA BLOĞU — TAM BURAYA EKLİYORSUN */}
          <div className="flex items-center justify-between text-[11px] mt-1">
            <span className="text-slate-500 dark:text-slate-400">
              Şifreni mi unuttun?
            </span>
            <Link
              href="/auth/reset-password"
              className="font-semibold text-cyan-600 hover:underline dark:text-cyan-400"
            >
              Şifre sıfırla
            </Link>
          </div>
          {/* 🔥 BURAYA EKLENDİ */}

          {/* Mesaj / hata */}
          {msg && (
            <p className="text-xs text-red-500 dark:text-red-400">{msg}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60 dark:text-slate-950"
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <div className="mt-4 text-center text-[11px] text-slate-500 dark:text-slate-400">
          <Link href="/auth/register" className="hover:underline">
            Hesabın yok mu? Kaydol
          </Link>
        </div>
      </div>
    </div>
  );
}
