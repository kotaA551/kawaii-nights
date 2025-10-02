// src/app/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { Shop } from "@/lib/types";
import Carousel from "@/components/Carousel";
import ShopCard from "@/components/ShopCard";
import ShopModal from "@/components/ShopModal";
import GoogleMap from "@/components/GoogleMap";
import RegionTabs, { type RegionKey } from "@/components/RegionTabs";

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
  // スライドの現在インデックス（Nearby用）
  const [activeIndex, setActiveIndex] = useState(0);

  // ★ 地域タブの選択（デフォルトTokyo）
  const [region, setRegion] = useState<RegionKey>("tokyo");

  const [areaVisible, setAreaVisible] = useState(10);

  useEffect(() => {
  setAreaVisible(10);
}, [region]);

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

  // === 近い順（Nearby） ===
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

  // 地図フォーカス用ID（Nearbyのスライドに合わせる）
  const activeId = nearby[activeIndex]?.id ?? null;

  // モーダルに表示する店
  const selectedShop = useMemo(
    () => nearby.find((x) => x.id === selectedId) || null,
    [nearby, selectedId]
  );

  // === 地域別の絞り込み ===
  // Shop.area は 'tokyo' | 'osaka' | 'kyoto' | 'fukuoka' | 'nagoya' | 'sendai' | 'sapporo' を想定
  const regionalShops = useMemo(() => {
    // areaが小文字で入っている前提。もしDBが大文字混在なら .toLowerCase() で吸収する
    return shops.filter((s) => (s.area?.toLowerCase?.() ?? "") === region);
  }, [shops, region]);

  return (
    <>
      {/* === 地域タブ & 地域別グリッド === */}
      <section className="mt-3">
        <RegionTabs value={region} onChange={setRegion} />

        <div className="mt-2">
          {regionalShops.length > 0 ? (
            <>
              {/* グリッド：スマホ2列 / PC4列 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {regionalShops.slice(0, areaVisible).map((s) => (
                  <ShopCard key={s.id} shop={s} onClick={() => setSelectedId(s.id)} />
                ))}
              </div>

              {/* Show more（10件ずつ追加） */}
              {areaVisible < regionalShops.length && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setAreaVisible(v => v + 10)}
                    className="px-4 py-2 rounded-xl bg-white border border-zinc-200 text-pink-600 font-semibold hover:bg-pink-50 active:scale-[0.98]"
                  >
                    Show more
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="k-card p-6 text-center text-sm text-zinc-500">
              No shops found in {region.charAt(0).toUpperCase() + region.slice(1)} yet.
            </div>
          )}
        </div>
      </section>

      {/* === Nearby Shops === */}
      <section className="my-4">
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
            onIndexChange={(i) => setActiveIndex(i)}
          >
            {nearby.slice(0, 12).map((s) => (
              <div key={s.id} className="h-full">
                <ShopCard shop={s} onClick={() => setSelectedId(s.id)} />
              </div>
            ))}
          </Carousel>
        </div>
      </section>

      {/* === Map (Google Maps) === */}
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
