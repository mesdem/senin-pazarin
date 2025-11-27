"use client";

import { FormEvent, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function NewListingForm() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1) Önce ilan kaydını oluştur
      const { data: listing, error: insertError } = await supabaseBrowser
        .from("listings")
        .insert({
          title,
          price: Number(price),
        })
        .select("id")
        .single();

      if (insertError || !listing) {
        throw insertError || new Error("İlan oluşturulamadı.");
      }

      const listingId = listing.id as string;

      // 2) Dosyaları gerçekten geliyor mu kontrol et
      console.log("Seçilen dosyalar:", files);

      if (!files.length) {
        console.warn("Hiç dosya seçilmemiş.");
      }

      // 3) Her dosyayı Storage'a yükle
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const ext = file.name.split(".").pop();
        const filePath = `${listingId}/${crypto.randomUUID()}.${ext}`;

        const { data, error: uploadError } = await supabaseBrowser.storage
          .from("listing-images") // bucket adı
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload hata:", uploadError);
          throw uploadError;
        }

        // 4) Public URL al
        const {
          data: { publicUrl },
        } = supabaseBrowser.storage
          .from("listing-images")
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      // 5) İstersen listing_images tablosuna kaydet
      if (uploadedUrls.length) {
        const { error: relError } = await supabaseBrowser
          .from("listing_images")
          .insert(
            uploadedUrls.map((url) => ({
              listing_id: listingId,
              image_url: url,
            }))
          );

        if (relError) {
          console.error("listing_images insert error:", relError);
        }
      }

      alert("İlan ve görseller yüklendi!");
      setTitle("");
      setPrice("");
      setFiles([]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Bilinmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-xs text-red-500">{error}</p>}

      <div>
        <label className="text-xs block mb-1">Başlık</label>
        <input
          className="border rounded px-2 py-1 text-sm w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="text-xs block mb-1">Fiyat</label>
        <input
          className="border rounded px-2 py-1 text-sm w-full"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="text-xs block mb-1">Görseller</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-3 py-2 text-sm rounded bg-emerald-600 text-white"
      >
        {loading ? "Yükleniyor..." : "İlan ver"}
      </button>
    </form>
  );
}
