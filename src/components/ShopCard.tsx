"use client";
import type { Shop } from "@/lib/types";
import { usePlacePhotos } from "@/lib/usePlacePhotos";

export default function ShopCard({
  shop,
  onClick,
}: { shop: Shop; onClick?: () => void }) {
  const { photos } = usePlacePhotos(shop, { maxWidth: 1200, maxHeight: 675, maxCount: 1 });
  const googleCover = photos && photos[0]?.url;
  const cover = googleCover ?? shop.images?.[0] ?? "";

  return (
    <article
      className="k-card overflow-hidden active:scale-[0.99] transition"
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* 16:9 固定・object-cover */}
      {cover ? (
        <div className="relative w-full aspect-[16/9]">
          <img
            src={cover}
            alt={shop.name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        <div className="w-full aspect-[16/9] bg-gradient-to-tr from-pink-200 to-rose-200" />
      )}

      <div className="p-4 space-y-2">
        <h3 className="font-extrabold text-zinc-900 line-clamp-1">{shop.name}</h3>
        <p className="text-xs text-zinc-500 line-clamp-1">{shop.address}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          {shop.concept && <span className="pill">{shop.concept}</span>}
          {shop.priceRange && <span className="pill">{shop.priceRange}</span>}
        </div>
      </div>
    </article>
  );
}
