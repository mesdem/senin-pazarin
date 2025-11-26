// app/admin/messages/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type ContactMessage = {
  id: string;
  name: string | null;
  email: string | null;
  subject: string | null;
  message: string | null;
  created_at: string;
};

export default function AdminMessagesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErrorMsg(null);

      // 1) Kullanıcı var mı?
      const { data: userData } = await supabase.auth.getUser();
      const u = userData.user;

      if (!u) {
        setErrorMsg("Bu sayfayı görmek için giriş yapmalısınız.");
        setLoading(false);
        router.push("/auth/login");
        return;
      }

      // 2) Admin mi?
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", u.id)
        .maybeSingle();

      if (profileError || !profileData || !profileData.is_admin) {
        setErrorMsg("Bu sayfayı görüntüleme yetkiniz yok.");
        setLoading(false);
        setCheckingAdmin(false);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(true);
      setCheckingAdmin(false);

      // 3) Mesajları çek
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMsg("Mesajlar yüklenirken bir hata oluştu.");
        setMessages([]);
      } else {
        setMessages((data as ContactMessage[]) || []);
      }

      setLoading(false);
    };

    load();
  }, [router]);

  if (checkingAdmin || loading) {
    return <p className="mt-4 text-sm text-slate-400">Yükleniyor…</p>;
  }

  if (!isAdmin) {
    return (
      <div className="mt-6 text-sm text-red-500">
        {errorMsg || "Bu sayfaya erişim izniniz yok."}
      </div>
    );
  }

  return (
    <div className="py-6 space-y-4">
      <h1 className="text-xl font-semibold">İletişim Mesajları (Admin)</h1>

      {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

      {messages.length === 0 ? (
        <p className="text-sm text-slate-500">
          Henüz hiçbir iletişim mesajı gelmemiş.
        </p>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm 
                         dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {m.name || "İsimsiz kullanıcı"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {m.email || "E-posta belirtilmemiş"}
                  </p>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {new Date(m.created_at).toLocaleString("tr-TR")}
                </p>
              </div>

              {m.subject && (
                <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Konu: {m.subject}
                </p>
              )}

              <p className="mt-2 whitespace-pre-line text-sm text-slate-800 dark:text-slate-100">
                {m.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
