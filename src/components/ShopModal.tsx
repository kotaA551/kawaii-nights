"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Carousel from "@/components/Carousel";
import type { Shop } from "@/lib/types";
import { usePlacePhotos } from "@/lib/usePlacePhotos";

type PriceInfo = {
  currency: string;
  coverCharge?: string | number;
  avgSpendMin?: number;
  avgSpendMax?: number;
  notes?: string;
};

type ExtraShopFields = {
  ratingAvg?: number;   // 0–5
  ratingCount?: number; // 件数
  price?: PriceInfo;
};

export default function ShopModal({
  shop,
  onClose,
}: { shop: Shop & ExtraShopFields; onClose: () => void }) {
  const [active, setActive] = useState(0);

  const { photos } = usePlacePhotos(shop, { maxWidth: 1400, maxHeight: 900, maxCount: 8 });
  const googlePhotos = photos ?? [];
  const hasGoogle = googlePhotos.length > 0;

  // 背景スクロール固定
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => { html.style.overflow = prev; };
  }, []);

  // Escapeキーで閉じる
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white max-h-[85vh] overflow-y-auto animate-sheet-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* グリッパー */}
        <div className="flex justify-center pt-2">
          <div className="h-1.5 w-12 rounded-full bg-zinc-300" />
        </div>

        {/* ヘッダー */}
        <div className="px-4 pb-2 pt-3 flex items-center justify-between border-b border-zinc-200">
          <h2 className="font-bold text-lg line-clamp-1 pr-2">{shop.name}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-zinc-100"
            aria-label="閉じる"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 写真ギャラリー */}
        {(hasGoogle || (shop.images && shop.images.length > 0)) && (
          <div className="px-4 pt-3 pb-1 relative">
            <Carousel
              autoplay={0}
              slideClassName="min-w-full"
              className="rounded-xl overflow-hidden"
              onIndexChange={setActive}
            >
              {hasGoogle
                ? googlePhotos.map((p, i) => (
                    <img
                      key={`g-${i}`}
                      src={p.url}
                      alt={`${shop.name} photo ${i + 1}`}
                      loading="lazy"
                      className="w-full h-64 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ))
                : (shop.images ?? []).map((src, i) => (
                    <img
                      key={`local-${i}`}
                      src={src}
                      alt={`${shop.name} 写真${i + 1}`}
                      loading="lazy"
                      className="w-full h-64 object-cover"
                    />
                  ))}
            </Carousel>

            {/* ページインジケータ */}
            <div className="mt-2 flex justify-center gap-2">
              {(hasGoogle ? googlePhotos : shop.images ?? []).map((_, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full transition ${
                    active === i ? "bg-pink-600" : "bg-zinc-300"
                  }`}
                />
              ))}
            </div>

            {/* attribution（規約で必須） */}
            {hasGoogle && googlePhotos[active]?.attributionsHtml?.length > 0 && (
              <div className="mt-1 text-[10px] text-zinc-500 text-center space-x-2">
                {googlePhotos[active].attributionsHtml.map((html, idx) => (
                  <span key={idx} dangerouslySetInnerHTML={{ __html: html }} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 基本情報 */}
        <div className="px-4 pb-5">
          <p className="mt-2 text-sm text-zinc-600">Address: {shop.address}</p>
          {shop.concept && <p className="mt-1">{shop.concept}</p>}
          {shop.priceRange && <p className="mt-1">{shop.priceRange}</p>}
          {shop.hours && <p className="mt-1">{shop.hours}</p>}

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block text-center rounded-xl bg-pink-600 text-white py-3 font-semibold"
          >
            Open Google Map
          </a>

          {/* Rating & Price */}
          <div className="mt-3 space-y-1 text-sm">
            {typeof shop.ratingAvg === "number" && (
              <p aria-label="Rating">
                {"★".repeat(Math.round(shop.ratingAvg))}
                <span className="text-zinc-500">
                  {" "}
                  ({shop.ratingAvg} / 5
                  {typeof shop.ratingCount === "number"
                    ? ` · ${shop.ratingCount} reviews`
                    : ""}
                  )
                </span>
              </p>
            )}
            {shop.price && (
              <p aria-label="Price range">
                {shop.price.currency}
                {shop.price.coverCharge ? ` · Cover ${shop.price.coverCharge}` : ""}
                {(shop.price.avgSpendMin ?? shop.price.avgSpendMax) !== undefined &&
                  ` · Avg ${shop.price.avgSpendMin ?? "?"}–${shop.price.avgSpendMax ?? "?"}`}
                {shop.price.notes ? ` · ${shop.price.notes}` : ""}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
