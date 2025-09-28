import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  const { data, error } = await supabaseServer
    .from("venues")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // フロントの既存ShopCardに寄せたキー名（priceRangeなど）へ変換
  const mapped = (data ?? []).map((v) => ({
    id: v.id,
    name: v.name,
    category: v.category,
    concept: v.concept ?? null,
    priceRange: v.price_range ?? null,
    address: v.address ?? null,
    lat: v.lat ?? null,
    lng: v.lng ?? null,
    area: v.area ?? null,
    hours: v.hours ?? null,
    alcohol: v.alcohol ?? null,
    smoking: v.smoking ?? null,
    images: v.cover_image ? [v.cover_image] : [],

    // 余裕があれば
    website: v.website ?? null,
    instagram: v.instagram ?? null,
    x_url: v.x_url ?? null,
    name_en: v.name_en ?? null,
  }));

  return NextResponse.json(mapped);
}
