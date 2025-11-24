"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Listing } from "@/lib/types";
import { useParams, useRouter } from "next/navigation";

const CATEGORIES = [
  "Elektronik",
  "Telefon",
  "Bilgisayar",
  "Ev & Yaşam",
  "Mobilya",
  "Giyim & Aksesuar",
  "Spor & Outdoor",
  "Oyun & Konsol",
  "Kitap",
  "Diğer",
];

const CITIES = [
  "İstanbul",
  "Ankara",
  "İzmir",
  "Bursa",
  "Antalya",
  "Adana",
  "Konya",
  "Gaziantep",
  "Kayseri",
  "Eskişehir",
  "Denizli",
  "Burdur",
];

const CONDITIONS = ["Yeni", "Çok İyi", "İyi", "Orta", "Yıpranmış"];

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // Form alanları
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [condition, setCondition] = useState("İyi");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setMsg("");

      // Kullanıcıyı al
      const { data: userData } = await supabase.auth.getUser();
      const u = userData.user;

      if (!u) {
        setMsg("İlan düzenlemek için önce giriş yapmalısınız.");
        setLoading(false);
        router.push("/auth/login");
        return;
      }

      setUserId(u.id);

      // İlanı çek (sadece bu kullanıcıya aitse)
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .eq("user_id", u.id)
        .single();

      if (error || !data) {
        setMsg("İlan bulunamadı veya bu ilan sana ait değil.");
        setLoading(false);
        return;
      }

      const item = data as Listing;
      setTitle(item.title);
      setPrice(item.price);
      setCategory(item.category);
      setCity(item.city);
      setCondition(item.condition);
      setDescription(item.description);

      setLoading(false);
    };

    if (id) {
      load();
    }
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;

    if (!title || !price || !category || !city || !description) {
      setMsg("Lütfen tüm zorunlu alanları doldurun.");
      return;
    }

    setSaving(true);
    setMsg("");

    const { error } = await supabase
      .from("listings")
      .update({
        title,
        price: Number(price),
        category,
        city,
        condition,
        description,
      })
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      setMsg("Güncelleme sırasında bir hata oluştu: " + error.message);
    } else {
      setMsg("İlan güncellendi.");
      router.push(`/listings/${id}`);
    }

    setSaving(false);
  }

  if (loading) {
    return <p className="mt-4 text-sm text-slate-400">Yükleniyor…</p>;
  }

  if (!userId) {
    return (
      <p className="mt-4 text-sm text-slate-300">
        İlan düzenlemek için giriş yapmalısınız.
      </p>
    );
  }

  if (msg && (msg.includes("ait değil") || msg.includes("bulunamadı"))) {
    return <p className="mt-4 text-sm text-slate-300">{msg}</p>;
  }

  return (
    <div className="mx-auto max-w-lg py-4">
      <h1 className="mb-4 text-xl font-semibold">İlanı Düzenle</h1>

      <form onSubmit={handleSubmit} className="space-y-3 text-sm">
        <div>
          <label className="mb-1 block text-xs text-slate-300">Başlık *</label>
          <input
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-slate-300">
              Fiyat (₺) *
            </label>
            <input
              type="number"
              min={0}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
              value={price}
              onChange={(e) =>
                setPrice(e.target.value === "" ? "" : Number(e.target.value))
              }
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-300">Durum *</label>
            <select
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              {CONDITIONS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-slate-300">
              Kategori *
            </label>
            <select
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Seçiniz</option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-300">Şehir *</label>
            <select
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            >
              <option value="">Seçiniz</option>
              {CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-slate-300">
            Açıklama *
          </label>
          <textarea
            className="h-32 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-2 w-full rounded-xl bg-cyan-400 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60"
        >
          {saving ? "Kaydediliyor…" : "Değişiklikleri Kaydet"}
        </button>

        {msg && <p className="mt-1 text-xs text-slate-300">{msg}</p>}
      </form>
    </div>
  );
}
