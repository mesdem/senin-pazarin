// app/api/listings/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get("q") || "";
  const city = searchParams.get("city") || "";
  const min = searchParams.get("min");
  const max = searchParams.get("max");
  const sort =
    (searchParams.get("sort") as "newest" | "price_asc" | "price_desc") ||
    "newest";

  const supabase = createClient();

  let query = supabase
    .from("listings")
    // ➜ thumbnail_url ve category_name'i kaldırdım
    .select("id,title,city,price,created_at");

  if (q) {
    query = query.ilike("title", `%${q}%`);
  }

  if (city) {
    query = query.eq("city", city);
  }

  if (min) {
    query = query.gte("price", Number(min));
  }

  if (max) {
    query = query.lte("price", Number(max));
  }

  switch (sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query.limit(60);

  if (error) {
    console.error("Supabase error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
