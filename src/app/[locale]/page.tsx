// src/app/[locale]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { MapView } from "@/components/Map";
import ShopCard from "@/components/ShopCard";
import Carousel from "@/components/Carousel";
import type { Shop, Category } from "@/lib/types";
import type { Locale } from "@/i18n/messages";
import { messages } from "@/i18n/messages";

const CATS = ["concafe", "girlsbar", "hostclub"] as const;
const AREAS = ["all", "tokyo", "osaka", "kyoto", "fukuoka"] as const;

export default function LocalizedHome({
  params: { locale },
}: {
  params: { locale: Locale };
}) {
  const t = messages[locale];

  const [q, setQ] = useState("");
  const [cats, setCats] = useState<Category[]>(["concafe", "girlsbar", "hostclub"]);
  const [area, setArea] = useState<(typeof AREAS)[number]>("all");
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/venues", { cache: "no-store" });
      const json = (await res.json()) as Shop[];
      setShops(json);
    })();
  }, []);

  // 検索・カテゴリ・エリアでフィルタ
  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return shops.filter((s) => {
      const byCat = cats.includes(s.category as Category);
      const byArea = area === "all" || s.area === area;
      const byText =
        !kw ||
        (s.name ?? "").toLowerCase().includes(kw) ||
        (s.concept ?? "").toLowerCase().includes(kw) ||
        (s.address ?? "").toLowerCase().includes(kw);
      return byCat && byArea && byText;
    });
  }, [q, cats, area, shops]);

  // ラベル関数
  const labelCat = (c: Category) => t.categories[c];
  const labelArea = (a: (typeof AREAS)[number]) =>
    a === "all" ? t.areas.all : t.areas[a];

  return (
    <>
      {/* Hero */}
      <section className="section k-card mt-6 p-6 md:p-10 bg-gradient-to-r from-pink-100 via-rose-100 to-fuchsia-100 border-none">
        <p className="text-xs font-semibold text-pink-600">{t.brand}</p>
        <h1 className="mt-2 text-3xl md:text-4xl">{t.heroTitle}</h1>
        <p className="mt-3 text-zinc-600">{t.heroSub}</p>

        {/* 検索＆フィルタ */}
        <div className="mt-6 grid gap-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full rounded-xl border border-pink-200 bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-pink-300"
          />
          <div className="flex gap-2 overflow-x-auto">
            {CATS.map((c) => {
              const active = cats.includes(c as Category);
              return (
                <button
                  key={c}
                  onClick={() =>
                    setCats((prev) =>
                      prev.includes(c as Category)
                        ? prev.filter((p) => p !== c)
                        : [...prev, c as Category]
                    )
                  }
                  className={`pill ${active ? "pill-active" : ""}`}
                >
                  {labelCat(c as Category)}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {AREAS.map((a) => (
              <button
                key={a}
                onClick={() => setArea(a)}
                className={`pill ${area === a ? "pill-active" : ""}`}
              >
                {labelArea(a)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="section">
        <h2 className="mb-4 text-xl">{t.map}</h2>
        <div className="k-card p-2">
          <MapView
            shops={filtered}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId(id)}
          />
        </div>
      </section>

      {/* Recommended */}
      <section id="recommend" className="section">
        <h2 className="mb-4 text-xl">{t.recommended}</h2>
        <Carousel
          autoplay={3000}
          slideClassName="min-w-[80%] md:min-w-[50%] lg:min-w-[33%]"
          className="k-card p-4"
        >
          {shops.slice(0, 12).map((s) => (
            <div key={s.id} className="h-full">
              <ShopCard shop={s} />
            </div>
          ))}
        </Carousel>
      </section>

      {/* Results list */}
      <section className="section">
        <h2 className="mb-4 text-xl">{t.results}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <ShopCard key={s.id} shop={s} />
          ))}
          {filtered.length === 0 && (
            <div className="k-card p-6 text-center text-zinc-500">
              {t.empty}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
