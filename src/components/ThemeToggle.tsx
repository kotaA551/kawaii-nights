"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"pastel" | "neon">("pastel");

  // 初期化（localStorage 優先）
  useEffect(() => {
    const saved = (localStorage.getItem("kn-theme") as "pastel" | "neon") || "pastel";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggle = () => {
    const next = theme === "pastel" ? "neon" : "pastel";
    setTheme(next);
    localStorage.setItem("kn-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <button
      onClick={toggle}
      className="rounded-full px-3 py-1 text-sm font-semibold border border-black/10
                 bg-white/70 hover:bg-white/90"
      title="Toggle Neon mode"
    >
      {theme === "pastel" ? "Neon" : "Pastel"}
    </button>
  );
}
