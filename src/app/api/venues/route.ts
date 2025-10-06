// src/app/api/venues/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type VenueRow = {
  id: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  concept: string | null;
  price_range: string | null;
  hours: string | null;
  images: string[] | null;
  area: string | null;
  place_id: string | null; // ← 必須に
};

type VenueStatsRow = {
  venue_id: string;
  rating_avg: number | null;
  rating_count: number | null;
};

type VenuePricesRow = {
  venue_id: string;
  currency: string | null;
  cover_charge: string | number | null;
  avg_spend_min: number | null;
  avg_spend_max: number | null;
  notes: string | null;
};

type ApiShop = {
  id: string;
  name: string;
  address?: string;
  lat: number;
  lng: number;
  concept?: string;
  priceRange?: string;
  hours?: string;
  images?: string[];
  area?: string;
  placeId?: string | null; // ← 追加
  ratingAvg?: number;
  ratingCount?: number;
  price?: {
    currency: string;
    coverCharge?: string | number;
    avgSpendMin?: number;
    avgSpendMax?: number;
    notes?: string;
  };
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const [venuesRes, statsRes, pricesRes] = await Promise.all([
    supabase
      .from("venues")
      .select(
        // ← place_id を追加
        "id,name,address,lat,lng,concept,price_range,hours,images,area,place_id"
      ),
    supabase.from("venue_stats").select("venue_id,rating_avg,rating_count"),
    supabase
      .from("venue_prices")
      .select("venue_id,currency,cover_charge,avg_spend_min,avg_spend_max,notes"),
  ]);

  const venues = (venuesRes.data ?? []) as VenueRow[];
  const statsList = (statsRes.data ?? []) as VenueStatsRow[];
  const pricesList = (pricesRes.data ?? []) as VenuePricesRow[];

  const statsById = new Map(statsList.map(s => [s.venue_id, s]));
  const pricesById = new Map(pricesList.map(p => [p.venue_id, p]));

  const normalized: ApiShop[] = venues.map((v) => {
    const s = statsById.get(v.id);
    const p = pricesById.get(v.id);

    const shop: ApiShop = {
      id: v.id,
      name: v.name,
      address: v.address ?? undefined,
      lat: v.lat,
      lng: v.lng,
      concept: v.concept ?? undefined,
      priceRange: v.price_range ?? undefined,
      hours: v.hours ?? undefined,
      images: v.images ?? undefined,
      area: v.area ?? undefined,
      placeId: v.place_id ?? null, // ← マッピング！
    };

    if (s) {
      if (typeof s.rating_avg === "number") shop.ratingAvg = s.rating_avg;
      if (typeof s.rating_count === "number") shop.ratingCount = s.rating_count;
    }

    if (p?.currency) {
      shop.price = {
        currency: p.currency,
        coverCharge: p.cover_charge ?? undefined,
        avgSpendMin: p.avg_spend_min ?? undefined,
        avgSpendMax: p.avg_spend_max ?? undefined,
        notes: p.notes ?? undefined,
      };
    }

    return shop;
  });

  return NextResponse.json(normalized, {
    headers: { "Cache-Control": "no-store" },
  });
}
