"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 bg-gradient-to-b from-purple-900 via-purple-800 to-purple-500 text-pink-300 backdrop-blur border-b border-pink-500/30 shadow-md">
      <div className="mx-auto max-w-screen-xl px-4 h-14 flex items-center">
        <Link
          href="/"
          className="font-black tracking-wide text-lg text-pink-400 hover:text-pink-200 transition-colors"
        >
          Kawaii Nights
        </Link>
        <span className="ml-3 text-sm text-pink-200">
          Discover Japan’s Cute Nightlife Cafés & Bars
        </span>
      </div>
    </header>
  );
}
