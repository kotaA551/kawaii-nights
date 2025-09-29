"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-zinc-200">
      <div className="mx-auto max-w-screen-xl px-4 h-14 flex items-center">
        <Link
          href="/"
          className="font-black text-pink-600 tracking-wide text-lg"
        >
          Kawaii Nights
        </Link>
        <span className="ml-3 text-sm text-zinc-600">
          Discover Japan’s Cute Nightlife Cafés & Bars
        </span>
      </div>
    </header>
  );
}
