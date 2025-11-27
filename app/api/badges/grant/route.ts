// app/api/badges/grant/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// Basit bir POST endpoint'i:
// Body: { userId: string, badgeKey: string }
//
// Örnek istek:
// fetch("/api/badges/grant", {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({ userId: "xxx", badgeKey: "fast_shipper" })
// })

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, badgeKey } = body as {
      userId?: string;
      badgeKey?: string;
    };

    if (!userId || !badgeKey) {
      return NextResponse.json(
        { error: "userId ve badgeKey zorunludur." },
        { status: 400 }
      );
    }

    // 1) Rozeti bul (seller_badges.key alanından)
    const { data: badge, error: badgeError } = await supabase
      .from("seller_badges")
      .select("id")
      .eq("key", badgeKey)
      .maybeSingle();

    if (badgeError || !badge) {
      return NextResponse.json({ error: "Rozet bulunamadı." }, { status: 404 });
    }

    // 2) Aynı rozet zaten verilmiş mi kontrol edelim (isteğe bağlı)
    const { data: existing } = await supabase
      .from("user_badges")
      .select("id")
      .eq("user_id", userId)
      .eq("badge_id", badge.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { ok: true, message: "Bu kullanıcıda rozet zaten var." },
        { status: 200 }
      );
    }

    // 3) user_badges tablosuna ekle
    const { error: insertError } = await supabase.from("user_badges").insert({
      user_id: userId,
      badge_id: badge.id,
    });

    if (insertError) {
      console.error(insertError);
      return NextResponse.json(
        { error: "Rozet eklenirken hata oluştu." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Beklenmeyen bir hata oluştu." },
      { status: 500 }
    );
  }
}
