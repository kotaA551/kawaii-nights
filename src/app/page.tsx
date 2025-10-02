// src/app/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { Shop } from "@/lib/types";
import Carousel from "@/components/Carousel";
import ShopCard from "@/components/ShopCard";
import ShopModal from "@/components/ShopModal";
import GoogleMap from "@/components/GoogleMap";

type ApiShop = Omit<
  Shop,
  "priceRange" | "hours" | "images" | "alcohol" | "smoking"
> & {
  priceRange?: string | null;
  hours?: string | null;
  images?: string[] | null;
  alcohol?: Shop["alcohol"] | null;
  smoking?: Shop["smoking"] | null;
  placeId?: string | null;
};

const normalizeShop = (x: ApiShop): Shop => ({
  ...x,
  priceRange: x.priceRange ?? undefined,
  hours: x.hours ?? undefined,
  images: x.images ?? undefined,
  alcohol: x.alcohol ?? undefined,
  smoking: x.smoking ?? undefined,
  placeId: x.placeId ?? undefined,
});

export default function HomeMobileFirst() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null);

  // モーダルで開く店ID
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // スライドの現在インデックス
  const [activeIndex, setActiveIndex] = useState(0);

  // 位置情報
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setGeo({ lat: 35.681236, lng: 139.767125 }), // 東京駅
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // 店舗取得
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/venues", { cache: "no-store" });
      const json = (await res.json()) as ApiShop[];
      setShops(json.map(normalizeShop));
    })();
  }, []);

  // 距離順
  const withDistance = useMemo(() => {
    if (!geo) return shops.map((s) => ({ s, d: Number.MAX_SAFE_INTEGER }));
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371e3;
    return shops.map((s) => {
      const φ1 = toRad(geo.lat);
      const φ2 = toRad(s.lat);
      const Δφ = toRad(s.lat - geo.lat);
      const Δλ = toRad(s.lng - geo.lng);
      const a =
        Math.sin(Δφ / 2) ** 2 +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
      const d = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return { s, d };
    });
  }, [shops, geo]);

  const nearby = useMemo(
    () => withDistance.sort((a, b) => a.d - b.d).map((x) => x.s),
    [withDistance]
  );

  // 地図フォーカス用ID
  const activeId = nearby[activeIndex]?.id ?? null;

  // モーダルに表示する店
  const selectedShop = useMemo(
    () => nearby.find((x) => x.id === selectedId) || null,
    [nearby, selectedId]
  );

  return (
    <>
      {/* Nearby Shops */}
      <section className="mt-3">
        <div className="flex items-baseline justify-between px-2">
          <h2 className="text-lg font-bold">Nearby Shops</h2>
          {geo && (
            <p className="text-xs text-zinc-500">
              Location: {geo.lat.toFixed(3)}, {geo.lng.toFixed(3)}
            </p>
          )}
        </div>

        <div className="mt-2">
          <Carousel
            autoplay={3000}
            slideClassName="w-full"
            className="rounded-2xl overflow-hidden"
            onIndexChange={(i) => {
              setActiveIndex(i);
            }}
          >
            {nearby.slice(0, 12).map((s) => (
              <div key={s.id} className="h-full">
                {/* カードクリック時だけモーダルを開く */}
                <ShopCard shop={s} onClick={() => setSelectedId(s.id)} />
              </div>
            ))}
          </Carousel>
        </div>
      </section>

      {/* Map (Google Maps) */}
      <section className="my-4">
        <div className="flex items-baseline justify-between px-2">
          <h2 className="text-lg font-bold">Search by GooGle Map</h2>
        </div>
        <div className="k-card p-1 mt-2">
          <GoogleMap
            shops={nearby}
            activeId={activeId}
            userLocation={geo}
            onSelect={(id) => {
              // ピンをタップした時だけモーダル開く
              setSelectedId(id);
              const idx = nearby.findIndex((s) => s.id === id);
              if (idx >= 0) setActiveIndex(idx);
            }}
            height={420}
          />
        </div>
      </section>

      {/* Bottom Sheet Modal */}
      {selectedShop && (
        <ShopModal shop={selectedShop} onClose={() => setSelectedId(null)} />
      )}
    </>
  );
}
