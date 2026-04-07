"use client";

import { ReactNode, useRef, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";

type TooltipProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

const FADE_MS = 220;
const BOUNCE_UP = 0.1;
const BOUNCE_DOWN = 0.14;
const STAGGER = 0.025;
const Y_OFF = -6;

export default function Tooltip({ label, children, className = "" }: TooltipProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const bounceTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const [mounted, setMounted] = useState(false);
  const [opacityVisible, setOpacityVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lines = label.length > 0 ? label.split("\n") : [];
  const chars = lines.flatMap((line) => line.split(""));
  const isMultiline = lines.length > 1;

  const linesWithStartIndex = lines.map((line, idx) => ({
    line,
    start: lines.slice(0, idx).reduce((sum, l) => sum + l.length, 0),
  }));

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8,
    });
  }, []);

  const handleEnter = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    showTimeoutRef.current = setTimeout(() => {
      showTimeoutRef.current = null;
      updatePosition();
      setMounted(true);
    }, 150);
  }, [updatePosition]);

  const handleLeave = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    bounceTimelineRef.current?.kill();
    bounceTimelineRef.current = null;
    setOpacityVisible(false);
    hideTimeoutRef.current = setTimeout(() => {
      hideTimeoutRef.current = null;
      setMounted(false);
    }, FADE_MS);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const t = requestAnimationFrame(() => {
      setOpacityVisible(true);
    });
    return () => cancelAnimationFrame(t);
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !opacityVisible || chars.length === 0) return;
    const letterRefsRef = letterRefs;
    let cancelled = false;
    let raf2 = 0;

    const runBounce = () => {
      const refs = letterRefsRef.current.filter(Boolean) as HTMLSpanElement[];
      if (refs.length !== chars.length || cancelled) return;

      bounceTimelineRef.current?.kill();
      gsap.set(refs, { y: 0 });

      const tl = gsap.timeline();
      refs.forEach((el, i) => {
        tl.to(el, { y: Y_OFF, duration: BOUNCE_UP, ease: "power2.out" }, i * STAGGER).to(
          el,
          { y: 0, duration: BOUNCE_DOWN, ease: "power2.in" },
          i * STAGGER + BOUNCE_UP,
        );
      });
      bounceTimelineRef.current = tl;
    };

    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(runBounce);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      bounceTimelineRef.current?.kill();
      const refsSnapshot = letterRefsRef.current.filter(Boolean) as HTMLSpanElement[];
      gsap.set(refsSnapshot, { clearProps: "y" });
    };
  }, [mounted, opacityVisible, label, chars.length]);

  useEffect(() => {
    if (!mounted) return;
    const onScrollOrResize = () => updatePosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [mounted, updatePosition]);

  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      bounceTimelineRef.current?.kill();
    };
  }, []);

  const tooltipEl = typeof document !== "undefined" && mounted && chars.length > 0 && (
    <span
      role="tooltip"
      className={`pointer-events-none fixed z-[9999] glass px-4 text-sm min-[1200px]:text-base font-semibold text-theme shadow-[0_8px_28px_rgba(47,52,64,0.14)] ${
        isMultiline ? "rounded-2xl py-2 leading-tight" : "rounded-full py-2.5"
      } ${opacityVisible ? "opacity-100" : "opacity-0"}`}
      style={{
        left: pos.x,
        top: pos.y,
        transform: "translate(-50%, 0)",
        transition: `opacity ${FADE_MS}ms ease-out`,
      }}
    >
      {linesWithStartIndex.map(({ line, start }, lineIdx) => (
        <span key={`${label}-line-${lineIdx}`} className="block text-center whitespace-nowrap">
          {line.split("").map((char, j) => {
            const i = start + j;
            return (
              <span
                key={`${label}-${lineIdx}-${i}`}
                ref={(el) => {
                  letterRefs.current[i] = el;
                }}
                className="footer-credit-char inline-block will-change-transform"
              >
                {char === " " ? "\u00A0" : char}
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );

  return (
    <>
      <span
        ref={triggerRef}
        className={`inline-flex ${className}`}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {children}
      </span>
      {typeof document !== "undefined" && createPortal(tooltipEl || null, document.body)}
    </>
  );
}
