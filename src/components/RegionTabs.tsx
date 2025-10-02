// src/components/RegionTabs.tsx
"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react"; 

export type RegionKey =
  | "tokyo"
  | "osaka"
  | "kyoto"
  | "fukuoka"
  | "nagoya"
  | "sendai"
  | "sapporo";

const LABELS: Record<RegionKey, string> = {
  tokyo: "Tokyo",
  osaka: "Osaka",
  kyoto: "Kyoto",
  fukuoka: "Fukuoka",
  nagoya: "Nagoya",
  sendai: "Sendai",
  sapporo: "Sapporo",
};

export default function RegionTabs({
  value,
  onChange,
  className = "",
}: {
  value: RegionKey;
  onChange: (r: RegionKey) => void;
  className?: string;
}) {
  // モバイル用：他地域を出すバーの表示状態
  const [openMobileBar, setOpenMobileBar] = useState(false);

  const regions: RegionKey[] = [
    "tokyo",
    "osaka",
    "kyoto",
    "fukuoka",
    "nagoya",
    "sendai",
    "sapporo",
  ];

  const handlePick = (r: RegionKey) => {
    onChange(r);
    setOpenMobileBar(false);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* タイトル行 */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-lg font-bold">Area</h2>

        {/* モバイル：右矢印（他地域バーの開閉） */}
        <button
          type="button"
          aria-label="Show other areas"
          className="md:hidden inline-flex items-center gap-1 border_b border-pink-600 px-3 py-1.5 bg-white active:scale-[0.98]"
          onClick={() => setOpenMobileBar((v) => !v)}
        >
          <span className="font-semibold">{LABELS[value]}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${openMobileBar ? "rotate-90" : ""}`} />
        </button>
      </div>

        {/* PC: 7つ横並び */}
        <div className="hidden md:flex gap-4 mt-2 px-2 border-b border-zinc-200 justify-center">
        {regions.map((r) => (
            <button
            key={r}
            onClick={() => handlePick(r)}
            className={`
                px-3 py-1.5 bg-white
                ${r === value
                ? "border-b-2 border-pink-600 text-pink-600 font-semibold"
                : "text-zinc-600 hover:text-pink-600"}
            `}
            >
            {LABELS[r]}
            </button>
        ))}
        </div>

      {/* モバイル：選択中のみ + 下矢印で下に他地域バー */}
      <div className="md:hidden mt-2 px-2 text-center border-b border-zinc-200 pb-2">
        {/* 選択中タブをあえてここでも表示しておく（視覚的安定） */}
        <div className="inline-flex">
          <span className="pill pill-active">{LABELS[value]}</span>
        </div>

        {/* 下に出るバー（他地域） */}
        {openMobileBar && (
          <div className="mt-2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {regions
                .filter((r) => r !== value)
                .map((r) => (
                  <button
                    key={r}
                    onClick={() => handlePick(r)}
                    className="pill"
                  >
                    {LABELS[r]}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
