// app/listings/new/page.tsx
"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { CATEGORY_GROUPS } from "@/lib/categories";

type ConditionOption = "Yeni" | "İyi" | "Orta" | "Kötü";

export default function NewListingPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");

  const [mainCategory, setMainCategory] = useState(
    CATEGORY_GROUPS[0]?.label ?? "Elektronik"
  );
  const [category, setCategory] = useState(
    CATEGORY_GROUPS[0]?.items[0]?.label ?? "Telefon & Tablet"
  );

  const [condition, setCondition] = useState<ConditionOption>("İyi");

  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      if (!u) {
        router.push("/auth/login");
        return;
      }
      setUserId(u.id);
    };
    check();
  }, [router]);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const fileArray = Array.from(files);

    setImages((prev) => [...prev, ...fileArray].slice(0, 6)); // max 6 foto
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!userId) return;

    setMsg("");
    if (!title.trim() || !description.trim() || !price.trim() || !city.trim()) {
      setMsg("Lütfen tüm zorunlu alanları doldur.");
      return;
    }

    const priceNumber = Number(price.replace(",", "."));
    if (Number.isNaN(priceNumber) || priceNumber <= 0) {
      setMsg("Lütfen geçerli bir fiyat gir.");
      return;
    }

    setSubmitting(true);

    try {
      const { data: listingInsert, error: insertError } = await supabase
        .from("listings")
        .insert({
          user_id: userId,
          title: title.trim(),
          description: description.trim(),
          price: priceNumber,
          city: city.trim(),
          category,
          condition,
          status: "active",
        })
        .select("id")
        .single();

      if (insertError || !listingInsert) {
        console.error(insertError);
        setMsg("İlan eklenirken bir hata oluştu.");
        setSubmitting(false);
        return;
      }

      const listingId = listingInsert.id as string;

      if (images.length > 0) {
        for (const file of images) {
          const ext = file.name.split(".").pop();
          const path = `${userId}/${listingId}/${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from("listing-images")
            .upload(path, file);

          if (uploadError) {
            console.error(uploadError);
            continue;
          }

          const { data: publicData } = supabase.storage
            .from("listing-images")
            .getPublicUrl(path);

          const publicUrl = publicData?.publicUrl;
          if (!publicUrl) continue;

          await supabase.from("listing_images").insert({
            listing_id: listingId,
            image_url: publicUrl,
          });
        }
      }

      setMsg("İlan başarıyla oluşturuldu.");
      router.push(`/listings/${listingId}`);
    } catch (err) {
      console.error(err);
      setMsg("Beklenmeyen bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!userId) {
    return (
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        İlan vermek için giriş yapmalısın…
      </p>
    );
  }

  const currentGroup =
    CATEGORY_GROUPS.find((g) => g.label === mainCategory) || CATEGORY_GROUPS[0];

  return (
    <div className="max-w-3xl py-4">
      <h1 className="mb-2 text-xl font-semibold">Yeni İlan Ver</h1>
      <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
        Ürününle ilgili detayları doldur, fotoğraflarını ekle ve alıcılarla
        buluş.
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        {/* Başlık */}
        <div className="space-y-1">
          <label className="text-xs text-slate-500 dark:text-slate-400">
            İlan başlığı
          </label>
          <input
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            placeholder="Örn: iPhone 12 128GB, temiz kullanılmış"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Açıklama */}
        <div className="space-y-1">
          <label className="text-xs text-slate-500 dark:text-slate-400">
            Açıklama
          </label>
          <textarea
            className="min-h-[120px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            placeholder="Ürünün durumu, kutusu, fatura durumu, varsa kusurlar..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Kategori seçimi */}
        <div className="space-y-2">
          <label className="text-xs text-slate-500 dark:text-slate-400">
            Kategori
          </label>

          {/* Ana kategori */}
          <select
            className="mb-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            value={mainCategory}
            onChange={(e) => {
              const newMain = e.target.value;
              setMainCategory(newMain);
              const group = CATEGORY_GROUPS.find((g) => g.label === newMain);
              if (group && group.items[0]) {
                setCategory(group.items[0].label);
              }
            }}
          >
            {CATEGORY_GROUPS.map((group) => (
              <option key={group.key} value={group.label}>
                {group.label}
              </option>
            ))}
          </select>

          {/* Alt kategori */}
          <select
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {currentGroup.items.map((item) => (
              <option key={item.key} value={item.label}>
                {item.label}
              </option>
            ))}
          </select>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Doğru kategori seçimi, alıcıların ilanını daha kolay bulmasını
            sağlar.
          </p>
        </div>

        {/* Fiyat + Şehir + Durum */}
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs text-slate-500 dark:text-slate-400">
              Fiyat (₺)
            </label>
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              placeholder="Örn: 4500"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              type="number"
              min={0}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 dark:text-slate-400">
              Şehir
            </label>
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              placeholder="Örn: İstanbul, Burdur..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 dark:text-slate-400">
              Ürün durumu
            </label>
            <select
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              value={condition}
              onChange={(e) => setCondition(e.target.value as ConditionOption)}
            >
              <option value="Yeni">Yeni</option>
              <option value="İyi">İyi</option>
              <option value="Orta">Orta</option>
              <option value="Kötü">Kötü</option>
            </select>
          </div>
        </div>

        {/* Görseller */}
        <div className="space-y-2">
          <label className="text-xs text-slate-500 dark:text-slate-400">
            Ürün fotoğrafları
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="text-xs text-slate-700 dark:text-slate-200"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            En fazla 6 adet fotoğraf ekleyebilirsin. İlk fotoğraf ilan kapağında
            gösterilir.
          </p>

          {images.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {images.map((file, idx) => (
                <div
                  key={idx}
                  className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-slate-300 bg-slate-100 text-[10px] text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <span className="line-clamp-2 px-1 text-center">
                    {file.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mesaj */}
        {msg && (
          <p className="text-xs text-slate-700 dark:text-slate-200">{msg}</p>
        )}

        {/* Gönder butonu */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-cyan-400 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60 dark:text-slate-950"
          >
            {submitting ? "İlan ekleniyor…" : "İlanı Yayınla"}
          </button>
        </div>
      </form>
    </div>
  );
}
