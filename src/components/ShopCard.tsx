"use client";
import type { Shop } from "@/lib/types";
import Image from "next/image";

export default function ShopCard({
  shop,
  onClick,
}: { shop: Shop; onClick?: () => void }) {
  const cover = shop.images?.[0] ?? "";

  return (
    <article
      className="k-card h-full flex flex-col overflow-hidden active:scale-[0.99] transition"
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* 画像（常に16:9の枠にフィット、はみ出しはカット） */}
      {cover ? (
        <div className="relative w-full aspect-[16/9] flex-none">
          <Image
            src={cover}
            alt={shop.name}
            fill
            className="object-cover"
            sizes="100vw"
            priority={false}
          />
        </div>
      ) : (
        <div className="w-full aspect-[16/9] flex-none bg-gradient-to-tr from-pink-200 to-rose-200" />
      )}

      {/* テキスト（固定高さ） */}
      <div className="p-4 space-y-2 flex-none h-[104px]">
        <h3 className="font-extrabold text-zinc-900 line-clamp-1">
          {shop.name}
        </h3>
        <p className="text-xs text-zinc-500 line-clamp-1">{shop.address}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          {shop.concept && <span className="pill">{shop.concept}</span>}
          {shop.priceRange && <span className="pill">{shop.priceRange}</span>}
        </div>
      </div>
    </article>
  );
}
