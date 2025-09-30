// src/components/Carousel.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Props = {
  children: React.ReactNode | React.ReactNode[];
  autoplay?: number;           // ms, 0で停止
  slideClassName?: string;     // 1枚の最小幅
  className?: string;
  onIndexChange?: (index: number) => void;
};

export default function Carousel({
  children,
  autoplay = 3000,
  slideClassName = "min-w-[80%] md:min-w-[50%] lg:min-w-[33%]",
  className = "",
  onIndexChange,
}: Props) {
  const items = useMemo(
    () => (Array.isArray(children) ? children : [children]).filter(Boolean) as React.ReactNode[],
    [children]
  );
  const count = items.length;

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const firstSlideRef = useRef<HTMLDivElement | null>(null);

  const [index, setIndex] = useState(0);
  const [slideSize, setSlideSize] = useState(0); // 幅 + gap

  // スライドサイズ計測（幅＋gap）
  useEffect(() => {
    const update = () => {
      const first = firstSlideRef.current;
      const track = trackRef.current;
      if (!first || !track) return;
      const w = first.getBoundingClientRect().width;
      const styles = getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || "0");
      setSlideSize(w + gap);
    };

    const ro = new ResizeObserver(update);
    if (firstSlideRef.current) ro.observe(firstSlideRef.current);
    if (trackRef.current) ro.observe(trackRef.current);
    // 初期フレームでも計測
    const raf = requestAnimationFrame(update);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [count]);

  // インデックス通知
  useEffect(() => {
    onIndexChange?.(index);
  }, [index, onIndexChange]);

  // ナビゲーション
  const next = useCallback(() => setIndex(i => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex(i => (i - 1 + count) % count), [count]);

  // 自動スライド
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  const start = useCallback(() => {
    if (autoplay > 0 && !timerRef.current) {
      timerRef.current = setInterval(next, autoplay);
    }
  }, [autoplay, next]);

  useEffect(() => {
    start();
    return stop;
  }, [start, stop]);

  // ホバー/タッチで停止・再開
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const onEnter = () => stop();
    const onLeave = () => start();
    vp.addEventListener("mouseenter", onEnter);
    vp.addEventListener("mouseleave", onLeave);
    vp.addEventListener("touchstart", onEnter, { passive: true });
    vp.addEventListener("touchend", onLeave, { passive: true });
    return () => {
      vp.removeEventListener("mouseenter", onEnter);
      vp.removeEventListener("mouseleave", onLeave);
      vp.removeEventListener("touchstart", onEnter);
      vp.removeEventListener("touchend", onLeave);
    };
  }, [start, stop]);

  if (count === 0) return null;

  // ★ transform を state から style プロップで渡す
  const offset = slideSize > 0 ? -index * slideSize : 0;

  return (
    <div className={`relative ${className}`}>
      {/* ビューポート */}
      <div ref={viewportRef} className="overflow-hidden">
        {/* トラック */}
        <div
          ref={trackRef}
          className="flex gap-4 transition-transform duration-500 ease-out will-change-transform"
          style={{ transform: `translate3d(${offset}px,0,0)` }}
        >
          {items.map((child, i) => (
            <div
              key={i}
              ref={i === 0 ? firstSlideRef : undefined}
              className={`flex-shrink-0 ${slideClassName}`}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* 矢印 */}
      <button
        aria-label="Previous"
        onClick={prev}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/80 shadow px-3 py-2 text-xl hover:bg-white"
      >
        ‹
      </button>
      <button
        aria-label="Next"
        onClick={next}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/80 shadow px-3 py-2 text-xl hover:bg-white"
      >
        ›
      </button>
    </div>
  );
}
