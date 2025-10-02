// src/lib/usePlacePhotos.ts
"use client";

import { useEffect, useState } from "react";
import { googleLoader } from "@/lib/googleLoader";

type ShopLike = {
  name: string;
  address?: string;
  lat: number;
  lng: number;
  placeId?: string | null;
};

export type PlacePhotoItem = {
  url: string;
  attributionsHtml: string[];
};

const cache = new Map<string, PlacePhotoItem[]>();

export function usePlacePhotos(
  shop: ShopLike,
  opts: { maxWidth?: number; maxHeight?: number; maxCount?: number } = {}
) {
  const { maxWidth = 1280, maxHeight = 960, maxCount = 6 } = opts;
  const [photos, setPhotos] = useState<PlacePhotoItem[] | null>(null);
  const [resolvedPlaceId, setResolvedPlaceId] = useState<string | null>(
    shop.placeId ?? null
  );

  // Place ID が無ければ Find Place で推定
  useEffect(() => {
    let cancelled = false;

    (async () => {
      await googleLoader.load();
      if (cancelled) return;

      if (resolvedPlaceId) return; // すでにIDがある場合はスキップ

      const svc = new google.maps.places.PlacesService(
        document.createElement("div")
      );

      const query =
        shop.address && shop.address.trim().length > 0
          ? `${shop.name} ${shop.address}`
          : shop.name;

      svc.findPlaceFromQuery(
        {
          query,
          fields: ["place_id"],
          locationBias: new google.maps.LatLng(shop.lat, shop.lng),
        },
        (res, status) => {
          if (cancelled) return;
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            res &&
            res[0]?.place_id
          ) {
            setResolvedPlaceId(res[0].place_id);
          } else {
            setResolvedPlaceId(null);
          }
        }
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [shop.name, shop.address, shop.lat, shop.lng, resolvedPlaceId]);

  // 写真を取得（自前API経由 / Places API (New) v1 を使用）
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!resolvedPlaceId) {
        setPhotos([]);
        return;
      }

      const cacheKey = `${resolvedPlaceId}:${maxWidth}x${maxHeight}:${maxCount}`;
      if (cache.has(cacheKey)) {
        setPhotos(cache.get(cacheKey)!);
        return;
      }

      try {
        const maxWidthPx = Math.max(maxWidth, maxHeight); // 短辺基準でもOK。好みで。
        const res = await fetch(
          `/api/places/photos?placeId=${encodeURIComponent(resolvedPlaceId)}&max=${maxCount}&maxWidthPx=${maxWidthPx}`,
          { cache: "no-store" }
        );
        const data: { photos?: string[] } = await res.json();

        const items: PlacePhotoItem[] = (data.photos ?? []).map((url) => ({
          url,
          attributionsHtml: [], // v1 media では attribution は別管理。必要なら別で保持
        }));

        cache.set(cacheKey, items);
        if (!cancelled) setPhotos(items);
      } catch {
        if (!cancelled) setPhotos([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [resolvedPlaceId, maxWidth, maxHeight, maxCount]);


  return { photos, placeId: resolvedPlaceId };
}
