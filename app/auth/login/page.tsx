"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMsg(error.message);
    } else {
      router.push("/profile"); // girişten sonra profiline götürüyoruz
    }

    setLoading(false);
  };

  return (
    <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <h1 className="mb-3 text-lg font-semibold">Giriş Yap</h1>
      <form onSubmit={onSubmit} className="space-y-3 text-sm">
        <input
          type="email"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          disabled={loading}
          className="w-full rounded-xl bg-cyan-400 py-2 font-semibold text-slate-900 disabled:opacity-60"
        >
          {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
        </button>
      </form>
      {msg && <p className="mt-2 text-xs text-slate-300">{msg}</p>}
    </div>
  );
}
