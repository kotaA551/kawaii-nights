"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [open, setOpen] = useState(false);

  // メニューオープン中は背面スクロールを止める
  useEffect(() => {
    if (open) {
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      <a href="#recommend" onClick={onClick} className="hover:text-pink-600">
        Recommended
      </a>
      <a href="#videos" onClick={onClick} className="hover:text-pink-600">
        Social Videos
      </a>
      <a href="#reviews" onClick={onClick} className="hover:text-pink-600">
        New Reviews
      </a>
      <a
        href="#post"
        onClick={onClick}
        className="rounded-full px-3 py-1 bg-pink-600 text-white font-semibold hover:opacity-90"
      >
        List Your Venue
      </a>
    </>
  );

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-zinc-200">
      <div className="mx-auto max-w-screen-xl px-4 h-14 flex items-center gap-3">
        <Link href="/" className="font-black text-pink-600 tracking-wide">
          Kawaii Nights
        </Link>

        {/* デスクトップ用ナビ */}
        <nav className="ml-auto hidden md:flex items-center gap-4 text-sm">
          <NavLinks />
          <ThemeToggle />
        </nav>

        {/* モバイル：ハンバーガー */}
        <button
          className="ml-auto md:hidden p-2 rounded-md hover:bg-white/70"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* モバイル：右スライドのドロワー */}
      {/* 背景オーバーレイ */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-200 ${
          open ? "bg-black/40 opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={close}
        aria-hidden={!open}
      />

      {/* パネル本体 */}
      <aside
        className={`fixed right-0 top-0 z-50 h-dvh w-80 max-w-[85vw] bg-white shadow-xl
        transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
      >
        <div className="h-14 px-4 flex items-center justify-between border-b border-zinc-200">
          <span className="font-bold">Menu</span>
          <button
            className="p-2 rounded-md hover:bg-zinc-100"
            onClick={close}
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 flex flex-col gap-3 text-sm">
          <NavLinks onClick={close} />
          <div className="pt-4">
            <ThemeToggle />
          </div>
        </nav>
      </aside>
    </header>
  );
}
