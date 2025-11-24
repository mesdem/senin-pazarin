"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

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

export default function NewListingPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [condition, setCondition] = useState("İyi");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  // Yeni: seçilen dosyayı tutacağız
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
    };
    loadUser();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (!userId) {
      setMsg("İlan vermek için önce giriş yapmalısınız.");
      return;
    }

    if (!title || !price || !category || !city || !description) {
      setMsg("Lütfen tüm zorunlu alanları doldurun.");
      return;
    }

    setLoading(true);

    // 1) Önce ilan kaydını oluştur
    const { data, error } = await supabase
      .from("listings")
      .insert({
        title,
        price: Number(price),
        category,
        city,
        condition,
        description,
        status: "active",
        user_id: userId,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error(error);
      setMsg("İlan eklenirken bir hata oluştu: " + (error?.message ?? ""));
      setLoading(false);
      return;
    }

    const listingId = data.id as string;

    // 2) Eğer görsel seçildiyse storage’a yükle + listing_images tablosuna kaydet
    if (imageFile) {
      try {
        const fileExt = imageFile.name.split(".").pop();
        const filePath = `${userId}/${listingId}-${Date.now()}.${fileExt}`;

        // Storage’a upload
        const { error: uploadError } = await supabase.storage
          .from("listing-images")
          .upload(filePath, imageFile);

        if (uploadError) {
          console.error("upload error:", uploadError.message);
          // Görsel hata verse bile ilanı silmiyoruz, sadece mesaj yazıyoruz
          setMsg(
            "İlan kaydedildi ancak görsel yüklenirken hata oluştu: " +
              uploadError.message
          );
        } else {
          // Public URL üret
          const { data: publicData } = supabase.storage
            .from("listing-images")
            .getPublicUrl(filePath);

          const publicUrl = publicData?.publicUrl;

          if (publicUrl) {
            const { error: imgError } = await supabase
              .from("listing_images")
              .insert({
                listing_id: listingId,
                image_url: publicUrl,
                sort_order: 0,
              });

            if (imgError) {
              console.error("listing_images insert error:", imgError.message);
            }
          }
        }
      } catch (err) {
        console.error("image upload exception:", err);
      }
    }

    setMsg("İlan başarıyla eklendi.");
    setLoading(false);
    router.push(`/listings/${listingId}`);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
  }

  return (
    <div className="mx-auto max-w-lg py-4">
      <h1 className="mb-4 text-xl font-semibold">Yeni İlan Ver</h1>

      <form onSubmit={handleSubmit} className="space-y-3 text-sm">
        <div>
          <label className="mb-1 block text-xs text-slate-300">Başlık *</label>
          <input
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
            placeholder="Örn: iPhone 12 128GB"
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
              placeholder="Örn: 18500"
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
            placeholder="Ürün durumu, fatura, kutu, aksesuar, takas olur mu vs."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Yeni: Görsel yükleme alanı */}
        <div>
          <label className="mb-1 block text-xs text-slate-300">
            Ürün Fotoğrafı (opsiyonel)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-xs text-slate-300"
          />
          {imageFile && (
            <p className="mt-1 text-[11px] text-slate-400">
              Seçilen dosya: {imageFile.name}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-xl bg-cyan-400 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60"
        >
          {loading ? "Kaydediliyor…" : "İlanı Yayınla"}
        </button>

        {msg && <p className="mt-1 text-xs text-slate-300">{msg}</p>}
      </form>
    </div>
  );
}
