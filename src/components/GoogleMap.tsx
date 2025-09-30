// src/components/GoogleMap.tsx
"use client";

/// <reference types="google.maps" />
import { useEffect, useMemo, useRef } from "react";
import type { Shop } from "@/lib/types";
import { Loader } from "@googlemaps/js-api-loader";

type Props = {
  shops: Shop[];
  activeId: string | null;                   // スライドの現在表示ID
  onSelect: (id: string) => void;            // 地図側でピンをタップした時
  className?: string;
  height?: number;                           // px
  userLocation?: { lat: number; lng: number } | null; // 現在地
};

export default function GoogleMap({
  shops,
  activeId,
  onSelect,
  className = "",
  height = 420,
  userLocation = null,
}: Props) {
  const divRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  // お店マーカー（赤ピン）を管理
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  // 現在地マーカー（青丸）
  const userMarkerRef = useRef<google.maps.Marker | null>(null);

  const loader = useMemo(
    () =>
      new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        version: "weekly",
      }),
    []
  );

  // ── 初期化 ───────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!divRef.current || mapRef.current) return;
      await loader.load();
      if (cancelled) return;

      const map = new google.maps.Map(divRef.current, {
        center: { lat: 35.681236, lng: 139.767125 }, // 東京駅
        zoom: 12,
        disableDefaultUI: true,
        zoomControl: true,
        mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID, // あれば使う（無くてもOK）
      });
      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
    };
  }, [loader]);

  // ── 店舗マーカーの追加/更新/削除 + 全体フィット ─────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.google) return;

    const ids = new Set(shops.map((s) => s.id));

    // 不要マーカー削除
    for (const [id, m] of markersRef.current.entries()) {
      if (!ids.has(id)) {
        m.setMap(null);
        markersRef.current.delete(id);
      }
    }

    // 追加/更新
    shops.forEach((s) => {
      if (!markersRef.current.has(s.id)) {
        // ● 標準の赤ピン（アイコン未指定のデフォルト）
        const marker = new google.maps.Marker({
          position: { lat: s.lat, lng: s.lng },
          map,
          title: s.name,
        });
        marker.addListener("click", () => onSelect(s.id));
        markersRef.current.set(s.id, marker);
      } else {
        const m = markersRef.current.get(s.id)!;
        m.setPosition({ lat: s.lat, lng: s.lng });
      }
    });

    // 軽く全体フィット（店舗がある場合のみ）
    if (shops.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      shops.forEach((s) => bounds.extend({ lat: s.lat, lng: s.lng }));
      map.fitBounds(bounds, 60);
    }
  }, [shops, onSelect]);

  // ── 現在地マーカー（青丸） ─────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.google || !userLocation) return;

    const pos = new google.maps.LatLng(userLocation.lat, userLocation.lng);

    if (!userMarkerRef.current) {
      userMarkerRef.current = new google.maps.Marker({
        position: pos,
        map,
        // 青丸のシンボル
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#4285F4",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
        title: "Your location",
      });
    } else {
      userMarkerRef.current.setPosition(pos);
    }
  }, [userLocation]);

  // ── アクティブ店にフォーカス（スライド連動） ───────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeId) return;

    const m = markersRef.current.get(activeId);
    if (!m) return;

    const pos = m.getPosition();
    if (!pos) return;

    map.panTo(pos);
    if ((map.getZoom() ?? 0) < 15) map.setZoom(15);


    // 目立つように軽くバウンス
    m.setAnimation(google.maps.Animation.BOUNCE);
    const t = setTimeout(() => m.setAnimation(null), 650);
    return () => clearTimeout(t);
  }, [activeId]);

  return (
    <div
      ref={divRef}
      className={`w-full rounded-2xl overflow-hidden ${className}`}
      style={{ height }}
    />
  );
}
