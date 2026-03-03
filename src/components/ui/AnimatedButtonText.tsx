"use client";

import { useRef, useCallback, useMemo } from "react";
import gsap from "gsap";

function cellChar(char: string) {
  return char === " " ? "\u00A0" : char;
}

const STAGGER = 0.028;

type Props = {
  text: string;
  className?: string;
};

export default function AnimatedButtonText({ text, className = "" }: Props) {
  const chars = useMemo(() => text.split(""), [text]);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const animRef = useRef<gsap.core.Timeline | null>(null);

  const runAnimation = useCallback(() => {
    const letters = letterRefs.current.filter(Boolean) as HTMLSpanElement[];
    if (letters.length === 0) return;
    if (animRef.current?.isActive()) return;

    const tl = gsap
      .timeline()
      .to(letters, {
        opacity: 0,
        duration: 0.18,
        stagger: STAGGER,
        ease: "power2.in",
      })
      .to(letters, {
        opacity: 1,
        duration: 0.22,
        stagger: STAGGER,
        ease: "power2.out",
      });
    animRef.current = tl;
  }, []);

  return (
    <span
      className={`inline-flex flex-nowrap ${className}`}
      onMouseEnter={runAnimation}
    >
      {chars.map((char, i) => (
        <span
          key={`${i}-${char}`}
          className={`relative inline-block align-baseline overflow-hidden ${char === " " ? "char-space" : ""}`}
        >
          <span
            className="invisible select-none font-inherit"
            aria-hidden
          >
            {cellChar(char)}
          </span>
          <span
            ref={(el) => {
              letterRefs.current[i] = el;
            }}
            className="absolute left-0 top-0 overflow-hidden max-w-full"
          >
            {cellChar(char)}
          </span>
        </span>
      ))}
    </span>
  );
}
