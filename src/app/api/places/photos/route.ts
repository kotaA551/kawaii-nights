// src/app/api/places/photos/route.ts
import { NextResponse } from "next/server";

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get("placeId");
  const max = Number(searchParams.get("max") ?? 6);
  const maxWidthPx = Number(searchParams.get("maxWidthPx") ?? 1280);

  if (!KEY) {
    return NextResponse.json({ photos: [], error: "API key missing" }, { status: 500 });
  }
  if (!placeId) return NextResponse.json({ photos: [] });

  // Places API (New) v1 で photos の name を取る
  const detailUrl = `https://places.googleapis.com/v1/places/${encodeURIComponent(
    placeId
  )}?fields=photos&key=${KEY}`;

  const detail = await fetch(detailUrl, {
    headers: { "X-Goog-FieldMask": "photos" },
    cache: "no-store",
  }).then(r => r.json()).catch(() => null);

  const photos = Array.isArray(detail?.photos) ? detail.photos : [];

  const urls: string[] = photos.slice(0, max).map((p: { name: string }) => {
    // v1/{name}/media で実体URL(lh3.googleusercontent.com)へリダイレクト
    return `https://places.googleapis.com/v1/${encodeURIComponent(p.name)}/media?maxWidthPx=${maxWidthPx}&key=${KEY}`;
  });

  return NextResponse.json({ photos: urls });
}
