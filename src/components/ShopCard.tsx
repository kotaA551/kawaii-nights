"use client";
import type { Shop } from "@/lib/types";

export default function ShopCard({
  shop,
  onClick,
}: { shop: Shop; onClick?: () => void }) {
  return (
    <article
      className="k-card overflow-hidden active:scale-[0.99] transition"
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="h-36 w-full bg-gradient-to-tr from-pink-200 to-rose-200" />
      <div className="p-4 space-y-2">
        <h3 className="font-extrabold text-zinc-900 line-clamp-1">{shop.name}</h3>
        <p className="text-xs text-zinc-500 line-clamp-1">{shop.address}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          <span className={`pill chip-${shop.category}`}>{shop.category}</span>
          {shop.concept && <span className="pill">{shop.concept}</span>}
          {shop.priceRange && <span className="pill">{shop.priceRange}</span>}
        </div>
      </div>
    </article>
  );
}
