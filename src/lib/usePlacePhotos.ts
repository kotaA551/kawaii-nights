// src/lib/usePlacePhotos.ts
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

type ShopLike = {
  name: string;
  address?: string;
  lat: number;
  lng: number;
  placeId?: string | null;
};

export type PlacePhotoItem = {
  url: string;
  attributionsHtml: string[]; // 必ず小さく表示する（規約）
};

const cache = new Map<string, PlacePhotoItem[]>();

export function usePlacePhotos(
  shop: ShopLike,
  opts: { maxWidth?: number; maxHeight?: number; maxCount?: number } = {}
) {
  const { maxWidth = 1280, maxHeight = 960, maxCount = 6 } = opts;
  const [photos, setPhotos] = useState<PlacePhotoItem[] | null>(null);
  const [resolvedPlaceId, setResolvedPlaceId] = useState<string | null>(shop.placeId ?? null);

  // Loader を使い回す
  const loader = useMemo(
    () =>
      new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        version: "weekly",
        libraries: ["places"],
      }),
    []
  );

  // Place ID が無ければ Find Place で推定
  useEffect(() => {
    let cancelled = false;

    (async () => {
      await loader.load();
      if (cancelled) return;

      // すでにIDがあればスキップ
      if (resolvedPlaceId) return;

      const svc = new google.maps.places.PlacesService(document.createElement("div"));

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
          if (status === google.maps.places.PlacesServiceStatus.OK && res && res[0]?.place_id) {
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
  }, [loader, shop.name, shop.address, shop.lat, shop.lng, resolvedPlaceId]);

  // 写真を取得
  useEffect(() => {
    let cancelled = false;

    (async () => {
      await loader.load();
      if (cancelled) return;

      if (!resolvedPlaceId) {
        setPhotos([]);
        return;
      }

      // キャッシュ
      const cacheKey = `${resolvedPlaceId}:${maxWidth}x${maxHeight}:${maxCount}`;
      if (cache.has(cacheKey)) {
        setPhotos(cache.get(cacheKey)!);
        return;
      }

      const svc = new google.maps.places.PlacesService(document.createElement("div"));
      svc.getDetails(
        {
          placeId: resolvedPlaceId,
          fields: ["photos"], // 必要最小限
        },
        (place, status) => {
          if (cancelled) return;
          if (status !== google.maps.places.PlacesServiceStatus.OK || !place) {
            setPhotos([]);
            return;
          }

          const items =
            (place.photos ?? [])
              .slice(0, maxCount)
              .map((p) => {
                const url = p.getUrl({ maxWidth, maxHeight });
                // html_attributions は string[]（<a>タグ文字列など）
                // @ts-expect-error types may vary slightly across versions
                const atts: string[] = p.html_attributions ?? p.author_attributions ?? [];
                return { url, attributionsHtml: atts };
              }) ?? [];

          cache.set(cacheKey, items);
          setPhotos(items);
        }
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [loader, resolvedPlaceId, maxWidth, maxHeight, maxCount]);

  return { photos, placeId: resolvedPlaceId };
}
