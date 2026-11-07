"use client";

import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "./ui";

const COLORS = ["#A8B5A0", "#75856B", "#D8B9B2", "#E9DCC4", "#C9A199"];

/** Soft falling-petal confetti drawn on a canvas, plus a calm message card. */
export function Celebration() {
  const { celebration, dismissCelebration } = useStore();
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!celebration) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const c = canvas.current;
    const timer = window.setTimeout(dismissCelebration, 6000);
    if (!c || reduce) return () => window.clearTimeout(timer);
    const ctx = c.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const W = window.innerWidth;
    const H = window.innerHeight;
    c.width = W * dpr;
    c.height = H * dpr;
    ctx.scale(dpr, dpr);
    const pieces = Array.from({ length: 90 }, () => ({
      x: Math.random() * W,
      y: -20 - Math.random() * H * 0.5,
      r: 4 + Math.random() * 5,
      vy: 1.2 + Math.random() * 1.8,
      vx: -0.6 + Math.random() * 1.2,
      rot: Math.random() * Math.PI,
      vr: -0.05 + Math.random() * 0.1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
    let raf = 0;
    const start = performance.now();
    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      const fade = Math.max(0, 1 - (t - start - 3500) / 1500);
      for (const p of pieces) {
        p.y += p.vy;
        p.x += p.vx + Math.sin((t / 600) + p.r) * 0.4;
        p.rot += p.vr;
        ctx.save();
        ctx.globalAlpha = fade * 0.9;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      if (fade > 0) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [celebration, dismissCelebration]);

  if (!celebration) return null;
  return (
    <div className="no-print pointer-events-none fixed inset-0 z-[60]">
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-auto absolute inset-x-4 bottom-24 mx-auto max-w-md lg:bottom-10">
        <div className="card fade-in flex items-center gap-4 p-5" role="status">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-soft text-rose-ink">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="font-serif text-lg leading-tight">Beautifully done.</p>
            <p className="text-sm text-muted">{celebration}</p>
          </div>
          <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={dismissCelebration}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
