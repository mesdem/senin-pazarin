// app/api/orders/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status =
    (searchParams.get("status") as
      | "all"
      | "preparing"
      | "shipped"
      | "delivered"
      | "cancelled") || "all";

  const supabase = createClient();

  // 1) Giriş yapmış kullanıcıyı al
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("Supabase auth error:", userError);
  }

  if (!user) {
    // Kullanıcı yoksa 401
    return NextResponse.json(
      { error: "Giriş yapmanız gerekiyor." },
      { status: 401 }
    );
  }

  // 2) Sadece bu kullanıcının siparişleri
  let query = supabase
    .from("orders")
    .select(
      `
      id,
      order_number,
      created_at,
      status,
      total_amount,
      item_count,
      seller_display_name,
      seller_city,
      buyer_id
    `
    )
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase orders error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
