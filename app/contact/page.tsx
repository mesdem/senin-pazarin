"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setInfo(null);
    setErrorMsg(null);

    if (!name || !email || !message) {
      setErrorMsg("Lütfen isim, e-posta ve mesaj alanlarını doldurun.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("contact_messages").insert({
      name,
      email,
      subject: subject || null,
      message,
    });

    if (error) {
      setErrorMsg(
        "Mesajınız gönderilirken bir hata oluştu. Lütfen tekrar deneyin."
      );
      console.error(error);
    } else {
      setInfo(
        "Mesajınız başarıyla gönderildi. En kısa sürede dönüş yapacağız."
      );
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    }

    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-2">İletişim</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
        Senin Pazarın ile ilgili öneri, şikâyet veya iş birliği talepleriniz
        için formu doldurabilirsiniz.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
            Adınız Soyadınız
          </label>
          <input
            type="text"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none
                       focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400
                       dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            placeholder="Örneğin: Mesut Demir"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
            E-posta adresiniz
          </label>
          <input
            type="email"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none
                       focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400
                       dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            placeholder="ornek@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
            Konu (isteğe bağlı)
          </label>
          <input
            type="text"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none
                       focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400
                       dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            placeholder="Örneğin: Hata bildirimi, öneri, iş birliği..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
            Mesajınız
          </label>
          <textarea
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none min-h-[120px]
                       focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400
                       dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            placeholder="Bize iletmek istediğiniz detayları buraya yazabilirsiniz."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}

        {info && <p className="text-xs text-emerald-500">{info}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white
                     hover:bg-cyan-600 disabled:opacity-60"
        >
          {loading ? "Gönderiliyor..." : "Mesajı Gönder"}
        </button>
      </form>
    </div>
  );
}
