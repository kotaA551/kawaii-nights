// src/app/api/venues/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  // venues + stats + prices をまとめて取得
  const [venuesRes, statsRes, pricesRes] = await Promise.all([
    supabase.from("venues").select("id,name,address,lat,lng,concept,price_range,hours,images").limit(800),
    supabase.from("venue_stats").select("*"),
    supabase.from("venue_prices").select("*"),
  ]);

  const venues = venuesRes.data ?? [];
  const stats  = Object.fromEntries((statsRes.data ?? []).map(s => [s.venue_id, s]));
  const prices = Object.fromEntries((pricesRes.data ?? []).map(p => [p.venue_id, p]));

  const normalized = venues.map((r) => ({
    id: r.id,
    name: r.name,
    address: r.address,
    lat: r.lat,
    lng: r.lng,
    concept: r.concept ?? null,
    priceRange: r.price_range ?? null,
    hours: r.hours ?? null,
    images: r.images ?? null,
    ratingAvg: stats[r.id]?.rating_avg ?? null,
    ratingCount: stats[r.id]?.rating_count ?? 0,
    price: prices[r.id]
      ? {
          currency: prices[r.id].currency,
          coverCharge: prices[r.id].cover_charge,
          avgSpendMin: prices[r.id].avg_spend_min,
          avgSpendMax: prices[r.id].avg_spend_max,
          notes: prices[r.id].notes,
        }
      : null,
  }));

  return NextResponse.json(normalized, { status: 200 });
}
