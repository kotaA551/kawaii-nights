// src/app/api/venues/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * --- DB Row 型（any を使わない） ---
 * 必要なカラムだけを型に定義しておく。
 */
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
  place_id?: string | null;
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

/**
 * クライアントに返す整形済みの型
 * （ページ側の `Shop` と互換になる最低限）
 */
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnon);

export async function GET() {
  // venues / stats / prices をまとめて取得
  const [venuesRes, statsRes, pricesRes] = await Promise.all([
    supabase
      .from("venues")
      .select(
        "id,name,address,lat,lng,concept,price_range,hours,images,area"
      ),
    supabase.from("venue_stats").select("venue_id,rating_avg,rating_count"),
    supabase
      .from("venue_prices")
      .select(
        "venue_id,currency,cover_charge,avg_spend_min,avg_spend_max,notes"
      ),
  ]);

  // Supabase の data は unknown とみなして安全に型付け
  const venues: VenueRow[] = (venuesRes.data ?? []) as VenueRow[];
  const statsList: VenueStatsRow[] = (statsRes.data ?? []) as VenueStatsRow[];
  const pricesList: VenuePricesRow[] = (pricesRes.data ?? []) as VenuePricesRow[];

  // 参照しやすいように Map 化
  const statsById = new Map<string, VenueStatsRow>();
  for (const s of statsList) statsById.set(s.venue_id, s);

  const pricesById = new Map<string, VenuePricesRow>();
  for (const p of pricesList) pricesById.set(p.venue_id, p);

  // 正規化
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
    };

    if (s) {
      if (typeof s.rating_avg === "number") shop.ratingAvg = s.rating_avg;
      if (typeof s.rating_count === "number") shop.ratingCount = s.rating_count;
    }

    if (p && p.currency) {
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
    headers: {
      // キャッシュしたくない場合
      "Cache-Control": "no-store",
    },
  });
}
