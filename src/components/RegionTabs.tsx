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
      <div className="text-center px-2">
        {/* モバイル：下矢印で開閉（見出し） */}
        <button
          type="button"
          aria-label="Show other areas"
          className="md:hidden inline-flex items-center gap-1 px-3 py-1.5 border-b-2 border-pink-600 text-pink-600 font-semibold"
          onClick={() => setOpenMobileBar((v) => !v)}
        >
          <span className="font-semibold">{LABELS[value]}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              openMobileBar ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* PC: 7つ横並び（白背景タブ＋選択中のみピンク下線） */}
      <div className="hidden md:flex gap-4 mt-2 px-2 border-b border-zinc-200 justify-center">
        {regions.map((r) => (
          <button
            key={r}
            onClick={() => handlePick(r)}
            className={`px-3 py-1.5 bg-white ${
              r === value
                ? "border-b-2 border-pink-600 text-pink-600 font-semibold"
                : "text-zinc-600 hover:text-pink-600"
            }`}
          >
            {LABELS[r]}
          </button>
        ))}
      </div>

      {/* モバイル：候補は“選択できるタブのみ”を1列で並べる */}
      <div className="md:hidden mt-2 px-2">
        {openMobileBar && (
          <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
            <ul className="divide-y divide-zinc-200">
              {regions
                .filter((r) => r !== value) // ← 選択中は除外
                .map((r) => (
                  <li key={r}>
                    <button
                      onClick={() => handlePick(r)}
                      className="w-full text-left px-3 py-2 hover:bg-pink-50"
                    >
                      {LABELS[r]}
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
