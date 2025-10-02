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

  // 写真を取得
  useEffect(() => {
    let cancelled = false;

    (async () => {
      await googleLoader.load();
      if (cancelled) return;

      if (!resolvedPlaceId) {
        setPhotos([]);
        return;
      }

      // キャッシュ利用
      const cacheKey = `${resolvedPlaceId}:${maxWidth}x${maxHeight}:${maxCount}`;
      if (cache.has(cacheKey)) {
        setPhotos(cache.get(cacheKey)!);
        return;
      }

      const svc = new google.maps.places.PlacesService(
        document.createElement("div")
      );
      svc.getDetails(
        {
          placeId: resolvedPlaceId,
          fields: ["photos"],
        },
        (place, status) => {
          if (cancelled) return;
          if (
            status !== google.maps.places.PlacesServiceStatus.OK ||
            !place
          ) {
            setPhotos([]);
            return;
          }

            const items =
            (place.photos ?? [])
                .slice(0, maxCount)
                .map((p) => {
                const url = p.getUrl({ maxWidth, maxHeight });

                // 型の揺れ対策：公式型は html_attributions のみ
                const atts =
                    (p as unknown as { html_attributions?: string[] }).html_attributions ?? [];

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
  }, [resolvedPlaceId, maxWidth, maxHeight, maxCount]);

  return { photos, placeId: resolvedPlaceId };
}
