// src/components/Carousel.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Props = {
  children: React.ReactNode | React.ReactNode[];
  /** 自動スライド間隔(ms)。0で停止。デフォ: 3000 */
  autoplay?: number;
  /** スライド1枚の最小幅（Tailwindクラス） */
  slideClassName?: string;
  /** 追加クラス */
  className?: string;
};

/** シンプル横スライダー（左右ボタン + 自動スライド + ホバー停止） */
export default function Carousel({
  children,
  autoplay = 3000,
  slideClassName = "min-w-[80%] md:min-w-[50%] lg:min-w-[33%]",
  className = "",
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
  const [slideSize, setSlideSize] = useState(0); // 1枚ぶん（幅＋gap）

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
    update();

    const ro = new ResizeObserver(update);
    if (firstSlideRef.current) ro.observe(firstSlideRef.current);
    if (trackRef.current) ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, []);

  // 変換適用
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transform = `translate3d(${-index * slideSize}px,0,0)`;
  }, [index, slideSize]);

  // 移動関数
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);

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

  // ホバー/タッチで一時停止
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

  return (
    <div className={`relative ${className}`}>
      {/* ビューポート */}
      <div ref={viewportRef} className="overflow-hidden">
        {/* トラック */}
        <div
          ref={trackRef}
          className="flex gap-4 transition-transform duration-500 ease-out will-change-transform"
          style={{ transform: "translate3d(0,0,0)" }}
        >
          {items.map((child, i) => (
            <div
              key={i}
              ref={i === 0 ? firstSlideRef : undefined}
              className={`${slideClassName} flex-shrink-0`}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* 左右ボタン */}
      <button
        aria-label="Previous"
        onClick={prev}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 shadow px-3 py-2 text-xl hover:bg-white"
      >
        ‹
      </button>
      <button
        aria-label="Next"
        onClick={next}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 shadow px-3 py-2 text-xl hover:bg-white"
      >
        ›
      </button>
    </div>
  );
}
