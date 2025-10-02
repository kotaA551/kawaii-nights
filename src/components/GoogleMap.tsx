// src/components/GoogleMap.tsx
"use client";

/// <reference types="google.maps" />
import { useEffect, useMemo, useRef } from "react";
import type { Shop } from "@/lib/types";
import { Loader } from "@googlemaps/js-api-loader";

type Props = {
  shops: Shop[];
  activeId: string | null;
  onSelect: (id: string) => void;
  className?: string;
  height?: number;
  userLocation?: { lat: number; lng: number } | null;
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

  // 店舗マーカー
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  // 現在地マーカー（Marker または AdvancedMarkerElement）
  const userMarkerRef = useRef<
    google.maps.Marker | google.maps.marker.AdvancedMarkerElement | null
  >(null);

  const loader = useMemo(
    () =>
      new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        version: "weekly",
        libraries: ["marker"], // AdvancedMarker 用
      }),
    []
  );

  // 初期化
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!divRef.current || mapRef.current) return;
      await loader.load();
      if (cancelled) return;

      const map = new google.maps.Map(divRef.current, {
        center: { lat: 35.681236, lng: 139.767125 },
        zoom: 12,
        disableDefaultUI: true,
        zoomControl: true,
        mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID,
      });
      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
    };
  }, [loader]);

  // 店舗マーカー追加/更新/削除 + フィット
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.google) return;

    const ids = new Set(shops.map((s) => s.id));

    for (const [id, m] of markersRef.current.entries()) {
      if (!ids.has(id)) {
        m.setMap(null);
        markersRef.current.delete(id);
      }
    }

    shops.forEach((s) => {
      if (!markersRef.current.has(s.id)) {
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

    if (shops.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      shops.forEach((s) => bounds.extend({ lat: s.lat, lng: s.lng }));
      map.fitBounds(bounds, 60);
    }
  }, [shops, onSelect]);

  // 現在地マーカー（ふわふわアニメの青点）
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.google || !userLocation) return;

    const pos = new google.maps.LatLng(userLocation.lat, userLocation.lng);

    // 既存の現在地マーカーを除去（型で分岐）
    if (userMarkerRef.current) {
      if (userMarkerRef.current instanceof google.maps.Marker) {
        userMarkerRef.current.setMap(null);
      } else {
        // AdvancedMarkerElement
        userMarkerRef.current.map = null;
      }
      userMarkerRef.current = null;
    }

    // AdvancedMarker 用の HTML
    const el = document.createElement("div");
    el.className = "km-user-dot";

    const advMarker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: pos,
      content: el,
      collisionBehavior:
        google.maps.CollisionBehavior.OPTIONAL_AND_HIDES_LOWER_PRIORITY,
      title: "Your location",
    });

    userMarkerRef.current = advMarker;

    // 位置更新（依存: userLocation）
    advMarker.position = pos;

    return () => {
      advMarker.map = null;
    };
  }, [userLocation]);

  // スライド連動フォーカス
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeId) return;

    const m = markersRef.current.get(activeId);
    if (!m) return;

    const pos = m.getPosition();
    if (!pos) return;

    map.panTo(pos);
    if ((map.getZoom() ?? 0) < 15) map.setZoom(15);

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
