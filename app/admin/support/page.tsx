// app/admin/support/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type SupportRequest = {
  id: string;
  user_id: string | null;
  email: string | null;
  category: string | null;
  message: string | null;
  status: string | null;
  created_at: string;
};

export default function AdminSupportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

      if (profileError || !profileData?.is_admin) {
        setErrorMsg("Bu sayfayı görüntüleme yetkiniz yok.");
        setLoading(false);
        setCheckingAdmin(false);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(true);
      setCheckingAdmin(false);

      // 3) Destek taleplerini çek
      const { data, error } = await supabase
        .from("support_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setErrorMsg("Destek talepleri yüklenirken bir hata oluştu.");
        setRequests([]);
      } else {
        setRequests((data as SupportRequest[]) || []);
      }

      setLoading(false);
    };

    load();
  }, [router]);

  async function handleStatusChange(id: string, newStatus: string) {
    setUpdatingId(id);
    setErrorMsg(null);

    const { error } = await supabase
      .from("support_requests")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error(error);
      setErrorMsg("Durum güncellenirken bir hata oluştu.");
    } else {
      // Local state'i güncelle
      setRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
      );
    }

    setUpdatingId(null);
  }

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
      <h1 className="text-xl font-semibold">Destek Talepleri (Admin)</h1>

      {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

      {requests.length === 0 ? (
        <p className="text-sm text-slate-500">
          Henüz hiç destek talebi oluşturulmamış.
        </p>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm 
                         dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-50">
                    {req.email || "E-posta yok"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Kategori: {req.category || "-"}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 font-medium ${
                      req.status === "resolved"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : req.status === "in_progress"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {req.status === "resolved"
                      ? "Çözüldü"
                      : req.status === "in_progress"
                      ? "İnceleniyor"
                      : "Açık"}
                  </span>

                  <select
                    value={req.status || "open"}
                    onChange={(e) => handleStatusChange(req.id, e.target.value)}
                    disabled={updatingId === req.id}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px]
                               dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="open">Açık</option>
                    <option value="in_progress">İnceleniyor</option>
                    <option value="resolved">Çözüldü</option>
                  </select>
                </div>
              </div>

              <p className="mt-3 whitespace-pre-line text-slate-800 dark:text-slate-100">
                {req.message}
              </p>

              <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                {new Date(req.created_at).toLocaleString("tr-TR")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
