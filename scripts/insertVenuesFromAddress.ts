// scripts/insertVenuesFromAddress.ts
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

// 環境変数
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

// Supabase 初期化
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// 追加したい店舗情報
const venues = [
  {
    name: "RE: FIRST",
    address: "1-16-1 Ohashi Bldg. 802, Kanda Sakuma-cho, Chiyoda-ku, Tokyo 101-0025",
    concept: "Devilish-style Maid Cafe",
    price_range: "¥",
    hours: "16:00–1:00",
    images: [
      "https://owpleslljdfaartwouvi.supabase.co/storage/v1/object/public/venue-images/akiba/refirst/1.jpg",
    ],
  },
  {
    name: "Hoshi no Ohimesama",
    address: "3-14-5 Kuzawa Bldg. 2F, Sotokanda, Chiyoda-ku, Tokyo 101-0021",
    concept: "Idol Café & Bar",
    price_range: "¥¥",
    hours: "17:00–23:00",
    images: [
      "https://owpleslljdfaartwouvi.supabase.co/storage/v1/object/public/venue-images/akiba/ohimesama/1.jpg",
    ],
  },
];

async function geocodeAddress(address: string) {
  const url = "https://maps.googleapis.com/maps/api/geocode/json";
  const res = await axios.get(url, {
    params: { address, key: GOOGLE_MAPS_API_KEY },
  });
  const result = res.data.results[0];
  if (!result) return null;
  const { lat, lng } = result.geometry.location;
  return { lat, lng };
}

async function main() {
  for (const v of venues) {
    const geo = await geocodeAddress(v.address);
    if (!geo) {
      console.error(`❌ 住所解決できませんでした: ${v.name}`);
      continue;
    }

    const { lat, lng } = geo;
    console.log(`✅ ${v.name}: (${lat}, ${lng})`);

    const { error } = await supabase.from("venues").insert({
      name: v.name,
      address: v.address,
      lat,
      lng,
      concept: v.concept,
      price_range: v.price_range,
      hours: v.hours,
      images: v.images,
    });

    if (error) {
      console.error(`❌ Supabase への登録エラー: ${v.name}`, error.message);
    } else {
      console.log(`✅ Supabase に登録完了: ${v.name}`);
    }
  }
}

main().catch(console.error);
