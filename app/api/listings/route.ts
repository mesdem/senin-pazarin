// app/api/listings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q") || "";
    const city = searchParams.get("city") || "";
    const category = searchParams.get("category") || ""; // 🆕 kategori filtresi
    const min = searchParams.get("min") || "";
    const max = searchParams.get("max") || "";
    const sort = (searchParams.get("sort") || "newest") as
      | "newest"
      | "price_asc"
      | "price_desc";

    // Temel sorgu: sadece aktif ilanlar
    let query = supabase
      .from("listings")
      .select(
        `
        id,
        title,
        city,
        price,
        created_at,
        ships_in_24h,
        thumbnail_url,
        category
      `
      )
      .eq("status", "active");

    // Arama: title veya description içinde geçen kelime
    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }

    // Şehir filtresi
    if (city) {
      query = query.eq("city", city);
    }

    // 🆕 Kategori filtresi
    if (category) {
      query = query.eq("category", category);
    }

    // Fiyat alt sınır
    const minNumber = Number(min);
    if (!Number.isNaN(minNumber) && minNumber > 0) {
      query = query.gte("price", minNumber);
    }

    // Fiyat üst sınır
    const maxNumber = Number(max);
    if (!Number.isNaN(maxNumber) && maxNumber > 0) {
      query = query.lte("price", maxNumber);
    }

    // Sıralama
    if (sort === "newest") {
      query = query.order("created_at", { ascending: false });
    } else if (sort === "price_asc") {
      query = query.order("price", { ascending: true });
    } else if (sort === "price_desc") {
      query = query.order("price", { ascending: false });
    }

    // Çok şişmesin diye limit
    query = query.limit(60);

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error (listings):", error);
      return NextResponse.json(
        { error: "İlanlar alınırken bir hata oluştu." },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data ?? [] }, { status: 200 });
  } catch (err: any) {
    console.error("API /api/listings error:", err);
    return NextResponse.json(
      { error: "Bilinmeyen bir hata oluştu." },
      { status: 500 }
    );
  }
}
