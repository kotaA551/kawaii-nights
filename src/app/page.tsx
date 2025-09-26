"use client";

import { useEffect, useMemo, useState } from "react";
import type { Shop, Category } from "@/lib/types";
import shopsData from "@/data/shops.json";
import ShopCard from "@/components/ShopCard";

const CATS: Category[] = ["concafe", "girlsbar", "hostclub"];
const AREAS = ["all", "tokyo", "osaka", "kyoto", "fukuoka"] as const;

export default function HomePage() {
  const [q, setQ] = useState("");
  const [cats, setCats] = useState<Category[]>(["concafe", "girlsbar", "hostclub"]);
  const [area, setArea] = useState<(typeof AREAS)[number]>("all");

  const shops = shopsData as Shop[];

  const filtered = useMemo(() => {
    return shops.filter((s) => {
      const byCat = cats.includes(s.category);
      const byArea = area === "all" || s.area === area;
      const kw = q.trim().toLowerCase();
      const byText =
        !kw ||
        s.name.toLowerCase().includes(kw) ||
        s.concept?.toLowerCase().includes(kw) ||
        s.address.toLowerCase().includes(kw);
      return byCat && byArea && byText;
    });
  }, [q, cats, area, shops]);

  // ---- UI ----
  return (
    <>
      {/* Hero */}
      <section className="section k-card mt-6 p-6 md:p-10 bg-gradient-to-r from-pink-100 via-rose-100 to-fuchsia-100 border-none">
        <p className="text-xs font-semibold text-pink-600">Kawaii Nights</p>
        <h1 className="mt-2 text-3xl md:text-4xl">
          Discover Japan&apos;s Cute Nightlife
        </h1>
        <p className="mt-3 text-zinc-600">
          ConCafes • Girls Bars • Host Clubs — pastel, safe, transparent.
        </p>

        {/* Search + filters */}
        <div className="mt-6 grid gap-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search (name / concept)"
            className="w-full rounded-xl border border-pink-200 bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-pink-300"
          />

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto">
            {CATS.map((c) => {
              const active = cats.includes(c);
              return (
                <button
                  key={c}
                  onClick={() =>
                    setCats((prev) =>
                      prev.includes(c) ? prev.filter((p) => p !== c) : [...prev, c]
                    )
                  }
                  className={`pill ${active ? "pill-active" : ""}`}
                >
                  {labelCat(c)}
                </button>
              );
            })}
          </div>

          {/* Area tabs (scrollable like site) */}
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
      {/* Recommended slider */}
      <section id="recommend" className="section">
        <h2 className="mb-4 text-xl">Recommended</h2>
        <div className="k-card p-4 overflow-x-auto snap-row">
          <div className="flex gap-4">
            {shops.slice(0, 10).map((s) => (
              <div key={s.id} className="w-60 shrink-0 snap-item">
                <ShopCard shop={s} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search results */}
      <section className="section">
        <h2 className="mb-4 text-xl">Search Results</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <ShopCard key={s.id} shop={s} />
          ))}
          {filtered.length === 0 && (
            <div className="k-card p-6 text-center text-zinc-500">
              No venues match your search criteria
            </div>
          )}
        </div>
      </section>

      {/* Social videos (dummy UI) */}
      <section id="videos" className="section">
        <h2 className="mb-4 text-xl">Social Videos</h2>
        <div className="k-card p-4 overflow-x-auto snap-row">
          <div className="flex gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="snap-item w-44 shrink-0">
                <div className="aspect-[9/16] rounded-2xl bg-zinc-200" />
                <p className="mt-2 text-sm line-clamp-2">Cute intro video #{i + 1}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New reviews (dummy UI) */}
      <section id="reviews" className="section">
        <h2 className="mb-4 text-xl">New Reviews</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="k-card p-5">
              <div className="font-semibold text-pink-700">Nadeshiko (Shinjuku)</div>
              <div className="mt-2 text-sm text-zinc-600">
                Had such a fun time today! The interior was super cute and Insta-worthy ♡
              </div>
              <div className="mt-3">
                <button className="pill pill-active">Read More</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function labelCat(c: Category) {
  if (c === "concafe") return "ConCafe";
  if (c === "girlsbar") return "Girls Bar";
  return "Host Club";
}

function labelArea(a: (typeof AREAS)[number]) {
  return a === "all" ? "All Areas" : a[0].toUpperCase() + a.slice(1);
}
