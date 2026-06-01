"use client";

import { useEffect, useState } from "react";

// Dependency-free confetti burst. Renders fixed-position pieces that fall & fade.
const COLORS = ["#a78bfa", "#60a5fa", "#34d399", "#fbbf24", "#f472b6"];

export function Confetti({ fire }: { fire: boolean }) {
  const [pieces, setPieces] = useState<
    { id: number; left: number; delay: number; color: string; rot: number; dur: number }[]
  >([]);

  useEffect(() => {
    if (!fire) return;
    const next = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.3,
      color: COLORS[i % COLORS.length],
      rot: Math.random() * 360,
      dur: 1.6 + Math.random() * 1.4,
    }));
    setPieces(next);
    const t = setTimeout(() => setPieces([]), 3500);
    return () => clearTimeout(t);
  }, [fire]);

  if (!pieces.length) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      <style>{`@keyframes confetti-fall {
        0% { transform: translateY(-12vh) rotate(0deg); opacity: 1; }
        100% { transform: translateY(105vh) rotate(720deg); opacity: 0.9; }
      }`}</style>
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: 0,
            width: 9,
            height: 14,
            background: p.color,
            borderRadius: 2,
            transform: `rotate(${p.rot}deg)`,
            animation: `confetti-fall ${p.dur}s cubic-bezier(.3,.6,.5,1) ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}
