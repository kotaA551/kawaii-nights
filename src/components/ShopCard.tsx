"use client";
import type { Shop } from "@/lib/types";

export default function ShopCard({ shop }: { shop: Shop }) {
  return (
    <article className="k-card overflow-hidden">
      <div className="h-36 w-full bg-gradient-to-tr from-pink-200 to-rose-200" />
      <div className="p-4 space-y-2">
        <h3 className="font-extrabold text-zinc-900">{shop.name}</h3>
        <p className="text-xs text-zinc-500">{shop.address}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="pill chip-{shop.category}">{shop.category}</span>
          {shop.concept && <span className="pill">{shop.concept}</span>}
          {shop.priceRange && <span className="pill">{shop.priceRange}</span>}
        </div>
      </div>
    </article>
  );
}
