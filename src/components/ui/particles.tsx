"use client";

import React, { useCallback, useEffect, useRef } from "react";

function cn(...inputs: (string | undefined | false | null)[]): string {
  return inputs.filter(Boolean).join(" ");
}

interface ParticlesProps {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  size?: number;
  refresh?: boolean;
  color?: string;
  vx?: number;
  vy?: number;
  opacity?: number;
}

type Particle = {
  x: number;
  y: number;
  translateX: number;
  translateY: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  dx: number;
  dy: number;
  magnetism: number;
};

const BOOK_CACHE_SIZE = 48;

function createBookCache(img: HTMLImageElement): HTMLCanvasElement | null {
  const canvas = typeof document !== "undefined" ? document.createElement("canvas") : null;
  if (!canvas) return null;
  canvas.width = BOOK_CACHE_SIZE;
  canvas.height = BOOK_CACHE_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const cx = BOOK_CACHE_SIZE / 2;
  const cy = BOOK_CACHE_SIZE / 2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((30 * Math.PI) / 180);
  ctx.translate(-cx, -cy);
  ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, BOOK_CACHE_SIZE, BOOK_CACHE_SIZE);
  ctx.restore();
  return canvas;
}

function drawBook(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  cache: HTMLCanvasElement | null,
  alpha: number,
) {
  if (!cache) return;
  const w = size;
  const h = size;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(cache, 0, 0, BOOK_CACHE_SIZE, BOOK_CACHE_SIZE, cx - w / 2, cy - h / 2, w, h);
  ctx.restore();
}

const Particles: React.FC<ParticlesProps> = ({
  className = "",
  quantity = 80,
  staticity = 50,
  ease = 50,
  size = 0.4,
  refresh = false,
  color = "#C9B7AE",
  vx = 0,
  vy = 0,
  opacity = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const particles = useRef<Particle[]>([]);
  const bookCache = useRef<HTMLCanvasElement | null>(null);
  const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const animateRef = useRef<() => void>(() => {});
  // DPR=1 для частиц — Retina не нужна, экономит в 4× площадь canvas
  const dpr = 1;
  const rafId = useRef<number | null>(null);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const img = new Image();
    img.src = "/book_vers.2.svg";
    img.onload = () => {
      bookCache.current = createBookCache(img);
    };
    return () => {
      bookCache.current = null;
    };
  }, []);

  const resizeCanvas = useCallback(() => {
    if (canvasContainerRef.current && canvasRef.current && context.current) {
      particles.current.length = 0;
      canvasSize.current.w = canvasContainerRef.current.offsetWidth;
      canvasSize.current.h = canvasContainerRef.current.offsetHeight;
      canvasRef.current.width = canvasSize.current.w * dpr;
      canvasRef.current.height = canvasSize.current.h * dpr;
      canvasRef.current.style.width = `${canvasSize.current.w}px`;
      canvasRef.current.style.height = `${canvasSize.current.h}px`;
      context.current.scale(dpr, dpr);
    }
  }, [dpr]);

  const particleParams = useCallback((): Particle => {
    const x = Math.floor(Math.random() * canvasSize.current.w);
    const y = Math.floor(Math.random() * canvasSize.current.h);
    const pSize = Math.random() * 12 + size;
    const alpha = 0;
    const targetAlpha = parseFloat((Math.random() * 0.4 + 0.15).toFixed(1));
    const dx = (Math.random() - 0.5) * 0.15;
    const dy = (Math.random() - 0.5) * 0.15;
    const magnetism = 0.1 + Math.random() * 4;
    return {
      x,
      y,
      translateX: 0,
      translateY: 0,
      size: pSize,
      alpha,
      targetAlpha,
      dx,
      dy,
      magnetism,
    };
  }, [size]);

  const drawParticleEl = useCallback((p: Particle, update = false) => {
    if (context.current) {
      const { x, y, translateX, translateY, size: s, alpha } = p;
      context.current.save();
      context.current.translate(translateX, translateY);
      const bookSize = Math.max(s, 16);
      drawBook(context.current, x, y, bookSize, bookCache.current, alpha * opacity);
      context.current.restore();
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!update) {
        particles.current.push(p);
      }
    }
  }, [opacity, dpr]);

  const clearContext = useCallback(() => {
    if (context.current) {
      context.current.clearRect(
        0,
        0,
        canvasSize.current.w,
        canvasSize.current.h,
      );
    }
  }, []);

  const drawParticles = useCallback(() => {
    clearContext();
    for (let i = 0; i < quantity; i++) {
      const p = particleParams();
      drawParticleEl(p);
    }
  }, [quantity, particleParams, drawParticleEl, clearContext]);

  const initCanvas = useCallback(() => {
    resizeCanvas();
    drawParticles();
  }, [resizeCanvas, drawParticles]);

  const remapValue = useCallback(
    (
      value: number,
      start1: number,
      end1: number,
      start2: number,
      end2: number,
    ): number => {
      const remapped =
        ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
      return remapped > 0 ? remapped : 0;
    },
    [],
  );

  const animate = useCallback(() => {
    clearContext();
    particles.current.forEach((p: Particle, i: number) => {
      const bounds = p.size * 1.5;
      const edge = [
        p.x + p.translateX - bounds,
        canvasSize.current.w - p.x - p.translateX - bounds,
        p.y + p.translateY - bounds,
        canvasSize.current.h - p.y - p.translateY - bounds,
      ];
      const closestEdge = edge.reduce((a, b) => Math.min(a, b));
      const remapClosestEdge = parseFloat(
        remapValue(closestEdge, 0, 40, 0, 1).toFixed(2),
      );
      if (remapClosestEdge > 1) {
        p.alpha += 0.02;
        if (p.alpha > p.targetAlpha) {
          p.alpha = p.targetAlpha;
        }
      } else {
        p.alpha = p.targetAlpha * remapClosestEdge;
      }
      p.x += p.dx + vx;
      p.y += p.dy + vy;
      p.translateX +=
        (mouse.current.x / (staticity / p.magnetism) - p.translateX) / ease;
      p.translateY +=
        (mouse.current.y / (staticity / p.magnetism) - p.translateY) / ease;

      drawParticleEl(p, true);

      if (
        p.x < -bounds ||
        p.x > canvasSize.current.w + bounds ||
        p.y < -bounds ||
        p.y > canvasSize.current.h + bounds
      ) {
        particles.current.splice(i, 1);
        const newP = particleParams();
        drawParticleEl(newP);
      }
    });
  }, [vx, vy, staticity, ease, clearContext, remapValue, drawParticleEl, particleParams]);

  useEffect(() => {
    animateRef.current = animate;
  }, [animate]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const { w, h } = canvasSize.current;
        const x = event.clientX - rect.left - w / 2;
        const y = event.clientY - rect.top - h / 2;
        const inside = x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2;
        if (inside) {
          mouse.current.x = x;
          mouse.current.y = y;
        }
      }
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext("2d");
    }
    initCanvas();

    const loop = () => {
      if (isVisibleRef.current) {
        animateRef.current?.();
      }
      rafId.current = window.requestAnimationFrame(loop);
    };
    rafId.current = window.requestAnimationFrame(loop);

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(initCanvas, 200);
    };
    window.addEventListener("resize", handleResize);

    const handleVisibility = () => {
      isVisibleRef.current = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (rafId.current != null) window.cancelAnimationFrame(rafId.current);
    };
  }, [color, initCanvas, animate]);

  useEffect(() => {
    initCanvas();
  }, [refresh, initCanvas]);

  return (
    <div
      className={cn("pointer-events-none", className)}
      ref={canvasContainerRef}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
};

export { Particles };
