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

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/`
              : undefined,
        },
      });

      if (error) console.error(error);
    } catch (err) {
      console.error(err);
    }
  };

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
      window.location.href = "/";
    }

    setLoading(false);
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Giriş Yap
        </h1>

        {/* 🔥 GOOGLE ORİJİNAL BUTON 🔥 */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="
            mt-4 mb-4 flex w-full items-center justify-center gap-3
            rounded-xl border border-slate-300 bg-white
            px-4 py-2 text-sm font-medium text-slate-700
            hover:bg-slate-50 
            dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 
            dark:hover:bg-slate-800 transition
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="h-5 w-5"
          >
            <path
              fill="#4285F4"
              d="M24 9.5c3.6 0 6.1 1.5 7.5 2.7l5.5-5.5C33.1 3.2 28.9 1.5 24 1.5 14.8 1.5 7.1 7.4 4.4 15.6l6.8 5.3C12.6 14.7 17.8 9.5 24 9.5z"
            />
            <path
              fill="#34A853"
              d="M46.1 24.5c0-1.5-.1-2.7-.4-4H24v7.5h12.7c-.6 3.3-2.5 6.1-5.5 8l6.8 5.3c4-3.7 6.1-9.1 6.1-14.8z"
            />
            <path
              fill="#FBBC05"
              d="M11.2 28.4c-.5-1.3-.7-2.6-.7-4s.3-2.7.7-4l-6.8-5.3C2.7 18.6 2 21.2 2 24c0 2.8.7 5.4 2.4 8l6.8-5.6z"
            />
            <path
              fill="#EA4335"
              d="M24 46.5c5 0 9.2-1.6 12.2-4.4l-6.8-5.3c-1.8 1.2-4.3 2.1-7.5 2.1-6.3 0-11.6-5.1-12.8-11.7l-6.8 5.5C7.1 40.6 14.8 46.5 24 46.5z"
            />
          </svg>
          Google ile giriş yap
        </button>
        {/* 🔥 ORİJİNAL GOOGLE BUTON BİTİŞ 🔥 */}

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

          {/* Şifre sıfırlama */}
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

          {/* Mesaj */}
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
