"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    // Supabase auth ile kayıt
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMsg(error.message);
      setLoading(false);
      return;
    }

    // Kullanıcı gerçekten oluştuysa profil kaydı dene (profiles tablon yoksa sadece hata dönüp geçer)
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: fullName,
      });

      // Profil tablosu yoksa vs. hata alırsan şimdilik sadece konsola yazıyoruz
      if (profileError) {
        console.log("profiles insert error:", profileError.message);
      }
    }

    setMsg("Kayıt başarılı, şimdi giriş yapabilirsiniz.");
    setLoading(false);
    router.push("/auth/login");
  };

  return (
    <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <h1 className="mb-3 text-lg font-semibold">Üye Ol</h1>
      <form onSubmit={onSubmit} className="space-y-3 text-sm">
        <input
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
          placeholder="Ad Soyad"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
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
          {loading ? "Gönderiliyor…" : "Kayıt Ol"}
        </button>
      </form>
      {msg && <p className="mt-2 text-xs text-slate-300">{msg}</p>}
    </div>
  );
}
