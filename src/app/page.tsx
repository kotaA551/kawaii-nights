// src/app/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { Shop } from "@/lib/types";
import Carousel from "@/components/Carousel";
import ShopCard from "@/components/ShopCard";
import ShopModal from "@/components/ShopModal";
import { MapView } from "@/components/Map";

type ApiShop = Omit<
  Shop,
  "concept" | "priceRange" | "hours" | "images" | "alcohol" | "smoking"
> & {
  concept?: string | null;
  priceRange?: string | null;
  hours?: string | null;
  images?: string[] | null;
  alcohol?: Shop["alcohol"] | null;
  smoking?: Shop["smoking"] | null;
};

const normalizeShop = (x: ApiShop): Shop => ({
  ...x,
  concept: x.concept ?? undefined,
  priceRange: x.priceRange ?? undefined,
  hours: x.hours ?? undefined,
  images: x.images ?? undefined,
  alcohol: x.alcohol ?? undefined,
  smoking: x.smoking ?? undefined,
});

export default function HomeMobileFirst() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 位置情報の取得（許可ダイアログ）
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        // 許可されない場合は東京駅を仮地点
        setGeo({ lat: 35.681236, lng: 139.767125 });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // 店舗の取得
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/venues", { cache: "no-store" });
      const json = (await res.json()) as ApiShop[];
      setShops(json.map(normalizeShop));
    })();
  }, []);

  // 距離計算（Haversine）
  const withDistance = useMemo(() => {
    if (!geo) return shops.map((s) => ({ s, d: Number.MAX_SAFE_INTEGER }));
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371e3; // m
    return shops.map((s) => {
      const φ1 = toRad(geo.lat);
      const φ2 = toRad(s.lat);
      const Δφ = toRad(s.lat - geo.lat);
      const Δλ = toRad(s.lng - geo.lng);
      const a =
        Math.sin(Δφ / 2) ** 2 +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
      const d = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // meters
      return { s, d };
    });
  }, [shops, geo]);

  const nearby = useMemo(
    () => withDistance.sort((a, b) => a.d - b.d).map((x) => x.s),
    [withDistance]
  );

  const selectedShop = useMemo(
    () => nearby.find((x) => x.id === selectedId) || null,
    [nearby, selectedId]
  );

  return (
    <>
      {/* Nearby Shops (Carousel) */}
      <section className="mt-3">
        <div className="flex items-baseline justify-between px-2">
          <h2 className="text-lg font-bold">Nearby Shops</h2>
          {geo && (
            <p className="text-xs text-zinc-500">
              Location: {geo.lat.toFixed(3)}, {geo.lng.toFixed(3)}
            </p>
          )}
        </div>
        <div className="k-card p-3 mt-2">
          <Carousel autoplay={3000} slideClassName="min-w-[86%]">
            {nearby.slice(0, 12).map((s) => (
              <div key={s.id} className="h-full">
                <ShopCard shop={s} onClick={() => setSelectedId(s.id)} />
              </div>
            ))}
          </Carousel>
        </div>
      </section>

      {/* Map (MapLibre) */}
      <section className="mt-4">
        <div className="flex items-baseline justify-between px-2">
          <h2 className="text-lg font-bold">Search by Map</h2>
        </div>
        <div className="k-card p-1 mt-2">
          <MapView
            shops={nearby}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId(id)}
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

