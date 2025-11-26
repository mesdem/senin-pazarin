// app/api/orders/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  // 1) Kullanıcıyı al
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("Supabase auth error:", userError);
  }

  if (!user) {
    return NextResponse.json(
      { error: "Giriş yapmanız gerekiyor." },
      { status: 401 }
    );
  }

  const orderId = params.id;

  // 2) Siparişi ve kalemlerini çek
  const { data, error } = await supabase
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
      buyer_id,
      shipping_address,
      note,
      order_items (
        id,
        listing_id,
        title_snapshot,
        price_snapshot,
        quantity
      )
    `
    )
    .eq("id", orderId)
    .eq("buyer_id", user.id) // 🔒 sadece bu kullanıcının siparişi
    .single();

  if (error) {
    console.error("Order detail error:", error);
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ data });
}
