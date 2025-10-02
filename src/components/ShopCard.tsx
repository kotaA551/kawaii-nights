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
      className="k-card overflow-hidden active:scale-[0.99] transition"
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* カバー画像（なければグラデ） */}
      {cover ? (
        <div className="relative w-full aspect-[16/9]">
          <Image
            src={cover}
            alt={shop.name}
            fill              // ← 親要素に絶対配置して全体を覆う
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw" // 適当でOK。レスポンシブ時の最適化
            priority={false}
          />
        </div>
      ) : (
        <div className="w-full aspect-[16/9] bg-gradient-to-tr from-pink-200 to-rose-200" />
      )}

      {/* 本文 */}
      <div className="p-4 space-y-2">
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
